import LoginForm from '../components/auth/LoginForm'

export default function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-sky-50 to-slate-50" />
      <div className="absolute -top-48 right-0 h-96 w-96 rounded-full bg-sky-200/60 blur-3xl" />
      <div className="absolute -bottom-48 left-0 h-96 w-96 rounded-full bg-blue-200/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full gap-10 rounded-3xl border border-slate-200/70 bg-white/85 p-10 shadow-2xl backdrop-blur lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <section className="flex h-full flex-col gap-8 lg:justify-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                MIS Banking Portal
              </p>
              <h1 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">
                Secure LDAP Access
              </h1>
              <p className="mt-3 text-sm text-slate-600">
                Authorized users only. All access is monitored and logged.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Security Notice</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Use your corporate LDAP credentials.</li>
                <li>Do not share usernames or passwords.</li>
                <li>Contact IT Security for access issues.</li>
              </ul>
            </div>
          </section>

          <section className="flex h-full flex-col justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <LoginForm />
          </section>
        </div>
      </div>
    </div>
  )
}
