# Claude Server Architecture

## Overview

The Claude Server is built using the Model Context Protocol (MCP) SDK and provides context management capabilities through a set of tools. The server is designed to be simple, efficient, and easily extensible.

## Core Components

### ClaudeServer Class

The main server class that handles:
- Tool registration and request handling
- Context storage and retrieval
- Error handling and lifecycle management

### Context Management

Contexts are managed through a file-based storage system:
- Each context is stored as a separate JSON file
- Files are named using the context ID
- Automatic directory creation and management
- Built-in error handling for file operations

### Tool Handlers

The server implements three main tools:
1. save_context: Creates/updates context files
2. get_context: Retrieves context data
3. list_contexts: Lists available contexts with filtering

## Data Flow

1. Tool Request
   - Client sends tool request via MCP
   - Server validates request parameters
   - Request is routed to appropriate handler

2. Context Operations
   - File system operations are wrapped in try/catch blocks
   - Errors are converted to appropriate MCP error codes
   - Successful operations return formatted responses

3. Response Handling
   - Responses are formatted according to MCP specifications
   - Content is wrapped in appropriate content type
   - Errors include descriptive messages

## Error Handling

The server implements comprehensive error handling:
- File system errors (ENOENT, etc.)
- Invalid request parameters
- Unknown tool requests
- General runtime errors

## Storage Design

### Directory Structure
```
~/Documents/Claude/contexts/
  ├── context-1.json
  ├── context-2.json
  └── ...
```

### File Format
```json
{
  "id": "unique-id",
  "content": "context content",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "tags": ["tag1", "tag2"]
}
```

## Implementation Details

### Context Interface
```typescript
interface Context {
  id: string;
  content: string;
  timestamp: string;
  tags?: string[];
}
```

### Key Methods

#### ensureContextDir
- Creates context directory if it doesn't exist
- Uses recursive creation for nested paths
- Handles permissions and existence checks

#### saveContext
- Validates context data
- Ensures directory exists
- Writes JSON file atomically
- Updates existing contexts

#### getContext
- Handles missing file cases
- Parses and validates JSON
- Returns null for non-existent contexts

#### listContexts
- Reads directory contents
- Filters JSON files
- Sorts by timestamp
- Supports tag filtering

## Future Enhancements

Potential areas for expansion:
1. Context versioning
2. Backup/restore functionality
3. Context search capabilities
4. Context merging
5. Export/import features

## Security Considerations

- File permissions are handled by the OS
- Input validation prevents directory traversal
- JSON parsing is wrapped in try/catch
- File operations use safe paths

## Performance

The server is designed for efficiency:
- Lazy loading of contexts
- No in-memory caching (relies on OS cache)
- Asynchronous file operations
- Minimal dependencies
