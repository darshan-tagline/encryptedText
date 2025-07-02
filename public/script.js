const API_BASE = "/api/notes";
if (window.location.pathname === "/note.html") {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (id) {
    window.location.replace(`/${id}`);
  }
}
const noteId = window.location.pathname.substring(1);
const titleEl = document.getElementById("noteTitle");
const textArea = document.getElementById("noteArea");
const statusMsg = document.getElementById("statusMsg");
const noteIdDisplay = document.getElementById("noteIdDisplay");
const lastSaved = document.getElementById("lastSaved");

let password = null;
let noteExists = false;

// === MODAL FUNCTIONS ===

function showPasswordModal(options) {
  const modal = document.getElementById("passwordModal");
  const passwordInput = document.getElementById("passwordInput");
  const confirmBtn = document.getElementById("confirmPassword");
  const cancelBtn = document.getElementById("cancelPassword");
  const errorMsg = document.getElementById("passwordError");
  const modalTitle = modal.querySelector("h3");
  const modalMessage = modal.querySelector("p");

  modalTitle.textContent = options.title || "Enter Password";
  modalMessage.textContent =
    options.message ||
    "This note is password protected. Please enter the password to view or edit.";
  confirmBtn.textContent = options.confirmText || "Unlock";
  cancelBtn.style.display = options.showCancel === false ? "none" : "block";

  modal.style.display = "flex";
  passwordInput.value = "";
  passwordInput.focus();
  errorMsg.textContent = "";

  return new Promise((resolve) => {
    function cleanUp() {
      confirmBtn.removeEventListener("click", confirmHandler);
      cancelBtn.removeEventListener("click", cancelHandler);
      passwordInput.removeEventListener("keypress", enterHandler);
      modal.style.display = "none";
    }

    function confirmHandler() {
      const password = passwordInput.value.trim();
      if (password || options.allowEmpty) {
        cleanUp();
        resolve(password || null);
      } else {
        errorMsg.textContent =
          options.errorMessage || "Please enter a password";
      }
    }

    function cancelHandler() {
      cleanUp();
      resolve(null);
    }

    function enterHandler(e) {
      if (e.key === "Enter") {
        confirmHandler();
      }
    }

    confirmBtn.addEventListener("click", confirmHandler);
    cancelBtn.addEventListener("click", cancelHandler);
    passwordInput.addEventListener("keypress", enterHandler);
  });
}

async function showConfirmModal(message) {
  const modal = document.getElementById("passwordModal");
  const passwordInput = document.getElementById("passwordInput");
  const confirmBtn = document.getElementById("confirmPassword");
  const cancelBtn = document.getElementById("cancelPassword");
  const errorMsg = document.getElementById("passwordError");
  const modalTitle = modal.querySelector("h3");
  const modalMessage = modal.querySelector("p");

  // Configure for confirmation dialog
  modalTitle.textContent = "Confirm Action";
  modalMessage.textContent = message;
  passwordInput.style.display = "none";
  errorMsg.style.display = "none";

  modal.style.display = "flex";

  return new Promise((resolve) => {
    function cleanUp() {
      confirmBtn.removeEventListener("click", confirmHandler);
      cancelBtn.removeEventListener("click", cancelHandler);
      passwordInput.style.display = "block";
      errorMsg.style.display = "block";
      modal.style.display = "none";
    }

    function confirmHandler() {
      cleanUp();
      resolve(true);
    }

    function cancelHandler() {
      cleanUp();
      resolve(false);
    }

    confirmBtn.addEventListener("click", confirmHandler);
    cancelBtn.addEventListener("click", cancelHandler);
  });
}

