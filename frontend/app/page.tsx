"use client";

import { useCallback, useState } from "react";

import {
  startBrandSession,
  submitInterviewAnswers,
  streamBrandSessionProgress,
} from "@/lib/brandForgeApiClient";

import {
  BrandKitSession,
  IdeaClarificationResult,
  PipelineStageKey,
} from "@/lib/brandKitSessionTypes";

import IdeaInputScreen from "@/components/IdeaInputScreen";
import InterviewScreen from "@/components/InterviewScreen";
import PipelineProgressView from "@/components/PipelineProgressView";
import FinalBrandKitView from "@/components/FinalBrandKitView";

type AppViewMode = "input" | "interview" | "running" | "complete";

export default function BrandForgeHomePage() {
  const [appViewMode, setAppViewMode] =
    useState<AppViewMode>("input");

  const [sessionId, setSessionId] =
    useState<string | null>(null);

  const [sessionState, setSessionState] =
    useState<BrandKitSession | null>(null);

  // ─────────────────────────────────────────────
  // Interview state
  // ─────────────────────────────────────────────

  const [ideaClarification, setIdeaClarification] =
    useState<IdeaClarificationResult | null>(null);

  const [interviewRoundCount, setInterviewRoundCount] =
    useState(1);

  const [maxInterviewRounds, setMaxInterviewRounds] =
    useState(3);

  const [isSubmittingAnswers, setIsSubmittingAnswers] =
    useState(false);

  // ─────────────────────────────────────────────
  // Pipeline state
  // ─────────────────────────────────────────────

  const [completedStageKeys, setCompletedStageKeys] =
    useState<Set<PipelineStageKey>>(new Set());

  const [activeStageKey, setActiveStageKey] =
    useState<PipelineStageKey | null>(null);

  const [failedStage, setFailedStage] =
    useState<{
      stageKey: PipelineStageKey;
      errorMessage: string;
    } | null>(null);

  const [submissionErrorMessage, setSubmissionErrorMessage] =
    useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Stage 1: Submit rough idea
  // ─────────────────────────────────────────────

  const handleSubmitIdea = useCallback(
    async (roughIdeaText: string) => {
      setSubmissionErrorMessage(null);

      try {
        const startResponse =
          await startBrandSession(roughIdeaText);

        setSessionId(startResponse.sessionId);

        setIdeaClarification(
          startResponse.ideaClarification
        );

        setInterviewRoundCount(
          startResponse.interviewRoundCount
        );

        setMaxInterviewRounds(
          startResponse.maxInterviewRounds
        );

        setAppViewMode("interview");
      } catch (error) {
        setSubmissionErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to start session."
        );
      }
    },
    []
  );

  // ─────────────────────────────────────────────
  // Stage 2: Submit interview answers
  // ─────────────────────────────────────────────

  const handleSubmitInterviewAnswers = useCallback(
    async (answersText: string) => {
      if (!sessionId) return;

      setIsSubmittingAnswers(true);
      setSubmissionErrorMessage(null);

      try {
        const answerResponse =
          await submitInterviewAnswers(
            sessionId,
            answersText
          );

        setIdeaClarification(
          answerResponse.ideaClarification
        );

        setInterviewRoundCount(
          answerResponse.interviewRoundCount
        );
      } catch (error) {
        setSubmissionErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to submit answers."
        );
      } finally {
        setIsSubmittingAnswers(false);
      }
    },
    [sessionId]
  );

  // ─────────────────────────────────────────────
  // Stage 3: Start brand pipeline
  // ─────────────────────────────────────────────

  const handleProceedToBuild = useCallback(() => {
    if (!sessionId || !ideaClarification) return;

    setFailedStage(null);
    setSubmissionErrorMessage(null);

    setCompletedStageKeys(new Set());
    setActiveStageKey(null);

    const initialSessionState: BrandKitSession = {
      sessionId,
      founderRawInput: {
        roughIdeaText: "",
      },
      ideaClarification,
      stageLog: [],
    };

    setSessionState(initialSessionState);

    setAppViewMode("running");

    streamBrandSessionProgress(sessionId, {
      // ─────────────────────────────────────────
      // Pipeline stage started
      // ─────────────────────────────────────────

      onStageStarted: (stageKey) => {
        setActiveStageKey(stageKey);
      },

      // ─────────────────────────────────────────
      // Pipeline stage completed
      // ─────────────────────────────────────────

      onStageCompleted: (
        stageKey,
        updatedSessionState
      ) => {
        setSessionState(updatedSessionState);

        setCompletedStageKeys((previous) => {
          const next = new Set(previous);
          next.add(stageKey);
          return next;
        });
      },

      // ─────────────────────────────────────────
      // Pipeline stage failed
      // ─────────────────────────────────────────

      onStageFailed: (
        stageKey,
        errorMessage
      ) => {
        setFailedStage({
          stageKey,
          errorMessage,
        });

        setActiveStageKey(null);
      },

      // ─────────────────────────────────────────
      // IMPORTANT:
      //
      // Do NOT automatically open Brand Kit here.
      //
      // The user should first be able to inspect
      // the completed pipeline and reasoning.
      // ─────────────────────────────────────────

      onPipelineComplete: (finalSessionState) => {
        setSessionState(finalSessionState);
        setActiveStageKey(null);

        // Stay on the pipeline screen.
        setAppViewMode("running");
      },
    });
  }, [sessionId, ideaClarification]);

  // ─────────────────────────────────────────────
  // User explicitly opens Brand Kit
  // ─────────────────────────────────────────────

  const handleOpenBrandKit = useCallback(() => {
    if (!sessionState) return;

    setAppViewMode("complete");
  }, [sessionState]);

  // ─────────────────────────────────────────────
  // Start over
  // ─────────────────────────────────────────────

  const handleStartOver = useCallback(() => {
    setAppViewMode("input");

    setSessionId(null);
    setSessionState(null);

    setIdeaClarification(null);

    setInterviewRoundCount(1);
    setMaxInterviewRounds(3);

    setCompletedStageKeys(new Set());
    setActiveStageKey(null);
    setFailedStage(null);

    setIsSubmittingAnswers(false);
    setSubmissionErrorMessage(null);
  }, []);

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#f7f6f2]">
      {/* ─────────────────────────────────────────
          IDEA INPUT
      ───────────────────────────────────────── */}

      {appViewMode === "input" && (
        <div>
          <IdeaInputScreen
            onSubmitIdea={handleSubmitIdea}
            isSubmitDisabled={false}
          />

          {submissionErrorMessage && (
            <div className="mx-auto max-w-2xl px-6 pb-6">
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
                {submissionErrorMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────
          FOUNDER INTERVIEW
      ───────────────────────────────────────── */}

      {appViewMode === "interview" &&
        ideaClarification && (
          <InterviewScreen
            ideaClarification={ideaClarification}
            interviewRoundCount={interviewRoundCount}
            maxInterviewRounds={maxInterviewRounds}
            onSubmitAnswers={
              handleSubmitInterviewAnswers
            }
            onProceedToBuild={
              handleProceedToBuild
            }
            isSubmittingAnswers={
              isSubmittingAnswers
            }
          />
        )}

      {/* ─────────────────────────────────────────
          PIPELINE PROGRESS
      ───────────────────────────────────────── */}

      {appViewMode === "running" &&
        sessionState && (
          <PipelineProgressView
            sessionState={sessionState}
            completedStageKeys={completedStageKeys}
            activeStageKey={activeStageKey}
            failedStage={failedStage}
            onOpenBrandKit={handleOpenBrandKit}
          />
        )}

      {/* ─────────────────────────────────────────
          FINAL BRAND KIT
      ───────────────────────────────────────── */}

      {appViewMode === "complete" &&
        sessionState && (
          <FinalBrandKitView
            sessionState={sessionState}
            onStartOver={handleStartOver}
          />
        )}
    </main>
  );
}