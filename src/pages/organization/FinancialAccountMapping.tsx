import {
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tree,
  Typography,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  NodeIndexOutlined,
  PlusOutlined,
  ProfileOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createFinancialChild,
  createFinancialRoot,
  createFtbMapping,
  deleteFinancialAccount,
  getCoreFtbAccounts,
  getFinancialAccountTree,
  getFinancialAccounts,
  toggleFtbMappingStatus,
  updateFinancialAccount,
  updateFtbMapping,
} from '../../services/financialApi';

const { Text } = Typography;
const { Option } = Select;

const parseLastSegmentNumber = (code?: string): number => {
  if (!code) return 0;
  const part = String(code).split('.').pop();
  const parsed = Number.parseInt(part || '0', 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const buildNodeIndex = (nodes: any[], acc: Record<string, any> = {}): Record<string, any> => {
  nodes.forEach((node) => {
    acc[node.accountCode] = node;
    if (Array.isArray(node.children) && node.children.length > 0) {
      buildNodeIndex(node.children, acc);
    }
  });
  return acc;
};

export default function FinancialAccountMapping() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('financial-hierarchy');
  const [treeNodes, setTreeNodes] = useState<any[]>([]);
  const [flatAccounts, setFlatAccounts] = useState<any[]>([]);
  const [nodeByCode, setNodeByCode] = useState<Record<string, any>>({});
  const [selectedAccountCode, setSelectedAccountCode] = useState<string | undefined>(undefined);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);

  const [coreAccounts, setCoreAccounts] = useState<any[]>([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [mappingSearch, setMappingSearch] = useState('');
  const [mappingStatusFilter, setMappingStatusFilter] = useState('all');
  const [sourceStatusFilter, setSourceStatusFilter] = useState('all');
  const [mappingPagination, setMappingPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [mainCodeOptions, setMainCodeOptions] = useState<any[]>([]);
  const [loadingMainCodeOptions, setLoadingMainCodeOptions] = useState(false);

  const [isRootModalOpen, setRootModalOpen] = useState(false);
  const [isChildModalOpen, setChildModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isMappingModalOpen, setMappingModalOpen] = useState(false);
  const [editingMappingRecord, setEditingMappingRecord] = useState<any>(null);
  const [selectedSourceRecord, setSelectedSourceRecord] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const [rootForm] = Form.useForm();
  const [childForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [mappingForm] = Form.useForm();

  const selectedNode = selectedAccountCode ? nodeByCode[selectedAccountCode] : null;

  const treeData = useMemo(() => {
    const toTree = (nodes: any[]): any[] =>
      (nodes || []).map((node) => ({
        key: node.accountCode,
        title: (
          <Space size={8}>
            <Text strong>{node.nodeName}</Text>
            <Text type="secondary">{node.accountCode}</Text>
            {node.mappingCount > 0 ? <Tag color="cyan">{node.mappingCount} mapped</Tag> : null}
          </Space>
        ),
        children: toTree(node.children || []),
      }));
    return toTree(treeNodes);
  }, [treeNodes]);

  const nextRootCodePreview = useMemo(() => {
    const roots = flatAccounts.filter((item) => !item.parentAccountCode);
    const maxRoot = roots.reduce((max, item) => {
      const rootSegment = Number.parseInt(String(item.accountCode).split('.')[0] || '0', 10);
      if (Number.isNaN(rootSegment)) return max;
      return Math.max(max, rootSegment);
    }, 0);
    return String(maxRoot + 1);
  }, [flatAccounts]);

  const nextChildCodePreview = useMemo(() => {
    if (!selectedNode) return '-';
    const children = flatAccounts.filter((item) => item.parentAccountCode === selectedNode.accountCode);
    const maxChild = children.reduce((max, item) => Math.max(max, parseLastSegmentNumber(item.accountCode)), 0);
    return `${selectedNode.accountCode}.${maxChild + 1}`;
  }, [flatAccounts, selectedNode]);

  const fetchHierarchy = useCallback(async () => {
    setLoadingHierarchy(true);
    try {
      const [tree, flat] = await Promise.all([getFinancialAccountTree(), getFinancialAccounts()]);
      setTreeNodes(tree || []);
      setFlatAccounts(flat || []);
      setNodeByCode(buildNodeIndex(tree || []));
    } catch {
      message.error('Failed to load financial hierarchy');
    } finally {
      setLoadingHierarchy(false);
    }
  }, []);

  const fetchMappingData = useCallback(async (params: Record<string, any> = {}) => {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const q = params.q ?? '';
    const mappingStatus = params.mappingStatus ?? 'all';
    const sourceStatus = params.sourceStatus ?? 'all';

    setLoadingMappings(true);
    try {
      const response = await getCoreFtbAccounts({
        q: q || undefined,
        page,
        pageSize,
        mappingStatus: mappingStatus === 'all' ? undefined : mappingStatus,
        isActive: sourceStatus === 'all' ? undefined : sourceStatus === 'active',
      });
      setCoreAccounts(response?.items || []);
      setMappingPagination({
        current: response?.pagination?.page || page,
        pageSize: response?.pagination?.pageSize || pageSize,
        total: response?.pagination?.total || 0,
      });
    } catch {
      message.error('Failed to load mapping data');
    } finally {
      setLoadingMappings(false);
    }
  }, []);

  const loadUnmappedMainCodeOptions = useCallback(async (q = '') => {
    setLoadingMainCodeOptions(true);
    try {
      const response = await getCoreFtbAccounts({ q: q || undefined, unmappedOnly: true, page: 1, pageSize: 50 });
      setMainCodeOptions(response?.items || []);
    } catch {
      message.error('Failed to load MainCode options');
    } finally {
      setLoadingMainCodeOptions(false);
    }
  }, []);

  useEffect(() => {
    void fetchHierarchy();
    void fetchMappingData({ page: 1, pageSize: 20, q: '', mappingStatus: 'all', sourceStatus: 'all' });
  }, [fetchHierarchy, fetchMappingData]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab === 'maincode-mapping' || tab === 'financial-hierarchy') {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!selectedNode) return;
    editForm.setFieldsValue({ nodeName: selectedNode.nodeName, accountType: selectedNode.accountType || undefined });
  }, [selectedNode, editForm]);

  const handleCreateRoot = async (values: any) => {
    setSaving(true);
    try {
      await createFinancialRoot({ accountType: values.accountType?.trim(), broadAccountHead: values.broadAccountHead?.trim() });
      message.success('Root account created');
      setRootModalOpen(false);
      rootForm.resetFields();
      await fetchHierarchy();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Unable to create root account');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChild = async (values: any) => {
    if (!selectedNode) {
      message.warning('Select a parent node first');
      return;
    }
    setSaving(true);
    try {
      await createFinancialChild(selectedNode.accountCode, { nodeName: values.nodeName?.trim() });
      message.success('Child account created');
      setChildModalOpen(false);
      childForm.resetFields();
      await fetchHierarchy();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Unable to create child account');
    } finally {
      setSaving(false);
    }
  };

  const handleEditNode = async (values: any) => {
    if (!selectedNode) {
      message.warning('Select an account node first');
      return;
    }
    setSaving(true);
    try {
      await updateFinancialAccount(selectedNode.accountCode, { nodeName: values.nodeName?.trim(), accountType: values.accountType?.trim() || undefined });
      message.success('Account updated');
      setEditModalOpen(false);
      await fetchHierarchy();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Unable to update account');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNode = async () => {
    if (!selectedNode) return;
    setSaving(true);
    try {
      await deleteFinancialAccount(selectedNode.accountCode);
      message.success('Account deleted');
      setSelectedAccountCode(undefined);
      await fetchHierarchy();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Unable to delete account');
    } finally {
      setSaving(false);
    }
  };

  const openCreateMappingModal = () => {
    setEditingMappingRecord(null);
    setSelectedSourceRecord(null);
    void loadUnmappedMainCodeOptions();
    mappingForm.setFieldsValue({ mainCode: undefined, accountCode: undefined, isActive: true });
    setMappingModalOpen(true);
  };

  const openCreateMappingFromSource = (record: any) => {
    setEditingMappingRecord(null);
    setSelectedSourceRecord(record);
    mappingForm.setFieldsValue({ mainCode: record.mainCode, accountCode: undefined, isActive: true });
    setMappingModalOpen(true);
  };

  const openEditMappingModal = (record: any) => {
    setEditingMappingRecord(record.mapping);
    setSelectedSourceRecord(record);
    mappingForm.setFieldsValue({
      mainCode: record.mainCode,
      accountCode: record.mapping?.accountCode,
      isActive: record.mapping?.isActive ?? true,
    });
    setMappingModalOpen(true);
  };

  const handleSaveMapping = async (values: any) => {
    const mainCode = (selectedSourceRecord?.mainCode || values.mainCode || '').trim();
    if (!mainCode) {
      message.warning('MainCode is required');
      return;
    }

    setSaving(true);
    try {
      if (editingMappingRecord) {
        await updateFtbMapping(mainCode, { accountCode: values.accountCode, isActive: !!values.isActive });
        message.success('Mapping updated');
      } else {
        await createFtbMapping({ mainCode, accountCode: values.accountCode, isActive: !!values.isActive });
        message.success('Mapping created');
      }

      setMappingModalOpen(false);
      setSelectedSourceRecord(null);
      mappingForm.resetFields();
      await fetchMappingData({
        page: mappingPagination.current,
        pageSize: mappingPagination.pageSize,
        q: mappingSearch,
        mappingStatus: mappingStatusFilter,
        sourceStatus: sourceStatusFilter,
      });
      await fetchHierarchy();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Unable to save mapping');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMapping = async (record: any, isActive: boolean) => {
    try {
      await toggleFtbMappingStatus(record.mainCode, { isActive });
      message.success(`Mapping ${isActive ? 'activated' : 'deactivated'}`);
      await fetchMappingData({
        page: mappingPagination.current,
        pageSize: mappingPagination.pageSize,
        q: mappingSearch,
        mappingStatus: mappingStatusFilter,
        sourceStatus: sourceStatusFilter,
      });
      await fetchHierarchy();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Unable to update mapping status');
    }
  };

  const getFinancialPath = useCallback((accountCode?: string): string => {
    if (!accountCode || !nodeByCode[accountCode]) return '-';
    const path: string[] = [];
    let cursor = nodeByCode[accountCode];
    while (cursor) {
      path.unshift(cursor.nodeName);
      if (!cursor.parentAccountCode) break;
      cursor = nodeByCode[cursor.parentAccountCode];
    }
    return path.join(' > ');
  }, [nodeByCode]);

  const mappingRows = useMemo(() => {
    return (coreAccounts || []).map((item) => {
      const mapping = item.mapping || null;
      let mappingStatus = 'Unmapped';
      if (mapping) mappingStatus = mapping.isActive ? 'Mapped' : 'Inactive Mapping';
      return {
        key: item.mainCode,
        mainCode: item.mainCode,
        sourceAccountName: item.accountName,
        sourceIsActive: item.isActive,
        mapping,
        mappingStatus,
        accountCode: mapping?.accountCode || null,
        accountNodeName: mapping?.accountNodeName || (mapping?.accountCode ? nodeByCode[mapping.accountCode]?.nodeName : null) || null,
        financialPath: mapping?.accountCode ? getFinancialPath(mapping.accountCode) : '-',
      };
    });
  }, [coreAccounts, getFinancialPath, nodeByCode]);

  const mappingColumns = [
    {
      title: 'MainCode',
      dataIndex: 'mainCode',
      key: 'mainCode',
      width: 260,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: 'Source Account',
      dataIndex: 'sourceAccountName',
      key: 'sourceAccountName',
      width: 260,
      render: (v: string) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Source Status',
      dataIndex: 'sourceIsActive',
      key: 'sourceIsActive',
      width: 130,
      render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Active' : 'Inactive'}</Tag>,
    },
    {
      title: 'Mapped AccountCode',
      dataIndex: 'accountCode',
      key: 'accountCode',
      width: 160,
      render: (v: string) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Mapped Node Name',
      dataIndex: 'accountNodeName',
      key: 'accountNodeName',
      width: 230,
      render: (v: string) => <Text>{v || '-'}</Text>,
    },
    {
      title: 'Financial Path',
      dataIndex: 'financialPath',
      key: 'financialPath',
      width: 320,
      ellipsis: { showTitle: true },
      render: (v: string) => <Text type="secondary">{v || '-'}</Text>,
    },
    {
      title: 'Mapping Status',
      dataIndex: 'mappingStatus',
      key: 'mappingStatus',
      width: 150,
      render: (v: string) => {
        if (v === 'Mapped') return <Tag color="green">Mapped</Tag>;
        if (v === 'Inactive Mapping') return <Tag>Inactive Mapping</Tag>;
        return <Tag color="orange">Unmapped</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      render: (_: any, record: any) => (
        <Space>
          {record.mapping ? (
            <Button size="small" onClick={() => openEditMappingModal(record)}>Remap</Button>
          ) : (
            <Button size="small" type="primary" onClick={() => openCreateMappingFromSource(record)}>Map</Button>
          )}
          {record.mapping ? (
            <Popconfirm
              title={record.mapping.isActive ? 'Deactivate this mapping?' : 'Activate this mapping?'}
              onConfirm={() => void handleToggleMapping(record, !record.mapping.isActive)}
            >
              <Button size="small" danger={record.mapping.isActive}>
                {record.mapping.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </Popconfirm>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Updated',
      key: 'updatedOn',
      width: 180,
      render: (_: any, record: any) => <Text type="secondary">{record.mapping?.updatedOn ? new Date(record.mapping.updatedOn).toLocaleString() : '-'}</Text>,
    },
  ];

  return (
    <div className="ui-page">
    <Card className="pro-card-gradient financial-mapping-shell" size="small">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarGutter={20}
        destroyInactiveTabPane
        items={[
          {
            key: 'financial-hierarchy',
            label: 'Financial Hierarchy',
            children: (
              <>
                <Space style={{ marginBottom: 16 }} wrap>
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => setRootModalOpen(true)}>Add Root</Button>
                  <Button icon={<PlusOutlined />} disabled={!selectedNode} onClick={() => setChildModalOpen(true)}>Add Child</Button>
                  <Button icon={<EditOutlined />} disabled={!selectedNode} onClick={() => setEditModalOpen(true)}>Edit</Button>
                  <Popconfirm title="Delete selected node?" description="Delete is blocked if children or mappings exist." onConfirm={() => void handleDeleteNode()} disabled={!selectedNode}>
                    <Button icon={<DeleteOutlined />} danger disabled={!selectedNode}>Delete</Button>
                  </Popconfirm>
                  <Button icon={<ReloadOutlined />} onClick={() => void fetchHierarchy()}>Refresh</Button>
                </Space>

                <Row gutter={[12, 12]}>
                  <Col xs={24} lg={14}>
                    <Card
                      size="small"
                      title={
                        <Space size={6}>
                          <NodeIndexOutlined />
                          <span>Hierarchy Tree</span>
                        </Space>
                      }
                      loading={loadingHierarchy}
                    >
                      {treeData.length ? (
                        <div className="tree-scroll-pane financial-tree-scroll-pane">
                          <Tree treeData={treeData} selectedKeys={selectedAccountCode ? [selectedAccountCode] : []} onSelect={(keys) => setSelectedAccountCode(String(keys?.[0] || ''))} defaultExpandAll />
                        </div>
                      ) : (
                        <Empty description="No financial accounts found" />
                      )}
                    </Card>
                  </Col>
                  <Col xs={24} lg={10}>
                    <Card
                      size="small"
                      title={
                        <Space size={6}>
                          <ProfileOutlined />
                          <span>Node Details</span>
                        </Space>
                      }
                    >
                      {selectedNode ? (
                        <Descriptions bordered size="small" column={1}>
                          <Descriptions.Item label="Node Name">{selectedNode.nodeName}</Descriptions.Item>
                          <Descriptions.Item label="Account Code">{selectedNode.accountCode}</Descriptions.Item>
                          <Descriptions.Item label="Parent Code">{selectedNode.parentAccountCode || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Level">{selectedNode.level}</Descriptions.Item>
                          <Descriptions.Item label="Account Type">{selectedNode.accountType || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Broad Head">{selectedNode.broadAccountHead || '-'}</Descriptions.Item>
                          <Descriptions.Item label="Active Mapping Count">{selectedNode.mappingCount || 0}</Descriptions.Item>
                          <Descriptions.Item label="Leaf Node"><Tag color={selectedNode.isLeaf ? 'green' : 'blue'}>{selectedNode.isLeaf ? 'Yes' : 'No'}</Tag></Descriptions.Item>
                        </Descriptions>
                      ) : (
                        <Empty description="Select a node to view details" />
                      )}
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: 'maincode-mapping',
            label: 'MainCode Mapping',
            children: (
              <>
                <Space style={{ marginBottom: 16 }} wrap>
                  <Input.Search
                    allowClear
                    placeholder="Search by MainCode or source account name"
                    onSearch={(value) => {
                      const nextValue = value || '';
                      setMappingSearch(nextValue);
                      void fetchMappingData({ page: 1, pageSize: mappingPagination.pageSize, q: nextValue, mappingStatus: mappingStatusFilter, sourceStatus: sourceStatusFilter });
                    }}
                    style={{ width: 'min(100%, 360px)' }}
                  />
                  <Select
                    value={mappingStatusFilter}
                    onChange={(value) => {
                      setMappingStatusFilter(value);
                      void fetchMappingData({ page: 1, pageSize: mappingPagination.pageSize, q: mappingSearch, mappingStatus: value, sourceStatus: sourceStatusFilter });
                    }}
                    style={{ width: 170 }}
                  >
                    <Option value="all">All Mappings</Option>
                    <Option value="mapped">Mapped</Option>
                    <Option value="unmapped">Unmapped</Option>
                    <Option value="inactive">Inactive Mapping</Option>
                  </Select>
                  <Select
                    value={sourceStatusFilter}
                    onChange={(value) => {
                      setSourceStatusFilter(value);
                      void fetchMappingData({ page: 1, pageSize: mappingPagination.pageSize, q: mappingSearch, mappingStatus: mappingStatusFilter, sourceStatus: value });
                    }}
                    style={{ width: 170 }}
                  >
                    <Option value="all">All Source</Option>
                    <Option value="active">Source Active</Option>
                    <Option value="inactive">Source Inactive</Option>
                  </Select>
                  <Button type="primary" icon={<LinkOutlined />} onClick={openCreateMappingModal}>Create Mapping</Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => void fetchMappingData({ page: mappingPagination.current, pageSize: mappingPagination.pageSize, q: mappingSearch, mappingStatus: mappingStatusFilter, sourceStatus: sourceStatusFilter })}
                  >
                    Refresh
                  </Button>
                </Space>

                <div className="table-scroll-pane">
                  <Table
                    className="pro-table"
                    rowKey={(record) => record.key}
                    columns={mappingColumns}
                    dataSource={mappingRows}
                    loading={loadingMappings}
                    sticky
                    pagination={{
                      current: mappingPagination.current,
                      pageSize: mappingPagination.pageSize,
                      total: mappingPagination.total,
                      showSizeChanger: true,
                      pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={(pagination) =>
                      void fetchMappingData({
                        page: pagination.current || 1,
                        pageSize: pagination.pageSize || mappingPagination.pageSize,
                        q: mappingSearch,
                        mappingStatus: mappingStatusFilter,
                        sourceStatus: sourceStatusFilter,
                      })
                    }
                    scroll={{ x: 1800 }}
                  />
                </div>
              </>
            ),
          },
        ]}
      />

      <Modal title="Add Root Financial Account" open={isRootModalOpen} onCancel={() => { setRootModalOpen(false); rootForm.resetFields(); }} onOk={() => rootForm.submit()} confirmLoading={saving}>
        <Form form={rootForm} layout="vertical" onFinish={(values) => void handleCreateRoot(values)}>
          <Form.Item label="Generated Code"><Input value={nextRootCodePreview} disabled /></Form.Item>
          <Form.Item name="accountType" label="Account Type" rules={[{ required: true, message: 'Account type is required' }]}><Input placeholder="Balance Sheet / ProfitLoss" /></Form.Item>
          <Form.Item name="broadAccountHead" label="Root Node Name / Broad Head" rules={[{ required: true, message: 'Root node name is required' }]}><Input placeholder="Assets / Liabilities / Income / Expense" /></Form.Item>
        </Form>
      </Modal>

      <Modal title="Add Child Financial Account" open={isChildModalOpen} onCancel={() => { setChildModalOpen(false); childForm.resetFields(); }} onOk={() => childForm.submit()} confirmLoading={saving}>
        {selectedNode ? (
          <Form form={childForm} layout="vertical" onFinish={(values) => void handleCreateChild(values)}>
            <Form.Item label="Parent Name"><Input value={selectedNode.nodeName} disabled /></Form.Item>
            <Form.Item label="Parent Code"><Input value={selectedNode.accountCode} disabled /></Form.Item>
            <Form.Item label="Generated Code Preview"><Input value={nextChildCodePreview} disabled /></Form.Item>
            <Form.Item name="nodeName" label="New Node Name" rules={[{ required: true, message: 'Node name is required' }]}><Input placeholder="Enter child node name" /></Form.Item>
          </Form>
        ) : (
          <Empty description="Select a parent node first" />
        )}
      </Modal>

      <Modal title="Edit Financial Account Node" open={isEditModalOpen} onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }} onOk={() => editForm.submit()} confirmLoading={saving}>
        {selectedNode ? (
          <Form form={editForm} layout="vertical" onFinish={(values) => void handleEditNode(values)}>
            <Form.Item label="Account Code"><Input value={selectedNode.accountCode} disabled /></Form.Item>
            <Form.Item name="nodeName" label="Node Name" rules={[{ required: true, message: 'Node name is required' }]}><Input placeholder="Update node name" /></Form.Item>
            {selectedNode.level === 1 ? <Form.Item name="accountType" label="Account Type (Root only)"><Input placeholder="Optional account type update" /></Form.Item> : null}
          </Form>
        ) : (
          <Empty description="Select a node to edit" />
        )}
      </Modal>

      <Modal
        title={editingMappingRecord ? 'Remap MainCode' : 'Create MainCode Mapping'}
        open={isMappingModalOpen}
        onCancel={() => {
          setMappingModalOpen(false);
          setEditingMappingRecord(null);
          setSelectedSourceRecord(null);
          mappingForm.resetFields();
        }}
        onOk={() => mappingForm.submit()}
        confirmLoading={saving}
      >
        <Form form={mappingForm} layout="vertical" onFinish={(values) => void handleSaveMapping(values)}>
          <Form.Item name="mainCode" label="MainCode" rules={[{ required: true, message: 'MainCode is required' }]}>
            <Select showSearch placeholder="Select MainCode" filterOption={false} onSearch={loadUnmappedMainCodeOptions} loading={loadingMainCodeOptions} disabled={!!editingMappingRecord || !!selectedSourceRecord}>
              {(selectedSourceRecord ? [selectedSourceRecord] : mainCodeOptions).map((item) => (
                <Option key={item.mainCode} value={item.mainCode}>{item.mainCode} - {item.accountName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="accountCode" label="Financial Account (Leaf)" rules={[{ required: true, message: 'Financial account is required' }]}>
            <Select showSearch optionFilterProp="children" placeholder="Select leaf node">
              {flatAccounts.filter((item) => item.isLeaf).map((item) => (
                <Option key={item.accountCode} value={item.accountCode}>{item.accountCode} - {getFinancialPath(item.accountCode)}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isActive" label="Mapping Active" valuePropName="checked"><Switch defaultChecked /></Form.Item>
        </Form>
      </Modal>
    </Card>
    </div>
  );
}
