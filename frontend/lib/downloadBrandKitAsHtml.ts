// downloadBrandKitAsHtml.ts
//
// Builds a single, self-contained HTML file of the finished brand kit,
// styled as the same editorial guideline book shown on screen (same
// accent-derivation logic, same section structure, same system font
// stacks so it has no external dependencies) — and triggers a browser
// download via a Blob. No backend round-trip needed; everything the kit
// needs is already in session state.

import { BrandKitSession } from "./brandKitSessionTypes";
import { deriveBrandAccentPalette } from "./deriveBrandAccentPalette";

const DISPLAY_FONT_STACK = '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif';
const BODY_FONT_STACK = '-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export function downloadBrandKitAsHtml(sessionState: BrandKitSession) {
  const personality = sessionState.brandPersonality;
  const visual = sessionState.visualDirection;
  const launch = sessionState.launchKit;
  const positioning = sessionState.positioningDebate;

  if (!personality || !visual || !launch || !positioning) return;

  const primaryName = personality.namingDirections[0]?.candidateName || "Brand Kit";
  const accent = deriveBrandAccentPalette(visual.colorMoodDescription);

  const logoBlockHtml = sessionState.logoConceptImageDataUri
    ? `<img src="${sessionState.logoConceptImageDataUri}" alt="Logo" style="height:112px;width:112px;object-fit:contain;border:1px solid ${"#E4E1D8"};border-radius:16px;padding:12px;background:#fff;" />`
    : `<div style="height:112px;width:112px;border:1px solid #E4E1D8;border-radius:16px;display:flex;align-items:center;justify-content:center;font-family:${DISPLAY_FONT_STACK};font-size:32px;color:${accent.baseHex};">${primaryName.charAt(0)}</div>`;

  const logoShowcaseHtml = sessionState.logoConceptImageDataUri
    ? `<img src="${sessionState.logoConceptImageDataUri}" alt="Logo concept" style="max-height:220px;max-width:220px;object-fit:contain;" />`
    : `<p style="font-size:14px;color:#6B6860;">No logo concept was generated for this run.</p>`;

  const traitsEmbodyHtml = personality.traitsToEmbody
    .map((trait) => `<li style="margin-bottom:10px;"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${accent.baseHex};margin-right:10px;"></span>${trait}</li>`)
    .join("");
  const traitsAvoidHtml = personality.traitsToAvoid
    .map((trait) => `<li style="margin-bottom:8px;color:#6B6860;font-size:14px;">${trait}</li>`)
    .join("");

  const namingRowsHtml = personality.namingDirections
    .map(
      (n) => `<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px;padding:18px 0;border-bottom:1px solid #E4E1D8;">
        <p style="font-family:${DISPLAY_FONT_STACK};font-size:20px;margin:0;">${n.candidateName}</p>
        <p style="font-size:14px;color:#6B6860;margin:0;line-height:1.6;">${n.rationale}</p>
      </div>`
    )
    .join("");

  const motifsHtml = visual.symbolicMotifs.map((m) => `<li style="font-size:14px;margin-bottom:4px;">${m}</li>`).join("");
  const avoidConceptsHtml = visual.conceptsToAvoid.map((c) => `<li style="font-size:14px;color:#6B6860;margin-bottom:4px;">${c}</li>`).join("");

  const swatchHtml = [
    { hex: accent.tintHex, label: "Tint" },
    { hex: accent.baseHex, label: "Primary" },
    { hex: accent.deepHex, label: "Deep" },
    { hex: "#1A1A18", label: "Ink" },
  ]
    .map(
      (s) => `<div>
        <div style="height:72px;border-radius:8px;background:${s.hex};margin-bottom:6px;"></div>
        <p style="font-size:12px;color:#6B6860;margin:0;">${s.label}</p>
        <p style="font-size:12px;color:#6B6860;margin:0;text-transform:uppercase;">${s.hex}</p>
      </div>`
    )
    .join("");

  const sectionFolio = (number: string, label: string) =>
    `<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #E4E1D8;padding-bottom:12px;margin-bottom:36px;">
      <span style="font-size:14px;color:${accent.baseHex};">${number} <span style="color:#6B6860;">/ 06</span></span>
      <h3 style="font-family:${DISPLAY_FONT_STACK};font-size:24px;margin:0;">${label}</h3>
    </div>`;

  const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${primaryName} — Brand Guidelines</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: ${BODY_FONT_STACK}; background: #FAFAF9; color: #1A1A18; margin: 0; line-height: 1.6; }
  section { max-width: 720px; margin: 0 auto; padding: 80px 24px; }
  @media (max-width: 640px) {
    section { padding: 48px 20px; }
    .grid-2 { grid-template-columns: 1fr !important; }
    .grid-4 { grid-template-columns: repeat(2, 1fr) !important; }
  }
