/**
 * Client-side saltFingerprint builder — mirrors server/models/Medicine.js pre-save logic.
 * For display/debug only. The canonical fingerprint lives in the DB.
 */

const normalizeStr = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')

/**
 * @param {Array<{name: string, strength: string}>} salts
 * @returns {string}
 */
export const buildFingerprint = (salts) =>
  salts.map((s) => `${normalizeStr(s.name)}_${s.strength}`).sort().join('|')

export default buildFingerprint
