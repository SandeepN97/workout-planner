const deviceCatalog = [
  {
    name: "Govee TV Backlight 3 Lite",
    category: "Lighting",
    zone: "Great room TV wall",
    arrival: "Friday",
    role: "Responsive ambient lighting for movie and game scenes.",
    integration: "Govee app, Alexa/Google voice, Home Assistant through Govee integration or Matter/LAN options where available.",
    priority: "Install on the great room TV; this is the apartment's main visual scene anchor.",
    icon: "monitor-play",
  },
  {
    name: "Govee A19 RGBWW Bulbs, 4 pack",
    category: "Lighting",
    zone: "Great room, bedroom, entry",
    arrival: "Friday",
    role: "Scene lighting, circadian color temperature, and occupancy-friendly dimming.",
    integration: "Govee cloud/LAN, Alexa, Google Assistant, Home Assistant.",
    priority: "Use two bulbs in the great room, one in the bedroom, and one near entry or a floor lamp.",
    icon: "lightbulb",
  },
  {
    name: "SwitchBot Button Pusher with Hub",
    category: "Comfort",
    zone: "Entry, kitchen, or bedroom legacy button",
    arrival: "Friday",
    role: "Automates a physical button without rewiring.",
    integration: "SwitchBot Hub, Bluetooth, cloud scenes, Home Assistant SwitchBot integration.",
    priority: "Best used for the one annoying apartment switch or appliance button you cannot replace.",
    icon: "fingerprint",
  },
  {
    name: "SwitchBot Remote",
    category: "Comfort",
    zone: "Entry wall or nightstand",
    arrival: "Friday",
    role: "Physical fallback for scenes when phone or voice is not ideal.",
    integration: "SwitchBot Hub and scenes; expose scene actions to Home Assistant where possible.",
    priority: "Entry placement makes it a reliable physical scene switch when leaving or arriving.",
    icon: "radio",
  },
  {
    name: "Honeywell T6 Pro Smart Thermostat",
    category: "Comfort",
    zone: "Hall/entry HVAC control",
    arrival: "Tuesday",
    role: "Main climate controller for comfort, schedules, and energy savings.",
    integration: "Honeywell Home/Resideo app, Alexa/Google, Home Assistant Resideo integration.",
    priority: "Confirm C-wire, HVAC compatibility, and apartment permission before removing the old thermostat.",
    icon: "thermometer",
  },
  {
    name: "Dreame X60 Max Ultra",
    category: "Cleaning",
    zone: "Great room, kitchen, bedroom",
    arrival: "Friday",
    role: "Scheduled vacuuming and mopping with self-empty/refill dock.",
    integration: "Dreame app, voice assistant, Home Assistant community integration if needed.",
    priority: "Dock near the great room/kitchen edge with a clean runway into the open floor area.",
    icon: "sparkles",
  },
  {
    name: "CleanForce HEPA Air Purifier",
    category: "Air",
    zone: "Great room",
    arrival: "Friday",
    role: "Air quality response, allergy support, and quiet night filtration.",
    integration: "Alexa plus app control; Home Assistant via Alexa routines or compatible integration if exposed.",
    priority: "One purifier in the great room can help the whole 764 sq.ft. apartment if airflow is open.",
    icon: "wind",
  },
  {
    name: "Litter-Robot 5",
    category: "Pet",
    zone: "Bathroom, closet edge, or low-traffic bedroom corner",
    arrival: "Ships in 1-3 days",
    role: "Automated litter cleaning, waste drawer alerts, and usage awareness.",
    integration: "Whisker app, notifications, Home Assistant community integrations where supported.",
    priority: "Pick a quiet, ventilated spot with enough clearance; prioritize pet comfort over automation.",
    icon: "circle-dot",
  },
  {
    name: "Pura Home, Mini, Plus, and Car",
    category: "Fragrance",
    zone: "Great room, bedroom, bath, car",
    arrival: "Ordered",
    role: "Scheduled scent scenes using Volcano, Santorini, Chamomile Lavender, White Tea, Havana Vanilla, Linens & Surf.",
    integration: "Pura app schedules; use manual scene alignment if direct automation is limited.",
    priority: "Use shorter schedules than a large house would need; scent will travel quickly.",
    icon: "flower-2",
  },
];

