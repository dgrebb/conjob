---
owner: TBD
approved: TBD
decision: Approved
choice: Command-based CLI with Progress Feedback
---

# CLI Interface Design Decision

| **Item**     | Description |
| ------------ | ----------- |
| **Status**   | `Completed` |
| **Owner**    | TBD         |
| **Approved** | TBD         |
| **Due Date** | Completed   |
| **Decision** | `Yes`       |

## Problem Statement

Need a user-friendly CLI interface that:

- Provides clear commands
- Shows progress feedback
- Handles errors gracefully
- Supports configuration
- Maintains consistency

## Research Insights

1. User Requirements:

   - Simple command structure
   - Clear usage instructions
   - Progress indication
   - Error messages
   - Configuration options

2. Common Patterns:
   - Command-based interface
   - Help text on invalid input
   - Visual progress feedback
   - Environment-based config
   - Consistent exit codes

## Solution Hypothesis

A command-based CLI with:

- Two main commands (all spaces, single space)
- Clear usage instructions
- Progress logging
- Configuration via env/file
- Consistent output format

## Design Options

|          | Option 1: Single Command                                | Option 2: Multiple Commands                                    |
| -------- | ------------------------------------------------------- | -------------------------------------------------------------- |
| Overview | One command with flags                                  | Separate commands per action                                   |
| Benefits | - Simpler interface<br>- Less code<br>- One entry point | - Clear separation<br>- Focused commands<br>- Better help text |
| Risks    | - Complex flags<br>- Less intuitive                     | - More files<br>- Command discovery                            |

## Implementation

1. Command Structure:

```bash
# Scrape all spaces
pnpm space:all

# Scrape single space
pnpm space:single SPACEKEY
```

2. Usage Instructions:

```javascript
console.log(`
Confluence Space Scraper
-----------------------
This script will:
1. Fetch all available Confluence spaces
2. Download all pages from each space
3. Convert them to Markdown
4. Save them in a directory structure matching Confluence

Output will be in: ./confluence_markdown/

Note: Configure BASE_URL and ACCESS_TOKEN in utils/index.js first
`);
```

3. Progress Feedback:

```javascript
console.log("Fetching content for space:", spaceKey);
console.log(`Found ${pages.length} pages`);
console.log("✅ All content has been scraped and saved!");
```

## Follow up

| Decision          | Status        | Next Steps                               |
| ----------------- | ------------- | ---------------------------------------- |
| Command Structure | `Completed`   | - Add help command<br>- Add version flag |
| Progress Display  | `In Progress` | - Add progress bar<br>- Add ETA          |
| Configuration     | `Planned`     | - Add config file<br>- Add env support   |

## Source Files

Key CLI implementations:

- [package.json](../package.json) - Command definitions
- [scripts/all-spaces.js](../scripts/all-spaces.js) - All spaces command
- [scripts/all-space-content.js](../scripts/all-space-content.js) - Single space command

CLI Patterns:

1. Command Definition:

```json
{
  "scripts": {
    "space:all": "node scripts/all-spaces.js",
    "space:single": "node scripts/all-space-content.js",
    "start": "node scripts/all-spaces.js"
  }
}
```

2. Input Validation:

```javascript
if (!spaceKey) {
  console.log(`
Confluence Single Space Scraper
-----------------------------
Usage: pnpm space:single <SPACE_KEY>
`);
  process.exit(1);
}
```
