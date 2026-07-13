import { useEffect, useState } from "react";
import { BottomNav, type Tab } from "./components/BottomNav";
import { Summary } from "./pages/Summary";
import { Diary } from "./pages/Diary";
import { Stats } from "./pages/Stats";
import { Profile } from "./pages/Profile";
import { AiChat } from "./pages/AiChat";
import { Onboarding } from "./pages/Onboarding";
import { IS_PREVIEW } from "./lib/telegram";
import { api } from "./lib/api";
import { DataProvider } from "./lib/store";
import type { Anketa } from "./lib/nutrition";

const ONBOARD_KEY = "cb_onboarded";

export default function App() {
  const [tab, setTab] = useState<Tab>("summary");
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  // Проверяем, пройдена ли анкета
  useEffect(() => {
    if (IS_PREVIEW) {
      setOnboarded(localStorage.getItem(ONBOARD_KEY) === "1");
      return;
    }
    api
      .getMe()
      .then((me) => {
        setOnboarded(me.onboarded);
        if (me.onboarded) localStorage.setItem(ONBOARD_KEY, "1");
      })
      // при сбое сети не сбрасываем анкету, если она уже была пройдена
      .catch(() => setOnboarded(localStorage.getItem(ONBOARD_KEY) === "1"));
  }, []);

  const handleOnboardingDone = async (a: Anketa) => {
    if (!IS_PREVIEW) {
      try {
        await api.onboarding({ ...a, birth_year: new Date().getFullYear() - a.age });
      } catch {
        /* показываем приложение даже при сетевой ошибке */
      }
    }
    localStorage.setItem(ONBOARD_KEY, "1");
    setOnboarded(true);
  };

  if (onboarded === null) {
    return <div className="min-h-[100dvh] bg-base" />; // короткая загрузка
  }

  if (!onboarded) {
    return <Onboarding onDone={handleOnboardingDone} />;
  }

  return (
    <DataProvider>
      <div className="mx-auto min-h-[100dvh] max-w-md bg-base">
        <main className="px-4 pb-28 pt-6">
          {tab === "summary" && <Summary />}
          {tab === "diary" && <Diary />}
          {tab === "ai" && <AiChat />}
          {tab === "stats" && <Stats />}
          {tab === "profile" && <Profile />}
        </main>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </DataProvider>
  );
}
