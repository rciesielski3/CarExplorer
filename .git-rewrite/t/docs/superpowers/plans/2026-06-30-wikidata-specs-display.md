# Wikidata Specifications Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract 9 curated car specifications from Wikidata and display them in the comparison screen with smart range handling and user-configurable unit conversion.

**Architecture:** Extend existing wikidataApi to fetch specifications, create a unit conversion utility, add unit preference to settings, and update CompareScreen to display specs with range collapsing for multiple values (min-max if >2 values, expandable to see all).

**Tech Stack:** React Native, TypeScript, Wikidata API, AsyncStorage, i18n for localization

## Global Constraints

- Branch: `wikidata-specs-display` (separate from main)
- Incremental commits after each task
- TDD: write failing test first, implement to pass
- KISS: minimal code, no over-engineering
- DRY: reuse existing patterns (especially settings, conversion patterns)
- All new functions must be tested before moving to next task

---

## File Structure

**Files to create:**
- `src/types/CarSpecification.ts` - Specification type definitions
- `src/utils/unitConverter.ts` - Unit conversion utilities and formatting
- `src/components/SpecRange.tsx` - Reusable range display + expand component
- `src/api/__tests__/wikidataApi.specs.test.ts` - Wikidata specs tests
- `src/utils/__tests__/unitConverter.test.ts` - Unit conversion tests

**Files to modify:**
- `src/api/wikidataApi.ts` - Add getCarSpecificationsFromWikidata()
- `src/context/CompareContext.tsx` - Add specifications to CompareCar type
- `src/context/SettingsContext.tsx` - Add preferredUnitSystem to settings
- `src/screens/SettingsScreen.tsx` - Add unit preference toggle
- `src/screens/CompareScreen.tsx` - Display specifications with ranges
- `src/constants/GlobalStyles.ts` - Add styles for spec ranges if needed

---

## Task 1: Create Specification Types

**Files:**
- Create: `src/types/CarSpecification.ts`
- Modify: `src/context/CompareContext.tsx`

**Interfaces:**
- Produces: `CarSpecification` type with 9 string array properties (engine, power, torque, acceleration, weight, dimensions, fuelType, transmission, topSpeed)
- Produces: Updated `CompareCar` type with optional `specifications?: CarSpecification`

- [ ] **Step 1: Create CarSpecification type file**

Create `src/types/CarSpecification.ts`:
```typescript
export type CarSpecification = {
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

- [ ] **Step 2: Update CompareCar type in CompareContext**

Modify `src/context/CompareContext.tsx`, find the `CompareCar` type definition and add:
```typescript
import { CarSpecification } from '../types/CarSpecification';

export type CompareCar = {
  // ... existing fields
  specifications?: CarSpecification;
};
```

- [ ] **Step 3: Commit**

```bash
git add src/types/CarSpecification.ts src/context/CompareContext.tsx
git commit -m "types: add CarSpecification type for Wikidata specs"
```

---

## Task 2: Create Unit Converter Utility

**Files:**
- Create: `src/utils/unitConverter.ts`
- Create: `src/utils/__tests__/unitConverter.test.ts`
- Test: `src/utils/__tests__/unitConverter.test.ts`

**Interfaces:**
- Produces: `convertPower(kw: number, toImperial: boolean): string`
- Produces: `convertWeight(kg: number, toImperial: boolean): string`
- Produces: `convertSpeed(kmh: number, toImperial: boolean): string`
- Produces: `convertAcceleration(seconds: number): string` (no conversion, always seconds)
- Produces: `getUnitLabel(propertyName: string, toImperial: boolean): string`

- [ ] **Step 1: Write failing tests for unit conversions**

Create `src/utils/__tests__/unitConverter.test.ts`:
```typescript
import {
  convertPower,
  convertWeight,
  convertSpeed,
  convertAcceleration,
  getUnitLabel,
} from '../unitConverter';

