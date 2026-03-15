import { Card, Col, Progress, Row, Space, Statistic, Tag, Typography, message } from 'antd';
import {
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClusterOutlined,
  DollarCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { rbacApi } from '../services/rbacApi';
import { getClusters, getMappings, getRegions } from '../services/hierarchyApi';
import { getCoreFtbAccounts, getFtbMappings } from '../services/financialApi';

type DashboardStats = {
  users: number;
  activeUsers: number;
  roles: number;
  regions: number;
  clusters: number;
  branchesMapped: number;
  mappingCoveragePercent: number;
  mainCodesTotal: number;
  mainCodesMapped: number;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { Title, Text } = Typography;
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    users: 0,
    activeUsers: 0,
    roles: 0,
    regions: 0,
    clusters: 0,
    branchesMapped: 0,
    mappingCoveragePercent: 0,
    mainCodesTotal: 0,
    mainCodesMapped: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [usersResult, rolesResult, regionsResult, clustersResult, mappingsResult, mainCodeResult, ftbMappingsResult] = await Promise.allSettled([
          rbacApi.getAllUsers(),
          rbacApi.getRoles(),
          getRegions(),
          getClusters(),
          getMappings(),
          getCoreFtbAccounts({ page: 1, pageSize: 1 }),
          getFtbMappings({}),
        ]);

        const users = usersResult.status === 'fulfilled' ? usersResult.value : [];
        const roles = rolesResult.status === 'fulfilled' ? rolesResult.value : [];
        const regions = regionsResult.status === 'fulfilled' ? regionsResult.value : [];
        const clusters = clustersResult.status === 'fulfilled' ? clustersResult.value : [];
        const mappings = mappingsResult.status === 'fulfilled' ? mappingsResult.value : [];
        const mainCodeResponse = mainCodeResult.status === 'fulfilled' ? mainCodeResult.value : { items: [], pagination: { total: 0 } };
        const ftbMappingsPayload = ftbMappingsResult.status === 'fulfilled' ? ftbMappingsResult.value : [];

        const activeUsers = (users || []).filter((u: any) => u?.isActive !== false).length;
        const activeMappings = (mappings || []).filter((m: any) => m?.isActive !== false);
        const uniqueBranchCount = new Set(activeMappings.map((m: any) => m.branchCode).filter(Boolean)).size;

        const mainCodeItems = Array.isArray(mainCodeResponse?.items) ? mainCodeResponse.items : [];
        const totalMainCodesFromPagination = Number(mainCodeResponse?.pagination?.total || 0);
        const mainCodesTotal = totalMainCodesFromPagination > 0 ? totalMainCodesFromPagination : mainCodeItems.length;

        const mappingItems = Array.isArray(ftbMappingsPayload)
          ? ftbMappingsPayload
          : Array.isArray((ftbMappingsPayload as any)?.items)
            ? (ftbMappingsPayload as any).items
            : [];

        const mappedMainCodes = new Set(
          mappingItems.map((item: any) => item?.mainCode).filter(Boolean)
        ).size;

        const coveragePercent = mainCodesTotal > 0
          ? Math.round((mappedMainCodes / mainCodesTotal) * 100)
          : 0;

        setStats({
          users: users?.length || 0,
          activeUsers,
          roles: roles?.length || 0,
          regions: regions?.length || 0,
          clusters: clusters?.length || 0,
          branchesMapped: uniqueBranchCount,
          mappingCoveragePercent: coveragePercent,
          mainCodesTotal,
          mainCodesMapped: mappedMainCodes,
        });

        const failedCalls = [usersResult, rolesResult, regionsResult, clustersResult, mappingsResult, mainCodeResult, ftbMappingsResult]
          .filter((result) => result.status === 'rejected').length;

        if (failedCalls === 7) {
          message.error('Failed to load dashboard metrics');
        }
      } catch {
        message.error('Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const healthTag = useMemo(() => {
    if (stats.mappingCoveragePercent >= 80) return <Tag color="green">Excellent</Tag>;
    if (stats.mappingCoveragePercent >= 50) return <Tag color="gold">Moderate</Tag>;
    return <Tag color="volcano">Needs Attention</Tag>;
  }, [stats.mappingCoveragePercent]);

  const unmappedMainCodes = Math.max(stats.mainCodesTotal - stats.mainCodesMapped, 0);

  return (
    <div className="ui-page space-y-4">
      <div>
        <Title level={4} className="!mb-1" style={{ fontWeight: 600, color: '#1e3a8a' }}>
          Dashboard
        </Title>
        <Text type="secondary">Welcome{user?.name ? `, ${user.name}` : ''}.</Text>
      </div>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Card className="pro-card-gradient stat-card-region" loading={loading} size="small">
            <Statistic
              title={<Space size={6}><TeamOutlined />Users</Space>}
              value={stats.users}
              suffix={<Text type="secondary" style={{ fontSize: 12 }}>{stats.activeUsers} active</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="pro-card-gradient stat-card-cluster" loading={loading} size="small">
            <Statistic title={<Space size={6}><CheckCircleOutlined />Roles</Space>} value={stats.roles} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="pro-card-gradient stat-card-branch" loading={loading} size="small">
            <Statistic title={<Space size={6}><BankOutlined />Mapped Branches</Space>} value={stats.branchesMapped} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Card className="pro-card-gradient stat-card-region" loading={loading} size="small">
            <Statistic title={<Space size={6}><ClusterOutlined />Regions</Space>} value={stats.regions} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="pro-card-gradient stat-card-cluster" loading={loading} size="small">
            <Statistic title={<Space size={6}><ClusterOutlined />Clusters</Space>} value={stats.clusters} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card
            className="pro-card-gradient stat-card-direct"
            loading={loading}
            size="small"
            hoverable
            onClick={() => navigate('/organization-setup/financial-account-mapping?tab=maincode-mapping')}
          >
            <Statistic
              title={<Space size={6}><DollarCircleOutlined />Unmapped MainCodes</Space>}
              value={unmappedMainCodes}
              suffix={<Text type="secondary" style={{ fontSize: 12 }}>/ {stats.mainCodesTotal}</Text>}
            />
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Go to mapping page <ArrowRightOutlined />
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Card className="pro-card-gradient" size="small">
        <Space direction="vertical" size={8} style={{ width: '100%' }}>
          <Space style={{ justifyContent: 'space-between', width: '100%' }}>
            <Text strong style={{ color: '#1e3a8a' }}>Mapping Coverage</Text>
            {healthTag}
          </Space>
          <Progress
            percent={stats.mappingCoveragePercent}
            strokeColor={{ from: '#2563eb', to: '#22c55e' }}
            trailColor="#e6edf8"
          />
          <Text type="secondary">
            Coverage is based on mapped MainCodes in financial setup. Keep this high for better reporting quality.
          </Text>
        </Space>
      </Card>
    </div>
  );
}
