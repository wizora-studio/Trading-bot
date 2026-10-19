#!/usr/bin/env python3
"""Split docs/specs/MASTER_PROMPT.md into small spec files under docs/specs/.

Why: AGENTS.md tells every AI agent to read only the spec files a ticket needs
(Master Prompt, Section 3B.2). MASTER_PROMPT.md stays the single source of
truth; never edit the generated files by hand. Edit MASTER_PROMPT.md, then run:

    python3 scripts/split_master_prompt.py

Each entry below is (heading regex, output path). Headings are matched in
order, so a section ends where the next listed heading starts.
"""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "specs" / "MASTER_PROMPT.md"
OUT = ROOT / "docs" / "specs"

SECTIONS: list[tuple[str, str]] = [
    (r"^MASTER PROMPT v", "00-quick-start-and-toc.md"),
    (r"^0\. ABOUT ME", "00-about-me.md"),
    (r"^1\. YOUR ROLE", "01-role.md"),
    (r"^2\. PRODUCT VISION", "02-product-vision.md"),
    (r"^2B\. PRODUCT OPERATING MODEL", "02b-operating-model.md"),
    (r"^3\. NON-NEGOTIABLE", "03-working-rules.md"),
    (r"^3B\. AGENT-INDEPENDENT", "03b-agent-protocol.md"),
    (r"^3C\. ENGINEERING QUALITY", "03c-engineering-standards.md"),
    (r"^3D\. UI QUALITY", "03d-ui-standards.md"),
    (r"^PHASE 1 —", "phase-01/00-intro.md"),
    *[(rf"^Module {n}:", f"phase-01/module-{n:02d}.md") for n in range(1, 11)],
    (r"^DELIVERABLE FOR PHASE 1", "phase-01/deliverable.md"),
    (r"^PHASE 2 —", "phase-02-research.md"),
    (r"^PHASE 2B —", "phase-02b-customer-discovery.md"),
    (r"^PHASE 3 —", "phase-03/00-prd-overview.md"),
    (r"^App Navigation & Page Map", "phase-03/01-page-map.md"),
    (r"^Core Application Modules", "phase-03/module-a-auth.md"),
    (r"^B\. Trade Import", "phase-03/module-b-import.md"),
    (r"^C\. Main Analytics Dashboard", "phase-03/module-c-dashboard.md"),
    (r"^D\. Trade Explorer", "phase-03/module-d-trade-explorer.md"),
    (r"^E\. Strategy Library", "phase-03/module-e-strategies.md"),
    (r"^F\. Personal Risk", "phase-03/module-f-personal-risk.md"),
    (r"^G\. Account Setup & Rule Intake", "phase-03/module-g-rule-intake.md"),
    (r"^H\. Notifications", "phase-03/module-h-notifications.md"),
    (r"^I\. Sharing", "phase-03/module-i-sharing.md"),
    (r"^J\. Onboarding", "phase-03/module-j-onboarding.md"),
    (r"^K\. Localization", "phase-03/module-k-localization.md"),
    (r"^L\. Companion Chrome Extension", "phase-03/module-l-chrome-extension.md"),
    (r"^M\. Charts & Live Market", "phase-03/module-m-charts.md"),
    (r"^N\. Trading Room", "phase-03/module-n-trading-room.md"),
    (r"^O\. Trade Plan Builder", "phase-03/module-o-trade-plan-builder.md"),
    (r"^P\. Risk Model Library", "phase-03/module-p-risk-models.md"),
    (r"^PHASE 4 —", "phase-04-funded-rule-engine.md"),
    (r"^PHASE 5 —", "phase-05-math-engine.md"),
    (r"^PHASE 6 —", "phase-06-ai-engine.md"),
    (r"^PHASE 7 —", "phase-07-backtesting.md"),
    (r"^PHASE 8 —", "phase-08-architecture.md"),
    (r"^PHASE 9 —", "phase-09-ui-ux.md"),
    (r"^PHASE 10 —", "phase-10-security.md"),
    (r"^PHASE 11 —", "phase-11-testing.md"),
    (r"^PHASE 12 —", "phase-12-milestones.md"),
    (r"^PHASE 13 —", "phase-13-business.md"),
    (r"^PHASE 14 —", "phase-14-final-deliverables.md"),
    (r"^LAUNCH STRATEGY", "launch-strategy.md"),
    (r"^FINAL OPERATING INSTRUCTION", "final-operating-instruction.md"),
    (r"^APPENDIX A —", "appendix-a/00-intro.md"),
    (r"^PART A —", "appendix-a/part-a-verification-notes.md"),
    (r"^PART B —", "appendix-a/part-b-00-intro.md"),
    *[(rf"^S{n}\. ", f"appendix-a/part-b-s{n:02d}.md") for n in range(1, 21)],
    (r"^PART C —", "appendix-a/part-c-00-intro.md"),
    *[(rf"^R{n}\. ", f"appendix-a/part-c-r{n}.md") for n in range(1, 6)],
    (r"^PART D —", "appendix-a/part-d-reference-data.md"),
    (r"^PART E —", "appendix-a/part-e-source-references.md"),
    (r"^APPENDIX B —", "appendix-b-gemini-specs.md"),
]

BANNER = re.compile(r"^=+\s*$")


def find_starts(lines: list[str]) -> list[int]:
    """Return the 0-based start line of every section, in order."""
    starts: list[int] = []
    pos = 0
    for pattern, path in SECTIONS:
        rx = re.compile(pattern)
        for i in range(pos, len(lines)):
            if rx.match(lines[i]):
                starts.append(i)
                pos = i + 1
                break
        else:
            raise SystemExit(f"Heading not found for {path!r}: {pattern!r}")
    return starts


def main() -> None:
    lines = SRC.read_text(encoding="utf-8").splitlines()
    starts = find_starts(lines)
    index_rows: list[str] = []
    for n, (start, (_, rel)) in enumerate(zip(starts, SECTIONS)):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        body = [ln for ln in lines[start:end] if not BANNER.match(ln)]
        while body and not body[-1].strip():
            body.pop()
        title = body[0].strip()
        header = (
            f"<!-- Generated from docs/specs/MASTER_PROMPT.md lines {start + 1}-{end}. "
            "Do not edit; edit MASTER_PROMPT.md and run scripts/split_master_prompt.py. -->\n\n"
        )
        target = OUT / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(header + "\n".join(body) + "\n", encoding="utf-8")
        index_rows.append(f"| [{rel}]({rel}) | {title} |")

    readme = OUT / "README.md"
    readme.write_text(
        "# Spec index\n\n"
        "The full master prompt (v4.0) is [MASTER_PROMPT.md](MASTER_PROMPT.md). "
        "It is the single source of truth.\n"
        "The files below are generated from it by `scripts/split_master_prompt.py` "
        "so an agent can read only what a ticket needs. Do not edit them by hand.\n\n"
        "| File | Section |\n|---|---|\n" + "\n".join(index_rows) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(index_rows)} spec files and README.md")


if __name__ == "__main__":
    main()
