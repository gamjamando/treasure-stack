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
const CHALLENGE_START_STACK = 8;
const CHALLENGE_MIN_STACK = 5;
const CHALLENGE_FEVER_STACK_SIZE = 8;
const CHALLENGE_RECOVERY_ARM_STACK = 12;
const CHALLENGE_RECOVERY_CLEAR_STACK = 5;
const CHALLENGE_CLEAN_BONUS_STACK_LIMIT = 5;
const CHALLENGE_CLEAN_BONUS_COMBO_STEP = 10;
const CHALLENGE_CLEAN_BONUS_SCORE = 500;
const CHALLENGE_RECOVERY_BONUS_SCORE = 1200;
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
const ACHIEVEMENT_STORAGE_KEY = "ts_achievements";

const achievementDefinitions = {
    first_play: { title: "첫 플레이", description: "아무 모드나 처음 시작하기" },

    score_100k: { title: "손풀기 완료", description: "한 판에서 100,000점 달성" },
    score_300k: { title: "컨베이어 적응자", description: "한 판에서 300,000점 달성" },
    score_500k: { title: "황금 감각", description: "한 판에서 500,000점 달성" },
    score_1m: { title: "레일의 지배자", description: "한 판에서 1,000,000점 달성" },

    combo_10: { title: "흐름 탄다", description: "10콤보 달성" },
    combo_50: { title: "손이 멈추지 않는다", description: "50콤보 달성" },
    combo_100: { title: "리듬 머신", description: "100콤보 달성" },
    combo_200: { title: "과몰입 시작", description: "200콤보 달성" },
    combo_300: { title: "컨베이어와 하나가 됨", description: "300콤보 달성" },

    full_combo_1: { title: "완벽주의자", description: "FULL COMBO 최초 달성" },
    full_combo_3: { title: "실수 없는 손놀림", description: "FULL COMBO 3회 달성" },
    full_combo_5: { title: "이미 몸이 기억한다", description: "FULL COMBO 5회 달성" },
    full_combo_10: { title: "GAME MASTER", description: "FULL COMBO 10회 달성" },
    full_combo_30: { title: "틀리지 않는 손가락", description: "FULL COMBO 30회 달성" },

    first_fever: { title: "과열 상태", description: "피버 타임을 처음 발동" },
    fever_3: { title: "GOLD RUSH", description: "피버 3회 달성" },
    fever_100: { title: "피버광", description: "피버 100회 달성" },
    fever_combo_100: { title: "멈출 수 없어", description: "피버 상태에서 100콤보 유지" },

    challenge_1min: { title: "살아남았다", description: "챌린지 모드에서 1분 생존" },
    challenge_3min: { title: "아직 안 끝났다", description: "챌린지 모드에서 3분 생존" },
    challenge_5min: { title: "인간 컨베이어", description: "챌린지 모드에서 5분 생존" },
    clean_stack: { title: "정리의 신", description: "스택을 완전히 비우기" },
    overload_escape: { title: "OVERLOAD 탈출", description: "위험 상태에서 회복 성공" },

    bomb_5: { title: "제 성격이 너무 급합니다", description: "폭탄 5회 획득" },
    bomb_chain_3: { title: "그래서 자꾸 폭탄을 챙겨요", description: "폭탄 연속 3회 획득" },
    bomb_20: { title: "폭탄 수집가", description: "폭탄 20회 획득" },
    bomb_only_3: { title: "이걸 왜 먹음?", description: "폭탄만 3개 연속 획득" },

    miss_5: { title: "손이 미끄러졌어요", description: "연속 오답 5회" },
    greedy_fail: { title: "욕심쟁이", description: "폭탄 직전 코인을 챙기다 실패" },
    lucky_diamond: { title: "운도 실력이다", description: "다이아만 연속 획득" },
    same_input: { title: "아니 왜 거길 눌러", description: "같은 방향만 연속 입력" },

    play_10: { title: "컨베이어 입문자", description: "10판 플레이" },
    play_50: { title: "출근 완료", description: "50판 플레이" },
    play_100: { title: "퇴근 안 함", description: "100판 플레이" },
    play_300: { title: "컨베이어 중독", description: "300판 플레이" },

    coal_only_10: { title: "광부 지망생", description: "석탄만 10회 획득" },
    coal_only_30: { title: "탄광의 지배자", description: "석탄만 30회 획득" },
    diamond_only_10: { title: "괴도 지망생", description: "보석만 10회 획득" },
    diamond_only_30: { title: "보석 사냥꾼", description: "보석만 30회 획득" },
    coin_only_10: { title: "현금만물주의자", description: "코인만 10회 획득" },
    coin_only_30: { title: "돈의 노예", description: "코인만 30회 획득" },
    hourglass_only_10: { title: "시간을 지배하는 자", description: "모래시계만 10회 획득" },
    hourglass_only_30: { title: "시간 여행자", description: "모래시계만 30회 획득" },
    bomb_collect_10: { title: "예비 폭탄광", description: "폭탄 '챙기기' 10회" },
    bomb_collect_30: { title: "폭탄 애호가", description: "폭탄 '챙기기' 30회" },

    trash_master: { title: "쓰레기 수집가", description: "석탄만 연속 획득" },
    greed_mode: { title: "욕심 ON", description: "아이템을 쉬지 않고 획득" },
    panic_clicker: { title: "패닉 상태", description: "1초 내 연속 입력" },
    coin_addict: { title: "동전 중독", description: "코인 총 100개 획득" }
};

