import React from 'react';
import { Printer } from 'lucide-react';
import { useGovernance } from '../../store/GovernanceContext';
import { formatEditorialDate, formatNumberForLocale } from '../../utils/formatters';
import { Button, EvidenceLink, ResponsiveSheet, StatusLabel } from '../Common/Primitives';

export const InfoSheets: React.FC = () => {
  const {
    infoSheet,
    closeInfoSheet,
    exportSheetOpen,
    setExportSheetOpen,
    navigateTo,
    language,
    dataset,
    computedReadinessScore,
  } = useGovernance();

  const isBn = language === 'bn';

  return (
    <>
      <ResponsiveSheet
        open={infoSheet === 'methodology'}
        onClose={closeInfoSheet}
        title={isBn ? 'মূল্যায়ন পদ্ধতি' : 'Methodology'}
        subtitle={
          isBn
            ? 'জাতীয় এআই প্রস্তুতি ও ঝুঁকি গণনার কাঠামো'
            : 'How national readiness scores and risk tiers are calculated'
        }
      >
        <div className="space-y-6 text-[15px] leading-[24px] text-[var(--text-primary)]">
          <div className="space-y-2">
            <h4 className="font-serif-editorial text-[17px] leading-[24px] font-semibold">
              {isBn ? '১. সম্মিলিত প্রস্তুতি সূচক (০–১০০)' : '1. Composite readiness score (0–100)'}
            </h4>
            <p className="text-[var(--text-secondary)] text-[14px] leading-[22px]">
              {isBn
                ? `চারটি স্তম্ভের (প্রাতিষ্ঠানিক, অবকাঠামো, মানবসম্পদ এবং দায়িত্বশীল এআই) গড় স্কোর থেকে জাতীয় স্কোর (${formatNumberForLocale(computedReadinessScore, language)} / ১০০) নির্ধারিত হয়। প্রতিটি স্তম্ভের ৭০% আসে যাচাইকৃত সূচক থেকে এবং ৩০% আসে নিরীক্ষা প্রশ্নপত্রের পরিপক্বতা স্তর (১–৫) থেকে।`
                : `The national score (${computedReadinessScore} / 100) is the unweighted mean across four pillars: Institutional, Infrastructure, Human Capital, and Responsible AI. Within each pillar, 70% comes from verified national indicators and 30% from structured maturity audits (levels 1–5 scaled to 100).`}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif-editorial text-[17px] leading-[24px] font-semibold">
              {isBn ? '২. পরিপক্বতা স্তরসমূহ' : '2. Maturity bands'}
            </h4>
            <div className="border border-[var(--border-default)] rounded-[12px] divide-y divide-[var(--border-default)] text-[13px] leading-[18px]">
              {[
                { band: isBn ? 'উদীয়মান' : 'Emerging', range: '0–30', desc: isBn ? 'প্রাথমিক কৌশল ও খণ্ডিত উদ্যোগ' : 'Initial strategy drafting and fragmented pilots' },
                { band: isBn ? 'বিকাশমান' : 'Developing', range: '30–60', desc: isBn ? 'নীতি কাঠামো ও মৌলিক অবকাঠামো নির্মাণাধীন' : 'Active policy architecture, baseline compute, initial compliance' },
                { band: isBn ? 'অগ্রসর' : 'Advancing', range: '60–80', desc: isBn ? 'আইনি কাঠামো কার্যকর ও বিস্তৃত জনসেবা এআই' : 'Enacted legal instruments and scaled public-sector deployment' },
                { band: isBn ? 'শীর্ষস্থানীয়' : 'Leading', range: '80–100', desc: isBn ? 'পূর্ণ সার্বভৌম সক্ষমতা ও ক্রমাগত নিরীক্ষা' : 'Sovereign compute, audited safety, and global standard setting' },
              ].map((row) => (
                <div key={row.range} className="p-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{row.band}</div>
                    <div className="text-[var(--text-secondary)] mt-0.5">{row.desc}</div>
                  </div>
                  <span className="font-mono text-[12px] leading-[16px] text-[var(--text-secondary)] shrink-0">
                    {formatNumberForLocale(row.range, language)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-serif-editorial text-[17px] leading-[24px] font-semibold">
              {isBn ? '৩. ঝুঁকি স্কোরিং (৫×৫ ম্যাট্রিক্স)' : '3. Risk scoring (5×5 matrix)'}
            </h4>
            <p className="text-[var(--text-secondary)] text-[14px] leading-[22px]">
              {isBn
                ? 'সম্ভাবনা (১–৫) × প্রভাব (১–৫) গুণ করে ১ থেকে ২৫ স্কেলে ঝুঁকি নির্ণয় করা হয়: ১৫–২৫ গুরুতর (লাল), ৯–১৪ মধ্যম/উচ্চ (অ্যাম্বার) এবং ১–৮ নিয়ন্ত্রিত (সবুজ)।'
                : 'Each registered risk is scored as Likelihood (1–5) × Impact (1–5) on a 1–25 scale: 15–25 Critical (red), 9–14 Elevated (amber), and 1–8 Managed (green).'}
            </p>
          </div>
        </div>
      </ResponsiveSheet>

      <ResponsiveSheet
        open={infoSheet === 'data_sources'}
        onClose={closeInfoSheet}
        title={isBn ? 'ডেটা উৎসসমূহ' : 'Data sources'}
        subtitle={
          isBn
            ? `${dataset.country.nameBn}-এর জন্য যাচাইকৃত প্রমাণ ও নিবন্ধন নথি`
            : `Verified registries and primary documents for ${dataset.country.nameEn}`
        }
      >
        <div className="divide-y divide-[var(--border-default)]">
          {dataset.evidence.map((ev) => (
            <div key={ev.id} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <EvidenceLink evidenceId={ev.id} className="min-h-[32px] py-0" />
                <StatusLabel status={ev.confidence} tone="nominal" />
              </div>
              <div className="font-serif-editorial text-[17px] leading-[24px] font-semibold text-[var(--text-primary)]">
                {ev.title}
              </div>
              <div className="text-[13px] leading-[18px] text-[var(--text-secondary)]">
                {ev.sourceName} · {formatEditorialDate(ev.verifiedDate, language)}
              </div>
              <p className="text-[14px] leading-[21px] text-[var(--text-secondary)] pt-0.5">
                {ev.summary}
              </p>
            </div>
          ))}
        </div>
      </ResponsiveSheet>

      <ResponsiveSheet
        open={exportSheetOpen}
        onClose={() => setExportSheetOpen(false)}
        title={isBn ? 'রিপোর্ট ও ডেটা রপ্তানি' : 'Export report'}
        subtitle={
          isBn
            ? 'পরিচ্ছন্ন এক-কলাম প্রিন্ট রিপোর্ট বা এক্সেল ফাইল তৈরি করুন'
            : 'Produce a clean one-column report with reference IDs or download structured spreadsheets'
        }
      >
        <div className="space-y-4">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => {
              setExportSheetOpen(false);
              window.setTimeout(() => window.print(), 80);
            }}
          >
            <Printer className="w-4 h-4" />
            <span>{isBn ? 'এক-কলাম পিডিএফ প্রিন্ট করুন' : 'Print one-column PDF report'}</span>
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setExportSheetOpen(false);
              navigateTo('m19', 'export');
            }}
          >
            <span>{isBn ? 'সম্পূর্ণ পিডিএফ ও এক্সেল রপ্তানি কেন্দ্র' : 'Open PDF & Excel export centre'}</span>
          </Button>
        </div>
      </ResponsiveSheet>
    </>
  );
};
