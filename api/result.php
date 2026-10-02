<?php

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/services/recommendation-service.php';

header(
    'Content-Type: application/json; charset=utf-8'
);

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' =>
        'Method not allowed',
    ]);

    exit;
}

$referenceCode = strtolower(
    trim(
        $_GET['ref']
            ?? ''
    )
);

if (
    !$referenceCode ||
    !preg_match(
        '/^[a-f0-9]{32}$/',
        $referenceCode
    )
) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' =>
        'No. rujukan tidak sah.',
    ]);

    exit;
}

try {

    /*
    |--------------------------------------------------------------------------
    | Submission
    |--------------------------------------------------------------------------
    */

    $stmt = $pdo->prepare("
        SELECT
            s.id,
            s.reference_code,

            s.age_months,

            s.child_name,
            s.child_dob,

            s.result_status,
            s.result_engine_version,
            s.result_data,
            s.evaluated_at,
            s.created_at,

            a.code AS assessment_code,
            a.name AS assessment_name,

            ag.label AS age_group

        FROM submissions s

        JOIN assessment_types a
            ON a.id =
               s.assessment_type_id

        JOIN age_groups ag
            ON ag.id =
               s.age_group_id

        WHERE s.reference_code = ?

        LIMIT 1
    ");

    $stmt->execute([
        $referenceCode
    ]);

    $submission =
        $stmt->fetch();

    if (!$submission) {
        http_response_code(404);

        echo json_encode([
            'success' => false,

            'message' =>
            'Keputusan tidak ditemui.',
        ]);

        exit;
    }

    /*
    |--------------------------------------------------------------------------
    | Stored Result
    |--------------------------------------------------------------------------
    */

    $resultData =
        json_decode(
            $submission['result_data'],
            true
        );

    if (!is_array($resultData)) {
        throw new RuntimeException(
            'Stored result data is invalid.'
        );
    }

    $assessmentCode =
        $submission['assessment_code'];

    $resultStatus =
        $submission['result_status'];

    $ageMonths =
        (int)
        $submission['age_months'];

    /*
    |--------------------------------------------------------------------------
    | Labels
    |--------------------------------------------------------------------------
    */

    $positiveLabel =
        $assessmentCode === 'SPK'
        ? 'Tercapai'
        : 'Boleh';

    $negativeLabel =
        $assessmentCode === 'SPK'
        ? 'Tidak Tercapai'
        : 'Belum';

    /*
    |--------------------------------------------------------------------------
    | Result Copy
    |--------------------------------------------------------------------------
    */

    $title = '';
    $message = '';
    $nextAction = '';

    if ($assessmentCode === 'PC') {

        $title =
            'Ringkasan Perkembangan';

        $message =
            'Ringkasan ini menunjukkan kemahiran yang telah dan belum diperhatikan berdasarkan jawapan yang diberikan.';

        if (
            (
                $resultData['total_not_yet'] ?? 0
            ) === 0
        ) {
            $nextAction =
                'Teruskan aktiviti perkembangan yang sesuai dengan umur anak dan teruskan pemerhatian dari semasa ke semasa.';
        } else {
            $nextAction =
                'Teruskan memberi peluang dan aktiviti yang sesuai untuk kemahiran yang masih belum diperhatikan. Jika anda mempunyai kebimbangan berterusan, berbincanglah dengan profesional perkembangan kanak-kanak.';
        }
    } elseif (
        $assessmentCode === 'SPK'
    ) {

        if (
            $resultStatus ===
            'ON_TRACK'
        ) {
            $title =
                'Semua Item Saringan Tercapai';

            $message =
                'Berdasarkan jawapan yang diberikan, semua item dalam senarai saringan bagi kumpulan umur ini telah tercapai.';

            $nextAction =
                'Teruskan aktiviti dan rangsangan perkembangan yang sesuai dengan umur anak.';
        } elseif (
            $resultStatus ===
            'MONITOR_REASSESS'
        ) {

            $months =
                (int) (
                    $resultData['reassessment_months']
                    ?? 0
                );

            $title =
                'Pantau dan Nilai Semula';

            $message =
                'Terdapat satu kemahiran dalam saringan ini yang masih belum tercapai berdasarkan jawapan yang diberikan.';

            if ($months > 0) {
                $nextAction =
                    "Berikan peluang dan rangsangan perkembangan yang sesuai, kemudian lakukan penilaian semula selepas {$months} bulan.";
            } else {
                $nextAction =
                    'Teruskan pemerhatian dan lakukan penilaian semula selepas tempoh yang sesuai.';
            }
        } elseif (
            $resultStatus ===
            'REFER_FOR_FURTHER_ASSESSMENT'
        ) {
            $title =
                'Disarankan Penilaian Lanjut';

            $message =
                'Berdasarkan corak jawapan dalam saringan ini, terdapat kemahiran perkembangan yang memerlukan perhatian lanjut.';

            $nextAction =
                'Pertimbangkan untuk berbincang dengan profesional perkembangan kanak-kanak bagi mendapatkan penilaian dan panduan yang lebih menyeluruh.';
        } else {
            $title =
                'Keputusan Saringan';

            $message =
                'Keputusan saringan telah direkodkan.';

            $nextAction =
                'Teruskan pemerhatian terhadap perkembangan anak.';
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Domains
    |--------------------------------------------------------------------------
    */

    $domains =
        $resultData['domains'] ?? [];

    /*
    |--------------------------------------------------------------------------
    | Items To Watch
    |--------------------------------------------------------------------------
    |
    | is_starred is deliberately NOT exposed.
    |--------------------------------------------------------------------------
    */

    if ($assessmentCode === 'PC') {
        $rawItems =
            $resultData['not_yet_items'] ?? [];
    } else {
        $rawItems =
            $resultData['not_achieved_items'] ?? [];
    }

    $itemsToWatch = [];

    foreach (
        $rawItems
        as $item
    ) {
        $itemsToWatch[] = [
            'question_id' =>
            (int)
            $item['question_id'],

            'domain_code' =>
            $item['domain_code'],

            'domain_name_ms' =>
            $item['domain_name_ms'],

            'question_ms' =>
            $item['question_ms'],

            'question_en' =>
            $item['question_en'] ?? null,
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Totals
    |--------------------------------------------------------------------------
    */

    if ($assessmentCode === 'PC') {
        $totalPositive =
            (int) (
                $resultData['total_observed'] ?? 0
            );

        $totalNegative =
            (int) (
                $resultData['total_not_yet'] ?? 0
            );
    } else {
        $totalPositive =
            (int) (
                $resultData['total_achieved'] ?? 0
            );

        $totalNegative =
            (int) (
                $resultData['total_not_achieved'] ?? 0
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Recommendations
    |--------------------------------------------------------------------------
    */

    $recommendations =
        getRecommendationActivities(
            $pdo,
            $ageMonths,
            $itemsToWatch,
            3
        );

    /*
    |--------------------------------------------------------------------------
    | Kizzu CTA
    |--------------------------------------------------------------------------
    */

    $ctaTitle = '';
    $ctaDescription = '';

    if ($assessmentCode === 'PC') {

        if ($totalNegative === 0) {
            $ctaTitle =
                'Nak terus sokong perkembangan anak?';

            $ctaDescription =
                'Team Kizzu boleh bantu anda meneroka aktiviti dan program yang sesuai untuk terus menyokong perkembangan anak.';
        } else {
            $ctaTitle =
                'Ada kemahiran yang anda ingin fahami dengan lebih lanjut?';

            $ctaDescription =
                'Boleh berbincang dengan team Kizzu untuk mendapatkan panduan mengenai perkembangan dan aktiviti yang sesuai untuk anak.';
        }
    } elseif (
        $resultStatus === 'ON_TRACK'
    ) {
        $ctaTitle =
            'Teruskan perkembangan positif ini';

        $ctaDescription =
            'Jika anda mahu lebih banyak idea aktiviti atau ingin mengetahui program Kizzu yang sesuai, team Kizzu sedia membantu.';
    } elseif (
        $resultStatus ===
        'MONITOR_REASSESS'
    ) {
        $ctaTitle =
            'Perlukan panduan sepanjang tempoh pemantauan?';

        $ctaDescription =
            'Bincang dengan team Kizzu tentang aktiviti yang sesuai untuk menyokong kemahiran anak sebelum penilaian semula.';
    } else {
        $ctaTitle =
            'Nak bincang langkah seterusnya?';

        $ctaDescription =
            'Team Kizzu boleh membantu anda memahami pilihan untuk penilaian dan sokongan perkembangan yang lebih menyeluruh.';
    }

    $whatsappMessage =
        "Hi Kizzu, saya baru selesai "
        .
        $submission['assessment_name']
        .
        " di laman Kizzu.\n\n"
        .
        "No. Rujukan: "
        .
        $referenceCode
        .
        "\n"
        .
        "Keputusan: "
        .
        $title
        .
        "\n\n"
        .
        "Saya ingin mendapatkan panduan lanjut.";

    /*
    |--------------------------------------------------------------------------
    | Response
    |--------------------------------------------------------------------------
    */

    echo json_encode(
        [
            'success' => true,

            'data' => [
                'reference_code' =>
                $submission['reference_code'],

                'assessment' => [
                    'code' =>
                    $assessmentCode,

                    'name' =>
                    $submission['assessment_name'],
                ],

                'child' => [
                    'name' =>
                    $submission['child_name'],

                    'dob' =>
                    $submission['child_dob'],
                ],

                'age' => [
                    'months' =>
                    $ageMonths,

                    'group' =>
                    $submission['age_group'],
                ],

                'result' => [
                    'status' =>
                    $resultStatus,

                    'title' =>
                    $title,

                    'message' =>
                    $message,

                    'next_action' =>
                    $nextAction,

                    'positive_label' =>
                    $positiveLabel,

                    'negative_label' =>
                    $negativeLabel,

                    'total_positive' =>
                    $totalPositive,

                    'total_negative' =>
                    $totalNegative,

                    'domains' =>
                    $domains,

                    'items_to_watch' =>
                    $itemsToWatch,
                ],

                'recommendations' =>
                $recommendations,

                'cta' => [
                    'title' =>
                    $ctaTitle,

                    'description' =>
                    $ctaDescription,

                    'button_label' =>
                    'WhatsApp Admin Kizzu',

                    'whatsapp_message' =>
                    $whatsappMessage,
                ],

                'disclaimer' =>
                $assessmentCode === 'PC'
                    ? 'Checklist ini ialah ringkasan pemerhatian perkembangan dan bukan alat diagnosis atau pengganti penilaian profesional.'
                    : 'Hasil ini ialah panduan awal berdasarkan jawapan yang diberikan dan bukan diagnosis.',

                'evaluated_at' =>
                $submission['evaluated_at'],

                'created_at' =>
                $submission['created_at'],
            ],
        ],
        JSON_UNESCAPED_UNICODE
            |
            JSON_UNESCAPED_SLASHES
    );
} catch (Throwable $e) {

    error_log(
        'Result retrieval error: '
            .
            $e->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,

        'message' =>
        'Keputusan tidak dapat dimuatkan.',
    ]);
}
