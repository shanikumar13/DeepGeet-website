
/* ==========================================================
   DeepGeet V5 - Chat Engine (Part 1)
   ========================================================== */

const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatTypingIndicator = document.getElementById("chatTypingIndicator");

let chatHistory = StorageManager.loadChatHistory();

/* -----------------------------
   Add Message
--------------------------------*/

function renderMessageText(contentDiv, text, sender) {
    if (sender === "bot" && typeof marked !== "undefined") {
        contentDiv.innerHTML = marked.parse(text);
        
        if (typeof hljs !== "undefined") {
            contentDiv.querySelectorAll("pre code").forEach((block) => {
                hljs.highlightElement(block);
            });
            
            contentDiv.querySelectorAll("pre").forEach((pre) => {
                pre.style.position = "relative";
                const code = pre.querySelector("code");
                if (!code) return;
                
                const copyBtn = document.createElement("button");
                copyBtn.className = "copy-code-btn";
                copyBtn.innerHTML = "📋 Copy";
                
                copyBtn.addEventListener("click", async () => {
                    try {
                        await navigator.clipboard.writeText(code.innerText);
                        copyBtn.innerHTML = "✅ Copied!";
                        setTimeout(() => {
                            copyBtn.innerHTML = "📋 Copy";
                        }, 2000);
                    } catch (err) {
                        console.error("Failed to copy!", err);
                    }
                });
                
                pre.appendChild(copyBtn);
            });
        }
    } else {
        contentDiv.textContent = text;
    }
}

function createAvatar(sender) {
    if (sender === "user") {
        const avatar = document.createElement("span");
        avatar.className = "user-avatar-icon";
        avatar.textContent = "👤";
        return avatar;
    } else {
        const wrapper = document.createElement("div");
        wrapper.className = "chat-avatar-wrapper";
        const img = document.createElement("img");
        img.className = "chat-avatar";
        img.src = "assets/images/neocat.jpg";
        img.alt = "DeepGeet";
        wrapper.appendChild(img);
        return wrapper;
    }
}

function createBubbleVoicePlayer(text) {
    const player = document.createElement("div");
    player.className = "bubble-voice-player";
    player.dataset.text = text;

    const playBtn = document.createElement("button");
    playBtn.className = "bubble-play-btn";
    playBtn.innerHTML = "▶️";
    playBtn.setAttribute("aria-label", "Play voice response");

    const wave = document.createElement("div");
    wave.className = "bubble-voice-wave";
    for (let i = 0; i < 10; i++) {
        const line = document.createElement("span");
        line.className = "v-line";
        wave.appendChild(line);
    }

    player.appendChild(playBtn);
    player.appendChild(wave);

    playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (player.classList.contains("playing")) {
            speechSynthesis.cancel();
        } else {
            speechSynthesis.cancel();
            
            speak(text, () => {
                player.classList.remove("playing");
                playBtn.innerHTML = "▶️";
            });
        }
    });

    return player;
}

function appendMessage(text, sender) {

    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${sender}-message`;

    const avatar = createAvatar(sender);

    const content = document.createElement("div");
    content.className = "msg-content";
    renderMessageText(content, text, sender);

    bubble.appendChild(avatar);
    bubble.appendChild(content);

    // Append audio player inside bot message bubble
    if (sender === "bot") {
        const player = createBubbleVoicePlayer(text);
        content.appendChild(player);
    }

    chatMessages.appendChild(bubble);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatHistory.push({
        sender,
        text,
        time: Date.now()
    });

    StorageManager.saveChatHistory(chatHistory);

}

/* -----------------------------
   Restore History
--------------------------------*/

function loadHistory() {

    chatMessages.innerHTML = "";

    if (chatHistory.length === 0) {

        appendMessage(
            "👋 Hello Buddy! Welcome to DeepGeet AI.",
            "bot"
        );

        return;
    }

    chatHistory.forEach(msg => {

        const bubble = document.createElement("div");
        bubble.className = `msg-bubble ${msg.sender}-message`;

        const avatar = createAvatar(msg.sender);

        const content = document.createElement("div");
        content.className = "msg-content";
        renderMessageText(content, msg.text, msg.sender);

        bubble.appendChild(avatar);
        bubble.appendChild(content);

        // Append audio player inside bot message bubble
        if (msg.sender === "bot") {
            const player = createBubbleVoicePlayer(msg.text);
            content.appendChild(player);
        }

        chatMessages.appendChild(bubble);

    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

/* -----------------------------
   Loading
--------------------------------*/

function showTyping() {

    chatTypingIndicator.classList.remove("hidden");
    chatMessages.scrollTop = chatMessages.scrollHeight;

}

function hideTyping() {

    chatTypingIndicator.classList.add("hidden");

}

/* -----------------------------
   Send
--------------------------------*/

function sendMessage() {

    const message = userInput.value.trim();

    if (!message) return;

    appendMessage(message, "user");

    userInput.value = "";

    showTyping();

    processAssistantReply(message);

}

sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keydown", e => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

loadHistory();

/* ==========================================================
   DeepGeet V5 - Chat Engine (Part 2)
   AI Reply + API + Offline Fallback
   ========================================================== */

async function processAssistantReply(userText) {

    try {

        const status = document.getElementById("statusIndicator");

        if (status) {
            status.textContent = "Thinking...";
            status.className = "status-indicator typing-status";
        }

        const settings = StorageManager.loadSettings();
        const isLocalFile = window.location.protocol === "file:";
        const apiBase = isLocalFile ? "http://localhost:3000" : "";

        const response = await fetch(`${apiBase}/api/chat`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: userText,
                model: settings.model
            })

        });

        if (!response.ok) {

            throw new Error("Backend unavailable");

        }

        const data = await response.json();

        hideTyping();

        appendMessage(data.reply, "bot");

    }

    catch (err) {

        console.warn("Offline Mode", err);

        offlineReply(userText);

    }

    finally {

        const status = document.getElementById("statusIndicator");

        if (status) {

            status.textContent = "Online";
            status.className = "status-indicator online";

        }

    }

}

/* -----------------------------
   Offline AI
--------------------------------*/

function offlineReply(text) {

    const msg = text.toLowerCase().trim();

    let reply = "";

    if (
        msg.includes("hi") ||
        msg.includes("hello") ||
        msg.includes("hey")
    ) {

        reply =
            "👋 Hello Buddy! Main DeepGeet AI hoon. Kaise help kar sakta hoon?";

    }

    else if (
        msg.includes("how are you")
    ) {

        reply =
            "😊 Main bilkul theek hoon. Aap kaise ho?";

    }

    else if (
        msg.includes("who are you")
    ) {

        reply =
            "🤖 Main DeepGeet AI hoon. Aapka personal AI assistant.";

    }

    else {

        reply =
            "⚠️ Backend connect nahi hai. Abhi Offline Mode chal raha hai.";

    }

    setTimeout(() => {

        hideTyping();

        appendMessage(reply, "bot");

    }, 800);

}

/* ==========================================================
   DeepGeet V5 - Chat Engine (Part 3)
   ========================================================== */

/* ---------- Voice Reply ---------- */

let currentAudio = null;

function speak(text, onEndCallback = null) {

    const settings = StorageManager.loadSettings();

    if (!settings.voice) {
        if (onEndCallback) onEndCallback();
        return;
    }

    // Cancel current audio if playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    let plainText = text;
    if (typeof marked !== "undefined") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = marked.parse(text);
        plainText = tempDiv.textContent || tempDiv.innerText || text;
    }

    // Determine language (Hindi vs English)
    const isHindi = /[\u0900-\u097F]/.test(plainText);
    const lang = isHindi ? "hi-IN" : "en-US";

    // Request speech from backend API
    const isLocalFile = window.location.protocol === "file:";
    const apiBase = isLocalFile ? "http://localhost:3000" : "";
    const audioUrl = `${apiBase}/api/tts?text=${encodeURIComponent(plainText)}&lang=${lang}`;

    const audio = new Audio(audioUrl);
    currentAudio = audio;

    // Speaking Animations (Header & Voice Screen)
    const speakingVis = document.getElementById("speakingVisualizer");
    const stopVoiceBtn = document.getElementById("stopVoiceBtn");
    const voiceStopBtn = document.getElementById("voiceStopBtn");
    const voiceMascotContainer = document.querySelector(".voice-mascot-container");
    const voiceWaveform = document.getElementById("voiceWaveform");

    const cleanupSpeakingVisuals = () => {
        speakingVis?.classList.add("hidden");
        stopVoiceBtn?.classList.add("hidden");
        voiceStopBtn?.classList.add("hidden");
        voiceMascotContainer?.classList.remove("speaking");
        voiceWaveform?.classList.add("hidden");

        // Stop all bubble visualizers
        document.querySelectorAll(".bubble-voice-player").forEach(p => {
            p.classList.remove("playing");
            const btn = p.querySelector(".bubble-play-btn");
            if (btn) btn.innerHTML = "▶️";
        });
    };

    audio.onplay = () => {
        speakingVis?.classList.remove("hidden");
        stopVoiceBtn?.classList.remove("hidden");
        voiceStopBtn?.classList.remove("hidden");
        voiceMascotContainer?.classList.add("speaking");
        voiceWaveform?.classList.remove("hidden");

        // Sync visualizer on corresponding message bubble
        const players = document.querySelectorAll(".bubble-voice-player");
        if (players.length > 0) {
            const activePlayer = Array.from(players).find(p => p.dataset.text === text);
            const targetPlayer = activePlayer || players[players.length - 1];
            targetPlayer.classList.add("playing");
            const btn = targetPlayer.querySelector(".bubble-play-btn");
            if (btn) btn.innerHTML = "⏸️";
        }
    };

    audio.onended = () => {
        cleanupSpeakingVisuals();
        currentAudio = null;
        if (onEndCallback) onEndCallback();
    };

    audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        cleanupSpeakingVisuals();
        currentAudio = null;
        if (onEndCallback) onEndCallback();
    };

    audio.play().catch(err => {
        console.warn("Audio play blocked by browser autoplay policy, waiting for user gesture:", err);
        cleanupSpeakingVisuals();
        if (onEndCallback) onEndCallback();
    });
}

/* ---------- Override appendMessage ---------- */

const originalAppend = appendMessage;

appendMessage = function (text, sender) {

    originalAppend(text, sender);

    if (sender === "bot") {

        speak(text);

    }

};

/* ---------- Clear History ---------- */

const clearBtn = document.getElementById("clearAllBtn");

if (clearBtn) {

    clearBtn.addEventListener("click", () => {

        if (!confirm("Clear all chat history?")) return;

        StorageManager.clearChatHistory();

        chatHistory = [];

        chatMessages.innerHTML = "";

        appendMessage(
            "👋 Hello Buddy! Chat history cleared.",
            "bot"
        );

    });

}

/* ---------- New Chat ---------- */

const newChatBtn = document.getElementById("newChatBtn");

if (newChatBtn) {

    newChatBtn.addEventListener("click", () => {

        chatMessages.innerHTML = "";

        chatHistory = [];

        StorageManager.saveChatHistory(chatHistory);

        appendMessage(
            "👋 Hello Buddy! New chat started.",
            "bot"
        );

    });

}

/* ---------- File Upload ---------- */

const attachBtn = document.getElementById("attachBtn");
const fileInput = document.getElementById("fileInput");

if (attachBtn && fileInput) {

    attachBtn.onclick = () => fileInput.click();

    fileInput.onchange = () => {

        if (!fileInput.files.length) return;

        appendMessage(
            "📂 File Selected : " +
            fileInput.files[0].name,
            "user"
        );

    };

}

/* ---------- Input Mic ---------- */

const micBtn = document.getElementById("inputMicBtn");

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

if (micBtn && SpeechRecognition) {

    const recognition = new SpeechRecognition();

    recognition.lang = "hi-IN"; // Set language to Hinglish/Hindi compatible

    recognition.onstart = () => {
        micBtn.classList.add("listening-mode");
    };

    recognition.onend = () => {
        micBtn.classList.remove("listening-mode");
    };

    recognition.onerror = () => {
        micBtn.classList.remove("listening-mode");
    };

    recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        userInput.value = transcript;
        
        // Auto-send voice input
        setTimeout(() => {
            if (userInput.value.trim() === transcript) {
                sendMessage();
            }
        }, 800);
    };

    micBtn.onclick = () => {
        try {
            recognition.start();
        } catch (err) {
            recognition.stop();
        }
    };

}

/* ---------- Continuous Voice Loop & Voice Companion Screen Logic ---------- */

let voiceAssistantActive = false;
let voiceRecognition = null;

function startVoiceAssistant() {
    voiceAssistantActive = true;
    
    const voiceStatusText = document.getElementById("voiceStatusText");
    const voiceSubtitleText = document.getElementById("voiceSubtitleText");
    const voiceMascotContainer = document.querySelector(".voice-mascot-container");
    
    if (voiceStatusText) voiceStatusText.textContent = "Waking up...";
    if (voiceSubtitleText) voiceSubtitleText.textContent = "Connecting to companion...";
    if (voiceMascotContainer) {
        voiceMascotContainer.classList.remove("listening");
        voiceMascotContainer.classList.add("speaking");
    }
    
    speak("Hello Buddy! Main taiyaar hoon. Kuch bhi boliye, main sunn raha hoon!", () => {
        if (voiceAssistantActive) {
            startListeningLoop();
        }
    });
}

function stopVoiceAssistant() {
    voiceAssistantActive = false;
    speechSynthesis.cancel();
    if (voiceRecognition) {
        voiceRecognition.abort();
    }
    
    const voiceStatusText = document.getElementById("voiceStatusText");
    const voiceSubtitleText = document.getElementById("voiceSubtitleText");
    const voiceMascotContainer = document.querySelector(".voice-mascot-container");
    
    if (voiceStatusText) voiceStatusText.textContent = "Sleeping...";
    if (voiceSubtitleText) voiceSubtitleText.textContent = "Tap the mic to talk with me!";
    if (voiceMascotContainer) {
        voiceMascotContainer.classList.remove("speaking", "listening");
    }
}

function startListeningLoop() {
    if (!voiceAssistantActive) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }
    
    if (!voiceRecognition) {
        voiceRecognition = new SpeechRecognition();
        voiceRecognition.lang = "hi-IN"; // Mixed Hindi/English speech friendly
        
        voiceRecognition.onstart = () => {
            const voiceStatusText = document.getElementById("voiceStatusText");
            const voiceMascotContainer = document.querySelector(".voice-mascot-container");
            const voiceMicBtn = document.getElementById("voiceMicBtn");
            
            if (voiceStatusText) voiceStatusText.textContent = "Listening...";
            if (voiceMascotContainer) {
                voiceMascotContainer.classList.remove("speaking");
                voiceMascotContainer.classList.add("listening");
            }
            if (voiceMicBtn) voiceMicBtn.classList.add("listening-mode");
        };
        
        voiceRecognition.onend = () => {
            const voiceMicBtn = document.getElementById("voiceMicBtn");
            const voiceMascotContainer = document.querySelector(".voice-mascot-container");
            if (voiceMicBtn) voiceMicBtn.classList.remove("listening-mode");
            if (voiceMascotContainer) voiceMascotContainer.classList.remove("listening");
        };
        
        voiceRecognition.onerror = (e) => {
            console.error("Speech recognition error", e);
            if (voiceAssistantActive) {
                // Restart listening after a tiny cooldown on timeout
                setTimeout(startListeningLoop, 1000);
            }
        };
        
        voiceRecognition.onresult = async (e) => {
            const transcript = e.results[0][0].transcript;
            
            const voiceSubtitleText = document.getElementById("voiceSubtitleText");
            const voiceStatusText = document.getElementById("voiceStatusText");
            
            if (voiceSubtitleText) voiceSubtitleText.textContent = `You: "${transcript}"`;
            if (voiceStatusText) voiceStatusText.textContent = "Thinking...";
            
            voiceRecognition.abort();
            
            try {
                const settings = StorageManager.loadSettings();
                const isLocalFile = window.location.protocol === "file:";
                const apiBase = isLocalFile ? "http://localhost:3000" : "";
                
                const response = await fetch(`${apiBase}/api/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: transcript,
                        model: settings.model
                    })
                });
                
                if (!response.ok) throw new Error("Backend offline");
                
                const data = await response.json();
                
                if (!voiceAssistantActive) return;
                
                if (voiceStatusText) voiceStatusText.textContent = "Speaking...";
                if (voiceSubtitleText) voiceSubtitleText.textContent = `DeepGeet: "${data.reply}"`;
                
                speak(data.reply, () => {
                    if (voiceAssistantActive) {
                        startListeningLoop();
                    }
                });
                
            } catch (err) {
                console.error(err);
                if (voiceStatusText) voiceStatusText.textContent = "Offline Mode";
                if (voiceSubtitleText) voiceSubtitleText.textContent = "Error: Companion offline. Reconnecting...";
                
                const offlineResponse = "⚠️ Backend offline hai. Apne local server connection ko test karein.";
                speak(offlineResponse, () => {
                    if (voiceAssistantActive) {
                        setTimeout(startListeningLoop, 2000);
                    }
                });
            }
        };
    }
    
    try {
        voiceRecognition.start();
    } catch (err) {
        console.warn("Recognition already started:", err);
    }
}

