import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync("public/rebuildHelpers.js", "utf8"), context);

const { formatRebuildConfirm, formatRebuildStatus, interpolate } = context.FoxCloudRebuild;

const translations = {
  rebuiltCache: "Cache rebuilt.",
  rebuildCacheConfirm: "Rebuild cache? Limited to {limit} days.",
  rebuildSummary: "{processed} days checked, {rebuilt} recalculated, {skipped} kept unchanged.",
  rebuildLimited: " Limited to {limit} days; {omitted} older days skipped.",
};
const t = (key) => translations[key] ?? key;

describe("rebuild cache helpers", () => {
  it("interpolates named template values", () => {
    assert.equal(interpolate("Hello {name}", { name: "FoxCloud" }), "Hello FoxCloud");
  });

  it("formats rebuild confirmation text with the limit", () => {
    assert.equal(formatRebuildConfirm(t, 31), "Rebuild cache? Limited to 31 days.");
  });

  it("formats structured rebuild summaries", () => {
    const status = formatRebuildStatus(
      {
        rebuild: {
          processedDays: 12,
          rebuiltDays: 10,
          skippedDays: 2,
          omittedDays: 0,
          limited: false,
          limitDays: 31,
        },
      },
      t,
    );

    assert.equal(
      status,
      "Cache rebuilt. 12 days checked, 10 recalculated, 2 kept unchanged.",
    );
  });

  it("formats limited rebuild summaries", () => {
    const status = formatRebuildStatus(
      {
        rebuild: {
          processedDays: 31,
          rebuiltDays: 29,
          skippedDays: 2,
          omittedDays: 14,
          limited: true,
          limitDays: 31,
        },
      },
      t,
    );

    assert.equal(
      status,
      "Cache rebuilt. 31 days checked, 29 recalculated, 2 kept unchanged. Limited to 31 days; 14 older days skipped.",
    );
  });

  it("keeps compatibility with the older top-level response fields", () => {
    const status = formatRebuildStatus(
      {
        processedDays: 3,
        rebuiltDays: 2,
        skippedDays: 1,
        limited: false,
      },
      t,
    );

    assert.equal(status, "Cache rebuilt. 3 days checked, 2 recalculated, 1 kept unchanged.");
  });
});
