# Claude Server MCP

A Model Context Protocol (MCP) server that provides sophisticated context management capabilities for Claude, enabling persistent context across sessions, project-specific context organization, and conversation continuity.

## Features

- **Project Context Management**
  - Hierarchical context organization
  - Parent-child relationships
  - Cross-referencing between contexts
  - Project-specific metadata

- **Conversation Continuity**
  - Session-based context tracking
  - Conversation chaining
  - Metadata-rich context storage
  - Flexible tagging system

- **Efficient Storage**
  - Organized directory structure
  - JSON-based storage
  - Quick lookup indexing
  - Asynchronous operations

## Installation

The server is automatically configured in your Claude desktop app's MCP settings. All contexts are stored in `~/.claude/` for better organization:

```
~/.claude/
├── contexts/           # General conversation contexts
├── projects/          # Project-specific contexts
└── context-index.json # Quick lookup index
```

## Tools

### Project Context Management

```typescript
// Save project context
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_project_context",
  arguments: {
    id: "feature-design-v1",
    projectId: "my-project",
    content: "Design discussion...",
    parentContextId: "requirements-v1",
    references: ["api-spec-v1"],
    tags: ["design"],
    metadata: { status: "in-progress" }
  }
});
```

### Conversation Management

```typescript
// Save conversation context
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_conversation_context",
  arguments: {
    id: "chat-2024-01-01",
    sessionId: "session-123",
    content: "Discussion content...",
    continuationOf: "previous-chat-id",
    tags: ["meeting"]
  }
});
```

### Context Retrieval

```typescript
// Get context
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "get_context",
  arguments: {
    id: "feature-design-v1",
    projectId: "my-project"
  }
});

// List contexts
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "list_contexts",
  arguments: {
    projectId: "my-project",
    tag: "design",
    type: "project"
  }
});
```

## Documentation

- [Context Management Guide](docs/CONTEXT_MANAGEMENT.md) - Detailed guide on context types and usage
- [Architecture Overview](docs/ARCHITECTURE.md) - Technical implementation details
- [Usage Guide](docs/USAGE.md) - General usage instructions
- [Claude Desktop Integration](docs/CLAUDE_DESKTOP_INTEGRATION.md) - Integration with Claude Desktop

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the server:
   ```bash
   npm run build
   ```
4. The server will be built to `build/index.js`

## Configuration

The server is configured through the Claude desktop app's configuration file at:
`~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "claude-server": {
      "command": "node",
      "args": ["/path/to/claude-server/build/index.js"]
    }
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT
