const data = {
  opportunities: [],
  skills: {
    typing: "Typing",
    "basic-computer": "Basic Computer",
    excel: "Excel",
    "attention-detail": "Attention to Detail",
    "quantitative-aptitude": "Quantitative Aptitude",
    "english-basics": "English Basics",
    reasoning: "Reasoning",
    "general-awareness": "General Awareness",
    "electrical-basics": "Electrical Basics",
    safety: "Workplace Safety",
    tools: "Hand Tool Use",
    measurement: "Measurement",
    "customer-service": "Customer Service",
    "digital-payments": "Digital Payments",
    communication: "Communication",
    "email-writing": "Email Writing",
    "basic-math": "Basic Math",
    "physical-stamina": "Physical Stamina",
    sales: "Sales"
  }
};

const educationRank = {
  "10th pass": 1,
  "12th pass": 2,
  ITI: 2,
  graduate: 3
};

const elements = {
  chatInput: document.querySelector("#chatInput"),
  chatBtn: document.querySelector("#chatBtn"),
  voiceBtn: document.querySelector("#voiceBtn"),
  voiceStatus: document.querySelector("#voiceStatus"),
  education: document.querySelector("#education"),
  state: document.querySelector("#state"),
  preference: document.querySelector("#preference"),
  category: document.querySelector("#category"),
  refreshBtn: document.querySelector("#refreshBtn"),
  recommendations: document.querySelector("#recommendations"),
  careerDetail: document.querySelector("#careerDetail"),
  matchSummary: document.querySelector("#matchSummary"),
  modelInsights: document.querySelector("#modelInsights"),
  datasetStats: document.querySelector("#datasetStats"),
  savedJobsPanel: document.querySelector("#savedJobsPanel"),
  appliedJobsPanel: document.querySelector("#appliedJobsPanel"),
  skillGuideDialog: document.querySelector("#skillGuideDialog"),
  closeSkillDialog: document.querySelector("#closeSkillDialog"),
  skillGuideInput: document.querySelector("#skillGuideInput"),
  skillGuideVoiceBtn: document.querySelector("#skillGuideVoiceBtn"),
  skillGuideVoiceStatus: document.querySelector("#skillGuideVoiceStatus"),
  skillGuideTranscript: document.querySelector("#skillGuideTranscript"),
  generateSkillGuideBtn: document.querySelector("#generateSkillGuideBtn"),
  skillGuideResult: document.querySelector("#skillGuideResult"),
  dialogSubtitle: document.querySelector("#dialogSubtitle"),
  resumeInput: document.querySelector("#resumeInput"),
  skillsTextInput: document.querySelector("#skillsTextInput"),
  loadingOverlay: document.querySelector("#loadingOverlay"),
  loadingTitle: document.querySelector("#loadingTitle"),
  loadingText: document.querySelector("#loadingText")
};

let selectedOpportunityId = null;
let currentIntent = {
  queryTerms: [],
  extracted: [],
  degreeTrack: "",
  degreeLabel: "",
  families: [],
  detectedLanguage: "",
  normalizedEnglish: ""
};
let currentGuideOpportunity = null;
let semanticMatches = new Map();
let voiceRecorder = null;
let voiceStream = null;
let voiceChunks = [];
let nextSearchSource = "chat";
let voiceAudioContext = null;
let voiceAnalyser = null;
let voiceMonitorFrame = null;
let voiceAutoStopTimer = null;
let voiceLastSoundAt = 0;
let voiceStartedAt = 0;
let activeVoiceTarget = "chat";

const voiceSilenceLimitMs = 5000;
const voiceMaxRecordingMs = 5000;
const voiceStartGraceMs = 1200;
const voiceVolumeThreshold = 0.018;

const storageKeys = {
  savedJobs: "careersetu.savedJobs",
  applications: "careersetu.applications",
  guideCache: "careersetu.guideCache"
};

const languageNames = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  mr: "Marathi",
  pa: "Punjabi",
  gu: "Gujarati",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  or: "Odia",
  as: "Assamese",
  ur: "Urdu"
};

const stateAliases = {
  "andhra pradesh": ["andhra pradesh", "ap"],
  "arunachal pradesh": ["arunachal pradesh", "ar"],
  assam: ["assam", "as"],
  bihar: ["bihar", "br"],
  chhattisgarh: ["chhattisgarh", "ct"],
  goa: ["goa", "ga"],
  gujarat: ["gujarat", "gj"],
  haryana: ["haryana", "hr"],
  "himachal pradesh": ["himachal pradesh", "hp"],
  jharkhand: ["jharkhand", "jh"],
  karnataka: ["karnataka", "ka"],
  kerala: ["kerala", "kl"],
  "madhya pradesh": ["madhya pradesh", "mp"],
  maharashtra: ["maharashtra", "mh"],
  odisha: ["odisha", "or", "od"],
  punjab: ["punjab", "pb"],
  rajasthan: ["rajasthan", "rj"],
  "tamil nadu": ["tamil nadu", "tn"],
  telangana: ["telangana", "ts"],
  "uttar pradesh": ["uttar pradesh", "up"],
  uttarakhand: ["uttarakhand", "uk"],
  "west bengal": ["west bengal", "wb"],
  "delhi ncr": ["delhi", "delhi ncr", "dl", "ncr"]
};

const intentModel = {
  states: Object.entries(stateAliases),
  education: [
    ["10th pass", ["10th", "class 10", "matric"]],
    ["12th pass", ["12th", "class 12", "higher secondary", "hs pass"]],
    ["ITI", ["iti"]],
    [
      "graduate",
      [
        "graduate",
        "graduation",
        "bachelor",
        "degree",
        "btech",
        "b.tech",
        "b tech",
        "b.e",
        "bcom",
        "b.com",
        "b com",
        "bba",
        "b.b.a",
        "bca",
        "b.c.a",
        "ba",
        "b.a",
        "bsc",
        "b.sc"
      ]
    ]
  ],
  skills: [
    ["basic-computer", ["computer", "computer knowledge", "ms office", "internet", "email"]],
    ["excel", ["excel", "spreadsheet", "google sheets"]],
    ["typing", ["typing", "typewriting"]],
    ["communication", ["communication", "talking", "speaking", "people", "convince"]],
    ["customer-service", ["customer", "support", "service", "client"]],
    ["sales", ["sales", "selling", "field sales"]],
    ["electrical-basics", ["electrician", "electrical", "wiring"]],
    ["basic-math", ["math", "billing", "calculation"]]
  ],
  categories: [
    ["office_computer", ["computer", "office", "data entry", "back office", "operator", "admin", "reception"]],
    ["sales_service", ["sales", "customer", "telecaller", "bpo", "support", "retail"]],
    ["logistics", ["warehouse", "delivery", "packing", "logistics"]],
    ["technical_trade", ["electrician", "technician", "mechanic", "welder", "fitter"]],
    ["financial_services", ["bank", "finance", "loan", "kyc", "account"]],
    ["govt_exam", ["government", "govt", "ssc", "railway", "rrb", "ibps"]]
  ],
  expansions: {
    "basic-computer": ["data entry", "back office", "computer operator", "office assistant", "admin assistant", "receptionist"],
    excel: ["mis", "spreadsheet", "billing", "back office", "reports"],
    typing: ["data entry", "data entry operator", "typing job", "computer operator", "back office assistant", "form filling", "document typing"],
    communication: ["customer support", "telecaller", "sales", "receptionist", "bpo"],
    "customer-service": ["customer support", "retail", "front desk", "helpdesk"],
    sales: ["field sales", "retail sales", "business development", "telecaller"],
    "electrical-basics": ["electrician", "technician", "maintenance", "apprentice"],
    "basic-math": ["billing", "cashier", "retail", "warehouse"]
  }
};

