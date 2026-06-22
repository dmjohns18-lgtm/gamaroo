cat > app/play/factorfc/page.tsx << 'ENDOFFILE'
"use client";
import { useState, useEffect, useCallback } from "react";

const DIFFICULTIES = {
  easy: { name: "Rookie", cpuInterval: 8000, cpuName: "FC Benchmarks", emoji: "🐢" },
  medium: { name: "Pro", cpuInterval: 5000, cpuName: "FC Mathletes", emoji: "⚡" },
  hard: { name: "Legend", cpuInterval: 3000, cpuName: "FC Terminators", emoji: "🔥" },
};

const PHASES = [
  { label: "MIDFIELD", shooterX: 12, ballX: 20 },
  { label: "ATTACKING THIRD", shooterX: 32, ballX: 40 },
  { label: "PENALTY BOX", shooterX: 52, ballX: 60 },
  { label: "SHOOT!", shooterX: 65, ballX: 72 },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateQuestion(grade = 5) {
  const maxFact = grade <= 2 ? 5 : grade <= 3 ? 7 : grade <= 4 ? 9 : 12;
  const x = Math.floor(Math.random() * maxFact) + 1;
  const y = Math.floor(Math.random() * maxFact) + 1;
  const a = x * y;
  const wrongs = new Set();
  while (wrongs.size < 3) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const w = Math.random() > 0.5 ? a + offset : Math.max(1, a - offset);
    if (w !== a) wrongs.add(w);
  }
  return { q: x + " x " + y, a, w: Array.from(wrongs) };
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    if (type === "score") {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = freq; const t = now + i * 0.1;
        g.gain.setValueAtTime(0.3, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        o.start(t); o.stop(t + 0.25);
      });
    }
    if (type === "advance") {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(400, now); o.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o.start(now); o.stop(now + 0.15);
    }
    if (type === "concede") {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "sawtooth";
      o.frequency.setValueAtTime(150, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.3);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      o.start(now); o.stop(now + 0.3);
    }
    if (type === "buzzer") {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination); o.type = "square";
      o.frequency.value = 200;
      g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      o.start(now); o.stop(now + 0.6);
    }
  } catch (e) {}
}

