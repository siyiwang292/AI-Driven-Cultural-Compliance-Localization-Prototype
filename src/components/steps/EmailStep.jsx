import React from "react";
import { Button } from "../ui/Button";

export function EmailStep({
  emailState,
  onUpdate,
  onAnalyze,
  statusText,
  hasOpenAIKey,
}) {
  return (
    <>
      <p className="tagline">
        Step 2: Provide the original marketing email (any language). The system
        will simulate detection and preparation for localization.
      </p>

      <div className="field-row">
        <div className="field-col">
          <label>Email Subject</label>
          <input
            type="text"
            value={emailState.subject}
            onChange={(e) => onUpdate({ ...emailState, subject: e.target.value })}
            placeholder="E.g., Limited-time offer on premium headphones"
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field-col">
          <label>Email Body</label>
          <textarea
            value={emailState.body}
            onChange={(e) => onUpdate({ ...emailState, body: e.target.value })}
            placeholder="Paste your email content here in any language. Include CTAs, links, disclaimers, etc."
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field-col">
          <Button variant="primary" type="button" onClick={onAnalyze}>
            Detect Language & Prepare
          </Button>
          <span className="hint" style={{ marginLeft: 8 }}>
            {statusText ||
              (hasOpenAIKey
                ? ""
                : "OpenAI key missing. Detection is disabled until configured.")}
          </span>
        </div>
      </div>

      <div className="divider" />

      <div className="two-column">
        <div>
          <div className="card-section-title">Source Language & Tone</div>
          <div className="alert">
            {emailState.detectedLanguage ? (
              <>
                <div>
                  <strong>Detected source language:</strong>{" "}
                  {emailState.detectedLanguage}
                </div>
                <div className="subtle">
                  Language detection runs through OpenAI. Tone analysis would be
                  handled by additional models.
                </div>
              </>
            ) : (
              <>No email analyzed yet.</>
            )}
          </div>
        </div>
        <div>
          <div className="card-section-title">AI Readiness Check</div>
          <ul className="issue-list">
            {emailState.readinessNotes.length ? (
              emailState.readinessNotes.map((n, idx) => (
                <li key={idx}>
                  <div className="bullet-dot" />
                  <div className="subtle">{n}</div>
                </li>
              ))
            ) : (
              <li>
                <div className="bullet-dot" />
                <div className="subtle">
                  After detection, the system checks if CTAs, links, and
                  disclaimers are clearly marked for localization.
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}
