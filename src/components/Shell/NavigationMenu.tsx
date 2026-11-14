import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import { MODULES_REGISTRY, ROLES_CONFIG } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { ModuleId, UserRole } from '../../types/os';
import { formatNumberForLocale } from '../../utils/formatters';
import { Button, FormField, INPUT_BASE_CLASS, Modal } from '../Common/Primitives';

const ADMIN_ACCESS_CODE = 'BD-ADMIN-2026';

export const NavigationMenu: React.FC<{
  onItemChosen?: () => void;
}> = ({ onItemChosen }) => {
  const {
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    authUser,
    setAuthModalMode,
    logoutUser,
    isAdmin,
    hasAdminPrivileges,
    toggleAdminMode,
    activeModule,
    activeSubTab,
    navigateTo,
    openInfoSheet,
    setExportSheetOpen,
    dataset,
  } = useGovernance();

  const [modulesExpanded, setModulesExpanded] = useState(false);
  const isBn = language === 'bn';

  const activeAlertsCount = dataset.watchSignals.filter(
    (w) => w.status === 'Active Alert' || w.status === 'Escalated to Risk'
  ).length;
  const pendingApprovalsCount = dataset.approvals.filter(
    (a) => a.status === 'Pending Approval'
  ).length;
  const unrepliedSubmissionsCount = dataset.consultations.filter(
    (c) => !c.adminReply
  ).length;
  const adminQueueCount = pendingApprovalsCount + unrepliedSubmissionsCount;

  const navigateItems: Array<{
    key: string;
    labelEn: string;
    labelBn: string;
    moduleId: ModuleId;
    subTab?: string;
    badge?: number;
    isActive: boolean;
  }> = [
    {
      key: 'overview',
      labelEn: 'Overview',
      labelBn: 'সারসংক্ষেপ',
      moduleId: 'command',
      subTab: 'overview',
      isActive: activeModule === 'command' && activeSubTab === 'overview',
    },
    {
      key: 'modules',
      labelEn: 'All modules (20)',
      labelBn: 'সকল মডিউল (২০)',
      moduleId: 'command',
      subTab: 'interconnections',
      isActive: activeModule === 'command' && activeSubTab === 'interconnections',
    },
    {
      key: 'readiness',
      labelEn: 'Readiness & pillars',
      labelBn: 'প্রস্তুতি ও স্তম্ভসমূহ',
      moduleId: 'm02',
      subTab: 'national_assessment',
      isActive: activeModule === 'm02',
    },
    {
      key: 'observatory',
      labelEn: 'AI Observatory',
      labelBn: 'এআই অবজারভেটরি',
      moduleId: 'observatory',
      subTab: 'overview',
      isActive: activeModule === 'observatory',
    },
    {
      key: 'alerts',
      labelEn: 'Alerts',
      labelBn: 'সক্রিয় সতর্কবার্তা',
      moduleId: 'm01',
      subTab: 'early_warning',
      badge: activeAlertsCount,
      isActive: activeModule === 'm01',
    },
    ...(isAdmin
      ? [
          {
            key: 'admin',
            labelEn: 'Admin',
            labelBn: 'অ্যাডমিন',
            moduleId: 'admin' as ModuleId,
            subTab: 'approvals',
            badge: adminQueueCount,
            isActive: activeModule === 'admin',
          },
        ]
      : []),
  ];

  const handleOpenPage = (moduleId: ModuleId, subTab?: string) => {
    navigateTo(moduleId, subTab);
    onItemChosen?.();
  };

  return (
    <div className="flex flex-col text-[var(--text-primary)] divide-y divide-[var(--border-default)]">
      {/* 1. Account */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] leading-[18px] font-medium text-[var(--text-secondary)]">
            {isBn ? 'অ্যাকাউন্ট' : 'Account'}
          </span>
          {!authUser && (
            <span className="text-[11px] font-mono text-[var(--text-secondary)]">
              {isBn ? 'পাঠযোগ্য মোড' : 'Read-only'}
            </span>
          )}
        </div>

        {authUser ? (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-[15px] leading-[22px] font-medium text-[var(--text-primary)]">
                {authUser.name}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
                  {isBn
                    ? ROLES_CONFIG[authUser.role].labelBn
                    : ROLES_CONFIG[authUser.role].labelEn}
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#ECF4F1] dark:bg-[#157F5E]/25 text-[#0B5D45] dark:text-[#6EE7B7]">
                    {isBn ? 'অ্যাডমিন' : 'Admin'}
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    {isBn ? 'পাঠযোগ্য' : 'Read-only'}
                  </span>
                )}
              </div>
            </div>

            {hasAdminPrivileges && (
              <div className="p-2.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-page)]">
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAdmin}
                  onClick={toggleAdminMode}
                  className="w-full min-h-[44px] flex items-center justify-between gap-2 text-left cursor-pointer"
                >
                  <span className="min-w-0">
                    <span className="block text-[12px] leading-[16px] font-medium text-[var(--text-primary)]">
                      {isBn ? 'অ্যাডমিন মোড (পরীক্ষণ)' : 'Admin mode (testing)'}
                    </span>
                    <span className="block text-[11px] leading-[15px] font-mono text-[var(--text-secondary)]">
                      isAdmin: {isAdmin ? 'ON' : 'OFF'}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors ${
                      isAdmin
                        ? 'bg-[#0B5D45] border-[#0B5D45]'
                        : 'bg-[var(--bg-subtle)] border-[var(--border-strong)]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform mt-[3px] ${
                        isAdmin ? 'translate-x-[22px]' : 'translate-x-[3px]'
                      }`}
                    />
                  </span>
                </button>
              </div>
            )}

            <Button
              variant="secondary"
              className="w-full min-h-[48px]"
              onClick={() => {
                logoutUser();
                onItemChosen?.();
              }}
            >
              {isBn ? 'লগআউট' : 'Log out'}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full min-h-[48px]"
              onClick={() => {
                setAuthModalMode('signup');
                onItemChosen?.();
              }}
            >
              {isBn ? 'নিবন্ধন করুন' : 'Sign up'}
            </Button>
            <Button
              variant="secondary"
              className="w-full min-h-[48px]"
              onClick={() => {
                setAuthModalMode('login');
                onItemChosen?.();
              }}
            >
              {isBn ? 'লগইন করুন' : 'Log in'}
            </Button>
          </div>
        )}
      </div>

      {/* 2. Navigate */}
      <nav aria-label={isBn ? 'বিভাগ নেভিগেশন' : 'Navigate'} className="py-2">
        <div className="px-4 py-1.5 text-[13px] leading-[18px] font-medium text-[var(--text-secondary)]">
          {isBn ? 'নেভিগেট' : 'Navigate'}
        </div>
        <div>
          {navigateItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleOpenPage(item.moduleId, item.subTab)}
              aria-current={item.isActive ? 'page' : undefined}
              className={`w-full min-h-[48px] px-4 flex items-center justify-between gap-2 text-left text-[15px] leading-[22px] border-l-[3px] transition-colors cursor-pointer ${
                item.isActive
                  ? 'border-[#0B5D45] bg-[#ECF4F1]/70 dark:bg-[#157F5E]/20 text-[#0B5D45] dark:text-[#6EE7B7] font-medium'
                  : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <span>{isBn ? item.labelBn : item.labelEn}</span>
              {typeof item.badge === 'number' && (
                <span className="inline-flex items-center justify-center min-w-[24px] h-[22px] px-2 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] font-mono text-[12px] leading-[16px] text-[var(--text-primary)] tabular-nums">
                  {formatNumberForLocale(item.badge, language)}
                </span>
              )}
            </button>
          ))}

          {/* Expandable direct picker for all 20 individual module pages */}
          <div className="mt-1 border-t border-[var(--border-default)] pt-1">
            <button
              type="button"
              onClick={() => setModulesExpanded((v) => !v)}
              aria-expanded={modulesExpanded}
              className="w-full min-h-[48px] px-4 flex items-center justify-between gap-2 text-left text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <span>{isBn ? 'পৃথক মডিউলসমূহ (০১–২০)' : 'Module pages (01–20)'}</span>
              {modulesExpanded ? (
                <ChevronDown className="w-4 h-4 shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 shrink-0" />
              )}
            </button>

            {modulesExpanded && (
              <div className="py-1 max-h-[280px] overflow-y-auto bg-[var(--bg-page)]/60">
                {MODULES_REGISTRY.filter(
                  (m) => m.id !== 'command' && m.id !== 'observatory' && m.id !== 'admin'
                ).map((m) => {
                  const isCurrentMod = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleOpenPage(m.id)}
                      aria-current={isCurrentMod ? 'page' : undefined}
                      className={`w-full min-h-[44px] px-4 flex items-center gap-2 text-left text-[13px] leading-[18px] border-l-[3px] transition-colors cursor-pointer ${
                        isCurrentMod
                          ? 'border-[#0B5D45] bg-[#ECF4F1]/70 dark:bg-[#157F5E]/20 text-[#0B5D45] dark:text-[#6EE7B7] font-medium'
                          : 'border-transparent text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      <span className="font-mono text-[12px] text-[var(--text-secondary)] shrink-0">
                        {formatNumberForLocale(m.number, language)}
                      </span>
                      <span className="truncate">{isBn ? m.shortBn : m.shortEn}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Tools */}
      <div className="py-2">
        <div className="px-4 py-1.5 text-[13px] leading-[18px] font-medium text-[var(--text-secondary)]">
          {isBn ? 'সরঞ্জাম' : 'Tools'}
        </div>
        <div>
          <button
            type="button"
            onClick={() => {
              setExportSheetOpen(true);
              onItemChosen?.();
            }}
            className="w-full min-h-[48px] px-4 flex items-center text-left text-[15px] leading-[22px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            {isBn ? 'পিডিএফ / এক্সেল রপ্তানি' : 'Export PDF / Excel'}
          </button>
          <button
            type="button"
            onClick={() => {
              openInfoSheet('methodology');
              onItemChosen?.();
            }}
            className="w-full min-h-[48px] px-4 flex items-center text-left text-[15px] leading-[22px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            {isBn ? 'মূল্যায়ন পদ্ধতি' : 'Methodology'}
          </button>
          <button
            type="button"
            onClick={() => {
              openInfoSheet('data_sources');
              onItemChosen?.();
            }}
            className="w-full min-h-[48px] px-4 flex items-center text-left text-[15px] leading-[22px] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            {isBn ? 'ডেটা উৎসসমূহ' : 'Data sources'}
          </button>
        </div>
      </div>

      {/* 4. Preferences */}
      <div className="p-4 space-y-4">
        <div className="text-[13px] leading-[18px] font-medium text-[var(--text-secondary)]">
          {isBn ? 'পছন্দসমূহ' : 'Preferences'}
        </div>

        <div className="space-y-1.5">
          <div className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
            {isBn ? 'ভাষা' : 'Language'}
          </div>
          <div
            className="grid grid-cols-2 p-0.5 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-[12px]"
            role="group"
            aria-label="Language"
          >
            <button
              type="button"
              aria-pressed={language === 'en'}
              onClick={() => setLanguage('en')}
              className={`min-h-[44px] rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-[#0B5D45] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              aria-pressed={language === 'bn'}
              onClick={() => setLanguage('bn')}
              className={`min-h-[44px] rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
                language === 'bn'
                  ? 'bg-[#0B5D45] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
            {isBn ? 'উপস্থাপনা' : 'Appearance'}
          </div>
          <div
            className="grid grid-cols-3 p-0.5 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-[12px]"
            role="group"
            aria-label="Appearance"
          >
            {(
              [
                { key: 'auto', labelEn: 'Auto', labelBn: 'স্বয়ংক্রিয়' },
                { key: 'light', labelEn: 'Light', labelBn: 'আলো' },
                { key: 'dark', labelEn: 'Dark', labelBn: 'অন্ধকার' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                aria-pressed={themeMode === opt.key}
                onClick={() => setThemeMode(opt.key)}
                className={`min-h-[44px] rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
                  themeMode === opt.key
                    ? 'bg-[#0B5D45] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isBn ? opt.labelBn : opt.labelEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Footer of the panel */}
      <div className="p-4 text-[13px] leading-[18px] text-[var(--text-secondary)]">
        © 2026 Atlas AI Institute
      </div>
    </div>
  );
};

export const AuthDialog: React.FC = () => {
  const { authModalMode, setAuthModalMode, loginUser, role, language } = useGovernance();
  const [name, setName] = useState('Dr. Farhana Rahman');
  const [selectedRole, setSelectedRole] = useState<UserRole>(role);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const isBn = language === 'bn';

  useEffect(() => {
    if (!authModalMode) return;
    setSelectedRole(authModalMode === 'signup' ? 'public_observer' : role);
    setAdminPasscode('');
    setAuthError(null);
  }, [authModalMode, role]);

  if (!authModalMode) return null;

  const isSignup = authModalMode === 'signup';
  const loginRoles = Object.keys(ROLES_CONFIG) as UserRole[];

  return (
    <Modal
      open={Boolean(authModalMode)}
      onClose={() => setAuthModalMode(null)}
      title={isSignup ? (isBn ? 'নিবন্ধন করুন' : 'Sign up') : isBn ? 'লগইন করুন' : 'Log in'}
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const finalRole: UserRole = isSignup ? 'public_observer' : selectedRole;
          if (!isSignup && finalRole === 'admin' && adminPasscode.trim() !== ADMIN_ACCESS_CODE) {
            setAuthError(
              isBn
                ? 'সঠিক অ্যাডমিন অ্যাক্সেস কোড প্রদান করুন (ডেমো: BD-ADMIN-2026)।'
                : 'Enter a valid Admin access code (demo: BD-ADMIN-2026).'
            );
            return;
          }
          setAuthError(null);
          loginUser(name, finalRole);
        }}
      >
        <FormField label={isBn ? 'পূর্ণ নাম' : 'Full name'} required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={INPUT_BASE_CLASS}
            placeholder="Dr. Farhana Rahman"
          />
        </FormField>

        {isSignup ? (
          <FormField label={isBn ? 'অ্যাকাউন্টের ধরন' : 'Account access level'}>
            <div className="px-3.5 py-2.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[14px] text-[var(--text-primary)]">
              {isBn ? ROLES_CONFIG.public_observer.labelBn : ROLES_CONFIG.public_observer.labelEn}
            </div>
            <p className="mt-1.5 text-[12px] text-[var(--text-secondary)]">
              {isBn
                ? 'নতুন নিবন্ধনকৃত ব্যবহারকারীরা পাঠযোগ্য (Read-Only) সুবিধা পাবেন এবং মডিউল ১৭-এ মতামত জমা দিতে পারবেন।'
                : 'New accounts receive standard read-only dashboard access and can submit public consultations in Module 17.'}
            </p>
          </FormField>
        ) : (
          <FormField label={isBn ? 'অ্যাক্সেস ভূমিকা' : 'Governance role'} required>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as UserRole);
                setAuthError(null);
              }}
              className={INPUT_BASE_CLASS}
            >
              {loginRoles.map((r) => (
                <option key={r} value={r}>
                  {isBn ? ROLES_CONFIG[r].labelBn : ROLES_CONFIG[r].labelEn}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {!isSignup && selectedRole === 'admin' && (
          <FormField
            label={isBn ? 'অ্যাডমিন অ্যাক্সেস কোড' : 'Admin access code'}
            required
            error={authError || undefined}
          >
            <div className="relative">
              <input
                type="password"
                value={adminPasscode}
                onChange={(e) => {
                  setAdminPasscode(e.target.value);
                  setAuthError(null);
                }}
                required
                className={INPUT_BASE_CLASS}
                placeholder="BD-ADMIN-2026"
              />
              <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="mt-1.5 text-[12px] text-[var(--text-secondary)]">
              {isBn
                ? 'অ্যাডমিন সিএমএস ও অনুমোদনের জন্য অ্যাক্সেস কোড দিন (ডেমো: BD-ADMIN-2026)।'
                : 'Required to unlock Admin CMS, approvals, and full system CRUD (demo: BD-ADMIN-2026).'}
            </p>
          </FormField>
        )}

        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => setAuthModalMode(null)}>
            {isBn ? 'বাতিল' : 'Cancel'}
          </Button>
          <Button type="submit" variant="primary">
            {isSignup ? (isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create account') : isBn ? 'লগইন করুন' : 'Log in'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
