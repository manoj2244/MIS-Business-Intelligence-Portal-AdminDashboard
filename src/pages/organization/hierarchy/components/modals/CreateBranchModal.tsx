import { Alert, Form, Input, Modal, Radio, Select, Spin, Switch } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useBranchesQuery } from '../../hooks/useHierarchyQueries';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { getApiErrorMessage } from '../../utils/error';

const { Option } = Select;
const SOURCE_EXISTING = 'EXISTING';
const SOURCE_CUSTOM = 'CUSTOM';

type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
  parentContext: any;
};

export default function CreateBranchModal({ open, onCancel, onSubmit, parentContext }: Props) {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [branchSearch, setBranchSearch] = useState('');

  const debouncedBranchSearch = useDebouncedValue(branchSearch, 300);
  const { data: branchOptions, loading: branchLoading } = useBranchesQuery(debouncedBranchSearch, open);

  const sourceType = Form.useWatch('sourceType', form);
  const selectedBranchCode = Form.useWatch('selectedBranchCode', form);
  const isCustomBranch = sourceType === SOURCE_CUSTOM;

  const contextLabel = useMemo(() => {
    if (!parentContext) return null;
    if (parentContext.parentType === 'CLUSTER') {
      return `This branch will be mapped under Cluster ${parentContext.clusterName} (${parentContext.clusterCode}).`;
    }
    return `This branch will be mapped directly under Region ${parentContext.regionName} (${parentContext.regionCode}).`;
  }, [parentContext]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({ sourceType: SOURCE_EXISTING, selectedBranchCode: undefined, branchCode: '', branchName: '', isActive: true });
    setServerError('');
    setBranchSearch('');
  }, [open, form]);

  useEffect(() => {
    if (isCustomBranch) return;
    if (!selectedBranchCode) {
      form.setFieldsValue({ branchCode: '' });
      return;
    }
    form.setFieldsValue({ branchCode: selectedBranchCode });
  }, [selectedBranchCode, form, isCustomBranch]);

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    setServerError('');
    try {
      if (values.sourceType === SOURCE_CUSTOM) {
        await onSubmit({ mode: SOURCE_CUSTOM, branchCode: values.branchCode?.trim(), branchName: values.branchName?.trim(), isActive: !!values.isActive });
      } else {
        await onSubmit({ mode: SOURCE_EXISTING, branchCode: (values.branchCode || values.selectedBranchCode)?.trim() });
      }
      form.resetFields();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Failed to create or map branch'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="Create Branch" open={open} onCancel={onCancel} onOk={() => form.submit()} confirmLoading={submitting} destroyOnClose okText={isCustomBranch ? 'Create & Map' : 'Map'}>
      {contextLabel ? <Alert style={{ marginBottom: 12 }} type="info" showIcon message={contextLabel} /> : null}
      {serverError ? <Alert style={{ marginBottom: 12 }} type="error" showIcon message={serverError} /> : null}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="sourceType" label="Branch Option" rules={[{ required: true, message: 'Branch option is required' }]}>
          <Radio.Group>
            <Radio.Button value={SOURCE_EXISTING}>Use Existing Branch</Radio.Button>
            <Radio.Button value={SOURCE_CUSTOM}>Create Custom Branch</Radio.Button>
          </Radio.Group>
        </Form.Item>

        {!isCustomBranch ? (
          <Form.Item name="selectedBranchCode" label="Branch" rules={[{ required: true, message: 'Branch is required' }]}>
            <Select showSearch allowClear placeholder="Search and select branch" onSearch={setBranchSearch} filterOption={false} notFoundContent={branchLoading ? <Spin size="small" /> : null}>
              {branchOptions.map((branch: any) => (
                <Option key={branch.branchCode} value={branch.branchCode}>
                  {branch.branchName} ({branch.branchCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : null}

        <Form.Item name="branchCode" label="Code" rules={[{ required: true, message: 'Code is required' }, { max: 10, message: 'Code must be at most 10 characters' }]}>
          <Input placeholder={isCustomBranch ? 'Enter new branch code' : 'Branch code auto-filled from selected branch'} disabled={!isCustomBranch} />
        </Form.Item>

        {isCustomBranch ? (
          <Form.Item name="branchName" label="Name" rules={[{ required: true, message: 'Name is required' }, { max: 150, message: 'Name must be at most 150 characters' }]}>
            <Input placeholder="Enter new branch name" />
          </Form.Item>
        ) : null}

        {isCustomBranch ? (
          <Form.Item name="isActive" label="Is Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        ) : null}
      </Form>
    </Modal>
  );
}
