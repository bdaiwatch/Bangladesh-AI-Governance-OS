# Bangladesh AI Governance Operating System (BD AI Watch)
> **An Atlas AI Institute Initiative**  
> *Sovereign National AI Policy, Governance, Infrastructure, Risk Containment, and Observatory System*

---

## 1. Executive Summary & Purpose

The **Bangladesh AI Governance Operating System (BD AI Watch)** is an enterprise-grade sovereign intelligence platform developed to oversee, audit, coordinate, and accelerate the national artificial intelligence lifecycle for the People's Republic of Bangladesh.

Commissioned under the **Atlas AI Institute**, the system provides government ministers, policy analysts, cybersecurity auditors (BGD e-GOV CIRT), researchers, and public observers with an interconnected digital operating system covering **20 specialized modules**, an **Executive Command Centre**, a high-fidelity **Bangladesh AI Observatory**, and a role-governed **Admin CMS**.

---

## 2. Core Branding & Linguistic Invariants

To maintain institutional authority and international standardization, the following two rules are enforced across the codebase:

1. **Header Remains Always in English**:
   - The top application header (`TopBar.tsx`) displays:  
     `Bangladesh AI Governance OS` · `An Atlas AI Institute initiative`
   - This header naturally scrolls with the page (non-sticky) and **never translates to Bengali**, even when the user switches the system language to Bengali (`bn`).
2. **"Atlas AI Institute" is Always in English**:
   - In all copyright notices, footers, print banners, and initiative tags, `Atlas AI Institute` stays in English across both language toggles.
   - All other operational texts, module summaries, policy analyses, risk matrices, and tabular data fully support instant bilingual switching (`English` / `বাংলা`).

---

## 3. Technology Stack & Design System

- **Runtime & Framework**: React 19 SPA, TypeScript, Vite 8, Express (`server.ts` dev/prod runner).
- **Styling**: Tailwind CSS v4 with `@import "tailwindcss";`, `@custom-variant dark`.
- **Design Tokens**:
  - Background Canvas: `#FAFAF7` (Light) / `#0C0E10` (Dark)
  - Surface Containers: `#FFFFFF` (Light) / `#14181B` (Dark)
  - Sovereign Brand Primary: `#0B5D45` (Emerald Accent) / Dark Mode `#34D399`
  - Typography: Editorial typographic pairing using `Source Serif 4`, `Noto Serif Bengali`, `Inter`, `Hind Siliguri`, and `JetBrains Mono` for tabular figures.
  - Zero-Pill Discipline: Strict rectangular and subtle rounded containers (`rounded-[8px]`, `rounded-[12px]`, `rounded-[16px]`), hairline borders (`border-[var(--border-default)]`), no aggressive shadows.
  - Accessibility: Minimum 44px touch targets on mobile/tablet, full keyboard accessibility, semantic ARIA attributes.
- **Export Formats**: Excel (`.xlsx` via SheetJS), Print-ready PDF stylesheet layout.

---

## 4. Completed Work (সম্পন্ন কাজ)

### A. Bangladesh AI Observatory Centre (`observatory`)
- **Bottom Navigation Integration**: Replaced the legacy risk tab in `BottomNav.tsx` with a primary **Observatory** tab (`Globe2` icon).
- **Interactive SVG Map of Bangladesh (`BangladeshObservatoryMap.tsx`)**:
  - Custom geographic projection of Bangladesh (`87.95°E–92.75°E`, `20.65°N–26.70°N`).
  - Outlines of all **8 Divisions** (Dhaka, Chattogram, Rajshahi, Khulna, Sylhet, Barishal, Rangpur, Mymensingh) with regional boundaries and major river systems (Jamuna, Padma, Meghna).
  - High-speed fiber-optic and sovereign compute interconnect corridors.
  - **16 Mapped National Nodes across 3 Zone Classifications**:
    - 🖥️ **National AI Infrastructure Points** (`#0B5D45` Diamond Pins): e.g., Kaliakoir Tier-IV NDC, BCC Sovereign Supercomputing Enclave, Chattogram Marine HPC.
    - 🔬 **Research & Innovation Hubs** (`#0F766E` Circle Pins): e.g., BUET Center for AI & Robotics, DU Bangla NLP Research Center, SUST Sensor Network, CUET Robotics Hub.
    - 🏛️ **Policy Development & Governance Zones** (`#2E5E8C` Shield Pins): e.g., ICT Division Secretariat, BTRC Spectrum & AI Lab, CIRT Cyber Incident Defense Enclave.
  - Interactive Zone Category toggles and Division selector chips.
  - Tooltips with live telemetry, institutions, coordinates, and operational status.

