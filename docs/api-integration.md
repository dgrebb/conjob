---
owner: TBD
approved: TBD
decision: Approved
choice: Centralized API Client with Backoff
---

# API Integration Design Decision

| **Item**     | Description |
| ------------ | ----------- |
| **Status**   | `Completed` |
| **Owner**    | TBD         |
| **Approved** | TBD         |
| **Due Date** | Completed   |
| **Decision** | `Yes`       |

## Problem Statement

Need a reliable way to interact with Confluence's REST API that handles:

- Rate limiting and backoff
- Authentication
- Pagination
- Error handling
- Response parsing

## Research Insights

1. Confluence API Characteristics:

   - Uses REST architecture
   - Rate limits with 429 responses
   - Supports pagination via \_links
   - Requires Bearer token auth
   - Returns JSON responses

2. Common Challenges:
   - Rate limiting during bulk operations
   - Large response sets requiring pagination
   - Network failures requiring retries
   - Complex nested data structures

## Solution Hypothesis

A centralized API client with:

- Exponential backoff for rate limits
- Automatic retry mechanism
- Pagination handling
- Type-safe response parsing

## Design Options

|          | Option 1: Axios Client                                | Option 2: Native Fetch                                    |
| -------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Overview | Third-party HTTP client                               | Browser-standard API                                      |
| Benefits | - Built-in retry<br>- Interceptors<br>- Wide adoption | - No dependencies<br>- Modern API<br>- Native ESM support |
| Risks    | - Extra dependency<br>- Bundle size<br>- ESM issues   | - Manual retry logic<br>- Less middleware options         |

## Follow up

| Decision         | Status      | Next Steps                                                 |
| ---------------- | ----------- | ---------------------------------------------------------- |
| Use Fetch        | `Completed` | - Add response type validation<br>- Improve error handling |
| Backoff Strategy | `Completed` | - Fine-tune retry delays<br>- Add jitter                   |
| Response Types   | `Completed` | - Document all response types<br>- Add runtime validation  |

## Source Files

Key implementation files:

- [utils/index.js](../utils/index.js) - API client implementation
- [scripts/all-spaces.js](../scripts/all-spaces.js) - Space API usage
- [scripts/all-space-content.js](../scripts/all-space-content.js) - Content API usage

API Integration Patterns:

1. Backoff Implementation:

   ```javascript
   export async function fetchWithBackoff(
     url,
     retries = 5,
     initialDelay = 1000,
   ) {
     let currentDelay = initialDelay;
     for (let i = 0; i < retries; i++) {
       try {
         const response = await fetch(url);
         if (response.status === 429) {
           await new Promise((resolve) => setTimeout(resolve, currentDelay));
           currentDelay *= 2;
           continue;
         }
         return await response.json();
       } catch (error) {
         if (i === retries - 1) throw error;
       }
     }
   }
   ```

2. Type Definitions:

   ```javascript
   /**
    * @typedef {Object} ConfluenceSpace
    * @property {string} key - Space key
    * @property {string} name - Display name
    * @property {Object} homePage - Home page info
    */
   ```

3. Pagination Handling:
   ```javascript
   async function getAllContent(spaceKey) {
     let pages = [];
     let url = `/space/${spaceKey}/content`;
     while (url) {
       const data = await fetchWithBackoff(url);
       pages.push(...data.results);
       url = data._links?.next || null;
     }
     return pages;
   }
   ```

---
