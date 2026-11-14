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
import { ActionMilestone } from '../../types/os';

export const Module18Implementation: React.FC = () => {
  const { dataset, activeSubTab, isAdmin, navigateTo } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm18')!;

  const avgProgress = dataset.milestones.length
    ? Math.round(dataset.milestones.reduce((a, m) => a + m.progressPct, 0) / dataset.milestones.length)
    : 0;

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Milestones in Admin</span>
            </Button>
          ) : undefined
        }
      />
      <ModuleSubNav module={mod} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Overall Action Plan Execution</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#0B5D45] dark:text-[#34D399] mt-1">
            {avgProgress}%
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">Completed / On Track</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[var(--text-primary)] mt-1">
            {dataset.milestones.filter((m) => m.status === 'On Track' || m.status === 'Completed').length} / {dataset.milestones.length}
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[14px] p-4">
          <div className="text-xs font-semibold text-[var(--text-secondary)]">At Risk / Delayed</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#B45309] mt-1">
            {dataset.milestones.filter((m) => m.status === 'At Risk' || m.status === 'Delayed').length}
          </div>
        </div>
      </div>

      <SectionCard
        title={mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn || 'National AI Action Plan PMO'}
        subtitle="Track programmes, ministry accountability, milestones, and statutory KPIs"
      >
        <ResponsiveTable<ActionMilestone>
          data={dataset.milestones}
          rowKey={(m) => m.id}
          columns={[
            { key: 'code', header: 'Code', render: (m) => <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">{m.code}</span> },
            {
              key: 'milestone',
              header: 'Programme & Milestone',
              render: (m) => (
                <div>
                  <div className="font-bold text-[var(--text-primary)]">{m.milestoneTitle}</div>
                  <div className="text-[var(--text-secondary)]">{m.programme}</div>
                </div>
              ),
            },
            {
              key: 'inst',
              header: 'Lead Institution',
              render: (m) => {
                const inst = dataset.institutions.find((i) => i.id === m.ownerInstitutionId);
                return <span>{inst?.shortCode || 'Lead Agency'}</span>;
              },
            },
            { key: 'due', header: 'Due', render: (m) => <span className="font-mono text-[var(--text-secondary)]">{m.dueQuarter}</span> },
            { key: 'kpi', header: 'KPI Target', render: (m) => <span>{m.kpiTarget}</span> },
            {
              key: 'progress',
              header: 'Progress',
              align: 'right',
              render: (m) => <span className="font-mono tabular-nums font-bold">{m.progressPct}%</span>,
            },
            { key: 'status', header: 'Status', render: (m) => <StatusLabel status={m.status} /> },
            { key: 'ev', header: 'Evidence', render: (m) => <EvidenceLink evidenceId={m.evidenceId} /> },
          ]}
        />
      </SectionCard>
    </div>
  );
};
