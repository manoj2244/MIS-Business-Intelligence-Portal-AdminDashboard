import { Alert, Form, Input, Modal, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../utils/error';

const { Option } = Select;

type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
  regions: any[];
  defaultRegionCode?: string;
};

export default function CreateClusterModal({ open, onCancel, onSubmit, regions, defaultRegionCode }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ clusterCode: '', clusterName: '', regionCode: defaultRegionCode || undefined, isActive: true });
    setServerError('');
  }, [open, form, defaultRegionCode]);

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        clusterCode: values.clusterCode?.trim(),
        clusterName: values.clusterName?.trim(),
        regionCode: values.regionCode,
        isActive: !!values.isActive,
      });
      form.resetFields();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to create cluster'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create Cluster" open={open} onCancel={onCancel} onOk={() => form.submit()} confirmLoading={submitting} destroyOnClose okText="Create">
      {serverError ? <Alert style={{ marginBottom: 12 }} type="error" showIcon message={serverError} /> : null}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="clusterCode" label="Code" rules={[{ required: true, message: 'Code is required' }, { max: 10, message: 'Code must be at most 10 characters' }]}>
          <Input placeholder="Enter cluster code" />
        </Form.Item>
        <Form.Item name="clusterName" label="Name" rules={[{ required: true, message: 'Name is required' }, { max: 100, message: 'Name must be at most 100 characters' }]}>
          <Input placeholder="Enter cluster name" />
        </Form.Item>
        <Form.Item name="regionCode" label="Region" rules={[{ required: true, message: 'Region is required' }]}>
          <Select placeholder="Select region">
            {regions.map((region) => (
              <Option key={region.regionCode} value={region.regionCode}>
                {region.regionName} ({region.regionCode})
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="isActive" label="Is Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
