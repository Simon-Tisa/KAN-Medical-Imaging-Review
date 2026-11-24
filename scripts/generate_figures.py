#!/usr/bin/env python3
"""
Generate crisp, publication-grade SVG infographic cards for GitHub READMEs
directly from data/S1_study_level_evidence_matrix.csv (zero external dependencies).

Outputs in assets/figures/:
  1. hero_banner.svg         (1200 x 370)
  2. evidence_landscape.svg  (1200 x 560)
  3. modular_paradigms.svg   (1200 x 530)
  4. decision_quadrant.svg   (1200 x 500)
"""

import collections
import csv
import html
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
FIG_DIR = ROOT / "assets" / "figures"

FONT_SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, Helvetica, Arial, sans-serif"
FONT_MONO = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"


def esc(text: str) -> str:
    return html.escape(str(text), quote=True)


def load_s1() -> list[dict]:
    with (DATA_DIR / "S1_study_level_evidence_matrix.csv").open("r", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))


def curve_path(points: list[tuple[float, float]]) -> str:
    if not points:
        return ""
    parts = [f"M {points[0][0]:.2f} {points[0][1]:.2f}"]
    for x, y in points[1:]:
        parts.append(f"L {x:.2f} {y:.2f}")
    return " ".join(parts)


def build_hero_banner(studies: list[dict]) -> str:
    n_total = len(studies)
    n_tier_a = sum(1 for s in studies if s["input_scope_tier"] == "Tier A")
    n_tier_b = sum(1 for s in studies if s["input_scope_tier"] == "Tier B")
    n_mod = sum(1 for s in studies if s["kan_specific_contribution_evidence_category"] == "B_moderate")
    n_comp = sum(1 for s in studies if s["kan_specific_contribution_evidence_category"] == "C_weak_compound")
    n_insuf = sum(1 for s in studies if s["kan_specific_contribution_evidence_category"] == "D_insufficient")

    # Decorative mathematical basis curves in the top-right background
    pts_lorentz = []
    pts_spline = []
    pts_cheb = []
    for i in range(120):
        t = -1.0 + 2.0 * i / 119.0
        px = 828 + (t + 1.0) * 158
        # Lorentzian peak
        y_lor = 1.0 / (1.0 + (t / 0.28) ** 2)
        pts_lorentz.append((px, 215 - y_lor * 125))
        # B-spline-like smooth composite
        y_sp = 0.55 * math.sin(2.6 * t) + 0.35 * math.exp(-((t - 0.35) ** 2) / 0.12)
        pts_spline.append((px, 165 - y_sp * 68))
        # Chebyshev T_4(t)
        y_ch = math.cos(4 * math.acos(max(-1.0, min(1.0, t))))
        pts_cheb.append((px, 155 - y_ch * 42))

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 370" width="1200" height="370" role="img" aria-label="A review of Kolmogorov-Arnold networks for medical image analysis banner">
  <defs>
    <linearGradient id="heroBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="52%" stop-color="#13203B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="accentLine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="50%" stop-color="#818CF8"/>
      <stop offset="100%" stop-color="#34D399"/>
    </linearGradient>
    <pattern id="gridPat" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#334155" stroke-width="0.6" stroke-opacity="0.35"/>
    </pattern>
  </defs>

  <rect width="1200" height="370" rx="20" fill="url(#heroBg)"/>
  <rect width="1200" height="370" rx="20" fill="url(#gridPat)"/>
  <rect x="1" y="1" width="1198" height="368" rx="19" fill="none" stroke="#334155" stroke-width="1.5"/>
  <rect x="44" y="0" width="320" height="4" rx="2" fill="url(#accentLine)"/>

  <!-- Decorative edge-function curves on right -->
  <g opacity="0.9">
    <rect x="812" y="34" width="348" height="192" rx="14" fill="#0F172A" fill-opacity="0.72" stroke="#334155" stroke-width="1"/>
    <text x="828" y="56" font-family="{FONT_MONO}" font-size="10.5" fill="#94A3B8">Learnable Edge Bases  φ(x) = Σ λᵢ Bᵢ(x)</text>
    <line x1="824" y1="155" x2="1146" y2="155" stroke="#334155" stroke-width="1" stroke-dasharray="3,3"/>
    <path d="{curve_path(pts_cheb)}" fill="none" stroke="#818CF8" stroke-width="1.8" stroke-opacity="0.65"/>
    <path d="{curve_path(pts_spline)}" fill="none" stroke="#38BDF8" stroke-width="2.6"/>
    <path d="{curve_path(pts_lorentz)}" fill="none" stroke="#34D399" stroke-width="2.4"/>
    <g font-family="{FONT_SANS}" font-size="10" fill="#CBD5E1">
      <circle cx="830" cy="210" r="3.8" fill="#38BDF8"/><text x="839" y="214">B-Spline</text>
      <circle cx="912" cy="210" r="3.8" fill="#34D399"/><text x="921" y="214">Lorentzian (CEST)</text>
      <circle cx="1044" cy="210" r="3.8" fill="#818CF8"/><text x="1053" y="214">Chebyshev</text>
    </g>
  </g>

  <!-- Journal & DOI Pill -->
  <g transform="translate(44, 34)">
    <rect x="0" y="0" width="438" height="28" rx="14" fill="#1E293B" stroke="#38BDF8" stroke-opacity="0.45" stroke-width="1"/>
    <circle cx="16" cy="14" r="4.5" fill="#38BDF8"/>
    <text x="28" y="18.5" font-family="{FONT_SANS}" font-size="12" font-weight="600" fill="#E0F2FE">Computerized Medical Imaging and Graphics · 136 (2026) 102827</text>

    <rect x="450" y="0" width="290" height="28" rx="14" fill="#1E293B" stroke="#64748B" stroke-opacity="0.45" stroke-width="1"/>
    <text x="466" y="18.5" font-family="{FONT_MONO}" font-size="11.5" fill="#CBD5E1">DOI: 10.1016/j.compmedimag.2026.102827</text>
  </g>

  <!-- Main Title -->
  <text x="44" y="106" font-family="{FONT_SANS}" font-size="29" font-weight="800" fill="#F8FAFC" letter-spacing="-0.4">A Review of Kolmogorov–Arnold Networks</text>
  <text x="44" y="142" font-family="{FONT_SANS}" font-size="29" font-weight="800" fill="#38BDF8" letter-spacing="-0.4">for Medical Image Analysis</text>

  <!-- Subtitle & Authors -->
  <text x="44" y="175" font-family="{FONT_SANS}" font-size="13.5" fill="#CBD5E1">Auditable Synthesis of 138 Studies (2024–2026) · Modular Taxonomy · Clinical Translation</text>
  <text x="44" y="202" font-family="{FONT_SANS}" font-size="13.5" font-weight="500" fill="#94A3B8">Jieyun Bai* · Zhongguo Cai · Rongshun Yang · Karim Lekadir · Shuo Li*</text>

  <!-- Bottom 4 KPI Cards -->
  <g transform="translate(44, 244)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="268" height="94" rx="12" fill="#1E293B" fill-opacity="0.88" stroke="#334155" stroke-width="1"/>
    <text x="16" y="25" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#38BDF8">AUDITABLE EVIDENCE CORPUS</text>
    <text x="16" y="55" font-family="{FONT_SANS}" font-size="22" font-weight="800" fill="#F8FAFC">5,108 → {n_total} Studies</text>
    <text x="16" y="76" font-family="{FONT_SANS}" font-size="10.8" fill="#94A3B8">3,029 screened · {n_tier_a} Tier A + {n_tier_b} Tier B</text>

    <!-- Card 2 -->
    <rect x="282" y="0" width="268" height="94" rx="12" fill="#1E293B" fill-opacity="0.88" stroke="#334155" stroke-width="1"/>
    <text x="298" y="25" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#818CF8">MODULAR TAXONOMY (A–D)</text>
    <text x="298" y="55" font-family="{FONT_SANS}" font-size="22" font-weight="800" fill="#F8FAFC">4 Integration Roles</text>
    <text x="298" y="76" font-family="{FONT_SANS}" font-size="10.8" fill="#94A3B8">A: 33 · B: 84 · C (INR): 6 · D (Head): 15</text>

    <!-- Card 3 -->
    <rect x="564" y="0" width="268" height="94" rx="12" fill="#1E293B" fill-opacity="0.88" stroke="#F59E0B" stroke-opacity="0.45" stroke-width="1"/>
    <text x="580" y="25" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#FBBF24">ATTRIBUTION RIGOR GAP</text>
    <text x="580" y="55" font-family="{FONT_SANS}" font-size="22" font-weight="800" fill="#F8FAFC">0 / {n_total} Category A</text>
    <text x="580" y="76" font-family="{FONT_SANS}" font-size="10.8" fill="#94A3B8">Cat. B: {n_mod} · Cat. C: {n_comp} · Cat. D: {n_insuf}</text>

    <!-- Card 4 -->
    <rect x="846" y="0" width="270" height="94" rx="12" fill="#1E293B" fill-opacity="0.88" stroke="#34D399" stroke-opacity="0.45" stroke-width="1"/>
    <text x="862" y="25" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#34D399">OPEN COMPANION TOOLKIT</text>
    <text x="862" y="55" font-family="{FONT_SANS}" font-size="22" font-weight="800" fill="#F8FAFC">Tables S1–S4 + Web</text>
    <text x="862" y="76" font-family="{FONT_SANS}" font-size="10.8" fill="#94A3B8">Explorer · Basis Lab · Checklist</text>
  </g>
