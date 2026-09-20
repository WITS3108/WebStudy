import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/flashcards")({
  head: () => ({
    meta: [
      { title: "Flashcard — LearnFast" },
      {
        name: "description",
        content: "Tạo bộ thẻ ghi nhớ và ôn tập theo lịch lặp lại ngắt quãng cùng LearnFast.",
      },
      { property: "og:title", content: "Flashcard — LearnFast" },
      {
        property: "og:description",
        content: "Bộ thẻ ghi nhớ và lịch ôn tập lặp lại ngắt quãng.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ComingSoon
        icon={Layers}
        title="Flashcard"
        description="Tạo bộ thẻ, ôn tập theo lịch lặp lại ngắt quãng và xem thống kê mức thuộc bài."
      />
    </AppShell>
  ),
});
