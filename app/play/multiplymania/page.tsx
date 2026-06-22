'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const ALL_QUESTIONS = [
  { std: '3.OA.1', text: '3 × 4 means adding 3 four times.', ans: true },
  { std: '3.OA.1', text: '2 × 5 means adding 2 five times.', ans: true },
  { std: '3.OA.1', text: '6 × 3 means adding 6 two times.', ans: false, hint: '6 × 3 means adding 6 three times.' },
  { std: '3.OA.1', text: '4 × 4 = 16', ans: true },
  { std: '3.OA.1', text: '5 × 3 = 20', ans: false, hint: '5 × 3 = 15.' },
  { std: '3.OA.1', text: '7 × 2 means adding 7 two times.', ans: true },
  { std: '3.OA.1', text: '3 × 6 = 18', ans: true },
  { std: '3.OA.1', text: '4 × 5 means adding 4 four times.', ans: false, hint: '4 × 5 means adding 4 five times.' },
  { std: '3.OA.1', text: '8 × 3 = 24', ans: true },
  { std: '3.OA.1', text: '2 × 9 = 16', ans: false, hint: '2 × 9 = 18.' },
  { std: '3.OA.1', text: '5 × 5 = 25', ans: true },
  { std: '3.OA.1', text: '6 × 4 means adding 6 three times.', ans: false, hint: '6 × 4 means adding 6 four times.' },
  { std: '3.OA.1', text: '7 × 3 = 21', ans: true },
  { std: '3.OA.1', text: '9 × 2 = 18', ans: true },
  { std: '3.OA.1', text: '4 × 6 = 20', ans: false, hint: '4 × 6 = 24.' },
];

const ROUND_SIZE = 6;
const VIDEO_ID = '_BI9bvoxz5I';

type Question = typeof ALL_QUESTIONS[0];
type DotState = 'idle' | 'active' | 'correct' | 'wrong';
type Feedback = 'none' | 'correct' | 'wrong';
type Phase = 'splash' | 'intro' | 'game' | 'end';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRound(used: Question[]): { round: Question[]; newUsed: Question[] } {
  const available = ALL_QUESTIONS.filter(q => !used.includes(q));
  const pool = available.length >= ROUND_SIZE ? available : ALL_QUESTIONS;
  const freshUsed = pool === ALL_QUESTIONS ? [] : used;
  const round = shuffle(pool).slice(0, ROUND_SIZE);
  return { round, newUsed: [...freshUsed, ...round] };
}

