let goed = 0;
let fout = 0;
let random = 0;
let feedbackOpen = false;
let currentWord;
let diffmax = 2;
let streak = 0;
let fnnf = Number(localStorage.getItem("fnnf") ?? 1);
let words = [];
let gehad_goed = [];
let shuffleran = 0;
let list;
let toetsModus = localStorage.getItem("toetsModus") === "true";


const popup = document.getElementById("popup");
const clickSound = new Audio("Streak.mp3");
const fnnfSound = new Audio("fnnfselect.mp3");
const messages = [
  "in a row streak! Keep it up!",
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
  "clean streak"
];

console.log(messages[Math.floor(Math.random() * messages.length)]);
function playStreak() {
  clickSound.currentTime = 0; // reset zodat je snel kan spam-clicken
  clickSound.play();
}
function playFnnf() {
  fnnfSound.currentTime = 0; // reset zodat je snel kan spam-clicken
  fnnfSound.play();
}
// Hoeveel letters fout? system:

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from(
      { length: b.length + 1 },
      (_, j) => (i === 0 ? j : j === 0 ? i : 0)
    )
  );

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(
              dp[i - 1][j],
              dp[i][j - 1],
              dp[i - 1][j - 1]
            );
    }
  }

  return dp[a.length][b.length];
}

const activeList = localStorage.getItem("activeList");
words = lists[activeList]?.words || [];


const h1 = document.getElementById("h1");
const input = document.getElementById("Main_input");

function newWord() {

  if (toetsModus == true) {
    document.getElementById("togglemain").style.display = "none"; //removes fn nf switch for toets mode
 actuallynewWord();
  } else {
     document.getElementById("togglemain").style.display = "block"; //adds fn nf switch for oefen mode
    console.log("oefen mode");
    if (Math.random() < 0.7) {
        actuallynewWord();
        console.log("normaal");
    } else {
        newflashcard();
        console.log("flashcard");
    }
  }
}
function newflashcard() {
       const remaining = words.filter(word => !gehad_goed.includes(word));
  console.log(remaining);
    if (remaining.length === 0) {
        sessionStorage.setItem("goed", goed);
        sessionStorage.setItem("fout", fout);
   
        window.location.href = "end_course.html"
        
    } else {
        currentWord = remaining[Math.floor(Math.random() * remaining.length)];
    }
    document.getElementById("flash_taal").textContent = currentWord.taal;
    document.getElementById("flash_nl").textContent = currentWord.nl;
    document.getElementById("flashcard").style.display = "block";
    document.getElementById("okflash").style.display = "block";
    
    
}
function okflash() {
  newWord();
}

