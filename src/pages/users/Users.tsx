import { useEffect, useState } from 'react';
import { Card, Table, Input, Tag, Space, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { rbacApi } from '../../services/rbacApi';

const { Text } = Typography;

interface HrmsUser {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  branch?: string;
  department?: string;
  designation?: string;
  lastLogin?: string;
  [key: string]: any;
}

export default function Users() {
  const [allUsers, setAllUsers] = useState<HrmsUser[]>([]);
  const [filtered, setFiltered] = useState<HrmsUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await rbacApi.getAllUsers();
      setAllUsers(data);
      setFiltered(data);
    } catch {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    if (!value) {
      setFiltered(allUsers);
      return;
    }
    const lower = value.toLowerCase();
    setFiltered(
      allUsers.filter(
        (u) =>
          u.name?.toLowerCase().includes(lower) ||
          u.employeeId?.toLowerCase().includes(lower) ||
          u.email?.toLowerCase().includes(lower) ||
          u.role?.toLowerCase().includes(lower)
      )
    );
  };

  const columns: ColumnsType<HrmsUser> = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 140,
      render: (v) => <Text code>{v || '-'}</Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (v) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (v) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (v) => (v ? <Tag color="geekblue">{v}</Tag> : <Tag color="default">No Role</Tag>),
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (v) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (v) => v || '-',
    },
    {
      title: 'Branch',
      dataIndex: 'branch',
      key: 'branch',
      render: (v) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (v) => <Tag color={v ? 'green' : 'volcano'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 180,
      render: (v) => <Text>{v ? new Date(v).toLocaleString() : '-'}</Text>,
    },
  ];

  return (
    <div className="ui-page" style={{ padding: 24 }}>
      <Card
        className="pro-card-gradient"
        title={
          <Space>
            <UserOutlined />
            <span>Users ({filtered.length})</span>
          </Space>
        }
        extra={
          <Input
            allowClear
            placeholder="Search name, ID, email, role..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 280 }}
          />
        }
      >
        <Table
          className="pro-table"
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          sticky
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>
    </div>
  );
}

