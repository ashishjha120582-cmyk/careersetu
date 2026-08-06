from __future__ import annotations

import argparse
import re
from typing import Any

import requests
from bs4 import BeautifulSoup

from common import merge_records, normalize_record, is_entry_level, is_suspicious, clean_text


NCS_SEARCH_URL = "https://www.ncs.gov.in/job-seeker/Pages/Search.aspx"


def parse_ncs_cards(html: str) -> list[dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    lines = [clean_text(line) for line in soup.get_text("\n", strip=True).split("\n") if clean_text(line)]
    records: list[dict[str, Any]] = []
    labels = {"Company:", "Job Location:", "Salary:", "Skill Required:", "Job Description:", "Posted On"}
    i = 0

    def read_until(start: int, stop_labels: set[str]) -> tuple[str, int]:
        values: list[str] = []
        pos = start
        while pos < len(lines) and lines[pos] not in stop_labels:
            values.append(lines[pos])
            pos += 1
        return clean_text(" ".join(values)), pos

    while i < len(lines):
        if lines[i] != "Company:":
            i += 1
            continue

        title = lines[i - 1] if i > 0 else ""
        company, i = read_until(i + 1, {"Job Location:"})
        if i >= len(lines) or lines[i] != "Job Location:":
            continue
        location, i = read_until(i + 1, {"Salary:"})
        salary = ""
        skills = ""
        description = ""
        posted_date = ""
        if i < len(lines) and lines[i] == "Salary:":
            salary, i = read_until(i + 1, {"Skill Required:"})
        if i < len(lines) and lines[i] == "Skill Required:":
            skills, i = read_until(i + 1, {"Job Description:"})
        if i < len(lines) and lines[i] == "Job Description:":
            description, i = read_until(i + 1, {"Posted On"})
        if i < len(lines) and lines[i] == "Posted On":
            posted_date, i = read_until(i + 1, labels)

        record = normalize_record(
            {
                "title": title,
                "source_type": "private_job",
                "source_name": "NCS",
                "source_url": NCS_SEARCH_URL,
                "organization": company,
                "location": location,
                "salary_or_stipend": salary,
                "skills_raw": skills,
                "description": description,
                "posted_date": posted_date,
                "apply_url": NCS_SEARCH_URL,
                "confidence": "medium",
                "raw": {"source": "ncs_public_search"},
            }
        )
        if is_entry_level(record) and not is_suspicious(record):
            records.append(record)
    return records


def fetch_ncs(keyword: str, timeout: int = 30, verify: bool = True) -> str:
    # NCS renders useful first-page listings into the public HTML. Query parameters
    # may change, so this intentionally starts with the stable search page.
    response = requests.get(
        NCS_SEARCH_URL,
        params={"keyword": keyword} if keyword else None,
        headers={"User-Agent": "CareerSetuResearch/0.1"},
        timeout=timeout,
        verify=verify,
    )
    response.raise_for_status()
    return response.text


def scrape_ncs(keyword: str = "", limit: int = 50, insecure: bool = False) -> list[dict[str, Any]]:
    html = fetch_ncs(keyword, verify=not insecure)
    return parse_ncs_cards(html)[:limit]


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest public NCS job cards into normalized opportunities.json")
    parser.add_argument("--keyword", default="", help="Keyword to pass to NCS search page if supported")
    parser.add_argument("--limit", type=int, default=50)
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--insecure", action="store_true", help="Disable TLS verification for local scraping tests")
    args = parser.parse_args()

    records = scrape_ncs(args.keyword, limit=args.limit, insecure=args.insecure)
    if args.dry_run:
        print(f"Parsed {len(records)} NCS records")
        for record in records[:5]:
            print(f"- {record['title']} | {record['organization']} | {record['location']}")
        return

    merged = merge_records(records)
    print(f"Added/updated {len(records)} NCS records. Total opportunities: {len(merged)}")


if __name__ == "__main__":
    main()
