// ==========================================
// Treasure Stack - core game engine
// ==========================================

const START_TIMER = 30;
const TIME_BONUS = 3;
const FEVER_DURATION = 5;
const FEVER_STACK_SIZE = 6;
const FEVER_GAUGE_BASE = 120;
const WRONG_SCORE_PENALTY = 200;
const CHALLENGE_GRACE_SECONDS = 10;
const CHALLENGE_START_DROP_INTERVAL = 4.0;
const CHALLENGE_MIN_DROP_INTERVAL = 0.9;
const CHALLENGE_SPEEDUP_RATE = 0.97;
const OVERLOAD_WARN_LOW = 14;
const OVERLOAD_WARN_HIGH = 18;
const OVERLOAD_LIMIT = 22;
const INPUT_RESOLVE_DELAY = 100;
const FEVER_INPUT_RESOLVE_DELAY = 35;

const RANKING_API_URL = "/api/rankings";
const RANKING_TIMEOUT_MS = 5000;
const HEART_FULL_SRC = "Assets/UI/heart_full.png";
const HEART_BREAK_SRC = "Assets/UI/heart_break.png";
const HEART_EMPTY_SRC = "Assets/UI/heart_empty.png";
const HEART_BREAK_DURATION_MS = 300;
const DEFAULT_BELT_BUMP = 13;

let state = {
    currentGameMode: "CLASSIC",
    currentTimer: START_TIMER,
    score: 0,
    combo: 0,
    maxCombo: 0,
    survivedTime: 0,
    isFever: false,
    feverTimer: 0,
    feverGauge: 0,
    maxFeverGauge: FEVER_GAUGE_BASE,
    stack: [],
    isGameOver: false,
    lives: 3
};

let lastUpdateTime = 0;
let loopFrameId = null;
let itemDropTimer = 0;
let currentDropInterval = CHALLENGE_START_DROP_INTERVAL;
let isResolvingInput = false;
let breakingHeartIndex = null;
let breakingHeartTimer = null;
let screenShakeTimer = null;
let overloadWarningStage = "NONE";

let bestScoreClassic = parseInt(localStorage.getItem("ts_classic_best")) || 0;
let bestScoreChallenge = parseInt(localStorage.getItem("ts_challenge_best")) || 0;
let arcadeRankings = [];
let rankingLoadFailed = false;


/* =========================
   벨트 움직임
========================= */

let beltOffset = 0;

function bumpBelt(amount = DEFAULT_BELT_BUMP) {
    beltOffset += amount;

    document.documentElement.style.setProperty(
        "--belt-y",
        `${beltOffset}px`
    );
}

const els = {
    startScreen: document.getElementById("start-screen"),
    gameScreen: document.getElementById("game-screen"),
    rankingScreen: document.getElementById("ranking-screen"),
    resultScreen: document.getElementById("result-screen"),
    time: document.getElementById("hud-time"),
    hearts: document.getElementById("hud-hearts"),
    score: document.getElementById("hud-score"),
    combo: document.getElementById("hud-combo"),
    best: document.getElementById("hud-best"),
    warning: document.getElementById("overload-warning"),
    stack: document.getElementById("item-stack"),
    rail: document.getElementById("track"),
    floatLayer: document.getElementById("float-layer"),
    resTitle: document.getElementById("result-title"),
    resScore: document.getElementById("res-score"),
    resBest: document.getElementById("res-best"),
    resTime: document.getElementById("res-time"),
    resCombo: document.getElementById("res-combo"),
    resGrade: document.getElementById("res-grade"),
    feverBar: document.getElementById("fever-bar"),
    flash: document.getElementById("fever-flash"),
    btnLeft: document.getElementById("btn-left"),
    btnRight: document.getElementById("btn-right"),
    btnRankView: document.getElementById("btn-rank-view"),
    btnRankBack: document.getElementById("btn-rank-back"),
    rankingPageList: document.getElementById("ranking-page-list"),
    rankAnchor: document.getElementById("ranking-box-anchor"),
    btnAgain: document.getElementById("btn-again"),
    btnResultHome: document.getElementById("btn-result-home"),
    btnGameMenu: document.getElementById("btn-game-menu"),
gameMenuModal: document.getElementById("game-menu-modal"),
btnRetry: document.getElementById("btn-retry"),
btnHome: document.getElementById("btn-home"),
btnResume: document.getElementById("btn-resume"),
    titleMode: document.getElementById("hud-title-mode"),
    resModeLabel: document.getElementById("res-mode-label"),
    btnClassic: document.getElementById("btn-start-classic"),
    btnChallenge: document.getElementById("btn-start-challenge")
};

