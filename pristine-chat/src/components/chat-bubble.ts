import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

@customElement('chat-bubble')
export class ChatBubble extends LitElement {
    static styles = css`
        :host {
            display: block;
            position: relative;
            cursor: pointer;
        }
        .bubble-container {
            display: flex;
            align-items: center;
            right: 10px;
            position: fixed;
            bottom: 20px;
        }
        .popup-message {
            background: white;
            color: #333;
            padding: 10px 15px;
            border-radius: 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin-right: 15px;
            white-space: nowrap;
            font-size: 0.9rem;
            animation: fadeIn 0.3s ease-out;
            position: relative;
        }
        .popup-message::after {
            content: '';
            position: absolute;
            right: -6px;
            top: 50%;
            transform: translateY(-50%);
            border-style: solid;
            border-width: 6px 0 6px 6px;
            border-color: transparent transparent transparent white;
        }
        .launcher {
            border-radius: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap:10px;
            font-weight:600;
            padding:10px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: transform 0.2s;
            color: white;
            min-width:188px;
            height:25px;
        }
        .launcher:hover {
            transform: scale(1.05);
        }
            .launcher svg {
    width: 24px;
    height: 24px;
}
        @keyframes fadeIn {
            from { opacity: 0; transform: translateX(10px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;

    @property() icon: string = '';
    @property() color: string = '#007bff';
    @property() launcherText: string = 'Need assistance?';
    @property({ type: Boolean }) showPopup = false;
    @property() popupText = 'Need assistance?';

    render() {
        return html`
            <div class="bubble-container" @click=${() => this.dispatchEvent(new CustomEvent('toggle'))}>
                <div class="launcher" style="background: ${this.color}">
                    ${unsafeHTML(this.icon)}
                    ${this.launcherText}
                </div>
            </div>
        `;
    }
}
