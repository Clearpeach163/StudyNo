const history = [];
let historyIndex = -1;

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

      if (result) log(result);

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