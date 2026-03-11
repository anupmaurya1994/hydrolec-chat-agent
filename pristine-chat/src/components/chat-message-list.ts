import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import DOMPurify from 'dompurify';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  followups?: string[];
}

@customElement('chat-message-list')
export class ChatMessageList extends LitElement {
  @property({ type: Array }) messages: Message[] = [];
  @property() primaryColor = '#007bff';
  @property() assistantIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot h-4 w-4 text-primary"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>`;
  @property() userIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user h-4 w-4 text-primary"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
  @property({ type: Boolean }) typing = false;
  @property() typingText = 'Agent is typing...';
  @property({ type: Boolean }) showCallbackForm = false;
  @property({ type: Boolean }) showSupportInfo = false;
  @state() error = '';

  static styles = css`
    :host {
      display: block;
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8f9fa;
    }

    /* ---------------- MESSAGES ---------------- */

    .message {
      display:flex;
      flex-direction:column;
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.95rem;
      line-height: 1.4;
      word-wrap: break-word;
    }

    .user {
      margin-left: auto;
      background: var(--msg-user-bg, #007bff);
      color: #fff;
      border-bottom-right-radius: 2px;
    }

    .assistant {
      margin-right: auto;
      background: #fff;
      color: #333;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 2px;
    }

    .typing {
      font-style: italic;
      color: #666;
      font-size: 0.8rem;
      margin-top: 6px;
      margin-bottom: 20px;
    }

    .message p { margin: 0 0 8px; }
    .message p:last-child { margin: 0; }

    .message code {
      background: rgba(0,0,0,0.08);
      padding: 2px 4px;
      border-radius: 4px;
    }

    .message pre {
      background: #333;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      overflow-x: auto;
    }

    /* ---------------- FOLLOWUPS ---------------- */

    .followups {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .followup-btn {
      background: #f1f3f5;
      border: 1px solid #dee2e6;
      border-radius: 16px;
      padding: 4px 12px;
      font-size: 14px;
      cursor: pointer;
      color: inherit;
      text-align: left;
      line-height: inherit;
    }

    .followup-btn:hover {
      background: #e9ecef;
    }

    /* ---------------- CALLBACK FORM ---------------- */

    .callback-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;

      margin-top: 14px;
      padding: 16px;

      background: #e9f7ef;
      border: 1px solid #c3e6cb;
      border-radius: 10px;
      font-family:inherit;
    }

    .callback-form .form-title {
      margin: 0 0 6px;
      font-size: 1.05rem;
      font-weight: 600;
      color: #155724;
    }

    .callback-form label {
      width: 100%;
      max-width: 320px;
      gap: 4px;
      font-weight: 500;
      color: #155724;
      font-family:inherit;
    }

    .callback-form input,
    .callback-form textarea {
      padding: 10px 12px;
      border-radius: 6px;
      border: 1px solid #ced4da;
      background: #fff;
      outline: none;
      font-family:inherit;
    }

    .callback-form input:focus,
    .callback-form textarea:focus {
      border-color: #28a745;
      box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.15);
    }

    .callback-form textarea {
      resize: vertical;
      min-height: 80px;
    }

    .callback-form button {
      width: 100%;
      max-width: 320px;
      height: 30px;

      background: #28a745;
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;

      border: none;
      border-radius: 6px;
      cursor: pointer;

      transition: background 0.15s ease, transform 0.05s ease;
    }

    .callback-form button:hover {
      background: #218838;
    }

    .callback-form button:active {
      transform: translateY(1px);
    }
    .error {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 5px;
    }
    .message-icon{
      line-height: 0;
      background: #00a35a1a;
      padding: 8px;
      border-radius: 8px;
    }
    .red{
      color:#dc3545;
    }
  `;

private isFirst = true;
  private oldScrollHeight = 0;
  firstUpdated() {
    this.scrollTop = this.scrollHeight;
  }
  updated(changedProps: Map<string, unknown>) {
    if (changedProps.has('showSupportInfo') || changedProps.has('showCallbackForm')) {
      this.scrollTop = this.scrollHeight;
    }
 
    if (this.typing) {
 
      if (this.isFirst) {
        this.oldScrollHeight = this.scrollHeight;
        this.isFirst = false;
      }
 
      if (this.scrollHeight <= this.oldScrollHeight + 375) {
        this.scrollTop = this.scrollHeight;
      }
 
    } else {
      // reset when typing stops
      this.isFirst = true;
    }
 
  }
  renderMarkdown(content: string) {
    const clean = DOMPurify.sanitize(content);
    return unsafeHTML(clean.replace(/\n/g, '<br>'));
  }

