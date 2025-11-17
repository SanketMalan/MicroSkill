/* MicroSkill — Full working client-only app
   - 15 skill database
   - login / guest
   - daily stable skill (per date) + shuffle
   - tabs: overview / steps / tip / challenge
   - mark learned -> library (persisted)
   - logout (keeps library) + hard reset (clears all)
   - prefs (categories/difficulty)
   - theme toggle
   - timer 10-min
   - daily quote
*/

const STORAGE_KEY = "microskill_v1";

/* ---------- SKILLS (15) ---------- */
const SKILLS = [
  { id: "s1", title:"Basic HTML Tags", category:"Tech", difficulty:"Beginner", time:"5 min",
    overview:"Understand structure and basic tags to build simple pages.",
    steps:["Open editor","Create index.html","Add <!DOCTYPE html>, <html>, <body>","Add <h1> and <p>","Open in browser"],
    tip:"Indent and close tags to avoid errors.","challenge":"Create a page with heading, paragraph and a link."},

  { id: "s2", title:"CSS Colors & Layout", category:"Tech", difficulty:"Beginner", time:"10 min",
    overview:"Style your pages using colors and simple layout.",
    steps:["Create style.css","Change background and font","Style <h1> and <p>","Use display:flex to center","Experiment with margins"],
    tip:"Use browser devtools to preview changes.","challenge":"Style your page header."},

  { id: "s3", title:"JavaScript Console Intro", category:"Tech", difficulty:"Beginner", time:"10 min",
    overview:"Run and test JavaScript quickly in the browser console.",
    steps:["Open DevTools (F12)","Try console.log('Hello')","Create <script> in HTML","Use console.log with variables","Experiment"],
    tip:"Console helps debug errors early.","challenge":"Log 5 messages using variables."},

  { id: "s4", title:"Typing Practice", category:"Career", difficulty:"Beginner", time:"10 min",
    overview:"Short drills to improve WPM and accuracy.",
    steps:["Warm up with home row","Practice 5-minute timed runs","Focus on accuracy","Track WPM","Repeat daily"],
    tip:"Relax wrists and use all fingers.","challenge":"Increase WPM by 5 in a week."},

  { id: "s5", title:"Git Basics (init/add/commit)", category:"Tech", difficulty:"Beginner", time:"10 min",
    overview:"Start versioning your projects with git.",
    steps:["Open terminal","Run git init","git add .","git commit -m 'init'","git status/log"],
    tip:"Write clear commit messages.","challenge":"Make two commits."},

  { id: "s6", title:"Basic Linux Commands", category:"Career", difficulty:"Beginner", time:"10 min",
    overview:"Use cd, ls, mkdir, rm effectively.",
    steps:["Open terminal or WSL","Practice cd and ls","Create folder with mkdir","Create file with touch","View file with cat"],
    tip:"Use tab completion to speed up.","challenge":"Create and navigate a folder tree."},

  { id: "s7", title:"Problem Solving Warmup", category:"Career", difficulty:"Beginner", time:"10 min",
    overview:"Small problems to train logical thinking.",
    steps:["Pick an easy problem","Write examples","Plan steps","Try pseudo-code","Implement"],
    tip:"Write examples for edge cases.","challenge":"Solve an easy problem online."},

  { id: "s8", title:"Arrays Concept", category:"Tech", difficulty:"Intermediate", time:"10 min",
    overview:"Understand arrays, indices and basics.",
    steps:["Learn indexing","Access elements","Add/remove elements","Loop through array","Use methods push/pop"],
    tip:"Watch for off-by-one errors.","challenge":"Reverse an array."},

  { id: "s9", title:"SQL Basics (SELECT)", category:"Tech", difficulty:"Beginner", time:"10 min",
    overview:"Read data from tables using SELECT.",
    steps:["Open SQL playground","Create sample table","Use SELECT columns FROM table","Try WHERE conditions","Use LIMIT"],
    tip:"Start small datasets first.","challenge":"Write query selecting rows with age>25."},

  { id: "s10", title:"HTTP Basics", category:"Tech", difficulty:"Beginner", time:"10 min",
    overview:"How client & server exchange requests.",
    steps:["Understand client/server","Open network tab","Inspect GET request","Read response headers","Try fetch()"],
    tip:"Inspect network traffic to learn.","challenge":"Fetch JSON from a public API."},

  { id: "s11", title:"Push-Up Form", category:"Fitness", difficulty:"Beginner", time:"10 min",
    overview:"Improve chest/core strength with proper push-ups.",
    steps:["High plank position","Hands shoulder-width","Lower until ~90deg elbow","Push up","Keep straight body"],
    tip:"If hard, do knee push-ups.","challenge":"3 sets of 8 reps."},

  { id: "s12", title:"Mindful Breathing", category:"Life", difficulty:"Beginner", time:"5 min",
    overview:"Short breathing exercise to reduce stress.",
    steps:["Sit comfortably","Inhale 4s","Hold 2s","Exhale 6s","Repeat 5 min"],
    tip:"Bring attention back gently if mind wanders.","challenge":"Practice morning and evening."},

  { id: "s13", title:"Knife Safety", category:"Cooking", difficulty:"Beginner", time:"8 min",
    overview:"Grip & technique to chop safely.",
    steps:["Pinch grip on blade","Claw hold food with other hand","Use rocking motion","Keep knives sharp","Practice with soft veg"],
    tip:"Sharpen knives regularly.","challenge":"Chop an onion evenly."},

  { id: "s14", title:"Photo Composition (Rule of Thirds)", category:"Creative", difficulty:"Beginner", time:"10 min",
    overview:"Compose better photos using grids.",
    steps:["Enable grid in camera","Place subject on thirds","Avoid centered horizon","Use focal intersections","Take multiple shots"],
    tip:"Gridlines help initially.","challenge":"Take 5 improved photos."},

  { id: "s15", title:"Simple Smoothie", category:"Cooking", difficulty:"Beginner", time:"10 min",
    overview:"Quick healthy smoothie recipe.",
    steps:["Pick base (milk/yogurt)","Add fruit/greens","Add protein/nuts","Blend until smooth","Taste & adjust"],
    tip:"Frozen fruit thickens texture.","challenge":"Make two variations."}
];

