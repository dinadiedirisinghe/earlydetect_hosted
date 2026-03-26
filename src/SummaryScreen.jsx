import { calcAge, calcBMI, bmiCategory, initials, StepDots } from "./utils.jsx";

/**
 * SummaryScreen
 * ─────────────
 * The final screen after all data has been collected. It shows:
 *   – A success confirmation
 *   – A profile card (avatar + name + email)
 *   – A clean table of everything the user entered
 *   – Any active health alerts (obesity, overweight, etc.)
 *   – A "Start Over" button for demo purposes
 *
 * In a production app this screen would:
 *   – POST all collected data to your backend / database
 *   – Trigger the AI inference pipeline
 *   – Navigate to a "Your Risk Report" screen
 *
 * Props:
 *   allData    – { user, regData, profile, habits, medical }
 *   onRestart  – fn to reset the whole wizard
 *   totalSteps – for StepDots
 */
export default function SummaryScreen({
  allData,
  onGoTo,
  totalSteps,
  hasAnalysis,
}) {
  const { user, profile, habits, medical } = allData;

  // Re-compute the derived metrics so we can display them cleanly
  const age = calcAge(user.birthday);
  const bmi = calcBMI(profile.height, profile.weight);
  const bmiInfo = bmiCategory(bmi);

  // Build a flat summary table. Each row is [label, value].
  const summaryRows = [
    ["Full Name", `${user.firstName} ${user.lastName}`],
    ["Email", user.email],
    ["Date of Birth", user.birthday],
    ["Age", age ? `${age} years` : "—"],
    ["Biological Sex", profile.sex || "—"],
    ["Height", profile.height ? `${profile.height} cm` : "—"],
    ["Weight", profile.weight ? `${profile.weight} kg` : "—"],
    ["BMI", bmi ? `${bmi} (${bmiInfo?.label})` : "—"],
    ["Blood Type", profile.bloodType || "Not specified"],
    ["Exercise", habits.exerciseFreq || "—"],
    ["Exercise Types", habits.exerciseTypes?.join(", ") || "—"],
    ["Smoking", habits.smoking || "—"],
    ...(habits.smoking === "Current smoker"
      ? [
          ["Cigarettes/day", habits.cigPerDay || "—"],
          ["Years smoking", habits.yearsSmoke || "—"],
        ]
      : []),
    ["Alcohol", habits.drinking || "—"],
    ["Recreational drugs", habits.drugs || "—"],
    ...(habits.drugs === "Yes"
      ? [["Drug frequency", habits.drugsFreq || "—"]]
      : []),
    ["Diet", habits.diet || "—"],
    ["Sleep", `${habits.sleep}h / night`],
    ["Stress Level", habits.stress || "—"],
    ["Occupation", habits.occupation || "—"],
    ["Location", habits.location || "—"],
    [
      "Medications",
      medical.meds.length ? `${medical.meds.length} listed` : "None",
    ],
    ["Family: Diabetes", medical.family.diabetes ? "Yes ✓" : "No"],
    ["Family: Heart", medical.family.heart ? "Yes ✓" : "No"],
    ["Family: Cancer", medical.family.cancer ? "Yes ✓" : "No"],
    ["Family: Hypertension", medical.family.hypertension ? "Yes ✓" : "No"],
    ...(medical.family.other
      ? [["Other hereditary", medical.family.other]]
      : []),
  ];

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={5} />

      {/* ── Completion confirmation ─────────────────────────────────────── */}
      <div className="alert alert-success">
        <span className="alert-icon">✅</span>
        <div>
          <strong>Profile Complete!</strong>
          Your EarlyDetect profile is set up. The app will now monitor your data
          and flag potential health risks early.
        </div>
      </div>

      {/* ── Profile avatar ──────────────────────────────────────────────── */}
      <div className="profile-avatar">
        {initials(user.firstName, user.lastName)}
      </div>
      <div className="profile-name">
        {user.firstName} {user.lastName}
      </div>
      <div className="profile-email">{user.email}</div>

      {/* ── Any active health alerts ────────────────────────────────────── */}
      {bmiInfo && parseFloat(bmi) >= 30 && (
        <div className="alert alert-danger">
          <span className="alert-icon">🚨</span>
          <div>
            <strong>High BMI Alert — Obesity Risk</strong>
            BMI {bmi}. This significantly raises risk for cardiovascular
            disease, Type 2 diabetes, and sleep apnoea. A healthcare provider
            can recommend a safe management plan.
          </div>
        </div>
      )}

      {habits.smoking === "Current smoker" && (
        <div className="alert alert-warn">
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>Smoking Risk Detected</strong>
            Current smoking is a major modifiable risk factor for lung cancer,
            COPD, and heart disease. Cessation support is available.
          </div>
        </div>
      )}

      {(medical.family.diabetes ||
        medical.family.heart ||
        medical.family.cancer ||
        medical.family.hypertension) && (
        <div className="alert alert-info">
          <span className="alert-icon">🧬</span>
          <div>
            <strong>Hereditary Risk Factors Noted</strong>
            Family history of one or more chronic conditions has been recorded.
            Regular screening is recommended.
          </div>
        </div>
      )}

      {/* ── Full data summary table ─────────────────────────────────────── */}
      <div
        style={{
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {summaryRows.map(([label, value]) => (
          <div
            key={label}
            className="summary-row"
            style={{ padding: "10px 14px" }}
          >
            <span className="summary-label">{label}</span>
            <span className="summary-value">{value}</span>
          </div>
        ))}
      </div>

      {/* In a real app this would go to the AI analysis / dashboard */}
      <button
        className="btn-primary"
        style={{ background: "var(--teal)", marginBottom: 8 }}
        onClick={() => onGoTo("analysis")}
      >
        View My Risk Report →
      </button>

      <button
        className="btn-secondary"
        onClick={() => {
          onGoTo("profile");
        }}
      >
        ← Back to Sections
      </button>
    </div>
  );
}
