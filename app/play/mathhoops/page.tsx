"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ── SKILLS ──
const SKILLS = {
  addition: { name: "Addition", symbol: "+", description: "Add numbers up to 20", color: "#60A5FA", generate: () => { const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * 10) + 1; return { x: a, y: b, answer: a + b, op: "+" }; } },
  subtraction: { name: "Subtraction", symbol: "−", description: "Subtract numbers up to 20", color: "#F87171", generate: () => { const a = Math.floor(Math.random() * 10) + 5; const b = Math.floor(Math.random() * a) + 1; return { x: a, y: b, answer: a - b, op: "−" }; } },
  multiplication: { name: "Multiplication", symbol: "×", description: "Times tables 2 through 9", color: "#34D399", generate: () => { const a = Math.floor(Math.random() * 8) + 2; const b = Math.floor(Math.random() * 8) + 2; return { x: a, y: b, answer: a * b, op: "×" }; } },
  division: { name: "Division", symbol: "÷", description: "Divide within 100", color: "#FBBF24", generate: () => { const b = Math.floor(Math.random() * 8) + 2; const a = b * (Math.floor(Math.random() * 8) + 2); return { x: a, y: b, answer: a / b, op: "÷" }; } },
  mixed: { name: "Mixed", symbol: "±×÷", description: "All operations combined", color: "#C084FC", generate: () => { const ops = ["addition", "subtraction", "multiplication", "division"] as const; const op = ops[Math.floor(Math.random() * ops.length)]; return SKILLS[op].generate(); } },
};

type SkillKey = keyof typeof SKILLS;

const DIFFICULTIES: Record<string, { name: string; cpuInterval: number; cpuName: string; emoji: string }> = {
  easy: { name: "Rookie", cpuInterval: 6000, cpuName: "The Benchwarmers", emoji: "🐢" },
  medium: { name: "Pro", cpuInterval: 4000, cpuName: "The Mathletes", emoji: "⚡" },
  hard: { name: "Legend", cpuInterval: 2200, cpuName: "The Terminators", emoji: "🔥" },
};

function playSound(type: "score" | "miss" | "streak" | "buzzer") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    if (type === "score") {
      [523, 659, 784].forEach((freq, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.frequency.value = freq;
        const t = now + i * 0.1;
        g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.start(t); o.stop(t + 0.2);
      });
    }
    if (type === "miss") {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "sawtooth";
      o.frequency.setValueAtTime(120, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.3);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.start(now); o.stop(now + 0.3);
    }
    if (type === "streak") {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination); o.frequency.value = freq;
        const t = now + i * 0.1;
        g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        o.start(t); o.stop(t + 0.2);
      });
    }
    if (type === "buzzer") {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "square";
      o.frequency.value = 200;
      g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.start(now); o.stop(now + 0.6);
    }
  } catch (e) { /* fail silently */ }
}

function Hoop({ scored, missed }: { scored: boolean; missed: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 32, height: 22, background: scored ? "#00FF88" : missed ? "#FF4444" : "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 3, transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>
        {scored ? "🏀" : missed ? "❌" : ""}
      </div>
      <div style={{ width: 30, height: 5, border: "2.5px solid #FF5A1F", borderRadius: "50%", background: "transparent", marginTop: -1 }} />
      <div style={{ width: 20, height: 12, borderLeft: "2px solid rgba(255,255,255,0.35)", borderRight: "2px solid rgba(255,255,255,0.35)", borderBottom: "2px solid rgba(255,255,255,0.35)", clipPath: "polygon(10% 0%, 90% 0%, 80% 100%, 20% 100%)" }} />
    </div>
  );
}

