'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Camera, CameraOff, Sparkles, ArrowLeft, Eye, Cpu, Scale, CheckCircle2,
  AlertCircle, RefreshCw, Box, Upload, Crosshair, Maximize2, ShieldCheck,
  Play, Pause, RotateCcw, Activity
} from 'lucide-react';
import AppPermissionModal from '@/components/AppPermissionModal';
import { getStoredPermission, savePermissionChoice, PermissionChoice, resetPermission } from '@/lib/permissions';

type LabType = 'kinematics_projectile' | 'circuit' | 'optics' | 'mechanics' | 'pendulum';

interface ParsedComponent {
  id: string;
  type: string;
  value?: number;
  unit?: string;
  x?: number;
  y?: number;
  z?: number;
  status?: string;
}

interface ParsedSceneData {
  type: LabType;
  title: string;
  equation: string;
  components: ParsedComponent[];
  calculatedValues: Record<string, string>;
  parameters?: Record<string, number>;
}

interface PresetItem {
  id: string;
  label: string;
  type: LabType;
  desc: string;
  icon: string;
}

const SAMPLE_PRESETS: PresetItem[] = [
  {
    id: 'kinematics_projectile',
    label: '1D Kinematics & Vertical Motion',
    type: 'kinematics_projectile',
    desc: 'Ball thrown straight up: At peak flight, ball is at rest (v = 0)',
    icon: '🚀'
  },
  {
    id: 'circuit_wheatstone',
    label: 'Wheatstone Bridge Circuit',
    type: 'circuit',
    desc: 'Resistor bridge with null deflection galvanometer',
    icon: '⚡'
  },
  {
    id: 'optics_lens',
    label: 'Convex Lens Optical Bench',
    type: 'optics',
    desc: 'Ray optics with real, inverted image formation',
    icon: '🔍'
  },
  {
    id: 'mechanics_pulley',
    label: 'Atwood Coupled Pulley',
    type: 'mechanics',
    desc: 'Dual-mass acceleration and tension equilibrium',
    icon: '⚖️'
  },
  {
    id: 'pendulum_shm',
    label: 'Harmonic Simple Pendulum',
    type: 'pendulum',
    desc: 'Periodic oscillation T = 2π√(L/g) with energy conservation',
    icon: '⏱️'
  },
];

