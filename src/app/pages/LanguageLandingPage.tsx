import { useLayoutEffect } from "react";
import { useLanguage } from "../components/LanguageContext";
import { HomePage } from "./HomePage";

type SupportedLang = "bg" | "en" | "el" | "tr" | "sr" | "mk" | "ro" | "uk";

export function LanguageLandingPage({ lang }: { lang: SupportedLang }) {
  const { setLanguage } = useLanguage();

  // Set language synchronously before paint so there's no flash of wrong language.
  // This updates the ROOT LanguageProvider so the language persists when the user
  // navigates to /booking, /contact, etc.
  useLayoutEffect(() => {
    setLanguage(lang);
  }, [lang]);

  return <HomePage />;
}
