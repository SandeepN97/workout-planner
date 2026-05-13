const storageKey = "pulseplan-state-v1";

const defaultState = {
  logs: [],
  preferences: {
    goal: "balanced",
    experience: "beginner",
    availableTime: "35",
    equipment: "bodyweight",
    userWant: "",
  },
};

const goalLabels = {
  balanced: "Balanced",
  "fat-loss": "Fat loss",
  muscle: "Build muscle",
  endurance: "Endurance",
  mobility: "Mobility",
};

const equipmentLabels = {
  bodyweight: "Bodyweight",
  dumbbells: "Dumbbells",
  gym: "Gym access",
  bands: "Resistance bands",
};

const planLibrary = {
  balanced: [
    ["Warm-up flow", "5 minutes of brisk walking, shoulder circles, hip hinges, and easy squats."],
    ["Full-body circuit", "3 rounds of squat, push, hinge, row, and plank movements. Keep two reps in reserve."],
    ["Cooldown", "Easy walk plus hamstring, chest, and hip flexor stretches."],
  ],
  "fat-loss": [
    ["Pulse primer", "Alternate 60 seconds fast and 60 seconds easy for a low-friction cardio warm-up."],
    ["Metabolic set", "Cycle through lunges, presses, rows, and step-ups with short rests."],
    ["Recovery guardrail", "Finish with nasal breathing and light mobility so tomorrow still feels possible."],
  ],
  muscle: [
    ["Activation", "Open with controlled reps for the target muscles and one lighter practice set."],
    ["Progressive strength", "Use slower lowering reps and add load when the final set still feels clean."],
    ["Accessory finisher", "Add a short core or isolation block for the area you want to improve most."],
  ],
  endurance: [
    ["Easy start", "Begin below conversational pace for 6 minutes to settle your breathing."],
    ["Steady block", "Hold a sustainable pace, then add short surges if your energy is high."],
    ["Mobility close", "Calves, hips, and thoracic rotations to keep your next session smooth."],
  ],
  mobility: [
    ["Joint prep", "Controlled neck, shoulder, spine, hip, knee, and ankle circles."],
    ["Strengthened range", "Slow split squats, wall slides, glute bridges, and dead bugs."],
    ["Downshift", "Long exhales in deep squat, couch stretch, and child's pose variations."],
  ],
};

const equipmentAdjustments = {
  bodyweight: "Use bodyweight tempo, pauses, and clean range of motion.",
  dumbbells: "Use dumbbells for presses, rows, carries, squats, or hinges.",
  gym: "Use machines or barbells where they help you train safely and progressively.",
  bands: "Use bands for rows, presses, lateral walks, and warm-up activation.",
};

const experienceAdjustments = {
  beginner: "Keep the effort at 6-7 out of 10 and prioritize consistency.",
  intermediate: "Work around 7-8 out of 10 and track one measurable progression.",
  advanced: "Push one main block hard, then keep accessories crisp and controlled.",
};

