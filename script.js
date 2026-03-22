import world from "https://cdn.jsdelivr.net/npm/@svg-maps/world/+esm";

const BEST_STREAK_KEY = "find-the-country-best-streak";
const EXCLUDED_COUNTRIES = new Set(["Antarctica"]);
const PAN_THRESHOLD = 8;
const DOUBLE_TAP_MS = 300;

const PLAYABLE_COUNTRY_NAMES = new Set([
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
]);

const COUNTRY_NAME_ALIASES = new Map([
  ["bahamas, the", "Bahamas"],
  ["brunei darussalam", "Brunei"],
  ["cape verde", "Cabo Verde"],
  ["congo", "Congo"],
  ["republic of the congo", "Congo"],
  ["republic of congo", "Congo"],
  ["democratic republic of the congo", "Democratic Republic of the Congo"],
  ["democratic republic of congo", "Democratic Republic of the Congo"],
  ["dr congo", "Democratic Republic of the Congo"],
  ["czech republic", "Czechia"],
  ["iran, islamic republic of", "Iran"],
  ["korea, north", "North Korea"],
  ["korea, democratic people's republic of", "North Korea"],
  ["korea, south", "South Korea"],
  ["korea, republic of", "South Korea"],
  ["lao people's democratic republic", "Laos"],
  ["micronesia, federated states of", "Micronesia"],
  ["moldova, republic of", "Moldova"],
  ["north macedonia", "North Macedonia"],
  ["macedonia", "North Macedonia"],
  ["palestine, state of", "Palestine"],
  ["russian federation", "Russia"],
  ["saint kitts & nevis", "Saint Kitts and Nevis"],
  ["saint vincent & the grenadines", "Saint Vincent and the Grenadines"],
  ["slovak republic", "Slovakia"],
  ["syrian arab republic", "Syria"],
  ["timor leste", "Timor-Leste"],
  ["türkiye", "Turkey"],
  ["turkiye", "Turkey"],
  ["united states of america", "United States"],
  ["usa", "United States"],
  ["vatican", "Vatican City"],
  ["holy see", "Vatican City"],
  ["venezuela, bolivarian republic of", "Venezuela"],
  ["viet nam", "Vietnam"],
  ["swaziland", "Eswatini"],
  ["myanmar (burma)", "Myanmar"],
]);

const promptEl = document.querySelector("#prompt");
const subpromptEl = document.querySelector("#subprompt");
const streakEl = document.querySelector("#streak");
const statusEl = document.querySelector("#status");
const restartButton = document.querySelector("#restartButton");
const overlayRestartButton = document.querySelector("#overlayRestartButton");
const resetViewButton = document.querySelector("#resetViewButton");
const confirmSelectionButton = document.querySelector("#confirmSelectionButton");
const selectionCard = document.querySelector("#selectionCard");
const gameOverCard = document.querySelector("#gameOverCard");
const gameOverScoreEl = document.querySelector("#gameOverScore");
const gameOverDetailEl = document.querySelector("#gameOverDetail");
const mapRoot = document.querySelector("#map");

const state = {
  allCountries: [],
  playableCountries: [],
  target: null,
  score: 0,
  bestStreak: Number(localStorage.getItem(BEST_STREAK_KEY) || 0),
  locked: true,
  gameOver: false,
  selectedCountry: null,
};

let countryPaths = [];
let countryAreas = new Map();
let svg;
let baseViewBox;
let currentViewBox;
let pointers = new Map();
let lastPinchDistance = null;
let ignoreClickUntil = 0;
let lastTap = { name: null, time: 0 };

restartButton.addEventListener("click", startGame);
overlayRestartButton.addEventListener("click", startGame);
resetViewButton.addEventListener("click", resetView);
confirmSelectionButton.addEventListener("click", confirmSelection);

initialize();

function initialize() {
  try {
    state.allCountries = world.locations.filter(
      (country) => country.name && !EXCLUDED_COUNTRIES.has(country.name),
    );

    renderMap(state.allCountries);
    state.playableCountries = buildPlayablePool(state.allCountries);
    updateStreakDisplay();
    startGame();
  } catch (error) {
    promptEl.textContent = "Map failed to load";
    subpromptEl.textContent = "The browser could not import the map module. Refresh or try a local server.";
    if (streakEl) {
      streakEl.textContent = "";
    }
    statusEl.textContent = "Unable to initialize country borders.";
    console.error(error);
  }
}

