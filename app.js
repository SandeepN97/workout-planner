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

const $ = (selector) => document.querySelector(selector);

let state = loadState();

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return structuredClone(defaultState);
  try {
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
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
  renderChart();
  renderSuggestion();
  renderHistory();
}

function renderMetrics() {
  const latest = [...state.logs].sort((a, b) => b.date.localeCompare(a.date))[0];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const weeklyMinutes = state.logs
    .filter((entry) => new Date(`${entry.date}T12:00:00`) >= sevenDaysAgo)
    .reduce((sum, entry) => sum + entry.minutes, 0);

  $("#currentWeight").textContent = latest ? `${latest.weight.toFixed(1)} lb` : "--";
  $("#weeklyMinutes").textContent = `${weeklyMinutes} min`;
  $("#goalFocus").textContent = goalLabels[state.preferences.goal];
}

function renderChart() {
  const canvas = $("#weightChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#fbfcfa";
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

  ctx.strokeStyle = "#d9e1dd";
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

  ctx.strokeStyle = "#23664f";
  ctx.lineWidth = 4;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  points.forEach((point) => {
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#d65f45";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  ctx.fillStyle = "#5c6965";
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
  ctx.strokeStyle = "#d9e1dd";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = 48 + ((height - 96) / 4) * i;
    ctx.beginPath();
    ctx.moveTo(48, y);
    ctx.lineTo(width - 48, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#5c6965";
  ctx.font = "800 22px Inter, system-ui, sans-serif";
  ctx.fillText("Add a weight entry to draw your trend.", 170, 185);
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
    const heading = document.createElement("h4");
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
  const coachHeading = document.createElement("h4");
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
    stats.textContent = `${entry.weight.toFixed(1)} lb - ${entry.minutes} min`;
    item.append(date, summary, stats);
    list.appendChild(item);
  });
}

init();