function Court() {
  return (
    <svg viewBox="0 0 400 180" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <rect width="400" height="180" fill="#1A0800" />
      {[40,80,120,160,200,240,280,320,360].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="180" stroke="rgba(255,90,31,0.07)" strokeWidth="1" />
      ))}
      <rect x="8" y="8" width="384" height="164" fill="none" stroke="rgba(255,90,31,0.45)" strokeWidth="1.5" rx="3" />
      <circle cx="200" cy="90" r="28" fill="none" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" />
      <line x1="200" y1="8" x2="200" y2="172" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" />
      <rect x="8" y="50" width="65" height="80" fill="rgba(255,90,31,0.06)" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" />
      <ellipse cx="73" cy="90" rx="22" ry="22" fill="none" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" />
      <rect x="327" y="50" width="65" height="80" fill="rgba(255,90,31,0.06)" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" />
      <ellipse cx="327" cy="90" rx="22" ry="22" fill="none" stroke="rgba(255,90,31,0.3)" strokeWidth="1.5" />
      <path d="M 8 38 Q 115 8 115 90 Q 115 172 8 142" fill="none" stroke="rgba(255,90,31,0.2)" strokeWidth="1.5" />
      <path d="M 392 38 Q 285 8 285 90 Q 285 172 392 142" fill="none" stroke="rgba(255,90,31,0.2)" strokeWidth="1.5" />
    </svg>
  );
}

