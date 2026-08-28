// User Authentication & Student/Teacher Data Management Layer

export type UserRole = 'school' | 'college' | 'aspirant' | 'skill' | 'teacher';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  institution?: string;
  grade?: string;
  joinedDate: string;
  xp: number;
  level: number;
  streakDays: number;
  completedTopics: string[];
  solvedProblems: string[];
  testScores: { topic: string; score: number; total: number; date: string }[];
  weaknesses: string[];
  assignedTopics: string[];
  lastLoginDate?: string;
  totalStudyMinutes: number;
}

const STORAGE_KEY = 'nexus_user_session';
const ALL_USERS_KEY = 'nexus_all_users';

// Simple hash using browser crypto API
async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined') return btoa(password);
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'nexus_salt_2026');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Sync fallback for immediate operations
function hashPasswordSync(password: string): string {
  // Simple deterministic hash for sync operations (not cryptographically secure, just for demo)
  let hash = 0;
  const str = password + 'nexus_salt_2026';
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0') + btoa(password).substring(0, 24);
}

// Pre-populated demo students for Teacher view
const DEMO_USERS: UserProfile[] = [
  {
    id: 'usr_1',
    username: 'Ravi Kumar',
    email: 'ravi.k@school.edu',
    passwordHash: hashPasswordSync('demo123'),
    role: 'school',
    institution: 'Delhi Public School',
    grade: 'Class 11',
    joinedDate: '2026-08-01',
    xp: 2450,
    level: 5,
    streakDays: 14,
    completedTopics: ['phy_101', 'math_101'],
    solvedProblems: ['prob_1', 'prob_2'],
    testScores: [
      { topic: 'Wave Optics', score: 85, total: 100, date: '2026-08-20' },
      { topic: 'Quadratic Equations', score: 60, total: 100, date: '2026-08-22' },
    ],
    weaknesses: ['Quadratic Equations', 'Ray Optics'],
    assignedTopics: ['Diffraction Micro-Lab'],
    totalStudyMinutes: 420,
  },
  {
    id: 'usr_2',
    username: 'Priya Singh',
    email: 'priya.s@engg.edu',
    passwordHash: hashPasswordSync('demo123'),
    role: 'college',
    institution: 'IIT Bombay',
    grade: 'B.Tech Year 2',
    joinedDate: '2026-08-05',
    xp: 4120,
    level: 8,
    streakDays: 22,
    completedTopics: ['cs_101', 'cs_102', 'phy_102'],
    solvedProblems: ['prob_1', 'prob_2', 'prob_3'],
    testScores: [
      { topic: 'Binary Search', score: 100, total: 100, date: '2026-08-24' },
      { topic: 'Operating Systems Scheduling', score: 90, total: 100, date: '2026-08-25' },
    ],
    weaknesses: ['Deadlock Prevention'],
    assignedTopics: [],
    totalStudyMinutes: 860,
  },
  {
    id: 'usr_3',
    username: 'Arjun Patel',
    email: 'arjun.p@aspirant.com',
    passwordHash: hashPasswordSync('demo123'),
    role: 'aspirant',
    institution: 'Aspirant Academy',
    grade: 'JEE Advanced Prep',
    joinedDate: '2026-08-10',
    xp: 3100,
    level: 7,
    streakDays: 19,
    completedTopics: ['jee_101', 'neet_101'],
    solvedProblems: ['prob_1'],
    testScores: [
      { topic: 'Rotational Mechanics', score: 55, total: 100, date: '2026-08-23' },
    ],
    weaknesses: ['Torque Calculations', 'Organic Mechanisms'],
    assignedTopics: ['Rotational Dynamics Practice'],
    totalStudyMinutes: 610,
  },
  {
    id: 'teacher_1',
    username: 'Dr. Meena Sharma',
    email: 'teacher@nexuslearn.edu',
    passwordHash: hashPasswordSync('teacher2026'),
    role: 'teacher',
    institution: 'NEXUS LEARN Academy',
    joinedDate: '2026-07-01',
    xp: 0,
    level: 0,
    streakDays: 0,
    completedTopics: [],
    solvedProblems: [],
    testScores: [],
    weaknesses: [],
    assignedTopics: [],
    totalStudyMinutes: 0,
  },
];

