import { expect, type Page } from '@playwright/test'

export function uniqueEmail(prefix = 'e2e'): string {
  const rand = Math.random().toString(16).slice(2)
  return `${prefix}-${Date.now()}-${rand}@example.com`
}

export async function registerAndEnterWorkspace(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/signup')
  await expect(page.getByRole('heading', { name: 'Create an account' })).toBeVisible({ timeout: 20_000 })
  await page.getByLabel('Email address').fill(email)
  await page.getByLabel('Password').fill(password)
  const req = page.waitForResponse((r) => r.url().includes('/api/auth/register') && r.request().method() === 'POST')
  await page.getByRole('button', { name: 'Create an account', exact: true }).click()
  const res = await req
  expect(res.status()).toBe(200)
  await expect(page).toHaveURL(/\/app$/, { timeout: 60_000 })
  await expect(page.getByText('Workspace')).toBeVisible()
}

export async function createJobDescription(page: Page, title: string, text: string): Promise<void> {
  await page.getByRole('button', { name: 'New' }).click()
  await expect(page.getByText('Editing:')).toBeVisible()
  await page.getByPlaceholder('Role title').fill(title)

  const editor = page.locator('[contenteditable="true"]').first()
  await editor.click()
  await editor.fill('')
  await editor.type(text)
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