export default function FactorFC() {
  const [screen, setScreen] = useState("menu");
  const [difficulty, setDifficulty] = useState("medium");
  const [teamName, setTeamName] = useState("FC Player 1");
  const [playerScore, setPlayerScore] = useState(0);
  const [cpuScore, setCpuScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [phase, setPhase] = useState(0);
  const [question, setQuestion] = useState(() => generateQuestion());
  const [options, setOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [keeperY, setKeeperY] = useState(50);
  const [ballInGoal, setBallInGoal] = useState(false);
  const [canAnswer, setCanAnswer] = useState(true);
  const [streak, setStreak] = useState(0);
  const [grade, setGrade] = useState(5);

  const diff = DIFFICULTIES[difficulty];

  const loadQuestion = useCallback(() => {
    const q = generateQuestion(grade);
    setQuestion(q);
    setOptions(shuffle([q.a, ...q.w]));
    setCanAnswer(true);
  }, [grade]);

  const resetAttack = useCallback(() => {
    setPhase(0);
    setBallInGoal(false);
    setKeeperY(50);
    loadQuestion();
  }, [loadQuestion]);

  useEffect(() => {
    if (screen !== "game") return;
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(t);
          playSound("buzzer");
          setScreen("result");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return;
    const t = setInterval(() => {
      setCpuScore(s => s + 1);
      playSound("concede");
      setFeedback({ msg: "CPU SCORES!", color: "#FF4444" });
      setTimeout(() => setFeedback(null), 1200);
    }, diff.cpuInterval);
    return () => clearInterval(t);
  }, [screen, diff.cpuInterval]);

  const handleAnswer = (selected) => {
    if (!canAnswer) return;
    setCanAnswer(false);
    if (selected === question.a) {
      setStreak(s => s + 1);
      if (phase < 3) {
        setPhase(p => p + 1);
        playSound("advance");
        setFeedback({ msg: "ADVANCE!", color: "#4FC3F7" });
        setTimeout(() => { setFeedback(null); loadQuestion(); }, 1000);
      } else {
        const ky = Math.random() > 0.5 ? 20 : 80;
        setKeeperY(ky);
        setBallInGoal(true);
        setPlayerScore(s => s + 1);
        playSound("score");
        setFeedback({ msg: "GOAL!", color: "#FFD700" });
        setTimeout(() => { setFeedback(null); resetAttack(); }, 1800);
      }
    } else {
      setStreak(0);
      setFeedback({ msg: "Wrong! Answer: " + question.a, color: "#FF6666" });
      if (phase > 0) setPhase(p => p - 1);
      setTimeout(() => { setFeedback(null); loadQuestion(); }, 1400);
    }
  };

  const startGame = () => {
    setPlayerScore(0); setCpuScore(0); setTimeLeft(90);
    setPhase(0); setStreak(0); setBallInGoal(false);
    setKeeperY(50); setFeedback(null); setCanAnswer(true);
    const q = generateQuestion(grade);
    setQuestion(q);
    setOptions(shuffle([q.a, ...q.w]));
    setScreen("game");
  };

  const currentPhase = PHASES[phase];
  const urgent = timeLeft <= 10;

  if (screen === "menu") return (
    <div style={{ minHeight: "100vh", background: "#022C22", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", padding: 20 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 60 }}>Soccer Ball</div>
        <div style={{ fontSize: 42, fontWeight: 900, color: "#34D399", letterSpacing: -1, lineHeight: 1 }}>FACTOR FC</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: 3, marginTop: 6 }}>Advance. Shoot. Score.</div>
      </div>
      <div style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, marginBottom: 5 }}>Your Team Name</div>
        <input value={teamName} onChange={e => setTeamName(e.target.value)}
          style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1.5px solid rgba(52,211,153,0.4)", background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15, fontWeight: 700, outline: "none", boxSizing: "border-box", fontFamily: "Nunito, sans-serif" }} />
      </div>
      <div style={{ width: "100%", maxWidth: 320, marginBottom: 14 }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>Grade Level</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[1,2,3,4,5].map(g => (
            <button key={g} onClick={() => setGrade(g)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, border: grade === g ? "2px solid #34D399" : "1px solid rgba(255,255,255,0.1)", background: grade === g ? "rgba(52,211,153,0.12)" : "transparent", color: grade === g ? "#34D399" : "rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              {g}
            </button>
          ))}
        </div>
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 6, textAlign: "center" }}>
          {grade <= 2 ? "x1 to x5" : grade <= 3 ? "x1 to x7" : grade <= 4 ? "x1 to x9" : "x1 to x12"}
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: 320, marginBottom: 24 }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>Difficulty</div>
        <div style={{ display: "flex", gap: 8 }}>
          {Object.entries(DIFFICULTIES).map(([key, val]) => (
            <button key={key} onClick={() => setDifficulty(key)} style={{ flex: 1, padding: "10px 4px", borderRadius: 8, border: difficulty === key ? "2px solid #34D399" : "1px solid rgba(255,255,255,0.1)", background: difficulty === key ? "rgba(52,211,153,0.12)" : "transparent", color: difficulty === key ? "#34D399" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{val.emoji}</div>
              <div>{val.name}</div>
            </button>
          ))}
        </div>
      </div>
      <button onClick={startGame} style={{ width: "100%", maxWidth: 320, padding: 14, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #34D399, #059669)", color: "#022C22", fontSize: 18, fontWeight: 900, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>
        KICK OFF!
      </button>
      <a href="/" style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 16, textDecoration: "none" }}>Back to Gamaroo</a>
    </div>
  );

  if (screen === "result") {
    const won = playerScore > cpuScore;
    const tied = playerScore === cpuScore;
    return (
      <div style={{ minHeight: "100vh", background: won ? "#052e16" : tied ? "#022C22" : "#1A0000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Nunito, sans-serif", padding: 20 }}>
        <div style={{ fontSize: 72, marginBottom: 8 }}>{won ? "Trophy" : tied ? "Handshake" : "Sad"}</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: won ? "#34D399" : tied ? "#aaa" : "#FF4444", marginBottom: 8 }}>
          {won ? "You Win!" : tied ? "Draw!" : "CPU Wins!"}
        </div>
        <div style={{ display: "flex", gap: 24, marginBottom: 28, background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: "18px 32px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#34D399", fontSize: 10 }}>YOU</div>
            <div style={{ color: "#fff", fontSize: 52, fontWeight: 900 }}>{playerScore}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "rgba(255,255,255,0.3)", fontSize: 20 }}>vs</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "rgba(255,100,100,0.8)", fontSize: 10 }}>CPU</div>
            <div style={{ color: "#fff", fontSize: 52, fontWeight: 900 }}>{cpuScore}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, width: "100%", maxWidth: 320 }}>
          <button onClick={startGame} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: "linear-gradient(135deg, #34D399, #059669)", color: "#022C22", fontSize: 16, fontWeight: 900, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Rematch</button>
          <button onClick={() => setScreen("menu")} style={{ flex: 1, padding: 14, borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Nunito, sans-serif" }}>Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", background: "#022C22", display: "flex", flexDirection: "column", fontFamily: "Nunito, sans-serif", overflow: "hidden" }}>
      <div style={{ background: "#011a12", borderBottom: "2px solid rgba(52,211,153,0.3)", padding: "8px 16px", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#34D399", fontSize: 9, letterSpacing: 2 }}>YOU</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{playerScore}</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>{teamName}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: urgent ? "#FF4444" : "#FCD34D", fontSize: urgent ? 24 : 20, fontWeight: 900 }}>
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </div>
          {streak >= 3 && <div style={{ color: "#FCD34D", fontSize: 10, fontWeight: 700 }}>Fire {streak} streak</div>}
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "rgba(255,100,100,0.8)", fontSize: 9, letterSpacing: 2 }}>CPU</div>
          <div style={{ color: "#fff", fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{cpuScore}</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>{diff.cpuName}</div>
        </div>
      </div>

      <div style={{ position: "relative", background: "#15803D", flexShrink: 0, height: 200, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 6, border: "2px solid rgba(255,255,255,0.3)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.3)" }} />
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 70, height: 70, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)" }} />
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 18, height: 90, border: "3px solid rgba(255,255,255,0.9)", borderRight: "none", background: "rgba(255,255,255,0.1)" }} />
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 80, height: 140, border: "2px solid rgba(255,255,255,0.3)", borderRight: "none" }} />

        <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {PHASES.map((_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: i <= phase ? "#FFD700" : "rgba(255,255,255,0.3)", border: "2px solid rgba(255,255,255,0.5)", transition: "background 0.3s" }} />
          ))}
        </div>

        <div style={{ position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
          {currentPhase.label}
        </div>

        <div style={{ position: "absolute", right: 28, top: keeperY + "%", transform: "translateY(-50%)", transition: "top 0.3s ease", width: 48, height: 64 }}>
          <img src="/soccer/Red/characterRed (1).png" alt="keeper"
            style={{ width: "100%", height: "100%", objectFit: "contain", transform: "scaleX(-1)", imageRendering: "pixelated" }}
            onError={(e) => { e.target.style.display = "none"; }} />
        </div>

        <div style={{ position: "absolute", left: currentPhase.shooterX + "%", top: "42%", transform: "translateY(-50%)", transition: "left 0.5s ease", width: 48, height: 64 }}>
          <img src="/soccer/Blue/characterBlue (1).png" alt="shooter"
            style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "pixelated" }}
            onError={(e) => { e.target.style.display = "none"; }} />
        </div>

        <div style={{ position: "absolute", left: ballInGoal ? "92%" : currentPhase.ballX + "%", top: ballInGoal ? (keeperY > 50 ? "30%" : "70%") : "52%", transform: "translateY(-50%)", transition: "all 0.5s ease", width: 22, height: 22, zIndex: 5 }}>
          <img src="/soccer/Elements/element (1).png" alt="ball"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => { e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='9' fill='white' stroke='%23333' stroke-width='1.5'/%3E%3C/svg%3E"; }} />
        </div>

        {feedback && (
          <div style={{ position: "absolute", top: "35%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 28, fontWeight: 900, color: feedback.color, textShadow: "2px 2px 0 #000", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 20 }}>
            {feedback.msg}
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: "#011a12", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#fff", fontSize: 28, fontWeight: 900, marginBottom: 16 }}>
          {question.q} = <span style={{ color: "#34D399" }}>?</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 400, margin: "0 auto", width: "100%" }}>
          {options.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={!canAnswer}
              style={{ padding: "16px", border: "none", borderRadius: 12, fontSize: 22, fontWeight: 900, cursor: canAnswer ? "pointer" : "not-allowed", color: "white", fontFamily: "Nunito, sans-serif", background: ["#3B4BC8", "#10B981", "#F5A623", "#e53e3e"][i], opacity: canAnswer ? 1 : 0.7 }}>
              {opt}
            </button>
          ))}
        </div>
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 12 }}>
          {phase < 3 ? (3 - phase) + " more correct answer" + (3 - phase !== 1 ? "s" : "") + " to shoot!" : "Answer correctly to SCORE!"}
        </div>
      </div>
    </div>
  );
}
ENDOFFILE