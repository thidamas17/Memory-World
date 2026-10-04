import React, { useState } from 'react';
import { WordItem, LanguagePair } from '../types';
import { playPronunciation } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  BarChart2,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Shuffle,
  FileEdit,
  SkipForward,
  Sparkles,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';

interface ReviewTabProps {
  words: WordItem[];
  onUpdateWord: (word: WordItem) => void;
  onOpenEditModal: (word: WordItem) => void;
  autoPronounce: boolean;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({
  words,
  onUpdateWord,
  onOpenEditModal,
  autoPronounce,
}) => {
  // Filter for review cards
  const [filter, setFilter] = useState<'all' | 'repeated' | 'en' | 'ja'>('all');

  // Daily review progress stats (matching screenshot 8 / 20, 12 mastered, 4 repeat)
  const [rememberedCount, setRememberedCount] = useState(12);
  const [needsRepeatCount, setNeedsRepeatCount] = useState(4);
  const [currentProgressIndex, setCurrentProgressIndex] = useState(8);
  const totalDeckGoal = 20;

  // Active card index in filtered list
  const [currentIndex, setCurrentIndex] = useState(1); // default to Serendipity (index 1 in initial mock)
  const [isFlipped, setIsFlipped] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Filter words
  const filteredWords = words.filter((w) => {
    if (filter === 'repeated') return w.repeatCount > 1;
    if (filter === 'en') return w.languagePair === 'en-th';
    if (filter === 'ja') return w.languagePair === 'ja-th';
    return true;
  });

  const activeCard = filteredWords[currentIndex % (filteredWords.length || 1)] || words[0];

  // Flip card
  const handleFlip = () => {
    const nextFlipState = !isFlipped;
    setIsFlipped(nextFlipState);

    // Auto-pronounce when flipping to reveal answer if enabled
    if (nextFlipState && autoPronounce && activeCard) {
      playPronunciation(
        activeCard.word,
        activeCard.languagePair === 'ja-th' ? 'ja-JP' : activeCard.languagePair === 'zh-th' ? 'zh-CN' : 'en-US'
      );
    }
  };

  // Next card handler
  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredWords.length);
  };

  // Action: จำได้แล้ว (Mastered / Good)
  const handleRemembered = () => {
    setRememberedCount((prev) => prev + 1);
    setCurrentProgressIndex((prev) => Math.min(totalDeckGoal, prev + 1));

    // Update word stats
    if (activeCard) {
      const updatedWord: WordItem = {
        ...activeCard,
        accuracy: Math.min(100, activeCard.accuracy + 5),
        stats: {
          correct: (activeCard.stats?.correct || 0) + 1,
          total: (activeCard.stats?.total || 0) + 1,
        },
        mastered: activeCard.accuracy + 5 >= 90,
      };
      onUpdateWord(updatedWord);
    }

    // Fire celebration confetti if reached goal or mastered
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#312e81', '#10b981', '#f59e0b'],
    });

    handleNext();
  };

  // Action: ยังจำไม่ได้ (Needs review)
  const handleForgot = () => {
    setNeedsRepeatCount((prev) => prev + 1);

    if (activeCard) {
      const updatedWord: WordItem = {
        ...activeCard,
        repeatCount: activeCard.repeatCount + 1,
        priority: 'high',
        accuracy: Math.max(30, activeCard.accuracy - 5),
        stats: {
          correct: activeCard.stats?.correct || 0,
          total: (activeCard.stats?.total || 0) + 1,
        },
      };
      onUpdateWord(updatedWord);
    }

    handleNext();
  };

  // Shuffle queue
  const handleShuffle = () => {
    const randomIdx = Math.floor(Math.random() * filteredWords.length);
    setIsFlipped(false);
    setCurrentIndex(randomIdx);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎓</span>
            <h2 className="text-base sm:text-lg font-bold text-[#1e1b17]">
              ทบทวนประจำวัน
            </h2>
          </div>
          <div className="text-xs font-bold text-[#443f38] bg-white px-2.5 py-1 rounded-full border border-[#ebdcd0] shadow-2xs">
            <span className="text-indigo-900">{currentProgressIndex}</span> / {totalDeckGoal} คำ
          </div>
        </div>

        {/* Progress Track */}
        <div className="h-2 w-full bg-[#ebdcd0]/70 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1a146b] to-[#4338ca] rounded-full transition-all duration-300"
            style={{ width: `${(currentProgressIndex / totalDeckGoal) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: '✓ ทั้งหมด' },
          { id: 'repeated', label: '⚠️ บันทึกซ้ำบ่อย' },
          { id: 'en', label: '文A อังกฤษ ➔ ไทย' },
          { id: 'ja', label: '🇯🇵 ญี่ปุ่น ➔ ไทย' },
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => {
              setFilter(chip.id as any);
              setIsFlipped(false);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
              filter === chip.id
                ? 'bg-[#1a146b] text-white'
                : 'bg-white text-[#57534e] hover:bg-[#faf6f0] border border-[#ebdcd0]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* The Flashcard (Interactive 3D Flip) */}
      <div className="perspective-1000 w-full min-h-[360px] cursor-pointer" onClick={handleFlip}>
        <div
          className={`relative w-full transition-transform duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{ minHeight: '380px' }}
        >
          {/* FRONT SIDE */}
          <div className="absolute inset-0 bg-white rounded-3xl p-5 shadow-sm border border-[#ebdcd0] flex flex-col justify-between backface-hidden">
            {/* Top row: Language & Tools */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-900 border border-indigo-200/60 rounded-full text-xs font-semibold">
                📖 {activeCard?.languagePair === 'ja-th' ? 'Japanese ➔ ภาษาไทย' : 'English ➔ ภาษาไทย'}
              </span>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => playPronunciation(activeCard?.word || '', activeCard?.languagePair === 'ja-th' ? 'ja-JP' : 'en-US')}
                  className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 flex items-center justify-center transition-colors"
                  title="ฟังเสียงออกเสียง"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowStatsModal(true)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  title="ดูสถิติความจำ"
                >
                  <BarChart2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center: Image & Word */}
            <div className="flex flex-col items-center justify-center my-auto py-2 text-center">
              {/* Illustration / Image Thumbnail */}
              {activeCard?.imageUrl && (
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden mb-3.5 shadow-xs border border-[#ebdcd0]">
                  <img
                    src={activeCard.imageUrl}
                    alt={activeCard.word}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1e1b17] tracking-tight">
                {activeCard?.word}
              </h1>

              <p className="text-sm sm:text-base font-medium text-[#716e69] mt-1">
                {activeCard?.phonetic}
              </p>
            </div>

            {/* Repeat Alert Callout (if repeated) */}
            {activeCard?.repeatCount && activeCard.repeatCount > 1 ? (
              <div className="p-3 bg-amber-50/90 rounded-2xl border border-amber-200/80 mb-3 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <span className="text-amber-600">⚡️</span>
                  <span>บันทึกซ้ำแล้ว {activeCard.repeatCount} ครั้ง!</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                  ความจำระดับปานกลาง ควรทบทวนบ่อยขึ้นเพื่อความแม่นยำ
                </p>
              </div>
            ) : null}

            {/* Flip Prompt */}
            <div className="text-center text-xs font-medium text-[#716e69] flex items-center justify-center gap-1.5 py-1">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-700" />
              <span>แตะที่การ์ดเพื่อพลิกดูคำแปล</span>
            </div>
          </div>

          {/* BACK SIDE */}
          <div className="absolute inset-0 bg-[#faf7f2] rounded-3xl p-5 shadow-sm border border-indigo-200/80 flex flex-col justify-between rotate-y-180 backface-hidden">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-indigo-900 text-white rounded-md text-xs font-bold">
                {activeCard?.partOfSpeechLabel || activeCard?.partOfSpeech}
              </span>
              <span className="text-xs font-bold text-indigo-900 bg-white border border-indigo-200 px-2 py-0.5 rounded-md">
                CEFR {activeCard?.cefr}
              </span>
            </div>

            {/* Translation & Definitions */}
            <div className="my-auto py-2 space-y-3 text-center">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                คำแปล / ความหมาย
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1a146b] leading-relaxed">
                {activeCard?.translation}
              </h2>

              {/* Example Sentences */}
              <div className="p-3 bg-white rounded-2xl border border-[#ebdcd0] text-left space-y-1 mt-2">
                <p className="text-xs sm:text-sm font-semibold text-[#1e1b17]">
                  "{activeCard?.exampleEn}"
                </p>
                <p className="text-xs text-[#716e69] italic">
                  "{activeCard?.exampleTh}"
                </p>
              </div>

              {/* Mnemonic Hint */}
              {activeCard?.imageMnemonicCaption && (
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200/70 text-left">
                  💡 <span className="font-semibold">ภาพช่วยจำ:</span> {activeCard.imageMnemonicCaption}
                </div>
              )}
            </div>

            {/* Flip back button */}
            <div className="text-center text-xs font-medium text-[#716e69] flex items-center justify-center gap-1.5 py-1">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-700" />
              <span>แตะเพื่อพลิกกลับด้านหน้า</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Recall Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleForgot}
          className="py-3 px-4 bg-[#ffe4e6] hover:bg-[#fecdd3] active:scale-[0.98] text-[#be123c] font-bold text-sm sm:text-base rounded-2xl border border-[#fecdd3] shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <XCircle className="w-5 h-5 text-[#be123c]" />
          <span>ยังจำไม่ได้</span>
        </button>

        <button
          onClick={handleRemembered}
          className="py-3 px-4 bg-[#059669] hover:bg-[#047857] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>จำได้แล้ว</span>
        </button>
      </div>

      {/* Secondary Quick Action Tools */}
      <div className="bg-white rounded-2xl p-2 shadow-2xs border border-[#ebdcd0] grid grid-cols-3 divide-x divide-[#ebdcd0] text-xs font-semibold text-[#554f46]">
        <button
          onClick={handleShuffle}
          className="flex items-center justify-center gap-1.5 py-2 hover:text-indigo-900 transition-colors"
        >
          <Shuffle className="w-4 h-4 text-slate-500" />
          <span>สุ่มคำศัพท์</span>
        </button>

        <button
          onClick={() => activeCard && onOpenEditModal(activeCard)}
          className="flex items-center justify-center gap-1.5 py-2 hover:text-indigo-900 transition-colors"
        >
          <FileEdit className="w-4 h-4 text-slate-500" />
          <span>แก้ไขโน้ต</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center justify-center gap-1.5 py-2 hover:text-indigo-900 transition-colors"
        >
          <SkipForward className="w-4 h-4 text-slate-500" />
          <span>ข้ามไปก่อน</span>
        </button>
      </div>

      {/* Daily Review Stats Card */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#ebdcd0] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1e1b17]">สถิติรอบทบทวนวันนี้</h3>
          <span className="text-[11px] font-semibold text-indigo-900">อัปเดตเรียลไทม์</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Mastered */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-950 leading-tight">
                {rememberedCount} คำ
              </div>
              <div className="text-[11px] text-emerald-800 font-medium">
                จำได้แม่นยำแล้ว
              </div>
            </div>
          </div>

          {/* Needs Repeat */}
          <div className="p-3 bg-rose-50/70 border border-rose-200/70 rounded-xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-700 flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-rose-950 leading-tight">
                {needsRepeatCount} คำ
              </div>
              <div className="text-[11px] text-rose-800 font-medium">
                ต้องซ้ำอีกรอบ
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Word Stats Modal */}
      {showStatsModal && activeCard && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3 shadow-xl border border-[#ebdcd0]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1e1b17]">สถิติของคำศัพท์: {activeCard.word}</h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#554f46]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>ความแม่นยำสะสม:</span>
                <span className="font-bold text-emerald-600">{activeCard.accuracy}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>บันทึกซ้ำทั้งหมด:</span>
                <span className="font-bold text-amber-600">{activeCard.repeatCount} ครั้ง</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span>ตอบถูก / ตอบทั้งหมด:</span>
                <span className="font-bold text-indigo-900">
                  {activeCard.stats?.correct || 0} / {activeCard.stats?.total || 0} ครั้ง
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span>กำหนดทบทวนถัดไป:</span>
                <span className="font-bold text-slate-800">{activeCard.nextReview}</span>
              </div>
            </div>

            <button
              onClick={() => setShowStatsModal(false)}
              className="w-full py-2 bg-[#1a146b] text-white rounded-xl text-xs font-semibold"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
