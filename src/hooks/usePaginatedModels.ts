import React, { useState, useCallback, useEffect, useMemo } from "react";

interface CarModel {
  id: number;
  name: string;
}

interface UsePaginatedModelsOptions {
  batchSize?: number;
}

interface UsePaginatedModelsResult {
  displayedModels: CarModel[];
  totalCount: number;
  loadedCount: number;
  hasMore: boolean;
  handleLoadMore: () => void;
  isPreloading: boolean;
}

export const usePaginatedModels = (
  allModels: CarModel[],
  options: UsePaginatedModelsOptions = {}
): UsePaginatedModelsResult => {
  const { batchSize = 25 } = options;
  const [displayedCount, setDisplayedCount] = useState(batchSize);
  const [isPreloading, setIsPreloading] = useState(false);

  // Slice models to currently displayed count
  const displayedModels = useMemo(
    () => allModels.slice(0, displayedCount),
    [allModels, displayedCount]
  );

  // Determine if more models exist
  const hasMore = useMemo(
    () => displayedCount < allModels.length,
    [displayedCount, allModels.length]
  );

  // Load more handler
  const handleLoadMore = useCallback(() => {
    setDisplayedCount((prev) => Math.min(prev + batchSize, allModels.length));
  }, [batchSize, allModels.length]);

  // Reset pagination whenever the underlying model list changes (new make/filter selection)
  useEffect(() => {
    setDisplayedCount(batchSize);
  }, [allModels, batchSize]);

  return {
    displayedModels,
    totalCount: allModels.length,
    loadedCount: displayedCount,
    hasMore,
    handleLoadMore,
    isPreloading,
  };
};
