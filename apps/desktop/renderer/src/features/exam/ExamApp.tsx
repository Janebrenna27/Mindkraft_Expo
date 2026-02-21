import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  "What is the capital of France?",
  "Which planet is closest to the Sun?",
  "What is the largest ocean on Earth?",
  "Who wrote Romeo and Juliet?",
  "What is the chemical symbol for Gold?",
];

const TOTAL = QUESTIONS.length;
const EXAM_DURATION = 5 * 60;

export default function ExamApp() {
  const [screen, setScreen] = useState<"question" | "loading" | "finish">("question");
  const [current, setCurrent] = useState(1);
  const [answer, setAnswer] = useState("");
  const [time, setTime] = useState(EXAM_DURATION);
  const [activeBtn, setActiveBtn] = useState<string | null>(null);
  const [isDictating, setIsDictating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Countdown timer
  useEffect(() => {
    if (screen !== "question" || time <= 0) return;
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, screen]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
    }
  };

  const reset = () => {
    setCurrent(1);
    setAnswer("");
    setTime(EXAM_DURATION);
    setScreen("question");
    setActiveBtn(null);
    setIsDictating(false);
  };

  const handleSubmit = () => {
    setScreen("loading");
    setTimeout(() => setScreen("finish"), 2000);
  };

  // 1. Answer — enter dictation mode
  const handleAnswer = () => {
    setActiveBtn("answer");
    setIsDictating(true);
    speak("Dictation mode started. Speak your answer.");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // 2. Read Again — re-read question aloud
  const handleReadAgain = () => {
    setActiveBtn("read");
    setIsDictating(false);
    speak(QUESTIONS[current - 1]);
  };

  // 3. Next — go to next question
  const handleNext = () => {
    setActiveBtn("next");
    setIsDictating(false);
    setCurrent((c) => c + 1);
    setAnswer("");
  };

  // 4. Previous — go to previous question
  const handlePrev = () => {
    setActiveBtn("previous");
    setIsDictating(false);
    setCurrent((c) => c - 1);
    setAnswer("");
  };

  // 5. Stop — stop current dictation, save answer silently
  const handleStop = () => {
    setActiveBtn("stop");
    setIsDictating(false);
    textareaRef.current?.blur();
    speak("Answer saved.");
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body, #root { width: 100%; height: 100%; overflow: hidden; }
        @keyframes glow {
          0%,100% { box-shadow: 0 0 10px rgba(109,41,50,0.5), inset 0 0 10px rgba(109,41,50,0.2); }
          50%      { box-shadow: 0 0 22px rgba(86,28,36,0.8), inset 0 0 20px rgba(86,28,36,0.3); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        textarea::placeholder { color: rgba(255,245,233,0.65); }
      `}</style>

      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>

        {/* ── Background ── */}
        <div style={{
          position: "fixed", inset: 0, zIndex: -1,
          background: "#E8D8C4",
        }}>
          <div style={{
            position: "absolute", bottom: 0, left: 0, width: "50%", height: "40%", opacity: 0.15,
            clipPath: "polygon(0 100%, 100% 40%, 100% 100%)",
            background: "transparent",
          }} />
          <div style={{
            position: "absolute", bottom: 0, right: 0, width: "60%", height: "35%", opacity: 0.15,
            clipPath: "polygon(0 50%, 100% 100%, 0 100%)",
            background: "transparent",
          }} />
        </div>

        {/* ── Timer ── */}
        <div style={{ position: "fixed", top: "2rem", right: "2rem", zIndex: 40 }}>
          <div style={{
            borderRadius: "9999px", padding: "0.75rem 1.75rem",
            fontSize: "1.35rem", fontWeight: 700, color: "#E8D8C4",
            background: "rgba(86,28,36,0.5)",
            border: "1px solid rgba(232,216,196,0.4)",
            animation: "glow 2s ease-in-out infinite",
            letterSpacing: "0.05em",
          }}>
            {formatTime(time)}
          </div>
        </div>

        {/* ── QUESTION SCREEN ── */}
        {screen === "question" && (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "2rem 6rem", gap: "2rem",
          }}>

            {/* Question number */}
            <p style={{ color: "#561C24", fontSize: "1.3rem", fontWeight: 600, letterSpacing: "0.05em" }}>
              Question {current} of {TOTAL}
            </p>

            {/* Question card */}
            <div style={{
              width: "100%", maxWidth: "1050px",
              borderRadius: "1.25rem", padding: "2.8rem 3.5rem",
              background: "rgba(86,28,36,0.88)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(86,28,36,0.6)",
            }}>
              <p style={{ color: "#ffffff", fontSize: "1.85rem", fontWeight: 500, lineHeight: 1.6 }}>
                {QUESTIONS[current - 1]}
              </p>
            </div>

            {/* Dictation mode indicator */}
            {isDictating && (
              <div style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.5rem 1.2rem", borderRadius: "9999px",
                background: "rgba(86,28,36,0.4)",
                border: "1px solid rgba(199,183,163,0.35)",
              }}>
                <div style={{
                  width: "10px", height: "10px", borderRadius: "50%",
                  background: "#E8D8C4",
                  animation: "pulse 1s ease-in-out infinite",
                }} />
                <span style={{ color: "#E8D8C4", fontSize: "1.1rem", fontWeight: 600 }}>
                  Dictation Mode Active — Speak your answer
                </span>
              </div>
            )}

            {/* Answer textarea */}
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={5}
              placeholder={isDictating ? "Listening... speak your answer" : "Press 1. Answer to start dictation"}
              readOnly={!isDictating}
              style={{
                width: "100%", maxWidth: "1050px",
                padding: "1.5rem 2rem",
                color: "#FFF5E9", fontSize: "1.25rem",
                background: isDictating ? "rgba(109,41,50,0.6)" : "rgba(109,41,50,0.35)",
                backdropFilter: "blur(8px)",
                border: isDictating
                  ? "1px solid rgba(109,41,50,0.5)"
                  : "1px solid rgba(236,72,153,0.2)",
                borderRadius: "0.875rem",
                resize: "none", outline: "none",
                transition: "all 0.3s ease",
                fontFamily: "inherit",
                boxShadow: isDictating ? "0 0 20px rgba(109,41,50,0.3)" : "none",
                cursor: isDictating ? "text" : "default",
              }}
            />

            {/* IVR Buttons — from your PDF */}
            <div style={{
              display: "flex", gap: "1rem", flexWrap: "wrap",
              justifyContent: "center", width: "100%", maxWidth: "1050px",
            }}>
              <IvrBtn active={activeBtn === "answer"} onClick={handleAnswer}>
                1. Answer
              </IvrBtn>
              <IvrBtn active={activeBtn === "read"} onClick={handleReadAgain}>
                2. Read Again
              </IvrBtn>
              <IvrBtn active={activeBtn === "next"} disabled={current === TOTAL} onClick={handleNext}>
                3. Next
              </IvrBtn>
              <IvrBtn active={activeBtn === "previous"} disabled={current === 1} onClick={handlePrev}>
                4. Previous
              </IvrBtn>
              <IvrBtn
                active={activeBtn === "stop"}
                disabled={!isDictating}
                onClick={handleStop}
              >
                5. Stop Answering
              </IvrBtn>
            </div>

            {/* Submit — last question only */}
            {current === TOTAL && (
              <button
                onClick={handleSubmit}
                style={{
                  position: "fixed", bottom: "2.5rem", right: "2.5rem", zIndex: 50,
                  padding: "1.2rem 3rem", borderRadius: "9999px",
                  border: "none", cursor: "pointer",
                  color: "#ffffff", fontSize: "1.2rem", fontWeight: 700,
                  background: "linear-gradient(135deg, #561C24 0%, #6D2932 50%, #8B3A44 100%)",
                  boxShadow: "0 0 24px rgba(86,28,36,0.7)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.boxShadow = "0 0 36px rgba(236,72,153,0.7)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(86,28,36,0.7)";
                }}
              >
                Submit Exam
              </button>
            )}
          </div>
        )}

        {/* ── LOADING SCREEN ── */}
        {screen === "loading" && (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "2rem",
          }}>
            <div style={{
              width: "100px", height: "100px", borderRadius: "50%",
              border: "4px solid rgba(86,28,36,0.3)",
              borderTop: "4px solid #E8D8C4",
              animation: "spin 1s linear infinite",
            }} />
            <p style={{ color: "#ffffff", fontSize: "1.7rem", fontWeight: 500 }}>
              Submitting your exam...
            </p>
          </div>
        )}

        {/* ── FINISH SCREEN ── */}
        {screen === "finish" && (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: "2.5rem",
          }}>
            <p style={{
              fontSize: "3.5rem", fontWeight: 800,
              color: "#561C24",
            }}>
              ✓ Exam Submitted Successfully
            </p>
            <button
              onClick={reset}
              style={{
                padding: "1.2rem 5rem", borderRadius: "9999px",
                border: "none", cursor: "pointer",
                color: "#FFF5E9", fontSize: "1.25rem", fontWeight: 700,
                background: "linear-gradient(135deg, #561C24 0%, #6D2932 50%, #8B3A44 100%)",
                boxShadow: "0 0 24px rgba(86,28,36,0.7)",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Finish
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── IVR Button ────────────────────────────────────────────────────────────────
interface IvrBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

function IvrBtn({ children, onClick, active = false, disabled = false }: IvrBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "1rem 2.4rem",
        borderRadius: "9999px",
        fontSize: "1.15rem", fontWeight: 600,
        color: active ? "#E8D8C4" : "#561C24",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        border: active ? "none" : "1px solid rgba(86,28,36,0.35)",
        background: active
          ? "linear-gradient(135deg, #561C24 0%, #6D2932 50%, #8B3A44 100%)"
          : "rgba(255,255,255,0.08)",
        boxShadow: active ? "0 0 18px rgba(236,72,153,0.5)" : "none",
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {children}
    </button>
  );
}
