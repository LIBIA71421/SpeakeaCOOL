import type { User } from "firebase/auth";

type AssistantResponse = {
  answer: string;
  sources: string[];
};

export class StudyAssistantClient {
  constructor(private readonly endpoint: string) {}

  async ask(user: User, question: string, documentIds: string[]): Promise<AssistantResponse> {
    const token = await user.getIdToken();
    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, documentIds }),
    });

    if (!response.ok) {
      const errorBody: unknown = await response.json().catch(() => null);
      const message =
        typeof errorBody === "object" &&
        errorBody !== null &&
        "error" in errorBody &&
        typeof errorBody.error === "string"
          ? errorBody.error
          : `El servicio respondió con error (${response.status}).`;
      throw new Error(message);
    }

    const result: unknown = await response.json();
    if (
      typeof result !== "object" ||
      result === null ||
      !("answer" in result) ||
      typeof result.answer !== "string"
    ) {
      throw new Error("La respuesta del asistente no tiene el formato esperado.");
    }

    return {
      answer: result.answer,
      sources:
        "sources" in result && Array.isArray(result.sources)
          ? result.sources.filter((source): source is string => typeof source === "string")
          : [],
    };
  }
}

export class SpeechService {
  private readonly synthesis = window.speechSynthesis;

  speak(text: string): void {
    this.stop();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-BO";
    utterance.rate = 1;
    this.synthesis.speak(utterance);
  }

  stop(): void {
    this.synthesis.cancel();
  }

  get available(): boolean {
    return "speechSynthesis" in window;
  }
}
