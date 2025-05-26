import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import type { Route } from "./+types/home";
import { Flex, Layout, Menu, theme, Typography, type MenuProps } from "antd";

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

const { Sider, Content, Header } = Layout;

const items: MenuProps["items"] = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: "Dashboard",
  },
  {
    key: "config",
    icon: <SettingOutlined />,
    label: "Config",
    children: [
      {
        key: "author",
        label: "Author",
      },
      {
        key: "category",
        label: "Category",
      },
      {
        key: "book",
        label: "Book",
      },
      {
        key: "member",
        label: "Member",
      },
    ],
  },
];

export default function Home() {
  const {
    token: {
      colorBgContainer,
      borderRadiusLG,
      colorBorderSecondary,
      padding,
      paddingLG,
    },
  } = theme.useToken();

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
        <Sider width={272} breakpoint="lg">
          <Menu
            mode="inline"
            defaultSelectedKeys={["dashboard"]}
            defaultOpenKeys={["config"]}
            items={items}
            style={{ height: "100%", borderRight: 0 }}
          />
        </Sider>
        <Layout style={{ padding: padding }}>
          <Content
            style={{
              backgroundColor: colorBgContainer,
              padding: paddingLG,
              borderRadius: borderRadiusLG,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
