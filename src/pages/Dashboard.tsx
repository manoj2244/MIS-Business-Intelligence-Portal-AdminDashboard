import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const handleLogout = async () => {
    await authService.logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">
              Welcome{user?.name ? `, ${user.name}` : ''}.
            </p>
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-600">
            This is the secure dashboard area. Add modules and widgets here.
          </p>
        </div>
      </div>
    </div>
  )
}
