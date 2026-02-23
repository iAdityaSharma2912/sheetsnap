import { useState, useCallback, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter,
  RadialBarChart, RadialBar, LineChart, Line, ComposedChart, ReferenceLine,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ZAxis
} from "recharts";
import { 
  FileText, Brain, BarChart3, MessageSquare, 
  UploadCloud, FileSpreadsheet, Calculator, 
  CheckCircle2, Sparkles, User, Folder, Tag 
} from "lucide-react";

// ── THEME ─────────────────────────────────────────────────────────────────────
const C = {
  bg: "#060B18", card: "#0D1526", card2: "#111E35",
  accent: "#00F5D4", accent2: "#FE6D73", accent3: "#A78BFA",
  yellow: "#FFCB47", blue: "#18BFFF",
  text: "#E2E8F0", muted: "#4A5568", border: "rgba(255,255,255,0.07)"
};
const PALETTE = ["#00F5D4","#FE6D73","#A78BFA","#FFCB47","#18BFFF","#F97316","#34D399","#EC4899"];

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: ${C.bg}; color: ${C.text}; font-family: 'Syne', sans-serif; overflow-x: hidden; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: ${C.bg}; }
::-webkit-scrollbar-thumb { background: #1a2a45; border-radius: 99px; }

/* ── ANIMATED BG CANVAS ─────────────────────────── */
#bg-canvas {
  position: fixed; inset: 0; z-index: 0;
  pointer-events: none; opacity: 1;
}

/* ── PARTICLES ──────────────────────────────────── */
.particle {
  position: fixed; border-radius: 50%; pointer-events: none; z-index: 0;
  animation: particleDrift linear infinite;
}
@keyframes particleDrift {
  0%   { transform: translateY(100vh) translateX(0) scale(0); opacity: 0; }
  10%  { opacity: 1; }
  90%  { opacity: 0.6; }
  100% { transform: translateY(-20px) translateX(var(--dx)) scale(1.2); opacity: 0; }
}

/* ── GRID OVERLAY ───────────────────────────────── */
.grid-overlay {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(rgba(0,245,212,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,245,212,0.025) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

/* ── FLOATING ORBS ──────────────────────────────── */
.orb {
  position: fixed; border-radius: 50%; filter: blur(100px);
  pointer-events: none; z-index: 0; animation: orbFloat ease-in-out infinite alternate;
}
@keyframes orbFloat {
  0%   { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(30px, -20px) scale(1.05); }
  66%  { transform: translate(-20px, 15px) scale(0.97); }
  100% { transform: translate(15px, -30px) scale(1.03); }
}

/* ── LAYOUT ─────────────────────────────────────── */
.app-shell { position: relative; z-index: 1; min-height: 100vh; }

/* ── NAV ─────────────────────────────────────────── */
.nav {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem; height: 62px;
  background: rgba(6,11,24,0.85);
  border-bottom: 1px solid rgba(0,245,212,0.1);
  position: sticky; top: 0; z-index: 200;
  backdrop-filter: blur(20px) saturate(180%);
}
.logo {
  font-size: 1.35rem; font-weight: 800; color: ${C.accent};
  letter-spacing: -0.03em; display: flex; align-items: center; gap: 10px;
}
.logo-txt { color: ${C.text}; }
.logo-ai {
  font-size: 0.58rem; color: ${C.accent3}; border: 1px solid rgba(167,139,250,0.4);
  border-radius: 4px; padding: 2px 6px; font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.05em;
}
.nav-tabs { display: flex; gap: 3px; }
.nav-tab {
  padding: 6px 15px; border-radius: 7px; font-size: 0.82rem; font-weight: 600;
  cursor: pointer; border: none; background: transparent; color: ${C.muted};
  transition: all 0.18s; letter-spacing: 0.02em; font-family: 'Syne', sans-serif;
}
.nav-tab:hover { color: ${C.text}; background: rgba(255,255,255,0.05); }
.nav-tab.active { background: rgba(0,245,212,0.1); color: ${C.accent}; }
.nav-tab.ask-tab { color: ${C.accent3}; }
.nav-tab.ask-tab.active { background: rgba(167,139,250,0.12); }
.file-chip {
  display: flex; align-items: center; gap: 6px;
  background: rgba(0,245,212,0.07); border: 1px solid rgba(0,245,212,0.2);
  border-radius: 20px; padding: 4px 12px; font-size: 0.75rem;
  color: ${C.accent}; font-family: 'JetBrains Mono', monospace;
  max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── HOME ────────────────────────────────────────── */
.home {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: calc(100vh - 62px); padding: 2rem; text-align: center; position: relative;
}
.ai-pill {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.3);
  border-radius: 20px; padding: 5px 14px; font-size: 0.73rem;
  color: ${C.accent3}; font-family: 'JetBrains Mono', monospace;
  margin-bottom: 1.4rem; animation: fadeUp 0.6s ease both;
}
.pulse-dot {
  width: 6px; height: 6px; border-radius: 50%; background: ${C.accent3};
  animation: pulse 1.8s ease infinite;
}
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }

.hero-title {
  font-size: clamp(2.8rem, 6.5vw, 5.6rem); font-weight: 800;
  line-height: 1.04; letter-spacing: -0.045em;
  animation: fadeUp 0.7s 0.1s ease both;
}
.hl  { color: ${C.accent}; }
.hl2 { color: ${C.accent2}; }
.hl3 { color: ${C.accent3}; }

.hero-sub {
  font-size: 1.05rem; color: ${C.muted}; margin-top: 1.3rem; max-width: 480px;
  line-height: 1.8; font-family: 'JetBrains Mono', monospace; font-weight: 300;
  animation: fadeUp 0.7s 0.2s ease both;
}
.hero-ctas { display: flex; gap: 12px; margin-top: 2.5rem; flex-wrap: wrap; justify-content: center; animation: fadeUp 0.7s 0.3s ease both; }
.btn-primary {
  padding: 13px 30px; background: ${C.accent}; color: #060B18;
  border: none; border-radius: 9px; font-family: 'Syne', sans-serif;
  font-weight: 700; font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,245,212,0.35); }
.btn-ghost {
  padding: 13px 30px; background: transparent; color: ${C.text};
  border: 1.5px solid rgba(255,255,255,0.12); border-radius: 9px;
  font-family: 'Syne', sans-serif; font-weight: 600; font-size: 0.95rem;
  cursor: pointer; transition: all 0.2s;
}
.btn-ghost:hover { border-color: rgba(255,255,255,0.35); background: rgba(255,255,255,0.04); }

.feat-row {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 14px;
  margin-top: 4rem; max-width: 900px; width: 100%;
  animation: fadeUp 0.7s 0.4s ease both;
}
.feat-card {
  background: rgba(13,21,38,0.8); border: 1px solid ${C.border};
  border-radius: 14px; padding: 22px; text-align: left;
  transition: border-color 0.25s, transform 0.25s;
  backdrop-filter: blur(10px);
}
.feat-card:hover { border-color: rgba(0,245,212,0.25); transform: translateY(-3px); }
.feat-ico { margin-bottom: 14px; color: ${C.accent}; }
.feat-name { font-weight: 700; font-size: 0.92rem; margin-bottom: 5px; }
.feat-desc { font-size: 0.78rem; color: ${C.muted}; line-height: 1.65; font-family: 'JetBrains Mono', monospace; }

/* ── UPLOAD ──────────────────────────────────────── */
.upload-page { padding: 2.5rem; max-width: 700px; margin: 0 auto; }
.pg-title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 4px; }
.pg-sub { color: ${C.muted}; font-size: 0.82rem; font-family: 'JetBrains Mono', monospace; margin-bottom: 2rem; }

