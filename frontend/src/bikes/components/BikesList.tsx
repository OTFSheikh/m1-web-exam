import { Pagination, Skeleton, Space } from "antd";
import { useEffect } from "react";
import {
  BIKES_PAGE_SIZE,
  useBikesProvider,
} from "../providers/useBikesProvider";
import { AddBikeButton } from "./AddBikeButton";
import { BikeListItem } from "./BikeListItem";

export const BikesList = () => {
  const {
    bikes,
    totalCount,
    page,
    setPage,
    deleteBike,
    createBike,
    isLoading,
    load,
  } = useBikesProvider();

  useEffect(() => {
    load();
  }, [page]);

  return (
    <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
      <AddBikeButton createBike={createBike} />
      {isLoading ? (
        <Skeleton />
      ) : (
        bikes.map((bike) => (
          <BikeListItem key={bike.id} bike={bike} deleteBike={deleteBike} />
        ))
      )}
      <Pagination
        current={page}
        pageSize={BIKES_PAGE_SIZE}
        total={totalCount}
        showSizeChanger={false}
        showTotal={(total) => `${total} bikes`}
        onChange={(newPage) => setPage(newPage)}
      />
    </Space>
  );
};
