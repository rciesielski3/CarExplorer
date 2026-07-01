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
    const entityId = 'Q123';
    const mockFetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          entities: {
            [entityId]: {
              claims: {
                P4389: [
                  { mainsnak: { datavalue: { value: '3.0L' } } },
                  { mainsnak: { datavalue: { value: '2.0L' } } },
                  { mainsnak: { datavalue: { value: '3.0L' } } }, // duplicate
                  { mainsnak: { datavalue: { value: '2.5L' } } },
                ],
              },
            },
          },
        }),
    });

    const originalFetch = global.fetch;
    global.fetch = mockFetch as jest.Mock;

    try {
      const spec = await getCarSpecificationsFromWikidata(entityId, 'en');
      expect(spec).not.toBeNull();
      // After dedup + sort: ['2.0L', '2.5L', '3.0L']
      expect(spec!.engine).toEqual(['2.0L', '2.5L', '3.0L']);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('handles missing properties gracefully', async () => {
    const result = await getCarSpecificationsFromWikidata('Q1420', 'en');

    // All properties should exist (possibly empty)
    expect(result?.engine).toBeDefined();
    expect(result?.power).toBeDefined();
    expect(result?.torque).toBeDefined();
  });
});
