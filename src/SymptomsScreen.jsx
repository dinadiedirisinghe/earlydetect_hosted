import { useState } from "react";
import { StepDots, SectionDivider } from "./utils.jsx";

const SYMPTOM_CATEGORIES = [
  {
    system: "General", icon: "🌡️",
    symptoms: ["Fatigue","Fever","Night sweats","Unexplained weight loss",
      "Unexplained weight gain","Loss of appetite","Chills","Malaise"],
  },
  {
    system: "Cardiovascular", icon: "❤️",
    symptoms: ["Chest pain","Chest tightness","Palpitations","Shortness of breath",
      "Swollen ankles","Swollen legs","Dizziness","Fainting"],
  },
  {
    system: "Respiratory", icon: "🫁",
    symptoms: ["Persistent cough","Coughing blood","Wheezing","Breathlessness at rest",
      "Breathlessness on exertion","Frequent respiratory infections"],
  },
  {
    system: "Digestive", icon: "🫃",
    symptoms: ["Abdominal pain","Bloating","Nausea","Vomiting","Diarrhoea",
      "Constipation","Blood in stool","Heartburn","Difficulty swallowing","Jaundice"],
  },
  {
    system: "Neurological", icon: "🧠",
    symptoms: ["Headache","Persistent headache","Dizziness","Memory loss","Confusion",
      "Tremors","Numbness","Tingling","Weakness in limbs","Vision changes",
      "Seizures","Difficulty speaking"],
  },
  {
    system: "Musculoskeletal", icon: "🦴",
    symptoms: ["Joint pain","Joint swelling","Muscle pain","Muscle weakness",
      "Back pain","Neck pain","Stiffness in the morning"],
  },
  {
    system: "Skin", icon: "🩹",
    symptoms: ["Rash","Itching","Unusual moles","Skin colour changes",
      "Excessive bruising","Slow-healing wounds","Hair loss","Nail changes"],
  },
  {
    system: "Urinary", icon: "💧",
    symptoms: ["Frequent urination","Painful urination","Blood in urine",
      "Difficulty urinating","Increased thirst","Dark urine"],
  },
  {
    system: "Endocrine / Metabolic", icon: "⚗️",
    symptoms: ["Excessive thirst","Excessive hunger","Frequent urination",
      "Heat intolerance","Cold intolerance","Excessive sweating",
      "Slow healing","Changes in menstrual cycle"],
  },
  {
    system: "Mental Health", icon: "🧘",
    symptoms: ["Persistent sadness","Anxiety","Panic attacks","Mood swings",
      "Irritability","Sleep problems","Loss of interest","Difficulty concentrating"],
  },
];

const ALL_SYMPTOMS = [...new Set(SYMPTOM_CATEGORIES.flatMap(c => c.symptoms))];

