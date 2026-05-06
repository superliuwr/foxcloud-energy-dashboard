import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  FoxCloudApiError,
  FoxCloudClient,
} from "../dist/lib/foxcloudClient.js";

const originalFetch = globalThis.fetch;

const createClient = () =>
  new FoxCloudClient({
    apiKey: "test-api-key",
    baseUrl: "https://foxcloud.test",
    timeoutMs: 1000,
    retryAttempts: 2,
    retryBaseDelayMs: 0,
  });

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("FoxCloudClient retry handling", () => {
  it("retries transient network failures", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;

      if (calls === 1) {
        throw new Error("temporary network problem");
      }

      return jsonResponse({
        errno: 0,
        result: { currentPage: 1, pageSize: 100, total: 0, data: [] },
      });
    };

    const result = await createClient().getDeviceList();

    assert.equal(calls, 2);
    assert.equal(result.total, 0);
  });

  it("retries HTTP 429 rate-limit responses", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;

      if (calls === 1) {
        return jsonResponse({ errno: 0, msg: "Too many requests", result: null }, 429);
      }

      return jsonResponse({
        errno: 0,
        result: { currentPage: 1, pageSize: 100, total: 1, data: [] },
      });
    };

    const result = await createClient().getDeviceList();

    assert.equal(calls, 2);
    assert.equal(result.total, 1);
  });

  it("does not retry FoxCloud application errors on successful HTTP responses", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      return jsonResponse({ errno: 10001, msg: "Invalid token", result: null });
    };

    await assert.rejects(
      () => createClient().getDeviceList(),
      (error) =>
        error instanceof FoxCloudApiError &&
        error.errno === 10001 &&
        error.message === "Invalid token",
    );
    assert.equal(calls, 1);
  });

  it("stops after the configured retry limit", async () => {
    let calls = 0;
    globalThis.fetch = async () => {
      calls += 1;
      throw new Error("still down");
    };

    await assert.rejects(
      () => createClient().getDeviceList(),
      /FoxCloud request failed: still down/,
    );
    assert.equal(calls, 3);
  });
});
