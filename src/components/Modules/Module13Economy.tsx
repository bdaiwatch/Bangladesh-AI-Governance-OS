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
import { EconomyMarketItem } from '../../types/os';

export const Module13Economy: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm13')!;

  const totalInvestmentM = dataset.economyItems.reduce((a, e) => a + e.investmentUSD_M, 0);
  const totalJobs = dataset.economyItems.reduce((a, e) => a + e.jobsImpactedOrCreated, 0);
  const totalFirms = dataset.economyItems.reduce((a, e) => a + e.activeFirms, 0);

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Tracked AI Capital Investment</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#0B5D45] dark:text-[#34D399] mt-1">
            ${totalInvestmentM.toFixed(1)}M
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Active AI-Enabled Firms</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)] mt-1">
            {totalFirms.toLocaleString()}
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Jobs Created / Transformed</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)] mt-1">
            {totalJobs.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <SectionCard className="lg:col-span-5" title="Sector AI Adoption Rate (%)">
          <HorizontalMetricBars
            items={dataset.economyItems.map((e) => ({
              label: e.sector,
              value: e.aiAdoptionPct,
              meta: `+${e.projectedGdpImpactPct}% GDP`,
            }))}
          />
        </SectionCard>

        <SectionCard
          className="lg:col-span-7"
          title={mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn || 'AI Economy Breakdown'}
        >
          <ResponsiveTable<EconomyMarketItem>
            data={dataset.economyItems}
            rowKey={(e) => e.id}
            columns={[
              { key: 'sector', header: 'Sector', render: (e) => <span className="font-bold text-[var(--text-primary)]">{e.sector}</span> },
              { key: 'adopt', header: 'Adoption', align: 'right', render: (e) => <span className="font-mono tabular-nums">{e.aiAdoptionPct}%</span> },
              { key: 'firms', header: 'Firms', align: 'right', render: (e) => <span className="font-mono tabular-nums">{e.activeFirms}</span> },
              { key: 'inv', header: 'Investment', align: 'right', render: (e) => <span className="font-mono tabular-nums">${e.investmentUSD_M}M</span> },
              { key: 'jobs', header: 'Jobs', align: 'right', render: (e) => <span className="font-mono tabular-nums">{e.jobsImpactedOrCreated.toLocaleString()}</span> },
              { key: 'gdp', header: 'GDP Δ', align: 'right', render: (e) => <span className="font-mono tabular-nums font-bold text-[#0B5D45] dark:text-[#34D399]">+{e.projectedGdpImpactPct}%</span> },
              { key: 'ev', header: 'Evidence', render: (e) => <EvidenceLink evidenceId={e.evidenceId} /> },
            ]}
          />
        </SectionCard>
      </div>
    </div>
  );
};
