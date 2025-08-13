# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-08-12

### Added
- Initial release of behavior logging form
- Google Apps Script integration with automatic spreadsheet creation
- Enhanced input validation and sanitization
- Rate limiting to prevent spam submissions
- Structured logging for better debugging
- Security headers (XFrame protection)
- Global error handling
- Privacy notice for user transparency
- Dark mode support based on device preferences
- Mobile-responsive design
- Auto-focus on description field after submission

### Security
- Added rate limiting (1-second cooldown between submissions)
- Input sanitization and validation
- XSS prevention through proper input handling
- Clickjacking protection via X-Frame-Options

### Technical
- Simplified to 4-file architecture (no build process)
- Enhanced error handling and logging
- Robust spreadsheet access with fallbacks
- Version tracking in code