/* ---------- QUOTES ---------- */
const QUOTES = [
  "Small consistent steps create big change.",
  "10 minutes today beats 0 minutes tomorrow.",
  "Learn a little, grow a lot.",
  "One new skill expands your choices.",
  "Consistency compounds—start now."
];

/* ---------- DEFAULT STATE ---------- */
const DEFAULT = {
  user: null,
  prefs: { categories: [], difficulty: "Any" },
  todayMap: {},   // dateString -> skillId
  library: [],    // { id, title, category, date }
  xp: 0,
  level: 1,
  streak: 0,
  lastLearned: null,
  theme: "dark",
  favorites: [],
  settings: { confetti: true, showQuote: true },
  quote: null
};

let state = { ...DEFAULT };

/* ---------- DOM ---------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const loginScreen = $("#loginScreen");
const appScreen = $("#appScreen");
const libraryScreen = $("#libraryScreen");

const nameInput = $("#nameInput");
const startBtn = $("#startBtn");
const guestBtn = $("#guestBtn");
const themeToggle = $("#themeToggle");
const logoutBtn = $("#logoutBtn");
const hardResetBtn = $("#hardResetBtn");

const userNameEl = $("#userName");
const userPrefsEl = $("#userPrefs");
const learnedCountEl = $("#learnedCount");
const streakCountEl = $("#streakCount");

const skillTitle = $("#skillTitle");
const skillCat = $("#skillCat");
const skillDiff = $("#skillDiff");
const skillTime = $("#skillTime");

const tabButtons = $$(".tab");
const tabContents = $$(".tab-content");

const shuffleBtn = $("#shuffleBtn");
const saveFavBtn = $("#saveFavBtn");
const startTimerBtn = $("#startTimerBtn");
const timerWrap = $("#timerWrap");
const timerText = $("#timerText");
const timerBar = $("#timerBar");
const markLearnedBtn = $("#markLearnedBtn");
const openLibraryBtn = $("#openLibraryBtn");

const prefCats = $$(".prefCat");
const prefDifficulty = $("#prefDifficulty");
const viewLibraryBtn = $("#viewLibraryBtn");
const clearLibraryBtn = $("#clearLibraryBtn");
const quickLibrary = $("#quickLibrary");

const libBackBtn = $("#libBackBtn");
const closeLibraryBtn = $("#closeLibraryBtn");
const exportBtn = $("#exportBtn");
const libraryList = $("#libraryList");
const quoteText = $("#quoteText");

const settingsModal = $("#settingsModal");
const closeSettingsBtn = $("#closeSettingsBtn");
const hardResetSettingsBtn = $("#hardResetSettingsBtn");
const confettiToggle = $("#confettiToggle");
const quoteToggle = $("#quoteToggle");

const toast = $("#toast");

/* ---------- Storage ---------- */
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch(e){ console.warn("save error", e); }
}
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { state = Object.assign({}, DEFAULT, JSON.parse(raw)); }
    catch(e){ state = { ...DEFAULT }; }
  } else state = { ...DEFAULT };
}

