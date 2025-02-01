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
 * @typedef {import('./all-spaces.js').ConfluencePage} ConfluencePage
 */

/**
 * Fetches and processes all content from a single Confluence space
 * @param {string} spaceKey - The space key to process (e.g., "ENGINEERING")
 * @returns {Promise<void>}
 * @throws {Error} If space key is missing or API calls fail
 * @example
 * await scrapeConfluenceSpace("ENGINEERING");
 */
export async function scrapeConfluenceSpace() {
  const spaceKey = process.argv[2];
  if (!spaceKey) {
    throw new Error("Please provide a space key as an argument");
  }

  console.log(`Fetching content for space: ${spaceKey}`);
  const pages = await getSpaceContent(spaceKey);
  console.log(`Found ${pages.length} pages`);

  for (const page of pages) {
    const bodyStorage = page.body?.storage?.value || "";

    if (bodyStorage) {
      const markdownContent = convertToMarkdown(bodyStorage);
      await saveToMarkdown(spaceKey, page, markdownContent);
    }
  }

  console.log("✅ All content has been scraped and saved!");
}

/**
 * Fetches all pages from a specific Confluence space
 * @param {string} spaceKey - The space key to fetch content from
 * @returns {Promise<ConfluencePage[]>} Array of page objects with content and metadata
 * @throws {Error} If API calls fail or rate limits are exceeded
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
 * Saves a page's content as a Markdown file in the appropriate directory
 * @param {string} spaceKey - The space key (used for directory structure)
 * @param {ConfluencePage} page - The page object containing content and metadata
 * @param {string} content - The markdown content to save
 * @throws {Error} If file operations fail
 */
async function saveToMarkdown(spaceKey, page, content) {
  const spacePath = path.join(OUTPUT_DIR, spaceKey);
  ensureDirectoryExists(spacePath);

  // Create home directory for root/orphaned pages
  const homePath = path.join(spacePath, "home");
  ensureDirectoryExists(homePath);

  const sanitizedTitle = sanitizeName(page.title);
  let targetDir;
  let fileName;

  if (!page.ancestors || page.ancestors.length === 0) {
    // Root level page - goes in home directory
    targetDir = homePath;
    fileName =
      page.id === page.space.homePage.id
        ? `0_${spaceKey}.md` // Space homepage
        : `${sanitizedTitle}.md`; // Other root pages
  } else {
    // Nested page - create parent directory structure
    const parentPage = page.ancestors[page.ancestors.length - 1];
    targetDir = getUniqueDirectoryName(
      spacePath,
      sanitizeName(parentPage.title),
    );
    ensureDirectoryExists(targetDir);
    fileName = page.id === parentPage.id ? "index.md" : `${sanitizedTitle}.md`;
  }

  const filePath = path.join(targetDir, fileName);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Saved: ${filePath}`);
}

// Run the scraper only if not imported
if (import.meta.url === process.argv[1]) {
  scrapeConfluenceSpace().catch((err) => console.error("Error:", err));
}
