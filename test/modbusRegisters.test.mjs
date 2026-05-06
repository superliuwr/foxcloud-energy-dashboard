import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  readScaledSignedRegisters,
  readScaledUnsignedRegisters,
  readSignedRegisters,
  readUnsignedRegisters,
} from "../dist/lib/modbusRegisters.js";

const registers = (entries) => new Map(entries);

describe("Modbus register decoding", () => {
  it("reads a single unsigned 16-bit register", () => {
    assert.equal(readUnsignedRegisters(registers([[100, 1234]]), [100]), 1234);
  });

  it("reads multi-register unsigned values in low-word-first order", () => {
    const map = registers([
      [100, 0x5678],
      [101, 0x1234],
    ]);

    assert.equal(readUnsignedRegisters(map, [100, 101]), 0x12345678);
  });

  it("returns null when a requested register is missing", () => {
    assert.equal(readUnsignedRegisters(registers([[100, 1]]), [100, 101]), null);
    assert.equal(readSignedRegisters(registers([[100, 1]]), [100, 101]), null);
  });

  it("decodes signed 16-bit values", () => {
    assert.equal(readSignedRegisters(registers([[100, 0xffff]]), [100]), -1);
    assert.equal(readSignedRegisters(registers([[100, 0x7fff]]), [100]), 32767);
  });

  it("decodes signed 32-bit values", () => {
    const minusTwo = registers([
      [100, 0xfffe],
      [101, 0xffff],
    ]);
    const positive = registers([
      [100, 0x0001],
      [101, 0x0001],
    ]);

    assert.equal(readSignedRegisters(minusTwo, [100, 101]), -2);
    assert.equal(readSignedRegisters(positive, [100, 101]), 65537);
  });

  it("applies scale factors and rounds decoded values", () => {
    assert.equal(readScaledUnsignedRegisters(registers([[100, 1234]]), [100], 0.01), 12.34);
    assert.equal(readScaledSignedRegisters(registers([[100, 0xff9c]]), [100], 0.1), -10);
  });

  it("defaults missing scaled registers to zero for dashboard display", () => {
    assert.equal(readScaledUnsignedRegisters(registers([]), [100], 0.01), 0);
    assert.equal(readScaledSignedRegisters(registers([]), [100], 0.1), 0);
  });
});
