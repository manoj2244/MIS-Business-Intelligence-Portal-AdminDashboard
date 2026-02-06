import React from 'react'
import toast from '../../lib/toast'

type GlobalErrorBoundaryProps = {
  children: React.ReactNode
}

type GlobalErrorBoundaryState = {
  hasError: boolean
  error?: Error
}

export default class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  state: GlobalErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('Global error boundary caught an error:', error)
    toast.error('Something went wrong. Please try again.')
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-12">
            <div className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                MIS Banking
              </p>
              <h1 className="mt-3 text-xl font-semibold text-slate-900">
                We hit an unexpected error
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Please reload the page. If the issue continues, contact support.
              </p>
              <button
                type="button"
                onClick={this.handleReload}
                className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
