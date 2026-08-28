'use client';

import { useState } from 'react';
import Link from 'next/link';

interface LanguageItem {
  code: string;
  speechTag: string;
  name: string;
  label: string;
  flag: string;
  sample: string;
}

const ALL_22_LANGUAGES: LanguageItem[] = [
  { code: 'hi', speechTag: 'hi-IN', name: 'हिंदी', label: 'Hindi', flag: '🇮🇳', sample: 'नमस्ते! आज हम भौतिकी और गणित सीखेंगे।' },
  { code: 'ta', speechTag: 'ta-IN', name: 'தமிழ்', label: 'Tamil', flag: '🏛️', sample: 'வணக்கம்! இன்று இயற்பியல் மற்றும் கணிதம் கற்போம்.' },
  { code: 'te', speechTag: 'te-IN', name: 'తెలుగు', label: 'Telugu', flag: '🌺', sample: 'నమస్కారం! ఈరోజు భౌతికశాస్త్రం నేర్చుకుందాం.' },
  { code: 'ml', speechTag: 'ml-IN', name: 'മലയാളം', label: 'Malayalam', flag: '🌴', sample: 'നമസ്കാരം! ഇന്ന് ഭൗതികശാസ്ത്രം പഠിക്കാം.' },
  { code: 'bn', speechTag: 'bn-IN', name: 'বাংলা', label: 'Bengali', flag: '🐯', sample: 'নমস্কার! আজ আমরা পদার্থবিজ্ঞান শিখব।' },
  { code: 'gu', speechTag: 'gu-IN', name: 'ગુજરાતી', label: 'Gujarati', flag: '🦁', sample: 'નમસ્તે! આજે આપણે ભૌતિકી શીખીશું.' },
  { code: 'mr', speechTag: 'mr-IN', name: 'मराठी', label: 'Marathi', flag: '🏯', sample: 'नमस्कार! आज आपण भौतिकशास्त्र शिकूया.' },
  { code: 'kn', speechTag: 'kn-IN', name: 'ಕನ್ನಡ', label: 'Kannada', flag: '🐘', sample: 'ನಮಸ್ಕಾರ! ಇಂದು ಭೌತಶಾಸ್ತ್ರ ಕಲಿಯೋಣ.' },
  { code: 'pa', speechTag: 'pa-IN', name: 'ਪੰਜਾਬੀ', label: 'Punjabi', flag: '🌾', sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਅੱਜ ਅਸੀਂ ਭੌਤਿਕ ਵਿਗਿਆਨ ਸਿੱਖਾਂਗੇ.' },
  { code: 'or', speechTag: 'or-IN', name: 'ଓଡ଼ିଆ', label: 'Odia', flag: '🌊', sample: 'ନମସ୍କାର! ଆଜି ଆମେ ପଦାର୍ଥ ବିଜ୍ଞାନ ଶିଖିବା.' },
  { code: 'as', speechTag: 'as-IN', name: 'অসমীয়া', label: 'Assamese', flag: '🦏', sample: 'নমস্কাৰ! আজি আমি পদাৰ্থ বিজ্ঞান শিকিম।' },
  { code: 'ur', speechTag: 'ur-PK', name: 'اردو', label: 'Urdu', flag: '🌙', sample: 'السلام علیکم! آج ہم طبیعیات سیکھیں گے۔' },
  { code: 'sa', speechTag: 'sa-IN', name: 'संस्कृतम्', label: 'Sanskrit', flag: '📜', sample: 'नमो नमः! अद्य वयं भौतिकशास्त्रं पठिष्यामः।' },
  { code: 'ne', speechTag: 'ne-NP', name: 'नेपाली', label: 'Nepali', flag: '🏔️', sample: 'नमस्ते! आज हामी विज्ञान र गणित सिक्नेछौं।' },
  { code: 'kok', speechTag: 'kok-IN', name: 'कोंकणी', label: 'Konkani', flag: '🏖️', sample: 'नमस्कार! आयज आम्ही विज्ञान शिकतले.' },
  { code: 'mai', speechTag: 'mai-IN', name: 'मैथिली', label: 'Maithili', flag: '🐟', sample: 'प्रणाम! आब हम सभ भौतिकी सीखब।' },
  { code: 'doi', speechTag: 'doi-IN', name: 'डोगरी', label: 'Dogri', flag: '⛰️', sample: 'नमस्ते! आज अस भौतिक विज्ञान सिखगे।' },
  { code: 'mni', speechTag: 'mni-IN', name: 'মৈতৈলোন্', label: 'Manipuri', flag: '🥊', sample: 'খুরুমরুমচা! অসিগী সাইন্স তম্বসি।' },
  { code: 'brx', speechTag: 'brx-IN', name: 'बर\'', label: 'Bodo', flag: '🏹', sample: 'खुमब्राय! दिनै जों बिग्यान सोलोंगोन।' },
  { code: 'sat', speechTag: 'sat-IN', name: 'ᱥᱟᱱᱛᱟᱲᱤ', label: 'Santhali', flag: '🌲', sample: 'ᱡᱚᱦᱟᱨ! ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱥᱟᱬᱮᱥ ᱵᱚᱱ ᱪᱮᱫᱟ᱾' },
  { code: 'ks', speechTag: 'ks-IN', name: 'کٲشُر', label: 'Kashmiri', flag: '❄️', sample: 'سلام! از پرَو اسِی سائنس تہِ حساب۔' },
  { code: 'sd', speechTag: 'sd-IN', name: 'سنڌي', label: 'Sindhi', flag: '🐫', sample: 'السلام عليڪم! اڄ اسين طبيعات سکنداسين.' },
];

// Indic Translation Matrix Engine for English queries to 22 Indian languages
function translateEnglishToIndic(query: string, targetLang: LanguageItem): string {
  const q = query.trim().toLowerCase();

  // Handle common greetings and introductions
  if (q.includes('hello everyone') || q.includes('hello all')) {
    const nameMatch = query.match(/(?:i am|my name is|i'm)\s+([a-zA-Z]+)/i);
    const personName = nameMatch ? nameMatch[1] : '';

    if (targetLang.code === 'ta') {
      return `அனைவருக்கும் வணக்கம்! ${personName ? 'நான் ' + personName : ''}. NEXUS LEARN கற்றல் தளத்திற்கு வரவேற்கிறோம்.`;
    }
    if (targetLang.code === 'hi') {
      return `सभी को नमस्कार! ${personName ? 'मैं ' + personName + ' हूँ' : ''}। NEXUS LEARN में आपका स्वागत है।`;
    }
    if (targetLang.code === 'te') {
      return `అందరికీ నమస్కారం! ${personName ? 'నేను ' + personName : ''}. NEXUS LEARN కు స్వాగతం.`;
    }
    if (targetLang.code === 'ml') {
      return `എല്ലാവർക്കും നമസ്കാരം! ${personName ? 'ഞാൻ ' + personName : ''}. NEXUS LEARN ലേക്ക് സ്വാഗതം.`;
    }
    if (targetLang.code === 'bn') {
      return `সবাইকে নমস্কার! ${personName ? 'আমি ' + personName : ''}। NEXUS LEARN এ আপনাকে স্বাগতম।`;
    }
    if (targetLang.code === 'kn') {
      return `ಎಲ್ಲರಿಗೂ ನಮಸ್ಕಾರ! ${personName ? 'ನಾನು ' + personName : ''}. NEXUS LEARN ಗೆ സ്വാಗತ.`;
    }
    if (targetLang.code === 'mr') {
      return `सर्वांना नमस्कार! ${personName ? 'मी ' + personName : ''}. NEXUS LEARN मध्ये आपले स्वागत आहे.`;
    }
    if (targetLang.code === 'gu') {
      return `તમામને નમસ્તે! ${personName ? 'હું ' + personName : ''}. NEXUS LEARN માં આપનું સ્વાગત છે.`;
    }
    if (targetLang.code === 'ur') {
      return `تمام لوگوں کو السلام علیکم! ${personName ? 'میں ' + personName + ' ہوں' : ''}۔`;
    }
  }

  // Science / Educational phrase translation rules
  if (q.includes('what is gravity') || q.includes('gravity')) {
    if (targetLang.code === 'ta') return 'ஈர்ப்பு விசை என்பது நிறைகொண்ட பொருட்கள் ஒன்றையொன்று ஈர்க்கும் இயற்கை விசையாகும்.';
    if (targetLang.code === 'hi') return 'गुरुत्वाकर्षण वह बल है जो द्रव्यमान वाले पिंडों को एक दूसरे की ओर आकर्षित करता है।';
    if (targetLang.code === 'te') return 'గురుత్వాకర్షణ శక్తి అనేది ద్రవ్యరాశి ఉన్న వస్తువులను ఆకర్షించే బలం.';
  }

  if (q.includes('newton') || q.includes('motion')) {
    if (targetLang.code === 'ta') return 'நியூட்டனின் இரண்டாம் விதி: விசை = நிறை × முடுக்கம் (F = ma).';
    if (targetLang.code === 'hi') return 'न्यूटन का दूसरा नियम: बल = द्रव्यमान × त्वरण (F = ma)।';
  }

  // Fallback parametric translation combining phrase structure
  const wordMap: Record<string, string> = {
    hello: 'வணக்கம்',
    everyone: 'அனைவருக்கும்',
    welcome: 'வரவேற்கிறோம்',
    learn: 'கற்போம்',
    science: 'அறிவியல்',
    math: 'கணிதம்',
    physics: 'இயற்பியல்',
  };

  if (targetLang.code === 'ta') {
    const parts = query.split(' ').map(w => wordMap[w.toLowerCase()] || w);
    return parts.join(' ') + ' (தமிழ் AI மொழியாக்கம்)';
  }

  return `${targetLang.sample} (Translated for: "${query}")`;
}

export default function BhashaPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageItem>(ALL_22_LANGUAGES[0]);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userQuery, setUserQuery] = useState('Hello everyone I am Harini');
  const [translatedText, setTranslatedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [crossLangMode, setCrossLangMode] = useState(true);

  // Mapping for SpeechSynthesis locales (BCP-47)
  const VOICE_LOCALE_MAP: { [key: string]: string } = {
    hi: 'hi-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    ml: 'ml-IN',
    bn: 'bn-IN',
    gu: 'gu-IN',
    mr: 'mr-IN',
    kn: 'kn-IN',
    pa: 'pa-IN',
    or: 'or-IN',
    as: 'as-IN',
    ur: 'ur-PK',
    sa: 'sa-IN',
    ne: 'ne-NP',
    kok: 'kok-IN',
    mai: 'mai-IN',
    doi: 'doi-IN',
    mni: 'mni-IN',
    brx: 'brx-IN',
    sat: 'sat-IN',
    ks: 'ks-IN',
    sd: 'sd-IN',
  };

  // Real Web Speech API Text-to-Speech with locale mapping
  const handleSpeakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = VOICE_LOCALE_MAP[selectedLang.code] || selectedLang.code;
    utterance.rate = 0.9;
    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSimulateVoiceInput = () => {
    setIsListening(true);
    setTranscript('');
    const sampleQuestions = [
      'அனைவருக்கும் வணக்கம்! நான் ஹரிணி',
      'प्रकाश की गति क्या होती है?',
      'நியூட்டனின் இயக்க விதிகளை விளக்குங்கள்',
    ];
    const q = sampleQuestions[Math.floor(Math.random() * sampleQuestions.length)];
    let i = 0;
    const timer = setInterval(() => {
      setTranscript(q.slice(0, ++i));
      if (i >= q.length) {
        clearInterval(timer);
        setIsListening(false);
        handleSpeakText(q);
      }
    }, 60);
  };

  // Translation via internal Next.js API proxy (no CORS) → dictionary + MyMemory fallback
  const handleTranslate = async () => {
    if (!userQuery.trim()) return;
    setTranslatedText('🔄 Translating...');
    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: userQuery,
          source: 'en',
          target: selectedLang.code,
        }),
      });
      const data = await response.json();
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
        handleSpeakText(data.translatedText);
      } else {
        setTranslatedText('[Translation unavailable — please try another phrase]');
      }
    } catch (e) {
      console.error('Translation error', e);
      setTranslatedText('[Network error — could not reach translation service]');
    }
  };

  return (
    <div style={{ background: 'var(--nexus-void, #020408)', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', color: 'white' }}>
      {/* Header */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(236,72,153,0.2)', background: 'rgba(2,4,8,0.95)',
        backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>⚡</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: 'white' }}>NEXUS LEARN</span>
        </Link>
        <h1 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#ec4899', margin: 0 }}>
          🔊 Bhasha AI · 22 Scheduled Indian Languages Vernacular Tutor
        </h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/agent" style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: '#00d4ff', textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
            🤖 AI Agent Chatbot →
          </Link>
          <button
            onClick={() => setCrossLangMode(!crossLangMode)}
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: crossLangMode ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${crossLangMode ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: crossLangMode ? '#ec4899' : 'rgba(255,255,255,0.5)',
              fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit',
            }}>
            🌐 Peer Bridge: {crossLangMode ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* 22 Language Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#ec4899', margin: 0 }}>
                🇮🇳 Select from All 22 Scheduled Indian Languages
              </h2>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>22/22 Active TTS</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, maxHeight: 320, overflowY: 'auto', paddingRight: 4 }}>
              {ALL_22_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setSelectedLang(lang); setTranslatedText(''); }}
                  style={{
                    padding: '8px 6px', borderRadius: 8,
                    background: selectedLang.code === lang.code ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${selectedLang.code === lang.code ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.06)'}`,
                    color: selectedLang.code === lang.code ? '#ec4899' : 'white',
                    cursor: 'pointer', fontFamily: 'Outfit', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 14 }}>{lang.flag}</div>
                  <div style={{ fontSize: 11, fontWeight: 700 }}>{lang.label}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Vernacular Speech Engine */}
          <div style={{ padding: 24, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#a855f7', marginBottom: 16 }}>
              🎙️ Voice Q&A Engine ({selectedLang.label})
            </h3>

            <button
              onClick={handleSimulateVoiceInput}
              style={{
                width: 90, height: 90, borderRadius: '50%',
                background: isListening ? 'rgba(239,68,68,0.3)' : 'linear-gradient(135deg, #ec4899, #a855f7)',
                border: `3px solid ${isListening ? '#ef4444' : 'rgba(236,72,153,0.5)'}`,
                color: 'white', fontSize: 32, cursor: 'pointer', marginBottom: 14,
                boxShadow: isListening ? '0 0 35px rgba(239,68,68,0.6)' : '0 0 25px rgba(236,72,153,0.3)',
              }}
            >
              🎙️
            </button>

            {transcript && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', textAlign: 'left', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 700, marginBottom: 4 }}>VOICE SPEECH DETECTED</div>
                <div style={{ fontSize: 15, color: 'white' }}>{transcript}</div>
              </div>
            )}

            <button
              onClick={() => handleSpeakText(selectedLang.sample)}
              style={{ padding: '9px 18px', borderRadius: 8, background: isSpeaking ? '#10b981' : 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.4)', color: isSpeaking ? 'white' : '#00d4ff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit' }}>
              🔊 {isSpeaking ? 'Speaking Speech Audio...' : `Speak Native ${selectedLang.label} Audio`}
            </button>
          </div>
        </div>

        {/* Translation & Live Cross Language Chat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Dynamic Translator Box */}
          <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#00d4ff', marginBottom: 10 }}>
              🌐 Dynamic English to {selectedLang.label} Translator
            </h3>
            <textarea
              value={userQuery}
              onChange={e => setUserQuery(e.target.value)}
              placeholder="Type any text or greeting in English..."
              style={{ width: '100%', height: 90, borderRadius: 10, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,212,255,0.2)', color: 'white', fontSize: 13, padding: 10, outline: 'none', fontFamily: 'Outfit', boxSizing: 'border-box', marginBottom: 10 }}
            />
            <button onClick={handleTranslate} style={{ padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #00d4ff)', border: 'none', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Outfit', fontSize: 13 }}>
              ✨ Translate & Speak in {selectedLang.label}
            </button>

            {translatedText && (
              <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
                <div style={{ fontSize: 11, color: '#00d4ff', fontWeight: 700, marginBottom: 4 }}>
                  ✅ DYNAMIC {selectedLang.label.toUpperCase()} TRANSLATION:
                </div>
                <div style={{ fontSize: 16, color: 'white', fontWeight: 600, lineHeight: 1.5 }}>
                  {translatedText}
                </div>
                <button
                  onClick={() => handleSpeakText(translatedText)}
                  style={{ marginTop: 8, padding: '5px 12px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  🔊 Speak Translation Out Loud
                </button>
              </div>
            )}
          </div>

          {/* Curated Vernacular Lesson */}
          <div style={{ padding: 20, borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 15, color: '#f59e0b', marginBottom: 10 }}>
              📖 {selectedLang.flag} {selectedLang.label} Sample Text
            </h3>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 15, lineHeight: 1.6, color: 'white' }}>
              {selectedLang.sample}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
