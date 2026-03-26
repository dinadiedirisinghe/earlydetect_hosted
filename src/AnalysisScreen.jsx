import { useState } from "react";
import { StepDots, SectionDivider } from "./utils.jsx";

/**
 * AnalysisScreen
 * ──────────────
 * Gathers ALL data collected across the entire app and sends it to the
 * Gemini API as a single comprehensive prompt. The AI reasons across
 * everything together — profile, habits, symptoms, medications, family
 * history, and extracted report values — and returns a structured
 * multi-section health analysis.
 *
 * Phases:
 *   "ready"     → summary of what data will be included + Analyse button
 *   "analysing" → loading state while API call is in flight
 *   "results"   → full structured analysis displayed as cards
 */
export default function AnalysisScreen({
  onGoTo,
  allData,
  patientContext,
  totalSteps,
  savedResult,
  onSaveResult,
}) {
  const [phase, setPhase] = useState(savedResult ? "results" : "ready");
  const [result, setResult] = useState(savedResult ?? null);
  const [error, setError] = useState("");

  // ── Count how much data is available ─────────────────────────────────────
  // This is shown on the "ready" screen so the user can see what will be
  // included in the analysis before they run it.
  const dataInventory = {
    hasProfile: !!(allData.profile?.sex && allData.profile?.height),
    hasHabits: !!(allData.habits?.exerciseFreq || allData.habits?.smoking),
    hasSymptoms: (allData.symptoms?.selected?.length ?? 0) > 0,
    hasMeds: (allData.medical?.meds?.length ?? 0) > 0,
    hasFamilyHistory: !!(
      allData.medical?.family?.diabetes ||
      allData.medical?.family?.heart ||
      allData.medical?.family?.cancer ||
      allData.medical?.family?.hypertension
    ),
    hasReports:
      (allData.reports?.cards?.filter(
        (c) => c.extraction && !c.extraction.error,
      ).length ?? 0) > 0,
    reportCount:
      allData.reports?.cards?.filter((c) => c.extraction && !c.extraction.error)
        .length ?? 0,
    symptomCount: allData.symptoms?.selected?.length ?? 0,
    medCount: allData.medical?.meds?.length ?? 0,
  };

  // ── Build the comprehensive prompt ───────────────────────────────────────
  // We serialise every piece of collected data into a structured text block.
  // The AI receives it all in one message and reasons across all of it.
  const buildPrompt = () => {
    // ── Section 1: Basic profile ──
    const profileSection = `
PATIENT PROFILE:
- Name: ${allData.user?.firstName} ${allData.user?.lastName}
- Age: ${patientContext?.age ?? "unknown"}
- Sex: ${allData.profile?.sex ?? "unknown"}
- BMI: ${patientContext?.bmi ?? "unknown"} (Height: ${allData.profile?.height}cm, Weight: ${allData.profile?.weight}kg)
- Blood Type: ${allData.profile?.bloodType ?? "unknown"}
`;

    // ── Section 2: Health habits ──
    const habitsSection = allData.habits
      ? `
HEALTH HABITS:
- Exercise frequency: ${allData.habits.exerciseFreq || "not provided"}
- Exercise types: ${allData.habits.exerciseTypes?.join(", ") || "not provided"}
- Smoking: ${allData.habits.smoking || "not provided"}${
          allData.habits.smoking === "Current smoker"
            ? ` (${allData.habits.cigPerDay} cigarettes/day for ${allData.habits.yearsSmoke} years)`
            : ""
        }
- Alcohol: ${allData.habits.drinking || "not provided"}
- Recreational drugs: ${allData.habits.drugs || "not provided"}${
          allData.habits.drugs === "Yes"
            ? ` — frequency: ${allData.habits.drugsFreq}`
            : ""
        }
- Diet: ${allData.habits.diet || "not provided"}
- Sleep: ${allData.habits.sleep}h per night
- Stress level: ${allData.habits.stress || "not provided"}
- Occupation: ${allData.habits.occupation || "not provided"}
- Location: ${allData.habits.location || "not provided"}
`
      : "HEALTH HABITS: not provided\n";

    // ── Section 3: Symptoms ──
    const symptomsSection = dataInventory.hasSymptoms
      ? `
REPORTED SYMPTOMS:
- Symptoms: ${allData.symptoms.selected.join(", ")}
- Duration: ${allData.symptoms.details?.duration || "not specified"}
- Severity: ${allData.symptoms.details?.severity || "not specified"}
- Notes: ${allData.symptoms.details?.notes || "none"}
`
      : "REPORTED SYMPTOMS: none reported\n";

    // ── Section 4: Medications ──
    const medsSection = dataInventory.hasMeds
      ? `
CURRENT MEDICATIONS:
${allData.medical.meds
  .map(
    (m, i) =>
      `  ${i + 1}. ${m.name} — ${m.dosage}, ${m.frequency}, ${m.duration}`,
  )
  .join("\n")}
`
      : "CURRENT MEDICATIONS: none\n";

    // ── Section 5: Family history ──
    const family = allData.medical?.family;
    const famSection = `
FAMILY MEDICAL HISTORY:
- Diabetes: ${family?.diabetes ? "Yes" : "No"}
- Heart disease: ${family?.heart ? "Yes" : "No"}
- Cancer: ${family?.cancer ? "Yes" : "No"}
- Hypertension: ${family?.hypertension ? "Yes" : "No"}
- Other: ${family?.other || "none"}
`;

    // ── Section 6: Lab report extracted values ──
    const validReports =
      allData.reports?.cards?.filter(
        (c) => c.extraction && !c.extraction.error,
      ) ?? [];

    const reportsSection =
      validReports.length > 0
        ? `
LAB REPORT RESULTS:
${validReports
  .map(
    (r, i) => `
  Report ${i + 1} — ${r.extraction.reportType?.toUpperCase()} (${r.fileName}):
  ${
    r.extraction.extractedValues
      ?.map(
        (v) =>
          `    ${v.testName}: ${v.value} ${v.unit} [${v.status}]${
            v.referenceRange ? ` (ref: ${v.referenceRange})` : ""
          }`,
      )
      .join("\n") || "  No values extracted"
  }
`,
  )
  .join("")}
`
        : "LAB REPORT RESULTS: none uploaded\n";

    // ── Final assembled prompt ──
    return `
You are a comprehensive medical risk assessment assistant for early disease
detection in young adults aged 18-30.

You have been given complete health data for a patient. Analyse ALL of it
together holistically — look for patterns, correlations, and compounding
risk factors across all data sections.

${profileSection}
${habitsSection}
${symptomsSection}
${medsSection}
${famSection}
${reportsSection}

Based on ALL of the above, provide a comprehensive health analysis.
Return ONLY a raw JSON object — no markdown, no code fences, start with { end with }:

{
  "overallRiskLevel": "low" or "moderate" or "high" or "very high",
  "overallSummary": "3-4 sentence plain English summary of the patient's overall health picture",
  "urgencyFlag": "routine" or "follow-up-soon" or "see-doctor-urgently",

  "keyFindings": [
    {
      "finding": "A specific notable finding from the data",
      "source": "which data section this came from e.g. Lab Reports, Habits, Symptoms",
      "significance": "why this matters clinically"
    }
  ],

  "diseaseRisks": [
    {
      "condition": "condition name",
      "riskLevel": "low" or "moderate" or "high" or "very high",
      "stage": "none" or "early" or "established" or "advanced",
      "contributingFactors": ["list of specific data points that contribute to this risk"],
      "explanation": "plain English explanation referencing the actual patient data",
      "recommendation": "specific actionable next step"
    }
  ],

  "lifestyleRecommendations": [
    {
      "area": "e.g. Diet, Exercise, Sleep, Smoking",
      "current": "what the patient currently does",
      "recommendation": "specific improvement suggestion",
      "impact": "what disease risk this would reduce"
    }
  ],

  "screeningRecommendations": [
    {
      "test": "name of recommended screening test",
      "reason": "why this test is recommended based on their data",
      "urgency": "routine" or "within 3 months" or "within 1 month" or "urgent"
    }
  ],

  "positiveFindings": [
    "Things the patient is doing well or results that are reassuringly normal"
  ]
}

Strict limits: max 4 diseaseRisks, max 3 lifestyleRecommendations,
max 3 screeningRecommendations, max 3 keyFindings, max 3 positiveFindings.
`;
  };

  // ── Run the analysis ──────────────────────────────────────────────────────
  const runAnalysis = async () => {
    setPhase("analysing");
    setError("");

    try {
      const response = await fetch(
        "/api/analyse-combined",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: buildPrompt() }),
        },
      );

      const data = await response.json();
      const rawText = data.content.map((b) => b.text || "").join("");
      const stripped = rawText.replace(/```json|```/g, "").trim();
      const jsonStart = stripped.indexOf("{");
      const jsonEnd = stripped.lastIndexOf("}");

      if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found");

      const parsed = JSON.parse(stripped.slice(jsonStart, jsonEnd + 1));
      setResult(parsed);
      onSaveResult?.(parsed);
      setPhase("results");
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed. Please check your connection and try again.");
      setPhase("ready");
    }
  };

  // ── Colour helpers ────────────────────────────────────────────────────────
  const riskColour = {
    low: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    moderate: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    high: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
    "very high": { bg: "#fdf2f8", text: "#9d174d", border: "#f0abdb" },
  };

  const urgencyStyle = {
    routine: { bg: "#f0fdf4", text: "#16a34a", icon: "✅" },
    "follow-up-soon": { bg: "#fffbeb", text: "#d97706", icon: "⚠️" },
    "see-doctor-urgently": { bg: "#fef2f2", text: "#dc2626", icon: "🚨" },
  };

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: READY
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "ready") {
    const checks = [
      {
        label: "Profile & Body Stats",
        done: dataInventory.hasProfile,
        icon: "👤",
      },
      { label: "Health Habits", done: dataInventory.hasHabits, icon: "🏃" },
      {
        label: `Symptoms (${dataInventory.symptomCount})`,
        done: dataInventory.hasSymptoms,
        icon: "🩺",
      },
      {
        label: `Medications (${dataInventory.medCount})`,
        done: dataInventory.hasMeds,
        icon: "💊",
      },
      {
        label: "Family History",
        done: dataInventory.hasFamilyHistory,
        icon: "🧬",
      },
      {
        label: `Lab Reports (${dataInventory.reportCount})`,
        done: dataInventory.hasReports,
        icon: "🔬",
      },
    ];

    const completedCount = checks.filter((c) => c.done).length;
    const canAnalyse = completedCount >= 2;

    return (
      <div className="screen">
        <StepDots total={totalSteps} current={5} />

        <div className="screen-title">
          Comprehensive
          <br />
          Health Analysis
        </div>
        <p className="screen-subtitle">
          The AI will analyse all your collected data together to identify
          disease risks, lifestyle patterns, and personalised recommendations.
        </p>

        {/* Data inventory — shows what will be included */}
        <SectionDivider label="📋 Data Included" />

        <div style={{ marginBottom: 20 }}>
          {checks.map(({ label, done, icon }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>
                {icon}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: done ? "var(--navy)" : "var(--muted)",
                  fontWeight: done ? 500 : 400,
                }}
              >
                {label}
              </span>
              <span style={{ fontSize: 16 }}>{done ? "✅" : "➖"}</span>
            </div>
          ))}
        </div>

        {/* Warning if very little data is available */}
        {!canAnalyse && (
          <div className="alert alert-warn" style={{ marginBottom: 16 }}>
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Not enough data for a good analysis.</strong> Please fill
              in at least <strong>2 sections</strong> before running the
              analysis. Go back and complete Health Habits, Symptoms,
              Medications, or upload a Lab Report.
            </div>
          </div>
        )}

        {canAnalyse && completedCount < 4 && (
          <div className="alert alert-info" style={{ marginBottom: 16 }}>
            <span className="alert-icon">💡</span>
            <div>
              <strong>{completedCount} of 6 sections filled.</strong> You can
              run the analysis now, but more data means more accurate results.
            </div>
          </div>
        )}

        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            lineHeight: 1.6,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            marginBottom: 20,
          }}
        >
          ⚕️ <strong>Disclaimer:</strong> This analysis provides risk indicators
          only — not medical diagnoses. Always consult a qualified healthcare
          provider before making health decisions.
        </div>

        <button
          className="btn-primary"
          onClick={runAnalysis}
          disabled={!canAnalyse}
        >
          🔬 Run Full Analysis →
        </button>

        <button className="btn-secondary" onClick={() => onGoTo("profile")}>
          ← Back to Sections
        </button>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: ANALYSING
  // ══════════════════════════════════════════════════════════════════════════
  if (phase === "analysing") {
    return (
      <div className="screen" style={{ textAlign: "center", paddingTop: 60 }}>
        <div style={{ fontSize: 56, marginBottom: 24 }}>🧬</div>
        <div
          className="screen-title"
          style={{ textAlign: "center", fontSize: 22 }}
        >
          Analysing your health data…
        </div>
        <p className="screen-subtitle" style={{ textAlign: "center" }}>
          The AI is reviewing your profile, habits, symptoms, medications,
          family history, and lab results together. This takes 20–30 seconds.
        </p>
        <style>{`
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
          .pulse { animation: pulse 1.8s ease infinite; }
        `}</style>
        <div
          className="pulse"
          style={{ fontSize: 13, color: "var(--slate)", marginTop: 12 }}
        >
          Processing all data sources…
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE: RESULTS
  // ══════════════════════════════════════════════════════════════════════════
  const urgency = urgencyStyle[result?.urgencyFlag] ?? urgencyStyle["routine"];
  const overallRisk = riskColour[result?.overallRiskLevel] ?? riskColour.low;

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={5} />

      <div className="screen-title">Your Analysis</div>

      {/* Overall risk level badge */}
      <div
        style={{
          background: overallRisk.bg,
          border: `2px solid ${overallRisk.border}`,
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.6px",
              color: overallRisk.text,
              marginBottom: 4,
            }}
          >
            Overall Risk Level
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: overallRisk.text,
              textTransform: "capitalize",
            }}
          >
            {result?.overallRiskLevel}
          </div>
        </div>
        <div style={{ fontSize: 36 }}>
          {result?.overallRiskLevel === "low" && "🟢"}
          {result?.overallRiskLevel === "moderate" && "🟡"}
          {result?.overallRiskLevel === "high" && "🟠"}
          {result?.overallRiskLevel === "very high" && "🔴"}
        </div>
      </div>

      {/* Urgency banner */}
      <div
        style={{
          background: urgency.bg,
          color: urgency.text,
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          marginBottom: 20,
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>{urgency.icon}</span>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {result?.urgencyFlag === "routine" && "No immediate concern"}
            {result?.urgencyFlag === "follow-up-soon" &&
              "Follow up with a doctor soon"}
            {result?.urgencyFlag === "see-doctor-urgently" &&
              "Please see a doctor as soon as possible"}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            {result?.overallSummary}
          </div>
        </div>
      </div>

      {/* Positive findings — shown early to balance the risk cards */}
      {result?.positiveFindings?.length > 0 && (
        <>
          <SectionDivider label="✅ Positive Findings" />
          <div
            style={{
              background: "var(--success-bg)",
              border: "1px solid var(--success-border)",
              borderRadius: "var(--radius)",
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            {result.positiveFindings.map((f, i) => (
              <div
                key={i}
                style={{
                  fontSize: 13,
                  color: "var(--success)",
                  lineHeight: 1.6,
                  paddingBottom: i < result.positiveFindings.length - 1 ? 8 : 0,
                  marginBottom: i < result.positiveFindings.length - 1 ? 8 : 0,
                  borderBottom:
                    i < result.positiveFindings.length - 1
                      ? "1px solid var(--success-border)"
                      : "none",
                }}
              >
                👍 {f}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Key findings */}
      {result?.keyFindings?.length > 0 && (
        <>
          <SectionDivider label="🔍 Key Findings" />
          {result.keyFindings.map((f, i) => (
            <div
              key={i}
              style={{
                background: "var(--sky)",
                border: "1px solid #bdd7f5",
                borderRadius: "var(--radius)",
                padding: "14px 16px",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--navy)",
                  }}
                >
                  {f.finding}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--teal)",
                    fontWeight: 700,
                    background: "var(--teal-faint)",
                    padding: "2px 8px",
                    borderRadius: 10,
                    whiteSpace: "nowrap",
                    marginLeft: 8,
                  }}
                >
                  {f.source}
                </span>
              </div>
              <div
                style={{ fontSize: 13, color: "var(--slate)", lineHeight: 1.5 }}
              >
                {f.significance}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Disease risk cards */}
      {result?.diseaseRisks?.length > 0 && (
        <>
          <SectionDivider label="🧬 Disease Risk Assessment" />
          {result.diseaseRisks.map((risk, i) => {
            const colours = riskColour[risk.riskLevel] ?? riskColour.low;
            return (
              <div
                key={i}
                style={{
                  background: colours.bg,
                  border: `2px solid ${colours.border}`,
                  borderRadius: "var(--radius)",
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15,
                      color: "var(--navy)",
                    }}
                  >
                    {risk.condition}
                  </div>
                  <span
                    style={{
                      background: colours.border,
                      color: colours.text,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {risk.riskLevel} risk
                  </span>
                </div>
                {risk.stage && risk.stage !== "none" && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--slate)",
                      marginBottom: 8,
                    }}
                  >
                    Stage: <strong>{risk.stage}</strong>
                  </div>
                )}
                {risk.contributingFactors?.length > 0 && (
                  <div className="pill-group" style={{ marginBottom: 10 }}>
                    {risk.contributingFactors.map((f, j) => (
                      <span
                        key={j}
                        style={{
                          background: colours.border,
                          color: colours.text,
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--slate)",
                    lineHeight: 1.6,
                    marginBottom: 8,
                  }}
                >
                  {risk.explanation}
                </p>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: colours.text,
                    borderTop: `1px solid ${colours.border}`,
                    paddingTop: 8,
                  }}
                >
                  💡 {risk.recommendation}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* Lifestyle recommendations */}
      {result?.lifestyleRecommendations?.length > 0 && (
        <>
          <SectionDivider label="🌿 Lifestyle Recommendations" />
          {result.lifestyleRecommendations.map((rec, i) => (
            <div
              key={i}
              style={{
                background: "var(--teal-faint)",
                border: "1px solid #b2dfdf",
                borderRadius: "var(--radius)",
                padding: "14px 16px",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--navy)",
                  marginBottom: 6,
                }}
              >
                {rec.area}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--slate)", marginBottom: 6 }}
              >
                Currently: {rec.current}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--teal)",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                💡 {rec.recommendation}
              </div>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>
                Impact: {rec.impact}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Screening recommendations */}
      {result?.screeningRecommendations?.length > 0 && (
        <>
          <SectionDivider label="🏥 Recommended Screenings" />
          {result.screeningRecommendations.map((s, i) => (
            <div
              key={i}
              style={{
                background: "var(--sky)",
                border: "1px solid #bdd7f5",
                borderRadius: "var(--radius)",
                padding: "14px 16px",
                marginBottom: 10,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--navy)",
                    marginBottom: 4,
                  }}
                >
                  {s.test}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--slate)",
                    lineHeight: 1.5,
                    marginBottom: 6,
                  }}
                >
                  {s.reason}
                </div>
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  background:
                    s.urgency === "urgent" || s.urgency === "within 1 month"
                      ? "var(--danger-bg)"
                      : "var(--teal-faint)",
                  color:
                    s.urgency === "urgent" || s.urgency === "within 1 month"
                      ? "var(--danger)"
                      : "var(--teal)",
                  border: `1px solid ${
                    s.urgency === "urgent" || s.urgency === "within 1 month"
                      ? "var(--danger-border)"
                      : "#b2dfdf"
                  }`,
                }}
              >
                {s.urgency}
              </span>
            </div>
          ))}
        </>
      )}

      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          lineHeight: 1.6,
          padding: "10px 12px",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-sm)",
          marginBottom: 20,
          marginTop: 8,
        }}
      >
        ⚕️ Risk indicators only — not a medical diagnosis. Please consult a
        qualified healthcare provider before making any health decisions.
      </div>

      <button
        className="btn-primary"
        onClick={() => {
          setPhase("ready");
          setResult(null);
          onSaveResult?.(null); // ← clear from appData so fresh run starts clean
        }}
      >
        🔄 Re-run Analysis
      </button>
      <button
        className="btn-primary"
        style={{ background: "var(--teal)", marginTop: 8 }}
        onClick={() => onGoTo("doctors")}
      >
        👨‍⚕️ See Recommended Doctors →
      </button>
      <button
        className="btn-primary"
        style={{ background: "var(--teal)", marginTop: 8 }}
        onClick={() => onGoTo("summary")}
      >
        Continue to Summary →
      </button>
      <button className="btn-secondary" onClick={() => onGoTo("profile")}>
        ← Back to Sections
      </button>
    </div>
  );
}
