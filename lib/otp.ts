import crypto from "crypto";

export function generateOtp(): string {
  return String(crypto.randomInt(100000, 999999));
}
