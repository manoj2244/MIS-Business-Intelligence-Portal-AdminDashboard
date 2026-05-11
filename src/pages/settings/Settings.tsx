import { Card, Col, Form, Input, Row, Select, Space, Typography, Upload, Button, message } from 'antd';
import { BankOutlined, UploadOutlined } from '@ant-design/icons';
import { useMemo } from 'react';

const { Title, Text } = Typography;

const currencyOptions = [
  { value: 'NPR', label: 'NPR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'INR', label: 'INR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'AUD', label: 'AUD' },
];

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

export default function Settings() {
  const [form] = Form.useForm();

  const uploadProps = useMemo(
    () => ({
      beforeUpload: () => false,
      maxCount: 1,
      showUploadList: { showRemoveIcon: true },
    }),
    []
  );

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      message.success('Settings saved successfully');
    } catch {
      message.error('Please fix the validation errors');
    }
  };

  return (
    <div className="ui-page space-y-4">
      <div>
        <Title level={4} className="!mb-1" style={{ fontWeight: 600, color: '#1e3a8a' }}>
          Settings
        </Title>
        <Text type="secondary">Manage bank identity and branding preferences.</Text>
      </div>

      <Card className="pro-card-gradient" title={<Space size={8}><BankOutlined />Bank Profile</Space>}>
        <Form form={form} layout="vertical" requiredMark="optional">
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="bankName"
                label="Bank Name"
                rules={[{ required: true, message: 'Please enter the bank name' }]}
              >
                <Input placeholder="e.g. Everest Bank" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="bankShortName"
                label="Short Name"
                rules={[{ required: true, message: 'Please enter the short name' }]}
              >
                <Input placeholder="e.g. EBL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="currencyCode"
                label="Currency"
                rules={[{ required: true, message: 'Please select a currency' }]}
              >
                <Select options={currencyOptions} placeholder="Select currency" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="currencySymbol"
                label="Currency Symbol"
                rules={[{ required: true, message: 'Please enter currency symbol' }]}
              >
                <Input placeholder="e.g. Rs" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="primaryColor" label="Primary Brand Color">
                <Input type="color" style={{ width: 80, padding: 2 }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="supportEmail" label="Support Email">
                <Input type="email" placeholder="support@bank.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="bankIcon"
                label="Bank Icon"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload {...uploadProps} listType="picture">
                  <Button icon={<UploadOutlined />}>Upload Icon</Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="bankFavicon"
                label="Favicon"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload {...uploadProps} listType="picture">
                  <Button icon={<UploadOutlined />}>Upload Favicon</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" onClick={handleSubmit}>Save Settings</Button>
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
