import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { HorizontalMetricBars } from '../Charts/GovernanceCharts';
import {
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
} from '../Common/Primitives';
import { HumanCapitalProgram } from '../../types/os';

export const Module11HumanCapital: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm11')!;

  const catMap: Record<string, HumanCapitalProgram['category']> = {
    skills: 'Skills Assessment',
    talent_db: 'Talent Database',
    education: 'AI Education',
    training: 'Training Programme',
    workforce: 'Workforce Development',
  };

  const selectedCat = catMap[activeSubTab];
  const ordered = [
    ...dataset.humanCapital.filter((h) => h.category === selectedCat),
    ...dataset.humanCapital.filter((h) => h.category !== selectedCat),
  ];

  const totalTrained = dataset.humanCapital.reduce((a, h) => a + h.enrolledOrTrained, 0);
  const totalTarget = dataset.humanCapital.reduce((a, h) => a + h.targetCohort, 0);

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SectionCard
          className="lg:col-span-5"
          title="National AI Talent Pipeline Completion"
          subtitle={`${totalTrained.toLocaleString()} trained / ${totalTarget.toLocaleString()} national target`}
        >
          <HorizontalMetricBars
            items={dataset.humanCapital.map((h) => ({
              label: h.title,
              value: h.completionPct,
              target: 85,
              meta: `${h.enrolledOrTrained.toLocaleString()} pax`,
            }))}
          />
        </SectionCard>

        <SectionCard
          className="lg:col-span-7"
          title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} Programmes`}
          subtitle="University degree pipelines, EDGE certifications, civil service AI literacy & industry reskilling"
        >
          <ResponsiveTable<HumanCapitalProgram>
            data={ordered}
            rowKey={(h) => h.id}
            highlightRow={(h) => h.category === selectedCat}
            columns={[
              {
                key: 'title',
                header: 'Programme',
                render: (h) => (
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{h.title}</div>
                    <div className="text-[var(--text-secondary)]">{h.leadInstitution}</div>
                  </div>
                ),
              },
              { key: 'cat', header: 'Category', render: (h) => <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{h.category}</span> },
              { key: 'tier', header: 'Skill Tier', render: (h) => <span>{h.skillTier}</span> },
              {
                key: 'trained',
                header: 'Trained / Target',
                align: 'right',
                render: (h) => (
                  <span className="font-mono tabular-nums">
                    {h.enrolledOrTrained.toLocaleString()} / {h.targetCohort.toLocaleString()}
                  </span>
                ),
              },
              { key: 'pct', header: 'Completion', align: 'right', render: (h) => <span className="font-mono tabular-nums font-bold">{h.completionPct}%</span> },
              { key: 'ev', header: 'Evidence', render: (h) => <EvidenceLink evidenceId={h.evidenceId} /> },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
};
