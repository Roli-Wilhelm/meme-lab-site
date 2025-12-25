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
  Users,
  Images,
  Quote,
  FlaskConical,
  GraduationCap,
  BookOpen,
  Rss,
  Github,
  Lock,
  FileText,
} from "lucide-react";

/**
 * Managed Ecosystem Microbial Ecology Lab (Purdue) — single-file mockup
 * GitHub Pages-hosted site with lab-maintained content in Google Workspace.
 *
 * IMPORTANT NOTE ON “PASSWORD PROTECTION”:
 * GitHub Pages is static and cannot truly enforce authentication.
 * For controlled access, link to a Google Drive folder / Google Site / Notion space
 * that is restricted to Purdue/Google accounts (or a lab Google Group).
 */

/**
 * Replace placeholders with real URLs.
 *
 * Recommended pattern for Sheets->website:
 * - Create a Google Apps Script Web App that reads a Sheet and returns JSON.
 * - Keep the Web App public READ, but only include rows where publish=true.
 * - For private content, do not serve via the site; link out to restricted Drive/Sites.
 */

const PLACEHOLDER = {
  // Lab identity
  labName: "Managed Ecosystem Microbial Ecology Lab",
  shortName: "MEME Lab",
  labEmail: "rcwilhelm@purdue.edu",
  dept: "Department of Agronomy, Purdue University",
  location: "West Lafayette, Indiana",

  // Hosting / org
  githubOrg: "https://github.com/REPLACE_ME",

  // Public-facing links
  calendarLink: "https://calendly.com/REPLACE_ME",
  publications: "https://www.zotero.org/groups/meme-lab-website/library",
  photoGallery: "https://photos.app.goo.gl/REPLACE_ME",
  dataRepo: "https://osf.io/REPLACE_ME/",
  notebooks: "https://notion.so/REPLACE_ME",

  // Protocols (now a subsection under Research)
  protocolsIoWorkspace: "https://www.protocols.io/workspaces/REPLACE_ME",
  labSopDriveFolder: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Recruiting / onboarding
  onboardingDoc: "https://docs.google.com/document/d/REPLACE_ME/edit",
  labHandbook: "https://docs.google.com/document/d/REPLACE_ME/edit",

  // Member intake (Google Form)
  // Use a Form with File Upload + consent checkbox for headshot and public posting.
  memberIntakeForm: "https://forms.gle/REPLACE_ME",

  // CONTENT APIS (Google Apps Script Web App endpoints returning JSON)
  // Expected shapes are shown below. These endpoints should only return publish=true items.
  rosterJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=roster",
  quotesJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=quotes",
  quizJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=quiz",
  projectsJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=projects",
  announcementsJsonUrl: "https://script.google.com/macros/s/REPLACE_ME/exec?view=announcements",
  // Optional: public image/file links you want to surface on the website (e.g., brand assets, PDFs)
  publicAssetsDriveFolder: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Optional RSS feed URL
  newsRss: "https://REPLACE_ME_RSS.xml",

  // Private / current members (restricted access)
  // Recommended: Google Drive folder shared with a Google Group (e.g., meme-lab@purdue.edu)
  // or a Google Site restricted to Purdue accounts.
  currentMembersHub: "https://drive.google.com/drive/folders/REPLACE_ME",

  // Safety
  safety: "https://www.purdue.edu/ehps/",
};

const NAV = {
  home: "home",
  research: "research",
  members: "members",
  current: "current",
  gallery: "gallery",
  quotes: "quotes",
};

/**
 * Data shapes expected from JSON endpoints (examples)
 *
 * Roster item:
 * {
 *  id: "raven-lewis",
 *  name: "Raven Lewis",
 *  role: "PhD Student",
 *  focus: "...",
 *  email: "..." (optional),
 *  links: { website?: "...", scholar?: "...", github?: "..." } (optional),
 *  photoUrl: "https://drive.google.com/uc?id=..." (optional),
 *  publish: true
 * }
 *
 * Quote item:
 * { text: "...", attribution: "...", category?: "...", publish: true }
 *
 * Quiz item:
 * { id: "...", question: "...", choices: ["..."], answerIndex: 0, explanation?: "...", tags?: ["..."], publish: true }
 *
 * Project item:
 * { title: "...", summary: "...", tags?: ["..."], readMoreUrl?: "...", dataUrl?: "...", publish: true }
 */

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function safeFetchJson(url) {
  if (!url || url.includes("REPLACE_ME")) return null;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
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

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border bg-white/70 px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
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

// Fallbacks render if JSON endpoints are not configured yet.
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
  { text: "Data are not a byproduct; they are a deliverable.", attribution: "Lab principle", publish: true },
];

