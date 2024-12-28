# Claude Server Usage Guide

## Introduction

The Claude Server provides powerful context management capabilities that help maintain conversation state and knowledge across sessions. This guide explains how to effectively use these features.

## Getting Started

The server is automatically configured in your Claude desktop app. No additional setup is required - contexts will be stored in `~/Documents/Claude/contexts/` by default.

## Basic Usage

### Saving Context

Use the `save_context` tool to store important conversation details:

```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_context",
  arguments: {
    id: "project-requirements",
    content: "Project requirements discussed: 1. Feature X, 2. Feature Y...",
    tags: ["project", "requirements"]
  }
});
```

Best practices for saving contexts:
- Use descriptive IDs that are easy to remember
- Include relevant tags for better organization
- Keep content focused and specific
- Update existing contexts when needed

### Retrieving Context

To retrieve a previously saved context:

```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "get_context",
  arguments: {
    id: "project-requirements"
  }
});
```

Tips for effective retrieval:
- Keep track of context IDs
- Handle potential missing contexts
- Use consistent naming conventions

### Listing Contexts

To view available contexts:

```typescript
// List all contexts
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "list_contexts",
  arguments: {}
});

// Filter by tag
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "list_contexts",
  arguments: {
    tag: "project"
  }
});
```

## Organization Tips

### Effective Tagging

Create a consistent tagging system:
- Use project names as tags
- Add topic-specific tags
- Include status tags (e.g., "active", "archived")
- Use hierarchical tags (e.g., "project/frontend", "project/backend")

Example tag structures:
```typescript
// Project-based
tags: ["project-x", "frontend", "requirements"]

// Topic-based
tags: ["api", "documentation", "design"]

// Status-based
tags: ["active", "high-priority", "in-progress"]
```

### Naming Conventions

Suggested ID naming patterns:
- project-name/feature
- topic/subtopic
- date-based: YYYY-MM-DD/topic
- sequential: project-001, project-002

Examples:
```typescript
// Feature-based
id: "authentication/login-flow"

// Date-based
id: "2024-01-15/team-meeting"

// Sequential
id: "project-x-001"
```

## Advanced Usage

### Context Chaining

Link related contexts using references:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_context",
  arguments: {
    id: "feature-x-part2",
    content: "Continuation of feature-x-part1: ...",
    tags: ["feature-x", "continuation"]
  }
});
```

### Context Updates

Update existing contexts while maintaining history:
```typescript
use_mcp_tool({
  server_name: "claude-server",
  tool_name: "save_context",
  arguments: {
    id: "project-status",
    content: "Updated status: ...",
    tags: ["project", "status", "updated"]
  }
});
```

## Best Practices

1. Regular Organization
   - Review and clean up contexts periodically
   - Archive completed project contexts
   - Update tags to reflect current status

2. Content Structure
   - Use clear formatting
   - Include relevant metadata
   - Keep content concise and focused

3. Backup Considerations
   - Regularly backup the contexts directory
   - Document important context IDs
   - Maintain a tag glossary

## Troubleshooting

Common issues and solutions:

1. Context Not Found
   - Verify the context ID
   - Check for typos in the ID
   - Ensure the context was saved successfully

2. Tag Filtering Issues
   - Check tag case sensitivity
   - Verify tag exists in contexts
   - Review tag naming consistency

3. Storage Issues
   - Check directory permissions
   - Verify available disk space
   - Ensure valid JSON format

## Tips for Teams

When using the context management system in a team:

1. Establish Conventions
   - Agree on naming patterns
   - Define standard tags
   - Document context structure

2. Share Context IDs
   - Include IDs in documentation
   - Reference contexts in tickets
   - Link related contexts

3. Maintain Organization
   - Regular cleanup
   - Tag consistency
   - Clear ownership
