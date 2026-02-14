#!/usr/bin/env node
/**
 * memory-read.js - Read a specific memory file
 * 
 * Usage: node memory-read.js <filepath>
 * 
 * Args:
 *   filepath - relative path within memory directory (e.g., "decisions/honda-editor.md")
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/clawd/memory';

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node memory-read.js <filepath>');
    console.error('Example: node memory-read.js decisions/honda-editor-selection.md');
    process.exit(1);
  }

  const relativePath = args[0];
  const filepath = path.join(MEMORY_DIR, relativePath);

  // Security: ensure path doesn't escape memory directory
  const resolved = path.resolve(filepath);
  if (!resolved.startsWith(path.resolve(MEMORY_DIR))) {
    console.error('Invalid path: must be within memory directory');
    process.exit(1);
  }

  if (!fs.existsSync(filepath)) {
    console.log(JSON.stringify({
      ok: false,
      error: 'Memory not found: ' + relativePath
    }));
    process.exit(1);
  }

  const content = fs.readFileSync(filepath, 'utf8');

  console.log(JSON.stringify({
    ok: true,
    path: relativePath,
    content: content
  }));
}

main();
