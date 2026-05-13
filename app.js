const storageKey = "pulseplan-state-v1";
const API_BASE = window.location.protocol === "file:" ? "http://127.0.0.1:4174" : "";
const CURATOR_MODE = new URLSearchParams(window.location.search).has("curate");
const exerciseImageSrc = "assets/exercises/exercise-demo.gif";

const defaultState = {
  logs: [],
  workouts: [],
  shorts: {},
  activeWorkout: null,
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

// Add verified YouTube video IDs here to auto-embed them per exercise.
// The deployed site also loads data/exercise-tutorials.json so users do not
// need to paste tutorial URLs themselves.
const youtubeTutorials = {
  // "barbell-bench-press": "YOUTUBE_VIDEO_ID",
};
let serverTutorials = {};

const dayAccents = {
  push: "Chest drive",
  pull: "Back density",
  legs: "Lower power",
  upper: "Upper balance",
  arms: "Arm detail",
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

const prepActivities = ["Running", "Swimming", "Sauna", "Warm-up", "Mobility", "Other"];

const $ = (selector) => document.querySelector(selector);

let state = loadState();
let activeProgramDay = 0;
const exerciseDemoDetails = new Map();
let activeDemoKey = "";

function loadState() {
  let saved = null;
  try {
    saved = localStorage.getItem(storageKey);
  } catch {
    saved = null;
  }
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
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // File previews can block storage; keep the in-memory session working.
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${dateString}T12:00:00`));
}

async function init() {
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
  $("#startWorkout").addEventListener("click", startWorkout);
  $("#shortsForm").addEventListener("submit", handleShortsSubmit);
  $("#clearShort").addEventListener("click", clearCurrentShort);
  $("#autoFillTutorials").addEventListener("click", autoFillTutorials);
  document.body.classList.toggle("curator-mode", CURATOR_MODE);
  document.querySelectorAll("[data-close-demo]").forEach((element) => {
    element.addEventListener("click", closeExerciseDemo);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeExerciseDemo();
  });

  await loadServerTutorials();
  render();
}

async function loadServerTutorials() {
  try {
    const response = await fetch(`${API_BASE}/api/tutorials`);
    if (!response.ok) throw new Error("Tutorial API unavailable");
    serverTutorials = await response.json();
  } catch {
    try {
      const fallback = await fetch("data/exercise-tutorials.json");
      serverTutorials = fallback.ok ? await fallback.json() : {};
    } catch {
      serverTutorials = {};
    }
  }
}

async function saveServerTutorial(slug, videoId) {
  try {
    const response = await fetch(`${API_BASE}/api/tutorials/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    });
    if (!response.ok) return false;
    const payload = await response.json();
    if (payload.videoId) {
      serverTutorials[slug] = payload;
    } else {
      delete serverTutorials[slug];
    }
    return true;
  } catch {
    return false;
  }
}

