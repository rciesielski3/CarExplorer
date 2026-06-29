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
  model: string
): Promise<string | null> => {
  const query = `${make} ${model}`;
  const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(
    query
  )}&language=en&format=json&origin=*`;

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

    // Find the first result that looks like a car entity (often has "automobile" in description)
    const carEntity = results.find(
      (item: any) =>
        item?.id &&
        (!item?.description ||
          item.description.toLowerCase().includes("automobile") ||
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
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[WIKIDATA_SEARCH_ERROR]", {
      error: message,
      make,
      model,
    });
    return null;
  }
};

/**
 * Fetch the description property (P31 = instance of) from Wikidata.
 * This helps identify what type of entity it is.
 */
export const getWikidataDescription = async (
  wikidataId: string
): Promise<string | null> => {
  const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
    wikidataId
  )}&props=descriptions&languages=en&format=json&origin=*`;

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

    const description = entity?.descriptions?.en?.value;
    if (typeof description === "string" && description.trim()) {
      console.log("[WIKIDATA_DESC_FOUND]", wikidataId, ":", description);
      return description;
    }

    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[WIKIDATA_DESC_ERROR]", {
      error: message,
      wikidataId,
    });
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
    const wikidataId = await searchWikidataForCar(make, model);
    if (!wikidataId) {
      console.log("[WIKIDATA_NO_ENTITY]", make, model);
      wikidataCache.set(cacheKey, null);
      return null;
    }

    // Step 2: Get the description
    const description = await getWikidataDescription(wikidataId);
    if (description) {
      console.log("[WIKIDATA_DETAILS_FOUND]", make, model);
      wikidataCache.set(cacheKey, description);
      return description;
    }

    // If no description, try to fetch full entity data and extract labels/descriptions
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${encodeURIComponent(
      wikidataId
    )}&props=labels|descriptions|claims&languages=en&format=json&origin=*`;

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
    const label = entity?.labels?.en?.value;
    if (typeof label === "string" && label.trim()) {
      console.log("[WIKIDATA_LABEL_FOUND]", wikidataId, ":", label);
      wikidataCache.set(cacheKey, label);
      return label;
    }

    wikidataCache.set(cacheKey, null);
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[WIKIDATA_DETAILS_ERROR]", {
      error: message,
      make,
      model,
    });
    wikidataCache.set(cacheKey, null);
    return null;
  }
};
