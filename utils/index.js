import jsdom from "jsdom";
import MarkdownIt from "markdown-it";
import path from "path";
import fs from "fs";

const { JSDOM } = jsdom;

// Allow console for CLI feedback
/* eslint-disable no-console */

/**
 * Configuration for the Confluence API
 * @type {string} BASE_URL - The base URL for the Confluence REST API
 * @type {string} ACCESS_TOKEN - Your Confluence personal access token
 * @type {string} OUTPUT_DIR - Directory where markdown files will be saved
 */
export const BASE_URL = "http://localhost:8080/confluence/rest/api";
export const ACCESS_TOKEN = "your_personal_access_token";
export const OUTPUT_DIR = "confluence_markdown";

/**
 * Converts Confluence storage format HTML to Markdown
 * @param {string} storageHtml - HTML content from Confluence's storage format
 * @returns {string} Converted markdown content
 */
export function convertToMarkdown(storageHtml) {
  const dom = new JSDOM(storageHtml);
  const document = dom.window.document;

  // Convert tables, links, headings, and formatting
  const md = new MarkdownIt();
  return md.render(document.body.innerHTML);
}

/**
 * Makes an API request with exponential backoff for rate limiting
 * @param {string} url - The API endpoint to fetch (relative or absolute URL)
 * @param {number} [retries=5] - Maximum number of retry attempts
 * @param {number} [initialDelay=1000] - Initial delay in ms before first retry
 * @returns {Promise<Object>} Parsed JSON response from the API
 * @throws {Error} If the request fails after all retries or encounters a non-429 error
 */
export async function fetchWithBackoff(url, retries = 5, initialDelay = 1000) {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  let currentDelay = initialDelay;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(fullUrl, {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= 2;
        continue;
      }

      // Handle other errors
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;

      // Retry with exponential backoff
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= 2;
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Sanitizes a string for use as a filename or directory name
 * @param {string} name - The string to sanitize
 * @returns {string} Sanitized string with illegal characters removed
 * @example
 * sanitizeName("My File: Version 1.0") // returns "My File Version 1.0"
 */
export function sanitizeName(name) {
  return name.replace(/[<>:"/\\|?*]/g, ""); // Only remove characters illegal in filenames
}

/**
 * Creates a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory to create
 * @throws {Error} If directory creation fails
 */
export function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Gets a unique directory name by appending a counter if needed
 * @param {string} basePath - Base directory path
 * @param {string} dirName - Desired directory name
 * @returns {string} Unique directory path
 * @example
 * // If "My Folder" exists:
 * getUniqueDirectoryName("/path/to", "My Folder") // returns "/path/to/My Folder (1)"
 */
export function getUniqueDirectoryName(basePath, dirName) {
  let finalPath = path.join(basePath, dirName);
  let counter = 1;

  while (fs.existsSync(finalPath)) {
    finalPath = path.join(basePath, `${dirName} (${counter})`);
    counter++;
  }

  return finalPath;
}

/**
 * Formats a URL with query parameters
 * @param {string} path - The API path
 * @param {Object} [params] - Query parameters
 * @returns {string} Formatted URL
 */
export function formatApiUrl(path, params = {}) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}
