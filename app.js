const resources = [
  {
    id: "jetson",
    name: "Jetson Orin Nano dev kit",
    model: "8GB edge AI kit · 2 units",
    category: "AI & computing",
    lab: "Applied AI Lab",
    location: "Innovation Center · B2.214",
    access: "Faculty approval",
    next: "Today · 12:30 PM",
    art: "art-ai",
    render: "board",
    openCount: 4,
    utilization: "41% this week",
    fairness: 94,
    slots: [
      { day: "Today", label: "9:30 – 11:00", open: true, demand: 24 },
      { day: "Today", label: "12:30 – 14:00", open: false, heldBy: "another team", demand: 94 },
      { day: "Today", label: "15:00 – 16:30", open: true, demand: 38 },
      { day: "Tomorrow", label: "10:00 – 11:30", open: true, demand: 18 },
      { day: "Tomorrow", label: "14:00 – 15:30", open: true, demand: 46 },
    ],
  },
  {
    id: "printer",
    name: "Prusa MK4 3D printer",
    model: "FDM printer · 250 × 210 × 220 mm",
    category: "Fabrication",
    lab: "Digital Fabrication Studio",
    location: "Engineering Hall · 1.108",
    access: "Training required",
    next: "Today · 3:00 PM",
    art: "art-fabrication",
    render: "plate",
    openCount: 3,
    utilization: "67% this week",
    fairness: 78,
    slots: [
      { day: "Today", label: "11:00 – 12:30", open: false, heldBy: "a course session", demand: 94 },
      { day: "Today", label: "15:00 – 16:30", open: true, demand: 56 },
      { day: "Tomorrow", label: "9:00 – 10:30", open: true, demand: 28 },
      { day: "Tomorrow", label: "13:30 – 15:00", open: true, demand: 39 },
    ],
  },
  {
    id: "scope",
    name: "Digital oscilloscope",
    model: "Keysight DSOX1102G · 100 MHz",
    category: "Electronics",
    lab: "Embedded Systems Lab",
    location: "Tech Building · C1.306",
    access: "Open access",
    next: "Today · 10:00 AM",
    art: "art-electronics",
    render: "scope",
    openCount: 6,
    utilization: "53% this week",
    fairness: 88,
    slots: [
      { day: "Today", label: "10:00 – 11:30", open: true, demand: 21 },
      { day: "Today", label: "12:00 – 13:30", open: true, demand: 34 },
      { day: "Today", label: "14:00 – 15:30", open: false, heldBy: "a senior design team", demand: 92 },
      { day: "Tomorrow", label: "9:30 – 11:00", open: true, demand: 22 },
    ],
  },
  {
    id: "thermal",
    name: "FLIR thermal camera",
    model: "FLIR E8-XT · 320 × 240 thermal sensor",
    category: "Field & sensing",
    lab: "Smart Structures Lab",
    location: "Civil Engineering · A2.410",
    access: "Faculty approval",
    next: "Tomorrow · 9:30 AM",
    art: "art-bio",
    render: "camera",
    openCount: 2,
    utilization: "36% this week",
    fairness: 91,
    slots: [
      { day: "Today", label: "13:00 – 14:30", open: false, heldBy: "a lab practical", demand: 90 },
      { day: "Tomorrow", label: "9:30 – 11:00", open: true, demand: 25 },
      { day: "Tomorrow", label: "13:00 – 14:30", open: true, demand: 35 },
    ],
  },
  {
    id: "testing",
    name: "Universal testing machine",
    model: "Instron 5967 · 30 kN load frame",
    category: "Materials",
    lab: "Materials Characterization Lab",
    location: "Research Annex · G.021",
    access: "Faculty approval",
    next: "Tomorrow · 1:00 PM",
    art: "art-materials",
    render: "test-machine",
    openCount: 2,
    utilization: "72% this week",
    fairness: 71,
    slots: [
      { day: "Today", label: "14:30 – 16:00", open: false, heldBy: "a scheduled materials class", demand: 98 },
      { day: "Tomorrow", label: "13:00 – 14:30", open: true, demand: 45 },
      { day: "Tomorrow", label: "15:00 – 16:30", open: true, demand: 58 },
    ],
  },
  {
    id: "workstation",
    name: "GPU workstation 04",
    model: "RTX 4090 · 64GB RAM · Ubuntu",
    category: "Workstations",
    lab: "Visual Computing Suite",
    location: "Computing Center · 3.022",
    access: "Open access",
    next: "Today · 11:00 AM",
    art: "art-workstation",
    render: "monitor",
    openCount: 5,
    utilization: "58% this week",
    fairness: 85,
    slots: [
      { day: "Today", label: "11:00 – 12:30", open: true, demand: 27 },
      { day: "Today", label: "13:00 – 14:30", open: false, heldBy: "another student", demand: 90 },
      { day: "Tomorrow", label: "9:00 – 10:30", open: true, demand: 32 },
      { day: "Tomorrow", label: "14:30 – 16:00", open: true, demand: 41 },
    ],
  },
];

