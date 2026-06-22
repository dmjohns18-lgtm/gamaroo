'use client';

import { useState, useEffect, useCallback } from 'react';

const ALL_QUESTIONS = [
  { std: '3.OA.1', text: '3 × 4 means adding 3 four times.', ans: true },
  { std: '3.OA.1', text: '2 × 5 means adding 2 five times.', ans: true },
  { std: '3.OA.1', text: '6 × 3 means adding 6 two times.', ans: false, hint: '6 × 3 means adding 6 three times.' },
  { std: '3.OA.1', text: '4 × 4 = 16', ans: true },
  { std: '3.OA.2', text: '15 ÷ 3 = 6', ans: false, hint: '15 ÷ 3 = 5. Try counting by 3s!' },
  { std: '3.OA.2', text: '24 ÷ 4 = 6', ans: true },
  { std: '3.OA.2', text: '18 ÷ 6 = 4', ans: false, hint: '18 ÷ 6 = 3. How many groups of 6 fit in 18?' },
  { std: '3.OA.2', text: '20 ÷ 5 = 4', ans: true },
  { std: '3.OA.5', text: '5 × 7 is the same as 7 × 5.', ans: true },
  { std: '3.OA.5', text: '9 × 3 is the same as 3 × 9.', ans: true },
  { std: '3.OA.5', text: '(2 × 3) × 4 = 2 × (3 × 4)', ans: true },
  { std: '3.OA.5', text: '6 × 0 = 6', ans: false, hint: 'Any number × 0 always equals 0.' },
  { std: '3.NF.3', text: '½ and 2/4 are the same amount.', ans: true },
  { std: '3.NF.3', text: '1/3 is greater than 1/2.', ans: false, hint: 'Bigger denominator = smaller piece. 1/2 is bigger!' },
  { std: '3.NF.3', text: '2/4 and 3/6 are equivalent fractions.', ans: true },
  { std: '3.NF.3', text: '3/3 equals 1 whole.', ans: true },
  { std: '3.MD.5', text: 'A square with sides of 4 cm has an area of 12 sq cm.', ans: false, hint: 'Area = side × side. 4 × 4 = 16 sq cm.' },
  { std: '3.MD.5', text: 'Area is measured in square units.', ans: true },
  { std: '3.MD.5', text: 'A rectangle 5 cm long and 3 cm wide has an area of 15 sq cm.', ans: true },
  { std: '3.MD.5', text: 'A unit square has an area of 2 square units.', ans: false, hint: 'A unit square covers exactly 1 square unit — not 2!' },
  { std: '3.G.2', text: 'A quadrilateral always has exactly 4 sides.', ans: true },
  { std: '3.G.2', text: 'All rectangles are squares.', ans: false, hint: "Squares are rectangles, but rectangles don't have to have equal sides." },
  { std: '3.G.2', text: 'A shape can be divided into equal parts that are different sizes.', ans: false, hint: 'Equal parts must all be the same size.' },
  { std: '3.G.2', text: 'A hexagon has 6 sides.', ans: true },
];

const ROUND_SIZE = 6;

type Question = typeof ALL_QUESTIONS[0];
type DotState = 'idle' | 'active' | 'correct' | 'wrong';
type Feedback = 'none' | 'correct' | 'wrong';

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

