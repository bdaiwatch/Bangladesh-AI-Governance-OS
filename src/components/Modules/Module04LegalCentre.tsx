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
import { LawRegulationItem } from '../../types/os';

export const Module04LegalCentre: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm04')!;

  const filteredLaws =
    activeSubTab === 'gap_analysis'
      ? dataset.laws.filter((l) => l.gapSeverity !== 'Low' || l.status === 'Gap Identified')
      : dataset.laws;

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <SectionCard
        title={mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn || 'Legal & Regulatory Registry'}
        subtitle="Statutory alignment, EU AI Act / OECD comparative mapping, and compliance monitoring"
      >
        <ResponsiveTable<LawRegulationItem>
          data={filteredLaws}
          rowKey={(l) => l.id}
          columns={[
            {
              key: 'title',
              header: 'Instrument Title',
              render: (law) => (
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{law.title}</div>
                  <div className="text-[var(--text-secondary)]">{law.jurisdiction}</div>
                </div>
              ),
            },
            { key: 'type', header: 'Type', render: (law) => <span>{law.instrumentType}</span> },
            { key: 'status', header: 'Status', render: (law) => <StatusLabel status={law.status} /> },
            {
              key: 'compliance',
              header: 'Compliance',
              align: 'right',
              render: (law) => <span className="font-mono tabular-nums font-bold">{law.complianceRatePct}%</span>,
            },
            {
              key: 'gap',
              header: 'Gap Severity',
              render: (law) => (
                <StatusLabel
                  status={law.gapSeverity}
                  tone={law.gapSeverity === 'High' ? 'critical' : law.gapSeverity === 'Moderate' ? 'warning' : 'nominal'}
                />
              ),
            },
            { key: 'intl', header: 'International Comparable', render: (law) => <span className="text-[var(--text-secondary)]">{law.comparableInternationalLaw}</span> },
            { key: 'evidence', header: 'Evidence', render: (law) => <EvidenceLink evidenceId={law.evidenceId} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
};
