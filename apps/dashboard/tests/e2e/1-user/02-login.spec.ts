import { expect, test } from "@playwright/test";

import { clearDB, connectTestDB, createUser } from "../../utils/db";

test.describe("pm2.web login", () => {
  test.beforeAll(async () => {
    connectTestDB();
  });

  test.beforeEach(async ({ page }) => {
    await clearDB();
    await createUser({
      name: "example",
      email: "mail@example.com",
      password: "mail@example.com",
    });
    await page.goto("/login");
  });

  test("Email / Password Input should be visible", async ({ page }) => {
    await expect(page.locator(`input[name="email"]`)).toHaveAttribute("placeholder", "mail@example.com");
    await expect(page.locator(`input[name="password"]`)).toHaveAttribute("placeholder", "Your password");
  });

  test("Valid Credentials", async ({ page }) => {
    await page.fill(`input[name="email"]`, "mail@example.com");
    await page.fill(`input[name="password"]`, "mail@example.com");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await page.waitForURL("http://localhost:3000/");
    expect(page.url()).toBe("http://localhost:3000/");
  });

  test("Invalid Credentials", async ({ page }) => {
    await page.fill(`input[name="email"]`, "mail@example.com");
    await page.fill(`input[name="password"]`, "INVALID");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page.getByText("The password you entered is incorrect. Please try again.")).toBeVisible();
  });
});
