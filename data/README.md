# Supplementary Evidence Ledgers (`Tables S1–S4`)

These four structured CSV files correspond to **Supplementary Tables S1–S4** of:

> **Bai, J., Cai, Z., Yang, R., Lekadir, K., & Li, S. (2026).** *A review of Kolmogorov–Arnold networks for medical image analysis.* *Computerized Medical Imaging and Graphics*, 136, 102827. [https://doi.org/10.1016/j.compmedimag.2026.102827](https://doi.org/10.1016/j.compmedimag.2026.102827)

## File Summary

| File | Rows | Role in Evidence Reconstruction |
| :--- | :---: | :--- |
| [`S1_study_level_evidence_matrix.csv`](S1_study_level_evidence_matrix.csv) | `138` | Complete study-level evidence matrix for all 138 eligible independent medical-imaging KAN studies (`127` Tier A + `11` Tier B). |
| [`S2_report_level_screening_ledger.csv`](S2_report_level_screening_ledger.csv) | `162` | Report-level tracking for all 162 reports sought for retrieval (`143` eligible reports consolidated into `138` studies, `17` excluded after audit, `2` not retrieved). |
| [`S3_exact_search_strategies.csv`](S3_exact_search_strategies.csv) | `7` | Exact bibliographic queries, date filters (`2024-01-01` to `2026-02-28`), source counts (`5,108` total), and API URLs across Crossref, Europe PMC, arXiv, and OpenAlex. |
| [`S4_title_abstract_screening_ledger.csv`](S4_title_abstract_screening_ledger.csv) | `3,029` | Complete title/abstract screening decisions for all 3,029 de-duplicated database records, linked to report-level IDs in `S2`. |

## Key Columns in `S1_study_level_evidence_matrix.csv`

- `study_id` / `canonical_report_id` / `companion_report_ids`: Independent study identifier and version-consolidated companion audit trail.
- `publication_year` / `formal_identifier` / `publication_status`: Year of first eligible public report (`2024`–`2026`) and verified DOI or `arXiv` identifier.
- `input_scope_tier`: `Tier A` (direct medical image, volume, signal, or spatial field) vs. `Tier B` (explicitly image-derived quantitative, connectivity, or graph representation).
- `primary_task` & `imaging_modality`: Primary clinical imaging task label and evaluated imaging modalities.
- `primary_structural_integration` & `taxonomy_assignment_basis`: Assigned modular paradigm (`backbone_level`, `bottleneck_or_token_level`, `physics_informed_or_INR`, `task_specific_head`) and rationale.
- `kan_method_or_role`, `datasets_and_sample`, `baseline_or_comparison_evidence`, `primary_reported_results`: Extracted architectural, experimental, and quantitative details.
- `whole_model_result_direction` & `direction_coding_basis`: Source-reported full-model direction (`favorable_full_model`, `mixed_or_tradeoff`, `unfavorable_or_no_gain`, `indeterminate_or_not_comparable`).
- `kan_specific_contribution_evidence_category` & `contribution_evidence_classification_basis`: Evidence isolating the incremental KAN contribution (`A_strong`, `B_moderate`, `C_weak_compound`, `D_insufficient`).
- `review_level_risk_or_limitations`: Study-specific confounding, splitting, sample-size, or validation caveats.