</svg>
"""
    return svg


def build_evidence_landscape(studies: list[dict]) -> str:
    # Compute exact cross-tabulations from S1
    years = collections.Counter(s["publication_year"] for s in studies)
    dir_order = [
        ("favorable_full_model", "Favorable Model", "#10B981"),
        ("mixed_or_tradeoff", "Mixed / Trade-off", "#F59E0B"),
        ("unfavorable_or_no_gain", "Unfavorable / Null", "#EF4444"),
        ("indeterminate_or_not_comparable", "Indeterminate", "#64748B"),
    ]
    ev_order = [
        ("A_strong", "Cat. A", "Strong", "#059669"),
        ("B_moderate", "Cat. B", "Mod.", "#0284C7"),
        ("C_weak_compound", "Cat. C", "Comp.", "#D97706"),
        ("D_insufficient", "Cat. D", "Insuf.", "#DC2626"),
    ]

    matrix = {}
    for d_key, _, _ in dir_order:
        matrix[d_key] = {}
        for e_key, _, _, _ in ev_order:
            matrix[d_key][e_key] = sum(
                1
                for s in studies
                if s["whole_model_result_direction"] == d_key
                and s["kan_specific_contribution_evidence_category"] == e_key
            )

    task_order = [
        ("segmentation", "Segmentation"),
        ("classification_or_detection", "Classification / Det."),
        ("reconstruction_or_enhancement", "Reconstruction / Enh."),
        ("quantitative_or_other_image_analysis", "Quantitative / Other"),
        ("registration", "Registration"),
        ("image_fusion", "Image Fusion"),
        ("image_derived_outcome_prediction", "Outcome Prediction"),
    ]
    int_order = [
        ("backbone_level", "A: Backbone", "#2563EB"),
        ("bottleneck_or_token_level", "B: Bottleneck/Token", "#0D9488"),
        ("physics_informed_or_INR", "C: Physics/INR", "#7C3AED"),
        ("task_specific_head", "D: Task Head", "#EA580C"),
    ]

    parts = [
        f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 560" width="1200" height="560" role="img" aria-label="Quantitative Evidence Landscape of 138 Medical-Imaging KAN Studies">
  <rect width="1200" height="560" rx="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Top Header -->
  <text x="32" y="38" font-family="{FONT_SANS}" font-size="20" font-weight="800" fill="#0F172A">Quantitative Evidence Landscape Across 138 Independent Studies (Jan 2024 – Feb 2026)</text>
  <text x="32" y="60" font-family="{FONT_SANS}" font-size="12.5" fill="#475569">Synthesized directly from Supplementary Tables S1–S4 · Separating full-model headline claims from isolated KAN-specific contribution evidence</text>
  <line x1="28" y1="74" x2="1172" y2="74" stroke="#E2E8F0" stroke-width="1.2"/>
"""
    ]

    # PANEL 1: PRISMA Funnel + Publication Year (x=28..372)
    parts.append(
        f"""
  <!-- Panel 1: PRISMA & Yearly Trend -->
  <g transform="translate(28, 90)">
    <rect x="0" y="0" width="344" height="442" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2"/>
    <text x="18" y="28" font-family="{FONT_SANS}" font-size="14" font-weight="700" fill="#0F172A">1. PRISMA Reconstruction Funnel</text>
    <text x="18" y="45" font-family="{FONT_SANS}" font-size="11" fill="#64748B">4 databases + citation tracking (Tables S2–S4)</text>
"""
    )
    funnel_steps = [
        ("Database Records", "5,108", 1.00, "#94A3B8", "Crossref 800 · EPMC 360 · arXiv 670 · OpenAlex 3,278"),
        ("Unique Screened", "3,029", 0.72, "#64748B", "2,079 duplicates removed · 2,886 excluded at T/A"),
        ("Reports Sought", "162", 0.42, "#0284C7", "143 DB + 19 other · 160 assessed · 17 excluded"),
        ("Strict Evidence Set", "138", 0.36, "#0F766E", "127 Tier A (direct image) + 11 Tier B (derived)"),
    ]
    for idx, (label, val, ratio, col, note) in enumerate(funnel_steps):
        y = 64 + idx * 54
        bw = int(304 * ratio)
        parts.append(
            f"""    <text x="18" y="{y + 13}" font-family="{FONT_SANS}" font-size="11.5" font-weight="600" fill="#1E293B">{esc(label)}</text>
    <text x="324" y="{y + 13}" text-anchor="end" font-family="{FONT_MONO}" font-size="12" font-weight="700" fill="{col}">{val}</text>
    <rect x="18" y="{y + 19}" width="306" height="12" rx="6" fill="#E2E8F0"/>
    <rect x="18" y="{y + 19}" width="{bw}" height="12" rx="6" fill="{col}"/>
    <text x="18" y="{y + 44}" font-family="{FONT_SANS}" font-size="10" fill="#64748B">{esc(note)}</text>
"""
        )

    # Mini Year Chart at bottom of Panel 1
    parts.append(
        f"""    <line x1="18" y1="290" x2="326" y2="290" stroke="#E2E8F0" stroke-width="1"/>
    <text x="18" y="312" font-family="{FONT_SANS}" font-size="13" font-weight="700" fill="#0F172A">First Public Report Year (n = 138)</text>
    <text x="18" y="328" font-family="{FONT_SANS}" font-size="10.5" fill="#64748B">2026 truncated at 28 Feb cutoff</text>
"""
    )
    yr_list = [("2024", years["2024"], "#38BDF8"), ("2025", years["2025"], "#2563EB"), ("2026*", years["2026"], "#6366F1")]
    for idx, (yr, cnt, col) in enumerate(yr_list):
        bx = 38 + idx * 98
        bh = max(8, int(52 * (cnt / 107.0)))
        by = 416 - bh
        parts.append(
            f"""    <rect x="{bx}" y="{by}" width="64" height="{bh}" rx="6" fill="{col}"/>
    <text x="{bx + 32}" y="{by - 6}" text-anchor="middle" font-family="{FONT_MONO}" font-size="12" font-weight="700" fill="#0F172A">{cnt}</text>
    <text x="{bx + 32}" y="432" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.5" font-weight="600" fill="#334155">{yr}</text>
"""
        )
    parts.append("  </g>\n")

    # PANEL 2: 2D Matrix — Whole-Model Direction vs KAN-Specific Evidence (x=388..796)
    parts.append(
        f"""
  <!-- Panel 2: Headline vs KAN-Specific Attribution Matrix -->
  <g transform="translate(388, 90)">
    <rect x="0" y="0" width="408" height="442" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2"/>
    <text x="18" y="28" font-family="{FONT_SANS}" font-size="14" font-weight="700" fill="#0F172A">2. Headline Direction vs. KAN Attribution</text>
    <text x="18" y="45" font-family="{FONT_SANS}" font-size="11" fill="#64748B">Rows: full-model direction · Cols: KAN-specific evidence</text>
"""
    )
    # Column headers
    for c_idx, (_, c_code, c_sub, c_col) in enumerate(ev_order):
        cx = 186 + c_idx * 55
        parts.append(
            f"""    <rect x="{cx - 24}" y="60" width="49" height="36" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="{cx + 0.5}" y="75" text-anchor="middle" font-family="{FONT_SANS}" font-size="10.8" font-weight="700" fill="{c_col}">{c_code}</text>
    <text x="{cx + 0.5}" y="89" text-anchor="middle" font-family="{FONT_SANS}" font-size="9" fill="#64748B">{c_sub}</text>
"""
        )

    for r_idx, (d_key, d_label, d_col) in enumerate(dir_order):
        ry = 108 + r_idx * 54
        row_tot = sum(matrix[d_key].values())
        parts.append(
            f"""    <circle cx="20" cy="{ry + 18}" r="4.2" fill="{d_col}"/>
    <text x="30" y="{ry + 15}" font-family="{FONT_SANS}" font-size="10.8" font-weight="600" fill="#1E293B">{esc(d_label)}</text>
    <text x="30" y="{ry + 30}" font-family="{FONT_MONO}" font-size="10.2" fill="#64748B">n = {row_tot}</text>
"""
        )
        for c_idx, (e_key, _, _, e_col) in enumerate(ev_order):
            cx = 186 + c_idx * 55
            val = matrix[d_key][e_key]
            if val == 0:
                fill_c = "#F1F5F9"
                txt_c = "#94A3B8"
                stroke_c = "#E2E8F0"
            elif val >= 19:
                fill_c = "#DBEAFE" if e_key == "B_moderate" else ("#FEF3C7" if e_key == "C_weak_compound" else "#FEE2E2")
                txt_c = "#0F172A"
                stroke_c = e_col
            else:
                fill_c = "#FFFFFF"
                txt_c = "#1E293B"
                stroke_c = "#CBD5E1"
            parts.append(
                f"""    <rect x="{cx - 24}" y="{ry}" width="49" height="40" rx="8" fill="{fill_c}" stroke="{stroke_c}" stroke-width="1.2"/>
    <text x="{cx + 0.5}" y="{ry + 25}" text-anchor="middle" font-family="{FONT_MONO}" font-size="13.5" font-weight="700" fill="{txt_c}">{val}</text>
"""
            )

    # Column totals row
    parts.append(
        f"""    <line x1="18" y1="328" x2="390" y2="328" stroke="#CBD5E1" stroke-width="1"/>
    <text x="18" y="349" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Column Totals</text>
"""
    )
    for c_idx, (e_key, _, _, e_col) in enumerate(ev_order):
        cx = 186 + c_idx * 55
        col_tot = sum(matrix[d_key][e_key] for d_key, _, _ in dir_order)
        parts.append(
            f"""    <text x="{cx + 0.5}" y="350" text-anchor="middle" font-family="{FONT_MONO}" font-size="13" font-weight="800" fill="{e_col}">{col_tot}</text>
"""
        )

    # Critical insight box
    parts.append(
        f"""    <rect x="16" y="366" width="376" height="62" rx="10" fill="#FFFBEB" stroke="#F59E0B" stroke-opacity="0.55" stroke-width="1"/>
    <text x="28" y="385" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#92400E">Critical Takeaway (Why Audit Matters):</text>
    <text x="28" y="402" font-family="{FONT_SANS}" font-size="10.5" fill="#78350F">Among 68 favorable full-model reports, 0 have Cat. A factorial</text>
    <text x="28" y="417" font-family="{FONT_SANS}" font-size="10.5" fill="#78350F">proof and 40/68 are confounded (Cat. C: 19) or insufficient (Cat. D: 21).</text>
  </g>
"""
    )

    # PANEL 3: Primary Task × Modular Placement (x=812..1172)
    parts.append(
        f"""
  <!-- Panel 3: Task x Modular Integration -->
  <g transform="translate(812, 90)">
    <rect x="0" y="0" width="360" height="442" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2"/>
    <text x="18" y="28" font-family="{FONT_SANS}" font-size="14" font-weight="700" fill="#0F172A">3. Task × KAN Placement (A–D)</text>
    <text x="18" y="45" font-family="{FONT_SANS}" font-size="11" fill="#64748B">Primary task stacked by structural integration</text>
"""
    )

    for idx, (t_key, t_label) in enumerate(task_order):
        ty = 66 + idx * 45
        t_studies = [s for s in studies if s["primary_task"] == t_key]
        t_tot = len(t_studies)
        parts.append(
            f"""    <text x="18" y="{ty + 12}" font-family="{FONT_SANS}" font-size="11" font-weight="600" fill="#1E293B">{esc(t_label)}</text>
    <text x="342" y="{ty + 12}" text-anchor="end" font-family="{FONT_MONO}" font-size="11.5" font-weight="700" fill="#0F172A">{t_tot}</text>
    <rect x="18" y="{ty + 18}" width="324" height="14" rx="5" fill="#E2E8F0"/>
"""
        )
        cur_x = 18.0
        max_bar = 324.0 * (t_tot / 68.0)
        for i_key, _, i_col in int_order:
            sub_cnt = sum(1 for s in t_studies if s["primary_structural_integration"] == i_key)
            if sub_cnt > 0:
                seg_w = max(4.0, max_bar * (sub_cnt / t_tot))
                parts.append(
                    f"""    <rect x="{cur_x:.1f}" y="{ty + 18}" width="{seg_w:.1f}" height="14" rx="3" fill="{i_col}"/>\n"""
                )
                cur_x += seg_w

    # Legend for A-D at bottom of Panel 3
    parts.append(
        f"""    <line x1="18" y1="382" x2="342" y2="382" stroke="#E2E8F0" stroke-width="1"/>
    <g font-family="{FONT_SANS}" font-size="10.5" fill="#334155">
      <rect x="18" y="394" width="10" height="10" rx="2.5" fill="#2563EB"/><text x="33" y="403">A: Backbone (33)</text>
      <rect x="180" y="394" width="10" height="10" rx="2.5" fill="#0D9488"/><text x="195" y="403">B: Bottleneck/Token (84)</text>
      <rect x="18" y="416" width="10" height="10" rx="2.5" fill="#7C3AED"/><text x="33" y="425">C: Physics / INR (6)</text>
      <rect x="180" y="416" width="10" height="10" rx="2.5" fill="#EA580C"/><text x="195" y="425">D: Task Head (15)</text>
    </g>
  </g>
</svg>
"""
    )
    return "".join(parts)


