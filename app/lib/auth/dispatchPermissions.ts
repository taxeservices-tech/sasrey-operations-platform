import type { UserRole } from "@/app/lib/auth/authorization";

export const dispatchActionPermissions = {
  listDispatch: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  listDispatchResources: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  getSettings: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  createDispatch: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  updateDispatchStatus: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  checkDispatchResourceAvailability: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  createIncident: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  resolveIncident: [
    "ADMIN",
    "MANAGER",
    "DISPATCHER",
  ],

  recordPayment: [
    "ADMIN",
    "MANAGER",
  ],
} satisfies Record<string, readonly UserRole[]>;
