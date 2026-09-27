"use client";

import { BrandKitSession } from "@/lib/brandKitSessionTypes";
import { deriveBrandAccentPalette } from "@/lib/deriveBrandAccentPalette";
import { downloadBrandKitAsHtml } from "@/lib/downloadBrandKitAsHtml";

interface FinalBrandKitViewProps {
  sessionState: BrandKitSession;
  onStartOver: () => void;
}

const DISPLAY_FONT_STACK =
  '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';

const SANS_FONT_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

function SectionHeader({
  number,
  total,
  label,
  eyebrow,
}: {
  number: string;
  total: string;
  label: string;
  eyebrow: string;
}) {
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between border-b pb-2 text-[9px] font-medium uppercase tracking-[0.08em]"
        style={{
          borderColor: "var(--kit-hairline)",
          color: "var(--kit-ink-muted)",
        }}
      >
        <span>
          <span style={{ color: "var(--kit-accent-base)" }}>{number}</span> /{" "}
          {total}
        </span>
        <span>{eyebrow}</span>
      </div>

      <h2
        className="mt-3 text-[36px] leading-none tracking-[-0.035em] sm:text-[42px]"
        style={{
          fontFamily: DISPLAY_FONT_STACK,
          color: "var(--kit-ink)",
        }}
      >
        {label}
      </h2>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em]"
      style={{ color: "var(--kit-accent-deep)" }}
    >
      {children}
    </p>
  );
}

