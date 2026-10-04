import React, { useState } from 'react';
import { WordItem } from '../types';
import { X, Save, Edit3 } from 'lucide-react';

interface EditNoteModalProps {
  word: WordItem | null;
  onClose: () => void;
  onSave: (updated: WordItem) => void;
}

export const EditNoteModal: React.FC<EditNoteModalProps> = ({ word, onClose, onSave }) => {
  if (!word) return null;

  const [translation, setTranslation] = useState(word.translation);
  const [exampleEn, setExampleEn] = useState(word.exampleEn);
  const [exampleTh, setExampleTh] = useState(word.exampleTh);
  const [mnemonicCaption, setMnemonicCaption] = useState(word.imageMnemonicCaption || '');

  const handleSave = () => {
    onSave({
      ...word,
      translation,
      exampleEn,
      exampleTh,
      imageMnemonicCaption: mnemonicCaption,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-3.5 shadow-2xl border border-[#ebdcd0] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#ebdcd0]/70 pb-2.5">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-indigo-900" />
            <h3 className="text-base font-bold text-[#1e1b17]">
              แก้ไขโน้ต: {word.word}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              คำแปล / ความหมาย
            </label>
            <textarea
              rows={2}
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              ประโยคตัวอย่างภาษาอังกฤษ
            </label>
            <input
              type="text"
              value={exampleEn}
              onChange={(e) => setExampleEn(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              คำแปลประโยคตัวอย่าง
            </label>
            <input
              type="text"
              value={exampleTh}
              onChange={(e) => setExampleTh(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              ภาพช่วยจำ (คำอธิบาย)
            </label>
            <input
              type="text"
              value={mnemonicCaption}
              onChange={(e) => setMnemonicCaption(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#1a146b] hover:bg-[#251e8a] text-white flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>บันทึก</span>
          </button>
        </div>
      </div>
    </div>
  );
};