/* ---------- Utils ---------- */
function dateKey(d = new Date()){ return new Date(d).toDateString(); }
function showToast(msg, t=1400){ toast.textContent = msg; toast.classList.remove("hidden"); setTimeout(()=>toast.classList.add("hidden"), t); }
function escape(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c));}

/* Simple confetti (DOM) */
function confettiBurst(){
  if(!state.settings.confetti) return;
  for(let i=0;i<30;i++){
    const el = document.createElement("div");
    el.className = "confetti";
    el.style.left = (20 + Math.random()*60) + "%";
    el.style.background = ["#ffd166","#06d6a0","#118ab2","#ef476f"][Math.floor(Math.random()*4)];
    el.style.opacity = 0.95;
    document.body.appendChild(el);
    el.animate([{transform:"translateY(0) rotate(0deg)", opacity:1},{transform:`translateY(${200+Math.random()*200}px) rotate(${Math.random()*360}deg)`, opacity:0}], {duration:1200+Math.random()*800, easing:"cubic-bezier(.2,.7,.2,1)"});
    setTimeout(()=>el.remove(),1800);
  }
}

/* Pick skill honoring prefs */
function pickSkill(){
  let pool = SKILLS.slice();
  if(state.prefs.categories.length){
    const pref = pool.filter(s=>state.prefs.categories.includes(s.category));
    if(pref.length) pool = Math.random()<0.8 ? pref.concat(pool.filter(s=>!state.prefs.categories.includes(s.category))) : pool;
  }
  if(state.prefs.difficulty && state.prefs.difficulty!=="Any"){
    const f = pool.filter(s=>s.difficulty===state.prefs.difficulty);
    if(f.length) pool = f;
  }
  return pool[Math.floor(Math.random()*pool.length)];
}

/* Ensure today's skill stored */
function ensureToday(){
  const today = dateKey();
  if(!state.todayMap[today]){
    const pick = pickSkill();
    state.todayMap[today] = pick.id;
    save();
  }
}

/* Get today's skill object */
function getTodaySkill(){
  const id = state.todayMap[dateKey()];
  return SKILLS.find(s=>s.id===id) || pickSkill();
}

/* Render skill into UI */
function renderSkill(){
  const s = getTodaySkill();
  skillTitle.textContent = s.title;
  skillCat.textContent = s.category;
  skillDiff.textContent = s.difficulty;
  skillTime.textContent = s.time;

  // overview, steps, tip, challenge
  $("#tabOverview").innerHTML = `<p><strong>Why this skill?</strong><br>${escape(s.overview)}</p>`;
  $("#tabSteps").innerHTML = "<ol>" + s.steps.map(x=>`<li>${escape(x)}</li>`).join("") + "</ol>";
  $("#tabTip").innerHTML = `<p>${escape(s.tip)}</p>`;
  $("#tabChallenge").innerHTML = `<p>${escape(s.challenge)}</p>`;

  // save-fav text
  saveFavBtn.textContent = state.favorites.includes(s.id) ? "♥ Saved": "♡ Save";

  // reset to overview tab
  tabButtons.forEach(t=>t.classList.remove("active"));
  tabButtons[0].classList.add("active");
  tabContents.forEach(tc=>tc.classList.remove("active"));
  tabContents[0].classList.add("active");
}

