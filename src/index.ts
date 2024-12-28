#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

interface Context {
  id: string;
  content: string;
  timestamp: string;
  tags?: string[];
}

class ClaudeServer {
  private server: Server;
  private contextDir: string;

  constructor() {
    this.server = new Server(
      {
        name: 'claude-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Store contexts in user's Documents directory
    this.contextDir = path.join(process.env.HOME || '~', 'Documents', 'Claude', 'contexts');
    
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async ensureContextDir() {
    await fs.mkdir(this.contextDir, { recursive: true });
  }

  private async saveContext(context: Context) {
    await this.ensureContextDir();
    const filename = `${context.id}.json`;
    await fs.writeFile(
      path.join(this.contextDir, filename),
      JSON.stringify(context, null, 2),
      'utf-8'
    );
  }

  private async getContext(id: string): Promise<Context | null> {
    try {
      const data = await fs.readFile(
        path.join(this.contextDir, `${id}.json`),
        'utf-8'
      );
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private async listContexts(): Promise<Context[]> {
    await this.ensureContextDir();
    const files = await fs.readdir(this.contextDir);
    const contexts: Context[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const data = await fs.readFile(path.join(this.contextDir, file), 'utf-8');
        contexts.push(JSON.parse(data));
      }
    }
    
    return contexts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
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
        },
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
        },
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
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'save_context': {
          const { id, content, tags } = request.params.arguments as {
            id: string;
            content: string;
            tags?: string[];
          };

          const context: Context = {
            id,
            content,
            timestamp: new Date().toISOString(),
            tags,
          };

          await this.saveContext(context);
          return {
            content: [
              {
                type: 'text',
                text: `Context saved with ID: ${id}`,
              },
            ],
          };
        }

        case 'get_context': {
          const { id } = request.params.arguments as { id: string };
          const context = await this.getContext(id);

          if (!context) {
            throw new McpError(
              ErrorCode.InvalidRequest,
              `Context not found with ID: ${id}`
            );
          }

          return {
            content: [
              {
                type: 'text',
                text: context.content,
              },
            ],
          };
        }

        case 'list_contexts': {
          const { tag } = request.params.arguments as { tag?: string };
          let contexts = await this.listContexts();

          if (tag) {
            contexts = contexts.filter(
              (ctx) => ctx.tags?.includes(tag)
            );
          }

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(contexts, null, 2),
              },
            ],
          };
        }

        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Claude MCP server running on stdio');
  }
}

const server = new ClaudeServer();
server.run().catch(console.error);
