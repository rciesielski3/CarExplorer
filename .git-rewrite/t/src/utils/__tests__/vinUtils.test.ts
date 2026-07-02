import { getVinValidationMessage, normalizeVin, validateVin } from "../vinUtils";

describe("vinUtils", () => {
  it("normalizes VIN input by uppercasing and removing whitespace", () => {
    expect(normalizeVin(" 1hg cm826 33a004352 ")).toBe(
      "1HGCM82633A004352"
    );
  });

  it("accepts a 17-character VIN without forbidden letters", () => {
    expect(validateVin("1HGCM82633A004352")).toEqual({
      isValid: true,
      normalizedVin: "1HGCM82633A004352",
    });
  });

  it("rejects VINs that are not 17 characters long", () => {
    expect(validateVin("1HGCM82633A00435")).toEqual({
      isValid: false,
      normalizedVin: "1HGCM82633A00435",
      reason: "length",
    });
  });

  it("validates the normalized VIN when input contains whitespace", () => {
    expect(validateVin("1HG CM826 33A004352")).toEqual({
      isValid: true,
      normalizedVin: "1HGCM82633A004352",
    });
  });

  it("rejects VINs containing I, O, or Q", () => {
    expect(validateVin("1HGCM82633A00435Q")).toEqual({
      isValid: false,
      normalizedVin: "1HGCM82633A00435Q",
      reason: "forbiddenCharacters",
    });
  });

  it("maps validation reasons to translation keys", () => {
    expect(getVinValidationMessage("length")).toBe("vinLengthError");
    expect(getVinValidationMessage("forbiddenCharacters")).toBe(
      "vinForbiddenCharactersError"
    );
  });
});