export default function FinalBrandKitView({
  sessionState,
  onStartOver,
}: FinalBrandKitViewProps) {
  const personality = sessionState.brandPersonality;
  const visual = sessionState.visualDirection;
  const launch = sessionState.launchKit;
  const positioning = sessionState.positioningDebate;

  if (!personality || !visual || !launch || !positioning) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center text-sm text-neutral-500">
        Brand kit incomplete — something went wrong before every stage finished.
      </div>
    );
  }

  const accentPalette = deriveBrandAccentPalette(
    visual.colorMoodDescription
  );

  const primaryName =
    personality.namingDirections[0]?.candidateName || "Your Brand";

  const kitCssVariables = {
    "--kit-paper": "#F7F6F2",
    "--kit-white": "#FFFFFF",
    "--kit-ink": "#171716",
    "--kit-ink-muted": "#66645E",
    "--kit-hairline": "#DCD9D0",
    "--kit-accent-tint": accentPalette.tintHex,
    "--kit-accent-base": accentPalette.baseHex,
    "--kit-accent-deep": accentPalette.deepHex,
    "--kit-accent-ink": accentPalette.inkOnAccentHex,
  } as React.CSSProperties;

  const colorSwatches = [
    { hex: accentPalette.tintHex, label: "Tint" },
    { hex: accentPalette.baseHex, label: "Primary" },
    { hex: accentPalette.deepHex, label: "Deep" },
    { hex: "#1A1A18", label: "Ink" },
  ];

  return (
    <main
      className="min-h-screen overflow-x-hidden"
      style={{
        ...kitCssVariables,
        backgroundColor: "var(--kit-paper)",
        fontFamily: SANS_FONT_STACK,
      }}
    >
      {/* HEADER */}
      <header
        className="sticky top-0 z-40 border-b bg-[#F7F6F2]/95 backdrop-blur"
        style={{ borderColor: "var(--kit-hairline)" }}
      >
        <div className="mx-auto flex h-11 max-w-[1180px] items-center justify-between px-5">
          <span
            className="text-[10px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--kit-ink-muted)" }}
          >
            BrandForge · Brand Kit
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadBrandKitAsHtml(sessionState)}
              className="rounded-full border px-3 py-1.5 text-[10px] font-medium transition hover:bg-white"
              style={{
                borderColor: "#AAA8A1",
                color: "var(--kit-ink)",
              }}
            >
              Download
            </button>

            <button
              onClick={onStartOver}
              className="rounded-full px-3 py-1.5 text-[10px] font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: "var(--kit-ink)" }}
            >
              Build another
            </button>
          </div>
        </div>
      </header>

      {/* COMPACT COVER */}
      <section
        className="border-b"
        style={{ borderColor: "var(--kit-hairline)" }}
      >
        <div
          className="px-5 py-5 sm:px-8"
          style={{
            backgroundColor: "#B9B8B4",
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.18) .6px, transparent .6px), radial-gradient(rgba(0,0,0,.08) .6px, transparent .6px), linear-gradient(135deg,#c8c7c3,#aaa9a5)",
            backgroundSize: "5px 5px, 7px 7px, 100% 100%",
          }}
        >
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-4 flex justify-between text-[9px] font-medium uppercase tracking-[0.08em]">
              <span style={{ color: "var(--kit-accent-deep)" }}>
                BrandForge
              </span>
              <span style={{ color: "#4E4D49" }}>
                Identity system · 2026
              </span>
            </div>

            <div
              className="mx-auto overflow-hidden border shadow-[0_12px_25px_rgba(0,0,0,0.16)]"
              style={{
                borderColor: "rgba(0,0,0,0.12)",
                backgroundColor: "#F7F6F2",
              }}
            >
              <div className="grid min-h-[350px] items-center gap-8 px-7 py-8 sm:px-10 lg:grid-cols-[1.15fr_.85fr]">
                <div>
                  <p
                    className="mb-2 text-[9px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: "var(--kit-accent-deep)" }}
                  >
                    Brand identity
                  </p>

                  <h1
                    className="max-w-[600px] text-[52px] leading-[0.9] tracking-[-0.045em] sm:text-[68px] lg:text-[78px]"
                    style={{
                      fontFamily: DISPLAY_FONT_STACK,
                      color: "var(--kit-ink)",
                    }}
                  >
                    {primaryName}
                  </h1>

                  <div
                    className="my-5 h-px max-w-[360px]"
                    style={{
                      backgroundColor: "var(--kit-accent-base)",
                    }}
                  />

                  <p
                    className="max-w-[430px] text-sm leading-6"
                    style={{ color: "var(--kit-ink-muted)" }}
                  >
                    {personality.tagline}
                  </p>
                </div>

                <div className="flex justify-center lg:justify-end">
                  {sessionState.logoConceptImageDataUri ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sessionState.logoConceptImageDataUri}
                      alt={`${primaryName} logo`}
                      className="h-[190px] w-[240px] object-contain sm:h-[220px]"
                    />
                  ) : (
                    <div
                      className="flex h-[180px] w-[180px] items-center justify-center border text-7xl"
                      style={{
                        borderColor: "var(--kit-hairline)",
                        fontFamily: DISPLAY_FONT_STACK,
                        color: "var(--kit-accent-base)",
                      }}
                    >
                      {primaryName.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div
                className="grid border-t sm:grid-cols-3"
                style={{ borderColor: "var(--kit-hairline)" }}
              >
                <div
                  className="border-b p-4 sm:border-b-0 sm:border-r"
                  style={{ borderColor: "var(--kit-hairline)" }}
                >
                  <Label>Position</Label>
                  <p
                    className="text-xs leading-5"
                    style={{ color: "var(--kit-ink)" }}
                  >
                    {positioning.winningDirection.categoryFraming}
                  </p>
                </div>

                <div
                  className="border-b p-4 sm:border-b-0 sm:border-r"
                  style={{ borderColor: "var(--kit-hairline)" }}
                >
                  <Label>Visual mood</Label>
                  <p
                    className="text-xs leading-5"
                    style={{ color: "var(--kit-ink)" }}
                  >
                    {visual.compositionAndImageryStyle}
                  </p>
                </div>

                <div className="p-4">
                  <Label>System</Label>
                  <p
                    className="text-xs leading-5"
                    style={{ color: "var(--kit-ink)" }}
                  >
                    Strategy · Voice · Visual · Launch
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 01 POSITIONING */}
      <section className="mx-auto max-w-[1180px] px-5 py-10 sm:py-12">
        <SectionHeader
          number="01"
          total="06"
          label="Positioning"
          eyebrow="Strategy"
        />

        <div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
          <p
            className="text-[28px] leading-[1.12] tracking-[-0.025em] sm:text-[34px]"
            style={{
              fontFamily: DISPLAY_FONT_STACK,
              color: "var(--kit-ink)",
            }}
          >
            “{positioning.winningDirection.valuePropositionStatement}”
          </p>

          <div className="space-y-2">
            {[
              ["Category", positioning.winningDirection.categoryFraming],
              ["Differentiator", positioning.winningDirection.differentiator],
            ].map(([title, value]) => (
              <div
                key={title}
                className="rounded-lg border bg-white px-4 py-4"
                style={{ borderColor: "var(--kit-hairline)" }}
              >
                <Label>{title}</Label>
                <p
                  className="text-xs leading-5"
                  style={{ color: "var(--kit-ink)" }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 02 PERSONALITY */}
      <section
        className="border-y"
        style={{
          borderColor: "var(--kit-hairline)",
          backgroundColor: "#F0EEE8",
        }}
      >
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:py-12">
          <SectionHeader
            number="02"
            total="06"
            label="Personality"
            eyebrow="Character"
          />

          <div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]">
            <div>
              <Label>The brand is</Label>

              <div className="grid gap-2 sm:grid-cols-2">
                {personality.traitsToEmbody.map((trait, index) => (
                  <div
                    key={index}
                    className="rounded-lg border bg-white p-4"
                    style={{ borderColor: "var(--kit-hairline)" }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-semibold"
                        style={{
                          backgroundColor: "var(--kit-accent-tint)",
                          color: "var(--kit-accent-deep)",
                        }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span
                        className="text-[9px]"
                        style={{ color: "var(--kit-ink-muted)" }}
                      >
                        Trait
                      </span>
                    </div>

                    <p
                      className="text-xs leading-5"
                      style={{ color: "var(--kit-ink)" }}
                    >
                      {trait}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-lg border bg-white p-5"
              style={{ borderColor: "var(--kit-hairline)" }}
            >
              <p
                className="mb-4 text-[9px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "var(--kit-ink-muted)" }}
              >
                Never
              </p>

              <div className="space-y-3">
                {personality.traitsToAvoid.map((trait, index) => (
                  <div key={index} className="flex gap-3">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor: "var(--kit-ink-muted)",
                      }}
                    />

                    <p
                      className="text-xs leading-5"
                      style={{ color: "var(--kit-ink-muted)" }}
                    >
                      {trait}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 NAMING */}
      <section className="mx-auto max-w-[1180px] px-5 py-10 sm:py-12">
        <SectionHeader
          number="03"
          total="06"
          label="Naming"
          eyebrow="Verbal identity"
        />

        <div className="grid gap-2 sm:grid-cols-2">
          {personality.namingDirections.map((naming, index) => (
            <div
              key={index}
              className="rounded-lg border bg-white p-5"
              style={{ borderColor: "var(--kit-hairline)" }}
            >
              <span
                className="text-[9px] font-semibold"
                style={{ color: "var(--kit-accent-deep)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>

              <h3
                className="mt-5 text-[25px] leading-none"
                style={{
                  fontFamily: DISPLAY_FONT_STACK,
                  color: "var(--kit-ink)",
                }}
              >
                {naming.candidateName}
              </h3>

              <p
                className="mt-4 text-xs leading-5"
                style={{ color: "var(--kit-ink-muted)" }}
              >
                {naming.rationale}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 04 VISUAL IDENTITY */}
      <section
        className="border-y"
        style={{ borderColor: "var(--kit-hairline)" }}
      >
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:py-12">
          <SectionHeader
            number="04"
            total="06"
            label="Visual identity"
            eyebrow="Design system"
          />

          {/* COLORS */}
          <div className="mb-10">
            <div className="mb-5">
              <Label>Color</Label>
              <h3
                className="text-[23px]"
                style={{
                  fontFamily: DISPLAY_FONT_STACK,
                  color: "var(--kit-ink)",
                }}
              >
                The palette
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {colorSwatches.map((swatch) => (
                <div key={swatch.label}>
                  <div
                    className="h-[80px] border"
                    style={{
                      backgroundColor: swatch.hex,
                      borderColor: "rgba(0,0,0,.08)",
                    }}
                  />

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--kit-ink)" }}
                    >
                      {swatch.label}
                    </span>

                    <span
                      className="font-mono text-[8px] uppercase"
                      style={{ color: "var(--kit-ink-muted)" }}
                    >
                      {swatch.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-5 border-l-2 pl-4"
              style={{ borderColor: "var(--kit-accent-base)" }}
            >
              <p
                className="max-w-4xl text-xs leading-5"
                style={{ color: "var(--kit-ink-muted)" }}
              >
                {visual.colorMoodDescription}
              </p>
            </div>
          </div>

          {/* TYPOGRAPHY */}
          <div className="mb-10">
            <Label>Typography</Label>

            <div
              className="grid overflow-hidden rounded-lg border bg-white lg:grid-cols-[.55fr_1.45fr]"
              style={{ borderColor: "var(--kit-hairline)" }}
            >
              <div
                className="p-6"
                style={{ backgroundColor: "var(--kit-accent-base)" }}
              >
                <p
                  className="text-[72px] leading-none"
                  style={{
                    fontFamily: DISPLAY_FONT_STACK,
                    color: "var(--kit-accent-ink)",
                  }}
                >
                  Aa
                </p>

                <p
                  className="mt-7 text-[9px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: "var(--kit-accent-ink)" }}
                >
                  Display / Editorial
                </p>
              </div>

              <div className="p-6">
                <p
                  className="text-[25px] leading-tight"
                  style={{
                    fontFamily: DISPLAY_FONT_STACK,
                    color: "var(--kit-ink)",
                  }}
                >
                  {primaryName} sets the tone
                </p>

                <p
                  className="mt-3 text-xs"
                  style={{ color: "var(--kit-ink-muted)" }}
                >
                  The quick brown fox jumps over the lazy dog — 0123456789
                </p>

                <p
                  className="mt-5 text-xs leading-5"
                  style={{ color: "var(--kit-ink)" }}
                >
                  {visual.typographyDirection}
                </p>
              </div>
            </div>
          </div>

          {/* IMAGERY */}
          <div>
            <Label>Imagery & motifs</Label>

            <div
              className="mb-2 rounded-lg border bg-white p-5"
              style={{ borderColor: "var(--kit-hairline)" }}
            >
              <p
                className="text-sm leading-6"
                style={{ color: "var(--kit-ink)" }}
              >
                {visual.compositionAndImageryStyle}
              </p>
            </div>

            <div className="grid gap-2 lg:grid-cols-2">
              <div
                className="rounded-lg p-5"
                style={{
                  backgroundColor: "var(--kit-accent-tint)",
                }}
              >
                <p
                  className="mb-4 text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--kit-accent-deep)" }}
                >
                  Motifs
                </p>

                <div className="space-y-2">
                  {visual.symbolicMotifs.map((motif, index) => (
                    <div key={index} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: "var(--kit-accent-deep)",
                        }}
                      />

                      <p
                        className="text-xs leading-5"
                        style={{ color: "var(--kit-ink)" }}
                      >
                        {motif}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-lg border bg-white p-5"
                style={{ borderColor: "var(--kit-hairline)" }}
              >
                <p
                  className="mb-4 text-[9px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: "var(--kit-ink-muted)" }}
                >
                  Avoid
                </p>

                <div className="space-y-2">
                  {visual.conceptsToAvoid.map((concept, index) => (
                    <div key={index} className="flex gap-3">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: "var(--kit-ink-muted)",
                        }}
                      />

                      <p
                        className="text-xs leading-5"
                        style={{ color: "var(--kit-ink-muted)" }}
                      >
                        {concept}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 05 LOGO */}
      <section className="mx-auto max-w-[1180px] px-5 py-10 sm:py-12">
        <SectionHeader
          number="05"
          total="06"
          label="Logo"
          eyebrow="Primary mark"
        />

        <div
          className="overflow-hidden border bg-white"
          style={{ borderColor: "var(--kit-hairline)" }}
        >
          <div className="flex min-h-[300px] items-center justify-center p-6 sm:min-h-[340px]">
            {sessionState.logoConceptImageDataUri ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sessionState.logoConceptImageDataUri}
                alt={`${primaryName} logo concept`}
                className="max-h-[290px] max-w-[520px] object-contain"
              />
            ) : (
              <p
                className="text-xs"
                style={{ color: "var(--kit-ink-muted)" }}
              >
                No logo concept was generated for this run.
              </p>
            )}
          </div>

          <div
            className="border-t px-5 py-4"
            style={{
              borderColor: "var(--kit-hairline)",
              backgroundColor: "var(--kit-ink)",
              color: "white",
            }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-[0.08em]">
              Primary mark
            </p>

            <p
              className="mt-1 text-[20px]"
              style={{ fontFamily: DISPLAY_FONT_STACK }}
            >
              {primaryName}
            </p>

            <p className="mt-2 max-w-xl text-[10px] leading-4 opacity-70">
              Use the primary mark with generous clear space and preserve its
              proportions across applications.
            </p>
          </div>
        </div>
      </section>

      {/* 06 VOICE & LAUNCH */}
      <section
        className="border-t"
        style={{
          borderColor: "var(--kit-hairline)",
          backgroundColor: "#F0EEE8",
        }}
      >
        <div className="mx-auto max-w-[1180px] px-5 py-10 sm:py-12">
          <SectionHeader
            number="06"
            total="06"
            label="Voice & launch"
            eyebrow="Messaging"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <Label>Core message</Label>

              <h3
                className="max-w-xl text-[34px] leading-[1.05] tracking-[-0.025em]"
                style={{
                  fontFamily: DISPLAY_FONT_STACK,
                  color: "var(--kit-ink)",
                }}
              >
                {launch.landingPageHeadline}
              </h3>

              <p
                className="mt-4 max-w-xl text-xs leading-5"
                style={{ color: "var(--kit-ink-muted)" }}
              >
                {launch.finalOnelinePitch}
              </p>
            </div>

            <div
              className="border bg-white"
              style={{ borderColor: "var(--kit-hairline)" }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: "var(--kit-hairline)" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{
                    fontFamily: DISPLAY_FONT_STACK,
                    color: "var(--kit-ink)",
                  }}
                >
                  {primaryName}
                </span>

                <span
                  className="text-[9px] uppercase tracking-[0.08em]"
                  style={{ color: "var(--kit-ink-muted)" }}
                >
                  Launch copy
                </span>
              </div>

              <div className="p-5">
                <p
                  className="text-sm leading-6"
                  style={{ color: "var(--kit-ink)" }}
                >
                  {launch.socialLaunchPostDraft}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t"
        style={{ borderColor: "var(--kit-hairline)" }}
      >
        <div
          className="mx-auto flex max-w-[1180px] flex-col justify-between gap-2 px-5 py-5 text-[9px] sm:flex-row"
          style={{ color: "var(--kit-ink-muted)" }}
        >
          <span>Generated by BrandForge</span>
          <span>End of brand kit · {primaryName}</span>
        </div>
      </footer>
    </main>
  );
}