#!/usr/bin/env node
/* eslint-disable no-console */
/* eslint-disable no-undef */

import fs from "fs";
import path from "path";
import {
  convertToMarkdown,
  fetchWithBackoff,
  OUTPUT_DIR,
  sanitizeName,
  ensureDirectoryExists,
  getUniqueDirectoryName,
  formatApiUrl,
} from "../utils/index.js";

/**
 * @typedef {Object} ConfluenceSpace
 * @property {string} key - The space key (e.g., "ENGINEERING")
 * @property {string} name - The display name of the space
 * @property {Object} homePage - Information about the space's home page
 * @property {string} homePage.id - The ID of the home page
 */

/**
 * @typedef {Object} ConfluencePage
 * @property {string} id - The page ID
 * @property {string} title - The page title
 * @property {Object} body - The page content
 * @property {Object} body.storage - The storage format content
 * @property {string} body.storage.value - The HTML content
 * @property {Array<Object>} ancestors - Parent pages in the hierarchy
 * @property {Object} space - The containing space
 * @property {Object} space.homePage - The space's home page
 */

// Add after imports
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

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR);
}

/**
 * Fetches all available Confluence spaces
 * @returns {Promise<ConfluenceSpace[]>} Array of space objects
 */
async function getAllSpaces() {
  let spaces = [];
  let url = "/space?limit=1000";

  while (url) {
    const data = await fetchWithBackoff(url);
    spaces.push(...data.results);
    url = data._links?.next || null;
    if (url) {
      url = formatApiUrl(url);
    }
  }

  return spaces;
}

/**
 * Fetches all content from a specific space
 * @param {string} spaceKey - The space key to fetch content from
 * @returns {Promise<ConfluencePage[]>} Array of page objects
 */
async function getSpaceContent(spaceKey) {
  let pages = [];
  let url = formatApiUrl(`/space/${spaceKey}/content`, {
    expand: "body.storage,ancestors,space,history",
    limit: "100",
  });

  while (url) {
    const data = await fetchWithBackoff(url);
    pages.push(...data.results);
    url = data._links?.next || null;
    if (url) {
      url = formatApiUrl(url, {
        expand: "body.storage,ancestors,space,history",
      });
    }
  }

  return pages;
}

/**
 * Saves a page's content as a Markdown file
 * @param {string} spaceKey - The space key
 * @param {ConfluencePage} page - The page object containing content and metadata
 * @param {string} content - The markdown content to save
 */
async function saveToMarkdown(spaceKey, page, content) {
  const spacePath = path.join(OUTPUT_DIR, spaceKey);
  ensureDirectoryExists(spacePath);

  // Create home directory for root/orphaned pages
  const homePath = path.join(spacePath, "home");
  ensureDirectoryExists(homePath);

  const title = sanitizeName(page.title);
  let targetDir;
  let fileName;

  if (!page.ancestors || page.ancestors.length === 0) {
    // Root level page - goes in home directory
    targetDir = homePath;
    fileName =
      page.id === page.space.homePage.id
        ? `0_${spaceKey}.md` // Space homepage
        : `${title}.md`; // Other root pages
  } else {
    // Nested page - create parent directory structure
    const parentPage = page.ancestors[page.ancestors.length - 1];
    targetDir = getUniqueDirectoryName(
      spacePath,
      sanitizeName(parentPage.title),
    );
    ensureDirectoryExists(targetDir);
    fileName = page.id === parentPage.id ? "index.md" : `${title}.md`;
  }

  const filePath = path.join(targetDir, fileName);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Saved: ${filePath}`);
}

/**
 * Main function to scrape all Confluence spaces
 * Fetches all spaces, their pages, and saves them as Markdown files
 * @returns {Promise<void>}
 * @throws {Error} If API calls fail or file operations fail
 */
export async function scrapeConfluence() {
  console.log("Fetching all spaces...");
  const spaces = await getAllSpaces();
  console.log(`Found ${spaces.length} spaces.`);

  for (const space of spaces) {
    const spaceKey = space.key;
    console.log(`Fetching content for space: ${spaceKey}`);

    const pages = await getSpaceContent(spaceKey);

    for (const page of pages) {
      const bodyStorage = page.body?.storage?.value || "";

      if (bodyStorage) {
        const markdownContent = convertToMarkdown(bodyStorage);
        await saveToMarkdown(spaceKey, page, markdownContent);
      }
    }
  }

  console.log("✅ All content has been scraped and saved!");
}

// Run the scraper only if not imported
if (import.meta.url === process.argv[1]) {
  scrapeConfluence().catch((err) => console.error("Error:", err));
}
