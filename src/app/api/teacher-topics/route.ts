import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory persistent server cache for global teacher syllabus topics
// Across all students, teachers, and laptops connecting to the platform
interface TeacherTopicItem {
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
  targetRole: 'school' | 'college' | 'aspirant' | 'skill' | 'all';
  createdByTeacher?: string;
  createdAt?: string;
  customQuiz?: unknown[];
}

// Global server storage array
const globalTeacherTopics: TeacherTopicItem[] = [];

export async function GET() {
  return NextResponse.json({
    success: true,
    topics: globalTeacherTopics,
    count: globalTeacherTopics.length,
    timestamp: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  });
}

export async function POST(req: Request) {
  try {
    const topic: TeacherTopicItem = await req.json();
    if (!topic || !topic.title || !topic.subject) {
      return NextResponse.json({ success: false, message: 'Invalid topic payload' }, { status: 400 });
    }

    const existingIndex = globalTeacherTopics.findIndex(t => t.id === topic.id);
    if (existingIndex >= 0) {
      globalTeacherTopics[existingIndex] = { ...topic, createdAt: topic.createdAt || new Date().toISOString() };
    } else {
      globalTeacherTopics.unshift({
        ...topic,
        id: topic.id || `teacher_${Date.now()}`,
        createdAt: topic.createdAt || new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      topics: globalTeacherTopics,
      message: 'Topic published globally to all students and laptops',
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, message: 'Topic ID required' }, { status: 400 });
    }

    const initialLength = globalTeacherTopics.length;
    const filtered = globalTeacherTopics.filter(t => t.id !== id);
    globalTeacherTopics.length = 0;
    globalTeacherTopics.push(...filtered);

    return NextResponse.json({
      success: true,
      deleted: initialLength !== filtered.length,
      topics: globalTeacherTopics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
