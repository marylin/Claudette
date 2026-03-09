// Git manager - stub for Phase 0.1, full implementation in Phase 0.2
// Placeholder exports to satisfy imports

import type { GitStatus } from '../shared/types'

export async function getGitStatus(_projectPath: string): Promise<GitStatus> {
  return { branch: '', files: [], ahead: 0, behind: 0, isRepo: false }
}

export async function getGitDiff(_projectPath: string, _filePath: string): Promise<string> {
  return ''
}

export async function gitStage(_projectPath: string, _files: string[]): Promise<void> {}
export async function gitUnstage(_projectPath: string, _files: string[]): Promise<void> {}
export async function gitCommit(_projectPath: string, _message: string): Promise<void> {}
