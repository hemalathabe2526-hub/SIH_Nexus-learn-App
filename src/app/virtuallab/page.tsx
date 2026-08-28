'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getStoredSession, type UserRole } from '@/lib/authStore';

type SubjectCategory = 'physics' | 'chemistry' | 'maths' | 'cs' | 'biology';

interface VirtualLabItem {
  id: string;
  title: string;
  category: SubjectCategory;
  description: string;
  icon: string;
}

const LAB_ITEMS: VirtualLabItem[] = [
  { id: 'pendulum', title: 'Interactive Pendulum & Gravity Simulator', category: 'physics', description: 'Adjust length L and gravity g to observe live periodic motion T = 2π√(L/g).', icon: '⏱️' },
  { id: 'double_slit', title: 'Young\'s Double Slit Wave Interference', category: 'physics', description: 'Vary wavelength λ, slit gap d, and screen distance D to calculate fringe width β = λD/d.', icon: '🌊' },
  { id: 'lens', title: 'Ray Optics Lens Refraction', category: 'physics', description: 'Drag object distance u and focal length f to observe live image formation 1/f = 1/v − 1/u.', icon: '🔍' },
  { id: 'titration', title: 'Acid-Base Titration & Live pH Curve', category: 'chemistry', description: 'Dispense NaOH burette drops to observe equivalence point color change and live pH plot.', icon: '🧪' },
  { id: 'bohr', title: '3D Bohr Atom & Electron Quantum Jumps', category: 'chemistry', description: 'Click electron orbits n=1..4 to trigger energy level jumps and photon light emissions.', icon: '⚛️' },
  { id: 'parabola', title: 'Quadratic Parabola & Roots Grapher', category: 'maths', description: 'Vary a, b, c coefficients to plot real-time parabola, vertex, and discriminant D = b²−4ac.', icon: '📈' },
  { id: 'trig_circle', title: 'Trigonometric Unit Circle & Waves', category: 'maths', description: 'Drag angle θ from 0° to 360° to track live sin(θ), cos(θ), and tan(θ) wave trajectories.', icon: '⭕' },
  { id: 'cpu_sched', title: 'CPU Scheduling & Gantt Chart Execution', category: 'cs', description: 'Configure process burst times and quantum to visualize Round-Robin execution live.', icon: '💻' },
  { id: 'tcp_handshake', title: 'TCP 3-Way Handshake Packet Simulator', category: 'cs', description: 'Interact with SYN, SYN-ACK, and ACK packet exchanges with sequence number tracking.', icon: '🌐' },
  { id: 'route_planner', title: 'Smart Route Planner & Graph Optimizer', category: 'cs', description: 'Solve real-world logistics problems by applying BFS, DFS, shortest path, and graph traversal heuristics.', icon: '🧭' },
  { id: 'network_load', title: 'Traffic Congestion & Packet Loss Lab', category: 'cs', description: 'Tune bandwidth, latency, and packet drop rates to model a real internet traffic bottleneck scenario.', icon: '📡' },
  { id: 'dna_helix', title: '3D DNA Replication & Base Pair Mutator', category: 'biology', description: 'Click base pairs A-T / G-C to simulate semi-conservative replication & transcription.', icon: '🧬' },
];

const ROLE_CATEGORIES: Record<UserRole, SubjectCategory[]> = {
  school: ['physics', 'chemistry', 'maths', 'biology'],
  college: ['cs', 'physics', 'maths'],
  aspirant: ['physics', 'chemistry', 'maths', 'biology'],
  skill: ['cs', 'maths'],
  teacher: ['physics', 'chemistry', 'maths', 'cs', 'biology'],
};

