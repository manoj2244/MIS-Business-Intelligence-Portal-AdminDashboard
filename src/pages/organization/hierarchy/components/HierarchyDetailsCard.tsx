import { Button, Card, Descriptions, Empty, Space, Tag, Typography } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const nodeTypeLabelMap: Record<string, string> = {
  REGION: 'Region',
  CLUSTER: 'Cluster',
  BRANCH: 'Branch',
  DIRECT_GROUP: 'Direct Branch Group',
};

const formatDate = (value?: string): string => {
  if (!value) return '-';
  return new Date(value).toLocaleString();
};

type Props = {
  selectedNode: any;
  onCreateCluster: () => void;
  onCreateBranch: () => void;
  onEdit: () => void;
  onMoveBranch: () => void;
  onToggleActive: () => void;
  onSplitCluster: () => void;
};

export default function HierarchyDetailsCard({
  selectedNode,
  onCreateCluster,
  onCreateBranch,
  onEdit,
  onMoveBranch,
  onToggleActive,
  onSplitCluster,
}: Props) {
  if (!selectedNode) {
    return (
      <Card title={<Space size={8}><InfoCircleOutlined style={{ color: '#2563eb' }} />Details</Space>} bordered>
        <Empty description="Select a node to see details and actions" />
      </Card>
    );
  }

  const canEdit = ['REGION', 'CLUSTER', 'BRANCH'].includes(selectedNode.nodeType);
  const canCreateCluster = selectedNode.nodeType === 'REGION';
  const canCreateBranch = selectedNode.nodeType === 'REGION' || selectedNode.nodeType === 'CLUSTER';
  const canMoveBranch = selectedNode.nodeType === 'BRANCH';
  const canSplitCluster = selectedNode.nodeType === 'CLUSTER';

  const getDisplayCode = (): string => {
    if (selectedNode.nodeType === 'REGION') return selectedNode.regionCode || '-';
    if (selectedNode.nodeType === 'CLUSTER') return selectedNode.clusterCode || '-';
    if (selectedNode.nodeType === 'BRANCH') return selectedNode.branchCode || '-';
    return '-';
  };

  const getDisplayName = (): string => {
    if (selectedNode.nodeType === 'REGION') return selectedNode.regionName || '-';
    if (selectedNode.nodeType === 'CLUSTER') return selectedNode.clusterName || '-';
    if (selectedNode.nodeType === 'BRANCH') return selectedNode.branchName || '-';
    return '-';
  };

  return (
    <Card title={<Space size={8}><InfoCircleOutlined style={{ color: '#2563eb' }} />Details</Space>} bordered>
      <Descriptions size="small" column={1} bordered>
        <Descriptions.Item label="Node Type">
          {nodeTypeLabelMap[selectedNode.nodeType] || selectedNode.nodeType}
        </Descriptions.Item>
        <Descriptions.Item label="Code">{getDisplayCode()}</Descriptions.Item>
        <Descriptions.Item label="Name">{getDisplayName()}</Descriptions.Item>
        <Descriptions.Item label="Status">
          {typeof selectedNode.isActive === 'boolean' ? (
            <Tag color={selectedNode.isActive ? 'green' : 'default'}>
              {selectedNode.isActive ? 'Active' : 'Inactive'}
            </Tag>
          ) : (
            <Text type="secondary">N/A</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Created On">{formatDate(selectedNode.createdOn)}</Descriptions.Item>
      </Descriptions>

      <Space style={{ marginTop: 16 }} wrap>
        {canCreateCluster ? (
          <Button onClick={onCreateCluster} type="primary">
            Create Cluster
          </Button>
        ) : null}
        {canCreateBranch ? <Button onClick={onCreateBranch} type="default">Create Branch</Button> : null}
        {canEdit ? <Button onClick={onEdit} type="default">Edit</Button> : null}
        {canSplitCluster ? (
          <Button onClick={onSplitCluster} type="primary">
            Split Cluster
          </Button>
        ) : null}
        {canMoveBranch ? (
          <Button onClick={onMoveBranch} type="dashed">
            Move Branch
          </Button>
        ) : null}
        {canEdit ? (
          <Button danger={selectedNode.isActive} onClick={onToggleActive}>
            {selectedNode.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        ) : null}
      </Space>
    </Card>
  );
}
