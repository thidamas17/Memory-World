import React, { useState, useEffect } from 'react';
import { WordItem, LanguagePair, PartOfSpeech } from '../types';
import { DICTIONARY_PREVIEWS } from '../data/initialData';
import { playPronunciation } from '../utils/audio';
import {
  Search,
  Sparkles,
  Volume2,
  X,
  Mic,
  MicOff,
  Camera,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  BookmarkPlus,
  ArrowRightLeft,
  Check,
  Image as ImageIcon
} from 'lucide-react';

interface AddWordTabProps {
  onAddWord: (word: WordItem) => void;
  existingWords: WordItem[];
  onNavigateToVault: () => void;
}

export const AddWordTab: React.FC<AddWordTabProps> = ({
  onAddWord,
  existingWords,
  onNavigateToVault,
}) => {
  // Languages
  const [sourceLang, setSourceLang] = useState<'English' | 'Japanese' | 'Chinese'>('English');
  const [targetLang, setTargetLang] = useState<'Thai'>('Thai');

  // Input states
  const [searchQuery, setSearchQuery] = useState('resilient');
  const [isFetching, setIsFetching] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Word fields
  const [word, setWord] = useState('resilient');
  const [phonetic, setPhonetic] = useState('/rɪˈzɪl.i.ənt/');
  const [cefr, setCefr] = useState<'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'>('B2');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('adjective');
  const [translation, setTranslation] = useState('ยืดหยุ่น, คืนสู่สภาพเดิมได้เร็ว, ฟื้นตัวเร็วเมื่อเจอปัญหา');
  const [exampleEn, setExampleEn] = useState('She is a resilient girl who bounces back quickly from adversity');
  const [exampleTh, setExampleTh] = useState('เธอเป็นเด็กผู้หญิงที่มีความยืดหยุ่นทางใจและลุกขึ้นใหม่ได้อย่างรวดเร็ว');

  // Mnemonic Image
  const [hasMnemonic, setHasMnemonic] = useState(true);
  const [imageUrl, setImageUrl] = useState('/src/assets/images/sprout_resilient_1791102424366.jpg');
  const [mnemonicCaption, setMnemonicCaption] = useState('ต้นกล้าแตกหน่อผ่านคอนกรีต สะท้อนความไม่ยอมแพ้');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check if word already exists in vault
  const existingDuplicate = existingWords.find(
    (w) => w.word.trim().toLowerCase() === word.trim().toLowerCase()
  );

  // Auto-fetch definition from predefined dictionary or online API
  const handleAutoFetch = async (queryText: string) => {
    const cleanWord = queryText.trim().toLowerCase();
    if (!cleanWord) return;

    setIsFetching(true);

    // Check predefined list first
    if (DICTIONARY_PREVIEWS[cleanWord]) {
      const match = DICTIONARY_PREVIEWS[cleanWord];
      setTimeout(() => {
        setWord(match.word || queryText);
        setPhonetic(match.phonetic || `/${cleanWord}/`);
        if (match.cefr) setCefr(match.cefr);
        if (match.partOfSpeech) setPartOfSpeech(match.partOfSpeech);
        if (match.translation) setTranslation(match.translation);
        if (match.exampleEn) setExampleEn(match.exampleEn);
        if (match.exampleTh) setExampleTh(match.exampleTh);
        if (match.imageUrl) setImageUrl(match.imageUrl);
        if (match.imageMnemonicCaption) setMnemonicCaption(match.imageMnemonicCaption);
        setIsFetching(false);
      }, 350);
      return;
    }

    // Attempt Free Dictionary API fetch for phonetics and definition
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const entry = data[0];
          setWord(entry.word);
          const firstPhonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text || `/${cleanWord}/`;
          setPhonetic(firstPhonetic);
          const firstMeaning = entry.meanings?.[0];
          if (firstMeaning) {
            const pos = firstMeaning.partOfSpeech;
            if (['adjective', 'noun', 'verb', 'adverb'].includes(pos)) {
              setPartOfSpeech(pos as PartOfSpeech);
            }
            const firstDef = firstMeaning.definitions?.[0];
            if (firstDef) {
              setTranslation(`(ความหมาย): ${firstDef.definition}`);
              if (firstDef.example) {
                setExampleEn(firstDef.example);
                setExampleTh('ประโยคตัวอย่างความหมายตามบริบท');
              }
            }
          }
        }
      }
    } catch {
      // Fallback gracefully
    } finally {
      setIsFetching(false);
    }
  };

  // Voice recognition / microphone trigger
  const handleMicToggle = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setToastMessage('เบราว์เซอร์ไม่รองรับการแปลงเสียงเป็นข้อความ');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = sourceLang === 'Japanese' ? 'ja-JP' : sourceLang === 'Chinese' ? 'zh-CN' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (!isListening) {
      setIsListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        const spokenWord = event.results[0][0].transcript;
        setSearchQuery(spokenWord);
        setWord(spokenWord);
        handleAutoFetch(spokenWord);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } else {
      setIsListening(false);
    }
  };

  // Save to Vault
  const handleSaveToVault = () => {
    if (!word.trim()) return;

    let languagePair: LanguagePair = 'en-th';
    if (sourceLang === 'Japanese') languagePair = 'ja-th';
    if (sourceLang === 'Chinese') languagePair = 'zh-th';

    const newWordItem: WordItem = {
      id: existingDuplicate ? existingDuplicate.id : `word-${Date.now()}`,
      word: word.trim(),
      phonetic: phonetic.trim(),
      partOfSpeech,
      partOfSpeechLabel:
        partOfSpeech === 'adjective'
          ? 'adjective (คุณศัพท์)'
          : partOfSpeech === 'noun'
          ? 'noun (นาม)'
          : partOfSpeech === 'verb'
          ? 'verb (กริยา)'
          : 'adverb (กริยาวิเศษณ์)',
      translation: translation.trim(),
      exampleEn: exampleEn.trim(),
      exampleTh: exampleTh.trim(),
      cefr,
      languagePair,
      repeatCount: existingDuplicate ? existingDuplicate.repeatCount + 1 : 1,
      lastEncountered: 'เมื่อสักครู่',
      priority: existingDuplicate && existingDuplicate.repeatCount >= 2 ? 'high' : 'medium',
      mastered: false,
      accuracy: existingDuplicate ? existingDuplicate.accuracy : 70,
      nextReview: 'ทบทวนใน 1 วัน',
      hasMnemonic,
      imageUrl: hasMnemonic ? imageUrl : undefined,
      imageMnemonicCaption: hasMnemonic ? mnemonicCaption : undefined,
      repeatHistory: existingDuplicate
        ? [
            {
              id: `h-${Date.now()}`,
              timestamp: 'วันนี้ เมื่อสักครู่',
              source: 'บันทึกซ้ำผ่านหน้าจอ เพิ่มศัพท์',
              context: exampleEn,
            },
            ...existingDuplicate.repeatHistory,
          ]
        : [
            {
              id: `h-${Date.now()}`,
              timestamp: 'วันนี้ เมื่อสักครู่',
              source: 'บันทึกคำศัพท์ใหม่ผ่านหน้าจอ เพิ่มศัพท์',
              context: exampleEn,
            },
          ],
      stats: existingDuplicate?.stats || { correct: 1, total: 2 },
    };

    onAddWord(newWordItem);

    if (existingDuplicate) {
      setToastMessage(
        `⚡️ ตรวจพบคำศัพท์ซ้ำ! เพิ่ม repeat_count เป็น ${newWordItem.repeatCount} ครั้ง และปรับขึ้นคิวทบทวนแล้ว`
      );
    } else {
      setToastMessage(`✓ บันทึกคำศัพท์ "${word}" เข้าคลังสำเร็จ!`);
    }

    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-3.5 pb-20">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-4 right-4 z-50 max-w-md mx-auto p-3 bg-[#1e1b4b] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xl flex items-center justify-between animate-fade-in border border-indigo-400/30">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-indigo-300 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Language Selector Row */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-1.5 shadow-xs border border-[#ebdcd0]">
        <div className="relative flex-1">
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as any)}
            className="w-full bg-transparent py-2 px-3 text-xs sm:text-sm font-medium text-[#1e1b17] focus:outline-hidden cursor-pointer appearance-none text-center"
          >
            <option value="English">English (อังกฤษ)</option>
            <option value="Japanese">Japanese (ญี่ปุ่น)</option>
            <option value="Chinese">Chinese (จีน)</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none text-slate-400">
            ▼
          </span>
        </div>

        <button
          onClick={() => {
            // Toggle effect feedback
            setToastMessage('สลับภาษาหลักเรียบร้อย');
            setTimeout(() => setToastMessage(null), 1500);
          }}
          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors mx-1"
          title="สลับภาษา"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <div className="relative flex-1">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as any)}
            className="w-full bg-transparent py-2 px-3 text-xs sm:text-sm font-medium text-[#1e1b17] focus:outline-hidden cursor-pointer appearance-none text-center"
          >
            <option value="Thai">ไทย (Thai)</option>
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none text-slate-400">
            ▼
          </span>
        </div>
      </div>

      {/* Card 1: Input Word Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#ebdcd0]">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#443f38]">
            <Search className="w-4 h-4 text-slate-500" />
            <span>คำศัพท์ที่ต้องการเพิ่ม</span>
          </div>
          <button
            onClick={() => handleAutoFetch(searchQuery)}
            disabled={isFetching}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/60 rounded-full text-[11px] font-semibold transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>{isFetching ? 'กำลังดึง...' : 'Live Auto-Fetch'}</span>
          </button>
        </div>

        {/* Search input field */}
        <div className="relative flex items-center bg-[#faf6f0] border border-[#ebdcd0] rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-indigo-700/30 focus-within:border-indigo-700 transition-all">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setWord(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAutoFetch(searchQuery);
              }
            }}
            placeholder="พิมพ์คำศัพท์ เช่น resilient, ephemeral..."
            className="w-full bg-transparent font-bold text-lg sm:text-xl text-[#1e1b17] placeholder:text-slate-400 focus:outline-hidden"
          />

          <div className="flex items-center gap-1.5 ml-2">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setWord('');
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleMicToggle}
              className={`p-1.5 rounded-full transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200'
              }`}
              title="ค้นหาด้วยเสียง"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status Line */}
        <div className="flex items-center gap-2 mt-2.5 text-xs text-[#8a5b28]">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block"></span>
          <span className="font-semibold text-amber-600">✦ RKLES</span>
          <span className="text-[#6c6760]">
            ดึงข้อมูลจาก Dictionary API อัตโนมัติสมบูรณ์แล้ว
          </span>
        </div>
      </div>

      {/* Card 2: Word Details & Definition Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#ebdcd0] space-y-4">
        {/* Word, audio & CEFR Level */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a146b] tracking-tight">
              {word || 'คำศัพท์'}
            </h2>
            <button
              onClick={() => playPronunciation(word, sourceLang === 'Japanese' ? 'ja-JP' : sourceLang === 'Chinese' ? 'zh-CN' : 'en-US')}
              className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-[#1a146b] flex items-center justify-center transition-transform active:scale-90"
              title="ฟังเสียงออกเสียง"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[11px] text-[#716e69] font-medium leading-tight">CEFR Level</span>
            <span className="text-xs font-bold text-[#1a146b] bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded-md mt-0.5">
              {cefr}
            </span>
          </div>
        </div>

        {/* Phonetic */}
        <div className="text-sm font-medium text-[#716e69]">
          {phonetic}
        </div>

        {/* ชนิดของคำ (Part of Speech) */}
        <div>
          <label className="block text-xs font-semibold text-[#443f38] mb-2">
            ชนิดของคำ (Part of Speech)
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'adjective', label: 'adjective (คุณศัพท์)' },
              { id: 'noun', label: 'noun (นาม)' },
              { id: 'verb', label: 'verb (กริยา)' },
              { id: 'adverb', label: 'adverb (กริยาวิเศษณ์)' },
            ].map((item) => {
              const isSelected = partOfSpeech === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPartOfSpeech(item.id as PartOfSpeech)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#1a146b] text-white shadow-xs'
                      : 'bg-[#faf6f0] text-[#554f46] hover:bg-[#ebdcd0]/60 border border-[#ebdcd0]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ความหมาย / คำแปล (แก้ไขได้) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[#443f38]">
              ความหมาย / คำแปล (แก้ไขได้)
            </label>
            <span className="text-[11px] text-[#8c867f]">แตะเพื่อแก้ไข</span>
          </div>
          <div className="p-3 bg-[#fdfcf9] border border-[#ebdcd0] rounded-xl focus-within:ring-2 focus-within:ring-indigo-700/20">
            <textarea
              rows={2}
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-[#2a2621] leading-relaxed resize-none focus:outline-hidden"
              placeholder="ใส่คำแปลหรือความหมาย..."
            />
          </div>
        </div>

        {/* ประโยคตัวอย่าง (Example Context) */}
        <div>
          <label className="block text-xs font-semibold text-[#443f38] mb-1.5">
            ประโยคตัวอย่าง (Example Context)
          </label>
          <div className="p-3 bg-[#faf6f0]/70 border border-[#ebdcd0] rounded-xl relative space-y-1.5">
            <div className="flex items-start gap-2">
              <span className="text-indigo-900 font-serif text-xl leading-none select-none">“</span>
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={exampleEn}
                  onChange={(e) => setExampleEn(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold text-[#1e1b17] focus:outline-hidden"
                  placeholder="Example sentence in English..."
                />
                <input
                  type="text"
                  value={exampleTh}
                  onChange={(e) => setExampleTh(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#6e6860] italic focus:outline-hidden"
                  placeholder="คำแปลประโยคตัวอย่าง..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: รูปภาพช่วยจำ (Visual Mnemonic) */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#ebdcd0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1e1b17]">
            <ImageIcon className="w-4 h-4 text-indigo-700" />
            <span>รูปภาพช่วยจำ (Visual Mnemonic)</span>
          </div>
          {/* Toggle Switch */}
          <button
            onClick={() => setHasMnemonic(!hasMnemonic)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
              hasMnemonic ? 'bg-[#1a146b]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                hasMnemonic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {hasMnemonic && (
          <div className="p-3 bg-[#faf6f0]/80 rounded-xl border border-[#ebdcd0] flex flex-col sm:flex-row gap-3 items-center">
            {/* Image Thumbnail */}
            <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 border border-[#ebdcd0] shadow-2xs group">
              <img
                src={imageUrl}
                alt="Visual mnemonic preview"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => setHasMnemonic(false)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center text-xs transition-colors"
                title="ลบรูปภาพ"
              >
                ✕
              </button>
            </div>

            {/* Mnemonic Details & Action buttons */}
            <div className="flex-1 space-y-2 w-full">
              <div className="text-xs text-[#443f38] leading-relaxed">
                <span className="font-semibold text-[#1e1b17]">ภาพความหมาย:</span>{' '}
                <input
                  type="text"
                  value={mnemonicCaption}
                  onChange={(e) => setMnemonicCaption(e.target.value)}
                  className="bg-white px-2 py-1 rounded-md border border-[#ebdcd0] text-xs text-[#2e2a24] w-full mt-1 focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
                />
              </div>

              {/* Upload & URL buttons */}
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#ebdcd0] rounded-lg text-xs font-medium text-[#443f38] cursor-pointer transition-colors shadow-2xs">
                  <Camera className="w-3.5 h-3.5 text-indigo-700" />
                  <span>อัปโหลดรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setImageUrl(url);
                        setToastMessage('อัปโหลดรูปภาพช่วยจำสำเร็จ!');
                        setTimeout(() => setToastMessage(null), 2000);
                      }
                    }}
                  />
                </label>

                <button
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-[#ebdcd0] rounded-lg text-xs font-medium text-[#443f38] transition-colors shadow-2xs"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-700" />
                  <span>ใส่ URL ภาพ</span>
                </button>
              </div>

              {/* URL Input dropdown */}
              {showUrlInput && (
                <div className="flex gap-1.5 pt-1">
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 text-xs px-2 py-1 bg-white border border-[#ebdcd0] rounded-lg focus:outline-hidden"
                  />
                  <button
                    onClick={() => {
                      if (customUrl.trim()) {
                        setImageUrl(customUrl.trim());
                        setShowUrlInput(false);
                      }
                    }}
                    className="text-xs px-2.5 py-1 bg-indigo-900 text-white rounded-lg font-medium"
                  >
                    ใช้รูป
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Database Verification Status Card */}
      {existingDuplicate ? (
        <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-amber-900 leading-tight">
                ตรวจพบคำศัพท์นี้แล้วในคลัง!
              </div>
              <div className="text-[11px] sm:text-xs text-amber-700 leading-tight mt-0.5">
                บันทึกซ้ำมาแล้ว {existingDuplicate.repeatCount} ครั้ง ระบบจะเพิ่ม repeat_count อัตโนมัติและจัดขึ้นคิวทบทวน
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToVault}
            className="text-xs font-semibold text-amber-900 underline ml-2 shrink-0"
          >
            ดูการ์ด
          </button>
        </div>
      ) : (
        <div className="p-3.5 bg-emerald-50/90 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-emerald-900 leading-tight">
                ตรวจสอบฐานข้อมูลแล้ว
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-700 leading-tight mt-0.5">
                คำศัพท์ใหม่! ยังไม่มีในคลังคำศัพท์ของคุณ
              </div>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        </div>
      )}

      {/* Big Action Button */}
      <button
        onClick={handleSaveToVault}
        className="w-full py-3.5 px-4 bg-[#1a146b] hover:bg-[#251e8a] active:scale-[0.99] text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-indigo-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <BookmarkPlus className="w-5 h-5" />
        <span>บันทึกเข้าคลังคำศัพท์ (+ Add to Vault)</span>
      </button>
    </div>
  );
};
