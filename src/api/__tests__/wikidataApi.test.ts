import {
  searchWikidataForCar,
  getWikidataDescription,
  getCarDetailsFromWikidata,
} from "../wikidataApi";

const mockFetch = jest.fn();

global.fetch = mockFetch as jest.Mock;

const wikidataSearchResponse = (results?: any[]) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        search: results || [],
      }),
  });

const wikidataEntityResponse = (entityId: string, descriptions?: any) =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        entities: {
          [entityId]: {
            descriptions: descriptions || {
              en: { value: "A type of car" },
            },
            labels: {
              en: { value: "Some Car" },
            },
          },
        },
      }),
  });

describe("wikidataApi", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("searches Wikidata for car entities", async () => {
    mockFetch.mockResolvedValueOnce(
      wikidataSearchResponse([
        {
          id: "Q123456",
          label: "Toyota Corolla",
          description: "automobile produced by Toyota",
        },
      ])
    );

    const result = await searchWikidataForCar("Toyota", "Corolla");

    expect(result).toBe("Q123456");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain(
      "wbsearchentities&search=Toyota%20Corolla"
    );
  });

  it("returns null when Wikidata search returns no results", async () => {
    mockFetch.mockResolvedValueOnce(wikidataSearchResponse([]));

    const result = await searchWikidataForCar("UnknownMake", "UnknownModel");

    expect(result).toBeNull();
  });

  it("prioritizes results with automobile description", async () => {
    mockFetch.mockResolvedValueOnce(
      wikidataSearchResponse([
        {
          id: "Q111111",
          label: "Generic Car",
          description: "a type of vehicle",
        },
        {
          id: "Q222222",
          label: "Specific Car",
          description: "automobile produced by Company",
        },
      ])
    );

    const result = await searchWikidataForCar("Test", "Car");

    expect(result).toBe("Q222222");
  });

  it("gets Wikidata description for entity", async () => {
    mockFetch.mockResolvedValueOnce(
      wikidataEntityResponse("Q123456", {
        en: { value: "Japanese automobile manufacturer" },
      })
    );

    const result = await getWikidataDescription("Q123456");

    expect(result).toBe("Japanese automobile manufacturer");
  });

  it("returns null when entity has no description", async () => {
    mockFetch.mockResolvedValueOnce(
      wikidataEntityResponse("Q999999", { en: { value: "" } })
    );

    const result = await getWikidataDescription("Q999999");

    expect(result).toBeNull();
  });

  it("gets car details from Wikidata when search succeeds", async () => {
    mockFetch
      .mockResolvedValueOnce(
        wikidataSearchResponse([
          {
            id: "Q123456",
            label: "Honda Civic",
            description: "automobile",
          },
        ])
      )
      .mockResolvedValueOnce(
        wikidataEntityResponse("Q123456", {
          en: { value: "A popular compact car" },
        })
      );

    const result = await getCarDetailsFromWikidata("Honda", "Civic");

    expect(result).toBe("A popular compact car");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("returns null when no Wikidata entity found", async () => {
    mockFetch.mockResolvedValueOnce(wikidataSearchResponse([]));

    const result = await getCarDetailsFromWikidata("Unknown", "Car");

    expect(result).toBeNull();
  });

  it("falls back to entity label when description is empty", async () => {
    mockFetch
      .mockResolvedValueOnce(
        wikidataSearchResponse([
          {
            id: "Q777777",
            label: "Some Car Model",
            description: "automobile",
          },
        ])
      )
      .mockResolvedValueOnce(
        wikidataEntityResponse("Q777777", {
          en: { value: "" },
        })
      )
      .mockResolvedValueOnce(
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              entities: {
                Q777777: {
                  descriptions: {
                    en: { value: "" },
                  },
                  labels: {
                    en: { value: "Some Car Model" },
                  },
                },
              },
            }),
        })
      );

    const result = await getCarDetailsFromWikidata("Test", "Model");

    expect(result).toBe("Some Car Model");
  });

  it("caches Wikidata details", async () => {
    mockFetch
      .mockResolvedValueOnce(
        wikidataSearchResponse([
          {
            id: "Q123456",
            label: "BMW 3 Series",
            description: "automobile",
          },
        ])
      )
      .mockResolvedValueOnce(
        wikidataEntityResponse("Q123456", {
          en: { value: "Premium sedan" },
        })
      );

    const result1 = await getCarDetailsFromWikidata("BMW", "3 Series");
    const result2 = await getCarDetailsFromWikidata("BMW", "3 Series");

    expect(result1).toBe("Premium sedan");
    expect(result2).toBe("Premium sedan");
    expect(mockFetch).toHaveBeenCalledTimes(2); // Only initial fetch, cached after
  });
});
