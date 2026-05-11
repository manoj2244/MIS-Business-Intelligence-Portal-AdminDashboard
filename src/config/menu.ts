import type { MenuItem } from '../types';

export const menuItems: MenuItem[] = [
  {
    key: 'main/dashboard/',
    path: '/dashboard',
    menu: 'Dashboard',
    antIcon: 'DashboardOutlined',
    right: ['ADMIN', 'HR'],
  },
  {
    key: 'user-management/',
    path: '/user-management',
    menu: 'User Management',
    antIcon: 'UserOutlined',
    right: ['ADMIN'],
    subMenus: [
      {
        key: 'users/',
        path: '/users',
        menu: 'HRMS Users',
        antIcon: 'UserOutlined',
        right: ['ADMIN'],
      },
    ],
  },
  {
    key: 'rbac/',
    path: '/rbac',
    menu: 'Access Control',
    antIcon: 'SafetyOutlined',
    right: ['ADMIN'],
    subMenus: [
      {
        key: 'role-management/',
        path: '/role-management',
        menu: 'Role Management',
        antIcon: 'KeyOutlined',
        right: ['ADMIN'],
      },
      {
        key: 'user-access/',
        path: '/user-access',
        menu: 'User Access',
        antIcon: 'UserSwitchOutlined',
        right: ['ADMIN'],
      },
    ],
  },
  {
    key: 'organization-setup/',
    path: '/organization-setup',
    menu: 'Organization Setup',
    antIcon: 'ApartmentOutlined',
    right: ['ADMIN'],
    subMenus: [
      {
        key: 'hierarchy-manager/',
        path: '/hierarchy-manager',
        menu: 'Hierarchy Manager',
        antIcon: 'ClusterOutlined',
        right: ['ADMIN'],
      },
      {
        key: 'financial-account-mapping/',
        path: '/financial-account-mapping',
        menu: 'Financial Account Mapping',
        antIcon: 'DollarOutlined',
        right: ['ADMIN'],
      },
    ],
  },
  {
    key: 'loan-management/',
    path: '/loan-management',
    menu: 'Loan Management',
    antIcon: 'BankOutlined',
    right: ['ADMIN'],
  },
  {
    key: 'settings/',
    path: '/settings',
    menu: 'Settings',
    antIcon: 'SettingOutlined',
    right: ['ADMIN'],
  },
];
