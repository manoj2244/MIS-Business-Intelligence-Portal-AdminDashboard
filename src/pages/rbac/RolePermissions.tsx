import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Input,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { rbacApi } from '../../services/rbacApi';

const { Text } = Typography;

export default function RolePermissions() {
  const navigate = useNavigate();
  const { roleCode } = useParams();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [role, setRole] = useState<any>(null);
  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  // key = `menuKey.submenuKey`, value = open/closed
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // When catalog loads, open the first submenu of each menu by default
  useEffect(() => {
    if (!catalog.length) return;
    const defaults: Record<string, boolean> = {};
    catalog.forEach((menu) => {
      if (menu.submenus?.length) {
        const firstKey = `${menu.menuKey}.${menu.submenus[0].submenuKey}`;
        defaults[firstKey] = true;
      }
    });
    setOpenSubmenus(defaults);
  }, [catalog]);

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  const fetchRolePermissions = async () => {
    if (!roleCode) return;

    setLoading(true);
    try {
      const data = await rbacApi.getRolePermissionConfig(roleCode);
      setRole(data?.role || null);
      setCatalog(data?.permissionCatalog || []);
      setSelectedCodes(data?.assignedPermissionCodes || []);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to load role permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolePermissions();
  }, [roleCode]);

  const toggleSingleCode = (code: string, checked: boolean) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      if (checked) next.add(code);
      else next.delete(code);
      return [...next];
    });
  };

  const toggleCodeSet = (codes: string[], checked: boolean) => {
    setSelectedCodes((prev) => {
      const next = new Set(prev);
      codes.forEach((code) => {
        if (checked) next.add(code);
        else next.delete(code);
      });
      return [...next];
    });
  };

  const filteredCatalog = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return catalog;

    return (catalog || [])
      .map((menu) => {
        const filteredSubmenus = (menu.submenus || [])
          .map((submenu: any) => ({
            ...submenu,
            permissions: (submenu.permissions || []).filter((permission: any) => {
              const label = (permission.permissionLabel || '').toLowerCase();
              const code = (permission.permissionCode || '').toLowerCase();
              return label.includes(keyword) || code.includes(keyword);
            }),
          }))
          .filter((submenu: any) => submenu.permissions.length > 0);

        return {
          ...menu,
          submenus: filteredSubmenus,
        };
      })
      .filter((menu) => menu.submenus.length > 0);
  }, [catalog, searchText]);

  const handleSave = async () => {
    if (!roleCode) return;

    setSaving(true);
    try {
      await rbacApi.assignPermissionsToRole(roleCode, selectedCodes);
      message.success('Permissions updated successfully');
      await fetchRolePermissions();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      className="ui-page pro-card-gradient"
      title={
        <Space>
          <Text strong>Assign Permissions</Text>
          {role ? (
            <Tag color="blue">
              {role.roleName} ({role.roleCode})
            </Tag>
          ) : null}
        </Space>
      }
      extra={
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/rbac/role-management')}>
            Back
          </Button>
          <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={saving}>
            Save Permissions
          </Button>
        </Space>
      }
    >
      {loading ? (
        <div className="py-8 text-center">
          <Spin />
        </div>
      ) : !catalog.length ? (
        <Empty description="No permission catalog available" />
      ) : (
        <Space direction="vertical" size={14} className="w-full">
          <div className="ui-sticky-toolbar">
            <Card size="small" className="pro-card-gradient">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Input.Search
                allowClear
                placeholder="Search permissions..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                className="max-w-sm"
              />
              <Tag color="blue">Selected: {selectedCodes.length}</Tag>
            </div>
            </Card>
          </div>

          {!filteredCatalog.length ? (
            <Empty description="No permissions match your search" />
          ) : (
            filteredCatalog.map((menu) => {
              const allMenuCodes = (menu.submenus || []).flatMap((s: any) =>
                (s.permissions || []).map((p: any) => p.permissionCode).filter(Boolean)
              );
              const menuSelectedCount = allMenuCodes.filter((c: string) => selectedSet.has(c)).length;
              const menuAllChecked = allMenuCodes.length > 0 && menuSelectedCount === allMenuCodes.length;
              const menuIndeterminate = menuSelectedCount > 0 && menuSelectedCount < allMenuCodes.length;

              return (
                <Card
                  key={menu.menuKey}
                  size="small"
                  className="pro-card-gradient perm-menu-card"
                  title={
                    <div className="flex items-center justify-between gap-2">
                      <Text strong style={{ fontSize: 13, color: '#1e40af' }}>{menu.menuLabel}</Text>
                      <Checkbox
                        checked={menuAllChecked}
                        indeterminate={menuIndeterminate}
                        onChange={(e) => toggleCodeSet(allMenuCodes, e.target.checked)}
                        style={{ fontSize: 12 }}
                      >
                        <span style={{ fontSize: 12, color: '#475569' }}>Select All</span>
                      </Checkbox>
                    </div>
                  }
                >
                  <div className="perm-submenus-wrapper">
                    {(menu.submenus || []).map((submenu: any) => {
                      const submenuCodes = (submenu.permissions || [])
                        .map((permission: any) => permission.permissionCode)
                        .filter(Boolean);
                      const selectedCount = submenuCodes.filter((code: string) => selectedSet.has(code)).length;
                      const allChecked = submenuCodes.length > 0 && selectedCount === submenuCodes.length;
                      const indeterminate = selectedCount > 0 && selectedCount < submenuCodes.length;

                      const submenuKey = `${menu.menuKey}.${submenu.submenuKey}`;
                      const isOpen = !!openSubmenus[submenuKey];

                      return (
                        <div key={submenuKey} className="perm-submenu-section">
                          {/* Collapsible submenu header */}
                          <div
                            className="perm-submenu-header perm-submenu-header--clickable"
                            onClick={() => toggleSubmenu(submenuKey)}
                          >
                            <span className="perm-submenu-label">
                              <DownOutlined
                                className="perm-submenu-chevron"
                                style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                              />
                              {submenu.submenuLabel}
                              <span className="perm-submenu-count">{submenu.permissions?.length || 0}</span>
                            </span>
                            <div
                              onClick={(e) => e.stopPropagation()}
                              style={{ display: 'flex', alignItems: 'center' }}
                            >
                              <Checkbox
                                checked={allChecked}
                                indeterminate={indeterminate}
                                onChange={(e) => toggleCodeSet(submenuCodes, e.target.checked)}
                              >
                                <span style={{ fontSize: 11, color: '#475569' }}>All</span>
                              </Checkbox>
                            </div>
                          </div>

                          {/* Collapsible permission cards */}
                          {isOpen && (
                            <div className="perm-items-grid">
                              {(submenu.permissions || []).map((permission: any) => {
                                const isChecked = selectedSet.has(permission.permissionCode);
                                return (
                                  <label
                                    key={permission.permissionCode}
                                    className={`perm-item-card${isChecked ? ' perm-item-card--active' : ''}`}
                                  >
                                    <div className="perm-item-card-left">
                                      <span className="perm-item-card-label">{permission.permissionLabel}</span>
                                    </div>
                                    <Checkbox
                                      checked={isChecked}
                                      onChange={(e) =>
                                        toggleSingleCode(permission.permissionCode, e.target.checked)
                                      }
                                    />
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })
          )}
        </Space>
      )}
    </Card>
  );
}
