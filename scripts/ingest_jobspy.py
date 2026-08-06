from __future__ import annotations

import argparse
from typing import Any

from common import merge_records, normalize_record, is_entry_level, clean_text


def scrape_with_jobspy(search_term: str, location: str, results: int, sites: list[str]) -> list[dict[str, Any]]:
    try:
        from jobspy import scrape_jobs
    except ModuleNotFoundError as exc:
        raise SystemExit(
            "JobSpy is not installed. Install it with: pip install -U python-jobspy"
        ) from exc

    jobs = scrape_jobs(
        site_name=sites,
        search_term=search_term,
        location=location,
        results_wanted=results,
        country_indeed="India",
        hours_old=168,
        description_format="markdown",
    )

    records: list[dict[str, Any]] = []
    for row in jobs.to_dict(orient="records"):
        title = clean_text(row.get("title"))
        company = clean_text(row.get("company"))
        city = clean_text(row.get("city"))
        state = clean_text(row.get("state"))
        location_text = clean_text(row.get("location")) or "; ".join(part for part in [city, state] if part)
        min_amount = row.get("min_amount")
        max_amount = row.get("max_amount")
        interval = clean_text(row.get("interval"))
        salary = ""
        if min_amount or max_amount:
            salary = f"{min_amount or ''} - {max_amount or ''} {interval}".strip()

        raw_skills = row.get("skills") or []
        record = normalize_record(
            {
                "title": title,
                "source_type": "private_job",
                "source_name": f"JobSpy/{clean_text(row.get('site'))}",
                "source_url": clean_text(row.get("job_url")),
                "organization": company,
                "location": location_text,
                "state": state,
                "salary_or_stipend": salary,
                "description": clean_text(row.get("description")),
                "skills_raw": raw_skills,
                "posted_date": clean_text(row.get("date_posted")),
                "apply_url": clean_text(row.get("job_url")),
                "confidence": "medium",
                "raw": row,
            }
        )
        if is_entry_level(record):
            records.append(record)
    return records


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest private jobs through JobSpy")
    parser.add_argument("--search", default="data entry fresher")
    parser.add_argument("--location", default="Kolkata, West Bengal")
    parser.add_argument("--results", type=int, default=25)
    parser.add_argument("--sites", default="indeed,google", help="Comma-separated JobSpy site names")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    sites = [site.strip() for site in args.sites.split(",") if site.strip()]
    records = scrape_with_jobspy(args.search, args.location, args.results, sites)
    if args.dry_run:
        print(f"Parsed {len(records)} JobSpy records")
        for record in records[:5]:
            print(f"- {record['title']} | {record['organization']} | {record['location']}")
        return

    merged = merge_records(records)
    print(f"Added/updated {len(records)} JobSpy records. Total opportunities: {len(merged)}")


if __name__ == "__main__":
    main()
