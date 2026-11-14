import React, { useState } from 'react';
import { GovernanceProvider, useGovernance } from './store/GovernanceContext';
import { Sidebar } from './components/Shell/Sidebar';
import { TopBar } from './components/Shell/TopBar';
import { AuthDialog } from './components/Shell/NavigationMenu';
import { BottomNav } from './components/Shell/BottomNav';
import { EvidenceDrawer } from './components/Shell/EvidenceDrawer';
import { InfoSheets } from './components/Shell/InfoSheets';
import { ApiAccessModal } from './components/Common/ApiAccessModal';
import { CentralCommandCentre } from './components/Modules/CentralCommandCentre';
import { Module01WatchCentre } from './components/Modules/Module01WatchCentre';
import { Module02ReadinessCentre } from './components/Modules/Module02ReadinessCentre';
import { Module03PolicyCentre } from './components/Modules/Module03PolicyCentre';
import { Module04LegalCentre } from './components/Modules/Module04LegalCentre';
import { Module05GovernanceCentre } from './components/Modules/Module05GovernanceCentre';
import { Module06RiskObservatory } from './components/Modules/Module06RiskObservatory';
import { Module07ResponsibleAI } from './components/Modules/Module07ResponsibleAI';
import { Module08ImpactAssessment } from './components/Modules/Module08ImpactAssessment';
import { Module09DataGovernance } from './components/Modules/Module09DataGovernance';
import { Module10Infrastructure } from './components/Modules/Module10Infrastructure';
import { Module11HumanCapital } from './components/Modules/Module11HumanCapital';
import { Module12ResearchInnovation } from './components/Modules/Module12ResearchInnovation';
import { Module13Economy } from './components/Modules/Module13Economy';
import { Module14PublicSectorAI } from './components/Modules/Module14PublicSectorAI';
import { Module15SafetyCyber } from './components/Modules/Module15SafetyCyber';
import { Module16Benchmarking } from './components/Modules/Module16Benchmarking';
import { Module17Stakeholders } from './components/Modules/Module17Stakeholders';
import { Module18Implementation } from './components/Modules/Module18Implementation';
import { Module19Reporting } from './components/Modules/Module19Reporting';
import { Module20Copilot } from './components/Modules/Module20Copilot';
import { ObservatoryCentre } from './components/Modules/ObservatoryCentre';
import { AdminCMS } from './components/Modules/AdminCMS';

const ActiveModuleView: React.FC = () => {
  const { activeModule, isAdmin, language, navigateTo, setAuthModalMode } = useGovernance();
  const isBn = language === 'bn';

  switch (activeModule) {
    case 'command':
      return <CentralCommandCentre />;
    case 'm01':
      return <Module01WatchCentre />;
    case 'm02':
      return <Module02ReadinessCentre />;
    case 'm03':
      return <Module03PolicyCentre />;
    case 'm04':
      return <Module04LegalCentre />;
    case 'm05':
      return <Module05GovernanceCentre />;
    case 'm06':
      return <Module06RiskObservatory />;
    case 'm07':
      return <Module07ResponsibleAI />;
    case 'm08':
      return <Module08ImpactAssessment />;
    case 'm09':
      return <Module09DataGovernance />;
    case 'm10':
      return <Module10Infrastructure />;
    case 'm11':
      return <Module11HumanCapital />;
    case 'm12':
      return <Module12ResearchInnovation />;
    case 'm13':
      return <Module13Economy />;
    case 'm14':
      return <Module14PublicSectorAI />;
    case 'm15':
      return <Module15SafetyCyber />;
    case 'm16':
      return <Module16Benchmarking />;
    case 'm17':
      return <Module17Stakeholders />;
    case 'm18':
      return <Module18Implementation />;
    case 'm19':
      return <Module19Reporting />;
    case 'm20':
      return <Module20Copilot />;
    case 'observatory':
      return <ObservatoryCentre />;
    case 'admin':
      return isAdmin ? (
        <AdminCMS />
      ) : (
        <section
          aria-label={isBn ? 'প্রবেশাধিকার সংরক্ষিত' : 'Access denied'}
          className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-6 sm:p-8 space-y-4"
        >
          <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-mono font-medium bg-[#FEF2F2] dark:bg-[#B42318]/20 text-[#B42318] dark:text-[#F97066]">
            403 · {isBn ? 'প্রবেশাধিকার সংরক্ষিত' : 'Access Denied'}
          </div>
          <h1 className="font-serif-editorial text-[24px] leading-[32px] font-semibold text-[var(--text-primary)]">
            {isBn ? 'অ্যাডমিন অ্যাক্সেস প্রয়োজন' : 'Admin Access Required'}
          </h1>
          <p className="text-[15px] leading-[24px] text-[var(--text-secondary)] max-w-2xl">
            {isBn
              ? 'সকল অনুমোদন প্রক্রিয়া এবং ডেটা ব্যবস্থাপনা শুধুমাত্র অ্যাডমিন সিএমএস-এ সীমাবদ্ধ। সাধারণ ব্যবহারকারীরা কেবল পাঠযোগ্য (Read-Only) দৃশ্য দেখতে পারবেন।'
              : 'All approval workflows and data management features are consolidated inside Admin CMS and restricted to users logged in with the Admin role. Standard users have read-only access.'}
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthModalMode('login')}
              className="min-h-[44px] px-4 py-2 rounded-[10px] bg-[#0B5D45] hover:bg-[#084734] text-white text-[14px] font-medium transition-colors cursor-pointer"
            >
              {isBn ? 'অ্যাডমিন হিসেবে লগইন করুন' : 'Log in as Admin'}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('command', 'overview')}
              className="min-h-[44px] px-4 py-2 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)] text-[14px] font-medium transition-colors cursor-pointer"
            >
              {isBn ? 'সারসংক্ষেপে ফিরে যান' : 'Return to Overview'}
            </button>
          </div>
        </section>
      );
    default:
      return <CentralCommandCentre />;
  }
};

