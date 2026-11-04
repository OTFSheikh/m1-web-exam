import { Col, Input, InputNumber, Modal, Row, Switch, Typography } from "antd";
import { useState } from "react";
import type { BikeModel, CreateBikeModel } from "../models/BikeModel";

interface BikeFormModalProps {
  open: boolean;
  title: string;
  okText: string;
  // Filled with the current bike when editing, empty when creating
  bike?: BikeModel | null;
  onSubmit: (input: CreateBikeModel) => Promise<void>;
  onClose: () => void;
}

type TextField =
  "brand" | "model" | "description" | "category" | "frameMaterial";

type NumberField =
  "frameSizeCm" | "wheelSizeInches" | "gearCount" | "weightKg" | "price";

// The price is typed in euros in the form and sent in cents to the API
type BikeFormValues = Record<TextField, string> &
  Record<NumberField, number | null> & { electric: boolean };

type BikeFormErrors = Partial<Record<TextField | NumberField, string>>;

const emptyValues: BikeFormValues = {
  brand: "",
  model: "",
  description: "",
  category: "",
  frameMaterial: "",
  frameSizeCm: null,
  wheelSizeInches: null,
  gearCount: null,
  weightKg: null,
  price: null,
  electric: false,
};

const toValues = (bike: BikeModel): BikeFormValues => ({
  brand: bike.brand,
  model: bike.model,
  description: bike.description,
  category: bike.category,
  frameMaterial: bike.frameMaterial,
  frameSizeCm: bike.frameSizeCm,
  wheelSizeInches: bike.wheelSizeInches,
  gearCount: bike.gearCount,
  weightKg: bike.weightKg,
  price: bike.priceCents / 100,
  electric: bike.electric,
});

// Same rules as the backend (BikeEntity constraints)
const validate = (values: BikeFormValues): BikeFormErrors => {
  const errors: BikeFormErrors = {};
  if (!values.brand.trim()) errors.brand = "Brand is required";
  if (!values.model.trim()) errors.model = "Model is required";
  if (!values.description.trim())
    errors.description = "Description is required";
  if (!values.category.trim()) errors.category = "Category is required";
  if (!values.frameMaterial.trim())
    errors.frameMaterial = "Frame material is required";
  if (values.frameSizeCm === null || values.frameSizeCm <= 0)
    errors.frameSizeCm = "Frame size must be greater than 0";
  if (values.wheelSizeInches === null || values.wheelSizeInches <= 0)
    errors.wheelSizeInches = "Wheel size must be greater than 0";
  if (
    values.gearCount === null ||
    !Number.isInteger(values.gearCount) ||
    values.gearCount < 1
  )
    errors.gearCount = "Gear count must be a whole number of at least 1";
  if (values.weightKg === null || values.weightKg <= 0)
    errors.weightKg = "Weight must be greater than 0";
  if (values.price === null || values.price < 0)
    errors.price = "Price must be 0 or more";
  return errors;
};

const toCreateBikeModel = (values: BikeFormValues): CreateBikeModel => ({
  brand: values.brand.trim(),
  model: values.model.trim(),
  description: values.description.trim(),
  category: values.category.trim(),
  frameMaterial: values.frameMaterial.trim(),
  // validate() guarantees the numbers are set
  frameSizeCm: values.frameSizeCm as number,
  wheelSizeInches: values.wheelSizeInches as number,
  gearCount: values.gearCount as number,
  weightKg: values.weightKg as number,
  electric: values.electric,
  priceCents: Math.round((values.price as number) * 100),
});

export const BikeFormModal = ({
  open,
  title,
  okText,
  bike,
  onSubmit,
  onClose,
}: BikeFormModalProps) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  // The parent only renders this modal while it is open, so the form
  // starts from the current bike (edit) or an empty form (create) each time
  const [values, setValues] = useState<BikeFormValues>(
    bike ? toValues(bike) : emptyValues,
  );
  const [errors, setErrors] = useState<BikeFormErrors>({});

  const onConfirm = () => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    onSubmit(toCreateBikeModel(values))
      .then(onClose)
      // On failure, keep the modal open so the changes are not lost
      .catch(() => {})
      .finally(() => setIsSaving(false));
  };

  const error = (name: TextField | NumberField) =>
    errors[name] && (
      <Typography.Text type="danger">{errors[name]}</Typography.Text>
    );

  const textField = (name: TextField, label: string) => (
    <>
      <label htmlFor={`bike-${name}`}>{label}</label>
      <Input
        id={`bike-${name}`}
        value={values[name]}
        status={errors[name] && "error"}
        onChange={(event) => {
          setValues({ ...values, [name]: event.target.value });
          setErrors({ ...errors, [name]: undefined });
        }}
      />
      {error(name)}
    </>
  );

  const numberField = (name: NumberField, label: string, step = 1) => (
    <>
      <label htmlFor={`bike-${name}`}>{label}</label>
      <InputNumber
        id={`bike-${name}`}
        style={{ width: "100%" }}
        step={step}
        value={values[name]}
        status={errors[name] && "error"}
        onChange={(value) => {
          setValues({ ...values, [name]: value });
          setErrors({ ...errors, [name]: undefined });
        }}
      />
      {error(name)}
    </>
  );

  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      onCancel={onClose}
      onOk={onConfirm}
      confirmLoading={isSaving}
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>{textField("brand", "Brand *")}</Col>
        <Col span={12}>{textField("model", "Model *")}</Col>
        <Col span={24}>{textField("description", "Description *")}</Col>
        <Col span={12}>{textField("category", "Category *")}</Col>
        <Col span={12}>{textField("frameMaterial", "Frame material *")}</Col>
        <Col span={8}>{numberField("frameSizeCm", "Frame size (cm) *")}</Col>
        <Col span={8}>
          {numberField("wheelSizeInches", "Wheel size (in) *", 0.5)}
        </Col>
        <Col span={8}>{numberField("gearCount", "Gears *")}</Col>
        <Col span={8}>{numberField("weightKg", "Weight (kg) *", 0.1)}</Col>
        <Col span={8}>{numberField("price", "Price (€) *", 0.01)}</Col>
        <Col span={8}>
          <label htmlFor="bike-electric">Electric</label>
          <div>
            <Switch
              id="bike-electric"
              checked={values.electric}
              onChange={(checked) =>
                setValues({ ...values, electric: checked })
              }
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );
};
