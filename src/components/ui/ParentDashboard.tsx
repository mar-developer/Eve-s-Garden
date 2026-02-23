"use client";

import { useState, useMemo } from "react";
import { useGameStore } from "../../game/stores/letter-crash-store";
import { loadStats, formatPlayTime, getMostTypedWord } from "../../game/analytics/local-analytics";
import type { Dimension, ColorBlindMode, TextScale, DifficultyPreset, LetterProgress, PlayStats } from "../../types/letter-crash";

type Tab = "Stats" | "Learning" | "Settings";

const ALL_DIMS: Dimension[] = ["Home", "Candy", "Space", "Ocean", "Volcano", "Cloud"];
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LEARNED_THRESHOLD = 3;
const TIME_OPTS = [0, 15, 30, 45, 60] as const;
const SCALE_OPTS: TextScale[] = [1, 1.2, 1.5, 2];
const DIM_LABELS: Record<Dimension, string> = {
  Home: "\u{1F3E0} Home", Candy: "\u{1F36C} Candy", Space: "\u{1F680} Space",
  Ocean: "\u{1F30A} Ocean", Volcano: "\u{1F30B} Volcano", Cloud: "\u2601\uFE0F Cloud",
};
const TAB_META: { key: Tab; label: string; icon: string }[] = [
  { key: "Stats", label: "Stats", icon: "\u{1F4CA}" },
  { key: "Learning", label: "Learning", icon: "\u{1F4DA}" },
  { key: "Settings", label: "Settings", icon: "\u2699\uFE0F" },
];

const btn = (active: boolean, activeClass = "bg-violet-500 text-white border-white shadow-lg") =>
  `transition-all active:scale-95 ${active ? activeClass : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`;

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold text-sm text-slate-600">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={["w-14 h-8 rounded-full border-3 transition-all relative", checked ? "bg-emerald-500 border-emerald-600" : "bg-slate-200 border-slate-300"].join(" ")}
        role="switch" aria-checked={checked} aria-label={`Toggle ${label}`}
      >
        <div className={["absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all", checked ? "left-7" : "left-1"].join(" ")} />
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border-3 border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
      <h3 className="font-black text-sm text-slate-500 uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function VolumeSlider({ icon, label, value, onChange }: { icon: string; label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-8 text-center">{icon}</span>
      <span className="font-bold text-sm text-slate-600 w-16">{label}</span>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 accent-violet-500" />
      <span className="font-black text-sm text-slate-500 w-10 text-right">{Math.round(value * 100)}%</span>
    </div>
  );
}

// ─── PIN Gate ────────────────────────────────────────────────────────────────

function PinGate({ correctPin, onSuccess, onBack }: { correctPin: string; onSuccess: () => void; onBack: () => void }) {
  const [entered, setEntered] = useState("");
  const numBtn = "h-16 rounded-2xl bg-white border-3 border-slate-200 shadow-md font-black text-2xl text-slate-700 hover:bg-slate-50 active:scale-95 transition-all";

  function handleDigit(d: number) {
    const next = entered + String(d);
    if (next.length >= 4) {
      if (next === correctPin) { onSuccess(); } else { setEntered(""); }
    } else {
      setEntered(next);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6">
      <h2 className="font-black text-3xl text-slate-700 uppercase tracking-widest">Parent Area</h2>
      <p className="text-slate-500 font-bold text-lg text-center">Enter 4-digit PIN to continue</p>
      <div className="flex gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={["w-5 h-5 rounded-full border-3 transition-all", i < entered.length ? "bg-violet-500 border-violet-600 scale-110" : "bg-slate-200 border-slate-300"].join(" ")} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 w-64">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => handleDigit(n)} className={numBtn}>{n}</button>
        ))}
        <button onClick={() => setEntered((p) => p.slice(0, -1))} className="h-16 rounded-2xl bg-slate-100 border-3 border-slate-200 shadow-md font-black text-lg text-slate-500 hover:bg-slate-200 active:scale-95 transition-all" aria-label="Delete last digit">DEL</button>
        <button onClick={() => handleDigit(0)} className={numBtn}>0</button>
        <div />
      </div>
      <button onClick={onBack} className="mt-4 px-8 py-3 rounded-2xl bg-slate-200 border-3 border-slate-300 font-black text-lg text-slate-600 hover:bg-slate-300 active:scale-95 transition-all">Back</button>
    </div>
  );
}

