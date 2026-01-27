export function getEnvNumber(name, fallback) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
}
export function getBaseUrl(req) {
    const host = req.get('host') || 'localhost';
    return `${req.protocol}://${host}`;
}
//# sourceMappingURL=http.js.map