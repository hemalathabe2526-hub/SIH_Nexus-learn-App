'use client';

import React, { useEffect, useState } from 'react';
import { Mic, Camera, X, ShieldCheck } from 'lucide-react';
import { PermissionType, PermissionChoice } from '@/lib/permissions';

interface AppPermissionModalProps {
  isOpen: boolean;
  type: PermissionType;
  onChoice: (choice: PermissionChoice) => void;
  onClose?: () => void;
}

export default function AppPermissionModal({
  isOpen,
  type,
  onChoice,
  onClose,
}: AppPermissionModalProps) {
  const [origin, setOrigin] = useState('sih-nexus-learn-app.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.host || 'sih-nexus-learn-app.vercel.app');
    }
  }, []);

  if (!isOpen) return null;

  const isMic = type === 'microphone';
  const titleText = isMic ? 'Use your microphones' : 'Use your cameras';
  const descriptionText = isMic
    ? 'Required for live Socratic viva defense, voice tutoring, and speech pronunciation analysis.'
    : 'Required for scanning textbook STEM diagrams and interactive WebXR desk holograms.';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#111827',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          padding: '24px 24px 20px',
          color: '#f9fafb',
          fontFamily: 'Outfit, sans-serif',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 18,
              right: 18,
              background: 'transparent',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        )}

        {/* Origin / Hostname */}
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f3f4f6', marginBottom: 12, paddingRight: 28, wordBreak: 'break-all' }}>
          {origin}
          <div style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af', marginTop: 2 }}>
            wants to
          </div>
        </div>

        {/* Feature Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0 10px' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: isMic ? 'rgba(0, 212, 255, 0.15)' : 'rgba(168, 85, 247, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isMic ? '#00d4ff' : '#c084fc',
              flexShrink: 0,
            }}
          >
            {isMic ? <Mic size={24} /> : <Camera size={24} />}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
              {titleText}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, lineHeight: 1.4 }}>
              {descriptionText}
            </div>
          </div>
        </div>

        {/* 3 Explicit Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 22 }}>
          {/* Option 1: Allow while using this app */}
          <button
            onClick={() => onChoice('while_using')}
            style={{
              width: '100%',
              padding: '13px 18px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #0066ff, #00d4ff)',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'Outfit',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(0, 102, 255, 0.3)',
              transition: 'all 0.15s ease',
            }}
          >
            Allow while using this app
          </button>

          {/* Option 2: Allow only this time */}
          <button
            onClick={() => onChoice('only_this_time')}
            style={{
              width: '100%',
              padding: '12px 18px',
              borderRadius: 14,
              border: '1px solid rgba(255, 255, 255, 0.2)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#f3f4f6',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Outfit',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            Allow only this time
          </button>

          {/* Option 3: Block */}
          <button
            onClick={() => onChoice('block')}
            style={{
              width: '100%',
              padding: '11px 18px',
              borderRadius: 14,
              border: 'none',
              background: 'transparent',
              color: '#ef4444',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Outfit',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            Block
          </button>
        </div>

        {/* Security badge footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 11, color: '#6b7280' }}>
          <ShieldCheck size={13} color="#10b981" />
          <span>Permissions can be reset at any time in device or app settings</span>
        </div>
      </div>
    </div>
  );
}
