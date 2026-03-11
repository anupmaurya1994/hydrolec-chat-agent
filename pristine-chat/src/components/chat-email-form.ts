import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('chat-email-form')
export class ChatEmailForm extends LitElement {
    static styles = css`
        :host {
            background: rgb(255, 255, 255);
            display: block;
            padding: 20px;
            height: 100vh;
            font-family: inherit;
        }
        h3 {
            margin-top: 0;
            color: #333;
        }
        p {
            font-size: 0.9rem;
            color: #666;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 15px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        input {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            box-sizing: border-box;
            font-size: 1rem;
        }
        input:focus {
            outline: none;
            border-color: var(--pc-primary, #007bff);
        }
        button {
            width: 100%;
            padding: 10px;
            background: var(--pc-primary, #007bff);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 1rem;
            cursor: pointer;
            font-weight: 500;
            transition: opacity 0.2s;
        }
        button:hover {
            opacity: 0.9;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .error {
            color: #dc3545;
            font-size: 0.8rem;
            margin-top: 5px;
        }
    `;

    @property() primaryColor = '#007bff';
    @property({ type: Boolean }) loading = false;
    @state() email = '';
    @state() name = '';
    @state() error = '';

    private handleSubmit(e: Event) {
        e.preventDefault();

        // Basic validation
        if (!this.email || !this.email.includes('@')) {
            this.error = 'Please enter a valid business email address.';
            return;
        }

        // Ideally check for business email (not gmail/yahoo/etc) but maybe just enforcing format is enough for now.
        this.error = '';

        this.dispatchEvent(new CustomEvent('submit-email', {
            detail: { email: this.email, name: this.name },
            bubbles: true,
            composed: true
        }));
    }

    render() {
        return html`
            <form @submit=${this.handleSubmit} style="--pc-primary: ${this.primaryColor}">
                <h3>Welcome! 👋</h3>
                <p>Please provide your email to connect with Agent Kim.</p>
                
                <div class="form-group">
                    <label for="name">Name (Optional)</label>
                    <input 
                        type="text" 
                        id="name" 
                        .value=${this.name} 
                        @input=${(e: any) => this.name = e.target.value}
                        placeholder="John Doe"
                    >
                </div>

                <div class="form-group">
                    <label for="email">Business Email *</label>
                    <input 
                        type="email" 
                        id="email" 
                        required
                        .value=${this.email} 
                        @input=${(e: any) => this.email = e.target.value}
                        placeholder="john@company.com"
                    >
                    ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                </div>

                <button type="submit" ?disabled=${this.loading}>
                    ${this.loading ? 'Connecting...' : 'Start Chat'}
                </button>
            </form>
        `;
    }
}
