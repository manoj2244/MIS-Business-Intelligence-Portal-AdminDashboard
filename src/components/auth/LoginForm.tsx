import { Button, Checkbox, Divider, Form, Input, Typography } from 'antd'
import type { FormProps } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

export default function LoginForm() {
  type LoginFormValues = {
    email: string
    password: string
    remember?: boolean
  }

  const onFinish: FormProps<LoginFormValues>['onFinish'] = (values) => {
    console.log('Login submitted', values)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="tagline-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Secure Access
        </p>
        <Title level={2} className="!m-0 !font-display !text-3xl !text-slate-100">
          Sign in to your workspace
        </Title>
        <Text className="text-sm text-slate-400">
          Build, monitor, and analyze your business intelligence pipeline from one place.
        </Text>
      </div>

      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-slate-300">Work Email</span>}
          name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined className="text-slate-500" />}
            placeholder="you@company.com"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-slate-300">Password</span>}
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-slate-500" />}
            placeholder="Enter your password"
          />
        </Form.Item>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
          <Form.Item name="remember" valuePropName="checked" className="!mb-0">
            <Checkbox className="text-slate-300">Keep me signed in</Checkbox>
          </Form.Item>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-mint-500 transition hover:text-mint-600"
          >
            Reset Password
          </button>
        </div>

        <Form.Item className="!mb-0">
          <Button type="primary" size="large" block>
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider>Or</Divider>

      <div className="grid gap-3 md:grid-cols-2">
        <Button size="large" className="border-slate-700 bg-transparent text-slate-200">
          Continue with SSO
        </Button>
        <Button size="large" className="border-slate-700 bg-transparent text-slate-200">
          Continue with Google
        </Button>
      </div>

      <Text className="text-xs text-slate-500">
        By continuing, you agree to the platform security policy and the data usage guidelines.
      </Text>
    </div>
  )
}
