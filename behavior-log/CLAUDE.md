# CLAUDE.md

This file provides guidance for AI assistants when working with code in this repository.

## Project Overview

This is a Google Apps Script behavior logging form that allows users to track activities and their impact on well-being. The form is specifically designed to work reliably within Google Apps Script's limitations using only proven patterns.

## Architecture - GOOGLE APPS SCRIPT APPROACH

- **Google Apps Script deployment**: Designed specifically for reliable GAS deployment
- **Two-file architecture**: `code.gs` (server) + `index.html` (client)
- **Google Apps Script function calls**: Uses google.script.run API for direct server communication
- **Vanilla JavaScript only**: No ES6 modules, modern APIs, or complex frameworks
- **Server-side Google Sheets**: Direct sheet writing via SpreadsheetApp API
- **Properties Service**: Configuration persistence

## Critical Design Principles

**✅ PROVEN PATTERNS USED:**
- Google Apps Script function calls (`google.script.run.functionName()`)
- Client-server communication with success/failure handlers
- Inline event handlers (`onsubmit`, `onchange`, `onclick`)
- Simple variable declarations (`var` not `let/const`)
- Basic DOM manipulation (`getElementById`, `innerHTML`)
- Server-side Google Sheets API calls

**❌ PATTERNS AVOIDED (CAUSE FAILURES IN GAS):**
- Modern fetch() API (unreliable in GAS sandbox)
- Complex addEventListener patterns (fail in GAS environment)  
- ES6 modules and imports (not supported in GAS HTML Service)
- Arrow functions and modern JavaScript features
- External API calls and CORS requests
- Modern JavaScript frameworks (React, Vue, etc.)

## Form Structure

The behavior logging form captures:
- Activity description (required textarea)
- Energy impact (1-10 slider from draining to filling)
- Wealth types affected (checkboxes: Physical, Mental, Social, Financial, Time)
- Time duration and frequency (dropdowns)
- Time of day (optional dropdown)

## Key Implementation Details

- **Google Apps Script function calls**: Direct server function invocation prevents page navigation
- **Client-side validation**: JavaScript validation with floating bubble error messages
- **Inline CSS**: All styles embedded in HTML for single-file deployment
- **Success/error handling**: Native GAS callback system for user feedback
- **Responsive design**: CSS Grid and Flexbox for mobile compatibility
- **Server-side processing**: All data handling in Google Apps Script backend

## Deployment Files

The project contains ready-to-deploy Google Apps Script files:

- `code.gs` - Server-side Google Apps Script code
- `index.html` - Complete HTML form with inline CSS and JavaScript
- `README.md` - Includes complete deployment instructions

## Google Apps Script Architecture

### Server-Side (code.gs)
- `doGet()`: Serves the HTML form
- `addRow()`: Handles form data submission to spreadsheet with validation and rate limiting
- `getOrCreateSpreadsheet()`: Manages Google Sheets integration with automatic fallbacks
- `logEvent()`: Structured logging helper for debugging and monitoring

### Script Properties Usage

The application uses Google Apps Script's Properties Service for persistent configuration:

**Properties Stored:**
- `SPREADSHEET_ID`: ID of the target Google Sheet for data storage
- `lastSubmission`: Timestamp of last form submission (rate limiting)

**Implementation:**
```javascript
// Rate limiting (1-second cooldown)
const lastSubmission = PropertiesService.getScriptProperties().getProperty('lastSubmission');
if (lastSubmission && (now - parseInt(lastSubmission)) < 1000) {
  throw new Error('Please wait before submitting again');
}
PropertiesService.getScriptProperties().setProperty('lastSubmission', now.toString());

// Spreadsheet ID management with fallbacks
let spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
if (!spreadsheetId) {
  spreadsheetId = DEFAULT_SPREADSHEET_ID;
  PropertiesService.getScriptProperties().setProperty('SPREADSHEET_ID', spreadsheetId);
}
```

### Configuring Pre-existing Google Sheets

To use an existing Google Sheet instead of auto-creating one:

**Method 1: Script Properties (No Code Changes)**
```javascript
// User sets this in Apps Script Project Settings > Script Properties
// Property: SPREADSHEET_ID
// Value: 1ABC123def456ghi789... (their actual Sheet ID)

// Code automatically uses the configured Sheet ID:
let spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
```

**Method 2: Code Modification**
```javascript
// Edit this line in code.gs:
const DEFAULT_SPREADSHEET_ID = '1ABC123def456ghi789...'; // User's Sheet ID
```

**Sheet ID Extraction:**
Users can find their Sheet ID in the URL:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```

**Automatic Header Management:**
The code automatically adds required headers if missing:
```javascript
if (sheet.getLastRow() === 0) {
  const headers = ['Timestamp', 'Description', 'Energy Impact', 'Wealth Types', 'Time Duration', 'Frequency', 'Time of Day'];
  sheet.appendRow(headers);
}
```

**Benefits:**
- Persistent across script executions and deployments
- Automatic failover if spreadsheet becomes inaccessible
- Rate limiting without external services
- Configuration changes persist without code modifications
- Works with existing sheets without data loss
- Headers added automatically if sheet is empty

### Client-Side (index.html)
- Complete HTML form with inline CSS and JavaScript
- Google Apps Script function calls for form submission
- Simple vanilla JavaScript for interactivity
- Client-side validation with floating bubble feedback

## Deployment Process

1. Copy `code.gs` to Google Apps Script project
2. Copy `index.html` to Google Apps Script as HTML file named "index"
3. Deploy as Web App with "Execute as: Me" and "Access: Anyone"
4. Test form submission - should display success message and reset form

## Data Storage

Form data is stored in Google Sheets with columns:
- Timestamp, Description, Energy Impact, Wealth Types, Time Duration, Frequency, Time of Day

Auto-creates "Behavior Log Data" spreadsheet in your Google Drive

## Troubleshooting

If form issues occur:
1. Check Google Apps Script execution logs
2. Verify deployment permissions
3. Ensure proper file names ("index" for HTML file)
4. Check browser developer console for JavaScript errors
5. Look for "Behavior Log Data" spreadsheet in Google Drive

## Development Principles

- Edit `code.gs` and `index.html` directly for any changes
- Test changes by copying files to Google Apps Script and deploying
- All files are deployment-ready with no build process required
- Simple, direct development workflow

## Alternative Development Workflow

For developers preferring command-line tools, Google Clasp provides:
- Local development with full IDE support
- Command-line deployment (`clasp push`, `clasp deploy`)
- TypeScript support for enhanced development
- Better integration with Git workflows
- Automated deployment capabilities

See README.md for detailed Clasp setup instructions.