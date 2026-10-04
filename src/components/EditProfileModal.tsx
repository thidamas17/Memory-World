import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Save, UserCheck } from 'lucide-react';

interface EditProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updated: Partial<UserProfile>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(profile.name);
  const [nameEn, setNameEn] = useState(profile.nameEn);
  const [email, setEmail] = useState(profile.email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      nameEn,
      email,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-[#ebdcd0] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#ebdcd0]/70 pb-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-900" />
            <h3 className="text-base font-bold text-[#1e1b17]">
              แก้ไขข้อมูลโปรไฟล์
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              ชื่อ - นามสกุล (ภาษาไทย)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              ชื่อย่อ / ภาษาอังกฤษ
            </label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-[#443f38] block mb-1">
              อีเมล
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[#faf6f0] border border-[#ebdcd0] rounded-xl text-xs font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-700"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#1a146b] hover:bg-[#251e8a] text-white flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการแก้ไข</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