.dropzone {
  border: 2px dashed rgba(0,245,212,0.2); border-radius: 18px;
  padding: 4rem 2rem; text-align: center; cursor: pointer;
  transition: all 0.25s; background: rgba(0,245,212,0.015);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center;
}
.dropzone::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,245,212,0.04), transparent);
  pointer-events: none;
}
.dropzone:hover, .dropzone.drag { border-color: ${C.accent}; background: rgba(0,245,212,0.04); }
.dz-ico { margin-bottom: 1.2rem; color: ${C.accent}; }
.dz-title { font-size: 1rem; font-weight: 700; margin-bottom: 6px; }
.dz-sub { font-size: 0.78rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }
.file-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(0,245,212,0.1); border: 1px solid rgba(0,245,212,0.3);
  border-radius: 20px; padding: 6px 14px; font-size: 0.78rem;
  color: ${C.accent}; margin-top: 1.2rem; font-family: 'JetBrains Mono', monospace;
}
.upload-btn {
  width: 100%; margin-top: 1.4rem; padding: 14px;
  background: ${C.accent}; color: #060B18; border: none; border-radius: 11px;
  font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem;
  cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em;
}
.upload-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,245,212,0.35); }
.upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pbar { height: 3px; background: rgba(0,245,212,0.1); border-radius: 99px; margin-top: 1rem; overflow: hidden; }
.pfill { height: 100%; background: ${C.accent}; border-radius: 99px; transition: width 0.4s ease; box-shadow: 0 0 12px rgba(0,245,212,0.6); }
.pstatus { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 8px; font-size: 0.75rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

/* ── DASHBOARD ───────────────────────────────────── */
.dash { padding: 2rem 2.5rem; }
.dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 12px; }
.stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 1.8rem; }
.stat-card {
  background: rgba(13,21,38,0.9); border: 1px solid ${C.border};
  border-radius: 13px; padding: 18px; position: relative; overflow: hidden;
  backdrop-filter: blur(10px);
}
.stat-card::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: var(--accent-color, ${C.accent}); opacity: 0.6;
}
.stat-lbl { font-size: 0.7rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; text-transform: uppercase; }
.stat-val { font-size: 1.9rem; font-weight: 800; margin: 6px 0 2px; letter-spacing: -0.03em; }
.stat-desc { font-size: 0.7rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.chart-card {
  background: rgba(13,21,38,0.9); border: 1px solid ${C.border};
  border-radius: 13px; padding: 18px; backdrop-filter: blur(10px);
}
.chart-card.full { grid-column: 1/-1; }
.chart-title { font-size: 0.88rem; font-weight: 700; margin-bottom: 3px; }
.chart-sub { font-size: 0.7rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; margin-bottom: 14px; }

/* Stats mini-row inside chart cards */
.mini-stats { display: flex; gap: 16px; margin-bottom: 12px; flex-wrap: wrap; }
.mini-stat { font-size: 0.7rem; font-family: 'JetBrains Mono', monospace; }
.mini-stat-val { font-weight: 700; }
.mini-stat-lbl { color: ${C.muted}; margin-left: 3px; }

/* Donut center label */
.donut-wrap { position: relative; }
.donut-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  text-align: center; pointer-events: none; }
.donut-center-num { font-size: 1.2rem; font-weight: 800; color: ${C.text}; }
.donut-center-lbl { font-size: 0.62rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

/* Section dividers in dashboard */
.dash-section-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.1em; color: ${C.muted}; font-family: 'JetBrains Mono', monospace;
  margin: 1.8rem 0 0.8rem; display: flex; align-items: center; gap: 10px; }
.dash-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.06); }

/* Custom legend */
.custom-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.legend-item { display: flex; align-items: center; gap: 5px; font-size: 0.7rem;
  font-family: 'JetBrains Mono', monospace; color: ${C.muted}; }
.legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

/* ── SUMMARY ─────────────────────────────────────── */
.sum-page { padding: 2.5rem; max-width: 880px; margin: 0 auto; }
.sblock {
  background: rgba(13,21,38,0.9); border: 1px solid ${C.border};
  border-radius: 14px; padding: 24px; margin-bottom: 16px;
  position: relative; overflow: hidden; backdrop-filter: blur(10px);
}
.sblock-glow {
  position: absolute; top: -80px; right: -80px; width: 200px; height: 200px;
  border-radius: 50%; filter: blur(60px); pointer-events: none; opacity: 0.12;
}
.sblock-label {
  font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
  color: ${C.accent}; font-family: 'JetBrains Mono', monospace; margin-bottom: 14px;
}
.sum-text { font-size: 0.87rem; color: ${C.text}; line-height: 1.95; font-family: 'JetBrains Mono', monospace; white-space: pre-wrap; }
.note-row { display: flex; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
.note-row:last-child { border-bottom: none; }
.note-pip { width: 5px; height: 5px; border-radius: 50%; background: ${C.accent}; margin-top: 9px; flex-shrink: 0; }
.note-txt { font-size: 0.83rem; color: ${C.text}; font-family: 'JetBrains Mono', monospace; line-height: 1.75; }
.data-tag {
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  font-size: 0.69rem; font-family: 'JetBrains Mono', monospace; margin: 3px;
}
.col-tbl { width: 100%; border-collapse: collapse; font-size: 0.78rem; font-family: 'JetBrains Mono', monospace; }
.col-tbl th { text-align: left; padding: 8px 12px; color: ${C.muted}; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.07em; }
.col-tbl td { padding: 8px 12px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.col-tbl tr:last-child td { border-bottom: none; }
.regen-btn {
  display: flex; align-items: center; gap: 6px; padding: 7px 14px;
  background: rgba(167,139,250,0.09); border: 1px solid rgba(167,139,250,0.28);
  border-radius: 8px; font-size: 0.76rem; color: ${C.accent3};
  cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.2s;
}
.regen-btn:hover:not(:disabled) { background: rgba(167,139,250,0.16); }
.regen-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.model-credit {
  display: inline-flex; align-items: center; gap: 5px; font-size: 0.67rem;
  font-family: 'JetBrains Mono', monospace; color: ${C.accent3}; margin-top: 10px; opacity: 0.6;
}

/* ── CHAT / ASK AI ───────────────────────────────── */
.ask-page {
  padding: 1.5rem 2.5rem 0; max-width: 860px; margin: 0 auto;
  display: flex; flex-direction: column; height: calc(100vh - 62px);
}
.ask-hdr { margin-bottom: 1rem; flex-shrink: 0; }
.data-context-bar {
  display: flex; align-items: center; gap: 8px; padding: 8px 14px;
  background: rgba(0,245,212,0.06); border: 1px solid rgba(0,245,212,0.15);
  border-radius: 10px; margin-bottom: 1rem; flex-shrink: 0; flex-wrap: wrap; gap: 6px;
}
.ctx-chip {
  display: flex; align-items: center; gap: 5px; font-size: 0.7rem; 
  font-family: 'JetBrains Mono', monospace;
  color: ${C.accent}; background: rgba(0,245,212,0.1); border-radius: 4px; padding: 4px 8px;
}
.ctx-label { font-size: 0.72rem; color: ${C.muted}; font-family: 'JetBrains Mono', monospace; }

.sq-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 1rem; flex-shrink: 0; }
.sq {
  padding: 5px 12px; background: rgba(0,245,212,0.05);
  border: 1px solid rgba(0,245,212,0.18); border-radius: 20px;
  font-size: 0.72rem; color: ${C.accent}; cursor: pointer;
  transition: all 0.18s; font-family: 'JetBrains Mono', monospace;
}
.sq:hover { background: rgba(0,245,212,0.12); border-color: rgba(0,245,212,0.4); }

.messages {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column;
  gap: 14px; padding: 4px 0 1rem; min-height: 0;
}
.msg { display: flex; gap: 10px; animation: fadeUp 0.28s ease; }
.msg.user { flex-direction: row-reverse; }
@keyframes fadeUp { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }

.avatar {
  width: 34px; height: 34px; border-radius: 9px; display: flex;
  align-items: center; justify-content: center; font-size: 0.88rem;
  flex-shrink: 0; font-weight: 700;
}
.avatar.ai   { background: rgba(167,139,250,0.15); color: ${C.accent3}; }
.avatar.user { background: rgba(254,109,115,0.15); color: ${C.accent2}; }

.bubble {
  max-width: 84%; padding: 13px 16px; border-radius: 13px;
  font-size: 0.84rem; line-height: 1.85; font-family: 'JetBrains Mono', monospace;
  word-break: break-word;
}
.bubble.ai {
  background: rgba(13,21,38,0.95); border: 1px solid rgba(167,139,250,0.15);
  color: ${C.text}; border-radius: 2px 13px 13px 13px;
}
.bubble.user {
  background: rgba(254,109,115,0.09); border: 1px solid rgba(254,109,115,0.2);
  color: ${C.text}; border-radius: 13px 2px 13px 13px;
}

.typing-indicator { display: flex; align-items: center; gap: 3px; padding: 4px 0; }
.typing-indicator span {
  width: 5px; height: 5px; border-radius: 50%; background: ${C.accent3};
  animation: blink 1.3s ease infinite;
}
.typing-indicator span:nth-child(2) { animation-delay: 0.18s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.36s; }
@keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }

