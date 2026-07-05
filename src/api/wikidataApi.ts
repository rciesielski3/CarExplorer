import { CarSpecification } from '../types/CarSpecification';
import { handleApiError } from '../utils/errorHandler';
import { toastManager } from '../components/Toast';

const wikidataCache = new Map<string, string | null>();

const WIKIDATA_FETCH_OPTIONS = {
  headers: {
    Accept: "application/json",
    "User-Agent":
      "CarExplorer/2.0.5 (https://rciesielski3.github.io/portfolio/#/contact)",
  },
};

const fetchWikidataJson = async (url: string) => {
  console.log("[WIKIDATA_FETCH] Fetching:", url);
  const response = await fetch(url, WIKIDATA_FETCH_OPTIONS);
  const data = await response.json().catch(() => null);

  console.log("[WIKIDATA_STATUS] Status:", response.status);
  console.log(
    "[WIKIDATA_DATA] Response data (first 200 chars):",
    JSON.stringify(data).slice(0, 200)
  );

  return { data, response };
};

const isFailedResponse = (response: Response): boolean => response.ok === false;

/**
 * Search Wikidata for car entities matching the given make and model.
 * Returns the Wikidata ID (e.g., "Q123456") of the most relevant car.
 */
export const searchWikidataForCar = async (
  make: string,
  model: string,
  language: string = "en"
): Promise<string | null> => {
  const query = `${make} ${model}`;
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    query
  )}&language=${encodeURIComponent(language)}&format=json&origin=*`;

  try {
    const { data, response } = await fetchWikidataJson(searchUrl);

    if (isFailedResponse(response)) {
      console.warn("[WIKIDATA_SEARCH_FAILED]", {
        make,
        model,
        status: response.status,
      });
      return null;
    }

    const results = data?.search;
    if (!Array.isArray(results) || results.length === 0) {
      console.log("[WIKIDATA_NO_RESULTS]", make, model);
      return null;
    }

    // Find the first result that looks like a car entity (prioritize items with "automobile" or "car" in description)
    const carEntity = results.find(
      (item: any) =>
        item?.id &&
        item?.description &&
        (item.description.toLowerCase().includes("automobile") ||
          item.description.toLowerCase().includes("car"))
    );

    if (carEntity) {
      console.log("[WIKIDATA_FOUND]", carEntity.id, "for", make, model);
      return carEntity.id;
    }

    // If no automobile description found, use the first result
    if (results[0]?.id) {
      console.log("[WIKIDATA_FOUND_FIRST]", results[0].id, "for", make, model);
      return results[0].id;
    }

    return null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const result = handleApiError(err, {
      apiName: 'Wikidata',
      action: `search_${make}_${model}`,
    });
    toastManager.show(result.message, 'error');
    console.warn('[WIKIDATA_ERROR]', result.context);
    return null;
  }
};

/**
 * Fetch the description property (P31 = instance of) from Wikidata.
 * This helps identify what type of entity it is.
 */
export const getWikidataDescription = async (
  wikidataId: string,
  language: string = "en"
): Promise<string | null> => {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
    wikidataId
  )}&props=descriptions&languages=${encodeURIComponent(language)}&format=json&origin=*`;

  try {
    const { data, response } = await fetchWikidataJson(url);

    if (isFailedResponse(response)) {
      console.warn("[WIKIDATA_DESC_FAILED]", {
        status: response.status,
        wikidataId,
      });
      return null;
    }

    const entity = data?.entities?.[wikidataId];
    if (!entity) {
      return null;
    }

    const description = entity?.descriptions?.[language]?.value;
    if (typeof description === "string" && description.trim()) {
      console.log("[WIKIDATA_DESC_FOUND]", wikidataId, ":", description);
      return description;
    }

    return null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const result = handleApiError(err, {
      apiName: 'Wikidata',
      action: `description_${wikidataId}`,
    });
    toastManager.show(result.message, 'error');
    console.warn('[WIKIDATA_ERROR]', result.context);
    return null;
  }
};

/**
 * Get car details from Wikidata by retrieving the entity description and other properties.
 * This serves as a fallback when Wikipedia doesn't have details.
 */
