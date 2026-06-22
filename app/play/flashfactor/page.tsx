'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const ALL_QUESTIONS = [
  { std: '3.OA.7', text: '6 × 7 = ?', ans: '42', choices: ['36', '42', '48', '54'] },
  { std: '3.OA.7', text: '8 × 7 = ?', ans: '56', choices: ['48', '54', '56', '64'] },
  { std: '3.OA.7', text: '9 × 6 = ?', ans: '54', choices: ['45', '52', '54', '63'] },
  { std: '3.OA.7', text: '7 × 7 = ?', ans: '49', choices: ['42', '47', '49', '56'] },
  { std: '3.OA.7', text: '8 × 9 = ?', ans: '72', choices: ['63', '70', '72', '81'] },
  { std: '3.OA.7', text: '6 × 8 = ?', ans: '48', choices: ['40', '42', '48', '54'] },
  { std: '3.OA.7', text: '7 × 9 = ?', ans: '63', choices: ['54', '56', '63', '72'] },
  { std: '3.OA.7', text: '9 × 9 = ?', ans: '81', choices: ['72', '78', '81', '90'] },
  { std: '3.OA.7', text: '6 × 6 = ?', ans: '36', choices: ['30', '36', '42', '48'] },
  { std: '3.OA.7', text: '8 × 8 = ?', ans: '64', choices: ['56', '60', '64', '72'] },
  { std: '3.OA.7', text: '63 ÷ 9 = ?', ans: '7', choices: ['6', '7', '8', '9'] },
  { std: '3.OA.7', text: '72 ÷ 8 = ?', ans: '9', choices: ['7', '8', '9', '10'] },
  { std: '3.OA.7', text: '81 ÷ 9 = ?', ans: '9', choices: ['7', '8', '9', '10'] },
  { std: '3.OA.7', text: '48 ÷ 6 = ?', ans: '8', choices: ['6', '7', '8', '9'] },
  { std: '3.OA.7', text: '56 ÷ 7 = ?', ans: '8', choices: ['6', '7', '8', '9'] },
  { std: '3.OA.7', text: '54 ÷ 6 = ?', ans: '9', choices: ['7', '8', '9', '10'] },
  { std: '3.OA.7', text: '64 ÷ 8 = ?', ans: '8', choices: ['6', '7', '8', '9'] },
  { std: '3.OA.7', text: '42 ÷ 7 = ?', ans: '6', choices: ['5', '6', '7', '8'] },
  { std: '3.OA.7', text: '36 ÷ 6 = ?', ans: '6', choices: ['4', '5', '6', '7'] },
  { std: '3.OA.7', text: '49 ÷ 7 = ?', ans: '7', choices: ['5', '6', '7', '8'] },
];

const TOTAL_TIME = 60;

