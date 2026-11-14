import {
  CountryDataset,
  InfrastructureAsset,
  ModuleId,
  PolicyItem,
  PublicAIProject,
  ResearchInnovationItem,
  RiskItem,
  SafetyIncidentItem,
} from '../types/os';

export type ObservatoryZoneType = 'infrastructure' | 'research_hub' | 'policy_zone';

export type ObservatoryDomain =
  | 'compute'
  | 'public_ai'
  | 'nlp_research'
  | 'safety_policy'
  | 'economy_skills';

export type DivisionId =
  | 'rangpur'
  | 'rajshahi'
  | 'mymensingh'
  | 'sylhet'
  | 'dhaka'
  | 'khulna'
  | 'barishal'
  | 'chattogram';

export interface BangladeshDivisionGeo {
  id: DivisionId;
  nameEn: string;
  nameBn: string;
  hubCityEn: string;
  hubCityBn: string;
  specializationEn: string;
  specializationBn: string;
  points: Array<[number, number]>; // [lon, lat]
  labelLonLat: [number, number];
}

export interface RealTimeMetricsData {
  primaryLabelEn: string;
  primaryLabelBn: string;
  primaryValue: string;
  primaryNumeric: number;
  computeLoadOrSpec: string;
  networkLatency: string;
  throughputOrCapacity: string;
  activeModelsOrDeployments: string;
  reachOrBeneficiaries: string;
  uptimeOrSLA: string;
  lastAssessed: string;
}

export interface RiskIndicatorData {
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  overallScore: number; // Likelihood * Impact (1-25)
  likelihood: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  threatTitleEn: string;
  threatTitleBn: string;
  threatCategoryEn: string;
  threatCategoryBn: string;
  mitigationStatus: 'Active Mitigation' | 'Containment Active' | 'Monitored' | 'Controlled' | 'Under Review';
  mitigationPlanEn: string;
  mitigationPlanBn: string;
  cirtAdvisoryCode: string;
  lastAuditDate: string;
}

export interface AssociatedPolicyData {
  policyCode: string;
  policyTitleEn: string;
  policyTitleBn: string;
  stage: PolicyItem['stage'];
  progressPct: number;
  complianceRatePct: number;
  aiaAuditStatus: 'Approved' | 'Conditional' | 'Mandatory Pre-Audit' | 'Exempt';
  statutoryPrerequisiteEn: string;
  statutoryPrerequisiteBn: string;
  targetGazetteDate: string;
  nodalAgency: string;
  evidenceRef: string;
  linkedModule: ModuleId;
  linkedSubTab?: string;
}

export interface ObservatoryToolNode {
  id: string;
  code: string;
  nameEn: string;
  nameBn: string;
  zoneType: ObservatoryZoneType;
  domain: ObservatoryDomain;
  divisionId: DivisionId;
  locationEn: string;
  locationBn: string;
  lon: number;
  lat: number;
  x: number;
  y: number;
  featuresEn: string[];
  featuresBn: string[];
  metricLabelEn: string;
  metricLabelBn: string;
  metricValue: string;
  metricNumeric: number;
  status: string;
  institution: string;
  linkedModule: ModuleId;
  linkedSubTab?: string;
  evidenceId?: string;
  summaryEn: string;
  summaryBn: string;
  realTimeMetrics: RealTimeMetricsData;
  riskIndicators: RiskIndicatorData;
  associatedPolicy: AssociatedPolicyData;
}

export interface ObservatoryCorridor {
  id: string;
  from: [number, number]; // [lon, lat]
  to: [number, number];
  labelEn: string;
  labelBn: string;
  kind: 'compute' | 'fiber' | 'telemetry';
}

export function projectBD(lon: number, lat: number): { x: number; y: number } {
  const x = 56 + ((lon - 87.95) / 4.8) * 408;
  const y = 30 + ((26.7 - lat) / 6.05) * 560;
  return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
}

