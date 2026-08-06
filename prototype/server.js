const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const projectRoot = path.resolve(__dirname, "..");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (!key || process.env[key] !== undefined) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvFile(path.join(projectRoot, ".env"));

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || "127.0.0.1";

const openRouterKey = process.env.OPENROUTER_API_KEY || "";
const chatModel = process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-4o-mini";
const guideModel = process.env.OPENROUTER_GUIDE_MODEL || "openai/gpt-4o";
const embeddingModel = process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small";
const sttModel = process.env.OPENROUTER_STT_MODEL || "openai/gpt-4o-transcribe";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 15_000_000) {
        reject(new Error("Request too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function fallbackGuide(payload) {
  const job = payload.job || {};
  const user = payload.userProfile || {};
  const targetLanguage = payload.targetLanguage || user.language || "en";
  const targetLanguageLabel = payload.targetLanguageLabel || targetLanguage;
  const known = new Set([...(user.skills || []), ...(payload.knownSkills || [])]);
  const must = job.skillsMustHave || [];
  const useful = job.skillsGoodToHave || [];
  const missing = [...must, ...useful].filter((skill) => !known.has(skill));
  const matched = [...must, ...useful].filter((skill) => known.has(skill));
  return {
    title: `${job.title || "This job"} readiness guide`,
    language: targetLanguage,
    target_language: targetLanguageLabel,
    readiness: must.some((skill) => !known.has(skill)) ? "Learn first" : "Can try now",
    summary:
      targetLanguage === "en"
        ? "This guide is based on the job requirements and the skills you shared."
        : `This guide should be shown in ${targetLanguageLabel}. Live translation needs OpenRouter access; this is the local fallback.`,
    matched_skills: matched,
    missing_skills: missing.slice(0, 6),
    learning_plan: missing.slice(0, 4).map((skill) => ({
      skill: skill.replaceAll("-", " "),
      how_to_learn: "Use free beginner videos, practice daily, and create a small example you can show."
    })),
    youtube_searches: missing.slice(0, 3).map((skill) => ({
      query: `${job.title || "entry level job"} ${skill.replaceAll("-", " ")} beginner practice`,
      why: "Use this to find beginner videos and practice examples."
    })),
    apply_checklist: ["Resume", "ID proof", "Education proof", "Phone number and email", "Source link opened"],
    english_guide: {
      summary: "This guide is based on the job requirements and the skills you shared.",
      employer_expectations: ["Understand the daily work clearly", "Show basic discipline and willingness to learn"],
      learn_before_applying: missing.slice(0, 3).map((skill) => skill.replaceAll("-", " ")),
      learn_on_the_job: ["Company process", "Product or service details", "Team-specific tools"],
      daily_work: [job.description || "Daily work is not clearly mentioned"],
      learning_plan: missing.slice(0, 4).map((skill) => ({
        skill: skill.replaceAll("-", " "),
        why_it_matters: "It is useful for this role.",
        how_to_learn: "Use free beginner videos, practice daily, and create a small example you can show.",
        practice_task: `Practice ${skill.replaceAll("-", " ")} for 30 minutes today.`
      })),
      youtube_searches: missing.slice(0, 3).map((skill) => ({
        query: `${job.title || "entry level job"} ${skill.replaceAll("-", " ")} beginner practice`,
        why: "Use this to find beginner videos and practice examples."
      })),
      interview_practice: ["Tell me about yourself for this role", "Why do you want this job?"],
      apply_checklist: ["Resume", "ID proof", "Education proof", "Phone number and email", "Source link opened"],
      questions_to_ask_employer: ["What training is provided?", "What are the daily working hours?"]
    },
    fallback: true
  };
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2);
}

function expandQuery(text) {
  const tokens = new Set(tokenize(text));
  const value = String(text || "").toLowerCase();
  const expansions = {
    computer: ["data", "entry", "back", "office", "operator", "admin", "assistant", "excel"],
    excel: ["spreadsheet", "billing", "reports", "mis", "office"],
    typing: ["data", "entry", "operator", "computer", "back", "office", "form", "filling", "typewriting"],
    typewriting: ["data", "entry", "operator", "computer", "back", "office"],
    talk: ["customer", "support", "sales", "telecaller", "bpo"],
    speaking: ["customer", "support", "sales", "telecaller", "bpo"],
    people: ["customer", "support", "sales", "retail"],
    hands: ["technician", "electrician", "warehouse", "mechanic"],
    electrical: ["electrician", "technician", "apprentice", "maintenance"],
    bank: ["finance", "kyc", "account", "customer"],
    btech: ["engineering", "engineer", "technical", "technician", "trainee", "junior", "maintenance", "quality", "site"],
    "b.tech": ["engineering", "engineer", "technical", "technician", "trainee", "junior", "maintenance", "quality", "site"],
    bcom: ["accounts", "accounting", "finance", "tally", "gst", "tds", "bookkeeping", "invoice", "billing", "commerce"],
    "b.com": ["accounts", "accounting", "finance", "tally", "gst", "tds", "bookkeeping", "invoice", "billing", "commerce"],
    bba: ["business", "sales", "operations", "admin", "management", "customer", "coordination"],
    bca: ["computer", "it", "software", "technical", "support", "data", "mis"]
  };
  for (const [key, terms] of Object.entries(expansions)) {
    if (value.includes(key)) terms.forEach((term) => tokens.add(term));
  }
  return [...tokens];
}

function localSemanticSearch(query) {
  const opportunitiesPath = path.join(projectRoot, "data", "opportunities.json");
  if (!fs.existsSync(opportunitiesPath)) return [];
  const terms = expandQuery(query);
  const records = JSON.parse(fs.readFileSync(opportunitiesPath, "utf8"));
  return records
    .map((record) => {
      const text = [
        record.title,
        record.organization,
        record.location,
        record.category,
        record.description,
        ...(record.skills_normalized || [])
      ]
        .join(" ")
        .toLowerCase();
      const hits = terms.filter((term) => text.includes(term));
      const score = terms.length ? new Set(hits).size / Math.max(4, terms.length) : 0;
      return { id: record.id, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
}

function isFetchFailure(error) {
  return error && (error.message === "fetch failed" || error.code || error.cause?.code);
}

function includesAnyLoose(text, terms) {
  return terms.some((term) => String(text || "").includes(term));
}

function normalizeLanguageCode(value = "") {
  const lower = String(value || "").toLowerCase().trim();
  const aliases = {
    hindi: "hi",
    hinglish: "hi",
    urdu: "ur",
    bengali: "bn",
    bangla: "bn",
    marathi: "mr",
    punjabi: "pa",
    gujarati: "gu",
    tamil: "ta",
    telugu: "te",
    kannada: "kn",
    malayalam: "ml",
    odia: "or",
    assamese: "as",
    english: "en"
  };
  return aliases[lower] || lower.slice(0, 2);
}

function canonicalizeDetectedLanguage(text, detectedLanguage, profileLanguage, fallbackLanguage, languageHint) {
  const value = String(text || "").toLowerCase();
  const compact = value.replace(/\s+/g, "");
  const detected = normalizeLanguageCode(detectedLanguage || profileLanguage || fallbackLanguage || languageHint || "en");
  const hint = normalizeLanguageCode(languageHint || "");
  const hasArabicScript = /[\u0600-\u06FF]/.test(value);
  const hasDevanagari = /[\u0900-\u097F]/.test(value);
  const explicitUrdu = hasArabicScript || /\burdu\b|اردو/i.test(value);
  const looksHindiRoman = /\b(main|mai|mein|mujhe|mera|meri|hoon|hu|hai|hain|barahvi|barhvi|12vi|rajasthan se|hindi)\b/i.test(value);
  const roughHindiCompact = /(barahvi|barhvi|rajasthanse|hindime|mujhe|main)/i.test(compact);

  if (explicitUrdu) return "ur";
  if (detected === "ur" && (hint === "hi" || fallbackLanguage === "hi" || hasDevanagari || looksHindiRoman || roughHindiCompact)) return "hi";
  if (!detected && (hasDevanagari || looksHindiRoman || roughHindiCompact)) return "hi";
  return detected || "en";
}

function fieldMentionedInText(text, value) {
  const haystack = String(text || "").toLowerCase();
  const needle = String(value || "").toLowerCase().trim();
  if (!needle) return false;
  return haystack.includes(needle) || haystack.includes(needle.replace(/\s+/g, ""));
}

function profileFieldMentioned(text, normalizedEnglish, value) {
  return fieldMentionedInText(`${text} ${normalizedEnglish || ""}`, value);
}

function fallbackNormalizeIntent(text) {
  const value = String(text || "").toLowerCase();
  const compact = value.replace(/\s+/g, "");
  const hasDevanagari = /[\u0900-\u097F]/.test(value);
  const hasGurmukhi = /[\u0A00-\u0A7F]/.test(value);
  const hasBengali = /[\u0980-\u09FF]/.test(value);
  const hasTamil = /[\u0B80-\u0BFF]/.test(value);
  const hasTelugu = /[\u0C00-\u0C7F]/.test(value);
  const hasKannada = /[\u0C80-\u0CFF]/.test(value);
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(value);
  const hasGujarati = /[\u0A80-\u0AFF]/.test(value);
  const hasOdia = /[\u0B00-\u0B7F]/.test(value);

  let detectedLanguage = "en";
  if (hasDevanagari) detectedLanguage = "hi";
  else if (hasGurmukhi) detectedLanguage = "pa";
  else if (hasBengali) detectedLanguage = "bn";
  else if (hasGujarati) detectedLanguage = "gu";
  else if (hasTamil) detectedLanguage = "ta";
  else if (hasTelugu) detectedLanguage = "te";
  else if (hasKannada) detectedLanguage = "kn";
  else if (hasMalayalam) detectedLanguage = "ml";
  else if (hasOdia) detectedLanguage = "or";

  const statePatterns = [
    ["Rajasthan", ["rajasthan", "rj", "राजस्थान", "रजसथन", "राजसथान", "राजस्थानसे", "रजसथनस"]],
    ["West Bengal", ["west bengal", "wb", "पश्चिमबंगाल", "bengal"]],
    ["Maharashtra", ["maharashtra", "mh", "महाराष्ट्र", "महरषटर"]],
    ["Bihar", ["bihar", "br", "बिहार"]],
    ["Uttar Pradesh", ["uttar pradesh", "up", "उत्तरप्रदेश"]],
    ["Karnataka", ["karnataka", "ka", "कर्नाटक"]],
    ["Gujarat", ["gujarat", "gj", "गुजरात"]],
    ["Haryana", ["haryana", "hr", "हरियाणा"]],
    ["Assam", ["assam", "as", "असम"]],
    ["Punjab", ["punjab", "pb", "पंजाब"]]
  ];

  const educationPatterns = [
    ["10th pass", ["10th", "class10", "दसवी", "दसवीं", "10वी", "10वीं"]],
    ["12th pass", ["12th", "class12", "बारहवी", "बारहवीं", "बरहव", "बरहवी", "12वी", "12वीं", "twelfth"]],
    ["ITI", ["iti", "आईटीआई"]],
    ["graduate", ["graduate", "graduation", "btech", "b.tech", "bcom", "b.com", "bba", "bca", "ba", "bsc", "ग्रेजुएट"]]
  ];

  const skillPatterns = [
    ["basic-computer", ["computer", "कंप्यूटर", "कम्प्यूटर", "ms office"]],
    ["excel", ["excel", "spreadsheet"]],
    ["typing", ["typing", "typewriting", "टाइपिंग"]],
    ["communication", ["communication", "speaking", "बात", "बोलना"]],
    ["customer-service", ["customer", "support", "service"]],
    ["sales", ["sales", "selling"]]
  ];

  const foundState =
    statePatterns.find(([, aliases]) =>
      aliases.some((item) => {
        const alias = String(item).toLowerCase().replace(/\s+/g, "");
        if (alias.length <= 2) {
          return new RegExp(`(^|[^a-z])${alias}([^a-z]|$)`, "i").test(value);
        }
        return compact.includes(alias);
      })
    )?.[0] || "";
  const education = educationPatterns.find(([, aliases]) => includesAnyLoose(compact, aliases.map((item) => item.replace(/\s+/g, ""))))?.[0] || "";
  const skills = skillPatterns
    .filter(([, aliases]) => includesAnyLoose(compact, aliases.map((item) => item.replace(/\s+/g, ""))))
    .map(([skill]) => skill);

  const parts = [];
  if (education) parts.push(`I am ${education}`);
  if (foundState) parts.push(`I am from ${foundState}`);
  if (skills.length) parts.push(`I know ${skills.map((skill) => skill.replaceAll("-", " ")).join(", ")}`);

  return {
    raw_transcript: text,
    detected_language: detectedLanguage,
    normalized_english: parts.length ? `${parts.join(". ")}.` : String(text || ""),
    profile: {
      state: foundState,
      district: "",
      education,
      degree: "",
      skills: [...new Set(skills)],
      experience: "",
      goal: value.includes("learn") ? "learn_first" : "job_now",
      preferred_categories: [],
      language: detectedLanguage
    },
    confidence: parts.length ? 0.62 : 0.25,
    source: "fallback"
  };
}

function fallbackProfileExtract(text) {
  return fallbackNormalizeIntent(text).profile;
}

function mergeNormalizedProfile(fallbackProfile, modelProfile = {}) {
  const merged = { ...fallbackProfile };
  for (const [key, value] of Object.entries(modelProfile)) {
    if (Array.isArray(value)) {
      if (value.length) merged[key] = value;
      continue;
    }
    if (String(value || "").trim()) merged[key] = value;
  }
  return merged;
}

async function callOpenRouterNormalizeIntent(text, source = "chat", transcriptLanguage = "") {
  if (!openRouterKey) return fallbackNormalizeIntent(text);

  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5173",
        "X-Title": "CareerSetu",
        "X-OpenRouter-Title": "CareerSetu"
      },
      body: JSON.stringify({
        model: chatModel,
        messages: [
          {
            role: "system",
            content:
              "You normalize Indian job seeker input for a job matching app. The input may be from speech-to-text and may be rough, misspelled, partial, phonetic, Hinglish, or any language supported by Whisper. Preserve the user's source language code if you can infer it. Convert meaning to simple English. Return only valid JSON with this exact shape: {\"raw_transcript\":\"\",\"detected_language\":\"\",\"normalized_english\":\"\",\"profile\":{\"state\":\"\",\"district\":\"\",\"education\":\"\",\"degree\":\"\",\"skills\":[],\"experience\":\"\",\"goal\":\"job_now\",\"preferred_categories\":[],\"language\":\"\"},\"confidence\":0}. Normalize Indian states to English names only when a state is clearly present in the input. Normalize education to one of: 10th pass, 12th pass, ITI, graduate, or empty. If the text means barahvi/barhvi/12vi/12th, return 12th pass. If it says Rajasthan in Hindi or rough Devanagari like rajasthan/rajasthan se/रजसथन, return state Rajasthan. For Devanagari Hindi or Hinglish, use detected_language=hi, not ur. Return ur only for Urdu script or when the user explicitly says Urdu. Normalize skills into English IDs like typing, basic-computer, excel, communication, customer-service, sales. Do not invent details not present."
          },
          {
            role: "user",
            content: JSON.stringify({
              source,
              transcript_language_hint: transcriptLanguage,
              text
            })
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0
      })
    });
  } catch (error) {
    if (isFetchFailure(error)) return fallbackNormalizeIntent(text);
    throw error;
  }

  if (!response.ok) return fallbackNormalizeIntent(text);

  try {
    const data = await response.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const fallback = fallbackNormalizeIntent(text);
    const mergedProfile = mergeNormalizedProfile(fallback.profile, parsed.profile || {});
    if (mergedProfile.state && !fallback.profile.state && !profileFieldMentioned(text, parsed.normalized_english, mergedProfile.state)) {
      mergedProfile.state = "";
      mergedProfile.district = "";
    }
    const detectedLanguage = canonicalizeDetectedLanguage(text, parsed.detected_language, mergedProfile.language, fallback.detected_language, transcriptLanguage);
    mergedProfile.language = detectedLanguage;
    return {
      raw_transcript: parsed.raw_transcript || text,
      detected_language: detectedLanguage,
      normalized_english: parsed.normalized_english || fallback.normalized_english,
      profile: mergedProfile,
      confidence: Number(parsed.confidence || fallback.confidence),
      source: "openrouter"
    };
  } catch {
    return fallbackNormalizeIntent(text);
  }
}

async function callOpenRouterChat(payload) {
  if (!openRouterKey) return fallbackGuide(payload);
  const promptPath = path.join(projectRoot, "prompts", "career_guide_master_prompt.md");
  const masterPrompt = fs.readFileSync(promptPath, "utf8");
  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5173",
      "X-Title": "CareerSetu",
      "X-OpenRouter-Title": "CareerSetu"
      },
      body: JSON.stringify({
      model: guideModel,
      messages: [
        { role: "system", content: masterPrompt },
        { role: "user", content: JSON.stringify(payload) }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });
  } catch (error) {
    if (isFetchFailure(error)) return fallbackGuide(payload);
    throw error;
  }
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter ${response.status}: ${text.slice(0, 300)}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(content);
}

async function callOpenRouterProfile(text) {
  if (!openRouterKey) return fallbackProfileExtract(text);
  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5173",
        "X-Title": "CareerSetu",
        "X-OpenRouter-Title": "CareerSetu"
      },
      body: JSON.stringify({
        model: chatModel,
        messages: [
          {
            role: "system",
            content:
              "Extract a job seeker's profile from their message. The message may be in English, Hindi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia, Assamese, or mixed Hinglish. Return only JSON with keys: state, district, education, degree, skills, experience, goal, preferred_categories, language. Normalize education to one of: 10th pass, 12th pass, ITI, graduate. Normalize skills and preferred_categories into English labels that match Indian entry-level jobs. If the user says BTech, B.E, BCom, BBA, BCA, BA, BSc, bachelor, or graduation, use education=graduate and put the exact stream in degree. Do not invent details."
          },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1
      })
    });
  } catch (error) {
    if (isFetchFailure(error)) return fallbackProfileExtract(text);
    throw error;
  }
  if (!response.ok) return fallbackProfileExtract(text);
  const data = await response.json();
  try {
    return JSON.parse(data.choices?.[0]?.message?.content || "{}");
  } catch {
    return fallbackProfileExtract(text);
  }
}

