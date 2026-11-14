export type CountryCode = 'BD' | 'SG' | 'EE' | 'IN';

export type Language = 'en' | 'bn';

export type UserRole =
  | 'admin'
  | 'commissioner'
  | 'policy_analyst'
  | 'risk_auditor'
  | 'ministry_coordinator'
  | 'public_observer';

export type ModuleId =
  | 'command'
  | 'm01'
  | 'm02'
  | 'm03'
  | 'm04'
  | 'm05'
  | 'm06'
  | 'm07'
  | 'm08'
  | 'm09'
  | 'm10'
  | 'm11'
  | 'm12'
  | 'm13'
  | 'm14'
  | 'm15'
  | 'm16'
  | 'm17'
  | 'm18'
  | 'm19'
  | 'm20'
  | 'observatory'
  | 'admin';

export type PillarGroup =
  | 'overview'
  | 'intelligence_readiness'
  | 'policy_governance'
  | 'risk_responsibility'
  | 'capacity_ecosystem'
  | 'execution_automation';

export interface SubTabDefinition {
  id: string;
  labelEn: string;
  labelBn: string;
}

export interface ModuleDefinition {
  id: ModuleId;
  number: string;
  pillar: PillarGroup;
  titleEn: string;
  titleBn: string;
  shortEn: string;
  shortBn: string;
  descriptionEn: string;
  descriptionBn: string;
  subTabs: SubTabDefinition[];
  restrictedToRoles?: UserRole[];
}

export interface RoleDefinition {
  id: UserRole;
  labelEn: string;
  labelBn: string;
  scopeEn: string;
  scopeBn: string;
  canAccessAdminCMS: boolean;
  canApprove: boolean;
  canEditPolicy: boolean;
  canEditRisk: boolean;
  canEditProject: boolean;
  canViewRestrictedSecurity: boolean;
  canSubmitConsultation: boolean;
}

export interface CountryProfile {
  code: CountryCode;
  nameEn: string;
  nameBn: string;
  leadBodyEn: string;
  leadBodyBn: string;
  currency: string;
  globalRank: number;
  populationM: number;
}

export interface EvidenceRecord {
  id: string;
  countryCode: CountryCode;
  title: string;
  sourceInstitutionId: string;
  sourceName: string;
  documentRef: string;
  verifiedDate: string;
  confidence: 'Verified Primary' | 'Peer Reviewed' | 'Official Registry' | 'Automated Signal';
  linkedModule: ModuleId;
  summary: string;
}

export interface Institution {
  id: string;
  countryCode: CountryCode;
  name: string;
  shortCode: string;
  tier: 'Apex Council' | 'Lead Ministry' | 'Regulatory Body' | 'Research Centre' | 'Implementing Agency';
  mandate: string;
  accountabilityScore: number;
  focalOfficer: string;
  coordinatingWith: string[];
  evidenceId: string;
}

export interface WatchSignal {
  id: string;
  countryCode: CountryCode;
  category:
    | 'national'
    | 'global'
    | 'news'
    | 'policy'
    | 'regulation'
    | 'research'
    | 'investment'
    | 'company'
    | 'incident'
    | 'deepfake'
    | 'safety'
    | 'early_warning';
  title: string;
  source: string;
  publishedAt: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Informational';
  summary: string;
  linkedPolicyId?: string;
  linkedRiskId?: string;
  evidenceId: string;
  status: 'Active Alert' | 'Under Review' | 'Escalated to Risk' | 'Resolved';
}

export interface ReadinessDimension {
  id: string;
  countryCode: CountryCode;
  pillar: 'Institutional' | 'Infrastructure' | 'Human Capital' | 'Responsible AI';
  indicatorCode: string;
  name: string;
  score: number;
  target: number;
  trendDelta: number;
  institutionId: string;
  evidenceId: string;
  lastAssessed: string;
}

export interface ReadinessQuestion {
  id: string;
  countryCode: CountryCode;
  pillar: 'Institutional' | 'Infrastructure' | 'Human Capital' | 'Responsible AI';
  question: string;
  maturityLevel: 1 | 2 | 3 | 4 | 5;
  evidenceNote: string;
  evidenceId: string;
}

