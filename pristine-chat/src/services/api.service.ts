import { WidgetConfig } from '../types/widget-config';

export class ApiService {
    constructor(private config: WidgetConfig) { }

    async fetchConfig(): Promise<Partial<WidgetConfig>> {
        try {
            const url = new URL(`${this.config.apiBaseUrl}/widget/config`);
            if (this.config.tenantId) {
                url.searchParams.append('tenantId', this.config.tenantId);
            }

            const res = await fetch(url.toString());
            if (!res.ok) throw new Error('Failed to fetch config');
            return await res.json();
        } catch (err) {
            console.warn('Failed to load remote config:', err);
            return {};
        }
    }

    async storeConversationMessage(visitorId: number | undefined, sender: string, message: string) {
        await fetch(`${this.config.apiBaseUrl}/chat/store-conversation-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId, sender, message })
        });
    }

    async resetConversation(visitorId: number) {
        const res = await fetch(`${this.config.apiBaseUrl}/chat/reset`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorId })
        });

        if (!res.ok) return { active: false };
        return await res.json();
    }

    async checkStatus(visitorId?: number) {
        const url = new URL(`${this.config.apiBaseUrl}/chat/status/${visitorId}`);
        const res = await fetch(url.toString());
        if (!res.ok) return { active: false };
        return await res.json();
    }

    async getMessages(conversationId: number) {
        const res = await fetch(`${this.config.apiBaseUrl}/conversations/${conversationId}/messages`);
        if (!res.ok) return [];
        return await res.json();
    }

    // Streaming is handled directly in the component via EventSource or fetch reader
}
