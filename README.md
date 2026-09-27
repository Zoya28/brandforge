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

The finished kit also gets an AI-generated logo concept image (via Gemini's
image model) and is fully viewable in the browser before a one-click download
as a self-contained HTML file.

## Tech stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI, Server-Sent Events for live stage streaming
- **AI orchestration**: LangGraph (linear StateGraph, 7 nodes)
- **LLM (text/reasoning)**: Groq (`openai/gpt-oss-120b`)
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
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

**Install torch with CUDA support FIRST, before the rest of the requirements.**
This is the one step order matters for — installing torch via
`requirements.txt` directly can silently give you a CPU-only build depending
on your platform, which makes logo generation painfully slow or fail. On
your ASUS TUF A15 (RTX 4050), run:

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

**First run will be slow** — `stabilityai/sd-turbo` (~5GB of weights) downloads
from Hugging Face the first time the logo stage runs, then it's cached
locally (`~/.cache/huggingface`) and loads fast on every run after that.
Consider triggering one pipeline run before your demo just to warm the cache
so you're not waiting on a download live in front of judges.

**If you want higher-quality logos and have VRAM headroom to spare**, open
`brand_engine/pipeline_nodes/logo_concept_generation_node.py` and change
`MODEL_REPOSITORY_ID` to `"stabilityai/sdxl-turbo"` — it needs about 5.6GB
VRAM (still fits your 6GB card, but with less headroom for everything else
running) and produces noticeably better detail.

Backend runs at `http://localhost:8000`. Visit `http://localhost:8000/docs`
for interactive API docs.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`. It already points at
`http://localhost:8000` via `.env.local` — change
`NEXT_PUBLIC_BRANDFORGE_API_BASE_URL` there if you deploy the backend
elsewhere.

### 3. Try it

Open `http://localhost:3000`, enter an idea (e.g. "An app that helps
students find teammates for group projects"), and watch the six stages run
live, each with an expandable reasoning panel.

## Known limitations / what's left for you to finish

- **Live testing**: this was built in a sandboxed environment with restricted
  network egress (could not reach `api.groq.com` to test live, and had no
  GPU to actually run local image generation end-to-end). The offline mock
  test (`backend/test_graph_wiring_offline.py`) verifies the graph's control
  flow and state-passing logic is correct, and the logo node's graceful
  degradation was verified directly; you should run one real end-to-end
  test locally before the demo to confirm actual model outputs (both text
  and image) look good, and adjust prompts in
  `backend/brand_engine/pipeline_nodes/*.py` if any stage's tone needs tuning.
- **Fixed bug**: an earlier version crashed with a `KeyError` on
  `colorMoodDescription` during a live run. Root cause: the consistency-audit
  stage overwrote `visualDirection`/`brandPersonality` entirely with whatever
  the LLM returned as "revised," and the LLM sometimes returned a partial
  object missing untouched fields. Fixed by merging the revision into the
  existing object instead of replacing it outright — see
  `consistency_audit_node.py`. If you see similar `KeyError`s elsewhere,
  it's the same class of bug (an LLM JSON response missing an expected key)
  and the fix pattern is the same: merge or use `.get()` with a fallback,
  never assume a returned object is complete.
- **Deployment**: not deployed from this environment. Recommended: Vercel for
  the frontend, Railway or Render for the FastAPI backend (remember to set
  `GROQ_API_KEY` as an environment variable there, and update
  `NEXT_PUBLIC_BRANDFORGE_API_BASE_URL` in the frontend to the deployed
  backend URL). **Important**: standard Railway/Render tiers don't have a
  GPU, so if you deploy the backend there, logo generation will either run
  very slowly on CPU or you may want to disable that stage for the deployed
  version. For your live demo, running the backend locally on your own
  RTX 4050 (and just deploying the frontend, or running both locally) will
  give you working logo generation — that's likely your best bet for the
  actual demo in front of judges.
- **Sessions are in-memory** on the backend (a Python dict) — fine for a
  hackathon demo, but they reset if the server restarts. Swap for
  Redis/Postgres if you need persistence beyond a demo.
- Only tested with one sample idea end-to-end (offline, mocked). Test with
  2-3 different ideas locally to make sure outputs stay sharp and non-generic
  across different domains, and specifically test the interview loop with
  a genuinely vague idea to see the follow-up questions in action.
- The logo generation runs locally on your GPU and the model weights
  (~5GB) download from Hugging Face on first use — do a warm-up run before
  your demo (see setup steps above) so you're not waiting on a download
  live in front of judges. If generation is still slow, confirm torch
  actually detected your GPU: run `python -c "import torch; print(torch.cuda.is_available())"`
  inside the backend venv — if that prints `False`, torch installed as a
  CPU build and needs reinstalling with the correct CUDA index URL (see
  setup steps). If it fails outright, the rest of the kit is unaffected —
  the stage degrades gracefully — but don't rely on it working the first
  time live; test it beforehand.

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
│   ├── test_graph_wiring_offline.py   # offline mock test (see limitations)
│   └── requirements.txt
└── frontend/
    ├── app/page.tsx                   # state machine: input → interview → running → complete
    ├── components/                    # IdeaInputScreen, InterviewScreen, PipelineProgressView, FinalBrandKitView
    └── lib/                           # types + API client (fetch + SSE) + HTML download helper
```
