import { test, expect } from '@playwright/test';

// Helper: load the TPC-DS example via burger menu
async function loadExample(page) {
    // Accept the confirm dialog when loading example
    page.on('dialog', async (dialog) => {
        await dialog.accept();
    });

    // Navigate to the app and clear localStorage to get a clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Wait for the app to render
    await expect(page.getByRole('navigation').filter({ hasText: 'Open Semantic' })).toBeVisible({ timeout: 10000 });

    // Open burger menu
    const menuButton = page.locator('nav.border-b button').filter({ has: page.locator('svg') }).last();
    await menuButton.click();

    // Click "Load Example" in the dropdown
    await page.getByText('Load Example').click();

    // Wait for the model to load
    await expect(page.locator('input[name="name"]')).toHaveValue('tpcds_retail_model', { timeout: 10000 });
}

test.describe('Open Semantic Editor - TPC-DS Example', () => {

    test('loads the example and shows Overview form', async ({ page }) => {
        await loadExample(page);

        // Verify the Overview heading is shown
        await expect(page.getByText('Overview').first()).toBeVisible();

        // Verify the model name input
        await expect(page.locator('input[name="name"]')).toHaveValue('tpcds_retail_model');

        // Verify the version input
        await expect(page.locator('input[name="version"]')).toHaveValue('0.1.1');

        // Verify description is populated
        const descTextarea = page.locator('textarea[name="description"]');
        await expect(descTextarea).toHaveValue(/TPC-DS retail semantic model/);
    });

    test('navigates to Datasets and verifies 5 datasets are listed', async ({ page }) => {
        await loadExample(page);

        // Navigate to Datasets via sidebar
        await page.getByRole('link', { name: 'Datasets' }).first().click();

        // Wait for datasets list
        await expect(page.getByText('store_sales').first()).toBeVisible();

        // Check each dataset name
        await expect(page.getByText('store_sales').first()).toBeVisible();
        await expect(page.getByText('date_dim').first()).toBeVisible();
        await expect(page.getByText('customer').first()).toBeVisible();
        await expect(page.getByText('item').first()).toBeVisible();
        // "store" is the 5th dataset
        const storeDataset = page.locator('.space-y-2 > div .text-sm.font-medium').filter({ hasText: /^store$/ });
        await expect(storeDataset).toBeVisible();
    });

    test('clicks into a dataset and checks fields are shown', async ({ page }) => {
        await loadExample(page);

        // Navigate to Datasets
        await page.getByRole('link', { name: 'Datasets' }).first().click();
        await expect(page.getByText('store_sales').first()).toBeVisible();

        // Click on the store_sales dataset row
        await page.locator('.space-y-2 > div').filter({ hasText: 'store_sales' }).first().click();

        // Should navigate to dataset detail page
        await expect(page.getByText('Dataset: store_sales')).toBeVisible();

        // Verify fields heading
        await expect(page.getByText('Fields')).toBeVisible();

        // Check some fields are listed
        await expect(page.getByText('ss_sold_date_sk').first()).toBeVisible();
        await expect(page.getByText('ss_item_sk').first()).toBeVisible();
        await expect(page.getByText('ss_sales_price').first()).toBeVisible();
    });

    test('navigates to Relationships and checks 4 relationships', async ({ page }) => {
        await loadExample(page);

        // Navigate to Relationships via sidebar
        await page.getByRole('link', { name: 'Relationships' }).click();

        // Verify all 4 relationships
        await expect(page.getByText('store_sales_to_date').first()).toBeVisible();
        await expect(page.getByText('store_sales_to_customer').first()).toBeVisible();
        await expect(page.getByText('store_sales_to_item').first()).toBeVisible();
        await expect(page.getByText('store_sales_to_store').first()).toBeVisible();

        // Verify count
        const relationshipCards = page.locator('.space-y-4 > .border.border-gray-200.rounded-lg');
        await expect(relationshipCards).toHaveCount(4);
    });

    test('navigates to Metrics and checks 5 metrics', async ({ page }) => {
        await loadExample(page);

        // Navigate to Metrics via sidebar
        await page.getByRole('link', { name: 'Metrics' }).click();

        // Verify all 5 metrics
        await expect(page.getByText('total_sales').first()).toBeVisible();
        await expect(page.getByText('total_profit').first()).toBeVisible();
        await expect(page.getByText('customer_lifetime_value').first()).toBeVisible();
        await expect(page.getByText('sales_by_brand').first()).toBeVisible();
        await expect(page.getByText('store_productivity').first()).toBeVisible();

        // Verify count
        const metricCards = page.locator('.space-y-4 > .border.border-gray-200.rounded-lg');
        await expect(metricCards).toHaveCount(5);
    });

    test('switches to YAML view and verifies YAML content', async ({ page }) => {
        await loadExample(page);

        // Click the YAML view button
        await page.getByRole('button', { name: 'YAML' }).click();

        // Wait for Monaco editor
        await expect(page.locator('.monaco-editor')).toBeVisible({ timeout: 15000 });

        // Verify content contains model name
        const editorContent = page.locator('.monaco-editor .view-lines');
        await expect(editorContent).toContainText('tpcds_retail_model', { timeout: 10000 });
    });

    test('switches to Diagram view and checks it renders', async ({ page }) => {
        await loadExample(page);

        // Close the preview panel (on by default) so diagram has full space
        await page.getByRole('button', { name: /Preview/ }).click();
        await page.waitForTimeout(300);

        // Click the Diagram view button
        await page.getByRole('button', { name: 'Diagram' }).click();

        // Wait for ReactFlow to render
        await expect(page.locator('.react-flow')).toBeVisible({ timeout: 10000 });

        // Check that dataset nodes are rendered (5 datasets = 5 nodes)
        await expect(page.locator('.react-flow__node')).toHaveCount(5, { timeout: 10000 });

        // Check that edges are rendered (4 relationships = 4 edges)
        await expect(page.locator('.react-flow__edge')).toHaveCount(4, { timeout: 10000 });
    });

    test('switches to Preview and verifies model content', async ({ page }) => {
        await loadExample(page);

        // The Preview panel is visible by default (isPreviewVisible: true in store defaults)
        // So we should already see it without clicking

        // Wait for preview panel to show model content
        await expect(page.getByText('Semantic Model Preview')).toBeVisible({ timeout: 5000 });

        // Verify model name in preview
        await expect(page.getByText('tpcds_retail_model')).toBeVisible();

        // Verify sections
        await expect(page.getByText('Datasets (5)')).toBeVisible();
        await expect(page.getByText('Relationships (4)')).toBeVisible();
        await expect(page.getByText('Metrics (5)')).toBeVisible();
    });

    test('tests the Validation panel', async ({ page }) => {
        await loadExample(page);

        // Close preview first (it's on by default), then open validation
        await page.getByRole('button', { name: /Preview/ }).click();
        await page.waitForTimeout(200);

        // Click the Validation button
        await page.getByRole('button', { name: /Validation/ }).click();

        // The validation panel should show either issues or "No issues found"
        const validationPanel = page.locator('.bg-gray-50').filter({ hasText: /No issues found|Problems/ });
        await expect(validationPanel.first()).toBeVisible({ timeout: 10000 });
    });
});
