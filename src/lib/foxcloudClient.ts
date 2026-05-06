import { createHash } from "node:crypto";

import type {
  FoxCloudDeviceListResponse,
  FoxCloudEnvelope,
  FoxCloudGenerationSummary,
  FoxCloudHistoryDeviceResult,
  FoxCloudPlantDetail,
  FoxCloudRealtimeDeviceResult,
  FoxCloudReportSeries,
} from "../types/foxcloud.js";

type HttpMethod = "GET" | "POST";

interface FoxCloudClientOptions {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
  retryAttempts?: number;
  retryBaseDelayMs?: number;
}

interface RequestOptions {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number>;
}

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const delay = (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, durationMs);
  });

export class FoxCloudApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly errno?: number,
  ) {
    super(message);
    this.name = "FoxCloudApiError";
  }
}

export class FoxCloudClient {
  constructor(private readonly options: FoxCloudClientOptions) {}

  async getDeviceList(): Promise<FoxCloudDeviceListResponse> {
    return this.request<FoxCloudDeviceListResponse>({
      method: "POST",
      path: "/op/v0/device/list",
      body: {
        currentPage: 1,
        pageSize: 100,
      },
    });
  }

  async getRealtimeData(sn: string, variables: string[]): Promise<FoxCloudRealtimeDeviceResult[]> {
    return this.request<FoxCloudRealtimeDeviceResult[]>({
      method: "POST",
      path: "/op/v0/device/real/query",
      body: {
        sn,
        variables,
      },
    });
  }

  async getReport(params: {
    sn: string;
    year: number;
    month: number;
    dimension: "month";
    variables: string[];
  }): Promise<FoxCloudReportSeries[]> {
    return this.request<FoxCloudReportSeries[]>({
      method: "POST",
      path: "/op/v0/device/report/query",
      body: params,
    });
  }

  async getHistory(params: {
    sn: string;
    variables: string[];
    begin: number;
    end: number;
  }): Promise<FoxCloudHistoryDeviceResult[]> {
    return this.request<FoxCloudHistoryDeviceResult[]>({
      method: "POST",
      path: "/op/v0/device/history/query",
      body: params,
    });
  }

  async getGeneration(sn: string): Promise<FoxCloudGenerationSummary> {
    return this.request<FoxCloudGenerationSummary>({
      method: "GET",
      path: "/op/v0/device/generation",
      query: { sn },
    });
  }

  async getPlantDetail(stationId: string): Promise<FoxCloudPlantDetail> {
    return this.request<FoxCloudPlantDetail>({
      method: "GET",
      path: "/op/v0/plant/detail",
      query: { id: stationId },
    });
  }

  private buildHeaders(path: string): Record<string, string> {
    const timestamp = Date.now().toString();
    const signature = createHash("md5")
      .update(`${path}\\r\\n${this.options.apiKey}\\r\\n${timestamp}`)
      .digest("hex");

    return {
      token: this.options.apiKey,
      timestamp,
      signature,
      lang: "en",
      "User-Agent": "foxcloud-energy-dashboard/0.1.0",
    };
  }

  private async request<T>({ method, path, body, query }: RequestOptions): Promise<T> {
    const retryAttempts = Math.max(0, this.options.retryAttempts ?? 2);
    let lastError: FoxCloudApiError | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt += 1) {
      try {
        return await this.requestOnce<T>({ method, path, body, query });
      } catch (error) {
        if (!(error instanceof FoxCloudApiError)) {
          throw error;
        }

        lastError = error;

        if (!this.shouldRetry(error, attempt, retryAttempts)) {
          throw error;
        }

        await delay(this.retryDelayMs(attempt));
      }
    }

    throw lastError ?? new FoxCloudApiError("FoxCloud request failed.", 502);
  }

  private shouldRetry(error: FoxCloudApiError, attempt: number, retryAttempts: number): boolean {
    if (attempt >= retryAttempts) {
      return false;
    }

    // FoxCloud application errors on HTTP 200 are not transient network failures.
    if (error.errno !== undefined && error.statusCode === 502) {
      return false;
    }

    return RETRYABLE_STATUS_CODES.has(error.statusCode);
  }

  private retryDelayMs(attempt: number): number {
    const baseDelayMs = Math.max(0, this.options.retryBaseDelayMs ?? 250);
    return baseDelayMs * 2 ** attempt;
  }

  private async requestOnce<T>({ method, path, body, query }: RequestOptions): Promise<T> {
    const url = new URL(path, this.options.baseUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, String(value));
      }
    }

    const headers = this.buildHeaders(path);

    if (method === "POST") {
      headers["Content-Type"] = "application/json";
    }

    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(this.options.timeoutMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown network error";
      throw new FoxCloudApiError(`FoxCloud request failed: ${message}`, 502);
    }

    const rawText = await response.text();
    let payload: FoxCloudEnvelope<T>;

    try {
      payload = JSON.parse(rawText) as FoxCloudEnvelope<T>;
    } catch {
      throw new FoxCloudApiError(
        `FoxCloud returned a non-JSON response: ${rawText.slice(0, 200)}`,
        response.status,
      );
    }

    if (!response.ok) {
      throw new FoxCloudApiError(
        payload.msg || `FoxCloud request failed with HTTP ${response.status}.`,
        response.status,
        payload.errno,
      );
    }

    if (typeof payload.errno === "number" && payload.errno !== 0) {
      throw new FoxCloudApiError(
        payload.msg || "FoxCloud returned an application error.",
        response.ok ? 502 : response.status,
        payload.errno,
      );
    }

    return payload.result;
  }
}
