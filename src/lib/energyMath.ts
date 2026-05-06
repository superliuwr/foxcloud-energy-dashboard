export interface PowerSample {
  sampledAt: string | number | Date;
  kw: number | null | undefined;
}

export interface IntegratePowerOptions {
  maxGapHours?: number;
  decimals?: number;
}

export const roundEnergy = (value: number | null | undefined, decimals = 2): number => {
  const normalized = Number(value ?? 0);
  return Number(normalized.toFixed(decimals));
};

const toTimeMs = (value: string | number | Date): number => {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  return new Date(value).getTime();
};

const toPositiveKw = (value: number | null | undefined): number => {
  const normalized = Number(value ?? 0);
  return Number.isFinite(normalized) ? Math.max(normalized, 0) : 0;
};

export const integratePowerSamples = (
  samples: PowerSample[],
  options: IntegratePowerOptions = {},
): number => {
  const maxGapHours = options.maxGapHours ?? 1;
  const decimals = options.decimals ?? 2;
  const points = samples
    .map((sample) => ({
      timeMs: toTimeMs(sample.sampledAt),
      kw: toPositiveKw(sample.kw),
    }))
    .filter((sample) => Number.isFinite(sample.timeMs))
    .sort((first, second) => first.timeMs - second.timeMs);

  if (points.length < 2) {
    return 0;
  }

  const total = points.slice(1).reduce((accumulator, point, index) => {
    const previous = points[index];
    const hours = (point.timeMs - previous.timeMs) / 3_600_000;

    if (hours <= 0 || hours > maxGapHours) {
      return accumulator;
    }

    const averageKw = (previous.kw + point.kw) / 2;
    return accumulator + averageKw * hours;
  }, 0);

  return roundEnergy(total, decimals);
};