export function polygonPathFromLonLat(points: Array<[number, number]>): string {
  return (
    points
      .map(([lon, lat], idx) => {
        const { x, y } = projectBD(lon, lat);
        return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join(' ') + ' Z'
  );
}

export function polylinePathFromLonLat(points: Array<[number, number]>): string {
  return points
    .map(([lon, lat], idx) => {
      const { x, y } = projectBD(lon, lat);
      return `${idx === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');
}

export const ZONE_TYPE_META: Record<
  ObservatoryZoneType,
  {
    labelEn: string;
    labelBn: string;
    shortEn: string;
    shortBn: string;
    descriptionEn: string;
    descriptionBn: string;
    color: string;
    softBgClass: string;
    textClass: string;
    borderClass: string;
  }
> = {
  infrastructure: {
    labelEn: 'National AI Infrastructure Point',
    labelBn: 'জাতীয় এআই অবকাঠামো কেন্দ্র',
    shortEn: 'AI Infrastructure',
    shortBn: 'অবকাঠামো',
    descriptionEn: 'Sovereign GPU clusters, national cloud facilities, Tier-IV data centres, and submarine cable gateways.',
    descriptionBn: 'সার্বভৌম জিপিইউ ক্লাস্টার, জাতীয় ক্লাউড সুবিধা, টিয়ার-৪ ডেটা সেন্টার ও সাবমেরিন ক্যাবল ব্যাকবোন।',
    color: '#0B5D45',
    softBgClass: 'bg-[#ECF4F1] dark:bg-[#157F5E]/20',
    textClass: 'text-[#0B5D45] dark:text-[#6EE7B7]',
    borderClass: 'border-[#0B5D45]',
  },
  research_hub: {
    labelEn: 'AI Research & Innovation Hub',
    labelBn: 'এআই গবেষণা ও উদ্ভাবন কেন্দ্র',
    shortEn: 'Research Hub',
    shortBn: 'গবেষণাগার',
    descriptionEn: 'University NLP labs, agricultural computer vision research, clinical imaging AI, and startup incubation pods.',
    descriptionBn: 'বিশ্ববিদ্যালয় এনএলপি ল্যাব, কৃষি কম্পিউটার ভিশন গবেষণা, ক্লিনিক্যাল এআই ও স্টার্টআপ ইনকিউবেশন।',
    color: '#0F766E',
    softBgClass: 'bg-[#F0FDFA] dark:bg-[#0F766E]/20',
    textClass: 'text-[#0F766E] dark:text-[#5EEAD4]',
    borderClass: 'border-[#0F766E]',
  },
  policy_zone: {
    labelEn: 'Policy Development & Governance Zone',
    labelBn: 'নীতি ও নিয়ন্ত্রক উন্নয়ন অঞ্চল',
    shortEn: 'Policy Zone',
    shortBn: 'নীতি অঞ্চল',
    descriptionEn: 'Apex governance council chambers, FinTech regulatory sandboxes, CIRT AI safety defense, and public citizen deployment hubs.',
    descriptionBn: 'শীর্ষ গভর্নেন্স কাউন্সিল, ফিনটেক রেগুলেটরি স্যান্ডবক্স, সার্ট সাইবার ডিফেন্স ও নাগরিক সেবা মোতায়েন।',
    color: '#2E5E8C',
    softBgClass: 'bg-[#EFF6FC] dark:bg-[#2E5E8C]/25',
    textClass: 'text-[#2E5E8C] dark:text-[#93C5FD]',
    borderClass: 'border-[#2E5E8C]',
  },
};

export const DOMAIN_META: Record<
  ObservatoryDomain,
  {
    labelEn: string;
    labelBn: string;
    shortEn: string;
    shortBn: string;
    color: string;
    softBgClass: string;
    textClass: string;
  }
> = {
  compute: {
    labelEn: 'Compute & Sovereign Cloud',
    labelBn: 'কম্পিউট ও সার্বভৌম ক্লাউড',
    shortEn: 'Compute & Cloud',
    shortBn: 'কম্পিউট',
    color: '#0B5D45',
    softBgClass: 'bg-[#ECF4F1] dark:bg-[#157F5E]/20',
    textClass: 'text-[#0B5D45] dark:text-[#6EE7B7]',
  },
  public_ai: {
    labelEn: 'Public Sector Citizen AI',
    labelBn: 'সরকারি ও নাগরিক সেবা এআই',
    shortEn: 'Public AI',
    shortBn: 'জনসেবা এআই',
    color: '#2E5E8C',
    softBgClass: 'bg-[#EFF6FC] dark:bg-[#2E5E8C]/25',
    textClass: 'text-[#2E5E8C] dark:text-[#93C5FD]',
  },
  nlp_research: {
    labelEn: 'Bangla NLP & Research Labs',
    labelBn: 'বাংলা এনএলপি ও গবেষণাগার',
    shortEn: 'NLP & Research',
    shortBn: 'গবেষণা ও বাংলা এআই',
    color: '#0F766E',
    softBgClass: 'bg-[#F0FDFA] dark:bg-[#0F766E]/25',
    textClass: 'text-[#0F766E] dark:text-[#5EEAD4]',
  },
  safety_policy: {
    labelEn: 'Safety, Cyber & Governance',
    labelBn: 'নিরাপত্তা, সাইবার ও নীতি',
    shortEn: 'Safety & Policy',
    shortBn: 'নিরাপত্তা ও নীতি',
    color: '#B42318',
    softBgClass: 'bg-[#FEF2F2] dark:bg-[#B42318]/20',
    textClass: 'text-[#B42318] dark:text-[#FCA5A5]',
  },
  economy_skills: {
    labelEn: 'Economy, Industry & Skills',
    labelBn: 'অর্থনীতি, শিল্প ও দক্ষতা',
    shortEn: 'Economy & Skills',
    shortBn: 'শিল্প ও দক্ষতা',
    color: '#9A5B00',
    softBgClass: 'bg-[#FEF7E6] dark:bg-[#9A5B00]/25',
    textClass: 'text-[#9A5B00] dark:text-[#FCD34D]',
  },
};

export const BANGLADESH_DIVISIONS: BangladeshDivisionGeo[] = [
  {
    id: 'rangpur',
    nameEn: 'Rangpur',
    nameBn: 'রংপুর',
    hubCityEn: 'Rangpur & Dinajpur',
    hubCityBn: 'রংপুর ও দিনাজপুর',
    specializationEn: 'AgriTech Vision & Flood Telemetry',
    specializationBn: 'কৃষি এআই ও বন্যা টেলিমেট্রি',
    labelLonLat: [89.05, 25.82],
    points: [
      [88.35, 26.63],
      [88.85, 26.42],
      [89.45, 26.32],
      [89.86, 26.05],
      [89.76, 25.45],
      [89.62, 25.12],
      [89.08, 25.18],
      [88.62, 25.22],
      [88.32, 25.55],
      [88.14, 26.15],
    ],
  },
  {
    id: 'rajshahi',
    nameEn: 'Rajshahi',
    nameBn: 'রাজশাহী',
    hubCityEn: 'Rajshahi & Bogura',
    hubCityBn: 'রাজশাহী ও বগুড়া',
    specializationEn: 'Crop Disease AI & Hi-Tech Park',
    specializationBn: 'শস্য রোগ নির্ণয় ও হাই-টেক পার্ক',
    labelLonLat: [88.95, 24.58],
    points: [
      [88.32, 25.55],
      [88.62, 25.22],
      [89.08, 25.18],
      [89.62, 25.12],
      [89.76, 24.48],
      [89.72, 23.92],
      [89.05, 24.08],
      [88.58, 24.28],
      [88.02, 24.72],
      [88.15, 25.15],
    ],
  },
  {
    id: 'mymensingh',
    nameEn: 'Mymensingh',
    nameBn: 'ময়মনসিংহ',
    hubCityEn: 'Mymensingh & Jamalpur',
    hubCityBn: 'ময়মনসিংহ ও জামালপুর',
    specializationEn: 'Agri-Genomics & Jamuna Edge',
    specializationBn: 'কৃষি জিনোমিক্স ও যমুনা এজ',
    labelLonLat: [90.35, 24.84],
    points: [
      [89.62, 25.12],
      [89.95, 25.24],
      [90.58, 25.2],
      [91.02, 25.14],
      [90.96, 24.65],
      [90.65, 24.34],
      [90.15, 24.36],
      [89.76, 24.48],
    ],
  },
  {
    id: 'sylhet',
    nameEn: 'Sylhet',
    nameBn: 'সিলেট',
    hubCityEn: 'Sylhet & Sunamganj',
    hubCityBn: 'সিলেট ও সুনামগঞ্জ',
    specializationEn: 'Haor Early Warning & SUST NLP',
    specializationBn: 'হাওর আগাম সতর্কতা ও শাবিপ্রবি ল্যাব',
    labelLonLat: [91.75, 24.66],
    points: [
      [91.02, 25.14],
      [91.65, 25.22],
      [92.46, 25.06],
      [92.54, 24.62],
      [92.22, 24.18],
      [91.68, 24.1],
      [91.22, 24.16],
      [90.96, 24.65],
    ],
  },
  {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameBn: 'ঢাকা',
    hubCityEn: 'Dhaka & Kaliakoir',
    hubCityBn: 'ঢাকা ও কালিয়াকৈর',
    specializationEn: 'Tier-IV GPU Cluster, Policy & CIRT',
    specializationBn: 'টিয়ার-৪ জিপিইউ ক্লাস্টার, নীতি ও সার্ট',
    labelLonLat: [90.35, 23.75],
    points: [
      [89.76, 24.48],
      [90.15, 24.36],
      [90.65, 24.34],
      [90.96, 24.65],
      [91.22, 24.16],
      [91.12, 23.62],
      [90.75, 23.22],
      [90.22, 23.02],
      [89.75, 23.05],
      [89.58, 23.52],
      [89.72, 23.92],
    ],
  },
  {
    id: 'khulna',
    nameEn: 'Khulna',
    nameBn: 'খুলনা',
    hubCityEn: 'Khulna & Jashore',
    hubCityBn: 'খুলনা ও যশোর',
    specializationEn: 'GovCloud DR Node & Coastal AI',
    specializationBn: 'গভক্লাউড ডিআর নোড ও উপকূলীয় এআই',
    labelLonLat: [89.22, 22.95],
    points: [
      [88.58, 24.28],
      [89.05, 24.08],
      [89.72, 23.92],
      [89.58, 23.52],
      [89.75, 23.05],
      [89.96, 22.38],
      [89.86, 21.82],
      [89.32, 21.66],
      [88.98, 21.74],
      [88.82, 22.45],
      [88.6, 23.38],
      [88.54, 23.92],
    ],
  },
  {
    id: 'barishal',
    nameEn: 'Barishal',
    nameBn: 'বরিশাল',
    hubCityEn: 'Barishal & Patuakhali',
    hubCityBn: 'বরিশাল ও পটুয়াখালী',
    specializationEn: 'Maternal Health AI & Climate Grid',
    specializationBn: 'মাতৃস্বাস্থ্য এআই ও জলবায়ু গ্রিড',
    labelLonLat: [90.38, 22.42],
    points: [
      [89.75, 23.05],
      [90.22, 23.02],
      [90.75, 23.22],
      [90.88, 22.62],
      [90.76, 21.96],
      [90.22, 21.82],
      [89.86, 21.82],
      [89.96, 22.38],
    ],
  },
  {
    id: 'chattogram',
    nameEn: 'Chattogram',
    nameBn: 'চট্টগ্রাম',
    hubCityEn: 'Chattogram & Cox’s Bazar',
    hubCityBn: 'চট্টগ্রাম ও কক্সবাজার',
    specializationEn: 'Submarine Cable, Port AI & Industry',
    specializationBn: 'সাবমেরিন ক্যাবল, বন্দর এআই ও শিল্প',
    labelLonLat: [91.88, 22.72],
    points: [
      [91.22, 24.16],
      [91.68, 24.1],
      [92.04, 23.86],
      [92.42, 23.54],
      [92.58, 22.62],
      [92.64, 21.72],
      [92.34, 20.84],
      [92.18, 20.92],
      [91.96, 21.52],
      [91.78, 22.28],
      [91.28, 22.72],
      [90.88, 22.62],
      [90.75, 23.22],
      [91.12, 23.62],
    ],
  },
];

export const BANGLADESH_RIVERS: Array<{ id: string; points: Array<[number, number]> }> = [
  {
    id: 'jamuna-padma',
    points: [
      [89.72, 25.85],
      [89.66, 25.05],
      [89.76, 24.22],
      [89.82, 23.78],
      [90.25, 23.45],
      [90.68, 23.02],
      [90.82, 22.45],
    ],
  },
  {
    id: 'padma-west',
    points: [
      [88.18, 24.56],
      [88.62, 24.32],
      [89.22, 23.98],
      [89.82, 23.78],
    ],
  },
  {
    id: 'meghna',
    points: [
      [91.15, 24.35],
      [90.96, 23.95],
      [90.68, 23.52],
      [90.68, 23.02],
    ],
  },
];

export const OBSERVATORY_CORRIDORS: ObservatoryCorridor[] = [
  {
    id: 'cor-ndc-dr',
    from: [90.22, 24.07], // Kaliakoir NDC
    to: [89.21, 23.16], // Jashore DR
    labelEn: 'Sovereign GovCloud Active-Active DR Link',
    labelBn: 'গভক্লাউড সক্রিয়-সক্রিয় ডিআর লিংক',
    kind: 'compute',
  },
  {
    id: 'cor-dhk-cxb',
    from: [90.41, 23.81], // Dhaka Core
    to: [92.01, 21.43], // Cox's Bazar SEA-ME-WE
    labelEn: '2.8 Tbps Submarine Cable AI Backbone',
    labelBn: '২.৮ টেরাবিট সাবমেরিন ক্যাবল ব্যাকবোন',
    kind: 'fiber',
  },
  {
    id: 'cor-dhk-syl',
    from: [90.41, 23.81],
    to: [91.87, 24.9], // Sylhet
    labelEn: 'Haor Flood Telemetry & SUST NLP Corridor',
    labelBn: 'হাওর টেলিমেট্রি ও শাবিপ্রবি এনএলপি করিডোর',
    kind: 'telemetry',
  },
  {
    id: 'cor-dhk-raj-rng',
    from: [90.22, 24.07],
    to: [88.6, 24.37], // Rajshahi
    labelEn: 'Western Agri-Vision & Hi-Tech Corridor',
    labelBn: 'পশ্চিমাঞ্চল কৃষি-ভিশন ও হাই-টেক করিডোর',
    kind: 'fiber',
  },
  {
    id: 'cor-raj-rng',
    from: [88.6, 24.37],
    to: [89.25, 25.74], // Rangpur
    labelEn: 'Northern Climate & Krishi Extension Link',
    labelBn: 'উত্তরাঞ্চল জলবায়ু ও কৃষি সম্প্রসারণ লিংক',
    kind: 'telemetry',
  },
  {
    id: 'cor-dhk-bar',
    from: [90.41, 23.81],
    to: [90.35, 22.7], // Barishal
    labelEn: 'Southern Health & Coastal Telemetry Link',
    labelBn: 'দক্ষিণাঞ্চল স্বাস্থ্য ও উপকূলীয় টেলিমেট্রি লিংক',
    kind: 'telemetry',
  },
  {
    id: 'cor-dhk-mym',
    from: [90.22, 24.07],
    to: [90.4, 24.75], // Mymensingh
    labelEn: 'Mymensingh Research & EDGE Training Link',
    labelBn: 'ময়মনসিংহ গবেষণা ও প্রশিক্ষণ লিংক',
    kind: 'fiber',
  },
];

export function buildObservatoryInventory(dataset: CountryDataset): ObservatoryToolNode[] {
  const gpuInfra = dataset.infrastructure.find((i) => i.id === 'inf-bd-02') || dataset.infrastructure[1];
  const ndcInfra = dataset.infrastructure.find((i) => i.id === 'inf-bd-01') || dataset.infrastructure[0];
  const cloudInfra = dataset.infrastructure.find((i) => i.id === 'inf-bd-03') || dataset.infrastructure[2];
  const fiberInfra = dataset.infrastructure.find((i) => i.id === 'inf-bd-04') || dataset.infrastructure[3];
  const jashoreInfra = dataset.infrastructure.find((i) => i.id === 'inf-bd-05') || dataset.infrastructure[4];

  const proj333 = dataset.publicProjects.find((p) => p.id === 'pub-bd-01') || dataset.publicProjects[0];
  const projFlood = dataset.publicProjects.find((p) => p.id === 'pub-bd-02') || dataset.publicProjects[1];
  const projHealth = dataset.publicProjects.find((p) => p.id === 'pub-bd-03') || dataset.publicProjects[2];
  const projTax = dataset.publicProjects.find((p) => p.id === 'pub-bd-04') || dataset.publicProjects[3];
  const projKrishi = dataset.publicProjects.find((p) => p.id === 'pub-bd-05') || dataset.publicProjects[4];

  const resBangla = dataset.researchItems.find((r) => r.id === 'res-bd-01') || dataset.researchItems[0];
  const resDU = dataset.researchItems.find((r) => r.id === 'res-bd-02') || dataset.researchItems[1];
  const resBRRI = dataset.researchItems.find((r) => r.id === 'res-bd-03') || dataset.researchItems[2];
  const resIdea = dataset.researchItems.find((r) => r.id === 'res-bd-04') || dataset.researchItems[3];

  const naipPolicy = dataset.policies.find((p) => p.id === 'pol-bd-01') || dataset.policies[0];
  const pdpPolicy = dataset.policies.find((p) => p.id === 'pol-bd-02') || dataset.policies[1];
  const raiPolicy = dataset.policies.find((p) => p.id === 'pol-bd-03') || dataset.policies[2];
  const eblictPolicy = dataset.policies.find((p) => p.id === 'pol-bd-04') || dataset.policies[3];

  const rawNodes: Array<Omit<ObservatoryToolNode, 'x' | 'y'>> = [
    // ----------------------------------------------------
    // 1. NATIONAL AI INFRASTRUCTURE POINTS
    // ----------------------------------------------------
    {
      id: 'obs-gpu-kaliakoir',
      code: 'INF-GPU-01',
      nameEn: gpuInfra?.name || 'Sovereign National AI GPU Pilot Cluster',
      nameBn: 'জাতীয় সার্বভৌম এআই জিপিইউ ক্লাস্টার (কালিয়াকৈর)',
      zoneType: 'infrastructure',
      domain: 'compute',
      divisionId: 'dhaka',
      locationEn: 'Kaliakoir Hi-Tech Park, Gazipur',
      locationBn: 'কালিয়াকৈর হাই-টেক পার্ক, গাজীপুর',
      lon: 90.22,
      lat: 24.09,
      featuresEn: [
        '32x NVIDIA A100/H100 (Expanding to 96 GPUs)',
        'Tier-IV 22 MW Dedicated Sovereign Power',
        'Academic & Ministry Training Queues',
        'ISO/IEC 42001 Isolated Enclaves',
      ],
      featuresBn: [
        '৩২টি A100/H100 জিপিইউ (৯৬টিতে সম্প্রসারণশীল)',
        'টিয়ার-৪ ২২ মেগাওয়াট সার্বভৌম বিদ্যুৎ গ্রিড',
        'বিশ্ববিদ্যালয় ও মন্ত্রণালয় মডেল ট্রেনিং সারি',
        'ISO/IEC 42001 সুরক্ষিত কম্পিউট এনক্লেভ',
      ],
      metricLabelEn: 'Cluster Utilization',
      metricLabelBn: 'ক্লাস্টার ব্যবহার',
      metricValue: `${gpuInfra?.utilizationPct ?? 89}%`,
      metricNumeric: gpuInfra?.utilizationPct ?? 89,
      status: gpuInfra?.status || 'Expanding',
      institution: 'Bangladesh Computer Council (BCC)',
      linkedModule: 'm10',
      linkedSubTab: 'compute',
      evidenceId: gpuInfra?.evidenceId || 'ev-bd-02',
      summaryEn:
        'Primary national high-performance AI compute cluster powering Bangla foundation model training, sovereign NLP, and ministry inference workloads.',
      summaryBn:
        'বাংলা ফাউন্ডেশন মডেল প্রশিক্ষণ ও সরকারি এআই ইনফারেন্সের জন্য প্রধান জাতীয় উচ্চ-সক্ষমতার কম্পিউট কেন্দ্র।',
      realTimeMetrics: {
        primaryLabelEn: 'Cluster Compute Load',
        primaryLabelBn: 'ক্লাস্টার লোড',
        primaryValue: `${gpuInfra?.utilizationPct ?? 89}%`,
        primaryNumeric: gpuInfra?.utilizationPct ?? 89,
        computeLoadOrSpec: '32x NVIDIA A100/H100 Tensor Core GPUs · 80GB SXM4',
        networkLatency: '8.4 ms Intra-Datacenter Interconnect',
        throughputOrCapacity: '1.4 PFLOPS FP16 Tensor Performance',
        activeModelsOrDeployments: '14 Active Ministry Model Pipelines',
        reachOrBeneficiaries: '46 University AI Labs & 12 Ministries',
        uptimeOrSLA: '99.98% High Availability Tier-IV SLA',
        lastAssessed: '2026-11-12 09:40 UTC',
      },
      riskIndicators: {
        severity: 'Critical',
        overallScore: 20, // 4 * 5
        likelihood: 4,
        impact: 5,
        threatTitleEn: 'Compute Queue Starvation & Sovereign Infrastructure Bottleneck',
        threatTitleBn: 'কম্পিউট সারি ঘাটতি ও অবকাঠামোগত নির্ভরতার ঝুঁকি',
        threatCategoryEn: 'Critical Infrastructure',
        threatCategoryBn: 'গুরুত্বপূর্ণ অবকাঠামো',
        mitigationStatus: 'Active Mitigation',
        mitigationPlanEn:
          'Approved $18M World Bank EDGE project 64-GPU expansion; interim job batching and priority rationing for healthcare & civic triage.',
        mitigationPlanBn:
          'বিশ্বব্যাংক এজ প্রকল্পের আওতায় ৬৪টি জিপিইউ সম্প্রসারণ অনুমোদন; স্বাস্থ্য ও জনসেবা মডেলের জন্য অগ্রাধিকারমূলক রিসোর্স বরাদ্দ।',
        cirtAdvisoryCode: 'CIRT-INF-2026-08',
        lastAuditDate: '2026-11-02',
      },
      associatedPolicy: {
        policyCode: pdpPolicy?.code || 'BD-PDP-2026',
        policyTitleEn: pdpPolicy?.title || 'National Data Governance & Sovereign Cloud Policy',
        policyTitleBn: 'জাতীয় ডেটা গভর্নেন্স ও সার্বভৌম ক্লাউড নীতি',
        stage: pdpPolicy?.stage || 'Public Consultation',
        progressPct: pdpPolicy?.progressPct ?? 64,
        complianceRatePct: 78,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Clause 6.1: Sovereign In-Country Compute Mandate for Citizen Workloads',
        statutoryPrerequisiteBn: 'ধারা ৬.১: নাগরিক তথ্যের জন্য বাধ্যতামূলক দেশীয় কম্পিউট নীতি',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'BCC & ICT Division',
        evidenceRef: 'BCC-NDC-CAP-2026Q4',
        linkedModule: 'm10',
        linkedSubTab: 'compute',
      },
    },
    {
      id: 'obs-ndc-govcloud',
      code: 'INF-NDC-02',
      nameEn: ndcInfra?.name || 'National Data Centre & GovCloud BD Core',
      nameBn: 'ন্যাশনাল ডেটা সেন্টার ও গভক্লাউড বাংলাদেশ কোর',
      zoneType: 'infrastructure',
      domain: 'compute',
      divisionId: 'dhaka',
      locationEn: 'Agargaon & Gazipur Core Facilities',
      locationBn: 'আগারগাঁও ও গাজীপুর কোর সুবিধা',
      lon: 90.38,
      lat: 23.78,
      featuresEn: [
        '14.2 PB Sovereign Storage',
        '18,000 vCPU Ministry Cloud',
        'Unified API Gateway & Data Shield',
        'Zero Foreign PII Egress Policy',
      ],
      featuresBn: [
        '১৪.২ পেটাবাইট সার্বভৌম স্টোরেজ',
        '১৮,০০০ ভার্চুয়াল সিপিইউ ক্লাউড',
        'একীভূত এপিআই গেটওয়ে ও ডেটা সুরক্ষা',
        'বিদেশি সার্ভারে নাগরিক ডেটা নির্গমন রোধ',
      ],
      metricLabelEn: 'Cloud Utilization',
      metricLabelBn: 'ক্লাউড ব্যবহার',
      metricValue: `${cloudInfra?.utilizationPct ?? 74}%`,
      metricNumeric: cloudInfra?.utilizationPct ?? 74,
      status: ndcInfra?.status || 'Operational',
      institution: 'ICT Division / BCC',
      linkedModule: 'm10',
      linkedSubTab: 'cloud',
      evidenceId: cloudInfra?.evidenceId || 'ev-bd-02',
      summaryEn:
        'Sovereign government cloud and Tier-IV data centre facility hosting national citizen registries, health databases, and public AI pipelines.',
      summaryBn:
        'জাতীয় রেজিস্ট্রি, স্বাস্থ্য ডেটা ওয়্যারহাউস এবং সরকারি এআই পাইপলাইনের সার্বভৌম ক্লাউড অবকাঠামো।',
      realTimeMetrics: {
        primaryLabelEn: 'GovCloud Capacity Used',
        primaryLabelBn: 'গভক্লাউড ব্যবহৃত সক্ষমতা',
        primaryValue: `${cloudInfra?.utilizationPct ?? 74}%`,
        primaryNumeric: cloudInfra?.utilizationPct ?? 74,
        computeLoadOrSpec: '14.2 PB Sovereign Object & Block Storage · 18,000 vCPUs',
        networkLatency: '11.2 ms National IXP Peering',
        throughputOrCapacity: '120 Gbps Core Backbone Throughput',
        activeModelsOrDeployments: '38 Ministry Applications & Citizen Portals',
        reachOrBeneficiaries: '68M+ Citizen Portal Accounts',
        uptimeOrSLA: '99.99% Tier-IV Certified Continuous Uptime',
        lastAssessed: '2026-11-13 14:15 UTC',
      },
      riskIndicators: {
        severity: 'High',
        overallScore: 16, // 4 * 4
        likelihood: 4,
        impact: 4,
        threatTitleEn: 'Unauthorized Citizen Dataset Scraping & Botnet Probing',
        threatTitleBn: 'নাগরিক ডেটাসেট অননুমোদিত স্ক্র্যাপিং ও বটনেট আক্রমণ',
        threatCategoryEn: 'Privacy & Data',
        threatCategoryBn: 'গোপনীয়তা ও ডেটা সুরক্ষা',
        mitigationStatus: 'Active Mitigation',
        mitigationPlanEn:
          'Enforced BGD e-GOV CIRT Web Application Firewall rules, IP rate limiting, and zero-trust API credential rotation.',
        mitigationPlanBn:
          'সার্ট ওয়েব অ্যাপ্লিকেশন ফায়ারওয়াল, রেট-লিমিটিং ও জিরো-ট্রাস্ট এপিআই ক্রেডেনশিয়াল রোটেশন নিশ্চিত করা হয়েছে।',
        cirtAdvisoryCode: 'CIRT-CYBER-2026-44',
        lastAuditDate: '2026-11-08',
      },
      associatedPolicy: {
        policyCode: pdpPolicy?.code || 'BD-PDP-2026',
        policyTitleEn: 'National Data Governance & Sovereign Cloud Policy',
        policyTitleBn: 'জাতীয় ডেটা গভর্নেন্স ও সার্বভৌম ক্লাউড নীতি',
        stage: 'Public Consultation',
        progressPct: 64,
        complianceRatePct: 76,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Personal Data Protection Ordinance (Sec. 18 Data Localization)',
        statutoryPrerequisiteBn: 'ব্যক্তিগত তথ্য সুরক্ষা অধ্যাদেশ (ধারা ১৮ ডেটা লোকালাইজেশন)',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'BCC GovCloud Operations Wing',
        evidenceRef: 'BCC-NDC-CAP-2026Q4',
        linkedModule: 'm10',
        linkedSubTab: 'cloud',
      },
    },
    {
      id: 'obs-jashore-dr',
      code: 'INF-JSH-03',
      nameEn: jashoreInfra?.name || 'Jashore Software Park Disaster Recovery Node',
      nameBn: 'যশোর সফটওয়্যার টেকনোলজি পার্ক ডিআর ও এজ নোড',
      zoneType: 'infrastructure',
      domain: 'compute',
      divisionId: 'khulna',
      locationEn: 'Jashore, Khulna Division',
      locationBn: 'যশোর, খুলনা বিভাগ',
      lon: 89.21,
      lat: 23.16,
      featuresEn: [
        'Tier-III Geo-Redundant Failover',
        'Coastal Edge Inference Hosting',
        'Southwest Startup Incubation Pods',
        'Active-Active Sync with Kaliakoir',
      ],
      featuresBn: [
        'টিয়ার-৩ জিও-রিডানড্যান্ট ফেইলওভার',
        'উপকূলীয় এজ ইনফারেন্স হোস্টিং',
        'দক্ষিণ-পশ্চিমাঞ্চল স্টার্টআপ ইনকিউবেশন পড',
        'কালিয়াকৈরের সাথে সক্রিয়-সক্রিয় সিঙ্ক',
      ],
      metricLabelEn: 'DR Capacity Used',
      metricLabelBn: 'ডিআর সক্ষমতা ব্যবহৃত',
      metricValue: `${jashoreInfra?.utilizationPct ?? 54}%`,
      metricNumeric: jashoreInfra?.utilizationPct ?? 54,
      status: jashoreInfra?.status || 'Operational',
      institution: 'Bangladesh Hi-Tech Park Authority / BCC',
      linkedModule: 'm10',
      linkedSubTab: 'data_centres',
      evidenceId: jashoreInfra?.evidenceId || 'ev-bd-02',
      summaryEn:
        'Southwest disaster-recovery and edge-compute facility ensuring sovereign AI resilience across coastal and regional government portals.',
      summaryBn:
        'উপকূলীয় ও আঞ্চলিক সরকারি পোর্টালের নিরবচ্ছিন্ন এআই সেবার জন্য দক্ষিণ-পশ্চিমাঞ্চলীয় ডিআর ও এজ কম্পিউট কেন্দ্র।',
      realTimeMetrics: {
        primaryLabelEn: 'Edge & DR Allocation',
        primaryLabelBn: 'এজ ও ডিআর বরাদ্দ',
        primaryValue: `${jashoreInfra?.utilizationPct ?? 54}%`,
        primaryNumeric: jashoreInfra?.utilizationPct ?? 54,
        computeLoadOrSpec: 'Tier-III 4,000 vCPU Hot Standby · 3.8 PB Disaster Replica',
        networkLatency: '14.6 ms RTT to Dhaka Gateway',
        throughputOrCapacity: '40 Gbps Dedicated DWDM Sync Link',
        activeModelsOrDeployments: '8 Edge Models (Agri & Telemedicine)',
        reachOrBeneficiaries: '10 Southern Districts Local Ingress',
        uptimeOrSLA: '99.95% Availability SLA',
        lastAssessed: '2026-11-10 11:30 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 9, // 3 * 3
        likelihood: 3,
        impact: 3,
        threatTitleEn: 'Power Grid Volatility During Severe Cyclonic Storms',
        threatTitleBn: 'তীব্র ঘূর্ণিঝড়ে বিদ্যুৎ সংযোগ বিচ্ছিন্নতার ঝুঁকি',
        threatCategoryEn: 'Critical Infrastructure',
        threatCategoryBn: 'গুরুত্বপূর্ণ অবকাঠামো',
        mitigationStatus: 'Monitored',
        mitigationPlanEn:
          '72-hour dual redundant diesel generators and automatic transfer switch verified in Q3 stress testing.',
        mitigationPlanBn:
          '৭২ ঘণ্টার ডুয়াল জেনারেটর ব্যাকআপ ও স্বয়ংক্রিয় পাওয়ার সুইচ নিশ্চিত করা হয়েছে।',
        cirtAdvisoryCode: 'CIRT-DR-2026-11',
        lastAuditDate: '2026-10-18',
      },
      associatedPolicy: {
        policyCode: 'BD-PDP-2026',
        policyTitleEn: 'National Data Governance & Sovereign Cloud Policy',
        policyTitleBn: 'জাতীয় ডেটা গভর্নেন্স ও সার্বভৌম ক্লাউড নীতি',
        stage: 'Public Consultation',
        progressPct: 64,
        complianceRatePct: 82,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Disaster Recovery and Business Continuity Standard (ISO 22301)',
        statutoryPrerequisiteBn: 'দুর্যোগ পুনরুদ্ধার ও পরিচালন মানদণ্ড (ISO 22301)',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'Hi-Tech Park Authority',
        evidenceRef: 'BCC-NDC-CAP-2026Q4',
        linkedModule: 'm10',
        linkedSubTab: 'data_centres',
      },
    },
    {
      id: 'obs-cxb-cable',
      code: 'INF-CXB-04',
      nameEn: 'SEA-ME-WE 4/5/6 Submarine AI Connectivity Gate',
      nameBn: 'কক্সবাজার সাবমেরিন ক্যাবল ও জাতীয় ব্যাকবোন গেটওয়ে',
      zoneType: 'infrastructure',
      domain: 'compute',
      divisionId: 'chattogram',
      locationEn: 'Cox’s Bazar Cable Landing Station',
      locationBn: 'কক্সবাজার সাবমেরিন ক্যাবল ল্যান্ডিং স্টেশন',
      lon: 92.01,
      lat: 21.43,
      featuresEn: [
        '2.8 Tbps Lit Submarine Capacity',
        '4,200+ Union Fiber Connectivity',
        'Low-Latency International IXP Peering',
        'BTRC Cross-Border Routing Telemetry',
      ],
      featuresBn: [
        '২.৮ টেরাবিট সাবমেরিন ক্যাবল সক্ষমতা',
        '৪,২০০+ ইউনিয়ন ফাইবার সংযোগ',
        'স্বল্প-বিলম্বিতার আন্তর্জাতিক আইএক্সপি পিয়ারিং',
        'বিটিআরসি ক্রস-বর্ডার ডেটা রাউটিং টেলিমেট্রি',
      ],
      metricLabelEn: 'Backbone Utilization',
      metricLabelBn: 'ব্যাকবোন ব্যবহার',
      metricValue: `${fiberInfra?.utilizationPct ?? 63}%`,
      metricNumeric: fiberInfra?.utilizationPct ?? 63,
      status: fiberInfra?.status || 'Expanding',
      institution: 'BTRC & BSCCL',
      linkedModule: 'm10',
      linkedSubTab: 'connectivity',
      evidenceId: fiberInfra?.evidenceId || 'ev-bd-02',
      summaryEn:
        'International submarine cable landing and Info-Sarker union fiber distribution backbone linking all 64 districts.',
      summaryBn:
        'সারা দেশের ৬৪ জেলাকে সংযুক্তকারী আন্তর্জাতিক সাবমেরিন ক্যাবল ও ইনফো-সরকার ইউনিয়ন ফাইবার ব্যাকবোন।',
      realTimeMetrics: {
        primaryLabelEn: 'Lit Gateway Bandwidth',
        primaryLabelBn: 'গেটওয়ে ব্যান্ডউইথ',
        primaryValue: `${fiberInfra?.utilizationPct ?? 63}%`,
        primaryNumeric: fiberInfra?.utilizationPct ?? 63,
        computeLoadOrSpec: 'SEA-ME-WE 4 & 5 Landing · SEA-ME-WE 6 Under Commissioning',
        networkLatency: '28.2 ms to Singapore Cloud Hub · 34.1 ms to Mumbai',
        throughputOrCapacity: '2.8 Tbps Lit International Bandwidth',
        activeModelsOrDeployments: 'Cross-Border API Traffic Routing & Inspection',
        reachOrBeneficiaries: '64 Districts & 4,200 Union Digital Centres',
        uptimeOrSLA: '99.995% Subsea Cable Availability',
        lastAssessed: '2026-11-14 06:00 UTC',
      },
      riskIndicators: {
        severity: 'High',
        overallScore: 16,
        likelihood: 4,
        impact: 4,
        threatTitleEn: 'Single-Corridor Subsea Cable Anchoring Disruption Risk',
        threatTitleBn: 'সাবমেরিন ক্যাবল একক করিডোরে নোঙরজনিত বিভ্রাট ঝুঁকি',
        threatCategoryEn: 'Critical Infrastructure',
        threatCategoryBn: 'গুরুত্বপূর্ণ অবকাঠামো',
        mitigationStatus: 'Containment Active',
        mitigationPlanEn:
          'Kuakata (SEA-ME-WE 5) geo-diverse fallback routing activated; third subsea link (SMW6) civil construction expedited.',
        mitigationPlanBn:
          'কুয়াকাটা বিকল্প রুট স্বয়ংক্রিয়ভাবে সক্রিয়; এসএমডব্লিউ-৬ ক্যাবল সংযোগের কাজ দ্রুত বাস্তবায়ন করা হচ্ছে।',
        cirtAdvisoryCode: 'BTRC-NET-2026-03',
        lastAuditDate: '2026-10-25',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 71,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Telecommunication Act 2001 & Sovereign Routing Directive',
        statutoryPrerequisiteBn: 'টেলিযোগাযোগ আইন ২০০১ ও সার্বভৌম ডেটা রাউটিং নির্দেশিকা',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'BTRC & Posts and Telecommunications Division',
        evidenceRef: 'BCC-NDC-CAP-2026Q4',
        linkedModule: 'm10',
        linkedSubTab: 'connectivity',
      },
    },

    // ----------------------------------------------------
    // 2. RESEARCH & INNOVATION HUBS
    // ----------------------------------------------------
    {
      id: 'obs-bangla-llm',
      code: 'RES-BUET-01',
      nameEn: resBangla?.title || 'BanglaLLaMA-13B & EBLICT Speech Research Consortium',
      nameBn: 'বাংলা-লামা ১৩বি ও ইবলিক্ট বাংলা এনএলপি গবেষণা কনসোর্টিয়াম',
      zoneType: 'research_hub',
      domain: 'nlp_research',
      divisionId: 'dhaka',
      locationEn: 'BUET RISE & EBLICT Consortium, Palashi, Dhaka',
      locationBn: 'বুয়েট রাইজ ও ইবলিক্ট কনসোর্টিয়াম, পলাশী, ঢাকা',
      lon: 90.39,
      lat: 23.72,
      featuresEn: [
        '400M+ Token Sovereign Bangla Corpus',
        '8 Regional Dialect Speech Benchmarks',
        '42% Lower Civic Query Hallucination',
        'Open OCR, TTS & Unicode Standards',
      ],
      featuresBn: [
        '৪০ কোটি+ টোকেনের সার্বভৌম বাংলা কর্পাস',
        '৮টি আঞ্চলিক উপভাষার স্পিচ বেঞ্চমার্ক',
        'নাগরিক প্রশ্নে ৪২% কম হ্যালুসিনেশন',
        'উন্মুক্ত বাংলা ওসিআর, টিটিএস ও ইউনিকোড মানদণ্ড',
      ],
      metricLabelEn: 'R&D Grant Pool',
      metricLabelBn: 'গবেষণা তহবিল',
      metricValue: `$${((resBangla?.fundingAmountUSD ?? 1450000) / 1000000).toFixed(2)}M`,
      metricNumeric: 82,
      status: resBangla?.trlOrStage || 'TRL 6 · Field Pilot',
      institution: 'BUET RISE & BCC EBLICT',
      linkedModule: 'm12',
      linkedSubTab: 'projects',
      evidenceId: resBangla?.evidenceId || 'ev-bd-03',
      summaryEn:
        'Sovereign Bangla foundation language and speech models providing low-hallucination NLP infrastructure for public citizen services.',
      summaryBn:
        'সরকারি পোর্টালের জন্য নির্ভুল ও কম হ্যালুসিনেশনযুক্ত সার্বভৌম বাংলা ল্যাঙ্গুয়েজ ও স্পিচ ফাউন্ডেশন মডেল।',
      realTimeMetrics: {
        primaryLabelEn: 'Bangla Corpus Coverage',
        primaryLabelBn: 'বাংলা কর্পাস পরিধি',
        primaryValue: '400M+ Tokens',
        primaryNumeric: 88,
        computeLoadOrSpec: 'Allocated 16x A100 GPU Nodes at Kaliakoir Cluster',
        networkLatency: '180 ms Average Inference Latency',
        throughputOrCapacity: '1,200 Tokens / Second Generation Speed',
        activeModelsOrDeployments: 'BanglaLLaMA-7B, 13B & Regional ASR Dialect Models',
        reachOrBeneficiaries: 'Open Access to 46 Universities & GovTech',
        uptimeOrSLA: 'TRL 6 Field Pilot Benchmarked',
        lastAssessed: '2026-11-03 16:30 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 12,
        likelihood: 4,
        impact: 3,
        threatTitleEn: 'Regional Dialect Bias & Underrepresentation of Rural Lexicons',
        threatTitleBn: 'আঞ্চলিক উপভাষা বায়াস ও প্রান্তিক শব্দভাণ্ডারের ঘাটতি',
        threatCategoryEn: 'Algorithmic Bias',
        threatCategoryBn: 'অ্যালগরিদমিক পক্ষপাত',
        mitigationStatus: 'Active Mitigation',
        mitigationPlanEn:
          'Expanded audio crowdsourcing across Sylhet, Chittagong, and Noakhali divisions to reach parity target by Q1 2027.',
        mitigationPlanBn:
          'সিলেট, চট্টগ্রাম ও নোয়াখালী উপভাষার অডিও ডেটা সংগ্রহের মাধ্যমে সমতা নিশ্চিতকরণ চলমান।',
        cirtAdvisoryCode: 'NLP-ETHICS-2026-02',
        lastAuditDate: '2026-10-14',
      },
      associatedPolicy: {
        policyCode: eblictPolicy?.code || 'BD-EBLICT-25',
        policyTitleEn: eblictPolicy?.title || 'Sovereign Bangla Language AI & Cultural Preservation Directive',
        policyTitleBn: 'সার্বভৌম বাংলা ভাষা এআই ও সাংস্কৃতিক সংরক্ষণ নির্দেশিকা',
        stage: eblictPolicy?.stage || 'Enacted',
        progressPct: eblictPolicy?.progressPct ?? 88,
        complianceRatePct: 91,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Bangla Language Implementation Act 1987 & BSTI Unicode 15.0',
        statutoryPrerequisiteBn: 'বাংলা ভাষা প্রচলন আইন ১৯৮৭ ও বিএসটিআই ইউনিকোড ১৫.০',
        targetGazetteDate: 'Enacted',
        nodalAgency: 'BCC & Ministry of Cultural Affairs',
        evidenceRef: 'EBLICT-CORPUS-2026',
        linkedModule: 'm12',
        linkedSubTab: 'projects',
      },
    },
    {
      id: 'obs-sust-agri',
      code: 'RES-SYL-02',
      nameEn: resBRRI?.title || 'SUST & BRRI Haor Precision AgriTech Vision Lab',
      nameBn: 'শাবিপ্রবি ও ব্রি হাওর নির্ভুল কৃষি কম্পিউটার ভিশন ল্যাব',
      zoneType: 'research_hub',
      domain: 'nlp_research',
      divisionId: 'sylhet',
      locationEn: 'SUST Campus & BRRI Station, Sylhet',
      locationBn: 'শাবিপ্রবি ক্যাম্পাস ও ব্রি আঞ্চলিক কেন্দ্র, সিলেট',
      lon: 91.83,
      lat: 24.92,
      featuresEn: [
        'Sylheti Dialect Speech Annotation',
        'Rice & Potato Blight Dataset Lab',
        'TRL 7 Farmer Diagnostic Beta',
        'Open Academic Model Weights',
      ],
      featuresBn: [
        'সিলেটি উপভাষা স্পিচ ডেটা অ্যানোটেশন',
        'ধান ও আলু রোগ শনাক্তকরণ ডেটাসেট',
        'টিআরএল-৭ পর্যায়ের কৃষক অ্যাপ বিটা',
        'উন্মুক্ত একাডেমিক মডেল ওয়েটস',
      ],
      metricLabelEn: 'Technology Readiness',
      metricLabelBn: 'প্রযুক্তি প্রস্তুতি স্তর',
      metricValue: 'TRL 7',
      metricNumeric: 78,
      status: 'TRL 7 · Field Beta',
      institution: 'SUST & Bangladesh Rice Research Institute (BRRI)',
      linkedModule: 'm12',
      linkedSubTab: 'institutions',
      evidenceId: resBRRI?.evidenceId || 'ev-bd-03',
      summaryEn:
        'Northeastern research hub advancing agricultural computer vision, crop disease diagnostics, and regional dialect voice models.',
      summaryBn:
        'উত্তর-পূর্বাঞ্চলীয় গবেষণা কেন্দ্র যা কৃষি কম্পিউটার ভিশন, শস্য রোগ নির্ণয় ও আঞ্চলিক উপভাষা নিয়ে কাজ করছে।',
      realTimeMetrics: {
        primaryLabelEn: 'Vision Model Accuracy',
        primaryLabelBn: 'ভিশন মডেল নির্ভুলতা',
        primaryValue: '93.4% Blight F1-Score',
        primaryNumeric: 93,
        computeLoadOrSpec: 'Edge Jetson & Server Cluster with 48,000 Annotated Images',
        networkLatency: 'Offline Capable On-Device Inference (<40ms)',
        throughputOrCapacity: '350 Disease Diagnostics Processed Daily',
        activeModelsOrDeployments: 'Krishi-Vision v2.4 (Paddy, Potato, Haor crops)',
        reachOrBeneficiaries: '14,000 Smallholder Haor Farmers in Field Pilot',
        uptimeOrSLA: 'TRL 7 Field Trial Validation',
        lastAssessed: '2026-11-06 10:00 UTC',
      },
      riskIndicators: {
        severity: 'Low',
        overallScore: 6,
        likelihood: 2,
        impact: 3,
        threatTitleEn: 'Adverse Weather Imaging Noise During Flash Flood Seasons',
        threatTitleBn: 'বন্যা ও বৈরী আবহাওয়ায় ক্যামেরার ছবির মান হ্রাসের ঝুঁকি',
        threatCategoryEn: 'Model Vulnerability',
        threatCategoryBn: 'মডেল সংবেদনশীলতা',
        mitigationStatus: 'Controlled',
        mitigationPlanEn:
          'Integrated synthetic fog/rain augmentation and automated image quality check before confidence inference.',
        mitigationPlanBn:
          'কৃত্রিম আবহাওয়া অগমেন্টেশন ও স্বয়ংক্রিয় ইমেজ কোয়ালিটি যাচাই যুক্ত করা হয়েছে।',
        cirtAdvisoryCode: 'AGRI-VAL-2026-01',
        lastAuditDate: '2026-10-28',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 85,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Section 5.3: Agriculture & Climate Resilience AI Mandate',
        statutoryPrerequisiteBn: 'ধারা ৫.৩: কৃষি ও জলবায়ু সহনশীলতা এআই অগ্রাধিকার',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'Ministry of Agriculture & UGC',
        evidenceRef: 'EBLICT-CORPUS-2026',
        linkedModule: 'm12',
        linkedSubTab: 'institutions',
      },
    },
    {
      id: 'obs-bau-genomics',
      code: 'RES-MYM-03',
      nameEn: resDU?.title || 'Bioinformatics, Health AI & Crop Genomics Hub',
      nameBn: 'বায়োইনফরমেটিক্স, স্বাস্থ্য এআই ও কৃষি জিনোমিক্স ল্যাব',
      zoneType: 'research_hub',
      domain: 'nlp_research',
      divisionId: 'mymensingh',
      locationEn: 'Mymensingh Agricultural University & DU Belt',
      locationBn: 'ময়মনসিংহ কৃষি বিশ্ববিদ্যালয় ও ঢাবি গবেষণা বলয়',
      lon: 90.42,
      lat: 24.73,
      featuresEn: [
        'Dengue & TB Chest X-Ray Triage AI',
        'Crop & Livestock Genomics ML',
        'Clinical Validation Sandbox',
        'University Talent Pipeline (46 Campuses)',
      ],
      featuresBn: [
        'ডেঙ্গু ও যক্ষ্মা এক্স-রে ট্রায়াজ এআই',
        'ফসল ও প্রাণিসম্পদ জিনোমিক্স এমএল',
        'ক্লিনিক্যাল যাচাইকরণ স্যান্ডবক্স',
        '৪৬টি বিশ্ববিদ্যালয়ে এআই গবেষণা সংযোগ',
      ],
      metricLabelEn: 'Research Grants',
      metricLabelBn: 'গবেষণা অনুদান',
      metricValue: `$${((resDU?.fundingAmountUSD ?? 820000) / 1000).toFixed(0)}K`,
      metricNumeric: 72,
      status: resDU?.trlOrStage || 'TRL 5 · Clinical Validation',
      institution: 'University of Dhaka & BAU',
      linkedModule: 'm12',
      linkedSubTab: 'database',
      evidenceId: resDU?.evidenceId || 'ev-bd-03',
      summaryEn:
        'Biomedical diagnostics and agricultural genomics research labs linking Dhaka University and Mymensingh researchers.',
      summaryBn:
        'স্বাস্থ্য ইমেজিং ও কৃষি জিনোমিক্স গবেষণায় যুক্ত ময়মনসিংহ ও ঢাকা বিশ্ববিদ্যালয়ের সম্মিলিত এআই ল্যাব।',
      realTimeMetrics: {
        primaryLabelEn: 'Diagnostic Validation F1',
        primaryLabelBn: 'ডায়াগনস্টিক নির্ভুলতা',
        primaryValue: '91.8% F1-Score',
        primaryNumeric: 91,
        computeLoadOrSpec: 'High-Memory Compute Node (512GB RAM) for Genomic Sequences',
        networkLatency: 'Local GPU Inference (120ms per X-Ray Scan)',
        throughputOrCapacity: '1,400 Genomic Variant Pipelines Computed',
        activeModelsOrDeployments: 'TB-Screen ML & Dengue Platelet Estimator',
        reachOrBeneficiaries: '4 Clinical Partner Hospitals in Mymensingh & Dhaka',
        uptimeOrSLA: 'TRL 5 Clinical Validation In Progress',
        lastAssessed: '2026-11-09 13:00 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 12,
        likelihood: 3,
        impact: 4,
        threatTitleEn: 'Clinical False Negatives in Non-Standard Digital Radiography',
        threatTitleBn: 'নন-স্ট্যান্ডার্ড ডিজিটাল এক্স-রেতে ডায়াগনস্টিক ত্রুটির ঝুঁকি',
        threatCategoryEn: 'Model Vulnerability',
        threatCategoryBn: 'মডেল দুর্বলতা',
        mitigationStatus: 'Under Review',
        mitigationPlanEn:
          'Mandatory radiologist-in-the-loop review for all positive and borderline classifications; no automated diagnostic discharge.',
        mitigationPlanBn:
          'সকল সন্দেহজনক ক্ষেত্রে চিকিৎসকের বাধ্যতামূলক রিভিউ বাধ্যতামূলক করা হয়েছে।',
        cirtAdvisoryCode: 'MED-AI-2026-07',
        lastAuditDate: '2026-10-30',
      },
      associatedPolicy: {
        policyCode: 'BD-RAI-2026',
        policyTitleEn: 'Public Sector Responsible AI & Procurement Guideline',
        policyTitleBn: 'সরকারি খাতে দায়িত্বশীল এআই ও ক্রয় নির্দেশিকা',
        stage: 'Drafting',
        progressPct: 52,
        complianceRatePct: 68,
        aiaAuditStatus: 'Conditional',
        statutoryPrerequisiteEn: 'BMDC Medical Device Software Regulatory Framework Alignment',
        statutoryPrerequisiteBn: 'বিএমডিসি সফটওয়্যার নিয়ন্ত্রণ নীতিমালার সাথে সংগতি',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'Directorate General of Health Services & UGC',
        evidenceRef: 'A2I-UGC-READINESS-26',
        linkedModule: 'm08',
        linkedSubTab: 'ethical',
      },
    },
    {
      id: 'obs-idea-startups',
      code: 'RES-IDEA-05',
      nameEn: resIdea?.title || 'iDEA & Startup Bangladesh National AI Innovation Incubator',
      nameBn: 'আইডিয়া ও স্টার্টআপ বাংলাদেশ জাতীয় এআই ইনকিউবেশন হাব',
      zoneType: 'research_hub',
      domain: 'nlp_research',
      divisionId: 'dhaka',
      locationEn: 'ICT Tower, Agargaon, Dhaka',
      locationBn: 'আইসিটি টাওয়ার, আগারগাঁও, ঢাকা',
      lon: 90.38,
      lat: 23.77,
      featuresEn: [
        '38 Active Seed-Funded AI Startups',
        'Free GPU Cloud Credits for Ventures',
        'FinTech, AgriTech & Civic AI Tracks',
        'IP & Patent Assistance Desk',
      ],
      featuresBn: [
        '৩৮টি সক্রিয় বীজতহবিলপ্রাপ্ত এআই স্টার্টআপ',
        'উদ্যোক্তাদের জন্য ফ্রি জিপিইউ ক্লাউড ক্রেডিট',
        'ফিনটেক, এগ্রিটেক ও নাগরিক সেবা এআই ট্র্যাক',
        'মেধাস্বত্ব ও পেটেন্ট সহায়তা ডেস্ক',
      ],
      metricLabelEn: 'Venture Grant Pool',
      metricLabelBn: 'ভেঞ্চার ফান্ড পুল',
      metricValue: `$${((resIdea?.fundingAmountUSD ?? 4200000) / 1000000).toFixed(1)}M`,
      metricNumeric: 84,
      status: 'Active Venture Cohort',
      institution: 'Startup Bangladesh Ltd. & iDEA Project',
      linkedModule: 'm12',
      linkedSubTab: 'startups',
      evidenceId: 'ev-bd-05',
      summaryEn:
        'National seed-funding accelerator and sovereign GPU compute credit distribution hub for high-impact domestic AI ventures.',
      summaryBn:
        'দেশীয় এআই উদ্যোক্তাদের জন্য বীজ তহবিল ও জিপিইউ কম্পিউট ক্রেডিট সহায়তাকারী জাতীয় ইনকিউবেটর।',
      realTimeMetrics: {
        primaryLabelEn: 'Active AI Startups',
        primaryLabelBn: 'সক্রিয় এআই স্টার্টআপ',
        primaryValue: '38 Firms Funded',
        primaryNumeric: 38,
        computeLoadOrSpec: 'Allocated $450K GPU Credits across GovCloud & Partner Nodes',
        networkLatency: 'Direct 10 Gbps Fiber Access to High-Tech Park',
        throughputOrCapacity: '$4.2M Committed Venture Capital Pool',
        activeModelsOrDeployments: '22 Startups in Production Testing',
        reachOrBeneficiaries: '1,200 High-Skill AI Engineering Jobs Created',
        uptimeOrSLA: 'Active Quarterly Investment Rounds',
        lastAssessed: '2026-11-12 12:00 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 9,
        likelihood: 3,
        impact: 3,
        threatTitleEn: 'Intellectual Property Protection & Model Weight Leakage',
        threatTitleBn: 'মেধাস্বত্ব সুরক্ষা ও মডেল পাইরেসির ঝুঁকি',
        threatCategoryEn: 'Cyber & Model Security',
        threatCategoryBn: 'মডেল ও সাইবার নিরাপত্তা',
        mitigationStatus: 'Controlled',
        mitigationPlanEn:
          'Standardized safe escrow contracts, encrypted code repositories, and patent filing subsidies under ICT Division.',
        mitigationPlanBn:
          'নিরাপদ এনক্রিপ্টেড কোড রিপোজিটরি ও পেটেন্ট ফাইলিং ভর্তুকি প্রদান করা হচ্ছে।',
        cirtAdvisoryCode: 'STARTUP-IP-2026-04',
        lastAuditDate: '2026-10-15',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 88,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Startup Ecosystem Facilitation Act & Sandbox Provisions',
        statutoryPrerequisiteBn: 'স্টার্টআপ ইকোসিস্টেম নীতিমালা ও স্যান্ডবক্স সুবিধা',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'Startup Bangladesh Ltd. / ICT Division',
        evidenceRef: 'A2I-UGC-READINESS-26',
        linkedModule: 'm12',
        linkedSubTab: 'startups',
      },
    },

    // ----------------------------------------------------
    // 3. POLICY DEVELOPMENT & GOVERNANCE ZONES
    // ----------------------------------------------------
    {
      id: 'obs-naip-policy',
      code: 'POL-NAIC-01',
      nameEn: 'National AI Advisory Council & Policy Development Cell',
      nameBn: 'জাতীয় এআই উপদেষ্টা পরিষদ ও নীতি উন্নয়ন সেল',
      zoneType: 'policy_zone',
      domain: 'safety_policy',
      divisionId: 'dhaka',
      locationEn: 'Bangladesh Secretariat, Cabinet Division, Dhaka',
      locationBn: 'বাংলাদেশ সচিবালয়, মন্ত্রিপরিষদ বিভাগ, ঢাকা',
      lon: 90.41,
      lat: 23.73,
      featuresEn: [
        '5-Pillar National AI Strategy Governance',
        'Mandatory Algorithmic Impact Assessments (AIA)',
        'Inter-Ministerial AI Accountability Matrix',
        'Cabinet Gazette Approval Tracking',
      ],
      featuresBn: [
        '৫-স্তম্ভ জাতীয় এআই কৌশল গভর্নেন্স',
        'বাধ্যতামূলক অ্যালগরিদমিক প্রভাব মূল্যায়ন (AIA)',
        'আন্তঃমন্ত্রণালয় এআই জবাবদিহিতা কাঠামো',
        'মন্ত্রিপরিষদ গেজেট বাস্তবায়ন ট্র্যাকিং',
      ],
      metricLabelEn: 'Policy Progress',
      metricLabelBn: 'নীতি অগ্রগতি',
      metricValue: `${naipPolicy?.progressPct ?? 76}%`,
      metricNumeric: naipPolicy?.progressPct ?? 76,
      status: naipPolicy?.stage || 'Inter-Ministerial Review',
      institution: 'Cabinet Division & ICT Division',
      linkedModule: 'm03',
      linkedSubTab: 'development',
      evidenceId: naipPolicy?.evidenceId || 'ev-bd-01',
      summaryEn:
        'Apex sovereign policy chamber coordinating national AI strategy enactment, public consultations, and mandatory impact evaluations.',
      summaryBn:
        'জাতীয় এআই নীতি প্রণয়ন, গণ-পরামর্শ ও বাধ্যতামূলক প্রভাব মূল্যায়ন পরিচালনাকারী শীর্ষ পরিষদ।',
      realTimeMetrics: {
        primaryLabelEn: 'National Policy Progress',
        primaryLabelBn: 'জাতীয় নীতি অগ্রগতি',
        primaryValue: `${naipPolicy?.progressPct ?? 76}%`,
        primaryNumeric: naipPolicy?.progressPct ?? 76,
        computeLoadOrSpec: 'Apex Council Mandate Across 38 Ministries',
        networkLatency: 'Inter-Agency Direct Secure Telemetry Mesh',
        throughputOrCapacity: '15 National Action Plan Programmes Active',
        activeModelsOrDeployments: '12 Deployed Systems Monitored',
        reachOrBeneficiaries: '173.5M Sovereign Population Framework',
        uptimeOrSLA: 'Active Cabinet Agenda Item',
        lastAssessed: '2026-11-14 08:30 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 12,
        likelihood: 3,
        impact: 4,
        threatTitleEn: 'Legislative Delays in Enacting Personal Data Protection Bill',
        threatTitleBn: 'ব্যক্তিগত তথ্য সুরক্ষা আইন পাসে আইনগত বিলম্বের ঝুঁকি',
        threatCategoryEn: 'Policy & Regulatory Gap',
        threatCategoryBn: 'নীতি ও আইনি ঘাটতি',
        mitigationStatus: 'Active Mitigation',
        mitigationPlanEn:
          'Special parliamentary committee reviewing Draft Ordinance Rev. 4; interim executive circulars issued to prevent high-risk algorithmic deployment.',
        mitigationPlanBn:
          'বিশেষ সংসদীয় কমিটি খসড়া অধ্যাদেশ যাচাই করছে; ঝুঁকি রোধে অন্তর্বর্তীকালীন সার্কুলার জারি রয়েছে।',
        cirtAdvisoryCode: 'POLICY-GAP-2026-01',
        lastAuditDate: '2026-10-28',
      },
      associatedPolicy: {
        policyCode: naipPolicy?.code || 'BD-NAIP-2026',
        policyTitleEn: naipPolicy?.title || 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: naipPolicy?.stage || 'Inter-Ministerial Review',
        progressPct: naipPolicy?.progressPct ?? 76,
        complianceRatePct: 78,
        aiaAuditStatus: 'Mandatory Pre-Audit',
        statutoryPrerequisiteEn: 'Cabinet Gazette & Inter-Ministerial Council Mandate',
        statutoryPrerequisiteBn: 'মন্ত্রিপরিষদ গেজেট ও আন্তঃমন্ত্রণালয় কাউন্সিল ম্যান্ডেট',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'National AI Council / ICT Division',
        evidenceRef: 'ICT-NAIP-2026-REV3',
        linkedModule: 'm03',
        linkedSubTab: 'development',
      },
    },
    {
      id: 'obs-cirt-forensics',
      code: 'POL-CIRT-02',
      nameEn: 'BGD e-GOV CIRT Deepfake Forensics & AI Cybersecurity Lab',
      nameBn: 'বিজিডি ই-গভ সার্ট ডিপফেক ফরেনসিক ও সাইবার ডিফেন্স উইং',
      zoneType: 'policy_zone',
      domain: 'safety_policy',
      divisionId: 'dhaka',
      locationEn: 'National Cyber Security Wing, Agargaon, Dhaka',
      locationBn: 'জাতীয় সাইবার নিরাপত্তা উইং, আগারগাঁও, ঢাকা',
      lon: 90.37,
      lat: 23.86,
      featuresEn: [
        'Bangla Voice Cloning Spoof Detection',
        'MFS e-KYC Liveness Verification',
        'Public Portal Red-Teaming & Guardrails',
        '24/7 National AI Threat Feed',
      ],
      featuresBn: [
        'বাংলা ভয়েস ক্লোনিং ও স্পুফিং শনাক্তকরণ',
        'এমএফএস ই-কেওয়াইসি লাইভনেস যাচাই',
        'সরকারি পোর্টাল রেড-টিমিং ও সুরক্ষা',
        '২৪/৭ জাতীয় এআই থ্রেট ফিড',
      ],
      metricLabelEn: 'Active Threat Signals',
      metricLabelBn: 'সক্রিয় হুমকি সংকেত',
      metricValue: `${dataset.watchSignals.filter((w) => w.status !== 'Resolved').length} Active`,
      metricNumeric: 86,
      status: 'Containment Active',
      institution: 'BGD e-GOV CIRT / National Cyber Security Agency',
      linkedModule: 'm15',
      linkedSubTab: 'incident_reporting',
      evidenceId: 'ev-bd-06',
      summaryEn:
        '24/7 national AI cybersecurity and synthetic media forensics center defending public portals and mobile financial systems against voice cloning and prompt injection attacks.',
      summaryBn:
        'বাংলা ভয়েস ক্লোনিং ও সাইবার আক্রমণ থেকে সরকারি সেবা ও আর্থিক খাতকে রক্ষায় ২৪/৭ নিয়োজিত জাতীয় নিরাপত্তা কেন্দ্র।',
      realTimeMetrics: {
        primaryLabelEn: 'Real-Time Threat Detection',
        primaryLabelBn: 'হুমকি শনাক্তকরণ',
        primaryValue: '98.2% Spoof Catch Rate',
        primaryNumeric: 98,
        computeLoadOrSpec: 'Continuous Audio-Visual Forensic Cluster (GPU Ingest)',
        networkLatency: 'Sub-Second Forensic Telemetry Processing',
        throughputOrCapacity: '340+ Forensic Audio Vectors Scanned / Hour',
        activeModelsOrDeployments: 'Anti-Spoofing Bangla Speech Verifier v3.1',
        reachOrBeneficiaries: 'All MFS Providers (bKash, Nagad, Rocket) & Public Portals',
        uptimeOrSLA: '24/7/365 Continuous Threat Watch',
        lastAssessed: '2026-11-14 09:12 UTC',
      },
      riskIndicators: {
        severity: 'Critical',
        overallScore: 25, // 5 * 5
        likelihood: 5,
        impact: 5,
        threatTitleEn: 'Synthetic Bangla Voice Cloning Targeting Mobile Financial Helplines',
        threatTitleBn: 'মোবাইল আর্থিক সেবা লক্ষ্য করে সিন্থেটিক বাংলা ভয়েস ক্লোনিং প্রতারণা',
        threatCategoryEn: 'Disinformation & Deepfake',
        threatCategoryBn: 'অপতথ্য ও ডিপফেক',
        mitigationStatus: 'Containment Active',
        mitigationPlanEn:
          'Mandatory biometric spectral liveness check implemented for tele-banking; live CIRT blacklist synchronized with telcos every 15 minutes.',
        mitigationPlanBn:
          'টেলিব্যাংকিংয়ে স্পেকট্রাল লাইভনেস ভেরিফিকেশন ও প্রতি ১৫ মিনিটে টেলকোদের সাথে ব্ল্যাকলিস্ট সিঙ্ক কার্যকর।',
        cirtAdvisoryCode: 'CIRT-AI-THREAT-2026-11',
        lastAuditDate: '2026-11-12',
      },
      associatedPolicy: {
        policyCode: 'BD-CSA-2026',
        policyTitleEn: 'Cyber Security Act & Critical Information Infrastructure Framework',
        policyTitleBn: 'সাইবার নিরাপত্তা আইন ও গুরুত্বপূর্ণ তথ্য পরিকাঠামো নির্দেশিকা',
        stage: 'Enacted',
        progressPct: 72,
        complianceRatePct: 84,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'CII Designation under Cyber Security Act Section 15',
        statutoryPrerequisiteBn: 'সাইবার নিরাপত্তা আইন ধারা ১৫ অনুযায়ী সিআইআই নোটিফিকেশন',
        targetGazetteDate: 'Enacted',
        nodalAgency: 'BGD e-GOV CIRT',
        evidenceRef: 'CIRT-AI-THREAT-2026-11',
        linkedModule: 'm15',
        linkedSubTab: 'incident_reporting',
      },
    },
    {
      id: 'obs-bb-sandbox',
      code: 'POL-BB-03',
      nameEn: 'Bangladesh Bank FinTech AI Sandbox & Explainability Chamber',
      nameBn: 'বাংলাদেশ ব্যাংক ফিনটেক এআই স্যান্ডবক্স ও ব্যাখ্যাযোগ্যতা সেল',
      zoneType: 'policy_zone',
      domain: 'safety_policy',
      divisionId: 'dhaka',
      locationEn: 'Bangladesh Bank Headquarters, Motijheel, Dhaka',
      locationBn: 'বাংলাদেশ ব্যাংক প্রধান কার্যালয়, মতিঝিল, ঢাকা',
      lon: 90.42,
      lat: 23.73,
      featuresEn: [
        'Automated Credit Scoring Explainability Standards',
        'Regulatory FinTech Sandbox Cohorts',
        'Adverse Decision Reason Codes in Bangla',
        'Algorithmic Fairness Testing for Micro-Credit',
      ],
      featuresBn: [
        'স্বয়ংক্রিয় ক্রেডিট স্কোরিং ব্যাখ্যাযোগ্যতা মানদণ্ড',
        'রেগুলেটরি ফিনটেক স্যান্ডবক্স কোহোর্ট',
        'বাংলায় ঋণ বাতিলের কারণ কোড বাধ্যতামূলক',
        'ক্ষুদ্রঋণে অ্যালগরিদমিক পক্ষপাত নিরীক্ষা',
      ],
      metricLabelEn: 'Regulated Firms',
      metricLabelBn: 'নিয়ন্ত্রিত প্রতিষ্ঠান',
      metricValue: '38 Firms Active',
      metricNumeric: 38,
      status: 'Active Regulatory Oversight',
      institution: 'Bangladesh Bank Payment Systems Dept. (PSD)',
      linkedModule: 'm04',
      linkedSubTab: 'tracker',
      evidenceId: 'ev-bd-04',
      summaryEn:
        'Financial sector regulatory testing sandbox mandating algorithmic fairness and plain-language Bangla decision reason codes for automated credit evaluation.',
      summaryBn:
        'স্বয়ংক্রিয় ঋণ অনুমোদনে ন্যায্যতা ও বাংলায় কারণ প্রদর্শনে বাধ্যকারী কেন্দ্রীয় ব্যাংকের রেগুলেটরি স্যান্ডবক্স।',
      realTimeMetrics: {
        primaryLabelEn: 'Model Audit Compliance',
        primaryLabelBn: 'মডেল সম্মতি হার',
        primaryValue: '79% Bank Compliance',
        primaryNumeric: 79,
        computeLoadOrSpec: 'Central Bank Audit Node for SHAP/LIME Explainability Verification',
        networkLatency: 'Secure Financial Extranet VPN',
        throughputOrCapacity: '180,000 Automated Micro-Credit Decisions Audited Monthly',
        activeModelsOrDeployments: '14 Production Credit Scoring Models',
        reachOrBeneficiaries: '32M Digital Banking & MFS Wallet Holders',
        uptimeOrSLA: 'Monthly Regulatory Filing Compliance',
        lastAssessed: '2026-11-06 17:00 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 12,
        likelihood: 3,
        impact: 4,
        threatTitleEn: 'Algorithmic Black-Box Exclusion of Low-Income Rural Borrowers',
        threatTitleBn: 'স্বয়ংক্রিয় মডেলে প্রান্তিক ও নিম্নআয়ের ঋণগ্রহীতাদের অযৌক্তিক বর্জনের ঝুঁকি',
        threatCategoryEn: 'Algorithmic Bias',
        threatCategoryBn: 'অ্যালগরিদমিক পক্ষপাত',
        mitigationStatus: 'Controlled',
        mitigationPlanEn:
          'Bangladesh Bank circular PSD-14 mandating human appeals and explicit Bengali reason codes for all loan rejections.',
        mitigationPlanBn:
          'ঋণ বাতিলের ক্ষেত্রে বাংলায় সুনির্দিষ্ট কারণ প্রদর্শন ও মানবিক আপিল বাধ্যতামূলক করা হয়েছে।',
        cirtAdvisoryCode: 'FINTECH-RAI-2026-05',
        lastAuditDate: '2026-10-21',
      },
      associatedPolicy: {
        policyCode: 'BB-CIRC-2026',
        policyTitleEn: 'Bangladesh Bank Digital Credit & Automated Underwriting Guideline',
        policyTitleBn: 'বাংলাদেশ ব্যাংক ডিজিটাল ক্রেডিট ও স্বয়ংক্রিয় মূল্যায়ন নির্দেশিকা',
        stage: 'Enacted',
        progressPct: 79,
        complianceRatePct: 86,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Bank Company Act 1991 & Payment Systems Directive',
        statutoryPrerequisiteBn: 'ব্যাংক কোম্পানি আইন ১৯৯১ ও পেমেন্ট সিস্টেমস ডিরেক্টিভ',
        targetGazetteDate: 'Enacted',
        nodalAgency: 'Bangladesh Bank',
        evidenceRef: 'LPAD-PDPA-GAP-2026',
        linkedModule: 'm04',
        linkedSubTab: 'tracker',
      },
    },
    {
      id: 'obs-333-voice',
      code: 'POL-333-04',
      nameEn: proj333?.title || 'National Helpline 333 Bangla Voice AI Governance Wing',
      nameBn: 'জাতীয় হেল্পলাইন ৩৩৩ বাংলা ভয়েস এআই পরিচালনা উইং',
      zoneType: 'policy_zone',
      domain: 'public_ai',
      divisionId: 'dhaka',
      locationEn: 'a2i Service Innovation Lab, Dhaka',
      locationBn: 'এটুআই সার্ভিস ইনোভেশন ল্যাব, ঢাকা',
      lon: 90.45,
      lat: 23.62,
      featuresEn: [
        'Multilingual Bangla Dialect Speech ASR',
        '41% Faster Citizen Call Routing',
        'Mandatory Human Operator Escalation',
        'Real-Time Grievance Sentiment Tagging',
      ],
      featuresBn: [
        'আঞ্চলিক বাংলা উপভাষা ভয়েস শনাক্তকরণ',
        '৪১% দ্রুততর নাগরিক কল রাউটিং',
        'বাধ্যতামূলক মানবিক অপারেটর হস্তক্ষেপ সুবিধা',
        'তাৎক্ষণিক নাগরিক অভিযোগ শ্রেণিবিন্যাস',
      ],
      metricLabelEn: 'Citizens Served',
      metricLabelBn: 'সেবাপ্রাপ্ত নাগরিক',
      metricValue: `${((proj333?.beneficiariesK ?? 4200) / 1000).toFixed(1)}M`,
      metricNumeric: proj333?.beneficiariesK ?? 4200,
      status: proj333?.stage || 'Production',
      institution: 'a2i / Cabinet Division',
      linkedModule: 'm14',
      linkedSubTab: 'gov_projects',
      evidenceId: proj333?.evidenceId || 'ev-bd-05',
      summaryEn:
        'Nationwide public-sector AI voice router directing citizen service inquiries with mandatory human-in-the-loop fallback and divisional dialect parity monitoring.',
      summaryBn:
        'নাগরিক সেবা দ্রুততর করতে নিয়োজিত সরকারি বাংলা ভয়েস এআই রাউটার, যা মানবিক তদারকির আওতাধীন।',
      realTimeMetrics: {
        primaryLabelEn: 'Citizen Calls Handled',
        primaryLabelBn: 'নাগরিক কল সেবা',
        primaryValue: '4.2M Calls Routed',
        primaryNumeric: 4200,
        computeLoadOrSpec: '64 Concurrently Active Voice Telephony Speech Channels',
        networkLatency: '320 ms End-to-End Voice Latency Response',
        throughputOrCapacity: '14,000 Citizen Grievances Tagged Daily',
        activeModelsOrDeployments: 'Bangla-ASR v4.2 + NLU Intent Tagger',
        reachOrBeneficiaries: '64 Districts Nationwide Toll-Free 333',
        uptimeOrSLA: '99.96% Telecom Toll-Free Availability',
        lastAssessed: '2026-11-14 07:45 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 12,
        likelihood: 4,
        impact: 3,
        threatTitleEn: 'Misinterpretation of Regional Accents in Emergency Disaster Queries',
        threatTitleBn: 'জরুরি দুর্যোগ পরিস্থিতিতে আঞ্চলিক টানের ভুল ব্যাখ্যার ঝুঁকি',
        threatCategoryEn: 'Algorithmic Bias',
        threatCategoryBn: 'অ্যালগরিদমিক পক্ষপাত',
        mitigationStatus: 'Active Mitigation',
        mitigationPlanEn:
          'Auto-fallback to human emergency call-center agent if NLU confidence falls below 78%; weekly retraining with verified dialect audio.',
        mitigationPlanBn:
          'নির্ভুলতা ৭৮% এর নিচে নামলে স্বয়ংক্রিয়ভাবে মানব অপারেটরে কল স্থানান্তর ও সাপ্তাহিক মডেল রিট্রেনিং।',
        cirtAdvisoryCode: 'GOV-333-2026-09',
        lastAuditDate: '2026-10-27',
      },
      associatedPolicy: {
        policyCode: raiPolicy?.code || 'BD-RAI-2026',
        policyTitleEn: raiPolicy?.title || 'Public Sector Responsible AI & Procurement Guideline',
        policyTitleBn: 'সরকারি খাতে দায়িত্বশীল এআই ও ক্রয় নির্দেশিকা',
        stage: raiPolicy?.stage || 'Drafting',
        progressPct: raiPolicy?.progressPct ?? 52,
        complianceRatePct: 84,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Algorithmic Impact Assessment Approved under a2i Protocol',
        statutoryPrerequisiteBn: 'এটুআই কাঠামোর আওতায় অনুমোদিত অ্যালগরিদমিক প্রভাব মূল্যায়ন',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'a2i / Cabinet Division',
        evidenceRef: 'A2I-UGC-READINESS-26',
        linkedModule: 'm14',
        linkedSubTab: 'gov_projects',
      },
    },
    {
      id: 'obs-ffwc-flood',
      code: 'POL-FFWC-05',
      nameEn: projFlood?.title || 'FFWC Haor Hydrological AI Early Warning Center',
      nameBn: 'এফএফডব্লিউসি হাওর পানিবিজ্ঞান এআই আগাম সতর্কতা কেন্দ্র',
      zoneType: 'policy_zone',
      domain: 'public_ai',
      divisionId: 'sylhet',
      locationEn: 'Sylhet & Sunamganj Haor Basin Command',
      locationBn: 'সিলেট ও সুনামগঞ্জ হাওর অববাহিকা কমান্ড',
      lon: 91.42,
      lat: 24.94,
      featuresEn: [
        '7-Day Flash Flood Horizon Modeling',
        'Haor Boro Crop Loss Risk Estimation',
        'SMS & Community Alert Dispatch',
        'Satellite River Gauge Assimilation',
      ],
      featuresBn: [
        '৭ দিনের আগাম আকস্মিক বন্যা পূর্বাভাস মডেল',
        'হাওরের বোরো ফসল ক্ষতির ঝুঁকি নিরূপণ',
        'এসএমএস ও কমিউনিটি সতর্কবার্তা প্রেরণ',
        'স্যাটেলাইট ও নদীর গেজ ডেটা সংযুক্তি',
      ],
      metricLabelEn: 'Protected Population',
      metricLabelBn: 'সুরক্ষিত জনগোষ্ঠী',
      metricValue: `${((projFlood?.beneficiariesK ?? 6800) / 1000).toFixed(1)}M`,
      metricNumeric: projFlood?.beneficiariesK ?? 6800,
      status: projFlood?.stage || 'Production',
      institution: 'FFWC / Ministry of Water Resources',
      linkedModule: 'm14',
      linkedSubTab: 'transformation',
      evidenceId: projFlood?.evidenceId || 'ev-bd-02',
      summaryEn:
        'Operational machine-learning hydrological forecasting center protecting haor agricultural harvest and vulnerable riverine communities across northeastern basins.',
      summaryBn:
        'উত্তর-পূর্বাঞ্চলীয় হাওর ও নদী অববাহিকার কৃষক ও জনগোষ্ঠীকে রক্ষায় নিয়োজিত মেশিন লার্নিং বন্যা পূর্বাভাস কেন্দ্র।',
      realTimeMetrics: {
        primaryLabelEn: 'Haor River Reach',
        primaryLabelBn: 'হাওর নদী নেটওয়ার্ক',
        primaryValue: '6.8M Citizens Protected',
        primaryNumeric: 6800,
        computeLoadOrSpec: 'Automated Hydrodynamic & Satellite Ensemble Model Cluster',
        networkLatency: 'Hourly River Station Gauge Assimilation',
        throughputOrCapacity: '1.8M SMS Early Warnings Dispatched per High-Water Event',
        activeModelsOrDeployments: 'Hydro-ML Flash Flood Horizon v3.2',
        reachOrBeneficiaries: 'Sunamganj, Sylhet, Netrokona & Kishoreganj Haor Belt',
        uptimeOrSLA: '99.98% Monsoonal Operational SLA',
        lastAssessed: '2026-11-14 05:30 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 9,
        likelihood: 3,
        impact: 3,
        threatTitleEn: 'Upstream Transboundary Gauge Telemetry Interruption',
        threatTitleBn: 'উজানের আন্তঃসীমান্ত নদীর গেজ ডেটা সংযোগ বিচ্ছিন্নতার ঝুঁকি',
        threatCategoryEn: 'Critical Infrastructure',
        threatCategoryBn: 'গুরুত্বপূর্ণ অবকাঠামো',
        mitigationStatus: 'Controlled',
        mitigationPlanEn:
          'Satellite radar altimetry fallback and multi-sensor water level radar deployed across border points.',
        mitigationPlanBn:
          'স্যাটেলাইট অল্টিমেট্রি ও স্বয়ংক্রিয় ওয়াটার রাডার ব্যাকআপ সংযুক্ত রয়েছে।',
        cirtAdvisoryCode: 'HYDRO-WARN-2026-03',
        lastAuditDate: '2026-10-15',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 89,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Disaster Management Act 2012 & National Water Policy',
        statutoryPrerequisiteBn: 'দুর্যোগ ব্যবস্থাপনা আইন ২০১২ ও জাতীয় পানি নীতি',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'FFWC & Ministry of Water Resources',
        evidenceRef: 'BCC-NDC-CAP-2026Q4',
        linkedModule: 'm14',
        linkedSubTab: 'transformation',
      },
    },
    {
      id: 'obs-nbr-customs',
      code: 'POL-NBR-06',
      nameEn: projTax?.title || 'National Board of Revenue (NBR) Algorithmic Customs Gateway',
      nameBn: 'এনবিআর শুল্ক ও কর অসঙ্গতি এআই গেটওয়ে',
      zoneType: 'policy_zone',
      domain: 'public_ai',
      divisionId: 'chattogram',
      locationEn: 'Chattogram Custom House & Maritime Port',
      locationBn: 'চট্টগ্রাম কাস্টমস হাউস ও সমুদ্রবন্দর',
      lon: 91.81,
      lat: 22.34,
      featuresEn: [
        'HS-Code Misdeclaration Anomaly Scoring',
        'Trade Invoice Valuation Risk Engine',
        'Mandatory AIA Procurement Audit Pending',
        'Human Customs Inspector Appeal Log',
      ],
      featuresBn: [
        'এইচএস-কোড ও শুল্ক অসঙ্গতি শনাক্তকরণ',
        'বাণিজ্য চালান মূল্যায়ন ঝুঁকি ইঞ্জিন',
        'বাধ্যতামূলক এআইএ ক্রয় নিরীক্ষা চলমান',
        'কাস্টমস কর্মকর্তার আপিল ও অডিট লগ',
      ],
      metricLabelEn: 'Audited Traders',
      metricLabelBn: 'নিরীক্ষিত প্রতিষ্ঠান',
      metricValue: '120K Importers',
      metricNumeric: 120,
      status: projTax?.stage || 'Procurement',
      institution: 'National Board of Revenue (NBR)',
      linkedModule: 'm14',
      linkedSubTab: 'procurement',
      evidenceId: projTax?.evidenceId || 'ev-bd-04',
      summaryEn:
        'High-impact fiscal anomaly detector undergoing algorithmic explainability and procurement compliance gating prior to full port-wide deployment.',
      summaryBn:
        'চট্টগ্রাম বন্দরে শুল্ক ও বাণিজ্য অসঙ্গতি যাচাইয়ে নিয়োজিত এআই ইঞ্জিন, যা ব্যাখ্যাযোগ্যতা নিরীক্ষার আওতাধীন।',
      realTimeMetrics: {
        primaryLabelEn: 'Fiscal Assessment Score',
        primaryLabelBn: 'মূল্যায়ন স্কোর',
        primaryValue: '54 / 100 Impact',
        primaryNumeric: 54,
        computeLoadOrSpec: 'Automated Bill of Entry Anomaly Pipeline (35,000 filings/day)',
        networkLatency: 'Sub-300ms Invoice Screening',
        throughputOrCapacity: '92.4% Detection of High-Risk Invoice Mismatch',
        activeModelsOrDeployments: 'Customs Anomaly Scorer v1.8 (Procurement Stage)',
        reachOrBeneficiaries: 'National Port Clearance Stream',
        uptimeOrSLA: 'Procurement Pilot Stage Verification',
        lastAssessed: '2026-11-10 15:40 UTC',
      },
      riskIndicators: {
        severity: 'High',
        overallScore: 16,
        likelihood: 4,
        impact: 4,
        threatTitleEn: 'Procedural Bias in Automated Import Consignment Flagging',
        threatTitleBn: 'স্বয়ংক্রিয় কনসাইনমেন্ট আটকে বাণিজ্যিক হয়রানি ও বায়াসের ঝুঁকি',
        threatCategoryEn: 'Algorithmic Bias',
        threatCategoryBn: 'অ্যালগরিদমিক পক্ষপাত',
        mitigationStatus: 'Under Review',
        mitigationPlanEn:
          'Mandatory human inspector physical verification before penalty imposition; appeal workflow tracked under Module 14 governance.',
        mitigationPlanBn:
          'জরিমানা আরোপের পূর্বে কাস্টমস কর্মকর্তার বাধ্যতামূলক ভৌত যাচাই ও স্বচ্ছ আপিল ব্যবস্থা।',
        cirtAdvisoryCode: 'NBR-AIA-2026-02',
        lastAuditDate: '2026-10-18',
      },
      associatedPolicy: {
        policyCode: 'BD-RAI-2026',
        policyTitleEn: 'Public Sector Responsible AI & Procurement Guideline',
        policyTitleBn: 'সরকারি খাতে দায়িত্বশীল এআই ও ক্রয় নির্দেশিকা',
        stage: 'Drafting',
        progressPct: 52,
        complianceRatePct: 62,
        aiaAuditStatus: 'Mandatory Pre-Audit',
        statutoryPrerequisiteEn: 'Customs Act 2023 & Mandatory Algorithmic Impact Assessment Gate',
        statutoryPrerequisiteBn: 'কাস্টমস আইন ২০২৩ ও বাধ্যতামূলক এআইএ অডিট গেট',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'National Board of Revenue & a2i',
        evidenceRef: 'LPAD-PDPA-GAP-2026',
        linkedModule: 'm14',
        linkedSubTab: 'procurement',
      },
    },
    {
      id: 'obs-dghs-maternal',
      code: 'POL-DGHS-07',
      nameEn: projHealth?.title || 'DGHS Coastal Maternal Health AI Screening Cell',
      nameBn: 'ডিজিএইচএস উপকূলীয় মাতৃস্বাস্থ্য স্ক্রিনিং সেল',
      zoneType: 'policy_zone',
      domain: 'public_ai',
      divisionId: 'barishal',
      locationEn: 'Barishal Medical College & Coastal Upazila Health Complex',
      locationBn: 'বরিশাল মেডিকেল কলেজ ও উপকূলীয় উপজেলা স্বাস্থ্য কমপ্লেক্স',
      lon: 90.35,
      lat: 22.66,
      featuresEn: [
        'Prenatal High-Risk Triage Scoring',
        'DHIS2 De-Identified Health Sync',
        'Rural Dialect Symptom Audit Flag',
        'Physician Override & Clinical Sign-Off',
      ],
      featuresBn: [
        'গর্ভকালীন উচ্চ-ঝুঁকি শনাক্তকরণ স্কোরিং',
        'DHIS2 স্বাস্থ্য ডেটা ওয়্যারহাউস সংযুক্তি',
        'আঞ্চলিক উপভাষা ও বায়াস নিরীক্ষা ফ্ল্যাগ',
        'চিকিৎসকের চূড়ান্ত সিদ্ধান্ত ও ওভাররাইড',
      ],
      metricLabelEn: 'Mothers Reached',
      metricLabelBn: 'সেবাপ্রাপ্ত মা',
      metricValue: `${projHealth?.beneficiariesK ?? 480}K`,
      metricNumeric: projHealth?.beneficiariesK ?? 480,
      status: projHealth?.stage || 'Pilot',
      institution: 'DGHS / Ministry of Health',
      linkedModule: 'm08',
      linkedSubTab: 'human_rights',
      evidenceId: projHealth?.evidenceId || 'ev-bd-05',
      summaryEn:
        'Conditional-approval clinical decision support cell operating under active algorithmic bias auditing for rural coastal dialects and maternal care.',
      summaryBn:
        'উপকূলীয় ও গ্রামীণ মায়েদের ঝুঁকি শনাক্তকরণে পরীক্ষামূলক ক্লিনিক্যাল এআই সহায়ক, যা সক্রিয় বায়াস নিরীক্ষার আওতাধীন।',
      realTimeMetrics: {
        primaryLabelEn: 'Clinical Triage Reach',
        primaryLabelBn: 'ক্লিনিক্যাল ট্রায়াজ পরিধি',
        primaryValue: '480K Mothers Monitored',
        primaryNumeric: 480,
        computeLoadOrSpec: 'DHIS2 Integrated Local Upazila Clinic Terminals',
        networkLatency: 'Offline Sync with Nightly GovCloud Upload',
        throughputOrCapacity: '1,200 High-Risk Prenatal Assessments / Week',
        activeModelsOrDeployments: 'Maternal-Risk ML Pilot v1.2',
        reachOrBeneficiaries: '16 Coastal Upazilas across Barishal & Patuakhali',
        uptimeOrSLA: 'Conditional Pilot Clinical Deployment',
        lastAssessed: '2026-11-10 18:00 UTC',
      },
      riskIndicators: {
        severity: 'High',
        overallScore: 16,
        likelihood: 4,
        impact: 4,
        threatTitleEn: 'Regional Dialect Drop & Symptom Misclassification in Rural Dialects',
        threatTitleBn: 'গ্রামীণ আঞ্চলিক উপভাষায় লক্ষণ বর্ণনায় নির্ভুলতা হ্রাসের ঝুঁকি',
        threatCategoryEn: 'Algorithmic Bias',
        threatCategoryBn: 'অ্যালগরিদমিক পক্ষপাত',
        mitigationStatus: 'Active Mitigation',
        mitigationPlanEn:
          'Conditional authorization: mandatory physician sign-off before clinical referral; regional dialect audio corpus being collected.',
        mitigationPlanBn:
          'শর্তযুক্ত অনুমোদন: চিকিৎসকের স্বাক্ষর ব্যতিরেকে কোনো সিদ্ধান্ত নয় এবং আঞ্চলিক উপভাষা ডেটা সংগ্রহ চলমান।',
        cirtAdvisoryCode: 'HEALTH-AIA-2026-03',
        lastAuditDate: '2026-11-10',
      },
      associatedPolicy: {
        policyCode: 'BD-RAI-2026',
        policyTitleEn: 'Public Sector Responsible AI & Procurement Guideline',
        policyTitleBn: 'সরকারি খাতে দায়িত্বশীল এআই ও ক্রয় নির্দেশিকা',
        stage: 'Drafting',
        progressPct: 52,
        complianceRatePct: 64,
        aiaAuditStatus: 'Conditional',
        statutoryPrerequisiteEn: 'Medical Ethics & Human Rights Impact Assessment (Module 08)',
        statutoryPrerequisiteBn: 'চিকিৎসা নৈতিকতা ও মানবাধিকার প্রভাব মূল্যায়ন (মডিউল ০৮)',
        targetGazetteDate: 'Q2 2027',
        nodalAgency: 'Directorate General of Health Services (DGHS)',
        evidenceRef: 'A2I-UGC-READINESS-26',
        linkedModule: 'm08',
        linkedSubTab: 'human_rights',
      },
    },
    {
      id: 'obs-krishi-bot',
      code: 'POL-DAE-08',
      nameEn: projKrishi?.title || 'Krishi Batayon AI Precision Agri-Advisory Cell',
      nameBn: 'কৃষি বাতায়ন এআই নির্ভুল কৃষি পরামর্শ সেল',
      zoneType: 'policy_zone',
      domain: 'public_ai',
      divisionId: 'rajshahi',
      locationEn: 'Barind Multilateral Centre & DAE Hub, Rajshahi',
      locationBn: 'বরেন্দ্র উন্নয়ন কেন্দ্র ও ডিএই কৃষি হাব, রাজশাহী',
      lon: 88.62,
      lat: 24.39,
      featuresEn: [
        'Smartphone Leaf Blight Vision Scanner',
        'Bangla Voice Advisory for Farmers',
        'BARC Soil Moisture Geo-Layer',
        'Low-Bandwidth Offline Model Fallback',
      ],
      featuresBn: [
        'স্মার্টফোন ক্যামেরায় পাতার রোগ শনাক্তকরণ',
        'কৃষকদের জন্য বাংলা ভয়েস পরামর্শ',
        'বার্ক (BARC) মাটির আর্দ্রতা জিও-লেয়ার',
        'স্বল্প ইন্টারনেটে অফলাইন মডেল সুবিধা',
      ],
      metricLabelEn: 'Farmers Reached',
      metricLabelBn: 'কৃষক সংযুক্তি',
      metricValue: `${projKrishi?.beneficiariesK ?? 920}K`,
      metricNumeric: projKrishi?.beneficiariesK ?? 920,
      status: projKrishi?.stage || 'Pilot',
      institution: 'Ministry of Agriculture (DAE)',
      linkedModule: 'm14',
      linkedSubTab: 'registry',
      evidenceId: projKrishi?.evidenceId || 'ev-bd-03',
      summaryEn:
        'Regional precision agriculture advisory hub serving northern and Barind farmers with automated disease diagnostics and sovereign soil telemetry.',
      summaryBn:
        'বরেন্দ্র ও উত্তরাঞ্চলের কৃষকদের ধান ও আলুর রোগ আগাম শনাক্তকরণ ও মৃত্তিকা পরামর্শে নিয়োজিত আঞ্চলিক এআই সেল।',
      realTimeMetrics: {
        primaryLabelEn: 'Active Farm Queries',
        primaryLabelBn: 'কৃষি সেবা কল',
        primaryValue: '920K Farmers Registered',
        primaryNumeric: 920,
        computeLoadOrSpec: 'Edge Vision Inference + Centralized BARC Soil Sensor Mesh',
        networkLatency: 'Local Offline Inference Available in Native Mobile App',
        throughputOrCapacity: '18,000 Crop Blight Consultations Processed / Week',
        activeModelsOrDeployments: 'Krishi-Vision Mobile Net v3 & Weather Advisory Bot',
        reachOrBeneficiaries: 'Rajshahi, Bogura, Naogaon & Natore Districts',
        uptimeOrSLA: '99.9% Agronomic Service Availability',
        lastAssessed: '2026-11-11 08:00 UTC',
      },
      riskIndicators: {
        severity: 'Low',
        overallScore: 6,
        likelihood: 2,
        impact: 3,
        threatTitleEn: 'Fertilizer & Pesticide Dosage Misrecommendation Risk',
        threatTitleBn: 'সার ও কীটনাশক ব্যবহারের মাত্রায় অসঙ্গতির ঝুঁকি',
        threatCategoryEn: 'Model Vulnerability',
        threatCategoryBn: 'মডেল দুর্বলতা',
        mitigationStatus: 'Controlled',
        mitigationPlanEn:
          'Dosage ceilings hardcoded strictly to BARC agronomic handbooks; AI recommendations cannot exceed national chemical limits.',
        mitigationPlanBn:
          'জাতীয় কৃষি নির্দেশিকার সীমার বাইরে সার বা কীটনাশকের মাত্রা অনুমোদন না করার হার্ডকোডেড সুরক্ষা।',
        cirtAdvisoryCode: 'AGRI-SAFE-2026-02',
        lastAuditDate: '2026-10-25',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 88,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'National Agricultural Policy 2018 (Section 9.4 ICT in Agriculture)',
        statutoryPrerequisiteBn: 'জাতীয় কৃষি নীতি ২০১৮ (ধারা ৯.৪ কৃষিতে তথ্যপ্রযুক্তি)',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'Department of Agricultural Extension (DAE)',
        evidenceRef: 'EBLICT-CORPUS-2026',
        linkedModule: 'm14',
        linkedSubTab: 'registry',
      },
    },
    {
      id: 'obs-north-rangpur',
      code: 'POL-RNG-09',
      nameEn: 'Rangpur & Northern Climate-Smart AI Outreach Hub',
      nameBn: 'রংপুর ও উত্তরাঞ্চল জলবায়ু-সহিষ্ণু এআই আউটরিচ হাব',
      zoneType: 'policy_zone',
      domain: 'economy_skills',
      divisionId: 'rangpur',
      locationEn: 'Rangpur Hi-Tech Park & Regional Agri-Extension Zone',
      locationBn: 'রংপুর হাই-টেক পার্ক ও আঞ্চলিক কৃষি সম্প্রসারণ অঞ্চল',
      lon: 89.25,
      lat: 25.74,
      featuresEn: [
        'Satellite Soil Moisture & Drought Monitoring',
        'Regional Dialects Helpline 333 Edge Node',
        'Youth Freelancer & Applied ML Bootcamps',
        'Union Fiber Telemedicine Service Node',
      ],
      featuresBn: [
        'স্যাটেলাইট মাটির আর্দ্রতা ও খরা পর্যবেক্ষণ',
        'উত্তরাঞ্চলীয় উপভাষায় ৩৩৩ হেল্পলাইন সংযোগ',
        'তরুণ ফ্রিল্যান্সার ও অ্যাপ্লায়েড এমএল বুটক্যাম্প',
        'ইউনিয়ন ফাইবার টেলিমেডিসিন সেবা',
      ],
      metricLabelEn: 'Youth & Farmers Reached',
      metricLabelBn: 'সেবাপ্রাপ্ত জনগোষ্ঠী',
      metricValue: '340K Citizens',
      metricNumeric: 340,
      status: 'Operational',
      institution: 'a2i · Hi-Tech Park Authority · DAE',
      linkedModule: 'm13',
      linkedSubTab: 'industry',
      evidenceId: 'ev-bd-05',
      summaryEn:
        'Regional digital inclusion and climate-smart agricultural AI extension hub serving northern agricultural districts.',
      summaryBn:
        'উত্তরাঞ্চলের জেলাগুলোতে জলবায়ু-সহিষ্ণু কৃষি এআই ও তরুণদের প্রযুক্তি দক্ষতা বিস্তারে নিয়োজিত আঞ্চলিক কেন্দ্র।',
      realTimeMetrics: {
        primaryLabelEn: 'Regional AI Adoption',
        primaryLabelBn: 'আঞ্চলিক গ্রহণ হার',
        primaryValue: '48% Agri Penetration',
        primaryNumeric: 48,
        computeLoadOrSpec: 'Edge Gateway Connected to Kaliakoir NDC via 10G Fiber Link',
        networkLatency: '16.4 ms Round-Trip to Central GovCloud',
        throughputOrCapacity: '12,000 Weather & Soil Forecasts Dispatched Weekly',
        activeModelsOrDeployments: 'Drought-Sense ML & Rangpur Dialect Gateway',
        reachOrBeneficiaries: '8 Northern Districts in Rangpur Division',
        uptimeOrSLA: '99.92% Regional Node Availability',
        lastAssessed: '2026-11-12 15:00 UTC',
      },
      riskIndicators: {
        severity: 'Low',
        overallScore: 6,
        likelihood: 2,
        impact: 3,
        threatTitleEn: 'Drought Sensor Network Maintenance Latency in Remote Char Areas',
        threatTitleBn: 'চরাঞ্চলে সেন্সর রক্ষণাবেক্ষণ ও কানেক্টিভিটি ঘাটতি',
        threatCategoryEn: 'Critical Infrastructure',
        threatCategoryBn: 'অবকাঠামোগত চ্যালেঞ্জ',
        mitigationStatus: 'Monitored',
        mitigationPlanEn:
          'Union Digital Centre operators trained as local sensor field maintenance engineers with spare kit inventory.',
        mitigationPlanBn:
          'ইউনিয়ন ডিজিটাল সেন্টারের অপারেটরদের মাঠপর্যায়ের রক্ষণাবেক্ষণ প্রশিক্ষণ প্রদান করা হয়েছে।',
        cirtAdvisoryCode: 'RNG-CLIM-2026-01',
        lastAuditDate: '2026-10-19',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 74,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'Delta Plan 2100 & National AI Strategy Section 5.3',
        statutoryPrerequisiteBn: 'ডেল্টা প্ল্যান ২১০০ ও জাতীয় এআই কৌশল ধারা ৫.৩',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'a2i & Planning Commission',
        evidenceRef: 'A2I-UGC-READINESS-26',
        linkedModule: 'm13',
        linkedSubTab: 'industry',
      },
    },
    {
      id: 'obs-rmg-upskill',
      code: 'POL-RMG-10',
      nameEn: 'Industrial Vision QA & EDGE AI Workforce Hub',
      nameBn: 'তৈরি পোশাক শিল্প ভিশন কিউএ ও এজ এআই কর্মশক্তি হাব',
      zoneType: 'infrastructure',
      domain: 'economy_skills',
      divisionId: 'dhaka',
      locationEn: 'Savar · Gazipur Industrial Corridor & BPATC Savar',
      locationBn: 'সাভার · গাজীপুর শিল্প ও প্রশিক্ষণ করিডোর',
      lon: 90.26,
      lat: 23.88,
      featuresEn: [
        '19% Tier-1 RMG Defect Vision AI',
        '28,400+ EDGE AI Certified Learners',
        '14% Fabric Wastage Reduction Verified',
        'BPATC Civil Service AI Literacy',
      ],
      featuresBn: [
        '১৯% শীর্ষ পোশাক কারখানায় ভিশন কিউএ এআই',
        '২৮,৪০০+ এজ (EDGE) এআই সনদপ্রাপ্ত দক্ষ কর্মী',
        'কাপড় অপচয় ১৪% হ্রাসের প্রমাণিত সাফল্য',
        'বিপিএটিসি সিভিল সার্ভিস এআই প্রশিক্ষণ',
      ],
      metricLabelEn: 'Trained Workforce',
      metricLabelBn: 'প্রশিক্ষিত জনবল',
      metricValue: '28.4K Certified',
      metricNumeric: 28400,
      status: 'Scaling',
      institution: 'BCC EDGE · BGMEA · NSDA',
      linkedModule: 'm11',
      linkedSubTab: 'training',
      evidenceId: 'ev-bd-05',
      summaryEn:
        'Industrial computer-vision adoption and national workforce reskilling corridor bridging RMG manufacturing, civil-service training, and software exports.',
      summaryBn:
        'তৈরি পোশাক শিল্পে কম্পিউটার ভিশন ও জাতীয় এআই দক্ষতা উন্নয়নের মাধ্যমে কর্মশক্তি রূপান্তর করিডোর।',
      realTimeMetrics: {
        primaryLabelEn: 'Certified AI Workforce',
        primaryLabelBn: 'সনদপ্রাপ্ত এআই কর্মী',
        primaryValue: '28,400 Certified',
        primaryNumeric: 28400,
        computeLoadOrSpec: 'Edge Vision Inspection Rigs Deployed in 94 Garment Factories',
        networkLatency: 'Real-Time Edge Fabric Inspection (<20ms / frame)',
        throughputOrCapacity: '14% Documented Raw Fabric Wastage Reduction',
        activeModelsOrDeployments: 'Defect-Vision 4.1 & Sewing Line Bottleneck AI',
        reachOrBeneficiaries: '34,000 Garment Workers Transitioned & Reskilled',
        uptimeOrSLA: 'Factory Floor High-Speed Inspection Reliability',
        lastAssessed: '2026-11-11 11:00 UTC',
      },
      riskIndicators: {
        severity: 'Moderate',
        overallScore: 12,
        likelihood: 3,
        impact: 4,
        threatTitleEn: 'Workforce Displacement Without Adequate Social Transition Fund',
        threatTitleBn: 'পর্যাপ্ত পুনঃপ্রশিক্ষণ তহবিল ছাড়া কর্মী স্থানচ্যুতির সামাজিক ঝুঁকি',
        threatCategoryEn: 'Labour & Socioeconomic',
        threatCategoryBn: 'শ্রম ও আর্থ-সামাজিক ঝুঁকি',
        mitigationStatus: 'Monitored',
        mitigationPlanEn:
          'Tripartite agreement with BGMEA and NSDA allocating transition stipends and mandatory technical certification before automation.',
        mitigationPlanBn:
          'বিজিএমইএ ও এনএসডিএ ত্রিপক্ষীয় চুক্তি অনুসারে অটোমেশনের পূর্বে প্রশিক্ষণ ভাতা ও সনদ নিশ্চিতকরণ।',
        cirtAdvisoryCode: 'LABOR-RESKILL-2026-04',
        lastAuditDate: '2026-10-22',
      },
      associatedPolicy: {
        policyCode: 'BD-NAIP-2026',
        policyTitleEn: 'National Artificial Intelligence Policy 2026–2030',
        policyTitleBn: 'জাতীয় কৃত্রিম বুদ্ধিমত্তা নীতি ২০২৬–২০৩০',
        stage: 'Inter-Ministerial Review',
        progressPct: 76,
        complianceRatePct: 79,
        aiaAuditStatus: 'Approved',
        statutoryPrerequisiteEn: 'National Skills Development Policy & Labor Transition Fund',
        statutoryPrerequisiteBn: 'জাতীয় দক্ষতা উন্নয়ন নীতি ও শ্রম রূপান্তর তহবিল',
        targetGazetteDate: 'Q1 2027',
        nodalAgency: 'National Skills Development Authority (NSDA) & BCC',
        evidenceRef: 'A2I-UGC-READINESS-26',
        linkedModule: 'm11',
        linkedSubTab: 'training',
      },
    },
  ];

  return rawNodes.map((n) => {
    const pt = projectBD(n.lon, n.lat);
    return {
      ...n,
      x: pt.x,
      y: pt.y,
    };
  });
}

export interface DivisionRegionalData {
  division: BangladeshDivisionGeo;
  nodes: ObservatoryToolNode[];
  infrastructureNodes: ObservatoryToolNode[];
  researchHubNodes: ObservatoryToolNode[];
  policyZoneNodes: ObservatoryToolNode[];
  totalNodes: number;
  dominantSeverity: 'Critical' | 'High' | 'Moderate' | 'Low';
  avgCompliance: number;
  topThreatEn: string;
  topThreatBn: string;
  primaryPolicyCode: string;
  primaryPolicyTitleEn: string;
  localizedInfrastructure: InfrastructureAsset[];
  localizedPolicies: PolicyItem[];
  localizedRisks: RiskItem[];
  localizedPublicProjects: PublicAIProject[];
  localizedResearch: ResearchInnovationItem[];
  localizedIncidents: SafetyIncidentItem[];
  totalBeneficiariesK: number;
}

export function getDivisionProfile(
  divisionId: DivisionId,
  tools: ObservatoryToolNode[],
  dataset: CountryDataset
): DivisionRegionalData {
  const divGeo = BANGLADESH_DIVISIONS.find((d) => d.id === divisionId) || BANGLADESH_DIVISIONS[4];
  const nodes = tools.filter((t) => t.divisionId === divisionId);

  const infrastructureNodes = nodes.filter((n) => n.zoneType === 'infrastructure');
  const researchHubNodes = nodes.filter((n) => n.zoneType === 'research_hub');
  const policyZoneNodes = nodes.filter((n) => n.zoneType === 'policy_zone');

  const criticalRisks = nodes.filter((n) => n.riskIndicators.severity === 'Critical');
  const highRisks = nodes.filter((n) => n.riskIndicators.severity === 'High');
  const dominantSeverity: 'Critical' | 'High' | 'Moderate' | 'Low' =
    criticalRisks.length > 0
      ? 'Critical'
      : highRisks.length > 0
      ? 'High'
      : nodes.length > 0
      ? 'Moderate'
      : 'Low';

  const avgCompliance = nodes.length
    ? Math.round(
        nodes.reduce((acc, n) => acc + n.associatedPolicy.complianceRatePct, 0) / nodes.length
      )
    : 75;

  // Localized Infrastructure: matching this division or sovereign backbone
  const localizedInfrastructure = dataset.infrastructure.filter((inf) => {
    const locLower = (inf.location || '').toLowerCase();
    const nameLower = (inf.name || '').toLowerCase();
    if (divisionId === 'dhaka') {
      return locLower.includes('gazipur') || locLower.includes('kaliakoir') || locLower.includes('dhaka');
    }
    if (divisionId === 'chattogram') {
      return locLower.includes('cox') || locLower.includes('backbone') || locLower.includes('chattogram');
    }
    if (divisionId === 'khulna') {
      return locLower.includes('jashore') || locLower.includes('khulna');
    }
    return locLower.includes(divisionId) || nameLower.includes(divisionId);
  });

  // Ensure at least 1 infrastructure asset is present if there's an infra node
  if (localizedInfrastructure.length === 0 && infrastructureNodes.length > 0) {
    const firstInfraNode = infrastructureNodes[0];
    localizedInfrastructure.push({
      id: `inf-loc-${divisionId}`,
      countryCode: 'BD',
      name: firstInfraNode.nameEn,
      category: 'Compute',
      capacitySpec: firstInfraNode.realTimeMetrics.computeLoadOrSpec,
      utilizationPct: firstInfraNode.realTimeMetrics.primaryNumeric || 72,
      sovereignHosted: true,
      location: `${firstInfraNode.locationEn}, ${divGeo.nameEn}`,
      status: 'Operational',
      evidenceId: firstInfraNode.evidenceId || 'ev-bd-02',
    });
  }

  // Localized Policies: policies referenced by nodes in this division
  const policyCodes = new Set(nodes.map((n) => n.associatedPolicy.policyCode));
  const localizedPolicies = dataset.policies.filter((p) => policyCodes.has(p.code));
  if (localizedPolicies.length === 0 && dataset.policies.length > 0) {
    localizedPolicies.push(dataset.policies[0]);
  }

  // Localized Risks: risks linked to this division or affected systems
  const localizedRisks = dataset.risks.filter((r) => {
    if (divisionId === 'dhaka') return true;
    if (divisionId === 'chattogram') return r.code === 'RSK-BD-04' || r.code === 'RSK-BD-05' || r.code === 'RSK-BD-01';
    if (divisionId === 'rajshahi' || divisionId === 'rangpur') return r.code === 'RSK-BD-02' || r.code === 'RSK-BD-06';
    if (divisionId === 'khulna' || divisionId === 'barishal') return r.code === 'RSK-BD-04' || r.code === 'RSK-BD-02';
    if (divisionId === 'sylhet') return r.code === 'RSK-BD-02' || r.code === 'RSK-BD-03';
    return r.code === 'RSK-BD-02' || r.code === 'RSK-BD-06';
  });

  // Localized Public Projects: citizen projects operating in this division
  const localizedPublicProjects = dataset.publicProjects.filter((p) => {
    if (divisionId === 'dhaka') return p.registryCode === 'GOV-BD-001' || p.registryCode === 'GOV-BD-004';
    if (divisionId === 'rajshahi' || divisionId === 'mymensingh') return p.registryCode === 'GOV-BD-005';
    if (divisionId === 'sylhet' || divisionId === 'barishal' || divisionId === 'rangpur') return p.registryCode === 'GOV-BD-002';
    if (divisionId === 'chattogram') return p.registryCode === 'GOV-BD-001' || p.registryCode === 'GOV-BD-004';
    return p.registryCode === 'GOV-BD-001';
  });

  // Localized Research Items
  const localizedResearch = dataset.researchItems.filter((res) => {
    const orgLower = res.organization.toLowerCase();
    const focusLower = res.focusArea.toLowerCase();
    if (divisionId === 'dhaka') return orgLower.includes('buet') || orgLower.includes('dhaka') || orgLower.includes('startup');
    if (divisionId === 'sylhet') return orgLower.includes('sust') || focusLower.includes('nlp');
    if (divisionId === 'chattogram') return orgLower.includes('cuet') || focusLower.includes('ocean');
    if (divisionId === 'rajshahi') return orgLower.includes('ruet') || orgLower.includes('rice') || focusLower.includes('agri');
    if (divisionId === 'khulna') return orgLower.includes('kuet') || focusLower.includes('climate');
    return true;
  });

  // Localized Incidents
  const localizedIncidents = dataset.safetyIncidents.filter((inc) => {
    if (divisionId === 'dhaka') return true;
    if (divisionId === 'sylhet' || divisionId === 'chattogram') return inc.code === 'SAF-BD-02';
    return inc.severity === 'High' || inc.severity === 'Critical';
  });

  const totalBeneficiariesK = localizedPublicProjects.reduce((acc, p) => acc + p.beneficiariesK, 0);

  return {
    division: divGeo,
    nodes,
    infrastructureNodes,
    researchHubNodes,
    policyZoneNodes,
    totalNodes: nodes.length,
    dominantSeverity,
    avgCompliance,
    topThreatEn: nodes[0]?.riskIndicators.threatTitleEn || 'Standard operational oversight',
    topThreatBn: nodes[0]?.riskIndicators.threatTitleBn || 'সার্বক্ষণিক পরিচালন তদারকি',
    primaryPolicyCode: nodes[0]?.associatedPolicy.policyCode || 'BD-NAIP-2026',
    primaryPolicyTitleEn: nodes[0]?.associatedPolicy.policyTitleEn || 'National Artificial Intelligence Policy 2026–2030',
    localizedInfrastructure,
    localizedPolicies,
    localizedRisks,
    localizedPublicProjects,
    localizedResearch,
    localizedIncidents,
    totalBeneficiariesK,
  };
}
