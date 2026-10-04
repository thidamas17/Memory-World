import React, { useState } from 'react';
import { WordItem } from '../types';
import { playPronunciation } from '../utils/audio';
import {
  Search,
  Volume2,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  ArrowUpDown,
  Zap,
  Sparkles,
  X,
  History,
  Check
} from 'lucide-react';

interface VaultTabProps {
  words: WordItem[];
  onOpenHistoryModal: (word: WordItem) => void;
  onStartSpecialReview: () => void;
}

export const VaultTab: React.FC<VaultTabProps> = ({
  words,
  onOpenHistoryModal,
  onStartSpecialReview,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'repeated' | 'mastered'>('all');
  const [sortBy, setSortBy] = useState<'repeat' | 'priority' | 'alphabet' | 'recent'>('repeat');
  const [expandedStatsId, setExpandedStatsId] = useState<string | null>(null);

  // Filtered & sorted words
  const filteredWords = words
    .filter((w) => {
      // Search filter
      const matchesSearch =
        w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.exampleEn.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Category filter
      if (filter === 'repeated') return w.repeatCount > 1;
      if (filter === 'mastered') return w.mastered;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'repeat') return b.repeatCount - a.repeatCount;
      if (sortBy === 'priority') {
        const pOrder: Record<string, number> = { high: 3, medium: 2, low: 1, mastered: 0 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'alphabet') return a.word.localeCompare(b.word);
      return 0;
    });

  const repeatedWordsCount = words.filter((w) => w.repeatCount > 1).length;

  return (
    <div className="space-y-3.5 pb-24">
      {/* Search Input */}
      <div className="relative bg-white rounded-2xl p-1.5 shadow-2xs border border-[#ebdcd0] flex items-center px-3">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`ค้นหาคำศัพท์ในคลัง (${words.length} คำ)...`}
          className="w-full bg-transparent py-1.5 text-xs sm:text-sm font-medium text-[#1e1b17] placeholder:text-slate-400 focus:outline-hidden"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'all'
              ? 'bg-[#1a146b] text-white'
              : 'bg-white text-[#57534e] hover:bg-[#faf6f0] border border-[#ebdcd0]'
          }`}
        >
          ทั้งหมด {words.length}
        </button>

        <button
          onClick={() => setFilter('repeated')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'repeated'
              ? 'bg-amber-600 text-white'
              : 'bg-[#fff5e9] text-amber-900 border border-amber-200/80 hover:bg-[#fdeedc]'
          }`}
        >
          <span>🔁 ⚠️</span>
          <span>บันทึกซ้ำ (Repeat Alert)</span>
          <span className="ml-0.5 px-1.5 py-0.2 bg-amber-200/80 text-amber-950 rounded-full text-[10px] font-bold">
            {repeatedWordsCount}
          </span>
        </button>

        <button
          onClick={() => setFilter('mastered')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
            filter === 'mastered'
              ? 'bg-emerald-700 text-white'
              : 'bg-white text-[#57534e] hover:bg-[#faf6f0] border border-[#ebdcd0]'
          }`}
        >
          <span>✓ จำได้แม่นแล้ว</span>
        </button>
      </div>

      {/* Smart Repeat Detection Feature Highlight Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e176b] via-[#2a2485] to-[#3a34a5] text-white rounded-3xl p-4 shadow-sm space-y-2 border border-indigo-400/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <span className="text-base sm:text-lg">🧠 🔁</span>
            <span>ตรวจจับคำศัพท์ซ้ำอัจฉริยะ</span>
          </div>
          <span className="px-2 py-0.5 bg-amber-400 text-amber-950 font-black text-[10px] tracking-wider rounded-md shadow-2xs">
            ACTIVE
          </span>
        </div>

        <p className="text-xs sm:text-[13px] text-indigo-100 leading-relaxed font-normal">
          เมื่อคุณพยายามบันทึกศัพท์เดิม ระบบจะเพิ่ม <span className="font-bold text-amber-300">repeat_count</span> อัตโนมัติ โดยไม่สร้างการ์ดซ้ำซ้อน และปรับความสำคัญขึ้นคิวทบทวนให้คุณทันที!
        </p>

        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-indigo-200 font-medium pt-0.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>ช่วยประหยัดเวลา ไม่รกคลัง และจำได้แม่นยำขึ้น 2.4 เท่า</span>
        </div>
      </div>

      {/* Section Header: Recent Words & Sort */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#1e1b17]">
            รายการคำศัพท์ล่าสุด
          </h2>
          <span className="text-[11px] text-[#716e69]">
            {sortBy === 'repeat'
              ? 'เรียงตามการบันทึกซ้ำ'
              : sortBy === 'priority'
              ? 'เรียงตามระดับความสำคัญ'
              : 'เรียงตามตัวอักษร'}
          </span>
        </div>

        <button
          onClick={() => {
            setSortBy((prev) =>
              prev === 'repeat' ? 'priority' : prev === 'priority' ? 'alphabet' : 'repeat'
            );
          }}
          className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-[#ebdcd0] rounded-xl text-xs font-semibold text-[#443f38] transition-colors shadow-2xs"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
          <span>
            {sortBy === 'repeat' ? 'การบันทึกซ้ำ' : sortBy === 'priority' ? 'ความสำคัญ' : 'A-Z'}
          </span>
        </button>
      </div>

      {/* Cards List */}
      <div className="space-y-3">
        {filteredWords.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#ebdcd0] space-y-2">
            <span className="text-3xl">🔍</span>
            <div className="text-sm font-bold text-[#1e1b17]">ไม่พบคำศัพท์ที่ค้นหา</div>
            <div className="text-xs text-slate-500">ลองค้นหาด้วยคำอื่น หรือสลับตัวกรอง</div>
          </div>
        ) : (
          filteredWords.map((word) => {
            const isMastered = word.mastered || word.priority === 'mastered';
            const isHighRepeat = word.repeatCount >= 3;
            const isExpanded = expandedStatsId === word.id;

            return (
              <div
                key={word.id}
                className="bg-white rounded-3xl p-4 shadow-xs border border-[#ebdcd0] space-y-3 transition-all hover:border-indigo-300"
              >
                {/* Header Tag / Alert Pill */}
                <div className="flex items-center justify-between">
                  {isMastered ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-full text-[11px] font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>จำได้แม่นยำ (Mastered)</span>
                    </span>
                  ) : isHighRepeat ? (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-[11px] font-bold">
                      <span>⚠️ ⚠️</span>
                      <span>บันทึกซ้ำ {word.repeatCount} ครั้ง!</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200/70 rounded-full text-[11px] font-bold">
                      <span>💡</span>
                      <span>ทบทวนปกติ</span>
                    </span>
                  )}

                  {/* Timestamp or accuracy badge */}
                  <div className="flex items-center gap-1 text-[11px] text-[#716e69] font-medium">
                    {isMastered ? (
                      <span className="text-emerald-700 font-bold">
                        ความแม่นยำ {word.accuracy}%
                      </span>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span>{word.lastEncountered}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Word Title & Pronunciation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#1a146b] tracking-tight">
                      {word.word}
                    </h3>
                    <span className="text-xs font-semibold text-[#716e69] bg-slate-100 px-1.5 py-0.5 rounded-sm">
                      {word.partOfSpeechLabel || word.partOfSpeech}
                    </span>
                  </div>

                  <button
                    onClick={() => playPronunciation(word.word, word.languagePair === 'ja-th' ? 'ja-JP' : 'en-US')}
                    className="w-8 h-8 rounded-full bg-indigo-50 hover:bg-indigo-100 text-[#1a146b] flex items-center justify-center transition-colors shadow-2xs"
                    title="ออกเสียง"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Phonetic */}
                <div className="text-xs font-medium text-[#716e69]">
                  {word.phonetic}
                </div>

                {/* Translation */}
                <div className="text-sm font-semibold text-[#1e1b17] leading-relaxed">
                  {word.translation}
                </div>

                {/* Example sentence with thumbnail */}
                <div className="p-2.5 bg-[#faf6f0]/80 rounded-2xl border border-[#ebdcd0] flex items-center gap-3">
                  {word.imageUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-[#ebdcd0] shadow-2xs">
                      <img
                        src={word.imageUrl}
                        alt={word.word}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[#443f38] block">
                      ประโยคตัวอย่าง
                    </span>
                    <p className="text-xs text-[#554f46] truncate font-medium">
                      {word.exampleEn}
                    </p>
                  </div>
                </div>

                {/* Footer: Priority & History trigger */}
                <div className="flex items-center justify-between pt-1 border-t border-[#ebdcd0]/70 text-xs">
                  {isMastered ? (
                    <div className="flex items-center gap-1 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ทบทวนถัดไป: {word.nextReview}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 font-semibold text-amber-900">
                      <span>{word.priority === 'high' ? '❗' : '📈'}</span>
                      <span>
                        Priority:{' '}
                        {word.priority === 'high'
                          ? 'สูงมาก (ทบทวนทุกวัน)'
                          : 'ปานกลาง (ทบทวนทุก 3 วัน)'}
                      </span>
                    </div>
                  )}

                  {/* History button */}
                  {isMastered ? (
                    <button
                      onClick={() => setExpandedStatsId(isExpanded ? null : word.id)}
                      className="text-xs font-semibold text-indigo-900 hover:text-indigo-700 flex items-center gap-0.5"
                    >
                      <span>สถิติการตอบ (12/12)</span>
                      <span>{isExpanded ? '▴' : '▾'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenHistoryModal(word)}
                      className="text-xs font-semibold text-indigo-900 hover:text-indigo-700 flex items-center gap-0.5"
                    >
                      <span>ดูประวัติบันทึก ({word.repeatCount})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Expanded answer stats if mastered */}
                {isExpanded && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-700 border border-slate-200">
                    <div className="flex justify-between">
                      <span>ตอบถูกติดต่อกัน:</span>
                      <span className="font-bold text-emerald-600">12 รอบ</span>
                    </div>
                    <div className="flex justify-between">
                      <span>จำแม่นยำแล้วเมื่อ:</span>
                      <span className="font-bold">2 วันก่อน</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Special Session Recommendation Alert Card */}
      <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-800 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-amber-950">
              พบ {repeatedWordsCount} คำที่มักบันทึกซ้ำ
            </div>
            <div className="text-[11px] text-amber-800">
              พร้อมจัดเซสชันพิเศษ 5 นาทีเพื่อความจำแม่นยำ
            </div>
          </div>
        </div>

        <button
          onClick={onStartSpecialReview}
          className="px-3 py-1.5 bg-[#00432d] hover:bg-[#003020] text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-2xs"
        >
          เริ่มเลย
        </button>
      </div>

      {/* Bottom Floating Status Indicator */}
      <div className="p-3 bg-[#faf6f0] border border-[#ebdcd0] rounded-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#443f38]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
          <span>ต้องการการทบทวน {repeatedWordsCount} คำที่ยังสับสน</span>
        </div>

        <button
          onClick={onStartSpecialReview}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#1a146b] hover:bg-[#251e8a] text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>เพิ่มรอบทบทวนคำซ้ำ</span>
        </button>
      </div>
    </div>
  );
};
