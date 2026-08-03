"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Booking } from "../types/booking";

interface BookingContextType {
  booking: Booking | null;

  setBooking: (booking: Booking) => void;

  updateBooking: (updates: Partial<Booking>) => void;

  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export function BookingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [booking, setBookingState] = useState<Booking | null>(null);

  function setBooking(booking: Booking) {
    setBookingState(booking);
  }

  function updateBooking(updates: Partial<Booking>) {
    setBookingState((current) => {
      if (!current) return updates as Booking;

      return {
        ...current,
        ...updates,
      };
    });
  }

  function clearBooking() {
    setBookingState(null);
  }

  return (
    <BookingContext.Provider
      value={{
        booking,
        setBooking,
        updateBooking,
        clearBooking,
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
      "useBooking must be used within a BookingProvider"
    );
  }

  return context;
}