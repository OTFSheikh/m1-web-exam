export interface CustomerModel {
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
}

export interface CreateCustomerModel {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  birthDate?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
}

export type UpdateCustomerModel = Partial<CreateCustomerModel>;

export interface FilterCustomersModel {
  page: number;
  limit: number;
}

export interface GetCustomersModel {
  totalCount: number;
  customers: CustomerModel[];
}