const weeklyProgram = [
  {
    id: "push",
    day: "Day 1",
    title: "Push",
    focus: "Chest + Shoulders + Triceps",
    summary: "Heavy pressing first, then shoulder volume and triceps finishers.",
    exercises: [
      ["Barbell Bench Press", "3x12/10/8", "Stop 1-2 inches before lockout", "barbell-bench-press", "barbell bench press"],
      ["Incline Dumbbell Press", "3x12/10/8", "Control the lower and keep shoulder blades set", "incline-dumbbell-press", "dumbbell incline bench press"],
      ["Weighted Chest Dips", "3x12/10/8", "Lean slightly forward and own the bottom position", "weighted-chest-dips", "chest dip"],
      ["Seated Dumbbell Shoulder Press", "3x12/10/8", "Keep ribs stacked and press in a clean arc", "seated-dumbbell-shoulder-press", "dumbbell shoulder press"],
      ["Cable / Machine Lateral Raises", "3x12/10/8", "Lead with elbows and pause near shoulder height", "cable-machine-lateral-raises", "cable lateral raise"],
      ["Rope Pushdowns", "3x12/10/8", "Split the rope at the bottom without swinging", "rope-pushdowns", "triceps pushdown"],
      ["Reverse-Grip Pushdowns", "2x12/10/8", "Use lighter load and lock the elbows in place", "reverse-grip-pushdowns", "reverse grip triceps pushdown"],
    ],
  },
  {
    id: "pull",
    day: "Day 2",
    title: "Pull",
    focus: "Back + Rear Delts + Biceps",
    summary: "Hinge pattern, vertical pull, row volume, rear delts, then curls.",
    exercises: [
      ["Romanian Deadlift", "3x12/10/8", "Soft knees, long hamstring stretch, neutral spine", "romanian-deadlift", "romanian deadlift"],
      ["Pull-Ups / Lat Pulldown", "3x12/10/8", "Drive elbows down and keep reps smooth", "pull-ups-lat-pulldown", "lat pulldown"],
      ["Chest-Supported Dumbbell Row", "3x12/10/8", "Row toward hips and pause at the top", "chest-supported-dumbbell-row", "dumbbell row"],
      ["Rear Delt Cable Fly / Reverse Pec Deck", "3x12/10/8", "Move through the rear delts, not the traps", "rear-delt-cable-fly-reverse-pec-deck", "reverse pec deck"],
      ["Barbell Curl", "3x12/10/8", "Keep shoulders quiet and finish each rep tall", "barbell-curl", "barbell curl"],
      ["Hammer Curl", "3x12/10/8", "Neutral grip, controlled lowering", "hammer-curl", "hammer curl"],
    ],
  },
  {
    id: "legs",
    day: "Day 3",
    title: "Legs + Abs",
    focus: "Quads + Hamstrings + Calves + Core",
    summary: "Squat and press volume, hamstrings, calves, and loaded abs.",
    exercises: [
      ["Squats", "3x12/10/8", "Brace hard and keep depth consistent", "squats", "barbell squat"],
      ["Leg Press", "3x12/10/8", "Use full range without hips rolling off the pad", "leg-press", "leg press"],
      ["Romanian Deadlift", "3x12/10/8", "Treat this as hamstring work, not a max pull", "romanian-deadlift", "romanian deadlift"],
      ["Lying Leg Curl", "3x12/10/8", "Squeeze hard and lower under control", "lying-leg-curl", "lying leg curl"],
      ["Standing Calf Raise", "3x12/10/8", "Pause at top and stretch at bottom", "standing-calf-raise", "standing calf raise"],
      ["Weighted Hanging Leg Raise / Cable Crunch", "3x12/10/8", "Curl the pelvis and avoid momentum", "weighted-hanging-leg-raise-cable-crunch", "hanging leg raise"],
    ],
  },
  {
    id: "upper",
    day: "Day 4",
    title: "Upper Hypertrophy",
    focus: "Chest + Back + Shoulders",
    summary: "Balanced upper body volume with cables and joint-friendly pressing.",
    exercises: [
      ["Dumbbell Bench Press", "3x12/10/8", "Match depth and range on both sides", "dumbbell-bench-press", "dumbbell bench press"],
      ["Cable Chest Fly", "3x12/10/8", "Big stretch, soft elbows, squeeze through midline", "cable-chest-fly", "cable chest fly"],
      ["Seated Cable Row (Neutral Grip)", "3x12/10/8", "Stay tall and pull elbows behind the ribs", "seated-cable-row-neutral-grip", "seated cable row"],
      ["Cable Lateral Raise", "3x12/10/8", "Keep cable tension through the entire rep", "cable-lateral-raise", "cable lateral raise"],
      ["Single-Arm Rope Pushdown", "3x12/10/8", "Match reps left and right", "single-arm-rope-pushdown", "single arm triceps pushdown"],
      ["Face Pulls", "2x12-15", "Optional light rear-delt and shoulder health work", "face-pulls", "face pull"],
    ],
  },
  {
    id: "arms",
    day: "Day 5",
    title: "Shoulders + Arms",
    focus: "Hypertrophy + Balance",
    summary: "Shoulder shape, rear delts, biceps, triceps, and an isometric finisher.",
    exercises: [
      ["Arnold Press", "3x12/10/8", "Rotate smoothly and avoid leaning back", "arnold-press", "arnold press"],
      ["Rear Delt Raises", "3x12/10/8", "Use strict reps with a small pause", "rear-delt-raises", "rear delt raise"],
      ["Preacher Curl / Incline Dumbbell Curl", "3x12/10/8", "Pick one curl and keep tension constant", "preacher-curl-incline-dumbbell-curl", "preacher curl"],
      ["Rope Pushdowns", "3x12/10/8", "Use the same setup as push day and progress slowly", "rope-pushdowns", "triceps pushdown"],
      ["Overhead Dumbbell Extension", "2x12/10/8", "Keep it light and elbow-friendly", "overhead-dumbbell-extension", "overhead dumbbell triceps extension"],
      ["Isometric Pushdown Hold", "2x30 sec", "Hold the hardest clean lockout position", "isometric-pushdown-hold", "triceps pushdown hold"],
    ],
  },
];

