// normalizeDateString.js
// Accepts various frontmatter date formats and normalizes to ISO (YYYY-MM-DD) or returns null.
// Supported inputs:
//  - YYYY-MM-DD (returned as-is if valid)
//  - M-D-YYYY or MM-DD-YYYY (dashes)
//  - M/D/YYYY or MM/DD/YYYY (slashes)
//  - Month D, YYYY (basic English month names short/long)
// Invalid, placeholder (e.g., 'TBD', 'NA', '') => null

const MONTHS = {
  january: 1, jan: 1,
  february: 2, feb: 2,
  march: 3, mar: 3,
  april: 4, apr: 4,
  may: 5,
  june: 6, jun: 6,
  july: 7, jul: 7,
  august: 8, aug: 8,
  september: 9, sep: 9, sept: 9,
  october: 10, oct: 10,
  november: 11, nov: 11,
  december: 12, dec: 12
};

function pad(n) { return n.toString().padStart(2, '0'); }

function isValidYMD(y, m, d) {
  if (!y || !m || !d) return false;
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === m && dt.getUTCDate() === d;
}

function normalizeDateString(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  if (/^(tbd|na|n\/a|none)$/i.test(s)) return null;

  // Already ISO-like YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (isoMatch) {
    const y = +isoMatch[1]; const m = +isoMatch[2]; const d = +isoMatch[3];
    return isValidYMD(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : null;
  }

  // M-D-YYYY or MM-DD-YYYY (dashes)
  let m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s);
  if (m) {
    const month = +m[1]; const day = +m[2]; const year = +m[3];
    return isValidYMD(year, month, day) ? `${year}-${pad(month)}-${pad(day)}` : null;
  }
  // M/D/YYYY or MM/DD/YYYY (slashes)
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) {
    const month = +m[1]; const day = +m[2]; const year = +m[3];
    return isValidYMD(year, month, day) ? `${year}-${pad(month)}-${pad(day)}` : null;
  }

  // Month D, YYYY (English)
  m = /^(January|Jan|February|Feb|March|Mar|April|Apr|May|June|Jun|July|Jul|August|Aug|September|Sept|Sep|October|Oct|November|Nov|December|Dec)\s+(\d{1,2}),\s*(\d{4})$/i.exec(s);
  if (m) {
    const month = MONTHS[m[1].toLowerCase()];
    const day = +m[2];
    const year = +m[3];
    return isValidYMD(year, month, day) ? `${year}-${pad(month)}-${pad(day)}` : null;
  }

  return null; // Unrecognized
}

module.exports = { normalizeDateString };
