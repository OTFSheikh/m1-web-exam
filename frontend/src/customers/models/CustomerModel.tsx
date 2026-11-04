export type CustomerModel = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  country: string | null;
};

// Only the fields sent are changed; null clears an optional field
export type UpdateCustomerModel = Partial<Omit<CustomerModel, "id">>;

export type CreateCustomerModel = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

// Paginated response of GET /customers
export type GetCustomersModel = {
  totalCount: number;
  customers: CustomerModel[];
};
