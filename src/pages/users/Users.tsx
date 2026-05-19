import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { rbacApi } from '../../services/rbacApi';
import { getBranches, getRegions, getClusters } from '../../services/hierarchyApi';

const { Text } = Typography;

interface HrmsUser {
  id?: string;
  employeeId: string;
  empCode?: string | null;
  name: string;
  email?: string | null;
  role?: string | null;
  roleCode?: string | null;
  roleName?: string | null;
  isActive?: boolean;
  branchCode?: string | null;
  branch?: string | null;
  department?: string | null;
  designation?: string | null;
  mobile?: string | null;
  lastLogin?: string | Date | null;
  [key: string]: any;
}

interface BranchOption {
  branchCode: string;
  branchName: string;
  isActive?: boolean;
}

type BranchFilter = 'all' | 'assigned' | 'unassigned';

const HIERARCHY_COLOR: Record<string, string> = {
  BRANCH: 'blue', CLUSTER: 'purple', REGION: 'orange', CENTRAL: 'red',
};
const HIERARCHY_LABEL: Record<string, string> = {
  BRANCH: 'Branch', CLUSTER: 'Cluster', REGION: 'Region', CENTRAL: 'Central',
};

export default function Users() {
  const [form] = Form.useForm<{ branchCode: string }>();
  const [allUsers, setAllUsers] = useState<HrmsUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState<BranchFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<HrmsUser | null>(null);
  const [branchSearch, setBranchSearch] = useState('');
  const [debouncedBranchSearch, setDebouncedBranchSearch] = useState('');
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [regionCodes, setRegionCodes] = useState<Set<string>>(new Set());
  const [clusterCodes, setClusterCodes] = useState<Set<string>>(new Set());
  const [branchCodes, setBranchCodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    void fetchUsers();
    void fetchHierarchyMasters();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedBranchSearch(branchSearch.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [branchSearch]);

  useEffect(() => {
    if (!modalOpen) return;
    void fetchBranches(debouncedBranchSearch);
  }, [modalOpen, debouncedBranchSearch]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rbacApi.getAllUsers();
      setAllUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHierarchyMasters = useCallback(async () => {
    try {
      const [regs, clus, brans] = await Promise.all([getRegions(), getClusters(), getBranches({})]);
      setRegionCodes(new Set((regs || []).map((r: any) => String(r.regionCode || '').trim())));
      setClusterCodes(new Set((clus || []).map((c: any) => String(c.clusterCode || '').trim())));
      setBranchCodes(new Set((brans || []).map((b: any) => String(b.branchCode || '').trim())));
    } catch { /* silent — badges just won't show */ }
  }, []);

  const fetchBranches = useCallback(async (q = '') => {
    setBranchLoading(true);
    try {
      const rows = await getBranches({ q: q || undefined });
      const normalized: BranchOption[] = (rows || [])
        .map((item: any) => ({
          branchCode: String(item?.branchCode || '').trim(),
          branchName: String(item?.branchName || '').trim(),
          isActive: item?.isActive !== false,
        }))
        .filter((item: BranchOption) => item.branchCode.length > 0)
        .sort((a: BranchOption, b: BranchOption) => a.branchCode.localeCompare(b.branchCode));
      setBranchOptions(normalized);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      message.error('Failed to fetch branches');
    } finally {
      setBranchLoading(false);
    }
  }, []);

  const stats = useMemo(() => {
    const total = allUsers.length;
    const assigned = allUsers.filter((user) => Boolean(user.branchCode)).length;
    const unassigned = total - assigned;
    const active = allUsers.filter((user) => user.isActive !== false).length;
    return { total, assigned, unassigned, active };
  }, [allUsers]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allUsers
      .filter((user) => {
        if (branchFilter === 'assigned') return Boolean(user.branchCode);
        if (branchFilter === 'unassigned') return !user.branchCode;
        return true;
      })
      .filter((user) => {
        if (!q) return true;
        return [
          user.name,
          user.employeeId,
          user.email,
          user.role,
          user.designation,
          user.department,
          user.branch,
          user.branchCode,
          user.mobile,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      });
  }, [allUsers, search, branchFilter]);

  const branchSelectOptions = useMemo(
    () =>
      branchOptions.map((branch) => ({
        value: branch.branchCode,
        label: `${branch.branchName || 'Unnamed Branch'} (${branch.branchCode})${
          branch.isActive === false ? ' [Inactive]' : ''
        }`,
        disabled: branch.isActive === false,
      })),
    [branchOptions],
  );

  const openAssignModal = (user: HrmsUser) => {
    setSelectedUser(user);
    form.setFieldsValue({ branchCode: user.branchCode || undefined });
    setBranchSearch('');
    setDebouncedBranchSearch('');
    setModalOpen(true);
  };

  const closeAssignModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    form.resetFields();
  };

  const handleSaveBranch = async () => {
    if (!selectedUser?.employeeId) return;
    try {
      const values = await form.validateFields();
      setModalSubmitting(true);
      await rbacApi.assignUserBranch(selectedUser.employeeId, values.branchCode);
      message.success(`Branch assigned for ${selectedUser.name || selectedUser.employeeId}`);
      closeAssignModal();
      await fetchUsers();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.response?.data?.message || 'Failed to assign branch');
    } finally {
      setModalSubmitting(false);
    }
  };

  const deriveHierarchyType = useCallback((code: string | null | undefined): string | null => {
    if (!code) return null;
    const c = code.trim();
    if (regionCodes.has(c)) return 'REGION';
    if (clusterCodes.has(c)) return 'CLUSTER';
    if (branchCodes.has(c)) return 'BRANCH';
    return 'CENTRAL';
  }, [regionCodes, clusterCodes, branchCodes]);

  const columns: ColumnsType<HrmsUser> = [
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 130,
      render: (v) => <Text code>{v || '-'}</Text>,
    },
    {
      title: 'Name',
      key: 'name',
      width: 240,
      render: (_value, row) => (
        <Space size={10}>
          <Avatar
            size={30}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              fontSize: 12,
            }}
          >
            {row.name?.trim()?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Text strong>{row.name || '-'}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {row.email || 'No email available'}
              </Text>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Designation',
      key: 'designation',
      width: 200,
      render: (_value, row) => (
        <Space direction="vertical" size={1}>
          <Text>{row.designation || '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {row.department || 'No department'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      width: 140,
      render: (_value, row) =>
        row.role ? <Tag color="geekblue">{row.role}</Tag> : <Tag color="default">No Role</Tag>,
    },
    {
      title: 'Hierarchy',
      key: 'hierarchyType',
      width: 120,
      render: (_value, row) => {
        const type = deriveHierarchyType(row.branchCode);
        if (!type) return <Tag color="default">Unknown</Tag>;
        return <Tag color={HIERARCHY_COLOR[type]}>{HIERARCHY_LABEL[type]}</Tag>;
      },
    },
    {
      title: 'Branch',
      key: 'branch',
      width: 230,
      render: (_value, row) =>
        row.branchCode ? (
          <Space direction="vertical" size={2}>
            <Text strong>{row.branch || 'Branch name not available'}</Text>
            <Tag color="blue">{row.branchCode}</Tag>
          </Space>
        ) : (
          <Tag color="gold">Not Assigned</Tag>
        ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 160,
      render: (_value, row) => <Text>{row.mobile || row.email || '-'}</Text>,
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
      width: 170,
      render: (v) => <Text>{v ? new Date(v).toLocaleString() : '-'}</Text>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 140,
      fixed: 'right',
      render: (_value, row) => (
        <Button
          size="small"
          type={row.branchCode ? 'default' : 'primary'}
          icon={<SwapOutlined />}
          onClick={() => openAssignModal(row)}
        >
          {row.branchCode ? 'Reassign' : 'Assign'}
        </Button>
      ),
    },
  ];

  return (
    <div className="ui-page user-mgmt-page" style={{ padding: 12 }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={6}>
          <Card className="pro-card-gradient user-mgmt-stat user-mgmt-stat--total" size="small">
            <Statistic
              title={
                <Space size={6}>
                  <TeamOutlined />
                  Total HRMS Users
                </Space>
              }
              value={stats.total}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="pro-card-gradient user-mgmt-stat user-mgmt-stat--assigned" size="small">
            <Statistic
              title={
                <Space size={6}>
                  <BankOutlined />
                  Branch Assigned
                </Space>
              }
              value={stats.assigned}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="pro-card-gradient user-mgmt-stat user-mgmt-stat--unassigned" size="small">
            <Statistic
              title={
                <Space size={6}>
                  <CloseCircleOutlined />
                  Unassigned
                </Space>
              }
              value={stats.unassigned}
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card className="pro-card-gradient user-mgmt-stat user-mgmt-stat--active" size="small">
            <Statistic
              title={
                <Space size={6}>
                  <CheckCircleOutlined />
                  Active Users
                </Space>
              }
              value={stats.active}
            />
          </Card>
        </Col>
      </Row>

      <Card
        className="pro-card-gradient"
        size="small"
        title={
          <Space>
            <UserOutlined />
            <span>HRMS User Management ({filteredUsers.length})</span>
          </Space>
        }
        extra={
          <Space wrap>
            <Select<BranchFilter>
              value={branchFilter}
              onChange={setBranchFilter}
              style={{ width: 180 }}
              options={[
                { value: 'all', label: 'All users' },
                { value: 'assigned', label: 'Branch assigned' },
                { value: 'unassigned', label: 'Branch unassigned' },
              ]}
            />
            <Input
              allowClear
              placeholder="Search name, ID, branch, designation..."
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 320 }}
            />
          </Space>
        }
      >
        {stats.unassigned > 0 && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message={`${stats.unassigned} user(s) do not have branch assignment`}
            description="Use the Assign action to map branch code for unassigned users."
          />
        )}

        <Table
          className="pro-table"
          rowKey={(row) => row.id || row.employeeId}
          columns={columns}
          dataSource={filteredUsers}
          loading={loading}
          rowClassName={(row) => (row.branchCode ? '' : 'user-mgmt-row-unassigned')}
          sticky
          pagination={{ pageSize: 20, showSizeChanger: true }}
          scroll={{ x: 1540 }}
          size="middle"
        />
      </Card>

      <Modal
        title="Assign Branch"
        open={modalOpen}
        onCancel={closeAssignModal}
        onOk={handleSaveBranch}
        okText="Save Branch"
        confirmLoading={modalSubmitting}
        destroyOnClose
      >
        {selectedUser && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 14 }}
            message={`${selectedUser.name || '-'} (${selectedUser.employeeId})`}
            description={`${selectedUser.designation || 'No designation'}${
              selectedUser.department ? ` • ${selectedUser.department}` : ''
            }`}
          />
        )}

        <Form form={form} layout="vertical">
          <Form.Item
            name="branchCode"
            label="Branch"
            rules={[{ required: true, message: 'Please select a branch' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="Search and select branch code"
              onSearch={setBranchSearch}
              filterOption={false}
              options={branchSelectOptions}
              notFoundContent={branchLoading ? <Spin size="small" /> : 'No branch found'}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
