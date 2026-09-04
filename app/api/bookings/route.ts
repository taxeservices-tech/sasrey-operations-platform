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

export async function POST(request: NextRequest) {
  try {
    const appsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL;

    console.log(
      "Apps Script URL (raw):",
      JSON.stringify(appsScriptUrl)
    );

    const booking = await request.json();

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

    return NextResponse.json(data);
  } catch (error) {
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