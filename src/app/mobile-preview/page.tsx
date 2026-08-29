'use client';

import { useState } from 'react';
import Link from 'next/link';

type DeviceModel = 'pixel9' | 'galaxy' | 'tablet';

export default function MobilePreviewPage() {
  const [device, setDevice] = useState<DeviceModel>('pixel9');
  const [currentRoute, setCurrentRoute] = useState<string>('/dashboard');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showPlayStoreModal, setShowPlayStoreModal] = useState(false);

  const getDeviceDimensions = () => {
    if (orientation === 'landscape') {
      return device === 'tablet' ? { width: 900, height: 600 } : { width: 840, height: 412 };
    }
    switch (device) {
      case 'galaxy':
        return { width: 412, height: 860 };
      case 'tablet':
        return { width: 768, height: 1024 };
      case 'pixel9':
      default:
        return { width: 393, height: 830 };
    }
  };

  const dims = getDeviceDimensions();

  return (
    <div style={{ background: '#020408', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.2)', background: 'rgba(10,15,29,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>⚡</span>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
          </Link>
          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700, border: '1px solid rgba(16,185,129,0.4)' }}>
            📱 Android Play Store Preview Suite
          </span>
        </div>

        {/* Quick App Route Selectors */}
        <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
          {[
            { label: '🏠 Dashboard', route: '/dashboard' },
            { label: '📺 Video Lab', route: '/videolab' },
            { label: '🧪 3D Labs', route: '/virtuallab' },
            { label: '💻 Code', route: '/code' },
            { label: '🔊 Bhasha', route: '/bhasha' },
            { label: '🤖 Gemini AI', route: '/agent' },
            { label: '🪄 Teacher', route: '/teacher' },
            { label: '⚔️ RPG', route: '/rpg' },
          ].map(item => (
            <button
              key={item.route}
              onClick={() => setCurrentRoute(item.route)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none',
                background: currentRoute === item.route ? 'linear-gradient(135deg, #0066ff, #00d4ff)' : 'transparent',
                color: currentRoute === item.route ? 'white' : 'rgba(255,255,255,0.6)',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Device & Play Store Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            value={device}
            onChange={e => setDevice(e.target.value as DeviceModel)}
            style={{
              padding: '6px 10px', borderRadius: 8, background: '#0a0f1d',
              border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: 12, outline: 'none', fontFamily: 'Outfit', fontWeight: 600,
            }}
          >
            <option value="pixel9">📱 Google Pixel 9 Pro</option>
            <option value="galaxy">📱 Samsung Galaxy S24</option>
            <option value="tablet">📟 Android Tablet (10")</option>
          </select>

          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            style={{ padding: '6px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', fontSize: 12, cursor: 'pointer' }}
            title="Rotate Device"
          >
            🔄 {orientation === 'portrait' ? 'Rotate' : 'Portrait'}
          </button>

          <button
            onClick={() => setShowPlayStoreModal(true)}
            style={{
              padding: '7px 14px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #06b6d4)',
              color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
              boxShadow: '0 0 15px rgba(16,185,129,0.4)',
            }}
          >
            🚀 Play Store Publish Guide
          </button>
        </div>
      </div>

      {/* Main Workspace Preview Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', background: 'radial-gradient(circle at center, #070e1c 0%, #020408 100%)' }}>
        
        {/* Smartphone Shell Frame */}
        <div style={{
          width: dims.width + 24,
          height: dims.height + 24,
          borderRadius: device === 'tablet' ? 24 : 48,
          background: 'linear-gradient(145deg, #2b3548, #0a0d14)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.8), 0 0 50px rgba(0,212,255,0.15), inset 0 0 2px rgba(255,255,255,0.3)',
          padding: 12,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          
          {/* Hardware Camera Notch / Dynamic Island */}
          {device !== 'tablet' && (
            <div style={{
              position: 'absolute',
              top: orientation === 'portrait' ? 18 : 6,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 80,
              height: 18,
              borderRadius: 20,
              background: '#000',
              zIndex: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0a192f', border: '1px solid #1e293b' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
            </div>
          )}

          {/* Android Screen Frame Container */}
          <div style={{
            width: dims.width,
            height: dims.height,
            borderRadius: device === 'tablet' ? 16 : 38,
            overflow: 'hidden',
            background: '#020408',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)',
          }}>
            
            {/* Native Android Status Bar */}
            <div style={{
              height: 24, background: '#020408', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 16px', fontSize: 11, color: 'rgba(255,255,255,0.8)', zIndex: 20, userSelect: 'none',
              fontFamily: 'Roboto, sans-serif',
            }}>
              <span>9:41</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10 }}>
                <span>5G</span>
                <span>📶</span>
                <span>🔋 100%</span>
              </div>
            </div>

            {/* Embedded Live Web Application Viewport (Relative URL for 100% reliable multi-device / Vercel rendering) */}
            <iframe
              src={currentRoute}
              title="Android Live App Preview"
              style={{
                flex: 1,
                width: '100%',
                border: 'none',
                background: '#020408',
              }}
            />

            {/* Android Native Navigation Gesture Bar */}
            <div style={{
              height: 18, background: '#020408', display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 20,
            }}>
              <div style={{ width: 120, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.4)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Play Store Publishing Modal Guide */}
      {showPlayStoreModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(15px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
        }}>
          <div style={{
            maxWidth: 680, width: '100%', maxHeight: '85vh', overflowY: 'auto',
            background: '#0a0f1d', borderRadius: 20, border: '1px solid rgba(16,185,129,0.3)',
            padding: 28, display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 28 }}>📦</span>
                <div>
                  <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 18, fontWeight: 700, color: '#10b981', margin: 0 }}>
                    Google Play Store Publishing Package
                  </h3>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Package: com.nexuslearn.app | Version: 1.0.0</div>
                </div>
              </div>
              <button onClick={() => setShowPlayStoreModal(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <p style={{ margin: 0 }}>
                NEXUS LEARN has been configured with <strong>Capacitor Native Android</strong> runtime. Follow these straightforward steps to generate your signed APK or AAB for the Google Play Store:
              </p>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ color: '#00d4ff' }}>Step 1: Build the Web Assets & Sync to Android</strong>
                <pre style={{ margin: '6px 0 0', padding: 8, borderRadius: 6, background: '#020408', color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                  npm run build{"\n"}
                  npx cap sync android
                </pre>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ color: '#00d4ff' }}>Step 2: Open in Android Studio or Build APK via Gradle</strong>
                <pre style={{ margin: '6px 0 0', padding: 8, borderRadius: 6, background: '#020408', color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                  npx cap open android{"\n"}
                  # Or from terminal:{"\n"}
                  cd android && ./gradlew assembleDebug
                </pre>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <strong style={{ color: '#00d4ff' }}>Step 3: Generate Signed Android App Bundle (AAB) for Play Console</strong>
                <pre style={{ margin: '6px 0 0', padding: 8, borderRadius: 6, background: '#020408', color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: 12 }}>
                  cd android && ./gradlew bundleRelease
                </pre>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                  The output bundle is generated at: <code>android/app/build/outputs/bundle/release/app-release.aab</code>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <strong style={{ color: '#10b981' }}>✓ Play Store Checklist Complete:</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>
                  <li>Target SDK 34+ (Android 14 ready)</li>
                  <li>Camera & Audio permissions for 3D AR labs and Bhasha Voice AI</li>
                  <li>Offline caching & PWA service worker enabled</li>
                  <li>Google Play Store policy compliant content safety</li>
                </ul>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }}>
              <button
                onClick={() => setShowPlayStoreModal(false)}
                style={{ padding: '8px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
