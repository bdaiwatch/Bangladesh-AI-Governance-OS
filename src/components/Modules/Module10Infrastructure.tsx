import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { HorizontalMetricBars } from '../Charts/GovernanceCharts';
import { EvidenceLink, ModuleHeader, ModuleSubNav, SectionCard, StatusLabel } from '../Common/Primitives';
import { InfrastructureAsset } from '../../types/os';

export const Module10Infrastructure: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm10')!;

  const catMap: Record<string, InfrastructureAsset['category'] | null> = {
    compute: 'Compute',
    cloud: 'Cloud',
    connectivity: 'Connectivity',
    data_centres: 'Data Centre',
    capacity: null,
  };

  const filterCat = catMap[activeSubTab];
  const visible = filterCat
    ? dataset.infrastructure.filter((i) => i.category === filterCat)
    : dataset.infrastructure;

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SectionCard
          className="lg:col-span-5"
          title="National AI Infrastructure Utilization"
          subtitle="High utilization (>85%) triggers automated Early Warning in Module 01"
        >
          <HorizontalMetricBars
            items={dataset.infrastructure.map((inf) => ({
              label: inf.name,
              value: inf.utilizationPct,
              target: 85,
              meta: `${inf.utilizationPct}%`,
            }))}
          />
        </SectionCard>

        <SectionCard
          className="lg:col-span-7"
          title={mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn || 'Infrastructure Assets'}
          subtitle="Sovereign compute clusters, Tier-III/IV data centres, GovCloud, and fiber connectivity"
        >
          <div className="divide-y divide-[var(--border-default)]">
            {visible.map((inf) => (
              <div key={inf.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">{inf.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{inf.location}</span>
                    <span aria-hidden="true">·</span>
                    <span>{inf.sovereignHosted ? 'Sovereign Hosted' : 'Hybrid'}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{inf.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{inf.capacitySpec}</p>
                  <div className="mt-1.5">
                    <EvidenceLink evidenceId={inf.evidenceId} />
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className={`text-lg font-bold font-mono tabular-nums mb-1 ${inf.utilizationPct > 85 ? 'text-[#B45309]' : 'text-[var(--text-primary)]'}`}>
                    {inf.utilizationPct}%
                  </div>
                  <StatusLabel status={inf.status} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