// === CRYPTO HELPERS ===
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function b64Encode(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64Decode(str) {
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function encryptText(text, password) {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );

  return {
    salt: b64Encode(salt),
    iv: b64Encode(iv),
    data: b64Encode(encrypted),
  };
}

async function decryptText(encText, password) {
  const salt = b64Decode(encText.salt);
  const iv = b64Decode(encText.iv);
  const data = b64Decode(encText.data);
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  return new TextDecoder().decode(decrypted);
}

// === NOTE ACTIONS ===
async function loadNote() {
  if (!noteId) {
    showToast("No note ID found.");
    return;
  }

  noteIdDisplay.textContent = noteId;
  showToast("Loading...");

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(noteId)}`);
    if (res.status == 404) {
      showToast("New note. Please set a password to save this note.");
      password = await showPasswordModal({
        title: "Set Password",
        message: "Create a password for this new note:",
        confirmText: "Set Password",
        errorMessage: "Password cannot be empty",
      });

      if (!password) {
        showToast("Password is required.");
        window.location.href = "/";
        return;
      }

      noteExists = false;
      textArea.value = "";
      updateLastSaved();
      return;
    }

    const json = await res.json();
    if (!json.data?.encText) {
      showToast("Malformed note.");
      return;
    }

    let decrypted = false;
    while (!decrypted) {
      password = await showPasswordModal({
        title: "Enter Password",
        message: "This note is password protected. Please enter the password:",
        errorMessage: "Invalid password",
      });

      if (!password) {
        window.location.href = "/";
        return;
      }

      try {
        const decryptedText = await decryptText(json.data.encText, password);
        textArea.value = decryptedText;
        showToast("Note decrypted successfully.");
        noteExists = true;
        decrypted = true;
        updateLastSaved();
      } catch (err) {
        showToast("Decryption failed. Wrong password?");
      }
    }
  } catch (err) {
    showToast("Error loading note.");
    console.error(err);
  }
}

function updateLastSaved() {
  const now = new Date();
  lastSaved.textContent = `Last saved: ${now.toLocaleString()}`;
}

async function saveNote() {
  if (!noteId) {
    showToast("Missing note ID.");
    return;
  }

  if (!password) {
    password = await showPasswordModal({
      title: "Set Password",
      message: "Create a password for this note:",
      confirmText: "Set Password",
      errorMessage: "Password cannot be empty",
    });

    if (!password) {
      showToast("Password required.");
      return;
    }
  }

  showToast("Encrypting and saving...");

  try {
    const encText = await encryptText(textArea.value, password);
    const res = await fetch(`${API_BASE}/${encodeURIComponent(noteId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ encText } || {}),
    });

    if (res.ok) {
      showToast("Note saved securely.");
      noteExists = true;
      updateLastSaved();
    } else {
      showToast("Failed to save note.");
    }
  } catch (e) {
    showToast("Encryption failed.");
    console.error(e);
  }
}

function copyNote() {
  navigator.clipboard
    .writeText(textArea.value)
    .then(() => {
      showToast("Copied to clipboard!");
    })
    .catch(() => {
      showToast("Failed to copy to clipboard");
    });
}

async function deleteNote() {
  const confirmed = await showConfirmModal(
    "Delete this note permanently? This cannot be undone."
  );
  if (!confirmed) return;
  showToast("Deleting note...");

  try {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(noteId)}`, {
      method: "DELETE",
    });

    if (res.ok) {
      textArea.value = "";
      showToast("Note deleted.");
      noteExists = false;
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } else {
      showToast("Failed to delete note.");
    }
  } catch (err) {
    showToast("Error deleting note.");
    console.error(err);
  }
}

let saveTimeout;
textArea.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  if (noteExists) {
    saveTimeout = setTimeout(() => {
      saveNote();
    }, 2000);
  }
});

const themeBtn = document.getElementById("themeSwitcher");
if (themeBtn) {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-theme");
    themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
  }
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");
    const isDark = document.body.classList.contains("dark-theme");
    themeBtn.innerHTML = isDark
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    password = null;
    noteExists = false;
    textArea.value = "";
    showToast("Please enter your password to unlock the note.");
    loadNote();
  }
});

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

window.addEventListener("DOMContentLoaded", loadNote);
