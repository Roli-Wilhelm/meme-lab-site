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

  // Prospective student links
  agronomyGradProgram: "https://ag.purdue.edu/department/agry/graduate-education.html",
  eseGradProgram: "https://www.purdue.edu/academics/ogsps/oigp/program/ese/",
  pulseProgram: "https://www.purdue.edu/academics/ogsps/oigp/program/pulse/",
  pamsHub: "https://centers.purdue.edu/microbiome/",
  googleScholar: "https://scholar.google.ca/citations?user=3DwlLDwAAAAJ&hl=en", // replace with your Scholar profile URL

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

// NEW: Helper function to get announcement badge styles based on type
function getAnnouncementBadgeStyles_(type) {
  const normalizedType = type ? String(type).trim().toLowerCase() : "general";
  
  switch (normalizedType) {
    case "recruitment":
      return {
        className: "bg-black text-white border-black",
        label: "Recruitment"
      };
    case "achievements":
      return {
        className: "bg-yellow-500 text-black border-yellow-600",
        label: "Achievement"
      };
    case "milestone":
      return {
        className: "bg-rose-200 text-black border-rose-300",
        label: "Milestone"
      };
    case "general":
    default:
      return {
        className: "bg-white text-black border-gray-300",
        label: "General"
      };
  }
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
    const qId = idForIndex(i);
    if (!seenSet.has(qId)) unseenIndices.push(i);
  }

  let chosenIndices;
  let updatedSeen = new Set(seenSet);

  if (unseenIndices.length >= n) {
    // Enough unseen questions → draw from unseen pool
    const shuffled = shuffleArray([...unseenIndices]);
    chosenIndices = shuffled.slice(0, n);
  } else {
    // Not enough unseen → reset seen pool and redraw
    updatedSeen = new Set();
    const shuffled = shuffleArray([...Array(bank.length).keys()]);
    chosenIndices = shuffled.slice(0, n);
  }

  // Mark chosen questions as seen
  chosenIndices.forEach((idx) => updatedSeen.add(idForIndex(idx)));

  return { deck: chosenIndices, updatedSeen };
}

