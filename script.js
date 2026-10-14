// ====================
// STATE
// ====================
let goed = 0;
let fout = 0;
let streak = 0;
let currentWord;
let shuffleran = 0;
let fnnf = Number(localStorage.getItem("fnnf") ?? 1); // 0 = NL→taal, 1 = taal→NL, 2 = shuffle
let gehad_goed = [];
let feedbackOpen = false;
const toetsModus = localStorage.getItem("toetsModus") === "true";

const activeList = localStorage.getItem("activeList");
const words = lists[activeList]?.words || [];

// ====================
// ELEMENTEN & GELUID
// ====================
const h1 = document.getElementById("h1");
const input = document.getElementById("Main_input");
const popup = document.getElementById("popup");
const charMenu = document.getElementById("charMenu");
const streakSound = new Audio("Streak.mp3");
const fnnfSound = new Audio("fnnfselect.mp3");
const fullScreenSound = new Audio("fullscreen.mp3");
const nextWordSound = new Audio("skip.mp3");
const whoosh = new Audio("whoosh.wav");
const correct = new Audio("correct.mp3");

function playSound(sound, volume = 1) {
  sound.currentTime = 0;
  sound.volume = volume;
  sound.play();
}

// ====================
// TEKSTEN
// ====================
const messages = [
  "Keep it up!",
  "Great job!",
  "You are doing well!",
  "Keep going!",
  "Error 404: To much motivation",
  "crazy streak, keep it up!",
  "You are a learning machine!",
  "Keep up the good work!",
  "You are a genius!",
  "is this a streak or a bug?",
];

const inARowPhrases = [
  "in a row",
  "straight",
  "back to back",
  "consecutive",
  "unbroken",
  "continuous",
  "on a streak",
  "clean streak",
];

const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ====================
// WOORD KIEZEN
// ====================
function pickWord() {
  const remaining = words.filter((w) => !gehad_goed.includes(w));

  if (remaining.length === 0) {
    sessionStorage.setItem("goed", goed);
    sessionStorage.setItem("fout", fout);
    window.location.href = "end_course.html";
    return false;
  }

  currentWord = random(remaining);
  return true;
}

function newWord() {
  const toggle = document.getElementById("togglemain");

  if (toetsModus) {
    toggle.style.display = "none";
    showQuestion();
  } else {
        showQuestion();
  }
}

function showQuestion() {
  document.getElementById("flashcard").style.display = "none";
  document.getElementById("okflash").style.display = "none";

  if (!pickWord()) return;

  h1.classList.remove("fade-in");
  void h1.offsetWidth; // herstart animatie
  h1.classList.add("fade-in");

  if (fnnf === 0) {
    h1.textContent = currentWord.nl;
  } else if (fnnf === 1) {
    h1.textContent = currentWord.taal;
  } else {
    shuffleran = Math.round(Math.random());
    h1.textContent = shuffleran ? currentWord.taal : currentWord.nl;
  }

  input.value = "";
}

function showFlashcard() {
  if (!pickWord()) return;

  document.getElementById("flash_taal").textContent = currentWord.taal;
  document.getElementById("flash_nl").textContent = currentWord.nl;
  document.getElementById("flashcard").style.display = "block";
  document.getElementById("okflash").style.display = "block";
}

// ====================
// SCORE
// ====================
function updateScore() {
  document.getElementById("Opgave_count").innerText =
    `Correct: ${goed} | Fout: ${fout}`;
}

// ====================
// CHECK (zelf invullen)
// ====================
 function checkAnswer(answer) {
  // Popup open: Enter sluit hem en gaat naar het volgende woord
  if (feedbackOpen) {
    feedbackOpen = false;
    document.getElementById("feedback").style.display = "none";
    newWord();
    return;
  }

  // Wat het goede antwoord is hangt af van de modus
  let expected;
  if (fnnf === 0) expected = currentWord.taal;
  else if (fnnf === 1) expected = currentWord.nl;
  else expected = shuffleran ? currentWord.nl : currentWord.taal;

  if (answer === expected.toLowerCase().trim()) {
    goed++;
    streak++;
    gehad_goed.push(currentWord);
    streakcheck();
    newWord();
  } else {
    
    playSound(whoosh, 0.1);
    fout++;
    streak = 0;
    if (toetsModus) gehad_goed.push(currentWord);

    feedbackOpen = true;

    document.getElementById("correctwoord").innerText = expected;
    document.getElementById("jijhad").innerText = answer || "-";
    document.getElementById("feedback").style.display = "block";
  }
}
// Popup verbergen bij het laden
document.getElementById("feedback").style.display = "none";

// Knop "Fout rekenen": fout was al geteld, dus gewoon sluiten en door
function foutreken() {
  feedbackOpen = false;
  document.getElementById("feedback").style.display = "none";
  updateScore();
  newWord();
}

// Knop "Goed rekenen": de fout terugdraaien en als goed tellen
function goedreken() {
  playSound(correct, 0.3);
  fout--;
  goed++;
  streak++;
  if (!gehad_goed.includes(currentWord)) gehad_goed.push(currentWord);

  feedbackOpen = false;
  document.getElementById("feedback").style.display = "none";
  streakcheck();
  updateScore();
  newWord();
}
// Knop "OK" op de flashcard
function okflash() {
  newWord();
}
input.addEventListener("keyup", (e) => {
  if (e.key !== "Enter") return;
  checkAnswer(input.value.trim().toLowerCase());
  updateScore();
});

