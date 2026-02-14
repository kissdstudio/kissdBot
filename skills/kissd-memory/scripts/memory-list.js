#!/usr/bin/env node
/**
 * memory-list.js - List memories by category or list all
 * 
 * Usage: node memory-list.js [category] [limit]
 * 
 * Args:
 *   category - optional, one category or "all" (default: all)
 *   limit    - optional, max results per category (default 20)
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/clawd/memory';
const VALID_CATEGORIES = ['decisions', 'freelancers', 'projects', 'clients', 'processes', 'people', 'general'];

function parseHeader(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  let title = '';
  let tags = [];
  let created = '';
  let updated = '';

  for (const line of lines) {
    if (line.startsWith('# ') && !title) {
      title = line.substring(2).trim();
    } else if (line.startsWith('Tags: ')) {
      tags = line.substring(6).split(',').map(t => t.trim());
    } else if (line.startsWith('Created: ')) {
      created = line.substring(9).trim();
    } else if (line.startsWith('Updated: ')) {
      updated = line.substring(9).trim();
    } else if (line.startsWith('---')) {
      break; // Stop at body separator
    }
  }

  return { title, tags, created, updated };
}

function main() {
  const args = process.argv.slice(2);
  const category = args[0] || 'all';
  const limit = parseInt(args[1] || '20', 10);

  if (category !== 'all' && !VALID_CATEGORIES.includes(category)) {
    console.error('Invalid category: ' + category);
    console.error('Valid categories: ' + VALID_CATEGORIES.join(', ') + ', all');
    process.exit(1);
  }

  if (!fs.existsSync(MEMORY_DIR)) {
    console.log(JSON.stringify({ ok: true, categories: {}, totalMemories: 0 }));
    return;
  }

  const categories = category === 'all' ? VALID_CATEGORIES : [category];
  const output = {};
  let totalMemories = 0;

  for (const cat of categories) {
    const catDir = path.join(MEMORY_DIR, cat);
    if (!fs.existsSync(catDir)) continue;

    const entries = fs.readdirSync(catDir)
      .filter(f => f.endsWith('.md'))
      .map(f => {
        const filepath = path.join(catDir, f);
        const header = parseHeader(filepath);
        return {
          path: cat + '/' + f,
          title: header.title,
          tags: header.tags,
          created: header.created,
          updated: header.updated
        };
      })
      .sort((a, b) => {
        // Sort by updated date, most recent first
        if (a.updated && b.updated) return b.updated.localeCompare(a.updated);
        if (a.created && b.created) return b.created.localeCompare(a.created);
        return 0;
      })
      .slice(0, limit);

    if (entries.length > 0) {
      output[cat] = entries;
      totalMemories += entries.length;
    }
  }

  console.log(JSON.stringify({
    ok: true,
    categories: output,
    totalMemories: totalMemories,
    showing: category
  }, null, 2));
}

main();
