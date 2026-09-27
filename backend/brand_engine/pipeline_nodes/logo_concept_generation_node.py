"""
Stage 5.5 — Logo Concept

Generates a simple logo mark from the completed brand system.

Important:
- The prompt is intentionally VERY short because SD-Turbo uses CLIP,
  which has a 77-token text limit.
- We do not pass the full visual direction into the image model.
- We ask specifically for a logo mark, not a brand board, UI,
  typography specimen, poster, or illustration.
- The pipeline is cached so the model is loaded only once per backend process.
"""

import base64
import io
import re

from brand_engine.session_schema import BrandKitSession


MODEL_REPOSITORY_ID = "stabilityai/sd-turbo"

_cached_pipeline = None
_cached_pipeline_load_error: str | None = None


def _get_or_load_pipeline():
    global _cached_pipeline, _cached_pipeline_load_error

    if _cached_pipeline is not None:
        return _cached_pipeline

    if _cached_pipeline_load_error is not None:
        raise RuntimeError(_cached_pipeline_load_error)

    try:
        import torch
        from diffusers import AutoPipelineForText2Image

        device = "cuda" if torch.cuda.is_available() else "cpu"

        dtype = (
            torch.float16
            if device == "cuda"
            else torch.float32
        )

        pipeline = AutoPipelineForText2Image.from_pretrained(
            MODEL_REPOSITORY_ID,
            torch_dtype=dtype,
            variant="fp16" if device == "cuda" else None,
        )

        pipeline = pipeline.to(device)

        if device == "cuda":
            pipeline.enable_attention_slicing()

        _cached_pipeline = pipeline

        return _cached_pipeline

    except Exception as error:
        _cached_pipeline_load_error = str(error)
        raise


def _get_brand_name(session_state: BrandKitSession) -> str:
    personality = session_state.get("brandPersonality") or {}

    naming_directions = personality.get("namingDirections") or []

    if naming_directions:
        candidate = naming_directions[0].get("candidateName")

        if candidate:
            return str(candidate).strip()

    return "Brand"


def _get_brand_keywords(session_state: BrandKitSession) -> str:
    """
    Extract only a few useful visual keywords.

    DO NOT send the entire visual direction to Stable Diffusion.
    """

    personality = session_state.get("brandPersonality") or {}

    traits = personality.get("traitsToEmbody") or []

    traits_text = " ".join(
        str(trait).lower()
        for trait in traits[:3]
    )

    visual_direction = session_state.get("visualDirection") or {}

    color_text = str(
        visual_direction.get("colorMoodDescription", "")
    ).lower()

    keywords = []

    # Personality → logo style
    if any(
        word in traits_text
        for word in ["playful", "friendly", "warm", "approachable"]
    ):
        keywords.append("rounded")

    elif any(
        word in traits_text
        for word in ["bold", "confident", "powerful", "energetic"]
    ):
        keywords.append("bold geometric")

    elif any(
        word in traits_text
        for word in ["premium", "elegant", "refined", "sophisticated"]
    ):
        keywords.append("elegant geometric")

    else:
        keywords.append("clean geometric")

    # Color mood → ONE short color direction
    if any(
        word in color_text
        for word in ["blue", "indigo", "navy", "teal"]
    ):
        keywords.append("deep blue")

    elif any(
        word in color_text
        for word in ["green", "sage", "emerald"]
    ):
        keywords.append("deep green")

    elif any(
        word in color_text
        for word in ["terracotta", "orange", "coral"]
    ):
        keywords.append("warm terracotta")

    elif any(
        word in color_text
        for word in ["purple", "violet"]
    ):
        keywords.append("deep purple")

    elif any(
        word in color_text
        for word in ["red", "crimson"]
    ):
        keywords.append("deep red")

    else:
        keywords.append("dark blue")

    return ", ".join(keywords)


def _build_logo_generation_prompt(
    session_state: BrandKitSession,
) -> str:

    brand_name = _get_brand_name(session_state)
    style_keywords = _get_brand_keywords(session_state)

    # IMPORTANT:
    # Keep this deliberately short.
    return (
        f"professional logo mark for {brand_name}, "
        f"{style_keywords}, "
        "simple vector symbol, "
        "minimal geometric shape, "
        "flat design, "
        "centered, "
        "white background, "
        "no text, "
        "no letters, "
        "no mockup"
    )


def _build_negative_prompt() -> str:
    return (
        "text, words, letters, typography, "
        "poster, brochure, website, UI, "
        "business card, brand board, mood board, "
        "multiple logos, multiple objects, "
        "photograph, 3d render, realistic, "
        "complex illustration, detailed background, "
        "cards, screens, documents, icons collection"
    )


def logo_concept_generation_node(
    session_state: BrandKitSession,
) -> BrandKitSession:

    try:
        text_to_image_pipeline = _get_or_load_pipeline()

        generation_prompt = _build_logo_generation_prompt(
            session_state
        )

        negative_prompt = _build_negative_prompt()

        generation_result = text_to_image_pipeline(
            prompt=generation_prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=4,
            guidance_scale=0.0,
            width=512,
            height=512,
        )

        generated_image = generation_result.images[0]

        image_buffer = io.BytesIO()

        generated_image.save(
            image_buffer,
            format="PNG",
        )

        encoded_image = base64.b64encode(
            image_buffer.getvalue()
        ).decode("utf-8")

        session_state["logoConceptImageDataUri"] = (
            f"data:image/png;base64,{encoded_image}"
        )

        session_state.setdefault(
            "stageLog",
            []
        ).append(
            f"Stage 5.5 (Logo concept): generated locally via "
            f"{MODEL_REPOSITORY_ID}"
        )

    except Exception as error:
        session_state["logoConceptImageDataUri"] = None

        session_state.setdefault(
            "stageLog",
            []
        ).append(
            f"Stage 5.5 (Logo concept): failed — {error}"
        )

    return session_state