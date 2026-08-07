import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json();

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

    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    });

    const data = await response.json();

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