export interface PolicyItem {
  id: string;
  countryCode: CountryCode;
  code: string;
  title: string;
  stage:
    | 'Drafting'
    | 'Inter-Ministerial Review'
    | 'Public Consultation'
    | 'Cabinet Approval'
    | 'Enacted'
    | 'Flagged'
    | 'Archived';
  progressPct: number;
  ownerInstitutionId: string;
  gapCount: number;
  gapSummary: string;
  recommendations: string[];
  targetDate: string;
  evidenceId: string;
}

export interface LawRegulationItem {
  id: string;
  countryCode: CountryCode;
  title: string;
  jurisdiction: string;
  instrumentType: 'Statute' | 'Regulation' | 'Executive Directive' | 'Technical Standard';
  status: 'Enacted' | 'Parliamentary Bill' | 'Draft Regulation' | 'Gap Identified';
  complianceRatePct: number;
  gapSeverity: 'Low' | 'Moderate' | 'High';
  comparableInternationalLaw: string;
  institutionId: string;
  evidenceId: string;
}

export interface RiskItem {
  id: string;
  countryCode: CountryCode;
  code: string;
  title: string;
  classification: 'Algorithmic Bias' | 'Cyber & Model Security' | 'Privacy & Data' | 'Disinformation & Deepfake' | 'Labour & Socioeconomic' | 'Critical Infrastructure';
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  status: 'Open' | 'Mitigating' | 'Monitored' | 'Controlled';
  mitigationPlan: string;
  ownerInstitutionId: string;
  linkedPolicyId?: string;
  evidenceId: string;
  restricted?: boolean;
}

export interface ResponsiblePrincipleMetric {
  id: string;
  countryCode: CountryCode;
  principle: 'Fairness' | 'Transparency' | 'Explainability' | 'Accountability' | 'Human Oversight';
  complianceScore: number;
  auditedSystems: number;
  guidelineTitle: string;
  keyControl: string;
  evidenceId: string;
}

export interface ImpactAssessmentItem {
  id: string;
  countryCode: CountryCode;
  systemName: string;
  domain: 'AI General' | 'Human Rights' | 'Social' | 'Environmental' | 'Ethical';
  ministryOrOwner: string;
  overallImpactScore: number;
  riskTier: 'Low' | 'Limited' | 'High' | 'Unacceptable';
  humanRightsScore: number;
  socialScore: number;
  environmentalScore: number;
  ethicalScore: number;
  status: 'Approved' | 'Conditional' | 'Pending Review';
  evidenceId: string;
}

export interface DataGovernanceAsset {
  id: string;
  countryCode: CountryCode;
  name: string;
  category: 'Data Policy' | 'Data Quality' | 'Data Protection' | 'Data Infrastructure' | 'Access Governance';
  custodianInstitutionId: string;
  qualityScore: number;
  protectionStandard: string;
  accessTier: 'Open Public' | 'Controlled Research' | 'Sovereign Restricted';
  complianceStatus: 'Compliant' | 'Remediation Needed' | 'Under Audit';
  evidenceId: string;
}

export interface InfrastructureAsset {
  id: string;
  countryCode: CountryCode;
  name: string;
  category: 'Compute' | 'Cloud' | 'Connectivity' | 'Data Centre';
  capacitySpec: string;
  utilizationPct: number;
  sovereignHosted: boolean;
  location: string;
  status: 'Operational' | 'Expanding' | 'Planned';
  evidenceId: string;
}

export interface HumanCapitalProgram {
  id: string;
  countryCode: CountryCode;
  title: string;
  category: 'Skills Assessment' | 'Talent Database' | 'AI Education' | 'Training Programme' | 'Workforce Development';
  leadInstitution: string;
  enrolledOrTrained: number;
  targetCohort: number;
  completionPct: number;
  skillTier: 'Foundational' | 'Applied Engineering' | 'Frontier Research' | 'Executive Governance';
  evidenceId: string;
}

export interface ResearchInnovationItem {
  id: string;
  countryCode: CountryCode;
  title: string;
  category: 'Research Publication' | 'Institution' | 'Innovation Project' | 'Funding Grant' | 'Startup';
  organization: string;
  focusArea: string;
  fundingAmountUSD: number;
  trlOrStage: string;
  evidenceId: string;
}

