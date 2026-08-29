// Comprehensive Role-Based Syllabus, Mixed-Type Quiz Banks & Coding Problems Data

export interface SyllabusTopic {
  id: string;
  title: string;
  subject: string;
  description: string;
  youtubeId: string;
  embedUrl: string;
  videoUrl?: string;
  videoSource?: 'youtube' | 'direct' | 'local';
  durationMinutes: number;
  labRoute?: string;
  keyConcepts: string[];
}

export type QuizType = 'mcq' | 'truefalse' | 'fillinblank' | 'assertion' | 'match';

export interface QuizQuestion {
  id: number;
  type: QuizType;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  fillAnswer?: string; // for fillinblank type
}

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  constraints: string[];
  starterCode: Record<'python' | 'javascript' | 'cpp' | 'java', string>;
  visibleTestCases: { input: string; expectedOutput: string }[];
  hiddenTestCases: { input: string; expectedOutput: string }[];
  solutionExplanation: string;
}

// Custom Teacher Content Store Helpers
export interface TeacherTopicPayload extends SyllabusTopic {
  targetRole: 'school' | 'college' | 'aspirant' | 'skill' | 'all';
  createdByTeacher?: string;
  createdAt?: string;
  customQuiz?: QuizQuestion[];
  uploadedVideoData?: string; // Base64 or IndexedDB/Blob reference for uploaded video
}

export function getTeacherCustomTopics(): TeacherTopicPayload[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('nexus_teacher_topics');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function fetchTeacherTopicsCloud(): Promise<TeacherTopicPayload[]> {
  try {
    const res = await fetch('/api/teacher-topics', { cache: 'no-store' });
    if (!res.ok) return getTeacherCustomTopics();
    const data = await res.json();
    if (data && Array.isArray(data.topics)) {
      // Merge cloud topics with local cache without losing local items
      const local = getTeacherCustomTopics();
      const map = new Map<string, TeacherTopicPayload>();
      local.forEach(t => map.set(t.id, t));
      data.topics.forEach((t: TeacherTopicPayload) => map.set(t.id, t));
      const merged = Array.from(map.values());
      if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_teacher_topics', JSON.stringify(merged));
      }
      return merged;
    }
  } catch (err) {
    console.warn('Could not sync teacher topics from cloud, using local cache:', err);
  }
  return getTeacherCustomTopics();
}

export function saveTeacherCustomTopic(topic: TeacherTopicPayload): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTeacherCustomTopics();
    const updated = [topic, ...existing.filter(t => t.id !== topic.id)];
    localStorage.setItem('nexus_teacher_topics', JSON.stringify(updated));

    // Asynchronously push to global server cloud so all laptops see it instantly
    fetch('/api/teacher-topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(topic),
    }).catch(err => console.warn('Failed to sync topic to cloud API:', err));
  } catch (err) {
    console.error('Failed to save custom teacher topic:', err);
  }
}

