# Archive

Historical planning docs that are no longer actionable. Kept around so
the rationale behind earlier design decisions is recoverable, but not
linked from any current doc and not part of the day-to-day reading set.

| File | Why it's here |
|---|---|
| `svelte2tsx-triage.md` | Wave 1 triage cluster plan. Wave 1 closed at 245/245 in 2026-05-05; document is explicitly marked CLOSED at the top. |
| `svelte2tsx-and-svelte-check-plan.md` | Early ecosystem-port planning doc, written before Wave 2 / Wave 3 were broken out. Superseded by `docs/ecosystem-implementation-plan.md` and `docs/wave-2-3-handover.md`. |
| `ssr-remaining-diffs.md` | SSR diff-tracking notes from when the suite sat at 81/82 (97.0% canon match). The remaining diff has since been closed — SSR is at 82/82 — so the residual checklist is no longer load-bearing. |

If you find yourself updating one of these instead of the live docs,
that's the signal to either (a) merge the still-relevant content
forward, or (b) delete it outright. Don't grow this directory.