export const getCarDetailsFromWikidata = async (
  make: string,
  model: string,
  language: string = "en"
): Promise<string | null> => {
  console.log("[WIKIDATA_DETAILS_REQUEST]", make, model, "language:", language);

  const cacheKey = `${language}:${make}:${model}`.toLowerCase();
  if (wikidataCache.has(cacheKey)) {
    console.log("[WIKIDATA_CACHE_HIT]", cacheKey);
    return wikidataCache.get(cacheKey) || null;
  }

  try {
    // Step 1: Search for the car entity
    const wikidataId = await searchWikidataForCar(make, model, language);
    if (!wikidataId) {
      console.log("[WIKIDATA_NO_ENTITY]", make, model);
      wikidataCache.set(cacheKey, null);
      return null;
    }

    // Step 2: Get the description
    const description = await getWikidataDescription(wikidataId, language);
    if (description) {
      console.log("[WIKIDATA_DETAILS_FOUND]", make, model);
      wikidataCache.set(cacheKey, description);
      return description;
    }

    // If no description, try to fetch full entity data and extract labels/descriptions
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
      wikidataId
    )}&props=labels|descriptions|claims&languages=${encodeURIComponent(language)}&format=json&origin=*`;

    const { data, response } = await fetchWikidataJson(url);

    if (isFailedResponse(response)) {
      console.warn("[WIKIDATA_ENTITY_FAILED]", {
        status: response.status,
        wikidataId,
      });
      wikidataCache.set(cacheKey, null);
      return null;
    }

    const entity = data?.entities?.[wikidataId];
    if (!entity) {
      wikidataCache.set(cacheKey, null);
      return null;
    }

    // Try to get label as fallback
    const label = entity?.labels?.[language]?.value;
    if (typeof label === "string" && label.trim()) {
      console.log("[WIKIDATA_LABEL_FOUND]", wikidataId, ":", label);
      wikidataCache.set(cacheKey, label);
      return label;
    }

    wikidataCache.set(cacheKey, null);
    return null;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    const result = handleApiError(err, {
      apiName: 'Wikidata',
      action: `details_${make}_${model}`,
    });
    toastManager.show(result.message, 'error');
    console.warn('[WIKIDATA_ERROR]', result.context);
    wikidataCache.set(cacheKey, null);
    return null;
  }
};

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
    if (entity.missing !== undefined) {
      console.warn('[WIKIDATA_SPECS_FAILED]', { wikidataId, reason: 'entity missing' });
      return null;
    }
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

      // Sort values (numerically where applicable).
      // NOTE: Assumes single unit per property (all metric after normalization).
      // If mixed units are added to the same property, this comparator will silently invert order.
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
    const err = error instanceof Error ? error : new Error(String(error));
    const result = handleApiError(err, {
      apiName: 'Wikidata',
      action: `specifications_${wikidataId}`,
    });
    toastManager.show(result.message, 'error');
    console.warn('[WIKIDATA_ERROR]', result.context);
    return null;
  }
};

const formatWikidataValue = (value: any, specKey: string): string | null => {
  // Handle plain strings (e.g. dimensions, engine description)
  if (typeof value === 'string') {
    return value;
  }

  // Handle Wikidata quantity datavalue: { amount: "+150", unit: "http://..." }
  if (typeof value === 'object' && value !== null && 'amount' in value) {
    const raw = String(value.amount).replace(/^\+/, '');
    const num = parseFloat(raw);
    if (isNaN(num)) {
      return null;
    }
    switch (specKey) {
      case 'power':
        return `${num} kW`;
      case 'weight':
        return `${num} kg`;
      case 'topSpeed':
        return `${num} km/h`;
      case 'acceleration':
        return `${num.toFixed(1)} s`;
      case 'torque':
        return `${num} Nm`;
      default:
        return `${num}`;
    }
  }

  // Handle Wikidata item/entity datavalue: { "entity-type": "item", id: "Q..." }
  // Labels require a separate API call; return null here so callers can skip
  if (typeof value === 'object' && value !== null && 'entity-type' in value) {
    return null;
  }

  // Fallback for unexpected number primitives
  if (typeof value === 'number') {
    switch (specKey) {
      case 'power':
        return `${value} kW`;
      case 'weight':
        return `${value} kg`;
      case 'topSpeed':
        return `${value} km/h`;
      case 'acceleration':
        return `${value.toFixed(1)} s`;
      case 'torque':
        return `${value} Nm`;
      default:
        return `${value}`;
    }
  }

  return null;
};
