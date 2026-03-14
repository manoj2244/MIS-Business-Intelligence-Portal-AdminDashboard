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
import 'antd/dist/reset.css';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antdTheme}>
        <GlobalErrorBoundary>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </GlobalErrorBoundary>
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
