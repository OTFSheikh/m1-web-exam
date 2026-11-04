import axios from "axios";
import { useState } from "react";
import type {
  CreateCustomerModel,
  CustomerModel,
  GetCustomersModel,
} from "../models/CustomerModel";

export const CUSTOMERS_PAGE_SIZE = 10;

export const useCustomersProvider = () => {
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const load = () => {
    setIsLoading(true);
    axios
      .get<GetCustomersModel>("http://localhost:3000/customers", {
        params: { page, limit: CUSTOMERS_PAGE_SIZE },
      })
      .then((result) => {
        setCustomers(result.data.customers);
        setTotalCount(result.data.totalCount);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const deleteCustomer = (id: string) => {
    axios.delete(`http://localhost:3000/customers/${id}`).then(() => {
      // If the last customer of the page is deleted, go back one page
      if (customers.length === 1 && page > 1) setPage(page - 1);
      else load();
    });
  };

  // Returns the request so the caller can react to errors (e.g. email already in use)
  const createCustomer = (input: CreateCustomerModel) =>
    axios
      .post<CustomerModel>("http://localhost:3000/customers", input)
      .then(() => {
        // Reload the current page so the list and the total stay in sync with the backend
        load();
      });

  return {
    customers,
    totalCount,
    page,
    setPage,
    load,
    isLoading,
    deleteCustomer,
    createCustomer,
  };
};
