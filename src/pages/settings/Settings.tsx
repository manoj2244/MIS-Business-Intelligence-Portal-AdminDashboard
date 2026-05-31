import {
  Card, Col, Form, Input, Row, Select, Space, Typography, Button, message, Divider,
} from 'antd';
import { BankOutlined, SaveOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { settingsApi } from '../../services/settingsApi';
import { useBankConfigStore } from '../../stores/bankConfigStore';
import { MONEY_SCALE_OPTIONS } from '../../utils/moneyUtil';

const { Title, Text } = Typography;

const currencyOptions = [
  { value: 'NPR', label: 'NPR — Nepalese Rupee' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
];

const moneyScaleSelectOptions = MONEY_SCALE_OPTIONS.flatMap((group) =>
  group.options.map((o) => ({ value: o.value, label: `${o.label} [${group.group}]` }))
);

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function Settings() {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const setConfig = useBankConfigStore((s) => s.setConfig);

  useEffect(() => {
    settingsApi.get().then((config) => {
      if (config) {
        form.setFieldsValue({
          bankName: config.bankName,
          shortName: config.shortName,
          currencyCode: config.currencyCode,
          currencySymbol: config.currencySymbol,
          primaryColor: config.primaryColor,
          moneyScale: config.moneyScale,
          supportEmail: config.supportEmail,
        });
        if (config.logoBase64) setLogoPreview(config.logoBase64);
        if (config.faviconBase64) setFaviconPreview(config.faviconBase64);
      }
    });
  }, [form]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setLogoPreview(base64);
    form.setFieldValue('logoBase64', base64);
  };

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setFaviconPreview(base64);
    form.setFieldValue('faviconBase64', base64);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const saved = await settingsApi.save(values);
      setConfig(saved);
      document.title = saved.bankName;
      if (saved.faviconBase64) {
        const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (link) link.href = saved.faviconBase64;
      }
      message.success('Settings saved successfully');
    } catch {
      message.error('Please fix the validation errors');
    } finally {
      setSaving(false);
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
              <Form.Item name="bankName" label="Bank Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Everest Bank" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="shortName" label="Short Name" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. EBL" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="currencyCode" label="Currency" rules={[{ required: true, message: 'Required' }]}>
                <Select options={currencyOptions} placeholder="Select currency" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="currencySymbol" label="Currency Symbol" rules={[{ required: true, message: 'Required' }]}>
                <Input placeholder="e.g. Rs." />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="moneyScale" label="Default Money Scale" rules={[{ required: true, message: 'Required' }]}>
                <Select options={moneyScaleSelectOptions} placeholder="Select scale" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="primaryColor" label="Primary Brand Color" rules={[{ required: true, message: 'Required' }]}>
                <Input type="color" style={{ width: 80, padding: 2 }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="supportEmail" label="Support Email">
                <Input type="email" placeholder="support@bank.com" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" plain>Branding Assets</Divider>

          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item name="logoBase64" label="Bank Logo">
                <Space direction="vertical" size={8}>
                  {logoPreview && (
                    <img src={logoPreview} alt="logo preview" style={{ height: 48, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 8, padding: 4 }} />
                  )}
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                  <Text type="secondary" style={{ fontSize: 12 }}>PNG or SVG recommended. Max ~200KB.</Text>
                </Space>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="faviconBase64" label="Favicon">
                <Space direction="vertical" size={8}>
                  {faviconPreview && (
                    <img src={faviconPreview} alt="favicon preview" style={{ height: 32, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 4, padding: 2 }} />
                  )}
                  <input type="file" accept="image/*,.ico" onChange={handleFaviconChange} />
                  <Text type="secondary" style={{ fontSize: 12 }}>32×32 .ico or .png recommended.</Text>
                </Space>
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit} loading={saving}>
              Save Settings
            </Button>
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}
