"""
Stage 1 of the pipeline ("Understand"). Takes the founder's one rough
sentence and extracts the structured problem/audience/constraint picture
that every later stage builds on. This is the node that stops the system
from jumping straight to branding before the problem is actually understood.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import build_groq_chat_model, run_structured_completion

IDEA_CLARIFICATION_SYSTEM_PROMPT = """You are a sharp startup strategist conducting a founder discovery interview.
Given a single rough idea sentence, extract a structured, honest analysis. Do not invent
specifics the founder didn't imply — where information is genuinely missing, note it as an
open question rather than fabricating detail. Be specific and avoid generic startup language
like "innovative solution" or "seamless experience".

Return JSON with exactly these keys:
{
  "coreProblemStatement": "one sharp sentence naming the real problem",
  "targetAudienceDescription": "specific description of who this is for, not 'everyone'",
  "situationalContext": "when/where/why this problem shows up for the audience",
  "hardConstraints": ["constraint 1", "constraint 2"],
  "coreValueProposition": "one sentence: the clearest value this delivers",
  "openQuestionsForFounder": ["question the founder should answer before branding proceeds"]
}"""


def idea_clarification_node(session_state: BrandKitSession) -> BrandKitSession:
    chat_model = build_groq_chat_model()
    rough_idea_text = session_state["founderRawInput"]["roughIdeaText"]

    clarification_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=IDEA_CLARIFICATION_SYSTEM_PROMPT,
        user_content=f"Founder's rough idea: {rough_idea_text}",
    )

    session_state["ideaClarification"] = clarification_result
    session_state["currentStageName"] = "idea_clarification_complete"
    session_state.setdefault("stageLog", []).append(
        f"Stage 1 (Understand): extracted problem — {clarification_result.get('coreProblemStatement', '')}"
    )
    return session_state