export function getStoredSession(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null; // No auto-login — must explicitly login
}

export function saveUserSession(user: UserProfile) {
  if (typeof window === 'undefined') return;
  const sessionUser = { ...user, lastLoginDate: new Date().toISOString().split('T')[0] };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));

  // Also save in all users array
  const all = getAllUsers();
  const index = all.findIndex(u => u.id === user.id);
  if (index !== -1) {
    all[index] = sessionUser;
  } else {
    all.push(sessionUser);
  }
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(all));
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getAllUsers(): UserProfile[] {
  if (typeof window === 'undefined') return DEMO_USERS;
  const data = localStorage.getItem(ALL_USERS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return DEMO_USERS;
    }
  }
  localStorage.setItem(ALL_USERS_KEY, JSON.stringify(DEMO_USERS));
  return DEMO_USERS;
}

export function canAccessRoleContent(user: UserProfile | null, targetRole: UserRole): boolean {
  if (!user) return false;
  if (user.role === 'teacher') return true;
  return user.role === targetRole;
}

// Teacher-only: get all student profiles (NOT teachers)
export function getAllStudents(requestingUser: UserProfile): UserProfile[] {
  if (requestingUser.role !== 'teacher') {
    throw new Error('Unauthorized: Only teachers can access all student data.');
  }
  return getAllUsers().filter(u => u.role !== 'teacher');
}

// Students see only their own data; teachers see all
export function getUserById(id: string, requestingUser: UserProfile): UserProfile | null {
  if (requestingUser.role !== 'teacher' && requestingUser.id !== id) {
    throw new Error('Unauthorized: Students can only view their own profile.');
  }
  return getAllUsers().find(u => u.id === id) || null;
}

export async function loginUser(email: string, password: string): Promise<UserProfile | null> {
  const hash = await hashPassword(password);
  const syncHash = hashPasswordSync(password);
  const all = getAllUsers();
  // Check both async hash and sync hash for compatibility
  const user = all.find(u => u.email === email && (u.passwordHash === hash || u.passwordHash === syncHash));
  if (user) {
    saveUserSession(user);
    return user;
  }
  return null;
}

export async function registerNewUser(
  username: string,
  email: string,
  password: string,
  role: UserRole,
  institution?: string,
  grade?: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  // Check if email already exists
  const all = getAllUsers();
  const exists = all.find(u => u.email === email);
  if (exists) {
    return { success: false, error: 'Email already registered. Please login.' };
  }

  const hash = hashPasswordSync(password);
  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    username,
    email,
    passwordHash: hash,
    role,
    institution: institution || 'Self Learner',
    grade: grade || '',
    joinedDate: new Date().toISOString().split('T')[0],
    xp: 500,
    level: 1,
    streakDays: 1,
    completedTopics: [],
    solvedProblems: [],
    testScores: [],
    weaknesses: [],
    assignedTopics: [],
    totalStudyMinutes: 0,
  };
  saveUserSession(newUser);
  return { success: true, user: newUser };
}

export function updateUserProgress(userId: string, updates: Partial<UserProfile>) {
  const all = getAllUsers();
  const index = all.findIndex(u => u.id === userId);
  if (index !== -1) {
    all[index] = { ...all[index], ...updates };
    if (typeof window !== 'undefined') {
      localStorage.setItem(ALL_USERS_KEY, JSON.stringify(all));
      // Also update session if it's the current user
      const session = getStoredSession();
      if (session?.id === userId) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all[index]));
      }
    }
  }
}

export function assignTopicToStudent(studentId: string, topic: string): boolean {
  const student = getAllUsers().find(user => user.id === studentId);
  if (!student || student.role === 'teacher') return false;

  updateUserProgress(studentId, {
    assignedTopics: Array.from(new Set([...student.assignedTopics, topic])),
  });
  return true;
}
