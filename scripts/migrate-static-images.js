#!/usr/bin/env node
/**
 * Batch migration of legacy /static/img/<storyId>/ images to /public/stories/<storyId>/
 * and path rewrites inside corresponding MDX files.
 * Idempotent: existing destination files are skipped unless --force.
 *
 * Usage: node scripts/migrate-static-images.js [--force] [--only=id1,id2]
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const STATIC_IMG_DIR = path.join(ROOT, 'static', 'img');
const PUBLIC_STORIES_DIR = path.join(ROOT, 'public', 'stories');
const STORIES_DIR = path.join(ROOT, 'src', 'content', 'stories');

const args = process.argv.slice(2);
const force = args.includes('--force');
const onlyArg = args.find(a => a.startsWith('--only='));
const onlySet = onlyArg ? new Set(onlyArg.replace('--only=','').split(',').filter(Boolean)) : null;

function log(msg){ console.log(`[migrate] ${msg}`); }

function ensureDir(d){ if(!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); }

function migrateStory(storyId){
  const legacyDir = path.join(STATIC_IMG_DIR, storyId);
  if(!fs.existsSync(legacyDir)) { log(`skip ${storyId}: no legacy dir`); return { storyId, skipped:true }; }
  const destDir = path.join(PUBLIC_STORIES_DIR, storyId);
  ensureDir(destDir);
  const files = fs.readdirSync(legacyDir);
  let copied = 0;
  for(const file of files){
    const src = path.join(legacyDir, file);
    const dest = path.join(destDir, file);
    if(!force && fs.existsSync(dest)) continue;
    fs.copyFileSync(src, dest);
    copied++;
  }
  // Rewrite MDX paths
  const mdxFile = path.join(STORIES_DIR, `${storyId}.mdx`);
  if(fs.existsSync(mdxFile)) {
    let content = fs.readFileSync(mdxFile,'utf8');
    const before = content;
    content = content.replace(new RegExp(`/static/img/${storyId}/`, 'g'), `/stories/${storyId}/`);
    if(content !== before) {
      fs.writeFileSync(mdxFile, content, 'utf8');
      log(`rewrote paths in ${storyId}.mdx`);
    }
  }
  return { storyId, copied };
}

function main(){
  if(!fs.existsSync(STATIC_IMG_DIR)) { console.error('No static/img directory found.'); process.exit(1); }
  const storyIds = fs.readdirSync(STATIC_IMG_DIR).filter(f=>fs.statSync(path.join(STATIC_IMG_DIR,f)).isDirectory());
  const targets = onlySet ? storyIds.filter(id=>onlySet.has(id)) : storyIds;
  const results = targets.map(migrateStory);
  const summary = results.map(r=>`${r.storyId}: ${r.skipped?'skipped':`${r.copied} files`}`).join('\n');
  console.log('\nMigration summary:\n'+summary);
}

main();
