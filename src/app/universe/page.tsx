'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface NodeConcept {
  id: string;
  name: string;
  subject: string;
  color: string;
  mastery: number; // 1-5
  x: number;
  y: number;
  z: number;
  prereqs: string[];
}

const CONCEPTS_DATA: NodeConcept[] = [
  // Physics Galaxy
  { id: 'phy_1', name: 'Doppler Effect', subject: 'Physics', color: '#0066ff', mastery: 5, x: -180, y: 40, z: -50, prereqs: [] },
  { id: 'phy_2', name: 'Double Slit Interference', subject: 'Physics', color: '#0066ff', mastery: 4, x: -140, y: -80, z: 40, prereqs: ['phy_1'] },
  { id: 'phy_3', name: 'Ray Optics & Refraction', subject: 'Physics', color: '#0066ff', mastery: 3, x: -220, y: -20, z: 80, prereqs: ['phy_2'] },
  { id: 'phy_4', name: 'Thermodynamics & Heat', subject: 'Physics', color: '#0066ff', mastery: 2, x: -100, y: 110, z: -100, prereqs: [] },
  // Chemistry Galaxy
  { id: 'chem_1', name: 'Acid-Base Titration', subject: 'Chemistry', color: '#10b981', mastery: 5, x: 160, y: 80, z: -30, prereqs: [] },
  { id: 'chem_2', name: 'Atomic Orbitals (3D)', subject: 'Chemistry', color: '#10b981', mastery: 4, x: 210, y: -40, z: 90, prereqs: ['chem_1'] },
  { id: 'chem_3', name: 'Electrophilic Substitution', subject: 'Chemistry', color: '#10b981', mastery: 3, x: 140, y: -110, z: -60, prereqs: ['chem_2'] },
  // Math Galaxy
  { id: 'math_1', name: 'Quadratic Parabola', subject: 'Mathematics', color: '#7c3aed', mastery: 4, x: 40, y: -160, z: 60, prereqs: [] },
  { id: 'math_2', name: 'Calculus Derivatives', subject: 'Mathematics', color: '#7c3aed', mastery: 3, x: -40, y: -210, z: -80, prereqs: ['math_1'] },
  { id: 'math_3', name: 'Trigonometry Unit Circle', subject: 'Mathematics', color: '#7c3aed', mastery: 5, x: 90, y: -220, z: 30, prereqs: [] },
  // CS Galaxy
  { id: 'cs_1', name: 'CPU Gantt Scheduler', subject: 'Computer Science', color: '#00d4ff', mastery: 5, x: -80, y: 180, z: 70, prereqs: [] },
  { id: 'cs_2', name: 'TCP 3-Way Handshake', subject: 'Computer Science', color: '#00d4ff', mastery: 4, x: 50, y: 190, z: -40, prereqs: ['cs_1'] },
  { id: 'cs_3', name: 'Binary Search Trees', subject: 'Computer Science', color: '#00d4ff', mastery: 5, x: 120, y: 150, z: 100, prereqs: ['cs_1'] },
  // Biology Galaxy
  { id: 'bio_1', name: 'DNA Double Helix', subject: 'Biology', color: '#f59e0b', mastery: 4, x: 0, y: 50, z: 160, prereqs: [] },
  { id: 'bio_2', name: 'Cardiovascular Flow', subject: 'Biology', color: '#f59e0b', mastery: 3, x: 70, y: 20, z: -160, prereqs: ['bio_1'] },
];

