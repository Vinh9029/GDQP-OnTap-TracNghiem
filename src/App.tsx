import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Practice from "./components/Practice";
import Exam from "./components/Exam";
import Review from "./components/Review";
import Stats from "./components/Stats";
import Leaderboard from "./components/Leaderboard";
import GoogleAuth from "./components/GoogleAuth";
import { UserStats, ExamResult, UserProfile } from "./types";
import { syncUserProfile, syncUserStats, syncExamResult } from "./lib/firebase";
// @ts-ignore
import avatarChatbot from "../assets/avatar_chatbot.png";

const DEFAULT_STATS: UserStats = {
  answeredQuestions: {},
  userAnswers: {},
  incorrectQuestions: [],
  bookmarkedQuestions: [],
  streak: 0,
  lastActiveDate: "",
};

// Helper to calculate dynamic XP
const calculateXp = (statsObj: UserStats, historyArr: ExamResult[]) => {
  const correctCount = Object.values(statsObj.answeredQuestions).filter(Boolean).length;
  const practiceXp = correctCount * 10;
  const examAttemptsXp = historyArr.length * 100;
  const examPassesXp = historyArr.filter(h => h.passed).length * 150;
  const perfectScoresXp = historyArr.filter(h => h.score === 10).length * 300;
  const streakBonusXp = statsObj.streak * 20;

  return practiceXp + examAttemptsXp + examPassesXp + perfectScoresXp + streakBonusXp;
};

