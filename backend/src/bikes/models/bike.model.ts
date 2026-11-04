export interface BikeModel {
  id: string;
  brand: string;
  model: string;
  description: string;
  category: string;
  frameMaterial: string;
  frameSizeCm: number;
  wheelSizeInches: number;
  gearCount: number;
  weightKg: number;
  electric: boolean;
  priceCents: number;
}

export type CreateBikeModel = Omit<BikeModel, "id">;

export type UpdateBikeModel = Partial<CreateBikeModel>;

export interface FilterBikesModel {
  page: number;
  limit: number;
}

export interface GetBikesModel {
  totalCount: number;
  bikes: BikeModel[];
}
