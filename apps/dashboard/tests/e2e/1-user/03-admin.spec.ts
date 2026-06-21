import { expect, type Page,test } from "@playwright/test";

import { clearDB, connectTestDB, createUser } from "../../utils/db";

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill(`input[name="email"]`, email);
  await page.fill(`input[name="password"]`, password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForURL("http://localhost:3000/");
  expect(page.url()).toBe("http://localhost:3000/");
}

test.describe("pm2.web user administration", () => {
  const userConfig = [
    { admin: true, owner: true },
    { admin: true, owner: false },
    { admin: false, owner: false },
  ];

  function getUser(idx: number) {
    return {
      name: `example${idx}`,
      email: `mail${idx}@example.com`,
      password: `mail${idx}@example.com`,
      ...userConfig[idx],
    };
  }

  test.beforeAll(async () => {
    connectTestDB();
  });

  test.beforeEach(async ({ page }) => {
    await clearDB();
    for (let i = 0; i < userConfig.length; i++) {
      await createUser(getUser(i));
    }
    await page.goto("/");
  });

  test("it should have 3 users with name, email, role", async ({ page }) => {
    const user = getUser(0);
    await login(page, user.email, user.password);
    await page.goto("/user");
    
    await expect(page.locator('[data-cy="user-item-email"]')).toHaveCount(userConfig.length);

    for (let i = 0; i < userConfig.length; i++) {
      const u = getUser(i);
      const role = u.owner ? "OWNER" : u.admin ? "ADMIN" : "NONE";

      await expect(page.locator('[data-cy="user-item-email"]').filter({ hasText: u.email })).toBeVisible();
      await expect(page.locator('[data-cy="user-item-name"]').filter({ hasText: u.name })).toBeVisible();
      
      const select = page.locator(`[data-cy-id="${u.email}"] * > [data-cy="user-item-select"]`);
      if (u.admin || u.owner) {
        await expect(select).toBeDisabled();
      } else {
        await expect(select).toBeEnabled();
      }
      
      const roleSelect = page.locator(`[data-cy-id="${u.email}"] * > [data-cy="user-item-role"]`);
      await expect(roleSelect).toHaveValue(role);
    }
  });

  test.describe("Delete User with OWNER Permission", () => {
    const user = getUser(0);

    test.beforeEach(async ({ page }) => {
      await login(page, user.email, user.password);
      await page.goto("/user");
    });

    test("it should delete user", async ({ page }) => {
      const u = getUser(2);
      await page.locator(`[data-cy-id="${u.email}"] * > [data-cy="user-item-delete"]`).click();
      await expect(page.locator(`[data-cy-id="${u.email}"]`)).toHaveCount(0);
      
      // should show notification
      await expect(page.getByText(`Deleted User: ${u.name}`)).toBeVisible();
      await expect(page.getByText(`User deleted successfully`)).toBeVisible();
    });

    test("should not be able to delete owner", async ({ page }) => {
      await page.locator(`[data-cy-id="${user.email}"] * > [data-cy="user-item-delete"]`).click();
      await expect(page.locator(`[data-cy-id="${user.email}"]`)).toBeVisible();
      
      // should show notification
      await expect(page.getByText(`Failed to delete user: ${user.name}`)).toBeVisible();
      await expect(page.getByText(`Owner cannot be deleted`)).toBeVisible();
    });
  });
});
