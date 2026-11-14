import React from 'react';
import { useGovernance } from '../../store/GovernanceContext';

export const TopBar: React.FC = () => {
  const { navigateTo } = useGovernance();

  return (
    <header className="relative bg-[var(--bg-surface)] border-b border-[var(--border-default)] px-4 sm:px-5 py-2.5 flex items-center no-print">
      <button
        type="button"
        onClick={() => navigateTo('command')}
        className="flex items-center gap-2.5 text-left cursor-pointer group min-w-0"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="w-[24px] h-[24px] shrink-0"
        >
          <rect width="28" height="28" rx="8" fill="#0B5D45" />
          <circle cx="14" cy="14" r="5" stroke="#FAFAF7" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="1.75" fill="#FAFAF7" />
        </svg>
        <span className="flex flex-col min-w-0">
          <span className="font-serif-editorial text-[16px] leading-[20px] sm:text-[18px] sm:leading-[22px] font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-[#0B5D45] transition-colors">
            Bangladesh AI Governance OS
          </span>
          <span className="text-[12px] leading-[16px] text-[var(--text-secondary)]">
            An Atlas AI Institute initiative
          </span>
        </span>
      </button>
    </header>
  );
};
