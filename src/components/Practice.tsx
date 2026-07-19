import React, { useState, useMemo } from "react";
import { Search, Star, HelpCircle, ArrowLeft, ArrowRight, RefreshCw, Sparkles, AlertCircle } from "lucide-react";
import { Question, UserStats } from "../types";
import { getQuestionsByPart } from "../data";
import AIExplainer from "./AIExplainer";

interface PracticeProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  initialPart?: 1 | 2;
  initialFilter?: "all" | "unanswered" | "incorrect" | "bookmarked";
}

export default function Practice({ stats, setStats, initialPart = 1, initialFilter = "all" }: PracticeProps) {
  const [part, setPart] = useState<1 | 2>(initialPart);
  const [filter, setFilter] = useState<"all" | "unanswered" | "incorrect" | "bookmarked">(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAI, setShowAI] = useState<boolean>(false);

  // Retrieve all questions for the active part
  const allQuestions = useMemo(() => {
    return getQuestionsByPart(part);
  }, [part]);

  // Apply filters and searches
  const filteredQuestions = useMemo(() => {
    return allQuestions.filter((q) => {
      const qKey = `${part}_${q.id}`;
      const isAnswered = stats.answeredQuestions[qKey] !== undefined;
      const isCorrect = stats.answeredQuestions[qKey] === true;
      const isIncorrect = stats.answeredQuestions[qKey] === false;
      const isBookmarked = stats.bookmarkedQuestions.includes(qKey);

      // Filter check
      if (filter === "unanswered" && isAnswered) return false;
      if (filter === "incorrect" && !isIncorrect) return false;
      if (filter === "bookmarked" && !isBookmarked) return false;

      // Search check
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesText = q.question.toLowerCase().includes(query);
        const matchesOptions = q.options.some((opt) => opt.toLowerCase().includes(query));
        return matchesText || matchesOptions;
      }

      return true;
    });
  }, [allQuestions, part, filter, searchQuery, stats]);

  // Adjust active question index if index is out of range of filtered questions
  const currentQuestion = useMemo(() => {
    if (filteredQuestions.length === 0) return null;
    const idx = Math.min(currentIndex, filteredQuestions.length - 1);
    return filteredQuestions[idx];
  }, [filteredQuestions, currentIndex]);

  const currentQKey = currentQuestion ? `${part}_${currentQuestion.id}` : "";
  const isBookmarked = currentQuestion ? stats.bookmarkedQuestions.includes(currentQKey) : false;
  const userAnswer = currentQuestion ? stats.userAnswers[currentQKey] : undefined;
  const isAnswered = userAnswer !== undefined;

  // Toggle bookmark helper
  const handleToggleBookmark = () => {
    if (!currentQuestion) return;
    setStats((prev) => {
      const isBooked = prev.bookmarkedQuestions.includes(currentQKey);
      const updated = isBooked
        ? prev.bookmarkedQuestions.filter((k) => k !== currentQKey)
        : [...prev.bookmarkedQuestions, currentQKey];
      return { ...prev, bookmarkedQuestions: updated };
    });
  };

  // Submit answer
  const handleSelectOption = (optionIdx: number) => {
    if (!currentQuestion || isAnswered) return;

    const isCorrect = optionIdx === currentQuestion.answer;

    setStats((prev) => {
      const answered = { ...prev.answeredQuestions, [currentQKey]: isCorrect };
      const userAnswers = { ...prev.userAnswers, [currentQKey]: optionIdx };

      let incorrect = [...prev.incorrectQuestions];
      if (!isCorrect) {
        if (!incorrect.includes(currentQKey)) {
          incorrect.push(currentQKey);
        }
      } else {
        incorrect = incorrect.filter((k) => k !== currentQKey);
      }

      return {
        ...prev,
        answeredQuestions: answered,
        userAnswers,
        incorrectQuestions: incorrect,
      };
    });
    setShowAI(false);
  };

  // Go next/prev
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1);
      setShowAI(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex((p) => p + 1);
      setShowAI(false);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilter("all");
    setSearchQuery("");
    setCurrentIndex(0);
    setShowAI(false);
  };

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="grid lg:grid-cols-12 gap-8 pb-16 animate-fade-in">
      {/* Side Filters & Quick Navigation panel (4 cols) */}
      <div className="lg:col-span-4 space-y-6">
        {/* Module Selector */}
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Học phần ôn luyện</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setPart(1);
                setCurrentIndex(0);
                setShowAI(false);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                part === 1
                  ? "border-indigo-500 bg-indigo-50/50 text-indigo-700 font-black"
                  : "border-gray-100 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Học phần 1
            </button>
            <button
              onClick={() => {
                setPart(2);
                setCurrentIndex(0);
                setShowAI(false);
              }}
              className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                part === 2
                  ? "border-amber-500 bg-amber-50/50 text-amber-700 font-black"
                  : "border-gray-100 bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              Học phần 2
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Bộ lọc câu hỏi</h4>
            <p className="text-[10px] text-gray-400">Chọn trạng thái để tập trung ôn luyện hiệu quả</p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm từ khóa câu hỏi..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Filter list */}
          <div className="space-y-1.5">
            {[
              { id: "all", label: "Tất cả câu hỏi", color: "text-slate-600 bg-slate-50" },
              { id: "unanswered", label: "Câu chưa trả lời", color: "text-blue-600 bg-blue-50/50" },
              { id: "incorrect", label: "Câu làm sai", color: "text-rose-600 bg-rose-50/50" },
              { id: "bookmarked", label: "Câu đã đánh dấu", color: "text-amber-600 bg-amber-50/50" },
            ].map((f) => {
              const count = allQuestions.filter((q) => {
                const k = `${part}_${q.id}`;
                if (f.id === "unanswered") return stats.answeredQuestions[k] === undefined;
                if (f.id === "incorrect") return stats.answeredQuestions[k] === false;
                if (f.id === "bookmarked") return stats.bookmarkedQuestions.includes(k);
                return true;
              }).length;

              const isSel = filter === f.id;

              return (
                <button
                  key={f.id}
                  onClick={() => {
                    setFilter(f.id as any);
                    setCurrentIndex(0);
                    setShowAI(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSel
                      ? "bg-indigo-50 text-indigo-700 border-l-3 border-indigo-600 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${isSel ? "bg-indigo-200 text-indigo-800" : "bg-slate-100 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map Header and Map grid for direct jumping */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Bản đồ câu hỏi</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Danh sách toàn bộ 160 câu</p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
              Học phần {part}
            </span>
          </div>

          <div className="grid grid-cols-8 gap-1.5 max-h-56 overflow-y-auto pr-1">
            {allQuestions.map((q, idx) => {
              const k = `${part}_${q.id}`;
              const state = stats.answeredQuestions[k];
              const isQBookmarked = stats.bookmarkedQuestions.includes(k);
              const isActive = currentQuestion?.id === q.id;

              let bgClass = "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100";
              if (state === true) bgClass = "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100";
              if (state === false) bgClass = "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100";

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    // Find actual index in filtered list
                    const fIdx = filteredQuestions.findIndex((fq) => fq.id === q.id);
                    if (fIdx !== -1) {
                      setCurrentIndex(fIdx);
                      setShowAI(false);
                    } else {
                      // Question is not in current filter - reset filter to see it
                      setFilter("all");
                      const rawIdx = allQuestions.findIndex((aq) => aq.id === q.id);
                      setCurrentIndex(rawIdx !== -1 ? rawIdx : 0);
                      setShowAI(false);
                    }
                  }}
                  className={`relative flex items-center justify-center h-8 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${bgClass} ${
                    isActive ? "ring-2 ring-indigo-500 ring-offset-1 font-black" : ""
                  }`}
                >
                  {q.id}
                  {isQBookmarked && (
                    <span className="absolute top-0 right-0 h-1.5 w-1.5 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Study Arena Card slider (8 cols) */}
      <div className="lg:col-span-8">
        {filteredQuestions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
              <HelpCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Không tìm thấy câu hỏi phù hợp</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Hãy đổi bộ lọc hoặc từ khóa tìm kiếm để tiếp tục ôn tập kiến thức Quốc phòng An ninh.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset bộ lọc
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top stats of current slider state */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100">
              <span>
                Bộ lọc: <strong className="text-indigo-700">{filter === "all" ? "Tất cả" : filter === "unanswered" ? "Chưa làm" : filter === "incorrect" ? "Câu sai" : "Đã lưu"}</strong>
              </span>
              <span>
                Câu hỏi <strong className="text-indigo-700">{currentIndex + 1}</strong> trên <strong className="text-indigo-700">{filteredQuestions.length}</strong>
              </span>
            </div>

            {/* Question card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl relative space-y-6">
              {/* Card top flags */}
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
                  Mã câu: #{currentQuestion?.id}
                </span>

                <button
                  onClick={handleToggleBookmark}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors cursor-pointer ${
                    isBookmarked
                      ? "bg-amber-50 border-amber-200 text-amber-500"
                      : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50"
                  }`}
                  title={isBookmarked ? "Bỏ đánh dấu" : "Đánh dấu câu hỏi"}
                >
                  <Star className={`h-4.5 w-4.5 ${isBookmarked ? "fill-amber-500" : ""}`} />
                </button>
              </div>

              {/* Question Text */}
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 leading-snug">
                {currentQuestion?.question}
              </h3>

              {/* Multiple Choice Options */}
              <div className="grid gap-4">
                {currentQuestion?.options.map((option, idx) => {
                  const isSelected = userAnswer === idx;
                  const isCorrectAnswer = idx === currentQuestion.answer;

                  let optClass = "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50";
                  let bgLeft = "bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white";

                  if (isAnswered) {
                    if (isCorrectAnswer) {
                      optClass = "border-green-600 bg-green-50/70 text-green-900 font-bold shadow-xs";
                      bgLeft = "bg-green-600 text-white";
                    } else if (isSelected) {
                      optClass = "border-rose-500 bg-rose-50 text-rose-950 font-bold shadow-xs";
                      bgLeft = "bg-rose-500 text-white";
                    } else {
                      optClass = "border-slate-100 opacity-50";
                      bgLeft = "bg-slate-100 text-slate-400";
                    }
                  } else {
                    optClass += " cursor-pointer active:scale-[0.99] group";
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left text-xs sm:text-sm font-semibold text-slate-700 ${optClass}`}
                    >
                      <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors text-base sm:text-lg ${bgLeft}`}>
                        {optionLetters[idx]}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Answer result message and AI Explain launcher */}
              {isAnswered && currentQuestion && (
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {userAnswer === currentQuestion.answer ? (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3.5 py-1 text-xs font-bold text-green-700 border border-green-200">
                          Chính xác! +0.25đ
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                          Chưa đúng
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setShowAI(!showAI)}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 px-5 py-2.5 text-xs font-bold text-amber-950 shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {showAI ? "Ẩn giải thích AI" : "Giải thích bằng AI"}
                    </button>
                  </div>

                  {/* AI Explainer slide-down */}
                  {showAI && (
                    <AIExplainer
                      question={currentQuestion.question}
                      options={currentQuestion.options}
                      answer={currentQuestion.answer}
                      onClose={() => setShowAI(false)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Slide Navigation footer */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Câu trước
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === filteredQuestions.length - 1}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
              >
                Câu sau
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
