# Manual Test Matrix

Run through this checklist on each target OS before a release.

## Environment
- OS: _______________
- Node: _______________
- Claude Code CLI version: _______________
- Claudette version: _______________

## App Launch
- [ ] App starts without errors
- [ ] No console errors/warnings on launch
- [ ] Custom title bar renders (minimize, maximize, close buttons work)
- [ ] Window is draggable via title bar
- [ ] Window remembers nothing on first launch (clean state)

## Project Sidebar
- [ ] Projects from `~/.claude/projects/` are listed
- [ ] Projects sorted by most recent session
- [ ] Click project expands session list
- [ ] Session count and last active time shown
- [ ] CLAUDE.md indicator shown for projects that have one
- [ ] "Open Folder" dialog works
- [ ] Sidebar collapse/expand (Ctrl+B) works
- [ ] Collapsed sidebar shows icon rail

## Chat Panel
- [ ] "New Session" button creates fresh session
- [ ] Type message and press Enter sends to Claude
- [ ] Streaming response renders incrementally
- [ ] Markdown renders in assistant messages (headings, lists, bold)
- [ ] Code blocks have syntax highlighting
- [ ] Streaming indicator shows during response
- [ ] Stop button halts response mid-stream
- [ ] Permission prompts surface as UI buttons (if auto-accept is off)
- [ ] Long conversations scroll properly
- [ ] Template picker opens with `/` in empty input

## Session Management
- [ ] Past sessions appear under expanded project
- [ ] Click session resumes it
- [ ] Session summary shown (first user message)
- [ ] Message count shown per session

## File Explorer (Ctrl+2)
- [ ] File tree loads for active project
- [ ] Directories expand/collapse
- [ ] Filter/search box filters file names
- [ ] Click file opens it in code viewer
- [ ] Syntax highlighting in code viewer

## Git Panel (Ctrl+3)
- [ ] Shows current branch
- [ ] Lists modified/staged/untracked files
- [ ] Click file shows diff
- [ ] Stage/unstage checkboxes work
- [ ] Commit message input + commit button work
- [ ] Tab hidden gracefully if project is not a git repo
- [ ] Refresh button re-polls git status

## Agents (Ctrl+4)
- [ ] Empty state shows when no agents exist
- [ ] Create new agent with name, description, system prompt, model
- [ ] Agent card appears after save
- [ ] Edit agent works
- [ ] Delete agent works (with confirmation)

## Usage Dashboard (Ctrl+5)
- [ ] Summary cards show (total spend, tokens, sessions, projected monthly)
- [ ] Token chart renders with bar chart
- [ ] Date range selector works (7d, 14d, 30d, All)
- [ ] Model breakdown table shows
- [ ] Refresh button works
- [ ] Empty state if no usage data

## CLAUDE.md Editor
- [ ] Opens CLAUDE.md content in editor
- [ ] Markdown preview pane renders live
- [ ] Ctrl+S saves
- [ ] "Create CLAUDE.md" button if file missing
- [ ] Unsaved changes indicator

## Terminal (Ctrl+`)
- [ ] Terminal panel opens/closes
- [ ] Resize handle works (drag up/down)
- [ ] Terminal renders with correct theme colors
- [ ] Text is selectable
- [ ] Close button works

## Settings
- [ ] Opens settings panel
- [ ] Claude CLI path shown (auto-detected or configured)
- [ ] "Detect" button finds CLI
- [ ] Default model selector works
- [ ] Auto-accept permissions toggle works
- [ ] Font size slider adjusts app font
- [ ] MCP servers section shows
- [ ] Add MCP server form works (name, type, command, args)
- [ ] Cancel/Save buttons work

## Command Palette (Ctrl+K)
- [ ] Opens with blur background overlay
- [ ] Fuzzy search filters results
- [ ] Arrow keys navigate, Enter selects
- [ ] Escape closes
- [ ] Actions work (switch tabs, open settings, etc.)

## Keyboard Shortcuts
- [ ] Ctrl+1-5 switch tabs
- [ ] Ctrl+B toggles sidebar
- [ ] Ctrl+` toggles terminal
- [ ] Ctrl+K opens command palette
- [ ] ? opens keyboard shortcuts help
- [ ] Escape closes modals/palettes

## Status Bar
- [ ] Shows connection status (idle/running)
- [ ] Shows active project name
- [ ] GitHub icon links to remote repo
- [ ] Terminal toggle button works
- [ ] Settings gear opens settings

## Edge Cases
- [ ] Empty `~/.claude/projects/` directory — shows empty state
- [ ] Very long project names truncate properly
- [ ] Large file (1MB+) opens without freeze
- [ ] Rapid tab switching doesn't cause errors
- [ ] Closing app while Claude is running doesn't hang

## Build & Install (Windows only)
- [ ] `npm run dist:win` produces .exe
- [ ] Installer runs without SmartScreen block (or with expected warning)
- [ ] Installed app launches from Start menu
- [ ] Uninstaller works cleanly
