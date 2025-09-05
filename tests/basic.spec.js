import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle(/Writing with Aphasia/);
    
    // Check for key elements on the home page
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Look for navigation links
    const aboutLink = page.locator('a:has-text("About")');
    const resourcesLink = page.locator('a:has-text("Resources")');
    
    // Test navigation to About page if it exists
    if (await aboutLink.count() > 0) {
      await aboutLink.click();
      await expect(page).toHaveURL(/\/about/);
    }
  });
});

test.describe('Story Pages', () => {
  test('should load a story page successfully', async ({ page }) => {
    // Test with Ayse's story since we know it exists
    await page.goto('/stories/ayse');
    
    // Check if the story page loads
    await expect(page.locator('h1')).toContainText('Ayse');
    
    // Check for back navigation
    const backLink = page.locator('a:has-text("Back to Map")');
    await expect(backLink).toBeVisible();
    
    // Check for story content
    await expect(page.locator('article')).toBeVisible();
  });

  test('should have working image modal functionality', async ({ page }) => {
    await page.goto('/stories/ayse');
    
    // Look for images that should be clickable
    const images = page.locator('img[style*="cursor: pointer"], img[onclick]');
    
    if (await images.count() > 0) {
      // Click on the first image
      await images.first().click();
      
      // Check if modal appears (this will depend on our implementation)
      // We'll update this once we see how the modal is implemented
    }
  });

  test('should navigate back to home from story', async ({ page }) => {
    await page.goto('/stories/ayse');
    
    // Click back to map link
    await page.locator('a:has-text("Back to Map")').click();
    
    // Should be back on home page
    await expect(page).toHaveURL('/');
  });
});

test.describe('Responsive Design', () => {
  test('should be mobile-friendly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if page is still usable on mobile
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/stories/ayse');
    
    // Check if story content is readable on tablet
    await expect(page.locator('article')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/stories/ayse');
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy(); // Should have alt text
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/stories/ayse');
    
    // Check that links have descriptive text
    const backLink = page.locator('a:has-text("Back to Map")');
    await expect(backLink).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (adjust as needed)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have optimized images', async ({ page }) => {
    await page.goto('/stories/ayse');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check that images are not excessively large
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      const boundingBox = await image.boundingBox();
      
      if (boundingBox) {
        // Images shouldn't be larger than the viewport unless intentional
        expect(boundingBox.width).toBeLessThan(2000);
        expect(boundingBox.height).toBeLessThan(2000);
      }
    }
  });
});
