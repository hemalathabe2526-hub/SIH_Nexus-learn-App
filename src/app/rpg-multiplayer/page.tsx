'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Swords, Shield, Zap, Heart, ArrowLeft, Users, Calculator, BookOpen } from 'lucide-react';

interface BattleLogEntry {
  time: string;
  sender: string;
  text: string;
  type: 'attack' | 'boss_attack' | 'combo' | 'chat';
}

export default function RpgMultiplayerPage() {
  const [bossHp, setBossHp] = useState(2400);
  const maxBossHp = 3000;
  const [partyHp, setPartyHp] = useState(380);
  const maxPartyHp = 500;

  const [player1Answer, setPlayer1Answer] = useState('');
  const [player2SelectedLaw, setPlayer2SelectedLaw] = useState('');
  const [battleLogs, setBattleLogs] = useState<BattleLogEntry[]>([
    { time: '12:01:05', sender: 'System', text: 'Party entered Room NEXUS-ENTROPY-42! Boss "The Entropy Titan" awakens!', type: 'chat' },
    { time: '12:01:12', sender: 'Priya (Theorist)', text: 'Ready! Calculator handle the delta W math, I will match the thermodynamic process!', type: 'chat' }
  ]);
  const [comboFlash, setComboFlash] = useState(false);

  // Trigger Team Dual Combo Strike
  const handleExecuteTeamCombo = () => {
    if (!player1Answer.trim() || !player2SelectedLaw) {
      alert('Both the Calculator and Theorist must provide their inputs to trigger a Team Combo!');
      return;
    }

    const isValCorrect = player1Answer.trim() === '400' || player1Answer.trim() === '400J';
    const isLawCorrect = player2SelectedLaw === 'isobaric';

    if (isValCorrect && isLawCorrect) {
      setComboFlash(true);
      setTimeout(() => setComboFlash(false), 800);

      setBossHp(prev => Math.max(0, prev - 750));
      setBattleLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sender: 'TEAM DUAL COMBO',
          text: 'Priya identified Isobaric Expansion & Ravi calculated W = 400 J! Executed "CARNOT REVERSIBLE BURST" dealing -750 Critical DMG!',
          type: 'combo'
        }
      ]);
      setPlayer1Answer('');
      setPlayer2SelectedLaw('');
    } else {
      setPartyHp(prev => Math.max(0, prev - 45));
      setBattleLogs(prev => [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          sender: 'Titan',
          text: 'Entropy Shockwave! Equation mismatch caused thermal dissipation (-45 Party HP).',
          type: 'boss_attack'
        }
      ]);
    }
  };

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/rpg" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} />
            <span>Back to Solo RPG</span>
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Swords size={18} color="#fbbf24" />
            <span>Real-Time Multiplayer Co-Op Dungeon Battles</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} />
            <span>Party Room: NEXUS-ENTROPY-42 (2/3 Players Ready)</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Arena & Boss Viewport */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Boss Arena Banner */}
          <div style={{
            position: 'relative', borderRadius: 16, padding: 28, overflow: 'hidden',
            background: comboFlash ? 'radial-gradient(circle at center, #f59e0b 0%, #7c2d12 100%)' : 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)',
            border: `2px solid ${comboFlash ? '#fbbf24' : 'rgba(168,85,247,0.3)'}`,
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#ef4444', color: '#fff', fontWeight: 700 }}>
                  STAGE 4 CO-OP RAID BOSS
                </span>
                <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 28, color: 'white', margin: '8px 0 4px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>The Entropy Titan (ΔS ≥ 0)</span>
                </h2>
                <div style={{ fontSize: 13, color: '#c084fc' }}>
                  Trait: "Thermal Dissipation" • Requires simultaneous calculation & theoretical law pairing
                </div>
              </div>

              {/* Boss HP Bar */}
              <div style={{ width: 280, textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                  BOSS HP: {bossHp} / {maxBossHp}
                </div>
                <div style={{ width: '100%', height: 12, borderRadius: 6, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${(bossHp / maxBossHp) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b)', transition: 'width 0.4s' }} />
                </div>
              </div>
            </div>

            {/* Current Raid Question */}
            <div style={{ marginTop: 24, padding: 18, borderRadius: 12, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                Current Team Challenge:
              </div>
              <p style={{ fontSize: 14, color: 'white', lineHeight: 1.6, margin: '6px 0 0' }}>
                "A gas expands at a constant pressure of <strong>2.0 × 10⁵ Pa</strong> from an initial volume of <strong>0.001 m³</strong> to a final volume of <strong>0.003 m³</strong>."
              </p>
            </div>
          </div>

          {/* Dual Player Co-Op Input Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {/* Player 1: The Calculator */}
            <div style={{ padding: 16, borderRadius: 14, background: 'rgba(0,102,255,0.08)', border: '1px solid rgba(0,102,255,0.3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calculator size={15} />
                  <span>Player 1 (Calculator): Ravi</span>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(0,102,255,0.2)', color: '#60a5fa', fontWeight: 700 }}>MATH ROLE</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Calculate Work Done W = P × ΔV (in Joules):
              </div>
              <input
                type="text"
                placeholder="Enter value (e.g. 400)"
                value={player1Answer}
                onChange={e => setPlayer1Answer(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: 8, background: '#020408',
                  border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff',
                  fontFamily: 'JetBrains Mono', fontSize: 13, outline: 'none',
                }}
              />
            </div>

            {/* Player 2: The Theorist */}
            <div style={{ padding: 16, borderRadius: 14, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <BookOpen size={15} />
                  <span>Player 2 (Theorist): Priya</span>
                </div>
                <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.2)', color: '#c084fc', fontWeight: 700 }}>THEORY ROLE</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Identify the Thermodynamic Process:
              </div>
              <select
                value={player2SelectedLaw}
                onChange={e => setPlayer2SelectedLaw(e.target.value)}
                style={{
                  padding: '10px 14px', borderRadius: 8, background: '#020408',
                  border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc',
                  fontFamily: 'Outfit', fontSize: 13, outline: 'none',
                }}
              >
                <option value="">-- Choose Thermodynamic Law --</option>
                <option value="isobaric">Isobaric Process (Constant Pressure)</option>
                <option value="isochoric">Isochoric Process (Constant Volume)</option>
                <option value="adiabatic">Adiabatic Process (Zero Heat Exchange)</option>
              </select>
            </div>
          </div>

          {/* Trigger Combo Strike Button */}
          <button
            onClick={handleExecuteTeamCombo}
            style={{
              padding: '14px 28px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #ec4899)', color: 'white',
              fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'Outfit',
              boxShadow: '0 4px 20px rgba(245,158,11,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <Zap size={18} />
            <span>Execute Synchronized Team Combo Strike!</span>
          </button>
        </div>

        {/* RIGHT COLUMN: Real-Time Battle Feed & Party Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#00d4ff', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Heart size={16} color="#ef4444" />
              <span>Party Health & Mana</span>
            </h3>
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700 }}>{partyHp} / {maxPartyHp} HP</span>
          </div>

          <div style={{ width: '100%', height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
            <div style={{ width: `${(partyHp / maxPartyHp) * 100}%`, height: '100%', background: '#10b981' }} />
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>REAL-TIME BATTLE & CHAT FEED:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
              {battleLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    padding: 8, borderRadius: 8,
                    background: log.type === 'combo' ? 'rgba(245,158,11,0.15)' : log.type === 'boss_attack' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${log.type === 'combo' ? 'rgba(245,158,11,0.4)' : log.type === 'boss_attack' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    fontSize: 11, lineHeight: 1.5,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: log.type === 'combo' ? '#fbbf24' : log.type === 'boss_attack' ? '#ef4444' : '#00d4ff', fontWeight: 700 }}>
                    <span>{log.sender}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{log.time}</span>
                  </div>
                  <div style={{ color: 'white', marginTop: 2 }}>{log.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
