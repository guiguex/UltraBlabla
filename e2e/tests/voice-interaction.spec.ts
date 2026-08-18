import { test, expect } from '@playwright/test';

test.describe('UltraBlabla Voice Interaction Simulation - RED TEAMING', () => {

  test('should survive intense dissonance and stress testing', async ({ page }) => {
    // 1. Setup error logging
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    await page.evaluate(() => {
      window['audioBugs'] = [];
      window.addEventListener('error', (e) => {
        window['audioBugs'].push(e.message);
      });
      window.addEventListener('unhandledrejection', (e) => {
        window['audioBugs'].push(e.reason ? e.reason.toString() : 'Unhandled Promise Rejection');
      });
    });

    // 2. Load the page
    console.log('Loading UltraBlabla...');
    await page.goto('/');
    
    // Attendre que Cloudflare / l'app réponde
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-results/01-initial-load.png' });

    // 3. Initiate Voice interaction
    console.log('Starting Voice Capture (injecting fake mic)...');
    const recordBtn = page.locator('#recordBtn');
    
    // Si la page a crashé à cause de Cloudflare (Error 502), le bouton n'existera pas.
    // On vérifie s'il est là pour ne pas faire planter Playwright sans avoir pris le screenshot.
    if (await recordBtn.isVisible()) {
      // Simuler des clics frénétiques (Dissonance UI)
      console.log('Spam clicking record button...');
      await recordBtn.click();
      await recordBtn.click();
      await recordBtn.click();
      
      await page.waitForTimeout(2000); // L'audio fake commence à jouer
      
      // 4. State Dissonance (Voix + Texte en même temps)
      console.log('Inducing State Dissonance (Voice + Text conflicts)...');
      const toggleBtn = page.locator('#chatToggleBtn');
      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        await page.waitForTimeout(500);
        
        const neuralInput = page.locator('#neuralInput');
        const sendBtn = page.locator('#neuralSendBtn');
        
        for (let i = 0; i < 5; i++) {
          await neuralInput.fill(`Dissonance test payload ${i}`);
          if (await sendBtn.isEnabled()) {
             await sendBtn.click();
          }
        }
      }
      
      await page.screenshot({ path: 'test-results/02-dissonance-state.png' });

      // 5. Network Dissonance (Coupure internet brutale)
      console.log('Simulating Network Failure mid-processing...');
      await page.context().setOffline(true);
      await page.waitForTimeout(3000); // Attendre la réaction de l'UI
      
      await page.screenshot({ path: 'test-results/03-offline-state.png' });
      
      // Rétablir le réseau
      await page.context().setOffline(false);
      await page.waitForTimeout(2000);
    } else {
      console.log('Record button not found. The app might be down (e.g., Cloudflare 502).');
    }

    // 6. Verify Robustness
    console.log('Verifying System Resilience...');
    const audioBugs = await page.evaluate(() => window['audioBugs']);
    
    console.log('Captured unhandled errors during Red Teaming:', audioBugs);
    console.log('Captured console errors:', consoleLogs);

    await page.screenshot({ path: 'test-results/04-final-recovery.png' });
    
    const titleVisible = await page.locator('.holo-title').isVisible();
    expect(titleVisible, 'The main UI should still be visible and not completely crashed.').toBeTruthy();
  });

});