const intentFamilies = {
  typing_data_entry: {
    label: "Typing / Data Entry",
    triggers: ["typing", "typewriting", "typing job", "data entry", "form filling", "document typing"],
    categories: ["office_computer"],
    positiveTerms: [
      "typing",
      "typewriting",
      "data entry",
      "data operator",
      "computer operator",
      "back office",
      "office assistant",
      "documentation",
      "form filling",
      "record entry",
      "ms word",
      "excel"
    ],
    strongTitleTerms: ["data entry", "computer operator", "back office", "office assistant", "typing"],
    negativeTerms: [
      "ca article",
      "article assistant",
      "articleship",
      "chartered accountant",
      "accountant",
      "accounting",
      "bookkeeping",
      "gst",
      "tds",
      "tally",
      "audit",
      "income tax",
      "itr",
      "finance"
    ]
  },
  accounting_finance: {
    label: "Accounting / Finance",
    triggers: ["accounting", "accountant", "accounts", "bcom", "b.com", "tally", "gst", "tds", "bookkeeping", "finance", "commerce"],
    categories: ["financial_services", "office_computer"],
    positiveTerms: ["account", "accounting", "accountant", "finance", "tally", "gst", "tds", "bookkeeping", "invoice", "billing", "commerce"],
    strongTitleTerms: ["accountant", "account executive", "accounts", "billing"],
    negativeTerms: []
  },
  customer_support: {
    label: "Customer Support",
    triggers: ["customer", "support", "bpo", "call", "calling", "talking", "speaking"],
    categories: ["sales_service"],
    positiveTerms: ["customer support", "customer service", "bpo", "telecaller", "voice", "chat support", "email support", "sales", "retail"],
    strongTitleTerms: ["customer support", "telecaller", "bpo", "customer service"],
    negativeTerms: ["chartered accountant", "ca article", "articleship"]
  },
  technical_trade: {
    label: "Technical Trade",
    triggers: ["iti", "electrician", "technician", "mechanic", "maintenance", "wiring", "technical"],
    categories: ["technical_trade"],
    positiveTerms: ["electrician", "technician", "mechanic", "maintenance", "wiring", "repair", "tools", "apprentice"],
    strongTitleTerms: ["technician", "electrician", "mechanic", "maintenance"],
    negativeTerms: ["accountant", "chartered accountant", "ca article"]
  }
};

const degreeProfiles = {
  btech: {
    label: "B.Tech / Engineering",
    aliases: [
      "btech",
      "b.tech",
      "b tech",
      "b.e",
      "be graduate",
      "engineering graduate",
      "engineer graduate",
      "computer science",
      "cse",
      "mechanical engineering",
      "civil engineering",
      "electrical engineering",
      "electronics"
    ],
    categories: ["technical_trade", "office_computer"],
    queryTerms: [
      "engineering",
      "engineer",
      "technical",
      "technician",
      "trainee",
      "graduate engineer",
      "junior engineer",
      "quality",
      "maintenance",
      "site engineer",
      "it support",
      "software",
      "apprentice"
    ],
    preferredTerms: ["b.tech", "btech", "b.e", "engineering", "engineer", "diploma", "technical", "technician"]
  },
  bcom: {
    label: "B.Com / Commerce",
    aliases: ["bcom", "b.com", "b com", "commerce graduate", "mcom", "m.com"],
    categories: ["financial_services", "office_computer"],
    queryTerms: [
      "accounts",
      "accounting",
      "finance",
      "tally",
      "gst",
      "tds",
      "bookkeeping",
      "invoice",
      "billing",
      "commerce",
      "audit",
      "mis"
    ],
    preferredTerms: ["b.com", "bcom", "commerce", "m.com", "finance", "accounting", "accounts", "tally", "gst", "tds", "bookkeeping"]
  },
  bba: {
    label: "BBA / Business",
    aliases: ["bba", "b.b.a", "business administration", "management graduate"],
    categories: ["sales_service", "office_computer", "financial_services"],
    queryTerms: ["business", "sales", "operations", "admin", "management", "customer", "coordination", "back office"],
    preferredTerms: ["bba", "business administration", "management", "operations", "sales", "coordination"]
  },
  bca: {
    label: "BCA / Computer Applications",
    aliases: ["bca", "b.c.a", "computer applications", "computer application"],
    categories: ["office_computer", "technical_trade"],
    queryTerms: ["computer", "it support", "software", "data", "mis", "technical support", "back office", "excel"],
    preferredTerms: ["bca", "computer applications", "computer", "it", "software", "technical support"]
  }
};

function skillName(id) {
  return data.skills[id] || id;
}

function titleCase(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function displaySourceLabel(sourceName = "") {
  const source = sourceName.toLowerCase();
  if (source.includes("ncs")) return "Public portal";
  if (source.includes("apprentice")) return "Apprenticeship";
  if (source.includes("jobspy") || source.includes("indeed") || source.includes("linkedin")) return "Private listing";
  return "Verified listing";
}

function normalizeEducationLevel(value) {
  const text = String(value || "").toLowerCase();
  if (includesAny(text, ["10th", "class 10", "matric"])) return "10th pass";
  if (includesAny(text, ["iti"])) return "ITI";
  if (includesAny(text, ["12th", "class 12", "higher secondary", "senior secondary", "hs pass"])) return "12th pass";
  if (
    includesAny(text, [
      "graduate",
      "graduation",
      "bachelor",
      "degree",
      "btech",
      "b.tech",
      "b tech",
      "b.e",
      "bcom",
      "b.com",
      "b com",
      "bba",
      "bca",
      "ba",
      "b.a",
      "bsc",
      "b.sc",
      "mcom",
      "mba"
    ])
  ) {
    return "graduate";
  }
  return "";
}

function detectDegreeProfile(text) {
  const value = String(text || "").toLowerCase();
  for (const [track, profile] of Object.entries(degreeProfiles)) {
    if (includesAny(value, profile.aliases)) return { track, ...profile };
  }
  return null;
}

function detectIntentFamilies(text) {
  const value = String(text || "").toLowerCase();
  return Object.entries(intentFamilies)
    .filter(([, family]) => includesAny(value, family.triggers))
    .map(([key, family]) => ({ key, ...family }));
}

function normalizeCategory(value) {
  const text = Array.isArray(value) ? value.join(" ") : String(value || "");
  const lower = text.toLowerCase().replaceAll("-", "_");
  for (const [category, aliases] of intentModel.categories) {
    if (lower.includes(category) || includesAny(lower, aliases)) return category;
  }
  if (includesAny(lower, ["account", "accounts", "accounting", "finance", "tally", "gst"])) return "financial_services";
  if (includesAny(lower, ["engineer", "engineering", "technician", "technical"])) return "technical_trade";
  return "";
}

function cleanDisplayText(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/\\-/g, "-")
    .replace(/\\&/g, "&")
    .replace(/\\\[/g, "[")
    .replace(/\\\]/g, "]")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(value, max = 520) {
  const text = cleanDisplayText(value);
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
}

function textToBullets(value, limit = 5) {
  const text = cleanDisplayText(value)
    .replace(/Read more\.\.\./gi, "")
    .replace(/Job description/gi, "")
    .replace(/Key Responsibilities/gi, "")
    .replace(/Requirements/gi, "")
    .trim();
  const chunks = text
    .split(/(?:\s\*\s|\. |\n|•)/)
    .map((item) => cleanDisplayText(item))
    .filter((item) => item.length > 24 && !/\b(call|whatsapp|contact)\b/i.test(item))
    .slice(0, limit);
  return chunks.length ? chunks : [shortText(text, 260)].filter(Boolean);
}

function sourceLabel(value) {
  return titleCase(String(value || "private_job")).replace("Job", "Job");
}

function getProfile() {
  const selectedSkills = Array.from(document.querySelectorAll("input[type='checkbox']:checked")).map((input) => input.value);
  const typedSkills = extractSkillsFromText(elements.skillsTextInput?.value || "");
  return {
    education: elements.education.value,
    state: elements.state.value,
    preference: elements.preference.value,
    category: elements.category.value,
    skills: unique([...selectedSkills, ...typedSkills]),
    language: currentIntent.detectedLanguage || "en",
    normalizedEnglish: currentIntent.normalizedEnglish || ""
  };
}

function setSkill(skill, checked = true) {
  const normalized = normalizeSkillId(skill);
  const input = document.querySelector(`input[value="${normalized}"]`);
  if (input) input.checked = checked;
}

function normalizeSkillId(skill) {
  const value = String(skill || "").toLowerCase().trim();
  const mapping = {
    computer: "basic-computer",
    "computer basics": "basic-computer",
    "basic computer": "basic-computer",
    "ms office": "basic-computer",
    spreadsheet: "excel",
    "google sheets": "excel",
    speaking: "communication",
    talking: "communication",
    customer: "customer-service",
    "customer support": "customer-service"
  };
  return mapping[value] || value.replace(/\s+/g, "-");
}

function includesAny(text, terms) {
  return terms.some((term) => {
    const escaped = String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = term.length <= 3 ? new RegExp(`(^|\\s|,|\\.)${escaped}(\\s|,|\\.|$)`, "i") : new RegExp(escaped, "i");
    return pattern.test(text);
  });
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function readStore(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setLoading(active, title = "Finding suitable jobs", text = "Reading your profile and ranking real opportunities.") {
  if (!elements.loadingOverlay) return;
  elements.loadingTitle.textContent = title;
  elements.loadingText.textContent = text;
  elements.loadingOverlay.classList.toggle("active", active);
}

function setVoiceStatus(message = "") {
  if (elements.voiceStatus) elements.voiceStatus.textContent = message;
}

function setGuideVoiceStatus(message = "") {
  if (elements.skillGuideVoiceStatus) elements.skillGuideVoiceStatus.textContent = message;
}

function voiceButtonForTarget(target) {
  return target === "guide" ? elements.skillGuideVoiceBtn : elements.voiceBtn;
}

function setTargetVoiceStatus(target, message = "") {
  if (target === "guide") setGuideVoiceStatus(message);
  else setVoiceStatus(message);
}

function audioBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function audioFormatFromMime(mimeType = "") {
  const clean = mimeType.split(";")[0].toLowerCase();
  if (clean.includes("webm")) return "webm";
  if (clean.includes("ogg")) return "ogg";
  if (clean.includes("mp4")) return "m4a";
  if (clean.includes("mpeg")) return "mp3";
  if (clean.includes("wav")) return "wav";
  return "webm";
}

async function transcribeVoice(blob) {
  const audioBase64 = await audioBlobToBase64(blob);
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audioBase64,
      format: audioFormatFromMime(blob.type)
    })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Could not understand the voice note.");
  }
  return response.json();
}

