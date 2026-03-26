import { useState } from "react";
import { StepDots, SectionDivider } from "./utils.jsx";

/**
 * ReportsScreen — Multi-report upload and review
 * ──────────────────────────────────────────────
 * Two phases only:
 *   "upload" → user uploads files one by one, each extracted immediately
 *   "review" → all extracted cards shown together, user saves and returns
 *
 * No combined AI analysis — just extraction and display.
 */
export default function ReportsScreen({
  onGoTo,
  onSave,
  initialData,
  totalSteps,
}) {
  const [phase, setPhase] = useState("upload");
  const [reportCards, setReportCards] = useState(initialData?.cards ?? []);
  const [extractingIndex, setExtractingIndex] = useState(null);
  const [error, setError] = useState("");
  const [pendingFile, setPendingFile] = useState(null);

  // ── Colour helpers ──────────────────────────────────────────────────────
  const statusColour = {
    normal: { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0" },
    low: { bg: "#fffbeb", text: "#d97706", border: "#fde68a" },
    high: { bg: "#fef2f2", text: "#dc2626", border: "#fca5a5" },
    critical: { bg: "#fdf2f8", text: "#9d174d", border: "#f0abdb" },
  };

  // ── Save helper — always pass latest cards to parent ───────────────────
  const saveToApp = (cards) => {
    onSave?.({ cards });
  };

  // ── File selection ──────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowed.includes(file.type)) {
      setError("Please upload a PDF, JPG, PNG, or WEBP file.");
      return;
    }
    if (reportCards.some((r) => r.fileName === file.name)) {
      setError(`"${file.name}" has already been uploaded.`);
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(",")[1];
      setPendingFile({ fileName: file.name, mimeType: file.type, base64Data });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Extract a single report ─────────────────────────────────────────────
  const extractSingleReport = async (fileData) => {
    const placeholderIndex = reportCards.length;

    // Add loading placeholder immediately so the user sees progress
    setReportCards((prev) => {
      const updated = [
        ...prev,
        {
          fileName: fileData.fileName,
          mimeType: fileData.mimeType,
          base64Data: fileData.base64Data,
          extraction: null,
        },
      ];
      return updated;
    });
    setExtractingIndex(placeholderIndex);

    const extractionPrompt = `
You are a medical data extraction assistant.
Extract ALL measurable test values from this medical report.
Return ONLY a raw JSON object — no markdown, no code fences, start with { end with }.

{
  "reportType": "CBC" or "glucose" or "HbA1c" or "lipid" or "liver" or "thyroid" or "renal" or "mixed" or "unknown",
  "reportDate": "date if visible on the report, else null",
  "extractedValues": [
    {
      "testName": "exact name as shown on the report",
      "value": numeric value only,
      "unit": "unit string",
      "referenceRange": "reference range string if shown, else null",
      "status": "normal" or "low" or "high" or "critical"
    }
  ],
  "notes": "any other clinically relevant text visible on the report, or null"
}

If a value is not clearly readable, omit it. Do not interpret — only extract.
`;

    try {
      const fileContentBlock =
        fileData.mimeType === "application/pdf"
          ? {
              type: "document",
              source: {
                type: "base64",
                media_type: fileData.mimeType,
                data: fileData.base64Data,
              },
            }
          : {
              type: "image",
              source: {
                type: "base64",
                media_type: fileData.mimeType,
                data: fileData.base64Data,
              },
            };

      const response = await fetch("http://localhost:3001/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                fileContentBlock,
                { type: "text", text: extractionPrompt },
              ],
            },
          ],
        }),
      });

      const data = await response.json();
      const rawText = data.content.map((b) => b.text || "").join("");
      const stripped = rawText.replace(/```json|```/g, "").trim();
      const jsonStart = stripped.indexOf("{");
      const jsonEnd = stripped.lastIndexOf("}");
      if (jsonStart === -1 || jsonEnd === -1)
        throw new Error("No JSON in response");

      const extraction = JSON.parse(stripped.slice(jsonStart, jsonEnd + 1));

      // Replace placeholder with real extraction and save to parent
      setReportCards((prev) => {
        const updated = prev.map((card, i) =>
          i === placeholderIndex ? { ...card, extraction } : card,
        );
        saveToApp(updated); // ← save after each successful extraction
        return updated;
      });
    } catch (err) {
      console.error("Extraction failed for", fileData.fileName, err);
      setReportCards((prev) => {
        const updated = prev.map((card, i) =>
          i === placeholderIndex
            ? { ...card, extraction: { error: true } }
            : card,
        );
        saveToApp(updated);
        return updated;
      });
    } finally {
      setExtractingIndex(null);
    }
  };

  // ── Remove a card ───────────────────────────────────────────────────────
  const removeCard = (index) => {
    setReportCards((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      saveToApp(updated); // ← save after removal too
      return updated;
    });
  };

  // ════════════════════════════════════════════════════════════════════════
  // PHASE: UPLOAD
  // ════════════════════════════════════════════════════════════════════════
  if (phase === "upload") {
    const allDoneExtracting = reportCards.every((r) => r.extraction !== null);
    const hasValidReports = reportCards.some(
      (r) => r.extraction && !r.extraction.error,
    );

    return (
      <div className="screen">
        <StepDots total={totalSteps} current={4} />

        <div className="screen-title">Medical Reports</div>
        <p className="screen-subtitle">
          Upload your lab reports one at a time. Each report is read and
          extracted immediately. Once done, tap Review to see all extracted
          values.
        </p>

        {/* Upload area */}
        <label
          style={{
            display: "block",
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius)",
            padding: "28px 20px",
            textAlign: "center",
            cursor: extractingIndex !== null ? "not-allowed" : "pointer",
            background: "var(--off-white)",
            transition: "var(--transition)",
            marginBottom: 16,
            opacity: extractingIndex !== null ? 0.6 : 1,
          }}
        >
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={handleFileSelect}
            disabled={extractingIndex !== null}
            style={{ display: "none" }}
          />
          <div style={{ fontSize: 36, marginBottom: 10 }}>
            {extractingIndex !== null ? "⏳" : "⬆️"}
          </div>
          <div
            style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}
          >
            {extractingIndex !== null
              ? "Reading report…"
              : "Tap to upload a report"}
          </div>
          <div style={{ fontSize: 13, color: "var(--slate)" }}>
            PDF, JPG, PNG or WEBP &nbsp;·&nbsp; CBC, HbA1c, Lipid, Glucose &amp;
            more
          </div>
        </label>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 12 }}>
            <span className="alert-icon">⚠️</span>
            <div>{error}</div>
          </div>
        )}

        {/* Report cards */}
        {reportCards.length > 0 && (
          <>
            <SectionDivider label="📋 Uploaded Reports" />
            {reportCards.map((card, i) => (
              <ReportCard
                key={i}
                card={card}
                isExtracting={extractingIndex === i}
                onRemove={() => removeCard(i)}
                statusColour={statusColour}
              />
            ))}
          </>
        )}

        {/* Review button — only shown when at least one report is ready */}
        {hasValidReports && allDoneExtracting && (
          <button
            className="btn-primary"
            onClick={() => setPhase("review")}
            style={{ marginTop: 8 }}
          >
            Review Extracted Data →
          </button>
        )}

        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            lineHeight: 1.6,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            margin: "16px 0",
          }}
        >
          ⚕️ <strong>Disclaimer:</strong> Extracted data is for reference only.
          Always consult a qualified healthcare provider.
        </div>

        <button
          className="btn-secondary"
          onClick={() => {
            saveToApp(reportCards); // save whatever is uploaded so far
            onGoTo("profile");
          }}
        >
          ← Back to Sections
        </button>

        {/* Confirmation modal — shown when a file is selected but not yet confirmed */}
        {pendingFile && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(13, 31, 60, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "24px",
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "var(--radius-lg)",
                padding: "28px 24px",
                maxWidth: 380,
                width: "100%",
                boxShadow: "var(--shadow-lg)",
              }}
            >
              {/* Icon */}
              <div
                style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}
              >
                📄
              </div>

              {/* Title */}
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  color: "var(--navy)",
                  textAlign: "center",
                  marginBottom: 8,
                }}
              >
                Confirm your report
              </div>

              {/* File name */}
              <div
                style={{
                  background: "var(--off-white)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  marginBottom: 16,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--navy)",
                  wordBreak: "break-all",
                }}
              >
                {pendingFile.fileName}
              </div>

              {/* Confirmation question */}
              <p
                style={{
                  fontSize: 14,
                  color: "var(--slate)",
                  lineHeight: 1.6,
                  textAlign: "center",
                  marginBottom: 24,
                }}
              >
                Please confirm that this report belongs to <strong>you</strong>{" "}
                and that you consent to its contents being analysed by the AI.
                Do not upload reports belonging to another person.
              </p>

              {/* Action buttons */}
              <button
                className="btn-primary"
                style={{ marginBottom: 8 }}
                onClick={() => {
                  setPendingFile(null); // clear the pending state
                  extractSingleReport(pendingFile); // now proceed with extraction
                }}
              >
                ✅ Yes, this is my report
              </button>

              <button
                className="btn-secondary"
                onClick={() => setPendingFile(null)} // discard the file
              >
                ❌ No, remove this file
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  // PHASE: REVIEW
  // ════════════════════════════════════════════════════════════════════════
  const validCards = reportCards.filter(
    (r) => r.extraction && !r.extraction.error,
  );

  return (
    <div className="screen">
      <StepDots total={totalSteps} current={4} />

      <div className="screen-title">Extracted Data</div>
      <p className="screen-subtitle">
        All values extracted from your reports. Review them below.
      </p>

      {validCards.map((card, i) => (
        <div key={i}>
          {/* Report header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              marginTop: i > 0 ? 20 : 0,
            }}
          >
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 15, color: "var(--navy)" }}
              >
                📄 {card.fileName}
              </div>
              <div style={{ fontSize: 12, color: "var(--slate)" }}>
                {card.extraction.reportType?.toUpperCase()}
                {card.extraction.reportDate
                  ? ` · ${card.extraction.reportDate}`
                  : ""}
              </div>
            </div>
            <button
              className="btn-icon"
              onClick={() => {
                removeCard(reportCards.indexOf(card));
                // If no valid cards left after removal, go back to upload
                if (validCards.length <= 1) setPhase("upload");
              }}
              title="Remove this report"
            >
              ×
            </button>
          </div>

          {/* Extracted values */}
          {card.extraction.extractedValues?.map((v, j) => {
            const colours = statusColour[v.status] ?? statusColour.normal;
            return (
              <div
                key={j}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 14px",
                  marginBottom: 6,
                  background: colours.bg,
                  border: `1px solid ${colours.border}`,
                  borderRadius: "var(--radius)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "var(--navy)",
                    }}
                  >
                    {v.testName}
                  </div>
                  {v.referenceRange && (
                    <div style={{ fontSize: 11, color: "var(--slate)" }}>
                      Ref: {v.referenceRange}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: colours.text,
                    }}
                  >
                    {v.value}{" "}
                    <span style={{ fontSize: 12, fontWeight: 400 }}>
                      {v.unit}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: colours.text,
                      textTransform: "capitalize",
                    }}
                  >
                    {v.status}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Notes from the report if any */}
          {card.extraction.notes && (
            <div
              style={{
                fontSize: 13,
                color: "var(--slate)",
                padding: "10px 14px",
                background: "var(--sky)",
                borderRadius: "var(--radius)",
                marginBottom: 6,
                lineHeight: 1.5,
              }}
            >
              📝 {card.extraction.notes}
            </div>
          )}

          {/* Divider between reports */}
          {i < validCards.length - 1 && (
            <div
              style={{
                height: 1,
                background: "var(--border)",
                margin: "16px 0",
              }}
            />
          )}
        </div>
      ))}

      {/* Save and go back to sections */}
      <button
        className="btn-primary"
        style={{ marginTop: 20 }}
        onClick={() => {
          saveToApp(reportCards); // save final state
          onGoTo("profile"); // return to sections menu
        }}
      >
        Save & Continue →
      </button>

      <button className="btn-secondary" onClick={() => setPhase("upload")}>
        ← Upload More Reports
      </button>
    </div>
  );
}