// ─── Stats Tab ───────────────────────────────────────────────────────────────

function StatsTab({ stats }: { stats: PlayStats }) {
  const mostTyped = getMostTypedWord(stats);
  const last10 = stats.wordHistory.slice(-10).reverse();

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      <div className="grid grid-cols-2 gap-3">
        {([
          ["\u23F1\uFE0F", "Play Time", formatPlayTime(stats.totalPlayTimeMs)],
          ["\u{1F4C5}", "Sessions Today", String(stats.sessionsToday)],
          ["\u{1F4A5}", "Letters Crashed", String(stats.totalLettersCrashed)],
          ["\u{1F4DD}", "Words Typed", String(stats.totalWordsTyped)],
        ] as const).map(([icon, label, value]) => (
          <div key={label} className="bg-white border-3 border-slate-200 rounded-2xl p-4 flex flex-col items-center gap-1 shadow-sm">
            <span className="text-3xl">{icon}</span>
            <span className="font-black text-2xl text-slate-800">{value}</span>
            <span className="font-bold text-xs text-slate-400 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
      {mostTyped && (
        <div className="bg-amber-50 border-3 border-amber-200 rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Favorite Word</p>
          <p className="font-black text-2xl text-amber-800 uppercase tracking-widest mt-1">{mostTyped}</p>
        </div>
      )}
      {last10.length > 0 && (
        <div className="bg-white border-3 border-slate-200 rounded-2xl p-4">
          <p className="font-black text-sm text-slate-500 uppercase tracking-wider mb-2">Recent Words</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {last10.map((word, i) => (
              <span key={`${word}-${i}`} className="px-3 py-1 bg-slate-100 rounded-xl font-bold text-sm text-slate-600 border-2 border-slate-200">{word}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Learning Tab ────────────────────────────────────────────────────────────

function LearningTab({ letterProgress, learningMode, setLearningMode }: { letterProgress: Record<string, LetterProgress>; learningMode: boolean; setLearningMode: (v: boolean) => void }) {
  const learnedCount = ALPHABET.filter((l) => (letterProgress[l]?.animalHitCount ?? 0) >= LEARNED_THRESHOLD).length;
  const pct = Math.round((learnedCount / 26) * 100);

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      <div className="bg-emerald-50 border-3 border-emerald-200 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-sm text-emerald-700 uppercase tracking-wider">Overall Progress</span>
          <span className="font-black text-lg text-emerald-800">{pct}%</span>
        </div>
        <div className="h-4 bg-emerald-100 rounded-full overflow-hidden border-2 border-emerald-200">
          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm font-bold text-emerald-600 mt-2 text-center">{learnedCount} / 26 letters learned</p>
      </div>

      <div className="flex items-center justify-between bg-white border-3 border-slate-200 rounded-2xl p-4">
        <div>
          <p className="font-black text-sm text-slate-700">Learning Mode</p>
          <p className="text-xs text-slate-400 font-bold">Animals appear for each letter</p>
        </div>
        <Toggle label="Learning Mode" checked={learningMode} onChange={setLearningMode} />
      </div>

      <div className="grid grid-cols-6 sm:grid-cols-7 gap-2">
        {ALPHABET.map((letter) => {
          const count = letterProgress[letter]?.animalHitCount ?? 0;
          const learned = count >= LEARNED_THRESHOLD;
          const ratio = Math.min(count / LEARNED_THRESHOLD, 1);
          return (
            <div key={letter} className={["flex flex-col items-center p-2 rounded-xl border-3 transition-all", learned ? "bg-emerald-50 border-emerald-300" : count > 0 ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-200"].join(" ")}>
              <span className={["font-black text-lg", learned ? "text-emerald-600" : count > 0 ? "text-amber-600" : "text-slate-300"].join(" ")}>{letter}</span>
              <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                <div className={["h-full rounded-full transition-all", learned ? "bg-emerald-500" : "bg-amber-400"].join(" ")} style={{ width: `${ratio * 100}%` }} />
              </div>
              {learned && <span className="text-xs mt-0.5">{"\u2705"}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────────────────────

function SettingsTab() {
  const parentSettings = useGameStore((s) => s.parentSettings);
  const setPS = useGameStore((s) => s.setParentSettings);
  const accessibility = useGameStore((s) => s.accessibility);
  const setA11y = useGameStore((s) => s.setAccessibility);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinMsg, setPinMsg] = useState("");

  function handleChangePin() {
    if (!/^\d{4}$/.test(newPin)) { setPinMsg("PIN must be 4 digits"); return; }
    if (newPin !== confirmPin) { setPinMsg("PINs do not match"); return; }
    setPS({ pin: newPin });
    setNewPin(""); setConfirmPin(""); setPinMsg("PIN updated!");
  }

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">
      <Section title="Difficulty">
        <div className="flex gap-2">
          {(["easy", "normal", "explorer"] as DifficultyPreset[]).map((d) => (
            <button key={d} onClick={() => setPS({ difficulty: d })} className={["flex-1 py-3 rounded-xl border-3 font-black text-sm uppercase tracking-wider", btn(parentSettings.difficulty === d)].join(" ")}>{d}</button>
          ))}
        </div>
      </Section>

      <Section title="Time Limit">
        <div className="flex gap-2 flex-wrap">
          {TIME_OPTS.map((m) => (
            <button key={m} onClick={() => setPS({ timeLimitMinutes: m })} className={["px-4 py-2 rounded-xl border-3 font-black text-sm", btn(parentSettings.timeLimitMinutes === m, "bg-sky-500 text-white border-white shadow-lg")].join(" ")}>{m === 0 ? "None" : `${m}m`}</button>
          ))}
        </div>
      </Section>

      <Section title="Volume">
        <VolumeSlider icon={"\u{1F50A}"} label="Master" value={parentSettings.volumeMaster} onChange={(v) => setPS({ volumeMaster: v })} />
        <VolumeSlider icon={"\u{1F4A5}"} label="SFX" value={parentSettings.volumeSfx} onChange={(v) => setPS({ volumeSfx: v })} />
        <VolumeSlider icon={"\u{1F3B5}"} label="Music" value={parentSettings.volumeMusic} onChange={(v) => setPS({ volumeMusic: v })} />
      </Section>

      <Section title="Accessibility">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-slate-600">Color Blind Mode</span>
          <select value={accessibility.colorBlindMode} onChange={(e) => setA11y({ colorBlindMode: e.target.value as ColorBlindMode })} className="px-3 py-2 rounded-xl border-3 border-slate-200 font-bold text-sm text-slate-700 bg-white">
            <option value="none">None</option>
            <option value="deuteranopia">Deuteranopia</option>
            <option value="protanopia">Protanopia</option>
            <option value="tritanopia">Tritanopia</option>
          </select>
        </div>
        <Toggle label="High Contrast" checked={accessibility.highContrast} onChange={(v) => setA11y({ highContrast: v })} />
        <Toggle label="Auto-Drive" checked={accessibility.autoDrive} onChange={(v) => setA11y({ autoDrive: v })} />
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm text-slate-600">Text Scale</span>
          <div className="flex gap-1">
            {SCALE_OPTS.map((s) => (
              <button key={s} onClick={() => setA11y({ textScale: s })} className={["px-3 py-1.5 rounded-lg border-2 font-black text-xs", btn(accessibility.textScale === s, "bg-violet-500 text-white border-violet-600")].join(" ")}>{s}x</button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Enabled Dimensions">
        <div className="grid grid-cols-2 gap-2">
          {ALL_DIMS.map((dim) => {
            const on = parentSettings.enabledDimensions.includes(dim);
            return (
              <button key={dim} onClick={() => {
                const next = on ? parentSettings.enabledDimensions.filter((d) => d !== dim) : [...parentSettings.enabledDimensions, dim];
                if (next.length > 0) setPS({ enabledDimensions: next });
              }} className={["px-3 py-2 rounded-xl border-3 font-bold text-sm transition-all active:scale-95 text-left", on ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-slate-50 text-slate-400 border-slate-200"].join(" ")}>{DIM_LABELS[dim]}</button>
            );
          })}
        </div>
      </Section>

      <Section title="Change PIN">
        <input type="password" inputMode="numeric" maxLength={4} placeholder="New PIN" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="px-4 py-3 rounded-xl border-3 border-slate-200 font-bold text-lg text-center tracking-[0.5em] bg-white" />
        <input type="password" inputMode="numeric" maxLength={4} placeholder="Confirm PIN" value={confirmPin} onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))} className="px-4 py-3 rounded-xl border-3 border-slate-200 font-bold text-lg text-center tracking-[0.5em] bg-white" />
        <button onClick={handleChangePin} className="px-6 py-3 rounded-xl bg-violet-500 text-white border-3 border-white shadow-md font-black text-sm uppercase tracking-wider hover:bg-violet-600 active:scale-95 transition-all">Update PIN</button>
        {pinMsg && <p className={["text-center font-bold text-sm", pinMsg === "PIN updated!" ? "text-emerald-600" : "text-red-500"].join(" ")}>{pinMsg}</p>}
      </Section>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function ParentDashboard() {
  const parentDashboardOpen = useGameStore((s) => s.parentDashboardOpen);
  const setParentDashboardOpen = useGameStore((s) => s.setParentDashboardOpen);
  const parentSettings = useGameStore((s) => s.parentSettings);
  const letterProgress = useGameStore((s) => s.letterProgress);
  const learningMode = useGameStore((s) => s.learningMode);
  const setLearningMode = useGameStore((s) => s.setLearningMode);
  const [pinVerified, setPinVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Stats");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stats = useMemo(() => loadStats(), [pinVerified]);

  if (!parentDashboardOpen) return null;

  function handleClose() {
    setPinVerified(false);
    setActiveTab("Stats");
    setParentDashboardOpen(false);
  }

  if (!pinVerified) {
    return (
      <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex items-center justify-center">
        <PinGate correctPin={parentSettings.pin} onSuccess={() => setPinVerified(true)} onBack={handleClose} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b-3 border-slate-200">
        <h1 className="font-black text-xl sm:text-2xl text-slate-700 uppercase tracking-widest">Parent Dashboard</h1>
        <button onClick={handleClose} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-400 border-3 border-white shadow-lg flex items-center justify-center text-white font-black text-lg hover:bg-red-500 active:scale-95 transition-all" aria-label="Close parent dashboard">X</button>
      </div>
      <div className="flex gap-2 px-4 py-3 sm:px-6 border-b-3 border-slate-100">
        {TAB_META.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={["flex-1 py-3 rounded-xl border-3 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2", btn(activeTab === tab.key)].join(" ")}>
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>
      {activeTab === "Stats" && <StatsTab stats={stats} />}
      {activeTab === "Learning" && <LearningTab letterProgress={letterProgress} learningMode={learningMode} setLearningMode={setLearningMode} />}
      {activeTab === "Settings" && <SettingsTab />}
    </div>
  );
}
