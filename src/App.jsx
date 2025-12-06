import React, { useEffect, useState } from "react";
import "./styles.css";
import { TopBar } from "./components/layout/TopBar";
import { Stepper } from "./components/layout/Stepper";
import { SidePanel } from "./components/layout/SidePanel";
import { Card, SideCard } from "./components/ui/Card";
import { ComplianceStep } from "./components/steps/ComplianceStep";
import { EmailStep } from "./components/steps/EmailStep";
import { LocalizationStep } from "./components/steps/LocalizationStep";
import { DashboardStep } from "./components/steps/DashboardStep";
import {
  analyzeEmailReadiness,
  buildCountryPrompts,
  computeRiskScore,
  extractStandardTypes,
  generateIssuesForCountry,
  uuid,
} from "./utils/aiSimulation";
import {
  detectLanguageWithOpenAI,
  translateEmailWithOpenAI,
  translateTextToEnglish,
} from "./utils/openaiClient";

const COUNTRY_LANGUAGE_MAP = {
  "United States": "American English",
  "United Kingdom": "British English",
  Germany: "German",
  France: "French",
  Mexico: "Latin American Spanish",
  "Canada:English": "Canadian English",
  "Canada:French": "Canadian French",
  Australia: "Australian English",
};

const languageAliasMap = {
  deutsch: "German",
  alemán: "German",
  allemand: "German",
  español: "Spanish",
  espanol: "Spanish",
  castellano: "Spanish",
  português: "Portuguese",
  portugues: "Portuguese",
  français: "French",
  francais: "French",
  english: "English",
  chino: "Chinese",
  中文: "Chinese",
  日本語: "Japanese",
};

const normalizeLanguageName = (value) => {
  if (!value) return "Unknown";
  const trimmed = value.trim();
  const alias =
    languageAliasMap[trimmed.toLowerCase()] ||
    languageAliasMap[trimmed.replace(/[^a-zA-Z]/g, "").toLowerCase()];
  return alias || trimmed;
};

const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

if (!OPENAI_KEY) {
  // Do not log the key itself; just help debug configuration.
  // eslint-disable-next-line no-console
  console.warn(
    "[Audible QA] VITE_OPENAI_API_KEY is not set. Language detection and translation will be disabled."
  );
}

