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
import type { Route } from "./+types/categories";
import React, { useMemo, useState, type FC } from "react";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import type { Category } from "~/types";

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
  const [categories] = await Promise.all([axiosInstance.get("/categories")]);

  return {
    categories: categories.data,
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
            <Typography.Title level={4}>Categories</Typography.Title>
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

const Categories: FC<Route.ComponentProps> = ({
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

  const handleDeleteCategory = async (categoryId: number) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.delete(`/categories/${categoryId}`);

      setLoaderData((prev) => ({
        ...prev,
        categories: prev.categories.filter(
          (category: Category) => category.id !== categoryId
        ),
      }));

      message.success("Category deleted successfully");
      api.success({
        message: "Category deleted successfully",
        description: `Category has been removed.`,
        placement: "bottomRight",
      });
    } catch (error) {
      api.error({
        message: "Failed to delete category",
        description: error instanceof Error ? error.message : "Unknown error",
        placement: "bottomRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddUpdateCategory = async (values: {
    name: string;
    description: string;
  }) => {
    try {
      setIsSubmitting(true);

      const response = await axiosInstance.post("/categories", values);

      setLoaderData((prev) => ({
        ...prev,
        categories: [...prev.categories, response.data],
      }));

      message.success("Category added successfully");
      api.success({
        message: "Category added successfully",
        description: `Category ${values.name} has been added.`,
        placement: "bottomRight",
      });

      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      api.error({
        message: "Failed to add Category",
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
          dataSource={loaderData.categories}
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
                title: "Description",
                dataIndex: "description",
                key: "description",
                ellipsis: true,
              },
              {
                title: "",
                width: 100,
                key: "actions",
                render: (_, record) => (
                  <Space>
                    <Button
                      icon={<DeleteOutlined />}
                      type="text"
                      danger
                      onClick={() => handleDeleteCategory(record.id)}
                    />
                  </Space>
                ),
              },
            ] as ColumnsType<Category>
          }
          rowKey="id"
          title={() => (
            <Flex justify="space-between" align="center">
              <Typography.Title level={4}>Categories</Typography.Title>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => setIsModalOpen(true)}
              >
                Add Category
              </Button>
            </Flex>
          )}
        />

        <Modal
          title="Add New Category"
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAddUpdateCategory}
          >
            <Form.Item
              name="name"
              label="Name"
              rules={[
                { required: true, message: "Please enter the category name" },
                {
                  max: 100,
                  message: "Name cannot be longer than 100 characters",
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                {
                  required: true,
                  message: "Please enter the category description",
                },
                {
                  max: 500,
                  message: "Description cannot be longer than 500 characters",
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
                  Add Category
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Context.Provider>
  );
};

export default Categories;
