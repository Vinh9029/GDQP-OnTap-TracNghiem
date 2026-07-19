import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Sparkles, X, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIExplainerProps {
  question: string;
  options: string[];
  answer: number;
  onClose: () => void;
}

export default function AIExplainer({ question, options, answer, onClose }: AIExplainerProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchExplanation = async () => {
    setLoading(true);
    setError("");
    setExplanation("");
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options, answer }),
      });
      const data = await response.json();
      if (response.ok) {
        setExplanation(data.explanation);
      } else {
        setError(data.error || "Không thể tải lời giải thích từ AI.");
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi kết nối mạng. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExplanation();
  }, [question, options, answer]);

  const optionLetters = ["A", "B", "C", "D"];
  const correctAnswerLetter = optionLetters[answer];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-4"
    >
      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-4 sm:p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-amber-100/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 leading-none">
                Trợ lý Giải thích AI
              </h4>
              <p className="text-[10px] text-amber-600/80 font-medium mt-1">
                Giải thích kiến thức Quốc phòng An ninh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-amber-500 hover:bg-amber-100/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="text-sm leading-relaxed text-gray-700">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <div className="relative flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-amber-500 animate-spin" />
                <Sparkles className="absolute h-3 w-3 text-amber-400 animate-ping" />
              </div>
              <p className="text-xs text-amber-700 font-medium animate-pulse">
                AI đang biên soạn lời giải thích chi tiết...
              </p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 text-red-700 border border-red-100">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold">Gặp sự cố khi kết nối với AI</p>
                <p className="text-xs opacity-90 mt-1">{error}</p>
                <button
                  onClick={fetchExplanation}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1.5 text-[11px] font-bold text-red-700 shadow-sm border border-red-200 hover:bg-red-50 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  Thử lại
                </button>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-sm prose-amber max-w-none text-gray-800"
            >
              {/* Highlight chosen/correct answer */}
              <div className="mb-3.5 flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-100 text-green-800 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <span>
                  Đáp án đúng: <strong>Phương án {correctAnswerLetter}</strong>. {options[answer]}
                </span>
              </div>

              {/* Markdown Render Wrapper */}
              <div className="markdown-body space-y-2 text-xs sm:text-sm text-gray-700 font-normal">
                <Markdown
                  components={{
                    p: ({ children }) => <p className="leading-relaxed">{children}</p>,
                    strong: ({ children }) => <strong className="font-semibold text-amber-900">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
                  }}
                >
                  {explanation}
                </Markdown>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
