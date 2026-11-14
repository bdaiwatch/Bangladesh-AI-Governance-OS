import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'bd-ai-watch-os',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      timestamp: new Date().toISOString(),
    });
  });

  // --- National AI Governance Sovereign REST APIs (v1) ---
  // System policy: Direct file downloads are disabled except personal assessment report; external access requires REST API.
  app.get('/api/v1/observatory', (_req, res) => {
    res.json({
      status: 'success',
      countryCode: 'BD',
      leadBody: 'Bangladesh Computer Council & ICT Division',
      totalNodes: 16,
      classificationTiers: ['infrastructure', 'research_hub', 'policy_zone'],
      rateLimitQuota: '10,000 req/day',
      cirtSecurityAudit: 'CIRT-API-GATE-2026',
      datasetNotice: 'Direct file download disabled. API stream authorized.',
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/v1/observatory/regions/:divisionId', (req, res) => {
    const { divisionId } = req.params;
    res.json({
      status: 'success',
      countryCode: 'BD',
      division: divisionId,
      authorized: true,
      dataSchema: 'GovernanceContext.v1',
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/v1/policies', (_req, res) => {
    res.json({
      status: 'success',
      countryCode: 'BD',
      totalPolicies: 5,
      framework: 'National AI Policy 2026-2030 (BD-NAIP-2026)',
      enactmentMilestone: 'Cabinet Approval Q2 2027',
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/v1/risks', (_req, res) => {
    res.json({
      status: 'success',
      countryCode: 'BD',
      matrixFormat: '5x5 Likelihood x Impact',
      cirtThreatMonitoring: 'Active',
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/v1/infrastructure', (_req, res) => {
    res.json({
      status: 'success',
      countryCode: 'BD',
      facilities: ['Kaliakoir Tier-IV NDC', 'BCC Sovereign GPU Cluster', 'GovCloud BD'],
      utilizationThresholdAlert: '89% Peak Warning',
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/v1/research', (_req, res) => {
    res.json({
      status: 'success',
      countryCode: 'BD',
      sector: 'National AI R&D, University Labs & Economic Synthesis',
      activeResearchHubs: ['BUET Machine Intelligence Lab', 'DU Center for Data Science', 'SUST NLP Center', 'IUT Autonomous Systems Unit'],
      activeGrantsMillionBDT: 340,
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/v1/governance/export', (_req, res) => {
    res.json({
      status: 'success',
      countryCode: 'BD',
      exportType: 'Consolidated National AI Governance Telemetry Stream',
      accessProtocol: 'REST API Streaming (Direct File Download Disabled)',
      complianceRule: 'Article 12: Sovereign Data Access Authorization',
      generatedAt: new Date().toISOString(),
    });
  });

  // Country-isolated & role-guarded AI Policy Copilot endpoint (Module 20)
  app.post('/api/copilot/query', async (req, res) => {
    const countryCode = String(req.headers['x-country-id'] || req.body?.countryCode || 'BD');
    const userRole = String(req.headers['x-user-role'] || req.body?.userRole || 'commissioner');
    const { prompt, mode, language, contextSnapshot } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini AI Copilot requires GEMINI_API_KEY configured in Settings > Secrets.',
      });
    }

    const langInstruction =
      language === 'bn'
        ? 'Respond primarily in formal, clear Bengali (Bangla) suitable for national policy officials, keeping technical terms clear.'
        : 'Respond in crisp, authoritative institutional English suitable for national AI governance officials.';

    const systemInstruction = [
      `You are the BD AI WATCH National AI Policy Copilot & Governance Analyst operating inside country workspace "${countryCode}".`,
      `Current user role: "${userRole}". Strictly enforce country isolation: ONLY cite data from "${countryCode}" unless the user explicitly asks for international benchmarking.`,
      userRole === 'public_observer'
        ? 'The user is a Public Observer: do NOT reveal classified security vulnerabilities or internal restricted risk logs.'
        : 'You may analyze full institutional, regulatory, risk, and implementation telemetry.',
      `Active Copilot mode: ${mode || 'policy_copilot'}.`,
      langInstruction,
      'Ground every recommendation in the provided country governance telemetry and cite specific module numbers (e.g., Module 03 Policy, Module 06 Risk, Module 18 Action Plan). Keep formatting clean with structured headings and concise action points.',
    ].join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Active Country Telemetry Snapshot (${countryCode}):\n${JSON.stringify(contextSnapshot || {}, null, 2)}\n\nUser Request:\n${prompt}`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      return res.json({
        text: response.text || 'No response generated.',
        countryCode,
        role: userRole,
        model: 'gemini-4-hydrogen',
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gemini request failed';
      console.error('Gemini Copilot error:', message);
      return res.status(502).json({ error: message });
    }
  });

  // Document & Policy Gap Analyzer endpoint (Module 20 -> Module 03/04/07)
  app.post('/api/copilot/analyze-document', async (req, res) => {
    const countryCode = String(req.headers['x-country-id'] || req.body?.countryCode || 'BD');
    const userRole = String(req.headers['x-user-role'] || req.body?.userRole || 'commissioner');
    const { documentText, documentTitle, language, contextSnapshot } = req.body || {};

    if (userRole === 'public_observer') {
      return res.status(403).json({
        error: 'Document compliance analysis automation requires an analyst, auditor, coordinator, or commissioner role.',
      });
    }

    if (!documentText || typeof documentText !== 'string') {
      return res.status(400).json({ error: 'Document text is required for analysis.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini Document Analyzer requires GEMINI_API_KEY configured in Settings > Secrets.',
      });
    }

    const langInstruction =
      language === 'bn'
        ? 'Write the analytical findings in clear institutional Bengali (Bangla).'
        : 'Write the analytical findings in clear institutional English.';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Document Title: ${documentTitle || 'Untitled Policy/AI Draft'}\nCountry Context: ${countryCode}\nCountry Governance Baseline:\n${JSON.stringify(contextSnapshot || {})}\n\nDocument Excerpt:\n${documentText.slice(0, 12000)}`,
        config: {
          systemInstruction: `You are an automated National AI Regulatory & Responsible AI Document Auditor for country "${countryCode}". Evaluate the submitted text across: (1) Legal & Regulatory Alignment (Module 04), (2) Responsible AI Principles: Fairness, Transparency, Explainability, Accountability, Human Oversight (Module 07), (3) Risk & Impact Gaps (Modules 06 & 08), and (4) Concrete Remediation Clauses. ${langInstruction}`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
        },
      });

      return res.json({
        analysis: response.text || '',
        countryCode,
        analyzedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Document analysis failed';
      return res.status(502).json({ error: message });
    }
  });

  // Executive Briefing Generator (Module 20 -> Module 19)
  app.post('/api/copilot/generate-brief', async (req, res) => {
    const countryCode = String(req.headers['x-country-id'] || req.body?.countryCode || 'BD');
    const { focusArea, language, contextSnapshot } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini Briefing Generator requires GEMINI_API_KEY configured in Settings > Secrets.',
      });
    }

    const langInstruction =
      language === 'bn'
        ? 'Write the executive briefing in formal Bengali (Bangla).'
        : 'Write the executive briefing in formal executive English.';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Generate an Executive Ministerial Briefing for ${countryCode} focused on: ${focusArea || 'Comprehensive National AI Governance Status'}.\n\nLive Country Telemetry:\n${JSON.stringify(contextSnapshot || {})}`,
        config: {
          systemInstruction: `Draft a crisp cabinet-grade National AI Executive Briefing using only the provided telemetry for "${countryCode}". Structure into: 1. Executive Summary, 2. Readiness & Infrastructure Position, 3. Policy & Regulatory Priorities, 4. Critical Risks & Mitigations, 5. Immediate 90-Day Decisions Required. ${langInstruction}`,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      return res.json({
        briefing: response.text || '',
        countryCode,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Briefing generation failed';
      return res.status(502).json({ error: message });
    }
  });

  // Admin CMS: Analyze public consultation submission & draft official institutional reply
  app.post('/api/admin/analyze-submission', async (req, res) => {
    const countryCode = String(req.headers['x-country-id'] || req.body?.countryCode || 'BD');
    const userRole = String(req.headers['x-user-role'] || req.body?.userRole || 'public_observer');
    const { respondentName, sector, policyTitle, comment, language } = req.body || {};

    if (userRole !== 'admin') {
      return res.status(403).json({
        error: 'Access denied: Admin role is required to analyze submissions.',
      });
    }

    if (!comment || typeof comment !== 'string') {
      return res.status(400).json({ error: 'Submission comment text is required.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API key is not configured.',
      });
    }

    const langInstruction =
      language === 'bn'
        ? 'Write both the analysis and draftReply in clear, respectful formal Bengali (Bangla).'
        : 'Write both the analysis and draftReply in clear, respectful institutional English.';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Country Workspace: ${countryCode}\nTarget Policy: ${policyTitle || 'National AI Policy'}\nRespondent: ${respondentName || 'Citizen'} (${sector || 'Public'})\nSubmission:\n${comment}`,
        config: {
          systemInstruction: `You are the Admin CMS Governance Triage Analyst for ${countryCode}. Return strict JSON with keys: "priority" ("Urgent" | "High" | "Standard"), "suggestedDisposition" ("Under Review" | "Accepted" | "Incorporated"), "analysis" (2-3 crisp sentences evaluating policy relevance, technical/legal feasibility, and risk alignment), and "draftReply" (3-4 sentences polite official response acknowledging the submission and explaining next steps). ${langInstruction}`,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json({
        priority: parsed.priority || 'High',
        suggestedDisposition: parsed.suggestedDisposition || 'Under Review',
        analysis: parsed.analysis || '',
        draftReply: parsed.draftReply || '',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Submission analysis failed';
      return res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BD AI WATCH OS server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
