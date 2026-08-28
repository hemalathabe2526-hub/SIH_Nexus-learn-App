'use client';

import { useState } from 'react';
import Link from 'next/link';

const QUESTS = [
  {
    id: 1,
    title: 'The Gravity Codex',
    subject: 'Physics',
    chapter: 'Laws of Motion',
    xp: 500,
    level: 3,
    icon: '⚡',
    color: '#0066ff',
    lore: 'Ancient scrolls speak of a force that binds all matter. Master Newton\'s laws to unlock the Codex of Gravity.',
    objectives: [
      { text: 'Understand Newton\'s 1st Law', done: true },
      { text: 'Solve 5 force problems', done: true },
      { text: 'Complete the Inclined Plane dungeon', done: false },
      { text: 'Defeat the Friction Boss', done: false },
    ],
    boss: { name: 'The Friction Demon', hp: 300, maxHp: 300, icon: '👹' },
    questions: [
      {
        text: 'A 5kg box is on a surface. Applied force = 20N, friction = 8N. What is acceleration?',
        options: ['2.4 m/s²', '1.6 m/s²', '4.0 m/s²', '3.2 m/s²'],
        correct: 0,
        hint: 'Use F_net = F_applied - F_friction = m * a',
      },
      {
        text: 'What is the reaction force to the Earth pulling down on a 10kg object with 98N of weight?',
        options: ['The normal force from the ground', 'The object pulling UP on the Earth with 98N', 'Air resistance pushing up', 'Zero force'],
        correct: 1,
        hint: 'Newton\'s 3rd Law pairs interact between the SAME two bodies!',
      },
    ],
  },
  {
    id: 2,
    title: 'The Calculus Labyrinth',
    subject: 'Mathematics',
    chapter: 'Differentiation',
    xp: 750,
    level: 5,
    icon: '🌀',
    color: '#7c3aed',
    lore: 'In the realm of infinitesimals, rates of change hold unimaginable power. Navigate the Labyrinth of Derivatives.',
    objectives: [
      { text: 'Learn limit definition', done: true },
      { text: 'Master differentiation rules', done: false },
      { text: 'Solve optimization problems', done: false },
    ],
    boss: { name: 'The Infinite Regress', hp: 450, maxHp: 450, icon: '🌌' },
    questions: [
      {
        text: 'What is the derivative of f(x) = 3x² + 5x - 7?',
        options: ['6x + 5', '3x + 5', '6x - 7', 'x³ + 5'],
        correct: 0,
        hint: 'Use Power Rule: d/dx(x^n) = n*x^(n-1)',
      },
    ],
  },
];

