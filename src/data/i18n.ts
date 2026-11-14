import { Language, PillarGroup } from '../types/os';

export const PILLAR_LABELS: Record<PillarGroup, Record<Language, string>> = {
  overview: {
    en: 'Sovereign command',
    bn: 'সার্বভৌম কমান্ড',
  },
  intelligence_readiness: {
    en: 'Intelligence and readiness',
    bn: 'বুদ্ধিমত্তা ও প্রস্তুতি',
  },
  policy_governance: {
    en: 'Policy, law and governance',
    bn: 'নীতি, আইন ও গভর্নেন্স',
  },
  risk_responsibility: {
    en: 'Risk, ethics, data and safety',
    bn: 'ঝুঁকি, নৈতিকতা, ডেটা ও নিরাপত্তা',
  },
  capacity_ecosystem: {
    en: 'Infrastructure, talent and state',
    bn: 'অবকাঠামো, মেধা ও রাষ্ট্র',
  },
  execution_automation: {
    en: 'Benchmarking, PMO and AI',
    bn: 'বেঞ্চমার্ক, পিএমও ও এআই',
  },
};

export const UI_TEXT = {
  brandTitle: {
    en: 'BD AI Watch',
    bn: 'বিডি এআই ওয়াচ',
  },
  brandInitiative: {
    en: 'An Atlas AI Institute initiative',
    bn: 'An Atlas AI Institute initiative',
  },
  osSubtitle: {
    en: 'National overview of AI readiness, policy, risk, infrastructure, and alerts.',
    bn: 'জাতীয় এআই প্রস্তুতি, নীতি, ঝুঁকি, অবকাঠামো ও সতর্কবার্তার সমন্বিত সারসংক্ষেপ।',
  },
  countryIsolationLabel: {
    en: 'Country workspace',
    bn: 'দেশভিত্তিক ওয়ার্কস্পেস',
  },
  roleAccessLabel: {
    en: 'Access role',
    bn: 'ভূমিকা ও অধিকার',
  },
  inspectEvidence: {
    en: 'Evidence source',
    bn: 'প্রমাণ সূত্র',
  },
  openModule: {
    en: 'Open module',
    bn: 'মডিউলে যান',
  },
  searchPlaceholder: {
    en: 'Search modules, policies, risks...',
    bn: 'মডিউল, নীতি বা ঝুঁকি খুঁজুন...',
  },
  readOnlyNotice: {
    en: 'Read-only under current role. Switch to an authorized role in the sidebar to modify records.',
    bn: 'বর্তমান ভূমিকায় শুধুমাত্র পাঠযোগ্য। সম্পাদনার জন্য সাইডবার থেকে অনুমোদিত ভূমিকা নির্বাচন করুন।',
  },
  restrictedMaskedNotice: {
    en: 'Classified cybersecurity and critical vulnerability records are isolated from Public Observer view.',
    bn: 'সংরক্ষিত সাইবার নিরাপত্তা ও গুরুত্বপূর্ণ ঝুঁকির তথ্য পাবলিক পর্যবেক্ষকের জন্য বিচ্ছিন্ন রাখা হয়েছে।',
  },
  commandBlocks: {
    readiness: { en: 'National AI Readiness', bn: 'জাতীয় এআই প্রস্তুতি' },
    governance: { en: 'AI governance', bn: 'এআই গভর্নেন্স' },
    policy: { en: 'Policy', bn: 'নীতি' },
    regulatory: { en: 'Regulatory', bn: 'আইনি ও নিয়ন্ত্রক' },
    risk: { en: 'Risk', bn: 'ঝুঁকি' },
    infrastructure: { en: 'Infrastructure', bn: 'অবকাঠামো' },
    humanCapital: { en: 'Talent', bn: 'মানবসম্পদ' },
    research: { en: 'Research', bn: 'গবেষণা' },
    publicSector: { en: 'Public sector AI', bn: 'সরকারি খাতে এআই' },
    programme: { en: 'Action plan progress', bn: 'কর্মসূচির অগ্রগতি' },
    globalPosition: { en: 'Global AI position', bn: 'বৈশ্বিক এআই অবস্থান' },
    alerts: { en: 'Alerts', bn: 'সতর্কবার্তা' },
  },
  actions: {
    save: { en: 'Save', bn: 'সংরক্ষণ' },
    submit: { en: 'Submit', bn: 'জমা দিন' },
    approve: { en: 'Approve', bn: 'অনুমোদন' },
    returnRevision: { en: 'Return for revision', bn: 'সংশোধনের জন্য ফেরত' },
    exportPdf: { en: 'Export PDF', bn: 'পিডিএফ রপ্তানি' },
    exportExcel: { en: 'Export Excel', bn: 'এক্সেল রপ্তানি' },
    askCopilot: { en: 'AI Copilot', bn: 'এআই কোপাইলট' },
    all: { en: 'All', bn: 'সকল' },
    close: { en: 'Close', bn: 'বন্ধ করুন' },
  },
};
