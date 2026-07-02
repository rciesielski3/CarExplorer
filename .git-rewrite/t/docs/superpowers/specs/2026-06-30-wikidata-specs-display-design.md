# Wikidata Car Specifications Display Design

**Date:** 2026-06-30  
**Scope:** Display curated car specifications from Wikidata in comparison screen with range handling and unit conversion

## Overview

Extend the existing Wikidata fallback system to extract and display car specifications (engine, power, torque, acceleration, weight, dimensions, fuel type, transmission, top speed) in the comparison screen. Handle multiple variants per property with smart range display and user-configurable unit preferences.

## Requirements

### Functional Requirements

1. **Extract 9 curated specifications from Wikidata:**
   - Engine displacement
   - Power output
   - Torque
   - Acceleration (0-100 km/h)
   - Weight
   - Dimensions (length × width × height)
   - Fuel type
   - Transmission
   - Top speed

2. **Handle multiple values per property:**
   - Store all values as sorted arrays (smallest to largest)
   - Display logic:
     - 0 values: show "N/A"
     - 1-2 values: show all (`"2.0L, 2.5L"`)
     - 3+ values: show range + expandable (`"2.0L - 3.5L" [expand]`)
   - Expanded view shows all values sorted vertically

3. **Unit conversion system:**
   - Store all values in standardized metric units
   - Convert to user preference (metric or imperial) on display
   - User can set preferred unit system in settings

4. **Integration with comparison:**
   - Specs are optional (comparison works without them)
   - Display in existing SPEC_ROWS structure in CompareScreen
   - Render alongside existing specs (make, model, year, vehicle type)

### Non-Functional Requirements

1. **Backward compatibility:** Specs are optional; cars without specs still display
2. **Error handling:** Missing or malformed Wikidata doesn't break comparison
3. **Performance:** Specs fetch happens during getCarDetails, no separate network calls
4. **Data structure simplicity:** Arrays for easy calculation of min/max/display logic

## Architecture

### 1. Data Structure

**New `CarSpecification` type:**
```typescript
type CarSpecification = {
  engine: string[];           // ["2.0L", "2.5L", "3.5L"]
  power: string[];            // ["150 kW", "165 kW", "200 kW"]
  torque: string[];           // ["280 Nm", "310 Nm", "360 Nm"]
  acceleration: string[];     // ["10.5 s", "9.8 s", "8.2 s"]
  weight: string[];           // ["1500 kg", "1550 kg", "1600 kg"]
  dimensions: string[];       // ["4850x1850x1480 mm"]
  fuelType: string[];         // ["Petrol", "Diesel", "Hybrid"]
  transmission: string[];     // ["Manual", "Automatic"]
  topSpeed: string[];         // ["200 km/h", "220 km/h"]
};
```

**Updated `CompareCar` type:**
```typescript
type CompareCar = {
  // ... existing fields (make, model, year, vehicleType)
  specifications?: CarSpecification;
};
```

### 2. Wikidata API Enhancement

**New function: `getCarSpecificationsFromWikidata(wikidataId, language)`**

- Input: Wikidata entity ID (e.g., "Q123456"), language code
- Output: `Promise<CarSpecification | null>`
- Behavior:
  - Queries Wikidata API for 9 specific properties (P361 parts, P625 engine, P2095 maximum speed, etc.)
  - Maps raw Wikidata values to standardized units (metric)
  - Returns arrays with deduplicated, sorted values
  - Returns null if no specifications found or Wikidata query fails
  - Comprehensive error logging for debugging

**Integration into `getCarDetails()`:**
```typescript
// After Wikipedia/Wikidata basic details, fetch specs
const specifications = await getCarSpecificationsFromWikidata(
  wikidataId,
  language
);

return {
  ...basicDetails,
  specifications,
};
```

### 3. Unit Conversion System

**New module: `src/utils/unitConverter.ts`**

Conversion functions:
- `convertPower(kw: number, toImperial: boolean): string` → HP or kW
- `convertWeight(kg: number, toImperial: boolean): string` → lbs or kg
- `convertSpeed(kmh: number, toImperial: boolean): string` → mph or km/h
- `convertAcceleration(seconds: number): string` → no conversion, always seconds

**Settings integration:**
- Add `preferredUnitSystem: "metric" | "imperial"` to settings
- Default: metric
- User can change in settings screen

