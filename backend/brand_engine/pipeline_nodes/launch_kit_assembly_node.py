"""
Stage 7 ("Deliver"). Produces launch-ready content — a landing page headline,
a social launch post draft, and the final one-line pitch — using the FINAL
(post-consistency-audit) version of the brand system, so nothing here
contradicts what the audit already fixed.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import build_groq_chat_model, run_structured_completion

LAUNCH_KIT_SYSTEM_PROMPT = """You are a launch copywriter. Using the finalized brand system below
(positioning, personality, tagline, visual direction — already checked for internal consistency),
write launch-ready content that stays strictly within the established personality. Do not introduce
a tone or claim that contradicts the traits-to-avoid list.

Return JSON:
{
  "landingPageHeadline": "a real headline, not a placeholder",
  "socialLaunchPostDraft": "a short launch post, 2-4 sentences, in the brand's voice",
  "finalOnelinePitch": "the polished final one-line pitch"
}"""


def launch_kit_assembly_node(session_state: BrandKitSession) -> BrandKitSession:
    chat_model = build_groq_chat_model()
    winning_direction = session_state["positioningDebate"]["winningDirection"]
    brand_personality = session_state["brandPersonality"]
    visual_direction = session_state["visualDirection"]

    final_brand_system_summary = (
        f"Positioning: {winning_direction['valuePropositionStatement']}\n"
        f"Personality to embody: {brand_personality['traitsToEmbody']}\n"
        f"Personality to avoid: {brand_personality['traitsToAvoid']}\n"
        f"Tagline: {brand_personality['tagline']}\n"
        f"Visual mood for tone matching: {visual_direction['colorMoodDescription']}"
    )

    launch_kit_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=LAUNCH_KIT_SYSTEM_PROMPT,
        user_content=final_brand_system_summary,
    )

    session_state["launchKit"] = launch_kit_result
    session_state["currentStageName"] = "launch_kit_complete"
    session_state.setdefault("stageLog", []).append(
        "Stage 7 (Deliver): assembled landing headline, social post, and final pitch"
    )
    return session_state