type Question = typeof ALL_QUESTIONS[0];
type Phase = 'start' | 'playing' | 'end';
type ChoiceState = 'idle' | 'correct' | 'wrong' | 'locked' | 'reveal';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashFactorPage() {
  const [phase, setPhase] = useState<Phase>('start');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const [choiceStates, setChoiceStates] = useState<ChoiceState[]>(['idle', 'idle', 'idle', 'idle']);
  const [locked, setLocked] = useState(false);
  const [wrongItems, setWrongItems] = useState<{ q: string; ans: string }[]>([]);

  const usedRef = useRef<Question[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const scoreRef = useRef(0);
  const answeredRef = useRef(0);
  const bestStreakRef = useRef(0);
  const wrongItemsRef = useRef<{ q: string; ans: string }[]>([]);

  const getQuestion = useCallback((): Question => {
    const available = ALL_QUESTIONS.filter(q => !usedRef.current.includes(q));
    const pool = available.length > 0 ? available : ALL_QUESTIONS;
    if (pool === ALL_QUESTIONS) usedRef.current = [];
    const q = shuffle(pool)[0];
    usedRef.current.push(q);
    return q;
  }, []);

  const loadQuestion = useCallback(() => {
    const q = getQuestion();
    const choices = shuffle(q.choices);
    setCurrentQ(q);
    setShuffledChoices(choices);
    setChoiceStates(['idle', 'idle', 'idle', 'idle']);
    setLocked(false);
    setAnswered(prev => prev + 1);
    answeredRef.current += 1;
  }, [getQuestion]);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setWrongItems([...wrongItemsRef.current]);
    setScore(scoreRef.current);
    setAnswered(answeredRef.current - 1);
    setBestStreak(bestStreakRef.current);
    setPhase('end');
  }, []);

  const startGame = useCallback(() => {
    scoreRef.current = 0;
    answeredRef.current = 0;
    bestStreakRef.current = 0;
    wrongItemsRef.current = [];
    usedRef.current = [];
    setScore(0);
    setAnswered(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(TOTAL_TIME);
    setWrongItems([]);
    setPhase('playing');
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      loadQuestion();
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { endGame(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  function selectAnswer(choice: string, idx: number) {
    if (locked || !currentQ) return;
    setLocked(true);
    const correct = choice === currentQ.ans;
    const correctIdx = shuffledChoices.indexOf(currentQ.ans);

    if (correct) {
      const next: ChoiceState[] = ['idle', 'idle', 'idle', 'idle'];
      next[idx] = 'correct';
      setChoiceStates(next);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setStreak(prev => {
        const s = prev + 1;
        if (s > bestStreakRef.current) bestStreakRef.current = s;
        return s;
      });
      setTimeout(() => loadQuestion(), 500);
    } else {
      const next: ChoiceState[] = shuffledChoices.map((_, i) => i === idx ? 'wrong' : 'locked');
      setChoiceStates(next);
      setStreak(0);
      wrongItemsRef.current.push({ q: currentQ.text, ans: currentQ.ans });
      setTimeout(() => {
        setChoiceStates(prev => prev.map((s, i) => i === correctIdx ? 'reveal' : s));
        setTimeout(() => loadQuestion(), 900);
      }, 400);
    }
  }

  const pct = answered > 0 ? score / answered : 0;
  const endIcon = pct >= 0.8 ? '🏆' : pct >= 0.6 ? '🌟' : '💪';
  const endTitle = pct >= 0.8 ? 'Awesome job!' : pct >= 0.6 ? 'Great effort!' : 'Nice try!';
  const timerPct = (timeLeft / TOTAL_TIME) * 100;
  const urgent = timeLeft <= 10;

  return (
    <>
      <style>{`
        .qf-shell { display:flex; flex-direction:column; align-items:center; padding:28px 20px 32px; background:#3B3BC0; min-height:100vh; font-family:'Nunito',sans-serif; color:white; }
        .qf-card { background:white; border-radius:24px; padding:40px 28px; max-width:560px; width:100%; box-shadow:0 6px 0 rgba(0,0,0,0.2); display:flex; flex-direction:column; align-items:center; text-align:center; }
        .qf-icon { font-size:64px; margin-bottom:12px; }
        .qf-card-title { font-size:30px; font-weight:900; color:#1e1e6e; margin-bottom:8px; }
        .qf-card-sub { font-size:15px; color:#6B7280; margin-bottom:24px; line-height:1.5; }
        .qf-card-sub strong { color:#1e1e6e; }
        .qf-btn { background:#FBBF24; color:#1C1C6E; border:none; border-radius:14px; font-family:'Nunito',sans-serif; font-size:18px; font-weight:900; padding:14px 36px; cursor:pointer; box-shadow:0 4px 0 #D97706; transition:transform 0.1s,box-shadow 0.1s; }
        .qf-btn:hover { transform:translateY(-2px); box-shadow:0 6px 0 #D97706; }
        .qf-btn:active { transform:translateY(3px); box-shadow:none; }
        .qf-header { display:flex; align-items:center; justify-content:space-between; width:100%; max-width:560px; margin-bottom:20px; }
        .qf-title { font-size:18px; font-weight:900; }
        .qf-score { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); border-radius:20px; padding:6px 14px; border:1px solid rgba(255,255,255,0.15); font-size:18px; font-weight:900; }
        .qf-timer-row { width:100%; max-width:560px; margin-bottom:16px; }
        .qf-timer-label { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
        .qf-timer-text { font-size:13px; font-weight:700; opacity:0.8; }
        .qf-timer-num { font-size:22px; font-weight:900; color:#FBBF24; transition:color 0.3s; }
        .qf-timer-num.urgent { color:#EF4444; }
        .qf-bar-bg { background:rgba(255,255,255,0.2); border-radius:8px; height:14px; overflow:hidden; }
        .qf-bar { height:14px; border-radius:8px; background:#FBBF24; transition:width 1s linear,background 0.5s; }
        .qf-bar.urgent { background:#EF4444; }
        .qf-q-card { background:white; border-radius:24px; padding:32px 28px 24px; max-width:560px; width:100%; text-align:center; margin-bottom:16px; position:relative; box-shadow:0 6px 0 rgba(0,0,0,0.2); min-height:120px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .qf-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:#FBBF24; color:#1C1C6E; font-size:11px; font-weight:900; padding:5px 18px; border-radius:20px; white-space:nowrap; text-transform:uppercase; letter-spacing:0.5px; }
        .qf-std { font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
        .qf-q-text { font-size:28px; font-weight:900; line-height:1.35; color:#1e1e6e; }
        .qf-choices { display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:560px; width:100%; }
        .qf-choice { background:rgba(255,255,255,0.12); border:2px solid rgba(255,255,255,0.25); border-radius:16px; padding:18px 12px; color:white; font-family:'Nunito',sans-serif; font-size:20px; font-weight:900; cursor:pointer; transition:background 0.15s,border-color 0.15s,transform 0.1s; display:flex; align-items:center; justify-content:center; gap:10px; }
        .qf-choice:hover:not(:disabled) { background:rgba(255,255,255,0.22); border-color:rgba(255,255,255,0.5); transform:translateY(-2px); }
        .qf-choice:active:not(:disabled) { transform:translateY(2px); }
        .qf-choice.correct { background:#22C55E !important; border-color:#15803D !important; transform:scale(1.03); }
        .qf-choice.wrong   { background:#EF4444 !important; border-color:#B91C1C !important; }
        .qf-choice.reveal  { background:#22C55E !important; border-color:#15803D !important; }
        .qf-choice.locked  { opacity:0.4; pointer-events:none; }
        .qf-choice:disabled { pointer-events:none; }
        .qf-choice-label { background:rgba(255,255,255,0.2); border-radius:8px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:900; flex-shrink:0; }
        .qf-streak-row { width:100%; max-width:560px; display:flex; align-items:center; gap:8px; margin-top:14px; }
        .qf-streak-label { font-size:12px; font-weight:700; opacity:0.6; text-transform:uppercase; letter-spacing:1px; }
        .qf-streak-val { font-size:16px; font-weight:900; color:#FBBF24; }
        .qf-end-sub { font-size:16px; color:#6B7280; margin-bottom:4px; }
        .qf-end-best { font-size:13px; color:#9CA3AF; margin-bottom:20px; }
        .qf-review-title { font-size:13px; font-weight:900; color:#EF4444; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; text-align:left; width:100%; }
        .qf-review-item { background:#FEF2F2; border-radius:12px; padding:12px 14px; margin-bottom:8px; width:100%; text-align:left; }
        .qf-review-q { font-size:14px; font-weight:700; color:#1e1e6e; margin-bottom:4px; }
        .qf-review-a { font-size:13px; color:#15803D; font-weight:700; }
        .qf-all-correct { text-align:center; color:#15803D; font-weight:900; font-size:15px; margin-bottom:16px; width:100%; }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />

      <div className="qf-shell">
        {phase === 'start' && (
          <div className="qf-card">
            <div className="qf-icon">⚡</div>
            <div className="qf-card-title">Flash Factor</div>
            <div className="qf-card-sub">
              How fast do you know your facts? Answer as many as you can in <strong>60 seconds</strong>!
            </div>
            <button className="qf-btn" onClick={startGame}>Let's Go! →</button>
          </div>
        )}

        {phase === 'playing' && currentQ && (
          <>
            <div className="qf-header">
              <div className="qf-title">⚡ Flash Factor</div>
              <div className="qf-score"><span>⭐</span><span>{score}</span></div>
            </div>
            <div className="qf-timer-row">
              <div className="qf-timer-label">
                <span className="qf-timer-text">Time left</span>
                <span className={`qf-timer-num${urgent ? ' urgent' : ''}`}>{timeLeft}</span>
              </div>
              <div className="qf-bar-bg">
                <div className={`qf-bar${urgent ? ' urgent' : ''}`} style={{ width: `${timerPct}%` }} />
              </div>
            </div>
            <div className="qf-q-card">
              <div className="qf-badge">Question {answered}</div>
              <div className="qf-std">Standard {currentQ.std}</div>
              <div className="qf-q-text">{currentQ.text}</div>
            </div>
            <div className="qf-choices">
              {shuffledChoices.map((c, i) => (
                <button
                  key={i}
                  className={`qf-choice ${choiceStates[i]}`}
                  onClick={() => selectAnswer(c, i)}
                  disabled={locked}
                >
                  <span className="qf-choice-label">{['A','B','C','D'][i]}</span>
                  {c}
                </button>
              ))}
            </div>
            <div className="qf-streak-row">
              <span className="qf-streak-label">Streak</span>
              <span className="qf-streak-val">🔥 {streak}</span>
            </div>
          </>
        )}

        {phase === 'end' && (
          <div className="qf-card">
            <div className="qf-icon">{endIcon}</div>
            <div className="qf-card-title">{endTitle}</div>
            <div className="qf-end-sub">You answered {answered} questions!</div>
            <div className="qf-end-best">{score} correct · Best streak: {bestStreak}</div>
            {wrongItems.length > 0 ? (
              <>
                <div className="qf-review-title">❌ Review these ({wrongItems.length})</div>
                {wrongItems.map((w, i) => (
                  <div key={i} className="qf-review-item">
                    <div className="qf-review-q">{w.q}</div>
                    <div className="qf-review-a">✓ Answer: {w.ans}</div>
                  </div>
                ))}
              </>
            ) : (
              <div className="qf-all-correct">🎉 You got everything right!</div>
            )}
            <button className="qf-btn" onClick={startGame}>Play Again ↺</button>
          </div>
        )}
      </div>
    </>
  );
}
