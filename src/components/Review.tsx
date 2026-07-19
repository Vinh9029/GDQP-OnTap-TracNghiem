import React, { useState, useMemo } from "react";
import { Search, Star, Sparkles, BookOpen } from "lucide-react";
import { Question, UserStats } from "../types";
import { getQuestionsByPart } from "../data";
import AIExplainer from "./AIExplainer";

interface ReviewProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
}

export default function Review({ stats, setStats }: ReviewProps) {
  const [part, setPart] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeAIQuestionId, setActiveAIQuestionId] = useState<number | null>(null);

  const questions = useMemo(() => {
    return getQuestionsByPart(part);
  }, [part]);

  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim()) return questions;
    const query = searchQuery.toLowerCase();
    return questions.filter(
      (q) =>
        q.question.toLowerCase().includes(query) ||
        q.options.some((opt) => opt.toLowerCase().includes(query))
    );
  }, [questions, searchQuery]);

  const handleToggleBookmark = (id: number) => {
    const qKey = `${part}_${id}`;
    setStats((prev) => {
      const isBookmarked = prev.bookmarkedQuestions.includes(qKey);
      const updated = isBookmarked
        ? prev.bookmarkedQuestions.filter((k) => k !== qKey)
        : [...prev.bookmarkedQuestions, qKey];
      return { ...prev, bookmarkedQuestions: updated };
    });
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* Search and control section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-800">Xem Nhanh Toàn Bộ Câu Hỏi</h3>
            <p className="text-xs text-slate-400 mt-0.5">Đáp án đúng của đề luôn được làm nổi bật để bạn đọc ghi nhớ nhanh</p>
          </div>

          {/* Part Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start">
            <button
              onClick={() => {
                setPart(1);
                setActiveAIQuestionId(null);
              }}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                part === 1
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Học phần 1
            </button>
            <button
              onClick={() => {
                setPart(2);
                setActiveAIQuestionId(null);
              }}
              className={`px-4 py-2 text-xs font-black rounded-lg transition-all cursor-pointer ${
                part === 2
                  ? "bg-amber-400 text-amber-950 shadow-md"
                  : "text-slate-500 hover:text-amber-600"
              }`}
            >
              Học phần 2
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung câu hỏi, phương án trả lời..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Không có câu hỏi nào khớp với từ khóa</h4>
            <p className="text-xs text-gray-500 mt-1">Vui lòng nhập từ khóa tìm kiếm khác.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const qKey = `${part}_${q.id}`;
            const isBookmarked = stats.bookmarkedQuestions.includes(qKey);
            const isAIActive = activeAIQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-all space-y-4 relative"
              >
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700 border border-indigo-100">
                    Mã Câu #{q.id}
                  </span>

                  <button
                    onClick={() => handleToggleBookmark(q.id)}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                      isBookmarked
                        ? "bg-amber-50 border-amber-100 text-amber-500"
                        : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                  </button>
                </div>

                {/* Question body */}
                <h4 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                  {q.question}
                </h4>

                {/* Static visual Options list with highlighted correct answer */}
                <div className="grid gap-3">
                  {q.options.map((option, idx) => {
                    const isCorrect = idx === q.answer;

                    return (
                      <div
                        key={idx}
                        className={`flex items-center p-3 rounded-xl border-2 text-xs sm:text-sm font-medium transition-colors ${
                          isCorrect
                            ? "border-green-600 bg-green-50 text-green-950 font-bold"
                            : "border-slate-50 bg-slate-50/50 text-slate-500 opacity-70"
                        }`}
                      >
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black mr-3 ${
                          isCorrect ? "bg-green-600 text-white" : "bg-slate-200 text-slate-500"
                        }`}>
                          {optionLetters[idx]}
                        </span>
                        <span className="flex-1 leading-relaxed">{option}</span>
                      </div>
                    );
                  })}
                </div>

                {/* AI Explainer Portal toggle */}
                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setActiveAIQuestionId(isAIActive ? null : q.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-black text-amber-950 shadow-sm transition-colors cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {isAIActive ? "Ẩn giải thích AI" : "Giải thích chi tiết bằng AI"}
                  </button>
                </div>

                {/* Integrated Explainer container */}
                {isAIActive && (
                  <AIExplainer
                    question={q.question}
                    options={q.options}
                    answer={q.answer}
                    onClose={() => setActiveAIQuestionId(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
