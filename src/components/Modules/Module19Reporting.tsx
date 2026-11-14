import React from 'react';
import { CheckCircle2, Code2, Download, FileText, Lock, Printer, ShieldAlert } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { MODULES_REGISTRY } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import { formatNumberForLocale } from '../../utils/formatters';
import { Button, EvidenceLink, ModuleHeader, ModuleSubNav, SectionCard, StatusLabel } from '../Common/Primitives';

export const Module19Reporting: React.FC = () => {
  const { dataset, activeSubTab, computedReadinessScore, pillarAverages, showToast, language, openApiModal } =
    useGovernance();
  const mod = MODULES_REGISTRY.find((m) => m.id === 'm19')!;
  const isBn = language === 'bn';

  const handleOpenApiForDataset = (endpoint: string, datasetName: string) => {
    openApiModal({
      title: isBn ? 'সার্বভৌম এপিআই ডেটা গেটওয়ে' : 'Sovereign REST API Gateway',
      endpoint,
      datasetName,
      description: isBn
        ? 'সিস্টেমের জাতীয় নিরাপত্তা ও ডেটা সার্বভৌমত্ব নীতি অনুযায়ী নিজের অ্যাসেসমেন্ট রিপোর্ট ছাড়া অন্য সকল ডেটাসেট ও নথি ফাইল হিসেবে সরাসরি ডাউনলোড বন্ধ রাখা হয়েছে। এই ডেটা ব্যবহারে অফিসিয়াল REST API ব্যবহার করতে হবে।'
        : 'In accordance with sovereign AI security protocols, direct file downloads are disabled across the system except for your personal assessment report. Use the official REST API for programmatic telemetry integration.',
    });
    showToast(
      isBn
        ? 'সরাসরি ডাউনলোড বন্ধ। এই ডেটার জন্য এপিআই ব্যবহার করতে হবে।'
        : 'Direct download is restricted. Please use the REST API gateway.'
    );
  };

  const handleExportAssessmentPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 48;

    // Header banner
    doc.setFillColor(11, 93, 69);
    doc.rect(40, y - 18, 515, 26, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('OFFICIAL ASSESSMENT REPORT — AUTHORIZED DOWNLOAD FOR USER', 50, y);
    doc.setTextColor(0, 0, 0);

    y += 35;
    doc.setFontSize(16);
    doc.text(`BD AI WATCH — National AI Readiness Assessment (${dataset.country.nameEn})`, 40, y);
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `Lead Authority: ${dataset.country.leadBodyEn} | Global Rank: #${dataset.country.globalRank} | Generated: ${new Date().toLocaleDateString()}`,
      40,
      y
    );
    doc.setTextColor(0, 0, 0);
    y += 16;
    doc.setFontSize(12);
    doc.text(`Composite AI Readiness Assessment Score: ${computedReadinessScore} / 100`, 40, y);
    y += 24;

    doc.setFontSize(12);
    doc.text('1. Verified Readiness Pillar Breakdown', 40, y);
    y += 16;
    doc.setFontSize(10);
    Object.entries(pillarAverages).forEach(([k, v]) => {
      doc.text(`- ${k}: ${v.toFixed(1)} / 100`, 48, y);
      y += 14;
    });

    y += 14;
    doc.setFontSize(12);
    doc.text('2. National AI Readiness Indicators (Verified)', 40, y);
    y += 16;
    doc.setFontSize(10);
    dataset.readinessDimensions.forEach((d) => {
      doc.text(
        `- [${d.indicatorCode}] ${d.name} (${d.pillar}): Current ${d.score} / Target ${d.target}`,
        48,
        y,
        { maxWidth: 500 }
      );
      y += 15;
    });

    y += 14;
    doc.setFontSize(12);
    doc.text('3. Compliance & Assessment Certification', 40, y);
    y += 16;
    doc.setFontSize(9);
    doc.setTextColor(90, 90, 90);
    doc.text(
      'This document constitutes the official sovereign personal AI readiness assessment report for Bangladesh.',
      48,
      y,
      { maxWidth: 500 }
    );
    y += 13;
    doc.text(
      'All other policy briefs, raw database logs, and risk registries are strictly accessible via REST API v1.',
      48,
      y,
      { maxWidth: 500 }
    );

    doc.save(`BD-AI-WATCH_${dataset.country.code}_Personal_Assessment_Report.pdf`);
    showToast(
      isBn
        ? 'আপনার ব্যক্তিগত অ্যাসেসমেন্ট রিপোর্ট (PDF) ডাউনলোড সম্পন্ন হয়েছে।'
        : `Exported authorized Personal Assessment Report PDF (${dataset.country.code}).`
    );
  };

  return (
    <div>
      <ModuleHeader
        module={mod}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" />
              <span>{isBn ? 'প্রিন্ট ভিউ' : 'Print View'}</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                handleOpenApiForDataset(
                  '/api/v1/governance/export',
                  isBn ? 'জাতীয় সার্বিক গভর্ন্যান্স ডেটাসেট' : 'National Consolidated Governance Telemetry'
                )
              }
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{isBn ? 'এপিআই ডেটাসেট (ডাউনলোড বন্ধ)' : 'REST API (Export Blocked)'}</span>
            </Button>
            <Button variant="primary" onClick={handleExportAssessmentPdf}>
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'নিজের অ্যাসেসমেন্ট রিপোর্ট (PDF)' : 'Download Assessment Report'}</span>
            </Button>
          </div>
        }
      />
      <ModuleSubNav module={mod} />

      <div className="space-y-5">
        {/* Sovereign Policy Banner */}
        <div className="p-4 rounded-xl border border-amber-300/60 dark:border-amber-500/30 bg-amber-500/10 flex items-start gap-3 text-xs leading-relaxed text-[var(--text-primary)]">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900 dark:text-amber-200">
              {isBn
                ? 'সার্বভৌম ডেটা সুরক্ষা নীতি — সরাসরি ফাইল ডাউনলোড সংক্রান্ত নির্দেশনা'
                : 'Sovereign Data Access Policy — Direct File Download Directive'}
            </div>
            <p className="text-[var(--text-secondary)]">
              {isBn
                ? 'সম্পূর্ণ সিস্টেম থেকে শুধুমাত্র নিজের অ্যাসেসমেন্ট রিপোর্ট সরাসরি ডাউনলোড (PDF) অনুমোদিত। অন্যান্য সকল ডেটাসেট, পলিসি ড্রাফট, ঝুঁকি রেজিস্ট্রি ও অবকাঠামো লগ ফাইল হিসেবে সরাসরি ডাউনলোড বন্ধ রাখা হয়েছে। যেকোনো ডেটা অ্যাক্সেসের প্রয়োজন হলে সুরক্ষিত REST API গেটওয়ে ব্যবহার করুন।'
                : 'Across the entire platform, direct file downloads are disabled except for your own Personal Assessment Report. For all other policy drafts, risk logs, research syntheses, and raw datasets, you must integrate via the sovereign REST API gateway.'}
            </p>
          </div>
        </div>

        <SectionCard
          title={`${mod.subTabs.find((t) => t.id === activeSubTab)?.labelEn} — Consolidated Intelligence`}
          subtitle={
            isBn
              ? `অঞ্চল পরিধি: ${dataset.country.nameBn} (${dataset.country.code}) · নিজের অ্যাসেসমেন্ট রিপোর্ট ব্যতীত অন্য সকল নথির জন্য এপিআই বাধ্যতামূলক`
              : `Country Scope: ${dataset.country.nameEn} (${dataset.country.code}) · Personal assessment download authorized · All other data gated to REST API`
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--bg-zebra)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Readiness Score</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#0B5D45] dark:text-[#34D399] mt-1">
                {formatNumberForLocale(computedReadinessScore, language)} / 100
              </div>
            </div>
            <div className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--bg-zebra)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Policy Instruments</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)] mt-1">
                {formatNumberForLocale(dataset.policies.length, language)} Active
              </div>
            </div>
            <div className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--bg-zebra)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Risk Register Items</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[#B45309] mt-1">
                {formatNumberForLocale(dataset.risks.length, language)} Logged
              </div>
            </div>
            <div className="p-4 border border-[var(--border-default)] rounded-xl bg-[var(--bg-zebra)]">
              <div className="text-xs font-semibold text-[var(--text-secondary)]">Verified Evidence Docs</div>
              <div className="text-xl font-bold font-mono tabular-nums text-[var(--text-primary)] mt-1">
                {formatNumberForLocale(dataset.evidence.length, language)} Sources
              </div>
            </div>
          </div>

          <div className="divide-y divide-[var(--border-default)] text-xs">
            {[
              {
                title: `${dataset.country.nameEn} National AI Readiness & Pillar Audit Report`,
                type: isBn ? 'নিজের অ্যাসেসমেন্ট রিপোর্ট' : 'Personal Assessment Report',
                isAssessmentReport: true,
                summary: `Composite maturity score ${computedReadinessScore}/100 across ${dataset.readinessDimensions.length} verified indicators and 4 pillars.`,
                evidenceId: dataset.readinessDimensions[0]?.evidenceId || 'ev-bd-05',
                apiEndpoint: '/api/v1/governance/export',
              },
              {
                title: `${dataset.country.nameEn} AI Policy, Legal & Regulatory Gap Briefing`,
                type: isBn ? 'আইন ও নীতি ব্রিফিং' : 'Policy & Legal Report',
                isAssessmentReport: false,
                summary: `${dataset.policies.length} policies tracked with ${dataset.laws.length} statutory & regulatory instruments.`,
                evidenceId: dataset.policies[0]?.evidenceId || 'ev-bd-01',
                apiEndpoint: '/api/v1/policies',
              },
              {
                title: `${dataset.country.nameEn} National AI Risk & Cybersecurity Posture`,
                type: isBn ? 'ঝুঁকি ও নিরাপত্তা রেজিস্ট্রি' : 'Risk & Security Report',
                isAssessmentReport: false,
                summary: `${dataset.risks.length} sovereign AI risks and ${dataset.safetyIncidents.length} safety/cyber logs compiled.`,
                evidenceId: dataset.risks[0]?.evidenceId || 'ev-bd-06',
                apiEndpoint: '/api/v1/risks',
              },
              {
                title: `${dataset.country.nameEn} AI Research, Innovation & Economy Synthesis`,
                type: isBn ? 'গবেষণা ও অর্থনৈতিক সংশ্লেষণ' : 'Research & Economy Report',
                isAssessmentReport: false,
                summary: `${dataset.researchItems.length} R&D initiatives and ${dataset.economyItems.length} economic sectors benchmarked.`,
                evidenceId: dataset.researchItems[0]?.evidenceId || 'ev-bd-03',
                apiEndpoint: '/api/v1/research',
              },
            ].map((rep) => (
              <div key={rep.title} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#0B5D45] dark:text-[#34D399] font-bold">{rep.type}</span>
                    {rep.isAssessmentReport ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {isBn ? 'ডাউনলোড অনুমোদিত' : 'Download Authorized'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <Lock className="w-3 h-3" />
                        {isBn ? 'সরাসরি ডাউনলোড বন্ধ · API Only' : 'Download Disabled · API Only'}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-[var(--text-primary)]">{rep.title}</div>
                  <p className="text-[var(--text-secondary)]">{rep.summary}</p>
                  <div className="mt-1">
                    <EvidenceLink evidenceId={rep.evidenceId} />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 no-print">
                  {rep.isAssessmentReport ? (
                    <>
                      <StatusLabel status={isBn ? 'অনুমোদিত' : 'Authorized'} tone="nominal" />
                      <Button variant="primary" size="sm" onClick={handleExportAssessmentPdf}>
                        <Download className="w-3.5 h-3.5" />
                        <span>{isBn ? 'রিপোর্ট ডাউনলোড (PDF)' : 'Download PDF'}</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <StatusLabel status={isBn ? 'API প্রয়োজন' : 'API Required'} tone="warning" />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenApiForDataset(rep.apiEndpoint, rep.title)}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{isBn ? 'এপিআই ব্যবহার করুন' : 'Use REST API'}</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};
