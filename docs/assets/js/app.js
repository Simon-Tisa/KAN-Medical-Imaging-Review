/* Interactive Companion Portal for Bai et al., CMIG 136 (2026) 102827 */
(function () {
  "use strict";

  const DATA = window.KAN_PORTAL_DATA || { summary: {}, studies: [] };
  const STUDIES = DATA.studies || [];
  const SUMMARY = DATA.summary || {};

  let state = {
    lang: localStorage.getItem("kan_lang") || "en",
    theme: localStorage.getItem("kan_theme") || "light",
    activeTab: "overview",
    filters: {
      q: "",
      task: "all",
      integration: "all",
      evidence: "all",
      direction: "all",
      modality: "all",
      yearTier: "all",
      preset: "all",
    },
    sandbox: {
      basis: "bspline",
      G: 6,
      order: 3,
      omegaB: 0.35,
      omegaS: 1.0,
      gamma: 0.42,
      shift: 0.35,
      alpha: 0.5,
      beta: -0.3,
      bw: 0.45,
      mlpOverlay: "silu",
      showComponents: true,
      seedOffset: 0,
    },
    checklist: {},
  };

  /* -------------------- Bilingual Dictionary -------------------- */
  const I18N = {
    en: {
      brandTitle: "KAN-MedIA Evidence Atlas",
      tabOverview: "Overview & Matrix",
      tabExplorer: "138-Study Explorer",
      tabSandbox: "Edge-Basis Sandbox",
      tabAdvisor: "Study Designer & Checklist",
      btnCite: "Cite BibTeX",
      btnPaper: "Paper (DOI) ↗",
      heroWindow: "Window: Jan 2024 – Feb 2026",
      heroTitleHtml: "A Review of <span>Kolmogorov–Arnold Networks</span> for Medical Image Analysis",
      heroLead:
        "An auditable evidence reconstruction and methodological synthesis across 138 independent medical-imaging studies. Rather than treating reported metrics as a cross-paper leaderboard, this companion toolkit separates whole-model headline results from isolated KAN-specific contribution evidence across four modular integration mechanisms (A–D).",
      kpi1Label: "Audited Evidence Corpus",
      kpi1Sub: "3,029 unique records screened · 127 Tier A + 11 Tier B",
      kpi2Label: "Modular Integration (A–D)",
      kpi2Val: "4 Mechanisms",
      kpi2Sub: "Backbone 33 · Bottleneck 84 · Physics/INR 6 · Head 15",
      kpi3Label: "KAN Attribution Rigor",
      kpi3Sub: "48 Moderate (B) · 46 Compound (C) · 44 Insufficient (D)",
      kpi4Label: "Headline vs. Isolation",
      kpi4Sub: "68 favorable full models, only 28 with moderate KAN evidence",
      ovHeading: "Interactive Evidence Landscape (Click Any Cell to Filter Studies)",
      ovSub: "Every number below is linked directly to Supplementary Table S1. Click any matrix cell or modular paradigm card to inspect the exact underlying studies.",
      mat1Title: "Whole-Model Direction × KAN-Specific Contribution Evidence",
      mat1Sub: "Separating reported full-model gains from controlled evidence isolating the KAN module",
      mat1Callout:
        "<strong>Core Finding:</strong> Zero studies satisfied Category A (complete resource-matched factorial attribution). Among 68 studies reporting favorable full-model performance, 40 simultaneously altered attention, Mamba/state-space blocks, losses, or lacked defensible KAN-only controls.",
      mat2Title: "Primary Medical Task × Modular Integration Placement (A–D)",
      mat2Sub: "Distribution of 138 independent studies across clinical imaging tasks and architectural depths",
      paraHeading: "Four Modular KAN Integration Paradigms (Section 3.1)",
      paraSub: "Click any paradigm card to browse all corresponding studies in the 138-Study Explorer.",
      paperFigsHeading: "Paper Architecture & Framework Figures (Figs. 4 & 7)",
      paperFigsSub: "High-resolution schematic diagrams rendered directly from our original vector manuscript figures",
      prismaHeading: "Reproducible Retrospective Evidence Reconstruction (PRISMA Audit Trail)",
      prismaSub: "Auditable path from 4 bibliographic APIs (Table S3) through title/abstract screening (S4) and full-text reconciliation (S2) to the 138-study matrix (S1).",
      expHeading: "138-Study Auditable Evidence Explorer (Supplementary Table S1)",
      expSub: "Filter across architectural placement, task, modality, whole-model direction, and KAN-specific attribution rigor. Export any filtered subset for meta-research.",
      searchPlaceholder: "Search by model (U-KAN, MedKAN, CEST-LKAN, CoxKAN), dataset (BUSI, BraTS, ACDC), modality, or DOI...",
      btnReset: "Reset Filters",
      lblTask: "Primary Task",
      lblIntegration: "KAN Placement (A–D)",
      lblEvidence: "KAN Contribution Evidence",
      lblDirection: "Whole-Model Direction",
      lblModality: "Imaging Modality",
      lblYearTier: "Year / Input Tier",
      btnExportCsv: "⬇ Export Filtered CSV",
      btnExportJson: "⬇ Export Filtered JSON",
      sbHeading: "KAN Edge-Function & Physical Prior Interactive Sandbox",
      sbSub: "Explore how KANs move learnable nonlinearities from nodes to edges φ(x), why domain-aligned bases act as testable priors, and how basis parameters scale complexity.",
      sbSelectTitle: "1. Select Edge-Basis Family",
      sbSelectSub: "Compare general spline bases with physics-aligned & fast approximations",
      sbParamTitle: "2. Interactive Basis Controls",
      sbMlpOverlay: "Overlay MLP Node Activation",
      sbShowBasis: "Show individual basis terms",
      sbPerturbBtn: "🎲 Perturb Coefficients",
      compHeading: "Order-of-Magnitude Parameter & Compute Estimator (Section 2.3.5)",
      compSub: "Compare idealized MLP O(L·w²) vs. Dense KAN O(L·w²·(G+p)) parameter scaling — illustrating why matched channel width ≠ matched parameter budget",
      advHeading: "Hypothesis-Selection Advisor & 4-Part Reporting Checklist Generator",
      advSub: "Operationalizing Figure 8 and Section 4.4 of the review: configure your study conditions to select a defensible KAN hypothesis, then generate a ready-to-paste Markdown reporting checklist.",
      advConfigTitle: "Configure Your Study Conditions (Fig. 8)",
      advConfigSub: "Select data scale, audit priority, physical priors, and deployment constraints",
      advLblData: "1. Labeled Data Regime",
      advOptSmall: "Small / Limited Annotations (Single-center, rare disease, low-label fraction)",
      advOptLarge: "Large-Scale, Well-Annotated Benchmark (Multi-center or abundant labels)",
      advLblPrio: "2. Primary Study Objective",
      advOptTrans: "Functional Transparency, Symbolic Risk Auditing, or Physical Interpretability",
      advOptPerf: "Task Predictive Performance (Dice / AUC / PSNR) & Parameter Efficiency",
      advLblPhys: "3. Explicit Physical / Spectral Forward Model?",
      advOptPhysYes: "Yes (e.g., CEST line shapes, MRI k-space, continuous 4D deformation field)",
      advOptPhysNo: "No (Empirical image-to-label / image-to-mask mapping)",
      advLblLat: "4. Volumetric / Real-Time Latency Constraint",
      advOptLatStrict: "High-Resolution 3D/4D Volume or Strict Clinical Latency Budget",
      advOptLatRelax: "2D Slices / RoI Features / Offline Analysis",
      advRecTitle: "Recommended Experimental Design & Required Controls",
      advRecSub: "Guidance for falsifiable hypothesis testing (not a clinical deployment endorsement)",
      chkHeading: "4-Part Minimum Reporting Standard Checklist (Section 4.4)",
      chkSub: "Check items fulfilled by your experiment and add brief notes to export a standardized Markdown table for your paper's supplementary material or GitHub README.",
      btnFillDemo: "Fill Exemplar Demo",
      btnClearChk: "Clear All",
      btnCopyMd: "📋 Copy Markdown Table",
      btnDownloadMd: "⬇ Download .md",
      chkPreviewSummary: "Preview Generated Markdown Table",
      citeModalTitle: "Cite This Review & Evidence Atlas",
    },
    zh: {
      brandTitle: "医学影像 KAN 证据图谱",
      tabOverview: "总览与证据矩阵",
      tabExplorer: "138 篇证据检索",
      tabSandbox: "KAN 边函数沙盒",
      tabAdvisor: "实验选型与报告自查",
      btnCite: "引用 BibTeX",
      btnPaper: "阅读原文 (DOI) ↗",
      heroWindow: "检索窗口：2024.01 – 2026.02",
      heroTitleHtml: "医学图像分析中的 <span>Kolmogorov–Arnold 网络 (KAN)</span> 综述",
      heroLead:
        "基于 138 项独立医学影像研究的可审计证据重构与方法学综述（CMIG 2026）。本交互式门户不把跨文献指标当成简单排行榜，而是通过 A–D 四大模块集成机制，将“全模型表面性能方向”与“受控隔离的 KAN 独立贡献证据”严格区分。",
      kpi1Label: "可审计证据重构漏斗",
      kpi1Sub: "初筛 3,029 条去重记录 · Tier A 直接影像 127 + Tier B 派生表征 11",
      kpi2Label: "四大模块集成范式 (A–D)",
      kpi2Val: "4 类嵌入位置",
      kpi2Sub: "A 骨干级 33 · B 瓶颈/Token 级 84 · C 物理/INR 6 · D 任务头 15",
      kpi3Label: "KAN 独立归因证据等级",
      kpi3Sub: "B 级中等证据 48 · C 级复合改造 46 · D 级证据不足 44",
      kpi4Label: "全模型报喜 vs 独立归因",
      kpi4Sub: "68 篇报告全模型占优，仅 28 篇具备中等以上 KAN 独立消融证据",
      ovHeading: "交互式定量证据全景（点击任意矩阵单元格直接筛选文献）",
      ovSub: "下方所有统计均由补充材料表 S1 实时聚合生成。点击任意数字单元格或模块卡片，即可跳转查看对应的原始研究与审稿级局限性剖析。",
      mat1Title: "全模型结果方向 × KAN 独立贡献证据等级（二维归因矩阵）",
      mat1Sub: "剥离注意力/Mamba/多尺度等复合改动，检验 KAN 组件本身的受控增量价值",
      mat1Callout:
        "<strong>核心发现：</strong>全部 138 项研究中，<strong>0 项</strong>达到最严格的 A 级（预算严格匹配的完整析因对照）。在 68 篇宣称全模型优于基线的研究中，有 40 篇混杂了其他结构改动或缺乏可辩护的 KAN 单一变量消融。",
      mat2Title: "医学影像核心任务 × KAN 模块化集成位置 (A–D)",
      mat2Sub: "138 项独立研究在 7 类临床影像任务与 4 种架构深度上的分布",
      paraHeading: "四大 KAN 模块化集成机制（第 3.1 节）",
      paraSub: "点击任一范式卡片即可在证据浏览器中查看该类别下的全部研究。",
      paperFigsHeading: "论文原始矢量架构图全景（原文 Fig. 4 & Fig. 7）",
      paperFigsSub: "由手稿原始矢量 PDF 直出的高分辨率方法学总览图与流水线模块嵌入位置示意图",
      prismaHeading: "可复现回顾性证据重构流程（PRISMA 全链路审计台账）",
      prismaSub: "从四大文献数据库精确 API 检索式（表 S3）、3,029 条题录初筛（表 S4）、162 篇全文评估与版本合并（表 S2）到 138 篇独立研究矩阵（表 S1）。",
      expHeading: "138 篇独立研究交互式证据浏览器（表 S1 全字段审计）",
      expSub: "支持按任务、A–D 位置、KAN 证据等级、全模型方向、成像模态多维交叉筛选，并支持一键导出 CSV/JSON 子集。",
      searchPlaceholder: "搜索模型名（如 U-KAN, MedKAN, CEST-LKAN, CoxKAN）、数据集（BUSI, BraTS, ACDC）、模态或 DOI...",
      btnReset: "重置筛选",
      lblTask: "主要医学任务",
      lblIntegration: "KAN 集成位置 (A–D)",
      lblEvidence: "KAN 独立贡献证据",
      lblDirection: "全模型结果方向",
      lblModality: "医学成像模态",
      lblYearTier: "发表年份 / 输入层级",
      btnExportCsv: "⬇ 导出当前筛选 CSV",
      btnExportJson: "⬇ 导出当前筛选 JSON",
      sbHeading: "KAN 边函数族与物理先验交互沙盒",
      sbSub: "直观对比传统 MLP 固定节点激活与 KAN 可学习一维边基函数 φ(x)，实时调节 B-Spline、Lorentzian（CEST 磁共振谱线）、Chebyshev（抑制吉布斯伪影）、Jacobi（4D 配准隐式场）与 RBF 参数。",
      sbSelectTitle: "1. 选择边函数基族（第 2.2 / 3.1.3 节）",
      sbSelectSub: "对比通用样条基、物理驱动谱线基与快速径向基近似",
      sbParamTitle: "2. 实时调节基函数超参数",
      sbMlpOverlay: "叠加对比 MLP 节点激活函数",
      sbShowBasis: "显示单个基函数分量曲线",
      sbPerturbBtn: "🎲 随机扰动系数（观察稳定性）",
      compHeading: "参数量级与计算复杂度估算器（第 2.3.5 节）",
      compSub: "对比理想化 MLP O(L·w²) 与稠密 KAN O(L·w²·(G+p)) 的参数规模——直观说明为何“相同通道宽度 ≠ 公平参数预算”",
      advHeading: "医学影像 KAN 实验选型向导 & 四维报告规范自查生成器",
      advSub: "将论文图 8（假设选择图）与第 4.4 节（最低报告规范）转化为实用工具：先确定最合理的 KAN 插入位置与对照设计，再一键生成可粘贴进论文附录/审稿回复的 Markdown 自查表。",
      advConfigTitle: "设定你的研究场景条件（对应论文图 8）",
      advConfigSub: "选择标注数据规模、透明性/审计需求、物理先验与三维/时延约束",
      advLblData: "1. 标注数据规模",
      advOptSmall: "小样本 / 标注受限（单中心、罕见病、低比例半监督标注）",
      advOptLarge: "大规模成熟标注基准（多中心大队列或充足标注数据集）",
      advLblPrio: "2. 首要建模目标",
      advOptTrans: "函数级可检查性、符号风险审计或物理可解释性优先",
      advOptPerf: "预测精度（Dice / AUC / PSNR）与参数效率优先",
      advLblPhys: "3. 是否存在明确物理算子或谱线先验？",
      advOptPhysYes: "是（如 CEST 洛伦兹谱线、MRI k 空间、连续四维形变速度场）",
      advOptPhysNo: "否（常规经验性图像到类别/分割掩码映射）",
      advLblLat: "4. 三维高分辨率 / 临床实时推理约束",
      advOptLatStrict: "高分辨率 3D/4D 体数据或严格显存/延迟预算",
      advOptLatRelax: "2D 切片 / 感兴趣区特征 / 离线分析场景",
      advRecTitle: "推荐实验假设与必须控制的基线方案",
      advRecSub: "用于指导受控实验设计，而非直接临床部署背书",
      chkHeading: "四部分最低报告与可复现自查表生成器（第 4.4 节）",
      chkSub: "勾选你的研究已满足的报告条目并填写简要说明，一键复制或下载标准 Markdown 表格（自带规范引用，可直接放入论文附录或代码仓）。",
      btnFillDemo: "填入示例规范研究",
      btnClearChk: "清空重置",
      btnCopyMd: "📋 复制 Markdown 自查表",
      btnDownloadMd: "⬇ 下载 .md 文件",
      chkPreviewSummary: "预览生成的 Markdown 报告自查表",
      citeModalTitle: "引用本综述与交互式证据库",
    },
  };

  const LABELS = {
    task: {
      segmentation: { en: "Segmentation", zh: "图像分割 (Segmentation)" },
      classification_or_detection: { en: "Classification / Detection", zh: "分类与检测 (Classification)" },
      reconstruction_or_enhancement: { en: "Reconstruction / Enhancement", zh: "重建与增强 (Reconstruction)" },
      quantitative_or_other_image_analysis: { en: "Quantitative / Other", zh: "定量与其他分析 (Quantitative)" },
      registration: { en: "Registration", zh: "图像配准 (Registration)" },
      image_fusion: { en: "Image Fusion", zh: "多模态融合 (Image Fusion)" },
      image_derived_outcome_prediction: { en: "Outcome / Survival", zh: "预后与生存预测 (Outcome)" },
    },
    integration: {
      backbone_level: { en: "A: Backbone-Level", zh: "A: 骨干级融合 (Backbone)" },
      bottleneck_or_token_level: { en: "B: Bottleneck / Token", zh: "B: 瓶颈/Token级 (Bottleneck)" },
      physics_informed_or_INR: { en: "C: Physics / INR", zh: "C: 物理先验/隐式场 (Physics/INR)" },
      task_specific_head: { en: "D: Task-Specific Head", zh: "D: 任务特定预测头 (Task Head)" },
    },
    evidence: {
      A_strong: { en: "Cat. A — Strong (Factorial)", zh: "A级 — 强证据（完整析因）" },
      B_moderate: { en: "Cat. B — Moderate (Matched/Ablated)", zh: "B级 — 中等（同框架替换/消融）" },
      C_weak_compound: { en: "Cat. C — Weak / Compound", zh: "C级 — 弱/复合混杂改动" },
      D_insufficient: { en: "Cat. D — Insufficient", zh: "D级 — 归因证据不足" },
    },
    direction: {
      favorable_full_model: { en: "Favorable Full Model", zh: "全模型正向占优 (Favorable)" },
      mixed_or_tradeoff: { en: "Mixed / Trade-off", zh: "结果混合或存在代价权衡 (Mixed)" },
      unfavorable_or_no_gain: { en: "Unfavorable / No Gain", zh: "无增益或劣于基线 (Unfavorable)" },
      indeterminate_or_not_comparable: { en: "Indeterminate / N.C.", zh: "不可比或基准缺失 (Indeterminate)" },
    },
  };

  function tr(obj) {
    if (!obj) return "";
    return obj[state.lang] || obj.en || "";
  }

  function escHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* -------------------- Tab & Theme & Language -------------------- */
  function switchTab(tabId) {
    state.activeTab = tabId;
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.toggle("active", panel.id === `panel-${tabId}`);
    });
    if (tabId === "sandbox") {
      requestAnimationFrame(drawSandbox);
    }
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", state.theme);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = state.theme === "dark" ? "☀️" : "🌙";
    if (state.activeTab === "sandbox") requestAnimationFrame(drawSandbox);
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
    const dict = I18N[state.lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] !== undefined) {
        if (key === "mat1Callout") {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle) heroTitle.innerHTML = dict.heroTitleHtml;
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.placeholder = dict.searchPlaceholder;
    const studyTitleInput = document.getElementById("studyTitleInput");
    if (studyTitleInput) {
      studyTitleInput.placeholder =
        state.lang === "zh"
          ? "选填：输入你的论文或模型名称（如 MyKAN-UNet 用于心脏 MRI 分割）"
          : "Optional: Enter your manuscript or model name (e.g., MyKAN-UNet for 3D Cardiac MRI Segmentation)";
    }
    const langBtn = document.getElementById("langToggle");
    if (langBtn) langBtn.textContent = state.lang === "en" ? "中文" : "EN";

    renderOverview();
    populateFilterOptions();
    renderPresetChips();
    renderStudyList();
    renderBasisSelector();
    renderSandboxControls();
    drawSandbox();
    updateComplexityEstimator();
    renderAdvisor();
    renderChecklist();
  }

  /* -------------------- TAB 1: Overview Matrices & PRISMA -------------------- */
  function renderOverview() {
    const counts = SUMMARY.counts || {};
    const dxE = counts.direction_x_evidence || {};
    const txI = counts.task_x_integration || {};

    // 1. Attribution Matrix
    const dirKeys = [
      "favorable_full_model",
      "mixed_or_tradeoff",
      "unfavorable_or_no_gain",
      "indeterminate_or_not_comparable",
    ];
    const evKeys = ["A_strong", "B_moderate", "C_weak_compound", "D_insufficient"];
    const evShort = {
      A_strong: state.lang === "zh" ? "A 强(析因)" : "Cat. A (Strong)",
      B_moderate: state.lang === "zh" ? "B 中等(消融)" : "Cat. B (Mod.)",
      C_weak_compound: state.lang === "zh" ? "C 弱(复合)" : "Cat. C (Comp.)",
      D_insufficient: state.lang === "zh" ? "D 不足" : "Cat. D (Insuf.)",
    };

    let html1 = `<table class="matrix-table"><thead><tr><th class="row-head">${
      state.lang === "zh" ? "全模型方向 \\ KAN证据" : "Direction \\ KAN Evidence"
    }</th>`;
    evKeys.forEach((ek) => {
      html1 += `<th>${escHtml(evShort[ek])}</th>`;
    });
    html1 += `<th>${state.lang === "zh" ? "合计" : "Total"}</th></tr></thead><tbody>`;

    dirKeys.forEach((dk) => {
      const row = dxE[dk] || {};
      const rowSum = evKeys.reduce((acc, ek) => acc + (row[ek] || 0), 0);
      html1 += `<tr><th class="row-head">${escHtml(tr(LABELS.direction[dk]))}</th>`;
      evKeys.forEach((ek) => {
        const v = row[ek] || 0;
        let bg = "var(--bg-subtle)";
        if (v > 0) {
          if (ek === "B_moderate") bg = "rgba(2, 132, 199, 0.16)";
          else if (ek === "C_weak_compound") bg = "rgba(217, 119, 6, 0.17)";
          else if (ek === "D_insufficient") bg = "rgba(220, 38, 38, 0.15)";
        }
        html1 += `<td><div class="matrix-cell ${v === 0 ? "zero" : ""}" style="background:${bg}" data-jump-dir="${dk}" data-jump-ev="${ek}">${v}</div></td>`;
      });
      html1 += `<td><div class="matrix-cell" style="background:var(--bg-subtle)" data-jump-dir="${dk}" data-jump-ev="all">${rowSum}</div></td></tr>`;
    });

    // Totals row
    html1 += `<tr><th class="row-head">${state.lang === "zh" ? "列合计" : "Column Total"}</th>`;
    evKeys.forEach((ek) => {
      const colSum = dirKeys.reduce((acc, dk) => acc + ((dxE[dk] || {})[ek] || 0), 0);
      html1 += `<td><div class="matrix-cell ${colSum === 0 ? "zero" : ""}" style="background:var(--bg-subtle)" data-jump-dir="all" data-jump-ev="${ek}">${colSum}</div></td>`;
    });
    html1 += `<td><div class="matrix-cell" style="background:var(--primary-soft); color:var(--primary);" data-jump-dir="all" data-jump-ev="all">${STUDIES.length}</div></td></tr></tbody></table>`;

    const c1 = document.getElementById("attributionMatrixContainer");
    if (c1) {
      c1.innerHTML = html1;
      c1.querySelectorAll(".matrix-cell:not(.zero)").forEach((cell) => {
        cell.addEventListener("click", () => {
          jumpToExplorer({
            direction: cell.dataset.jumpDir,
            evidence: cell.dataset.jumpEv,
          });
        });
      });
    }

    // 2. Task x Integration Matrix
    const taskKeys = [
      "segmentation",
      "classification_or_detection",
      "reconstruction_or_enhancement",
      "quantitative_or_other_image_analysis",
      "registration",
      "image_fusion",
      "image_derived_outcome_prediction",
    ];
    const intKeys = [
      "backbone_level",
      "bottleneck_or_token_level",
      "physics_informed_or_INR",
      "task_specific_head",
    ];
    const intShort = {
      backbone_level: "A: Backbone",
      bottleneck_or_token_level: "B: Bottleneck",
      physics_informed_or_INR: "C: Physics/INR",
      task_specific_head: "D: Head",
    };

    let html2 = `<table class="matrix-table"><thead><tr><th class="row-head">${
      state.lang === "zh" ? "临床任务 \\ 位置" : "Primary Task \\ Module"
    }</th>`;
    intKeys.forEach((ik) => {
      html2 += `<th>${escHtml(intShort[ik])}</th>`;
    });
    html2 += `<th>${state.lang === "zh" ? "合计" : "Total"}</th></tr></thead><tbody>`;

    taskKeys.forEach((tk) => {
      const row = txI[tk] || {};
      const rSum = intKeys.reduce((a, ik) => a + (row[ik] || 0), 0);
      html2 += `<tr><th class="row-head">${escHtml(tr(LABELS.task[tk]))}</th>`;
      intKeys.forEach((ik) => {
        const v = row[ik] || 0;
        const alpha = v === 0 ? 0 : Math.min(0.42, 0.1 + v / 80);
        const bg = v === 0 ? "var(--bg-subtle)" : `rgba(13, 148, 136, ${alpha.toFixed(2)})`;
        html2 += `<td><div class="matrix-cell ${v === 0 ? "zero" : ""}" style="background:${bg}; padding:7px 5px;" data-jump-task="${tk}" data-jump-int="${ik}">${v}</div></td>`;
      });
      html2 += `<td><div class="matrix-cell" style="background:var(--bg-subtle); padding:7px 5px;" data-jump-task="${tk}" data-jump-int="all">${rSum}</div></td></tr>`;
    });
    html2 += `</tbody></table>`;

    const c2 = document.getElementById("taskIntegrationContainer");
    if (c2) {
      c2.innerHTML = html2;
      c2.querySelectorAll(".matrix-cell:not(.zero)").forEach((cell) => {
        cell.addEventListener("click", () => {
          jumpToExplorer({
            task: cell.dataset.jumpTask,
            integration: cell.dataset.jumpInt,
          });
        });
      });
    }

    // 3. Paradigm Cards
    const paradigms = [
      {
        key: "backbone_level",
        badge: "A",
        cls: "tag-A",
        count: 33,
        title: { en: "Backbone-Level Fusion", zh: "骨干级融合 (Backbone-Level)" },
        desc: {
          en: "Repeated KANConv or KAN-attention blocks reconstruct the primary encoder (e.g., MedViT V2, MedKAN, KACNet, DEQ-KAN). Highest compute/parameter burden; requires matched-budget ablations.",
          zh: "在主干编码器中重复使用 KANConv 或 KAN 注意力块（代表：MedViT V2, MedKAN, KACNet）。算力与参数负担最高，必须进行严格预算匹配的阶段消融。",
        },
      },
      {
        key: "bottleneck_or_token_level",
        badge: "B",
        cls: "tag-B",
        count: 84,
        title: { en: "Bottleneck / Token Fusion", zh: "瓶颈 / Token 级融合 (Bottleneck)" },
        desc: {
          en: "Preserves standard CNN/ViT encoder and inserts KAN into low-resolution U-shaped bottlenecks, skip-fusions, or latent tokens (e.g., U-KAN, KM-UNet, UKAN-EP). Most tractable local replacement.",
          zh: "保留成熟卷积/ViT 编码器，仅在低分辨率瓶颈层、跳跃连接或潜在 Token 处嵌入 KAN（代表：U-KAN, KM-UNet, UKAN-EP），最便于受控单模块替换。",
        },
      },
      {
        key: "physics_informed_or_INR",
        badge: "C",
        cls: "tag-C",
        count: 6,
        title: { en: "Physics-Informed & INR Modules", zh: "物理先验与隐式表征 (Physics/INR)" },
        desc: {
          en: "Embeds spectral or continuous-field priors into KAN edge bases under forward operators (e.g., CEST-LKAN, KAN-INR, Cheb-KAN, TC-KANRecon). Requires generic-spline and MLP-INR controls.",
          zh: "结合已知物理前向模型或连续形变场设计专属边基函数（代表：CEST-LKAN, KAN-INR, Cheb-KAN），需同时对比通用样条基与固定激活 MLP-INR。",
        },
      },
      {
        key: "task_specific_head",
        badge: "D",
        cls: "tag-D",
        count: 15,
        title: { en: "Task-Specific Functional Heads", zh: "任务特定函数预测头 (Task Heads)" },
        desc: {
          en: "Replaces only the terminal classification, regression, or survival risk head (e.g., CoxKAN, SBTAYLOR-KAN, KACQ-DCNN). Exposes inspectable curves that still require seed-stability and clinical validation.",
          zh: "冻结或保留主干特征提取器，仅替换末端分类、回归或生存风险预测头（代表：CoxKAN, SBTAYLOR-KAN），其符号曲线仍需跨随机种子稳定性与临床验证。",
        },
      },
    ];

    const pc = document.getElementById("paradigmCardsContainer");
    if (pc) {
      pc.innerHTML = paradigms
        .map(
          (p) => `<div class="paradigm-card" data-int="${p.key}">
          <div class="paradigm-head">
            <span class="paradigm-tag ${p.cls}">Mechanism ${p.badge}</span>
            <span style="font-family:var(--font-mono); font-size:0.82rem; font-weight:700; color:var(--text-muted);">n = ${p.count}</span>
          </div>
          <h3 style="margin:0 0 6px; font-size:1rem;">${escHtml(tr(p.title))}</h3>
          <p style="margin:0; font-size:0.81rem; color:var(--text-secondary);">${escHtml(tr(p.desc))}</p>
        </div>`
        )
        .join("");
      pc.querySelectorAll(".paradigm-card").forEach((el) => {
        el.addEventListener("click", () => jumpToExplorer({ integration: el.dataset.int }));
      });
    }

    // 4. PRISMA Trail + S3/S4 Accordion
    const pr = SUMMARY.prisma || {};
    const queries = SUMMARY.search_queries || [];
    const exReasons = (SUMMARY.counts || {}).title_abstract_exclusion_reasons || {};

    const steps = [
      {
        num: "5,108",
        t: { en: "Database Records", zh: "四大库原始命中" },
        d: { en: "Crossref 800 · EPMC 360 · arXiv 670 · OpenAlex 3,278", zh: "Crossref 800 · EPMC 360 · arXiv 670 · OpenAlex 3,278" },
      },
      {
        num: "3,029",
        t: { en: "Unique Screened (S4)", zh: "去重后初筛台账 (S4)" },
        d: { en: "2,079 duplicates removed in 2 passes; 2,886 excluded at T/A", zh: "两轮去重移除 2,079 条；题录摘要初筛排除 2,886 条" },
      },
      {
        num: "162",
        t: { en: "Reports Sought (S2)", zh: "进入全文获取 (S2)" },
        d: { en: "143 from DBs + 19 via local library & citation tracking", zh: "数据库 143 篇 + 本地文献库与引文追踪补充 19 篇" },
      },
      {
        num: "160",
        t: { en: "Full-Text Assessed", zh: "完成全文/记录评估" },
        d: { en: "2 not retrieved; 17 excluded after record/full-text audit", zh: "2 篇无法获取全文；17 篇经全文核查后按规则排除" },
      },
      {
        num: "138",
        t: { en: "Strict Evidence Set (S1)", zh: "最终独立研究集 (S1)" },
        d: { en: "143 eligible reports consolidated (5 companions) → 127 Tier A + 11 Tier B", zh: "合并 5 篇同实验预印本/会议版本 → 127 项 Tier A + 11 项 Tier B" },
      },
    ];

    const prismaEl = document.getElementById("prismaContainer");
    if (prismaEl) {
      const qRows = queries
        .map(
          (q) =>
            `<tr><td><strong>${escHtml(q.source)}</strong> (#${escHtml(q.query_number_within_source)})</td><td style="font-family:var(--font-mono); font-size:0.76rem;">${escHtml(
              q.exact_query
            )}</td><td>${escHtml(q.date_restriction_or_postprocessing)}</td><td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${escHtml(
              q.records_entering_database_total
            )}</td></tr>`
        )
        .join("");

      const exRows = Object.entries(exReasons)
        .map(
          ([reason, cnt]) =>
            `<tr><td>${escHtml(reason)}</td><td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${cnt}</td></tr>`
        )
        .join("");

      prismaEl.innerHTML = `
        <div class="prisma-flow">
          ${steps
            .map(
              (s) => `<div class="prisma-step">
              <div class="prisma-num">${s.num}</div>
              <div class="prisma-title">${escHtml(tr(s.t))}</div>
              <div class="prisma-desc">${escHtml(tr(s.d))}</div>
            </div>`
            )
            .join("")}
        </div>
        <details style="margin-top:14px;">
          <summary style="cursor:pointer; font-weight:700; font-size:0.84rem; color:var(--primary);">${
            state.lang === "zh"
              ? "展开查看：表 S3 四大文献库精确检索式 & 表 S4 初筛排除原因统计 (n = 2,886)"
              : "Inspect Exact Search Queries (Table S3) & Title/Abstract Exclusion Breakdown (Table S4, n = 2,886)"
          }</summary>
          <div style="margin-top:12px; overflow-x:auto;">
            <table class="matrix-table" style="text-align:left; border-spacing:0; border-collapse:collapse;">
              <thead><tr style="border-bottom:1px solid var(--border-strong);">
                <th style="text-align:left; padding:8px;">Source</th>
                <th style="text-align:left; padding:8px;">Exact Query</th>
                <th style="text-align:left; padding:8px;">Date / Post-processing</th>
                <th style="text-align:right; padding:8px;">Records</th>
              </tr></thead>
              <tbody>${qRows}</tbody>
            </table>
          </div>
          <div style="margin-top:12px; overflow-x:auto;">
            <table class="matrix-table" style="text-align:left; border-spacing:0; border-collapse:collapse;">
              <thead><tr style="border-bottom:1px solid var(--border-strong);">
                <th style="text-align:left; padding:8px;">Title/Abstract Exclusion Reason (Supplementary Table S4)</th>
                <th style="text-align:right; padding:8px;">Excluded Count</th>
              </tr></thead>
              <tbody>${exRows}</tbody>
            </table>
          </div>
        </details>
      `;
    }
  }

  function jumpToExplorer(opts) {
    state.filters = {
      q: "",
      task: opts.task || "all",
      integration: opts.integration || "all",
      evidence: opts.evidence || "all",
      direction: opts.direction || "all",
      modality: "all",
      yearTier: "all",
      preset: "custom",
    };
    syncFilterControlsFromState();
    renderPresetChips();
    renderStudyList();
    switchTab("explorer");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* -------------------- TAB 2: 138-Study Explorer -------------------- */
  function populateFilterOptions() {
    const allTxt = state.lang === "zh" ? "全部 (All)" : "All";

    function fillSelect(id, options, currentVal) {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = options
        .map((o) => `<option value="${escHtml(o.value)}">${escHtml(o.label)}</option>`)
        .join("");
      el.value = currentVal;
    }

    fillSelect(
      "filterTask",
      [{ value: "all", label: `${allTxt} (138)` }].concat(
        Object.keys(LABELS.task).map((k) => ({
          value: k,
          label: `${tr(LABELS.task[k])} (${STUDIES.filter((s) => s.task === k).length})`,
        }))
      ),
      state.filters.task
    );

    fillSelect(
      "filterIntegration",
      [{ value: "all", label: `${allTxt} (138)` }].concat(
        Object.keys(LABELS.integration).map((k) => ({
          value: k,
          label: `${tr(LABELS.integration[k])} (${STUDIES.filter((s) => s.integration === k).length})`,
        }))
      ),
      state.filters.integration
    );

    fillSelect(
      "filterEvidence",
      [
        { value: "all", label: `${allTxt} (138)` },
        { value: "B_moderate", label: `${tr(LABELS.evidence.B_moderate)} (48)` },
        { value: "C_weak_compound", label: `${tr(LABELS.evidence.C_weak_compound)} (46)` },
        { value: "D_insufficient", label: `${tr(LABELS.evidence.D_insufficient)} (44)` },
      ],
      state.filters.evidence
    );

    fillSelect(
      "filterDirection",
      [{ value: "all", label: `${allTxt} (138)` }].concat(
        Object.keys(LABELS.direction).map((k) => ({
          value: k,
          label: `${tr(LABELS.direction[k])} (${STUDIES.filter((s) => s.direction === k).length})`,
        }))
      ),
      state.filters.direction
    );

    const modSet = [
      "MRI / fMRI / CEST",
      "CT / CBCT / PET",
      "Ultrasound",
      "Pathology / Microscopy",
      "Endoscopy",
      "Dermoscopy / Skin",
      "X-Ray / Radiography",
      "OCT / Ophthalmic",
      "Other / Unspecified",
    ];
    fillSelect(
      "filterModality",
      [{ value: "all", label: allTxt }].concat(
        modSet.map((m) => ({
          value: m,
          label: `${m} (${STUDIES.filter((s) => (s.modality_tags || []).includes(m)).length})`,
        }))
      ),
      state.filters.modality
    );

    fillSelect(
      "filterYearTier",
      [
        { value: "all", label: allTxt },
        { value: "year:2026", label: "2026 Jan–Feb (17)" },
        { value: "year:2025", label: "2025 (107)" },
        { value: "year:2024", label: "2024 (14)" },
        { value: "tier:Tier A", label: "Tier A: Direct Imaging (127)" },
        { value: "tier:Tier B", label: "Tier B: Image-Derived (11)" },
      ],
      state.filters.yearTier
    );
  }

  function syncFilterControlsFromState() {
    const si = document.getElementById("searchInput");
    if (si) si.value = state.filters.q;
    ["Task", "Integration", "Evidence", "Direction", "Modality", "YearTier"].forEach((name) => {
      const el = document.getElementById(`filter${name}`);
      const key = name.charAt(0).toLowerCase() + name.slice(1);
      if (el) el.value = state.filters[key];
    });
  }

  function renderPresetChips() {
    const presets = [
      { id: "all", en: "All Studies (138)", zh: "全部研究 (138)" },
      { id: "fav_mod", en: "Favorable + Moderate KAN Evidence (28)", zh: "全模型占优 + 中等独立证据 (28)" },
      { id: "physics_inr", en: "Physics-Informed / INR (6)", zh: "物理先验与隐式场 INR (6)" },
      { id: "confounded_fav", en: "Favorable Headline, Weak/Insuf. Attribution (40)", zh: "表面占优但归因混杂/不足 (40)" },
      { id: "tradeoffs", en: "Mixed / Trade-offs / Null Counterexamples (34)", zh: "权衡折中与无增益反例 (34)" },
      { id: "manual_qa", en: "Full-Text Manual QA Reconciled (72)", zh: "全文逐字段人工核验集 (72)" },
    ];
    const wrap = document.getElementById("presetChips");
    if (!wrap) return;
    wrap.innerHTML = presets
      .map(
        (p) =>
          `<button class="chip ${state.filters.preset === p.id ? "active" : ""}" data-preset="${p.id}">${escHtml(
            p[state.lang]
          )}</button>`
      )
      .join("");
    wrap.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        const pid = btn.dataset.preset;
        state.filters = {
          q: "",
          task: "all",
          integration: pid === "physics_inr" ? "physics_informed_or_INR" : "all",
          evidence: pid === "fav_mod" ? "B_moderate" : "all",
          direction: pid === "fav_mod" ? "favorable_full_model" : "all",
          modality: "all",
          yearTier: "all",
          preset: pid,
        };
        syncFilterControlsFromState();
        renderPresetChips();
        renderStudyList();
      });
    });
  }

  function getFilteredStudies() {
    const f = state.filters;
    const q = f.q.trim().toLowerCase();

    return STUDIES.filter((s) => {
      if (f.preset === "confounded_fav") {
        if (s.direction !== "favorable_full_model" || s.evidence_cat === "B_moderate") return false;
      } else if (f.preset === "tradeoffs") {
        if (s.direction !== "mixed_or_tradeoff" && s.direction !== "unfavorable_or_no_gain") return false;
      } else if (f.preset === "manual_qa") {
        if (!String(s.qa_status).includes("manual")) return false;
      }

      if (f.task !== "all" && s.task !== f.task) return false;
      if (f.integration !== "all" && s.integration !== f.integration) return false;
      if (f.evidence !== "all" && s.evidence_cat !== f.evidence) return false;
      if (f.direction !== "all" && s.direction !== f.direction) return false;
      if (f.modality !== "all" && !(s.modality_tags || []).includes(f.modality)) return false;

      if (f.yearTier.startsWith("year:")) {
        if (String(s.year) !== f.yearTier.split(":")[1]) return false;
      } else if (f.yearTier.startsWith("tier:")) {
        if (s.tier !== f.yearTier.split(":")[1]) return false;
      }

      if (q) {
        const hay = [
          s.id,
          s.title,
          s.model_tag,
          s.formal_id,
          s.modality,
          s.datasets,
          s.kan_role,
          s.results,
          s.limitations,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderStudyList() {
    const filtered = getFilteredStudies();
    const countEl = document.getElementById("resultsCountText");
    if (countEl) {
      countEl.textContent =
        state.lang === "zh"
          ? `当前显示 ${filtered.length} / ${STUDIES.length} 项独立研究`
          : `Showing ${filtered.length} of ${STUDIES.length} independent studies`;
    }

    const container = document.getElementById("studyListContainer");
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `<div class="card" style="grid-column:1/-1; text-align:center; padding:36px;">
        <p style="margin:0; font-size:0.95rem; color:var(--text-muted);">${
          state.lang === "zh"
            ? "未找到匹配当前筛选条件的研究，请点击“重置筛选”放宽条件。"
            : "No studies match the current filters. Click 'Reset Filters' to broaden your search."
        }</p>
      </div>`;
      return;
    }

    const intTagClass = {
      backbone_level: "tag-A",
      bottleneck_or_token_level: "tag-B",
      physics_informed_or_INR: "tag-C",
      task_specific_head: "tag-D",
    };
    const evClass = {
      B_moderate: "ev-B",
      C_weak_compound: "ev-C",
      D_insufficient: "ev-D",
    };
    const dirClass = {
      favorable_full_model: "dir-fav",
      mixed_or_tradeoff: "dir-mix",
      unfavorable_or_no_gain: "dir-unfav",
      indeterminate_or_not_comparable: "dir-ind",
    };

    container.innerHTML = filtered
      .map((s) => {
        const shortEv =
          s.evidence_cat === "B_moderate"
            ? "Cat. B (Moderate)"
            : s.evidence_cat === "C_weak_compound"
            ? "Cat. C (Compound)"
            : "Cat. D (Insufficient)";
        return `<article class="study-card">
          <div>
            <div class="study-meta-top">
              <span class="study-id">${escHtml(s.id)} · ${s.year} · ${escHtml(s.tier)}</span>
              <span class="paradigm-tag ${intTagClass[s.integration] || "tag-B"}">${escHtml(
          tr(LABELS.integration[s.integration])
        )}</span>
            </div>
            <h3 class="study-title">${escHtml(s.title)}</h3>
            <div class="badge-row" style="margin-bottom:8px;">
              <span class="badge" style="background:var(--bg-subtle); color:var(--text-secondary);">${escHtml(
                tr(LABELS.task[s.task])
              )}</span>
              <span class="badge ${dirClass[s.direction] || "dir-ind"}">${escHtml(
          tr(LABELS.direction[s.direction])
        )}</span>
              <span class="badge ${evClass[s.evidence_cat] || "ev-D"}">${shortEv}</span>
            </div>
            <div style="font-size:0.76rem; color:var(--text-muted); margin-bottom:6px;">
              <strong>${state.lang === "zh" ? "模态：" : "Modality:"}</strong> ${escHtml(s.modality)}
            </div>
            <div class="study-snippet">${escHtml(s.kan_role)}</div>
          </div>
          <div class="study-footer">
            <button class="btn-outline inspect-btn" data-id="${escHtml(s.id)}" style="padding:5px 10px; font-size:0.76rem;">
              ${state.lang === "zh" ? "查看完整审计详情" : "Inspect Audit Record"}
            </button>
            ${
              s.url
                ? `<a href="${escHtml(s.url)}" target="_blank" rel="noopener" style="font-family:var(--font-mono); font-size:0.75rem;">${escHtml(
                    s.formal_id.length > 26 ? s.formal_id.slice(0, 24) + "…" : s.formal_id
                  )} ↗</a>`
                : ""
            }
          </div>
        </article>`;
      })
      .join("");

    container.querySelectorAll(".inspect-btn").forEach((btn) => {
      btn.addEventListener("click", () => openStudyModal(btn.dataset.id));
    });
  }

  function openStudyModal(studyId) {
    const s = STUDIES.find((x) => x.id === studyId);
    if (!s) return;
    const modal = document.getElementById("studyModal");
    const head = document.getElementById("studyModalHeader");
    const body = document.getElementById("studyModalBody");
    if (!modal || !head || !body) return;

    head.innerHTML = `
      <div style="font-family:var(--font-mono); font-size:0.76rem; color:var(--primary); font-weight:700; margin-bottom:4px;">
        ${escHtml(s.id)} (Report ${escHtml(s.report_id)}) · ${s.year} · ${escHtml(s.tier)} · ${escHtml(s.pub_status)}
      </div>
      <h3 style="margin:0 0 8px; font-size:1.15rem;">${escHtml(s.title)}</h3>
      <div class="badge-row">
        <span class="badge" style="background:var(--primary-soft); color:var(--primary);">${escHtml(
          tr(LABELS.integration[s.integration])
        )}</span>
        <span class="badge" style="background:var(--bg-subtle); color:var(--text);">${escHtml(
          tr(LABELS.task[s.task])
        )}</span>
        <span class="badge ev-B">${escHtml(tr(LABELS.evidence[s.evidence_cat]))}</span>
        <span class="badge dir-fav">${escHtml(tr(LABELS.direction[s.direction]))}</span>
        ${
          s.url
            ? `<a href="${escHtml(s.url)}" target="_blank" rel="noopener" class="btn-primary-sm" style="padding:3px 10px; font-size:0.75rem;">Open Source (${escHtml(
                s.formal_id
              )}) ↗</a>`
            : ""
        }
      </div>
    `;

    const fields = [
      [state.lang === "zh" ? "成像模态与数据集样本" : "Imaging Modality & Datasets / Sample", `${s.modality}\n\n${s.datasets}`],
      [state.lang === "zh" ? "KAN 机制角色与结构融合依据" : "KAN Method / Role & Taxonomy Basis", `${s.kan_role}\n\n[Assignment basis (${s.taxonomy_confidence} confidence)]: ${s.taxonomy_basis}`],
      [state.lang === "zh" ? "基线对比与消融设计证据" : "Baseline & Comparison Evidence", s.comparison],
      [state.lang === "zh" ? "主要报告结果（原文口径）" : "Primary Reported Results", s.results],
      [state.lang === "zh" ? "KAN 独立贡献等级判定依据" : "KAN-Specific Contribution Classification Basis", s.evidence_basis],
      [state.lang === "zh" ? "综述审稿级局限性与偏倚风险" : "Review-Level Risk & Attribution Limitations", s.limitations],
      [
        state.lang === "zh" ? "审计溯源元数据" : "Audit Trail Metadata",
        `Identification route: ${s.route} | Extraction QA: ${s.qa_status} | Companion reports: ${s.companions || "None"}`,
      ],
    ];

    body.innerHTML = fields
      .map(
        ([label, val]) => `<div class="detail-block">
        <h4>${escHtml(label)}</h4>
        <p>${escHtml(val)}</p>
      </div>`
      )
      .join("");

    modal.classList.add("open");
  }

  function exportFiltered(format) {
    const rows = getFilteredStudies();
    let content = "";
    let mime = "text/plain;charset=utf-8";
    let ext = format;

    if (format === "json") {
      content = JSON.stringify(rows, null, 2);
      mime = "application/json;charset=utf-8";
    } else {
      const cols = [
        "id",
        "year",
        "tier",
        "task_label",
        "integration_label",
        "evidence_cat",
        "direction",
        "modality",
        "formal_id",
        "url",
        "title",
        "datasets",
        "results",
        "limitations",
      ];
      const csvEscape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
      content = [cols.join(",")]
        .concat(rows.map((r) => cols.map((c) => csvEscape(r[c])).join(",")))
        .join("\n");
      mime = "text/csv;charset=utf-8";
    }

    const blob = new Blob([content], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `KAN_MedIA_Filtered_${rows.length}_Studies.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  /* -------------------- TAB 3: KAN Edge-Basis Sandbox -------------------- */
  const BASIS_DEFS = {
    bspline: {
      name: { en: "B-Spline + SiLU Residual (Original KAN / U-KAN)", zh: "B-样条 + SiLU 残差基 (原始 KAN / U-KAN)" },
      sub: { en: "Local grid support · flexible 1D shape fitting", zh: "局部网格支撑 · 灵活拟合任意一维非线性曲线" },
      formula: "φ(x) = ω_b · SiLU(x) + ω_s · Σᵢ λᵢ Bᵢ,ₚ(x)",
      note: {
        en: "<strong>Medical Imaging Context (U-KAN, KACNet):</strong> Local B-spline bases allow compact latent-token nonlinearities, but dense spline evaluation lacks cuDNN-level kernel fusion and adds grid/order hyperparameters. Always test KAN-only replacement at matched parameter &amp; FLOP budgets.",
        zh: "<strong>医学影像语境（U-KAN, KACNet）：</strong>B-样条具备局部支撑特性，适合低分辨率瓶颈层特征重标定；但高维特征上逐边计算样条缺乏底层算子融合，显存访问开销较大，需与同预算 MLP/卷积对比。",
      },
    },
    lorentzian: {
      name: { en: "Lorentzian Spectral Basis (CEST-LKAN)", zh: "Lorentzian 洛伦兹谱线基 (CEST-LKAN)" },
      sub: { en: "Physics-aligned resonance line shapes for CEST-MRI", zh: "对齐化学交换饱和转移磁共振 (CEST-MRI) 物理共振线型" },
      formula: "φ(x) = Σₘ Aₘ · (Γₘ / 2)² / [ (x − δₘ)² + (Γₘ / 2)² ]",
      note: {
        en: "<strong>Medical Imaging Context (Wang et al., 2025 — CEST-LKAN):</strong> Aligning KAN edge bases directly with physical Lorentzian Z-spectrum pools reduced quantification test loss by 28%–32% and cut training time by ~37% vs. MLP baselines. Requires testing against both generic B-spline KAN and parameter-matched MLP.",
        zh: "<strong>医学影像语境（CEST-LKAN, MRM 2025）：</strong>将边函数直接设计为符合磁共振物理机制的洛伦兹线型，相比同规模 MLP 降低约 28%–32% 定量误差并缩短 37% 训练时间——展示了“明确函数先验”场景下 KAN 的核心价值。",
      },
    },
    chebyshev: {
      name: { en: "Chebyshev Polynomial Basis (Cheb-KAN / UNETVL)", zh: "Chebyshev 切比雪夫正交多项式基 (Cheb-KAN)" },
      sub: { en: "Global oscillatory basis · MRI Gibbs-ringing mitigation", zh: "全局正交高频表达 · 用于 MRI 重建伪影抑制与 3D 分割" },
      formula: "φ(x) = Σₖ₌₀ᴷ cₖ · Tₖ(tanh(x)),   Tₖ(u) = cos(k · arccos(u))",
      note: {
        en: "<strong>Medical Imaging Context (Penkin &amp; Krylov, 2024; UNETVL, 2025):</strong> Chebyshev-KAN bottlenecks in Res-CNNs reported faster convergence and improved Gibbs-ringing suppression on IXI brain MRI; however, in UNETVL 3D segmentation, adding Chebyshev KAN increased parameters from 94.96M to 158.61M.",
        zh: "<strong>医学影像语境（Cheb-KAN MRI 重建 / UNETVL）：</strong>切比雪夫多项式擅长表达高频振荡分量，在脑 MRI 去吉布斯伪影中收敛更快；但在 UNETVL 三维分割中参数量从 94.96M 增至 158.61M，提示必须同步报告参数与显存代价。",
      },
    },
    jacobi: {
      name: { en: "Jacobi Polynomial Basis (KAN-INR Registration)", zh: "Jacobi 雅可比多项式基 (KAN-INR 连续形变配准)" },
      sub: { en: "Tunable (α, β) orthogonality · 4D CT–CBCT velocity fields", zh: "可调 (α, β) 正交族 · 参数化四维 CT–CBCT 连续形变场" },
      formula: "φ(x) = Σₖ₌₀ᴷ cₖ · Pₖ^(α,β)(tanh(x))",
      note: {
        en: "<strong>Medical Imaging Context (Sun et al., 2025 — KAN-INR):</strong> Parameterizing continuous 4D deformation velocity fields with Jacobi-KAN within an implicit neural representation (INR) improved pelvic CT–CBCT registration accuracy over MLP-INR under smoothness regularization.",
        zh: "<strong>医学影像语境（KAN-INR 盆腔放疗配准）：</strong>在隐式神经表征（INR）中利用雅可比多项式参数化连续时间演化速度场，在保持形变平滑约束的同时优于传统固定激活 MLP-INR。",
      },
    },
    rbf: {
      name: { en: "Gaussian Radial Basis Functions (FastKAN)", zh: "Gaussian RBF 高斯径向基 (FastKAN 加速近似)" },
      sub: { en: "Approximates cubic B-splines with ~3× kernel speedup", zh: "以高斯核紧密近似三次 B-样条 · 评估速度提升约 3 倍" },
      formula: "φ(x) = ω_b · SiLU(x) + Σᵢ wᵢ · exp( −(x − cᵢ)² / (2h²) )",
      note: {
        en: "<strong>Engineering Boundary (Li, 2024b — FastKAN):</strong> Cubic B-spline KAN edges can be closely approximated by Gaussian radial basis functions with ~3× faster evaluation, showing that practical KANs behave closely to structured RBF networks rather than automatically escaping the curse of dimensionality.",
        zh: "<strong>工程边界启示（FastKAN, Section 5.1）：</strong>三次 B-样条边函数可被高斯径向基高精度近似并获得约 3 倍加速，说明现有 KAN 在函数族上与经典 RBF 网络高度相通，并不能凭定理自动绕开高维样本复杂度瓶颈。",
      },
    },
  };

  function renderBasisSelector() {
    const el = document.getElementById("basisSelector");
    if (!el) return;
    el.innerHTML = Object.entries(BASIS_DEFS)
      .map(
        ([key, def]) => `<button class="basis-btn ${state.sandbox.basis === key ? "active" : ""}" data-basis="${key}">
        <strong>${escHtml(tr(def.name))}</strong>
        <span>${escHtml(tr(def.sub))}</span>
      </button>`
      )
      .join("");
    el.querySelectorAll(".basis-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.sandbox.basis = btn.dataset.basis;
        renderBasisSelector();
        renderSandboxControls();
        drawSandbox();
      });
    });
  }

  function renderSandboxControls() {
    const wrap = document.getElementById("sandboxControls");
    if (!wrap) return;
    const b = state.sandbox.basis;
    let sliders = [];

    if (b === "bspline") {
      sliders = [
        { key: "G", label: state.lang === "zh" ? "网格区间数 G" : "Grid Intervals G", min: 3, max: 14, step: 1 },
        { key: "order", label: state.lang === "zh" ? "样条阶数 p" : "Spline Order p", min: 1, max: 4, step: 1 },
        { key: "omegaB", label: state.lang === "zh" ? "残差 SiLU 权重 ω_b" : "Residual SiLU Weight ω_b", min: 0, max: 1.2, step: 0.05 },
        { key: "omegaS", label: state.lang === "zh" ? "样条权重 ω_s" : "Spline Weight ω_s", min: 0.2, max: 1.8, step: 0.05 },
      ];
    } else if (b === "lorentzian") {
      sliders = [
        { key: "G", label: state.lang === "zh" ? "共振池数量 M" : "Spectral Pools M", min: 1, max: 5, step: 1 },
        { key: "gamma", label: state.lang === "zh" ? "半高全宽 Γ (线宽)" : "Linewidth Γ", min: 0.15, max: 1.1, step: 0.05 },
        { key: "shift", label: state.lang === "zh" ? "化学位移间隔 δ" : "Pool Shift Spacing δ", min: 0.1, max: 0.9, step: 0.05 },
      ];
    } else if (b === "chebyshev") {
      sliders = [
        { key: "G", label: state.lang === "zh" ? "多项式最高阶数 K" : "Max Polynomial Degree K", min: 2, max: 10, step: 1 },
        { key: "omegaS", label: state.lang === "zh" ? "高频幅值增益" : "Amplitude Gain", min: 0.3, max: 1.6, step: 0.05 },
      ];
    } else if (b === "jacobi") {
      sliders = [
        { key: "G", label: state.lang === "zh" ? "雅可比阶数 K" : "Jacobi Degree K", min: 2, max: 8, step: 1 },
        { key: "alpha", label: "Shape Parameter α", min: -0.5, max: 2.0, step: 0.1 },
        { key: "beta", label: "Shape Parameter β", min: -0.5, max: 2.0, step: 0.1 },
      ];
    } else if (b === "rbf") {
      sliders = [
        { key: "G", label: state.lang === "zh" ? "高斯中心数量 G" : "RBF Centers G", min: 3, max: 14, step: 1 },
        { key: "bw", label: state.lang === "zh" ? "核带宽 h" : "Kernel Bandwidth h", min: 0.18, max: 0.95, step: 0.03 },
        { key: "omegaB", label: state.lang === "zh" ? "残差 SiLU 权重 ω_b" : "Residual SiLU Weight ω_b", min: 0, max: 1.0, step: 0.05 },
      ];
    }

    wrap.innerHTML = sliders
      .map(
        (sl) => `<div class="slider-row">
        <label><span>${escHtml(sl.label)}</span><span id="lbl_${sl.key}">${state.sandbox[sl.key]}</span></label>
        <input type="range" data-skey="${sl.key}" min="${sl.min}" max="${sl.max}" step="${sl.step}" value="${state.sandbox[sl.key]}" />
      </div>`
      )
      .join("");

    wrap.querySelectorAll("input[type='range']").forEach((inp) => {
      inp.addEventListener("input", () => {
        const k = inp.dataset.skey;
        state.sandbox[k] = parseFloat(inp.value);
        const sp = document.getElementById(`lbl_${k}`);
        if (sp) sp.textContent = state.sandbox[k];
        drawSandbox();
      });
    });

    const def = BASIS_DEFS[b];
    const fBox = document.getElementById("basisFormulaBox");
    if (fBox) fBox.textContent = def.formula;
    const noteBox = document.getElementById("basisClinicalNote");
    if (noteBox) noteBox.innerHTML = tr(def.note);
  }

  // Deterministic pseudo-coefficients with optional user seed perturbation
  function coeff(i) {
    const s = state.sandbox.seedOffset;
    return Math.sin((i + 1) * 1.73 + s * 2.41) * 0.85 + Math.cos((i + 2) * 0.91 - s * 1.37) * 0.35;
  }

  // Cox-de Boor B-spline basis evaluation on [-2.5, 2.5]
  function evalBSplineBasis(x, i, p, knots) {
    if (p === 0) {
      return x >= knots[i] && x < knots[i + 1] ? 1.0 : 0.0;
    }
    const d1 = knots[i + p] - knots[i];
    const d2 = knots[i + p + 1] - knots[i + 1];
    const t1 = d1 > 1e-8 ? ((x - knots[i]) / d1) * evalBSplineBasis(x, i, p - 1, knots) : 0.0;
    const t2 = d2 > 1e-8 ? ((knots[i + p + 1] - x) / d2) * evalBSplineBasis(x, i + 1, p - 1, knots) : 0.0;
    return t1 + t2;
  }

  function evalJacobi(n, alpha, beta, u) {
    if (n === 0) return 1.0;
    if (n === 1) return 0.5 * (2 * (alpha + 1) + (alpha + beta + 2) * (u - 1));
    let pPrev2 = 1.0;
    let pPrev1 = 0.5 * (2 * (alpha + 1) + (alpha + beta + 2) * (u - 1));
    let pCur = pPrev1;
    for (let k = 2; k <= n; k++) {
      const denom = 2 * k * (k + alpha + beta) * (2 * k + alpha + beta - 2);
      const a1 = (2 * k + alpha + beta - 1) * ((2 * k + alpha + beta) * (2 * k + alpha + beta - 2) * u + alpha * alpha - beta * beta);
      const a2 = 2 * (k + alpha - 1) * (k + beta - 1) * (2 * k + alpha + beta);
      pCur = (a1 * pPrev1 - a2 * pPrev2) / denom;
      pPrev2 = pPrev1;
      pPrev1 = pCur;
    }
    return pCur;
  }

  function silu(x) {
    return x / (1 + Math.exp(-x));
  }
  function gelu(x) {
    return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x * x * x)));
  }

  function evaluateSandboxAtX(xs) {
    const sb = state.sandbox;
    const b = sb.basis;
    const components = [];
    const total = new Array(xs.length).fill(0);

    if (b === "bspline") {
      const G = Math.round(sb.G);
      const p = Math.round(sb.order);
      const xMin = -2.5,
        xMax = 2.5;
      const h = (xMax - xMin) / G;
      const knots = [];
      for (let k = -p; k <= G + p; k++) knots.push(xMin + k * h);
      const nBasis = G + p;
      for (let i = 0; i < nBasis; i++) {
        const lam = coeff(i) * sb.omegaS;
        const comp = xs.map((x) => lam * evalBSplineBasis(x, i, p, knots));
        components.push(comp);
        for (let j = 0; j < xs.length; j++) total[j] += comp[j];
      }
      for (let j = 0; j < xs.length; j++) total[j] += sb.omegaB * silu(xs[j]);
    } else if (b === "lorentzian") {
      const M = Math.round(sb.G);
      const g2 = Math.pow(sb.gamma / 2, 2);
      for (let m = 0; m < M; m++) {
        const center = (m - (M - 1) / 2) * (sb.shift * 2.1);
        const amp = (m === Math.floor(M / 2) ? -1.35 : 0.85 * coeff(m));
        const comp = xs.map((x) => (amp * g2) / (Math.pow(x - center, 2) + g2));
        components.push(comp);
        for (let j = 0; j < xs.length; j++) total[j] += comp[j];
      }
    } else if (b === "chebyshev") {
      const K = Math.round(sb.G);
      for (let k = 1; k <= K; k++) {
        const ck = (coeff(k) * sb.omegaS) / Math.sqrt(k);
        const comp = xs.map((x) => {
          const u = Math.max(-0.9999, Math.min(0.9999, Math.tanh(0.65 * x)));
          return ck * Math.cos(k * Math.acos(u));
        });
        components.push(comp);
        for (let j = 0; j < xs.length; j++) total[j] += comp[j];
      }
    } else if (b === "jacobi") {
      const K = Math.round(sb.G);
      for (let k = 1; k <= K; k++) {
        const ck = (coeff(k) * 0.65) / k;
        const comp = xs.map((x) => ck * evalJacobi(k, sb.alpha, sb.beta, Math.tanh(0.6 * x)));
        components.push(comp);
        for (let j = 0; j < xs.length; j++) total[j] += comp[j];
      }
    } else if (b === "rbf") {
      const G = Math.round(sb.G);
      for (let i = 0; i < G; i++) {
        const ci = -2.2 + (4.4 * i) / Math.max(1, G - 1);
        const wi = coeff(i);
        const comp = xs.map((x) => wi * Math.exp(-Math.pow(x - ci, 2) / (2 * sb.bw * sb.bw)));
        components.push(comp);
        for (let j = 0; j < xs.length; j++) total[j] += comp[j];
      }
      for (let j = 0; j < xs.length; j++) total[j] += sb.omegaB * silu(xs[j]);
    }

    return { components, total };
  }

  function drawSandbox() {
    const canvas = document.getElementById("basisCanvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const W = Math.max(320, rect.width || 720);
    const H = 340;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const isDark = state.theme === "dark";
    ctx.clearRect(0, 0, W, H);

    const pad = { l: 46, r: 22, t: 22, b: 34 };
    const pw = W - pad.l - pad.r;
    const ph = H - pad.t - pad.b;

    const N = 220;
    const xMin = -2.5,
      xMax = 2.5;
    const xs = [];
    for (let i = 0; i < N; i++) xs.push(xMin + ((xMax - xMin) * i) / (N - 1));

    const { components, total } = evaluateSandboxAtX(xs);

    let yMaxAbs = 1.6;
    total.forEach((v) => {
      if (Math.abs(v) > yMaxAbs) yMaxAbs = Math.abs(v);
    });
    yMaxAbs = Math.min(4.0, Math.max(1.5, yMaxAbs * 1.15));

    const toX = (x) => pad.l + ((x - xMin) / (xMax - xMin)) * pw;
    const toY = (y) => pad.t + ((yMaxAbs - y) / (2 * yMaxAbs)) * ph;

    // Gridlines
    ctx.strokeStyle = isDark ? "rgba(148,163,184,0.16)" : "rgba(148,163,184,0.28)";
    ctx.lineWidth = 1;
    for (let gx = -2; gx <= 2; gx++) {
      const px = toX(gx);
      ctx.beginPath();
      ctx.moveTo(px, pad.t);
      ctx.lineTo(px, H - pad.b);
      ctx.stroke();
      ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText(gx.toFixed(0), px, H - 12);
    }

    [-1, 0, 1].forEach((gyFrac) => {
      const yVal = gyFrac * (yMaxAbs * 0.65);
      const py = toY(yVal);
      ctx.beginPath();
      ctx.moveTo(pad.l, py);
      ctx.lineTo(W - pad.r, py);
      ctx.stroke();
      ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
      ctx.font = "11px monospace";
      ctx.textAlign = "right";
      ctx.fillText(yVal.toFixed(1), pad.l - 7, py + 4);
    });

    // Zero axes
    ctx.strokeStyle = isDark ? "rgba(203,213,225,0.4)" : "rgba(71,85,105,0.45)";
    ctx.beginPath();
    ctx.moveTo(pad.l, toY(0));
    ctx.lineTo(W - pad.r, toY(0));
    ctx.stroke();

    // Individual basis components
    if (state.sandbox.showComponents) {
      components.forEach((comp, idx) => {
        const hue = (idx * 47 + 195) % 360;
        ctx.strokeStyle = `hsla(${hue}, 78%, ${isDark ? 64 : 46}%, 0.42)`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        comp.forEach((y, j) => {
          const px = toX(xs[j]),
            py = toY(y);
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      });
    }

    // Optional MLP node activation overlay
    if (state.sandbox.mlpOverlay !== "none") {
      ctx.strokeStyle = isDark ? "#f87171" : "#dc2626";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      ctx.beginPath();
      xs.forEach((x, j) => {
        let y = 0;
        if (state.sandbox.mlpOverlay === "relu") y = 0.75 * Math.max(0, x);
        else if (state.sandbox.mlpOverlay === "silu") y = 0.85 * silu(x);
        else if (state.sandbox.mlpOverlay === "gelu") y = 0.85 * gelu(x);
        const px = toX(x),
          py = toY(y);
        if (j === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Composite KAN Edge Function
    ctx.strokeStyle = isDark ? "#38bdf8" : "#0284c7";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    total.forEach((y, j) => {
      const px = toX(xs[j]),
        py = toY(y);
      if (j === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Legend inside top-left of canvas
    ctx.font = "bold 11.5px sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = isDark ? "#38bdf8" : "#0284c7";
    ctx.fillText("━━ KAN Edge φ(x)", pad.l + 10, pad.t + 16);
    if (state.sandbox.mlpOverlay !== "none") {
      ctx.fillStyle = isDark ? "#f87171" : "#dc2626";
      ctx.fillText(`┅┅ MLP (${state.sandbox.mlpOverlay.toUpperCase()})`, pad.l + 145, pad.t + 16);
    }
  }

  function updateComplexityEstimator() {
    const L = parseInt(document.getElementById("compL")?.value || "4", 10);
    const w = parseInt(document.getElementById("compW")?.value || "128", 10);
    const G = parseInt(document.getElementById("compG")?.value || "5", 10);
    const p = parseInt(document.getElementById("compP")?.value || "3", 10);

    document.getElementById("valCompL").textContent = L;
    document.getElementById("valCompW").textContent = w;
    document.getElementById("valCompG").textContent = G;
    document.getElementById("valCompP").textContent = p;

    const mlpParams = L * w * w;
    const kanFactor = G + p + 1; // +1 for residual/scale weight
    const kanParams = L * w * w * kanFactor;
    const matchedKanWidth = Math.max(4, Math.round(w / Math.sqrt(kanFactor)));

    const fmt = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : String(n));

    const el = document.getElementById("complexityStats");
    if (!el) return;
    el.innerHTML = `
      <div class="stat-tile">
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">MLP Parameters O(L·w²)</div>
        <div class="val">${fmt(mlpParams)}</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">Scalar weight per edge</div>
      </div>
      <div class="stat-tile">
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Dense KAN at Same Width</div>
        <div class="val" style="color:var(--accent-amber);">${fmt(kanParams)} (${kanFactor}×)</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">(G + p + 1) coefficients/edge</div>
      </div>
      <div class="stat-tile">
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700;">Param-Matched KAN Width</div>
        <div class="val" style="color:var(--accent-green);">w ≈ ${matchedKanWidth}</div>
        <div style="font-size:0.74rem; color:var(--text-secondary);">Required for fair budget control</div>
      </div>
    `;
  }

  /* -------------------- TAB 4: Study Designer & Checklist -------------------- */
  function renderAdvisor() {
    const scale = document.getElementById("advDataScale")?.value || "small";
    const prio = document.getElementById("advPriority")?.value || "transparency";
    const phys = document.getElementById("advPhysicsPrior")?.value || "yes";
    const lat = document.getElementById("advLatency3D")?.value || "strict";

    let activeQ = "q1";
    if (scale === "small" && prio === "transparency") activeQ = "q1";
    else if (scale === "large" && prio === "transparency") activeQ = "q2";
    else if (scale === "small" && prio === "performance") activeQ = "q3";
    else activeQ = "q4";

    const quads = [
      {
        id: "q1",
        t: { en: "Upper-Left: Physics KANs & Inspectable Heads", zh: "左上象限：物理约束 KAN 与可检查风险头" },
        d: { en: "Small data + high transparency / physics prior (C / D)", zh: "小样本 + 强物理先验或高可审计需求 (机制 C / D)" },
      },
      {
        id: "q2",
        t: { en: "Upper-Right: Local Hybrid KAN–CNN / KAN–ViT", zh: "右上象限：成熟主干上的局部混合替换" },
        d: { en: "Large scale + auditability / shift testing (A / B)", zh: "大规模数据 + 提升函数透明性或鲁棒性测试 (机制 B)" },
      },
      {
        id: "q3",
        t: { en: "Lower-Left: Lightweight Bottlenecks & Heads", zh: "左下象限：冻结/成熟骨干 + 轻量瓶颈或预测头" },
        d: { en: "Small data + performance goal on CNN/ViT (B / D)", zh: "小样本 + 性能目标（保持 CNN/ViT 不变，局部消融）" },
      },
      {
        id: "q4",
        t: { en: "Lower-Right: Optimized CNN / ViT Baseline", zh: "右下象限：优先保留优化版 CNN / Transformer" },
        d: { en: "Large well-labeled benchmark (nnU-Net, Swin UNETR)", zh: "大样本成熟基准（需预设非劣效或效率优势才引入 KAN）" },
      },
    ];

    const qGrid = document.getElementById("quadrantGrid");
    if (qGrid) {
      qGrid.innerHTML = quads
        .map(
          (q) => `<div class="quad-box ${q.id === activeQ ? "recommended" : ""}">
          <h4>${escHtml(tr(q.t))}</h4>
          <p>${escHtml(tr(q.d))}</p>
        </div>`
        )
        .join("");
    }

    const out = document.getElementById("advisorOutputCard");
    if (!out) return;

    const recs = {
      q1: {
        placement: phys === "yes" ? "Mechanism C (Physics-Informed / INR) or D (Task Head)" : "Mechanism D (Task-Specific Head)",
        exemplars: phys === "yes" ? "CEST-LKAN, KAN-INR, KAN-IDIR, Chebyshev-KAN" : "CoxKAN, SBTAYLOR-KAN, KACQ-DCNN",
        controls: {
          en: "Compare your domain-specific KAN basis against BOTH (1) a generic B-spline KAN at identical width and (2) a parameter-matched fixed-activation MLP/INR. Quantify curve/symbolic stability across >=5 random seeds and bootstrap resamples.",
          zh: "必须同时设置两组受控基线：(1) 同宽度的通用 B-样条 KAN 对照；(2) 参数量严格匹配的固定激活 MLP/INR。在宣称可解释前，必须检验边函数或符号公式在多随机种子与重采样下的数值保真度与稳定性。",
        },
      },
      q2: {
        placement: lat === "strict" ? "Mechanism B (Bottleneck / Token Fusion)" : "Mechanism B (Bottleneck) or Selective A (Hybrid Encoder)",
        exemplars: "U-KAN, UKAN-EP, MedViT V2, KACNet",
        controls: {
          en: "Insert KAN locally into a fixed CNN/ViT scaffold without simultaneously adding Mamba/attention blocks. Evaluate Expected Calibration Error (ECE), Brier score, and external-center shift alongside task metrics.",
          zh: "在固定 CNN/ViT 宿主架构内进行单一模块局部替换，切勿同时叠加注意力/Mamba 等混杂改动（避免落入 C 级弱证据）。需同步评估校准误差（ECE/Brier）与跨中心泛化退化。",
        },
      },
      q3: {
        placement: "Mechanism B (Low-Resolution Bottleneck) or D (Compact Head)",
        exemplars: "SBTAYLOR-KAN, Semi-KAN, U-KAN, KM-UNet",
        controls: {
          en: "Retain a pretrained or strong CNN/U-Net backbone and perform a matched component-removal ablation. Beware of overfitting: dense KAN edges have (G+p) more tunable coefficients per connection than scalar weights!",
          zh: "保留成熟预训练 CNN/U-Net 主干，通过受控移除/替换实验隔离 KAN 贡献。警惕过拟合风险：稠密 KAN 每条边含 O(G+p) 个可调系数，小样本下未必天然比 MLP 更省参数。",
        },
      },
      q4: {
        placement: "Retain Strong CNN / Transformer Primary Baseline (Optional Bounded B Test)",
        exemplars: "Controls: nnU-Net, Swin UNETR, ConvNeXt (vs. UNETVL / UKAN-EP)",
        controls: {
          en: "Do NOT replace a full high-resolution 3D backbone with KAN by default. Require a prespecified non-inferiority margin or measured latency/VRAM reduction on identical hardware after warm-up.",
          zh: "不建议直接用全量 KAN 替换成熟的 3D CNN/ViT 主干（如 nnU-Net、Swin UNETR）。除非在相同硬件预热测速下证明显著推理时延/显存收益，或通过严格预算匹配的增量检验。",
        },
      },
    };

    const cur = recs[activeQ];
    const latNote =
      lat === "strict"
        ? state.lang === "zh"
          ? "⚠️ <strong>三维/实时部署提示：</strong>避免在高分辨率浅层特征图重复调用未融合的样条算子，优先限制在低分辨率瓶颈层或末端预测头，并实测 GPU 峰值显存与预热后延迟。"
          : "⚠️ <strong>3D / Latency Constraint Note:</strong> Avoid unoptimized spline evaluations across high-resolution 3D encoder stages; restrict KAN to low-resolution latent bottlenecks or heads, and report warmed-up latency + peak VRAM."
        : state.lang === "zh"
        ? "💡 即使在 2D/离线场景，也请分别报告参数量、FLOPs、训练耗时与推理吞吐量。"
        : "💡 Even in 2D/offline settings, report parameter count, FLOPs, training time, and inference throughput separately.";

    out.innerHTML = `
      <div class="detail-grid">
        <div class="detail-block">
          <h4>${state.lang === "zh" ? "推荐集成机制" : "Recommended KAN Placement"}</h4>
          <p><strong>${escHtml(cur.placement)}</strong></p>
        </div>
        <div class="detail-block">
          <h4>${state.lang === "zh" ? "参考代表性工作" : "Reference Exemplars in Review"}</h4>
          <p style="font-family:var(--font-mono);">${escHtml(cur.exemplars)}</p>
        </div>
        <div class="detail-block">
          <h4>${state.lang === "zh" ? "强制性受控基线与消融要求（冲击 A/B 级归因证据）" : "Mandatory Control Arms (To Achieve Cat. A/B Evidence)"}</h4>
          <p>${escHtml(tr(cur.controls))}</p>
        </div>
        <div class="callout-banner" style="margin-top:0;">${latNote}</div>
      </div>
    `;
  }

  /* Normative 16-item Checklist from Section 4.4 */
  const CHECKLIST_ITEMS = [
    // Pillar 1
    { id: "c1", p: 1, critical: false, en: "Patient, volume/image, and clinical center counts explicitly disclosed", zh: "明确披露患者数、影像/体数据数量及临床中心数量" },
    { id: "c2", p: 1, critical: false, en: "Data split strictly at the patient level (no scan/slice leakage)", zh: "严格按患者级别（Patient-level）划分训练/验证/测试集，无切片泄漏" },
    { id: "c3", p: 1, critical: false, en: "Task metrics reported with uncertainty intervals or multi-seed SD", zh: "报告任务指标的置信区间或多次随机种子均值±标准差" },
    { id: "c4", p: 1, critical: false, en: "External-center or cross-scanner test included if generalization is claimed", zh: "若宣称泛化性提升，包含独立外部中心或跨设备验证集" },
    // Pillar 2 (Critical for KAN Evidence Grade!)
    { id: "c5", p: 2, critical: true, en: "Fixed-activation control (MLP/CNN) evaluated inside the exact same scaffold", zh: "在完全相同的宿主架构内设置固定激活函数对照（MLP/CNN）" },
    { id: "c6", p: 2, critical: true, en: "KAN-only ablation isolates KAN from attention/Mamba/loss co-modifications", zh: "提供单一变量 KAN 消融，将其与注意力/Mamba/损失函数等改动完全解耦" },
    { id: "c7", p: 2, critical: true, en: "Parameter count AND compute budget (FLOPs/MACs) matched in control comparison", zh: "对照实验匹配了可训练参数量与计算预算（冲击 A 级强归因核心项）" },
    { id: "c8", p: 2, critical: false, en: "Edge basis family, grid/knots G, order p, initialization & regularization stated", zh: "完整披露边基函数族、网格/节点数 G、阶数 p、初始化及正则化策略" },
    // Pillar 3
    { id: "c9", p: 3, critical: false, en: "Probability calibration reported (Brier score + ECE with binning details)", zh: "报告概率校准指标（如 Brier 分数与明确分箱设置的 ECE）" },
    { id: "c10", p: 3, critical: false, en: "Predictive uncertainty evaluated against observed errors / risk-coverage", zh: "评估预测不确定性与真实错误率的关联（如风险-覆盖率曲线）" },
    { id: "c11", p: 3, critical: false, en: "Edge-function or symbolic formula fidelity to numerical model quantified", zh: "若提取边函数或符号公式，定量报告其对原数值模型的拟合保真度" },
    { id: "c12", p: 3, critical: false, en: "Stability of learned edge curves / symbolic forms verified across random seeds", zh: "验证边函数曲线或符号表达式在不同随机种子/重采样下的语义稳定性" },
    // Pillar 4
    { id: "c13", p: 4, critical: false, en: "Trainable parameters and FLOPs/MACs at exact input resolution reported", zh: "报告精确输入分辨率下的可训练参数量与 FLOPs / MACs" },
    { id: "c14", p: 4, critical: false, en: "Peak training & inference GPU memory (VRAM) and warmed-up latency measured", zh: "实测训练/推理峰值显存（VRAM）及预热后的真实推理延迟与吞吐量" },
    { id: "c15", p: 4, critical: false, en: "Hardware model, framework, numerical precision (FP32/AMP) & kernel type stated", zh: "注明硬件型号、深度学习框架、数值精度（FP32/AMP）及算子实现方式" },
    { id: "c16", p: 4, critical: false, en: "Source code, random seeds, configs, and split manifests publicly released", zh: "公开源代码、配置文件、随机种子及数据划分清单" },
  ];

  const PILLAR_TITLES = {
    1: { en: "Pillar 1 — Data & Patient-Level Task Performance", zh: "第一部分 — 数据规范与患者级任务性能" },
    2: { en: "Pillar 2 — Isolated KAN-Specific Contribution (Attribution Core)", zh: "第二部分 — KAN 独立贡献受控归因（核心判据）" },
    3: { en: "Pillar 3 — Reliability, Calibration & Functional Stability", zh: "第三部分 — 可靠性、概率校准与边函数稳定性" },
    4: { en: "Pillar 4 — Hardware Resources & Reproducibility", zh: "第四部分 — 硬件资源开销与可复现性" },
  };

  function renderChecklist() {
    const container = document.getElementById("checklistContainer");
    if (!container) return;

    let html = "";
    [1, 2, 3, 4].forEach((pNum) => {
      const pItems = CHECKLIST_ITEMS.filter((x) => x.p === pNum);
      html += `<div class="checklist-pillar">
        <div class="checklist-pillar-head">
          <span>${escHtml(tr(PILLAR_TITLES[pNum]))}</span>
          <span style="font-size:0.76rem; color:var(--text-muted);">${pItems.length} ${state.lang === "zh" ? "项" : "items"}</span>
        </div>`;
      pItems.forEach((item) => {
        const entry = state.checklist[item.id] || { checked: false, note: "" };
        html += `<div class="check-item">
          <input type="checkbox" data-cid="${item.id}" ${entry.checked ? "checked" : ""} />
          <div>
            <div class="check-item-title">${escHtml(item[state.lang])} ${
          item.critical ? '<span class="badge ev-B" style="font-size:0.66rem;">Core Attribution</span>' : ""
        }</div>
          </div>
          <input type="text" class="check-note" data-cnote="${item.id}" value="${escHtml(entry.note)}" placeholder="${
          state.lang === "zh" ? "选填：节号/数值说明" : "Optional: Sec/Table ref"
        }" />
        </div>`;
      });
      html += `</div>`;
    });

    container.innerHTML = html;

    container.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.cid;
        state.checklist[id] = state.checklist[id] || { checked: false, note: "" };
        state.checklist[id].checked = cb.checked;
        updateChecklistStatus();
      });
    });

    container.querySelectorAll("input.check-note").forEach((inp) => {
      inp.addEventListener("input", () => {
        const id = inp.dataset.cnote;
        state.checklist[id] = state.checklist[id] || { checked: false, note: "" };
        state.checklist[id].note = inp.value;
        updateChecklistStatus();
      });
    });

    updateChecklistStatus();
  }

  function buildChecklistMarkdown() {
    const title =
      document.getElementById("studyTitleInput")?.value.trim() || "Medical-Imaging KAN Study";
    const checkedCount = CHECKLIST_ITEMS.filter((i) => state.checklist[i.id]?.checked).length;

    const lines = [
      `### KAN-MedIA Standardized Evaluation & Reporting Checklist — *${title}*`,
      "",
      `> Generated following the four-part minimum reporting framework of **Bai, Cai, Yang, Lekadir, & Li (2026)**, *A review of Kolmogorov–Arnold networks for medical image analysis*, *Computerized Medical Imaging and Graphics*, 136, 102827 ([DOI: 10.1016/j.compmedimag.2026.102827](https://doi.org/10.1016/j.compmedimag.2026.102827)).`,
      "",
      `- **Items Fulfilled**: \`${checkedCount} / ${CHECKLIST_ITEMS.length}\``,
      "",
      "| Pillar | Criterion | Status | Study Reference / Notes |",
      "|:---|:---|:---:|:---|",
    ];

    CHECKLIST_ITEMS.forEach((item) => {
      const entry = state.checklist[item.id] || { checked: false, note: "" };
      const status = entry.checked ? "Yes" : "Pending / N.R.";
      const note = (entry.note || "—").replace(/\|/g, "\\|");
      lines.push(`| P${item.p} | ${item.en} | **${status}** | ${note} |`);
    });

    return lines.join("\n");
  }

  function updateChecklistStatus() {
    const total = CHECKLIST_ITEMS.length;
    const done = CHECKLIST_ITEMS.filter((i) => state.checklist[i.id]?.checked).length;
    const pct = Math.round((done / total) * 100);

    const pText = document.getElementById("checklistProgressText");
    if (pText) {
      pText.textContent =
        state.lang === "zh"
          ? `已满足 ${done} / ${total} 项报告规范 (${pct}%)`
          : `${done} / ${total} items reported (${pct}%)`;
    }
    const pBar = document.getElementById("checklistProgressBar");
    if (pBar) pBar.style.width = `${pct}%`;

    const c5 = !!state.checklist.c5?.checked;
    const c6 = !!state.checklist.c6?.checked;
    const c7 = !!state.checklist.c7?.checked;
    const c3 = !!state.checklist.c3?.checked;

    const badge = document.getElementById("predictedEvidenceBadge");
    if (badge) {
      if (c5 && c6 && c7 && c3) {
        badge.className = "badge dir-fav";
        badge.textContent =
          state.lang === "zh"
            ? "预期最高归因等级：Cat. A（强/受控析因证据）"
            : "Estimated Max Attribution Grade: Cat. A (Strong)";
      } else if (c5 && c6) {
        badge.className = "badge ev-B";
        badge.textContent =
          state.lang === "zh"
            ? "预期最高归因等级：Cat. B（中等/同架构替换消融）"
            : "Estimated Max Attribution Grade: Cat. B (Moderate)";
      } else if (done >= 4) {
        badge.className = "badge ev-C";
        badge.textContent =
          state.lang === "zh"
            ? "预期最高归因等级：Cat. C（弱/复合混杂证据 — 缺少 KAN 单一消融）"
            : "Estimated Max Attribution Grade: Cat. C (Weak/Compound)";
      } else {
        badge.className = "badge ev-D";
        badge.textContent =
          state.lang === "zh"
            ? "预期最高归因等级：Cat. D（归因证据不足）"
            : "Estimated Max Attribution Grade: Cat. D (Insufficient)";
      }
    }

    const preview = document.getElementById("checklistPreviewBox");
    if (preview) preview.textContent = buildChecklistMarkdown();
  }

  /* -------------------- Event Wiring & Init -------------------- */
  function bindEvents() {
    document.querySelectorAll(".nav-tab").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.getElementById("langToggle")?.addEventListener("click", () => {
      state.lang = state.lang === "en" ? "zh" : "en";
      localStorage.setItem("kan_lang", state.lang);
      applyLanguage();
    });

    document.getElementById("themeToggle")?.addEventListener("click", () => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("kan_theme", state.theme);
      applyTheme();
    });

    // Search & Filters
    document.getElementById("searchInput")?.addEventListener("input", (e) => {
      state.filters.q = e.target.value;
      state.filters.preset = "custom";
      renderPresetChips();
      renderStudyList();
    });

    [
      ["filterTask", "task"],
      ["filterIntegration", "integration"],
      ["filterEvidence", "evidence"],
      ["filterDirection", "direction"],
      ["filterModality", "modality"],
      ["filterYearTier", "yearTier"],
    ].forEach(([elId, key]) => {
      document.getElementById(elId)?.addEventListener("change", (e) => {
        state.filters[key] = e.target.value;
        state.filters.preset = "custom";
        renderPresetChips();
        renderStudyList();
      });
    });

    document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
      state.filters = {
        q: "",
        task: "all",
        integration: "all",
        evidence: "all",
        direction: "all",
        modality: "all",
        yearTier: "all",
        preset: "all",
      };
      syncFilterControlsFromState();
      renderPresetChips();
      renderStudyList();
    });

    document.getElementById("exportCsvBtn")?.addEventListener("click", () => exportFiltered("csv"));
    document.getElementById("exportJsonBtn")?.addEventListener("click", () => exportFiltered("json"));

    // Sandbox
    document.getElementById("mlpComparatorSelect")?.addEventListener("change", (e) => {
      state.sandbox.mlpOverlay = e.target.value;
      drawSandbox();
    });
    document.getElementById("showComponentsCheck")?.addEventListener("change", (e) => {
      state.sandbox.showComponents = e.target.checked;
      drawSandbox();
    });
    document.getElementById("perturbSeedBtn")?.addEventListener("click", () => {
      state.sandbox.seedOffset += 1;
      drawSandbox();
    });

    ["compL", "compW", "compG", "compP"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", updateComplexityEstimator);
    });

    window.addEventListener("resize", () => {
      if (state.activeTab === "sandbox") requestAnimationFrame(drawSandbox);
    });

    // Advisor
    ["advDataScale", "advPriority", "advPhysicsPrior", "advLatency3D"].forEach((id) => {
      document.getElementById(id)?.addEventListener("change", renderAdvisor);
    });

    // Checklist actions
    document.getElementById("studyTitleInput")?.addEventListener("input", updateChecklistStatus);
    document.getElementById("checkAllDemoBtn")?.addEventListener("click", () => {
      const demoNotes = {
        c1: "N=240 patients, 3 centers (Table 1)",
        c2: "Strict patient-level 5-fold split",
        c3: "Mean ± SD across 5 seeds + 95% bootstrap CI",
        c4: "Held-out Center C (Siemens 3T)",
        c5: "Matched Conv/MLP bottleneck in identical U-Net",
        c6: "Ablated KAN alone without attention changes (Table 3)",
        c7: "Params matched at 12.4M; FLOPs 18.2G vs 18.0G",
        c8: "Cubic B-spline (G=5, p=3), SiLU residual, L1=1e-4",
        c9: "ECE (15 bins) = 0.031, Brier = 0.048",
        c10: "Risk-coverage curve in Fig. 6",
        c11: "Symbolic R² = 0.97 vs numerical edge",
        c12: "Pairwise curve correlation r = 0.94 across 5 seeds",
        c13: "12.4M params, 18.2 GFLOPs @ 256×256",
        c14: "Peak VRAM 4.8 GB; warmed-up latency 9.4 ms (RTX 4090)",
        c15: "PyTorch 2.4, FP16 AMP, custom CUDA spline kernel",
        c16: "GitHub repo + split JSONs + fixed seeds",
      };
      CHECKLIST_ITEMS.forEach((it) => {
        state.checklist[it.id] = { checked: true, note: demoNotes[it.id] || "" };
      });
      renderChecklist();
    });

    document.getElementById("clearChecklistBtn")?.addEventListener("click", () => {
      state.checklist = {};
      renderChecklist();
    });

    document.getElementById("copyChecklistMdBtn")?.addEventListener("click", (e) => {
      navigator.clipboard.writeText(buildChecklistMarkdown());
      const orig = e.target.textContent;
      e.target.textContent = state.lang === "zh" ? "✅ 已复制 Markdown！" : "✅ Copied Markdown!";
      setTimeout(() => (e.target.textContent = orig), 1800);
    });

    document.getElementById("downloadChecklistMdBtn")?.addEventListener("click", () => {
      const md = buildChecklistMarkdown();
      const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "KAN_MedIA_Reporting_Checklist.md";
      document.body.appendChild(a);
      a.click();
      a.remove();
    });

    // Modals
    const studyModal = document.getElementById("studyModal");
    document.getElementById("studyModalClose")?.addEventListener("click", () => studyModal?.classList.remove("open"));
    studyModal?.addEventListener("click", (e) => {
      if (e.target === studyModal) studyModal.classList.remove("open");
    });

    const citeModal = document.getElementById("citeModal");
    document.getElementById("citeBtn")?.addEventListener("click", () => citeModal?.classList.add("open"));
    document.getElementById("citeModalClose")?.addEventListener("click", () => citeModal?.classList.remove("open"));
    citeModal?.addEventListener("click", (e) => {
      if (e.target === citeModal) citeModal.classList.remove("open");
    });

    document.getElementById("copyBibtexBtn")?.addEventListener("click", (e) => {
      const bib = document.getElementById("bibtexPre")?.textContent || "";
      navigator.clipboard.writeText(bib);
      const orig = e.target.textContent;
      e.target.textContent = "✅ Copied BibTeX!";
      setTimeout(() => (e.target.textContent = orig), 1600);
    });

    document.getElementById("copyApaBtn")?.addEventListener("click", (e) => {
      const apa =
        "Bai, J., Cai, Z., Yang, R., Lekadir, K., & Li, S. (2026). A review of Kolmogorov–Arnold networks for medical image analysis. Computerized Medical Imaging and Graphics, 136, 102827. https://doi.org/10.1016/j.compmedimag.2026.102827";
      navigator.clipboard.writeText(apa);
      const orig = e.target.textContent;
      e.target.textContent = "✅ Copied APA!";
      setTimeout(() => (e.target.textContent = orig), 1600);
    });
  }

  applyTheme();
  bindEvents();
  applyLanguage();
})();
