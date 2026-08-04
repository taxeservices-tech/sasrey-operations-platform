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
    useState<Partial<Booking>>({});

  const [currentStep, setCurrentStep] =
    useState(1);

  function updateBooking(
    values: Partial<Booking>
  ) {
    setBooking((previous) => ({
      ...previous,
      ...values,
    }));
  }

  function resetBooking() {
    setBooking({});
  }

  return (
    <BookingContext.Provider
      value={{
        booking,
        currentStep,
        setCurrentStep,
        updateBooking,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (!context) {
    throw new Error(
      "useBooking must be used inside BookingProvider"
    );
  }

  return context;
}