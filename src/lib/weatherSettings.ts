export interface WeatherSettings {
  enabled: boolean;
  provider: "open-meteo";
  locationName: string;
  postcode: string;
  countryCode: string;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
}

export interface WeatherSettingsInput {
  enabled?: unknown;
  provider?: unknown;
  locationName?: unknown;
  postcode?: unknown;
  countryCode?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
}

export class WeatherSettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherSettingsValidationError";
  }
}

const normalizeBoolean = (value: unknown, fallback: boolean): boolean => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["1", "true", "yes", "on"].includes(String(value).trim().toLowerCase());
};

const normalizeText = (value: unknown, fallback: string, maxLength: number): string => {
  const normalized = String(value ?? fallback).trim();

  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
};

const normalizeCountryCode = (value: unknown, fallback: string): string => {
  const normalized = String(value ?? fallback).trim().toUpperCase();

  if (normalized && !/^[A-Z]{2}$/.test(normalized)) {
    throw new WeatherSettingsValidationError("Country code must be a two-letter code such as AU.");
  }

  return normalized;
};

const normalizeCoordinate = (
  value: unknown,
  fallback: number | null,
  label: string,
  min: number,
  max: number,
): number | null => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new WeatherSettingsValidationError(`${label} must be a number between ${min} and ${max}.`);
  }

  return Number(parsed.toFixed(6));
};

const normalizeProvider = (value: unknown, fallback: WeatherSettings["provider"]): WeatherSettings["provider"] => {
  const normalized = String(value ?? fallback).trim().toLowerCase();

  if (normalized !== "open-meteo") {
    throw new WeatherSettingsValidationError("Weather provider currently supports only open-meteo.");
  }

  return "open-meteo";
};

export const normalizeWeatherSettingsInput = (
  input: WeatherSettingsInput,
  fallback: WeatherSettings,
): WeatherSettings => ({
  enabled: normalizeBoolean(input.enabled, fallback.enabled),
  provider: normalizeProvider(input.provider, fallback.provider),
  locationName: normalizeText(input.locationName, fallback.locationName, 80),
  postcode: normalizeText(input.postcode, fallback.postcode, 24),
  countryCode: normalizeCountryCode(input.countryCode, fallback.countryCode),
  latitude: normalizeCoordinate(input.latitude, fallback.latitude, "Latitude", -90, 90),
  longitude: normalizeCoordinate(input.longitude, fallback.longitude, "Longitude", -180, 180),
  timezone: normalizeText(input.timezone, fallback.timezone || "Australia/Sydney", 80),
});
