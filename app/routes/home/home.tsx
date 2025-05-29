import axiosInstance from "~/lib/axiosInstance";
import type { Route } from "./+types/home";
import {
  Button,
  Card,
  Col,
  Flex,
  Layout,
  Modal,
  Row,
  Skeleton,
  Table,
  Tag,
  theme,
  Typography,
  Form,
  Select,
  DatePicker,
  notification,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import React, { useMemo, useState, useCallback } from "react";
import dayjs from "dayjs";
import type {
  AvailableBook,
  AvailableMember,
  BorrowedBook,
  PopularBook,
  TopBorrower,
} from "~/types.ts";

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
    axiosInstance.get("/dashboard/books/popular"),
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
    token: {
      colorBgContainer,
      paddingLG,
      borderRadiusLG,
      colorPrimaryBg,
      colorErrorBg,
      colorWarningBg,
      colorSuccessBg,
    },
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
        <Col span={24}>
          <Row gutter={16} align="stretch">
            {/* Metric Cards */}
            {[
              { color: colorPrimaryBg, title: "Borrowed Books" },
              { color: colorErrorBg, title: "Overdue Members" },
              { color: colorWarningBg, title: "Active Borrowers" },
              { color: colorSuccessBg, title: "Available Books" },
            ].map((card, index) => (
              <Col span={6} style={{ display: "flex" }} key={index}>
                <Card
                  style={{
                    backgroundColor: card.color,
                    flex: 1,
                    height: "100%",
                  }}
                  title={card.title}
                >
                  <Skeleton.Input active block size="large" />
                  <br />
                  <br />
                  <Skeleton.Input active block size="small" />
                </Card>
              </Col>
            ))}
          </Row>
        </Col>
      </Row>

      {/* Borrowed Books Table */}
      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card
            title={
              <Flex justify="space-between" align="center">
                <Typography.Title level={4}>Borrowed Books</Typography.Title>
                <Skeleton.Button active />
              </Flex>
            }
          >
            <Skeleton active />
            <Skeleton active />
            <Skeleton active />
          </Card>
        </Col>
      </Row>

      {/* Popular Books */}
      <Row gutter={16} style={{ marginTop: 16, width: "100%" }}>
        <Card
          title={<Typography.Title level={4}>Popular Books</Typography.Title>}
          style={{ width: "100%" }}
        >
          <Row gutter={[16, 16]}>
            {[...Array(6)].map((_, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card size="small">
                  <Skeleton active paragraph={{ rows: 2 }} />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Row>

      {/* Top Borrowers */}
      <Row gutter={16} style={{ marginTop: 16, width: "100%" }}>
        <Col span={24}>
          <Card
            title={<Typography.Title level={4}>Top Borrowers</Typography.Title>}
            style={{ width: "100%" }}
          >
            <Row gutter={[16, 16]}>
              {[...Array(8)].map((_, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <Card size="small">
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </Content>
  );
}

const Context = React.createContext({ name: "Default" });

export default function Home({
  loaderData: initialLoaderData,
}: Route.ComponentProps) {
  const [loaderData, setLoaderData] = useState(initialLoaderData);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<AvailableBook[]>([]);
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>(
    []
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [returningBookId, setReturningBookId] = useState<number | null>(null);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [form] = Form.useForm();

  const {
    token: {
      colorBgContainer,
      colorError,
      colorSuccess,
      colorTextSecondary,
      marginXS,
      marginSM,
      borderRadiusLG,
      paddingLG,
      colorErrorBg,
      colorSuccessBg,
      colorWarningBg,
      colorPrimaryBg,
    },
  } = theme.useToken();

  const [api, contextHolder] = notification.useNotification();

  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [overview, borrowedBooks, topBorrowers, topBooks] =
        await Promise.all([
          axiosInstance.get("/dashboard/overview"),
          axiosInstance.get("/borrowed-books?status=BORROWED"),
          axiosInstance.get("/dashboard/members/top-borrowers"),
          axiosInstance.get("/dashboard/books/popular"),
        ]);

      setLoaderData({
        overview: overview.data,
        borrowedBooks: borrowedBooks.data,
        topBorrowers: topBorrowers.data,
        topBooks: topBooks.data,
      });
    } catch (error) {
      api.error({
        message: "Failed to refresh dashboard data",
        description: "Please try again later",
        placement: "bottomRight",
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [api]);

  const handleBorrowBook = async () => {
    try {
      setIsBorrowing(true);
      const [booksResponse, membersResponse] = await Promise.all([
        axiosInstance.get("/books/active"),
        axiosInstance.get("/members"),
      ]);
      setAvailableBooks(booksResponse.data);
      setAvailableMembers(membersResponse.data);
      form.setFieldsValue({
        dueDate: dayjs().add(14, "days"),
      });
      setIsBorrowModalOpen(true);
    } catch (error) {
      api.error({
        message: "Failed to fetch available books and members",
        description: "Please try again later",
        placement: "bottomRight",
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleModalOk = async () => {
    try {
      setIsBorrowing(true);
      const values = await form.validateFields();
      const dueDate = values.dueDate || dayjs().add(14, "days");
      const durationInDays = dueDate.diff(dayjs(), "day");

      await axiosInstance.post(
        `/borrowed-books/borrow?bookId=${values.bookId}&memberId=${values.memberId}&durationInDays=${durationInDays}`
      );

      api.success({
        message: "Book borrowed successfully",
        description: "The book has been borrowed successfully",
        placement: "bottomRight",
      });
      setIsBorrowModalOpen(false);
      form.resetFields();
      fetchDashboardData();
    } catch (error) {
      api.error({
        message: "Failed to borrow book",
        description: "Please try again later",
        placement: "bottomRight",
      });
    } finally {
      setIsBorrowing(false);
    }
  };

  const handleModalCancel = () => {
    setIsBorrowModalOpen(false);
    form.resetFields();
  };

  const handleReturnBook = async (borrowId: number) => {
    try {
      setReturningBookId(borrowId);
      await axiosInstance.post(`/borrowed-books/${borrowId}/return`);
      api.success({
        message: "Book returned successfully",
        description: "The book has been returned to the library",
        placement: "bottomRight",
      });
      fetchDashboardData();
    } catch (error) {
      api.error({
        message: "Failed to return book",
        description: "Please try again later",
        placement: "bottomRight",
      });
    } finally {
      setReturningBookId(null);
    }
  };

  return (
    <Context.Provider value={contextValue}>
      {contextHolder}
      <Content
        style={{
          backgroundColor: colorBgContainer,
          padding: paddingLG,
          borderRadius: borderRadiusLG,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Row gutter={16} align="stretch">
              <Col span={6} style={{ display: "flex" }}>
                <Card
                  style={{
                    backgroundColor: colorPrimaryBg,
                    flex: 1,
                    height: "100%",
                  }}
                  title="Borrowed Books"
                  styles={{
                    header: {
                      textAlign: "center",
                      fontSize: 16,
                      borderBottom: "none",
                      padding: `${marginSM}px ${paddingLG}px`,
                    },
                    body: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: paddingLG,
                    },
                  }}
                >
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, fontSize: 36 }}
                  >
                    {loaderData.overview.borrowedBooks}
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: colorTextSecondary, marginTop: marginSM }}
                  >
                    {Math.round(
                      (loaderData.overview.borrowedBooks /
                        loaderData.overview.totalBooks) *
                        100
                    )}
                    % of library in use
                  </Typography.Text>
                </Card>
              </Col>
              <Col span={6} style={{ display: "flex" }}>
                <Card
                  style={{
                    backgroundColor: colorErrorBg,
                    flex: 1,
                    height: "100%",
                  }}
                  title="Overdue Members"
                  styles={{
                    header: {
                      textAlign: "center",
                      fontSize: 16,
                      borderBottom: "none",
                      padding: `${marginSM}px ${paddingLG}px`,
                    },
                    body: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: paddingLG,
                    },
                  }}
                >
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, color: colorError, fontSize: 36 }}
                  >
                    {loaderData.overview.membersWithOverdue}
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: colorTextSecondary, marginTop: marginSM }}
                  >
                    {Math.round(
                      (loaderData.overview.membersWithOverdue /
                        loaderData.overview.activeMembers) *
                        100
                    )}
                    % of active borrowers overdue
                  </Typography.Text>
                </Card>
              </Col>
              <Col span={6} style={{ display: "flex" }}>
                <Card
                  style={{
                    backgroundColor: colorWarningBg,
                    flex: 1,
                    height: "100%",
                  }}
                  title="Active Borrowers"
                  styles={{
                    header: {
                      textAlign: "center",
                      fontSize: 16,
                      borderBottom: "none",
                      padding: `${marginSM}px ${paddingLG}px`,
                    },
                    body: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: paddingLG,
                    },
                  }}
                >
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, fontSize: 36 }}
                  >
                    {loaderData.overview.activeMembers}
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: colorTextSecondary, marginTop: marginSM }}
                  >
                    {Math.round(
                      (loaderData.overview.activeMembers /
                        loaderData.overview.totalMembers) *
                        100
                    )}
                    % member engagement
                  </Typography.Text>
                  {loaderData.overview.activeMembers <
                    loaderData.overview.totalMembers * 0.3 && (
                    <Typography.Text
                      type="warning"
                      style={{ display: "block", marginTop: marginXS }}
                    >
                      Low engagement - consider member outreach
                    </Typography.Text>
                  )}
                </Card>
              </Col>
              <Col span={6} style={{ display: "flex" }}>
                <Card
                  style={{
                    backgroundColor: colorSuccessBg,
                    flex: 1,
                    height: "100%",
                  }}
                  title="Available Books"
                  styles={{
                    header: {
                      textAlign: "center",
                      fontSize: 16,
                      borderBottom: "none",
                      padding: `${marginSM}px ${paddingLG}px`,
                    },
                    body: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: paddingLG,
                    },
                  }}
                >
                  <Typography.Title
                    level={2}
                    style={{ margin: 0, color: colorSuccess, fontSize: 36 }}
                  >
                    {loaderData.overview.availableBooks}
                  </Typography.Title>
                  <Typography.Text
                    style={{ color: colorTextSecondary, marginTop: marginSM }}
                  >
                    {Math.round(
                      (loaderData.overview.availableBooks /
                        loaderData.overview.totalBooks) *
                        100
                    )}
                    % of collection available
                  </Typography.Text>
                  {loaderData.overview.availableBooks <
                    loaderData.overview.totalBooks * 0.2 && (
                    <Typography.Text
                      type="warning"
                      style={{ display: "block", marginTop: marginXS }}
                    >
                      Low availability - consider acquiring more copies
                    </Typography.Text>
                  )}
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Table
              loading={isRefreshing}
              title={() => (
                <Flex justify="space-between" align="center">
                  <Typography.Title level={4}>Borrowed Books</Typography.Title>
                  <Button
                    icon={<PlusOutlined />}
                    type="primary"
                    onClick={handleBorrowBook}
                    loading={isBorrowing}
                  >
                    Borrow Book
                  </Button>
                </Flex>
              )}
              bordered
              dataSource={loaderData.borrowedBooks.sort(
                (a: BorrowedBook, b: BorrowedBook) => {
                  const aOverdue = new Date(a.dueDate) < new Date();
                  const bOverdue = new Date(b.dueDate) < new Date();
                  if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
                  return (
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime()
                  );
                }
              )}
              columns={[
                {
                  title: "Member",
                  dataIndex: ["member", "firstName"],
                  key: "name",
                  render: (_: unknown, record: BorrowedBook) =>
                    `${record.member.firstName} ${record.member.lastName}`,
                },
                {
                  title: "Book",
                  dataIndex: ["book", "title"],
                  key: "book",
                  render: (_: unknown, record: BorrowedBook) => (
                    <span>
                      {record.book.title} ({record.book.author.name})
                    </span>
                  ),
                },
                {
                  title: "Due Date",
                  dataIndex: "dueDate",
                  key: "dueDate",
                  render: (date: string) => {
                    const isOverdue = new Date(date) < new Date();
                    return (
                      <Tag color={isOverdue ? "red" : "green"}>
                        {new Date(date).toLocaleDateString()}
                      </Tag>
                    );
                  },
                },
                {
                  title: "",
                  dataIndex: "actions",
                  key: "actions",
                  render: (_: unknown, record: BorrowedBook) => (
                    <Button
                      type="link"
                      onClick={() => handleReturnBook(record.id)}
                      loading={returningBookId === record.id}
                    >
                      Return Book
                    </Button>
                  ),
                },
              ]}
              rowKey="id"
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16, width: "100%" }}>
          <Card
            title={<Typography.Title level={4}>Popular Books</Typography.Title>}
            style={{ width: "100%" }}
          >
            <Row gutter={[16, 16]}>
              {loaderData.topBooks
                .sort(
                  (a: PopularBook, b: PopularBook) =>
                    b.borrowCount - a.borrowCount
                )
                .map((book: PopularBook) => (
                  <Col xs={24} sm={12} md={8} key={book.id}>
                    <Card
                      size="small"
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        {book.title}
                      </Typography.Title>
                      <Typography.Text
                        type="secondary"
                        style={{ marginTop: marginXS }}
                      >
                        by {book.author}
                      </Typography.Text>
                      <div style={{ marginTop: "auto", paddingTop: marginSM }}>
                        <Tag color={book.borrowCount > 1 ? "blue" : undefined}>
                          Borrowed {book.borrowCount} time
                          {book.borrowCount > 1 ? "s" : ""}
                        </Tag>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card
              title={
                <Typography.Title level={4}>Top Borrowers</Typography.Title>
              }
            >
              <Row gutter={[16, 16]}>
                {loaderData.topBorrowers.map((borrower: TopBorrower) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={borrower.id}>
                    <Card size="small" style={{ height: "100%" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: marginXS,
                        }}
                      >
                        <Typography.Title
                          level={5}
                          style={{ margin: 0, flex: 1 }}
                        >
                          {borrower.name}
                        </Typography.Title>
                        <Tag color="blue">{borrower.borrowCount} books</Tag>
                      </div>
                      <Typography.Text
                        type="secondary"
                        style={{ marginTop: marginXS }}
                      >
                        Currently borrowing: {borrower.currentBorrows} book
                        {borrower.currentBorrows !== 1 ? "s" : ""}
                      </Typography.Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>

        <Modal
          title="Borrow a Book"
          open={isBorrowModalOpen}
          onOk={handleModalOk}
          onCancel={handleModalCancel}
          width={600}
          confirmLoading={isBorrowing}
        >
          <Form form={form} layout="vertical" requiredMark="optional">
            <Form.Item
              name="bookId"
              label="Book"
              rules={[{ required: true, message: "Please select a book" }]}
            >
              <Select
                showSearch
                placeholder="Select a book"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={availableBooks.map((book) => ({
                  value: book.id,
                  label: `${book.title} (${book.author.name})`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="memberId"
              label="Member"
              rules={[{ required: true, message: "Please select a member" }]}
            >
              <Select
                showSearch
                placeholder="Select a member"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={availableMembers.map((member) => ({
                  value: member.id,
                  label: `${member.firstName} ${member.lastName}`,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="dueDate"
              label="Due Date (defaults to 14 days)"
              initialValue={dayjs().add(14, "days")}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Context.Provider>
  );
}
