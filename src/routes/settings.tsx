import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Cài đặt — LearnFast" },
      {
        name: "description",
        content: "Tùy chỉnh giao diện, thời lượng Pomodoro, âm thanh và mục tiêu học tập trên LearnFast.",
      },
      { property: "og:title", content: "Cài đặt — LearnFast" },
      {
        property: "og:description",
        content: "Tùy chỉnh giao diện, Pomodoro, âm thanh và mục tiêu học tập.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ComingSoon
        icon={Settings}
        title="Cài đặt"
        description="Chọn giao diện sáng/tối, thời lượng Pomodoro mặc định, âm thanh và mục tiêu giờ học mỗi ngày."
      />
    </AppShell>
  ),
});
