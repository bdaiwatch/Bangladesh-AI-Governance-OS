import React from 'react';
import { ArrowUpRight } from 'lucide-react';
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
import { PublicAIProject } from '../../types/os';

export const Module14PublicSectorAI: React.FC = () => {
  const { dataset, activeSubTab, isAdmin, navigateTo } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm14')!;

  const visible =
    activeSubTab === 'procurement'
      ? dataset.publicProjects.filter((p) => p.stage === 'Procurement' || !p.procurementCompliant)
      : dataset.publicProjects;

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Projects in Admin</span>
            </Button>
          ) : undefined
        }
      />
      <ModuleSubNav module={mod} />

      <SectionCard
        title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} (${visible.length})`}
        subtitle="Algorithmic transparency registry for public-sector AI, procurement compliance, and citizen impact"
      >
        <ResponsiveTable<PublicAIProject>
          data={visible}
          rowKey={(p) => p.id}
          columns={[
            { key: 'code', header: 'Registry ID', render: (p) => <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">{p.registryCode}</span> },
            {
              key: 'title',
              header: 'Government AI Project',
              render: (p) => (
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{p.title}</div>
                  <div className="text-[var(--text-secondary)]">{p.ministry}</div>
                </div>
              ),
            },
            { key: 'domain', header: 'Service Domain', render: (p) => <span>{p.serviceDomain}</span> },
            { key: 'stage', header: 'Stage', render: (p) => <StatusLabel status={p.stage} /> },
            {
              key: 'gate',
              header: 'Procurement Gate',
              render: (p) => (
                <StatusLabel
                  status={p.procurementCompliant ? 'Compliant' : 'Audit Pending'}
                  tone={p.procurementCompliant ? 'nominal' : 'warning'}
                />
              ),
            },
            {
              key: 'ben',
              header: 'Beneficiaries',
              align: 'right',
              render: (p) => <span className="font-mono tabular-nums">{(p.beneficiariesK * 1000).toLocaleString()}</span>,
            },
            {
              key: 'ev',
              header: 'Impact / Evidence',
              render: (p) => (
                <div className="flex flex-col gap-1">
                  <EvidenceLink evidenceId={p.evidenceId} />
                  {p.linkedImpactId && (
                    <button
                      type="button"
                      onClick={() => navigateTo('m08', 'general')}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--text-secondary)] hover:text-[#0B5D45] hover:underline cursor-pointer"
                    >
                      <span>Impact Assessment</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
};
