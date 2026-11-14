import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  Button,
  EmptyState,
  EvidenceLink,
  ModuleHeader,
  ModuleSubNav,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';

export const Module01WatchCentre: React.FC = () => {
  const { dataset, activeSubTab, navigateTo, isAdmin } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm01')!;

  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const categorySignals = dataset.watchSignals.filter((s) => {
    const matchesSub = activeSubTab === 'national' ? true : s.category === activeSubTab;
    const matchesSev = severityFilter === 'ALL' || s.severity === severityFilter;
    return matchesSub && matchesSev;
  });

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Signals in Admin</span>
            </Button>
          ) : undefined
        }
      />

      <ModuleSubNav module={mod} />

      <SectionCard
        title={
          activeSubTab === 'national'
            ? `National AI Watch Stream (${categorySignals.length})`
            : `${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} (${categorySignals.length})`
        }
        subtitle="Signals link directly to Evidence, Policy Intelligence (Module 03), and AI Risk Observatory (Module 06)"
        action={
          <div className="flex flex-wrap items-center gap-1 p-1 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg">
            {['ALL', 'Critical', 'High', 'Moderate', 'Informational'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  severityFilter === sev
                    ? 'bg-[#0B5D45] text-white'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        }
      >
        {categorySignals.length === 0 ? (
          <EmptyState
            title="No intelligence signals in this stream"
            description={`No records match "${severityFilter}" in ${dataset.country.nameEn}. Switch severity filters to inspect other intelligence streams.`}
          />
        ) : (
          <div className="divide-y divide-[var(--border-default)]">
            {categorySignals.map((sig) => (
              <div key={sig.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <span className="font-medium capitalize text-[#0B5D45] dark:text-[#34D399]">
                      {sig.category.replace('_', ' ')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{sig.source}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{sig.publishedAt}</span>
                    <span aria-hidden="true">·</span>
                    <StatusLabel status={sig.severity} />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{sig.title}</h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{sig.summary}</p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <EvidenceLink evidenceId={sig.evidenceId} />
                    {sig.linkedPolicyId && (
                      <button
                        type="button"
                        onClick={() => navigateTo('m03', 'development')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-primary)] hover:text-[#0B5D45] hover:underline cursor-pointer"
                      >
                        <span>Linked Policy</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                    {sig.linkedRiskId && (
                      <button
                        type="button"
                        onClick={() => navigateTo('m06', 'register')}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#B45309] hover:underline cursor-pointer"
                      >
                        <span>Linked Risk</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  <StatusLabel status={sig.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};
