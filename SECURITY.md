# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do NOT open a public GitHub issue**
2. Email security concerns to the maintainers via GitHub private vulnerability reporting
3. Go to the **Security** tab of this repository and click **Report a vulnerability**

We will acknowledge receipt within 48 hours and provide an initial assessment within 5 business days.

## Scope

This policy covers:
- The Claudette desktop application
- IPC channel security between main and renderer processes
- Credential and settings storage
- CLI process spawning and input sanitization

## Out of Scope

- The Claude Code CLI itself (report to Anthropic)
- Third-party dependencies (report upstream)
