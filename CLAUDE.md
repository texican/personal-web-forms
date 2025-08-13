# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains Google Apps Script web applications for personal data collection forms. The current project is a behavior logging form (`behavior-log/`) designed specifically for reliable deployment on Google Apps Script.

## Project Structure

```
Personal Web Forms/
├── README.md                    # High-level project overview
└── behavior-log/                # Behavior tracking form application
    ├── README.md                # Detailed deployment instructions
    ├── CLAUDE.md                # Existing developer guidance
    ├── code.gs                  # Server-side Google Apps Script code
    ├── index.html               # Complete HTML form with inline CSS/JS
    ├── appsscript.json          # Google Apps Script configuration
    ├── CHANGELOG.md             # Version history
    └── LICENSE                  # MIT license
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

### Core Components

**Server-Side (`code.gs`):**
- `doGet()`: Serves HTML form with proper headers
- `addRow()`: Processes form submissions with validation and rate limiting
- `getOrCreateSpreadsheet()`: Manages Google Sheets integration with automatic fallbacks
- `logEvent()`: Structured logging for debugging

**Client-Side (`index.html`):**
- Single-file HTML with inline CSS and JavaScript
- Form validation with floating error messages
- Energy impact slider (-5 to +5 scale)
- Wealth type checkboxes (Physical, Mental, Social, Financial, Time)
- Responsive design with dark mode support

### Configuration Management

**Script Properties Usage:**
- `SPREADSHEET_ID`: Target Google Sheet ID (persistent across deployments)
- `lastSubmission`: Rate limiting timestamp (1-second cooldown)

**Configuring Existing Sheets:**
Users can set `SPREADSHEET_ID` in Google Apps Script Project Settings → Script Properties to use their existing sheet instead of auto-creating one.

### Data Storage

Form submissions are stored in Google Sheets with columns:
- Timestamp | Description | Energy Impact | Wealth Types | Time Duration | Frequency | Time of Day

Auto-creates "Behavior Log Data" spreadsheet if none specified.

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