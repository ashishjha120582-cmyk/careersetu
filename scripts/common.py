from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from datetime import date
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
RAW_DIR = DATA_DIR / "raw"
OUTPUT_PATH = DATA_DIR / "opportunities.json"


ENTRY_LEVEL_NEGATIVE = [
    "manager",
    "senior",
    "lead",
    "head",
    "director",
    "architect",
    "principal",
    "10+ years",
    "8+ years",
    "5+ years",
]

SUSPICIOUS_TERMS = [
    "pencil packing",
    "pen packing",
    "natraj",
    "whatsapp",
    "call me",
    "registration fee",
    "advance payment",
    "pocket money",
    "work from anywhere",
    "female only",
    "personal secretary",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    if str(value).lower() in {"nan", "none", "nat"}:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def split_semicolon(value: str) -> list[str]:
    return [clean_text(part) for part in value.split(";") if clean_text(part)]


def stable_id(*parts: str) -> str:
    text = "|".join(clean_text(part).lower() for part in parts if part)
    digest = hashlib.sha1(text.encode("utf-8")).hexdigest()[:12]
    return f"opp_{digest}"


def json_safe(value: Any) -> Any:
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, dict):
        return {str(key): json_safe(item) for key, item in value.items()}
    if isinstance(value, list):
        return [json_safe(item) for item in value]
    if isinstance(value, tuple):
        return [json_safe(item) for item in value]
    try:
        import math

        if isinstance(value, float) and math.isnan(value):
            return None
    except Exception:
        pass
    return value


def infer_category(text: str) -> str:
    value = text.lower()
    if any(term in value for term in ["data entry", "back office", "computer operator", "excel", "accountant"]):
        return "office_computer"
    if any(term in value for term in ["sales", "retail", "telecaller", "customer", "call center", "bpo"]):
        return "sales_service"
    if any(term in value for term in ["delivery", "warehouse", "picker", "packer", "logistics"]):
        return "logistics"
    if any(term in value for term in ["electrician", "fitter", "welder", "technician", "mechanic", "solar"]):
        return "technical_trade"
    if any(term in value for term in ["bank", "kyc", "finance", "loan", "insurance"]):
        return "financial_services"
    if any(term in value for term in ["ssc", "railway", "rrb", "ibps", "government", "govt"]):
        return "govt_exam"
    return "general_entry_level"


def infer_skills(text: str) -> list[str]:
    value = text.lower()
    mapping = {
        "basic-computer": ["computer", "ms office", "word", "internet"],
        "excel": ["excel", "spreadsheet"],
        "typing": ["typing", "data entry"],
        "communication": ["communication", "spoken", "talk", "calling"],
        "customer-service": ["customer", "client", "support", "service"],
        "english-basics": ["english"],
        "basic-math": ["math", "calculation", "billing"],
        "digital-payments": ["kyc", "banking", "payment", "upi"],
        "sales": ["sales", "selling", "field sales"],
        "attention-detail": ["documentation", "verification", "records", "detail"],
        "electrical-basics": ["electrical", "electrician", "wiring"],
        "safety": ["safety"],
        "tools": ["tools"],
        "physical-stamina": ["warehouse", "loading", "delivery", "field work"],
    }
    skills: list[str] = []
    for skill, terms in mapping.items():
        if any(term in value for term in terms):
            skills.append(skill)
    return sorted(set(skills))


def infer_min_education(text: str) -> str:
    value = text.lower()
    if "iti" in value:
        return "ITI"
    if any(term in value for term in ["graduate", "graduation", "b.com", "b.a", "b.sc", "btech", "b.tech"]):
        return "graduate"
    if any(term in value for term in ["12th", "hs", "higher secondary", "intermediate"]):
        return "12th pass"
    if any(term in value for term in ["10th", "matric"]):
        return "10th pass"
    return "10th pass"


def is_entry_level(record: dict[str, Any]) -> bool:
    text = " ".join(
        clean_text(record.get(key))
        for key in ["title", "description", "eligibility", "experience_required", "skills_raw"]
    ).lower()
    return not any(term in text for term in ENTRY_LEVEL_NEGATIVE)


def is_suspicious(record: dict[str, Any]) -> bool:
    text = " ".join(
        clean_text(record.get(key))
        for key in ["title", "description", "eligibility", "organization", "skills_raw"]
    ).lower()
    has_phone = bool(re.search(r"\b[6-9]\d{9}\b", text))
    return has_phone or any(term in text for term in SUSPICIOUS_TERMS)


def normalize_record(raw: dict[str, Any]) -> dict[str, Any]:
    title = clean_text(raw.get("title"))
    organization = clean_text(raw.get("organization"))
    location = clean_text(raw.get("location"))
    description = clean_text(raw.get("description"))
    skills_raw = raw.get("skills_raw")
    if isinstance(skills_raw, list):
        skills_text = "; ".join(skills_raw)
    else:
        skills_text = clean_text(skills_raw)
    combined = " ".join([title, description, skills_text, clean_text(raw.get("eligibility"))])

    source_type = clean_text(raw.get("source_type")) or "private_job"
    source_name = clean_text(raw.get("source_name"))
    apply_url = clean_text(raw.get("apply_url"))

    return {
        "id": raw.get("id") or stable_id(source_name, title, organization, location, apply_url),
        "title": title,
        "source_type": source_type,
        "source_name": source_name,
        "source_url": clean_text(raw.get("source_url")) or apply_url,
        "organization": organization,
        "location": location,
        "state": clean_text(raw.get("state")),
        "district": clean_text(raw.get("district")),
        "min_education_hard": clean_text(raw.get("min_education_hard")) or infer_min_education(combined),
        "education_preferred": raw.get("education_preferred") or [],
        "experience_required": clean_text(raw.get("experience_required")) or "0-2 years / not clearly specified",
        "fresher_friendly": bool(raw.get("fresher_friendly", True)),
        "salary_or_stipend": clean_text(raw.get("salary_or_stipend")),
        "max_salary_monthly": raw.get("max_salary_monthly"),
        "last_date": clean_text(raw.get("last_date")),
        "posted_date": clean_text(raw.get("posted_date")),
        "description": description,
        "responsibilities": raw.get("responsibilities") or [],
        "eligibility": clean_text(raw.get("eligibility")),
        "skills_raw": split_semicolon(skills_text) if isinstance(skills_raw, str) else skills_raw or [],
        "skills_normalized": raw.get("skills_normalized") or infer_skills(combined),
        "documents_required": raw.get("documents_required") or [],
        "selection_process": clean_text(raw.get("selection_process")),
        "category": clean_text(raw.get("category")) or infer_category(combined),
        "apply_url": apply_url,
        "freshness_date": now_iso(),
        "confidence": clean_text(raw.get("confidence")) or "medium",
        "raw": json_safe(raw.get("raw", {})),
    }


def load_existing(path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def write_records(records: list[dict[str, Any]], path: Path = OUTPUT_PATH) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8")


def merge_records(new_records: list[dict[str, Any]], path: Path = OUTPUT_PATH) -> list[dict[str, Any]]:
    existing = load_existing(path)
    def merge_key(record: dict[str, Any]) -> str:
        url = clean_text(record.get("apply_url")) or clean_text(record.get("source_url"))
        generic_listing = any(marker in url.lower() for marker in ["search.aspx", "candidate-opportunity"])
        return url if url and not generic_listing else record["id"]

    by_id = {merge_key(record): record for record in existing}
    for record in new_records:
        by_id[merge_key(record)] = record
    merged = sorted(by_id.values(), key=lambda item: (item.get("source_name", ""), item.get("title", "")))
    write_records(merged, path)
    return merged