export default function SymptomsScreen({ onGoTo, onSave, initialData, totalSteps }) {
  // Two phases only now: "select" and "detail"
  const [phase, setPhase]               = useState("select");
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedSymptoms, setSelected] = useState(initialData?.selected ?? []);
  const [expandedSystem, setExpanded]   = useState(null);
  const [details, setDetails]           = useState(
    initialData?.details ?? { duration: "", severity: "", notes: "" }
  );

  const toggleSymptom = (symptom) => {
    setSelected(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const searchResults = searchQuery.trim().length > 1
    ? ALL_SYMPTOMS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  // ════════════════════════════════════════════════════════════════════════
  // PHASE: SELECT
  // ════════════════════════════════════════════════════════════════════════
  if (phase === "select") {
    return (
      <div className="screen">
        <StepDots total={totalSteps} current={4} />

        <div className="screen-title">Symptom Checker</div>
        <p className="screen-subtitle">
          Select all symptoms you are currently experiencing. Tap Next to add
          more details.
        </p>

        {/* Search bar */}
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Search symptoms</label>
          <input
            type="text"
            placeholder="e.g. fatigue, chest pain…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Search results */}
        {searchResults.length > 0 && (
          <div className="pill-group" style={{ marginBottom: 20 }}>
            {searchResults.map(s => (
              <div
                key={s}
                className={`pill ${selectedSymptoms.includes(s) ? "selected" : ""}`}
                onClick={() => toggleSymptom(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}

        {/* Body system accordion */}
        {!searchQuery && SYMPTOM_CATEGORIES.map(cat => (
          <div key={cat.system} style={{ marginBottom: 8 }}>
            <button
              onClick={() => setExpanded(
                expandedSystem === cat.system ? null : cat.system
              )}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between",
                alignItems: "center", padding: "12px 14px",
                border: "2px solid",
                borderColor: cat.symptoms.some(s => selectedSymptoms.includes(s))
                  ? "var(--teal)" : "var(--border)",
                background: cat.symptoms.some(s => selectedSymptoms.includes(s))
                  ? "var(--teal-faint)" : "var(--off-white)",
                borderRadius: "var(--radius)", cursor: "pointer",
                fontFamily: "var(--font-body)", transition: "var(--transition)",
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--navy)", fontSize: 14 }}>
                {cat.icon} {cat.system}
                {cat.symptoms.filter(s => selectedSymptoms.includes(s)).length > 0 && (
                  <span style={{
                    marginLeft: 8, background: "var(--teal)", color: "white",
                    borderRadius: 10, fontSize: 11, padding: "2px 7px", fontWeight: 700,
                  }}>
                    {cat.symptoms.filter(s => selectedSymptoms.includes(s)).length}
                  </span>
                )}
              </span>
              <span style={{ color: "var(--slate)", fontSize: 16 }}>
                {expandedSystem === cat.system ? "▲" : "▼"}
              </span>
            </button>

            {expandedSystem === cat.system && (
              <div className="pill-group" style={{
                padding: "12px 14px",
                border: "2px solid var(--border)", borderTop: "none",
                borderRadius: "0 0 var(--radius) var(--radius)",
                background: "white",
              }}>
                {cat.symptoms.map(s => (
                  <div
                    key={s}
                    className={`pill ${selectedSymptoms.includes(s) ? "selected" : ""}`}
                    onClick={() => toggleSymptom(s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Sticky bottom bar showing count + Next button */}
        {selectedSymptoms.length > 0 && (
          <div style={{
            position: "sticky", bottom: 0,
            background: "var(--navy)", color: "white",
            borderRadius: "var(--radius)", padding: "14px 16px",
            marginTop: 16, display: "flex",
            justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13 }}>
              <strong>{selectedSymptoms.length}</strong> symptom
              {selectedSymptoms.length !== 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setPhase("detail")}
              style={{
                background: "var(--teal)", color: "white", border: "none",
                borderRadius: 10, padding: "8px 16px", fontWeight: 700,
                fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Next →
            </button>
          </div>
        )}

        <button
          className="btn-secondary"
          style={{ marginTop: 16 }}
          onClick={() => {
            onSave?.({ selected: selectedSymptoms, details });
            onGoTo("profile");
          }}
        >
          ← Back to Sections
        </button>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // PHASE: DETAIL
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="screen">
      <StepDots total={totalSteps} current={4} />

      <div className="screen-title">A bit more detail</div>
      <p className="screen-subtitle">
        These extra details give a clearer picture of what you're experiencing.
      </p>

      {/* Summary of selected symptoms */}
      <div style={{
        background: "var(--teal-faint)", border: "1px solid #b2dfdf",
        borderRadius: "var(--radius)", padding: "12px 14px", marginBottom: 20,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: "var(--teal)",
          marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.6px",
        }}>
          Selected Symptoms
        </div>
        <div className="pill-group">
          {selectedSymptoms.map(s => (
            <div key={s} className="pill selected" style={{ cursor: "default" }}>{s}</div>
          ))}
        </div>
      </div>

      <div className="field">
        <label>How long have you had these symptoms?</label>
        <div className="select-wrap">
          <select
            value={details.duration}
            onChange={e => setDetails(p => ({ ...p, duration: e.target.value }))}
          >
            <option value="">Select duration</option>
            <option>Less than a week</option>
            <option>1–2 weeks</option>
            <option>2–4 weeks</option>
            <option>1–3 months</option>
            <option>3–6 months</option>
            <option>More than 6 months</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label>Overall severity</label>
        <div className="seg-control">
          {["Mild", "Moderate", "Severe"].map(s => (
            <button
              key={s}
              className={`seg-btn ${details.severity === s ? "active" : ""}`}
              onClick={() => setDetails(p => ({ ...p, severity: s }))}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label>Anything else to add? (optional)</label>
        <input
          type="text"
          placeholder="e.g. worse in the morning, or after eating…"
          value={details.notes}
          onChange={e => setDetails(p => ({ ...p, notes: e.target.value }))}
        />
      </div>

      {/* Save and go back to sections */}
      <button
        className="btn-primary"
        disabled={!details.duration || !details.severity}
        onClick={() => {
          onSave?.({ selected: selectedSymptoms, details });
          onGoTo("profile");
        }}
      >
        Save & Continue →
      </button>

      <button
        className="btn-secondary"
        onClick={() => setPhase("select")}
      >
        ← Edit Symptoms
      </button>
    </div>
  );
}