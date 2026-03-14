import {
  Button,
  Card,
  Col,
  Empty,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  FilterOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useMemo } from 'react';

const { Option } = Select;
const { Text } = Typography;

const formatDate = (value?: string): string => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

type Props = {
  regions: any[];
  clusters: any[];
  filters: any;
  onFiltersChange: (filters: any) => void;
  onRefresh: () => void;
  loading: boolean;
  data: any;
  onEdit: (row: any) => void;
  onToggleStatus: (row: any, isActive: boolean) => void;
};

export default function MappingsTable({
  regions,
  clusters,
  filters,
  onFiltersChange,
  onRefresh,
  loading,
  data,
  onEdit,
  onToggleStatus,
}: Props) {
  const safeData = useMemo(() => (Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []), [data]);

  const filteredClusters = useMemo(() => {
    if (!filters.regionCode) return clusters;
    return clusters.filter((item) => item.regionCode === filters.regionCode);
  }, [clusters, filters.regionCode]);

  const summary = useMemo(() => {
    const total = safeData.length;
    const cluster = safeData.filter((row: any) => row.mappingType === 'CLUSTER').length;
    const direct = safeData.filter((row: any) => row.mappingType === 'DIRECT_REGION').length;
    const inactive = safeData.filter((row: any) => !row.isActive).length;
    return { total, cluster, direct, inactive };
  }, [safeData]);

  const columns = [
    {
      title: 'Region',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 240,
      render: (_: any, row: any) => (
        <div>
          <Text strong>{row.regionName}</Text>
          <div>
            <Text type="secondary">{row.regionCode}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Cluster / Type',
      dataIndex: 'clusterName',
      key: 'clusterName',
      width: 260,
      render: (_: any, row: any) => (
        <div>
          {row.clusterCode ? (
            <>
              <Text>{row.clusterName}</Text>
              <div>
                <Text type="secondary">{row.clusterCode}</Text>
              </div>
              <Tag color="cyan">Cluster Mapping</Tag>
            </>
          ) : (
            <>
              <Text>Direct under region</Text>
              <Tag color="gold">Region Direct</Tag>
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Branch',
      dataIndex: 'branchName',
      key: 'branchName',
      width: 240,
      render: (_: any, row: any) => (
        <div>
          <Text strong>{row.branchName}</Text>
          <div>
            <Text type="secondary">{row.branchCode}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 130,
      render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdOn',
      key: 'createdOn',
      width: 200,
      render: (value: string) => <Text>{formatDate(value)}</Text>,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right' as const,
      width: 160,
      render: (_: any, row: any) => (
        <Space>
          <Tooltip title="Move Branch">
            <Button icon={<SwapOutlined />} size="small" onClick={() => onEdit(row)} />
          </Tooltip>

          <Popconfirm
            title={row.isActive ? 'Deactivate this mapping?' : 'Activate this mapping?'}
            onConfirm={() => onToggleStatus(row, !row.isActive)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title={row.isActive ? 'Deactivate' : 'Activate'}>
              <Button
                icon={row.isActive ? <PoweroffOutlined /> : <CheckCircleOutlined />}
                size="small"
                danger={row.isActive}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Visible Mappings" value={summary.total} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Cluster Mapped" value={summary.cluster} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Region Direct" value={summary.direct} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic title="Inactive" value={summary.inactive} />
          </Card>
        </Col>
      </Row>

      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={8} lg={6}>
            <Select
              allowClear
              placeholder="Filter by Region"
              style={{ width: '100%' }}
              value={filters.regionCode}
              suffixIcon={<FilterOutlined />}
              onChange={(value) => onFiltersChange({ ...filters, regionCode: value, clusterCode: undefined })}
            >
              {regions.map((region) => (
                <Option key={region.regionCode} value={region.regionCode}>
                  {region.regionName} ({region.regionCode})
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={8} lg={6}>
            <Select
              allowClear
              placeholder="Filter by Cluster"
              style={{ width: '100%' }}
              value={filters.clusterCode}
              suffixIcon={<FilterOutlined />}
              onChange={(value) => onFiltersChange({ ...filters, clusterCode: value })}
            >
              {filteredClusters.map((cluster) => (
                <Option key={cluster.clusterCode} value={cluster.clusterCode}>
                  {cluster.clusterName} ({cluster.clusterCode})
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} md={8} lg={8}>
            <Input
              allowClear
              placeholder="Search branch code or name"
              prefix={<SearchOutlined />}
              value={filters.qBranch}
              onChange={(event) => onFiltersChange({ ...filters, qBranch: event.target.value })}
            />
          </Col>

          <Col xs={24} lg={4}>
            <Button icon={<ReloadOutlined />} onClick={onRefresh} style={{ width: '100%' }}>
              Refresh
            </Button>
          </Col>
        </Row>
      </Card>

      <Card bordered={false}>
        {safeData.length ? (
          <Table
            className="pro-table"
            rowKey={(record) => `${record.branchCode}-${record.mappingType}`}
            columns={columns}
            dataSource={safeData}
            loading={loading}
            sticky
            pagination={{ pageSize: 20, showSizeChanger: true }}
            scroll={{ x: 1300 }}
          />
        ) : (
          <Empty description="No mappings found" />
        )}
      </Card>
    </div>
  );
}
