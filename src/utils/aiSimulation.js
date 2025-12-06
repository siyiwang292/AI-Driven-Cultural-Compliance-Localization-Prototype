export function extractStandardTypes(text) {
  const types = [];
  const lower = text.toLowerCase();

  if (lower.includes("disclaimer") || lower.includes("legal"))
    types.push("Legal disclaimers");
  if (lower.includes("tone") || lower.includes("voice"))
    types.push("Brand tone & voice");
  if (lower.includes("currency") || lower.includes("usd") || lower.includes("eur"))
    types.push("Currency & pricing rules");
  if (lower.includes("age") || lower.includes("18+") || lower.includes("kids"))
    types.push("Age & audience restrictions");
  if (lower.includes("taboo") || lower.includes("forbidden") || lower.includes("sensitive"))
    types.push("Taboo terms & sensitive topics");
  if (lower.includes("image") || lower.includes("color") || lower.includes("symbol"))
    types.push("Imagery, color, and symbol guidelines");

  if (types.length === 0) {
    types.push("General marketing & compliance guidelines");
  }
  return types;
}

export function buildCountryPrompts(
  englishBaseText,
  detectedLanguage = "Unknown",
  scopeType = "global",
  scopeCountry = "United States"
) {
  const baseSource = englishBaseText || "";
  const snippet = baseSource.trim().substring(0, 220).replace(/\s+/g, " ");
  const base =
    snippet ||
    "Compliance file summary unavailable; using default corporate guidelines.";
  const languageLine = `Source language (normalized): ${detectedLanguage}.`;
  const coverageLine =
    scopeType === "global"
      ? "Global default applies unless a country override exists."
      : "Country-specific override applies only to this market.";

  const prompts = {
    "United States": `US_EN: ${languageLine} ${coverageLine} Ensure FTC-compliant offers, CAN-SPAM-ready unsubscribe links, and transparent pricing. Base rules: ${base}`,
    "United Kingdom": `UK_EN: ${languageLine} ${coverageLine} Follow ASA guidance, use British spelling, and clearly label promotional content. Base rules: ${base}`,
    Germany: `DE: ${languageLine} ${coverageLine} Respect GDPR, include explicit consent language, and avoid ambiguous "free" claims. Base rules: ${base}`,
    Mexico: `MX_ES: ${languageLine} ${coverageLine} Use Latin American Spanish, disclose IVA-inclusive pricing, and align with COFEPRIS guidance. Base rules: ${base}`,
    "Canada:English": `CA_EN: ${languageLine} ${coverageLine} Ensure CASL-compliant opt-out language and dual-measurement pricing when required. Base rules: ${base}`,
    "Canada:French": `CA_FR: ${languageLine} ${coverageLine} Provide mirrored French copy that meets Charter of the French Language requirements. Base rules: ${base}`,
    Australia: `AU_EN: ${languageLine} ${coverageLine} Align with ACMA email standards, avoid misleading urgency, and reference AUD pricing. Base rules: ${base}`,
  };

  if (scopeType === "country") {
    const specific =
      prompts[scopeCountry] ||
      `${scopeCountry}: ${languageLine} ${coverageLine} Base rules: ${base}`;
    return { [scopeCountry]: specific };
  }

  return prompts;
}

export function analyzeEmailReadiness(bodyText) {
  const notes = [];
  if (!bodyText) {
    notes.push("No content provided yet.");
    return notes;
  }
  if (!bodyText.toLowerCase().includes("http")) {
    notes.push("No explicit URLs detected. Consider marking CTAs and landing pages.");
  } else {
    notes.push("URLs detected. Ensure localized tracking parameters per market.");
  }
  if (!/unsubscribe|opt[- ]?out/i.test(bodyText)) {
    notes.push("Unsubscribe or opt-out language not clearly found. Many regions require this.");
  } else {
    notes.push("Unsubscribe language appears present.");
  }
  if (bodyText.length < 80) {
    notes.push("Email body is quite short; AI may need more context for tone and intent.");
  }
  return notes;
}