const categoryFilters = ["All resources", "AI & computing", "Fabrication", "Electronics", "Field & sensing", "Materials", "Workstations"];
const pageMeta = {
  discover: { breadcrumb: "Resource directory", eyebrow: "NORTHBRIDGE UNIVERSITY · CAMPUS NETWORK", title: "More room to make.", description: "Find the right equipment, people, and time slot across campus. Good ideas travel further when the lab is open." },
  bookings: { breadcrumb: "My bookings", eyebrow: "YOUR LAB TIME · ALL DEPARTMENTS", title: "Your work, in motion.", description: "A clear view of your upcoming sessions and the requests waiting on a faculty review." },
  requests: { breadcrumb: "Project requests", eyebrow: "PROJECT ACCESS · FACULTY REVIEW", title: "A little context goes a long way.", description: "Share the project behind your request so lab teams can match you with the right setup." },
  approvals: { breadcrumb: "Faculty approvals", eyebrow: "FACULTY DESK · SHARED RESOURCE ACCESS", title: "Help the next idea take shape.", description: "Review project context, deadline fit, and available time before approving a cross-department session." },
};

const appState = {
  requests: [],
  currentView: "discover",
  role: "student",
  category: "All resources",
  search: "",
  availability: "all",
  activeResource: null,
  selectedSlot: null,
  conflictIndex: null,
  previouslyFocused: null,
};

const contentNode = document.getElementById("app-content");
const headingNode = document.getElementById("page-heading");
const modalLayer = document.getElementById("modal-layer");
const requestForm = document.getElementById("request-form");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function resourceById(id) { return resources.find((item) => item.id === id); }
function requestById(id) { return appState.requests.find((item) => item.id === id); }
function currentStudentRequests() { return appState.requests.filter((item) => item.student === "Sam Rivera"); }
function pendingApprovals() { return appState.requests.filter((item) => item.status === "pending"); }

