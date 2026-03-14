import { Tag } from 'antd';
import type { ReactNode } from 'react';

type AnyObj = Record<string, any>;

type TreeNode = {
  key: string;
  title: ReactNode;
  children?: TreeNode[];
  isLeaf?: boolean;
  meta?: AnyObj;
};

const nodeTagColor: Record<string, string> = {
  REGION: 'blue',
  CLUSTER: 'cyan',
  BRANCH: 'purple',
  DIRECT: 'gold',
};

const nodeTagLabel: Record<string, string> = {
  REGION: 'Region',
  CLUSTER: 'Cluster',
  BRANCH: 'Branch',
  DIRECT: 'Direct',
};

const sortByNameThenCode = (a: AnyObj, b: AnyObj, nameKey: string, codeKey: string): number => {
  const nameDiff = String(a?.[nameKey] || '').localeCompare(String(b?.[nameKey] || ''));
  if (nameDiff !== 0) return nameDiff;
  return String(a?.[codeKey] || '').localeCompare(String(b?.[codeKey] || ''));
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
  code?: string | null;
  isActive?: boolean;
  subtitle?: string;
}) => (
  <span className={`h-node h-node-${type.toLowerCase()}`}>
    <span className="h-node-body">
      <span className="h-node-name">{name}</span>
      {code ? <span className="h-node-code">{code}</span> : null}
      {subtitle ? <span className="h-node-sub">{subtitle}</span> : null}
    </span>
    <span className="h-node-right">
      <Tag color={nodeTagColor[type] || 'default'}>{nodeTagLabel[type] || type}</Tag>
      {!isActive ? <Tag color="orange">Inactive</Tag> : null}
    </span>
  </span>
);

const buildBranchNode = (mappingRow: AnyObj): TreeNode => {
  const isActive = mappingRow?.branchIsActive ?? true;
  return {
    key:
      mappingRow.mappingType === 'CLUSTER'
        ? `branch:cluster:${mappingRow.clusterCode}:${mappingRow.branchCode}`
        : `branch:direct:${mappingRow.regionCode}:${mappingRow.branchCode}`,
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

export const buildHierarchyTreeData = (
  regions: AnyObj[] = [],
  clusters: AnyObj[] = [],
  mappings: AnyObj[] = []
): { treeData: TreeNode[]; nodeByKey: Record<string, AnyObj> } => {
  const activeMappings = mappings.filter((item) => item?.isActive !== false);

  const clustersByRegion = clusters.reduce<Record<string, AnyObj[]>>((acc, cluster) => {
    if (!acc[cluster.regionCode]) acc[cluster.regionCode] = [];
    acc[cluster.regionCode].push(cluster);
    return acc;
  }, {});

  const directBranchesByRegion = activeMappings
    .filter((item) => item.mappingType === 'DIRECT_REGION')
    .reduce<Record<string, AnyObj[]>>((acc, mapping) => {
      if (!acc[mapping.regionCode]) acc[mapping.regionCode] = [];
      acc[mapping.regionCode].push(mapping);
      return acc;
    }, {});

  const clusterBranchesByCluster = activeMappings
    .filter((item) => item.mappingType === 'CLUSTER')
    .reduce<Record<string, AnyObj[]>>((acc, mapping) => {
      if (!acc[mapping.clusterCode]) acc[mapping.clusterCode] = [];
      acc[mapping.clusterCode].push(mapping);
      return acc;
    }, {});

  const nodeByKey: Record<string, AnyObj> = {};

  const treeData: TreeNode[] = [...regions]
    .sort((a, b) => sortByNameThenCode(a, b, 'regionName', 'regionCode'))
    .map((region) => {
      const clusterNodes: TreeNode[] = [...(clustersByRegion[region.regionCode] || [])]
        .sort((a, b) => sortByNameThenCode(a, b, 'clusterName', 'clusterCode'))
        .map((cluster) => {
          const branchNodes = [...(clusterBranchesByCluster[cluster.clusterCode] || [])]
            .sort((a, b) => sortByNameThenCode(a, b, 'branchName', 'branchCode'))
            .map((mappingRow) => {
              const branchNode = buildBranchNode(mappingRow);
              nodeByKey[branchNode.key] = branchNode.meta || {};
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

      const directBranchRows = [...(directBranchesByRegion[region.regionCode] || [])].sort((a, b) =>
        sortByNameThenCode(a, b, 'branchName', 'branchCode')
      );

      if (directBranchRows.length > 0) {
        const directGroupKey = `direct-group:${region.regionCode}`;
        const directBranchNodes = directBranchRows.map((mappingRow) => {
          const branchNode = buildBranchNode(mappingRow);
          nodeByKey[branchNode.key] = branchNode.meta || {};
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