const progressionSteps = [
  "Use the same weight across 12, 10, and 8 reps when possible. The final set should stop about 1-2 reps before form breaks.",
  "When you hit all target reps cleanly for every set, add the smallest available weight next week.",
  "If reps drop below the target, keep the same weight next time and improve execution before loading heavier.",
  "For cables and lateral raises, progress with slower tempo or cleaner pauses before chasing big weight jumps.",
  "Deload every 5-7 hard weeks by reducing load 10-15% or cutting one set from each movement.",
];

const $ = (selector) => document.querySelector(selector);

let state = loadState();
let activeProgramDay = 0;
const exerciseMediaCache = new Map();
let mediaRequestToken = 0;

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(defaultState);
  try {
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      preferences: {
        ...structuredClone(defaultState).preferences,
        ...(parsed.preferences || {}),
      },
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${dateString}T12:00:00`));
}

function init() {
  $("#todayLabel").textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  $("#logDate").value = todayISO();

  Object.entries(state.preferences).forEach(([key, value]) => {
    const field = $(`#${key}`);
    if (field) field.value = value;
  });

  $("#logForm").addEventListener("submit", handleLogSubmit);
  $("#preferencesForm").addEventListener("submit", handlePreferencesSubmit);
  $("#refreshPlan").addEventListener("click", renderSuggestion);
  $("#resetDemo").addEventListener("click", resetData);

  render();
}

function handleLogSubmit(event) {
  event.preventDefault();
  const log = {
    date: $("#logDate").value,
    weight: Number($("#weight").value),
    minutes: Number($("#minutes").value),
    workoutType: $("#workoutType").value,
    notes: $("#notes").value.trim(),
  };

  state.logs = state.logs.filter((entry) => entry.date !== log.date);
  state.logs.push(log);
  state.logs.sort((a, b) => a.date.localeCompare(b.date));
  saveState();
  $("#notes").value = "";
  render();
}

function handlePreferencesSubmit(event) {
  event.preventDefault();
  state.preferences = {
    goal: $("#goal").value,
    experience: $("#experience").value,
    availableTime: $("#availableTime").value,
    equipment: $("#equipment").value,
    userWant: $("#userWant").value.trim(),
  };
  saveState();
  render();
}

function resetData() {
  const confirmed = confirm("Reset all saved logs and preferences?");
  if (!confirmed) return;
  state = structuredClone(defaultState);
  saveState();
  Object.entries(state.preferences).forEach(([key, value]) => {
    const field = $(`#${key}`);
    if (field) field.value = value;
  });
  render();
}

function render() {
  renderMetrics();
  renderWeeklyPlan();
  renderChart();
  renderSuggestion();
  renderHistory();
}

