import type { Route } from "./+types/home";
import { Card, Col, Layout, Row, Table, theme } from "antd";

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

const { Content } = Layout;

export default function Home() {
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

          <Row>
            <Col span={24}>
              <Table />
            </Col>
          </Row>
        </Col>

        <Col span={8}></Col>
      </Row>
    </Content>
  );
}
