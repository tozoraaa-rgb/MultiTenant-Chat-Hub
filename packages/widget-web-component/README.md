# @mth/widget-web-component

Universal browser integration wrapper for the chatbot widget.

This package registers `<chatbot-widget>`, mounts the React widget internally inside a Shadow DOM boundary, and exposes host integration events via explicit `CustomEvent` dispatch.

## What this package is

- DOM integration shell for websites (including non-React hosts)
- Shadow DOM wrapper around `@mth/widget-react`

## What this package is not

- not the runtime/network logic core
- not backend business logic

## Usage

```html
<script src=".../chatbot-widget.umd.js" defer></script>

<chatbot-widget
  data-domain="shop.example.com"
  data-api-base-url="https://api.yourplatform.com"
  data-title="Ask us anything"
  data-theme="light"
  data-position="bottom-right"
></chatbot-widget>
```

## Required attributes

- `data-domain`
- `data-api-base-url`

## Optional attributes

- `data-title`
- `data-theme`
- `data-position`
- `data-welcome-message`
- `data-primary-color`
- `data-z-index`
- `data-open-by-default`
- `data-max-history-messages`

## Output events

The element emits explicit DOM events:

- `chatbot-opened`
- `chatbot-closed`
- `chatbot-message-sent`
- `chatbot-error`

Each event is emitted with:

- `bubbles: true`
- `composed: true`

`composed: true` is required so events cross the Shadow DOM boundary and can be handled by host-page listeners.
