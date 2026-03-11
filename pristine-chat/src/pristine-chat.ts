import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { baseStyles } from './styles/styles';
import type { WidgetConfig } from './types/widget-config';
import { defaultConfig, mergeConfig } from './config';
import { ApiService } from './services/api.service';
import './components/chat-header';
import './components/chat-message-list';
import './components/chat-input';
import './components/chat-email-form';
import './components/chat-bubble';
import './components/chat-support-options';

interface Visitor {
    id: number;
    email: string;
    name?: string;
}

@customElement('pristine-chat')
export class PristineChat extends LitElement {
    static styles = baseStyles;

    //Initial widget config passed from website
    @property({ type: Object }) config: Partial<WidgetConfig> = {};

    @state() private _config: WidgetConfig = defaultConfig;
    @state() private isOpen = false;
    @state() private messages: any = [];
    @state() private isTyping = false;
    @state() private visitor: Visitor | null = null;
    @state() private showAutoPopup = false;
    @state() private view: 'chat' | 'support' = 'chat';
    @state() private loading = false;

    private api!: ApiService;

    async firstUpdated() {
        super.connectedCallback();
        this.initialize();
    }

    async initialize() {
        this._config = mergeConfig(defaultConfig, {}, this.config);
        this.api = new ApiService(this._config);
        console.log("Initial Config", this.config);
        try {
            const remoteConfig = await this.api.fetchConfig();
            this._config = mergeConfig(this._config, remoteConfig, this.config);

            const lastConversationTime = localStorage.getItem('lastConversationTime');
            if (lastConversationTime) {
                const lastTime = Number(lastConversationTime);
                const now = Date.now();
                let TIMEOUT = this._config.sessionTimeout ? this._config.sessionTimeout * 60 * 60 * 1000 : 60 * 60 * 1000;
                if (now - lastTime > TIMEOUT) {
                    const storedVisitor = localStorage.getItem('pristine-chat-visitor');
                    if (storedVisitor) {
                        await this.handleReset(false);
                    }
                    localStorage.clear();
                }
            }
        } catch (e) {
            console.error("Failed to fetch remote config", e);
        }

        this.loadState();

        // Apply custom colors if provided
        if (this._config.backgroundColor) {
            this.style.setProperty('--pc-bg', this._config.backgroundColor);
        }
        if (this._config.textColor) {
            this.style.setProperty('--pc-text', this._config.textColor);
        }

        // Auto-popup logic
        // If config has autoOpenDelay, respect it. Defaults to 0 or undefined.
        // We only auto-open if the user hasn't interacted with it in this session (or checks we could add).
        // The requirement: "if i load index.html after 5 seconds it should open automatically"
        // "then if i close then i should be able to open it manually".
        // This implies auto-open happens once per page load IF not already open.

        if (this._config.autoOpenDelay && this._config.autoOpenDelay > 0) {
            setTimeout(() => {
                // Check if already open to avoid overriding user closing it in the meantime?
                // User said: "load index.html after 5 seconds it should open automatically"
                // If user closes it BEFORE 5 seconds, should it still open? 
                // Usually "auto open" implies "if not already opened".
                // I'll stick to: if not open, open it.
                if (!this.isOpen) {
                    this.open();
                }
            }, this._config.autoOpenDelay);
        } else if (!this.isOpen && !localStorage.getItem('pristine-chat-interacted')) {
            // Legacy/Default logic
            setTimeout(() => {
                if (!this.isOpen) {
                    this.showAutoPopup = true;
                }
            }, 4000);
        }
    }

    async loadState() {
        // Persistence using LocalStorage
        const storedHistory = localStorage.getItem('pristine-chat-history');
        const storedVisitor = localStorage.getItem('pristine-chat-visitor');

        if (storedVisitor) {
            try {
                this.visitor = JSON.parse(storedVisitor);

                // Check if conversation is still active on server
                if (this.visitor && this.visitor.id) {
                    const chatHistory = localStorage.getItem("pristine-chat-history");
                    if (chatHistory) {
                        this.messages = JSON.parse(chatHistory)
                    }
                    this.isOpen = true;
                }
            } catch (e) { console.error(e); }
        }

        if (this.messages.length === 0 && this._config.welcomeMessage) {
            this.messages = [{ role: 'assistant', content: this._config.welcomeMessage }];
        }
    }

