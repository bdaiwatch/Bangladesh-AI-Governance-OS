import React, { useState } from 'react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  Button,
  EvidenceLink,
  FormField,
  INPUT_BASE_CLASS,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveTable,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';
import { ConsultationSubmission, StakeholderEntity } from '../../types/os';

export const Module17Stakeholders: React.FC = () => {
  const { dataset, activeSubTab, submitConsultation } = useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm17')!;

  const [respondentName, setRespondentName] = useState('');
  const [sector, setSector] = useState<ConsultationSubmission['sector']>('Civil Society');
  const [policyId, setPolicyId] = useState(dataset.policies[0]?.id || '');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const sectorFilterMap: Record<string, StakeholderEntity['sector'] | null> = {
    government: 'Government',
    private: 'Private Sector',
    academia: 'Academia',
    civil_society: 'Civil Society',
    directory: null,
  };

  const activeSector = sectorFilterMap[activeSubTab] || null;
  const visibleStakeholders = activeSector
    ? dataset.stakeholders.filter((s) => s.sector === activeSector)
    : dataset.stakeholders;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondentName.trim() || !comment.trim()) {
      setFormError('Organization/Name and consultation feedback are required.');
      return;
    }
    setFormError(null);
    submitConsultation({
      policyId: policyId || dataset.policies[0]?.id || '',
      respondentName: respondentName.trim(),
      sector,
      comment: comment.trim(),
    });
    setRespondentName('');
    setComment('');
  };

  return (
    <div>
      <ModuleHeader module={mod} />
      <ModuleSubNav module={mod} />

      {activeSubTab === 'consultation' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <SectionCard
            className="lg:col-span-5"
            title="Submit Public Consultation Feedback"
            subtitle="Open participatory policy channel across Government, Private Sector, Academia, Civil Society & Citizens"
          >
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <FormField label="Target Policy">
                <select
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  className={INPUT_BASE_CLASS}
                >
                  {dataset.policies.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Organization / Name" required error={formError && !respondentName.trim() ? formError : undefined}>
                  <input
                    type="text"
                    value={respondentName}
                    onChange={(e) => setRespondentName(e.target.value)}
                    placeholder="Your organization or name"
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
                <FormField label="Stakeholder Group">
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as ConsultationSubmission['sector'])}
                    className={INPUT_BASE_CLASS}
                  >
                    <option value="Civil Society">Civil Society</option>
                    <option value="Academia">Academia</option>
                    <option value="Private Sector">Private Sector</option>
                    <option value="Government">Government</option>
                    <option value="Citizen">Citizen</option>
                  </select>
                </FormField>
              </div>

              <FormField label="Clause Feedback / Recommendation" required error={formError && !comment.trim() ? formError : undefined}>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide specific legal, ethical, or implementation feedback..."
                  className={INPUT_BASE_CLASS}
                />
              </FormField>

              <Button type="submit" variant="primary" className="w-full">
                Submit Consultation Response
              </Button>
            </form>
          </SectionCard>

          <SectionCard
            className="lg:col-span-7"
            title={`Recorded Public Consultation Submissions (${dataset.consultations.length})`}
          >
            <div className="divide-y divide-[var(--border-default)]">
              {dataset.consultations.map((c) => {
                const pol = dataset.policies.find((p) => p.id === c.policyId);
                return (
                  <div key={c.id} className="py-3.5 first:pt-0 last:pb-0 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[var(--text-primary)]">{c.respondentName}</span>
                      <div className="flex items-center gap-1.5">
                        {c.priority && (
                          <StatusLabel
                            status={c.priority}
                            tone={c.priority === 'Urgent' ? 'critical' : c.priority === 'High' ? 'warning' : 'info'}
                          />
                        )}
                        <StatusLabel status={c.disposition} />
                      </div>
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      <span>{c.sector}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono font-semibold text-[#0B5D45] dark:text-[#34D399]">{pol?.code || 'National Policy'}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono">{c.submittedAt}</span>
                    </div>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">{c.comment}</p>
                    {c.adminReply && (
                      <div className="p-3 rounded-[10px] bg-[#ECF4F1]/70 dark:bg-[#157F5E]/15 border border-[#0B5D45]/20 text-xs space-y-1">
                        <div className="font-semibold text-[#0B5D45] dark:text-[#6EE7B7]">
                          Official Response {c.repliedBy ? `· ${c.repliedBy}` : ''} {c.repliedAt ? `(${c.repliedAt})` : ''}
                        </div>
                        <p className="text-[var(--text-primary)] leading-relaxed">{c.adminReply}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      ) : (
        <SectionCard
          title={`${activeSector || 'National'} Stakeholder Directory (${visibleStakeholders.length})`}
          subtitle="Multi-stakeholder ecosystem across Government, Private Industry, Academia, and Civil Society"
        >
          <ResponsiveTable<StakeholderEntity>
            data={visibleStakeholders}
            rowKey={(s) => s.id}
            columns={[
              { key: 'name', header: 'Organization / Coalition', render: (s) => <span className="font-bold text-[var(--text-primary)]">{s.name}</span> },
              { key: 'sector', header: 'Sector', render: (s) => <span className="font-semibold text-[#0B5D45] dark:text-[#34D399]">{s.sector}</span> },
              { key: 'role', header: 'Mandate & Role', render: (s) => <span className="text-[var(--text-secondary)]">{s.roleInEcosystem}</span> },
              { key: 'contact', header: 'Focal Contact', render: (s) => <span className="font-mono text-[var(--text-secondary)]">{s.focalContact}</span> },
              { key: 'status', header: 'Status', render: (s) => <StatusLabel status={s.engagementStatus} tone="nominal" /> },
              { key: 'ev', header: 'Evidence', render: (s) => <EvidenceLink evidenceId={s.evidenceId} /> },
            ]}
          />
        </SectionCard>
      )}
    </div>
  );
};
