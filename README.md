# BrandForge

Turn a rough idea into a launch-ready brand system through a visible,
multi-stage AI workflow — built for the Inkloom-sponsored hackathon.

## Why this project (and not the obvious version)

The brief warns against the "one-prompt trap": idea in, one generic answer out.
BrandForge's core differentiator is threefold:

1. **A real interview, not a one-shot guess.** After the founder's rough idea
   is submitted, the AI extracts its initial understanding and asks genuine
   follow-up questions. The founder answers them right in the UI, the AI
   incorporates the answers and either asks more (capped at 3 rounds) or
   confirms it's ready — only then does positioning begin. This is live,
   visible back-and-forth, not extraction-then-forget.
2. **Positioning is debated, not asserted.** Two competing positioning
   directions are generated, two agent personas argue for each one (conceding
   real weaknesses honestly), and a judge persona picks a winner or merges them.
3. **A consistency audit checks the system's own work.** A separate stage
   re-reads the entire brand system looking for contradictions (e.g. a
   "playful" personality trait paired with "corporate, restrained" typography)
   and revises whatever doesn't fit — with the before/after visible in the UI.

The finished kit also gets an AI-generated logo concept image and is fully viewable in the browser before a one-click download
as a self-contained HTML file.

## Tech stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Server-Sent Events for live stage streaming
- **AI orchestration**: LangGraph (linear StateGraph, 7 nodes)
- **LLM (text/reasoning)**: Groq
- **Image generation**: local Stable Diffusion (`stabilityai/sd-turbo` via `diffusers`) for the logo concept — runs entirely on your own GPU, no API key, no external service. Degrades gracefully (kit still completes without a logo) if no CUDA GPU is available or generation fails.

## Prompt architecture / AI workflow (for the submission form)

**Phase 1 — Interview (interactive, not part of the LangGraph pipeline itself):**
- `understand_idea` extracts problem, audience, context, constraints, value
  proposition, and open follow-up questions from the founder's rough sentence.
- The founder answers those questions in the UI. `incorporate_founder_answers`
  re-runs extraction with the original idea PLUS the answers folded in,
  producing a sharper understanding and — if real ambiguity remains — new
  questions. Capped at 3 rounds so it can't loop forever. The founder can
  also skip straight to building at any point.

**Phase 2 — LangGraph pipeline (streamed live via SSE once the founder is satisfied):**
Seven nodes run in sequence, each reading and extending one shared
`BrandKitSession` state object — nothing is regenerated from scratch:

1. **position_and_debate** — generates two genuinely different positioning
   directions, runs a structured debate (two advocate personas + a judge),
   and records the full transcript plus verdict.
2. **shape_personality_and_naming** — derives personality traits (to embody
   AND to avoid), naming directions with rationale, tagline, and pitch from
   the winning direction.
3. **visualize_direction** — translates personality + positioning into a
   concrete visual design brief (typography, color mood, imagery, motifs,
   concepts to avoid).
4. **audit_consistency** — re-reads the entire brand system, flags real
   contradictions between elements, and revises personality/visual direction
   in place if needed (merged, not overwritten — see Known limitations for
   why that distinction mattered). This is the self-checking mechanism the
   judging criteria explicitly reward.
5. **generate_logo_concept** — turns the final visual direction brief into
   an actual generated logo image using a locally-run Stable Diffusion model
   (`stabilityai/sd-turbo`, via `diffusers`) — no external API, runs on your
   own GPU. Best-effort: skips cleanly if no CUDA GPU is available or
   generation fails for any reason.
6. **assemble_launch_kit** — produces landing headline, social launch post,
   and final pitch using the post-audit (corrected) brand system.

Every stage's full reasoning is kept in state and surfaced in the frontend's
collapsible "Show reasoning" panels — the judging panel can see the interview
exchange, the debate transcript, and the audit's findings directly, not just
trust they happened.

## Running it locally

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

**Install torch with CUDA support FIRST, before the rest of the requirements.**
This is the one step order matters for — installing torch via
`requirements.txt` directly can silently give you a CPU-only build depending
on your platform, which makes logo generation painfully slow or fail. On
your laptop, run:

```bash
# Check your CUDA version first:
nvidia-smi
# Look at the "CUDA Version" in the top-right of the output (e.g. 12.4).
# Then install the matching torch build — for CUDA 12.1+ (most current drivers):
pip install torch --index-url https://download.pytorch.org/whl/cu121
```

If `nvidia-smi` shows a different CUDA version, get the exact matching
command from https://pytorch.org/get-started/locally/ (select: Stable,
Windows, Pip, Python, your CUDA version).

Then install everything else:

```bash
pip install -r requirements.txt
cp .env.example .env
# edit .env and paste your real GROQ_API_KEY — that's the only key needed now,
# logo generation runs locally on your GPU with no API key required
uvicorn main:app --reload --port 8000
```


Backend runs at `http://localhost:8000`. Visit `http://localhost:8000/docs`
for interactive API docs.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```



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