export default function App() {
  // 1. Load active user profile from localStorage
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("gdqp_profile");
    return saved ? JSON.parse(saved) : null;
  });

  // Load stats state from localStorage on init
  const [stats, setStats] = useState<UserStats>(() => {
    const savedProfileStr = localStorage.getItem("gdqp_profile");
    if (savedProfileStr) {
      try {
        const p = JSON.parse(savedProfileStr);
        if (p && p.uid) {
          const keyed = localStorage.getItem(`gdqp_stats_${p.uid}`);
          if (keyed) return JSON.parse(keyed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    const saved = localStorage.getItem("gdqp_stats");
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [history, setHistory] = useState<ExamResult[]>(() => {
    const savedProfileStr = localStorage.getItem("gdqp_profile");
    if (savedProfileStr) {
      try {
        const p = JSON.parse(savedProfileStr);
        if (p && p.uid) {
          const keyed = localStorage.getItem(`gdqp_history_${p.uid}`);
          if (keyed) return JSON.parse(keyed);
        }
      } catch (e) {
        console.error(e);
      }
    }
    const saved = localStorage.getItem("gdqp_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<"home" | "practice" | "exam" | "review" | "stats" | "leaderboard">("home");

  // Router properties to pass settings between views
  const [practicePart, setPracticePart] = useState<1 | 2>(1);
  const [practiceFilter, setPracticeFilter] = useState<"all" | "unanswered" | "incorrect" | "bookmarked">("all");
  const [examPart, setExamPart] = useState<1 | 2 | undefined>(undefined);
  const [examKey, setExamKey] = useState<number>(0);

  // Dynamic state syncing effect when profile changes (for account switches / multi-user)
  useEffect(() => {
    if (profile && profile.uid) {
      const userStatsKey = `gdqp_stats_${profile.uid}`;
      const userHistoryKey = `gdqp_history_${profile.uid}`;

      const savedStats = localStorage.getItem(userStatsKey);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      } else {
        const oldStats = localStorage.getItem("gdqp_stats");
        if (oldStats) {
          setStats(JSON.parse(oldStats));
        } else {
          setStats(DEFAULT_STATS);
        }
      }

      const savedHistory = localStorage.getItem(userHistoryKey);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        const oldHistory = localStorage.getItem("gdqp_history");
        if (oldHistory) {
          setHistory(JSON.parse(oldHistory));
        } else {
          setHistory([]);
        }
      }
    }
  }, [profile?.uid]);

  // Daily streak check on initial mount
  useEffect(() => {
    const today = new Date();
    const todayStr = today.toDateString(); // e.g. "Sun Jul 19 2026"

    setStats((prev) => {
      // If there's no previous history or empty lastActiveDate
      if (!prev.lastActiveDate) {
        return {
          ...prev,
          streak: 1,
          lastActiveDate: todayStr,
        };
      }

      // If active today already, do nothing
      if (prev.lastActiveDate === todayStr) {
        return prev;
      }

      const lastDate = new Date(prev.lastActiveDate);
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let newStreak = prev.streak;
      if (diffDays === 1) {
        // Active on consecutive day
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }

      return {
        ...prev,
        streak: newStreak,
        lastActiveDate: todayStr,
      };
    });
  }, []);

  // Save changes to localStorage (both generic and user-specific keys) and sync to Firebase
  useEffect(() => {
    if (profile && profile.uid) {
      localStorage.setItem(`gdqp_stats_${profile.uid}`, JSON.stringify(stats));
      syncUserStats(profile.uid, stats).catch(console.error);
    }
    localStorage.setItem("gdqp_stats", JSON.stringify(stats));
  }, [stats, profile?.uid]);

  useEffect(() => {
    if (profile && profile.uid) {
      localStorage.setItem(`gdqp_history_${profile.uid}`, JSON.stringify(history));
      if (history.length > 0) {
        const latestExam = history[history.length - 1];
        syncExamResult(profile.uid, latestExam).catch(console.error);
      }
    }
    localStorage.setItem("gdqp_history", JSON.stringify(history));
  }, [history, profile?.uid]);

  // Recalculate and update user's profile statistics automatically on stats/history change
  useEffect(() => {
    if (!profile) return;

    const currentXp = calculateXp(stats, history);
    const totalExams = history.length;
    const avgExamScore = totalExams > 0 ? (history.reduce((sum, h) => sum + h.score, 0) / totalExams) : 0;
    const currentStreak = stats.streak;

    if (
      profile.xp !== currentXp ||
      profile.streak !== currentStreak ||
      profile.totalExams !== totalExams ||
      profile.avgExamScore !== avgExamScore
    ) {
      const updatedProfile = {
        ...profile,
        xp: currentXp,
        streak: currentStreak,
        totalExams,
        avgExamScore,
      };
      setProfile(updatedProfile);
      localStorage.setItem("gdqp_profile", JSON.stringify(updatedProfile));
    }
  }, [stats, history, profile?.uid]);

  // Sync profile update to Firebase & DB when relevant details change
  useEffect(() => {
    if (profile) {
      syncUserProfile(profile).catch(console.error);
    }
  }, [profile?.xp, profile?.streak, profile?.totalExams, profile?.avgExamScore, profile?.name, profile?.photoURL]);

  // Handle Google Auth Login
  const handleLogin = async (name: string, email: string, photoURL: string) => {
    const cleanEmailKey = email.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const stableUid = "google-" + cleanEmailKey;

    // Check if we already have stats in localStorage for this specific user
    const savedStats = localStorage.getItem(`gdqp_stats_${stableUid}`);
    const savedHistory = localStorage.getItem(`gdqp_history_${stableUid}`);

    let userStats = DEFAULT_STATS;
    let userHistory: ExamResult[] = [];

    if (savedStats) {
      try {
        userStats = JSON.parse(savedStats);
      } catch (e) {
        console.error(e);
      }
    }
    if (savedHistory) {
      try {
        userHistory = JSON.parse(savedHistory);
      } catch (e) {
        console.error(e);
      }
    }

    // Try to fetch existing server profile to restore streak and XP if local storage is cleared
    let serverProfile = null;
    try {
      const res = await fetch(`/api/profile?uid=${stableUid}`);
      if (res.ok) {
        const data = await res.json();
        if (data.found && data.profile) {
          serverProfile = data.profile;
        }
      }
    } catch (err) {
      console.warn("Failed to query server profile for recovery:", err);
    }

    // If we recovered a server profile but had no local stats/history, we can synthesize basic recovery stats
    if (serverProfile && !savedStats) {
      // Create some synthesized answered questions so they don't lose their XP!
      const correctPracticeXp = Math.max(0, serverProfile.xp - (serverProfile.streak * 20));
      const simulatedCorrectCount = Math.min(200, Math.round(correctPracticeXp / 10));
      const answeredQuestions: Record<string, boolean> = {};
      for (let i = 0; i < simulatedCorrectCount; i++) {
        answeredQuestions[`1_${i}`] = true;
      }

      userStats = {
        ...DEFAULT_STATS,
        streak: serverProfile.streak || 1,
        answeredQuestions,
      };
    }

    const currentXp = serverProfile ? Math.max(serverProfile.xp, calculateXp(userStats, userHistory)) : calculateXp(userStats, userHistory);
    const totalExams = userHistory.length || (serverProfile ? serverProfile.totalExams : 0);
    const avgExamScore = userHistory.length > 0 
      ? (userHistory.reduce((sum, h) => sum + h.score, 0) / userHistory.length) 
      : (serverProfile ? serverProfile.avgExamScore : 0);

    const newProfile: UserProfile = {
      uid: stableUid,
      name: serverProfile ? serverProfile.name : name,
      email,
      photoURL: serverProfile ? serverProfile.photoURL : photoURL,
      xp: currentXp,
      streak: userStats.streak || 1,
      avgExamScore,
      totalExams,
      createdAt: serverProfile ? serverProfile.createdAt : new Date().toISOString(),
    };

    // Store in state (this triggers the loading effect, loading stats & history)
    setProfile(newProfile);
    localStorage.setItem("gdqp_profile", JSON.stringify(newProfile));
    
    // Explicitly write state to prevent delay
    setStats(userStats);
    setHistory(userHistory);
    localStorage.setItem(`gdqp_stats_${stableUid}`, JSON.stringify(userStats));
    localStorage.setItem(`gdqp_history_${stableUid}`, JSON.stringify(userHistory));

    // Save last user info for rapid re-login screen
    localStorage.setItem("gdqp_last_user", JSON.stringify({ 
      name: newProfile.name, 
      email, 
      photoURL: newProfile.photoURL 
    }));
  };

  const handleLogout = () => {
    setProfile(null);
    localStorage.removeItem("gdqp_profile");
    setActiveTab("home");
  };

  const handleUpdateProfile = (name: string, photoURL: string) => {
    if (!profile) return;
    const updated = {
      ...profile,
      name,
      photoURL,
    };
    setProfile(updated);
    localStorage.setItem("gdqp_profile", JSON.stringify(updated));
  };

  // Actions
  const handleStartPractice = (part: 1 | 2, filter?: "all" | "incorrect" | "bookmarked") => {
    setPracticePart(part);
    if (filter) {
      setPracticeFilter(filter === "incorrect" ? "incorrect" : filter === "bookmarked" ? "bookmarked" : "all");
    } else {
      setPracticeFilter("all");
    }
    setActiveTab("practice");
  };

  const handleStartExam = (part: 1 | 2) => {
    setExamPart(part);
    setExamKey(Date.now()); // force remount with unique key to trigger instant auto-start
    setActiveTab("exam");
  };

  const addExamResult = (result: ExamResult) => {
    setHistory((prev) => [...prev, result]);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("gdqp_history");
  };

  const resetAllData = () => {
    setStats(DEFAULT_STATS);
    setHistory([]);
    localStorage.removeItem("gdqp_stats");
    localStorage.removeItem("gdqp_history");
    setActiveTab("home");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 md:pb-6 font-sans antialiased text-gray-800">
      {/* Universal header bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={stats.streak}
        profile={profile}
      />

      {/* Main app grid */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {activeTab === "home" && (
          <Dashboard
            stats={stats}
            history={history}
            startPractice={handleStartPractice}
            startExam={handleStartExam}
            resetAllData={resetAllData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "practice" && (
          <Practice
            key={`${practicePart}_${practiceFilter}`} // Force reset sliders when changing filters from dashboard
            stats={stats}
            setStats={setStats}
            initialPart={practicePart}
            initialFilter={practiceFilter}
          />
        )}

        {activeTab === "exam" && (
          <Exam
            key={examKey}
            stats={stats}
            setStats={setStats}
            addExamResult={addExamResult}
            setActiveTab={setActiveTab}
            initialPart={examPart}
          />
        )}

        {activeTab === "review" && (
          <Review stats={stats} setStats={setStats} />
        )}

        {activeTab === "stats" && (
          <Stats stats={stats} history={history} clearHistory={clearHistory} />
        )}

        {activeTab === "leaderboard" && profile && (
          <Leaderboard
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            stats={stats}
            history={history}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-10 mb-6 flex flex-col items-center gap-4 text-slate-400 dark:text-slate-500 text-xs px-4">
        <div className="w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
        <div className="flex items-center flex-wrap justify-center gap-5">
          <a href="https://my-portfolio-nine-sand-28.vercel.app/" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <div className="relative">
              <img 
                src={avatarChatbot} 
                alt="DQuocVinh Portfolio" 
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-blue-400 transition-all duration-300 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" width="6" height="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link text-white">
                  <path d="M15 3h6v6"></path>
                  <path d="M10 14 21 3"></path>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                </svg>
              </div>
            </div>
            <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors text-[13px]">DQuocVinh</span>
          </a>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <a href="https://github.com/vinh9029" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-slate-700 dark:hover:text-slate-300 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github group-hover:scale-110 transition-transform">
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
              <path d="M9 18c-4.51 2-5-2-7-2"></path>
            </svg>
            <span>vinh9029</span>
          </a>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <a href="https://www.facebook.com/8129029sng" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook group-hover:scale-110 transition-transform">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
            </svg>
            <span>8129029sng</span>
          </a>
        </div>
        <p className="text-center text-slate-400 dark:text-slate-500 text-[11px] max-w-md leading-relaxed mt-1">
          * Dữ liệu tiến trình học tập của bạn được tự động lưu trên trình duyệt này.
        </p>
        <p className="text-center text-slate-400 dark:text-slate-600 text-[11px] leading-relaxed">© 2026 DQuocVinh. Bản quyền thuộc về tác giả.</p>
      </footer>

      {/* Login Pop-up (Overlay on top of page index when not authenticated) */}
      {!profile && (
        <GoogleAuth
          userEmail="bearastrikingresemblance@gmail.com"
          onLogin={handleLogin}
        />
      )}
    </div>
  );
}
