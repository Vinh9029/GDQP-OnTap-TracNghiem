import React from "react";
import { Book, Award, Flame, RefreshCw, Star, Trash2, ArrowRight, Play, CheckCircle } from "lucide-react";
import { UserStats, ExamResult } from "../types";
// @ts-ignore
import anhbia1 from "../../assets/anhbia1.jpg";
// @ts-ignore
import anhbia2 from "../../assets/anhbia2.jpg";
// @ts-ignore
import anhbia3 from "../../assets/anhbia3.jpg";

interface DashboardProps {
  stats: UserStats;
  history: ExamResult[];
  startPractice: (part: 1 | 2, filter?: "all" | "incorrect" | "bookmarked") => void;
  startExam: (part: 1 | 2) => void;
  resetAllData: () => void;
  setActiveTab: (tab: "home" | "practice" | "exam" | "review" | "stats") => void;
}

export default function Dashboard({
  stats,
  history,
  startPractice,
  startExam,
  resetAllData,
  setActiveTab,
}: DashboardProps) {
  // Calculate stats
  const totalPart1Answered = Object.keys(stats.answeredQuestions).filter((k) => k.startsWith("1_")).length;
  const totalPart2Answered = Object.keys(stats.answeredQuestions).filter((k) => k.startsWith("2_")).length;

  const part1Progress = Math.min(100, Math.round((totalPart1Answered / 160) * 100));
  const part2Progress = Math.min(100, Math.round((totalPart2Answered / 160) * 100));

  const totalIncorrect = stats.incorrectQuestions.length;
  const totalBookmarks = stats.bookmarkedQuestions.length;

  const averageScore = history.length > 0
    ? (history.reduce((acc, curr) => acc + curr.score, 0) / history.length).toFixed(1)
    : "N/A";

  const passedExams = history.filter((h) => h.passed).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-indigo-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
        {/* Background Cover Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={anhbia1} 
            alt="Giáo Dục Quốc Phòng" 
            className="h-full w-full object-cover opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-900/70 to-transparent" />
        </div>

        <div className="relative max-w-2xl z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            🎓 Tài liệu ôn thi chuẩn 2026
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight font-display">
            Trắc nghiệm Giáo dục Quốc phòng & An ninh
          </h2>
          <p className="mt-2 text-sm sm:text-base text-indigo-50/90 leading-relaxed font-medium">
            Hệ thống ôn luyện thông minh tích hợp giải thích bằng AI giúp bạn nhanh chóng nắm vững kiến thức Học phần 1 & Học phần 2 và vượt qua kì thi đạt điểm tuyệt đối.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("practice")}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-6 py-3 text-sm font-black text-amber-950 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Luyện tập ngay
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setActiveTab("exam")}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-800/40 border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10 transition-all cursor-pointer"
            >
              Thi thử Đề chuẩn
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Flame className="h-6 w-6 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Học tập liên tục</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{stats.streak} ngày</p>
          </div>
        </div>

        {/* Avg score card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Điểm thi thử TB</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">
              {averageScore !== "N/A" ? `${averageScore}/10` : "Chưa thi"}
            </p>
          </div>
        </div>

        {/* Incorrect answers box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Hộp câu sai</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{totalIncorrect} câu</p>
          </div>
        </div>

        {/* Bookmarked questions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Star className="h-6 w-6 fill-indigo-500 text-indigo-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Đã đánh dấu</p>
            <p className="text-lg font-black text-slate-800 mt-0.5">{totalBookmarks} câu</p>
          </div>
        </div>
      </div>

      {/* Main Educational Modules */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Part 1 Card */}
        <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-all">
          {/* Cover image header */}
          <div className="relative h-36 w-full overflow-hidden bg-indigo-100">
            <img 
              src={anhbia2} 
              alt="Học phần 1" 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                Phần 1 - 160 Câu
              </span>
              <span className="text-xs text-white font-bold drop-shadow-md">Đã luyện tập {totalPart1Answered}/160</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors font-display">
                Đường lối quân sự của Đảng
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                Bao gồm: Lý luận Mác - Lênin và Tư tưởng Hồ Chí Minh về chiến tranh, quân đội và bảo vệ Tổ quốc; Xây dựng nền quốc phòng toàn dân, an ninh nhân dân; Chiến tranh nhân dân bảo vệ Tổ quốc; Xây dựng lực lượng vũ trang nhân dân.
              </p>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Tiến độ hoàn thành</span>
                  <span>{part1Progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 transition-all duration-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                    style={{ width: `${part1Progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => startPractice(1)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer border border-slate-100"
              >
                <Play className="h-3.5 w-3.5 text-slate-500" />
                Luyện tập
              </button>
              <button
                onClick={() => startExam(1)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
              >
                <Award className="h-3.5 w-3.5" />
                Thi thử
              </button>
            </div>
          </div>
        </div>

        {/* Part 2 Card */}
        <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl hover:shadow-2xl transition-all">
          {/* Cover image header */}
          <div className="relative h-36 w-full overflow-hidden bg-amber-100">
            <img 
              src={anhbia3} 
              alt="Học phần 2" 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                Phần 2 - 160 Câu
              </span>
              <span className="text-xs text-white font-bold drop-shadow-md">Đã luyện tập {totalPart2Answered}/160</span>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-amber-600 transition-colors font-display">
                Công tác quốc phòng và an ninh
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                Bao gồm: Phòng, chống chiến lược "Diễn biến hòa bình", bạo loạn lật đổ; Vấn đề dân tộc, tôn giáo và đấu tranh lợi dụng tôn giáo; Bảo vệ môi trường, trật tự an toàn giao thông; Phòng ngừa tội phạm và bảo đảm an toàn thông tin mạng.
              </p>

              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                  <span>Tiến độ hoàn thành</span>
                  <span>{part2Progress}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"
                    style={{ width: `${part2Progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => startPractice(2)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-xs font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all cursor-pointer border border-slate-100"
              >
                <Play className="h-3.5 w-3.5 text-slate-500" />
                Luyện tập
              </button>
              <button
                onClick={() => startExam(2)}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-600 transition-all active:scale-95 cursor-pointer"
              >
                <Award className="h-3.5 w-3.5" />
                Thi thử
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Specialty Quick Practice Containers */}
      {(totalIncorrect > 0 || totalBookmarks > 0) && (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <h4 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Các chế độ luyện tập nâng cao</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            {totalIncorrect > 0 && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <RefreshCw className="h-5 w-5 animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Ôn tập câu trả lời sai</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Tập trung sửa sai {totalIncorrect} câu đã làm sai</p>
                  </div>
                </div>
                <button
                  onClick={() => startPractice(1, "incorrect")}
                  className="rounded-xl bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors cursor-pointer border border-indigo-100"
                >
                  Bắt đầu
                </button>
              </div>
            )}

            {totalBookmarks > 0 && (
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Star className="h-5 w-5 fill-indigo-500 text-indigo-500" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-900">Câu hỏi đã đánh dấu</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Học lại {totalBookmarks} câu bạn lưu trữ riêng</p>
                  </div>
                </div>
                <button
                  onClick={() => startPractice(1, "bookmarked")}
                  className="rounded-xl bg-indigo-50 hover:bg-indigo-100 px-4 py-2 text-xs font-bold text-indigo-700 transition-colors cursor-pointer border border-indigo-100"
                >
                  Bắt đầu
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
