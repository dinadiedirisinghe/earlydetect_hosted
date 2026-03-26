import { useState } from "react";
import { StepDots, SectionDivider } from "./utils.jsx";
import { DOCTORS, CONDITION_TO_SPECIALTY } from "../doctors.js";

/**
 * DoctorsScreen
 * ─────────────
 * Reads the stored analysis result and matches the identified disease risks
 * to relevant doctors from the Sri Lankan dataset.
 *
 * Matching logic:
 *   1. For each disease risk in the analysis, look up which specialization IDs
 *      are relevant using CONDITION_TO_SPECIALTY
 *   2. Find doctors whose specializations overlap with those IDs
 *   3. Also do a keyword match against each doctor's tags array as a fallback
 *   4. Deduplicate and sort by rating descending
 *   5. Show the top matches grouped by which condition they address
 */
export default function DoctorsScreen({ onGoTo, analysis, totalSteps }) {
  const [expandedDoctor, setExpandedDoctor] = useState(null);

  // ── Match doctors to the analysis disease risks ───────────────────────────
  const matchDoctors = () => {
    if (!analysis?.diseaseRisks?.length) return [];

    // Build a flat list of: { condition, riskLevel, doctors[] }
    const matches = [];

    analysis.diseaseRisks.forEach((risk) => {
      const conditionKey = risk.condition.toLowerCase();

      // Step 1: find relevant specialization IDs for this condition
      const relevantSpecIds = new Set();
      Object.entries(CONDITION_TO_SPECIALTY).forEach(([key, ids]) => {
        if (
          conditionKey.includes(key) ||
          key.includes(conditionKey.split(" ")[0])
        ) {
          ids.forEach((id) => relevantSpecIds.add(id));
        }
      });

      // Step 2: find doctors that match by specialization OR by tags
      const matched = DOCTORS.filter((doctor) => {
        const specMatch = doctor.specializations.some((s) =>
          relevantSpecIds.has(s.id),
        );
        const tagMatch = doctor.tags.some(
          (tag) =>
            conditionKey.includes(tag) ||
            tag.includes(conditionKey.split(" ")[0]),
        );
        return specMatch || tagMatch;
      });

      // Sort matched doctors by rating descending
      const sorted = [...matched].sort((a, b) => b.rating - a.rating);

      if (sorted.length > 0) {
        matches.push({
          condition: risk.condition,
          riskLevel: risk.riskLevel,
          doctors: sorted.slice(0, 3), // top 3 per condition
        });
      }
    });

    return matches;
  };

  const conditionMatches = matchDoctors();

  // Flat deduplicated list of all recommended doctors for the "All Doctors" tab
  const allRecommended = [
    ...new Map(
      conditionMatches.flatMap((m) => m.doctors).map((d) => [d.doctorId, d]),
    ).values(),
  ].sort((a, b) => b.rating - a.rating);

  const [activeTab, setActiveTab] = useState("byCondition");

  // ── Colour helpers ────────────────────────────────────────────────────────
  const riskColour = {
    low: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    moderate: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    high: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
    "very high": { bg: "#fdf2f8", text: "#9d174d", border: "#f0abdb" },
  };

  // ── No analysis guard ─────────────────────────────────────────────────────
  if (!analysis) {
    return (
      <div className="screen">
        <StepDots total={totalSteps} current={6} />
        <div className="screen-title">Recommended Doctors</div>
        <div className="alert alert-warn" style={{ marginTop: 20 }}>
          <span className="alert-icon">⚠️</span>
          <div>
            <strong>No analysis found.</strong> Please run the health analysis
            first so we can recommend the right doctors for you.
          </div>
        </div>
        <button className="btn-primary" onClick={() => onGoTo("analysis")}>
          Go to Analysis →
        </button>
        <button className="btn-secondary" onClick={() => onGoTo("profile")}>
          ← Back to Sections
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={6} />

      <div className="screen-title">
        Recommended
        <br />
        Doctors
      </div>
      <p className="screen-subtitle">
        Based on your health analysis, these Sri Lankan specialists are most
        relevant to your identified risk factors.
      </p>

      {/* Tab switcher */}
      <div className="seg-control" style={{ marginBottom: 20 }}>
        <button
          className={`seg-btn ${activeTab === "byCondition" ? "active" : ""}`}
          onClick={() => setActiveTab("byCondition")}
        >
          By Condition
        </button>
        <button
          className={`seg-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All ({allRecommended.length})
        </button>
      </div>

      {/* ── BY CONDITION TAB ─────────────────────────────────────────────── */}
      {activeTab === "byCondition" && (
        <>
          {conditionMatches.length === 0 ? (
            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <div>
                No specific doctor matches found for your conditions. Please
                consult a general physician.
              </div>
            </div>
          ) : (
            conditionMatches.map((match, i) => {
              const colours = riskColour[match.riskLevel] ?? riskColour.low;
              return (
                <div key={i} style={{ marginBottom: 24 }}>
                  {/* Condition header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                      padding: "10px 14px",
                      background: colours.bg,
                      border: `1px solid ${colours.border}`,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "var(--navy)",
                      }}
                    >
                      {match.condition}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: colours.border,
                        color: colours.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {match.riskLevel} risk
                    </span>
                  </div>

                  {/* Doctor cards for this condition */}
                  {match.doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.doctorId}
                      doctor={doctor}
                      expanded={expandedDoctor === doctor.doctorId}
                      onToggle={() =>
                        setExpandedDoctor(
                          expandedDoctor === doctor.doctorId
                            ? null
                            : doctor.doctorId,
                        )
                      }
                    />
                  ))}
                </div>
              );
            })
          )}
        </>
      )}

      {/* ── ALL DOCTORS TAB ──────────────────────────────────────────────── */}
      {activeTab === "all" && (
        <>
          {allRecommended.length === 0 ? (
            <div className="alert alert-info">
              <span className="alert-icon">ℹ️</span>
              <div>
                No doctor matches found. Please consult a general physician.
              </div>
            </div>
          ) : (
            allRecommended.map((doctor) => (
              <DoctorCard
                key={doctor.doctorId}
                doctor={doctor}
                expanded={expandedDoctor === doctor.doctorId}
                onToggle={() =>
                  setExpandedDoctor(
                    expandedDoctor === doctor.doctorId ? null : doctor.doctorId,
                  )
                }
              />
            ))
          )}
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
        ⚕️ Doctor recommendations are based on your health analysis only. Always
        verify availability and credentials before booking.
      </div>

      <button className="btn-secondary" onClick={() => onGoTo("profile")}>
        ← Back to Sections
      </button>
    </div>
  );
}

// ── DoctorCard sub-component ──────────────────────────────────────────────────
function DoctorCard({ doctor, expanded, onToggle }) {
  // Render star rating visually
  const stars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    return (
      <span style={{ fontSize: 13, color: "#f59e0b" }}>
        {"★".repeat(full)}
        {half ? "½" : ""}
        <span style={{ color: "var(--muted)", fontSize: 12 }}> ({rating})</span>
      </span>
    );
  };

  return (
    <div
      style={{
        border: "2px solid var(--border)",
        borderRadius: "var(--radius)",
        marginBottom: 10,
        overflow: "hidden",
        background: "white",
        transition: "var(--transition)",
      }}
    >
      {/* Card header — always visible, tap to expand */}
      <div
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
        onClick={onToggle}
      >
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            flexShrink: 0,
            background:
              doctor.gender === "F"
                ? "linear-gradient(135deg, #f9a8d4, #ec4899)"
                : "linear-gradient(135deg, var(--teal), var(--navy))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {doctor.name
            .split(" ")
            .find((w) => w !== "Dr." && w !== "DR" && w !== "Dr")?.[0] ?? "D"}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: 14,
              color: "var(--navy)",
              marginBottom: 2,
            }}
          >
            {doctor.name}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--teal)",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            {doctor.specializations[0]?.name}
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {stars(doctor.rating)}
            <span style={{ fontSize: 12, color: "var(--slate)" }}>
              {doctor.experience} yrs exp
            </span>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>
              Rs. {doctor.fee.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Expand chevron */}
        <span style={{ color: "var(--muted)", fontSize: 14, flexShrink: 0 }}>
          {expanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          style={{
            borderTop: "1px solid var(--border)",
            padding: "14px 16px",
            background: "var(--off-white)",
          }}
        >
          {/* About */}
          <p
            style={{
              fontSize: 13,
              color: "var(--slate)",
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            {doctor.about}
          </p>

          {/* All specializations */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              Specializations
            </div>
            <div className="pill-group">
              {doctor.specializations.map((s, i) => (
                <span
                  key={i}
                  className="pill selected"
                  style={{ cursor: "default", fontSize: 11 }}
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 6,
              }}
            >
              Languages
            </div>
            <div style={{ fontSize: 13, color: "var(--slate)" }}>
              {doctor.languages.join(", ")}
            </div>
          </div>

          {/* Hospitals */}
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--navy)",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 8,
              }}
            >
              Available At
            </div>
            {doctor.hospitals.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  marginBottom: 6,
                  background: "white",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 14 }}>🏥</span>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--navy)",
                    }}
                  >
                    {h.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--slate)" }}>
                    {h.city}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consultation fee */}
          <div
            style={{
              marginTop: 12,
              padding: "10px 14px",
              background: "var(--teal-faint)",
              borderRadius: "var(--radius-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{ fontSize: 13, color: "var(--teal)", fontWeight: 600 }}
            >
              Consultation Fee
            </span>
            <span
              style={{ fontSize: 15, fontWeight: 700, color: "var(--navy)" }}
            >
              Rs. {doctor.fee.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
