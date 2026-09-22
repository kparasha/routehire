import { test, expect } from "@playwright/test";

test("home shows live match count for prefs", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("live-match-count")).toBeVisible();
  await expect(page.getByRole("button", { name: /Chat to find seats/i })).toBeVisible();
});

test("jobs page shows bonus and home-daily badges", async ({ page }) => {
  await page.goto("/jobs");
  await expect(page.getByRole("heading", { name: "Open seats we place into" })).toBeVisible();
  await expect(page.locator(".chip-home").first()).toBeVisible();
});

async function answerSelect(page: import("@playwright/test").Page, option: string) {
  await page.locator("select").selectOption(option);
  await page.getByTestId("intake-next").click();
}

async function answerText(page: import("@playwright/test").Page, text: string) {
  const input = page.getByTestId("intake-input");
  await expect(input).toBeVisible();
  await input.fill(text);
  await page.getByTestId("intake-next").click();
}

async function skipOptional(page: import("@playwright/test").Page) {
  await expect(page.getByTestId("intake-next")).toBeEnabled();
  await page.getByTestId("intake-next").click();
}

test("agentic intake completes for dispatch path", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/intake");
  await page.getByRole("button", { name: /Start/ }).click();
  await expect(page.getByTestId("agent-chat")).toBeVisible();
  await expect(page.getByText(/what kind of seat|what job/i)).toBeVisible();

  await answerSelect(page, "dispatch");
  await expect(page.getByText(/first name/i)).toBeVisible();
  await answerText(page, "Sam");
  await expect(page.getByText(/ZIP|local seats/i)).toBeVisible();
  await answerText(page, "10001");
  await expect(page.getByText(/ops or dispatch|Years in dispatch/i)).toBeVisible();
  await answerText(page, "4");
  await expect(page.getByText(/schedule|home daily/i).first()).toBeVisible();
  await page.getByTestId("intake-next").click(); // schedule default
  await expect(page.getByText(/pay/i).first()).toBeVisible();
  await page.getByTestId("intake-next").click(); // pay default
  await expect(page.getByText(/mobile|number/i)).toBeVisible();
  await answerText(page, "555-0100");
  await expect(page.getByText(/Email/i)).toBeVisible();
  await skipOptional(page);

  await expect(page.getByTestId("intake-complete")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId("match-count")).toContainText("seat");
  await expect(page.getByText("What happens next")).toBeVisible();
  await expect(page.locator(".next-ticks .tick").first()).toBeVisible();
});

test("hauler hire shows contingent fee", async ({ page }) => {
  await page.goto("/hauler");
  await page.getByRole("button", { name: /Quote flat fee/ }).first().click();
  await expect(page.getByTestId("hire-fee")).toBeVisible();
});

test("MCP page shows Claude custom connector name and remote URL", async ({ page }) => {
  await page.goto("/hauler/mcp");
  await expect(page.getByRole("heading", { name: /Add RouteHire in Claude/i })).toBeVisible();
  await expect(page.getByTestId("mcp-name")).toHaveText("RouteHire");
  await expect(page.getByTestId("mcp-url")).toContainText("/api/mcp");
  await expect(page.getByTestId("mcp-url")).not.toContainText("127.0.0.1");
  await expect(page.getByRole("button", { name: /Copy MCP URL/i })).toBeVisible();
});