/* Shuffle today's skill (persist) */
function shuffleToday(){
  const today = dateKey();
  const current = state.todayMap[today];
  let pool = SKILLS.slice();
  if(state.prefs.categories.length){
    const pref = pool.filter(s=>state.prefs.categories.includes(s.category));
    if(pref.length) pool = pref.concat(pool.filter(s=>!state.prefs.categories.includes(s.category)));
  }
  if(state.prefs.difficulty && state.prefs.difficulty!=="Any"){
    const f=pool.filter(s=>s.difficulty===state.prefs.difficulty); if(f.length) pool=f;
  }
  const alt = pool.filter(s=>s.id!==current);
  const pick = alt.length ? alt[Math.floor(Math.random()*alt.length)] : pool[Math.floor(Math.random()*pool.length)];
  state.todayMap[today] = pick.id;
  save();
  renderSkill();
  showToast("Shuffled today's skill.");
}

/* Mark learned (library) */
function markLearned(){
  const today = dateKey();
  const s = getTodaySkill();
  if(!s) return showToast("No skill selected.");
  // prevent duplicates same date
  if(state.library.find(it=>it.date===today && it.id===s.id)) return showToast("You already marked today's skill.");
  state.library.push({ id:s.id, title:s.title, category:s.category, date:today });
  state.xp += 10;
  const newLevel = Math.floor(state.xp/100)+1;
  if(newLevel>state.level){
    state.level=newLevel;
    confettiBurst();
    showToast(`Level up! Now Level ${state.level}`, 2000);
  } else showToast("+10 XP");
  // streak
  if(state.lastLearned){
    const last = new Date(state.lastLearned);
    const diff = (new Date(today) - last) / (1000*3600*24);
    if(diff===1) state.streak = (state.streak||0)+1;
    else if(diff>1) state.streak = 1;
  } else state.streak = 1;
  state.lastLearned = today;
  save();
  renderQuickLibrary();
  renderStats();
}

/* Toggle favorite */
function toggleFav(){
  const s=getTodaySkill();
  if(!s) return;
  if(!state.favorites) state.favorites=[];
  if(state.favorites.includes(s.id)){
    state.favorites = state.favorites.filter(x=>x!==s.id);
    saveFavBtn.textContent = "♡ Save";
    showToast("Removed from favorites");
  } else {
    state.favorites.push(s.id);
    saveFavBtn.textContent = "♥ Saved";
    showToast("Saved to favorites");
  }
  save();
}

/* Render quick library preview */
function renderQuickLibrary(){
  if(!state.library.length) quickLibrary.innerHTML = "<div class='muted'>No skills learned yet.</div>";
  else quickLibrary.innerHTML = state.library.slice(-4).reverse().map(it=>`<div class="mini">${escape(it.date)} • ${escape(it.title)}</div>`).join("");
}

/* Render stats */
function renderStats(){
  learnedCountEl.textContent = state.library.length || 0;
  streakCountEl.textContent = state.streak || 0;
}

/* Open library modal */
function openLibrary(){
  libraryScreen.classList.remove("hidden");
  appScreen.classList.add("hidden");
  renderLibraryFull();
}

/* Render full library */
function renderLibraryFull(){
  if(!state.library.length) { libraryList.innerHTML = "<div class='muted'>No skills yet. Mark today's skill to add.</div>"; return; }
  libraryList.innerHTML = state.library.slice().reverse().map(it=>{
    const s = SKILLS.find(x=>x.id===it.id) || {title:it.title};
    return `<div class="lib-item"><div><strong>${escape(s.title)}</strong><div class="muted">${escape(it.category)} • ${escape(it.date)}</div></div><div><button class="btn small" onclick="viewLibrarySkill('${it.id}')">View</button></div></div>`;
  }).join("");
}

