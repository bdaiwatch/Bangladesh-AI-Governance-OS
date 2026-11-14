import React, { useState } from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  Button,
  EvidenceLink,
  INPUT_BASE_CLASS,
  ModuleHeader,
  ModuleSubNav,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';
import { PolicyItem } from '../../types/os';

export const Module03PolicyCentre: React.FC = () => {
  const { dataset, activeSubTab, isAdmin, navigateTo } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm03')!;

  const [compareLeft, setCompareLeft] = useState(dataset.policies[0]?.id || '');
  const [compareRight, setCompareRight] = useState(dataset.policies[1]?.id || dataset.policies[0]?.id || '');

  const leftPol = dataset.policies.find((p) => p.id === compareLeft) || dataset.policies[0];
  const rightPol = dataset.policies.find((p) => p.id === compareRight) || dataset.policies[1] || dataset.policies[0];

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Policies in Admin</span>
            </Button>
          ) : undefined
        }
      />

      <ModuleSubNav module={mod} />

      {activeSubTab === 'comparison' && leftPol && rightPol ? (
        <SectionCard title="Side-by-Side Policy Comparison" subtitle="Compare lifecycle progress, institutional ownership, gaps, and recommendations">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              value={leftPol.id}
              onChange={(e) => setCompareLeft(e.target.value)}
              className={INPUT_BASE_CLASS}
            >
              {dataset.policies.map((p) => (
                <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
              ))}
            </select>
            <select
              value={rightPol.id}
              onChange={(e) => setCompareRight(e.target.value)}
              className={INPUT_BASE_CLASS}
            >
              {dataset.policies.map((p) => (
                <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[leftPol, rightPol].map((pol: PolicyItem, idx) => (
              <div key={`${pol.id}-${idx}`} className="p-4 border border-[var(--border-default)] rounded-xl space-y-3 text-xs bg-[var(--bg-zebra)]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[#0B5D45] dark:text-[#34D399] font-bold">{pol.code}</span>
                  <StatusLabel status={pol.stage} />
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{pol.title}</h3>
                <div className="flex justify-between border-t border-[var(--border-default)] pt-2">
                  <span className="text-[var(--text-secondary)]">Completion</span>
                  <span className="font-mono font-bold">{pol.progressPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-secondary)]">Identified Gaps</span>
                  <span className="font-mono font-bold text-[#B45309]">{pol.gapCount}</span>
                </div>
                <div>
                  <span className="text-[var(--text-secondary)] block mb-1">Gap Summary</span>
                  <p className="text-[var(--text-primary)]">{pol.gapSummary}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <SectionCard
          title={`National AI Policies (${dataset.policies.length})`}
          subtitle="Connected to Legal Intelligence (Module 04), Stakeholder Consultations (Module 17), and Admin Approvals"
        >
          <div className="divide-y divide-[var(--border-default)]">
            {dataset.policies.map((pol) => {
              const owner = dataset.institutions.find((i) => i.id === pol.ownerInstitutionId);
              return (
                <div key={pol.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">{pol.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{owner?.shortCode || 'Lead Ministry'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">Target {pol.targetDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{pol.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-xs font-bold text-[var(--text-primary)]">
                        {pol.progressPct}%
                      </span>
                      <StatusLabel status={pol.stage} />
                    </div>
                  </div>

                  <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B5D45] rounded-full" style={{ width: `${pol.progressPct}%` }} />
                  </div>

                  {(activeSubTab === 'gap_analysis' || activeSubTab === 'development' || activeSubTab === 'drafts') && (
                    <p className="text-xs text-[var(--text-secondary)]">
                      <span className="font-semibold text-[var(--text-primary)]">Gap Analysis ({pol.gapCount}): </span>
                      {pol.gapSummary}
                    </p>
                  )}

                  {(activeSubTab === 'recommendations' || activeSubTab === 'implementation') && (
                    <ul className="list-disc list-inside text-xs text-[var(--text-secondary)] space-y-1">
                      {pol.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-4">
                      <EvidenceLink evidenceId={pol.evidenceId} />
                      <button
                        type="button"
                        onClick={() => navigateTo('m17', 'consultation')}
                        className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[#0B5D45] hover:underline cursor-pointer"
                      >
                        Public Consultations
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
};
