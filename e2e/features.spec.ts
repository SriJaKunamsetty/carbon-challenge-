import { test, expect } from "@playwright/test";

test.describe("Problem statement alignment", () => {
  test("landing page communicates understand, track, and reduce pillars", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText(/AI Daily Log/i)).toBeVisible();
    await expect(page.getByText(/Carbon Digital Twin/i)).toBeVisible();
    await expect(page.getByText(/AI Sustainability Coach/i)).toBeVisible();
    await expect(page.getByText(/Beautiful Analytics/i)).toBeVisible();
  });

  test("landing page exposes sign-in entry point for tracking flow", async ({ page }) => {
    await page.goto("/");
    const signInLink = page.getByRole("link", { name: /Sign In/i }).first();
    await expect(signInLink).toBeVisible();
    await signInLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
