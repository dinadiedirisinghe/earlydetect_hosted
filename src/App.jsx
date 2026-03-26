import { useState } from "react";
import OTPScreen from "./OTPScreen.jsx";
import RegScreen from "./RegScreen.jsx";
import ProfileScreen from "./ProfileScreen.jsx";
import HabitsScreen from "./HabitsScreen.jsx";
import MedScreen from "./MedScreen.jsx";
import ReportsScreen from "./ReportsScreen.jsx";
import SymptomsScreen from "./SymptomsScreen.jsx";
import AnalysisScreen from "./AnalysisScreen.jsx";
import DoctorsScreen from "./DoctorsScreen.jsx";
import SummaryScreen from "./SummaryScreen.jsx";

import { calcAge, calcBMI } from "./utils.jsx";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  EarlyDetect — Root Application Component
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This component is the "wizard controller". Think of it like a director
 * sitting above all the individual screens, deciding which one is currently
 * on stage. It doesn't render any form UI itself — it delegates that to
 * the individual screen components.
 *
 * DATA FLOW MODEL
 * ───────────────
 * React's rule is that data only flows DOWN (parent → child via props) and
 * events flow UP (child → parent via callback functions). This component
 * sits at the top, so it:
 *   1. Holds ALL collected data in one central `appData` state object.
 *   2. Passes each screen a callback like `onNext(data)`.
 *   3. When a screen calls `onNext`, the App merges that screen's data
 *      into `appData` and advances `step` to the next screen.
 *
 * This means every screen component is "dumb" — it only knows about its
 * own form fields and calls `onNext` when the user clicks Continue.
 * The App keeps the big picture.
 *
 * STEP SYSTEM
 * ───────────
 * Each screen is identified by a string key stored in `step`.
 * The STEP_ORDER array defines the sequence.
 * The header shows "Step X of Y" using the step's index in that array.
 */

// Define the wizard order here. Change this if you add/remove screens.
const STEP_ORDER = [
  "otp",
  "reg",
  "profile",
  "habits",
  "medical",
  "images",
  "symptoms",
  "analysis",
  "doctors",
  "summary",
];
const TOTAL_STEPS = STEP_ORDER.length;

// Step labels for the header badge (e.g. "Step 2 of 6")
const STEP_LABELS = {
  otp: "Verify Email",
  reg: "Registration",
  profile: "Profile",
  habits: "Health Habits",
  medical: "Medications",
  images: "Medical Reports",
  symptoms: "Symptoms",
  analysis: "Health Analysis",
  doctors: "Recommended Doctors",
  summary: "Summary",
};

