from __future__ import annotations

import argparse
import csv
from pathlib import Path
from typing import Any

import requests
from bs4 import BeautifulSoup

from common import merge_records, normalize_record, clean_text


APPRENTICESHIP_URL = "https://www.apprenticeshipindia.gov.in/candidate-opportunity"


def parse_export(path: Path) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for row in reader:
            title = row.get("title") or row.get("opportunity") or row.get("trade") or row.get("Trade")
            organization = row.get("organization") or row.get("establishment") or row.get("Establishment")
            location = row.get("location") or row.get("district") or row.get("state") or ""
            record = normalize_record(
                {
                    "title": title or "Apprenticeship Opportunity",
                    "source_type": "apprenticeship",
                    "source_name": "Apprenticeship India export",
                    "source_url": APPRENTICESHIP_URL,
                    "organization": organization,
                    "location": location,
                    "state": row.get("state") or row.get("State") or "",
                    "district": row.get("district") or row.get("District") or "",
                    "salary_or_stipend": row.get("stipend") or row.get("Stipend") or "",
                    "description": row.get("description") or row.get("Description") or "",
                    "skills_raw": row.get("skills") or row.get("Skills") or "",
                    "eligibility": row.get("eligibility") or row.get("Eligibility") or "",
                    "apply_url": row.get("apply_url") or row.get("url") or APPRENTICESHIP_URL,
                    "confidence": "medium",
                    "raw": row,
                }
            )
            records.append(record)
    return records


def fetch_public_page(timeout: int = 30, verify: bool = True) -> str:
    response = requests.get(
        APPRENTICESHIP_URL,
        headers={"User-Agent": "CareerSetuResearch/0.1"},
        timeout=timeout,
        verify=verify,
    )
    response.raise_for_status()
    return response.text


def parse_public_page(html: str) -> list[dict[str, Any]]:
    # The portal is app-like and may not expose cards in initial HTML. Keep this
    # parser conservative; use CSV/manual export when cards are not present.
    soup = BeautifulSoup(html, "html.parser")
    text = soup.get_text("\n", strip=True)
    records: list[dict[str, Any]] = []
    if "apprenticeship" in text.lower() and len(text) > 200:
        records.append(
            normalize_record(
                {
                    "title": "Apprenticeship India Opportunity Search",
                    "source_type": "apprenticeship",
                    "source_name": "Apprenticeship India",
                    "source_url": APPRENTICESHIP_URL,
                    "organization": "Apprenticeship India",
                    "location": "All India",
                    "description": "Use the official Apprenticeship India opportunity search for current trade and establishment openings.",
                    "apply_url": APPRENTICESHIP_URL,
                    "confidence": "low",
                    "raw": {"text_preview": text[:2000]},
                }
            )
        )
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest Apprenticeship India opportunities or CSV export")
    parser.add_argument("--csv", type=Path, help="CSV export/manual collection to normalize")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--insecure", action="store_true", help="Disable TLS verification for local scraping tests")
    args = parser.parse_args()

    if args.csv:
        records = parse_export(args.csv)
    else:
        records = parse_public_page(fetch_public_page(verify=not args.insecure))

    if args.dry_run:
        print(f"Parsed {len(records)} apprenticeship records")
        for record in records[:5]:
            print(f"- {record['title']} | {record['organization']} | {record['location']}")
        return

    merged = merge_records(records)
    print(f"Added/updated {len(records)} apprenticeship records. Total opportunities: {len(merged)}")


if __name__ == "__main__":
    main()
