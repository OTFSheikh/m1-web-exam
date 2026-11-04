import { PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useState } from "react";
import type { CreateBikeModel } from "../models/BikeModel";
import { BikeFormModal } from "./BikeFormModal";

interface AddBikeButtonProps {
  createBike: (input: CreateBikeModel) => Promise<void>;
}

export const AddBikeButton = ({ createBike }: AddBikeButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setIsOpen(true)}
      >
        Add bike
      </Button>
      {isOpen && (
        <BikeFormModal
          open
          title="New bike"
          okText="Add bike"
          onSubmit={createBike}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
