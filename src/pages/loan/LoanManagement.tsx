import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Popconfirm,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  createLoanSegment,
  deleteLoanSegment,
  getLoanAcTypes,
  getLoanSegments,
  updateLoanSegment,
} from '../../services/loanApi';

const { Title, Text } = Typography;

const SEGMENT_OPTIONS = ['Micro Loan', 'Business Loan', 'Retail Loan', 'Others'];

type LoanSegmentRow = {
  id: number;
  loanSegment: string | null;
  acType: string | null;
  acTypeDesc: string | null;
  mappedBy: string | null;
  mappedDate: string | null;
};

export default function LoanManagement() {
  const [rows, setRows] = useState<LoanSegmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string | undefined>(undefined);
  const [acTypeFilter, setAcTypeFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [form] = Form.useForm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LoanSegmentRow | null>(null);
  const [acTypes, setAcTypes] = useState<Array<{ acType: string; acTypeDesc: string | null }>>([]);
  const [acTypeLoading, setAcTypeLoading] = useState(false);

  const fetchSegments = async (params: {
    page?: number;
    pageSize?: number;
    q?: string;
    loanSegment?: string;
    acType?: string;
  } = {}) => {
    setLoading(true);
    try {
      const response = await getLoanSegments({
        page: params.page || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        q: (params.q ?? '') || search.trim() || undefined,
        loanSegment: params.loanSegment ?? segmentFilter,
        acType: params.acType ?? acTypeFilter,
      });
      setRows(Array.isArray(response?.items) ? response.items : []);
      setPagination({
        current: response?.pagination?.page || params.page || 1,
        pageSize: response?.pagination?.pageSize || params.pageSize || 10,
        total: response?.pagination?.total || 0,
      });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load loan segments');
    } finally {
      setLoading(false);
    }
  };

  const fetchAcTypes = async () => {
    setAcTypeLoading(true);
    try {
      const data = await getLoanAcTypes();
      const normalized = (Array.isArray(data) ? data : [])
        .map((item) => ({
          acType: String(item?.acType || '').trim(),
          acTypeDesc: item?.acTypeDesc ? String(item.acTypeDesc).trim() : null,
        }))
        .filter((item) => item.acType.length > 0);
      setAcTypes(normalized);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load AcType options');
    } finally {
      setAcTypeLoading(false);
    }
  };

  useEffect(() => {
    void fetchSegments({ page: 1 });
    void fetchAcTypes();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (row: LoanSegmentRow) => {
    setEditing(row);
    form.setFieldsValue({
      loanSegment: row.loanSegment || undefined,
      acType: row.acType || undefined,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      if (editing) {
        await updateLoanSegment(editing.id, values);
        message.success('Loan segment updated successfully');
      } else {
        await createLoanSegment(values);
        message.success('Loan segment created successfully');
      }
      closeModal();
      await fetchSegments({ page: 1 });
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error(error?.response?.data?.message || 'Unable to save loan segment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: LoanSegmentRow) => {
    try {
      await deleteLoanSegment(row.id);
      message.success('Loan segment deleted successfully');
      await fetchSegments({ page: pagination.current });
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to delete loan segment');
    }
  };

  const acTypeOptions = useMemo(
    () =>
      acTypes.map((item) => ({
        value: item.acType,
        label: item.acTypeDesc ? `${item.acTypeDesc} (${item.acType})` : item.acType,
      })),
    [acTypes],
  );

  const columns: ColumnsType<LoanSegmentRow> = [
    {
      title: 'Loan Segment',
      dataIndex: 'loanSegment',
      key: 'loanSegment',
      width: 200,
      render: (value) => (
        <Tag color="blue">{value || '-'}</Tag>
      ),
    },
    {
      title: 'AcType',
      dataIndex: 'acType',
      key: 'acType',
      width: 130,
      render: (value) => <Text code>{value || '-'}</Text>,
    },
    {
      title: 'AcType Name',
      dataIndex: 'acTypeDesc',
      key: 'acTypeDesc',
      width: 280,
      render: (value) => <Text type="secondary">{value || '-'}</Text>,
    },
    {
      title: 'Mapped By',
      dataIndex: 'mappedBy',
      key: 'mappedBy',
      width: 160,
      render: (value) => <Text type="secondary">{value || '-'}</Text>,
    },
    {
      title: 'Mapped Date',
      dataIndex: 'mappedDate',
      key: 'mappedDate',
      width: 200,
      render: (value) => {
        if (!value) return <Text type="secondary">-</Text>;
        const parsed = value.includes('T') ? new Date(value).toLocaleString() : value;
        return <Text type="secondary">{parsed}</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_value, row) => (
        <Space>
          <Button size="small" onClick={() => openEdit(row)}>Edit</Button>
          <Popconfirm
            title="Delete this loan segment?"
            onConfirm={() => void handleDelete(row)}
          >
            <Button size="small" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="ui-page space-y-4">
      <div>
        <Title level={4} className="!mb-1" style={{ fontWeight: 600, color: '#1e3a8a' }}>
          Loan Management
        </Title>
        <Text type="secondary">Maintain loan segment to AcType mapping for lending products.</Text>
      </div>

      <Card
        className="pro-card-gradient"
        extra={
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
              Add Loan Segment
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => void fetchSegments({ page: 1 })}>
              Refresh
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Input.Search
            allowClear
            placeholder="Search by segment, AcType, name, mapped by"
            onSearch={(value) => {
              setSearch(value || '');
              void fetchSegments({ page: 1, q: value || '' });
            }}
            style={{ width: 'min(100%, 320px)' }}
          />
          <Select
            allowClear
            placeholder="Filter by segment"
            style={{ width: 200 }}
            value={segmentFilter}
            onChange={(value) => {
              setSegmentFilter(value);
              void fetchSegments({ page: 1, loanSegment: value });
            }}
            options={SEGMENT_OPTIONS.map((segment) => ({ value: segment, label: segment }))}
          />
          <Select
            allowClear
            showSearch
            loading={acTypeLoading}
            placeholder="Filter by AcType"
            style={{ width: 240 }}
            value={acTypeFilter}
            onChange={(value) => {
              setAcTypeFilter(value);
              void fetchSegments({ page: 1, acType: value });
            }}
            options={acTypeOptions}
            filterOption={(input, option) =>
              String(option?.label || '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Space>
        <Table
          className="pro-table"
          columns={columns}
          dataSource={rows}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={(nextPagination) =>
            void fetchSegments({
              page: nextPagination.current || 1,
              pageSize: nextPagination.pageSize || pagination.pageSize,
            })
          }
          scroll={{ x: 1100 }}
        />
      </Card>

      <Modal
        title={editing ? 'Edit Loan Segment' : 'Create Loan Segment'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSave}
        okText={editing ? 'Update' : 'Create'}
        confirmLoading={saving}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="loanSegment"
            label="Loan Segment"
            rules={[{ required: true, message: 'Please select loan segment' }]}
          >
            <Select
              options={SEGMENT_OPTIONS.map((segment) => ({ value: segment, label: segment }))}
              placeholder="Select loan segment"
            />
          </Form.Item>

          <Form.Item
            name="acType"
            label="AcType"
            rules={[{ required: true, message: 'Please select AcType' }]}
          >
            <Select
              showSearch
              loading={acTypeLoading}
              options={acTypeOptions}
              placeholder="Select AcType"
              filterOption={(input, option) =>
                String(option?.label || '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