async function api(path, options = {}) {
  const headers = { "X-Demo-Role": appState.role, ...(options.headers || {}) };
  if (options.body) headers["Content-Type"] = "application/json";
  const response = await fetch(`/api${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `LabLink API returned ${response.status}.`);
  return data;
}

async function refreshBackendData() {
  const data = await api("/bootstrap");
  for (const item of data.resources || []) {
    const resource = resourceById(item.id);
    if (resource) Object.assign(resource, item);
  }
  appState.requests = data.requests || [];
  renderApp();
}

function iconSvg(name) {
  const icons = {
    resource: '<svg viewBox="0 0 24 24"><path d="M4 20h16M6 20V8l6-4 6 4v12M9 20v-6h6v6M8 9h.01M12 9h.01M16 9h.01"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/></svg>',
    exchange: '<svg viewBox="0 0 24 24"><path d="M4 7h15l-3.5-3.5M20 17H5l3.5 3.5"/><path d="M19 7l-3 3M5 17l3-3"/></svg>',
    ai: '<svg viewBox="0 0 24 24"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 15l.6 1.4L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.6z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="15" rx="2.5"/><path d="M8 3.5v4M16 3.5v4M4 10h16M8 14h3M8 17h6"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></svg>',
  };
  return icons[name] || "";
}

function renderHeading() {
  const meta = pageMeta[appState.currentView];
  headingNode.innerHTML = `
    <div>
      <div class="eyebrow"><span class="eyebrow-mark"></span>${escapeHtml(meta.eyebrow)}</div>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${escapeHtml(meta.description)}</p>
    </div>
    ${appState.currentView === "discover" ? '<button class="heading-action" type="button" data-action="show-guidance"><span class="spark">✳</span> How fair matching works <span aria-hidden="true">↗</span></button>' : ""}
  `;
  document.getElementById("breadcrumb-current").textContent = meta.breadcrumb;
}

function renderStats() {
  return `<section class="stats-row" aria-label="Campus resource statistics">
    <div class="stat-card"><span class="stat-icon">${iconSvg("resource")}</span><div class="stat-copy"><strong>128</strong><span>Shared resources</span></div><span class="stat-trend">across 9 depts.</span></div>
    <div class="stat-card"><span class="stat-icon orange">${iconSvg("clock")}</span><div class="stat-copy"><strong>34</strong><span>Open slots today</span></div><span class="stat-trend">+8 this week</span></div>
    <div class="stat-card"><span class="stat-icon blue">${iconSvg("exchange")}</span><div class="stat-copy"><strong>61%</strong><span>Cross-campus access</span></div><span class="stat-trend">utilization up</span></div>
  </section>`;
}

function renderAiBanner() {
  return `<section class="ai-banner" aria-label="LabLink matching recommendation">
    <span class="ai-emblem" aria-hidden="true">${iconSvg("ai")}</span>
    <div class="ai-copy"><span class="ai-overline">LABLINK MATCH · DEMO ENGINE</span><strong>There’s a fairer way to find your next slot.</strong><p>Matches consider open time, project deadlines, and recent team access so shared resources go further.</p></div>
    <button class="ai-cta" type="button" data-action="smart-find">Find my best slot <span aria-hidden="true">→</span></button>
  </section>`;
}

function renderDashboardRail() {
  const own = currentStudentRequests();
  const upcoming = own.filter((request) => request.status === "approved" || request.status === "pending").slice(0, 2);
  const week = ["M", "T", "W", "T", "F", "S", "S"];
  const calendar = `${week.map((day) => `<span class="weekday">${day}</span>`).join("")}
    <span>23</span><span class="has-booking">24</span><span class="has-booking">25</span><span>26</span><span>27</span><span>28</span><span>29</span>`;
  const items = upcoming.length ? upcoming.map((request, index) => {
    const slotTime = request.slot.split("·")[1]?.trim().split("–")[0]?.trim() || (index ? "1:30 PM" : "11:00 AM");
    return `<div class="upcoming-item"><div class="time-block"><strong>${escapeHtml(slotTime)}</strong><span>${index === 0 ? "TODAY" : "TOMORROW"}</span></div><div class="upcoming-copy"><strong>${escapeHtml(request.resource)}</strong><span>${escapeHtml(request.lab)}</span><span class="booking-status ${request.status === "pending" ? "pending" : ""}"><i></i>${request.status === "pending" ? "Awaiting faculty" : "Confirmed"}</span></div></div>`;
  }).join("") : `<div class="empty-state"><strong>No upcoming sessions yet</strong><p>Request a resource to add your first session.</p></div>`;
  return `<aside class="right-rail" aria-label="Your campus activity">
    <section class="rail-card"><div class="rail-card-heading"><h3>Your week</h3><button class="small-link" type="button" data-view="bookings">See all</button></div><div class="day-label">NOVEMBER · CAMPUS WEEK</div>${items}<div class="mini-calendar" aria-label="Week view">${calendar}</div></section>
    <section class="fairness-card"><div class="fairness-top"><span class="fairness-icon">✳</span><strong>A shared lab works better</strong></div><p>LabLink spreads access across teams and suggests the earliest fair fit when schedules overlap.</p><div class="fairness-metrics"><span><b>94%</b> match confidence</span><span><b>2.1×</b> shared usage</span></div></section>
  </aside>`;
}

function renderDevice(resource) {
  const bodies = {
    board: '<svg viewBox="0 0 100 64" aria-hidden="true"><rect x="13" y="10" width="74" height="44" rx="5"/><rect x="29" y="19" width="26" height="24" rx="3"/><path d="M33 23h18M33 28h18M33 33h18M33 38h18M18 18h5v5h-5zM67 17h12M67 23h12M67 29h12M67 35h7M20 54v5M28 54v5M36 54v5M68 54v5M76 54v5M84 54v5M13 25H7v6h6M87 39h6v5h-6"/><circle cx="63" cy="45" r="3"/></svg>',
    plate: '<svg viewBox="0 0 100 80" aria-hidden="true"><path d="M24 67h52M31 62l5-36h28l5 36M39 26v-8h22v8M43 17v-5h14v5M37 42h26M42 48h16M46 54h8"/><path d="M38 32h24v7H38z"/><circle cx="50" cy="35" r="2"/></svg>',
    scope: '<svg viewBox="0 0 100 64" aria-hidden="true"><rect x="10" y="8" width="80" height="46" rx="5"/><rect x="18" y="14" width="50" height="28" rx="3"/><path d="m21 31 8-8 8 12 8-7 7 4 8-9M75 17h8M75 23h8M75 29h8M75 35h8M26 54v5M74 54v5M32 59h36"/><circle cx="82" cy="45" r="2"/></svg>',
    camera: '<svg viewBox="0 0 64 84" aria-hidden="true"><rect x="13" y="7" width="38" height="68" rx="8"/><rect x="18" y="13" width="28" height="19" rx="3"/><circle cx="32" cy="49" r="12"/><circle cx="32" cy="49" r="5"/><path d="M22 67h20M24 37h16"/></svg>',
    "test-machine": '<svg viewBox="0 0 66 84" aria-hidden="true"><path d="M14 73h38M19 68V14h28v54M24 19h18M24 26h18M30 26v14M36 26v14M27 41h19v6H27zM32 47v12M24 59h25M29 66h14"/><path d="m29 14 4-6h8l4 6"/></svg>',
    monitor: '<svg viewBox="0 0 100 64" aria-hidden="true"><rect x="9" y="7" width="82" height="43" rx="5"/><rect x="15" y="13" width="70" height="31" rx="2"/><path d="m26 35 11-12 10 7 9-8 13 13M43 50v7M57 50v7M35 58h30"/><circle cx="79" cy="38" r="1.7"/></svg>',
  };
  const cls = resource.render === "plate" ? "plate" : resource.render === "scope" ? "scope" : resource.render === "camera" ? "camera" : resource.render === "test-machine" ? "test-machine" : resource.render === "monitor" ? "monitor" : "";
  return `<div class="device-render ${cls}">${bodies[resource.render] || bodies.board}</div>`;
}

function renderResourceCard(resource, index) {
  const accessClass = resource.access === "Open access" ? "open" : "approval";
  return `<article class="resource-card">
    <div class="resource-art ${resource.art}" role="img" aria-label="Illustration of ${escapeHtml(resource.name)}; ${resource.openCount} open slots">
      <span class="art-badge"><span></span>${resource.openCount} open slots</span><span class="art-index">LL / ${String(index + 1).padStart(2, "0")}</span>
      ${renderDevice(resource)}
    </div>
    <div class="resource-card-body">
      <div class="resource-tags"><span class="tag">${escapeHtml(resource.category)}</span><span class="tag ${accessClass}">${escapeHtml(resource.access)}</span></div>
      <h3>${escapeHtml(resource.name)}</h3><p class="resource-model">${escapeHtml(resource.model)}</p>
      <div class="resource-meta"><div class="resource-place"><span>${escapeHtml(resource.lab)}</span><span>${escapeHtml(resource.location)}</span><span class="resource-next">Next opening · ${escapeHtml(resource.next.replace(/^.*?·\s*/, ""))}</span></div>
        <button class="reserve-button" type="button" data-action="reserve" data-resource="${escapeHtml(resource.id)}" aria-label="Request a slot for ${escapeHtml(resource.name)}">Request slot <span aria-hidden="true">→</span></button>
      </div>
    </div>
  </article>`;
}

function filteredResources() {
  const needle = appState.search.trim().toLowerCase();
  return resources.filter((resource) => {
    const categoryMatch = appState.category === "All resources" || resource.category === appState.category;
    const textMatch = !needle || [resource.name, resource.model, resource.category, resource.lab, resource.location].some((part) => part.toLowerCase().includes(needle));
    const availabilityMatch = appState.availability === "all" || (appState.availability === "today" ? resource.slots.some((slot) => slot.day === "Today" && slot.open) : resource.access === "Faculty approval");
    return categoryMatch && textMatch && availabilityMatch;
  });
}

function renderResourceGrid() {
  const grid = document.getElementById("resource-grid");
  if (!grid) return;
  const filtered = filteredResources();
  grid.innerHTML = filtered.length ? filtered.map((resource) => renderResourceCard(resource, resources.indexOf(resource))).join("") : `<div class="empty-state"><strong>No matching resources</strong><p>Try another keyword or category. You can also clear filters to browse the full campus directory.</p></div>`;
  const count = document.getElementById("result-count");
  if (count) count.textContent = `${filtered.length} resource${filtered.length === 1 ? "" : "s"} shown`;
}

function renderDiscover() {
  const categories = categoryFilters.map((category) => `<button type="button" class="category-pill ${appState.category === category ? "is-selected" : ""}" data-action="category" data-category="${escapeHtml(category)}" aria-pressed="${appState.category === category}">${escapeHtml(category)}</button>`).join("");
  return `${renderStats()}${renderAiBanner()}<div class="content-grid"><section class="content-primary" aria-labelledby="resources-heading">
    <div class="section-heading"><div><h2 id="resources-heading">Find your next resource</h2><p>Specialised tools, shared across departments.</p></div><span class="result-count" id="result-count"></span></div>
    <div class="toolbar"><label class="search-box">${iconSvg("search")}<input id="resource-search" type="search" autocomplete="off" placeholder="Search equipment, lab, or department" aria-label="Search campus resources" value="${escapeHtml(appState.search)}" /></label><label><span class="sr-only">Filter resources</span><select class="filter-select" id="availability-filter" aria-label="Filter by access"><option value="all" ${appState.availability === "all" ? "selected" : ""}>All access</option><option value="today" ${appState.availability === "today" ? "selected" : ""}>Open today</option><option value="approval" ${appState.availability === "approval" ? "selected" : ""}>Needs approval</option></select></label></div>
    <div class="category-row" aria-label="Resource categories">${categories}</div><div class="resource-grid" id="resource-grid"></div>
  </section>${renderDashboardRail()}</div>`;
}

function formatStatus(status) {
  if (status === "approved") return '<span class="status-pill">Approved</span>';
  if (status === "declined") return '<span class="status-pill reviewed">Not approved</span>';
  if (status === "needs-info") return '<span class="status-pill reviewed">More info needed</span>';
  return '<span class="status-pill pending">Awaiting review</span>';
}

function renderBookings() {
  const list = currentStudentRequests().filter((request) => request.status !== "declined").sort((a, b) => (a.status === "approved" ? -1 : 1) - (b.status === "approved" ? -1 : 1));
  const rows = list.map((request) => {
    const parts = request.slot.split("·");
    return `<article class="booking-row panel"><div class="booking-date"><span>${escapeHtml(parts[0]?.trim() || "NEXT")}</span><strong>${request.slot.includes("Tomorrow") ? "24" : "23"}</strong></div><div class="booking-detail"><strong>${escapeHtml(request.resource)}</strong><p>${escapeHtml(request.project)}</p><span>${escapeHtml(request.lab)}</span></div><div class="booking-time"><strong>${escapeHtml(parts[1]?.trim() || "Time pending")}</strong><span>Requested by ${escapeHtml(request.student)}</span></div><div class="row-actions">${formatStatus(request.status)}</div></article>`;
  }).join("");
  return `<div class="view-content"><div class="page-intro-row"><div><h2>Upcoming sessions</h2><p>Confirmed bookings and requests in review appear together, so you can plan ahead.</p></div><button class="button button-primary" type="button" data-action="browse-resources">Find equipment <span aria-hidden="true">→</span></button></div>${list.length ? `<div class="booking-list">${rows}</div>` : `<section class="panel empty-panel"><span class="empty-symbol">⌁</span><h3>Your calendar is clear</h3><p>Browse campus resources and send a project request to plan your first lab session.</p></section>`}</div>`;
}

function renderRequests() {
  const own = currentStudentRequests().slice().sort((a, b) => b.id.localeCompare(a.id));
  const rows = own.map((request) => `<div class="request-row"><div class="request-project"><strong>${escapeHtml(request.project)}</strong><span>Submitted by you · ${escapeHtml(request.lab)}</span></div><div class="request-resource"><strong>${escapeHtml(request.resource)}</strong><span>${escapeHtml(request.slot)}</span></div><div class="request-deadline">Project deadline · <strong>${escapeHtml(request.deadline)}</strong></div>${formatStatus(request.status)}</div>`).join("");
  return `<div class="view-content"><div class="page-intro-row"><div><h2>Requests for your projects</h2><p>Faculty reviewers see your project purpose, deadline, and preferred time in one place.</p></div><button class="button button-primary" type="button" data-action="browse-resources">Start a request <span aria-hidden="true">→</span></button></div>${own.length ? `<section class="panel request-table" aria-label="Your project requests">${rows}</section>` : `<section class="panel empty-panel"><span class="empty-symbol">✳</span><h3>No project requests yet</h3><p>Choose a resource in Discover, add your project context, and the right faculty team can review the request.</p></section>`}<section class="fairness-card" style="margin-top:14px"><div class="fairness-top"><span class="fairness-icon">✳</span><strong>Why does a project deadline matter?</strong></div><p>When a slot is contested, the match preview weighs deadline fit, resource availability, and how recently each team has used the shared equipment.</p></section></div>`;
}

function renderApprovals() {
  const items = pendingApprovals().slice().sort((a, b) => Number(b.dueSoon) - Number(a.dueSoon));
  const cards = items.map((request) => {
    const resource = resourceById(request.resourceId);
    const candidate = resource?.slots.find((slot) => slot.open);
    return `<article class="approval-request" data-request-id="${escapeHtml(request.id)}"><div class="approval-main"><span class="student-avatar" aria-hidden="true">${escapeHtml(request.initials)}</span><div class="approval-title"><strong>${escapeHtml(request.project)}</strong><p class="approval-student">${escapeHtml(request.student)} · ${escapeHtml(request.lab)}</p><span class="priority-chip ${request.dueSoon ? "urgent" : ""}">${request.dueSoon ? "Deadline in 3 days" : "Flexible project timeline"} · due ${escapeHtml(request.deadline)}</span></div><div class="approval-side"><span>Submitted just now</span><span class="status-pill pending">Pending</span></div></div><div class="approval-details"><div><span>Equipment</span><strong>${escapeHtml(request.resource)}</strong></div><div><span>Requested slot</span><strong>${escapeHtml(request.slot)}</strong></div><div><span>Next fair fit</span><strong>${escapeHtml(candidate ? `${candidate.day} · ${candidate.label}` : "No open slot")}</strong></div></div><p class="approval-note">“${escapeHtml(request.purpose)}”</p><div class="approval-actions"><button class="button button-quiet button-small" type="button" data-action="needs-info" data-request="${escapeHtml(request.id)}">Ask for details</button><button class="button button-danger button-small" type="button" data-action="decline" data-request="${escapeHtml(request.id)}">Decline</button><button class="button button-primary button-small" type="button" data-action="approve" data-request="${escapeHtml(request.id)}">Approve request <span aria-hidden="true">→</span></button></div></article>`;
  }).join("");
  return `<div class="view-content"><div class="approvals-intro"><p><strong>Review fairly.</strong> Check the project fit and available times, then approve or suggest another slot. A decision updates the student’s request immediately in this demo.</p><span class="status-pill pending">${items.length} awaiting review</span></div><div class="page-intro-row"><div><h2>Incoming project requests</h2><p>Cross-department access requests, ordered by deadline urgency.</p></div><span class="result-count">LabLink match preview is advisory</span></div>${items.length ? `<section class="panel">${cards}</section>` : `<section class="panel empty-panel"><span class="empty-symbol">✓</span><h3>All requests are up to date</h3><p>New project requests will appear here for faculty review.</p></section>`}</div>`;
}

function renderApp() {
  renderHeading();
  if (appState.currentView === "discover") contentNode.innerHTML = renderDiscover();
  if (appState.currentView === "bookings") contentNode.innerHTML = renderBookings();
  if (appState.currentView === "requests") contentNode.innerHTML = renderRequests();
  if (appState.currentView === "approvals") contentNode.innerHTML = renderApprovals();
  renderResourceGrid();
  updateNavigation();
  updateBadges();
}

function updateNavigation() {
  document.querySelectorAll(".nav-item[data-view]").forEach((item) => {
    const active = item.dataset.view === appState.currentView;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  document.querySelector(".faculty-nav").hidden = appState.role !== "faculty";
  const isFaculty = appState.role === "faculty";
  document.querySelector(".profile-card").setAttribute("aria-label", `Signed in as ${isFaculty ? "Dr. Avery Lin, faculty reviewer" : "Sam Rivera, student"}`);
  document.querySelector(".profile-copy strong").textContent = isFaculty ? "Dr. Avery Lin" : "Sam Rivera";
  document.querySelector(".profile-copy small").textContent = isFaculty ? "Applied AI · Faculty" : "Engineering · Year 3";
  document.querySelectorAll(".avatar-user").forEach((avatar) => { avatar.textContent = isFaculty ? "AL" : "SR"; });
}

function updateBadges() {
  const own = currentStudentRequests();
  const bookingCount = own.filter((item) => item.status === "approved" || item.status === "pending").length;
  const requestCount = own.filter((item) => item.status === "pending").length;
  document.getElementById("booking-count").textContent = String(bookingCount).padStart(2, "0");
  document.getElementById("request-count").textContent = String(requestCount).padStart(2, "0");
  document.getElementById("approval-count").textContent = String(pendingApprovals().length).padStart(2, "0");
}

function setView(view) {
  if (!pageMeta[view]) return;
  if (view === "approvals" && appState.role !== "faculty") {
    showToast("Faculty view only", "Switch the preview role to Faculty to open the approvals desk.");
    return;
  }
  appState.currentView = view;
  renderApp();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(title, message) {
  const region = document.getElementById("toast-region");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span class="toast-mark" aria-hidden="true">✓</span><div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(message)}</p></div>`;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4300);
}

