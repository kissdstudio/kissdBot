#!/usr/bin/env node
/**
 * memory-update.js - Update an existing memory file
 * 
 * Usage: node memory-update.js <filepath> <content> [append]
 * 
 * Args:
 *   filepath - relative path within memory directory
 *   content  - new content (replaces body) or content to append
 *   append   - if "append", adds to existing content instead of replacing
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/clawd/memory';

function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node memory-update.js <filepath> <content> [append]');
    process.exit(1);
  }

  const relativePath = args[0];
  const newContent = args[1];
  const mode = args[2] === 'append' ? 'append' : 'replace';

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

  const existingContent = fs.readFileSync(filepath, 'utf8');
  const now = new Date().toISOString();

  // Split into header and body
  const separatorIndex = existingContent.indexOf('\n---\n');
  let header = '';
  let body = '';

  if (separatorIndex !== -1) {
    header = existingContent.substring(0, separatorIndex);
    body = existingContent.substring(separatorIndex + 5).trim();
  } else {
    header = existingContent;
    body = '';
  }

  // Update the "Updated" timestamp in header
  header = header.replace(/Updated: .+/, 'Updated: ' + now);

  // Update body
  let updatedBody;
  if (mode === 'append') {
    updatedBody = body + '\n\n---\n\n**Update (' + now.split('T')[0] + '):**\n' + newContent;
  } else {
    updatedBody = newContent;
  }

  const updatedFile = header + '\n---\n\n' + updatedBody + '\n';
  fs.writeFileSync(filepath, updatedFile, 'utf8');

  console.log(JSON.stringify({
    ok: true,
    action: 'updated',
    mode: mode,
    path: relativePath,
    timestamp: now
  }));
}

main();
