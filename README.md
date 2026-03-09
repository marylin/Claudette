<div align="center">

<img src="docs/screenshots/files.png" alt="Claudette — File Explorer" width="100%" />

<h1>Claudette</h1>

<p><strong>The GUI that Claude Code should have shipped with.</strong></p>

<p>
  <a href="https://github.com/marylin/claudette/releases"><img src="https://img.shields.io/github/v/release/marylin/claudette?style=flat-square&color=7c6af7" alt="Release" /></a>
  <a href="https://github.com/marylin/claudette/blob/main/LICENSE"><img src="https://img.shields.io/github/license/marylin/claudette?style=flat-square&color=4ade80" alt="License" /></a>
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue?style=flat-square&color=60a5fa" alt="Platform" />
  <a href="https://github.com/marylin/claudette/stargazers"><img src="https://img.shields.io/github/stars/marylin/claudette?style=flat-square&color=fb923c" alt="Stars" /></a>
</p>

<p>
  <a href="#-installation">Install</a> ·
  <a href="#-features">Features</a> ·
  <a href="#-screenshots">Screenshots</a> ·
  <a href="#-contributing">Contributing</a>
</p>

</div>

---

Claudette is a free, open-source desktop app that wraps the Claude Code CLI in a beautiful visual interface. No new subscription needed — it uses your existing Claude Code account. Download the `.exe`, install, and you're coding with a real GUI in under 60 seconds.

> Built by [WhateverAI](https://whateverai.dev) · Powered by [Claude Code](https://claude.ai/code)

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| 💬 | **Chat Panel** | Stream Claude responses in real time with full markdown rendering and syntax-highlighted code blocks |
| 📁 | **File Explorer** | Browse your project tree, open files with syntax highlighting, see live changes as Claude edits |
| 🔀 | **Git Integration** | View diffs, stage files, write commit messages, and commit — all without leaving the app |
| 📝 | **CLAUDE.md Editor** | Monaco-powered editor with live preview for your project instructions |
| 🤖 | **Custom Agents** | Create reusable agents with custom system prompts, model selection, and tool permissions |
| 📊 | **Usage Dashboard** | Track token consumption and estimated costs with daily charts |
| 🖥️ | **Embedded Terminal** | Drop into raw CLI mode any time without switching windows |
| 🔄 | **Session History** | Resume any past conversation, browse history, never lose context |
| ⚡ | **Windows Native** | Proper `.exe` installer, no WSL, no build-from-source, no Rust required |

---

## 🚀 Installation

### Windows (Recommended)
1. Download `Claudette-Setup.exe` from the [latest release](https://github.com/marylin/claudette/releases/latest)
2. Run the installer
3. Open Claudette — it auto-detects your Claude Code CLI

**Requirement**: [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview) must be installed first.

### macOS
Download `Claudette.dmg` from [releases](https://github.com/marylin/claudette/releases/latest).

### Linux
Download `Claudette.AppImage` from [releases](https://github.com/marylin/claudette/releases/latest).

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="docs/screenshots/files.png" alt="File Explorer" /></td>
    <td><img src="docs/screenshots/usage.png" alt="Usage Dashboard" /></td>
  </tr>
  <tr>
    <td><em>File explorer with project tree</em></td>
    <td><em>Token usage analytics & cost tracking</em></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/agents.png" alt="Agents" /></td>
    <td><img src="docs/screenshots/settings.png" alt="Settings" /></td>
  </tr>
  <tr>
    <td><em>Custom agent creation</em></td>
    <td><em>Settings with MCP server management</em></td>
  </tr>
  <tr>
    <td colspan="2"><img src="docs/screenshots/files-terminal.png" alt="Terminal" /></td>
  </tr>
  <tr>
    <td colspan="2"><em>Embedded terminal with file explorer</em></td>
  </tr>
</table>

---

## 🔧 How It Works

Claudette is a thin UI layer over the Claude Code CLI. It:
1. Spawns `claude` as a child process
2. Streams stdout/stderr to the chat panel in real time
3. Reads `~/.claude/projects/` to discover your sessions
4. Uses `simple-git` to power the git panel
5. Uses Monaco Editor for the CLAUDE.md editor

Your API keys and subscription stay exactly where they are — in Claude Code's own config. Claudette never touches them.

---

## 🛠️ Development

```bash
# Clone
git clone https://github.com/marylin/claudette.git
cd claudette

# Install dependencies
npm install

# Start dev server
npm run start

# Build installer
npm run dist:win   # Windows .exe
npm run dist:mac   # macOS .dmg
npm run dist       # all platforms
```

**Requirements**: Node.js 18+, Claude Code CLI installed

---

## 🤝 Contributing

Contributions are very welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

**Good first issues**: check the [`good-first-issue`](https://github.com/marylin/claudette/issues?q=label%3Agood-first-issue) label.

---

## 🗺️ Roadmap

- [x] Windows `.exe` installer (v0.1)
- [x] Chat + terminal + session history (v0.1)
- [x] File explorer + Git panel (v0.2)
- [x] CLAUDE.md editor + Agents (v0.2)
- [x] Usage dashboard (v0.3)
- [x] MCP server manager (v0.4)
- [x] Prompt templates (v0.4)
- [ ] Multi-project workspace (v0.5)
- [ ] Session checkpoints (v0.5)
- [ ] Auto-updater (v0.5)

---

## 📄 License

MIT © [WhateverAI](https://whateverai.dev)

---

<div align="center">
  <sub>Built with Claude Code · Made with ❤️ by <a href="https://whateverai.dev">WhateverAI</a></sub>
</div>