function showGuidance() {
  showToast("Fair slot matching", "The demo match considers open availability, project deadlines, and recent team usage. Lab approval and training checks still apply.");
}

async function getRecommendedSlot(resource) {
  const deadline = requestForm.elements.deadline.value || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const query = new URLSearchParams({ resource_id: resource.id, deadline });
  const data = await api(`/recommendations?${query}`);
  return data.recommendation;
}

function renderSlotOptions() {
  const resource = appState.activeResource;
  if (!resource) return;
  document.getElementById("slot-options").innerHTML = resource.slots.map((slot, index) => {
    const selected = appState.selectedSlot === index;
    const unavailableClass = slot.open ? "" : " is-blocked";
    return `<button class="slot-option ${selected ? "is-selected" : ""}${unavailableClass}" type="button" data-action="choose-slot" data-slot-index="${index}" aria-pressed="${selected}" aria-label="${escapeHtml(slot.day)}, ${escapeHtml(slot.label)}, ${slot.open ? "open" : "held, view fair alternative"}"><span>${escapeHtml(slot.day)} · ${escapeHtml(slot.label)}</span><span class="slot-state">${selected ? "Selected" : slot.open ? "Open" : "Held"}</span></button>`;
  }).join("");
}

async function showConflict(index) {
  const resource = appState.activeResource;
  const slot = resource?.slots[index];
  if (!slot || slot.open) return;
  appState.conflictIndex = index;
  const panel = document.getElementById("conflict-panel");
  panel.innerHTML = `<span class="conflict-emblem">…</span><div class="conflict-copy"><strong>Checking available times</strong><span>LabLink is comparing open slots with your project deadline.</span></div>`;
  panel.hidden = false;
  try {
    const recommendation = await getRecommendedSlot(resource);
    if (!recommendation?.bestSlot) {
      panel.innerHTML = `<span class="conflict-emblem">!</span><div class="conflict-copy"><strong>No open time fits yet</strong><span>Try a different resource or change the project deadline.</span></div>`;
      return;
    }
    const best = recommendation.bestSlot;
    panel.innerHTML = `<span class="conflict-emblem">✳</span><div class="conflict-copy"><strong>${escapeHtml(slot.day)} at ${escapeHtml(slot.label)} is held for ${escapeHtml(slot.heldBy || "another request")}.</strong><span>Fair match: ${escapeHtml(best.day)} at ${escapeHtml(best.label)}. ${escapeHtml(recommendation.reason)}</span></div><button class="conflict-apply" type="button" data-action="apply-recommendation" data-slot-index="${best.index}">Use this slot</button>`;
  } catch (error) {
    panel.innerHTML = `<span class="conflict-emblem">!</span><div class="conflict-copy"><strong>Could not check alternatives</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

function chooseSlot(index) {
  const slot = appState.activeResource?.slots[index];
  if (!slot) return;
  if (!slot.open) { showConflict(index); return; }
  appState.selectedSlot = index;
  appState.conflictIndex = null;
  document.getElementById("conflict-panel").hidden = true;
  renderSlotOptions();
}

async function selectSmartSlot() {
  const resource = appState.activeResource || resources.find((item) => item.id === "jetson");
  if (!resource) return;
  if (!appState.activeResource) openRequest(resource.id);
  const panel = document.getElementById("conflict-panel");
  panel.hidden = false;
  panel.innerHTML = `<span class="conflict-emblem">…</span><div class="conflict-copy"><strong>Finding a fair time</strong><span>Checking availability and your project deadline.</span></div>`;
  try {
    const recommendation = await getRecommendedSlot(resource);
    const best = recommendation?.bestSlot;
    if (!best) {
      showToast("No open slot found", "Try another resource or extend your project timeline.");
      return;
    }
    appState.selectedSlot = best.index;
    appState.conflictIndex = null;
    renderSlotOptions();
    panel.innerHTML = `<span class="conflict-emblem">✳</span><div class="conflict-copy"><strong>Best fit · ${escapeHtml(best.day)} at ${escapeHtml(best.label)}</strong><span>${escapeHtml(recommendation.reason)}</span></div><button class="conflict-apply" type="button" data-action="dismiss-match">Got it</button>`;
    panel.hidden = false;
    panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
  } catch (error) {
    panel.innerHTML = `<span class="conflict-emblem">!</span><div class="conflict-copy"><strong>Could not find a time</strong><span>${escapeHtml(error.message)}</span></div>`;
  }
}

function openRequest(resourceId) {
  const resource = resourceById(resourceId);
  if (!resource) return;
  appState.activeResource = resource;
  appState.selectedSlot = null;
  appState.conflictIndex = null;
  appState.previouslyFocused = document.activeElement;
  const due = new Date();
  due.setDate(due.getDate() + 6);
  const dueISO = `${due.getFullYear()}-${String(due.getMonth() + 1).padStart(2, "0")}-${String(due.getDate()).padStart(2, "0")}`;
  requestForm.elements.deadline.value = dueISO;
  requestForm.elements.deadline.min = new Date().toISOString().slice(0, 10);
  document.getElementById("modal-resource").innerHTML = `<span class="modal-resource-mark">⌁</span><div><strong>${escapeHtml(resource.name)}</strong><span>${escapeHtml(resource.lab)} · ${escapeHtml(resource.location)}</span></div><span class="tag ${resource.access === "Open access" ? "open" : "approval"}">${escapeHtml(resource.access)}</span>`;
  document.querySelector(".modal-eyebrow").textContent = resource.access === "Open access" ? "OPEN ACCESS SESSION" : "PROJECT ACCESS REQUEST";
  document.getElementById("request-submit").innerHTML = resource.access === "Open access" ? 'Confirm session <span aria-hidden="true">→</span>' : 'Send for faculty approval <span aria-hidden="true">→</span>';
  document.getElementById("slot-options").innerHTML = "";
  document.getElementById("conflict-panel").hidden = true;
  modalLayer.hidden = false;
  document.body.classList.add("modal-open");
  renderSlotOptions();
  window.requestAnimationFrame(() => requestForm.elements.project.focus());
}

function closeModal() {
  modalLayer.hidden = true;
  document.body.classList.remove("modal-open");
  appState.activeResource = null;
  appState.selectedSlot = null;
  appState.conflictIndex = null;
  if (appState.previouslyFocused && typeof appState.previouslyFocused.focus === "function") appState.previouslyFocused.focus();
}

async function submitRequest(event) {
  event.preventDefault();
  if (!appState.activeResource) return;
  if (appState.selectedSlot === null || !appState.activeResource.slots[appState.selectedSlot]?.open) {
    showToast("Choose an open time", "Select an available slot or use LabLink’s fair time match before sending your request.");
    document.getElementById("slot-options").focus();
    return;
  }
  if (!requestForm.elements.training.checked) {
    showToast("Lab onboarding required", "Confirm your safety onboarding before sending a project access request.");
    return;
  }
  const resource = appState.activeResource;
  let created;
  try {
    created = await api("/requests", {
      method: "POST",
      body: JSON.stringify({
        project: requestForm.elements.project.value.trim(),
        purpose: requestForm.elements.purpose.value.trim(),
        resource_id: resource.id,
        deadline: requestForm.elements.deadline.value,
        duration: Number(requestForm.elements.duration.value),
        training: requestForm.elements.training.checked,
        slot_index: appState.selectedSlot,
      }),
    });
  } catch (error) {
    showToast("Request could not be saved", error.message);
    if (/slot is no longer available/i.test(error.message)) await refreshBackendData().catch(() => {});
    return;
  }
  appState.requests.unshift(created.request);
  closeModal();
  setView(resource.access === "Open access" ? "bookings" : "requests");
  await refreshBackendData().catch((error) => showToast("Request saved; list did not refresh", error.message));
  if (resource.access === "Open access") showToast("Lab session reserved", "Your project slot is saved in the LabLink demo database.");
  else showToast("Request sent to the lab team", "Your project request is saved for faculty review.");
}

async function decideRequest(id, status) {
  const request = requestById(id);
  if (!request || request.status !== "pending") return;
  let result;
  try {
    result = await api(`/requests/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
  } catch (error) {
    showToast("Review decision could not be saved", error.message);
    await refreshBackendData().catch(() => {});
    return;
  }
  request.status = result.request.status;
  renderApp();
  await refreshBackendData().catch((error) => showToast("Decision saved; list did not refresh", error.message));
  if (status === "approved") showToast("Request approved", `${request.student} can now see this session as confirmed in the demo database.`);
  else if (status === "declined") showToast("Request declined", "The student’s request status has been updated.");
  else showToast("More details requested", "The student’s request is marked for follow-up.");
}

