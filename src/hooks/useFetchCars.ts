import { useState, useEffect } from "react";

import { fetchCarMakes } from "../services/nhtsaService";

export const useFetchCars = () => {
  const [cars, setCars] = useState<{ make: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const carData = await fetchCarMakes();
        setCars(carData);
      } catch {
        setError("⚠️ Failed to fetch car data");
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  return { cars, loading, error };
};
