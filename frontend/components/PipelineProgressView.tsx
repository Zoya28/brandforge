"use client";

import { useState } from "react";
import {
  BrandKitSession,
  PIPELINE_STAGE_DISPLAY_ORDER,
  PipelineStageKey,
} from "@/lib/brandKitSessionTypes";

interface PipelineProgressViewProps {
  sessionState: BrandKitSession;
  completedStageKeys: Set<PipelineStageKey>;
  activeStageKey: PipelineStageKey | null;
  failedStage: {
    stageKey: PipelineStageKey;
    errorMessage: string;
  } | null;
  onOpenBrandKit: () => void;
}

function StageReasoningContent({
  stageKey,
  sessionState,
}: {
  stageKey: PipelineStageKey;
  sessionState: BrandKitSession;
}) {
  if (
    stageKey === "position_and_debate" &&
    sessionState.positioningDebate
  ) {
    const result = sessionState.positioningDebate;

    return (
      <div className="space-y-3 text-[13px] leading-6 text-[#66747b]">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#deddd6] bg-[#faf9f6] p-4">
            <p className="font-semibold text-[#173746]">
              {result.directionA.directionLabel}
            </p>

            <p className="mt-1.5">
              {result.directionA.differentiator}
            </p>
          </div>

          <div className="rounded-xl border border-[#deddd6] bg-[#faf9f6] p-4">
            <p className="font-semibold text-[#173746]">
              {result.directionB.directionLabel}
            </p>

            <p className="mt-1.5">
              {result.directionB.differentiator}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-[#deddd6] bg-[#f3f2ed] p-4">
          <p className="font-semibold text-[#173746]">
            Judge&apos;s verdict
          </p>

          <p className="mt-1.5">
            {result.judgeVerdictText}
          </p>

          <p className="mt-2 text-[#173746]">
            Selected direction:{" "}
            <span className="font-semibold">
              {result.winningDirection.directionLabel}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (
    stageKey === "shape_personality_and_naming" &&
    sessionState.brandPersonality
  ) {
    const result = sessionState.brandPersonality;

    return (
      <div className="space-y-2.5 text-[13px] leading-6 text-[#66747b]">
        <p>
          <span className="font-semibold text-[#173746]">
            Traits:
          </span>{" "}
          {result.traitsToEmbody.join(", ")}
        </p>

        <p>
          <span className="font-semibold text-[#173746]">
            Avoid:
          </span>{" "}
          {result.traitsToAvoid.join(", ")}
        </p>

        <p>
          <span className="font-semibold text-[#173746]">
            Tagline:
          </span>{" "}
          &ldquo;{result.tagline}&rdquo;
        </p>

        <p>
          <span className="font-semibold text-[#173746]">
            Naming directions:
          </span>{" "}
          {result.namingDirections
            .map((name) => name.candidateName)
            .join(", ")}
        </p>
      </div>
    );
  }

  if (
    stageKey === "visualize_direction" &&
    sessionState.visualDirection
  ) {
    const result = sessionState.visualDirection;

    return (
      <div className="space-y-2.5 text-[13px] leading-6 text-[#66747b]">
        <p>
          <span className="font-semibold text-[#173746]">
            Typography:
          </span>{" "}
          {result.typographyDirection}
        </p>

        <p>
          <span className="font-semibold text-[#173746]">
            Color mood:
          </span>{" "}
          {result.colorMoodDescription}
        </p>

        <p>
          <span className="font-semibold text-[#173746]">
            Imagery:
          </span>{" "}
          {result.compositionAndImageryStyle}
        </p>
      </div>
    );
  }

  if (
    stageKey === "audit_consistency" &&
    sessionState.consistencyAudit
  ) {
    const result = sessionState.consistencyAudit;

    return (
      <div className="space-y-3 text-[13px] leading-6">
        <p className="text-[#66747b]">
          <span className="font-semibold text-[#173746]">
            Verdict:
          </span>{" "}
          {result.overallConsistencyVerdict === "consistent"
            ? "No conflicts found."
            : `${result.findings.length} conflict(s) found and revised.`}
        </p>

        {result.findings.map((finding, index) => (
          <div
            key={index}
            className="rounded-xl border border-[#ead9b4] bg-[#faf5e9] p-4"
          >
            <p className="font-semibold text-[#795d20]">
              {finding.conflictDescription}
            </p>

            <p className="mt-1 text-[#96773a]">
              Fix: {finding.revisionSuggestion}
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (stageKey === "generate_logo_concept") {
    if (sessionState.logoConceptImageDataUri) {
      return (
        <div className="flex justify-center py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sessionState.logoConceptImageDataUri}
            alt="Generated logo concept"
            className="h-36 w-36 rounded-xl border border-[#deddd6] bg-white object-contain"
          />
        </div>
      );
    }

    return (
      <p className="text-[13px] leading-6 text-[#7b858a]">
        No logo image generated.

        {sessionState.logoConceptGenerationErrorMessage && (
          <span className="mt-2 block rounded-lg bg-[#f1f0eb] px-3 py-2 font-mono text-[11px] text-[#68747a]">
            {sessionState.logoConceptGenerationErrorMessage}
          </span>
        )}
      </p>
    );
  }

  if (
    stageKey === "assemble_launch_kit" &&
    sessionState.launchKit
  ) {
    const result = sessionState.launchKit;

    return (
      <div className="space-y-2.5 text-[13px] leading-6 text-[#66747b]">
        <p>
          <span className="font-semibold text-[#173746]">
            Headline:
          </span>{" "}
          {result.landingPageHeadline}
        </p>

        <p>
          <span className="font-semibold text-[#173746]">
            Pitch:
          </span>{" "}
          {result.finalOnelinePitch}
        </p>
      </div>
    );
  }

  return (
    <p className="text-[13px] text-[#899297]">
      Reasoning for this stage is not available yet.
    </p>
  );
}

export default function PipelineProgressView({
  sessionState,
  completedStageKeys,
  activeStageKey,
  failedStage,
  onOpenBrandKit,
}: PipelineProgressViewProps) {
  const [expandedStageKey, setExpandedStageKey] =
    useState<PipelineStageKey | null>(null);

  const completedCount = completedStageKeys.size;

  // Keep this as a normal number instead of comparing the literal
  // tuple length against zero.
  const totalStages = Number(PIPELINE_STAGE_DISPLAY_ORDER.length);

  const progressPercentage =
    totalStages > 0
      ? Math.round((completedCount / totalStages) * 100)
      : 0;

  const pipelineFinished =
    completedCount === totalStages && !activeStageKey && !failedStage;

  const toggleStage = (stageKey: PipelineStageKey) => {
    if (!completedStageKeys.has(stageKey)) return;

    setExpandedStageKey((current) =>
      current === stageKey ? null : stageKey
    );
  };

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#173746]">
      {/* Header */}
      <header className="flex h-[64px] items-center justify-between border-b border-[#d9d8d2] px-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#173746] text-[10px] font-semibold text-white">
            BF
          </div>

          <span className="text-[12px] font-semibold tracking-[0.14em]">
            BRANDFORGE
          </span>
        </div>

        <div className="hidden items-center gap-7 text-[10px] font-medium uppercase tracking-[0.14em] text-[#7d898e] sm:flex">
          <span>Identity System</span>
          <span>2026</span>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-[1380px] grid-cols-1 lg:grid-cols-[260px_1fr]">
        {/* Editorial sidebar */}
        <aside className="border-b border-[#d9d8d2] px-6 py-8 sm:px-8 lg:border-b-0 lg:border-r lg:px-10 lg:py-12">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4b7484]">
            02 / BUILD
          </div>

          <h1 className="mt-6 font-serif text-[40px] leading-[0.98] tracking-[-0.04em] text-[#173746] sm:text-[44px]">
            Building
            <br />
            your brand.
          </h1>

          <div className="mt-7 h-px w-12 bg-[#8eb2bf]" />

          <p className="mt-6 max-w-[205px] text-[13px] leading-6 text-[#6e7b81]">
            BrandForge is working through each layer of the identity system.
            You can inspect the reasoning as it happens.
          </p>

          {/* Progress */}
          <div className="mt-9">
            <div className="flex items-end justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4b7484]">
                PROGRESS
              </span>

              <span className="text-[11px] font-medium text-[#718087]">
                {progressPercentage}%
              </span>
            </div>

            <div className="mt-3 h-0.75 w-full overflow-hidden bg-[#dddcd6]">
              <div
                className="h-full bg-[#173746] transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-2 text-[10px] text-[#899297]">
              {completedCount} of {totalStages} stages complete
            </p>
          </div>
        </aside>

        {/* Content */}
        <div className="px-5 py-8 sm:px-8 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto w-full max-w-225">
            {/* Intro */}
            <div className="flex items-end justify-between gap-6">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4b7484]">
                  BRAND DEVELOPMENT
                </div>

                <h2 className="mt-4 font-serif text-[40px] leading-[1] tracking-[-0.04em] text-[#173746] sm:text-[48px]">
                  From idea to identity.
                </h2>

                <p className="mt-4 max-w-[610px] text-[14px] leading-6 text-[#718087]">
                  Each stage builds on the decisions made before it.
                  Completed stages can be opened to see the reasoning behind
                  the result.
                </p>
              </div>
            </div>

            {/* Pipeline */}
            <div className="mt-8 overflow-hidden rounded-[18px] border border-[#d8d7d0] bg-[#efeee9]">
              {PIPELINE_STAGE_DISPLAY_ORDER.map(
                ({ stageKey, displayLabel }, index) => {
                  const isCompleted =
                    completedStageKeys.has(stageKey);

                  const isActive = activeStageKey === stageKey;

                  const isFailed =
                    failedStage?.stageKey === stageKey;

                  const isExpanded =
                    expandedStageKey === stageKey;

                  const isLast =
                    index === PIPELINE_STAGE_DISPLAY_ORDER.length - 1;

                  return (
                    <div
                      key={stageKey}
                      className={!isLast ? "border-b border-[#d8d7d0]" : ""}
                    >
                      <button
                        type="button"
                        onClick={() => toggleStage(stageKey)}
                        disabled={!isCompleted}
                        aria-expanded={
                          isCompleted ? isExpanded : undefined
                        }
                        className={`w-full px-5 py-4 text-left transition sm:px-6 ${
                          isCompleted
                            ? "cursor-pointer hover:bg-[#e9e8e2]"
                            : "cursor-default"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Status */}
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                              isFailed
                                ? "bg-[#b84b43] text-white"
                                : isCompleted
                                ? "bg-[#173746] text-white"
                                : isActive
                                ? "bg-[#173746] text-white"
                                : "bg-[#d9d8d2] text-[#899297]"
                            } ${
                              isActive && !isCompleted
                                ? "animate-pulse"
                                : ""
                            }`}
                          >
                            {isFailed ? (
                              "!"
                            ) : isCompleted ? (
                              "✓"
                            ) : (
                              String(index + 1).padStart(2, "0")
                            )}
                          </div>

                          {/* Label */}
                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-[13px] font-semibold ${
                                isCompleted || isActive
                                  ? "text-[#173746]"
                                  : "text-[#929a9d]"
                              }`}
                            >
                              {displayLabel}
                            </p>

                            <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#929a9d]">
                              {isFailed
                                ? "Needs attention"
                                : isCompleted
                                ? "Complete"
                                : isActive
                                ? "Working now"
                                : "Waiting"}
                            </p>
                          </div>

                          {/* Right indicator */}
                          {isCompleted && (
                            <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-[#7c898e]">
                              {isExpanded ? "Hide" : "Reasoning"}
                            </span>
                          )}

                          {isActive && !isCompleted && (
                            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-[#4b7484]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4b7484]" />
                              Working
                            </span>
                          )}
                        </div>
                      </button>

                      {/* Error */}
                      {isFailed && failedStage && (
                        <div className="px-5 pb-4 sm:px-6">
                          <div className="rounded-xl border border-[#e4b9b4] bg-[#fbefed] px-4 py-3 text-[12px] leading-5 text-[#9b4a43]">
                            {failedStage.errorMessage}
                          </div>
                        </div>
                      )}

                      {/* Reasoning */}
                      {isExpanded && isCompleted && (
                        <div className="border-t border-[#deddd6] bg-[#f8f7f3] px-5 py-5 sm:px-6">
                          <div className="mb-4 flex items-center gap-3">
                            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#4b7484]">
                              STAGE REASONING
                            </span>

                            <div className="h-px flex-1 bg-[#deddd6]" />
                          </div>

                          <StageReasoningContent
                            stageKey={stageKey}
                            sessionState={sessionState}
                          />
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {/* Completion CTA */}
            {pipelineFinished && (
              <div className="mt-6 rounded-[18px] border border-[#cbd5d5] bg-[#e9f0ef] p-5 sm:p-6">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4b7484]">
                      IDENTITY SYSTEM COMPLETE
                    </div>

                    <h3 className="mt-2 font-serif text-[25px] tracking-[-0.025em] text-[#173746]">
                      Your brand is ready to explore.
                    </h3>

                    <p className="mt-1 text-[12px] leading-5 text-[#6c7b80]">
                      Open the completed Brand Kit whenever you&apos;re ready.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenBrandKit}
                    className="group flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#173746] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#244b5a]"
                  >
                    View Brand Kit

                    <span className="text-[15px] transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Bottom note */}
            <div className="mt-6 flex items-center justify-between border-t border-[#dddcd6] pt-4 text-[9px] uppercase tracking-[0.1em] text-[#899297]">
              <span>BrandForge identity system</span>

              <span>
                {pipelineFinished
                  ? "Ready"
                  : "Building in sequence"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}