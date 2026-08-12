import { NextRequest, NextResponse } from "next/server";

interface AppsScriptResponse {
  success?: boolean;
  message?: string;
  error?: string;
  action?: string;
  dispatchId?: string;
  bookingReference?: string;
  status?: string;
  previousStatus?: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicle?: string;
  dispatches?: unknown[];
}

function getAppsScriptUrl(): string {
  const appsScriptUrl =
    process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!appsScriptUrl) {
    throw new Error(
      "Google Apps Script URL is not configured."
    );
  }

  return appsScriptUrl;
}

async function parseAppsScriptResponse(
  response: Response
): Promise<AppsScriptResponse> {
  const responseText = await response.text();

  console.log(
    "Apps Script Status:",
    response.status
  );

  console.log(
    "Apps Script Raw Response:",
    responseText
  );

  try {
    return JSON.parse(
      responseText
    ) as AppsScriptResponse;
  } catch {
    throw new Error(
      "Apps Script did not return valid JSON."
    );
  }
}

export async function GET() {
  try {
    const appsScriptUrl =
      getAppsScriptUrl();

    console.log(
      "Dispatch API Apps Script URL:",
      JSON.stringify(appsScriptUrl)
    );

    const response = await fetch(
      `${appsScriptUrl}?action=listDispatch`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data =
      await parseAppsScriptResponse(
        response
      );

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
            "Unable to retrieve dispatch records.",
          error: data.error,
          action: data.action,
          dispatches:
            data.dispatches ?? [],
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
      "Dispatch GET API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to retrieve dispatch records.",
        dispatches: [],
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const appsScriptUrl =
      getAppsScriptUrl();

    const dispatchRequest =
      await request.json();

    console.log(
      "Dispatch POST Request:",
      JSON.stringify(
        dispatchRequest
      )
    );

    const response = await fetch(
      appsScriptUrl,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(
          dispatchRequest
        ),
      }
    );

    const data =
      await parseAppsScriptResponse(
        response
      );

    /*
     * Apps Script may return HTTP 200
     * while reporting success: false.
     *
     * Treat that as an API failure.
     */
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
            "Dispatch operation failed.",
          error: data.error,
          action: data.action,
          dispatchId:
            data.dispatchId,
          bookingReference:
            data.bookingReference,
          status: data.status,
          previousStatus:
            data.previousStatus,
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
      "Dispatch POST API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process dispatch operation.",
      },
      {
        status: 500,
      }
    );
  }
}