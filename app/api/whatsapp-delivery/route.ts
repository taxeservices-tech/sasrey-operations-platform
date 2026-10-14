import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@netlify/database";
import { createHash, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

function validSecret(
  supplied: string | null,
  expected: string | undefined
): boolean {
  if (!supplied || !expected) return false;

  const suppliedHash = createHash("sha256").update(supplied).digest();
  const expectedHash = createHash("sha256").update(expected).digest();

  return timingSafeEqual(suppliedHash, expectedHash);
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.WHATSAPP_DELIVERY_SECRET;
  const suppliedSecret = request.headers.get("x-whatsapp-delivery-secret");

  if (!validSecret(suppliedSecret, expectedSecret)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, message: "Expected a JSON object" },
      { status: 400 }
    );
  }

  const event = body as Record<string, unknown>;
  const messageId =
    typeof event.message_id === "string" ? event.message_id : "";
  const recipientId =
    typeof event.recipient_id === "string" ? event.recipient_id : "";
  const deliveryStatus =
    typeof event.delivery_status === "string" ? event.delivery_status : "";
  const timestamp = String(event.timestamp ?? "");

  if (!messageId || !recipientId || !deliveryStatus || !timestamp) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Required fields: message_id, recipient_id, delivery_status, timestamp",
      },
      { status: 400 }
    );
  }

  if (!/^\d+$/.test(timestamp)) {
    return NextResponse.json(
      { success: false, message: "Timestamp must be numeric" },
      { status: 400 }
    );
  }

  const errors = Array.isArray(event.errors) ? event.errors : [];
  const eventKey = createHash("sha256")
    .update(
      JSON.stringify([
        messageId,
        recipientId,
        deliveryStatus,
        timestamp,
        errors,
      ])
    )
    .digest("hex");

  try {
    const db = getDatabase();

    const result = await db.sql`
      INSERT INTO whatsapp_delivery_status (
        message_id,
        recipient_id,
        delivery_status,
        event_timestamp,
        errors,
        received_at,
        raw_event,
        event_key
      )
      VALUES (
        ${messageId},
        ${recipientId},
        ${deliveryStatus},
        ${timestamp},
        ${JSON.stringify(errors)}::jsonb,
        NOW(),
        ${JSON.stringify(event)}::jsonb,
        ${eventKey}
      )
      ON CONFLICT (event_key) DO NOTHING
      RETURNING event_key
    `;

    return NextResponse.json({
      success: true,
      duplicate: result.length === 0,
      message: result.length === 0 ? "Event already recorded" : "Event recorded",
    });
  } catch (error) {
    console.error(
      "WhatsApp delivery event could not be stored:",
      error instanceof Error ? error.message : "Unknown database error"
    );

    return NextResponse.json(
      { success: false, message: "Could not store delivery event" },
      { status: 500 }
    );
  }
}