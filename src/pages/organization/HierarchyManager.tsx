import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Modal,
  Row,
  Skeleton,
  Space,
  Statistic,
  Tabs,
  Tree,
  Typography,
  message,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApartmentOutlined,
  BankOutlined,
  ClusterOutlined,
  NodeIndexOutlined,
} from '@ant-design/icons';
import {
  useAssignBranchMutation,
  useCreateBranchMutation,
  useCreateClusterMutation,
  useCreateRegionMutation,
  useEditBranchMutation,
  useEditClusterMutation,
  useEditRegionMutation,
  useMoveBranchMutation,
  useSplitClusterMutation,
  useToggleMappingMutation,
} from './hierarchy/hooks/useHierarchyMutations';
import {
  useClustersQuery,
  useMappingsQuery,
  useRegionsQuery,
} from './hierarchy/hooks/useHierarchyQueries';
import useDebouncedValue from './hierarchy/hooks/useDebouncedValue';
import { buildHierarchyTreeData } from './hierarchy/utils/buildHierarchyTreeData';
import { getApiErrorMessage } from './hierarchy/utils/error';
import HierarchyDetailsCard from './hierarchy/components/HierarchyDetailsCard';
import MappingsTable from './hierarchy/components/MappingsTable';
import CreateRegionModal from './hierarchy/components/modals/CreateRegionModal';
import CreateClusterModal from './hierarchy/components/modals/CreateClusterModal';
import CreateBranchModal from './hierarchy/components/modals/CreateBranchModal';
import EditNodeModal from './hierarchy/components/modals/EditNodeModal';
import AssignMoveBranchModal from './hierarchy/components/modals/AssignMoveBranchModal';
import SplitClusterModal from './hierarchy/components/modals/SplitClusterModal';

const { Text } = Typography;

