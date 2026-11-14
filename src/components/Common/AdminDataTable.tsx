import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { Language } from '../../types/os';
import { formatNumberForLocale } from '../../utils/formatters';
import { Button, EmptyState, INPUT_BASE_CLASS } from './Primitives';

export interface AdminTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  render: (row: T) => React.ReactNode;
  mobileLabel?: string;
}

export interface AdminFilterOption {
  value: string;
  label: string;
}

export interface AdminBulkOperation {
  key: string;
  label: string;
  description?: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
  dividerBefore?: boolean;
  onExecute: (selectedIds: string[], clearSelection: () => void) => void;
}

export interface AdminBulkStatusUpdate {
  label: string;
  options: Array<{ value: string; label: string }>;
  applyLabel: string;
  onApply: (selectedIds: string[], nextStatus: string, clearSelection: () => void) => void;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: AdminTableColumn<T>[];
  rowKey: (row: T) => string;
  getSearchText: (row: T) => string;
  searchPlaceholder?: string;
  statusFilterOptions?: AdminFilterOption[];
  getStatusFilterValue?: (row: T) => string;
  statusFilterValue?: string;
  onStatusFilterChange?: (val: string) => void;
  bulkOperations?: AdminBulkOperation[];
  bulkStatusUpdate?: AdminBulkStatusUpdate;
  emptyTitle?: string;
  emptyDescription?: string;
  language?: Language;
  resetSelectionKey?: string;
}

