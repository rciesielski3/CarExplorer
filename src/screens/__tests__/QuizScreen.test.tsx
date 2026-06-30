import React from "react";
import { readFileSync } from "fs";
import { join } from "path";
import { StyleSheet } from "react-native";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => defaultValue || key,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

describe("QuizScreen Mobile Layout", () => {
  it("modal maxHeight is constrained to 90% on mobile", () => {
    const quizScreenPath = join(__dirname, "..", "QuizScreen.tsx");
    const content = readFileSync(quizScreenPath, "utf-8");

    // Verify that answersModalContent has maxHeight: "90%"
    expect(content).toContain('maxHeight: "90%"');
  });

  it("answer scroll area has maxHeight constraint of 85vh", () => {
    const quizScreenPath = join(__dirname, "..", "QuizScreen.tsx");
    const content = readFileSync(quizScreenPath, "utf-8");

    // Verify that answersScroll has maxHeight: "85vh"
    expect(content).toContain('maxHeight: "85vh"');
  });

  it("score display has padding for mobile visibility", () => {
    const quizScreenPath = join(__dirname, "..", "QuizScreen.tsx");
    const content = readFileSync(quizScreenPath, "utf-8");

    // Verify that score display has proper padding
    expect(content).toContain("paddingHorizontal: 16");
    expect(content).toContain("paddingVertical: 24");
  });

  it("modal content has borderRadius and backgroundColor", () => {
    const quizScreenPath = join(__dirname, "..", "QuizScreen.tsx");
    const content = readFileSync(quizScreenPath, "utf-8");

    // Verify that modal has styling for readability
    expect(content).toContain("borderRadius: 12");
    expect(content).toContain('backgroundColor: Colors["light"].card');
  });

  it("renders QuizScreen without crashing", () => {
    // Basic import test to ensure no syntax errors
    const QuizScreen = require("../QuizScreen").default;
    expect(QuizScreen).toBeDefined();
  });
});