let audioCtx = null;

function playTone(type, combo = 0) {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const now = audioCtx.currentTime;

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === "coin") {
            const baseFreq = Math.min(2200, 750 + combo * 35);
            osc.type = "sine";
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.setValueAtTime(baseFreq * 1.3, now + 0.06);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === "waste") {
            osc.type = "triangle";
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.1);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === "time") {
            osc.type = "square";
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(900, now + 0.05);
            osc.frequency.setValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === "bomb") {
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(30, now + 0.4);
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        } else if (type === "fever") {
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(1500, now + 0.3);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    } catch (e) {}
}

async function loadOnlineRankings() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), RANKING_TIMEOUT_MS);

    try {
        const res = await fetch(RANKING_API_URL, {
            method: "GET",
            signal: controller.signal
        });

        if (!res.ok) throw new Error(`Ranking read failed: ${res.status}`);

        const data = await res.json();
        arcadeRankings = Array.isArray(data.rankings) ? data.rankings : [];
        rankingLoadFailed = false;
    } catch (e) {
        rankingLoadFailed = true;
        try {
            arcadeRankings = JSON.parse(localStorage.getItem("ts_rankings_fallback") || "[]");
        } catch (e) {
            arcadeRankings = [];
        }
        if (arcadeRankings.length === 0) arcadeRankings = [{ name: "AAA", score: 3000 }];
    } finally {
        clearTimeout(timeoutId);
    }
}

async function saveOnlineRankings(newName, newScore) {
    const entry = {
        name: newName,
        score: newScore,
        mode: state.currentGameMode,
        updatedAt: new Date().toISOString()
    };

    await loadOnlineRankings();
    arcadeRankings = mergeRankingEntry(arcadeRankings, entry);
    localStorage.setItem("ts_rankings_fallback", JSON.stringify(arcadeRankings));

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), RANKING_TIMEOUT_MS);
        const res = await fetch(RANKING_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(entry),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`Ranking save failed: ${res.status}`);

        rankingLoadFailed = false;
        const data = await res.json();
        if (Array.isArray(data.rankings)) {
            arcadeRankings = data.rankings;
            localStorage.setItem("ts_rankings_fallback", JSON.stringify(arcadeRankings));
        }
        return res.ok;
    } catch (e) {
        rankingLoadFailed = true;
        return false;
    }
}

function mergeRankingEntry(rankings, entry) {
    const byName = new Map();

    rankings.concat(entry).forEach((row) => {
        const name = sanitizeRankName(row.name);
        const normalized = {
            name,
            score: Math.max(0, Math.floor(Number(row.score) || 0)),
            mode: row.mode === "CHALLENGE" ? "CHALLENGE" : "CLASSIC",
            updatedAt: row.updatedAt || new Date(0).toISOString()
        };
        const previous = byName.get(name);

        if (!previous || normalized.score > previous.score || (normalized.score === previous.score && normalized.updatedAt > previous.updatedAt)) {
            byName.set(name, normalized);
        }
    });

    return Array.from(byName.values())
        .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
        .slice(0, 10);
}

function sanitizeRankName(value) {
    const cleaned = Array.from(String(value || "AAA").trim().toUpperCase())
        .filter((char) => /[A-Z0-9]/.test(char) || /\p{Script=Hangul}/u.test(char))
        .join("")
        .slice(0, 3);

    return cleaned || "AAA";
}

function clearFeverEffects() {
    els.flash.className = "";
    els.score.classList.remove("fever-ui-pulse");
    els.combo.classList.remove("fever-ui-pulse");
    els.btnLeft.classList.remove("btn-fever-warning");
    els.btnRight.classList.remove("btn-fever-warning");
    els.gameScreen.classList.remove("screen-shake");
    els.rail.classList.remove("fever-hit");
}

function clearBreakingHeart() {
    if (breakingHeartTimer) {
        clearTimeout(breakingHeartTimer);
        breakingHeartTimer = null;
    }
    breakingHeartIndex = null;
}

