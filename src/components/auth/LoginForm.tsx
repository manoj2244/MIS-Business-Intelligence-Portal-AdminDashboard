import { Button, Checkbox, Divider, Form, Input, Typography, message } from 'antd'
import type { FormProps } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { authService } from '../../services/authService'

const { Text, Title } = Typography

export default function LoginForm() {
  const [loading, setLoading] = useState(false)

  type LoginFormValues = {
    username: string
    password: string
    remember?: boolean
  }

  const onFinish: FormProps<LoginFormValues>['onFinish'] = async (values) => {
    setLoading(true)
    try {
      const response = await authService.loginLdap({
        username: values.username,
        password: values.password,
      })
      
      message.success(`Welcome back, ${response.user.name}!`)
      
      // Redirect to dashboard or reload
      window.location.href = '/dashboard'
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
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
          label={<span className="text-slate-300">Username</span>}
          name="username"
          rules={[
            { required: true, message: 'Please enter your username' },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined className="text-slate-500" />}
            placeholder="Your LDAP username"
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
          <Button type="primary" size="large" block htmlType="submit" loading={loading}>
            Sign In
          </Button>
        </Form.Item>
      </Form>

      <Divider>Or</Divider>

      <div className="grid gap-3 md:grid-cols-2">
        <Button size="large" className="border-slate-700 bg-transparent text-slate-200" disabled>
          Continue with SSO
        </Button>
        <Button size="large" className="border-slate-700 bg-transparent text-slate-200" disabled>
          Continue with Google
        </Button>
      </div>

      <Text className="text-xs text-slate-500">
        By continuing, you agree to the platform security policy and the data usage guidelines.
      </Text>
    </div>
  )
}
