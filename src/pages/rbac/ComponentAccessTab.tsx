import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Checkbox, Empty, Input, Space, Spin, Tag, Typography, message } from 'antd';
import { SaveOutlined, DownOutlined } from '@ant-design/icons';
import { rbacApi } from '../../services/rbacApi';

const { Text } = Typography;

// ── Catalog (mirrors the permissions catalog shape) ──────────────────────────

const CATALOG = [
  {
    menuKey: 'credit',
    menuLabel: 'Credit Dashboard',
    submenus: [
      {
        submenuKey: 'kpi',
        submenuLabel: 'KPI Cards',
        items: [
          { key: 'credit.kpi.total_loan',        label: 'Total Loan'                        },
          { key: 'credit.kpi.total_accounts',     label: 'No Of Accounts'                    },
          { key: 'credit.kpi.od_position',        label: 'OD Position'                       },
          { key: 'credit.kpi.expired_loans',      label: 'Expired Loans'                     },
          { key: 'credit.kpi.accounts_opened',    label: 'Accounts Opened'                   },
          { key: 'credit.kpi.loan_disbursed',     label: 'Loan Disbursed'                    },
          { key: 'credit.kpi.loan_kpi',           label: 'Loan KPI'                          },
          { key: 'credit.kpi.segment_breakdown',  label: 'Segment Breakdown'                 },
          { key: 'credit.kpi.loan_product',       label: 'Loan Product'                      },
          { key: 'credit.kpi.loan_air',           label: 'AIR'                               },
        ],
      },
      {
        submenuKey: 'chart',
        submenuLabel: 'Charts',
        items: [
          { key: 'credit.chart.loan_trend',                  label: 'Loan Trend'                        },
          { key: 'credit.chart.segment',                     label: 'Loan Segment Breakdown'            },
          { key: 'credit.chart.ind_inst',                    label: 'Individual vs Institutional'       },
          { key: 'credit.chart.term_revolving',              label: 'Term vs Revolving'                 },
          { key: 'credit.chart.od_position',                 label: 'OD Position'                       },
          { key: 'credit.chart.yield',                       label: 'Segment-wise Yield'                },
          { key: 'credit.chart.movement',                    label: 'Loan Movement'                     },
          { key: 'credit.chart.ticket_size',                 label: 'Loan Ticket Size'                  },
          { key: 'credit.chart.maturity_expired',            label: 'Maturity / Expired'                },
          { key: 'credit.chart.disbursement',                label: 'Disbursement vs Settlement'        },
          { key: 'credit.chart.branch_section',              label: 'Top / Bottom 5 Branches'           },
        ],
      },
      {
        submenuKey: 'table',
        submenuLabel: 'Tables',
        items: [
          { key: 'credit.table.top_borrowers_institutional', label: 'Top 20 Institutional Borrowers'   },
          { key: 'credit.table.top_borrowers_individual',    label: 'Top 20 Individual Borrowers'      },
        ],
      },
    ],
  },
  {
    menuKey: 'deposit',
    menuLabel: 'Deposit Analysis',
    submenus: [
      {
        submenuKey: 'kpi',
        submenuLabel: 'KPI Cards',
        items: [
          { key: 'deposit.kpi.total_deposits',     label: 'Total Deposits'         },
          { key: 'deposit.kpi.customer_count',     label: 'Customer Count'         },
          { key: 'deposit.kpi.dormant_accounts',   label: 'Dormant Accounts'       },
          { key: 'deposit.kpi.blacklist_accounts', label: 'Blacklist Accounts'     },
          { key: 'deposit.kpi.product_breakdown',  label: 'Product Breakdown'      },
          { key: 'deposit.kpi.accounts_opened',    label: 'Accounts Opened'        },
          { key: 'deposit.kpi.accounts_closed',    label: 'Accounts Closed'        },
        ],
      },
      {
        submenuKey: 'chart',
        submenuLabel: 'Charts',
        items: [
          { key: 'deposit.chart.trend_analysis',   label: 'Trend Analysis'         },
          { key: 'deposit.chart.drilldown',         label: 'Deposit Drill Down'     },
          { key: 'deposit.chart.ind_inst',          label: 'Individual vs Institutional' },
          { key: 'deposit.chart.deposit_mix',       label: 'Deposit Mix Trend'      },
          { key: 'deposit.chart.cof_product',       label: 'COF by Product'         },
          { key: 'deposit.chart.cof_trend',         label: 'COF Trend'              },
          { key: 'deposit.chart.maturity_profile',  label: 'Maturity Profile'       },
          { key: 'deposit.chart.amount_bracket',    label: 'Amount Bracket'         },
          { key: 'deposit.chart.interest_rate',     label: 'Interest Rate'          },
        ],
      },
      {
        submenuKey: 'table',
        submenuLabel: 'Tables',
        items: [
          { key: 'deposit.table.top_depositors',   label: 'Top Depositors'         },
          { key: 'deposit.table.major_movements',  label: 'Major Movements'        },
          { key: 'deposit.table.branch_growth',    label: 'Branch Growth'          },
          { key: 'deposit.table.branch_ranking',   label: 'Branch Ranking'         },
        ],
      },
    ],
  },
  {
    menuKey: 'fd',
    menuLabel: 'FD Analysis',
    submenus: [
      {
        submenuKey: 'kpi',
        submenuLabel: 'KPI Cards',
        items: [
          { key: 'fd.kpi.total_fd',             label: 'Total FD'               },
          { key: 'fd.kpi.fd_share',             label: 'FD Share'               },
          { key: 'fd.kpi.avg_fd_rate',          label: 'Average FD Rate'        },
          { key: 'fd.kpi.maturity_90d',         label: 'Maturing in 90 Days'    },
          { key: 'fd.kpi.top20_concentration',  label: 'Top 20 Concentration'   },
        ],
      },
      {
        submenuKey: 'chart',
        submenuLabel: 'Charts',
        items: [
          { key: 'fd.chart.product_wise',       label: 'Product-wise FD'        },
          { key: 'fd.chart.maturity_ladder',    label: 'Maturity Ladder'        },
          { key: 'fd.chart.short_bucket',       label: 'Short Bucket'           },
          { key: 'fd.chart.branch_rates',       label: 'Branch Rates'           },
        ],
      },
      {
        submenuKey: 'table',
        submenuLabel: 'Tables',
        items: [
          { key: 'fd.table.maturity_fd',        label: 'Maturity Fixed Deposit' },
        ],
      },
    ],
  },
];

