import { useState } from "react";
import {
  RadioGroup,
  PillGroup,
  SegControl,
  SectionDivider,
  StepDots,
} from "./utils.jsx";

/**
 * HabitsScreen
 * ────────────
 * The most detailed screen in the app. It collects all lifestyle factors
 * that are statistically linked to NCD risk:
 *   – Exercise (frequency + type)
 *   – Smoking (status + sub-details if current smoker)
 *   – Alcohol (frequency)
 *   – Recreational drugs (Y/N/prefer-not + frequency if yes)
 *   – Diet type
 *   – Sleep hours (slider)
 *   – Stress level
 *   – Occupation
 *   – Location / pollution exposure
 *
 * The trick with "conditional reveals":
 *   Certain sub-forms only appear when a specific parent answer is chosen.
 *   e.g. the "cigarettes per day" inputs only appear if the user picks
 *   "Current smoker". This keeps the form from feeling overwhelming.
 *
 * Props:
 *   onNext(habits) – called with the full habits object
 *   totalSteps     – for StepDots
 */
export default function HabitsScreen({
  initialData,
  onGoTo,
  totalSteps,
  onSave,
}) {
  const [h, setH] = useState(
    initialData ?? {
      // Exercise
      exerciseFreq: "",
      exerciseTypes: [],

      // Smoking
      smoking: "",
      cigPerDay: "",
      yearsSmoke: "",

      // Drinking
      drinking: "",

      // Drugs
      drugs: "",
      drugsFreq: "",

      // Lifestyle
      diet: "",
      sleep: 7, // default: 7 hours
      stress: "",
      occupation: "",
      location: "",
    },
  );

  const saveToApp = (
    exerciseFreq,
    exerciseTypes,
    smoking,
    cigPerDay,
    yearsSmoke,
    drinking,
    drugs,
    drugsFreq,
    diet,
    sleep,
    stress,
    occupation,
    location,
  ) => {
    onSave?.({h});
  };

  // Convenience setter — merges a partial update into the state object
  const set = (key, val) => setH((prev) => ({ ...prev, [key]: val }));

  // ── Slider background fill ───────────────────────────────────────────────
  // We compute the % position of the thumb so we can colour the filled-left
  // portion of the track in teal. This is a CSS trick via inline style.
  const sleepFillPct = `${((h.sleep - 3) / (12 - 3)) * 100}%`;

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={3} />

      <div className="screen-title">Health Habits</div>
      <p className="screen-subtitle">
        Honest answers enable more accurate risk detection. Everything you share
        is private and encrypted.
      </p>

      {/* ════════════════════════════════════════════════════════════════════
          EXERCISE
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="🏃 Exercise" />

      <div className="field">
        <label>How often do you exercise?</label>
        <RadioGroup
          options={["Daily", "3–5 times/week", "1–2 times/week", "Rarely"]}
          value={h.exerciseFreq}
          onChange={(v) => set("exerciseFreq", v)}
        />
      </div>

      {/*
        Conditional reveal:
        The exercise type selector only shows when the user actually exercises.
        If they chose "Rarely", it's unlikely they have a type preference, so
        we hide it to keep the form clean.
      */}
      {h.exerciseFreq && h.exerciseFreq !== "Rarely" && (
        <div className="field">
          <label>Exercise Type (select all that apply)</label>
          <PillGroup
            options={[
              "Cardio",
              "Strength training",
              "Walking",
              "Sports",
              "Yoga",
              "Swimming",
            ]}
            selected={h.exerciseTypes}
            onChange={(v) => set("exerciseTypes", v)}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SMOKING
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="🚬 Smoking" />

      <div className="field">
        <label>Smoking status</label>
        <RadioGroup
          options={["Never", "Former smoker", "Current smoker"]}
          value={h.smoking}
          onChange={(v) => set("smoking", v)}
        />
      </div>

      {/* Only show cigarette details if they are an active smoker */}
      {h.smoking === "Current smoker" && (
        <div className="sub-section">
          <div className="inline-grid">
            <div className="field">
              <label>Cigarettes per day</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 10"
                value={h.cigPerDay}
                onChange={(e) => set("cigPerDay", e.target.value)}
              />
            </div>
            <div className="field">
              <label>Years of smoking</label>
              <input
                type="number"
                min="0"
                max="60"
                placeholder="e.g. 5"
                value={h.yearsSmoke}
                onChange={(e) => set("yearsSmoke", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          ALCOHOL
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="🍷 Alcohol" />

      <div className="field">
        <label>Drinking frequency</label>
        {/*
          A segmented control works well here because there are only 4 options
          and they lie on a clear spectrum from Never → Daily.
        */}
        <SegControl
          options={["Never", "Occasionally", "Weekly", "Daily"]}
          value={h.drinking}
          onChange={(v) => set("drinking", v)}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          RECREATIONAL DRUGS
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="💊 Recreational Drugs" />

      <div className="field">
        <label>Recreational drug use</label>
        {/*
          Note the "Prefer not to say" option — this is important for
          sensitive questions. Some users need an honest way out that
          doesn't force a "No" answer they don't mean.
        */}
        <SegControl
          options={["No", "Yes", "Prefer not to say"]}
          value={h.drugs}
          onChange={(v) => set("drugs", v)}
        />
      </div>

      {/* Frequency sub-form only if user said Yes */}
      {h.drugs === "Yes" && (
        <div className="sub-section">
          <div className="field">
            <label>How often?</label>
            <RadioGroup
              options={["Rarely", "Sometimes", "Often"]}
              value={h.drugsFreq}
              onChange={(v) => set("drugsFreq", v)}
            />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          LIFESTYLE
      ════════════════════════════════════════════════════════════════════ */}
      <SectionDivider label="🌿 Lifestyle" />

      <div className="field">
        <label>Diet type</label>
        <SegControl
          options={["Vegetarian", "Mixed", "Junk-heavy"]}
          value={h.diet}
          onChange={(v) => set("diet", v)}
        />
      </div>

      {/* Sleep hours — a range slider from 3h to 12h */}
      <div className="field">
        <label>
          Sleep hours per night:&nbsp;
          <strong style={{ color: "var(--teal)" }}>{h.sleep}h</strong>
        </label>
        <div className="slider-wrap">
          <input
            type="range"
            min="3"
            max="12"
            step="0.5"
            value={h.sleep}
            /*
              We're injecting the fill percentage as an inline CSS variable.
              The CSS in index.css reads it to paint the left portion of the
              slider track in teal colour. This is a pure CSS solution — no
              extra libraries needed.
            */
            style={{
              background: `linear-gradient(90deg, var(--teal) ${sleepFillPct}, var(--border) ${sleepFillPct})`,
            }}
            onChange={(e) => set("sleep", parseFloat(e.target.value))}
          />
          <div className="slider-labels">
            <span>3h (very low)</span>
            <span>8h (ideal)</span>
            <span>12h</span>
          </div>
        </div>
      </div>

      <div className="field">
        <label>Stress level</label>
        <SegControl
          options={["Low", "Moderate", "High"]}
          value={h.stress}
          onChange={(v) => set("stress", v)}
        />
      </div>

      <div className="field">
        <label>Occupation</label>
        <input
          type="text"
          placeholder="e.g. Software Engineer, Nurse, Student…"
          value={h.occupation}
          onChange={(e) => set("occupation", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Living area &amp; pollution exposure</label>
        <SegControl
          options={["Urban", "Suburban", "Rural"]}
          value={h.location}
          onChange={(v) => set("location", v)}
        />
        {h.location === "Urban" && (
          <p style={{ fontSize: 12, color: "var(--slate)", marginTop: 8 }}>
            ℹ️ Urban environments often have higher air pollution levels, which
            is a risk factor for respiratory and cardiovascular conditions.
          </p>
        )}
      </div>

      <button
        className="btn-primary"
        onClick={() => {
          onSave?.(h);
          onGoTo("profile");
        }}
      >
        Save & Continue →
      </button>

      <button
        className="btn-secondary"
        onClick={() => {
          // onNext({h}); // save whatever they've entered so far
          onSave?.(h);
          onGoTo("profile"); // then navigate back
        }}
      >
        ← Back to Sections
      </button>
    </div>
  );
}