export default function TrueFalsePage() {
  const [used, setUsed] = useState<Question[]>([]);
  const [queue, setQueue] = useState<Question[]>([]);
  const [cur, setCur] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [dots, setDots] = useState<DotState[]>([]);
  const [feedback, setFeedback] = useState<Feedback>('none');
  const [hint, setHint] = useState('');
  const [gameOver, setGameOver] = useState(false);

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

  useEffect(() => {
    initRound([]);
  }, []);

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
    if (next >= ROUND_SIZE) {
      setGameOver(true);
      return;
    }
    const newDots = [...currentDots];
    newDots[next] = 'active';
    setDots(newDots);
    setCur(next);
    setFeedback('none');
    setLocked(false);
  }

  function gotIt() {
    const newDots = [...dots];
    advance(newDots);
  }

  const pct = score / ROUND_SIZE;
  const endIcon = pct === 1 ? '🏆' : pct >= 0.7 ? '🌟' : '💪';
  const endTitle = pct === 1 ? 'Perfect Score!' : pct >= 0.7 ? 'Great job!' : 'Nice try!';

  return (
    <>
      <style>{`
        .tf-shell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 20px 32px;
          background: #3B3BC0;
          min-height: 100vh;
          font-family: 'Nunito', sans-serif;
          color: white;
        }
        .tf-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 560px;
          margin-bottom: 22px;
        }
        .tf-pill {
          background: rgba(255,255,255,0.12);
          color: #FBBF24;
          font-size: 11px;
          font-weight: 900;
          padding: 5px 14px;
          border-radius: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.15);
        }
        .tf-game-title {
          font-size: 18px;
          font-weight: 900;
          color: white;
        }
        .tf-score-box {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 6px 14px;
          border: 1px solid rgba(255,255,255,0.15);
          font-size: 18px;
          font-weight: 900;
        }
        .tf-progress-row {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
        }
        .tf-dot {
          width: 30px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.2);
          transition: background 0.3s;
        }
        .tf-dot.active  { background: #FBBF24; }
        .tf-dot.correct { background: #22C55E; }
        .tf-dot.wrong   { background: #EF4444; }
        .tf-card {
          background: white;
          border-radius: 24px;
          padding: 36px 28px 28px;
          max-width: 560px;
          width: 100%;
          text-align: center;
          margin-bottom: 20px;
          position: relative;
          box-shadow: 0 6px 0 rgba(0,0,0,0.2);
          min-height: 220px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .tf-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: #FBBF24;
          color: #1C1C6E;
          font-size: 11px;
          font-weight: 900;
          padding: 5px 18px;
          border-radius: 20px;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .tf-standard {
          font-size: 12px;
          font-weight: 700;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 14px;
        }
        .tf-question {
          font-size: 24px;
          font-weight: 900;
          line-height: 1.35;
          color: #1e1e6e;
        }
        .tf-feedback {
          position: absolute;
          inset: 0;
          border-radius: 23px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          transition: opacity 0.18s;
        }
        .tf-feedback.correct { background: rgba(22,163,74,0.93); }
        .tf-feedback.wrong   { background: rgba(185,28,28,0.9); }
        .tf-feedback-icon  { font-size: 48px; margin-bottom: 6px; }
        .tf-feedback-label { font-size: 24px; font-weight: 900; color: white; }
        .tf-feedback-hint  { font-size: 14px; font-weight: 700; margin-top: 6px; opacity: 0.95; padding: 0 12px; line-height: 1.4; text-align: center; color: white; }
        .tf-got-it {
          margin-top: 16px;
          background: #FBBF24;
          color: #1C1C6E;
          border: none;
          border-radius: 12px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 900;
          padding: 11px 28px;
          cursor: pointer;
          box-shadow: 0 4px 0 #D97706;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .tf-got-it:hover  { transform: translateY(-2px); box-shadow: 0 6px 0 #D97706; }
        .tf-got-it:active { transform: translateY(3px); box-shadow: none; }
        .tf-btn-row {
          display: flex;
          gap: 14px;
          max-width: 560px;
          width: 100%;
        }
        .tf-btn {
          flex: 1;
          padding: 22px 16px;
          border-radius: 20px;
          border: none;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .tf-btn:active { transform: translateY(4px) !important; box-shadow: none !important; }
        .tf-btn .icon { font-size: 36px; line-height: 1; }
        .tf-btn .word { font-size: 24px; }
        .tf-btn .sub  { font-size: 12px; font-weight: 700; opacity: 0.7; }
        .tf-btn.true-btn  { background: #22C55E; color: #052e16; box-shadow: 0 5px 0 #15803D; }
        .tf-btn.false-btn { background: #EF4444; color: #450a0a; box-shadow: 0 5px 0 #B91C1C; }
        .tf-btn.true-btn:hover  { transform: translateY(-3px); box-shadow: 0 8px 0 #15803D; }
        .tf-btn.false-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 0 #B91C1C; }
        .tf-end {
          background: white;
          border-radius: 24px;
          padding: 40px 28px;
          max-width: 560px;
          width: 100%;
          box-shadow: 0 6px 0 rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .tf-end-trophy { font-size: 64px; margin-bottom: 12px; }
        .tf-end-title  { font-size: 30px; font-weight: 900; color: #1e1e6e; margin-bottom: 8px; }
        .tf-end-sub    { font-size: 16px; color: #6B7280; margin-bottom: 24px; }
        .tf-replay {
          background: #FBBF24;
          color: #1C1C6E;
          border: none;
          border-radius: 14px;
          font-family: 'Nunito', sans-serif;
          font-size: 18px;
          font-weight: 900;
          padding: 14px 36px;
          cursor: pointer;
          box-shadow: 0 4px 0 #D97706;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .tf-replay:hover  { transform: translateY(-2px); box-shadow: 0 6px 0 #D97706; }
        .tf-replay:active { transform: translateY(3px); box-shadow: none; }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap"
        rel="stylesheet"
      />

      <div className="tf-shell">
        {!gameOver && currentQ ? (
          <>
            <div className="tf-header">
              <div className="tf-pill">{currentQ.std}</div>
              <div className="tf-game-title">True or False?</div>
              <div className="tf-score-box">
                <span>⭐</span>
                <span>{score}</span>
              </div>
            </div>

            <div className="tf-progress-row">
              {dots.map((state, i) => (
                <div key={i} className={`tf-dot ${state}`} />
              ))}
            </div>

            <div className="tf-card">
              <div className="tf-badge">
                Question {cur + 1} of {ROUND_SIZE}
              </div>
              <div className="tf-standard">Standard {currentQ.std}</div>
              <div className="tf-question">{currentQ.text}</div>

              {feedback === 'correct' && (
                <div className="tf-feedback correct">
                  <div className="tf-feedback-icon">🎉</div>
                  <div className="tf-feedback-label">That's right!</div>
                  <div className="tf-feedback-hint">Nice work!</div>
                </div>
              )}

              {feedback === 'wrong' && (
                <div className="tf-feedback wrong">
                  <div className="tf-feedback-icon">🤔</div>
                  <div className="tf-feedback-label">Not quite!</div>
                  <div className="tf-feedback-hint">{hint}</div>
                  <button className="tf-got-it" onClick={gotIt}>
                    Got it! →
                  </button>
                </div>
              )}
            </div>

            <div className="tf-btn-row">
              <button className="tf-btn true-btn" onClick={() => answer(true)}>
                <span className="icon">✅</span>
                <span className="word">True</span>
                <span className="sub">Yep, that's right!</span>
              </button>
              <button className="tf-btn false-btn" onClick={() => answer(false)}>
                <span className="icon">❌</span>
                <span className="word">False</span>
                <span className="sub">Nope, not right!</span>
              </button>
            </div>
          </>
        ) : gameOver ? (
          <div className="tf-end">
            <div className="tf-end-trophy">{endIcon}</div>
            <div className="tf-end-title">{endTitle}</div>
            <div className="tf-end-sub">
              You got {score} out of {ROUND_SIZE} right!
            </div>
            <button className="tf-replay" onClick={() => initRound(used)}>
              Play Again ↺
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
