import { Alert, Form, Input, Modal, Switch } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { getApiErrorMessage } from '../../utils/error';

const nodeLabels: Record<string, { title: string; codeKey: string; nameKey: string }> = {
  REGION: { title: 'Edit Region', codeKey: 'regionCode', nameKey: 'regionName' },
  CLUSTER: { title: 'Edit Cluster', codeKey: 'clusterCode', nameKey: 'clusterName' },
  BRANCH: { title: 'Edit Branch', codeKey: 'branchCode', nameKey: 'branchName' },
};

type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
  node: any;
};

export default function EditNodeModal({ open, onCancel, onSubmit, node }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const config = useMemo(() => nodeLabels[node?.nodeType] || null, [node?.nodeType]);

  useEffect(() => {
    if (!open || !node || !config) return;
    form.setFieldsValue({ code: node[config.codeKey], name: node[config.nameKey], isActive: !!node.isActive });
    setServerError('');
  }, [open, node, config, form]);

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({ code: values.code?.trim(), name: values.name?.trim(), isActive: !!values.isActive });
      form.resetFields();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to update record'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!config) return null;

  return (
    <Modal title={config.title} open={open} onCancel={onCancel} onOk={() => form.submit()} confirmLoading={submitting} destroyOnClose okText="Save">
      {serverError ? <Alert style={{ marginBottom: 12 }} type="error" showIcon message={serverError} /> : null}
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="code" label="Code" rules={[{ required: true, message: 'Code is required' }, { max: 10, message: 'Code must be at most 10 characters' }]}>
          <Input placeholder="Enter code" />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Name is required' }, { max: 150, message: 'Name must be at most 150 characters' }]}>
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item name="isActive" label="Is Active" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
}
