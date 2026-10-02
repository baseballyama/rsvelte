# Compiler architecture

The Svelte compiler keeps language meaning in immutable data and lowers it in stages.
Its internal design is independent of the official Svelte compiler. The official compiler
remains the behavior oracle. This document records the design review of 2026-10-02.

## Research and decisions

| Primary source | What it teaches | Decision for this compiler |
| --- | --- | --- |
| [MLIR paper](https://arxiv.org/abs/2002.11054) and [rationale](https://mlir.llvm.org/docs/Rationale/Rationale/) | Keep domain information until a later representation can express it correctly. Lower progressively. | Keep elements, branches, loops, bindings and expression identities in HIR. Prepare render regions before choosing a JavaScript target. |
| [MLIR pass infrastructure](https://mlir.llvm.org/docs/PassManagement/) | Analyses do not mutate their input. Compute and cache them on demand. Pass state must respect concurrency boundaries. | Use the document artifact database for shared facts. A target owns its output tree and generated names. Parallelize documents. |
| [MLIR dialect conversion](https://mlir.llvm.org/docs/DialectConversion/) | A conversion has an explicit legal output. Full conversion fails if an operation cannot be lowered. | Keep unsupported constructs as diagnostics. Never drop them to obtain a successful output. |
| [Transform dialect paper](https://arxiv.org/abs/2409.03864) and [2026 MLIR scheduling work](https://llvm.org/devmtg/2026-04/slides/mlir/mlir_karna.pdf) | Optimization schedules can be represented separately from the program and tuned. | Keep semantic preparation separate from target scheduling. The current fixed stages need no schedule search. Add configurable optimization passes only with an objective, effect rules and measured benefit. |
| [rustc MIR](https://rustc-dev-guide.rust-lang.org/mir/index.html) | Separate representations by purpose. Use typed indices for blocks and locals. | Keep frontend syntax, compiler HIR, render regions and output JavaScript distinct. Use dense typed indices within each representation. |
| [rustc incremental compilation](https://rustc-dev-guide.rust-lang.org/queries/incremental-compilation-in-detail.html) and [Salsa algorithm](https://salsa-rs.github.io/salsa/reference/algorithm.html) | Reuse results through tracked dependencies and input revisions. | Share artifacts within one immutable document snapshot. Do not call the current cache incremental across edits: it has no revision graph. |
| [rust-analyzer architecture](https://rust-analyzer.github.io/book/contributing/architecture.html) | Syntax and semantic facts have separate lifetimes and responsibilities. Stable summaries can avoid invalidation from body edits. | Keep semantic facts in side tables. Formatting needs syntax, rather than a completed compilation. |
| [Cranelift IR](https://github.com/bytecodealliance/wasmtime/blob/main/cranelift/docs/ir.md) | SSA values, block parameters and explicit control flow serve machine code generation. | Keep structured template regions here. The output is JavaScript, whose expression tree already represents source control flow. A machine CFG would add a conversion without a consumer. |
| [egg paper](https://arxiv.org/abs/2004.03082) | Equality saturation searches equivalent expressions with rewrite rules and an extraction cost. | Do not reorder template expressions through an e-graph. JavaScript calls, getters, throws and reactive reads require an effect model and proven rewrite rules first. |

These are engineering choices based on the sources, rather than claims that one architecture
is the fastest. None requires an LLVM or Salsa dependency. Introducing a framework must solve
a measured problem that the current representations cannot solve.

## Code boundaries

| Crate | Responsibility |
| --- | --- |
| `crates/languages/svelte/core` | Source syntax, compiler HIR, semantic side tables, ComponentInput without task options. |
| `crates/languages/svelte/compile` | RenderPlan, shared script preparation, target lowering, CSS output, output names, compile options and artifacts. |
| `crates/languages/typescript/core` | The shared JavaScript/TypeScript tree and semantic model. |
| `crates/languages/typescript/compile` | JavaScript output printing. |
| `crates/kernel` | Document snapshots, artifact storage, task scheduling and measurements. |

Core has no dependency on the Svelte compile crate. The render normalizer belongs to the
compile crate; each backend asks for its result instead of importing another backend's helpers.
The surface tree owns attribute chunks; HIR reuses that type. Core does not choose an output
target, normalize output whitespace or escape emitted HTML.
Core registration adds only syntax and semantic artifacts. Compile registration adds the
render plan, output identity and scoped stylesheet, so other tools do not allocate slots for compile outputs.

## Compile implementation

| Module | Responsibility |
| --- | --- |
| `lower.rs` | Lowering entry points, borrowed facts and target dispatch. |
| `lower/prepare.rs` | Validate input, reserve names and rewrite the instance script into a new output tree. |
| `lower/validation.rs` | Shared compile checks, including runtime TypeScript rejection for every lowering entry point. |
| `lower/template.rs` | Target independent template rules used by backends and translators. |
| `lower/script.rs` and `lower/script/props.rs` | Rune rewriting and props lowering with a target parameter. |
| `lower/client.rs` and `lower/client/` | Private client state, DOM templates, children, elements, attributes, bindings, events and blocks. |
| `lower/server.rs` and `lower/server/` | Private server state, renderer fragments, elements, attributes and blocks. |
| `emit.rs` | An immutable LoweredModule keeps its tree, program root and source together for emission. |

Backend modules and name allocation are private. Child modules extend their parent's context
and borrow the same immutable facts. They do not own a second compiler pipeline. Shared
helpers exposed to translators stay separate from the target implementations.

Public low-level lowering still accepts analysis and a render plan separately. Their common
origin remains a caller contract; this layout change does not add document identity or a
revision graph. Typed provenance needs a shared snapshot identity in the core and kernel.

## Data flow

```text
immutable document
  └─ Parsed: lossless surface tree + one JavaScript tree
       └─ Normalized: compiler HIR + source origins
            ├─ Resolved: scopes and bindings
            │    └─ Analyzed: expression and stylesheet facts
            ├─ Identified: output names and CSS hash
            └─ Planned: immutable render regions
                 └─ shared script preparation(Target)
                      ├─ client runtime lowering → new JavaScript tree
                      └─ server runtime lowering → new JavaScript tree
                           └─ JavaScript printer → text and source mappings
```

`Planned` depends on the source, HIR and whitespace option, rather than a target. It owns its
normalized text so the artifact database can store it without a self-reference. Both Svelte
compile tasks borrow the same plan and output identity. Standalone callers can build a plan explicitly and pass
it to `lower_with_plan`; they must use the same input and whitespace option. The convenience
`lower` entry point builds one plan for its call.

A render region is a child list after whitespace normalization. It preserves ordered text,
expression IDs and HIR node IDs, plus the requirement for an initial text anchor. HIR still
owns element attributes and structured control flow. The plan is an overlay over HIR, not a
second copy of the whole component or a general SSA representation.

## Boundaries and invariants

| Boundary | Invariant |
| --- | --- |
| Surface → HIR | The frontend decides syntax. Later phases ask the tree about structure. Every HIR node retains its source origin. |
| HIR → RenderPlan | Normalize each region once. Compute inherited whitespace context here, including branches inside `pre` and `textarea`. A sibling cannot inherit another element's context. |
| RenderPlan → target | The backend borrows regions. It cannot change the plan or normalize whitespace again. Client DOM instructions and server renderer instructions have different output contracts. |
| Shared script preparation → target | Store/rune checks, name reservation, generated each indices and instance-script rewriting have one implementation, parameterized by `Target`. Generated node IDs belong to the same output tree as the prepared instance statements. |
| JavaScript helpers → backend | Call argument padding and object property construction are target independent. Neither the server nor script rewriter depends on the client backend. |
| Output → printer | LoweredModule keeps the completed tree, its root and source together. Emit that module once. Generated text is never parsed to continue a transformation. |
| Document → artifact database | Cache lifetime ends with the immutable document snapshot. Formatting and linting do not request RenderPlan. Each output target owns its mutable lowering state. |

The plan stores decoded text and raw markup separately. Collapsing them would double-escape
entities or change the HTML template. Empty child lists may share a region because their
normalized content and anchor requirement are identical.

## Optimizations and limits

Expression metadata already distinguishes reactive reads and calls. That is sufficient for
the existing target lowering, but it is not proof of purity. Do not use it to move calls across
branches, remove getter evaluation or merge evaluations. Such transformations need explicit
read/write/throw effects and oracle-backed tests for evaluation order.

The current plan owns text and retains prepared regions until the document's tasks finish.
This trades memory for shared preparation; it is not a measured speed improvement. Cross-edit
invalidation, persistent caches, region optimizations and an effect-aware SSA layer remain
separate work. A future cache must key configuration and source revisions, not only a path.

Keep source origins on HIR and real source locations on copied JavaScript. A render plan's
region ID is not a source offset. Whitespace-trimmed text currently inherits the existing
normalizer's mapping behavior; this change does not claim token-accurate text provenance.

## Validation

`crates/hosts/command_line/tests/render_plan.rs` checks nested whitespace context, separate
options, text ownership, character references, empty regions, document cache reuse and the
existing oracle-checked client/server whitespace modules. Run it beside workspace tests and
clippy after layout changes settle.

For the corpus, compare every artifact and diagnostic from both binaries on identical staged
inputs. Count refusals separately from successful JavaScript. Then compare JavaScript against
the fixture oracle: matching a previous binary alone cannot prove correctness. Save all moved
keys rather than a display-limited list. Performance remains unmeasured until paired release
runs isolate this change from other work in the shared checkout.

Measured on the working copy at `8465bdb16fb3712010b0847542544678dadd5415` during the layout
migration, with fixture oracle Svelte 5.57.1:

- Staged inputs: 18,161 units, checked by SHA-256 before and after.
- Six selected compile variants: 70,672 artifact keys in each arm, none moved. This includes
  diagnostics; it does not mean every input compiled. Live JavaScript outputs: 3,265 for Svelte,
  64 for svue and 1,371 for vuelte (both targets combined).
- Svelte oracle comparisons: client 17,528 units / 38,213 artifact rows; server 17,529 units /
  38,210 rows. Every row, including existing refusals and mismatches, kept its verdict.
- The artifact comparator detected an injected output change and the original was restored.
- Workspace tests, all-feature workspace clippy and rustdoc passed. The new tests also passed
  against the real compile tasks.

The two binaries have different SHA-256 hashes. The new binary contains the artifact name
`svelte.render_plan`; the old one does not. Logs, full oracle rows and the input hash manifest
are in `/private/tmp/rsvelte-architecture-corpus/`. These are temporary run artifacts, not
committed snapshots. The measurement includes the concurrent layout migration and is evidence
of preserved behavior, rather than an isolated performance result.