function normalizeCountryName(name) {
  if (!name) return "";

  const cleaned = name.trim();
  const lowered = cleaned.toLowerCase();

  if (COUNTRY_NAME_ALIASES.has(lowered)) {
    return COUNTRY_NAME_ALIASES.get(lowered);
  }

  return cleaned;
}

function updateStreakDisplay() {
  if (!streakEl) return;
  streakEl.textContent = `Streak: ${state.score} | Best: ${state.bestStreak}`;
}

function renderMap(countries) {
  mapRoot.textContent = "";

  const namespace = "http://www.w3.org/2000/svg";
  svg = document.createElementNS(namespace, "svg");
  svg.setAttribute("viewBox", world.viewBox);
  svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", "World map with clickable countries");
  svg.addEventListener("pointerdown", handlePointerDown);
  svg.addEventListener("pointermove", handlePointerMove);
  svg.addEventListener("pointerup", handlePointerUp);
  svg.addEventListener("pointerleave", handlePointerUp);
  svg.addEventListener("wheel", handleWheel, { passive: false });

  const group = document.createElementNS(namespace, "g");

  countryPaths = countries.map((country) => {
    const path = document.createElementNS(namespace, "path");
    path.setAttribute("class", "country");
    path.setAttribute("d", country.path);
    path.setAttribute("data-name", country.name);
    group.appendChild(path);
    return path;
  });

  svg.appendChild(group);
  mapRoot.appendChild(svg);

  baseViewBox = parseViewBox(world.viewBox);
  currentViewBox = { ...baseViewBox };
}

function buildPlayablePool(countries) {
  countryAreas = computeFilledAreas(countryPaths);

  const playable = countries.filter((country) => {
    const normalized = normalizeCountryName(country.name);
    return PLAYABLE_COUNTRY_NAMES.has(normalized);
  });

  const matchedNormalizedNames = new Set(
    playable.map((country) => normalizeCountryName(country.name)),
  );

  const missingNames = [...PLAYABLE_COUNTRY_NAMES].filter(
    (name) => !matchedNormalizedNames.has(name),
  );

  if (missingNames.length) {
    console.warn("These playable countries were not found in the map dataset:", missingNames);
  }

  return playable;
}

function computeFilledAreas(paths) {
  const scale = 0.1;
  const w = Math.ceil(baseViewBox.width * scale);
  const h = Math.ceil(baseViewBox.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  const areas = new Map();

  for (const path of paths) {
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fill(new Path2D(path.getAttribute("d")));
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const { data } = ctx.getImageData(0, 0, w, h);
    let pixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) pixels++;
    }
    areas.set(path.dataset.name, pixels);
  }

  return areas;
}

function startGame() {
  if (!state.playableCountries.length) {
    promptEl.textContent = "No playable countries found";
    subpromptEl.textContent = "Check your country names against the map dataset.";
    if (streakEl) {
      streakEl.textContent = "";
    }
    statusEl.textContent = "Nothing matched the 195-country list.";
    return;
  }

  state.score = 0;
  state.locked = false;
  state.gameOver = false;
  state.selectedCountry = null;
  state.playableCountries = bandShuffle(state.playableCountries);
  lastTap = { name: null, time: 0 };

  hideGameOver();
  hideSelection();
  resetView();
  resetCountryClasses();
  updateStreakDisplay();
  statusEl.textContent = "Tap a country to select it, then lock it in.";
  advanceRound();
}

function advanceRound() {
  if (state.score >= state.playableCountries.length) {
    finishWin();
    return;
  }

  state.target = state.playableCountries[state.score];
  state.locked = false;
  state.selectedCountry = null;
  hideSelection();
  resetCountryClasses();
  updatePrompt();
  updateStreakDisplay();
}

function updatePrompt() {
  promptEl.innerHTML = `Click on: <span>${state.target.name}</span>`;
  subpromptEl.textContent = "Sudden death. Select a country, then lock it in.";
}

function confirmSelection() {
  if (!state.selectedCountry) {
    return;
  }

  handleGuess(state.selectedCountry);
}

