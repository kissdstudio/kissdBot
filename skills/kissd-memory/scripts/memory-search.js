#!/usr/bin/env node
/**
 * memory-search.js - Search memories by keyword across title, content, and tags
 * 
 * Usage: node memory-search.js <query> [category] [limit]
 * 
 * Args:
 *   query    - keywords to search for (space-separated, all must match)
 *   category - optional, limit to one category
 *   limit    - optional, max results (default 10)
 */

const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/root/clawd/memory';
const VALID_CATEGORIES = ['decisions', 'freelancers', 'projects', 'clients', 'processes', 'people', 'general'];

function getAllMemoryFiles(category) {
  const files = [];
  const categories = category && category !== 'all' ? [category] : VALID_CATEGORIES;

  for (const cat of categories) {
    const catDir = path.join(MEMORY_DIR, cat);
    if (!fs.existsSync(catDir)) continue;

    const entries = fs.readdirSync(catDir).filter(f => f.endsWith('.md'));
    for (const entry of entries) {
      files.push({
        category: cat,
        filename: entry,
        filepath: path.join(catDir, entry),
        relativePath: cat + '/' + entry
      });
    }
  }

  return files;
}

function parseMemoryFile(filepath) {
  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.split('\n');

  let title = '';
  let tags = [];
  let created = '';
  let updated = '';
  let body = '';
  let inBody = false;

  for (const line of lines) {
    if (line.startsWith('# ') && !title) {
      title = line.substring(2).trim();
    } else if (line.startsWith('Tags: ')) {
      tags = line.substring(6).split(',').map(t => t.trim());
    } else if (line.startsWith('Created: ')) {
      created = line.substring(9).trim();
    } else if (line.startsWith('Updated: ')) {
      updated = line.substring(9).trim();
    } else if (line.startsWith('---') && !inBody) {
      inBody = true;
    } else if (inBody) {
      body += line + '\n';
    }
  }

  return { title, tags, created, updated, body: body.trim(), fullContent: content };
}

function searchScore(query, memoryData) {
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  const searchText = (
    memoryData.title + ' ' +
    memoryData.tags.join(' ') + ' ' +
    memoryData.body
  ).toLowerCase();

  let matchCount = 0;
  let allMatch = true;

  for (const keyword of keywords) {
    if (searchText.includes(keyword)) {
      matchCount++;
    } else {
      allMatch = false;
    }
  }

  if (matchCount === 0) return 0;

  // Score: bonus for all keywords matching, then by match count
  let score = matchCount;
  if (allMatch) score += 100;

  // Bonus for title matches
  const titleLower = memoryData.title.toLowerCase();
  for (const keyword of keywords) {
    if (titleLower.includes(keyword)) score += 10;
  }

  // Bonus for tag matches
  const tagsLower = memoryData.tags.join(' ').toLowerCase();
  for (const keyword of keywords) {
    if (tagsLower.includes(keyword)) score += 5;
  }

  return score;
}

function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error('Usage: node memory-search.js <query> [category] [limit]');
    process.exit(1);
  }

  const query = args[0];
  const category = args[1] || 'all';
  const limit = parseInt(args[2] || '10', 10);

  if (category !== 'all' && !VALID_CATEGORIES.includes(category)) {
    console.error('Invalid category: ' + category);
    console.error('Valid categories: ' + VALID_CATEGORIES.join(', ') + ', all');
    process.exit(1);
  }

  if (!fs.existsSync(MEMORY_DIR)) {
    console.log(JSON.stringify({ ok: true, results: [], total: 0, query: query }));
    return;
  }

  const files = getAllMemoryFiles(category);
  const results = [];

  for (const file of files) {
    const memoryData = parseMemoryFile(file.filepath);
    const score = searchScore(query, memoryData);

    if (score > 0) {
      // Truncate body for search results
      const preview = memoryData.body.substring(0, 200) + (memoryData.body.length > 200 ? '...' : '');

      results.push({
        path: file.relativePath,
        title: memoryData.title,
        category: file.category,
        tags: memoryData.tags,
        created: memoryData.created,
        updated: memoryData.updated,
        preview: preview,
        score: score
      });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  const limited = results.slice(0, limit);

  console.log(JSON.stringify({
    ok: true,
    results: limited,
    total: results.length,
    showing: limited.length,
    query: query,
    category: category
  }, null, 2));
}

main();
