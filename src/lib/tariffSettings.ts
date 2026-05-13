import type { ElectricityTariff } from "./savings.js";

export interface TariffInput {
  currency?: unknown;
  peakRate?: unknown;
  offPeakRate?: unknown;
  peakStart?: unknown;
  peakEnd?: unknown;
  feedInRate?: unknown;
}

export class TariffValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TariffValidationError";
  }
}

const normalizeCurrency = (value: unknown, fallback: string): string => {
  const normalized = String(value ?? fallback).trim().toUpperCase();

  if (!/^[A-Z]{3}$/.test(normalized)) {
    throw new TariffValidationError("Currency must be a three-letter code such as AUD.");
  }

  return normalized;
};

const normalizeRate = (value: unknown, fallback: number, label: string): number => {
  const parsed = Number(value ?? fallback);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    throw new TariffValidationError(`${label} must be a number between 0 and 10.`);
  }

  return Math.round((parsed + Number.EPSILON) * 10000) / 10000;
};

const normalizeClockTime = (value: unknown, fallback: string, label: string): string => {
  const normalized = String(value ?? fallback).trim();

  if (!/^\d{1,2}:\d{2}$/.test(normalized)) {
    throw new TariffValidationError(`${label} must use HH:mm format.`);
  }

  const [hours, minutes] = normalized.split(":").map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new TariffValidationError(`${label} must be a valid 24-hour time.`);
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

export const normalizeTariffInput = (
  input: TariffInput,
  fallback: ElectricityTariff,
): ElectricityTariff => ({
  currency: normalizeCurrency(input.currency, fallback.currency),
  peakRate: normalizeRate(input.peakRate, fallback.peakRate, "Peak rate"),
  offPeakRate: normalizeRate(input.offPeakRate, fallback.offPeakRate, "Off-peak rate"),
  peakStart: normalizeClockTime(input.peakStart, fallback.peakStart, "Peak start"),
  peakEnd: normalizeClockTime(input.peakEnd, fallback.peakEnd, "Peak end"),
  feedInRate: normalizeRate(input.feedInRate, fallback.feedInRate, "Feed-in rate"),
});
