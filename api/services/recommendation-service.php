<?php

function normalizeRecommendationText(string $text): string
{
    return mb_strtolower(trim($text), 'UTF-8');
}

function recommendationContainsAny(
    string $text,
    array $keywords
): bool {
    foreach ($keywords as $keyword) {
        if (
            mb_strpos(
                $text,
                mb_strtolower(
                    $keyword,
                    'UTF-8'
                )
            ) !== false
        ) {
            return true;
        }
    }

    return false;
}

function mapDomainToRecommendationCategory(
    string $domainCode
): ?string {
    return match ($domainCode) {

        // PC
        'SOCIAL_EMOTIONAL' =>
        'SOCIAL',

        'LANGUAGE_COMMUNICATION' =>
        'LANGUAGE',

        'COGNITIVE_THINKING' =>
        'COGNITIVE',

        'PHYSICAL_DEVELOPMENT' =>
        'PHYSICAL',

        // SPK
        'GROSS_MOTOR' =>
        'GROSS_MOTOR',

        'FINE_MOTOR' =>
        'FINE_MOTOR',

        'SPEECH_LANGUAGE' =>
        'LANGUAGE',

        'PERSONAL_SOCIAL' =>
        'SOCIAL',

        'COGNITIVE' =>
        'COGNITIVE',

        default => null,
    };
}


function mapFocusToBroadRecommendationCategory(
    ?string $focus,
    string $domainCode
): ?string {
    if (!$focus) {
        return
            mapDomainToRecommendationCategory(
                $domainCode
            );
    }

    return match ($focus) {
        'LANGUAGE_RECEPTIVE',
        'LANGUAGE_EXPRESSIVE' =>
        'LANGUAGE',

        'SOCIAL_PLAY',
        'SOCIAL_EMOTIONAL' =>
        'SOCIAL',

        /*
        |--------------------------------------------------------------------------
        | SELF_CARE deliberately has no broad fallback.
        | A generic SOCIAL/PHYSICAL activity can be misleading for a dressing,
        | feeding or toileting concern. Returning fewer, more relevant activities
        | is better.
        |--------------------------------------------------------------------------
        */
        'SELF_CARE' =>
        null,

        'GROSS_BALANCE',
        'GROSS_LOCOMOTOR',
        'GROSS_BALL' =>
        $domainCode ===
            'PHYSICAL_DEVELOPMENT'
            ? 'PHYSICAL'
            : 'GROSS_MOTOR',

        'FINE_GRASP',
        'VISUAL_MOTOR' =>
        $domainCode ===
            'PHYSICAL_DEVELOPMENT'
            ? 'PHYSICAL'
            : 'FINE_MOTOR',

        'COGNITIVE_PROBLEM_SOLVING',
        'COGNITIVE_EARLY_LEARNING' =>
        'COGNITIVE',

        default =>
        mapDomainToRecommendationCategory(
            $domainCode
        ),
    };
}