function renderLives() {
    if (!els.hearts) return;

    els.hearts.innerHTML = "";

    for (let i = 0; i < 3; i++) {
        const heart = document.createElement("img");
        const isBreaking = i === breakingHeartIndex;
        const isFull = i < state.lives;

        heart.src = isBreaking ? HEART_BREAK_SRC : (isFull ? HEART_FULL_SRC : HEART_EMPTY_SRC);
        heart.alt = isFull ? "남은 라이프" : "잃은 라이프";
        heart.draggable = false;
        els.hearts.appendChild(heart);
    }
}

function showBreakingHeart(index) {
    clearBreakingHeart();
    breakingHeartIndex = Math.max(0, Math.min(2, index));
    renderLives();

    breakingHeartTimer = setTimeout(() => {
        breakingHeartIndex = null;
        breakingHeartTimer = null;
        renderLives();
    }, HEART_BREAK_DURATION_MS);
}

function restartAnimation(node, className) {
    if (!node) return;
    node.classList.remove(className);
    void node.offsetWidth;
    node.classList.add(className);
}

function triggerScreenShake(intensity = 1, duration = 110) {
    const clampedIntensity = Math.max(0.5, Math.min(2.5, intensity));
    const clampedDuration = Math.max(80, Math.min(150, duration));

    if (screenShakeTimer) clearTimeout(screenShakeTimer);
    els.gameScreen.style.setProperty("--shake-distance", `${clampedIntensity}px`);
    els.gameScreen.style.setProperty("--shake-duration", `${clampedDuration}ms`);
    restartAnimation(els.gameScreen, "screen-shake");

    screenShakeTimer = setTimeout(() => {
        els.gameScreen.classList.remove("screen-shake");
        screenShakeTimer = null;
    }, clampedDuration);
}

function playInputFeedback(direction, isCorrect, itemType) {
    const targetButton = direction === "L" ? els.btnLeft : els.btnRight;
    restartAnimation(targetButton, "button-impact");

    if (isCorrect) {
        bumpBelt(itemType === "BOMB" ? 22 : 10);
    } else {
        bumpBelt(24);
        if (itemType === "BOMB") restartAnimation(els.rail, "mistake-impact");
    }
}

function getComboLabel(combo) {
    if (combo >= 50) return "GODLIKE";
    if (combo >= 30) return "OVERDRIVE";
    if (combo >= 20) return "CRAZY";
    if (combo >= 10) return "HOT";
    return "";
}

function updateComboText() {
    const label = getComboLabel(state.combo);
    els.combo.innerText = label ? `${state.combo} COMBO - ${label}` : `콤보: ${state.combo}`;
    els.combo.classList.toggle("combo-hot", state.combo >= 10 && state.combo < 20);
    els.combo.classList.toggle("combo-crazy", state.combo >= 20);
}

function getResultGrade(score, maxCombo) {
    if (score >= 30000 || maxCombo >= 80) return "SS";
    if (score >= 20000 || maxCombo >= 50) return "S";
    if (score >= 12000 || maxCombo >= 30) return "A";
    if (score >= 7000 || maxCombo >= 20) return "B";
    if (score >= 3000 || maxCombo >= 10) return "C";
    return "F";
}

function showImpactBurst(activeNode, itemType, isCorrect) {
    if (!activeNode) return;

    const railRect = els.rail.getBoundingClientRect();
    const itemRect = activeNode.getBoundingClientRect();
    const burst = document.createElement("div");
    const effectType = isCorrect ? itemType.toLowerCase() : "fail";

    burst.style.left = `${itemRect.left + itemRect.width / 2 - railRect.left}px`;
    burst.style.top = `${itemRect.top + itemRect.height / 2 - railRect.top}px`;
    burst.className = `impact-burst impact-${effectType}`;

    els.floatLayer.appendChild(burst);
    setTimeout(() => burst.remove(), 420);
}

function triggerFeverIntro() {
    const feverPop = document.createElement("div");
    feverPop.className = "fever-pop";
    feverPop.textContent = "FEVER!!";
    els.floatLayer.appendChild(feverPop);
    restartAnimation(els.rail, "fever-hit");
    triggerScreenShake(1.4, 120);
    setTimeout(() => feverPop.remove(), 700);
}

