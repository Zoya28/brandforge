// brandKitSessionTypes.ts
//
// Mirrors backend/brand_engine/session_schema.py field-for-field. If you
// change a field name on the backend, update it here too — there is no
// codegen link between the two, this is a manually-kept contract.

export interface IdeaClarificationResult {
  coreProblemStatement: string;
  targetAudienceDescription: string;
  situationalContext: string;
  hardConstraints: string[];
  coreValueProposition: string;
  openQuestionsForFounder: string[];
}

export interface PositioningDirection {
  directionLabel: string;
  categoryFraming: string;
  differentiator: string;
  valuePropositionStatement: string;
  competitiveAngle: string;
}

export interface AgentArgument {
  agentPersonaName: string;
  argumentText: string;
  weaknessesConceded: string[];
}

export interface PositioningDebateResult {
  directionA: PositioningDirection;
  directionB: PositioningDirection;
  argumentsForA: AgentArgument[];
  argumentsForB: AgentArgument[];
  judgeVerdictText: string;
  winningDirection: PositioningDirection;
}

export interface NamingDirection {
  candidateName: string;
  rationale: string;
}

export interface BrandPersonalityResult {
  traitsToEmbody: string[];
  traitsToAvoid: string[];
  namingDirections: NamingDirection[];
  onelinePitch: string;
  tagline: string;
}

export interface VisualDirectionResult {
  typographyDirection: string;
  colorMoodDescription: string;
  compositionAndImageryStyle: string;
  symbolicMotifs: string[];
  conceptsToAvoid: string[];
}

export interface ConsistencyAuditFinding {
  conflictDescription: string;
  conflictingElements: string[];
  revisionSuggestion: string;
}

export interface ConsistencyAuditResult {
  findings: ConsistencyAuditFinding[];
  overallConsistencyVerdict: "consistent" | "revised" | "needs_founder_input";
  revisedPersonality: BrandPersonalityResult | null;
  revisedVisualDirection: VisualDirectionResult | null;
}

export interface LaunchKitResult {
  landingPageHeadline: string;
  socialLaunchPostDraft: string;
  finalOnelinePitch: string;
}

export interface BrandKitSession {
  sessionId: string;
  founderRawInput: { roughIdeaText: string };
  ideaClarification?: IdeaClarificationResult;
  positioningDebate?: PositioningDebateResult;
  brandPersonality?: BrandPersonalityResult;
  visualDirection?: VisualDirectionResult;
  consistencyAudit?: ConsistencyAuditResult;
  launchKit?: LaunchKitResult;
  currentStageName?: string;
  stageLog: string[];
  interviewRoundCount?: number;
  logoConceptImageDataUri?: string | null;
  logoConceptGenerationErrorMessage?: string | null;
}

export interface StartSessionResponse {
  sessionId: string;
  ideaClarification: IdeaClarificationResult;
  interviewRoundCount: number;
  maxInterviewRounds: number;
}

export interface InterviewAnswersResponse {
  sessionId: string;
  ideaClarification: IdeaClarificationResult;
  interviewRoundCount: number;
  maxInterviewRounds: number;
}

// "understand_idea" is intentionally not in this list — it now happens
// interactively on the InterviewScreen before this streaming phase begins,
// so by the time PipelineProgressView is showing, that stage is already done.
export const PIPELINE_STAGE_DISPLAY_ORDER = [
  { stageKey: "position_and_debate", displayLabel: "Position & debate" },
  { stageKey: "shape_personality_and_naming", displayLabel: "Shape personality & naming" },
  { stageKey: "visualize_direction", displayLabel: "Visualize direction" },
  { stageKey: "audit_consistency", displayLabel: "Audit consistency" },
  { stageKey: "generate_logo_concept", displayLabel: "Generate logo concept" },
  { stageKey: "assemble_launch_kit", displayLabel: "Assemble launch kit" },
] as const;

export type PipelineStageKey = typeof PIPELINE_STAGE_DISPLAY_ORDER[number]["stageKey"];