export interface EconomyMarketItem {
  id: string;
  countryCode: CountryCode;
  sector: string;
  aiAdoptionPct: number;
  activeFirms: number;
  investmentUSD_M: number;
  jobsImpactedOrCreated: number;
  projectedGdpImpactPct: number;
  evidenceId: string;
}

export interface PublicAIProject {
  id: string;
  countryCode: CountryCode;
  registryCode: string;
  title: string;
  ministry: string;
  serviceDomain: string;
  stage: 'Discovery' | 'Procurement' | 'Pilot' | 'Production';
  procurementCompliant: boolean;
  beneficiariesK: number;
  linkedImpactId?: string;
  evidenceId: string;
}

export interface SafetyIncidentItem {
  id: string;
  countryCode: CountryCode;
  code: string;
  title: string;
  type: 'Safety Benchmark' | 'Cyber Threat' | 'Model Vulnerability' | 'Live Incident' | 'Standard Compliance';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedSystem: string;
  reportedDate: string;
  resolutionStatus: 'Investigating' | 'Patched' | 'Containment Active' | 'Verified' | 'Flagged' | 'Archived';
  evidenceId: string;
  restricted?: boolean;
}

export interface BenchmarkEntry {
  countryCode: CountryCode;
  countryName: string;
  globalRank: number;
  overallScore: number;
  governanceScore: number;
  infrastructureScore: number;
  humanCapitalScore: number;
  researchScore: number;
  responsibleAiScore: number;
  bestPracticeHighlight: string;
}

export interface StakeholderEntity {
  id: string;
  countryCode: CountryCode;
  name: string;
  sector: 'Government' | 'Private Sector' | 'Academia' | 'Civil Society';
  roleInEcosystem: string;
  focalContact: string;
  engagementStatus: 'Active Council Member' | 'Working Group' | 'Consultative Partner';
  evidenceId: string;
}

export interface ConsultationSubmission {
  id: string;
  countryCode: CountryCode;
  policyId: string;
  respondentName: string;
  sector: 'Government' | 'Private Sector' | 'Academia' | 'Civil Society' | 'Citizen';
  comment: string;
  submittedAt: string;
  disposition: 'Accepted' | 'Under Review' | 'Incorporated';
  priority?: 'Urgent' | 'High' | 'Standard';
  analysisNote?: string;
  adminReply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface ActionMilestone {
  id: string;
  countryCode: CountryCode;
  code: string;
  programme: string;
  milestoneTitle: string;
  ownerInstitutionId: string;
  dueQuarter: string;
  kpiTarget: string;
  progressPct: number;
  status: 'On Track' | 'At Risk' | 'Completed' | 'Delayed';
  evidenceId: string;
}

export interface WorkflowApprovalItem {
  id: string;
  countryCode: CountryCode;
  title: string;
  sourceModule: ModuleId;
  linkedRecordId: string;
  submittedBy: string;
  submittedAt: string;
  priority: 'Urgent' | 'Standard';
  rationale: string;
  status: 'Pending Approval' | 'Approved' | 'Returned for Revision';
  reviewedBy?: string;
}

export interface CountryDataset {
  country: CountryProfile;
  evidence: EvidenceRecord[];
  institutions: Institution[];
  watchSignals: WatchSignal[];
  readinessDimensions: ReadinessDimension[];
  readinessQuestions: ReadinessQuestion[];
  policies: PolicyItem[];
  laws: LawRegulationItem[];
  risks: RiskItem[];
  responsibleMetrics: ResponsiblePrincipleMetric[];
  impactAssessments: ImpactAssessmentItem[];
  dataAssets: DataGovernanceAsset[];
  infrastructure: InfrastructureAsset[];
  humanCapital: HumanCapitalProgram[];
  researchItems: ResearchInnovationItem[];
  economyItems: EconomyMarketItem[];
  publicProjects: PublicAIProject[];
  safetyIncidents: SafetyIncidentItem[];
  stakeholders: StakeholderEntity[];
  consultations: ConsultationSubmission[];
  milestones: ActionMilestone[];
  approvals: WorkflowApprovalItem[];
}

export type DatasetCollectionKey = Exclude<keyof CountryDataset, 'country'>;
