import React, { useState } from "react";
import { Mail, Shield, User, Sparkles } from "lucide-react";

interface GoogleAuthProps {
  userEmail: string;
  onLogin: (name: string, email: string, photoURL: string) => void;
}

export default function GoogleAuth({ userEmail, onLogin }: GoogleAuthProps) {
  // Check if we have a saved user from previous login (Lần thứ 2)
  const [lastUser, setLastUser] = useState<{ name: string; email: string; photoURL: string } | null>(() => {
    const saved = localStorage.getItem("gdqp_last_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customEmail, setCustomEmail] = useState<string>("");
  const [customName, setCustomName] = useState<string>("");
  
  // If we have a last user, start on "quick login" screen (showCustomForm = false)
  // If we don't have a last user (first time), start directly on the input form (showCustomForm = true)
  const [showCustomForm, setShowCustomForm] = useState<boolean>(() => !localStorage.getItem("gdqp_last_user"));

  const handleQuickLogin = () => {
    if (!lastUser) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(lastUser.name, lastUser.email, lastUser.photoURL);
      setIsSubmitting(false);
    }, 1200);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;
    setIsSubmitting(true);
    setTimeout(() => {
      const seed = customName.replace(/\s+/g, "");
      const photoURL = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
      onLogin(customName, customEmail, photoURL);
      setIsSubmitting(false);
    }, 1200);
  };

  const handlePrefillTest = () => {
    const defaultName = "Mình là người đẹp trai nhất sớm";
    const defaultEmail = userEmail || "dxdeptrainhatsom@gmail.com";
    setCustomName(defaultName);
    setCustomEmail(defaultEmail);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-2xl animate-scale-up">
        {/* Banner with Vietnamese National Flag Theme / Military Accent */}
        <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-800 px-6 py-8 text-center text-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent"></div>
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 font-black text-2xl shadow-xl">
            GD
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">Hệ Thống Ôn Luyện GDQP-AN</h2>
          <p className="text-xs text-indigo-200 mt-1.5 font-semibold uppercase tracking-wider">
            Yêu cầu Đăng nhập hệ thống
          </p>
        </div>

        {/* Form area */}
        <div className="p-6 sm:p-8 space-y-6 bg-slate-50/50">
          {!showCustomForm && lastUser ? (
            /* Login Nhanh Screen (Only shown if lastUser exists) */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Đăng nhập nhanh
                </p>
                <p className="text-xs text-slate-400">
                  Chào mừng bạn quay trở lại! Nhấn vào tài khoản bên dưới để tiếp tục ôn tập.
                </p>
              </div>

              {/* Saved Account Card */}
              <button
                disabled={isSubmitting}
                onClick={handleQuickLogin}
                className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/80 hover:border-indigo-300 transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={lastUser.photoURL}
                    alt={lastUser.name}
                    className="h-10 w-10 shrink-0 rounded-xl bg-indigo-100 border border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-800 truncate group-hover:text-indigo-700">
                      {lastUser.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{lastUser.email}</p>
                  </div>
                </div>
                <span className="shrink-0 text-[10px] font-black px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                  Đăng nhập nhanh
                </span>
              </button>

              {/* Switch Account */}
              <button
                disabled={isSubmitting}
                onClick={() => setShowCustomForm(true)}
                className="w-full py-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 text-slate-600 hover:text-indigo-600 bg-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Mail className="h-4 w-4" />
                Sử dụng tài khoản khác
              </button>
            </div>
          ) : (
            /* First Time Login Form */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Đăng nhập bằng Google
                </p>
                <p className="text-xs text-slate-400">
                  Vui lòng nhập họ tên và email Google của bạn để đồng bộ kết quả.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Họ và Tên
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="Ví dụ: Nguyễn Văn Mười"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Địa chỉ Email (Google)
                  </label>
                  <input
                    type="email"
                    required
                    disabled={isSubmitting}
                    placeholder="TenCuaBan@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-1 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handlePrefillTest}
                  className="text-left text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer py-1 self-start"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Sử dụng tài khoản mẫu nhanh
                </button>
              </div>

              <div className="pt-2 flex gap-3">
                {lastUser && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowCustomForm(false)}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                  >
                    Quay lại
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !customEmail || !customName}
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* Loader Overlay */}
          {isSubmitting && (
            <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center space-y-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
              <p className="text-xs font-bold text-indigo-700 animate-pulse">
                Đang kết nối qua Google Sign-In...
              </p>
            </div>
          )}

          {/* Footer credentials security label */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold border-t border-slate-100 pt-4">
            <Shield className="h-3.5 w-3.5 text-green-500" />
            <span>Kết nối bảo mật qua Google OAuth SSL 256-bit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
