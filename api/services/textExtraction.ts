import fs from 'fs/promises'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

export type ExtractedText = {
  text: string
}

function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function extractTextFromPdf(filePath: string): Promise<ExtractedText> {
  const buf = await fs.readFile(filePath)

  try {
    const parsed = await pdf(buf)
    const normalized = normalizeText(parsed.text || '')
    if (normalized) return { text: normalized }
  } catch (e) {
    console.error(`Failed to parse PDF using pdf-parse for file "${filePath}":`, e)
  }

  // Fallback PDF text extraction:
  // - When `pdf-parse` fails (throws) or returns no useful text, we make a
  //   best-effort attempt to recover readable content directly from the
  //   underlying PDF bytes.
  // - We decode the buffer using `latin1` because in Node.js this performs a
  //   direct 1:1 mapping of bytes to the first 256 Unicode code points. This
  //   preserves the raw byte values while still allowing us to run regular
  //   expressions over the data. We are primarily trying to recover ASCII /
  //   Latin letters embedded in the file, so this is sufficient and avoids
  //   throwing away information that a stricter encoding (like UTF‑8) might.
  // - The regex searches for PDF literal string objects of the form
  //   `(some text)`. We then:
  //     * Extract the inner text for each match.
  //     * Filter to strings that contain at least 3 A–Z characters to discard
  //       most binary/structural noise.
  //     * Limit the number of strings we keep to avoid producing extremely
  //       large outputs for very noisy files.
  // - This is intentionally a heuristic, last-resort path for malformed or
  //   highly non‑standard PDFs and should not be considered equivalent in
  //   fidelity to the primary `pdf-parse` based extraction above.
  const raw = buf.toString('latin1')
  const matches = [...raw.matchAll(/\(([^()]{3,200})\)/g)]
    .map((m) => m[1])
    .filter((s) => /[A-Za-z]{3}/.test(s))
    .slice(0, 200)
  return { text: normalizeText(matches.join(' ')) }
}

export async function extractTextFromDocx(filePath: string): Promise<ExtractedText> {
  try {
    const buf = await fs.readFile(filePath)
    const result = await mammoth.extractRawText({ buffer: buf })
    return { text: normalizeText(result.value || '') }
  } catch {
    return { text: '' }
  }
}
