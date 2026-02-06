import type { ThemeConfig } from 'antd'

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1d4ed8',
    colorInfo: '#1d4ed8',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: 10,
    colorBgContainer: '#ffffff',
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorBorder: '#e2e8f0',
  },
  components: {
    Button: {
      colorPrimary: '#1d4ed8',
      colorPrimaryHover: '#1e40af',
      colorPrimaryActive: '#1e3a8a',
      borderRadius: 10,
      fontWeight: 600,
    },
    Input: {
      colorBgContainer: '#ffffff',
      colorTextPlaceholder: '#94a3b8',
      activeBorderColor: '#1d4ed8',
      hoverBorderColor: '#1d4ed8',
      borderRadius: 10,
    },
    Divider: {
      colorSplit: '#e2e8f0',
    },
    Form: {
      marginLG: 16,
    },
  },
}