async function startVoiceRecording(target = "chat") {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    setTargetVoiceStatus(target, "Voice is not supported in this browser.");
    return;
  }

  activeVoiceTarget = target;
  const activeButton = voiceButtonForTarget(target);
  voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const preferredType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/webm")
      ? "audio/webm"
      : "";
  voiceRecorder = preferredType ? new MediaRecorder(voiceStream, { mimeType: preferredType }) : new MediaRecorder(voiceStream);
  voiceChunks = [];
  activeButton?.classList.add("recording");
  activeButton?.setAttribute("aria-label", "Stop recording");
  activeButton?.setAttribute("title", "Stop recording");
  setTargetVoiceStatus(target, "Listening... auto-stops in 5 sec.");
  startSilenceMonitor(voiceStream);
  voiceAutoStopTimer = window.setTimeout(() => {
    if (voiceRecorder && voiceRecorder.state === "recording") {
      setTargetVoiceStatus(activeVoiceTarget, "Processing...");
      stopVoiceRecording();
    }
  }, voiceMaxRecordingMs);

  voiceRecorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) voiceChunks.push(event.data);
  });

  voiceRecorder.addEventListener("stop", async () => {
    const stoppedTarget = activeVoiceTarget;
    const stoppedButton = voiceButtonForTarget(stoppedTarget);
    stopSilenceMonitor();
    voiceStream?.getTracks().forEach((track) => track.stop());
    voiceStream = null;
    stoppedButton?.classList.remove("recording");
    stoppedButton?.setAttribute("aria-label", stoppedTarget === "guide" ? "Speak what you know" : "Speak your search");
    stoppedButton?.setAttribute("title", stoppedTarget === "guide" ? "Speak what you know" : "Speak your search");
    const blob = new Blob(voiceChunks, { type: voiceRecorder?.mimeType || "audio/webm" });
    voiceRecorder = null;
    voiceChunks = [];
    if (!blob.size) {
      setTargetVoiceStatus(stoppedTarget, "No voice captured.");
      return;
    }
    try {
      setTargetVoiceStatus(stoppedTarget, "Understanding your voice...");
      const result = await transcribeVoice(blob);
      const transcript = cleanDisplayText(result.text);
      if (!transcript) {
        setTargetVoiceStatus(stoppedTarget, "Could not hear clear words.");
        return;
      }
      if (stoppedTarget === "guide") {
        elements.skillGuideInput.value = transcript;
        if (elements.skillGuideTranscript) elements.skillGuideTranscript.textContent = transcript;
        setGuideVoiceStatus("Voice understood. Creating your guide...");
        await createSkillGuide();
        setGuideVoiceStatus("Guide created.");
      } else {
        elements.chatInput.value = transcript;
        nextSearchSource = "voice";
        setVoiceStatus("Voice added. Finding jobs...");
        await applyChatExtraction();
        setVoiceStatus("");
      }
    } catch (error) {
      setTargetVoiceStatus(stoppedTarget, error.message || "Could not understand the voice note.");
    }
  });

  voiceRecorder.start();
}

function startSilenceMonitor(stream) {
  stopSilenceMonitor();

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  voiceAudioContext = new AudioContextClass();
  const source = voiceAudioContext.createMediaStreamSource(stream);
  voiceAnalyser = voiceAudioContext.createAnalyser();
  voiceAnalyser.fftSize = 2048;
  source.connect(voiceAnalyser);

  const samples = new Uint8Array(voiceAnalyser.fftSize);
  voiceStartedAt = Date.now();
  voiceLastSoundAt = voiceStartedAt;

  function monitor() {
    if (!voiceAnalyser || !voiceRecorder || voiceRecorder.state !== "recording") return;

    voiceAnalyser.getByteTimeDomainData(samples);
    let sum = 0;
    for (let index = 0; index < samples.length; index += 1) {
      const centered = (samples[index] - 128) / 128;
      sum += centered * centered;
    }
    const volume = Math.sqrt(sum / samples.length);
    const now = Date.now();

    if (volume > voiceVolumeThreshold) {
      voiceLastSoundAt = now;
    }

    const pastGrace = now - voiceStartedAt > voiceStartGraceMs;
    const silentLongEnough = now - voiceLastSoundAt > voiceSilenceLimitMs;
    if (pastGrace && silentLongEnough) {
      setVoiceStatus("Processing...");
      stopVoiceRecording();
      return;
    }

    voiceMonitorFrame = requestAnimationFrame(monitor);
  }

  monitor();
}

function stopSilenceMonitor() {
  if (voiceAutoStopTimer) {
    clearTimeout(voiceAutoStopTimer);
    voiceAutoStopTimer = null;
  }
  if (voiceMonitorFrame) {
    cancelAnimationFrame(voiceMonitorFrame);
    voiceMonitorFrame = null;
  }
  voiceAnalyser = null;
  if (voiceAudioContext) {
    voiceAudioContext.close().catch(() => {});
    voiceAudioContext = null;
  }
}

function stopVoiceRecording() {
  if (voiceRecorder && voiceRecorder.state !== "inactive") {
    voiceRecorder.stop();
  }
}

async function toggleVoiceRecording() {
  if (voiceRecorder && voiceRecorder.state === "recording") {
    stopVoiceRecording();
    return;
  }
  try {
    await startVoiceRecording("chat");
  } catch {
    setVoiceStatus("Please allow microphone access.");
    elements.voiceBtn?.classList.remove("recording");
  }
}

async function toggleSkillGuideVoiceRecording() {
  if (voiceRecorder && voiceRecorder.state === "recording") {
    stopVoiceRecording();
    return;
  }
  try {
    await startVoiceRecording("guide");
  } catch {
    setGuideVoiceStatus("Please allow microphone access.");
    elements.skillGuideVoiceBtn?.classList.remove("recording");
  }
}

function enterApplication() {
  document.body.classList.remove("intro-mode");
  document.body.classList.add("app-mode");
}

function resetDerivedSearchControls() {
  elements.preference.value = "any";
  elements.category.value = "any";
  document.querySelectorAll(".profile-panel input[type='checkbox']").forEach((input) => {
    input.checked = false;
  });
}

function isSaved(opportunityId) {
  return readStore(storageKeys.savedJobs, []).some((item) => item.opportunityId === opportunityId);
}

function getApplication(opportunityId) {
  return readStore(storageKeys.applications, []).find((item) => item.opportunityId === opportunityId);
}

function toggleSaved(opportunityId) {
  const saved = readStore(storageKeys.savedJobs, []);
  const exists = saved.some((item) => item.opportunityId === opportunityId);
  const next = exists
    ? saved.filter((item) => item.opportunityId !== opportunityId)
    : [...saved, { opportunityId, savedAt: new Date().toISOString() }];
  writeStore(storageKeys.savedJobs, next);
  renderRecommendations();
  renderCollections();
}

