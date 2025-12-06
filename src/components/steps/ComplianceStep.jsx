import React from "react";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Tag";

const COUNTRY_OPTIONS = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Mexico",
  "Canada:English",
  "Canada:French",
  "Australia",
];

export function ComplianceStep({
  complianceLibrary,
  activeScope,
  onChangeScope,
  onSetRawText,
  onAnalyze,
  analyzeStatus,
  hasOpenAIKey,
}) {
  const scopeIsGlobal = activeScope.type === "global";

  const current =
    activeScope.type === "global"
      ? complianceLibrary.global
      : complianceLibrary.byCountry[activeScope.country] || {
          rawText: "",
          fileName: "",
          detectedLanguage: "",
          standardTypes: [],
          countryPrompts: {},
          englishBaseText: "",
        };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      onSetRawText(text, file.name);
    };
    reader.readAsText(file);
  };

  const loadSample = () => {
    const sample = `
Brand Tone:
- Friendly, inclusive, and clear. Avoid aggressive or fear-based language.
- No discrimination or stereotyping based on gender, race, religion, or age.

Legal & Compliance:
- Include a clear unsubscribe link for all email campaigns.
- Display prices in local currency with all mandatory taxes/fees disclosed.
- For age-restricted products, include "For customers 18+ only" or local equivalent.
- Ensure claims such as "free" or "guaranteed" comply with local advertising law.

Cultural Sensitivity:
- Avoid taboo topics and sensitive historical references in each market.
- In some APAC markets, certain colors and numbers may have strong cultural meaning.
- Do not use imagery that conflicts with local religious norms.

Technical Requirements:
- All tracking links must include utm_campaign and market code parameters.
- Sender address must be a verified brand domain for each region.
`;
    onSetRawText(sample, "Sample compliance template");
  };

  return (
    <>
      <p className="tagline">
        Step 1: Manage your compliance & cultural rule library.{" "}
        You can maintain a global default plus country-specific rule sets.
      </p>

      <div className="field-row">
        <div className="field-col">
          <label>Rule Scope</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button
              variant={scopeIsGlobal ? "primary" : "secondary"}
              type="button"
              onClick={() =>
                onChangeScope({ type: "global", country: activeScope.country })
              }
            >
              Global Default
            </Button>
            <select
              value={activeScope.country}
              onChange={(e) =>
                onChangeScope({ type: "country", country: e.target.value })
              }
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="hint">
            Choose whether you are editing the global rulebook or a specific
            country’s rules.
          </div>
        </div>
      </div>

      <div className="field-row">
        <div className="field-col">
          <label>
            {scopeIsGlobal
              ? "Global Compliance & Localization Guidelines"
              : `Compliance & Cultural Rules · ${activeScope.country}`}
          </label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.html"
              onChange={handleFileChange}
            />
            <Button variant="ghost" type="button" onClick={loadSample}>
              Load Sample
            </Button>
          </div>
          <div className="file-name">
            {current.fileName ? `Selected: ${current.fileName}` : ""}
          </div>
          <div className="hint">
            Files are stored only in the browser state for this prototype.{" "}
            In production, you would persist them in a backend or content store.
          </div>
        </div>
      </div>

      <div className="field-row">
        <div className="field-col">
          <label>Add Compliance Requirements</label>
          <textarea
            value={current.rawText}
            onChange={(e) => onSetRawText(e.target.value, current.fileName)}
            placeholder="Paste or type the compliance & cultural rules for this scope..."
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field-col">
          <Button variant="primary" type="button" onClick={onAnalyze}>
            Analyze & Save Rule Set
          </Button>
          <span className="hint" style={{ marginLeft: 8 }}>
            {analyzeStatus}
          </span>
        </div>
      </div>

      <div className="divider" />

      <div className="two-column">
        <div>
          <div className="card-section-title">
            Detected Language & Standard Types
          </div>
          <div className="alert">
            {current.rawText ? (
              <>
                <div>
                  <strong>Detected language:</strong>{" "}
                  {current.detectedLanguage || "—"}
                </div>
                <div className="subtle">
                  {hasOpenAIKey
                    ? "Language detection here is powered by OpenAI."
                    : "Add VITE_OPENAI_API_KEY in .env to enable OpenAI-based language detection."}
                </div>
              </>
            ) : (
              <>No analysis yet for this scope.</>
            )}
          </div>
          <div className="card-section-title">Standard Types Detected</div>
          <div className="chip-list">
            {current.standardTypes?.length ? (
              current.standardTypes.map((t) => <Chip key={t}>{t}</Chip>)
            ) : (
              <span className="subtle">No types yet.</span>
            )}
          </div>
        </div>
        <div>
          <div className="card-section-title">
            Extracted Country Prompts (for AI)
          </div>
          <div className="alert prompt-alert">
            {Object.keys(current.countryPrompts || {}).length ? (
              Object.entries(current.countryPrompts).map(
                ([country, prompt]) => (
                  <div key={country} className="prompt-entry">
                    <span className="badge">{country}</span>
                    <textarea
                      className="prompt-text"
                      readOnly
                      value={prompt}
                    />
                  </div>
                )
              )
            ) : (
              <>
                Once analyzed, AI will simulate prompt templates using these rules.
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
