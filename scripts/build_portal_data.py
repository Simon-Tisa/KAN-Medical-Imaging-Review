#!/usr/bin/env python3
"""
Build structured JSON/JS portal datasets and the 138-study Markdown catalog
from Supplementary Tables S1-S4 of Bai et al., CMIG 136 (2026) 102827.

Zero external dependencies (Python 3 standard library only).
"""

import collections
import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
PORTAL_DATA_DIR = ROOT / "docs" / "assets" / "data"
CATALOG_PATH = ROOT / "docs" / "CATALOG_138_STUDIES.md"


MODALITY_RULES = [
    ("MRI / fMRI / CEST", r"\bmri\b|\bfmri\b|\bcest\b|\bbraTS\b|\bt1\b|\bt2\b|\bdce-mri\b"),
    ("CT / CBCT / PET", r"\bct\b|\bcbct\b|\bpet\b"),
    ("Ultrasound", r"ultrasound|\bbusi\b|echocardiograph"),
    ("Pathology / Microscopy", r"histopatholog|pathology|microscop|whole-slide|\bh&e\b|cytolog|cell|chromosome"),
    ("Endoscopy", r"endoscop|colonoscop|gastrointestinal|polyp|kvasir"),
    ("Dermoscopy / Skin", r"dermoscop|skin|melanoma|lesion photography"),
    ("X-Ray / Radiography", r"x-ray|radiograph|mammograph|chest radiograph"),
    ("OCT / Ophthalmic", r"\boct\b|retinal|fundus|ophthalm|anterior visual"),
]

TASK_LABELS = {
    "segmentation": "Segmentation",
    "classification_or_detection": "Classification / Detection",
    "reconstruction_or_enhancement": "Reconstruction / Enhancement",
    "quantitative_or_other_image_analysis": "Quantitative / Other Analysis",
    "registration": "Registration",
    "image_fusion": "Image Fusion",
    "image_derived_outcome_prediction": "Image-Derived Outcome Prediction",
}

INTEGRATION_LABELS = {
    "backbone_level": "(A) Backbone-Level Fusion",
    "bottleneck_or_token_level": "(B) Bottleneck / Token-Level Fusion",
    "physics_informed_or_INR": "(C) Physics-Informed / INR Modules",
    "task_specific_head": "(D) Task-Specific Functional Heads",
}

EVIDENCE_LABELS = {
    "A_strong": "Cat. A — Strong (Factorial)",
    "B_moderate": "Cat. B — Moderate (Matched/Ablated)",
    "C_weak_compound": "Cat. C — Weak / Compound",
    "D_insufficient": "Cat. D — Insufficient",
}

DIRECTION_LABELS = {
    "favorable_full_model": "Favorable",
    "mixed_or_tradeoff": "Mixed / Trade-off",
    "unfavorable_or_no_gain": "Unfavorable / No Gain",
    "indeterminate_or_not_comparable": "Indeterminate / N.C.",
}


def resolve_identifier_url(formal_id: str) -> str:
    fid = (formal_id or "").strip()
    if not fid:
        return ""
    if fid.lower().startswith("arxiv:"):
        arxiv_id = fid.split(":", 1)[1].strip()
        return f"https://arxiv.org/abs/{arxiv_id}"
    if fid.lower().startswith("doi:"):
        doi = fid.split(":", 1)[1].strip()
        return f"https://doi.org/{doi}"
    if fid.startswith("10."):
        return f"https://doi.org/{fid}"
    if fid.startswith("http://") or fid.startswith("https://"):
        return fid
    return f"https://doi.org/{fid}"


def extract_modality_tags(modality_text: str, datasets_text: str) -> list[str]:
    combined = f"{modality_text} {datasets_text}"
    tags = []
    for label, pattern in MODALITY_RULES:
        if re.search(pattern, combined, flags=re.IGNORECASE):
            tags.append(label)
    if not tags:
        tags.append("Other / Unspecified")
    return tags


def extract_model_tag(title: str) -> str:
    if ":" in title:
        prefix = title.split(":", 1)[0].strip()
        if 2 <= len(prefix) <= 28 and len(prefix.split()) <= 4:
            return prefix
    m = re.search(
        r"\b([A-Za-z0-9]+(?:-[A-Za-z0-9]+)*KAN[A-Za-z0-9-]*|KAN-[A-Za-z0-9-]+|U2-KAN|U-KAN)\b",
        title,
    )
    if m:
        return m.group(1)
    return ""


