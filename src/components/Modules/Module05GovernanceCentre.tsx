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
import { Institution } from '../../types/os';

export const Module05GovernanceCentre: React.FC = () => {
  const { dataset, activeSubTab } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm05')!;

  const tiers = ['Apex Council', 'Lead Ministry', 'Regulatory Body', 'Implementing Agency', 'Research Centre'] as const;

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      {activeSubTab === 'structure' || activeSubTab === 'framework' ? (
        <SectionCard
          title="Sovereign AI Governance Tiers"
          subtitle={`Multi-tier institutional architecture for ${dataset.country.nameEn} (${dataset.country.code})`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const insts = dataset.institutions.filter((i) => i.tier === tier);
              if (insts.length === 0) return null;
              return (
                <div key={tier} className="border border-[var(--border-default)] rounded-xl p-4 space-y-3 bg-[var(--bg-zebra)]">
                  <div className="text-xs font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">{tier}</div>
                  {insts.map((inst) => (
                    <div key={inst.id} className="pt-2.5 border-t border-[var(--border-default)] first:border-t-0 first:pt-0">
                      <div className="text-sm font-bold text-[var(--text-primary)]">{inst.name}</div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{inst.mandate}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-mono font-semibold text-[var(--text-primary)]">
                          Accountability {inst.accountabilityScore}%
                        </span>
                        <EvidenceLink evidenceId={inst.evidenceId} />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title="Institutional Responsibilities, Coordination & Accountability Matrix"
          subtitle="Shared institutional registry referenced across Policy, Risk, Data, and Action Plan modules"
        >
          <ResponsiveTable<Institution>
            data={dataset.institutions}
            rowKey={(i) => i.id}
            columns={[
              {
                key: 'name',
                header: 'Institution',
                render: (inst) => (
                  <div>
                    <div className="font-bold text-[var(--text-primary)]">{inst.name}</div>
                    <div className="text-[var(--text-secondary)] max-w-md">{inst.mandate}</div>
                  </div>
                ),
              },
              { key: 'tier', header: 'Tier', render: (inst) => <StatusLabel status={inst.tier} tone="neutral" /> },
              { key: 'focal', header: 'Focal Officer', render: (inst) => <span>{inst.focalOfficer}</span> },
              { key: 'coord', header: 'Coordinating With', render: (inst) => <span className="font-mono text-[var(--text-secondary)]">{inst.coordinatingWith.join(', ')}</span> },
              { key: 'score', header: 'Accountability', align: 'right', render: (inst) => <span className="font-mono tabular-nums font-bold">{inst.accountabilityScore}%</span> },
              { key: 'evidence', header: 'Evidence', render: (inst) => <EvidenceLink evidenceId={inst.evidenceId} /> },
            ]}
          />
        </SectionCard>
      )}
    </div>
  );
};
