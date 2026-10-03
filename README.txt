KIZZU PUBLIC SCREENING — BILINGUAL PHASE 2B

IMPORTANT ORDER

1. Import database/kizzu_bilingual_phase2b.sql in Sequel Ace first.
2. Only after the SQL completes, replace:
   api/services/recommendation-service.php
   src/types/assessment.ts
   src/pages/AssessmentPage.tsx
   src/pages/ResultPage.tsx
3. Run:
   npm run dev

WHAT THE SQL DOES

- Fills question_en for all 137 SPK questions.
- Fills English SPK subdomain labels.
- Adds recommendation English columns:
  title_en
  instructions_en
  supports_en
  safety_note_en
- Populates English content for all current recommendation activities.
- Ends with verification queries.

EXPECTED VERIFICATION

SPK:
  spk_total = 137
  question_en_missing = 0

Recommendations:
  recommendation_en_missing = 0

The final assessment query should show:
  PC  = 96 English questions
  SPK = 137 English questions

TEST

SPK:
  EN -> complete assessment -> result -> recommendations
  switch EN/BM on result page

Parental Checklist:
  EN -> complete assessment -> result -> recommendations
  switch EN/BM on result page

NOTES

- Recommendation matching logic remains unchanged.
- BM remains the source/fallback language.
- Scoring/result rules are unchanged.
- English SPK wording is a translation of the current Kizzu SPK content;
  it is not presented as a separate official instrument.