function showRequestForAnyResource() {
  const resource = resources.find((item) => item.id === "jetson");
  openRequest(resource.id);
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) { setView(viewButton.dataset.view); return; }
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const { action } = target.dataset;
  if (action === "reserve") openRequest(target.dataset.resource);
  else if (action === "close-modal") closeModal();
  else if (action === "show-guidance") showGuidance();
  else if (action === "browse-resources") setView("discover");
  else if (action === "smart-find") showRequestForAnyResource();
  else if (action === "smart-slot") selectSmartSlot();
  else if (action === "choose-slot") chooseSlot(Number(target.dataset.slotIndex));
  else if (action === "apply-recommendation") chooseSlot(Number(target.dataset.slotIndex));
  else if (action === "dismiss-match") document.getElementById("conflict-panel").hidden = true;
  else if (action === "category") {
    appState.category = target.dataset.category;
    document.querySelectorAll(".category-pill").forEach((button) => {
      const active = button.dataset.category === appState.category;
      button.classList.toggle("is-selected", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderResourceGrid();
  } else if (action === "approve") decideRequest(target.dataset.request, "approved");
  else if (action === "decline") decideRequest(target.dataset.request, "declined");
  else if (action === "needs-info") decideRequest(target.dataset.request, "needs-info");
});

document.addEventListener("input", (event) => {
  if (event.target.id === "resource-search") {
    appState.search = event.target.value;
    renderResourceGrid();
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "availability-filter") {
    appState.availability = event.target.value;
    renderResourceGrid();
  }
  if (event.target.id === "role-select") {
    appState.role = event.target.value;
    const chosenView = appState.role === "faculty" ? "approvals" : appState.currentView === "approvals" ? "discover" : appState.currentView;
    setView(chosenView);
    refreshBackendData().catch((error) => showToast("Could not load LabLink data", error.message));
    showToast(appState.role === "faculty" ? "Faculty preview enabled" : "Student preview enabled", "Switch roles to explore the student request flow and faculty approval desk.");
  }
  if (event.target.name === "deadline" && appState.conflictIndex !== null) void showConflict(appState.conflictIndex);
});

requestForm.addEventListener("submit", submitRequest);

document.addEventListener("keydown", (event) => {
  if (modalLayer.hidden) return;
  if (event.key === "Escape") { closeModal(); return; }
  if (event.key !== "Tab") return;
  const focusable = [...modalLayer.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
});

document.querySelector(".notification-button").addEventListener("click", () => showToast("You’re all caught up", "New booking decisions and lab updates will appear here."));
document.querySelector(".campus-switch").addEventListener("click", () => showToast("Northbridge University", "The campus switcher is a preview. More campuses can be connected when the platform is deployed."));
document.querySelector(".profile-card").addEventListener("click", () => showToast("Demo identity", "There is no sign-in. This preview identity and role switch are for evaluation only; do not use real student data."));

renderApp();
refreshBackendData().catch((error) => showToast("LabLink backend is not running", `${error.message} Start it from the project folder with: python server.py`));

