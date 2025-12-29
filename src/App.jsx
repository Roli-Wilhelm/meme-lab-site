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
} from "lucide-react";

// Header logo assets from /public (Vite serves them from the site root)
const HEADER_LOGO_DEFAULT = "/meme.logo.png";
const HEADER_LOGO_EASTER_EGG = "/meme.logo.joyful.discovery.png";


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
  rosterJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=roster",
  quotesJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=quotes",
  quizJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=quiz",
  projectsJsonUrl:
    "https://script.google.com/macros/s/REPLACE_ME/exec?view=projects",
  announcementsJsonUrl:
    "https://script.google.com/macros/s/REPLACE_ME/exec?view=announcements",
  publicAssetsDriveFolder: "https://drive.google.com/drive/folders/REPLACE_ME",

  newsRss: "https://REPLACE_ME_RSS.xml",

  // Private / current members
  currentMembersHub: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Safety
  safety: "https://www.purdue.edu/ehps/",
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
    "group block rounded-2xl border bg-white/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

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

export default function ManagedEcosystemMicrobialEcologyLabSite() {
  const [activeTab, setActiveTab] = useState(NAV.home);
  const [headerLogoSrc, setHeaderLogoSrc] = useState(HEADER_LOGO_DEFAULT);

  const [members, setMembers] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [quizBank, setQuizBank] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [projects, setProjects] = useState(null);
  const [scholarly, setScholarly] = useState([]);
  const [scholarlyLoaded, setScholarlyLoaded] = useState(false);

  const [galleryPhotos, setGalleryPhotos] = useState(null);

  const [memberSearch, setMemberSearch] = useState("");

  const [quizOrder, setQuizOrder] = useState([]);
  const [quizPos, setQuizPos] = useState(0);
  const [quizPick, setQuizPick] = useState(null);

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
        const urls = g.value
          .map((x) => (typeof x === "string" ? x : x?.url))
          .filter(Boolean);
        setGalleryPhotos(urls.length ? urls : FALLBACK_GALLERY_PHOTOS);
      } else {
        setGalleryPhotos(FALLBACK_GALLERY_PHOTOS);
      }
    })();
  }, []);

  useEffect(() => {
    let unlocked = false;

    function onScroll() {
      if (unlocked) return;

      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 10;

      if (atBottom) {
        unlocked = true;
        setHeaderLogoSrc(HEADER_LOGO_EASTER_EGG);
        window.removeEventListener("scroll", onScroll);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!quizBank?.length) return;
    const indices = quizBank.map((_, i) => i);
    setQuizOrder(shuffleArray(indices));
    setQuizPos(0);
    setQuizPick(null);
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
    if (!quizOrder.length) return null;
    return quizBank[quizOrder[quizPos]];
  }, [quizBank, quizOrder, quizPos]);

  const randomGallery = useMemo(() => {
    const list = Array.isArray(galleryPhotos) ? galleryPhotos : [];
    if (!list.length) return [];
    return shuffleArray(list).slice(0, 12);
  }, [galleryPhotos]);

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
    if (!quizOrder.length) return;
    const nextPos = quizPos + 1;
    if (nextPos < quizOrder.length) {
      setQuizPos(nextPos);
      setQuizPick(null);
      return;
    }
    const indices = quizBank.map((_, i) => i);
    setQuizOrder(shuffleArray(indices));
    setQuizPos(0);
    setQuizPick(null);
  }

  function goToResearchProtocols() {
    setActiveTab(NAV.research);
    setTimeout(() => {
      const el = document.getElementById("protocols");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm overflow-hidden">
              <img
                src={headerLogoSrc}
                alt="MEME Lab logo"
                className="h-8 w-8 object-contain"
                loading="eager"
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-5">
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
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-2 md:grid-cols-6">
            <TabsTrigger className="rounded-xl" value={NAV.home}>
              Home
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.research}>
              Research
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.members}>
              Lab members
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.gallery}>
              Gallery
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.quotes}>
              Quotes & quiz
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.current}>
              Member Portal
            </TabsTrigger>
          </TabsList>

          {/* HOME */}
          <TabsContent value={NAV.home} className="mt-6 space-y-6">
            {/* ... unchanged HOME content ... */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="rounded-2xl md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">What we do</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    The {PLACEHOLDER.shortName} studies how land management
                    shapes microbial communities and how those communities, in
                    turn, regulate nutrient cycling, plant health, and ecosystem
                    services. We develop reproducible workflows and open data
                    assets to make microbiome science more predictive and
                    actionable.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="rounded-full">
                      Rhizosphere biogeochemistry
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      Stable isotope probing
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      Data standards & FAIR workflows
                    </Badge>
                    <Badge variant="secondary" className="rounded-full">
                      Managed ecosystems
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="rounded-2xl"
                      onClick={() => setActiveTab(NAV.research)}
                    >
                      Explore research
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
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

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Lab News</CardTitle>
              </CardHeader>

              <CardContent className="grid gap-4 md:grid-cols-2">
                {/* Scholarly panel (mobile-safe) */}
                <div className="rounded-2xl border bg-white/60 p-4 max-w-full overflow-hidden">
                  <div className="flex min-w-0 items-start gap-2">
                    <Rss className="mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-5 break-words">
                        Recent Scholarly Activities Involving MEME Lab Members
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Source: Zotero group library
                      </div>
                    </div>
                  </div>

                  {!scholarlyLoaded ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading…
                    </p>
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
                            const pubDate =
                              toDateString_(it?.publicationDate) || "—";
                            const title = it?.title
                              ? String(it.title)
                              : "Untitled";
                            const url = it?.articleUrl
                              ? String(it.articleUrl)
                              : it?.zoteroUrl
                              ? String(it.zoteroUrl)
                              : "";

                            return (
                              <div
                                key={`${url || title}-${idx}`}
                                className="rounded-xl border bg-white/70 px-3 py-2"
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
                                        <span className="font-medium break-words">
                                          {title}
                                        </span>
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
                          <div className="overflow-x-auto max-w-full">
                            <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
                              <thead className="sticky top-0 z-10">
                                <tr className="text-left">
                                  <th className="w-[18%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                    First author
                                  </th>
                                  <th className="w-[22%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                    Journal
                                  </th>
                                  <th className="w-[14%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                    Pub date
                                  </th>
                                  <th className="w-[46%] border-b bg-white/90 backdrop-blur px-3 py-2 font-semibold">
                                    Title
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {sortedScholarly.map((it, idx) => {
                                  const firstAuthor =
                                    pickFirstAuthor_(it) || "—";
                                  const journal = pickJournal_(it) || "—";
                                  const pubDate =
                                    toDateString_(it?.publicationDate) || "—";
                                  const title = it?.title
                                    ? String(it.title)
                                    : "Untitled";
                                  const url = it?.articleUrl
                                    ? String(it.articleUrl)
                                    : it?.zoteroUrl
                                    ? String(it.zoteroUrl)
                                    : "";

                                  return (
                                    <tr
                                      key={`${url || title}-${idx}`}
                                      className="align-top"
                                    >
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
                <div className="rounded-2xl border bg-white/60 p-4 max-w-full overflow-hidden">
                  <div className="text-sm font-semibold break-words">
                    Announcements
                  </div>

                  <div className="mt-2 max-h-80 md:max-h-[420px] overflow-y-auto pr-1">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {(announcements || []).map((a, idx) => {
                        const when = formatAnnouncementTime_(a.time);

                        return (
                          <li
                            key={`${a.title || "a"}-${idx}`}
                            className="rounded-xl border bg-white/70 px-3 py-2 max-w-full overflow-hidden"
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
                                      style={{
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word",
                                      }}
                                    >
                                      {a.text}
                                    </a>
                                  ) : (
                                    <span
                                      className="break-words whitespace-normal"
                                      style={{
                                        overflowWrap: "anywhere",
                                        wordBreak: "break-word",
                                      }}
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
              </CardContent>
            </Card>
          </TabsContent>

          {/* RESEARCH */}
          <TabsContent value={NAV.research} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              {FALLBACK_RESEARCH_AREAS.map((a) => (
                <Card key={a.title} className="rounded-2xl">
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

            {/* UPDATED: Projects table fed from fetchView("projects") */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Projects</CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {normalizedProjects.length === 0 ? (
                  <div className="rounded-2xl border bg-white/60 p-4 text-sm text-muted-foreground">
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
                            className="rounded-xl border bg-white/70 px-3 py-2"
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

            <Card className="rounded-2xl" id="protocols">
              <CardHeader>
                <CardTitle className="text-xl">Protocols & SOPs</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 space-y-3">
                  <LinkRow
                    icon={FlaskConical}
                    title="protocols.io workspace"
                    desc="Versioned methods (optionally citable)"
                    href={PLACEHOLDER.protocolsIoWorkspace}
                  />
                  <LinkRow
                    icon={FileText}
                    title="Lab SOP binder (Google Drive folder)"
                    desc="Day-to-day SOPs: media prep, DNA extraction, safety"
                    href={PLACEHOLDER.labSopDriveFolder}
                  />
                  <LinkRow
                    icon={Github}
                    title="Analysis SOPs (GitHub)"
                    desc="Pipelines, env files, templates, reproducible analyses"
                    href={PLACEHOLDER.githubOrg}
                  />
                </div>
                <div className="rounded-2xl border bg-white/60 p-4">
                  <div className="text-sm font-semibold">Safety</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Link to Purdue EHPS plus any lab-specific training checklists.
                  </p>
                  <Button
                    className="mt-3 rounded-2xl"
                    variant="outline"
                    onClick={() => window.open(PLACEHOLDER.safety, "_blank")}
                  >
                    Open safety resources
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">
                  Keep the site current with third-party sources
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2">
                <LinkRow
                  icon={BookOpen}
                  title="Publications (Zotero group library)"
                  desc="Add papers once; website stays up to date"
                  href={PLACEHOLDER.publications}
                />
                <LinkRow
                  icon={Github}
                  title="Code & pipelines (GitHub org)"
                  desc="Repos for analyses, tools, lab utilities"
                  href={PLACEHOLDER.githubOrg}
                />
                <LinkRow
                  icon={ExternalLink}
                  title="Open data & materials (OSF / Figshare)"
                  desc="Datasets, metadata, figures, and archives"
                  href={PLACEHOLDER.dataRepo}
                />
                <LinkRow
                  icon={ExternalLink}
                  title="Lab handbook (Google Doc)"
                  desc="Policies, expectations, onboarding"
                  href={PLACEHOLDER.labHandbook}
                />
                <LinkRow
                  icon={ExternalLink}
                  title="Member profile intake (Google Form)"
                  desc="Students update their own bio + headshot"
                  href={PLACEHOLDER.memberIntakeForm}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* LAB MEMBERS (public) */}
          <TabsContent value={NAV.members} className="mt-6 space-y-6">
            {/* ... unchanged MEMBERS content ... */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Member Directory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-muted-foreground">
                    Meet the current and past members of the MEME Lab.
                  </div>
                  <div className="flex w-full gap-2 md:w-auto">
                    <Input
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder="Search by name / role"
                      className="h-10 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredMembers.map((m) => {
                    const programYear = [m?.program, m?.year]
                      .filter(Boolean)
                      .join(" • ");

                    return (
                      <div
                        key={m.id || m.name}
                        className="rounded-2xl border bg-white/60 p-4 shadow-sm"
                      >
                        <div className="grid grid-cols-3 gap-4 items-start">
                          <div className="col-span-1">
                            <Avatar
                              name={m.name}
                              photoUrl={m.photoUrl}
                              className="min-h-[140px]"
                            />
                          </div>

                          <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-lg font-semibold leading-6">
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

                            <div className="mt-4 flex flex-wrap gap-2 text-xs">
                              {m.email && (
                                <a
                                  href={`mailto:${m.email}`}
                                  className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
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
                                  className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
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
                                  className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
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
                                  className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:bg-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  GitHub
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border bg-white/60 p-4 text-center text-sm text-muted-foreground">
                  All opportunities to join the team will be posted in the
                  Announcements section on the Home page.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GALLERY */}
          <TabsContent value={NAV.gallery} className="mt-6 space-y-6">
            {/* ... unchanged GALLERY content ... */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Picture gallery</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 rounded-2xl border bg-white/60 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-slate-800">
                      Visit our lab photo album
                    </span>{" "}
                    for a full look at highlights from our field work, outreach,
                    teaching, and research.
                  </div>

                  <Button
                    className="rounded-2xl"
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
                    <div className="rounded-2xl border bg-white/60 p-4 text-sm text-muted-foreground">
                      No photos configured yet. Provide a{" "}
                      <code>fetchView("gallery")</code> feed (recommended) or
                      populate <code>FALLBACK_GALLERY_PHOTOS</code>.
                    </div>
                  ) : (
                    randomGallery.map((url, i) => (
                      <a
                        key={`${url}-${i}`}
                        href={PLACEHOLDER.photoGallery}
                        target="_blank"
                        rel="noreferrer"
                        className="group block overflow-hidden rounded-2xl border bg-white shadow-sm"
                        title="Open the full album"
                      >
                        <div className="aspect-[4/3] w-full overflow-hidden">
                          <img
                            src={url}
                            alt={`Gallery photo ${i + 1}`}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            loading="lazy"
                          />
                        </div>
                      </a>
                    ))
                  )}
                </div>

                <div className="rounded-2xl border bg-white/60 p-4">
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
            {/* ... unchanged QUOTES & QUIZ content ... */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Quotes (and MEMEs)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(quotes || []).map((q, idx) => (
                    <div key={idx} className="rounded-2xl border bg-white/60 p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-xl border bg-white p-2">
                          <Quote className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm">“{q.text}”</div>
                          <div className="mt-2 text-xs text-muted-foreground">
                            — {q.attribution}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Micro-quiz</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border bg-white/60 p-4">
                    {!currentQuiz ? (
                      <div className="text-sm text-muted-foreground">
                        Loading quiz…
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-semibold">
                          {currentQuiz.question}
                        </div>
                        <div className="mt-3 grid gap-2">
                          {currentQuiz.choices.map((c, i) => {
                            const picked = quizPick === i;
                            const show = quizPick !== null;
                            return (
                              <button
                                key={`${currentQuiz.id || "q"}-${i}`}
                                className={`rounded-2xl border px-4 py-2 text-left text-sm transition hover:shadow-sm ${
                                  picked ? "bg-white" : "bg-white/70"
                                }`}
                                onClick={() => setQuizPick(i)}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span>{c}</span>
                                  {show && i === currentQuiz.answerIndex && (
                                    <Badge className="rounded-full">Correct</Badge>
                                  )}
                                  {show &&
                                    picked &&
                                    i !== currentQuiz.answerIndex && (
                                      <Badge
                                        variant="destructive"
                                        className="rounded-full"
                                      >
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
                          >
                            Next question
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-2xl"
                            onClick={() => setQuizPick(null)}
                          >
                            Reset
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
            {/* ... unchanged CURRENT content ... */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Member portal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 rounded-2xl border bg-white/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lock className="h-4 w-4" />
                    Restricted hub
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This tab links to password-protected (account-restricted)
                    resources hosted in Google Drive / Google Sites. Because this
                    website is hosted on GitHub Pages (static), authentication
                    must be handled by Google.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      className="rounded-2xl"
                      onClick={() =>
                        window.open(PLACEHOLDER.currentMembersHub, "_blank")
                      }
                    >
                      Open current members hub
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() =>
                        window.open(PLACEHOLDER.labHandbook, "_blank")
                      }
                    >
                      Handbook (restricted copy)
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white/60 p-4">
                  <div className="text-sm font-semibold">Suggested contents</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Onboarding checklists</li>
                    <li>Internal SOPs and inventories</li>
                    <li>Meeting notes and calendars</li>
                    <li>Shared datasets (restricted)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Access control model</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border bg-white/60 p-4">
                  <div className="text-sm font-semibold">Recommended</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Create a Google Group (e.g., meme-current@purdue.edu).</li>
                    <li>Share the hub folder/site with that group only.</li>
                    <li>Use a single entry link from this tab.</li>
                  </ul>
                </div>
                <div className="rounded-2xl border bg-white/60 p-4">
                  <div className="text-sm font-semibold">Avoid</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Attempting “password protection” on GitHub Pages.</li>
                    <li>Publishing private sheets/feeds and hiding links.</li>
                    <li>Embedding restricted Docs that prompt for login repeatedly.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
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