// ====================
// STREAK & POPUP
// ====================
function streakcheck() {
  if (streak > 0 && streak % 5 === 0 && streak <= 50) {
    fireConfetti();
    showPopup(`${streak} ${random(inARowPhrases)}, ${random(messages)}`);
  }
}

function showPopup(message) {
  playSound(streakSound, 1);
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}

function fireConfetti() {
  const end = Date.now() + 100;

  (function frame() {
    confetti({
      particleCount: 10,
      spread: 160,
      origin: { x: Math.random(), y: 0.6 },
      colors: ["#6D28D9", "#3d35d6", "#8B5CF6", "#4a42e1", "#6d235e"],
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ====================
// MODUS-KNOPPEN (NF / FN / Shuffle)
// ====================
const modes = { NF: 0, FN: 1, Shuffle: 2 };
const buttons = document.querySelectorAll(".toggle button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    playSound(fnnfSound, 0.2);
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    fnnf = modes[btn.dataset.mode];
  });
});

// ====================
// START
// ====================
window.addEventListener("DOMContentLoaded", () => {
  const activeMode = Object.keys(modes).find((m) => modes[m] === fnnf);
  document.querySelector(`[data-mode="${activeMode}"]`)?.classList.add("active");
  updateScore();
});

newWord();

// ====================
// NAVIGATIE
// ====================
function home() {
  location.href = "homescreen.html";
}

function setlist(listName) {
  localStorage.setItem("activeList", listName);
  location.href = "prepare.html";
}

// ====================
// ACCENTEN-MENU (letter ingedrukt houden)
// ====================
const variants = {
  a: ["a", "á", "à", "â", "ä", "ã", "å", "ā"],
  c: ["c", "ç"],
  e: ["e", "é", "è", "ê", "ë", "ē"],
  i: ["i", "í", "ì", "î", "ï", "ī"],
  n: ["n", "ñ"],
  o: ["o", "ó", "ò", "ô", "ö", "õ", "ō", "ø"],
  s: ["s", "ß"],
  u: ["u", "ú", "ù", "û", "ü", "ū"],
};

let holdTimer = null;
let activeKey = null;

input.addEventListener("keydown", (e) => {
  if (feedbackOpen || e.repeat || !variants[e.key]) return;

  activeKey = e.key;
  holdTimer = setTimeout(() => showCharMenu(variants[e.key]), 600);
});

input.addEventListener("keyup", () => {
  clearTimeout(holdTimer);
  holdTimer = null;
});

function showCharMenu(chars) {
  charMenu.innerHTML = "";

  const topRow = document.createElement("div");
  const bottomRow = document.createElement("div");
  topRow.className = "row top";
  bottomRow.className = "row bottom";

  chars.forEach((char, i) => {
    const letter = document.createElement("span");
    letter.textContent = char;
    letter.onclick = () => selectChar(i);

    const num = document.createElement("span");
    num.textContent = i + 1;
    num.onclick = () => selectChar(i);

    topRow.appendChild(letter);
    bottomRow.appendChild(num);
  });

  charMenu.append(topRow, bottomRow);

  const rect = input.getBoundingClientRect();
  charMenu.style.left = rect.left + "px";
  charMenu.style.top = rect.top - 60 + "px";
  charMenu.classList.remove("hidden");

  window.addEventListener("keydown", numberSelectHandler);
  window.addEventListener("keyup", closeMenu);
}

function selectChar(index) {
  const chars = variants[activeKey];
  if (!chars?.[index]) return;

  const pos = input.selectionStart;
  input.value =
    input.value.slice(0, pos - 1) + chars[index] + input.value.slice(input.selectionEnd);
  input.setSelectionRange(pos, pos);
  input.focus();

  closeMenu();
}

function numberSelectHandler(e) {
  const n = parseInt(e.key);
  if (activeKey && n > 0) selectChar(n - 1);
}

function closeMenu() {
  charMenu.classList.add("hidden");
  window.removeEventListener("keydown", numberSelectHandler);
  window.removeEventListener("keyup", closeMenu);
  activeKey = null;
}

// ====================
// EERSTE KEER TIP
// ====================
if (window.location.pathname.endsWith("ingame.html") && !localStorage.getItem("seen")) {
  showPopup("Hey there, Did you know you can add accents like: ë by holding the letter!");
  localStorage.setItem("seen", "true");
}





if (activeList.includes("du")) {
  document.getElementById("FN").innerHTML = "DN";
   document.getElementById("NF").innerHTML = "ND";
}
if (activeList.includes("eng")) {
  document.getElementById("FN").innerHTML = "EN";
   document.getElementById("NF").innerHTML = "NE";
}
if (activeList.includes("fr")) {
  document.getElementById("FN").innerHTML = "FN";
   document.getElementById("NF").innerHTML = "NF";
  }



  //prettify



  function fullScreen() {
    playSound(fullScreenSound, 1);
    var el = document.documentElement
    , rfs = // for newer Webkit and Firefox
       el.requestFullScreen
    || el.webkitRequestFullScreen
    || el.mozRequestFullScreen
    || el.msRequestFullScreen
    ;

    if(typeof rfs!="undefined" && rfs){

        rfs.call(el);

    } else if(typeof window.ActiveXObject!="undefined"){

        // for Internet Explorer
        var wscript = new ActiveXObject("WScript.Shell");

        if (wscript!=null) {
          wscript.SendKeys("{F11}");
        }
    }

}