async function postQuizAttempt({ endpoint, questionId, correct }) {
  if (!endpoint || !questionId) return;

  try {
    const body = JSON.stringify({
      question_id: String(questionId),
      correct: Boolean(correct),
    });

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch (err) {
    console.error("Quiz attempt logging failed:", err);
  }
}

function shuffleArray(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Avatar({ name, photoUrl, className = "" }) {
  const initials = name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const imgSrc = photoUrl || "";

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-2xl border bg-slate-100 ${className}`}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-slate-500">
          {initials}
        </div>
      )}
    </div>
  );
}

function Pill({ href, children, onClick }) {
  const classes = `
    inline-flex items-center gap-1 rounded-full border bg-white/95 px-3 py-1.5 text-xs
    shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0
  `;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes}>
        {children}
      </button>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={classes}>
      {children}
    </a>
  );
}

function LinkRow({ icon: Icon, title, desc, href, onClick }) {
  const content = (
    <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border bg-white/95 px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0">
      <div className="rounded-full border bg-white p-2 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return (
    <a href={href} target="_blank" rel="noreferrer">
      {content}
    </a>
  );
}

const FALLBACK_RESEARCH_AREAS = [
  {
    title: "Soil Biogeochemistry",
    bullet_summary: [
      "Microbial nutrient cycling (C, N, P, S)",
      "Rhizosphere processes",
      "Soil organic matter",
      "Soil health",
      "Agroecosystem sustainability",
    ],
  },
  {
    title: "Stable Isotope Probing (SIP)",
    bullet_summary: [
      "Functional microbiomes",
      "Active populations in situ",
      "Metabolic pathways",
      "Tool development (SIPdb, sip-navigator, STREAMS, MISIP)",
    ],
  },
  {
    title: "Open Science & FAIR Data",
    bullet_summary: [
      "Reproducible workflows",
      "Public data repositories",
      "Community standards",
      "Educational resources",
      "Microbial metadata (sampleDB, MISIP)",
    ],
  },
];

const FALLBACK_MEMBERS = [];
const FALLBACK_QUOTES = [];
const FALLBACK_QUIZ = [];
const FALLBACK_PROJECTS = [];
const FALLBACK_ANNOUNCEMENTS = [];

const FALLBACK_GALLERY_PHOTOS = [
  "/gallery/placeholder1.jpg",
  "/gallery/placeholder2.jpg",
  "/gallery/placeholder3.jpg",
];

const PAGES = { main: "main", prospective: "prospective" };

function ProspectiveStudentsPage({ announcements }) {
  return (
    <div className="space-y-6">
      <Card className="rounded-2xl bg-white/95">
        <CardHeader>
          <CardTitle className="text-2xl">Prospective Students & Postdocs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            I recruit new team members every year. If you're interested, check the
            announcements below for open positions or reach out to me with a brief
            introduction and your CV.
          </p>
          <p>
            <strong>Graduate students:</strong> I supervise students in the{" "}
            <a
              href={PLACEHOLDER.agronomyGradProgram}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Agronomy
            </a>
            , <a
              href={PLACEHOLDER.eseGradProgram}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ecological Sciences & Engineering (ESE)
            </a>
            , and <a
              href={PLACEHOLDER.pulseProgram}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Purdue University Life Sciences (PULSe)
            </a>{" "}
            graduate programs. If you're interested, please contact me directly
            with an updated CV, unofficial transcript, and brief (1-page max)
            statement of interest.
          </p>
          <p>
            <strong>Undergraduate students & visiting scholars:</strong> I welcome
            short-term student researchers and visiting scholars. Please email me
            with your CV and a brief overview of your interests. (Note: due to
            limited supervision capacity, I am often unable to accommodate all
            requests).
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-white/95">
        <CardHeader>
          <CardTitle className="text-xl">About me</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
          <p>
            I&apos;m an environmental microbiologist and biogeochemist fascinated by how
            microbes shape nutrient cycling and ecosystem function. My work focuses
            on identifying who&apos;s doing what, when, and where in soil environments—
            especially rhizosphere and agroecosystems—using stable isotope probing
            (SIP), genomics, and geochemical analyses.
          </p>
          <p>
            I&apos;m shaped by varied life experiences. I&apos;m first-generation on my
            father&apos;s side (he immigrated from Germany as a young adult), second-
            generation on my mother&apos;s side (grandparents were part of the postwar
            wave from the Netherlands). I spent some time in my early 20s as a small
            commercial farmer before entering academia. I also worked as a trainee
            science journalist, and those communication skills now shape how I teach,
            supervise, and collaborate.
          </p>
          <p>
            I am passionate about making science more inclusive, transparent, and
            reproducible. If you share these values and are excited about pushing
            the frontiers of soil and microbial ecology, I&apos;d love to hear from you.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href={PLACEHOLDER.googleScholar}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <GraduationCap className="h-3.5 w-3.5" />
              Google Scholar
            </a>
            <a
              href={`mailto:${PLACEHOLDER.labEmail}`}
              className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Mail className="h-3.5 w-3.5" />
              Email
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl bg-white/95">
        <CardHeader>
          <CardTitle className="text-xl">Current opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-80 overflow-y-auto pr-1">
            <ul className="space-y-2 text-sm text-muted-foreground">
              {announcements
                .filter((a) => {
                  const typeNorm = a?.type ? String(a.type).trim().toLowerCase() : "";
                  return typeNorm === "recruitment";
                })
                .map((a, idx) => {
                  const when = formatAnnouncementTime_(a.time);
                  const badgeStyles = getAnnouncementBadgeStyles_(a.type);

                  return (
                    <li
                      key={`${a.title || "a"}-${idx}`}
                      className="rounded-xl border bg-white/90 px-3 py-2"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium text-slate-700">
                              {a.title}
                            </div>
                            <div className="mt-1">
                              {a.url ? (
                                <a
                                  href={a.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                                >
                                  {a.text}
                                </a>
                              ) : (
                                <span>{a.text}</span>
                              )}
                            </div>
                          </div>
                          {when && (
                            <div className="text-xs text-muted-foreground shrink-0">
                              {when}
                            </div>
                          )}
                        </div>
                        <Badge 
                          className={`w-fit rounded-full ${badgeStyles.className}`}
                        >
                          {badgeStyles.label}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              {announcements.filter((a) => {
                const typeNorm = a?.type ? String(a.type).trim().toLowerCase() : "";
                return typeNorm === "recruitment";
              }).length === 0 && (
                <li className="rounded-xl border bg-white/90 px-3 py-2 text-center">
                  No recruitment announcements at this time. Check back soon!
                </li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState(PAGES.main);
  const [activeTab, setActiveTab] = useState(NAV.home);
  const [headerLogoSrc, setHeaderLogoSrc] = useState(HEADER_LOGO_DEFAULT);

  const [members, setMembers] = useState(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [quotes, setQuotes] = useState(null);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [quizBank, setQuizBank] = useState(null);
  const [projects, setProjects] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [scholarly, setScholarly] = useState([]);
  const [scholarlyLoaded, setScholarlyLoaded] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState([]);

  const [quizSeenIds, setQuizSeenIds] = useState(() => loadSeenIds());
  const [quizDeck, setQuizDeck] = useState([]);
  const [quizPos, setQuizPos] = useState(0);
  const [quizPick, setQuizPick] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizFinished, setQuizFinished] = useState(false);

  const displayItems = useMemo(() => {
    const list = Array.isArray(quotes) ? quotes : [];
    return list;
  }, [quotes]);

  function nextQuizQuestion() {
    if (quizPick === null) return;
    if (quizPos + 1 >= quizDeck.length) {
      setQuizFinished(true);
    } else {
      setQuizPos(quizPos + 1);
      setQuizPick(null);
    }
  }

  function setHashRoute(route) {
    if (route === "prospective") {
      setPage(PAGES.prospective);
    } else {
      setPage(PAGES.main);
    }
  }

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash.slice(1);
      if (hash === "prospective") {
        setPage(PAGES.prospective);
      } else {
        setPage(PAGES.main);
      }
    }
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const overlayStyle = {
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(0,0,0,0.15) 0%, transparent 70%),
      url("${OVERLAY_TILES[Math.floor(Math.random() * OVERLAY_TILES.length)]}")
    `,
    backgroundSize: "100% 100%, 400px 400px",
    backgroundRepeat: "no-repeat, repeat",
    backgroundPosition: "center, 0 0",
    opacity: 0.2,
  };

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
        const funder = p?.funder ? String(p.funder) : "";
        const date = p?.date ? String(p.date) : "";
        const url = p?.url ? String(p.url) : "";
        return { title, summary, funder, date, url };
      })
      .filter((p) => p.title);
  }, [projects]);

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
        {page === PAGES.prospective ? (
          <ProspectiveStudentsPage announcements={announcements || []} />
        ) : (
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
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-xl">What we do</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                        <p className="text-sm leading-6 text-muted-foreground">
                          The MEME Team studies how land management shapes microbial
                          communities and how those communities, in turn, regulate
                          nutrient cycling, plant health, and ecosystem services. We
                          develop reproducible workflows and open data to make
                          microbiome science more predictive and actionable.{" "}
                          <button
                            type="button"
                            onClick={() => setActiveTab(NAV.research)}
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-primary bg-primary/10 align-middle ml-1 transition hover:bg-primary/20 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0"
                          >
                            Explore Research
                          </button>
                        </p>

                    <div className="flex flex-wrap gap-2 justify-center">
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
                          Dr. Roland (Roli) Wilhelm, Assistant Professor of the Soil Microbiome,
                          is a trained environmental microbiologist and microbial ecologists,
                          who leads the MEME Lab and serves as the current Director of the Purdue
                          Applied Microbiome Sciences Research Hub. He is an award-winning,
                          data-driven scientist, former would-be science journalist, and one-time
                          market gardener. He is shaped by an enthusiasm for teamwork, his
                          immigrant roots, and passion for nature. Learn more about me on the{" "}
                          <button
                            type="button"
                            onClick={() => setHashRoute("prospective")}
                            className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium text-primary bg-primary/10 align-middle ml-1 transition hover:bg-primary/20 hover:-translate-y-0.5 hover:shadow-sm active:translate-y-0"

                          >
                            Prospective Students
                          </button>{" "}
                          page.
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
                    onClick={() => setHashRoute("prospective")}
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
                  <div className="mt-4 text-sm text-muted-foreground">
                    Loading…
                  </div>
                ) : sortedScholarly.length === 0 ? (
                  <div className="mt-4 text-sm text-muted-foreground">
                    No items available
                  </div>
                ) : (
                  <>
                    {/* MOBILE (stacked) */}
                    <div className="mt-2 md:hidden space-y-2">
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
                            className="rounded-xl border bg-white/90 px-3 py-2 max-w-full overflow-hidden"
                          >
                            <div className="flex flex-col gap-1">
                              <div className="text-xs text-muted-foreground break-words whitespace-normal">
                                {firstAuthor} • {journal} • {pubDate}
                              </div>
                              {url ? (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm font-medium underline decoration-slate-300 underline-offset-2 hover:decoration-slate-600 break-words whitespace-normal"
                                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                                >
                                  {title}
                                </a>
                              ) : (
                                <div
                                  className="text-sm font-medium break-words whitespace-normal"
                                  style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
                                >
                                  {title}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP/TABLET (table) */}
                    <div className="hidden md:block mt-2">
                      <div className="max-h-[420px] overflow-y-auto pr-1">
                        <div className="overflow-x-auto max-w-full">
                          <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
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

              {/* Announcements panel (mobile-safe) - UPDATED WITH COLOR-CODED BADGES */}
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
                      const badgeStyles = getAnnouncementBadgeStyles_(a.type);

                      return (
                        <li
                          key={`${a.title || "a"}-${idx}`}
                          className="rounded-xl border bg-white/90 px-3 py-2 max-w-full overflow-hidden"
                        >
                          <div className="flex flex-col gap-2">
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
                            
                            {/* Color-coded badge based on announcement type */}
                            <Badge 
                              className={`w-fit rounded-full ${badgeStyles.className}`}
                            >
                              {badgeStyles.label}
                            </Badge>
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
                      {a.bullet_summary.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Research Resources */}
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Research resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <LinkRow
                  icon={Bot}
                  title="SIP Navigator"
                  desc="AI assistant for designing SIP experiments"
                  href={PLACEHOLDER.sipNavigator}
                />
                <LinkRow
                  icon={Database}
                  title="SIPdb"
                  desc="Stable isotope probing database"
                  href={PLACEHOLDER.sipdb}
                />
                <LinkRow
                  icon={Bot}
                  title="Stan the AgData Advisor"
                  desc="AI assistant for agricultural data analysis"
                  href={PLACEHOLDER.stanAgDataAdvisor}
                />
                <LinkRow
                  icon={FileText}
                  title="STREAMS guideline"
                  desc="Reporting standards for SIP-metagenomics"
                  href={PLACEHOLDER.streamsGuideline}
                />
                <LinkRow
                  icon={FileText}
                  title="MISIP standard"
                  desc="Minimum information about a SIP experiment"
                  href={PLACEHOLDER.misipStandard}
                />
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Current Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {!normalizedProjects || normalizedProjects.length === 0 ? (
                  <div className="rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                    Project listings from the sheet have not loaded. See{" "}
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
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Lab Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {randomGallery.length > 0 ? (
                    randomGallery.map((item, idx) => (
                      <div
                        key={item.id || `${item.url}-${idx}`}
                        className="aspect-square overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <img
                          src={item.url}
                          alt={`Gallery ${idx + 1}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                      No gallery images available
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <a
                    href={PLACEHOLDER.photoGallery}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-1.5 text-xs shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <Images className="h-3.5 w-3.5" />
                    View full gallery
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUOTES & QUIZ */}
          <TabsContent value={NAV.quotes} className="mt-6 space-y-6">
            {/* QUOTES CARD - UPDATED (supports both text & image MEMEs) */}
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Quotes from the lab</CardTitle>
                  {displayItems.length > 1 && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={prevQuoteSet}
                        disabled={!displayItems.length}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {Math.min(quoteIndex + 1, displayItems.length)} /{" "}
                        {displayItems.length}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-full"
                        onClick={nextQuoteSet}
                        disabled={!displayItems.length}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {displayItems.length === 0 ? (
                  <div className="rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                    No quotes available.
                  </div>
                ) : (() => {
                    const item = displayItems[quoteIndex];

                    // Check if it's an image MEME
                    if (item?.type === "image" && item?.url) {
                      return (
                        <div className="rounded-2xl border bg-white/95 p-4">
                          <img
                            src={item.url}
                            alt={item.category || "Lab MEME"}
                            className="w-full h-auto rounded-lg"
                            loading="lazy"
                          />
                          {item.category && (
                            <div className="mt-2 text-xs text-muted-foreground text-center">
                              {item.category}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Otherwise, it's a text quote
                    return (
                      <div className="rounded-2xl border bg-white/95 p-4">
                        <div className="flex items-start gap-2">
                          <Quote className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                          <div>
                            <div className="text-base leading-6">
                              {item.text || "No text available"}
                            </div>
                            {item.attribution && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                — {item.attribution}
                              </div>
                            )}
                            {item.category && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                {item.category}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
              </CardContent>
            </Card>

            {/* QUIZ CARD */}
            <Card className="rounded-2xl bg-white/95">
              <CardHeader>
                <CardTitle className="text-xl">Quick quiz</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {!currentQuiz ? (
                    <div className="rounded-2xl border bg-white/95 p-4 text-sm text-muted-foreground">
                      No quiz loaded
                    </div>
                  ) : quizFinished ? (
                    (() => {
                      const correct = quizAnswers.filter((a) => a.correct).length;
                      const total = quizAnswers.length;

                      return (
                        <div>
                          <div className="rounded-2xl border bg-white/95 p-4">
                            <div className="text-xl font-semibold">
                              Quiz Complete!
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              You scored {correct} out of {total}.
                            </div>
                          </div>

                          <div className="mt-4 space-y-2">
                            {quizAnswers.map((a, idx) => (
                              <div
                                key={`${a.questionId}-${idx}`}
                                className="rounded-2xl border bg-white/95 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-semibold">
                                      {a.question}
                                    </div>
                                    <div className="mt-1 text-sm text-muted-foreground">
                                      Your answer:{" "}
                                      <span
                                        className={
                                          a.correct
                                            ? "text-green-700"
                                            : "text-red-700"
                                        }
                                      >
                                        {a.choices[a.pickedIndex]}
                                      </span>
                                    </div>
                                    {!a.correct && (
                                      <div className="mt-1 text-sm text-muted-foreground">
                                        Correct answer:{" "}
                                        <span className="text-green-700">
                                          {a.choices[a.correctIndex]}
                                        </span>
                                      </div>
                                    )}
                                    {a.explanation && (
                                      <div className="mt-2 text-sm text-muted-foreground">
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
                                // "Leave and return later" behavior: clear session seen pool now
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
        )}
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