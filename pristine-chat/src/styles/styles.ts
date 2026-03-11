import { css } from 'lit';

export const baseStyles = css`
  :host {
    display: block;
    font-family: var(--pc-font-family, system-ui, sans-serif);
    --pc-primary: #007bff;
    --pc-bg: #fff;
    --pc-text: #000;
  }

  * { box-sizing: border-box; }

  .chat-container {
    position: fixed;
    display: flex;
    flex-direction: column;
    width: 380px;
    height: 600px;
    max-height: 80vh;
    background: var(--pc-bg);
    color: var(--pc-text);
    border-radius: var(--pc-radius, 12px);
    box-shadow: 0 5px 25px rgba(0,0,0,0.15);
    overflow: hidden;
    transition: opacity 0.3s ease, transform 0.3s ease;
    z-index: var(--pc-z-index, 9999);
  }

  .chat-container.closed {
    opacity: 0;
    pointer-events: none;
    transform: translateY(20px) scale(0.95);
  }

  .chat-container.open {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0) scale(1);
  }

  /* Positions */
  .pos-bottom-right { bottom: 20px; right: 20px; }
  .pos-bottom-left { bottom: 20px; left: 20px; }

  .launcher-wrapper {
    position: fixed;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    /* Background and color removed here as they are handled by inner component or passed down? 
       Actually chat-bubble handles its own background/color. 
       Let's check if we need to remove them or if they are just ignored/overridden.
       The template says: <chat-bubble ...></chat-bubble>
       The wrapper is just for positioning.
       So we probably don't want background on the wrapper if the bubble is circular.
       But let's look at chat-bubble.ts again.
    */
    /* Keeping original styles but renaming for now to be safe, assuming wrapper should behave like the launcher button container */
    /* Wait, chat-bubble has .launcher class too inside it! */
    /* If we style wrapper with background, we might have double circles. */
    /* Let's look at pristine-chat.ts again. */
    /* <div class="launcher-wrapper ..."> <chat-bubble ...> </div> */
    /* Wrapper is for positioning. chat-bubble is the visual. */
    /* So wrapper should NOT have background/shadow/size if chat-bubble has it. */
    /* OR wrapper IS the visual container? */
    /* chat-bubble.ts styles: .launcher { width: 60px; height: 60px; ... background: ... } */
    /* So chat-bubble HAS the visual styles. */
    /* So styles.ts .launcher having background/width/height/shadow is WRONG or REDUNDANT? */
    /* styles.ts .launcher has position: fixed. chat-bubble .launcher does NOT. */
    /* So styles.ts was trying to be the positioning container. */
    /* If I rename it to .launcher-wrapper, I should REMOVE visual styles (bg, shadow, etc) and KEEP positioning styles (fixed, z-index). */
  }

  .launcher-wrapper {
    position: fixed;
    z-index: var(--pc-z-index, 9999);
    /* No visual styles, just positioning */
    display: flex;
    align-items: center;
    justify-content: center;
    /* We need width/height??? No, let child determine size? */
    /* But standardizing layout helps. */
    /* If I remove width/height/bg, will it break? */
    /* The original code had ALL styles on .launcher in styles.ts. */
    /* AND chat-bubble.ts has styles on .launcher too. */
  }


  @media (max-width: 480px) {
    .chat-container {
      width: 100%;
      height: 100%;
      max-height: 100%;
      bottom: 0 !important;
      right: 0 !important;
      left: 0 !important;
      border-radius: 0;
    }
  }
`;
