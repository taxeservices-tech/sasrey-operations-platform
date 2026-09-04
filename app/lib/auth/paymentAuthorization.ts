import crypto from "crypto";

export interface PaymentAuthorizationToken {
  token: string;
  tokenHash: string;
  expiresAt: string;
}

export function createPaymentAuthorizationToken(
  ttlMinutes = 30
): PaymentAuthorizationToken {
  const token = crypto.randomBytes(32).toString("base64url");

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + ttlMinutes * 60 * 1000
  ).toISOString();

  return {
    token,
    tokenHash,
    expiresAt,
  };
}
