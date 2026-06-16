import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should navigate to login page and display login form', async ({ page }) => {
    await page.goto('/');

    // Look for Get Started or Sign In link
    const signInLink = page.getByRole('link', { name: /Sign In/i }).first();
    await signInLink.click();

    // Verify we are on the login page
    await expect(page).toHaveURL(/\/login/);
    
    // Check if Email and Password inputs exist
    const emailInput = page.getByPlaceholder('Email Address');
    const passwordInput = page.getByPlaceholder('Password');
    const signInButton = page.getByRole('button', { name: 'Sign In' });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(signInButton).toBeVisible();
  });

  test('should show validation error when submitting empty form', async ({ page }) => {
    await page.goto('/login');

    const signInButton = page.getByRole('button', { name: 'Sign In' });
    await signInButton.click();

    // Expect an error message
    const errorMsg = page.locator('text=Email address is required.');
    await expect(errorMsg).toBeVisible();
  });

  test('should switch to sign up mode', async ({ page }) => {
    await page.goto('/login');

    const toggleButton = page.getByRole('button', { name: /Don't have an account\? Sign Up/i });
    await toggleButton.click();

    const nameInput = page.getByPlaceholder('Full Name');
    await expect(nameInput).toBeVisible();

    const signUpButton = page.getByRole('button', { name: 'Create Account' });
    await expect(signUpButton).toBeVisible();
  });

  test('should switch to reset password mode', async ({ page }) => {
    await page.goto('/login');

    const forgotPasswordLink = page.getByRole('button', { name: /Forgot Password\?/i });
    await forgotPasswordLink.click();

    const resetTitle = page.locator('h2:has-text("Reset Password")');
    await expect(resetTitle).toBeVisible();

    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).not.toBeVisible();
  });
});
