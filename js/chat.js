
/* ==========================================================
   DeepGeet V5 - Chat Engine (Part 1)
   ========================================================== */

const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const skeletonLoader = document.getElementById("skeletonLoader");

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

function appendMessage(text, sender) {

    const bubble = document.createElement("div");
    bubble.className = `msg-bubble ${sender}-message`;

    const avatar = document.createElement("span");
    avatar.className = "sender-avatar";
    avatar.textContent = sender === "user" ? "👤" : "🤖";

    const content = document.createElement("div");
    content.className = "msg-content";
    renderMessageText(content, text, sender);

    bubble.appendChild(avatar);
    bubble.appendChild(content);

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

        const avatar = document.createElement("span");
        avatar.className = "sender-avatar";
        avatar.textContent =
            msg.sender === "user"
                ? "👤"
                : "🤖";

        const content = document.createElement("div");
        content.className = "msg-content";
        renderMessageText(content, msg.text, msg.sender);

        bubble.appendChild(avatar);
        bubble.appendChild(content);

        chatMessages.appendChild(bubble);

    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

}

/* -----------------------------
   Loading
--------------------------------*/

function showTyping() {

    skeletonLoader.classList.remove("hidden");

}

function hideTyping() {

    skeletonLoader.classList.add("hidden");

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

function speak(text) {

    const settings = StorageManager.loadSettings();

    if (!settings.voice) return;

    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    let plainText = text;
    if (typeof marked !== "undefined") {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = marked.parse(text);
        plainText = tempDiv.textContent || tempDiv.innerText || text;
    }

    const utterance = new SpeechSynthesisUtterance(plainText);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    speechSynthesis.speak(utterance);

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

    recognition.lang = "en-US";

    recognition.onresult = e => {

        userInput.value =
        e.results[0][0].transcript;

    };

    micBtn.onclick = () => {

        recognition.start();

    };

}

/* ---------- End ---------- */

console.log("✅ chat.js loaded successfully");