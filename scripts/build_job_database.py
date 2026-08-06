from __future__ import annotations

import argparse
import time
from collections import Counter

from common import load_existing, merge_records
from ingest_jobspy import scrape_with_jobspy
from ingest_ncs import scrape_ncs


STATE_LOCATIONS = [
    "Andhra Pradesh, India",
    "Arunachal Pradesh, India",
    "Assam, India",
    "Bihar, India",
    "Chhattisgarh, India",
    "Goa, India",
    "Gujarat, India",
    "Haryana, India",
    "Himachal Pradesh, India",
    "Jharkhand, India",
    "Karnataka, India",
    "Kerala, India",
    "Madhya Pradesh, India",
    "Maharashtra, India",
    "Manipur, India",
    "Meghalaya, India",
    "Mizoram, India",
    "Nagaland, India",
    "Odisha, India",
    "Punjab, India",
    "Rajasthan, India",
    "Sikkim, India",
    "Tamil Nadu, India",
    "Telangana, India",
    "Tripura, India",
    "Uttar Pradesh, India",
    "Uttarakhand, India",
    "West Bengal, India",
    "Delhi NCR, India",
]


SEARCH_TERMS = [
    "fresher",
    "data entry fresher",
    "back office fresher",
    "customer support fresher",
    "telecaller fresher",
    "retail sales fresher",
    "office assistant fresher",
    "computer operator fresher",
    "warehouse fresher",
    "delivery executive fresher",
    "field sales fresher",
    "electrician apprentice",
    "technician apprentice",
    "nursing assistant fresher",
    "lab assistant fresher",
]


NCS_SEARCH_TERMS = [
    "",
    "fresher",
    "data entry",
    "back office",
    "customer support",
    "telecaller",
    "retail",
    "warehouse",
    "delivery",
    "sales",
    "computer operator",
    "electrician",
    "technician",
    "apprentice",
]


def current_count() -> int:
    return len(load_existing())


def run_ncs_batch(target: int, results_per_query: int, delay: float, dry_run: bool, insecure: bool) -> None:
    for term in NCS_SEARCH_TERMS:
        if current_count() >= target:
            print(f"NCS target reached: {current_count()} records")
            return
        print(f"Fetching NCS: {term or '(default)'} | current={current_count()}")
        try:
            records = scrape_ncs(term, limit=results_per_query, insecure=insecure)
        except Exception as exc:
            print(f"  NCS failed: {exc}")
            continue
        if dry_run:
            print(f"  parsed={len(records)}")
        else:
            before = current_count()
            merged = merge_records(records)
            print(f"  parsed={len(records)} added={max(0, len(merged) - before)} total={len(merged)}")
        if delay:
            time.sleep(delay)


def run_jobspy_batch(target: int, results_per_query: int, delay: float, sites: list[str], dry_run: bool) -> None:
    total_new = 0
    failures: list[str] = []

    for location in STATE_LOCATIONS:
        for term in SEARCH_TERMS:
            count = current_count()
            if count >= target:
                print(f"JobSpy target reached: {count} records")
                return

            print(f"Fetching JobSpy: {term!r} | {location} | current={count}")
            try:
                records = scrape_with_jobspy(term, location, results_per_query, sites)
            except Exception as exc:
                failures.append(f"{term} | {location} | {exc}")
                print(f"  failed: {exc}")
                continue

            if dry_run:
                print(f"  parsed={len(records)}")
            else:
                before = len(load_existing())
                merged = merge_records(records)
                added = max(0, len(merged) - before)
                total_new += added
                by_category = Counter(record.get("category") for record in records)
                print(f"  parsed={len(records)} added={added} total={len(merged)} categories={dict(by_category)}")

            if delay:
                time.sleep(delay)

    print(f"Done. Added approximately {total_new} records.")
    if failures:
        print("Failures:")
        for failure in failures[:20]:
            print(f"- {failure}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build a 400-500 record entry-level job database through NCS and JobSpy")
    parser.add_argument("--source", choices=["ncs", "jobspy", "all"], default="all")
    parser.add_argument("--target", type=int, default=450)
    parser.add_argument("--ncs-target", type=int, default=150)
    parser.add_argument("--jobspy-target", type=int, default=400)
    parser.add_argument("--results-per-query", type=int, default=10)
    parser.add_argument("--delay", type=float, default=0.5)
    parser.add_argument("--sites", default="indeed")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--insecure", action="store_true", help="Disable TLS verification for NCS local tests")
    args = parser.parse_args()

    sites = [site.strip() for site in args.sites.split(",") if site.strip()]
    if args.source in {"ncs", "all"}:
        ncs_target = min(args.ncs_target, args.target)
        run_ncs_batch(ncs_target, args.results_per_query, args.delay, args.dry_run, args.insecure)
    if args.source in {"jobspy", "all"}:
        run_jobspy_batch(args.target if args.source == "all" else args.jobspy_target, args.results_per_query, args.delay, sites, args.dry_run)


if __name__ == "__main__":
    main()
