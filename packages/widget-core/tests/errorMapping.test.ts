import { describe, expect, it } from "vitest";

import { WidgetRuntimeError } from "../src/runtime/errors";
import { parsePublicChatResponse } from "../src/runtime/parseResponse";

describe("parsePublicChatResponse error mapping", () => {
  it("maps CHATBOT_NOT_FOUND", () => {
    expect(() =>
      parsePublicChatResponse(
        {
          success: false,
          data: null,
          error: { code: "CHATBOT_NOT_FOUND", message: "not found" },
        },
        { status: 404 },
      ),
    ).toThrowError(new WidgetRuntimeError("CHATBOT_NOT_FOUND", "not found"));
  });

  it("maps RATE_LIMIT_EXCEEDED to RATE_LIMITED", () => {
    try {
      parsePublicChatResponse(
        {
          success: false,
          data: null,
          error: { code: "RATE_LIMIT_EXCEEDED", message: "slow down" },
        },
        { status: 429 },
      );
    } catch (error) {
      expect(error).toBeInstanceOf(WidgetRuntimeError);
      expect((error as WidgetRuntimeError).code).toBe("RATE_LIMITED");
    }
  });

  it("maps LLM_UNAVAILABLE", () => {
    try {
      parsePublicChatResponse(
        {
          success: false,
          data: null,
          error: { code: "LLM_UNAVAILABLE", message: "down" },
        },
        { status: 503 },
      );
    } catch (error) {
      expect((error as WidgetRuntimeError).code).toBe("LLM_UNAVAILABLE");
    }
  });

  it("maps malformed response to UNKNOWN_ERROR", () => {
    try {
      parsePublicChatResponse({ not: "an-envelope" });
    } catch (error) {
      expect((error as WidgetRuntimeError).code).toBe("UNKNOWN_ERROR");
    }
  });
});
