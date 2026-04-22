import { LanguageProvider } from "../components/LanguageContext";
import { HomePage } from "./HomePage";

type SupportedLang = "en" | "el" | "tr" | "sr" | "mk" | "ro";

export function LanguageLandingPage({ lang }: { lang: SupportedLang }) {
  return (
    <LanguageProvider initialLanguage={lang}>
      <HomePage />
    </LanguageProvider>
  );
}
