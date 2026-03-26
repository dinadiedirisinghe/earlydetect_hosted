import { useState, useEffect, useRef } from "react";
import { StepDots } from "./utils.jsx";

/**
 * OTPScreen
 * ─────────
 * Two-phase authentication flow:
 *   Phase 1 – "email"  : user types their email and clicks "Send OTP"
 *   Phase 2 – "verify" : user enters 6 individual digit boxes
 *
 * In a real app you would call your backend here to actually send the email.
 * For this demo the code is accepted as soon as all 6 digits are filled.
 *
 * Props:
 *   onNext(data) – called with { email } once the user passes verification
 *   totalSteps   – total number of wizard steps (for the dot indicator)
 */
export default function OTPScreen({ onNext, totalSteps }) {
  const [phase, setPhase] = useState("email"); // "email" | "verify"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0); // resend cooldown (seconds)
  const inputRefs = useRef([]); // refs so we can auto-focus boxes
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [serverError, setServerError] = useState("");

  // ── Countdown timer for the "Resend" button ──────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // ── Send OTP (simulated) ─────────────────────────────────────────────────
  // const handleSend = () => {
  //   if (!email.includes("@")) return;
  //   setPhase("verify");
  //   setCountdown(60); // lock resend for 60 seconds
  //   setOtp(["", "", "", "", "", ""]); // clear any previous attempt
  //   // In production: await api.sendOtp(email)
  // };
  const handleSend = async () => {
    if (!email.includes("@") || !email.includes(".")) return;
    setSending(true);
    setServerError("");

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Failed to send email. Please try again.");
        return;
      }

      // Success — move to the verify phase
      setPhase("verify");
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      setServerError("");
    } catch (err) {
      console.log("error:" +err);
      setServerError("Could not reach the server. Make sure it is running.");
    } finally {
      setSending(false);
    }
  };

  // ── Handle typing in each OTP box ────────────────────────────────────────
  // The trick here: after a digit is typed, move focus to the next box
  // automatically so the user doesn't have to click each one.
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits allowed

    const updated = [...otp];
    updated[index] = value.slice(-1); // keep only the last digit typed
    setOtp(updated);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── Handle Backspace to go back a box ────────────────────────────────────
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Verify (in a real app: compare against server-generated code) ─────────
  // const handleVerify = () => {
  //   if (otp.join("").length === 6) {
  //     onNext({ email });
  //   }
  // };

  const handleVerify = async () => {
    if (otp.join("").length !== 6) return;
    setVerifying(true);
    setServerError("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otp.join("") }),
      });

      const data = await response.json();
      if (!response.ok) {
        setServerError(data.error || "Verification failed.");
        return;
      }

      // Verified — advance the wizard
      onNext({ email, userId: data.userId, existingData: data.existingData });
    } catch (err) {
      setServerError("Could not reach the server. Make sure it is running.");
    } finally {
      setVerifying(false);
    }
  };

  const isOtpComplete = otp.join("").length === 6;

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={0} />

      {phase === "email" ? (
        <>
          {/* ── Phase 1: Email entry ── */}
          <div className="screen-title">
            Welcome to
            <br />
            <em>EarlyDetect</em>
          </div>
          <p className="screen-subtitle">
            Your intelligent health companion for young adults. Enter your email
            to receive a one-time password and get started.
          </p>

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              autoFocus
            />
          </div>

          {serverError && (
            <div className="alert alert-danger" style={{ marginBottom: 12 }}>
              <span className="alert-icon">⚠️</span>
              <div>{serverError}</div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={!email.includes("@") || !email.includes(".") || sending}
          >
            {sending ? "Sending…" : "Send One-Time Password →"}
          </button>
        </>
      ) : (
        <>
          {/* ── Phase 2: OTP verification ── */}
          <button className="btn-back" onClick={() => setPhase("email")}>
            ← Back
          </button>

          <div className="screen-title">Check your inbox</div>
          <p className="screen-subtitle">
            We sent a 6-digit verification code to <strong>{email}</strong>.
            Enter it below to continue.
          </p>

          {/* 6 individual digit inputs */}
          <div className="field">
            <label>Verification Code</label>
            <div className="otp-row">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  className={digit ? "filled" : ""}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>
          </div>

          {/* Resend cooldown */}
          <div className="resend-row">
            {countdown > 0 ? (
              <>
                Resend code in <strong>{countdown}s</strong>
              </>
            ) : (
              <>
                Didn't receive it?{" "}
                <button className="resend-btn" onClick={handleSend}>
                  Resend code
                </button>
              </>
            )}
          </div>

          {serverError && (
            <div className="alert alert-danger" style={{ marginBottom: 12 }}>
              <span className="alert-icon">⚠️</span>
              <div>{serverError}</div>
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleVerify}
            disabled={!isOtpComplete || verifying}
          >
            {verifying ? "Verifying…" : "Verify & Continue →"}
          </button>
        </>
      )}
    </div>
  );
}