export function App() {
  const [activeStep, setActiveStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  const [complianceLibrary, setComplianceLibrary] = useState({
    global: {
      rawText: "",
      fileName: "",
      detectedLanguage: "",
      standardTypes: [],
      countryPrompts: {},
      englishBaseText: "",
    },
    byCountry: {},
  });

  const [activeComplianceScope, setActiveComplianceScope] = useState({
    type: "global",
    country: "United States",
  });

  const [complianceStatus, setComplianceStatus] = useState("");

  const [emailState, setEmailState] = useState({
    subject: "",
    body: "",
    detectedLanguage: "",
    readinessNotes: [],
  });
  const [emailStatus, setEmailStatus] = useState("");

  const [localizationStatus, setLocalizationStatus] = useState("");
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [humanDecisions, setHumanDecisions] = useState([]);
  const [regenerateInputs, setRegenerateInputs] = useState({});
  const [regenerationStatus, setRegenerationStatus] = useState("");

  const markCompleted = (step) => {
    setCompletedSteps((prev) =>
      prev.includes(step) ? prev : [...prev, step]
    );
  };

  const updateActiveComplianceRaw = (text, fileName = "") => {
    setComplianceLibrary((prev) => {
      if (activeComplianceScope.type === "global") {
        return {
          ...prev,
          global: {
            ...prev.global,
            rawText: text,
            fileName: fileName || prev.global.fileName,
            englishBaseText: "",
          },
        };
      } else {
        const c = activeComplianceScope.country;
        const existing = prev.byCountry[c] || {
          rawText: "",
          fileName: "",
          detectedLanguage: "",
          standardTypes: [],
          countryPrompts: {},
          englishBaseText: "",
        };
        return {
          ...prev,
          byCountry: {
            ...prev.byCountry,
            [c]: {
              ...existing,
              rawText: text,
              fileName: fileName || existing.fileName,
              englishBaseText: "",
            },
          },
        };
      }
    });
  };

  const detectLanguageForText = async (text, fallback = "Unknown") => {
    if (!text?.trim()) return normalizeLanguageName(fallback);
    if (!OPENAI_KEY) {
      throw new Error("OpenAI API key missing for language detection.");
    }
    const detected = await detectLanguageWithOpenAI(OPENAI_KEY, text);
    return normalizeLanguageName(detected || fallback);
  };

  const handleAnalyzeCompliance = async () => {
    const scope = activeComplianceScope;
    const current =
      scope.type === "global"
        ? complianceLibrary.global
        : complianceLibrary.byCountry[scope.country] || {
            rawText: "",
            fileName: "",
            detectedLanguage: "",
            standardTypes: [],
            countryPrompts: {},
            englishBaseText: "",
          };

    if (!current.rawText.trim()) {
      setComplianceStatus(" Please provide compliance content first.");
      return;
    }
    setComplianceStatus(" Detecting language with OpenAI...");

    let detectedLanguage = "";
    let detectionError = "";
    try {
      detectedLanguage = await detectLanguageForText(current.rawText);
    } catch (err) {
      detectionError = err.message || "Language detection failed.";
    }
    const normalizedDetectedLanguage =
      detectedLanguage || normalizeLanguageName("Unknown");

    let englishRuleText = current.rawText;
    let translationError = "";
    let translationApplied = false;
    const needsEnglishNormalization =
      !/english/i.test(normalizedDetectedLanguage);
    if (needsEnglishNormalization) {
      if (!OPENAI_KEY) {
        translationError =
          "OpenAI key missing for English translation of compliance rules.";
      } else {
        try {
          englishRuleText = await translateTextToEnglish(
            OPENAI_KEY,
            current.rawText,
            normalizedDetectedLanguage
          );
          translationApplied = true;
        } catch (err) {
          translationError = err.message || "English translation failed.";
        }
      }
    }
    englishRuleText = englishRuleText?.trim() || current.rawText;
    const standardTypes = extractStandardTypes(current.rawText);
    const countryPrompts = buildCountryPrompts(
      englishRuleText,
      normalizedDetectedLanguage,
      scope.type,
      scope.country
    );

    setComplianceLibrary((prev) => {
      if (scope.type === "global") {
        return {
          ...prev,
          global: {
            ...prev.global,
            detectedLanguage: normalizedDetectedLanguage,
            standardTypes,
            countryPrompts,
            englishBaseText: englishRuleText,
          },
        };
      } else {
        const c = scope.country;
        const existing = prev.byCountry[c] || {};
        return {
          ...prev,
          byCountry: {
            ...prev.byCountry,
            [c]: {
              ...existing,
              rawText: current.rawText,
              fileName: existing.fileName || "",
              detectedLanguage: normalizedDetectedLanguage,
              standardTypes,
              countryPrompts,
              englishBaseText: englishRuleText,
            },
          },
        };
      }
    });

    const baseStatus =
      scope.type === "global"
        ? " Global rule set analyzed."
        : ` Rule set saved for ${scope.country}.`;
    const statusParts = [
      baseStatus,
      detectionError
        ? ` Language detection unavailable: ${detectionError}`
        : " Language detected via OpenAI.",
    ];
    if (needsEnglishNormalization) {
      statusParts.push(
        translationApplied
          ? " Base rules translated to English for AI prompts."
          : translationError
          ? ` English translation unavailable: ${translationError}`
          : ""
      );
    } else {
      statusParts.push(" Base rules already provided in English.");
    }
    setComplianceStatus(statusParts.filter(Boolean).join(""));
    markCompleted(1);
  };

  const handleUpdateEmail = (newState) => {
    setEmailState(newState);
  };

  const handleAnalyzeEmail = async () => {
    if (!emailState.subject.trim() && !emailState.body.trim()) {
      alert("Please enter an email subject or body first.");
      return;
    }
    setEmailStatus(" Detecting language with OpenAI...");
    let detectedLanguage = "";
    let detectionError = "";
    try {
      detectedLanguage = await detectLanguageForText(
        emailState.subject + "\n" + emailState.body
      );
    } catch (err) {
      detectionError = err.message || "Language detection failed.";
    }
    const normalizedDetectedLanguage =
      detectedLanguage || normalizeLanguageName("Unknown");
    const readinessNotes = analyzeEmailReadiness(emailState.body);
    setEmailState((prev) => ({
      ...prev,
      detectedLanguage: normalizedDetectedLanguage,
      readinessNotes,
    }));
    const status = detectionError
      ? ` Language detection unavailable: ${detectionError}`
      : " Language detection completed with OpenAI.";
    setEmailStatus(status);
    markCompleted(2);
  };

  const translateEmailForCountry = async (country, options = {}) => {
    if (!OPENAI_KEY) {
      throw new Error("OpenAI API key required for translation.");
    }
    const { customInstructions = "" } = options;
    const targetLanguage =
      COUNTRY_LANGUAGE_MAP[country] || `${country} locale language`;
    const result = await translateEmailWithOpenAI(OPENAI_KEY, {
      subject: emailState.subject || "(no subject)",
      body: emailState.body || "(no body)",
      targetLanguage,
      sourceLanguage:
        emailState.detectedLanguage || "Unknown (detect from content)",
      additionalInstructions: customInstructions,
    });
    return {
      localizedSubject: result.subject,
      localizedBody: result.body,
    };
  };

  const handleRunLocalization = async (countries) => {
    if (
      !complianceLibrary.global.rawText &&
      Object.keys(complianceLibrary.byCountry).length === 0
    ) {
      setLocalizationStatus(
        " Please create at least one compliance rule set (global or per-country) in Step 1."
      );
      return;
    }
    if (!emailState.body) {
      setLocalizationStatus(" Please analyze a source email in Step 2 first.");
      return;
    }
    if (!OPENAI_KEY) {
      setLocalizationStatus(
        " OpenAI API key missing on the client. Please configure the backend secret."
      );
      return;
    }
    if (countries.length === 0) {
      setLocalizationStatus(" Please select at least one target country.");
      return;
    }

    setLocalizationStatus(" Running simulated localization & QA...");
    const now = new Date().toLocaleString();

    try {
      const newJobs = await Promise.all(
        countries.map(async (country) => {
          const countryRules =
            complianceLibrary.byCountry[country] || complianceLibrary.global;

          let localizedSubject = `[${country}] ${emailState.subject || ""}`;
          let localizedBody = emailState.body || "(no body)";

          try {
            const translation = await translateEmailForCountry(country);
            localizedSubject = translation.localizedSubject;
            localizedBody = translation.localizedBody;
          } catch (err) {
            console.error(err);
            localizedBody = `${
              emailState.body || "(no body)"
            }\n\n---\n[Translation failed: ${err.message}]`;
          }

          const issues = generateIssuesForCountry(country, localizedBody);
          const risk = computeRiskScore(issues);

          return {
            id: uuid(),
            country,
            localizedSubject,
            localizedBody,
            overriddenBody: null,
            overriddenSubject: null,
            issues,
            risk,
            status: "Pending",
            updatedAt: now,
            ruleScope:
              countryRules === complianceLibrary.global ? "global" : "country",
            regenerationCount: 0,
            regenerationHistory: [],
          };
        })
      );

      const currentSelectedJob =
        jobs.find((job) => job.id === selectedJobId) || null;
      const replacedJobIds = jobs
        .filter((job) =>
          newJobs.some((newJob) => newJob.country === job.country)
        )
        .map((job) => job.id);

      setJobs((prev) => {
        const remaining = prev.filter(
          (job) => !newJobs.some((newJob) => newJob.country === job.country)
        );
        return [...remaining, ...newJobs];
      });
      if (replacedJobIds.length) {
        setRegenerateInputs((prev) => {
          const next = { ...prev };
          replacedJobIds.forEach((id) => {
            delete next[id];
          });
          return next;
        });
      }
      setRegenerationStatus("");
      if (currentSelectedJob) {
        const replacement = newJobs.find(
          (job) => job.country === currentSelectedJob.country
        );
        if (replacement) {
          setSelectedJobId(replacement.id);
        }
      }
      setLocalizationStatus(
        " Localization and QA completed for selected markets."
      );
      markCompleted(3);
      setActiveStep(4);
    } catch (err) {
      console.error(err);
      setLocalizationStatus(
        ` Localization failed: ${err.message || "Unexpected error."}`
      );
    }
  };

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || null;
  const selectedRegeneratePrompt = selectedJob
    ? regenerateInputs[selectedJob.id] || ""
    : "";

  useEffect(() => {
    setRegenerationStatus("");
  }, [selectedJobId]);

  const handleRegeneratePromptChange = (value) => {
    if (!selectedJob) return;
    setRegenerateInputs((prev) => ({
      ...prev,
      [selectedJob.id]: value,
    }));
  };

  const regenerateSelectedJob = async () => {
    if (!selectedJob) return;
    if (!OPENAI_KEY) {
      setRegenerationStatus(" OpenAI key missing. Unable to regenerate.");
      return;
    }
    setRegenerationStatus(" Regenerating localized email via OpenAI...");
    const instructions = regenerateInputs[selectedJob.id] || "";
    const updatedAt = new Date().toLocaleString();
    try {
      const translation = await translateEmailForCountry(
        selectedJob.country,
        {
          customInstructions: instructions,
        }
      );
      setJobs((prev) =>
        prev.map((job) =>
          job.id === selectedJob.id
            ? {
                ...job,
                localizedSubject: translation.localizedSubject,
                localizedBody: translation.localizedBody,
                overriddenBody: null,
                overriddenSubject: null,
                status: "Pending",
                updatedAt,
                regenerationCount: (job.regenerationCount || 0) + 1,
                regenerationHistory: [
                  ...(job.regenerationHistory || []),
                  {
                    timestamp: updatedAt,
                    instructions: instructions.trim(),
                  },
                ],
              }
            : job
        )
      );
      setRegenerateInputs((prev) => ({
        ...prev,
        [selectedJob.id]: "",
      }));
      setHumanDecisions((prev) => [
        ...prev,
        {
          jobId: selectedJob.id,
          action: "Regenerate",
          prompt: instructions,
          timestamp: updatedAt,
        },
      ]);
      setRegenerationStatus(" New localized output generated.");
    } catch (err) {
      console.error(err);
      setRegenerationStatus(
        ` Regeneration failed: ${err.message || "Unexpected error."}`
      );
    }
  };

  const updateSelectedJobBody = (newBody) => {
    if (!selectedJob) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, overriddenBody: newBody } : j
      )
    );
  };

  const updateSelectedJobSubject = (newSubject) => {
    if (!selectedJob) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, overriddenSubject: newSubject } : j
      )
    );
  };

  const approveSelectedJob = () => {
    if (!selectedJob) return;
    const updatedAt = new Date().toLocaleString();
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, status: "Approved", updatedAt } : j
      )
    );
    setHumanDecisions((prev) => [
      ...prev,
      { jobId: selectedJob.id, action: "Approve", timestamp: updatedAt },
    ]);
  };

  const flagSelectedJob = () => {
    if (!selectedJob) return;
    const updatedAt = new Date().toLocaleString();
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob.id ? { ...j, status: "Flagged", updatedAt } : j
      )
    );
    setHumanDecisions((prev) => [
      ...prev,
      { jobId: selectedJob.id, action: "Flag", timestamp: updatedAt },
    ]);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return (
          <ComplianceStep
            complianceLibrary={complianceLibrary}
            activeScope={activeComplianceScope}
            onChangeScope={setActiveComplianceScope}
            onSetRawText={updateActiveComplianceRaw}
            onAnalyze={handleAnalyzeCompliance}
            analyzeStatus={complianceStatus}
            hasOpenAIKey={!!OPENAI_KEY}
          />
        );
      case 2:
        return (
          <EmailStep
            emailState={emailState}
            onUpdate={handleUpdateEmail}
            onAnalyze={handleAnalyzeEmail}
            statusText={emailStatus}
            hasOpenAIKey={!!OPENAI_KEY}
          />
        );
      case 3:
        return (
          <LocalizationStep
            hasCompliance={
              !!complianceLibrary.global.rawText ||
              Object.keys(complianceLibrary.byCountry).length > 0
            }
            hasEmail={!!emailState.body}
            hasApiKey={!!OPENAI_KEY}
            onRun={handleRunLocalization}
            statusText={localizationStatus}
            jobs={jobs}
          />
        );
      case 4:
        return (
          <DashboardStep jobs={jobs} onSelectJob={setSelectedJobId} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      <TopBar />
      <div className="app-layout">
        <Card>
          <div className="section-title">
            Workflow
            <span className="pill">
              End-to-end: Compliance → Localization → QA → Report
            </span>
          </div>

          <Stepper
            activeStep={activeStep}
            completedSteps={completedSteps}
            onStepChange={setActiveStep}
          />

          <div style={{ marginTop: 12 }}>{renderStep()}</div>
        </Card>

        <SideCard>
          <SidePanel
            selectedJob={selectedJob}
            sourceEmailState={emailState}
            onApprove={approveSelectedJob}
            onFlag={flagSelectedJob}
            onUpdateBody={updateSelectedJobBody}
            onUpdateSubject={updateSelectedJobSubject}
            regeneratePrompt={selectedRegeneratePrompt}
            onChangeRegeneratePrompt={handleRegeneratePromptChange}
            onRegenerate={regenerateSelectedJob}
            regenerationStatus={regenerationStatus}
            hasOpenAIKey={!!OPENAI_KEY}
          />
        </SideCard>
      </div>
    </div>
  );
}