async function callOpenRouterEmbedding(input) {
  if (!openRouterKey) return null;
  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ model: embeddingModel, input })
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;
  const data = await response.json();
  return data.data?.[0]?.embedding || null;
}

async function callOpenRouterTranscription(payload) {
  if (!openRouterKey) {
    throw new Error("Voice search needs the OpenRouter key on the server.");
  }
  if (!payload.audioBase64) {
    throw new Error("Missing audio data.");
  }

  let response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:5173",
        "X-Title": "CareerSetu",
        "X-OpenRouter-Title": "CareerSetu"
      },
      body: JSON.stringify({
        model: payload.model || sttModel,
        input_audio: {
          data: payload.audioBase64,
          format: payload.format || "webm"
        },
        language: payload.language || undefined,
        temperature: 0
      })
    });
  } catch (error) {
    if (isFetchFailure(error)) {
      throw new Error("Voice service could not reach OpenRouter. Check internet access, firewall, and OPENROUTER_API_KEY.");
    }
    throw error;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenRouter transcription ${response.status}: ${text.slice(0, 300)}`);
  }

  const data = await response.json();
  return {
    text: data.text || "",
    usage: data.usage || null,
    model: payload.model || sttModel
  };
}

function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

async function handleApi(req, res, urlPath) {
  try {
    if (req.method === "GET" && urlPath === "/api/health") {
      sendJson(res, 200, {
        ok: true,
        openRouterConfigured: Boolean(openRouterKey),
        models: {
          chat: chatModel,
          guide: guideModel,
          embedding: embeddingModel,
          speechToText: sttModel
        },
        data: {
          opportunities: fs.existsSync(path.join(projectRoot, "data", "opportunities.json")),
          enrichedOpportunities: fs.existsSync(path.join(projectRoot, "data", "enriched_opportunities.json")),
          embeddings: fs.existsSync(path.join(projectRoot, "data", "job_embeddings.json"))
        }
      });
      return true;
    }
    if (req.method === "GET" && urlPath === "/api/openrouter-check") {
      if (!openRouterKey) {
        sendJson(res, 200, {
          ok: false,
          configured: false,
          message: "OPENROUTER_API_KEY is not loaded."
        });
        return true;
      }

      try {
        const started = Date.now();
        const response = await fetch("https://openrouter.ai/api/v1/models", {
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "HTTP-Referer": "http://127.0.0.1:5173",
            "X-OpenRouter-Title": "CareerSetu"
          }
        });
        sendJson(res, 200, {
          ok: response.ok,
          configured: true,
          status: response.status,
          latencyMs: Date.now() - started,
          message: response.ok ? "OpenRouter is reachable from the server." : "OpenRouter returned a non-OK response."
        });
      } catch (error) {
        sendJson(res, 200, {
          ok: false,
          configured: true,
          error: error.message,
          cause: error.cause?.code || error.code || "",
          message: "The server cannot reach OpenRouter over HTTPS."
        });
      }
      return true;
    }
    if (req.method === "POST" && urlPath === "/api/skill-guide") {
      const payload = await readBody(req);
      const guide = await callOpenRouterChat(payload);
      sendJson(res, 200, guide);
      return true;
    }
    if (req.method === "POST" && urlPath === "/api/profile-extract") {
      const payload = await readBody(req);
      const profile = await callOpenRouterProfile(payload.text || "");
      sendJson(res, 200, profile);
      return true;
    }
    if (req.method === "POST" && urlPath === "/api/normalize-intent") {
      const payload = await readBody(req);
      const normalized = await callOpenRouterNormalizeIntent(payload.text || "", payload.source || "chat", payload.language || "");
      sendJson(res, 200, normalized);
      return true;
    }
    if (req.method === "POST" && urlPath === "/api/transcribe") {
      const payload = await readBody(req);
      const transcript = await callOpenRouterTranscription(payload);
      sendJson(res, 200, transcript);
      return true;
    }
    if (req.method === "POST" && urlPath === "/api/semantic-search") {
      const payload = await readBody(req);
      const queryEmbedding = await callOpenRouterEmbedding(payload.query || "");
      const embeddingsPath = path.join(projectRoot, "data", "job_embeddings.json");
      if (!queryEmbedding || !fs.existsSync(embeddingsPath)) {
        sendJson(res, 200, { matches: localSemanticSearch(payload.query || ""), mode: "semantic-fallback" });
        return true;
      }
      const embeddings = JSON.parse(fs.readFileSync(embeddingsPath, "utf8"));
      const matches = embeddings
        .map((item) => ({ id: item.id, score: cosine(queryEmbedding, item.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 80);
      sendJson(res, 200, { matches, mode: "embedding" });
      return true;
    }
  } catch (error) {
    sendJson(res, 500, { error: error.message });
    return true;
  }
  return false;
}

async function requestHandler(req, res) {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath.startsWith("/api/") && (await handleApi(req, res, urlPath))) return;

  const requestedPath = urlPath === "/" ? "index.html" : urlPath.replace(/^[/\\]+/, "");
  const baseRoot = requestedPath.startsWith("data/") || requestedPath.startsWith("prompts/") ? projectRoot : root;
  const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(baseRoot, safePath);

  if (!filePath.startsWith(baseRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
    });
    res.end(content);
  });
}

const server = http.createServer(requestHandler);

if (require.main === module) {
  server.listen(port, host, () => {
    console.log(`CareerSetu prototype running at http://${host}:${port}`);
  });
}

module.exports = requestHandler;