export default function HierarchyManager() {
  const [activeTab, setActiveTab] = useState('hierarchy');
  const [selectedTreeKeys, setSelectedTreeKeys] = useState<React.Key[]>([]);

  const [isCreateRegionOpen, setCreateRegionOpen] = useState(false);
  const [isCreateClusterOpen, setCreateClusterOpen] = useState(false);
  const [clusterRegionCode, setClusterRegionCode] = useState<string | undefined>(undefined);
  const [isCreateBranchOpen, setCreateBranchOpen] = useState(false);
  const [branchParentContext, setBranchParentContext] = useState<any>(null);
  const [isEditNodeOpen, setEditNodeOpen] = useState(false);
  const [isSplitClusterOpen, setSplitClusterOpen] = useState(false);
  const [splitClusterContext, setSplitClusterContext] = useState<any>(null);
  const [moveDialogState, setMoveDialogState] = useState({
    open: false,
    mode: 'move' as 'move' | 'assign',
    initialBranchCode: undefined as string | undefined,
    initialParent: null as any,
  });
  const [mappingFilters, setMappingFilters] = useState({
    regionCode: undefined as string | undefined,
    clusterCode: undefined as string | undefined,
    qBranch: '',
  });

  const debouncedBranchFilter = useDebouncedValue(mappingFilters.qBranch, 300);

  const regionsQuery = useRegionsQuery(true);
  const clustersQuery = useClustersQuery(undefined, true);
  const treeMappingsQuery = useMappingsQuery({ isActive: true }, true);
  const mappingsQuery = useMappingsQuery(
    {
      regionCode: mappingFilters.regionCode,
      clusterCode: mappingFilters.clusterCode,
      qBranch: debouncedBranchFilter,
    },
    true
  );

  const createRegionMutation = useCreateRegionMutation();
  const createClusterMutation = useCreateClusterMutation();
  const createBranchMutation = useCreateBranchMutation();
  const assignBranchMutation = useAssignBranchMutation();
  const editRegionMutation = useEditRegionMutation();
  const editClusterMutation = useEditClusterMutation();
  const editBranchMutation = useEditBranchMutation();
  const moveBranchMutation = useMoveBranchMutation();
  const toggleMappingMutation = useToggleMappingMutation();
  const splitClusterMutation = useSplitClusterMutation();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      regionsQuery.refetch(),
      clustersQuery.refetch(),
      treeMappingsQuery.refetch(),
      mappingsQuery.refetch(),
    ]);
  }, [regionsQuery, clustersQuery, treeMappingsQuery, mappingsQuery]);

  const hierarchyData = useMemo(
    () => buildHierarchyTreeData(regionsQuery.data || [], clustersQuery.data || [], treeMappingsQuery.data || []),
    [regionsQuery.data, clustersQuery.data, treeMappingsQuery.data]
  );

  const hierarchySummary = useMemo(() => {
    const regionsCount = (regionsQuery.data || []).length;
    const clustersCount = (clustersQuery.data || []).length;
    const activeMappings = (treeMappingsQuery.data || []).filter((item: any) => item.isActive);
    const branchCount = new Set(activeMappings.map((item: any) => item.branchCode)).size;
    const directCount = activeMappings.filter((item: any) => item.mappingType === 'DIRECT_REGION').length;
    return { regionsCount, clustersCount, branchCount, directCount };
  }, [regionsQuery.data, clustersQuery.data, treeMappingsQuery.data]);

  const selectedNode = useMemo(() => {
    if (!selectedTreeKeys.length) return null;
    return hierarchyData.nodeByKey[String(selectedTreeKeys[0])] || null;
  }, [selectedTreeKeys, hierarchyData.nodeByKey]);

  useEffect(() => {
    if (!selectedTreeKeys.length) return;
    const selectedKey = String(selectedTreeKeys[0]);
    if (!hierarchyData.nodeByKey[selectedKey]) setSelectedTreeKeys([]);
  }, [selectedTreeKeys, hierarchyData.nodeByKey]);

  const openCreateClusterForSelectedRegion = () => {
    if (!selectedNode || selectedNode.nodeType !== 'REGION') return;
    setClusterRegionCode(selectedNode.regionCode);
    setCreateClusterOpen(true);
  };

  const openCreateBranchForSelectedParent = () => {
    if (!selectedNode) return;
    if (selectedNode.nodeType === 'REGION') {
      setBranchParentContext({ parentType: 'REGION_DIRECT', regionCode: selectedNode.regionCode, regionName: selectedNode.regionName });
      setCreateBranchOpen(true);
      return;
    }
    if (selectedNode.nodeType === 'CLUSTER') {
      setBranchParentContext({ parentType: 'CLUSTER', clusterCode: selectedNode.clusterCode, clusterName: selectedNode.clusterName, regionCode: selectedNode.regionCode });
      setCreateBranchOpen(true);
    }
  };

  const openMoveForBranch = (branchNode: any) => {
    if (!branchNode || branchNode.nodeType !== 'BRANCH') return;
    setMoveDialogState({
      open: true,
      mode: 'move',
      initialBranchCode: branchNode.branchCode,
      initialParent: {
        parentType: branchNode.mappingType === 'CLUSTER' ? 'CLUSTER' : 'REGION_DIRECT',
        clusterCode: branchNode.clusterCode || undefined,
        regionCode: branchNode.regionCode,
      },
    });
  };

  const openMoveForMappingRow = (row: any) => {
    setMoveDialogState({
      open: true,
      mode: 'move',
      initialBranchCode: row.branchCode,
      initialParent: {
        parentType: row.mappingType === 'CLUSTER' ? 'CLUSTER' : 'REGION_DIRECT',
        clusterCode: row.clusterCode || undefined,
        regionCode: row.regionCode,
      },
    });
  };

  const handleCreateRegion = async (payload: any) => {
    await createRegionMutation.mutateAsync(payload);
    message.success('Region created successfully');
    setCreateRegionOpen(false);
    await refreshAll();
  };

  const handleCreateCluster = async (payload: any) => {
    await createClusterMutation.mutateAsync(payload);
    message.success('Cluster created successfully');
    setCreateClusterOpen(false);
    setClusterRegionCode(undefined);
    await refreshAll();
  };

  const handleCreateBranch = async (payload: any) => {
    if (!branchParentContext) {
      message.warning('Select a parent region or cluster before mapping a branch');
      return;
    }

    if (payload.mode === 'CUSTOM') {
      const createdBranch = await createBranchMutation.mutateAsync({
        branchCode: payload.branchCode,
        branchName: payload.branchName,
        isActive: payload.isActive,
      });

      try {
        await assignBranchMutation.mutateAsync({
          branchCode: createdBranch?.branchCode || payload.branchCode,
          parentType: branchParentContext.parentType,
          clusterCode: branchParentContext.parentType === 'CLUSTER' ? branchParentContext.clusterCode : undefined,
          regionCode: branchParentContext.parentType === 'REGION_DIRECT' ? branchParentContext.regionCode : undefined,
        });
        message.success('Branch created and mapped successfully');
      } catch (mappingError) {
        message.warning(`Branch created, but mapping failed: ${getApiErrorMessage(mappingError, 'Unable to map branch')}`);
      }
    } else {
      await assignBranchMutation.mutateAsync({
        branchCode: payload.branchCode,
        parentType: branchParentContext.parentType,
        clusterCode: branchParentContext.parentType === 'CLUSTER' ? branchParentContext.clusterCode : undefined,
        regionCode: branchParentContext.parentType === 'REGION_DIRECT' ? branchParentContext.regionCode : undefined,
      });
      message.success('Branch mapped successfully');
    }

    setCreateBranchOpen(false);
    setBranchParentContext(null);
    await refreshAll();
  };

  const handleEditNode = async (values: any) => {
    if (!selectedNode) return;
    if (selectedNode.nodeType === 'REGION') {
      await editRegionMutation.mutateAsync({ code: selectedNode.regionCode, regionCode: values.code, regionName: values.name, isActive: values.isActive });
    }
    if (selectedNode.nodeType === 'CLUSTER') {
      await editClusterMutation.mutateAsync({ code: selectedNode.clusterCode, clusterCode: values.code, clusterName: values.name, isActive: values.isActive });
    }
    if (selectedNode.nodeType === 'BRANCH') {
      await editBranchMutation.mutateAsync({ code: selectedNode.branchCode, branchCode: values.code, branchName: values.name, isActive: values.isActive });
    }
    message.success('Record updated successfully');
    setEditNodeOpen(false);
    await refreshAll();
  };

  const handleToggleSelectedNodeStatus = () => {
    if (!selectedNode || !['REGION', 'CLUSTER', 'BRANCH'].includes(selectedNode.nodeType)) return;
    const nextActive = !selectedNode.isActive;
    const targetLabel =
      selectedNode.nodeType === 'BRANCH'
        ? selectedNode.branchName || selectedNode.branchCode
        : selectedNode.nodeType === 'CLUSTER'
          ? selectedNode.clusterName || selectedNode.clusterCode
          : selectedNode.regionName || selectedNode.regionCode;

    Modal.confirm({
      title: `${nextActive ? 'Activate' : 'Deactivate'} ${targetLabel}?`,
      onOk: async () => {
        try {
          if (selectedNode.nodeType === 'REGION') {
            await editRegionMutation.mutateAsync({ code: selectedNode.regionCode, regionName: selectedNode.regionName, regionCode: selectedNode.regionCode, isActive: nextActive });
          }
          if (selectedNode.nodeType === 'CLUSTER') {
            await editClusterMutation.mutateAsync({ code: selectedNode.clusterCode, clusterName: selectedNode.clusterName, clusterCode: selectedNode.clusterCode, isActive: nextActive });
          }
          if (selectedNode.nodeType === 'BRANCH') {
            await editBranchMutation.mutateAsync({ code: selectedNode.branchCode, branchName: selectedNode.branchName, branchCode: selectedNode.branchCode, isActive: nextActive });
          }
          message.success(`Status updated to ${nextActive ? 'Active' : 'Inactive'}`);
          await refreshAll();
        } catch (error) {
          message.error(getApiErrorMessage(error, 'Unable to update status'));
        }
      },
    });
  };

  const handleMoveBranch = async (payload: any) => {
    await moveBranchMutation.mutateAsync(payload);
    message.success('Branch mapping updated successfully');
    setMoveDialogState({ open: false, mode: 'move', initialBranchCode: undefined, initialParent: null });
    await refreshAll();
  };

  const openSplitCluster = () => {
    if (!selectedNode || selectedNode.nodeType !== 'CLUSTER') return;
    const clusterBranches = treeMappingsQuery.data?.filter((mapping: any) => mapping.clusterCode === selectedNode.clusterCode) || [];
    setSplitClusterContext({ cluster: selectedNode, branches: clusterBranches });
    setSplitClusterOpen(true);
  };

  const handleSplitCluster = async (payload: any) => {
    if (!selectedNode || selectedNode.nodeType !== 'CLUSTER') return;
    await splitClusterMutation.mutateAsync({ clusterCode: selectedNode.clusterCode, ...payload });
    message.success('Cluster split successfully');
    setSplitClusterOpen(false);
    setSplitClusterContext(null);
    await refreshAll();
  };

  const handleToggleMappingStatus = async (row: any, isActive: boolean) => {
    try {
      await toggleMappingMutation.mutateAsync({
        mappingType: row.mappingType,
        branchCode: row.branchCode,
        regionCode: row.mappingType === 'DIRECT_REGION' ? row.regionCode : undefined,
        clusterCode: row.mappingType === 'CLUSTER' ? row.clusterCode : undefined,
        isActive,
      });
      message.success(`Mapping ${isActive ? 'activated' : 'deactivated'} successfully`);
      await refreshAll();
    } catch (error) {
      message.error(getApiErrorMessage(error, 'Unable to update mapping status'));
    }
  };

  const isTreeLoading = regionsQuery.loading || clustersQuery.loading || treeMappingsQuery.loading;
  const hierarchyError = regionsQuery.error || clustersQuery.error || treeMappingsQuery.error;

  return (
    <>
      <div className="ui-page">
      <div className="ui-sticky-toolbar">
      <Card
        className="pro-card-gradient"
        extra={
          <Space>
            <Button type="primary" onClick={() => setCreateRegionOpen(true)}>
              Create Region
            </Button>
            <Button onClick={() => void refreshAll()}>Refresh</Button>
          </Space>
        }
      >
        <div className="hierarchy-soft-panel" style={{ padding: 14, marginBottom: 14 }}>
          <Space direction="vertical" size={2}>
            <Space>
              <NodeIndexOutlined style={{ color: '#2563eb' }} />
              <Text strong style={{ color: '#1e3a8a', fontSize: 15 }}>Organization Hierarchy</Text>
            </Space>
            <Text type="secondary">Manage region, cluster and branch structure with smooth navigation and mapping controls.</Text>
          </Space>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          destroyInactiveTabPane
          items={[
            { key: 'hierarchy', label: 'Hierarchy' },
            { key: 'mappings', label: 'Mappings' },
          ]}
        />

        {activeTab === 'hierarchy' ? (
          <>
            {hierarchyError ? (
              <Alert style={{ marginBottom: 12 }} type="error" showIcon message={getApiErrorMessage(hierarchyError, 'Failed to load hierarchy')} />
            ) : null}

            <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} lg={6}><Card className="pro-card-gradient stat-card-region" bordered={false}><Statistic title={<Space size={6}><ApartmentOutlined />Regions</Space>} value={hierarchySummary.regionsCount} /></Card></Col>
              <Col xs={24} sm={12} lg={6}><Card className="pro-card-gradient stat-card-cluster" bordered={false}><Statistic title={<Space size={6}><ClusterOutlined />Clusters</Space>} value={hierarchySummary.clustersCount} /></Card></Col>
              <Col xs={24} sm={12} lg={6}><Card className="pro-card-gradient stat-card-branch" bordered={false}><Statistic title={<Space size={6}><BankOutlined />Mapped Branches</Space>} value={hierarchySummary.branchCount} /></Card></Col>
              <Col xs={24} sm={12} lg={6}><Card className="pro-card-gradient stat-card-direct" bordered={false}><Statistic title={<Space size={6}><Badge color="#2563eb" />Direct Branch Mappings</Space>} value={hierarchySummary.directCount} /></Card></Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={14} lg={14}>
                <Card className="pro-card-gradient hierarchy-tree-card" title={<Space size={8}><NodeIndexOutlined style={{ color: '#2563eb' }} />Hierarchy Tree</Space>} bordered>
                  {isTreeLoading ? (
                    <Skeleton active paragraph={{ rows: 8 }} />
                  ) : hierarchyData.treeData.length ? (
                    <div className="tree-scroll-pane">
                      <div className="hierarchy-legend">
                        <span className="h-legend h-legend-region">Region</span>
                        <span className="h-legend h-legend-cluster">Cluster</span>
                        <span className="h-legend h-legend-branch">Branch</span>
                        <span className="h-legend h-legend-direct">Direct</span>
                      </div>
                      <Tree
                        blockNode
                        defaultExpandAll
                        treeData={hierarchyData.treeData}
                        selectedKeys={selectedTreeKeys}
                        onSelect={(keys) => setSelectedTreeKeys(keys)}
                      />
                    </div>
                  ) : (
                    <Empty description="No hierarchy data found" />
                  )}
                </Card>
              </Col>

              <Col xs={24} md={10} lg={10}>
                <div className="ui-sticky-toolbar" style={{ top: 84 }}>
                  <div className="hierarchy-details-card">
                    <HierarchyDetailsCard
                      selectedNode={selectedNode}
                      onCreateCluster={openCreateClusterForSelectedRegion}
                      onCreateBranch={openCreateBranchForSelectedParent}
                      onEdit={() => setEditNodeOpen(true)}
                      onSplitCluster={openSplitCluster}
                      onMoveBranch={() => openMoveForBranch(selectedNode)}
                      onToggleActive={handleToggleSelectedNodeStatus}
                    />
                  </div>
                </div>

                <Text type="secondary" style={{ marginTop: 12, display: 'block' }}>
                  Branch nodes reflect active mapping locations. Use Move Branch to reassign.
                </Text>
              </Col>
            </Row>
          </>
        ) : (
          <>
            {mappingsQuery.error ? (
              <Alert style={{ marginBottom: 12 }} type="error" showIcon message={getApiErrorMessage(mappingsQuery.error, 'Failed to load mappings')} />
            ) : null}
            <MappingsTable
              regions={regionsQuery.data || []}
              clusters={clustersQuery.data || []}
              filters={mappingFilters}
              onFiltersChange={setMappingFilters}
              onRefresh={() => void mappingsQuery.refetch()}
              loading={mappingsQuery.loading}
              data={mappingsQuery.data || []}
              onEdit={openMoveForMappingRow}
              onToggleStatus={handleToggleMappingStatus}
            />
          </>
        )}
      </Card>
      </div>
      </div>

      <CreateRegionModal open={isCreateRegionOpen} onCancel={() => setCreateRegionOpen(false)} onSubmit={handleCreateRegion} />
      <CreateClusterModal
        open={isCreateClusterOpen}
        onCancel={() => {
          setCreateClusterOpen(false);
          setClusterRegionCode(undefined);
        }}
        onSubmit={handleCreateCluster}
        regions={regionsQuery.data || []}
        defaultRegionCode={clusterRegionCode}
      />
      <CreateBranchModal
        open={isCreateBranchOpen}
        onCancel={() => {
          setCreateBranchOpen(false);
          setBranchParentContext(null);
        }}
        onSubmit={handleCreateBranch}
        parentContext={branchParentContext}
      />
      <EditNodeModal open={isEditNodeOpen} onCancel={() => setEditNodeOpen(false)} onSubmit={handleEditNode} node={selectedNode} />
      <AssignMoveBranchModal
        open={moveDialogState.open}
        onCancel={() => setMoveDialogState({ open: false, mode: 'move', initialBranchCode: undefined, initialParent: null })}
        onSubmit={handleMoveBranch}
        mode={moveDialogState.mode}
        initialBranchCode={moveDialogState.initialBranchCode}
        initialParent={moveDialogState.initialParent}
        regions={regionsQuery.data || []}
        clusters={clustersQuery.data || []}
      />
      <SplitClusterModal
        visible={isSplitClusterOpen}
        onCancel={() => {
          setSplitClusterOpen(false);
          setSplitClusterContext(null);
        }}
        onSubmit={handleSplitCluster}
        loading={splitClusterMutation.loading}
        error={splitClusterMutation.error}
        sourceCluster={splitClusterContext?.cluster}
        clusterBranches={splitClusterContext?.branches || []}
      />
    </>
  );
}
