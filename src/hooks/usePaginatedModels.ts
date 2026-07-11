import { useState, useMemo, useEffect } from "react";

interface CarModel {
  id: number;
  name: string;
}

interface UsePaginatedModelsReturn {
  displayedModels: CarModel[];
  totalCount: number;
  handleLoadMore: () => void;
  isPreloading: boolean;
  triggerPreload: () => void;
}

const BATCH_SIZE = 12;

export const usePaginatedModels = (
  allModels: CarModel[]
): UsePaginatedModelsReturn => {
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [isPreloading, setIsPreloading] = useState(false);

  useEffect(() => {
    if (allModels.length > 0) {
      setDisplayedCount(BATCH_SIZE);
      setIsPreloading(false);
    }
  }, [allModels]);

  const displayedModels = useMemo(
    () => allModels.slice(0, displayedCount),
    [allModels, displayedCount]
  );

  const handleLoadMore = () => {
    const nextCount = displayedCount + BATCH_SIZE;
    setDisplayedCount(Math.min(nextCount, allModels.length));
    setIsPreloading(false);
  };

  const triggerPreload = () => {
    if (displayedCount < allModels.length) {
      setIsPreloading(true);
    }
  };

  return {
    displayedModels,
    totalCount: allModels.length,
    handleLoadMore,
    isPreloading,
    triggerPreload,
  };
};
