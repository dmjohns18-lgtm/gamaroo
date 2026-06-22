'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --nav: #3B4BC8;
          --hero: #2A3BAF;
          --gold: #F5A623;
          --gold-dark: #C47D0E;
          --gold-light: #FFF8E7;
          --gold-border: #FDE68A;
          --white: #FFFFFF;
          --off: #F8FAFF;
          --blue-light: #EFF6FF;
          --blue-border: #BFDBFE;
          --blue-soft: #BAC8FF;
          --green: #10B981;
          --green-light: #ECFDF5;
          --green-border: #A7F3D0;
          --purple: #7C3AED;
          --purple-light: #F5F3FF;
          --purple-border: #DDD6FE;
          --gray-100: #F1F5F9;
          --gray-200: #E2E8F0;
          --gray-400: #94A3B8;
          --gray-600: #475569;
          --gray-800: #1E293B;
          --black: #0F172A;
        }
        body { font-family: 'Nunito', sans-serif; background: var(--off); color: var(--black); overflow-x: hidden; line-height: 1.6; }

        /* NAV */
        .g-nav { background: var(--nav); height: 68px; padding: 0 52px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 200; }
        .g-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .g-logo-mark { width: 38px; height: 38px; background: var(--gold); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 3px 0 var(--gold-dark); flex-shrink: 0; }
        .g-logo-text { font-weight: 900; font-size: 22px; color: white; }
        .g-logo-text span { color: var(--gold); }
        .g-nav-center { display: flex; gap: 4px; align-items: center; }
        .g-nav-link { color: rgba(255,255,255,0.75); text-decoration: none; font-size: 14px; font-weight: 700; padding: 8px 14px; border-radius: 8px; transition: all 0.2s; position: relative; white-space: nowrap; }
        .g-nav-link:hover { color: white; background: rgba(255,255,255,0.1); }
        .g-nav-link.dd { display: flex; align-items: center; gap: 4px; cursor: pointer; }
        .g-nav-link.dd::after { content: '▾'; font-size: 10px; opacity: 0.6; }
        .g-dropdown { position: absolute; top: calc(100% + 10px); left: 0; background: white; border-radius: 16px; padding: 8px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); min-width: 300px; display: none; z-index: 300; border: 1px solid var(--gray-200); }
        .g-nav-link:hover .g-dropdown { display: block; }
        .g-dd-head { font-size: 10px; font-weight: 800; color: var(--gray-400); letter-spacing: 1.5px; text-transform: uppercase; padding: 8px 12px 4px; }
        .g-dd-item { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; transition: background 0.15s; text-decoration: none; }
        .g-dd-item:hover { background: var(--gold-light); }
        .g-dd-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
        .g-dd-name { font-weight: 800; font-size: 14px; color: var(--black); }
        .g-dd-desc { font-size: 12px; color: var(--gray-400); margin-top: 1px; }
        .g-dd-tag { margin-left: auto; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 50px; flex-shrink: 0; }
        .tag-live { background: var(--green-light); color: var(--green); }
        .tag-soon { background: var(--gray-100); color: var(--gray-400); }
        .g-dd-divider { height: 1px; background: var(--gray-200); margin: 4px 0; }
        .g-nav-right { display: flex; gap: 10px; align-items: center; }
        .g-btn-ghost-nav { padding: 8px 18px; border: 1.5px solid rgba(255,255,255,0.25); border-radius: 50px; background: transparent; color: white; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'Nunito', sans-serif; text-decoration: none; transition: all 0.2s; }
        .g-btn-ghost-nav:hover { border-color: rgba(255,255,255,0.6); }
        .g-btn-cta-nav { padding: 9px 20px; border: none; border-radius: 50px; background: var(--gold); color: var(--black); font-size: 13px; font-weight: 900; cursor: pointer; font-family: 'Nunito', sans-serif; text-decoration: none; box-shadow: 0 3px 0 var(--gold-dark); transition: all 0.15s; display: inline-block; }
        .g-btn-cta-nav:hover { transform: translateY(-1px); box-shadow: 0 4px 0 var(--gold-dark); }

        /* GOLD DIVIDER */
        .g-gold-divider { height: 3px; background: linear-gradient(90deg, var(--gold-dark), var(--gold), #FCD34D, var(--gold), var(--gold-dark)); }

        /* HERO */
        .g-hero { background: var(--hero); padding: 72px 52px 64px; }
        .g-hero-eyebrow { display: flex; justify-content: center; margin-bottom: 20px; }
        .g-hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(245,166,35,0.15); color: #FCD34D; border-radius: 50px; padding: 7px 18px; font-size: 13px; font-weight: 800; border: 1px solid rgba(245,166,35,0.25); }
        .g-hero h1 { font-size: 68px; font-weight: 900; color: white; line-height: 1.0; text-align: center; margin-bottom: 18px; letter-spacing: -1px; }
        .g-hero h1 .gold { color: var(--gold); }
        .g-hero h1 .soft { color: var(--blue-soft); }
        .g-hero-sub { font-size: 18px; color: rgba(255,255,255,0.6); line-height: 1.7; max-width: 520px; margin: 0 auto 36px; text-align: center; font-weight: 600; }
        .g-hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-bottom: 52px; }
        .g-btn-hero-gold { padding: 17px 40px; font-size: 18px; border-radius: 12px; border: none; background: var(--gold); color: var(--black); font-weight: 900; cursor: pointer; font-family: 'Nunito', sans-serif; box-shadow: 0 6px 0 var(--gold-dark); transition: all 0.15s; text-decoration: none; display: inline-block; }
        .g-btn-hero-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 0 var(--gold-dark); }
        .g-btn-hero-ghost { padding: 17px 40px; font-size: 18px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.25); background: transparent; color: rgba(255,255,255,0.85); font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .g-btn-hero-ghost:hover { border-color: rgba(255,255,255,0.6); color: white; }

        /* TRUST ROW */
        .g-trust-row { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; padding-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); }
        .g-trust-item { display: flex; align-items: center; gap: 10px; padding: 0 32px; }
        .g-trust-item + .g-trust-item { border-left: 1px solid rgba(255,255,255,0.12); }
        .g-trust-icon { font-size: 22px; }
        .g-trust-label { font-size: 15px; font-weight: 900; color: white; }
        .g-trust-sub { font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }

        /* MARQUEE */
        .g-marquee-wrap { background: var(--nav); padding: 13px 0; overflow: hidden; }
        .g-marquee-track { display: flex; gap: 36px; animation: gmarquee 24s linear infinite; width: max-content; }
        .g-marquee-item { display: flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; white-space: nowrap; }
        .g-marquee-item span { font-size: 16px; }
        .g-mdot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,0.3); flex-shrink: 0; }
        @keyframes gmarquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

        /* SECTIONS */
        .g-section { padding: 80px 52px; max-width: 1160px; margin: 0 auto; }
        .g-sec-eyebrow { display: inline-flex; align-items: center; gap: 6px; border-radius: 50px; padding: 6px 14px; font-size: 12px; font-weight: 800; margin-bottom: 14px; letter-spacing: 0.5px; text-transform: uppercase; }
        .g-sec-eyebrow.gold { background: var(--gold-light); color: var(--gold-dark); }
        .g-sec-eyebrow.blue { background: var(--blue-light); color: var(--nav); }
        .g-sec-eyebrow.green { background: var(--green-light); color: #065F46; }
        .g-sec-eyebrow.purple { background: var(--purple-light); color: var(--purple); }
        .g-sec-title { font-size: 44px; font-weight: 900; line-height: 1.1; margin-bottom: 14px; letter-spacing: -0.5px; }
        .g-sec-sub { font-size: 17px; color: var(--gray-600); max-width: 540px; line-height: 1.7; margin-bottom: 52px; font-weight: 600; }

        /* ARENA */
        .g-arena-wrap { background: var(--hero); border-radius: 28px; overflow: hidden; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.06); }
        .g-arena-top { padding: 28px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .g-arena-left { display: flex; align-items: center; gap: 16px; }
        .g-arena-icon { width: 52px; height: 52px; background: rgba(255,255,255,0.08); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; }
        .g-arena-name { font-size: 24px; font-weight: 900; color: white; }
        .g-arena-desc { font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 3px; font-weight: 600; }
        .g-arena-badge { background: var(--gold); color: var(--black); border-radius: 50px; padding: 7px 18px; font-size: 12px; font-weight: 900; box-shadow: 0 3px 0 var(--gold-dark); }
        .g-arena-games { display: grid; grid-template-columns: repeat(4, 1fr); }
        .g-arena-game { padding: 24px 20px; border-right: 1px solid rgba(255,255,255,0.06); transition: background 0.2s; cursor: pointer; text-decoration: none; display: block; }
        .g-arena-game:last-child { border-right: none; }
        .g-arena-game:hover { background: rgba(255,255,255,0.04); }
        .g-ag-emoji { font-size: 32px; margin-bottom: 12px; display: block; }
        .g-ag-name { font-size: 17px; font-weight: 900; color: white; margin-bottom: 6px; }
        .g-ag-desc { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.5; margin-bottom: 12px; font-weight: 600; }
        .g-ag-tag { display: inline-block; padding: 4px 10px; border-radius: 50px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .agt-live { background: rgba(16,185,129,0.2); color: #34D399; }
        .agt-soon { background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.3); }

        /* WORLDS */
        .g-worlds-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .g-world-card { background: white; border-radius: 20px; padding: 28px; border: 2px solid var(--gray-200); transition: all 0.25s; cursor: pointer; position: relative; overflow: hidden; }
        .g-world-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
        .g-world-card.words::before { background: linear-gradient(90deg, var(--nav), var(--blue-soft)); }
        .g-world-card.science::before { background: linear-gradient(90deg, var(--green), #34D399); }
        .g-world-card.history::before { background: linear-gradient(90deg, var(--purple), #A78BFA); }
        .g-world-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); border-color: transparent; }
        .g-wc-emoji { font-size: 40px; margin-bottom: 14px; display: block; }
        .g-wc-name { font-size: 22px; font-weight: 900; margin-bottom: 8px; }
        .g-wc-desc { font-size: 14px; color: var(--gray-600); line-height: 1.5; margin-bottom: 14px; font-weight: 600; }
        .g-wc-standard { font-size: 12px; color: var(--gray-400); font-weight: 700; margin-bottom: 14px; }
        .g-wc-tag { display: inline-block; padding: 5px 12px; border-radius: 50px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase; background: var(--gray-100); color: var(--gray-400); }

        /* STANDARDS */
        .g-standards-bg { background: var(--gold-light); border-top: 2px solid var(--gold-border); border-bottom: 2px solid var(--gold-border); }
        .g-standards-inner { max-width: 1160px; margin: 0 auto; padding: 80px 52px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .g-std-list { display: flex; flex-direction: column; gap: 10px; }
        .g-std-row { background: white; border-radius: 14px; padding: 14px 18px; border: 1.5px solid var(--gold-border); display: flex; align-items: center; gap: 14px; }
        .g-std-code { background: var(--gold-light); color: var(--gold-dark); font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; font-family: monospace; white-space: nowrap; flex-shrink: 0; border: 1px solid var(--gold-border); }
        .g-std-name { font-size: 14px; color: var(--gray-800); font-weight: 700; flex: 1; }
        .g-std-grade { font-size: 11px; color: var(--gray-400); font-weight: 700; white-space: nowrap; }
        .g-state-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
        .g-state-pill { background: white; border: 1.5px solid var(--gold-border); border-radius: 50px; padding: 5px 14px; font-size: 12px; font-weight: 800; color: var(--gold-dark); }

        /* TEACHER */
        .g-teacher-bg { background: var(--hero); }
        .g-teacher-inner { max-width: 1160px; margin: 0 auto; padding: 80px 52px; display: grid; grid-template-columns: 1fr 1fr; gap: 72px; align-items: center; }
        .g-t-eyebrow { display: inline-flex; align-items: center; gap: 6px; background: rgba(245,166,35,0.15); color: #FCD34D; border-radius: 50px; padding: 6px 14px; font-size: 12px; font-weight: 800; margin-bottom: 16px; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid rgba(245,166,35,0.2); }
        .g-t-title { font-size: 44px; font-weight: 900; color: white; line-height: 1.05; margin-bottom: 16px; letter-spacing: -0.5px; }
        .g-t-title span { color: var(--gold); }
        .g-t-desc { font-size: 16px; color: rgba(255,255,255,0.55); line-height: 1.7; margin-bottom: 32px; font-weight: 600; }
        .g-t-feats { display: flex; flex-direction: column; gap: 12px; }
        .g-t-feat { display: flex; align-items: flex-start; gap: 14px; color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 700; }
        .g-t-check { width: 26px; height: 26px; border-radius: 7px; background: rgba(16,185,129,0.2); border: 1px solid rgba(16,185,129,0.3); display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0; margin-top: 1px; }
        .g-dash-mock { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; }
        .g-dash-nav-bar { background: rgba(255,255,255,0.04); padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .g-dash-title { color: white; font-size: 15px; font-weight: 900; }
        .g-dash-live { background: rgba(16,185,129,0.2); color: #34D399; border-radius: 50px; padding: 4px 12px; font-size: 11px; font-weight: 800; }
        .g-dash-body { padding: 20px; }
        .g-dash-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .g-dc { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 12px 14px; }
        .g-dc-label { font-size: 10px; color: rgba(255,255,255,0.4); font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px; }
        .g-dc-val { font-size: 26px; font-weight: 900; color: white; line-height: 1; }
        .g-dc-val.gold { color: var(--gold); }
        .g-dc-val.green { color: #34D399; }
        .g-prog-list { display: flex; flex-direction: column; gap: 8px; }
        .g-prog-item { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 10px 14px; }
        .g-prog-top { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .g-prog-name { font-size: 12px; color: rgba(255,255,255,0.65); font-weight: 700; }
        .g-prog-pct { font-size: 12px; font-weight: 900; }
        .g-prog-bar { height: 5px; background: rgba(255,255,255,0.08); border-radius: 50px; overflow: hidden; }
        .g-prog-fill { height: 100%; border-radius: 50px; }

        /* TESTIMONIALS */
        .g-testi-bg { background: white; border-top: 2px solid var(--gray-200); }
        .g-testi-inner { max-width: 1160px; margin: 0 auto; padding: 80px 52px; }
        .g-testi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 52px; }
        .g-testi-card { background: var(--off); border-radius: 20px; padding: 28px; border: 2px solid var(--gray-200); position: relative; }
        .g-testi-card::before { content: '"'; position: absolute; top: 16px; right: 20px; font-size: 72px; color: var(--gold-border); line-height: 1; font-weight: 900; }
        .g-stars { color: var(--gold); font-size: 17px; margin-bottom: 14px; letter-spacing: 2px; }
        .g-testi-text { font-size: 15px; color: var(--gray-800); line-height: 1.65; margin-bottom: 20px; font-weight: 600; }
        .g-testi-author { display: flex; align-items: center; gap: 12px; }
        .g-t-ava { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; color: white; flex-shrink: 0; }
        .g-t-name { font-weight: 900; font-size: 14px; color: var(--black); }
        .g-t-role { font-size: 12px; color: var(--gray-400); font-weight: 600; }

        /* PRICING */
        .g-price-bg { background: var(--off); border-top: 2px solid var(--gray-200); }
        .g-price-inner { max-width: 1160px; margin: 0 auto; padding: 80px 52px; }
        .g-price-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start; margin-top: 52px; }
        .g-pc { background: white; border-radius: 24px; border: 2px solid var(--gray-200); padding: 32px 28px; position: relative; transition: transform 0.2s; }
        .g-pc:hover { transform: translateY(-4px); }
        .g-pc.feat { border-color: var(--nav); box-shadow: 0 0 0 5px rgba(59,75,200,0.08); }
        .g-feat-pill { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: var(--nav); color: white; font-size: 12px; font-weight: 800; padding: 4px 16px; border-radius: 50px; white-space: nowrap; }
        .g-p-plan { font-size: 11px; font-weight: 800; color: var(--gray-400); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px; }
        .g-p-amount { font-size: 52px; font-weight: 900; line-height: 1; margin-bottom: 4px; }
        .g-p-amount sup { font-size: 22px; vertical-align: top; margin-top: 10px; display: inline-block; }
        .g-p-amount sub { font-size: 15px; color: var(--gray-400); font-weight: 600; }
        .g-p-desc { font-size: 13px; color: var(--gray-400); margin-bottom: 24px; font-weight: 600; }
        .g-p-feats { list-style: none; margin-bottom: 28px; display: flex; flex-direction: column; gap: 10px; }
        .g-p-feats li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--gray-800); font-weight: 700; }
        .g-p-feats li.muted { color: var(--gray-400); }
        .g-ck { color: var(--green); font-size: 15px; flex-shrink: 0; margin-top: 1px; }
        .g-dsh { color: var(--gray-200); font-size: 15px; flex-shrink: 0; margin-top: 1px; }
        .g-p-btn { width: 100%; padding: 14px; border-radius: 12px; font-size: 15px; font-weight: 900; cursor: pointer; font-family: 'Nunito', sans-serif; border: none; transition: all 0.2s; }
        .g-p-btn.navy { background: var(--nav); color: white; box-shadow: 0 4px 0 #1E2A8A; }
        .g-p-btn.navy:hover { transform: translateY(-2px); box-shadow: 0 6px 0 #1E2A8A; }
        .g-p-btn.outline { background: white; color: var(--gray-800); border: 2px solid var(--gray-200); }
        .g-p-btn.outline:hover { border-color: var(--nav); color: var(--nav); }

        /* CTA */
        .g-cta-bg { background: var(--nav); padding: 80px 52px; text-align: center; position: relative; overflow: hidden; }
        .g-cta-bg::before { content: '🦘'; position: absolute; font-size: 260px; opacity: 0.05; right: -20px; bottom: -60px; line-height: 1; }
        .g-cta-bg::after { content: '🦘'; position: absolute; font-size: 180px; opacity: 0.04; left: -10px; top: -40px; line-height: 1; transform: scaleX(-1); }
        .g-cta-inner { max-width: 600px; margin: 0 auto; position: relative; }
        .g-cta-inner h2 { font-size: 50px; font-weight: 900; color: white; margin-bottom: 14px; line-height: 1.05; letter-spacing: -0.5px; }
        .g-cta-inner h2 span { color: var(--gold); }
        .g-cta-inner p { font-size: 18px; color: rgba(255,255,255,0.6); margin-bottom: 36px; line-height: 1.6; font-weight: 600; }
        .g-cta-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
        .g-btn-cta-gold { padding: 18px 40px; font-size: 18px; border-radius: 12px; border: none; background: var(--gold); color: var(--black); font-weight: 900; cursor: pointer; font-family: 'Nunito', sans-serif; box-shadow: 0 6px 0 var(--gold-dark); transition: all 0.15s; text-decoration: none; display: inline-block; }
        .g-btn-cta-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 0 var(--gold-dark); }
        .g-btn-cta-ghost { padding: 18px 40px; font-size: 18px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); background: transparent; color: rgba(255,255,255,0.85); font-weight: 800; cursor: pointer; font-family: 'Nunito', sans-serif; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .g-btn-cta-ghost:hover { border-color: rgba(255,255,255,0.5); color: white; }

        /* FOOTER */
        .g-footer { background: var(--black); padding: 52px; }
        .g-foot-inner { max-width: 1160px; margin: 0 auto; }
        .g-foot-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap; gap: 32px; }
        .g-foot-brand { max-width: 280px; }
        .g-foot-logo { font-size: 22px; font-weight: 900; color: white; margin-bottom: 10px; }
        .g-foot-logo span { color: var(--gold); }
        .g-foot-tagline { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.6; font-weight: 600; }
        .g-foot-cols { display: flex; gap: 52px; flex-wrap: wrap; }
        .g-foot-col-title { font-size: 11px; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px; }
        .g-foot-col-links { display: flex; flex-direction: column; gap: 8px; }
        .g-foot-col-links a { color: rgba(255,255,255,0.5); font-size: 14px; text-decoration: none; transition: color 0.2s; font-weight: 600; }
        .g-foot-col-links a:hover { color: white; }
        .g-foot-bottom { border-top: 1px solid rgba(255,255,255,0.08); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .g-foot-copy { font-size: 13px; color: rgba(255,255,255,0.25); font-weight: 600; }
        .g-foot-badges { display: flex; gap: 8px; }
        .g-foot-badge { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px 10px; font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 700; }
      `}</style>

      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap" rel="stylesheet" />

      {/* NAV */}
      <nav className="g-nav">
        <Link href="/" className="g-logo">
          <div className="g-logo-mark">🦘</div>
          <div className="g-logo-text">Gama<span>roo</span></div>
        </Link>
        <div className="g-nav-center">
          <div className="g-nav-link dd">
            Games
            <div className="g-dropdown">
              <div className="g-dd-head">3rd Grade Review Games</div>
              <Link href="/play/truefalse" className="g-dd-item">
                <div className="g-dd-icon" style={{ background: '#EFF6FF' }}>✅</div>
                <div><div className="g-dd-name">True or False</div><div className="g-dd-desc">Test math statements — true or false?</div></div>
                <span className="g-dd-tag tag-live">Live</span>
              </Link>
              <Link href="/play/quickfire" className="g-dd-item">
                <div className="g-dd-icon" style={{ background: '#FFF8E7' }}>⚡</div>
                <div><div className="g-dd-name">Quick Fire</div><div className="g-dd-desc">Answer as many facts as you can in 60 seconds</div></div>
                <span className="g-dd-tag tag-live">Live</span>
              </Link>
              <Link href="/play/flashfactor" className="g-dd-item">
                <div className="g-dd-icon" style={{ background: '#ECFDF5' }}>🔥</div>
                <div><div className="g-dd-name">Flash Factor</div><div className="g-dd-desc">Fluency drill — multiply and divide within 100</div></div>
                <span className="g-dd-tag tag-live">Live</span>
              </Link>
              <div className="g-dd-divider" />
              <div className="g-dd-head">Sports Arena</div>
              <Link href="/play/mathhoops" className="g-dd-item">
                <div className="g-dd-icon" style={{ background: '#FFF8E7' }}>🏀</div>
                <div><div className="g-dd-name">MathHoops</div><div className="g-dd-desc">Basketball × multiplication facts</div></div>
                <span className="g-dd-tag tag-live">Live</span>
              </Link>
              <Link href="/play/factorfc" className="g-dd-item">
                <div className="g-dd-icon" style={{ background: '#ECFDF5' }}>⚽</div>
                <div><div className="g-dd-name">Factor FC</div><div className="g-dd-desc">Soccer × division facts</div></div>
                <span className="g-dd-tag tag-live">Live</span>
              </Link>
            </div>
          </div>
          <a href="#standards" className="g-nav-link">Standards</a>
          <a href="#teachers" className="g-nav-link">For Teachers</a>
          <a href="#pricing" className="g-nav-link">Pricing</a>
          <a href="#" className="g-nav-link">For Schools</a>
        </div>
        <div className="g-nav-right">
          <Link href="/login" className="g-btn-ghost-nav">Log In</Link>
          <Link href="/login" className="g-btn-cta-nav">Try Free 🦘</Link>
        </div>
      </nav>

      {/* GOLD DIVIDER */}
      <div className="g-gold-divider" />

      {/* HERO */}
      <section className="g-hero">
        <div className="g-hero-eyebrow">
          <div className="g-hero-badge">✨ Where learning feels like magic</div>
        </div>
        <h1>Where kids <span className="gold">learn</span><br />through <span className="soft">play.</span></h1>
        <p className="g-hero-sub">Gamaroo is the standards-aligned K–5 platform where every subject becomes a game kids actually want to play. Built for teachers. Loved by students.</p>
        <div className="g-hero-actions">
          <Link href="/login" className="g-btn-hero-gold">Start For Free 🦘</Link>
          <a href="#games" className="g-btn-hero-ghost">See the Games</a>
        </div>
        <div className="g-trust-row">
          <div className="g-trust-item">
            <div className="g-trust-icon">👩‍💼</div>
            <div><div className="g-trust-label">Mom-founded</div><div className="g-trust-sub">educator-built</div></div>
          </div>
          <div className="g-trust-item">
            <div className="g-trust-icon">🚫</div>
            <div><div className="g-trust-label">Always free</div><div className="g-trust-sub">for every student</div></div>
          </div>
          <div className="g-trust-item">
            <div className="g-trust-icon">🔒</div>
            <div><div className="g-trust-label">COPPA compliant</div><div className="g-trust-sub">kid safe</div></div>
          </div>
          <div className="g-trust-item">
            <div className="g-trust-icon">📋</div>
            <div><div className="g-trust-label">Common Core</div><div className="g-trust-sub">aligned</div></div>
          </div>
        </div>
      </section>

      {/* GOLD DIVIDER */}
      <div className="g-gold-divider" />

      {/* MARQUEE */}
      <div className="g-marquee-wrap">
        <div className="g-marquee-track">
          {[...Array(2)].map((_, r) => (
            [['🏀','Math Games'],['📚','Reading Adventures'],['🔬','Science Quests'],['🌍','History Heroes'],['✏️','Spelling Battles'],['🏆','Season Mode'],['📊','Teacher Dashboard'],['🎯','Standards Aligned']].map(([icon, label], i) => (
              <div key={`${r}-${i}`} className="g-marquee-item"><span>{icon}</span>{label}<div className="g-mdot" /></div>
            ))
          ))}
        </div>
      </div>

      {/* GAMES */}
      <div id="games" style={{ background: 'white', borderBottom: '2px solid var(--gray-200)' }}>
        <div className="g-section">
          <div className="g-sec-eyebrow gold">🎮 The Game World</div>
          <h2 className="g-sec-title">One platform.<br />Every subject. All the fun.</h2>
          <p className="g-sec-sub">Kids pick what they feel like playing. Every game teaches real curriculum aligned to Common Core, wrapped in adventures they actually want to go on.</p>

          <div className="g-arena-wrap">
            <div className="g-arena-top">
              <div className="g-arena-left">
                <div className="g-arena-icon">📚</div>
                <div>
                  <div className="g-arena-name">3rd Grade Review Games</div>
                  <div className="g-arena-desc">Standards-aligned games covering all 3rd grade Common Core math standards</div>
                </div>
              </div>
              <span className="g-arena-badge">✓ Live Now</span>
            </div>
            <div className="g-arena-games">
              <Link href="/play/truefalse" className="g-arena-game">
                <span className="g-ag-emoji">✅</span>
                <div className="g-ag-name">True or False</div>
                <div className="g-ag-desc">Is this math statement true or false? Test your knowledge across 6 standards.</div>
                <span className="g-ag-tag agt-live">✓ Live Now</span>
              </Link>
              <Link href="/play/quickfire" className="g-arena-game">
                <span className="g-ag-emoji">⚡</span>
                <div className="g-ag-name">Quick Fire</div>
                <div className="g-ag-desc">Answer as many math facts as you can before the 60-second clock runs out.</div>
                <span className="g-ag-tag agt-live">✓ Live Now</span>
              </Link>
              <Link href="/play/flashfactor" className="g-arena-game">
                <span className="g-ag-emoji">🔥</span>
                <div className="g-ag-name">Flash Factor</div>
                <div className="g-ag-desc">Fluency drill — multiply and divide within 100 as fast as you can.</div>
                <span className="g-ag-tag agt-live">✓ Live Now</span>
              </Link>
              <div className="g-arena-game">
                <span className="g-ag-emoji">🎯</span>
                <div className="g-ag-name">More Coming</div>
                <div className="g-ag-desc">Drag & Drop, Word Problem Blitz, and 20+ more games launching soon.</div>
                <span className="g-ag-tag agt-soon">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="g-arena-wrap" style={{ marginTop: 20 }}>
            <div className="g-arena-top">
              <div className="g-arena-left">
                <div className="g-arena-icon">🏟️</div>
                <div>
                  <div className="g-arena-name">The Sports Arena</div>
                  <div className="g-arena-desc">Math facts through the sports kids love: basketball, soccer, football and more</div>
                </div>
              </div>
              <span className="g-arena-badge">✓ Live Now</span>
            </div>
            <div className="g-arena-games">
              <Link href="/play/mathhoops" className="g-arena-game">
                <span className="g-ag-emoji">🏀</span>
                <div className="g-ag-name">MathHoops</div>
                <div className="g-ag-desc">Answer multiplication facts to score buckets. Beat the CPU in full season mode.</div>
                <span className="g-ag-tag agt-live">✓ Live Now</span>
              </Link>
              <Link href="/play/factorfc" className="g-arena-game">
                <span className="g-ag-emoji">⚽</span>
                <div className="g-ag-name">Factor FC</div>
                <div className="g-ag-desc">Score goals with division facts. Play through a full soccer season.</div>
                <span className="g-ag-tag agt-live">✓ Live Now</span>
              </Link>
              <div className="g-arena-game">
                <span className="g-ag-emoji">🏈</span>
                <div className="g-ag-name">Gridiron Math</div>
                <div className="g-ag-desc">Call plays using math skills. Harder facts unlock bigger gains.</div>
                <span className="g-ag-tag agt-soon">Coming Soon</span>
              </div>
              <div className="g-arena-game">
                <span className="g-ag-emoji">⚾</span>
                <div className="g-ag-name">Diamond Digits</div>
                <div className="g-ag-desc">Step up to the plate and hit home runs with fast, accurate answers.</div>
                <span className="g-ag-tag agt-soon">Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="g-arena-wrap" style={{ marginTop: 20 }}>
            <div className="g-arena-top">
              <div className="g-arena-left">
                <div className="g-arena-icon">📚</div>
                <div>
                  <div className="g-arena-name">ELA Games</div>
                  <div className="g-arena-desc">Reading, vocabulary and language arts games for 3rd grade</div>
                </div>
              </div>
              <span className="g-arena-badge">✓ Live Now</span>
            </div>
            <div className="g-arena-games">
              <Link href="/play/wordescape" className="g-arena-game">
                <span className="g-ag-emoji">🚪</span>
                <div className="g-ag-name">Word Escape</div>
                <div className="g-ag-desc">Escape 5 rooms by answering ELA questions. Space Station theme with Roo as your guide!</div>
                <span className="g-ag-tag agt-live">✓ Live Now</span>
              </Link>
            </div>
          </div>
          <div className="g-worlds-grid" style={{ marginTop: 20 }}>
            <div className="g-world-card words">
              <span className="g-wc-emoji">📚</span>
              <div className="g-wc-name">Word World</div>
              <div className="g-wc-desc">Spelling battles, vocabulary adventures and reading comprehension quests for K–5.</div>
              <div className="g-wc-standard">Covers: CCSS.ELA-LITERACY.RF, L, RI</div>
              <span className="g-wc-tag">Coming Soon</span>
            </div>
            <div className="g-world-card science">
              <span className="g-wc-emoji">🔬</span>
              <div className="g-wc-name">Science Quest</div>
              <div className="g-wc-desc">Explore ecosystems, conduct experiments and discover the natural world.</div>
              <div className="g-wc-standard">Covers: NGSS K-5 Life, Earth & Physical</div>
              <span className="g-wc-tag">Coming Soon</span>
            </div>
            <div className="g-world-card history">
              <span className="g-wc-emoji">🌍</span>
              <div className="g-wc-name">History Heroes</div>
              <div className="g-wc-desc">Travel through time, build civilizations and learn world history through strategy games.</div>
              <div className="g-wc-standard">Covers: CCSS.ELA-LITERACY.RH, Social Studies</div>
              <span className="g-wc-tag">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* STANDARDS */}
      <div id="standards" className="g-standards-bg">
        <div className="g-standards-inner">
          <div>
            <div className="g-sec-eyebrow gold">📋 Standards Aligned</div>
            <h2 className="g-sec-title">Built for the<br />standards you teach.</h2>
            <p style={{ fontSize: 17, color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 28, fontWeight: 600 }}>Every game on Gamaroo maps directly to Common Core State Standards so every minute of play counts toward real learning goals.</p>
            <div className="g-state-pills">
              {['CCSS National','NJSLS','NYSLS','California','Florida BEST','Texas TEKS','+ 35 States'].map(s => (
                <div key={s} className="g-state-pill">{s}</div>
              ))}
            </div>
          </div>
          <div className="g-std-list">
            {[
              ['CCSS.3.OA.C.7','Fluently multiply and divide within 100','Grade 3'],
              ['CCSS.3.OA.A.1','Interpret products of whole numbers','Grade 3'],
              ['CCSS.2.OA.B.2','Fluently add and subtract within 20','Grade 2'],
              ['CCSS.4.NBT.B.5','Multiply multi-digit whole numbers','Grade 4'],
              ['CCSS.4.NBT.B.6','Find whole number quotients and remainders','Grade 4'],
              ['CCSS.ELA-LITERACY.RF.2.3','Know and apply grade level phonics rules','Grade 2'],
              ['CCSS.ELA-LITERACY.L.3.4','Determine meaning of unknown vocabulary words','Grade 3'],
            ].map(([code, name, grade]) => (
              <div key={code} className="g-std-row">
                <span className="g-std-code">{code}</span>
                <span className="g-std-name">{name}</span>
                <span className="g-std-grade">{grade}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TEACHER */}
      <div id="teachers" className="g-teacher-bg">
        <div className="g-teacher-inner">
          <div>
            <div className="g-t-eyebrow">👩‍🏫 For Teachers</div>
            <h2 className="g-t-title">Built for your<br /><span>classroom.</span><br />Not against it.</h2>
            <p className="g-t-desc">Real data. Real tools. Zero extra work. Gamaroo gives teachers everything they need to track progress and prove results.</p>
            <div className="g-t-feats">
              {['Real-time class progress by standard','Assign games by skill or standard code','Google Classroom and Clever integration','Automated weekly parent progress emails','Common Core proficiency reports for admin','District-level reporting for superintendents'].map(f => (
                <div key={f} className="g-t-feat"><div className="g-t-check">✓</div>{f}</div>
              ))}
            </div>
          </div>
          <div className="g-dash-mock">
            <div className="g-dash-nav-bar">
              <div className="g-dash-title">Class Dashboard — Ms. Sanders</div>
              <div className="g-dash-live">● Live</div>
            </div>
            <div className="g-dash-body">
              <div className="g-dash-cards">
                <div className="g-dc"><div className="g-dc-label">Students Active</div><div className="g-dc-val gold">24</div></div>
                <div className="g-dc"><div className="g-dc-label">Avg Score Today</div><div className="g-dc-val green">86%</div></div>
              </div>
              <div className="g-prog-list">
                {[['3.OA.C.7 Multiply within 100','78%','#34D399'],['3.OA.C.7 Divide within 100','61%','#FCD34D'],['3.NF.A.1 Understand fractions','44%','#F5A623'],['4.NBT.B.5 Multi-digit multiply','32%','#F87171']].map(([name, pct, color]) => (
                  <div key={name} className="g-prog-item">
                    <div className="g-prog-top"><div className="g-prog-name">{name}</div><div className="g-prog-pct" style={{ color }}>{pct}</div></div>
                    <div className="g-prog-bar"><div className="g-prog-fill" style={{ width: pct, background: color }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="g-testi-bg">
        <div className="g-testi-inner">
          <div style={{ textAlign: 'center' }}>
            <div className="g-sec-eyebrow purple" style={{ margin: '0 auto 14px' }}>💬 Real Teachers. Real Results.</div>
            <h2 className="g-sec-title">They tried it Monday.<br />Kids asked for it Tuesday.</h2>
          </div>
          <div className="g-testi-grid">
            {[
              { text: '"My kids were begging to practice multiplication. I\'ve never seen anything like it in 12 years of teaching. The standard reports made my principal\'s jaw drop."', name: 'Ms. Sanders', role: '3rd Grade · Newark, NJ', initials: 'MS', bg: 'var(--nav)' },
              { text: '"The dashboard shows exactly which standard each student needs help with. It\'s replaced our timed tests and kids don\'t even realize they\'re being assessed."', name: 'Mr. Rodriguez', role: '4th Grade · Brooklyn, NY', initials: 'MR', bg: 'var(--green)' },
              { text: '"We licensed it district-wide after one pilot. The Common Core alignment reports gave our superintendent exactly what she needed to approve the budget."', name: 'Dr. Thompson', role: 'Curriculum Director · Essex County, NJ', initials: 'DT', bg: 'var(--purple)' },
            ].map(t => (
              <div key={t.name} className="g-testi-card">
                <div className="g-stars">★★★★★</div>
                <p className="g-testi-text">{t.text}</p>
                <div className="g-testi-author">
                  <div className="g-t-ava" style={{ background: t.bg }}>{t.initials}</div>
                  <div><div className="g-t-name">{t.name}</div><div className="g-t-role">{t.role}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div id="pricing" className="g-price-bg">
        <div className="g-price-inner">
          <div style={{ textAlign: 'center' }}>
            <div className="g-sec-eyebrow green" style={{ margin: '0 auto 14px' }}>💳 Simple Pricing</div>
            <h2 className="g-sec-title">Always free for students.<br />Powerful tools for teachers.</h2>
            <p className="g-sec-sub" style={{ margin: '12px auto 0', textAlign: 'center' }}>No ads. No paywalls for kids. Ever.</p>
          </div>
          <div className="g-price-grid">
            <div className="g-pc">
              <div className="g-p-plan">Student</div>
              <div className="g-p-amount">$0</div>
              <div className="g-p-desc">Free forever. No credit card needed.</div>
              <ul className="g-p-feats">
                <li><span className="g-ck">✓</span>All review games</li>
                <li><span className="g-ck">✓</span>MathHoops & Factor FC</li>
                <li><span className="g-ck">✓</span>Streak and scoring system</li>
                <li className="muted"><span className="g-dsh">✕</span>Progress tracking</li>
                <li className="muted"><span className="g-dsh">✕</span>All subject worlds</li>
                <li className="muted"><span className="g-dsh">✕</span>Class leaderboard</li>
              </ul>
              <button className="g-p-btn outline">Play Now</button>
            </div>
            <div className="g-pc feat">
              <div className="g-feat-pill">⭐ Most Popular</div>
              <div className="g-p-plan">Teacher</div>
              <div className="g-p-amount"><sup>$</sup>8<sub>/mo</sub></div>
              <div className="g-p-desc">30-day free trial. No credit card needed.</div>
              <ul className="g-p-feats">
                <li><span className="g-ck">✓</span>All games unlocked</li>
                <li><span className="g-ck">✓</span>Standards-aligned dashboard</li>
                <li><span className="g-ck">✓</span>Student progress by standard</li>
                <li><span className="g-ck">✓</span>Google Classroom sync</li>
                <li><span className="g-ck">✓</span>Automated parent reports</li>
                <li><span className="g-ck">✓</span>Class leaderboard</li>
              </ul>
              <button className="g-p-btn navy">Start Free Trial</button>
            </div>
            <div className="g-pc">
              <div className="g-p-plan">School / District</div>
              <div className="g-p-amount"><sup>$</sup>500<sub>/yr</sub></div>
              <div className="g-p-desc">Unlimited teachers and students</div>
              <ul className="g-p-feats">
                <li><span className="g-ck">✓</span>Everything in Teacher</li>
                <li><span className="g-ck">✓</span>Admin dashboard</li>
                <li><span className="g-ck">✓</span>District-wide standard reports</li>
                <li><span className="g-ck">✓</span>Dedicated onboarding call</li>
                <li><span className="g-ck">✓</span>School-wide leaderboards</li>
                <li><span className="g-ck">✓</span>District pricing available</li>
              </ul>
              <button className="g-p-btn outline">Contact Us</button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="g-cta-bg">
        <div className="g-cta-inner">
          <h2>Ready to make learning <span>irresistible?</span></h2>
          <p>Join K–5 teachers making the classroom the most exciting place to be. Free to start. No credit card. No setup headaches.</p>
          <div className="g-cta-actions">
            <Link href="/login" className="g-btn-cta-gold">Get Started Free 🦘</Link>
            <a href="#" className="g-btn-cta-ghost">Schedule a Demo</a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="g-footer">
        <div className="g-foot-inner">
          <div className="g-foot-top">
            <div className="g-foot-brand">
              <div className="g-foot-logo">Gama<span>roo</span> 🦘</div>
              <div className="g-foot-tagline">Mom-founded, educator-built. The K–5 platform where every subject becomes an adventure kids actually want to go on.</div>
            </div>
            <div className="g-foot-cols">
              <div>
                <div className="g-foot-col-title">Platform</div>
                <div className="g-foot-col-links">
                  <a href="#games">Review Games</a>
                  <a href="#games">Sports Arena</a>
                  <a href="#">Word World</a>
                  <a href="#standards">Standards Map</a>
                </div>
              </div>
              <div>
                <div className="g-foot-col-title">For Schools</div>
                <div className="g-foot-col-links">
                  <a href="#teachers">Teachers</a>
                  <a href="#">Administrators</a>
                  <a href="#">Districts</a>
                  <a href="#">Request Demo</a>
                </div>
              </div>
              <div>
                <div className="g-foot-col-title">Company</div>
                <div className="g-foot-col-links">
                  <a href="#">About</a>
                  <a href="#">Blog</a>
                  <a href="#">Privacy</a>
                  <a href="#">Terms</a>
                </div>
              </div>
            </div>
          </div>
          <div className="g-foot-bottom">
            <div className="g-foot-copy">© 2025 Gamaroo. Mom-founded, educator-built. Built for K–5 classrooms across America.</div>
            <div className="g-foot-badges">
              <div className="g-foot-badge">CCSS Aligned</div>
              <div className="g-foot-badge">COPPA Compliant</div>
              <div className="g-foot-badge">Ad Free</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
