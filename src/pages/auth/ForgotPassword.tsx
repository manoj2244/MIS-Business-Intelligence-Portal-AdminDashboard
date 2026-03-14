import { Card, Form, Input, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ForgotPassword() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-sky-50">
      <div className="relative mx-auto flex min-h-screen max-w-lg items-center px-6 py-12">
        <Card className="w-full rounded-2xl">
          <div className="mb-6">
            <Title level={3} className="!mb-1">
              Forgot Password
            </Title>
            <Text type="secondary">Enter your email to continue reset process.</Text>
          </div>

          <Form layout="vertical">
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input placeholder="name@company.com" />
            </Form.Item>

            <Button type="primary" block htmlType="submit">
              Continue
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