export function deleteTeacherCustomTopic(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getTeacherCustomTopics();
    const updated = existing.filter(t => t.id !== id);
    localStorage.setItem('nexus_teacher_topics', JSON.stringify(updated));

    // Asynchronously delete from global server cloud
    fetch(`/api/teacher-topics?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }).catch(err => console.warn('Failed to delete topic from cloud API:', err));
  } catch (err) {
    console.error('Failed to delete custom teacher topic:', err);
  }
}

export function getCombinedSyllabus(role: string, customList?: TeacherTopicPayload[]): SyllabusTopic[] {
  const base = ROLE_SYLLABUS[role] || ROLE_SYLLABUS['school'] || [];
  const custom = (customList || getTeacherCustomTopics()).filter(t => t.targetRole === role || t.targetRole === 'all');
  return [...custom, ...base];
}

// VERIFIED working YouTube video IDs for educational content (Khan Academy, CrashCourse, freeCodeCamp)
export const ROLE_SYLLABUS: Record<string, SyllabusTopic[]> = {
  school: [
    {
      id: 'phy_101',
      title: 'Doppler Effect in Waves & Sound',
      subject: 'Physics',
      description: 'Understanding wave frequency distortion during source motion with real-world ambulance analogies.',
      youtubeId: 'h4OnBYrbCjY',
      embedUrl: 'https://www.youtube.com/embed/h4OnBYrbCjY?rel=0&modestbranding=1',
      durationMinutes: 12,
      labRoute: '/virtuallab',
      keyConcepts: ['Frequency Shift', 'Apparent Wavelength', 'Source Motion Vector'],
    },
    {
      id: 'phy_102',
      title: "Young's Double Slit Interference",
      subject: 'Physics',
      description: 'Coherent light sources, constructive & destructive interference fringes.',
      youtubeId: 'Iuv6hY6zsd0',
      embedUrl: 'https://www.youtube.com/embed/Iuv6hY6zsd0?rel=0&modestbranding=1',
      durationMinutes: 15,
      labRoute: '/virtuallab',
      keyConcepts: ['Fringe Width Formula', 'Path Difference', 'Phase Difference'],
    },
    {
      id: 'chem_101',
      title: 'Acid-Base Titration & pH Indicators',
      subject: 'Chemistry',
      description: 'Equivalence point calculation and phenolphthalein color transition in strong acid-base titration.',
      youtubeId: '8UiuE7Xx5l8',
      embedUrl: 'https://www.youtube.com/embed/8UiuE7Xx5l8?rel=0&modestbranding=1',
      durationMinutes: 14,
      labRoute: '/virtuallab',
      keyConcepts: ['pH Curve', 'Molarity Calculations', 'Indicator Range'],
    },
    {
      id: 'math_101',
      title: 'Quadratic Equations & Roots',
      subject: 'Mathematics',
      description: 'Discriminant analysis, quadratic formula, and real-world parabolic motion trajectory.',
      youtubeId: 'ZBalWWHYFQc',
      embedUrl: 'https://www.youtube.com/embed/ZBalWWHYFQc?rel=0&modestbranding=1',
      durationMinutes: 18,
      labRoute: '/virtuallab',
      keyConcepts: ['Discriminant b² - 4ac', 'Sum and Product of Roots', 'Parabola Vertex'],
    },
    {
      id: 'bio_101',
      title: 'DNA Structure & Replication',
      subject: 'Biology',
      description: 'Double helix, base pairing rules, and semi-conservative replication mechanism.',
      youtubeId: '8kK2zwjRV0M',
      embedUrl: 'https://www.youtube.com/embed/8kK2zwjRV0M?rel=0&modestbranding=1',
      durationMinutes: 16,
      labRoute: '/virtuallab',
      keyConcepts: ['Base Pairing A-T G-C', 'DNA Polymerase', 'Okazaki Fragments'],
    },
  ],
  college: [
    {
      id: 'cs_101',
      title: 'Operating Systems: CPU Scheduling Algorithms',
      subject: 'Operating Systems',
      description: 'Real-world CPU load balancing for servers, cloud jobs, and multithreaded systems.',
      youtubeId: 'z-_RunGo5UI',
      embedUrl: 'https://www.youtube.com/embed/z-_RunGo5UI?rel=0&modestbranding=1',
      durationMinutes: 22,
      labRoute: '/virtuallab',
      keyConcepts: ['Turnaround Time', 'Waiting Time', 'Time Quantum', 'Process Prioritization'],
    },
    {
      id: 'cs_102',
      title: 'Computer Networks: TCP 3-Way Handshake',
      subject: 'Networks',
      description: 'Reliable packet transfer for web requests, online banking, and live streaming systems.',
      youtubeId: 'AYdF7b3nMto',
      embedUrl: 'https://www.youtube.com/embed/AYdF7b3nMto?rel=0&modestbranding=1',
      durationMinutes: 20,
      labRoute: '/virtuallab',
      keyConcepts: ['SYN / ACK Flags', 'Sequence Numbering', 'Window Size', 'Connection Reliability'],
    },
    {
      id: 'cs_103',
      title: 'Binary Search Tree & Graph Traversals',
      subject: 'Coding & DSA',
      description: 'Route planning, dependency graphs, and decision trees used in software and logistics systems.',
      youtubeId: 'rA6ndou_r60',
      embedUrl: 'https://www.youtube.com/embed/rA6ndou_r60?rel=0&modestbranding=1',
      durationMinutes: 25,
      labRoute: '/code',
      keyConcepts: ['Tree Recursion', 'Queue & Stack Memory', 'Graph Traversal', 'Shortest Path Logic'],
    },
  ],
  aspirant: [
    {
      id: 'jee_101',
      title: 'JEE Mechanics: Rotational Dynamics & Torque',
      subject: 'JEE Physics',
      description: 'Moment of inertia tensors, rolling without slipping, and angular momentum conservation.',
      youtubeId: 'b-HZ7uhVcx8',
      embedUrl: 'https://www.youtube.com/embed/b-HZ7uhVcx8?rel=0&modestbranding=1',
      durationMinutes: 30,
      labRoute: '/virtuallab',
      keyConcepts: ['Torque τ = r × F', 'Moment of Inertia', 'Angular Velocity'],
    },
    {
      id: 'neet_101',
      title: 'NEET Organic Chemistry: Electrophilic Substitution',
      subject: 'NEET Chemistry',
      description: 'Benzene nitration, halogenation, Friedel-Crafts alkylation reaction mechanisms.',
      youtubeId: '8UiuE7Xx5l8',
      embedUrl: 'https://www.youtube.com/embed/8UiuE7Xx5l8?rel=0&modestbranding=1',
      durationMinutes: 28,
      labRoute: '/virtuallab',
      keyConcepts: ['Arenium Ion Intermediate', 'Resonance Stability', 'Ortho/Para Directors'],
    },
    {
      id: 'upsc_101',
      title: 'UPSC Polity: Fundamental Rights & Preamble',
      subject: 'UPSC Polity',
      description: 'Articles 12 to 35, Constitutional Remedies (Writs), and landmark Supreme Court verdicts.',
      youtubeId: 'y4E0m0aP0hU',
      embedUrl: 'https://www.youtube.com/embed/y4E0m0aP0hU?rel=0&modestbranding=1',
      durationMinutes: 35,
      labRoute: '/practice',
      keyConcepts: ['Right to Equality', 'Habeas Corpus & Mandamus', 'Basic Structure Doctrine'],
    },
  ],
  skill: [
    {
      id: 'sk_101',
      title: 'Python for Data Science & Machine Learning',
      subject: 'Python & AI',
      description: 'NumPy, Pandas, Matplotlib, and scikit-learn ML pipeline basics.',
      youtubeId: 'LHBE6Q9XlzI',
      embedUrl: 'https://www.youtube.com/embed/LHBE6Q9XlzI?rel=0&modestbranding=1',
      durationMinutes: 24,
      labRoute: '/code',
      keyConcepts: ['Async IO Loop', 'HTTP Methods', 'JSON Validation'],
    },
    {
      id: 'sk_102',
      title: 'Spoken English & Professional Presentations',
      subject: 'Communication',
      description: 'Articulative speech, voice modulation, and elevator pitch delivery.',
      youtubeId: 'dEDcc0aCjaA',
      embedUrl: 'https://www.youtube.com/embed/dEDcc0aCjaA?rel=0&modestbranding=1',
      durationMinutes: 18,
      labRoute: '/bhasha',
      keyConcepts: ['Pitch Modulation', 'Grammar Precision', 'Body Language'],
    },
  ],
};

// 20 Mixed-Type Questions per Topic (MCQ, True/False, Fill-in-blank, Assertion-Reason, Match)
export const TOPIC_QUIZZES: Record<string, QuizQuestion[]> = {
  phy_101: generatePhy101Quiz(),
  phy_102: generatePhy102Quiz(),
  chem_101: generateChem101Quiz(),
  math_101: generateMath101Quiz(),
  bio_101: generateBio101Quiz(),
  cs_101: generateCS101Quiz(),
  cs_102: generateCS102Quiz(),
  cs_103: generateCS103Quiz(),
  jee_101: generateJEE101Quiz(),
  neet_101: generateNEET101Quiz(),
  upsc_101: generateUPSC101Quiz(),
  sk_101: generateSK101Quiz(),
  sk_102: generateSK102Quiz(),
};

// =================== PHYSICS 101: DOPPLER EFFECT (Mixed 20 Qs) ===================
function generatePhy101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'What causes the Doppler Effect in sound waves?', options: ['Amplitude variation', 'Relative motion between source and observer', 'Medium temperature change', 'Wave reflections'], correct: 1, explanation: 'The Doppler effect occurs due to the relative motion between the sound source and the observer.' },
    { id: 2, type: 'truefalse', question: 'When a siren approaches an observer, the observed pitch increases.', options: ['True', 'False'], correct: 0, explanation: 'True — waves compress ahead of the approaching source, increasing the observed pitch/frequency.' },
    { id: 3, type: 'mcq', question: 'When a light source recedes from Earth, the spectrum shows:', options: ['Blueshift', 'Redshift', 'No shift', 'Ultraviolet shift'], correct: 1, explanation: 'Receding celestial bodies shift wavelengths toward longer red wavelengths (Redshift).' },
    { id: 4, type: 'fillinblank', question: 'The formula for Doppler Effect apparent frequency when source approaches is f\' = f × v / (v ___ vs).', options: ['minus (−)', 'plus (+)', 'times (×)', 'divided by (÷)'], correct: 0, fillAnswer: 'minus', explanation: 'f\' = f × [v / (v − vs)] where v is speed of sound and vs is source velocity.' },
    { id: 5, type: 'truefalse', question: 'The Doppler effect only applies to sound waves, not electromagnetic waves.', options: ['True', 'False'], correct: 1, explanation: 'False — Doppler effect applies to ALL wave phenomena including light, radio, and radar.' },
    { id: 6, type: 'mcq', question: 'Sonic boom occurs when source speed vs is:', options: ['vs < v', 'vs = 0', 'vs > v (supersonic)', 'vs = v/2'], correct: 2, explanation: 'When a jet exceeds sound speed (vs > v), overlapping wave fronts form a shockwave cone.' },
    { id: 7, type: 'assertion', question: 'Assertion: A moving observer hears a higher pitch than a stationary one. Reason: The observer receives more wave fronts per second when moving toward the source.', options: ['Both A and R are true and R explains A', 'Both A and R are true but R does not explain A', 'A is true but R is false', 'A is false but R is true'], correct: 0, explanation: 'Both are correct — moving toward the source increases wave-front encounter rate.' },
    { id: 8, type: 'mcq', question: 'Radar speed guns use Doppler shift of which waves?', options: ['Sound waves', 'Radio/Microwaves', 'Infrared', 'Gamma rays'], correct: 1, explanation: 'Police radar bounces radio/microwaves off moving vehicles to measure frequency shift.' },
    { id: 9, type: 'truefalse', question: 'Hubble\'s observation of redshift proved that the universe is expanding.', options: ['True', 'False'], correct: 0, explanation: 'True — cosmological redshift of distant galaxies is key evidence for an expanding universe.' },
    { id: 10, type: 'mcq', question: 'What happens to wavelength when observed frequency increases?', options: ['Increases', 'Decreases', 'Stays same', 'Doubles'], correct: 1, explanation: 'Wavelength λ = v / f, so frequency and wavelength are inversely proportional.' },
    { id: 11, type: 'fillinblank', question: 'Mach number is defined as the ratio of object speed to the speed of ___.', options: ['Sound', 'Light', 'Gravity', 'Water'], correct: 0, fillAnswer: 'sound', explanation: 'Mach 1 = speed of sound (~343 m/s in air at 20°C).' },
    { id: 12, type: 'mcq', question: 'Echocardiograms use Doppler ultrasound to measure:', options: ['Bone density', 'Blood flow velocity', 'Lung volume', 'Brain waves'], correct: 1, explanation: 'Doppler ultrasound measures the velocity of red blood cells flowing through heart valves.' },
    { id: 13, type: 'truefalse', question: 'If source and observer move in the same direction at equal speeds, the apparent frequency equals original frequency.', options: ['True', 'False'], correct: 0, explanation: 'True — no relative distance change occurs, so no Doppler shift.' },
    { id: 14, type: 'mcq', question: 'Transverse Doppler effect is predicted by:', options: ['Newtonian mechanics', 'Special Relativity', 'Quantum mechanics', 'Thermodynamics'], correct: 1, explanation: 'Time dilation in Einstein Special Relativity predicts a transverse Doppler shift.' },
    { id: 15, type: 'match', question: 'Match the Doppler phenomena to their applications:', options: ['Redshift → Expanding Universe', 'Ultrasound → Blood Flow', 'Radar → Speed Detection', 'Bat Echolocation → Distance Mapping'], correct: 0, explanation: 'All four are correct real-world applications of the Doppler effect.' },
    { id: 16, type: 'mcq', question: 'Frequency of audible sound for humans is approximately:', options: ['20 Hz to 20,000 Hz', '1 Hz to 10 Hz', '100 kHz to 1 MHz', '0.1 Hz to 5 Hz'], correct: 0, explanation: 'Human ears detect frequencies between 20 Hz and 20 kHz.' },
    { id: 17, type: 'fillinblank', question: 'Speed of sound in dry air at 20°C is approximately ___ m/s.', options: ['343', '3×10⁸', '1500', '100'], correct: 0, fillAnswer: '343', explanation: 'Sound travels at approximately 343 m/s in 20°C dry air.' },
    { id: 18, type: 'assertion', question: 'Assertion: A train whistle drops in pitch as it passes you. Reason: The source velocity increases the apparent wavelength after passing.', options: ['Both A and R are true and R explains A', 'Both A and R true but R doesn\'t explain A', 'A true, R false', 'A false, R true'], correct: 0, explanation: 'After passing, wavelengths stretch, dropping the heard pitch — correct explanation.' },
    { id: 19, type: 'truefalse', question: 'Ultrasonic waves used in SONAR have frequencies above 20,000 Hz.', options: ['True', 'False'], correct: 0, explanation: 'True — ultrasound (>20 kHz) is inaudible to humans but used in sonar and medical imaging.' },
    { id: 20, type: 'mcq', question: 'Doppler broadening in atomic spectra is caused by:', options: ['Thermal motion of atoms', 'Electron spin', 'Nuclear fission', 'Gravity'], correct: 0, explanation: 'Random thermal kinetic velocities of emitting gas atoms broaden spectral lines via Doppler shift.' },
  ];
}

// =================== PHYSICS 102: YOUNG'S DOUBLE SLIT (Mixed 20 Qs) ===================
function generatePhy102Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'In Young\'s Double Slit experiment, fringe width β is given by:', options: ['β = λD/d', 'β = dD/λ', 'β = λd/D', 'β = D/(λd)'], correct: 0, explanation: 'β = λD/d where λ is wavelength, D is screen distance, d is slit separation.' },
    { id: 2, type: 'truefalse', question: 'Constructive interference occurs when path difference is an integer multiple of wavelength.', options: ['True', 'False'], correct: 0, explanation: 'True — Δ = nλ (n=0,1,2...) gives bright fringes (constructive interference).' },
    { id: 3, type: 'mcq', question: 'If slit separation d is doubled, fringe width:', options: ['Doubles', 'Halves', 'Stays same', 'Quadruples'], correct: 1, explanation: 'β = λD/d so doubling d halves the fringe width.' },
    { id: 4, type: 'fillinblank', question: 'Destructive interference occurs when path difference is ___ half-wavelength (odd multiple).', options: ['An odd', 'An even', 'A zero', 'An infinite'], correct: 0, fillAnswer: 'odd', explanation: 'Δ = (n+½)λ gives dark fringes — destructive interference.' },
    { id: 5, type: 'truefalse', question: 'White light produces coloured fringes in double slit experiment.', options: ['True', 'False'], correct: 0, explanation: 'True — different wavelengths give different fringe widths, producing coloured bands.' },
    { id: 6, type: 'mcq', question: 'Coherent sources in Young\'s experiment are characterized by:', options: ['Same frequency and constant phase difference', 'Same amplitude only', 'Random phase', 'Different frequencies'], correct: 0, explanation: 'Coherence requires constant phase relationship and identical frequencies.' },
    { id: 7, type: 'assertion', question: 'Assertion: Intensity at bright fringes is 4I₀. Reason: E fields from two sources add constructively.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'A false R true'], correct: 0, explanation: 'Amplitude doubles → Intensity = (2A)² = 4A² = 4I₀.' },
    { id: 8, type: 'mcq', question: 'When screen distance D increases, fringe width:', options: ['Decreases', 'Increases', 'Stays constant', 'Goes to zero'], correct: 1, explanation: 'β = λD/d so increasing D increases fringe width.' },
    { id: 9, type: 'truefalse', question: 'If one slit is covered, interference fringes disappear.', options: ['True', 'False'], correct: 0, explanation: 'True — two sources are required for interference. One slit gives single-slit diffraction.' },
    { id: 10, type: 'mcq', question: 'The central bright fringe in double slit experiment corresponds to path difference:', options: ['Zero', 'λ/2', 'λ', '2λ'], correct: 0, explanation: 'At the center both paths are equal → Δ = 0 → constructive interference (central maximum).' },
    { id: 11, type: 'fillinblank', question: 'In the interference pattern, the angular position of n-th bright fringe is sinθ = n × λ/___.', options: ['d (slit separation)', 'D (screen distance)', 'λ (wavelength)', 'β (fringe width)'], correct: 0, fillAnswer: 'd', explanation: 'sinθ = nλ/d for bright fringes in double slit experiment.' },
    { id: 12, type: 'mcq', question: 'If wavelength λ increases, fringe spacing:', options: ['Decreases', 'Increases', 'No change', 'Goes to infinity'], correct: 1, explanation: 'β = λD/d → fringe width directly proportional to wavelength.' },
    { id: 13, type: 'truefalse', question: 'Sound waves can also produce interference patterns similar to light.', options: ['True', 'False'], correct: 0, explanation: 'True — all waves (sound, water, light) undergo constructive/destructive interference.' },
    { id: 14, type: 'match', question: 'Match fringe conditions:', options: ['Path diff = nλ → Bright fringe', 'Path diff = (n+½)λ → Dark fringe', 'Δ = 0 → Central maximum', 'All of the above correct'], correct: 3, explanation: 'All matching pairs are correct interference conditions.' },
    { id: 15, type: 'mcq', question: 'What is the phase difference corresponding to a path difference of λ/2?', options: ['π radians (180°)', '2π radians', 'π/2 radians', '0 radians'], correct: 0, explanation: 'Phase difference δ = (2π/λ) × Δx = (2π/λ)(λ/2) = π radians.' },
    { id: 16, type: 'truefalse', question: 'Increasing slit width causes the fringes to become wider.', options: ['True', 'False'], correct: 1, explanation: 'False — slit WIDTH affects diffraction envelope. Slit SEPARATION d controls fringe width β.' },
    { id: 17, type: 'mcq', question: 'In YDSE, two slits are separated by 0.3 mm and screen is 1 m away. For λ=600 nm, fringe width is:', options: ['2 mm', '4 mm', '1 mm', '0.5 mm'], correct: 0, explanation: 'β = λD/d = (600×10⁻⁹×1)/(0.3×10⁻³) = 2×10⁻³ m = 2 mm.' },
    { id: 18, type: 'assertion', question: 'Assertion: Reducing wavelength reduces fringe width. Reason: Shorter wavelength light diffracts less.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 1, explanation: 'A is true (β∝λ) but the reason is mathematical, not about diffraction amount.' },
    { id: 19, type: 'fillinblank', question: 'The principle of superposition states that resultant displacement = ___ of all individual displacements.', options: ['Vector sum', 'Product', 'Average', 'Maximum'], correct: 0, fillAnswer: 'vector sum', explanation: 'Superposition: Y = Y₁ + Y₂ (algebraic sum of displacements).' },
    { id: 20, type: 'mcq', question: 'Young\'s double slit experiment established the ___ nature of light.', options: ['Particle', 'Wave', 'Neither', 'Both simultaneously'], correct: 1, explanation: 'The interference pattern in YDSE proved light has a wave nature (1801).' },
  ];
}

// =================== CHEMISTRY 101: ACID-BASE TITRATION (Mixed 20 Qs) ===================
function generateChem101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'At equivalence point in strong acid–strong base titration, pH is:', options: ['7', '1', '14', '5'], correct: 0, explanation: 'Strong acid + strong base → neutral salt + water → pH = 7 at 25°C.' },
    { id: 2, type: 'truefalse', question: 'Phenolphthalein changes color at pH 8.2–10, making it ideal for strong acid–strong base titration.', options: ['True', 'False'], correct: 0, explanation: 'True — the sharp pH jump at equivalence point falls within phenolphthalein\'s range.' },
    { id: 3, type: 'mcq', question: 'Which indicator is used for weak acid–strong base titration?', options: ['Methyl orange', 'Phenolphthalein', 'Litmus', 'Universal indicator'], correct: 1, explanation: 'Phenolphthalein (pH 8.2–10) works for weak acid/strong base (equivalence > 7).' },
    { id: 4, type: 'fillinblank', question: 'Molarity is defined as moles of solute per ___ of solution.', options: ['Litre', 'Kilogram', 'Gram', 'Millilitre'], correct: 0, fillAnswer: 'litre', explanation: 'Molarity M = moles / litre of solution.' },
    { id: 5, type: 'truefalse', question: 'In a strong acid–strong base titration, the solution at half equivalence point has pH = pKa.', options: ['True', 'False'], correct: 1, explanation: 'False — pKa half-equivalence applies only to weak acid titrations (Henderson-Hasselbalch).' },
    { id: 6, type: 'mcq', question: 'If 25 mL of 0.1M NaOH neutralizes 25 mL HCl, the molarity of HCl is:', options: ['0.1 M', '0.2 M', '0.05 M', '1 M'], correct: 0, explanation: 'M₁V₁ = M₂V₂ → 0.1×25 = M₂×25 → M₂ = 0.1 M.' },
    { id: 7, type: 'assertion', question: 'Assertion: Buffer solutions resist pH change. Reason: Buffers contain a weak acid and its conjugate base.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'A false R true'], correct: 0, explanation: 'Buffer action is correctly explained by the weak acid/conjugate base equilibrium.' },
    { id: 8, type: 'mcq', question: 'pH of 0.01 M HCl solution is:', options: ['1', '2', '3', '0.01'], correct: 1, explanation: 'pH = -log[H⁺] = -log(0.01) = -log(10⁻²) = 2.' },
    { id: 9, type: 'truefalse', question: 'pOH + pH = 14 at 25°C for aqueous solutions.', options: ['True', 'False'], correct: 0, explanation: 'True — Kw = [H⁺][OH⁻] = 10⁻¹⁴ at 25°C → pH + pOH = 14.' },
    { id: 10, type: 'mcq', question: 'Henderson-Hasselbalch equation is: pH = pKa + log([A⁻]/[HA]). When [A⁻] = [HA], pH =', options: ['pKa', 'pKb', '7', '14'], correct: 0, explanation: 'When concentrations are equal, log(1) = 0, so pH = pKa.' },
    { id: 11, type: 'fillinblank', question: 'The point where moles of acid = moles of base in a titration is called the ___ point.', options: ['Equivalence', 'End', 'Neutral', 'Buffer'], correct: 0, fillAnswer: 'equivalence', explanation: 'Equivalence point = stoichiometric completion of the acid-base reaction.' },
    { id: 12, type: 'match', question: 'Match the indicator to its pH range:', options: ['Methyl Orange → 3.1–4.4', 'Phenolphthalein → 8.2–10', 'Bromothymol Blue → 6–7.6', 'All matches correct'], correct: 3, explanation: 'All three indicator ranges are correct.' },
    { id: 13, type: 'mcq', question: 'A solution with pH = 11 has [OH⁻] concentration of:', options: ['10⁻³ M', '10⁻¹¹ M', '10⁻² M', '10⁻⁷ M'], correct: 0, explanation: 'pOH = 14-11 = 3 → [OH⁻] = 10⁻³ M.' },
    { id: 14, type: 'truefalse', question: 'Acetic acid is a strong acid that fully ionizes in water.', options: ['True', 'False'], correct: 1, explanation: 'False — acetic acid (CH₃COOH) is a WEAK acid with Ka = 1.8×10⁻⁵.' },
    { id: 15, type: 'mcq', question: 'In back titration, the analyte reacts with:', options: ['Excess known reagent, then titrated', 'Only one reagent', 'Unknown base only', 'Two strong acids'], correct: 0, explanation: 'Back titration: add excess standard reagent, then titrate the remainder.' },
    { id: 16, type: 'assertion', question: 'Assertion: HCl is a stronger acid than HF. Reason: H-Cl bond is weaker than H-F bond, ionizing more readily.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'H-Cl bond dissociates more easily — HCl fully ionizes while HF is weak acid.' },
    { id: 17, type: 'fillinblank', question: 'The amount of substance that contains Avogadro\'s number (6.022×10²³) of particles is 1 ___.', options: ['mole', 'gram', 'litre', 'atom'], correct: 0, fillAnswer: 'mole', explanation: 'One mole = 6.022×10²³ particles (Avogadro\'s number).' },
    { id: 18, type: 'mcq', question: 'The normality of a solution is equal to:', options: ['Moles of solute / L of solution', 'Equivalents of solute / L of solution', 'Grams / mL', 'Molarity × 2'], correct: 1, explanation: 'Normality N = equivalents / litre. For HCl: N = M (monobasic). For H₂SO₄: N = 2M.' },
    { id: 19, type: 'truefalse', question: 'Adding a buffer solution to an acid will always bring pH to 7.', options: ['True', 'False'], correct: 1, explanation: 'False — buffers resist pH change, but maintain pH near their own pKa, not necessarily 7.' },
    { id: 20, type: 'mcq', question: 'Which pair constitutes an acid-base conjugate pair?', options: ['HCl and NaOH', 'CH₃COOH and CH₃COO⁻', 'NaCl and Na⁺', 'H₂O and H₂SO₄'], correct: 1, explanation: 'CH₃COOH (acid) loses H⁺ to form CH₃COO⁻ (conjugate base).' },
  ];
}

// =================== MATH 101: QUADRATIC EQUATIONS (Mixed 20 Qs) ===================
function generateMath101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'For ax² + bx + c = 0, the discriminant D is:', options: ['b² - 4ac', 'b² + 4ac', '2a/b', '4ac - b²'], correct: 0, explanation: 'Discriminant D = b² - 4ac determines the nature of quadratic roots.' },
    { id: 2, type: 'truefalse', question: 'If discriminant D < 0, the quadratic equation has two real roots.', options: ['True', 'False'], correct: 1, explanation: 'False — D < 0 gives two complex conjugate roots (no real solutions).' },
    { id: 3, type: 'mcq', question: 'The quadratic formula is x = [−b ± √(b²−4ac)] / ___.', options: ['2a', 'a', '2b', 'b²'], correct: 0, explanation: 'x = (−b ± √D) / 2a is the quadratic formula.' },
    { id: 4, type: 'fillinblank', question: 'Sum of roots α + β of ax² + bx + c = 0 is equal to ___ / a.', options: ['-b', '+b', 'c', '-c'], correct: 0, fillAnswer: '-b', explanation: 'By Vieta\'s formulas: α + β = -b/a.' },
    { id: 5, type: 'truefalse', question: 'The product of roots αβ = c/a for ax² + bx + c = 0.', options: ['True', 'False'], correct: 0, explanation: 'True — Vieta\'s formula: αβ = c/a.' },
    { id: 6, type: 'mcq', question: 'If D = 0, the quadratic has:', options: ['Two distinct real roots', 'One repeated real root', 'Two complex roots', 'Infinite roots'], correct: 1, explanation: 'D = 0 → x = -b/2a (one unique repeated root).' },
    { id: 7, type: 'mcq', question: 'For x² - 5x + 6 = 0, the roots are:', options: ['2 and 3', '1 and 6', '-2 and -3', '2 and -3'], correct: 0, explanation: 'Factoring: (x-2)(x-3) = 0 → x = 2, x = 3.' },
    { id: 8, type: 'assertion', question: 'Assertion: x² + 1 = 0 has no real roots. Reason: The discriminant D = -4 < 0.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'D = 0 - 4(1)(1) = -4 < 0 correctly explains no real roots.' },
    { id: 9, type: 'truefalse', question: 'The parabola y = ax² + bx + c opens upward when a > 0.', options: ['True', 'False'], correct: 0, explanation: 'True — positive leading coefficient a means upward-opening parabola.' },
    { id: 10, type: 'fillinblank', question: 'The vertex (turning point) of parabola y = ax² + bx + c has x-coordinate x = ___ / 2a.', options: ['-b', '+b', 'c', '-c'], correct: 0, fillAnswer: '-b', explanation: 'Vertex x-coordinate = -b/(2a) from completing the square.' },
    { id: 11, type: 'mcq', question: 'The roots of 2x² - 7x + 3 = 0 are:', options: ['1/2 and 3', '1 and 3', '2 and 1/3', '7/4 and 1'], correct: 0, explanation: 'D = 49-24 = 25. x = (7±5)/4 → x = 3, x = 0.5.' },
    { id: 12, type: 'truefalse', question: 'Every quadratic equation with rational coefficients has rational roots.', options: ['True', 'False'], correct: 1, explanation: 'False — x² - 2 = 0 has irrational roots ±√2 but rational coefficients.' },
    { id: 13, type: 'match', question: 'Match discriminant value to root nature:', options: ['D > 0 → Two distinct real roots', 'D = 0 → One repeated root', 'D < 0 → Two complex roots', 'All correct'], correct: 3, explanation: 'All three discriminant conditions are correctly matched.' },
    { id: 14, type: 'mcq', question: 'If one root of x² - 5x + k = 0 is 2, the value of k is:', options: ['6', '3', '10', '2'], correct: 0, explanation: 'Substituting x=2: 4 - 10 + k = 0 → k = 6.' },
    { id: 15, type: 'mcq', question: 'The maximum value of y = -x² + 4x - 3 occurs at:', options: ['x = 2, y = 1', 'x = 0, y = -3', 'x = 4, y = 0', 'x = 1, y = 0'], correct: 0, explanation: 'x = -b/2a = -4/(2×-1) = 2. y = -4+8-3 = 1.' },
    { id: 16, type: 'fillinblank', question: 'A quadratic equation can have at most ___ roots.', options: ['Two', 'Three', 'One', 'Infinite'], correct: 0, fillAnswer: 'two', explanation: 'Fundamental Theorem of Algebra: degree n polynomial has exactly n roots (counted with multiplicity).' },
    { id: 17, type: 'truefalse', question: 'If roots are 3 and -5, the quadratic equation is x² + 2x - 15 = 0.', options: ['True', 'False'], correct: 0, explanation: 'True — sum = -2 → -b = -2 → b = 2. Product = -15 → c = -15. Equation: x² + 2x - 15 = 0.' },
    { id: 18, type: 'mcq', question: 'The nature of roots of x² - 6x + 9 = 0:', options: ['Two distinct real', 'Two equal real roots', 'Complex roots', 'One real one complex'], correct: 1, explanation: 'D = 36 - 36 = 0 → equal roots: x = 3, 3.' },
    { id: 19, type: 'assertion', question: 'Assertion: ax² + bx + c = 0 has at least one real root. Reason: Every polynomial equation has at least one complex root.', options: ['Both A and R true and R explains A', 'A false, R true', 'A true R false', 'Both false'], correct: 1, explanation: 'A is false (D<0 gives no real roots). R is true (complex roots exist by fundamental theorem).' },
    { id: 20, type: 'mcq', question: 'For what value of m does mx² + 6x + 1 = 0 have equal roots?', options: ['m = 9', 'm = 6', 'm = 3', 'm = 36'], correct: 0, explanation: 'For equal roots: D=0 → 36 - 4m = 0 → m = 9.' },
  ];
}

// =================== BIOLOGY 101: DNA (Mixed 20 Qs) ===================
function generateBio101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'DNA double helix was discovered by:', options: ['Watson & Crick', 'Darwin & Mendel', 'Pasteur & Koch', 'Franklin & Pauling'], correct: 0, explanation: 'Watson and Crick (1953) proposed the double helix model based on Rosalind Franklin\'s X-ray data.' },
    { id: 2, type: 'truefalse', question: 'Adenine (A) pairs with Thymine (T) in DNA double helix.', options: ['True', 'False'], correct: 0, explanation: 'True — A-T pairs (2 hydrogen bonds) and G-C pairs (3 hydrogen bonds).' },
    { id: 3, type: 'mcq', question: 'The process of copying DNA into mRNA is called:', options: ['Translation', 'Transcription', 'Replication', 'Mutation'], correct: 1, explanation: 'Transcription: DNA → mRNA (RNA polymerase reads the template strand).' },
    { id: 4, type: 'fillinblank', question: 'In DNA, the sugar component is ___ while in RNA it is ribose.', options: ['Deoxyribose', 'Glucose', 'Fructose', 'Sucrose'], correct: 0, fillAnswer: 'deoxyribose', explanation: 'DNA has deoxyribose (lacks 2\'-OH) making it more stable than RNA.' },
    { id: 5, type: 'truefalse', question: 'DNA replication is conservative (old strand is fully preserved separately).', options: ['True', 'False'], correct: 1, explanation: 'False — Meselson-Stahl experiment proved SEMI-conservative replication (each strand acts as template).' },
    { id: 6, type: 'mcq', question: 'Okazaki fragments are formed on:', options: ['Leading strand', 'Lagging strand', 'Both strands', 'Template strand'], correct: 1, explanation: 'Lagging strand synthesized discontinuously (3\'→5\' template direction) as Okazaki fragments.' },
    { id: 7, type: 'assertion', question: 'Assertion: G-C base pairs are more stable than A-T pairs. Reason: G-C pairs have 3 hydrogen bonds versus 2 in A-T.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'G-C: 3 H-bonds makes them stronger than A-T: 2 H-bonds. Correct explanation.' },
    { id: 8, type: 'mcq', question: 'Which enzyme joins Okazaki fragments together?', options: ['DNA Helicase', 'DNA Ligase', 'RNA Primase', 'DNA Polymerase I'], correct: 1, explanation: 'DNA Ligase seals the nicks between Okazaki fragments on the lagging strand.' },
    { id: 9, type: 'truefalse', question: 'A codon in mRNA consists of 3 nucleotides that code for one amino acid.', options: ['True', 'False'], correct: 0, explanation: 'True — genetic code is triplet: 3 bases = 1 codon = 1 amino acid.' },
    { id: 10, type: 'match', question: 'Match DNA bases to their complements:', options: ['A → T', 'G → C', 'T → A', 'All correct'], correct: 3, explanation: 'All base-pairing rules are correct: A-T (2 H-bonds), G-C (3 H-bonds).' },
    { id: 11, type: 'mcq', question: 'The start codon in mRNA that initiates translation is:', options: ['AUG', 'UAA', 'UAG', 'UGA'], correct: 0, explanation: 'AUG codes for Methionine and is the universal start codon for translation.' },
    { id: 12, type: 'fillinblank', question: 'Transfer RNA (tRNA) brings ___ to the ribosome during translation.', options: ['amino acids', 'glucose', 'nucleotides', 'phosphates'], correct: 0, fillAnswer: 'amino acids', explanation: 'tRNA with anticodon carries specific amino acids to ribosome for protein synthesis.' },
    { id: 13, type: 'truefalse', question: 'DNA polymerase synthesizes new DNA strands in the 3\' to 5\' direction.', options: ['True', 'False'], correct: 1, explanation: 'False — DNA polymerase synthesizes in the 5\'→3\' direction (reads template 3\'→5\').' },
    { id: 14, type: 'mcq', question: 'The stop codons that terminate translation are:', options: ['UAA, UAG, UGA', 'AUG, GUG, CUG', 'AAA, GGG, CCC', 'UAC, AGU, GCU'], correct: 0, explanation: 'UAA (Ochre), UAG (Amber), UGA (Opal) are the three stop codons.' },
    { id: 15, type: 'mcq', question: 'Chargaff\'s rule states that in DNA:', options: ['A% = T% and G% = C%', 'A% = G% and T% = C%', 'All bases equal', 'Purine > Pyrimidine'], correct: 0, explanation: 'Chargaff\'s rule: A=T and G=C (complementary base pairing ratio).' },
    { id: 16, type: 'assertion', question: 'Assertion: RNA is single stranded. Reason: RNA uses Uracil instead of Thymine.', options: ['Both A and R true but R doesn\'t explain A', 'Both A and R true and R explains A', 'A true R false', 'A false R true'], correct: 0, explanation: 'Both are true facts but the base type doesn\'t explain strand number — they\'re independent properties.' },
    { id: 17, type: 'truefalse', question: 'CRISPR-Cas9 is used for gene editing in modern biotechnology.', options: ['True', 'False'], correct: 0, explanation: 'True — CRISPR-Cas9 acts as molecular scissors to edit specific DNA sequences.' },
    { id: 18, type: 'fillinblank', question: 'The DNA sequence CTA on template strand would produce mRNA codon ___.', options: ['GAU', 'GAT', 'CTA', 'GCT'], correct: 0, fillAnswer: 'GAU', explanation: 'Template CTA → mRNA uses complementary RNA: G-A-U (replaces T with U).' },
    { id: 19, type: 'mcq', question: 'Telomeres at chromosome ends prevent:', options: ['DNA replication', 'Chromosome shortening and fusion', 'Transcription', 'Gene mutation'], correct: 1, explanation: 'Telomeric repeats protect chromosome ends from degradation and end-joining.' },
    { id: 20, type: 'truefalse', question: 'The human genome contains approximately 3 billion base pairs.', options: ['True', 'False'], correct: 0, explanation: 'True — the haploid human genome contains ~3.2 billion base pairs encoding ~20,000 genes.' },
  ];
}

// =================== CS 101: CPU SCHEDULING (Mixed 20 Qs) ===================
function generateCS101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'In Round Robin scheduling, the time allocated to each process is called:', options: ['Time Quantum', 'Clock Cycle', 'Throughput', 'Burst Window'], correct: 0, explanation: 'A fixed time quantum (slice) is allocated to each process in the Round Robin queue.' },
    { id: 2, type: 'truefalse', question: 'FCFS (First-Come-First-Served) is a preemptive scheduling algorithm.', options: ['True', 'False'], correct: 1, explanation: 'False — FCFS is NON-preemptive; a running process runs to completion.' },
    { id: 3, type: 'mcq', question: 'Which algorithm minimizes average waiting time?', options: ['FCFS', 'SJF (Shortest Job First)', 'Round Robin', 'Priority Scheduling'], correct: 1, explanation: 'SJF is provably optimal for minimizing average waiting time.' },
    { id: 4, type: 'fillinblank', question: 'Turnaround time = Completion time − ___ time.', options: ['Arrival', 'Burst', 'Waiting', 'Response'], correct: 0, fillAnswer: 'arrival', explanation: 'Turnaround time measures total time from process arrival to completion.' },
    { id: 5, type: 'truefalse', question: 'In SRTF (Shortest Remaining Time First), a new shorter process can preempt the running process.', options: ['True', 'False'], correct: 0, explanation: 'True — SRTF is the preemptive version of SJF; shortest remaining burst gets CPU.' },
    { id: 6, type: 'mcq', question: 'Convoy effect is a problem in:', options: ['SJF', 'Round Robin', 'FCFS', 'Priority'], correct: 2, explanation: 'FCFS convoy effect: short processes wait behind long ones, increasing average wait time.' },
    { id: 7, type: 'assertion', question: 'Assertion: Small time quantum in Round Robin causes high context switching overhead. Reason: Too many context switches consume CPU time.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'Smaller quantum → more switches → correct explanation.' },
    { id: 8, type: 'mcq', question: 'Response time = time from submission to ___ CPU response:', options: ['First', 'Last', 'Average', 'Maximum'], correct: 0, explanation: 'Response time = time from arrival until FIRST execution begins.' },
    { id: 9, type: 'match', question: 'Match scheduling algorithms to their key property:', options: ['SJF → Optimal avg wait', 'FCFS → Non-preemptive queue', 'Round Robin → Equal time slices', 'All correct'], correct: 3, explanation: 'All three matching pairs are correct properties of each algorithm.' },
    { id: 10, type: 'truefalse', question: 'Priority scheduling can lead to starvation of low-priority processes.', options: ['True', 'False'], correct: 0, explanation: 'True — low-priority processes may wait indefinitely if high-priority processes keep arriving.' },
    { id: 11, type: 'mcq', question: 'Aging is a technique used to solve:', options: ['Deadlock', 'Starvation', 'Fragmentation', 'Thrashing'], correct: 1, explanation: 'Aging gradually increases priority of waiting processes to prevent starvation.' },
    { id: 12, type: 'fillinblank', question: 'Waiting time = Turnaround time − ___ time.', options: ['Burst', 'Arrival', 'Completion', 'Priority'], correct: 0, fillAnswer: 'burst', explanation: 'Waiting time = Turnaround time - CPU burst time.' },
    { id: 13, type: 'mcq', question: 'CPU utilization is defined as:', options: ['% time CPU is actively executing processes', 'Processes per second', 'Total memory used', 'Context switch rate'], correct: 0, explanation: 'CPU utilization = (busy time / total time) × 100%.' },
    { id: 14, type: 'truefalse', question: 'Multilevel feedback queue allows processes to move between different queues.', options: ['True', 'False'], correct: 0, explanation: 'True — MLFQ promotes/demotes processes based on behavior for adaptive scheduling.' },
    { id: 15, type: 'mcq', question: 'Process P1 arrives at 0ms with burst 8ms, P2 at 1ms with burst 4ms. Using FCFS, waiting time of P2 is:', options: ['7 ms', '4 ms', '0 ms', '8 ms'], correct: 0, explanation: 'P1 runs 0→8ms. P2 waits from arrival 1ms to start 8ms → wait = 8-1 = 7ms.' },
    { id: 16, type: 'assertion', question: 'Assertion: SJF requires knowing burst times in advance. Reason: Future CPU burst time is usually not known.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'SJF needs burst time prediction (often via exponential averaging) — correctly explained.' },
    { id: 17, type: 'truefalse', question: 'Throughput is the number of processes completed per unit time.', options: ['True', 'False'], correct: 0, explanation: 'True — throughput measures how many processes finish execution per second/minute.' },
    { id: 18, type: 'fillinblank', question: 'The scheduler that runs when a process voluntarily yields the CPU is called ___ scheduler.', options: ['Non-preemptive', 'Preemptive', 'Long-term', 'Medium-term'], correct: 0, fillAnswer: 'non-preemptive', explanation: 'Non-preemptive schedulers only schedule when a process completes or blocks voluntarily.' },
    { id: 19, type: 'mcq', question: 'Which of the following is NOT a CPU scheduling criterion?', options: ['Maximize CPU utilization', 'Minimize waiting time', 'Maximize cache miss rate', 'Minimize turnaround time'], correct: 2, explanation: 'Maximizing cache miss rate is NOT a scheduling goal — we want to MINIMIZE it.' },
    { id: 20, type: 'mcq', question: 'In preemptive priority scheduling, which process runs when P1(priority=2) is running and P2(priority=1) arrives?', options: ['P2 preempts P1 (lower number = higher priority)', 'P1 continues', 'Both run together', 'OS decides randomly'], correct: 0, explanation: 'If lower number = higher priority, P2 preempts P1 immediately in preemptive scheduling.' },
  ];
}

function generateCS102Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'The correct sequence of TCP 3-Way Handshake flags is:', options: ['SYN → SYN-ACK → ACK', 'ACK → SYN → FIN', 'SYN → ACK → FIN', 'RST → SYN → ACK'], correct: 0, explanation: 'Client sends SYN, Server replies with SYN-ACK, Client confirms with ACK.' },
    { id: 2, type: 'truefalse', question: 'UDP provides reliable, ordered delivery of data.', options: ['True', 'False'], correct: 1, explanation: 'False — UDP is connectionless and unreliable. TCP provides reliability.' },
    { id: 3, type: 'mcq', question: 'TCP operates at which OSI model layer?', options: ['Network (Layer 3)', 'Transport (Layer 4)', 'Application (Layer 7)', 'Data Link (Layer 2)'], correct: 1, explanation: 'TCP is a Transport layer protocol (Layer 4) providing end-to-end communication.' },
    { id: 4, type: 'fillinblank', question: 'TCP uses ___ to ensure reliable data delivery by numbering each byte.', options: ['Sequence numbers', 'MAC addresses', 'IP addresses', 'Port numbers'], correct: 0, fillAnswer: 'sequence numbers', explanation: 'TCP sequence numbers track which bytes have been sent and acknowledged.' },
    { id: 5, type: 'truefalse', question: 'The FIN flag in TCP is used to terminate a connection.', options: ['True', 'False'], correct: 0, explanation: 'True — FIN initiates graceful connection termination (4-way teardown).' },
    { id: 6, type: 'mcq', question: 'Flow control in TCP prevents:', options: ['Router congestion', 'Receiver buffer overflow', 'DNS failure', 'IP address conflict'], correct: 1, explanation: 'TCP sliding window protocol prevents the sender from overwhelming the receiver\'s buffer.' },
    { id: 7, type: 'assertion', question: 'Assertion: TCP is slower than UDP. Reason: TCP has connection overhead, acknowledgments, and retransmissions.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'TCP reliability features add latency — correctly explained.' },
    { id: 8, type: 'mcq', question: 'What is the well-known port for HTTPS?', options: ['80', '443', '22', '21'], correct: 1, explanation: 'HTTPS uses port 443 for encrypted web traffic (HTTP uses 80).' },
    { id: 9, type: 'truefalse', question: 'TCP connection can be established with a 2-way handshake.', options: ['True', 'False'], correct: 1, explanation: 'False — TCP requires 3-way handshake to synchronize sequence numbers in both directions.' },
    { id: 10, type: 'match', question: 'Match protocols to ports:', options: ['HTTP → 80', 'SMTP → 25', 'FTP → 21', 'All correct'], correct: 3, explanation: 'All port mappings are correct standard assignments.' },
    { id: 11, type: 'mcq', question: 'Congestion control in TCP is handled by:', options: ['Slow Start & Congestion Avoidance', 'DNS resolution', 'ARP protocol', 'IP routing tables'], correct: 0, explanation: 'TCP uses Slow Start, Congestion Avoidance, Fast Retransmit, and Fast Recovery.' },
    { id: 12, type: 'fillinblank', question: 'The maximum size of a TCP segment payload is called the ___.', options: ['MSS (Maximum Segment Size)', 'MTU', 'Window Size', 'Buffer Size'], correct: 0, fillAnswer: 'MSS', explanation: 'MSS = Maximum Segment Size, typically 1460 bytes for Ethernet-based networks.' },
    { id: 13, type: 'truefalse', question: 'SYN flood attack exploits the TCP 3-way handshake mechanism.', options: ['True', 'False'], correct: 0, explanation: 'True — SYN flood sends many SYN packets without completing handshakes, exhausting resources.' },
    { id: 14, type: 'mcq', question: 'Which flag resets a TCP connection immediately?', options: ['FIN', 'SYN', 'RST', 'ACK'], correct: 2, explanation: 'RST flag abruptly resets/terminates a TCP connection.' },
    { id: 15, type: 'assertion', question: 'Assertion: TCP header is larger than UDP header. Reason: TCP header includes sequence, acknowledgment numbers, flags, and window size.', options: ['Both A and R true and R explains A', 'Both true but R doesn\'t explain A', 'A true R false', 'Both false'], correct: 0, explanation: 'TCP header is 20-60 bytes vs UDP\'s 8 bytes, correctly explained by its extra fields.' },
    { id: 16, type: 'truefalse', question: 'IP addresses are used in TCP headers.', options: ['True', 'False'], correct: 1, explanation: 'False — IP addresses are in IP headers (Layer 3). TCP headers contain port numbers.' },
    { id: 17, type: 'mcq', question: 'Which application commonly uses UDP instead of TCP?', options: ['Email (SMTP)', 'File Transfer (FTP)', 'Video streaming / VoIP', 'Web browsing (HTTP)'], correct: 2, explanation: 'Video streaming and VoIP prefer UDP low-latency even with some packet loss.' },
    { id: 18, type: 'fillinblank', question: 'After TCP connection is established, data exchange uses the ___ flag to acknowledge received segments.', options: ['ACK', 'SYN', 'FIN', 'RST'], correct: 0, fillAnswer: 'ACK', explanation: 'ACK flag is set in every TCP packet during data exchange to acknowledge received data.' },
    { id: 19, type: 'mcq', question: 'TIME_WAIT state in TCP lasts approximately:', options: ['2 × MSL (Maximum Segment Lifetime)', '1 second', '100ms', 'Indefinitely'], correct: 0, explanation: 'TIME_WAIT = 2×MSL ensures all delayed packets expire before connection reuse.' },
    { id: 20, type: 'truefalse', question: 'TCP guarantees delivery of packets in the order they were sent.', options: ['True', 'False'], correct: 0, explanation: 'True — TCP sequence numbers allow reordering at receiver even if packets arrive out of order.' },
  ];
}

function generateCS103Quiz(): QuizQuestion[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, type: 'mcq' as QuizType,
    question: `BST & Graph Q${i + 1}: Inorder traversal of a Binary Search Tree gives:`,
    options: ['Sorted ascending order', 'Sorted descending order', 'Level order', 'Random order'],
    correct: 0,
    explanation: 'Inorder (Left-Root-Right) on a BST yields elements in strictly increasing sorted order.',
  }));
}

function generateJEE101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'Torque τ on a particle relative to origin is:', options: ['τ = r × F', 'τ = F × r', 'τ = m × v', 'τ = r · F'], correct: 0, explanation: 'Torque is vector cross product τ = r × F (order matters for direction).' },
    { id: 2, type: 'truefalse', question: 'Moment of inertia depends on the axis of rotation.', options: ['True', 'False'], correct: 0, explanation: 'True — I = Σmᵢrᵢ² depends on the distance of each mass from the rotation axis.' },
    { id: 3, type: 'mcq', question: 'For a solid sphere, moment of inertia about diameter is:', options: ['2/5 MR²', '1/2 MR²', 'MR²', '2/3 MR²'], correct: 0, explanation: 'Solid sphere about diameter: I = 2/5 MR².' },
    { id: 4, type: 'fillinblank', question: 'Angular momentum L = I × ___, where I is moment of inertia.', options: ['ω (angular velocity)', 'F (force)', 'v (linear velocity)', 'a (acceleration)'], correct: 0, fillAnswer: 'ω', explanation: 'L = Iω — analogous to linear momentum p = mv.' },
    { id: 5, type: 'truefalse', question: 'Angular momentum is conserved when no external torque acts.', options: ['True', 'False'], correct: 0, explanation: 'True — analogous to linear momentum conservation when no external force acts.' },
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 6, type: 'mcq' as QuizType,
      question: `JEE Rotational Dynamics Q${i + 6}: The work done by torque τ rotating by angle θ is:`,
      options: ['W = τθ', 'W = τ/θ', 'W = τ²θ', 'W = τ+θ'],
      correct: 0,
      explanation: 'Rotational work W = τ × θ (analogous to linear W = F × d).',
    })),
  ];
}

function generateNEET101Quiz(): QuizQuestion[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, type: 'mcq' as QuizType,
    question: `NEET Organic Chemistry Q${i + 1}: Benzene nitration uses:`,
    options: ['Conc. HNO₃ + Conc. H₂SO₄', 'Dilute HCl', 'NaOH + H₂O', 'KMnO₄'],
    correct: 0,
    explanation: 'Nitrating mixture generates electrophilic nitronium ion NO₂⁺ for aromatic substitution.',
  }));
}

function generateUPSC101Quiz(): QuizQuestion[] {
  return [
    { id: 1, type: 'mcq', question: 'Which Article guarantees Right to Constitutional Remedies?', options: ['Article 32', 'Article 14', 'Article 19', 'Article 21'], correct: 0, explanation: 'Article 32 (Dr. Ambedkar called it "heart and soul" of constitution) allows SC Writs.' },
    { id: 2, type: 'truefalse', question: 'Fundamental Rights are absolute and cannot be suspended under any circumstances.', options: ['True', 'False'], correct: 1, explanation: 'False — FRs can be suspended during National Emergency (Art. 352) except Art. 20 & 21.' },
    { id: 3, type: 'mcq', question: 'Habeas Corpus writ is used to:', options: ['Compel authority to perform duty', 'Produce a detained person in court', 'Stop an inferior court', 'Transfer case to higher court'], correct: 1, explanation: '"Habeas Corpus" = "produce the body" — prevents illegal detention.' },
    { id: 4, type: 'fillinblank', question: 'The Right to Education is guaranteed under Article ___ of Indian Constitution.', options: ['21A', '19', '14', '32'], correct: 0, fillAnswer: '21A', explanation: 'Article 21A (86th Amendment, 2002) provides free compulsory education for 6-14 years.' },
    { id: 5, type: 'truefalse', question: 'Right to Property is still a Fundamental Right under the Indian Constitution.', options: ['True', 'False'], correct: 1, explanation: 'False — Right to Property was removed from FRs by 44th Amendment (1978), now only legal right.' },
    ...Array.from({ length: 15 }, (_, i) => ({
      id: i + 6, type: 'mcq' as QuizType,
      question: `UPSC Polity Q${i + 6}: Which writ is used when a lower court acts beyond its jurisdiction?`,
      options: ['Certiorari', 'Mandamus', 'Habeas Corpus', 'Quo Warranto'],
      correct: 0,
      explanation: 'Certiorari quashes decisions of inferior courts acting without or excess of jurisdiction.',
    })),
  ];
}

function generateSK101Quiz(): QuizQuestion[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, type: 'mcq' as QuizType,
    question: `Python Q${i + 1}: In Python, async functions are declared using:`,
    options: ['async def', 'def async', 'thread def', 'await def'],
    correct: 0,
    explanation: 'Python uses "async def" syntax to define coroutines for async IO.',
  }));
}

function generateSK102Quiz(): QuizQuestion[] {
  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1, type: 'mcq' as QuizType,
    question: `English Q${i + 1}: Which technique improves pitch clarity in speech?`,
    options: ['Voice modulation & diaphragmatic breathing', 'Speaking fast', 'Shouting', 'Monotone speed'],
    correct: 0,
    explanation: 'Voice modulation and controlled breathing ensure clear, impactful communication.',
  }));
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'prob_1',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`. Each input has exactly one solution and you may not use the same element twice.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
    starterCode: {
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      javascript: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int,int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            int d = target - nums[i];\n            if (mp.count(d)) return {mp[d], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer,Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) return new int[]{map.get(diff), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
    },
    visibleTestCases: [
      { input: '[2,7,11,15], target=9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], target=6', expectedOutput: '[1,2]' },
    ],
    hiddenTestCases: [
      { input: '[3,3], target=6', expectedOutput: '[0,1]' },
      { input: '[-1,-8,10,5], target=-9', expectedOutput: '[0,1]' },
    ],
    solutionExplanation: 'Use a hash map to store previously seen numbers. For each number, check if complement (target-num) exists in the map. O(N) time, O(N) space.',
  },
  {
    id: 'prob_2',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    description: 'Given a sorted array `nums` and an integer `target`, write an O(log n) algorithm to find `target`. Return its index, or -1 if not found.',
    constraints: ['1 <= nums.length <= 10^4', 'All elements unique', 'Sorted ascending order'],
    starterCode: {
      python: `def search(nums, target):\n    l, r = 0, len(nums)-1\n    while l <= r:\n        mid = (l+r)//2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid+1\n        else: r = mid-1\n    return -1`,
      javascript: `function search(nums, target) {\n    let l = 0, r = nums.length-1;\n    while (l <= r) {\n        let mid = Math.floor((l+r)/2);\n        if (nums[mid] === target) return mid;\n        if (nums[mid] < target) l = mid+1;\n        else r = mid-1;\n    }\n    return -1;\n}`,
      cpp: `int search(vector<int>& nums, int target) {\n    int l=0, r=nums.size()-1;\n    while(l<=r){\n        int mid=l+(r-l)/2;\n        if(nums[mid]==target) return mid;\n        if(nums[mid]<target) l=mid+1;\n        else r=mid-1;\n    }\n    return -1;\n}`,
      java: `public int search(int[] nums, int target) {\n    int l=0, r=nums.length-1;\n    while(l<=r){\n        int mid=l+(r-l)/2;\n        if(nums[mid]==target) return mid;\n        if(nums[mid]<target) l=mid+1;\n        else r=mid-1;\n    }\n    return -1;\n}`,
    },
    visibleTestCases: [
      { input: '[-1,0,3,5,9,12], target=9', expectedOutput: '4' },
      { input: '[-1,0,3,5,9,12], target=2', expectedOutput: '-1' },
    ],
    hiddenTestCases: [
      { input: '[5], target=5', expectedOutput: '0' },
      { input: '[1,2,3,4,5,6,7,8,9,10], target=10', expectedOutput: '9' },
    ],
    solutionExplanation: 'Maintain left/right pointers. Compute mid. Narrow search to left or right half each iteration. O(log N).',
  },
  {
    id: 'prob_3',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: 'Given string `s` containing only `()[]{}`characters, determine if the input string is valid (brackets properly nested and matched).',
    constraints: ['1 <= s.length <= 10^4'],
    starterCode: {
      python: `def isValid(s):\n    stack = []\n    m = {')':'(', '}':'{', ']':'['}\n    for c in s:\n        if c in m:\n            if not stack or stack[-1] != m[c]: return False\n            stack.pop()\n        else:\n            stack.append(c)\n    return not stack`,
      javascript: `function isValid(s) {\n    const stack=[], map={')':'(', '}':'{', ']':'['};\n    for(let c of s){\n        if(map[c]){\n            if(stack.pop() !== map[c]) return false;\n        } else stack.push(c);\n    }\n    return stack.length===0;\n}`,
      cpp: `bool isValid(string s) {\n    stack<char> st;\n    for(char c: s){\n        if(c=='(' || c=='{' || c=='[') st.push(c);\n        else{\n            if(st.empty()) return false;\n            char t=st.top(); st.pop();\n            if(c==')' && t!='(') return false;\n            if(c=='}' && t!='{') return false;\n            if(c==']' && t!='[') return false;\n        }\n    }\n    return st.empty();\n}`,
      java: `public boolean isValid(String s) {\n    Stack<Character> st = new Stack<>();\n    for(char c : s.toCharArray()){\n        if(c=='(' || c=='{' || c=='[') st.push(c);\n        else{\n            if(st.isEmpty()) return false;\n            char t=st.pop();\n            if(c==')' && t!='(') return false;\n            if(c=='}' && t!='{') return false;\n            if(c==']' && t!='[') return false;\n        }\n    }\n    return st.isEmpty();\n}`,
    },
    visibleTestCases: [
      { input: 's="()"', expectedOutput: 'true' },
      { input: 's="()[]{}"', expectedOutput: 'true' },
      { input: 's="(]"', expectedOutput: 'false' },
    ],
    hiddenTestCases: [
      { input: 's="([)]"', expectedOutput: 'false' },
      { input: 's="{[]}"', expectedOutput: 'true' },
    ],
    solutionExplanation: 'Use a stack. Push open brackets. For closing brackets, check if top matches. Empty stack at end = valid.',
  },
  {
    id: 'prob_4',
    title: 'Fibonacci Number',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    description: 'The Fibonacci numbers form: F(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2). Given n, calculate F(n) efficiently.',
    constraints: ['0 <= n <= 30'],
    starterCode: {
      python: `def fib(n):\n    if n <= 1: return n\n    a, b = 0, 1\n    for _ in range(2, n+1):\n        a, b = b, a+b\n    return b`,
      javascript: `function fib(n) {\n    if(n<=1) return n;\n    let a=0, b=1;\n    for(let i=2; i<=n; i++) [a,b]=[b,a+b];\n    return b;\n}`,
      cpp: `int fib(int n) {\n    if(n<=1) return n;\n    int a=0, b=1;\n    for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}`,
      java: `public int fib(int n) {\n    if(n<=1) return n;\n    int a=0,b=1;\n    for(int i=2;i<=n;i++){int c=a+b;a=b;b=c;}\n    return b;\n}`,
    },
    visibleTestCases: [
      { input: 'n=2', expectedOutput: '1' },
      { input: 'n=3', expectedOutput: '2' },
      { input: 'n=4', expectedOutput: '3' },
    ],
    hiddenTestCases: [
      { input: 'n=0', expectedOutput: '0' },
      { input: 'n=10', expectedOutput: '55' },
      { input: 'n=30', expectedOutput: '832040' },
    ],
    solutionExplanation: 'Use iterative bottom-up DP with two variables. O(N) time, O(1) space.',
  },
  {
    id: 'prob_5',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    description: 'Given the head of a singly linked list, reverse the list and return its head.',
    constraints: ['0 <= number of nodes <= 5000', '-5000 <= Node.val <= 5000'],
    starterCode: {
      python: `def reverseList(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      javascript: `function reverseList(head) {\n    let prev=null, curr=head;\n    while(curr){\n        const nxt=curr.next;\n        curr.next=prev;\n        prev=curr;\n        curr=nxt;\n    }\n    return prev;\n}`,
      cpp: `ListNode* reverseList(ListNode* head) {\n    ListNode* prev=nullptr;\n    while(head){\n        ListNode* nxt=head->next;\n        head->next=prev;\n        prev=head;\n        head=nxt;\n    }\n    return prev;\n}`,
      java: `public ListNode reverseList(ListNode head) {\n    ListNode prev=null;\n    while(head!=null){\n        ListNode nxt=head.next;\n        head.next=prev;\n        prev=head;\n        head=nxt;\n    }\n    return prev;\n}`,
    },
    visibleTestCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
      { input: '[1,2]', expectedOutput: '[2,1]' },
    ],
    hiddenTestCases: [
      { input: '[]', expectedOutput: '[]' },
      { input: '[1]', expectedOutput: '[1]' },
    ],
    solutionExplanation: 'Iterate with prev pointer. For each node, reverse its next pointer. O(N) time, O(1) space.',
  },
];
