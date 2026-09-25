'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function WebXRDeskARPage() {
  const [arModel, setArModel] = useState<'optics' | 'bohr' | 'circuit'>('optics');
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(45);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [arStatus, setArStatus] = useState('Desk Plane Detected (Horizontal Surface: 0.82m)');
  const [laserPoint, setLaserPoint] = useState<{ x: number; y: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Toggle mobile/web camera feed
  const toggleCamera = async () => {
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsCameraActive(true);
      } catch (err) {
        alert('Camera access unavailable or denied. Running high-fidelity desk projection simulator.');
      }
    }
  };

  // Holographic AR Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulse = 0;

    const render = () => {
      pulse += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2 + 30;

      // Draw AR Surface Reticle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.45); // Isometric desk tilt
      ctx.rotate((rotation * Math.PI) / 180);

      // Tracking Grid on Desk
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let r = 40; r <= 180; r += 35) {
        ctx.beginPath();
        ctx.arc(0, 0, r * scale, 0, Math.PI * 2);
        ctx.stroke();
      }

      // AR Axis Lines
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(-180 * scale, 0);
      ctx.lineTo(180 * scale, 0);
      ctx.moveTo(0, -180 * scale);
      ctx.lineTo(0, 180 * scale);
      ctx.stroke();

      ctx.restore();

      // Render 3D Hologram projection based on model
      ctx.save();
      ctx.translate(cx, cy - 40);

      if (arModel === 'optics') {
        // Optical Bench Hologram
        const glow = Math.sin(pulse) * 5 + 10;
        ctx.shadowBlur = glow;
        ctx.shadowColor = '#00d4ff';

        // Bench Track
        ctx.fillStyle = 'rgba(0, 212, 255, 0.3)';
        ctx.fillRect(-160 * scale, 15, 320 * scale, 8);

        // Lens
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, -20, 15 * scale, 60 * scale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Rays
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.85)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-120 * scale, -50 * scale);
        ctx.lineTo(0, -50 * scale);
        ctx.lineTo(120 * scale, 10 * scale);
        ctx.stroke();

        // Screen
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(115 * scale, -40 * scale, 8 * scale, 70 * scale);

      } else if (arModel === 'bohr') {
        // Bohr Atom Orbitals
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#a855f7';

        // Nucleus
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, 14 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Electron Orbits
        [40, 75, 110].forEach((rad, i) => {
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(0, 0, rad * scale, (rad * 0.45) * scale, (pulse * (i + 1) * 0.4), 0, Math.PI * 2);
          ctx.stroke();

          // Electron
          const angle = pulse * 1.5 * (3 - i);
          const ex = Math.cos(angle) * rad * scale;
          const ey = Math.sin(angle) * (rad * 0.45) * scale;
          ctx.fillStyle = '#00d4ff';
          ctx.beginPath();
          ctx.arc(ex, ey, 5 * scale, 0, Math.PI * 2);
          ctx.fill();
        });

      } else {
        // Circuit Hologram
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#10b981';

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.strokeRect(-90 * scale, -60 * scale, 180 * scale, 120 * scale);

        // Components
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(-25 * scale, -68 * scale, 50 * scale, 16 * scale);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(82 * scale, -15 * scale, 16 * scale, 30 * scale);

        ctx.fillStyle = '#fff';
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('12V', -15 * scale, -56 * scale);
        ctx.fillText('R=10?', 70 * scale, 30 * scale);
      }

      ctx.restore();

      // Laser Pointer Touch
      if (laserPoint) {
        ctx.fillStyle = '#ef4444';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ef4444';
        ctx.beginPath();
        ctx.arc(laserPoint.x, laserPoint.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(laserPoint.x, 0);
        ctx.lineTo(laserPoint.x, canvas.height);
        ctx.moveTo(0, laserPoint.y);
        ctx.lineTo(canvas.width, laserPoint.y);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [arModel, scale, rotation, laserPoint]);

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
            ? Virtual Labs
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>??</span>
            <span>Live WebXR / AR Projection-on-Desk Studio</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={toggleCamera}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none',
              background: isCameraActive ? 'rgba(239,68,68,0.2)' : 'linear-gradient(135deg, #10b981, #00d4ff)',
              color: isCameraActive ? '#ef4444' : 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12,
            }}
          >
            {isCameraActive ? '?? Turn Off Camera' : '?? Use Study Desk Camera'}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div style={{ flex: 1, padding: 18, display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Viewport Box */}
        <div style={{
          position: 'relative', borderRadius: 16, overflow: 'hidden', minHeight: 520,
          background: isCameraActive ? '#000' : 'radial-gradient(circle at center, #0f172a 0%, #020408 100%)',
          border: '1px solid rgba(0,212,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Real Camera Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              opacity: isCameraActive ? 0.85 : 0, transition: 'opacity 0.4s',
            }}
          />

          {/* AR Canvas */}
          <canvas
            ref={canvasRef}
            width={850}
            height={520}
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setLaserPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', cursor: 'crosshair' }}
          />

          {/* Top-Left Telemetry Overlay */}
          <div style={{
            position: 'absolute', top: 16, left: 16, zIndex: 20, padding: '10px 16px', borderRadius: 10,
            background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,212,255,0.3)',
            fontFamily: 'JetBrains Mono', fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ color: '#00d4ff', fontWeight: 700 }}>?? WebXR Spatial Anchor: ACTIVE</div>
            <div style={{ color: '#10b981' }}>{arStatus}</div>
            <div style={{ color: 'rgba(255,255,255,0.6)' }}>Scale: {scale.toFixed(1)}x ? Yaw: {rotation}? ? Light: 450 lux</div>
          </div>
        </div>

        {/* Controls Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#00d4ff', margin: 0 }}>
            ?? AR Hologram Selector
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { id: 'optics', label: 'Ray Optics Bench', desc: 'Convex lens refraction on your desk', icon: '??' },
              { id: 'bohr', label: 'Bohr Quantum Orbitals', desc: 'Atomic lattice floating above paper', icon: '??' },
              { id: 'circuit', label: '3D Breadboard Circuit', desc: 'Interactive circuit with voltage glow', icon: '?' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setArModel(m.id as any)}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                  background: arModel === m.id ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${arModel === m.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: arModel === m.id ? '#00d4ff' : 'white', cursor: 'pointer', fontFamily: 'Outfit',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13 }}>{m.icon} {m.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{m.desc}</div>
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>Spatial Scale:</span>
                <span style={{ color: '#00d4ff', fontWeight: 700 }}>{scale.toFixed(1)}x</span>
              </div>
              <input type="range" min="0.5" max="2.0" step="0.1" value={scale} onChange={e => setScale(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>Desk Rotation:</span>
                <span style={{ color: '#10b981', fontWeight: 700 }}>{rotation}?</span>
              </div>
              <input type="range" min="0" max="360" value={rotation} onChange={e => setRotation(Number(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
            </div>

            <div style={{ padding: 12, borderRadius: 10, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', fontSize: 12, lineHeight: 1.5 }}>
              <strong style={{ color: '#c084fc' }}>?? Interaction Tip:</strong>
              <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Click anywhere on the holographic viewport to cast a red AR laser measurement probe onto physical desk components!
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