function markApplied(opportunity) {
  const applications = readStore(storageKeys.applications, []);
  const existing = applications.find((item) => item.opportunityId === opportunity.id);
  const nextRecord = {
    opportunityId: opportunity.id,
    title: opportunity.title,
    sourceName: opportunity.sourceName,
    sourceUrl: opportunity.applyUrl,
    status: "applied",
    updatedAt: new Date().toISOString(),
    checklist: {
      resumeReady: false,
      idProofReady: false,
      educationProofReady: false,
      phoneEmailReady: true,
      skillsPracticed: false
    }
  };
  writeStore(
    storageKeys.applications,
    existing ? applications.map((item) => (item.opportunityId === opportunity.id ? { ...item, ...nextRecord } : item)) : [...applications, nextRecord]
  );
  renderDetail();
  renderCollections();
}

function languageLabel(code = "en") {
  return languageNames[String(code || "en").toLowerCase()] || titleCase(code || "English");
}

function guideCacheKey(opportunity, profile, knownSkills) {
  return [opportunity.id, profile.education, profile.language || "en", ...unique([...profile.skills, ...knownSkills]).sort()].join("__").replace(/\s+/g, "-");
}

function buildIntent(text) {
  const lower = text.toLowerCase();
  const extracted = [];
  const queryTerms = [];
  const degreeProfile = detectDegreeProfile(lower);
  const families = detectIntentFamilies(lower);

  if (degreeProfile) {
    extracted.push(`degree:${degreeProfile.label}`);
    queryTerms.push(...degreeProfile.aliases, ...degreeProfile.queryTerms, ...degreeProfile.preferredTerms);
  }

  families.forEach((family) => {
    extracted.push(`intent:${family.label}`);
    queryTerms.push(...family.positiveTerms, ...family.strongTitleTerms);
  });

  for (const [state, aliases] of intentModel.states) {
    if (includesAny(lower, aliases)) {
      extracted.push(`state:${titleCase(state)}`);
      queryTerms.push(...aliases);
    }
  }

  for (const [education, aliases] of intentModel.education) {
    if (includesAny(lower, aliases)) {
      extracted.push(`education:${education}`);
      queryTerms.push(...aliases);
    }
  }

  for (const [skill, aliases] of intentModel.skills) {
    if (includesAny(lower, aliases)) {
      extracted.push(`skill:${skillName(skill)}`);
      queryTerms.push(skill, ...aliases, ...(intentModel.expansions[skill] || []));
    }
  }

  for (const [category, aliases] of intentModel.categories) {
    if (includesAny(lower, aliases)) {
      extracted.push(`category:${titleCase(category)}`);
      queryTerms.push(category, ...aliases);
    }
  }

  return {
    extracted: unique(extracted),
    queryTerms: unique([...queryTerms, ...lower.split(/[^a-z0-9]+/).filter((term) => term.length > 2)]),
    degreeTrack: degreeProfile?.track || "",
    degreeLabel: degreeProfile?.label || "",
    families: families.map((family) => family.key),
    detectedLanguage: "",
    normalizedEnglish: ""
  };
}

async function normalizeIntentText(rawText, source = "chat", language = "") {
  const response = await fetch("/api/normalize-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: rawText, source, language })
  });
  if (!response.ok) return null;
  return response.json();
}

function applyStructuredProfile(profile = {}) {
  if (profile.state) {
    const state = titleCase(profile.state);
    const option = [...elements.state.options].find((item) => item.text.toLowerCase() === state.toLowerCase());
    if (option) elements.state.value = option.text;
  }

  const normalizedEducation = normalizeEducationLevel(profile.education);
  if (normalizedEducation && [...elements.education.options].some((item) => item.value === normalizedEducation)) {
    elements.education.value = normalizedEducation;
  }

  const normalizedCategory = normalizeCategory(profile.preferred_categories || profile.category);
  if (normalizedCategory) elements.category.value = normalizedCategory;

  const extractedSkills = Array.isArray(profile.skills)
    ? profile.skills
    : String(profile.skills || "")
        .split(/[,;/]+/)
        .map((item) => item.trim())
        .filter(Boolean);
  extractedSkills.map(normalizeSkillId).forEach((skill) => setSkill(skill));
}

async function refreshSemanticMatches() {
  try {
    const profile = getProfile();
    const semanticQuery = unique([
      elements.chatInput.value,
      profile.education,
      currentIntent.degreeLabel,
      ...currentIntent.queryTerms.slice(0, 24)
    ]).join(" ");
    const response = await fetch("/api/semantic-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: semanticQuery })
    });
    if (!response.ok) return;
    const payload = await response.json();
    semanticMatches = new Map((payload.matches || []).map((item) => [item.id, item.score]));
  } catch {
    semanticMatches = new Map();
  }
}

async function applyChatExtraction() {
  enterApplication();
  switchView("discover");
  setLoading(true, "Finding suitable jobs", "Understanding your message and matching jobs near your location.");
  const rawText = `${elements.chatInput.value}\n${elements.skillsTextInput?.value || ""}`;
  const searchSource = nextSearchSource;
  nextSearchSource = "chat";
  try {
    resetDerivedSearchControls();
    const normalized = await normalizeIntentText(rawText, searchSource).catch(() => null);
    const normalizedEnglish = normalized?.normalized_english || "";
    const profileFromNormalizer = normalized?.profile || {};
    const searchText = unique([rawText, normalizedEnglish]).join("\n");
    const text = searchText.toLowerCase();

    if (normalizedEnglish && normalizedEnglish.toLowerCase() !== elements.chatInput.value.toLowerCase()) {
      elements.chatInput.value = normalizedEnglish;
    }

    currentIntent = {
      ...buildIntent(searchText),
      detectedLanguage: normalized?.detected_language || profileFromNormalizer.language || "",
      normalizedEnglish
    };

    if (profileFromNormalizer.state) {
      currentIntent.extracted = unique([...currentIntent.extracted, `state:${titleCase(profileFromNormalizer.state)}`]);
      currentIntent.queryTerms = unique([...currentIntent.queryTerms, profileFromNormalizer.state]);
    }

    if (profileFromNormalizer.education) {
      currentIntent.extracted = unique([...currentIntent.extracted, `education:${profileFromNormalizer.education}`]);
      currentIntent.queryTerms = unique([...currentIntent.queryTerms, profileFromNormalizer.education]);
    }

    applyStructuredProfile(profileFromNormalizer);

    try {
      const response = await fetch("/api/profile-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: searchText })
      });
      if (response.ok) {
        const profile = await response.json();
        applyStructuredProfile(profile);
      }
    } catch {
      // Keep local extraction below as fallback.
    }

    for (const [state, aliases] of intentModel.states) {
      if (includesAny(text, aliases)) elements.state.value = titleCase(state);
    }

    for (const [education, aliases] of intentModel.education) {
      if (includesAny(text, aliases)) elements.education.value = education;
    }

    for (const [skill, aliases] of intentModel.skills) {
      if (includesAny(text, aliases)) setSkill(skill);
    }

    for (const [category, aliases] of intentModel.categories) {
      if (includesAny(text, aliases)) elements.category.value = category;
    }

    const intentFamily = detectIntentFamilies(text)[0];
    if (intentFamily && elements.category.value === "any") {
      elements.category.value = intentFamily.categories[0];
    }

    const degreeProfile = detectDegreeProfile(text);
    if (degreeProfile) {
      elements.education.value = "graduate";
      if (elements.category.value === "any") elements.category.value = degreeProfile.categories[0];
    }

    if (includesAny(text, ["government", "govt", "ssc", "railway", "rrb", "ibps"])) elements.preference.value = "govt_exam";
    if (includesAny(text, ["apprentice", "apprenticeship"])) elements.preference.value = "apprenticeship";

    await refreshSemanticMatches();
    renderRecommendations();
  } finally {
    setLoading(false);
  }
}

function educationMeets(profileEducation, minEducation) {
  const min = String(minEducation || "").toLowerCase();
  if (min.includes("10th")) return educationRank[profileEducation] >= 1;
  if (min.includes("12th")) return educationRank[profileEducation] >= 2;
  if (min.includes("iti")) return profileEducation === "ITI" || educationRank[profileEducation] >= 2;
  if (min.includes("graduate")) return profileEducation === "graduate";
  return true;
}

function educationRequirementRank(minEducation) {
  const min = String(minEducation || "").toLowerCase();
  if (min.includes("graduate") || min.includes("bachelor") || min.includes("b.")) return 3;
  if (min.includes("iti")) return 2;
  if (min.includes("12th") || min.includes("higher secondary")) return 2;
  if (min.includes("10th") || min.includes("matric")) return 1;
  return 0;
}

