import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="card-soft animate-fade-up grid min-h-[60vh] place-items-center p-8 text-center">
      <div className="max-w-md">
        <span className="animate-float mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-primary/12 text-primary">
          <Icon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-foreground">{title}</h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{description}</p>
        <span className="btn-press mt-6 inline-block rounded-full bg-primary/12 px-4 py-2 text-xs font-black uppercase tracking-wide text-primary">
          Sắp ra mắt
        </span>
      </div>
    </div>
  );
}
