import { roundEnergy } from "./energyMath.js";

export type RegisterMap = Map<number, number>;

export const readUnsignedRegisters = (
  registers: RegisterMap,
  addresses: readonly number[],
): number | null => {
  let value = 0;

  for (const [index, address] of addresses.entries()) {
    const register = registers.get(address);

    if (register === undefined) {
      return null;
    }

    value += (register & 0xffff) * 2 ** (index * 16);
  }

  return value;
};

export const readSignedRegisters = (
  registers: RegisterMap,
  addresses: readonly number[],
): number | null => {
  const value = readUnsignedRegisters(registers, addresses);

  if (value === null) {
    return null;
  }

  const bits = addresses.length * 16;
  const signBit = 2 ** (bits - 1);

  return value >= signBit ? value - 2 ** bits : value;
};

export const readScaledUnsignedRegisters = (
  registers: RegisterMap,
  addresses: readonly number[],
  scale = 1,
): number => roundEnergy((readUnsignedRegisters(registers, addresses) ?? 0) * scale);

export const readScaledSignedRegisters = (
  registers: RegisterMap,
  addresses: readonly number[],
  scale = 1,
): number => roundEnergy((readSignedRegisters(registers, addresses) ?? 0) * scale);
