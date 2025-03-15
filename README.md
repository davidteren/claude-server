# Claude Server MCP

> ⚠️ **IMPORTANT: Project Status** ⚠️
> 
> This project is in early development (v0.1.0) and is **NOT READY FOR PRODUCTION USE**. It is currently undergoing a significant rewrite to address several critical issues. Please check the [Issues](https://github.com/davidteren/claude-server/issues) page for current limitations and planned improvements.
>
> We recommend waiting for a stable release (v0.2.0+) before using this in any critical workflows.

A Model Context Protocol (MCP) server that provides sophisticated context management capabilities for Claude, enabling persistent context across sessions, project-specific context organization, and conversation continuity.

## Current Limitations

- The server currently has compatibility issues with MCP clients other than Claude Desktop
- Context listing functionality is limited without specific project IDs
- Security features are minimal and not production-ready
- Error handling is basic and may not provide helpful guidance
- No testing infrastructure is in place

## Development Roadmap

This project is actively being improved. Key upcoming enhancements include:

1. **Stability Improvements** - Fixing core issues with home directory resolution and context listing
2. **Enhanced Error Handling** - Better error messages and recovery mechanisms
3. **Security Enhancements** - Input validation, path sanitization, and data protection
4. **Advanced Context Management** - Versioning, search, and better organization

For a more detailed roadmap, see our [Comprehensive Analysis](https://github.com/davidteren/claude-server/tree/docs/comprehensive-analysis/docs) branch.

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
