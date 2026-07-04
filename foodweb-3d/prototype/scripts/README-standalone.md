# foodweb-3d

**An open, spatially explicit, 3D-interactive, uncertainty-aware food-web
simulation framework for regulated inland waters.**

`foodweb-3d` interconnects static mass-balance, dynamic trophic, and physical
water-body models through a **model-agnostic interchange format (L2)**, with a
3D-interactive, time-animated, uncertainty-aware renderer and **two-way
physics–trophic coupling**. It is demonstrated on the Yangtze / Three Gorges
Reservoir. Demonstration-grade: the bundled engines (GLV dynamics, reduced-order
physics) are illustrative; real engines (Ecopath/Rpath, mizer, GLM-AED/
CE-QUAL-W2) attach through the L2 format via adapters.

> This repository is the software artifact of **publication line 2** of the
> food-web 3D research programme. The knowledge base, manuscript plans, and the
> other publication lines live in the parent repository
> [`project-knowledge-pipeline/foodweb-3d`](https://github.com/shaowen-ye/project-knowledge-pipeline).

## Run

- **Single file (zero setup):** open `index.artifact.html` in a browser — all
  dependencies (three.js, data, code) are inlined; no network, no server.
- **Split files (dev):** open `index.html` directly, or serve with
  `python3 -m http.server 8000`.
- **Theory / figures:** `theory-figures.html`, `figures.html`,
  `paper3-ban-figures.html`, `gantt.html` are self-contained.

## Architecture (L1 engines → L2 interchange → L3 renderer)

| Path | Layer | Purpose |
|---|---|---|
| `data/foodweb-yangtze.json` | L2 | model-agnostic interchange instance |
| `data/l2-schema.json` | L2 | JSON Schema (Draft-07) |
| `src/{engine,physics}.js` | L1 | reference dynamics + two-way physics coupling |
| `src/{render,ui}.js` | L3 | three.js interactive renderer + controls |
| `adapters/` | interop | L2 ↔ Rpath (Ecopath) / mizer (size-spectrum) native formats |
| `theory/` | theory | meta-ecosystem control-regime model + phase diagram |

The L2 interchange format is specified in
[`L2-interchange-spec`](https://github.com/shaowen-ye/project-knowledge-pipeline/blob/main/foodweb-3d/13-L2-interchange-spec.md).

## Develop & test

```bash
npm install          # ajv (schema validation)
npm test             # engine stability, schema, adapter round-trips, theory
npm run roundtrip    # adapter conformance + emit native engine files
npm run phase-diagram
```

CI: `.github/workflows/ci.yml` (Node 18/20/22).

## Model-agnostic interoperability

Two structurally different engine paradigms interoperate with L2, verified by
lossless round-trip (`npm test`):

```bash
node adapters/rpath-adapter.js export data/foodweb-yangtze.json out/   # Ecopath mass-balance
node adapters/mizer-adapter.js export data/foodweb-yangtze.json out/   # size-spectrum
```

The emitted files load directly in R:

```r
library(Rpath); ecc <- read.rpath.params("out/rpath_model.csv","out/rpath_diet.csv"); rpath(ecc)
library(mizer); newMultispeciesParams(read.csv("out/mizer_species_params.csv"),
                interaction = as.matrix(read.csv("out/mizer_interaction.csv", row.names=1)))
```

## Cite & license

- License: **MIT** (see `LICENSE`; vendored three.js is also MIT).
- Citation: see `CITATION.cff`.
- Contributions welcome — see `CONTRIBUTING.md` (the main path is adding an
  engine adapter).

## Caveats

Synthetic/illustrative data (orders of magnitude from the literature, not a
measured balance); reduced-order reference engines; the physics forcing (Three
Gorges water-level operation curve + Yangtze temperature climatology) is
real/published but representative, not a specific measured daily series.
Results are mechanistic demonstrations, not quantitative forecasts.
