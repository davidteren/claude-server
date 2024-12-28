# Claude Server MCP

An MCP server that provides context management capabilities for Claude, allowing you to save, retrieve, and organize conversation contexts across sessions.

## Features

- Save conversation contexts with optional tags
- Retrieve previously saved contexts by ID
- List and filter contexts by tags
- Automatic timestamp-based organization
- JSON-based storage for easy access and backup

## Installation

The server is automatically configured in your Claude desktop app's MCP settings. Contexts are stored in `~/Documents/Claude/contexts/` by default.

## Tools

### save_context

Save a conversation context for future reference.

```typescript
{
  name: 'save_context',
  description: 'Save conversation context for future reference',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'Unique identifier for the context',
      },
      content: {
        type: 'string',
        description: 'Context content to save',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional tags for categorizing the context',
      },
    },
    required: ['id', 'content'],
  },
}
```

Example usage:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_context",
  arguments: {
    id: "project-123",
    content: "Discussion about implementing feature X",
    tags: ["project", "feature-discussion"]
  }
});
```

### get_context

Retrieve a previously saved context by its ID.

```typescript
{
  name: 'get_context',
  description: 'Retrieve previously saved context by ID',
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'string',
        description: 'ID of the context to retrieve',
      },
    },
    required: ['id'],
  },
}
```

Example usage:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "get_context",
  arguments: {
    id: "project-123"
  }
});
```

### list_contexts

List all saved contexts, optionally filtered by tag.

```typescript
{
  name: 'list_contexts',
  description: 'List all saved contexts',
  inputSchema: {
    type: 'object',
    properties: {
      tag: {
        type: 'string',
        description: 'Optional tag to filter contexts',
      },
    },
  },
}
```

Example usage:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "list_contexts",
  arguments: {
    tag: "project"  // Optional
  }
});
```

## Storage

Contexts are stored as JSON files in `~/Documents/Claude/contexts/` with the following structure:

```typescript
interface Context {
  id: string;        // Unique identifier
  content: string;   // Context content
  timestamp: string; // ISO timestamp
  tags?: string[];   // Optional categorization tags
}
```

Each context is saved in a separate file named `{id}.json` for easy management and backup.

## Development

To modify or extend the server:

1. Clone the repository
2. Install dependencies: `npm install`
3. Make changes to `src/index.ts`
4. Build: `npm run build`
5. The server will be built to `build/index.js`

## Contributing

Feel free to submit issues and enhancement requests!
