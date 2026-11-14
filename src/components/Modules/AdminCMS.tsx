import React, { useMemo, useState } from 'react';
import {
  Check,
  Edit3,
  MessageSquare,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { MODULES_REGISTRY, ROLES_CONFIG } from '../../data/modulesRegistry';
import { useGovernance } from '../../store/GovernanceContext';
import {
  ConsultationSubmission,
  CountryCode,
  CountryDataset,
  DatasetCollectionKey,
  WorkflowApprovalItem,
} from '../../types/os';
import { formatEditorialDate, formatNumberForLocale } from '../../utils/formatters';
import { AdminBulkOperation, AdminDataTable } from '../Common/AdminDataTable';
import {
  Button,
  FormField,
  INPUT_BASE_CLASS,
  ModuleHeader,
  ModuleSubNav,
  ResponsiveSheet,
  SectionCard,
  StatusLabel,
} from '../Common/Primitives';

interface FieldSchema {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'boolean' | 'tags';
  options?: Array<string | number>;
  required?: boolean;
  min?: number;
  max?: number;
}

interface CollectionConfig {
  key: DatasetCollectionKey;
  labelEn: string;
  labelBn: string;
  moduleRef: string;
  getTitle: (row: Record<string, unknown>) => string;
  getMeta: (row: Record<string, unknown>) => string;
  getStatus?: (row: Record<string, unknown>) => string;
  createDefault: (countryCode: CountryCode, dataset: CountryDataset) => Record<string, unknown>;
  fields: FieldSchema[];
}

const COLLECTION_CONFIGS: CollectionConfig[] = [
  {
    key: 'policies',
    labelEn: 'Policies (Module 03)',
    labelBn: 'নীতিমালা (মডিউল ০৩)',
    moduleRef: 'Module 03',
    getTitle: (r) => `${String(r.code || '')} · ${String(r.title || '')}`,
    getMeta: (r) => `${String(r.stage || '')} · ${String(r.progressPct ?? 0)}% · ${String(r.gapCount ?? 0)} gaps`,
    getStatus: (r) => String(r.stage || 'Drafting'),
    createDefault: (cc, ds) => ({
      id: `pol-${Date.now()}`,
      countryCode: cc,
      code: `POL-${cc}-${String(ds.policies.length + 1).padStart(2, '0')}`,
      title: '',
      stage: 'Drafting',
      progressPct: 25,
      ownerInstitutionId: ds.institutions[0]?.id || '',
      gapCount: 1,
      gapSummary: '',
      recommendations: ['Establish inter-ministerial review'],
      targetDate: '2026-12-31',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'code', label: 'Policy code', type: 'text', required: true },
      { key: 'title', label: 'Policy title', type: 'text', required: true },
      {
        key: 'stage',
        label: 'Lifecycle stage',
        type: 'select',
        options: [
          'Drafting',
          'Inter-Ministerial Review',
          'Public Consultation',
          'Cabinet Approval',
          'Enacted',
          'Flagged',
          'Archived',
        ],
      },
      { key: 'progressPct', label: 'Progress (%)', type: 'number', min: 0, max: 100 },
      { key: 'gapCount', label: 'Identified gaps', type: 'number', min: 0, max: 50 },
      { key: 'gapSummary', label: 'Gap summary', type: 'textarea' },
      { key: 'recommendations', label: 'Recommendations (comma separated)', type: 'tags' },
      { key: 'targetDate', label: 'Target date (YYYY-MM-DD)', type: 'text' },
    ],
  },
  {
    key: 'laws',
    labelEn: 'Laws & Regulations (Module 04)',
    labelBn: 'আইন ও নিয়ন্ত্রণ (মডিউল ০৪)',
    moduleRef: 'Module 04',
    getTitle: (r) => String(r.title || ''),
    getMeta: (r) => `${String(r.instrumentType || '')} · ${String(r.complianceRatePct ?? 0)}% compliance`,
    getStatus: (r) => String(r.status || ''),
    createDefault: (cc, ds) => ({
      id: `law-${Date.now()}`,
      countryCode: cc,
      title: '',
      jurisdiction: ds.country.nameEn,
      instrumentType: 'Regulation',
      status: 'Draft Regulation',
      complianceRatePct: 50,
      gapSeverity: 'Moderate',
      comparableInternationalLaw: 'EU AI Act / OECD Principles',
      institutionId: ds.institutions[0]?.id || '',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'title', label: 'Statute / Regulation title', type: 'text', required: true },
      { key: 'jurisdiction', label: 'Jurisdiction', type: 'text' },
      { key: 'instrumentType', label: 'Instrument type', type: 'select', options: ['Statute', 'Regulation', 'Executive Directive', 'Technical Standard'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Enacted', 'Parliamentary Bill', 'Draft Regulation', 'Gap Identified'] },
      { key: 'complianceRatePct', label: 'Compliance rate (%)', type: 'number', min: 0, max: 100 },
      { key: 'gapSeverity', label: 'Gap severity', type: 'select', options: ['Low', 'Moderate', 'High'] },
      { key: 'comparableInternationalLaw', label: 'Comparable international law', type: 'text' },
    ],
  },
  {
    key: 'watchSignals',
    labelEn: 'Watch Signals & Alerts (Module 01)',
    labelBn: 'সতর্কবার্তা ও সংকেত (মডিউল ০১)',
    moduleRef: 'Module 01',
    getTitle: (r) => String(r.title || ''),
    getMeta: (r) => `${String(r.category || '')} · ${String(r.source || '')} · ${String(r.publishedAt || '')}`,
    getStatus: (r) => String(r.severity || 'Moderate'),
    createDefault: (cc, ds) => ({
      id: `ws-${Date.now()}`,
      countryCode: cc,
      category: 'early_warning',
      title: '',
      source: 'National AI Intelligence Desk',
      publishedAt: new Date().toISOString().slice(0, 10),
      severity: 'High',
      summary: '',
      evidenceId: ds.evidence[0]?.id || '',
      status: 'Active Alert',
    }),
    fields: [
      { key: 'title', label: 'Signal headline', type: 'text', required: true },
      {
        key: 'category',
        label: 'Category',
        type: 'select',
        options: ['national', 'global', 'news', 'policy', 'regulation', 'research', 'investment', 'company', 'incident', 'deepfake', 'safety', 'early_warning'],
      },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Moderate', 'Informational'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Active Alert', 'Under Review', 'Escalated to Risk', 'Resolved'] },
      { key: 'source', label: 'Source', type: 'text' },
      { key: 'publishedAt', label: 'Published date', type: 'text' },
      { key: 'summary', label: 'Summary', type: 'textarea', required: true },
    ],
  },
  {
    key: 'readinessDimensions',
    labelEn: 'Readiness Indicators (Module 02)',
    labelBn: 'প্রস্তুতি সূচকসমূহ (মডিউল ০২)',
    moduleRef: 'Module 02',
    getTitle: (r) => `${String(r.indicatorCode || '')} · ${String(r.name || '')}`,
    getMeta: (r) => `${String(r.pillar || '')} · Score ${String(r.score ?? 0)} / Target ${String(r.target ?? 80)}`,
    createDefault: (cc, ds) => ({
      id: `rd-${Date.now()}`,
      countryCode: cc,
      pillar: 'Institutional',
      indicatorCode: `IND-${cc}-${ds.readinessDimensions.length + 1}`,
      name: '',
      score: 50,
      target: 80,
      trendDelta: 3.5,
      institutionId: ds.institutions[0]?.id || '',
      evidenceId: ds.evidence[0]?.id || '',
      lastAssessed: new Date().toISOString().slice(0, 10),
    }),
    fields: [
      { key: 'indicatorCode', label: 'Indicator code', type: 'text', required: true },
      { key: 'name', label: 'Indicator name', type: 'text', required: true },
      { key: 'pillar', label: 'Pillar', type: 'select', options: ['Institutional', 'Infrastructure', 'Human Capital', 'Responsible AI'] },
      { key: 'score', label: 'Current score (0–100)', type: 'number', min: 0, max: 100 },
      { key: 'target', label: 'Target score', type: 'number', min: 0, max: 100 },
      { key: 'trendDelta', label: 'YoY delta', type: 'number', min: -50, max: 50 },
      { key: 'lastAssessed', label: 'Last assessed', type: 'text' },
    ],
  },
  {
    key: 'readinessQuestions',
    labelEn: 'Readiness Audits (Module 02)',
    labelBn: 'প্রস্তুতি নিরীক্ষা প্রশ্ন (মডিউল ০২)',
    moduleRef: 'Module 02',
    getTitle: (r) => String(r.question || ''),
    getMeta: (r) => `${String(r.pillar || '')} · Level L${String(r.maturityLevel ?? 1)}`,
    createDefault: (cc, ds) => ({
      id: `rq-${Date.now()}`,
      countryCode: cc,
      pillar: 'Institutional',
      question: '',
      maturityLevel: 3,
      evidenceNote: '',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'pillar', label: 'Pillar', type: 'select', options: ['Institutional', 'Infrastructure', 'Human Capital', 'Responsible AI'] },
      { key: 'question', label: 'Audit question', type: 'textarea', required: true },
      { key: 'maturityLevel', label: 'Maturity level (1–5)', type: 'select', options: [1, 2, 3, 4, 5] },
      { key: 'evidenceNote', label: 'Evidence note', type: 'text' },
    ],
  },
  {
    key: 'risks',
    labelEn: 'AI Risk Register (Module 06)',
    labelBn: 'এআই ঝুঁকি নিবন্ধন (মডিউল ০৬)',
    moduleRef: 'Module 06',
    getTitle: (r) => `${String(r.code || '')} · ${String(r.title || '')}`,
    getMeta: (r) => `${String(r.classification || '')} · Score ${Number(r.likelihood || 1) * Number(r.impact || 1)}/25`,
    getStatus: (r) => String(r.status || 'Open'),
    createDefault: (cc, ds) => ({
      id: `risk-${Date.now()}`,
      countryCode: cc,
      code: `RSK-${cc}-${String(ds.risks.length + 1).padStart(2, '0')}`,
      title: '',
      classification: 'Algorithmic Bias',
      likelihood: 3,
      impact: 4,
      status: 'Open',
      mitigationPlan: '',
      ownerInstitutionId: ds.institutions[0]?.id || '',
      evidenceId: ds.evidence[0]?.id || '',
      restricted: false,
    }),
    fields: [
      { key: 'code', label: 'Risk code', type: 'text', required: true },
      { key: 'title', label: 'Risk title', type: 'text', required: true },
      {
        key: 'classification',
        label: 'Classification',
        type: 'select',
        options: ['Algorithmic Bias', 'Cyber & Model Security', 'Privacy & Data', 'Disinformation & Deepfake', 'Labour & Socioeconomic', 'Critical Infrastructure'],
      },
      { key: 'likelihood', label: 'Likelihood (1–5)', type: 'select', options: [1, 2, 3, 4, 5] },
      { key: 'impact', label: 'Impact (1–5)', type: 'select', options: [1, 2, 3, 4, 5] },
      { key: 'status', label: 'Status', type: 'select', options: ['Open', 'Mitigating', 'Monitored', 'Controlled'] },
      { key: 'mitigationPlan', label: 'Mitigation plan', type: 'textarea', required: true },
      { key: 'restricted', label: 'Restricted security record', type: 'boolean' },
    ],
  },
  {
    key: 'institutions',
    labelEn: 'Institutions (Module 05)',
    labelBn: 'দায়িত্বপ্রাপ্ত সংস্থাসমূহ (মডিউল ০৫)',
    moduleRef: 'Module 05',
    getTitle: (r) => `${String(r.shortCode || '')} · ${String(r.name || '')}`,
    getMeta: (r) => `${String(r.tier || '')} · Accountability ${String(r.accountabilityScore ?? 0)}%`,
    createDefault: (cc, ds) => ({
      id: `inst-${Date.now()}`,
      countryCode: cc,
      name: '',
      shortCode: 'INST',
      tier: 'Implementing Agency',
      mandate: '',
      accountabilityScore: 70,
      focalOfficer: '',
      coordinatingWith: [],
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'shortCode', label: 'Short code', type: 'text', required: true },
      { key: 'name', label: 'Institution name', type: 'text', required: true },
      { key: 'tier', label: 'Governance tier', type: 'select', options: ['Apex Council', 'Lead Ministry', 'Regulatory Body', 'Research Centre', 'Implementing Agency'] },
      { key: 'accountabilityScore', label: 'Accountability score (%)', type: 'number', min: 0, max: 100 },
      { key: 'focalOfficer', label: 'Focal officer', type: 'text' },
      { key: 'mandate', label: 'Mandate', type: 'textarea' },
    ],
  },
  {
    key: 'responsibleMetrics',
    labelEn: 'Responsible AI Metrics (Module 07)',
    labelBn: 'দায়িত্বশীল এআই সূচক (মডিউল ০৭)',
    moduleRef: 'Module 07',
    getTitle: (r) => `${String(r.principle || '')} · ${String(r.guidelineTitle || '')}`,
    getMeta: (r) => `Compliance ${String(r.complianceScore ?? 0)}% · ${String(r.auditedSystems ?? 0)} audited systems`,
    createDefault: (cc, ds) => ({
      id: `rai-${Date.now()}`,
      countryCode: cc,
      principle: 'Transparency',
      complianceScore: 65,
      auditedSystems: 12,
      guidelineTitle: '',
      keyControl: '',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'principle', label: 'Principle', type: 'select', options: ['Fairness', 'Transparency', 'Explainability', 'Accountability', 'Human Oversight'] },
      { key: 'guidelineTitle', label: 'Guideline title', type: 'text', required: true },
      { key: 'complianceScore', label: 'Compliance score (%)', type: 'number', min: 0, max: 100 },
      { key: 'auditedSystems', label: 'Audited systems', type: 'number', min: 0, max: 1000 },
      { key: 'keyControl', label: 'Key control', type: 'textarea' },
    ],
  },
  {
    key: 'impactAssessments',
    labelEn: 'Impact Assessments (Module 08)',
    labelBn: 'প্রভাব মূল্যায়ন (মডিউল ০৮)',
    moduleRef: 'Module 08',
    getTitle: (r) => String(r.systemName || ''),
    getMeta: (r) => `${String(r.domain || '')} · ${String(r.riskTier || '')} risk · Score ${String(r.overallImpactScore ?? 0)}`,
    getStatus: (r) => String(r.status || 'Pending Review'),
    createDefault: (cc, ds) => ({
      id: `imp-${Date.now()}`,
      countryCode: cc,
      systemName: '',
      domain: 'AI General',
      ministryOrOwner: '',
      overallImpactScore: 72,
      riskTier: 'Limited',
      humanRightsScore: 75,
      socialScore: 74,
      environmentalScore: 70,
      ethicalScore: 73,
      status: 'Pending Review',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'systemName', label: 'AI system name', type: 'text', required: true },
      { key: 'ministryOrOwner', label: 'Ministry / Owner', type: 'text', required: true },
      { key: 'domain', label: 'Assessment domain', type: 'select', options: ['AI General', 'Human Rights', 'Social', 'Environmental', 'Ethical'] },
      { key: 'riskTier', label: 'Risk tier', type: 'select', options: ['Low', 'Limited', 'High', 'Unacceptable'] },
      { key: 'status', label: 'Status', type: 'select', options: ['Approved', 'Conditional', 'Pending Review'] },
      { key: 'overallImpactScore', label: 'Overall impact score', type: 'number', min: 0, max: 100 },
    ],
  },
  {
    key: 'dataAssets',
    labelEn: 'Data Governance (Module 09)',
    labelBn: 'ডেটা গভর্নেন্স (মডিউল ০৯)',
    moduleRef: 'Module 09',
    getTitle: (r) => String(r.name || ''),
    getMeta: (r) => `${String(r.category || '')} · Quality ${String(r.qualityScore ?? 0)}% · ${String(r.accessTier || '')}`,
    getStatus: (r) => String(r.complianceStatus || ''),
    createDefault: (cc, ds) => ({
      id: `dat-${Date.now()}`,
      countryCode: cc,
      name: '',
      category: 'Data Policy',
      custodianInstitutionId: ds.institutions[0]?.id || '',
      qualityScore: 75,
      protectionStandard: 'National Data Protection Framework',
      accessTier: 'Controlled Research',
      complianceStatus: 'Compliant',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'name', label: 'Data asset / standard name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Data Policy', 'Data Quality', 'Data Protection', 'Data Infrastructure', 'Access Governance'] },
      { key: 'qualityScore', label: 'Quality score (%)', type: 'number', min: 0, max: 100 },
      { key: 'protectionStandard', label: 'Protection standard', type: 'text' },
      { key: 'accessTier', label: 'Access tier', type: 'select', options: ['Open Public', 'Controlled Research', 'Sovereign Restricted'] },
      { key: 'complianceStatus', label: 'Compliance status', type: 'select', options: ['Compliant', 'Remediation Needed', 'Under Audit'] },
    ],
  },
  {
    key: 'infrastructure',
    labelEn: 'AI Infrastructure (Module 10)',
    labelBn: 'এআই অবকাঠামো (মডিউল ১০)',
    moduleRef: 'Module 10',
    getTitle: (r) => String(r.name || ''),
    getMeta: (r) => `${String(r.category || '')} · ${String(r.capacitySpec || '')} · ${String(r.utilizationPct ?? 0)}% used`,
    getStatus: (r) => String(r.status || ''),
    createDefault: (cc, ds) => ({
      id: `inf-${Date.now()}`,
      countryCode: cc,
      name: '',
      category: 'Compute',
      capacitySpec: '',
      utilizationPct: 60,
      sovereignHosted: true,
      location: ds.country.nameEn,
      status: 'Operational',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'name', label: 'Asset name', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Compute', 'Cloud', 'Connectivity', 'Data Centre'] },
      { key: 'capacitySpec', label: 'Capacity specification', type: 'text' },
      { key: 'utilizationPct', label: 'Utilization (%)', type: 'number', min: 0, max: 100 },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['Operational', 'Expanding', 'Planned'] },
      { key: 'sovereignHosted', label: 'Sovereign hosted', type: 'boolean' },
    ],
  },
  {
    key: 'humanCapital',
    labelEn: 'Human Capital (Module 11)',
    labelBn: 'মানবসম্পদ (মডিউল ১১)',
    moduleRef: 'Module 11',
    getTitle: (r) => String(r.title || ''),
    getMeta: (r) => `${String(r.category || '')} · ${String(r.enrolledOrTrained ?? 0)} trained (${String(r.completionPct ?? 0)}%)`,
    createDefault: (cc, ds) => ({
      id: `hc-${Date.now()}`,
      countryCode: cc,
      title: '',
      category: 'Training Programme',
      leadInstitution: ds.institutions[0]?.name || '',
      enrolledOrTrained: 500,
      targetCohort: 1000,
      completionPct: 50,
      skillTier: 'Applied Engineering',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'title', label: 'Programme title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Skills Assessment', 'Talent Database', 'AI Education', 'Training Programme', 'Workforce Development'] },
      { key: 'leadInstitution', label: 'Lead institution', type: 'text' },
      { key: 'enrolledOrTrained', label: 'Enrolled / Trained', type: 'number', min: 0, max: 1000000 },
      { key: 'targetCohort', label: 'Target cohort', type: 'number', min: 0, max: 1000000 },
      { key: 'completionPct', label: 'Completion (%)', type: 'number', min: 0, max: 100 },
      { key: 'skillTier', label: 'Skill tier', type: 'select', options: ['Foundational', 'Applied Engineering', 'Frontier Research', 'Executive Governance'] },
    ],
  },
  {
    key: 'researchItems',
    labelEn: 'Research & Innovation (Module 12)',
    labelBn: 'গবেষণা ও উদ্ভাবন (মডিউল ১২)',
    moduleRef: 'Module 12',
    getTitle: (r) => String(r.title || ''),
    getMeta: (r) => `${String(r.category || '')} · ${String(r.organization || '')} · $${Number(r.fundingAmountUSD || 0).toLocaleString()}`,
    createDefault: (cc, ds) => ({
      id: `res-${Date.now()}`,
      countryCode: cc,
      title: '',
      category: 'Innovation Project',
      organization: '',
      focusArea: '',
      fundingAmountUSD: 250000,
      trlOrStage: 'TRL 5',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'category', label: 'Category', type: 'select', options: ['Research Publication', 'Institution', 'Innovation Project', 'Funding Grant', 'Startup'] },
      { key: 'organization', label: 'Organization', type: 'text' },
      { key: 'focusArea', label: 'Focus area', type: 'text' },
      { key: 'fundingAmountUSD', label: 'Funding (USD)', type: 'number', min: 0 },
      { key: 'trlOrStage', label: 'TRL / Stage', type: 'text' },
    ],
  },
  {
    key: 'economyItems',
    labelEn: 'AI Economy & Market (Module 13)',
    labelBn: 'এআই অর্থনীতি (মডিউল ১৩)',
    moduleRef: 'Module 13',
    getTitle: (r) => String(r.sector || ''),
    getMeta: (r) => `Adoption ${String(r.aiAdoptionPct ?? 0)}% · $${String(r.investmentUSD_M ?? 0)}M · ${String(r.activeFirms ?? 0)} firms`,
    createDefault: (cc, ds) => ({
      id: `eco-${Date.now()}`,
      countryCode: cc,
      sector: '',
      aiAdoptionPct: 18,
      activeFirms: 35,
      investmentUSD_M: 12.5,
      jobsImpactedOrCreated: 4200,
      projectedGdpImpactPct: 0.4,
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'sector', label: 'Industry sector', type: 'text', required: true },
      { key: 'aiAdoptionPct', label: 'AI adoption (%)', type: 'number', min: 0, max: 100 },
      { key: 'activeFirms', label: 'Active firms', type: 'number', min: 0 },
      { key: 'investmentUSD_M', label: 'Investment ($M)', type: 'number', min: 0 },
      { key: 'jobsImpactedOrCreated', label: 'Jobs impacted/created', type: 'number', min: 0 },
      { key: 'projectedGdpImpactPct', label: 'Projected GDP impact (%)', type: 'number', min: 0 },
    ],
  },
  {
    key: 'publicProjects',
    labelEn: 'Public Sector AI Projects (Module 14)',
    labelBn: 'সরকারি এআই প্রকল্প (মডিউল ১৪)',
    moduleRef: 'Module 14',
    getTitle: (r) => `${String(r.registryCode || '')} · ${String(r.title || '')}`,
    getMeta: (r) => `${String(r.ministry || '')} · ${String(r.stage || '')} · ${String(r.beneficiariesK ?? 0)}K citizens`,
    getStatus: (r) => String(r.stage || ''),
    createDefault: (cc, ds) => ({
      id: `pub-${Date.now()}`,
      countryCode: cc,
      registryCode: `GOV-AI-${String(ds.publicProjects.length + 1).padStart(3, '0')}`,
      title: '',
      ministry: '',
      serviceDomain: '',
      stage: 'Discovery',
      procurementCompliant: true,
      beneficiariesK: 100,
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'registryCode', label: 'Registry code', type: 'text', required: true },
      { key: 'title', label: 'Project title', type: 'text', required: true },
      { key: 'ministry', label: 'Ministry', type: 'text', required: true },
      { key: 'serviceDomain', label: 'Service domain', type: 'text' },
      { key: 'stage', label: 'Stage', type: 'select', options: ['Discovery', 'Procurement', 'Pilot', 'Production'] },
      { key: 'beneficiariesK', label: 'Beneficiaries (thousands)', type: 'number', min: 0 },
      { key: 'procurementCompliant', label: 'Procurement compliant', type: 'boolean' },
    ],
  },
  {
    key: 'safetyIncidents',
    labelEn: 'Safety & Cyber Incidents (Module 15)',
    labelBn: 'নিরাপত্তা ও সাইবার ঘটনা (মডিউল ১৫)',
    moduleRef: 'Module 15',
    getTitle: (r) => `${String(r.code || '')} · ${String(r.title || '')}`,
    getMeta: (r) => `${String(r.type || '')} · ${String(r.affectedSystem || '')} · ${String(r.reportedDate || '')}`,
    getStatus: (r) => String(r.resolutionStatus || ''),
    createDefault: (cc, ds) => ({
      id: `saf-${Date.now()}`,
      countryCode: cc,
      code: `INC-${cc}-${String(ds.safetyIncidents.length + 1).padStart(2, '0')}`,
      title: '',
      type: 'Live Incident',
      severity: 'High',
      affectedSystem: '',
      reportedDate: new Date().toISOString().slice(0, 10),
      resolutionStatus: 'Investigating',
      evidenceId: ds.evidence[0]?.id || '',
      restricted: false,
    }),
    fields: [
      { key: 'code', label: 'Incident code', type: 'text', required: true },
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'type', label: 'Type', type: 'select', options: ['Safety Benchmark', 'Cyber Threat', 'Model Vulnerability', 'Live Incident', 'Standard Compliance'] },
      { key: 'severity', label: 'Severity', type: 'select', options: ['Critical', 'High', 'Medium', 'Low'] },
      { key: 'affectedSystem', label: 'Affected system', type: 'text' },
      { key: 'resolutionStatus', label: 'Resolution status', type: 'select', options: ['Investigating', 'Containment Active', 'Patched', 'Verified', 'Flagged', 'Archived'] },
      { key: 'reportedDate', label: 'Reported date', type: 'text' },
      { key: 'restricted', label: 'Restricted security record', type: 'boolean' },
    ],
  },
  {
    key: 'stakeholders',
    labelEn: 'Stakeholders (Module 17)',
    labelBn: 'অংশীজন ডিরেক্টরি (মডিউল ১৭)',
    moduleRef: 'Module 17',
    getTitle: (r) => String(r.name || ''),
    getMeta: (r) => `${String(r.sector || '')} · ${String(r.engagementStatus || '')}`,
    getStatus: (r) => String(r.engagementStatus || ''),
    createDefault: (cc, ds) => ({
      id: `stk-${Date.now()}`,
      countryCode: cc,
      name: '',
      sector: 'Civil Society',
      roleInEcosystem: '',
      focalContact: '',
      engagementStatus: 'Working Group',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'name', label: 'Organization name', type: 'text', required: true },
      { key: 'sector', label: 'Sector', type: 'select', options: ['Government', 'Private Sector', 'Academia', 'Civil Society'] },
      { key: 'roleInEcosystem', label: 'Role in ecosystem', type: 'textarea' },
      { key: 'focalContact', label: 'Focal contact', type: 'text' },
      { key: 'engagementStatus', label: 'Engagement status', type: 'select', options: ['Active Council Member', 'Working Group', 'Consultative Partner'] },
    ],
  },
  {
    key: 'milestones',
    labelEn: 'Action Plan Milestones (Module 18)',
    labelBn: 'কর্মপরিকল্পনা মাইলফলক (মডিউল ১৮)',
    moduleRef: 'Module 18',
    getTitle: (r) => `${String(r.code || '')} · ${String(r.milestoneTitle || '')}`,
    getMeta: (r) => `${String(r.programme || '')} · ${String(r.dueQuarter || '')} · ${String(r.progressPct ?? 0)}%`,
    getStatus: (r) => String(r.status || ''),
    createDefault: (cc, ds) => ({
      id: `ms-${Date.now()}`,
      countryCode: cc,
      code: `MS-${cc}-${String(ds.milestones.length + 1).padStart(2, '0')}`,
      programme: 'National AI Programme',
      milestoneTitle: '',
      ownerInstitutionId: ds.institutions[0]?.id || '',
      dueQuarter: 'Q4 2026',
      kpiTarget: '',
      progressPct: 40,
      status: 'On Track',
      evidenceId: ds.evidence[0]?.id || '',
    }),
    fields: [
      { key: 'code', label: 'Code', type: 'text', required: true },
      { key: 'milestoneTitle', label: 'Milestone title', type: 'text', required: true },
      { key: 'programme', label: 'Programme', type: 'text' },
      { key: 'dueQuarter', label: 'Due quarter', type: 'text' },
      { key: 'kpiTarget', label: 'KPI target', type: 'text' },
      { key: 'progressPct', label: 'Progress (%)', type: 'number', min: 0, max: 100 },
      { key: 'status', label: 'Status', type: 'select', options: ['On Track', 'At Risk', 'Completed', 'Delayed'] },
    ],
  },
  {
    key: 'evidence',
    labelEn: 'Evidence Registry (All Modules)',
    labelBn: 'প্রমাণ ও নথি নিবন্ধন (সকল মডিউল)',
    moduleRef: 'Evidence',
    getTitle: (r) => `${String(r.documentRef || '')} · ${String(r.title || '')}`,
    getMeta: (r) => `${String(r.sourceName || '')} · ${String(r.verifiedDate || '')}`,
    getStatus: (r) => String(r.confidence || ''),
    createDefault: (cc, ds) => ({
      id: `ev-${cc.toLowerCase()}-${Date.now()}`,
      countryCode: cc,
      title: '',
      sourceInstitutionId: ds.institutions[0]?.id || '',
      sourceName: ds.institutions[0]?.name || 'National AI Secretariat',
      documentRef: `REF-${cc}-${String(ds.evidence.length + 1).padStart(2, '0')}`,
      verifiedDate: new Date().toISOString().slice(0, 10),
      confidence: 'Verified Primary',
      linkedModule: 'm03',
      summary: '',
    }),
    fields: [
      { key: 'documentRef', label: 'Document reference ID', type: 'text', required: true },
      { key: 'title', label: 'Document title', type: 'text', required: true },
      { key: 'sourceName', label: 'Source institution', type: 'text' },
      { key: 'verifiedDate', label: 'Verified date', type: 'text' },
      { key: 'confidence', label: 'Confidence level', type: 'select', options: ['Verified Primary', 'Peer Reviewed', 'Official Registry', 'Automated Signal'] },
      { key: 'summary', label: 'Summary', type: 'textarea' },
    ],
  },
];