export function AdminDataTable<T>({
  data,
  columns,
  rowKey,
  getSearchText,
  searchPlaceholder = 'Filter records in real time...',
  statusFilterOptions,
  getStatusFilterValue,
  statusFilterValue,
  onStatusFilterChange,
  bulkOperations = [],
  bulkStatusUpdate,
  emptyTitle = 'No matching records',
  emptyDescription = 'Adjust your search query or status filter.',
  language = 'en',
  resetSelectionKey,
}: AdminDataTableProps<T>) {
  const isBn = language === 'bn';
  const [searchQuery, setSearchQuery] = useState('');
  const [internalStatus, setInternalStatus] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [bulkStatusTarget, setBulkStatusTarget] = useState<string>(
    bulkStatusUpdate?.options[0]?.value || ''
  );

  const activeStatus = statusFilterValue !== undefined ? statusFilterValue : internalStatus;
  const setActiveStatus = onStatusFilterChange || setInternalStatus;

  const selectAllRef = useRef<HTMLInputElement>(null);
  const bulkMenuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIds([]);
    setSearchQuery('');
    setBulkMenuOpen(false);
    if (!onStatusFilterChange) {
      setInternalStatus('ALL');
    }
  }, [resetSelectionKey, onStatusFilterChange]);

  useEffect(() => {
    if (bulkStatusUpdate?.options.length) {
      setBulkStatusTarget(bulkStatusUpdate.options[0].value);
    } else {
      setBulkStatusTarget('');
    }
  }, [resetSelectionKey, bulkStatusUpdate?.options]);

  // Close Bulk Operations dropdown on outside click or Escape
  useEffect(() => {
    if (!bulkMenuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (
        bulkMenuContainerRef.current &&
        !bulkMenuContainerRef.current.contains(e.target as Node)
      ) {
        setBulkMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBulkMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [bulkMenuOpen]);

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return data.filter((row) => {
      if (activeStatus !== 'ALL' && getStatusFilterValue) {
        if (getStatusFilterValue(row) !== activeStatus) {
          return false;
        }
      }
      if (q) {
        return getSearchText(row).toLowerCase().includes(q);
      }
      return true;
    });
  }, [data, searchQuery, activeStatus, getStatusFilterValue, getSearchText]);

  const visibleIds = useMemo(() => filteredData.map((row) => rowKey(row)), [filteredData, rowKey]);

  useEffect(() => {
    const existing = new Set(data.map((row) => rowKey(row)));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => existing.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [data, rowKey]);

  useEffect(() => {
    if (selectedIds.length === 0 && bulkMenuOpen) {
      setBulkMenuOpen(false);
    }
  }, [selectedIds.length, bulkMenuOpen]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedVisibleCount = visibleIds.filter((id) => selectedSet.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const toggleAllVisible = () => {
    if (allVisibleSelected) {
      const visibleSet = new Set(visibleIds);
      setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
    setBulkMenuOpen(false);
  };

  const toneTextClass: Record<NonNullable<AdminBulkOperation['tone']>, string> = {
    default: 'text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
    positive: 'text-[#0B5D45] dark:text-[#6EE7B7] hover:bg-[#ECF4F1]/70 dark:hover:bg-[#157F5E]/20',
    warning: 'text-[#9A5B00] dark:text-[#FCD34D] hover:bg-[#FEF7E6] dark:hover:bg-[#9A5B00]/20',
    danger: 'text-[#B42318] dark:text-[#FCA5A5] hover:bg-[#FEF2F2] dark:hover:bg-[#B42318]/20',
  };

  return (
    <div className="space-y-4">
      {/* Real-time Search + Bulk Operations Menu + Status Filter Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className={`${INPUT_BASE_CLASS} pl-9 ${searchQuery ? 'pr-10' : ''}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label={isBn ? 'অনুসন্ধান মুছুন' : 'Clear search'}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-[8px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {bulkOperations.length > 0 && (
              <div ref={bulkMenuContainerRef} className="relative">
                <button
                  type="button"
                  onClick={() => setBulkMenuOpen((v) => !v)}
                  disabled={selectedIds.length === 0}
                  aria-haspopup="menu"
                  aria-expanded={bulkMenuOpen}
                  className={`min-h-[44px] px-3.5 py-2 inline-flex items-center gap-2 rounded-[10px] border text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedIds.length > 0
                      ? 'bg-[#0B5D45] text-white border-[#0B5D45] hover:bg-[#084734]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-strong)]'
                  }`}
                >
                  <span>{isBn ? 'বাল্ক অপারেশন' : 'Bulk Operations'}</span>
                  {selectedIds.length > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-white/20 text-[11px] font-mono tabular-nums">
                      {formatNumberForLocale(selectedIds.length, language)}
                    </span>
                  )}
                  <ChevronDown className="w-4 h-4 shrink-0" />
                </button>

                {bulkMenuOpen && selectedIds.length > 0 && (
                  <div
                    role="menu"
                    aria-label={isBn ? 'বাল্ক অপারেশন মেনু' : 'Bulk operations menu'}
                    className="absolute right-0 mt-1.5 w-72 z-30 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] py-1.5 divide-y divide-[var(--border-default)]"
                  >
                    <div className="px-3.5 py-2 flex items-center justify-between text-[12px] text-[var(--text-secondary)]">
                      <span>
                        {isBn
                          ? `${formatNumberForLocale(selectedIds.length, language)}টি নির্বাচিত রেকর্ডে প্রয়োগ`
                          : `Apply to ${selectedIds.length} selected record(s)`}
                      </span>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-[#0B5D45] dark:text-[#6EE7B7] font-medium hover:underline cursor-pointer"
                      >
                        {isBn ? 'বাতিল' : 'Clear'}
                      </button>
                    </div>

                    <div className="py-1">
                      {bulkOperations.map((op) => (
                        <React.Fragment key={op.key}>
                          {op.dividerBefore && (
                            <div className="my-1 border-t border-[var(--border-default)]" />
                          )}
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setBulkMenuOpen(false);
                              op.onExecute(selectedIds, clearSelection);
                            }}
                            className={`w-full min-h-[44px] px-3.5 py-2 text-left transition-colors cursor-pointer ${
                              toneTextClass[op.tone || 'default']
                            }`}
                          >
                            <div className="text-[13px] font-medium leading-[18px]">
                              {op.label}
                            </div>
                            {op.description && (
                              <div className="text-[11px] leading-[16px] text-[var(--text-secondary)] mt-0.5">
                                {op.description}
                              </div>
                            )}
                          </button>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-[13px] font-mono tabular-nums text-[var(--text-secondary)]">
              {isBn
                ? `${formatNumberForLocale(filteredData.length, language)} / ${formatNumberForLocale(data.length, language)} রেকর্ড`
                : `Showing ${filteredData.length} of ${data.length} records`}
            </div>
          </div>
        </div>

        {statusFilterOptions && statusFilterOptions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {statusFilterOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setActiveStatus(opt.value)}
                aria-pressed={activeStatus === opt.value}
                className={`min-h-[40px] px-3 rounded-[10px] border text-[13px] font-medium transition-colors cursor-pointer ${
                  activeStatus === opt.value
                    ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:text-[var(--text-primary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contextual Selection Strip for Custom Status Transition */}
      {selectedIds.length > 0 && (
        <div
          role="region"
          aria-label={isBn ? 'নির্বাচিত রেকর্ডসমূহ' : 'Selected records'}
          className="p-3.5 rounded-[12px] border border-[#0B5D45]/40 bg-[#ECF4F1]/70 dark:bg-[#157F5E]/20 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-semibold text-[#0B5D45] dark:text-[#6EE7B7] tabular-nums">
              {isBn
                ? `${formatNumberForLocale(selectedIds.length, language)}টি নির্বাচিত`
                : `${selectedIds.length} selected`}
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline cursor-pointer"
            >
              {isBn ? 'নির্বাচন বাতিল' : 'Clear selection'}
            </button>
          </div>

          {bulkStatusUpdate && bulkStatusUpdate.options.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label={bulkStatusUpdate.label}
                value={bulkStatusTarget}
                onChange={(e) => setBulkStatusTarget(e.target.value)}
                className="min-h-[44px] px-3 py-1.5 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[10px] text-[13px] text-[var(--text-primary)]"
              >
                {bulkStatusUpdate.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (bulkStatusTarget) {
                    bulkStatusUpdate.onApply(selectedIds, bulkStatusTarget, clearSelection);
                  }
                }}
              >
                {bulkStatusUpdate.applyLabel}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Standardized Responsive Data Table */}
      {filteredData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto max-h-[600px] border border-[var(--border-default)] rounded-[12px]">
            <table className="w-full text-left border-collapse text-[13px] leading-[18px]">
              <thead className="sticky top-0 z-10 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] text-[var(--text-secondary)]">
                <tr>
                  <th className="w-12 py-2.5 px-3 text-center">
                    <label className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer">
                      <input
                        ref={selectAllRef}
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleAllVisible}
                        aria-label={isBn ? 'সবগুলো নির্বাচন করুন' : 'Select all visible records'}
                        className="w-4 h-4 accent-[#0B5D45] rounded cursor-pointer"
                      />
                    </label>
                  </th>
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
                {filteredData.map((row) => {
                  const id = rowKey(row);
                  const isChecked = selectedSet.has(id);
                  return (
                    <tr
                      key={id}
                      className={`transition-colors duration-150 ${
                        isChecked
                          ? 'bg-[#ECF4F1]/60 dark:bg-[#157F5E]/20'
                          : 'odd:bg-[var(--bg-surface)] even:bg-[var(--bg-zebra)] hover:bg-[#0B5D45]/5'
                      }`}
                    >
                      <td className="w-12 py-2.5 px-3 text-center align-top">
                        <label className="inline-flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRow(id)}
                            aria-label={isBn ? `রেকর্ড ${id} নির্বাচন করুন` : `Select record ${id}`}
                            className="w-4 h-4 accent-[#0B5D45] rounded cursor-pointer"
                          />
                        </label>
                      </td>
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

          {/* Mobile Card List with Selection */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between px-1">
              <label className="inline-flex items-center gap-2 min-h-[44px] text-[13px] font-medium text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  className="w-4 h-4 accent-[#0B5D45] rounded cursor-pointer"
                />
                <span>{isBn ? 'সবগুলো নির্বাচন করুন' : 'Select all visible'}</span>
              </label>
            </div>

            {filteredData.map((row) => {
              const id = rowKey(row);
              const isChecked = selectedSet.has(id);
              return (
                <div
                  key={id}
                  className={`p-4 rounded-[12px] border space-y-2.5 text-[13px] ${
                    isChecked
                      ? 'border-[#0B5D45] bg-[#ECF4F1]/40 dark:bg-[#157F5E]/20'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[var(--border-default)]/60 pb-2">
                    <label className="inline-flex items-center gap-2 min-h-[40px] font-medium text-[var(--text-primary)] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRow(id)}
                        aria-label={isBn ? `রেকর্ড ${id} নির্বাচন করুন` : `Select record ${id}`}
                        className="w-4 h-4 accent-[#0B5D45] rounded cursor-pointer"
                      />
                      <span className="font-mono text-[12px] text-[var(--text-secondary)]">
                        {isBn ? 'নির্বাচিত' : 'Select'}
                      </span>
                    </label>
                  </div>
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className="flex flex-col gap-1 border-b border-[var(--border-default)]/60 pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="text-[12px] font-medium text-[var(--text-secondary)]">
                        {col.mobileLabel || col.header}
                      </span>
                      <div className="min-w-0">{col.render(row)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