const layerDetails = {
  hub: {
    title: "Home Assistant is the apartment brain",
    icon: "server",
    copy: "Place the hub near the entry/laundry/closet area if possible. That spot is central to the great room, bedroom, bath, and kitchen.",
    bullets: ["Great room dashboard", "Bedroom sleep scenes", "Entry away/home controls"],
  },
  voice: {
    title: "Voice is a command surface",
    icon: "mic",
    copy: "Alexa or Google should trigger scenes, not own the architecture. This keeps naming cleaner and makes future devices easier to add.",
    bullets: ["Movie mode", "Good night", "Start cleaning", "Set temperature"],
  },
  lighting: {
    title: "Govee handles mood and visibility",
    icon: "lightbulb",
    copy: "Use Govee for the spaces you actually see: great room TV wall, sofa lighting, bedroom nightstand, and entry lamp.",
    bullets: ["TV backlight sync", "Bedroom warm dim", "Entry arrival glow"],
  },
  climate: {
    title: "Honeywell anchors comfort",
    icon: "thermometer",
    copy: "The thermostat should stay conservative. Let automations adjust setpoints around sleep, away, and air quality events.",
    bullets: ["Away setback", "Sleep temperature", "Manual override stays respected"],
  },
  cleaning: {
    title: "Dreame cleans around occupancy",
    icon: "sparkles",
    copy: "Robot routines should respect the apartment's narrow transitions: great room to bedroom, kitchen island edge, and deck doorway.",
    bullets: ["Clean great room and kitchen first", "Bedroom only when door is open", "Pause during movie mode"],
  },
  air: {
    title: "Air purification supports comfort scenes",
    icon: "wind",
    copy: "In 764 sq.ft., one strong purifier can matter. Keep it in the great room and boost after cooking or robot cleaning.",
    bullets: ["Boost after vacuum", "Boost after cooking", "Quiet mode at night"],
  },
  pet: {
    title: "Pet care gets alerts, not chaos",
    icon: "circle-dot",
    copy: "The Litter-Robot needs clearance and calm. Bathroom, closet edge, or a low-traffic bedroom corner are better than the great room.",
    bullets: ["Waste drawer alerts", "Ventilation check", "Usage trend checks"],
  },
  scent: {
    title: "Pura adds atmosphere on a schedule",
    icon: "flower-2",
    copy: "Pura should run in short windows because the floor plan is open. Use stronger scents in the great room and softer ones in bedroom/bath.",
    bullets: ["Entry scent on arrival", "Bedroom lavender at night", "Fresh scent after cleaning"],
  },
};

const automations = [
  {
    name: "Movie Mode",
    icon: "clapperboard",
    trigger: "Voice command, remote button, or TV time",
    actions: "Govee TV Backlight on, living bulbs dim warm, purifier quiet, robot vacuum paused.",
  },
  {
    name: "Away Clean",
    icon: "door-open",
    trigger: "SwitchBot Remote at entry or phone leaving home",
    actions: "Thermostat setback, lights off, Dreame cleans great room and kitchen first, purifier boosts after cleaning.",
  },
  {
    name: "Good Night",
    icon: "moon",
    trigger: "SwitchBot Remote long press or voice",
    actions: "Bulbs fade to 1 percent, thermostat sleep setpoint, air purifier quiet, Pura lavender schedule.",
  },
  {
    name: "Fresh Home",
    icon: "leaf",
    trigger: "Robot returns to dock or manual scene",
    actions: "Air purifier boosts for 30 minutes, Pura runs a short fresh scent window, entry or great room bulb turns soft white.",
  },
  {
    name: "Pet Care Reminder",
    icon: "bell",
    trigger: "Waste drawer alert or recurring schedule",
    actions: "Phone notification, dashboard badge, optional SwitchBot Remote double-press clears reminder after service.",
  },
];

