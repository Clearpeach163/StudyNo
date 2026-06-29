const history = [];
let historyIndex = -1;

const STUDYNO_API_URL =
  "https://script.google.com/macros/s/AKfycbxX56GJJZGpG6Acu2vCNOc2IfeOYALod8wKoxh4-24/exec";

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

  function getPrompt() {
    const role = state.role === "admin" ? "root" : "user";
    const device = navigator.platform || "device";
    return `${role}@studyno-${device}:~$`;
  }

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

  function log(text) {
    const output = document.querySelector(".output");
    if (output) output.innerHTML += `<div>${text}</div>`;
  }

  async function callApi(payload) {
    try {
      const res = await fetch(STUDYNO_API_URL, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      });

      return await res.json();
    } catch (err) {
      throw new Error("API unreachable: " + err.message);
    }
  }

  function padCol(value, width) {
    return String(value).padEnd(width).slice(0, width);
  }

  function formatAccountsTable(users) {
    if (!users?.length) return "no accounts found";

    const cols = [
      ["username", 18],
      ["streak", 8],
      ["learningTime(s)", 16],
      ["lastLogin", 22]
    ];

    const header = cols.map(([n, w]) => padCol(n, w)).join("");
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

  const commands = {
    sudo: (args) => {
      if (args[0] === "href" && args[1]) {
        window.location.href = args[1];
        return "redirecting...";
      }
      return "Command executed";
    },

    echo: (args) => args.join(" "),

    run: (args) => {
      if (state.role !== "admin") return "access denied";
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
      if (state.role !== "admin") return "access denied";
      return "backend: " + STUDYNO_API_URL;
    },

    ls: async (args) => {
      if (state.role !== "admin") return "access denied";
      if (args[0] !== "accounts") return "usage: ls accounts";

      try {
        log("fetching accounts...");

        const result = await callApi({
          action: "getAllUsers"
        });

        if (!result.success) return "error: " + result.message;

        return formatAccountsTable(result.users);
      } catch (err) {
        return "error: " + err.message;
      }
    }
  };

  const commandList = Object.keys(commands);

  function updateGhost() {
    const value = input.value;
    if (!value) return (ghost.textContent = "");

    const first = value.split(" ")[0];

    const match = commandList.find(
      (cmd) => cmd.startsWith(first) && cmd !== first
    );

    ghost.textContent = match || "";
  }

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
  });

  input.addEventListener("keydown", (e) => {
    const raw = input.value.trim();

    if (e.key === "Tab") {
      e.preventDefault();
      const first = input.value.split(" ")[0];
      const match = commandList.find((cmd) => cmd.startsWith(first));
      if (match) input.value = match;
      ghost.textContent = "";
      return;
    }

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
        : `command not found: ${cmd}`;

      if (result?.then) {
        result.then((t) => t && log(t));
      } else if (result) {
        log(result);
      }
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] || "";
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value =
        historyIndex === history.length ? "" : history[historyIndex];
    }
  });
});