function ScoreBoard({ playerScore, cpuScore, timeLeft, playerName, cpuName, streak, skillColor }: {
  playerScore: number; cpuScore: number; timeLeft: number; playerName: string; cpuName: string; streak: number; skillColor: string;
}) {
  const urgent = timeLeft <= 10;
  return (
    <div style={{ background: "#0D0D0D", borderBottom: `2.5px solid ${skillColor}`, padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 8, alignItems: "center", flexShrink: 0 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: skillColor, fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", fontFamily: "monospace" }}>YOU</div>
        <div style={{ color: "#fff", fontSize: 34, fontWeight: 900, lineHeight: 1, fontFamily: "monospace" }}>{playerScore}</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{playerName}</div>
      </div>
      <div style={{ textAlign: "center", padding: "0 10px" }}>
        <div style={{ color: urgent ? "#FF4444" : "#FFD234", fontSize: urgent ? 22 : 18, fontWeight: 900, fontFamily: "monospace", animation: urgent ? "pulse 0.5s infinite" : "none", minWidth: 48 }}>
          {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
        </div>
        {streak >= 3 && <div style={{ color: skillColor, fontSize: 9, fontWeight: 700, fontFamily: "monospace" }}>🔥 {streak} STREAK</div>}
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "rgba(255,100,100,0.8)", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", fontFamily: "monospace" }}>CPU</div>
        <div style={{ color: "#fff", fontSize: 34, fontWeight: 900, lineHeight: 1, fontFamily: "monospace" }}>{cpuScore}</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cpuName}</div>
      </div>
    </div>
  );
}

export default function MathHoops() {
  const [screen, setScreen] = useState("menu");
  const [skill, setSkill] = useState<SkillKey>("multiplication");
  const [difficulty, setDifficulty] = useState("medium");
  const [playerName, setPlayerName] = useState("Player 1");
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [fact, setFact] = useState<{ x: number; y: number; answer: number; op: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [streak, setStreak] = useState(0);
  const [correctFeedback, setCorrectFeedback] = useState<number | null>(null);
  const [wrongFeedback, setWrongFeedback] = useState<number | null>(null);
  const [playerHoop, setPlayerHoop] = useState<string | null>(null);
  const [cpuHoop, setCpuHoop] = useState<string | null>(null);
  const [cpuBallAnim, setCpuBallAnim] = useState(false);
  const [ballLeft, setBallLeft] = useState("30%");
  const [ballTop, setBallTop] = useState("40%");
  const inputRef = useRef<HTMLInputElement>(null);
  const cpuTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const diff = DIFFICULTIES[difficulty];
  const currentSkill = SKILLS[skill];

  const nextFact = useCallback(() => {
    setFact(currentSkill.generate());
    setAnswer("");
    setBallLeft("30%"); setBallTop("40%");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [currentSkill]);

  const startGame = () => {
    setPlayerScore(0); setCpuScore(0); setTimeLeft(60); setStreak(0);
    setCorrectFeedback(null); setWrongFeedback(null);
    setPlayerHoop(null); setCpuHoop(null);
    setBallLeft("30%"); setBallTop("40%");
    setFact(currentSkill.generate()); setAnswer("");
    setScreen("game");
  };

  useEffect(() => {
    if (screen !== "game") return;
    gameTimerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(gameTimerRef.current!);
          clearInterval(cpuTimerRef.current!);
          playSound("buzzer");
          setScreen("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(gameTimerRef.current!);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    cpuTimerRef.current = setInterval(() => {
      setCpuScore(s => s + 2);
      setCpuHoop("scored");
      setCpuBallAnim(true);
      setTimeout(() => { setCpuHoop(null); setCpuBallAnim(false); }, 700);
    }, diff.cpuInterval);
    return () => clearInterval(cpuTimerRef.current!);
  }, [screen, difficulty, diff.cpuInterval]);

  useEffect(() => {
    if (screen === "game") setTimeout(() => inputRef.current?.focus(), 100);
  }, [screen]);

  const handleAnswer = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== "Enter") return;
    if (!fact) return;
    const val = parseInt(answer);
    if (isNaN(val)) return;

    if (val === fact.answer) {
      const newStreak = streak + 1;
      const points = newStreak >= 5 ? 3 : 2;
      setStreak(newStreak);
      setPlayerScore(s => s + points);
      setCorrectFeedback(points);
      setWrongFeedback(null);
      setPlayerHoop("scored");
      setBallLeft("6%"); setBallTop("18%");
      playSound(newStreak >= 5 ? "streak" : "score");
      setTimeout(() => { setPlayerHoop(null); setCorrectFeedback(null); }, 900);
      setTimeout(() => nextFact(), 900);
    } else {
      setStreak(0);
      setWrongFeedback(fact.answer);
      setCorrectFeedback(null);
      setPlayerHoop("missed");
      playSound("miss");
      setTimeout(() => { setPlayerHoop(null); setWrongFeedback(null); }, 1400);
      setTimeout(() => nextFact(), 1000);
    }
  };

  const playerWon = playerScore > cpuScore;
  const tied = playerScore === cpuScore;

  // ── MENU ──
  if (screen === "menu") {
    return (
      <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Trebuchet MS', sans-serif", padding: 20 }}>
        <style>{`
          @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.04)} }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        `}</style>
        <div style={{ textAlign: "center", marginBottom: 24, animation: "float 3s ease-in-out infinite" }}>
          <div style={{ fontSize: 56 }}>🏀</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: "#FF5A1F", textShadow: "3px 3px 0px #8B2500", letterSpacing: -1, lineHeight: 1 }}>
            MATH<span style={{ color: "#ffffff" }}>HOOPS</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 3, textTransform: "uppercase", marginTop: 4 }}>Know Your Facts. Win The Game.</div>
        </div>

        {/* Player name */}
        <div style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 5, fontFamily: "monospace" }}>Your Name</div>
          <input value={playerName} onChange={e => setPlayerName(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(255,90,31,0.4)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "monospace", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Skill selection */}
        <div style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>Choose Your Skill</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {(Object.entries(SKILLS) as [SkillKey, typeof SKILLS[SkillKey]][]).map(([key, val]) => (
              <button key={key} onClick={() => setSkill(key)} style={{ padding: "10px 8px", borderRadius: 8, border: skill === key ? `2px solid ${val.color}` : "1px solid rgba(255,255,255,0.1)", background: skill === key ? `${val.color}20` : "rgba(255,255,255,0.03)", color: skill === key ? val.color : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "monospace", transition: "all 0.2s", textAlign: "left" }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{val.symbol}</div>
                <div style={{ fontSize: 11, fontWeight: 900 }}>{val.name}</div>
                <div style={{ fontSize: 9, opacity: 0.7, fontWeight: 400, marginTop: 1 }}>{val.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div style={{ width: "100%", maxWidth: 320, marginBottom: 20 }}>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8, fontFamily: "monospace" }}>Difficulty</div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.entries(DIFFICULTIES).map(([key, val]) => (
              <button key={key} onClick={() => setDifficulty(key)} style={{ flex: 1, padding: "9px 4px", borderRadius: 8, border: difficulty === key ? "2px solid #FF5A1F" : "1px solid rgba(255,255,255,0.1)", background: difficulty === key ? "rgba(255,90,31,0.12)" : "rgba(255,255,255,0.03)", color: difficulty === key ? "#FF5A1F" : "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1, transition: "all 0.2s" }}>
                <div style={{ fontSize: 16, marginBottom: 2 }}>{val.emoji}</div>
                <div>{val.name.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={startGame} style={{ width: "100%", maxWidth: 320, padding: "14px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #FF5A1F, #FF8C00)", color: "#0D0D0D", fontSize: 16, fontWeight: 900, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", boxShadow: "0 5px 0 #8B2500", animation: "pulse 2s infinite" }}>
          🏀 TIP OFF!
        </button>
        <a href="/" style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 14, fontFamily: "monospace", textDecoration: "none", letterSpacing: 1 }}>← Back to Gamaroo</a>
      </div>
    );
  }

  // ── RESULT ──
  if (screen === "result") {
    return (
      <div style={{ minHeight: "100vh", background: playerWon ? "#0A1A0A" : tied ? "#0D0D0D" : "#1A0000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Trebuchet MS', sans-serif", padding: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>{playerWon ? "🏆" : tied ? "🤝" : "💀"}</div>
        <div style={{ fontSize: 24, fontWeight: 900, color: playerWon ? "#FFD234" : tied ? "#aaa" : "#FF4444", fontFamily: "monospace", marginBottom: 4, textAlign: "center" }}>
          {playerWon ? "GAME OVER. YOU WIN!" : tied ? "ITS A TIE!" : "GAME OVER. L"}
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 2, marginBottom: 24, fontFamily: "monospace" }}>
          {playerWon ? "Buckets all day 🏀" : tied ? "So close!" : `${diff.cpuName} got you this time`}
        </div>
        <div style={{ display: "flex", gap: 24, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "18px 28px", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#FF5A1F", fontSize: 9, letterSpacing: 2, fontFamily: "monospace" }}>YOU</div>
            <div style={{ color: "#fff", fontSize: 48, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>{playerScore}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.3)", fontSize: 18, fontFamily: "monospace" }}>vs</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,100,100,0.8)", fontSize: 9, letterSpacing: 2, fontFamily: "monospace" }}>CPU</div>
            <div style={{ color: "#fff", fontSize: 48, fontWeight: 900, fontFamily: "monospace", lineHeight: 1 }}>{cpuScore}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320 }}>
          <button onClick={startGame} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #FF5A1F, #FF8C00)", color: "#0D0D0D", fontSize: 13, fontWeight: 900, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1, boxShadow: "0 3px 0 #8B2500" }}>🔁 REMATCH</button>
          <button onClick={() => setScreen("menu")} style={{ flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>🏠 MENU</button>
        </div>
        <a href="/" style={{ color: "rgba(255,255,255,0.2)", fontSize: 9, marginTop: 18, fontFamily: "monospace", textDecoration: "none", letterSpacing: 1 }}>← Back to Gamaroo</a>
      </div>
    );
  }

  // ── GAME ──
  return (
    <div style={{ height: "100vh", background: "#111", display: "flex", flexDirection: "column", fontFamily: "'Trebuchet MS', sans-serif", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.8} }
        @keyframes wrongShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `}</style>

      <ScoreBoard playerScore={playerScore} cpuScore={cpuScore} timeLeft={timeLeft} playerName={playerName || "YOU"} cpuName={diff.cpuName} streak={streak} skillColor={currentSkill.color} />

      <div style={{ position: "relative", width: "100%", paddingBottom: "32%", flexShrink: 0, overflow: "hidden" }}>
        <Court />
        <div style={{ position: "absolute", left: "14%", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
          <Hoop scored={playerHoop === "scored"} missed={playerHoop === "missed"} />
        </div>
        <div style={{ position: "absolute", right: "14%", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}>
          <Hoop scored={cpuHoop === "scored"} missed={cpuHoop === "missed"} />
        </div>
        <div style={{ position: "absolute", left: ballLeft, top: ballTop, zIndex: 3, fontSize: 22, transition: playerHoop === "scored" ? "left 0.4s ease-in, top 0.4s ease-in" : "none" }}>🏀</div>
        {cpuBallAnim && (
          <div style={{ position: "absolute", right: "30%", top: "40%", zIndex: 3, fontSize: 20 }}>🏀</div>
        )}
        {correctFeedback && (
          <div style={{ position: "absolute", left: "25%", top: "15%", color: "#00FF88", fontSize: 18, fontWeight: 900, fontFamily: "monospace", pointerEvents: "none", zIndex: 10, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
            +{correctFeedback} 🏀
          </div>
        )}
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", color: "rgba(255,90,31,0.1)", fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", fontFamily: "monospace", pointerEvents: "none" }}>MATHHOOPS</div>
      </div>

      <div style={{ padding: "10px 14px", flex: 1, background: "#111", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {fact && (
          <div style={{ background: "#0D0D0D", borderRadius: 12, padding: "14px 16px", border: wrongFeedback ? "1.5px solid #FF4444" : `1.5px solid ${currentSkill.color}40`, textAlign: "center", animation: wrongFeedback ? "wrongShake 0.4s ease" : "none", transition: "border 0.2s" }}>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, letterSpacing: 3, marginBottom: 4, fontFamily: "monospace", textTransform: "uppercase" }}>
              {currentSkill.name} · What is...
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: "#fff", fontFamily: "monospace", letterSpacing: -1, marginBottom: 4, textShadow: `0 0 20px ${currentSkill.color}60` }}>
              {fact.x} {fact.op} {fact.y} = <span style={{ color: currentSkill.color }}>?</span>
            </div>
            {wrongFeedback !== null && (
              <div style={{ background: "rgba(255,68,68,0.15)", border: "1px solid rgba(255,68,68,0.4)", borderRadius: 8, padding: "5px 12px", marginBottom: 8, display: "inline-block" }}>
                <span style={{ color: "#FF8888", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>✗ The answer was </span>
                <span style={{ color: "#FF4444", fontSize: 17, fontFamily: "monospace", fontWeight: 900 }}>{wrongFeedback}</span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, maxWidth: 260, margin: "0 auto" }}>
              <input ref={inputRef} type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={handleAnswer} placeholder="?"
                style={{ flex: 1, padding: "11px 12px", borderRadius: 8, border: `1.5px solid ${currentSkill.color}60`, background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 22, fontWeight: 900, fontFamily: "monospace", textAlign: "center", outline: "none" }} />
              <button onClick={handleAnswer} style={{ padding: "11px 16px", borderRadius: 8, border: "none", background: `linear-gradient(135deg, #FF5A1F, #FF8C00)`, color: "#0D0D0D", fontSize: 18, fontWeight: 900, cursor: "pointer", boxShadow: "0 3px 0 #8B2500" }}>🏀</button>
            </div>
            <div style={{ color: "rgba(255,255,255,0.18)", fontSize: 9, marginTop: 8, fontFamily: "monospace", letterSpacing: 1 }}>
              PRESS ENTER OR TAP 🏀 TO SHOOT
              {streak >= 3 && <span style={{ color: currentSkill.color, marginLeft: 8 }}>🔥 ON FIRE!</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
