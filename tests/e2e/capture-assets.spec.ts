/**
 * Playwright Asset Capture Script
 *
 * Launches the Electron app (with Vite dev server) and captures
 * high-quality screenshots and video for docs/promotional use.
 *
 * Screenshots → docs/screenshots/
 * Videos     → docs/04-Design/videos/
 *
 * Run: npx playwright test tests/e2e/capture-assets.spec.ts
 */
import { test, type ElectronApplication, type Page } from '@playwright/test'
import { _electron as electron } from 'playwright'
import { spawn, type ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'
import http from 'http'

const SCREENSHOT_DIR = path.join(__dirname, '../../docs/screenshots')
const VIDEO_DIR = path.join(__dirname, '../../docs/04-Design/videos')

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
fs.mkdirSync(VIDEO_DIR, { recursive: true })

let app: ElectronApplication
let page: Page
let viteProcess: ChildProcess

// Use longer timeout for asset capture — we deliberately pause for quality.
// The full walkthrough with realistic interactions needs more time.
test.setTimeout(180_000)

/** Wait for Vite dev server to respond on localhost:5173 */
function waitForVite(timeoutMs = 30_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      const req = http.get('http://localhost:5173', (res) => {
        res.resume()
        resolve()
      })
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) {
          reject(new Error('Vite dev server did not start in time'))
        } else {
          setTimeout(check, 500)
        }
      })
      req.end()
    }
    check()
  })
}

test.beforeAll(async () => {
  // Start Vite dev server
  viteProcess = spawn('npx', ['vite', '--port', '5173'], {
    cwd: path.join(__dirname, '../..'),
    stdio: 'pipe',
    shell: true,
  })

  await waitForVite()

  // Launch Electron (it will connect to localhost:5173 since isDev = true)
  app = await electron.launch({
    args: [path.join(__dirname, '../../dist/main/main/index.js')],
    env: {
      ...process.env,
      NODE_ENV: 'development',
    },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 820 },
    },
    colorScheme: 'dark',
  })

  page = await app.firstWindow()
  await page.waitForLoadState('domcontentloaded')
  // Give React + Tailwind time to fully render and hydrate
  await page.waitForTimeout(3000)
})

test.afterAll(async () => {
  if (app) {
    await app.close()
  }
  if (viteProcess) {
    viteProcess.kill()
  }
})

// Helper: take a named screenshot with consistent settings
async function screenshot(name: string) {
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    type: 'png',
  })
}

// Helper: switch to a tab using keyboard shortcut
async function switchTab(num: 1 | 2 | 3 | 4 | 5) {
  await page.keyboard.press(`Control+${num}`)
  await page.waitForTimeout(800)
}

// ─── Interaction Helpers ────────────────────────────────────────

/** Type text character by character with a natural delay for video */
async function typeText(selector: string, text: string, charDelay = 40) {
  const el = page.locator(selector).first()
  await el.click()
  await page.waitForTimeout(200)
  for (const char of text) {
    await el.pressSequentially(char, { delay: charDelay })
  }
}

/** Click an element by its aria-label */
async function clickByLabel(label: string) {
  const el = page.locator(`[aria-label="${label}"]`).first()
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.click()
    await page.waitForTimeout(400)
  }
}

/** Click the first visible element matching text content */
async function clickByText(text: string) {
  const el = page.getByText(text, { exact: true }).first()
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.click()
    await page.waitForTimeout(400)
  }
}

/** Fill a text input/textarea found by placeholder text */
async function fillByPlaceholder(placeholder: string, value: string, charDelay = 40) {
  const el = page.locator(`[placeholder="${placeholder}"]`).first()
  if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
    await el.click()
    await page.waitForTimeout(200)
    await el.pressSequentially(value, { delay: charDelay })
  }
}

/** Video-friendly pause — longer than screenshot pauses */
async function hold(ms = 1200) {
  await page.waitForTimeout(ms)
}

// ─── Screenshot Captures ───────────────────────────────────────

