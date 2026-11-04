import type { BikeModel, GetBikesModel } from "../models/bike.model";

export class BikeResponseDto {
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

  static fromModel(model: BikeModel): BikeResponseDto {
    return Object.assign(new BikeResponseDto(), model);
  }
}

export class GetBikesResponseDto {
  totalCount: number;
  bikes: BikeResponseDto[];

  static fromModel(model: GetBikesModel): GetBikesResponseDto {
    return Object.assign(new GetBikesResponseDto(), {
      totalCount: model.totalCount,
      bikes: model.bikes.map((bike) => BikeResponseDto.fromModel(bike)),
    });
  }
}