function actuallynewWord() {
   document.getElementById("flashcard").style.display = "none";
   document.getElementById("okflash").style.display = "none";
     const remaining = words.filter(word => !gehad_goed.includes(word));
  console.log(remaining);
    if (remaining.length === 0) {
        sessionStorage.setItem("goed", goed);
        sessionStorage.setItem("fout", fout);
   
        window.location.href = "end_course.html"
        
    } else {
        currentWord = remaining[Math.floor(Math.random() * remaining.length)];
    }

    h1.classList.remove("fade-in");
    void h1.offsetWidth;
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
// hier is de check
input.addEventListener("keyup", (e) => {
  if (e.key !== "Enter") return;

  const answer = input.value.trim().toLowerCase(); //maakt het antwoord passend voor de check

  // ALS FEEDBACK OPEN IS
  if (document.getElementById("feedback").style.display === "block") {
    
    foutreken();
    return;
  }

  if (fnnf === 0) {
    // for checking learning style

    // NORMALE CHECK
    if (isCorrectAnswer(answer, currentWord.taal)) {
      goed++;

      streak++;
      gehad_goed.push(currentWord);
      newWord();
      
    } else {
      if (answer === "") {
       
       foutreken();
      } else {
        if (levenshtein(answer, currentWord.taal) <= diffmax) {
        prep();
        } else {
          foutreken();
        }
      }
     
      
    }
  } else if (fnnf === 1) {
    // this is for nl typing

    if (isCorrectAnswer(answer, currentWord.nl)) {
      goed++;
      streak++;
      gehad_goed.push(currentWord);
      newWord();
      streakcheck();
    } else {
         if (answer === "") {
       foutreken();
      } else {
        if (levenshtein(answer, currentWord.nl) <= diffmax) {
        prep();
        } else {
          foutreken();
        }
      }
      
    }
   } else if (fnnf === 2) {
  if (shuffleran === 0) {
    if (isCorrectAnswer(answer, currentWord.taal)) {
      goed++;
      streak++;
      gehad_goed.push(currentWord);
      newWord();
      streakcheck();
    } else {
          if (answer === "") {
       foutreken();
      } else {
        if (levenshtein(answer, currentWord.taal) <= diffmax) {
        prep();
        } else {
          foutreken();
        }
      }
    }
  } else if (shuffleran === 1) {
    if (isCorrectAnswer(answer, currentWord.taal)) {
      goed++;
      streak++;
      gehad_goed.push(currentWord);
      newWord();
      streakcheck();
    } else {
             if (answer === "") {
       foutreken();
      } else {
        if (levenshtein(answer, currentWord.taal) <= diffmax) {
        prep();
        } else {
          foutreken();
        }
        
      }
    }
  }
}

  document.getElementById(
    "Opgave_count"
  ).innerText = `Correct: ${goed} | Fout: ${fout}`;
});

newWord();

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

function setCookie(accepted) {
  document.cookie =
    "cookiesAccepted=" + accepted + "; path=/; max-age=31536000";

  document.getElementById("cookieBox").style.display = "none";
}

function checkCookie() {
  const accepted = getCookie("cookiesAccepted");


}

window.onload = checkCookie;

function foutreken() {
  feedbackOpen = false;
  fout++;
  streak = 0;

  if (toetsModus) {
    gehad_goed.push(currentWord); // woord is "gehad", ook al was het fout
  }

  document.getElementById("feedback").style.display = "none";
  document.getElementById("Opgave_count").innerText =
    "Correct: " + goed + " | " + "Fout: " + fout;

  newWord();
}

function goedreken() {
  feedbackOpen = false;
  goed++;
  streak++;
  gehad_goed.push(currentWord);

  streakcheck();
  document.getElementById("feedback").style.display = "none";
  document.getElementById("Opgave_count").innerText =
    "Correct: " + goed + " | " + "Fout: " + fout;

  newWord();
}

function version() {
  location.href = "update.html";
  document.getElementById("update-info").innerText = whatsnew;
}

  function setlist(listName) {
    localStorage.setItem("activeList", listName);
    location.href = "prepare.html";
    
  }

function letsdo() {
  location.href = "homescreen.html";
}

function home() {
  location.href = "homescreen.html";
} 
function prep() {
  feedbackOpen = true;
     document.getElementById("feedback").style.display = "block";
     if (fnnf === 0) {
          document.getElementById("correctwoord").innerText =
          currentWord.taal;
     } else if (fnnf === 1) {
        
          document.getElementById("correctwoord").innerText = currentWord.nl;
     } else if (fnnf === 2) {
          if (shuffleran === 0) {
               document.getElementById("correctwoord").innerText =
               currentWord.taal;
          } else if (shuffleran === 1) {
               document.getElementById("correctwoord").innerText =
               currentWord.nl;
          }
     }
   if (input.value === "") {
       document.getElementById("jijhad").innerText = "-";
   } else {
       document.getElementById("jijhad").innerText = input.value;
   }
};

const buttons = document.querySelectorAll(".toggle button");
window.addEventListener("DOMContentLoaded", () => {
  goedreken();
  resetgoed();
  if (fnnf == 2) {
    document.querySelector('[data-mode="Shuffle"]').classList.add("active");
  }
  if (fnnf == 1) {
    document.querySelector('[data-mode="FN"]').classList.add("active");
  }
  if (fnnf == 0) {
    document.querySelector('[data-mode="NF"]').classList.add("active");
  }
  
});

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    playFnnf();
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    fnnf = btn.dataset.mode;

    if (fnnf === "FN") {
      fnnf = 1;
      console.log(fnnf);
    } else if (fnnf === "NF") {
      fnnf = 0;
      console.log(fnnf);
    } else if (fnnf === "Shuffle") {
      fnnf = 2;
      console.log(fnnf);
    }
  });
});
function resetgoed() {
  goed = 0;
  fout = 0;
  document.getElementById("Opgave_count").innerText =
    "Correct: " + goed + " | " + "Fout: " + fout;
}
function streakcheck() {
if (streak === 5 || streak === 10 || streak === 15 || streak === 20 || streak === 25 || streak === 30 || streak === 35 || streak === 40 || streak === 45 || streak === 50) { 
  fireConfetti();
  showPopup(streak + " " + inARowPhrases[Math.floor(Math.random() * inARowPhrases.length)] + ", " + messages[Math.floor(Math.random() * messages.length)]);
  
}
}