function handleGuess(country) {
  if (state.locked || state.gameOver || !state.target || !country || Date.now() < ignoreClickUntil) {
    return;
  }

  state.locked = true;
  hideSelection();

  const guessedName = country.name;
  const targetName = state.target.name;
  const guessedNormalized = normalizeCountryName(guessedName);
  const targetNormalized = normalizeCountryName(targetName);

  if (guessedNormalized === targetNormalized) {
    state.score += 1;
    updateBestStreak();
    updateStreakDisplay();
    paintCountry(guessedName, "correct");
    statusEl.textContent = `${guessedName} is right. Keep it moving.`;

    window.setTimeout(() => {
      advanceRound();
    }, 650);
    return;
  }

  state.gameOver = true;
  updateStreakDisplay();
  paintCountry(guessedName, "wrong");
  paintCountry(targetName, "reveal");
  statusEl.textContent = `${guessedName} was wrong. ${targetName} was the target.`;

  window.setTimeout(() => {
    showGameOver(`You found ${state.score} ${state.score === 1 ? "country" : "countries"} before missing ${targetName}.`);
  }, 500);
}

function finishWin() {
  state.locked = true;
  state.gameOver = true;
  updateStreakDisplay();
  promptEl.innerHTML = `Perfect run: <span>${state.score}</span>`;
  subpromptEl.textContent = "You cleared the full playable set for this run.";
  statusEl.textContent = "Start a new game to reshuffle the world.";
  showGameOver("Perfect run. You cleared every playable country in the rotation.");
}

function updateBestStreak() {
  const nextBest = state.score;

  if (nextBest <= state.bestStreak) {
    return;
  }

  state.bestStreak = nextBest;
  localStorage.setItem(BEST_STREAK_KEY, String(state.bestStreak));
}

function resetCountryClasses() {
  countryPaths.forEach((path) => {
    path.setAttribute("class", "country");
    path.classList.toggle("disabled", state.locked || state.gameOver);
  });

  if (state.selectedCountry) {
    paintCountry(state.selectedCountry.name, "selected");
  }
}

function paintCountry(name, className) {
  countryPaths
    .filter((path) => path.dataset.name === name)
    .forEach((path) => {
      path.setAttribute("class", `country ${className}`);
      path.classList.toggle("disabled", state.locked || state.gameOver);
    });
}

function showGameOver(detail) {
  gameOverScoreEl.textContent = `Score: ${state.score}`;
  gameOverDetailEl.textContent = detail;
  gameOverCard.classList.remove("hidden");
}

function hideGameOver() {
  gameOverCard.classList.add("hidden");
}

function showSelection(country) {
  state.selectedCountry = country;
  selectionCard.classList.remove("hidden");
  resetCountryClasses();
}

function hideSelection() {
  state.selectedCountry = null;
  selectionCard.classList.add("hidden");
}

function parseViewBox(viewBox) {
  const [x, y, width, height] = viewBox.split(/\s+/).map(Number);
  return { x, y, width, height };
}

function applyViewBox() {
  svg.setAttribute(
    "viewBox",
    `${currentViewBox.x} ${currentViewBox.y} ${currentViewBox.width} ${currentViewBox.height}`,
  );
}

function resetView() {
  if (!svg || !baseViewBox) {
    return;
  }

  currentViewBox = { ...baseViewBox };
  applyViewBox();
}

