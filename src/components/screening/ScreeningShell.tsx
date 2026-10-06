import type { ReactNode } from "react"

import kizzuLogo from "@/assets/kizzu-logo.png"
import { useLanguage } from "@/context/LanguageContext"

type ScreeningShellProps = {
    children: ReactNode
}

export default function ScreeningShell({
    children,
}: ScreeningShellProps) {
    const {
        language,
        setLanguage,
        tr,
    } = useLanguage()

    return (
        <div className="kz-page">
            <a className="skip" href="#main-content">
                {tr("Langkau ke kandungan", "Skip to content")}
            </a>

            <header className="site-header">
                <div className="brand">
                    <img
                        src={kizzuLogo}
                        alt="Kizzu Kids"
                    />
                </div>

                <div
                    className="language"
                    aria-label={tr(
                        "Pilihan bahasa",
                        "Language selector",
                    )}
                >
                    <button
                        type="button"
                        data-lang="ms"
                        aria-pressed={language === "ms"}
                        onClick={() =>
                            setLanguage("ms")
                        }
                    >
                        BM
                    </button>

                    <button
                        type="button"
                        data-lang="en"
                        aria-pressed={language === "en"}
                        onClick={() =>
                            setLanguage("en")
                        }
                    >
                        EN
                    </button>
                </div>
            </header>

            <main id="main-content">
                {children}
            </main>

            <footer className="site-footer">
                <span>
                    © {new Date().getFullYear()} Kizzu Kids
                </span>

                <a
                    href="/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {tr(
                        "Dasar Privasi",
                        "Privacy Policy",
                    )}{" "}
                    <span aria-hidden="true">↗</span>
                </a>
            </footer>
        </div>
    )
}