const FALLBACK_QUIZ = [
  {
    id: "base-cation-k",
    question: "Which is typically considered a base cation in soils?",
    choices: ["K⁺", "NO₃⁻", "Cl⁻", "H₂O"],
    answerIndex: 0,
    explanation: "K⁺ is a base cation along with Ca²⁺, Mg²⁺, Na⁺ (context-dependent).",
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
    explanation: "SIP links activity to identity by tracking isotope incorporation into nucleic acids.",
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
  },
  {
    title: "Latest paper / preprint",
    text: "Link to DOI or preprint server.",
    url: "https://REPLACE_ME",
    publish: true,
  },
  {
    title: "Recent field campaign",
    text: "Link to the gallery album.",
    url: "https://REPLACE_ME",
    publish: true,
  },
];

const FALLBACK_PROJECTS = [
  {
    title: "Project title 1",
    summary: "One-paragraph description: question, system, and what success looks like.",
    tags: ["System", "Methods", "Output"],
    readMoreUrl: "https://REPLACE_ME",
    dataUrl: "https://REPLACE_ME",
    publish: true,
  },
  {
    title: "Project title 2",
    summary: "One-paragraph description: question, system, and what success looks like.",
    tags: ["System", "Methods", "Output"],
    readMoreUrl: "https://REPLACE_ME",
    dataUrl: "https://REPLACE_ME",
    publish: true,
  },
];

/**
 * Drive-hosted images
 * - Recommended: store approved headshots in a lab-owned Drive folder.
 * - Generate stable public URLs of the form: https://drive.google.com/uc?id=FILE_ID
 * - Avoid direct Google Form upload links in the public site.
 */
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
    <div className={`flex items-center justify-center ${base} text-xl font-semibold`}>
      {initial}
    </div>
  );
}