async function autoFillTutorials() {
  const status = $("#curatorStatus");
  status.textContent = "Searching YouTube and saving missing exercise videos...";
  try {
    const exercises = weeklyProgram.flatMap((programDay) => programDay.exercises.map(([name, , , slug, mediaQuery]) => ({
      slug,
      name,
      query: mediaQuery,
      day: programDay.title,
    })));
    const response = await fetch(`${API_BASE}/api/tutorials/auto-fill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercises }),
    });
    const payload = await response.json();
    if (!response.ok) {
      status.textContent = payload.error || "Could not auto-fill videos.";
      return;
    }
    serverTutorials = payload.tutorials || {};
    renderWeeklyPlan();
    status.textContent = `Auto-filled ${payload.added?.length || 0} videos. ${payload.skipped?.length || 0} exercises skipped.`;
  } catch {
    status.textContent = "Could not reach the backend auto-fill endpoint.";
  }
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
  renderWorkoutRunner();
  renderChart();
  renderSuggestion();
  renderHistory();
}

function renderWeeklyPlan() {
  const activeDay = weeklyProgram[activeProgramDay];
  exerciseDemoDetails.clear();
  renderRoutineOverview();
  renderHeroMedia(activeDay);
  $("#startWorkout").textContent = state.activeWorkout ? "Resume workout" : `Start ${activeDay.day}`;

  const progressionList = $("#progressionList");
  progressionList.innerHTML = "";
  progressionSteps.forEach((step) => {
    const item = document.createElement("li");
    item.textContent = step;
    progressionList.appendChild(item);
  });
}

function renderRoutineOverview() {
  const overview = $("#routineOverview");
  overview.innerHTML = "";

  weeklyProgram.forEach((programDay, index) => {
    const card = document.createElement("article");
    card.className = `routine-day routine-day-${programDay.id}`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "routine-day-header";
    button.setAttribute("aria-label", `View ${programDay.day} ${programDay.title}`);
    button.addEventListener("click", () => {
      activeProgramDay = index;
      renderWeeklyPlan();
    });

    const title = document.createElement("div");
    const day = document.createElement("span");
    day.textContent = programDay.day;
    const heading = document.createElement("h3");
    heading.textContent = programDay.title;
    title.append(day, heading);
    const focus = document.createElement("p");
    focus.textContent = programDay.focus;
    button.append(title, focus);

    const list = document.createElement("ol");
    programDay.exercises.forEach(([name, sets, note, slug, mediaQuery], exerciseIndex) => {
      const demoKey = `${programDay.id}--${slug}`;
      const primaryMuscle = getPrimaryMuscle(name, programDay);
      const item = document.createElement("li");
      item.dataset.demoKey = demoKey;
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "routine-thumb";
      thumb.setAttribute("aria-label", `Open ${name} tutorial`);
      thumb.addEventListener("click", () => openRoutineExerciseDemo(index, demoKey));
      const image = document.createElement("img");
      image.src = exerciseImageSrc;
      image.alt = `${name} illustration`;
      thumb.appendChild(image);

      const text = document.createElement("div");
      text.className = "routine-exercise-copy";
      const exercise = document.createElement("strong");
      exercise.textContent = name;
      const detail = document.createElement("small");
      detail.textContent = note;
      const tags = document.createElement("div");
      tags.className = "routine-tags";
      tags.innerHTML = `<span>${`0${exerciseIndex + 1}`.slice(-2)}</span><span>${primaryMuscle}</span><span>${getExerciseEmphasis(name, programDay)}</span>`;
      text.append(tags, exercise, detail);

      const prescription = document.createElement("span");
      prescription.textContent = sets;
      const detailButton = document.createElement("button");
      detailButton.type = "button";
      detailButton.className = "routine-detail-button";
      const hasAutoShort = Boolean(getCuratedTutorialId(slug));
      detailButton.textContent = hasAutoShort ? "Watch video tutorial" : "Open tutorial";
      detailButton.addEventListener("click", () => openRoutineExerciseDemo(index, demoKey));
      item.append(thumb, text, prescription, detailButton);
      list.appendChild(item);
      exerciseDemoDetails.set(demoKey, {
        name,
        sets,
        primaryMuscle,
        progression: sets.includes("30 sec") ? "Hold" : "Double progression",
        how: getExerciseHowTo(name),
        benefits: getExerciseBenefits(name, programDay),
        steps: [],
        tutorialType: "Form guide",
        slug,
        youtubeId: getCuratedTutorialId(slug),
        mediaQuery,
        mediaSrc: image.src,
      });
    });

    card.append(button, list);
    overview.appendChild(card);
  });
}

function openRoutineExerciseDemo(dayIndex, demoKey) {
  activeProgramDay = dayIndex;
  openExerciseDemo(demoKey);
}

function renderHeroMedia(activeDay) {
  const heroMedia = $("#heroMedia");
  heroMedia.innerHTML = "";
  activeDay.exercises.slice(0, 3).forEach(([name, , , slug], index) => {
    const frame = document.createElement("article");
    frame.className = `hero-exercise hero-exercise-${index + 1}`;
    const image = document.createElement("img");
    image.src = exerciseImageSrc;
    image.alt = `${name} preview`;
    const label = document.createElement("span");
    label.textContent = index === 0 ? dayAccents[activeDay.id] : name;
    frame.append(image, label);
    heroMedia.appendChild(frame);
  });
}

function startWorkout() {
  if (state.activeWorkout) {
    renderWorkoutRunner();
    $("#workoutRunner").scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  const activeDay = weeklyProgram[activeProgramDay];
  state.activeWorkout = {
    id: `workout-${Date.now()}`,
    date: todayISO(),
    dayIndex: activeProgramDay,
    stepIndex: -1,
    startedAt: new Date().toISOString(),
    prep: [],
    exercises: activeDay.exercises.map(([name, sets, note, slug]) => ({
      name,
      sets,
      note,
      slug,
      loggedSets: [],
      completed: false,
    })),
  };
  saveState();
  renderWorkoutRunner();
  $("#workoutRunner").scrollIntoView({ behavior: "smooth", block: "start" });
}

function cancelWorkout() {
  const confirmed = confirm("End this workout without saving it?");
  if (!confirmed) return;
  state.activeWorkout = null;
  saveState();
  renderWorkoutRunner();
}

function renderWorkoutRunner() {
  const runner = $("#workoutRunner");
  const workout = state.activeWorkout;
  if (!workout) {
    runner.className = "workout-runner workout-runner-empty";
    runner.innerHTML = "";
    return;
  }

  const activeDay = weeklyProgram[workout.dayIndex] || weeklyProgram[0];
  const totalSteps = workout.exercises.length;
  const completedExercises = workout.exercises.filter((exercise) => exercise.completed).length;
  const currentNumber = workout.stepIndex < 0 ? 0 : Math.min(workout.stepIndex + 1, totalSteps);
  runner.className = "workout-runner active";
  runner.innerHTML = `
    <div class="runner-shell">
      <div class="runner-topline">
        <div>
          <p class="section-kicker">Workout mode</p>
          <h2>${activeDay.day} - ${activeDay.title}</h2>
          <p>${activeDay.focus}</p>
        </div>
        <button class="runner-ghost" type="button" data-runner-action="cancel">End</button>
      </div>
      <div class="runner-progress" aria-label="Workout progress">
        <span style="width: ${Math.round((completedExercises / Math.max(totalSteps, 1)) * 100)}%"></span>
      </div>
      <div class="runner-step-label">${workout.stepIndex < 0 ? "Prep" : `Exercise ${currentNumber} of ${totalSteps}`}</div>
      <div id="runnerStep"></div>
    </div>
  `;

  runner.querySelector('[data-runner-action="cancel"]').addEventListener("click", cancelWorkout);
  if (workout.stepIndex < 0) renderPrepStep(workout);
  else if (workout.stepIndex >= totalSteps) renderFinishStep(workout, activeDay);
  else renderExerciseStep(workout, activeDay);
}

function renderPrepStep(workout) {
  const step = $("#runnerStep");
  const prepRows = workout.prep.map((item, index) => `
    <li>
      <strong>${escapeHtml(item.type)}</strong>
      <span>${item.minutes || 0} min${item.distance ? ` - ${item.distance} mi` : ""}</span>
      <button type="button" data-remove-prep="${index}" aria-label="Remove ${escapeHtml(item.type)}">Remove</button>
    </li>
  `).join("");

  step.innerHTML = `
    <div class="runner-card prep-card">
      <div>
        <p class="section-kicker">Before lifting</p>
        <h3>Add pre-workout activity</h3>
        <p>Track running, swimming, sauna, mobility, or warm-up time before the programmed workout.</p>
      </div>
      <form class="prep-form" id="prepForm">
        <label>
          <span>Activity</span>
          <select id="prepType">${prepActivities.map((activity) => `<option>${escapeHtml(activity)}</option>`).join("")}</select>
        </label>
        <label>
          <span>Minutes</span>
          <input id="prepMinutes" type="number" min="0" max="240" step="1" inputmode="numeric" placeholder="10" />
        </label>
        <label>
          <span>Distance</span>
          <input id="prepDistance" type="number" min="0" max="100" step="0.1" inputmode="decimal" placeholder="Optional" />
        </label>
        <button type="submit">Add</button>
      </form>
      <ul class="prep-list">${prepRows || "<li><span>No prep logged yet</span></li>"}</ul>
      <div class="runner-actions">
        <button class="button secondary" type="button" data-runner-action="skip-prep">Skip prep</button>
        <button class="button primary" type="button" data-runner-action="next">Begin first exercise</button>
      </div>
    </div>
  `;

  $("#prepForm").addEventListener("submit", handlePrepSubmit);
  step.querySelectorAll("[data-remove-prep]").forEach((button) => {
    button.addEventListener("click", () => removePrep(Number(button.dataset.removePrep)));
  });
  step.querySelector('[data-runner-action="skip-prep"]').addEventListener("click", goToNextWorkoutStep);
  step.querySelector('[data-runner-action="next"]').addEventListener("click", goToNextWorkoutStep);
}

function handlePrepSubmit(event) {
  event.preventDefault();
  const workout = state.activeWorkout;
  if (!workout) return;
  const minutes = Number($("#prepMinutes").value || 0);
  const distance = Number($("#prepDistance").value || 0);
  workout.prep.push({
    type: $("#prepType").value,
    minutes,
    distance,
  });
  saveState();
  renderWorkoutRunner();
}

function removePrep(index) {
  const workout = state.activeWorkout;
  if (!workout) return;
  workout.prep.splice(index, 1);
  saveState();
  renderWorkoutRunner();
}

function renderExerciseStep(workout, activeDay) {
  const step = $("#runnerStep");
  const exercise = workout.exercises[workout.stepIndex];
  const primaryMuscle = getPrimaryMuscle(exercise.name, activeDay);
  const setRows = exercise.loggedSets.map((set, index) => `
    <li>
      <strong>Set ${index + 1}</strong>
      <span>${set.reps ? `${set.reps} reps` : `${set.seconds || 0} sec`}${set.weight ? ` - ${set.weight} lb` : ""}${set.note ? ` - ${escapeHtml(set.note)}` : ""}</span>
      <button type="button" data-remove-set="${index}" aria-label="Remove set ${index + 1}">Remove</button>
    </li>
  `).join("");
  const targetSets = getTargetSetCount(exercise.sets);
  const isTimed = exercise.sets.toLowerCase().includes("sec") || exercise.name.toLowerCase().includes("hold");
  const canFinish = exercise.loggedSets.length > 0;

  step.innerHTML = `
    <div class="runner-card exercise-run-card">
      <div class="runner-exercise-media">
        <img src="${exerciseImageSrc}" alt="${exercise.name} illustration" />
      </div>
      <div class="runner-exercise-main">
        <p class="section-kicker">${primaryMuscle}</p>
        <h3>${exercise.name}</h3>
        <div class="exercise-meta">
          <span>${exercise.sets}</span>
          <span>${exercise.loggedSets.length}/${targetSets} sets</span>
        </div>
        <p>${exercise.note}</p>
        <form class="set-form" id="setForm">
          <label>
            <span>${isTimed ? "Seconds" : "Reps"}</span>
            <input id="setReps" type="number" min="0" max="999" step="1" inputmode="numeric" placeholder="${isTimed ? "30" : "10"}" required />
          </label>
          <label>
            <span>Weight</span>
            <input id="setWeight" type="number" min="0" max="1500" step="2.5" inputmode="decimal" placeholder="Optional" />
          </label>
          <label class="wide">
            <span>Set note</span>
            <input id="setNote" type="text" placeholder="Clean, hard, assisted, pain-free..." />
          </label>
          <button type="submit">Add set</button>
        </form>
        <ul class="set-list">${setRows || "<li><span>No sets logged yet</span></li>"}</ul>
        <div class="runner-actions">
          <button class="button secondary" type="button" data-runner-action="previous">Back</button>
          <button class="button primary" type="button" data-runner-action="next" ${canFinish ? "" : "disabled"}>${workout.stepIndex === workout.exercises.length - 1 ? "Finish exercises" : "Complete and next"}</button>
        </div>
      </div>
    </div>
  `;

  $("#setForm").addEventListener("submit", handleSetSubmit);
  step.querySelectorAll("[data-remove-set]").forEach((button) => {
    button.addEventListener("click", () => removeSet(Number(button.dataset.removeSet)));
  });
  step.querySelector('[data-runner-action="previous"]').addEventListener("click", goToPreviousWorkoutStep);
  step.querySelector('[data-runner-action="next"]').addEventListener("click", completeExerciseAndContinue);
}

function handleSetSubmit(event) {
  event.preventDefault();
  const workout = state.activeWorkout;
  if (!workout) return;
  const exercise = workout.exercises[workout.stepIndex];
  const isTimed = exercise.sets.toLowerCase().includes("sec") || exercise.name.toLowerCase().includes("hold");
  const amount = Number($("#setReps").value || 0);
  exercise.loggedSets.push({
    reps: isTimed ? 0 : amount,
    seconds: isTimed ? amount : 0,
    weight: Number($("#setWeight").value || 0),
    note: $("#setNote").value.trim(),
  });
  saveState();
  renderWorkoutRunner();
}

function removeSet(index) {
  const workout = state.activeWorkout;
  if (!workout) return;
  workout.exercises[workout.stepIndex].loggedSets.splice(index, 1);
  saveState();
  renderWorkoutRunner();
}

function completeExerciseAndContinue() {
  const workout = state.activeWorkout;
  if (!workout) return;
  workout.exercises[workout.stepIndex].completed = true;
  workout.stepIndex += 1;
  saveState();
  renderWorkoutRunner();
}

function goToNextWorkoutStep() {
  const workout = state.activeWorkout;
  if (!workout) return;
  workout.stepIndex += 1;
  saveState();
  renderWorkoutRunner();
}

function goToPreviousWorkoutStep() {
  const workout = state.activeWorkout;
  if (!workout) return;
  workout.stepIndex = Math.max(-1, workout.stepIndex - 1);
  saveState();
  renderWorkoutRunner();
}

function renderFinishStep(workout, activeDay) {
  const step = $("#runnerStep");
  const totalSets = workout.exercises.reduce((sum, exercise) => sum + exercise.loggedSets.length, 0);
  const prepMinutes = workout.prep.reduce((sum, item) => sum + Number(item.minutes || 0), 0);
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - new Date(workout.startedAt).getTime()) / 60000));
  const latestWeight = [...state.logs].sort((a, b) => b.date.localeCompare(a.date)).find((entry) => entry.weight)?.weight || "";
  step.innerHTML = `
    <div class="runner-card finish-card">
      <p class="section-kicker">Done</p>
      <h3>Save ${activeDay.title} workout</h3>
      <div class="finish-stats">
        <span><strong>${workout.exercises.filter((exercise) => exercise.completed).length}</strong> exercises</span>
        <span><strong>${totalSets}</strong> sets</span>
        <span><strong>${prepMinutes}</strong> prep min</span>
      </div>
      <form class="finish-form" id="finishWorkoutForm">
        <label>
          <span>Body weight</span>
          <input id="finishWeight" type="number" min="40" max="700" step="0.1" inputmode="decimal" value="${latestWeight}" placeholder="Optional" />
        </label>
        <label>
          <span>Total minutes</span>
          <input id="finishMinutes" type="number" min="1" max="600" step="1" inputmode="numeric" value="${Math.max(elapsedMinutes, prepMinutes)}" required />
        </label>
        <label class="wide">
          <span>Workout notes</span>
          <textarea id="finishNotes" rows="3" placeholder="Energy, best set, soreness, swimming, sauna, anything useful for next time."></textarea>
        </label>
        <div class="runner-actions wide">
          <button class="button secondary" type="button" data-runner-action="previous">Back</button>
          <button class="button primary" type="submit">Save workout</button>
        </div>
      </form>
    </div>
  `;
  $("#finishWorkoutForm").addEventListener("submit", finishWorkout);
  step.querySelector('[data-runner-action="previous"]').addEventListener("click", goToPreviousWorkoutStep);
}

function finishWorkout(event) {
  event.preventDefault();
  const workout = state.activeWorkout;
  if (!workout) return;
  const activeDay = weeklyProgram[workout.dayIndex] || weeklyProgram[0];
  const summary = buildWorkoutSummary(workout, activeDay);
  const weight = Number($("#finishWeight").value || 0);
  const minutes = Number($("#finishMinutes").value || 0);
  const notes = $("#finishNotes").value.trim();
  const savedWorkout = {
    ...workout,
    finishedAt: new Date().toISOString(),
    minutes,
    weight,
    notes,
    summary,
  };
  state.workouts = [...(state.workouts || []), savedWorkout].slice(-30);
  state.logs = state.logs.filter((entry) => entry.date !== workout.date);
  state.logs.push({
    date: workout.date,
    weight,
    minutes,
    workoutType: activeDay.title,
    notes: notes ? `${summary} ${notes}` : summary,
    workoutId: workout.id,
  });
  state.logs.sort((a, b) => a.date.localeCompare(b.date));
  activeProgramDay = (workout.dayIndex + 1) % weeklyProgram.length;
  state.activeWorkout = null;
  saveState();
  $("#logDate").value = todayISO();
  render();
}

function buildWorkoutSummary(workout, activeDay) {
  const prep = workout.prep.map((item) => `${item.type} ${item.minutes || 0}m${item.distance ? `/${item.distance}mi` : ""}`).join(", ");
  const exerciseSummary = workout.exercises
    .filter((exercise) => exercise.loggedSets.length > 0)
    .map((exercise) => `${exercise.name}: ${exercise.loggedSets.length} sets`)
    .join("; ");
  return `${activeDay.day} ${activeDay.title}${prep ? ` | Prep: ${prep}` : ""}${exerciseSummary ? ` | ${exerciseSummary}` : ""}`;
}

function getTargetSetCount(sets) {
  const match = String(sets).match(/^(\d+)/);
  return match ? Number(match[1]) : 3;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPrimaryMuscle(name, activeDay) {
  const lower = name.toLowerCase();
  if (lower.includes("leg press")) return "Legs";
  if (lower.includes("bench") || lower.includes("chest") || lower.includes("dip")) return "Chest";
  if (lower.includes("shoulder") || lower.includes("lateral") || lower.includes("arnold") || lower.includes("delt")) return "Shoulders";
  if (lower.includes("pushdown") || lower.includes("extension")) return "Triceps";
  if (lower.includes("curl")) return "Biceps";
  if (lower.includes("row") || lower.includes("pull") || lower.includes("deadlift")) return "Back";
  if (lower.includes("press")) return activeDay.id === "legs" ? "Legs" : "Chest";
  if (lower.includes("squat") || lower.includes("leg") || lower.includes("calf")) return "Legs";
  if (lower.includes("crunch") || lower.includes("raise")) return "Core";
  return activeDay.focus.split("+")[0].trim();
}

function getExerciseEmphasis(name, activeDay) {
  const lower = name.toLowerCase();
  if (lower.includes("optional")) return "Optional";
  if (lower.includes("isometric") || lower.includes("hold")) return "Finisher";
  if (activeDay.exercises[0][0] === name) return "Priority lift";
  if (lower.includes("lateral") || lower.includes("curl") || lower.includes("pushdown") || lower.includes("raise")) return "Accessory";
  return "Main work";
}

function getExerciseHowTo(name) {
  const lower = name.toLowerCase();
  if (lower.includes("bench") || lower.includes("press")) return "Set your brace, control the lowering phase, then press smoothly without bouncing or losing shoulder position.";
  if (lower.includes("dip")) return "Lower under control with shoulders packed, lean slightly forward, then drive up while keeping elbows tracking cleanly.";
  if (lower.includes("deadlift")) return "Hinge from the hips, keep the bar or dumbbells close, and stop the descent when your hamstrings are fully loaded.";
  if (lower.includes("row")) return "Keep your torso steady, pull elbows toward your hips, pause briefly, and lower with control.";
  if (lower.includes("pull-up") || lower.includes("pulldown")) return "Start from a long reach, pull elbows down toward your ribs, and avoid swinging through the rep.";
  if (lower.includes("squat") || lower.includes("leg press")) return "Brace before each rep, use a consistent depth, and drive through the full foot without rushing the bottom.";
  if (lower.includes("curl")) return "Keep your upper arms quiet, curl through a full range, and lower slowly to keep tension on the biceps.";
  if (lower.includes("pushdown") || lower.includes("extension")) return "Pin your elbows in place, move only through the forearm, and squeeze hard at the finish.";
  if (lower.includes("lateral") || lower.includes("rear delt") || lower.includes("face pull")) return "Lead with the elbows, use light control, and pause where the target muscle is working hardest.";
  if (lower.includes("calf")) return "Pause at the top, lower into a full stretch, and keep each rep strict instead of bouncing.";
  if (lower.includes("crunch") || lower.includes("leg raise")) return "Curl the pelvis toward the ribs, keep momentum low, and exhale through the hard part.";
  return "Move through a controlled range, keep the target muscle loaded, and stop the set before form breaks.";
}

function getExerciseBenefits(name, activeDay) {
  const lower = name.toLowerCase();
  if (lower.includes("bench") || lower.includes("chest") || lower.includes("dip")) return "Builds chest pressing strength, triceps output, and upper-body power for the push day.";
  if (lower.includes("shoulder") || lower.includes("arnold")) return "Improves overhead strength, shoulder stability, and balanced pressing mechanics.";
  if (lower.includes("lateral") || lower.includes("rear delt") || lower.includes("face pull")) return "Adds shoulder shape, rear-delt balance, and healthier posture around pressing volume.";
  if (lower.includes("row") || lower.includes("pull-up") || lower.includes("pulldown")) return "Builds back thickness, pulling strength, and shoulder control.";
  if (lower.includes("deadlift")) return "Strengthens hamstrings, glutes, spinal erectors, and the hinge pattern.";
  if (lower.includes("squat") || lower.includes("leg press")) return "Develops leg strength, quad size, and full-body bracing.";
  if (lower.includes("leg curl")) return "Targets hamstrings directly and supports knee health for lower-body training.";
  if (lower.includes("calf")) return "Builds lower-leg strength and ankle control through a full range.";
  if (lower.includes("curl")) return "Builds biceps size and elbow-flexion strength with cleaner arm mechanics.";
  if (lower.includes("pushdown") || lower.includes("extension")) return "Targets triceps for stronger lockout, arm size, and pressing support.";
  if (lower.includes("crunch") || lower.includes("leg raise")) return "Trains trunk control, hip flexor strength, and visible core tension.";
  return `Supports ${activeDay.focus.toLowerCase()} while reinforcing clean technique and repeatable progression.`;
}

function renderMetrics() {
  const sortedLogs = [...state.logs].sort((a, b) => a.date.localeCompare(b.date));
  const latest = sortedLogs.at(-1);
  const weightLogs = sortedLogs.filter((entry) => Number(entry.weight) > 0);
  const latestWeight = weightLogs.at(-1);
  const previousWeight = weightLogs.at(-2);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const weeklyMinutes = state.logs
    .filter((entry) => new Date(`${entry.date}T12:00:00`) >= sevenDaysAgo)
    .reduce((sum, entry) => sum + entry.minutes, 0);
  const weeklyPercent = Math.min(100, Math.round((weeklyMinutes / 150) * 100));
  const readiness = calculateReadiness(weeklyMinutes, latest);
  const weightChange = latestWeight && previousWeight ? latestWeight.weight - previousWeight.weight : 0;

  $("#currentWeight").textContent = latestWeight ? `${latestWeight.weight.toFixed(1)} lb` : "--";
  $("#weeklyMinutes").textContent = `${weeklyMinutes} min`;
  $("#goalFocus").textContent = goalLabels[state.preferences.goal];
  $("#weightDelta").textContent = latestWeight && previousWeight ? `${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)} lb from last weigh-in` : "Add first weigh-in";
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

  const logs = state.logs.filter((entry) => Number(entry.weight) > 0).slice(-14);
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

function openExerciseDemo(demoKey) {
  const details = exerciseDemoDetails.get(demoKey);
  if (!details) return;

  const modal = $("#demoModal");
  const image = $("#demoModalImage");
  image.src = details.mediaSrc;
  image.alt = `${details.name} form demo`;
  $("#demoModalMuscle").textContent = details.primaryMuscle;
  $("#demoModalTitle").textContent = details.name;
  $("#demoModalMeta").innerHTML = `
    <span>${details.sets}</span>
    <span>${details.progression}</span>
    <span>${details.tutorialType}</span>
  `;
  const stepsMarkup = details.steps?.length
    ? `<ol>${details.steps.map((step) => `<li>${step.replace(/^Step:?\\s*\\d+\\s*/i, "")}</li>`).join("")}</ol>`
    : "";
  $("#demoModalGuidance").innerHTML = `
    <p><strong>How:</strong> ${details.how}</p>
    ${stepsMarkup}
    <p><strong>Benefits:</strong> ${details.benefits}</p>
  `;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  activeDemoKey = demoKey;
  renderShortsPlayer(demoKey);
}

function closeExerciseDemo() {
  const modal = $("#demoModal");
  if (!modal?.classList.contains("open")) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  $("#demoModalImage").removeAttribute("src");
  activeDemoKey = "";
}

function handleShortsSubmit(event) {
  event.preventDefault();
  if (!activeDemoKey) return;
  const details = exerciseDemoDetails.get(activeDemoKey);
  if (!details) return;
  const url = $("#shortsUrl").value.trim();
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) {
    $("#shortsPlayer").innerHTML = "<p>Paste a valid YouTube video URL.</p>";
    return;
  }
  state.shorts = { ...(state.shorts || {}), [activeDemoKey]: videoId };
  saveState();
  saveServerTutorial(details.slug, videoId);
  details.youtubeId = videoId;
  renderShortsPlayer(activeDemoKey);
}

function clearCurrentShort() {
  if (!activeDemoKey) return;
  const nextShorts = { ...(state.shorts || {}) };
  delete nextShorts[activeDemoKey];
  state.shorts = nextShorts;
  saveState();
  renderShortsPlayer(activeDemoKey);
}

function renderShortsPlayer(demoKey) {
  const details = exerciseDemoDetails.get(demoKey);
  const savedVideoId = state.shorts?.[demoKey];
  const autoVideoId = details?.slug ? getCuratedTutorialId(details.slug) : "";
  const videoId = savedVideoId || autoVideoId;
  $("#shortsPanelTitle").textContent = CURATOR_MODE ? "Curate exercise tutorial" : "Video tutorial";
  $("#shortsUrl").value = savedVideoId ? `https://www.youtube.com/shorts/${savedVideoId}` : "";
  $("#clearShort").disabled = !savedVideoId;
  if (!videoId) {
    $("#shortsPlayer").innerHTML = CURATOR_MODE
      ? "<p>Paste a YouTube URL below, preview it here, then save it for this exercise.</p>"
      : "<p>No video tutorial has been added for this exercise yet. Use the form guide below.</p>";
    return;
  }
  $("#shortsPlayer").innerHTML = `
    ${autoVideoId && !savedVideoId ? '<span class="auto-short-label">Auto added</span>' : ""}
    <iframe
      title="${details?.name || "Exercise"} video tutorial"
      src="https://www.youtube-nocookie.com/embed/${videoId}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen></iframe>
  `;
}

function getCuratedTutorialId(slug) {
  return serverTutorials[slug]?.videoId || youtubeTutorials[slug] || "";
}

function parseYouTubeVideoId(value) {
  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) return cleanVideoId(url.pathname.slice(1));
    if (url.pathname.startsWith("/shorts/")) return cleanVideoId(url.pathname.split("/")[2]);
    if (url.pathname.startsWith("/embed/")) return cleanVideoId(url.pathname.split("/")[2]);
    return cleanVideoId(url.searchParams.get("v"));
  } catch {
    return cleanVideoId(value);
  }
}

function cleanVideoId(value) {
  const match = String(value || "").match(/^[a-zA-Z0-9_-]{11}$/);
  return match ? match[0] : "";
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
    stats.textContent = `${Number(entry.weight) > 0 ? `${entry.weight.toFixed(1)} lb - ` : ""}${entry.minutes} min`;
    item.append(date, summary, stats);
    list.appendChild(item);
  });
}

init();
