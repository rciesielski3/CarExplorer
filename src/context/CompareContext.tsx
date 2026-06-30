import React, { ReactNode } from "react";
import { CarSpecification } from "../types/CarSpecification";

export type CompareCar = {
  make: string;
  model: string;
  year?: string | null;
  vehicleType?: string | null;
  specifications?: CarSpecification;
};

interface CompareContextProps {
  compareList: CompareCar[];
  addToCompare: (car: CompareCar) => void;
  removeFromCompare: (car: CompareCar) => void;
  resetCompare: () => void;
  isInCompare: (car: CompareCar) => boolean;
}

const CompareContext = React.createContext<CompareContextProps | undefined>(
  undefined
);

const getCompareKey = (car: CompareCar) =>
  [car.make, car.model]
    .map((value) => value.trim().toLowerCase())
    .join("|");

export const CompareProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [compareList, setCompareList] = React.useState<CompareCar[]>([]);

  const addToCompare = React.useCallback((car: CompareCar) => {
    setCompareList((currentList) => {
      const carKey = getCompareKey(car);
      if (currentList.some((item) => getCompareKey(item) === carKey)) {
        return currentList;
      }

      if (currentList.length < 2) {
        return [...currentList, car];
      }

      return [currentList[0], car];
    });
  }, []);

  const removeFromCompare = React.useCallback((car: CompareCar) => {
    const carKey = getCompareKey(car);
    setCompareList((currentList) =>
      currentList.filter((item) => getCompareKey(item) !== carKey)
    );
  }, []);

  const resetCompare = React.useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = React.useCallback(
    (car: CompareCar) => {
      const carKey = getCompareKey(car);
      return compareList.some((item) => getCompareKey(item) === carKey);
    },
    [compareList]
  );

  const value = React.useMemo(
    () => ({
      compareList,
      addToCompare,
      removeFromCompare,
      resetCompare,
      isInCompare,
    }),
    [addToCompare, compareList, isInCompare, removeFromCompare, resetCompare]
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = React.useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
};
