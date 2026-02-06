import React from 'react'
import ReactDOM from 'react-dom/client'
import { ConfigProvider } from 'antd'
import { ToastContainer } from 'react-toastify'
import App from './App'
import { antdTheme } from './theme/antdTheme'
import GlobalErrorBoundary from './components/shared/GlobalErrorBoundary'
import 'antd/dist/reset.css'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <GlobalErrorBoundary>
        <App />
        <ToastContainer />
      </GlobalErrorBoundary>
    </ConfigProvider>
  </React.StrictMode>
)
