import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  CheckCircle2,
  CheckSquare,
  Clock,
  Compass,
  Cpu,
  Database,
  Code2,
  FileText,
  Globe2,
  Layers,
  MapPin,
  Search,
  Server,
  Shield,
  ShieldAlert,
  Table2,
  X,
  Zap,
} from 'lucide-react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import {
  BANGLADESH_DIVISIONS,
  DOMAIN_META,
  DivisionId,
  DivisionRegionalData,
  ObservatoryDomain,
  ObservatoryToolNode,
  ObservatoryZoneType,
  ZONE_TYPE_META,
  buildObservatoryInventory,
  getDivisionProfile,
} from '../../data/observatoryAtlas';
import { BENCHMARK_COUNTRIES } from '../../data/seedData';
import { useGovernance } from '../../store/GovernanceContext';
import { formatNumberForLocale } from '../../utils/formatters';
import { BangladeshObservatoryMap } from '../Charts/BangladeshObservatoryMap';
import {
  Button,
  EmptyState,
  EvidenceLink,
  INPUT_BASE_CLASS,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';

export const ObservatoryCentre: React.FC = () => {
  const {
    dataset,
    language,
    activeSubTab,
    navigateTo,
    computedReadinessScore,
    pillarAverages,
    showToast,
    openApiModal,
  } = useGovernance();

  const isBn = language === 'bn';
  const mod = MODULES_REGISTRY.find((m) => m.id === 'observatory')!;

  const allTools = useMemo(() => buildObservatoryInventory(dataset), [dataset]);

  // Map Filter States
  const [activeZoneType, setActiveZoneType] = useState<ObservatoryZoneType | 'ALL'>('ALL');
  const [activeDivision, setActiveDivision] = useState<DivisionId | 'ALL'>('dhaka');
  const [selectedToolId, setSelectedToolId] = useState<string>('obs-gpu-kaliakoir');
  const [drawerCardFilter, setDrawerCardFilter] = useState<'all' | 'infrastructure' | 'policy' | 'risks' | 'projects' | 'node'>('all');
  const [dataSheetTab, setDataSheetTab] = useState<'metrics' | 'risks' | 'policy' | 'features'>('metrics');

  // Division table vs chart toggle
  const [divisionViewAsTable, setDivisionViewAsTable] = useState(false);

  // Registry Table Filters
  const [tableSearch, setTableSearch] = useState('');
  const [tableZoneType, setTableZoneType] = useState<ObservatoryZoneType | 'ALL'>('ALL');
  const [tableDivision, setTableDivision] = useState<DivisionId | 'ALL'>('ALL');

  // Filtered tools for the map view
  const mapFilteredTools = useMemo(() => {
    return allTools.filter((t) => {
      if (activeZoneType !== 'ALL' && t.zoneType !== activeZoneType) return false;
      if (activeDivision !== 'ALL' && t.divisionId !== activeDivision) return false;
      return true;
    });
  }, [allTools, activeZoneType, activeDivision]);

  // Selected tool node
  const selectedTool = useMemo(() => {
    const exact = mapFilteredTools.find((t) => t.id === selectedToolId);
    if (exact) return exact;
    return mapFilteredTools[0] || allTools[0];
  }, [mapFilteredTools, allTools, selectedToolId]);

  // Profile for active division (when region clicked)
  const divisionProfile = useMemo(() => {
    const divId = activeDivision === 'ALL' ? 'dhaka' : activeDivision;
    return getDivisionProfile(divId, allTools, dataset);
  }, [activeDivision, allTools, dataset]);

  // Filtered tools for the lower registry table
  const tableFilteredTools = useMemo(() => {
    const q = tableSearch.trim().toLowerCase();
    return allTools.filter((t) => {
      if (tableZoneType !== 'ALL' && t.zoneType !== tableZoneType) return false;
      if (tableDivision !== 'ALL' && t.divisionId !== tableDivision) return false;
      if (!q) return true;
      const divObj = BANGLADESH_DIVISIONS.find((d) => d.id === t.divisionId);
      const haystack = [
        t.code,
        t.nameEn,
        t.nameBn,
        t.locationEn,
        t.locationBn,
        t.institution,
        t.status,
        t.riskIndicators.threatTitleEn,
        t.riskIndicators.threatTitleBn,
        t.associatedPolicy.policyCode,
        t.associatedPolicy.policyTitleEn,
        divObj?.nameEn || '',
        divObj?.nameBn || '',
        ...t.featuresEn,
        ...t.featuresBn,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allTools, tableSearch, tableZoneType, tableDivision]);

  const divisionBreakdown = useMemo(() => {
    return BANGLADESH_DIVISIONS.map((div) => {
      const nodes = allTools.filter((t) => t.divisionId === div.id);
      const featureCount = nodes.reduce((acc, n) => acc + n.featuresEn.length, 0);
      return {
        ...div,
        toolCount: nodes.length,
        featureCount,
        infraCount: nodes.filter((n) => n.zoneType === 'infrastructure').length,
        researchCount: nodes.filter((n) => n.zoneType === 'research_hub').length,
        policyCount: nodes.filter((n) => n.zoneType === 'policy_zone').length,
        nodes,
      };
    }).sort((a, b) => b.toolCount - a.toolCount);
  }, [allTools]);

  // Live Observatory Dashboard Aggregates
  const totalBeneficiariesK = dataset.publicProjects.reduce((a, p) => a + p.beneficiariesK, 0);
  const totalTrained = dataset.humanCapital.reduce((a, h) => a + h.enrolledOrTrained, 0);
  const avgInfraUtil = dataset.infrastructure.length
    ? Math.round(
        dataset.infrastructure.reduce((a, i) => a + i.utilizationPct, 0) /
          dataset.infrastructure.length
      )
    : 0;
  const totalResearchUSD_M = (
    dataset.researchItems.reduce((a, r) => a + r.fundingAmountUSD, 0) / 1_000_000
  ).toFixed(1);
  const avgPolicyProgress = dataset.policies.length
    ? Math.round(dataset.policies.reduce((a, p) => a + p.progressPct, 0) / dataset.policies.length)
    : 0;
  const criticalRisksCount = dataset.risks.filter((r) => r.likelihood * r.impact >= 15).length;
  const activeAlertsCount = dataset.watchSignals.filter(
    (w) => w.status === 'Active Alert' || w.status === 'Escalated to Risk'
  ).length;

  const bdBenchmark = BENCHMARK_COUNTRIES.find((b) => b.countryCode === 'BD');

  const handleExportRegistry = (endpointOverride?: string, nameOverride?: string) => {
    openApiModal({
      title: isBn ? 'অবজারভেটরি এপিআই গেটওয়ে' : 'Observatory REST API Gateway',
      endpoint: endpointOverride || '/api/v1/observatory',
      datasetName: nameOverride || (isBn ? 'বাংলাদেশ এআই অবজারভেটরি রেজিস্ট্রি' : 'Bangladesh AI Observatory Complete Dataset'),
      description: isBn
        ? 'সম্পূর্ণ সিস্টেম থেকে নিজের অ্যাসেসমেন্ট রিপোর্ট ছাড়া অন্য সকল ফাইল সরাসরি ডাউনলোড করা নিষিদ্ধ। এই ডেটা ব্যবহারে এপিআই ব্যবহার করতে হবে।'
        : 'Direct file download is restricted. Official REST API integration is required to access or export this dataset.',
    });
    showToast(
      isBn
        ? 'সরাসরি ডাউনলোড বন্ধ। এই ডেটার জন্য এপিআই ব্যবহার করতে হবে।'
        : 'Direct download is restricted. Please use the API.'
    );
  };

  const handleSelectToolFromTable = (tool: ObservatoryToolNode) => {
    setSelectedToolId(tool.id);
    setActiveDivision('ALL');
    setActiveZoneType('ALL');
    if (activeSubTab !== 'overview') {
      navigateTo('observatory', 'overview');
    }
    const targetEl = document.getElementById('observatory-data-sheet');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const selectedZoneMeta = selectedTool ? ZONE_TYPE_META[selectedTool.zoneType] : ZONE_TYPE_META.infrastructure;

  return (
    <div className="space-y-8">
      {/* Module Editorial Header */}
      <ModuleHeader
        module={mod}
        metaLine={
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)]">
            <span>
              {isBn
                ? 'বাংলাদেশ সার্বভৌম এআই অবজারভেটরি কেন্দ্র'
                : 'Bangladesh Sovereign AI Observatory Centre'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {isBn
                ? `${formatNumberForLocale(allTools.length, language)}টি অবস্থান পয়েন্ট · ৮টি বিভাগ`
                : `${allTools.length} mapped points · 8 divisions`}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {isBn ? 'OECD / UNESCO পরিমাপক মানদণ্ড' : 'OECD / UNESCO Aligned Telemetry'}
            </span>
          </div>
        }
        rightSlot={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                handleExportRegistry(
                  '/api/v1/observatory',
                  isBn ? 'জাতীয় এআই অবজারভেটরি রেজিস্ট্রি' : 'National AI Observatory Registry'
                )
              }
            >
              <Code2 className="w-4 h-4" />
              <span>{isBn ? 'এপিআই এক্সেস (REST API)' : 'REST API (Export Restricted)'}</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigateTo('m16', 'rankings')}>
              <Globe2 className="w-4 h-4" />
              <span>{isBn ? 'বৈশ্বিক বেঞ্চমার্ক' : 'Global Rankings'}</span>
            </Button>
          </div>
        }
      />

      <ModuleSubNav module={mod} />

      {activeSubTab === 'registry' ? (
        /* TAB 2: TOOLS & FEATURES REGISTRY */
        <SectionCard
          title={
            isBn
              ? 'জাতীয় এআই অবজারভেটরি টুলস ও ফিচার রেজিস্টার টেবিল'
              : 'Observatory Tools & Capabilities Registry Table'
          }
          subtitle={
            isBn
              ? 'বাংলাদেশের সকল এআই অবকাঠামো, গবেষণা হাব ও নীতি উন্নয়ন অঞ্চলের রিয়েল-টাইম মেট্রিক্স, ঝুঁকি ও আইনি অবস্থান ফিল্টার ও এপিআই সংহতি'
              : 'Real-time metrics, risk indicators, and associated policy status across all mapped Bangladesh locations (REST API Access)'
          }
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleExportRegistry(
                  '/api/v1/observatory',
                  isBn ? 'অবজারভেটরি রেজিস্ট্রি ডেটাসেট' : 'Observatory Registry Dataset'
                )
              }
            >
              <Code2 className="w-4 h-4" />
              <span>{isBn ? 'এপিআই ডেটা (API Data)' : 'Use REST API'}</span>
            </Button>
          }
        >
          {/* Real-time Filter Bar */}
          <div className="space-y-3 mb-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder={
                    isBn
                      ? 'টুল, ঝুঁকি, নীতি, বিভাগ বা সংস্থা দিয়ে খুঁজুন...'
                      : 'Search locations, risks, policies, or institutions...'
                  }
                  aria-label={isBn ? 'অবজারভেটরি অনুসন্ধান' : 'Search observatory'}
                  className={`${INPUT_BASE_CLASS} pl-9 ${tableSearch ? 'pr-10' : ''}`}
                />
                {tableSearch && (
                  <button
                    type="button"
                    onClick={() => setTableSearch('')}
                    aria-label={isBn ? 'অনুসন্ধান মুছুন' : 'Clear search'}
                    className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label={isBn ? 'জোন ক্যাটাগরি ফিল্টার' : 'Filter by zone category'}
                  value={tableZoneType}
                  onChange={(e) => setTableZoneType(e.target.value as ObservatoryZoneType | 'ALL')}
                  className={INPUT_BASE_CLASS}
                >
                  <option value="ALL">{isBn ? 'সকল জোন ক্যাটাগরি' : 'All zone categories'}</option>
                  {(Object.keys(ZONE_TYPE_META) as ObservatoryZoneType[]).map((z) => (
                    <option key={z} value={z}>
                      {isBn ? ZONE_TYPE_META[z].labelBn : ZONE_TYPE_META[z].labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <select
                  aria-label={isBn ? 'বিভাগ অনুযায়ী ফিল্টার' : 'Filter by division'}
                  value={tableDivision}
                  onChange={(e) => setTableDivision(e.target.value as DivisionId | 'ALL')}
                  className={INPUT_BASE_CLASS}
                >
                  <option value="ALL">{isBn ? 'সকল ৮টি বিভাগ' : 'All 8 divisions'}</option>
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {isBn ? div.nameBn : div.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-[var(--text-secondary)]">
              <span className="font-mono tabular-nums">
                {isBn
                  ? `প্রদর্শিত হচ্ছে ${formatNumberForLocale(tableFilteredTools.length, language)} / ${formatNumberForLocale(allTools.length, language)}টি অবস্থান`
                  : `Showing ${tableFilteredTools.length} of ${allTools.length} mapped locations`}
              </span>
              {(tableSearch || tableZoneType !== 'ALL' || tableDivision !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setTableSearch('');
                    setTableZoneType('ALL');
                    setTableDivision('ALL');
                  }}
                  className="text-[#0B5D45] dark:text-[#6EE7B7] font-medium hover:underline cursor-pointer"
                >
                  {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
                </button>
              )}
            </div>
          </div>

          {tableFilteredTools.length === 0 ? (
            <EmptyState
              title={isBn ? 'কোনো অবস্থান পাওয়া যায়নি' : 'No matching locations found'}
              description={
                isBn
                  ? 'অনুসন্ধান শব্দ বা বিভাগ/জোন ফিল্টার পরিবর্তন করুন।'
                  : 'Adjust your search query or zone/division filters.'
              }
            />
          ) : (
            <ResponsiveTable<ObservatoryToolNode>
              data={tableFilteredTools}
              rowKey={(t) => t.id}
              columns={[
                {
                  key: 'location',
                  header: isBn ? 'অবস্থান ও কেন্দ্র' : 'Location & Zone',
                  render: (t) => (
                    <div className="space-y-1 max-w-xs">
                      <div className="flex items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: ZONE_TYPE_META[t.zoneType].color }}
                        />
                        <span className="font-mono font-semibold text-[var(--text-primary)]">{t.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{isBn ? ZONE_TYPE_META[t.zoneType].shortBn : ZONE_TYPE_META[t.zoneType].shortEn}</span>
                      </div>
                      <div className="font-serif-editorial text-[14px] leading-[20px] font-semibold text-[var(--text-primary)]">
                        {isBn ? t.nameBn : t.nameEn}
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)]">{t.institution}</div>
                    </div>
                  ),
                },
                {
                  key: 'division',
                  header: isBn ? 'বিভাগ ও নোড' : 'Division & Node',
                  render: (t) => {
                    const divObj = BANGLADESH_DIVISIONS.find((d) => d.id === t.divisionId);
                    return (
                      <div className="space-y-0.5 whitespace-nowrap">
                        <div className="font-medium text-[var(--text-primary)]">
                          {divObj ? (isBn ? divObj.nameBn : divObj.nameEn) : t.divisionId}
                        </div>
                        <div className="text-[12px] text-[var(--text-secondary)]">
                          {isBn ? t.locationBn : t.locationEn}
                        </div>
                        <div className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                          {t.lat.toFixed(2)}°N, {t.lon.toFixed(2)}°E
                        </div>
                      </div>
                    );
                  },
                },
                {
                  key: 'metrics',
                  header: isBn ? 'রিয়েল-টাইম মেট্রিক্স' : 'Real-Time Metrics',
                  render: (t) => (
                    <div className="space-y-1 min-w-[180px]">
                      <div className="font-mono text-[14px] font-semibold text-[var(--text-primary)] tabular-nums">
                        {t.realTimeMetrics.primaryValue}
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        {isBn ? t.realTimeMetrics.primaryLabelBn : t.realTimeMetrics.primaryLabelEn}
                      </div>
                      <div className="text-[11px] font-mono text-[var(--text-secondary)]">
                        {t.realTimeMetrics.throughputOrCapacity}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'risk',
                  header: isBn ? 'ঝুঁকি নির্দেশক' : 'Risk Indicator',
                  render: (t) => (
                    <div className="space-y-1 min-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <StatusLabel status={t.riskIndicators.severity} />
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                          Score: {t.riskIndicators.overallScore}
                        </span>
                      </div>
                      <div className="text-[11px] leading-[15px] text-[var(--text-primary)] line-clamp-2">
                        {isBn ? t.riskIndicators.threatTitleBn : t.riskIndicators.threatTitleEn}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'policy',
                  header: isBn ? 'আইনি অবস্থান' : 'Policy Status',
                  render: (t) => (
                    <div className="space-y-1 min-w-[180px]">
                      <div className="font-mono text-[12px] font-semibold text-[#0B5D45] dark:text-[#6EE7B7]">
                        {t.associatedPolicy.policyCode}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusLabel status={t.associatedPolicy.stage} />
                        <span className="font-mono text-[11px] text-[var(--text-secondary)] tabular-nums">
                          {t.associatedPolicy.progressPct}%
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--text-secondary)]">
                        AIA: {t.associatedPolicy.aiaAuditStatus}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  header: isBn ? 'পদক্ষেপ' : 'Action',
                  align: 'right',
                  render: (t) => (
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => handleSelectToolFromTable(t)}>
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{isBn ? 'ডেটা শিট' : 'Data Sheet'}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateTo(t.linkedModule, t.linkedSubTab)}
                      >
                        <span>{isBn ? 'মডিউল' : 'Open'}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )}
        </SectionCard>
      ) : activeSubTab === 'benchmarks' ? (
        /* TAB 3: GLOBAL BENCHMARKS */
        <SectionCard
          title={
            isBn
              ? 'আন্তর্জাতিক এআই অবজারভেটরি বেঞ্চমার্কিং (OECD / UNESCO মানদণ্ড)'
              : 'International AI Observatory Standing & Peer Benchmarks'
          }
          subtitle={
            isBn
              ? 'বৈশ্বিক র‍্যাঙ্কিং, গভর্নেন্স, অবকাঠামো, মানবসম্পদ ও দায়িত্বশীল এআই স্তম্ভে বাংলাদেশের তুলনামূলক অবস্থান'
              : 'Comparative national maturity benchmark across OECD-aligned pillars against global & regional peers'
          }
          action={
            <Button variant="ghost" size="sm" onClick={() => navigateTo('m16', 'rankings')}>
              <span>{isBn ? 'পূর্ণ বেঞ্চমার্ক (মডিউল ১৬)' : 'Full Benchmarking (M16)'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          }
        >
          <div className="space-y-4">
            {BENCHMARK_COUNTRIES.map((entry) => {
              const isBD = entry.countryCode === 'BD';
              const scoreToShow = isBD ? computedReadinessScore : entry.overallScore;
              return (
                <div
                  key={entry.countryCode}
                  className={`p-4 rounded-[12px] border ${
                    isBD
                      ? 'border-[#0B5D45] bg-[#ECF4F1]/50 dark:bg-[#157F5E]/15'
                      : 'border-[var(--border-default)] bg-[var(--bg-page)]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[13px] font-semibold text-[#0B5D45] dark:text-[#6EE7B7] tabular-nums">
                        #{formatNumberForLocale(entry.globalRank, language)}
                      </span>
                      <span className="font-serif-editorial text-[17px] font-semibold text-[var(--text-primary)]">
                        {entry.countryName}
                      </span>
                      <span className="text-[12px] text-[var(--text-secondary)]">
                        · {entry.bestPracticeHighlight}
                      </span>
                    </div>
                    <div className="font-mono text-[18px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatNumberForLocale(scoreToShow.toFixed(1), language)}{' '}
                      <span className="text-[12px] font-normal text-[var(--text-secondary)]">/ 100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 pt-3 border-t border-[var(--border-default)]/70">
                    {[
                      {
                        label: isBn ? 'গভর্নেন্স' : 'Governance',
                        val: isBD ? pillarAverages.Institutional : entry.governanceScore,
                      },
                      {
                        label: isBn ? 'অবকাঠামো' : 'Infrastructure',
                        val: isBD ? pillarAverages.Infrastructure : entry.infrastructureScore,
                      },
                      {
                        label: isBn ? 'মানবসম্পদ' : 'Human Capital',
                        val: isBD ? pillarAverages['Human Capital'] : entry.humanCapitalScore,
                      },
                      {
                        label: isBn ? 'গবেষণা' : 'Research',
                        val: entry.researchScore,
                      },
                      {
                        label: isBn ? 'দায়িত্বশীল এআই' : 'Responsible AI',
                        val: isBD ? pillarAverages['Responsible AI'] : entry.responsibleAiScore,
                      },
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-1">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[var(--text-secondary)]">{metric.label}</span>
                          <span className="font-mono font-medium tabular-nums text-[var(--text-primary)]">
                            {formatNumberForLocale(metric.val.toFixed(1), language)}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isBD ? 'bg-[#0B5D45]' : 'bg-[#667085] dark:bg-[#98A2B3]'
                            }`}
                            style={{ width: `${Math.min(100, metric.val)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        /* TAB 1: HERO MAP ON TOP + DETAILED DATA SHEET DIRECTLY BELOW THE MAP */
        <div className="space-y-8">
          {/* 1. TOP INTERACTIVE BANGLADESH MAP */}
          <section aria-label={isBn ? 'বাংলাদেশ এআই অবজারভেটরি মানচিত্র' : 'Bangladesh AI Observatory Map'}>
            <BangladeshObservatoryMap
              tools={allTools}
              selectedToolId={selectedTool.id}
              onSelectTool={(t) => {
                setSelectedToolId(t.id);
                setActiveDivision(t.divisionId);
                const el = document.getElementById('observatory-data-drawer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              activeZoneType={activeZoneType}
              onZoneTypeChange={setActiveZoneType}
              activeDivision={activeDivision}
              onDivisionChange={(div) => {
                setActiveDivision(div);
                if (div !== 'ALL') {
                  const firstInDiv = allTools.find((t) => t.divisionId === div);
                  if (firstInDiv) setSelectedToolId(firstInDiv.id);
                }
                const el = document.getElementById('observatory-data-drawer');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              language={language}
            />
          </section>

          {/* 2. CARD-BASED REGIONAL DATA DRAWER BENEATH THE MAP */}
          <section
            id="observatory-data-drawer"
            aria-label={isBn ? 'আঞ্চলিক এআই ডেটা ড্রয়ার' : 'Regional AI Data Drawer'}
            className="scroll-mt-6"
          >
            <div className="bg-[var(--bg-surface)] border-2 border-[#0B5D45] dark:border-[#157F5E] rounded-[16px] overflow-hidden shadow-sm">
              {/* Drawer Top Header Strip */}
              <div className="px-5 sm:px-6 py-4 bg-[#FAFAF7] dark:bg-[#15191C] border-b border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[12px]">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold bg-[#0B5D45] text-white">
                      <Compass className="w-3 h-3" />
                      <span>{isBn ? 'নির্বাচিত অঞ্চল' : 'Selected Region'}</span>
                      <span>·</span>
                      <span className="capitalize">{divisionProfile.division.id}</span>
                    </span>

                    <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                      {isBn ? divisionProfile.division.hubCityBn : divisionProfile.division.hubCityEn}
                    </span>
                    <span aria-hidden="true" className="text-[var(--text-secondary)]">·</span>
                    <span className="font-mono text-[12px] text-[var(--text-secondary)] tabular-nums">
                      {divisionProfile.division.labelLonLat[1].toFixed(2)}°N, {divisionProfile.division.labelLonLat[0].toFixed(2)}°E
                    </span>
                  </div>

                  <h3 className="font-serif-editorial text-[22px] sm:text-[24px] leading-[30px] font-semibold text-[var(--text-primary)]">
                    {isBn ? divisionProfile.division.nameBn : divisionProfile.division.nameEn} {isBn ? 'বিভাগ' : 'Division'}
                  </h3>

                  <p className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
                    {isBn ? divisionProfile.division.specializationBn : divisionProfile.division.specializationEn}
                  </p>
                </div>

                {/* Right Drawer Controls: Division Switcher + Export */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    aria-label={isBn ? 'অঞ্চল পরিবর্তন করুন' : 'Switch active region'}
                    value={activeDivision}
                    onChange={(e) => {
                      const div = e.target.value as DivisionId | 'ALL';
                      setActiveDivision(div);
                      if (div !== 'ALL') {
                        const firstInDiv = allTools.find((t) => t.divisionId === div);
                        if (firstInDiv) setSelectedToolId(firstInDiv.id);
                      }
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[13px] font-medium text-[var(--text-primary)] cursor-pointer focus:outline-none focus:border-[#0B5D45]"
                  >
                    <option value="ALL">{isBn ? 'জাতীয় হাব দৃশ্য (সকল বিভাগ)' : 'National Hub View (All Divisions)'}</option>
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {isBn ? d.nameBn : d.nameEn} {isBn ? 'বিভাগ' : 'Division'}
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      handleExportRegistry(
                        activeDivision === 'ALL'
                          ? '/api/v1/observatory'
                          : `/api/v1/observatory/regions/${activeDivision}`,
                        isBn
                          ? `${activeDivision === 'ALL' ? 'জাতীয়' : activeDivision} বিভাগীয় অবজারভেটরি ডেটাসেট`
                          : `${activeDivision} Regional Observatory Telemetry`
                      )
                    }
                  >
                    <Code2 className="w-4 h-4" />
                    <span>{isBn ? 'এপিআই ডেটা (REST API)' : 'Region API Data'}</span>
                  </Button>
                </div>
              </div>

              {/* Division Selector Ribbon (All 8 Divisions + Quick Switch) */}
              <div className="px-5 sm:px-6 py-2.5 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase tracking-wider shrink-0 mr-1">
                  {isBn ? 'প্রশাসনিক অঞ্চল:' : 'Regions:'}
                </span>
                {BANGLADESH_DIVISIONS.map((div) => {
                  const isCur = activeDivision === div.id;
                  const count = allTools.filter((t) => t.divisionId === div.id).length;
                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => {
                        setActiveDivision(div.id);
                        const firstInDiv = allTools.find((t) => t.divisionId === div.id);
                        if (firstInDiv) setSelectedToolId(firstInDiv.id);
                      }}
                      className={`min-h-[32px] px-2.5 py-1 rounded-[6px] border text-[12px] font-medium transition-colors shrink-0 cursor-pointer ${
                        isCur
                          ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                          : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#0B5D45]'
                      }`}
                    >
                      <span>{isBn ? div.nameBn : div.nameEn}</span>
                      <span className="ml-1.5 font-mono text-[10px] opacity-80 tabular-nums">
                        ({count})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Regional 4-Metric Summary Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 border-b border-[var(--border-default)] bg-[var(--bg-page)] divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-default)]">
                <div className="p-3.5 sm:p-4 space-y-0.5">
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#0B5D45] dark:text-[#6EE7B7]" />
                    <span>{isBn ? 'আঞ্চলিক অবকাঠামো সম্পদ' : 'Localized Infrastructure'}</span>
                  </div>
                  <div className="font-mono text-[22px] leading-[28px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatNumberForLocale(divisionProfile.localizedInfrastructure.length, language)}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {isBn ? 'সার্বভৌম কম্পিউট ও ক্লাউড নোড' : 'Sovereign compute & data assets'}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 space-y-0.5">
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2E5E8C] dark:text-[#93C5FD]" />
                    <span>{isBn ? 'সংশ্লিষ্ট নীতি ও কাঠামো' : 'Applicable Policies'}</span>
                  </div>
                  <div className="font-mono text-[22px] leading-[28px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatNumberForLocale(divisionProfile.localizedPolicies.length, language)}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] font-mono tabular-nums">
                    {formatNumberForLocale(divisionProfile.avgCompliance, language)}% {isBn ? 'গড় সম্মতি হার' : 'avg compliance'}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 space-y-0.5">
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#B42318] dark:text-[#F87171]" />
                    <span>{isBn ? 'ঝুঁকি ও সার্ট টেলিমেট্রি' : 'Risk & Threat Signals'}</span>
                  </div>
                  <div className="font-mono text-[22px] leading-[28px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatNumberForLocale(divisionProfile.localizedRisks.length + divisionProfile.localizedIncidents.length, language)}
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    <StatusLabel status={divisionProfile.dominantSeverity} />
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 space-y-0.5">
                  <div className="text-[11px] text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#5EEAD4]" />
                    <span>{isBn ? 'নাগরিক সেবা ও প্রকল্প' : 'Citizen Reach & Projects'}</span>
                  </div>
                  <div className="font-mono text-[22px] leading-[28px] font-semibold text-[var(--text-primary)] tabular-nums">
                    {formatNumberForLocale((divisionProfile.totalBeneficiariesK / 1000).toFixed(1), language)}M
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)]">
                    {formatNumberForLocale(divisionProfile.localizedPublicProjects.length, language)} {isBn ? 'টি সক্রিয় জনসেবা প্রজেক্ট' : 'public AI deployments'}
                  </div>
                </div>
              </div>

              {/* Card Drawer Navigation Filter Tabs */}
              <div className="px-5 sm:px-6 pt-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] overflow-x-auto">
                <nav
                  className="flex items-center gap-6 min-w-max"
                  role="tablist"
                  aria-label={isBn ? 'ড্রয়ার কার্ড ক্যাটাগরি' : 'Drawer card categories'}
                >
                  {[
                    {
                      id: 'all',
                      labelEn: 'All Regional Cards',
                      labelBn: 'সকল আঞ্চলিক কার্ড',
                      icon: Layers,
                      badge: divisionProfile.localizedInfrastructure.length + divisionProfile.localizedPolicies.length + divisionProfile.localizedRisks.length,
                    },
                    {
                      id: 'infrastructure',
                      labelEn: '1. Localized Infrastructure',
                      labelBn: '১. আঞ্চলিক অবকাঠামো',
                      icon: Server,
                      badge: divisionProfile.localizedInfrastructure.length,
                    },
                    {
                      id: 'policy',
                      labelEn: '2. Policy Status',
                      labelBn: '২. নীতিগত অবস্থান',
                      icon: FileText,
                      badge: divisionProfile.localizedPolicies.length,
                    },
                    {
                      id: 'risks',
                      labelEn: '3. Risk Indicators',
                      labelBn: '৩. ঝুঁকি নির্দেশক',
                      icon: ShieldAlert,
                      badge: divisionProfile.localizedRisks.length + divisionProfile.localizedIncidents.length,
                    },
                    {
                      id: 'projects',
                      labelEn: '4. Civic Projects & Labs',
                      labelBn: '৪. নাগরিক প্রজেক্ট ও ল্যাব',
                      icon: Activity,
                      badge: divisionProfile.localizedPublicProjects.length + divisionProfile.localizedResearch.length,
                    },
                    {
                      id: 'node',
                      labelEn: '5. Node Inspector',
                      labelBn: '৫. নোড টেলিমেট্রি',
                      icon: Zap,
                      badge: divisionProfile.nodes.length,
                    },
                  ].map((tab) => {
                    const isActive = drawerCardFilter === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setDrawerCardFilter(tab.id as typeof drawerCardFilter)}
                        className={`min-h-[44px] py-2.5 inline-flex items-center gap-2 text-[14px] font-medium border-b-2 transition-colors cursor-pointer ${
                          isActive
                            ? 'border-[#0B5D45] text-[#0B5D45] dark:text-[#6EE7B7] font-semibold'
                            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{isBn ? tab.labelBn : tab.labelEn}</span>
                        {tab.badge !== undefined && (
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)] tabular-nums">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Card Drawer Body Content */}
              <div className="p-5 sm:p-6 space-y-8">
                {/* 1. LOCALIZED AI INFRASTRUCTURE CARDS */}
                {(drawerCardFilter === 'all' || drawerCardFilter === 'infrastructure') && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Server className="w-4 h-4 text-[#0B5D45] dark:text-[#6EE7B7]" />
                          <h4 className="font-serif-editorial text-[18px] font-semibold text-[var(--text-primary)]">
                            {isBn
                              ? 'আঞ্চলিক এআই অবকাঠামো ও কম্পিউট সম্পদ (Infrastructure Assets)'
                              : 'Localized AI Infrastructure & Compute Assets'}
                          </h4>
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isBn
                            ? 'GovernanceContext ডেটাসেট অনুযায়ী এই প্রশাসনিক অঞ্চলে নিয়োজিত ডেটা সেন্টার, জিপিইউ ক্লাস্টার ও সার্বভৌম নেটওয়ার্ক'
                            : 'Data center facilities, GPU clusters, and sovereign cloud infrastructure mapped to this division from GovernanceContext'}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateTo('m10', 'compute')}
                      >
                        <Cpu className="w-4 h-4" />
                        <span>{isBn ? 'মডিউল ১০ কম্পিউট লেজার খুলুন' : 'Open Module 10 Compute'}</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {divisionProfile.localizedInfrastructure.map((inf) => {
                        const utilColor =
                          inf.utilizationPct > 85
                            ? 'bg-[#DC2626]'
                            : inf.utilizationPct > 70
                            ? 'bg-[#D97706]'
                            : 'bg-[#0B5D45]';

                        return (
                          <div
                            key={inf.id}
                            className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#0B5D45]/60 transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] text-[11px] font-mono font-medium bg-[#ECF4F1] dark:bg-[#157F5E]/20 text-[#0B5D45] dark:text-[#6EE7B7]">
                                  <Server className="w-3 h-3" />
                                  <span>{inf.category}</span>
                                </span>
                                <StatusLabel status={inf.status} />
                              </div>

                              <h5 className="font-serif-editorial text-[16px] leading-[22px] font-semibold text-[var(--text-primary)]">
                                {inf.name}
                              </h5>

                              <div className="text-[12px] text-[var(--text-secondary)] flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-[#0B5D45] shrink-0" />
                                <span>{inf.location}</span>
                              </div>

                              <div className="font-mono text-[12px] text-[var(--text-primary)] bg-[var(--bg-subtle)] p-2 rounded-[6px]">
                                {inf.capacitySpec}
                              </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                              <div className="space-y-1">
                                <div className="flex justify-between text-[11px]">
                                  <span className="text-[var(--text-secondary)]">
                                    {isBn ? 'ব্যবহার ও ক্যাপাসিটি লোড' : 'Utilization Load'}
                                  </span>
                                  <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                                    {inf.utilizationPct}%
                                  </span>
                                </div>
                                <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${utilColor}`}
                                    style={{ width: `${Math.min(100, inf.utilizationPct)}%` }}
                                  />
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1">
                                <span className="inline-flex items-center gap-1 text-[11px] text-[#0B5D45] dark:text-[#6EE7B7] font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{inf.sovereignHosted ? 'Sovereign Hosted' : 'Hybrid Cloud'}</span>
                                </span>
                                {inf.evidenceId && <EvidenceLink evidenceId={inf.evidenceId} />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. LOCALIZED POLICY STATUS CARDS */}
                {(drawerCardFilter === 'all' || drawerCardFilter === 'policy') && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#2E5E8C] dark:text-[#93C5FD]" />
                          <h4 className="font-serif-editorial text-[18px] font-semibold text-[var(--text-primary)]">
                            {isBn
                              ? 'সংশ্লিষ্ট জাতীয় নীতি ও আইনগত অবস্থান (Policy & Statutory Status)'
                              : 'Associated National Policies & Statutory Status'}
                          </h4>
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isBn
                            ? 'এই অঞ্চলের এআই কার্যক্রমে প্রযোজ্য সার্বভৌম নীতি, আইনগত ধারা ও বাস্তবায়ন মাইলফলক'
                            : 'Statutory policies, regulatory gates, and enactment milestones governing AI workloads in this division'}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateTo('m03', 'drafts')}
                      >
                        <FileText className="w-4 h-4" />
                        <span>{isBn ? 'মডিউল ০৩ নীতি পাইপলাইন খুলুন' : 'Open Module 03 Policies'}</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {divisionProfile.localizedPolicies.map((pol) => (
                        <div
                          key={pol.id}
                          className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#0B5D45]/60 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-[12px] font-bold text-[#0B5D45] dark:text-[#6EE7B7]">
                                {pol.code}
                              </span>
                              <StatusLabel status={pol.stage} />
                            </div>

                            <h5 className="font-serif-editorial text-[16px] leading-[22px] font-semibold text-[var(--text-primary)]">
                              {pol.title}
                            </h5>

                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-[var(--text-secondary)]">
                                  {isBn ? 'আইনগত প্রণয়ন অগ্রগতি' : 'Legislative Progress'}
                                </span>
                                <span className="font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                                  {pol.progressPct}%
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#0B5D45]"
                                  style={{ width: `${Math.min(100, pol.progressPct)}%` }}
                                />
                              </div>
                            </div>

                            {pol.gapSummary && (
                              <div className="p-2.5 rounded-[6px] bg-[var(--bg-subtle)] text-[12px] text-[var(--text-secondary)] leading-[17px]">
                                <strong className="text-[var(--text-primary)]">
                                  {pol.gapCount} {isBn ? 'টি আইনি ফারাক:' : 'Gaps:'}
                                </strong>{' '}
                                {pol.gapSummary}
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-[12px]">
                            <span className="font-mono text-[var(--text-secondary)] text-[11px]">
                              {isBn ? 'লক্ষ্য:' : 'Target:'} {pol.targetDate}
                            </span>
                            {pol.evidenceId && <EvidenceLink evidenceId={pol.evidenceId} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. LOCALIZED RISK INDICATORS CARDS */}
                {(drawerCardFilter === 'all' || drawerCardFilter === 'risks') && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-[#B42318] dark:text-[#F87171]" />
                          <h4 className="font-serif-editorial text-[18px] font-semibold text-[var(--text-primary)]">
                            {isBn
                              ? 'ঝুঁকি নির্দেশক ও সার্ট সাইবার থ্রেট প্রোফাইল (Risk Indicators & CIRT)'
                              : 'Localized Risk Indicators & CIRT Cyber Advisories'}
                          </h4>
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isBn
                            ? '৫×৫ ম্যাট্রিক্স ঝুঁকি মূল্যায়ন, বিজিডি ই-গভ সার্ট সাইবার অ্যাডভাইজরি এবং সক্রিয় প্রশমন প্রটোকল'
                            : '5x5 Likelihood x Impact risk matrix, BGD e-GOV CIRT threat telemetry, and active containment plans'}
                        </p>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigateTo('m06', 'register')}
                      >
                        <Shield className="w-4 h-4" />
                        <span>{isBn ? 'মডিউল ০৬ ঝুঁকি রেজিস্টার খুলুন' : 'Open Module 06 Risks'}</span>
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {divisionProfile.localizedRisks.map((rsk) => {
                        const score = rsk.likelihood * rsk.impact;
                        const sevTone = score >= 16 ? 'Critical' : score >= 12 ? 'High' : score >= 6 ? 'Moderate' : 'Low';

                        return (
                          <div
                            key={rsk.id}
                            className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#B42318]/60 transition-all flex flex-col justify-between space-y-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-mono text-[11px] font-bold text-[#B42318] dark:text-[#F87171]">
                                  {rsk.code}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <StatusLabel status={sevTone} />
                                  <StatusLabel status={rsk.status} />
                                </div>
                              </div>

                              <h5 className="font-serif-editorial text-[15px] leading-[21px] font-semibold text-[var(--text-primary)]">
                                {rsk.title}
                              </h5>

                              <div className="p-2 rounded-[6px] bg-[var(--bg-subtle)] font-mono text-[11px] flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">5×5 Matrix:</span>
                                <span className="font-bold text-[var(--text-primary)] tabular-nums">
                                  L: {rsk.likelihood}/5 × I: {rsk.impact}/5 = {score} / 25
                                </span>
                              </div>

                              <div className="p-2.5 rounded-[6px] border border-[#0B5D45]/20 bg-[#ECF4F1]/50 dark:bg-[#157F5E]/10 text-[12px] text-[var(--text-primary)] leading-[17px]">
                                <strong className="text-[#0B5D45] dark:text-[#6EE7B7]">
                                  {isBn ? 'প্রশমন পরিকল্পনা:' : 'Mitigation:'}
                                </strong>{' '}
                                {rsk.mitigationPlan}
                              </div>
                            </div>

                            <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-[11px]">
                              <span className="text-[var(--text-secondary)] font-mono">
                                {rsk.classification}
                              </span>
                              {rsk.evidenceId && <EvidenceLink evidenceId={rsk.evidenceId} />}
                            </div>
                          </div>
                        );
                      })}

                      {divisionProfile.localizedIncidents.map((inc) => (
                        <div
                          key={inc.id}
                          className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#B42318]/60 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-[11px] font-bold text-[#D97706]">
                                CIRT · {inc.code}
                              </span>
                              <StatusLabel status={inc.severity} />
                            </div>

                            <h5 className="font-serif-editorial text-[15px] leading-[21px] font-semibold text-[var(--text-primary)]">
                              {inc.title}
                            </h5>

                            <div className="text-[12px] text-[var(--text-secondary)]">
                              <strong>{isBn ? 'আক্রান্ত সিস্টেম:' : 'Affected System:'}</strong> {inc.affectedSystem}
                            </div>

                            <div className="text-[11px] font-mono text-[var(--text-secondary)]">
                              {isBn ? 'রিপোর্ট তারিখ:' : 'Reported:'} {inc.reportedDate} · {inc.resolutionStatus}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-[11px]">
                            <span className="text-[var(--text-secondary)]">{inc.type}</span>
                            {inc.evidenceId && <EvidenceLink evidenceId={inc.evidenceId} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. LOCALIZED PUBLIC PROJECTS & RESEARCH LABS */}
                {(drawerCardFilter === 'all' || drawerCardFilter === 'projects') && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#0F766E] dark:text-[#5EEAD4]" />
                          <h4 className="font-serif-editorial text-[18px] font-semibold text-[var(--text-primary)]">
                            {isBn
                              ? 'নাগরিক এআই প্রজেক্ট ও বিশ্ববিদ্যালয় গবেষণা ল্যাব (Civic AI & Labs)'
                              : 'Public Sector AI Deployments & Research Innovation Hubs'}
                          </h4>
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isBn
                            ? 'সরকারি সেবায় নিয়োজিত এআই টুলস এবং এই বিভাগে অবস্থিত বিশ্ববিদ্যালয় গবেষণা প্রকল্প'
                            : 'Public sector AI deployments with citizen reach and university research hubs in this division'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateTo('m14', 'register')}
                        >
                          <span>{isBn ? 'মডিউল ১৪ সরকারি এআই' : 'Module 14 Deployments'}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigateTo('m12', 'projects')}
                        >
                          <span>{isBn ? 'মডিউল ১২ গবেষণা' : 'Module 12 Research'}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {divisionProfile.localizedPublicProjects.map((pub) => (
                        <div
                          key={pub.id}
                          className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#0B5D45]/60 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-mono text-[11px] font-bold text-[#0B5D45] dark:text-[#6EE7B7]">
                                {pub.registryCode}
                              </span>
                              <StatusLabel status={pub.stage} />
                            </div>

                            <h5 className="font-serif-editorial text-[16px] leading-[22px] font-semibold text-[var(--text-primary)]">
                              {pub.title}
                            </h5>

                            <div className="text-[12px] text-[var(--text-secondary)]">
                              {pub.ministry} · {pub.serviceDomain}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-[12px]">
                            <span className="font-mono font-medium text-[#0B5D45] dark:text-[#6EE7B7] tabular-nums">
                              {formatNumberForLocale(pub.beneficiariesK, language)}K {isBn ? 'নাগরিক সুবিধাভোগী' : 'beneficiaries'}
                            </span>
                            {pub.evidenceId && <EvidenceLink evidenceId={pub.evidenceId} />}
                          </div>
                        </div>
                      ))}

                      {divisionProfile.localizedResearch.map((res) => (
                        <div
                          key={res.id}
                          className="p-4 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#0B5D45]/60 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#0F766E] dark:text-[#5EEAD4]">
                                {res.category}
                              </span>
                              <span className="font-mono text-[11px] px-2 py-0.5 rounded-[4px] bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                                {res.trlOrStage}
                              </span>
                            </div>

                            <h5 className="font-serif-editorial text-[16px] leading-[22px] font-semibold text-[var(--text-primary)]">
                              {res.title}
                            </h5>

                            <div className="text-[12px] text-[var(--text-secondary)]">
                              {res.organization} · {res.focusArea}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-[var(--border-default)] flex items-center justify-between text-[12px]">
                            <span className="font-mono font-medium text-[var(--text-primary)] tabular-nums">
                              Grant: ${formatNumberForLocale((res.fundingAmountUSD / 1000).toFixed(0), language)}K USD
                            </span>
                            {res.evidenceId && <EvidenceLink evidenceId={res.evidenceId} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. MAPPED NODE TELEMETRY INSPECTOR */}
                {(drawerCardFilter === 'all' || drawerCardFilter === 'node') && (
                  <div className="space-y-4 animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#0B5D45] dark:text-[#6EE7B7]" />
                          <h4 className="font-serif-editorial text-[18px] font-semibold text-[var(--text-primary)]">
                            {isBn
                              ? 'নির্দিষ্ট এআই নোডের লাইভ টেলিমেট্রি ও পরিচালন বিবরণী (Node Inspector)'
                              : 'Regional Node Telemetry & Operational Inspector'}
                          </h4>
                        </div>
                        <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                          {isBn
                            ? 'মানচিত্রের যেকোনো নির্দিষ্ট পয়েন্টে ক্লিক করে তার লাইভ হার্ডওয়্যার লোড, নেটওয়ার্ক স্পেক ও মডেল দেখুন'
                            : 'Detailed operational telemetry, model deployments, and compute specs for any specific mapped point'}
                        </p>
                      </div>

                      {/* Sibling node pills */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[11px] text-[var(--text-secondary)] mr-1 font-mono">
                          {isBn ? 'নোড নির্বাচন:' : 'Nodes in region:'}
                        </span>
                        {divisionProfile.nodes.map((n) => {
                          const isSel = n.id === selectedTool.id;
                          return (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => setSelectedToolId(n.id)}
                              className={`min-h-[30px] px-2 py-0.5 rounded-[6px] border text-[11px] font-mono transition-colors cursor-pointer ${
                                isSel
                                  ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                                  : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#0B5D45]'
                              }`}
                            >
                              {n.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Node Inspection Container */}
                    <div className="p-4 sm:p-5 rounded-[12px] border border-[#0B5D45]/40 bg-[#FAFAF7] dark:bg-[#15191C] space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-[12px]">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold text-white"
                              style={{ backgroundColor: selectedZoneMeta.color }}
                            >
                              <span>{selectedTool.code}</span>
                              <span>·</span>
                              <span>{isBn ? selectedZoneMeta.shortBn : selectedZoneMeta.shortEn}</span>
                            </span>
                            <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                              {isBn ? selectedTool.locationBn : selectedTool.locationEn}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-[12px] text-[var(--text-secondary)] tabular-nums">
                              {selectedTool.lat.toFixed(2)}°N, {selectedTool.lon.toFixed(2)}°E
                            </span>
                          </div>

                          <h5 className="font-serif-editorial text-[20px] font-semibold text-[var(--text-primary)]">
                            {isBn ? selectedTool.nameBn : selectedTool.nameEn}
                          </h5>
                          <div className="text-[12px] text-[var(--text-secondary)]">
                            {selectedTool.institution}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <StatusLabel status={selectedTool.status} />
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigateTo(selectedTool.linkedModule, selectedTool.linkedSubTab)}
                          >
                            <span>{isBn ? 'মডিউল খুলুন' : 'Open Linked Module'}</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 4 Node Telemetry Mini-Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {isBn ? selectedTool.realTimeMetrics.primaryLabelBn : selectedTool.realTimeMetrics.primaryLabelEn}
                          </div>
                          <div className="font-mono text-[20px] font-semibold text-[#0B5D45] dark:text-[#6EE7B7] tabular-nums mt-0.5">
                            {selectedTool.realTimeMetrics.primaryValue}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {selectedTool.realTimeMetrics.uptimeOrSLA}
                          </div>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {isBn ? 'কম্পিউট লোড ও স্পেক' : 'Compute Load & Spec'}
                          </div>
                          <div className="font-mono text-[13px] font-semibold text-[var(--text-primary)] mt-0.5 line-clamp-1">
                            {selectedTool.realTimeMetrics.computeLoadOrSpec}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {isBn ? 'সার্বভৌম ক্লাস্টার' : 'Sovereign Enclave'}
                          </div>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {isBn ? 'বিলম্বিতা ও থ্রুপুট' : 'Latency & Throughput'}
                          </div>
                          <div className="font-mono text-[16px] font-semibold text-[var(--text-primary)] tabular-nums mt-0.5">
                            {selectedTool.realTimeMetrics.networkLatency}
                          </div>
                          <div className="text-[10px] font-mono text-[var(--text-secondary)] mt-0.5">
                            {selectedTool.realTimeMetrics.throughputOrCapacity}
                          </div>
                        </div>

                        <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)]">
                          <div className="text-[11px] text-[var(--text-secondary)]">
                            {isBn ? 'সক্রিয় মডেল ও সুবিধাভোগী' : 'Active Models & Reach'}
                          </div>
                          <div className="font-mono text-[14px] font-semibold text-[var(--text-primary)] mt-0.5 line-clamp-1">
                            {selectedTool.realTimeMetrics.activeModelsOrDeployments}
                          </div>
                          <div className="text-[10px] text-[var(--text-secondary)] mt-0.5">
                            {selectedTool.realTimeMetrics.reachOrBeneficiaries}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 rounded-[8px] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[13px] text-[var(--text-secondary)] leading-[19px]">
                        {isBn ? selectedTool.summaryBn : selectedTool.summaryEn}
                      </div>

                      {selectedTool.featuresEn.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono text-[var(--text-secondary)] uppercase">
                            {isBn ? 'সক্রিয় পরিচালন মানদণ্ড ও ফিচারসমূহ:' : 'Active Features:'}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {(isBn ? selectedTool.featuresBn : selectedTool.featuresEn).map((f, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-[6px] text-[12px] bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)]"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer Status Ribbon */}
              <div className="px-5 sm:px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-subtle)] flex flex-wrap items-center justify-between gap-3 text-[12px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0B5D45]" />
                  <span>
                    {isBn
                      ? 'মানচিত্রের যেকোনো অঞ্চল বা পয়েন্টে ক্লিক করে তাৎক্ষণিক ডেটা ড্রয়ার আপডেট করুন।'
                      : 'Click any division or pin on the Bangladesh map to load localized infrastructure, policies, and risks.'}
                  </span>
                </div>
                <div className="font-mono text-[11px] tabular-nums">
                  {divisionProfile.division.nameEn} · {divisionProfile.totalNodes} {isBn ? 'টি নোড' : 'nodes'}
                </div>
              </div>
            </div>
          </section>

          {/* 3. EXECUTIVE OBSERVATORY KPI STRIP */}
          <section
            aria-label={isBn ? 'অবজারভেটরি সারসংক্ষেপ সূচক' : 'Observatory executive metrics'}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
          >
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
              <div className="text-[12px] text-[var(--text-secondary)]">
                {isBn ? 'মানচিত্রায়িত জাতীয় পয়েন্ট' : 'Mapped National Nodes'}
              </div>
              <div className="font-mono text-[26px] leading-[32px] font-semibold tabular-nums text-[var(--text-primary)] mt-1">
                {formatNumberForLocale(allTools.length, language)}
              </div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-1">
                {isBn ? 'অবকাঠামো, ল্যাব ও নীতি অঞ্চল' : 'Infrastructure, Labs & Policy Zones'}
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
              <div className="text-[12px] text-[var(--text-secondary)]">
                {isBn ? 'ভৌগোলিক কভারেজ' : 'Geographic Coverage'}
              </div>
              <div className="font-mono text-[26px] leading-[32px] font-semibold tabular-nums text-[#0B5D45] dark:text-[#6EE7B7] mt-1">
                {isBn ? '৮ / ৮ বিভাগ' : '8 / 8 Divisions'}
              </div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-1">
                {isBn ? '৬৪ জেলায় ৩৩৩ ও ফাইবার সংযোগ' : '64-district public & fiber reach'}
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
              <div className="text-[12px] text-[var(--text-secondary)]">
                {isBn ? 'জাতীয় প্রস্তুতি ও র‍্যাঙ্ক' : 'National Readiness'}
              </div>
              <div className="font-mono text-[26px] leading-[32px] font-semibold tabular-nums text-[var(--text-primary)] mt-1">
                {formatNumberForLocale(computedReadinessScore.toFixed(1), language)}
                <span className="text-[14px] font-normal text-[var(--text-secondary)]"> / 100</span>
              </div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-1">
                {isBn
                  ? `বৈশ্বিক অবস্থান #${formatNumberForLocale(bdBenchmark?.globalRank ?? 64, language)}`
                  : `Global AI Index Rank #${bdBenchmark?.globalRank ?? 64}`}
              </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
              <div className="text-[12px] text-[var(--text-secondary)]">
                {isBn ? 'নাগরিক ও জনবল সংযুক্তি' : 'Citizen & Talent Reach'}
              </div>
              <div className="font-mono text-[26px] leading-[32px] font-semibold tabular-nums text-[var(--text-primary)] mt-1">
                {formatNumberForLocale((totalBeneficiariesK / 1000).toFixed(1), language)}M
              </div>
              <div className="text-[12px] text-[var(--text-secondary)] mt-1">
                {isBn
                  ? `+ ${formatNumberForLocale((totalTrained / 1000).toFixed(1), language)}K প্রশিক্ষিত জনবল`
                  : `+ ${(totalTrained / 1000).toFixed(1)}K certified AI workforce`}
              </div>
            </div>
          </section>

          {/* 4. DIVISIONAL AI FOOTPRINT DASHBOARD */}
          <SectionCard
            title={
              isBn
                ? 'বিভাগভিত্তিক এআই পদচিহ্ন ও সক্ষমতা ড্যাশবোর্ড'
                : 'Divisional AI Footprint & Capability Dashboard'
            }
            subtitle={
              isBn
                ? 'বাংলাদেশের প্রতিটি বিভাগে সক্রিয় এআই অবকাঠামো, গবেষণা হাব ও নীতি অঞ্চলসমূহ'
                : 'Click any division card to view its specific data sheet and highlight on the Bangladesh map'
            }
            action={
              <button
                type="button"
                onClick={() => setDivisionViewAsTable((v) => !v)}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] border border-[var(--border-default)] text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
              >
                <Table2 className="w-4 h-4" />
                <span>
                  {divisionViewAsTable
                    ? isBn
                      ? 'কার্ড দৃশ্য'
                      : 'Card view'
                    : isBn
                    ? 'টেবিল দৃশ্য'
                    : 'Table view'}
                </span>
              </button>
            }
          >
            {divisionViewAsTable ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead className="border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-2.5 pr-4 font-medium">{isBn ? 'বিভাগ' : 'Division'}</th>
                      <th className="py-2.5 pr-4 font-medium">{isBn ? 'প্রধান কেন্দ্র' : 'Primary Hub'}</th>
                      <th className="py-2.5 pr-4 font-medium">{isBn ? 'বিশেষায়িত ক্ষেত্র' : 'Specialization'}</th>
                      <th className="py-2.5 pr-4 font-medium text-right">{isBn ? 'অবকাঠামো' : 'Infra'}</th>
                      <th className="py-2.5 pr-4 font-medium text-right">{isBn ? 'গবেষণা' : 'Labs'}</th>
                      <th className="py-2.5 pr-4 font-medium text-right">{isBn ? 'নীতি' : 'Policy'}</th>
                      <th className="py-2.5 font-medium text-right">{isBn ? 'মোট পয়েন্ট' : 'Total'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {divisionBreakdown.map((div) => (
                      <tr
                        key={div.id}
                        onClick={() => {
                          setActiveDivision(div.id);
                          if (div.nodes[0]) setSelectedToolId(div.nodes[0].id);
                          const el = document.getElementById('observatory-data-sheet');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="hover:bg-[#0B5D45]/5 cursor-pointer"
                      >
                        <td className="py-3 pr-4 font-medium text-[var(--text-primary)]">
                          {isBn ? div.nameBn : div.nameEn}
                        </td>
                        <td className="py-3 pr-4 text-[var(--text-secondary)]">
                          {isBn ? div.hubCityBn : div.hubCityEn}
                        </td>
                        <td className="py-3 pr-4 text-[var(--text-secondary)]">
                          {isBn ? div.specializationBn : div.specializationEn}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums text-[#0B5D45]">
                          {div.infraCount}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums text-[#0F766E]">
                          {div.researchCount}
                        </td>
                        <td className="py-3 pr-4 text-right font-mono tabular-nums text-[#2E5E8C]">
                          {div.policyCount}
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums font-semibold text-[var(--text-primary)]">
                          {formatNumberForLocale(div.toolCount, language)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {divisionBreakdown.map((div) => {
                  const isActiveDiv = activeDivision === div.id;
                  return (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => {
                        setActiveDivision(isActiveDiv ? 'ALL' : div.id);
                        if (div.nodes[0]) setSelectedToolId(div.nodes[0].id);
                        const el = document.getElementById('observatory-data-sheet');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`text-left p-4 rounded-[12px] border transition-colors cursor-pointer ${
                        isActiveDiv
                          ? 'border-[#0B5D45] bg-[#ECF4F1]/60 dark:bg-[#157F5E]/20'
                          : 'border-[var(--border-default)] bg-[var(--bg-page)] hover:border-[#0B5D45]'
                      }`}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-serif-editorial text-[16px] font-semibold text-[var(--text-primary)]">
                          {isBn ? div.nameBn : div.nameEn}
                        </span>
                        <span className="font-mono text-[13px] font-semibold tabular-nums text-[#0B5D45] dark:text-[#6EE7B7]">
                          {formatNumberForLocale(div.toolCount, language)}{' '}
                          {isBn ? 'পয়েন্ট' : div.toolCount === 1 ? 'point' : 'points'}
                        </span>
                      </div>
                      <div className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                        {isBn ? div.hubCityBn : div.hubCityEn} ·{' '}
                        {isBn ? div.specializationBn : div.specializationEn}
                      </div>

                      <div className="flex items-center gap-2 mt-3 text-[11px] font-mono">
                        <span className="inline-flex items-center gap-1 text-[#0B5D45] dark:text-[#6EE7B7]">
                          <span className="w-2 h-2 rounded-full bg-[#0B5D45]" />
                          <span>{div.infraCount} Infra</span>
                        </span>
                        <span aria-hidden="true" className="text-[var(--text-secondary)]">·</span>
                        <span className="inline-flex items-center gap-1 text-[#0F766E] dark:text-[#5EEAD4]">
                          <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                          <span>{div.researchCount} Labs</span>
                        </span>
                        <span aria-hidden="true" className="text-[var(--text-secondary)]">·</span>
                        <span className="inline-flex items-center gap-1 text-[#2E5E8C] dark:text-[#93C5FD]">
                          <span className="w-2 h-2 rounded-full bg-[#2E5E8C]" />
                          <span>{div.policyCount} Policy</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};