export function computeRiskScore(issues) {
  let score = 0;
  issues.forEach((issue) => {
    if (issue.severity === "high") score += 3;
    else if (issue.severity === "medium") score += 2;
    else score += 1;
  });
  if (score <= 2) return { label: "Low", percent: 25 };
  if (score <= 5) return { label: "Medium", percent: 60 };
  return { label: "High", percent: 90 };
}

export function generateIssuesForCountry(country, bodyText) {
  const issues = [];
  const text = bodyText || "";
  const lower = text.toLowerCase();

  if (text && !/[.!?]/.test(text)) {
    issues.push({
      type: "Language",
      severity: "medium",
      message: "Email body has no clear sentence boundaries; may reduce readability.",
      recommendation: "Add punctuation to break content into readable sentences.",
    });
  }

  if (country === "China" && lower.includes("white")) {
    issues.push({
      type: "Cultural",
      severity: "medium",
      message: "The term 'white' may have negative associations in some Chinese cultural contexts.",
      recommendation: "Consider using alternative color imagery more associated with celebration.",
    });
  }
  if (country === "United Arab Emirates" && lower.includes("alcohol")) {
    issues.push({
      type: "Cultural",
      severity: "high",
      message: "Alcohol references may conflict with local cultural and legal norms in UAE.",
      recommendation: "Remove or replace alcohol-related messaging for this market.",
    });
  }
  if (country === "Germany" && lower.includes("free")) {
    issues.push({
      type: "Compliance",
      severity: "medium",
      message: "The word 'free' has strict legal interpretation in some EU markets like Germany.",
      recommendation: "Qualify 'free' with clear terms & conditions or avoid the claim.",
    });
  }

  const hasUrl = /https?:\/\//i.test(text);
  const hasTracking = /utm_/i.test(text);
  if (!hasUrl) {
    issues.push({
      type: "Technical",
      severity: "low",
      message: "No URLs detected for CTAs.",
      recommendation: "Confirm that a localized landing page URL is present.",
    });
  }
  if (hasUrl && !hasTracking) {
    issues.push({
      type: "Technical",
      severity: "low",
      message: "URLs found but no explicit tracking parameters.",
      recommendation: "Add market-specific tracking parameters (e.g., utm_campaign, utm_source).",
    });
  }

  if (!/unsubscribe|opt[- ]?out/i.test(text)) {
    issues.push({
      type: "Compliance",
      severity: "high",
      message: "No clear unsubscribe or opt-out instruction detected.",
      recommendation:
        "Add a localized unsubscribe line that meets local email marketing regulations.",
    });
  }

  return issues;
}

export function generateLocalizedEmail(country, subject, body) {
  const compliantPrefix = `[${country}] `;
  const localizedSubject = compliantPrefix + subject;

  const countryNoteMap = {
    China: "Localized with simplified Chinese tone and WeChat-friendly CTA structure.",
    "United States": "Localized with CAN-SPAM aligned footer and direct, friendly tone.",
    "United Kingdom": "Localized with British spelling and ASA-aligned clarity on offers.",
    Germany: "Localized with GDPR-compliant language and formal German tone.",
    France: "Localized to French with clear legal disclaimers.",
    Japan: "Localized to Japanese with polite, non-aggressive urgency.",
    Brazil: "Localized to Brazilian Portuguese with clarity on installment pricing.",
    India: "Localized to Indian English, respecting festivals and sensitivities.",
    "United Arab Emirates":
      "Localized to Arabic/English mix with culturally appropriate imagery and tone.",
    Mexico: "Localized to Latin American Spanish with clear VAT-inclusive pricing.",
  };

  const note = countryNoteMap[country] || "Localized with country-specific tone and rules.";

  const localizedBody =
    `${body}\n\n---\n[AI localization note for ${country}]\n${note}`;

  return { localizedSubject, localizedBody };
}

export function uuid() {
  return "job-" + Math.random().toString(36).substring(2, 10);
}