/* View skill from library (preview) */
function viewLibrarySkill(id){
  const s = SKILLS.find(x=>x.id===id);
  if(!s) return showToast("Skill not found.");
  // render preview into lesson card (temporary)
  skillTitle.textContent = s.title;
  skillCat.textContent = s.category;
  skillDiff.textContent = s.difficulty;
  skillTime.textContent = s.time;
  $("#tabOverview").innerHTML = `<p><strong>Why this skill?</strong><br>${escape(s.overview)}</p>`;
  $("#tabSteps").innerHTML = "<ol>" + s.steps.map(x=>`<li>${escape(x)}</li>`).join("") + "</ol>";
  $("#tabTip").innerHTML = `<p>${escape(s.tip)}</p>`;
  $("#tabChallenge").innerHTML = `<p>${escape(s.challenge)}</p>`;
  // switch to app screen
  libraryScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
}

/* Clear library (with confirm) */
function clearLibrary(){
  if(!confirm("Clear library? This will remove tracked learned skills.")) return;
  state.library = [];
  state.xp = 0;
  state.level = 1;
  state.streak = 0;
  state.lastLearned = null;
  save();
  renderQuickLibrary();
  renderStats();
  renderLibraryFull();
}

/* Export library CSV */
function exportLibrary(){
  if(!state.library.length) return showToast("No library to export.");
  const rows = [["Date","Title","Category"], ...state.library.map(it=>[it.date,it.title,it.category])];
  const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv],{type:"text/csv"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "microskill_library.csv"; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast("Exported library.csv");
}

/* ----- Timer ----- */
let timerInterval = null;
function startStopTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
    timerWrap.classList.add("hidden");
    startTimerBtn.textContent = "⏱ Start 10-min Timer";
    timerText.textContent = "10:00";
    timerBar.style.width = "0%";
    return;
  }
  let total = 10*60;
  timerWrap.classList.remove("hidden");
  startTimerBtn.textContent = "Stop Timer";
  updateTimer(total);
  timerInterval = setInterval(()=>{ total--; updateTimer(total); if(total<=0){ clearInterval(timerInterval); timerInterval=null; timerWrap.classList.add("hidden"); startTimerBtn.textContent="⏱ Start 10-min Timer"; showToast("Timer finished — great focus session! 🎉",3000); } },1000);
}
function updateTimer(sec){
  const mm = String(Math.floor(sec/60)).padStart(2,"0");
  const ss = String(sec%60).padStart(2,"0");
  timerText.textContent = `${mm}:${ss}`;
  const pct = ((10*60 - sec)/(10*60))*100;
  timerBar.style.width = pct + "%";
}

/* Theme */
function applyTheme(){
  document.body.classList.toggle("light-mode", state.theme==="light");
  themeToggle.textContent = state.theme==="light" ? "🌙" : "☀️";
}

/* Hard Reset (instant) */
function hardReset(){
  localStorage.clear();
  location.reload();
}

/* Logout (keeps library) */
function logout(){
  const savedLibrary = state.library || [];
  state = { ...DEFAULT, library: savedLibrary };
  save();
  location.reload();
}

/* Settings open/close */
function openSettings(){ settingsModal.classList.remove("hidden"); confettiToggle.checked = state.settings.confetti; quoteToggle.checked = state.settings.showQuote; }
function closeSettings(){ settingsModal.classList.add("hidden"); }

/* Apply prefs from UI */
function applyPrefs(){
  const cats = prefCats.filter(cb=>cb.checked).map(cb=>cb.value);
  state.prefs.categories = cats;
  state.prefs.difficulty = prefDifficulty.value || "Any";
  userPrefsEl.textContent = cats.length ? cats.join(", ") : "All";
  save();
  showToast("Preferences saved");
}

