# CarExplorer v2.0.7 Release Notes

## What's New
- **Wikidata Fallback for Car Details**: Enhanced car information availability. When Wikipedia extraction fails, the app now queries Wikidata as a reliable fallback source, improving details availability from ~0% to ~40-50%.
- **Improved Stability**: Fixed emoji character encoding issues that caused crashes in release builds.

## Fixes
- Fixed Metro bundler crash caused by emoji characters in console logging (replaced with ASCII-safe bracket notation).
- Improved car details reliability with Wikidata integration.

## Technical Improvements
- Added comprehensive test suite for Wikidata API integration (9 passing tests).
- Hermes JavaScript engine enabled in release builds for better performance.
- All fallback chains working: Wikipedia → CarImages → initials for images; Wikipedia → Wikidata for details.

## Known Issues
- Navigation responsiveness on initial app launch is being investigated. This does not affect core functionality.

## Requirements
- Android 8.0 (API 26) or higher
