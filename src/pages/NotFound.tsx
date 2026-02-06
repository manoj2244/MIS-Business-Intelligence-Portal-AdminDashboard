import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            MIS Banking
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">404</h1>
          <p className="mt-2 text-sm text-slate-500">
            The page you are looking for could not be found.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
