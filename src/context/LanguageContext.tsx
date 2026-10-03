import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"

import type {
    ReactNode,
} from "react"

export type Language = "ms" | "en"

type LanguageContextValue = {
    language: Language
    setLanguage: (language: Language) => void
    tr: (ms: string, en: string) => string
}

const STORAGE_KEY =
    "kizzu-screening-language"

const LanguageContext =
    createContext<LanguageContextValue | null>(
        null,
    )

function getInitialLanguage(): Language {
    if (typeof window === "undefined") {
        return "ms"
    }

    const saved =
        window.localStorage.getItem(
            STORAGE_KEY,
        )

    return saved === "en"
        ? "en"
        : "ms"
}

export function LanguageProvider({
    children,
}: {
    children: ReactNode
}) {
    const [language, setLanguage] =
        useState<Language>(
            getInitialLanguage,
        )

    useEffect(() => {
        window.localStorage.setItem(
            STORAGE_KEY,
            language,
        )

        document.documentElement.lang =
            language === "en"
                ? "en"
                : "ms"
    }, [language])

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            tr: (
                ms: string,
                en: string,
            ) =>
                language === "en"
                    ? en
                    : ms,
        }),
        [language],
    )

    return (
        <LanguageContext.Provider
            value={value}
        >
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context =
        useContext(LanguageContext)

    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider.",
        )
    }

    return context
}
