/* ==========================================================
   DeepGeet V5 - Main Controller
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const homeScreen = document.getElementById("homeScreen");
    const chatScreen = document.getElementById("chatScreen");

    const chatBtn = document.getElementById("chatBtn");
    const talkBtn = document.getElementById("talkBtn");
    const backBtn = document.getElementById("backBtn");

    const sidebar = document.getElementById("sidebar");
    const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
    const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");

    const settingsBtn = document.getElementById("settingsBtn");
    const settingsModal = document.getElementById("settingsModal");
    const closeSettingsBtn = document.getElementById("closeSettingsBtn");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");

    const voiceToggle = document.getElementById("voiceToggle");
    const themeSelector = document.getElementById("themeSelector");
    const modelSelector = document.getElementById("modelSelector");

    /* --------------------------
       Screen Navigation
    --------------------------- */

    function showHome() {

        homeScreen.classList.remove("hidden");
        chatScreen.classList.add("hidden");

    }

    function showChat() {

        homeScreen.classList.add("hidden");
        chatScreen.classList.remove("hidden");

        const input = document.getElementById("userInput");

        if (input) input.focus();

    }

    chatBtn?.addEventListener("click", showChat);

    talkBtn?.addEventListener("click", showChat);

    backBtn?.addEventListener("click", showHome);

    /* --------------------------
       Sidebar
    --------------------------- */

    sidebarToggleBtn?.addEventListener("click", () => {

        sidebar.classList.toggle("collapsed");

    });

    sidebarCloseBtn?.addEventListener("click", () => {

        sidebar.classList.add("collapsed");

    });

    /* --------------------------
       Settings
    --------------------------- */

    const settings = StorageManager.loadSettings();

    voiceToggle.checked = settings.voice;
    themeSelector.value = settings.theme;
    modelSelector.value = settings.model;

    settingsBtn?.addEventListener("click", () => {

        settingsModal.classList.remove("hidden");

    });

    closeSettingsBtn?.addEventListener("click", () => {

        settingsModal.classList.add("hidden");

    });

    saveSettingsBtn?.addEventListener("click", () => {

        const updated = {

            voice: voiceToggle.checked,

            theme: themeSelector.value,

            model: modelSelector.value

        };

        StorageManager.saveSettings(updated);

        document.body.dataset.theme = updated.theme;

        settingsModal.classList.add("hidden");

    });

    /* --------------------------
       Click Outside Modal
    --------------------------- */

    settingsModal?.addEventListener("click", e => {

        if (e.target === settingsModal) {

            settingsModal.classList.add("hidden");

        }

    });

    /* --------------------------
       Theme
    --------------------------- */

   document.body.dataset.theme = settings.theme;

/* Initial Screen */
showHome();

console.log("✅ DeepGeet V5 Ready");

});
