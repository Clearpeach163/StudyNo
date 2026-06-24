let goed = 0;
let fout = 0;
let random = 0;
let currentWord;
let streak = 0;
let fnnf = 1;
let words = [];
const gehad = [];
let gehad_goed = [];
let shuffleran = 0;
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

let list;

document.getElementById("update").innerText = update;
document.getElementById("feedback").style.display = "none";

const h1 = document.getElementById("h1");
const input = document.getElementById("Main_input");

function newWord() {
  random = Math.floor(Math.random() * words.length);
  gehad.push(random);
  currentWord = words[random];

  // if (gehad.includes(random)) {
  //   console.log("Al gehad twin...");
  //   currentWord = words[Math.floor(Math.random() * words.length)];
  // }

  const h1 = document.getElementById("h1");

  h1.classList.remove("fade-in");
  void h1.offsetWidth;
  h1.classList.add("fade-in");

  // laat Nederlands zien
  if (fnnf === 0) {
    h1.textContent = currentWord.nl;
  } else if (fnnf === 1) {
    h1.textContent = currentWord.taal;
  } else if (fnnf === 2) {
    shuffleran = Math.round(Math.random()); // 0 or 1
    console.log("Shuffle chose" + shuffleran);

    if (shuffleran === 0) {
      h1.textContent = currentWord.nl;
    } else {
      h1.textContent = currentWord.taal;
    }
  }

  input.value = "";
}
// hier is de check
input.addEventListener("keyup", (e) => {
  if (e.key !== "Enter") return;

  const answer = input.value.trim().toLowerCase(); //maakt het antwoord passend voor de check

  // ALS FEEDBACK OPEN IS
  if (document.getElementById("feedback").style.display === "block") {
    goedreken();
    return;
  }

  if (fnnf === 0) {
    // for checking learning style

    // NORMALE CHECK
    if (answer === currentWord.taal.toLowerCase()) {
      goed++;

      streak++;
      gehad_goed.push(currentWord);
      newWord();
      
    } else {
     
    

   
        document.getElementById("feedback").style.display = "block";
        document.getElementById("correctwoord").innerText =
          currentWord.taal;
      
    }
  } else if (fnnf === 1) {
    // this is for nl typing

    if (answer === currentWord.nl.toLowerCase()) {
      goed++;
      streak++;
      gehad_goed.push(currentWord);
      newWord();
      streakcheck();
    } else {
      
      
        document.getElementById("feedback").style.display = "block";
        document.getElementById("correctwoord").innerText =
          currentWord.nl;
      
    }
   } else if (fnnf === 2) {
  if (shuffleran === 0) {
    if (answer === currentWord.taal.toLowerCase()) {
      goed++;
      streak++;
      gehad_goed.push(currentWord);
      newWord();
      streakcheck();
    } else {
        console.log("so the shuffle ran 0 and the answer was wrong but now i gotta display the french word");
           document.getElementById("feedback").style.display = "block";
        document.getElementById("correctwoord").innerText =
          currentWord.taal;
    }
  } else if (shuffleran === 1) {
    if (answer === currentWord.nl.toLowerCase()) {
      goed++;
      streak++;
      gehad_goed.push(currentWord);
      newWord();
      streakcheck();
    } else {
           document.getElementById("feedback").style.display = "block";
        document.getElementById("correctwoord").innerText =
          currentWord.nl;
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

  if (!accepted) {
    document.getElementById("cookieBox").style.display = "flex";
  }
}

window.onload = checkCookie;

function foutreken() {
  fout++;
  streak = 0;
  document.getElementById("feedback").style.display = "none";
  document.getElementById("Opgave_count").innerText =
    "Correct: " + goed + " | " + "Fout: " + fout;

  newWord();
}

function goedreken() {
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
  document.getElementById("update-info").innerText = "HELLO WOR";
}

function setlist(listName) {
  localStorage.setItem("activeList", listName);
  location.href = "ingame.html";
}

function letsdo() {
  location.href = "homescreen.html";
}

function home() {
  location.href = "homescreen.html";
}

const buttons = document.querySelectorAll(".toggle button");

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    playFnnf();
    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    fnnf = btn.dataset.mode;

    if (fnnf === "FN") {
      fnnf = 0;
      console.log(fnnf);
    } else if (fnnf === "NF") {
      fnnf = 1;
      console.log(fnnf);
    } else if (fnnf === "Shuffle") {
      fnnf = 2;
      console.log(fnnf);
    }
  });
});
function streakcheck() {
if (streak === 5 || streak === 10 || streak === 15 || streak === 20 || streak === 25 || streak === 30 || streak === 35 || streak === 40 || streak === 45 || streak === 50) { 
  
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
