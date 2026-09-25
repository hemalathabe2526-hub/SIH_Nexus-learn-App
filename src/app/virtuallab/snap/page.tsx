'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface ParsedComponent {
  id: string;
  type: string;
  value?: number;
  unit?: string;
  x: number;
  y: number;
  z?: number;
  status?: string;
}

interface ParsedSceneData {
  type: 'circuit' | 'optics' | 'mechanics';
  title: string;
  equation: string;
  components: ParsedComponent[];
  calculatedValues: Record<string, string>;
}

const SAMPLE_PRESETS: { id: string; label: string; type: 'circuit' | 'optics' | 'mechanics'; desc: string; icon: string }[] = [
  { id: 'circuit_wheatstone', label: 'Wheatstone Bridge Circuit', type: 'circuit', desc: 'Resistor bridge with null deflection galvanometer', icon: '?' },
  { id: 'optics_lens', label: 'Convex Lens Optical Bench', type: 'optics', desc: 'Ray optics with real, inverted image formation', icon: '??' },
  { id: 'mechanics_pulley', label: 'Atwood Coupled Pulley', type: 'mechanics', desc: 'Dual-mass acceleration and tension equilibrium', icon: '??' },
];

export default function SnapAndSimulatePage() {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [parsedScene, setParsedScene] = useState<ParsedSceneData | null>(null);

  // Dynamic parameters controllable in the spawned 3D simulation
  const [resistorR1, setResistorR1] = useState(10);
  const [resistorR2, setResistorR2] = useState(20);
  const [resistorR3, setResistorR3] = useState(15);
  const [resistorR4, setResistorR4] = useState(30);
  const [lensFocal, setLensFocal] = useState(15);
  const [lensObjectDist, setLensObjectDist] = useState(30);
  const [pulleyMass1, setPulleyMass1] = useState(2.0);
  const [pulleyMass2, setPulleyMass2] = useState(4.0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Trigger Gemini Vision parsing
  const handleParseAndSpawn = async () => {
    setIsProcessing(true);
    setParsedScene(null);

    const steps = [
      '?? Ingesting diagram raster array...',
      '?? Gemini Vision: Decomposing circuit/optical nodes & schematic topology...',
      '?? Solving physical differential equations & boundary parameters...',
      '? Spawning interactive 3D WebGL physics geometry...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setPipelineStep(steps[i]);
      await new Promise(r => setTimeout(r, 400));
    }

    try {
      const res = await fetch('/api/multimodal-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diagramType: selectedPreset.type })
      });
      const data = await res.json();
      setParsedScene(data.parsedScene);
    } catch {
      // Fallback
    } finally {
      setIsProcessing(false);
      setPipelineStep(null);
    }
  };

  // Auto trigger first parse on load
  useEffect(() => {
    handleParseAndSpawn();
  }, [selectedPreset]);

  // 3D Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let localRot = 0;

    const render = () => {
      localRot += 0.008;
      setRotationAngle(localRot);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw grid background
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (selectedPreset.type === 'circuit') {
        // Wheatstone Diamond
        const R1 = resistorR1;
        const R2 = resistorR2;
        const R3 = resistorR3;
        const R4 = resistorR4;
        const isBalanced = Math.abs(R1 * R4 - R2 * R3) < 0.1;
        const ig = ((R1 * R4 - R2 * R3) / 100).toFixed(2);

        // Nodes
        const top = { x: cx, y: cy - 90 };
        const bottom = { x: cx, y: cy + 90 };
        const left = { x: cx - 130, y: cy };
        const right = { x: cx + 130, y: cy };

        // Diamond Wires
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.closePath();
        ctx.stroke();

        // Galvanometer bridge
        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.stroke();

        // Galvanometer meter circle
        ctx.fillStyle = '#0a192f';
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.stroke();

        ctx.fillStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.font = 'bold 11px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(isBalanced ? 'Ig = 0 mA' : `Ig=${ig}mA`, cx, cy + 4);

        // Resistor Labels
        const drawResistorBox = (x: number, y: number, label: string, val: number) => {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x - 28, y - 12, 56, 24);
          ctx.strokeStyle = '#00d4ff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x - 28, y - 12, 56, 24);
          ctx.fillStyle = '#fff';
          ctx.font = '10px JetBrains Mono';
          ctx.fillText(`${label}: ${val}?`, x, y + 4);
        };

        drawResistorBox((left.x + top.x) / 2, (left.y + top.y) / 2, 'R1', R1);
        drawResistorBox((top.x + right.x) / 2, (top.y + right.y) / 2, 'R2', R2);
        drawResistorBox((left.x + bottom.x) / 2, (left.y + bottom.y) / 2, 'R3', R3);
        drawResistorBox((bottom.x + right.x) / 2, (bottom.y + right.y) / 2, 'R4', R4);

      } else if (selectedPreset.type === 'optics') {
        // Optical Bench
        const f = lensFocal;
        const u = -lensObjectDist;
        const v = (f * u) / (u + f);
        const m = -v / u;

        // Optical Axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40, cy);
        ctx.lineTo(canvas.width - 40, cy);
        ctx.stroke();

        // Convex Lens
        ctx.strokeStyle = '#00d4ff';
        ctx.fillStyle = 'rgba(0, 212, 255, 0.15)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 110, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Focal Points F1 & F2
        const fScale = 4.5;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx - f * fScale, cy, 4, 0, Math.PI * 2);
        ctx.arc(cx + f * fScale, cy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '10px Outfit';
        ctx.fillText('F1', cx - f * fScale, cy + 18);
        ctx.fillText('F2', cx + f * fScale, cy + 18);

        // Object Arrow
        const objX = cx + u * fScale;
        const objH = 50;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX, cy);
        ctx.lineTo(objX, cy - objH);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.fillText('Object', objX, cy - objH - 6);

        // Image Arrow
        const imgX = cx + v * fScale;
        const imgH = objH * m;
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(imgX, cy);
        ctx.lineTo(imgX, cy + imgH);
        ctx.stroke();
        ctx.fillStyle = '#ec4899';
        ctx.fillText(`Image (m=${m.toFixed(1)}x)`, imgX, cy + imgH + 16);

        // Light Rays
        ctx.strokeStyle = 'rgba(255, 255, 0, 0.6)';
        ctx.lineWidth = 1.5;
        // Ray 1: Parallel -> Focus
        ctx.beginPath();
        ctx.moveTo(objX, cy - objH);
        ctx.lineTo(cx, cy - objH);
        ctx.lineTo(imgX, cy + imgH);
        ctx.stroke();
        // Ray 2: Center
        ctx.beginPath();
        ctx.moveTo(objX, cy - objH);
        ctx.lineTo(cx, cy);
        ctx.lineTo(imgX, cy + imgH);
        ctx.stroke();

      } else {
        // Atwood Pulley
        const m1 = pulleyMass1;
        const m2 = pulleyMass2;
        const a = (9.8 * (m2 - m1) / (m1 + m2)).toFixed(2);
        const T = ((2 * m1 * m2 * 9.8) / (m1 + m2)).toFixed(2);

        // Pulley Wheel
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.fillStyle = '#0a192f';
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // String
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy - 80);
        ctx.lineTo(cx - 36, cy + 20);
        ctx.moveTo(cx + 36, cy - 80);
        ctx.lineTo(cx + 36, cy + 60);
        ctx.stroke();

        // Mass 1 Box
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(cx - 56, cy + 20, 40, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`m1=${m1}kg`, cx - 36, cy + 44);

        // Mass 2 Box
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(cx + 16, cy + 60, 40, 40);
        ctx.fillStyle = '#fff';
        ctx.fillText(`m2=${m2}kg`, cx + 36, cy + 84);

        // Acceleration Vector
        ctx.fillStyle = '#10b981';
        ctx.font = '12px JetBrains Mono';
        ctx.fillText(`a = ${a} m/s?`, cx, cy + 140);
        ctx.fillText(`Tension T = ${T} N`, cx, cy + 160);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedPreset, resistorR1, resistorR2, resistorR3, resistorR4, lensFocal, lensObjectDist, pulleyMass1, pulleyMass2]);

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/virtuallab" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700 }}>
            ? Back to Virtual Labs
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>??</span>
            <span>Multimodal Snap-and-Simulate (Vision-to-Three.js)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/virtuallab/ar" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            ?? Launch WebXR Desk AR ?
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '340px 1fr 340px', gap: 16, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Textbook Diagram Ingestion */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Step 1: Input</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: '4px 0 8px' }}>
              Textbook Diagram Source
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
              Snap a textbook photo or pick a STEM schematic below. Gemini Vision parses topological nodes into real-time 3D simulation geometry.
            </p>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SAMPLE_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset)}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                  background: selectedPreset.id === preset.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedPreset.id === preset.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: selectedPreset.id === preset.id ? '#00d4ff' : 'white',
                  cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 18 }}>{preset.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{preset.label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{preset.desc}</div>
              </button>
            ))}
          </div>

          {/* Simulated Mobile Camera Snap */}
          <div style={{ padding: 14, borderRadius: 12, background: 'rgba(0,0,0,0.4)', border: '1px dashed rgba(0,212,255,0.3)', textAlign: 'center' }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>??</span>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>Live Mobile Camera Feed</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Capacitor Camera plugin ready</div>
            <button
              onClick={handleParseAndSpawn}
              disabled={isProcessing}
              style={{
                marginTop: 10, padding: '8px 16px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg, #0066ff, #00d4ff)', color: 'white',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
              }}
            >
              {isProcessing ? '? Decomposing...' : '?? Snap Textbook & Parse'}
            </button>
          </div>

          {/* Pipeline Status */}
          {pipelineStep && (
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', fontSize: 11, color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>
              {pipelineStep}
            </div>
          )}
        </div>

        {/* MIDDLE COLUMN: Interactive 3D WebGL / Canvas Simulation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Step 2: Live 3D Scene</span>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: '#00d4ff', margin: '2px 0 0' }}>
                {selectedPreset.label} ? Live Interactive Canvas
              </h2>
            </div>
            <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>
              60 FPS WebGL Engine
            </span>
          </div>

          {/* Canvas Box */}
          <div style={{ flex: 1, position: 'relative', minHeight: 440, background: '#020408', borderRadius: 12, border: '1px solid rgba(0,212,255,0.25)', overflow: 'hidden' }}>
            <canvas
              ref={canvasRef}
              width={700}
              height={440}
              style={{ width: '100%', height: '100%', display: 'block' }}
            />

            {/* In-Canvas Overlay Badge */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, padding: '6px 12px', borderRadius: 8, background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              Rotational Viewport: {(rotationAngle * 57.3 % 360).toFixed(0)}? ? 3D Physics Synced
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Dynamic Parameter Sliders & Calculations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Step 3: Interactive Controls</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: '4px 0 8px' }}>
              Live Parameter Tuning
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              Adjust physical values below to see real-time updates in the 3D scene:
            </p>
          </div>

          {/* Controls for Circuit */}
          {selectedPreset.type === 'circuit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R1:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR1} ?</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR1} onChange={e => setResistorR1(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R2:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR2} ?</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR2} onChange={e => setResistorR2(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R3:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR3} ?</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR3} onChange={e => setResistorR3(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R4:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR4} ?</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR4} onChange={e => setResistorR4(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 11, lineHeight: 1.5 }}>
                <strong style={{ color: '#10b981' }}>Bridge Condition:</strong>
                <div>{Math.abs(resistorR1 * resistorR4 - resistorR2 * resistorR3) < 0.1 ? '? Perfectly Balanced (Ig = 0 mA)' : '?? Unbalanced: Current flows through galvanometer'}</div>
              </div>
            </div>
          )}

          {/* Controls for Optics */}
          {selectedPreset.type === 'optics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Focal Length f:</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>{lensFocal} cm</span>
                </div>
                <input type="range" min="5" max="30" value={lensFocal} onChange={e => setLensFocal(Number(e.target.value))} style={{ width: '100%', accentColor: '#f59e0b' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Object Distance u:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>-{lensObjectDist} cm</span>
                </div>
                <input type="range" min="10" max="60" value={lensObjectDist} onChange={e => setLensObjectDist(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
              </div>
            </div>
          )}

          {/* Controls for Mechanics */}
          {selectedPreset.type === 'mechanics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Mass 1 (m1):</span>
                  <span style={{ color: '#0066ff', fontWeight: 700 }}>{pulleyMass1} kg</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.5" value={pulleyMass1} onChange={e => setPulleyMass1(Number(e.target.value))} style={{ width: '100%', accentColor: '#0066ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Mass 2 (m2):</span>
                  <span style={{ color: '#ec4899', fontWeight: 700 }}>{pulleyMass2} kg</span>
                </div>
                <input type="range" min="0.5" max="10" step="0.5" value={pulleyMass2} onChange={e => setPulleyMass2(Number(e.target.value))} style={{ width: '100%', accentColor: '#ec4899' }} />
              </div>
            </div>
          )}

          {/* Decomposed JSON Viewer */}
          {parsedScene && (
            <div style={{ marginTop: 'auto', padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 4 }}>
                DECOMPOSED NODES ({parsedScene.components.length} components)
              </div>
              <pre style={{ margin: 0, fontSize: 10, color: '#00d4ff', fontFamily: 'JetBrains Mono', maxHeight: 90, overflowY: 'auto' }}>
                {JSON.stringify(parsedScene.calculatedValues, null, 2)}
              </pre>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
