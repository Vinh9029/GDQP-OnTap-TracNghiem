# Ôn luyện GDQP-AN

Ứng dụng web hỗ trợ sinh viên ôn luyện và thi thử trắc nghiệm môn Giáo dục Quốc phòng và An ninh (Học phần 1 & Học phần 2). Ứng dụng tích hợp công nghệ AI (Google Gemini) để giải thích chi tiết các đáp án, giúp người học hiểu sâu hơn về kiến thức.

## Tính năng chính

- **Luyện tập theo học phần**: Ngân hàng câu hỏi phong phú chia theo Học phần 1 (Đường lối quân sự của Đảng) và Học phần 2 (Công tác quốc phòng và an ninh).
- **Thi thử (Mock Exam)**: Làm bài thi thử với cấu trúc và thời gian tương đương thi thật, đánh giá kết quả tức thời.
- **Trợ lý AI giải thích**: Giải thích chi tiết vì sao một đáp án đúng hoặc sai sử dụng sức mạnh của Google Gemini AI.
- **Theo dõi tiến độ**: Ghi nhận số lượng câu đã luyện tập, lịch sử thi và lưu trữ an toàn qua Firebase.
- **Bảng xếp hạng**: So sánh thành tích học tập với các sinh viên khác.
- **Chế độ Review**: Xem lại các câu trả lời sai để rút kinh nghiệm.

## Công nghệ sử dụng

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React icons.
- **Backend/Cơ sở dữ liệu**: Firebase Authentication, Firestore (lưu trữ điểm số và tiến độ).
- **AI**: Google Gemini API (@google/genai) chạy trên server.

## Bắt đầu

Dự án này được thiết kế để chạy trên môi trường Google AI Studio. Các cấu hình Firebase và Gemini API đã được thiết lập mặc định trong môi trường.

**Bản quyền © 2026 DQuocVinh.**
Tất cả dữ liệu và mã nguồn được tạo ra phục vụ mục đích học tập.
