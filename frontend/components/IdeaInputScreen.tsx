"use client";

import { useState } from "react";

interface IdeaInputScreenProps {
  onSubmitIdea: (roughIdeaText: string) => void;
  isSubmitDisabled: boolean;
}

const exampleIdeas = [
  "An app that helps students find reliable teammates for projects.",
  "A platform where small businesses can create professional content with AI.",
  "A community for people learning English through daily conversations.",
];

export default function IdeaInputScreen({
  onSubmitIdea,
  isSubmitDisabled,
}: IdeaInputScreenProps) {
  const [roughIdeaDraft, setRoughIdeaDraft] = useState("");

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (roughIdeaDraft.trim().length < 10) return;

    onSubmitIdea(roughIdeaDraft.trim());
  };

  const useExample = (idea: string) => {
    setRoughIdeaDraft(idea);
  };

  const characterCount = roughIdeaDraft.trim().length;

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#172b3a]">
      {/* Top navigation */}
      <header className="flex h-[58px] items-center justify-between border-b border-[#d9d8d2] px-6 sm:px-8 lg:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#173746] text-[10px] font-semibold tracking-wide text-white">
            BF
          </div>

          <span className="text-[12px] font-semibold tracking-[0.14em]">
            BRANDFORGE
          </span>
        </div>

        <div className="hidden items-center gap-7 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71808a] sm:flex">
          <span>Identity System</span>
          <span>2026</span>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto grid min-h-[calc(100vh-58px)] max-w-[1440px] grid-cols-1 lg:grid-cols-[250px_1fr]">
        {/* Left editorial panel */}
        <aside className="border-b border-[#d9d8d2] px-6 py-7 sm:px-8 lg:border-b-0 lg:border-r lg:px-9 lg:py-10">
          <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4b7484]">
            01 / BEGIN
          </div>

          <h2 className="mt-5 font-serif text-[34px] leading-[0.98] tracking-[-0.035em] text-[#172b3a] sm:text-[38px]">
            Start with
            <br />
            the idea.
          </h2>

          <div className="mt-6 h-px w-12 bg-[#8eb2bf]" />

          <p className="mt-5 max-w-[190px] text-[12px] leading-5 text-[#697780]">
            You don't need a polished pitch. Give BrandForge the rough version
            of what you're thinking.
          </p>

          <div className="mt-9">
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#4b7484]">
              WHAT HAPPENS NEXT
            </p>

            <div className="mt-4 space-y-4">
              <Step number="01" title="Understand" />
              <Step number="02" title="Question" />
              <Step number="03" title="Shape" />
              <Step number="04" title="Build" />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex items-center px-6 py-7 sm:px-8 lg:px-12 xl:px-16">
          <div className="mx-auto w-full max-w-[820px]">
            {/* Intro */}
            <div className="max-w-[700px]">
              <div className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#4b7484]">
                FOUNDER DISCOVERY
              </div>

              <h1 className="mt-4 font-serif text-[44px] leading-[0.98] tracking-[-0.045em] text-[#172b3a] sm:text-[52px] lg:text-[60px]">
                What are you
                <br />
                building?
              </h1>

              <p className="mt-5 max-w-[600px] text-[13px] leading-6 text-[#697780]">
                Tell us the idea as it exists in your head right now. Messy,
                incomplete, or half-formed is completely fine.
              </p>
            </div>

            {/* Input card */}
            <form onSubmit={handleFormSubmit} className="mt-7">
              <div className="overflow-hidden rounded-[16px] border border-[#d6d5ce] bg-[#efeee9] shadow-[0_6px_24px_rgba(23,43,58,0.04)]">
                <div className="flex items-center justify-between border-b border-[#d8d7d0] px-5 py-3">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#536b76]">
                    YOUR ROUGH IDEA
                  </span>

                  <span className="text-[10px] text-[#8a9295]">
                    {characterCount > 0
                      ? `${characterCount} characters`
                      : "Start anywhere"}
                  </span>
                </div>

                <textarea
                  value={roughIdeaDraft}
                  onChange={(event) => setRoughIdeaDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      roughIdeaDraft.trim().length >= 10
                    ) {
                      event.preventDefault();
                      handleFormSubmit(event);
                    }
                  }}
                  placeholder="I want to build..."
                  rows={5}
                  autoFocus
                  className="w-full resize-none bg-transparent px-5 py-5 text-[16px] leading-7 text-[#172b3a] outline-none placeholder:text-[#9ba2a4]"
                />

                <div className="flex flex-col gap-3 border-t border-[#d8d7d0] px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[10px] leading-4 text-[#7d878c]">
                    One or two sentences is enough. Don't worry about making it
                    sound impressive.
                  </p>

                  <button
                    type="submit"
                    disabled={
                      isSubmitDisabled || roughIdeaDraft.trim().length < 10
                    }
                    className="group flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#173746] px-5 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#244b5a] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {isSubmitDisabled ? (
                      "Building..."
                    ) : (
                      <>
                        Start discovery
                        <span className="text-[14px] transition-transform duration-200 group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Examples */}
              <div className="mt-5">
                <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#7d898e]">
                  NEED A STARTING POINT?
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {exampleIdeas.map((idea, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => useExample(idea)}
                      className="rounded-full border border-[#d5d5ce] bg-transparent px-3 py-1.5 text-left text-[10px] leading-4 text-[#64727a] transition hover:border-[#8eabb5] hover:bg-[#eeece6] hover:text-[#173746]"
                    >
                      {idea}
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer hint */}
              <div className="mt-6 flex flex-col gap-1.5 border-t border-[#dddcd6] pt-4 text-[9px] uppercase tracking-[0.1em] text-[#899196] sm:flex-row sm:items-center sm:justify-between">
                <span>Your idea stays the starting point.</span>
                <span>Enter ↵ to continue</span>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[9px] font-semibold tracking-[0.12em] text-[#9aa5a9]">
        {number}
      </span>

      <div className="h-px w-4 bg-[#c7c9c5]" />

      <span className="text-[11px] font-medium tracking-wide text-[#53636c]">
        {title}
      </span>
    </div>
  );
}