.chat-footer { padding: 1rem 0 1.2rem; flex-shrink: 0; border-top: 1px solid rgba(255,255,255,0.06); }
.chat-row { display: flex; gap: 10px; align-items: flex-end; }
.chat-input {
  flex: 1; background: rgba(13,21,38,0.95); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 11px; padding: 12px 16px; color: ${C.text};
  font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; outline: none;
  transition: border-color 0.2s; resize: none; min-height: 48px;
}
.chat-input:focus { border-color: rgba(167,139,250,0.4); }
.send-btn {
  padding: 12px 18px; background: ${C.accent3}; color: #060B18; display: flex; align-items: center; justify-content: center;
  border: none; border-radius: 11px; cursor: pointer; font-size: 1rem;
  transition: all 0.2s; font-weight: 800; min-width: 48px; min-height: 48px;
}
.send-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(167,139,250,0.4); }
.send-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── SHARED UTILS ────────────────────────────────── */
.no-data {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 14px; padding: 5rem 2rem; color: ${C.muted};
  font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; text-align: center;
}
.no-data-ico { opacity: 0.5; margin-bottom: 0.5rem; display: flex; justify-content: center; }
.spin {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(167,139,250,0.25); border-top-color: ${C.accent3};
  border-radius: 50%; animation: sp 0.7s linear infinite;
}
@keyframes sp { to { transform: rotate(360deg); } }

/* ── RICH TEXT ───────────────────────────────────── */
.rt-h2  { font-weight: 800; color: ${C.accent}; font-size: 0.92rem; margin: 10px 0 4px; }
.rt-h3  { font-weight: 700; color: ${C.accent}; font-size: 0.86rem; margin: 8px 0 3px; }
.rt-li  { display: flex; gap: 8px; margin-top: 4px; }
.rt-pip { color: ${C.accent}; flex-shrink: 0; }
.rt-num { color: ${C.muted}; flex-shrink: 0; min-width: 18px; }
.rt-gap { height: 6px; }
.rt-bold { color: ${C.accent}; font-weight: 600; }
.rt-code { background: rgba(0,245,212,0.09); padding: 1px 5px; border-radius: 4px; color: ${C.accent}; font-size: 0.9em; }
.rt-table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 0.78rem; }
.rt-table th { padding: 6px 10px; border-bottom: 1px solid rgba(0,245,212,0.2); color: ${C.accent}; text-align: left; }
.rt-table td { padding: 6px 10px; border-bottom: 1px solid rgba(255,255,255,0.05); }

