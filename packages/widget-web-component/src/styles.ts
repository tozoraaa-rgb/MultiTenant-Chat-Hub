const STYLE_ELEMENT_ID = "chatbot-widget-shadow-style";

const WIDGET_STYLES = `
:host {
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

:host *,
:host *::before,
:host *::after {
  box-sizing: border-box;
}

[data-chatbot-widget-root] {
  position: relative;
}
`;

export const injectWidgetStyles = (shadowRoot: ShadowRoot): void => {
  if (shadowRoot.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = STYLE_ELEMENT_ID;
  style.textContent = WIDGET_STYLES;
  shadowRoot.appendChild(style);
};
