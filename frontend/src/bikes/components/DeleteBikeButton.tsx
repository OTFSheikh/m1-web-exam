import { DeleteOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";
import { isAxiosError } from "axios";
import { useState } from "react";
import type { BikeModel } from "../models/BikeModel";

interface DeleteBikeButtonProps {
  bike: BikeModel;
  deleteBike: (id: string) => Promise<void>;
  // Called after a successful deletion (e.g. to leave the details page)
  onDeleted?: () => void;
}

export const DeleteBikeButton = ({
  bike,
  deleteBike,
  onDeleted,
}: DeleteBikeButtonProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onCancel = () => {
    setError(null);
    setIsOpen(false);
  };

  const onConfirm = () => {
    setIsDeleting(true);
    deleteBike(bike.id)
      .then(() => {
        setIsOpen(false);
        onDeleted?.();
      })
      .catch((err) => {
        // 409: the bike is linked to a sale and must be kept for the sales history
        if (isAxiosError(err) && err.response?.status === 409)
          setError("This bike has already been sold, it cannot be deleted.");
        else setError("The bike could not be deleted.");
      })
      .finally(() => setIsDeleting(false));
  };

  return (
    <>
      <Button danger onClick={() => setIsOpen(true)}>
        <DeleteOutlined />
      </Button>
      <Modal
        okButtonProps={{ danger: true, disabled: error !== null }}
        open={isOpen}
        title={`Deleting ${bike.brand} ${bike.model}`}
        onCancel={onCancel}
        onOk={onConfirm}
        confirmLoading={isDeleting}
        okText="Yes, delete"
      >
        You are about to delete the bike {bike.brand} {bike.model}. This action
        cannot be undone, are you sure ?
        {error && (
          <div>
            <Typography.Text type="danger">{error}</Typography.Text>
          </div>
        )}
      </Modal>
    </>
  );
};
