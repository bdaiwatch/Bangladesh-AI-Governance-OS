import React, { useEffect } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Inbox,
  Info,
  Lock,
  RefreshCw,
  X,
} from 'lucide-react';
import { UI_TEXT } from '../../data/i18n';
import { useGovernance } from '../../store/GovernanceContext';
import { ModuleDefinition } from '../../types/os';
import { formatNumberForLocale } from '../../utils/formatters';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: 'sm' | 'md';
  }
> = ({ variant = 'primary', size = 'md', className = '', children, ...rest }) => {
  const sizeClass =
    size === 'sm' ? 'min-h-[44px] px-3.5 py-2 text-[13px]' : 'min-h-[44px] px-4 py-2.5 text-[14px]';

  const variantClass: Record<ButtonVariant, string> = {
    primary:
      'bg-[#0B5D45] hover:bg-[#084734] text-white border border-[#0B5D45] disabled:opacity-50',
    secondary:
      'bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[#0B5D45] dark:text-[#6EE7B7] border border-[#0B5D45] dark:border-[#6EE7B7] disabled:opacity-50',
    danger:
      'bg-[#B42318] hover:bg-[#912018] text-white border border-[#B42318] disabled:opacity-50',
    ghost:
      'bg-transparent hover:bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] disabled:opacity-50',
  };

  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-[12px] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer disabled:cursor-not-allowed ${sizeClass} ${variantClass[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const SectionCard: React.FC<{
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, children, className = '' }) => (
  <section
    className={`bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-5 sm:p-6 ${className}`}
  >
    {(title || action) && (
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="text-left min-w-0">
          {title && (
            <h2 className="font-serif-editorial text-[22px] leading-[28px] font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-1">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </section>
);

export const EvidenceLink: React.FC<{ evidenceId: string; label?: string; className?: string }> = ({
  evidenceId,
  label,
  className = '',
}) => {
  const { openEvidence, language, dataset } = useGovernance();
  const ev = dataset.evidence.find((e) => e.id === evidenceId);
  return (
    <button
      type="button"
      onClick={() => openEvidence(evidenceId)}
      title={ev ? ev.documentRef : undefined}
      className={`inline-flex items-center min-h-[44px] py-1 max-w-full text-[12px] leading-[16px] font-mono font-medium text-[#667085] dark:text-[#98A2B3] hover:text-[#0B5D45] dark:hover:text-[#6EE7B7] hover:underline cursor-pointer ${className}`}
    >
      <span className="truncate">{label || (ev ? ev.documentRef : UI_TEXT.inspectEvidence[language])}</span>
    </button>
  );
};

export const StatusLabel: React.FC<{
  status: string;
  tone?: 'nominal' | 'warning' | 'critical' | 'info' | 'neutral';
}> = ({ status, tone }) => {
  const { language } = useGovernance();

  const resolvedTone =
    tone ||
    (/enacted|approved|completed|compliant|verified|patched|controlled|operational|resolved|on track|incorporated|accepted|nominal|top tier|active rule|ready/i.test(
      status
    )
      ? 'nominal'
      : /critical|unacceptable|flagged/i.test(status)
      ? 'critical'
      : /moderate|monitoring|active oversight|advancing/i.test(status)
      ? 'info'
      : /review|draft|pending|pilot|expanding|conditional|mitigating|at risk|investigating|active|developing|scaling|audit|high|delayed|gap|remediation|escalated|returned/i.test(
          status
        )
      ? 'warning'
      : 'neutral');

  const styleMap = {
    nominal:
      'bg-[#ECF4F1] text-[#0B5D45] border-[#0B5D45]/20 dark:bg-[#157F5E]/20 dark:text-[#6EE7B7]',
    warning:
      'bg-[#FEF7E6] text-[#9A5B00] border-[#9A5B00]/25 dark:bg-[#9A5B00]/25 dark:text-[#FCD34D]',
    critical:
      'bg-[#FEF2F2] text-[#B42318] border-[#B42318]/25 dark:bg-[#B42318]/25 dark:text-[#FCA5A5]',
    info:
      'bg-[#EFF6FC] text-[#2E5E8C] border-[#2E5E8C]/25 dark:bg-[#2E5E8C]/25 dark:text-[#93C5FD]',
    neutral:
      'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-default)]',
  };

  const formatted =
    status.length > 0 ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : status;
  const displayLabel =
    status === 'On Track' || status === 'Pending Approval'
      ? formatted
      : formatNumberForLocale(status, language);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-[13px] leading-[18px] font-medium whitespace-nowrap ${styleMap[resolvedTone]}`}
    >
      {displayLabel}
    </span>
  );
};

export const ModuleHeader: React.FC<{
  module: ModuleDefinition;
  rightSlot?: React.ReactNode;
  metaLine?: React.ReactNode;
  readOnlyWarning?: boolean;
  subtitleOverride?: string;
}> = ({ module, rightSlot, metaLine, readOnlyWarning, subtitleOverride }) => {
  const { language, role, permissions, navigateTo } = useGovernance();
  const title = language === 'bn' ? module.titleBn : module.titleEn;
  const description = subtitleOverride || (language === 'bn' ? module.descriptionBn : module.descriptionEn);
  const isIndividualModule = module.id !== 'command';

  return (
    <div className="mb-6 text-left">
      {isIndividualModule && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 no-print">
          <button
            type="button"
            onClick={() => navigateTo('command', 'overview')}
            className="min-h-[44px] inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0B5D45] dark:text-[#6EE7B7] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'bn' ? 'কমান্ড ওভারভিউয়ে ফিরুন' : 'Back to Overview'}</span>
          </button>
          <span className="font-mono text-[12px] leading-[16px] text-[var(--text-secondary)]">
            {language === 'bn' ? `মডিউল ${formatNumberForLocale(module.number, language)}` : `Module ${module.number}`}
          </span>
        </div>
      )}

      <div className="space-y-4">
        <div className="max-w-2xl">
          <h1 className="font-serif-editorial text-[32px] leading-[38px] font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          <p className="text-[15px] leading-[24px] text-[var(--text-secondary)] mt-2">
            {description}
          </p>
          {metaLine && <div className="mt-2">{metaLine}</div>}
        </div>

        {rightSlot && <div className="no-print">{rightSlot}</div>}
      </div>

      {readOnlyWarning && (
        <div className="mt-4 flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[12px] text-[13px] leading-[18px] text-[var(--text-secondary)]">
          <Lock className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
          <span>{UI_TEXT.readOnlyNotice[language]}</span>
        </div>
      )}

      {role === 'public_observer' &&
        !permissions.canViewRestrictedSecurity &&
        (module.id === 'm06' || module.id === 'm15') && (
          <div className="mt-3 flex items-center gap-2 px-4 py-2.5 bg-[#FEF7E6] border border-[#9A5B00]/25 rounded-[12px] text-[13px] leading-[18px] text-[#9A5B00]">
            <Info className="w-4 h-4 text-[#9A5B00] shrink-0" />
            <span>{UI_TEXT.restrictedMaskedNotice[language]}</span>
          </div>
        )}
    </div>
  );
};

export const ModuleSubNav: React.FC<{ module: ModuleDefinition }> = ({ module }) => {
  const { activeSubTab, setActiveSubTab, language } = useGovernance();

  return (
    <div className="mb-8 border-b border-[var(--border-default)] overflow-x-auto no-print">
      <nav
        className="flex items-center gap-6 min-w-max"
        aria-label="Module sub-navigation"
        role="tablist"
      >
        {module.subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveSubTab(tab.id)}
              className={`min-h-[44px] py-2.5 text-[15px] font-medium border-b-2 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#0B5D45] text-[#0B5D45] dark:text-[#6EE7B7]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {language === 'bn' ? tab.labelBn : tab.labelEn}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export interface TableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
  mobileLabel?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  rowKey,
  highlightRow,
  emptyTitle = 'No records available',
  emptyDescription = 'Adjust filters or add a new entry to populate this registry.',
}: {
  data: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
  highlightRow?: (row: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="hidden md:block overflow-x-auto max-h-[540px] border border-[var(--border-default)] rounded-[12px]">
        <table className="w-full text-left border-collapse text-[13px] leading-[18px]">
          <thead className="sticky top-0 z-10 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 font-medium whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-default)]">
            {data.map((row) => {
              const isHighlighted = highlightRow?.(row);
              return (
                <tr
                  key={rowKey(row)}
                  className={`transition-colors duration-150 hover:bg-[#0B5D45]/5 ${
                    isHighlighted
                      ? 'bg-[#ECF4F1]/60 dark:bg-[#0B5D45]/15'
                      : 'odd:bg-[var(--bg-surface)] even:bg-[var(--bg-zebra)]'
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 align-top ${
                        col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {data.map((row) => {
          const isHighlighted = highlightRow?.(row);
          return (
            <div
              key={rowKey(row)}
              className={`p-4 rounded-[12px] border space-y-2 text-[13px] ${
                isHighlighted
                  ? 'border-[#0B5D45]/40 bg-[#ECF4F1]/40 dark:bg-[#0B5D45]/15'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)]'
              }`}
            >
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-start justify-between gap-3 border-b border-[var(--border-default)]/60 pb-2 last:border-b-0 last:pb-0"
                >
                  <span className="text-[13px] leading-[18px] font-medium text-[var(--text-secondary)] shrink-0">
                    {col.mobileLabel || col.header}
                  </span>
                  <div className="text-right min-w-0">{col.render(row)}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="py-10 px-4 text-center border border-dashed border-[var(--border-strong)] rounded-[12px] bg-[var(--bg-zebra)]">
    <Inbox className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-2" />
    <div className="text-[15px] font-medium text-[var(--text-primary)]">{title}</div>
    {description && (
      <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-md mx-auto">{description}</p>
    )}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>
);

export const ErrorBanner: React.FC<{
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}> = ({ message, onRetry, retryLabel = 'Retry' }) => (
  <div
    role="alert"
    className="p-4 border border-[#B42318]/30 bg-[#FEF2F2] dark:bg-[#B42318]/20 rounded-[12px] flex flex-wrap items-center justify-between gap-3"
  >
    <div className="flex items-start gap-2.5 min-w-0">
      <AlertCircle className="w-5 h-5 text-[#B42318] dark:text-[#FCA5A5] shrink-0 mt-0.5" />
      <p className="text-[14px] leading-[20px] text-[#B42318] dark:text-[#FCA5A5] font-medium">
        {message}
      </p>
    </div>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3.5 h-3.5" />
        <span>{retryLabel}</span>
      </Button>
    )}
  </div>
);

export const SkeletonRows: React.FC<{ rows?: number }> = ({ rows = 4 }) => (
  <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-11 bg-[var(--bg-subtle)] rounded-[12px] w-full" />
    ))}
  </div>
);

export const FormField: React.FC<{
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ label, error, required, children, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="block text-[13px] leading-[18px] font-medium text-[var(--text-primary)]">
      {label}
      {required && <span className="text-[#9A5B00] ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-[13px] leading-[18px] font-medium text-[#B42318] dark:text-[#FCA5A5]">{error}</p>}
  </div>
);

/**
 * Responsive detail sheet: bottom sheet on mobile (< 768px), right side panel on desktop (>= 768px).
 * Closes cleanly on Escape or backdrop tap.
 */
export const ResponsiveSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, subtitle, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end no-print">
      <div
        className="fixed inset-0 bg-black/40 transition-opacity duration-150"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full md:max-w-md bg-[var(--bg-surface)] border-t md:border-t-0 md:border-l border-[var(--border-default)] rounded-t-[12px] md:rounded-none max-h-[88vh] md:max-h-full md:h-full flex flex-col transition-transform duration-200"
      >
        <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h3 className="font-serif-editorial text-[20px] leading-[26px] font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[13px] leading-[18px] text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-2 -mt-1 flex items-center justify-center rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer shrink-0"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </aside>
    </div>
  );
};

export const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)] mb-4">
          <h3 className="font-serif-editorial text-[22px] leading-[28px] font-semibold text-[var(--text-primary)]">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const INPUT_BASE_CLASS =
  'w-full min-h-[44px] px-3 py-2 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[12px] text-[14px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[#0B5D45]/25 focus:border-[#0B5D45] transition-colors duration-150';

export const SectionChevronIcon = ChevronRight;