def read_csv_rows(filename: str) -> list[dict]:
    path = DATA_DIR / filename
    with path.open("r", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def build_datasets():
    s1_raw = read_csv_rows("S1_study_level_evidence_matrix.csv")
    s2_raw = read_csv_rows("S2_report_level_screening_ledger.csv")
    s3_raw = read_csv_rows("S3_exact_search_strategies.csv")
    s4_raw = read_csv_rows("S4_title_abstract_screening_ledger.csv")

    studies = []
    for row in s1_raw:
        url = resolve_identifier_url(row["formal_identifier"])
        mod_tags = extract_modality_tags(row["imaging_modality"], row["datasets_and_sample"])
        model_tag = extract_model_tag(row["title"])
        studies.append(
            {
                "id": row["study_id"],
                "report_id": row["canonical_report_id"],
                "companions": row["companion_report_ids"],
                "title": row["title"],
                "model_tag": model_tag,
                "year": int(row["publication_year"]),
                "formal_id": row["formal_identifier"],
                "url": url,
                "tier": row["input_scope_tier"],
                "task": row["primary_task"],
                "task_label": TASK_LABELS.get(row["primary_task"], row["primary_task"]),
                "modality": row["imaging_modality"],
                "modality_tags": mod_tags,
                "integration": row["primary_structural_integration"],
                "integration_label": INTEGRATION_LABELS.get(
                    row["primary_structural_integration"], row["primary_structural_integration"]
                ),
                "taxonomy_basis": row["taxonomy_assignment_basis"],
                "taxonomy_confidence": row["taxonomy_confidence"],
                "kan_role": row["kan_method_or_role"],
                "datasets": row["datasets_and_sample"],
                "comparison": row["baseline_or_comparison_evidence"],
                "results": row["primary_reported_results"],
                "evidence_cat": row["kan_specific_contribution_evidence_category"],
                "evidence_label": EVIDENCE_LABELS.get(
                    row["kan_specific_contribution_evidence_category"],
                    row["kan_specific_contribution_evidence_category"],
                ),
                "evidence_basis": row["contribution_evidence_classification_basis"],
                "limitations": row["review_level_risk_or_limitations"],
                "pub_status": row["publication_status"],
                "route": row["identification_route"],
                "qa_status": row["structured_extraction_status"],
                "direction": row["whole_model_result_direction"],
                "direction_label": DIRECTION_LABELS.get(
                    row["whole_model_result_direction"], row["whole_model_result_direction"]
                ),
                "direction_basis": row["direction_coding_basis"],
            }
        )

    # Sort by year desc, then study_id asc
    studies.sort(key=lambda x: (-x["year"], x["id"]))

    # Aggregate summary statistics for charts and portal KPIs
    by_year = collections.Counter(s["year"] for s in studies)
    by_tier = collections.Counter(s["tier"] for s in studies)
    by_task = collections.Counter(s["task"] for s in studies)
    by_integration = collections.Counter(s["integration"] for s in studies)
    by_evidence = collections.Counter(s["evidence_cat"] for s in studies)
    by_direction = collections.Counter(s["direction"] for s in studies)

    task_x_integration = {}
    for t in TASK_LABELS:
        task_x_integration[t] = {
            k: sum(1 for s in studies if s["task"] == t and s["integration"] == k)
            for k in INTEGRATION_LABELS
        }

    direction_x_evidence = {}
    for d in DIRECTION_LABELS:
        direction_x_evidence[d] = {
            e: sum(1 for s in studies if s["direction"] == d and s["evidence_cat"] == e)
            for e in ["A_strong", "B_moderate", "C_weak_compound", "D_insufficient"]
        }

    s4_exclusions = collections.Counter(
        r["title_abstract_exclusion_reason"]
        for r in s4_raw
        if r["title_abstract_exclusion_reason"]
    )
    s2_decisions = collections.Counter(r["final_report_decision"] for r in s2_raw)

    summary = {
        "paper": {
            "title": "A review of Kolmogorov–Arnold networks for medical image analysis",
            "authors": "Jieyun Bai*, Zhongguo Cai, Rongshun Yang, Karim Lekadir, Shuo Li*",
            "journal": "Computerized Medical Imaging and Graphics",
            "volume": "136",
            "article": "102827",
            "year": 2026,
            "doi": "10.1016/j.compmedimag.2026.102827",
            "doi_url": "https://doi.org/10.1016/j.compmedimag.2026.102827",
            "window": "2024-01-01 to 2026-02-28",
        },
        "prisma": {
            "db_records_raw": 5108,
            "duplicates_removed": 2079,
            "records_screened": len(s4_raw),
            "excluded_title_abstract": sum(
                1 for r in s4_raw if r["title_abstract_decision"] == "exclude_title_abstract"
            ),
            "db_reports_sought": 143,
            "other_reports_sought": 19,
            "total_reports_sought": len(s2_raw),
            "reports_not_retrieved": s2_decisions.get("report_not_retrieved", 0),
            "reports_assessed": 160,
            "reports_excluded_audit": s2_decisions.get("excluded_report", 0),
            "eligible_reports": s2_decisions.get("eligible_report", 0),
            "companion_consolidated": 5,
            "independent_studies": len(studies),
        },
        "counts": {
            "by_year": {str(k): by_year[k] for k in sorted(by_year)},
            "by_tier": dict(by_tier),
            "by_task": dict(by_task),
            "by_integration": dict(by_integration),
            "by_evidence": {
                "A_strong": 0,
                "B_moderate": by_evidence["B_moderate"],
                "C_weak_compound": by_evidence["C_weak_compound"],
                "D_insufficient": by_evidence["D_insufficient"],
            },
            "by_direction": dict(by_direction),
            "task_x_integration": task_x_integration,
            "direction_x_evidence": direction_x_evidence,
            "title_abstract_exclusion_reasons": dict(s4_exclusions.most_common()),
        },
        "search_queries": s3_raw,
    }

    payload = {"summary": summary, "studies": studies}

    PORTAL_DATA_DIR.mkdir(parents=True, exist_ok=True)
    json_path = PORTAL_DATA_DIR / "studies.json"
    js_path = PORTAL_DATA_DIR / "studies_data.js"

    with json_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    with js_path.open("w", encoding="utf-8") as f:
        f.write("// Auto-generated by scripts/build_portal_data.py — do not edit manually.\n")
        f.write("window.KAN_PORTAL_DATA = ")
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")

    write_markdown_catalog(studies)
    print(f"Built {json_path} ({json_path.stat().st_size} bytes)")
    print(f"Built {js_path} ({js_path.stat().st_size} bytes)")
    print(f"Built {CATALOG_PATH} ({CATALOG_PATH.stat().st_size} bytes)")


def write_markdown_catalog(studies: list[dict]):
    lines = [
        "# Complete 138-Study Auditable Evidence Catalog",
        "",
        "> Companion study-level index for **Bai, Cai, Yang, Lekadir, & Li (2026)**, *A review of Kolmogorov–Arnold networks for medical image analysis*, *Computerized Medical Imaging and Graphics*, 136, 102827 ([DOI: 10.1016/j.compmedimag.2026.102827](https://doi.org/10.1016/j.compmedimag.2026.102827)).",
        "",
        "- **Eligibility window**: 1 January 2024 – 28 February 2026 (`138` independent studies: `127` Tier A direct imaging, `11` Tier B image-derived).",
        "- **Important interpretive note**: *Whole-Model Direction* reflects reported full-model comparisons against the source's principal baseline and **does not isolate** the KAN component. Always inspect *KAN-Specific Contribution Evidence* (`Cat. A: 0`, `Cat. B: 48`, `Cat. C: 46`, `Cat. D: 44`) alongside the full rationale in [`data/S1_study_level_evidence_matrix.csv`](../data/S1_study_level_evidence_matrix.csv).",
        "",
        "## Quick Navigation by Modular Integration Paradigm",
        "",
    ]

    order = [
        ("backbone_level", "A. Backbone-Level Fusion"),
        ("bottleneck_or_token_level", "B. Bottleneck / Token-Level Fusion"),
        ("physics_informed_or_INR", "C. Physics-Informed & Implicit Representation (INR) Modules"),
        ("task_specific_head", "D. Task-Specific Functional Heads"),
    ]

    for key, heading in order:
        cnt = sum(1 for s in studies if s["integration"] == key)
        anchor = re.sub(r"[^a-z0-9 -]", "", heading.lower()).replace(" ", "-")
        lines.append(f"- [{heading}](#{anchor}) (`n = {cnt}`)")
    lines.append("")

    ev_short = {
        "A_strong": "`Cat. A (Strong)`",
        "B_moderate": "`Cat. B (Moderate)`",
        "C_weak_compound": "`Cat. C (Weak/Compound)`",
        "D_insufficient": "`Cat. D (Insufficient)`",
    }
    dir_short = {
        "favorable_full_model": "Favorable",
        "mixed_or_tradeoff": "Mixed / Trade-off",
        "unfavorable_or_no_gain": "Unfavorable / Null",
        "indeterminate_or_not_comparable": "Indeterminate",
    }

    for key, heading in order:
        subset = [s for s in studies if s["integration"] == key]
        subset.sort(key=lambda s: (s["task_label"], -s["year"], s["id"]))
        lines.append(f"## {heading}")
        lines.append("")
        lines.append(f"Total independent studies in this paradigm: **{len(subset)}**")
        lines.append("")
        lines.append("| ID | Year | Tier | Task | Modality | Title & Source | Whole-Model Direction | KAN Evidence |")
        lines.append("|:---|:---:|:---:|:---|:---|:---|:---|:---|")
        for s in subset:
            title_clean = s["title"].replace("|", "\\|").replace("\n", " ")
            mod_clean = s["modality"].replace("|", "\\|").replace("\n", " ")
            if len(mod_clean) > 58:
                mod_clean = mod_clean[:55] + "..."
            link_md = f"[{title_clean}]({s['url']})" if s["url"] else title_clean
            lines.append(
                f"| `{s['id']}` | {s['year']} | {s['tier']} | {s['task_label']} | {mod_clean} | {link_md} | {dir_short.get(s['direction'], s['direction'])} | {ev_short.get(s['evidence_cat'], s['evidence_cat'])} |"
            )
        lines.append("")

    CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    CATALOG_PATH.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    build_datasets()
