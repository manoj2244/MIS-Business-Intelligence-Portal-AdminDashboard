import React, { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  SafetyOutlined,
  KeyOutlined,
  UserSwitchOutlined,
  ApartmentOutlined,
  ClusterOutlined,
  DollarOutlined,
  SettingOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { authService } from '../services/authService';
import { menuItems } from '../config/menu';
import { notifySuccess } from '../utils/notifyUtil';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const SIDEBAR_EXPANDED_WIDTH = 286;
const SIDEBAR_COLLAPSED_WIDTH = 88;

// Icon mapping
const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  UserOutlined: <UserOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  KeyOutlined: <KeyOutlined />,
  UserSwitchOutlined: <UserSwitchOutlined />,
  ApartmentOutlined: <ApartmentOutlined />,
  ClusterOutlined: <ClusterOutlined />,
  DollarOutlined: <DollarOutlined />,
  SettingOutlined: <SettingOutlined />,
  BankOutlined: <BankOutlined />,
};

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((state) => state.user);
  const userRole = useAuthStore((state) => state.userRole);
  const effectiveRole = userRole || user?.role || null;
  const logout = useAuthStore((state) => state.logout);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    // Set selected and open keys based on current path
    const path = location.pathname;
    const pathSegments = path.split('/').filter(Boolean);
    
    if (pathSegments.length > 0) {
      const firstSegment = pathSegments[0];
      setOpenKeys([firstSegment + '/']);
      setSelectedKeys([path]);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      notifySuccess('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      logout();
      navigate('/login');
    }
  };

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: (
        <div>
          <div className="font-semibold">{user?.name || 'User'}</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
      ),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Convert menu items to Ant Design menu format
  const getMenuItems = (): MenuProps['items'] => {
    const filteredMenu = menuItems;
    
    return filteredMenu.map((item) => {
      if (item.subMenus && item.subMenus.length > 0) {
        return {
          key: item.key,
          icon: iconMap[item.antIcon],
          label: item.menu,
          children: item.subMenus.map((sub) => ({
            key: item.path + sub.path,
            icon: iconMap[sub.antIcon],
            label: sub.menu,
            onClick: () => navigate(item.path + sub.path),
          })),
        };
      }
      
      return {
        key: item.path,
        icon: iconMap[item.antIcon],
        label: item.menu,
        onClick: () => navigate(item.path),
      };
    });
  };

  return (
    <Layout className="min-h-screen" style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        collapsedWidth={SIDEBAR_COLLAPSED_WIDTH}
        width={SIDEBAR_EXPANDED_WIDTH}
        className="shadow-md"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 120,
          overflow: 'auto',
          background: 'linear-gradient(180deg, #f8fbff 0%, #eef5ff 38%, #e8f1ff 100%)',
          borderRight: '1px solid #dbe7fb',
        }}
      >
        <div
          className="flex items-center justify-start h-16 border-b px-4"
          style={{ borderColor: '#dbe7fb' }}
        >
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 14px rgba(37,99,235,0.25)',
                }}
              >
                <SafetyOutlined style={{ fontSize: 15 }} />
              </div>
              <div className="flex flex-col leading-tight">
                <Text className="text-sm font-semibold" style={{ color: '#1d4ed8' }}>Admin MIS Portal</Text>
                <Text style={{ fontSize: 10, color: '#64748b' }}>Admin Workspace</Text>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 14px rgba(37,99,235,0.25)',
              }}
            >
              <SafetyOutlined style={{ fontSize: 16 }} />
            </div>
          )}
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={openKeys}
          onOpenChange={setOpenKeys}
          items={getMenuItems()}
          className="border-0 side-menu"
          style={{ background: 'transparent', color: '#334155' }}
        />
      </Sider>
      
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH,
          transition: 'margin-left 0.2s ease',
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        <Header
          className="flex items-center justify-between px-5 shadow-sm"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backdropFilter: 'blur(8px)',
            background: 'rgba(255,255,255,0.92)',
            borderBottom: '1px solid #dbe7fb',
            height: '60px',
            lineHeight: '60px',
            padding: '0 20px',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="text-xl p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
          </div>
          
          <Dropdown menu={{ items: userMenu }} placement="bottomRight" trigger={['click']}>
            <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <Avatar
                size="default"
                icon={<UserOutlined />}
                style={{ backgroundColor: '#2563eb' }}
              />
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{effectiveRole || 'Role'}</div>
              </div>
            </Space>
          </Dropdown>
        </Header>
        
        <Content
          className="p-3"
          style={{
            overflow: 'auto',
            height: 'calc(100vh - 60px)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,250,255,0.92))',
            borderTop: 'none',
          }}
        >
          <div
            className="rounded-lg shadow-sm"
            style={{
              minHeight: '100%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(244,248,255,0.94))',
              border: '1px solid #dbe7fb',
              padding: 10,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