    saveState() {
        localStorage.setItem('pristine-chat-history', JSON.stringify(this.messages));
        localStorage.setItem('pristine-chat-interacted', 'true');
        if (this.visitor) {
            localStorage.setItem('pristine-chat-visitor', JSON.stringify(this.visitor));
        }
    }

    toggle() {
        if (this.isOpen) this.close();
        else this.open();
    }

    open() {
        this.isOpen = true;
        this.showAutoPopup = false;
        localStorage.setItem('pristine-chat-interacted', 'true');
    }

    close() {
        this.isOpen = false;
    }

    async handleEmailSubmit(e: CustomEvent) {
        const { email, name } = e.detail;
        try {
            this.loading = true;
            // Call backend to register visitor
            const response = await fetch(`${this._config.apiBaseUrl}/visitor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name })
            });

            if (!response.ok) throw new Error('Failed to register visitor');

            const visitorData = await response.json();
            this.visitor = visitorData;
            this.saveState();
            this.loading = false;
        } catch (err) {
            console.error('Visitor registration failed:', err);
            alert("Visitor registration failed");
            this.loading = false;
        }
    }

    async handleCallbackRequest(e: CustomEvent) {
        console.log("Enter in handleCallbackRequest");
        if (!this.visitor) return;
        const { name, phone, message } = e.detail;
        try {
            // Call backend to register visitor
            const response: any = await fetch(`${this._config.apiBaseUrl}/visitor/callback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitorId: this.visitor?.id, name, phone, message })
            });

            if (!response.ok) throw new Error('Failed to register visitor');

            const res = await response.json();
            console.log("res", res);

            const msgIndex = this.messages.length - 1;
            const newMessages = [...this.messages];
            newMessages[msgIndex] = { role: 'assistant', content: res?.message || 'Thanks your call back request is registered our team will call you. Thanks' };
            this.messages = newMessages;
        } catch (err) {
            console.error('Callback request failed:', err);
            this.messages = [...this.messages, { role: 'system', content: 'Error: Please try again later' }];
        }
    }

    async handleSend(e: CustomEvent) {
        const text = e.detail;
        if (!text) return;

        localStorage.setItem('lastConversationTime', Date.now().toString());
        // Ensure visitor logic
        const visitorId = this.visitor?.id;
        const email = this.visitor?.email;
        this.api.storeConversationMessage(visitorId, 'user', text);
        this.messages = [...this.messages, { role: 'user', content: text }];
        this.saveState();
        this.isTyping = true;
        try {
            await this.streamResponse(text, email, visitorId);
        } catch (err) {
            console.error(err);
            this.messages = [...this.messages, { role: 'system', content: 'Failed to send message.' }];
        } finally {
            this.isTyping = false;
            this.saveState();
        }
    }

    async streamResponse(text: string, email?: string, visitorId?: number) {
        const response = await fetch(`${this._config.apiBaseUrl}/chat/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, email, visitorId }),
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage: any = '';


        const MARKER = "followup_question";
        let mode: "message" | "followup" = "message";


        // Initialize assistant message in messages array
        this.messages.push({ role: 'assistant', content: '' });
        const msgIndex = this.messages.length - 1;

        let doneReading = false;

        // Regex to remove citation markers like 
        const citationRegex = /【\d+:\d+†source】/g;

        while (!doneReading) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;

                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                    doneReading = true;
                    break;
                }

                try {
                    const parsed = JSON.parse(data);
                    if (parsed.content) {
                        const cleanedContent = parsed.content.replace(citationRegex, '');
                        assistantMessage += cleanedContent;
                        if (mode === "message") {
                            const newMessages = [...this.messages];
                            newMessages[msgIndex] = { role: 'assistant', content: assistantMessage };
                            this.messages = newMessages;
                        }

                        // 1️⃣ Detect marker
                        if (mode === "message" && assistantMessage.includes(MARKER)) {
                            mode = "followup";
                            this.messages[msgIndex].content = this.messages[msgIndex].content.replace(MARKER, "");
                        }

                    }
                } catch (e) {
                    console.warn('Failed to parse stream chunk:', e);
                }
            }
        }

        // // Final normalization
        const { followups } = this.normalizeAssistantResponse(assistantMessage);
        if (followups?.length) {
            this.messages[msgIndex].followups = followups;
        }

        // Persist to API
        try {
            await this.api.storeConversationMessage(visitorId, 'assistant', assistantMessage);
        } catch (e) {
            console.error('Failed to store conversation message:', e);
            this.messages = [...this.messages, { role: 'system', content: 'Internal server error' }];
        }

        this.saveState();
    }

    normalizeAssistantResponse(rawText: any) {
        const SPLITTER = /followups?_question/i;
        const [messagePart, followupPart] = rawText.split(SPLITTER);
        const message = messagePart.trim();
        const followups = followupPart
            ? followupPart
                .split("\n")
                .map((line: any) =>
                    line
                        .replace(/^[\-\•\d\.\)]*/, "")
                        .trim()
                )
                .filter(Boolean)
            : [];

        return { message, followups };
    }

    async handleReset(isConfirmationRequired: boolean = true) {
        if (isConfirmationRequired && !confirm('End conversation? You cannot resume this chat.')) return;

        const visitorId = this.visitor?.id

        try {
            if (visitorId) {
                const response: any = await this.api.resetConversation(visitorId);
                if (response.status) {
                    localStorage.clear();

                    let chat: any = document.querySelector('pristine-chat');
                    if (chat) chat.remove();

                    if (!document.querySelector('pristine-chat')) {
                        chat = document.createElement('pristine-chat');
                        document.body.appendChild(chat);
                    }
                    if (chat) chat.open();
                    chat.config = this.config;
                } else {
                    alert(response?.message)
                }
            }
        } catch (e) {
            console.error('Reset failed', e);
            if (isConfirmationRequired) this.messages = [...this.messages, { role: 'system', content: 'Error: Failed to reset chat. Try again later' }];
        }
    }

    handleFollowup(e: CustomEvent) {
        const question = e.detail;
        if (!question) return;

        // Reuse EXACT same pipeline as user input
        this.handleSend({ detail: question } as CustomEvent);
    }

    render() {
        const { primaryColor, position, launcherIcon, headerTitle, headerSubtitle, width, launcherText } = this._config;

        return html`
        <div class="chat-container ${this.isOpen ? 'open' : 'closed'} pos-${position}"
            style="--pc-primary: ${primaryColor}; ${width ? `width: ${width}px;` : ''}">
            
            <chat-header 
                title="${headerTitle}" 
                subtitle="${headerSubtitle}"
                @close=${this.close}
                @reset=${this.handleReset}
                style="background: ${primaryColor}"
            >
                <button slot="actions" 
                        class="icon-btn" 
                        title="Support Options"
                        style="background:none; border:none; color:white; cursor:pointer;"
                        @click=${() => this.view = this.view === 'chat' ? 'support' : 'chat'}>
                    ${this.view === 'chat' ? '📞' : '💬'}
                </button>
            </chat-header>
            
            ${!this.visitor ? html`
                <chat-email-form 
                    primaryColor="${primaryColor}"
                    .loading="${this.loading}"
                    @submit-email=${this.handleEmailSubmit}
                ></chat-email-form>
            ` : this.view === 'support' ? html`
                <chat-support-options
                    primaryColor="${primaryColor}"
                    @callback-request=${this.handleCallbackRequest}
                ></chat-support-options>
            ` : html`
                <chat-message-list 
                    .messages=${this.messages} 
                    .typing=${this.isTyping}
                    typingText="${this._config.typingText}"
                    primaryColor="${primaryColor}"
                    @followup-selected=${this.handleFollowup}
                    @callback-submitted=${this.handleCallbackRequest}
                ></chat-message-list>
                <chat-input @send=${this.handleSend}
                primaryColor="${primaryColor}"></chat-input>
            `}
        </div>

        <div class="pos-${position}" style="position:absolute;">
            <chat-bubble
                icon="${launcherIcon}"
                color="${primaryColor}"
                launcherText=${launcherText}
                .showPopup=${this.showAutoPopup}
                @toggle=${this.toggle}
            ></chat-bubble>
        </div>
        `;
    }
}

declare global {
    interface Window {
        PristineChat: any;
    }
}

window.PristineChat = {
    init: (config: any) => {
        let chat = document.querySelector('pristine-chat') as any;
        if (!chat) {
            chat = document.createElement('pristine-chat');
            document.body.appendChild(chat);
        }
        chat.config = config;
    },
    open: () => {
        const chat = document.querySelector('pristine-chat') as any;
        if (chat) chat.open();
    },
    close: () => {
        const chat = document.querySelector('pristine-chat') as any;
        if (chat) chat.close();
    },
    destroy: () => {
        const chat = document.querySelector('pristine-chat');
        if (chat) chat.remove();
    }
};

