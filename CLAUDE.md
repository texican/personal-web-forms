# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains Google Apps Script web applications for personal data collection forms. Projects are organized as git submodules for independent development and versioning.

## Project Structure

```
Personal Web Forms/
├── .gitmodules                  # Git submodule configuration
├── README.md                    # High-level project overview
├── CLAUDE.md                    # Repository-level developer guidance
├── behavior-log/                # Git submodule: Behavior tracking form
│   ├── README.md                # Detailed deployment instructions
│   ├── CLAUDE.md                # Project-specific developer guidance
│   ├── code.gs                  # Server-side Google Apps Script code
│   ├── index.html               # Complete HTML form with inline CSS/JS
│   ├── appsscript.json          # Google Apps Script configuration
│   ├── CHANGELOG.md             # Version history
│   └── LICENSE                  # MIT license
└── chess-tracker/               # Git submodule: Chess game tracker
    ├── README.md                # Detailed deployment instructions
    ├── CLAUDE.md                # Project-specific developer guidance
    ├── code.gs                  # Server-side Google Apps Script code
    ├── index.html               # Complete HTML form with inline CSS/JS
    ├── appsscript.json          # Google Apps Script configuration
    └── LICENSE                  # MIT license
```

## Repository Architecture

This repository uses **git submodules** to organize independent web form projects:

- **behavior-log**: https://github.com/texican/behavior-log.git
- **chess-tracker**: https://github.com/texican/chess-tracker.git

Each submodule is a standalone repository that can be developed, versioned, and released independently while being part of this collection.

### Working with Submodules

**Clone repository with submodules:**
```bash
git clone --recursive https://github.com/texican/personal-web-forms.git
```

**Update submodules to latest:**
```bash
git submodule update --remote
```

**Add new submodule:**
```bash
git submodule add <repository-url> <directory-name>
```

## Development Workflow

### No Build Process Required
This project uses direct file deployment to Google Apps Script:
- **Manual Development**: Edit `code.gs` and `index.html` directly, then copy to Google Apps Script console
- **Google Clasp Alternative**: Use `clasp push` and `clasp deploy` for command-line deployment

### Key Commands

**Manual Deployment:**
1. Copy `code.gs` to Google Apps Script project 
2. Copy `index.html` as HTML file named "index"
3. Deploy as Web App (Execute as: Me, Access: Anyone)

**With Google Clasp:**
```bash
# Install Clasp globally
npm install -g @google/clasp

# Login and create project
clasp login
clasp create --type webapp --title "Behavior Logger"

# Deploy files
clasp push
clasp deploy
```

## Architecture Overview

### Google Apps Script Design Principles

This codebase follows **proven Google Apps Script patterns** for maximum reliability:

**✅ PROVEN PATTERNS:**
- `google.script.run` API for client-server communication
- Server-side Google Sheets API calls
- Inline event handlers (`onsubmit`, `onclick`)
- Vanilla JavaScript (no modern ES6+ features)
- Properties Service for persistent configuration

**❌ AVOIDED PATTERNS (CAUSE FAILURES):**
- Modern `fetch()` API (unreliable in GAS sandbox)
- Complex event listeners (fail in GAS environment)
- ES6 modules/imports (not supported)
- External API calls and CORS requests
- Modern JavaScript frameworks

### Common Architecture Patterns

All projects in this repository follow the same Google Apps Script architecture:

**Server-Side (`code.gs`):**
- `doGet()`: Serves HTML form with proper headers
- `addRow()`: Processes form submissions with validation and rate limiting
- `getOrCreateSpreadsheet()`: Manages Google Sheets integration with automatic fallbacks
- `logEvent()`: Structured logging for debugging

**Client-Side (`index.html`):**
- Single-file HTML with inline CSS and JavaScript
- Form validation with floating error messages
- Project-specific form fields
- Responsive design with dark mode support

### Configuration Management

**Script Properties Usage:**
- `SPREADSHEET_ID`: Target Google Sheet ID (persistent across deployments)
- `lastSubmission`: Rate limiting timestamp (1-second cooldown)

**Configuring Existing Sheets:**
Users can set `SPREADSHEET_ID` in Google Apps Script Project Settings → Script Properties to use their existing sheet instead of auto-creating one.

### Data Storage

Each project stores form submissions in Google Sheets:

**Behavior Logger:** Timestamp | Description | Energy Impact | Wealth Types | Time Duration | Frequency | Time of Day

**Chess Tracker:** Timestamp | Opponent | Result | My Rating | Opponent Rating | Time Control | Platform | Opening | Notes

Spreadsheets are auto-created if none specified.

## Troubleshooting Common Issues

1. **Form submission fails**: Check Google Apps Script execution logs
2. **Blank page after submit**: Verify using `google.script.run` API correctly
3. **No data in sheets**: Check deployment permissions and spreadsheet access
4. **Mobile compatibility**: Form includes specific mobile browser compatibility checks

## Security & Validation

- Client-side validation with user feedback
- Server-side input sanitization and validation
- Rate limiting (1-second cooldown via Properties Service)
- XSS prevention through proper input handling
- No external dependencies or API calls

## Development Guidelines

When making changes:
1. Test all modifications in Google Apps Script environment before committing
2. Maintain compatibility with GAS limitations (no modern JavaScript)
3. Follow existing patterns for reliability
4. Update both `README.md` files if functionality changes
5. Test deployment process after any structural changes