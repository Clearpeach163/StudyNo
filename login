<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<title>Login / Signup</title>
</head>
<body>

<h2>Account aanmaken</h2>
<input id="suUser" placeholder="Gebruikersnaam"><br>
<input id="suPass" type="password" placeholder="Wachtwoord"><br>
<button onclick="signup()">Aanmaken</button>

<hr>

<h2>Inloggen</h2>
<input id="liUser" placeholder="Gebruikersnaam"><br>
<input id="liPass" type="password" placeholder="Wachtwoord"><br>
<button onclick="login()">Inloggen</button>

<p id="status"></p>

<div id="dashboard" style="display:none">
  <hr>
  <h2>Welkom, <span id="welcomeUser"></span></h2>
  <p>Streak: <span id="streakValue"></span> dagen</p>
  <button onclick="addStreakDay()">+1 dag streak</button>
  <button onclick="logout()">Uitloggen</button>

  <hr>
  <h3>Wachtwoord wijzigen</h3>
  <input id="oldPass" type="password" placeholder="Oud wachtwoord"><br>
  <input id="newPass" type="password" placeholder="Nieuw wachtwoord"><br>
  <button onclick="changePassword()">Wijzigen</button>
</div>

<script>
// Plak hier de URL van jouw Apps Script deployment
const URL_API = "https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnRxj1c-qgqlmJtUaYGErYGvPyqA8i0LCwJTnF0eRSd-htgqikoDxnN7Eu0xfqGwv6Ust957IzaA01ayIWNCmEd5ZQPRtwMpv2OTXcFBSqHVxiA0VikpzUPsFb55peGtojEixBkNs5G5Uzfc1Gnr1ura93z_FYhqqUkSsKaCsuxjtf4wgvirfm9aRDLIHvmTuFw6Smo9oE-xsHwB-6sflkP5EMkzxSYyqFYENU91ETPlvK96T5aqfk5eL2mkAFhwTnJSwTZW0fS1WPcEYnth8b5LSlhVpA&lib=MJtSS66l_0dYzpPus0gRoiE1aweLcwlla";

let currentUser = null;

async function callApi(payload) {
  const res = await fetch(URL_API, {
    method: "POST",
    // text/plain voorkomt dat de browser een CORS-preflight (OPTIONS) stuurt,
    // wat Apps Script webapps niet goed afhandelen.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  });
  return res.json();
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
</script>

</body>
</html>
