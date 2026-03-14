import { Alert, Button, Checkbox, Col, Form, Input, Modal, Row, Space, Tag, Typography } from 'antd';
import { SplitCellsOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

const { Text, Title } = Typography;

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
  loading: boolean;
  error: any;
  sourceCluster: any;
  clusterBranches: any[];
};

export default function SplitClusterModal({ visible, onCancel, onSubmit, loading, error, sourceCluster, clusterBranches }: Props) {
  const [form] = Form.useForm();
  const [branchAssignments, setBranchAssignments] = useState<Record<string, 1 | 2>>({});
  const [deactivateOriginal, setDeactivateOriginal] = useState(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setBranchAssignments({});
      setDeactivateOriginal(false);
    }
  }, [visible, form]);

  const handleBranchAssignment = (branchCode: string, targetCluster: 1 | 2): void => {
    setBranchAssignments((prev) => {
      const next = { ...prev };
      if (next[branchCode] === targetCluster) {
        delete next[branchCode];
      } else {
        next[branchCode] = targetCluster;
      }
      return next;
    });
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    const cluster1Branches: string[] = [];
    const cluster2Branches: string[] = [];

    Object.entries(branchAssignments).forEach(([branchCode, target]) => {
      if (target === 1) cluster1Branches.push(branchCode);
      if (target === 2) cluster2Branches.push(branchCode);
    });

    if (cluster1Branches.length === 0 || cluster2Branches.length === 0) {
      Modal.warning({
        title: 'Assignment Required',
        content: 'Please assign at least one branch to each new cluster.',
      });
      return;
    }

    await onSubmit({
      newClusters: [
        { code: values.cluster1Code, name: values.cluster1Name, branchCodes: cluster1Branches },
        { code: values.cluster2Code, name: values.cluster2Name, branchCodes: cluster2Branches },
      ],
      deactivateOriginal,
    });
  };

  const cluster1Count = Object.values(branchAssignments).filter((v) => v === 1).length;
  const cluster2Count = Object.values(branchAssignments).filter((v) => v === 2).length;

  return (
    <Modal
      title={<Space><SplitCellsOutlined /><span>Split Cluster</span></Space>}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>Cancel</Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleOk}>Split Cluster</Button>,
      ]}
      width={1000}
    >
      {error ? <Alert type="error" message="Failed to split cluster" description={error?.message || 'An error occurred'} showIcon style={{ marginBottom: 16 }} /> : null}

      <Alert
        type="info"
        message="Split Cluster Operation"
        description={`You are splitting cluster "${sourceCluster?.clusterName}" (${sourceCluster?.clusterCode}) into two new clusters.`}
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Form form={form} layout="vertical">
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <Title level={5}>New Cluster 1</Title>
            <Form.Item name="cluster1Code" label="Cluster Code" rules={[{ required: true, message: 'Please enter cluster code' }]}>
              <Input placeholder="e.g., E_CLUSTER" />
            </Form.Item>
            <Form.Item name="cluster1Name" label="Cluster Name" rules={[{ required: true, message: 'Please enter cluster name' }]}>
              <Input placeholder="e.g., East Cluster" />
            </Form.Item>
            <Tag color="blue">{cluster1Count} branches assigned</Tag>
          </div>

          <div style={{ flex: 1 }}>
            <Title level={5}>New Cluster 2</Title>
            <Form.Item name="cluster2Code" label="Cluster Code" rules={[{ required: true, message: 'Please enter cluster code' }]}>
              <Input placeholder="e.g., W_CLUSTER" />
            </Form.Item>
            <Form.Item name="cluster2Name" label="Cluster Name" rules={[{ required: true, message: 'Please enter cluster name' }]}>
              <Input placeholder="e.g., West Cluster" />
            </Form.Item>
            <Tag color="green">{cluster2Count} branches assigned</Tag>
          </div>
        </div>

        <Checkbox checked={deactivateOriginal} onChange={(e) => setDeactivateOriginal(e.target.checked)} style={{ marginBottom: 16 }}>
          Deactivate original cluster after split
        </Checkbox>

        <Title level={5}>Assign Branches to New Clusters</Title>
        <Row gutter={[12, 12]}>
          {clusterBranches.map((branch) => (
            <Col xs={24} md={12} lg={8} key={branch.branchCode}>
              <div style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>{branch.branchName}</Text>
                  <br />
                  <Text type="secondary">{branch.branchCode}</Text>
                </div>
                <Space>
                  <Button type={branchAssignments[branch.branchCode] === 1 ? 'primary' : 'default'} onClick={() => handleBranchAssignment(branch.branchCode, 1)}>
                    Cluster 1
                  </Button>
                  <Button type={branchAssignments[branch.branchCode] === 2 ? 'primary' : 'default'} onClick={() => handleBranchAssignment(branch.branchCode, 2)}>
                    Cluster 2
                  </Button>
                </Space>
              </div>
            </Col>
          ))}
        </Row>
      </Form>
    </Modal>
  );
}
