import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { CustomersRepository } from "./customers.repository";
import { CustomersService } from "./customers.service";
import type { CustomerModel } from "./models/customer.model";
import {
  BikeNotFoundError,
  CustomerNotFoundError,
  DuplicateEmailError,
} from "./models/persistence-error.model";

const customer: CustomerModel = {
  id: "customer-id",
  firstName: "Alice",
  lastName: "Martin",
  email: "alice@example.com",
  phone: null,
  birthDate: null,
  address: null,
  postalCode: null,
  city: null,
  country: null,
};

function setup() {
  const repository = {
    findAll: vi.fn<CustomersRepository["findAll"]>(),
    findById: vi.fn<CustomersRepository["findById"]>(),
    create: vi.fn<CustomersRepository["create"]>(),
    update: vi.fn<CustomersRepository["update"]>(),
    delete: vi.fn<CustomersRepository["delete"]>(),
    findPurchases: vi.fn<CustomersRepository["findPurchases"]>(),
    createSale: vi.fn<CustomersRepository["createSale"]>(),
  };
  // The double implements every public repository operation, without ORM state.
  const service = new CustomersService(
    repository as unknown as CustomersRepository,
  );
  return { repository, service };
}

describe("CustomersService", () => {
  it("returns models and normalizes email before persistence", async () => {
    const { repository, service } = setup();
    repository.create.mockResolvedValue(customer);
    expect(
      await service.create({
        firstName: "Alice",
        lastName: "Martin",
        email: " ALICE@EXAMPLE.COM ",
      }),
    ).toEqual(customer);
    expect(repository.create).toHaveBeenCalledWith({
      firstName: "Alice",
      lastName: "Martin",
      email: "alice@example.com",
    });
    repository.findAll.mockResolvedValue({
      totalCount: 1,
      customers: [customer],
    });
    expect(await service.findAll({ page: 1, limit: 10 })).toEqual({
      totalCount: 1,
      customers: [customer],
    });
    expect(repository.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it("returns 404 for a missing customer and does not query purchases", async () => {
    const { repository, service } = setup();
    repository.findById.mockResolvedValue(null);
    await expect(service.findById(customer.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.findPurchases(customer.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(repository.findPurchases).not.toHaveBeenCalled();
    repository.delete.mockResolvedValue(false);
    await expect(service.delete(customer.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it("translates email conflicts on creation and update", async () => {
    const { repository, service } = setup();
    repository.create.mockRejectedValue(new DuplicateEmailError());
    repository.update.mockRejectedValue(new DuplicateEmailError());
    await expect(service.create(customer)).rejects.toBeInstanceOf(
      ConflictException,
    );
    await expect(
      service.update(customer.id, { email: customer.email }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("rejects empty patches, preserves null and normalizes updated email", async () => {
    const { repository, service } = setup();
    await expect(service.update(customer.id, {})).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.update(customer.id, { phone: undefined }),
    ).rejects.toBeInstanceOf(BadRequestException);
    repository.update.mockResolvedValue(customer);
    await service.update(customer.id, {
      phone: null,
      email: " ALICE@EXAMPLE.COM ",
    });
    expect(repository.update).toHaveBeenCalledWith(customer.id, {
      phone: null,
      email: customer.email,
    });
  });

  it("passes sale models through and translates missing references", async () => {
    const { repository, service } = setup();
    const input = { bikeId: "bike-id", quantity: 2 };
    const sale = {
      id: "sale-id",
      customerId: customer.id,
      ...input,
      soldAt: new Date(),
      unitPriceCents: 49900,
    };
    repository.createSale.mockResolvedValue(sale);
    expect(await service.createSale(customer.id, input)).toEqual(sale);
    expect(repository.createSale).toHaveBeenCalledWith(customer.id, input);
    for (const error of [
      new BikeNotFoundError(),
      new CustomerNotFoundError(),
    ]) {
      repository.createSale.mockRejectedValue(error);
      await expect(
        service.createSale(customer.id, input),
      ).rejects.toBeInstanceOf(NotFoundException);
    }
    repository.update.mockRejectedValue(new CustomerNotFoundError());
    await expect(
      service.update(customer.id, { city: "Paris" }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it.each([0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    "rejects invalid sale quantity %s",
    async (quantity) => {
      const { repository, service } = setup();
      await expect(
        service.createSale(customer.id, { bikeId: "bike-id", quantity }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(repository.createSale).not.toHaveBeenCalled();
    },
  );
});
