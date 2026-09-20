import { createFileRoute } from "@tanstack/react-router";
import { Brain } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { ComingSoon } from "@/components/ComingSoon";

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: "Trợ lý AI — LearnFast" },
      {
        name: "description",
        content: "Trợ lý AI của LearnFast giúp giải thích bài, tóm tắt tài liệu và tạo bộ thẻ tự động.",
      },
      { property: "og:title", content: "Trợ lý AI — LearnFast" },
      {
        property: "og:description",
        content: "Giải thích bài, tóm tắt tài liệu và tạo flashcard tự động.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <ComingSoon
        icon={Brain}
        title="Trợ lý AI"
        description="Hỏi đáp bài học, tóm tắt tài liệu và tự sinh bộ flashcard từ ghi chú của bạn."
      />
    </AppShell>
  ),
});
