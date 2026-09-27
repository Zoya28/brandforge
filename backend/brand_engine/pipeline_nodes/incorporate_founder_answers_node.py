"""
Part of the interview loop. After idea_clarification_node produces an
initial understanding plus open questions, the founder answers some of
those questions in the UI. This node re-runs the extraction with the
original idea PLUS the founder's answers folded in, producing a sharper
understanding and — if genuinely warranted — a new, smaller set of open
questions. This is what makes Stage 1 an actual interview rather than a
single one-shot guess.

Rounds are capped (see MAX_INTERVIEW_ROUNDS) so the interview can't loop
forever if the model keeps generating new questions — after the cap, the
node is instructed to stop asking and finalize its best understanding.
"""

from brand_engine.session_schema import BrandKitSession
from brand_engine.groq_structured_client import build_groq_chat_model, run_structured_completion

MAX_INTERVIEW_ROUNDS = 3

INCORPORATE_ANSWERS_SYSTEM_PROMPT_TEMPLATE = """You are a startup strategist continuing a founder
discovery interview. You previously extracted an initial understanding and asked follow-up
questions. The founder has now answered some of them. Fold their answers into a sharper, more
specific understanding — do not just restate the old understanding with answers appended, actually
revise it. {question_generation_instruction}

Return JSON with exactly these keys:
{{
  "coreProblemStatement": "one sharp sentence naming the real problem, refined with new detail",
  "targetAudienceDescription": "specific description of who this is for",
  "situationalContext": "when/where/why this problem shows up for the audience",
  "hardConstraints": ["constraint 1", "constraint 2"],
  "coreValueProposition": "one sentence: the clearest value this delivers",
  "openQuestionsForFounder": []
}}"""


def incorporate_founder_answers_node(
    session_state: BrandKitSession,
    founder_answers_text: str,
) -> BrandKitSession:
    chat_model = build_groq_chat_model()
    previous_clarification = session_state["ideaClarification"]
    rough_idea_text = session_state["founderRawInput"]["roughIdeaText"]

    current_round_count = session_state.get("interviewRoundCount", 1)
    next_round_count = current_round_count + 1
    session_state["interviewRoundCount"] = next_round_count

    if next_round_count >= MAX_INTERVIEW_ROUNDS:
        question_generation_instruction = (
            "This is the final interview round — set openQuestionsForFounder to an empty list "
            "regardless of remaining ambiguity; finalize your best understanding from what you have."
        )
    else:
        question_generation_instruction = (
            "If real, high-value ambiguity remains, you may include 1-2 new openQuestionsForFounder. "
            "Do not ask questions just to seem thorough — only ask if the answer would meaningfully "
            "change the brand direction. If the picture is clear enough, return an empty list."
        )

    system_prompt = INCORPORATE_ANSWERS_SYSTEM_PROMPT_TEMPLATE.format(
        question_generation_instruction=question_generation_instruction
    )

    user_content = (
        f"Original rough idea: {rough_idea_text}\n\n"
        f"Previous understanding:\n"
        f"Problem: {previous_clarification['coreProblemStatement']}\n"
        f"Audience: {previous_clarification['targetAudienceDescription']}\n"
        f"Value proposition: {previous_clarification['coreValueProposition']}\n\n"
        f"Questions that were asked and the founder's answers:\n{founder_answers_text}"
    )

    refined_clarification = run_structured_completion(
        chat_model=chat_model,
        system_instructions=system_prompt,
        user_content=user_content,
    )

    session_state["ideaClarification"] = refined_clarification
    session_state.setdefault("stageLog", []).append(
        f"Stage 1 (Understand) — interview round {next_round_count}: refined understanding using founder's answers"
    )
    return session_state
