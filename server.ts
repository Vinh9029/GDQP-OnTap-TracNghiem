import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Simple JSON File Database for Caching and Leaderboard
interface LeaderboardUser {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  xp: number;
  streak: number;
  avgExamScore: number;
  totalExams: number;
  updatedAt: string;
}

interface ServerDb {
  explanationsCache: Record<string, string>;
  users: Record<string, LeaderboardUser>;
}

const DB_FILE = path.join(process.cwd(), "server_db.json");

function readDb(): ServerDb {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading database, using defaults:", err);
  }
  // Initialize with empty cache and users
  return { explanationsCache: {}, users: {} };
}

function writeDb(db: ServerDb) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving database:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints

  // 1. AI Explain with dynamic caching to save Gemini quota
  app.post("/api/explain", async (req, res) => {
    try {
      const { question, options, answer } = req.body;
      if (!question || !options || answer === undefined) {
        return res.status(400).json({ error: "Thiếu tham số bắt buộc" });
      }

      const db = readDb();
      const cacheKey = question.trim();

      // Check if explanation is already cached (STATED STATIC AS REQUESTED!)
      if (db.explanationsCache[cacheKey]) {
        console.log(`[Cache Hit] Serving explanation statically for question: "${cacheKey.substring(0, 30)}..."`);
        return res.json({ explanation: db.explanationsCache[cacheKey] });
      }

      console.log(`[Cache Miss] Querying Gemini for question: "${cacheKey.substring(0, 30)}..."`);
      const ai = getAI();
      const optionLetters = ["A", "B", "C", "D"];
      const correctAnswerText = options[answer];
      const correctAnswerLetter = optionLetters[answer];

      const prompt = `Bạn hãy đóng vai trò là một giảng viên môn Giáo dục Quốc phòng và An ninh. Hãy giải thích ngắn gọn, súc tích (khoảng 3-4 câu) lý do tại sao phương án dưới đây là đáp án đúng cho câu hỏi sau:

Câu hỏi: "${question}"
Các phương án:
A. ${options[0]}
B. ${options[1]}
C. ${options[2]}
D. ${options[3]}

Đáp án đúng: Phương án ${correctAnswerLetter}. ${correctAnswerText}

Hãy viết phần giải thích bằng tiếng Việt một cách khoa học, khách quan, súc tích và có định dạng Markdown (in đậm từ khóa quan trọng). Tránh dông dài, tập trung thẳng vào cốt lõi kiến thức để người học dễ ghi nhớ khi ôn thi.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.6,
        }
      });

      const explanationText = response.text || "Không có lời giải thích cụ thể.";

      // Write to cache so future requests are static
      db.explanationsCache[cacheKey] = explanationText;
      writeDb(db);

      res.json({ explanation: explanationText });
    } catch (error: any) {
      console.error("Gemini Explain Error:", error);
      res.status(500).json({ error: error?.message || "Đã xảy ra lỗi khi tạo lời giải thích." });
    }
  });

  // 2. Fetch Leaderboard sorted by XP descending
  app.get("/api/leaderboard", (req, res) => {
    try {
      const db = readDb();
      const filter = req.query.filter as string || "all";

      // Merge real active users from our database
      const realUsers = Object.values(db.users).map(u => ({
        uid: u.uid,
        name: u.name,
        photoURL: u.photoURL,
        xp: u.xp,
        streak: u.streak,
        avgExamScore: u.avgExamScore,
        totalExams: u.totalExams,
      }));

      let list = realUsers;

      // Adjust statistics depending on filters to simulate logical dynamic ranking
      if (filter === "week") {
        list = list.map(u => ({ ...u, xp: Math.round(u.xp * 0.4) }));
      } else if (filter === "part1") {
        list = list.map(u => ({ ...u, xp: Math.round(u.xp * 0.55) }));
      } else if (filter === "part2") {
        list = list.map(u => ({ ...u, xp: Math.round(u.xp * 0.45) }));
      }

      // Sort by XP descending
      list.sort((a, b) => b.xp - a.xp);

      // Add ranking rank index (1-based)
      const rankedList = list.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));

      res.json(rankedList);
    } catch (err: any) {
      console.error("Leaderboard GET Error:", err);
      res.status(500).json({ error: err?.message || "Đã xảy ra lỗi tải bảng xếp hạng." });
    }
  });

  // 3. Post / Sync User Profile info
  app.post("/api/leaderboard", (req, res) => {
    try {
      const { uid, name, email, photoURL, xp, streak, avgExamScore, totalExams } = req.body;
      if (!uid || !name || !email) {
        return res.status(400).json({ error: "Thiếu thông tin người dùng" });
      }

      const db = readDb();
      db.users[uid] = {
        uid,
        name,
        email,
        photoURL: photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${uid}`,
        xp: xp || 0,
        streak: streak || 0,
        avgExamScore: avgExamScore || 0,
        totalExams: totalExams || 0,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);

      res.json({ success: true, profile: db.users[uid] });
    } catch (err: any) {
      console.error("Leaderboard POST Error:", err);
      res.status(500).json({ error: err?.message || "Đã xảy ra lỗi đồng bộ." });
    }
  });

  // 4. Retrieve User Profile by uid or email
  app.get("/api/profile", (req, res) => {
    try {
      const { uid, email } = req.query;
      const db = readDb();
      let user = null;

      if (uid) {
        user = db.users[uid as string];
      } else if (email) {
        user = Object.values(db.users).find(
          (u) => u.email.toLowerCase() === (email as string).toLowerCase()
        );
      }

      if (user) {
        return res.json({ found: true, profile: user });
      }
      return res.json({ found: false });
    } catch (err: any) {
      console.error("Profile GET Error:", err);
      res.status(500).json({ error: err?.message || "Đã xảy ra lỗi tải thông tin cá nhân." });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
