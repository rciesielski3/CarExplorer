# carExplorer v2.2.0 Release Notes

**Release Date:** July 7, 2026  
**Build:** versionCode 65  
**Highlights:** v2.2 Quick Wins - Image Fallback, Compare Specs, Quiz Modal

## What's New

### 1. Car Image 3-Tier Fallback
- **Problem:** Cars showed only placeholder initials
- **Solution:** Wikipedia → CarImages API → Generic placeholder image
- **Benefit:** Users always see an image, even when APIs fail

### 2. Compare Tab Auto-Fetches Specifications
- **Problem:** Comparison showed "—" for all specs
- **Solution:** Auto-fetch specs from Wikidata when cars added
- **Benefit:** Compare tab now displays full specifications for each car

### 3. Quiz Results Modal Properly Sized
- **Problem:** Results modal could overflow screen
- **Solution:** Constrain modal to screen bounds with proper scrolling
- **Benefit:** Quiz results readable on all screen sizes

## Testing
- 159 tests passing
- TypeScript strict mode: PASS
- All error scenarios covered

## Known Issues
- None at release

## Compatibility
- Minimum: Android 8.0 (API 26)
- Target: Android 14+ (API 34)
- Fully backward compatible with v2.1.0

---

**Questions or issues?** Submit feedback via Settings → About → Send Feedback
