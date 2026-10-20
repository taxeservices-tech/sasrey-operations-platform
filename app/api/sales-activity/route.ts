import { NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth/authorization";

interface SalesActivityRecord {
  "Activity ID"?: string;
  "Activity Date"?: string;
  Salesperson?: string;
  "Lead Name"?: string;
  "Lead Source"?: string;
  "Activity Type"?: string;
  "Booking ID"?: string;
  Outcome?: string;
  Notes?: string;
}

interface AppsScriptSalesActivityResponse {
  success?: boolean;
  message?: string;
  error?: string;
  activities?: SalesActivityRecord[];
}

export async function GET() {
  const authorization = await requireRole([
    "ADMIN",
    "MANAGER",
    "SALES",
  ]);

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const appsScriptUrl =
      process.env.GOOGLE_APPS_SCRIPT_URL;

    if (!appsScriptUrl) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Google Apps Script URL is not configured.",
        },
        { status: 500 }
      );
    }

    const response = await fetch(
      `${appsScriptUrl}?action=listSalesActivity`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const responseText =
      await response.text();

    let data: AppsScriptSalesActivityResponse;

    try {
      data = JSON.parse(
        responseText
      );
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Apps Script did not return valid JSON.",
          response: responseText,
        },
        { status: 500 }
      );
    }

    if (
      !response.ok ||
      data.success === false
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            data.message ??
            data.error ??
            "Unable to retrieve sales activity.",
          error: data.error,
        },
        {
          status: response.ok
            ? 500
            : response.status,
        }
      );
    }

    const activities =
      Array.isArray(data.activities)
        ? data.activities
        : [];

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error(
      "Sales Activity GET API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve sales activity.",
      },
      { status: 500 }
    );
  }
}
