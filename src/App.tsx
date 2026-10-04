import React, { useState, useEffect } from 'react';
import { TabType, WordItem, UserProfile } from './types';
import { INITIAL_WORDS, INITIAL_USER_PROFILE } from './data/initialData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AddWordTab } from './components/AddWordTab';
import { ReviewTab } from './components/ReviewTab';
import { VaultTab } from './components/VaultTab';
import { ProfileTab } from './components/ProfileTab';
import { WordHistoryModal } from './components/WordHistoryModal';
import { EditNoteModal } from './components/EditNoteModal';
import { EditProfileModal } from './components/EditProfileModal';

export default function App() {
  // Current active tab (defaulting to 'add' to match Image 1.png, or user can easily switch to review, vault, profile)
  const [activeTab, setActiveTab] = useState<TabType>('add');

  // Screen preview mode: mobile frame view vs wide fluid view
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  // Vocabulary list
  const [words, setWords] = useState<WordItem[]>(() => {
    try {
      const saved = localStorage.getItem('lexivault_words');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_WORDS;
  });

  // User Profile
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('lexivault_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USER_PROFILE;
  });

  // Modals state
  const [historyModalWord, setHistoryModalWord] = useState<WordItem | null>(null);
  const [editNoteWord, setEditNoteWord] = useState<WordItem | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('lexivault_words', JSON.stringify(words));
    } catch {}
  }, [words]);

  useEffect(() => {
    try {
      localStorage.setItem('lexivault_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  // Add or update word handler
  const handleAddWord = (newWord: WordItem) => {
    setWords((prev) => {
      const existsIndex = prev.findIndex(
        (w) => w.word.trim().toLowerCase() === newWord.word.trim().toLowerCase()
      );
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = newWord;
        return updated;
      }
      return [newWord, ...prev];
    });

    // Update profile metrics
    setProfile((prev) => ({
      ...prev,
      stats: {
        ...prev.stats,
        totalWords: prev.stats.totalWords + 1,
        weeklyAdded: prev.stats.weeklyAdded + 1,
        repeatedWords:
          newWord.repeatCount > 1
            ? prev.stats.repeatedWords + 1
            : prev.stats.repeatedWords,
      },
    }));
  };

  // Update existing word
  const handleUpdateWord = (updatedWord: WordItem) => {
    setWords((prev) => prev.map((w) => (w.id === updatedWord.id ? updatedWord : w)));
  };

  // Update profile
  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  // Start special review session for repeated words
  const handleStartSpecialReview = () => {
    setActiveTab('review');
  };

  return (
    <div className="min-h-screen bg-[#f3ede6] flex flex-col items-center justify-start sm:py-4 transition-colors">
      {/* Mobile container wrapper */}
      <div
        className={`w-full bg-[#fbf7f2] flex flex-col relative transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[425px] min-h-[95vh] sm:rounded-[38px] shadow-2xl sm:border-[8px] sm:border-[#38332c] overflow-hidden'
            : 'max-w-3xl min-h-screen sm:rounded-2xl shadow-lg border border-[#ebdcd0]'
        }`}
      >
        {/* Smartphone Speaker/Camera Notch (Only in mobile frame view) */}
        {isMobileFrame && (
          <div className="hidden sm:flex items-center justify-center pt-2 pb-1 bg-[#fbf7f2]">
            <div className="w-20 h-4 bg-[#2b2722] rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#181614] mr-2" />
              <div className="w-10 h-1 bg-[#181614] rounded-full" />
            </div>
          </div>
        )}

        {/* Global Header */}
        <Header
          currentTab={activeTab}
          profile={profile}
          onProfileClick={() => setActiveTab('profile')}
          isMobileFrame={isMobileFrame}
          onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
        />

        {/* Main Tab Screen Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'add' && (
            <AddWordTab
              onAddWord={handleAddWord}
              existingWords={words}
              onNavigateToVault={() => setActiveTab('vault')}
            />
          )}

          {activeTab === 'review' && (
            <ReviewTab
              words={words}
              onUpdateWord={handleUpdateWord}
              onOpenEditModal={(word) => setEditNoteWord(word)}
              autoPronounce={profile.settings.autoPronounce}
            />
          )}

          {activeTab === 'vault' && (
            <VaultTab
              words={words}
              onOpenHistoryModal={(word) => setHistoryModalWord(word)}
              onStartSpecialReview={handleStartSpecialReview}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              words={words}
              onUpdateProfile={handleUpdateProfile}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
      </div>

      {/* Modals */}
      <WordHistoryModal
        word={historyModalWord}
        onClose={() => setHistoryModalWord(null)}
      />

      <EditNoteModal
        word={editNoteWord}
        onClose={() => setEditNoteWord(null)}
        onSave={handleUpdateWord}
      />

      <EditProfileModal
        profile={profile}
        onClose={() => setIsEditProfileOpen(false)}
        onSave={handleUpdateProfile}
      />
    </div>
  );
}