// ── ReportCard sub-component ────────────────────────────────────────────────
function ReportCard({ card, isExtracting, onRemove, statusColour }) {
  const [expanded, setExpanded] = useState(false);

  // Loading state
  if (isExtracting || card.extraction === null) {
    return (
      <div
        style={{
          border: "2px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          marginBottom: 10,
          background: "var(--off-white)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 20 }}>⏳</div>
          <div>
            <div
              style={{ fontWeight: 600, fontSize: 14, color: "var(--navy)" }}
            >
              {card.fileName}
            </div>
            <div style={{ fontSize: 12, color: "var(--slate)" }}>
              Reading report…
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (card.extraction?.error) {
    return (
      <div
        style={{
          border: "2px solid var(--danger-border)",
          borderRadius: "var(--radius)",
          padding: "14px 16px",
          marginBottom: 10,
          background: "var(--danger-bg)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{ fontWeight: 600, fontSize: 14, color: "var(--danger)" }}
          >
            ❌ {card.fileName}
          </div>
          <div style={{ fontSize: 12, color: "var(--danger)" }}>
            Could not read this report. Try a clearer image or PDF.
          </div>
        </div>
        <button className="btn-icon" onClick={onRemove}>
          ×
        </button>
      </div>
    );
  }

  const valueCount = card.extraction?.extractedValues?.length ?? 0;

  // Success state — collapsible
  return (
    <div
      style={{
        border: "2px solid var(--teal)",
        borderRadius: "var(--radius)",
        marginBottom: 10,
        overflow: "hidden",
        background: "var(--teal-faint)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 14px",
        }}
      >
        <div
          style={{ flex: 1, cursor: "pointer" }}
          onClick={() => setExpanded((e) => !e)}
        >
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>
            ✅ {card.fileName}
          </div>
          <div style={{ fontSize: 12, color: "var(--teal)" }}>
            {card.extraction.reportType?.toUpperCase()} &nbsp;·&nbsp;
            {valueCount} value{valueCount !== 1 ? "s" : ""} extracted
            &nbsp;·&nbsp;
            <span style={{ textDecoration: "underline" }}>
              {expanded ? "hide" : "show"} details
            </span>
          </div>
        </div>
        <button className="btn-icon" onClick={onRemove} title="Remove">
          ×
        </button>
      </div>

      {expanded && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid #b2dfdf" }}>
          {card.extraction.extractedValues?.map((v, j) => {
            const colours = statusColour[v.status] ?? statusColour.normal;
            return (
              <div
                key={j}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom:
                    j < card.extraction.extractedValues.length - 1
                      ? "1px solid #b2dfdf"
                      : "none",
                }}
              >
                <span style={{ fontSize: 13, color: "var(--navy)" }}>
                  {v.testName}
                </span>
                <span
                  style={{ fontWeight: 700, fontSize: 13, color: colours.text }}
                >
                  {v.value} {v.unit}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
