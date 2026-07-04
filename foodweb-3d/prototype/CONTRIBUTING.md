# Contributing to foodweb-3d

Thanks for your interest. This is a research framework (publication line 2 of
the [foodweb-3d knowledge base](../README.md)). It is **demonstration-grade**:
the reference engines (GLV dynamics, reduced-order physics) are illustrative;
real engines (Ecopath/Rpath, mizer, GLM-AED/CE-QUAL-W2) attach through the L2
interchange format via adapters.

## Layout

| Path | Layer | Purpose |
|---|---|---|
| `data/foodweb-yangtze.json` | L2 | model-agnostic interchange instance |
| `data/l2-schema.json` | L2 | JSON Schema (Draft-07) |
| `src/{engine,physics}.js` | L1 | reference dynamics + physics coupling |
| `src/{render,ui}.js` | L3 | three.js interactive renderer + controls |
| `adapters/` | interop | L2 ↔ Rpath / mizer native formats |
| `theory/` | line 1 | meta-ecosystem control-regime model |
| `tests/run.js` | — | CI test suite |

## Develop

```bash
npm install          # ajv (schema validation) — from registry.npmjs.org
npm test             # engine stability, schema, adapter round-trips, theory
npm run roundtrip    # adapter conformance + emit native engine files
npm run phase-diagram
```

Open `index.html` (split) or `index.artifact.html` (single file) in a browser.

## Adding an engine adapter (the main contribution path)

1. Add a `adapters/<engine>-adapter.js` with `l2To<Engine>(l2)` and
   `<engine>ToL2(...)` that read/write the engine's native format.
2. Add a round-trip check to `tests/run.js` proving structural fields survive.
3. Document the mapping in [`../13-L2-interchange-spec.md`](../13-L2-interchange-spec.md) §5.

Optional L2 fields you may need are declared in `data/l2-schema.json`
(`pb`/`qb`/`ee` for mass-balance, `w_inf`/`w_mat` for size-spectrum). Add new
optional fields with a `schema_version` bump and a spec note.

## Conventions

- Keep the split files and the inlined `index.artifact.html` in sync (the
  build inlines `vendor/ + data/data.js + src/` into one CSP-safe file).
- Engine modules must run in both Node and the browser (UMD-style export).
- All changes should keep `npm test` green.
- Label synthetic/illustrative data and demonstration-grade models explicitly.

## License

By contributing you agree your contributions are licensed under the MIT License
(see [LICENSE](LICENSE)).