def build_modular_paradigms() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 530" width="1200" height="530" role="img" aria-label="Four Modular KAN Integration Paradigms in Medical Imaging">
  <rect width="1200" height="530" rx="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Header -->
  <text x="32" y="38" font-family="{FONT_SANS}" font-size="20" font-weight="800" fill="#0F172A">Four Modular KAN Integration Paradigms in Medical-Imaging Pipelines</text>
  <text x="32" y="60" font-family="{FONT_SANS}" font-size="12.5" fill="#475569">From end-to-end imaging stages to bounded, testable KAN insertion points (Section 3, Figs. 6–7)</text>
  <line x1="28" y1="74" x2="1172" y2="74" stroke="#E2E8F0" stroke-width="1.2"/>

  <!-- End-to-End Pipeline Spine -->
  <g transform="translate(28, 92)">
    <rect x="0" y="0" width="1144" height="86" rx="14" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.2"/>
    <text x="20" y="22" font-family="{FONT_MONO}" font-size="10.5" font-weight="700" fill="#475569">END-TO-END MEDICAL IMAGING PIPELINE &amp; INSERTION LOCATIONS</text>

    <!-- 5 Pipeline Stages -->
    <rect x="20" y="34" width="196" height="38" rx="8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.2"/>
    <text x="118" y="51" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">1. Medical Input &amp; Physics</text>
    <text x="118" y="65" text-anchor="middle" font-family="{FONT_SANS}" font-size="9.8" fill="#64748B">2D/3D MRI, CT, US, WSI, k-space</text>

    <path d="M 220 53 L 244 53" stroke="#64748B" stroke-width="1.8"/>
    <polygon points="244,49 252,53 244,57" fill="#64748B"/>

    <rect x="256" y="34" width="202" height="38" rx="8" fill="#EFF6FF" stroke="#2563EB" stroke-width="1.5"/>
    <text x="357" y="51" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#1D4ED8">2. Feature Encoder [A]</text>
    <text x="357" y="65" text-anchor="middle" font-family="{FONT_SANS}" font-size="9.8" fill="#3B82F6">CNN / ViT / KANConv Backbone</text>

    <path d="M 462 53 L 486 53" stroke="#64748B" stroke-width="1.8"/>
    <polygon points="486,49 494,53 486,57" fill="#64748B"/>

    <rect x="498" y="34" width="212" height="38" rx="8" fill="#F0FDFA" stroke="#0D9488" stroke-width="1.5"/>
    <text x="604" y="51" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F766E">3. Latent / Skip / Token [B]</text>
    <text x="604" y="65" text-anchor="middle" font-family="{FONT_SANS}" font-size="9.8" fill="#0D9488">U-Net Bottleneck &amp; Hybrid Blocks</text>

    <path d="M 714 53 L 738 53" stroke="#64748B" stroke-width="1.8"/>
    <polygon points="738,49 746,53 738,57" fill="#64748B"/>

    <rect x="750" y="34" width="188" height="38" rx="8" fill="#F5F3FF" stroke="#7C3AED" stroke-width="1.5"/>
    <text x="844" y="51" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#6D28D9">4. Continuous Field [C]</text>
    <text x="844" y="65" text-anchor="middle" font-family="{FONT_SANS}" font-size="9.8" fill="#7C3AED">Forward Model / INR Velocity</text>

    <path d="M 942 53 L 966 53" stroke="#64748B" stroke-width="1.8"/>
    <polygon points="966,49 974,53 966,57" fill="#64748B"/>

    <rect x="978" y="34" width="148" height="38" rx="8" fill="#FFF7ED" stroke="#EA580C" stroke-width="1.5"/>
    <text x="1052" y="51" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#C2410C">5. Task Head [D]</text>
    <text x="1052" y="65" text-anchor="middle" font-family="{FONT_SANS}" font-size="9.8" fill="#EA580C">Diagnosis / Cox Risk</text>
  </g>

  <!-- 4 Detailed Paradigm Cards -->
  <!-- Card A -->
  <g transform="translate(28, 198)">
    <rect x="0" y="0" width="274" height="304" rx="14" fill="#F8FAFC" stroke="#93C5FD" stroke-width="1.5"/>
    <rect x="0" y="0" width="274" height="44" rx="14" fill="#EFF6FF"/>
    <circle cx="26" cy="22" r="12" fill="#2563EB"/>
    <text x="26" y="26.5" text-anchor="middle" font-family="{FONT_SANS}" font-size="12.5" font-weight="800" fill="#FFFFFF">A</text>
    <text x="46" y="20" font-family="{FONT_SANS}" font-size="13" font-weight="800" fill="#1E3A8A">Backbone-Level Fusion</text>
    <text x="46" y="35" font-family="{FONT_MONO}" font-size="10.5" fill="#2563EB">n = 33 studies (23.9%)</text>

    <text x="16" y="68" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Mechanism</text>
    <text x="16" y="85" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Repeated KANConv or KAN-attention</text>
    <text x="16" y="100" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">blocks reconstruct the main encoder.</text>

    <text x="16" y="126" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Representative Models</text>
    <text x="16" y="143" font-family="{FONT_MONO}" font-size="10.3" fill="#1D4ED8">MedViT V2 · MedKAN · KACNet</text>
    <text x="16" y="158" font-family="{FONT_MONO}" font-size="10.3" fill="#1D4ED8">MSFKAN · DEQ-KAN · GhostKMNet</text>

    <text x="16" y="185" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Primary Tasks</text>
    <text x="16" y="202" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Segmentation (20), Classification (9),</text>
    <text x="16" y="217" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Reconstruction (3), Registration (1)</text>

    <rect x="14" y="234" width="246" height="56" rx="8" fill="#FFFFFF" stroke="#DBEAFE" stroke-width="1"/>
    <text x="24" y="251" font-family="{FONT_SANS}" font-size="10.3" font-weight="700" fill="#1E40AF">Audit Requirement:</text>
    <text x="24" y="266" font-family="{FONT_SANS}" font-size="10" fill="#475569">Highest compute/memory burden; requires</text>
    <text x="24" y="280" font-family="{FONT_SANS}" font-size="10" fill="#475569">matched params, FLOPs &amp; stage ablation.</text>
  </g>

  <!-- Card B -->
  <g transform="translate(318, 198)">
    <rect x="0" y="0" width="274" height="304" rx="14" fill="#F8FAFC" stroke="#5EEAD4" stroke-width="1.5"/>
    <rect x="0" y="0" width="274" height="44" rx="14" fill="#F0FDFA"/>
    <circle cx="26" cy="22" r="12" fill="#0D9488"/>
    <text x="26" y="26.5" text-anchor="middle" font-family="{FONT_SANS}" font-size="12.5" font-weight="800" fill="#FFFFFF">B</text>
    <text x="46" y="20" font-family="{FONT_SANS}" font-size="13" font-weight="800" fill="#134E4A">Bottleneck / Token Fusion</text>
    <text x="46" y="35" font-family="{FONT_MONO}" font-size="10.5" fill="#0D9488">n = 84 studies (60.9%)</text>

    <text x="16" y="68" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Mechanism</text>
    <text x="16" y="85" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Retains CNN/ViT/Mamba encoder; inserts</text>
    <text x="16" y="100" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">KAN at low-res latent, token, or skip blocks.</text>

    <text x="16" y="126" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Representative Models</text>
    <text x="16" y="143" font-family="{FONT_MONO}" font-size="10.3" fill="#0F766E">U-KAN · KM-UNet · KEU-Net</text>
    <text x="16" y="158" font-family="{FONT_MONO}" font-size="10.3" fill="#0F766E">UKAN-EP · MedVKAN · Semi-KAN</text>

    <text x="16" y="185" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Primary Tasks</text>
    <text x="16" y="202" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Segmentation (48), Classification (25),</text>
    <text x="16" y="217" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Reconstruction (6), Fusion/Other (5)</text>

    <rect x="14" y="234" width="246" height="56" rx="8" fill="#FFFFFF" stroke="#CCFBF1" stroke-width="1"/>
    <text x="24" y="251" font-family="{FONT_SANS}" font-size="10.3" font-weight="700" fill="#115E59">Audit Requirement:</text>
    <text x="24" y="266" font-family="{FONT_SANS}" font-size="10" fill="#475569">Most tractable replacement; isolate KAN</text>
    <text x="24" y="280" font-family="{FONT_SANS}" font-size="10" fill="#475569">from Mamba/attention co-modifications.</text>
  </g>

  <!-- Card C -->
  <g transform="translate(608, 198)">
    <rect x="0" y="0" width="274" height="304" rx="14" fill="#F8FAFC" stroke="#C4B5FD" stroke-width="1.5"/>
    <rect x="0" y="0" width="274" height="44" rx="14" fill="#F5F3FF"/>
    <circle cx="26" cy="22" r="12" fill="#7C3AED"/>
    <text x="26" y="26.5" text-anchor="middle" font-family="{FONT_SANS}" font-size="12.5" font-weight="800" fill="#FFFFFF">C</text>
    <text x="46" y="20" font-family="{FONT_SANS}" font-size="13" font-weight="800" fill="#4C1D95">Physics-Informed / INR</text>
    <text x="46" y="35" font-family="{FONT_MONO}" font-size="10.5" fill="#7C3AED">n = 6 studies (4.3%)</text>

    <text x="16" y="68" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Mechanism</text>
    <text x="16" y="85" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Parameterizes continuous fields or physical</text>
    <text x="16" y="100" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">line-shapes with domain-aligned bases.</text>

    <text x="16" y="126" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Representative Models</text>
    <text x="16" y="143" font-family="{FONT_MONO}" font-size="10.3" fill="#6D28D9">CEST-LKAN · KAN-INR · KAN-IDIR</text>
    <text x="16" y="158" font-family="{FONT_MONO}" font-size="10.3" fill="#6D28D9">TC-KANRecon · Cheb-KAN</text>

    <text x="16" y="185" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Primary Tasks</text>
    <text x="16" y="202" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">CT–CBCT / MRI Registration (2),</text>
    <text x="16" y="217" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">MRI Recon (2), CEST Quantification (2)</text>

    <rect x="14" y="234" width="246" height="56" rx="8" fill="#FFFFFF" stroke="#EDE9FE" stroke-width="1"/>
    <text x="24" y="251" font-family="{FONT_SANS}" font-size="10.3" font-weight="700" fill="#5B21B6">Audit Requirement:</text>
    <text x="24" y="266" font-family="{FONT_SANS}" font-size="10" fill="#475569">Compare physics basis (e.g. Lorentzian)</text>
    <text x="24" y="280" font-family="{FONT_SANS}" font-size="10" fill="#475569">against both generic spline &amp; MLP-INR.</text>
  </g>

  <!-- Card D -->
  <g transform="translate(898, 198)">
    <rect x="0" y="0" width="274" height="304" rx="14" fill="#F8FAFC" stroke="#FDBA74" stroke-width="1.5"/>
    <rect x="0" y="0" width="274" height="44" rx="14" fill="#FFF7ED"/>
    <circle cx="26" cy="22" r="12" fill="#EA580C"/>
    <text x="26" y="26.5" text-anchor="middle" font-family="{FONT_SANS}" font-size="12.5" font-weight="800" fill="#FFFFFF">D</text>
    <text x="46" y="20" font-family="{FONT_SANS}" font-size="13" font-weight="800" fill="#7C2D12">Task-Specific Heads</text>
    <text x="46" y="35" font-family="{FONT_MONO}" font-size="10.5" fill="#EA580C">n = 15 studies (10.9%)</text>

    <text x="16" y="68" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Mechanism</text>
    <text x="16" y="85" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Freezes or retains standard backbone;</text>
    <text x="16" y="100" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">replaces terminal classifier or risk head.</text>

    <text x="16" y="126" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Representative Models</text>
    <text x="16" y="143" font-family="{FONT_MONO}" font-size="10.3" fill="#C2410C">SBTAYLOR-KAN · CoxKAN</text>
    <text x="16" y="158" font-family="{FONT_MONO}" font-size="10.3" fill="#C2410C">KACQ-DCNN · Compact KAN Heads</text>

    <text x="16" y="185" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Primary Tasks</text>
    <text x="16" y="202" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Classification / Detection (11),</text>
    <text x="16" y="217" font-family="{FONT_SANS}" font-size="10.8" fill="#334155">Survival / Outcome (2), Fusion/Quant (2)</text>

    <rect x="14" y="234" width="246" height="56" rx="8" fill="#FFFFFF" stroke="#FFEDD5" stroke-width="1"/>
    <text x="24" y="251" font-family="{FONT_SANS}" font-size="10.3" font-weight="700" fill="#9A3412">Audit Requirement:</text>
    <text x="24" y="266" font-family="{FONT_SANS}" font-size="10" fill="#475569">Test vs. linear/MLP head; verify seed</text>
    <text x="24" y="280" font-family="{FONT_SANS}" font-size="10" fill="#475569">stability of symbolic curves before claims.</text>
  </g>
