# Todo API bằng Python

API dùng FastAPI và SQLite, có sẵn 5 nhiệm vụ mẫu khi cơ sở dữ liệu còn trống.

## Chạy trên máy

Từ thư mục gốc dự án:

```powershell
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

API chạy tại `http://127.0.0.1:8000`; tài liệu tương tác tại `http://127.0.0.1:8000/docs`.

## Các endpoint

- `GET /api/todos` — lấy danh sách.
- `POST /api/todos` — thêm việc. Ví dụ JSON: `{"title":"Ôn bài","tag":"Toán","priority":"cao","time":"19:00"}`.
- `PATCH /api/todos/{id}` — cập nhật trạng thái. Ví dụ JSON: `{"done":true}`.
- `DELETE /api/todos/{id}` — xóa một việc.
- `DELETE /api/todos/completed` — xóa tất cả việc đã hoàn thành.
- `POST /api/study/record` — cộng thời gian tập trung vào ngày học. JSON: `{"seconds":900,"study_date":"2026-09-25"}`.
- `GET /api/study/stats?today=2026-09-25` — lấy giờ học hôm nay, tổng tuần, chuỗi ngày và dữ liệu biểu đồ theo tuần.

Dữ liệu to-do và giờ học nằm trong `backend/todos.sqlite3`. Mỗi ngày cần học ít nhất 15 phút tập trung để được tính vào chuỗi. Pomodoro lưu phần thời gian tập trung khi tạm dừng, đặt lại, hoàn tất hoặc rời khỏi trang; thời gian nghỉ không được tính.
