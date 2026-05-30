# bumpalo migration plan (perf-roadmap §7.2 B)

> **Scope**: This is a multi-PR effort, not a single-session change. Each
> phase below is a separate PR with its own test+bench gate. Phases must
> land in order — half-migrated state offers no perf win and adds
> complexity.

## Current state (as of 2026-05-15)

The Svelte template AST already uses an **arena pattern**, just not bumpalo:

- `src/ast/arena.rs` defines `ParseArena` — a Vec-backed arena that
  stores all `JsNode` instances in a single contiguous `Vec<JsNode>`,
  referenced by `JsNodeId(u32)` indices.
- `JsNode` children (`Vec<JsNode>` fields like `arguments`, `body`) live
  in a second `Vec<JsNode>` referenced by `IdRange { start: u32, len: u32 }`.
- `Root.arena` owns one `ParseArena` per parse unit.

This pattern gives:

- ✅ Contiguous storage (cache-friendly)
- ✅ Bulk deallocation on arena drop
- ✅ Cheap allocation (Vec push)
- ❌ One pointer indirection per node access (`arena.get(id)` → vec index)
- ❌ Lost cache lines when chasing children IDs

OXC's `Allocator` (which wraps `bumpalo::Bump`) gives the same arena
benefits AND lets nodes hold **direct references** to their children
(`&'a JsNode<'a>`), eliminating the indirection.

`bumpalo = "3.16"` is in `Cargo.toml` with the `collections` feature.
The OXC AST transforms in `src/compiler/phases/3_transform/client/ast_state_transform.rs`
already use `oxc_allocator::Allocator` (bumpalo under the hood) via the
`AST_TRANSFORM_ALLOCATOR` thread-local. So bumpalo is proven in-tree —
just not for the Svelte template AST.

## Why this is a multi-PR effort

Touching `JsNode` cascades widely. Current usage:

| Symbol       | Files | Notes                                                    |
| ------------ | ----- | -------------------------------------------------------- |
| `JsNodeId`   | 10    | Every consumer that reaches into a JsNode child          |
| `IdRange`    | 12    | Every consumer that iterates over JsNode children        |
| `ParseArena` | 33    | Every site that allocates, queries, or threads the arena |

Every consumer would need a `'a` lifetime parameter on its types and
function signatures. Visitors, serializers, transforms, analysis —
all of them.

Half-migrated states are net-negative: you pay for the lifetime
plumbing without realizing the indirection win.

## Phased plan

Each phase is its own PR. Tests + compatibility report must stay at
100% after every phase. Run `./scripts/bench.sh` after each phase and
log the delta in the PR description.

### Phase 0 — Preparation (no behavior change)

- [ ] Add a `Bump` field to `ParseArena` alongside the existing `Vec`s
      (not used yet). This gives later phases a place to allocate from
      without changing public APIs.
- [ ] Add `ParseArena::bump(&self) -> &Bump` accessor.
- [ ] Confirm `ParseArena: Send` is still upheld (Bump is `Send`).
- [ ] Run bench, confirm zero regression.

**Risk**: low. **Reviewer focus**: the `unsafe impl Send` on
`ParseArena` — Bump is `Send` but not `Sync`, same as the current
`UnsafeCell<Vec<JsNode>>`.

### Phase 1 — Bump-allocated leaf data (Loc)

- [ ] Replace `Option<Box<Loc>>` in every `JsNode` variant with
      `Option<LocId>` where `LocId(u32)` indexes a new
      `ParseArena::locs: UnsafeCell<Vec<Loc>>` (still Vec-backed, mirrors
      `js_nodes`).
- [ ] Update every site that reads `loc.as_deref()` to go through
      `arena.get_loc(id)`.
- [ ] Migration window: this affects every JsNode variant signature
      and every Loc consumer. Estimate ~30 sites.

**Risk**: medium. `loc` is touched by error reporting, source map
generation, and any user-facing diagnostic. **Reviewer focus**: error
messages still surface the right span info after the indirection.

**Why this phase**: validates the "ID-indexed Bump-allocated leaf"
pattern before tackling the larger JsNode storage migration. If this
phase is sound, we can copy the pattern to JsNode itself.

**Decision point**: at the end of Phase 1, profile. If `Loc` allocs
weren't actually hot, **stop here** — the original `Box<Loc>` was
already cheap and we just added complexity. The roadmap's "+20%"
number comes from the JsNode storage migration, not Loc.

### Phase 2 — Bump-allocated JsNode storage

