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
}

function generateBookingReference(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const randomPart = crypto.randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();

  return `SAS-${datePart}-${randomPart}`;
}

export async function POST(request: NextRequest) {
  try {
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    const booking = await request.json();

    const action = String(booking?.action ?? "").trim();

    if (action === "updateStatus") {
      const authorization = await requireRole([
        "ADMIN",
        "MANAGER",
        "SALES",
        "DISPATCHER",
      ]);

      if (!authorization.authorized) {
        return authorization.response;
      }
    }

    if (!appsScriptUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Apps Script URL is not configured.",
        },
        { status: 500 }
      );
    }

    // Generate a reference for new booking requests before sending
    // the payload to Apps Script. Preserve references for other actions.
    const bookingPayload =
      action === "createBooking"
        ? {
            ...booking,
            bookingReference:
              String(booking?.bookingReference ?? "").trim() ||
              generateBookingReference(),
          }
        : booking;

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bookingPayload),
    });

    const responseText = await response.text();

    console.log("Apps Script Status:", response.status);
    console.log("APPS SCRIPT RAW RESPONSE:", responseText);

    let data: AppsScriptResponse;

    try {
      data = JSON.parse(responseText) as AppsScriptResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Apps Script did not return valid JSON.",
        },
        { status: 502 }
      );
    }

    if (!response.ok || data.success === false) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ??
            data.error ??
            "Booking operation failed.",
          error: data.error,
          action: data.action,
          bookingReference: data.bookingReference,
          status: data.status,
        },
        {
          status: response.ok ? 409 : response.status,
        }
      );
    }

    // Return the same reference sent to Apps Script if its successful
    // response does not include that field.
    if (action === "createBooking") {
      const bookingReference = String(
        data.bookingReference ??
          bookingPayload.bookingReference ??
          ""
      ).trim();

      if (!bookingReference) {
        return NextResponse.json(
          {
            success: false,
            message:
              "The booking service did not return a booking reference.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json({
        ...data,
        success: true,
        action: "createBooking",
        bookingReference,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Booking API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to save booking.",
      },
      { status: 500 }
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
    const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Apps Script URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(`${appsScriptUrl}?action=list`, {
      method: "GET",
      cache: "no-store",
    });

    const responseText = await response.text();

    console.log("Apps Script GET Status:", response.status);

    let data: AppsScriptResponse;

    try {
      data = JSON.parse(responseText) as AppsScriptResponse;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Apps Script did not return valid JSON.",
        },
        { status: 502 }
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
        { status: response.ok ? 500 : response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Booking GET API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve bookings.",
      },
      { status: 500 }
    );
  }
}