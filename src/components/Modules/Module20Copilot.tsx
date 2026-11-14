import React, { useState } from 'react';
import { Bot, Send } from 'lucide-react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  Button,
  FormField,
  INPUT_BASE_CLASS,
  ModuleHeader,
  ModuleSubNav,
  SectionCard,
  SkeletonRows,
  StatusLabel,
} from '../Common/Primitives';

export const Module20Copilot: React.FC = () => {
  const {
    dataset,
    countryCode,
    role,
    language,
    activeSubTab,
    computedReadinessScore,
    pillarAverages,
    isAdmin,
    navigateTo,
  } = useGovernance();

  const mod = MODULES_REGISTRY.find((m) => m.id === 'm20')!;

  const [prompt, setPrompt] = useState('');
  const [copilotOutput, setCopilotOutput] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [docTitle, setDocTitle] = useState('Draft Public Sector AI Procurement Clause v2');
  const [docText, setDocText] = useState(
    'All ministries procuring automated citizen eligibility or credit decision systems shall publish a bilingual Bangla/English algorithmic disclosure notice and undergo a pre-deployment Algorithmic Impact Assessment prior to production rollout.'
  );

  const buildSnapshot = () => ({
    country: dataset.country.nameEn,
    readinessScore: computedReadinessScore,
    pillarAverages,
    policies: dataset.policies.map((p) => ({ code: p.code, title: p.title, stage: p.stage, progressPct: p.progressPct, gaps: p.gapCount })),
    laws: dataset.laws.map((l) => ({ title: l.title, status: l.status, complianceRatePct: l.complianceRatePct, gapSeverity: l.gapSeverity })),
    risks: dataset.risks.map((r) => ({ code: r.code, title: r.title, score: r.likelihood * r.impact, status: r.status })),
    milestones: dataset.milestones.map((m) => ({ code: m.code, title: m.milestoneTitle, progressPct: m.progressPct, status: m.status })),
  });

  const runCopilotQuery = async (customPrompt?: string) => {
    const q = (customPrompt ?? prompt).trim();
    if (!q) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/copilot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-country-id': countryCode,
          'x-user-role': role,
        },
        body: JSON.stringify({
          prompt: q,
          mode: activeSubTab,
          language,
          contextSnapshot: buildSnapshot(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Copilot request failed');
      setCopilotOutput(data.text);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to reach Gemini Copilot endpoint');
    } finally {
      setLoading(false);
    }
  };

  const runDocumentAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docText.trim()) {
      setErrorMsg('Document excerpt is required for compliance analysis.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/copilot/analyze-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-country-id': countryCode,
          'x-user-role': role,
        },
        body: JSON.stringify({
          documentTitle: docTitle,
          documentText: docText,
          language,
          contextSnapshot: buildSnapshot(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Document analysis failed');
      setCopilotOutput(data.analysis);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Document analysis error');
    } finally {
      setLoading(false);
    }
  };

  const runGenerateBrief = async (focusArea: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/copilot/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-country-id': countryCode,
          'x-user-role': role,
        },
        body: JSON.stringify({
          focusArea,
          language,
          contextSnapshot: buildSnapshot(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Briefing generation failed');
      setCopilotOutput(data.briefing);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Briefing error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      {activeSubTab === 'human_approval' || activeSubTab === 'workflow' ? (
        <div className="space-y-5">
          <SectionCard
            title={`Governance Approval Queue Status (${dataset.approvals.length})`}
            subtitle="All approval decisions, policy advancements, risk directives, and data updates are consolidated inside Admin CMS"
            action={
              isAdmin ? (
                <Button variant="primary" size="sm" onClick={() => navigateTo('admin', 'approvals')}>
                  <span>Manage Approvals in Admin</span>
                </Button>
              ) : undefined
            }
          >
            {!isAdmin && (
              <div className="mb-4 p-3.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-lg text-xs text-[var(--text-secondary)]">
                Read-only oversight view. Approval actions and workflow updates are consolidated in <strong>Admin</strong> for authenticated Admin users.
              </div>
            )}
            <div className="divide-y divide-[var(--border-default)]">
              {dataset.approvals.map((apr) => (
                <div key={apr.id} className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="font-mono font-bold text-[#0B5D45] dark:text-[#34D399]">
                        SOURCE: {apr.sourceModule.toUpperCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{apr.submittedBy}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{apr.submittedAt}</span>
                      <span aria-hidden="true">·</span>
                      <StatusLabel status={apr.priority} tone={apr.priority === 'Urgent' ? 'critical' : 'neutral'} />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{apr.title}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{apr.rationale}</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(apr.sourceModule)}
                      className="text-xs font-semibold text-[#0B5D45] dark:text-[#34D399] hover:underline cursor-pointer"
                    >
                      Inspect linked module record
                    </button>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusLabel status={apr.status} />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Automated Cross-Module Governance Workflows">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {[
                { trigger: 'Infrastructure Load > 85% (Module 10)', action: 'Auto-raises Critical Early Warning Signal (Module 01) & Compute Risk (Module 06)' },
                { trigger: 'Critical Watch Signal Escalated (Module 01)', action: 'Creates Risk Register entry (Module 06) & queues Commissioner Directive (Module 20)' },
                { trigger: 'Policy Draft Submitted (Module 03)', action: 'Routes to Human Approval System (Module 20) & updates Action Plan KPI (Module 18)' },
              ].map((wf) => (
                <div key={wf.trigger} className="p-4 border border-[var(--border-default)] rounded-xl space-y-2 bg-[var(--bg-zebra)]">
                  <div className="font-bold text-[var(--text-primary)]">{wf.trigger}</div>
                  <p className="text-[var(--text-secondary)]">{wf.action}</p>
                  <StatusLabel status="Active Rule" tone="nominal" />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      ) : activeSubTab === 'document_analysis' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionCard
            className="lg:col-span-5"
            title="Automated Policy & Regulatory Document Analysis"
            subtitle="Evaluates policy text against national statutes, Responsible AI principles, and impact gaps via Gemini"
          >
            <form onSubmit={runDocumentAnalysis} className="space-y-3.5">
              <FormField label="Document Title">
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className={INPUT_BASE_CLASS}
                  placeholder="Document title..."
                />
              </FormField>
              <FormField label="Policy / Bill Excerpt" required>
                <textarea
                  rows={7}
                  value={docText}
                  onChange={(e) => setDocText(e.target.value)}
                  className={INPUT_BASE_CLASS}
                  placeholder="Paste draft policy clause, procurement rule, or bill text..."
                />
              </FormField>
              <Button type="submit" variant="primary" disabled={loading} className="w-full">
                {loading ? 'Analyzing Document...' : 'Run Regulatory & Ethical Compliance Audit'}
              </Button>
            </form>
          </SectionCard>

          <SectionCard className="lg:col-span-7" title="Document Audit Output">
            {errorMsg && (
              <div className="p-3 mb-3 bg-[#FEE2E2] border border-[#B45309]/30 rounded-lg text-xs font-medium text-[#991B1B]">
                {errorMsg}
              </div>
            )}
            {loading ? (
              <SkeletonRows rows={6} />
            ) : copilotOutput ? (
              <pre className="whitespace-pre-wrap font-sans text-xs text-[var(--text-primary)] leading-relaxed">
                {copilotOutput}
              </pre>
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">
                Submit a policy or regulatory excerpt on the left to run an AI-assisted compliance gap audit.
              </p>
            )}
          </SectionCard>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionCard
            className="lg:col-span-5"
            title={mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn || 'National AI Policy Copilot'}
            subtitle={`Grounded in live ${dataset.country.nameEn} (${countryCode}) governance telemetry · Role: ${role}`}
          >
            <div className="space-y-3.5 text-xs">
              <div className="space-y-2">
                <div className="font-semibold text-[var(--text-primary)]">Quick Executive Prompts</div>
                {[
                  `What are the top 3 immediate policy and regulatory priorities for ${dataset.country.nameEn} based on current readiness (${computedReadinessScore}/100)?`,
                  `Synthesize mitigation actions for our highest-scoring AI risks and deepfake threats.`,
                  `Draft an executive briefing summarizing infrastructure bottlenecks and human capital progress.`,
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setPrompt(q);
                      runCopilotQuery(q);
                    }}
                    className="w-full text-left p-2.5 border border-[var(--border-default)] hover:border-[#0B5D45] hover:bg-[#0B5D45]/5 rounded-lg text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-[var(--border-default)] space-y-2.5">
                <FormField label={language === 'bn' ? 'প্রশ্ন বা নির্দেশনা লিখুন' : 'Policy / Research Prompt'}>
                  <textarea
                    rows={4}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      language === 'bn'
                        ? 'জাতীয় এআই নীতি, ঝুঁকি বা গবেষণা নিয়ে প্রশ্ন লিখুন...'
                        : 'Ask the National AI Policy Copilot or Research Assistant...'
                    }
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={loading || !prompt.trim()}
                    onClick={() => runCopilotQuery()}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Generating...' : 'Run Copilot'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={loading}
                    onClick={() => runGenerateBrief('Cabinet Executive Governance Status')}
                  >
                    Generate Executive Brief
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            className="lg:col-span-7"
            title="Copilot Intelligence Output"
            action={
              <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#0B5D45] dark:text-[#34D399]">
                <Bot className="w-4 h-4" />
                <span>gemini-4-hydrogen</span>
              </span>
            }
          >
            {errorMsg && (
              <div className="p-3 mb-3 bg-[#FEE2E2] border border-[#B45309]/30 rounded-lg text-xs font-medium text-[#991B1B]">
                {errorMsg}
              </div>
            )}
            {loading ? (
              <SkeletonRows rows={6} />
            ) : copilotOutput ? (
              <pre className="whitespace-pre-wrap font-sans text-xs text-[var(--text-primary)] leading-relaxed">
                {copilotOutput}
              </pre>
            ) : (
              <div className="py-10 text-center text-xs text-[var(--text-secondary)]">
                Select a prompt or enter a custom policy, risk, or research query. All outputs are country-isolated to{' '}
                <strong>{dataset.country.nameEn} ({countryCode})</strong> and respect human-in-the-loop governance.
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};