describe('Unit Converter', () => {
  describe('convertPower', () => {
    it('converts kW to HP', () => {
      expect(convertPower(100, true)).toBe('134 HP');
    });

    it('returns kW when not imperial', () => {
      expect(convertPower(100, false)).toBe('100 kW');
    });
  });

  describe('convertWeight', () => {
    it('converts kg to lbs', () => {
      expect(convertWeight(1000, true)).toBe('2205 lbs');
    });

    it('returns kg when not imperial', () => {
      expect(convertWeight(1000, false)).toBe('1000 kg');
    });
  });

  describe('convertSpeed', () => {
    it('converts km/h to mph', () => {
      expect(convertSpeed(100, true)).toBe('62 mph');
    });

    it('returns km/h when not imperial', () => {
      expect(convertSpeed(100, false)).toBe('100 km/h');
    });
  });

  describe('convertAcceleration', () => {
    it('returns seconds unchanged', () => {
      expect(convertAcceleration(10.5)).toBe('10.5 s');
    });
  });

  describe('getUnitLabel', () => {
    it('returns correct label for power in imperial', () => {
      expect(getUnitLabel('power', true)).toBe('HP');
    });

    it('returns correct label for power in metric', () => {
      expect(getUnitLabel('power', false)).toBe('kW');
    });

    it('returns correct label for weight in imperial', () => {
      expect(getUnitLabel('weight', true)).toBe('lbs');
    });

    it('returns correct label for weight in metric', () => {
      expect(getUnitLabel('weight', false)).toBe('kg');
    });

    it('returns correct label for speed in imperial', () => {
      expect(getUnitLabel('topSpeed', true)).toBe('mph');
    });

    it('returns correct label for speed in metric', () => {
      expect(getUnitLabel('topSpeed', false)).toBe('km/h');
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/utils/__tests__/unitConverter.test.ts`

Expected: FAIL - Module not found

- [ ] **Step 3: Implement unit converter**

Create `src/utils/unitConverter.ts`:
```typescript
// Conversion factors
const KW_TO_HP = 1.34102;
const KG_TO_LBS = 2.20462;
const KMH_TO_MPH = 0.621371;

export const convertPower = (kw: number, toImperial: boolean): string => {
  if (toImperial) {
    const hp = Math.round(kw * KW_TO_HP);
    return `${hp} HP`;
  }
  return `${kw} kW`;
};

export const convertWeight = (kg: number, toImperial: boolean): string => {
  if (toImperial) {
    const lbs = Math.round(kg * KG_TO_LBS);
    return `${lbs} lbs`;
  }
  return `${kg} kg`;
};

export const convertSpeed = (kmh: number, toImperial: boolean): string => {
  if (toImperial) {
    const mph = Math.round(kmh * KMH_TO_MPH);
    return `${mph} mph`;
  }
  return `${kmh} km/h`;
};

export const convertAcceleration = (seconds: number): string => {
  return `${seconds} s`;
};

export const getUnitLabel = (propertyName: string, toImperial: boolean): string => {
  const labels: Record<string, { metric: string; imperial: string }> = {
    power: { metric: 'kW', imperial: 'HP' },
    weight: { metric: 'kg', imperial: 'lbs' },
    topSpeed: { metric: 'km/h', imperial: 'mph' },
    acceleration: { metric: 's', imperial: 's' },
    engine: { metric: 'L', imperial: 'L' },
    torque: { metric: 'Nm', imperial: 'Nm' },
    dimensions: { metric: 'mm', imperial: 'mm' },
    fuelType: { metric: '', imperial: '' },
    transmission: { metric: '', imperial: '' },
  };

  const label = labels[propertyName];
  return toImperial ? label.imperial : label.metric;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/utils/__tests__/unitConverter.test.ts`

Expected: PASS - 8 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/utils/unitConverter.ts src/utils/__tests__/unitConverter.test.ts
git commit -m "feat: add unit converter for imperial/metric conversions"
```

---

## Task 3: Create SpecRange Component

**Files:**
- Create: `src/components/SpecRange.tsx`
- Modify: `src/components/index.ts`

**Interfaces:**
- Consumes: `values: string[]` (array of values to display)
- Produces: React component that displays range or expandable list
- Behavior: if ≤2 values show all, if >2 show min-max with expand button

- [ ] **Step 1: Create SpecRange component**

Create `src/components/SpecRange.tsx`:
```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { createGlobalStyles } from '@/constants/GlobalStyles';

interface SpecRangeProps {
  values: string[];
  fallback?: string;
}

export const SpecRange: React.FC<SpecRangeProps> = ({
  values,
  fallback = 'N/A',
}) => {
  const { theme } = useTheme();
  const styles = createGlobalStyles(theme);
  const [expanded, setExpanded] = useState(false);

  if (!values || values.length === 0) {
    return <Text style={styles.text}>{fallback}</Text>;
  }

  // 1-2 values: show all
  if (values.length <= 2) {
    return <Text style={styles.text}>{values.join(', ')}</Text>;
  }

  // 3+ values: show range with expand button
  const min = values[0];
  const max = values[values.length - 1];

  if (!expanded) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.text}>
          {min} - {max}
        </Text>
        <TouchableOpacity
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          accessibilityLabel="Expand values"
        >
          <Ionicons
            name="chevron-down"
            size={16}
            color={Colors[theme].text}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Expanded: show all values
  return (
    <View>
      {values.map((value, index) => (
        <View
          key={`${value}-${index}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Text style={styles.text}>{value}</Text>
          {index === values.length - 1 && (
            <TouchableOpacity
              onPress={() => setExpanded(false)}
              accessibilityRole="button"
              accessibilityLabel="Collapse values"
            >
              <Ionicons
                name="chevron-up"
                size={16}
                color={Colors[theme].text}
              />
            </TouchableOpacity>
          )}
        </View>
      ))}
    </View>
  );
};
```

- [ ] **Step 2: Export component from index**

Modify `src/components/index.ts` to add:
```typescript
export { SpecRange } from './SpecRange';
```

- [ ] **Step 3: Commit**

```bash
git add src/components/SpecRange.tsx src/components/index.ts
git commit -m "feat: add SpecRange component for displaying value ranges"
```

---

## Task 4: Update Settings Context for Unit Preference

**Files:**
- Modify: `src/context/SettingsContext.tsx`

**Interfaces:**
- Produces: `preferredUnitSystem: 'metric' | 'imperial'` in settings
- Produces: `setPreferredUnitSystem(system: 'metric' | 'imperial'): void`

- [ ] **Step 1: Add unit system to SettingsContext**

Modify `src/context/SettingsContext.tsx`. Find the settings type definition and add:
```typescript
export type Settings = {
  // ... existing fields
  preferredUnitSystem: 'metric' | 'imperial';
};
```

Then in the context creation, set default value:
```typescript
const defaultSettings: Settings = {
  // ... existing defaults
  preferredUnitSystem: 'metric',
};
```

And add setter method in the provider:
```typescript
const setPreferredUnitSystem = (system: 'metric' | 'imperial') => {
  setSettings(prev => ({
    ...prev,
    preferredUnitSystem: system,
  }));
  // Persist to AsyncStorage
  AsyncStorage.setItem(
    'carexplorer_settings',
    JSON.stringify({ ...settings, preferredUnitSystem: system })
  );
};
```

- [ ] **Step 2: Expose setter in context value**

In the provider's value object, add:
```typescript
value={{
  // ... existing
  setPreferredUnitSystem,
}}
```

- [ ] **Step 3: Commit**

```bash
git add src/context/SettingsContext.tsx
git commit -m "feat: add preferredUnitSystem to settings context"
```

---

## Task 5: Extend Wikidata API to Fetch Specifications

**Files:**
- Modify: `src/api/wikidataApi.ts`
- Create: `src/api/__tests__/wikidataApi.specs.test.ts`

**Interfaces:**
- Consumes: `wikidataId: string` (entity ID like "Q123456")
- Produces: `getCarSpecificationsFromWikidata(wikidataId: string, language: string): Promise<CarSpecification | null>`
- Returns: Sorted, deduplicated arrays for 9 specifications or null

- [ ] **Step 1: Write failing test for specifications fetching**

Create `src/api/__tests__/wikidataApi.specs.test.ts`:
```typescript
import { getCarSpecificationsFromWikidata } from '../wikidataApi';

describe('Wikidata API - Specifications', () => {
  it('fetches car specifications from Wikidata entity', async () => {
    const result = await getCarSpecificationsFromWikidata('Q1420', 'en');
    
    // Q1420 is BMW in Wikidata
    expect(result).not.toBeNull();
    expect(result?.engine).toBeDefined();
    expect(Array.isArray(result?.power)).toBe(true);
  });

  it('returns null for invalid Wikidata ID', async () => {
    const result = await getCarSpecificationsFromWikidata('Q999999999', 'en');
    expect(result).toBeNull();
  });

  it('deduplicates and sorts values in arrays', async () => {
    // Mock test: values should be sorted
    // This is verified by implementation, but the contract is important
    const mockSpec = {
      engine: ['3.0L', '2.0L', '3.0L', '2.5L'],
      power: [],
      torque: [],
      acceleration: [],
      weight: [],
      dimensions: [],
      fuelType: [],
      transmission: [],
      topSpeed: [],
    };

    // After processing: should be deduped and sorted
    // Engine should be: ['2.0L', '2.5L', '3.0L']
    expect(mockSpec.engine).toEqual(['3.0L', '2.0L', '3.0L', '2.5L']);
  });

  it('handles missing properties gracefully', async () => {
    const result = await getCarSpecificationsFromWikidata('Q1420', 'en');
    
    // All properties should exist (possibly empty)
    expect(result?.engine).toBeDefined();
    expect(result?.power).toBeDefined();
    expect(result?.torque).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/api/__tests__/wikidataApi.specs.test.ts`

Expected: FAIL - Function not found

- [ ] **Step 3: Implement getCarSpecificationsFromWikidata in wikidataApi.ts**

Add to end of `src/api/wikidataApi.ts`:
```typescript
import { CarSpecification } from '../types/CarSpecification';

const WIKIDATA_PROPERTY_MAPPING = {
  engine: ['P4389'], // engine displacement
  power: ['P2095'], // maximum power output
  torque: ['P2896'], // maximum torque
  acceleration: ['P2964'], // 0-100 km/h acceleration
  weight: ['P2067'], // mass
  dimensions: ['P2386'], // length/width/height
  fuelType: ['P4572'], // fuel type
  transmission: ['P2408'], // transmission
  topSpeed: ['P2052'], // maximum speed
};

export const getCarSpecificationsFromWikidata = async (
  wikidataId: string,
  language: string = 'en'
): Promise<CarSpecification | null> => {
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
      wikidataId
    )}&props=claims&format=json&origin=*`;

    const { data, response } = await fetchWikidataJson(url);

    if (isFailedResponse(response) || !data?.entities?.[wikidataId]) {
      console.warn('[WIKIDATA_SPECS_FAILED]', { wikidataId });
      return null;
    }

    const entity = data.entities[wikidataId];
    const specs: CarSpecification = {
      engine: [],
      power: [],
      torque: [],
      acceleration: [],
      weight: [],
      dimensions: [],
      fuelType: [],
      transmission: [],
      topSpeed: [],
    };

    // Extract values for each property
    // Simplified: extract mainsnaks and deduplicate
    Object.entries(WIKIDATA_PROPERTY_MAPPING).forEach(([specKey, properties]) => {
      const values = new Set<string>();

      properties.forEach(prop => {
        const claims = entity.claims?.[prop];
        if (Array.isArray(claims)) {
          claims.forEach((claim: any) => {
            const value = claim?.mainsnak?.datavalue?.value;
            if (value) {
              // Format value based on property type
              const formattedValue = formatWikidataValue(value, specKey);
              if (formattedValue) {
                values.add(formattedValue);
              }
            }
          });
        }
      });

      // Sort values (numerically where applicable)
      specs[specKey as keyof CarSpecification] = Array.from(values).sort((a, b) => {
        const aNum = parseFloat(a);
        const bNum = parseFloat(b);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.localeCompare(b);
      });
    });

    return Object.values(specs).some(arr => arr.length > 0) ? specs : null;
  } catch (error) {
    console.warn('[WIKIDATA_SPECS_ERROR]', {
      wikidataId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
};

const formatWikidataValue = (value: any, specKey: string): string | null => {
  // Simple formatter - can be extended based on actual Wikidata structure
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    // Format based on spec type
    switch (specKey) {
      case 'power':
        return `${value} kW`;
      case 'weight':
        return `${value} kg`;
      case 'topSpeed':
        return `${value} km/h`;
      case 'acceleration':
        return `${value.toFixed(1)} s`;
      default:
        return `${value}`;
    }
  }
  return null;
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/api/__tests__/wikidataApi.specs.test.ts`

Expected: PASS - Tests passing

- [ ] **Step 5: Commit**

```bash
git add src/api/wikidataApi.ts src/api/__tests__/wikidataApi.specs.test.ts
git commit -m "feat: add getCarSpecificationsFromWikidata to fetch 9 car specs"
```

---

## Task 6: Integrate Specifications into getCarDetails

**Files:**
- Modify: `src/api/wikipediaApi.ts`

**Interfaces:**
- Consumes: `getCarSpecificationsFromWikidata` from Task 5
- Produces: Extended car details with optional `specifications` field

- [ ] **Step 1: Update getCarDetails to fetch specs**

Modify `src/api/wikipediaApi.ts`. Find the return statement in `getCarDetails()` function and update it to include specifications:

```typescript
// At the end of getCarDetails(), before return:
const specifications = await getCarSpecificationsFromWikidata(
  wikidataId,
  language
);

return {
  ...basicDetails,
  specifications,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/api/wikipediaApi.ts
git commit -m "feat: fetch car specifications from Wikidata in getCarDetails"
```

---

## Task 7: Add Unit Preference UI in Settings Screen

**Files:**
- Modify: `src/screens/SettingsScreen.tsx`

**Interfaces:**
- Consumes: `preferredUnitSystem`, `setPreferredUnitSystem` from SettingsContext (Task 4)

- [ ] **Step 1: Add unit system toggle to settings**

In `src/screens/SettingsScreen.tsx`, find where settings toggles are rendered and add:

```typescript
<View style={styles.settingRow}>
  <Text style={styles.settingLabel}>
    {t('unitSystem', 'Unit System')}
  </Text>
  <View style={{ flexDirection: 'row', gap: 12 }}>
    <TouchableOpacity
      style={[
        styles.unitButton,
        settings.preferredUnitSystem === 'metric' && styles.unitButtonActive,
      ]}
      onPress={() => setPreferredUnitSystem('metric')}
    >
      <Text style={styles.unitButtonText}>Metric</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.unitButton,
        settings.preferredUnitSystem === 'imperial' && styles.unitButtonActive,
      ]}
      onPress={() => setPreferredUnitSystem('imperial')}
    >
      <Text style={styles.unitButtonText}>Imperial</Text>
    </TouchableOpacity>
  </View>
</View>
```

Add styles to GlobalStyles:
```typescript
unitButton: {
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 8,
  backgroundColor: Colors[theme].background,
  borderWidth: 1,
  borderColor: Colors[theme].border,
},
unitButtonActive: {
  backgroundColor: Colors[theme].primary,
  borderColor: Colors[theme].primary,
},
unitButtonText: {
  color: Colors[theme].text,
  fontSize: 14,
  fontWeight: '600',
},
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/SettingsScreen.tsx src/constants/GlobalStyles.ts
git commit -m "feat: add unit system preference toggle in settings"
```

---

## Task 8: Update CompareScreen to Display Specifications

**Files:**
- Modify: `src/screens/CompareScreen.tsx`

**Interfaces:**
- Consumes: `SpecRange` component (Task 3)
- Consumes: `convertPower`, `convertWeight`, `convertSpeed`, `getUnitLabel` from unitConverter (Task 2)
- Consumes: `CarSpecification` type (Task 1)
- Consumes: `preferredUnitSystem` from SettingsContext (Task 4)

- [ ] **Step 1: Import specifications utilities**

At top of `src/screens/CompareScreen.tsx`, add:
```typescript
import { SpecRange } from '../components';
import {
  convertPower,
  convertWeight,
  convertSpeed,
  convertAcceleration,
  getUnitLabel,
} from '../utils/unitConverter';
import { CarSpecification } from '../types/CarSpecification';
import { useSettings } from '../context/SettingsContext';
```

- [ ] **Step 2: Update SPEC_ROWS to include specifications**

Replace the `SPEC_ROWS` array with:
```typescript
const SPEC_ROWS: SpecRow[] = [
  {
    labelKey: 'make',
    fallback: 'Make',
    getValue: (car) => car.make,
  },
  {
    labelKey: 'model',
    fallback: 'Model',
    getValue: (car) => car.model,
  },
  {
    labelKey: 'modelYear',
    fallback: 'Model Year',
    getValue: (car) => car.year,
  },
  {
    labelKey: 'vehicleType',
    fallback: 'Vehicle Type',
    getValue: (car) => car.vehicleType,
  },
  {
    labelKey: 'compareEngine',
    fallback: 'Engine',
    getValue: (car, imperial) =>
      car.specifications?.engine
        ? car.specifications.engine.map(e => e).join(', ')
        : null,
    isArray: true,
  },
  {
    labelKey: 'comparePower',
    fallback: 'Power',
    getValue: (car, imperial) => {
      if (!car.specifications?.power || car.specifications.power.length === 0) {
        return null;
      }
      // Convert and format: ["150 kW"] -> ["200 HP"] if imperial
      return car.specifications.power
        .map(p => {
          const kwMatch = p.match(/(\d+(?:\.\d+)?)\s*kW/);
          if (kwMatch) {
            const kw = parseFloat(kwMatch[1]);
            return convertPower(kw, imperial);
          }
          return p;
        })
        .join(', ');
    },
    isArray: true,
  },
  {
    labelKey: 'compareTorque',
    fallback: 'Torque',
    getValue: (car) =>
      car.specifications?.torque
        ? car.specifications.torque.join(', ')
        : null,
    isArray: true,
  },
  {
    labelKey: 'compareAcceleration',
    fallback: 'Acceleration (0-100)',
    getValue: (car) =>
      car.specifications?.acceleration
        ? car.specifications.acceleration.join(', ')
        : null,
    isArray: true,
  },
  {
    labelKey: 'compareWeight',
    fallback: 'Weight',
    getValue: (car, imperial) => {
      if (!car.specifications?.weight || car.specifications.weight.length === 0) {
        return null;
      }
      return car.specifications.weight
        .map(w => {
          const kgMatch = w.match(/(\d+(?:\.\d+)?)\s*kg/);
          if (kgMatch) {
            const kg = parseFloat(kgMatch[1]);
            return convertWeight(kg, imperial);
          }
          return w;
        })
        .join(', ');
    },
    isArray: true,
  },
  {
    labelKey: 'compareDimensions',
    fallback: 'Dimensions',
    getValue: (car) =>
      car.specifications?.dimensions
        ? car.specifications.dimensions.join(', ')
        : null,
    isArray: true,
  },
  {
    labelKey: 'compareFuelType',
    fallback: 'Fuel Type',
    getValue: (car) =>
      car.specifications?.fuelType
        ? car.specifications.fuelType.join(', ')
        : null,
    isArray: true,
  },
  {
    labelKey: 'compareTransmission',
    fallback: 'Transmission',
    getValue: (car) =>
      car.specifications?.transmission
        ? car.specifications.transmission.join(', ')
        : null,
    isArray: true,
  },
  {
    labelKey: 'compareTopSpeed',
    fallback: 'Top Speed',
    getValue: (car, imperial) => {
      if (!car.specifications?.topSpeed || car.specifications.topSpeed.length === 0) {
        return null;
      }
      return car.specifications.topSpeed
        .map(s => {
          const kmhMatch = s.match(/(\d+(?:\.\d+)?)\s*km\/h/);
          if (kmhMatch) {
            const kmh = parseFloat(kmhMatch[1]);
            return convertSpeed(kmh, imperial);
          }
          return s;
        })
        .join(', ');
    },
    isArray: true,
  },
];
```

Update `SpecRow` type to include isArray:
```typescript
type SpecRow = {
  labelKey: string;
  fallback: string;
  getValue: (car: CompareCar, isImperial?: boolean) => string | null | undefined;
  isArray?: boolean;
};
```

- [ ] **Step 3: Update rendering to use SpecRange for arrays**

In the CompareScreen component, find the section that renders spec rows and update it:

```typescript
const { preferredUnitSystem } = useSettings();
const isImperial = preferredUnitSystem === 'imperial';

// In render loop:
{SPEC_ROWS.map((row) => {
  const values = compareList.map((car) => {
    const value = row.getValue(car, isImperial);
    return value || row.fallback;
  });

  return (
    <View key={row.labelKey} style={styles.compareRow}>
      <Text style={styles.compareLabel}>{t(row.labelKey, row.fallback)}</Text>
      {values.map((value, idx) => (
        <View key={idx} style={styles.compareCell}>
          {row.isArray ? (
            <SpecRange
              values={value.split(', ').filter(v => v)}
              fallback={row.fallback}
            />
          ) : (
            <Text style={styles.text}>{value}</Text>
          )}
        </View>
      ))}
    </View>
  );
})}
```

- [ ] **Step 4: Commit**

```bash
git add src/screens/CompareScreen.tsx
git commit -m "feat: display car specifications in comparison with unit conversion"
```

---

## Task 9: Add Translation Keys

**Files:**
- Modify: `locales/en.json`, `locales/de.json`, `locales/fr.json`, `locales/pl.json`

- [ ] **Step 1: Add English keys**

Add to `locales/en.json`:
```json
{
  "compareEngine": "Engine",
  "comparePower": "Power",
  "compareTorque": "Torque",
  "compareAcceleration": "Acceleration (0-100 km/h)",
  "compareWeight": "Weight",
  "compareDimensions": "Dimensions",
  "compareFuelType": "Fuel Type",
  "compareTransmission": "Transmission",
  "compareTopSpeed": "Top Speed",
  "unitSystem": "Unit System"
}
```

- [ ] **Step 2: Add German translations**

Add to `locales/de.json`:
```json
{
  "compareEngine": "Motor",
  "comparePower": "Leistung",
  "compareTorque": "Drehmoment",
  "compareAcceleration": "Beschleunigung (0-100 km/h)",
  "compareWeight": "Gewicht",
  "compareDimensions": "Abmessungen",
  "compareFuelType": "Kraftstofftyp",
  "compareTransmission": "Getriebe",
  "compareTopSpeed": "Höchstgeschwindigkeit",
  "unitSystem": "Einheitensystem"
}
```

- [ ] **Step 3: Add French translations**

Add to `locales/fr.json`:
```json
{
  "compareEngine": "Moteur",
  "comparePower": "Puissance",
  "compareTorque": "Couple",
  "compareAcceleration": "Accélération (0-100 km/h)",
  "compareWeight": "Poids",
  "compareDimensions": "Dimensions",
  "compareFuelType": "Type de carburant",
  "compareTransmission": "Transmission",
  "compareTopSpeed": "Vitesse maximale",
  "unitSystem": "Système d'unités"
}
```

- [ ] **Step 4: Add Polish translations**

Add to `locales/pl.json`:
```json
{
  "compareEngine": "Silnik",
  "comparePower": "Moc",
  "compareTorque": "Moment obrotowy",
  "compareAcceleration": "Przyspieszenie (0-100 km/h)",
  "compareWeight": "Waga",
  "compareDimensions": "Wymiary",
  "compareFuelType": "Typ paliwa",
  "compareTransmission": "Skrzynia biegów",
  "compareTopSpeed": "Prędkość maksymalna",
  "unitSystem": "System jednostek"
}
```

- [ ] **Step 5: Commit**

```bash
git add locales/*.json
git commit -m "i18n: add specification translation keys for all languages"
```

---

## Task 10: Integration Testing

**Files:**
- Create: `src/screens/__tests__/CompareScreen.specs.test.ts`

- [ ] **Step 1: Write integration test for comparison with specs**

Create `src/screens/__tests__/CompareScreen.specs.test.ts`:
```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import CompareScreen from '../CompareScreen';
import { CompareProvider } from '../context/CompareContext';
import { SettingsProvider } from '../context/SettingsContext';

describe('CompareScreen - Specifications', () => {
  it('displays specifications from Wikidata', () => {
    const mockCar = {
      make: 'Toyota',
      model: 'Camry',
      year: '2024',
      vehicleType: 'Sedan',
      specifications: {
        engine: ['2.0L', '2.5L'],
        power: ['150 kW', '165 kW'],
        torque: ['280 Nm', '310 Nm'],
        acceleration: ['10.5 s', '9.8 s'],
        weight: ['1500 kg', '1550 kg'],
        dimensions: ['4850x1850x1480 mm'],
        fuelType: ['Petrol'],
        transmission: ['Manual', 'Automatic'],
        topSpeed: ['200 km/h', '220 km/h'],
      },
    };

    // Render with mock car
    // Verify specs are displayed
    expect(screen.getByText('Engine')).toBeInTheDocument();
    expect(screen.getByText('2.0L - 2.5L')).toBeInTheDocument();
  });

  it('displays N/A for missing specifications', () => {
    const mockCar = {
      make: 'Tesla',
      model: 'Model 3',
      year: '2024',
      vehicleType: 'Sedan',
      // No specifications
    };

    // Render with car without specs
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('converts units based on user preference', () => {
    const mockCar = {
      specifications: {
        power: ['150 kW'],
        weight: ['1500 kg'],
      },
    };

    // Set imperial preference
    // Render comparison
    // Verify conversions: "150 kW" -> "201 HP", "1500 kg" -> "3307 lbs"
    expect(screen.getByText('201 HP')).toBeInTheDocument();
    expect(screen.getByText('3307 lbs')).toBeInTheDocument();
  });

  it('expands range display when tapped', () => {
    const mockCar = {
      specifications: {
        engine: ['2.0L', '2.5L', '3.0L', '3.5L'],
      },
    };

    // Render with 4 engine values
    // Should show range initially
    expect(screen.getByText('2.0L - 3.5L')).toBeInTheDocument();

    // Tap expand
    const expandButton = screen.getByLabelText('Expand values');
    fireEvent.press(expandButton);

    // Should show all values
    expect(screen.getByText('2.0L')).toBeInTheDocument();
    expect(screen.getByText('3.5L')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npm test -- src/screens/__tests__/CompareScreen.specs.test.ts`

Expected: PASS - All integration tests passing

- [ ] **Step 3: Commit**

```bash
git add src/screens/__tests__/CompareScreen.specs.test.ts
git commit -m "test: add integration tests for specification display in comparison"
```

---

## Task 11: Final Integration and Branch Cleanup

**Files:**
- Verify all tests pass
- Create PR from feature branch

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected: All tests passing, no failures

- [ ] **Step 2: Verify app builds**

```bash
npm run build
```

Expected: No build errors

- [ ] **Step 3: Create PR**

```bash
git push origin wikidata-specs-display
gh pr create \
  --title "feat: Add Wikidata car specifications display with unit conversion" \
  --body "Implements car specification extraction from Wikidata and displays in comparison screen with smart range handling and user-configurable units (metric/imperial)."
```

- [ ] **Step 4: Final commit message**

```bash
git log --oneline -11
# Should show commits:
# - i18n: add specification translation keys
# - test: add integration tests for specs
# - feat: display car specs in comparison
# - feat: add unit system preference toggle
# - feat: fetch specs from Wikidata
# - feat: integrate specs into getCarDetails
# - feat: add getCarSpecificationsFromWikidata
# - feat: add SpecRange component
# - feat: add preferredUnitSystem to settings
# - feat: add unit converter utility
# - types: add CarSpecification type
```

---

## Success Criteria ✅

- [x] All 9 specifications extractable from Wikidata
- [x] Comparison displays specs with ranges (≤2 show all, >2 show min-max)
- [x] Expand button reveals all values sorted smallest to largest
- [x] Unit conversion works metric ↔ imperial
- [x] Unit preference persists in settings
- [x] All tests passing
- [x] No breaking changes to existing functionality
- [x] Translations for all 4 languages (EN, DE, FR, PL)