function buildDeterministicAnalysis(
  sub: ConsultationSubmission,
  policyTitle: string,
  isBn: boolean
): {
  priority: 'Urgent' | 'High' | 'Standard';
  disposition: ConsultationSubmission['disposition'];
  analysisNote: string;
  adminReply: string;
} {
  const lower = sub.comment.toLowerCase();
  const urgentKeywords = ['urgent', 'critical', 'violation', 'privacy', 'breach', 'rights', 'bias', 'deepfake', 'harm', 'audit'];
  const highKeywords = ['procurement', 'mandatory', 'oversight', 'transparency', 'law', 'regulation', 'bangla', 'disclosure'];

  const isUrgent = urgentKeywords.some((k) => lower.includes(k));
  const isHigh = !isUrgent && (highKeywords.some((k) => lower.includes(k)) || sub.sector === 'Civil Society' || sub.sector === 'Academia');
  const priority: 'Urgent' | 'High' | 'Standard' = isUrgent ? 'Urgent' : isHigh ? 'High' : 'Standard';
  const disposition: ConsultationSubmission['disposition'] = isUrgent || isHigh ? 'Accepted' : 'Under Review';

  if (isBn) {
    return {
      priority,
      disposition,
      analysisNote: `${sub.sector} খাত থেকে প্রাপ্ত মতামত "${policyTitle}"-এর স্বচ্ছতা, ঝুঁকি প্রশমন ও জবাবদিহিতা কাঠামোর সাথে প্রাসঙ্গিক। অগ্রাধিকার স্তর: ${priority} — নীতি খসড়া ও প্রভাব মূল্যায়ন সেলের পর্যালোচনার জন্য সুপারিশকৃত।`,
      adminReply: `প্রিয় ${sub.respondentName}, "${policyTitle}" বিষয়ে আপনার মূল্যবান মতামতের জন্য ধন্যবাদ। আপনার প্রস্তাবনাটি নীতি বিশ্লেষণ টিমের মাধ্যমে যাচাই করা হয়েছে এবং পরবর্তী খসড়া হালনাগাদ ও আন্তঃমন্ত্রণালয় পর্যালোচনায় অন্তর্ভুক্তির জন্য সংরক্ষিত হয়েছে।`,
    };
  }

  return {
    priority,
    disposition,
    analysisNote: `Submission from ${sub.sector} directly addresses governance controls and safeguard clarity for "${policyTitle}". Assessed as ${priority} priority for incorporation into policy clause revision and pre-deployment compliance criteria.`,
    adminReply: `Thank you, ${sub.respondentName}, for your submission regarding "${policyTitle}". Our Governance Triage Team has reviewed your recommendation and routed it to the Policy Drafting & Regulatory Alignment Working Group for formal consideration in the next revision cycle.`,
  };
}