export default function ManagedEcosystemMicrobialEcologyLabSite() {
  const [activeTab, setActiveTab] = useState(NAV.home);

  // Remote content (Sheets via Apps Script)
  const [members, setMembers] = useState(null);
  const [quotes, setQuotes] = useState(null);
  const [quizBank, setQuizBank] = useState(null);
  const [announcements, setAnnouncements] = useState(null);
  const [projects, setProjects] = useState(null);
  const [scholarly, setScholarly] = useState([]);
  const [scholarlyLoaded, setScholarlyLoaded] = useState(false);

  // Members UI
  const [memberSearch, setMemberSearch] = useState("");

  // Quiz UI (random without repeats)
  const [quizOrder, setQuizOrder] = useState([]);
  const [quizPos, setQuizPos] = useState(0);
  const [quizPick, setQuizPick] = useState(null);

  useEffect(() => {
    (async () => {
      const [m, q, qb, p, a, s] = await Promise.allSettled([
        fetchView("roster"),
        fetchView("quotes"),
        fetchView("quiz"),
        fetchView("projects"),
        fetchView("announcements"),
        fetchView("scholarly"), // NEW
      ]);

      // Roster
      if (m.status === "fulfilled" && Array.isArray(m.value)) {
        setMembers(m.value.filter((x) => x?.publish !== false));
      } else {
        setMembers(FALLBACK_MEMBERS);
      }

      // Quotes
      if (q.status === "fulfilled" && Array.isArray(q.value)) {
        setQuotes(q.value.filter((x) => x?.publish !== false));
      } else {
        setQuotes(FALLBACK_QUOTES);
      }

      // Quiz
      if (qb.status === "fulfilled" && Array.isArray(qb.value)) {
        setQuizBank(qb.value.filter((x) => x?.publish !== false));
      } else {
        setQuizBank(FALLBACK_QUIZ);
      }

      // Projects
      if (p.status === "fulfilled" && Array.isArray(p.value)) {
        setProjects(p.value.filter((x) => x?.publish !== false));
      } else {
        setProjects(FALLBACK_PROJECTS);
      }

      // Announcements
      if (a.status === "fulfilled" && Array.isArray(a.value)) {
        setAnnouncements(a.value.filter((x) => x?.publish !== false));
      } else {
        setAnnouncements(FALLBACK_ANNOUNCEMENTS);
      }

      // Scholarly (Zotero feed via Apps Script) — NEW
      if (s.status === "fulfilled" && Array.isArray(s.value)) {
        setScholarly(s.value);
      } else {
        setScholarly([]); // or FALLBACK_SCHOLARLY if you have one
      }
      setScholarlyLoaded(true); // if you’re using the loaded flag
    })();
  }, []);

  useEffect(() => {
    // Initialize quiz order whenever the bank changes.
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

  const currentQuiz = useMemo(() => {
    if (!quizOrder.length) return null;
    return quizBank[quizOrder[quizPos]];
  }, [quizBank, quizOrder, quizPos]);

  function nextQuizQuestion() {
    if (!quizOrder.length) return;
    const nextPos = quizPos + 1;
    if (nextPos < quizOrder.length) {
      setQuizPos(nextPos);
      setQuizPick(null);
      return;
    }
    // Reshuffle on cycle end
    const indices = quizBank.map((_, i) => i);
    setQuizOrder(shuffleArray(indices));
    setQuizPos(0);
    setQuizPick(null);
  }

  function goToResearchProtocols() {
    setActiveTab(NAV.research);
    // Give the tab time to render before scrolling.
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-white shadow-sm">
              <Microscope className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold leading-5">{PLACEHOLDER.labName}</div>
              <div className="truncate text-xs text-muted-foreground">Purdue University</div>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Pill>
              <MapPin className="mr-1 h-3.5 w-3.5" />
              {PLACEHOLDER.location}
            </Pill>
            <Pill>
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
            <TabsTrigger className="rounded-xl" value={NAV.current}>
              Current members
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.gallery}>
              Gallery
            </TabsTrigger>
            <TabsTrigger className="rounded-xl" value={NAV.quotes}>
              Quotes & quiz
            </TabsTrigger>
          </TabsList>

          {/* HOME */}
          <TabsContent value={NAV.home} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="rounded-2xl md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">What we do</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted-foreground">
                    The {PLACEHOLDER.shortName} studies how land management shapes microbial
                    communities and how those communities, in turn, regulate nutrient cycling,
                    plant health, and ecosystem services. We develop reproducible workflows and
                    open data assets to make microbiome science more predictive and actionable.
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
                    <Button className="rounded-2xl" onClick={() => setActiveTab(NAV.research)}>
                      Explore research
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => window.open(PLACEHOLDER.publications, "_blank")}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Publications library
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => window.open(PLACEHOLDER.dataRepo, "_blank")}
                    >
                      Open data & materials
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
                    desc="Recruiting info, rotations, expectations"
                    href={PLACEHOLDER.onboardingDoc}
                  />
                  <LinkRow
                    icon={Users}
                    title="Lab handbook"
                    desc="Living document for policies and norms"
                    href={PLACEHOLDER.labHandbook}
                  />
                  <LinkRow
                    icon={FlaskConical}
                    title="Protocols"
                    desc="SOPs and methods (Research → Protocols)"
                    onClick={goToResearchProtocols}
                  />
                  <LinkRow
                    icon={Images}
                    title="Photo gallery"
                    desc="Field work, lab life, outreach"
                    href={PLACEHOLDER.photoGallery}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Lab RSS News Feed</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border bg-white/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Rss className="h-4 w-4" />
                    Optional RSS feed
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Best practice is to source updates from a canonical stream (e.g., GitHub
                    releases, a lab blog, or department news). Put that RSS URL into
                    <code> newsRss </code> and replace this block with your preferred widget.
                  </p>
                </div>
                <div className="rounded-2xl border bg-white/60 p-4 md:col-span-2">
                  <div className="text-sm font-semibold">Announcements</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {(announcements || []).map((a, idx) => (
                      <li key={`${a.title || "a"}-${idx}`}>
                        <span className="font-medium text-slate-700">{a.title}:</span>{" "}
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
                          a.text
                        )}
                      </li>
                    ))}
                  </ul>
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

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Projects (keep current via Google Sheets)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {(projects || []).map((p) => (
                  <div key={p.title} className="rounded-2xl border bg-white/60 p-4">
                    <div className="text-sm font-semibold">{p.title}</div>
                    <p className="mt-2 text-sm text-muted-foreground">{p.summary}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(p.tags || []).slice(0, 6).map((t) => (
                        <Badge key={t} variant="secondary" className="rounded-full">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {p.readMoreUrl && (
                        <Button size="sm" className="rounded-2xl" onClick={() => window.open(p.readMoreUrl, "_blank")}>
                          Read more
                        </Button>
                      )}
                      {p.dataUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-2xl"
                          onClick={() => window.open(p.dataUrl, "_blank")}
                        >
                          Data / code
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
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
                <CardTitle className="text-xl">Keep the site current with third-party sources</CardTitle>
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
                  icon={BookOpen}
                  title="Living notes / project pages (Notion or Google Site)"
                  desc="Low-friction edits without redeploying"
                  href={PLACEHOLDER.notebooks}
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
                      placeholder="Search by name / role / topic"
                      className="h-10 rounded-2xl"
                    />
                    <Button
                      variant="outline"
                      className="h-10 rounded-2xl"
                      onClick={() => window.open(PLACEHOLDER.memberIntakeForm, "_blank")}
                    >
                      Update your profile
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {filteredMembers.map((m) => {
                    const primaryLink =
                      m?.links?.website || m?.links?.scholar || m?.links?.github || "";

                    const programYear = [m?.program, m?.year].filter(Boolean).join(" • ");

                    return (
                      <div
                        key={m.id || m.name}
                        className="rounded-2xl border bg-white/60 p-4 shadow-sm"
                      >
                        <div className="grid grid-cols-3 gap-4 items-start">
                          {/* Photo (≈ 1/3 width) */}
                          <div className="col-span-1">
                            <Avatar name={m.name} photoUrl={m.photoUrl} className="min-h-[140px]" />
                          </div>

                          {/* Text (≈ 2/3 width) */}
                          <div className="col-span-2 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="truncate text-lg font-semibold leading-6">{m.name}</div>
                            </div>

                            <div className="mt-1 text-sm text-muted-foreground">
                              {m.role}
                              {programYear ? <span className="ml-2">• {programYear}</span> : null}
                            </div>

                            {(m.focus || m.bio) && (
                              <div className="mt-3 text-sm leading-6 text-muted-foreground">
                                {m.focus || m.bio}
                              </div>
                            )}

                            {/* Keywords immediately after bio */}
                            {Array.isArray(m.keywords) && m.keywords.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {m.keywords.slice(0, 8).map((k) => (
                                  <Badge key={k} variant="secondary" className="rounded-full">
                                    {k}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Email + Website/Scholar/GitHub on one row */}
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

                <div className="rounded-2xl border bg-white/60 p-4 text-sm text-muted-foreground">
                  All opportunities to join the team will be posted in the Announcements section on the Home page.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CURRENT MEMBERS (restricted) */}
          <TabsContent value={NAV.current} className="mt-6 space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Current members</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2 rounded-2xl border bg-white/60 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Lock className="h-4 w-4" />
                    Restricted hub
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This tab links to password-protected (account-restricted) resources hosted in Google Drive / Google Sites.
                    Because this website is hosted on GitHub Pages (static), authentication must be handled by Google.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="rounded-2xl" onClick={() => window.open(PLACEHOLDER.currentMembersHub, "_blank")}>
                      Open current members hub
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-2xl"
                      onClick={() => window.open(PLACEHOLDER.labHandbook, "_blank")}
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

          {/* GALLERY */}
          <TabsContent value={NAV.gallery} className="mt-6 space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Picture gallery</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="rounded-2xl border bg-white/60 p-4">
                    <div className="text-sm font-semibold">Best practice</div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Host images on a third-party album (Google Photos, Flickr, SmugMug) and link here.
                      This keeps the website lightweight and avoids redeployments for new photos.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button className="rounded-2xl" onClick={() => window.open(PLACEHOLDER.photoGallery, "_blank")}>
                        <Images className="mr-2 h-4 w-4" />
                        Open gallery album
                      </Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => window.open("https://REPLACE_ME", "_blank")}>
                        Fieldwork highlights
                      </Button>
                      <Button variant="outline" className="rounded-2xl" onClick={() => window.open("https://REPLACE_ME", "_blank")}>
                        Outreach & teaching
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-white/60 p-4">
                  <div className="text-sm font-semibold">Photo policy</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    <li>Default: only post photos with consent.</li>
                    <li>Label field sites appropriately.</li>
                    <li>Avoid sharing sensitive locations.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="text-xl">Placeholder grid (optional; replace with embeds)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-2xl border bg-gradient-to-br from-slate-50 to-white shadow-sm"
                  >
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Image tile {i + 1}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* QUOTES & QUIZ */}
          <TabsContent value={NAV.quotes} className="mt-6 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl">Quotes</CardTitle>
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
                          <div className="mt-2 text-xs text-muted-foreground">— {q.attribution}</div>
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
                      <div className="text-sm text-muted-foreground">Loading quiz…</div>
                    ) : (
                      <>
                        <div className="text-sm font-semibold">{currentQuiz.question}</div>
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
                          <div className="mt-3 text-sm text-muted-foreground">{currentQuiz.explanation}</div>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button size="sm" className="rounded-2xl" onClick={nextQuizQuestion}>
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
        </Tabs>

        {/* Footer */}
        <footer className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="truncate font-medium text-slate-700">{PLACEHOLDER.dept}</div>
              <div className="truncate">{PLACEHOLDER.location}</div>
            </div>            
          </div>
          <div className="mt-4 text-xs">© {new Date().getFullYear()} {PLACEHOLDER.labName} — Purdue University</div>
        </footer>
      </main>
    </div>
  );
}
