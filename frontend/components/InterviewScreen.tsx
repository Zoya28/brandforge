"use client";

import { useState, useEffect, useRef } from "react";
import { IdeaClarificationResult } from "@/lib/brandKitSessionTypes";

interface InterviewScreenProps {
  ideaClarification: IdeaClarificationResult;
  interviewRoundCount: number;
  maxInterviewRounds: number;
  onSubmitAnswers: (answersText: string) => void;
  onProceedToBuild: () => void;
  isSubmittingAnswers: boolean;
}

interface ChatMessage {
  speakerRole: "ai" | "founder";
  messageText: string;
}

const DISPLAY_FONT_STACK =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

const SANS_FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export default function InterviewScreen({
  ideaClarification,
  interviewRoundCount,
  maxInterviewRounds,
  onSubmitAnswers,
  onProceedToBuild,
  isSubmittingAnswers,
}: InterviewScreenProps) {
  const [chatTranscript, setChatTranscript] = useState<ChatMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswerDraft, setCurrentAnswerDraft] = useState("");
  const [collectedAnswersThisRound, setCollectedAnswersThisRound] = useState<string[]>([]);
  const lastSeenRoundRef = useRef<number | null>(null);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const openQuestions = ideaClarification.openQuestionsForFounder || [];
  const hasOpenQuestions = openQuestions.length > 0;
  const hasReachedRoundCap = interviewRoundCount >= maxInterviewRounds;
  const shouldRunChatMode = hasOpenQuestions && !hasReachedRoundCap;

  useEffect(() => {
    if (lastSeenRoundRef.current === interviewRoundCount) return;

    lastSeenRoundRef.current = interviewRoundCount;
    setCurrentQuestionIndex(0);
    setCollectedAnswersThisRound([]);
    setIsRoundComplete(false);
    setCurrentAnswerDraft("");

    const understandingSummary =
      `Here's what I understand so far — problem: ${ideaClarification.coreProblemStatement} ` +
      `Audience: ${ideaClarification.targetAudienceDescription}`;

    if (hasOpenQuestions && !hasReachedRoundCap) {
      setChatTranscript((previous) => [
        ...previous,
        { speakerRole: "ai", messageText: understandingSummary },
        { speakerRole: "ai", messageText: openQuestions[0] },
      ]);
    } else {
      setChatTranscript((previous) => [
        ...previous,
        {
          speakerRole: "ai",
          messageText: hasReachedRoundCap
            ? "We've gone a few rounds — I've got enough to work with. Ready when you are."
            : "That's a clear picture — no more questions from me. Ready to build.",
        },
      ]);
    }

  }, [interviewRoundCount]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatTranscript]);

  const handleSendAnswer = () => {
    const trimmedAnswer = currentAnswerDraft.trim();
    if (!trimmedAnswer) return;

    const updatedAnswers = [...collectedAnswersThisRound, trimmedAnswer];
    setCollectedAnswersThisRound(updatedAnswers);
    setChatTranscript((previous) => [
      ...previous,
      { speakerRole: "founder", messageText: trimmedAnswer },
    ]);
    setCurrentAnswerDraft("");

    const nextQuestionIndex = currentQuestionIndex + 1;

    if (nextQuestionIndex < openQuestions.length) {
      setCurrentQuestionIndex(nextQuestionIndex);
      setChatTranscript((previous) => [
        ...previous,
        {
          speakerRole: "ai",
          messageText: openQuestions[nextQuestionIndex],
        },
      ]);
    } else {
      // All questions in this round answered — auto-submit to the AI.
      setIsRoundComplete(true);
      const answersText = openQuestions
        .map((question, index) => `Q: ${question}\nA: ${updatedAnswers[index]}`)
        .join("\n\n");
      onSubmitAnswers(answersText);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendAnswer();
    }
  };

  const roundProgress = Math.min(
    100,
    Math.max(0, (interviewRoundCount / Math.max(maxInterviewRounds, 1)) * 100)
  );

  return (
    <main
      className="min-h-screen overflow-hidden"
      style={{
        backgroundColor: "#F7F6F2",
        color: "#171716",
        fontFamily: SANS_FONT_STACK,
      }}
    >
      {/* Editorial application header */}
      <header
        className="border-b"
        style={{ borderColor: "#DCD9D0", backgroundColor: "#F7F6F2" }}
      >
        <div className="mx-auto flex h-[54px] max-w-[1480px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-5">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.07em]"
              style={{ color: "#0D3440" }}
            >
              BrandForge
            </span>
            <span
              className="hidden h-4 w-px sm:block"
              style={{ backgroundColor: "#DCD9D0" }}
            />
            <span
              className="hidden text-[11px] uppercase tracking-[0.05em] sm:block"
              style={{ color: "#66645E" }}
            >
              Founder interview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span
              className="text-[11px] uppercase tracking-[0.05em]"
              style={{ color: "#66645E" }}
            >
              Round {interviewRoundCount} / {maxInterviewRounds}
            </span>
            <span
              className="flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-semibold"
              style={{ backgroundColor: "#D9E8EA", color: "#0D3440" }}
            >
              {Math.round(roundProgress)}%
            </span>
          </div>
        </div>
      </header>

      {/* Progress rule */}
      <div className="h-[2px] w-full" style={{ backgroundColor: "#E7E4DC" }}>
        <div
          className="h-full transition-[width] duration-500"
          style={{ width: `${roundProgress}%`, backgroundColor: "#87ABB8" }}
        />
      </div>

      <div className="mx-auto grid min-h-[calc(100vh-56px)] max-w-[1480px] lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* Context rail */}
        <aside
          className="hidden border-r lg:flex lg:flex-col"
          style={{ borderColor: "#DCD9D0" }}
        >
          <div className="sticky top-0 px-7 py-9">
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.09em]"
              style={{ color: "#0D3440" }}
            >
              01 / Discovery
            </p>

            <h1
              className="text-[42px] leading-[0.96] tracking-[-0.035em]"
              style={{ fontFamily: DISPLAY_FONT_STACK }}
            >
              Let&apos;s talk
              <br />
              about the idea.
            </h1>

            <div
              className="my-7 h-px w-14"
              style={{ backgroundColor: "#87ABB8" }}
            />

            <p
              className="text-sm leading-6"
              style={{ color: "#66645E" }}
            >
              A short founder interview to close the gaps before BrandForge
              builds your identity system.
            </p>

            <div className="mt-10 space-y-5">
              <div>
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "#0D3440" }}
                >
                  What happens here
                </p>
                <p className="text-sm leading-6" style={{ color: "#171716" }}>
                  Answer one question at a time. Your answers are added to the
                  conversation automatically.
                </p>
              </div>

              <div>
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "#0D3440" }}
                >
                  Keep it natural
                </p>
                <p className="text-sm leading-6" style={{ color: "#66645E" }}>
                  There&apos;s no need to write a polished pitch. Explain it the
                  way you would explain it to another founder.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Interview area */}
        <section className="flex min-h-0 min-w-0 flex-col">
          {/* Mobile title */}
          <div
            className="border-b px-5 py-6 lg:hidden"
            style={{ borderColor: "#DCD9D0" }}
          >
            <p
              className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em]"
              style={{ color: "#0D3440" }}
            >
              Founder interview
            </p>
            <h1
              className="text-[38px] leading-none tracking-[-0.035em]"
              style={{ fontFamily: DISPLAY_FONT_STACK }}
            >
              Let&apos;s talk about the idea.
            </h1>
          </div>

          <div className="mx-auto flex w-full max-w-[900px] min-h-0 flex-1 flex-col px-5 pb-5 pt-7 sm:px-8 sm:pt-10">
            {/* Conversation heading */}
            <div className="mb-5 flex items-end justify-between gap-5">
              <div>
                <p
                  className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "#0D3440" }}
                >
                  Conversation
                </p>
                <h2
                  className="text-[25px] tracking-[-0.02em]"
                  style={{ fontFamily: DISPLAY_FONT_STACK }}
                >
                  Tell me what matters.
                </h2>
              </div>

              {shouldRunChatMode && (
                <p
                  className="hidden text-[11px] sm:block"
                  style={{ color: "#77746C" }}
                >
                  Press Enter to send · Shift + Enter for a new line
                </p>
              )}
            </div>

            {/* Transcript */}
            <div
              className="min-h-0 flex-1 overflow-y-auto rounded-[18px] border p-4 sm:p-6"
              style={{
                borderColor: "#DCD9D0",
                backgroundColor: "#F0EEE8",
              }}
            >
              <div className="mx-auto max-w-[760px] space-y-5">
                {chatTranscript.map((message, index) => {
                  const isFounder = message.speakerRole === "founder";

                  return (
                    <div
                      key={index}
                      className={`flex ${isFounder ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex max-w-[88%] gap-3 sm:max-w-[78%] ${
                          isFounder ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div
                          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold uppercase"
                          style={
                            isFounder
                              ? {
                                  backgroundColor: "#0D3440",
                                  color: "#FFFFFF",
                                }
                              : {
                                  backgroundColor: "#D9E8EA",
                                  color: "#0D3440",
                                }
                          }
                        >
                          {isFounder ? "You" : "BF"}
                        </div>

                        <div
                          className={`rounded-[16px] border px-4 py-3.5 ${
                            isFounder
                              ? "rounded-tr-[5px]"
                              : "rounded-tl-[5px]"
                          }`}
                          style={
                            isFounder
                              ? {
                                  borderColor: "#0D3440",
                                  backgroundColor: "#0D3440",
                                  color: "#FFFFFF",
                                }
                              : {
                                  borderColor: "#DCD9D0",
                                  backgroundColor: "#FFFFFF",
                                  color: "#171716",
                                }
                          }
                        >
                          <p className="whitespace-pre-wrap text-[14px] leading-6">
                            {message.messageText}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isSubmittingAnswers && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-semibold"
                        style={{
                          backgroundColor: "#D9E8EA",
                          color: "#0D3440",
                        }}
                      >
                        BF
                      </div>
                      <div
                        className="rounded-[16px] rounded-tl-[5px] border bg-white px-4 py-3"
                        style={{ borderColor: "#DCD9D0" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: "#87ABB8" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: "#87ABB8" }}
                          />
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: "#87ABB8" }}
                          />
                          <span
                            className="ml-1 text-[11px]"
                            style={{ color: "#77746C" }}
                          >
                            Thinking
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            </div>

            {/* Composer / final action */}
            {shouldRunChatMode && !isRoundComplete && !isSubmittingAnswers ? (
              <div className="pt-4">
                <div
                  className="rounded-[16px] border bg-white p-2"
                  style={{ borderColor: "#CFCBC1" }}
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      value={currentAnswerDraft}
                      onChange={(event) =>
                        setCurrentAnswerDraft(event.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      rows={2}
                      autoFocus
                      placeholder="Write your answer here…"
                      className="min-h-[52px] flex-1 resize-none border-0 bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-[#96938B]"
                    />

                    <button
                      onClick={handleSendAnswer}
                      disabled={!currentAnswerDraft.trim()}
                      aria-label="Send answer"
                      className="flex h-[48px] shrink-0 items-center justify-center rounded-[12px] px-4 text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                      style={{ backgroundColor: "#0D3440" }}
                    >
                      Send
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 pt-3">
                  <p className="text-[11px]" style={{ color: "#8A877F" }}>
                    Be specific when you can. Short answers are completely fine.
                  </p>

                  <button
                    onClick={onProceedToBuild}
                    className="text-[11px] font-medium underline decoration-[#BDB9AF] underline-offset-4 transition-colors hover:text-[#0D3440]"
                    style={{ color: "#77746C" }}
                  >
                    Skip the rest — build with what you have
                  </button>
                </div>
              </div>
            ) : (
              !shouldRunChatMode &&
              !isSubmittingAnswers && (
                <div
                  className="mt-4 flex items-center justify-between gap-5 rounded-[16px] border bg-white p-4 sm:p-5"
                  style={{ borderColor: "#DCD9D0" }}
                >
                  <div>
                    <p
                      className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: "#0D3440" }}
                    >
                      Ready
                    </p>
                    <p
                      className="text-sm leading-5"
                      style={{ color: "#66645E" }}
                    >
                      The interview is complete. You can move on to the brand
                      build.
                    </p>
                  </div>

                  <button
                    onClick={onProceedToBuild}
                    className="shrink-0 rounded-[12px] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: "#0D3440" }}
                  >
                    Build my brand
                  </button>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