@media (max-width: 768px) {
  .feat-row { grid-template-columns: 1fr; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .chart-grid { grid-template-columns: 1fr; }
  .ask-page { padding: 1rem; }
  .nav-tabs .nav-tab { padding: 5px 9px; font-size: 0.75rem; }
}
`;

// ── ANIMATED BACKGROUND ────────────────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    // Nodes
    const N = 55;
    const nodes = Array.from({ length: N }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      color: [C.accent, C.accent2, C.accent3, C.yellow, C.blue][Math.floor(Math.random()*5)],
    }));

    // Wave state
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // ── flowing wave lines ──
      for (let wave = 0; wave < 3; wave++) {
        const hue = [C.accent, C.accent3, C.accent2][wave];
        ctx.beginPath();
        ctx.strokeStyle = hue + "22";
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 4) {
          const y = H/2
            + Math.sin(x/180 + t + wave*1.2) * 40
            + Math.sin(x/90  + t*1.3 + wave) * 20
            + Math.cos(x/260 + t*0.7) * 60;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // ── node connections ──
      for (let i = 0; i < N; i++) {
        for (let j = i+1; j < N; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 140) {
            const alpha = (1 - dist/140) * 0.18;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,245,212,${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // ── nodes ──
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;

        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r*3);
        grd.addColorStop(0, n.color + "cc");
        grd.addColorStop(1, "transparent");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // ── scanning line ──
      const scanY = ((t * 40) % H);
      const scanGrad = ctx.createLinearGradient(0, scanY-30, 0, scanY+30);
      scanGrad.addColorStop(0, "transparent");
      scanGrad.addColorStop(0.5, "rgba(0,245,212,0.04)");
      scanGrad.addColorStop(1, "transparent");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY-30, W, 60);

      t += 0.006;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="bg-canvas"
      style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}
    />
  );
}

// ── DATA HELPERS ───────────────────────────────────────────────────────────────

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  const s = String(v).trim().toLowerCase();
  return s === "" || s === "null" || s === "n/a" || s === "na" || s === "undefined" || s === "-";
}

function detectType(vals) {
  const ne = vals.filter(v => !isEmpty(v));
  if (!ne.length) return "empty";
  const nums = ne.filter(v => !isNaN(parseFloat(v)) && isFinite(v));
  return nums.length / ne.length > 0.78 ? "numeric" : "categorical";
}

function analyzeData(rows) {
  if (!rows.length) return null;
  const cols = Object.keys(rows[0]);
  const colInfo = cols.map(col => {
    const allVals = rows.map(r => r[col]);
    const vals = allVals.filter(v => !isEmpty(v));
    const emptyCount = allVals.length - vals.length;
    const type = detectType(vals);
    if (type === "numeric") {
      const nums = vals.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).map(Number);
      if (!nums.length) return { col, type: "empty", emptyCount: allVals.length };
      const sum  = nums.reduce((a,b)=>a+b,0);
      const sorted = [...nums].sort((a,b)=>a-b);
      const mid    = Math.floor(nums.length/2);
      const median = nums.length%2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
      const mean   = sum/nums.length;
      const std    = Math.sqrt(nums.reduce((a,n)=>a+(n-mean)**2,0)/nums.length);
      return {
        col, type, count: nums.length, emptyCount,
        min: sorted[0], max: sorted[sorted.length-1],
        mean: +mean.toFixed(3), median: +median.toFixed(3),
        std: +std.toFixed(3), sum: +sum.toFixed(2),
        q1: sorted[Math.floor(nums.length*0.25)],
        q3: sorted[Math.floor(nums.length*0.75)],
        zeros: nums.filter(n=>n===0).length,
        negatives: nums.filter(n=>n<0).length,
      };
    }
    const freq = {};
    vals.forEach(v => {
      const key = String(v).trim();
      if (key) freq[key] = (freq[key]||0)+1;
    });
    const entries = Object.entries(freq).sort((a,b)=>b[1]-a[1]);
    return {
      col, type, unique: entries.length, emptyCount,
      top: entries.slice(0, 8),
      nullCount: emptyCount,
    };
  });
  const validCols = colInfo.filter(c => c.type !== "empty");
  return { rows: rows.length, cols: validCols.length, colInfo: validCols };
}

function serializeFullData(rows, analysis) {
  if (!rows.length) return "";
  const cols = analysis.colInfo.map(c => c.col);
  const header = cols.join(" | ");
  const maxRows = Math.min(rows.length, 400);
  const step = rows.length > 400 ? Math.floor(rows.length / 400) : 1;
  const sampled = [];
  for (let i = 0; i < rows.length && sampled.length < maxRows; i += step) {
    const rowVals = cols.map(c => {
      const v = rows[i][c];
      return isEmpty(v) ? "" : String(v).trim();
    });
    if (rowVals.every(v => v === "")) continue;
    sampled.push(rowVals.join(" | "));
  }
  return `${header}\n${sampled.join("\n")}`;
}

function buildFullContext(analysis, fileName, rows) {
  const numCols = analysis.colInfo.filter(c=>c.type==="numeric");
  const catCols = analysis.colInfo.filter(c=>c.type==="categorical");

  const statsBlock = [
    `=== DATASET: "${fileName}" ===`,
    `Total rows: ${analysis.rows.toLocaleString()} | Total columns: ${analysis.cols}`,
    `NOTE: Empty, null, blank, N/A values are excluded from all statistics and counts below.`,
    ``,
    `=== NUMERIC COLUMNS (${numCols.length}) ===`,
    ...numCols.map(c =>
      `${c.col}:\n  non_empty_count=${c.count} (empty/blank rows excluded), min=${c.min}, max=${c.max}, mean=${c.mean}, median=${c.median}, std=${c.std}, sum=${c.sum?.toLocaleString()}, q1=${c.q1}, q3=${c.q3}, zeros=${c.zeros}, negatives=${c.negatives}${c.emptyCount>0?`, empty_cells_ignored=${c.emptyCount}`:""}`
    ),
    ``,
    `=== CATEGORICAL COLUMNS (${catCols.length}) ===`,
    ...catCols.map(c =>
      `${c.col}:\n  unique_values=${c.unique} (excluding blank), empty_cells_ignored=${c.nullCount||0}\n  top_values: ${c.top.slice(0,6).map(([v,n])=>`"${v}"(n=${n},${(n/analysis.rows*100).toFixed(1)}%)`).join(", ")}`
    ),
  ].join("\n");

  const dataBlock = serializeFullData(rows, analysis);

  return `${statsBlock}\n\n=== FULL DATA SAMPLE (up to 400 rows, pipe-separated, blank rows skipped) ===\n${dataBlock}`;
}

function buildCharts(rows, colInfo) {
  const charts = [];
  const nums = colInfo.filter(c => c.type === "numeric");
  const cats = colInfo.filter(c => c.type === "categorical" && c.unique > 1 && c.unique <= 20);

  const safeNum = v => { const n = parseFloat(v); return (!isNaN(n) && isFinite(n)) ? n : null; };
  const validRows = (colA, colB) => rows.filter(r =>
    !isEmpty(r[colA]) && !isEmpty(r[colB]) &&
    safeNum(r[colA]) !== null && safeNum(r[colB]) !== null
  );

  // 1. DONUT CHART
  cats.slice(0, 4).forEach(c => {
    const data = c.top.slice(0, 8)
      .filter(([name]) => name && !isEmpty(name))
      .map(([name, value]) => ({ name: String(name).trim().slice(0, 18), value }));
    if (data.length > 1) charts.push({ type: "donut", title: `${c.col}`, sub: `${c.unique} unique values · top ${data.length} shown`, data, total: data.reduce((s, d) => s + d.value, 0) });
  });

  // 2. HORIZONTAL BAR
  if (cats.length && nums.length) {
    const cat = cats[0].col, num = nums[0].col;
    const agg = {};
    rows.forEach(r => {
      if (isEmpty(r[cat]) || isEmpty(r[num])) return;
      const k = String(r[cat]).trim().slice(0, 22);
      const n = safeNum(r[num]);
      if (k && n !== null) agg[k] = (agg[k] || 0) + n;
    });
    const data = Object.entries(agg)
      .filter(([name]) => name)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, value]) => ({ name, value: +value.toFixed(2) }));
    if (data.length > 1) charts.push({ type: "hbar", title: `Top ${num} by ${cat}`, sub: "Horizontal ranking · sorted by value", data });
  }

  // 3. GROUPED BAR
  if (cats.length >= 1 && nums.length >= 2) {
    const cat = cats[0].col;
    const numPair = nums.slice(0, 3);
    const agg = {};
    rows.forEach(r => {
      if (isEmpty(r[cat])) return;
      const k = String(r[cat]).trim().slice(0, 20);
      if (!k) return;
      if (!agg[k]) agg[k] = { name: k };
      numPair.forEach(nc => {
        const n = safeNum(r[nc.col]);
        if (n !== null) agg[k][nc.col] = (agg[k][nc.col] || 0) + n;
      });
    });
    const data = Object.values(agg).sort((a, b) => (b[numPair[0].col] || 0) - (a[numPair[0].col] || 0)).slice(0, 8);
    if (data.length > 1 && numPair.length >= 2) charts.push({ type: "grouped", title: `${cat} — Multi-Metric`, sub: `${numPair.map(n => n.col).join(", ")} compared`, data, keys: numPair.map(n => n.col) });
  }

  // 4. LINE TREND
  nums.slice(0, 3).forEach(nc => {
    const validR = rows.filter(r => !isEmpty(r[nc.col]) && safeNum(r[nc.col]) !== null);
    const step = Math.max(1, Math.floor(validR.length / 60));
    const data = [];
    for (let i = 0; i < validR.length && data.length < 60; i += step) {
      const v = safeNum(validR[i][nc.col]);
      if (v !== null) data.push({ idx: data.length + 1, value: v });
    }
    if (data.length > 3) charts.push({ type: "line", title: `${nc.col} — Trend`, sub: `Range: ${nc.min} – ${nc.max} · Mean: ${nc.mean}`, data, mean: nc.mean, col: nc.col });
  });

  // 5. AREA CHART
  if (nums.length >= 2) {
    const k0 = nums[0].col, k1 = nums[1].col;
    const vrows = validRows(k0, k1);
    const step = Math.max(1, Math.floor(vrows.length / 55));
    const data = [];
    for (let i = 0; i < vrows.length && data.length < 55; i += step) {
      data.push({ idx: data.length + 1, [k0]: safeNum(vrows[i][k0]), [k1]: safeNum(vrows[i][k1]) });
    }
    if (data.length > 3) charts.push({ type: "area", title: `${k0} vs ${k1} Over Time`, sub: "Dual-axis area comparison", data, keys: [k0, k1] });
  }

  // 6. HISTOGRAM
  nums.slice(0, 2).forEach(nc => {
    const vals = rows.map(r => safeNum(r[nc.col])).filter(v => v !== null);
    if (vals.length < 5) return;
    const min = nc.min, max = nc.max, bins = Math.min(15, Math.ceil(Math.sqrt(vals.length)));
    const bw = (max - min) / bins || 1;
    const buckets = Array.from({ length: bins }, (_, i) => ({
      label: `${(min + i * bw).toFixed(1)}`,
      count: 0,
      range: `${(min + i * bw).toFixed(1)}–${(min + (i + 1) * bw).toFixed(1)}`
    }));
    vals.forEach(v => {
      const bi = Math.min(bins - 1, Math.floor((v - min) / bw));
      if (bi >= 0) buckets[bi].count++;
    });
    charts.push({ type: "histogram", title: `${nc.col} — Distribution`, sub: `${bins} bins · ${vals.length} values`, data: buckets, mean: nc.mean, median: nc.median });
  });

  // 7. SCATTER PLOT
  if (nums.length >= 2) {
    const k0 = nums[0].col, k1 = nums[1].col;
    const vrows = validRows(k0, k1);
    const step = Math.max(1, Math.floor(vrows.length / 90));
    const data = [];
    for (let i = 0; i < vrows.length && data.length < 90; i += step) {
      data.push({ x: safeNum(vrows[i][k0]), y: safeNum(vrows[i][k1]) });
    }
    if (data.length > 4) charts.push({ type: "scatter", title: `${k0} × ${k1}`, sub: "Scatter correlation", data, xKey: k0, yKey: k1 });
  }

  // 8. RADIAL BAR
  if (nums.length >= 2) {
    const radData = nums.slice(0, 6).map((nc, i) => ({
      name: nc.col.slice(0, 14),
      value: nc.max > 0 ? Math.round((nc.mean / nc.max) * 100) : 0,
      fill: PALETTE[i % PALETTE.length]
    })).filter(d => d.value > 0);
    if (radData.length >= 2) charts.push({ type: "radial", title: "Mean as % of Max", sub: "How average compares to maximum per column", data: radData });
  }

  // 9. COMPOSED (Bar + Line)
  if (cats.length >= 1 && nums.length >= 1) {
    const cat = cats.length >= 2 ? cats[1].col : cats[0].col;
    const num = nums[0].col;
    const agg = {}, cnt = {};
    rows.forEach(r => {
      if (isEmpty(r[cat]) || isEmpty(r[num])) return;
      const k = String(r[cat]).trim().slice(0, 20);
      const n = safeNum(r[num]);
      if (k && n !== null) { agg[k] = (agg[k] || 0) + n; cnt[k] = (cnt[k] || 0) + 1; }
    });
    const data = Object.entries(agg)
      .filter(([name]) => name)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([name, total]) => ({ name, total: +total.toFixed(2), avg: +(total / cnt[name]).toFixed(2) }));
    if (data.length > 2) charts.push({ type: "composed", title: `${cat} — Total & Average ${num}`, sub: "Bars = total · Line = average per category", data });
  }

  // 10. NEW: RADAR CHART (Category profiles across metrics)
  if (cats.length >= 1 && nums.length >= 3) {
    const cat = cats[0].col;
    const topCats = cats[0].top.slice(0, 3).map(t => t[0]); // Analyze top 3 categories
    const metrics = nums.slice(0, 5); // Up to 5 numeric columns
    
    const data = metrics.map(m => {
      const row = { metric: m.col.slice(0, 12) };
      topCats.forEach(tc => {
          const matches = rows.filter(r => r[cat] === tc && safeNum(r[m.col]) !== null);
          const sum = matches.reduce((s, r) => s + safeNum(r[m.col]), 0);
          const avg = matches.length ? (sum / matches.length) : 0;
          // Normalize so disparate scales look good on the radar (percentage of column max)
          row[tc] = m.max > 0 ? +((avg / m.max) * 100).toFixed(1) : 0;
      });
      return row;
    });
    if (data.length > 2) charts.push({ type: "radar", title: `${cat} — Metric Profile`, sub: `Normalized means (% of max) for top groups`, data, keys: topCats });
  }

  // 11. NEW: DEVIATION / VARIANCE BAR
  if (cats.length >= 1 && nums.length >= 1) {
    const cat = cats[0].col;
    const num = nums.length > 1 ? nums[1] : nums[0]; // Use 2nd num if possible
    const mean = num.mean;
    const agg = {}, cnt = {};
    rows.forEach(r => {
      if (isEmpty(r[cat]) || isEmpty(r[num.col])) return;
      const k = String(r[cat]).trim().slice(0, 20);
      const n = safeNum(r[num.col]);
      if (k && n !== null) { agg[k] = (agg[k]||0) + n; cnt[k] = (cnt[k]||0) + 1; }
    });
    const data = Object.entries(agg)
      .map(([name, val]) => ({ name, diff: +((val/cnt[name]) - mean).toFixed(2), avg: +(val/cnt[name]).toFixed(2) }))
      .sort((a,b) => b.diff - a.diff)
      .filter(d => d.diff !== 0)
      .slice(0, 12);
      
    if (data.length > 2) charts.push({ type: "deviation", title: `${num.col} — Variance`, sub: `+/- deviation from global mean (${mean}) by ${cat}`, data, yKey: "diff" });
  }

  // 12. NEW: STACKED BAR CHART
  if (cats.length >= 2 && nums.length >= 2) {
    const cat = cats[1].col; // Use the 2nd categorical column
    const numPair = nums.slice(-2); // Use the last two numeric cols to mix it up
    const agg = {};
    rows.forEach(r => {
      if (isEmpty(r[cat])) return;
      const k = String(r[cat]).trim().slice(0, 20);
      if (!k) return;
      if (!agg[k]) agg[k] = { name: k };
      numPair.forEach(nc => {
        const n = safeNum(r[nc.col]);
        if (n !== null) agg[k][nc.col] = (agg[k][nc.col] || 0) + n;
      });
    });
    const data = Object.values(agg).sort((a, b) => (b[numPair[0].col] || 0) - (a[numPair[0].col] || 0)).slice(0, 8);
    if (data.length > 1) charts.push({ type: "stacked", title: `${cat} — Stacked Composition`, sub: `${numPair.map(n=>n.col).join(" + ")}`, data, keys: numPair.map(n=>n.col) });
  }

  // 13. NEW: 3D BUBBLE CHART (Scatter with Size)
  if (nums.length >= 3) {
    const k0 = nums[0].col, k1 = nums[1].col, k2 = nums[2].col;
    const vrows = rows.filter(r => safeNum(r[k0]) !== null && safeNum(r[k1]) !== null && safeNum(r[k2]) !== null);
    const step = Math.max(1, Math.floor(vrows.length / 80));
    const data = [];
    for (let i = 0; i < vrows.length && data.length < 80; i += step) {
      data.push({ x: safeNum(vrows[i][k0]), y: safeNum(vrows[i][k1]), z: safeNum(vrows[i][k2]) });
    }
    if (data.length > 4) charts.push({ type: "bubble", title: `${k0} × ${k1} (Size: ${k2})`, sub: "3D Bubble Correlation", data, xKey: k0, yKey: k1, zKey: k2 });
  }

  return charts;
}

// ── OpenApi AI ─────────────────────────────────────────────────────────────────
async function callOpenAI(messages) {
  const res = await fetch("http://localhost:3001/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  const data = await res.json();
  return data.reply;
}
// ── RICH TEXT RENDERER ─────────────────────────────────────────────────────────
function Md({ text }) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## "))  { elements.push(<div key={i} className="rt-h2">{inlineRender(line.slice(3))}</div>); i++; continue; }
    if (line.startsWith("### ")) { elements.push(<div key={i} className="rt-h3">{inlineRender(line.slice(4))}</div>); i++; continue; }
    if (line.match(/^[\-\*] /))  { elements.push(<div key={i} className="rt-li"><span className="rt-pip">▸</span><span>{inlineRender(line.slice(2))}</span></div>); i++; continue; }
    if (line.match(/^\d+\. /))   { const m=line.match(/^(\d+)\. /); elements.push(<div key={i} className="rt-li"><span className="rt-num">{m[1]}.</span><span>{inlineRender(line.slice(m[0].length))}</span></div>); i++; continue; }
    if (line.trim()==="")        { elements.push(<div key={i} className="rt-gap"/>); i++; continue; }
    elements.push(<div key={i} style={{marginTop:2}}>{inlineRender(line)}</div>);
    i++;
  }
  return <div>{elements}</div>;
}

function inlineRender(txt) {
  return txt.split(/(\*\*.*?\*\*|`[^`]+`)/g).map((p,i)=>{
    if (p.startsWith("**")&&p.endsWith("**")) return <span key={i} className="rt-bold">{p.slice(2,-2)}</span>;
    if (p.startsWith("`")&&p.endsWith("`"))   return <span key={i} className="rt-code">{p.slice(1,-1)}</span>;
    return p;
  });
}

