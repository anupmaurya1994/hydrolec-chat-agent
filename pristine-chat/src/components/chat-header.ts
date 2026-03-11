import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('chat-header')
export class ChatHeader extends LitElement {
  @property() title = 'Chat';
  @property() subtitle = '';
  @property() primaryColor = '#007bff';

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      padding: 5px 20px;
      color: white;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h2 { margin: 0; font-size: 1.1rem; }
    p { margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9; }
    .actions { display: flex; align-items: center; gap: 8px; }
    .icon-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1.5rem;
      padding: 4px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.1); }
    .icon-btn svg { width: 20px; height: 20px; }
  `;

  render() {
    return html`
      <div class="header-top">
        <div style="display:flex;gap:5px;align-items:center;">
            <span style="padding:8px;background:#ffffff33;line-height: 0;border-radius: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles h-4 w-4"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"></path><path d="M20 3v4"></path><path d="M22 5h-4"></path><path d="M4 17v2"></path><path d="M5 18H3"></path></svg>
            </span>
          <div style="display:flex;flex-direction:column;">
             <h2 style="font-size:14px;">${this.title}</h2>
             ${this.subtitle ? html`<p style="font-size:12px;margin:0px;">${this.subtitle}</p>` : ''}
          </div>
        </div>
        <div class="actions">
            <button class="icon-btn" title="End Conversation" @click=${() => this.dispatchEvent(new CustomEvent('reset'))}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
            <button class="icon-btn" @click=${() => this.dispatchEvent(new CustomEvent('close'))}>&times;</button>
        </div>
      </div>
    `;
  }
}
