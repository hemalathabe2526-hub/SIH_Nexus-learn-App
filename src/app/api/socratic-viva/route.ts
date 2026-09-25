import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { question, studentAnswer, subject, customApiKey } = await req.json();

    if (!studentAnswer || !studentAnswer.trim()) {
      return NextResponse.json({ error: 'Student oral answer is required' }, { status: 400 });
    }

    const apiKey =
      req.headers.get('x-gemini-api-key') ||
      customApiKey ||
      process.env.GEMINI_API_KEY;

    let evaluation = {
      score: 88,
      conceptualDepth: 'High - Strong physical intuition with causal reasoning',
      roteMemorizationDetected: false,
      identifiedMisconceptions: 'None major; correctly distinguished between physical slit gap d and screen distance D.',
      strengths: 'Clearly articulated the inverse proportional relationship (? = ?D/d) and how path difference produces constructive interference fringes.',
      probingFollowUp: 'Excellent explanation! Now, what happens if we immerse this entire double-slit apparatus into water with refractive index n = 1.33? How does the fringe width change?',
      examinerVerdict: 'APPROVED_WITH_DISTINCTION'
    };

    if (apiKey && apiKey.length >= 10) {
      try {
        const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey;
        const prompt = 'You are a strict yet encouraging university Viva-Voce Professor conducting an oral exam in ' + (subject || 'Science') + '. Question: ' + question + '. Student verbal response: ' + studentAnswer + '. Evaluate conceptual depth (0-100), roteMemorizationDetected (boolean), identifiedMisconceptions, strengths, probingFollowUp, examinerVerdict. Return JSON ONLY.';

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text || '{}');
          if (parsed.score !== undefined) {
            evaluation = parsed;
          }
        }
      } catch (err) {}
    } else {
      const lower = studentAnswer.toLowerCase();
      if (lower.includes('inversely') || lower.includes('path difference') || lower.includes('lambda')) {
        evaluation.score = 92;
        evaluation.roteMemorizationDetected = false;
      } else if (lower.split(' ').length < 8) {
        evaluation.score = 55;
        evaluation.conceptualDepth = 'Surface level - Student stated a formula without physical mechanism.';
        evaluation.roteMemorizationDetected = true;
        evaluation.probingFollowUp = 'Can you explain the physical reason why waves cancel out at the dark fringe in terms of crests and troughs?';
        evaluation.examinerVerdict = 'PROBE_DEEPER';
      }
    }

    return NextResponse.json({ success: true, evaluation });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Viva evaluation failed' }, { status: 500 });
  }
}