function renderWeeklyPlan() {
  const tabs = $("#dayTabs");
  const grid = $("#exerciseGrid");
  const summary = $("#activeDaySummary");
  const activeDay = weeklyProgram[activeProgramDay];
  tabs.innerHTML = "";
  grid.innerHTML = "";
  summary.innerHTML = "";

  weeklyProgram.forEach((programDay, index) => {
    const button = document.createElement("button");
    button.className = `day-tab${index === activeProgramDay ? " active" : ""}`;
    button.type = "button";
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(index === activeProgramDay));
    button.innerHTML = `<span>${programDay.day} - ${programDay.title}</span><small>${programDay.focus}</small>`;
    button.addEventListener("click", () => {
      activeProgramDay = index;
      renderWeeklyPlan();
    });
    tabs.appendChild(button);
  });

  const summaryCopy = document.createElement("div");
  const summaryTitle = document.createElement("h3");
  summaryTitle.textContent = `${activeDay.day}: ${activeDay.title}`;
  const summaryText = document.createElement("p");
  summaryText.textContent = activeDay.summary;
  summaryCopy.append(summaryTitle, summaryText);
  const volume = document.createElement("p");
  volume.textContent = `${activeDay.exercises.length} exercises - ${activeDay.focus}`;
  summary.append(summaryCopy, volume);

  activeDay.exercises.forEach(([name, sets, note, slug, mediaQuery]) => {
    const card = document.createElement("article");
    card.className = "exercise-card";
    card.dataset.slug = slug;
    const image = document.createElement("img");
    image.src = `assets/exercises/${slug}.png`;
    image.alt = `${name} exercise illustration`;
    image.loading = "lazy";
    image.dataset.localSrc = image.src;
    const media = document.createElement("div");
    media.className = "exercise-media";
    const badge = document.createElement("span");
    badge.className = "media-badge";
    badge.textContent = "Local PNG";
    media.append(image, badge);
    const body = document.createElement("div");
    body.className = "exercise-card-body";
    const title = document.createElement("h3");
    title.textContent = name;
    const meta = document.createElement("div");
    meta.className = "exercise-meta";
    const setsPill = document.createElement("span");
    setsPill.textContent = sets;
    const progressionPill = document.createElement("span");
    progressionPill.textContent = sets.includes("30 sec") ? "Hold" : "Double progression";
    const apiPill = document.createElement("span");
    apiPill.dataset.role = "api-pill";
    apiPill.textContent = "Checking API";
    meta.append(setsPill, progressionPill, apiPill);
    const noteText = document.createElement("p");
    noteText.className = "exercise-note";
    noteText.textContent = note;
    const actions = document.createElement("div");
    actions.className = "exercise-actions";
    const videoLink = document.createElement("a");
    videoLink.href = youtubeSearchUrl(`${mediaQuery} proper form tutorial`);
    videoLink.target = "_blank";
    videoLink.rel = "noreferrer";
    videoLink.textContent = "Training video";
    const apiLink = document.createElement("a");
    apiLink.href = exerciseDbSearchUrl(mediaQuery);
    apiLink.target = "_blank";
    apiLink.rel = "noreferrer";
    apiLink.textContent = "API source";
    actions.append(videoLink, apiLink);
    body.append(title, meta, noteText, actions);
    card.append(media, body);
    grid.appendChild(card);
  });

  const progressionList = $("#progressionList");
  progressionList.innerHTML = "";
  progressionSteps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    progressionList.appendChild(item);
  });

  hydrateExerciseMedia(activeDay);
}

async function hydrateExerciseMedia(activeDay) {
  const token = (mediaRequestToken += 1);
  $("#apiStatus").textContent = "Loading free ExerciseDB GIFs for this day...";
  const results = await Promise.allSettled(
    activeDay.exercises.map(([name, , , slug, mediaQuery]) => loadExerciseMedia(name, slug, mediaQuery)),
  );
  if (token !== mediaRequestToken) return;

  let matches = 0;
  results.forEach((result) => {
    if (result.status !== "fulfilled" || !result.value) return;
    const { slug, media } = result.value;
    const card = document.querySelector(`.exercise-card[data-slug="${slug}"]`);
    if (!card) return;
    const image = card.querySelector("img");
    const badge = card.querySelector(".media-badge");
    const apiPill = card.querySelector('[data-role="api-pill"]');
    if (media?.gifUrl) {
      image.src = media.gifUrl;
      badge.textContent = "ExerciseDB GIF";
      apiPill.textContent = media.name;
      matches += 1;
    } else {
      badge.textContent = "Local PNG";
      apiPill.textContent = "PNG fallback";
    }
  });

  $("#apiStatus").textContent = matches
    ? `${matches} free ExerciseDB GIF${matches === 1 ? "" : "s"} matched. PNG fallback covers the rest.`
    : "ExerciseDB did not return close GIF matches for this day, so local PNGs are shown.";
}

async function loadExerciseMedia(name, slug, mediaQuery) {
  const key = `${slug}:${mediaQuery}`;
  if (exerciseMediaCache.has(key)) return { slug, media: exerciseMediaCache.get(key) };

  try {
    const response = await fetch(`https://oss.exercisedb.dev/api/v1/exercises?name=${encodeURIComponent(mediaQuery)}&limit=12`);
    if (!response.ok) throw new Error("ExerciseDB request failed");
    const payload = await response.json();
    const best = findBestExerciseMatch(payload.data || [], mediaQuery, name);
    const media = best?.gifUrl ? best : null;
    exerciseMediaCache.set(key, media);
    return { slug, media };
  } catch {
    exerciseMediaCache.set(key, null);
    return { slug, media: null };
  }
}

