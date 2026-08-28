import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, history = [], customApiKey } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Determine which API key to use (Header > Client Body > Server Env)
    const apiKey =
      req.headers.get('x-gemini-api-key') ||
      customApiKey ||
      process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      // Call Google Gemini API (gemini-1.5-flash / gemini-2.0-flash)
      const systemInstruction =
        "You are NEXUS AI, an expert, enthusiastic, and pedagogical AI tutor for NEXUS LEARN - Smart Education & Personalized Learning Platform. " +
        "Provide clear, structured, and easy-to-understand educational explanations with key principles, formulas, bullet points, and real-world examples. " +
        "Keep formatting clean with Markdown headers and bullet points.";

      const contents = [
        ...history.map((msg: { sender: string; text: string }) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return NextResponse.json({
            reply: candidate,
            source: 'gemini-1.5-flash',
            hasGeminiKey: true,
          });
        }
      } else {
        const errData = await response.text();
        console.warn('Gemini API error response:', errData);
      }
    }

    // Graceful Intelligent Educational Fallback if no key or error
    return NextResponse.json({
      reply: generateFallbackResponse(prompt),
      source: 'nexus-knowledge-engine',
      hasGeminiKey: false,
      message: 'To use live Gemini LLM generation, configure your Gemini API Key in the Chatbot settings.',
    });
  } catch (error) {
    console.error('Error in /api/gemini route:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request', details: String(error) },
      { status: 500 }
    );
  }
}

function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('newton') || q.includes('motion') || q.includes('force')) {
    return (
      "### 🪐 Sir Isaac Newton's Three Laws of Motion\n\n" +
      "1. **First Law (Law of Inertia)**: An object remains at rest or in uniform motion unless acted upon by a net external force.\n" +
      "2. **Second Law (F = ma)**: The rate of change of momentum is directly proportional to the applied force. Formula: **F = m × a**.\n" +
      "3. **Third Law (Action-Reaction)**: For every action, there is an equal and opposite reaction.\n\n" +
      "💡 *Tip: Test these principles in our 3D Physics Virtual Lab!*"
    );
  }

  if (q.includes('doppler') || q.includes('sound') || q.includes('frequency')) {
    return (
      "### 🔊 The Doppler Effect\n\n" +
      "The apparent shift in wave frequency when the wave source and observer move relative to one another.\n\n" +
      "- **Approaching Source**: Wavefronts compress → Observed frequency **increases** (higher pitch / blueshift).\n" +
      "- **Receding Source**: Wavefronts stretch → Observed frequency **decreases** (lower pitch / redshift).\n" +
      "- **Formula**: $f' = f \\times \\frac{v \\pm v_o}{v \\mp v_s}$\n\n" +
      "🚨 *Example: An ambulance siren sounds higher pitched as it speeds toward you.*"
    );
  }

  if (q.includes('quadratic') || q.includes('discriminant') || q.includes('parabola')) {
    return (
      "### 📈 Quadratic Equations & Roots\n\n" +
      "For standard form $ax^2 + bx + c = 0$:\n\n" +
      "- **Quadratic Formula**: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$\n" +
      "- **Discriminant ($D = b^2 - 4ac$)**:\n" +
      "  - $D > 0$: Two distinct real roots\n" +
      "  - $D = 0$: One real repeated root (Parabola vertex touches x-axis)\n" +
      "  - $D < 0$: Two complex conjugate roots\n" +
      "- **Vieta's Formulas**: Sum of roots = $-b/a$, Product of roots = $c/a$."
    );
  }

  if (q.includes('dna') || q.includes('rna') || q.includes('replication') || q.includes('biology')) {
    return (
      "### 🧬 DNA Double Helix & Replication\n\n" +
      "- **Structure**: Double-stranded antiparallel helix discovered by Watson & Crick (1953).\n" +
      "- **Chargaff's Base Pairing**: Adenine (A) pairs with Thymine (T) via 2 hydrogen bonds; Guanine (G) pairs with Cytosine (C) via 3 hydrogen bonds.\n" +
      "- **Semi-Conservative Replication**: DNA Helicase unzips strands, and DNA Polymerase synthesizes complementary 5'→3' strands."
    );
  }

  if (q.includes('python') || q.includes('code') || q.includes('search') || q.includes('array')) {
    return (
      "### 🐍 Python 3 Binary Search Algorithm\n\n" +
      "```python\n" +
      "def binary_search(arr, target):\n" +
      "    left, right = 0, len(arr) - 1\n" +
      "    while left <= right:\n" +
      "        mid = (left + right) // 2\n" +
      "        if arr[mid] == target:\n" +
      "            return mid\n" +
      "        elif arr[mid] < target:\n" +
      "            left = mid + 1\n" +
      "        else:\n" +
      "            right = mid - 1\n" +
      "    return -1\n" +
      "```\n" +
      "⚡ **Time Complexity**: $O(\\log N)$ | **Space Complexity**: $O(1)$"
    );
  }

  // General Subject Synthesizer
  const topic = query.replace(/teach me|explain|what is|how does|tell me about/gi, '').trim() || query;
  return (
    `### 🤖 NEXUS AI Concept Tutor: ${topic.toUpperCase()}\n\n` +
    `Here is the educational breakdown for **${topic}**:\n\n` +
    `1. **Definition & Context**: ${topic} is a core learning concept. It builds foundational knowledge necessary for assessments and practical problem-solving.\n` +
    `2. **Core Mechanics**: Focus on governing formulas, relationships between variables, and boundary conditions.\n` +
    `3. **Practical Application**: Utilized across engineering, competitive exams (JEE/NEET/UPSC), and software implementations.\n\n` +
    `✨ *Pro-Tip: Enter your Google Gemini API Key in the Chatbot Settings for live conversational multi-turn intelligence!*`
  );
}
