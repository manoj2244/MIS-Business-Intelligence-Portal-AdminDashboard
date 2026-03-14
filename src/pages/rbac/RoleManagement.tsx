import { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Switch, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { rbacApi } from '../../services/rbacApi';
import type { Role } from '../../types';

export default function RoleManagement() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rbacApi.getRoles();
      setRoles(data || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleCreateRole = async (values: any) => {
    try {
      await rbacApi.createRole(values);
      message.success('Role created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchRoles();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create role');
    }
  };

  const columns: ColumnsType<Role> = [
    {
      title: 'Role Code',
      dataIndex: 'roleCode',
      key: 'roleCode',
      width: 160,
    },
    {
      title: 'Role Name',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'System Role',
      dataIndex: 'isSystemRole',
      key: 'isSystemRole',
      width: 120,
      render: (isSystemRole: boolean) => (
        <Tag color={isSystemRole ? 'blue' : 'default'}>
          {isSystemRole ? 'System' : 'Custom'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 110,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
      ),
    },
    {
      title: 'Permissions',
      key: 'permissionCount',
      width: 130,
      render: (_, record) => (
        <Tag color="purple">{record.Role_Permission?.length || 0} permissions</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<KeyOutlined />}
          onClick={() =>
            navigate(`/rbac/role-management/${record.roleCode}/permissions`)
          }
        >
          Permissions
        </Button>
      ),
    },
  ];

  return (
    <>
      <Card
        title="Role Management"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
            Create Role
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={roles}
          rowKey="roleCode"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      </Card>

      <Modal
        title="Create New Role"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRole}>
          <Form.Item
            name="roleCode"
            label="Role Code"
            rules={[
              { required: true, message: 'Please enter role code' },
              { pattern: /^[A-Z_]+$/, message: 'Use uppercase letters and underscores only' },
            ]}
          >
            <Input placeholder="e.g., CUSTOM_MANAGER" />
          </Form.Item>

          <Form.Item
            name="roleName"
            label="Role Name"
            rules={[{ required: true, message: 'Please enter role name' }]}
          >
            <Input placeholder="e.g., Custom Manager" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Role description" />
          </Form.Item>

          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>

          <Space>
            <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              Create Role
            </Button>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
