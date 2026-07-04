import { Sparkle } from "@phosphor-icons/react";

const SUGGESTIONS = ["Что приготовить на ужин?", "Составить рацион на день", "Совет по питанию"];

export function AiChat() {
  return (
    <div className="flex min-h-[70dvh] flex-col">
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">AI-нутрициолог</h1>
        <p className="mt-0.5 text-sm text-muted">Персональный помощник по питанию</p>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gold-soft">
          <Sparkle size={30} weight="fill" className="text-gold" />
        </div>
        <div>
          <p className="font-semibold">Скоро здесь появится AI-нутрициолог</p>
          <p className="mx-auto mt-1 max-w-[16rem] text-sm text-muted">
            Распознавание еды по фото, персональные рационы и рецепты.
          </p>
        </div>
      </div>

      {/* Быстрые подсказки (превью) */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <span key={s} className="rounded-full border border-line bg-surface px-3.5 py-2 text-xs text-muted">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-3 opacity-60">
        <span className="flex-1 text-sm text-muted">Спросите о питании…</span>
      </div>
    </div>
  );
}
