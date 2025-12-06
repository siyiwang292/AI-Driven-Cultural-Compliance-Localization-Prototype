import React, { useEffect, useRef } from "react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Tag";

export function SidePanel({
  selectedJob,
  sourceEmailState,
  onApprove,
  onFlag,
  onUpdateBody,
  onUpdateSubject,
  regeneratePrompt,
  onChangeRegeneratePrompt,
  onRegenerate,
  regenerationStatus,
  hasOpenAIKey,
}) {
  const emptyState = !selectedJob;
  const promptValue = regeneratePrompt || "";
  const localizedTextareaRef = useRef(null);
  const localizedSubject =
    selectedJob?.overriddenSubject ||
    selectedJob?.localizedSubject ||
    "(no subject)";
  const localizedBody =
    selectedJob?.overriddenBody ||
    selectedJob?.localizedBody ||
    "(no body)";
  const originalSubject = sourceEmailState.subject || "(empty)";
  const originalBody = sourceEmailState.body || "(no body)";
  const previewTimestamp =
    selectedJob?.updatedAt ||
    new Date().toLocaleString();

  useEffect(() => {
    const el = localizedTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(200, Math.min(el.scrollHeight, 600))}px`;
  }, [
    selectedJob?.id,
    selectedJob?.localizedBody,
    selectedJob?.overriddenBody,
  ]);

  return (
    <>
      <div className="section-title">
        Asset Detail & AI Decisions
      </div>

      {emptyState ? (
        <div className="alert" id="sidePanelEmptyState">
          Use the workflow on the left to upload compliance rules and source
          email, then select a localized asset in the dashboard to inspect AI
          decisions.
        </div>
      ) : (
        <div id="sidePanelContent">
          <div className="chip-list" id="selectedAssetTags">
            <Badge>{selectedJob.country}</Badge>
            <Badge>Status: {selectedJob.status}</Badge>
            <Badge>{selectedJob.issues.length} issues</Badge>
          </div>

          <div className="metric-row" style={{ marginTop: 8 }}>
            <span>Overall Risk</span>
            <span
              id="selectedAssetRisk"
              className={
                selectedJob.risk.label === "High"
                  ? "risk-high"
                  : selectedJob.risk.label === "Medium"
                  ? "risk-medium"
                  : "risk-low"
              }
            >
              {selectedJob.risk.label}
            </span>
          </div>
          <div className="bar">
            <div
              id="selectedAssetRiskBar"
              className="bar-inner"
              style={{ width: `${selectedJob.risk.percent}%` }}
            />
          </div>

          <div className="card-section-title">
            Original vs Localized (Snapshot)
          </div>
          <div className="two-column">
            <div>
              <div className="subtle">Original Email (Source)</div>
              <label className="inline-label">Email Subject</label>
              <div className="preview-static">{originalSubject}</div>
              <label className="inline-label">Email Body</label>
              <div className="preview-static">{originalBody}</div>
            </div>
            <div>
              <div className="subtle">Localized Email (Current)</div>
              <label className="inline-label">Email Subject</label>
              <textarea
                className="preview-textarea"
                value={localizedSubject}
                onChange={(e) => onUpdateSubject(e.target.value)}
                rows={2}
              />
              <label className="inline-label">Email Body</label>
              <textarea
                id="selectedLocalizedEmailInput"
                value={localizedBody}
                onChange={(e) => onUpdateBody(e.target.value)}
                ref={localizedTextareaRef}
                style={{ resize: "vertical", minHeight: 220 }}
              />
            </div>
          </div>
          <div className="hint">
            Edits here represent "human override." The updated content is saved
            into the in-memory dataset.
          </div>

          <div className="card-section-title">
            Additional Prompting &amp; Regeneration
          </div>
          <div className="field-row">
            <div className="field-col">
              <label>Optional creative direction</label>
              <textarea
                value={promptValue}
                onChange={(e) => onChangeRegeneratePrompt(e.target.value)}
                placeholder="E.g., Emphasize limited-time urgency and reference local holiday."
              />
              <div className="hint">
                Enter extra instructions before regenerating the localized email.
              </div>
              <Button
                variant="primary"
                type="button"
                style={{ marginTop: 8 }}
                onClick={onRegenerate}
                disabled={!hasOpenAIKey}
              >
                Regenerate Localized Email
              </Button>
              <div className="hint" style={{ marginTop: 4 }}>
                {regenerationStatus ||
                  (hasOpenAIKey
                    ? "Use regeneration to request an updated OpenAI translation."
                    : "Add VITE_OPENAI_API_KEY to enable regeneration.")}
              </div>
            </div>
          </div>

          <div className="card-section-title">
            AI-detected Issues & Recommendations
          </div>
          <ul className="issue-list" id="selectedIssuesList">
            {selectedJob.issues.length === 0 ? (
              <li>
                <div className="bullet-dot" />
                <div className="subtle">No issues detected.</div>
              </li>
            ) : (
              selectedJob.issues.map((issue, idx) => (
                <li key={idx}>
                  <div className="bullet-dot" />
                  <div>
                    <div>
                      <span className="issue-type">{issue.type}</span>{" "}
                      <span className="tag-badge">
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="subtle">{issue.message}</div>
                    <div className="subtle">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="card-section-title">
            Human-in-the-loop Decision
          </div>
          <div className="field-row">
            <Button variant="soft" type="button" onClick={onApprove}>
              Approve
            </Button>
            <Button variant="danger-soft" type="button" onClick={onFlag}>
              Flag / Needs work
            </Button>
          </div>
          <div className="hint">
            Each decision is logged into the prototype dataset, simulating
            continuous learning signals.
          </div>

          <div className="card-section-title">AI Email Preview</div>
          <div className="email-preview-classic">
            <div className="email-preview-title">{localizedSubject}</div>
            <div className="email-preview-meta">
              <span>audible &lt;support@audible.com&gt;</span>
              <span>{previewTimestamp}</span>
            </div>
            <div className="email-preview-message">
              {localizedBody}
            </div>
          </div>
        </div>
      )}

      <div className="divider" />

      <div className="card-section-title">System Architecture (Conceptual)</div>
      <ul className="issue-list">
        <li>
          <div className="bullet-dot" />
          <div>
            <span className="issue-type">AI Evaluation Layer:</span> language
            quality, cultural sensitivity, compliance, and technical checks.
          </div>
        </li>
        <li>
          <div className="bullet-dot" />
          <div>
            <span className="issue-type">Human-in-the-loop:</span> reviewers
            validate or override AI; decisions become labeled data.
          </div>
        </li>
        <li>
          <div className="bullet-dot" />
          <div>
            <span className="issue-type">Continuous Learning:</span> decisions
            feed back into updated prompts and models over time.
          </div>
        </li>
      </ul>
    </>
  );
}
