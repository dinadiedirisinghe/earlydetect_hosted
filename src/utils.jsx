// ─── Pure utility functions ────────────────────────────────────────────────

/**
 * Calculate age in whole years from a birthday string like "2000-05-12".
 * Returns null if no valid birthday is provided.
 */
export function calcAge(birthday) {
  if (!birthday) return null;
  const diff = Date.now() - new Date(birthday).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

/**
 * Calculate BMI from height in centimetres and weight in kilograms.
 * Returns a string like "24.2" or null if inputs are missing/invalid.
 */
export function calcBMI(heightCm, weightKg) {
  const h = parseFloat(heightCm);
  const w = parseFloat(weightKg);
  if (!h || !w || h <= 0 || w <= 0) return null;
  return (w / Math.pow(h / 100, 2)).toFixed(1);
}

/**
 * Return a display category, CSS class, and icon for a given BMI value.
 * Used to colour-code the BMI stat card and trigger obesity alerts.
 */
export function bmiCategory(bmi) {
  if (!bmi) return null;
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Underweight", cls: "bmi-warn",   icon: "⚠️" };
  if (b < 25)   return { label: "Normal",       cls: "bmi-ok",    icon: "✅" };
  if (b < 30)   return { label: "Overweight",   cls: "bmi-warn",  icon: "⚠️" };
  return               { label: "Obese",         cls: "bmi-danger",icon: "🚨" };
}

/** Return the first letter of first + last name as uppercase initials. */
export function initials(first, last) {
  return ((first?.[0] ?? "") + (last?.[0] ?? "")).toUpperCase() || "?";
}

// ─── Tiny reusable UI primitives ──────────────────────────────────────────

/**
 * RadioGroup — renders a vertical list of selectable "check cards".
 * Props: options (string[]), value (string), onChange (fn)
 */
export function RadioGroup({ options, value, onChange }) {
  return (
    <div className="check-group">
      {options.map(opt => (
        <div
          key={opt}
          className={`check-card ${value === opt ? "selected" : ""}`}
          onClick={() => onChange(opt)}
        >
          <div className="radio-dot">
            <div className="radio-inner" />
          </div>
          <span className="check-label">{opt}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * PillGroup — renders a horizontal row of toggleable pills for multi-select.
 * Props: options (string[]), selected (string[]), onChange (fn)
 */
export function PillGroup({ options, selected, onChange }) {
  const toggle = (opt) =>
    onChange(
      selected.includes(opt)
        ? selected.filter(s => s !== opt)
        : [...selected, opt]
    );

  return (
    <div className="pill-group">
      {options.map(opt => (
        <div
          key={opt}
          className={`pill ${selected.includes(opt) ? "selected" : ""}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </div>
      ))}
    </div>
  );
}

/**
 * SegControl — horizontal segmented control, single-select.
 * Props: options (string[]), value (string), onChange (fn)
 */
export function SegControl({ options, value, onChange }) {
  return (
    <div className="seg-control">
      {options.map(opt => (
        <button
          key={opt}
          className={`seg-btn ${value === opt ? "active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/**
 * SectionDivider — a labelled horizontal rule used between form sections.
 * Props: label (string)
 */
export function SectionDivider({ label }) {
  return (
    <div className="section-divider">
      <div className="divider-line" />
      <div className="divider-label">{label}</div>
      <div className="divider-line" />
    </div>
  );
}

/**
 * StepDots — the row of progress dots at the top of each screen.
 * Props: total (number), current (number, 0-indexed)
 */
export function StepDots({ total, current }) {
  return (
    <div className="step-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`step-dot ${i === current ? "active" : i < current ? "done" : ""}`}
        />
      ))}
    </div>
  );
}

/**
 * ToggleBtn — an accessible on/off toggle switch.
 * Props: on (boolean), onToggle (fn)
 */
export function ToggleBtn({ on, onToggle }) {
  return (
    <button
      type="button"
      className={`toggle-btn ${on ? "on" : ""}`}
      onClick={onToggle}
      aria-pressed={on}
    />
  );
}