- **Card-Based Regional Data Drawer (Directly Beneath the Map)**:
  Selecting any division zone (Dhaka, Chattogram, Rajshahi, Khulna, Sylhet, Barishal, Rangpur, Mymensingh) or node pin automatically activates a comprehensive, card-based regional drawer directly beneath the static SVG map:
  1. **Region Selector & Executive Summary**: Selected division badge, hub city, geographic coordinates, specialization, quick 8-division switcher ribbon, and a 4-column metric strip (Infrastructure assets, Applicable policies, Risk telemetry, Citizen beneficiary reach).
  2. **Card 1 — Localized AI Infrastructure (`dataset.infrastructure`)**: Mapped data centers, Tier-IV facilities, and sovereign GPU clusters with capacity specs, utilization percentage bars (with color thresholds), sovereign hosted badges, and verified primary evidence links.
  3. **Card 2 — Localized Policy & Governance Status (`dataset.policies`)**: Legislative instruments governing regional AI workloads with implementation progress meters, statutory gap counts, strategic recommendations, target gazette timelines, and direct links to Module 03 (Policy Drafts).
  4. **Card 3 — Localized Risk Indicators & CIRT Advisories (`dataset.risks` & `dataset.safetyIncidents`)**: 5x5 Likelihood $\times$ Impact risk scorecards, threat classifications, concrete mitigation protocols, active containment tags, and CIRT incident telemetry.
  5. **Card 4 — Localized Public Sector AI & University Research Labs (`dataset.publicProjects` & `dataset.researchItems`)**: Deployed citizen service systems with beneficiary reach and procurement gate status, plus academic research hubs with grant funding and TRL levels.
  6. **Card 5 — Regional Node Telemetry Inspector**: Interactive sibling node switcher with live operational telemetry (compute loads, latency, throughput, model deployments, SLA uptime).

- **Divisional Footprint & International Benchmarking**:
  - 8-division capability summary with instant Card View $\leftrightarrow$ Table View toggle.
  - International comparative benchmarking against Singapore, Estonia, India, Rwanda, and the UK using OECD/UNESCO indicators.
  - Registry Table with real-time substring search, division filter, zone filter, and Excel (`.xlsx`) export.

---

### B. Admin CMS & Role-Based Access Control (RBAC)
- **RBAC Enforcement**:
  - `GovernanceContext` maintains `role` (`admin`, `commissioner`, `policy_analyst`, `risk_auditor`, `ministry_coordinator`, `public_observer`) and an `isAdmin` flag.
  - Admin CMS navigation and components in `App.tsx` and `BottomNav.tsx` are strictly gated: standard users without Admin privileges are blocked with a clear access-denied screen.
  - Testing toggle allows switching admin privileges directly from the UI when authenticated.
- **Standardized Data Table Component**:
  - Reusable, responsive table with real-time multi-field search and column-level filters.
  - Multi-row bulk selection with indeterminate state checkboxes.
  - **Bulk Operations Menu**: Allows admins to apply status transitions simultaneously to multiple selected policy drafts or incident reports (e.g., *Approve All Selected*, *Archive Selected*, *Flag for Legal Review*).
  - Single-row quick status transitions and full audit trails.
  - Centralized consultation disposition triage and stakeholder feedback approval queue.

---

