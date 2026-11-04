import {
  ArrowLeftOutlined,
  EditOutlined,
  TagOutlined,
} from "@ant-design/icons";
import type { DescriptionsProps } from "antd";
import { Button, Card, Descriptions, Skeleton, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { ButtonLink } from "../../shared/components/ButtonLink";
import { useBikeDetailsProvider } from "../providers/useBikeDetailsProvider";
import { BikeFormModal } from "./BikeFormModal";
import { DeleteBikeButton } from "./DeleteBikeButton";

interface BikeDetailsProps {
  bikeId: string;
}

const formatPrice = (cents: number) =>
  (cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
  });

export const BikeDetails = ({ bikeId }: BikeDetailsProps) => {
  const { bike, isLoading, load, updateBike, deleteBike } =
    useBikeDetailsProvider(bikeId);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, [bikeId]);

  const value = (content: ReactNode) =>
    isLoading ? <Skeleton.Input active size="small" /> : (content ?? "—");

  const items: DescriptionsProps["items"] = [
    { key: "brand", label: "Brand", children: value(bike?.brand) },
    { key: "model", label: "Model", children: value(bike?.model) },
    {
      key: "description",
      label: "Description",
      children: value(bike?.description),
    },
    { key: "category", label: "Category", children: value(bike?.category) },
    {
      key: "frameMaterial",
      label: "Frame material",
      children: value(bike?.frameMaterial),
    },
    {
      key: "frameSizeCm",
      label: "Frame size",
      children: value(bike && `${bike.frameSizeCm} cm`),
    },
    {
      key: "wheelSizeInches",
      label: "Wheel size",
      children: value(bike && `${bike.wheelSizeInches} in`),
    },
    { key: "gearCount", label: "Gears", children: value(bike?.gearCount) },
    {
      key: "weightKg",
      label: "Weight",
      children: value(bike && `${bike.weightKg} kg`),
    },
    {
      key: "electric",
      label: "Electric",
      children: value(bike && (bike.electric ? "Yes" : "No")),
    },
    {
      key: "price",
      label: "Price",
      children: value(bike && formatPrice(bike.priceCents)),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 16,
        padding: ".25rem .5rem",
      }}
    >
      <ButtonLink to="/bikes" icon={<ArrowLeftOutlined />}>
        Back to bikes
      </ButtonLink>

      <Space align="center">
        <TagOutlined style={{ fontSize: "1.5rem" }} />
        {isLoading ? (
          <Skeleton.Input active size="large" />
        ) : (
          <Title level={2} style={{ margin: 0 }}>
            {bike ? `${bike.brand} ${bike.model}` : "Bike not found"}
          </Title>
        )}
      </Space>

      <Card
        title="Bike information"
        style={{ alignSelf: "stretch" }}
        extra={
          bike && (
            <Space>
              <Button
                icon={<EditOutlined />}
                aria-label="Edit bike"
                onClick={() => setIsEditing(true)}
              />
              <DeleteBikeButton
                bike={bike}
                deleteBike={deleteBike}
                onDeleted={() => navigate({ to: "/bikes" })}
              />
            </Space>
          )
        }
      >
        <Descriptions column={1} items={items} />
      </Card>

      {isEditing && (
        <BikeFormModal
          open
          title="Edit bike"
          okText="Save"
          bike={bike}
          onSubmit={updateBike}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};
