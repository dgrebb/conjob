# Conjob: Confluence to Markdown Scraper

A Node.js tool to scrape Confluence spaces and convert them to Markdown files while preserving the page hierarchy.

## Features

- 📚 Scrape entire Confluence spaces or individual spaces
- 🔄 Convert Confluence storage format to Markdown
- 📁 Preserve page hierarchy in directory structure
- 🔁 Handle rate limiting with exponential backoff
- 🔗 Maintain page relationships and ordering

## Quick Start

```bash
# Install dependencies
pnpm install

# Configure your Confluence instance
# Edit utils/index.js:
export const BASE_URL = "http://your-confluence-instance/rest/api";
export const ACCESS_TOKEN = "your-personal-access-token";

# Scrape all spaces
pnpm space:all

# Or scrape a specific space
pnpm space:single ENGINEERING
```

## Architecture Decisions

This project follows a documented decision-making process. Key architectural decisions:

1. [API Integration](docs/api-integration.md)

   - Native fetch with backoff
   - Centralized API client
   - Type-safe responses

2. [File Structure](docs/file-structure.md)

   - Feature-based organization
   - Clear separation of concerns
   - Consistent patterns

3. [Error Handling](docs/error-handling.md)

   - Centralized error handling
   - Retry mechanisms
   - Consistent error messages

4. [CLI Interface](docs/cli-interface.md)
   - Command-based interface
   - Progress feedback
   - Clear usage instructions

## Project Structure

```
.
├── scripts/                 # CLI Commands
│   ├── all-spaces.js       # Scrape all spaces
│   └── all-space-content.js # Scrape single space
├── utils/                  # Shared Utilities
│   └── index.js           # API client, helpers
└── docs/                  # Documentation
    ├── api-examples.md
    ├── api-integration.md
    ├── cli-interface.md
    ├── error-handling.md
    ├── file-structure.md
```

## Development

```bash
# Format code
pnpm format
```

## Output Structure

The scraper creates a directory structure that mirrors your Confluence space:

```
confluence_markdown/
├── SPACE1/
│   ├── home/
│   │   ├── index.md (Space homepage)
│   │   └── Other Root Pages.md
│   └── Parent Page/
│       ├── index.md (Parent page content)
│       └── Child Page.md
└── SPACE2/
    └── ...
```

## Configuration

Configure your Confluence instance in `utils/index.js`:

```javascript
export const BASE_URL = "http://your-confluence-instance/rest/api";
export const ACCESS_TOKEN = "your-personal-access-token";
export const OUTPUT_DIR = "confluence_markdown";
```

## Error Handling

The scraper handles several error cases:

- Rate limiting (429) with exponential backoff
- Network errors with retries
- Invalid space keys
- Missing configuration
- File system errors

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgments

- [markdown-it](https://github.com/markdown-it/markdown-it) for Markdown conversion
- [jsdom](https://github.com/jsdom/jsdom) for HTML parsing
