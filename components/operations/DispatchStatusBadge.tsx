"use client";

interface DispatchStatusBadgeProps {
  status?: string;
}

function getStatusClasses(status: string): string {
  switch (status.toLowerCase()) {
    case "assigned":
      return "bg-blue-100 text-blue-700";

    case "en route":
      return "bg-amber-100 text-amber-700";

    case "passenger onboard":
      return "bg-purple-100 text-purple-700";

    case "incident":
      return "bg-orange-100 text-orange-700";

    case "completed":
      return "bg-green-100 text-green-700";

    case "not dispatched":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function DispatchStatusBadge({
  status = "Not Dispatched",
}: DispatchStatusBadgeProps) {
  const normalizedStatus = status.trim() || "Not Dispatched";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClasses(
        normalizedStatus,
      )}`}
    >
      {normalizedStatus}
    </span>
  );
}