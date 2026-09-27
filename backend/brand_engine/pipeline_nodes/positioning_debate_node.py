"""
Stages 2 and 3 combined ("Position" + "Challenge/Debate"). This is the
signature differentiator of the product: instead of one prompt producing
one positioning, we generate two genuinely different directions, run two
agent personas arguing for each one, then have a judge persona produce a
verdict. The debate transcript is kept in state so the UI can show it —
judges should SEE the reasoning, not just trust it happened.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import build_groq_chat_model, run_structured_completion

POSITIONING_DIRECTIONS_SYSTEM_PROMPT = """You are a brand strategist. Given a founder's clarified
problem/audience/value proposition, generate exactly TWO genuinely different positioning directions
for this brand — not two flavors of the same idea. They should differ in category framing,
differentiator, or competitive angle (e.g. one could lean functional/utility, the other emotional/
community; or one narrow-niche, one broad-platform). Avoid generic startup positioning cliches.

Return JSON:
{
  "directionA": {"directionLabel": "...", "categoryFraming": "...", "differentiator": "...",
                  "valuePropositionStatement": "...", "competitiveAngle": "..."},
  "directionB": {"directionLabel": "...", "categoryFraming": "...", "differentiator": "...",
                  "valuePropositionStatement": "...", "competitiveAngle": "..."}
}"""

DEBATE_SYSTEM_PROMPT = """You are running a structured debate between two brand strategists and a judge.
Persona 1 ("Advocate for Direction A") argues FOR direction A and honestly concedes direction A's
real weaknesses. Persona 2 ("Advocate for Direction B") does the same for direction B. Then a Judge
persona weighs both arguments against the founder's actual audience and constraints, and picks a
winning direction — or explicitly merges the strongest elements of both if that's genuinely better.
Do not let the debate be a rubber stamp: the losing direction should have a real chance and the
judge's reasoning should reference specific facts about the audience/constraints, not vague praise.

Return JSON:
{
  "argumentsForA": [{"agentPersonaName": "Advocate for Direction A", "argumentText": "...",
                      "weaknessesConceded": ["..."]}],
  "argumentsForB": [{"agentPersonaName": "Advocate for Direction B", "argumentText": "...",
                      "weaknessesConceded": ["..."]}],
  "judgeVerdictText": "...",
  "winningDirectionLabel": "A or B, or 'merged'",
  "winningDirection": {"directionLabel": "...", "categoryFraming": "...", "differentiator": "...",
                         "valuePropositionStatement": "...", "competitiveAngle": "..."}
}"""


def positioning_debate_node(session_state: BrandKitSession) -> BrandKitSession:
    chat_model = build_groq_chat_model()
    idea_clarification = session_state["ideaClarification"]

    founder_context_summary = (
        f"Problem: {idea_clarification['coreProblemStatement']}\n"
        f"Audience: {idea_clarification['targetAudienceDescription']}\n"
        f"Context: {idea_clarification['situationalContext']}\n"
        f"Value proposition: {idea_clarification['coreValueProposition']}\n"
        f"Constraints: {', '.join(idea_clarification.get('hardConstraints', []))}"
    )

    directions_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=POSITIONING_DIRECTIONS_SYSTEM_PROMPT,
        user_content=founder_context_summary,
    )

    debate_input_content = (
        founder_context_summary
        + f"\n\nDirection A: {directions_result['directionA']}"
        + f"\nDirection B: {directions_result['directionB']}"
    )

    debate_result = run_structured_completion(
        chat_model=chat_model,
        system_instructions=DEBATE_SYSTEM_PROMPT,
        user_content=debate_input_content,
    )

    positioning_debate_result = {
        "directionA": directions_result["directionA"],
        "directionB": directions_result["directionB"],
        "argumentsForA": debate_result["argumentsForA"],
        "argumentsForB": debate_result["argumentsForB"],
        "judgeVerdictText": debate_result["judgeVerdictText"],
        "winningDirection": debate_result["winningDirection"],
    }

    session_state["positioningDebate"] = positioning_debate_result
    session_state["currentStageName"] = "positioning_debate_complete"
    session_state.setdefault("stageLog", []).append(
        "Stage 2-3 (Position + Debate): "
        f"generated 2 directions, debated, judge selected: {debate_result['winningDirection']['directionLabel']}"
    )
    return session_state
