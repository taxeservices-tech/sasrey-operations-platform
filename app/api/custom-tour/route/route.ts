import { NextResponse } from "next/server";

interface RouteRequestBody {
    pickup: string;
    destination: string;
    stops?: string[];
    returnToPickup?: boolean;
}

interface GoogleRouteResponse {
    routes?: Array<{
        distanceMeters?: number;
        duration?: string;
    }>;
    error?: {
        message?: string;
        status?: string;
        code?: number;
    };
}

const GOOGLE_ROUTES_URL =
    "https://routes.googleapis.com/directions/v2:computeRoutes";

function parseDurationSeconds(
    duration: string | undefined
): number {
    if (!duration) {
        return 0;
    }

    const match = duration.match(/^([\d.]+)s$/);

    return match ? Number(match[1]) : 0;
}

async function calculateLeg(
    origin: string,
    destination: string,
    apiKey: string
) {
    const response = await fetch(GOOGLE_ROUTES_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask":
                "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
            origin: { address: origin },
            destination: { address: destination },
            travelMode: "DRIVE",
            languageCode: "en",
            units: "METRIC",
        }),
        cache: "no-store",
    });

    const data =
        (await response.json()) as GoogleRouteResponse;

    if (!response.ok) {
        throw new Error(
            `Google Routes API failed for "${origin}" to "${destination}": ${
                data.error?.message ?? response.statusText
            }`
        );
    }

    const route = data.routes?.[0];

    if (!route) {
        throw new Error(
            `Google returned no route for "${origin}" to "${destination}".`
        );
    }

    return {
        distanceMeters: route.distanceMeters ?? 0,
        durationSeconds: parseDurationSeconds(
            route.duration
        ),
    };
}

export async function POST(request: Request) {
    try {
        const body =
            (await request.json()) as RouteRequestBody;

        const pickup = body.pickup?.trim() ?? "";
        const destination =
            body.destination?.trim() ?? "";

        const stops = Array.isArray(body.stops)
            ? body.stops
                  .filter(
                      (stop): stop is string =>
                          typeof stop === "string"
                  )
                  .map((stop) => stop.trim())
                  .filter(Boolean)
            : [];

        // Returning to pickup is enabled by default.
        const returnToPickup =
            body.returnToPickup ?? true;

        console.log("Custom tour route request:", {
            pickup,
            destination,
            stops,
            returnToPickup,
        });

        if (!pickup || !destination) {
            return NextResponse.json(
                {
                    error:
                        "Pickup location and main destination are required.",
                },
                { status: 400 }
            );
        }

        const apiKey =
            process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error:
                        "Google Maps API key is not configured.",
                },
                { status: 500 }
            );
        }

        /*
         * Build the itinerary in the required order:
         * pickup -> planned stops in their chosen order
         * -> main destination -> pickup, if requested.
         *
         * The main destination remains separate from the
         * final route location in the API response.
         */
        const itinerary: string[] = [
            pickup,
            ...stops,
            destination,
        ];

        if (returnToPickup) {
            itinerary.push(pickup);
        }

        let totalDistanceMeters = 0;
        let totalDurationSeconds = 0;

        for (
            let index = 0;
            index < itinerary.length - 1;
            index++
        ) {
            const origin = itinerary[index];
            const nextDestination =
                itinerary[index + 1];

            if (!origin || !nextDestination) {
                continue;
            }

            console.info(
                `Calculating custom tour leg ${index + 1}: ${origin} -> ${nextDestination}`
            );

            const leg = await calculateLeg(
                origin,
                nextDestination,
                apiKey
            );

            totalDistanceMeters +=
                leg.distanceMeters;

            totalDurationSeconds +=
                leg.durationSeconds;
        }

        return NextResponse.json({
            success: true,
            pickup,
            destination,
            stops,
            returnToPickup,
            itinerary,
            distanceMeters: totalDistanceMeters,
            distanceKm: Number(
                (totalDistanceMeters / 1000).toFixed(2)
            ),
            durationSeconds: totalDurationSeconds,
            durationMinutes: Math.round(
                totalDurationSeconds / 60
            ),
        });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to calculate the custom tour route.";

        console.error(
            "Custom tour route calculation error:",
            message
        );

        return NextResponse.json(
            { error: message },
            { status: 422 }
        );
    }
}