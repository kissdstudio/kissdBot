---
name: kissd-memory
description: Long-term memory system for KISSD. Use to remember decisions, freelancer feedback, project outcomes, client preferences, and institutional knowledge. ALWAYS check memory before answering questions about past events, decisions, people, or preferences. Save important information after substantive conversations. Memory persists across restarts via R2 backup.
---

# KISSD Memory

Persistent long-term memory for the KISSD team. Memories are stored as structured markdown files organized by category.

## When to SAVE a memory

Save a memory after any conversation that includes:
- A decision being made (project direction, vendor selection, budget approval)
- Freelancer feedback (performance notes, rate changes, availability)
- Project outcomes (what worked, what didn't, lessons learned)
- Client preferences (Honda likes X, NBC requires Y)
- Process decisions (how we handle invoicing, our review workflow)
- Personal context a team member shares (PTO plans, role changes, preferences)
- When someone explicitly says "remember this", "note this", "don't forget", etc.

## When to SEARCH memory

Search memory BEFORE responding when:
- Someone asks about past events ("what did we decide about...")
- Recommending freelancers ("who did we use for...")
- Planning projects similar to past ones
- Someone references a past conversation or decision
- Questions about rates, budgets, or vendor history
- Questions about how KISSD does something ("what's our process for...")

## Categories

| Category | What goes here | Directory |
|----------|---------------|-----------|
| decisions | Business and project decisions with context and rationale | decisions |
| freelancers | Freelancer profiles, feedback, rates, availability notes | freelancers |
| projects | Project summaries, timelines, outcomes, lessons learned | projects |
| clients | Client preferences, contacts, requirements, history | clients |
| processes | KISSD internal processes, workflows, how-we-do-things | processes |
| people | Team member preferences, roles, context | people |
| general | Anything that doesn't fit above | general |

## Commands

### Write a memory
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-write.js <category> <title> <content> [tags]
```
- category: one of decisions, freelancers, projects, clients, processes, people, general
- title: short descriptive title (used as filename, spaces become hyphens)
- content: the memory content in markdown
- tags: optional comma-separated tags for search

Example:
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-write.js decisions "honda-editor-selection" "Chose Jane Smith as lead editor for Honda Olympics 2026 spots. Rate: $850/day. Strong automotive portfolio. Bill and Erin approved." "honda,olympics,editor,jane-smith"
```

### Search memories
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-search.js <query> [category] [limit]
```
- query: keywords to search for (searches title, content, and tags)
- category: optional, limit search to one category
- limit: optional, max results (default 10)

Example:
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-search.js "honda editor" decisions 5
```

### List memories
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-list.js [category] [limit]
```
- category: optional, list one category or "all" (default: all)
- limit: optional, max results per category (default 20)

Example:
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-list.js freelancers 10
```

### Read a specific memory
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-read.js <filepath>
```
- filepath: relative path within memory directory (e.g., "decisions/honda-editor-selection.md")

Example:
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-read.js decisions/honda-editor-selection.md
```

### Update an existing memory
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-update.js <filepath> <content> [append]
```
- filepath: relative path to existing memory file
- content: new content (replaces body) or content to append
- append: if "append", adds to existing content instead of replacing

Example:
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-update.js freelancers/jane-smith.md "Update: Jane completed Honda Olympics project on time and under budget. Highly recommend." append
```

### Delete a memory
```bash
node /root/clawd/skills/kissd-memory/scripts/memory-delete.js <filepath>
```

## Best Practices

1. **Be specific in titles** -- use names, project names, and dates
2. **Tag generously** -- more tags = easier to find later
3. **Update, don't duplicate** -- if a memory about a topic exists, update it rather than creating a new one
4. **Summarize, don't transcribe** -- capture the decision/insight, not the full conversation
5. **Always search before saving** -- check if a related memory already exists
