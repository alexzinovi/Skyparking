import { useNavigate } from "react-router";
import { useLanguage } from "./LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "bg", label: "БГ", native: "Български", path: "/" },
  { code: "en", label: "EN", native: "English", path: "/en" },
  { code: "el", label: "ΕΛ", native: "Ελληνικά", path: "/el" },
  { code: "tr", label: "TR", native: "Türkçe", path: "/tr" },
  { code: "sr", label: "SR", native: "Srpski", path: "/sr" },
  { code: "mk", label: "МК", native: "Македонски", path: "/mk" },
  { code: "ro", label: "RO", native: "Română", path: "/ro" },
  { code: "uk", label: "УК", native: "Українська", path: "/uk" },
] as const;

export function LanguageSwitcher() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 text-blue-900 hover:bg-white border-blue-200 font-semibold gap-1"
          >
            {current.label}
            <ChevronDown className="w-3 h-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[130px]">
          {LANGUAGES.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => navigate(lang.path)}
              className={`cursor-pointer flex justify-between gap-3 ${
                lang.code === language ? "font-semibold text-blue-900 bg-blue-50" : ""
              }`}
            >
              <span>{lang.label}</span>
              <span className="text-muted-foreground text-xs">{lang.native}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