const ALL_KEYS = CATALOG.flatMap(m => m.submenus.flatMap(s => s.items.map(i => i.key)));

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  userCode: string | null;
}

export default function ComponentAccessTab({ userCode }: Props) {
  const [fetching, setFetching]       = useState(false);
  const [saving, setSaving]           = useState(false);
  const [searchText, setSearchText]   = useState('');
  // visibleKeys: keys visible to the user (checked = visible, unchecked = hidden)
  const [visibleKeys, setVisibleKeys] = useState<string[]>(ALL_KEYS);
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  // Open first submenu of each menu by default
  useEffect(() => {
    const defaults: Record<string, boolean> = {};
    CATALOG.forEach(menu => {
      if (menu.submenus.length) {
        defaults[`${menu.menuKey}.${menu.submenus[0].submenuKey}`] = true;
      }
    });
    setOpenSubmenus(defaults);
  }, []);

  // Fetch when user changes
  useEffect(() => {
    if (!userCode) { setVisibleKeys(ALL_KEYS); return; }
    setFetching(true);
    rbacApi.getComponentAccess(userCode)
      .then(data => {
        const blocked = new Set(data.blockedComponents || []);
        setVisibleKeys(ALL_KEYS.filter(k => !blocked.has(k)));
      })
      .catch(() => setVisibleKeys(ALL_KEYS))
      .finally(() => setFetching(false));
  }, [userCode]);

  const visibleSet = useMemo(() => new Set(visibleKeys), [visibleKeys]);

  const toggleSubmenu = (key: string) =>
    setOpenSubmenus(prev => ({ ...prev, [key]: !prev[key] }));

  const toggleSingle = (key: string, checked: boolean) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      if (checked) next.add(key); else next.delete(key);
      return [...next];
    });
  };

  const toggleSet = (keys: string[], checked: boolean) => {
    setVisibleKeys(prev => {
      const next = new Set(prev);
      keys.forEach(k => { if (checked) next.add(k); else next.delete(k); });
      return [...next];
    });
  };

  const handleSave = async () => {
    if (!userCode) { message.warning('Select a user first'); return; }
    setSaving(true);
    try {
      const blocked = ALL_KEYS.filter(k => !visibleSet.has(k));
      await rbacApi.saveComponentAccess(userCode, blocked);
      message.success('Component access saved successfully');
    } catch {
      message.error('Failed to save component access');
    } finally { setSaving(false); }
  };

  // Search filter
  const filteredCatalog = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    if (!kw) return CATALOG;
    return CATALOG.map(menu => ({
      ...menu,
      submenus: menu.submenus
        .map(sub => ({ ...sub, items: sub.items.filter(i => i.label.toLowerCase().includes(kw) || i.key.includes(kw)) }))
        .filter(sub => sub.items.length > 0),
    })).filter(menu => menu.submenus.length > 0);
  }, [searchText]);

  const hiddenCount = ALL_KEYS.length - visibleKeys.length;

  if (!userCode) {
    return <Empty description="Select a user to manage component access" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginTop: 40 }} />;
  }

  if (fetching) {
    return <div style={{ padding: 40, textAlign: 'center' }}><Spin tip="Loading…" /></div>;
  }

  return (
    <Space direction="vertical" size={14} className="w-full">
      {/* Sticky search bar */}
      <div className="ui-sticky-toolbar">
        <Card size="small" className="pro-card-gradient">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Input.Search
              allowClear
              placeholder="Search components..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="max-w-sm"
            />
            <Space>
              <Tag color={hiddenCount === 0 ? 'green' : 'red'}>
                {hiddenCount === 0 ? 'Full Access' : `${hiddenCount} hidden`}
              </Tag>
              <Tag color="blue">Visible: {visibleKeys.length} / {ALL_KEYS.length}</Tag>
            </Space>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Save Component Access
            </Button>
          </div>
        </Card>
      </div>

      {!filteredCatalog.length ? (
        <Empty description="No components match your search" />
      ) : (
        filteredCatalog.map(menu => {
          const allMenuKeys = menu.submenus.flatMap(s => s.items.map(i => i.key));
          const menuVisibleCount = allMenuKeys.filter(k => visibleSet.has(k)).length;
          const menuAllChecked = allMenuKeys.length > 0 && menuVisibleCount === allMenuKeys.length;
          const menuIndeterminate = menuVisibleCount > 0 && menuVisibleCount < allMenuKeys.length;

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
                    onChange={e => toggleSet(allMenuKeys, e.target.checked)}
                    style={{ fontSize: 12 }}
                  >
                    <span style={{ fontSize: 12, color: '#475569' }}>Select All</span>
                  </Checkbox>
                </div>
              }
            >
              <div className="perm-submenus-wrapper">
                {menu.submenus.map(sub => {
                  const subKeys = sub.items.map(i => i.key);
                  const subVisibleCount = subKeys.filter(k => visibleSet.has(k)).length;
                  const allChecked = subKeys.length > 0 && subVisibleCount === subKeys.length;
                  const indeterminate = subVisibleCount > 0 && subVisibleCount < subKeys.length;
                  const submenuKey = `${menu.menuKey}.${sub.submenuKey}`;
                  const isOpen = !!openSubmenus[submenuKey];

                  return (
                    <div key={submenuKey} className="perm-submenu-section">
                      <div
                        className="perm-submenu-header perm-submenu-header--clickable"
                        onClick={() => toggleSubmenu(submenuKey)}
                      >
                        <span className="perm-submenu-label">
                          <DownOutlined
                            className="perm-submenu-chevron"
                            style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                          />
                          {sub.submenuLabel}
                          <span className="perm-submenu-count">{sub.items.length}</span>
                        </span>
                        <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center' }}>
                          <Checkbox
                            checked={allChecked}
                            indeterminate={indeterminate}
                            onChange={e => toggleSet(subKeys, e.target.checked)}
                          >
                            <span style={{ fontSize: 11, color: '#475569' }}>All</span>
                          </Checkbox>
                        </div>
                      </div>

                      {isOpen && (
                        <div className="perm-items-grid">
                          {sub.items.map(item => {
                            const checked = visibleSet.has(item.key);
                            return (
                              <label
                                key={item.key}
                                className={`perm-item-card${checked ? ' perm-item-card--active' : ''}`}
                              >
                                <div className="perm-item-card-left">
                                  <span className="perm-item-card-label">{item.label}</span>
                                </div>
                                <Checkbox
                                  checked={checked}
                                  onChange={e => toggleSingle(item.key, e.target.checked)}
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
  );
}
