import React from "react";
import { BookOpen, Award, FileText, CheckSquare, BarChart2, Flame, Trophy } from "lucide-react";
import { UserProfile } from "../types";
// @ts-ignore
import gdqpLogo from "../../assets/gdqp.png";

interface HeaderProps {
  activeTab: "home" | "practice" | "exam" | "review" | "stats" | "leaderboard";
  setActiveTab: (tab: "home" | "practice" | "exam" | "review" | "stats" | "leaderboard") => void;
  streak: number;
  profile: UserProfile | null;
}

export default function Header({ activeTab, setActiveTab, streak, profile }: HeaderProps) {
  // Center tabs (including Leaderboard)
  const navItems = [
    { id: "home", label: "Trang chủ", icon: BookOpen },
    { id: "practice", label: "Luyện tập", icon: CheckSquare },
    { id: "exam", label: "Thi thử", icon: Award },
    { id: "review", label: "Xem câu hỏi", icon: FileText },
    { id: "stats", label: "Thống kê", icon: BarChart2 },
    { id: "leaderboard", label: "Bảng xếp hạng", icon: Trophy },
  ] as const;

  // Bottom mobile bar tabs (including Leaderboard so it's accessible on mobile)
  const mobileNavItems = [
    { id: "home", label: "Trang chủ", icon: BookOpen },
    { id: "practice", label: "Luyện tập", icon: CheckSquare },
    { id: "exam", label: "Thi thử", icon: Award },
    { id: "leaderboard", label: "Xếp hạng", icon: Trophy },
    { id: "review", label: "Xem câu hỏi", icon: FileText },
    { id: "stats", label: "Thống kê", icon: BarChart2 },
  ] as const;

  return (
    <header className="sticky top-0 z-50 w-full bg-indigo-600 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl h-18 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
            <img 
              src={gdqpLogo} 
              alt="Giáo Dục Quốc Phòng" 
              className="h-11 w-11 rounded-xl object-contain shadow-md transition-transform hover:scale-105 bg-white p-0.5"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fall back to original text logo GD if image loading fails
                e.currentTarget.style.display = "none";
                const fallbackEl = document.getElementById("gd-text-fallback");
                if (fallbackEl) {
                  fallbackEl.style.display = "flex";
                }
              }}
            />
            <div 
              id="gd-text-fallback" 
              className="hidden absolute inset-0 items-center justify-center rounded-xl bg-white text-indigo-600 font-black text-xl shadow-md transition-transform hover:scale-105"
            >
              GD
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none font-display">
              GDQP-AN
            </h1>
            <p className="text-[10px] font-bold text-indigo-200 mt-1 uppercase tracking-widest opacity-90">
              Hệ thống ôn luyện thông minh
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-indigo-700/50 p-1 rounded-xl border border-indigo-500/20">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4.5 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-indigo-100 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.id === "home" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-book-open h-4 w-4 ${isActive ? "text-indigo-600" : "text-indigo-200"}`} aria-hidden="true"><path d="M12 7v14"></path><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"></path></svg>
                )}
                {item.id === "practice" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-square-check-big h-4 w-4 ${isActive ? "text-indigo-600" : "text-indigo-200"}`} aria-hidden="true"><path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path><path d="m9 11 3 3L22 4"></path></svg>
                )}
                {item.id === "exam" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-award h-4 w-4 ${isActive ? "text-indigo-600" : "text-indigo-200"}`} aria-hidden="true"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg>
                )}
                {item.id === "review" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-file-text h-4 w-4 ${isActive ? "text-indigo-600" : "text-indigo-200"}`} aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>
                )}
                {item.id === "stats" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-chart-no-axes-column h-4 w-4 ${isActive ? "text-indigo-600" : "text-indigo-200"}`} aria-hidden="true"><path d="M5 21v-6"></path><path d="M12 21V3"></path><path d="M19 21V9"></path></svg>
                )}
                {item.id === "leaderboard" && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-trophy h-4 w-4 ${isActive ? "text-indigo-600" : "text-indigo-200"}`} aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v3.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"></path></svg>
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right side stats: Streak, Icon Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Streak Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 text-amber-950 font-bold shadow-md">
            <Flame className="h-4.5 w-4.5 text-amber-950 fill-amber-950 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider">{streak} Ngày</span>
          </div>

          {/* Icon Profile Bubble */}
          {profile && (
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`flex items-center gap-2 p-1 rounded-2xl bg-indigo-700/40 hover:bg-indigo-700/80 transition-all border border-indigo-500/30 text-left cursor-pointer ${
                activeTab === "leaderboard" ? "ring-2 ring-amber-400" : ""
              }`}
            >
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="h-8 w-8 rounded-xl bg-slate-100 border border-white p-0.5 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <span className="hidden md:inline-block text-xs font-bold text-white pr-2 max-w-[120px] truncate">
                {profile.name}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile navigation bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-1.5 py-1.5 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 py-1 px-2.5 text-[9px] font-bold rounded-lg transition-all duration-150 cursor-pointer ${
                  isActive
                    ? "text-indigo-600 font-extrabold"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
