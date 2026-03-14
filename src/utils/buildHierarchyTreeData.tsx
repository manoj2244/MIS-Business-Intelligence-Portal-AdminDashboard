import { Tag } from 'antd';

const sortByNameThenCode = (a: any, b: any, nameKey: string, codeKey: string): number => {
  const nameDiff = (a?.[nameKey] || '').localeCompare(b?.[nameKey] || '');
  if (nameDiff !== 0) return nameDiff;
  return (a?.[codeKey] || '').localeCompare(b?.[codeKey] || '');
};

const nodeTagColor: Record<string, string> = {
  REGION: 'blue',
  CLUSTER: 'green',
  BRANCH: 'gold',
  DIRECT: 'default',
};

const nodeTagLabel: Record<string, string> = {
  REGION: 'Region',
  CLUSTER: 'Cluster',
  BRANCH: 'Branch',
  DIRECT: 'Direct',
};

const buildNodeTitle = ({
  type,
  name,
  code,
  isActive = true,
  subtitle,
}: {
  type: string;
  name: string;
  code: string | null;
  isActive?: boolean;
  subtitle?: string;
}) => (
  <span className={`hierarchy-node hierarchy-node-${type.toLowerCase()}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontWeight: 500 }}>{name}</span>
      {code ? <span style={{ fontSize: 11, color: '#8c8c8c' }}>{code}</span> : null}
      {subtitle ? <span style={{ fontSize: 11, color: '#8c8c8c' }}>{subtitle}</span> : null}
    </span>
    <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
      <Tag color={nodeTagColor[type] || 'default'} style={{ marginRight: 0 }}>
        {nodeTagLabel[type] || type}
      </Tag>
      {!isActive ? (
        <Tag color="orange" style={{ marginRight: 0 }}>Inactive</Tag>
      ) : null}
    </span>
  </span>
);

const buildBranchNode = (mappingRow: any) => {
  const isActive = mappingRow?.branchIsActive ?? true;
  const key =
    mappingRow.mappingType === 'CLUSTER'
      ? `branch:cluster:${mappingRow.clusterCode}:${mappingRow.branchCode}`
      : `branch:direct:${mappingRow.regionCode}:${mappingRow.branchCode}`;

  return {
    key,
    title: buildNodeTitle({
      type: 'BRANCH',
      name: mappingRow.branchName,
      code: mappingRow.branchCode,
      isActive,
    }),
    isLeaf: true,
    meta: {
      nodeType: 'BRANCH',
      branchCode: mappingRow.branchCode,
      branchName: mappingRow.branchName,
      isActive,
      createdOn: mappingRow.branchCreatedOn || mappingRow.createdOn,
      regionCode: mappingRow.regionCode,
      regionName: mappingRow.regionName,
      clusterCode: mappingRow.clusterCode || null,
      clusterName: mappingRow.clusterName || null,
      mappingType: mappingRow.mappingType,
      mappingIsActive: mappingRow.isActive,
      mappingCreatedOn: mappingRow.createdOn,
    },
  };
};

export interface HierarchyNode {
  nodeType: string;
  regionCode?: string;
  regionName?: string;
  clusterCode?: string;
  clusterName?: string;
  branchCode?: string;
  branchName?: string;
  isActive?: boolean;
  createdOn?: string;
  mappingType?: string;
  [key: string]: any;
}

export const buildHierarchyTreeData = (
  regions: any[] = [],
  clusters: any[] = [],
  mappings: any[] = []
): { treeData: any[]; nodeByKey: Record<string, HierarchyNode> } => {
  const activeMappings = mappings.filter((item) => item?.isActive !== false);

  const clustersByRegion = clusters.reduce<Record<string, any[]>>((acc, cluster) => {
    if (!acc[cluster.regionCode]) acc[cluster.regionCode] = [];
    acc[cluster.regionCode].push(cluster);
    return acc;
  }, {});

  const directBranchesByRegion = activeMappings
    .filter((item) => item.mappingType === 'DIRECT_REGION')
    .reduce<Record<string, any[]>>((acc, mapping) => {
      if (!acc[mapping.regionCode]) acc[mapping.regionCode] = [];
      acc[mapping.regionCode].push(mapping);
      return acc;
    }, {});

  const clusterBranchesByCluster = activeMappings
    .filter((item) => item.mappingType === 'CLUSTER')
    .reduce<Record<string, any[]>>((acc, mapping) => {
      if (!acc[mapping.clusterCode]) acc[mapping.clusterCode] = [];
      acc[mapping.clusterCode].push(mapping);
      return acc;
    }, {});

  const nodeByKey: Record<string, HierarchyNode> = {};

  const treeData = [...regions]
    .sort((a, b) => sortByNameThenCode(a, b, 'regionName', 'regionCode'))
    .map((region) => {
      const clusterNodes = [...(clustersByRegion[region.regionCode] || [])]
        .sort((a, b) => sortByNameThenCode(a, b, 'clusterName', 'clusterCode'))
        .map((cluster) => {
          const branchNodes = [...(clusterBranchesByCluster[cluster.clusterCode] || [])]
            .sort((a, b) => sortByNameThenCode(a, b, 'branchName', 'branchCode'))
            .map((mappingRow) => {
              const branchNode = buildBranchNode(mappingRow);
              nodeByKey[branchNode.key] = branchNode.meta;
              return branchNode;
            });

          const clusterKey = `cluster:${cluster.clusterCode}`;
          nodeByKey[clusterKey] = {
            nodeType: 'CLUSTER',
            clusterCode: cluster.clusterCode,
            clusterName: cluster.clusterName,
            regionCode: cluster.regionCode,
            isActive: cluster.isActive,
            createdOn: cluster.createdOn,
          };

          return {
            key: clusterKey,
            title: buildNodeTitle({
              type: 'CLUSTER',
              name: cluster.clusterName,
              code: cluster.clusterCode,
              isActive: cluster.isActive,
            }),
            children: branchNodes,
          };
        });

      const directBranchRows = [...(directBranchesByRegion[region.regionCode] || [])].sort(
        (a, b) => sortByNameThenCode(a, b, 'branchName', 'branchCode')
      );

      if (directBranchRows.length > 0) {
        const directGroupKey = `direct-group:${region.regionCode}`;
        const directBranchNodes = directBranchRows.map((mappingRow) => {
          const branchNode = buildBranchNode(mappingRow);
          nodeByKey[branchNode.key] = branchNode.meta;
          return branchNode;
        });

        nodeByKey[directGroupKey] = {
          nodeType: 'DIRECT_GROUP',
          regionCode: region.regionCode,
          regionName: region.regionName,
          count: directBranchRows.length,
        };

        clusterNodes.push({
          key: directGroupKey,
          title: buildNodeTitle({
            type: 'DIRECT',
            name: 'Direct Branches',
            code: null,
            subtitle: `${directBranchRows.length} branches`,
          }),
          children: directBranchNodes,
        });
      }

      const regionKey = `region:${region.regionCode}`;
      nodeByKey[regionKey] = {
        nodeType: 'REGION',
        regionCode: region.regionCode,
        regionName: region.regionName,
        isActive: region.isActive,
        createdOn: region.createdOn,
      };

      return {
        key: regionKey,
        title: buildNodeTitle({
          type: 'REGION',
          name: region.regionName,
          code: region.regionCode,
          isActive: region.isActive,
        }),
        children: clusterNodes,
      };
    });

  return { treeData, nodeByKey };
};