### C. The 20 Interconnected Modules Inventory
1. **Module 01: National AI Readiness Index** — 4-pillar readiness radar (Institutional, Infrastructure, Human Capital, Responsible AI) with evidence-backed indicator scoring.
2. **Module 02: Early Warning & Watch Signals** — Continuous threat radar, disinformation tracking, and vulnerability alerts.
3. **Module 03: Policy Roadmap & Draft Statutes** — Interactive policy pipeline tracking bills from drafting to official gazette enactment.
4. **Module 04: Regulations & Legal Tracker** — Compliance parity across statutory instruments, executive directives, and international standards.
5. **Module 05: Sovereign Architecture & Enclaves** — Sovereign compute governance, in-country data residency mandates, and cloud enclaves.
6. **Module 06: AI Risk Register** — 5x5 Likelihood $\times$ Impact risk matrix, mitigation workflows, and classified cyber risk masking for public roles.
7. **Module 07: Ethics & Algorithmic Impact Assessments (AIA)** — Mandatory ethical gates, fairness, transparency, and human-in-the-loop audit scorecards.
8. **Module 08: Data Governance & Protection** — National dataset catalog, data classification tiers, and citizen consent enforcement.
9. **Module 09: Regulatory Sandboxes & Controlled Pilots** — Safe testing environments for civic fintech, agritech, and healthcare AI pilots.
10. **Module 10: Compute & Infrastructure Allocation** — GPU cluster utilization, supercomputing quotas, and energy sustainability metrics.
11. **Module 11: Talent, Workforce & Education** — National AI skilling pipeline, university curricula, and talent retention indices.
12. **Module 12: Research & Innovation Ledger** — Sovereign research grants, Bangla NLP models, and intellectual property/patent repository.
13. **Module 13: Industrial & Startup Ecosystem** — AI startup directory, venture funding flows, and enterprise AI adoption telemetry.
14. **Module 14: Public Sector AI Deployments** — Citizen service deployments, procurement approval gates, and citizen beneficiary impact.
15. **Module 15: Safety, Incidents & CIRT Feeds** — CIRT incident logging, forensic triage, and emergency model kill-switch protocols.
16. **Module 16: International Benchmarking** — Global AI Index rankings, bilateral bilateral agreements, and transferred best practices.
17. **Module 17: Stakeholders & Institutional Matrix** — Inter-ministerial coordination directory, NGO coalitions, and focal point contacts.
18. **Module 18: National PMO & Milestone Tracker** — Strategic deliverables, quarterly gantt milestones, and agency accountability meters.
19. **Module 19: Public Consultation Portal** — Citizen feedback submission, clause-by-clause stakeholder comments, and transparent disposition.
20. **Module 20: AI Copilot & Document Generator** — Sovereign bilingual policy copilot for automated draft generation, gap analysis, and legal benchmarking.

---

### D. Shell, Navigation & Mobile Ergonomics
- **Non-Sticky Scrolling Header (`TopBar.tsx`)**: The top header does not occupy fixed vertical viewport space on mobile, allowing full screen real estate for maps and tables.
- **Fixed Bottom Navigation (`BottomNav.tsx`)**: Touch-friendly mobile bottom bar providing one-tap navigation between Command, Observatory, Modules, Admin, and Settings.
- **Navigation Drawer (`NavigationMenu.tsx`)**: Clean bottom sheet drawer organizing all 20 modules into 6 thematic pillars, role switcher, and language controls.
- **Primary Evidence Drawer (`EvidenceDrawer.tsx`)**: Direct verification modal displaying institutional source documents, gazette notifications, and confidence levels for every data point.

---

## 5. What is In-Flight / Roadmap (কী কী বাকি আছে)

The following items are designated for subsequent engineering phases:

1. **Live WebSocket / SSE Real-Time Telemetry Feeds**:
   - Currently, node metrics and risk indicators are populated via rich, grounded seed datasets (`observatoryAtlas.ts`, `seedData.ts`).
   - *Roadmap*: Connect live WebSocket or Server-Sent Events (SSE) endpoints from the Kaliakoir NDC DCIM monitoring system and BGD e-GOV CIRT SIEM/SOC collectors.
2. **Automated Bangladesh Government Gazette Webhook Sync**:
   - Automated RSS/webhook parser connecting directly to the Department of Printing and Publications (BG Press) to auto-transition policy drafts to "Enacted" when gazetted.