const OperatingSystemShell: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const {
    toastMessage,
    toastUndoAction,
    dismissToast,
    language,
    countryCode,
    dataset,
    openInfoSheet,
  } = useGovernance();

  const preparedLine =
    language === 'bn'
      ? 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ, জাতীয় এআই কাউন্সিল এবং বাংলাদেশ কম্পিউটার কাউন্সিল (বিসিসি)-এর সহযোগিতায় প্রস্তুত।'
      : countryCode === 'BD'
      ? 'Prepared with the ICT Division, National AI Council and Bangladesh Computer Council (BCC).'
      : `Prepared with the ${dataset.country.leadBodyEn}.`;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#0B5D45] focus:text-white focus:rounded-[12px] focus:text-[14px] focus:font-medium"
      >
        {language === 'bn' ? 'মূল বিষয়বস্তুতে যান' : 'Skip to main content'}
      </a>

      {/* Non-sticky editorial header */}
      <TopBar />

      <div className="flex-1 flex min-w-0">
        <Sidebar />

        <div className="flex-1 min-w-0 flex flex-col">
          <main
            id="main-content"
            tabIndex={-1}
            className="flex-1 max-w-[960px] w-full mx-auto px-[20px] md:px-8 py-6 md:py-8 focus:outline-none"
          >
            <ActiveModuleView />
          </main>

          <footer className="border-t border-[var(--border-default)] bg-[var(--bg-surface)] text-[13px] leading-[18px] text-[var(--text-secondary)] no-print">
            <div className="max-w-[960px] mx-auto px-[20px] md:px-8 pt-6 pb-[82px] md:pb-6 space-y-2">
              <p className="text-[var(--text-secondary)]">{preparedLine}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-[var(--text-primary)] font-medium">
                  © 2026 Atlas AI Institute
                </span>
                <button
                  type="button"
                  onClick={() => openInfoSheet('methodology')}
                  className="min-h-[44px] inline-flex items-center hover:text-[#0B5D45] dark:hover:text-[#6EE7B7] hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'মূল্যায়ন পদ্ধতি' : 'Methodology'}
                </button>
                <button
                  type="button"
                  onClick={() => openInfoSheet('data_sources')}
                  className="min-h-[44px] inline-flex items-center hover:text-[#0B5D45] dark:hover:text-[#6EE7B7] hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'ডেটা উৎসসমূহ' : 'Data sources'}
                </button>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <BottomNav
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((v) => !v)}
        onCloseMobileMenu={() => setMobileMenuOpen(false)}
      />
      <AuthDialog />
      <EvidenceDrawer />
      <InfoSheets />
      <ApiAccessModal />

      {/* Accessible live region for toasts & 8s Undo */}
      <div aria-live="polite" aria-atomic="true" className="fixed bottom-[72px] md:bottom-5 right-4 md:right-5 z-50 no-print">
        {toastMessage && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#14181B] text-[#FAFAF7] text-[13px] font-medium rounded-[12px] border border-[#0B5D45]">
            <span>{toastMessage}</span>
            {toastUndoAction && (
              <button
                type="button"
                onClick={() => {
                  toastUndoAction();
                  dismissToast();
                }}
                className="min-h-[36px] px-2.5 rounded-[8px] bg-[#0B5D45] text-white text-[12px] font-semibold hover:bg-[#084734] cursor-pointer"
              >
                {language === 'bn' ? 'পূর্বাবস্থায় ফেরান' : 'Undo'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <GovernanceProvider>
      <OperatingSystemShell />
    </GovernanceProvider>
  );
}