export default function App() {
  // ── Wizard state ─────────────────────────────────────────────────────────
  const [step, setStep] = useState("otp");

  // ── Accumulated user data ────────────────────────────────────────────────
  // All data from all screens is merged here progressively.
  // By the time the user reaches SummaryScreen, this object is fully populated.
  const [appData, setAppData] = useState({
    // From OTPScreen
    email: "",

    // From RegScreen
    user: {
      email: "",
      firstName: "",
      lastName: "",
      birthday: "",
    },

    // From ProfileScreen
    profile: {
      sex: "",
      height: "",
      weight: "",
      bloodType: "",
    },

    // From HabitsScreen
    habits: {
      exerciseFreq: "",
      exerciseTypes: [],
      smoking: "",
      cigPerDay: "",
      yearsSmoke: "",
      drinking: "",
      drugs: "",
      drugsFreq: "",
      diet: "",
      sleep: 7,
      stress: "",
      occupation: "",
      location: "",
    },

    // From MedScreen
    medical: {
      meds: [],
      family: {
        diabetes: false,
        heart: false,
        cancer: false,
        hypertension: false,
        other: "",
      },
      reports: {
        cards: [], // the extracted report cards
        analysis: null, // the combined analysis result
      },
      symptoms: {
        selected: [], // selected symptom strings
        details: {}, // duration, severity, notes
        analysis: null, // the AI result
      },
      analysis: null, // stores the full analysis result
    },
  });

  const [userId, setUserId] = useState(null);

  // Add this alongside your existing useState hooks at the top of App()
  const [profilePhase, setProfilePhase] = useState("form");
  // "form" = show required fields, "menu" = show optional cards

  // ── Navigation helper ────────────────────────────────────────────────────
  /**
   * Called by each screen's "Continue" button via its `onNext` prop.
   * `updates` is whatever new data that screen collected.
   * `nextStep` is the string key of the screen to advance to.
   *
   * We use the functional form of setState (`prev => ...`) so React
   * always gives us the latest value of appData, even if multiple
   * updates happen in quick succession.
   */
  const advance = (nextStep, updates = {}) => {
    setAppData((prev) => ({ ...prev, ...updates }));
    setStep(nextStep);
    // Scroll back to top of the card between screen transitions
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add this right after the existing `advance` function
  const goTo = (targetStep) => {
    setStep(targetStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveToDb = async (endpoint, data) => {
    if (!userId) return; // not logged in yet
    try {
      await fetch(`${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...data }),
      });
    } catch (err) {
      console.error("DB save failed:", endpoint, err);
    }
  };

  // ── Derive display values for the header ─────────────────────────────────
  const stepIndex = STEP_ORDER.indexOf(step); // 0-based index
  const stepLabel = STEP_LABELS[step] ?? "";
  // Calculate progress as a percentage (0 → 100%) for the progress bar
  const progressPct = (stepIndex / (TOTAL_STEPS - 1)) * 100;

  // ── Full reset (for the demo "Start Over" button) ─────────────────────────
  const reset = () => {
    setStep("otp");
    setProfilePhase("form");
    setAppData({
      email: "",
      user: { email: "", firstName: "", lastName: "", birthday: "" },
      profile: { sex: "", height: "", weight: "", bloodType: "" },
      habits: {
        exerciseFreq: "",
        exerciseTypes: [],
        smoking: "",
        cigPerDay: "",
        yearsSmoke: "",
        drinking: "",
        drugs: "",
        drugsFreq: "",
        diet: "",
        sleep: 7,
        stress: "",
        occupation: "",
        location: "",
      },
      medical: {
        meds: [],
        family: {
          diabetes: false,
          heart: false,
          cancer: false,
          hypertension: false,
          other: "",
        },
      },
      reports: {
        cards: [], // the extracted report cards
        analysis: null, // the combined analysis result
      },
      symptoms: {
        selected: [], // selected symptom strings
        details: {}, // duration, severity, notes
        analysis: null, // the AI result
      },
      analysis: null,
    });
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  const handleLogout = () => {
    reset(); // clears all appData and goes back to "otp" step
    setUserId(null); // clears the userId
    setProfilePhase("form"); // resets profile phase
  };

  return (
    /*
     * .phone-frame is a CSS class in index.css that gives the "mobile app"
     * look — a centred card with rounded corners and a shadow.
     * In a real deployed web app you would remove this and let the layout
     * fill the full browser window naturally.
     */
    <div className="phone-frame">
      {/* ── App Header ───────────────────────────────────────────────────── */}
      <div className="app-header" style={{ justifyContent: "space-between" }}>
        <div className="header-logo">
          Early<span>Detect</span>
        </div>

        {stepIndex > 0 && (
          <div className="header-badge">
            Step {stepIndex} of {TOTAL_STEPS - 1} · {stepLabel}
          </div>
        )}

        {/* Only show logout when the user is past the OTP screen */}
        {stepIndex > 0 ? (
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "rgba(255,255,255,0.8)",
              borderRadius: 8,
              padding: "5px 10px",
              fontSize: 12,
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "none";
              e.currentTarget.style.color = "rgba(255,255,255,0.8)";
            }}
          >
            Log out
          </button>
        ) : (
          // Invisible placeholder to keep the logo centred on the OTP screen
          <div style={{ width: 60 }} />
        )}
      </div>

      {/* ── Progress Bar ─────────────────────────────────────────────────── */}
      {/*
        The fill width is driven by the CSS transition in index.css.
        As progressPct changes between screens, the bar smoothly animates.
      */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ── Active Screen ────────────────────────────────────────────────── */}
      {/*
        We render only the active screen at a time. Each screen gets
        `totalSteps` so it can render the correct number of step-dots,
        and `onNext` so it can advance the wizard.

        The `key={step}` on the wrapping div is important:
        it tells React to fully unmount and remount the component tree
        whenever the step changes, which re-triggers the CSS fade-in
        animation defined in index.css (@keyframes fadeSlide).
      */}
      <div key={step}>
        {step === "otp" && (
          <OTPScreen
            totalSteps={TOTAL_STEPS}
            onNext={async ({ email, userId: uid, existingData }) => {
              setUserId(uid);

              // If this user has been here before, restore all their saved data
              if (existingData) {
                const {
                  user,
                  profile,
                  habits,
                  medical,
                  reports,
                  symptoms,
                  analysis,
                } = existingData;
                setAppData((prev) => ({
                  ...prev,
                  email: email,
                  user: user
                    ? {
                        email,
                        firstName: user.firstName || "",
                        lastName: user.lastName || "",
                        birthday: user.birthday || "",
                      }
                    : { ...prev.user, email },
                  profile: profile
                    ? {
                        sex: profile.sex || "",
                        height: profile.heightCm || "",
                        weight: profile.weightKg || "",
                        bloodType: profile.bloodType || "",
                      }
                    : prev.profile,
                  habits: habits || prev.habits,
                  medical: medical || prev.medical,
                  reports: reports || prev.reports,
                  symptoms: symptoms || prev.symptoms,
                  analysis: analysis || prev.analysis,
                }));

                // If they have a name already, skip straight to profile menu
                if (user?.firstName) {
                  setProfilePhase("menu");
                  advance("profile", {});
                  return;
                }
              }

              advance("reg", { email, user: { ...appData.user, email } });
            }}
          />
        )}
        {step === "reg" && (
          <RegScreen
            totalSteps={TOTAL_STEPS}
            email={appData.email}
            onNext={(regData) => {
              saveToDb("/api/user/registration", regData);
              advance("profile", {
                user: { ...appData.user, ...regData, email: appData.email },
              });
            }}
          />
        )}

        {step === "profile" && (
          <ProfileScreen
            totalSteps={TOTAL_STEPS}
            initialData={appData.profile}
            user={appData.user}
            phase={profilePhase} // ← pass the phase down
            onPhaseChange={setProfilePhase} // ← let the child update it
            onSave={(profileData) => {
              setAppData((prev) => ({ ...prev, profile: profileData }));
              saveToDb("/api/user/profile", profileData);
            }}
            onGoTo={goTo}
            hasAnalysis={!!appData.analysis}
          />
        )}

        {step === "habits" && (
          <HabitsScreen
            totalSteps={TOTAL_STEPS}
            initialData={appData.habits}
            onSave={(habitsData) => {
              setAppData((prev) => ({ ...prev, habits: habitsData }));
              saveToDb("/api/user/habits", habitsData);
            }}
            onGoTo={goTo}
          />
        )}

        {step === "medical" && (
          <MedScreen
            totalSteps={TOTAL_STEPS}
            initialData={appData.medical} /* ← pass existing data back in */
            onSave={(medData) => {
              setAppData((prev) => ({ ...prev, medical: medData }));
              saveToDb("/api/user/medical", medData);
            }}
            // onNext={(medData) => {
            //   setAppData((prev) => ({ ...prev, medical: medData })); // ← save
            //   goTo("profile");
            // }}
            onGoTo={goTo}
          />
        )}

        {step === "images" && (
          <ReportsScreen
            totalSteps={TOTAL_STEPS}
            onGoTo={goTo}
            initialData={appData.reports} /* ← restore previous session */
            onSave={(reportsData) => {
              setAppData((prev) => ({ ...prev, reports: reportsData }));
              saveToDb("/api/user/reports", reportsData);
            }}
            patientContext={{
              age: calcAge(appData.user?.birthday),
              sex: appData.profile?.sex,
              bmi: calcBMI(appData.profile?.height, appData.profile?.weight),
              familyDiabetes: appData.medical?.family?.diabetes,
              familyHeart: appData.medical?.family?.heart,
              familyCancer: appData.medical?.family?.cancer,
            }}
          />
        )}

        {step === "symptoms" && (
          <SymptomsScreen
            totalSteps={TOTAL_STEPS}
            onGoTo={goTo}
            initialData={appData.symptoms} /* ← restore previous session */
            onSave={(symptomsData) => {
              setAppData((prev) => ({ ...prev, symptoms: symptomsData }));
              saveToDb("/api/user/symptoms", symptomsData);
            }}
            patientContext={{
              age: calcAge(appData.user?.birthday),
              sex: appData.profile?.sex,
              bmi: calcBMI(appData.profile?.height, appData.profile?.weight),
              smoking: appData.habits?.smoking,
              stress: appData.habits?.stress,
              familyDiabetes: appData.medical?.family?.diabetes,
              familyHeart: appData.medical?.family?.heart,
              familyCancer: appData.medical?.family?.cancer,
            }}
          />
        )}

        {step === "analysis" && (
          <AnalysisScreen
            totalSteps={TOTAL_STEPS}
            onGoTo={goTo}
            savedResult={appData.analysis}
            onSaveResult={(result) => {
              setAppData((prev) => ({ ...prev, analysis: result }));
              saveToDb("/api/user/analysis", { result });
            }}
            allData={{
              user: appData.user,
              profile: appData.profile,
              habits: appData.habits,
              medical: appData.medical,
              reports: appData.reports,
              symptoms: appData.symptoms,
            }}
            patientContext={{
              age: calcAge(appData.user?.birthday),
              sex: appData.profile?.sex,
              bmi: calcBMI(appData.profile?.height, appData.profile?.weight),
              smoking: appData.habits?.smoking,
              stress: appData.habits?.stress,
              familyDiabetes: appData.medical?.family?.diabetes,
              familyHeart: appData.medical?.family?.heart,
              familyCancer: appData.medical?.family?.cancer,
            }}
          />
        )}

        {step === "doctors" && (
          <DoctorsScreen
            totalSteps={TOTAL_STEPS}
            onGoTo={goTo}
            analysis={appData.analysis} // pass the stored analysis result
          />
        )}

        {step === "summary" && (
          <SummaryScreen
            totalSteps={TOTAL_STEPS}
            allData={appData}
            hasAnalysis={!!appData.analysis}
            onGoTo={goTo}
          />
        )}
      </div>
    </div>
  );
}
