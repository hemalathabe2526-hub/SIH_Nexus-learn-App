'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BugChallenge {
  id: string;
  title: string;
  difficulty: 'Medium' | 'Hard' | 'Forensic';
  language: string;
  buggyCode: string;
  buggyLine: number;
  failingTestCase: string;
  hypothesisOptions: string[];
  correctHypothesisIndex: number;
  fixedCodeSnippet: string;
  explanation: string;
}

const BUG_CHALLENGES: BugChallenge[] = [
  {
    id: 'bug_1',
    title: 'Binary Search: Infinite Loop on Missing Target',
    difficulty: 'Medium',
    language: 'python',
    buggyCode: `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid  # BUG HERE: Causes infinite loop when right does not decrease!
    return -1`,
    buggyLine: 11,
    failingTestCase: 'arr = [1, 3, 5, 7], target = 2 -> Time Limit Exceeded (Infinite Loop at [left=1, right=1])',
    hypothesisOptions: [
      'Integer overflow occurred in mid calculation',
      'right pointer set to mid instead of mid - 1, causing [left, right] range to never shrink',
      'Target check condition should use <= instead of <',
      'Array indexing is 1-indexed in Python'
    ],
    correctHypothesisIndex: 1,
    fixedCodeSnippet: 'right = mid - 1',
    explanation: 'When right is set to mid instead of mid - 1, if left == right or left + 1 == right, the interval never decreases, trapping the execution in an infinite while loop.'
  },
  {
    id: 'bug_2',
    title: 'Two Sum: Duplicate Element Self-Pair Collision',
    difficulty: 'Hard',
    language: 'javascript',
    buggyCode: `function twoSum(nums, target) {
    const map = new Map();
    // Pre-populating entire map before check
    for (let i = 0; i < nums.length; i++) {
        map.set(nums[i], i);
    }
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) {
            // BUG HERE: Can pick the exact same index twice!
            return [i, map.get(diff)];
        }
    }
    return [];
}`,
    buggyLine: 10,
    failingTestCase: 'nums = [3, 2, 4], target = 6 -> Returns [0, 0] instead of [1, 2] (Used 3 twice!)',
    hypothesisOptions: [
      'Map does not support integer keys',
      'The check picks map.get(diff) even when it equals current index i (reusing same element)',
      'The loop condition should be i <= nums.length',
      'Target difference can be negative'
    ],
    correctHypothesisIndex: 1,
    fixedCodeSnippet: 'if (map.has(diff) && map.get(diff) !== i)',
    explanation: 'If diff === nums[i] (e.g. 6 - 3 = 3), map.get(3) returns index 0, which is the current element itself! You must ensure map.get(diff) !== i.'
  },
  {
    id: 'bug_3',
    title: 'Valid Parentheses: Unhandled Stack Underflow',
    difficulty: 'Medium',
    language: 'cpp',
    buggyCode: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') {
            st.push(c);
        } else {
            // BUG HERE: Calling st.top() on empty stack causes segmentation fault!
            char top = st.top();
            st.pop();
            if ((c == ')' && top != '(') ||
                (c == '}' && top != '{') ||
                (c == ']' && top != '[')) {
                return false;
            }
        }
    }
    return st.empty();
}`,
    buggyLine: 8,
    failingTestCase: 's = "]" -> Runtime Crash: Segmentation fault (stack::top called on empty stack)',
    hypothesisOptions: [
      'C++ stack cannot store char types',
      'No check for st.empty() before accessing st.top(), crashing on starting closing bracket',
      'String iterator is undefined for empty strings',
      'Need to use std::vector instead of std::stack'
    ],
    correctHypothesisIndex: 1,
    fixedCodeSnippet: 'if (st.empty()) return false;',
    explanation: 'If the string starts with a closing bracket like "]", st.top() attempts to dereference an empty container, resulting in an immediate core dump.'
  }
];

export default function ReverseDebuggerPage() {
  const [activeChallenge, setActiveChallenge] = useState<BugChallenge>(BUG_CHALLENGES[0]);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [selectedHypothesis, setSelectedHypothesis] = useState<number | null>(null);
  const [patchCode, setPatchCode] = useState(activeChallenge.fixedCodeSnippet);
  const [timeLeft, setTimeLeft] = useState(180);
  const [verificationResult, setVerificationResult] = useState<{ passed: boolean; message: string } | null>(null);

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const handleSelectChallenge = (c: BugChallenge) => {
    setActiveChallenge(c);
    setSelectedLine(null);
    setSelectedHypothesis(null);
    setPatchCode(c.fixedCodeSnippet);
    setVerificationResult(null);
    setTimeLeft(180);
  };

  const handleVerifyPatch = () => {
    if (selectedLine === null) {
      alert('Please click the buggy line in the code editor to pinpoint the defect.');
      return;
    }
    if (selectedHypothesis === null) {
      alert('Please choose your hypothesis from the forensic dropdown.');
      return;
    }

    const lineCorrect = selectedLine === activeChallenge.buggyLine;
    const hypCorrect = selectedHypothesis === activeChallenge.correctHypothesisIndex;

    if (lineCorrect && hypCorrect) {
      setVerificationResult({
        passed: true,
        message: '?? FLAW PINPOINTED & FIXED! All edge cases passed in 14ms. +350 Forensic Bug Hunter XP awarded!'
      });
    } else {
      setVerificationResult({
        passed: false,
        message: !lineCorrect ? `? Incorrect line pinpointed (Selected Line ${selectedLine}, but defect is elsewhere).` : '? Hypothesis incorrect: that is not the root mechanism of this failure.'
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
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
          <Link href="/code" style={{ textDecoration: 'none', color: '#00d4ff', fontSize: 13, fontWeight: 700 }}>
            ? Back to Code Studio
          </Link>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
          <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>???</span>
            <span>AI "Cheat-Proof" Reverse Debugger Arena</span>
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ padding: '6px 14px', borderRadius: 8, background: timeLeft < 30 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)', border: `1px solid ${timeLeft < 30 ? '#ef4444' : '#f59e0b'}`, color: timeLeft < 30 ? '#ef4444' : '#f59e0b', fontWeight: 700, fontFamily: 'JetBrains Mono', fontSize: 13 }}>
            ?? Timer: {formatTime(timeLeft)}
          </div>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, background: 'rgba(168,85,247,0.2)', color: '#c084fc', fontWeight: 700 }}>
            Forensic Coding Mode
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ flex: 1, padding: 20, display: 'grid', gridTemplateColumns: '320px 1fr 380px', gap: 16, maxWidth: 1700, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* LEFT COLUMN: Challenges List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Forensic Arena</span>
            <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white', margin: '4px 0' }}>
              Bug Injections
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
              AI tools write boilerplate code, but can you reverse-engineer a subtle production anomaly?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {BUG_CHALLENGES.map(c => (
              <button
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                style={{
                  padding: '12px 14px', borderRadius: 10, textAlign: 'left',
                  background: activeChallenge.id === c.id ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${activeChallenge.id === c.id ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  color: activeChallenge.id === c.id ? '#ef4444' : 'white', cursor: 'pointer', fontFamily: 'Outfit',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', color: '#ef4444', fontWeight: 700 }}>
                    {c.difficulty}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                    {c.language}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.title}</div>
              </button>
            ))}
          </div>

          {/* Failing Testcase Alert */}
          <div style={{ padding: 12, borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', marginTop: 'auto' }}>
            <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>?? CRITICAL RUNTIME FAILURE:</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'JetBrains Mono', lineHeight: 1.5 }}>
              {activeChallenge.failingTestCase}
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: Interactive Buggy Code Viewport */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700 }}>STEP 1: CLICK THE BUGGY LINE IN THE CODE</span>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Click on any line number to tag it as the root cause defect.</div>
            </div>
            {selectedLine && (
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#ef4444', color: '#fff', fontWeight: 700 }}>
                Selected: Line {selectedLine}
              </span>
            )}
          </div>

          {/* Code Viewer with Clickable Lines */}
          <div style={{
            flex: 1, minHeight: 380, borderRadius: 12, background: '#020408',
            border: '1px solid rgba(0,212,255,0.2)', padding: 12, overflowY: 'auto',
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: '24px',
          }}>
            {activeChallenge.buggyCode.split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const isSelected = selectedLine === lineNum;
              return (
                <div
                  key={lineNum}
                  onClick={() => setSelectedLine(lineNum)}
                  style={{
                    display: 'flex', gap: 12, cursor: 'pointer', padding: '1px 6px', borderRadius: 4,
                    background: isSelected ? 'rgba(239,68,68,0.25)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #ef4444' : '3px solid transparent',
                  }}
                >
                  <span style={{ width: 28, textAlign: 'right', color: isSelected ? '#ef4444' : 'rgba(255,255,255,0.3)', userSelect: 'none' }}>
                    {lineNum}
                  </span>
                  <span style={{ color: isSelected ? '#fff' : '#94a3b8' }}>{line}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Hypothesis & Patch Verification */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', padding: 18 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#f59e0b', margin: 0 }}>
            ?? Step 2: Formulate Hypothesis
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {activeChallenge.hypothesisOptions.map((h, i) => (
              <button
                key={i}
                onClick={() => setSelectedHypothesis(i)}
                style={{
                  padding: '10px 12px', borderRadius: 8, textAlign: 'left',
                  background: selectedHypothesis === i ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selectedHypothesis === i ? '#f59e0b' : 'rgba(255,255,255,0.06)'}`,
                  color: selectedHypothesis === i ? '#f59e0b' : 'rgba(255,255,255,0.8)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'Outfit',
                }}
              >
                {h}
              </button>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>STEP 3: PATCH CODE REPLACEMENT</span>
            <input
              type="text"
              value={patchCode}
              onChange={e => setPatchCode(e.target.value)}
              style={{
                width: '100%', marginTop: 6, padding: '8px 12px', borderRadius: 8,
                background: '#020408', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', fontFamily: 'JetBrains Mono', fontSize: 12, outline: 'none',
              }}
            />
          </div>

          <button
            onClick={handleVerifyPatch}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)', color: 'white',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13,
            }}
          >
            ? Test & Verify Forensic Fix
          </button>

          {verificationResult && (
            <div style={{
              padding: 12, borderRadius: 10,
              background: verificationResult.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${verificationResult.passed ? '#10b981' : '#ef4444'}`,
              fontSize: 12, lineHeight: 1.5, color: verificationResult.passed ? '#10b981' : '#ef4444',
            }}>
              {verificationResult.message}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