const timeline = [
  ["Prepare the network", "Create a 2.4 GHz IoT SSID, choose room names from the floor plan, and keep the router/hub central."],
  ["Install Home Assistant", "Create zones for Great Room, Kitchen, Entry, Bedroom, Bath, Closet, Laundry, and Deck."],
  ["Pair lighting first", "Add Govee bulbs and TV backlight, then build Great Room Movie, Bedroom Night, Entry Home, and Bright Clean scenes."],
  ["Add SwitchBot controls", "Place the hub near entry/laundry/closet, test the Button Pusher mechanically, and map the Remote to Home/Away/Night."],
  ["Set up cleaning and air", "Map Dreame rooms, dock it near the great room/kitchen, and place the CleanForce purifier in the great room."],
  ["Install thermostat carefully", "Verify wiring, photograph the old wiring plate, and confirm apartment permission before installing Honeywell."],
  ["Add pet and fragrance layers", "Pick the Litter-Robot location based on clearance and calm, then add Pura schedules in short apartment-friendly windows."],
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function createIcon(name) {
  return `<i data-lucide="${name}"></i>`;
}

function renderDevices(filter = "all") {
  const grid = $("#deviceGrid");
  const visible = filter === "all" ? deviceCatalog : deviceCatalog.filter((device) => device.category === filter);

  grid.innerHTML = visible
    .map(
      (device) => `
        <article class="device-card">
          <div class="device-card-top">
            <span class="device-icon">${createIcon(device.icon)}</span>
            <span class="category-pill">${device.category}</span>
          </div>
          <h3>${device.name}</h3>
          <dl>
            <div><dt>Zone</dt><dd>${device.zone}</dd></div>
            <div><dt>Arrival</dt><dd>${device.arrival}</dd></div>
            <div><dt>Role</dt><dd>${device.role}</dd></div>
            <div><dt>Integration</dt><dd>${device.integration}</dd></div>
          </dl>
          <p>${device.priority}</p>
        </article>
      `,
    )
    .join("");

  refreshIcons();
}

function renderAutomations() {
  $("#automationList").innerHTML = automations
    .map(
      (automation) => `
        <article class="automation-card">
          <span class="automation-icon">${createIcon(automation.icon)}</span>
          <div>
            <h3>${automation.name}</h3>
            <p><strong>Trigger:</strong> ${automation.trigger}</p>
            <p><strong>Actions:</strong> ${automation.actions}</p>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderTimeline() {
  $("#timeline").innerHTML = timeline
    .map(
      ([title, copy], index) => `
        <li>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3>${title}</h3>
            <p>${copy}</p>
          </div>
        </li>
      `,
    )
    .join("");
}

function setLayerDetail(node = "hub") {
  const detail = layerDetails[node];
  $("#layerDetail").innerHTML = `
    <span class="card-icon">${createIcon(detail.icon)}</span>
    <p class="eyebrow">Selected layer</p>
    <h3>${detail.title}</h3>
    <p>${detail.copy}</p>
    <ul>${detail.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
  `;
  $$(".node").forEach((button) => button.classList.toggle("active", button.dataset.node === node));
  refreshIcons();
}

function drawDiagram() {
  const stage = $("#diagramStage");
  const canvas = $("#diagramCanvas");
  if (!stage || !canvas) return;

  const context = canvas.getContext("2d");
  const pixelRatio = window.devicePixelRatio || 1;
  const bounds = stage.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(bounds.width * pixelRatio));
  canvas.height = Math.max(1, Math.floor(bounds.height * pixelRatio));
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);

  const hub = $(".hub-node").getBoundingClientRect();
  const hubPoint = {
    x: hub.left - bounds.left + hub.width / 2,
    y: hub.top - bounds.top + hub.height / 2,
  };

  $$(".node:not(.hub-node)").forEach((node, index) => {
    const box = node.getBoundingClientRect();
    const end = {
      x: box.left - bounds.left + box.width / 2,
      y: box.top - bounds.top + box.height / 2,
    };
    const midX = (hubPoint.x + end.x) / 2;
    const midY = (hubPoint.y + end.y) / 2 + (index % 2 === 0 ? 24 : -24);

    context.beginPath();
    context.moveTo(hubPoint.x, hubPoint.y);
    context.quadraticCurveTo(midX, midY, end.x, end.y);
    context.strokeStyle = "rgba(28, 126, 104, 0.35)";
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();
    context.arc(end.x, end.y, 4, 0, Math.PI * 2);
    context.fillStyle = "rgba(245, 158, 11, 0.78)";
    context.fill();
  });
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function bindEvents() {
  $$(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".filter-button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      renderDevices(button.dataset.filter);
    });
  });

  $$(".node").forEach((button) => {
    button.addEventListener("click", () => setLayerDetail(button.dataset.node));
  });

  $("#menuToggle")?.addEventListener("click", () => {
    const menu = $("#mobileMenu");
    const isOpen = menu.classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(isOpen));
  });

  $$("#mobileMenu a").forEach((link) => {
    link.addEventListener("click", () => {
      $("#mobileMenu").classList.remove("open");
      $("#menuToggle")?.setAttribute("aria-expanded", "false");
    });
  });

  const navLinks = $$(".nav-list a");
  const sections = ["overview", "layout", "architecture", "inventory", "automations", "rollout"].map((id) => $(`#${id}`));
  window.addEventListener("scroll", () => {
    const current = sections.findLast((section) => section && section.getBoundingClientRect().top < 180);
    if (!current) return;
    navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${current.id}`));
  });

  window.addEventListener("resize", drawDiagram);
}

renderDevices();
renderAutomations();
renderTimeline();
setLayerDetail("hub");
bindEvents();
refreshIcons();
requestAnimationFrame(drawDiagram);
