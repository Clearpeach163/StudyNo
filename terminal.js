const history = [];
let historyIndex = -1;

// Eigen API-link voor het login/streak-systeem, los van SHEET_API_URL
// (vul hier dezelfde URL in die je ook in index.html / ingame.html gebruikt)
const STUDYNO_API_URL = "https://script.google.com/macros/s/AKfycbxX56GJJZGpG6Acu2vCNOc2IfeOYALod8wKoxh4-24/dev";

const state = {
  role: "user"
};

let loginMode = false;
let realPassword = "";
let loginBuffer = "usr_login ";

document.addEventListener("DOMContentLoaded", () => {
  const terminal = document.getElementById("terminal");
  const input = document.getElementById("terminal-input");
  const ghost = document.getElementById("ghost");

  if (!terminal || !input) return;

  // ======================
  // PROMPT
  // ======================
  function getPrompt() {
    const role = state.role === "admin" ? "root" : "user";
    const device = navigator.platform || "device";
    return `${role}@studyno-${device}:~$`;
  }

  // ======================
  // TERMINAL TOGGLE
  // ======================
  function toggleTerminal() {
    terminal.classList.toggle("hidden");
    if (!terminal.classList.contains("hidden")) {
      setTimeout(() => input.focus(), 0);
    }
  }

  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      toggleTerminal();
    }
  });

  // ======================
  // OUTPUT
  // ======================
  function log(text) {
    const output = document.querySelector(".output");
    if (output) output.innerHTML += `<div>${text}</div>`;
  }

  function clipboard() {
    navigator.clipboard.writeText(SHEET_API_URL).then(
      () => log("Copied to clipboard"),
      (err) => log("Failed to copy: " + err)
    );
  }

  // ======================
  // API CALL (JSONP, zelfde truc als in index.html/ingame.html)
  // ======================
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
      script.src = STUDYNO_API_URL + "?" + params.toString();
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

  // ======================
  // TABLE FORMATTING
  // ======================
  function padCol(value, width) {
    return String(value).padEnd(width).slice(0, width);
  }

  function formatAccountsTable(users) {
    if (!users.length) return "no accounts found";

    const cols = [
      ["username", 18],
      ["streak", 8],
      ["learningTime(s)", 16],
      ["lastLogin", 22]
    ];

    const header = cols.map(([name, w]) => padCol(name, w)).join("");
    const separator = "-".repeat(cols.reduce((a, [, w]) => a + w, 0));

    const rows = users.map((u) =>
      [
        padCol(u.username, cols[0][1]),
        padCol(u.streak, cols[1][1]),
        padCol(u.learningTime, cols[2][1]),
        padCol(u.lastLogin || "-", cols[3][1])
      ].join("")
    );

    return [header, separator, ...rows].join("\n").replace(/\n/g, "<br>");
  }

  // ======================
  // COMMANDS
  // ======================
  const commands = {
    sudo: (args) => {
      if (args[0] === "href" && args[1]) {
        window.location.href = args[1];
        return "redirecting...";
      }
      return "Command ran successfully";
    },

    echo: (args) => args.join(" "),

    run: (args) => {
      if (state.role !== "admin") return "access denied (admin only)";
      try {
        new Function(args.join(" "))();
        return "code executed";
      } catch (err) {
        return "Error: " + err.message;
      }
    },

    quit: () => {
      terminal.classList.add("hidden");
      return "terminal closed";
    },

    usr_login: (args) => {
      const pass = args.join(" ");

      if (pass === "123 bloem pot") {
        state.role = "admin";
        return "logged in as admin";
      }

      return "wrong password";
    },

    logout: () => {
      state.role = "user";
      return "logged out";
    },

    help: () => Object.keys(commands).join("\n"),

    data_url: () => {
      if (state.role !== "admin") return "access denied (admin only)";
      clipboard();
      return "database_url: " + SHEET_API_URL;
    },

    ls: async (args) => {
      if (state.role !== "admin") return "access denied (admin only)";
      if (args[0] !== "accounts") return "usage: ls accounts";

      log("fetching accounts...");
      try {
        const result = await callApi({ action: "getAllUsers" });
        if (!result.success) return "error: " + result.message;
        return formatAccountsTable(result.users);
      } catch (err) {
        return "error: " + err.message;
      }
    }
  };

  const commandList = Object.keys(commands);

  // ======================
  // TAB STATE
  // ======================
  let tabState = {
    matches: [],
    index: 0,
    lastInput: ""
  };

  // ======================
  // GHOST AUTOCOMPLETE
  // ======================
  function updateGhost() {
    const value = input.value;

    if (!value) {
      ghost.textContent = "";
      return;
    }

    const first = value.split(" ")[0];

    const match = commandList.find(cmd =>
      cmd.startsWith(first) && cmd !== first
    );

    ghost.textContent = match || "";
  }

  // ======================
  // INPUT MASK (LOGIN)
  // ======================
  function renderInputMask() {
    if (loginMode) {
      input.value = loginBuffer + "•".repeat(realPassword.length);
    }
  }

  input.addEventListener("input", () => {
    const value = input.value;

    if (!loginMode && value.startsWith("usr_login ")) {
      loginMode = true;
      realPassword = "";
      loginBuffer = "usr_login ";
      return;
    }

    if (!loginMode) {
      updateGhost();
      return;
    }

    const typed = value.slice(loginBuffer.length);

    if (value.length < loginBuffer.length) {
      loginMode = false;
      realPassword = "";
      return;
    }

    if (typed.length > realPassword.length) {
      realPassword += typed.slice(-1);
    }

    if (typed.length < realPassword.length) {
      realPassword = realPassword.slice(0, typed.length);
    }

    renderInputMask();
    updateGhost();
  });

  // ======================
  // KEY HANDLER
  // ======================
  input.addEventListener("keydown", (e) => {
    const raw = input.value.trim();

    // ======================
    // TAB AUTOCOMPLETE
    // ======================
    if (e.key === "Tab") {
      e.preventDefault();

      const first = input.value.split(" ")[0];

      const match = commandList.find(cmd =>
        cmd.startsWith(first)
      );

      if (!match) return;

      input.value = match;

      ghost.textContent = "";
      return;
    }

    // ======================
    // ENTER
    // ======================
    if (e.key === "Enter") {
      ghost.textContent = "";
      if (!raw) return;

      let cmd, args;

      if (loginMode) {
        cmd = "usr_login";
        args = [realPassword];
        loginMode = false;
        realPassword = "";
      } else {
        const parts = raw.split(" ");
        cmd = parts[0];
        args = parts.slice(1);
      }

      history.push(raw);
      historyIndex = history.length;

      log(`<span class="prompt">${getPrompt()}</span> ${raw}`);

      input.value = "";

      const result = commands[cmd]
        ? commands[cmd](args)
        : `zsh: command not found: ${cmd}`;

      // commando's zoals "ls accounts" geven een Promise terug (moeten eerst
      // op de API wachten) -> die afhandelen zonder de rest te blokkeren
      if (result && typeof result.then === "function") {
        result.then((text) => {
          if (text) log(text);
        });
      } else if (result) {
        log(result);
      }

      return;
    }

    // ======================
    // HISTORY
    // ======================
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;

      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || "";
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!history.length) return;

      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex === history.length ? "" : history[historyIndex];
    }
  });
});