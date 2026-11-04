import axios from "axios";
import { useState } from "react";
import type { BikeModel, UpdateBikeModel } from "../models/BikeModel";

export const useBikeDetailsProvider = (bikeId: string) => {
  const [bike, setBike] = useState<BikeModel | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const load = () => {
    setIsLoading(true);
    axios
      .get<BikeModel>(`http://localhost:3000/bikes/${bikeId}`)
      .then((result) => setBike(result.data))
      .catch(() => setBike(null))
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Returns the request so the caller can react to errors
  const updateBike = (input: UpdateBikeModel) =>
    axios
      .patch<BikeModel>(`http://localhost:3000/bikes/${bikeId}`, input)
      .then((result) => setBike(result.data));

  // Returns the request so the caller can react to errors (e.g. bike already sold)
  const deleteBike = () =>
    axios.delete(`http://localhost:3000/bikes/${bikeId}`).then(() => {});

  return { bike, load, isLoading, updateBike, deleteBike };
};
