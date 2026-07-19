import React, { useState, useEffect } from "react";
import { Award, Zap, Flame, User, Edit2, CheckCircle, RotateCcw, ShieldCheck, Trophy, Sparkles, RefreshCw, Star } from "lucide-react";
import { UserProfile, LeaderboardEntry } from "../types";
import { fetchLeaderboardList } from "../lib/firebase";

interface LeaderboardProps {
  profile: UserProfile | null;
  onUpdateProfile: (name: string, photoURL: string) => void;
  stats: any;
  history: any[];
  onLogout: () => void;
}

// Preset fun avatars that users can select from easily!
const PRESET_AVATARS = [
  { name: "Chiến sĩ 1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" },
  { name: "Chiến sĩ 2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack" },
  { name: "Học viên 1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aria" },
  { name: "Học viên 2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sasha" },
  { name: "Sĩ quan 1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Milo" },
  { name: "Sĩ quan 2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Zoe" },
];

export default function Leaderboard({ profile, onUpdateProfile, stats, history, onLogout }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "profile">("leaderboard");
  const [timeFilter, setTimeFilter] = useState<"all" | "week" | "part1" | "part2">("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile?.name || "");
  const [editAvatar, setEditAvatar] = useState(profile?.photoURL || "");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Sync edit state when profile changes
  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
      setEditAvatar(profile.photoURL);
    }
  }, [profile]);

  // Fetch or generate leaderboard data including current user
  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLeaderboardList(timeFilter);
      
      // Find if current user is in the data. If so, tag them.
      const updatedData = data.map((entry: any) => ({
        ...entry,
        isCurrentUser: entry.uid === profile?.uid,
      }));
      setLeaderboardData(updatedData);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
      generateFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackData = () => {
    if (!profile) return;

    // Include current user
    const currentUserEntry: LeaderboardEntry = {
      uid: profile.uid,
      name: profile.name + " (Bạn)",
      photoURL: profile.photoURL,
      xp: profile.xp,
      streak: profile.streak,
      avgExamScore: profile.avgExamScore,
      totalExams: profile.totalExams,
      isCurrentUser: true,
    };

    let list = [currentUserEntry];
    if (timeFilter === "week") {
      list = list.map(u => ({
        ...u,
        xp: Math.round(u.xp * 0.4),
      }));
    } else if (timeFilter === "part1") {
      list = list.map(u => ({
        ...u,
        xp: Math.round(u.xp * 0.55),
      }));
    } else if (timeFilter === "part2") {
      list = list.map(u => ({
        ...u,
        xp: Math.round(u.xp * 0.45),
      }));
    }

    // Sort by XP descending
    list.sort((a, b) => b.xp - a.xp);

    // Apply ranking numbers
    list = list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    setLeaderboardData(list);
  };

  // Sync profile details with backend database whenever profile stats change
  const syncProfileToBackend = async () => {
    if (!profile) return;
    try {
      await fetch("/api/leaderboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: profile.uid,
          name: profile.name,
          email: profile.email,
          photoURL: profile.photoURL,
          xp: profile.xp,
          streak: profile.streak,
          avgExamScore: profile.avgExamScore,
          totalExams: profile.totalExams,
        }),
      });
    } catch (e) {
      console.warn("Failed to sync profile to server:", e);
    }
  };

  // Trigger reload on filter or profile change
  useEffect(() => {
    if (profile) {
      syncProfileToBackend().then(() => {
        fetchLeaderboard();
      });
    } else {
      fetchLeaderboard();
    }
  }, [timeFilter, profile?.xp, profile?.streak, profile?.avgExamScore, profile?.name, profile?.photoURL]);

  const handleSaveProfile = () => {
    if (!editName.trim()) return;
    onUpdateProfile(editName.trim(), editAvatar);
    setIsEditing(false);
  };

  const podiumUsers = leaderboardData.slice(0, 3);
  const remainingUsers = leaderboardData.slice(3);

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Banner / Tab Switcher */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Trophy className="h-6 w-6 text-amber-500 fill-amber-400" />
              Đấu Trường Học Tập & Hồ Sơ Cá Nhân
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cạnh tranh lành mạnh cùng các học viên Giáo dục Quốc phòng trên khắp cả nước
            </p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl self-start">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeTab === "leaderboard"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Bảng Xếp Hạng
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Hồ Sơ Cá Nhân
            </button>
          </div>
        </div>
      </div>

      {activeTab === "leaderboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Board Section (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filters panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Lọc theo phạm vi:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "Toàn bộ" },
                  { id: "week", label: "Tuần này" },
                  { id: "part1", label: "Học phần 1" },
                  { id: "part2", label: "Học phần 2" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTimeFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      timeFilter === f.id
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-md space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto"></div>
                <p className="text-xs text-slate-500 font-bold">Đang tính toán bảng xếp hạng...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 🏆 Podium Visualization (First 3 Ranks) */}
                {podiumUsers.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-8 pb-4 px-4 bg-gradient-to-t from-slate-50 to-white border border-slate-200 rounded-3xl shadow-sm">
                    {/* 🥈 2nd Place */}
                    {podiumUsers[1] && (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                          <img
                            src={podiumUsers[1].photoURL}
                            alt={podiumUsers[1].name}
                            className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-100 border-4 border-slate-300 p-0.5 shadow-md ${
                              podiumUsers[1].isCurrentUser ? "ring-4 ring-indigo-500/30 animate-pulse" : ""
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-black border-2 border-white shadow-sm">
                            2
                          </span>
                        </div>
                        <div className="text-center min-w-0 w-full px-1">
                          <p className={`text-xs font-black truncate ${podiumUsers[1].isCurrentUser ? "text-indigo-700" : "text-slate-800"}`}>
                            {podiumUsers[1].name.split(" ")[0]}
                          </p>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500">
                            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {podiumUsers[1].xp} XP
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 🥇 1st Place */}
                    {podiumUsers[0] && (
                      <div className="flex flex-col items-center space-y-2 transform -translate-y-4">
                        <div className="relative">
                          {/* Crown Icon */}
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                            👑
                          </div>
                          <img
                            src={podiumUsers[0].photoURL}
                            alt={podiumUsers[0].name}
                            className={`h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-amber-50 border-4 border-amber-400 p-0.5 shadow-xl ${
                              podiumUsers[0].isCurrentUser ? "ring-4 ring-indigo-500/30 animate-pulse" : ""
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 rounded-full h-6 w-6 flex items-center justify-center text-xs font-black border-2 border-white shadow-md">
                            1
                          </span>
                        </div>
                        <div className="text-center min-w-0 w-full px-1">
                          <p className={`text-sm font-black truncate ${podiumUsers[0].isCurrentUser ? "text-indigo-700" : "text-amber-800"}`}>
                            {podiumUsers[0].name.split(" ")[0]}
                          </p>
                          <span className="inline-flex items-center gap-0.5 text-xs font-black text-amber-600">
                            <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                            {podiumUsers[0].xp} XP
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 🥉 3rd Place */}
                    {podiumUsers[2] && (
                      <div className="flex flex-col items-center space-y-2">
                        <div className="relative">
                          <img
                            src={podiumUsers[2].photoURL}
                            alt={podiumUsers[2].name}
                            className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-amber-50/20 border-4 border-amber-600/40 p-0.5 shadow-md ${
                              podiumUsers[2].isCurrentUser ? "ring-4 ring-indigo-500/30 animate-pulse" : ""
                            }`}
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-600/60 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-black border-2 border-white shadow-sm">
                            3
                          </span>
                        </div>
                        <div className="text-center min-w-0 w-full px-1">
                          <p className={`text-xs font-black truncate ${podiumUsers[2].isCurrentUser ? "text-indigo-700" : "text-slate-800"}`}>
                            {podiumUsers[2].name.split(" ")[0]}
                          </p>
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700">
                            <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {podiumUsers[2].xp} XP
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Remaining Users Table */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-md">
                  <div className="divide-y divide-slate-100">
                    {remainingUsers.map((user) => (
                      <div
                        key={user.uid}
                        className={`flex items-center justify-between p-4 sm:px-6 transition-all hover:bg-slate-50/50 ${
                          user.isCurrentUser ? "bg-indigo-50/30 border-l-4 border-indigo-600" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Rank */}
                          <span className="w-6 font-mono text-xs font-bold text-slate-400 text-center">
                            {user.rank}
                          </span>

                          <img
                            src={user.photoURL}
                            alt={user.name}
                            className="h-10 w-10 rounded-xl bg-slate-100 shrink-0 shadow-sm border border-slate-200/50"
                            referrerPolicy="no-referrer"
                          />

                          <div className="min-w-0">
                            <h5 className={`text-xs sm:text-sm truncate font-bold ${
                              user.isCurrentUser ? "text-indigo-700 font-extrabold" : "text-slate-800"
                            }`}>
                              {user.name}
                            </h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold mt-0.5">
                              <span className="flex items-center gap-0.5 text-amber-600">
                                <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                                {user.streak} ngày
                              </span>
                              <span>•</span>
                              <span>{user.totalExams} lượt thi</span>
                              <span>•</span>
                              <span className="text-indigo-600">TB: {user.avgExamScore.toFixed(1)}đ</span>
                            </div>
                          </div>
                        </div>

                        {/* XP Badge */}
                        <div className="flex items-center gap-1 shrink-0 ml-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                          <Zap className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-slate-700">{user.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Guidelines Section (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
              <h4 className="text-base font-extrabold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Cơ Chế Tính Điểm XP
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tích lũy điểm Kinh nghiệm (XP) bằng cách ôn luyện tích cực hằng ngày:
              </p>

              <div className="space-y-3">
                {[
                  { desc: "Luyện câu hỏi đúng (Practice)", val: "+10 XP" },
                  { desc: "Tham gia 1 bài Thi Thử (Exam)", val: "+100 XP" },
                  { desc: "Đạt chuẩn bài thi (Pass - từ 5đ)", val: "+150 XP" },
                  { desc: "Đạt điểm tối đa bài thi (10/10)", val: "+300 XP" },
                  { desc: "Mỗi ngày duy trì chuỗi Streak", val: "+20 XP × ngày" },
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-medium">
                    <span className="text-slate-600">{rule.desc}</span>
                    <span className="font-extrabold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded-md text-[10px]">
                      {rule.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500 shrink-0" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Hệ thống tự động cập nhật
                </p>
              </div>
            </div>

            {/* Current user scorecard banner */}
            {profile && (
              <div className="rounded-3xl border border-indigo-100 bg-indigo-600 text-white p-6 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 translate-x-8 -translate-y-8 h-32 w-32 bg-indigo-500/20 rounded-full blur-xl" />
                <div className="flex items-center gap-3">
                  <img
                    src={profile.photoURL}
                    alt={profile.name}
                    className="h-12 w-12 rounded-2xl bg-white border-2 border-indigo-200 shadow-md p-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-200">
                      Cấp bậc của bạn
                    </p>
                    <h5 className="text-sm font-black truncate max-w-[180px]">
                      {profile.name}
                    </h5>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-center">
                  <div className="bg-white/10 p-2.5 rounded-2xl">
                    <p className="text-[10px] text-indigo-200 font-semibold uppercase">Điểm XP</p>
                    <p className="text-lg font-black font-mono">{profile.xp}</p>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-2xl">
                    <p className="text-[10px] text-indigo-200 font-semibold uppercase">Hạng hiện tại</p>
                    <p className="text-lg font-black font-mono">
                      #{leaderboardData.find(u => u.uid === profile.uid)?.rank || "--"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "profile" && profile && (
        <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent" />
          </div>

          <div className="relative px-6 sm:px-10 pb-8 space-y-8">
            {/* User Avatar Circle overlapping banner */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
              <div className="relative">
                <img
                  src={editAvatar}
                  alt={profile.name}
                  className="h-28 w-28 rounded-3xl border-4 border-white bg-slate-100 shadow-xl p-0.5 shrink-0"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-center sm:text-left pb-1">
                <h4 className="text-xl font-black text-slate-800">{profile.name}</h4>
                <p className="text-xs text-slate-400 font-semibold">{profile.email}</p>
              </div>
            </div>

            {/* Profile editing card */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h5 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                  Chỉnh Sửa Hồ Sơ Tài Khoản
                </h5>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thay đổi tên hiển thị và lựa chọn hình ảnh đại diện (avatar) của bạn
                </p>
              </div>

              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Họ và Tên
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Lựa chọn Avatar (Hình đại diện)
                    </label>
                    
                    {/* Preset Avatars Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
                      {PRESET_AVATARS.map((avatar, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditAvatar(avatar.url)}
                          className={`relative p-1 rounded-2xl border-2 transition-all cursor-pointer ${
                            editAvatar === avatar.url
                              ? "border-indigo-600 bg-indigo-50"
                              : "border-slate-100 hover:border-slate-300 bg-white"
                          }`}
                        >
                          <img
                            src={avatar.url}
                            alt={avatar.name}
                            className="h-12 w-12 mx-auto"
                            referrerPolicy="no-referrer"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Custom Avatar URL Option */}
                    <div className="space-y-2 pt-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Hoặc Nhập URL Avatar Tùy Ý
                      </label>
                      <input
                        type="url"
                        placeholder="Nhập đường dẫn ảnh đại diện (https://...)"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(profile.name);
                        setEditAvatar(profile.photoURL);
                        setIsEditing(false);
                      }}
                      className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold bg-white hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      disabled={!editName.trim()}
                      className="flex-1 py-3.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Read-only details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Họ và Tên</p>
                      <p className="text-sm font-black text-slate-800 mt-1">{profile.name}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Email Google</p>
                      <p className="text-sm font-bold text-slate-800 mt-1 truncate">{profile.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                      <Zap className="h-6 w-6 text-indigo-600 mx-auto" />
                      <p className="text-lg font-black text-slate-800 mt-2">{profile.xp}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">Điểm XP</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 text-center">
                      <Flame className="h-6 w-6 text-amber-500 fill-amber-500 mx-auto" />
                      <p className="text-lg font-black text-slate-800 mt-2">{profile.streak} ngày</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">Chuỗi Streak</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-green-50/50 border border-green-100 text-center">
                      <Award className="h-6 w-6 text-green-600 mx-auto" />
                      <p className="text-lg font-black text-slate-800 mt-2">{profile.avgExamScore.toFixed(2)}đ</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">Thi Thử TB</p>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={onLogout}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 px-5 py-3 text-xs font-bold text-rose-700 transition-all cursor-pointer"
                    >
                      Đăng xuất Google
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Thay đổi thông tin
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