function preferredEducationText(opportunity) {
  return [opportunity.minEducationHard, ...(opportunity.educationPreferred || []), opportunity.description, opportunity.summary]
    .join(" ")
    .toLowerCase();
}

function educationFit(profileEducation, opportunity) {
  if (!educationMeets(profileEducation, opportunity.minEducationHard)) return 0;
  const requiredRank = educationRequirementRank(opportunity.minEducationHard);
  const profileRank = educationRank[profileEducation] || 0;
  const educationText = preferredEducationText(opportunity);

  if (profileEducation === "graduate") {
    if (requiredRank >= 3 || includesAny(educationText, ["graduate", "graduation", "bachelor", "degree", "b.com", "btech", "b.tech", "bba", "bca"])) {
      return 1;
    }
    if (requiredRank === 2 && includesAny(educationText, ["12th pass / graduate", "12th pass or graduate", "12th / graduate", "12th or graduate"])) {
      return 0.86;
    }
    return 0.56;
  }

  if (!opportunity.educationPreferred.length) return 1;
  if (opportunity.educationPreferred.some((item) => String(item).toLowerCase().includes(profileEducation.toLowerCase()))) return 1;
  return profileRank > requiredRank ? 0.8 : 0.72;
}

function degreeRelevance(opportunity) {
  if (!currentIntent.degreeTrack || !degreeProfiles[currentIntent.degreeTrack]) {
    return { score: 0, hits: [] };
  }

  const degreeProfile = degreeProfiles[currentIntent.degreeTrack];
  const text = `${searchableText(opportunity)} ${preferredEducationText(opportunity)}`;
  const hits = unique(degreeProfile.preferredTerms.filter((term) => text.includes(term.toLowerCase())));
  const categoryHit = degreeProfile.categories.includes(opportunity.category);
  const graduateRequirement = educationRequirementRank(opportunity.minEducationHard) >= 3 || includesAny(text, ["graduate", "graduation", "bachelor", "degree"]);
  const lowEducationOnly = educationRequirementRank(opportunity.minEducationHard) > 0 && educationRequirementRank(opportunity.minEducationHard) < 3 && !graduateRequirement;

  let score = 0;
  if (graduateRequirement) score += 12;
  if (categoryHit) score += 7;
  if (hits.length) score += Math.min(14, hits.length * 4);
  if (lowEducationOnly && !hits.length && !categoryHit) score -= 12;

  return {
    score: Math.max(-14, Math.min(30, score)),
    hits
  };
}

function locationFit(profileState, opportunity) {
  const stateWasMentioned = currentIntent.extracted.some((item) => item.startsWith("state:"));
  if (!stateWasMentioned) return true;
  if (!profileState) return true;
  const location = `${opportunity.location} ${opportunity.state}`.toLowerCase();
  const aliases = stateAliases[profileState.toLowerCase()] || [profileState.toLowerCase()];
  if (!location.trim()) return false;
  return includesAny(location, aliases) || includesAny(location, ["all india", "pan india", "remote", "work from home", "wfh"]);
}

function searchableText(opportunity) {
  return [
    opportunity.title,
    opportunity.organization,
    opportunity.location,
    opportunity.category,
    opportunity.sourceType,
    opportunity.minEducationHard,
    opportunity.salaryRange,
    opportunity.description,
    ...opportunity.skillsMustHave,
    ...opportunity.skillsGoodToHave
  ]
    .join(" ")
    .toLowerCase();
}

function semanticScore(opportunity) {
  if (semanticMatches.has(opportunity.id)) return Math.round(semanticMatches.get(opportunity.id) * 25);
  if (!currentIntent.queryTerms.length) return 0;
  const text = searchableText(opportunity);
  const hits = currentIntent.queryTerms.filter((term) => text.includes(String(term).toLowerCase()));
  return Math.min(20, Math.round((unique(hits).length / Math.max(4, currentIntent.queryTerms.length)) * 35));
}

function hasAccountingIntent() {
  return currentIntent.degreeTrack === "bcom" || currentIntent.families.includes("accounting_finance");
}

function intentFit(opportunity) {
  if (!currentIntent.families.length) return { score: 0, hits: [], penalties: [] };

  const text = searchableText(opportunity);
  const title = String(opportunity.title || "").toLowerCase();
  const hits = [];
  const penalties = [];
  let score = 0;

  currentIntent.families.forEach((familyKey) => {
    const family = intentFamilies[familyKey];
    if (!family) return;

    const strongHits = family.strongTitleTerms.filter((term) => title.includes(term));
    const positiveHits = family.positiveTerms.filter((term) => text.includes(term));
    const categoryHit = family.categories.includes(opportunity.category);

    if (strongHits.length) score += Math.min(24, strongHits.length * 12);
    if (positiveHits.length) score += Math.min(18, unique(positiveHits).length * 4);
    if (categoryHit) score += 8;

    hits.push(...strongHits, ...positiveHits);

    const negativeHits = family.negativeTerms.filter((term) => text.includes(term));
    if (negativeHits.length) {
      const allowAccounting = familyKey !== "typing_data_entry" || hasAccountingIntent();
      if (!allowAccounting) {
        const titlePenalty = negativeHits.some((term) => title.includes(term)) ? 26 : 14;
        score -= titlePenalty;
        penalties.push(...negativeHits);
      }
    }

    if (familyKey === "typing_data_entry" && !strongHits.length && !positiveHits.some((term) => ["typing", "data entry", "computer operator", "back office", "form filling"].includes(term))) {
      score -= 8;
      penalties.push("weak typing fit");
    }
  });

  if (!hasAccountingIntent() && includesAny(text, ["ca article", "article assistant", "articleship", "chartered accountant"])) {
    score -= 36;
    penalties.push("professional accounting role");
  }

  return {
    score: Math.max(-45, Math.min(42, score)),
    hits: unique(hits).slice(0, 5),
    penalties: unique(penalties).slice(0, 5)
  };
}

function getMatch(opportunity, profile) {
  const hardBlocked = !educationMeets(profile.education, opportunity.minEducationHard) || !locationFit(profile.state, opportunity);
  const mustMatched = opportunity.skillsMustHave.filter((skill) => profile.skills.includes(skill));
  const mustMissing = opportunity.skillsMustHave.filter((skill) => !profile.skills.includes(skill));
  const softMatched = opportunity.skillsGoodToHave.filter((skill) => profile.skills.includes(skill));
  const softMissing = opportunity.skillsGoodToHave.filter((skill) => !profile.skills.includes(skill));
  const mustBase = opportunity.skillsMustHave.length || 1;
  const softBase = opportunity.skillsGoodToHave.length || 1;
  const pathScore = profile.preference === "any" || profile.preference === opportunity.sourceType ? 15 : 0;
  const categoryScore = profile.category === "any" || profile.category === opportunity.category ? 10 : 0;
  const sourceTrust = ["NCS"].includes(opportunity.sourceName) ? 8 : 5;
  const flexibilityScore = opportunity.sourceType === "private_job" ? 8 : 4;
  const semantic = semanticScore(opportunity);
  const degree = degreeRelevance(opportunity);
  const intent = intentFit(opportunity);
  const rawScore = hardBlocked
    ? 0
    : Math.round(
        (mustMatched.length / mustBase) * 35 +
          (softMatched.length / softBase) * 20 +
          educationFit(profile.education, opportunity) * 18 +
          degree.score +
          intent.score +
          flexibilityScore +
          pathScore +
          categoryScore +
          sourceTrust +
          semantic
      );

  return {
    ...opportunity,
    hardBlocked,
    rawScore,
    score: Math.max(0, Math.min(rawScore, 100)),
    mustMatched,
    mustMissing,
    softMatched,
    softMissing,
    semantic,
    degreeScore: degree.score,
    degreeHits: degree.hits,
    intentScore: intent.score,
    intentHits: intent.hits,
    intentPenalties: intent.penalties,
    readiness: hardBlocked ? "Blocked" : mustMissing.length ? "Learn first" : "Can try now"
  };
}

function getRankedOpportunities() {
  const profile = getProfile();
  return data.opportunities
    .map((opportunity) => getMatch(opportunity, profile))
    .filter((opportunity) => !opportunity.hardBlocked)
    .sort((a, b) => b.rawScore - a.rawScore || b.score - a.score);
}

