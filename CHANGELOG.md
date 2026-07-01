# Changelog

## [2.0.7] - 2026-07-01

### Added
- **Premium Ad-Free Features**: Users can now enjoy an ad-free experience with premium toggle in Settings
- **Release Automation**: Automated GitHub Actions workflows for building Android AAB bundles and uploading to Play Store
- **Ad Banner Component**: Multi-language ad banner (DE, EN, FR, PL) with premium detection
- **Comprehensive Tests**: Full test coverage for AdBanner, Home Screen, Quiz Screen, and Settings screens
- **Specifications Display**: Car specification display with unit conversion (metric/imperial) and persistence

### Changed
- Integrated ad banners across Home, Compare, Discover, News, and Quiz screens
- Enhanced Settings screen with premium toggle and Clear Favorites option
- Improved UI/UX with refined mobile layouts (Quiz, Compare screens)

### Fixed
- Fixed QuizScreen CSS unit from invalid '85vh' to '85%' (React Native compatibility)
- Fixed AdBanner hydration status check to prevent ad flickering
- Improved test infrastructure and resolved TypeScript errors
- Fixed AdMob API compatibility with SDK v15.8.0

### Technical Details
- Expo SDK ~52.0.28 with React Native
- Complete CI/CD pipeline with GitHub Actions
- Android AAB signing and Play Store integration configured
- Full test coverage with Jest

### Contributors
- r.ciesielski3

---