export default function RPGPage() {
  const [selectedQuest, setSelectedQuest] = useState(QUESTS[0]);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [bossHp, setBossHp] = useState(300);
  const [playerHp, setPlayerHp] = useState(85);
  const [playerMana, setPlayerMana] = useState(60);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Scroll of Analogies', icon: '📜', type: 'Hint', uses: 3 },
    { id: 2, name: 'Potion of Focus', icon: '🧪', type: 'Heal HP (+30)', uses: 2 },
    { id: 3, name: 'Mana Crystal', icon: '💎', type: 'Restore MP (+40)', uses: 2 },
  ]);
  const [battleLog, setBattleLog] = useState<string[]>([
    '⚔️ You enter the dungeon...',
    '👹 Friction Demon appears!',
    '🧠 Answer correctly to deal knowledge damage!',
  ]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState(false);

  const currentQ = selectedQuest.questions[questionIdx % selectedQuest.questions.length];

  const handleUseItem = (itemId: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.uses <= 0) return;

    if (item.type.includes('Heal HP')) {
      setPlayerHp(prev => Math.min(100, prev + 30));
      setBattleLog(prev => [`🧪 Drank Potion of Focus! +30 HP restored!`, ...prev]);
    } else if (item.type.includes('Restore MP')) {
      setPlayerMana(prev => Math.min(100, prev + 40));
      setBattleLog(prev => [`💎 Used Mana Crystal! +40 MP restored!`, ...prev]);
    } else if (item.type.includes('Hint')) {
      setActiveHint(currentQ.hint);
      setBattleLog(prev => [`📜 Unrolled Scroll of Analogies! Hint revealed!`, ...prev]);
    }

    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, uses: i.uses - 1 } : i));
  };

  const handleAttack = (answerIdx: number) => {
    setSelectedAnswer(answerIdx);
    setQuestionAnswered(true);
    if (answerIdx === currentQ.correct) {
      const damage = Math.floor(Math.random() * 50 + 100);
      const newBossHp = Math.max(0, bossHp - damage);
      setBossHp(newBossHp);
      setBattleLog(prev => [`⚡ CRITICAL HIT! Dealt ${damage} damage to ${selectedQuest.boss.name}!`, ...prev.slice(0, 5)]);
      if (newBossHp === 0) {
        setBattleLog(prev => [`🎉 VICTORY! ${selectedQuest.boss.name} defeated! +${selectedQuest.xp} XP earned!`, ...prev.slice(0, 5)]);
      }
    } else {
      const damage = Math.floor(Math.random() * 20 + 15);
      setPlayerHp(Math.max(0, playerHp - damage));
      setBattleLog(prev => [`❌ Incorrect! Boss counter-attacks dealing ${damage} damage!`, ...prev.slice(0, 5)]);
    }
  };

  const handleNextTurn = () => {
    setSelectedAnswer(null);
    setQuestionAnswered(false);
    setActiveHint(null);
    if (bossHp === 0) {
      setBossHp(selectedQuest.boss.maxHp);
    }
    setQuestionIdx(prev => prev + 1);
  };

  return (
    <div style={{ background: 'var(--nexus-void)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(245,158,11,0.2)', background: 'rgba(2,4,8,0.9)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 18, color: '#f59e0b' }}>
          ⚔️ Narrative RPG Engine & Daily Assessments
        </h1>
        <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>Hero: Arjun the Scholar (Lv.7)</span>
      </div>

      <div style={{ maxWidth: 1350, margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 20 }}>

        {/* Hero Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, borderRadius: 16, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 52, marginBottom: 4 }}>🧙‍♂️</div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 18, color: '#f59e0b' }}>Arjun Kumar</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Level 7 · Knowledge Seeker</div>
            </div>

            {[
              { label: 'HP', current: playerHp, max: 100, color: '#ef4444' },
              { label: 'MP', current: playerMana, max: 100, color: '#0066ff' },
            ].map(bar => (
              <div key={bar.label} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{bar.label}</span>
                  <span style={{ color: bar.color, fontWeight: 600 }}>{bar.current}/{bar.max}</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4 }}>
                  <div style={{ height: '100%', borderRadius: 4, background: bar.color, width: `${bar.current}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Inventory */}
          <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              🎒 Click Item to Use in Battle
            </div>
            {inventory.map(item => (
              <button
                key={item.id}
                onClick={() => handleUseItem(item.id)}
                disabled={item.uses <= 0}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px',
                  borderRadius: 10, marginBottom: 8, textAlign: 'left',
                  background: item.uses > 0 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${item.uses > 0 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.04)'}`,
                  color: item.uses > 0 ? 'white' : 'rgba(255,255,255,0.3)',
                  cursor: item.uses > 0 ? 'pointer' : 'default', fontFamily: 'Outfit'
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 10, color: '#f59e0b' }}>{item.type} ({item.uses} left)</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Battle Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Boss HP Bar */}
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#ef4444' }}>
                {selectedQuest.boss.icon} {selectedQuest.boss.name}
              </span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', fontFamily: 'Space Grotesk' }}>
                {bossHp} / {selectedQuest.boss.maxHp} HP
              </span>
            </div>
            <div style={{ height: 16, background: 'rgba(255,255,255,0.08)', borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', background: 'linear-gradient(90deg, #ef4444, #f97316)',
                width: `${(bossHp / selectedQuest.boss.maxHp) * 100}%`, transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Question Box */}
          <div style={{ padding: 24, borderRadius: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
              Attack Question #{questionIdx + 1}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'white', lineHeight: 1.5, marginBottom: 16 }}>
              {currentQ.text}
            </div>

            {activeHint && (
              <div style={{ padding: 12, borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 12, marginBottom: 14 }}>
                💡 <strong>Hint Unlocked:</strong> {activeHint}
              </div>
            )}

            {/* Answer Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {currentQ.options.map((opt, i) => {
                let bg = 'rgba(255,255,255,0.03)';
                let border = 'rgba(255,255,255,0.08)';
                let color = 'rgba(255,255,255,0.8)';
                if (questionAnswered) {
                  if (i === currentQ.correct) { bg = 'rgba(16,185,129,0.15)'; border = '#10b981'; color = '#10b981'; }
                  else if (i === selectedAnswer) { bg = 'rgba(239,68,68,0.15)'; border = '#ef4444'; color = '#ef4444'; }
                }
                return (
                  <button
                    key={i}
                    onClick={() => !questionAnswered && handleAttack(i)}
                    style={{
                      padding: '14px 16px', borderRadius: 10, background: bg, border: `1px solid ${border}`,
                      color, fontSize: 13, fontWeight: 600, cursor: questionAnswered ? 'default' : 'pointer',
                      textAlign: 'left', fontFamily: 'Outfit', transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ opacity: 0.5, marginRight: 8 }}>{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {questionAnswered && (
              <button
                onClick={handleNextTurn}
                style={{ marginTop: 16, width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #f97316)', border: 'none', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                ⚔️ Next Attack Turn →
              </button>
            )}
          </div>

          {/* Battle Log Console */}
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)', fontFamily: 'JetBrains Mono, monospace' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6, textTransform: 'uppercase' }}>Battle Log</div>
            {battleLog.slice(0, 4).map((log, i) => (
              <div key={i} style={{ fontSize: 11, color: i === 0 ? '#00d4ff' : 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                &gt; {log}
              </div>
            ))}
          </div>
        </div>

        {/* Quests Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            📜 Select Active Dungeon
          </div>
          {QUESTS.map(q => (
            <button
              key={q.id}
              onClick={() => { setSelectedQuest(q); setBossHp(q.boss.maxHp); setQuestionIdx(0); setQuestionAnswered(false); }}
              style={{
                padding: 16, borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                background: selectedQuest.id === q.id ? `${q.color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selectedQuest.id === q.id ? q.color : 'rgba(255,255,255,0.06)'}`,
                color: 'white', fontFamily: 'Outfit'
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{q.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{q.title}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{q.subject} · Lv.{q.level} (+{q.xp} XP)</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
