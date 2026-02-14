#!/usr/bin/env node
/**
 * memory-write.js - Write a memory entry to the KISSD memory system
 * 
 * Usage: node memory-write.js <category> <title> <content> [tags]
 * 
 * Args:
 *   category - one of: decisions, freelancers, projects, clients, processes, people, general
 *   title    - short descriptive title (becomes filename)
 *   content  - markdown content for the memory
 *   tags     - optional comma-separated tags
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/clawd/memory';
const VALID_CATEGORIES = ['decisions', 'freelancers', 'projects', 'clients', 'processes', 'people', 'general'];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 3) {
    console.error('Usage: node memory-write.js <category> <title> <content> [tags]');
    console.error('Categories: ' + VALID_CATEGORIES.join(', '));
    process.exit(1);
  }

  const category = args[0].toLowerCase();
  const title = args[1];
  const content = args[2];
  const tags = args[3] ? args[3].split(',').map(t => t.trim()) : [];

  if (!VALID_CATEGORIES.includes(category)) {
    console.error('Invalid category: ' + category);
    console.error('Valid categories: ' + VALID_CATEGORIES.join(', '));
    process.exit(1);
  }

  // Ensure directory exists
  const categoryDir = path.join(MEMORY_DIR, category);
  fs.mkdirSync(categoryDir, { recursive: true });

  // Generate filename
  const slug = slugify(title);
  const filename = slug + '.md';
  const filepath = path.join(categoryDir, filename);

  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.error('Memory already exists: ' + category + '/' + filename);
    console.error('Use memory-update.js to modify existing memories.');
    process.exit(1);
  }

  // Build memory file
  const now = new Date().toISOString();
  const tagLine = tags.length > 0 ? '\nTags: ' + tags.join(', ') : '';

  const memoryContent = `# ${title}

Category: ${category}
Created: ${now}
Updated: ${now}${tagLine}

---

${content}
`;

  fs.writeFileSync(filepath, memoryContent, 'utf8');

  console.log(JSON.stringify({
    ok: true,
    action: 'created',
    path: category + '/' + filename,
    title: title,
    category: category,
    tags: tags,
    timestamp: now
  }));
}

main();