### 4. Comparison Screen Display Logic

**Updated CompareScreen:**

For each specification property:
1. Retrieve array of values from `car.specifications[propertyName]`
2. Convert each value to user's preferred units
3. Display based on array length:
   - 0 values: `"N/A"`
   - 1-2 values: `"2.0L, 2.5L"`
   - 3+ values: `"2.0L - 3.5L"` (min-max) with expand button
4. Expanded view shows all values sorted, one per line

**Expandable component behavior:**
- Default state: collapsed (shows range)
- Tap expand button: shows all values
- Values displayed smallest to largest

### 5. Error Handling

1. **Missing Wikidata entity:** specs = null, comparison displays without specs
2. **Missing property in entity:** property array = empty, displays as "N/A"
3. **Malformed value:** skip value, include others
4. **Network error:** specs = null, comparison continues
5. **Unit conversion error:** display original value with note

## Implementation Tasks

1. **Wikidata API enhancement**
   - Create `getCarSpecificationsFromWikidata()` function
   - Map Wikidata properties to our 9 specs
   - Handle value extraction and normalization
   - Deduplicate and sort arrays
   - Add comprehensive logging

2. **Unit conversion system**
   - Create `unitConverter.ts` module
   - Implement power, weight, speed conversions
   - Create conversion formatting helpers
   - Test all conversion paths

3. **Settings integration**
   - Add `preferredUnitSystem` to settings context
   - Add settings UI toggle for unit preference
   - Persist preference to AsyncStorage

4. **CompareScreen updates**
   - Add new SPEC_ROWS entries for 9 properties
   - Update getValue() to pull from specifications
   - Implement range display + expand logic
   - Integrate unit conversion on display

5. **Testing**
   - Unit tests for Wikidata property extraction
   - Unit tests for unit conversions
   - Integration tests for comparison display with ranges
   - Test missing/malformed data handling

## Data Flow Diagram

```
User searches car
    ↓
getCarDetails(make, model, language)
    ↓
Try Wikipedia → Wikidata fallback (basic info)
    ↓
getCarSpecificationsFromWikidata(wikidataId)
    ↓
Extract 9 properties, normalize to metric, return arrays
    ↓
Store in CompareCar.specifications
    ↓
User adds to comparison
    ↓
CompareScreen displays each spec:
  • If ≤2 values: show all
  • If >2 values: show range + expand
  • Apply unit conversion per user preference
```

## Testing Strategy

### Unit Tests
- Wikidata property extraction: verify correct values returned
- Value normalization: ensure metric units applied correctly
- Array deduplication: verify no duplicate values
- Array sorting: verify smallest to largest order
- Unit conversion: test power, weight, speed conversions
- Missing data: verify graceful handling

### Integration Tests
- Full comparison flow: add two cars, verify specs display correctly
- Range display: verify 3+ values show range + expand button
- Unit conversion: change setting, verify display updates
- Error scenarios: missing Wikidata, malformed data

### Manual Testing
- Compare two cars with various spec availability
- Test expand/collapse of ranges
- Test unit preference change in settings
- Verify backward compatibility (cars without specs)

## Constraints & Assumptions

1. **Assumption:** Wikidata has relevant properties for most cars (may not be true for all vehicles)
2. **Constraint:** Only fetch specs if Wikidata entity is found
3. **Constraint:** Specs are optional; comparison is usable without them
4. **Assumption:** Values in Wikidata are reasonably consistent (may need sanitization)
5. **Constraint:** Max of 9 properties curated (not all Wikidata properties)

## Success Criteria

1. ✅ Wikidata specs extracted for cars with Wikidata entries
2. ✅ Comparison screen displays all 9 specs (or N/A if unavailable)
3. ✅ Ranges display correctly (min-max for 3+ values)
4. ✅ Expand button shows all values sorted
5. ✅ Unit conversion works for both metric and imperial
6. ✅ User preference saved and persisted
7. ✅ No breaking changes to existing functionality
8. ✅ All tests passing

## Future Enhancements

1. Add spec comparison analytics (which specs users compare most)
2. Pre-populate popular car specs (cache warming)
3. Add more properties as discovered in Wikidata
4. Allow filtering comparison by spec ranges
5. Add spec search/filter in comparison view
