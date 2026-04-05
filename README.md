# AI-Driven Cultural Compliance & Localization Prototype

### Audible Global Marketing QA Automation System

This repository contains a functional prototype of an AI-powered cultural compliance and localization system designed to automate translation, cultural quality assurance, regulatory compliance checking, and human-in-the-loop approval workflows for global audiobook marketing campaigns.

The prototype demonstrates how AI can reduce manual processing time from approximately **2–3 hours to about 20 minutes**, representing an **83–88% efficiency improvement** over traditional workflows.

---

## Project Overview

Global marketing teams must adapt content across languages and cultures while maintaining accuracy, compliance, and brand consistency. Manual review processes are slow, error-prone, and require specialized regional knowledge. This prototype demonstrates a unified workflow that:

1. Ingests multilingual compliance rule documents
2. Parses and analyzes email marketing drafts
3. Produces region-specific localized versions
4. Performs automated cultural and compliance risk checks
5. Supports human reviewers through an approval interface
6. Provides risk scores and performance analytics in a dashboard

The system is implemented as a browser-based, front-end prototype suitable for demonstration and research.

---

## System Architecture

This prototype is implemented as a React single-page application and uses:

* Vite for fast development and bundling
* React Hooks for workflow and state management
* OpenAI Responses API for localization, translation, and QA reasoning
* A deterministic simulation engine for environments without an API key
* In-memory state storage to manage jobs, rule sets, decisions, and analytics

High-level process flow:

```
User → UI (React) → Rule Ingestion → Draft Parsing 
→ Localization Prompting → OpenAI/Simulation Engine 
→ Issue Detection & Risk Scoring → Reviewer Approval Workflow 
→ Dashboard Metrics & Reporting
```

Backend services are not included in this prototype but are described in the technical strategy for a production implementation.

---

## Repository Structure

```
/
├── src/
│   ├── App.jsx                   # Application root and workflow controller
│   ├── components/
│   │   ├── ComplianceStep.jsx    # Rule ingestion and normalization
│   │   ├── EmailStep.jsx         # Email draft processing
│   │   ├── LocalizationStep.jsx  # Localization and QA generation
│   │   ├── DashboardStep.jsx     # Metrics, analytics, and risk reporting
│   │   ├── SidePanel.jsx         # Human reviewer decision panel
│   ├── openaiClient.js           # Wrapper for OpenAI Responses API
│   ├── aiSimulation.js           # Fallback LLM simulation engine
│   ├── utils.js                  # Risk scoring utilities and helper functions
│   └── styles.css
├── index.html
└── README.md
```

---

## Core Features

### 1. Multilingual Compliance Rule Ingestion

* Supports `.txt` rule documents
* Automatic language detection
* Translation and normalization into English
* Hierarchical rule scope (global and country-specific)

### 2. Email Draft Parsing

* Language detection
* Separation of subject and body
* Semantic preparation for localization

### 3. AI-Driven Localization

* Region-specific prompt generation
* Cultural and stylistic adaptation
* Automated detection of issues such as tone mismatch, translation artifacts, and taboo phrases

### 4. Cultural and Compliance QA

* Rule-aligned text evaluation
* Detection of high-risk language
* Weighted risk scoring

### 5. Human-in-the-Loop Review Workflow

* Approve, flag, or regenerate AI-generated content
* Logging of reviewer decisions
* Regeneration with custom instructions

### 6. Dashboard Metrics and Risk Analytics

Displays:

* Acceptance rate
* Regeneration rate
* AI Generation Flagged Rate
* Reviewer–AI Approval Rate
* Average risk score
* Distribution of localized outputs by region

---

## AI and Prompting Strategy

The system uses structured prompt templates for:

* Compliance rule standardization
* Language detection
* Translation and localization
* Cultural QA evaluation
* Risk factor identification

When no OpenAI API key is provided, the system defaults to a deterministic simulation engine to ensure consistent demonstration behavior.

---

## Performance Metrics Implemented in the Prototype

### Output Performance Metrics

* **AI Generation Flagged Rate**: Percentage of outputs flagged by human reviewers
* **Reviewer–AI Approval Rate**: Approved outputs divided by total reviewer decisions
* **Regeneration Frequency**: Number of required regeneration cycles per job
* **Acceptance Rate**: Proportion of outputs accepted without modification

### Operational Metrics

* Localization processing time
* Reviewer decision throughput
* Issue-type distribution
* Risk score averages

### Business Metrics (Simulated)

* Localization launch time reduction
* Predicted conversion and engagement impact

These metrics align with the technical report and can be extended when integrated with real backend services.

---

## Running the Prototype

### 1. Install Dependencies

```bash
npm install
```

### 2. Optional: Configure OpenAI API Key

Create a `.env` file:

```
VITE_OPENAI_API_KEY=your_key_here
```

If this key is not supplied, the system automatically runs in simulation mode.

change /AI-Driven-Cultural-Compliance-Localization-Prototype/dist/assets/index-Cv30ojpP.js file

search 'api_key_need_change' and change it into your key

### 3. Start the Development Server

```bash
npm run dev
```

Open the browser at:

```
http://localhost:5173
```

---

## Limitations of This Prototype

The current implementation is intentionally front-end only. Limitations include:

* No backend for rule persistence or job storage
* No authentication or permission controls
* Heuristic issue detection rather than trained QA models
* Risk scoring implemented as rule-based weighting
* No integration with real marketing analytics or downstream systems

These limitations are addressed in the production technical strategy and are appropriate for a demonstration prototype.

---

## Planned Future Enhancements

* Backend microservices for rule management, auditing, and queue processing
* Fine-tuned cultural QA classification models
* Structured compliance rule schema and validation engine
* Semantic drift evaluators (COMET/BLEU) for translation quality
* Reinforcement learning from reviewer feedback
* Integration with real campaign performance data

---

## Contributors

Group 8 – AI-Driven Cultural Intelligence

* Siyi Wang (Core Functions, Prototype Development, Technical Strategy)
* Wendy Xu
* Lucy Dai
* Debbie Lee
* Clare Fu
* San Wing Chu

Advisor: Hannah Chiu

---

## License

MIT License unless otherwise specified.
