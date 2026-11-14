import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { HorizontalMetricBars } from '../Charts/GovernanceCharts';
import {
  Button,
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';
import { ReadinessDimension } from '../../types/os';

export const Module02ReadinessCentre: React.FC = () => {
  const {
    dataset,
    language,
    activeSubTab,
    computedReadinessScore,
    pillarAverages,
    isAdmin,
    navigateTo,
  } = useGovernance();

  const mod = MODULES_REGISTRY.find((m) => m.id === 'm02')!;

  const pillarFilterMap: Record<string, string | null> = {
    national_assessment: null,
    institutional: 'Institutional',
    infrastructure: 'Infrastructure',
    human_capital: 'Human Capital',
    responsible_ai: 'Responsible AI',
  };

  const activePillar = pillarFilterMap[activeSubTab] || null;
  const filteredDimensions = activePillar
    ? dataset.readinessDimensions.filter((d) => d.pillar === activePillar)
    : dataset.readinessDimensions;

  const filteredQuestions = activePillar
    ? dataset.readinessQuestions.filter((q) => q.pillar === activePillar)
    : dataset.readinessQuestions;

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Indicators in Admin</span>
            </Button>
          ) : undefined
        }
      />
      <ModuleSubNav module={mod} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-[var(--bg-surface)] border border-[#0B5D45]/40 rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Composite Readiness</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#0B5D45] dark:text-[#34D399] mt-1">
            {computedReadinessScore} <span className="text-xs font-normal text-[var(--text-muted)]">/ 100</span>
          </div>
        </div>
        {(['Institutional', 'Infrastructure', 'Human Capital', 'Responsible AI'] as const).map((p) => (
          <div key={p} className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
            <div className="text-xs font-semibold text-[var(--text-secondary)]">{p}</div>
            <div className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)] mt-1">
              {pillarAverages[p].toFixed(1)}
            </div>
          </div>
        ))}
      </div>

      {activeSubTab === 'questionnaires' ? (
        <SectionCard
          title="National AI Readiness Audit Questionnaire"
          subtitle="Read-only maturity audit levels (L1–L5). Indicator updates are consolidated inside Admin CMS."
        >
          <div className="divide-y divide-[var(--border-default)]">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="max-w-2xl">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">
                    <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{q.pillar}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{q.evidenceNote}</span>
                  </div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{q.question}</p>
                  <div className="mt-1.5">
                    <EvidenceLink evidenceId={q.evidenceId} />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" aria-label={`Maturity Level L${q.maturityLevel}`}>
                  {([1, 2, 3, 4, 5] as const).map((lvl) => (
                    <span
                      key={lvl}
                      className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg border ${
                        q.maturityLevel === lvl
                          ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] opacity-60'
                      }`}
                    >
                      L{lvl}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : activeSubTab === 'maturity_scoring' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Maturity Scale Definitions (Levels 1–5)">
            <div className="space-y-3 text-xs">
              {[
                { lvl: 'Level 1 · Initial', range: '0–29', desc: 'Ad-hoc AI initiatives without formal policy, data standards, or oversight.' },
                { lvl: 'Level 2 · Emerging', range: '30–49', desc: 'Draft policies and pilot projects active; foundational compute & skills gaps remain.' },
                { lvl: 'Level 3 · Defined', range: '50–69', desc: 'National AI Strategy, inter-ministerial coordination, and pilot testing operational.' },
                { lvl: 'Level 4 · Managed', range: '70–84', desc: 'Enacted statutory safeguards, sovereign compute pools, and mandatory impact audits.' },
                { lvl: 'Level 5 · Optimizing', range: '85–100', desc: 'Continuous regulatory sandboxes, full public algorithm registry, and global leadership.' },
              ].map((m) => (
                <div key={m.lvl} className="p-3.5 border border-[var(--border-default)] rounded-lg flex items-start justify-between gap-4 bg-[var(--bg-zebra)]">
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{m.lvl}</div>
                    <p className="text-[var(--text-secondary)] mt-0.5">{m.desc}</p>
                  </div>
                  <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399] shrink-0">{m.range}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Current Pillar Maturity Trajectory">
            <HorizontalMetricBars
              items={filteredDimensions.map((d) => ({
                label: d.name,
                value: d.score,
                target: d.target,
                meta: `Target ${d.target}`,
              }))}
            />
          </SectionCard>
        </div>
      ) : (
        <div className="space-y-6">
          {activeSubTab === 'national_assessment' && (
            <SectionCard
              title={language === 'bn' ? 'প্রস্তুতির স্তম্ভসমূহ' : 'Readiness pillars'}
              subtitle={
                language === 'bn'
                  ? 'জাতীয় গড় ও লক্ষ্যমাত্রার বিপরীতে চারটি স্তম্ভের অবস্থান'
                  : 'Sorted against the national average and target across all four pillars'
              }
            >
              <HorizontalMetricBars
                items={(['Institutional', 'Infrastructure', 'Human Capital', 'Responsible AI'] as const)
                  .map((p) => ({
                    label: `${p} readiness`,
                    value: pillarAverages[p],
                    target: p === 'Institutional' || p === 'Responsible AI' ? 80 : 75,
                  }))
                  .sort((a, b) => b.value - a.value)}
                nationalAverage={computedReadinessScore}
                language={language}
              />
            </SectionCard>
          )}

          <SectionCard
            title={activePillar ? `${activePillar} Readiness Indicators` : 'National Readiness Indicators & Evidence Registry'}
            subtitle="Every indicator is tied to an accountable institution and primary verification evidence"
          >
            <ResponsiveTable<ReadinessDimension>
              data={filteredDimensions}
              rowKey={(d) => d.id}
              columns={[
                { key: 'code', header: 'Code', render: (d) => <span className="font-mono font-semibold text-[#0B5D45]">{d.indicatorCode}</span> },
                { key: 'pillar', header: 'Pillar', render: (d) => <span className="font-medium text-[var(--text-primary)]">{d.pillar}</span> },
                { key: 'name', header: 'Indicator', render: (d) => <span className="font-semibold text-[var(--text-primary)]">{d.name}</span> },
                { key: 'score', header: 'Score', align: 'right', render: (d) => <span className="font-mono tabular-nums font-bold">{d.score}</span> },
                { key: 'target', header: 'Target', align: 'right', render: (d) => <span className="font-mono tabular-nums text-[var(--text-secondary)]">{d.target}</span> },
                { key: 'delta', header: 'YoY Δ', align: 'right', render: (d) => <span className="font-mono tabular-nums font-semibold text-[#0B5D45] dark:text-[#34D399]">+{d.trendDelta}</span> },
                { key: 'assessed', header: 'Assessed', render: (d) => <span className="font-mono text-[var(--text-secondary)]">{d.lastAssessed}</span> },
                { key: 'evidence', header: 'Evidence', render: (d) => <EvidenceLink evidenceId={d.evidenceId} /> },
              ]}
            />

            {activeSubTab === 'evidence_based' && (
              <div className="mt-6 pt-5 border-t border-[var(--border-default)]">
                <h3 className="text-xs font-bold text-[var(--text-primary)] mb-3">Linked Verification Evidence ({dataset.evidence.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dataset.evidence.map((ev) => (
                    <div key={ev.id} className="p-3.5 border border-[var(--border-default)] rounded-lg text-xs bg-[var(--bg-zebra)]">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono font-semibold text-[#0B5D45] dark:text-[#34D399]">{ev.documentRef}</span>
                        <StatusLabel status={ev.confidence} />
                      </div>
                      <div className="font-bold text-[var(--text-primary)]">{ev.title}</div>
                      <p className="text-[var(--text-secondary)] mt-1">{ev.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};
