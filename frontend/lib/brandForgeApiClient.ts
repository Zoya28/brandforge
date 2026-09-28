// brandForgeApiClient.ts
//
// Talks to the FastAPI backend. Two operations: start a session, then
// stream its progress via Server-Sent Events. Kept dependency-free
// (plain fetch + EventSource) so there's nothing extra to install.

import {
  BrandKitSession,
  PipelineStageKey,
  StartSessionResponse,
  InterviewAnswersResponse,
} from "./brandKitSessionTypes";

const BACKEND_BASE_URL =
  process.env.BRANDFORGE_API_BASE_URL || "https://saying-morrison-compliance-hello.trycloudflare.com";

export async function startBrandSession(roughIdeaText: string): Promise<StartSessionResponse> {
  const response = await fetch(`${BACKEND_BASE_URL}/api/brand-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roughIdeaText }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to start session: ${response.status} ${errorBody}`);
  }

  return response.json();
}

export async function submitInterviewAnswers(
  sessionId: string,
  answersText: string
): Promise<InterviewAnswersResponse> {
  const response = await fetch(
    `${BACKEND_BASE_URL}/api/brand-sessions/${sessionId}/interview-answers`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answersText }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to submit answers: ${response.status} ${errorBody}`);
  }

  return response.json();
}

export interface PipelineStreamCallbacks {
  onStageStarted: (stageKey: PipelineStageKey) => void;
  onStageCompleted: (stageKey: PipelineStageKey, sessionState: BrandKitSession) => void;
  onStageFailed: (stageKey: PipelineStageKey, errorMessage: string) => void;
  onPipelineComplete: (sessionState: BrandKitSession) => void;
}

export function streamBrandSessionProgress(
  sessionId: string,
  callbacks: PipelineStreamCallbacks
): () => void {
  const eventSource = new EventSource(
    `${BACKEND_BASE_URL}/api/brand-sessions/${sessionId}/stream`
  );

  eventSource.addEventListener("stage_started", (event) => {
    const payload = JSON.parse((event as MessageEvent).data);
    callbacks.onStageStarted(payload.stageKey);
  });

  eventSource.addEventListener("stage_completed", (event) => {
    const payload = JSON.parse((event as MessageEvent).data);
    callbacks.onStageCompleted(payload.stageKey, payload.sessionState);
  });

  eventSource.addEventListener("stage_failed", (event) => {
    const payload = JSON.parse((event as MessageEvent).data);
    callbacks.onStageFailed(payload.stageKey, payload.errorMessage);
    eventSource.close();
  });

  eventSource.addEventListener("pipeline_complete", (event) => {
    const payload = JSON.parse((event as MessageEvent).data);
    callbacks.onPipelineComplete(payload.sessionState);
    eventSource.close();
  });

  eventSource.onerror = () => {
    // EventSource retries by default; we close explicitly on terminal
    // events above, so an error here means an unexpected drop.
    eventSource.close();
  };

  return () => eventSource.close();
}
