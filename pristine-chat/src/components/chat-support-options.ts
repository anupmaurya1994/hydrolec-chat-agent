import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('chat-support-options')
export class ChatSupportOptions extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 15px;
            border-top: 1px solid #eee;
        }
        h4 {
            margin: 0 0 10px 0;
            font-size: 0.9rem;
            color: #333;
        }
        .buttons {
            display: flex;
            gap: 10px;
        }
        button {
            flex: 1;
            padding: 8px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }
        button:hover {
            background: #f8f9fa;
            border-color: #ccc;
        }
        .callback-form {
            margin-top: 10px;
            animation: slideDown 0.2s;
        }
        input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-bottom: 5px;
            box-sizing: border-box;
        }
        .submit-btn {
            width: 100%;
            background: var(--pc-primary, #007bff);
            color: white;
            border: none;
        }
        .submit-btn:hover {
             background: var(--pc-primary-dark, #0056b3);
        }
        @keyframes slideDown {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .success { color: green; font-size: 0.9rem; }
        .error { color: #dc3545; font-size: 0.9rem; }
    `;

    @property() primaryColor = '#007bff';
    @property() supportPhone = '1-800-HYDROLEC';

    @state() mode: 'menu' | 'callback' = 'menu';
    @state() phone = '';
    @state() status: 'idle' | 'submitting' | 'success' | 'error' = 'idle';

    private handleCallbackRequest() {
        if (!this.phone) return;
        this.status = 'submitting';

        this.dispatchEvent(new CustomEvent('callback-request', {
            detail: { phone: this.phone },
            bubbles: true,
            composed: true
        }));

        // Parent handles the API call and sets status? 
        // Or we just emit and assume success for UI mock?
        // Let's assume parent sets prop or we just simulate for now if logic is elsewhere.
        // Actually best ensures parent handles it.
    }

    public setStatus(s: 'idle' | 'submitting' | 'success' | 'error') {
        this.status = s;
        if (s === 'success') {
            setTimeout(() => { this.mode = 'menu'; this.status = 'idle'; }, 3000);
        }
    }

    render() {
        if (this.mode === 'menu') {
            return html`
                <h4>Follow-up Options</h4>
                <div class="buttons">
                    <button @click=${() => this.mode = 'callback'}>Request Callback</button>
                    <button @click=${() => alert(`Call us at ${this.supportPhone}`)}>Call Support</button>
                </div>
            `;
        }

        return html`
            <div class="callback-form" style="--pc-primary: ${this.primaryColor}">
                <h4>Request Callback</h4>
                ${this.status === 'success' ? html`<div class="success">Request sent! We'll call you shortly.</div>` :
                this.status === 'error' ? html`<div class="error">Failed to send request.</div>` : html`
                    <p style="font-size:0.8rem; margin:0 0 5px 0;">Enter your number:</p>
                    <input 
                        type="tel" 
                        .value=${this.phone} 
                        @input=${(e: any) => this.phone = e.target.value}
                        placeholder="+1 (555) ..."
                    >
                    <div class="buttons">
                        <button @click=${() => this.mode = 'menu'}>Cancel</button>
                        <button class="submit-btn" @click=${this.handleCallbackRequest} ?disabled=${this.status === 'submitting'}>
                            ${this.status === 'submitting' ? 'Sending...' : 'Submit'}
                        </button>
                    </div>
                `}
            </div>
        `;
    }
}
