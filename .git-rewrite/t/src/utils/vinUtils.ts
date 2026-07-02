export type VinValidationReason = "length" | "forbiddenCharacters";

export interface VinValidationResult {
  isValid: boolean;
  normalizedVin: string;
  reason?: VinValidationReason;
}

const FORBIDDEN_VIN_CHARACTERS = /[IOQ]/;
const VIN_LENGTH = 17;

export const normalizeVin = (vin: string): string =>
  vin.toUpperCase().replace(/\s+/g, "");

export const validateVin = (vin: string): VinValidationResult => {
  const normalizedVin = normalizeVin(vin);

  if (normalizedVin.length !== VIN_LENGTH) {
    return {
      isValid: false,
      normalizedVin,
      reason: "length",
    };
  }

  if (FORBIDDEN_VIN_CHARACTERS.test(normalizedVin)) {
    return {
      isValid: false,
      normalizedVin,
      reason: "forbiddenCharacters",
    };
  }

  return {
    isValid: true,
    normalizedVin,
  };
};

export const getVinValidationMessage = (
  reason: VinValidationReason
): string =>
  reason === "length" ? "vinLengthError" : "vinForbiddenCharactersError";
