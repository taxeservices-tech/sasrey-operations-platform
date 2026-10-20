import { NextResponse } from "next/server";
import { requireRole } from "@/app/lib/auth/authorization";

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

interface AccountingSummary {
  bookingValue: number;
  paymentsReceived: number;
  outstanding: number;
  depositsReceived: number;
  balancesReceived: number;
  otherPayments: number;
  creditCardReceived: number;
  bankTransferReceived: number;
  bookingCount: number;
  paidBookingCount: number;
  partiallyPaidBookingCount: number;
  unpaidBookingCount: number;
}

function toAmount(
  value: string | number | undefined
): number {
  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : 0;
}

function roundCurrency(
  value: number
): number {
  return (
    Math.round(
      (value + Number.EPSILON) * 100
    ) / 100
  );
}

function buildAccountingSummary(
  payments: PaymentRecord[]
): AccountingSummary {
  const bookings = new Map<
    string,
    {
      total: number;
      paid: number;
    }
  >();

  let depositsReceived = 0;
  let balancesReceived = 0;
  let otherPayments = 0;

  let creditCardReceived = 0;
  let bankTransferReceived = 0;

  for (const payment of payments) {
    const bookingId =
      payment["Booking ID"]
        ?.trim() ?? "";

    if (!bookingId) {
      continue;
    }

    const total = toAmount(
      payment.Total
    );

    const amountPaid = toAmount(
      payment["Amount Paid"]
    );

    if (!bookings.has(bookingId)) {
      bookings.set(bookingId, {
        total,
        paid: 0,
      });
    }

    const booking =
      bookings.get(bookingId)!;

    if (total > 0) {
      booking.total = total;
    }

    booking.paid += amountPaid;

    const paymentType =
      payment["Payment Type"]
        ?.trim()
        .toLowerCase();

    if (paymentType === "deposit") {
      depositsReceived += amountPaid;
    } else if (
      paymentType === "balance"
    ) {
      balancesReceived += amountPaid;
    } else {
      otherPayments += amountPaid;
    }

    const paymentMethod =
      payment["Payment Method"]
        ?.trim()
        .toLowerCase();

    if (
      paymentMethod === "credit card"
    ) {
      creditCardReceived +=
        amountPaid;
    } else if (
      paymentMethod ===
      "bank transfer"
    ) {
      bankTransferReceived +=
        amountPaid;
    }
  }

  let bookingValue = 0;
  let paymentsReceived = 0;
  let outstanding = 0;

  let paidBookingCount = 0;
  let partiallyPaidBookingCount = 0;
  let unpaidBookingCount = 0;

  for (const booking of bookings.values()) {
    bookingValue += booking.total;
    paymentsReceived += booking.paid;

    outstanding += Math.max(
      booking.total -
        booking.paid,
      0
    );

    if (
      booking.total > 0 &&
      booking.paid >= booking.total
    ) {
      paidBookingCount++;
    } else if (
      booking.paid > 0
    ) {
      partiallyPaidBookingCount++;
    } else {
      unpaidBookingCount++;
    }
  }

  return {
    bookingValue: roundCurrency(
      bookingValue
    ),
    paymentsReceived: roundCurrency(
      paymentsReceived
    ),
    outstanding: roundCurrency(
      outstanding
    ),
    depositsReceived: roundCurrency(
      depositsReceived
    ),
    balancesReceived: roundCurrency(
      balancesReceived
    ),
    otherPayments: roundCurrency(
      otherPayments
    ),
    creditCardReceived:
      roundCurrency(
        creditCardReceived
      ),
    bankTransferReceived:
      roundCurrency(
        bankTransferReceived
      ),
    bookingCount:
      bookings.size,
    paidBookingCount,
    partiallyPaidBookingCount,
    unpaidBookingCount,
  };
}
export async function GET() {
  const authorization = await requireRole([
    "ADMIN",
    "MANAGER",
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

    const summary =
      buildAccountingSummary(
        payments
      );

    return NextResponse.json({
      success: true,
      payments,
      summary,
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