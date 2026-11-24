#!/usr/bin/env python3
"""
Render original author vector PDFs from LATEX_SOURCE_FLAT.zip into high-DPI
Retina PNGs in assets/paper_figures/ and sync key figures to docs/assets/figures/.
Uses macOS native PDFKit/AppKit via /usr/bin/swift (zero third-party packages).
"""

import shutil
import subprocess
import tempfile
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ZIP_PATH = ROOT / "LATEX_SOURCE_FLAT.zip"
OUT_DIR = ROOT / "assets" / "paper_figures"
DOCS_FIG_DIR = ROOT / "docs" / "assets" / "figures"

SWIFT_RENDERER = r"""
import Foundation
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 4 else { exit(1) }
let inURL = URL(fileURLWithPath: args[1])
let outURL = URL(fileURLWithPath: args[2])
let targetWidth = CGFloat(Double(args[3]) ?? 2200.0)

guard let doc = PDFDocument(url: inURL), let page = doc.page(at: 0) else {
    fputs("Failed to open PDF: \(args[1])\n", stderr)
    exit(1)
}

let bounds = page.bounds(for: .cropBox)
let scale = targetWidth / bounds.width
let pixelW = Int((bounds.width * scale).rounded())
let pixelH = Int((bounds.height * scale).rounded())

guard let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: pixelW,
    pixelsHigh: pixelH,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .calibratedRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
) else { exit(1) }

NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
if let ctx = NSGraphicsContext.current?.cgContext {
    ctx.setFillColor(NSColor.white.cgColor)
    ctx.fill(CGRect(x: 0, y: 0, width: CGFloat(pixelW), height: CGFloat(pixelH)))
    ctx.interpolationQuality = .high
    ctx.setShouldAntialias(true)
    ctx.setAllowsAntialiasing(true)
    ctx.scaleBy(x: scale, y: scale)
    ctx.translateBy(x: -bounds.origin.x, y: -bounds.origin.y)
    page.draw(with: .cropBox, to: ctx)
}
NSGraphicsContext.restoreGraphicsState()

guard let pngData = rep.representation(using: .png, properties: [:]) else { exit(1) }
try pngData.write(to: outURL)
print("Rendered \(outURL.lastPathComponent): \(pixelW)x\(pixelH)")
"""

FIGURE_MAP = {
    "Figure1_PRISMA_127_11.pdf": ("fig1_prisma_flow.png", 2000),
    "Figure1_publication_trend.pdf": ("fig2_publication_trend.png", 1800),
    "Figure2_nested_donut.pdf": ("fig3_evidence_composition.png", 2000),
    "fig1.pdf": ("fig4_review_overview.png", 2400),
    "fig2.pdf": ("fig5_mlp_vs_kan.png", 1800),
    "fig3.pdf": ("fig6_kan_variants_streams.png", 2200),
    "fig4.pdf": ("fig7_pipeline_integration.png", 2400),
    "fig5.pdf": ("fig8_hypothesis_selection_map.png", 2200),
}

DOCS_SYNC = [
    "fig4_review_overview.png",
    "fig5_mlp_vs_kan.png",
    "fig7_pipeline_integration.png",
    "fig8_hypothesis_selection_map.png",
]


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    DOCS_FIG_DIR.mkdir(parents=True, exist_ok=True)

    if ZIP_PATH.exists() and shutil.which("swift"):
        with zipfile.ZipFile(ZIP_PATH, "r") as zf, tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            swift_file = tmp_path / "render.swift"
            swift_file.write_text(SWIFT_RENDERER, encoding="utf-8")
            for pdf_name, (png_name, width) in FIGURE_MAP.items():
                pdf_tmp = tmp_path / pdf_name
                pdf_tmp.write_bytes(zf.read(pdf_name))
                subprocess.run(
                    ["swift", str(swift_file), str(pdf_tmp), str(OUT_DIR / png_name), str(width)],
                    check=True,
                )
    else:
        print("LATEX_SOURCE_FLAT.zip or swift not found; keeping existing rendered PNGs in assets/paper_figures/.")

    for png_name in DOCS_SYNC:
        src = OUT_DIR / png_name
        if src.exists():
            shutil.copy2(src, DOCS_FIG_DIR / png_name)
            print(f"Synced {png_name} -> docs/assets/figures/")


if __name__ == "__main__":
    main()
