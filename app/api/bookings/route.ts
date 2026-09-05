import crypto from "crypto";
import db from "@/app/lib/auth/db";
import { createPaymentAuthorizationToken } from "@/app/lib/auth/paymentAuthorization";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth/authorization";

interface AppsScriptResponse {
  success?: boolean;
  message?: string;
  error?: string;
  bookingReference?: string;
  action?: string;
  status?: string;
  bookings?: unknown[];
  paymentAuthorizationToken?: string;
}

export async function POST(request: NextRequest) {
  let paymentAuthorizationHash: string | null = null;
  let paymentAuthorizationBookingReference: string | null = null;
  let paymentAuthorizationProcessingAt: string | null = null;

  try {
    const appsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL;

    console.log(
      "Apps Script URL (raw):",
      JSON.stringify(appsScriptUrl)
    );

    const booking = await request.json();

    const action = String(
      booking?.action ?? ""
    ).trim();

    if (action === "updateStatus") {
      const authorization =
        await requireRole([
          "ADMIN",
          "MANAGER",
          "SALES",
          "DISPATCHER",
        ]);

      if (!authorization.authorized) {
        return authorization.response;
      }
    }
    if (action === "recordPayment") {
      const bookingReference = String(
        booking?.bookingReference ?? ""
      ).trim();

      const paymentAuthorizationToken =
        String(
          booking?.paymentAuthorizationToken ?? ""
        ).trim();

      if (!bookingReference || !paymentAuthorizationToken) {
        return NextResponse.json(
          {
            success: false,
            message: "Payment authorization is required.",
          },
          { status: 401 }
        );
      }

      const tokenHash = crypto
        .createHash("sha256")
        .update(paymentAuthorizationToken)
        .digest("hex");

      const now = new Date();
      const nowIso = now.toISOString();

      const authorization = db.prepare(`
        SELECT
          booking_reference,
          expires_at,
          used_at,
          processing_at
        FROM payment_authorizations
        WHERE token_hash = ?
          AND booking_reference = ?
        LIMIT 1
      `).get(
        tokenHash,
        bookingReference
      ) as
        | {
          booking_reference: string;
          expires_at: string;
          used_at: string | null;
          processing_at: string | null;
        }
        | undefined;

      if (!authorization) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment authorization.",
          },
          { status: 401 }
        );
      }

      if (authorization.used_at) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This payment authorization has already been used.",
          },
          { status: 409 }
        );
      }

      if (
        new Date(authorization.expires_at).getTime() <=
        now.getTime()
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "This payment authorization has expired.",
          },
          { status: 401 }
        );
      }

      if (authorization.processing_at) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This payment is already being processed.",
          },
          { status: 409 }
        );
      }

      const claim = db.prepare(`
        UPDATE payment_authorizations
        SET processing_at = ?
        WHERE booking_reference = ?
          AND token_hash = ?
          AND used_at IS NULL
          AND processing_at IS NULL
      `).run(
        nowIso,
        bookingReference,
        tokenHash
      );

      if (claim.changes !== 1) {
        return NextResponse.json(
          {
            success: false,
            message:
              "This payment is already being processed.",
          },
          { status: 409 }
        );
      }

      paymentAuthorizationHash = tokenHash;
      paymentAuthorizationBookingReference =
        bookingReference;
      paymentAuthorizationProcessingAt = nowIso;

      delete booking.paymentAuthorizationToken;
    }

    if (!appsScriptUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Google Apps Script URL is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    });

    const responseText = await response.text();

    console.log(
      "Apps Script Status:",
      response.status
    );

    console.log(
      "APPS SCRIPT RAW RESPONSE:",
      JSON.stringify(responseText)
    );

    let data: AppsScriptResponse;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apps Script did not return valid JSON.",
          response: responseText,
        },
        {
          status: 500,
        }
      );
    }

    /*
     * Apps Script can return HTTP 200 while
     * reporting success: false in its JSON.
     *
     * Treat that as an API failure.
     */
    if (!response.ok || data.success === false) {
      if (
        action === "recordPayment" &&
        paymentAuthorizationHash &&
        paymentAuthorizationBookingReference &&
        paymentAuthorizationProcessingAt
      ) {
        db.prepare(`
          UPDATE payment_authorizations
          SET processing_at = NULL
          WHERE booking_reference = ?
            AND token_hash = ?
            AND processing_at = ?
        `).run(
          paymentAuthorizationBookingReference,
          paymentAuthorizationHash,
          paymentAuthorizationProcessingAt
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            data.message ??
            data.error ??
            "Booking operation failed.",
          error: data.error,
          action: data.action,
          bookingReference:
            data.bookingReference,
          status: data.status,
        },
        {
          status: response.ok
            ? 409
            : response.status,
        }
      );
    }

    if (
      action === "recordPayment" &&
      paymentAuthorizationHash &&
      paymentAuthorizationBookingReference &&
      paymentAuthorizationProcessingAt
    ) {
      db.prepare(`
        UPDATE payment_authorizations
        SET
          used_at = ?,
          processing_at = NULL
        WHERE booking_reference = ?
          AND token_hash = ?
          AND processing_at = ?
      `).run(
        new Date().toISOString(),
        paymentAuthorizationBookingReference,
        paymentAuthorizationHash,
        paymentAuthorizationProcessingAt
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (
      paymentAuthorizationHash &&
      paymentAuthorizationBookingReference &&
      paymentAuthorizationProcessingAt
    ) {
      db.prepare(`
        UPDATE payment_authorizations
        SET processing_at = NULL
        WHERE booking_reference = ?
          AND token_hash = ?
          AND processing_at = ?
      `).run(
        paymentAuthorizationBookingReference,
        paymentAuthorizationHash,
        paymentAuthorizationProcessingAt
      );
    }

    console.error(
      "Booking API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save booking.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  const authorization = await requireRole([
    "ADMIN",
    "MANAGER",
    "SALES",
    "DISPATCHER",
  ]);

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {

    const appsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL;

    console.log(
      "Apps Script URL for GET:",
      JSON.stringify(appsScriptUrl)
    );

    if (!appsScriptUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Google Apps Script URL is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const response = await fetch(
      `${appsScriptUrl}?action=list`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const responseText = await response.text();

    console.log(
      "Apps Script GET Status:",
      response.status
    );

    console.log(
      "Apps Script GET Response:",
      responseText
    );

    let data: AppsScriptResponse;

    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apps Script did not return valid JSON.",
          response: responseText,
        },
        {
          status: 500,
        }
      );
    }

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ??
            data.error ??
            "Unable to retrieve bookings.",
          error: data.error,
        },
        {
          status: response.ok
            ? 500
            : response.status,
        }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Booking GET API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve bookings.",
      },
      {
        status: 500,
      }
    );
  }
}