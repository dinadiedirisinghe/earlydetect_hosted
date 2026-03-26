import { useState } from "react";
import { StepDots } from "./utils.jsx";

/**
 * RegScreen
 * ─────────
 * Collects the user's first name, last name, and birthday.
 * The email is prefilled (and disabled) because it was already entered
 * on the OTP screen — it flows here as a prop.
 *
 * Props:
 *   email        – the verified email from OTPScreen
 *   onNext(data) – called with { firstName, lastName, birthday }
 *   totalSteps   – total wizard steps (for dots)
 */
export default function RegScreen({ email, onNext, totalSteps }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
  });

  // A small helper so we don't have to write the full setter each time
  const setField = (key, value) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // Only allow the user to proceed once all three fields are filled
  const isValid = form.firstName.trim() && form.lastName.trim() && form.birthday;

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={1} />

      <div className="screen-title">Tell us about yourself</div>
      <p className="screen-subtitle">
        This information personalises your health risk assessments and lets the app track how your profile evolves over time.
      </p>

      {/* Email is shown read-only — it was already verified in the previous step */}
      <div className="field">
        <label>Email Address</label>
        <input
          type="email"
          value={email}
          disabled
          title="Your verified email address"
        />
      </div>

      {/* First name and last name sit side by side on wider screens */}
      <div className="inline-grid">
        <div className="field">
          <label>First Name</label>
          <input
            type="text"
            placeholder="e.g. Dinadi"
            value={form.firstName}
            onChange={e => setField("firstName", e.target.value)}
            autoFocus
          />
        </div>

        <div className="field">
          <label>Last Name</label>
          <input
            type="text"
            placeholder="e.g. Edirisinghe"
            value={form.lastName}
            onChange={e => setField("lastName", e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label>Date of Birth</label>
        {/* The date input will be used to calculate age automatically on the Profile screen */}
        <input
          type="date"
          value={form.birthday}
          onChange={e => setField("birthday", e.target.value)}
          // Prevent future dates — you can't be born in the future!
          max={new Date().toISOString().split("T")[0]}
        />
      </div>

      <button
        className="btn-primary"
        onClick={() => onNext(form)}
        disabled={!isValid}
      >
        Continue →
      </button>
    </div>
  );
}
