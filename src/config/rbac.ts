export const rbac = {
  dashboard: ['ADMIN', 'HR'],
  users: ['ADMIN'],
  roleManagement: ['ADMIN'],
  userAccess: ['ADMIN'],
  debug: ['ADMIN', 'HR'],
  hierarchyManager: ['ADMIN'],
  financialAccountMapping: ['ADMIN'],
};

export const hasRoleAccess = (role: string | undefined | null, allowedRoles: string[]): boolean => {
  if (allowedRoles.includes('*') || allowedRoles.includes('ALL')) {
    return true;
  }

  if (!role) {
    return false;
  }

  const normalizedRole = role.toUpperCase();
  return allowedRoles.map((item) => item.toUpperCase()).includes(normalizedRole);
};
