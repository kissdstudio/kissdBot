#!/usr/bin/env node
/**
 * memory-delete.js - Delete a memory file
 * 
 * Usage: node memory-delete.js <filepath>
 * 
 * Args:
 *   filepath - relative path within memory directory
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/clawd/memory';

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node memory-delete.js <filepath>');
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

  fs.unlinkSync(filepath);

  console.log(JSON.stringify({
    ok: true,
    action: 'deleted',
    path: relativePath
  }));
}

main();
