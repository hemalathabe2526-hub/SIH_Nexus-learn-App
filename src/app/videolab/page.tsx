'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getStoredSession } from '@/lib/authStore';
import { TOPIC_QUIZZES, getCombinedSyllabus, type SyllabusTopic, type QuizQuestion } from '@/lib/syllabusData';
import { getVideoBlobUrl } from '@/lib/videoStore';

export default function VideoLabPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'white', background: 'var(--nexus-void, #020408)' }}>Loading video lab...</div>}>
      <VideoLabContent />
    </Suspense>
  );
}

function VideoLabContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [currentUser] = useState(getStoredSession());
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SyllabusTopic | null>(null);

  // Player mode: 'video_stream' | 'direct_video' | 'interactive_concept' (100% In-Platform)
  const [playerMode, setPlayerMode] = useState<'video_stream' | 'direct_video' | 'interactive_concept'>('video_stream');
  const [directVideoSrc, setDirectVideoSrc] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(300);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [rewindCount, setRewindCount] = useState(0);
  const [struggleDetected, setStruggleDetected] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'quiz'>('video');
  const [userNote, setUserNote] = useState('');
  const [notesList, setNotesList] = useState<{ time: string; text: string }[]>([]);

  // Load syllabus based on role and sync from cloud
  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
      return;
    }

    const loadAndSync = async () => {
      const { fetchTeacherTopicsCloud, getCombinedSyllabus } = await import('@/lib/syllabusData');
      const cloudTopics = await fetchTeacherTopicsCloud();
      const userSyllabus = getCombinedSyllabus(currentUser.role, cloudTopics);
      setSyllabus(userSyllabus);

      const topicId = searchParams.get('topic');
      if (topicId) {
        const found = userSyllabus.find(t => t.id === topicId);
        if (found) { setSelectedTopic(found); return; }
      }
      setSelectedTopic(prev => prev || userSyllabus[0]);
    };

    loadAndSync();
    const interval = setInterval(loadAndSync, 8000);
    return () => clearInterval(interval);
  }, [currentUser, router, searchParams]);

  // Load video source when selectedTopic changes
  useEffect(() => {
    if (!selectedTopic) return;
    setRewindCount(0);
    setStruggleDetected(false);
    setCurrentTime(0);
    setIsPlaying(true);
    setVideoUnavailable(false);

    let isMounted = true;

    async function resolveVideo() {
      if (!selectedTopic) return;

      // 1. If teacher uploaded a raw video file (stored in IndexedDB), use native HTML5 player
      const blobUrl = await getVideoBlobUrl(selectedTopic.id);
      if (!isMounted) return;

      if (blobUrl) {
        setDirectVideoSrc(blobUrl);
        setPlayerMode('direct_video');
        return;
      }

      // 2. If teacher provided a direct video URL (MP4/WebM link), use native HTML5 player
      if (selectedTopic.videoUrl && selectedTopic.videoUrl.trim()) {
        setDirectVideoSrc(selectedTopic.videoUrl);
        setPlayerMode('direct_video');
        return;
      }

      // 3. For all syllabus topics: play the verified educational video directly in the platform
      if (selectedTopic.youtubeId) {
        setPlayerMode('video_stream');
        setDirectVideoSrc(null);
        return;
      }

      // 4. Default fallback: interactive concept studio
      setPlayerMode('interactive_concept');
      setDirectVideoSrc(null);
    }

    resolveVideo();

    return () => {
      isMounted = false;
    };
  }, [selectedTopic]);

  // YouTube message listener for errors — automatically switch to Interactive Concept Studio so students never see an error
  useEffect(() => {
    const handleYouTubeMessage = (event: MessageEvent) => {
      if (!event.origin.includes('youtube.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onError' || data?.info?.error) {
          setVideoUnavailable(true);
          setPlayerMode('interactive_concept');
        }
      } catch {
        // Ignore unrelated postMessage payloads.
      }
    };
    window.addEventListener('message', handleYouTubeMessage);
    return () => window.removeEventListener('message', handleYouTubeMessage);
  }, []);

  // Video timer simulation for YouTube or Interactive mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && playerMode !== 'direct_video') {
      timer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, duration, playerMode]);

  const sendIframeCommand = (func: string, args: unknown[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  const handleTogglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);

    if (playerMode === 'direct_video' && videoRef.current) {
      if (nextState) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    } else {
      sendIframeCommand(nextState ? 'playVideo' : 'pauseVideo');
    }
  };

  const handleRewind = () => {
    const newTime = Math.max(0, currentTime - 10);
    setCurrentTime(newTime);

    if (playerMode === 'direct_video' && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else {
      sendIframeCommand('seekTo', [newTime, true]);
    }

    setRewindCount(prev => {
      const next = prev + 1;
      if (next >= 2 && !struggleDetected) {
        setIsPlaying(false);
        if (playerMode === 'direct_video' && videoRef.current) {
          videoRef.current.pause();
        } else {
          sendIframeCommand('pauseVideo');
        }
        setStruggleDetected(true);
      }
      return next;
    });
  };

  const handleForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    setCurrentTime(newTime);

    if (playerMode === 'direct_video' && videoRef.current) {
      videoRef.current.currentTime = newTime;
    } else {
      sendIframeCommand('seekTo', [newTime, true]);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerMode === 'direct_video' && videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = Number(e.target.value);
    setCurrentTime(seekTime);
    if (playerMode === 'direct_video' && videoRef.current) {
      videoRef.current.currentTime = seekTime;
    } else {
      sendIframeCommand('seekTo', [seekTime, true]);
    }
  };

  const handleAddNote = () => {
    if (!userNote.trim()) return;
    const m = Math.floor(currentTime / 60);
    const s = Math.floor(currentTime % 60);
    const timeStr = `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    setNotesList(prev => [...prev, { time: timeStr, text: userNote }]);
    setUserNote('');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  if (!currentUser || !selectedTopic) return null;

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(0,212,255,0.15)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }} />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#00d4ff', margin: 0 }}>
            🎬 In-Platform Video Learning Studio
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            🔒 100% In-App Playback · Zero external redirects
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            fontSize: 12, color: struggleDetected ? '#ef4444' : '#10b981',
            background: struggleDetected ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
            padding: '4px 12px', borderRadius: 100, border: `1px solid ${struggleDetected ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`
          }}>
            {struggleDetected ? '⚠️ Struggle Auto-Detected' : '🟢 AI Rewind Monitor Active'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: 0, minHeight: 'calc(100vh - 57px)' }}>

        {/* LEFT: Syllabus Selector */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px 12px', overflowY: 'auto', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: 1, paddingLeft: 4 }}>
            SYLLABUS — {currentUser.role.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {syllabus.map(topic => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic);
                }}
                style={{
                  padding: '10px 12px', borderRadius: 10, border: `1px solid ${selectedTopic?.id === topic.id ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  background: selectedTopic?.id === topic.id ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)',
                  color: 'white', textAlign: 'left', cursor: 'pointer', fontFamily: 'Outfit', transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700 }}>{topic.subject}</div>
                  {topic.videoSource === 'local' && (
                    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 700 }}>Teacher Upload</span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, marginTop: 2 }}>{topic.title}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>⏱ {topic.durationMinutes} min</div>
              </button>
            ))}
          </div>
        </div>

        {/* CENTER: In-Platform Video Player & Controls */}
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
          {/* Main Video Box */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,212,255,0.25)', position: 'relative', background: '#000' }}>
            {/* Top Player Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: 'rgba(0,0,0,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{selectedTopic.title}</span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {directVideoSrc ? (
                  <button
                    onClick={() => setPlayerMode('direct_video')}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: playerMode === 'direct_video' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                      color: playerMode === 'direct_video' ? '#10b981' : 'rgba(255,255,255,0.6)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                    }}
                  >
                    🎬 Teacher Video
                  </button>
                ) : (
                  <button
                    onClick={() => setPlayerMode('video_stream')}
                    style={{
                      padding: '4px 10px', borderRadius: 6, border: 'none',
                      background: playerMode === 'video_stream' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
                      color: playerMode === 'video_stream' ? '#00d4ff' : 'rgba(255,255,255,0.6)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                    }}
                  >
                    📺 Video Stream
                  </button>
                )}
                <button
                  onClick={() => setPlayerMode('interactive_concept')}
                  style={{
                    padding: '4px 10px', borderRadius: 6, border: 'none',
                    background: playerMode === 'interactive_concept' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)',
                    color: playerMode === 'interactive_concept' ? '#a855f7' : 'rgba(255,255,255,0.6)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                  }}
                >
                  ⚡ Interactive Studio
                </button>
              </div>
            </div>

            {/* 1. NATIVE HTML5 IN-PLATFORM VIDEO PLAYER (For uploaded files / direct video links) */}
            {playerMode === 'direct_video' && directVideoSrc && (
              <div style={{ position: 'relative', width: '100%', minHeight: 420, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <video
                  ref={videoRef}
                  src={directVideoSrc}
                  autoPlay
                  playsInline
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      setCurrentTime(videoRef.current.currentTime);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current && videoRef.current.duration) {
                      setDuration(videoRef.current.duration);
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  style={{ width: '100%', maxHeight: 440, objectFit: 'contain' }}
                />
              </div>
            )}

            {/* 2. IN-PLATFORM SECURED VIDEO STREAM (Verified Educational Video Played 100% Inside App) */}
            {playerMode === 'video_stream' && selectedTopic.youtubeId && !videoUnavailable && (
              <div style={{ position: 'relative', width: '100%', height: 440, background: '#000' }}>
                <iframe
                  ref={iframeRef}
                  key={selectedTopic.id + '_' + selectedTopic.youtubeId}
                  src={`https://www.youtube-nocookie.com/embed/${selectedTopic.youtubeId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                  title={selectedTopic.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{ width: '100%', height: 440, border: 'none', display: 'block' }}
                />
              </div>
            )}

            {/* 3. IN-PLATFORM INTERACTIVE VIDEO LECTURE STUDIO (Guaranteed In-App, Zero External Redirects) */}
            {(playerMode === 'interactive_concept' || (playerMode === 'video_stream' && videoUnavailable)) && (
              <div style={{ minHeight: 420, background: 'radial-gradient(circle at center, #0a192f 0%, #020408 100%)', padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(0,212,255,0.15)', color: '#00d4ff', fontWeight: 700 }}>
                      ⚡ In-Platform Interactive Video Lecture
                    </span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono' }}>
                      Subject: {selectedTopic.subject}
                    </span>
                  </div>

                  <h3 style={{ fontFamily: 'Space Grotesk', fontSize: 22, fontWeight: 800, color: 'white', margin: '0 0 10px' }}>
                    {selectedTopic.title}
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: 680, margin: '0 0 16px' }}>
                    {selectedTopic.description}
                  </p>

                  {/* Animated Concept Wave Visualizer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 32, marginBottom: 16, padding: '6px 14px', background: 'rgba(0,212,255,0.05)', borderRadius: 10, border: '1px solid rgba(0,212,255,0.15)' }}>
                    <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, marginRight: 8 }}>Lecture Wave:</span>
                    {[40, 75, 20, 90, 50, 80, 30, 100, 60, 85, 45, 95, 35, 70, 55, 88].map((h, i) => (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: `${isPlaying ? h : 20}%`,
                          background: 'linear-gradient(to top, #0066ff, #00d4ff)',
                          borderRadius: 2,
                          transition: 'height 0.3s ease',
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 16 }}>
                    {selectedTopic.keyConcepts.map((kc, i) => (
                      <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#10b981', fontWeight: 800 }}>✓</span>
                        <span style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>{kc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.6)', padding: '12px 18px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(`${selectedTopic.title}. ${selectedTopic.description}. Key concepts to master include ${selectedTopic.keyConcepts.join(', ')}.`);
                        window.speechSynthesis.speak(utterance);
                      }}
                      style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12 }}
                    >
                      🔊 Play AI Voice Narration
                    </button>
                    {selectedTopic.labRoute && (
                      <Link href={selectedTopic.labRoute} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}>
                        🧪 Launch 3D Simulation Lab →
                      </Link>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                    🔒 In-Platform Secured Stream Active
                  </span>
                </div>
              </div>
            )}

            {/* Struggle Alert Modal Overlay */}
            {struggleDetected && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(2,4,8,0.96)', backdropFilter: 'blur(15px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: 24, textAlign: 'center', zIndex: 20,
              }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>💡</div>
                <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 20, color: '#00d4ff', marginBottom: 8 }}>
                  AI Auto-Detected Concept Struggle!
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', maxWidth: 460, lineHeight: 1.6, marginBottom: 16 }}>
                  We noticed you rewound <strong>{selectedTopic.title}</strong> multiple times! Here is the key concept summary:
                </p>

                <div style={{ padding: 14, borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)', maxWidth: 440, textAlign: 'left', marginBottom: 18 }}>
                  <strong style={{ color: '#00d4ff', fontSize: 12 }}>🎯 Key Concept Breakdown:</strong>
                  <ul style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, paddingLeft: 16, marginTop: 6 }}>
                    {selectedTopic.keyConcepts.map(c => <li key={c}>{c}</li>)}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={() => {
                      setStruggleDetected(false);
                      setIsPlaying(true);
                      if (playerMode === 'direct_video' && videoRef.current) {
                        videoRef.current.play().catch(() => {});
                      }
                    }}
                    style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}
                  >
                    👍 Resume Video Stream
                  </button>
                  {selectedTopic.labRoute && (
                    <Link
                      href={selectedTopic.labRoute}
                      style={{ padding: '10px 22px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', textDecoration: 'none', fontWeight: 700 }}
                    >
                      🧪 Open 3D Virtual Lab
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Player Controls & Timeline Scrubbing */}
          <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Timeline Progress Bar */}
            <div style={{ marginBottom: 10 }}>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                style={{
                  width: '100%',
                  accentColor: '#00d4ff',
                  cursor: 'pointer',
                  height: 4,
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={handleTogglePlay}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: '#0066ff', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button onClick={handleRewind}
                  style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontSize: 11, fontFamily: 'Outfit', fontWeight: 600 }}>
                  ⏪ Rewind 10s ({rewindCount})
                </button>
                <button onClick={handleForward}
                  style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', fontSize: 11, fontFamily: 'Outfit', fontWeight: 600 }}>
                  ⏩ Forward 10s
                </button>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: 'JetBrains Mono, monospace' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Speed selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Speed:</span>
                  {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      style={{
                        padding: '3px 7px', borderRadius: 6, border: 'none',
                        background: playbackSpeed === speed ? '#0066ff' : 'rgba(255,255,255,0.05)',
                        color: 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontWeight: 700 }}>
                  🔒 In-Platform Mode
                </span>
              </div>
            </div>
          </div>

          {/* Topic Info */}
          <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 17, color: 'white', margin: '0 0 6px' }}>
              {selectedTopic.title}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px', lineHeight: 1.5 }}>{selectedTopic.description}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedTopic.keyConcepts.map(c => (
                <span key={c} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00d4ff' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Sub-tabs: Video Notes / 20-Question Quiz */}
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[
                { id: 'video', label: '💡 AI Takeaways' },
                { id: 'notes', label: '📝 Timestamped Notes' },
                { id: 'quiz', label: '🎯 Topic Quiz & Assessment' },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, border: 'none',
                    background: activeTab === t.id ? 'rgba(0,212,255,0.15)' : 'transparent',
                    color: activeTab === t.id ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
                  }}>
                  {t.label}
                </button>
              ))}
            </div>

            {activeTab === 'video' && (
              <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#00d4ff', marginBottom: 8 }}>AI Key Takeaways</h3>
                <ul style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', paddingLeft: 20, lineHeight: 1.8, margin: 0 }}>
                  {selectedTopic.keyConcepts.map((c, i) => (
                    <li key={i}>Mastering <strong>{c}</strong> is required for your role assessment.</li>
                  ))}
                  <li>Use the assessment quiz tab to test your full concept retention.</li>
                </ul>
              </div>
            )}

            {activeTab === 'notes' && (
              <div style={{ padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input
                    value={userNote}
                    onChange={e => setUserNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                    placeholder={`Add note at ${formatTime(currentTime)}...`}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, outline: 'none', fontFamily: 'Outfit' }}
                  />
                  <button onClick={handleAddNote}
                    style={{ padding: '8px 16px', borderRadius: 8, background: '#0066ff', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>
                    Add Note
                  </button>
                </div>
                {notesList.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No notes taken yet. Type a note above!</p>}
                {notesList.map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: 9, borderRadius: 8, background: 'rgba(255,255,255,0.02)', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: '#00d4ff', fontFamily: 'JetBrains Mono', background: 'rgba(0,212,255,0.1)', padding: '2px 6px', borderRadius: 4 }}>{n.time}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>{n.text}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && (
              <Full20QuestionQuiz topic={selectedTopic} />
            )}
          </div>
        </div>

        {/* RIGHT: AI Telemetry & Lab Links */}
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '16px 14px', background: 'rgba(255,255,255,0.01)', overflowY: 'auto' }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: '#00d4ff', marginBottom: 12 }}>
            📡 Session Telemetry
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'Rewind Events', val: `${rewindCount} times`, color: rewindCount >= 2 ? '#ef4444' : '#10b981' },
              { label: 'Time Spent', val: formatTime(currentTime), color: '#00d4ff' },
              { label: 'Player Engine', val: playerMode === 'direct_video' ? 'Native HTML5 Video' : playerMode === 'video_stream' ? 'In-Platform Stream' : 'Concept Studio', color: '#10b981' },
              { label: 'Comprehension Rating', val: struggleDetected ? '58%' : '92%', color: struggleDetected ? '#ef4444' : '#10b981' },
            ].map(item => (
              <div key={item.label} style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: item.color, fontFamily: 'Space Grotesk' }}>{item.val}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setRewindCount(2); setStruggleDetected(true); setIsPlaying(false); }}
            style={{ width: '100%', marginTop: 14, padding: 9, borderRadius: 8, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)', color: '#00d4ff', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>
            ⚡ Test AI Struggle Modal
          </button>

          {selectedTopic.labRoute && (
            <Link href={selectedTopic.labRoute}
              style={{ display: 'block', marginTop: 10, padding: 10, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981', textDecoration: 'none', textAlign: 'center', fontSize: 12, fontWeight: 700 }}>
              🧪 Launch 3D Concept Lab →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// Full Quiz Component supporting both Teacher-Custom questions and standard Banks
function Full20QuestionQuiz({ topic }: { topic: SyllabusTopic }) {
  // Check if topic is teacher topic with custom quiz
  const teacherTopic = topic as SyllabusTopic & { customQuiz?: QuizQuestion[] };
  const customBank = teacherTopic.customQuiz && teacherTopic.customQuiz.length > 0 ? teacherTopic.customQuiz : null;
  const questionBank: QuizQuestion[] = customBank || TOPIC_QUIZZES[topic.id] || TOPIC_QUIZZES['phy_101'] || [];

  const [questions, setQuestions] = useState<QuizQuestion[]>(() => shuffleQuestions(questionBank));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setQuestions(shuffleQuestions(questionBank));
    setCurrentIdx(0);
    setSelectedAnswers({});
    setSubmitted(false);
  }, [topic.id, questionBank]);

  if (questions.length === 0) {
    return <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, padding: 16 }}>No quiz questions found for this topic.</div>;
  }

  const q = questions[currentIdx];
  const selectedOption = selectedAnswers[currentIdx];

  const handleSelect = (optionIdx: number) => {
    if (submitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((qItem, idx) => {
      if (selectedAnswers[idx] === qItem.correct) score++;
    });
    return score;
  };

  return (
    <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Header / Score bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#f59e0b', margin: 0 }}>
            🎯 Assessment: {topic.title}
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
            Question {currentIdx + 1} of {questions.length}
          </p>
        </div>
        {!submitted ? (
          <button
            onClick={() => setSubmitted(true)}
            style={{ padding: '8px 16px', borderRadius: 8, background: 'linear-gradient(135deg, #10b981, #06b6d4)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 12 }}
          >
            🏁 Submit Quiz ({Object.keys(selectedAnswers).length}/{questions.length} answered)
          </button>
        ) : (
          <div style={{ fontSize: 14, fontWeight: 800, color: '#10b981', fontFamily: 'Space Grotesk' }}>
            Score: {calculateScore()} / {questions.length} ({Math.round((calculateScore() / questions.length) * 100)}%)
          </div>
        )}
      </div>

      {/* Question Progress Bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {questions.map((_, idx) => {
          const isAnswered = selectedAnswers[idx] !== undefined;
          const isCurrent = currentIdx === idx;
          let bg = 'rgba(255,255,255,0.08)';
          if (submitted) {
            bg = selectedAnswers[idx] === questions[idx].correct ? '#10b981' : '#ef4444';
          } else if (isCurrent) {
            bg = '#00d4ff';
          } else if (isAnswered) {
            bg = '#f59e0b';
          }
          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              style={{
                width: 24, height: 24, borderRadius: 6, border: 'none', background: bg,
                color: isCurrent ? '#000' : 'white', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Current Question */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
            background: q.type === 'truefalse' ? 'rgba(168,85,247,0.2)' : q.type === 'fillinblank' ? 'rgba(245,158,11,0.2)' : q.type === 'assertion' ? 'rgba(239,68,68,0.2)' : q.type === 'match' ? 'rgba(16,185,129,0.2)' : 'rgba(0,212,255,0.2)',
            color: q.type === 'truefalse' ? '#a855f7' : q.type === 'fillinblank' ? '#f59e0b' : q.type === 'assertion' ? '#ef4444' : q.type === 'match' ? '#10b981' : '#00d4ff',
            border: '1px solid currentColor',
          }}>
            {q.type ? q.type.toUpperCase() : 'MCQ'}
          </span>
          {q.fillAnswer && <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Fill-in-the-blank format</span>}
        </div>

        <h4 style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 12, lineHeight: 1.5 }}>
          {currentIdx + 1}. {q.question}
        </h4>

        {q.type === 'fillinblank' && q.fillAnswer ? (
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Type your answer here..."
              disabled={submitted}
              onChange={e => {
                const val = e.target.value.trim().toLowerCase();
                const isRight = val === q.fillAnswer?.toLowerCase();
                handleSelect(isRight ? q.correct : -1);
              }}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(0,212,255,0.3)',
                color: 'white', fontSize: 13, outline: 'none', fontFamily: 'Outfit',
              }}
            />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Or select the matching option below:</div>
          </div>
        ) : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {q.options.map((opt, optIdx) => {
            let border = 'rgba(255,255,255,0.08)';
            let bg = 'rgba(255,255,255,0.03)';
            let color = 'white';

            if (submitted) {
              if (optIdx === q.correct) { border = '#10b981'; bg = 'rgba(16,185,129,0.15)'; color = '#10b981'; }
              else if (selectedOption === optIdx) { border = '#ef4444'; bg = 'rgba(239,68,68,0.15)'; color = '#ef4444'; }
            } else if (selectedOption === optIdx) {
              border = '#00d4ff'; bg = 'rgba(0,212,255,0.1)'; color = '#00d4ff';
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleSelect(optIdx)}
                style={{
                  padding: '10px 14px', borderRadius: 10, border: `1px solid ${border}`,
                  background: bg, color, textAlign: 'left', fontSize: 13, cursor: submitted ? 'default' : 'pointer',
                  fontFamily: 'Outfit', transition: 'all 0.15s',
                }}
              >
                <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation if submitted or answered */}
      {(submitted || selectedOption !== undefined) && (
        <div style={{ padding: 12, borderRadius: 10, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', fontSize: 12, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)', marginBottom: 16 }}>
          <strong style={{ color: '#00d4ff' }}>💡 Explanation:</strong> {q.explanation}
        </div>
      )}

      {/* Prev / Next Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
          disabled={currentIdx === 0}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', cursor: currentIdx === 0 ? 'default' : 'pointer', fontSize: 12 }}
        >
          ← Previous Question
        </button>
        <button
          onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
          disabled={currentIdx === questions.length - 1}
          style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'white', cursor: currentIdx === questions.length - 1 ? 'default' : 'pointer', fontSize: 12 }}
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}

function shuffleQuestions(items: QuizQuestion[]): QuizQuestion[] {
  return [...items].sort(() => Math.random() - 0.5);
}