function detectRecommendationFocus(
    string $domainCode,
    string $questionText
): ?string {
    $text =
        normalizeRecommendationText(
            $questionText
        );

    /*
    |--------------------------------------------------------------------------
    | Cross-domain self-care
    |--------------------------------------------------------------------------
    |
    | Some source items sit under Personal-Social / Fine Motor / Physical
    | but the actual skill being practised is self-care.
    |--------------------------------------------------------------------------
    */

    if (
        recommendationContainsAny(
            $text,
            [
                'memakai',
                'menanggalkan',
                'pakaian',
                'baju',
                'seluar',
                'kasut',
                'tandas',
                'toilet',
                'menyuap',
                'suap',
                'makan sendiri',
                'minum menggunakan cawan',
                'memegang cawan',
                'membawa sudu',
                'membasuh',
                'mengeringkan tangan',
                'butang',
                'membutang',
                'zip',
            ]
        )
    ) {
        return 'SELF_CARE';
    }

    /*
    |--------------------------------------------------------------------------
    | Language
    |--------------------------------------------------------------------------
    */

    if (
        in_array(
            $domainCode,
            [
                'LANGUAGE_COMMUNICATION',
                'SPEECH_LANGUAGE',
            ],
            true
        )
    ) {
        if (
            recommendationContainsAny(
                $text,
                [
                    'ikut arahan',
                    'mengikut arahan',
                    'faham',
                    'memahami',
                    'menoleh apabila',
                    'menunjuk kepada objek',
                    'menunjuk kepada gambar',
                    'apabila nama dipanggil',
                    'objek yang disebut',
                    'gambar yang disebut',
                ]
            )
        ) {
            return 'LANGUAGE_RECEPTIVE';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'perkataan',
                    'ayat',
                    'bercakap',
                    'bertutur',
                    'menamakan',
                    'menyebut',
                    'bertanya',
                    'menjawab',
                    'menceritakan',
                    'mengulang ayat',
                    'bunyi sebutan',
                    'nama penuh',
                    'beritahu',
                    'memberitahu',
                ]
            )
        ) {
            return 'LANGUAGE_EXPRESSIVE';
        }

        return 'LANGUAGE';
    }

    /*
    |--------------------------------------------------------------------------
    | Social / emotional / personal-social
    |--------------------------------------------------------------------------
    */

    if (
        in_array(
            $domainCode,
            [
                'SOCIAL_EMOTIONAL',
                'PERSONAL_SOCIAL',
            ],
            true
        )
    ) {
        if (
            recommendationContainsAny(
                $text,
                [
                    'ikut arahan',
                    'mengikut arahan',
                    'mendengar arahan',
                ]
            )
        ) {
            return 'LANGUAGE_RECEPTIVE';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'kawan',
                    'berkawan',
                    'bermain bersama',
                    'bermain berdekatan',
                    'berkongsi',
                    'giliran',
                    'role play',
                    'olok-olok',
                    'cooperative',
                    'peraturan',
                    'sorok-sorok',
                    'kumpulan',
                ]
            )
        ) {
            return 'SOCIAL_PLAY';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'emosi',
                    'perasaan',
                    'gembira',
                    'sedih',
                    'marah',
                    'takut',
                    'kecewa',
                    'cemburu',
                    'bertenang',
                    'kasih sayang',
                    'memeluk',
                    'mencium',
                    'mengambil berat',
                    'menyatakan keinginan',
                ]
            )
        ) {
            return 'SOCIAL_EMOTIONAL';
        }

        return 'SOCIAL';
    }

    /*
    |--------------------------------------------------------------------------
    | Gross motor
    |--------------------------------------------------------------------------
    */

    if (
        $domainCode === 'GROSS_MOTOR'
    ) {
        if (
            recommendationContainsAny(
                $text,
                [
                    'bola',
                    'membaling',
                    'menangkap',
                    'menendang',
                ]
            )
        ) {
            return 'GROSS_BALL';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'imbang',
                    'keseimbang',
                    '1 kaki',
                    'satu kaki',
                    'atas garisan',
                    'titi',
                ]
            )
        ) {
            return 'GROSS_BALANCE';
        }

        return 'GROSS_LOCOMOTOR';
    }

    /*
    |--------------------------------------------------------------------------
    | Fine motor
    |--------------------------------------------------------------------------
    */

    if (
        $domainCode === 'FINE_MOTOR'
    ) {
        if (
            recommendationContainsAny(
                $text,
                [
                    'shape sorter',
                    'puzzle',
                    'kiub',
                    'blok',
                    'menara',
                    'menyalin',
                    'meniru bentuk',
                    'melukis',
                    'mewarna',
                    'menggunting',
                    'garisan',
                    'bulat',
                    'segi tiga',
                    'segi empat',
                    'manik',
                    'memasukkan tali',
                    'menulis nama',
                ]
            )
        ) {
            return 'VISUAL_MOTOR';
        }

        return 'FINE_GRASP';
    }

    /*
    |--------------------------------------------------------------------------
    | PC Physical Development
    |--------------------------------------------------------------------------
    |
    | PC combines gross + fine motor skills in one domain,
    | so classify from the actual item text.
    |--------------------------------------------------------------------------
    */

    if (
        $domainCode ===
        'PHYSICAL_DEVELOPMENT'
    ) {
        if (
            recommendationContainsAny(
                $text,
                [
                    'bola',
                    'membaling',
                    'menangkap',
                    'menendang',
                ]
            )
        ) {
            return 'GROSS_BALL';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'imbang',
                    'keseimbang',
                    'satu kaki',
                    '1 kaki',
                    'atas garisan',
                ]
            )
        ) {
            return 'GROSS_BALANCE';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'berjalan',
                    'berlari',
                    'melompat',
                    'memanjat',
                    'tangga',
                    'pedal',
                    'tricycle',
                    'skip',
                ]
            )
        ) {
            return 'GROSS_LOCOMOTOR';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'melukis',
                    'menyalin',
                    'menggunting',
                    'menara',
                    'blok',
                    'kiub',
                    'manik',
                    'bentuk',
                    'mewarna',
                ]
            )
        ) {
            return 'VISUAL_MOTOR';
        }

        return 'FINE_GRASP';
    }

    /*
    |--------------------------------------------------------------------------
    | Cognitive
    |--------------------------------------------------------------------------
    */

    if (
        in_array(
            $domainCode,
            [
                'COGNITIVE',
                'COGNITIVE_THINKING',
            ],
            true
        )
    ) {
        if (
            recommendationContainsAny(
                $text,
                [
                    'warna',
                    'bentuk',
                    'sama',
                    'berbeza',
                    'memadankan',
                    'padan',
                    'mengasingkan',
                    'mengira',
                    'nombor',
                    'huruf',
                    'membaca',
                    'masa',
                    'semalam',
                    'esok',
                ]
            )
        ) {
            return
                'COGNITIVE_EARLY_LEARNING';
        }

        if (
            recommendationContainsAny(
                $text,
                [
                    'masalah',
                    'tersembunyi',
                    'fungsi objek',
                    'fungsi',
                    'mencari',
                    'olok-olok',
                    'pretend',
                ]
            )
        ) {
            return
                'COGNITIVE_PROBLEM_SOLVING';
        }

        return 'COGNITIVE';
    }

    return null;
}

