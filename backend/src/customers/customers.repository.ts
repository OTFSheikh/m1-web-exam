import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource, QueryFailedError } from "typeorm";
import { BikeEntity } from "../bikes/entities/bike.entity";
import { BikeSellEntity } from "./entities/bike-sell.entity";
import { CustomerEntity } from "./entities/customer.entity";
import type {
  BikeSellModel,
  CreateBikeSellModel,
  PurchasedBikeSellModel,
} from "./models/bike-sell.model";
import type {
  CreateCustomerModel,
  CustomerModel,
  FilterCustomersModel,
  GetCustomersModel,
  UpdateCustomerModel,
} from "./models/customer.model";
import {
  BikeNotFoundError,
  CustomerNotFoundError,
  DuplicateEmailError,
} from "./models/persistence-error.model";
import type { PurchasedBikeModel } from "./models/purchased-bike.model";

@Injectable()
export class CustomersRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async findAll(filter: FilterCustomersModel): Promise<GetCustomersModel> {
    const [entities, totalCount] = await this.dataSource
      .getRepository(CustomerEntity)
      .findAndCount({
        order: { lastName: "ASC", firstName: "ASC", id: "ASC" },
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
      });
    return {
      totalCount,
      customers: entities.map((entity) => this.toCustomerModel(entity)),
    };
  }

  async findById(id: string): Promise<CustomerModel | null> {
    const entity = await this.dataSource
      .getRepository(CustomerEntity)
      .findOneBy({ id });
    return entity ? this.toCustomerModel(entity) : null;
  }

  async create(input: CreateCustomerModel): Promise<CustomerModel> {
    const repository = this.dataSource.getRepository(CustomerEntity);
    try {
      return this.toCustomerModel(
        await repository.save(repository.create(input)),
      );
    } catch (error) {
      this.translateError(error);
    }
  }

  async update(id: string, input: UpdateCustomerModel): Promise<CustomerModel> {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const repository = manager.getRepository(CustomerEntity);
        const entity = await repository.findOneBy({ id });
        if (!entity) throw new CustomerNotFoundError();
        repository.merge(entity, input);
        return this.toCustomerModel(await repository.save(entity));
      });
    } catch (error) {
      this.translateError(error);
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.dataSource
      .getRepository(CustomerEntity)
      .delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findPurchases(customerId: string): Promise<PurchasedBikeSellModel[]> {
    const entities = await this.dataSource.getRepository(BikeSellEntity).find({
      where: { customerId },
      relations: { bike: true },
      order: { soldAt: "ASC", id: "ASC" },
    });
    return entities.map((entity) => ({
      ...this.toSaleModel(entity),
      bike: this.toBikeModel(entity.bike),
    }));
  }

  async createSale(
    customerId: string,
    input: CreateBikeSellModel,
  ): Promise<BikeSellModel> {
    // Read the current catalogue price and persist its snapshot in one transaction.
    return this.dataSource.transaction(async (manager) => {
      if (
        !(await manager
          .getRepository(CustomerEntity)
          .existsBy({ id: customerId }))
      )
        throw new CustomerNotFoundError();
      const bike = await manager
        .getRepository(BikeEntity)
        .findOneBy({ id: input.bikeId });
      if (!bike) throw new BikeNotFoundError();
      const repository = manager.getRepository(BikeSellEntity);
      const sale = repository.create({
        customerId,
        bikeId: input.bikeId,
        quantity: input.quantity,
        soldAt: new Date(),
        unitPriceCents: bike.priceCents,
      });
      return this.toSaleModel(await repository.save(sale));
    });
  }

  private translateError(error: unknown): never {
    if (
      error instanceof QueryFailedError &&
      error.message.includes("UNIQUE constraint failed: customers.email")
    ) {
      throw new DuplicateEmailError();
    }
    throw error;
  }

  private toCustomerModel(entity: CustomerEntity): CustomerModel {
    return {
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      phone: entity.phone ?? null,
      birthDate: entity.birthDate ?? null,
      address: entity.address ?? null,
      postalCode: entity.postalCode ?? null,
      city: entity.city ?? null,
      country: entity.country ?? null,
    };
  }

  private toSaleModel(entity: BikeSellEntity): BikeSellModel {
    return {
      id: entity.id,
      customerId: entity.customerId,
      bikeId: entity.bikeId,
      quantity: entity.quantity,
      soldAt: entity.soldAt,
      unitPriceCents: entity.unitPriceCents,
    };
  }

  private toBikeModel(entity: BikeEntity): PurchasedBikeModel {
    return {
      id: entity.id,
      brand: entity.brand,
      model: entity.model,
      description: entity.description,
      category: entity.category,
      frameMaterial: entity.frameMaterial,
      frameSizeCm: entity.frameSizeCm,
      wheelSizeInches: entity.wheelSizeInches,
      gearCount: entity.gearCount,
      weightKg: entity.weightKg,
      electric: entity.electric,
      priceCents: entity.priceCents,
    };
  }
}
