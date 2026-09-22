import { test, expect } from "@playwright/test";

test("jobs page shows bonus and urgent badges", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Open roles" })).toBeVisible();
  await expect(page.locator(".chip-bonus").first()).toBeVisible();
  await expect(page.locator(".chip-urgent").first()).toBeVisible();
});

test("intake completes without resume upload", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/intake");
  await page.getByRole("button", { name: "Start questionnaire" }).click();
  await expect(page.getByTestId("intake-next")).toBeVisible();
  while (!(await page.getByTestId("intake-complete").isVisible().catch(() => false))) {
    const heading = await page.locator("h1").textContent();
    if (heading?.includes("ZIP")) {
      await page.locator("input").fill("30301");
    }
    const next = page.getByTestId("intake-next");
    await expect(next).toBeEnabled({ timeout: 20_000 });
    await next.click();
    await page.waitForTimeout(300);
  }
  await expect(page.getByTestId("intake-complete")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("match-count")).toContainText("open role");
});

test("hauler hire shows contingent fee", async ({ page }) => {
  await page.goto("/hauler");
  await page.getByRole("button", { name: "Mark hire (demo)" }).first().click();
  await expect(page.getByTestId("hire-fee")).toBeVisible();
  await expect(page.getByTestId("hire-fee")).toContainText("Contingent fee");
});
