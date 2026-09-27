# BrandForge

**A multi-stage AI system that turns a rough startup idea into a launch-ready brand kit — built for the Inkloom-sponsored hackathon.**

---

## The problem we're solving

Most "AI branding tool" submissions fall into what the brief calls the **one-prompt trap**: idea goes in, one generic wall of text comes out, and there's no way to tell if the AI actually reasoned about anything or just pattern-matched a template.

BrandForge is built specifically to avoid that. Every stage of the pipeline is visible, and the system does three things a single prompt can't:

| # | What it does | Why it matters for judging |
|---|---|---|
| 1 | **Actually interviews the founder** before building anything | Shows the AI forming an understanding, not guessing |
| 2 | **Argues both sides of positioning before picking one** | Shows genuine reasoning under uncertainty, not assertion |
| 3 | **Re-reads its own output and fixes contradictions** | Shows self-correction, not one-shot generation |

Everything below explains how, with the exact stages you can inspect in the running demo.

---

## How to evaluate it in under 2 minutes

1. Submit a one-sentence idea.
2. Answer 1–3 follow-up questions the AI asks (or click "skip and build").
3. Watch the 6-stage pipeline stream live — click **"Show reasoning"** on any stage to see the model's actual output for that step, including the full positioning debate transcript and the audit's before/after diff.
4. Review the finished kit in-browser, then download it as a single self-contained HTML file.

---

## What makes this different from a single ChatGPT prompt

### 1. A real interview, not extraction-then-forget
The founder's rough idea is parsed into an initial understanding (problem, audience, context, constraints, value proposition) *plus a list of genuine open questions*. The founder answers those questions in the UI, and the AI re-extracts its understanding with the answers folded in — sharpening it, or asking follow-ups if real ambiguity remains. Capped at 3 rounds so it can't stall the demo. This exchange is fully visible, not a hidden pre-processing step.

### 2. Positioning is debated, not asserted
Instead of generating one positioning statement, BrandForge generates **two genuinely different directions**, then runs a structured debate: two advocate personas argue for their direction (each conceding real weaknesses, not just cheerleading), and a judge persona picks a winner or merges them. The full transcript is kept and shown — you can watch the reasoning, not just trust the conclusion.

### 3. A consistency audit checks the system's own work
After personality, naming, and visual direction are generated, a dedicated audit stage re-reads the *entire* brand system looking for real contradictions — for example, a "playful" personality trait paired with "corporate, restrained" typography — and revises whatever doesn't fit. The revision is merged into state (not silently overwritten), and the before/after is visible in the UI. This is the self-checking mechanism most one-shot tools skip entirely.

### 4. A real generated asset, not a placeholder
The final visual direction brief is turned into an actual logo concept image using a locally-run Stable Diffusion model (`stabilityai/sd-turbo`) — no external API key required, runs entirely on the presenter's own GPU. If no CUDA GPU is available, the kit still completes cleanly without a logo rather than failing the demo.

---

## Pipeline architecture

**Phase 1 — Interview** *(interactive, outside the main graph)*
- `understand_idea` → initial extraction + open questions
- `incorporate_founder_answers` → re-extraction with answers folded in, up to 3 rounds, founder can skip ahead at any point

**Phase 2 — LangGraph pipeline** *(6 nodes, streamed live via Server-Sent Events)*

A single shared `BrandKitSession` state object flows through every node — nothing is regenerated from scratch, so each stage builds on real prior output:

1. **position_and_debate** — two positioning directions, full advocate-vs-advocate debate, judge verdict
2. **shape_personality_and_naming** — personality traits (to embody *and* to avoid), naming directions, tagline, pitch
3. **visualize_direction** — concrete visual brief: typography, color mood, imagery, motifs, and what to avoid
4. **audit_consistency** — cross-checks the whole system, flags contradictions, revises in place
5. **generate_logo_concept** — local Stable Diffusion image generation from the final visual brief (best-effort)
6. **assemble_launch_kit** — landing headline, social launch post, and final pitch, built from the *post-audit* corrected brand system

Every stage's full reasoning is retained in state and exposed in the frontend's collapsible "Show reasoning" panels — judges can see the interview exchange, the debate transcript, and the audit's findings directly.

---

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js, TypeScript, Tailwind CSS |
| Backend | FastAPI, Server-Sent Events for live stage streaming |
| Orchestration | LangGraph (linear StateGraph, 6 nodes) |
| Text/reasoning LLM | Groq |
| Image generation | Local Stable Diffusion (`stabilityai/sd-turbo` via `diffusers`) — no API key, no external service |

---

## Running it locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Install torch with CUDA support first**, before `requirements.txt`. This is the one step where order matters — installing torch via `requirements.txt` directly can silently give you a CPU-only build, which makes logo generation painfully slow or fail outright.

```bash
# Check your CUDA version first:
nvidia-smi
# Look at "CUDA Version" in the top-right of the output (e.g. 12.4)

# Install the matching torch build — for CUDA 12.1+ (most current drivers):
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

If `nvidia-smi` shows a different CUDA version, get the exact matching command from https://pytorch.org/get-started/locally/ (Stable → Windows → Pip → Python → your CUDA version).

Then:

```bash
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your GROQ_API_KEY — the only key required;
# logo generation runs locally on your GPU
uvicorn main:app --reload --port 8000
```


### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## Project structure

```
brandforge/
├── backend/
│   ├── brand_engine/
│   │   ├── session_schema.py          # shared state schema, all fields
│   │   ├── groq_structured_client.py  # Groq wrapper, JSON parsing
│   │   ├── brand_kit_graph.py         # LangGraph wiring
│   │   └── pipeline_nodes/            # one file per stage
│   ├── main.py                        # FastAPI app + SSE streaming route
│   └── requirements.txt
└── frontend/
    ├── app/page.tsx                   # state machine: input → interview → running → complete
    ├── components/                    # IdeaInputScreen, InterviewScreen, PipelineProgressView, FinalBrandKitView
    └── lib/                           # types + API client (fetch + SSE) + HTML download helper
```