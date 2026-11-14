import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Table2 } from 'lucide-react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { UI_TEXT } from '../../data/i18n';
import { BENCHMARK_COUNTRIES } from '../../data/seedData';
import { useGovernance } from '../../store/GovernanceContext';
import { ModuleId } from '../../types/os';
import { formatEditorialDate, formatNumberForLocale } from '../../utils/formatters';
import {
  ReadinessScaleBar,
  ReadinessTrendChart,
  Sparkline,
} from '../Charts/GovernanceCharts';
import {
  ErrorBanner,
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  SectionCard,
  SkeletonRows,
  StatusLabel,
} from '../Common/Primitives';

const PILLAR_GROUPS: Array<{
  key: 'intelligence_readiness' | 'policy_governance' | 'risk_responsibility' | 'capacity_ecosystem' | 'execution_automation';
  titleEn: string;
  titleBn: string;
}> = [
  { key: 'intelligence_readiness', titleEn: 'Intelligence & Readiness', titleBn: 'বুদ্ধিমত্তা ও প্রস্তুতি' },
  { key: 'policy_governance', titleEn: 'Policy & Governance', titleBn: 'নীতি ও গভর্নেন্স' },
  { key: 'risk_responsibility', titleEn: 'Risk & Responsibility', titleBn: 'ঝুঁকি ও দায়িত্বশীলতা' },
  { key: 'capacity_ecosystem', titleEn: 'Capacity & Ecosystem', titleBn: 'সক্ষমতা ও ইকোসিস্টেম' },
  { key: 'execution_automation', titleEn: 'Execution & Automation', titleBn: 'বাস্তবায়ন ও অটোমেশন' },
];