</style>
</head>
<body>

  <section style="text-align:center; min-height:70vh; display:flex; flex-direction:column; align-items:center; justify-content:center;">
    <p style="font-size:12px; letter-spacing:0.03em; color:${accent.baseHex}; margin-bottom:32px;">Brand Guidelines</p>
    <div style="margin-bottom:40px;">${logoBlockHtml}</div>
    <h1 style="font-family:${DISPLAY_FONT_STACK}; font-size:56px; margin:0 0 16px;">${primaryName}</h1>
    <div style="width:64px; height:1px; background:${accent.baseHex}; margin-bottom:24px;"></div>
    <p style="max-width:420px; font-size:18px; color:#6B6860; margin:0;">${personality.tagline}</p>
    <p style="max-width:380px; font-size:14px; font-style:italic; color:#6B6860; margin-top:40px;">${visual.compositionAndImageryStyle}</p>
  </section>

  <section>
    ${sectionFolio("01", "Positioning")}
    <p style="font-family:${DISPLAY_FONT_STACK}; font-size:28px; line-height:1.4; margin-bottom:32px;">&ldquo;${positioning.winningDirection.valuePropositionStatement}&rdquo;</p>
    <div class="grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
      <div>
        <p style="font-size:12px; color:${accent.baseHex}; margin-bottom:4px;">Category</p>
        <p style="font-size:14px; margin:0;">${positioning.winningDirection.categoryFraming}</p>
      </div>
      <div>
        <p style="font-size:12px; color:${accent.baseHex}; margin-bottom:4px;">Differentiator</p>
        <p style="font-size:14px; margin:0;">${positioning.winningDirection.differentiator}</p>
      </div>
    </div>
  </section>

  <section>
    ${sectionFolio("02", "Personality")}
    <div class="grid-2" style="display:grid; grid-template-columns:2fr 1fr; gap:40px;">
      <div>
        <p style="font-size:12px; color:${accent.baseHex}; margin-bottom:16px;">The brand is</p>
        <ul style="list-style:none; padding:0; margin:0;">${traitsEmbodyHtml}</ul>
      </div>
      <div>
        <p style="font-size:12px; color:#6B6860; margin-bottom:16px;">Never</p>
        <ul style="list-style:none; padding:0; margin:0;">${traitsAvoidHtml}</ul>
      </div>
    </div>
  </section>

  <section>
    ${sectionFolio("03", "Naming")}
    ${namingRowsHtml}
  </section>

  <section>
    ${sectionFolio("04", "Visual identity")}

    <p style="font-size:12px; color:${accent.baseHex}; margin-bottom:16px;">Color</p>
    <div class="grid-4" style="display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:16px;">${swatchHtml}</div>
    <p style="font-size:14px; margin-bottom:48px;">${visual.colorMoodDescription}</p>

    <p style="font-size:12px; color:${accent.baseHex}; margin-bottom:16px;">Typography</p>
    <div style="border:1px solid #E4E1D8; border-radius:8px; padding:24px; margin-bottom:16px;">
      <p style="font-family:${DISPLAY_FONT_STACK}; font-size:56px; margin:0 0 16px;">Aa</p>
      <p style="font-family:${DISPLAY_FONT_STACK}; font-size:22px; margin:0 0 8px;">${primaryName} sets the tone</p>
      <p style="font-size:14px; color:#6B6860; margin:0;">The quick brown fox jumps over the lazy dog — 0123456789</p>
    </div>
    <p style="font-size:14px; margin-bottom:48px;">${visual.typographyDirection}</p>

    <p style="font-size:12px; color:${accent.baseHex}; margin-bottom:16px;">Imagery &amp; motifs</p>
    <p style="font-size:14px; margin-bottom:16px;">${visual.compositionAndImageryStyle}</p>
    <div class="grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:24px;">
      <div>
        <p style="font-size:12px; color:#6B6860; margin-bottom:8px;">Motifs</p>
        <ul style="list-style:none; padding:0; margin:0;">${motifsHtml}</ul>
      </div>
      <div>
        <p style="font-size:12px; color:#6B6860; margin-bottom:8px;">Avoid</p>
        <ul style="list-style:none; padding:0; margin:0;">${avoidConceptsHtml}</ul>
      </div>
    </div>
  </section>

  <section>
    ${sectionFolio("05", "Logo")}
    <div style="min-height:280px; display:flex; align-items:center; justify-content:center; border:1px solid #E4E1D8; border-radius:8px; background:#fff; padding:48px;">
      ${logoShowcaseHtml}
    </div>
  </section>

  <section>
    ${sectionFolio("06", "Voice & launch")}
    <p style="font-family:${DISPLAY_FONT_STACK}; font-size:34px; line-height:1.3; margin:0 0 8px;">${launch.landingPageHeadline}</p>
    <p style="font-size:14px; color:#6B6860; margin-bottom:40px;">${launch.finalOnelinePitch}</p>
    <div style="background:${accent.tintHex}; border-radius:8px; padding:24px;">
      <p style="font-size:12px; color:${accent.deepHex}; margin-bottom:8px;">Sample launch post</p>
      <p style="font-size:14px; margin:0;">${launch.socialLaunchPostDraft}</p>
    </div>
  </section>

  <p style="text-align:center; font-size:12px; color:#6B6860; padding:40px 24px; border-top:1px solid #E4E1D8;">
    End of brand guidelines — generated by BrandForge
  </p>

</body>
</html>`;

  const blob = new Blob([htmlDocument], { type: "text/html" });
  const downloadUrl = URL.createObjectURL(blob);
  const anchorElement = document.createElement("a");
  anchorElement.href = downloadUrl;
  anchorElement.download = `${primaryName.replace(/\s+/g, "-").toLowerCase()}-brand-guidelines.html`;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
  URL.revokeObjectURL(downloadUrl);
}