function getPinchDistance() {
  const pts = [...pointers.values()];
  const dx = pts[0].clientX - pts[1].clientX;
  const dy = pts[0].clientY - pts[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

function getPinchMidpoint() {
  const pts = [...pointers.values()];
  return {
    x: (pts[0].clientX + pts[1].clientX) / 2,
    y: (pts[0].clientY + pts[1].clientY) / 2,
  };
}

function handlePointerDown(event) {
  if (event.pointerType !== "mouse") {
    event.preventDefault();
  }

  svg.setPointerCapture?.(event.pointerId);
  pointers.set(event.pointerId, {
    target: event.target,
    pointerType: event.pointerType,
    startX: event.clientX,
    startY: event.clientY,
    clientX: event.clientX,
    clientY: event.clientY,
    moved: false,
  });

  if (pointers.size === 2) {
    lastPinchDistance = getPinchDistance();
  }
}

function handlePointerMove(event) {
  if (!pointers.has(event.pointerId)) {
    return;
  }

  const ptr = pointers.get(event.pointerId);
  const prevX = ptr.clientX;
  const prevY = ptr.clientY;

  ptr.clientX = event.clientX;
  ptr.clientY = event.clientY;

  if (
    Math.abs(event.clientX - ptr.startX) > PAN_THRESHOLD ||
    Math.abs(event.clientY - ptr.startY) > PAN_THRESHOLD
  ) {
    ptr.moved = true;
  }

  if (pointers.size === 2) {
    const newDistance = getPinchDistance();

    if (lastPinchDistance !== null && lastPinchDistance > 0 && newDistance > 0) {
      const scale = lastPinchDistance / newDistance;
      const mid = getPinchMidpoint();
      const rect = svg.getBoundingClientRect();
      const midX = (mid.x - rect.left) / rect.width;
      const midY = (mid.y - rect.top) / rect.height;
      const nextWidth = clamp(currentViewBox.width * scale, baseViewBox.width * 0.15, baseViewBox.width * 2.2);
      const nextHeight = clamp(currentViewBox.height * scale, baseViewBox.height * 0.15, baseViewBox.height * 2.2);

      currentViewBox.x += (currentViewBox.width - nextWidth) * midX;
      currentViewBox.y += (currentViewBox.height - nextHeight) * midY;
      currentViewBox.width = nextWidth;
      currentViewBox.height = nextHeight;
      applyViewBox();
    }

    lastPinchDistance = newDistance;
    svg.classList.add("is-panning");
  } else if (pointers.size === 1 && ptr.moved) {
    const rect = svg.getBoundingClientRect();
    const deltaX = ((event.clientX - prevX) / rect.width) * currentViewBox.width;
    const deltaY = ((event.clientY - prevY) / rect.height) * currentViewBox.height;

    currentViewBox.x -= deltaX;
    currentViewBox.y -= deltaY;
    applyViewBox();
    svg.classList.add("is-panning");
  }
}

function handlePointerUp(event) {
  if (!pointers.has(event.pointerId)) {
    return;
  }

  const ptr = pointers.get(event.pointerId);
  const wasSinglePointer = pointers.size === 1;

  pointers.delete(event.pointerId);

  if (pointers.size < 2) {
    lastPinchDistance = null;
  }

  if (pointers.size === 0) {
    svg.classList.remove("is-panning");

    if (wasSinglePointer) {
      if (ptr.moved) {
        ignoreClickUntil = Date.now() + 120;
      } else {
        const tappedPath = ptr.target?.closest?.("path.country");
        if (tappedPath && !state.locked && !state.gameOver) {
          if (ptr.pointerType === "mouse") {
            const country = state.allCountries.find((c) => c.name === tappedPath.dataset.name);
            if (country) handleGuess(country);
          } else {
            handleCountryTap(tappedPath.dataset.name);
          }
        }
      }
    }
  }
}

function handleWheel(event) {
  event.preventDefault();

  const rect = svg.getBoundingClientRect();
  const pointerX = (event.clientX - rect.left) / rect.width;
  const pointerY = (event.clientY - rect.top) / rect.height;
  const zoomFactor = event.deltaY > 0 ? 1.12 : 0.88;
  const nextWidth = clamp(currentViewBox.width * zoomFactor, baseViewBox.width * 0.15, baseViewBox.width * 2.2);
  const nextHeight = clamp(currentViewBox.height * zoomFactor, baseViewBox.height * 0.15, baseViewBox.height * 2.2);

  currentViewBox.x += (currentViewBox.width - nextWidth) * pointerX;
  currentViewBox.y += (currentViewBox.height - nextHeight) * pointerY;
  currentViewBox.width = nextWidth;
  currentViewBox.height = nextHeight;
  applyViewBox();
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function handleCountryTap(countryName) {
  const country = state.allCountries.find((entry) => entry.name === countryName);

  if (!country) {
    return;
  }

  const now = Date.now();
  const isDoubleTap =
    state.selectedCountry?.name === country.name &&
    lastTap.name === country.name &&
    now - lastTap.time < DOUBLE_TAP_MS;

  showSelection(country);
  statusEl.textContent = "Country selected. Tap again or use Lock In.";

  if (isDoubleTap) {
    confirmSelection();
  }

  lastTap = { name: country.name, time: now };
}

function bandShuffle(countries, bands = 4) {
  const sorted = [...countries].sort(
    (a, b) => (countryAreas.get(b.name) || 0) - (countryAreas.get(a.name) || 0),
  );
  const bandSize = Math.ceil(sorted.length / bands);
  const result = [];

  for (let i = 0; i < sorted.length; i += bandSize) {
    result.push(...shuffle(sorted.slice(i, i + bandSize)));
  }

  return result;
}

function shuffle(items) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}