/* ---------- Voice Controls and Stop Listeners ---------- */
const voiceMicBtn = document.getElementById("voiceMicBtn");
const voiceStopBtn = document.getElementById("voiceStopBtn");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");

if (voiceMicBtn) {
    voiceMicBtn.addEventListener("click", () => {
        if (voiceMicBtn.classList.contains("listening-mode")) {
            if (voiceRecognition) voiceRecognition.abort();
            const voiceStatusText = document.getElementById("voiceStatusText");
            if (voiceStatusText) voiceStatusText.textContent = "Paused";
        } else {
            startListeningLoop();
        }
    });
}

const cancelAllSpeech = () => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    speechSynthesis.cancel();
    if (voiceRecognition) voiceRecognition.abort();
    
    const voiceStatusText = document.getElementById("voiceStatusText");
    const voiceSubtitleText = document.getElementById("voiceSubtitleText");
    const voiceMascotContainer = document.querySelector(".voice-mascot-container");
    
    if (voiceStatusText) voiceStatusText.textContent = "Stopped";
    if (voiceMascotContainer) {
        voiceMascotContainer.classList.remove("speaking", "listening");
    }
    
    const speakingVis = document.getElementById("speakingVisualizer");
    const stopVoiceBtnEl = document.getElementById("stopVoiceBtn");
    const voiceStopBtnEl = document.getElementById("voiceStopBtn");
    const voiceWaveform = document.getElementById("voiceWaveform");

    speakingVis?.classList.add("hidden");
    stopVoiceBtnEl?.classList.add("hidden");
    voiceStopBtnEl?.classList.add("hidden");
    voiceWaveform?.classList.add("hidden");
};

if (voiceStopBtn) {
    voiceStopBtn.addEventListener("click", cancelAllSpeech);
}
if (stopVoiceBtn) {
    stopVoiceBtn.addEventListener("click", cancelAllSpeech);
}

// Global functions exposure
window.startVoiceAssistant = startVoiceAssistant;
window.stopVoiceAssistant = stopVoiceAssistant;
window.speak = speak;

/* ---------- End ---------- */

console.log("✅ chat.js loaded successfully");