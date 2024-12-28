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

interface BaseContext {
  id: string;
  content: string;
  timestamp: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

interface ProjectContext extends BaseContext {
  projectId: string;
  parentContextId?: string;
  references?: string[];
}

interface ConversationContext extends BaseContext {
  sessionId: string;
  continuationOf?: string;
}

type Context = ProjectContext | ConversationContext;

class ClaudeServer {
  private server: Server;
  private baseDir: string;
  private contextsDir: string;
  private projectsDir: string;
  private indexFile: string;

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

    // Use .claude directory in home for better organization
    this.baseDir = path.join(process.env.HOME || '~', '.claude');
    this.contextsDir = path.join(this.baseDir, 'contexts');
    this.projectsDir = path.join(this.baseDir, 'projects');
    this.indexFile = path.join(this.baseDir, 'context-index.json');
    
    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private async ensureDirectories() {
    await fs.mkdir(this.contextsDir, { recursive: true });
    await fs.mkdir(this.projectsDir, { recursive: true });
  }

  private async getContextPath(id: string, projectId?: string): Promise<string> {
    if (projectId) {
      const projectDir = path.join(this.projectsDir, projectId);
      await fs.mkdir(projectDir, { recursive: true });
      return path.join(projectDir, `${id}.json`);
    }
    return path.join(this.contextsDir, `${id}.json`);
  }

  private async updateIndex(context: Context) {
    try {
      const indexData = await fs.readFile(this.indexFile, 'utf-8')
        .then(data => JSON.parse(data))
        .catch(() => ({ contexts: [] }));

      const existingIndex = indexData.contexts.findIndex((c: Context) => c.id === context.id);
      if (existingIndex >= 0) {
        indexData.contexts[existingIndex] = context;
      } else {
        indexData.contexts.push(context);
      }

      await fs.writeFile(this.indexFile, JSON.stringify(indexData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error updating index:', error);
    }
  }

  private async saveContext(context: Context) {
    await this.ensureDirectories();
    const contextPath = await this.getContextPath(
      context.id,
      'projectId' in context ? context.projectId : undefined
    );
    
    await fs.writeFile(contextPath, JSON.stringify(context, null, 2), 'utf-8');
    await this.updateIndex(context);
  }

  private async getContext(id: string, projectId?: string): Promise<Context | null> {
    try {
      const contextPath = await this.getContextPath(id, projectId);
      const data = await fs.readFile(contextPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  private async listContexts(options: {
    projectId?: string;
    tag?: string;
    type?: 'project' | 'conversation';
  } = {}): Promise<Context[]> {
    await this.ensureDirectories();
    
    const getContextsFromDir = async (dir: string): Promise<Context[]> => {
      const files = await fs.readdir(dir);
      const contexts: Context[] = [];
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = await fs.readFile(path.join(dir, file), 'utf-8');
          contexts.push(JSON.parse(data));
        }
      }
      
      return contexts;
    };

    let contexts: Context[] = [];
    
    if (options.projectId) {
      const projectDir = path.join(this.projectsDir, options.projectId);
      contexts = await getContextsFromDir(projectDir);
    } else if (options.type === 'project') {
      contexts = await getContextsFromDir(this.projectsDir);
    } else if (options.type === 'conversation') {
      contexts = await getContextsFromDir(this.contextsDir);
    } else {
      const projectContexts = await getContextsFromDir(this.projectsDir);
      const conversationContexts = await getContextsFromDir(this.contextsDir);
      contexts = [...projectContexts, ...conversationContexts];
    }

    if (options.tag) {
      contexts = contexts.filter(ctx => ctx.tags?.includes(options.tag!));
    }

    return contexts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'save_project_context',
          description: 'Save project-specific context with relationships',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the context',
              },
              projectId: {
                type: 'string',
                description: 'Project identifier',
              },
              content: {
                type: 'string',
                description: 'Context content to save',
              },
              parentContextId: {
                type: 'string',
                description: 'Optional ID of parent context',
              },
              references: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional related context IDs',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional tags for categorizing',
              },
              metadata: {
                type: 'object',
                description: 'Optional additional metadata',
              },
            },
            required: ['id', 'projectId', 'content'],
          },
        },
        {
          name: 'save_conversation_context',
          description: 'Save conversation context with continuation support',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the context',
              },
              sessionId: {
                type: 'string',
                description: 'Conversation session identifier',
              },
              content: {
                type: 'string',
                description: 'Context content to save',
              },
              continuationOf: {
                type: 'string',
                description: 'Optional ID of previous context',
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Optional tags for categorizing',
              },
              metadata: {
                type: 'object',
                description: 'Optional additional metadata',
              },
            },
            required: ['id', 'sessionId', 'content'],
          },
        },
        {
          name: 'get_context',
          description: 'Retrieve context by ID and optional project ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'ID of the context to retrieve',
              },
              projectId: {
                type: 'string',
                description: 'Optional project ID for project contexts',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'list_contexts',
          description: 'List contexts with filtering options',
          inputSchema: {
            type: 'object',
            properties: {
              projectId: {
                type: 'string',
                description: 'Optional project ID to filter by',
              },
              tag: {
                type: 'string',
                description: 'Optional tag to filter by',
              },
              type: {
                type: 'string',
                enum: ['project', 'conversation'],
                description: 'Optional type to filter by',
              },
            },
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'save_project_context': {
          const {
            id,
            projectId,
            content,
            parentContextId,
            references,
            tags,
            metadata,
          } = request.params.arguments as {
            id: string;
            projectId: string;
            content: string;
            parentContextId?: string;
            references?: string[];
            tags?: string[];
            metadata?: Record<string, unknown>;
          };

          const context: ProjectContext = {
            id,
            projectId,
            content,
            timestamp: new Date().toISOString(),
            parentContextId,
            references,
            tags,
            metadata,
          };

          await this.saveContext(context);
          return {
            content: [
              {
                type: 'text',
                text: `Project context saved with ID: ${id}`,
              },
            ],
          };
        }

        case 'save_conversation_context': {
          const {
            id,
            sessionId,
            content,
            continuationOf,
            tags,
            metadata,
          } = request.params.arguments as {
            id: string;
            sessionId: string;
            content: string;
            continuationOf?: string;
            tags?: string[];
            metadata?: Record<string, unknown>;
          };

          const context: ConversationContext = {
            id,
            sessionId,
            content,
            timestamp: new Date().toISOString(),
            continuationOf,
            tags,
            metadata,
          };

          await this.saveContext(context);
          return {
            content: [
              {
                type: 'text',
                text: `Conversation context saved with ID: ${id}`,
              },
            ],
          };
        }

        case 'get_context': {
          const { id, projectId } = request.params.arguments as {
            id: string;
            projectId?: string;
          };
          
          const context = await this.getContext(id, projectId);

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
          const { projectId, tag, type } = request.params.arguments as {
            projectId?: string;
            tag?: string;
            type?: 'project' | 'conversation';
          };

          const contexts = await this.listContexts({ projectId, tag, type });

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
