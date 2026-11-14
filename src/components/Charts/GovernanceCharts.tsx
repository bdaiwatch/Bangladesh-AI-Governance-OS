import React, { useRef } from 'react';
import { BenchmarkEntry, Language, RiskItem } from '../../types/os';
import { formatNumberForLocale } from '../../utils/formatters';

export const Sparkline: React.FC<{
  values: number[];
  tone?: 'green' | 'amber' | 'red';
  width?: number;
  height?: number;
  ariaLabel?: string;
}> = ({ values, tone = 'green', width = 64, height = 22, ariaLabel }) => {
  const w = width;
  const h = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = 2 + (i / Math.max(1, values.length - 1)) * (w - 4);
    const y = h - 3 - ((v - min) / span) * (h - 6);
    return { x, y };
  });
  const polylinePts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  const stroke =
    tone === 'red' ? '#B42318' : tone === 'amber' ? '#9A5B00' : '#0B5D45';

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className="shrink-0"
    >
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePts}
      />
      {last && <circle cx={last.x} cy={last.y} r="2" fill={stroke} />}
    </svg>
  );
};

export const ReadinessTrendChart: React.FC<{
  series: Array<{ month: string; score: number }>;
  language: Language;
}> = ({ series, language }) => {
  const w = 220;
  const h = 64;
  const padX = 8;
  const padTop = 16;
  const padBottom = 10;
  const values = series.map((s) => s.score);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const span = max - min || 1;

  const pts = series.map((s, i) => {
    const x = padX + (i / Math.max(1, series.length - 1)) * (w - padX * 2);
    const y = h - padBottom - ((s.score - min) / span) * (h - padTop - padBottom);
    return { x, y, ...s };
  });

  const polylinePts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const first = pts[0];
  const last = pts[pts.length - 1];
  const delta = Number((last.score - first.score).toFixed(1));
  const deltaText =
    language === 'bn'
      ? `১২ মাসে +${formatNumberForLocale(delta, language)}`
      : `+${delta} pts (12 mo)`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-[220px] h-[64px] overflow-visible"
      role="img"
      aria-label={`12-month readiness trend from ${first.score} in ${first.month} to ${last.score} in ${last.month}`}
    >
      <polyline
        fill="none"
        stroke="#0B5D45"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={polylinePts}
      />
      <circle cx={last.x} cy={last.y} r="4" fill="#0B5D45" />
      <text
        x={last.x}
        y={Math.max(11, last.y - 8)}
        textAnchor="end"
        className="fill-[#0B5D45] dark:fill-[#6EE7B7] font-mono text-[11px] font-medium"
      >
        {deltaText}
      </text>
    </svg>
  );
};

