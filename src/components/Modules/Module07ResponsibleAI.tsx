import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { HorizontalMetricBars } from '../Charts/GovernanceCharts';
import { EvidenceLink, ModuleHeader, ModuleSubNav, SectionCard, StatusLabel } from '../Common/Primitives';

export const Module07ResponsibleAI: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm07')!;

  const principleMap: Record<string, string | null> = {
    fairness: 'Fairness',
    transparency: 'Transparency',
    explainability: 'Explainability',
    accountability: 'Accountability',
    oversight: 'Human Oversight',
    guidelines: null,
  };

  const selectedPrinciple = principleMap[activeSubTab] || null;
  const visibleMetrics = selectedPrinciple
    ? dataset.responsibleMetrics.filter((m) => m.principle === selectedPrinciple)
    : dataset.responsibleMetrics;

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SectionCard
          className="lg:col-span-5"
          title="Responsible AI Compliance Scores"
          subtitle="Audit coverage across fairness, transparency, explainability, accountability & human oversight"
        >
          <HorizontalMetricBars
            items={dataset.responsibleMetrics.map((m) => ({
              label: m.principle,
              value: m.complianceScore,
              target: 80,
              meta: `${m.auditedSystems} systems`,
            }))}
          />
        </SectionCard>

        <SectionCard
          className="lg:col-span-7"
          title={selectedPrinciple ? `${selectedPrinciple} Operational Standard` : 'Responsible AI Guidelines & Controls'}
          subtitle="Operational controls enforced across public-sector and regulated private AI deployments"
        >
          <div className="divide-y divide-[var(--border-default)]">
            {visibleMetrics.map((m) => (
              <div key={m.id} className="py-3.5 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">{m.principle}</span>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{m.guidelineTitle}</h3>
                  </div>
                  <div className="text-right">
                    <div className="font-mono tabular-nums text-sm font-bold text-[var(--text-primary)] mb-1">
                      {m.complianceScore}%
                    </div>
                    <StatusLabel status={m.complianceScore >= 75 ? 'On Track' : 'Developing'} />
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Mandatory Control: </span>
                  {m.keyControl}
                </p>
                <div className="flex items-center justify-between pt-1 text-xs text-[var(--text-secondary)]">
                  <span className="font-mono">{m.auditedSystems} audited systems</span>
                  <EvidenceLink evidenceId={m.evidenceId} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
