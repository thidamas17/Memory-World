import React from 'react';
import { TabType, UserProfile } from '../types';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  profile: UserProfile;
  onProfileClick: () => void;
  isMobileFrame: boolean;
  onToggleFrame: () => void;
}

const TAB_SUBTITLES: Record<TabType, string> = {
  add: 'Add Word',
  review: 'Flashcards Review',
  vault: 'Vocabulary Vault',
  profile: 'Learning Profile',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  profile,
  onProfileClick,
  isMobileFrame,
  onToggleFrame,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#fbf7f2]/95 backdrop-blur-md px-4 py-2.5 border-b border-[#ebdcd0]/70 flex items-center justify-between transition-all">
      {/* Brand & Subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#312e81] via-[#4338ca] to-[#6366f1] flex items-center justify-center text-white shadow-sm shadow-indigo-950/10">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M19 2H6c-1.2 0-2 .8-2 2v16c0 1.2.8 2 2 2h13c.6 0 1-.4 1-1V3c0-.6-.4-1-1-1zm-1 18H6.5c-.3 0-.5-.2-.5-.5s.2-.5.5-.5H18V18zm0-3H6V4h12v13z"/>
            <path d="M8 7h8v2H8zm0 4h5v2H8z" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-[17px] text-[#1e1b17] leading-tight tracking-tight">
            LexiVault
          </span>
          <span className="text-[12px] text-[#716e69] font-medium leading-none mt-0.5">
            {TAB_SUBTITLES[currentTab]}
          </span>
        </div>
      </div>

      {/* Right Actions: Streak & Avatar & Screen Mode */}
      <div className="flex items-center gap-2">
        {/* Streak Pill */}
        <button
          onClick={onProfileClick}
          title="Streak ต่อเนื่อง 7 วัน"
          className="flex items-center gap-1 px-3 py-1 bg-[#ffe8d1] text-[#8a3e00] hover:bg-[#fedfc0] transition-colors rounded-full text-xs font-semibold shadow-xs"
        >
          <span className="text-sm">🔥</span>
          <span>{profile.streakDays} วัน</span>
        </button>

        {/* User Avatar */}
        <button
          onClick={onProfileClick}
          className="relative rounded-full focus:outline-hidden focus:ring-2 focus:ring-indigo-700/40 p-0.5"
          title="ดูโปรไฟล์"
        >
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
            referrerPolicy="no-referrer"
          />
        </button>

        {/* View Frame Toggle for desktop users */}
        <button
          onClick={onToggleFrame}
          className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-[#efe7df] hover:bg-[#e4dbd2] text-[#605b54] text-xs font-medium transition-colors ml-1"
          title={isMobileFrame ? 'สลับเป็นโหมดเต็มจอ' : 'สลับเป็นโหมดจำลองมือถือ'}
        >
          {isMobileFrame ? '🖥️' : '📱'}
        </button>
      </div>
    </header>
  );
};
