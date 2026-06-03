const { test, expect } = require('@playwright/test');

/**
 * Concrete E2E Test Example for Demo Login Feature
 * Contract Reference: contracts/ui/auth/login-screen-contract.json
 * Mockup Reference: .planning/features/auth/mockup-login.png
 */
test.describe('UI-AUTH-LOGIN Contract Implementation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the demo app's login page (replace with actual dev server URL in real projects)
    // For this harness template, we intercept the route to mock a UI
    await page.route('**/login', route => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <form id="login-form">
                <input type="email" id="email" required />
                <input type="password" id="password" required minlength="8" />
                <button type="submit" id="sign-in-btn" disabled>Sign In</button>
                <button type="button" id="google-btn">Sign in with Google</button>
              </form>
              <div id="error-msg" style="display: none;"></div>
              <script>
                const email = document.getElementById('email');
                const pwd = document.getElementById('password');
                const btn = document.getElementById('sign-in-btn');
                const checkValid = () => {
                  btn.disabled = !(email.value.includes('@') && pwd.value.length >= 8);
                };
                email.addEventListener('input', checkValid);
                pwd.addEventListener('input', checkValid);
              </script>
            </body>
          </html>
        `
      });
    });
    
    await page.goto('http://localhost:3000/login');
  });

  test('Initial state: fields are empty and submit button is disabled', async ({ page }) => {
    const emailInput = page.locator('#email');
    const pwdInput = page.locator('#password');
    const submitBtn = page.locator('#sign-in-btn');

    await expect(emailInput).toBeEmpty();
    await expect(pwdInput).toBeEmpty();
    await expect(submitBtn).toBeDisabled();
  });

  test('Valid state: entering valid email and password enables submit button', async ({ page }) => {
    const emailInput = page.locator('#email');
    const pwdInput = page.locator('#password');
    const submitBtn = page.locator('#sign-in-btn');

    await emailInput.fill('user@example.com');
    await pwdInput.fill('securepassword123');

    await expect(submitBtn).toBeEnabled();
  });
});
