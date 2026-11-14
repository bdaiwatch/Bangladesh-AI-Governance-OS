import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
} from '../Common/Primitives';
import { ResearchInnovationItem } from '../../types/os';

export const Module12ResearchInnovation: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm12')!;

  const catMap: Record<string, ResearchInnovationItem['category']> = {
    database: 'Research Publication',
    institutions: 'Institution',
    projects: 'Innovation Project',
    funding: 'Funding Grant',
    startups: 'Startup',
  };

  const activeCat = catMap[activeSubTab];
  const ordered = [
    ...dataset.researchItems.filter((r) => r.category === activeCat),
    ...dataset.researchItems.filter((r) => r.category !== activeCat),
  ];

  const totalFunding = dataset.researchItems.reduce((a, r) => a + r.fundingAmountUSD, 0);

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <SectionCard
        title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} Repository`}
        subtitle={`Total tracked AI R&D & venture funding: $${(totalFunding / 1_000_000).toFixed(2)}M USD`}
      >
        <ResponsiveTable<ResearchInnovationItem>
          data={ordered}
          rowKey={(r) => r.id}
          highlightRow={(r) => r.category === activeCat}
          columns={[
            { key: 'title', header: 'Title / Entity', render: (r) => <span className="font-bold text-[var(--text-primary)]">{r.title}</span> },
            { key: 'cat', header: 'Type', render: (r) => <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{r.category}</span> },
            { key: 'org', header: 'Organization', render: (r) => <span>{r.organization}</span> },
            { key: 'focus', header: 'Focus Area', render: (r) => <span className="text-[var(--text-secondary)]">{r.focusArea}</span> },
            { key: 'fund', header: 'Funding (USD)', align: 'right', render: (r) => <span className="font-mono tabular-nums font-bold">${r.fundingAmountUSD.toLocaleString()}</span> },
            { key: 'trl', header: 'Stage / TRL', render: (r) => <span className="font-mono">{r.trlOrStage}</span> },
            { key: 'ev', header: 'Evidence', render: (r) => <EvidenceLink evidenceId={r.evidenceId} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
};
