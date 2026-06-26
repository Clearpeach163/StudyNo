const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbz4Z0Bj0ryEMUyMWGItxdNFSiLFC3W5PEUY2RAgshDfaKVvmtsSDqETFE_7Py7hYfu6zQ/exec";

let lists = {};

async function loadLists() {
  try {
    const res = await fetch(SHEET_API_URL);
    if (!res.ok) throw new Error("Fetch failed");

    lists = await res.json();
  } catch (err) {
    console.error(err);
    lists = {};
  }
}

async function startApp() {
  await loadLists();
  initApp();
}

startApp();