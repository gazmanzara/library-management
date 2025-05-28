import {
  Button,
  Flex,
  Layout,
  Table,
  theme,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  message,
  notification,
  Card,
  Skeleton,
} from "antd";
import axiosInstance from "~/lib/axiosInstance";
import type { Route } from "./+types/authors";
import React, { useMemo, useState, type FC } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Author } from "~/types";

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
  const [authors] = await Promise.all([axiosInstance.get("/authors")]);

  return {
    authors: authors.data,
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
      <Card
        title={
          <Flex justify="space-between" align="center">
            <Typography.Title level={4}>Authors</Typography.Title>
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
}

const Context = React.createContext({ name: "Default" });

const Authors: FC<Route.ComponentProps> = ({
  loaderData: initialLoaderData,
}) => {
  const [loaderData, setLoaderData] = useState(initialLoaderData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [id, setId] = useState<number | null>(null);

  const {
    token: { colorBgContainer, paddingLG, borderRadiusLG },
  } = theme.useToken();

  const [api, contextHolder] = notification.useNotification();

  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);

  const handleDeleteAuthor = async (authorId: number) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.delete(`/authors/${authorId}`);

      setLoaderData((prev) => ({
        ...prev,
        authors: prev.authors.filter(
          (author: Author) => author.id !== authorId
        ),
      }));

      message.success("Author deleted successfully");
      api.success({
        message: "Author deleted successfully",
        description: `Author has been removed.`,
        placement: "bottomRight",
      });
    } catch (error) {
      api.error({
        message: "Failed to delete author",
        description: error instanceof Error ? error.message : "Unknown error",
        placement: "bottomRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUpdateAuthor = async (values: {
    name: string;
    biography: string;
  }) => {
    try {
      setIsSubmitting(true);

      if (id) {
        // Update existing author
        const response = await axiosInstance.put(`/authors/${id}`, values);
        setLoaderData((prev) => ({
          ...prev,
          authors: prev.authors.map((author: Author) =>
            author.id === id ? response.data : author
          ),
        }));

        message.success("Author updated successfully");
        api.success({
          message: "Author updated successfully",
          description: `Author ${values.name} has been updated.`,
          placement: "bottomRight",
        });
        setId(null);
      } else {
        const response = await axiosInstance.post("/authors", values);

        setLoaderData((prev) => ({
          ...prev,
          authors: [...prev.authors, response.data],
        }));

        message.success("Author added successfully");
        api.success({
          message: "Author added successfully",
          description: `Author ${values.name} has been added.`,
          placement: "bottomRight",
        });
      }

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      api.error({
        message: id ? "Failed to update author" : "Failed to add author",
        description: error instanceof Error ? error.message : "Unknown error",
        placement: "bottomRight",
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
          dataSource={loaderData.authors}
          loading={isSubmitting}
          columns={
            [
              {
                title: "Name",
                dataIndex: "name",
                key: "name",
                sorter: (a, b) => a.name.localeCompare(b.name),
              },
              {
                title: "Biography",
                dataIndex: "biography",
                key: "biography",
                ellipsis: true,
              },
              {
                title: "",
                width: 100,
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      type="text"
                      onClick={() => {
                        setIsModalOpen(true);
                        form.setFieldsValue({
                          name: record.name,
                          biography: record.biography,
                        });
                        setId(record.id);
                      }}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      type="text"
                      danger
                      onClick={() => handleDeleteAuthor(record.id)}
                    />
                  </Space>
                ),
              },
            ] as ColumnsType<Author>
          }
          rowKey="id"
          title={() => (
            <Flex justify="space-between" align="center">
              <Typography.Title level={4}>Authors</Typography.Title>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Add Author
              </Button>
            </Flex>
          )}
        />

        <Modal
          title="Add New Author"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddUpdateAuthor}>
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the author's name" },
                {
                  max: 100,
                  message: "Name cannot be longer than 100 characters",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="biography"
              label="Biography"
              rules={[
                {
                  required: true,
                  message: "Please enter the author's biography",
                },
                {
                  max: 500,
                  message: "Biography cannot be longer than 500 characters",
                },
              ]}
            >
              <Input.TextArea rows={4} />
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
                  {id ? "Update Author" : "Add Author"}
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Context.Provider>
  );
};

export default Authors;
