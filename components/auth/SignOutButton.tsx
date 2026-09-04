"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  async function handleSignOut() {
    await signOut({
      redirectTo: "/login",
    });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
    >
      Sign Out
    </button>
  );
}
