import React from "react";

export function DashboardStep({ jobs, onSelectJob }) {
  const total = jobs.length;

  const totalIssues = jobs.reduce((acc, j) => acc + j.issues.length, 0);
  const approvedCount = jobs.filter((j) => j.status === "Approved").length;
  const regeneratedCount = jobs.filter(
    (j) => (j.regenerationCount || 0) > 0
  ).length;
  const acceptRate = total ? Math.round((approvedCount / total) * 100) : 0;
  const regenerateRate = total
    ? Math.round((regeneratedCount / total) * 100)
    : 0;

  const byType = {};
  const byCountry = {};
  let high = 0,
    medium = 0,
    low = 0;

  jobs.forEach((job) => {
    if (job.risk.label === "High") high++;
    else if (job.risk.label === "Medium") medium++;
    else low++;

    byCountry[job.country] = (byCountry[job.country] || 0) + job.issues.length;

    job.issues.forEach((issue) => {
      byType[issue.type] = (byType[issue.type] || 0) + 1;
    });
  });

  const marketingRows = jobs.map((job) => {
    const hash = job.id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sent = 2000 + (hash % 1500);
    const openRate = 0.22 + ((hash % 15) / 100);
    const clickModifier =
      job.risk.label === "High" ? -0.08 : job.risk.label === "Medium" ? 0 : 0.05;
    const clickRate = Math.max(openRate * (0.35 + clickModifier), 0.02);
    const opens = Math.round(sent * openRate);
    const clicks = Math.round(sent * clickRate);
    return {
      country: job.country,
      sent,
      opens,
      clicks,
      clickRate: (clickRate * 100).toFixed(2) + "%",
    };
  });

  return (
    <>
      <p className="tagline">
        Step 4: Human-in-the-loop review. Approve or override AI decisions and
        view aggregated risk &amp; QA reports.
      </p>

      <div className="card-section-title">QA Dashboard: Localized Assets</div>
      <div id="dashboardTableContainer">
        {jobs.length === 0 ? (
          <div className="alert">
            No assets yet. Run localization in Step 3 to populate this dashboard.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Risk</th>
                <th>Issues</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const riskClass =
                  job.risk.label === "High"
                    ? "risk-high"
                    : job.risk.label === "Medium"
                    ? "risk-medium"
                    : "risk-low";
                const statusClass =
                  job.status === "Approved"
                    ? "status-approved"
                    : job.status === "Flagged"
                    ? "status-flagged"
                    : "status-pending";
                return (
                  <tr key={job.id} onClick={() => onSelectJob(job.id)}>
                    <td>
                      <span className="badge">{job.country}</span>
                    </td>
                    <td className={riskClass}>{job.risk.label}</td>
                    <td>{job.issues.length}</td>
                    <td>
                      <span className={`status-pill ${statusClass}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="subtle">{job.updatedAt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="divider" />

      <div className="card-section-title">Reports &amp; Risk Analytics</div>

      {jobs.length === 0 ? (
        <div className="alert">
          Once you have localized emails, we will show issue distribution and
          risk scores here.
        </div>
      ) : (
        <div className="two-column">
          <div>
            <div className="card-section-title">Live Workflow KPIs</div>
            <div className="alert">
              <div>
                <strong>{acceptRate}%</strong> accept rate (
                {approvedCount}/{total})
              </div>
              <div>
                <strong>{regenerateRate}%</strong> regenerate rate (
                {regeneratedCount}/{total})
              </div>
              <div className="subtle">
                Updated {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="card-section-title">Risk Distribution</div>
            <div className="metric-row">
              <span>High risk assets</span>
              <span className="risk-high">{high}</span>
            </div>
            <div className="metric-row">
              <span>Medium risk assets</span>
              <span className="risk-medium">{medium}</span>
            </div>
            <div className="metric-row">
              <span>Low risk assets</span>
              <span className="risk-low">{low}</span>
            </div>
            <div className="card-section-title">Issue Types</div>
            {Object.keys(byType).length === 0 ? (
              <div className="subtle">No issues recorded.</div>
            ) : (
              Object.entries(byType).map(([t, count]) => (
                <div className="metric-row" key={t}>
                  <span>{t}</span>
                  <span>{count}</span>
                </div>
              ))
            )}
          </div>
          <div>
            <div className="card-section-title">Issues by Country</div>
            {Object.keys(byCountry).length === 0 ? (
              <div className="subtle">No localized assets.</div>
            ) : (
              Object.entries(byCountry).map(([c, count]) => (
                <div className="metric-row" key={c}>
                  <span>{c}</span>
                  <span>{count} issues</span>
                </div>
              ))
            )}
            <div className="card-section-title">Summary</div>
            <div className="alert">
              <div>
                <strong>{total}</strong> localized emails
              </div>
              <div>
                <strong>{totalIssues}</strong> total issues logged across all AI
                checks.
              </div>
              <div className="subtle">
                In a production system, this data would drive retraining and
                prioritization.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="divider" />

      <div className="card-section-title">Marketing Performance</div>
      {jobs.length === 0 ? (
        <div className="alert">
          Run localization to populate estimated send, open, and click metrics.
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Country</th>
                <th>Sent</th>
                <th>Opens</th>
                <th>Clicks</th>
                <th>Click Rate</th>
              </tr>
            </thead>
            <tbody>
              {marketingRows.map((row) => (
                <tr key={row.country}>
                  <td>{row.country}</td>
                  <td>{row.sent.toLocaleString()}</td>
                  <td>{row.opens.toLocaleString()}</td>
                  <td>{row.clicks.toLocaleString()}</td>
                  <td>{row.clickRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
