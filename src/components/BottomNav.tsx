import React from 'react';
import { TabType } from '../types';
import { Layers, Bookmark, User, Plus } from 'lucide-react';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#fffdf9]/95 backdrop-blur-md border-t border-[#ebdcd0] py-2 px-3 safe-area-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Tab 1: ทบทวน (Review) */}
        <button
          onClick={() => onTabChange('review')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            activeTab === 'review'
              ? 'text-[#1a146b] font-bold'
              : 'text-[#736e68] hover:text-[#2c2825] font-medium'
          }`}
        >
          <Layers className={`w-5 h-5 mb-0.5 ${activeTab === 'review' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] leading-tight">ทบทวน</span>
        </button>

        {/* Tab 2: เพิ่มศัพท์ (Add Word) with circular highlight */}
        <button
          onClick={() => onTabChange('add')}
          className={`flex flex-col items-center justify-center py-0.5 px-3 transition-transform active:scale-95 ${
            activeTab === 'add'
              ? 'text-[#1a146b] font-bold'
              : 'text-[#736e68] hover:text-[#2c2825] font-medium'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center mb-0.5 shadow-sm transition-all ${
              activeTab === 'add'
                ? 'bg-[#1a146b] text-white ring-4 ring-[#1a146b]/15'
                : 'bg-[#2e2a72] text-white hover:bg-[#1a146b]'
            }`}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] leading-tight">เพิ่มศัพท์</span>
        </button>

        {/* Tab 3: คลังศัพท์ (Vocabulary Vault) */}
        <button
          onClick={() => onTabChange('vault')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            activeTab === 'vault'
              ? 'text-[#1a146b] font-bold'
              : 'text-[#736e68] hover:text-[#2c2825] font-medium'
          }`}
        >
          <Bookmark className={`w-5 h-5 mb-0.5 ${activeTab === 'vault' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] leading-tight">คลังศัพท์</span>
        </button>

        {/* Tab 4: โปรไฟล์ (Profile) */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center py-1 px-3 transition-colors ${
            activeTab === 'profile'
              ? 'text-[#1a146b] font-bold'
              : 'text-[#736e68] hover:text-[#2c2825] font-medium'
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${activeTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[11px] leading-tight">โปรไฟล์</span>
        </button>
      </div>
    </nav>
  );
};
