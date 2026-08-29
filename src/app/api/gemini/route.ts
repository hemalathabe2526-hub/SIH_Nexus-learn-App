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
      const systemInstruction =
        "You are NEXUS AI, an expert, concise, and enthusiastic AI tutor for NEXUS LEARN. " +
        "Provide clear, crisp, and easy-to-understand educational explanations with key principles, formulas, bullet points, and real-world examples. " +
        "Keep responses brief and punchy under 150 words.";

      const candidateModels = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-flash-latest',
      ];

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

      for (const modelName of candidateModels) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(1500), // Fast 1.5s timeout for instant response
            body: JSON.stringify({
              contents,
              systemInstruction: {
                parts: [{ text: systemInstruction }],
              },
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 300, // Compact for lightning-fast latency
              },
            }),
          });

          if (response.ok) {
            const data = await response.json();
            const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (candidate) {
              return NextResponse.json({
                reply: candidate,
                source: modelName,
                hasGeminiKey: true,
              });
            }
          }
        } catch {
          // Timeout or model busy, try next or fallback instantly
        }
      }
    }

    // Instant Educational Fallback in <50ms
    return NextResponse.json({
      reply: generateFallbackResponse(prompt),
      source: 'nexus-instant-engine',
      hasGeminiKey: false,
    });
  } catch (error) {
    console.error('Error in /api/gemini route:', error);
    return NextResponse.json(
      { reply: generateFallbackResponse('general education'), source: 'nexus-instant-engine', hasGeminiKey: false },
      { status: 200 }
    );
  }
}

function generateFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('gemini') || q.includes('api key') || q.includes('what is gemini')) {
    return (
      "### 🤖 Google Gemini API in NEXUS LEARN\n\n" +
      "**Google Gemini** is Google's state-of-the-art multimodal AI model family (`gemini-2.0-flash`, `gemini-1.5-flash`).\n\n" +
      "- **Role in NEXUS**: Powers 24/7 Socratic tutoring, real-time struggle detection, and adaptive problem hints.\n" +
      "- **Getting a Free Key**: Get your key in 30 seconds at [aistudio.google.com](https://aistudio.google.com), then paste it in the **🔑 Key** button at top right.\n" +
      "- **Supercharged Speed**: Responses generate in under 1 second with live multi-turn context!"
    );
  }

  if (q.includes('newton') || q.includes('motion') || q.includes('force')) {
    return (
      "### 🪐 Sir Isaac Newton's Three Laws of Motion\n\n" +
      "1. **First Law (Law of Inertia)**: An object remains at rest or in uniform motion unless acted upon by a net external force.\n" +
      "2. **Second Law (F = ma)**: The rate of change of momentum is directly proportional to the applied force. **Formula: F = m × a**.\n" +
      "3. **Third Law (Action-Reaction)**: For every action, there is an equal and opposite reaction.\n\n" +
      "💡 *Tip: Test these principles in our 3D Physics Virtual Lab!*"
    );
  }

  if (q.includes('doppler') || q.includes('sound') || q.includes('frequency')) {
    return (
      "### 🔊 The Doppler Effect\n\n" +
      "The apparent shift in wave frequency when the wave source and observer move relative to each other.\n\n" +
      "- **Approaching Source**: Wavefronts compress → Observed frequency **increases** (higher pitch / blueshift).\n" +
      "- **Receding Source**: Wavefronts stretch → Observed frequency **decreases** (lower pitch / redshift).\n" +
      "- **Formula**: $f' = f \\times \\frac{v \\pm v_o}{v \\mp v_s}$\n\n" +
      "🚨 *Example: An ambulance siren sounds higher pitched as it speeds toward you.*"
    );
  }

  if (q.includes('titration') || q.includes('ph') || q.includes('acid') || q.includes('base')) {
    return (
      "### ⚗️ Acid-Base Titration & pH Calculations\n\n" +
      "- **Equivalence Point**: Point where moles of $H^+$ from acid equal moles of $OH^-$ from base.\n" +
      "- **Formula**: $C_1 V_1 = C_2 V_2$ (Molarity × Volume)\n" +
      "- **Phenolphthalein Indicator**: Colorless in acidic pH (<8.2) → Vivid pink in basic pH (>10.0).\n" +
      "- **Strong Acid + Strong Base Neutralization**: $HCl + NaOH \\rightarrow NaCl + H_2O$ (pH = 7.0 at equivalence)."
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
    `### 🤖 NEXUS AI Concept Breakdown: ${topic.toUpperCase()}\n\n` +
    `1. **Core Concept**: **${topic}** is an essential educational topic across school, college, and competitive exams.\n` +
    `2. **Fundamental Rule**: Master the underlying formulas, step-by-step derivations, and boundary limits.\n` +
    `3. **Real-World Impact**: Applied directly in science simulations, engineering design, and algorithmic problem solving.\n\n` +
    `✨ *Pro-Tip: Configure your Gemini API Key in the Chatbot Settings for live conversational generation!*`
  );
}
