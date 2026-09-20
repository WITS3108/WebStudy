export type Todo = {
  id: string;
  title: string;
  tag: string;
  priority: "cao" | "vừa" | "thấp";
  done: boolean;
  time: string;
};

export const todayTodos: Todo[] = [
  {
    id: "t1",
    title: "Ôn 30 thẻ từ vựng IELTS",
    tag: "Tiếng Anh",
    priority: "cao",
    done: true,
    time: "07:30",
  },
  {
    id: "t2",
    title: "Làm bài tập Giải tích chương 4",
    tag: "Toán",
    priority: "cao",
    done: true,
    time: "09:00",
  },
  {
    id: "t3",
    title: "Đọc tài liệu Cơ sở dữ liệu (20 trang)",
    tag: "CSDL",
    priority: "vừa",
    done: false,
    time: "14:00",
  },
  {
    id: "t4",
    title: "Viết dàn ý bài luận Lịch sử",
    tag: "Lịch sử",
    priority: "vừa",
    done: false,
    time: "16:30",
  },
  {
    id: "t5",
    title: "Tổng kết ghi chú trong ngày",
    tag: "Thói quen",
    priority: "thấp",
    done: false,
    time: "21:00",
  },
];

export type Deck = {
  id: string;
  name: string;
  subject: string;
  total: number;
  mastered: number;
  due: number;
};

export const decks: Deck[] = [
  { id: "d1", name: "IELTS Academic Word List", subject: "Tiếng Anh", total: 120, mastered: 86, due: 18 },
  { id: "d2", name: "Công thức Đạo hàm & Tích phân", subject: "Toán", total: 64, mastered: 41, due: 12 },
  { id: "d3", name: "Thuật ngữ Cơ sở dữ liệu", subject: "CSDL", total: 48, mastered: 20, due: 9 },
];

export type DayStat = { label: string; hours: number; today?: boolean };

export const weekStats: DayStat[] = [
  { label: "T2", hours: 4.2 },
  { label: "T3", hours: 5.0 },
  { label: "T4", hours: 3.8 },
  { label: "T5", hours: 4.6, today: true },
  { label: "T6", hours: 0 },
  { label: "T7", hours: 0 },
  { label: "CN", hours: 0 },
];

export const streakDays = [true, true, true, true, false, false, false];

export const quotes = [
  "Mỗi phút tập trung hôm nay là một bước gần hơn tới mục tiêu.",
  "Học ít mà đều đặn thắng học nhiều mà thất thường.",
  "Bắt đầu bằng việc nhỏ nhất — phần còn lại sẽ theo sau.",
];
