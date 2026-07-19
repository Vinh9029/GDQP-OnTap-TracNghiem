import React, { useState, useEffect, useMemo, useRef } from "react";
import { Clock, Award, CheckCircle, XCircle, AlertTriangle, ChevronRight, ChevronLeft, Sparkles, Flag, BookOpen, RotateCcw } from "lucide-react";
import { Question, ExamResult, UserStats } from "../types";
import { getQuestionsByPart } from "../data";
import AIExplainer from "./AIExplainer";
// @ts-ignore
import anhbia2 from "../../assets/anhbia2.jpg";
// @ts-ignore
import anhbia3 from "../../assets/anhbia3.jpg";

interface ExamProps {
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  addExamResult: (result: ExamResult) => void;
  setActiveTab: (tab: "home" | "practice" | "exam" | "review" | "stats") => void;
  initialPart?: 1 | 2;
}

export default function Exam({ stats, setStats, addExamResult, setActiveTab, initialPart }: ExamProps) {
  const [part, setPart] = useState<1 | 2>(initialPart || 1);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examFinished, setExamFinished] = useState<boolean>(false);

  // Exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(2700); // 45 minutes in seconds

  // Review state
  const [activeReviewAI, setActiveReviewAI] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Auto-start if initialPart is provided on mount
  useEffect(() => {
    if (initialPart) {
      startNewExam(initialPart);
    }
  }, [initialPart]);

  // Load and shuffle questions to select exactly 40
  const startNewExam = (selectedPart: 1 | 2) => {
    const questions = getQuestionsByPart(selectedPart);
    // Shuffle and pick 40
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 40);

    setPart(selectedPart);
    setExamQuestions(selected);
    setUserAnswers({});
    setFlaggedQuestions([]);
    setCurrentIdx(0);
    setTimeLeft(2700);
    setExamStarted(true);
    setExamFinished(false);
    setActiveReviewAI(null);
    startTimeRef.current = Date.now();

    // Increment streak in stats
    setStats((prev) => {
      // Calculate day difference for streak (simple increase if not done today)
      return { ...prev, streak: prev.streak === 0 ? 1 : prev.streak };
    });
  };

  // Timer loop
  useEffect(() => {
    if (examStarted && !examFinished) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinishExam(true); // Auto-submit
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examStarted, examFinished]);

  // Submit/Finish exam helper
  const handleFinishExam = (autoSubmitted = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Calculate score
    let correctCount = 0;
    examQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.answer) {
        correctCount++;
      }
    });

    const score = correctCount * 0.25; // 40 questions = 10.0 points
    const passed = score >= 5.0; // Pass mark is 5.0
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    const result: ExamResult = {
      id: `exam_${Date.now()}`,
      part,
      date: new Date().toLocaleDateString("vi-VN"),
      score,
      totalQuestions: 40,
      correctAnswers: correctCount,
      timeSpentSeconds: durationSeconds,
      passed,
    };

    // Save to global history
    addExamResult(result);

    // Also update overall stats for correct/incorrect count
    setStats((prev) => {
      const answered = { ...prev.answeredQuestions };
      const overallUserAnswers = { ...prev.userAnswers };
      const incorrectList = [...prev.incorrectQuestions];

      examQuestions.forEach((q) => {
        const qKey = `${part}_${q.id}`;
        const chosen = userAnswers[q.id];

        if (chosen !== undefined) {
          const isCorrect = chosen === q.answer;
          answered[qKey] = isCorrect;
          overallUserAnswers[qKey] = chosen;

          if (!isCorrect) {
            if (!incorrectList.includes(qKey)) {
              incorrectList.push(qKey);
            }
          } else {
            const idx = incorrectList.indexOf(qKey);
            if (idx !== -1) incorrectList.splice(idx, 1);
          }
        }
      });

      return {
        ...prev,
        answeredQuestions: answered,
        userAnswers: overallUserAnswers,
        incorrectQuestions: incorrectList,
      };
    });

    setExamFinished(true);
    if (autoSubmitted) {
      alert("Hết giờ làm bài! Hệ thống đã tự động nộp bài thi của bạn.");
    }
  };

  // Toggle flag / review mark for active question
  const handleToggleFlag = (id: number) => {
    setFlaggedQuestions((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  // Time formatting helper (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentQ = examQuestions[currentIdx];
  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="pb-16 animate-fade-in">
      {/* 1. SELECTION SCREEN */}
      {!examStarted && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
              Thi Thử Đề Chuẩn Quốc Phòng An Ninh
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Đề thi mô phỏng cấu trúc kỳ thi kết thúc học phần thực tế của Đại học. Bạn có thể chọn thi thử Phần 1 hoặc Phần 2.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 pt-4">
            {/* Part 1 Box */}
            <div className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="relative h-36 w-full overflow-hidden bg-indigo-100">
                <img 
                  src={anhbia2} 
                  alt="Học phần 1" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    Học phần 1
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    Đường lối quân sự của Đảng
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Thi thử ngẫu nhiên 40 câu hỏi trong bộ ngân hàng 160 câu thuộc lý luận quân sự, đường lối quốc phòng toàn dân và chiến tranh nhân dân.
                  </p>

                  {/* Exam Rules */}
                  <div className="mt-5 space-y-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 p-4 text-xs font-semibold text-indigo-950">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-600 animate-pulse" />
                      <span>Thời gian làm bài: <strong className="text-indigo-700">45 phút</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-indigo-600" />
                      <span>Số lượng câu hỏi: <strong className="text-indigo-700">40 câu</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-indigo-600" />
                      <span>Điểm đạt chuẩn: <strong className="text-indigo-700">5.0 / 10.0 (20 câu đúng)</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startNewExam(1)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3.5 text-sm font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Bắt đầu làm bài
                </button>
              </div>
            </div>

            {/* Part 2 Box */}
            <div className="group rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md hover:shadow-xl transition-all flex flex-col justify-between">
              <div className="relative h-36 w-full overflow-hidden bg-amber-100">
                <img 
                  src={anhbia3} 
                  alt="Học phần 2" 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                    Học phần 2
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">
                    Công tác quốc phòng và an ninh
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Thi thử ngẫu nhiên 40 câu hỏi trong bộ ngân hàng 160 câu về công tác quốc phòng an ninh, bảo vệ môi trường, giao thông, an ninh mạng và các thách thức phi truyền thống.
                  </p>

                  {/* Exam Rules */}
                  <div className="mt-5 space-y-2.5 rounded-2xl bg-amber-50/50 border border-amber-100 p-4 text-xs font-semibold text-amber-950">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                      <span>Thời gian làm bài: <strong className="text-amber-700">45 phút</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-amber-600" />
                      <span>Số lượng câu hỏi: <strong className="text-amber-700">40 câu</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-600" />
                      <span>Điểm đạt chuẩn: <strong className="text-amber-700">5.0 / 10.0 (20 câu đúng)</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startNewExam(2)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3.5 text-sm font-bold text-amber-950 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Bắt đầu làm bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE EXAM SCREEN */}
      {examStarted && !examFinished && currentQ && (
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Exam Status & Question grid (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Timer and Status info */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Thời gian còn lại</span>
                <span className="text-xs font-black px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md">
                  Đề Phần {part}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-700">
                <Clock className="h-6 w-6 text-indigo-600 animate-pulse" />
                <span className="text-2xl font-extrabold font-mono tracking-tight">{formatTime(timeLeft)}</span>
              </div>

              {/* Progress counter */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-semibold">
                <span>Số câu đã làm:</span>
                <span className="font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {Object.keys(userAnswers).length} / 40 câu
                </span>
              </div>
            </div>

            {/* Questions map (1-40) */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">Bản đồ bài thi</h4>
                <p className="text-[10px] text-gray-400">Chọn câu bất kỳ để xem và làm bài nhanh</p>
              </div>

              <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                {examQuestions.map((q, idx) => {
                  const isAnswered = userAnswers[q.id] !== undefined;
                  const isFlagged = flaggedQuestions.includes(q.id);
                  const isActive = idx === currentIdx;

                  let btnClass = "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100";
                  if (isAnswered) {
                    btnClass = "bg-indigo-50 border-indigo-200 text-indigo-700";
                  }
                  if (isFlagged) {
                    btnClass = "bg-amber-50 border-amber-200 text-amber-700 ring-1 ring-amber-300";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative flex items-center justify-center h-9 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${btnClass} ${
                        isActive ? "ring-2 ring-indigo-600 ring-offset-1 font-black text-xs scale-105" : ""
                      }`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white border border-white text-[8px]">
                          <Flag className="h-2 w-2 fill-white" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Submit panel inside sidebar */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => {
                    if (confirm(`Bạn có chắc chắn muốn nộp bài thi ngay bây giờ? Bạn đã hoàn thành ${Object.keys(userAnswers).length}/40 câu.`)) {
                      handleFinishExam();
                    }
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 py-3.5 text-xs font-black text-amber-950 shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Award className="h-4 w-4" />
                  Nộp bài thi
                </button>
              </div>
            </div>
          </div>

          {/* Core Arena Question Card (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl relative space-y-6">
              {/* Question card header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Câu hỏi {currentIdx + 1} / 40
                </span>

                <button
                  onClick={() => handleToggleFlag(currentQ.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                    flaggedQuestions.includes(currentQ.id)
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Flag className={`h-3.5 w-3.5 ${flaggedQuestions.includes(currentQ.id) ? "fill-amber-500" : ""}`} />
                  {flaggedQuestions.includes(currentQ.id) ? "Đã gắn cờ" : "Gắn cờ xem lại"}
                </button>
              </div>

              {/* Question text */}
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 leading-snug">
                {currentQ.question}
              </h3>

              {/* Option Cards */}
              <div className="grid gap-4">
                {currentQ.options.map((option, idx) => {
                  const isSelected = userAnswers[currentQ.id] === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setUserAnswers((prev) => ({ ...prev, [currentQ.id]: idx }));
                      }}
                      className={`flex items-center p-4 rounded-2xl border-2 transition-all text-left text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer active:scale-[0.99] group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold shadow-xs"
                          : "border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50"
                      }`}
                    >
                      <span className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-bold mr-4 transition-colors text-base sm:text-lg ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white"
                      }`}>
                        {optionLetters[idx]}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider control buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentIdx((p) => Math.max(0, p - 1))}
                disabled={currentIdx === 0}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-slate-200 px-6 py-3.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                Câu trước
              </button>

              <button
                onClick={() => setCurrentIdx((p) => Math.min(39, p + 1))}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-md cursor-pointer"
              >
                Câu tiếp theo
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RESULTS / SCORECARD SCREEN */}
      {examFinished && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Main Scorecard card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xl text-center space-y-6">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-amber-400 to-indigo-600" />

            <div className="max-w-md mx-auto space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Award className="h-8 w-8" />
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800">Kết Quả Bài Thi Thử</h3>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">
                  Học phần {part}: {part === 1 ? "Đường lối quân sự" : "Công tác quốc phòng"}
                </p>
              </div>

              {/* Main Score graphic */}
              <div className="py-4">
                <div className="inline-flex flex-col items-center justify-center h-36 w-36 rounded-full border-4 border-indigo-600 bg-indigo-50/50 shadow-inner">
                  <span className="text-4xl font-black text-indigo-700 leading-none">
                    {(examQuestions.filter((q) => userAnswers[q.id] === q.answer).length * 0.25).toFixed(2)}
                  </span>
                  <span className="text-xs text-indigo-600 font-extrabold mt-1.5 uppercase tracking-wider">Trên 10đ</span>
                </div>
              </div>

              {/* Pass / Fail banner */}
              <div>
                {examQuestions.filter((q) => userAnswers[q.id] === q.answer).length * 0.25 >= 5.0 ? (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-5 py-2 text-xs font-bold text-green-700 border border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    ĐẠT TIÊU CHUẨN (PASS)
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-5 py-2 text-xs font-bold text-rose-700 border border-rose-200">
                    <XCircle className="h-4 w-4" />
                    CHƯA ĐẠT TIÊU CHUẨN (FAILED)
                  </div>
                )}
              </div>
            </div>

            {/* Details row statistics */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-slate-100 py-6 max-w-lg mx-auto text-center font-bold">
              <div>
                <p className="text-lg text-green-600">
                  {examQuestions.filter((q) => userAnswers[q.id] === q.answer).length}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Câu đúng</p>
              </div>
              <div>
                <p className="text-lg text-rose-500">
                  {examQuestions.filter((q) => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.answer).length}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Câu sai</p>
              </div>
              <div>
                <p className="text-lg text-slate-500">
                  {examQuestions.filter((q) => userAnswers[q.id] === undefined).length}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">Bỏ qua</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <button
                onClick={() => startNewExam(part)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Làm đề thi mới
              </button>
              <button
                onClick={() => setActiveTab("home")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 px-6 py-3.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
              >
                Trở lại Trang chủ
              </button>
            </div>
          </div>

          {/* Comprehensive Review Panel (All 40 questions listed) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-slate-800">Xem Lại Lời Giải & Sửa Sai</h4>
                <p className="text-xs text-gray-400 mt-0.5">Danh sách chi tiết 40 câu hỏi trong đề thi của bạn</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded bg-indigo-50 text-indigo-700">
                Độ chính xác: {(examQuestions.filter((q) => userAnswers[q.id] === q.answer).length / 40 * 100).toFixed(0)}%
              </span>
            </div>

            <div className="space-y-4">
              {examQuestions.map((q, idx) => {
                const userChoice = userAnswers[q.id];
                const isCorrect = userChoice === q.answer;
                const isOpenedAI = activeReviewAI === q.id;

                return (
                  <div
                    key={q.id}
                    className={`rounded-3xl border bg-white p-6 space-y-4 shadow-md relative transition-all ${
                      isCorrect ? "border-green-100 bg-green-50/10" : "border-rose-100 bg-rose-50/10"
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">
                        Câu {idx + 1}: (Mã câu #{q.id})
                      </span>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-[10px] font-bold text-green-700 border border-green-100">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-700 border border-rose-100">
                            <XCircle className="h-3 w-3 text-rose-500" />
                            Sai
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <h5 className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">
                      {q.question}
                    </h5>

                    {/* Show correct & user choices summary */}
                    <div className="grid sm:grid-cols-2 gap-3 text-xs bg-white/70 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Bạn đã chọn:</p>
                        <p className={`font-semibold mt-1 ${isCorrect ? "text-green-700 font-bold" : "text-rose-700 font-bold"}`}>
                          {userChoice !== undefined
                            ? `${optionLetters[userChoice]}. ${q.options[userChoice]}`
                            : "Bỏ qua (Chưa chọn đáp án)"}
                        </p>
                      </div>

                      <div>
                        <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Đáp án đúng của đề:</p>
                        <p className="text-green-700 font-bold mt-1">
                          {optionLetters[q.answer]}. {q.options[q.answer]}
                        </p>
                      </div>
                    </div>

                    {/* Explain with AI Launcher */}
                    <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setActiveReviewAI(isOpenedAI ? null : q.id)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 px-4 py-2 text-xs font-bold text-amber-950 shadow-sm transition-colors cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {isOpenedAI ? "Ẩn giải thích AI" : "Giải thích chi tiết bằng AI"}
                      </button>
                    </div>

                    {/* AI explanation portal inside card */}
                    {isOpenedAI && (
                      <AIExplainer
                        question={q.question}
                        options={q.options}
                        answer={q.answer}
                        onClose={() => setActiveReviewAI(null)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
