import React from "react";
import TestRenderer, { act } from "react-test-renderer";

import { CompareProvider, useCompare } from "../CompareContext";

describe("CompareContext", () => {
  it("keeps at most two cars and replaces the second slot", () => {
    let compare!: ReturnType<typeof useCompare>;

    const Probe = () => {
      compare = useCompare();
      return null;
    };

    act(() => {
      TestRenderer.create(
        <CompareProvider>
          <Probe />
        </CompareProvider>
      );
    });

    act(() => {
      compare.addToCompare({ make: "BMW", model: "M3" });
      compare.addToCompare({ make: "Porsche", model: "911" });
      compare.addToCompare({ make: "Toyota", model: "Supra" });
    });

    expect(compare!.compareList).toEqual([
      { make: "BMW", model: "M3" },
      { make: "Toyota", model: "Supra" },
    ]);
  });
});
