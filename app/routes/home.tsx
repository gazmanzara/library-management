import axiosInstance from "~/lib/axiosInstance";
import type { Route } from "./+types/home";
import { Card, Col, Layout, Row, Skeleton, Table, theme } from "antd";

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

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const [overview, borrowedBooks, topBorrowers, topBooks] = await Promise.all([
    axiosInstance.get("/dashboard/overview"),
    axiosInstance.get("/borrowed-books?status=BORROWED"),
    axiosInstance.get("/dashboard/members/top-borrowers"),
    axiosInstance.get("/dashboard/members/top-borrowers"),
  ]);

  return {
    overview: overview.data,
    borrowedBooks: borrowedBooks.data,
    topBorrowers: topBorrowers.data,
    topBooks: topBooks.data,
  };
}

const { Content } = Layout;

export function HydrateFallback() {
  const {
    token: { colorBgContainer, paddingLG, borderRadiusLG },
  } = theme.useToken();

  return (
    <Content
      style={{
        backgroundColor: colorBgContainer,
        padding: paddingLG,
        borderRadius: borderRadiusLG,
      }}
    >
      <Skeleton.Node active />
    </Content>
  );
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    token: { colorBgContainer, paddingLG, borderRadiusLG },
  } = theme.useToken();

  console.log(loaderData);

  return (
    <Content
      style={{
        backgroundColor: colorBgContainer,
        padding: paddingLG,
        borderRadius: borderRadiusLG,
      }}
    >
      <Row gutter={16}>
        <Col span={16}>
          <Row gutter={16}>
            <Col span={6}>
              <Card></Card>
            </Col>
            <Col span={6}>
              <Card></Card>
            </Col>
            <Col span={6}>
              <Card></Card>
            </Col>
            <Col span={6}>
              <Card></Card>
            </Col>
          </Row>
        </Col>

        <Col span={8}>
          <Table />
        </Col>
      </Row>
    </Content>
  );
}
