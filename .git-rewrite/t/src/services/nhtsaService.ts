import axios from "axios";

import { NHTSA_API } from "../config/apiConfig";

/**
 * Fetch all car makes for the "car" vehicle type.
 */
export const fetchCarMakes = async (): Promise<{ make: string }[]> => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.VEHICLE_TYPES}`
    );
    return response.data.Results.map((car: any) => ({ make: car.MakeName }));
  } catch (error) {
    console.error("❌ Error fetching car makes:", error);
    return [];
  }
};