// ── APP ────────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,        setTab]       = useState("home");
  const [file,       setFile]      = useState(null);
  const [rows,       setRows]      = useState([]);
  const [analysis,   setAnalysis]  = useState(null);
  const [charts,     setCharts]    = useState([]);
  const [progress,   setProgress]  = useState(0);
  const [loading,    setLoading]   = useState(false);
  const [drag,       setDrag]      = useState(false);

  const [aiOverview, setAiOverview] = useState("");
  const [aiNotes,    setAiNotes]    = useState([]);
  const [sumLoading, setSumLoading] = useState(false);

  const [messages,     setMessages]     = useState([{ role:"ai", text:"Hi! I'm your **AI data analyst**, powered by Open AI.\n\nUpload a CSV or Excel file and I'll have full access to all your data — every row, every column. Ask me anything: trends, statistics, outliers, comparisons, summaries, predictions — I'll give you real, data-driven answers." }]);
  const [chatHistory,  setChatHistory]  = useState([]);
  const [input,        setInput]        = useState("");
  const [thinking,     setThinking]     = useState(false);
  const [fullCtx,      setFullCtx]      = useState("");

  const fileRef    = useRef();
  const chatEndRef = useRef();

  useEffect(()=>{ chatEndRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);

  const generateSummary = async (a, f, r, ctx) => {
    setSumLoading(true); setAiOverview(""); setAiNotes([]);
    const sys = `You are a world-class data analyst. You have FULL access to the dataset. Analyze it deeply and produce:

OVERVIEW:
A rich, specific 5–7 sentence paragraph describing what this dataset is about, its scale, key patterns, distributions, notable values, and what business or analytical story it tells. Mention actual numbers and column names.

NOTES:
10 highly specific, data-driven bullet insights using exact values from the data. Include: statistical highlights, distributions, correlations, anomalies, top performers, comparisons. Be precise — cite actual numbers.

Respond EXACTLY in this format, nothing else:
OVERVIEW:
<paragraph>

NOTES:
- <insight with real numbers>
- <insight with real numbers>
...`;
    try {
      const resp = await callOpenAI([
  { role: "system", content: sys },
  { role: "user", content: `Here is the complete dataset context:\n\n${ctx}` }
]);
      const ov = resp.match(/OVERVIEW:\s*([\s\S]*?)(?=\nNOTES:|$)/i);
      const nt = resp.match(/NOTES:\s*([\s\S]*)/i);
      setAiOverview(ov ? ov[1].trim() : resp.trim());
      if (nt) {
        const notes = nt[1].trim().split("\n")
          .map(l=>l.replace(/^[-*•\d.]\s*/,"").trim())
          .filter(l=>l.length>8);
        setAiNotes(notes);
      }
    } catch(e) {
      setAiOverview(`Dataset "${f.name}": ${a.rows.toLocaleString()} rows, ${a.cols} columns. AI unavailable: ${e.message}`);
    }
    setSumLoading(false);
  };

  const processFile = useCallback((f) => {
    setFile(f); setLoading(true); setProgress(8);
    const ext = f.name.split(".").pop().toLowerCase();
    const reader = new FileReader();
    reader.onload = (e) => {
      setProgress(40);
      let parsed = [];
      try {
        if (ext==="csv") {
          parsed = Papa.parse(e.target.result, {header:true, skipEmptyLines:true, dynamicTyping:false}).data;
        } else {
          const wb = XLSX.read(e.target.result, {type:"binary"});
          parsed = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval:"", raw:false});
        }
      } catch(err) { console.error("Parse error:", err); }

      const isJunkCol = (key) => {
        if (!key) return true;
        const k = String(key).trim();
        if (k === "") return true;
        if (/^__EMPTY/i.test(k)) return true;
        if (/^Unnamed:/i.test(k)) return true;
        if (/^Column\d+$/i.test(k)) return true;
        if (/^F\d+$/.test(k)) return true;
        return false;
      };

      if (parsed.length > 0) {
        const goodKeys = Object.keys(parsed[0]).filter(k => !isJunkCol(k));
        parsed = parsed.map(row => {
          const clean = {};
          goodKeys.forEach(k => { clean[k] = row[k]; });
          return clean;
        });
        parsed = parsed.filter(row =>
          Object.values(row).some(v => !isEmpty(v))
        );
      }

      setProgress(68);
      setRows(parsed);
      const a = analyzeData(parsed);
      setAnalysis(a);
      if (a) {
        setCharts(buildCharts(parsed, a.colInfo));
        const ctx = buildFullContext(a, f, parsed);
        setFullCtx(ctx);
        generateSummary(a, f, parsed, ctx);
      }
      setProgress(100);
      const colCount = parsed[0] ? Object.keys(parsed[0]).length : 0;
      setMessages([{role:"ai",text:`**${f.name}** fully loaded!\n\n**${parsed.length.toLocaleString()} rows** · **${colCount} columns** · I have access to all your data.\n\nAsk me anything — I can analyze trends, compute statistics, find outliers, compare groups, and give you deep insights.`}]);
      setChatHistory([]);
      setTimeout(()=>{ setLoading(false); setProgress(0); setTab("dashboard"); }, 500);
    };
    if (ext==="csv") reader.readAsText(f); else reader.readAsBinaryString(f);
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f) processFile(f); };
  const onFile = (e) => { if(e.target.files[0]) processFile(e.target.files[0]); };

  const sendMsg = async () => {
    if (!input.trim() || !rows.length || thinking) return;
    const userText = input.trim();
    setInput(""); setThinking(true);
    setMessages(m=>[...m,{role:"user",text:userText}]);

    const sys = `You are an expert data analyst AI with FULL access to a real dataset. Answer the user's question using the actual data provided. Be specific, cite real numbers, and give genuinely useful insights.

Guidelines:
- Use **bold** for key numbers and findings
- Use bullet points (- item) for lists
- Use ## for section headers if needed
- Reference actual column names and values from the data
- Perform mental calculations when asked (sums, averages, comparisons, %s)
- If you spot something interesting in the data, mention it proactively
- Be concise but thorough

COMPLETE DATASET CONTEXT:
${fullCtx}`;

    const apiHistory = [...chatHistory, {role:"user",content:userText}];
    const trimmed = apiHistory.length > 16
      ? [{role:"user",content:`[Context: continuing our analysis of "${file?.name}"]`}, ...apiHistory.slice(-14)]
      : apiHistory;

    try {
      const reply = await callOpenAI([
  { role: "system", content: sys },
  ...trimmed
]);
      setChatHistory(h=>[...h,{role:"user",content:userText},{role:"assistant",content:reply}]);
      setMessages(m=>[...m,{role:"ai",text:reply}]);
    } catch(err) {
      setMessages(m=>[...m,{role:"ai",text:`**Error:** ${err.message}\n\nPlease try again.`}]);
    }
    setThinking(false);
  };

  const suggestedQs = analysis ? [
    "Give me a complete analysis of this dataset",
     ] : ["What can you tell me about this data?", "Give me a summary", "How many rows are there?"];

  return (
    <>
      <style>{css}</style>
      <AnimatedBackground />
      <div className="grid-overlay"/>

      {/* Floating orbs */}
      <div className="orb" style={{width:500,height:500,background:C.accent,left:"5%",top:"-5%",opacity:0.06,animationDuration:"12s"}}/>
      <div className="orb" style={{width:400,height:400,background:C.accent2,right:"2%",top:"30%",opacity:0.07,animationDuration:"15s",animationDelay:"3s"}}/>
      <div className="orb" style={{width:350,height:350,background:C.accent3,left:"35%",bottom:"5%",opacity:0.06,animationDuration:"18s",animationDelay:"6s"}}/>

      <div className="app-shell">
        {/* NAV */}
        <nav className="nav">
          <div className="logo">
            ⬡ <span className="logo-txt">StatBot</span> Pro
            <span className="logo-ai">AI</span>
          </div>
          <div className="nav-tabs">
            {[
              ["home","Home"],["upload","Upload"],["dashboard","Dashboard"],
              ["summary","Summary"],["ask","✦ Ask AI"],
            ].map(([t,l])=>(
              <button key={t} className={`nav-tab${t==="ask"?" ask-tab":""}${tab===t?" active":""}`} onClick={()=>setTab(t)}>{l}</button>
            ))}
          </div>
          {file && <div className="file-chip"><FileText size={14} /> {file.name}</div>}
        </nav>

        {/* ── HOME ── */}
        {tab==="home" && (
          <div className="home">
            <div className="ai-pill"><div className="pulse-dot"/> AI · Full Data Access</div>
            <h1 className="hero-title">
              Your data,<br/>
              analyzed by <span className="hl">AI</span>.<br/>
              <span className="hl2">Every</span> <span className="hl3">row.</span>
            </h1>
            <p className="hero-sub">Upload CSV or Excel. AI gets access to all your data — not just a summary — and answers any question with real, specific insights.</p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File →</button>
              <button className="btn-ghost" onClick={()=>setTab("ask")}>✦ Chat with AI</button>
            </div>
            <div className="feat-row">
              {[
                {ico:<Brain size={24} />,name:"Full Data Access",desc:"AI reads every single row of your file — not a sample. Answers are based on complete, real data."},
                {ico:<BarChart3 size={24} />,name:"Auto Visualizations",desc:"Bar, pie, area, radar, and bubble charts generated automatically from your data structure."},
                {ico:<MessageSquare size={24} />,name:"Conversational AI",desc:"Ask follow-up questions. AI remembers context across your entire session for deep analysis."},
              ].map(f=>(
                <div className="feat-card" key={f.name}>
                  <div className="feat-ico">{f.ico}</div>
                  <div className="feat-name">{f.name}</div>
                  <div className="feat-desc">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── UPLOAD ── */}
        {tab==="upload" && (
          <div className="upload-page">
            <div className="pg-title">Upload your file</div>
            <div className="pg-sub">CSV, XLSX, or XLS — AI will get full access to all your data</div>
            <div className={`dropzone${drag?" drag":""}`}
              onDragOver={e=>{e.preventDefault();setDrag(true)}}
              onDragLeave={()=>setDrag(false)}
              onDrop={onDrop}
              onClick={()=>fileRef.current.click()}>
              <div className="dz-ico"><UploadCloud size={48} strokeWidth={1.5} /></div>
              <div className="dz-title">Drag & drop your file here</div>
              <div className="dz-sub">or click to browse · CSV, XLSX, XLS</div>
              {file && <div className="file-badge"><CheckCircle2 size={14} /> {file.name} · {(file.size/1024).toFixed(1)} KB</div>}
            </div>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" style={{display:"none"}} onChange={onFile}/>
            {loading && (
              <>
                <div className="pbar"><div className="pfill" style={{width:`${progress}%`}}/></div>
                <div className="pstatus">
                  {progress<50 ? <><FileSpreadsheet size={14} /> Parsing file…</> : progress<80 ? <><Calculator size={14} /> Computing statistics…</> : <><Brain size={14} /> Sending to AI…</>}
                </div>
              </>
            )}
            <button className="upload-btn" disabled={!file||loading} onClick={()=>{if(analysis)setTab("dashboard")}}>
              {loading?"Analyzing…":analysis?"View Dashboard →":"Upload a file to get started"}
            </button>
          </div>
        )}

        {/* ── DASHBOARD ── */}
        {tab==="dashboard" && (
          <div className="dash">
            {!analysis ? (
              <div className="no-data">
                <div className="no-data-ico"><BarChart3 size={40} opacity={0.5} strokeWidth={1.5} /></div>
                <div>No data yet — upload a file to see your dashboard.</div>
                <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File</button>
              </div>
            ) : (
              <>
                <div className="dash-header">
                  <div>
                    <div className="pg-title">{file?.name}</div>
                    <div className="pg-sub">{analysis.rows.toLocaleString()} rows · {analysis.cols} columns · Full AI access enabled</div>
                  </div>
                  <button className="btn-primary" style={{fontSize:"0.8rem",padding:"9px 18px"}} onClick={()=>setTab("ask")}>✦ Ask AI →</button>
                </div>
                <div className="stat-grid">
                  <div className="stat-card" style={{"--accent-color":C.accent}}>
                    <div className="stat-lbl">Total Rows</div>
                    <div className="stat-val" style={{color:C.accent}}>{analysis.rows.toLocaleString()}</div>
                    <div className="stat-desc">records in dataset</div>
                  </div>
                  <div className="stat-card" style={{"--accent-color":C.yellow}}>
                    <div className="stat-lbl">Columns</div>
                    <div className="stat-val" style={{color:C.yellow}}>{analysis.cols}</div>
                    <div className="stat-desc">fields detected</div>
                  </div>
                  <div className="stat-card" style={{"--accent-color":C.accent3}}>
                    <div className="stat-lbl">Numeric Cols</div>
                    <div className="stat-val" style={{color:C.accent3}}>{analysis.colInfo.filter(c=>c.type==="numeric").length}</div>
                    <div className="stat-desc">quantitative fields</div>
                  </div>
                  <div className="stat-card" style={{"--accent-color":C.accent2}}>
                    <div className="stat-lbl">Categorical</div>
                    <div className="stat-val" style={{color:C.accent2}}>{analysis.colInfo.filter(c=>c.type==="categorical").length}</div>
                    <div className="stat-desc">qualitative fields</div>
                  </div>
                </div>
                {/* Numeric column mini stat cards */}
                {analysis.colInfo.filter(c=>c.type==="numeric").length > 0 && (
                  <>
                    <div className="dash-section-label">Numeric Column Stats</div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10,marginBottom:"1.8rem"}}>
                      {analysis.colInfo.filter(c=>c.type==="numeric").map((nc,i)=>(
                        <div key={i} style={{background:"rgba(13,21,38,0.9)",border:`1px solid rgba(255,255,255,0.07)`,borderRadius:12,padding:"14px 16px",borderLeft:`3px solid ${PALETTE[i%PALETTE.length]}`}}>
                          <div style={{fontSize:"0.78rem",fontWeight:700,marginBottom:8,color:C.text,fontFamily:"'Syne',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{nc.col}</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 12px"}}>
                            {[["min",nc.min],["max",nc.max],["avg",nc.mean],["sum",nc.sum?.toLocaleString()]].map(([l,v])=>(
                              <div key={l} style={{fontSize:"0.68rem",fontFamily:"'JetBrains Mono',monospace"}}>
                                <span style={{color:C.muted}}>{l} </span>
                                <span style={{color:PALETTE[i%PALETTE.length],fontWeight:600}}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <div className="dash-section-label">Visual Analysis</div>
                <div className="chart-grid">
                  {charts.map((ch, i) => {
                    const tt = { background: C.card2, border: `1px solid rgba(255,255,255,0.09)`, borderRadius: 8, fontSize: 11 };

                    // ── DONUT ──────────────────────────────────────────────
                    if (ch.type === "donut") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <div className="donut-wrap" style={{ position: "relative" }}>
                          <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                              <Pie data={ch.data} dataKey="value" nameKey="name"
                                cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                                paddingAngle={2} stroke="none">
                                {ch.data.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                              </Pie>
                              <Tooltip contentStyle={tt} formatter={(v, n) => [`${v} (${(v / ch.total * 100).toFixed(1)}%)`, n]} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="donut-center">
                            <div className="donut-center-num">{ch.total.toLocaleString()}</div>
                            <div className="donut-center-lbl">total</div>
                          </div>
                        </div>
                        <div className="custom-legend">
                          {ch.data.slice(0, 6).map((d, idx) => (
                            <div className="legend-item" key={idx}>
                              <div className="legend-dot" style={{ background: PALETTE[idx % PALETTE.length] }} />
                              <span style={{ color: C.text }}>{d.name}</span>
                              <span style={{ color: PALETTE[idx % PALETTE.length] }}>({(d.value / ch.total * 100).toFixed(0)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );

                    // ── HORIZONTAL BAR ─────────────────────────────────────
                    if (ch.type === "hbar") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={ch.data} layout="vertical" margin={{ left: 8, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: C.text }} width={80} />
                            <Tooltip contentStyle={tt} />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                              {ch.data.map((_, idx) => <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── GROUPED BAR ────────────────────────────────────────
                    if (ch.type === "grouped") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={ch.data} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            {ch.keys.map((k, ki) => (
                              <Bar key={ki} dataKey={k} fill={PALETTE[ki % PALETTE.length]} radius={[3, 3, 0, 0]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── STACKED BAR (NEW) ──────────────────────────────────
                    if (ch.type === "stacked") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            {ch.keys.map((k, ki) => (
                              <Bar key={ki} dataKey={k} stackId="a" fill={PALETTE[(ki+2) % PALETTE.length]} />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── LINE TREND ─────────────────────────────────────────
                    if (ch.type === "line") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <div className="mini-stats">
                          <span className="mini-stat"><span className="mini-stat-val" style={{ color: C.accent }}>{ch.mean}</span><span className="mini-stat-lbl">mean</span></span>
                          <span className="mini-stat"><span className="mini-stat-val" style={{ color: C.accent3 }}>{ch.data[0]?.value}</span><span className="mini-stat-lbl">start</span></span>
                          <span className="mini-stat"><span className="mini-stat-val" style={{ color: C.accent2 }}>{ch.data[ch.data.length - 1]?.value}</span><span className="mini-stat-lbl">end</span></span>
                        </div>
                        <ResponsiveContainer width="100%" height={170}>
                          <LineChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="idx" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} formatter={(v) => [v, ch.col]} />
                            <ReferenceLine y={ch.mean} stroke={C.accent} strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: `avg`, fill: C.accent, fontSize: 9 }} />
                            <Line type="monotone" dataKey="value" stroke={PALETTE[i % PALETTE.length]} strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── AREA CHART ─────────────────────────────────────────
                    if (ch.type === "area") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <AreaChart data={ch.data}>
                            <defs>
                              {ch.keys.map((k, ki) => (
                                <linearGradient key={ki} id={`ag${i}${ki}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={PALETTE[ki]} stopOpacity={0.3} />
                                  <stop offset="95%" stopColor={PALETTE[ki]} stopOpacity={0} />
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="idx" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{ fontSize: 11 }} />
                            {ch.keys.map((k, ki) => (
                              <Area key={ki} type="monotone" dataKey={k} stroke={PALETTE[ki]} fill={`url(#ag${i}${ki})`} strokeWidth={2} />
                            ))}
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── HISTOGRAM ──────────────────────────────────────────
                    if (ch.type === "histogram") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <div className="mini-stats">
                          <span className="mini-stat"><span className="mini-stat-val" style={{ color: C.accent }}>{ch.mean}</span><span className="mini-stat-lbl">mean</span></span>
                          <span className="mini-stat"><span className="mini-stat-val" style={{ color: C.accent3 }}>{ch.median}</span><span className="mini-stat-lbl">median</span></span>
                        </div>
                        <ResponsiveContainer width="100%" height={170}>
                          <BarChart data={ch.data} barCategoryGap="2%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="label" tick={{ fontSize: 8, fill: C.muted }} interval={2} />
                            <YAxis tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} formatter={(v, _, p) => [v, `range: ${p.payload.range}`]} />
                            <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                              {ch.data.map((d, idx) => (
                                <Cell key={idx} fill={`hsl(${160 + idx * (120 / ch.data.length)},80%,55%)`} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── DEVIATION BAR (NEW) ────────────────────────────────
                    if (ch.type === "deviation") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <BarChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} />
                            <ReferenceLine y={0} stroke={C.muted} strokeWidth={1} />
                            <Bar dataKey={ch.yKey} radius={[2, 2, 0, 0]}>
                              {ch.data.map((d, idx) => (
                                <Cell key={idx} fill={d[ch.yKey] >= 0 ? C.accent : C.accent2} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── SCATTER ────────────────────────────────────────────
                    if (ch.type === "scatter") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="x" name={ch.xKey} tick={{ fontSize: 9, fill: C.muted }}
                              label={{ value: ch.xKey, position: "insideBottom", offset: -4, fontSize: 9, fill: C.muted }} />
                            <YAxis dataKey="y" name={ch.yKey} tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} cursor={{ strokeDasharray: "3 3" }}
                              formatter={(v, n) => [v, n === "x" ? ch.xKey : ch.yKey]} />
                            <Scatter data={ch.data} fill={PALETTE[i % PALETTE.length]} opacity={0.65} />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── BUBBLE CHART (NEW) ─────────────────────────────────
                    if (ch.type === "bubble") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="x" name={ch.xKey} tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis dataKey="y" name={ch.yKey} tick={{ fontSize: 9, fill: C.muted }} />
                            <ZAxis dataKey="z" range={[10, 300]} name={ch.zKey} />
                            <Tooltip contentStyle={tt} cursor={{ strokeDasharray: "3 3" }}
                              formatter={(v, n) => [v, n === "x" ? ch.xKey : n === "y" ? ch.yKey : ch.zKey]} />
                            <Scatter data={ch.data} fill={C.accent3} opacity={0.6} />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── RADIAL BAR ─────────────────────────────────────────
                    if (ch.type === "radial") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <RadialBarChart cx="50%" cy="50%" innerRadius={20} outerRadius={88}
                            data={ch.data} startAngle={180} endAngle={0}>
                            <RadialBar minAngle={5} dataKey="value" cornerRadius={4} label={{ position: "insideStart", fill: C.text, fontSize: 9 }} />
                            <Tooltip contentStyle={tt} formatter={(v) => [`${v}%`, "mean/max ratio"]} />
                            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                          </RadialBarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── RADAR CHART (NEW) ──────────────────────────────────
                    if (ch.type === "radar") return (
                      <div className="chart-card" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <RadarChart data={ch.data} outerRadius="70%">
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="metric" tick={{fontSize: 9, fill: C.muted}} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 8, fill: "transparent"}} stroke="transparent" />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{fontSize: 10}} />
                            {ch.keys.map((k, ki) => (
                              <Radar key={ki} name={k} dataKey={k} stroke={PALETTE[ki%PALETTE.length]} fill={PALETTE[ki%PALETTE.length]} fillOpacity={0.3} />
                            ))}
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    // ── COMPOSED (bar + line) ──────────────────────────────
                    if (ch.type === "composed") return (
                      <div className="chart-card full" key={i}>
                        <div className="chart-title">{ch.title}</div>
                        <div className="chart-sub">{ch.sub}</div>
                        <ResponsiveContainer width="100%" height={210}>
                          <ComposedChart data={ch.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                            <XAxis dataKey="name" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis yAxisId="left" tick={{ fontSize: 9, fill: C.muted }} />
                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: C.muted }} />
                            <Tooltip contentStyle={tt} />
                            <Legend wrapperStyle={{ fontSize: 10 }} />
                            <Bar yAxisId="left" dataKey="total" fill={C.accent} opacity={0.7} radius={[3, 3, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="avg" stroke={C.accent2} strokeWidth={2} dot={{ r: 3 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    );

                    return null;
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SUMMARY ── */}
        {tab==="summary" && (
          <div className="sum-page">
            <div className="pg-title">AI Summary & Insights</div>
            <div className="pg-sub">AI reads your full dataset and writes genuine, specific analysis</div>
            {!analysis ? (
              <div className="no-data">
                <div className="no-data-ico"><Brain size={40} opacity={0.5} strokeWidth={1.5} /></div>
                <div>Upload a file to get your AI-powered summary.</div>
                <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File</button>
              </div>
            ) : (
              <>
                <div className="sblock">
                  <div className="sblock-glow" style={{background:C.accent3}}/>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
                    <div className="sblock-label" style={{marginBottom:0}}>// AI Overview</div>
                    <button className="regen-btn" disabled={sumLoading} onClick={()=>generateSummary(analysis,file,rows,fullCtx)}>
                      {sumLoading?<><span className="spin"/>&nbsp;Generating…</>:<>✦ Regenerate AI Summary</>}
                    </button>
                  </div>
                  {sumLoading ? (
                    <div style={{display:"flex",alignItems:"center",gap:10,color:C.accent3,fontFamily:"'JetBrains Mono',monospace",fontSize:"0.84rem"}}>
                      <span className="spin"/> AI is analyzing all {analysis.rows.toLocaleString()} rows…
                    </div>
                  ) : (
                    <div className="sum-text">{aiOverview||"Generating…"}</div>
                  )}
                  <div className="model-credit">✦ GPT-4o · Full data access</div>
                </div>

                {aiNotes.length>0 && (
                  <div className="sblock">
                    <div className="sblock-glow" style={{background:C.accent}}/>
                    <div className="sblock-label">// AI Key Insights ({aiNotes.length})</div>
                    {aiNotes.map((n,i)=>(
                      <div className="note-row" key={i}>
                        <div className="note-pip"/>
                        <div className="note-txt"><Md text={n}/></div>
                      </div>
                    ))}
                    <div className="model-credit">✦ GPT-4o · Cited from actual data</div>
                  </div>
                )}

                <div className="sblock">
                  <div className="sblock-label">// Column Statistics</div>
                  <table className="col-tbl">
                    <thead>
                      <tr>
                        <th>Column</th><th>Type</th><th>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.colInfo.map(c=>(
                        <tr key={c.col}>
                          <td style={{color:C.accent,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{c.col}</td>
                          <td>
                            <span className="data-tag" style={{
                              background:c.type==="numeric"?"rgba(167,139,250,0.1)":"rgba(0,245,212,0.07)",
                              color:c.type==="numeric"?C.accent3:C.accent,
                              border:`1px solid ${c.type==="numeric"?"rgba(167,139,250,0.25)":"rgba(0,245,212,0.18)"}`
                            }}>{c.type}</span>
                          </td>
                          <td style={{color:C.muted,fontSize:"0.75rem",fontFamily:"'JetBrains Mono',monospace"}}>
                            {c.type==="numeric"
                              ?`count:${c.count} · min:${c.min} · max:${c.max} · avg:${c.mean} · median:${c.median} · sum:${c.sum?.toLocaleString()}${c.emptyCount>0?` · (${c.emptyCount} empty ignored)`:""}`
                              :`${c.unique} unique · top: ${c.top.filter(([v])=>v&&!isEmpty(v)).slice(0,3).map(([v,n])=>`"${v}"(${n})`).join(", ")}${c.emptyCount>0?` · (${c.emptyCount} empty ignored)`:""}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── ASK AI ── */}
        {tab==="ask" && (
          <div className="ask-page">
            <div className="ask-hdr">
              <div className="pg-title">✦ Ask AI</div>
              <div className="pg-sub">AI has full access to your data · Remembers conversation · Real answers</div>
            </div>

            {analysis && (
              <div className="data-context-bar">
                <div className="ctx-label">AI Data Access:</div>
                <div className="ctx-chip"><Folder size={12} /> {file?.name}</div>
                <div className="ctx-chip"><BarChart3 size={12} /> {analysis.rows.toLocaleString()} rows</div>
                <div className="ctx-chip"><Calculator size={12} /> {analysis.colInfo.filter(c=>c.type==="numeric").length} numeric cols</div>
                <div className="ctx-chip"><Tag size={12} /> {analysis.colInfo.filter(c=>c.type==="categorical").length} categorical cols</div>
                <div className="ctx-chip" style={{color:C.accent3,background:"rgba(167,139,250,0.1)"}}>✦ GPT-4o</div>
              </div>
            )}

            {rows.length>0 && (
              <div className="sq-bar">
                {suggestedQs.map(q=>(
                  <button key={q} className="sq" onClick={()=>setInput(q)}>{q}</button>
                ))}
              </div>
            )}

            <div className="messages">
              {messages.map((m,i)=>(
                <div className={`msg ${m.role}`} key={i}>
                  <div className={`avatar ${m.role}`}>{m.role==="ai"?<Sparkles size={16} />:<User size={16} />}</div>
                  <div className={`bubble ${m.role}`}>
                    <Md text={m.text}/>
                    {m.role==="ai" && i>0 && <div className="model-credit">✦ GPT-4o · Full data context</div>}
                  </div>
                </div>
              ))}

              {thinking && (
                <div className="msg ai">
                  <div className="avatar ai"><Sparkles size={16} /></div>
                  <div className="bubble ai">
                    <div className="typing-indicator"><span/><span/><span/></div>
                    <div style={{fontSize:"0.68rem",color:C.muted,marginTop:5,fontFamily:"'JetBrains Mono',monospace"}}>
                      AI is analyzing {analysis?.rows.toLocaleString()||""} rows…
                    </div>
                  </div>
                </div>
              )}

              {!rows.length && (
                <div className="no-data">
                  <div className="no-data-ico"><Sparkles size={40} opacity={0.5} /></div>
                  <div>Upload a file first to give AI access to your data.</div>
                  <button className="btn-primary" onClick={()=>setTab("upload")}>Upload File</button>
                </div>
              )}
              <div ref={chatEndRef}/>
            </div>

            <div className="chat-footer">
              <div className="chat-row">
                <textarea
                  className="chat-input"
                  rows={2}
                  value={input}
                  onChange={e=>setInput(e.target.value)}
                  placeholder={rows.length?"Ask AI anything about your data… (Enter to send, Shift+Enter for newline)":"Upload a file first…"}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMsg()}}}
                  disabled={!rows.length}
                />
                <button className="send-btn" onClick={sendMsg} disabled={!input.trim()||!rows.length||thinking}>
                  {thinking?<span className="spin"/>:<Sparkles size={20} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
