import { NextResponse } from "next/server";

interface PaymentRecord {
  "Booking ID"?: string;
  Total?: string | number;
  Deposit?: string | number;
  Balance?: string | number;
  Status?: string;
  "Amount Paid"?: string | number;
  "Payment Method"?: string;
  "Payment Date"?: string;
  "Payment Reference"?: string;
  "Payment Type"?: string;
}

interface AppsScriptPaymentsResponse {
  success?: boolean;
  message?: string;
  error?: string;
  payments?: PaymentRecord[];
}

export async function GET() {
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
      `${appsScriptUrl}?action=listPayments`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const responseText =
      await response.text();

    let data: AppsScriptPaymentsResponse;

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
            "Unable to retrieve payments.",
          error: data.error,
        },
        {
          status: response.ok
            ? 500
            : response.status,
        }
      );
    }

    const payments =
      Array.isArray(data.payments)
        ? data.payments
        : [];

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Accounting GET API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve accounting payments.",
      },
      { status: 500 }
    );
  }
}