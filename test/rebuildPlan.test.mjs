import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { buildRebuildPlan } from "../dist/lib/rebuildPlan.js";

describe("rebuild plan helper", () => {
  const now = new Date(2026, 4, 10, 12, 0, 0);

  it("estimates FoxCloud history calls and applies the rebuild limit", () => {
    const plan = buildRebuildPlan("current_month", 2026, 5, {
      source: "foxcloud-history",
      limitDays: 7,
      now,
    });

    assert.deepEqual(plan, {
      requestedDays: 10,
      daysToRebuild: 7,
      omittedDays: 3,
      limited: true,
      limitDays: 7,
      estimatedHistoryCalls: 7,
      source: "foxcloud-history",
    });
  });

  it("does not estimate FoxCloud calls for local Modbus mode", () => {
    const plan = buildRebuildPlan("current_month", 2026, 5, {
      source: "modbus",
      limitDays: 0,
      now,
    });

    assert.equal(plan.requestedDays, 10);
    assert.equal(plan.daysToRebuild, 0);
    assert.equal(plan.estimatedHistoryCalls, 0);
    assert.equal(plan.source, "modbus");
  });

  it("handles previous-month ranges without including future dates", () => {
    const plan = buildRebuildPlan("previous_month", 2026, 5, {
      source: "foxcloud-history",
      limitDays: 31,
      now,
    });

    assert.equal(plan.requestedDays, 30);
    assert.equal(plan.daysToRebuild, 30);
    assert.equal(plan.limited, false);
  });
});
