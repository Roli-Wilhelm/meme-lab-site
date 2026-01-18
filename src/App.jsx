// App.jsx — Updated with Projects table (Google Sheet → Apps Script JSON → fetchView("projects"))
// Projects now render as:
// - Mobile: stacked cards (title + funder + summary)
// - md+: a 3-column table (Title, Summary, Funding agency)
// If `url` is present, the Title becomes a link.

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchView } from "@/lib/google";
import {
  ExternalLink,
  Mail,
  MapPin,
  Microscope,
  Images,
  Quote,
  FlaskConical,
  GraduationCap,
  BookOpen,
  Rss,
  Github,
  Lock,
  FileText,
  Database,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  ShieldCheck,
  Network,
  FolderKanban,
  Bot,
} from "lucide-react";

// Header logo assets from /public (Vite serves them from the site root)
const HEADER_LOGO_DEFAULT = "/meme.logo.png";
const HEADER_LOGO_EASTER_EGG = "/meme.logo.joyful.discovery.png";

// Background tiles
const OVERLAY_TILES = [
  "/patterns/tile1.caulobacter.svg",
  "/patterns/tile2.nematode.lasso.fungus.svg",
  "/patterns/tile3.mycorrhizae.svg",
  "/patterns/tile4.springtail.spider.svg",
  "/patterns/tile5.firefly.svg",
  "/patterns/tile6.root.nodulation.svg",
  "/patterns/tile7.woodrot.fungus.svg",
  "/patterns/tile8.earthworm.midden.svg",
];

const PLACEHOLDER = {
  // Lab identity
  labName: "Managed Ecosystem Microbial Ecology Lab",
  shortName: "MEME Lab",
  labEmail: "rcwilhelm@purdue.edu",
  dept: "Department of Agronomy, Purdue University",
  location: "West Lafayette, Indiana",

  // Header link targets
  locationMapLink: "https://maps.app.goo.gl/FDXD2dZ28cQydot19",

  // Hosting / org
  githubOrg: "https://github.com/REPLACE_ME",

  // Public-facing links
  publications: "https://www.zotero.org/groups/meme-lab-website/library",
  photoGallery: "https://photos.app.goo.gl/ZR5tYz2Lnmk84bQx9",
  dataRepo: "https://osf.io/6nepb/",

  // Protocols
  protocolsIoWorkspace:
    "https://www.protocols.io/workspaces/meme-lab-protocols/publications",
  labSopDriveFolder: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Recruiting / onboarding
  onboardingDoc: "https://docs.google.com/document/d/REPLACE_ME/edit",
  labHandbook: "https://docs.google.com/document/d/REPLACE_ME/edit",

  // Member intake (Google Form)
  memberIntakeForm:
    "https://docs.google.com/forms/d/e/1FAIpQLSdpsunIvIL1liqZONB_jKRUQlnYLL43oqPkOLOhyt1ExHIlNg/viewform?usp=sharing&ouid=103113252249213016667",

  // CONTENT APIS
  rosterJsonUrl: "https://script.google.com/macros/s/AKfycbxNlMtVp0DIPvh0IihjpAlQ79Ge4RNgpn7B3dNFp4h3mY6UfeukbpzfP5TKwDokmt7DHA/exec?view=roster",
  quotesJsonUrl: "https://script.google.com/macros/s/AKfycbxNlMtVp0DIPvh0IihjpAlQ79Ge4RNgpn7B3dNFp4h3mY6UfeukbpzfP5TKwDokmt7DHA/exec?view=quotes",
  quizJsonUrl: "https://script.google.com/macros/s/AKfycbxNlMtVp0DIPvh0IihjpAlQ79Ge4RNgpn7B3dNFp4h3mY6UfeukbpzfP5TKwDokmt7DHA/exec?view=quiz",
  quizLogUrl: "https://script.google.com/macros/s/AKfycbxNlMtVp0DIPvh0IihjpAlQ79Ge4RNgpn7B3dNFp4h3mY6UfeukbpzfP5TKwDokmt7DHA/exec",
  projectsJsonUrl:
    "https://script.google.com/macros/s/AKfycbxNlMtVp0DIPvh0IihjpAlQ79Ge4RNgpn7B3dNFp4h3mY6UfeukbpzfP5TKwDokmt7DHA/exec?view=projects",
  announcementsJsonUrl:
    "https://script.google.com/macros/s/AKfycbxNlMtVp0DIPvh0IihjpAlQ79Ge4RNgpn7B3dNFp4h3mY6UfeukbpzfP5TKwDokmt7DHA/exec?view=announcements",
  publicAssetsDriveFolder: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Private / current members
  currentMembersHub: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Safety
  safety: "https://www.purdue.edu/ehps/",

    // Research resources
  sipNavigator: "https://chatgpt.com/g/g-EO0rQOq7r-sip-navigator-beta", // Stable Isotope Probing Navigator
  sipdb: "http://sip-db.com/", // SIPdb landing page / app
  stanAgDataAdvisor: "https://chatgpt.com/g/g-wK0NsSO0A-stan-the-agdata-advisor", // Stan the AgData Advisor
  streamsGuideline: "https://www.nature.com/articles/s41564-025-02186-2", // STREAMS guideline
  misipStandard: "https://academic.oup.com/gigascience/article/doi/10.1093/gigascience/giae071/7817747", // MISIP standard
  autosip: "", // AutoSIP GitHub Page
};

const NAV = {
  home: "home",
  research: "research",
  members: "members",
  gallery: "gallery",
  quotes: "quotes",
  current: "current",
};