  private onFollowupClick(question: string) {
    this.dispatchEvent(new CustomEvent('followup-selected', {
      detail: question,
      bubbles: true,
      composed: true
    }));
  }

  private onSpecialClick(action: string) {
    if (action === 'Request Callback') {
      this.showCallbackForm = !this.showCallbackForm;
      this.showSupportInfo = false;
    }

    if (action === 'Contact Customer') {
      this.showSupportInfo = !this.showSupportInfo;
      this.showCallbackForm = false;
    }
  }

  private submitCallbackForm(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;

    const data = {
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value
    };


    const phoneRegex = /^[0-9+\-\s]{7,15}$/;

    if (!phoneRegex.test(data.phone)) {
      this.error = 'Please enter a valid phone number.';
      return;
    }

    this.dispatchEvent(new CustomEvent('callback-submitted', {
      detail: data,
      bubbles: true,
      composed: true
    }));

    this.showCallbackForm = false;
  }

  private renderIcon(icon: string | null) {
    if (!icon) return null;
    const isInlineSVG = typeof icon === 'string' && /<svg[\s\S]*?>/i.test(icon);
    if (isInlineSVG) {
      // Create a container and set innerHTML to inject SVG
      const container = document.createElement('span');
      container.style.color = this.primaryColor;
      container.innerHTML = icon;
      return html`${container}`;
    }

    // Otherwise, treat as image URL
    return html`<img src=${icon} width="30"/>`;
  }

  private renderIconByRole(role: 'user' | 'assistant' | 'system') {
    if (['assistant', 'system'].includes(role)) return this.renderIcon(this.assistantIcon);
    if (role === 'user') return this.renderIcon(this.userIcon);
    return null;
  }

  clearError() {
    if (this.error) {
      this.error = '';
    }
  }

  render() {
    const hasAssistantMessage = this.messages.some(m => m.role === 'assistant');

    return html`
      ${this.messages.map(msg => html`
        <div style="display:flex;gap:5px;align-items:center;margin-bottom: 12px; ${msg.role === 'user' ? 'flex-flow: row-reverse;' : ''}">
          <div class="message-icon">
            ${this.renderIconByRole(msg.role)}
          </div>
          <div
          class="message ${msg.role}"
          style="${msg.role === 'user' ? `background:${this.primaryColor}` : ''}">
            ${this.renderMarkdown(msg.content)}

            ${msg.role === 'assistant'
        ? html`
                    <div class="followups">
                      ${(msg.followups ?? []).map(q => html`
                        <button
                          class="followup-btn"
                          @click=${() => this.onFollowupClick(q)}>
                          ${q}
                        </button>
                      `)}
                    </div>
                  `
        : ''}
          </div>
        </div>
      `)}

      ${this.typing
        ? html`<div class="typing">${this.typingText}</div>`
        : ''}

      ${hasAssistantMessage
        ? html`
            <div class="followups">
              <button
                class="followup-btn"
                style="background:#e7f1ff"
                @click=${() => this.onSpecialClick('Request Callback')}>
                Request Callback
              </button>
              <button
                class="followup-btn"
                style="background:#e7f1ff"
                @click=${() => this.onSpecialClick('Contact Customer')}>
                Contact Customer
              </button>
            </div>
          `
        : ''}

      ${this.showCallbackForm
        ? html`
            <form class="callback-form" @submit=${this.submitCallbackForm}>
              <h3 class="form-title">Request a Callback</h3>

              <div style="display:flex; flex-direction:column; width:100%;">
                <label>
                  Phone Number <span class="red">*</span>
                </label>
                <input
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    required
                    @input=${this.clearError}
                  />
                  ${this.error ? html`<div class="error">${this.error}</div>` : ''}
              </div>
              

              <div style="display:flex; flex-direction:column;width:100%;">
                <label>
                  Message <span class="red">*</span>
                </label>
                <textarea
                    name="message"
                    required
                    placeholder="How can we help you?"
                  ></textarea>
              </div>

              
              <button type="submit">Request Callback</button>
            </form>
          `
        : ''}

      ${this.showSupportInfo
        ? html`
          <div class="callback-form">
            <p style="font-size:18px; margin:0">
              📧 <strong>Email:</strong>
              <a href="mailto:support@company.com">support@company.com</a>
            </p>
            <p style="font-size:18px; margin:0">
              📞 <strong>Phone:</strong>
              <a href="tel:+1234567890">+1 234 567 890</a>
            </p>
          </div>
    `
        : ''}

    `;
  }
}
