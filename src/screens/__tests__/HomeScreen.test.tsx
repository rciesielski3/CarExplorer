import React from "react";
import { readFileSync } from "fs";
import { join } from "path";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

// Simple test that verifies HomeScreen code uses i18n
describe("HomeScreen i18n Audit", () => {
  it("hero section uses t() function for Drive text", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that the hero Drive text uses t() with heroTitleDrive key
    expect(content).toContain('t("heroTitleDrive", "Drive")');
  });

  it("hero section uses t() function for Curiosity text", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that the hero Curiosity text uses t() with heroTitleCuriosity key
    expect(content).toContain('t("heroTitleCuriosity", "Curiosity")');
  });

  it("hero eyebrow uses t() function", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that the hero eyebrow text uses t() with heroEyebrow key
    expect(content).toContain('t("heroEyebrow", "Your automotive companion")');
  });

  it("hero subtitle uses t() function", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that the hero subtitle text uses t() with proper key
    expect(content).toContain('t(\n                "heroSubtitle",');
  });

  it("AI section Ask AI label uses t() function", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that the AI Ask AI label uses t() with askAi key
    expect(content).toContain('t("askAi", "Ask AI")');
  });

  it("AI input placeholder uses t() function", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that the AI input placeholder uses t() with aiPlaceholder key
    expect(content).toContain('t(\n              "aiPlaceholder",\n              "Ask anything about cars...",\n            )');
  });

  it("AI answer rendering uses t() with fallback", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that AI answers use t() with proper key and fallback
    expect(content).toContain(
      "t(aiMatch.answerKey, aiMatch.fallbackAnswer)"
    );
  });

  it("AI suggestion chips use t() with proper fallback", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that AI suggestion chips use t() with questionKey and fallback
    expect(content).toContain(
      "t(chip.questionKey, chip.fallbackQuestion)"
    );
  });

  it("translation files contain hero section strings", () => {
    const enTranslationPath = join(
      __dirname,
      "../../../locales/en.json"
    );
    const enTranslation = JSON.parse(
      readFileSync(enTranslationPath, "utf-8")
    );

    expect(enTranslation.heroTitleDrive).toBe("Drive");
    expect(enTranslation.heroTitleCuriosity).toBe("Curiosity");
    expect(enTranslation.heroEyebrow).toBe("Your automotive companion");
    expect(enTranslation.heroSubtitle).toContain("Browse makes");
  });

  it("translation files contain AI section strings", () => {
    const enTranslationPath = join(
      __dirname,
      "../../../locales/en.json"
    );
    const enTranslation = JSON.parse(
      readFileSync(enTranslationPath, "utf-8")
    );

    expect(enTranslation.askAi).toBe("Ask AI");
    expect(enTranslation.aiPlaceholder).toContain("Ask anything about cars");
    expect(enTranslation.aiNoMatch).toBeDefined();
  });

  it("German translation file contains hero section strings", () => {
    const deTranslationPath = join(
      __dirname,
      "../../../locales/de.json"
    );
    const deTranslation = JSON.parse(
      readFileSync(deTranslationPath, "utf-8")
    );

    expect(deTranslation.heroTitleDrive).toBeDefined();
    expect(deTranslation.heroTitleCuriosity).toBeDefined();
    expect(deTranslation.heroEyebrow).toBeDefined();
  });

  it("Polish translation file contains hero section strings", () => {
    const plTranslationPath = join(
      __dirname,
      "../../../locales/pl.json"
    );
    const plTranslation = JSON.parse(
      readFileSync(plTranslationPath, "utf-8")
    );

    expect(plTranslation.heroTitleDrive).toBeDefined();
    expect(plTranslation.heroTitleCuriosity).toBeDefined();
    expect(plTranslation.heroEyebrow).toBeDefined();
  });

  it("French translation file contains hero section strings", () => {
    const frTranslationPath = join(
      __dirname,
      "../../../locales/fr.json"
    );
    const frTranslation = JSON.parse(
      readFileSync(frTranslationPath, "utf-8")
    );

    expect(frTranslation.heroTitleDrive).toBeDefined();
    expect(frTranslation.heroTitleCuriosity).toBeDefined();
    expect(frTranslation.heroEyebrow).toBeDefined();
  });

  it("staticAiAssistant.ts uses i18n keys with fallbacks", () => {
    const aiAssistantPath = join(
      __dirname,
      "../../services/staticAiAssistant.ts"
    );
    const content = readFileSync(aiAssistantPath, "utf-8");

    // Verify that FAQ entries use questionKey and answerKey
    expect(content).toContain("questionKey:");
    expect(content).toContain("answerKey:");
    expect(content).toContain("fallbackQuestion:");
    expect(content).toContain("fallbackAnswer:");
  });

  it("aiThinking string exists in all translation files", () => {
    const locales = ["en", "de", "pl", "fr"];

    locales.forEach((locale) => {
      const translationPath = join(
        __dirname,
        `../../../locales/${locale}.json`
      );
      const translation = JSON.parse(
        readFileSync(translationPath, "utf-8")
      );

      expect(translation.aiThinking).toBeDefined();
      expect(typeof translation.aiThinking).toBe("string");
    });
  });

  it("HomeScreen uses aiLoading state for AI loading behavior", () => {
    const homeScreenPath = join(
      __dirname,
      "..",
      "HomeScreen.tsx"
    );
    const content = readFileSync(homeScreenPath, "utf-8");

    // Verify that aiLoading state is declared
    expect(content).toContain('const [aiLoading, setAiLoading]');

    // Verify that aiLoading is used in the answer card rendering
    expect(content).toContain('{aiLoading ?');
    expect(content).toContain('t("aiThinking"');
  });
});
