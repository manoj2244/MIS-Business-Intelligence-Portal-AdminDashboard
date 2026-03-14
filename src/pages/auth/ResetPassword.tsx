import { Card, Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ResetPassword() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50">
      <div className="relative mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
        <Card className="w-full rounded-2xl">
          <div className="mb-6">
            <Title level={3} className="!mb-1">
              Reset Password
            </Title>
            <Text type="secondary">Set your new password.</Text>
          </div>

          <Form layout="vertical">
            <Form.Item
              name="password"
              label="New Password"
              rules={[{ required: true, message: 'Please enter a new password' }]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[{ required: true, message: 'Please confirm your password' }]}
            >
              <Input.Password />
            </Form.Item>

            <Button type="primary" block htmlType="submit">
              Update Password
            </Button>
          </Form>

          <div className="mt-4 text-center text-sm">
            <Link to="/login">Back to Login</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
