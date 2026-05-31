import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import toast from '../lib/toast'
import { useAuthStore } from '../stores/authStore'
import { rbacApi } from '../services/rbacApi'
import { useBankConfigStore } from '../stores/bankConfigStore'
import SuBizLogo from '../assets/SuBizLogo.png'
import AdminBg from '../assets/admin.png'

const IconEye = ({ off }: { off: boolean }) => off ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
)

export default function LoginDraft() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const setUserAccess = useAuthStore((s) => s.setUserAccess)
  const config = useBankConfigStore((s) => s.config)
  const bankName = config?.bankName || 'MIS Portal'
  const logoBase64 = config?.logoBase64

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password) {
      toast.error('Please complete all required fields.')
      return
    }
    setLoading(true)
    try {
      const response = await authService.loginLdap({ username: username.trim(), password })
      setAuth({ user: response.user, accessToken: response.accessToken, refreshToken: response.refreshToken })
      try {
        const accessData = await rbacApi.getMyAccess(response.user?.employeeId || response.user?.userCode)
        if (accessData) setUserAccess({ permissions: accessData.permissions || [], userRole: accessData.userRole, allowedBranches: accessData.allowedBranches || [] })
      } catch {}
      toast.success(`Welcome back, ${response.user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f6fafe' }}>

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ---- Left Panel ---- */}
        <section style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#131b2e', position: 'relative', overflow: 'hidden',
        }}>
          {/* technical grid */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.2,
            backgroundImage: 'linear-gradient(to right, rgba(226,232,240,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(226,232,240,0.4) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          {/* background image */}
          <img src={AdminBg} alt="" style={{
            position: 'absolute',
            right: '-10%', top: '20%',
            width: '70%', height: 'auto',
            opacity: 0.3,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 0,
          }} />
          {/* gradient overlay — keeps left content readable */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, #131b2e 40%, rgba(19,27,46,0.6) 70%, rgba(19,27,46,0.2) 100%)',
            zIndex: 1,
          }} />

          <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 520, padding: '0 48px' }}>
            {/* Brand mark — logo + bank name side by side */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0,
              }}>
                {logoBase64
                  ? <img src={logoBase64} alt={bankName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 5 }} />
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#131b2e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                }
              </div>
              <span style={{ fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em', lineHeight: '22px' }}>
                {bankName}
              </span>
            </div>

            {/* Big heading */}
            <h1 style={{ fontSize: 48, lineHeight: '56px', fontWeight: 700, letterSpacing: '-0.02em', color: '#dae2fd', margin: '0 0 12px' }}>
              EXECUTIVE<br />RESERVE
            </h1>
            <div style={{ width: 64, height: 3, background: '#bec6e0', borderRadius: 4, marginBottom: 16 }} />
            <p style={{ fontSize: 15, lineHeight: '24px', fontWeight: 400, color: 'rgba(124,131,155,0.85)', maxWidth: 380, margin: 0 }}>
              Institutional-grade financial governance. Professional-tier management system for secured assets.
            </p>
          </div>
        </section>

        {/* ---- Right Panel ---- */}
        <section style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24, background: '#f6fafe', position: 'relative',
        }}>
          <div style={{ width: '100%', maxWidth: 480 }}>

            {/* Header */}
            <header style={{ marginBottom: 32 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 999, marginBottom: 16,
                background: '#ffdad6', color: '#93000a',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
                </svg>
                High Security Enabled
              </div>
              <h2 style={{ fontSize: 32, lineHeight: '40px', fontWeight: 600, letterSpacing: '-0.01em', color: '#171c1f', margin: '0 0 8px' }}>
                System Administrator Login
              </h2>
              <p style={{ fontSize: 14, lineHeight: '20px', color: '#45464d', margin: 0 }}>
                Authorized personnel only. Access is monitored and logged.
              </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#45464d' }}>
                  Username
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#76777d', display: 'flex' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="Enter your username" autoComplete="username"
                    style={{
                      width: '100%', padding: '13px 14px 13px 44px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, lineHeight: '20px', color: '#171c1f',
                      background: '#fff', border: '1px solid #c6c6cd',
                      borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const,
                    }}
                    onFocus={e => { e.target.style.borderColor = '#000'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.08)' }}
                    onBlur={e => { e.target.style.borderColor = '#c6c6cd'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: '#45464d' }}>
                    Password
                  </label>
                  <a href="#" style={{ fontSize: 11, fontWeight: 500, color: '#505f76', textDecoration: 'none' }}>Forgot?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#76777d', display: 'flex' }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                    </svg>
                  </span>
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••••••" autoComplete="current-password"
                    style={{
                      width: '100%', padding: '13px 44px 13px 44px',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13, lineHeight: '20px', color: '#171c1f',
                      background: '#fff', border: '1px solid #c6c6cd',
                      borderRadius: 8, outline: 'none', boxSizing: 'border-box' as const,
                    }}
                    onFocus={e => { e.target.style.borderColor = '#000'; e.target.style.boxShadow = '0 0 0 2px rgba(0,0,0,0.08)' }}
                    onBlur={e => { e.target.style.borderColor = '#c6c6cd'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#76777d', display: 'flex', padding: 4 }}>
                    <IconEye off={showPass} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px 24px',
                background: '#000', color: '#fff',
                fontSize: 15, fontWeight: 600, letterSpacing: '0.02em',
                border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.65 : 1,
                transition: 'opacity 0.15s, transform 0.1s',
              }}>
                {loading ? 'Signing in…' : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
              </button>

              {/* Powered by — below form */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                <img src={SuBizLogo} alt="SuBiz Innovations" style={{ height: 15, opacity: 0.55 }} />
                <span style={{ fontSize: 11, color: '#76777d', fontWeight: 400 }}>Powered by</span>
                <span style={{ fontSize: 11, color: '#171c1f', fontWeight: 700 }}>SuBiz Innovations</span>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
