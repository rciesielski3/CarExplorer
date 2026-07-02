import { getCarImagesFallbackUrl } from "../carImagesApi";

describe("carImagesApi", () => {
  it("builds the free image fallback URL without client secrets", () => {
    expect(
      getCarImagesFallbackUrl({
        make: "Toyota",
        model: "Corolla Cross",
        year: "2024",
      })
    ).toBe(
      "https://carimagesapi.com/image?type=car&make=Toyota&width=800&format=webp&model=Corolla+Cross&year=2024"
    );
  });
});