function startGame(mode) {
    state.currentGameMode = mode;
    state.currentTimer = START_TIMER;
    state.score = 0;
    state.combo = 0;
    state.maxCombo = 0;
    state.survivedTime = 0;
    state.isFever = false;
    state.feverTimer = 0;
    state.feverGauge = 0;
    state.maxFeverGauge = FEVER_GAUGE_BASE;
    state.stack = [];
    state.isGameOver = false;
    state.lives = 3;
    clearBreakingHeart();
    updateComboText();
    overloadWarningStage = "NONE";

    itemDropTimer = 0;
    currentDropInterval = CHALLENGE_START_DROP_INTERVAL;
    isResolvingInput = false;

    els.startScreen.classList.add("hidden");
    els.resultScreen.classList.add("hidden");
    els.gameScreen.classList.remove("hidden");

    const currentBest = mode === "CLASSIC" ? bestScoreClassic : bestScoreChallenge;
    els.best.innerText = currentBest.toLocaleString();

    if (mode === "CLASSIC") {
        els.titleMode.innerText = "TIME";
        els.time.classList.remove("hidden");
        els.hearts.classList.add("hidden");
        els.time.innerText = `남은 시간: ${state.currentTimer.toFixed(2)}초`;
    } else {
        els.titleMode.innerText = "LIVES";
        els.time.classList.add("hidden");
        els.hearts.classList.remove("hidden");
        renderLives();
    }

    els.gameScreen.className = "relative flex-1 w-full flex flex-col items-center pt-2 transition-transform bg-white shadow-inner overflow-hidden screen";
    clearFeverEffects();

    const oldBox = document.getElementById("arcade-input-zone");
    if (oldBox) oldBox.remove();

    const oldBoard = document.getElementById("arcade-board");
    if (oldBoard) oldBoard.remove();

    for (let i = 0; i < 8; i++) pushNewItem();

    renderStack();
    updateFeverGauge();

    lastUpdateTime = performance.now();
    if (loopFrameId) cancelAnimationFrame(loopFrameId);
    loopFrameId = requestAnimationFrame(gameLoop);
}

function pushNewItem() {
    let type = "COIN";

    const rand = Math.random();

    if (state.isFever) {
        type = rand < 0.82 ? "COIN" : "JEWEL";
    } else {
        if (rand < 0.46) type = "COIN";
        else if (rand < 0.58) type = "JEWEL";
        else if (rand < 0.8) type = "WASTE";
        else if (rand < 0.92) type = "BOMB";
        else type = "TIME";
    }

    state.stack.push(type);
}

