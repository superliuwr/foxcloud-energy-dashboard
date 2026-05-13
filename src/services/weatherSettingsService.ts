import { env } from "../config/env.js";
import {
  normalizeWeatherSettingsInput,
  WeatherSettingsValidationError,
  type WeatherSettings,
  type WeatherSettingsInput,
} from "../lib/weatherSettings.js";

import { readAppSetting, writeAppSetting } from "./sqliteStore.js";

const WEATHER_SETTINGS_KEY = "weather_settings";

export { WeatherSettingsValidationError };

const fallbackWeatherSettings = (): WeatherSettings => ({
  enabled: env.weather.enabled,
  provider: "open-meteo",
  locationName: env.weather.locationName,
  postcode: env.weather.postcode,
  countryCode: env.weather.countryCode,
  latitude: env.weather.latitude,
  longitude: env.weather.longitude,
  timezone: env.weather.timezone,
});

const readSavedWeatherSettings = (): Partial<WeatherSettings> | null => {
  const storedValue = readAppSetting(WEATHER_SETTINGS_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<WeatherSettings>;

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const getWeatherSettings = (): WeatherSettings => {
  const fallback = fallbackWeatherSettings();
  const savedSettings = readSavedWeatherSettings();

  return normalizeWeatherSettingsInput(savedSettings ?? {}, fallback);
};

export const saveWeatherSettings = (input: WeatherSettingsInput): WeatherSettings => {
  const settings = normalizeWeatherSettingsInput(input, getWeatherSettings());

  writeAppSetting(WEATHER_SETTINGS_KEY, JSON.stringify(settings));

  return settings;
};
