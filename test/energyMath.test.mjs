import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  integratePowerSamples,
  roundEnergy,
} from "../dist/lib/energyMath.js";

describe("energy math helpers", () => {
  it("rounds energy values to two decimals by default", () => {
    assert.equal(roundEnergy(1.234), 1.23);
    assert.equal(roundEnergy(1.235), 1.24);
    assert.equal(roundEnergy(undefined), 0);
  });

  it("integrates kW samples into kWh using trapezoids", () => {
    const samples = [
      { sampledAt: "2026-04-29T10:00:00.000Z", kw: 2 },
      { sampledAt: "2026-04-29T10:30:00.000Z", kw: 4 },
      { sampledAt: "2026-04-29T11:00:00.000Z", kw: 4 },
    ];

    assert.equal(integratePowerSamples(samples), 3.5);
  });

  it("sorts samples before integrating", () => {
    const samples = [
      { sampledAt: "2026-04-29T11:00:00.000Z", kw: 4 },
      { sampledAt: "2026-04-29T10:00:00.000Z", kw: 2 },
      { sampledAt: "2026-04-29T10:30:00.000Z", kw: 4 },
    ];

    assert.equal(integratePowerSamples(samples), 3.5);
  });

  it("ignores long gaps so missing samples do not overstate energy", () => {
    const samples = [
      { sampledAt: "2026-04-29T10:00:00.000Z", kw: 5 },
      { sampledAt: "2026-04-29T12:30:00.000Z", kw: 5 },
    ];

    assert.equal(integratePowerSamples(samples), 0);
  });

  it("treats invalid or negative power as zero", () => {
    const samples = [
      { sampledAt: "2026-04-29T10:00:00.000Z", kw: -2 },
      { sampledAt: "2026-04-29T11:00:00.000Z", kw: Number.NaN },
      { sampledAt: "2026-04-29T12:00:00.000Z", kw: 4 },
    ];

    assert.equal(integratePowerSamples(samples), 2);
  });
});