export default function UniversePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [viewMode, setViewMode] = useState<'galaxy' | 'constellation' | 'grid'>('galaxy');
  const [selectedNode, setSelectedNode] = useState<NodeConcept | null>(null);
  const [activeSubject, setActiveSubject] = useState<string>('All');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [angle, setAngle] = useState({ x: 0.3, y: 0.5 });
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;

      ctx.clearRect(0, 0, width, height);

      // Deep space background
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#040914');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Background stars particles
      for (let i = 0; i < 200; i++) {
        const sx = (Math.sin(i * 99 + time * 0.1) * 0.5 + 0.5) * width;
        const sy = (Math.cos(i * 33 + time * 0.1) * 0.5 + 0.5) * height;
        const sa = Math.sin(time * 2 + i) * 0.4 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${sa * 0.4})`;
        ctx.fillRect(sx, sy, 1.5, 1.5);
      }

      const filteredNodes = CONCEPTS_DATA.filter(n => activeSubject === 'All' || n.subject === activeSubject);

      if (viewMode === 'grid') {
        // --- GRID MODE: Structured 2D Matrix by Subject ---
        const cols = 4;
        const cellWidth = 220;
        const cellHeight = 120;
        const startX = (width - cols * cellWidth) / 2;
        const startY = 120;

        filteredNodes.forEach((node, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const nx = startX + col * cellWidth + 20;
          const ny = startY + row * cellHeight + 20;

          // Grid Card
          ctx.fillStyle = 'rgba(255,255,255,0.03)';
          ctx.strokeStyle = node.color + '66';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(nx, ny, cellWidth - 20, cellHeight - 20, 12);
          ctx.fill();
          ctx.stroke();

          // Subject badge
          ctx.fillStyle = node.color;
          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.fillText(node.subject.toUpperCase(), nx + 12, ny + 24);

          // Node title
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px Space Grotesk, sans-serif';
          ctx.fillText(node.name, nx + 12, ny + 46);

          // Mastery bar
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(nx + 12, ny + 62, cellWidth - 44, 6);
          ctx.fillStyle = node.color;
          ctx.fillRect(nx + 12, ny + 62, ((cellWidth - 44) * node.mastery) / 5, 6);
        });

      } else if (viewMode === 'constellation') {
        // --- CONSTELLATION MODE: Connected Star Lines & Clusters ---
        const rotY = angle.y + time * 0.2;

        // Project 3D nodes
        const projected = filteredNodes.map(node => {
          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          const px = node.x * cosY - node.z * sinY;
          const pz = node.x * sinY + node.z * cosY;
          const py = node.y;

          const scale = (300 / (300 + pz)) * zoomLevel;
          const screenX = width / 2 + px * scale;
          const screenY = height / 2 + py * scale;
          return { node, screenX, screenY, scale, pz };
        });

        // Draw Constellation Connection Lines
        for (let i = 0; i < projected.length; i++) {
          for (let j = i + 1; j < projected.length; j++) {
            const p1 = projected[i];
            const p2 = projected[j];
            if (p1.node.subject === p2.node.subject || p1.node.prereqs.includes(p2.node.id) || p2.node.prereqs.includes(p1.node.id)) {
              ctx.beginPath();
              ctx.moveTo(p1.screenX, p1.screenY);
              ctx.lineTo(p2.screenX, p2.screenY);
              ctx.strokeStyle = p1.node.color + '44';
              ctx.lineWidth = 1.2;
              ctx.setLineDash([4, 4]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }

        // Draw Stars
        projected.forEach(({ node, screenX, screenY, scale }) => {
          const radius = Math.max(4, (6 + node.mastery * 2) * scale);
          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 15;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Star label
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.max(10, 12 * scale)}px Space Grotesk, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.name, screenX, screenY + radius + 14);
        });

      } else {
        // --- GALAXY MODE: 3D Spiral Vortex & Dynamic Orbiting Stars ---
        const rotY = angle.y + time * 0.3;
        const rotX = angle.x;

        // Spiral Core Nebula
        const coreGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, 180 * zoomLevel);
        coreGrad.addColorStop(0, 'rgba(0,212,255,0.25)');
        coreGrad.addColorStop(0.5, 'rgba(168,85,247,0.12)');
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 180 * zoomLevel, 0, Math.PI * 2);
        ctx.fill();

        // Project and Draw Orbiting Concept Stars
        filteredNodes.map((node, idx) => {
          const spiralAngle = idx * 0.8 + time * 0.5;
          const radiusDist = 120 + idx * 18;
          const rawX = Math.cos(spiralAngle) * radiusDist;
          const rawZ = Math.sin(spiralAngle) * radiusDist;
          const rawY = Math.sin(spiralAngle * 2) * 40;

          const cosY = Math.cos(rotY);
          const sinY = Math.sin(rotY);
          const cosX = Math.cos(rotX);
          const sinX = Math.sin(rotX);

          // 3D rotation
          const x1 = rawX * cosY - rawZ * sinY;
          const z1 = rawX * sinY + rawZ * cosY;
          const y1 = rawY * cosX - z1 * sinX;
          const z2 = rawY * sinX + z1 * cosX;

          const perspective = (400 / (400 + z2)) * zoomLevel;
          const screenX = width / 2 + x1 * perspective;
          const screenY = height / 2 + y1 * perspective;
          const starRadius = Math.max(3, (5 + node.mastery * 2) * perspective);

          // Orbital Ring Line
          ctx.beginPath();
          ctx.arc(width / 2, height / 2, radiusDist * perspective, 0, Math.PI * 2);
          ctx.strokeStyle = node.color + '15';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Star Body
          ctx.beginPath();
          ctx.arc(screenX, screenY, starRadius, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Star Label
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.font = 'bold 11px Outfit, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.name, screenX, screenY + starRadius + 12);

          return { node, screenX, screenY };
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [viewMode, activeSubject, zoomLevel, angle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;
    previousMouse.current = { x: e.clientX, y: e.clientY };
    setAngle(prev => ({ x: prev.x + deltaY * 0.005, y: prev.y + deltaX * 0.005 }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(168,85,247,0.2)', background: 'rgba(2,4,8,0.92)',
        backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>

        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 17, color: '#a855f7', margin: 0 }}>
          🌌 3D Spatial Knowledge Universe
        </h1>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.04)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { id: 'galaxy', label: '🌌 3D Galaxy Vortex' },
            { id: 'constellation', label: '✨ Constellation Lines' },
            { id: 'grid', label: '📊 Matrix Grid View' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id as typeof viewMode)}
              style={{
                padding: '7px 14px', borderRadius: 8, border: 'none',
                background: viewMode === m.id ? 'linear-gradient(135deg, #a855f7, #00d4ff)' : 'transparent',
                color: viewMode === m.id ? 'white' : 'rgba(255,255,255,0.5)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.2s',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ width: '100vw', height: '100vh', cursor: isDragging.current ? 'grabbing' : 'grab' }}
      >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
      </div>

      {/* Subject Filter Bar */}
      <div style={{
        position: 'fixed', top: 70, left: 24, zIndex: 50,
        display: 'flex', gap: 6, background: 'rgba(2,4,8,0.8)', padding: 6, borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(15px)',
      }}>
        {['All', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Biology'].map(subj => (
          <button
            key={subj}
            onClick={() => setActiveSubject(subj)}
            style={{
              padding: '6px 12px', borderRadius: 8, border: 'none',
              background: activeSubject === subj ? '#a855f7' : 'rgba(255,255,255,0.04)',
              color: activeSubject === subj ? 'white' : 'rgba(255,255,255,0.6)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
            }}
          >
            {subj}
          </button>
        ))}
      </div>

      {/* Universe Legend & Control Guide */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 50,
        padding: 16, borderRadius: 16, background: 'rgba(2,4,8,0.85)',
        border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(15px)', maxWidth: 260,
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#00d4ff', marginBottom: 8, fontFamily: 'Space Grotesk' }}>
          🎮 Universe Controls
        </h3>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
          <div>• <strong>Click & Drag</strong> to rotate space camera</div>
          <div>• <strong>Zoom Controls</strong>: Use buttons below</div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 11, cursor: 'pointer' }}>Zoom +</button>
            <button onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.2))} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 11, cursor: 'pointer' }}>Zoom -</button>
          </div>
        </div>
      </div>
    </div>
  );
}