/* Init on load */
function boot(){
  load();
  if(!state.quote) state.quote = QUOTES[Math.floor(Math.random()*QUOTES.length)];
  if(state.settings.showQuote) quoteText.textContent = state.quote; else quoteText.textContent = "";
  applyTheme();

  if(state.user){
    // show app
    loginScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    userNameEl.textContent = state.user.name || "You";
    applyPrefsToUI();
    ensureToday(); renderSkill(); renderQuickLibrary(); renderStats();
  } else {
    loginScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }
}

/* Apply saved prefs to UI */
function applyPrefsToUI(){ prefCats.forEach(cb=>cb.checked = state.prefs.categories.includes(cb.value)); prefDifficulty.value = state.prefs.difficulty || "Any"; userPrefsEl.textContent = state.prefs.categories.length ? state.prefs.categories.join(", ") : "All"; }

/* Show toast */
let toastTimer = null;

/* ---------- Event wiring ---------- */
startBtn.addEventListener("click", ()=>{ const name = (nameInput.value||"").trim(); if(!name) return alert("Enter name or continue as Guest"); state.user = { name }; save(); boot(); });
guestBtn.addEventListener("click", ()=>{ state.user = { name:"Guest" }; save(); boot(); });

themeToggle.addEventListener("click", ()=>{ state.theme = state.theme==="light" ? "dark" : "light"; save(); applyTheme(); });

logoutBtn.addEventListener("click", ()=>{ logout(); });
hardResetBtn.addEventListener("click", ()=>{ hardReset(); });

tabButtons.forEach(btn=> btn.addEventListener("click", ()=>{ tabButtons.forEach(b=>b.classList.remove("active")); btn.classList.add("active"); const t = btn.getAttribute("data-tab"); tabContents.forEach(tc=>tc.classList.remove("active")); document.getElementById(t).classList.add("active"); }));

shuffleBtn.addEventListener("click", shuffleToday);
saveFavBtn.addEventListener("click", toggleFav);
startTimerBtn.addEventListener("click", startStopTimer);
markLearnedBtn.addEventListener("click", markLearned);
openLibraryBtn.addEventListener("click", openLibrary);

viewLibraryBtn.addEventListener("click", openLibrary);
clearLibraryBtn.addEventListener("click", ()=>{ if(confirm("Clear library?")){ state.library=[]; save(); renderQuickLibrary(); renderStats(); renderLibraryFull(); }});
libBackBtn.addEventListener("click", ()=>{ libraryScreen.classList.add("hidden"); appScreen.classList.remove("hidden"); });
closeLibraryBtn.addEventListener("click", ()=>{ libraryScreen.classList.add("hidden"); appScreen.classList.remove("hidden"); });
exportBtn.addEventListener("click", exportLibrary);

prefCats.forEach(cb=>cb.addEventListener("change", applyPrefs));
prefDifficulty.addEventListener("change", applyPrefs);

closeSettingsBtn.addEventListener("click", closeSettings);
hardResetSettingsBtn.addEventListener("click", ()=>{ hardReset(); });
confettiToggle.addEventListener("change", ()=>{ state.settings.confetti = confettiToggle.checked; save();});
quoteToggle.addEventListener("change", ()=>{ state.settings.showQuote = quoteToggle.checked; save(); quoteText.textContent = state.settings.showQuote? state.quote : ""; });

/* helper renderLibraryFull used by clearLibrary too */
function renderLibraryFull(){ if(!state.library.length) { libraryList.innerHTML = "<div class='muted'>No skills learned yet.</div>"; return;} libraryList.innerHTML = state.library.slice().reverse().map(it=>{ const s = SKILLS.find(x=>x.id===it.id)||{title:it.title}; return `<div class="lib-item"><div><strong>${escape(s.title)}</strong><div class="muted">${escape(it.category)} • ${escape(it.date)}</div></div><div><button class="btn small" onclick="viewLibrarySkill('${it.id}')">View</button></div></div>`}).join(""); }

/* viewLibrarySkill made global */
window.viewLibrarySkill = viewLibrarySkill;

/* start app */
boot();
