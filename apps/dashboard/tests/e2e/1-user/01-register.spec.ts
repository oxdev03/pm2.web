import { expect, test } from "@playwright/test";

import { clearDB, connectTestDB, createUser } from "../../utils/db";

test.describe("pm2.web register", () => {
  test.beforeAll(async () => {
    connectTestDB();
  });

  test.beforeEach(async ({ page }) => {
    await clearDB();
    await page.goto("/login");
  });

  const user = "example";
  const email = "mail@example.com";
  const password = "P@ssw0rd";

  test("Email / Password Input should be visible", async ({ page }) => {
    await page.getByRole("button", { name: "Don't have an account? Register" }).click();
    await expect(page.locator(`input[name="name"]`)).toHaveAttribute("placeholder", "Your name");
    await expect(page.locator(`input[name="email"]`)).toHaveAttribute("placeholder", email);
    await expect(page.locator(`input[name="password"]`)).toHaveAttribute("placeholder", "Your password");
  });

  test("Valid Registration without accepting TOC", async ({ page }) => {
    await page.getByRole("button", { name: "Don't have an account? Register" }).click();
    await page.fill(`input[name="name"]`, user);
    await page.fill(`input[name="email"]`, email);
    await page.fill(`input[name="password"]`, password);
    await page.locator('form').evaluate((form: HTMLFormElement) => form.noValidate = true);
    await page.getByRole("button", { name: "Register", exact: true }).click();
    await expect(page.getByText("You need to accept terms and conditions")).toBeVisible();
  });

  test("Valid Registration with accepting TOC", async ({ page }) => {
    await page.getByRole("button", { name: "Don't have an account? Register" }).click();
    await page.fill(`input[name="name"]`, "example");
    await page.fill(`input[name="email"]`, email);
    await page.fill(`input[name="password"]`, password);
    await page.click(`input[type="checkbox"]`);
    await page.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());
    
    // Playwright checks for exact URL or waitForURL
    await page.waitForURL("http://localhost:3000/");
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("Should not be able to register twice", async ({ page }) => {
    await createUser({
      name: "example",
      email: email,
      password: password,
    });
    await page.getByRole("button", { name: "Don't have an account? Register" }).click();
    await page.fill(`input[name="name"]`, "example");
    await page.fill(`input[name="email"]`, email);
    await page.fill(`input[name="password"]`, password);
    await page.click(`input[type="checkbox"]`);
    await page.locator('form').evaluate(form => (form as HTMLFormElement).requestSubmit());

    await expect(page.locator(".mantine-Alert-message")).toHaveText(
      "An account with the same email address already exists. Please sign in instead."
    );
  });
});
