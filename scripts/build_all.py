#!/usr/bin/env python3
"""Rebuild all portal JSON/JS datasets, 138-study catalog, paper figures, and SVG cards."""

import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent

for script in ["build_portal_data.py", "render_paper_figures.py", "generate_figures.py"]:
    print(f"==> Running {script} ...")
    subprocess.run([sys.executable, str(SCRIPTS_DIR / script)], check=True)

print("All companion repository assets successfully built!")
