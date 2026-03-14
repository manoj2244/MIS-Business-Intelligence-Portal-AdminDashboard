import { Alert, Form, Input, Modal, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { getApiErrorMessage } from '../../utils/error';

type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
};

export default function CreateRegionModal({ open, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ regionCode: '', regionName: '', isActive: true });
    setServerError('');
  }, [open, form]);

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        regionCode: values.regionCode?.trim(),
        regionName: values.regionName?.trim(),
        isActive: !!values.isActive,
      });
      form.resetFields();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to create region'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create Region" open={open} onCancel={onCancel} onOk={() => form.submit()} confirmLoading={submitting} destroyOnClose okText="Create">
      {serverError ? <Alert style={{ marginBottom: 12 }} type="error" showIcon message={serverError} /> : null}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="regionCode" label="Code" rules={[{ required: true, message: 'Code is required' }, { max: 10, message: 'Code must be at most 10 characters' }]}>
          <Input placeholder="Enter region code" />
        </Form.Item>
        <Form.Item name="regionName" label="Name" rules={[{ required: true, message: 'Name is required' }, { max: 100, message: 'Name must be at most 100 characters' }]}>
          <Input placeholder="Enter region name" />
        </Form.Item>
        <Form.Item name="isActive" label="Is Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
