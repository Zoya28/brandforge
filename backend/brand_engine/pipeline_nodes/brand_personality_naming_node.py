"""
Stage 4 ("Shape"). Takes the winning positioning direction and develops
personality traits (with what to avoid), naming directions with rationale,
a tagline, and a one-line pitch. Every output here must trace back to the
winning direction from the debate stage, not float free of it.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import build_groq_chat_model, run_structured_completion

PERSONALITY_NAMING_SYSTEM_PROMPT = """You are a brand strategist developing personality and naming
for a brand, given its winning positioning direction. Choose 3-5 personality traits that specifically
fit this audience and positioning (not generic ones like "innovative" or "friendly" — be precise,
e.g. "quietly competent rather than hype-driven"). Also name 2-3 traits to explicitly avoid, since
knowing what NOT to be is as important as knowing what to be. Generate 4-6 naming directions with
a one-sentence rationale each, grounded in the positioning — avoid cliche startup naming patterns
(no random compound words, no meaningless suffixes like "-ify" or "-ly" unless genuinely justified).

Return JSON:
{
  "traitsToEmbody": ["specific trait with brief justification folded in", ...],
  "traitsToAvoid": ["trait to avoid and why", ...],
  "namingDirections": [{"candidateName": "...", "rationale": "..."}, ...],
  "onelinePitch": "one sentence a founder could say out loud",
  "tagline": "short memorable tagline"
}"""


def brand_personality_naming_node(session_state: BrandKitSession) -> BrandKitSession:
    chat_model = build_groq_chat_model()
    winning_direction = session_state["positioningDebate"]["winningDirection"]
    idea_clarification = session_state["ideaClarification"]

    context_summary = (
        f"Audience: {idea_clarification['targetAudienceDescription']}\n"
        f"Winning positioning direction: {winning_direction['directionLabel']}\n"
        f"Category framing: {winning_direction['categoryFraming']}\n"
        f"Differentiator: {winning_direction['differentiator']}\n"
        f"Value proposition: {winning_direction['valuePropositionStatement']}"
    )

    personality_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=PERSONALITY_NAMING_SYSTEM_PROMPT,
        user_content=context_summary,
    )

    session_state["brandPersonality"] = personality_result
    session_state["currentStageName"] = "brand_personality_complete"
    session_state.setdefault("stageLog", []).append(
        f"Stage 4 (Shape): defined {len(personality_result.get('traitsToEmbody', []))} personality traits, "
        f"{len(personality_result.get('namingDirections', []))} naming directions"
    )
    return session_state
