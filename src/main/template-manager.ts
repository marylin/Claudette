import { app } from 'electron'
import path from 'path'
import fs from 'fs'

export interface PromptTemplate {
  id: string
  name: string
  description: string
  prompt: string
  variables: string[] // extracted from {{var}} placeholders
  category: 'builtin' | 'custom'
  createdAt: string
}

const TEMPLATES_FILE = path.join(app.getPath('userData'), 'templates.json')

const BUILTIN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'builtin-refactor',
    name: 'Refactor Code',
    description: 'Refactor selected code for better readability and maintainability',
    prompt: 'Refactor the following code in {{file}}. Focus on:\n- Improving readability\n- Reducing complexity\n- Better naming\n- DRY principle\n\nKeep the same functionality. Explain what you changed and why.',
    variables: ['file'],
    category: 'builtin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'builtin-explain',
    name: 'Explain Code',
    description: 'Get a clear explanation of how code works',
    prompt: 'Explain how {{file}} works. Cover:\n- What it does at a high level\n- Key functions/classes and their responsibilities\n- Data flow\n- Any notable patterns or design decisions',
    variables: ['file'],
    category: 'builtin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'builtin-tests',
    name: 'Write Tests',
    description: 'Generate comprehensive tests for a file or function',
    prompt: 'Write comprehensive tests for {{file}}. Include:\n- Unit tests for each public function/method\n- Edge cases and error handling\n- Use the existing test framework in this project\n- Follow existing test conventions',
    variables: ['file'],
    category: 'builtin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'builtin-document',
    name: 'Add Documentation',
    description: 'Generate documentation and comments for code',
    prompt: 'Add documentation to {{file}}. Include:\n- JSDoc/docstring comments for all exported functions/classes\n- Parameter and return type descriptions\n- Usage examples where helpful\n- Keep it concise and accurate',
    variables: ['file'],
    category: 'builtin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'builtin-fix-bug',
    name: 'Fix Bug',
    description: 'Analyze and fix a bug with root cause analysis',
    prompt: 'There is a bug: {{description}}\n\nSteps:\n1. Analyze the root cause\n2. Explain why it happens\n3. Fix it with minimal changes\n4. Verify the fix doesn\'t break anything else',
    variables: ['description'],
    category: 'builtin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'builtin-review',
    name: 'Code Review',
    description: 'Review code for bugs, security, and best practices',
    prompt: 'Review {{file}} for:\n- Bugs and logic errors\n- Security vulnerabilities\n- Performance issues\n- Code style and best practices\n\nRate severity (high/medium/low) for each finding.',
    variables: ['file'],
    category: 'builtin',
    createdAt: '2025-01-01T00:00:00Z',
  },
]

function extractVariables(prompt: string): string[] {
  const matches = prompt.match(/\{\{(\w+)\}\}/g) || []
  return [...new Set(matches.map((m) => m.slice(2, -2)))]
}

function readCustomTemplates(): PromptTemplate[] {
  try {
    if (!fs.existsSync(TEMPLATES_FILE)) return []
    return JSON.parse(fs.readFileSync(TEMPLATES_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function writeCustomTemplates(templates: PromptTemplate[]): void {
  fs.writeFileSync(TEMPLATES_FILE, JSON.stringify(templates, null, 2), 'utf-8')
}

export function listTemplates(): PromptTemplate[] {
  return [...BUILTIN_TEMPLATES, ...readCustomTemplates()]
}

export function saveTemplate(template: Omit<PromptTemplate, 'variables' | 'category' | 'createdAt'>): PromptTemplate {
  const customs = readCustomTemplates()
  const variables = extractVariables(template.prompt)
  const existing = customs.findIndex((t) => t.id === template.id)

  const full: PromptTemplate = {
    ...template,
    variables,
    category: 'custom',
    createdAt: existing >= 0 ? customs[existing].createdAt : new Date().toISOString(),
  }

  if (existing >= 0) {
    customs[existing] = full
  } else {
    customs.push(full)
  }

  writeCustomTemplates(customs)
  return full
}

export function deleteTemplate(id: string): void {
  const customs = readCustomTemplates()
  writeCustomTemplates(customs.filter((t) => t.id !== id))
}

export function resolveTemplate(prompt: string, variables: Record<string, string>): string {
  let resolved = prompt
  for (const [key, value] of Object.entries(variables)) {
    resolved = resolved.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return resolved
}
