import React, { useState } from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { RiskHeatmap5x5 } from '../Charts/GovernanceCharts';
import {
  Button,
  EvidenceLink,
  INPUT_BASE_CLASS,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveSheet,
  ResponsiveTable,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';
import { RiskItem } from '../../types/os';

export const Module06RiskObservatory: React.FC = () => {
  const { dataset, activeSubTab, isAdmin, navigateTo } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm06')!;

  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);

  const filteredRisks = dataset.risks.filter((r) => {
    if (activeSubTab === 'emerging') return r.status === 'Open' || r.likelihood * r.impact >= 15;
    if (classFilter !== 'ALL') return r.classification === classFilter;
    return true;
  });

  const classifications: RiskItem['classification'][] = [
    'Algorithmic Bias',
    'Cyber & Model Security',
    'Privacy & Data',
    'Disinformation & Deepfake',
    'Labour & Socioeconomic',
    'Critical Infrastructure',
  ];

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          isAdmin ? (
            <Button variant="secondary" onClick={() => navigateTo('admin', 'cms')}>
              <span>Manage Risks in Admin</span>
            </Button>
          ) : undefined
        }
      />

      <ModuleSubNav module={mod} />

      {activeSubTab === 'scoring' ? (
        <SectionCard
          title="5×5 Likelihood × Impact Risk Scoring Matrix"
          subtitle="Exposure score = Likelihood (1–5) × Impact (1–5). Scores ≥15 represent Critical/High national exposure."
        >
          <RiskHeatmap5x5
            risks={dataset.risks}
            selectedRiskId={selectedRisk?.id ?? null}
            onSelectRisk={(r) => setSelectedRisk(r)}
          />
        </SectionCard>
      ) : (
        <div className="space-y-6">
          {activeSubTab === 'register' && (
            <SectionCard
              title="5×5 Risk Exposure Matrix"
              subtitle="Select a numbered risk circle to inspect its mitigation plan"
            >
              <RiskHeatmap5x5
                risks={dataset.risks}
                selectedRiskId={selectedRisk?.id ?? null}
                onSelectRisk={(r) => setSelectedRisk(r)}
              />
            </SectionCard>
          )}

          <SectionCard
            title={mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn || 'AI Risk Register'}
            subtitle="Connected to Institutions (Module 05), Policies (Module 03), and Watch Signals (Module 01)"
            action={
              activeSubTab === 'classification' ? (
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className={INPUT_BASE_CLASS}
                >
                  <option value="ALL">All Classifications</option>
                  {classifications.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              ) : undefined
            }
          >
            <ResponsiveTable<RiskItem>
              data={filteredRisks}
              rowKey={(r) => r.id}
              columns={[
                { key: 'code', header: 'Code', render: (r) => <span className="font-mono font-bold text-[#B45309] whitespace-nowrap">{r.code}</span> },
                {
                  key: 'title',
                  header: 'Risk & Mitigation Control',
                  render: (r) => (
                    <div className="max-w-md">
                      <div className="font-bold text-[var(--text-primary)]">{r.title}</div>
                      <p className="text-[var(--text-secondary)] mt-0.5">{r.mitigationPlan}</p>
                    </div>
                  ),
                },
                { key: 'class', header: 'Classification', render: (r) => <span className="whitespace-nowrap">{r.classification}</span> },
                {
                  key: 'score',
                  header: 'Score (L×I)',
                  align: 'right',
                  render: (r) => (
                    <span className="font-mono tabular-nums font-bold text-[var(--text-primary)]">
                      {r.likelihood * r.impact} ({r.likelihood}×{r.impact})
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <StatusLabel status={r.status} />,
                },
                { key: 'evidence', header: 'Evidence', render: (r) => <EvidenceLink evidenceId={r.evidenceId} /> },
              ]}
            />
          </SectionCard>
        </div>
      )}

      <ResponsiveSheet
        open={Boolean(selectedRisk)}
        onClose={() => setSelectedRisk(null)}
        title={selectedRisk?.title || ''}
        subtitle={selectedRisk ? `${selectedRisk.classification} · ${selectedRisk.status}` : undefined}
      >
        {selectedRisk && (
          <div className="space-y-4 text-[15px] leading-[24px]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <span className="font-mono text-[13px] font-semibold">{selectedRisk.code}</span>
              <span className="font-mono text-[13px] font-semibold">
                Score: {selectedRisk.likelihood * selectedRisk.impact} / 25
              </span>
            </div>
            <p className="text-[var(--text-primary)]">{selectedRisk.mitigationPlan}</p>
            <div className="pt-2 border-t border-[var(--border-default)]">
              <EvidenceLink evidenceId={selectedRisk.evidenceId} />
            </div>
          </div>
        )}
      </ResponsiveSheet>
    </div>
  );
};
