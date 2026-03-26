import { useState } from "react";
import { SectionDivider, StepDots, ToggleBtn } from "./utils.jsx";

/**
 * MedScreen
 * ─────────
 * Handles two related data areas:
 *
 * 1. CURRENT MEDICATIONS
 *    The user can add multiple medication entries using a pop-in sub-form.
 *    Each entry stores: medicine name, dosage, frequency, and duration.
 *    Added meds appear as cards with a remove button.
 *
 * 2. FAMILY MEDICAL HISTORY
 *    Four toggle switches for the most clinically significant hereditary
 *    risk factors: Diabetes, Heart Disease, Cancer, Hypertension.
 *    Plus a free-text field for any other hereditary conditions.
 *
 * Why collect this?
 *    Family history is one of the strongest non-modifiable risk factors for
 *    NCDs. A person with a diabetic parent has ~3× the lifetime risk of
 *    developing Type 2 diabetes vs the general population. Capturing this
 *    allows the detection model to adjust its risk estimates accordingly.
 *
 * Props:
 *   onNext(data) – called with { meds: [...], family: {...} }
 *   totalSteps   – for StepDots
 */
export default function MedScreen({ totalSteps, initialData, onSave, onGoTo }) {
  // ── List of already-added medications ───────────────────────────────────
  const [meds, setMeds] = useState(initialData?.meds ?? []);

  // ── The "add medication" form (hidden until the + button is clicked) ─────
  const [showForm, setShowForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  // ── Family history toggles ───────────────────────────────────────────────
  const [family, setFamily] = useState(
    initialData?.family ?? {
      diabetes: false,
      heart: false,
      cancer: false,
      hypertension: false,
      other: "",
    },
  );

  const saveToApp = (meds, family) => {
    console.log("respose: " + JSON.stringify(meds), JSON.stringify(family));
    console.log("onSave: " + onSave);
    onSave?.({ meds, family });
  };

  // ── Medication helpers ───────────────────────────────────────────────────

  const setMedField = (key, value) =>
    setNewMed((prev) => ({ ...prev, [key]: value }));

  const addMed = () => {
    if (!newMed.name.trim()) return;
    setMeds((prev) => [...prev, { ...newMed }]);
    // Reset the form and hide it
    setNewMed({ name: "", dosage: "", frequency: "", duration: "" });
    setShowForm(false);
  };

  const removeMed = (index) =>
    setMeds((prev) => prev.filter((_, i) => i !== index));

  // ── Family history helpers ───────────────────────────────────────────────

  const toggleFam = (key) =>
    setFamily((prev) => ({ ...prev, [key]: !prev[key] }));

  // The four main hereditary conditions with their display icons
  const famConditions = [
    { key: "diabetes", icon: "🩸", label: "Diabetes" },
    { key: "heart", icon: "❤️", label: "Heart Disease" },
    { key: "cancer", icon: "🔬", label: "Cancer" },
    { key: "hypertension", icon: "💢", label: "Hypertension" },
  ];

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={4} />

      <div className="screen-title">
        Medications &amp;
        <br />
        Family History
      </div>
      <p className="screen-subtitle">
        Current medications help us flag drug–disease interactions. Family
        history adjusts your genetic risk profile.
      </p>

      {/* ════════════════════════════════════════════════════════════════════
          CURRENT MEDICATIONS
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="💊 Current Medications" />

      {/* List of already-added medication cards */}
      {meds.map((med, i) => (
        <div key={i} className="med-card">
          {/* Remove button in the top-right corner */}
          <button
            className="btn-icon remove-btn"
            onClick={() => removeMed(i)}
            title="Remove this medication"
          >
            ×
          </button>

          <div className="med-card-name">💊 {med.name}</div>
          <div className="med-card-details">
            {med.dosage && <span>📏 {med.dosage}</span>}
            {med.frequency && <span>⏰ {med.frequency}</span>}
            {med.duration && <span>📅 {med.duration}</span>}
          </div>
        </div>
      ))}

      {/* "Add Medication" sub-form — hidden by default */}
      {showForm ? (
        <div className="sub-section">
          <div className="inline-grid">
            <div className="field">
              <label>Medicine Name</label>
              <input
                type="text"
                placeholder="e.g. Metformin"
                value={newMed.name}
                onChange={(e) => setMedField("name", e.target.value)}
                autoFocus
              />
            </div>
            <div className="field">
              <label>Dosage</label>
              <input
                type="text"
                placeholder="e.g. 500 mg"
                value={newMed.dosage}
                onChange={(e) => setMedField("dosage", e.target.value)}
              />
            </div>
          </div>

          <div className="inline-grid">
            <div className="field">
              <label>Frequency</label>
              <div className="select-wrap">
                <select
                  value={newMed.frequency}
                  onChange={(e) => setMedField("frequency", e.target.value)}
                >
                  <option value="">Select…</option>
                  <option>Once daily</option>
                  <option>Twice daily</option>
                  <option>3× daily</option>
                  <option>Every other day</option>
                  <option>Weekly</option>
                  <option>As needed</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>Duration</label>
              <input
                type="text"
                placeholder="e.g. 3 months"
                value={newMed.duration}
                onChange={(e) => setMedField("duration", e.target.value)}
              />
            </div>
          </div>

          {/* Two action buttons side by side */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              className="btn-primary"
              style={{ marginTop: 0 }}
              onClick={addMed}
              disabled={!newMed.name?.trim()}
            >
              Add Medication
            </button>
            <button
              className="btn-secondary"
              style={{ marginTop: 0 }}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* When the form is hidden, show the "+" button instead */
        <button className="btn-secondary" onClick={() => setShowForm(true)}>
          + Add a Medication
        </button>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          FAMILY MEDICAL HISTORY
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="🧬 Family Medical History" />

      <p
        style={{
          fontSize: 13,
          color: "var(--slate)",
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        Toggle on any conditions that run in your immediate family (parents or
        siblings).
      </p>

      {/* Four toggle rows — one per major hereditary condition */}
      <div style={{ marginBottom: 16 }}>
        {famConditions.map(({ key, icon, label }) => (
          <div key={key} className="fam-row">
            <span className="fam-label">
              <span className="fam-icon">{icon}</span>
              {label}
            </span>
            <ToggleBtn on={family[key]} onToggle={() => toggleFam(key)} />
          </div>
        ))}
      </div>

      {/* Free-text for anything not in the list above */}
      <div className="field">
        <label>Other Hereditary Conditions</label>
        <input
          type="text"
          placeholder="e.g. Sickle cell anaemia, Haemophilia, Cystic fibrosis…"
          value={family.other}
          onChange={(e) =>
            setFamily((prev) => ({ ...prev, other: e.target.value }))
          }
        />
      </div>

      <button
        className="btn-primary"
        onClick={() => {
          saveToApp( meds, family );
          onGoTo("profile");
        }}
      >
        Save & Continue →
      </button>

      <button
        className="btn-secondary"
        onClick={() => {
          saveToApp( meds, family );
          // onNext({ meds, family }); // save whatever they've entered so far
          onGoTo("profile"); // then navigate back
        }}
      >
        ← Back to Sections
      </button>
    </div>
  );
}
