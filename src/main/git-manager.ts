import simpleGit, { SimpleGit } from 'simple-git'
import type { GitStatus, GitFile } from '../shared/types'

function getGit(projectPath: string): SimpleGit {
  return simpleGit(projectPath)
}

export async function getGitStatus(projectPath: string): Promise<GitStatus> {
  try {
    const git = getGit(projectPath)
    const isRepo = await git.checkIsRepo()

    if (!isRepo) {
      return { branch: '', files: [], ahead: 0, behind: 0, isRepo: false }
    }

    const status = await git.status()
    const files: GitFile[] = []

    for (const f of status.modified) {
      files.push({ path: f, status: 'modified', staged: false })
    }
    for (const f of status.not_added) {
      files.push({ path: f, status: 'untracked', staged: false })
    }
    for (const f of status.deleted) {
      files.push({ path: f, status: 'deleted', staged: false })
    }
    for (const f of status.created) {
      files.push({ path: f, status: 'added', staged: true })
    }
    for (const f of status.staged) {
      // Check if already added
      const existing = files.find((x) => x.path === f)
      if (existing) {
        existing.staged = true
      } else {
        files.push({ path: f, status: 'modified', staged: true })
      }
    }
    for (const f of status.renamed) {
      files.push({ path: f.to, status: 'renamed', staged: true })
    }

    return {
      branch: status.current || '',
      files,
      ahead: status.ahead,
      behind: status.behind,
      isRepo: true,
    }
  } catch {
    return { branch: '', files: [], ahead: 0, behind: 0, isRepo: false }
  }
}

export async function getGitDiff(projectPath: string, filePath: string): Promise<string> {
  try {
    const git = getGit(projectPath)
    const diff = await git.diff([filePath])
    if (diff) return diff

    // Try staged diff
    const stagedDiff = await git.diff(['--cached', filePath])
    if (stagedDiff) return stagedDiff

    // Try diff against HEAD for untracked
    return await git.diff(['HEAD', '--', filePath]).catch(() => '')
  } catch {
    return ''
  }
}

export async function gitStage(projectPath: string, files: string[]): Promise<void> {
  const git = getGit(projectPath)
  await git.add(files)
}

export async function gitUnstage(projectPath: string, files: string[]): Promise<void> {
  const git = getGit(projectPath)
  await git.reset(['HEAD', ...files])
}

export async function gitCommit(projectPath: string, message: string): Promise<void> {
  const git = getGit(projectPath)
  await git.commit(message)
}
