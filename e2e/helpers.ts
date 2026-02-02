import { expect, type Page } from '@playwright/test'

export function uniqueEmail(prefix = 'e2e'): string {
  const rand = Math.random().toString(16).slice(2)
  return `${prefix}-${Date.now()}-${rand}@example.com`
}

export async function registerAndEnterWorkspace(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible({ timeout: 20_000 })
  
  await page.getByLabel(/Email/i).fill(email)
  await page.getByLabel(/Password/i).fill(password)
  
  // Wait for the register response to ensure the action completes
  const req = page.waitForResponse((r) => r.url().includes('/api/auth/register') && r.request().method() === 'POST')
  await page.getByRole('button', { name: 'Create an account' }).click()
  const res = await req
  expect(res.status()).toBe(200)
  
  await expect(page).toHaveURL(/\/app$/, { timeout: 30_000 })
  await expect(page.getByText('Resume Fix').first()).toBeVisible()
}

export async function createJobDescription(page: Page, title: string, text: string): Promise<void> {
  await page.getByRole('button', { name: '+' }).click()
  await expect(page.getByText('Job Title')).toBeVisible()
  await page.getByPlaceholder('e.g., Senior Software Engineer').fill(title)
  await page.getByPlaceholder('Paste or type the job description here...').fill(text)
  await page.getByRole('button', { name: 'Add Job Description' }).click()
  await expect(page.getByText('Saving…')).toHaveCount(0, { timeout: 20_000 })
}

export async function uploadMinimalPdf(page: Page, filename = 'resume.pdf'): Promise<void> {
  const fakePdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\nstream\n(React Node MongoDB Docker TypeScript)\nendstream\ntrailer\n<<>>\n%%EOF')
  await page.setInputFiles('input[type="file"]', {
    name: filename,
    mimeType: 'application/pdf',
    buffer: fakePdf,
  })
}
