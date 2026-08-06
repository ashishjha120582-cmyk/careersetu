from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

from common import DATA_DIR, clean_text, infer_skills, load_existing


ENRICHED_PATH = DATA_DIR / "enriched_opportunities.json"


NOISE_PATTERNS = [
    r"\bposted\s+\d+\s+(years?|months?|days?)\s+ago\b",
    r"\bposted\s+on\b.*",
    r"\bread more\.{0,3}\b",
    r"\bcall\s+or\s+whatsapp\b.*",
    r"\bcontact\s*(hr)?\b.*",
    r"\bmail your resumes?\b.*",
    r"\bjob type:\b.*",
    r"\bwork location:\b.*",
]


ROLE_TASKS = {
    "office_computer": [
        "Maintain records and update data accurately.",
        "Use basic computer tools such as email, MS Office, spreadsheets, or company software.",
        "Prepare simple reports and support day-to-day office work.",
        "Coordinate with team members or customers when information is missing.",
    ],
    "sales_service": [
        "Speak with customers and understand their requirements.",
        "Explain products or services clearly.",
        "Follow up with leads, customers, or support requests.",
        "Maintain basic records of calls, visits, or customer interactions.",
    ],
    "logistics": [
        "Sort, pack, scan, or move goods as per process.",
        "Support dispatch, delivery, or warehouse operations.",
        "Keep basic records of inventory or packages.",
        "Follow safety and timing instructions from supervisors.",
    ],
    "technical_trade": [
        "Assist with repair, installation, maintenance, or technical support work.",
        "Use tools safely under supervision.",
        "Follow workplace safety practices.",
        "Learn job-specific technical tasks from senior technicians.",
    ],
    "financial_services": [
        "Help customers with banking, finance, KYC, account, or service queries.",
        "Use basic computer or digital systems for records and transactions.",
        "Explain services in simple language.",
        "Maintain accuracy while handling customer information.",
    ],
    "govt_exam": [
        "Prepare for the exam syllabus and eligibility process.",
        "Track official notifications, dates, and application steps.",
        "Practice reasoning, maths, language, and general awareness.",
        "Keep documents ready for application and verification.",
    ],
    "general_entry_level": [
        "Handle basic operational tasks assigned by the employer.",
        "Learn workplace process through training or supervision.",
        "Maintain discipline, timing, and communication.",
        "Build job-specific skills while working.",
    ],
}


def clean_description(text: str) -> str:
    value = clean_text(text)
    value = re.sub(r"\*\*|###|\\-", " ", value)
    value = re.sub(r"₹", "Rs ", value)
    for pattern in NOISE_PATTERNS:
        value = re.sub(pattern, " ", value, flags=re.IGNORECASE)
    value = re.sub(r"\b\d{10}\b", " ", value)
    return clean_text(value)


def extract_pay(text: str, fallback: str = "") -> str:
    if fallback:
        return fallback
    match = re.search(r"(?:rs\.?|₹)\s*[\d,]+(?:\s*(?:-|to)\s*(?:rs\.?|₹)?\s*[\d,]+)?", text, flags=re.IGNORECASE)
    return clean_text(match.group(0).replace("₹", "Rs ")) if match else ""


def extract_tasks(record: dict[str, Any]) -> list[str]:
    description = clean_description(record.get("description", ""))
    category = record.get("category") or "general_entry_level"
    tasks = []

    sentences = re.split(r"(?<=[.!?])\s+|\s+\*\s+", description)
    for sentence in sentences:
        item = clean_text(sentence)
        if len(item) < 28:
            continue
        if re.search(r"\b(age|salary|pay|qualification|minimum|benefits|male|female|resume|email)\b", item, flags=re.IGNORECASE):
            continue
        if re.search(r"\b(handle|maintain|enter|update|prepare|support|assist|coordinate|speak|explain|sort|pack|scan|repair|install|operate|call|customer)\b", item, flags=re.IGNORECASE):
            tasks.append(item[:180])
        if len(tasks) >= 4:
            break

    if len(tasks) < 3:
        for task in ROLE_TASKS.get(category, ROLE_TASKS["general_entry_level"]):
            if task not in tasks:
                tasks.append(task)
            if len(tasks) >= 4:
                break
    return tasks[:4]


def extract_requirements(record: dict[str, Any]) -> list[str]:
    requirements = []
    education = record.get("min_education_hard")
    if education:
        requirements.append(f"Minimum education: {education}")
    for skill in record.get("skills_normalized", [])[:5]:
        requirements.append(f"Skill: {skill.replace('-', ' ').title()}")
    if record.get("experience_required"):
        requirements.append(f"Experience: {record['experience_required']}")
    return requirements[:6]


def roadmap(record: dict[str, Any]) -> list[dict[str, str]]:
    skills = [skill.replace("-", " ").title() for skill in record.get("skills_normalized", [])[:4]]
    category = record.get("category") or "general_entry_level"
    focus = ", ".join(skills) if skills else "the basic skills required for this role"
    return [
        {
            "title": "Understand the role",
            "description": f"Read the job details and confirm that {record.get('title', 'this role')} matches your work preference.",
        },
        {
            "title": "Build core skills",
            "description": f"Practice {focus}. Keep examples ready to show during application or interview.",
        },
        {
            "title": "Prepare application",
            "description": "Keep education proof, ID proof, phone number, email, and a simple resume ready.",
        },
        {
            "title": "Apply and follow up",
            "description": "Apply from the source link, track the employer response, and continue applying to similar roles.",
        },
    ]


def enrich_record(record: dict[str, Any]) -> dict[str, Any]:
    clean = clean_description(record.get("description", ""))
    skills = record.get("skills_normalized") or infer_skills(clean)
    enriched = {
        "id": record["id"],
        "summary": clean_text(clean[:360]),
        "daily_work": extract_tasks({**record, "description": clean, "skills_normalized": skills}),
        "requirements": extract_requirements({**record, "skills_normalized": skills}),
        "skills_must_have": skills[:1],
        "skills_good_to_have": skills[1:6],
        "pay": extract_pay(clean, record.get("salary_or_stipend", "")),
        "roadmap": roadmap({**record, "skills_normalized": skills}),
        "enrichment_method": "local_heuristic_v1",
    }
    return enriched


def main() -> None:
    records = load_existing()
    enriched = [enrich_record(record) for record in records]
    ENRICHED_PATH.write_text(json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(enriched)} enriched records to {ENRICHED_PATH}")


if __name__ == "__main__":
    main()
