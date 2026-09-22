import { describe, expect, it } from "vitest";
import { requireCronSecret } from "../src/lib/auth";

describe("requireCronSecret", () => {
  it("rejects missing auth when CRON_SECRET set", () => {
    const prev = process.env.CRON_SECRET;
    process.env.CRON_SECRET = "test-secret";
    const req = new Request("http://localhost", { method: "POST" });
    expect(requireCronSecret(req)).toBe(false);
    const ok = new Request("http://localhost", {
      headers: { authorization: "Bearer test-secret" },
    });
    expect(requireCronSecret(ok)).toBe(true);
    process.env.CRON_SECRET = prev;
  });
});
