import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  Button,
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';
import { ImpactAssessmentItem } from '../../types/os';

export const Module08ImpactAssessment: React.FC = () => {
  const { dataset, activeSubTab, isAdmin, navigateTo } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm08')!;

  const domainMap: Record<string, ImpactAssessmentItem['domain'] | null> = {
    general: null,
    human_rights: 'Human Rights',
    social: 'Social',
    environmental: 'Environmental',
    ethical: 'Ethical',
  };

  const domainFilter = domainMap[activeSubTab];
  const visible = domainFilter
    ? dataset.impactAssessments.filter((i) => i.domain === domainFilter)
    : dataset.impactAssessments;

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Assessments in Admin</span>
            </Button>
          ) : undefined
        }
      />
      <ModuleSubNav module={mod} />

      <SectionCard
        title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} Registry (${visible.length})`}
        subtitle="Pre-deployment impact evaluations linked to Public Sector AI Projects (Module 14)"
      >
        <ResponsiveTable<ImpactAssessmentItem>
          data={visible}
          rowKey={(i) => i.id}
          columns={[
            {
              key: 'name',
              header: 'AI System',
              render: (item) => (
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{item.systemName}</div>
                  <div className="text-[var(--text-secondary)]">{item.ministryOrOwner}</div>
                </div>
              ),
            },
            { key: 'domain', header: 'Domain', render: (item) => <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{item.domain}</span> },
            { key: 'hr', header: 'Human Rights', align: 'right', render: (item) => <span className="font-mono tabular-nums">{item.humanRightsScore}</span> },
            { key: 'soc', header: 'Social', align: 'right', render: (item) => <span className="font-mono tabular-nums">{item.socialScore}</span> },
            { key: 'env', header: 'Environmental', align: 'right', render: (item) => <span className="font-mono tabular-nums">{item.environmentalScore}</span> },
            { key: 'eth', header: 'Ethical', align: 'right', render: (item) => <span className="font-mono tabular-nums">{item.ethicalScore}</span> },
            {
              key: 'tier',
              header: 'Risk Tier',
              render: (item) => (
                <StatusLabel
                  status={item.riskTier}
                  tone={item.riskTier === 'High' || item.riskTier === 'Unacceptable' ? 'critical' : item.riskTier === 'Limited' ? 'warning' : 'nominal'}
                />
              ),
            },
            { key: 'status', header: 'Status', render: (item) => <StatusLabel status={item.status} /> },
            { key: 'evidence', header: 'Evidence', render: (item) => <EvidenceLink evidenceId={item.evidenceId} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
};
