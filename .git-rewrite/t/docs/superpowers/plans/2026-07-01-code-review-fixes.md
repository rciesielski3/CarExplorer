# Code Review Fixes - High-Effort Assessment Results

**Date:** 2026-07-01
**Branch:** wikidata-specs-display
**Status:** Fixing 10 verified findings (8 CONFIRMED + 2 PLAUSIBLE)

## Overview

High-effort code review identified 10 findings. The Wikidata specs feature is non-functional due to 3 cascading bugs. Critical fixes required before merge.

---

## Fix Plan (Priority Order)

### PHASE 1: BLOCKERS (Crashes & Feature Non-Functional)

**Fix 1: Add SettingsProvider to App.tsx**
- File: `src/App.tsx` line 65
- Issue: SettingsProvider missing from root provider tree
- Impact: CRASH when loading CompareScreen/SettingsScreen
- Fix: Add SettingsProvider wrapper alongside other providers
- Test: Verify CompareScreen/SettingsScreen load without "useSettings must be used within" error

**Fix 2: Parse Wikidata objects in formatWikidataValue**
- File: `src/api/wikidataApi.ts` line 303-324
- Issue: Function only handles primitives (string/number), Wikidata returns objects {amount, unit}
- Impact: All spec arrays stay empty, feature shows no data
- Fix: Parse Wikidata's {amount, unit} structure; extract the amount field and format appropriately
- Test: Verify numeric specs (power, weight, topSpeed) produce non-empty arrays

**Fix 3: Call getCarSpecificationsFromWikidata from CompareScreen**
- File: `src/api/wikipediaApi.ts` + `src/context/CompareContext.tsx`
- Issue: getCarSpecificationsFromWikidata exported but never called
- Impact: CompareCar.specifications always undefined
- Fix: Wire up the call in getCarDetails() or during car fetch; populate specifications
- Test: Verify car.specifications contains data when fetched

### PHASE 2: MAJOR BUGS (Data Corruption, Crashes, UX)

**Fix 4: Refactor getValue to return string | string[] directly**
- File: `src/screens/CompareScreen.tsx` lines 51-163
- Issue: Join-split round-trip on ", " corrupts values containing that delimiter
- Impact: "gasoline, hybrid" becomes ["gasoline", "hybrid"], data silently corrupted
- Fix: Change SpecRow.getValue return type to string | string[] | null for isArray rows; pass arrays directly to SpecRange; remove join/split
- Test: Verify multi-word spec values (e.g., transmission descriptions) render as single entries

**Fix 5: Add undefined guard to getUnitLabel**
- File: `src/utils/unitConverter.ts` line 47-48
- Issue: Crashes with TypeError on unknown propertyName
- Impact: Runtime crash if unknown key passed
- Fix: Add guard: `const label = labels[propertyName]; if (!label) return '';` or throw informative error
- Test: Test with unknown key; verify it doesn't crash

**Fix 6: Check isHydrated before rendering AdBanner**
- File: `src/components/AdBanner.tsx` line 23
- Issue: AdBanner doesn't check isHydrated; premium users see ad flash
- Impact: Premium users see ads on cold start
- Fix: Add `!isHydrated ||` as first condition in the guard; return null while hydrating
- Test: Verify premium users don't see ads during or after cold start

**Fix 7: Reset SpecRange expanded state on values change**
- File: `src/components/SpecRange.tsx` line 19
- Issue: useState doesn't reset when values prop changes
- Impact: List stays expanded across metric/imperial toggle
- Fix: Add useEffect hook that sets expanded=false when values changes
- Test: Toggle metric/imperial; verify lists reset to collapsed state

**Fix 8: Fix test to actually invoke the function**
- File: `src/api/__tests__/wikidataApi.specs.test.ts` line 35
- Issue: Test asserts against its own input, not function output
- Impact: Zero regression coverage for dedup/sort logic
- Fix: Refactor test to call getCarSpecificationsFromWikidata with mock Wikidata data and assert on the result
- Test: Verify test catches dedup+sort bugs if logic changes

### PHASE 3: PLAUSIBLE ISSUES (Architectural Risks)

**Fix 9: Wrap setPreferredUnitSystem in useCallback**
- File: `src/context/SettingsContext.tsx` line 46
- Issue: Function spreads stale settings from closure; risk if second Settings field added
- Impact: Future field could silently revert on rapid toggles
- Fix: useCallback(async (system) => {...}, [settings])
- Test: Verify callback is memoized and captures latest settings

**Fix 10: Add comment about sort comparator unit awareness**
- File: `src/api/wikidataApi.ts` line 283
- Issue: No unit awareness; could invert if mixed units added to same property
- Impact: Latent risk for future refactors
- Fix: Add comment explaining single-unit assumption; link to issue if concern arises
- No test needed (architectural note)

---

## Execution Strategy

- **PHASE 1 (BLOCKERS):** 3 fixes, run in sequence (order matters: 1 → 2 → 3)
- **PHASE 2 (MAJOR):** 6 fixes, can run in parallel (fixes 4-8 are independent; fix 9 depends on PHASE 1 complete)
- **PHASE 3 (PLAUSIBLE):** 1 fix, run after PHASE 2 (low priority)

**Agent Assignment:**
- Fixes 1, 5, 10: Haiku (mechanical changes, simple guards)
- Fixes 2, 3, 4, 6, 7, 8, 9: Sonnet (require design judgment, multi-file coordination, test refactoring)

**Verification:**
- Each fix verified before moving to next
- Full test suite run after all PHASE 1 and PHASE 2 fixes
- Re-review critical paths after fixes

---

## Success Criteria

- [ ] PHASE 1: All blockers fixed, no crashes on CompareScreen/SettingsScreen load
- [ ] PHASE 2: All major bugs fixed, feature functional end-to-end
- [ ] PHASE 3: Plausible issues addressed, codebase healthier for future maintenance
- [ ] Full test suite passing
- [ ] Branch ready for merge after fixes + verification

---

## Time Estimate

- PHASE 1: ~30 min (3 fixes, sequential)
- PHASE 2: ~45 min (6 fixes, mostly parallel)
- PHASE 3: ~10 min (1 fix + comment)
- Verification & re-test: ~15 min
- **Total: ~2 hours**
