import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Min,
  ValidateIf,
} from "class-validator";

// Same rules as CreateBikeDto, but every field may be omitted.
// null is rejected because no bike column is nullable.
export class UpdateBikeDto {
  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  brand?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  model?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  category?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  frameMaterial?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsNumber()
  @IsPositive()
  frameSizeCm?: number;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsNumber()
  @IsPositive()
  wheelSizeInches?: number;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsInt()
  @Min(1)
  gearCount?: number;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsNumber()
  @IsPositive()
  weightKg?: number;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsBoolean()
  electric?: boolean;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsInt()
  @Min(0)
  priceCents?: number;
}
