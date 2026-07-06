
/* ==========================================================
   DeepGeet V5 - Local Storage Manager
   ========================================================== */

const StorageManager = {

    SETTINGS_KEY: "deepgeet_v5_settings",
    CHAT_KEY: "deepgeet_v5_chat_history",

    defaultSettings: {
        voice: true,
        theme: "cyberpunk",
        model: "llama-3.3-70b-versatile"
    },

    loadSettings() {

        const saved = localStorage.getItem(this.SETTINGS_KEY);

        if (!saved) {
            return this.defaultSettings;
        }

        try {
            return JSON.parse(saved);
        } catch (e) {
            return this.defaultSettings;
        }

    },

    saveSettings(settings) {

        localStorage.setItem(
            this.SETTINGS_KEY,
            JSON.stringify(settings)
        );

    },

    loadChatHistory() {

        const saved = localStorage.getItem(this.CHAT_KEY);

        if (!saved) {
            return [];
        }

        try {
            return JSON.parse(saved);
        } catch (e) {
            return [];
        }

    },

    saveChatHistory(messages) {

        localStorage.setItem(
            this.CHAT_KEY,
            JSON.stringify(messages)
        );

    },

    clearChatHistory() {

        localStorage.removeItem(this.CHAT_KEY);

    }

};

window.StorageManager = StorageManager;