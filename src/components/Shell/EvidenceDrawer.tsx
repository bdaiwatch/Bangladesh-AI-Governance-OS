import React, { useEffect } from 'react';
import { ArrowUpRight, FileCheck2, X } from 'lucide-react';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { UI_TEXT } from '../../data/i18n';
import { useGovernance } from '../../store/GovernanceContext';
import { Button } from '../Common/Primitives';

export const EvidenceDrawer: React.FC = () => {
  const { selectedEvidence, closeEvidence, dataset, navigateTo, language } = useGovernance();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEvidence();
    };
    if (selectedEvidence) {
      window.addEventListener('keydown', onKey);
    }
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedEvidence, closeEvidence]);

  if (!selectedEvidence) return null;

  const inst = dataset.institutions.find((i) => i.id === selectedEvidence.sourceInstitutionId);
  const linkedMod = MODULES_REGISTRY.find((m) => m.id === selectedEvidence.linkedModule);

  return (
    <div className="fixed inset-0 z-50 flex justify-end no-print">
      <div className="fixed inset-0 bg-black/40" onClick={closeEvidence} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={UI_TEXT.inspectEvidence[language]}
        className="relative z-10 w-full max-w-md bg-[var(--bg-surface)] h-full border-l border-[var(--border-default)] flex flex-col"
      >
        <div className="px-5 h-16 border-b border-[var(--border-default)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
            <FileCheck2 className="w-4 h-4 text-[#0B5D45] dark:text-[#34D399]" />
            <span>{UI_TEXT.inspectEvidence[language]}</span>
          </div>
          <button
            type="button"
            onClick={closeEvidence}
            className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-[10px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            aria-label="Close evidence drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          <div>
            <div className="font-mono text-[13px] leading-[18px] font-medium text-[#0B5D45] dark:text-[#6EE7B7] mb-2">
              {selectedEvidence.documentRef} · {selectedEvidence.confidence}
            </div>
            <h3 className="font-serif-editorial text-xl font-semibold text-[var(--text-primary)] leading-snug">
              {selectedEvidence.title}
            </h3>
            <p className="text-[14px] leading-[22px] text-[var(--text-secondary)] mt-2">
              {selectedEvidence.summary}
            </p>
          </div>

          <div className="border-t border-[var(--border-default)] pt-4 space-y-3 text-[13px]">
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-secondary)]">Country scope</span>
              <span className="font-medium text-[var(--text-primary)]">
                {dataset.country.nameEn} ({selectedEvidence.countryCode})
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-secondary)]">Source institution</span>
              <span className="font-medium text-[var(--text-primary)] text-right">
                {inst ? inst.name : selectedEvidence.sourceName}
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-secondary)]">Verified date</span>
              <span className="font-mono text-[var(--text-primary)]">{selectedEvidence.verifiedDate}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-[var(--text-secondary)]">Primary module</span>
              <span className="font-medium text-[var(--text-primary)]">
                {linkedMod ? `${linkedMod.number}. ${linkedMod.shortEn}` : selectedEvidence.linkedModule}
              </span>
            </div>
          </div>

          {linkedMod && (
            <div className="border-t border-[var(--border-default)] pt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  navigateTo(linkedMod.id);
                  closeEvidence();
                }}
              >
                <span>
                  Open {linkedMod.number}. {linkedMod.shortEn}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