export const CentralCommandCentre: React.FC = () => {
  const {
    dataset,
    language,
    activeSubTab,
    navigateTo,
    computedReadinessScore,
    countryCode,
    isSwitchingCountry,
    syncError,
    retryWorkspaceSync,
    openInfoSheet,
  } = useGovernance();

  const isBn = language === 'bn';
  const mod = MODULES_REGISTRY[0];

  const [animatedScore, setAnimatedScore] = useState<number>(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      return computedReadinessScore;
    }
    return 0;
  });
  const hasCountedRef = useRef(false);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced || hasCountedRef.current) {
      setAnimatedScore(computedReadinessScore);
      return;
    }
    hasCountedRef.current = true;
    const duration = 600;
    const start = performance.now();
    const target = computedReadinessScore;
    let rafId = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Number((target * eased).toFixed(1)));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setAnimatedScore(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [computedReadinessScore]);

  const [trendAsTable, setTrendAsTable] = useState(false);
  const [modulesAsTable, setModulesAsTable] = useState(false);

  const avgPolicyProgress = dataset.policies.length
    ? Math.round(dataset.policies.reduce((a, p) => a + p.progressPct, 0) / dataset.policies.length)
    : 0;

  const enactedLawsCount = dataset.laws.filter((l) => l.status === 'Enacted').length;
  const avgCompliance = dataset.laws.length
    ? Math.round(dataset.laws.reduce((a, l) => a + l.complianceRatePct, 0) / dataset.laws.length)
    : 0;

  const avgGovernanceScore = dataset.institutions.length
    ? Math.round(
        dataset.institutions.reduce((a, i) => a + i.accountabilityScore, 0) /
          dataset.institutions.length
      )
    : 0;

  const criticalRisksCount = dataset.risks.filter((r) => r.likelihood * r.impact >= 15).length;

  const avgInfraUtil = dataset.infrastructure.length
    ? Math.round(
        dataset.infrastructure.reduce((a, i) => a + i.utilizationPct, 0) /
          dataset.infrastructure.length
      )
    : 0;

  const totalTrained = dataset.humanCapital.reduce((a, h) => a + h.enrolledOrTrained, 0);
  const totalFundingM = (
    dataset.researchItems.reduce((a, r) => a + r.fundingAmountUSD, 0) / 1_000_000
  ).toFixed(1);

  const totalBeneficiariesK = dataset.publicProjects.reduce((a, p) => a + p.beneficiariesK, 0);

  const avgMilestoneProgress = dataset.milestones.length
    ? Math.round(
        dataset.milestones.reduce((a, m) => a + m.progressPct, 0) / dataset.milestones.length
      )
    : 0;

  const activeAlerts = dataset.watchSignals.filter(
    (w) => w.status === 'Active Alert' || w.status === 'Escalated to Risk'
  );

  const benchSelf = BENCHMARK_COUNTRIES.find((b) => b.countryCode === countryCode);

  const readinessEvidenceId =
    dataset.evidence.find((e) => e.documentRef === 'ICT-NAIP-2026-REV3')?.id ||
    dataset.readinessDimensions[0]?.evidenceId ||
    'ev-bd-01';

  const trendSeries = useMemo(() => {
    const months = [
      'Dec 2025',
      'Jan 2026',
      'Feb 2026',
      'Mar 2026',
      'Apr 2026',
      'May 2026',
      'Jun 2026',
      'Jul 2026',
      'Aug 2026',
      'Sep 2026',
      'Oct 2026',
      'Nov 2026',
    ];
    const offsets = [-9.8, -9.1, -8.4, -7.6, -6.9, -5.8, -4.9, -4.1, -3.2, -2.1, -1.0, 0];
    return months.map((m, idx) => ({
      month: m,
      score: Number(Math.max(10, computedReadinessScore + offsets[idx]).toFixed(1)),
    }));
  }, [computedReadinessScore]);

  const indexModules: Array<{
    key: string;
    label: string;
    meta: string;
    value: string;
    visual: 'spark' | 'bar';
    sparkValues?: number[];
    barPct?: number;
    tone?: 'green' | 'amber' | 'red';
    moduleId: ModuleId;
    subTab?: string;
  }> = [
    {
      key: 'readiness',
      label: isBn ? 'প্রস্তুতি মূল্যায়ন কেন্দ্র' : 'AI Readiness Assessment Centre',
      meta: isBn
        ? `${formatNumberForLocale(dataset.readinessDimensions.length, language)} সূচক · ${formatNumberForLocale(dataset.readinessQuestions.length, language)} নিরীক্ষা`
        : `${dataset.readinessDimensions.length} indicators · ${dataset.readinessQuestions.length} audits`,
      value: `${formatNumberForLocale(computedReadinessScore, language)} / ${formatNumberForLocale(100, language)}`,
      visual: 'bar',
      barPct: computedReadinessScore,
      moduleId: 'm02',
    },
    {
      key: 'policy',
      label: isBn ? 'এআই নীতি বুদ্ধিমত্তা কেন্দ্র' : 'AI Policy Intelligence Centre',
      meta: isBn
        ? `${formatNumberForLocale(dataset.policies.length, language)} নীতিমালা · ${formatNumberForLocale(dataset.policies.reduce((a, p) => a + p.gapCount, 0), language)} ঘাটতি`
        : `${dataset.policies.length} policies · ${dataset.policies.reduce((a, p) => a + p.gapCount, 0)} gaps`,
      value: `${formatNumberForLocale(avgPolicyProgress, language)}%`,
      visual: 'bar',
      barPct: avgPolicyProgress,
      moduleId: 'm03',
    },
    {
      key: 'regulatory',
      label: isBn ? 'আইনি ও নিয়ন্ত্রক বুদ্ধিমত্তা' : 'Legal & Regulatory Intelligence',
      meta: isBn
        ? `${formatNumberForLocale(enactedLawsCount, language)}/${formatNumberForLocale(dataset.laws.length, language)} আইন প্রণীত`
        : `${enactedLawsCount}/${dataset.laws.length} instruments enacted`,
      value: `${formatNumberForLocale(avgCompliance, language)}%`,
      visual: 'bar',
      barPct: avgCompliance,
      moduleId: 'm04',
    },
    {
      key: 'risk',
      label: isBn ? 'এআই ঝুঁকি পর্যবেক্ষণ কেন্দ্র' : 'AI Risk Observatory',
      meta: isBn
        ? `${formatNumberForLocale(criticalRisksCount, language)} গুরুতর ঝুঁকি`
        : `${criticalRisksCount} critical exposure`,
      value: isBn
        ? `${formatNumberForLocale(dataset.risks.length, language)}টি`
        : `${dataset.risks.length} risks`,
      visual: 'spark',
      sparkValues: [2, 3, 4, 4, 5, dataset.risks.length],
      tone: criticalRisksCount > 0 ? 'red' : 'green',
      moduleId: 'm06',
    },
    {
      key: 'infrastructure',
      label: isBn ? 'এআই অবকাঠামো কেন্দ্র' : 'AI Infrastructure Centre',
      meta: isBn
        ? `${formatNumberForLocale(dataset.infrastructure.length, language)} সার্বভৌম কম্পিউট`
        : `${dataset.infrastructure.length} sovereign compute assets`,
      value: `${formatNumberForLocale(avgInfraUtil, language)}%`,
      visual: 'bar',
      barPct: avgInfraUtil,
      moduleId: 'm10',
    },
    {
      key: 'talent',
      label: isBn ? 'এআই মানবসম্পদ কেন্দ্র' : 'AI Human Capital Centre',
      meta: isBn
        ? `${formatNumberForLocale(dataset.humanCapital.length, language)} জাতীয় দক্ষতা কর্মসূচি`
        : `${dataset.humanCapital.length} national talent pipelines`,
      value: formatNumberForLocale(totalTrained.toLocaleString(), language),
      visual: 'spark',
      sparkValues: [18, 24, 31, 39, 46, 53],
      tone: 'green',
      moduleId: 'm11',
    },
    {
      key: 'research',
      label: isBn ? 'এআই গবেষণা ও উদ্ভাবন কেন্দ্র' : 'AI Research & Innovation Centre',
      meta: isBn
        ? `${formatNumberForLocale(dataset.researchItems.length, language)} গবেষণাগার ও অনুদান`
        : `${dataset.researchItems.length} labs & grant cohorts`,
      value: `$${formatNumberForLocale(totalFundingM, language)}M`,
      visual: 'spark',
      sparkValues: [3.2, 4.5, 5.8, 7.1, 8.4, Number(totalFundingM) || 9.5],
      tone: 'green',
      moduleId: 'm12',
    },
    {
      key: 'alerts',
      label: isBn ? 'এআই ওয়াচ ও সতর্কবার্তা কেন্দ্র' : 'AI Watch & Early Warning',
      meta: isBn
        ? `${formatNumberForLocale(dataset.safetyIncidents.length, language)} নিরাপত্তা লগ`
        : `${dataset.safetyIncidents.length} safety & cyber logs`,
      value: isBn
        ? `${formatNumberForLocale(activeAlerts.length, language)}টি`
        : `${activeAlerts.length} active`,
      visual: 'spark',
      sparkValues: [1, 2, 3, 4, 4, activeAlerts.length],
      tone: activeAlerts.some((a) => a.severity === 'Critical') ? 'red' : 'amber',
      moduleId: 'm01',
      subTab: 'early_warning',
    },
  ];

  const atAGlanceItems: Array<{
    key: string;
    title: string;
    caption: string;
    value: string;
    status: string;
    tone: 'nominal' | 'warning' | 'info';
    moduleId: ModuleId;
    evidenceId: string;
  }> = [
    {
      key: 'governance',
      title: UI_TEXT.commandBlocks.governance[language],
      caption: isBn
        ? `${formatNumberForLocale(dataset.institutions.length, language)}টি দায়িত্বপ্রাপ্ত সংস্থা`
        : `${dataset.institutions.length} mandated institutions`,
      value: `${formatNumberForLocale(avgGovernanceScore, language)}%`,
      status: avgGovernanceScore >= 75 ? (isBn ? 'সঠিক পথে' : 'On track') : isBn ? 'সক্রিয় তদারকি' : 'Active oversight',
      tone: avgGovernanceScore >= 75 ? 'nominal' : 'info',
      moduleId: 'm05',
      evidenceId: dataset.institutions[0]?.evidenceId || 'ev-bd-01',
    },
    {
      key: 'publicSector',
      title: UI_TEXT.commandBlocks.publicSector[language],
      caption: isBn
        ? `${formatNumberForLocale((totalBeneficiariesK / 1000).toFixed(1), language)}M নাগরিক সেবা`
        : `${(totalBeneficiariesK / 1000).toFixed(1)}M citizens served`,
      value: isBn
        ? `${formatNumberForLocale(dataset.publicProjects.length, language)} সিস্টেম`
        : `${dataset.publicProjects.length} systems`,
      status: isBn ? 'চালু আছে' : 'Operational',
      tone: 'nominal',
      moduleId: 'm14',
      evidenceId: dataset.publicProjects[0]?.evidenceId || 'ev-bd-05',
    },
    {
      key: 'programme',
      title: UI_TEXT.commandBlocks.programme[language],
      caption: isBn
        ? `${formatNumberForLocale(dataset.milestones.length, language)}টি কর্মপরিকল্পনা ধাপ`
        : `${dataset.milestones.length} action plan milestones`,
      value: `${formatNumberForLocale(avgMilestoneProgress, language)}%`,
      status: dataset.milestones.some((m) => m.status === 'Delayed')
        ? isBn
          ? 'ঝুঁকিপূর্ণ'
          : 'At risk'
        : isBn
        ? 'সঠিক পথে'
        : 'On track',
      tone: dataset.milestones.some((m) => m.status === 'Delayed') ? 'warning' : 'nominal',
      moduleId: 'm18',
      evidenceId: dataset.milestones[0]?.evidenceId || 'ev-bd-01',
    },
    {
      key: 'globalPosition',
      title: UI_TEXT.commandBlocks.globalPosition[language],
      caption: benchSelf
        ? isBn
          ? `বৈশ্বিক সূচক ${formatNumberForLocale(benchSelf.overallScore, language)}/১০০`
          : `Benchmark index ${benchSelf.overallScore}/100`
        : 'Global AI Index',
      value: isBn
        ? `ক্রম #${formatNumberForLocale(dataset.country.globalRank, language)}`
        : `Rank #${dataset.country.globalRank}`,
      status: dataset.country.globalRank <= 25 ? (isBn ? 'শীর্ষ স্তর' : 'Top tier') : isBn ? 'অগ্রসরমান' : 'Advancing',
      tone: dataset.country.globalRank <= 25 ? 'nominal' : 'info',
      moduleId: 'm16',
      evidenceId: dataset.evidence[0]?.id || 'ev-bd-01',
    },
  ];

  const readinessBandLabel =
    computedReadinessScore >= 80
      ? isBn
        ? 'শীর্ষস্থানীয়'
        : 'Leading'
      : computedReadinessScore >= 60
      ? isBn
        ? 'অগ্রসর'
        : 'Advancing'
      : computedReadinessScore >= 30
      ? isBn
        ? 'বিকাশমান'
        : 'Developing'
      : isBn
      ? 'উদীয়মান'
      : 'Emerging';

  return (
    <div>
      <div className="print-only pb-4 mb-6 border-b border-[#E6E6E0]">
        <div className="font-serif-editorial text-[24px] font-semibold text-[#14181B]">
          Bangladesh AI Governance OS — Atlas AI Institute
        </div>
        <div className="text-[13px] text-[#667085] mt-1">
          {dataset.country.nameEn} ({dataset.country.code}) · Report generated 14 Nov 2026 · Ref: ICT-NAIP-2026-REV3
        </div>
      </div>

      <ModuleHeader
        module={mod}
        subtitleOverride={UI_TEXT.osSubtitle[language]}
        metaLine={
          <p className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
            {isBn ? (
              <>
                তথ্য হালনাগাদ {formatEditorialDate('2026-11-14', language)} ·{' '}
                {formatNumberForLocale(dataset.readinessQuestions.length, language)}টি নিরীক্ষা ·{' '}
                <button
                  type="button"
                  onClick={() => openInfoSheet('methodology')}
                  className="text-[#0B5D45] dark:text-[#6EE7B7] font-medium hover:underline cursor-pointer"
                >
                  মূল্যায়ন পদ্ধতি
                </button>
              </>
            ) : (
              <>
                Data as of {formatEditorialDate('2026-11-14', language)} · {dataset.readinessQuestions.length}{' '}
                audits ·{' '}
                <button
                  type="button"
                  onClick={() => openInfoSheet('methodology')}
                  className="text-[#0B5D45] dark:text-[#6EE7B7] font-medium hover:underline cursor-pointer"
                >
                  Methodology
                </button>
              </>
            )}
          </p>
        }
      />

      <ModuleSubNav module={mod} />

      {syncError && (
        <div className="mb-6">
          <ErrorBanner
            message={syncError}
            onRetry={retryWorkspaceSync}
            retryLabel={isBn ? 'আবার চেষ্টা করুন' : 'Retry'}
          />
        </div>
      )}

      {isSwitchingCountry ? (
        <div className="space-y-6">
          <SkeletonRows rows={3} />
          <SkeletonRows rows={6} />
        </div>
      ) : activeSubTab === 'overview' ? (
        <div className="space-y-8 print-one-col">
          {/* 1. Readiness Hero + 2x2 At a Glance */}
          <section
            className="space-y-6"
            aria-label={UI_TEXT.commandBlocks.readiness[language]}
          >
            <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[15px] leading-[22px] font-medium text-[var(--text-primary)] whitespace-nowrap">
                  {UI_TEXT.commandBlocks.readiness[language]}
                </div>
                <StatusLabel
                  status={readinessBandLabel}
                  tone={computedReadinessScore >= 60 ? 'nominal' : 'warning'}
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[52px] sm:text-[64px] leading-none font-semibold tabular-nums text-[var(--text-primary)]">
                      {formatNumberForLocale(animatedScore.toFixed(1), language)}
                    </span>
                    <span className="font-mono text-[20px] sm:text-[24px] leading-none text-[var(--text-secondary)] tabular-nums">
                      / {formatNumberForLocale(100, language)}
                    </span>
                  </div>
                  <div className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-2">
                    {isBn
                      ? `${formatNumberForLocale(dataset.readinessDimensions.length, language)} সূচক · ${formatNumberForLocale(dataset.readinessQuestions.length, language)} নিরীক্ষা`
                      : `${dataset.readinessDimensions.length} indicators · ${dataset.readinessQuestions.length} audits`}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {!trendAsTable && (
                    <div>
                      <ReadinessTrendChart series={trendSeries} language={language} />
                    </div>
                  )}
                  <div className="sm:text-right no-print">
                    <button
                      type="button"
                      onClick={() => setTrendAsTable((v) => !v)}
                      aria-pressed={trendAsTable}
                      className="inline-flex items-center gap-1 min-h-[44px] text-[13px] leading-[18px] font-medium text-[#0B5D45] dark:text-[#6EE7B7] hover:underline cursor-pointer"
                    >
                      <span>
                        {trendAsTable
                          ? isBn
                            ? 'চার্ট দেখুন'
                            : 'View chart'
                          : isBn
                          ? 'টেবিল হিসেবে দেখুন'
                          : 'View as table'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {trendAsTable && (
                <div className="overflow-x-auto border border-[var(--border-default)] rounded-[12px]">
                  <table className="w-full text-left border-collapse text-[13px] leading-[18px]">
                    <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                      <tr>
                        <th className="py-2 px-3 font-medium">{isBn ? 'মাস' : 'Month'}</th>
                        <th className="py-2 px-3 font-medium text-right">{isBn ? 'প্রস্তুতি স্কোর' : 'Readiness score'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-default)]">
                      {trendSeries.map((pt) => (
                        <tr key={pt.month}>
                          <td className="py-1.5 px-3 text-[var(--text-primary)]">{pt.month}</td>
                          <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                            {formatNumberForLocale(pt.score.toFixed(1), language)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <ReadinessScaleBar score={computedReadinessScore} language={language} />

              <div className="pt-3 border-t border-[var(--border-default)] flex flex-wrap items-center justify-between gap-3">
                <EvidenceLink evidenceId={readinessEvidenceId} />
                <button
                  type="button"
                  onClick={() => navigateTo('m02')}
                  className="min-h-[44px] inline-flex items-center gap-1 text-[14px] font-medium text-[#0B5D45] dark:text-[#6EE7B7] hover:underline cursor-pointer"
                >
                  <span>{isBn ? 'মূল্যায়ন পৃষ্ঠা খুলুন' : 'Open assessment page'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {atAGlanceItems.map((item) => (
                <div
                  key={item.key}
                  className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4 flex flex-col justify-between gap-3 min-w-0"
                >
                  <div className="space-y-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => navigateTo(item.moduleId)}
                      className="text-left text-[13px] leading-[18px] font-medium text-[var(--text-secondary)] hover:text-[#0B5D45] dark:hover:text-[#6EE7B7] cursor-pointer"
                    >
                      {item.title}
                    </button>
                    <div className="font-mono text-[22px] leading-[28px] font-semibold tabular-nums text-[var(--text-primary)]">
                      {item.value}
                    </div>
                    <div className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
                      {item.caption}
                    </div>
                    <div className="pt-1">
                      <StatusLabel status={item.status} tone={item.tone} />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-default)] min-w-0">
                    <EvidenceLink evidenceId={item.evidenceId} className="min-h-[44px]" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Key Module Pages Launcher */}
          <section aria-labelledby="heading-modules">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
              <div>
                <h2
                  id="heading-modules"
                  className="font-serif-editorial text-[22px] leading-[28px] font-semibold text-[var(--text-primary)]"
                >
                  {isBn ? 'মূল মডিউল পৃষ্ঠাসমূহ' : 'Core module pages'}
                </h2>
                <p className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-1">
                  {isBn
                    ? 'আলাদা পৃষ্ঠায় খুলতে যেকোনো মডিউলে ট্যাপ করুন'
                    : 'Select any module to open its dedicated single page'}
                </p>
              </div>
              <div className="flex items-center gap-3 no-print">
                <button
                  type="button"
                  onClick={() => setModulesAsTable((v) => !v)}
                  aria-pressed={modulesAsTable}
                  className="min-h-[44px] px-2.5 inline-flex items-center gap-1.5 text-[13px] text-[var(--text-secondary)] hover:text-[#0B5D45] dark:hover:text-[#6EE7B7] cursor-pointer"
                >
                  <Table2 className="w-4 h-4" />
                  <span>{modulesAsTable ? (isBn ? 'তালিকা দেখুন' : 'View list') : isBn ? 'টেবিল দেখুন' : 'View as table'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('command', 'interconnections')}
                  className="min-h-[44px] inline-flex items-center gap-1 text-[13px] font-medium text-[#0B5D45] dark:text-[#6EE7B7] hover:underline cursor-pointer"
                >
                  <span>{isBn ? 'সকল ২০টি মডিউল' : 'All 20 modules'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {modulesAsTable ? (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px] leading-[18px]">
                  <thead className="bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                    <tr>
                      <th className="py-3 px-4 font-medium">{isBn ? 'মডিউল' : 'Module'}</th>
                      <th className="py-3 px-4 font-medium">{isBn ? 'তথ্য' : 'Summary'}</th>
                      <th className="py-3 px-4 font-medium text-right">{isBn ? 'মান' : 'Metric'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-default)]">
                    {indexModules.map((item) => (
                      <tr key={item.key} className="hover:bg-[var(--bg-subtle)]">
                        <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                          <button
                            type="button"
                            onClick={() => navigateTo(item.moduleId, item.subTab)}
                            className="hover:text-[#0B5D45] hover:underline cursor-pointer text-left"
                          >
                            {item.label}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-[var(--text-secondary)]">{item.meta}</td>
                        <td className="py-3 px-4 text-right font-mono tabular-nums text-[var(--text-primary)]">
                          {item.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] divide-y divide-[var(--border-default)] overflow-hidden">
                {indexModules.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigateTo(item.moduleId, item.subTab)}
                    className="w-full min-h-[64px] px-4 sm:px-5 py-3 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-subtle)] transition-colors duration-150 cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <div className="text-[17px] leading-[24px] font-medium text-[var(--text-primary)] group-hover:text-[#0B5D45] dark:group-hover:text-[#6EE7B7] transition-colors">
                        {item.label}
                      </div>
                      <div className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-0.5">
                        {item.meta}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.visual === 'spark' && item.sparkValues ? (
                        <div className="hidden sm:block">
                          <Sparkline
                            values={item.sparkValues}
                            tone={item.tone || 'green'}
                            width={64}
                            height={22}
                            ariaLabel={`${item.label} trend`}
                          />
                        </div>
                      ) : (
                        <div className="hidden sm:block w-[64px] h-[4px] bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#0B5D45] rounded-full"
                            style={{ width: `${Math.min(100, Math.max(0, item.barPct ?? 0))}%` }}
                          />
                        </div>
                      )}
                      <span className="font-mono text-[14px] leading-[20px] font-medium tabular-nums text-[var(--text-primary)]">
                        {item.value}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#0B5D45] dark:group-hover:text-[#6EE7B7]" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {PILLAR_GROUPS.map((group) => {
            const pillarModules = MODULES_REGISTRY.filter((m) => m.pillar === group.key);
            return (
              <SectionCard
                key={group.key}
                title={isBn ? group.titleBn : group.titleEn}
                subtitle={
                  isBn
                    ? `${formatNumberForLocale(pillarModules.length, language)}টি পৃথক মডিউল পৃষ্ঠা`
                    : `${pillarModules.length} individual module pages`
                }
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pillarModules.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => navigateTo(m.id)}
                      className="text-left p-4 border border-[var(--border-default)] rounded-[12px] hover:border-[#0B5D45] hover:bg-[#0B5D45]/5 transition-colors duration-150 cursor-pointer flex items-start justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[12px] leading-[16px] mb-1">
                          <span className="font-mono font-medium text-[#0B5D45] dark:text-[#6EE7B7]">
                            {isBn ? `মডিউল ${formatNumberForLocale(m.number, language)}` : `Module ${m.number}`}
                          </span>
                          <span aria-hidden="true" className="text-[var(--text-secondary)]">·</span>
                          <span className="font-mono text-[var(--text-secondary)]">
                            {formatNumberForLocale(m.subTabs.length, language)} {isBn ? 'টি ট্যাব' : 'views'}
                          </span>
                        </div>
                        <div className="font-serif-editorial text-[17px] leading-[24px] font-semibold text-[var(--text-primary)] group-hover:text-[#0B5D45] dark:group-hover:text-[#6EE7B7] transition-colors">
                          {isBn ? m.titleBn : m.titleEn}
                        </div>
                        <p className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-1 line-clamp-2">
                          {isBn ? m.descriptionBn : m.descriptionEn}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[#0B5D45] shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