export default function VirtualLabPage() {
  const [currentUser] = useState(getStoredSession());
  const availableCategories = currentUser ? ROLE_CATEGORIES[currentUser.role] : [];
  const [activeCategory, setActiveCategory] = useState<SubjectCategory>(currentUser ? ROLE_CATEGORIES[currentUser.role][0] : 'physics');
  const [activeLab, setActiveLab] = useState<VirtualLabItem>(LAB_ITEMS[0]);

  // LAB 1: Pendulum
  const [pendulumLength, setPendulumLength] = useState<number>(2.0);
  const [pendulumGravity, setPendulumGravity] = useState<number>(9.8);
  const pendulumPeriod = (2 * Math.PI * Math.sqrt(pendulumLength / pendulumGravity)).toFixed(2);
  const pendulumCanvasRef = useRef<HTMLCanvasElement>(null);

  // LAB 2: Double slit
  const [wavelength, setWavelength] = useState<number>(600);
  const [slitDistance, setSlitDistance] = useState<number>(0.3);
  const [screenDistance, setScreenDistance] = useState<number>(1.5);
  const fringeWidth = ((wavelength * 1e-9 * screenDistance) / (slitDistance * 1e-3) * 1000).toFixed(2);

  // LAB 3: Lens Ray Optics
  const [objectDistU, setObjectDistU] = useState<number>(30); // cm
  const [focalLengthF, setFocalLengthF] = useState<number>(15); // cm
  const imageDistV = objectDistU !== focalLengthF ? (objectDistU * focalLengthF) / (objectDistU - focalLengthF) : Infinity;
  const magnification = isFinite(imageDistV) ? (-imageDistV / objectDistU).toFixed(2) : 'Infinity';

  // LAB 4: Titration
  const [buretVolume, setBuretVolume] = useState<number>(0);
  const currentpH = (buretVolume < 24 ? 1.0 + (buretVolume * 0.15) : buretVolume === 25 ? 7.0 : 7.0 + Math.min(6.5, (buretVolume - 25) * 0.5)).toFixed(2);
  const isIndicatorPink = parseFloat(currentpH) >= 8.2;

  // LAB 5: Bohr Atom
  const [electronOrbit, setElectronOrbit] = useState<number>(1);
  const [photonColor, setPhotonColor] = useState<string | null>(null);

  // LAB 6: Parabola
  const [coeffA, setCoeffA] = useState<number>(1);
  const [coeffB, setCoeffB] = useState<number>(-4);
  const [coeffC, setCoeffC] = useState<number>(3);
  const discriminant = coeffB * coeffB - 4 * coeffA * coeffC;
  const vertexX = (-coeffB / (2 * coeffA)).toFixed(2);
  const vertexY = (-(discriminant) / (4 * coeffA)).toFixed(2);

  // LAB 7: Trig Circle
  const [angleDeg, setAngleDeg] = useState<number>(45);
  const angleRad = (angleDeg * Math.PI) / 180;
  const sinVal = Math.sin(angleRad).toFixed(3);
  const cosVal = Math.cos(angleRad).toFixed(3);
  const tanVal = Math.abs(Math.cos(angleRad)) > 0.001 ? Math.tan(angleRad).toFixed(3) : 'Undefined';

  // LAB 8: CPU Scheduling
  const [timeQuantum, setTimeQuantum] = useState<number>(2);
  const [execStep, setExecStep] = useState<number>(0);

  // LAB 9: TCP Handshake
  const [tcpState, setTcpState] = useState<'CLOSED' | 'SYN_SENT' | 'SYN_RECEIVED' | 'ESTABLISHED'>('CLOSED');
  const [clientSeq, setClientSeq] = useState<number>(100);
  const [serverSeq, setServerSeq] = useState<number>(300);

  // LAB 10: DNA Base Pairs
  const [dnaStrand, setDnaStrand] = useState<Array<'A' | 'T' | 'G' | 'C'>>(['A', 'T', 'G', 'C', 'C', 'A', 'T', 'G']);

  // Pendulum animation loop
  useEffect(() => {
    if (activeLab.id !== 'pendulum') return;
    const canvas = pendulumCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const originX = canvas.width / 2;
      const originY = 40;
      const pixelLength = pendulumLength * 70;
      const omega = Math.sqrt(pendulumGravity / pendulumLength);
      const angle = 0.4 * Math.cos(omega * time);

      const bobX = originX + pixelLength * Math.sin(angle);
      const bobY = originY + pixelLength * Math.cos(angle);

      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(originX - 40, originY); ctx.lineTo(originX + 40, originY); ctx.stroke();

      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(bobX, bobY); ctx.stroke();

      const grad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
      grad.addColorStop(0, '#60a5fa');
      grad.addColorStop(1, '#0066ff');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(bobX, bobY, 18, 0, Math.PI * 2); ctx.fill();

      time += 0.03;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeLab.id, pendulumLength, pendulumGravity]);

  const handleOrbitJump = (targetOrbit: number) => {
    if (targetOrbit > electronOrbit) {
      setPhotonColor('#ef4444'); // Absorbed photon
    } else if (targetOrbit < electronOrbit) {
      setPhotonColor('#10b981'); // Emitted photon
    }
    setElectronOrbit(targetOrbit);
    setTimeout(() => setPhotonColor(null), 1500);
  };

  const filteredLabs = LAB_ITEMS.filter(l => l.category === activeCategory);

  if (!currentUser) return null;

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#10b981', margin: 0 }}>
          🧪 10/10 Fully Interactive Hands-On Virtual Learning Studio
        </h1>
        <Link href="/code" style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
          💻 Code Editor →
        </Link>
      </div>

      {/* Subject Tabs */}
      <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, justifyContent: 'center' }}>
        {[
          { id: 'physics', label: '⚛️ Physics', color: '#00d4ff' },
          { id: 'chemistry', label: '🧪 Chemistry', color: '#10b981' },
          { id: 'maths', label: '📈 Mathematics', color: '#f59e0b' },
          { id: 'cs', label: '💻 Computer Science', color: '#a855f7' },
          { id: 'biology', label: '🧬 Biology / NEET', color: '#ec4899' },
        ].filter(cat => availableCategories.includes(cat.id as SubjectCategory)).map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id as SubjectCategory);
              const firstInCat = LAB_ITEMS.find(l => l.category === cat.id);
              if (firstInCat) setActiveLab(firstInCat);
            }}
            style={{
              padding: '8px 18px', borderRadius: 10,
              background: activeCategory === cat.id ? `${cat.color}25` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.08)'}`,
              color: activeCategory === cat.id ? cat.color : 'rgba(255,255,255,0.6)',
              fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, maxWidth: 1440, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT: Experiment Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 14 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: 'rgba(255,255,255,0.6)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: 1 }}>
            Experiments ({filteredLabs.length})
          </h2>

          {filteredLabs.map(lab => (
            <button
              key={lab.id}
              onClick={() => setActiveLab(lab)}
              style={{
                padding: '14px 14px', borderRadius: 12, textAlign: 'left',
                background: activeLab.id === lab.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeLab.id === lab.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: activeLab.id === lab.id ? '#00d4ff' : 'white',
                cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{lab.icon}</span>
                <span>{lab.title}</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4 }}>{lab.description}</div>
            </button>
          ))}
        </div>

        {/* RIGHT: Live Interactive Simulation Engine */}
        <div style={{ borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 20, color: '#00d4ff', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{activeLab.icon}</span>
              <span>{activeLab.title}</span>
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{activeLab.description}</p>
          </div>

          {/* 1. PENDULUM */}
          {activeLab.id === 'pendulum' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(0,212,255,0.2)', padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <canvas ref={pendulumCanvasRef} width={400} height={320} style={{ display: 'block' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#00d4ff', margin: 0, fontWeight: 700 }}>⚙️ Parameters</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Length L: <strong>{pendulumLength} m</strong></label>
                  <input type="range" min={0.5} max={4.0} step={0.1} value={pendulumLength} onChange={e => setPendulumLength(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Gravity g: <strong>{pendulumGravity} m/s²</strong></label>
                  <input type="range" min={1.6} max={24.8} step={0.1} value={pendulumGravity} onChange={e => setPendulumGravity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700 }}>PERIOD T</div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk' }}>{pendulumPeriod} s</div>
                </div>
              </div>
            </div>
          )}

          {/* 2. DOUBLE SLIT */}
          {activeLab.id === 'double_slit' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(0,212,255,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: 180, borderRadius: 10, background: `repeating-linear-gradient(90deg, #020408 0 10px, hsl(${Math.max(0, Math.min(280, (700 - wavelength) * 1.2))}, 100%, 58%) 10px 18px, #020408 18px 28px)`, border: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s ease' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, textShadow: '0 0 10px #000', color: 'white' }}>Fringe Pattern (λ = {wavelength}nm)</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#00d4ff', margin: 0, fontWeight: 700 }}>⚙️ Parameters</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Wavelength λ: <strong>{wavelength} nm</strong></label>
                  <input type="range" min={400} max={700} value={wavelength} onChange={e => setWavelength(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Slit Gap d: <strong>{slitDistance} mm</strong></label>
                  <input type="range" min={0.1} max={1.0} step={0.05} value={slitDistance} onChange={e => setSlitDistance(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Screen Distance D: <strong>{screenDistance} m</strong></label>
                  <input type="range" min={0.5} max={3} step={0.1} value={screenDistance} onChange={e => setScreenDistance(parseFloat(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700 }}>FRINGE WIDTH β</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk' }}>{fringeWidth} mm</div>
                </div>
              </div>
            </div>
          )}

          {/* 3. LENS OPTICS */}
          {activeLab.id === 'lens' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(0,212,255,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 250 }}>
                <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.2)', position: 'absolute', top: '50%' }} />
                <svg viewBox="0 0 500 250" width="100%" height="220" aria-label="Dynamic convex lens ray diagram">
                  <line x1="250" y1="25" x2="250" y2="225" stroke="#00d4ff" strokeWidth="5" />
                  <line x1="55" y1="125" x2="445" y2="125" stroke="rgba(255,255,255,0.25)" />
                  <line x1="95" y1="125" x2="250" y2="70" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="250" y1="70" x2="410" y2={Math.max(35, Math.min(215, 125 - imageDistV * 1.4))} stroke="#10b981" strokeWidth="2" />
                  <line x1="95" y1="125" x2="250" y2="125" stroke="#f59e0b" strokeWidth="2" />
                  <line x1="250" y1="125" x2="410" y2="125" stroke="#10b981" strokeWidth="2" />
                  <line x1="95" y1="65" x2="95" y2="125" stroke="#f59e0b" strokeWidth="6" />
                  {isFinite(imageDistV) && <line x1="410" y1={Math.max(35, Math.min(215, 125 - imageDistV * 1.4))} x2="410" y2="125" stroke="#10b981" strokeWidth="6" />}
                </svg>
                <div style={{ fontSize: 13, color: '#00d4ff', position: 'absolute', bottom: 16 }}>Convex Lens Ray Optics Trajectory</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#00d4ff', margin: 0, fontWeight: 700 }}>🔍 Lens Parameters</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Object Dist u: <strong>{objectDistU} cm</strong></label>
                  <input type="range" min={16} max={60} value={objectDistU} onChange={e => setObjectDistU(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Focal Length f: <strong>{focalLengthF} cm</strong></label>
                  <input type="range" min={5} max={25} value={focalLengthF} onChange={e => setFocalLengthF(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700 }}>IMAGE DISTANCE v</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk' }}>{isFinite(imageDistV) ? `${imageDistV.toFixed(1)} cm` : 'Infinity'}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Magnification m = {magnification}</div>
                </div>
              </div>
            </div>
          )}

          {/* 4. TITRATION */}
          {activeLab.id === 'titration' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 120, height: 180, borderRadius: '0 0 40px 40px', background: isIndicatorPink ? 'rgba(236,72,153,0.6)' : 'rgba(255,255,255,0.1)', border: '3px solid rgba(255,255,255,0.3)', boxShadow: isIndicatorPink ? '0 0 30px rgba(236,72,153,0.5)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{isIndicatorPink ? 'PINK (Base)' : 'CLEAR (Acid)'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#10b981', margin: 0, fontWeight: 700 }}>🧪 Burette Controls</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>NaOH Added: <strong>{buretVolume} mL</strong></label>
                  <input type="range" min={0} max={50} value={buretVolume} onChange={e => setBuretVolume(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>SOLUTION pH</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk' }}>{currentpH}</div>
                </div>
              </div>
            </div>
          )}

          {/* 5. BOHR ATOM */}
          {activeLab.id === 'bohr' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 280 }}>
                {/* Nucleus */}
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, zIndex: 10 }}>+e</div>
                {/* Orbit Rings */}
                {[1, 2, 3, 4].map(n => (
                  <div key={n} style={{ width: n * 60, height: n * 60, borderRadius: '50%', border: `1px ${electronOrbit === n ? 'solid #10b981' : 'dashed rgba(255,255,255,0.15)'}`, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {electronOrbit === n && <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 10px #00d4ff', position: 'absolute', top: -7 }} />}
                  </div>
                ))}
                {photonColor && <div style={{ position: 'absolute', top: 20, color: photonColor, fontWeight: 700, fontSize: 14 }}>✨ Photon Emission Flash!</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#10b981', margin: 0, fontWeight: 700 }}>⚛️ Select Electron Shell</h3>
                {[1, 2, 3, 4].map(n => (
                  <button key={n} onClick={() => handleOrbitJump(n)} style={{ padding: '8px 14px', borderRadius: 8, background: electronOrbit === n ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${electronOrbit === n ? '#10b981' : 'rgba(255,255,255,0.08)'}`, color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 12, fontFamily: 'Outfit' }}>
                    Orbit n={n} (Energy E{n} = {(-13.6 / (n * n)).toFixed(2)} eV)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. PARABOLA */}
          {activeLab.id === 'parabola' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(245,158,11,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b', marginBottom: 12, fontFamily: 'Space Grotesk' }}>
                  y = {coeffA}x² {coeffB >= 0 ? `+ ${coeffB}` : `− ${Math.abs(coeffB)}`}x {coeffC >= 0 ? `+ ${coeffC}` : `− ${Math.abs(coeffC)}`}
                </div>
                <div style={{ width: '100%', height: 180, borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                  Parabola Vertex: ({vertexX}, {vertexY})
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#f59e0b', margin: 0, fontWeight: 700 }}>📈 Coefficients</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>a: <strong>{coeffA}</strong></label>
                  <input type="range" min={-5} max={5} step={1} value={coeffA} onChange={e => setCoeffA(parseInt(e.target.value) || 1)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>b: <strong>{coeffB}</strong></label>
                  <input type="range" min={-10} max={10} step={1} value={coeffB} onChange={e => setCoeffB(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: 14, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>DISCRIMINANT D</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'white', fontFamily: 'Space Grotesk' }}>{discriminant}</div>
                </div>
              </div>
            </div>
          )}

          {/* 7. TRIG UNIT CIRCLE */}
          {activeLab.id === 'trig_circle' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(245,158,11,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 250 }}>
                <div style={{ width: 160, height: 160, borderRadius: '50%', border: '2px solid #f59e0b', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.2)', position: 'absolute' }} />
                  <div style={{ width: 1, height: '100%', background: 'rgba(255,255,255,0.2)', position: 'absolute' }} />
                  <div style={{ width: 80, height: 2, background: '#00d4ff', position: 'absolute', transformOrigin: 'left center', transform: `rotate(${-angleDeg}deg)` }} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#f59e0b', margin: 0, fontWeight: 700 }}>⭕ Angle Control</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Angle θ: <strong>{angleDeg}°</strong></label>
                  <input type="range" min={0} max={360} value={angleDeg} onChange={e => setAngleDeg(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <div style={{ padding: 12, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13, lineHeight: 1.6 }}>
                  <div>sin({angleDeg}°) = <strong style={{ color: '#00d4ff' }}>{sinVal}</strong></div>
                  <div>cos({angleDeg}°) = <strong style={{ color: '#10b981' }}>{cosVal}</strong></div>
                  <div>tan({angleDeg}°) = <strong style={{ color: '#f59e0b' }}>{tanVal}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* 8. CPU SCHEDULING */}
          {activeLab.id === 'cpu_sched' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(168,85,247,0.2)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h4 style={{ fontSize: 13, color: '#a855f7', margin: 0 }}>Gantt Chart Execution Timeline</h4>
                <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', padding: 8, borderRadius: 8 }}>
                  {['P1 (2ms)', 'P2 (2ms)', 'P3 (2ms)', 'P1 (2ms)', 'P2 (1ms)'].map((block, idx) => (
                    <div key={idx} style={{ flex: 1, padding: 8, background: idx % 2 === 0 ? 'rgba(168,85,247,0.3)' : 'rgba(0,212,255,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6, fontSize: 11, textAlign: 'center', fontWeight: 700 }}>
                      {block}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#a855f7', margin: 0, fontWeight: 700 }}>💻 Quantum Settings</h3>
                <div>
                  <label style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'block', marginBottom: 4 }}>Time Quantum: <strong>{timeQuantum} ms</strong></label>
                  <input type="range" min={1} max={5} value={timeQuantum} onChange={e => setTimeQuantum(parseInt(e.target.value))} style={{ width: '100%' }} />
                </div>
                <button onClick={() => setExecStep(prev => prev + 1)} style={{ padding: '9px 14px', borderRadius: 8, background: '#a855f7', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer' }}>
                  ▶ Run Next Quantum Step ({execStep})
                </button>
              </div>
            </div>
          )}

          {/* 9. TCP HANDSHAKE */}
          {activeLab.id === 'tcp_handshake' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(168,85,247,0.2)', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>💻</div>
                  <strong style={{ fontSize: 13, color: '#00d4ff' }}>Client Host</strong>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Seq={clientSeq}</div>
                </div>

                <div style={{ textAlign: 'center', padding: '10px 20px', borderRadius: 10, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#a855f7' }}>STATE: {tcpState}</div>
                  <div style={{ fontSize: 11, color: 'white', marginTop: 4 }}>
                    {tcpState === 'CLOSED' ? 'Click "Send SYN" to start' : tcpState === 'SYN_SENT' ? 'SYN Packet Transmitted →' : tcpState === 'SYN_RECEIVED' ? '← SYN-ACK Received' : '✅ Connection Established!'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24 }}>🖥️</div>
                  <strong style={{ fontSize: 13, color: '#10b981' }}>Server Host</strong>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Seq={serverSeq}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#a855f7', margin: 0, fontWeight: 700 }}>🌐 Handshake Steps</h3>
                <button onClick={() => setTcpState('SYN_SENT')} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(0,212,255,0.2)', border: '1px solid #00d4ff', color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>1. Send SYN (Seq={clientSeq})</button>
                <button onClick={() => setTcpState('SYN_RECEIVED')} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>2. Send SYN-ACK (Ack={clientSeq + 1})</button>
                <button onClick={() => setTcpState('ESTABLISHED')} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(168,85,247,0.2)', border: '1px solid #a855f7', color: 'white', cursor: 'pointer', textAlign: 'left', fontSize: 12 }}>3. Send ACK (Ack={serverSeq + 1})</button>
                <button onClick={() => setTcpState('CLOSED')} style={{ padding: '6px 12px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11, marginTop: 4 }}>Reset Connection</button>
              </div>
            </div>
          )}

          {/* 10. DNA HELIX */}
          {activeLab.id === 'dna_helix' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
              <div style={{ background: '#020408', borderRadius: 16, border: '1px solid rgba(236,72,153,0.2)', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#ec4899', marginBottom: 10 }}>Double Strand Base Sequence</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {dnaStrand.map((base, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: base === 'A' ? '#ef4444' : base === 'T' ? '#3b82f6' : base === 'G' ? '#10b981' : '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>{base}</div>
                      <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.2)' }} />
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: base === 'A' ? '#3b82f6' : base === 'T' ? '#ef4444' : base === 'G' ? '#f59e0b' : '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                        {base === 'A' ? 'T' : base === 'T' ? 'A' : base === 'G' ? 'C' : 'G'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderRadius: 14, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 style={{ fontSize: 14, color: '#ec4899', margin: 0, fontWeight: 700 }}>🧬 Base Pair Mutator</h3>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Click to append base to strand:</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {(['A', 'T', 'G', 'C'] as Array<'A' | 'T' | 'G' | 'C'>).map(b => (
                    <button key={b} onClick={() => setDnaStrand(prev => [...prev.slice(1), b])} style={{ padding: '8px', borderRadius: 6, background: 'rgba(236,72,153,0.15)', border: '1px solid #ec4899', color: 'white', fontWeight: 700, cursor: 'pointer' }}>+ Base {b}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
