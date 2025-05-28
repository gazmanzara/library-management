import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  notification,
  Select,
  Skeleton,
  Table,
  theme,
  Typography,
} from "antd";
import React, { useMemo, useState, type FC } from "react";
import type { Route } from "./+types/books";
import axiosInstance from "~/lib/axiosInstance";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { Author, Book, Category } from "~/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Library Management System - Books" },
    {
      name: "description",
      content:
        "Manage your library's books, members, and loans efficiently with our comprehensive library management system.",
    },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const [books] = await Promise.all([axiosInstance.get("/books")]);

  return {
    books: books.data,
  };
}

const { Content } = Layout;

export const HydrateFallback = () => {
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
      <Card
        title={
          <Flex justify="space-between" align="center">
            <Typography.Title level={4}>Books</Typography.Title>
            <Skeleton.Button active />
          </Flex>
        }
      >
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </Card>
    </Content>
  );
};

const Context = React.createContext({ name: "Ant Design" });

const Books: FC<Route.ComponentProps> = ({ loaderData: initialLoaderData }) => {
  const [loaderData, setLoaderData] = useState(initialLoaderData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [authorOptions, setAuthorOptions] = useState<Author[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  const {
    token: { colorBgContainer, paddingLG, borderRadiusLG },
  } = theme.useToken();

  const [api, contextHolder] = notification.useNotification();

  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);

  const handleAddBook = async () => {
    try {
      setIsSubmitting(true);

      const [authorsResponse, categoriesResponse] = await Promise.all([
        axiosInstance.get("/authors"),
        axiosInstance.get("/categories"),
      ]);
      setAuthorOptions(authorsResponse.data);
      setCategoryOptions(categoriesResponse.data);
      setIsModalOpen(true);
    } catch (error) {
      api.error({
        message: "Error fetching authors or categories",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUpdateBook = async (values: any) => {
    try {
      setIsSubmitting(true);

      if (id) {
        const response = await axiosInstance.put(`/books/${id}`, {
          ...values,
        });

        setLoaderData((prev) => ({
          ...prev,
          books: prev.books.map((book: Book) =>
            book.id === id ? response.data : book
          ),
        }));
        api.success({
          message: "Book updated successfully",
          description: `Book ${values.title} has been updated.`,
        });
      } else {
        const response = await axiosInstance.post("/books", {
          ...values,
        });

        setLoaderData((prev) => ({
          ...prev,
          books: [...prev.books, response.data],
        }));
        api.success({
          message: "Book added successfully",
          description: `Book ${values.title} has been added.`,
        });
      }

      setIsModalOpen(false);
      form.resetFields();
      setId(null);
    } catch (error) {
      api.error({
        message: id ? "Error updating book" : "Error adding book",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
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
        <Table
          rowKey="id"
          title={() => (
            <Flex justify="space-between" align="center">
              <Typography.Title level={4}>Books</Typography.Title>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={handleAddBook}
                loading={isSubmitting}
              >
                Add Book
              </Button>
            </Flex>
          )}
          dataSource={loaderData.books}
          expandable={{
            expandedRowRender: (record: Book) => (
              <Card
                title={null}
                style={{ margin: 0, borderRadius: 0, padding: 0 }}
                styles={{
                  body: { display: "flex", gap: "16px", padding: "16px" },
                }}
              >
                <Flex align="center" gap={16}>
                  <img
                    src={record.imgUrl}
                    alt={record.title}
                    style={{
                      width: 120,
                      height: 180,
                      objectFit: "cover",
                      borderRadius: 8,
                      backgroundColor: "#f0f0f0",
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <Typography.Title level={4} style={{ marginBottom: 8 }}>
                      {record.title}
                    </Typography.Title>

                    <Typography.Paragraph style={{ marginBottom: 4 }}>
                      <strong>Author:</strong> {record.author.name}
                    </Typography.Paragraph>

                    <Typography.Paragraph style={{ marginBottom: 4 }}>
                      <strong>Publication Year:</strong>{" "}
                      {record.publicationYear}
                    </Typography.Paragraph>

                    <Typography.Paragraph style={{ marginBottom: 4 }}>
                      <strong>Description:</strong>{" "}
                      {record.description || "No description available."}
                    </Typography.Paragraph>

                    {record.categories?.length > 0 && (
                      <Typography.Paragraph style={{ marginBottom: 0 }}>
                        <strong>Categories:</strong>{" "}
                        {record.categories.map((cat) => cat.name).join(", ")}
                      </Typography.Paragraph>
                    )}
                  </div>
                </Flex>
              </Card>
            ),
          }}
          columns={[
            {
              title: "Title",
              dataIndex: "title",
              key: "title",
            },
            {
              title: "Author",
              dataIndex: ["author", "name"],
              key: "author",
            },
            {
              title: "Publication Year",
              dataIndex: "publicationYear",
              key: "publicationYear",
            },
            {
              title: "Actions",
              key: "actions",
              width: 100,
              render: (_, record) => (
                <Flex>
                  <Button
                    type="link"
                    onClick={() => {
                      console.log(record);
                      form.setFieldsValue({
                        title: record.title,
                        description: record.description,
                        isbn: record.isbn,
                        publicationYear: record.publicationYear,
                        imgUrl: record.imgUrl,
                        authorId: record.author.id,
                        categoryIds: record.categories.map((cat) => cat.id),
                      });
                      setId(record.id);
                      handleAddBook();
                    }}
                    icon={<EditOutlined />}
                  ></Button>
                  <Button
                    type="link"
                    danger
                    onClick={() => {}}
                    icon={<DeleteOutlined />}
                  ></Button>
                </Flex>
              ),
            },
          ]}
        />

        <Modal
          title="Add New Book"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
            setId(null);
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddUpdateBook}>
            <Form.Item
              name={"title"}
              label="Title"
              rules={[
                { required: true, message: "Please enter the book title." },
                {
                  max: 100,
                  message: "Title cannot exceed 100 characters.",
                },
              ]}
            >
              <Input placeholder="Enter book title" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter the book description.",
                },
                {
                  max: 500,
                  message: "Description cannot be longer than 500 characters",
                },
              ]}
            >
              <Input.TextArea rows={4} />
            </Form.Item>

            <Form.Item
              name="isbn"
              label="ISBN"
              rules={[
                {
                  required: true,
                  message: "Please enter the book ISBN.",
                },
                {
                  pattern: /^(97(8|9))?\d{9}(\d|X)$/,
                  message: "Please enter a valid ISBN number.",
                },
              ]}
            >
              <Input placeholder="Enter book ISBN" />
            </Form.Item>

            <Form.Item
              name="publicationYear"
              label="Publication Year"
              rules={[
                {
                  required: true,
                  message: "Please enter the publication year.",
                },
                {
                  pattern: /^\d{4}$/,
                  message: "Please enter a valid 4-digit year.",
                },
              ]}
            >
              <Input placeholder="Enter publication year" />
            </Form.Item>

            <Form.Item
              name="imgUrl"
              label="Image URL"
              rules={[
                {
                  required: true,
                  message: "Please enter the image URL.",
                },
                {
                  type: "url",
                  message: "Please enter a valid URL.",
                },
              ]}
            >
              <Input placeholder="Enter image URL" />
            </Form.Item>

            <Form.Item
              name="authorId"
              label="Author"
              rules={[{ required: true, message: "Please select an author." }]}
            >
              <Select
                placeholder="Select author"
                options={authorOptions.map((author) => ({
                  label: author.name,
                  value: author.id,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="categoryIds"
              label="Categories"
              rules={[
                {
                  required: true,
                  message: "Please select at least one category.",
                },
              ]}
            >
              <Select
                placeholder="Select categories"
                mode="multiple"
                options={categoryOptions.map((category) => ({
                  label: category.name,
                  value: category.id,
                }))}
              />
            </Form.Item>

            <Form.Item>
              <Flex gap="small" justify="flex-end">
                <Button
                  onClick={() => {
                    setIsModalOpen(false);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {id ? "Update Book" : "Add Book"}
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Context.Provider>
  );
};

export default Books;
