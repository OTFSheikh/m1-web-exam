import { ContactsOutlined, HomeOutlined, TagOutlined } from "@ant-design/icons";
import { Link, useLocation } from "@tanstack/react-router";
import type { MenuProps } from "antd";
import { Menu } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

// Plain paths, not `Route.to`: that value is only set once the router is built,
// after this file is loaded. TanStack still type-checks these paths.
const items: MenuItem[] = [
  {
    label: <Link to="/">Home</Link>,
    key: "home",
    icon: <HomeOutlined />,
  },
  {
    label: <Link to="/customers">Customers</Link>,
    key: "customers",
    icon: <ContactsOutlined />,
  },
  {
    label: <Link to="/bikes">Bikes</Link>,
    key: "bikes",
    icon: <TagOutlined />,
  },
];

// The first URL segment tells which section we are in: "/customers/123" → "customers"
const getSelectedKey = (pathname: string) => pathname.split("/")[1] || "home";

export function AppMenu() {
  const { pathname } = useLocation();

  return (
    <Menu
      selectedKeys={[getSelectedKey(pathname)]}
      mode="horizontal"
      items={items}
      style={{ backgroundColor: "transparent" }}
    />
  );
}
