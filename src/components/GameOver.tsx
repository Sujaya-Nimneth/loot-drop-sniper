'use client';

// ─── Game Over — Dual Screen (Failed / Victory) + Leaderboard ───────────────
// Score < 500  → "Mission Failed: Retrying Operational Parameters" + retry
// Score >= 500 → "VICTORY: Dialog Gaming Data Bundle Unlocked!" + claim form
// Both screens display the top-5 localStorage leaderboard.

import { motion, AnimatePresence } from 'framer-motion';
import { gameStore } from '@/engine/store';
import { useGameStoreShallow } from '@/hooks/useGameStore';
import {
  loadLeaderboard,
  addToLeaderboard,
  type LeaderboardEntry,
} from '@/lib/leaderboard';
import { useState, useCallback, useEffect, useRef } from 'react';

const VICTORY_THRESHOLD = 500;

// ─── Rank medal colors ───────────────────────────────────────────────────────

const RANK_COLORS = ['#ffaa00', '#94a3b8', '#cd7f32', '#475569', '#475569'] as const;
const RANK_LABELS = ['🥇', '🥈', '🥉', '#4', '#5'] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function GameOver() {
  const { score, highScore, elapsedTime, speedTier } = useGameStoreShallow((s) => ({
    score: s.score,
    highScore: s.highScore,
    elapsedTime: s.elapsedTime,
    speedTier: s.speedTier,
  }));

  const isVictory = score >= VICTORY_THRESHOLD;
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [claimed, setClaimed] = useState(false);
  const [savedFailed, setSavedFailed] = useState(false);

  // Form state (victory only)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const hasSavedRef = useRef(false);

  // Load leaderboard on mount
  useEffect(() => {
    setLeaderboard(loadLeaderboard());
  }, []);

  // Auto-save failed games to leaderboard (once)
  useEffect(() => {
    if (!isVictory && !hasSavedRef.current && score > 0) {
      hasSavedRef.current = true;
      const updated = addToLeaderboard({ name: 'Anonymous', score });
      setLeaderboard(updated);
      setSavedFailed(true);
    }
  }, [isVictory, score]);

  // ── Form validation ──
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errors.name = 'Name is required (min 2 characters)';
    }
    if (!phone.trim() || !/^\+?[\d\s\-()]{7,15}$/.test(phone.trim())) {
      errors.phone = 'Valid phone number required';
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Valid email required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, phone, email]);

  // ── Claim handler ──
  const handleClaim = useCallback(() => {
    if (!validateForm()) return;
    const updated = addToLeaderboard({
      name: name.trim(),
      score,
      phone: phone.trim(),
      email: email.trim(),
    });
    setLeaderboard(updated);
    setClaimed(true);
  }, [validateForm, name, phone, email, score]);

  const handleRestart = useCallback(() => {
    gameStore.getState().startGame();
  }, []);

  const handleMenu = useCallback(() => {
    gameStore.getState().resetGame();
  }, []);

  const minutes = Math.floor(elapsedTime / 60);
  const seconds = Math.floor(elapsedTime % 60);

  return (
    <motion.div
      key="game-over"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      id="game-over-screen"
      className="absolute inset-0 flex flex-col items-center h-full select-none overflow-y-auto no-scrollbar"
    >
      {/* Background */}
      <div
        className="fixed inset-0 backdrop-blur-md"
        style={{
          background: isVictory
            ? 'radial-gradient(ellipse at 50% 20%, rgba(255,170,0,0.06) 0%, rgba(3,7,18,0.94) 65%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(255,0,68,0.07) 0%, rgba(3,7,18,0.94) 65%)',
        }}
      />
      <div className="arena-grid opacity-20 fixed inset-0 pointer-events-none" />

      {/* Scrollable content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-sm px-6 py-12">
        <AnimatePresence mode="wait">
          {isVictory ? (
            <VictoryContent
              key="victory"
              score={score}
              highScore={highScore}
              minutes={minutes}
              seconds={seconds}
              speedTier={speedTier}
              claimed={claimed}
              name={name}
              phone={phone}
              email={email}
              formErrors={formErrors}
              onNameChange={setName}
              onPhoneChange={setPhone}
              onEmailChange={setEmail}
              onClaim={handleClaim}
              onRestart={handleRestart}
              onMenu={handleMenu}
            />
          ) : (
            <FailedContent
              key="failed"
              score={score}
              minutes={minutes}
              seconds={seconds}
              speedTier={speedTier}
              savedFailed={savedFailed}
              onRestart={handleRestart}
              onMenu={handleMenu}
            />
          )}
        </AnimatePresence>

        {/* ── Leaderboard ── */}
        <Leaderboard entries={leaderboard} currentScore={score} />
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// FAILED SCREEN  (score < 500)
// ═════════════════════════════════════════════════════════════════════════════

interface FailedProps {
  score: number;
  minutes: number;
  seconds: number;
  speedTier: number;
  savedFailed: boolean;
  onRestart: () => void;
  onMenu: () => void;
}

function FailedContent({ score, minutes, seconds, speedTier, onRestart, onMenu }: FailedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full"
    >
      {/* Glitch-style X icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{
          background: 'rgba(255,0,68,0.1)',
          border: '2px solid rgba(255,0,68,0.3)',
          boxShadow: '0 0 30px rgba(255,0,68,0.15)',
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="#ff0044" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-3xl font-black tracking-tight text-center text-glow-red"
        style={{ color: '#ff0044' }}
      >
        MISSION FAILED
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-slate-500 uppercase tracking-[0.12em] text-center mt-1 mb-5"
      >
        Retrying Operational Parameters
      </motion.p>

      {/* Score */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: 'spring', stiffness: 200 }}
        className="text-center mb-5"
      >
        <span className="text-[10px] uppercase tracking-widest text-slate-600 block mb-1">
          Final Score
        </span>
        <span className="text-5xl font-black tabular-nums" style={{ color: '#64748b' }}>
          {score.toLocaleString()}
        </span>
        <span className="block text-xs text-slate-600 mt-1">
          {VICTORY_THRESHOLD - score} pts short of victory
        </span>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4 mb-6 text-center"
      >
        <div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider block">Time</span>
          <span className="text-sm font-bold tabular-nums text-slate-400">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-px h-6 bg-white/5" />
        <div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider block">Speed</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: '#ffaa00' }}>
            +{speedTier * 5}%
          </span>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col gap-3 w-full"
      >
        <button
          id="retry-button"
          onClick={onRestart}
          className="
            w-full py-3.5 rounded-2xl font-black text-sm tracking-widest
            border active:scale-95 transition-transform
          "
          style={{
            borderColor: 'rgba(255,0,68,0.3)',
            background: 'linear-gradient(135deg, rgba(255,0,68,0.1) 0%, rgba(255,0,68,0.05) 100%)',
            color: '#ff4466',
            textShadow: '0 0 8px rgba(255,0,68,0.4)',
            boxShadow: '0 0 20px rgba(255,0,68,0.08)',
          }}
        >
          RETRY MISSION
        </button>
        <button
          id="menu-button"
          onClick={onMenu}
          className="
            w-full py-3 rounded-2xl font-semibold text-sm
            bg-white/[0.03] text-slate-500 border border-white/5
            active:scale-95 transition-transform
          "
        >
          Main Menu
        </button>
      </motion.div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VICTORY SCREEN  (score >= 500)
// ═════════════════════════════════════════════════════════════════════════════

interface VictoryProps {
  score: number;
  highScore: number;
  minutes: number;
  seconds: number;
  speedTier: number;
  claimed: boolean;
  name: string;
  phone: string;
  email: string;
  formErrors: Record<string, string>;
  onNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onClaim: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

function VictoryContent({
  score,
  highScore,
  minutes,
  seconds,
  speedTier,
  claimed,
  name,
  phone,
  email,
  formErrors,
  onNameChange,
  onPhoneChange,
  onEmailChange,
  onClaim,
  onRestart,
  onMenu,
}: VictoryProps) {
  const isNewHighScore = score >= highScore && score > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full"
    >
      {/* Trophy icon */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 12 }}
        className="w-18 h-18 rounded-full flex items-center justify-center mb-3"
        style={{
          background: 'rgba(255,170,0,0.08)',
          border: '2px solid rgba(255,170,0,0.3)',
          boxShadow: '0 0 40px rgba(255,170,0,0.15), 0 0 80px rgba(255,170,0,0.05)',
        }}
      >
        <span className="text-4xl" role="img" aria-label="trophy">🏆</span>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-4xl font-black tracking-tight text-center text-glow-amber"
        style={{ color: '#ffaa00' }}
      >
        VICTORY
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xs text-center mt-1 mb-4 max-w-[260px]"
        style={{ color: '#00f0ff', textShadow: '0 0 6px rgba(0,240,255,0.3)' }}
      >
        Dialog Gaming Data Bundle Unlocked!
      </motion.p>

      {/* New high score */}
      {isNewHighScore && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 300 }}
          className="px-4 py-1 mb-3 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{
            color: '#ffaa00',
            textShadow: '0 0 8px rgba(255,170,0,0.5)',
            background: 'rgba(255,170,0,0.08)',
            border: '1px solid rgba(255,170,0,0.25)',
            boxShadow: '0 0 16px rgba(255,170,0,0.1)',
          }}
        >
          ★ NEW HIGH SCORE ★
        </motion.div>
      )}

      {/* Score */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="text-center mb-5"
      >
        <span
          className="text-6xl font-black tabular-nums text-glow-cyan"
          style={{ color: '#00f0ff' }}
        >
          {score.toLocaleString()}
        </span>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex items-center gap-4 mb-6 text-center"
      >
        <div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider block">Time</span>
          <span className="text-sm font-bold tabular-nums text-slate-400">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
        <div className="w-px h-6 bg-white/5" />
        <div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider block">Speed</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: '#ffaa00' }}>
            +{speedTier * 5}%
          </span>
        </div>
        <div className="w-px h-6 bg-white/5" />
        <div>
          <span className="text-[9px] text-slate-600 uppercase tracking-wider block">Best</span>
          <span className="text-sm font-bold tabular-nums" style={{ color: '#00f0ff' }}>
            {highScore.toLocaleString()}
          </span>
        </div>
      </motion.div>

      {/* ── Claim Form or Success ── */}
      <AnimatePresence mode="wait">
        {!claimed ? (
          <motion.div
            key="form"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full"
          >
            <div
              className="rounded-2xl p-5 mb-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <h3
                className="text-xs font-bold uppercase tracking-widest text-center mb-4"
                style={{ color: '#ffaa00' }}
              >
                Claim Your Data Bundle
              </h3>

              <div className="flex flex-col gap-3">
                <FormField
                  id="claim-name"
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={onNameChange}
                  error={formErrors.name}
                  icon="👤"
                />
                <FormField
                  id="claim-phone"
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={onPhoneChange}
                  error={formErrors.phone}
                  icon="📱"
                />
                <FormField
                  id="claim-email"
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={onEmailChange}
                  error={formErrors.email}
                  icon="✉️"
                />
              </div>

              <button
                id="claim-button"
                onClick={onClaim}
                className="
                  w-full mt-4 py-3.5 rounded-xl font-black text-sm tracking-widest
                  active:scale-95 transition-transform
                "
                style={{
                  background: 'linear-gradient(135deg, rgba(255,170,0,0.2) 0%, rgba(255,130,0,0.15) 100%)',
                  border: '1px solid rgba(255,170,0,0.35)',
                  color: '#ffaa00',
                  textShadow: '0 0 8px rgba(255,170,0,0.4)',
                  boxShadow: '0 0 25px rgba(255,170,0,0.1)',
                }}
              >
                CLAIM DATA
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-full"
          >
            <div
              className="rounded-2xl p-6 mb-4 text-center"
              style={{
                background: 'rgba(0,255,136,0.04)',
                border: '1px solid rgba(0,255,136,0.15)',
                boxShadow: '0 0 30px rgba(0,255,136,0.05)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                style={{
                  background: 'rgba(0,255,136,0.1)',
                  border: '2px solid rgba(0,255,136,0.3)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#00ff88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
              <p className="text-sm font-bold text-glow-green" style={{ color: '#00ff88' }}>
                Data Bundle Claimed!
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Check your email for confirmation
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.65 }}
        className="flex flex-col gap-3 w-full"
      >
        <button
          id="play-again-button"
          onClick={onRestart}
          className="
            w-full py-3.5 rounded-2xl font-black text-sm tracking-widest
            border border-neon-cyan/30 active:scale-95 transition-transform
          "
          style={{
            background: 'linear-gradient(135deg, rgba(0,240,255,0.12) 0%, rgba(0,100,255,0.1) 100%)',
            color: '#00f0ff',
            textShadow: '0 0 8px rgba(0,240,255,0.4)',
            boxShadow: '0 0 20px rgba(0,240,255,0.08)',
          }}
        >
          PLAY AGAIN
        </button>
        <button
          id="menu-button-victory"
          onClick={onMenu}
          className="
            w-full py-3 rounded-2xl font-semibold text-sm
            bg-white/[0.03] text-slate-500 border border-white/5
            active:scale-95 transition-transform
          "
        >
          Main Menu
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Form Field ──────────────────────────────────────────────────────────────

interface FormFieldProps {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon: string;
}

function FormField({ id, type, placeholder, value, onChange, error, icon }: FormFieldProps) {
  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-50 pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            w-full pl-9 pr-4 py-3 rounded-xl text-sm font-medium
            bg-white/[0.04] border text-white
            placeholder:text-slate-600
            focus:outline-none focus:ring-1 transition-colors
          "
          style={{
            borderColor: error ? 'rgba(255,0,68,0.4)' : 'rgba(255,255,255,0.08)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0,240,255,0.08)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? 'rgba(255,0,68,0.4)'
              : 'rgba(255,255,255,0.08)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-neon-red/80 mt-1 ml-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentScore: number;
}

function Leaderboard({ entries, currentScore }: LeaderboardProps) {
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="w-full mt-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 justify-center mb-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
          Leaderboard
        </span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
      </div>

      {/* Entries */}
      <div className="flex flex-col gap-1.5">
        {entries.map((entry, i) => {
          const isCurrentGame = entry.score === currentScore;
          return (
            <motion.div
              key={`${entry.date}-${i}`}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.85 + i * 0.08 }}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl"
              style={{
                background: isCurrentGame
                  ? 'rgba(0,240,255,0.04)'
                  : 'rgba(255,255,255,0.015)',
                border: isCurrentGame
                  ? '1px solid rgba(0,240,255,0.15)'
                  : '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex items-center gap-2.5">
                {/* Rank */}
                <span className="text-sm w-6 text-center" title={`Rank ${i + 1}`}>
                  {RANK_LABELS[i]}
                </span>

                {/* Name */}
                <span
                  className="text-sm font-semibold truncate max-w-[120px]"
                  style={{ color: isCurrentGame ? '#00f0ff' : '#94a3b8' }}
                >
                  {entry.name}
                </span>
              </div>

              {/* Score */}
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: RANK_COLORS[i] || '#475569' }}
              >
                {entry.score.toLocaleString()}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
