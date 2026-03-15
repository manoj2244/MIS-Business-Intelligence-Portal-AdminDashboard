import { useEffect, useState, useCallback } from 'react';
import {
  Card, Form, Select, Button, Space, message, Tag, Row, Col,
  Descriptions, Spin, Typography, Empty, Checkbox,
} from 'antd';
import { UserOutlined, KeyOutlined, DatabaseOutlined } from '@ant-design/icons';
import { rbacApi } from '../../services/rbacApi';
import { getRegions, getClusters, getMappings } from '../../services/hierarchyApi';

const { Text } = Typography;
const { Option } = Select;

export default function UserAccessManagement() {
  const [form] = Form.useForm();

  // Data
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [mappings, setMappings] = useState<any[]>([]);

  // Selection state
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userAccess, setUserAccess] = useState<any>(null);
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  // Loading
  const [loading, setLoading] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
    fetchHierarchyData();
    fetchAllUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await rbacApi.getRoles();
      setRoles(data?.filter((r: any) => r.isActive) || []);
    } catch { message.error('Failed to fetch roles'); }
  };

  const fetchHierarchyData = async () => {
    try {
      const [regionsData, clustersData, mappingsData] = await Promise.all([
        getRegions(), getClusters(), getMappings({ isActive: true }),
      ]);
      setRegions(regionsData || []);
      setClusters(clustersData || []);
      setMappings(mappingsData || []);
    } catch { message.error('Failed to fetch hierarchy data'); }
  };

  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await rbacApi.getAllUsers();
      setAllUsers(data);
      setUsers(data);
    } catch { message.error('Failed to fetch users'); }
    finally { setUsersLoading(false); }
  };

  const searchUsers = (text: string) => {
    if (!text) { setUsers(allUsers); return; }
    setUsers(allUsers.filter(u =>
      u.name?.toLowerCase().includes(text.toLowerCase()) ||
      u.employeeId?.toLowerCase().includes(text.toLowerCase())
    ));
  };

  const getRoleCodeFromAccess = (accessData: any): string | undefined => {
    if (!accessData) return undefined;
    if (typeof accessData.userRole === 'string') return accessData.userRole;
    if (accessData.role?.code) return accessData.role.code;
    return undefined;
  };

  const getPermissionList = (accessData: any): string[] => {
    if (!Array.isArray(accessData?.permissions)) return [];
    return accessData.permissions.map((p: any) => (typeof p === 'string' ? p : p?.code)).filter(Boolean);
  };

  const getAllowedBranchesCount = (accessData: any): number => {
    if (Array.isArray(accessData?.allowedBranches)) return accessData.allowedBranches.length;
    if (Array.isArray(accessData?.dataAccess)) {
      return new Set(accessData.dataAccess.map((e: any) => e?.branchCode).filter(Boolean)).size;
    }
    return 0;
  };

  const buildCheckedKeysFromAccess = useCallback((accessData: any): string[] => {
    if (!Array.isArray(accessData?.dataAccess)) return [];
    const keys = new Set<string>();
    accessData.dataAccess.forEach((entry: any) => {
      if (entry?.regionCode) keys.add(`region:${entry.regionCode}`);
      if (entry?.clusterCode) keys.add(`cluster:${entry.clusterCode}`);
      if (entry?.branchCode) {
        mappings.filter(m => m?.isActive && m?.branchCode === entry.branchCode).forEach(m => {
          if (m.mappingType === 'CLUSTER' && m.clusterCode) keys.add(`branch:cluster:${m.clusterCode}:${m.branchCode}`);
          else if (m.mappingType === 'DIRECT_REGION' && m.regionCode) keys.add(`branch:direct:${m.regionCode}:${m.branchCode}`);
        });
      }
    });
    return Array.from(keys);
  }, [mappings]);

  const handleUserSelect = async (userCode: string) => {
    setSelectedUser(userCode);
    setCheckedKeys([]);
    setSelectedRegion(null);
    setSelectedCluster(null);
    setAccessLoading(true);
    try {
      const accessData = await rbacApi.getUserAccess(userCode);
      setUserAccess(accessData);
      form.setFieldsValue({ roleCode: getRoleCodeFromAccess(accessData) });
      setCheckedKeys(buildCheckedKeysFromAccess(accessData));
      // Auto-focus first region
      const firstCluster = accessData?.dataAccess?.find((e: any) => e?.clusterCode)?.clusterCode || null;
      const firstRegion = accessData?.dataAccess?.find((e: any) => e?.regionCode)?.regionCode ||
        (firstCluster ? clusters.find(c => c.clusterCode === firstCluster)?.regionCode : null) || null;
      setSelectedRegion(firstRegion);
      setSelectedCluster(firstCluster);
    } catch {
      message.warning('No access assigned for this user yet');
      setUserAccess(null);
    } finally { setAccessLoading(false); }
  };

  const handleAssignRole = async (values: any) => {
    if (!selectedUser) { message.warning('Please select a user first'); return; }
    setLoading(true);
    try {
      await rbacApi.assignRoleToUser(selectedUser, values.roleCode);
      message.success('Role assigned successfully');
      await rbacApi.clearUserCache(selectedUser);
      await handleUserSelect(selectedUser);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to assign role');
    } finally { setLoading(false); }
  };

  const getSelectedItems = () => {
    const selectedRegions: string[] = [];
    const selectedClusters: string[] = [];
    const selectedBranches: string[] = [];
    checkedKeys.forEach(key => {
      if (key.startsWith('region:')) selectedRegions.push(key.replace('region:', ''));
      else if (key.startsWith('cluster:')) selectedClusters.push(key.replace('cluster:', ''));
      else if (key.startsWith('branch:')) {
        const parts = key.split(':');
        selectedBranches.push(parts[parts.length - 1]);
      }
    });
    return { selectedRegions, selectedClusters, selectedBranches };
  };

  const handleAssignDataAccess = async () => {
    if (!selectedUser) { message.warning('Please select a user first'); return; }
    setLoading(true);
    try {
      const { selectedRegions, selectedClusters, selectedBranches } = getSelectedItems();
      const dataAccess: any[] = [
        ...selectedRegions.map(rc => ({ regionCode: rc })),
        ...selectedClusters.map(cc => ({ clusterCode: cc })),
        ...selectedBranches.map(bc => ({ branchCode: bc })),
      ];
      await rbacApi.assignDataAccessToUser(selectedUser, dataAccess);
      message.success('Data access assigned successfully');
      await rbacApi.clearUserCache(selectedUser);
      await handleUserSelect(selectedUser);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Failed to assign data access');
    } finally { setLoading(false); }
  };

  // ──────── Region checkbox logic ────────
  const toggleRegion = (region: any, checked: boolean) => {
    const regionKey = `region:${region.regionCode}`;
    const regionClusters = clusters.filter(c => c.regionCode === region.regionCode);
    if (checked) {
      const next = [...checkedKeys, regionKey];
      regionClusters.forEach(cluster => {
        const ck = `cluster:${cluster.clusterCode}`;
        if (!next.includes(ck)) next.push(ck);
        mappings.filter(m => m.mappingType === 'CLUSTER' && m.clusterCode === cluster.clusterCode && m.isActive)
          .forEach(m => { const bk = `branch:cluster:${cluster.clusterCode}:${m.branchCode}`; if (!next.includes(bk)) next.push(bk); });
      });
      mappings.filter(m => m.mappingType === 'DIRECT_REGION' && m.regionCode === region.regionCode && m.isActive)
        .forEach(m => { const bk = `branch:direct:${region.regionCode}:${m.branchCode}`; if (!next.includes(bk)) next.push(bk); });
      setCheckedKeys(next);
    } else {
      const toRemove = new Set<string>([regionKey]);
      regionClusters.forEach(cluster => {
        toRemove.add(`cluster:${cluster.clusterCode}`);
        mappings.filter(m => m.mappingType === 'CLUSTER' && m.clusterCode === cluster.clusterCode && m.isActive)
          .forEach(m => toRemove.add(`branch:cluster:${cluster.clusterCode}:${m.branchCode}`));
      });
      mappings.filter(m => m.mappingType === 'DIRECT_REGION' && m.regionCode === region.regionCode && m.isActive)
        .forEach(m => toRemove.add(`branch:direct:${region.regionCode}:${m.branchCode}`));
      setCheckedKeys(checkedKeys.filter(k => !toRemove.has(k)));
    }
  };

  const toggleCluster = (cluster: any, checked: boolean) => {
    const clusterKey = `cluster:${cluster.clusterCode}`;
    const clusterBranches = mappings.filter(m => m.mappingType === 'CLUSTER' && m.clusterCode === cluster.clusterCode && m.isActive);
    if (checked) {
      const next = [...checkedKeys, clusterKey];
      clusterBranches.forEach(m => { const bk = `branch:cluster:${cluster.clusterCode}:${m.branchCode}`; if (!next.includes(bk)) next.push(bk); });
      setCheckedKeys(next);
    } else {
      const toRemove = new Set<string>([clusterKey]);
      clusterBranches.forEach(m => toRemove.add(`branch:cluster:${cluster.clusterCode}:${m.branchCode}`));
      let next = checkedKeys.filter(k => !toRemove.has(k));
      // remove parent region if no clusters / direct branches remain
      const regionKey = `region:${cluster.regionCode}`;
      const siblingClusters = clusters.filter(c => c.regionCode === cluster.regionCode);
      const anyCluster = siblingClusters.some(c => next.includes(`cluster:${c.clusterCode}`));
      const anyDirect = next.some(k => k.startsWith(`branch:direct:${cluster.regionCode}:`));
      if (!anyCluster && !anyDirect) next = next.filter(k => k !== regionKey);
      setCheckedKeys(next);
    }
  };

  const toggleBranch = (mapping: any, checked: boolean) => {
    const branchKey = mapping.mappingType === 'CLUSTER'
      ? `branch:cluster:${mapping.clusterCode}:${mapping.branchCode}`
      : `branch:direct:${mapping.regionCode}:${mapping.branchCode}`;
    if (checked) {
      setCheckedKeys([...checkedKeys, branchKey]);
    } else {
      let next = checkedKeys.filter(k => k !== branchKey);
      if (mapping.mappingType === 'CLUSTER') {
        const clusterKey = `cluster:${mapping.clusterCode}`;
        const anyBranch = next.some(k => k.startsWith(`branch:cluster:${mapping.clusterCode}:`));
        if (!anyBranch) {
          next = next.filter(k => k !== clusterKey);
          const parentCluster = clusters.find(c => c.clusterCode === mapping.clusterCode);
          if (parentCluster) {
            const regionKey = `region:${parentCluster.regionCode}`;
            const siblingClusters = clusters.filter(c => c.regionCode === parentCluster.regionCode);
            const anyCluster = siblingClusters.some(c => next.includes(`cluster:${c.clusterCode}`));
            const anyDirect = next.some(k => k.startsWith(`branch:direct:${parentCluster.regionCode}:`));
            if (!anyCluster && !anyDirect) next = next.filter(k => k !== regionKey);
          }
        }
      } else {
        const regionKey = `region:${mapping.regionCode}`;
        const anyCluster = clusters.filter(c => c.regionCode === mapping.regionCode).some(c => next.includes(`cluster:${c.clusterCode}`));
        const anyOtherDirect = next.some(k => k.startsWith(`branch:direct:${mapping.regionCode}:`) && k !== branchKey);
        if (!anyCluster && !anyOtherDirect) next = next.filter(k => k !== regionKey);
      }
      setCheckedKeys(next);
    }
  };

  const { selectedRegions: selReg, selectedClusters: selClu, selectedBranches: selBra } = getSelectedItems();

  return (
    <div className="ui-page" style={{ padding: 12 }}>
      <Row gutter={[12, 12]}>
        {/* User Selection */}
        <Col xs={24}>
          <div className="ui-sticky-toolbar">
          <Card className="pro-card-gradient uam-card" size="small" title={<><UserOutlined /> Select User</>}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div className="uam-muted-text">
                    {usersLoading ? 'Loading users...' : `${users.length} user(s) available`}
                  </div>
                  <Select
                    showSearch
                    placeholder="Search user by name or employee ID"
                    style={{ width: '100%' }}
                    onSearch={searchUsers}
                    onChange={handleUserSelect}
                    loading={usersLoading}
                    filterOption={false}
                    notFoundContent={usersLoading ? <Spin size="small" /> : 'No users found'}
                    virtual
                  >
                    {users.map((user: any) => (
                      <Option key={user.employeeId} value={user.employeeId}>
                        {user.name} ({user.employeeId})
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Col>
              <Col xs={24} md={12}>
                {accessLoading && <Spin style={{ marginTop: 16 }} />}
                {userAccess && !accessLoading && (
                  <Descriptions title="Current Access" bordered column={1} size="small">
                    <Descriptions.Item label="Role">
                      <Tag color="blue">{getRoleCodeFromAccess(userAccess) || 'No Role Assigned'}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Permissions">
                      <Space wrap>
                        {getPermissionList(userAccess).length > 0 ? (
                          getPermissionList(userAccess).slice(0, 3).map(p => <Tag key={p} color="green" style={{ fontSize: 11 }}>{p}</Tag>)
                        ) : <Tag>No Permissions</Tag>}
                        {getPermissionList(userAccess).length > 3 && <Tag>+{getPermissionList(userAccess).length - 3} more</Tag>}
                      </Space>
                    </Descriptions.Item>
                    <Descriptions.Item label="Allowed Branches">
                      <Tag color="geekblue">{getAllowedBranchesCount(userAccess)} branches</Tag>
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Col>
            </Row>
          </Card>
          </div>
        </Col>

        {/* Role Assignment */}
        <Col xs={24}>
          <Card className="pro-card-gradient uam-card" size="small" title={<><KeyOutlined /> Assign Role</>}>
            <Form form={form} layout="inline" onFinish={handleAssignRole} disabled={!selectedUser} style={{ width: '100%' }}>
              <Form.Item name="roleCode" label="Select Role" rules={[{ required: true, message: 'Please select a role' }]} style={{ flex: 1, minWidth: 300 }}>
                <Select placeholder="Choose a role">
                  {roles.map((role: any) => (
                    <Option key={role.roleCode} value={role.roleCode}>
                      <Space>
                        <span>{role.roleName}</span>
                        <Tag color="blue" style={{ fontSize: 11 }}>{role.Role_Permission?.length || 0} permissions</Tag>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>Assign Role</Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Data Access Assignment */}
        <Col xs={24}>
          <Card
            className="pro-card-gradient uam-card"
            size="small"
            title={<Space><DatabaseOutlined /><span>Assign Data Access</span></Space>}
            extra={
              <Space>
                <Tag color="blue">{selReg.length} Regions</Tag>
                <Tag color="green">{selClu.length} Clusters</Tag>
                <Tag color="gold">{selBra.length} Branches</Tag>
                <Button type="primary" onClick={handleAssignDataAccess} loading={loading} disabled={!selectedUser || checkedKeys.length === 0}>
                  Assign Data Access
                </Button>
              </Space>
            }
          >
            {regions.length > 0 ? (
              <>
                <div className="uam-help-box">
                  <Text><strong>How to use:</strong> Click a region to view clusters, click a cluster to view branches. Use checkboxes to select items.</Text>
                </div>
                <Row gutter={16}>
                  {/* Regions */}
                  <Col xs={24} lg={8}>
                    <div className="uam-column-header uam-column-header-region">
                      <Text strong className="uam-column-title">REGIONS</Text>
                    </div>
                    <div className="uam-column-body">
                      {regions.map(region => {
                        const regionKey = `region:${region.regionCode}`;
                        const isChecked = checkedKeys.includes(regionKey);
                        const regionClusters = clusters.filter(c => c.regionCode === region.regionCode);
                        return (
                          <div
                            key={region.regionCode}
                            className={`uam-item-card ${selectedRegion === region.regionCode ? 'uam-item-card--selected-region' : ''}`}
                            onClick={() => { setSelectedRegion(region.regionCode); setSelectedCluster(null); }}
                          >
                            <Checkbox
                              checked={isChecked}
                              onClick={e => e.stopPropagation()}
                              onChange={e => { e.stopPropagation(); toggleRegion(region, e.target.checked); }}
                              style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                            />
                            <Space direction="vertical" size={4} style={{ width: '100%', paddingRight: 30 }}>
                              <Text strong className="uam-item-title">{region.regionName}</Text>
                              <div>
                                <Tag color="blue" style={{ fontSize: 11 }}>{region.regionCode}</Tag>
                                <Tag color="cyan" style={{ fontSize: 11 }}>{regionClusters.length} clusters</Tag>
                              </div>
                            </Space>
                          </div>
                        );
                      })}
                    </div>
                  </Col>

                  {/* Clusters */}
                  <Col xs={24} lg={8}>
                    <div className="uam-column-header uam-column-header-cluster">
                      <Text strong className="uam-column-title">CLUSTERS {selectedRegion && `(${selectedRegion})`}</Text>
                    </div>
                    <div className="uam-column-body">
                      {selectedRegion ? (
                        clusters.filter(c => c.regionCode === selectedRegion).length > 0 ? (
                          clusters.filter(c => c.regionCode === selectedRegion).map(cluster => {
                            const clusterKey = `cluster:${cluster.clusterCode}`;
                            const isChecked = checkedKeys.includes(clusterKey);
                            const clusterBranches = mappings.filter(m => m.mappingType === 'CLUSTER' && m.clusterCode === cluster.clusterCode && m.isActive);
                            return (
                              <div
                                key={cluster.clusterCode}
                                className={`uam-item-card ${selectedCluster === cluster.clusterCode ? 'uam-item-card--selected-cluster' : ''}`}
                                onClick={() => setSelectedCluster(cluster.clusterCode)}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onClick={e => e.stopPropagation()}
                                  onChange={e => { e.stopPropagation(); toggleCluster(cluster, e.target.checked); }}
                                  style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                                />
                                <Space direction="vertical" size={4} style={{ width: '100%', paddingRight: 30 }}>
                                  <Text strong className="uam-item-title">{cluster.clusterName}</Text>
                                  <div>
                                    <Tag color="green" style={{ fontSize: 11 }}>{cluster.clusterCode}</Tag>
                                    <Tag color="orange" style={{ fontSize: 11 }}>{clusterBranches.length} branches</Tag>
                                  </div>
                                </Space>
                              </div>
                            );
                          })
                        ) : <Empty description="No clusters in this region" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                      ) : (
                        <div className="uam-empty-col">
                          <Text type="secondary">Select a region to view clusters</Text>
                        </div>
                      )}
                    </div>
                  </Col>

                  {/* Branches */}
                  <Col xs={24} lg={8}>
                    <div className="uam-column-header uam-column-header-branch">
                      <Text strong className="uam-column-title">
                        BRANCHES {selectedCluster ? `(${selectedCluster})` : selectedRegion ? `(${selectedRegion})` : ''}
                      </Text>
                    </div>
                    <div className="uam-column-body">
                      {(selectedCluster || selectedRegion) ? (() => {
                        const filteredMappings = mappings.filter(m => {
                          if (!m.isActive) return false;
                          if (selectedCluster) return m.mappingType === 'CLUSTER' && m.clusterCode === selectedCluster;
                          if (selectedRegion) {
                            if (m.mappingType === 'DIRECT_REGION' && m.regionCode === selectedRegion) return true;
                            const cl = clusters.find(c => c.clusterCode === m.clusterCode && c.regionCode === selectedRegion);
                            return !!cl && m.mappingType === 'CLUSTER';
                          }
                          return false;
                        });
                        return filteredMappings.length > 0 ? filteredMappings.map(mapping => {
                          const branchKey = mapping.mappingType === 'CLUSTER'
                            ? `branch:cluster:${mapping.clusterCode}:${mapping.branchCode}`
                            : `branch:direct:${mapping.regionCode}:${mapping.branchCode}`;
                          const isChecked = checkedKeys.includes(branchKey);
                          return (
                            <div key={`${mapping.branchCode}-${mapping.mappingType}`} className={`uam-item-card ${isChecked ? 'uam-item-card--selected-branch' : ''}`}>
                              <Checkbox
                                checked={isChecked}
                                onChange={() => toggleBranch(mapping, !isChecked)}
                                style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}
                              />
                              <Space direction="vertical" size={4} style={{ width: '100%', paddingRight: 30 }}>
                                <Text strong className="uam-item-title">{mapping.branchName}</Text>
                                <div>
                                  <Tag color="orange" style={{ fontSize: 11 }}>{mapping.branchCode}</Tag>
                                  {mapping.mappingType === 'CLUSTER' ? (
                                    <Tag color="green" style={{ fontSize: 11 }}>Cluster: {mapping.clusterCode}</Tag>
                                  ) : (
                                    <Tag color="blue" style={{ fontSize: 11 }}>Direct</Tag>
                                  )}
                                </div>
                              </Space>
                            </div>
                          );
                        }) : <Empty description="No branches in this selection" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
                      })() : (
                        <div className="uam-empty-col">
                          <Text type="secondary">Select a region or cluster to view branches</Text>
                        </div>
                      )}
                    </div>
                  </Col>
                </Row>
              </>
            ) : (
              <div className="uam-empty-main">
                <DatabaseOutlined style={{ fontSize: 72, marginBottom: 24, color: '#d9d9d9' }} />
                <div style={{ fontSize: 20, marginBottom: 12, fontWeight: 'bold' }}>No Hierarchy Data Available</div>
                <div style={{ fontSize: 14 }}>Please create regions, clusters, and branches in Organization Hierarchy first.</div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
