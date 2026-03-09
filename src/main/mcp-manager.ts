import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export interface McpServer {
  id: string
  name: string
  type: 'stdio' | 'sse' | 'http'
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
  enabled: boolean
  scope: 'global' | 'project'
  source: string // file path where configured
}

export interface McpConfig {
  mcpServers?: Record<string, {
    command?: string
    args?: string[]
    url?: string
    type?: string
    env?: Record<string, string>
    disabled?: boolean
  }>
}

const CLAUDE_DIR = path.join(app.getPath('home'), '.claude')

function readJsonSafe<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function writeJsonSafe(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

function getGlobalConfigPath(): string {
  return path.join(CLAUDE_DIR, 'settings.json')
}

function getProjectConfigPath(projectPath: string): string {
  return path.join(projectPath, '.mcp.json')
}

function parseServersFromConfig(config: McpConfig, scope: 'global' | 'project', source: string): McpServer[] {
  if (!config.mcpServers) return []

  return Object.entries(config.mcpServers).map(([name, server]) => {
    const type: McpServer['type'] = server.url
      ? (server.type === 'sse' ? 'sse' : 'http')
      : 'stdio'

    return {
      id: `${scope}-${name}`,
      name,
      type,
      command: server.command,
      args: server.args,
      url: server.url,
      env: server.env,
      enabled: !server.disabled,
      scope,
      source,
    }
  })
}

export function listMcpServers(projectPath?: string): McpServer[] {
  const servers: McpServer[] = []

  // Global MCP servers from ~/.claude/settings.json
  const globalPath = getGlobalConfigPath()
  const globalConfig = readJsonSafe<McpConfig>(globalPath)
  if (globalConfig) {
    servers.push(...parseServersFromConfig(globalConfig, 'global', globalPath))
  }

  // Project-level MCP servers from .mcp.json
  if (projectPath) {
    const projectConfigPath = getProjectConfigPath(projectPath)
    const projectConfig = readJsonSafe<McpConfig>(projectConfigPath)
    if (projectConfig) {
      servers.push(...parseServersFromConfig(projectConfig, 'project', projectConfigPath))
    }
  }

  return servers
}

export function addMcpServer(
  server: Omit<McpServer, 'id' | 'source'>,
  projectPath?: string
): McpServer {
  const isProject = server.scope === 'project' && projectPath
  const configPath = isProject ? getProjectConfigPath(projectPath) : getGlobalConfigPath()
  const config = readJsonSafe<any>(configPath) || {}

  if (!config.mcpServers) config.mcpServers = {}

  const entry: any = {}
  if (server.type === 'stdio') {
    entry.command = server.command || ''
    if (server.args?.length) entry.args = server.args
  } else {
    entry.url = server.url || ''
    entry.type = server.type
  }
  if (server.env && Object.keys(server.env).length > 0) entry.env = server.env
  if (!server.enabled) entry.disabled = true

  config.mcpServers[server.name] = entry
  writeJsonSafe(configPath, config)

  return {
    ...server,
    id: `${server.scope}-${server.name}`,
    source: configPath,
  }
}

export function removeMcpServer(name: string, scope: 'global' | 'project', projectPath?: string): void {
  const isProject = scope === 'project' && projectPath
  const configPath = isProject ? getProjectConfigPath(projectPath!) : getGlobalConfigPath()
  const config = readJsonSafe<any>(configPath)

  if (config?.mcpServers?.[name]) {
    delete config.mcpServers[name]
    writeJsonSafe(configPath, config)
  }
}

export function toggleMcpServer(name: string, scope: 'global' | 'project', enabled: boolean, projectPath?: string): void {
  const isProject = scope === 'project' && projectPath
  const configPath = isProject ? getProjectConfigPath(projectPath!) : getGlobalConfigPath()
  const config = readJsonSafe<any>(configPath)

  if (config?.mcpServers?.[name]) {
    if (enabled) {
      delete config.mcpServers[name].disabled
    } else {
      config.mcpServers[name].disabled = true
    }
    writeJsonSafe(configPath, config)
  }
}
