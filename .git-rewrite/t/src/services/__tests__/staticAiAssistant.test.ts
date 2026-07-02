import {
  findStaticAiAnswer,
  getStaticAiFaqCount,
  getStaticAiSuggestions,
} from "../staticAiAssistant";

describe("staticAiAssistant", () => {
  it("ships a broad 80-100 question static FAQ pack", () => {
    expect(getStaticAiFaqCount()).toBeGreaterThanOrEqual(80);
    expect(getStaticAiFaqCount()).toBeLessThanOrEqual(100);
  });

  it("returns the default Home suggestions", () => {
    expect(getStaticAiSuggestions()).toEqual([
      expect.objectContaining({ id: "flat6" }),
      expect.objectContaining({ id: "bestEv" }),
      expect.objectContaining({ id: "awdVs4wd" }),
    ]);
  });

  it("matches a question by automotive keywords", () => {
    expect(findStaticAiAnswer("Is AWD better than 4WD?")).toEqual(
      expect.objectContaining({
        id: "awdVs4wd",
        answerKey: "aiAnswerAwdVs4wd",
      })
    );
  });

  it("normalizes accents and punctuation before matching", () => {
    expect(findStaticAiAnswer("Czy turbo zwiększa moc?")).toEqual(
      expect.objectContaining({
        id: "turbo",
        answerKey: "aiAnswerTurbo",
      })
    );
  });

  it("returns null when the query does not match the static FAQ", () => {
    expect(findStaticAiAnswer("Where should I park downtown?")).toBeNull();
  });

  it("returns null for empty input", () => {
    expect(findStaticAiAnswer("   ")).toBeNull();
  });
});
