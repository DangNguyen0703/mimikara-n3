// Japanese Text-to-Speech (TTS) pronunciation utility
export function speakJapanese(text: string, rate: number = 0.9) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel(); // Stop any pending speech

  const cleanText = text.split('/')[0].split('（')[0].trim(); // take primary reading if multiple
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ja-JP';
  utterance.rate = rate; // slightly slower for clear Japanese learner listening
  utterance.pitch = 1.0;

  // Try to find a native Japanese voice if available
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang === 'ja_JP' || v.name.includes('Japanese'));
  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  window.speechSynthesis.speak(utterance);
}
