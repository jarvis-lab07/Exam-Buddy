import {
  Bot,
  ClipboardList,
  Layers,
  Upload,
  type LucideIcon,
} from "lucide-react";

type Action = {
  label: string;
  hint: string;
  icon: LucideIcon;
  accent: string;
};

const actions: Action[] = [
  { label: "Ask AI Tutor", hint: "Instant help", icon: Bot, accent: "#8b7cf6" },
  {
    label: "Upload PDF",
    hint: "Analyze notes",
    icon: Upload,
    accent: "#4f8cff",
  },
  {
    label: "New Mock Test",
    hint: "Test yourself",
    icon: ClipboardList,
    accent: "#f5a524",
  },
  {
    label: "Make Flashcards",
    hint: "Auto-generate",
    icon: Layers,
    accent: "#38d6c4",
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ label, hint, icon: Icon, accent }) => (
        <button
          key={label}
          type="button"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `${accent}1f`, color: accent }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">{label}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {hint}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
