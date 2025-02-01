# Confluence API Response Examples

These examples show the structure of responses from various Confluence API endpoints.

## Space Response

```javascript
{
  "id": 123,
  "key": "DEMO",
  "name": "Demo Space",
  "type": "global",
  "_links": {
    "webui": "/spaces/DEMO",
    "self": "http://localhost:8080/confluence/rest/api/space/DEMO"
  }
}
```

## Page Response

```javascript
{
  "id": "123456",
  "type": "page",
  "status": "current",
  "title": "Home",
  "space": {
    "id": 123,
    "key": "DEMO",
    "name": "Demo Space",
    "type": "global",
    "homePage": { "id": "123456" }
  },
  "body": {
    "storage": {
      "value": "<p>Welcome to the home page</p>",
      "representation": "storage"
    }
  },
  "ancestors": []
}
```

## Child Page Example (with ancestors)

```javascript
{
  "id": "123458",
  "type": "page",
  "status": "current",
  "title": "Child Page",
  "space": {
    "id": 123,
    "key": "DEMO",
    "name": "Demo Space",
    "type": "global",
    "homePage": { "id": "123456" }
  },
  "body": {
    "storage": {
      "value": "<p>This is a child page</p>",
      "representation": "storage"
    }
  },
  "ancestors": [
    {
      "id": "123457",
      "type": "page",
      "title": "Parent Page",
      "_links": { "webui": "/spaces/DEMO/pages/123457" }
    }
  ]
}
```

## Pagination Example

```javascript
{
  "results": [/* array of pages or spaces */],
  "_links": {
    "next": "/space?start=1",
    "self": "http://localhost:8080/confluence/rest/api/space"
  }
}
```

These examples are useful for:

- Understanding the API response structure
- Testing API integrations
- Debugging response handling
