import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import App from './App';
import { antdTheme } from './theme/antdTheme';
import { queryClient } from './config/queryClient';
import GlobalErrorBoundary from './components/shared/GlobalErrorBoundary';
import { useBankConfigStore } from './stores/bankConfigStore';
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

function Root() {
  const config = useBankConfigStore((s) => s.config);
  const primaryColor = config?.primaryColor ?? antdTheme.token?.colorPrimary ?? '#1d4ed8';

  const theme = {
    ...antdTheme,
    token: {
      ...antdTheme.token,
      colorPrimary: primaryColor,
      colorInfo: primaryColor,
    },
    components: {
      ...antdTheme.components,
      Button: {
        ...antdTheme.components?.Button,
        colorPrimary: primaryColor,
      },
      Input: {
        ...antdTheme.components?.Input,
        activeBorderColor: primaryColor,
        hoverBorderColor: primaryColor,
      },
    },
  };

  return (
    <ConfigProvider theme={theme}>
      <GlobalErrorBoundary>
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </GlobalErrorBoundary>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
