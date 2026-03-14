import { Alert, Form, Modal, Radio, Select, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useBranchesQuery, useMappingsQuery } from '../../hooks/useHierarchyQueries';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import { getApiErrorMessage } from '../../utils/error';

const { Option, OptGroup } = Select;

type Props = {
  open: boolean;
  onCancel: () => void;
  onSubmit: (payload: any) => Promise<void>;
  mode: 'move' | 'assign';
  initialBranchCode?: string;
  initialParent?: any;
  regions: any[];
  clusters: any[];
};

export default function AssignMoveBranchModal({ open, onCancel, onSubmit, mode, initialBranchCode, initialParent, regions, clusters }: Props) {
  const [form] = Form.useForm();
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [branchSearch, setBranchSearch] = useState('');

  const debouncedBranchSearch = useDebouncedValue(branchSearch, 300);
  const { data: branchOptions, loading: branchLoading } = useBranchesQuery(debouncedBranchSearch, open);

  const selectedBranchCode = Form.useWatch('branchCode', form);
  const parentType = Form.useWatch('parentType', form);

  const { data: activeBranchMappings } = useMappingsQuery({ qBranch: selectedBranchCode, isActive: true }, open && !!selectedBranchCode);

  const activeMapping = useMemo(() => {
    if (!selectedBranchCode) return null;
    return (activeBranchMappings || []).find((item: any) => item.branchCode === selectedBranchCode && item.isActive) || null;
  }, [activeBranchMappings, selectedBranchCode]);

  const clusterGroups = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    clusters.forEach((cluster: any) => {
      if (!grouped[cluster.regionCode]) grouped[cluster.regionCode] = [];
      grouped[cluster.regionCode].push(cluster);
    });
    return grouped;
  }, [clusters]);

  const regionByCode = useMemo(() => {
    return regions.reduce<Record<string, any>>((acc, region) => {
      acc[region.regionCode] = region;
      return acc;
    }, {});
  }, [regions]);

  useEffect(() => {
    if (!open) return;
    form.setFieldsValue({
      branchCode: initialBranchCode || undefined,
      parentType: initialParent?.parentType || 'REGION_DIRECT',
      clusterCode: initialParent?.clusterCode || undefined,
      regionCode: initialParent?.regionCode || undefined,
    });
    setServerError('');
    setBranchSearch('');
  }, [open, form, initialBranchCode, initialParent]);

  useEffect(() => {
    if (parentType === 'CLUSTER') {
      form.setFieldsValue({ regionCode: undefined });
      return;
    }
    form.setFieldsValue({ clusterCode: undefined });
  }, [parentType, form]);

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit({
        branchCode: values.branchCode,
        parentType: values.parentType,
        clusterCode: values.parentType === 'CLUSTER' ? values.clusterCode : undefined,
        regionCode: values.parentType === 'REGION_DIRECT' ? values.regionCode : undefined,
      });
      form.resetFields();
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Unable to update branch mapping'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={mode === 'move' ? 'Move Branch' : 'Assign Branch'} open={open} onCancel={onCancel} onOk={() => form.submit()} confirmLoading={submitting} okText={mode === 'move' ? 'Move' : 'Assign'} destroyOnClose>
      {serverError ? <Alert style={{ marginBottom: 12 }} type="error" showIcon message={serverError} /> : null}
      {activeMapping ? (
        <Alert
          style={{ marginBottom: 12 }}
          type="warning"
          showIcon
          message="This will move the branch"
          description={`Current mapping: ${activeMapping.mappingType} under ${activeMapping.clusterName || activeMapping.regionName}`}
        />
      ) : null}

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="branchCode" label="Branch" rules={[{ required: true, message: 'Branch is required' }]}>
          <Select showSearch allowClear placeholder="Select branch" disabled={mode === 'move' && !!initialBranchCode} onSearch={setBranchSearch} filterOption={false} notFoundContent={branchLoading ? <Spin size="small" /> : null}>
            {branchOptions.map((branch: any) => (
              <Option key={branch.branchCode} value={branch.branchCode}>
                {branch.branchName} ({branch.branchCode})
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="parentType" label="Parent Type" rules={[{ required: true, message: 'Parent type is required' }]}>
          <Radio.Group>
            <Radio value="CLUSTER">Cluster</Radio>
            <Radio value="REGION_DIRECT">Region Direct</Radio>
          </Radio.Group>
        </Form.Item>

        {parentType === 'CLUSTER' ? (
          <Form.Item name="clusterCode" label="Cluster" rules={[{ required: true, message: 'Cluster is required' }]}>
            <Select showSearch optionFilterProp="children" placeholder="Select cluster">
              {Object.keys(clusterGroups).map((regionCode) => (
                <OptGroup key={regionCode} label={`${regionByCode?.[regionCode]?.regionName || regionCode} (${regionCode})`}>
                  {clusterGroups[regionCode].map((cluster: any) => (
                    <Option key={cluster.clusterCode} value={cluster.clusterCode}>
                      {cluster.clusterName} ({cluster.clusterCode})
                    </Option>
                  ))}
                </OptGroup>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item name="regionCode" label="Region" rules={[{ required: true, message: 'Region is required' }]}>
            <Select showSearch optionFilterProp="children" placeholder="Select region">
              {regions.map((region: any) => (
                <Option key={region.regionCode} value={region.regionCode}>
                  {region.regionName} ({region.regionCode})
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
}
