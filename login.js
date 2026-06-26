// Plak hier de URL van jouw Apps Script deployment
const URL_API = "https://script.google.com/macros/s/AKfycbw6NcwhZ4dEHbDtSN-9McWQsgW-7S4p6vL14M0H3mKmwmzVcjrzCyvajXuAffQkXqwR/exec";

let currentUser = null;

let jsonpCounter = 0;

function callApi(payload) {
  return new Promise((resolve, reject) => {
    const callbackName = "jsonpCallback_" + (jsonpCounter++);
    const params = new URLSearchParams(payload);
    params.set("callback", callbackName);

    window[callbackName] = function (data) {
      resolve(data);
      cleanup();
    };

    const script = document.createElement("script");
    script.src = URL_API + "?" + params.toString();
    script.onerror = function () {
      reject(new Error("Kon de API niet bereiken"));
      cleanup();
    };

    function cleanup() {
      delete window[callbackName];
      script.remove();
    }

    document.body.appendChild(script);
  });
}

async function signup() {
  const username = document.getElementById("suUser").value.trim();
  const password = document.getElementById("suPass").value;
  if (!username || !password) {
    setStatus("Vul gebruikersnaam en wachtwoord in");
    return;
  }
  setStatus("Bezig met aanmaken...");
  const result = await callApi({ action: "signup", username, password });
  setStatus(result.message);
}

async function login() {
  const username = document.getElementById("liUser").value.trim();
  const password = document.getElementById("liPass").value;
  if (!username || !password) {
    setStatus("Vul gebruikersnaam en wachtwoord in");
    return;
  }
  setStatus("Bezig met inloggen...");
  const result = await callApi({ action: "login", username, password });
  setStatus(result.message);
  if (result.success) {
    currentUser = result.user;
    localStorage.setItem("studyno_user", currentUser.username);
    showDashboard();
  }
}

function showDashboard() {
  document.getElementById("welcomeUser").textContent = currentUser.username;
  document.getElementById("streakValue").textContent = currentUser.streak;
  document.getElementById("dashboard").style.display = "block";
}

async function addStreakDay() {
  const newStreak = Number(currentUser.streak) + 1;
  const result = await callApi({
    action: "updateStreak",
    username: currentUser.username,
    streak: newStreak
  });
  if (result.success) {
    currentUser.streak = newStreak;
    document.getElementById("streakValue").textContent = newStreak;
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem("studyno_user");
  document.getElementById("dashboard").style.display = "none";
  setStatus("Uitgelogd");
}

async function changePassword() {
  const oldPassword = document.getElementById("oldPass").value;
  const newPassword = document.getElementById("newPass").value;
  if (!oldPassword || !newPassword) {
    setStatus("Vul beide wachtwoordvelden in");
    return;
  }
  setStatus("Bezig met wijzigen...");
  const result = await callApi({
    action: "changePassword",
    username: currentUser.username,
    oldPassword,
    newPassword
  });
  setStatus(result.message);
  if (result.success) {
    document.getElementById("oldPass").value = "";
    document.getElementById("newPass").value = "";
  }
}

function setStatus(msg) {
  document.getElementById("status").textContent = msg;
}