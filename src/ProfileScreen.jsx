import { useState } from "react";
import {
  calcAge,
  calcBMI,
  bmiCategory,
  initials,
  SegControl,
  SectionDivider,
  StepDots,
} from "./utils.jsx";

export default function ProfileScreen({
  user,
  initialData,
  onSave,
  onGoTo,
  phase,
  onPhaseChange,
  totalSteps,
  hasAnalysis,
}) {
  // "form" = show required fields, "menu" = show optional cards
  // const [phase, setPhase] = useState("form");

  const [form, setForm] = useState(
    initialData?? {
      sex: "",
      height: "",
      weight: "",
      bloodType: "",
    },
  );

  const setField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const age = calcAge(user.birthday);
  const bmi = calcBMI(form.height, form.weight);
  const bmiInfo = bmiCategory(bmi);
  const isValid = form.sex && form.height && form.weight;

  const saveToApp = (profile) => {
    onSave?.({ profile });
  };

  // Each card has a step key that matches STEP_ORDER in App.jsx.
  // comingSoon cards are greyed out and non-clickable — useful placeholders
  // for screens you plan to build later (symptoms, image upload, etc.).
  const optionalSections = [
    {
      step: "habits",
      icon: "🏃",
      title: "Health Habits",
      desc: "Exercise, smoking, diet, sleep & stress",
      color: "#e6f4f4",
      border: "#b2dfdf",
    },
    {
      step: "medical",
      icon: "💊",
      title: "Medications",
      desc: "Current medicines & family history",
      color: "#f0f7ff",
      border: "#bdd7f5",
    },
    {
      step: "symptoms",
      icon: "🩺",
      title: "Symptoms",
      desc: "Any symptoms you're currently experiencing",
      color: "#fff8f0",
      border: "#f5d7a0",
    },
    {
      step: "images",
      icon: "🔬",
      title: "Medical Images",
      desc: "Upload lab reports or scan results",
      color: "#fdf0f5",
      border: "#f5b8d0",
    },
  ];

  // ── Phase 1: the required body-detail form ───────────────────────────────
  if (phase === "form") {
    console.log("response: "+JSON.stringify(form));
    return (
      <div className="screen">
        <StepDots total={totalSteps} current={2} />

        <div className="profile-avatar">
          {initials(user.firstName, user.lastName)}
        </div>
        <div className="profile-name">
          {user.firstName} {user.lastName}
        </div>
        <div className="profile-email">{user.email}</div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Age</div>
            <div className="stat-value">
              {age ?? "—"} <span className="stat-unit">yrs</span>
            </div>
          </div>
          <div className={`stat-card ${bmiInfo ? bmiInfo.cls : ""}`}>
            <div className="stat-label">BMI {bmiInfo ? bmiInfo.icon : ""}</div>
            <div className="stat-value">{bmi ?? "—"}</div>
          </div>
        </div>

        {bmiInfo && parseFloat(bmi) >= 30 && (
          <div className="alert alert-danger">
            <span className="alert-icon">🚨</span>
            <div>
              <strong>High BMI — Obesity Risk Detected</strong> Your BMI of{" "}
              {bmi} falls in the obese range. Please consult a healthcare
              provider.
            </div>
          </div>
        )}

        {bmiInfo && parseFloat(bmi) >= 25 && parseFloat(bmi) < 30 && (
          <div className="alert alert-warn">
            <span className="alert-icon">⚠️</span>
            <div>
              <strong>Overweight</strong> BMI {bmi} — small lifestyle changes
              can make a meaningful difference.
            </div>
          </div>
        )}

        <SectionDivider label="Body Details" />

        <div className="field">
          <label>Biological Sex</label>
          <SegControl
            options={["Male", "Female", "Other"]}
            value={form.sex}
            onChange={(v) => setField("sex", v)}
          />
        </div>

        <div className="inline-grid">
          <div className="field">
            <label>Height (cm)</label>
            <input
              type="number"
              placeholder="170"
              min="50"
              max="250"
              value={form.height}
              onChange={(e) => setField("height", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Weight (kg)</label>
            <input
              type="number"
              placeholder="65"
              min="20"
              max="300"
              value={form.weight}
              onChange={(e) => setField("weight", e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label>Blood Type</label>
          <div className="select-wrap">
            <select
              value={form.bloodType}
              onChange={(e) => setField("bloodType", e.target.value)}
            >
              <option value="">Select blood type</option>
              {["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"].map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* onNext saves the data up to App, then we flip the local phase to "menu" */}
        <button
          className="btn-primary"
          onClick={() => {
            onSave(form);
            onPhaseChange("menu"); // ← was setPhase("menu")
          }}
          disabled={!isValid}
        >
          Save Profile →
        </button>
      </div>
    );
  }

  // ── Phase 2: the optional cards menu ────────────────────────────────────
  return (
    <div className="screen">
      <StepDots total={totalSteps} current={2} />

      {/* Compact identity strip so the user always knows whose profile this is */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--teal), var(--navy))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontFamily: "var(--font-display)",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {initials(user.firstName, user.lastName)}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--navy)" }}>
            {user.firstName} {user.lastName}
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            Profile saved ✓ &nbsp;·&nbsp; BMI {bmi ?? "—"} {bmiInfo?.icon}
          </div>
        </div>
      </div>

      <div className="screen-title" style={{ fontSize: 22 }}>
        Add more detail
      </div>
      <p className="screen-subtitle">
        These sections are <strong>completely optional</strong> — each one helps
        the AI build a more accurate risk picture. Tap any card to fill it in,
        or skip straight to your summary.
      </p>

      {/* 2-column grid of optional section cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {console.log("rendering options")}
        {optionalSections.map((section) => (
          <button
            key={section.step}
            onClick={() => {
              onPhaseChange("menu");
              !section.comingSoon && onGoTo(section.step);
            }}
            style={{
              background: section.color,
              border: `2px solid ${section.border}`,
              borderRadius: "var(--radius)",
              padding: "16px 14px",
              textAlign: "left",
              cursor: section.comingSoon ? "default" : "pointer",
              opacity: section.comingSoon ? 0.55 : 1,
              transition: "var(--transition)",
              fontFamily: "var(--font-body)",
            }}
            onMouseEnter={(e) => {
              if (!section.comingSoon)
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {console.log(section.title)}
            <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>
              {section.icon}
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 14,
                color: "var(--navy)",
                marginBottom: 4,
              }}
            >
              {section.title}
              {section.comingSoon && (
                <span
                  style={{
                    fontSize: 10,
                    marginLeft: 6,
                    background: "var(--muted)",
                    color: "white",
                    borderRadius: 10,
                    padding: "2px 6px",
                    fontWeight: 600,
                    verticalAlign: "middle",
                  }}
                >
                  Soon
                </span>
              )}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--slate)", lineHeight: 1.4 }}
            >
              {section.desc}
            </div>
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ background: "var(--teal)", marginBottom: 8 }}
        onClick={() => onGoTo("analysis")}
      >
        {hasAnalysis ? "📊 View My Risk Report" : "🔬 Analyse My Health Data"}
      </button>

      <button className="btn-primary" onClick={() => onGoTo("summary")}>
        Continue to My Summary →
      </button>
      <button
        className="btn-secondary"
        onClick={() => onPhaseChange("form")} // ← was setPhase("form")
      >
        ← Edit Body Details
      </button>
    </div>
  );
}
