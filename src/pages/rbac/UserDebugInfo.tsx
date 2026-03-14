import { Button, Card, Descriptions, Space, Tag } from 'antd';
import { useAuthStore } from '../../stores/authStore';
import { getAuthRole } from '../../utils/authUtil';

export default function UserDebugInfo() {
  const { user, permissions, userRole, allowedBranches, isAuthenticated } = useAuthStore();
  const roleFromUtil = getAuthRole();

  return (
    <Card title="User Debug Information" className="max-w-5xl">
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Is Authenticated">
          <Tag color={isAuthenticated ? 'green' : 'red'}>{isAuthenticated ? 'Yes' : 'No'}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="User Object">
          <pre className="max-h-52 overflow-auto rounded bg-slate-900 p-3 text-xs text-slate-100">
            {JSON.stringify(user, null, 2)}
          </pre>
        </Descriptions.Item>

        <Descriptions.Item label="Role (from auth util)">
          <Tag color="blue">{roleFromUtil || 'No Role'}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Role (from RBAC)">
          <Tag color="purple">{userRole || 'No RBAC Role'}</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Permissions Count">
          <Tag color="green">{permissions?.length || 0} permissions</Tag>
        </Descriptions.Item>

        <Descriptions.Item label="Permissions">
          <Space wrap>
            {permissions?.length ? (
              permissions.map((permission) => <Tag key={permission}>{permission}</Tag>)
            ) : (
              <Tag>No permissions</Tag>
            )}
          </Space>
        </Descriptions.Item>

        <Descriptions.Item label="Allowed Branches">
          <Tag color="cyan">{allowedBranches?.length || 0} branches</Tag>
        </Descriptions.Item>
      </Descriptions>

      <div className="mt-4">
        <Button
          type="primary"
          onClick={() => {
            console.log('Full Auth Store:', useAuthStore.getState());
            console.log('Role from util:', roleFromUtil);
          }}
        >
          Log Full State to Console
        </Button>
      </div>
    </Card>
  );
}
