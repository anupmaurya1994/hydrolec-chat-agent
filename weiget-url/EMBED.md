# Embedding Pristine Chat

## 1. Plain HTML

Include the script and initialize via JS or HTML tag.

```html
<!-- Load the script -->
<script type="module" src="https://your-cdn.com/pristine-chat.js"></script>

<!-- Use the tag directly -->
<pristine-chat 
  api-base-url="https://api.your-chat.com"
  header-title="Support"
></pristine-chat>
```

## 2. React

Since it's a Web Component, you can use it like a standard HTML element.

```jsx
import 'pristine-chat-widget'; // Import the bundle

function App() {
  return (
    <div className="App">
       <pristine-chat 
         header-title="React Chat"
         primary-color="#61dafb"
       ></pristine-chat>
    </div>
  );
}
```

*Note: For complex object props, you might need a `ref` to pass data.*

```jsx
import { useEffect, useRef } from 'react';

function Chat() {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.config = {
         apiBaseUrl: '...',
         features: { enableEmoji: true }
      };
    }
  }, []);

  return <pristine-chat ref={chatRef}></pristine-chat>;
}
```

## 3. Angular

Enable `CUSTOM_ELEMENTS_SCHEMA` in your module.

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  // ...
})
export class AppModule {}
```

Then usage in template:

```html
<pristine-chat [config]="myConfigObject"></pristine-chat>
```

## 4. WordPress

Enqueue the script in `functions.php`.

```php
function enqueue_chat_widget() {
    wp_enqueue_script('pristine-chat', 'https://your-cdn.com/pristine-chat.js', [], '1.0', true);
}
add_action('wp_enqueue_scripts', 'enqueue_chat_widget');
```

Add initialization code in the footer or a custom HTML widget:

```html
<script>
  window.PristineChat.init({
    apiBaseUrl: 'https://your-api.com',
    wordpressUser: '<?php echo get_current_user_id(); ?>'
  });
</script>
```