function updateFeverGauge() {
    if (!els.feverBar) return;
    const pct = state.isFever
        ? (state.feverTimer / FEVER_DURATION) * 100
        : (state.feverGauge / state.maxFeverGauge) * 100;

    els.feverBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

function renderStack() {
    els.stack.innerHTML = "";

    state.stack.slice(0, 8).forEach((type, idx) => {
        const node = document.createElement("div");
        node.className = `stack-item pos-${idx} flex items-center justify-center origin-center`;
        node.id = idx === 0 ? "active-item" : "";

        const imgName =
            type === "COIN" ? "Assets/Items/coin.png" :
            type === "JEWEL" ? "Assets/Items/jewel.png" :
            type === "WASTE" ? "Assets/Items/coal.png" :
            type === "BOMB" ? "Assets/Items/dynamite.png" :
            "Assets/Items/hourglass.png";

        node.innerHTML = `<img src="${imgName}" class="w-10 h-10 object-contain block mx-auto">`;
        els.stack.appendChild(node);
    });

    const count = state.stack.length;
    els.gameScreen.classList.remove("shake-low", "shake-medium");
    els.warning.classList.add("hidden");

    if (state.currentGameMode === "CHALLENGE") {
        let nextOverloadStage = "NONE";

        if (count >= OVERLOAD_LIMIT) {
            endGame("OVERLOAD");
            return;
        }
        if (count >= OVERLOAD_WARN_HIGH) {
            els.warning.classList.remove("hidden");
            els.gameScreen.classList.add("shake-medium");
            nextOverloadStage = "HIGH";
        } else if (count >= OVERLOAD_WARN_LOW) {
            els.warning.classList.remove("hidden");
            els.gameScreen.classList.add("shake-low");
            nextOverloadStage = "LOW";
        }

        if (nextOverloadStage !== "NONE" && nextOverloadStage !== overloadWarningStage) {
            triggerScreenShake(nextOverloadStage === "HIGH" ? 1.5 : 1, 110);
        }
        overloadWarningStage = nextOverloadStage;
    } else {
        overloadWarningStage = "NONE";
    }

    updateFeverGauge();
}

function gameLoop(timestamp) {
    if (state.isGameOver) return;

    let dt = (timestamp - lastUpdateTime) / 1000;
    if (dt > 0.2) dt = 0.2;
    lastUpdateTime = timestamp;
    state.survivedTime += dt;

    if (state.currentGameMode === "CLASSIC") {
        state.currentTimer -= dt;
        els.time.innerText = `남은 시간: ${Math.max(0, state.currentTimer).toFixed(2)}초`;
        if (state.currentTimer <= 0) {
            endGame("TIMEUP");
            return;
        }
    } else {
        if (!state.isFever && state.survivedTime >= CHALLENGE_GRACE_SECONDS) {
            itemDropTimer += dt;
            const challengeElapsed = state.survivedTime - CHALLENGE_GRACE_SECONDS;
            currentDropInterval = Math.max(
                CHALLENGE_MIN_DROP_INTERVAL,
                CHALLENGE_START_DROP_INTERVAL * Math.pow(CHALLENGE_SPEEDUP_RATE, challengeElapsed)
            );

            if (itemDropTimer >= currentDropInterval) {
                itemDropTimer = 0;
                pushNewItem();
                renderStack();
            }
        }

        renderLives();
        if (state.lives <= 0) {
            endGame("DIED");
            return;
        }
    }

    updateFeverEffects(dt);

    els.score.innerText = `점수: ${state.score.toLocaleString()}`;
    updateComboText();

    loopFrameId = requestAnimationFrame(gameLoop);
}

function updateFeverEffects(dt) {
    if (state.isFever) {
        state.feverTimer -= dt;
        updateFeverGauge();

        let targetFlashClass = "";
        let shouldPulse = false;

        if (state.feverTimer <= 0) {
            state.isFever = false;
            state.feverGauge = 0;
            state.maxFeverGauge += 40;
            els.gameScreen.className = "relative flex-1 w-full flex flex-col items-center pt-2 transition-transform bg-white shadow-inner overflow-hidden screen";
            clearFeverEffects();
            return;
        } else if (state.feverTimer <= 1.2) {
            targetFlashClass = "flash-warning-fast";
            shouldPulse = true;
            els.gameScreen.className = "relative flex-1 w-full h-[100dvh] flex flex-col items-center pt-2 transition-transform bg-fever shadow-inner overflow-hidden screen";
        } else if (state.feverTimer <= 3.0) {
            targetFlashClass = "flash-warning-slow";
            shouldPulse = true;
            els.gameScreen.className = "relative flex-1 w-full h-[100dvh] flex flex-col items-center pt-2 transition-transform bg-fever shadow-inner overflow-hidden screen";
        } else {
            els.gameScreen.className = "relative flex-1 w-full h-[100dvh] flex flex-col items-center pt-2 transition-transform bg-fever shadow-inner overflow-hidden screen";
        }

        if (els.flash.className !== targetFlashClass) els.flash.className = targetFlashClass;

        els.score.classList.toggle("fever-ui-pulse", shouldPulse);
        els.combo.classList.toggle("fever-ui-pulse", shouldPulse);
        els.btnLeft.classList.toggle("btn-fever-warning", shouldPulse);
        els.btnRight.classList.toggle("btn-fever-warning", shouldPulse);
    } else {
        if (els.flash.className !== "") els.flash.className = "";
        els.score.classList.remove("fever-ui-pulse");
        els.combo.classList.remove("fever-ui-pulse");
        els.btnLeft.classList.remove("btn-fever-warning");
        els.btnRight.classList.remove("btn-fever-warning");
    }
}

function processInput(direction) {

    if (state.isGameOver || state.stack.length === 0) return;
    if (isResolvingInput) return;

    isResolvingInput = true;
    const wasFeverInput = state.isFever;

    const activeNode = document.getElementById("active-item");
    const itemType = state.stack[0];

    let isCorrect = false;
    if (state.isFever) {
        isCorrect = true;
    } else {
        if (direction === "L" && ["WASTE", "BOMB"].includes(itemType)) isCorrect = true;
        if (direction === "R" && ["COIN", "JEWEL", "TIME"].includes(itemType)) isCorrect = true;
    }

    let triggeredFever = false;
    playInputFeedback(direction, isCorrect, itemType);

    if (isCorrect) {
        handleCorrectInput(itemType, activeNode);
        showImpactBurst(activeNode, itemType, true);

        if (!state.isFever) {
            state.feverGauge = Math.min(state.maxFeverGauge, state.feverGauge + 5);

            if (state.feverGauge >= state.maxFeverGauge) {
                playTone("fever");
                state.isFever = true;
                state.feverTimer = FEVER_DURATION;
                state.feverGauge = 0;
                els.gameScreen.className = "relative flex-1 w-full h-[100dvh] flex flex-col items-center pt-2 transition-transform bg-fever shadow-inner overflow-hidden screen";
                state.stack = [];
                for (let i = 0; i < FEVER_STACK_SIZE; i++) pushNewItem();
                triggerFeverIntro();
                triggeredFever = true;
            }
        }
    } else {
        handleWrongInput(itemType, activeNode);
        showImpactBurst(activeNode, itemType, false);
    }

    if (activeNode) activeNode.classList.add(direction === "L" ? "fly-left" : "fly-right");

    setTimeout(() => {
        if (triggeredFever) {
            isResolvingInput = false;
            renderStack();
            return;
        }

        state.stack.shift();
        if (state.currentGameMode === "CLASSIC" || wasFeverInput || state.stack.length === 0) {
            pushNewItem();
        }
        isResolvingInput = false;
        renderStack();
    }, wasFeverInput ? FEVER_INPUT_RESOLVE_DELAY : INPUT_RESOLVE_DELAY);
}

function handleCorrectInput(itemType, activeNode) {
    if (state.isFever) playTone("coin", state.combo);
    else if (["COIN", "JEWEL"].includes(itemType)) playTone("coin", state.combo);
    else if (["WASTE", "BOMB"].includes(itemType)) playTone("waste");
    else playTone("time");

    let earned = itemType === "JEWEL" ? 250 + state.combo * 20 : 100 + state.combo * 10;
    if (state.isFever) earned = Math.floor(earned * 1.5);
    state.score += earned;

    showFloatingText(activeNode, `+${earned}${state.combo >= 20 ? " 🔥" : ""}`, state.combo >= 20 ? "pop-score-fire" : "pop-score");

    if (itemType === "TIME" && state.currentGameMode === "CLASSIC" && !state.isFever) {
        state.currentTimer = Math.min(60, state.currentTimer + TIME_BONUS);
    }

    state.combo++;
    if (state.combo > state.maxCombo) state.maxCombo = state.combo;
    updateComboText();
}

function handleWrongInput(itemType, activeNode) {
    playTone("bomb");
    state.combo = 0;
    if (!state.isFever) {
        state.feverGauge = Math.max(
            0,
            state.feverGauge - state.maxFeverGauge * 0.35
        );
    }

    if (state.currentGameMode === "CLASSIC") {
        state.score = Math.max(0, state.score - WRONG_SCORE_PENALTY);
        if (itemType === "BOMB") state.currentTimer = Math.max(0, state.currentTimer - 3);
    } else {
        state.lives--;
        showBreakingHeart(state.lives);
    }
    if (itemType === "BOMB" || state.currentGameMode === "CHALLENGE") {
        triggerScreenShake(itemType === "BOMB" ? 1.8 : 1.2, itemType === "BOMB" ? 140 : 110);
    }
    updateComboText();

    const text = state.currentGameMode === "CLASSIC"
        ? (itemType === "BOMB" ? "-3초! 💥" : "틀림!")
        : "LIFE -1 💔";

    showFloatingText(activeNode, text, "pop-fail");
}

function showFloatingText(activeNode, text, extraClass) {
    if (!activeNode) return;

    const railRect = els.rail.getBoundingClientRect();
    const itemRect = activeNode.getBoundingClientRect();
    const pop = document.createElement("div");

    pop.style.left = `${itemRect.left + itemRect.width / 2 - railRect.left}px`;
    pop.style.top = `${itemRect.top + itemRect.height / 2 - railRect.top}px`;
    pop.className = `floating-score ${extraClass}`;
    pop.textContent = text;

    els.floatLayer.appendChild(pop);
    setTimeout(() => pop.remove(), 450);
}

async function renderRankings(targetContainer, insertBeforeNode = null) {
    let board = document.getElementById("arcade-board");
    const isFullPage = targetContainer === els.rankingPageList;

    if (!board) {
        board = document.createElement("div");
        board.id = "arcade-board";
    }
    board.className = isFullPage
        ? "w-full min-h-full bg-slate-900 border-2 border-yellow-500 rounded-2xl p-4 font-mono text-sm text-yellow-400 text-left overflow-y-auto shadow-2xl"
        : "w-full mt-4 bg-slate-800 border-2 border-yellow-500 rounded-2xl p-3 font-mono text-xs text-yellow-400 text-left max-h-52 overflow-y-auto max-w-xs mx-auto shadow-inner";

    board.innerHTML = '<h3 class="text-center font-black text-sm text-yellow-300 mb-2">🌐 GLOBAL TOP 10 🌐</h3><p class="text-center text-gray-400 animate-pulse text-[10px]">클라우드 보드 연결 중...</p>';

    if (insertBeforeNode) targetContainer.insertBefore(board, insertBeforeNode);
    else targetContainer.appendChild(board);

    await loadOnlineRankings();

    let html = '<h3 class="text-center font-black text-sm text-yellow-300 mb-2">🌐 GLOBAL TOP 10 🌐</h3>';

    if (rankingLoadFailed) {
        html += '<p class="text-center text-gray-400 text-[10px] mb-2">내 기기의 기록을 표시 중입니다.</p>';
    }

    if (arcadeRankings.length === 0) {
        html += '<p class="text-center text-gray-300 py-2">아직 등록된 기록이 없습니다.</p>';
    }

    arcadeRankings.slice(0, 10).forEach((rank, i) => {
        const modeLabel = rank.mode === "CHALLENGE" ? "CHL" : "CLS";
        html += `<div class="flex justify-between border-b border-slate-700 py-1 ${i < 3 ? "text-yellow-300 font-bold" : "text-gray-300"}">
            <span>${(i + 1).toString().padStart(2, "0")}. ${rank.name} <span class="text-[9px] text-gray-500">${modeLabel}</span></span>
            <span>${Number(rank.score).toLocaleString()} P</span>
        </div>`;
    });

    board.innerHTML = html;
}

async function checkRankingRegistration() {
    await loadOnlineRankings();

    const lowestScore = arcadeRankings.length >= 10 ? arcadeRankings[9].score : 0;
    const oldZone = document.getElementById("arcade-input-zone");
    if (oldZone) oldZone.remove();

    if (state.score > lowestScore) {
        const inputZone = document.createElement("div");
        inputZone.id = "arcade-input-zone";
        inputZone.className = "w-full my-4 bg-yellow-400 text-slate-900 font-bold p-3 rounded-2xl text-center shadow-lg transition-all animate-bounce max-w-xs mx-auto";
        inputZone.innerHTML = `
            <p class="text-xs mb-1">🎉 명예의 전당 진입! 기록을 클라우드에 등록합니까?</p>
            <div class="flex justify-center gap-2">
                <input type="text" id="rank-name-input" maxlength="3" placeholder="AAA" class="w-20 text-center uppercase border-2 border-slate-900 rounded p-1 text-sm">
                <button id="rank-submit-btn" class="bg-slate-900 text-yellow-400 text-xs px-3 rounded shadow font-black">등록</button>
            </div>
        `;

        els.rankAnchor.parentNode.insertBefore(inputZone, els.rankAnchor);

        const submitBtn = document.getElementById("rank-submit-btn");
        submitBtn.addEventListener("click", async () => {
            let inputName = document.getElementById("rank-name-input").value.trim().toUpperCase();
            if (!inputName) inputName = "AAA";

            submitBtn.disabled = true;
            document.getElementById("arcade-input-zone").innerHTML = '<p class="text-xs py-2 animate-pulse">원격 서버에 동기화 중...</p>';

            const savedOnline = await saveOnlineRankings(inputName, state.score);

            document.getElementById("arcade-input-zone").remove();
            await renderRankings(els.rankAnchor);

            if (!savedOnline) {
                const board = document.getElementById("arcade-board");
                if (board) {
                    board.insertAdjacentHTML("beforeend", '<p class="text-center text-yellow-300 text-[10px] mt-2">기록 보관 완료!</p>');
                }
            }
        });
    }
}

function endGame(reason) {
    state.isPlaying = false;
    state.isGameOver = true;

    if (loopFrameId) cancelAnimationFrame(loopFrameId);

    els.gameScreen.classList.add("hidden");
    els.resultScreen.classList.remove("hidden");
    els.btnAgain.disabled = true;
els.btnAgain.style.pointerEvents = "none";

setTimeout(() => {
    els.btnAgain.disabled = false;
    els.btnAgain.style.pointerEvents = "auto";
}, 700);

    els.resModeLabel.innerText = state.currentGameMode;

    if (reason === "OVERLOAD") els.resTitle.innerText = "오버로드 폭발 💥";
    else if (reason === "DIED") els.resTitle.innerText = "라이프 소멸 💀";
    else els.resTitle.innerText = "시간 종료 ⏱️";

    if (state.currentGameMode === "CLASSIC") {
        if (state.score > bestScoreClassic) {
            bestScoreClassic = state.score;
            localStorage.setItem("ts_classic_best", bestScoreClassic);
        }
        els.resBest.innerText = bestScoreClassic.toLocaleString();
    } else {
        if (state.score > bestScoreChallenge) {
            bestScoreChallenge = state.score;
            localStorage.setItem("ts_challenge_best", bestScoreChallenge);
        }
        els.resBest.innerText = bestScoreChallenge.toLocaleString();
    }

    els.resScore.innerText = state.score.toLocaleString();
    els.resCombo.innerText = state.maxCombo;
    if (els.resGrade) {
        const grade = getResultGrade(state.score, state.maxCombo);
        els.resGrade.innerText = grade;
        els.resGrade.className = `result-grade result-grade-${grade.toLowerCase()}`;
    }

    const min = Math.floor(state.survivedTime / 60).toString().padStart(2, "0");
    const sec = Math.floor(state.survivedTime % 60).toString().padStart(2, "0");
    if (els.resTime) els.resTime.innerText = `${min}:${sec}`;

    clearFeverEffects();
    renderRankings(els.rankAnchor).then(() => checkRankingRegistration());
}

function backToMenu() {
    els.gameScreen.classList.add("hidden");
    els.resultScreen.classList.add("hidden");
    els.startScreen.classList.remove("hidden");
}
function quitToMenu() {
    state.isGameOver = true;

    if (loopFrameId) {
        cancelAnimationFrame(loopFrameId);
        loopFrameId = null;
    }

    isResolvingInput = false;
    itemDropTimer = 0;

    els.gameMenuModal.classList.add("hidden");
    els.gameScreen.classList.add("hidden");
    els.resultScreen.classList.add("hidden");
    els.rankingScreen.classList.add("hidden");
    els.startScreen.classList.remove("hidden");

    clearFeverEffects();

    if (els.stack) els.stack.innerHTML = "";
    if (els.floatLayer) els.floatLayer.innerHTML = "";
}

async function openRankingPage() {
    els.rankingScreen.classList.remove("hidden");
    await renderRankings(els.rankingPageList);
}

function closeRankingPage() {
    els.rankingScreen.classList.add("hidden");
}

els.btnClassic.addEventListener("pointerdown", () => startGame("CLASSIC"));
els.btnChallenge.addEventListener("pointerdown", () => startGame("CHALLENGE"));
els.btnAgain.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startGame(state.currentGameMode);
});
els.btnResultHome.addEventListener("pointerdown", backToMenu);
els.btnRankBack.addEventListener("pointerdown", closeRankingPage);
els.btnGameMenu.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (state.isGameOver) return;
    els.gameMenuModal.classList.remove("hidden");
});

els.btnResume.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    els.gameMenuModal.classList.add("hidden");
});

els.btnRetry.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    els.gameMenuModal.classList.add("hidden");
    startGame(state.currentGameMode);
});

els.btnHome.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    quitToMenu();
});

els.btnRankView.addEventListener("pointerdown", async (e) => {
    e.preventDefault();
    await openRankingPage();
});

els.btnLeft.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    processInput("L");
});

els.btnRight.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    processInput("R");
});

document.addEventListener("keydown", (e) => {
    if (state.isGameOver || els.gameScreen.classList.contains("hidden")) return;

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") processInput("L");
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") processInput("R");
});
const belt1 = document.querySelector(".belt1");
const belt2 = document.querySelector(".belt2");

let y1 = 0;
let y2 = -128;

const beltHeight = 128;
const speed = 1;

function animateBelt() {
  if (!belt1 || !belt2) return;

  y1 += speed;
  y2 += speed;

  if (y1 >= beltHeight) {
    y1 = y2 - beltHeight;
  }

  if (y2 >= beltHeight) {
    y2 = y1 - beltHeight;
  }

  belt1.style.top = y1 + "px";
  belt2.style.top = y2 + "px";

  requestAnimationFrame(animateBelt);
}

animateBelt();
