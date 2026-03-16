import { ChatbotWidgetElement } from "./ChatbotWidgetElement";

export { ChatbotWidgetElement } from "./ChatbotWidgetElement";
export { readWidgetConfigFromElement } from "./attributes";

export const CHATBOT_WIDGET_TAG_NAME = "chatbot-widget";

export const registerChatbotWidgetElement = (): void => {
  if (!customElements.get(CHATBOT_WIDGET_TAG_NAME)) {
    customElements.define(CHATBOT_WIDGET_TAG_NAME, ChatbotWidgetElement);
  }
};
