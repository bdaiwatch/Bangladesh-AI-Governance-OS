import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';
import { DataGovernanceAsset } from '../../types/os';

export const Module09DataGovernance: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm09')!;

  const catMap: Record<string, DataGovernanceAsset['category']> = {
    data_policy: 'Data Policy',
    data_quality: 'Data Quality',
    data_protection: 'Data Protection',
    data_infra: 'Data Infrastructure',
    access_gov: 'Access Governance',
  };

  const selectedCat = catMap[activeSubTab];
  const prioritized = [
    ...dataset.dataAssets.filter((d) => d.category === selectedCat),
    ...dataset.dataAssets.filter((d) => d.category !== selectedCat),
  ];

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <SectionCard
        title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} Registry`}
        subtitle="Sovereign datasets, quality audits, privacy compliance, and tiered access governance"
      >
        <ResponsiveTable<DataGovernanceAsset>
          data={prioritized}
          rowKey={(d) => d.id}
          highlightRow={(d) => d.category === selectedCat}
          columns={[
            { key: 'name', header: 'Dataset / Governance Asset', render: (d) => <span className="font-bold text-[var(--text-primary)]">{d.name}</span> },
            { key: 'cat', header: 'Domain', render: (d) => <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{d.category}</span> },
            { key: 'quality', header: 'Quality Score', align: 'right', render: (d) => <span className="font-mono tabular-nums font-bold">{d.qualityScore}/100</span> },
            { key: 'prot', header: 'Protection Standard', render: (d) => <span className="text-[var(--text-secondary)]">{d.protectionStandard}</span> },
            { key: 'tier', header: 'Access Tier', render: (d) => <span className="font-mono">{d.accessTier}</span> },
            { key: 'comp', header: 'Compliance', render: (d) => <StatusLabel status={d.complianceStatus} /> },
            { key: 'ev', header: 'Evidence', render: (d) => <EvidenceLink evidenceId={d.evidenceId} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
};
