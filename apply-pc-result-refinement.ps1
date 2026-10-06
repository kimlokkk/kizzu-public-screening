param(
    [string]$RepoRoot = "."
)

$ErrorActionPreference = "Stop"

$resultPath = Join-Path $RepoRoot "src/pages/ResultPage.tsx"
$cssPath = Join-Path $RepoRoot "src/index.css"

if (!(Test-Path $resultPath)) { throw "Tak jumpa $resultPath" }
if (!(Test-Path $cssPath)) { throw "Tak jumpa $cssPath" }

$result = Get-Content $resultPath -Raw

function Replace-Exact {
    param([string]$Text,[string]$Old,[string]$New,[string]$Label)
    if ($Text.Contains($New)) {
        Write-Host "SKIP: $Label (dah apply)"
        return $Text
    }
    if (!$Text.Contains($Old)) { throw "Tak jumpa block untuk: $Label" }
    Write-Host "APPLY: $Label"
    return $Text.Replace($Old, $New)
}

$result = Replace-Exact $result '<div className="result-wrap">' '<div className="result-wrap" data-assessment={data.assessment.code}>' 'PC result scope'

$oldDateBlock = @'
    const dateLabel =
        createdDate
            ? new Intl.DateTimeFormat(
                language === "ms"
                    ? "ms-MY"
                    : "en-MY",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                },
            ).format(
                new Date(
                    `${createdDate}T12:00:00`,
                ),
            )
            : ""
'@

$newDateBlock = @'
    const dateLabel =
        createdDate
            ? new Intl.DateTimeFormat(
                language === "ms"
                    ? "ms-MY"
                    : "en-MY",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                },
            ).format(
                new Date(
                    `${createdDate}T12:00:00`,
                ),
            )
            : ""

    const pcAgeLabel = (() => {
        const years = Math.floor(
            data.age.months / 12,
        )
        const months =
            data.age.months % 12

        if (language === "ms") {
            return months > 0
                ? `${years} tahun ${months} bulan`
                : `${years} tahun`
        }

        const yearText =
            `${years} ${years === 1 ? "year" : "years"}`

        if (months === 0) {
            return yearText
        }

        return `${yearText} ${months} ${
            months === 1 ? "month" : "months"
        }`
    })()
'@
$result = Replace-Exact $result $oldDateBlock $newDateBlock 'PC exact age label'

$oldHeader = @'
                        {tr(
                            "Ringkasan",
                            "Summary",
                        )}
'@
$newHeader = @'
                        {isPc
                            ? tr(
                                "Ringkasan saringan",
                                "Screening summary",
                            )
                            : tr(
                                "Ringkasan",
                                "Summary",
                            )}
'@
$result = Replace-Exact $result $oldHeader $newHeader 'PC result heading'

$result = Replace-Exact $result '                        {data.age.group}' '                        {isPc ? pcAgeLabel : data.age.group}' 'PC age display'

$oldWatchIcon = @'
                                            <span className="watch-item-icon">
                                                <DomainIcon
                                                    code={
                                                        item.domain_code
                                                    }
                                                />
                                            </span>

                                            <div className="watch-item-copy">
'@
$newWatchIcon = @'
                                            {!isPc && (
                                                <span className="watch-item-icon">
                                                    <DomainIcon
                                                        code={
                                                            item.domain_code
                                                        }
                                                    />
                                                </span>
                                            )}

                                            <div className="watch-item-copy">
'@
$result = Replace-Exact $result $oldWatchIcon $newWatchIcon 'PC watch-item icon'

$oldCta = @'
                        <p>
                            {guidance.level ===
                            "refer"
                                ? tr(
                                    "Kongsikan ringkasan ini dengan pasukan Kizzu untuk memahami pilihan penilaian dan sokongan yang sesuai.",
                                    "Share this summary with the Kizzu team to understand suitable assessment and support options.",
                                )
                                : tr(
                                    "Kongsikan ringkasan ini jika anda mahu panduan aktiviti atau perkembangan anak.",
                                    "Share this summary if you would like guidance on activities or your child's development.",
                                )}
                        </p>
