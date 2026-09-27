"""
main.py

FastAPI application exposing the BrandForge pipeline over HTTP.

Flow is of two phases:

  Phase 1 — Interview:
    POST /api/brand-sessions                       -> start session, run initial extraction
    POST /api/brand-sessions/{id}/interview-answers -> submit answers, get refined understanding
                                                        (repeatable — this is the real interview loop)

  Phase 2 — Pipeline (SSE stream, runs once the founder is satisfied with Phase 1):
    GET /api/brand-sessions/{id}/stream             -> positioning debate through launch kit,
                                                        streamed stage by stage

Sessions are held in an in memory dict for the hackathon build. 
"""

import asyncio
import json
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from dotenv import load_dotenv

load_dotenv()

from brand_engine.pipeline_nodes.idea_clarification_node import idea_clarification_node
from brand_engine.pipeline_nodes.incorporate_founder_answers_node import (
    incorporate_founder_answers_node,
    MAX_INTERVIEW_ROUNDS,
)
from brand_engine.pipeline_nodes.positioning_debate_node import positioning_debate_node
from brand_engine.pipeline_nodes.brand_personality_naming_node import brand_personality_naming_node
from brand_engine.pipeline_nodes.visual_direction_node import visual_direction_node
from brand_engine.pipeline_nodes.consistency_audit_node import consistency_audit_node
from brand_engine.pipeline_nodes.logo_concept_generation_node import logo_concept_generation_node
from brand_engine.pipeline_nodes.launch_kit_assembly_node import launch_kit_assembly_node

app = FastAPI(title="BrandForge Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://brandforge-hackathon.vercel.app/",], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store: sessionId -> BrandKitSession dict
active_brand_sessions: dict[str, dict] = {}

# Stages that run AFTER the interview phase is complete. Understand/interview
# is handled separately by the two endpoints below, since it needs to pause
# for real user input rather than streaming straight through.
ORDERED_PIPELINE_STAGES = [
    ("position_and_debate", positioning_debate_node),
    ("shape_personality_and_naming", brand_personality_naming_node),
    ("visualize_direction", visual_direction_node),
    ("audit_consistency", consistency_audit_node),
    ("generate_logo_concept", logo_concept_generation_node),
    ("assemble_launch_kit", launch_kit_assembly_node),
]


class StartSessionRequestBody(BaseModel):
    roughIdeaText: str


class InterviewAnswersRequestBody(BaseModel):
    answersText: str


@app.post("/api/brand-sessions")
async def start_brand_session(request_body: StartSessionRequestBody):
    if not request_body.roughIdeaText or not request_body.roughIdeaText.strip():
        raise HTTPException(status_code=400, detail="roughIdeaText must not be empty.")

    new_session_id = str(uuid.uuid4())
    session_state = {
        "sessionId": new_session_id,
        "founderRawInput": {"roughIdeaText": request_body.roughIdeaText.strip()},
        "stageLog": [],
        "interviewRoundCount": 1,
    }

    try:
        session_state = await asyncio.to_thread(idea_clarification_node, session_state)
    except Exception as extraction_error:
        raise HTTPException(status_code=502, detail=f"Idea extraction failed: {extraction_error}")

    active_brand_sessions[new_session_id] = session_state

    return {
        "sessionId": new_session_id,
        "ideaClarification": session_state["ideaClarification"],
        "interviewRoundCount": session_state["interviewRoundCount"],
        "maxInterviewRounds": MAX_INTERVIEW_ROUNDS,
    }


@app.post("/api/brand-sessions/{session_id}/interview-answers")
async def submit_interview_answers(session_id: str, request_body: InterviewAnswersRequestBody):
    if session_id not in active_brand_sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    if not request_body.answersText or not request_body.answersText.strip():
        raise HTTPException(status_code=400, detail="answersText must not be empty.")

    session_state = active_brand_sessions[session_id]

    try:
        session_state = await asyncio.to_thread(
            incorporate_founder_answers_node, session_state, request_body.answersText.strip()
        )
    except Exception as incorporation_error:
        raise HTTPException(status_code=502, detail=f"Failed to incorporate answers: {incorporation_error}")

    active_brand_sessions[session_id] = session_state

    return {
        "sessionId": session_id,
        "ideaClarification": session_state["ideaClarification"],
        "interviewRoundCount": session_state["interviewRoundCount"],
        "maxInterviewRounds": MAX_INTERVIEW_ROUNDS,
    }


@app.get("/api/brand-sessions/{session_id}/stream")
async def stream_brand_session_progress(session_id: str):
    if session_id not in active_brand_sessions:
        raise HTTPException(status_code=404, detail="Session not found.")

    async def event_generator():
        session_state = active_brand_sessions[session_id]

        for stage_key, node_function in ORDERED_PIPELINE_STAGES:
            yield {
                "event": "stage_started",
                "data": json.dumps({"stageKey": stage_key}),
            }
            try:
                session_state = await asyncio.to_thread(node_function, session_state)
                active_brand_sessions[session_id] = session_state
            except Exception as pipeline_error:
                yield {
                    "event": "stage_failed",
                    "data": json.dumps({"stageKey": stage_key, "errorMessage": str(pipeline_error)}),
                }
                return

            yield {
                "event": "stage_completed",
                "data": json.dumps({"stageKey": stage_key, "sessionState": session_state}),
            }

        yield {
            "event": "pipeline_complete",
            "data": json.dumps({"sessionState": session_state}),
        }

    return EventSourceResponse(event_generator())


@app.get("/api/brand-sessions/{session_id}")
def get_brand_session(session_id: str):
    if session_id not in active_brand_sessions:
        raise HTTPException(status_code=404, detail="Session not found.")
    return active_brand_sessions[session_id]


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
