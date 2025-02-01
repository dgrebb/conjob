# Contributing to Confluence to Markdown Scraper

Thanks for your interest in contributing! This document outlines the process and guidelines.

## Development Process

1. **Setup**

   ```bash
   # Fork and clone the repo
   git clone https://github.com/your-username/confluence-scraper.git
   cd confluence-scraper

   # Install dependencies
   pnpm install

   # Prepare scripts
   pnpm prepare
   ```

2. **Code Style**
   - Use JSDoc for type safety and documentation
   - Follow existing patterns
   - Run formatter before committing
   ```bash
   pnpm format
   ```

## Pull Request Process

1. **Branch Naming**

   - `feature/description` for new features
   - `fix/description` for bug fixes
   - `docs/description` for documentation changes

2. **Commit Messages**

   - Clear and descriptive
   - Reference issues if applicable
   - Use present tense ("Add feature" not "Added feature")

3. **Documentation**
   - Update README.md if needed
   - Add JSDoc comments
   - Update architecture decision records if making significant changes

## Architecture Guidelines

1. **Error Handling**
   - Use centralized error handling
   - Implement retries for transient failures
   - Provide clear error messages

## Need Help?

- Check existing [architecture decisions](docs/)
- Review test implementations
- Open an issue for discussion

---