function showPopup(message) {
  playStreak();
  popup.textContent = message;

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 2500);
}
function fireConfetti() {
  const duration = 100;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 10,
      spread: 160,
      origin: { x: Math.random(), y: 0.6 },
      colors: [
        '#6D28D9',
        '#3d35d6',
        '#8B5CF6',
        '#4a42e1',
        '#6d235e'
      ]
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

const charMenu = document.getElementById("charMenu");

const variants = {
  a: ["a", "á", "à", "â", "ä", "ã", "å", "ā"],
  c: ["c", "ç"],
  e: ["e", "é", "è", "ê", "ë", "ē"],
  i: ["i", "í", "ì", "î", "ï", "ī"],
  n: ["n", "ñ"],
  o: ["o", "ó", "ò", "ô", "ö", "õ", "ō", "ø"],
  s: ["s", "ß"],
  u: ["u", "ú", "ù", "û", "ü", "ū"]
};

let holdTimer = null;
let activeKey = null;

// --------------------
// KEY HOLD DETECTION
// --------------------
input.addEventListener("keydown", (e) => {
  if (feedbackOpen) return;
  if (e.repeat) return;
  if (!variants[e.key]) return;

  activeKey = e.key;

  holdTimer = setTimeout(() => {
    showCharMenu(input, variants[e.key]);
  }, 600);
});

input.addEventListener("keyup", () => {
  clearTimeout(holdTimer);
  holdTimer = null;
  activeKey = null;
});

// --------------------
// SHOW MENU
// --------------------
function showCharMenu(input, chars) {
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
    num.textContent = String(i + 1);
    num.onclick = () => selectChar(i);

    topRow.appendChild(letter);
    bottomRow.appendChild(num);
  });

  charMenu.appendChild(topRow);
  charMenu.appendChild(bottomRow);

  const rect = input.getBoundingClientRect();

  charMenu.style.left = rect.left + "px";
  charMenu.style.top = rect.top - 60 + "px";

  charMenu.classList.remove("hidden");

  window.addEventListener("keydown", numberSelectHandler);
   window.addEventListener("keyup", closeMenu);
}

// --------------------
// SELECT CHAR
// --------------------
function selectChar(index) {
  const list = variants[activeKey];
  if (!list) return;

  insertChar(list[index]);
  closeMenu();
}

// --------------------
// NUMBER KEY SELECT
// --------------------
function numberSelectHandler(e) {
  if (!activeKey) return;

  const n = parseInt(e.key);
  if (isNaN(n) || n === 0) return;

  const list = variants[activeKey];
  const index = n - 1;

  if (index >= list.length) return;

  selectChar(index);
}

// --------------------
// INSERT CHAR
// --------------------
function insertChar(char) {
  const pos = input.selectionStart;

  input.value =
    input.value.slice(0, pos - 1) +
    char +
    input.value.slice(input.selectionEnd);

  input.setSelectionRange(pos, pos);
  input.focus();
}

// --------------------
// CLOSE MENU
// --------------------
function closeMenu() {
  charMenu.classList.add("hidden");

  window.removeEventListener("keydown", numberSelectHandler);

  holdTimer = null;
  activeKey = null;
}

if (window.location.pathname.endsWith("ingame.html")) {
  if (!localStorage.getItem("seen")) {
  showPopup("Hey there, Did you know you can add accents like: ë by holding the letter!");

    localStorage.setItem("seen", "true");
  }
}


function normalize(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isCorrectAnswer(userInput, correctAnswer) {
  const input = normalize(userInput);

  const answers = Array.isArray(correctAnswer)
    ? correctAnswer
    : correctAnswer.split(/\s*\/\s*/);

  const normalizedAnswers = answers.map(normalize);

  return normalizedAnswers.includes(input);
}