function renderRecommendations() {
  const profile = getProfile();
  const ranked = getRankedOpportunities();
  if (!selectedOpportunityId || !ranked.some((item) => item.id === selectedOpportunityId)) {
    selectedOpportunityId = ranked[0]?.id;
  }

  elements.matchSummary.textContent = `${ranked.length} suitable opportunities found for ${profile.education} in ${profile.state}.`;
  renderModelInsights(profile, ranked);
  elements.recommendations.innerHTML = ranked.length
    ? ranked
        .map(
          (opportunity) => `
            <button class="recommendation ${opportunity.id === selectedOpportunityId ? "active" : ""}" data-id="${opportunity.id}" type="button">
              <div class="meta-row">
                <span class="score">${opportunity.score}% match</span>
                <span class="tag">${opportunity.readiness}</span>
              </div>
              <h3>${opportunity.title}</h3>
              <div class="job-facts">
                <span><strong>Employer</strong>${opportunity.organization || "Not listed"}</span>
                <span><strong>Location</strong>${opportunity.location || "Not listed"}</span>
                <span><strong>Pay</strong>${opportunity.salaryRange || "Not specified"}</span>
                <span><strong>Listing</strong>${displaySourceLabel(opportunity.sourceName)}</span>
              </div>
              <p class="why-line">${matchReason(opportunity)}</p>
              <div class="tag-row">
                ${opportunity.mustMissing.map((skill) => `<span class="tag urgent">Must learn: ${skillName(skill)}</span>`).join("")}
                ${opportunity.softMissing
                  .slice(0, 2)
                  .map((skill) => `<span class="tag">Useful: ${skillName(skill)}</span>`)
                  .join("")}
              </div>
            </button>
          `
        )
        .join("")
    : `<div class="empty-state">No matches after hard filters. Try another state, category, or preference.</div>`;

  document.querySelectorAll(".recommendation").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOpportunityId = button.dataset.id;
      renderRecommendations();
      renderDetail();
    });
  });

  renderDetail();
}

function matchReason(opportunity) {
  const reasons = [];
  if (opportunity.degreeScore > 0 && currentIntent.degreeLabel) reasons.push(`fits ${currentIntent.degreeLabel}`);
  if (opportunity.intentHits?.length) reasons.push(`fits ${opportunity.intentHits.slice(0, 2).join(", ")}`);
  if (opportunity.semantic) reasons.push("matches the chat meaning");
  if (opportunity.softMatched.length) reasons.push(`uses ${opportunity.softMatched.map(skillName).slice(0, 2).join(", ")}`);
  if (opportunity.category) reasons.push(`${titleCase(opportunity.category)} role`);
  return `Why it matched: ${reasons.slice(0, 3).join(", ") || "passes hard filters"}.`;
}

function renderModelInsights(profile, ranked) {
  const topCategories = ranked.slice(0, 20).reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});
  const categoryText = Object.entries(topCategories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => `${titleCase(key)} (${count})`);

  const chips = [
    `State: ${profile.state}`,
    `Education: ${profile.education}`,
    profile.language && profile.language !== "en" ? `Language: ${languageLabel(profile.language)}` : "",
    currentIntent.degreeLabel ? `Degree: ${currentIntent.degreeLabel}` : "",
    `Skills: ${profile.skills.map(skillName).join(", ") || "none"}`,
    `Related roles: ${currentIntent.queryTerms.slice(0, 5).join(", ") || "none yet"}`,
    `Best buckets: ${categoryText.join(", ") || "none"}`
  ].filter(Boolean);

  elements.modelInsights.innerHTML = chips.map((chip) => `<span class="insight-chip">${chip}</span>`).join("");
}

function extractSkillsFromText(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [skill, aliases] of intentModel.skills) {
    if (includesAny(lower, aliases) || lower.includes(skill.replace("-", " "))) found.push(skill);
  }
  return unique(found);
}

function generateSkillGap(opportunity, knownSkills) {
  const profile = getProfile();
  const userSkills = unique([...profile.skills, ...knownSkills]);
  const matchedMust = opportunity.skillsMustHave.filter((skill) => userSkills.includes(skill));
  const missingMust = opportunity.skillsMustHave.filter((skill) => !userSkills.includes(skill));
  const matchedGood = opportunity.skillsGoodToHave.filter((skill) => userSkills.includes(skill));
  const missingGood = opportunity.skillsGoodToHave.filter((skill) => !userSkills.includes(skill));
  const readiness = missingMust.length ? "Learn first" : "Can try now";
  const cacheKey = guideCacheKey(opportunity, profile, knownSkills);
  const cache = readStore(storageKeys.guideCache, {});

  if (cache[cacheKey]) {
    return { ...cache[cacheKey], fromCache: true };
  }

  const report = {
    opportunityId: opportunity.id,
    title: `${opportunity.title} guide`,
    language: profile.language || "en",
    target_language: languageLabel(profile.language || "en"),
    readiness,
    knownSkills: userSkills,
    matchedMust,
    missingMust,
    matchedGood,
    missingGood,
    english_guide: {
      summary: "Here is what you should focus on next.",
      employer_expectations: ["Understand the daily work clearly", "Show basic discipline and willingness to learn"],
      learn_before_applying: [...missingMust, ...missingGood].slice(0, 4).map(skillName),
      learn_on_the_job: ["Company process", "Product or service details", "Team-specific tools"],
      learning_plan: [...missingMust, ...missingGood].slice(0, 4).map((skill) => ({
        skill: skillName(skill),
        how_to_learn: "Search beginner videos, practice daily, and make one small example.",
        practice_task: `Practice ${skillName(skill)} for 30 minutes today.`
      })),
      youtube_searches: [...missingMust, ...missingGood].slice(0, 3).map((skill) => ({
        query: `${opportunity.title} ${skillName(skill)} beginner practice`,
        why: "Use this to find practical beginner videos."
      })),
      interview_practice: ["Tell me about yourself for this role.", "Why do you want this job?"],
      apply_checklist: ["Resume", "ID proof", "Education proof", "Phone number and email"]
    },
    modelUsed: "local_skill_gap_v1",
    createdAt: new Date().toISOString(),
    fromCache: false
  };
  cache[cacheKey] = report;
  writeStore(storageKeys.guideCache, cache);
  return report;
}

function renderGuideBody(report, options = {}) {
  const matched = options.showSkills === false ? [] : report.matched_skills || [...(report.matchedMust || []), ...(report.matchedGood || [])];
  const missing = options.showSkills === false ? [] : report.missing_skills || [...(report.missingMust || []), ...(report.missingGood || [])];
  return `
    ${options.title ? `<div class="guide-section-title"><h4>${options.title}</h4></div>` : ""}
      <div class="gap-status ${report.readiness === "Can try now" ? "ready" : "learn"}">
        <strong>${report.readiness}</strong>
        <span>${report.summary || "Here is what you should focus on next."}</span>
      </div>
      ${
        options.showSkills === false
          ? ""
          : `<div class="gap-columns">
              <div>
                <h4>You already match</h4>
                <div class="skill-grid">
                  ${matched.length ? matched.map((skill) => `<span class="tag skill good">${skillName(skill)}</span>`).join("") : `<span class="muted">No matched skills detected yet.</span>`}
                </div>
              </div>
              <div>
                <h4>Learn next</h4>
                <div class="skill-grid">
                  ${missing.length ? missing.slice(0, 6).map((skill) => `<span class="tag skill missing">${skillName(skill)}</span>`).join("") : `<span class="muted">No major gaps detected.</span>`}
                </div>
              </div>
            </div>`
      }
      ${
        report.employer_expectations?.length
          ? `<div class="learning-list">
              <h4>What employers look for</h4>
              ${report.employer_expectations.map((item) => `<div class="learning-item"><span>${item}</span></div>`).join("")}
            </div>`
          : ""
      }
      ${
        report.learn_before_applying?.length || report.learn_on_the_job?.length
          ? `<div class="gap-columns">
              <div>
                <h4>Learn before applying</h4>
                <div class="clean-mini-list">${(report.learn_before_applying || []).map((item) => `<span>${item}</span>`).join("") || `<span>Prepare your basic documents and introduction.</span>`}</div>
              </div>
              <div>
                <h4>Usually learned on the job</h4>
                <div class="clean-mini-list">${(report.learn_on_the_job || []).map((item) => `<span>${item}</span>`).join("") || `<span>Company process and product details.</span>`}</div>
              </div>
            </div>`
          : ""
      }
      ${
        report.learning_plan?.length
          ? `<div class="learning-list">
              <h4>How to learn</h4>
              ${report.learning_plan
                .map(
                  (item) => `
                    <div class="learning-item">
                      <strong>${titleCase(item.skill || "")}</strong>
                      <span>${item.how_to_learn || ""}</span>
                      ${item.practice_task ? `<em>${item.practice_task}</em>` : ""}
                    </div>
                  `
                )
                .join("")}
            </div>`
          : ""
      }
      ${
        report.youtube_searches?.length
          ? `<div class="learning-list">
              <h4>YouTube searches to try</h4>
              ${report.youtube_searches
                .map(
                  (item) => `
                    <div class="learning-item">
                      <strong>${item.query || item}</strong>
                      ${item.why ? `<span>${item.why}</span>` : ""}
                    </div>
                  `
                )
                .join("")}
            </div>`
          : ""
      }
      ${
        report.interview_practice?.length
          ? `<div class="learning-list">
              <h4>Interview practice</h4>
              ${report.interview_practice.map((item) => `<div class="learning-item"><span>${item}</span></div>`).join("")}
            </div>`
          : ""
      }
  `;
}

