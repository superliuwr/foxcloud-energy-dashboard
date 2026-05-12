import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getSolarOutlook,
  getWeatherConditionKey,
} from "../dist/lib/weatherOutlook.js";

describe("weather outlook helpers", () => {
  it("maps Open-Meteo weather codes to dashboard condition keys", () => {
    assert.equal(getWeatherConditionKey(0), "clear");
    assert.equal(getWeatherConditionKey(2), "partly_cloudy");
    assert.equal(getWeatherConditionKey(3), "cloudy");
    assert.equal(getWeatherConditionKey(63), "rain");
    assert.equal(getWeatherConditionKey(95), "storm");
    assert.equal(getWeatherConditionKey(undefined), "unknown");
  });

  it("rates clear low-cloud days as excellent for solar", () => {
    assert.equal(getSolarOutlook(0, 10, 5, 0), "excellent");
  });

  it("rates partly cloudy low-rain days as good for solar", () => {
    assert.equal(getSolarOutlook(2, 35, 20, 0), "good");
  });

  it("rates wet or very cloudy days lower for solar", () => {
    assert.equal(getSolarOutlook(61, 80, 55, 1), "fair");
    assert.equal(getSolarOutlook(95, 95, 80, 5), "poor");
  });
});
