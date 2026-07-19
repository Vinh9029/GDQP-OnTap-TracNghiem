import React from "react";
import { Award, Calendar, Clock, BarChart3, TrendingUp, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { ExamResult, UserStats } from "../types";

interface StatsProps {
  stats: UserStats;
  history: ExamResult[];
  clearHistory: () => void;
}

export default function Stats({ stats, history, clearHistory }: StatsProps) {
  // Calculations
  const totalExams = history.length;
  const scores = history.map((h) => h.score);
  const maxScore = scores.length > 0 ? Math.max(...scores).toFixed(2) : "0.0";
  const averageScore = scores.length > 0
    ? (scores.reduce((acc, curr) => acc + curr, 0) / scores.length).toFixed(2)
    : "0.0";

  const passCount = history.filter((h) => h.passed).length;
  const passRate = totalExams > 0 ? Math.round((passCount / totalExams) * 100) : 0;

  // Question Answered counts
  const part1Completed = Object.keys(stats.answeredQuestions).filter((k) => k.startsWith("1_")).length;
  const part2Completed = Object.keys(stats.answeredQuestions).filter((k) => k.startsWith("2_")).length;

  const part1Pct = Math.round((part1Completed / 160) * 100);
  const part2Pct = Math.round((part2Completed / 160) * 100);

  // Time Formatter helper
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}p ${s}s`;
  };

  // Custom Inline SVG Line Chart Generator for Exam Score History
  const renderTrendChart = () => {
    if (history.length === 0) {
      return (
        <div className="h-44 flex items-center justify-center text-xs text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-slate-200 p-4">
          Chưa có dữ liệu thi thử để hiển thị biểu đồ xu hướng.
        </div>
      );
    }

    // Limit to last 10 exams for better chart clarity
    const lastTenExams = [...history].slice(-10);
    const chartHeight = 160;
    const chartWidth = 500;
    const padding = 25;

    // Map scores (0-10) to Y coordinate (chartHeight - padding down to padding)
    const getX = (index: number) => {
      if (lastTenExams.length === 1) return chartWidth / 2;
      return padding + (index * (chartWidth - padding * 2)) / (lastTenExams.length - 1);
    };

    const getY = (score: number) => {
      const scale = (chartHeight - padding * 2) / 10;
      return chartHeight - padding - score * scale;
    };

    // Construct line path SVG string
    let linePath = "";
    lastTenExams.forEach((exam, idx) => {
      const x = getX(idx);
      const y = getY(exam.score);
      if (idx === 0) {
        linePath += `M ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
      }
    });

    return (
      <div className="w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full overflow-visible">
            {/* Gridlines */}
            {[0, 2.5, 5, 7.5, 10].map((scoreValue) => {
              const y = getY(scoreValue);
              return (
                <g key={scoreValue}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth={scoreValue === 5 ? "1.5" : "1"}
                    strokeDasharray={scoreValue === 5 ? "0" : "3 3"}
                  />
                  <text
                    x={padding - 5}
                    y={y + 3}
                    textAnchor="end"
                    className="text-[9px] font-bold fill-gray-400 font-mono"
                  >
                    {scoreValue}
                  </text>
                </g>
              );
            })}

            {/* Score trend path */}
            {lastTenExams.length > 1 && (
              <path
                d={linePath}
                fill="none"
                stroke="url(#gradientStroke)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
            )}

            {/* Accent points and interactive bubbles */}
            {lastTenExams.map((exam, idx) => {
              const x = getX(idx);
              const y = getY(exam.score);

              return (
                <g key={exam.id} className="group cursor-pointer">
                  <circle
                    cx={x}
                    cy={y}
                    r="5"
                    className="fill-indigo-600 stroke-white stroke-2 drop-shadow-sm"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r="10"
                    className="fill-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                  {/* Tooltip on top of point */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <rect
                      x={x - 22}
                      y={y - 28}
                      width="44"
                      height="20"
                      rx="6"
                      className="fill-slate-900"
                    />
                    <text
                      x={x}
                      y={y - 15}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white font-mono"
                    >
                      {exam.score.toFixed(1)}đ
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <linearGradient id="gradientStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {/* Overview stats cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total exams */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Số lần thi thử</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{totalExams} lượt</p>
          </div>
        </div>

        {/* Avg score */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm số trung bình</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{averageScore} / 10</p>
          </div>
        </div>

        {/* Max score */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 border border-green-100">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Điểm kỷ lục</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{maxScore} / 10</p>
          </div>
        </div>

        {/* Pass rate */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tỉ lệ đạt tiêu chuẩn</p>
            <p className="text-xl font-black text-slate-800 mt-0.5">{passRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left pane: Trend graph & study metrics (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Trend graph card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <div>
              <h4 className="text-base font-extrabold text-slate-800">Xu Hướng Kết Quả Thi</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Thể hiện điểm số của tối đa 10 bài thi thử gần nhất</p>
            </div>
            {renderTrendChart()}
          </div>

          {/* Module-by-module breakdown progress */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md space-y-6">
            <div>
              <h4 className="text-base font-extrabold text-slate-800">Bản Đồ Học Tập Chi Tiết</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Tiến trình trả lời câu hỏi thực tế của từng học phần</p>
            </div>

            <div className="space-y-4">
              {/* Part 1 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Học phần 1: Đường lối quân sự của Đảng</span>
                  <span className="text-indigo-600">{part1Completed}/160 câu ({part1Pct}%)</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${part1Pct}%` }}
                  />
                </div>
              </div>

              {/* Part 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Học phần 2: Công tác quốc phòng và an ninh</span>
                  <span className="text-amber-600">{part2Completed}/160 câu ({part2Pct}%)</span>
                </div>
                <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${part2Pct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Exam attempt history (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md space-y-4 flex flex-col justify-between min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Lịch Sử Thi Thử</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Danh sách thi thử đã tham gia</p>
                </div>

                {totalExams > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Bạn có muốn xóa toàn bộ lịch sử thi thử không?")) {
                        clearHistory();
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Xóa lịch sử thi"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                  <Calendar className="h-10 w-10 text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-slate-600">Chưa tham gia đề thi thử nào.</p>
                  <p className="text-[10px] mt-1 max-w-[200px]">Hãy bắt đầu thi thử để kiểm tra năng lực của bản thân nhé!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {[...history].reverse().map((exam) => (
                    <div
                      key={exam.id}
                      className="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-extrabold text-slate-800">Đề Phần {exam.part}</span>
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            exam.passed ? "bg-green-50 text-green-700 border border-green-100" : "bg-rose-50 text-rose-700 border border-rose-100"
                          }`}>
                            {exam.passed ? "Đạt" : "Trượt"}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {exam.date}
                          <span className="mx-1">•</span>
                          <Clock className="h-3 w-3 shrink-0" />
                          {formatDuration(exam.timeSpentSeconds)}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-indigo-700">{exam.score.toFixed(1)}đ</span>
                        <p className="text-[9px] text-gray-400 mt-0.5 font-bold">({exam.correctAnswers}/40 câu)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
