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
} from "antd";
import axiosInstance from "~/lib/axiosInstance";
import type { Route } from "./+types/authors";
import React, { useMemo, useState, type FC } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

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

export function HydrateFallback() {
  return <div>Loading...</div>;
}

const { Content } = Layout;

interface Author {
  id: number;
  name: string;
  biography: string;
}

const Context = React.createContext({ name: "Default" });

const Authors: FC<Route.ComponentProps> = ({
  loaderData: initialLoaderData,
}) => {
  const [loaderData, setLoaderData] = useState(initialLoaderData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    token: { colorBgContainer, paddingLG, borderRadiusLG },
  } = theme.useToken();

  const [api, contextHolder] = notification.useNotification();

  const contextValue = useMemo(() => ({ name: "Ant Design" }), []);

  const handleAddAuthor = async (values: {
    name: string;
    biography: string;
  }) => {
    try {
      setIsSubmitting(true);
      const response = await axiosInstance.post("/authors", values);

      setLoaderData((prev) => ({
        ...prev,
        authors: [...prev.authors, response.data],
      }));

      message.success("Author added successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      api.error({
        message: "Failed to add author",
        description: error instanceof Error ? error.message : "Unknown error",
        placement: "bottomRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnsType<Author> = [
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
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="text"
            onClick={() => console.log("Edit author:", record.id)}
          />
          <Button
            icon={<DeleteOutlined />}
            type="text"
            danger
            onClick={() => console.log("Delete author:", record.id)}
          />
        </Space>
      ),
    },
  ];

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
          columns={columns}
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
          <Form form={form} layout="vertical" onFinish={handleAddAuthor}>
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
                  Add Author
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
