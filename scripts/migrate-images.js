#!/usr/bin/env node
/**
 * migrate-images.js
 * Copy legacy images from static/img/<id>/ into public/stories/<id>/ maintaining filenames.
 * - Skips if destination file already exists.
 * - Logs summary of copied / skipped counts.
 * Usage: node scripts/migrate-images.js [--dry]
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const LEGACY_ROOT = path.join(ROOT, 'static', 'img');
const DEST_ROOT = path.join(ROOT, 'public', 'stories');
const DRY = process.argv.includes('--dry');

function listStoryDirs() {
  if (!fs.existsSync(LEGACY_ROOT)) return [];
  return fs.readdirSync(LEGACY_ROOT).filter(name => {
    const full = path.join(LEGACY_ROOT, name);
    return fs.statSync(full).isDirectory();
  });
}

function ensureDir(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }

function copyAll() {
  const stories = listStoryDirs();
  let copied = 0, skipped = 0;
  stories.forEach(id => {
    const srcDir = path.join(LEGACY_ROOT, id);
    const destDir = path.join(DEST_ROOT, id);
    ensureDir(destDir);
    fs.readdirSync(srcDir).forEach(file => {
      const srcFile = path.join(srcDir, file);
      if (fs.statSync(srcFile).isDirectory()) return; // ignore nested dirs for now
      const destFile = path.join(destDir, file);
      if (fs.existsSync(destFile)) { skipped++; return; }
      if (!DRY) fs.copyFileSync(srcFile, destFile);
      copied++;
      console.log(`${DRY ? '[DRY] would copy' : 'copied'} ${srcFile} -> ${destFile}`);
    });
  });
  console.log(`Done. Copied: ${copied}, Skipped(existing): ${skipped}`);
  if (DRY) console.log('Dry run only. Re-run without --dry to apply.');
}

if (require.main === module) {
  if (!fs.existsSync(LEGACY_ROOT)) {
    console.error('Legacy path not found:', LEGACY_ROOT);
    process.exit(1);
  }
  ensureDir(DEST_ROOT);
  copyAll();
}
