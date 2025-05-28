import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  notification,
  Skeleton,
  Table,
  theme,
  Typography,
} from "antd";
import React, { useMemo, useState, type FC } from "react";
import type { Route } from "./+types/member";
import axiosInstance from "~/lib/axiosInstance";
import type { Member } from "~/types";

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
            <Typography.Title level={4}>Member</Typography.Title>
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

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const [member] = await Promise.all([axiosInstance.get("/members")]);

  return {
    member: member.data,
  };
}

const Context = React.createContext({
  name: "Ant Design",
});

const Member: FC<Route.ComponentProps> = ({
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

  const handleAddUpdateMember = async (values: any) => {
    try {
      setIsSubmitting(true);

      if (id) {
        const response = await axiosInstance.put(`/members/${id}`, {
          ...values,
        });

        setLoaderData((prev) => ({
          ...prev,
          member: prev.member.map((item: Member) =>
            item.id === id ? response.data : item
          ),
        }));

        api.success({
          message: "Member updated successfully",
          placement: "bottomRight",
        });
      } else {
        const response = await axiosInstance.post("/members", {
          ...values,
        });

        setLoaderData((prev) => ({
          ...prev,
          member: [...prev.member, response.data],
        }));

        api.success({
          message: "Member added successfully",
          placement: "bottomRight",
        });
      }

      setIsModalOpen(false);
      form.resetFields();
      setId(null);
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

  const handleDeleteMember = async (id: number) => {
    try {
      setIsSubmitting(true);
      await axiosInstance.delete(`/members/${id}`);

      setLoaderData((prev) => ({
        ...prev,
        member: prev.member.filter((item: Member) => item.id !== id),
      }));

      api.success({
        message: "Member deleted successfully",
        placement: "bottomRight",
      });
    } catch (error) {
      api.error({
        message: "Failed to delete member",
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
          loading={isSubmitting}
          rowKey="id"
          title={() => (
            <Flex justify="space-between" align="center">
              <Typography.Title level={4}>Member</Typography.Title>
              <Button
                icon={<PlusOutlined />}
                type="primary"
                onClick={() => {
                  setIsModalOpen(true);
                  setId(null);
                  form.resetFields();
                }}
              >
                Add Member
              </Button>
            </Flex>
          )}
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              key: "name",
              render: (_, record: Member) => (
                <Typography.Text>
                  {record.firstName} {record.lastName}
                </Typography.Text>
              ),
            },
            {
              title: "Email",
              dataIndex: "email",
              key: "email",
            },
            {
              title: "Phone",
              dataIndex: "phone",
              key: "phone",
            },
            {
              title: "",
              key: "action",
              width: 100,
              render: (_, record: Member) => (
                <Flex justify="end">
                  <Button
                    type="link"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setId(record.id);
                      form.setFieldsValue({
                        firstName: record.firstName,
                        lastName: record.lastName,
                        email: record.email,
                        phone: record.phone,
                      });
                      setIsModalOpen(true);
                    }}
                  ></Button>
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      handleDeleteMember(record.id);
                    }}
                  ></Button>
                </Flex>
              ),
            },
          ]}
          dataSource={loaderData.member}
        />

        <Modal
          title={id ? "Edit Member" : "Add Member"}
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            setId(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleAddUpdateMember}>
            <Form.Item
              label="First Name"
              name="firstName"
              rules={[
                { required: true, message: "Please input first name!" },
                { max: 50, message: "First name cannot exceed 50 characters." },
              ]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>

            <Form.Item
              label="Last Name"
              name="lastName"
              rules={[
                { required: true, message: "Please input last name!" },
                { max: 50, message: "Last name cannot exceed 50 characters." },
              ]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please input email!" },
                {
                  type: "email",
                  message: "The input is not valid E-mail!",
                },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              label="Phone"
              name="phone"
              rules={[
                { required: true, message: "Please input phone number!" },
              ]}
            >
              <Input placeholder="Enter phone number" />
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
                  {id ? "Update Member" : "Add Member"}
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Context.Provider>
  );
};

export default Member;
