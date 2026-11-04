import { Pagination, Skeleton, Space } from "antd";
import { useEffect } from "react";
import {
  CUSTOMERS_PAGE_SIZE,
  useCustomersProvider,
} from "../providers/useCustomersProvider";
import { AddCustomerButton } from "./AddCustomerButton";
import { CustomerListItem } from "./CustomerListItem";

export const CustomersList = () => {
  const {
    customers,
    totalCount,
    page,
    setPage,
    deleteCustomer,
    createCustomer,
    isLoading,
    load,
  } = useCustomersProvider();

  useEffect(() => {
    load();
  }, [page]);

  return (
    <Space orientation="vertical" style={{ padding: ".25rem .5rem" }}>
      <AddCustomerButton createCustomer={createCustomer} />
      {isLoading ? (
        <Skeleton />
      ) : (
        customers.map((customer) => (
          <CustomerListItem
            key={customer.id}
            customer={customer}
            deleteCustomer={deleteCustomer}
          />
        ))
      )}
      <Pagination
        current={page}
        pageSize={CUSTOMERS_PAGE_SIZE}
        total={totalCount}
        showSizeChanger={false}
        showTotal={(total) => `${total} customers`}
        onChange={(newPage) => setPage(newPage)}
      />
    </Space>
  );
};
