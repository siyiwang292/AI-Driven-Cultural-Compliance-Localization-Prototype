import React from "react";

const stepsMeta = [
  {
    id: 1,
    title: "Compliance Rules",
    subtitle: "Upload & extract prompts",
  },
  {
    id: 2,
    title: "Source Email",
    subtitle: "Any language",
  },
  {
    id: 3,
    title: "Localization & QA",
    subtitle: "Markets + checks",
  },
  {
    id: 4,
    title: "Dashboard & Reports",
    subtitle: "Human review",
  },
];

export function Stepper({ activeStep, completedSteps, onStepChange }) {
  return (
    <div className="steps">
      {stepsMeta.map((s) => {
        const isActive = activeStep === s.id;
        const isCompleted = completedSteps.includes(s.id);
        const classNames = [
          "step-btn",
          isActive ? "active" : "",
          isCompleted ? "completed" : "",
        ]
          .join(" ")
          .trim();

        return (
          <button
            key={s.id}
            className={classNames}
            type="button"
            onClick={() => onStepChange(s.id)}
          >
            <span className="index">{s.id}</span>
            <div>
              <div>{s.title}</div>
              <div className="subtle">{s.subtitle}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
