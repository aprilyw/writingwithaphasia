#!/usr/bin/env node
/**
 * verify-mdx-migration.js
 * Fails (exit 1) if:
 *  - Any import of src/utils/markdown.js appears in src/pages or src/components (excluding this script)
 *  - Any .md file exists in static/md that ALSO has a corresponding MDX file (meaning legacy file linger)
 *  - A story id present only as legacy .md (no MDX version) (warn) unless ALLOW_LEGACY_MD env is set
 */
const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const legacyDir = path.join(projectRoot, 'static/md');
const mdxDir = path.join(projectRoot, 'src/content/stories');
const markdownUtil = path.join(projectRoot, 'src/utils/markdown.js');

let failed = false;
function log(kind, msg) { console.log(`[${kind}] ${msg}`); }

// 1. Scan for imports of legacy markdown util
function scanForLegacyImports() {
  const GLOB_DIRS = ['src/pages', 'src/components', 'src/lib'];
  const needle = "utils/markdown";
  for (const dir of GLOB_DIRS) {
    const abs = path.join(projectRoot, dir);
    if (!fs.existsSync(abs)) continue;
    const stack = [abs];
    while (stack.length) {
      const cur = stack.pop();
      const stat = fs.statSync(cur);
      if (stat.isDirectory()) {
        for (const f of fs.readdirSync(cur)) stack.push(path.join(cur, f));
      } else if (/\.(js|jsx|ts|tsx|mdx)$/.test(cur)) {
        const content = fs.readFileSync(cur, 'utf8');
        if (content.includes(needle)) {
          log('ERROR', `Legacy markdown util imported in ${path.relative(projectRoot, cur)}`);
          failed = true;
        }
      }
    }
  }
}

// 2. Compare legacy .md vs MDX
function compareLegacy() {
  if (!fs.existsSync(legacyDir)) return;
  const legacyFiles = fs.readdirSync(legacyDir).filter(f=>f.endsWith('.md'));
  const mdxFiles = fs.existsSync(mdxDir) ? fs.readdirSync(mdxDir).filter(f=>f.endsWith('.mdx')) : [];
  const mdxIds = new Set(mdxFiles.map(f=>f.replace(/\.mdx$/, '')));
  for (const lf of legacyFiles) {
    const id = lf.replace(/\.md$/, '');
    if (mdxIds.has(id)) {
      log('ERROR', `Legacy markdown file static/md/${lf} still exists alongside MDX version.`);
      failed = true;
    } else if (!process.env.ALLOW_LEGACY_MD) {
      log('WARN', `Legacy-only story ${id} has no MDX version.`);
    }
  }
}

(function main(){
  scanForLegacyImports();
  compareLegacy();
  if (failed) {
    log('FAIL', 'MDX migration verification failed. See errors above.');
    process.exit(1);
  } else {
    log('OK', 'MDX migration verified (no blocking issues).');
  }
})();
