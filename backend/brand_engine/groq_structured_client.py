"""
Thin wrapper around langchain-groq that forces JSON-only responses and
parses them safely. Every pipeline node calls `run_structured_completion`
instead of touching the Groq SDK directly, so the retry/parsing logic
lives in exactly one place.
"""

import json
import os
from langchain_groq import ChatGroq

DEFAULT_GROQ_MODEL_NAME = "openai/gpt-oss-120b"

def build_groq_chat_model(model_name: str = DEFAULT_GROQ_MODEL_NAME) -> ChatGroq:
    groq_api_key = os.environ.get("GROQ_API_KEY")
    if not groq_api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set. Add it to backend/.env — see README for setup."
        )
    return ChatGroq(model=model_name, api_key=groq_api_key, temperature=0.7)


def run_structured_completion(
    chat_model: ChatGroq,
    system_instructions: str,
    user_content: str,
) -> dict:
    """
    Sends a system+user message pair, demands raw JSON back, and parses it.
    Raises ValueError with the raw text if parsing fails, so the caller/route
    can surface a real error instead of silently returning garbage.
    """
    json_enforced_system_prompt = (
        system_instructions
        + "\n\nRespond with ONLY a single valid JSON object. "
        + "No markdown fences, no preamble, no trailing commentary."
    )
    response_message = chat_model.invoke(
        [
            {"role": "system", "content": json_enforced_system_prompt},
            {"role": "user", "content": user_content},
        ]
    )
    raw_response_text = response_message.content.strip()

    # Defensive strip in case the model wraps in ```json fences anyway.
    if raw_response_text.startswith("```"):
        raw_response_text = raw_response_text.strip("`")
        if raw_response_text.startswith("json"):
            raw_response_text = raw_response_text[4:]
        raw_response_text = raw_response_text.strip()

    try:
        return json.loads(raw_response_text)
    except json.JSONDecodeError as parse_error:
        raise ValueError(
            f"Groq did not return valid JSON. Raw output was:\n{raw_response_text}"
        ) from parse_error
