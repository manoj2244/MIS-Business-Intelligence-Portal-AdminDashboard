import { Typography } from 'antd';
import LoginForm from '../components/auth/LoginForm';

const { Title, Text } = Typography;

const stats = [
  { label: 'Active Pipelines', value: '128' },
  { label: 'Weekly Reports', value: '2.4k' },
  { label: 'Data Sources', value: '43' },
] as const;

const highlights = [
  {
    title: 'Centralized governance',
    description:
      'Unify access policies, audit trails, and compliance checkpoints across teams.',
  },
  {
    title: 'Composable analytics',
    description:
      'Plug in new datasets, metrics, and dashboards without rework.',
  },
  {
    title: 'Realtime monitoring',
    description: 'Track freshness, drift, and KPIs with proactive alerts.',
  },
] as const;

export default function Login() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:120px_120px] opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:items-stretch">
        <section className="flex w-full flex-col justify-between gap-10 lg:w-1/2">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-700/50 bg-slate-900/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
              MIS Business Intelligence
            </div>
            <Title
              level={1}
              className="!m-0 !font-display !text-4xl !text-white md:!text-5xl"
            >
              Command center for data-driven leaders.
            </Title>
            <Text className="text-base text-slate-300">
              Control every signal, metric, and model from a single workspace
              built for scale. Give every department a shared, trusted source of
              truth.
            </Text>
          </div>

          <div className="grid gap-4">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 shadow-card"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-mint-500">
                  {item.title}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-2xl p-4 text-center"
              >
                <p className="text-2xl font-semibold text-white">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex w-full items-center justify-center lg:w-1/2">
          <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-card">
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}