export default function MultiplyManiaPage() {
  const [phase, setPhase] = useState<Phase>('splash');
  const [visualStep, setVisualStep] = useState(0);
  const [showEquation, setShowEquation] = useState(false);
  const [showPlayBtn, setShowPlayBtn] = useState(false);
  const [dotsVisible, setDotsVisible] = useState<boolean[][]>([]);

  const [used, setUsed] = useState<Question[]>([]);
  const [queue, setQueue] = useState<Question[]>([]);
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [dots, setDots] = useState<DotState[]>([]);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [hint, setHint] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const captions = [
    'Watch Roo explain multiplication!',
    '3 times 4 means 3 groups of 4 — see the groups forming!',
    'Count all the dots — 4 + 4 + 4 = 12. So 3 × 4 = 12!',
    "Got it? Let's play!",
  ];

  // Splash → intro
  useEffect(() => {
    const t = setTimeout(() => setPhase('intro'), 2800);
    return () => clearTimeout(t);
  }, []);

  // Auto-advance visual steps
  useEffect(() => {
    if (phase !== 'intro') return;
    const timings = [6000, 6000, 6000];
    let step = 0;
    const advance = () => {
      step++;
      setVisualStep(step);
      if (step === 1) {
        // animate dots
        const grid: boolean[][] = Array(3).fill(null).map(() => Array(4).fill(false));
        setDotsVisible(grid);
        let delay = 0;
        for (let g = 0; g < 3; g++) {
          for (let d = 0; d < 4; d++) {
            const gg = g, dd = d;
            setTimeout(() => {
              setDotsVisible(prev => {
                const next = prev.map(r => [...r]);
                if (next[gg]) next[gg][dd] = true;
                return next;
              });
            }, delay);
            delay += 60;
          }
        }
      }
      if (step === 2) {
        setDotsVisible(Array(3).fill(null).map(() => Array(4).fill(true)));
        setTimeout(() => setShowEquation(true), 600);
      }
      if (step === 3) setShowPlayBtn(true);
    };
    const timeouts = timings.map((t, i) => setTimeout(advance, timings.slice(0, i + 1).reduce((a, b) => a + b, 0)));
    return () => timeouts.forEach(clearTimeout);
  }, [phase]);

  const initRound = useCallback((currentUsed: Question[]) => {
    const { round, newUsed } = pickRound(currentUsed);
    setUsed(newUsed);
    setQueue(round);
    setCur(0);
    setScore(0);
    setLocked(false);
    setFeedback('none');
    setGameOver(false);
    setDots(round.map((_, i) => (i === 0 ? 'active' : 'idle')));
  }, []);

  function startGame() {
    initRound([]);
    setPhase('game');
  }

  const currentQ = queue[cur];

  function answer(userAnswer: boolean) {
    if (locked || !currentQ) return;
    setLocked(true);
    const ok = userAnswer === currentQ.ans;
    const newDots = [...dots];
    newDots[cur] = ok ? 'correct' : 'wrong';
    setDots(newDots);
    if (ok) {
      setScore(s => s + 1);
      setFeedback('correct');
      setTimeout(() => advance(newDots), 1500);
    } else {
      setHint(currentQ.hint || (currentQ.ans ? 'The statement is actually true!' : 'The statement is actually false!'));
      setFeedback('wrong');
    }
  }

  function advance(currentDots: DotState[]) {
    const next = cur + 1;
    if (next >= ROUND_SIZE) { setGameOver(true); setPhase('end'); return; }
    const newDots = [...currentDots];
    newDots[next] = 'active';
    setDots(newDots);
    setCur(next);
    setFeedback('none');
    setLocked(false);
  }

  function gotIt() { advance([...dots]); }

  const pct = score / ROUND_SIZE;
  const endIcon = pct === 1 ? '🏆' : pct >= 0.7 ? '🌟' : '💪';
  const endTitle = pct === 1 ? 'Perfect Score!' : pct >= 0.7 ? 'Great job!' : 'Nice try!';

  return (
    <>
      <style>{`
        .mm-shell { display:flex; flex-direction:column; align-items:center; background:#4C1D95; min-height:100vh; font-family:'Nunito',sans-serif; color:white; }

        /* SPLASH */
        .mm-splash { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
        .mm-splash-emoji { font-size:80px; animation:mmBounce 0.6s ease; }
        .mm-splash-name { font-size:40px; font-weight:900; color:#FBBF24; margin-top:12px; animation:mmFadeUp 0.5s 0.3s both; }
        .mm-splash-std { font-size:15px; color:rgba(255,255,255,0.6); margin-top:6px; font-weight:700; animation:mmFadeUp 0.5s 0.5s both; }
        .mm-splash-bar-wrap { width:160px; height:6px; background:rgba(255,255,255,0.15); border-radius:3px; margin-top:24px; overflow:hidden; animation:mmFadeUp 0.5s 0.7s both; }
        .mm-splash-bar { height:100%; background:#FBBF24; border-radius:3px; animation:mmFill 2.5s linear forwards; }

        /* INTRO */
        .mm-intro { display:flex; flex-direction:column; align-items:center; padding:24px 20px 28px; width:100%; }
        .mm-intro-title { font-size:12px; font-weight:900; color:#FBBF24; text-transform:uppercase; letter-spacing:2px; margin-bottom:4px; }
        .mm-intro-game { font-size:28px; font-weight:900; color:white; margin-bottom:16px; }
        .mm-split { display:grid; grid-template-columns:1fr 1fr; gap:14px; width:100%; max-width:620px; margin-bottom:16px; }
        .mm-roo-side { background:rgba(0,0,0,0.3); border-radius:20px; overflow:hidden; position:relative; aspect-ratio:9/16; max-height:280px; }
        .mm-roo-side iframe { width:100%; height:100%; border:none; }
        .mm-visual-side { background:white; border-radius:20px; padding:16px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .mm-vs-label { font-size:11px; font-weight:800; color:#9CA3AF; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
        .mm-vs-text { font-size:15px; font-weight:900; color:#1e1e6e; margin-bottom:12px; text-align:center; line-height:1.3; }
        .mm-dot-grid { display:flex; gap:8px; justify-content:center; margin-bottom:10px; }
        .mm-dot-group { display:flex; flex-direction:column; align-items:center; gap:3px; }
        .mm-dot-row { display:flex; gap:4px; }
        .mm-dot { width:12px; height:12px; border-radius:50%; background:#FBBF24; opacity:0; transform:scale(0); transition:all 0.25s; }
        .mm-dot.show { opacity:1; transform:scale(1); }
        .mm-dot-glabel { font-size:9px; font-weight:700; color:#9CA3AF; }
        .mm-equation { font-size:22px; font-weight:900; color:#4C1D95; opacity:0; transition:opacity 0.5s; margin-top:6px; }
        .mm-equation.show { opacity:1; }
        .mm-caption-strip { background:rgba(255,255,255,0.1); border-radius:12px; padding:10px 14px; width:100%; max-width:620px; min-height:44px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
        .mm-caption-text { font-size:14px; font-weight:700; color:white; text-align:center; line-height:1.4; }
        .mm-progress-dots { display:flex; gap:8px; margin-bottom:14px; }
        .mm-pdot { width:9px; height:9px; border-radius:50%; background:rgba(255,255,255,0.2); transition:background 0.3s; }
        .mm-pdot.active { background:#FBBF24; }
        .mm-play-btn { background:#FBBF24; color:#1C1C6E; border:none; border-radius:12px; font-family:'Nunito',sans-serif; font-size:17px; font-weight:900; padding:13px 36px; cursor:pointer; box-shadow:0 4px 0 #D97706; transition:transform 0.1s,box-shadow 0.1s,opacity 0.3s; opacity:0; pointer-events:none; }
        .mm-play-btn.show { opacity:1; pointer-events:all; }
        .mm-play-btn:hover { transform:translateY(-2px); box-shadow:0 6px 0 #D97706; }

        /* GAME */
        .mm-game { display:flex; flex-direction:column; align-items:center; padding:28px 20px 32px; width:100%; }
        .mm-header { display:flex; align-items:center; justify-content:space-between; width:100%; max-width:560px; margin-bottom:22px; }
        .mm-pill { background:rgba(255,255,255,0.12); color:#FBBF24; font-size:11px; font-weight:900; padding:5px 14px; border-radius:20px; letter-spacing:1px; text-transform:uppercase; border:1px solid rgba(255,255,255,0.15); }
        .mm-game-title { font-size:18px; font-weight:900; color:white; }
        .mm-score-box { display:flex; align-items:center; gap:6px; background:rgba(255,255,255,0.12); border-radius:20px; padding:6px 14px; border:1px solid rgba(255,255,255,0.15); font-size:18px; font-weight:900; }
        .mm-progress-row { display:flex; gap:6px; margin-bottom:20px; }
        .mm-dot-prog { width:30px; height:8px; border-radius:4px; background:rgba(255,255,255,0.2); transition:background 0.3s; }
        .mm-dot-prog.active { background:#FBBF24; } .mm-dot-prog.correct { background:#22C55E; } .mm-dot-prog.wrong { background:#EF4444; }
        .mm-card { background:white; border-radius:24px; padding:36px 28px 28px; max-width:560px; width:100%; text-align:center; margin-bottom:20px; position:relative; box-shadow:0 6px 0 rgba(0,0,0,0.2); min-height:220px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .mm-badge { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:#FBBF24; color:#1C1C6E; font-size:11px; font-weight:900; padding:5px 18px; border-radius:20px; white-space:nowrap; text-transform:uppercase; letter-spacing:0.5px; }
        .mm-standard { font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:1px; margin-bottom:14px; }
        .mm-question { font-size:24px; font-weight:900; line-height:1.35; color:#1e1e6e; }
        .mm-feedback { position:absolute; inset:0; border-radius:23px; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px; }
        .mm-feedback.correct { background:rgba(22,163,74,0.93); } .mm-feedback.wrong { background:rgba(185,28,28,0.9); }
        .mm-feedback-icon { font-size:48px; margin-bottom:6px; } .mm-feedback-label { font-size:24px; font-weight:900; color:white; }
        .mm-feedback-hint { font-size:14px; font-weight:700; margin-top:6px; opacity:0.95; padding:0 12px; line-height:1.4; text-align:center; color:white; }
        .mm-got-it { margin-top:16px; background:#FBBF24; color:#1C1C6E; border:none; border-radius:12px; font-family:'Nunito',sans-serif; font-size:15px; font-weight:900; padding:11px 28px; cursor:pointer; box-shadow:0 4px 0 #D97706; }
        .mm-btn-row { display:flex; gap:14px; max-width:560px; width:100%; }
        .mm-btn { flex:1; padding:22px 16px; border-radius:20px; border:none; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:4px; font-family:'Nunito',sans-serif; font-weight:900; transition:transform 0.1s,box-shadow 0.1s; }
        .mm-btn .icon { font-size:36px; line-height:1; } .mm-btn .word { font-size:24px; } .mm-btn .sub { font-size:12px; font-weight:700; opacity:0.7; }
        .mm-btn.true-btn { background:#22C55E; color:#052e16; box-shadow:0 5px 0 #15803D; }
        .mm-btn.false-btn { background:#EF4444; color:#450a0a; box-shadow:0 5px 0 #B91C1C; }
        .mm-btn.true-btn:hover { transform:translateY(-3px); box-shadow:0 8px 0 #15803D; }
        .mm-btn.false-btn:hover { transform:translateY(-3px); box-shadow:0 8px 0 #B91C1C; }

        /* END */
        .mm-end { display:flex; flex-direction:column; align-items:center; text-align:center; background:white; border-radius:24px; padding:40px 28px; max-width:560px; width:100%; box-shadow:0 6px 0 rgba(0,0,0,0.2); margin:28px 20px; }
        .mm-end-trophy { font-size:64px; margin-bottom:12px; }
        .mm-end-title { font-size:30px; font-weight:900; color:#1e1e6e; margin-bottom:8px; }
        .mm-end-sub { font-size:16px; color:#6B7280; margin-bottom:24px; }
        .mm-replay { background:#FBBF24; color:#1C1C6E; border:none; border-radius:14px; font-family:'Nunito',sans-serif; font-size:18px; font-weight:900; padding:14px 36px; cursor:pointer; box-shadow:0 4px 0 #D97706; transition:transform 0.1s,box-shadow 0.1s; }
        .mm-replay:hover { transform:translateY(-2px); box-shadow:0 6px 0 #D97706; }

        @keyframes mmBounce { 0% { transform:scale(0);opacity:0; } 70% { transform:scale(1.1); } 100% { transform:scale(1);opacity:1; } }
        @keyframes mmFadeUp { from { opacity:0;transform:translateY(12px); } to { opacity:1;transform:translateY(0); } }
        @keyframes mmFill { from { width:0; } to { width:100%; } }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet" />

      <div className="mm-shell">

        {/* SPLASH */}
        {phase === 'splash' && (
          <div className="mm-splash">
            <div className="mm-splash-emoji">✖️</div>
            <div className="mm-splash-name">Multiply Mania</div>
            <div className="mm-splash-std">Standard 3.OA.1</div>
            <div className="mm-splash-bar-wrap"><div className="mm-splash-bar" /></div>
          </div>
        )}

        {/* INTRO */}
        {phase === 'intro' && (
          <div className="mm-intro">
            <div className="mm-intro-title">Quick Lesson</div>
            <div className="mm-intro-game">Multiply Mania</div>

            <div className="mm-split">
              <div className="mm-roo-side">
                <iframe
                  src={`https://www.youtube.com/embed/${VIDEO_ID}?autoplay=1&mute=0&controls=0&loop=1&playlist=${VIDEO_ID}&modestbranding=1&rel=0`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              </div>

              <div className="mm-visual-side">
                {visualStep === 0 && (
                  <>
                    <div className="mm-vs-label">Multiplication means</div>
                    <div className="mm-vs-text">Making equal groups!</div>
                    <div style={{ fontSize: 40, margin: '8px 0' }}>👐</div>
                    <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 700, textAlign: 'center' }}>Each group has the same number of things</div>
                  </>
                )}
                {visualStep === 1 && (
                  <>
                    <div className="mm-vs-label">3 × 4 means</div>
                    <div className="mm-vs-text">3 groups of 4</div>
                    <div className="mm-dot-grid">
                      {[0, 1, 2].map(g => (
                        <div key={g} className="mm-dot-group">
                          <div className="mm-dot-row">
                            {[0, 1, 2, 3].map(d => (
                              <div key={d} className={`mm-dot${dotsVisible[g]?.[d] ? ' show' : ''}`} />
                            ))}
                          </div>
                          <div className="mm-dot-glabel">group {g + 1}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {visualStep === 2 && (
                  <>
                    <div className="mm-vs-label">Count them all</div>
                    <div className="mm-vs-text">4 + 4 + 4 = ?</div>
                    <div className="mm-dot-grid">
                      {[0, 1, 2].map(g => (
                        <div key={g} className="mm-dot-group">
                          <div className="mm-dot-row">
                            {[0, 1, 2, 3].map(d => (
                              <div key={d} className="mm-dot show" />
                            ))}
                          </div>
                          <div className="mm-dot-glabel">group {g + 1}</div>
                        </div>
                      ))}
                    </div>
                    <div className={`mm-equation${showEquation ? ' show' : ''}`}>3 × 4 = 12 ✓</div>
                  </>
                )}
                {visualStep === 3 && (
                  <>
                    <div className="mm-vs-label">Now your turn!</div>
                    <div className="mm-vs-text">True or False?</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <div style={{ background: '#22C55E', color: 'white', borderRadius: 10, padding: '8px 14px', fontWeight: 900, fontSize: 14 }}>✅ True</div>
                      <div style={{ background: '#EF4444', color: 'white', borderRadius: 10, padding: '8px 14px', fontWeight: 900, fontSize: 14 }}>❌ False</div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="mm-caption-strip">
              <div className="mm-caption-text">{captions[visualStep]}</div>
            </div>

            <div className="mm-progress-dots">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className={`mm-pdot${visualStep === i ? ' active' : ''}`} />
              ))}
            </div>

            <button className={`mm-play-btn${showPlayBtn ? ' show' : ''}`} onClick={startGame}>
              Let's Play! 🦘
            </button>
          </div>
        )}

        {/* GAME */}
        {phase === 'game' && currentQ && (
          <div className="mm-game">
            <div className="mm-header">
              <div className="mm-pill">{currentQ.std}</div>
              <div className="mm-game-title">Multiply Mania</div>
              <div className="mm-score-box"><span>⭐</span><span>{score}</span></div>
            </div>
            <div className="mm-progress-row">
              {dots.map((s, i) => <div key={i} className={`mm-dot-prog ${s}`} />)}
            </div>
            <div className="mm-card">
              <div className="mm-badge">Question {cur + 1} of {ROUND_SIZE}</div>
              <div className="mm-standard">Standard {currentQ.std}</div>
              <div className="mm-question">{currentQ.text}</div>
              {feedback === 'correct' && (
                <div className="mm-feedback correct">
                  <div className="mm-feedback-icon">🎉</div>
                  <div className="mm-feedback-label">That's right!</div>
                  <div className="mm-feedback-hint">Nice work!</div>
                </div>
              )}
              {feedback === 'wrong' && (
                <div className="mm-feedback wrong">
                  <div className="mm-feedback-icon">🤔</div>
                  <div className="mm-feedback-label">Not quite!</div>
                  <div className="mm-feedback-hint">{hint}</div>
                  <button className="mm-got-it" onClick={gotIt}>Got it! →</button>
                </div>
              )}
            </div>
            <div className="mm-btn-row">
              <button className="mm-btn true-btn" onClick={() => answer(true)}>
                <span className="icon">✅</span><span className="word">True</span><span className="sub">Yep, that's right!</span>
              </button>
              <button className="mm-btn false-btn" onClick={() => answer(false)}>
                <span className="icon">❌</span><span className="word">False</span><span className="sub">Nope, not right!</span>
              </button>
            </div>
          </div>
        )}

        {/* END */}
        {phase === 'end' && (
          <div className="mm-end">
            <div className="mm-end-trophy">{endIcon}</div>
            <div className="mm-end-title">{endTitle}</div>
            <div className="mm-end-sub">You got {score} out of {ROUND_SIZE} right!</div>
            <button className="mm-replay" onClick={() => { setPhase('splash'); setTimeout(() => setPhase('intro'), 2800); initRound(used); }}>
              Play Again ↺
            </button>
          </div>
        )}

      </div>
    </>
  );
}