3. **Vector Semantic Search over Legal Statutes**:
   - Embed full text of the National AI Policy 2026, Data Protection Act, and Cyber Security Act into an in-memory or pgvector index for clause-level semantic search.
4. **Cabinet Memo Digital Signature Workflow**:
   - Multi-party cryptographic signature module for Inter-Ministerial Review sign-offs before Cabinet submission.
5. **Direct GeoJSON Polygon Rendering for Upazila-Level Maps**:
   - Expand the current 8-division boundary SVG map down to 64 districts and 495 upazilas for micro-regional agricultural and rural AI telemetry.

---

## 6. Directory Structure & Key Files

```text
├── README.md                           # This document (Architecture, Inventory & Roadmap)
├── metadata.json                       # AI Studio project configuration & permissions
├── package.json                        # Runtime dependencies & npm build scripts
├── server.ts                           # Express server hosting Vite middleware & proxy routes
├── vite.config.ts                      # Vite build pipeline with Tailwind CSS v4
├── index.html                          # Entry point HTML with typography & SEO tags
└── src/
    ├── main.tsx                        # React application bootstrap
    ├── App.tsx                         # Master application shell, routing & RBAC wrapper
    ├── types/
    │   └── os.ts                       # Core TypeScript type definitions & schemas
    ├── store/
    │   └── GovernanceContext.tsx       # Global state: roles, dataset, navigation, language, filters
    ├── data/
    │   ├── seedData.ts                 # Grounded national dataset (policies, risks, infra, research)
    │   ├── observatoryAtlas.ts         # Coordinates, 16 pins, division geo, real-time metrics, risk/policy links
    │   ├── modulesRegistry.ts          # Metadata registry for all 20 modules + Observatory + Admin
    │   └── i18n.ts                     # Bilingual dictionary (EN / BN)
    ├── theme/
    │   └── tokens.css                  # Editorial typography, color palettes, dark mode tokens
    ├── utils/
    │   └── formatters.ts               # Date, number, and localized currency formatting
    └── components/
        ├── Shell/
        │   ├── TopBar.tsx              # Non-sticky editorial header (Always English)
        │   ├── BottomNav.tsx           # Fixed bottom navigation bar (with Observatory)
        │   ├── NavigationMenu.tsx      # Comprehensive 20-module pillar menu & role selector
        │   ├── Sidebar.tsx             # Desktop auxiliary navigation
        │   ├── EvidenceDrawer.tsx      # Primary source verification drawer
        │   └── InfoSheets.tsx          # Methodology & data source overlays
        ├── Charts/
        │   └── BangladeshObservatoryMap.tsx # Interactive SVG map of Bangladesh with 16 nodes
        ├── Common/
        │   └── Primitives.tsx          # SectionCard, ResponsiveTable, StatusLabel, Buttons, Badges
        └── Modules/
            ├── CentralCommandCentre.tsx# Executive national command center
            ├── ObservatoryCentre.tsx   # High-fidelity Observatory: Map Hero + Data Sheet + Dashboards
            ├── AdminCMS.tsx            # Admin CMS with standardized tables & bulk operations
            └── Module01...Module20.tsx # The 20 specialized national AI governance modules
```

---

## 7. Developer Commands

```bash
# Install dependencies
npm install

# Start local development server (runs on port 3000 via tsx server.ts)
npm run dev

# Run TypeScript typecheck / linter
npm run lint

# Compile production bundle
npm run build

# Start production server
npm start
```

---

## 8. Verification & Audit Trail

- **RBAC**: Verified that non-admin roles cannot access or mutate records in `AdminCMS`.
- **Map & Data Sheet**: Verified that clicking any of the 16 nodes or 8 divisions scrolls to and opens the detailed real-time metrics, 5x5 risk scores, and policy status.
- **Language Invariance**: Verified that `TopBar` and `Atlas AI Institute` remain strictly in English while the rest of the application dynamically translates between English and Bengali.
- **Build & Compilation**: Zero TypeScript errors (`tsc --noEmit`), zero broken imports.
