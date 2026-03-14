import { Card, Empty, Typography } from 'antd';

const { Text } = Typography;

type FeaturePlaceholderProps = {
  title: string;
  description: string;
};

export default function FeaturePlaceholder({ title, description }: FeaturePlaceholderProps) {
  return (
    <Card title={title}>
      <Empty description={description}>
        <Text type="secondary">Flow and endpoint contracts are preserved during migration.</Text>
      </Empty>
    </Card>
  );
}