export const ReadinessScaleBar: React.FC<{
  score: number;
  language: Language;
}> = ({ score, language }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const bands = [
    { key: 'emerging', label: language === 'bn' ? 'উদীয়মান' : 'Emerging', width: 30, bg: 'bg-[#E6E6E0] dark:bg-[#2A2E33]' },
    { key: 'developing', label: language === 'bn' ? 'বিকাশমান' : 'Developing', width: 30, bg: 'bg-[#FEF7E6] dark:bg-[#9A5B00]/30' },
    { key: 'advancing', label: language === 'bn' ? 'অগ্রসর' : 'Advancing', width: 20, bg: 'bg-[#EFF6FC] dark:bg-[#2E5E8C]/30' },
    { key: 'leading', label: language === 'bn' ? 'শীর্ষ' : 'Leading', width: 20, bg: 'bg-[#ECF4F1] dark:bg-[#157F5E]/30' },
  ];

  return (
    <div
      className="space-y-2"
      role="img"
      aria-label={`Readiness scale 0 to 100 showing current score ${score} in Developing band`}
    >
      <div className="relative pt-2 pb-1">
        <div className="h-2 w-full rounded-full overflow-hidden flex border border-[var(--border-default)]">
          {bands.map((b) => (
            <div
              key={b.key}
              style={{ width: `${b.width}%` }}
              className={`h-full ${b.bg} border-r border-[var(--bg-surface)] last:border-r-0`}
            />
          ))}
        </div>

        {/* Marker at current score */}
        <div
          className="absolute top-0 bottom-0 flex flex-col items-center -translate-x-1/2"
          style={{ left: `${clamped}%` }}
        >
          <span className="w-3 h-3 rounded-full bg-[#0B5D45] border-2 border-[var(--bg-surface)] mt-0.5" />
        </div>
      </div>

      <div className="flex justify-between text-[12px] leading-[16px] text-[var(--text-secondary)]">
        {bands.map((b) => {
          const isCurrent =
            (b.key === 'emerging' && clamped < 30) ||
            (b.key === 'developing' && clamped >= 30 && clamped < 60) ||
            (b.key === 'advancing' && clamped >= 60 && clamped < 80) ||
            (b.key === 'leading' && clamped >= 80);
          return (
            <span
              key={b.key}
              className={
                isCurrent
                  ? 'font-medium text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)]'
              }
            >
              {b.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const HorizontalMetricBars: React.FC<{
  items: Array<{ label: string; value: number; target?: number; meta?: string }>;
  nationalAverage?: number;
  language?: Language;
  max?: number;
}> = ({ items, nationalAverage, language = 'en', max = 100 }) => {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const avgPct =
    typeof nationalAverage === 'number'
      ? Math.min(100, Math.max(0, (nationalAverage / max) * 100))
      : null;

  return (
    <div className="space-y-4">
      {sorted.map((item) => {
        const pct = Math.min(100, Math.max(0, (item.value / max) * 100));
        const targetPct = item.target
          ? Math.min(100, Math.max(0, (item.target / max) * 100))
          : null;
        return (
          <div key={item.label}>
            <div className="flex items-baseline justify-between gap-2 text-[14px] leading-[20px] mb-1.5">
              <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
              {item.meta && (
                <span className="text-[12px] text-[var(--text-secondary)]">{item.meta}</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-visible">
                <div
                  className="h-full bg-[#0B5D45] rounded-full"
                  style={{ width: `${pct}%` }}
                />
                {avgPct !== null && (
                  <div
                    className="absolute -top-1 -bottom-1 w-[1.5px] bg-[#667085] dark:bg-[#98A2B3]"
                    style={{ left: `${avgPct}%` }}
                    title={`National average: ${nationalAverage}`}
                  />
                )}
                {targetPct !== null && (
                  <div
                    className="absolute -top-1 -bottom-1 w-[2px] bg-[#14181B] dark:bg-white"
                    style={{ left: `${targetPct}%` }}
                    title={`Target: ${item.target}`}
                  />
                )}
              </div>
              <span className="font-mono text-[13px] leading-[18px] font-medium tabular-nums text-[var(--text-primary)] w-11 text-right shrink-0">
                {formatNumberForLocale(item.value.toFixed(1), language)}
              </span>
            </div>
          </div>
        );
      })}
      {(avgPct !== null || sorted.some((i) => i.target)) && (
        <div className="pt-2 flex flex-wrap items-center gap-4 text-[12px] leading-[16px] text-[var(--text-secondary)]">
          {avgPct !== null && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-[2px] h-3 bg-[#667085] dark:bg-[#98A2B3]" />
              <span>
                {language === 'bn'
                  ? `জাতীয় গড় (${formatNumberForLocale(nationalAverage ?? 0, language)})`
                  : `National average (${nationalAverage})`}
              </span>
            </span>
          )}
          {sorted.some((i) => i.target) && (
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block w-[2px] h-3 bg-[#14181B] dark:bg-white" />
              <span>{language === 'bn' ? 'লক্ষ্যমাত্রা' : 'Target'}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const RiskHeatmap5x5: React.FC<{
  risks: RiskItem[];
  selectedRiskId?: string | null;
  onSelectRisk?: (risk: RiskItem) => void;
  language?: Language;
}> = ({ risks, selectedRiskId, onSelectRisk, language = 'en' }) => {
  const levels = [5, 4, 3, 2, 1];
  const impacts = [1, 2, 3, 4, 5];
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Assign deterministic 1..N index numbers to risks for numbered circles
  const riskIndexMap = new Map<string, number>();
  risks.forEach((r, idx) => riskIndexMap.set(r.id, idx + 1));

  const cellTone = (l: number, i: number) => {
    const score = l * i;
    if (score >= 15) {
      return 'bg-[#FEF2F2] border-[#B42318]/25 text-[#B42318] dark:bg-[#B42318]/20 dark:border-[#F97066]/30 dark:text-[#FCA5A5]';
    }
    if (score >= 9) {
      return 'bg-[#FEF7E6] border-[#9A5B00]/25 text-[#9A5B00] dark:bg-[#9A5B00]/20 dark:border-[#F59E0B]/30 dark:text-[#FCD34D]';
    }
    return 'bg-[#ECF4F1] border-[#0B5D45]/20 text-[#0B5D45] dark:bg-[#157F5E]/20 dark:border-[#6EE7B7]/25 dark:text-[#6EE7B7]';
  };

  const handleCellKeyDown = (e: React.KeyboardEvent, lik: number, imp: number) => {
    let nextLik = lik;
    let nextImp = imp;
    if (e.key === 'ArrowUp') nextLik = Math.min(5, lik + 1);
    else if (e.key === 'ArrowDown') nextLik = Math.max(1, lik - 1);
    else if (e.key === 'ArrowRight') nextImp = Math.min(5, imp + 1);
    else if (e.key === 'ArrowLeft') nextImp = Math.max(1, imp - 1);
    else return;

    e.preventDefault();
    const key = `${nextLik}-${nextImp}`;
    const targetCell = cellRefs.current[key];
    if (targetCell) {
      const btn = targetCell.querySelector('button');
      if (btn) {
        (btn as HTMLElement).focus();
      } else {
        targetCell.focus();
      }
    }
  };

  return (
    <div
      className="w-full"
      role="region"
      aria-label={
        language === 'bn'
          ? '৫×৫ এআই ঝুঁকি ম্যাট্রিক্স, তীর কী ব্যবহার করে সরানো যায়'
          : '5 by 5 AI risk exposure matrix; use arrow keys to move across cells'
      }
    >
      <div className="flex items-stretch gap-2">
        {/* Vertical Likelihood Axis Label */}
        <div className="flex items-center justify-center w-4 shrink-0">
          <span className="-rotate-90 whitespace-nowrap text-[12px] leading-[16px] font-medium text-[var(--text-secondary)]">
            {language === 'bn' ? 'সম্ভাবনা' : 'Likelihood'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-[20px_repeat(5,minmax(0,1fr))] gap-1.5 text-xs">
            {levels.map((lik) => (
              <React.Fragment key={lik}>
                <div className="text-[12px] font-mono text-[var(--text-secondary)] flex items-center justify-center">
                  {formatNumberForLocale(lik, language)}
                </div>
                {impacts.map((imp) => {
                  const cellRisks = risks.filter((r) => r.likelihood === lik && r.impact === imp);
                  return (
                    <div
                      key={`${lik}-${imp}`}
                      ref={(el) => {
                        cellRefs.current[`${lik}-${imp}`] = el;
                      }}
                      tabIndex={cellRisks.length === 0 ? 0 : -1}
                      onKeyDown={(e) => handleCellKeyDown(e, lik, imp)}
                      aria-label={`Likelihood ${lik}, Impact ${imp}, score ${lik * imp}${
                        cellRisks.length ? `, ${cellRisks.length} risks` : ''
                      }`}
                      className={`min-h-[48px] min-w-0 border rounded-[8px] p-1 flex flex-col items-center justify-center gap-1 focus-visible:outline-2 focus-visible:outline-[#0B5D45] ${cellTone(
                        lik,
                        imp
                      )}`}
                    >
                      {cellRisks.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {cellRisks.map((r) => {
                            const isSelected = selectedRiskId === r.id;
                            const num = riskIndexMap.get(r.id) ?? 1;
                            const score = r.likelihood * r.impact;
                            const circleTone =
                              score >= 15
                                ? 'bg-[#B42318] text-white border-[#B42318]'
                                : score >= 9
                                ? 'bg-[#9A5B00] text-white border-[#9A5B00]'
                                : 'bg-[#0B5D45] text-white border-[#0B5D45]';

                            return (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => onSelectRisk?.(r)}
                                aria-label={`${r.code}: ${r.title}, score ${score}`}
                                aria-pressed={isSelected}
                                className={`min-w-[28px] h-[28px] px-1.5 rounded-full border font-mono text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors duration-150 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#14181B] text-white border-[#14181B] dark:bg-white dark:text-[#14181B] dark:border-white'
                                    : `${circleTone} hover:opacity-90`
                                }`}
                              >
                                <span>{formatNumberForLocale(num, language)}</span>
                                {isSelected && (
                                  <span className="hidden sm:inline text-[10px]">
                                    {r.code.replace('RSK-', '')}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="font-mono text-[10px] opacity-40 select-none">
                          {formatNumberForLocale(lik * imp, language)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}

            {/* Bottom Impact ticks */}
            <div />
            {impacts.map((imp) => (
              <div
                key={`tick-${imp}`}
                className="text-center text-[12px] font-mono text-[var(--text-secondary)] pt-1"
              >
                {formatNumberForLocale(imp, language)}
              </div>
            ))}
          </div>

          <div className="text-center text-[12px] leading-[16px] font-medium text-[var(--text-secondary)] mt-1">
            {language === 'bn' ? 'প্রভাব' : 'Impact'}
          </div>
        </div>
      </div>
    </div>
  );
};

export const BenchmarkComparisonChart: React.FC<{
  entries: BenchmarkEntry[];
  activeCountryCode: string;
}> = ({ entries, activeCountryCode }) => {
  const pillars: Array<{ key: keyof BenchmarkEntry; label: string }> = [
    { key: 'overallScore', label: 'Overall index' },
    { key: 'governanceScore', label: 'Governance' },
    { key: 'infrastructureScore', label: 'Infrastructure' },
    { key: 'humanCapitalScore', label: 'Human capital' },
    { key: 'researchScore', label: 'Research & R&D' },
    { key: 'responsibleAiScore', label: 'Responsible AI' },
  ];

  return (
    <div className="space-y-4">
      {pillars.map((p) => (
        <div key={String(p.key)} className="border-b border-[var(--border-default)] pb-4 last:border-b-0 last:pb-0">
          <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-2">{p.label}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {entries.map((entry) => {
              const val = Number(entry[p.key]);
              const isCurrent = entry.countryCode === activeCountryCode;
              return (
                <div
                  key={`${p.key}-${entry.countryCode}`}
                  className={`p-3 rounded-[12px] border ${
                    isCurrent
                      ? 'bg-[#ECF4F1] border-[#0B5D45] dark:bg-[#157F5E]/20'
                      : 'bg-[var(--bg-zebra)] border-[var(--border-default)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`font-semibold ${isCurrent ? 'text-[#0B5D45] dark:text-[#6EE7B7]' : 'text-[var(--text-secondary)]'}`}>
                      {entry.countryName}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-[var(--text-primary)]">
                      {val.toFixed(1)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-default)]">
                    <div
                      className={`h-full rounded-full ${isCurrent ? 'bg-[#0B5D45]' : 'bg-[#667085]/60'}`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