function toDateString_(v) {
  if (!v) return "";
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function formatAnnouncementTime_(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function pickFirstAuthor_(it) {
  if (it?.firstAuthor) return String(it.firstAuthor).trim();
  if (Array.isArray(it?.authors) && it.authors.length > 0)
    return String(it.authors[0]).trim();
  if (it?.creatorSummary) return String(it.creatorSummary).trim();
  return "";
}

function pickJournal_(it) {
  if (it?.journal) return String(it.journal).trim();
  if (it?.publicationTitle) return String(it.publicationTitle).trim();
  return "";
}

const QUIZ_DRAW_COUNT = 10;
const QUIZ_SEEN_KEY = "meme_quiz_seen_ids_v1";

function safeJsonParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function loadSeenIds() {
  if (typeof window === "undefined") return new Set();
  const raw = window.sessionStorage.getItem(QUIZ_SEEN_KEY);
  const arr = safeJsonParse(raw, []);
  return new Set(Array.isArray(arr) ? arr : []);
}

function saveSeenIds(seenSet) {
  if (typeof window === "undefined") return;
  const arr = Array.from(seenSet);
  window.sessionStorage.setItem(QUIZ_SEEN_KEY, JSON.stringify(arr));
}

// Build a quiz "deck" of indices into quizBank, excluding previously seen ids.
// If not enough unseen questions remain to draw N, reset the seen pool and draw from full bank.
function buildQuizDeck(quizBank, drawCount, seenSet) {
  const bank = Array.isArray(quizBank) ? quizBank : [];
  const n = Math.min(drawCount, bank.length);

  // Prefer stable ids; fall back to index-derived ids if missing (not ideal, but safe)
  const idForIndex = (i) => String(bank[i]?.id ?? `idx-${i}`);

  const unseenIndices = [];
  for (let i = 0; i < bank.length; i++) {
    const qid = idForIndex(i);
    if (!seenSet.has(qid)) unseenIndices.push(i);
  }

  // If we can't draw enough unseen questions, reset seen for this session
  let candidateIndices = unseenIndices;
  let resetSeen = false;
  if (candidateIndices.length < n) {
    candidateIndices = Array.from({ length: bank.length }, (_, i) => i);
    resetSeen = true;
  }

  const shuffled = shuffleArray(candidateIndices);
  const deck = shuffled.slice(0, n);

  const updatedSeen = resetSeen ? new Set() : new Set(seenSet);
  for (const idx of deck) updatedSeen.add(idForIndex(idx));

  return { deck, updatedSeen, resetSeen };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function LinkRow({ icon: Icon, title, desc, href, onClick }) {
  const isButton = typeof onClick === "function";
  const className =
    "group block rounded-2xl border bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

  if (isButton) {
    return (
      <button type="button" onClick={onClick} className={className}>
        <div className="flex items-start gap-3 text-left">
          <div className="mt-0.5 rounded-xl border bg-white p-2">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold leading-5">{title}</div>
              <ExternalLink className="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border bg-white p-2">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold leading-5">{title}</div>
            <ExternalLink className="h-4 w-4 opacity-60 transition group-hover:opacity-100" />
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
        </div>
      </div>
    </a>
  );
}

function Pill({ children, href }) {
  const cls =
    "inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs font-medium transition hover:bg-white hover:shadow-sm";

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {children}
      </a>
    );
  }

  return <span className={cls}>{children}</span>;
}

const FALLBACK_RESEARCH_AREAS = [
  {
    title: "Rhizosphere nutrient acquisition",
    bullets: [
      "Microbial mediation of P and N cycling under managed ecosystems",
      "Trait-based links from genomes to field outcomes",
      "SIP-enabled assignment of function to taxa",
    ],
  },
  {
    title: "Microbiome engineering & experimentation",
    bullets: [
      "Design–build–test workflows for microbial communities",
      "Automation and reproducible protocols",
      "Greenhouse-to-field translation",
    ],
  },
  {
    title: "FAIR data + community standards",
    bullets: [
      "Controlled vocabularies and metadata for microbial ecology",
      "Open repositories, reusable workflows",
      "Education and training in data practices",
    ],
  },
];

const FALLBACK_MEMBERS = [
  {
    id: "roland-wilhelm",
    name: "Roland Wilhelm",
    role: "PI / Lab Lead",
    focus: "Microbiome ecology, data standards, stable isotope probing",
    photoUrl: "",
    links: { website: "https://ag.purdue.edu/directory/rcwilhel" },
    publish: true,
  },
];

const FALLBACK_QUOTES = [
  {
    text: "We study microbes as infrastructure: invisible, essential, and shaped by management.",
    attribution: "MEME Lab",
    publish: true,
  },
  {
    text: "Data are not a byproduct; they are a deliverable.",
    attribution: "Lab principle",
    publish: true,
  },
];

const FALLBACK_QUIZ = [
  {
    id: "base-cation-k",
    question: "Which is typically considered a base cation in soils?",
    choices: ["K⁺", "NO₃⁻", "Cl⁻", "H₂O"],
    answerIndex: 0,
    explanation:
      "K⁺ is a base cation along with Ca²⁺, Mg²⁺, Na⁺ (context-dependent).",
    tags: ["soil-chemistry"],
    publish: true,
  },
  {
    id: "sip-goal",
    question: "In stable isotope probing (SIP), the primary goal is to:",
    choices: [
      "Separate active from inactive taxa by isotope incorporation",
      "Measure soil texture",
      "Quantify pH without electrodes",
      "Remove PCR inhibitors",
    ],
    answerIndex: 0,
    explanation:
      "SIP links activity to identity by tracking isotope incorporation into nucleic acids.",
    tags: ["methods"],
    publish: true,
  },
];

const FALLBACK_ANNOUNCEMENTS = [
  {
    title: "Recruiting",
    text: "Short call-to-action with link to the intake form.",
    url: "https://REPLACE_ME",
    publish: true,
    time: "",
  },
  {
    title: "Latest paper / preprint",
    text: "Link to DOI or preprint server.",
    url: "https://REPLACE_ME",
    publish: true,
    time: "",
  },
  {
    title: "Recent field campaign",
    text: "Link to the gallery album.",
    url: "https://REPLACE_ME",
    publish: true,
    time: "",
  },
];

// UPDATED: Projects are now table-driven (title, summary, funder, url)
const FALLBACK_PROJECTS = [
  {
    title: "Project title 1",
    summary:
      "One-paragraph description: question, system, and what success looks like.",
    funder: "Funding agency / program",
    url: "https://REPLACE_ME",
    publish: true,
  },
  {
    title: "Project title 2",
    summary:
      "One-paragraph description: question, system, and what success looks like.",
    funder: "Funding agency / program",
    url: "",
    publish: true,
  },
];

const FALLBACK_GALLERY_PHOTOS = [
  "https://photos.app.goo.gl/a34KLz7R6E1Hm1Hh7",
  "https://photos.app.goo.gl/ZrPXvHfVgmKRi14fA",
  "https://photos.app.goo.gl/iLu9ewFdFjVUaCyF9",
  "https://photos.app.goo.gl/D4MJDXNcSSgtXbXq6",
  "https://photos.app.goo.gl/FBhuLVfCpy5mQFSq6",
  "https://photos.app.goo.gl/qGbQeyKc7X9a6GRY8",
];

function Avatar({ name, photoUrl, className = "" }) {
  const initial = (name || "?").trim().slice(0, 1).toUpperCase();
  const base =
    `w-full aspect-square rounded-2xl border bg-white object-cover ${className}`.trim();

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`${name} headshot`}
        className={base}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${base} text-xl font-semibold`}
    >
      {initial}
    </div>
  );
}

function trackTabPageView(tabKey) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag !== "function") return;

  const key = String(tabKey || "unknown");
  const label = (TAB_LABELS && TAB_LABELS[key]) ? TAB_LABELS[key] : key;

  window.gtag("event", "page_view", {
    page_path: `/${key}`,
    page_title: `MEME Lab — ${label}`,
    tab_name: label,
  });
}

const TAB_LABELS = {
  home: "Home",
  research: "Research",
  members: "Lab members",
  gallery: "Gallery",
  quotes: "Quotes & Quiz",
  current: "Member portal",
};

async function postQuizAttempt({ endpoint, questionId, correct }) {
  if (!endpoint) return;

  const payload = {
    question_id: questionId || "unknown",
    correct: !!correct,
  };

  try {
    await fetch(endpoint, {
      method: "POST",
      // Apps Script is often pickier with JSON + CORS; text/plain is the most reliable
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
      mode: "cors",
      keepalive: true,
    });
  } catch {
    // Never break UX if logging fails
  }
}

export default function ManagedEcosystemMicrobialEcologyLabSite() {
 
  const [overlayTiles, setOverlayTiles] = useState(() => shuffleArray(OVERLAY_TILES));

  useEffect(() => {
    setOverlayTiles(shuffleArray(OVERLAY_TILES)); // once per page load
  }, []);

  const overlayStyle = useMemo(() => {
    const tileUrls = overlayTiles.map((src) => `url("${src}")`);

    const backgroundImage = [
      'radial-gradient(900px 520px at 20% 8%, rgba(214,156,64,0.18), transparent 58%)',
      'radial-gradient(900px 520px at 80% 22%, rgba(181,88,29,0.12), transparent 62%)',
      ...tileUrls,
    ].join(", ");

    const backgroundRepeat = [
      "no-repeat",
      "no-repeat",
      ...overlayTiles.map(() => "repeat"),
    ].join(", ");

    const backgroundSize = [
      "auto",
      "auto",
      ...overlayTiles.map((_, i) => {
        const base = 240; // your prior tile size
        const step = 0;   // set to 10–20 if you want slight variation
        const s = base + (i % 4) * step;
        return `${s}px ${s}px`;
      }),
    ].join(", ");

    const backgroundPosition = [
      "center",
      "center",
      ...overlayTiles.map((_, i) => `${(i * 37) % 240}px ${(i * 61) % 240}px`),
    ].join(", ");

    return {
      backgroundImage,
      backgroundRepeat,
      backgroundSize,
      backgroundPosition,
      opacity: 0.22,
      maskImage:
        "radial-gradient(1200px 700px at 50% 20%, black 55%, transparent 100%)",
      WebkitMaskImage:
        "radial-gradient(1200px 700px at 50% 20%, black 55%, transparent 100%)",
    };
  }, [overlayTiles]);

  const [activeTab, setActiveTab] = useState(NAV.home);
  
  useEffect(() => {
    trackTabPageView(activeTab);
  }, [activeTab]);

  const [headerLogoSrc, setHeaderLogoSrc] = useState(HEADER_LOGO_DEFAULT);

  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quotePaused, setQuotePaused] = useState(false);

  const [members, setMembers] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [quizBank, setQuizBank] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [projects, setProjects] = useState(null);
  const [scholarly, setScholarly] = useState([]);
  const [scholarlyLoaded, setScholarlyLoaded] = useState(false);

  const [galleryPhotos, setGalleryPhotos] = useState(null);

  const [memberSearch, setMemberSearch] = useState("");

  const [quizDeck, setQuizDeck] = useState([]);      // array of indices into quizBank
  const [quizPos, setQuizPos] = useState(0);         // current position within deck
  const [quizPick, setQuizPick] = useState(null);    // current selection for current question
  const [quizAnswers, setQuizAnswers] = useState([]); // per-question results in this attempt
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizSeenIds, setQuizSeenIds] = useState(() => loadSeenIds());

  useEffect(() => {
    (async () => {
      const [m, q, qb, p, a, s, g] = await Promise.allSettled([
        fetchView("roster"),
        fetchView("quotes"),
        fetchView("quiz"),
        fetchView("projects"),
        fetchView("announcements"),
        fetchView("scholarly"),
        fetchView("gallery"),
      ]);

      if (m.status === "fulfilled" && Array.isArray(m.value)) {
        setMembers(m.value.filter((x) => x?.publish !== false));
      } else {
        setMembers(FALLBACK_MEMBERS);
      }

      if (q.status === "fulfilled" && Array.isArray(q.value)) {
        setQuotes(q.value.filter((x) => x?.publish !== false));
      } else {
        setQuotes(FALLBACK_QUOTES);
      }

      if (qb.status === "fulfilled" && Array.isArray(qb.value)) {
        setQuizBank(qb.value.filter((x) => x?.publish !== false));
      } else {
        setQuizBank(FALLBACK_QUIZ);
      }

      if (p.status === "fulfilled" && Array.isArray(p.value)) {
        setProjects(p.value.filter((x) => x?.publish !== false));
      } else {
        setProjects(FALLBACK_PROJECTS);
      }

      if (a.status === "fulfilled" && Array.isArray(a.value)) {
        setAnnouncements(a.value.filter((x) => x?.publish !== false));
      } else {
        setAnnouncements(FALLBACK_ANNOUNCEMENTS);
      }

      if (s.status === "fulfilled" && Array.isArray(s.value)) {
        setScholarly(s.value);
      } else {
        setScholarly([]);
      }
      setScholarlyLoaded(true);

      if (g.status === "fulfilled" && Array.isArray(g.value)) {
        const items = g.value
          .map((x) => {
            // Support both object feeds and legacy string URL feeds
            if (typeof x === "string") return { id: "", url: x };
            return {
              id: x?.id ? String(x.id) : "",
              url: x?.url ? String(x.url) : "",
            };
          })
          .filter((x) => x.url);

        const fallbackItems = FALLBACK_GALLERY_PHOTOS.map((u) => ({ id: "", url: u }));
        setGalleryPhotos(items.length ? items : fallbackItems);
      } else {
        setGalleryPhotos(FALLBACK_GALLERY_PHOTOS.map((u) => ({ id: "", url: u })));
      }

    })();
  }, []);

  useEffect(() => {
    let timeoutId = null;

    function onScroll() {
      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 10;

      if (atBottom) {
        // Switch to easter egg logo
        setHeaderLogoSrc(HEADER_LOGO_EASTER_EGG);

        // Clear any existing timer
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Revert back after 1 second
        timeoutId = setTimeout(() => {
          setHeaderLogoSrc(HEADER_LOGO_DEFAULT);
          timeoutId = null;
        }, 1500);
      }
    }

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  function startNewQuizAttempt() {
    if (!quizBank?.length) return;

    const { deck, updatedSeen } = buildQuizDeck(
      quizBank,
      QUIZ_DRAW_COUNT,
      quizSeenIds
    );

    setQuizDeck(deck);
    setQuizPos(0);
    setQuizPick(null);
    setQuizAnswers([]);
    setQuizFinished(false);

    setQuizSeenIds(updatedSeen);
    saveSeenIds(updatedSeen);
  }

  useEffect(() => {
    if (!quizBank?.length) return;

    // Create the first attempt as soon as the bank is loaded
    // (or whenever the quiz bank changes)
    startNewQuizAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizBank]);

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    const list = Array.isArray(members) ? members : [];
    if (!q) return list;
    return list.filter((m) => {
      const linksText = m?.links ? Object.values(m.links).join(" ") : "";
      return (
        (m?.name || "").toLowerCase().includes(q) ||
        (m?.role || "").toLowerCase().includes(q) ||
        (m?.focus || "").toLowerCase().includes(q) ||
        linksText.toLowerCase().includes(q)
      );
    });
  }, [members, memberSearch]);

  const sortedScholarly = useMemo(() => {
    const list = Array.isArray(scholarly) ? scholarly : [];
    return [...list].sort((a, b) => {
      const ta = new Date(
        a?.publicationDate ||
          a?.date ||
          a?.addedToLibrary ||
          a?.published ||
          a?.updated ||
          0
      ).getTime();
      const tb = new Date(
        b?.publicationDate ||
          b?.date ||
          b?.addedToLibrary ||
          b?.published ||
          b?.updated ||
          0
      ).getTime();
      return tb - ta;
    });
  }, [scholarly]);

  const currentQuiz = useMemo(() => {
    if (!Array.isArray(quizBank) || quizBank.length === 0) return null;
    if (!quizDeck.length) return null;
    const idx = quizDeck[quizPos];
    return quizBank[idx] || null;
  }, [quizBank, quizDeck, quizPos]);

  const randomGallery = useMemo(() => {
    const list = Array.isArray(galleryPhotos) ? galleryPhotos : [];
    if (!list.length) return [];
    return shuffleArray(list).slice(0, 12);
  }, [galleryPhotos]);

  const QUOTES_PER_SET = 3;

  function prevQuoteSet() {
    if (!displayItems.length) return;
    setQuoteIndex((i) => (i - 1 + displayItems.length) % displayItems.length);
  }

  function nextQuoteSet() {
    if (!displayItems.length) return;
    setQuoteIndex((i) => (i + 1) % displayItems.length);
  }

  const normalizedProjects = useMemo(() => {
    const list = Array.isArray(projects) ? projects : [];
    return list
      .map((p, idx) => {
        const title = p?.title ? String(p.title) : `Project ${idx + 1}`;
        const summary = p?.summary ? String(p.summary) : "";
        const funder =
          p?.funder ||
          p?.fundingAgency ||
          p?.funding_agency ||
          p?.agency ||
          "";
        const date = p?.date || p?.dates || p?.period || "";
        const url = p?.url || p?.readMoreUrl || p?.link || "";

        return {
          title,
          summary,
          funder: funder ? String(funder) : "",
          date: date ? String(date) : "",
          url: url ? String(url) : "",
        };
      })
      .filter((p) => p.title || p.summary || p.funder || p.date);
  }, [projects]);

  function nextQuizQuestion() {
    if (!quizDeck.length) return;

    const nextPos = quizPos + 1;

    if (nextPos < quizDeck.length) {
      setQuizPos(nextPos);
      setQuizPick(null);
      return;
    }

    // End of the deck
    setQuizFinished(true);
    setQuizPick(null);
  }

  const normalizedQuotes = useMemo(() => {
    const list = Array.isArray(quotes) ? quotes : [];
    return list
      .map((q, idx) => {
        const text = q?.text ? String(q.text).trim() : "";
        const attribution = q?.attribution ? String(q.attribution).trim() : "";
        const category = q?.category ? String(q.category).trim() : "";
        const url = q?.url ? String(q.url).trim() : "";

        // Type: "image" if url exists and text is blank; otherwise "text"
        const type = url && !text ? "image" : "text";

        return {
          id: q?.id || `${type}-${idx}`,
          type,
          text,
          attribution,
          category,
          url,
        };
      })
      .filter((x) => x.text || x.url); // keep non-empty items
  }, [quotes]);

  const displayItems = useMemo(() => {
    const list = Array.isArray(normalizedQuotes) ? normalizedQuotes : [];
    if (!list.length) return [];

    const out = [];
    let buffer = [];

    for (const it of list) {
      if (it.type === "image") {
        // flush any pending text quotes before showing an image
        if (buffer.length) {
          out.push({ kind: "textset", items: buffer });
          buffer = [];
        }
        out.push({ kind: "image", item: it });
        continue;
      }

      // text quote
      buffer.push(it);
      if (buffer.length === QUOTES_PER_SET) {
        out.push({ kind: "textset", items: buffer });
        buffer = [];
      }
    }

    // flush trailing text quotes (1–2)
    if (buffer.length) out.push({ kind: "textset", items: buffer });

    return out;
  }, [normalizedQuotes]);

  useEffect(() => {
    if (!displayItems.length) return;
    if (quotePaused) return;

    const t = window.setInterval(() => {
      setQuoteIndex((i) => (i + 1) % displayItems.length);
    }, 5000); // seconds adjust to needs

    return () => window.clearInterval(t);
  }, [displayItems.length, quotePaused]);

  useEffect(() => {
    setQuoteIndex(0);
  }, [displayItems.length]);

  function goToResearchProtocols() {
    setActiveTab(NAV.research);
    setTimeout(() => {
      const el = document.getElementById("protocols");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div
      className="
    relative min-h-screen
    bg-[linear-gradient(to_bottom,var(--bg-top),#D69C40_35%,#B5581D_62%,var(--bg-bottom))]
    text-slate-900
  "
      style={{
        // Choose a palette by changing these 3 values only:
        ["--bg-top"]: "#F3E2B3",      // Option A top tint
        ["--bg-bottom"]: "#23140A",   // Option A bottom tint
        ["--accent"]: "#D69C40",      // Option A accent
      }}
    >
      {/* background overlay: subtle pattern + soft vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={overlayStyle}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl"> 
              <img
                src={headerLogoSrc}
                alt="MEME Lab logo"
                className="h-full w-full object-contain"
                loading="eager"
              />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="truncate text-sm md:text-base lg:text-lg font-semibold leading-tight">
                {PLACEHOLDER.labName}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                Purdue University
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Pill href={PLACEHOLDER.locationMapLink}>
              <MapPin className="mr-1 h-3.5 w-3.5" />
              {PLACEHOLDER.location}
            </Pill>

            <Pill href={`mailto:${PLACEHOLDER.labEmail}`}>
              <Mail className="mr-1 h-3.5 w-3.5" />
              {PLACEHOLDER.labEmail}
            </Pill>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-white/95 backdrop-blur p-2 md:grid-cols-6 shadow-sm">
            <TabsTrigger className="rounded-xl" value={NAV.home}>
              Home
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.research}>
              Research
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.members}>
              Lab Members
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.gallery}>
              Gallery
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.quotes}>
              Quotes & Quiz
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.current}>
              Member Portal
            </TabsTrigger>
          </TabsList>

          {/* HOME */}
          <TabsContent value={NAV.home} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Left column - split into two cards */}
              <div className="md:col-span-2 space-y-6">
                {/* What we do card */}
                <Card className="rounded-2xl bg-white/95">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-xl">What we do</CardTitle>
                      <Button
                        size="sm"
                        className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 shrink-0"
                        onClick={() => setActiveTab(NAV.research)}
                      >
                        Explore research
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      The MEME Team studies how land management
                      shapes microbial communities and how those communities, in
                      turn, regulate nutrient cycling, plant health, and ecosystem
                      services. We develop reproducible workflows and open data
                      assets to make microbiome science more predictive and
                      actionable.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="rounded-full">
                        Soil and rhizosphere biogeochemistry
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        Stable isotope probing
                      </Badge>
                      <Badge variant="secondary" className="rounded-full">
                        Data standards & FAIR workflows
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* About the PI card */}
                <Card className="rounded-2xl bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-xl">About the PI</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm leading-6 text-muted-foreground">
                      Dr. Roland (Roli) Wilhelm, Assistant Professor of the Soil Microbiome, is a trained environmental microbiologist and microbial ecologists, who leads the MEME Lab and serves as the current Director of the Purdue Applied Microbiome Sciences Research Hub. He is an award-winning, data-driven scientist, former would-be science journalist, and one-time market gardener. He is shaped by an enthusiasm for teamwork, his immigrant roots, and passion for nature. Learn more about me on the Prospective Students page.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right column - Quick links (unchanged) */}
              <Card className="rounded-2xl bg-white/95">
                <CardHeader>
                  <CardTitle className="text-xl">Quick links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <LinkRow
                    icon={GraduationCap}
                    title="Prospective students"
                    desc="Recruitment information"
                    href={PLACEHOLDER.onboardingDoc}
                  />
                  <LinkRow
                    icon={FlaskConical}
                    title="Protocols"
                    desc="Lab research methods and SOPs"
                    href={PLACEHOLDER.protocolsIoWorkspace}
                  />
                  <LinkRow
                    icon={BookOpen}
                    title="Publications library"
                    desc="Zotero group library"
                    href={PLACEHOLDER.publications}
                  />
                  <LinkRow
                    icon={Database}
                    title="Open data"
                    desc="Accessioned Datasets & Code"
                    href={PLACEHOLDER.dataRepo}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Scholarly + Announcements (no Lab News wrapper) */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Scholarly panel (mobile-safe) */}
              <div className="rounded-2xl border bg-white/90 p-4 max-w-full overflow-hidden">
                <div className="flex min-w-0 items-start gap-2">
                  <Rss className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xl font-semibold leading-5 break-words">
                      MEME Lab Scholarly Activities
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Source: Zotero group library
                    </div>
                  </div>
                </div>

                {!scholarlyLoaded ? (
                  <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
                ) : sortedScholarly.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    No recent items found yet.
                  </p>
                ) : (
                  <>
                    {/* MOBILE: cards (no table) */}
                    <div className="mt-3 md:hidden max-h-80 overflow-y-auto pr-1">
                      <div className="space-y-2">
                        {sortedScholarly.map((it, idx) => {
                          const firstAuthor = pickFirstAuthor_(it) || "—";
                          const journal = pickJournal_(it) || "—";
                          const pubDate = toDateString_(it?.publicationDate) || "—";
                          const title = it?.title ? String(it.title) : "Untitled";
                          const url = it?.articleUrl
                            ? String(it.articleUrl)
                            : it?.zoteroUrl
                              ? String(it.zoteroUrl)
                              : "";

                          return (
                            <div
                              key={`${url || title}-${idx}`}
                              className="rounded-xl border bg-white/90 px-3 py-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-xs text-muted-foreground break-words">
                                    {firstAuthor} • {journal}
                                  </div>
                                  <div className="mt-1 min-w-0">
                                    {url ? (
                                      <a
                                        href={url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600 break-words"
                                      >
                                        {title}
                                      </a>
                                    ) : (
                                      <span className="font-medium break-words">{title}</span>
                                    )}
                                  </div>
                                </div>
                                <div className="shrink-0 text-[11px] text-muted-foreground">
                                  {pubDate}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* DESKTOP/TABLET: table (kept), but wrapped + fixed layout */}
                    <div className="mt-3 hidden md:block">
                      <div className="max-h-[420px] overflow-y-auto pr-1">
                        <div className="overflow-x-auto max-w-full bg-white">
                          <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                            <thead className="sticky top-0 z-10">
                              <tr className="text-left">
                                <th className="w-[18%] border-b bg-white px-3 py-2 font-semibold">
                                  First author
                                </th>
                                <th className="w-[22%] border-b bg-white px-3 py-2 font-semibold">
                                  Journal
                                </th>
                                <th className="w-[14%] border-b bg-white px-3 py-2 font-semibold">
                                  Pub date
                                </th>
                                <th className="w-[46%] border-b bg-white px-3 py-2 font-semibold">
                                  Title
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {sortedScholarly.map((it, idx) => {
                                const firstAuthor = pickFirstAuthor_(it) || "—";
                                const journal = pickJournal_(it) || "—";
                                const pubDate = toDateString_(it?.publicationDate) || "—";
                                const title = it?.title ? String(it.title) : "Untitled";
                                const url = it?.articleUrl
                                  ? String(it.articleUrl)
                                  : it?.zoteroUrl
                                    ? String(it.zoteroUrl)
                                    : "";

                                return (
                                  <tr key={`${url || title}-${idx}`} className="align-top bg-white">
                                    <td className="border-b px-3 py-2 text-muted-foreground break-words whitespace-normal">
                                      {firstAuthor}
                                    </td>
                                    <td className="border-b px-3 py-2 text-muted-foreground break-words whitespace-normal">
                                      {journal}
                                    </td>
                                    <td className="border-b px-3 py-2 text-muted-foreground break-words whitespace-normal">
                                      {pubDate}
                                    </td>
                                    <td className="border-b px-3 py-2 min-w-0 break-words whitespace-normal">
                                      {url ? (
                                        <a
                                          href={url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="font-medium underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600 break-words whitespace-normal"
                                        >
                                          {title}
                                        </a>
                                      ) : (
                                        <span className="font-medium break-words whitespace-normal">
                                          {title}
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Announcements panel (mobile-safe) */}
              <div className="rounded-2xl border bg-white/95 p-4 max-w-full overflow-hidden">
                <div className="flex min-w-0 items-start gap-2">
                  <Megaphone className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xl font-semibold leading-5 break-words">
                      Announcements
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Lab updates and notices
                    </div>
                  </div>
                </div>

                <div className="mt-2 max-h-80 md:max-h-[420px] overflow-y-auto pr-1">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(announcements || []).map((a, idx) => {
                      const when = formatAnnouncementTime_(a.time);

                      return (
                        <li
                          key={`${a.title || "a"}-${idx}`}
                          className="rounded-xl border bg-white/90 px-3 py-2 max-w-full overflow-hidden"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                            <div className="min-w-0 max-w-full">
                              <div className="font-medium text-slate-700 break-words whitespace-normal">
                                {a.title}
                              </div>

                              <div className="mt-1 break-words whitespace-normal max-w-full">
                                {a.url ? (
                                  <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500 break-words whitespace-normal"
                                    style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                                  >
                                    {a.text}
                                  </a>
                                ) : (
                                  <span
                                    className="break-words whitespace-normal"
                                    style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                                  >
                                    {a.text}
                                  </span>
                                )}
                              </div>
                            </div>

                            {when && (
                              <div className="text-xs text-muted-foreground sm:shrink-0 sm:text-right">
                                {when}
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

          </TabsContent>

          {/* RESEARCH */}
          <TabsContent value={NAV.research} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {FALLBACK_RESEARCH_AREAS.map((a) => (
                <Card key={a.title} className="rounded-2xl bg-white/95">
                  <CardHeader>
                    <CardTitle className="text-lg">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {a.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* UPDATED: Three resource badges (Safety merged into Lab Protocols) */}
            <div className="grid gap-6 md:grid-cols-3" id="protocols">
              {/* Lab Protocols (now includes safety button) */}
              <Card className="rounded-2xl bg-white/95">
                <CardHeader>
                  <CardTitle className="text-lg">Lab Protocols</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Curated lab methods and SOPs, organized for reproducibility and reuse.
                  </p>

                  <div className="space-y-2">
                    <LinkRow
                      icon={FlaskConical}
                      title="Protocols.io"
                      desc="Versioned methods with DOIs"
                      href={PLACEHOLDER.protocolsIoWorkspace}
                    />
                    <LinkRow
                      icon={Microscope}
                      title="SIP Navigator"
                      desc="Custom GPT trained to guide SIP experiments"
                      href={PLACEHOLDER.sipNavigator}
                    />

                    {/* MOVED HERE from the Safety badge */}
                    <Button
                      className="w-full rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                      variant="outline"
                      onClick={() => window.open(PLACEHOLDER.safety, "_blank")}
                    >
                      Purdue University Lab Safety Resources
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Databases and Code */}
              <Card className="rounded-2xl bg-white/95">
                <CardHeader>
                  <CardTitle className="text-lg">Databases and Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Databases, code, and analysis infrastructure maintained by the lab.
                  </p>

                  <div className="space-y-2">
                    <LinkRow
                      icon={Database}
                      title="SIPdb"
                      desc="Reverse ecology tool for attributing putative function"
                      href={PLACEHOLDER.sipdb}
                    />
                    <LinkRow
                      icon={Bot}
                      title="autoSIP"
                      desc="Print and assembly instructions for gradient fractionating robot"
                      href={PLACEHOLDER.autosip}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Data Handling */}
              <Card className="rounded-2xl bg-white/95">
                <CardHeader>
                  <CardTitle className="text-lg">Data Handling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Standards and guidance for FAIR data, metadata, and lab-to-archive workflows.
                  </p>

                  <div className="space-y-2">
                    <LinkRow
                      icon={FolderKanban}
                      title="Stan the AgData Advisor"
                      desc="Custom GPT trained to guide formatting and archiving data"
                      href={PLACEHOLDER.stanAgDataAdvisor}
                    />
                    <LinkRow
                      icon={Network}
                      title="STREAMS guideline"
                      desc="Recommended practices for host and environmental microbiome data"
                      href={PLACEHOLDER.streamsGuideline}
                    />
                    <LinkRow
                      icon={FileText}
                      title="MISIP standard"
                      desc="Standard for archival of SIP nucleic acid data"
                      href={PLACEHOLDER.misipStandard}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* UPDATED: Projects table fed from fetchView("projects") */}
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Current and Past Research Projects</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {normalizedProjects.length === 0 ? (
                  <div className="rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                    No projects found yet. Populate the Projects Google Sheet (via
                    <code>fetchView("projects")</code>) or update{" "}
                    <code>FALLBACK_PROJECTS</code>.
                  </div>
                ) : (
                  <>
                    {/* MOBILE: cards (no table) */}
                    <div className="md:hidden space-y-2">
                      {normalizedProjects.map((p, idx) => (
                        <div
                          key={`${p.url || p.title}-${idx}`}
                          className="rounded-xl border bg-white/90 px-3 py-2"
                        >
                          <div className="min-w-0">
                            {p.url ? (
                              <a
                                href={p.url}
                                target="_blank"
                                rel="noreferrer"
                                className="font-semibold underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600 break-words"
                                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                              >
                                {p.title}
                              </a>
                            ) : (
                              <div
                                className="font-semibold break-words"
                                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                              >
                                {p.title}
                              </div>
                            )}

                            {(p.funder || p.date) ? (
                              <div className="mt-1 text-xs text-muted-foreground break-words">
                                {p.funder ? <>Funding: {p.funder}</> : null}
                                {p.funder && p.date ? <span> • </span> : null}
                                {p.date ? <>Date: {p.date}</> : null}
                              </div>
                            ) : null}

                            {p.summary ? (
                              <div
                                className="mt-2 text-sm text-muted-foreground break-words whitespace-normal"
                                style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                              >
                                {p.summary}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DESKTOP/TABLET: table */}
                    <div className="hidden md:block">
                      <div className="max-h-[520px] overflow-y-auto pr-1">
                        <div className="overflow-x-auto max-w-full">
                          <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                            <thead className="sticky top-0 z-10">
                              <tr className="text-left">
                                <th className="w-[26%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                  Title
                                </th>
                                <th className="w-[44%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                  Summary
                                </th>
                                <th className="w-[18%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                  Funding agency
                                </th>
                                <th className="w-[12%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                  Date
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {normalizedProjects.map((p, idx) => (
                                <tr key={`${p.url || p.title}-${idx}`} className="align-top">
                                  <td className="border-b px-3 py-2 min-w-0 break-words whitespace-normal">
                                    {p.url ? (
                                      <a
                                        href={p.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="font-medium underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600 break-words whitespace-normal"
                                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                                      >
                                        {p.title}
                                      </a>
                                    ) : (
                                      <span
                                        className="font-medium break-words whitespace-normal"
                                        style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                                      >
                                        {p.title}
                                      </span>
                                    )}
                                  </td>

                                  <td className="border-b px-3 py-2 text-muted-foreground break-words whitespace-normal">
                                    {p.summary || "—"}
                                  </td>

                                  <td className="border-b px-3 py-2 text-muted-foreground break-words whitespace-normal">
                                    {p.funder || "—"}
                                  </td>

                                  <td className="border-b px-3 py-2 text-muted-foreground break-words whitespace-normal">
                                    {p.date || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

          </TabsContent>

          {/* LAB MEMBERS (public) - UPDATED SECTION */}
          <TabsContent value={NAV.members} className="mt-6 space-y-6">
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                {/* UPDATED: Title and search on same line */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-2">
                    <CardTitle className="text-xl">Member Directory</CardTitle>
                    {/* Color legend */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded border border-amber-200/50 bg-amber-50"></div>
                        <span>Current</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3.5 w-3.5 rounded border border-gray-200 bg-gray-50"></div>
                        <span>Alumni</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full sm:w-auto sm:min-w-[280px]">
                    <Input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search by name / role"
                      className="h-10 rounded-2xl"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {members === null ? (
                  <div className="rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                    Profiles loading…
                  </div>
                ) : null}

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredMembers.map((m) => {
                    const programYear = [m?.program, m?.year]
                      .filter(Boolean)
                      .join(" • ");

                    // Determine status and corresponding styles
                    const isAlumni = m?.status === "alumni";
                    const cardBgClass = isAlumni
                      ? "bg-gray-50/95"
                      : "bg-amber-50/95"; // warm tone matching the screenshot palette
                    const borderClass = isAlumni
                      ? "border-gray-200"
                      : "border-amber-200/50";

                    return (
                      <div
                        key={m.id || m.name}
                        className={`rounded-2xl border p-4 shadow-sm ${cardBgClass} ${borderClass}`}
                      >
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-start">
                          <div className="w-full sm:col-span-1">
                            <div className="mx-auto w-32 sm:w-full">
                              <Avatar
                                name={m.name}
                                photoUrl={m.photoUrl}
                                className="w-full"
                              />
                            </div>
                          </div>

                          <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="text-base sm:text-lg font-semibold leading-snug break-words whitespace-normal">
                                {m.name}
                              </div>
                            </div>

                            <div className="mt-1 text-sm text-muted-foreground">
                              {m.role}
                              {programYear ? (
                                <span className="ml-2">• {programYear}</span>
                              ) : null}
                            </div>

                            {(m.focus || m.bio) && (
                              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                                {m.focus || m.bio}
                              </div>
                            )}

                            {Array.isArray(m.keywords) &&
                              m.keywords.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {m.keywords.slice(0, 8).map((k) => (
                                    <Badge
                                      key={k}
                                      variant="secondary"
                                      className="rounded-full"
                                    >
                                      {k}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                            {/* UPDATED: Added CV button */}
                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                              {m.email && (
                                <a
                                  href={`mailto:${m.email}`}
                                  className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Email
                                </a>
                              )}

                              {m?.links?.website && (
                                <a
                                  href={m.links.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Website
                                </a>
                              )}

                              {m?.links?.scholar && (
                                <a
                                  href={m.links.scholar}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Scholar
                                </a>
                              )}

                              {m?.links?.github && (
                                <a
                                  href={m.links.github}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  GitHub
                                </a>
                              )}

                              {/* NEW: CV button */}
                              {m?.links?.cv && (
                                <a
                                  href={m.links.cv}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full border bg-white/90 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  CV
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border bg-white/95 p-4 text-center text-sm text-muted-foreground">
                  All opportunities to join the team will be posted in the
                  Announcements section on the Home page.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GALLERY */}
          <TabsContent value={NAV.gallery} className="mt-6 space-y-6">
            {/* ... unchanged GALLERY content ... */}
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Picture gallery</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border bg-white/95 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-slate-800">
                      Visit our lab photo album
                    </span>{" "}
                    for a full look at highlights from our field work, outreach,
                    teaching, and research.
                  </div>

                  <Button
                    className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                    onClick={() =>
                      window.open(PLACEHOLDER.photoGallery, "_blank")
                    }
                  >
                    <Images className="mr-2 h-4 w-4" />
                    Open gallery album
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {randomGallery.length === 0 ? (
                    <div className="rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                      No photos configured yet. Provide a{" "}
                      <code>fetchView("gallery")</code> feed (recommended) or
                      populate <code>FALLBACK_GALLERY_PHOTOS</code>.
                    </div>
                  ) : (
                      randomGallery.map((it, i) => {
                        const imgSrc = it.url;

                        // Best UX: open a specific image page (not the whole album)
                        // Option A (preferred): Drive direct viewer for the file id
                        const openHref = it.id
                          ? `https://drive.google.com/file/d/${it.id}/view`
                          : it.url;

                        return (
                          <a
                            key={`${it.id || it.url}-${i}`}
                            href={openHref}
                            target="_blank"
                            rel="noreferrer"
                            className="group block overflow-hidden rounded-2xl border bg-white shadow-sm"
                            title="Open image"
                          >
                            <div className="aspect-[4/3] w-full overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={`Gallery photo ${i + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                loading="lazy"
                              />
                            </div>
                          </a>
                        );
                      })
                  )}
                </div>

                <div className="rounded-2xl border bg-white/95 p-4">
                  <div className="text-sm font-semibold">Photo policy</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Default: only post photos with consent.</li>
                    <li>Avoid sharing sensitive locations.</li>
                    <li>Blury photo? Use AI to convert it to a cartoon.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUOTES & QUIZ */}
          <TabsContent value={NAV.quotes} className="mt-6 space-y-6">
            {/*QUOTES & QUIZ content*/}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-2xl bg-white/95 h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Quotes</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Fixed viewer sized to match the Micro-quiz card footprint */}
                  <div
                    className="rounded-2xl border bg-white/95 p-4"
                    onMouseEnter={() => setQuotePaused(true)}
                    onMouseLeave={() => setQuotePaused(false)}
                    onFocus={() => setQuotePaused(true)}
                    onBlur={() => setQuotePaused(false)}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Controls */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={prevQuoteSet}
                          className="rounded-xl border bg-white/70 p-2 transition hover:bg-white hover:shadow-sm"
                          aria-label="Previous"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={nextQuoteSet}
                          className="rounded-xl border bg-white/70 p-2 transition hover:bg-white hover:shadow-sm"
                          aria-label="Next"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {normalizedQuotes.length === 0 ? (
                      <div className="mt-3 text-sm text-muted-foreground">
                        No quotes or MEMEs published yet.
                      </div>
                    ) : (
                      (() => {
                        if (!displayItems.length) return null;

                        const current = displayItems[quoteIndex % displayItems.length];

                        if (current.kind === "image") {
                          const item = current.item;
                          return (
                            <div className="mt-3">
                              <div className="rounded-2xl border bg-white/90 p-4">
                                <div className="grid gap-2">
                                  <div className="w-full max-w-[360px] mx-auto">
                                    <div className="aspect-square overflow-hidden rounded-2xl bg-white">
                                      <img
                                        src={item.url}
                                        alt={item.category ? `MEME: ${item.category}` : "MEME"}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                      />
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="h-3.5 w-3.5" />
                                      <span>{item.category || "MEME"}</span>
                                    </div>
                                    <div>{item.attribution ? `— ${item.attribution}` : null}</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }

                        // textset
                        return (
                          <div className="mt-3 space-y-3">
                            {current.items.map((item) => (
                              <div key={item.id} className="rounded-2xl border bg-white/90 p-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 rounded-xl border bg-white p-2">
                                    <Quote className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="text-sm break-words">“{item.text}”</div>

                                    <div className="mt-2 text-xs text-muted-foreground break-words">
                                      {item.attribution ? `— ${item.attribution}` : "— MEME Lab"}
                                      {item.category ? (
                                        <span className="ml-2">• {item.category}</span>
                                      ) : null}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()

                    )}

                    {/* Little progress indicator */}
                    {normalizedQuotes.length > 0 && (
                      <div className="mt-3 text-xs text-muted-foreground">
                        {displayItems.length ? `${quoteIndex + 1} / ${displayItems.length}` : null}
                        <span className="ml-2">
                          {quotePaused ? "(paused)" : "(auto)"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-white/95">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Micro-quiz: Test Your Knowledge of Microbial Ecology
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Answer all ten questions and see your score at the end.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border bg-white/95 p-4">
                    {!currentQuiz ? (
                      <div className="text-sm text-muted-foreground">Loading quiz…</div>
                    ) : quizFinished ? (
                      (() => {
                        const total = quizAnswers.length;
                        const correctCount = quizAnswers.filter((x) => x.correct).length;
                        const pct = total ? Math.round((correctCount / total) * 100) : 0;

                        return (
                          <div className="space-y-4">
                            <div className="text-sm font-semibold">Quiz complete</div>

                            <div className="rounded-2xl border bg-white/70 p-4">
                              <div className="text-lg font-semibold">
                                Score: {correctCount} / {total} ({pct}%)
                              </div>
                              <div className="mt-1 text-sm text-muted-foreground">
                                Retake draws a new set of questions (no repeats this session).
                              </div>
                            </div>

                            {/* Optional: per-question review */}
                            <div className="space-y-2">
                              {quizAnswers.map((a, idx) => (
                                <div key={`${a.questionId}-${idx}`} className="rounded-xl border bg-white/70 p-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <div className="text-sm font-medium break-words">
                                        {idx + 1}. {a.question}
                                      </div>
                                      <div className="mt-1 text-sm text-muted-foreground break-words">
                                        Your answer: {a.choices?.[a.pickedIndex] ?? `Choice ${a.pickedIndex + 1}`}
                                      </div>
                                      <div className="text-sm text-muted-foreground break-words">
                                        Correct answer: {a.choices?.[a.correctIndex] ?? `Choice ${a.correctIndex + 1}`}
                                      </div>
                                      {a.explanation ? (
                                        <div className="mt-2 text-sm text-muted-foreground break-words">
                                          {a.explanation}
                                        </div>
                                      ) : null}
                                    </div>
                                    <div className="shrink-0">
                                      {a.correct ? (
                                        <Badge className="rounded-full">Correct</Badge>
                                      ) : (
                                        <Badge variant="destructive" className="rounded-full">
                                          Incorrect
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                className="rounded-2xl"
                                onClick={startNewQuizAttempt}
                              >
                                Take another quiz
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                className="rounded-2xl"
                                onClick={() => {
                                  // “Leave and return later” behavior: clear session seen pool now
                                  const empty = new Set();
                                  setQuizSeenIds(empty);
                                  saveSeenIds(empty);
                                  startNewQuizAttempt();
                                }}
                              >
                                Reset session
                              </Button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold">{currentQuiz.question}</div>
                          <div className="text-xs text-muted-foreground shrink-0">
                            {Math.min(quizPos + 1, quizDeck.length)} / {quizDeck.length}
                          </div>
                        </div>

                        <div className="mt-3 grid gap-2">
                          {currentQuiz.choices.map((c, i) => {
                            const picked = quizPick === i;
                            const show = quizPick !== null;
                            return (
                              <button
                                key={`${currentQuiz.id || "q"}-${i}`}
                                className={`rounded-2xl border px-4 py-2 text-left text-sm transition hover:shadow-sm ${picked ? "bg-white" : "bg-white/70"
                                  }`}
                                onClick={() => {
                                  if (quizPick !== null) return;
                                  if (!currentQuiz) return;

                                  setQuizPick(i);

                                  const correct = i === currentQuiz.answerIndex;

                                  setQuizAnswers((prev) => [
                                    ...prev,
                                    {
                                      questionId: String(currentQuiz.id ?? `pos-${quizPos}`),
                                      question: currentQuiz.question,
                                      choices: Array.isArray(currentQuiz.choices) ? [...currentQuiz.choices] : [],
                                      pickedIndex: i,
                                      correctIndex: currentQuiz.answerIndex,
                                      correct,
                                      explanation: currentQuiz.explanation || "",
                                    },
                                  ]);

                                  postQuizAttempt({
                                    endpoint: PLACEHOLDER.quizLogUrl,
                                    questionId: currentQuiz.id,
                                    correct,
                                  });
                                }}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span>{c}</span>
                                  {show && i === currentQuiz.answerIndex && (
                                    <Badge className="rounded-full">Correct</Badge>
                                  )}
                                  {show && picked && i !== currentQuiz.answerIndex && (
                                    <Badge variant="destructive" className="rounded-full">
                                      Not quite
                                    </Badge>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {quizPick !== null && currentQuiz.explanation && (
                          <div className="mt-3 text-sm text-muted-foreground">
                            {currentQuiz.explanation}
                          </div>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            className="rounded-2xl"
                            onClick={nextQuizQuestion}
                            disabled={quizPick === null}
                            title={quizPick === null ? "Answer to continue" : "Next"}
                          >
                            {quizPos + 1 >= quizDeck.length ? "Finish" : "Next question"}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => setQuizPick(null)}
                            disabled={quizPick === null}
                          >
                            Change answer
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>

              </Card>
            </div>
          </TabsContent>

          {/* CURRENT MEMBER PORTAL (restricted) */}
          <TabsContent value={NAV.current} className="mt-6 space-y-6">
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Member portal</CardTitle>
                <Badge variant="secondary" className="mt-2 w-fit rounded-full">
                  Google account required
                </Badge>
              </CardHeader>

              <CardContent>
                <div className="rounded-2xl border bg-white/95 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lock className="h-4 w-4" />
                    Restricted hub
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    This tab links to account-restricted resources hosted in Google Drive.
                  </p>

                  <div className="mt-4">
                    <Button
                      className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
                      onClick={() => window.open(PLACEHOLDER.currentMembersHub, "_blank")}
                    >
                      Open members hub
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Footer */}
        <footer className="mt-10 rounded-2xl border bg-white/95 p-6 text-sm text-slate-700 shadow-sm">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-700">
                {PLACEHOLDER.dept}
              </div>
              <div className="truncate">{PLACEHOLDER.location}</div>
            </div>
          </div>
          <div className="mt-4 text-xs">
            © {new Date().getFullYear()} {PLACEHOLDER.labName} — Purdue University
          </div>
        </footer>
      </main>
    </div>
  );
}