function findBestExerciseMatch(items, query, displayName) {
  const terms = normalizeExerciseTerms(query || displayName);
  let best = null;
  let bestScore = 0;

  items.forEach((item) => {
    const candidate = normalizeExerciseTerms(item.name);
    const score = terms.reduce((sum, term) => sum + (candidate.includes(term) ? 1 : 0), 0);
    const weightedScore = score + (candidate === terms.join(" ") ? 2 : 0);
    if (weightedScore > bestScore) {
      best = item;
      bestScore = weightedScore;
    }
  });

  return bestScore >= Math.min(2, terms.length) ? best : null;
}

function normalizeExerciseTerms(value) {
  const stopWords = new Set(["the", "and", "or", "with", "machine"]);
  return value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function exerciseDbSearchUrl(query) {
  return `https://oss.exercisedb.dev/api/v1/exercises?name=${encodeURIComponent(query)}&limit=12`;
}

function renderMetrics() {
  const sortedLogs = [...state.logs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sortedLogs.at(-1);
  const previous = sortedLogs.at(-2);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const weeklyMinutes = state.logs
    .filter((entry) => new Date(`${entry.date}T12:00:00`) >= sevenDaysAgo)
    .reduce((sum, entry) => sum + entry.minutes, 0);
  const weeklyPercent = Math.min(100, Math.round((weeklyMinutes / 150) * 100));
  const readiness = calculateReadiness(weeklyMinutes, latest);
  const weightChange = latest && previous ? latest.weight - previous.weight : 0;

  $("#currentWeight").textContent = latest ? `${latest.weight.toFixed(1)} lb` : "--";
  $("#weeklyMinutes").textContent = `${weeklyMinutes} min`;
  $("#goalFocus").textContent = goalLabels[state.preferences.goal];
  $("#weightDelta").textContent = latest && previous ? `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} lb from last log` : "Add first entry";
  $("#weeklyTarget").textContent = `${weeklyPercent}% of weekly target`;
  $("#equipmentFocus").textContent = equipmentLabels[state.preferences.equipment];
  $("#readinessScore").textContent = latest ? readiness.score : "--";
  $("#readinessText").textContent = readiness.label;
  $("#nextMove").textContent = latest?.date === todayISO() ? "Plan next" : "Check in";
  $("#nextMoveDetail").textContent = latest?.date === todayISO() ? `${state.preferences.availableTime} minute ${goalLabels[state.preferences.goal].toLowerCase()} session` : "Log today to calibrate";
  $("#heroPlanTitle").textContent = `${goalLabels[state.preferences.goal]} plan for ${state.preferences.availableTime} minutes.`;
  $("#heroPlanText").textContent = latest ? `Last logged ${formatDate(latest.date)} with ${latest.minutes} minutes of ${latest.workoutType.toLowerCase()}.` : "Choose your goal, log the day, and PulsePlan will keep the next session realistic.";
  $("#coachBriefTitle").textContent = readiness.title;
  $("#coachBriefText").textContent = readiness.brief;
}

function calculateReadiness(weeklyMinutes, latest) {
  if (!latest) {
    return {
      score: "--",
      label: "No logs yet",
      title: "Build consistency first.",
      brief: "Save a daily check-in to unlock trend-aware training guidance.",
    };
  }

  const daysSinceLog = Math.max(0, Math.round((new Date(`${todayISO()}T12:00:00`) - new Date(`${latest.date}T12:00:00`)) / 86400000));
  let score = 72;
  score += Math.min(16, Math.round(weeklyMinutes / 12));
  score -= daysSinceLog * 9;
  if (latest.minutes > Number(state.preferences.availableTime) * 1.25) score -= 8;
  score = Math.max(35, Math.min(96, score));

  if (score >= 82) {
    return {
      score,
      label: "Green light",
      title: "You can train with intent.",
      brief: "Keep the main block crisp and record one measurable progression.",
    };
  }

  if (score >= 65) {
    return {
      score,
      label: "Steady",
      title: "A controlled session fits today.",
      brief: "Stay smooth, finish with energy left, and protect tomorrow's consistency.",
    };
  }

  return {
    score,
    label: "Deload",
    title: "Recovery is the plan.",
    brief: "Use mobility, walking, and light technique work to keep the habit alive.",
  };
}

function renderChart() {
  const canvas = $("#weightChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const logs = state.logs.slice(-14);
  if (logs.length === 0) {
    drawEmptyChart(ctx, width, height);
    $("#trendText").textContent = "No entries yet";
    return;
  }

  const padding = 48;
  const weights = logs.map((entry) => entry.weight);
  const min = Math.min(...weights) - 2;
  const max = Math.max(...weights) + 2;
  const range = Math.max(max - min, 1);

  ctx.strokeStyle = "#dbe3ef";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = padding + ((height - padding * 2) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }

  const points = logs.map((entry, index) => {
    const x = logs.length === 1 ? width / 2 : padding + ((width - padding * 2) / (logs.length - 1)) * index;
    const y = height - padding - ((entry.weight - min) / range) * (height - padding * 2);
    return { x, y, entry };
  });

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#0f766e");
  gradient.addColorStop(0.55, "#2563eb");
  gradient.addColorStop(1, "#ef6a4a");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#132238";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = "#64748b";
  ctx.font = "700 14px Inter, system-ui, sans-serif";
  points.forEach((point, index) => {
    if (index === 0 || index === points.length - 1) {
      ctx.fillText(formatDate(point.entry.date), point.x - 24, height - 16);
    }
  });

  const change = weights[weights.length - 1] - weights[0];
  const direction = change > 0 ? "+" : "";
  $("#trendText").textContent = logs.length > 1 ? `${direction}${change.toFixed(1)} lb trend` : "First entry saved";
}

function drawEmptyChart(ctx, width, height) {
  ctx.strokeStyle = "#dbe3ef";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = 48 + ((height - 96) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(width - 48, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#64748b";
  ctx.font = "800 24px Inter, system-ui, sans-serif";
  ctx.fillText("Add a weight entry to draw your trend.", 250, 210);
}

function renderSuggestion() {
  const prefs = state.preferences;
  const recent = state.logs.slice(-3);
  const lowRecovery = recent.length >= 2 && recent.every((entry) => entry.minutes >= Number(prefs.availableTime));
  const plan = planLibrary[prefs.goal];
  const time = Number(prefs.availableTime);
  const userRequest = prefs.userWant ? `You asked for: ${prefs.userWant}` : "Add a request to make this plan more specific.";

  $("#suggestionTitle").textContent = `${goalLabels[prefs.goal]} - ${time} min`;
  $("#suggestionBody").innerHTML = "";

  const adjustedPlan = plan.map(([title, detail], index) => {
    const minutes = index === 0 ? Math.max(5, Math.round(time * 0.15)) : index === 1 ? Math.round(time * 0.7) : Math.max(5, Math.round(time * 0.15));
    return { title, detail, minutes };
  });

  adjustedPlan.forEach((block, index) => {
    const card = document.createElement("div");
    card.className = "plan-card";
    const icon = document.createElement("div");
    icon.className = "plan-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = String(index + 1);
    const content = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = `${block.title} - ${block.minutes} min`;
    const detail = document.createElement("p");
    detail.textContent = block.detail;
    content.append(heading, detail);
    card.append(icon, content);
    $("#suggestionBody").appendChild(card);
  });

  const coaching = document.createElement("div");
  coaching.className = "plan-card";
  const coachIcon = document.createElement("div");
  coachIcon.className = "plan-icon";
  coachIcon.setAttribute("aria-hidden", "true");
  coachIcon.textContent = "OK";
  const coachContent = document.createElement("div");
  const coachHeading = document.createElement("h3");
  coachHeading.textContent = "Coach note";
  const coachText = document.createElement("p");
  coachText.textContent = `${equipmentAdjustments[prefs.equipment]} ${experienceAdjustments[prefs.experience]} ${lowRecovery ? "Because your recent minutes are high, make this one lighter if soreness is building." : ""} ${userRequest}`;
  coachContent.append(coachHeading, coachText);
  coaching.append(coachIcon, coachContent);
  $("#suggestionBody").appendChild(coaching);
}

function renderHistory() {
  const list = $("#historyList");
  list.innerHTML = "";
  const logs = [...state.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  if (logs.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No logs yet. Save today's check-in and this area becomes your recent training timeline.";
    list.appendChild(empty);
    return;
  }

  logs.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "history-item";
    const date = document.createElement("strong");
    date.textContent = formatDate(entry.date);
    const summary = document.createElement("div");
    const type = document.createElement("strong");
    type.textContent = entry.workoutType;
    const notes = document.createElement("span");
    notes.textContent = entry.notes || "No notes added";
    summary.append(type, notes);
    const stats = document.createElement("span");
    stats.className = "history-stats";
    stats.textContent = `${entry.weight.toFixed(1)} lb - ${entry.minutes} min`;
    item.append(date, summary, stats);
    list.appendChild(item);
  });
}

init();