test.describe.serial('Asset Capture', () => {
  test('01 — Chat tab (default view)', async () => {
    await screenshot('chat')
  })

  test('02 — Chat tab with sidebar collapsed', async () => {
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(600)
    await screenshot('chat-collapsed-sidebar')
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(600)
  })

  test('03 — Files tab', async () => {
    await switchTab(2)
    await screenshot('files')
  })

  test('04 — Git tab', async () => {
    await switchTab(3)
    await screenshot('git')
  })

  test('05 — Agents tab', async () => {
    await switchTab(4)
    await screenshot('agents')
  })

  test('06 — Usage tab', async () => {
    await switchTab(5)
    await screenshot('usage')
  })

  test('07 — Terminal panel open', async () => {
    await switchTab(1)
    await page.keyboard.press('Control+`')
    await page.waitForTimeout(1000)
    await screenshot('chat-with-terminal')
    await page.keyboard.press('Control+`')
    await page.waitForTimeout(500)
  })

  test('08 — Command palette', async () => {
    await page.keyboard.press('Control+k')
    await page.waitForTimeout(600)
    await screenshot('command-palette')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(400)
  })

  test('09 — Settings panel', async () => {
    const settingsBtn = page.locator('[aria-label="Settings"]').first()
    if (await settingsBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsBtn.click()
      await page.waitForTimeout(1000)
      await screenshot('settings')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(400)
    }
  })

  // ─── Video: Full Walkthrough ─────────────────────────────────
  //
  // This test produces the main demo video. It performs realistic
  // interactions across every major panel so the .webm looks like
  // an actual user session, not just tab navigation.

  test('10 — Full walkthrough for video', async () => {
    // ── 1. Chat panel: type and send a message ──────────────
    await switchTab(1)
    await hold(1500)

    // Type a realistic prompt into the chat input
    await fillByPlaceholder(
      'Message Claude... (Enter to send, Shift+Enter for newline)',
      'Refactor the auth middleware to use JWT tokens instead of session cookies',
      35
    )
    await hold(800)

    // Click Send (message won't actually reach Claude CLI, but shows the UX)
    await clickByLabel('Send')
    await hold(1500)

    // ── 2. Open terminal briefly ────────────────────────────
    await page.keyboard.press('Control+`')
    await hold(1800)
    await page.keyboard.press('Control+`')
    await hold(600)

    // ── 3. Files tab: filter and browse ─────────────────────
    await switchTab(2)
    await hold(1000)

    // Type a filter query
    await fillByPlaceholder('Filter files...', 'tsconfig', 50)
    await hold(1200)

    // Clear the filter
    const filterInput = page.locator('[placeholder="Filter files..."]').first()
    if (await filterInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await filterInput.fill('')
      await hold(600)
    }

    // Click the first visible file/folder item in the tree
    const firstFileItem = page.locator('.overflow-y-auto button').first()
    if (await firstFileItem.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstFileItem.click()
      await hold(1500)

      // Click a second item if present to show navigation
      const secondItem = page.locator('.overflow-y-auto button').nth(2)
      if (await secondItem.isVisible({ timeout: 1000 }).catch(() => false)) {
        await secondItem.click()
        await hold(1500)
      }
    }

    // ── 4. Git tab: browse changes and type commit ──────────
    await switchTab(3)
    await hold(1000)

    // Click the first changed file to view its diff
    const gitFile = page.locator('.overflow-y-auto button .font-mono').first()
    if (await gitFile.isVisible({ timeout: 2000 }).catch(() => false)) {
      await gitFile.click()
      await hold(2000) // Let the diff viewer load and render
    }

    // Click "Stage all" if visible
    const stageAll = page.getByText('Stage all').first()
    if (await stageAll.isVisible({ timeout: 1500 }).catch(() => false)) {
      await stageAll.click()
      await hold(800)
    }

    // Type a commit message
    await fillByPlaceholder('Commit message...', 'feat(auth): migrate to JWT tokens', 30)
    await hold(1200)

    // Clear the commit message (don't actually commit)
    const commitTextarea = page.locator('[placeholder="Commit message..."]').first()
    if (await commitTextarea.isVisible({ timeout: 1000 }).catch(() => false)) {
      await commitTextarea.fill('')
      await hold(400)
    }

    // Unstage all to leave git clean
    const unstageAll = page.getByText('Unstage all').first()
    if (await unstageAll.isVisible({ timeout: 1000 }).catch(() => false)) {
      await unstageAll.click()
      await hold(600)
    }

    // ── 5. Agents tab: create a new agent ───────────────────
    await switchTab(4)
    await hold(1000)

    // Click "New Agent" or "Create Agent" (empty state button)
    const newAgentBtn = page.getByText('New Agent').first()
    const createAgentBtn = page.getByText('Create Agent').first()

    if (await newAgentBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await newAgentBtn.click()
    } else if (await createAgentBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await createAgentBtn.click()
    }
    await hold(800)

    // Fill in the agent form
    await fillByPlaceholder('My Agent', 'Code Reviewer', 40)
    await hold(400)
    await fillByPlaceholder('What this agent does', 'Reviews PRs for security issues and best practices', 30)
    await hold(400)
    await fillByPlaceholder(
      'You are a helpful assistant that...',
      'You are a senior code reviewer. Focus on security vulnerabilities, performance issues, and adherence to project conventions.',
      20
    )
    await hold(800)

    // Change the model dropdown
    const modelSelect = page.locator('select').first()
    if (await modelSelect.isVisible({ timeout: 1000 }).catch(() => false)) {
      await modelSelect.selectOption('claude-opus-4-5')
      await hold(600)
    }

    // Click Save
    await clickByText('Save')
    await hold(1200)

    // ── 6. Usage tab: view analytics ────────────────────────
    await switchTab(5)
    await hold(1500)

    // Click Refresh
    const refreshBtn = page.getByText('Refresh').first()
    if (await refreshBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await refreshBtn.click()
      await hold(1500)
    }

    // ── 7. Command palette: search and navigate ─────────────
    await page.keyboard.press('Control+k')
    await hold(800)

    // Type a search query
    const paletteInput = page.locator('[placeholder="Type a command or search..."]').first()
    if (await paletteInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await paletteInput.pressSequentially('chat', { delay: 60 })
      await hold(800)

      // Arrow down to highlight an item
      await page.keyboard.press('ArrowDown')
      await hold(400)
      await page.keyboard.press('ArrowDown')
      await hold(400)

      // Press Enter to execute the selected command
      await page.keyboard.press('Enter')
      await hold(800)
    } else {
      await page.keyboard.press('Escape')
      await hold(400)
    }

    // ── 8. Settings panel: tweak some options ───────────────
    // Open settings via command palette
    await page.keyboard.press('Control+k')
    await hold(500)
    const paletteInput2 = page.locator('[placeholder="Type a command or search..."]').first()
    if (await paletteInput2.isVisible({ timeout: 1500 }).catch(() => false)) {
      await paletteInput2.pressSequentially('settings', { delay: 50 })
      await hold(600)
      await page.keyboard.press('Enter')
      await hold(1000)
    }

    // Interact with font size slider
    const fontSlider = page.locator('input[type="range"]').first()
    if (await fontSlider.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Drag the slider to a larger value
      await fontSlider.fill('16')
      await hold(600)
      await fontSlider.fill('14')
      await hold(600)
    }

    // Toggle the auto-accept checkbox
    const checkbox = page.locator('input[type="checkbox"]').first()
    if (await checkbox.isVisible({ timeout: 1000 }).catch(() => false)) {
      await checkbox.click()
      await hold(500)
      await checkbox.click() // Toggle back
      await hold(400)
    }

    // Close settings
    await clickByText('Cancel')
    await hold(600)

    // ── 9. Sidebar: collapse, expand, interact ──────────────
    await page.keyboard.press('Control+b')
    await hold(1200)
    await page.keyboard.press('Control+b')
    await hold(800)

    // Click a project in the sidebar if available
    const projectItem = page.locator('.overflow-y-auto button').first()
    if (await projectItem.isVisible({ timeout: 1000 }).catch(() => false)) {
      // Don't click — the locator might match content area buttons.
      // Instead just let the sidebar be visible.
    }

    // ── 10. End on Chat with a clean view ───────────────────
    await switchTab(1)
    await hold(2000)
  })
})
