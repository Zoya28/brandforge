"""
Stage 6 ("Challenge/Test consistency"). This is the second standout feature:
an explicit critique pass that checks whether name, tagline, personality,
and visual direction actually feel like ONE brand — then revises whatever
doesn't fit, and keeps a visible before/after so judges can see the AI
checking its own work rather than trusting a single pass.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import build_groq_chat_model, run_structured_completion

CONSISTENCY_AUDIT_SYSTEM_PROMPT = """You are a rigorous brand consistency auditor. You are given a
complete brand system: positioning, personality traits (to embody and to avoid), tagline, and visual
direction. Your job is to find real contradictions — for example a "playful, informal" personality
trait paired with a "corporate, restrained" typography direction, or a tagline that contradicts the
stated differentiator. Do not invent problems if the system is genuinely coherent; say so honestly.
If you find conflicts, propose specific revisions to personality and/or visual direction that resolve
them while staying true to the underlying positioning.

Return JSON:
{
  "findings": [{"conflictDescription": "...", "conflictingElements": ["element 1", "element 2"],
                 "revisionSuggestion": "..."}],
  "overallConsistencyVerdict": "consistent" or "revised",
  "revisedPersonality": null or a full personality object matching the original schema with fixes applied,
  "revisedVisualDirection": null or a full visual direction object matching the original schema with fixes applied
}"""


def consistency_audit_node(session_state: BrandKitSession) -> BrandKitSession:
    chat_model = build_groq_chat_model()
    winning_direction = session_state["positioningDebate"]["winningDirection"]
    brand_personality = session_state["brandPersonality"]
    visual_direction = session_state["visualDirection"]

    full_brand_system_summary = (
        f"Positioning differentiator: {winning_direction['differentiator']}\n"
        f"Personality traits to embody: {brand_personality['traitsToEmbody']}\n"
        f"Personality traits to avoid: {brand_personality['traitsToAvoid']}\n"
        f"Tagline: {brand_personality['tagline']}\n"
        f"Naming directions: {[n['candidateName'] for n in brand_personality['namingDirections']]}\n"
        f"Typography direction: {visual_direction['typographyDirection']}\n"
        f"Color mood: {visual_direction['colorMoodDescription']}\n"
        f"Imagery style: {visual_direction['compositionAndImageryStyle']}"
    )

    audit_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=CONSISTENCY_AUDIT_SYSTEM_PROMPT,
        user_content=full_brand_system_summary,
    )

    session_state["consistencyAudit"] = audit_result
    session_state["currentStageName"] = "consistency_audit_complete"

    # If the audit revised anything, MERGE the revision into the existing
    # objects rather than overwriting them outright. LLMs are asked to return
    # a "full" revised object but frequently return only the fields they
    # actually changed — a full overwrite would silently drop the untouched
    # fields (e.g. colorMoodDescription vanishing), which then crashes a
    # later stage that expects every field to be present. Merging is safe
    # either way: complete responses merge to the same result, partial
    # responses no longer lose data.
    if audit_result.get("overallConsistencyVerdict") == "revised":
        if audit_result.get("revisedPersonality"):
            session_state["brandPersonality"] = {
                **brand_personality,
                **audit_result["revisedPersonality"],
            }
        if audit_result.get("revisedVisualDirection"):
            session_state["visualDirection"] = {
                **visual_direction,
                **audit_result["revisedVisualDirection"],
            }

    session_state.setdefault("stageLog", []).append(
        f"Stage 6 (Challenge/Consistency): verdict = {audit_result.get('overallConsistencyVerdict')}, "
        f"{len(audit_result.get('findings', []))} finding(s)"
    )
    return session_state
