// Program detail content, extracted verbatim from the legacy raw-HTML templates
// in src/pages/glydi/markup/{aica,ai-generalist,ai-architect,cybersecurity,soc-analyst}.html
// and the SEO/course values in src/pages/glydi/registry.ts (GLYDI_PAGES).

export type ProgramModule = { title: string; meta?: string; summary?: string; topics: string[] };
export type ProgramDetail = {
  slug: "aica" | "ai-generalist" | "ai-architect" | "cybersecurity" | "soc-analyst";
  path: string;
  course: string;
  seoTitle: string;
  seoDescription: string;
  track: "AI" | "Cyber";
  name: string;
  kicker: string;
  title: string;
  lede: string;
  image: string;
  facts: [string, string][];
  outcomes: string[];
  audience: string[];
  modules: ProgramModule[];
  projects: { title: string; text: string }[];
  tools: string[];
  faqs: [string, string][];
  note?: string;
};

export const PROGRAMS: ProgramDetail[] = [
  {
    slug: "aica",
    path: "/programs/aica",
    course: "AI Career Accelerator",
    seoTitle: "AI Career Accelerator — 21 Days, Live | ONROL",
    seoDescription:
      "The 21-day ONROL AI Career Accelerator: 21 live sessions, an hour a day — the full day-by-day plan, from your first AI tools to a career project, portfolio and 90-day roadmap.",
    track: "AI",
    name: "AI Career Accelerator",
    kicker: "21 days · Live",
    title: "AI Career Accelerator",
    lede: "Twenty-one live sessions, an hour a day. Start at zero and finish with a career project, a portfolio and a ninety-day plan of your own.",
    image: "/home-glydi/cards/aica.jpg",
    facts: [
      ["Days", "21"],
      ["Live sessions", "21"],
      ["A day", "1 hr"],
      ["Prerequisites", "Zero"],
    ],
    outcomes: [
      "A personal AI assistant — Built around your own career and study goals, not a demo.",
      "A finished career project — One practical, role-oriented build you can show and explain.",
      "A prompt library — Your own reusable prompts for research, writing, analysis and study.",
      "A resume that passes ATS — Tailored to real postings, with the matching worked out.",
      "A public profile — LinkedIn, portfolio and a personal brand that shows the work.",
      "A ninety-day roadmap — What you do next, week by week, after the cohort ends.",
    ],
    audience: [
      "Students",
      "Final-year and postgrad",
      "Working professionals",
      "Career switchers",
      "Job-seekers",
      "No coding background",
    ],
    modules: [
      {
        title: "The ground and the tools",
        meta: "Days 1–6",
        topics: [
          "Day 1 · The AI-Driven Career World — understand how AI is changing jobs, industries and entry-level careers",
          "Day 2 · Discover Your Career Direction — identify suitable career paths based on interests, skills and education",
          "Day 3 · AI Tools Every Student Should Know — when to use ChatGPT, Gemini, Claude, Perplexity and NotebookLM",
          "Day 4 · Prompting as a Professional Skill — build a reusable personal prompt library",
          "Day 5 · Research Smarter with AI — research companies, industries, topics and academic subjects effectively",
          "Day 6 · Learn Faster with AI — notes, summaries, study plans, concept explanations and knowledge building",
        ],
      },
      {
        title: "Working like a professional",
        meta: "Days 7–11",
        topics: [
          "Day 7 · Documents, Reports & Professional Writing — create professional reports, proposals and documentation",
          "Day 8 · Excel, Data & Analytical Thinking with AI — analyse simple datasets, formulas, insights and charts",
          "Day 9 · Presentations & Storytelling with AI — build a professional presentation from research to final deck",
          "Day 10 · Communication for the Workplace — emails, meeting notes, professional messages and workplace communication",
          "Day 11 · Creative AI for Students — create images, simple videos and professional visual content",
        ],
      },
      {
        title: "Your field, your build",
        meta: "Days 12–17",
        topics: [
          "Day 12 · AI for Coding & Technology Careers — experience how developers and technical teams use AI",
          "Day 13 · AI for Business, Marketing & Management Careers — experience AI workflows in business roles",
          "Day 14 · AI for HR, Operations, Finance & Other Careers — explore AI applications across non-technical careers",
          "Day 15 · Find Your AI + Career Combination — select a primary direction and identify the AI skills it needs",
          "Day 16 · Build Your Personal AI Assistant — an assistant customised to your own career and learning goals",
          "Day 17 · Build Your First Career Project — complete one practical, role-oriented AI project",
        ],
      },
      {
        title: "Getting seen, getting hired",
        meta: "Days 18–21",
        topics: [
          "Day 18 · Resume + ATS + Job Matching with AI — create a strong resume and learn to tailor it to jobs",
          "Day 19 · LinkedIn + Portfolio + Personal Brand — build a professional digital presence and showcase the work",
          "Day 20 · Internships, Interviews & Earning Opportunities — job and internship search, interviews, freelancing and entry-level earning paths",
          "Day 21 · Career Launch Day — present your project and portfolio, and leave with a ninety-day career roadmap",
        ],
      },
    ],
    projects: [],
    tools: ["ChatGPT", "Gemini", "Claude", "Perplexity", "NotebookLM"],
    faqs: [
      [
        "Do I need any coding or AI background?",
        "None. Day 1 assumes you have never used these tools seriously, and every session is built to be followed live with a mentor watching.",
      ],
      [
        "How much time does it really take?",
        "One hour a day for twenty-one days, live. Most people spend another twenty to thirty minutes finishing the day’s build, and everything is recorded if you miss one.",
      ],
      [
        "What if I am still deciding on my career direction?",
        "That is what days 2, 15 and 21 are for. You pick a direction with help, then spend the rest of the program building towards it rather than guessing.",
      ],
      [
        "Is the project mine to keep and show?",
        "Yes. The assistant, the project, the prompt library, the resume and the portfolio are all yours, under your own name, with links you can send to anyone.",
      ],
      [
        "What happens after the twenty-one days?",
        "You leave with a ninety-day roadmap. If you want to go further, the AI Generalist program picks up where this one ends.",
      ],
    ],
    note: "Free masterclass before any paid commitment. Seats are limited each cohort so the sessions stay small enough to get your questions answered.",
  },
  {
    slug: "ai-generalist",
    path: "/programs/ai-generalist",
    course: "AI Generalist Program",
    seoTitle: "ONROL AI Generalist Program",
    seoDescription:
      "Become an AI Generalist in 3 months. Build 5 AI systems and 7+ real projects with a portfolio that gets you hired, clients, or freelance income.",
    track: "AI",
    name: "AI Generalist",
    kicker: "3 months · Live",
    title: "AI Generalist",
    lede: "Three months, live and mentor-led. You leave with five working AI systems, seven or more real projects, and a portfolio with links people can click.",
    image: "/home-glydi/cards/generalist.jpg",
    facts: [
      ["AI systems", "5"],
      ["Projects", "7+"],
      ["Live hours", "50+"],
      ["Months", "3"],
    ],
    outcomes: [
      "A Complete AI Portfolio — Real work that demonstrates execution ability.",
      "7+ Real World Projects — Projects across automation, agents, content, apps, and chatbots.",
      "5 AI Systems — Functional systems ready to use, explain, and improve.",
      "AI Automations — Save 10+ hours every week through repeatable workflows.",
      "AI Chatbots — Business ready chatbots for WhatsApp, web, and Telegram.",
      "AI Agent — Your personal AI assistant for work and productivity.",
      "Freelance Presence — Profile, portfolio, and service positioning.",
      "Outreach System — A practical system to reach and convert clients consistently.",
    ],
    audience: [],
    modules: [
      {
        title: "AI Foundations + Prompting + Diffusion",
        topics: [
          "AI introduction, ethics, LLMs, and real world applications",
          "Productivity tools and AI monetisation opportunities",
          "Prompt engineering for content, research, automation, and problem solving",
          "Image generation, editing, AI video, audio, and multimedia workflows",
        ],
      },
      {
        title: "Automation + Workflows",
        topics: [
          "Automation fundamentals and workflow thinking",
          "Four frameworks of automation",
          "n8n, Zapier, Make, Google Sheets, Gmail, Slack, and Webhooks",
          "WhatsApp, Email, Telegram automation, APIs, and business integrations",
        ],
      },
      {
        title: "AI Agents + Agentic Workflows",
        topics: [
          "Single AI agent workflow and task oriented agent design",
          "Multi agent systems and collaborative AI workflows",
          "RAG basics for knowledge based assistants and document chatbots",
          "Agentic workflow frameworks using n8n, Make, Apify, Supabase, and Retell AI",
        ],
      },
      {
        title: "Vibe Coding + AI Development",
        topics: [
          "Website creation using Lovable, Vercel, and GitHub",
          "AI app development and AI assisted full stack development",
          "Backend, database, authentication, APIs, and deployment",
          "Launch production ready web apps and SaaS MVPs",
        ],
      },
      {
        title: "Claude Ecosystem + Career Growth",
        topics: [
          "Claude basics, claude.md, Claude Code, Skills, and Connectors",
          "OpenAI ecosystem, AI101, practical implementation strategies",
          "LinkedIn, portfolio, freelancing journey, and service positioning",
          "AI career roadmap, skill plan, and job readiness portfolio",
        ],
      },
      {
        title: "Live Project Masterclass + Capstone",
        topics: [
          "Build a complete live project with guided execution",
          "Final capstone presentation and feedback",
          "Community session, portfolio direction, and next step roadmap",
        ],
      },
    ],
    projects: [
      { title: "AI Automation System", text: "Capture leads, send follow ups, and run operations on autopilot." },
      { title: "Websites & AI Apps", text: "Portfolio sites, funnels, startup MVPs, and AI mini applications." },
      { title: "AI Agents", text: "Autonomous agents that research, qualify leads, and generate content." },
      { title: "AI Content & Videos", text: "Reels, carousels, brand images, voiceovers, and promotional content." },
      { title: "AI Chatbots", text: "WhatsApp, website, and Telegram chatbots businesses can deploy." },
    ],
    tools: [
      "n8n",
      "Zapier",
      "Make",
      "Lovable",
      "Vercel",
      "Supabase",
      "GitHub",
      "Claude",
      "Claude Code",
      "ChatGPT",
      "Gemini",
      "Canva",
      "Veo3",
      "Flow",
      "Retell AI",
      "Twilio",
      "Apify",
      "Google Sheets",
      "Gmail",
      "Slack",
      "Webhooks",
      "APIs",
    ],
    faqs: [
      [
        "Do I need coding experience?",
        "No. The program is beginner friendly and starts with AI foundations, prompting, productivity, and no code/low code execution.",
      ],
      [
        "What exactly will I build?",
        "You will build AI automations, chatbots, AI agents, AI content workflows, websites, AI apps, and a final portfolio.",
      ],
      [
        "Is this useful for jobs or freelancing?",
        "Yes. The program includes LinkedIn, portfolio, service positioning, freelancing journey, and career roadmap sessions.",
      ],
      [
        "How do I register?",
        "Submit the form and the ONROL team will confirm your seat with fees, schedule, and the full cohort guide on WhatsApp within 24 hours.",
      ],
    ],
    note: "Free 90-minute masterclass before any paid commitment.",
  },
  {
    slug: "ai-architect",
    path: "/programs/ai-architect",
    course: "AI Architect Program",
    seoTitle: "AI Architect Program — Build & Lead AI Systems | ONROL",
    seoDescription:
      "The ONROL AI Architect program — go beyond using AI to design, build, and lead production-grade AI systems.",
    track: "AI",
    name: "AI Architect",
    kicker: "6 + 6 months",
    title: "AI Architect",
    lede: "Six months for people who already build. Multi-agent systems, RAG pipelines, orchestration, and the architecture that keeps them running in production.",
    image: "/home-glydi/cards/architect.jpg",
    facts: [
      ["Months", "6+6"],
      ["Modules", "20"],
      ["Hours", "250+"],
      ["Projects", "20+"],
    ],
    outcomes: [
      "Design AI Powered Systems — End to end business systems.",
      "Build Apps & Automations — Websites, apps, and workflows.",
      "AI Agents & RAG Systems — Knowledge driven AI assistants.",
      "Production Deployments — Ship solutions to real users.",
      "Growth Systems — Personal and business growth engines.",
      "Client Ready Projects — Deliver real AI work.",
      "High Value Positioning — Roles, consulting, and freelancing.",
      "AI Orchestrator Certification — The ONROL credential.",
    ],
    audience: [
      "You start with the basics and finish at an advanced level. Whether you write code today or not, you leave able to design and ship complete AI systems.",
    ],
    modules: [
      {
        title: "Foundations",
        topics: ["Web Dev, HTML, CSS, JS, React", "Python & Data Systems", "SQL, Power BI, and Analytics", "UI Fundamentals"],
      },
      {
        title: "AI Core",
        topics: ["LLMs & Prompt Engineering", "RAG & Knowledge Systems", "Diffusion / Media AI", "AI Productivity Systems"],
      },
      {
        title: "Automation & Agents",
        topics: ["n8n & Workflow Engineering", "APIs & Webhooks", "AI Agents & Multi Agent", "Agentic Workflows + MCP"],
      },
      {
        title: "Build Products",
        topics: ["Vibe Coding", "App & Web Development", "Claude / OpenAI Ecosystem", "Backend & Database Design"],
      },
      {
        title: "Architecture & Deploy",
        topics: ["System & AI Architecture", "Deployment & Hosting", "Scaling & Security", "AI Ops & Governance"],
      },
      {
        title: "Growth & Career",
        topics: ["Digital Marketing & Ads", "Social & Creative Production", "Personal Branding", "Capstone + Portfolio"],
      },
    ],
    projects: [
      { title: "AI Applications", text: "Real world web applications and AI powered products." },
      { title: "AI Agents", text: "Single agent and multi agent autonomous systems." },
      { title: "Automation Systems", text: "Business workflows that eliminate repetitive work." },
      { title: "RAG & Knowledge Systems", text: "Knowledge driven assistants and enterprise chatbots." },
      { title: "Analytics Dashboards", text: "Data visualization and business intelligence systems." },
      { title: "Marketing Engines", text: "Lead generation, SEO, and content automation systems." },
      { title: "Personal Brand Assets", text: "Portfolio sites, LinkedIn systems, and professional presence." },
      { title: "Production Ready Solutions", text: "End to end systems ready for deployment and client delivery." },
    ],
    tools: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Next.js",
      "Python",
      "SQL",
      "Power BI",
      "Claude",
      "OpenAI",
      "MCP",
      "n8n",
      "Zapier",
      "Webhooks",
      "APIs",
      "Vector DB",
      "Embeddings",
    ],
    faqs: [
      [
        "Do I need to be an expert coder?",
        "No. The program starts with web, Python, and data foundations, then builds up to advanced AI architecture, so committed beginners can follow and developers can go deep.",
      ],
      [
        "What exactly will I build?",
        "AI applications, AI agents and multi agent systems, automations, RAG and knowledge systems, analytics dashboards, marketing engines, and production ready deployments, 20+ projects and a capstone.",
      ],
      [
        "Will this help me get an AI role or clients?",
        "Yes. You finish with a portfolio, the ONROL AI Architect credential, and positioning for roles, consulting, and freelancing.",
      ],
      [
        "How do I register?",
        "Submit the form and the ONROL team will confirm your seat with fees, schedule, and the full cohort guide on WhatsApp within 24 hours.",
      ],
    ],
    note: "Free 90-minute masterclass before any paid commitment.",
  },
  {
    slug: "cybersecurity",
    path: "/programs/cybersecurity",
    course: "Cyber Security Program",
    seoTitle: "Cyber Security Course Online — Zero to Job-Ready Defender | ONROL",
    seoDescription:
      "ONROL's online Cyber Security course — go from zero to a job-ready defender with hands-on, applied security skills.",
    track: "Cyber",
    name: "Cyber Security",
    kicker: "6 months · Online",
    title: "Cyber Security",
    lede: "The fundamentals every security role is built on: networks, systems and threats, taught through hands-on labs from the first week rather than as theory.",
    image: "/home-glydi/cards/cyber.jpg",
    facts: [
      ["Months", "6"],
      ["Live hours", "120+"],
      ["Hands on", "70%+"],
      ["Prerequisites", "Zero"],
    ],
    outcomes: [
      "Job Ready Portfolio — Real security work that proves you can do the job.",
      "5 Portfolio Builds — Network, servers, pentest, SIEM, and a capstone.",
      "Hands On Labs — 70%+ practical with TryHackMe and live ranges.",
      "Web Pentest Report — A professional findings report from a full test.",
      "Live SIEM Dashboards — Detection and alerts on real log data.",
      "Incident Response — Detect, investigate, and respond using MITRE ATT&CK.",
      "ONROL Certificate — Aligned to the OWASP Top 10 and industry needs.",
      "Career Roadmap — A clear path to SOC and security analyst roles.",
    ],
    audience: [
      "Fully online, made for beginners, and focused on getting you job ready. No background in the field is needed to start.",
    ],
    modules: [
      {
        title: "Networking Fundamentals",
        topics: [
          "OSI & TCP/IP, IP addressing, and subnetting",
          "Routing, switching, VLANs, and NAT",
          "Firewalls, ACLs, and network troubleshooting",
          "Packet analysis with Wireshark",
        ],
      },
      {
        title: "Linux Administration & Security",
        topics: [
          "Linux file system, users, and permissions",
          "Services, SSH hardening, and host firewalls",
          "SELinux, NFS, and web server setup",
          "Patch management and server hardening",
        ],
      },
      {
        title: "Windows Server Fundamentals",
        topics: [
          "Windows Server and NTFS permissions",
          "Active Directory, OUs, and GPOs",
          "Domain Controllers, IIS, and PowerShell",
          "Windows security and patch management",
        ],
      },
      {
        title: "Ethical Hacking & Web Pentesting",
        topics: [
          "OSINT, footprinting, and Nmap",
          "Vulnerability assessment and password attacks",
          "OWASP Top 10, SQL injection, and XSS",
          "Burp Suite, OWASP ZAP, and pentest reporting",
        ],
      },
      {
        title: "Security Operations Center (SOC)",
        topics: [
          "SOC architecture and SIEM with Splunk & ELK",
          "Log analysis, SPL queries, and dashboards",
          "Incident response and the MITRE ATT&CK framework",
          "Threat hunting and security reporting",
        ],
      },
    ],
    projects: [
      { title: "Enterprise Network", text: "A segmented network with subnetting, VLANs, NAT, and firewall ACLs." },
      { title: "Hardened Servers", text: "Secured, patched, and audited Linux and Windows servers." },
      { title: "Web Pentest Report", text: "A full web app penetration test with a professional findings report." },
      { title: "Live SIEM Dashboards", text: "Detection dashboards and alerts built on real log data." },
      { title: "Capstone Defense", text: "End to end detection and response on a simulated enterprise." },
    ],
    tools: [
      "Cisco",
      "pfSense",
      "Wireshark",
      "Linux",
      "SELinux",
      "Windows Server",
      "Active Directory",
      "IIS",
      "PowerShell",
      "Nmap",
      "Burp Suite",
      "OWASP ZAP",
      "Splunk",
      "ELK",
      "SPL",
      "MITRE ATT&CK",
      "TryHackMe",
    ],
    faqs: [
      [
        "Do I need prior experience?",
        "No. The program starts from networking fundamentals and builds up to advanced defense, so complete beginners can join.",
      ],
      [
        "How hands on is it really?",
        "70%+ of the program is practical, labs, simulations, and real tools throughout, including TryHackMe ranges and simulated enterprise environments.",
      ],
      [
        "Will I get a certificate?",
        "Yes, the ONROL Cyber Security Program Certificate, aligned to the OWASP Top 10 and current industry requirements.",
      ],
      [
        "What roles does it prepare me for?",
        "Entry level security roles: SOC Analyst, Security Analyst, Network Security Engineer, System Administrator, and Junior Penetration Tester.",
      ],
    ],
    note: "Free 90-minute masterclass before any paid commitment.",
  },
  {
    slug: "soc-analyst",
    path: "/programs/soc-analyst",
    course: "SOC Analyst Program",
    seoTitle: "SOC Analyst Course Online · ONROL",
    seoDescription:
      "Become a SOC Analyst — detect, investigate, and respond to threats. Fully online, hands-on ONROL program.",
    track: "Cyber",
    name: "SOC Analyst",
    kicker: "3 months · Online",
    title: "SOC Analyst",
    lede: "Train for the seat itself: detection, triage and response on the same SIEM workflows a real security operations centre runs on every day.",
    image: "/home-glydi/cards/soc.jpg",
    facts: [
      ["Months", "3"],
      ["Live hours", "60+"],
      ["Hands on", "75%+"],
      ["Modules", "12"],
    ],
    outcomes: [
      "SIEM Operations — Run Splunk & ELK for centralized monitoring.",
      "Detection Rules — Searches, dashboards, alerts, and correlation.",
      "Threat Detection — Spot real attacks in logs and traffic.",
      "Incident Response — Triage, contain, and report cleanly.",
      "Threat Hunting — Proactive IOC and UEBA hunting.",
      "SOAR Automation — Automate response with playbooks.",
      "ONROL SOC Certificate — MITRE ATT&CK and NIST aligned.",
      "Placement Prep — Resume, mock interviews, live shift sim.",
    ],
    audience: [
      "Freshers and working professionals are both welcome.",
      "A basic interest in security helps, and we build your foundations before the advanced SOC work.",
      "It is fully online, so you can join from anywhere.",
    ],
    modules: [
      {
        title: "Computer & Networking Basics",
        topics: [
          "Operating systems, CLI, and virtualization",
          "OSI / TCP IP stack and IP addressing",
          "Ports, protocols, and troubleshooting",
          "Lab setup and the analyst baseline",
        ],
      },
      {
        title: "Data Into a Working SIEM",
        topics: [
          "Packet capture, HTTP and DNS analysis",
          "Windows & Linux logs, forwarding and parsing",
          "SIEM architecture and Splunk SPL",
          "Kibana, dashboards, and alerts",
        ],
      },
      {
        title: "Detect Attacks in Traffic & Logs",
        topics: [
          "Brute force, port scan, malware, and phishing indicators",
          "Web attack detection",
          "Advanced Wireshark and Zeek",
          "NetFlow and Suricata signatures",
        ],
      },
      {
        title: "Investigate & Respond",
        topics: [
          "EDR, persistence, and memory acquisition",
          "YARA and endpoint analysis",
          "NIST IR lifecycle, triage and containment",
          "Evidence, chain of custody, and tabletops",
        ],
      },
      {
        title: "Hunt, Automate & Get Hired",
        topics: [
          "IOC management, hunt methodology, and UEBA",
          "Correlation rules and SOAR playbooks",
          "Full incident simulation, end to end",
          "Resume, LinkedIn, and interview prep",
        ],
      },
    ],
    projects: [
      { title: "Operate SIEM Platforms", text: "Deploy Splunk & ELK for centralized monitoring." },
      { title: "Detection Engineering", text: "Write searches, dashboards, alerts, and correlation rules." },
      { title: "Detect Real Attacks", text: "Brute force, malware, phishing, port scans, and web attacks." },
      { title: "Incident Investigation", text: "Run a full investigation and produce a professional report." },
      { title: "Capstone Simulation", text: "Detect → contain → forensics → report → present." },
    ],
    tools: [
      "Splunk",
      "ELK",
      "SPL",
      "Kibana",
      "Wireshark",
      "Zeek",
      "Suricata",
      "NetFlow",
      "YARA",
      "EDR",
      "SOAR",
      "MITRE ATT&CK",
      "NIST",
    ],
    faqs: [
      [
        "Is this program for beginners?",
        "It’s designed for freshers and working professionals. A basic interest in security helps, and the program builds your foundations before moving into advanced SOC work.",
      ],
      ["Is it fully online?", "Yes, live online sessions you can join from anywhere in the world."],
      ["How practical is it?", "75%+ hands on. You work real tools, real logs, and a full incident simulation."],
      [
        "Which tools and frameworks will I learn?",
        "Splunk, ELK, Wireshark, Zeek, Suricata, YARA, and SOAR, mapped to MITRE ATT&CK and the NIST IR lifecycle.",
      ],
      ["Will I get a certificate?", "Yes, the ONROL SOC Analyst Program Certificate, built around real SOC workflows."],
      [
        "Does it help with placement?",
        "Yes, resume and LinkedIn optimization, mock interviews, and a live SOC shift simulation are part of the program.",
      ],
    ],
    note: "Free 90-minute masterclass before any paid commitment.",
  },
];

export const programBySlug = (slug: string) => PROGRAMS.find((p) => p.slug === slug);