function renderSkillGapReport(report) {
  const guideLanguage = report.target_language || languageLabel(report.language || "en");
  const englishGuide = report.english_guide || null;
  const showEnglishGuide = englishGuide && (report.language || "en") !== "en";
  return `
    <div class="gap-report">
      <div class="guide-meta-row">
        <span class="tag">${guideLanguage} guide</span>
        ${showEnglishGuide ? `<span class="tag">English also included</span>` : ""}
      </div>
      ${renderGuideBody(report, { title: `${guideLanguage} version` })}
      ${
        showEnglishGuide
          ? `<div class="english-guide-block">
              ${renderGuideBody(
                {
                  ...englishGuide,
                  readiness: report.readiness,
                  matched_skills: report.matched_skills,
                  missing_skills: report.missing_skills
                },
                { title: "English version", showSkills: false }
              )}
            </div>`
          : ""
      }
    </div>
  `;
}

function renderGuideLoading() {
  return `
    <div class="guide-loading">
      <div class="loader-dots"><span></span><span></span><span></span></div>
      <strong>Creating your guide</strong>
      <p>Preparing practical next steps for this role.</p>
    </div>
  `;
}

function renderDetail() {
  const opportunity = getRankedOpportunities().find((item) => item.id === selectedOpportunityId);
  if (!opportunity) {
    elements.careerDetail.innerHTML = `<div class="empty-state">Select a matching opportunity to see skill gap and guide.</div>`;
    return;
  }
  const saved = isSaved(opportunity.id);
  const application = getApplication(opportunity.id);

  elements.careerDetail.innerHTML = `
    <div class="detail-hero">
      <div class="meta-row">
        <span class="score">${opportunity.score}% match</span>
        <span class="tag">${opportunity.readiness}</span>
        <span class="tag">${displaySourceLabel(opportunity.sourceName)}</span>
      </div>
      <h2>${opportunity.title}</h2>
      <p>${opportunity.summary || matchReason(opportunity)}</p>
      <div class="summary-grid">
        <div><strong>Employer</strong><span>${opportunity.organization || "Not listed"}</span></div>
        <div><strong>Location</strong><span>${opportunity.location || "Not listed"}</span></div>
        <div><strong>Pay</strong><span>${opportunity.salaryRange || "Not specified"}</span></div>
        <div><strong>Minimum education</strong><span>${opportunity.minEducationHard}</span></div>
      </div>
      <div class="action-row">
        <button class="secondary-action" type="button" data-action="save">${saved ? "Saved" : "Save job"}</button>
        ${
          opportunity.applyUrl
            ? `<a class="primary-action" href="${opportunity.applyUrl}" target="_blank" rel="noreferrer">Apply</a>`
            : `<span class="primary-action disabled">No apply link</span>`
        }
        <button class="primary-action" type="button" data-action="guide">Skill guide</button>
        <button class="secondary-action" type="button" data-action="applied">${application ? "Applied" : "Mark applied"}</button>
      </div>
    </div>

    <div class="detail-section">
      <h3>What you will do</h3>
      <ul class="clean-list">
        ${(opportunity.dailyWork.length ? opportunity.dailyWork : textToBullets(opportunity.description)).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-section">
      <h3>Hard requirements</h3>
      <div class="skill-grid">
        <span class="tag skill good">Education: ${opportunity.minEducationHard}</span>
        ${
          opportunity.skillsMustHave.length
            ? opportunity.skillsMustHave
                .map((skill) => `<span class="tag ${opportunity.mustMatched.includes(skill) ? "skill good" : "skill missing"}">${skillName(skill)}</span>`)
                .join("")
            : `<span class="tag skill good">No strict skill detected</span>`
        }
      </div>
    </div>

    <div class="detail-section">
      <h3>Flexible or preferred</h3>
      <div class="skill-grid">
        ${opportunity.educationPreferred.map((item) => `<span class="tag">Preferred education: ${item}</span>`).join("")}
        ${opportunity.skillsGoodToHave.map((skill) => `<span class="tag ${opportunity.softMatched.includes(skill) ? "skill good" : ""}">${skillName(skill)}</span>`).join("")}
      </div>
      <p>For flexible private jobs, missing preferred skills lower the match but do not remove the opportunity.</p>
    </div>

    <div class="detail-section">
      <h3>Application checklist</h3>
      <div class="checklist">
        <label class="check"><input type="checkbox" ${application?.checklist?.resumeReady ? "checked" : ""} /> Resume ready</label>
        <label class="check"><input type="checkbox" ${application?.checklist?.idProofReady ? "checked" : ""} /> ID proof ready</label>
        <label class="check"><input type="checkbox" ${application?.checklist?.educationProofReady ? "checked" : ""} /> Education proof ready</label>
        <label class="check"><input type="checkbox" checked /> Phone/email ready</label>
      </div>
    </div>

    <div class="detail-section">
      <h3>Where to apply</h3>
      <div class="apply-box">
        <div>
          <strong>${displaySourceLabel(opportunity.sourceName)}</strong>
          <span>${opportunity.applyUrl ? "Open the original listing and complete the application there." : "This role needs a verified application link before applying."}</span>
        </div>
        ${opportunity.applyUrl ? `<a class="apply-link" href="${opportunity.applyUrl}" target="_blank" rel="noreferrer">Open listing</a>` : `<span class="apply-link disabled">No link</span>`}
      </div>
    </div>
  `;

  const saveButton = elements.careerDetail.querySelector('[data-action="save"]');
  const appliedButton = elements.careerDetail.querySelector('[data-action="applied"]');
  const guideButton = elements.careerDetail.querySelector('[data-action="guide"]');
  saveButton?.addEventListener("click", () => toggleSaved(opportunity.id));
  appliedButton?.addEventListener("click", () => markApplied(opportunity));
  guideButton?.addEventListener("click", () => openSkillGuide(opportunity));
}

function cardForCollection(opportunity, extra = "") {
  return `
    <button class="collection-card" type="button" data-job-id="${opportunity.id}">
      <span class="tag">${displaySourceLabel(opportunity.sourceName)}</span>
      <strong>${opportunity.title}</strong>
      <span>${opportunity.organization || "Employer not listed"} · ${opportunity.location || "Location not listed"}</span>
      ${extra}
    </button>
  `;
}

function renderCollections() {
  if (!data.opportunities.length) return;
  const saved = readStore(storageKeys.savedJobs, []);
  const applications = readStore(storageKeys.applications, []);
  const byId = new Map(data.opportunities.map((item) => [item.id, item]));

  elements.savedJobsPanel.innerHTML = saved.length
    ? saved
        .map((item) => byId.get(item.opportunityId))
        .filter(Boolean)
        .map((job) => cardForCollection(job, `<span>Saved for later review</span>`))
        .join("")
    : `<div class="guide-empty">No saved jobs yet. Save jobs from Discover to compare them here.</div>`;

  elements.appliedJobsPanel.innerHTML = applications.length
    ? applications
        .map((item) => ({ app: item, job: byId.get(item.opportunityId) }))
        .filter((item) => item.job)
        .map(({ app, job }) => cardForCollection(job, `<span>Status: ${titleCase(app.status)} · ${new Date(app.updatedAt).toLocaleDateString()}</span>`))
        .join("")
    : `<div class="guide-empty">No applied jobs yet. Mark jobs as applied after opening the source link.</div>`;

  document.querySelectorAll(".collection-card").forEach((button) => {
    button.addEventListener("click", () => {
      selectedOpportunityId = button.dataset.jobId;
      switchView("discover");
      renderRecommendations();
    });
  });
}

