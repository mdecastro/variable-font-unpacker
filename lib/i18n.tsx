"use client";

import { createContext, useContext, useEffect, useSyncExternalStore } from "react";

const es = {
  heroKicker: "TTF · OTF · fvar",
  heroSubtitle:
    "Subí una fuente variable, movés sus ejes en vivo y descargás la instancia estática exacta que necesitás.",
  inspecting: "Inspeccionando fuente…",
  inspectFailed: "No se pudo inspeccionar la fuente.",
  unexpectedError: "Error inesperado.",
  dropzoneCta:
    "Arrastrá una fuente variable acá, o hacé click para elegir un archivo",
  dropzoneFormats: "Formatos soportados: .ttf, .otf",
  dropzoneWrongType: "Subí un archivo .ttf o .otf.",
  previewLoaded: "Fuente cargada",
  previewLoading: "Cargando fuente…",
  previewPlaceholder: "Texto de previsualización",
  namedInstances: "Instancias con nombre",
  axes: "Ejes de variación",
  download: "Descargar instancia estática",
  downloading: "Extrayendo…",
  extractFailed: "No se pudo extraer la instancia.",
};

const en: Record<keyof typeof es, string> = {
  heroKicker: "TTF · OTF · fvar",
  heroSubtitle:
    "Upload a variable font, move its axes live and download the exact static instance you need.",
  inspecting: "Inspecting font…",
  inspectFailed: "Could not inspect the font.",
  unexpectedError: "Unexpected error.",
  dropzoneCta: "Drop a variable font here, or click to pick a file",
  dropzoneFormats: "Supported formats: .ttf, .otf",
  dropzoneWrongType: "Upload a .ttf or .otf file.",
  previewLoaded: "Font loaded",
  previewLoading: "Loading font…",
  previewPlaceholder: "Preview text",
  namedInstances: "Named instances",
  axes: "Variation axes",
  download: "Download static instance",
  downloading: "Extracting…",
  extractFailed: "Could not extract the instance.",
};

const dictionaries = { es, en };

export type Language = keyof typeof dictionaries;

const STORAGE_KEY = "vfu-language";
const DEFAULT_LANGUAGE: Language = "es";

function readStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "es" || stored === "en" ? stored : null;
  } catch {
    return null;
  }
}

function detectBrowserLanguage(): Language {
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

// The language lives outside React so it can be resolved from browser-only APIs
// without a hydration mismatch: the server snapshot is the default, and the
// client swaps to the resolved value on its first commit.
let currentLanguage: Language | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Language {
  currentLanguage ??= readStoredLanguage() ?? detectBrowserLanguage();
  return currentLanguage;
}

function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

function setLanguage(next: Language) {
  currentLanguage = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Private mode or blocked storage: the choice just won't persist.
  }
  listeners.forEach((listener) => listener());
}

type I18nValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof es;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <I18nContext.Provider
      value={{ lang, setLang: setLanguage, t: dictionaries[lang] }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside a LanguageProvider");
  }
  return value;
}
