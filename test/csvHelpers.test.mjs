import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import vm from "node:vm";

const context = {};
vm.createContext(context);
vm.runInContext(fs.readFileSync("public/csvHelpers.js", "utf8"), context);

const { escapeCsvValue } = context.FoxCloudCsv;

describe("CSV export helpers", () => {
  it("leaves ordinary values unchanged", () => {
    assert.equal(escapeCsvValue("Solar production"), "Solar production");
    assert.equal(escapeCsvValue(12.34), "12.34");
  });

  it("quotes values containing commas, quotes, or line breaks", () => {
    assert.equal(escapeCsvValue("one,two"), '"one,two"');
    assert.equal(escapeCsvValue('say "hello"'), '"say ""hello"""');
    assert.equal(escapeCsvValue("line\nbreak"), '"line\nbreak"');
  });

  it("prefixes formula-like values with a single quote", () => {
    assert.equal(escapeCsvValue("=SUM(A1:A2)"), "'=SUM(A1:A2)");
    assert.equal(escapeCsvValue("+cmd"), "'+cmd");
    assert.equal(escapeCsvValue("-cmd"), "'-cmd");
    assert.equal(escapeCsvValue("@cmd"), "'@cmd");
  });

  it("quotes formula-like values after prefixing when CSV escaping is also needed", () => {
    assert.equal(escapeCsvValue("=1,2"), "\"'=1,2\"");
  });
});
