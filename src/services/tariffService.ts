import { env } from "../config/env.js";
import {
  normalizeTariffInput,
  TariffValidationError,
  type TariffInput,
} from "../lib/tariffSettings.js";
import type { ElectricityTariff } from "../lib/savings.js";

import { readAppSetting, writeAppSetting } from "./sqliteStore.js";

const TARIFF_SETTING_KEY = "electricity_tariff";

export { TariffValidationError };

const readSavedTariff = (): Partial<ElectricityTariff> | null => {
  const storedValue = readAppSetting(TARIFF_SETTING_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(storedValue) as Partial<ElectricityTariff>;

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export const getElectricityTariff = (): ElectricityTariff => {
  const savedTariff = readSavedTariff();

  return normalizeTariffInput(savedTariff ?? {}, env.electricity);
};

export const saveElectricityTariff = (input: TariffInput): ElectricityTariff => {
  const tariff = normalizeTariffInput(input, getElectricityTariff());

  writeAppSetting(TARIFF_SETTING_KEY, JSON.stringify(tariff));

  return tariff;
};
