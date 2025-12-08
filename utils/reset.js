// utils/reset.js
import { TENANTS } from "../data/tenants";

export function makeResetTicket({ unit, lastName, phoneLast4 }) {
  const u = String(unit || "").trim().toUpperCase();
  const ln = String(lastName || "").trim().toLowerCase();
  const p4 = String(phoneLast4 || "").trim();

  const match = TENANTS.find(
    t =>
      t.unit.toUpperCase() === u &&
      t.lastName.toLowerCase() === ln &&
      t.phoneLast4 === p4
  );
  if (!match) {
    const err = new Error("We couldn’t find a matching tenant record.");
    err.code = "NO_MATCH";
    throw err;
  }
  const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes
  return { code, expiresAt, unit: match.unit, lastName: match.lastName };
}