function fetchRecommendationByCategory(
    PDO $pdo,
    int $ageMonths,
    string $category,
    array $excludedIds = []
): ?array {
    $stmt = $pdo->prepare("
        SELECT
            id,
            category,
            title_ms,
            instructions_ms,
            supports_ms,
            safety_note_ms

        FROM recommendation_activities

        WHERE is_active = 1
          AND category = ?
          AND ? BETWEEN min_month AND max_month

        ORDER BY
            priority ASC,
            id ASC
    ");

    $stmt->execute([
        $category,
        $ageMonths,
    ]);

    $rows = $stmt->fetchAll();

    foreach ($rows as $row) {
        $id = (int) $row['id'];

        if (
            in_array(
                $id,
                $excludedIds,
                true
            )
        ) {
            continue;
        }

        return [
            'id' =>
            $id,

            'category' =>
            $row['category'],

            'title' =>
            $row['title_ms'],

            'instructions' =>
            $row['instructions_ms'],

            'supports' =>
            $row['supports_ms'],

            'safety_note' =>
            $row['safety_note_ms'],
        ];
    }

    return null;
}

function appendRecommendationFromCategory(
    PDO $pdo,
    int $ageMonths,
    string $category,
    array &$recommendations,
    array &$usedIds
): bool {
    $activity =
        fetchRecommendationByCategory(
            $pdo,
            $ageMonths,
            $category,
            $usedIds
        );

    if (!$activity) {
        return false;
    }

    $recommendations[] =
        $activity;

    $usedIds[] =
        $activity['id'];

    return true;
}

function getRecommendationActivities(
    PDO $pdo,
    int $ageMonths,
    array $itemsToWatch,
    int $limit = 3
): array {
    $recommendations = [];
    $usedIds = [];

    /*
    |--------------------------------------------------------------------------
    | No concern: general enrichment only
    |--------------------------------------------------------------------------
    */

    if (count($itemsToWatch) === 0) {
        while (
            count($recommendations)
            < $limit
        ) {
            $added =
                appendRecommendationFromCategory(
                    $pdo,
                    $ageMonths,
                    'GENERAL',
                    $recommendations,
                    $usedIds
                );

            if (!$added) {
                break;
            }
        }

        return $recommendations;
    }

    /*
    |--------------------------------------------------------------------------
    | Build focus + broad-category weights from actual missed items
    |--------------------------------------------------------------------------
    */

    $focusCounts = [];
    $broadCounts = [];

    foreach (
        $itemsToWatch
        as $item
    ) {
        $domainCode =
            $item['domain_code']
            ?? '';

        $questionText =
            $item['question_ms']
            ?? '';

        $focus =
            detectRecommendationFocus(
                $domainCode,
                $questionText
            );

        if ($focus) {
            $focusCounts[$focus] =
                (
                    $focusCounts[$focus]
                    ?? 0
                ) + 1;
        }

        $broadCategory =
            mapFocusToBroadRecommendationCategory(
                $focus,
                $domainCode
            );

        if ($broadCategory) {
            $broadCounts[$broadCategory] =
                (
                    $broadCounts[$broadCategory]
                    ?? 0
                ) + 1;
        }
    }

    arsort($focusCounts);
    arsort($broadCounts);

    /*
    |--------------------------------------------------------------------------
    | 1) Exact focus activities first
    |--------------------------------------------------------------------------
    |
    | If only one focus is affected, allow up to two exact-focus activities.
    | If several focuses are affected, give each focus one slot first.
    |--------------------------------------------------------------------------
    */

    $singleFocus =
        count($focusCounts) === 1;

    foreach (
        array_keys($focusCounts)
        as $focus
    ) {
        if (
            count($recommendations)
            >= $limit
        ) {
            break;
        }

        $maxForFocus =
            $singleFocus
            ? 2
            : 1;

        for (
            $i = 0;
            $i < $maxForFocus;
            $i++
        ) {
            if (
                count($recommendations)
                >= $limit
            ) {
                break;
            }

            $added =
                appendRecommendationFromCategory(
                    $pdo,
                    $ageMonths,
                    $focus,
                    $recommendations,
                    $usedIds
                );

            if (!$added) {
                break;
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 2) Broad affected domain fallback
    |--------------------------------------------------------------------------
    |
    | Still relevant to the concern.
    | GENERAL is deliberately NOT used here.
    |--------------------------------------------------------------------------
    */

    foreach (
        array_keys($broadCounts)
        as $category
    ) {
        while (
            count($recommendations)
            < $limit
        ) {
            $added =
                appendRecommendationFromCategory(
                    $pdo,
                    $ageMonths,
                    $category,
                    $recommendations,
                    $usedIds
                );

            if (!$added) {
                break;
            }

            /*
            |--------------------------------------------------------------------------
            | Avoid one broad category swallowing all slots when multiple domains
            | are affected. One broad fallback per affected domain is enough here.
            |--------------------------------------------------------------------------
            */

            if (
                count($broadCounts) > 1
            ) {
                break;
            }
        }

        if (
            count($recommendations)
            >= $limit
        ) {
            break;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | 3) Second pass across exact focuses
    |--------------------------------------------------------------------------
    |
    | Useful if broad rows are unavailable for a particular age band.
    |--------------------------------------------------------------------------
    */

    if (
        count($recommendations)
        < $limit
    ) {
        foreach (
            array_keys($focusCounts)
            as $focus
        ) {
            while (
                count($recommendations)
                < $limit
            ) {
                $added =
                    appendRecommendationFromCategory(
                        $pdo,
                        $ageMonths,
                        $focus,
                        $recommendations,
                        $usedIds
                    );

                if (!$added) {
                    break;
                }
            }

            if (
                count($recommendations)
                >= $limit
            ) {
                break;
            }
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Important:
    | If a child has items to watch, we prefer returning 1–2 relevant activities
    | rather than filling the page with unrelated GENERAL content.
    |--------------------------------------------------------------------------
    */

    return $recommendations;
}