function switchView(view) {
  enterApplication();
  document.querySelectorAll(".nav-tab").forEach((button) => button.classList.toggle("active", button.dataset.tab === view));
  document.querySelectorAll(".app-view").forEach((panel) => panel.classList.toggle("active", panel.dataset.view === view));
  renderCollections();
}

function openSkillGuide(opportunity) {
  currentGuideOpportunity = opportunity;
  elements.dialogSubtitle.textContent = opportunity.title;
  elements.skillGuideInput.value = "";
  if (elements.skillGuideTranscript) elements.skillGuideTranscript.textContent = "";
  setGuideVoiceStatus("Use your own language. Recording stops after 5 seconds.");
  elements.skillGuideResult.innerHTML = `<div class="guide-empty">Tap the mic and say what you already know.</div>`;
  if (typeof elements.skillGuideDialog.showModal === "function") {
    elements.skillGuideDialog.showModal();
  } else {
    elements.skillGuideDialog.setAttribute("open", "open");
  }
}

async function createSkillGuide() {
  if (!currentGuideOpportunity) return;
  const userText = elements.skillGuideInput.value || "";
  if (!userText.trim()) {
    setGuideVoiceStatus("Tap the mic and speak first.");
    return;
  }
  const normalizedSkillIntent = await normalizeIntentText(userText, "skill-guide", currentIntent.detectedLanguage || "").catch(() => null);
  const normalizedSkillText = normalizedSkillIntent?.normalized_english || "";
  const knownSkills = extractSkillsFromText(`${userText}\n${normalizedSkillText}`);
  elements.skillGuideResult.innerHTML = renderGuideLoading();
  const userProfile = getProfile();
  const guideLanguage = normalizedSkillIntent?.detected_language || normalizedSkillIntent?.profile?.language || "";
  if (guideLanguage) userProfile.language = guideLanguage;
  userProfile.normalizedSkillText = normalizedSkillText;
  const targetLanguage = userProfile.language || currentIntent.detectedLanguage || "en";
  const targetLanguageLabel = languageLabel(targetLanguage);
  const localReport = generateSkillGap(currentGuideOpportunity, knownSkills);

  try {
    const response = await fetch("/api/skill-guide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userProfile,
        targetLanguage,
        targetLanguageLabel,
        knownSkills,
        userText,
        normalizedSkillText,
        normalizedEnglish: currentIntent.normalizedEnglish || "",
        detectedLanguage: currentIntent.detectedLanguage || "",
        guideDetectedLanguage: guideLanguage,
        job: currentGuideOpportunity
      })
    });
    const guide = response.ok ? await response.json() : localReport;
    const normalizedGuide = {
      ...guide,
      opportunityId: currentGuideOpportunity.id,
      title: guide.title || `${currentGuideOpportunity.title} guide`,
      language: guide.language || targetLanguage,
      target_language: guide.target_language || targetLanguageLabel
    };
    const cache = readStore(storageKeys.guideCache, {});
    cache[guideCacheKey(currentGuideOpportunity, userProfile, knownSkills)] = normalizedGuide;
    writeStore(storageKeys.guideCache, cache);
    elements.skillGuideResult.innerHTML = renderSkillGapReport(normalizedGuide);
    renderCollections();
  } catch {
    elements.skillGuideResult.innerHTML = renderSkillGapReport(localReport);
    renderCollections();
  }
}

function normalizeOpportunity(record) {
  const enriched = record.enriched || {};
  const skills = Array.isArray(record.skills_normalized) ? record.skills_normalized : [];
  const mustHave = enriched.skills_must_have || skills.slice(0, Math.min(1, skills.length));
  const goodToHave = enriched.skills_good_to_have || skills.filter((skill) => !mustHave.includes(skill));
  return {
    id: record.id,
    title: cleanDisplayText(record.title) || "Untitled opportunity",
    sourceType: record.source_type || "private_job",
    sourceName: record.source_name || "Unknown source",
    category: record.category || "general_entry_level",
    organization: cleanDisplayText(record.organization) || "",
    location: cleanDisplayText(record.location || record.state) || "",
    state: record.state || "",
    minEducationHard: record.min_education_hard || "10th pass",
    educationPreferred: Array.isArray(record.education_preferred) ? record.education_preferred : [],
    salaryRange: cleanDisplayText(enriched.pay || record.salary_or_stipend) || "",
    fresherFriendly: Boolean(record.fresher_friendly),
    skillsMustHave: mustHave,
    skillsGoodToHave: goodToHave,
    description: cleanDisplayText(record.description) || "",
    summary: cleanDisplayText(enriched.summary) || "",
    dailyWork: Array.isArray(enriched.daily_work) ? enriched.daily_work.map(cleanDisplayText) : [],
    requirements: Array.isArray(enriched.requirements) ? enriched.requirements.map(cleanDisplayText) : [],
    enrichmentMethod: enriched.enrichment_method || "",
    applyUrl: record.apply_url || record.source_url || "",
    postedDate: record.posted_date || "",
    confidence: record.confidence || "medium"
  };
}

function renderDatasetStats(records) {
  const counts = records.reduce(
    (acc, record) => {
      acc.total += 1;
      acc.sources[record.source_name || "Unknown"] = (acc.sources[record.source_name || "Unknown"] || 0) + 1;
      acc.categories[record.category || "general"] = (acc.categories[record.category || "general"] || 0) + 1;
      return acc;
    },
    { total: 0, sources: {}, categories: {} }
  );
  const topCategory = Object.entries(counts.categories).sort((a, b) => b[1] - a[1])[0];
  elements.datasetStats.innerHTML = `
    <span class="stat-chip">${counts.total} opportunities</span>
    <span class="stat-chip">Public + private</span>
    <span class="stat-chip">${topCategory ? titleCase(topCategory[0]) : "Entry level"}</span>
  `;
}

async function loadOpportunities() {
  try {
    const [response, enrichedResponse] = await Promise.all([
      fetch("/data/opportunities.json", { cache: "no-store" }),
      fetch("/data/enriched_opportunities.json", { cache: "no-store" })
    ]);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const records = await response.json();
    const enrichedRecords = enrichedResponse.ok ? await enrichedResponse.json() : [];
    const enrichedById = new Map(enrichedRecords.map((item) => [item.id, item]));
    const mergedRecords = records.map((record) => ({ ...record, enriched: enrichedById.get(record.id) || {} }));
    renderDatasetStats(records);
    data.opportunities = mergedRecords.map(normalizeOpportunity);
    currentIntent = buildIntent(elements.chatInput.value);
    renderCollections();
  } catch (error) {
    elements.matchSummary.textContent = `Could not load real data: ${error.message}`;
    data.opportunities = [];
  }
  renderRecommendations();
}

elements.chatBtn.addEventListener("click", () => {
  nextSearchSource = "chat";
  applyChatExtraction();
});
elements.voiceBtn?.addEventListener("click", toggleVoiceRecording);
elements.chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    nextSearchSource = "chat";
    applyChatExtraction();
  }
});
elements.refreshBtn.addEventListener("click", renderRecommendations);
elements.closeSkillDialog?.addEventListener("click", () => {
  if (voiceRecorder && voiceRecorder.state === "recording") stopVoiceRecording();
  elements.skillGuideDialog.close();
});
elements.generateSkillGuideBtn?.addEventListener("click", createSkillGuide);
elements.skillGuideVoiceBtn?.addEventListener("click", toggleSkillGuideVoiceRecording);
elements.resumeInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
    const text = await file.text();
    elements.skillsTextInput.value = `${elements.skillsTextInput.value} ${text.slice(0, 1500)}`.trim();
    await applyChatExtraction();
  } else {
    elements.skillsTextInput.value = `${elements.skillsTextInput.value} Resume attached: ${file.name}`.trim();
  }
});
document.querySelectorAll(".nav-tab").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.tab));
});
document.querySelectorAll(".example-row button").forEach((button) => {
  button.addEventListener("click", async () => {
    elements.chatInput.value = button.textContent.trim();
    nextSearchSource = "chat";
    await applyChatExtraction();
  });
});
document.querySelectorAll("select, input[type='checkbox']").forEach((input) => {
  input.addEventListener("change", renderRecommendations);
});

loadOpportunities();