let achievementData = loadAchievementData();

let state = {
    currentGameMode: "CLASSIC",
    currentTimer: START_TIMER,
    score: 0,
    combo: 0,
    comboBreakCount: 0,
    maxCombo: 0,
    survivedTime: 0,
    isFever: false,
    feverTimer: 0,
    feverGauge: 0,
    maxFeverGauge: FEVER_GAUGE_BASE,
    stack: [],
    isGameOver: false,
    hasStartedInput: false,
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
let overloadEscapeArmed = false;

let bestScoreClassic = parseInt(localStorage.getItem("ts_classic_best")) || 0;
let bestScoreChallenge = parseInt(localStorage.getItem("ts_challenge_best")) || 0;
let arcadeRankings = [];
let rankingLoadFailed = false;
let achievementToastTimer = null;


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

function loadAchievementData() {
    try {
        const saved = JSON.parse(localStorage.getItem(ACHIEVEMENT_STORAGE_KEY) || "{}");
        return { unlocked: saved.unlocked || {} };
    } catch (e) {
        return { unlocked: {} };
    }
}

function saveAchievementData() {
    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(achievementData));
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
    challengeStatus: document.getElementById("challenge-status"),
    readyPrompt: document.getElementById("ready-prompt"),
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
    resFullCombo: document.getElementById("res-full-combo"),
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
    achievementButton: document.getElementById("achievement-button"),
    achievementPanel: document.getElementById("achievement-panel"),
    achievementClose: document.getElementById("achievement-close"),
    achievementList: document.getElementById("achievement-list"),
    achievementToast: document.getElementById("achievement-toast"),
    achievementToastTitle: document.getElementById("achievement-toast-title"),
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
    setFeverBackground(false);
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

function setFeverBackground(isFever) {
    els.gameScreen.classList.toggle("bg-fever", isFever);
    els.gameScreen.classList.toggle("bg-white", !isFever);
}

function updateAchievementButton() {
    if (!els.achievementButton) return;
    const total = Object.keys(achievementDefinitions).length;
    const unlocked = Object.values(achievementData.unlocked).filter(Boolean).length;
    els.achievementButton.textContent = `👑 ${unlocked} / ${total}`;
}

function renderAchievementList() {
    if (!els.achievementList) return;

    els.achievementList.innerHTML = "";

    Object.entries(achievementDefinitions).forEach(([id, achievement]) => {
        const unlocked = !!achievementData.unlocked[id];
        const row = document.createElement("div");
        row.className = `achievement-row ${unlocked ? "achievement-row-unlocked" : "achievement-row-locked"}`;

        const crown = document.createElement("div");
        crown.className = "achievement-crown";
        crown.textContent = "👑";

        const copy = document.createElement("div");
        copy.className = "achievement-copy";

        const title = document.createElement("strong");
        title.textContent = achievement.title;

        const description = document.createElement("span");
        description.textContent = achievement.description;

        const state = document.createElement("div");
        state.className = "achievement-state";
        state.textContent = unlocked ? "달성" : "미달성";

        copy.appendChild(title);
        copy.appendChild(description);
        row.appendChild(crown);
        row.appendChild(copy);
        row.appendChild(state);
        els.achievementList.appendChild(row);
    });
}

function openAchievementPanel() {
    if (!els.achievementPanel) return;

    renderAchievementList();
    els.achievementPanel.classList.remove("hidden");
}

function closeAchievementPanel() {
    if (!els.achievementPanel) return;

    els.achievementPanel.classList.add("hidden");
}

function showAchievementToast(title) {
    if (!els.achievementToast || !els.achievementToastTitle) return;

    els.achievementToastTitle.textContent = title;
    els.achievementToast.classList.remove("hidden");
    els.achievementToast.classList.remove("achievement-toast-show");
    void els.achievementToast.offsetWidth;
    els.achievementToast.classList.add("achievement-toast-show");

    if (achievementToastTimer) clearTimeout(achievementToastTimer);
    achievementToastTimer = setTimeout(() => {
        els.achievementToast.classList.add("hidden");
        els.achievementToast.classList.remove("achievement-toast-show");
        achievementToastTimer = null;
    }, 2000);
}

function unlockAchievement(id) {
    if (!achievementDefinitions[id] || achievementData.unlocked[id]) return false;

    achievementData.unlocked[id] = true;
    saveAchievementData();
    updateAchievementButton();
    renderAchievementList();
    showAchievementToast(achievementDefinitions[id].title);
    return true;
}

function checkAchievements() {
    if (state.score >= 100000) unlockAchievement("score_100k");
    if (state.score >= 300000) unlockAchievement("score_300k");
    if (state.maxCombo >= 100 || state.combo >= 100) unlockAchievement("combo_100");
    if (state.comboBreakCount === 0 && state.maxCombo > 0 && state.isGameOver) unlockAchievement("first_full_combo");
    if (state.currentGameMode === "CHALLENGE" && state.survivedTime >= 60) unlockAchievement("challenge_1min");
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

function updateReadyPrompt() {
    if (!els.readyPrompt) return;
    els.readyPrompt.classList.toggle("hidden", state.hasStartedInput || state.isGameOver);
}

function updateChallengeStatus(count = state.stack.length) {
    if (!els.challengeStatus) return;

    if (state.currentGameMode !== "CHALLENGE" || state.isGameOver) {
        els.challengeStatus.classList.add("hidden");
        return;
    }

    let label = "CALM";
    if (count >= 18) label = "OVERLOAD";
    else if (count >= 14) label = "DANGER";
    else if (count >= 8) label = "BUSY";

    els.challengeStatus.textContent = label;
    els.challengeStatus.className = `challenge-status challenge-status-${label.toLowerCase()}`;
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

function maybeAwardCleanBonus(activeNode) {
    if (state.currentGameMode !== "CHALLENGE" || state.isFever) return;
    if (state.combo === 0 || state.combo % CHALLENGE_CLEAN_BONUS_COMBO_STEP !== 0) return;

    const resolvedStackCount = Math.max(0, state.stack.length - 1);
    if (resolvedStackCount > CHALLENGE_CLEAN_BONUS_STACK_LIMIT) return;

    state.score += CHALLENGE_CLEAN_BONUS_SCORE;
    showFloatingText(activeNode, `CLEAN BONUS +${CHALLENGE_CLEAN_BONUS_SCORE}`, "pop-clean");
    restartAnimation(els.score, "fever-ui-pulse");
}

function showArcadeReward(title, subtitle) {
    const reward = document.createElement("div");
    reward.className = "arcade-reward-pop";
    reward.innerHTML = `<span>${title}</span><small>${subtitle}</small>`;
    els.floatLayer.appendChild(reward);
    restartAnimation(els.score, "fever-ui-pulse");
    restartAnimation(els.rail, "recovery-glow");
    setTimeout(() => reward.remove(), 800);
}

function maybeAwardOverloadEscape(stackCount) {
    if (state.currentGameMode !== "CHALLENGE") return;

    if (stackCount >= CHALLENGE_RECOVERY_ARM_STACK) {
        overloadEscapeArmed = true;
        return;
    }

    if (!overloadEscapeArmed || stackCount > CHALLENGE_RECOVERY_CLEAR_STACK) return;

    overloadEscapeArmed = false;
    state.score += CHALLENGE_RECOVERY_BONUS_SCORE;
    showArcadeReward("RECOVERY!", `CLEAN +${CHALLENGE_RECOVERY_BONUS_SCORE}`);
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
    unlockAchievement("first_play");
    state.currentGameMode = mode;
    state.currentTimer = START_TIMER;
    state.score = 0;
    state.combo = 0;
    state.comboBreakCount = 0;
    state.maxCombo = 0;
    state.survivedTime = 0;
    state.isFever = false;
    state.feverTimer = 0;
    state.feverGauge = 0;
    state.maxFeverGauge = FEVER_GAUGE_BASE;
    state.stack = [];
    state.isGameOver = false;
    state.hasStartedInput = false;
    state.lives = 3;
    clearBreakingHeart();
    updateComboText();
    overloadWarningStage = "NONE";
    overloadEscapeArmed = false;

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
    updateReadyPrompt();
    updateChallengeStatus(0);

    setFeverBackground(false);
    clearFeverEffects();

    const oldBox = document.getElementById("arcade-input-zone");
    if (oldBox) oldBox.remove();

    const oldBoard = document.getElementById("arcade-board");
    if (oldBoard) oldBoard.remove();

    fillStackToSize(CHALLENGE_START_STACK);

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

function fillStackToSize(targetSize) {
    while (state.stack.length < targetSize) pushNewItem();
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
    updateChallengeStatus(count);
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
        maybeAwardOverloadEscape(count);
    } else {
        overloadWarningStage = "NONE";
        overloadEscapeArmed = false;
    }

    updateFeverGauge();
}

function gameLoop(timestamp) {
    if (state.isGameOver) return;

    let dt = (timestamp - lastUpdateTime) / 1000;
    if (dt > 0.2) dt = 0.2;
    lastUpdateTime = timestamp;

    if (!state.hasStartedInput) {
        loopFrameId = requestAnimationFrame(gameLoop);
        return;
    }

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
        checkAchievements();
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
            setFeverBackground(false);
            clearFeverEffects();
            return;
        } else if (state.feverTimer <= 1.2) {
            targetFlashClass = "flash-warning-fast";
            shouldPulse = true;
            setFeverBackground(true);
        } else if (state.feverTimer <= 3.0) {
            targetFlashClass = "flash-warning-slow";
            shouldPulse = true;
            setFeverBackground(true);
        } else {
            setFeverBackground(true);
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

    if (!state.hasStartedInput) {
        state.hasStartedInput = true;
        lastUpdateTime = performance.now();
        updateReadyPrompt();
    }

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
                setFeverBackground(true);
                state.stack = [];
                fillStackToSize(state.currentGameMode === "CHALLENGE" ? CHALLENGE_FEVER_STACK_SIZE : FEVER_STACK_SIZE);
                unlockAchievement("first_fever");
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
        if (state.currentGameMode === "CLASSIC" || wasFeverInput) {
            pushNewItem();
        } else if (state.currentGameMode === "CHALLENGE") {
            fillStackToSize(CHALLENGE_MIN_STACK);
        } else if (state.stack.length === 0) {
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
    maybeAwardCleanBonus(activeNode);
    checkAchievements();
    updateComboText();
}

function handleWrongInput(itemType, activeNode) {
    playTone("bomb");
    state.comboBreakCount++;
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
        triggerScreenShake(itemType === "BOMB" ? 2.2 : 1.45, itemType === "BOMB" ? 150 : 125);
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
    updateReadyPrompt();
    updateChallengeStatus();

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
    if (els.resFullCombo) {
        els.resFullCombo.classList.toggle("hidden", state.comboBreakCount !== 0);
    }
    checkAchievements();

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
    updateReadyPrompt();
    updateChallengeStatus();

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
updateAchievementButton();
els.achievementButton.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    openAchievementPanel();
});
els.achievementClose.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    closeAchievementPanel();
});
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