- [ ] Change `ParseArena::js_nodes` from `UnsafeCell<Vec<JsNode>>` to
      a Bump-allocated `bumpalo::collections::Vec<'arena, JsNode>`.
- [ ] This requires adding `'arena` lifetime to `ParseArena<'arena>`
      and `Root<'arena>` (the arena owner).
- [ ] All `ParseArena` consumers gain `'arena`.

**Risk**: high. **Reviewer focus**: serialization (Serde traits)
needs to handle the lifetime. `Root` is serialized at multiple points
(N-API boundary, ecosystem testing). Check the `#[serde(skip)]`
boundaries hold.

**Bench gate**: this phase should show measurable improvement
(allocation count down, single-threaded compile time down ~5–10%).
If not, revert and re-investigate.

### Phase 3 — Direct references for JsNode children

- [ ] Replace `JsNodeId` fields in `JsNode` variants (`left`, `right`,
      `callee`, …) with `&'arena JsNode<'arena>` direct references.
- [ ] Replace `IdRange` fields with `bumpalo::collections::Vec<'arena, JsNode<'arena>>`
      or `&'arena [JsNode<'arena>]`.
- [ ] Remove `arena.get_js_node(id)` / `arena.get_js_children(range)`
      call sites — replaced by direct field access.

**Risk**: very high. This is the biggest mechanical change — every
consumer touching JsNode children switches from `arena.get_js_node(child)`
to just `child` (the reference). Visitor patterns may need
restructuring.

**Bench gate**: this is where the +20% comes from. If we don't see
≥10% improvement on the `compile-client` bench, the migration isn't
paying off and something is fundamentally off (maybe the original
pattern was already near-optimal for our workload).

### Phase 4 — Drop the JsNodeId / IdRange types

- [ ] Once Phase 3 lands and is verified, remove `JsNodeId`,
      `IdRange`, and the now-empty arena accessor methods.
- [ ] Audit serializers: the JSON shape must still match the
      official Svelte compiler output (snapshot tests catch this).

**Risk**: medium — mostly mechanical, but the serializers are
load-bearing for the test fixture comparison.

## Cross-phase concerns

### Serialization

`Root` is serialized via Serde at several points. The `'arena`
lifetime needs to either:

- Be erased at the serialization boundary (own a separate
  Serde-friendly snapshot of the AST), or
- Use a `DeserializeSeed`-style pattern that owns the arena.

The simpler path is to serialize through a `Cow<'arena, Root<'static>>`
wrapper that copies on the rare serialize path. We deserialize back
into a fresh arena.

### Send / parallelism

`compile_batch` parallelizes per file with `rayon`. Each thread needs
its own arena. The thread-local pattern from `AST_TRANSFORM_ALLOCATOR`
already exists — Phase 0 should reuse it (one bump per thread,
reset between files).

### Concurrent borrow checking

The current `ParseArena` uses `UnsafeCell` and documents that
allocation is `&self`-callable. With bumpalo, allocation is naturally
`&self` (no UnsafeCell needed), so the safety story improves.
However, holding a `&'arena JsNode<'arena>` across an allocation is
fine (bumpalo never moves), so visitors can drop the `get_*` shim
indirection entirely.

## Estimate

| Phase             | Estimate      | Cumulative perf delta |
| ----------------- | ------------- | --------------------- |
| 0 (prep)          | 0.5 day       | 0%                    |
| 1 (Loc)           | 1–2 days      | 0–5%                  |
| 2 (Vec → bumpalo) | 2–3 days      | 0–5%                  |
| 3 (refs over IDs) | 3–5 days      | +10–20%               |
| 4 (cleanup)       | 0.5 day       | (no change)           |
| **Total**         | **7–10 days** | **+10–20%**           |

These are calendar-day estimates assuming focused work and that each
phase's bench-gate passes on the first try. Plan for ~50% buffer.

## Recommendation

Don't start until the remaining text-to-AST migrations
(`docs/text-to-ast-remaining-handover.md`) have landed. Those are
simpler, lower-risk, and already proven; the bumpalo migration
should build on a stable AST architecture.

Once those are done, do **Phase 0** first as a standalone PR to
unblock everyone, then sequence Phase 1 → 2 → 3 with at least one
bench cycle between each.

If after Phase 1 the `Loc` allocations weren't actually hot enough
to move the needle (very possible — `Option<Box<Loc>>` is rare),
**reconsider whether Phases 2–3 are worth it**. The +20% in the
PERF_ROADMAP is OXC's number; rsvelte's existing arena pattern
already captures some of that win, so our marginal headroom may be
smaller.
