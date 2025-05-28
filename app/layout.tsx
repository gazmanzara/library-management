import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { Flex, Layout, Menu, theme, Typography, type MenuProps } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router";
import type { Route } from "./+types/layout";
import { useMemo } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Library Management System" },
    {
      name: "description",
      content:
        "Manage your library's books, members, and loans efficiently with our comprehensive library management system.",
    },
  ];
}

const { Sider, Header } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: "Dashboard",
  },
  {
    key: "config",
    icon: <SettingOutlined />,
    label: "Config",
    children: [
      {
        key: "/authors",
        label: "Author",
      },
      {
        key: "/categories",
        label: "Category",
      },
      {
        key: "/books",
        label: "Book",
      },
      {
        key: "/member",
        label: "Member",
      },
    ],
  },
];

export default function AppLayout() {
  const {
    token: { colorBgContainer, colorBorderSecondary, padding, paddingLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();

  const selectedKeys = useMemo(() => {
    return [location.pathname];
  }, [location.pathname]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    navigate(e.key);
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          backgroundColor: colorBgContainer,
          borderBottom: `1px solid ${colorBorderSecondary}`,
          padding: `0 ${paddingLG}px`,
        }}
      >
        <Flex align="center" style={{ height: "100%" }}>
          <Typography.Title style={{ margin: 0 }} level={5}>
            Library Management System
          </Typography.Title>
        </Flex>
      </Header>
      <Layout>
        <Sider
          width={272}
          breakpoint="lg"
          style={{ backgroundColor: colorBgContainer }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={["config"]}
            items={items}
            style={{
              height: "100%",
              borderRight: 0,
            }}
            onClick={handleMenuClick}
          />
        </Sider>
        <Layout style={{ padding: padding }}>
          <Outlet />
        </Layout>
      </Layout>
    </Layout>
  );
}
