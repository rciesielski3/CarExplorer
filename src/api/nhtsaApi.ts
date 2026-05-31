import axios from "axios";

import { NHTSA_API } from "../config/apiConfig";

interface NhtsaMake {
  Make_ID: number;
  Make_Name: string;
}

interface NhtsaModel {
  Model_ID: number;
  Model_Name: string;
}

/**
 * Fetch all car makes.
 */
export const fetchAllCarMakes = async () => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.ALL_MAKES}`
    );
    return response.data.Results.map(({ Make_ID, Make_Name }: NhtsaMake) => ({
      id: Make_ID,
      name: Make_Name,
    }));
  } catch (error) {
    console.error("Error fetching all car makes:", error);
    return [];
  }
};

/**
 * Fetch makes for a specific manufacturer.
 */
export const fetchMakesByManufacturer = async (manufacturer: string) => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.MAKES_BY_MANUFACTURER(manufacturer)}`
    );
    return response.data.Results.map(({ Make_ID, Make_Name }: NhtsaMake) => ({
      id: Make_ID,
      name: Make_Name,
    }));
  } catch (error) {
    console.error(
      `Error fetching makes for manufacturer ${manufacturer}:`,
      error
    );
    return [];
  }
};

/**
 * Fetch models for a specific make.
 */
export const fetchModelsForMake = async (make: string) => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.MODELS_BY_MAKE(make)}`
    );
    return response.data.Results.map(({ Model_ID, Model_Name }: NhtsaModel) => ({
      id: Model_ID,
      name: Model_Name,
    }));
  } catch (error) {
    console.error(`Error fetching models for make ${make}:`, error);
    return [];
  }
};

/**
 * Fetch models for a specific make and year.
 */
export const fetchModelsForMakeAndYear = async (make: string, year: number) => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.MODELS_BY_MAKE_AND_YEAR(make, year)}`
    );

    return response.data.Results.map(({ Model_ID, Model_Name }: NhtsaModel) => ({
      id: Model_ID,
      name: Model_Name,
    }));
  } catch (error) {
    console.error(
      `Error fetching models for make ${make} and year ${year}:`,
      error
    );
    return [];
  }
};

/**
 * Fetch models for a specific make and type.
 */
export const fetchModelsForMakeAndType = async (
  make: string,
  type: string | null
) => {
  try {
    if (!type) {
      return await fetchModelsForMake(make);
    }

    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.MODELS_BY_MAKE_AND_TYPE(make, type)}`
    );

    const modelsByType = response.data.Results.map(
      ({ Model_ID, Model_Name }: NhtsaModel) => ({
        id: Model_ID,
        name: Model_Name,
      })
    );

    if (modelsByType.length === 0) {
      console.warn(`No models found for make "${make}" with type "${type}".`);
      return [];
    }

    return modelsByType;
  } catch (error) {
    console.error(
      `Error fetching models for make "${make}" and type "${type}":`,
      error
    );
    return [];
  }
};

/**
 * Fetch manufacturer details for a specific manufacturer.
 */
export const fetchManufacturerDetails = async (manufacturer: string) => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.MANUFACTURER_DETAILS(manufacturer)}`
    );
    return response.data.Results;
  } catch (error) {
    console.error(
      `Error fetching details for manufacturer ${manufacturer}:`,
      error
    );
    return null;
  }
};

/**
 * Decode a VIN and get vehicle details.
 */
export const decodeVin = async (vin: string) => {
  try {
    const response = await axios.get(
      `${NHTSA_API.BASE_URL}${NHTSA_API.DECODE_VIN(vin)}`
    );
    const vehicleData = response.data.Results[0];

    return {
      Make: vehicleData.Make || "Unknown",
      Manufacturer: vehicleData.Manufacturer || "Unknown",
      ModelYear: vehicleData.ModelYear || "Unknown",
      VehicleType: vehicleData.VehicleType || "Unknown",
    };
  } catch (error) {
    console.error(`Error decoding VIN ${vin}:`, error);
    return null;
  }
};
