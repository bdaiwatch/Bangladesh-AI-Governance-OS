import React, { createContext, useContext, useMemo, useState } from 'react';
import { INITIAL_COUNTRY_DATASETS } from '../data/seedData';
import { MODULES_REGISTRY, ROLES_CONFIG } from '../data/modulesRegistry';
import {
  ActionMilestone,
  ConsultationSubmission,
  CountryCode,
  CountryDataset,
  CountryProfile,
  DatasetCollectionKey,
  EvidenceRecord,
  ImpactAssessmentItem,
  Language,
  ModuleId,
  PolicyItem,
  PublicAIProject,
  ReadinessQuestion,
  RiskItem,
  RoleDefinition,
  SafetyIncidentItem,
  UserRole,
  WatchSignal,
  WorkflowApprovalItem,
} from '../types/os';

interface GovernanceContextValue {
  countryCode: CountryCode;
  setCountryCode: (code: CountryCode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  themeMode: 'auto' | 'light' | 'dark';
  setThemeMode: (mode: 'auto' | 'light' | 'dark') => void;
  toggleTheme: () => void;
  authUser: { name: string; role: UserRole } | null;
  isAdmin: boolean;
  hasAdminPrivileges: boolean;
  toggleAdminMode: () => void;
  authModalMode: 'login' | 'signup' | null;
  setAuthModalMode: (mode: 'login' | 'signup' | null) => void;
  loginUser: (name: string, role: UserRole) => void;
  logoutUser: () => void;
  activeSectionId: string;
  setActiveSectionId: (id: string) => void;
  scrollToSection: (sectionId: string) => void;
  exportSheetOpen: boolean;
  setExportSheetOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  permissions: RoleDefinition;
  activeModule: ModuleId;
  activeSubTab: string;
  navigateTo: (moduleId: ModuleId, subTabId?: string) => void;
  setActiveSubTab: (subTabId: string) => void;
  dataset: CountryDataset;
  allDatasets: Record<CountryCode, CountryDataset>;
  selectedEvidence: EvidenceRecord | null;
  openEvidence: (evidenceId: string) => void;
  closeEvidence: () => void;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  toastMessage: string | null;
  toastUndoAction: (() => void) | null;
  dismissToast: () => void;
  showToast: (msg: string, undoAction?: () => void) => void;
  isSwitchingCountry: boolean;
  syncError: string | null;
  retryWorkspaceSync: () => void;
  infoSheet: 'methodology' | 'data_sources' | null;
  openInfoSheet: (sheet: 'methodology' | 'data_sources') => void;
  closeInfoSheet: () => void;

  apiModalState: {
    isOpen: boolean;
    title?: string;
    endpoint?: string;
    datasetName?: string;
    description?: string;
  } | null;
  openApiModal: (options?: {
    title?: string;
    endpoint?: string;
    datasetName?: string;
    description?: string;
  }) => void;
  closeApiModal: () => void;

  // Computed live interconnected aggregates
  computedReadinessScore: number;
  pillarAverages: Record<'Institutional' | 'Infrastructure' | 'Human Capital' | 'Responsible AI', number>;

  // Interconnected OS Mutations
  updateQuestionMaturity: (questionId: string, level: 1 | 2 | 3 | 4 | 5) => void;
  addWatchSignal: (signal: Omit<WatchSignal, 'id' | 'countryCode' | 'evidenceId'>) => void;
  escalateSignalToRisk: (signalId: string) => void;
  addPolicyDraft: (draft: Omit<PolicyItem, 'id' | 'countryCode' | 'evidenceId'>) => void;
  submitPolicyForApproval: (policyId: string) => void;
  addRiskItem: (risk: Omit<RiskItem, 'id' | 'countryCode' | 'evidenceId'>) => void;
  updateRiskStatus: (riskId: string, status: RiskItem['status']) => void;
  addImpactAssessment: (item: Omit<ImpactAssessmentItem, 'id' | 'countryCode' | 'evidenceId'>) => void;
  registerPublicProject: (proj: Omit<PublicAIProject, 'id' | 'countryCode' | 'evidenceId'>) => void;
  reportSafetyIncident: (inc: Omit<SafetyIncidentItem, 'id' | 'countryCode' | 'evidenceId'>) => void;
  submitConsultation: (sub: Omit<ConsultationSubmission, 'id' | 'countryCode' | 'submittedAt' | 'disposition'>) => void;
  updateMilestoneProgress: (milestoneId: string, progressPct: number, status: ActionMilestone['status']) => void;
  processApproval: (approvalId: string, decision: 'Approved' | 'Returned for Revision') => boolean;

  // Full Admin CMS CRUD & Public Submission Analysis/Reply
  upsertRecord: <K extends DatasetCollectionKey>(collection: K, item: CountryDataset[K][number]) => void;
  deleteRecord: <K extends DatasetCollectionKey>(collection: K, id: string) => void;
  analyzeAndReplyConsultation: (
    id: string,
    payload: {
      disposition: ConsultationSubmission['disposition'];
      priority: 'Urgent' | 'High' | 'Standard';
      analysisNote: string;
      adminReply: string;
    }
  ) => void;
  updateCountryProfile: (updates: Partial<CountryProfile>) => void;
  resetAllDataToSeed: () => void;
  bulkUpdateCollectionStatus: <K extends DatasetCollectionKey>(
    collection: K,
    ids: string[],
    field: string,
    value: string
  ) => void;
  bulkDeleteRecords: <K extends DatasetCollectionKey>(collection: K, ids: string[]) => void;
  bulkProcessApprovals: (ids: string[], decision: 'Approved' | 'Returned for Revision') => void;
}

const DATASETS_STORAGE_KEY = 'bd_ai_watch_datasets_v1';
const AUTH_STORAGE_KEY = 'bd_ai_watch_auth_v1';

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

export const GovernanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [datasets, setDatasets] = useState<Record<CountryCode, CountryDataset>>(() => {
    try {
      const raw = localStorage.getItem(DATASETS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Record<CountryCode, CountryDataset>;
        if (parsed && parsed.BD && parsed.SG && parsed.EE && parsed.IN) {
          return parsed;
        }
      }
    } catch {
      // fallback to seed datasets
    }
    return INITIAL_COUNTRY_DATASETS;
  });
  const [authUser, setAuthUser] = useState<{ name: string; role: UserRole } | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; role?: UserRole };
        if (parsed?.name && parsed?.role && ROLES_CONFIG[parsed.role]) {
          return { name: parsed.name, role: parsed.role };
        }
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });
  const [countryCode, setCountryCodeState] = useState<CountryCode>('BD');
  const [language, setLanguage] = useState<Language>('en');
  const [role, setRoleState] = useState<UserRole>(() => authUser?.role || 'public_observer');
  const [adminModeEnabled, setAdminModeEnabled] = useState<boolean>(
    () => authUser?.role === 'admin'
  );
  const [themeMode, setThemeModeState] = useState<'auto' | 'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('bd_ai_watch_theme');
      if (saved === 'dark' || saved === 'light' || saved === 'auto') return saved;
      return 'auto';
    } catch {
      return 'auto';
    }
  });
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const theme: 'light' | 'dark' =
    themeMode === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : themeMode;

  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('section-overview');
  const [exportSheetOpen, setExportSheetOpen] = useState<boolean>(false);

  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('bd_ai_watch_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [activeModule, setActiveModule] = useState<ModuleId>('command');
  const [activeSubTab, setActiveSubTab] = useState<string>('overview');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastUndoAction, setToastUndoAction] = useState<(() => void) | null>(null);
  const [isSwitchingCountry, setIsSwitchingCountry] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [infoSheet, setInfoSheet] = useState<'methodology' | 'data_sources' | null>(null);
  const [apiModalState, setApiModalState] = useState<{
    isOpen: boolean;
    title?: string;
    endpoint?: string;
    datasetName?: string;
    description?: string;
  } | null>(null);

  const openApiModal = (options?: {
    title?: string;
    endpoint?: string;
    datasetName?: string;
    description?: string;
  }) => {
    setApiModalState({
      isOpen: true,
      title: options?.title,
      endpoint: options?.endpoint || '/api/v1/observatory',
      datasetName: options?.datasetName,
      description: options?.description,
    });
  };

  const closeApiModal = () => {
    setApiModalState(null);
  };

  const toastTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  React.useEffect(() => {
    const root = document.documentElement;
    root.lang = language === 'bn' ? 'bn' : 'en';
    if (language === 'bn') {
      root.classList.add('lang-bn');
    } else {
      root.classList.remove('lang-bn');
    }
  }, [language]);

  React.useEffect(() => {
    try {
      localStorage.setItem(DATASETS_STORAGE_KEY, JSON.stringify(datasets));
    } catch {
      // ignore storage quota errors
    }
  }, [datasets]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setThemeMode = (mode: 'auto' | 'light' | 'dark') => {
    setThemeModeState(mode);
    try {
      localStorage.setItem('bd_ai_watch_theme', mode);
    } catch {
      // ignore storage errors
    }
  };

  const toggleTheme = () => {
    setThemeMode(theme === 'light' ? 'dark' : 'light');
  };

  const hasAdminPrivileges = authUser?.role === 'admin';
  const isAdmin = Boolean(hasAdminPrivileges && adminModeEnabled && role === 'admin');
  const isAdminAuthenticated = isAdmin;

  const toggleAdminMode = () => {
    if (!hasAdminPrivileges) {
      showToast(
        language === 'bn'
          ? 'অ্যাডমিন মোড পরিবর্তনের জন্য অ্যাডমিন লগইন প্রয়োজন।'
          : 'Admin privileges required to toggle Admin mode.'
      );
      return;
    }
    const nextEnabled = !adminModeEnabled;
    setAdminModeEnabled(nextEnabled);
    setRoleState(nextEnabled ? 'admin' : 'public_observer');
    showToast(
      language === 'bn'
        ? nextEnabled
          ? 'পরীক্ষণ: অ্যাডমিন মোড সক্রিয় (isAdmin = true)'
          : 'পরীক্ষণ: সাধারণ পাঠযোগ্য মোড সক্রিয় (isAdmin = false)'
        : nextEnabled
        ? 'Testing toggle: Admin mode enabled (isAdmin = true)'
        : 'Testing toggle: Standard read-only mode enabled (isAdmin = false)'
    );
  };

  const setRole = (nextRole: UserRole) => {
    if (nextRole === 'admin' && authUser?.role !== 'admin') {
      showToast(
        language === 'bn'
          ? 'অ্যাডমিন ভূমিকার জন্য অ্যাডমিন অ্যাকাউন্টে লগইন প্রয়োজন।'
          : 'Admin authentication required to activate Admin role.'
      );
      return;
    }
    setRoleState(nextRole);
    if (authUser?.role === 'admin') {
      setAdminModeEnabled(nextRole === 'admin');
    } else if (authUser) {
      const updatedUser = { ...authUser, role: nextRole };
      setAuthUser(updatedUser);
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch {
        // ignore storage errors
      }
    }
    if (nextRole !== 'admin' && activeModule === 'admin') {
      setActiveModule('command');
      setActiveSubTab('overview');
    }
  };

  const loginUser = (name: string, selectedRole: UserRole) => {
    const userPayload = { name: name.trim() || 'Dr. Farhana Rahman', role: selectedRole };
    setAuthUser(userPayload);
    setRoleState(selectedRole);
    setAdminModeEnabled(selectedRole === 'admin');
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userPayload));
    } catch {
      // ignore storage errors
    }
    setAuthModalMode(null);
    showToast(
      language === 'bn'
        ? `লগইন সম্পন্ন: ${ROLES_CONFIG[selectedRole].labelBn}`
        : `Signed in as ${ROLES_CONFIG[selectedRole].labelEn}`
    );
  };

  const logoutUser = () => {
    setAuthUser(null);
    setAdminModeEnabled(false);
    setRoleState('public_observer');
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    if (activeModule === 'admin') {
      setActiveModule('command');
      setActiveSubTab('overview');
    }
    showToast(
      language === 'bn'
        ? 'লগআউট সম্পন্ন হয়েছে (পাঠযোগ্য ভিউ)'
        : 'Logged out — switched to read-only view'
    );
  };

  const scrollToSection = (sectionId: string) => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const doScroll = () => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: reduced ? 'auto' : 'smooth',
        block: 'start',
      });
      setActiveSectionId(sectionId);
    };
    if (activeModule !== 'command' || activeSubTab !== 'overview') {
      setActiveModule('command');
      setActiveSubTab('overview');
      window.setTimeout(doScroll, 60);
    } else {
      doScroll();
    }
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem('bd_ai_watch_sidebar_collapsed', String(collapsed));
    } catch {
      // ignore storage errors
    }
  };

  const dismissToast = () => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMessage(null);
    setToastUndoAction(null);
  };

  const showToast = (msg: string, undoAction?: () => void) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    setToastUndoAction(() => undoAction ?? null);
    const duration = undoAction ? 8000 : 3400;
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      setToastUndoAction(null);
      toastTimerRef.current = null;
    }, duration);
  };

  const setCountryCode = (code: CountryCode) => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    setSyncError(null);
    setSelectedEvidenceId(null);
    if (!reduced) {
      setIsSwitchingCountry(true);
      window.setTimeout(() => setIsSwitchingCountry(false), 240);
    }
    setCountryCodeState(code);
    showToast(
      language === 'bn'
        ? `দেশভিত্তিক ওয়ার্কস্পেস পরিবর্তিত হয়েছে: ${datasets[code].country.nameBn}`
        : `Switched workspace to ${datasets[code].country.nameEn} (${code})`
    );
  };

  const retryWorkspaceSync = () => {
    setSyncError(null);
    setIsSwitchingCountry(true);
    window.setTimeout(() => setIsSwitchingCountry(false), 200);
  };

  const navigateTo = (moduleId: ModuleId, subTabId?: string) => {
    if (moduleId === 'admin' && !isAdminAuthenticated) {
      showToast(
        language === 'bn'
          ? 'প্রবেশাধিকার সংরক্ষিত: Admin CMS দেখতে অ্যাডমিন হিসেবে লগইন করুন।'
          : 'Access restricted: Log in with the Admin role to open Admin CMS.'
      );
      return;
    }
    setActiveModule(moduleId);
    const mod = MODULES_REGISTRY.find((m) => m.id === moduleId);
    if (subTabId && mod?.subTabs.some((s) => s.id === subTabId)) {
      setActiveSubTab(subTabId);
    } else if (mod && mod.subTabs.length > 0) {
      setActiveSubTab(mod.subTabs[0].id);
    }
    if (typeof window !== 'undefined') {
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }
  };

  const permissions: RoleDefinition = {
    ...ROLES_CONFIG[role],
    canAccessAdminCMS: isAdminAuthenticated,
  };

  // Country-level + Role-level Data Isolation
  const rawDataset = datasets[countryCode];
  const dataset: CountryDataset = useMemo(() => {
    if (permissions.canViewRestrictedSecurity) {
      return rawDataset;
    }
    return {
      ...rawDataset,
      risks: rawDataset.risks.filter((r) => !r.restricted),
      safetyIncidents: rawDataset.safetyIncidents.filter((s) => !s.restricted),
    };
  }, [rawDataset, permissions.canViewRestrictedSecurity]);

  const selectedEvidence = useMemo(() => {
    if (!selectedEvidenceId) return null;
    return rawDataset.evidence.find((e) => e.id === selectedEvidenceId) || null;
  }, [selectedEvidenceId, rawDataset.evidence]);

  // Dynamic Readiness Calculations connected to Module 02 Questionnaires & Indicators
  const { computedReadinessScore, pillarAverages } = useMemo(() => {
    const pillars: Array<'Institutional' | 'Infrastructure' | 'Human Capital' | 'Responsible AI'> = [
      'Institutional',
      'Infrastructure',
      'Human Capital',
      'Responsible AI',
    ];
    const avgMap = {} as Record<'Institutional' | 'Infrastructure' | 'Human Capital' | 'Responsible AI', number>;

    for (const p of pillars) {
      const dims = rawDataset.readinessDimensions.filter((d) => d.pillar === p);
      const qs = rawDataset.readinessQuestions.filter((q) => q.pillar === p);
      const dimAvg = dims.length ? dims.reduce((acc, d) => acc + d.score, 0) / dims.length : 50;
      const qAvg = qs.length ? (qs.reduce((acc, q) => acc + q.maturityLevel * 20, 0) / qs.length) : dimAvg;
      avgMap[p] = Number(((dimAvg * 0.7) + (qAvg * 0.3)).toFixed(1));
    }

    const total = Number(
      ((avgMap.Institutional + avgMap.Infrastructure + avgMap['Human Capital'] + avgMap['Responsible AI']) / 4).toFixed(1)
    );
    return { computedReadinessScore: total, pillarAverages: avgMap };
  }, [rawDataset.readinessDimensions, rawDataset.readinessQuestions]);

  const mutateCountry = (updater: (prev: CountryDataset) => CountryDataset) => {
    setDatasets((prev) => ({
      ...prev,
      [countryCode]: updater(prev[countryCode]),
    }));
  };

  const updateQuestionMaturity = (questionId: string, level: 1 | 2 | 3 | 4 | 5) => {
    if (!permissions.canEditPolicy && !permissions.canEditProject && !permissions.canApprove) {
      showToast('Permission denied for current role.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      readinessQuestions: prev.readinessQuestions.map((q) =>
        q.id === questionId ? { ...q, maturityLevel: level } : q
      ),
    }));
    showToast('Readiness questionnaire updated — National AI Readiness recalculated.');
  };

  const addWatchSignal = (signal: Omit<WatchSignal, 'id' | 'countryCode' | 'evidenceId'>) => {
    mutateCountry((prev) => ({
      ...prev,
      watchSignals: [
        {
          ...signal,
          id: `ws-${Date.now()}`,
          countryCode,
          evidenceId: prev.evidence[0]?.id || 'ev-bd-01',
        },
        ...prev.watchSignals,
      ],
    }));
    showToast('New intelligence signal logged to Module 01.');
  };

  const escalateSignalToRisk = (signalId: string) => {
    if (!permissions.canEditRisk && !permissions.canApprove) {
      showToast('Risk Auditor or Commissioner role required to escalate risks.');
      return;
    }
    mutateCountry((prev) => {
      const target = prev.watchSignals.find((w) => w.id === signalId);
      if (!target) return prev;
      const newRisk: RiskItem = {
        id: `risk-${Date.now()}`,
        countryCode,
        code: `RSK-${countryCode}-${String(prev.risks.length + 1).padStart(2, '0')}`,
        title: target.title,
        classification: target.category === 'deepfake' ? 'Disinformation & Deepfake' : 'Cyber & Model Security',
        likelihood: target.severity === 'Critical' ? 5 : 4,
        impact: target.severity === 'Critical' ? 5 : 4,
        status: 'Open',
        mitigationPlan: `Escalated from Watch Signal (${target.source}): ${target.summary}`,
        ownerInstitutionId: prev.institutions[0]?.id || '',
        evidenceId: target.evidenceId,
      };
      return {
        ...prev,
        watchSignals: prev.watchSignals.map((w) =>
          w.id === signalId ? { ...w, status: 'Escalated to Risk', linkedRiskId: newRisk.id } : w
        ),
        risks: [newRisk, ...prev.risks],
      };
    });
    showToast('Signal escalated to AI Risk Observatory (Module 06).');
  };

  const addPolicyDraft = (draft: Omit<PolicyItem, 'id' | 'countryCode' | 'evidenceId'>) => {
    if (!permissions.canEditPolicy && !permissions.canApprove) {
      showToast('Policy Analyst or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      policies: [
        {
          ...draft,
          id: `pol-${Date.now()}`,
          countryCode,
          evidenceId: prev.evidence[0]?.id || 'ev-bd-01',
        },
        ...prev.policies,
      ],
    }));
    showToast('Policy draft added to Module 03.');
  };

  const submitPolicyForApproval = (policyId: string) => {
    if (!permissions.canEditPolicy && !permissions.canApprove) {
      showToast('Policy Analyst or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => {
      const pol = prev.policies.find((p) => p.id === policyId);
      if (!pol) return prev;
      const approvalItem: WorkflowApprovalItem = {
        id: `apr-${Date.now()}`,
        countryCode,
        title: `Approve Policy Advancement: ${pol.title}`,
        sourceModule: 'm03',
        linkedRecordId: pol.id,
        submittedBy: ROLES_CONFIG[role].labelEn,
        submittedAt: new Date().toISOString().slice(0, 10),
        priority: 'Standard',
        rationale: `Submitted from Policy Intelligence Centre (${pol.code}) at ${pol.progressPct}% readiness.`,
        status: 'Pending Approval',
      };
      return {
        ...prev,
        policies: prev.policies.map((p) =>
          p.id === policyId ? { ...p, stage: 'Cabinet Approval' } : p
        ),
        approvals: [approvalItem, ...prev.approvals],
      };
    });
    showToast('Policy submitted to Human Approval System (Module 20).');
  };

  const addRiskItem = (risk: Omit<RiskItem, 'id' | 'countryCode' | 'evidenceId'>) => {
    if (!permissions.canEditRisk && !permissions.canApprove) {
      showToast('Risk Auditor or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      risks: [
        {
          ...risk,
          id: `risk-${Date.now()}`,
          countryCode,
          evidenceId: prev.evidence[0]?.id || 'ev-bd-01',
        },
        ...prev.risks,
      ],
    }));
    showToast('New risk logged in AI Risk Observatory.');
  };

  const updateRiskStatus = (riskId: string, status: RiskItem['status']) => {
    if (!permissions.canEditRisk && !permissions.canApprove) {
      showToast('Risk Auditor or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      risks: prev.risks.map((r) => (r.id === riskId ? { ...r, status } : r)),
    }));
    showToast('Risk mitigation status updated.');
  };

  const addImpactAssessment = (item: Omit<ImpactAssessmentItem, 'id' | 'countryCode' | 'evidenceId'>) => {
    if (!permissions.canEditRisk && !permissions.canEditPolicy && !permissions.canApprove) {
      showToast('Auditor, Analyst, or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      impactAssessments: [
        {
          ...item,
          id: `imp-${Date.now()}`,
          countryCode,
          evidenceId: prev.evidence[0]?.id || 'ev-bd-01',
        },
        ...prev.impactAssessments,
      ],
    }));
    showToast('Impact Assessment recorded in Module 08.');
  };

  const registerPublicProject = (proj: Omit<PublicAIProject, 'id' | 'countryCode' | 'evidenceId'>) => {
    if (!permissions.canEditProject && !permissions.canApprove) {
      showToast('Ministry Coordinator or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      publicProjects: [
        {
          ...proj,
          id: `pub-${Date.now()}`,
          countryCode,
          evidenceId: prev.evidence[0]?.id || 'ev-bd-01',
        },
        ...prev.publicProjects,
      ],
    }));
    showToast('Public Sector AI Project registered in Module 14.');
  };

  const reportSafetyIncident = (inc: Omit<SafetyIncidentItem, 'id' | 'countryCode' | 'evidenceId'>) => {
    if (!permissions.canEditRisk && !permissions.canApprove) {
      showToast(
        language === 'bn'
          ? 'শুধুমাত্র অ্যাডমিন বা নিরীক্ষক নিরাপত্তা ঘটনা নিবন্ধন করতে পারবেন।'
          : 'Read-only mode: Risk Auditor or Admin role required.'
      );
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      safetyIncidents: [
        {
          ...inc,
          id: `saf-${Date.now()}`,
          countryCode,
          evidenceId: prev.evidence[0]?.id || 'ev-bd-06',
        },
        ...prev.safetyIncidents,
      ],
    }));
    showToast('AI Incident logged in Safety & Cybersecurity Centre (Module 15).');
  };

  const submitConsultation = (
    sub: Omit<ConsultationSubmission, 'id' | 'countryCode' | 'submittedAt' | 'disposition'>
  ) => {
    mutateCountry((prev) => ({
      ...prev,
      consultations: [
        {
          ...sub,
          id: `con-${Date.now()}`,
          countryCode,
          submittedAt: new Date().toISOString().slice(0, 10),
          disposition: 'Under Review',
        },
        ...prev.consultations,
      ],
    }));
    showToast('Public consultation submission recorded in Module 17.');
  };

  const updateMilestoneProgress = (
    milestoneId: string,
    progressPct: number,
    status: ActionMilestone['status']
  ) => {
    if (!permissions.canEditProject && !permissions.canApprove) {
      showToast('Ministry Coordinator or Commissioner role required.');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId ? { ...m, progressPct, status } : m
      ),
    }));
    showToast('Action Plan milestone updated in Module 18.');
  };

  const processApproval = (approvalId: string, decision: 'Approved' | 'Returned for Revision'): boolean => {
    if (!isAdmin) {
      setSyncError(
        language === 'bn'
          ? 'অনুমোদনের জন্য অ্যাডমিন লগইন প্রয়োজন।'
          : 'Approval failed: Admin login is required.'
      );
      return false;
    }
    setSyncError(null);
    const snapshot = datasets[countryCode];
    const targetCode = countryCode;

    mutateCountry((prev) => {
      const target = prev.approvals.find((a) => a.id === approvalId);
      if (!target) return prev;

      let updatedPolicies = prev.policies;
      let updatedProjects = prev.publicProjects;
      let updatedRisks = prev.risks;

      if (decision === 'Approved') {
        if (target.sourceModule === 'm03') {
          updatedPolicies = prev.policies.map((p) =>
            p.id === target.linkedRecordId ? { ...p, stage: 'Enacted', progressPct: 100 } : p
          );
        } else if (target.sourceModule === 'm14') {
          updatedProjects = prev.publicProjects.map((p) =>
            p.id === target.linkedRecordId ? { ...p, procurementCompliant: true, stage: 'Pilot' } : p
          );
        } else if (target.sourceModule === 'm06') {
          updatedRisks = prev.risks.map((r) =>
            r.id === target.linkedRecordId ? { ...r, status: 'Controlled' } : r
          );
        }
      }

      return {
        ...prev,
        policies: updatedPolicies,
        publicProjects: updatedProjects,
        risks: updatedRisks,
        approvals: prev.approvals.map((a) =>
          a.id === approvalId
            ? { ...a, status: decision, reviewedBy: ROLES_CONFIG[role].labelEn }
            : a
        ),
      };
    });

    if (decision === 'Approved') {
      showToast(language === 'bn' ? 'অনুমোদিত হয়েছে' : 'Approved', () => {
        setDatasets((prev) => ({
          ...prev,
          [targetCode]: snapshot,
        }));
      });
    } else {
      showToast(
        language === 'bn' ? 'সংশোধনের জন্য ফেরত পাঠানো হয়েছে' : 'Returned for revision'
      );
    }
    return true;
  };

  const upsertRecord = <K extends DatasetCollectionKey>(
    collection: K,
    item: CountryDataset[K][number]
  ) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    let isUpdate = false;
    mutateCountry((prev) => {
      const list = prev[collection] as Array<{ id: string }>;
      isUpdate = list.some((entry) => entry.id === (item as { id: string }).id);
      const nextList = isUpdate
        ? list.map((entry) => (entry.id === (item as { id: string }).id ? item : entry))
        : [item, ...list];
      return {
        ...prev,
        [collection]: nextList,
      };
    });
    showToast(
      language === 'bn'
        ? isUpdate
          ? 'রেকর্ড সফলভাবে হালনাগাদ হয়েছে'
          : 'নতুন রেকর্ড যোগ করা হয়েছে'
        : isUpdate
        ? 'Record updated in Admin CMS'
        : 'New record added via Admin CMS'
    );
  };

  const deleteRecord = <K extends DatasetCollectionKey>(collection: K, id: string) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    const snapshot = datasets[countryCode];
    const targetCode = countryCode;
    mutateCountry((prev) => {
      const list = prev[collection] as Array<{ id: string }>;
      return {
        ...prev,
        [collection]: list.filter((entry) => entry.id !== id),
      };
    });
    showToast(
      language === 'bn' ? 'রেকর্ড মুছে ফেলা হয়েছে' : 'Record removed',
      () => {
        setDatasets((prev) => ({
          ...prev,
          [targetCode]: snapshot,
        }));
      }
    );
  };

  const analyzeAndReplyConsultation = (
    id: string,
    payload: {
      disposition: ConsultationSubmission['disposition'];
      priority: 'Urgent' | 'High' | 'Standard';
      analysisNote: string;
      adminReply: string;
    }
  ) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const responder = authUser?.name || ROLES_CONFIG[role].labelEn;
    mutateCountry((prev) => ({
      ...prev,
      consultations: prev.consultations.map((c) =>
        c.id === id
          ? {
              ...c,
              disposition: payload.disposition,
              priority: payload.priority,
              analysisNote: payload.analysisNote,
              adminReply: payload.adminReply,
              repliedAt: payload.adminReply.trim() ? today : c.repliedAt,
              repliedBy: payload.adminReply.trim() ? responder : c.repliedBy,
            }
          : c
      ),
    }));
    showToast(
      language === 'bn'
        ? 'বিশ্লেষণ ও উত্তর সংরক্ষণ করা হয়েছে'
        : 'Submission analysis and reply published'
    );
  };

  const updateCountryProfile = (updates: Partial<CountryProfile>) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    mutateCountry((prev) => ({
      ...prev,
      country: {
        ...prev.country,
        ...updates,
      },
    }));
    showToast(
      language === 'bn' ? 'দেশের প্রোফাইল হালনাগাদ হয়েছে' : 'Country profile updated'
    );
  };

  const resetAllDataToSeed = () => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    setDatasets(INITIAL_COUNTRY_DATASETS);
    try {
      localStorage.removeItem(DATASETS_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
    showToast(
      language === 'bn' ? 'সিস্টেম ডেটা পূর্বাবস্থায় ফেরানো হয়েছে' : 'System data reset to defaults'
    );
  };

  const bulkUpdateCollectionStatus = <K extends DatasetCollectionKey>(
    collection: K,
    ids: string[],
    field: string,
    value: string
  ) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    mutateCountry((prev) => {
      const list = prev[collection] as unknown as Array<Record<string, unknown>>;
      const nextList = list.map((entry) => {
        if (!idSet.has(String(entry.id))) return entry;
        const nextEntry: Record<string, unknown> = { ...entry, [field]: value };
        if (collection === 'policies' && field === 'stage') {
          const progressMap: Record<string, number> = {
            Drafting: 25,
            'Inter-Ministerial Review': 55,
            'Public Consultation': 72,
            'Cabinet Approval': 90,
            Enacted: 100,
          };
          if (progressMap[value] !== undefined) {
            nextEntry.progressPct = progressMap[value];
          }
        }
        return nextEntry;
      });
      return {
        ...prev,
        [collection]: nextList,
      };
    });
    showToast(
      language === 'bn'
        ? `${ids.length}টি রেকর্ডের অবস্থা "${value}"-তে হালনাগাদ হয়েছে`
        : `Updated status to "${value}" for ${ids.length} record(s)`
    );
  };

  const bulkDeleteRecords = <K extends DatasetCollectionKey>(collection: K, ids: string[]) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    if (ids.length === 0) return;
    const snapshot = datasets[countryCode];
    const targetCode = countryCode;
    const idSet = new Set(ids);
    mutateCountry((prev) => {
      const list = prev[collection] as Array<{ id: string }>;
      return {
        ...prev,
        [collection]: list.filter((entry) => !idSet.has(entry.id)),
      };
    });
    showToast(
      language === 'bn'
        ? `${ids.length}টি রেকর্ড মুছে ফেলা হয়েছে`
        : `Removed ${ids.length} record(s)`,
      () => {
        setDatasets((prev) => ({
          ...prev,
          [targetCode]: snapshot,
        }));
      }
    );
  };

  const bulkProcessApprovals = (
    ids: string[],
    decision: 'Approved' | 'Returned for Revision'
  ) => {
    if (!isAdminAuthenticated) {
      showToast(language === 'bn' ? 'অ্যাডমিন অনুমোদন প্রয়োজন' : 'Access denied: Admin role required');
      return;
    }
    if (ids.length === 0) return;
    const snapshot = datasets[countryCode];
    const targetCode = countryCode;
    const idSet = new Set(ids);

    mutateCountry((prev) => {
      const targetApprovals = prev.approvals.filter((a) => idSet.has(a.id));
      let updatedPolicies = prev.policies;
      let updatedProjects = prev.publicProjects;
      let updatedRisks = prev.risks;

      if (decision === 'Approved') {
        const policyIds = new Set(
          targetApprovals.filter((a) => a.sourceModule === 'm03').map((a) => a.linkedRecordId)
        );
        const projectIds = new Set(
          targetApprovals.filter((a) => a.sourceModule === 'm14').map((a) => a.linkedRecordId)
        );
        const riskIds = new Set(
          targetApprovals.filter((a) => a.sourceModule === 'm06').map((a) => a.linkedRecordId)
        );

        updatedPolicies = prev.policies.map((p) =>
          policyIds.has(p.id) ? { ...p, stage: 'Enacted', progressPct: 100 } : p
        );
        updatedProjects = prev.publicProjects.map((p) =>
          projectIds.has(p.id) ? { ...p, procurementCompliant: true, stage: 'Pilot' } : p
        );
        updatedRisks = prev.risks.map((r) =>
          riskIds.has(r.id) ? { ...r, status: 'Controlled' } : r
        );
      }

      return {
        ...prev,
        policies: updatedPolicies,
        publicProjects: updatedProjects,
        risks: updatedRisks,
        approvals: prev.approvals.map((a) =>
          idSet.has(a.id)
            ? { ...a, status: decision, reviewedBy: ROLES_CONFIG[role].labelEn }
            : a
        ),
      };
    });

    showToast(
      language === 'bn'
        ? `${ids.length}টি অনুমোদন আইটেম "${decision}" হিসেবে চিহ্নিত হয়েছে`
        : `Marked ${ids.length} approval item(s) as ${decision}`,
      () => {
        setDatasets((prev) => ({
          ...prev,
          [targetCode]: snapshot,
        }));
      }
    );
  };

  return (
    <GovernanceContext.Provider
      value={{
        countryCode,
        setCountryCode,
        language,
        setLanguage,
        role,
        setRole,
        theme,
        themeMode,
        setThemeMode,
        toggleTheme,
        authUser,
        isAdmin,
        hasAdminPrivileges,
        toggleAdminMode,
        authModalMode,
        setAuthModalMode,
        loginUser,
        logoutUser,
        activeSectionId,
        setActiveSectionId,
        scrollToSection,
        exportSheetOpen,
        setExportSheetOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        permissions,
        activeModule,
        activeSubTab,
        navigateTo,
        setActiveSubTab,
        dataset,
        allDatasets: datasets,
        selectedEvidence,
        openEvidence: (id: string) => setSelectedEvidenceId(id),
        closeEvidence: () => setSelectedEvidenceId(null),
        globalSearch,
        setGlobalSearch,
        toastMessage,
        toastUndoAction,
        dismissToast,
        showToast,
        isSwitchingCountry,
        syncError,
        retryWorkspaceSync,
        infoSheet,
        openInfoSheet: (sheet) => setInfoSheet(sheet),
        closeInfoSheet: () => setInfoSheet(null),
        apiModalState,
        openApiModal,
        closeApiModal,
        computedReadinessScore,
        pillarAverages,
        updateQuestionMaturity,
        addWatchSignal,
        escalateSignalToRisk,
        addPolicyDraft,
        submitPolicyForApproval,
        addRiskItem,
        updateRiskStatus,
        addImpactAssessment,
        registerPublicProject,
        reportSafetyIncident,
        submitConsultation,
        updateMilestoneProgress,
        processApproval,
        upsertRecord,
        deleteRecord,
        analyzeAndReplyConsultation,
        updateCountryProfile,
        resetAllDataToSeed,
        bulkUpdateCollectionStatus,
        bulkDeleteRecords,
        bulkProcessApprovals,
      }}
    >
      {children}
    </GovernanceContext.Provider>
  );
};

export function useGovernance(): GovernanceContextValue {
  const ctx = useContext(GovernanceContext);
  if (!ctx) throw new Error('useGovernance must be used inside GovernanceProvider');
  return ctx;
}
