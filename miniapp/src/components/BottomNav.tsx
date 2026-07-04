import { ChartBar, ForkKnife, House, NotePencil, User } from "@phosphor-icons/react";

export type Tab = "summary" | "diary" | "ai" | "stats" | "profile";

const ITEMS: { id: Tab; label: string; Icon: typeof House }[] = [
  { id: "summary", label: "Сводка", Icon: House },
  { id: "diary", label: "Дневник", Icon: NotePencil },
  { id: "stats", label: "Статистика", Icon: ChartBar },
  { id: "profile", label: "Профиль", Icon: User },
];

interface BottomNavProps {
  active: Tab;
  onChange: (t: Tab) => void;
}

/** Нижняя навигация: 4 вкладки + центральная золотая FAB (AI). */
export function BottomNav({ active, onChange }: BottomNavProps) {
  const left = ITEMS.slice(0, 2);
  const right = ITEMS.slice(2);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-center px-2 pt-2 pb-2">
        {left.map((it) => (
          <NavButton key={it.id} {...it} active={active === it.id} onClick={() => onChange(it.id)} />
        ))}

        {/* Центральная FAB */}
        <div className="flex justify-center">
          <button
            onClick={() => onChange("ai")}
            aria-label="AI-нутрициолог"
            className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-gold text-base shadow-[0_8px_24px_rgb(231_180_76/0.35)] active:scale-[0.95] transition-transform"
          >
            <ForkKnife size={24} weight="fill" />
          </button>
        </div>

        {right.map((it) => (
          <NavButton key={it.id} {...it} active={active === it.id} onClick={() => onChange(it.id)} />
        ))}
      </div>
    </nav>
  );
}

function NavButton({
  label,
  Icon,
  active,
  onClick,
}: {
  label: string;
  Icon: typeof House;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-1 active:scale-[0.95] transition-transform"
    >
      <Icon size={22} weight={active ? "fill" : "regular"} className={active ? "text-gold" : "text-muted"} />
      <span className={`text-[10px] font-medium ${active ? "text-gold" : "text-muted"}`}>{label}</span>
    </button>
  );
}
