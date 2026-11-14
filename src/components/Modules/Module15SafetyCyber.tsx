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
import { SafetyIncidentItem } from '../../types/os';

export const Module15SafetyCyber: React.FC = () => {
  const { dataset, activeSubTab, isAdmin, navigateTo } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm15')!;

  const typeMap: Record<string, SafetyIncidentItem['type'] | null> = {
    testing: 'Safety Benchmark',
    cybersecurity: 'Cyber Threat',
    model_security: 'Model Vulnerability',
    incident_reporting: 'Live Incident',
    safety_standards: 'Standard Compliance',
  };

  const selectedType = typeMap[activeSubTab];
  const ordered = selectedType
    ? [
        ...dataset.safetyIncidents.filter((s) => s.type === selectedType),
        ...dataset.safetyIncidents.filter((s) => s.type !== selectedType),
      ]
    : dataset.safetyIncidents;

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Incidents in Admin</span>
            </Button>
          ) : undefined
        }
      />
      <ModuleSubNav module={mod} />

      <SectionCard
        title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} Registry (${ordered.length})`}
        subtitle="AI red-teaming benchmarks, BGD e-GOV CIRT cyber monitoring, model security & safety standards"
      >
        <ResponsiveTable<SafetyIncidentItem>
          data={ordered}
          rowKey={(s) => s.id}
          highlightRow={(s) => s.type === selectedType}
          columns={[
            { key: 'code', header: 'Code', render: (s) => <span className="font-mono font-bold text-[#B45309]">{s.code}</span> },
            {
              key: 'title',
              header: 'Title & Affected System',
              render: (s) => (
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{s.title}</div>
                  <div className="text-[var(--text-secondary)]">{s.affectedSystem}</div>
                </div>
              ),
            },
            { key: 'type', header: 'Category', render: (s) => <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{s.type}</span> },
            { key: 'sev', header: 'Severity', render: (s) => <StatusLabel status={s.severity} /> },
            { key: 'date', header: 'Reported', render: (s) => <span className="font-mono text-[var(--text-secondary)]">{s.reportedDate}</span> },
            { key: 'res', header: 'Resolution', render: (s) => <StatusLabel status={s.resolutionStatus} /> },
            { key: 'ev', header: 'Evidence', render: (s) => <EvidenceLink evidenceId={s.evidenceId} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
};
