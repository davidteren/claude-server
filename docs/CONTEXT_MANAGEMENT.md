# Context Management in Claude Server

## Overview

The Claude Server implements a sophisticated context management system that handles both project-specific and conversation contexts. This system is designed to maintain context across sessions while organizing information in a structured and retrievable way.

## Directory Structure

```
~/.claude/
├── contexts/           # General conversation contexts
├── projects/          # Project-specific contexts
│   ├── project-1/     # Contexts for project-1
│   └── project-2/     # Contexts for project-2
└── context-index.json # Quick lookup index for all contexts
```

## Context Types

### Base Context
All contexts share these common properties:
```typescript
interface BaseContext {
  id: string;              // Unique identifier
  content: string;         // The actual context content
  timestamp: string;       // ISO timestamp
  tags?: string[];        // Optional categorization tags
  metadata?: Record<string, unknown>; // Additional flexible metadata
}
```

### Project Context
For project-specific information with relationships:
```typescript
interface ProjectContext extends BaseContext {
  projectId: string;       // Project identifier
  parentContextId?: string; // Optional parent context
  references?: string[];   // Related context IDs
}
```

### Conversation Context
For maintaining conversation continuity:
```typescript
interface ConversationContext extends BaseContext {
  sessionId: string;       // Conversation session ID
  continuationOf?: string; // Previous context ID
}
```

## Tools

### 1. save_project_context
Save project-specific context with relationships:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_project_context",
  arguments: {
    id: "feature-design-v1",
    projectId: "my-project",
    content: "Feature design discussion...",
    parentContextId: "requirements-v1",
    references: ["api-spec-v1"],
    tags: ["design", "feature"],
    metadata: {
      status: "in-progress",
      priority: "high"
    }
  }
});
```

### 2. save_conversation_context
Save conversation context with continuation support:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_conversation_context",
  arguments: {
    id: "chat-2024-01-01-2",
    sessionId: "session-123",
    content: "Continuation of previous discussion...",
    continuationOf: "chat-2024-01-01-1",
    tags: ["meeting", "planning"],
    metadata: {
      participants: ["user1", "user2"]
    }
  }
});
```

### 3. get_context
Retrieve context by ID:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "get_context",
  arguments: {
    id: "feature-design-v1",
    projectId: "my-project" // Optional for project contexts
  }
});
```

### 4. list_contexts
List contexts with filtering:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "list_contexts",
  arguments: {
    projectId: "my-project", // Optional: filter by project
    tag: "design",          // Optional: filter by tag
    type: "project"         // Optional: 'project' or 'conversation'
  }
});
```

## Best Practices

### Context Organization
1. Use consistent naming patterns:
   - Project contexts: `{feature}-{type}-v{version}`
   - Conversation contexts: `chat-{date}-{sequence}`

2. Tag effectively:
   - Use project-specific tags
   - Include status tags
   - Add type tags (e.g., "design", "meeting")

3. Utilize metadata:
   - Add status information
   - Include relevant timestamps
   - Store participant information
   - Track versions

### Context Relationships
1. Parent-Child:
   - Use parentContextId for hierarchical relationships
   - Link iterations with previous versions

2. References:
   - Link related contexts
   - Cross-reference documentation
   - Connect discussions to implementations

### Session Management
1. Track conversation flows:
   - Use consistent sessionId for related conversations
   - Link sequential conversations with continuationOf
   - Add metadata for conversation status

2. Project Integration:
   - Tag conversations with project identifiers
   - Reference project contexts in conversations
   - Maintain project-specific conversation threads

## Implementation Details

### Storage
- Contexts are stored as JSON files
- Project contexts are organized in project-specific directories
- An index file maintains quick lookup capabilities
- All timestamps use ISO 8601 format

### Performance
- Lazy loading of contexts
- Index-based quick lookups
- Efficient filtering mechanisms
- Asynchronous file operations

### Security
- Contexts are stored in user's home directory
- File permissions follow system defaults
- No sensitive data in context identifiers
- Metadata validation for safe storage

## Example Workflows

### Project Documentation
```typescript
// Save initial requirements
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_project_context",
  arguments: {
    id: "requirements-v1",
    projectId: "my-project",
    content: "Project requirements...",
    tags: ["requirements", "initial"]
  }
});

// Save design based on requirements
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_project_context",
  arguments: {
    id: "design-v1",
    projectId: "my-project",
    content: "Design specifications...",
    parentContextId: "requirements-v1",
    tags: ["design"]
  }
});
```

### Conversation Continuity
```typescript
// Initial conversation
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_conversation_context",
  arguments: {
    id: "chat-2024-01-01-1",
    sessionId: "session-123",
    content: "Initial discussion...",
    tags: ["meeting"]
  }
});

// Continuation
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_conversation_context",
  arguments: {
    id: "chat-2024-01-01-2",
    sessionId: "session-123",
    content: "Continued discussion...",
    continuationOf: "chat-2024-01-01-1",
    tags: ["meeting"]
  }
});
