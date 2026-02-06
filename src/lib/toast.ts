import type { ReactNode } from 'react'
import { toast as toastify } from 'react-toastify'
import type { ToastOptions } from 'react-toastify'

const baseOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

const toast = {
  success: (content: ReactNode, options?: ToastOptions) =>
    toastify.success(content, { ...baseOptions, ...options }),
  error: (content: ReactNode, options?: ToastOptions) =>
    toastify.error(content, { ...baseOptions, ...options }),
  info: (content: ReactNode, options?: ToastOptions) =>
    toastify.info(content, { ...baseOptions, ...options }),
  warning: (content: ReactNode, options?: ToastOptions) =>
    toastify.warning(content, { ...baseOptions, ...options }),
}

export default toast
