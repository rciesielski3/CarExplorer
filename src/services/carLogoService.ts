import axios from "axios";

import { CAR_LOGO_API } from "../config/apiConfig";

let logoCache: Record<string, string> = {};

/**
 * Fetch car logos and return a map of make names to optimized logo URLs.
 */
export const fetchCarLogos = async (): Promise<Record<string, string>> => {
  if (Object.keys(logoCache).length > 0) return logoCache;

  try {
    const { data } = await axios.get(CAR_LOGO_API.BASE_URL);
    logoCache = data.reduce((map: Record<string, string>, car: any) => {
      map[car.name.toLowerCase()] = car.image.optimized;
      return map;
    }, {});

    return logoCache;
  } catch (error) {
    console.error("❌ Error fetching car logos:", error);
    return {};
  }
};

/**
 * Get a logo URL for a specific car make.
 */
export const getCarLogoUrl = async (make: string): Promise<string | null> => {
  if (!logoCache[make.toLowerCase()]) {
    await fetchCarLogos();
  }
  return logoCache[make.toLowerCase()] || null;
};
