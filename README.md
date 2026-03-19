# Claude Server MCP

> **ARCHIVED** — This project is no longer maintained (March 2026).

## Why archived

This project aimed to provide persistent context management across Claude sessions via an MCP server. Since then, Claude Code has shipped native solutions that supersede this:

- **Auto-memory** (`~/.claude/projects/*/memory/`) — persistent, file-based memory across conversations
- **CLAUDE.md** — project-level instructions loaded automatically into every session
- **Built-in conversation continuity** — Claude Code now maintains context natively

This project never progressed beyond v0.1.0 (6 commits, no tests, no production users).

## What it was

A Model Context Protocol (MCP) server providing:

- Hierarchical project context organization
- Session-based conversation tracking
- JSON-based persistent storage at `~/.claude/`

## Alternatives

- **Claude Code's built-in memory system** — does everything this project attempted, natively
- **CLAUDE.md files** — project-specific context that persists across sessions
- **MCP resources** — Claude Code's native MCP integration for external context

## License

MIT