export const AdminCMS: React.FC = () => {
  const {
    dataset,
    countryCode,
    setCountryCode,
    role,
    language,
    activeSubTab,
    navigateTo,
    processApproval,
    upsertRecord,
    deleteRecord,
    analyzeAndReplyConsultation,
    updateCountryProfile,
    resetAllDataToSeed,
    bulkUpdateCollectionStatus,
    bulkDeleteRecords,
    bulkProcessApprovals,
    showToast,
    isAdmin,
    authUser,
    setAuthModalMode,
  } = useGovernance();

  const isBn = language === 'bn';
  const mod = MODULES_REGISTRY.find((m) => m.id === 'admin')!;

  // Tab 1: Approvals CMS state
  const [editingApproval, setEditingApproval] = useState<WorkflowApprovalItem | null>(null);
  const [confirmDeleteApproval, setConfirmDeleteApproval] = useState<WorkflowApprovalItem | null>(null);

  // Tab 2: Public Submissions Analysis & Reply state
  const [submissionFilter, setSubmissionFilter] = useState<string>('ALL');
  const [activeSubmission, setActiveSubmission] = useState<ConsultationSubmission | null>(null);
  const [subPriority, setSubPriority] = useState<'Urgent' | 'High' | 'Standard'>('High');
  const [subDisposition, setSubDisposition] = useState<ConsultationSubmission['disposition']>('Under Review');
  const [subAnalysis, setSubAnalysis] = useState('');
  const [subReply, setSubReply] = useState('');
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [confirmDeleteSubmission, setConfirmDeleteSubmission] = useState<ConsultationSubmission | null>(null);
  const [addingPublicSub, setAddingPublicSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubSector, setNewSubSector] = useState<ConsultationSubmission['sector']>('Citizen');
  const [newSubPolicyId, setNewSubPolicyId] = useState(dataset.policies[0]?.id || '');
  const [newSubComment, setNewSubComment] = useState('');

  // Tab 3: Full System Content CRUD state
  const [selectedCollectionKey, setSelectedCollectionKey] = useState<DatasetCollectionKey>('policies');
  const [editingRecord, setEditingRecord] = useState<Record<string, unknown> | null>(null);
  const [confirmDeleteRecord, setConfirmDeleteRecord] = useState<Record<string, unknown> | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState<{
    collection: DatasetCollectionKey;
    ids: string[];
    clearSelection: () => void;
  } | null>(null);

  // Tab 4: Country Profile & Reset state
  const [profileForm, setProfileForm] = useState(dataset.country);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  React.useEffect(() => {
    setProfileForm(dataset.country);
  }, [dataset.country]);

  const activeConfig = useMemo(
    () => COLLECTION_CONFIGS.find((c) => c.key === selectedCollectionKey) || COLLECTION_CONFIGS[0],
    [selectedCollectionKey]
  );

  const activeStatusField = useMemo(() => {
    const preferredKeys = ['stage', 'resolutionStatus', 'status', 'disposition', 'engagementStatus', 'confidence'];
    return activeConfig.fields.find(
      (f) => f.type === 'select' && preferredKeys.includes(f.key) && Array.isArray(f.options)
    );
  }, [activeConfig]);

  const collectionRows = (dataset[activeConfig.key] as unknown as Array<Record<string, unknown>>) || [];

  const cmsBulkOperations = useMemo<AdminBulkOperation[]>(() => {
    const deleteOp: AdminBulkOperation = {
      key: `bulk-delete-${activeConfig.key}`,
      label: isBn ? 'নির্বাচিত ডিলিট করুন' : 'Delete Selected',
      tone: 'danger',
      dividerBefore: true,
      onExecute: (ids, clear) =>
        setConfirmBulkDelete({
          collection: activeConfig.key,
          ids,
          clearSelection: clear,
        }),
    };

    if (activeConfig.key === 'policies') {
      return [
        {
          key: 'policies-approve-all',
          label: isBn ? 'সব অনুমোদন (Enacted)' : 'Approve All',
          description: isBn
            ? 'নির্বাচিত নীতি খসড়াগুলোকে Enacted (১০০%) হিসেবে চিহ্নিত করুন'
            : 'Mark selected policy drafts as Enacted (100%)',
          tone: 'positive',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('policies', ids, 'stage', 'Enacted');
            clear();
          },
        },
        {
          key: 'policies-cabinet-approval',
          label: isBn ? 'ক্যাবিনেট অনুমোদনে পাঠান' : 'Move to Cabinet Approval',
          description: isBn
            ? 'নির্বাচিত নীতি খসড়াগুলোকে Cabinet Approval পর্যায়ে নিন'
            : 'Advance selected policy drafts to Cabinet Approval',
          tone: 'default',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('policies', ids, 'stage', 'Cabinet Approval');
            clear();
          },
        },
        {
          key: 'policies-flag',
          label: isBn ? 'ফ্ল্যাগ করুন (Flag)' : 'Flag Selected',
          description: isBn
            ? 'নিরীক্ষার জন্য নির্বাচিত নীতি খসড়া ফ্ল্যাগ করুন'
            : 'Flag selected policy drafts for governance audit',
          tone: 'warning',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('policies', ids, 'stage', 'Flagged');
            clear();
          },
        },
        {
          key: 'policies-archive',
          label: isBn ? 'আর্কাইভ করুন (Archive)' : 'Archive Selected',
          description: isBn
            ? 'নিষ্ক্রিয় বা পূর্ববর্তী নীতি খসড়াগুলো আর্কাইভ করুন'
            : 'Archive inactive or superseded policy drafts',
          tone: 'default',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('policies', ids, 'stage', 'Archived');
            clear();
          },
        },
        deleteOp,
      ];
    }

    if (activeConfig.key === 'safetyIncidents') {
      return [
        {
          key: 'incidents-approve-all',
          label: isBn ? 'সব অনুমোদন (Verified)' : 'Approve All',
          description: isBn
            ? 'নির্বাচিত ঘটনা প্রতিবেদনগুলো Verified হিসেবে চিহ্নিত করুন'
            : 'Mark selected incident reports as Verified',
          tone: 'positive',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('safetyIncidents', ids, 'resolutionStatus', 'Verified');
            clear();
          },
        },
        {
          key: 'incidents-patched',
          label: isBn ? 'প্যাচড চিহ্নিত করুন' : 'Mark Patched',
          description: isBn
            ? 'নির্বাচিত ঘটনাগুলোর সমাধান (Patched) নিশ্চিত করুন'
            : 'Mark selected incident reports as Patched',
          tone: 'positive',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('safetyIncidents', ids, 'resolutionStatus', 'Patched');
            clear();
          },
        },
        {
          key: 'incidents-flag',
          label: isBn ? 'ফ্ল্যাগ করুন (Flag)' : 'Flag Selected',
          description: isBn
            ? 'উচ্চতর পর্যালোচনার জন্য ঘটনা প্রতিবেদন ফ্ল্যাগ করুন'
            : 'Flag incident reports for escalation & review',
          tone: 'warning',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('safetyIncidents', ids, 'resolutionStatus', 'Flagged');
            clear();
          },
        },
        {
          key: 'incidents-archive',
          label: isBn ? 'আর্কাইভ করুন (Archive)' : 'Archive Selected',
          description: isBn
            ? 'বন্ধ বা সমাধানকৃত প্রতিবেদন আর্কাইভ করুন'
            : 'Archive resolved or closed incident reports',
          tone: 'default',
          onExecute: (ids, clear) => {
            bulkUpdateCollectionStatus('safetyIncidents', ids, 'resolutionStatus', 'Archived');
            clear();
          },
        },
        deleteOp,
      ];
    }

    const statusOps: AdminBulkOperation[] = (activeStatusField?.options || []).map((opt) => ({
      key: `status-${activeConfig.key}-${String(opt)}`,
      label: isBn ? `অবস্থা: ${String(opt)}` : `Set ${activeStatusField?.label}: ${String(opt)}`,
      tone: 'default',
      onExecute: (ids, clear) => {
        if (activeStatusField) {
          bulkUpdateCollectionStatus(activeConfig.key, ids, activeStatusField.key, String(opt));
        }
        clear();
      },
    }));

    return [...statusOps, deleteOp];
  }, [activeConfig.key, activeStatusField, bulkUpdateCollectionStatus, isBn]);

  const pendingApprovalsCount = dataset.approvals.filter((a) => a.status === 'Pending Approval').length;
  const unrepliedSubmissionsCount = dataset.consultations.filter((c) => !c.adminReply).length;

  const openSubmissionDrawer = (sub: ConsultationSubmission) => {
    setActiveSubmission(sub);
    setSubPriority(sub.priority || 'High');
    setSubDisposition(sub.disposition);
    setSubAnalysis(sub.analysisNote || '');
    setSubReply(sub.adminReply || '');
  };

  const handleAutoAnalyzeSubmission = async () => {
    if (!activeSubmission) return;
    setAnalyzingAi(true);
    const pol = dataset.policies.find((p) => p.id === activeSubmission.policyId);
    const policyTitle = pol ? `${pol.code} · ${pol.title}` : 'National AI Policy';

    try {
      const res = await fetch('/api/admin/analyze-submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-country-id': countryCode,
          'x-user-role': role,
        },
        body: JSON.stringify({
          respondentName: activeSubmission.respondentName,
          sector: activeSubmission.sector,
          policyTitle,
          comment: activeSubmission.comment,
          language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubPriority(data.priority || 'High');
        setSubDisposition(data.suggestedDisposition || 'Accepted');
        setSubAnalysis(data.analysis || '');
        setSubReply(data.draftReply || '');
        setAnalyzingAi(false);
        return;
      }
    } catch {
      // Fallback cleanly to built-in deterministic analysis
    }

    const fallback = buildDeterministicAnalysis(activeSubmission, policyTitle, isBn);
    setSubPriority(fallback.priority);
    setSubDisposition(fallback.disposition);
    setSubAnalysis(fallback.analysisNote);
    setSubReply(fallback.adminReply);
    setAnalyzingAi(false);
  };

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <ModuleHeader module={mod} readOnlyWarning />
        <SectionCard
          title={isBn ? '৪০৩ — অ্যাডমিন অ্যাক্সেস সংরক্ষিত' : '403 — Admin Access Required'}
          subtitle={
            isBn
              ? 'শুধুমাত্র অনুমোদিত অ্যাডমিন অ্যাকাউন্ট ব্যবহারকারীরা অ্যাডমিন সিএমএস দেখতে, অনুমোদন প্রক্রিয়া চালাতে এবং সিস্টেম ডেটা পরিবর্তন করতে পারবেন। সাধারণ ব্যবহারকারীদের জন্য কেবল পাঠযোগ্য (Read-Only) দৃশ্য উন্মুক্ত।'
              : 'Only authenticated users with the Admin role may view Admin CMS, process approvals, reply to public submissions, or modify system records. Standard users are restricted to read-only access.'
          }
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => setAuthModalMode('login')}>
              <span>{isBn ? 'অ্যাডমিন হিসেবে লগইন করুন' : 'Log in as Admin'}</span>
            </Button>
            <Button variant="secondary" onClick={() => navigateTo('command', 'overview')}>
              <span>{isBn ? 'সারসংক্ষেপে ফিরে যান' : 'Return to Overview'}</span>
            </Button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div>
      <ModuleHeader module={mod} />

      {/* Admin KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
          <div className="text-[13px] text-[var(--text-secondary)]">
            {isBn ? 'অপেক্ষমাণ অনুমোদন' : 'Pending approvals'}
          </div>
          <div className="font-mono text-[24px] font-semibold tabular-nums text-[var(--text-primary)] mt-1">
            {formatNumberForLocale(pendingApprovalsCount, language)}
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
          <div className="text-[13px] text-[var(--text-secondary)]">
            {isBn ? 'উত্তরবিহীন সাবমিশন' : 'Unreplied submissions'}
          </div>
          <div className="font-mono text-[24px] font-semibold tabular-nums text-[var(--text-primary)] mt-1">
            {formatNumberForLocale(unrepliedSubmissionsCount, language)}
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
          <div className="text-[13px] text-[var(--text-secondary)]">
            {isBn ? 'মোট ডেটা কালেকশন' : 'Managed collections'}
          </div>
          <div className="font-mono text-[24px] font-semibold tabular-nums text-[#0B5D45] dark:text-[#6EE7B7] mt-1">
            {formatNumberForLocale(COLLECTION_CONFIGS.length, language)}
          </div>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[12px] p-4">
          <div className="text-[13px] text-[var(--text-secondary)]">
            {isBn ? 'সক্রিয় ওয়ার্কস্পেস' : 'Active workspace'}
          </div>
          <div className="font-serif-editorial text-[18px] font-semibold text-[var(--text-primary)] mt-1 truncate">
            {isBn ? dataset.country.nameBn : dataset.country.nameEn} ({countryCode})
          </div>
        </div>
      </div>

      <ModuleSubNav module={mod} />

      {/* TAB 1: APPROVALS QUEUE (STANDARDIZED TABLE WITH REAL-TIME FILTERING & BULK ACTIONS) */}
      {activeSubTab === 'approvals' ? (
        <SectionCard
          title={isBn ? 'অ্যাডমিন অনুমোদন ও অপসারণ নিয়ন্ত্রণ' : 'Admin Approvals & Workflow Control'}
          subtitle={
            isBn
              ? 'নীতি, ক্রয় ও ঝুঁকি সংক্রান্ত অনুমোদনসমূহ ফিল্টার, বাল্ক-নির্বাচন এবং তাৎক্ষণিক অবস্থা পরিবর্তন করুন'
              : 'Filter in real time, bulk-select, approve, return for revision, edit, or remove workflow items'
          }
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                setEditingApproval({
                  id: `apr-${Date.now()}`,
                  countryCode,
                  title: '',
                  sourceModule: 'm03',
                  linkedRecordId: dataset.policies[0]?.id || '',
                  submittedBy: ROLES_CONFIG[role].labelEn,
                  submittedAt: new Date().toISOString().slice(0, 10),
                  priority: 'Standard',
                  rationale: '',
                  status: 'Pending Approval',
                })
              }
            >
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন অনুমোদন আইটেম' : 'Add approval item'}</span>
            </Button>
          }
        >
          <AdminDataTable<WorkflowApprovalItem>
            data={dataset.approvals}
            rowKey={(apr) => apr.id}
            language={language}
            resetSelectionKey={`approvals-${countryCode}`}
            searchPlaceholder={
              isBn
                ? 'শিরোনাম, মডিউল বা প্রেরক দিয়ে খুঁজুন...'
                : 'Filter approvals by title, module, or submitter...'
            }
            getSearchText={(apr) =>
              `${apr.title} ${apr.sourceModule} ${apr.submittedBy} ${apr.rationale} ${apr.status} ${apr.priority}`
            }
            statusFilterOptions={[
              { value: 'ALL', label: isBn ? 'সকল' : 'All' },
              { value: 'Pending Approval', label: 'Pending Approval' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Returned for Revision', label: 'Returned for Revision' },
            ]}
            getStatusFilterValue={(apr) => apr.status}
            bulkOperations={[
              {
                key: 'bulk-approve-all',
                label: isBn ? 'সব অনুমোদন (Approve All)' : 'Approve All',
                description: isBn
                  ? 'নির্বাচিত সকল ওয়ার্কফ্লো আইটেম অনুমোদন করুন'
                  : 'Approve all selected workflow items',
                tone: 'positive',
                onExecute: (ids, clear) => {
                  bulkProcessApprovals(ids, 'Approved');
                  clear();
                },
              },
              {
                key: 'bulk-return-all',
                label: isBn ? 'সংশোধনের জন্য ফেরত দিন' : 'Return All for Revision',
                description: isBn
                  ? 'প্রেরকের কাছে সংশোধনের জন্য ফেরত পাঠান'
                  : 'Return selected items to submitters for revision',
                tone: 'warning',
                onExecute: (ids, clear) => {
                  bulkProcessApprovals(ids, 'Returned for Revision');
                  clear();
                },
              },
              {
                key: 'bulk-reset-pending',
                label: isBn ? 'Pending অবস্থায় ফিরিয়ে নিন' : 'Reset to Pending',
                tone: 'default',
                onExecute: (ids, clear) => {
                  bulkUpdateCollectionStatus('approvals', ids, 'status', 'Pending Approval');
                  clear();
                },
              },
              {
                key: 'bulk-delete',
                label: isBn ? 'নির্বাচিত রিমুভ করুন' : 'Remove Selected',
                tone: 'danger',
                dividerBefore: true,
                onExecute: (ids, clear) =>
                  setConfirmBulkDelete({
                    collection: 'approvals',
                    ids,
                    clearSelection: clear,
                  }),
              },
            ]}
            emptyTitle={isBn ? 'কোনো অনুমোদন আইটেম পাওয়া যায়নি' : 'No approval items match this filter'}
            columns={[
              {
                key: 'item',
                header: isBn ? 'অনুমোদন আইটেম' : 'Approval Item',
                render: (apr) => (
                  <div className="space-y-1 max-w-md">
                    <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                      <span className="font-mono font-semibold text-[#0B5D45] dark:text-[#6EE7B7]">
                        {apr.sourceModule.toUpperCase()}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{apr.submittedBy}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{formatEditorialDate(apr.submittedAt, language)}</span>
                    </div>
                    <div className="font-serif-editorial text-[15px] leading-[22px] font-semibold text-[var(--text-primary)]">
                      {apr.title}
                    </div>
                    <p className="text-[12px] leading-[18px] text-[var(--text-secondary)]">
                      {apr.rationale}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigateTo(apr.sourceModule)}
                      className="text-[12px] font-medium text-[#0B5D45] dark:text-[#6EE7B7] hover:underline cursor-pointer"
                    >
                      {isBn ? 'সংশ্লিষ্ট মডিউল দেখুন' : 'Open linked module'}
                    </button>
                  </div>
                ),
              },
              {
                key: 'priority',
                header: isBn ? 'অগ্রাধিকার' : 'Priority',
                render: (apr) => (
                  <StatusLabel
                    status={apr.priority}
                    tone={apr.priority === 'Urgent' ? 'critical' : 'info'}
                  />
                ),
              },
              {
                key: 'status',
                header: isBn ? 'অবস্থা ও আপডেট' : 'Status',
                render: (apr) => (
                  <div className="space-y-1.5 min-w-[160px]">
                    <StatusLabel status={apr.status} />
                    <select
                      aria-label={`Update status for ${apr.title}`}
                      value={apr.status}
                      onChange={(e) => {
                        const next = e.target.value as WorkflowApprovalItem['status'];
                        if (next === 'Approved' || next === 'Returned for Revision') {
                          processApproval(apr.id, next);
                        } else {
                          upsertRecord('approvals', { ...apr, status: next });
                        }
                      }}
                      className="w-full min-h-[38px] px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[8px] text-[12px] text-[var(--text-primary)]"
                    >
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Approved">Approved</option>
                      <option value="Returned for Revision">Returned for Revision</option>
                    </select>
                  </div>
                ),
              },
              {
                key: 'actions',
                header: isBn ? 'পদক্ষেপ' : 'Actions',
                align: 'right',
                render: (apr) => (
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    {apr.status === 'Pending Approval' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => processApproval(apr.id, 'Approved')}
                        >
                          <Check className="w-4 h-4" />
                          <span>{isBn ? 'অনুমোদন' : 'Approve'}</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => processApproval(apr.id, 'Returned for Revision')}
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>{isBn ? 'ফেরত' : 'Return'}</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingApproval(apr)}
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDeleteApproval(apr)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isBn ? 'রিমুভ' : 'Remove'}</span>
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </SectionCard>
      ) : activeSubTab === 'submissions' ? (
        /* TAB 2: PUBLIC SUBMISSIONS ANALYSIS & OFFICIAL REPLIES (STANDARDIZED TABLE) */
        <SectionCard
          title={isBn ? 'পাবলিক সাবমিশন বিশ্লেষণ ও উত্তর কেন্দ্র' : 'Public Submissions Analysis & Reply Desk'}
          subtitle={
            isBn
              ? 'নাগরিক ও অংশীজনের মতামত রিয়েল-টাইম ফিল্টার, বাল্ক-নির্বাচন, বিশ্লেষণ ও উত্তর প্রকাশ করুন'
              : 'Filter in real time, bulk-select, update dispositions, analyze, and publish official replies'
          }
          action={
            <Button variant="primary" size="sm" onClick={() => setAddingPublicSub(true)}>
              <Plus className="w-4 h-4" />
              <span>{isBn ? 'নতুন সাবমিশন যোগ' : 'Add submission'}</span>
            </Button>
          }
        >
          <AdminDataTable<ConsultationSubmission>
            data={dataset.consultations}
            rowKey={(sub) => sub.id}
            language={language}
            resetSelectionKey={`submissions-${countryCode}`}
            searchPlaceholder={
              isBn
                ? 'প্রেরক, খাত, নীতি বা মন্তব্য দিয়ে খুঁজুন...'
                : 'Filter submissions by respondent, sector, or comment...'
            }
            getSearchText={(sub) => {
              const pol = dataset.policies.find((p) => p.id === sub.policyId);
              return `${sub.respondentName} ${sub.sector} ${pol?.code || ''} ${sub.comment} ${sub.analysisNote || ''} ${sub.adminReply || ''} ${sub.disposition}`;
            }}
            statusFilterValue={submissionFilter}
            onStatusFilterChange={setSubmissionFilter}
            statusFilterOptions={[
              { value: 'ALL', label: isBn ? 'সকল' : 'All' },
              { value: 'Under Review', label: isBn ? 'পর্যালোচনাধীন' : 'Under Review' },
              { value: 'Accepted', label: isBn ? 'গৃহীত' : 'Accepted' },
              { value: 'Incorporated', label: isBn ? 'অন্তর্ভুক্ত' : 'Incorporated' },
              { value: 'REPLIED', label: isBn ? 'উত্তর দেওয়া হয়েছে' : 'Replied' },
            ]}
            getStatusFilterValue={(sub) =>
              submissionFilter === 'REPLIED'
                ? sub.adminReply
                  ? 'REPLIED'
                  : 'UNREPLIED'
                : sub.disposition
            }
            bulkStatusUpdate={{
              label: isBn ? 'অবস্থা পরিবর্তন' : 'Update disposition',
              applyLabel: isBn ? 'নির্বাচিততে প্রয়োগ করুন' : 'Apply status',
              options: [
                { value: 'Under Review', label: 'Under Review' },
                { value: 'Accepted', label: 'Accepted' },
                { value: 'Incorporated', label: 'Incorporated' },
              ],
              onApply: (ids, nextStatus, clear) => {
                bulkUpdateCollectionStatus('consultations', ids, 'disposition', nextStatus);
                clear();
              },
            }}
            bulkOperations={[
              {
                key: 'bulk-accept-sub',
                label: isBn ? 'সব গ্রহণ করুন (Accept All)' : 'Accept All',
                description: isBn
                  ? 'নির্বাচিত সাবমিশনগুলো Accepted হিসেবে চিহ্নিত করুন'
                  : 'Mark selected public submissions as Accepted',
                tone: 'positive',
                onExecute: (ids, clear) => {
                  bulkUpdateCollectionStatus('consultations', ids, 'disposition', 'Accepted');
                  clear();
                },
              },
              {
                key: 'bulk-incorporate-sub',
                label: isBn ? 'নীতিতে অন্তর্ভুক্ত করুন (Incorporate All)' : 'Incorporate All',
                description: isBn
                  ? 'নির্বাচিত মতামত নীতি খসড়ায় অন্তর্ভুক্ত করুন'
                  : 'Incorporate selected submissions into policy drafts',
                tone: 'positive',
                onExecute: (ids, clear) => {
                  bulkUpdateCollectionStatus('consultations', ids, 'disposition', 'Incorporated');
                  clear();
                },
              },
              {
                key: 'bulk-review-sub',
                label: isBn ? 'পর্যালোচনাধীন করুন' : 'Mark Under Review',
                tone: 'default',
                onExecute: (ids, clear) => {
                  bulkUpdateCollectionStatus('consultations', ids, 'disposition', 'Under Review');
                  clear();
                },
              },
              {
                key: 'bulk-del-sub',
                label: isBn ? 'নির্বাচিত মুছে ফেলুন' : 'Delete Selected',
                tone: 'danger',
                dividerBefore: true,
                onExecute: (ids, clear) =>
                  setConfirmBulkDelete({
                    collection: 'consultations',
                    ids,
                    clearSelection: clear,
                  }),
              },
            ]}
            emptyTitle={isBn ? 'কোনো পাবলিক সাবমিশন নেই' : 'No public submissions match this filter'}
            columns={[
              {
                key: 'submission',
                header: isBn ? 'সাবমিশন ও বিশ্লেষণ' : 'Submission & Official Reply',
                render: (sub) => {
                  const pol = dataset.policies.find((p) => p.id === sub.policyId);
                  return (
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-secondary)]">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {sub.respondentName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{sub.sector}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[#0B5D45] dark:text-[#6EE7B7]">
                          {pol?.code || 'National Policy'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{formatEditorialDate(sub.submittedAt, language)}</span>
                      </div>
                      <p className="text-[14px] leading-[22px] text-[var(--text-primary)]">
                        {sub.comment}
                      </p>
                      {sub.analysisNote && (
                        <p className="text-[12px] leading-[18px] text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1.5 rounded-[8px]">
                          <strong>{isBn ? 'বিশ্লেষণ:' : 'Analysis:'}</strong> {sub.analysisNote}
                        </p>
                      )}
                      {sub.adminReply && (
                        <p className="text-[12px] leading-[18px] text-[#0B5D45] dark:text-[#6EE7B7] bg-[#ECF4F1]/60 dark:bg-[#157F5E]/15 px-2.5 py-1.5 rounded-[8px]">
                          <strong>{isBn ? 'প্রকাশিত উত্তর:' : 'Reply:'}</strong> {sub.adminReply}
                        </p>
                      )}
                    </div>
                  );
                },
              },
              {
                key: 'status',
                header: isBn ? 'অবস্থা ও আপডেট' : 'Disposition',
                render: (sub) => (
                  <div className="space-y-1.5 min-w-[150px]">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {sub.priority && (
                        <StatusLabel
                          status={sub.priority}
                          tone={
                            sub.priority === 'Urgent'
                              ? 'critical'
                              : sub.priority === 'High'
                              ? 'warning'
                              : 'info'
                          }
                        />
                      )}
                      <StatusLabel status={sub.disposition} />
                    </div>
                    <select
                      aria-label={`Update disposition for ${sub.respondentName}`}
                      value={sub.disposition}
                      onChange={(e) =>
                        bulkUpdateCollectionStatus(
                          'consultations',
                          [sub.id],
                          'disposition',
                          e.target.value
                        )
                      }
                      className="w-full min-h-[38px] px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[8px] text-[12px] text-[var(--text-primary)]"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Incorporated">Incorporated</option>
                    </select>
                  </div>
                ),
              },
              {
                key: 'actions',
                header: isBn ? 'পদক্ষেপ' : 'Actions',
                align: 'right',
                render: (sub) => (
                  <div className="flex flex-wrap items-center justify-end gap-1.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openSubmissionDrawer(sub)}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>
                        {sub.adminReply
                          ? isBn
                            ? 'উত্তর সম্পাদনা'
                            : 'Edit reply'
                          : isBn
                          ? 'বিশ্লেষণ ও উত্তর'
                          : 'Analyze & reply'}
                      </span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDeleteSubmission(sub)}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isBn ? 'মুছুন' : 'Delete'}</span>
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        </SectionCard>
      ) : activeSubTab === 'cms' ? (
        /* TAB 3: FULL SYSTEM CRUD MANAGER WITH STANDARDIZED DATA TABLE */
        <div className="space-y-6">
          <SectionCard
            title={isBn ? 'সম্পূর্ণ সিস্টেম ডেটা ম্যানেজার (Add / Update / Delete)' : 'Full System Content Manager'}
            subtitle={
              isBn
                ? 'নীতি খসড়া, নিরাপত্তা ঘটনা প্রতিবেদনসহ সকল মডিউলের ডেটা রিয়েল-টাইম ফিল্টার, বাল্ক নির্বাচন ও অবস্থা আপডেট করুন'
                : 'Real-time filtering, bulk selection, and status-update actions across policy drafts, incident reports, and all 19 registries'
            }
            action={
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  setEditingRecord(activeConfig.createDefault(countryCode, dataset))
                }
              >
                <Plus className="w-4 h-4" />
                <span>{isBn ? 'নতুন রেকর্ড যোগ করুন' : 'Add new record'}</span>
              </Button>
            }
          >
            {/* Quick-focus Registry Shortcuts + Full Collection Dropdown */}
            <div className="space-y-3 mb-5">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: 'policies', labelEn: 'Policy Drafts (M03)', labelBn: 'নীতি খসড়া (M03)' },
                    { key: 'safetyIncidents', labelEn: 'Incident Reports (M15)', labelBn: 'ঘটনা প্রতিবেদন (M15)' },
                    { key: 'risks', labelEn: 'Risk Register (M06)', labelBn: 'ঝুঁকি নিবন্ধন (M06)' },
                    { key: 'watchSignals', labelEn: 'Watch Signals (M01)', labelBn: 'সতর্কবার্তা (M01)' },
                    { key: 'publicProjects', labelEn: 'Public AI Projects (M14)', labelBn: 'সরকারি এআই প্রকল্প (M14)' },
                  ] as Array<{ key: DatasetCollectionKey; labelEn: string; labelBn: string }>
                ).map((shortcut) => (
                  <button
                    key={shortcut.key}
                    type="button"
                    onClick={() => setSelectedCollectionKey(shortcut.key)}
                    aria-pressed={selectedCollectionKey === shortcut.key}
                    className={`min-h-[40px] px-3.5 rounded-[10px] border text-[13px] font-medium transition-colors cursor-pointer ${
                      selectedCollectionKey === shortcut.key
                        ? 'bg-[#0B5D45] text-white border-[#0B5D45]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border-[var(--border-default)] hover:border-[#0B5D45]'
                    }`}
                  >
                    {isBn ? shortcut.labelBn : shortcut.labelEn} (
                    {(dataset[shortcut.key] as unknown[]).length})
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[var(--text-secondary)] mb-1">
                  {isBn ? 'সকল মডিউল / ডেটা কালেকশন (১৯টি)' : 'All system registries (19 collections)'}
                </label>
                <select
                  value={selectedCollectionKey}
                  onChange={(e) => setSelectedCollectionKey(e.target.value as DatasetCollectionKey)}
                  className={`${INPUT_BASE_CLASS} max-w-md`}
                >
                  {COLLECTION_CONFIGS.map((cfg) => (
                    <option key={cfg.key} value={cfg.key}>
                      {isBn ? cfg.labelBn : cfg.labelEn} (
                      {(dataset[cfg.key] as unknown[]).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <AdminDataTable<Record<string, unknown>>
              data={collectionRows}
              rowKey={(row) => String(row.id)}
              language={language}
              resetSelectionKey={`${selectedCollectionKey}-${countryCode}`}
              searchPlaceholder={
                isBn
                  ? 'শিরোনাম, কোড, মেটা বা অবস্থা দিয়ে রিয়েল-টাইম খুঁজুন...'
                  : `Filter ${activeConfig.labelEn} in real time...`
              }
              getSearchText={(row) =>
                `${activeConfig.getTitle(row)} ${activeConfig.getMeta(row)} ${
                  activeStatusField ? String(row[activeStatusField.key] ?? '') : ''
                }`
              }
              statusFilterOptions={
                activeStatusField?.options
                  ? [
                      { value: 'ALL', label: isBn ? 'সকল অবস্থা' : 'All statuses' },
                      ...activeStatusField.options.map((opt) => ({
                        value: String(opt),
                        label: String(opt),
                      })),
                    ]
                  : undefined
              }
              getStatusFilterValue={
                activeStatusField
                  ? (row) => String(row[activeStatusField.key] ?? '')
                  : undefined
              }
              bulkStatusUpdate={
                activeStatusField?.options
                  ? {
                      label: activeStatusField.label,
                      applyLabel: isBn ? 'অবস্থা হালনাগাদ করুন' : 'Update status',
                      options: activeStatusField.options.map((opt) => ({
                        value: String(opt),
                        label: String(opt),
                      })),
                      onApply: (ids, nextStatus, clear) => {
                        bulkUpdateCollectionStatus(
                          activeConfig.key,
                          ids,
                          activeStatusField.key,
                          nextStatus
                        );
                        clear();
                      },
                    }
                  : undefined
              }
              bulkOperations={cmsBulkOperations}
              emptyTitle={isBn ? 'কোনো রেকর্ড পাওয়া যায়নি' : 'No matching records'}
              emptyDescription={
                isBn
                  ? 'ফিল্টার পরিবর্তন করুন অথবা উপরের "নতুন রেকর্ড যোগ করুন" বোতাম ব্যবহার করুন।'
                  : 'Adjust your search/status filters or use "Add new record" above.'
              }
              columns={[
                {
                  key: 'record',
                  header: isBn ? 'রেকর্ডের বিবরণ' : 'Record',
                  render: (row) => (
                    <div className="space-y-1 max-w-lg">
                      <div className="font-serif-editorial text-[15px] leading-[22px] font-semibold text-[var(--text-primary)]">
                        {activeConfig.getTitle(row) || '(Untitled record)'}
                      </div>
                      <div className="text-[12px] leading-[18px] text-[var(--text-secondary)]">
                        {activeConfig.getMeta(row)}
                      </div>
                    </div>
                  ),
                },
                ...(activeStatusField
                  ? [
                      {
                        key: 'statusUpdate',
                        header: activeStatusField.label,
                        render: (row: Record<string, unknown>) => {
                          const currentStatus = String(
                            row[activeStatusField.key] ?? activeStatusField.options?.[0] ?? ''
                          );
                          return (
                            <div className="space-y-1.5 min-w-[175px]">
                              <StatusLabel status={currentStatus} />
                              <select
                                aria-label={`Update ${activeStatusField.label} for ${activeConfig.getTitle(row)}`}
                                value={currentStatus}
                                onChange={(e) =>
                                  bulkUpdateCollectionStatus(
                                    activeConfig.key,
                                    [String(row.id)],
                                    activeStatusField.key,
                                    e.target.value
                                  )
                                }
                                className="w-full min-h-[38px] px-2.5 py-1 bg-[var(--bg-surface)] border border-[var(--border-strong)] rounded-[8px] text-[12px] text-[var(--text-primary)]"
                              >
                                {activeStatusField.options?.map((opt) => (
                                  <option key={String(opt)} value={String(opt)}>
                                    {String(opt)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        },
                      },
                    ]
                  : []),
                {
                  key: 'actions',
                  header: isBn ? 'পদক্ষেপ' : 'Actions',
                  align: 'right',
                  render: (row) => (
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingRecord({ ...row })}
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>{isBn ? 'সম্পাদনা' : 'Edit'}</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setConfirmDeleteRecord(row)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{isBn ? 'ডিলিট' : 'Delete'}</span>
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          </SectionCard>
        </div>
      ) : (
        /* TAB 4: WORKSPACE, COUNTRY PROFILE & SYSTEM RESET */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard
            className="lg:col-span-7"
            title={isBn ? 'দেশ ও ওয়ার্কস্পেস প্রোফাইল সম্পাদনা' : 'Country Workspace Profile'}
            subtitle={
              isBn
                ? 'সক্রিয় দেশ পরিবর্তন করুন অথবা বর্তমান দেশের র‍্যাঙ্ক, জনসংখ্যা ও প্রধান সংস্থার নাম হালনাগাদ করুন'
                : 'Switch active sovereign workspace or edit country metadata displayed across the OS'
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label={isBn ? 'সক্রিয় দেশ ওয়ার্কস্পেস' : 'Active Country Workspace'}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value as CountryCode)}
                    className={INPUT_BASE_CLASS}
                  >
                    <option value="BD">Bangladesh (BD)</option>
                    <option value="SG">Singapore (SG)</option>
                    <option value="EE">Estonia (EE)</option>
                    <option value="IN">India (IN)</option>
                  </select>
                </FormField>
                <FormField label={isBn ? 'সক্রিয় ভূমিকা' : 'Authenticated Access Level'}>
                  <div className="px-3.5 py-2.5 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-subtle)] text-[14px] font-medium text-[#0B5D45] dark:text-[#6EE7B7]">
                    {authUser?.name} · {isBn ? ROLES_CONFIG.admin.labelBn : ROLES_CONFIG.admin.labelEn}
                  </div>
                </FormField>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label={isBn ? 'দেশের নাম (ইংরেজি)' : 'Country name (EN)'}>
                  <input
                    type="text"
                    value={profileForm.nameEn}
                    onChange={(e) => setProfileForm({ ...profileForm, nameEn: e.target.value })}
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
                <FormField label={isBn ? 'দেশের নাম (বাংলা)' : 'Country name (BN)'}>
                  <input
                    type="text"
                    value={profileForm.nameBn}
                    onChange={(e) => setProfileForm({ ...profileForm, nameBn: e.target.value })}
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
                <FormField label={isBn ? 'বৈশ্বিক র‍্যাঙ্ক' : 'Global AI Rank'}>
                  <input
                    type="number"
                    value={profileForm.globalRank}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, globalRank: Number(e.target.value) || 1 })
                    }
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
                <FormField label={isBn ? 'জনসংখ্যা (মিলিয়ন)' : 'Population (M)'}>
                  <input
                    type="number"
                    step="0.1"
                    value={profileForm.populationM}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, populationM: Number(e.target.value) || 1 })
                    }
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
              </div>

              <FormField label={isBn ? 'প্রধান বাস্তবায়নকারী সংস্থা (EN)' : 'Lead Governing Body (EN)'}>
                <input
                  type="text"
                  value={profileForm.leadBodyEn}
                  onChange={(e) => setProfileForm({ ...profileForm, leadBodyEn: e.target.value })}
                  className={INPUT_BASE_CLASS}
                />
              </FormField>

              <div className="pt-2 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => updateCountryProfile(profileForm)}
                >
                  {isBn ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save country profile'}
                </Button>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            className="lg:col-span-5"
            title={isBn ? 'ডেটা সংরক্ষণ ও রিসেট' : 'CMS Persistence & Reset'}
            subtitle={
              isBn
                ? 'সকল অ্যাড, আপডেট, উত্তর ও ডিলিট স্বয়ংক্রিয়ভাবে সংরক্ষিত হয়'
                : 'All CMS edits, replies, and approvals persist automatically in this browser'
            }
          >
            <div className="space-y-4 text-[14px] leading-[22px] text-[var(--text-secondary)]">
              <p>
                {isBn
                  ? 'আপনি যদি পরীক্ষামূলক পরিবর্তনগুলো মুছে ফেলে মূল জাতীয় বেসলাইন ডেটা ফিরিয়ে আনতে চান, তবে নিচের রিসেট বোতাম ব্যবহার করুন।'
                  : 'If you want to discard all local CMS edits and restore the original national baseline datasets across all 20 modules, reset below.'}
              </p>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => setConfirmResetOpen(true)}
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isBn ? 'মূল ডেটায় রিসেট করুন' : 'Reset all CMS data to defaults'}</span>
              </Button>
            </div>
          </SectionCard>
        </div>
      )}

      {/* SHEET: ANALYZE & REPLY TO PUBLIC SUBMISSION */}
      <ResponsiveSheet
        open={Boolean(activeSubmission)}
        onClose={() => setActiveSubmission(null)}
        title={isBn ? 'সাবমিশন বিশ্লেষণ ও উত্তর' : 'Analyze & Reply to Submission'}
        subtitle={
          activeSubmission
            ? `${activeSubmission.respondentName} · ${activeSubmission.sector} · ${formatEditorialDate(activeSubmission.submittedAt, language)}`
            : undefined
        }
      >
        {activeSubmission && (
          <div className="space-y-4">
            <div className="p-3.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-[12px] text-[14px] leading-[22px] text-[var(--text-primary)]">
              {activeSubmission.comment}
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={analyzingAi}
              onClick={handleAutoAnalyzeSubmission}
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {analyzingAi
                  ? isBn
                    ? 'বিশ্লেষণ করা হচ্ছে...'
                    : 'Analyzing submission...'
                  : isBn
                  ? 'স্বয়ংক্রিয় বিশ্লেষণ ও উত্তর খসড়া তৈরি করুন'
                  : 'Auto-analyze & draft official reply'}
              </span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <FormField label={isBn ? 'অগ্রাধিকার' : 'Priority'}>
                <select
                  value={subPriority}
                  onChange={(e) => setSubPriority(e.target.value as 'Urgent' | 'High' | 'Standard')}
                  className={INPUT_BASE_CLASS}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Standard">Standard</option>
                </select>
              </FormField>
              <FormField label={isBn ? 'অবস্থা' : 'Disposition'}>
                <select
                  value={subDisposition}
                  onChange={(e) =>
                    setSubDisposition(e.target.value as ConsultationSubmission['disposition'])
                  }
                  className={INPUT_BASE_CLASS}
                >
                  <option value="Under Review">Under Review</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Incorporated">Incorporated</option>
                </select>
              </FormField>
            </div>

            <FormField label={isBn ? 'গভর্নেন্স বিশ্লেষণ নোট' : 'Governance analysis note'}>
              <textarea
                rows={3}
                value={subAnalysis}
                onChange={(e) => setSubAnalysis(e.target.value)}
                placeholder={
                  isBn
                    ? 'নীতি, আইন বা ঝুঁকিগত প্রভাব বিশ্লেষণ লিখুন...'
                    : 'Enter impact analysis, policy relevance, and internal triage notes...'
                }
                className={INPUT_BASE_CLASS}
              />
            </FormField>

            <FormField label={isBn ? 'আনুষ্ঠানিক উত্তর (পাবলিক ভিউতে দেখা যাবে)' : 'Official reply (published to Public Consultation)'}>
              <textarea
                rows={4}
                value={subReply}
                onChange={(e) => setSubReply(e.target.value)}
                placeholder={
                  isBn
                    ? 'নাগরিক বা অংশীজনের জন্য আনুষ্ঠানিক উত্তর লিখুন...'
                    : 'Write the official institutional reply to this submission...'
                }
                className={INPUT_BASE_CLASS}
              />
            </FormField>

            <div className="pt-2 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setActiveSubmission(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  analyzeAndReplyConsultation(activeSubmission.id, {
                    disposition: subDisposition,
                    priority: subPriority,
                    analysisNote: subAnalysis.trim(),
                    adminReply: subReply.trim(),
                  });
                  setActiveSubmission(null);
                }}
              >
                {isBn ? 'সংরক্ষণ ও উত্তর প্রকাশ করুন' : 'Save & publish reply'}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveSheet>

      {/* SHEET: ADD / EDIT RECORD IN ANY COLLECTION */}
      <ResponsiveSheet
        open={Boolean(editingRecord)}
        onClose={() => setEditingRecord(null)}
        title={isBn ? 'রেকর্ড যোগ বা সম্পাদনা করুন' : 'Add / Edit System Record'}
        subtitle={isBn ? activeConfig.labelBn : activeConfig.labelEn}
      >
        {editingRecord && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              for (const f of activeConfig.fields) {
                if (f.required && !String(editingRecord[f.key] ?? '').trim()) {
                  showToast(`${f.label} is required.`);
                  return;
                }
              }
              upsertRecord(
                activeConfig.key,
                editingRecord as unknown as CountryDataset[typeof activeConfig.key][number]
              );
              setEditingRecord(null);
            }}
          >
            {activeConfig.fields.map((field) => {
              const rawVal = editingRecord[field.key];
              if (field.type === 'boolean') {
                return (
                  <label
                    key={field.key}
                    className="flex items-center gap-2.5 min-h-[44px] text-[14px] text-[var(--text-primary)] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(rawVal)}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, [field.key]: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#0B5D45]"
                    />
                    <span>{field.label}</span>
                  </label>
                );
              }
              if (field.type === 'select') {
                const isNumeric = typeof field.options?.[0] === 'number';
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <select
                      value={String(rawVal ?? field.options?.[0] ?? '')}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          [field.key]: isNumeric ? Number(e.target.value) : e.target.value,
                        })
                      }
                      className={INPUT_BASE_CLASS}
                    >
                      {field.options?.map((opt) => (
                        <option key={String(opt)} value={String(opt)}>
                          {String(opt)}
                        </option>
                      ))}
                    </select>
                  </FormField>
                );
              }
              if (field.type === 'textarea') {
                return (
                  <FormField key={field.key} label={field.label} required={field.required}>
                    <textarea
                      rows={3}
                      value={String(rawVal ?? '')}
                      onChange={(e) =>
                        setEditingRecord({ ...editingRecord, [field.key]: e.target.value })
                      }
                      className={INPUT_BASE_CLASS}
                    />
                  </FormField>
                );
              }
              if (field.type === 'tags') {
                const arrVal = Array.isArray(rawVal) ? rawVal.join(', ') : String(rawVal ?? '');
                return (
                  <FormField key={field.key} label={field.label}>
                    <input
                      type="text"
                      value={arrVal}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          [field.key]: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className={INPUT_BASE_CLASS}
                    />
                  </FormField>
                );
              }
              return (
                <FormField key={field.key} label={field.label} required={field.required}>
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    min={field.min}
                    max={field.max}
                    step={field.type === 'number' ? 'any' : undefined}
                    value={String(rawVal ?? '')}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        [field.key]:
                          field.type === 'number' ? Number(e.target.value) || 0 : e.target.value,
                      })
                    }
                    className={INPUT_BASE_CLASS}
                  />
                </FormField>
              );
            })}

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingRecord(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary">
                {isBn ? 'সংরক্ষণ করুন' : 'Save record'}
              </Button>
            </div>
          </form>
        )}
      </ResponsiveSheet>

      {/* SHEET: ADD / EDIT APPROVAL ITEM */}
      <ResponsiveSheet
        open={Boolean(editingApproval)}
        onClose={() => setEditingApproval(null)}
        title={isBn ? 'অনুমোদন আইটেম সম্পাদনা' : 'Add / Edit Approval Item'}
      >
        {editingApproval && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingApproval.title.trim()) return;
              upsertRecord('approvals', editingApproval);
              setEditingApproval(null);
            }}
          >
            <FormField label={isBn ? 'শিরোনাম' : 'Approval title'} required>
              <input
                type="text"
                value={editingApproval.title}
                onChange={(e) =>
                  setEditingApproval({ ...editingApproval, title: e.target.value })
                }
                className={INPUT_BASE_CLASS}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label={isBn ? 'অগ্রাধিকার' : 'Priority'}>
                <select
                  value={editingApproval.priority}
                  onChange={(e) =>
                    setEditingApproval({
                      ...editingApproval,
                      priority: e.target.value as WorkflowApprovalItem['priority'],
                    })
                  }
                  className={INPUT_BASE_CLASS}
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Standard">Standard</option>
                </select>
              </FormField>
              <FormField label={isBn ? 'অবস্থা' : 'Status'}>
                <select
                  value={editingApproval.status}
                  onChange={(e) =>
                    setEditingApproval({
                      ...editingApproval,
                      status: e.target.value as WorkflowApprovalItem['status'],
                    })
                  }
                  className={INPUT_BASE_CLASS}
                >
                  <option value="Pending Approval">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Returned for Revision">Returned for Revision</option>
                </select>
              </FormField>
            </div>
            <FormField label={isBn ? 'যৌক্তিকতা ও বিবরণ' : 'Rationale'}>
              <textarea
                rows={3}
                value={editingApproval.rationale}
                onChange={(e) =>
                  setEditingApproval({ ...editingApproval, rationale: e.target.value })
                }
                className={INPUT_BASE_CLASS}
              />
            </FormField>
            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingApproval(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary">
                {isBn ? 'সংরক্ষণ করুন' : 'Save approval'}
              </Button>
            </div>
          </form>
        )}
      </ResponsiveSheet>

      {/* SHEET: ADD NEW PUBLIC SUBMISSION */}
      <ResponsiveSheet
        open={addingPublicSub}
        onClose={() => setAddingPublicSub(false)}
        title={isBn ? 'নতুন পাবলিক সাবমিশন যোগ' : 'Add Public Submission'}
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!newSubName.trim() || !newSubComment.trim()) return;
            upsertRecord('consultations', {
              id: `con-${Date.now()}`,
              countryCode,
              policyId: newSubPolicyId || dataset.policies[0]?.id || '',
              respondentName: newSubName.trim(),
              sector: newSubSector,
              comment: newSubComment.trim(),
              submittedAt: new Date().toISOString().slice(0, 10),
              disposition: 'Under Review',
            });
            setNewSubName('');
            setNewSubComment('');
            setAddingPublicSub(false);
          }}
        >
          <FormField label={isBn ? 'প্রেরকের নাম / সংস্থা' : 'Respondent name'} required>
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className={INPUT_BASE_CLASS}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label={isBn ? 'খাত' : 'Sector'}>
              <select
                value={newSubSector}
                onChange={(e) => setNewSubSector(e.target.value as ConsultationSubmission['sector'])}
                className={INPUT_BASE_CLASS}
              >
                <option value="Citizen">Citizen</option>
                <option value="Civil Society">Civil Society</option>
                <option value="Academia">Academia</option>
                <option value="Private Sector">Private Sector</option>
                <option value="Government">Government</option>
              </select>
            </FormField>
            <FormField label={isBn ? 'সংশ্লিষ্ট নীতি' : 'Target Policy'}>
              <select
                value={newSubPolicyId}
                onChange={(e) => setNewSubPolicyId(e.target.value)}
                className={INPUT_BASE_CLASS}
              >
                {dataset.policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <FormField label={isBn ? 'মতামত / প্রস্তাবনা' : 'Submission comment'} required>
            <textarea
              rows={4}
              value={newSubComment}
              onChange={(e) => setNewSubComment(e.target.value)}
              className={INPUT_BASE_CLASS}
            />
          </FormField>
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setAddingPublicSub(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button type="submit" variant="primary">
              {isBn ? 'যোগ করুন' : 'Add submission'}
            </Button>
          </div>
        </form>
      </ResponsiveSheet>

      {/* CONFIRM DELETE SHEETS */}
      <ResponsiveSheet
        open={Boolean(confirmDeleteApproval)}
        onClose={() => setConfirmDeleteApproval(null)}
        title={isBn ? 'অনুমোদন আইটেম রিমুভ নিশ্চিত করুন' : 'Remove Approval Item?'}
      >
        {confirmDeleteApproval && (
          <div className="space-y-4">
            <p className="text-[14px] leading-[22px] text-[var(--text-secondary)]">
              {confirmDeleteApproval.title}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteApproval(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteRecord('approvals', confirmDeleteApproval.id);
                  setConfirmDeleteApproval(null);
                }}
              >
                {isBn ? 'রিমুভ করুন' : 'Remove item'}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveSheet>

      <ResponsiveSheet
        open={Boolean(confirmDeleteSubmission)}
        onClose={() => setConfirmDeleteSubmission(null)}
        title={isBn ? 'পাবলিক সাবমিশন মুছবেন?' : 'Delete Public Submission?'}
      >
        {confirmDeleteSubmission && (
          <div className="space-y-4">
            <p className="text-[14px] leading-[22px] text-[var(--text-secondary)]">
              {confirmDeleteSubmission.respondentName}: {confirmDeleteSubmission.comment}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteSubmission(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteRecord('consultations', confirmDeleteSubmission.id);
                  setConfirmDeleteSubmission(null);
                }}
              >
                {isBn ? 'ডিলিট করুন' : 'Delete submission'}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveSheet>

      <ResponsiveSheet
        open={Boolean(confirmDeleteRecord)}
        onClose={() => setConfirmDeleteRecord(null)}
        title={isBn ? 'রেকর্ড মুছে ফেলা নিশ্চিত করুন' : 'Delete System Record?'}
      >
        {confirmDeleteRecord && (
          <div className="space-y-4">
            <p className="text-[14px] leading-[22px] text-[var(--text-secondary)]">
              {activeConfig.getTitle(confirmDeleteRecord)}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmDeleteRecord(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  deleteRecord(activeConfig.key, String(confirmDeleteRecord.id));
                  setConfirmDeleteRecord(null);
                }}
              >
                {isBn ? 'মুছে ফেলুন' : 'Delete record'}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveSheet>

      <ResponsiveSheet
        open={Boolean(confirmBulkDelete)}
        onClose={() => setConfirmBulkDelete(null)}
        title={isBn ? 'নির্বাচিত রেকর্ডসমূহ মুছে ফেলবেন?' : 'Delete Selected Records?'}
      >
        {confirmBulkDelete && (
          <div className="space-y-4">
            <p className="text-[14px] leading-[22px] text-[var(--text-secondary)]">
              {isBn
                ? `আপনি নিশ্চিত যে ${formatNumberForLocale(confirmBulkDelete.ids.length, language)}টি নির্বাচিত রেকর্ড মুছে ফেলতে চান?`
                : `Are you sure you want to remove ${confirmBulkDelete.ids.length} selected record(s)? You can undo this immediately from the toast notification.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmBulkDelete(null)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  bulkDeleteRecords(confirmBulkDelete.collection, confirmBulkDelete.ids);
                  confirmBulkDelete.clearSelection();
                  setConfirmBulkDelete(null);
                }}
              >
                {isBn ? 'মুছে ফেলুন' : 'Confirm delete'}
              </Button>
            </div>
          </div>
        )}
      </ResponsiveSheet>

      <ResponsiveSheet
        open={confirmResetOpen}
        onClose={() => setConfirmResetOpen(false)}
        title={isBn ? 'সকল ডেটা রিসেট করবেন?' : 'Reset All CMS Data?'}
      >
        <div className="space-y-4">
          <p className="text-[14px] leading-[22px] text-[var(--text-secondary)]">
            {isBn
              ? 'এতে আপনার করা সকল অ্যাড, এডিট, উত্তর ও ডিলিট পরিবর্তন মুছে গিয়ে মূল সিস্টেম ডেটা ফিরে আসবে।'
              : 'This clears all local edits, replies, and additions across all countries and restores the default baseline datasets.'}
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmResetOpen(false)}>
              {isBn ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetAllDataToSeed();
                setConfirmResetOpen(false);
              }}
            >
              {isBn ? 'রিসেট নিশ্চিত করুন' : 'Confirm reset'}
            </Button>
          </div>
        </div>
      </ResponsiveSheet>
    </div>
  );
};
