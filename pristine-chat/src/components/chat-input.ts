import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

@customElement('chat-input')
export class ChatInput extends LitElement {
    @query('textarea') input!: HTMLTextAreaElement;
    @property({ type: Boolean }) disabled = false;
    @property() primaryColor = '#007bff';

    static styles = css`
    :host {
      display: flex;
      padding: 12px;
      background: white;
      border-top: 1px solid #eee;
    }
    textarea {
      flex: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 10px 15px;
      resize: none;
      font-family: inherit;
      outline: none;
    }
    textarea:focus { border-color: #aaa; }
    button {
      margin-left: 10px;
      background: none;
      border: none;
      cursor: pointer;
      color: #007bff;
      padding: 0 10px;
    }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
  `;

    handleKey(e: KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.send();
        }
    }

    send() {
        const value = this.input.value.trim();
        if (!value || this.disabled) return;

        this.dispatchEvent(new CustomEvent('send', { detail: value }));
        this.input.value = '';
    }

    render() {
        return html`
      <textarea 
        placeholder="Type a message..." 
        ?disabled=${this.disabled}
        @keydown=${this.handleKey}
      ></textarea>
      <button @click=${this.send} ?disabled=${this.disabled}>
        <svg fill="${this.primaryColor}" width="24" height="24" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
      </button>
    `;
    }
}
