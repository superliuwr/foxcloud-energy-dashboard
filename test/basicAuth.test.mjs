import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  hasMatchingCredential,
  parseBasicAuthHeader,
  safeEqual,
} from "../dist/lib/basicAuth.js";

const basicHeader = (value) => `Basic ${Buffer.from(value).toString("base64")}`;

describe("Basic Auth helpers", () => {
  it("returns null when no Basic Auth header is present", () => {
    assert.equal(parseBasicAuthHeader(undefined), null);
    assert.equal(parseBasicAuthHeader("Bearer token"), null);
  });

  it("parses username and password", () => {
    assert.deepEqual(parseBasicAuthHeader(basicHeader("alice:secret")), {
      username: "alice",
      password: "secret",
    });
  });

  it("keeps colons inside passwords", () => {
    assert.deepEqual(parseBasicAuthHeader(basicHeader("alice:secret:with:colons")), {
      username: "alice",
      password: "secret:with:colons",
    });
  });

  it("returns null when the decoded value has no separator", () => {
    assert.equal(parseBasicAuthHeader(basicHeader("alice")), null);
  });

  it("matches credentials with constant-time comparison helper", () => {
    const credentials = [{ username: "alice", password: "secret:with:colons" }];

    assert.equal(hasMatchingCredential(credentials, "alice", "secret:with:colons"), true);
    assert.equal(hasMatchingCredential(credentials, "alice", "wrong"), false);
    assert.equal(safeEqual("same", "same"), true);
    assert.equal(safeEqual("same", "different"), false);
  });
});
