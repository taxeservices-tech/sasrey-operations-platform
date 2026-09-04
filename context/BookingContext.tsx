"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Booking } from "@/types/booking";

interface BookingContextType {
  booking: Partial<Booking>;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  updateBooking: (values: Partial<Booking>) => void;

  paymentAuthorizationToken: string | null;
  setPaymentAuthorizationToken: (
    token: string | null
  ) => void;

  resetBooking: () => void;
}

const BookingContext =
  createContext<BookingContextType | null>(null);

export function BookingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [booking, setBooking] =
    useState<Partial<Booking>>({
      serviceCategory: "Airport Transfer",
      tripType: "One Way",
      passengers: 1,
      waitingTimeHours: 0,
      childSeat: 0,
      extraStop: 0,
    });
  const [
    paymentAuthorizationToken,
    setPaymentAuthorizationToken,
  ] = useState<string | null>(null);
  const [currentStep, setCurrentStep] =
    useState(1);

  function updateBooking(
    values: Partial<Booking>
  ) {
    console.log(
      "Updating booking with:",
      values
    );

    setBooking((previous) => {
      const updated = {
        ...previous,
        ...values,
      };

      console.log(
        "Updated booking:",
        updated
      );

      return updated;
    });
  }

  function resetBooking() {
    setBooking({});
    setPaymentAuthorizationToken(null);
    setCurrentStep(1);
  }

  return (
    <BookingContext.Provider
      value={{
        booking,
        currentStep,
        setCurrentStep,
        updateBooking,
        resetBooking,
        paymentAuthorizationToken,
        setPaymentAuthorizationToken,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context =
    useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBooking must be used inside BookingProvider"
    );
  }

  return context;
}