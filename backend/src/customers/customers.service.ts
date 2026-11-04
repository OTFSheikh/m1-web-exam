import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CustomersRepository } from "./customers.repository";
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

@Injectable()
export class CustomersService {
  constructor(
    @Inject(CustomersRepository)
    private readonly repository: CustomersRepository,
  ) {}

  findAll(filter: FilterCustomersModel): Promise<GetCustomersModel> {
    return this.repository.findAll(filter);
  }

  async findById(id: string): Promise<CustomerModel> {
    const customer = await this.repository.findById(id);
    if (!customer) throw new NotFoundException("Customer not found");
    return customer;
  }

  async create(input: CreateCustomerModel): Promise<CustomerModel> {
    try {
      return await this.repository.create({
        ...input,
        email: input.email.trim().toLowerCase(),
      });
    } catch (error) {
      this.translateError(error);
    }
  }

  async update(id: string, input: UpdateCustomerModel): Promise<CustomerModel> {
    if (!Object.values(input).some((value) => value !== undefined))
      throw new BadRequestException("At least one field must be supplied");
    const update = { ...input };
    if (update.email !== undefined)
      update.email = update.email.trim().toLowerCase();
    try {
      return await this.repository.update(id, update);
    } catch (error) {
      this.translateError(error);
    }
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.delete(id)))
      throw new NotFoundException("Customer not found");
  }

  async findPurchases(id: string): Promise<PurchasedBikeSellModel[]> {
    await this.findById(id);
    return this.repository.findPurchases(id);
  }

  async createSale(
    id: string,
    input: CreateBikeSellModel,
  ): Promise<BikeSellModel> {
    if (!Number.isSafeInteger(input.quantity) || input.quantity < 1)
      throw new BadRequestException("quantity must be a positive integer");
    try {
      return await this.repository.createSale(id, input);
    } catch (error) {
      this.translateError(error);
    }
  }

  private translateError(error: unknown): never {
    if (error instanceof DuplicateEmailError)
      throw new ConflictException("Email already in use");
    if (error instanceof CustomerNotFoundError)
      throw new NotFoundException("Customer not found");
    if (error instanceof BikeNotFoundError)
      throw new NotFoundException("Bike not found");
    throw error;
  }
}
