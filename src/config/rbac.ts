export const rbac = {
  dashboard: ['*'],
}

export const hasRoleAccess = (role: string | undefined, allowedRoles: string[]) => {
  if (allowedRoles.includes('*')) {
    return true
  }

  if (!role) {
    return false
  }

  const normalizedRole = role.toUpperCase()
  return allowedRoles.map((item) => item.toUpperCase()).includes(normalizedRole)
}