</svg>
"""


def build_decision_quadrant() -> str:
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 500" width="1200" height="500" role="img" aria-label="Hypothesis-Selection Map and Four-Part Reporting Standard">
  <rect width="1200" height="500" rx="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>

  <!-- Header -->
  <text x="32" y="38" font-family="{FONT_SANS}" font-size="20" font-weight="800" fill="#0F172A">Experimental Design Guide: Hypothesis-Selection Map &amp; Minimum Reporting Standard</text>
  <text x="32" y="60" font-family="{FONT_SANS}" font-size="12.5" fill="#475569">Normative guidance for designing falsifiable KAN experiments and avoiding confounded claims (Section 4.4 &amp; Fig. 8)</text>
  <line x1="28" y1="74" x2="1172" y2="74" stroke="#E2E8F0" stroke-width="1.2"/>

  <!-- LEFT: 2x2 Quadrant Map (x=28..730) -->
  <g transform="translate(28, 90)">
    <rect x="0" y="0" width="702" height="384" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2"/>
    <text x="20" y="26" font-family="{FONT_SANS}" font-size="14" font-weight="700" fill="#0F172A">Hypothesis-Selection Map (Study Design, Not Clinical Deployment Rule)</text>

    <!-- Y-axis label -->
    <text x="22" y="205" transform="rotate(-90 22 205)" text-anchor="middle" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#475569">PRIORITY: Performance-Driven  ⟶  Transparency / Audit-Driven</text>

    <!-- Q1: Top-Left -->
    <rect x="44" y="42" width="312" height="146" rx="10" fill="#F5F3FF" stroke="#8B5CF6" stroke-width="1.4"/>
    <text x="56" y="64" font-family="{FONT_SANS}" font-size="11.2" font-weight="800" fill="#5B21B6">Physics-Informed KANs &amp; Inspectable Heads</text>
    <text x="56" y="81" font-family="{FONT_SANS}" font-size="10.1" fill="#4C1D95">Small-sample + strong physics prior or audit demand</text>
    <text x="56" y="102" font-family="{FONT_MONO}" font-size="9.8" fill="#6D28D9">e.g., CEST-LKAN, KAN-INR, CoxKAN [C / D]</text>
    <rect x="58" y="116" width="284" height="58" rx="6" fill="#FFFFFF" stroke="#DDD6FE" stroke-width="1"/>
    <text x="68" y="133" font-family="{FONT_SANS}" font-size="9.8" font-weight="700" fill="#334155">Required Control:</text>
    <text x="68" y="147" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">Domain-matched MLP/INR + generic spline basis;</text>
    <text x="68" y="161" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">quantify symbolic fidelity &amp; cross-seed stability.</text>

    <!-- Q2: Top-Right -->
    <rect x="370" y="42" width="312" height="146" rx="10" fill="#EFF6FF" stroke="#3B82F6" stroke-width="1.4"/>
    <text x="384" y="64" font-family="{FONT_SANS}" font-size="11.4" font-weight="800" fill="#1E40AF">Selective Hybrid KAN–CNN / KAN–ViT</text>
    <text x="384" y="81" font-family="{FONT_SANS}" font-size="10.1" fill="#1E3A8A">Large-scale models + increasing audit/shift constraints</text>
    <text x="384" y="102" font-family="{FONT_MONO}" font-size="9.7" fill="#2563EB">e.g., MedViT V2, U-KAN hybrids [A / B]</text>
    <rect x="384" y="116" width="284" height="58" rx="6" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1"/>
    <text x="394" y="133" font-family="{FONT_SANS}" font-size="9.8" font-weight="700" fill="#334155">Required Control:</text>
    <text x="394" y="147" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">Local substitution inside fixed host architecture;</text>
    <text x="394" y="161" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">test calibration (ECE/Brier) &amp; external-center shift.</text>

    <!-- Q3: Bottom-Left -->
    <rect x="44" y="200" width="312" height="146" rx="10" fill="#F0FDFA" stroke="#14B8A6" stroke-width="1.4"/>
    <text x="58" y="222" font-family="{FONT_SANS}" font-size="12" font-weight="800" fill="#115E59">Lightweight KAN Heads &amp; Bottlenecks</text>
    <text x="58" y="239" font-family="{FONT_SANS}" font-size="10.3" fill="#134E4A">Small/limited labels + performance goal with CNN/ViT</text>
    <text x="58" y="260" font-family="{FONT_MONO}" font-size="10" fill="#0F766E">e.g., U-KAN, KM-UNet, SBTAYLOR-KAN [B / D]</text>
    <rect x="58" y="274" width="284" height="58" rx="6" fill="#FFFFFF" stroke="#99F6E4" stroke-width="1"/>
    <text x="68" y="291" font-family="{FONT_SANS}" font-size="9.8" font-weight="700" fill="#334155">Required Control:</text>
    <text x="68" y="305" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">Keep pretrained CNN/ViT fixed; ablate KAN block</text>
    <text x="68" y="319" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">alone at matched parameter &amp; compute budget.</text>

    <!-- Q4: Bottom-Right -->
    <rect x="370" y="200" width="312" height="146" rx="10" fill="#F1F5F9" stroke="#64748B" stroke-width="1.4"/>
    <text x="384" y="222" font-family="{FONT_SANS}" font-size="12" font-weight="800" fill="#1E293B">Optimized CNN / ViT Preferred Baseline</text>
    <text x="384" y="239" font-family="{FONT_SANS}" font-size="10.3" fill="#334155">Large-scale, well-annotated clinical benchmarks</text>
    <text x="384" y="260" font-family="{FONT_MONO}" font-size="10" fill="#475569">Primary: nnU-Net, Swin UNETR, ConvNeXt</text>
    <rect x="384" y="274" width="284" height="58" rx="6" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="394" y="291" font-family="{FONT_SANS}" font-size="9.8" font-weight="700" fill="#334155">Required Control:</text>
    <text x="394" y="305" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">Retain mature baseline; require prespecified</text>
    <text x="394" y="319" font-family="{FONT_SANS}" font-size="9.6" fill="#475569">efficiency or non-inferiority margin to add KAN.</text>

    <!-- X-axis label -->
    <text x="363" y="369" text-anchor="middle" font-family="{FONT_SANS}" font-size="11" font-weight="700" fill="#475569">DATA REGIME: Small / Limited Annotations  ⟶  Large-Scale, Well-Labeled Data</text>
  </g>

  <!-- RIGHT: 4-Part Minimum Reporting Checklist (x=746..1172) -->
  <g transform="translate(746, 90)">
    <rect x="0" y="0" width="426" height="384" rx="14" fill="#0F172A" stroke="#1E293B" stroke-width="1.2"/>
    <text x="22" y="28" font-family="{FONT_SANS}" font-size="14.5" font-weight="800" fill="#F8FAFC">4-Part Minimum Reporting Standard</text>
    <text x="22" y="46" font-family="{FONT_SANS}" font-size="11" fill="#94A3B8">Recommended checklist for future medical-imaging KAN studies</text>

    <!-- Pillar 1 -->
    <rect x="18" y="62" width="390" height="68" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="32" y="82" font-family="{FONT_SANS}" font-size="12" font-weight="700" fill="#38BDF8">1. Data &amp; Patient-Level Task Metrics</text>
    <text x="32" y="99" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">Patient/volume-level splits · center counts · uncertainty</text>
    <text x="32" y="114" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">intervals · external-center validation for generalization claims.</text>

    <!-- Pillar 2 -->
    <rect x="18" y="140" width="390" height="68" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="32" y="160" font-family="{FONT_SANS}" font-size="12" font-weight="700" fill="#34D399">2. Isolated KAN-Specific Contribution</text>
    <text x="32" y="177" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">Fixed-activation control &amp; KAN-only ablation at matched</text>
    <text x="32" y="192" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">channels/params/FLOPs · disclose basis, grid G, order p, init.</text>

    <!-- Pillar 3 -->
    <rect x="18" y="218" width="390" height="68" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="32" y="238" font-family="{FONT_SANS}" font-size="12" font-weight="700" fill="#FBBF24">3. Calibration, Uncertainty &amp; Curve Stability</text>
    <text x="32" y="255" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">Proper scoring rule (Brier + ECE) · uncertainty–error link ·</text>
    <text x="32" y="270" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">numerical fidelity &amp; multi-seed stability of symbolic curves.</text>

    <!-- Pillar 4 -->
    <rect x="18" y="296" width="390" height="70" rx="10" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="32" y="316" font-family="{FONT_SANS}" font-size="12" font-weight="700" fill="#A78BFA">4. Hardware Resources &amp; Reproducibility</text>
    <text x="32" y="333" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">Separate params, FLOPs, peak VRAM, warmed-up latency &amp;</text>
    <text x="32" y="348" font-family="{FONT_SANS}" font-size="10.2" fill="#CBD5E1">throughput · hardware/precision · public code, splits &amp; seeds.</text>
  </g>
</svg>
"""


