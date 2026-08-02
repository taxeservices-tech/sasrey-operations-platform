"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { Booking } from "../types/booking";

interface BookingContextType {
  booking: Booking | null;
  setBooking: Dispatch<SetStateAction<Booking | null>>;
}

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export function BookingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [booking, setBooking] = useState<Booking | null>(null);

  return (
    <BookingContext.Provider value={{ booking, setBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);

  if (context === undefined) {
    throw new Error(
      "useBooking must be used within a BookingProvider"
    );
  }

  return context;
}