'@
$newCta = @'
                        <p>
                            {isPc
                                ? tr(
                                    "Kongsikan ringkasan ini dengan pasukan Kizzu.",
                                    "Share this summary with the Kizzu team.",
                                )
                                : guidance.level ===
                                  "refer"
                                    ? tr(
                                        "Kongsikan ringkasan ini dengan pasukan Kizzu untuk memahami pilihan penilaian dan sokongan yang sesuai.",
                                        "Share this summary with the Kizzu team to understand suitable assessment and support options.",
                                    )
                                    : tr(
                                        "Kongsikan ringkasan ini jika anda mahu panduan aktiviti atau perkembangan anak.",
                                        "Share this summary if you would like guidance on activities or your child's development.",
                                    )}
                        </p>
'@
$result = Replace-Exact $result $oldCta $newCta 'PC CTA wording'

$oldDisclaimer = @'
                            "Checklist ini berdasarkan pemerhatian ibu bapa dan bukan alat diagnosis atau pengganti saringan perkembangan yang tervalidasi. Jika anak kehilangan kemahiran yang pernah dikuasai, atau anda bimbang tentang perkembangannya, dapatkan nasihat profesional tanpa menunggu checklist seterusnya.",
                            "This checklist is based on parent observations and is not a diagnostic tool or a substitute for validated developmental screening. If your child loses a skill they previously had, or you are concerned about their development, seek professional advice without waiting for the next checklist.",
'@
$newDisclaimer = @'
                            "Saringan ini berdasarkan pemerhatian ibu bapa dan bukan diagnosis. Jika bimbang tentang perkembangan anak, dapatkan penilaian profesional walaupun semua jawapan “Boleh”.",
                            "This screening is based on parent observations and is not a diagnosis. If you are concerned about your child's development, seek professional assessment even if all answers are “Able”.",
'@
$result = Replace-Exact $result $oldDisclaimer $newDisclaimer 'PC disclaimer'

$oldNew = @'
                        ? tr(
                            "Checklist baharu",
                            "New checklist",
                        )
'@
$newNew = @'
                        ? tr(
                            "Saringan baharu",
                            "New screening",
                        )
'@
$result = Replace-Exact $result $oldNew $newNew 'PC new screening label'

Set-Content -Path $resultPath -Value $result -Encoding UTF8

$css = Get-Content $cssPath -Raw
$marker = "/* PC RESULT BOSS ALIGNMENT — 2026-10-06 */"
if (!$css.Contains($marker)) {
    $append = @'

/* PC RESULT BOSS ALIGNMENT — 2026-10-06
   Keep guidance card, current domain note wording and chevron controls.
   Only align PC colours/icons/copy structure with boss reference.
   -------------------------------------------------------------------------- */

.result-wrap[data-assessment="PC"] .domain-result[data-domain="SOCIAL_EMOTIONAL"] {
  border-color: #f1d9e0;
  border-top-color: #f33e68;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="SOCIAL_EMOTIONAL"] .track span {
  background: #f33e68;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="LANGUAGE_COMMUNICATION"] {
  border-color: #d8e7fa;
  border-top-color: #1675eb;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="LANGUAGE_COMMUNICATION"] .track span {
  background: #1675eb;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="COGNITIVE_THINKING"] {
  border-color: #d7ebdf;
  border-top-color: #18a367;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="COGNITIVE_THINKING"] .track span {
  background: #18a367;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="PHYSICAL_DEVELOPMENT"] {
  border-color: #f0e2af;
  border-top-color: #efa900;
}
.result-wrap[data-assessment="PC"] .domain-result[data-domain="PHYSICAL_DEVELOPMENT"] .track span {
  background: #efa900;
}

.result-wrap[data-assessment="PC"] .activity-card:nth-child(3n + 1) {
  border-left-color: #1675eb;
}
.result-wrap[data-assessment="PC"] .activity-card:nth-child(3n + 2) {
  border-left-color: #18a367;
}
.result-wrap[data-assessment="PC"] .activity-card:nth-child(3n) {
  border-left-color: #f33e68;
}

.result-wrap[data-assessment="PC"] .watch-list li {
  grid-template-columns: minmax(0, 1fr);
}
'@
    Add-Content -Path $cssPath -Value $append -Encoding UTF8
    Write-Host "APPLY: PC CSS colour/icon alignment"
} else {
    Write-Host "SKIP: PC CSS colour/icon alignment (dah apply)"
}

Write-Host ""
Write-Host "Done. Sekarang run: npm run build"