def build_attribution_synthesis(studies: list[dict]) -> str:
    """Two-panel synthesis of the cross-tabulations NOT plotted as standalone figures in the paper:
    Left: Whole-Model Direction x KAN-Specific Contribution Evidence (Section 3.4)
    Right: Primary Task x Modular Placement A-D Stacked Breakdown (Table S1)
    """
    dir_order = [
        ("favorable_full_model", "Favorable Full Model", "#10B981"),
        ("mixed_or_tradeoff", "Mixed / Trade-off", "#F59E0B"),
        ("unfavorable_or_no_gain", "Unfavorable / Null", "#EF4444"),
        ("indeterminate_or_not_comparable", "Indeterminate / N.C.", "#64748B"),
    ]
    ev_order = [
        ("A_strong", "Cat. A", "Factorial", "#059669"),
        ("B_moderate", "Cat. B", "Moderate", "#0284C7"),
        ("C_weak_compound", "Cat. C", "Compound", "#D97706"),
        ("D_insufficient", "Cat. D", "Insuf.", "#DC2626"),
    ]
    matrix = {
        d_key: {
            e_key: sum(
                1
                for s in studies
                if s["whole_model_result_direction"] == d_key
                and s["kan_specific_contribution_evidence_category"] == e_key
            )
            for e_key, _, _, _ in ev_order
        }
        for d_key, _, _ in dir_order
    }
    task_order = [
        ("segmentation", "Segmentation"),
        ("classification_or_detection", "Classification / Detection"),
        ("reconstruction_or_enhancement", "Reconstruction / Enhancement"),
        ("quantitative_or_other_image_analysis", "Quantitative / Other Analysis"),
        ("registration", "Registration"),
        ("image_fusion", "Image Fusion"),
        ("image_derived_outcome_prediction", "Image-Derived Outcome Pred."),
    ]
    int_order = [
        ("backbone_level", "A: Backbone (33)", "#2563EB"),
        ("bottleneck_or_token_level", "B: Bottleneck/Token (84)", "#0D9488"),
        ("physics_informed_or_INR", "C: Physics/INR (6)", "#7C3AED"),
        ("task_specific_head", "D: Task Head (15)", "#EA580C"),
    ]

    parts = [
        f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 508" width="1200" height="508" role="img" aria-label="Headline Direction vs KAN Attribution Matrix and Task x Module Breakdown">
  <rect width="1200" height="508" rx="18" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
  <text x="32" y="36" font-family="{FONT_SANS}" font-size="19.5" font-weight="800" fill="#0F172A">Cross-Tabulated Audit Synthesis from Supplementary Table S1 (n = 138)</text>
  <text x="32" y="57" font-family="{FONT_SANS}" font-size="12.5" fill="#475569">Complementary quantitative breakdown of Section 3.4: isolating KAN-specific contribution from compound full-model claims</text>
  <line x1="28" y1="70" x2="1172" y2="70" stroke="#E2E8F0" stroke-width="1.2"/>

  <!-- Left Panel: 2D Attribution Matrix -->
  <g transform="translate(28, 84)">
    <rect x="0" y="0" width="564" height="400" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2"/>
    <text x="22" y="28" font-family="{FONT_SANS}" font-size="14.5" font-weight="700" fill="#0F172A">1. Whole-Model Direction × KAN Attribution Rigor</text>
    <text x="22" y="45" font-family="{FONT_SANS}" font-size="11" fill="#64748B">Rows: reported full-model direction · Cols: isolated KAN contribution evidence</text>
"""
    ]
    for c_idx, (_, c_code, c_sub, c_col) in enumerate(ev_order):
        cx = 258 + c_idx * 78
        parts.append(
            f"""    <rect x="{cx - 33}" y="58" width="66" height="36" rx="7" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    <text x="{cx}" y="73" text-anchor="middle" font-family="{FONT_SANS}" font-size="11.2" font-weight="700" fill="{c_col}">{c_code}</text>
    <text x="{cx}" y="87" text-anchor="middle" font-family="{FONT_SANS}" font-size="9.5" fill="#64748B">{c_sub}</text>
"""
        )
    for r_idx, (d_key, d_label, d_col) in enumerate(dir_order):
        ry = 104 + r_idx * 48
        row_tot = sum(matrix[d_key].values())
        parts.append(
            f"""    <circle cx="24" cy="{ry + 18}" r="4.5" fill="{d_col}"/>
    <text x="35" y="{ry + 15}" font-family="{FONT_SANS}" font-size="11.5" font-weight="600" fill="#1E293B">{esc(d_label)}</text>
    <text x="35" y="{ry + 30}" font-family="{FONT_MONO}" font-size="10.5" fill="#64748B">n = {row_tot}</text>
"""
        )
        for c_idx, (e_key, _, _, e_col) in enumerate(ev_order):
            cx = 258 + c_idx * 78
            val = matrix[d_key][e_key]
            if val == 0:
                fill_c, txt_c, stroke_c = "#F1F5F9", "#94A3B8", "#E2E8F0"
            elif val >= 19:
                fill_c = "#DBEAFE" if e_key == "B_moderate" else ("#FEF3C7" if e_key == "C_weak_compound" else "#FEE2E2")
                txt_c, stroke_c = "#0F172A", e_col
            else:
                fill_c, txt_c, stroke_c = "#FFFFFF", "#1E293B", "#CBD5E1"
            parts.append(
                f"""    <rect x="{cx - 33}" y="{ry}" width="66" height="38" rx="8" fill="{fill_c}" stroke="{stroke_c}" stroke-width="1.2"/>
    <text x="{cx}" y="{ry + 24}" text-anchor="middle" font-family="{FONT_MONO}" font-size="14" font-weight="700" fill="{txt_c}">{val}</text>
"""
            )
    parts.append(
        f"""    <line x1="22" y1="302" x2="542" y2="302" stroke="#CBD5E1" stroke-width="1"/>
    <text x="22" y="322" font-family="{FONT_SANS}" font-size="11.5" font-weight="700" fill="#0F172A">Column Totals (n = 138)</text>
"""
    )
    for c_idx, (e_key, _, _, e_col) in enumerate(ev_order):
        cx = 258 + c_idx * 78
        col_tot = sum(matrix[d_key][e_key] for d_key, _, _ in dir_order)
        parts.append(
            f"""    <text x="{cx}" y="322" text-anchor="middle" font-family="{FONT_MONO}" font-size="13.5" font-weight="800" fill="{e_col}">{col_tot}</text>\n"""
        )
    parts.append(
        f"""    <rect x="20" y="332" width="524" height="52" rx="8" fill="#FFFBEB" stroke="#F59E0B" stroke-opacity="0.55" stroke-width="1"/>
    <text x="32" y="352" font-family="{FONT_SANS}" font-size="10.8" font-weight="700" fill="#92400E">Key Audit Finding: 0 / 138 studies reach Cat. A (strict factorial control);</text>
    <text x="32" y="370" font-family="{FONT_SANS}" font-size="10.6" fill="#78350F">40 of 68 favorable full-model reports are confounded (Cat. C: 19) or insufficient (Cat. D: 21).</text>
  </g>

  <!-- Right Panel: Task x Modular Placement -->
  <g transform="translate(608, 84)">
    <rect x="0" y="0" width="564" height="400" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.2"/>
    <text x="22" y="28" font-family="{FONT_SANS}" font-size="14.5" font-weight="700" fill="#0F172A">2. Primary Clinical Task × KAN Placement (A–D)</text>
    <text x="22" y="45" font-family="{FONT_SANS}" font-size="11" fill="#64748B">Bottleneck/token fusion dominates segmentation; INR anchors registration &amp; CEST</text>
"""
    )
    for idx, (t_key, t_label) in enumerate(task_order):
        ty = 64 + idx * 40
        t_studies = [s for s in studies if s["primary_task"] == t_key]
        t_tot = len(t_studies)
        parts.append(
            f"""    <text x="22" y="{ty + 13}" font-family="{FONT_SANS}" font-size="11" font-weight="600" fill="#1E293B">{esc(t_label)}</text>
    <text x="542" y="{ty + 13}" text-anchor="end" font-family="{FONT_MONO}" font-size="11.5" font-weight="700" fill="#0F172A">{t_tot}</text>
    <rect x="234" y="{ty + 2}" width="272" height="14" rx="5" fill="#E2E8F0"/>
"""
        )
        cur_x = 234.0
        max_bar = 272.0 * (t_tot / 68.0)
        for i_key, _, i_col in int_order:
            sub_cnt = sum(1 for s in t_studies if s["primary_structural_integration"] == i_key)
            if sub_cnt > 0:
                seg_w = max(5.0, max_bar * (sub_cnt / t_tot))
                parts.append(
                    f"""    <rect x="{cur_x:.1f}" y="{ty + 2}" width="{seg_w:.1f}" height="14" rx="3" fill="{i_col}"/>\n"""
                )
                cur_x += seg_w
    parts.append(
        f"""    <line x1="22" y1="348" x2="542" y2="348" stroke="#E2E8F0" stroke-width="1"/>
    <g font-family="{FONT_SANS}" font-size="10.6" fill="#334155">
      <rect x="22" y="364" width="11" height="11" rx="2.5" fill="#2563EB"/><text x="37" y="374">A: Backbone (33)</text>
      <rect x="150" y="364" width="11" height="11" rx="2.5" fill="#0D9488"/><text x="165" y="374">B: Bottleneck (84)</text>
      <rect x="292" y="364" width="11" height="11" rx="2.5" fill="#7C3AED"/><text x="307" y="374">C: Physics/INR (6)</text>
      <rect x="434" y="364" width="11" height="11" rx="2.5" fill="#EA580C"/><text x="449" y="374">D: Head (15)</text>
    </g>
  </g>
</svg>
"""
    )
    return "".join(parts)


def main():
    FIG_DIR.mkdir(parents=True, exist_ok=True)
    studies = load_s1()

    outputs = {
        "hero_banner.svg": build_hero_banner(studies),
        "attribution_synthesis.svg": build_attribution_synthesis(studies),
        "evidence_landscape.svg": build_evidence_landscape(studies),
        "modular_paradigms.svg": build_modular_paradigms(),
        "decision_quadrant.svg": build_decision_quadrant(),
    }

    for name, content in outputs.items():
        out_path = FIG_DIR / name
        out_path.write_text(content, encoding="utf-8")
        print(f"Generated {out_path} ({out_path.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
