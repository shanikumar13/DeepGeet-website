/* ==========================================================
   DeepGeet V5 - Main Controller
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const homeScreen = document.getElementById("homeScreen");
    const chatScreen = document.getElementById("chatScreen");
    const voiceScreen = document.getElementById("voiceScreen");

    const chatBtn = document.getElementById("chatBtn");
    const talkBtn = document.getElementById("talkBtn");
    const backBtn = document.getElementById("backBtn");
    const voiceBackBtn = document.getElementById("voiceBackBtn");

    const startOverlay = document.getElementById("startOverlay");
    const activateCompanionBtn = document.getElementById("activateCompanionBtn");

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
       Startup Overlay
    --------------------------- */
    /* --------------------------
       Cinematic 5-Phase Intro Particles & Timeline Loop
    --------------------------- */
    const introParticles = document.getElementById("introParticles");
    if (introParticles) {
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement("div");
            particle.className = "intro-particle";
            const size = Math.random() * 8 + 4;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.animationDelay = `${Math.random() * 8}s`;
            particle.style.animationDuration = `${Math.random() * 5 + 6}s`;
            introParticles.appendChild(particle);
        }
    }

    let blinkInterval = null;

    function startBlinking() {
        const eyelid = document.getElementById("eyelidOverlay");
        if (!eyelid) return;
        blinkInterval = setInterval(() => {
            // Eyelids only blink when they are not in closed/smiling state (Phases 1 & 4)
            if (startOverlay.classList.contains("phase-1") || startOverlay.classList.contains("phase-4")) {
                eyelid.classList.add("eyelid-blink");
                setTimeout(() => {
                    eyelid.classList.remove("eyelid-blink");
                }, 250);
            }
        }, Math.random() * 2000 + 2500); // Blinks every 2.5 - 4.5 seconds
    }

    // Start blinking loop immediately on load
    startBlinking();

    let introSpeechPlayed = false;
    let phase4Triggered = false;
    let safetyTimeout = null;

    function playIntroSpeech() {
        if (introSpeechPlayed) return;
        if (!startOverlay.classList.contains("phase-3")) return;
        
        introSpeechPlayed = true;
        if (typeof speak === "function") {
            speak("नमस्ते! DeepGeet AI में आपका स्वागत है।", () => {
                triggerPhase4();
            });
        }
    }

    function triggerPhase4() {
        if (phase4Triggered) return;
        phase4Triggered = true;
        
        if (safetyTimeout) clearTimeout(safetyTimeout);
        
        // Phase 4: Waving bye and walking away back into portal
        startOverlay.className = "start-overlay cinematic phase-4";
        
        // Wait 2.0s for walking exit animation
        setTimeout(() => {
            // Phase 5: Fade/Slide overlay out
            startOverlay.className = "start-overlay cinematic phase-5";
            
            // Wait for sliding transition (1.2s)
            setTimeout(() => {
                startOverlay.classList.add("hidden");
                showHome();
            }, 1200);
        }, 2000);
    }

    // Trigger speech on first interaction anywhere on page (if browser blocked autoplay)
    startOverlay?.addEventListener("click", () => {
        if (startOverlay.classList.contains("phase-3") && !introSpeechPlayed) {
            playIntroSpeech();
        }
    });

    // Run the Timeline automatically:
    // Phase 1 (Entry): Active on load (0.0s - 1.5s)
    
    // T+1.5s -> Phase 2 (Namaste Gesture & Smile)
    setTimeout(() => {
        if (phase4Triggered) return;
        startOverlay.className = "start-overlay cinematic phase-2";
        
        // T+3.0s -> Phase 3 (Says Namaste speech bubble and waveforms)
        setTimeout(() => {
            if (phase4Triggered) return;
            startOverlay.className = "start-overlay cinematic phase-3";
            
            // Attempt to autoplay audio
            playIntroSpeech();
            
            // Fallback: if speech synthesis is blocked or fails to trigger callback, proceed after 5 seconds
            safetyTimeout = setTimeout(() => {
                triggerPhase4();
            }, 5000);
            
        }, 1500);
        
    }, 1500);

    /* --------------------------
       Screen Navigation
    --------------------------- */

    function showHome() {

        homeScreen.classList.remove("hidden");
        chatScreen.classList.add("hidden");
        voiceScreen.classList.add("hidden");

    }

    function showChat() {

        homeScreen.classList.add("hidden");
        chatScreen.classList.remove("hidden");
        voiceScreen.classList.add("hidden");

        const input = document.getElementById("userInput");

        if (input) input.focus();

        // Inject initial greeting if chat is fresh and empty
        const messages = document.getElementById("chatMessages");
        if (messages && messages.children.length <= 1) {
            if (typeof speak === "function") {
                speak("Hello Buddy, New Chat Started!");
            }
        }

    }

    function showVoice() {

        homeScreen.classList.add("hidden");
        chatScreen.classList.add("hidden");
        voiceScreen.classList.remove("hidden");

        if (typeof startVoiceAssistant === "function") {
            startVoiceAssistant();
        }

    }

    function exitVoice() {

        if (typeof stopVoiceAssistant === "function") {
            stopVoiceAssistant();
        }
        showHome();

    }

    chatBtn?.addEventListener("click", showChat);

    talkBtn?.addEventListener("click", showVoice);

    backBtn?.addEventListener("click", showHome);

    voiceBackBtn?.addEventListener("click", exitVoice);

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
