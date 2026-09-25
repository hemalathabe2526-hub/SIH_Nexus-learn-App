import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, messageType, text } = body;

    let responseText = '';
    let svgDiagram = '';
    let voiceNoteDurationSec = 28;
    let audioTranscript = '';

    if (messageType === 'voice_note' || text?.toLowerCase().includes('torque') || text?.toLowerCase().includes('physics')) {
      audioTranscript = 'Rotational dynamics: Torque is the rotational counterpart of linear force, calculated as tau equals r cross F sin theta.';
      responseText = '*[NEXUS Micro-LMS Audio Response]*\n\n' +
        '*Formula:* `τ = r × F × sin(θ)`\n' +
        '• *r:* Moment arm distance from pivot\n' +
        '• *F:* Applied force vector\n' +
        '• *θ:* Angle between arm and force\n\n' +
        '*Real-World Analogy:* Pushing a door at its outer handle requires much less effort than pushing near the hinges!\n\n' +
        '*Quick Check:* What is torque when θ = 0° (pulling directly along the arm)?\n' +
        'Reply *A* (Zero Torque) or *B* (Maximum Torque)';

      svgDiagram = '<svg viewBox="0 0 300 120" xmlns="http://www.w3.org/2000/svg" style="background:#0a192f; border-radius:8px;"><circle cx="40" cy="60" r="10" fill="#00d4ff" /><text x="28" y="90" fill="#00d4ff" font-size="11" font-family="sans-serif">Pivot</text><line x1="50" y1="60" x2="220" y2="60" stroke="#fff" stroke-width="4" /><text x="120" y="50" fill="#fff" font-size="12" font-family="sans-serif">Arm r</text><line x1="220" y1="60" x2="220" y2="20" stroke="#10b981" stroke-width="4" /><polygon points="215,22 220,10 225,22" fill="#10b981" /><text x="230" y="35" fill="#10b981" font-size="12" font-weight="bold" font-family="sans-serif">Force F</text><text x="120" y="105" fill="#f59e0b" font-size="11" font-family="sans-serif">Torque: τ = r × F × sin(90°)</text></svg>';
    } else {
      audioTranscript = 'Welcome to Nexus Learn Omni-Sync WhatsApp Micro-LMS. You can send handwritten math photos, voice questions, or text.';
      responseText = '*[NEXUS Micro-LMS Ready]*\n\n' +
        'Welcome to WhatsApp Study Assistant! Try sending:\n' +
        '1. Voice note in Hindi, Tamil, or English asking a science question\n' +
        '2. Photo of handwritten math, circuit diagram, or code\n' +
        '3. Reply *QUIZ* for daily 2-minute syllabus drill.';
    }

    return NextResponse.json({
      success: true,
      sender: from || '+91-98765-43210',
      replyMessage: responseText,
      audioTranscript,
      voiceNoteDurationSec,
      svgDiagram,
      source: 'nexus-omni-sync-whatsapp-engine'
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'WhatsApp gateway error' }, { status: 500 });
  }
}
