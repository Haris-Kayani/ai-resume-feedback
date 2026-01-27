import fs from 'fs/promises';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';
function normalizeText(input) {
    return input
        .replace(/\r\n/g, '\n')
        .replace(/\t/g, ' ')
        .replace(/\u00a0/g, ' ')
        .replace(/[ ]{2,}/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}
export async function extractTextFromPdf(filePath) {
    const buf = await fs.readFile(filePath);
    try {
        const parsed = await pdf(buf);
        const normalized = normalizeText(parsed.text || '');
        if (normalized)
            return { text: normalized };
    }
    catch (e) {
        console.error('Failed to parse PDF using pdf-parse:', e);
    }
    const raw = buf.toString('latin1');
    const matches = [...raw.matchAll(/\(([^()]{3,200})\)/g)]
        .map((m) => m[1])
        .filter((s) => /[A-Za-z]{3}/.test(s))
        .slice(0, 200);
    return { text: normalizeText(matches.join(' ')) };
}
export async function extractTextFromDocx(filePath) {
    try {
        const buf = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer: buf });
        return { text: normalizeText(result.value || '') };
    }
    catch {
        return { text: '' };
    }
}
//# sourceMappingURL=textExtraction.js.map