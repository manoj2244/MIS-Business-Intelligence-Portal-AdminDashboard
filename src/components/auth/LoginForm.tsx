import { Button, Form, Input, Typography } from 'antd'
import type { FormProps } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import toast from '../../lib/toast'

const { Text, Title } = Typography

export default function LoginForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  type LoginFormValues = {
    username: string
    password: string
  }

  const onFinish: FormProps<LoginFormValues>['onFinish'] = async (values) => {
    setLoading(true)
    try {
      const response = await authService.loginLdap({
        username: values.username,
        password: values.password,
      })
      
      toast.success(`Welcome back, ${response.user.name}!`)
      navigate('/dashboard', { replace: true })
    } catch (error: any) {
      console.error('Login error:', error)
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Title level={2} className="!m-0 !font-display !text-2xl !text-slate-900">
          LDAP Login
        </Title>
        <Text className="text-sm text-slate-500">
          Sign in to the MIS Banking Portal.
        </Text>
      </div>

      <Form
        layout="vertical"
        requiredMark={false}
        onFinish={onFinish}
        onFinishFailed={() => toast.error('Please complete all required fields.')}
        className="space-y-4"
      >
        <Form.Item
          label={<span className="text-slate-700">Username</span>}
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
          label={<span className="text-slate-700">Password</span>}
          name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined className="text-slate-500" />}
            placeholder="Enter your password"
          />
        </Form.Item>

        <Form.Item className="!mb-0">
          <Button type="primary" size="large" block htmlType="submit" loading={loading}>
            Sign In
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
