import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock simple-git
const mockGit = {
  checkIsRepo: vi.fn(),
  status: vi.fn(),
  diff: vi.fn(),
  add: vi.fn(),
  reset: vi.fn(),
  commit: vi.fn(),
  getRemotes: vi.fn(),
  log: vi.fn(),
}

vi.mock('simple-git', () => ({
  default: () => mockGit,
}))

const {
  getGitStatus,
  getGitDiff,
  gitStage,
  gitUnstage,
  gitCommit,
  getGitRemoteUrl,
  getGitLog,
} = await import('../../src/main/git-manager')

describe('git-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGitStatus', () => {
    it('returns isRepo false when not a git repo', async () => {
      mockGit.checkIsRepo.mockResolvedValue(false)
      const status = await getGitStatus('/some/path')
      expect(status.isRepo).toBe(false)
      expect(status.files).toEqual([])
    })

    it('returns full status for a git repo', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true)
      mockGit.status.mockResolvedValue({
        current: 'main',
        modified: ['src/file.ts'],
        not_added: ['new-file.ts'],
        deleted: [],
        created: [],
        staged: [],
        renamed: [],
        ahead: 2,
        behind: 0,
      })

      const status = await getGitStatus('/some/path')
      expect(status.isRepo).toBe(true)
      expect(status.branch).toBe('main')
      expect(status.ahead).toBe(2)
      expect(status.behind).toBe(0)
      expect(status.files).toHaveLength(2)
      expect(status.files[0]).toEqual({ path: 'src/file.ts', status: 'modified', staged: false })
      expect(status.files[1]).toEqual({ path: 'new-file.ts', status: 'untracked', staged: false })
    })

    it('marks staged files correctly', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true)
      mockGit.status.mockResolvedValue({
        current: 'feature',
        modified: ['file.ts'],
        not_added: [],
        deleted: [],
        created: [],
        staged: ['file.ts'],
        renamed: [],
        ahead: 0,
        behind: 0,
      })

      const status = await getGitStatus('/some/path')
      expect(status.files).toHaveLength(1)
      expect(status.files[0].staged).toBe(true)
    })

    it('handles renamed files', async () => {
      mockGit.checkIsRepo.mockResolvedValue(true)
      mockGit.status.mockResolvedValue({
        current: 'main',
        modified: [],
        not_added: [],
        deleted: [],
        created: [],
        staged: [],
        renamed: [{ from: 'old.ts', to: 'new.ts' }],
        ahead: 0,
        behind: 0,
      })

      const status = await getGitStatus('/some/path')
      expect(status.files).toHaveLength(1)
      expect(status.files[0]).toEqual({ path: 'new.ts', status: 'renamed', staged: true })
    })

    it('returns safe defaults on error', async () => {
      mockGit.checkIsRepo.mockRejectedValue(new Error('git not found'))
      const status = await getGitStatus('/some/path')
      expect(status.isRepo).toBe(false)
      expect(status.files).toEqual([])
    })
  })

  describe('getGitDiff', () => {
    it('returns diff for modified file', async () => {
      mockGit.diff.mockResolvedValue('--- a/file.ts\n+++ b/file.ts\n@@ -1 +1 @@\n-old\n+new')
      const diff = await getGitDiff('/path', 'file.ts')
      expect(diff).toContain('-old')
      expect(diff).toContain('+new')
    })

    it('falls back to staged diff when unstaged is empty', async () => {
      mockGit.diff.mockResolvedValueOnce('').mockResolvedValueOnce('staged diff content')
      const diff = await getGitDiff('/path', 'file.ts')
      expect(diff).toBe('staged diff content')
    })

    it('returns empty string on error', async () => {
      mockGit.diff.mockRejectedValue(new Error('fail'))
      const diff = await getGitDiff('/path', 'file.ts')
      expect(diff).toBe('')
    })
  })

  describe('gitStage', () => {
    it('adds files to staging', async () => {
      mockGit.add.mockResolvedValue(undefined)
      await gitStage('/path', ['file1.ts', 'file2.ts'])
      expect(mockGit.add).toHaveBeenCalledWith(['file1.ts', 'file2.ts'])
    })
  })

  describe('gitUnstage', () => {
    it('resets files from staging', async () => {
      mockGit.reset.mockResolvedValue(undefined)
      await gitUnstage('/path', ['file1.ts'])
      expect(mockGit.reset).toHaveBeenCalledWith(['HEAD', 'file1.ts'])
    })
  })

  describe('gitCommit', () => {
    it('commits with message', async () => {
      mockGit.commit.mockResolvedValue(undefined)
      await gitCommit('/path', 'fix: resolve bug')
      expect(mockGit.commit).toHaveBeenCalledWith('fix: resolve bug')
    })
  })

  describe('getGitRemoteUrl', () => {
    it('returns HTTPS URL for SSH remote', async () => {
      mockGit.getRemotes.mockResolvedValue([
        { name: 'origin', refs: { push: 'git@github.com:user/repo.git' } },
      ])
      const url = await getGitRemoteUrl('/path')
      expect(url).toBe('https://github.com/user/repo')
    })

    it('strips .git from HTTPS remote', async () => {
      mockGit.getRemotes.mockResolvedValue([
        { name: 'origin', refs: { push: 'https://github.com/user/repo.git' } },
      ])
      const url = await getGitRemoteUrl('/path')
      expect(url).toBe('https://github.com/user/repo')
    })

    it('returns null when no origin remote', async () => {
      mockGit.getRemotes.mockResolvedValue([
        { name: 'upstream', refs: { push: 'https://github.com/other/repo.git' } },
      ])
      const url = await getGitRemoteUrl('/path')
      expect(url).toBeNull()
    })

    it('returns null on error', async () => {
      mockGit.getRemotes.mockRejectedValue(new Error('fail'))
      const url = await getGitRemoteUrl('/path')
      expect(url).toBeNull()
    })
  })

  describe('getGitLog', () => {
    it('returns formatted log entries', async () => {
      mockGit.log.mockResolvedValue({
        all: [
          { hash: 'abcdef1234567890', message: 'feat: add feature', date: '2026-03-09', author_name: 'Dev' },
          { hash: '1234567890abcdef', message: 'fix: resolve bug', date: '2026-03-08', author_name: 'Dev' },
        ],
      })

      const log = await getGitLog('/path', 5)
      expect(log).toHaveLength(2)
      expect(log[0].hash).toBe('abcdef1')
      expect(log[0].message).toBe('feat: add feature')
    })

    it('returns empty array on error', async () => {
      mockGit.log.mockRejectedValue(new Error('fail'))
      const log = await getGitLog('/path')
      expect(log).toEqual([])
    })
  })
})
