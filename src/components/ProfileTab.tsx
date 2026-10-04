import React, { useState } from 'react';
import { UserProfile, WordItem } from '../types';
import {
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Flame,
  Edit3,
  Share2,
  Lock,
  CloudDownload,
  LogOut,
  Sliders,
  ChevronRight,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile;
  words: WordItem[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenEditProfile: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  words,
  onUpdateProfile,
  onOpenEditProfile,
}) => {
  const [dailyReminder, setDailyReminder] = useState(profile.settings.dailyReminder);
  const [autoPronounce, setAutoPronounce] = useState(profile.settings.autoPronounce);
  const [dictionaryProvider, setDictionaryProvider] = useState(profile.settings.dictionaryProvider);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Toggle settings
  const handleToggleReminder = () => {
    const nextVal = !dailyReminder;
    setDailyReminder(nextVal);
    onUpdateProfile({
      settings: { ...profile.settings, dailyReminder: nextVal },
    });
  };

  const handleToggleAutoPronounce = () => {
    const nextVal = !autoPronounce;
    setAutoPronounce(nextVal);
    onUpdateProfile({
      settings: { ...profile.settings, autoPronounce: nextVal },
    });
  };

  // Export CSV/JSON file download
  const handleExportData = (type: 'csv' | 'json') => {
    if (type === 'json') {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(words, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `lexivault-words-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } else {
      const headers = ['Word', 'Phonetic', 'Part of Speech', 'CEFR', 'Translation', 'Repeat Count', 'Mastered'];
      const rows = words.map((w) => [
        `"${w.word}"`,
        `"${w.phonetic}"`,
        `"${w.partOfSpeech}"`,
        `"${w.cefr}"`,
        `"${w.translation.replace(/"/g, '""')}"`,
        w.repeatCount,
        w.mastered ? 'YES' : 'NO',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', csvContent);
      downloadAnchor.setAttribute('download', `lexivault-words-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    }

    setToastMessage(`✓ ส่งออกไฟล์ ${type.toUpperCase()} สำเร็จแล้ว!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'LexiVault Progress',
        text: `ฉันกำลังฝึกสะสมคำศัพท์บน LexiVault จำได้แล้ว ${profile.stats.masteredWords} คำ Streak ต่อเนื่อง ${profile.streakDays} วัน!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('คัดลอกลิงก์แชร์ความคืบหน้าแล้ว!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-14 left-4 right-4 z-50 max-w-md mx-auto p-3 bg-[#1e1b4b] text-white text-xs sm:text-sm font-medium rounded-xl shadow-xl flex items-center justify-between animate-fade-in border border-indigo-400/30">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-indigo-300 hover:text-white ml-2 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#ebdcd0] flex flex-col items-center text-center space-y-3">
        {/* Avatar with Lightning Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden p-0.5 border-2 border-indigo-100 shadow-md">
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover rounded-full"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-[#f59e0b] border-2 border-white flex items-center justify-center text-white shadow-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
        </div>

        {/* Member Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fff2e2] text-[#9a4f00] rounded-full text-xs font-bold border border-amber-200/70">
          <span>⭐️</span>
          <span>{profile.badge}</span>
        </div>

        {/* Name & Email */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1e1b17] tracking-tight">
            {profile.name}
          </h2>
          <div className="text-xs text-[#716e69] font-medium mt-0.5">
            ({profile.nameEn})
          </div>
          <div className="text-xs text-[#8c867f] mt-1">
            {profile.email}
          </div>
        </div>

        {/* Profile Action Buttons */}
        <div className="flex items-center gap-2 pt-1 w-full max-w-xs">
          <button
            onClick={onOpenEditProfile}
            className="flex-1 py-2 px-3 bg-[#faf6f0] hover:bg-[#ebdcd0]/70 border border-[#ebdcd0] text-[#443f38] text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>แก้ไขโปรไฟล์</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-2 px-3 bg-[#1a146b] hover:bg-[#251e8a] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>แชร์ความคืบหน้า</span>
          </button>
        </div>
      </div>

      {/* Section 1: สถิติการเรียนรู้สะสม */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-sm sm:text-base text-[#1e1b17]">
            <span className="text-indigo-900">📈</span>
            <h3>สถิติการเรียนรู้สะสม</h3>
          </div>
          <span className="text-[11px] text-[#716e69]">อัปเดตล่าสุด: วันนี้</span>
        </div>

        {/* 4 Grid Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* 1. คำศัพท์ในคลัง */}
          <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-[#ebdcd0] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#716e69]">
              <span>คำศัพท์ในคลัง</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#1a146b]">
              {profile.stats.totalWords} <span className="text-xs font-semibold text-[#716e69]">คำ</span>
            </div>
            <div className="text-[11px] font-medium text-[#443f38] flex items-center gap-1">
              <span className="text-emerald-600 font-bold">↗ +{profile.stats.weeklyAdded}</span>
              <span>คำ ในสัปดาห์นี้</span>
            </div>
          </div>

          {/* 2. จำได้แม่นแล้ว */}
          <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-[#ebdcd0] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#716e69]">
              <span>จำได้แม่นแล้ว</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#059669]">
              {profile.stats.masteredWords} <span className="text-xs font-semibold text-[#716e69]">คำ ({profile.stats.masteredPercent}%)</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-emerald-600 rounded-full"
                style={{ width: `${profile.stats.masteredPercent}%` }}
              />
            </div>
          </div>

          {/* 3. บันทึกซ้ำบ่อย */}
          <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-[#ebdcd0] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#716e69]">
              <span>บันทึกซ้ำบ่อย</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#1e1b17]">
              {profile.stats.repeatedWords} <span className="text-xs font-semibold text-[#716e69]">คำ</span>
            </div>
            <span className="inline-block px-2 py-0.5 bg-[#fff2e2] text-[#9a4f00] rounded-md text-[10px] font-bold">
              Needs Review
            </span>
          </div>

          {/* 4. Streak ต่อเนื่อง */}
          <div className="bg-white rounded-2xl p-3.5 shadow-2xs border border-[#ebdcd0] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-[#716e69]">
              <span>Streak ต่อเนื่อง</span>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#1e1b17]">
              {profile.stats.streakDays} <span className="text-xs font-semibold text-[#716e69]">วันติดกัน</span>
            </div>
            <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
              <span>🔥 ไฟกำลังลุกโชน!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: สัดส่วนภาษาที่บันทึก */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#ebdcd0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#1e1b17]">
            <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span>สัดส่วนภาษาที่บันทึก</span>
          </div>
          <span className="text-[11px] text-[#716e69]">รวม {profile.languages.length} ภาษา</span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-100">
          <div className="bg-[#1a146b] h-full" style={{ width: '82%' }} title="English 82%" />
          <div className="bg-[#f59e0b] h-full" style={{ width: '12%' }} title="Japanese 12%" />
          <div className="bg-[#10b981] h-full" style={{ width: '6%' }} title="Chinese 6%" />
        </div>

        {/* Language Details */}
        <div className="space-y-2 pt-1">
          {profile.languages.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center justify-between p-2.5 bg-[#faf6f0]/70 rounded-xl border border-[#ebdcd0]/70 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <div>
                  <div className="font-bold text-[#1e1b17]">{lang.name}</div>
                  <div className="text-[11px] text-[#716e69]">
                    {lang.percent}% ของคลังศัพท์ทั้งหมด
                  </div>
                </div>
              </div>
              <div className="font-bold text-[#1a146b] text-sm">
                {lang.count} <span className="text-xs text-[#716e69] font-normal">คำ</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: การตั้งค่าการจำ & ทบทวน */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-[#ebdcd0] space-y-3">
        <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#1e1b17]">
          <Sliders className="w-4 h-4 text-indigo-900" />
          <span>การตั้งค่าการจำ & ทบทวน</span>
        </div>

        <div className="space-y-3 pt-1">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1e1b17]">
                แจ้งเตือนคำศัพท์ซ้ำบ่อยรายวัน
              </div>
              <div className="text-[11px] text-[#716e69]">
                ส่งการ์ดทบทวน Spaced Repetition ตอน 20:00 น.
              </div>
            </div>
            <button
              onClick={handleToggleReminder}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                dailyReminder ? 'bg-[#1a146b]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  dailyReminder ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Toggle 2 */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1e1b17]">
                Auto-pronunciation
              </div>
              <div className="text-[11px] text-[#716e69]">
                ออกเสียงคำศัพท์อัตโนมัติเมื่อพลิกการ์ด
              </div>
            </div>
            <button
              onClick={handleToggleAutoPronounce}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                autoPronounce ? 'bg-[#1a146b]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  autoPronounce ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Dropdown: Dictionary API */}
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1e1b17]">
                เชื่อมต่อ Dictionary API
              </div>
              <div className="text-[11px] text-[#716e69]">
                ดึงความหมายและตัวอย่างประโยคอัตโนมัติ
              </div>
            </div>

            <select
              value={dictionaryProvider}
              onChange={(e) => setDictionaryProvider(e.target.value)}
              className="text-xs font-semibold bg-[#faf6f0] border border-[#ebdcd0] rounded-xl px-2.5 py-1.5 text-[#1e1b17] focus:outline-hidden"
            >
              <option value="Free Dictionary API">Free Dictionary API</option>
              <option value="Oxford Advanced Learner">Oxford Advanced</option>
              <option value="Cambridge Learner">Cambridge</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 4: System Actions */}
      <div className="bg-white rounded-3xl p-2 shadow-xs border border-[#ebdcd0] divide-y divide-slate-100 text-xs sm:text-sm">
        {/* Change password */}
        <button
          onClick={() => {
            setToastMessage('ส่งลิงก์เปลี่ยนรหัสผ่านไปยังอีเมลของคุณแล้ว');
            setTimeout(() => setToastMessage(null), 3000);
          }}
          className="w-full flex items-center justify-between p-3 text-[#443f38] hover:bg-slate-50 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <RefreshCw className="w-3.5 h-3.5" />
            </div>
            <span className="font-medium text-[#1e1b17]">เปลี่ยนรหัสผ่าน</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Backup / Export */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-900">
              <CloudDownload className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-medium text-[#1e1b17]">สำรองข้อมูลคลังคำศัพท์</div>
              <div className="text-[11px] text-[#716e69]">
                ส่งออกเป็นไฟล์ CSV หรือ JSON ({words.length} คำ)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExportData('csv')}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 rounded-lg text-xs font-bold transition-colors"
            >
              CSV
            </button>
            <button
              onClick={() => handleExportData('json')}
              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 rounded-lg text-xs font-bold transition-colors"
            >
              JSON
            </button>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full flex items-center justify-between p-3 text-[#ba1a1a] hover:bg-rose-50 transition-colors rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-700">
              <LogOut className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-rose-700">ออกจากระบบ (Log Out)</span>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-400" />
        </button>
      </div>

      {/* Cloud Sync & Version Footer */}
      <div className="text-center space-y-1 pt-2 text-[11px] text-[#8c867f]">
        <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>คลังคำศัพท์ซิงค์กับคลาวด์แล้ว</span>
        </div>
        <div>
          LexiVault v2.4.0 (Build 382) • Smart Spaced Repetition Engine
        </div>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full space-y-3 shadow-xl border border-[#ebdcd0] text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#1e1b17]">ยืนยันการออกจากระบบ?</h3>
            <p className="text-xs text-slate-500">
              ข้อมูลคลังคำศัพท์ {words.length} คำ ได้รับการสำรองข้อมูลไว้เรียบร้อยแล้ว
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setToastMessage('ออกจากระบบแล้ว');
                  setTimeout(() => setToastMessage(null), 2000);
                }}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#ba1a1a] hover:bg-red-700 text-white"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