export default function SnapAndSimulatePage() {
  const [selectedPreset, setSelectedPreset] = useState<PresetItem>(SAMPLE_PRESETS[0]);
  const [activeLabType, setActiveLabType] = useState<LabType>('kinematics_projectile');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<string | null>(null);
  const [parsedScene, setParsedScene] = useState<ParsedSceneData | null>(null);

  // Camera & Image Capture State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionChoice, setPermissionChoice] = useState<string>('prompt');
  const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);
  const [isArPassThrough, setIsArPassThrough] = useState(false);

  // --- KINEMATICS & VERTICAL MOTION CONTROLS ---
  const [kinematicsV0, setKinematicsV0] = useState(24); // m/s
  const [kinematicsG, setKinematicsG] = useState(9.8); // m/s^2
  const [kinematicsMass, setKinematicsMass] = useState(1.0); // kg
  const [isKinematicsPlaying, setIsKinematicsPlaying] = useState(true);
  const [kinematicsSpeed, setKinematicsSpeed] = useState(1.0); // 1.0 or 0.5 slow-mo
  const kinematicsTimeRef = useRef(0);
  const [telemetryTime, setTelemetryTime] = useState(0);

  // --- CIRCUIT CONTROLS ---
  const [resistorR1, setResistorR1] = useState(10);
  const [resistorR2, setResistorR2] = useState(20);
  const [resistorR3, setResistorR3] = useState(15);
  const [resistorR4, setResistorR4] = useState(30);

  // --- OPTICS CONTROLS ---
  const [lensFocal, setLensFocal] = useState(15);
  const [lensObjectDist, setLensObjectDist] = useState(30);

  // --- MECHANICS CONTROLS ---
  const [pulleyMass1, setPulleyMass1] = useState(2.0);
  const [pulleyMass2, setPulleyMass2] = useState(4.0);

  // --- PENDULUM CONTROLS ---
  const [pendulumLength, setPendulumLength] = useState(2.0);
  const [pendulumGravity, setPendulumGravity] = useState(9.8);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const arVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      customImageBase64 ? 'Rasterizing captured textbook diagram (1280x720)...' : 'Ingesting textbook schematic array...',
      'Gemini Vision: Extracting physical motion vectors, kinematics graphs & components...',
      'Solving differential equations & initial boundary parameters...',
      'Spawning interactive 3D WebGL physics laboratory...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setPipelineStep(steps[i]);
      await new Promise(r => setTimeout(r, 260));
    }

    try {
      const savedKey = typeof window !== 'undefined' ? localStorage.getItem('NEXUS_GEMINI_KEY') || '' : '';
      const res = await fetch('/api/multimodal-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diagramType: customImageBase64 ? undefined : selectedPreset.type,
          imageBase64: customImageBase64 || undefined,
          customApiKey: savedKey,
        })
      });
      const data = await res.json();
      if (data.parsedScene) {
        setParsedScene(data.parsedScene);
        const resolvedType: LabType = data.parsedScene.type || 'kinematics_projectile';
        setActiveLabType(resolvedType);

        // Find or build matching preset
        const matchingPreset = SAMPLE_PRESETS.find(p => p.type === resolvedType);
        if (matchingPreset) {
          setSelectedPreset(matchingPreset);
        } else {
          setSelectedPreset({
            id: `custom_${resolvedType}`,
            label: data.parsedScene.title || 'Decomposed 3D Experiment',
            type: resolvedType,
            desc: data.parsedScene.equation || 'Decomposed from textbook photograph',
            icon: resolvedType === 'kinematics_projectile' ? '🚀' : '⚡'
          });
        }

        // Apply parameters if extracted
        if (data.parsedScene.parameters?.initialVelocity) {
          setKinematicsV0(data.parsedScene.parameters.initialVelocity);
        }
        if (data.parsedScene.parameters?.gravity) {
          setKinematicsG(data.parsedScene.parameters.gravity);
        }
        kinematicsTimeRef.current = 0;
      }
    } catch {
      // Fallback to kinematics preset
      setActiveLabType('kinematics_projectile');
      setSelectedPreset(SAMPLE_PRESETS[0]);
    } finally {
      setIsProcessing(false);
      setPipelineStep(null);
    }
  };

  // Switch preset manually
  const handleSelectPreset = (preset: PresetItem) => {
    setSelectedPreset(preset);
    setActiveLabType(preset.type);
    setCapturedImagePreview(null);
    kinematicsTimeRef.current = 0;
  };

  // Auto trigger first parse on load
  useEffect(() => {
    handleParseAndSpawn();
  }, []);

  // 3D Canvas rendering loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      // Draw cybernetic grid background if AR mode is off
      if (!isArPassThrough) {
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 28) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 28) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
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

      // ==========================================
      // SIMULATION 1: 1D KINEMATICS & VERTICAL MOTION
      // ==========================================
      if (activeLabType === 'kinematics_projectile') {
        const v0 = kinematicsV0;
        const g = kinematicsG;
        const tFlight = (2 * v0) / g;
        const tPeak = v0 / g;
        const hMax = (v0 * v0) / (2 * g);

        // Progress simulation clock
        if (isKinematicsPlaying) {
          kinematicsTimeRef.current += 0.016 * kinematicsSpeed;
          if (kinematicsTimeRef.current > tFlight + 0.8) {
            kinematicsTimeRef.current = 0;
          }
        }
        const t = Math.min(kinematicsTimeRef.current, tFlight);
        setTelemetryTime(t);

        const currentY = Math.max(0, v0 * t - 0.5 * g * t * t);
        const currentV = v0 - g * t;
        const isNearPeak = Math.abs(t - tPeak) < 0.22;

        const groundBaselineY = height - 70;
        const maxHeightScale = Math.max(hMax * 1.15, 30);
        const pixelHeightAvailable = groundBaselineY - 90;
        const ballScreenY = groundBaselineY - (currentY / maxHeightScale) * pixelHeightAvailable;
        const ballScreenX = cx - 40;

        // 1. Draw 3D Ground Perspective Stage
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
        ctx.lineWidth = 1.5;
        // Stage ellipse
        ctx.beginPath();
        ctx.ellipse(ballScreenX, groundBaselineY, 110, 26, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
        ctx.fill();

        // Stage concentric rings
        ctx.beginPath();
        ctx.ellipse(ballScreenX, groundBaselineY, 60, 14, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 2. Vertical Altitude Mast / Metric Ruler (left side)
        const rulerX = 55;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rulerX, groundBaselineY);
        ctx.lineTo(rulerX, 50);
        ctx.stroke();

        // Ruler ticks every 5m
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'right';
        for (let m = 0; m <= maxHeightScale; m += 10) {
          const tickY = groundBaselineY - (m / maxHeightScale) * pixelHeightAvailable;
          ctx.beginPath();
          ctx.moveTo(rulerX - 5, tickY);
          ctx.lineTo(rulerX + 5, tickY);
          ctx.stroke();
          ctx.fillText(`${m}m`, rulerX - 8, tickY + 3);
        }

        // Horizontal laser line from ruler to ball altitude
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rulerX, ballScreenY);
        ctx.lineTo(ballScreenX, ballScreenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // 3. Peak Apex Dashed Line
        const apexScreenY = groundBaselineY - (hMax / maxHeightScale) * pixelHeightAvailable;
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(rulerX, apexScreenY);
        ctx.lineTo(width - 240, apexScreenY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Apex Tag
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 11px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText(`Apex Peak: H_max = ${hMax.toFixed(1)}m | v = 0 m/s`, rulerX + 10, apexScreenY - 6);

        // 4. Trajectory Guide Line (Vertical axis)
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ballScreenX, groundBaselineY);
        ctx.lineTo(ballScreenX, apexScreenY);
        ctx.stroke();

        // 5. Render 3D Projectile Sphere (The Ball)
        const ballRadius = 15;
        // Shadow on ground
        const shadowScale = Math.max(0.2, 1 - currentY / hMax);
        ctx.beginPath();
        ctx.ellipse(ballScreenX, groundBaselineY, 24 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * shadowScale})`;
        ctx.fill();

        // Shaded 3D Sphere
        const ballGrad = ctx.createRadialGradient(
          ballScreenX - 4, ballScreenY - 5, 2,
          ballScreenX, ballScreenY, ballRadius
        );
        if (isNearPeak) {
          ballGrad.addColorStop(0, '#fef08a');
          ballGrad.addColorStop(0.4, '#eab308');
          ballGrad.addColorStop(1, '#854d0e');
        } else if (currentV > 0) {
          ballGrad.addColorStop(0, '#67e8f9');
          ballGrad.addColorStop(0.5, '#06b6d4');
          ballGrad.addColorStop(1, '#0e7490');
        } else {
          ballGrad.addColorStop(0, '#f87171');
          ballGrad.addColorStop(0.5, '#ef4444');
          ballGrad.addColorStop(1, '#991b1b');
        }

        ctx.beginPath();
        ctx.arc(ballScreenX, ballScreenY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.shadowColor = isNearPeak ? '#eab308' : (currentV > 0 ? '#00d4ff' : '#ef4444');
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // 6. Dynamic Velocity Vector Arrow (v)
        const vPixelLen = (currentV / v0) * 55;
        if (Math.abs(currentV) > 0.8) {
          const vColor = currentV > 0 ? '#10b981' : '#f43f5e';
          ctx.strokeStyle = vColor;
          ctx.fillStyle = vColor;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ballScreenX, ballScreenY);
          ctx.lineTo(ballScreenX, ballScreenY - vPixelLen);
          ctx.stroke();

          // Arrow head
          const arrowDir = currentV > 0 ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(ballScreenX - 5, ballScreenY - vPixelLen + (arrowDir * 8));
          ctx.lineTo(ballScreenX + 5, ballScreenY - vPixelLen + (arrowDir * 8));
          ctx.lineTo(ballScreenX, ballScreenY - vPixelLen);
          ctx.fill();

          ctx.font = 'bold 11px JetBrains Mono';
          ctx.textAlign = 'left';
          ctx.fillText(`v = ${currentV.toFixed(1)} m/s`, ballScreenX + 18, ballScreenY - vPixelLen / 2);
        }

        // 7. Dynamic Constant Gravitational Acceleration Arrow (a = -g)
        const aArrowX = ballScreenX + 42;
        ctx.strokeStyle = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(aArrowX, ballScreenY - 15);
        ctx.lineTo(aArrowX, ballScreenY + 30);
        ctx.stroke();
        // Arrow head pointing down
        ctx.beginPath();
        ctx.moveTo(aArrowX - 4, ballScreenY + 22);
        ctx.lineTo(aArrowX + 4, ballScreenY + 22);
        ctx.lineTo(aArrowX, ballScreenY + 30);
        ctx.fill();

        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`a = -${g.toFixed(1)} m/s²`, aArrowX + 8, ballScreenY + 12);

        // 8. Holographic Banner: "AT PEAK OF FLIGHT: v = 0 m/s (Instantaneously at Rest)"
        if (isNearPeak) {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.95)';
          ctx.fillRect(ballScreenX - 160, ballScreenY - 50, 320, 26);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1;
          ctx.strokeRect(ballScreenX - 160, ballScreenY - 50, 320, 26);

          ctx.fillStyle = '#020408';
          ctx.font = 'bold 11px Outfit';
          ctx.textAlign = 'center';
          ctx.fillText('★ AT PEAK OF FLIGHT: v = 0 m/s (Instantaneously at Rest)', ballScreenX, ballScreenY - 33);
        }

        // 9. Live Inset Graphs (Position-Time & Acceleration-Time from Textbook)
        const graphW = 190;
        const graphH = 75;
        const graphX = width - graphW - 20;

        // --- Inset 1: Position vs Time Graph y(t) ---
        const g1Y = 25;
        ctx.fillStyle = 'rgba(2, 4, 8, 0.88)';
        ctx.fillRect(graphX, g1Y, graphW, graphH);
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(graphX, g1Y, graphW, graphH);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 10px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText('Position Curve y(t) vs Time', graphX + 8, g1Y + 14);

        // Plot parabolic curve
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let px = 0; px <= graphW - 20; px += 2) {
          const simT = (px / (graphW - 20)) * tFlight;
          const simY = Math.max(0, v0 * simT - 0.5 * g * simT * simT);
          const py = (g1Y + graphH - 10) - (simY / hMax) * (graphH - 28);
          if (px === 0) ctx.moveTo(graphX + 10 + px, py);
          else ctx.lineTo(graphX + 10 + px, py);
        }
        ctx.stroke();

        // Plot current cursor on y(t)
        const curPx = (t / tFlight) * (graphW - 20);
        const curPy = (g1Y + graphH - 10) - (currentY / hMax) * (graphH - 28);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(graphX + 10 + curPx, curPy, 4, 0, Math.PI * 2);
        ctx.fill();

        // --- Inset 2: Acceleration vs Time Graph a(t) ---
        const g2Y = g1Y + graphH + 12;
        ctx.fillStyle = 'rgba(2, 4, 8, 0.88)';
        ctx.fillRect(graphX, g2Y, graphW, graphH);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(graphX, g2Y, graphW, graphH);

        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText('Acceleration a(t) = -g (Constant)', graphX + 8, g2Y + 14);

        // Constant horizontal line
        const aLineY = g2Y + graphH - 20;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(graphX + 10, aLineY);
        ctx.lineTo(graphX + graphW - 10, aLineY);
        ctx.stroke();

        // Current tracking dot on a(t)
        ctx.fillStyle = '#00d4ff';
        ctx.beginPath();
        ctx.arc(graphX + 10 + curPx, aLineY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = '9px JetBrains Mono';
        ctx.fillText(`-9.8 m/s²`, graphX + graphW - 55, aLineY - 6);

      // ==========================================
      // SIMULATION 2: WHEATSTONE BRIDGE CIRCUIT
      // ==========================================
      } else if (activeLabType === 'circuit') {
        const R1 = resistorR1;
        const R2 = resistorR2;
        const R3 = resistorR3;
        const R4 = resistorR4;
        const isBalanced = Math.abs(R1 * R4 - R2 * R3) < 0.1;
        const ig = ((R1 * R4 - R2 * R3) / 100).toFixed(2);

        const top = { x: cx, y: cy - 90 };
        const bottom = { x: cx, y: cy + 90 };
        const left = { x: cx - 130, y: cy };
        const right = { x: cx + 130, y: cy };

        ctx.strokeStyle = isArPassThrough ? '#00e5ff' : '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(top.x, top.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.stroke();

        ctx.fillStyle = isArPassThrough ? 'rgba(10, 25, 47, 0.85)' : '#0a192f';
        ctx.beginPath();
        ctx.arc(cx, cy, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.strokeStyle = isBalanced ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        const deflection = isBalanced ? 0 : (Number(ig) * 12);
        ctx.lineTo(cx + deflection, cy - 18);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillText(`R1 = ${R1}Ω`, left.x + 20, top.y + 35);
        ctx.fillText(`R2 = ${R2}Ω`, right.x - 70, top.y + 35);
        ctx.fillText(`R3 = ${R3}Ω`, left.x + 20, bottom.y - 25);
        ctx.fillText(`R4 = ${R4}Ω`, right.x - 70, bottom.y - 25);

        ctx.fillStyle = isBalanced ? '#10b981' : '#f59e0b';
        ctx.font = 'bold 13px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(
          isBalanced ? '✓ Balanced Bridge: Null Current Ig = 0.00 mA' : `⚠ Unbalanced: Deflection Ig = ${ig} mA`,
          cx,
          bottom.y + 40
        );

      // ==========================================
      // SIMULATION 3: CONVEX LENS OPTICAL BENCH
      // ==========================================
      } else if (activeLabType === 'optics') {
        const f = lensFocal;
        const u = lensObjectDist;
        const v = (1 / ((1 / f) - (1 / u)));

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(40, cy);
        ctx.lineTo(width - 40, cy);
        ctx.stroke();

        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 90);
        ctx.lineTo(cx, cy + 90);
        ctx.stroke();

        const objHeight = 45;
        const objX = cx - u * 4.5;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(objX, cy);
        ctx.lineTo(objX, cy - objHeight);
        ctx.stroke();

        const imgX = cx + v * 4.5;
        const imgHeight = -(v / u) * objHeight;

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(objX, cy - objHeight);
        ctx.lineTo(cx, cy - objHeight);
        ctx.lineTo(imgX, cy - imgHeight);
        ctx.stroke();

        ctx.strokeStyle = '#ec4899';
        ctx.beginPath();
        ctx.moveTo(objX, cy - objHeight);
        ctx.lineTo(imgX, cy - imgHeight);
        ctx.stroke();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(imgX, cy);
        ctx.lineTo(imgX, cy - imgHeight);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '11px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`Object (u = -${u}cm)`, objX, cy + 20);
        ctx.fillText(`Image (v = ${v.toFixed(1)}cm)`, imgX, cy + 20);
        ctx.fillText(`Convex Lens (f = ${f}cm)`, cx, cy - 100);

      // ==========================================
      // SIMULATION 4: ATWOOD COUPLED PULLEY
      // ==========================================
      } else if (activeLabType === 'mechanics') {
        const m1 = pulleyMass1;
        const m2 = pulleyMass2;
        const a = ((m2 - m1) * 9.8 / (m1 + m2)).toFixed(2);
        const T = (2 * m1 * m2 * 9.8 / (m1 + m2)).toFixed(2);

        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy - 80, 36, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 36, cy - 80);
        ctx.lineTo(cx - 36, cy + 20);
        ctx.moveTo(cx + 36, cy - 80);
        ctx.lineTo(cx + 36, cy + 60);
        ctx.stroke();

        ctx.fillStyle = '#0066ff';
        ctx.fillRect(cx - 56, cy + 20, 40, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Outfit';
        ctx.textAlign = 'center';
        ctx.fillText(`m1=${m1}kg`, cx - 36, cy + 44);

        ctx.fillStyle = '#ec4899';
        ctx.fillRect(cx + 16, cy + 60, 40, 40);
        ctx.fillStyle = '#fff';
        ctx.fillText(`m2=${m2}kg`, cx + 36, cy + 84);

        ctx.fillStyle = '#10b981';
        ctx.font = '12px JetBrains Mono';
        ctx.fillText(`a = ${a} m/s²`, cx, cy + 130);
        ctx.fillText(`String Tension T = ${T} N`, cx, cy + 150);

      // ==========================================
      // SIMULATION 5: HARMONIC SIMPLE PENDULUM
      // ==========================================
      } else if (activeLabType === 'pendulum') {
        const L = pendulumLength;
        const g = pendulumGravity;
        const omega = Math.sqrt(g / L);
        const timeVal = Date.now() / 1000;
        const angle = 0.5 * Math.sin(omega * timeVal);
        const originX = cx;
        const originY = 60;
        const pixelLen = L * 75;

        const bobX = originX + pixelLen * Math.sin(angle);
        const bobY = originY + pixelLen * Math.cos(angle);

        // Ceiling
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(originX - 50, originY);
        ctx.lineTo(originX + 50, originY);
        ctx.stroke();

        // String
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();

        // Bob
        const bobGrad = ctx.createRadialGradient(bobX - 4, bobY - 4, 2, bobX, bobY, 18);
        bobGrad.addColorStop(0, '#60a5fa');
        bobGrad.addColorStop(1, '#0066ff');
        ctx.fillStyle = bobGrad;
        ctx.beginPath();
        ctx.arc(bobX, bobY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Period
        const T = (2 * Math.PI * Math.sqrt(L / g)).toFixed(2);
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`T = 2π√(L/g) = ${T} s  |  θ = ${(angle * 180 / Math.PI).toFixed(1)}°`, cx, height - 30);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [
    activeLabType, kinematicsV0, kinematicsG, kinematicsMass, isKinematicsPlaying, kinematicsSpeed,
    resistorR1, resistorR2, resistorR3, resistorR4,
    lensFocal, lensObjectDist,
    pulleyMass1, pulleyMass2,
    pendulumLength, pendulumGravity,
    isArPassThrough
  ]);

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
              Switch on camera to capture any textbook diagram, or upload a schematic file to spawn into 3D.
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
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                    background: activeLabType === preset.type ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${activeLabType === preset.type ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                    color: activeLabType === preset.type ? '#00d4ff' : 'white',
                    cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14 }}>{preset.icon}</span>
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
                {parsedScene?.title || selectedPreset.label}
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

          {/* Quick Domain Switcher Pills Bar */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {SAMPLE_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                style={{
                  padding: '5px 10px', borderRadius: 6, whiteSpace: 'nowrap',
                  background: activeLabType === preset.type ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeLabType === preset.type ? '#00d4ff' : 'rgba(255,255,255,0.08)'}`,
                  color: activeLabType === preset.type ? '#00d4ff' : 'rgba(255,255,255,0.7)',
                  fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'Outfit'
                }}
              >
                <span>{preset.icon}</span>
                <span>{preset.label.split(' ')[0]}</span>
              </button>
            ))}
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
            <div style={{ position: 'absolute', bottom: 12, left: 12, zIndex: 20, padding: '6px 12px', borderRadius: 8, background: 'rgba(2,4,8,0.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#10b981' }}>
                <Activity size={13} />
                <span>60 FPS Synced</span>
              </div>
              <span>•</span>
              <span>{isArPassThrough ? 'AR WebXR Desk Superimposition' : '3D Dynamic Physics Engine'}</span>
              {activeLabType === 'kinematics_projectile' && (
                <>
                  <span>•</span>
                  <span style={{ color: '#00d4ff' }}>t = {telemetryTime.toFixed(2)}s</span>
                </>
              )}
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
              Adjust physical parameters to see real-time updates in the 3D scene:
            </p>
          </div>

          {/* ======================================= */}
          {/* CONTROLS FOR KINEMATICS & VERTICAL MOTION */}
          {/* ======================================= */}
          {activeLabType === 'kinematics_projectile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Animation Play/Pause & Reset Row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setIsKinematicsPlaying(!isKinematicsPlaying)}
                  style={{
                    flex: 1, padding: '7px 12px', borderRadius: 8, border: 'none',
                    background: isKinematicsPlaying ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                    color: isKinematicsPlaying ? '#f87171' : '#34d399',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  {isKinematicsPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span>{isKinematicsPlaying ? 'Pause Flight' : 'Play Motion'}</span>
                </button>

                <button
                  onClick={() => setKinematicsSpeed(kinematicsSpeed === 1.0 ? 0.4 : 1.0)}
                  style={{
                    padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                    background: kinematicsSpeed < 1.0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
                    color: kinematicsSpeed < 1.0 ? '#fbbf24' : '#d1d5db',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit'
                  }}
                >
                  {kinematicsSpeed < 1.0 ? '0.4x Slow' : '1.0x Normal'}
                </button>

                <button
                  onClick={() => { kinematicsTimeRef.current = 0; }}
                  style={{
                    padding: '7px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.05)', color: '#d1d5db',
                    fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4
                  }}
                  title="Reset to Ground Datum"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Initial Launch Velocity Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Launch Velocity (v₀):</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{kinematicsV0} m/s</span>
                </div>
                <input
                  type="range" min="6" max="45" value={kinematicsV0}
                  onChange={e => setKinematicsV0(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#00d4ff' }}
                />
              </div>

              {/* Gravitational Field (g) Buttons */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Gravitational Field (g):</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{kinematicsG} m/s²</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 4 }}>
                  {[
                    { label: 'Earth', val: 9.8 },
                    { label: 'Moon', val: 1.6 },
                    { label: 'Mars', val: 3.7 },
                    { label: 'Jupiter', val: 24.8 }
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => setKinematicsG(p.val)}
                      style={{
                        padding: '4px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: kinematicsG === p.val ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${kinematicsG === p.val ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                        color: kinematicsG === p.val ? '#fca5a5' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ball Mass */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Projectile Mass (m):</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{kinematicsMass} kg</span>
                </div>
                <input
                  type="range" min="0.2" max="5.0" step="0.2" value={kinematicsMass}
                  onChange={e => setKinematicsMass(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }}
                />
              </div>

              {/* Physics Live Telemetry Card */}
              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.2)', fontSize: 11, lineHeight: 1.6 }}>
                <strong style={{ color: '#00d4ff', display: 'block', marginBottom: 4 }}>Kinematics Derived Quantities:</strong>
                <div>• Max Height: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{((kinematicsV0 * kinematicsV0) / (2 * kinematicsG)).toFixed(1)} m</span></div>
                <div>• Time to Apex: <span style={{ color: '#10b981', fontWeight: 700 }}>{(kinematicsV0 / kinematicsG).toFixed(2)} s</span></div>
                <div>• Total Flight Time: <span style={{ color: '#60a5fa', fontWeight: 700 }}>{((2 * kinematicsV0) / kinematicsG).toFixed(2)} s</span></div>
                <div>• Acceleration: <span style={{ color: '#ef4444', fontWeight: 700 }}>-{kinematicsG} m/s² (Constant)</span></div>
              </div>

              {/* Textbook Concept Callout from User Diagram */}
              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 11, lineHeight: 1.5 }}>
                <strong style={{ color: '#fbbf24' }}>💡 Textbook Principle Identified:</strong>
                <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)' }}>
                  At the peak of flight, the ball is <strong>instantaneously at rest (v = 0 m/s)</strong>, but the downward gravitational acceleration remains <strong>a = -9.8 m/s²</strong> throughout.
                </p>
              </div>
            </div>
          )}

          {/* CONTROLS FOR CIRCUIT */}
          {activeLabType === 'circuit' && (
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

          {/* CONTROLS FOR OPTICS */}
          {activeLabType === 'optics' && (
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

          {/* CONTROLS FOR MECHANICS */}
          {activeLabType === 'mechanics' && (
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

          {/* CONTROLS FOR PENDULUM */}
          {activeLabType === 'pendulum' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Length (L):</span>
                  <span style={{ color: '#00d4ff', fontWeight: 700 }}>{pendulumLength} m</span>
                </div>
                <input type="range" min="0.5" max="4.0" step="0.1" value={pendulumLength} onChange={e => setPendulumLength(Number(e.target.value))} style={{ width: '100%', accentColor: '#00d4ff' }} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span>Gravity (g):</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{pendulumGravity} m/s²</span>
                </div>
                <input type="range" min="1.6" max="25.0" step="0.2" value={pendulumGravity} onChange={e => setPendulumGravity(Number(e.target.value))} style={{ width: '100%', accentColor: '#ef4444' }} />
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
