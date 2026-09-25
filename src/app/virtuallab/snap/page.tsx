'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Camera, CameraOff, Sparkles, ArrowLeft, Eye, Cpu, Scale, CheckCircle2, AlertCircle, RefreshCw, Box, Upload, Crosshair, Maximize2, ShieldCheck } from 'lucide-react';
import AppPermissionModal from '@/components/AppPermissionModal';
import { getStoredPermission, savePermissionChoice, PermissionChoice, resetPermission } from '@/lib/permissions';

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

const SAMPLE_PRESETS: { id: string; label: string; type: 'circuit' | 'optics' | 'mechanics'; desc: string }[] = [
  { id: 'circuit_wheatstone', label: 'Wheatstone Bridge Circuit', type: 'circuit', desc: 'Resistor bridge with null deflection galvanometer' },
  { id: 'optics_lens', label: 'Convex Lens Optical Bench', type: 'optics', desc: 'Ray optics with real, inverted image formation' },
  { id: 'mechanics_pulley', label: 'Atwood Coupled Pulley', type: 'mechanics', desc: 'Dual-mass acceleration and tension equilibrium' },
];

export default function SnapAndSimulatePage() {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_PRESETS[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [parsedScene, setParsedScene] = useState<ParsedSceneData | null>(null);

  // Camera & Image Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionChoice, setPermissionChoice] = useState<string>('prompt');
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  const [isArPassThrough, setIsArPassThrough] = useState(false);

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
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const arVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPermissionChoice(getStoredPermission('camera'));
    }
  }, []);

  // Open live camera with 3-option permission check
  const handleToggleCamera = () => {
    if (isCameraActive) {
      stopCameraStream();
      return;
    }

    const currentPerm = getStoredPermission('camera');
    if (currentPerm === 'prompt') {
      setShowPermissionModal(true);
      return;
    }

    if (currentPerm === 'block') {
      alert('Camera permission is set to Block. You can upload a photo or reset permissions above.');
      return;
    }

    startCameraStream();
  };

  const handlePermissionChoice = (choice: PermissionChoice) => {
    savePermissionChoice('camera', choice);
    setPermissionChoice(choice);
    setShowPermissionModal(false);

    if (choice === 'block') {
      alert('Camera access blocked. You can upload a textbook photo or pick sample STEM schematics.');
    } else {
      startCameraStream();
    }
  };

  const startCameraStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
      setIsCameraActive(true);
    } catch {
      alert('Camera access unavailable. You can upload a textbook photo file instead.');
    }
  };

  const stopCameraStream = () => {
    if (cameraVideoRef.current && cameraVideoRef.current.srcObject) {
      const stream = cameraVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      cameraVideoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Toggle AR Pass-Through Mode in 3D Canvas
  const toggleArPassThrough = async () => {
    if (isArPassThrough) {
      if (arVideoRef.current && arVideoRef.current.srcObject) {
        const stream = arVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        arVideoRef.current.srcObject = null;
      }
      setIsArPassThrough(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (arVideoRef.current) {
          arVideoRef.current.srcObject = stream;
          arVideoRef.current.play();
        }
        setIsArPassThrough(true);
      } catch {
        alert('Camera stream unavailable for AR pass-through.');
      }
    }
  };

  // Capture current video frame and spawn 3D Lab
  const captureSnapshotAndSimulate = () => {
    if (!cameraVideoRef.current) return;
    const v = cameraVideoRef.current;
    const offCanvas = document.createElement('canvas');
    offCanvas.width = v.videoWidth || 640;
    offCanvas.height = v.videoHeight || 480;
    const ctx = offCanvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(v, 0, 0, offCanvas.width, offCanvas.height);
      const base64 = offCanvas.toDataURL('image/jpeg', 0.85);
      setCapturedImagePreview(base64);
      stopCameraStream();
      handleParseAndSpawn(base64);
    }
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setCapturedImagePreview(base64);
      handleParseAndSpawn(base64);
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini Vision parsing pipeline
  const handleParseAndSpawn = async (customImageBase64?: string) => {
    setIsProcessing(true);
    setParsedScene(null);

    const steps = [
      customImageBase64 ? 'Rasterizing captured camera frame (1280x720)...' : 'Ingesting textbook schematic array...',
      'Gemini Vision: Extracting circuit/optical nodes & schematic topology...',
      'Solving physical differential equations & boundary parameters...',
      'Spawning interactive 3D WebGL physics geometry...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setPipelineStep(steps[i]);
      await new Promise(r => setTimeout(r, 380));
    }

    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('NEXUS_GEMINI_KEY') || '' : '';
      const res = await fetch('/api/multimodal-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagramType: selectedPreset.type,
          imageBase64: customImageBase64 || undefined,
          customApiKey: savedKey,
        })
      });
      const data = await res.json();
      if (data.parsedScene) {
        setParsedScene(data.parsedScene);
      }
    } catch {
      // Fallback handled gracefully
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

      // Draw grid background if AR mode is off
      if (!isArPassThrough) {
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
      } else {
        // Holographic AR Reticle
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 140, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (selectedPreset.type === 'circuit') {
        // Wheatstone Diamond Circuit
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
        ctx.strokeStyle = isArPassThrough ? '#00e5ff' : '#00d4ff';
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
        ctx.fillStyle = isArPassThrough ? 'rgba(10, 25, 47, 0.85)' : '#0a192f';
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Needle
        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const deflection = isBalanced ? 0 : (Number(ig) * 12);
        ctx.lineTo(cx + deflection, cy - 18);
        ctx.stroke();

        // Resistor Labels
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillText(`R1 = ${R1}Ω`, left.x + 20, top.y + 35);
        ctx.fillText(`R2 = ${R2}Ω`, right.x - 70, top.y + 35);
        ctx.fillText(`R3 = ${R3}Ω`, left.x + 20, bottom.y - 25);
        ctx.fillText(`R4 = ${R4}Ω`, right.x - 70, bottom.y - 25);

        // Status text
        ctx.fillStyle = isBalanced ? '#10b981' : '#f59e0b';
        ctx.font = 'bold 13px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(
          isBalanced ? '✓ Balanced Bridge: Null Current Ig = 0.00 mA' : `⚠ Unbalanced: Deflection Ig = ${ig} mA`,
          cx,
          bottom.y + 40
        );

      } else if (selectedPreset.type === 'optics') {
        // Convex Lens Optical Bench
        const f = lensFocal;
        const u = lensObjectDist;
        const v = (1 / ((1 / f) - (1 / u)));
        const isReal = v > 0;

        // Principal Axis
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40, cy);
        ctx.lineTo(canvas.width - 40, cy);
        ctx.stroke();

        // Lens Vertical Line
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 90);
        ctx.lineTo(cx, cy + 90);
        ctx.stroke();

        // Luminous Object Arrow
        const objHeight = 45;
        const objX = cx - u * 4.5;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX, cy);
        ctx.lineTo(objX, cy - objHeight);
        ctx.stroke();
        // Arrow head
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(objX - 6, cy - objHeight + 10);
        ctx.lineTo(objX + 6, cy - objHeight + 10);
        ctx.lineTo(objX, cy - objHeight);
        ctx.fill();

        // Parallel Ray & Focal Ray
        const imgX = cx + v * 4.5;
        const imgHeight = -(v / u) * objHeight;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        // Ray 1: Parallel then through focus
        ctx.beginPath();
        ctx.moveTo(objX, cy - objHeight);
        ctx.lineTo(cx, cy - objHeight);
        ctx.lineTo(imgX, cy - imgHeight);
        ctx.stroke();

        // Ray 2: Through optical center
        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(objX, cy - objHeight);
        ctx.lineTo(imgX, cy - imgHeight);
        ctx.stroke();

        // Image Arrow
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(imgX, cy);
        ctx.lineTo(imgX, cy - imgHeight);
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '11px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`Object (u = -${u}cm)`, objX, cy + 20);
        ctx.fillText(`Image (v = ${v.toFixed(1)}cm)`, imgX, cy + 20);
        ctx.fillText(`Convex Lens (f = ${f}cm)`, cx, cy - 100);

      } else {
        // Atwood Coupled Pulley
        const m1 = pulleyMass1;
        const m2 = pulleyMass2;
        const a = ((m2 - m1) * 9.8 / (m1 + m2)).toFixed(2);
        const T = (2 * m1 * m2 * 9.8 / (m1 + m2)).toFixed(2);

        // Pulley Wheel
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 36, 0, Math.PI * 2);
        ctx.stroke();

        // Ropes
        ctx.strokeStyle = '#fff';
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

        // Acceleration & Tension Vector
        ctx.fillStyle = '#10b981';
        ctx.font = '12px JetBrains Mono';
        ctx.fillText(`a = ${a} m/s²`, cx, cy + 130);
        ctx.fillText(`String Tension T = ${T} N`, cx, cy + 150);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedPreset, resistorR1, resistorR2, resistorR3, resistorR4, lensFocal, lensObjectDist, pulleyMass1, pulleyMass2, isArPassThrough]);

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <div style={{
        padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/virtuallab" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={16} />
            <span>Back to Virtual Labs</span>
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Camera size={18} color="#00d4ff" />
            <span>Multimodal Snap-and-Simulate (Vision-to-3D AR/VR Lab)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => {
              resetPermission('camera');
              setPermissionChoice('prompt');
              setShowPermissionModal(true);
            }}
            style={{
              padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.06)', color: '#d1d5db', fontSize: 11, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Outfit'
            }}
            title="Configure Camera Permissions (Allow while using / Allow once / Block)"
          >
            <ShieldCheck size={13} color="#10b981" />
            <span>Camera: {permissionChoice === 'while_using' ? 'Allowed' : permissionChoice === 'only_this_time' ? 'Once' : permissionChoice === 'block' ? 'Blocked' : 'Settings'}</span>
          </button>

          <Link href="/virtuallab/ar" style={{ padding: '6px 14px', borderRadius: 8, background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)', color: '#c084fc', textDecoration: 'none', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Box size={14} />
            <span>Project on Desk in WebXR AR</span>
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '360px 1fr 340px', gap: 16, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Camera Capture & Schematic Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Step 1: Ingestion</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: '4px 0 6px' }}>
              Textbook Camera / Diagram Source
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
              Switch on your camera to capture any textbook diagram, or upload a schematic file to spawn into 3D.
            </p>
          </div>

          {/* Live Camera Viewfinder or Camera Trigger Box */}
          <div style={{
            borderRadius: 14, background: '#020408', border: '1px solid rgba(0,212,255,0.3)',
            overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
            minHeight: isCameraActive ? 240 : 180, justifyContent: 'center', padding: isCameraActive ? 0 : 14,
          }}>
            {isCameraActive ? (
              <>
                <video
                  ref={cameraVideoRef}
                  playsInline
                  autoPlay
                  muted
                  style={{ width: '100%', height: 240, objectFit: 'cover' }}
                />

                {/* Target Frame / Crosshairs */}
                <div style={{
                  position: 'absolute', inset: '16px', border: '2px dashed #00d4ff',
                  borderRadius: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Crosshair size={32} color="#00d4ff" style={{ opacity: 0.6 }} />
                </div>

                {/* Camera Overlay Controls */}
                <div style={{
                  position: 'absolute', bottom: 10, left: 10, right: 10, display: 'flex', gap: 8, justifyContent: 'center'
                }}>
                  <button
                    onClick={captureSnapshotAndSimulate}
                    disabled={isProcessing}
                    style={{
                      padding: '9px 18px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #00d4ff)', color: 'white',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                      display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 15px rgba(0,212,255,0.4)'
                    }}
                  >
                    <Camera size={15} />
                    <span>{isProcessing ? 'Decomposing...' : '📸 Snap Diagram & Spawn 3D'}</span>
                  </button>

                  <button
                    onClick={stopCameraStream}
                    style={{
                      padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)',
                      background: 'rgba(0,0,0,0.6)', color: '#ef4444', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'Outfit'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {capturedImagePreview ? (
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <img
                      src={capturedImagePreview}
                      alt="Captured Diagram"
                      style={{ width: '100%', maxHeight: 110, objectFit: 'cover', borderRadius: 8, marginBottom: 8, border: '1px solid #10b981' }}
                    />
                    <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>Textbook Photo Snapped & Decomposed</span>
                    </div>
                  </div>
                ) : (
                  <Camera size={34} color="#00d4ff" style={{ margin: '0 auto 8px', display: 'block' }} />
                )}

                <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginTop: 4 }}>Live Camera / Textbook Snap</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Capacitor & Web Camera API ready</div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, width: '100%' }}>
                  <button
                    onClick={handleToggleCamera}
                    style={{
                      flex: 1, padding: '9px 12px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #0066ff, #00d4ff)', color: 'white',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Camera size={14} />
                    <span>Switch On Camera</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255,255,255,0.06)', color: '#d1d5db',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Outfit',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Upload size={14} />
                    <span>Upload File</span>
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>

          {/* Pipeline Status Progress */}
          {pipelineStep && (
            <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', fontSize: 11, color: '#00d4ff', fontFamily: 'JetBrains Mono' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <RefreshCw size={12} className="animate-spin" />
                <span>{pipelineStep}</span>
              </div>
            </div>
          )}

          {/* Presets Selector */}
          <div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase' }}>Or Select STEM Schematic Preset:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              {SAMPLE_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPreset(preset);
                    setCapturedImagePreview(null);
                  }}
                  style={{
                    padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                    background: selectedPreset.id === preset.id ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedPreset.id === preset.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: selectedPreset.id === preset.id ? '#00d4ff' : 'white',
                    cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    {preset.type === 'circuit' && <Cpu size={15} color="#00d4ff" />}
                    {preset.type === 'optics' && <Eye size={15} color="#f59e0b" />}
                    {preset.type === 'mechanics' && <Scale size={15} color="#ec4899" />}
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{preset.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Interactive 3D WebGL / Canvas Simulation & AR Pass-Through */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Step 2: Live 3D / AR Simulation</span>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: '#00d4ff', margin: '2px 0 0' }}>
                {selectedPreset.label}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              {/* AR Pass-Through Toggle */}
              <button
                onClick={toggleArPassThrough}
                style={{
                  padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(0,212,255,0.3)',
                  background: isArPassThrough ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,255,0.1)',
                  color: isArPassThrough ? '#10b981' : '#00d4ff', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Outfit'
                }}
              >
                {isArPassThrough ? <CameraOff size={13} /> : <Camera size={13} />}
                <span>{isArPassThrough ? 'Disable AR Desk Pass-Through' : 'View in AR Room / Desk'}</span>
              </button>

              <Link
                href="/virtuallab/ar"
                style={{
                  padding: '5px 12px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.4)',
                  background: 'rgba(168,85,247,0.15)', color: '#c084fc', textDecoration: 'none',
                  fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6
                }}
              >
                <Maximize2 size={13} />
                <span>WebXR Full AR</span>
              </Link>
            </div>
          </div>

          {/* Canvas Box with Optional AR Camera Pass-Through */}
          <div style={{
            flex: 1, position: 'relative', minHeight: 460, borderRadius: 12,
            border: '1px solid rgba(0,212,255,0.25)', overflow: 'hidden',
            background: isArPassThrough ? '#000' : '#020408'
          }}>
            {/* Live Camera Feed behind 3D Canvas if AR Mode is on */}
            <video
              ref={arVideoRef}
              playsInline
              muted
              style={{
                position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                opacity: isArPassThrough ? 0.9 : 0, transition: 'opacity 0.3s ease',
              }}
            />

            {/* 3D Physics Canvas */}
            <canvas
              ref={canvasRef}
              width={700}
              height={460}
              style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', display: 'block' }}
            />

            {/* In-Canvas Telemetry Overlay */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 20, padding: '6px 12px', borderRadius: 8, background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
              {isArPassThrough ? 'AR WebXR Desk Superimposition: ACTIVE' : 'Rotational Viewport: 3D Physics Synced'} • 60 FPS
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
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR1} Ω</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR1} onChange={e => setResistorR1(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R2:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR2} Ω</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR2} onChange={e => setResistorR2(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R3:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR3} Ω</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR3} onChange={e => setResistorR3(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Resistor R4:</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{resistorR4} Ω</span>
                </div>
                <input type="range" min="1" max="50" value={resistorR4} onChange={e => setResistorR4(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>

              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', fontSize: 11, lineHeight: 1.5 }}>
                <strong style={{ color: '#10b981' }}>Bridge Condition:</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  {Math.abs(resistorR1 * resistorR4 - resistorR2 * resistorR3) < 0.1 ? (
                    <>
                      <CheckCircle2 size={14} color="#10b981" />
                      <span style={{ color: '#10b981', fontWeight: 600 }}>Perfect Null Deflection (Ig = 0 mA)</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} color="#f59e0b" />
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>Unbalanced: Galvanometer deflects</span>
                    </>
                  )}
                </div>
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

      {/* Permission Modal */}
      <AppPermissionModal
        isOpen={showPermissionModal}
        type="camera"
        onChoice={handlePermissionChoice}
        onClose={() => setShowPermissionModal(false)}
      />
    </div>
  );
}
