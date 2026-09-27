"""
sDefines BrandKitSession: the single structured object that LangGraph passes
between every stage of the pipeline. Each node reads what earlier nodes wrote
and adds its own contribution, nothing is thrown away and nothing is
regenerated from scratch stage to stage.
"""

from __future__ import annotations
from typing import TypedDict, Optional


class FounderRawInput(TypedDict):
    roughIdeaText: str


class IdeaClarificationResult(TypedDict):
    coreProblemStatement: str
    targetAudienceDescription: str
    situationalContext: str
    hardConstraints: list[str]
    coreValueProposition: str
    openQuestionsForFounder: list[str]


class PositioningDirection(TypedDict):
    directionLabel: str          # e.g. "The Peer-Trust Angle"
    categoryFraming: str
    differentiator: str
    valuePropositionStatement: str
    competitiveAngle: str


class AgentArgument(TypedDict):
    agentPersonaName: str        # e.g. "Advocate for Direction A"
    argumentText: str
    weaknessesConceded: list[str]


class PositioningDebateResult(TypedDict):
    directionA: PositioningDirection
    directionB: PositioningDirection
    argumentsForA: list[AgentArgument]
    argumentsForB: list[AgentArgument]
    judgeVerdictText: str
    winningDirection: PositioningDirection


class NamingDirection(TypedDict):
    candidateName: str
    rationale: str


class BrandPersonalityResult(TypedDict):
    traitsToEmbody: list[str]        # 3-5 traits, each with justification folded in
    traitsToAvoid: list[str]
    namingDirections: list[NamingDirection]
    onelinePitch: str
    tagline: str


class VisualDirectionResult(TypedDict):
    typographyDirection: str
    colorMoodDescription: str
    compositionAndImageryStyle: str
    symbolicMotifs: list[str]
    conceptsToAvoid: list[str]


class ConsistencyAuditFinding(TypedDict):
    conflictDescription: str
    conflictingElements: list[str]   # which fields disagree with each other
    revisionSuggestion: str


class ConsistencyAuditResult(TypedDict):
    findings: list[ConsistencyAuditFinding]
    overallConsistencyVerdict: str   # "consistent" | "revised" | "needs_founder_input"
    revisedPersonality: Optional[BrandPersonalityResult]
    revisedVisualDirection: Optional[VisualDirectionResult]


class LaunchKitResult(TypedDict):
    landingPageHeadline: str
    socialLaunchPostDraft: str
    finalOnelinePitch: str


class BrandKitSession(TypedDict, total=False):
    """
    The accumulating state object. `total=False` because each key is only
    populated once its stage has run — LangGraph fills this in progressively.
    """
    sessionId: str
    founderRawInput: FounderRawInput
    ideaClarification: IdeaClarificationResult
    positioningDebate: PositioningDebateResult
    brandPersonality: BrandPersonalityResult
    visualDirection: VisualDirectionResult
    consistencyAudit: ConsistencyAuditResult
    launchKit: LaunchKitResult
    currentStageName: str
    stageLog: list[str]   # human-readable trace of what happened, shown in UI
    interviewRoundCount: int   # how many rounds of founder Q&A have happened so far
    logoConceptImageDataUri: Optional[str]   
