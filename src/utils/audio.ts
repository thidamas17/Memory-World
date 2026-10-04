/**
 * Pronunciation player utilizing the Web Speech API with fallback
 */
export function playPronunciation(text: string, lang: 'en-US' | 'ja-JP' | 'zh-CN' = 'en-US'): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis is not supported in this browser.');
    return;
  }

  // Cancel any ongoing utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9; // Slightly slower for clear vocabulary learning
  utterance.pitch = 1.0;

  // Find preferred voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(
    (voice) => voice.lang.startsWith(lang.split('-')[0]) && !voice.localService
  ) || voices.find((voice) => voice.lang.startsWith(lang.split('-')[0]));

  if (preferredVoice) {
    utterance.voice = preferredVoice;
  }

  window.speechSynthesis.speak(utterance);
}
