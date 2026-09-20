# carExplorer v2.2.8 Release Notes

**Release Date:** September 20, 2026  
**Build:** versionCode 78  
**Highlights:** TypeScript Strict Mode Compliance & Build Infrastructure Improvements

## What's New

### 1. TypeScript Strict Mode Compliance
- **Problem:** Test files had type errors preventing strict mode compilation
- **Solution:** Resolved all TypeScript type mismatches in test files
- **Benefit:** Code base now passes `tsc --noEmit` without errors; improved type safety across tests

### 2. Build Infrastructure & Release Workflow
- **Problem:** Release process lacked artifact verification and had "build twice" inefficiency
- **Solution:** 
  - Added SHA1 signature verification to build workflow
  - Implemented artifact reuse with fallback in upload workflow
  - Documented release procedures in runbook
- **Benefit:** Faster releases with cryptographic verification; reduced build times

### 3. Codebase Hygiene
- **Problem:** Documentation files cluttered the main repo
- **Solution:** Updated `.gitignore` to exclude agent docs and planning files
- **Benefit:** Cleaner repository; improved developer experience

## Technical Details

### TypeScript Improvements
- All test files now pass strict type checking
- Fixed fetch mock type signatures in API test files
- Corrected mock data structure in component tests
- Improved type annotations for better IDE support

### Release Workflow Enhancements
- Build workflow adds keytool-based SHA1 verification post-bundleRelease
- Upload workflow implements artifact download with automatic fallback to fresh build
- RELEASE_NOTES files now linked from GitHub Actions workflow

## Testing
- 191 tests passing
- TypeScript strict mode: 0 errors (100% compliance)
- All workflows tested with dry-run and manual dispatch
- Artifact caching verified

## Compatibility
- Minimum: Android 8.0 (API 26)
- Target: Android 14+ (API 34)
- Fully backward compatible with v2.2.7

---

**Questions or issues?** Submit feedback via Settings → About → Send Feedback
