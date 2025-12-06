import React, { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Chip } from "../ui/Tag";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Germany",
  "France",
  "Mexico",
  "Canada:English",
  "Canada:French",
  "Australia",
];

export function LocalizationStep({
  hasCompliance,
  hasEmail,
  hasApiKey,
  onRun,
  statusText,
  jobs,
}) {
  const [selected, setSelected] = useState([]);
  const [previewJobId, setPreviewJobId] = useState(null);

  const toggleSelection = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  };

  const handleRun = () => {
    onRun(selected);
  };

  useEffect(() => {
    if (!jobs.length) {
      setPreviewJobId(null);
      return;
    }
    if (!previewJobId || !jobs.some((j) => j.id === previewJobId)) {
      setPreviewJobId(jobs[0].id);
    }
  }, [jobs, previewJobId]);

  const total = jobs.length;
  const flagged = jobs.filter((j) => j.status === "Flagged").length;
  const pending = jobs.filter((j) => j.status === "Pending").length;
  const approved = jobs.filter((j) => j.status === "Approved").length;
  const previewJob = jobs.find((j) => j.id === previewJobId) || null;
  const previewSubject = previewJob
    ? previewJob.overriddenSubject || previewJob.localizedSubject
    : "";
  const previewBody = previewJob
    ? previewJob.overriddenBody || previewJob.localizedBody
    : "";

  return (
    <>
      <p className="tagline">
        Step 3: Select target markets and run simulated AI localization + QA.
        Includes language quality, cultural sensitivity, compliance, and
        technical checks.
      </p>

      <div className="field-row">
        <div className="field-col">
          <label>Target Countries / Regions</label>
          <div className="chip-list" style={{ marginBottom: 4 }}>
            {COUNTRIES.map((c) => (
              <Chip
                key={c}
                primary={selected.includes(c)}
                onClick={() => toggleSelection(c)}
              >
                {c}
              </Chip>
            ))}
          </div>
          <div className="hint">
            Click to toggle markets. This prototype currently supports our
            prioritized English, German, Spanish, and Canadian locales.
          </div>
        </div>
        <div className="field-col">
          <label>AI Evaluation Modes</label>
          <div className="chip-list">
            <Chip primary>Language Model Check</Chip>
            <Chip primary>Cultural Sensitivity Model</Chip>
            <Chip primary>Compliance Model</Chip>
            <Chip primary>Technical Check</Chip>
          </div>
          <div className="card-section-title">Simulation Settings</div>
          <div className="chip-list">
            <Chip>Deterministic demo</Chip>
            <Chip>Rule-based issue heuristics</Chip>
            <Chip>Inline change log</Chip>
          </div>
        </div>
      </div>

      <div className="field-row">
        <div className="field-col">
          <Button
            variant="primary"
            type="button"
            onClick={handleRun}
            disabled={
              !hasCompliance || !hasEmail || !hasApiKey || selected.length === 0
            }
          >
            Run Localization & QA
          </Button>
          <span className="hint" style={{ marginLeft: 8 }}>
            {statusText ||
              (!hasCompliance
                ? "Analyze compliance first."
                : !hasEmail
                ? "Analyze source email first."
                : !hasApiKey
                ? "Backend OpenAI key missing."
                : "")}
          </span>
        </div>
      </div>

      <div className="divider" />

      <div className="two-column" style={{ gap: 12 }}>
        <div>
          <div className="card-section-title">
            Summary of Generated Localized Emails
          </div>
          <div className="alert">
            {total === 0 ? (
              <>
                No localization jobs yet. Select countries and click{" "}
                <strong>Run Localization &amp; QA</strong>.
              </>
            ) : (
              <>
                <div>
                  <strong>{total}</strong> localized emails generated for selected
                  markets.
                </div>
                <div className="subtle">
                  Status: <strong>{approved}</strong> approved,{" "}
                  <strong>{pending}</strong> pending review,{" "}
                  <strong>{flagged}</strong> flagged.
                </div>
              </>
            )}
          </div>
        </div>
        <div>
          <div className="card-section-title">Localized Email Preview</div>
          {previewJob ? (
            <div className="preview-card">
              {jobs.length > 1 ? (
                <select
                  value={previewJobId || ""}
                  onChange={(e) => setPreviewJobId(e.target.value)}
                >
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.country} · {job.status}
                    </option>
                  ))}
                </select>
              ) : null}
              <div className="email-preview">
                <div className="email-preview-header">
                  <div>
                    <strong>From:</strong> Audible QA Localization
                  </div>
                  <div>
                    <strong>To:</strong> {previewJob.country} marketing list
                  </div>
                  <div>
                    <strong>Subject:</strong> {previewSubject}
                  </div>
                </div>
                <div className="email-preview-body">
                  {previewBody}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert">
              Run localization to preview the localized subject and body here.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
