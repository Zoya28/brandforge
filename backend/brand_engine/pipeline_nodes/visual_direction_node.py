"""
Stage 5 ("Visualize").

Turns the brand's positioning + personality into a short, distinctive
visual design brief. The output should feel specific to this brand rather
than falling back to the same generic "warm, modern, clean" identity.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import (
    build_groq_chat_model,
    run_structured_completion,
)


VISUAL_DIRECTION_SYSTEM_PROMPT = """You are an expert brand identity designer.

Create a DISTINCT visual direction for this specific brand.

Do NOT default to generic combinations like:
- blue + white
- minimal + modern
- rounded sans-serif
- "clean and trustworthy"
- generic tech/startup aesthetics

Use the brand's positioning, personality, audience, and tagline to make
deliberate visual choices. Different brands should receive noticeably
different visual identities.

Be concise. Every field should contain useful, concrete design direction.

Return JSON with exactly these keys:
{
  "typographyDirection": "font character, contrast, weight, and why it fits",
  "colorMoodDescription": "distinct color family, temperature, contrast, and why",
  "compositionAndImageryStyle": "layout, imagery, shapes, and visual behavior",
  "symbolicMotifs": ["2-4 specific visual motifs or metaphors"],
  "conceptsToAvoid": ["2-4 category-specific visual clichés to avoid"]
}

Do not invent facts about the company.
Do not use vague words without explaining the visual choice."""


def visual_direction_node(session_state: BrandKitSession) -> BrandKitSession:
    chat_model = build_groq_chat_model()

    winning_direction = session_state["positioningDebate"]["winningDirection"]
    brand_personality = session_state["brandPersonality"]

    context_summary = (
        f"Position: {winning_direction['directionLabel']}\n"
        f"Framing: {winning_direction['categoryFraming']}\n"
        f"Personality: {', '.join(brand_personality['traitsToEmbody'])}\n"
        f"Avoid: {', '.join(brand_personality['traitsToAvoid'])}\n"
        f"Tagline: {brand_personality['tagline']}"
    )

    visual_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=VISUAL_DIRECTION_SYSTEM_PROMPT,
        user_content=context_summary,
    )

    session_state["visualDirection"] = visual_result
    session_state["currentStageName"] = "visual_direction_complete"
    session_state.setdefault("stageLog", []).append(
        "Stage 5 (Visualize): generated a brand-specific visual direction"
    )
    return session_state