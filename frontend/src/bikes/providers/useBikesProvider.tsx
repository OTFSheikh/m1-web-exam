import axios from "axios";
import { useState } from "react";
import type {
  BikeModel,
  CreateBikeModel,
  GetBikesModel,
} from "../models/BikeModel";

export const BIKES_PAGE_SIZE = 10;

export const useBikesProvider = () => {
  const [bikes, setBikes] = useState<BikeModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = () => {
    setIsLoading(true);
    axios
      .get<GetBikesModel>("http://localhost:3000/bikes", {
        params: { page, limit: BIKES_PAGE_SIZE },
      })
      .then((result) => {
        setBikes(result.data.bikes);
        setTotalCount(result.data.totalCount);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Returns the request so the caller can react to errors (e.g. bike already sold)
  const deleteBike = (id: string) =>
    axios.delete(`http://localhost:3000/bikes/${id}`).then(() => {
      // If the last bike of the page is deleted, go back one page
      if (bikes.length === 1 && page > 1) setPage(page - 1);
      else load();
    });

  const createBike = (input: CreateBikeModel) =>
    axios.post<BikeModel>("http://localhost:3000/bikes", input).then(() => {
      // Reload the current page so the list and the total stay in sync with the backend
      load();
    });

  return {
    bikes,
    totalCount,
    page,
    setPage,
    load,
    isLoading,
    deleteBike,
    createBike,
  };
};
