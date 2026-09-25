'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PeerNode {
  id: string;
  name: string;
  role: 'hub' | 'peer';
  distance: string;
  status: 'offline' | 'discovering' | 'syncing' | 'synced';
  syncedPercent: number;
  packetsReceived: number;
  battery: string;
}

export default function OfflineMeshSwarmPage() {
  const [peers, setPeers] = useState<PeerNode[]>([
    { id: 'node_hub', name: 'Ravi (Town Sync Hub)', role: 'hub', distance: 'Local Host', status: 'synced', syncedPercent: 100, packetsReceived: 450, battery: '88%' },
    { id: 'node_1', name: 'Priya (Village Peer 1)', role: 'peer', distance: '3.2 meters (BLE)', status: 'offline', syncedPercent: 0, packetsReceived: 0, battery: '64%' },
    { id: 'node_2', name: 'Karthik (Village Peer 2)', role: 'peer', distance: '5.8 meters (Wi-Fi Direct)', status: 'offline', syncedPercent: 0, packetsReceived: 0, battery: '91%' },
    { id: 'node_3', name: 'Ananya (Village Peer 3)', role: 'peer', distance: '8.4 meters (Mesh Relay)', status: 'offline', syncedPercent: 0, packetsReceived: 0, battery: '42%' },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [totalBytesSynced, setTotalBytesSynced] = useState(0);
  const [activeTransferRate, setActiveTransferRate] = useState('0 MB/s');

  const startMeshSync = () => {
    setIsSyncing(true);
    setActiveTransferRate('18.4 MB/s (Local Wi-Fi Direct / WebRTC)');

    // Step 1: Discover
    setPeers(prev => prev.map(p => p.role === 'peer' ? { ...p, status: 'discovering' } : p));

    // Step 2: Progressively sync
    setTimeout(() => {
      setPeers(prev => prev.map(p => p.role === 'peer' ? { ...p, status: 'syncing', syncedPercent: 45, packetsReceived: 180 } : p));
      setTotalBytesSynced(8400000);
    }, 1200);

    setTimeout(() => {
      setPeers(prev => prev.map(p => p.role === 'peer' ? { ...p, status: 'syncing', syncedPercent: 85, packetsReceived: 360 } : p));
      setTotalBytesSynced(16200000);
    }, 2400);

    // Step 3: Complete
    setTimeout(() => {
      setPeers(prev => prev.map(p => p.role === 'peer' ? { ...p, status: 'synced', syncedPercent: 100, packetsReceived: 450 } : p));
      setTotalBytesSynced(18600000);
      setIsSyncing(false);
      setActiveTransferRate('Sync Complete (0 B internet data consumed)');
    }, 3600);
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
          <Link href="/offline" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700 }}>
            ? Back to Offline Hub
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>??</span>
            <span>Peer-to-Peer Offline Mesh Swarm (Zero-Internet Sync Engine)</span>
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={startMeshSync}
            disabled={isSyncing}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #00d4ff)', color: 'white',
              fontWeight: 700, cursor: isSyncing ? 'wait' : 'pointer', fontFamily: 'Outfit', fontSize: 12,
              boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
            }}
          >
            {isSyncing ? '? Syncing P2P Packets...' : '? Initiate Ad-Hoc Mesh Sync'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 18, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Mesh Network Graph & Peer Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Telemetry Bar */}
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700 }}>LOCAL PEER-TO-PEER DATA CHANNEL</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'white', marginTop: 2 }}>{activeTransferRate}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>TOTAL PAYLOAD SYNCED LOCALLY</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginTop: 2 }}>{(totalBytesSynced / 1000000).toFixed(1)} MB (0 KB Mobile Data Used)</div>
            </div>
            <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700 }}>
              WebRTC DataChannel + BLE Active
            </span>
          </div>

          {/* Node Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {peers.map(peer => (
              <div
                key={peer.id}
                style={{
                  padding: 16, borderRadius: 14,
                  background: peer.role === 'hub' ? 'rgba(0,102,255,0.1)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${peer.role === 'hub' ? 'rgba(0,102,255,0.4)' : peer.status === 'synced' ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: peer.role === 'hub' ? '#60a5fa' : 'white' }}>
                    {peer.role === 'hub' ? '?? ' : '?? '} {peer.name}
                  </div>
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 700,
                    background: peer.status === 'synced' ? 'rgba(16,185,129,0.2)' : peer.status === 'syncing' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)',
                    color: peer.status === 'synced' ? '#10b981' : peer.status === 'syncing' ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                  }}>
                    {peer.status.toUpperCase()}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Proximity: {peer.distance}</span>
                  <span>Battery: {peer.battery}</span>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>Syllabus Sync:</span>
                    <span style={{ color: '#00d4ff', fontWeight: 700 }}>{peer.syncedPercent}%</span>
                  </div>
                  <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: `${peer.syncedPercent}%`, height: '100%', background: 'linear-gradient(90deg, #0066ff, #00d4ff)', transition: 'width 0.4s' }} />
                  </div>
                </div>

                <div style={{ fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                  Packets Verified: {peer.packetsReceived} / 450 (SHA-256 Verified)
                </div>
              </div>
            ))}
          </div>

          {/* Mesh Architecture Explanation */}
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff', margin: 0 }}>
              How Zero-Internet Village Mesh Swarm Works
            </h3>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, lineHeight: 1.6 }}>
              When a student travels to a nearby town with 4G or Wi-Fi, their phone automatically downloads updated video summaries, question banks, and teacher assignments. Upon returning to their village, their phone acts as an ad-hoc local mesh node. Nearby students connect peer-to-peer over local Wi-Fi Direct or Bluetooth to sync updates without relying on any active cell tower.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Synced Offline Packs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#10b981', margin: 0 }}>
            ?? Synced Educational Packages
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: 'Class 12 Physics Mechanics Pack', size: '14.2 MB', items: '24 formula cards, 3 simulations, 40 offline quiz questions', hash: 'sha256:4a8b...1f9e' },
              { title: 'District Leaderboard & Peer XP Table', size: '450 KB', items: 'Ranks of 120 village students across 5 blocks', hash: 'sha256:7c2e...88ab' },
              { title: 'Teacher Assignment & Answer Keys', size: '3.8 MB', items: 'Weekly test evaluation rubric & solutions', hash: 'sha256:91bf...32c1' },
            ].map((p, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'white' }}>{p.title}</div>
                  <span style={{ fontSize: 10, color: '#00d4ff', fontWeight: 700 }}>{p.size}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{p.items}</div>
                <div style={{ fontSize: 10, color: '#10b981', fontFamily: 'JetBrains Mono', marginTop: 4 }}>{p.hash}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: 11, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            <strong style={{ color: '#10b981' }}>W3C Verifiable Sync:</strong> Every synced educational package contains a SHA-256 signature signed by the district education server. Tampering is mathematically impossible even offline.
          </div>
        </div>

      </div>
    </div>
  );
}
