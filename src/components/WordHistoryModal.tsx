import React from 'react';
import { WordItem } from '../types';
import { History, X, Clock, BookOpen, AlertTriangle } from 'lucide-react';

interface WordHistoryModalProps {
  word: WordItem | null;
  onClose: () => void;
}

export const WordHistoryModal: React.FC<WordHistoryModalProps> = ({ word, onClose }) => {
  if (!word) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#ebdcd0] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebdcd0]/70 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e1b17] leading-tight">
                ประวัติการบันทึกคำศัพท์
              </h3>
              <span className="text-xs text-[#716e69] font-medium">
                {word.word} ({word.repeatCount} ครั้ง)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Smart repeat insight */}
        <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            คุณเคยเจอดึงคำนี้ซ้ำแล้ว <span className="font-bold">{word.repeatCount} ครั้ง</span> ระบบได้เพิ่มความสำคัญขึ้นคิวทบทวนอัตโนมัติ เพื่อป้องกันการลืมตามหลัก Spaced Repetition
          </p>
        </div>

        {/* Timeline list */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {word.repeatHistory && word.repeatHistory.length > 0 ? (
            word.repeatHistory.map((item, index) => (
              <div key={item.id || index} className="relative pl-5 border-l-2 border-indigo-200 space-y-1">
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#1a146b]" />
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>{item.timestamp}</span>
                  <span className="text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded-sm">
                    ครั้งที่ {word.repeatHistory.length - index}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#1e1b17]">
                  {item.source}
                </div>
                {item.context && (
                  <div className="text-[11px] text-[#6c6760] italic bg-[#faf6f0] p-1.5 rounded-lg border border-[#ebdcd0]">
                    "{item.context}"
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-slate-500">
              ไม่มีข้อมูลประวัติบันทึกย้อนหลัง
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#1a146b] hover:bg-[#251e8a] text-white rounded-xl text-xs font-bold transition-colors"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
};
