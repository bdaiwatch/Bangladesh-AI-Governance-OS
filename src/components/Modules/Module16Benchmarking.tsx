import React from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { BENCHMARK_COUNTRIES } from '../../data/seedData';
import { useGovernance } from '../../store/GovernanceContext';
import { BenchmarkComparisonChart } from '../Charts/GovernanceCharts';
import { ModuleHeader, ModuleSubNav, ResponsiveTable, SectionCard } from '../Common/Primitives';
import { BenchmarkEntry } from '../../types/os';

export const Module16Benchmarking: React.FC = () => {
  const { activeSubTab, countryCode, computedReadinessScore } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm16')!;

  const dynamicEntries = BENCHMARK_COUNTRIES.map((b) =>
    b.countryCode === countryCode ? { ...b, overallScore: computedReadinessScore } : b
  );

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      <div className="space-y-5">
        <SectionCard
          title="Multi-Pillar Country Comparison Matrix"
          subtitle="Benchmarking active country workspace against global and regional sovereign peers"
        >
          <BenchmarkComparisonChart entries={dynamicEntries} activeCountryCode={countryCode} />
        </SectionCard>

        <SectionCard
          title={
            activeSubTab === 'frameworks'
              ? 'Global AI Governance Frameworks Alignment'
              : 'International Rankings & Best Practices'
          }
        >
          {activeSubTab === 'frameworks' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                { name: 'UNESCO Recommendation on the Ethics of AI (RAM)', scope: 'Human Rights, Impact Assessment & Cultural Inclusion', adoption: 'National Readiness Assessment Methodology (Module 02 & 08)' },
                { name: 'OECD AI Principles & Policy Observatory', scope: 'Trustworthy AI, Accountability & Interoperability', adoption: 'Policy Comparison & Responsible AI Metrics (Module 03 & 07)' },
                { name: 'EU AI Act (Regulation 2024/1689)', scope: 'Risk-Tiered Statutory Prohibitions & Conformity Audits', adoption: 'Legal Gap Analysis & Risk Tiering (Module 04 & 08)' },
                { name: 'ISO/IEC 42001 AI Management System', scope: 'Enterprise & Public Sector AI Governance Controls', adoption: 'GovCloud & Public Procurement Gate (Module 14 & 15)' },
              ].map((fw) => (
                <div key={fw.name} className="p-4 border border-[var(--border-default)] rounded-xl space-y-1.5 bg-[var(--bg-zebra)]">
                  <div className="text-sm font-bold text-[var(--text-primary)]">{fw.name}</div>
                  <div className="text-[var(--text-secondary)]">{fw.scope}</div>
                  <div className="font-mono font-semibold text-[#0B5D45] dark:text-[#34D399] pt-1">
                    Mapped: {fw.adoption}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ResponsiveTable<BenchmarkEntry>
              data={dynamicEntries}
              rowKey={(b) => b.countryCode}
              highlightRow={(b) => b.countryCode === countryCode}
              columns={[
                { key: 'rank', header: 'Global Rank', render: (b) => <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">#{b.globalRank}</span> },
                { key: 'country', header: 'Country', render: (b) => <span className="font-bold text-[var(--text-primary)]">{b.countryName} ({b.countryCode})</span> },
                { key: 'overall', header: 'Overall', align: 'right', render: (b) => <span className="font-mono tabular-nums font-bold">{b.overallScore.toFixed(1)}</span> },
                { key: 'gov', header: 'Governance', align: 'right', render: (b) => <span className="font-mono tabular-nums">{b.governanceScore.toFixed(1)}</span> },
                { key: 'infra', header: 'Infrastructure', align: 'right', render: (b) => <span className="font-mono tabular-nums">{b.infrastructureScore.toFixed(1)}</span> },
                { key: 'best', header: 'Transferred Best Practice', render: (b) => <span className="text-[var(--text-secondary)]">{b.bestPracticeHighlight}</span> },
              ]}
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};
