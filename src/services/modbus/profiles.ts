export interface ModbusRegisterValue {
  addresses: readonly number[];
  scale?: number;
}

export interface ModbusRegisterProfile {
  id: string;
  label: string;
  readRanges: ReadonlyArray<{
    startAddress: number;
    count: number;
  }>;
  live: {
    pvPowerInputs: readonly ModbusRegisterValue[];
    gridCtPower: ModbusRegisterValue;
    batteryPower: ModbusRegisterValue;
    homeUsagePower: ModbusRegisterValue;
    batterySoc: ModbusRegisterValue;
    batteryPackTemperature: ModbusRegisterValue;
    batteryMaxTemperature: ModbusRegisterValue;
    batteryMinTemperature: ModbusRegisterValue;
    inverterTemperature: ModbusRegisterValue;
  };
  daily: {
    solarEnergyToday: ModbusRegisterValue;
    totalYieldToday: ModbusRegisterValue;
    feedInToday: ModbusRegisterValue;
    loadEnergyToday: ModbusRegisterValue;
    gridConsumptionToday: ModbusRegisterValue;
    batteryChargeToday: ModbusRegisterValue;
    batteryDischargeToday: ModbusRegisterValue;
  };
}

export const foxEssH3SmartProfile: ModbusRegisterProfile = {
  id: "foxess-h3-smart",
  label: "FoxESS H3 Smart",
  readRanges: [
    { startAddress: 37609, count: 28 },
    { startAddress: 38814, count: 26 },
    { startAddress: 39063, count: 80 },
    { startAddress: 39219, count: 20 },
    { startAddress: 39279, count: 8 },
    { startAddress: 39601, count: 32 },
  ],
  live: {
    pvPowerInputs: [
      { addresses: [39280, 39279], scale: 0.001 },
      { addresses: [39282, 39281], scale: 0.001 },
      { addresses: [39284, 39283], scale: 0.001 },
      { addresses: [39286, 39285], scale: 0.001 },
    ],
    gridCtPower: { addresses: [38815, 38814], scale: 0.0001 },
    batteryPower: { addresses: [39238, 39237], scale: 0.001 },
    homeUsagePower: { addresses: [39226, 39225], scale: 0.001 },
    batterySoc: { addresses: [37612] },
    batteryPackTemperature: { addresses: [37611], scale: 0.1 },
    batteryMaxTemperature: { addresses: [37617], scale: 0.1 },
    batteryMinTemperature: { addresses: [37618], scale: 0.1 },
    inverterTemperature: { addresses: [39141], scale: 0.1 },
  },
  daily: {
    solarEnergyToday: { addresses: [39604, 39603], scale: 0.01 },
    totalYieldToday: { addresses: [39624, 39623], scale: 0.01 },
    feedInToday: { addresses: [39616, 39615], scale: 0.01 },
    loadEnergyToday: { addresses: [39632, 39631], scale: 0.01 },
    gridConsumptionToday: { addresses: [39620, 39619], scale: 0.01 },
    batteryChargeToday: { addresses: [39608, 39607], scale: 0.01 },
    batteryDischargeToday: { addresses: [39612, 39611], scale: 0.01 },
  },
};

export const modbusProfiles = [foxEssH3SmartProfile] as const;

export const listModbusProfileIds = (): string[] => modbusProfiles.map((profile) => profile.id);

export const getModbusProfile = (modelName: string | undefined): ModbusRegisterProfile => {
  const normalizedModel = modelName?.trim().toLowerCase() ?? "";

  return (
    modbusProfiles.find((profile) => {
      const normalizedId = profile.id.toLowerCase();
      const normalizedLabel = profile.label.toLowerCase();
      return normalizedModel === normalizedId || normalizedModel === normalizedLabel;
    }) ?? foxEssH3SmartProfile
  );
};
