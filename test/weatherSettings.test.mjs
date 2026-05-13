import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeWeatherSettingsInput,
  WeatherSettingsValidationError,
} from "../dist/lib/weatherSettings.js";

const fallback = {
  enabled: true,
  provider: "open-meteo",
  locationName: "Lidcombe",
  postcode: "2141",
  countryCode: "AU",
  latitude: null,
  longitude: null,
  timezone: "Australia/Sydney",
};

describe("weather settings helpers", () => {
  it("normalizes postcode-based weather settings", () => {
    const settings = normalizeWeatherSettingsInput({
      enabled: "true",
      locationName: "Berala",
      postcode: "2141",
      countryCode: "au",
    }, fallback);

    assert.equal(settings.enabled, true);
    assert.equal(settings.locationName, "Berala");
    assert.equal(settings.postcode, "2141");
    assert.equal(settings.countryCode, "AU");
  });

  it("accepts optional coordinates", () => {
    const settings = normalizeWeatherSettingsInput({
      latitude: "-33.8602",
      longitude: "151.04925",
    }, fallback);

    assert.equal(settings.latitude, -33.8602);
    assert.equal(settings.longitude, 151.04925);
  });

  it("rejects invalid country codes and coordinates", () => {
    assert.throws(
      () => normalizeWeatherSettingsInput({ countryCode: "AUS" }, fallback),
      WeatherSettingsValidationError,
    );
    assert.throws(
      () => normalizeWeatherSettingsInput({ latitude: "-100" }, fallback),
      WeatherSettingsValidationError,
    );
    assert.throws(
      () => normalizeWeatherSettingsInput({ provider: "other" }, fallback),
      WeatherSettingsValidationError,
    );
  });
});
