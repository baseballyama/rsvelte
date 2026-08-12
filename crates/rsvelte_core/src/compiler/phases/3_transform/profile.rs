//! Lightweight thread-local timers for splitting Phase 3 (Transform) into
//! sub-phases (template fragment walk, instance-script text transform, CSS
//! render, JS codegen).
//!
//! Cost per `record()` call is one `Cell::get + add + Cell::set` — measured
//! at ~10ns per file in release builds. The `Instant::now()` / `elapsed()`
//! pair around each instrumented site dominates (~50ns × 2). Total
//! per-file instrumentation overhead is ~100–200ns, negligible against
//! Phase 3's ~60µs/file budget.
//!
//! Only the native profiling binaries read these accumulators back — the
//! compile pipeline never does, so the timers cannot affect compiler output.

use std::cell::Cell;
use std::time::Duration;

// `std::time::Instant::now()` traps on `wasm32-unknown-unknown` (no system
// clock — see std::sys::time::unsupported). The profile instrumentation
// below is consumed only by the native profiling binaries, but the call
// sites live in shared compile paths, so the Instant calls would
// fire from the WASM playground and crash the page. Provide a WASM-safe
// shim that returns a unit "instant" with a zero-cost elapsed so the
// instrumented sites stay compile-target-portable without #[cfg] noise.

#[cfg(not(target_arch = "wasm32"))]
pub type TimerStart = std::time::Instant;

#[cfg(target_arch = "wasm32")]
pub type TimerStart = ();

#[cfg(not(target_arch = "wasm32"))]
#[inline]
pub fn timer_start() -> TimerStart {
    std::time::Instant::now()
}

#[cfg(target_arch = "wasm32")]
#[inline]
pub fn timer_start() -> TimerStart {}

#[cfg(not(target_arch = "wasm32"))]
#[inline]
pub fn timer_elapsed(start: TimerStart) -> Duration {
    start.elapsed()
}

#[cfg(target_arch = "wasm32")]
#[inline]
pub fn timer_elapsed(_start: TimerStart) -> Duration {
    Duration::ZERO
}

/// Per-call-site cost of the `rsvelte_esrap` printer inside one compile run.
///
/// Split out from [`Phase3Breakdown`] because the printer is reached from six
/// independent sites and the question "would a faster printer speed up
/// `compile()`" needs each site's share separately, not their sum. The three
/// client branches stay apart because they take different printer entry points
/// and only one of them is reachable per compile.
#[derive(Default, Debug, Clone, Copy)]
pub struct EsrapBreakdown {
    /// Client final print, comment-bearing branch (`print_split`).
    pub client_split: Duration,
    pub client_split_calls: u64,
    /// Client final print, sourcemap branch (`print_with_map`).
    pub client_map: Duration,
    pub client_map_calls: u64,
    /// Client final print, plain branch (`print_with`).
    pub client_plain: Duration,
    pub client_plain_calls: u64,
    /// Server final print (the single whole-program `print`).
    pub server_print: Duration,
    pub server_print_calls: u64,
    /// Server async-body round-trip: the print half.
    pub server_pipe_print: Duration,
    /// Server async-body round-trip: the re-parse half of the same round-trip.
    pub server_pipe_reparse: Duration,
    pub server_pipe_calls: u64,
    /// `normalize_js_with_oxc` slow path (parse + print), print half only.
    pub normalize_print: Duration,
    pub normalize_calls: u64,
}

#[derive(Default, Debug, Clone, Copy)]
pub struct Phase3Breakdown {
    pub visit_program: Duration,
    pub script_text_transform: Duration,
    pub template_fragment: Duration,
    pub assembly_after_fragment: Duration,
    pub css_render: Duration,
    pub codegen: Duration,
}

/// One level below [`Phase3Breakdown::script_text_transform`], which is the
/// largest Phase 3 bucket. The five stages are sequential and disjoint, so the
/// difference between their sum and `script_text_transform` is the prologue
/// plus the early-out paths.
///
/// Do not expect `Σ stages == script_text_transform`. The residual is small
/// against the parent but is neither reproducible in magnitude nor stable in
/// sign -- measured between -0.05% and +2.5% of the parent on an idle machine,
/// and it flips sign and grows to double digits under load. The cause is
/// unexplained; read the stage shares as good to roughly a point, and read the
/// residual as an instrument reading rather than as prologue time.
#[derive(Default, Debug, Clone, Copy)]
pub struct ScriptTextBreakdown {
    /// Comment strip, class fields, comma split, arrow-paren strip.
    pub prenormalize: Duration,
    /// Gathering reactive / proxy / prop variable sets from the script text.
    pub collect_vars: Duration,
    /// The line-by-line accumulation loop, `process_accumulated` included.
    pub line_loop: Duration,
    /// The part of `line_loop` spent transforming completed statements; the
    /// remainder is the loop's own per-line scanning.
    pub process_accumulated: Duration,
    /// Completed statements handed to the processor.
    pub statements: u64,
    /// Source lines visited by the line loop.
    pub loop_lines: u64,
    /// Scripts whose statement boundaries came from the parser / from the scanner.
    pub boundary_ast: u64,
    pub boundary_scan: u64,
    /// Of `boundary_ast`, those answered from the program Phase 1 already
    /// parsed rather than from a parse this pipeline added.
    pub boundary_retained: u64,
    /// Why the rest could not be: indexed by `BOUNDARY_BAIL_*`. Without this the
    /// only visible number is the reuse rate, which says a parse was added but
    /// not what would have to change to stop adding it.
    pub boundary_bail: [u64; BOUNDARY_BAIL_KINDS],
    /// Statements the runes fast path emitted without calling the processor.
    pub fastpath_statements: u64,
    /// Calls to the brace-less-control-header probe, and the bytes it had to
    /// materialise to answer. Both are load-independent, so a change that
    /// claims to remove this work has to move them.
    pub ctrl_header_calls: u64,
    pub ctrl_header_bytes: u64,
    /// Script bytes handed to each whole-script scan in `collect_vars`,
    /// summed over the scans that actually ran.
    pub collect_scan_bytes: u64,
    pub collect_scan_passes: u64,
    /// `transform_client_runes_with_skip_and_state`, the per-statement rune rewrite.
    pub runes: Duration,
    /// The legacy `$:` reactive-statement branch.
    pub reactive_stmt: Duration,
    pub reactive_calls: u64,
    /// `reactive_stmt` split three ways: dependency extraction, the body
    /// rewrite, and the state-assignment AST pass that follows it.
    pub rs_deps: Duration,
    pub rs_body: Duration,
    pub rs_assigns: Duration,
    /// Reactive-statement append plus the runes-mode AST transforms.
    pub ast_transforms: Duration,
    /// Shadowed-local post-pass and dev-mode instrumentation.
    pub post_passes: Duration,
    /// Calls that reached the staged region (i.e. did not take an early out).
    pub calls: u64,
    /// Every entry into the staged function, early outs included.
    pub entries: u64,
    /// Every `record_script_text`. Must equal `entries`, or some staged work
    /// ran outside the parent timer and the stage sum cannot be compared to it.
    pub parent_calls: u64,
    /// Entries that happened while an outer entry was still on the stack.
    ///
    /// `entries == parent_calls` does not prove the two are paired: a missing
    /// one and a spare one cancel. Re-entry is the case that actually breaks
    /// the arithmetic, because the inner call's stage timers accumulate into
    /// the same totals the outer call's parent timer already covers, letting
    /// the stage sum exceed its parent. Any non-zero value here invalidates
    /// every share taken from `script_text` and below.
    pub nested_entries: u64,
    /// `record_script_text` split by call site, so a parent call with no entry
    /// (or the reverse) cannot hide inside an equal total.
    pub parent_site_main: u64,
    pub parent_site_pub: u64,
    /// Wall time inside the staged function, measured by the entry guard.
    ///
    /// Bounds the stage sum from above and the parent timer from below, so
    /// when the two disagree this says which of them is wrong.
    pub in_function: Duration,
    /// Entries that ran while no parent interval was open.
    ///
    /// This is the case equal totals cannot rule out: a parent interval that
    /// wraps no call, paired with a call that no parent wraps.
    pub entries_outside_parent: u64,
}

/// The `*_ast` rewrite passes all reach the parser through one choke point,
/// [`super::shared::ast_rewrite::with_program`], so counting there covers every
/// pass at once.
///
/// `bytes` is the load-independent quantity: it is the total source length
/// handed to the parser across a compile, so `bytes / file_len` says how many
/// times over the pipeline re-reads the same script. A ratio that grows with
/// file size is superlinear re-parsing; a flat ratio is a constant factor.
#[derive(Default, Debug, Clone, Copy)]
pub struct ReparseBreakdown {
    /// Time inside `Parser::parse` only.
    pub parse: Duration,
    /// Time inside the visitor closure, i.e. everything the pass does with the
    /// program once it exists.
    pub visit: Duration,
    pub calls: u64,
    /// Summed `source.len()` over every call.
    pub bytes: u64,
    /// The same three numbers for passes that build a `Parser` themselves
    /// instead of going through the shared driver. Kept apart so the driver's
    /// count is never mistaken for the whole re-parse cost.
    pub direct_parse: Duration,
    pub direct_calls: u64,
    pub direct_bytes: u64,
}

thread_local! {
    static REPARSE: Cell<(Duration, Duration, u64, u64)> =
        const { Cell::new((Duration::ZERO, Duration::ZERO, 0, 0)) };
    static REPARSE_DIRECT: Cell<(Duration, u64, u64)> =
        const { Cell::new((Duration::ZERO, 0, 0)) };

    static VISIT_PROGRAM: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static SCRIPT_TEXT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static TEMPLATE_FRAGMENT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ASSEMBLY_AFTER_FRAGMENT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static CSS_RENDER: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static CODEGEN: Cell<Duration> = const { Cell::new(Duration::ZERO) };

    static ST_PRENORMALIZE: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_COLLECT_VARS: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_LINE_LOOP: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_AST_TRANSFORMS: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_POST_PASSES: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_CALLS: Cell<u64> = const { Cell::new(0) };
    static ST_ENTRIES: Cell<u64> = const { Cell::new(0) };
    static ST_PROCESS_ACCUMULATED: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_STATEMENTS: Cell<u64> = const { Cell::new(0) };
    static ST_LOOP_LINES: Cell<u64> = const { Cell::new(0) };
    static ST_BOUNDARY_AST: Cell<u64> = const { Cell::new(0) };
    static ST_BOUNDARY_SCAN: Cell<u64> = const { Cell::new(0) };
    static ST_BOUNDARY_RETAINED: Cell<u64> = const { Cell::new(0) };
    static ST_BOUNDARY_BAIL: [Cell<u64>; BOUNDARY_BAIL_KINDS] =
        const { [const { Cell::new(0) }; BOUNDARY_BAIL_KINDS] };
    static ST_FASTPATH_STATEMENTS: Cell<u64> = const { Cell::new(0) };
    static ST_CTRL_HEADER_CALLS: Cell<u64> = const { Cell::new(0) };
    static ST_CTRL_HEADER_BYTES: Cell<u64> = const { Cell::new(0) };
    static ST_COLLECT_SCAN_BYTES: Cell<u64> = const { Cell::new(0) };
    static ST_COLLECT_SCAN_PASSES: Cell<u64> = const { Cell::new(0) };
    static ST_RUNES: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_REACTIVE_STMT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_REACTIVE_CALLS: Cell<u64> = const { Cell::new(0) };
    static ST_RS_DEPS: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_RS_BODY: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_RS_ASSIGNS: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_PARENT_CALLS: Cell<u64> = const { Cell::new(0) };
    static ST_DEPTH: Cell<u64> = const { Cell::new(0) };
    static ST_NESTED_ENTRIES: Cell<u64> = const { Cell::new(0) };
    static ST_IN_FUNCTION: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ST_PARENT_OPEN: Cell<u64> = const { Cell::new(0) };
    static ST_ENTRIES_OUTSIDE: Cell<u64> = const { Cell::new(0) };
    static ST_PARENT_SITE_MAIN: Cell<u64> = const { Cell::new(0) };
    static ST_PARENT_SITE_PUB: Cell<u64> = const { Cell::new(0) };

    static ESRAP_CLIENT_SPLIT: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_CLIENT_MAP: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_CLIENT_PLAIN: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_SERVER: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_PIPE: Cell<(Duration, Duration, u64)> =
        const { Cell::new((Duration::ZERO, Duration::ZERO, 0)) };
    static ESRAP_NORMALIZE: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
}

#[inline]
pub fn record_reparse(parse: Duration, visit: Duration, bytes: usize) {
    REPARSE.with(|c| {
        let (p, v, n, b) = c.get();
        c.set((p + parse, v + visit, n + 1, b + bytes as u64));
    });
}

#[inline]
pub fn record_direct_parse(parse: Duration, bytes: usize) {
    REPARSE_DIRECT.with(|c| {
        let (p, n, b) = c.get();
        c.set((p + parse, n + 1, b + bytes as u64));
    });
}

pub fn take_reparse_breakdown() -> ReparseBreakdown {
    let (parse, visit, calls, bytes) = REPARSE.replace((Duration::ZERO, Duration::ZERO, 0, 0));
    let (direct_parse, direct_calls, direct_bytes) = REPARSE_DIRECT.replace((Duration::ZERO, 0, 0));
    ReparseBreakdown {
        parse,
        visit,
        calls,
        bytes,
        direct_parse,
        direct_calls,
        direct_bytes,
    }
}

#[inline]
pub fn record_esrap_client_split(d: Duration) {
    ESRAP_CLIENT_SPLIT.with(|c| {
        let (t, n) = c.get();
        c.set((t + d, n + 1));
    });
}

#[inline]
pub fn record_esrap_client_map(d: Duration) {
    ESRAP_CLIENT_MAP.with(|c| {
        let (t, n) = c.get();
        c.set((t + d, n + 1));
    });
}

#[inline]
pub fn record_esrap_client_plain(d: Duration) {
    ESRAP_CLIENT_PLAIN.with(|c| {
        let (t, n) = c.get();
        c.set((t + d, n + 1));
    });
}

#[inline]
pub fn record_esrap_server(d: Duration) {
    ESRAP_SERVER.with(|c| {
        let (t, n) = c.get();
        c.set((t + d, n + 1));
    });
}

#[inline]
pub fn record_esrap_pipe(print: Duration, reparse: Duration) {
    ESRAP_PIPE.with(|c| {
        let (p, r, n) = c.get();
        c.set((p + print, r + reparse, n + 1));
    });
}

#[inline]
pub fn record_esrap_normalize(d: Duration) {
    ESRAP_NORMALIZE.with(|c| {
        let (t, n) = c.get();
        c.set((t + d, n + 1));
    });
}

pub fn take_esrap_breakdown() -> EsrapBreakdown {
    let (client_split, client_split_calls) =
        ESRAP_CLIENT_SPLIT.with(|c| c.replace((Duration::ZERO, 0)));
    let (client_map, client_map_calls) = ESRAP_CLIENT_MAP.with(|c| c.replace((Duration::ZERO, 0)));
    let (client_plain, client_plain_calls) =
        ESRAP_CLIENT_PLAIN.with(|c| c.replace((Duration::ZERO, 0)));
    let (server_print, server_print_calls) = ESRAP_SERVER.with(|c| c.replace((Duration::ZERO, 0)));
    let (server_pipe_print, server_pipe_reparse, server_pipe_calls) =
        ESRAP_PIPE.with(|c| c.replace((Duration::ZERO, Duration::ZERO, 0)));
    let (normalize_print, normalize_calls) =
        ESRAP_NORMALIZE.with(|c| c.replace((Duration::ZERO, 0)));
    EsrapBreakdown {
        client_split,
        client_split_calls,
        client_map,
        client_map_calls,
        client_plain,
        client_plain_calls,
        server_print,
        server_print_calls,
        server_pipe_print,
        server_pipe_reparse,
        server_pipe_calls,
        normalize_print,
        normalize_calls,
    }
}

#[inline]
pub fn record_visit_program(d: Duration) {
    VISIT_PROGRAM.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_script_text(d: Duration) {
    SCRIPT_TEXT.with(|c| c.set(c.get() + d));
    ST_PARENT_CALLS.with(|c| c.set(c.get() + 1));
}

#[inline]
pub fn record_parent_site(is_pub: bool) {
    if is_pub {
        ST_PARENT_SITE_PUB.with(|c| c.set(c.get() + 1));
    } else {
        ST_PARENT_SITE_MAIN.with(|c| c.set(c.get() + 1));
    }
}

/// Tracks how deep the staged function is on the stack, so a re-entrant call
/// is counted rather than inferred.
pub struct EntryGuard(TimerStart);

impl EntryGuard {
    #[expect(clippy::new_without_default, reason = "a guard is never defaulted")]
    pub fn new() -> Self {
        ST_DEPTH.with(|d| {
            let depth = d.get() + 1;
            d.set(depth);
            if depth > 1 {
                ST_NESTED_ENTRIES.with(|c| c.set(c.get() + 1));
            }
        });
        if ST_PARENT_OPEN.with(Cell::get) == 0 {
            ST_ENTRIES_OUTSIDE.with(|c| c.set(c.get() + 1));
        }
        Self(timer_start())
    }
}

/// Marks the span a parent timer covers, so an entry can tell whether it is
/// inside one.
pub struct ParentScope;

impl ParentScope {
    #[expect(clippy::new_without_default, reason = "a guard is never defaulted")]
    pub fn new() -> Self {
        ST_PARENT_OPEN.with(|c| c.set(c.get() + 1));
        Self
    }
}

impl Drop for ParentScope {
    fn drop(&mut self) {
        ST_PARENT_OPEN.with(|c| c.set(c.get().saturating_sub(1)));
    }
}

impl Drop for EntryGuard {
    fn drop(&mut self) {
        ST_DEPTH.with(|d| d.set(d.get().saturating_sub(1)));
        let elapsed = timer_elapsed(self.0);
        ST_IN_FUNCTION.with(|c| c.set(c.get() + elapsed));
    }
}

#[inline]
pub fn record_st_entry() {
    ST_ENTRIES.with(|c| c.set(c.get() + 1));
}

#[inline]
pub fn record_template_fragment(d: Duration) {
    TEMPLATE_FRAGMENT.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_assembly_after_fragment(d: Duration) {
    ASSEMBLY_AFTER_FRAGMENT.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_css_render(d: Duration) {
    CSS_RENDER.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_codegen(d: Duration) {
    CODEGEN.with(|c| c.set(c.get() + d));
}

/// Records into [`ScriptTextBreakdown::process_accumulated`] on drop, so the
/// statement processor's many early returns all get counted.
pub struct ProcessAccumulatedGuard(pub TimerStart);

impl Drop for ProcessAccumulatedGuard {
    fn drop(&mut self) {
        ST_PROCESS_ACCUMULATED.with(|c| c.set(c.get() + timer_elapsed(self.0)));
        ST_STATEMENTS.with(|c| c.set(c.get() + 1));
    }
}

#[inline]
pub fn record_st_runes(d: Duration) {
    ST_RUNES.with(|c| c.set(c.get() + d));
}

/// Prenormalize accounting for the text->AST migration's span-validity gate.
///
/// Phase 2's spans stay valid into `line_loop` exactly when prenormalize left
/// the script byte-identical. `invoked` and `changed` are counted separately
/// because a transform can run its guard, do nothing, and still be counted as a
/// blocker by anyone reading the guard conditions instead of the outcome.
#[derive(Default, Debug, Clone, Copy)]
pub struct PrenormalizeCounters {
    pub files: u64,
    /// Files whose text differs between pipeline entry and `line_loop` entry.
    pub text_changed: u64,
    pub inv_comments: u64,
    pub chg_comments: u64,
    pub inv_class_fields: u64,
    pub chg_class_fields: u64,
    pub inv_split_decls: u64,
    pub chg_split_decls: u64,
    /// Files where at least one transform changed the text. Distinct from the
    /// sum of the per-transform counts, which double-counts a file that two
    /// transforms both touched -- that difference is why the naive identity
    /// `text_changed == sum(changed)` fails for a benign reason.
    pub any_changed_files: u64,
}

#[cfg(feature = "measure-pa-split")]
thread_local! {
    static PN: Cell<[u64; 9]> = const { Cell::new([0; 9]) };
}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub fn record_pn(idx: usize) {
    PN.with(|c| {
        let mut a = c.get();
        a[idx] += 1;
        c.set(a);
    });
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub fn record_pn(_idx: usize) {}

pub const PN_FILES: usize = 0;
pub const PN_TEXT_CHANGED: usize = 1;
pub const PN_INV_COMMENTS: usize = 2;
pub const PN_CHG_COMMENTS: usize = 3;
pub const PN_INV_CLASS: usize = 4;
pub const PN_CHG_CLASS: usize = 5;
pub const PN_INV_SPLIT: usize = 6;
pub const PN_CHG_SPLIT: usize = 7;
pub const PN_ANY_CHANGED: usize = 8;

#[cfg(feature = "measure-pa-split")]
pub fn take_prenormalize_counters() -> PrenormalizeCounters {
    let a = PN.with(|c| c.replace([0; 9]));
    PrenormalizeCounters {
        files: a[0],
        text_changed: a[1],
        inv_comments: a[2],
        chg_comments: a[3],
        inv_class_fields: a[4],
        chg_class_fields: a[5],
        inv_split_decls: a[6],
        chg_split_decls: a[7],
        any_changed_files: a[8],
    }
}

#[cfg(not(feature = "measure-pa-split"))]
pub fn take_prenormalize_counters() -> PrenormalizeCounters {
    PrenormalizeCounters::default()
}

/// `transform_state_pipeline_ast`'s pre-filter accounting. All deterministic,
/// so a fix that claims to remove this work has to move them.
#[derive(Default, Debug, Clone, Copy)]
pub struct StatePipelineCounters {
    pub calls: u64,
    /// Calls that built the filtered read-name vector and then took an early
    /// out without using it.
    pub alloc_then_bail: u64,
    /// `String` clones performed by those wasted builds.
    pub wasted_clones: u64,
}

#[cfg(feature = "measure-pa-split")]
thread_local! {
    static SP_CALLS: Cell<u64> = const { Cell::new(0) };
    static SP_BAIL: Cell<u64> = const { Cell::new(0) };
    static SP_WASTED: Cell<u64> = const { Cell::new(0) };
}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub fn record_sp_call() {
    SP_CALLS.with(|c| c.set(c.get() + 1));
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub fn record_sp_call() {}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub fn record_sp_bail(clones: u64) {
    SP_BAIL.with(|c| c.set(c.get() + 1));
    SP_WASTED.with(|c| c.set(c.get() + clones));
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub fn record_sp_bail(_clones: u64) {}

#[cfg(feature = "measure-pa-split")]
pub fn take_state_pipeline_counters() -> StatePipelineCounters {
    StatePipelineCounters {
        calls: SP_CALLS.with(|c| c.replace(0)),
        alloc_then_bail: SP_BAIL.with(|c| c.replace(0)),
        wasted_clones: SP_WASTED.with(|c| c.replace(0)),
    }
}

#[cfg(not(feature = "measure-pa-split"))]
pub fn take_state_pipeline_counters() -> StatePipelineCounters {
    StatePipelineCounters::default()
}

/// Named split of `process_accumulated`, in execution order. The two stages the
/// parent already times separately (`reactive_stmt`, `runes`) are not repeated
/// here; a reader sums those two, these, and `other` to reach the parent.
pub const PA_STAGE_NAMES: [&str; PA_STAGES] = [
    "join",
    "export_kw_probe",
    "export_let",
    "export_specifier",
    "export_strip",
    "snapshot_dev",
    "empty_check",
    "destructure_assignments",
    "state_assigns",
    "store_unsub_for_state_sets",
    "member_mutations",
    "prop_update_expressions",
    "prop_source_reads",
    "prop_assignments",
    "stores",
    "legacy_destructure_declarations",
    "legacy_state_declarations",
    "state_reads",
    "rest_prop_member_access",
    "read_only_props",
    "console_dev",
    "emit",
    "  el:destructured",
    "  el:transform_export_let",
    "  el:prop_reads_in_defaults",
    "  el:state_pipeline",
    "  el:store_reads_in_defaults",
];

/// Indices at and above this one are nested inside another stage and must be
/// excluded from the sum that is checked against the parent.
pub const PA_NESTED_FROM: usize = 22;
pub const PA_STAGES: usize = 27;

pub const PA_JOIN: usize = 0;
pub const PA_EXPORT_KW_PROBE: usize = 1;
pub const PA_EXPORT_LET: usize = 2;
pub const PA_EXPORT_SPECIFIER: usize = 3;
pub const PA_EXPORT_STRIP: usize = 4;
pub const PA_SNAPSHOT_DEV: usize = 5;
pub const PA_EMPTY_CHECK: usize = 6;
pub const PA_DESTRUCTURE_ASSIGNMENTS: usize = 7;
pub const PA_STATE_ASSIGNS: usize = 8;
pub const PA_STORE_UNSUB: usize = 9;
pub const PA_MEMBER_MUTATIONS: usize = 10;
pub const PA_PROP_UPDATE_EXPRESSIONS: usize = 11;
pub const PA_PROP_SOURCE_READS: usize = 12;
pub const PA_PROP_ASSIGNMENTS: usize = 13;
pub const PA_STORES: usize = 14;
pub const PA_LEGACY_DESTRUCTURE_DECLARATIONS: usize = 15;
pub const PA_LEGACY_STATE_DECLARATIONS: usize = 16;
pub const PA_STATE_READS: usize = 17;
pub const PA_REST_PROP_MEMBER_ACCESS: usize = 18;
pub const PA_READ_ONLY_PROPS: usize = 19;
pub const PA_CONSOLE_DEV: usize = 20;
pub const PA_EMIT: usize = 21;

/// `export_let`'s own four calls, one level below [`PA_EXPORT_LET`]. Kept in the
/// same accumulator so the sub-rows and their parent are drained together; they
/// are nested inside `PA_EXPORT_LET`, so they are NOT part of the split sum.
pub const PA_EL_DESTRUCTURED: usize = 22;
pub const PA_EL_TRANSFORM: usize = 23;
pub const PA_EL_PROP_READS: usize = 24;
pub const PA_EL_STATE_PIPELINE: usize = 25;
pub const PA_EL_STORE_READS: usize = 26;

/// Per-stage time plus the two load-independent work counters, so a surprising
/// time row can be asked whether the work moved or only the clock did.
#[derive(Default, Debug, Clone, Copy)]
pub struct PaBreakdown {
    pub time: [Duration; PA_STAGES],
    /// Times the stage was entered, including the runs where its guard made it
    /// a no-op -- an entered no-op still costs the timer pair.
    pub calls: [u64; PA_STAGES],
    /// Input bytes the stage was handed.
    pub bytes: [u64; PA_STAGES],
    /// `Instant` pairs this split added inside the parent it is compared to.
    pub timer_pairs: u64,
}

#[cfg(feature = "measure-pa-split")]
thread_local! {
    static PA_TIME: [Cell<u64>; PA_STAGES] = Default::default();
    static PA_CALLS: [Cell<u64>; PA_STAGES] = Default::default();
    static PA_BYTES: [Cell<u64>; PA_STAGES] = Default::default();
}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub fn record_pa(idx: usize, d: Duration, bytes: u64) {
    PA_TIME.with(|a| a[idx].set(a[idx].get() + d.as_nanos() as u64));
    PA_CALLS.with(|a| a[idx].set(a[idx].get() + 1));
    PA_BYTES.with(|a| a[idx].set(a[idx].get() + bytes));
}

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub fn record_pa(_idx: usize, _d: Duration, _bytes: u64) {}

/// Records a `process_accumulated` stage on drop, for the regions that return
/// out of the closure rather than falling through.
#[cfg(feature = "measure-pa-split")]
pub struct PaGuard {
    idx: usize,
    bytes: u64,
    start: TimerStart,
}

#[cfg(feature = "measure-pa-split")]
impl Drop for PaGuard {
    fn drop(&mut self) {
        record_pa(self.idx, timer_elapsed(self.start), self.bytes);
    }
}

#[cfg(feature = "measure-pa-split")]
#[inline]
pub fn pa_guard(idx: usize, bytes: u64) -> PaGuard {
    PaGuard {
        idx,
        bytes,
        start: timer_start(),
    }
}

#[cfg(not(feature = "measure-pa-split"))]
pub struct PaGuard;

#[cfg(not(feature = "measure-pa-split"))]
#[inline(always)]
pub fn pa_guard(_idx: usize, _bytes: u64) -> PaGuard {
    PaGuard
}

#[cfg(feature = "measure-pa-split")]
pub fn take_pa_breakdown() -> PaBreakdown {
    let mut out = PaBreakdown::default();
    PA_TIME.with(|a| {
        for (i, c) in a.iter().enumerate() {
            out.time[i] = Duration::from_nanos(c.replace(0));
        }
    });
    PA_CALLS.with(|a| {
        for (i, c) in a.iter().enumerate() {
            out.calls[i] = c.replace(0);
        }
    });
    PA_BYTES.with(|a| {
        for (i, c) in a.iter().enumerate() {
            out.bytes[i] = c.replace(0);
        }
    });
    out.timer_pairs = out.calls.iter().sum();
    out
}

#[cfg(not(feature = "measure-pa-split"))]
pub fn take_pa_breakdown() -> PaBreakdown {
    PaBreakdown::default()
}

pub const TF_KINDS: [&str; 41] = [
    "component",
    "svelte_component",
    "svelte_self",
    "svelte_element",
    "expression_tag",
    "regular_element",
    "text",
    "if_block",
    "each_block",
    "await_block",
    "key_block",
    "snippet_block",
    "render_tag",
    "html_tag",
    "const_tag",
    "declaration_tag",
    "debug_tag",
    "svelte_boundary",
    "svelte_head",
    "svelte_body",
    "svelte_window",
    "svelte_document",
    "title_element",
    "comment",
    "svelte_fragment",
    "slot_element",
    "other",
    // Stages inside `build_component`. Self time, like the rows above, so they
    // are subtracted from the `component` row rather than added beside it.
    "bc:let_directive",
    "bc:on_directive",
    "bc:spread_attribute",
    "bc:regular_attribute",
    "bc:bind_directive",
    "bc:attach_tag",
    "bc:snippet_block",
    "bc:slot_function",
    "bc:props_expression",
    "bc:component_expression",
    "bc:component_call",
    "bc:css_props",
    "bc:meta_stmt",
    "bc:slot_children",
];

pub const TF_BC_LET: usize = 27;
pub const TF_BC_ON: usize = 28;
pub const TF_BC_SPREAD: usize = 29;
pub const TF_BC_ATTR: usize = 30;
pub const TF_BC_BIND: usize = 31;
pub const TF_BC_ATTACH: usize = 32;
pub const TF_BC_SNIPPET: usize = 33;
pub const TF_BC_SLOT_FN: usize = 34;
pub const TF_BC_PROPS: usize = 35;
pub const TF_BC_COMP_EXPR: usize = 36;
pub const TF_BC_COMP_CALL: usize = 37;
pub const TF_BC_CSS_PROPS: usize = 38;
pub const TF_BC_META: usize = 39;
pub const TF_BC_SLOT_CHILDREN: usize = 40;

/// Self time and call count per template node kind, drained together with the
/// `template_fragment` parent they are compared against.
#[derive(Debug, Clone, Copy)]
pub struct TfBreakdown {
    pub time: [Duration; TF_KINDS.len()],
    pub calls: [u64; TF_KINDS.len()],
}

// `Default` is only derivable for arrays up to 32 entries.
impl Default for TfBreakdown {
    fn default() -> Self {
        Self {
            time: [Duration::ZERO; TF_KINDS.len()],
            calls: [0; TF_KINDS.len()],
        }
    }
}

#[cfg(feature = "measure-tf-split")]
thread_local! {
    static TF_TIME: [Cell<u64>; TF_KINDS.len()] = const { [const { Cell::new(0) }; TF_KINDS.len()] };
    static TF_CALLS: [Cell<u64>; TF_KINDS.len()] = const { [const { Cell::new(0) }; TF_KINDS.len()] };
    /// Time the frames below the open one have already claimed. The visitor is
    /// recursive, so an inclusive timer would charge an element for everything
    /// inside it; each frame subtracts what its children took.
    static TF_CHILD: Cell<u64> = const { Cell::new(0) };
}

/// Charges self time to `idx` on drop.
#[cfg(feature = "measure-tf-split")]
pub struct TfGuard {
    idx: usize,
    start: TimerStart,
    saved_child: u64,
}

#[cfg(feature = "measure-tf-split")]
impl Drop for TfGuard {
    fn drop(&mut self) {
        let total = timer_elapsed(self.start).as_nanos() as u64;
        let child = TF_CHILD.with(|c| c.get());
        TF_TIME.with(|a| a[self.idx].set(a[self.idx].get() + total.saturating_sub(child)));
        TF_CALLS.with(|a| a[self.idx].set(a[self.idx].get() + 1));
        TF_CHILD.with(|c| c.set(self.saved_child + total));
    }
}

#[cfg(feature = "measure-tf-split")]
#[inline]
pub fn tf_guard(idx: usize) -> TfGuard {
    let saved_child = TF_CHILD.with(|c| c.replace(0));
    TfGuard {
        idx,
        start: timer_start(),
        saved_child,
    }
}

#[cfg(not(feature = "measure-tf-split"))]
pub struct TfGuard;

#[cfg(not(feature = "measure-tf-split"))]
#[inline(always)]
pub fn tf_guard(_idx: usize) -> TfGuard {
    TfGuard
}

#[cfg(feature = "measure-tf-split")]
pub fn take_tf_breakdown() -> TfBreakdown {
    let mut out = TfBreakdown::default();
    TF_TIME.with(|a| {
        for (i, c) in a.iter().enumerate() {
            out.time[i] = Duration::from_nanos(c.replace(0));
        }
    });
    TF_CALLS.with(|a| {
        for (i, c) in a.iter().enumerate() {
            out.calls[i] = c.replace(0);
        }
    });
    TF_CHILD.with(|c| c.set(0));
    out
}

#[cfg(not(feature = "measure-tf-split"))]
pub fn take_tf_breakdown() -> TfBreakdown {
    TfBreakdown::default()
}

/// Records the legacy `$:` branch on drop, which returns from several points.
pub struct ReactiveStmtGuard(pub TimerStart);

impl Drop for ReactiveStmtGuard {
    fn drop(&mut self) {
        ST_REACTIVE_STMT.with(|c| c.set(c.get() + timer_elapsed(self.0)));
        ST_REACTIVE_CALLS.with(|c| c.set(c.get() + 1));
    }
}

#[inline]
pub fn record_rs_deps(d: Duration) {
    ST_RS_DEPS.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_rs_body(d: Duration) {
    ST_RS_BODY.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_rs_assigns(d: Duration) {
    ST_RS_ASSIGNS.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_st_prenormalize(d: Duration) {
    ST_PRENORMALIZE.with(|c| c.set(c.get() + d));
    ST_CALLS.with(|c| c.set(c.get() + 1));
}

#[inline]
pub fn record_st_collect_vars(d: Duration) {
    ST_COLLECT_VARS.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_st_line_loop(d: Duration) {
    ST_LINE_LOOP.with(|c| c.set(c.get() + d));
}

/// Scripts whose statement boundaries came from the parser, and those that fell
/// back to the scanner. A byte-identical corpus proves nothing about which path
/// ran, so the adoption rate has to be counted rather than inferred.
#[inline]
pub fn record_st_boundary_source(from_ast: bool) {
    if from_ast {
        ST_BOUNDARY_AST.with(|c| c.set(c.get() + 1));
    } else {
        ST_BOUNDARY_SCAN.with(|c| c.set(c.get() + 1));
    }
}

/// Of the AST-sourced boundaries, those that cost no parse.
#[inline]
pub fn record_st_boundary_retained() {
    ST_BOUNDARY_RETAINED.with(|c| c.set(c.get() + 1));
}

pub const BOUNDARY_BAIL_KINDS: usize = 8;
/// Phase 1 kept no program for this script.
pub const BOUNDARY_BAIL_NO_RETAINED: usize = 0;
/// It kept one, but the parse did not come out clean.
pub const BOUNDARY_BAIL_DIAGNOSTICS: usize = 1;
/// The pipeline's text is not a verbatim region of what Phase 1 parsed, on a
/// TypeScript script — stripping rewrote it.
pub const BOUNDARY_BAIL_TEXT_DIFFERS_TS: usize = 2;
/// Same, but the script is not TypeScript, so stripping cannot be the cause and
/// a projection through it would not help.
pub const BOUNDARY_BAIL_TEXT_DIFFERS_JS: usize = 5;
/// TypeScript, and no projection exists to map the retained spans through — so
/// using the projection cannot recover this one. Separating it keeps "the cause
/// is TS" from being read as "a projection fixes it".
pub const BOUNDARY_BAIL_TS_NO_PROJECTION: usize = 6;
/// A projection existed and still could not place the spans. Separate from
/// `TEXT_DIFFERS_TS` so a projection path that silently never works is visible
/// as its own number rather than folded back into the reason it was built for.
pub const BOUNDARY_BAIL_PROJECTION_FAILED: usize = 7;
/// A statement or comment crosses the region's edge.
pub const BOUNDARY_BAIL_STRADDLE: usize = 3;
/// Nothing begins where the region begins.
pub const BOUNDARY_BAIL_UNANCHORED: usize = 4;

pub const BOUNDARY_BAIL_NAMES: [&str; BOUNDARY_BAIL_KINDS] = [
    "no retained program",
    "retained parse unclean",
    "text differs, TypeScript",
    "span straddles the edge",
    "region unanchored",
    "text differs, not TypeScript",
    "TypeScript, no projection",
    "projection could not place the spans",
];

#[inline]
pub fn record_st_boundary_bail(kind: usize) {
    ST_BOUNDARY_BAIL.with(|a| a[kind].set(a[kind].get() + 1));
}

#[inline]
pub fn record_st_loop_lines(n: u64) {
    ST_LOOP_LINES.with(|c| c.set(c.get() + n));
}

#[inline]
pub fn record_st_fastpath_statement() {
    ST_FASTPATH_STATEMENTS.with(|c| c.set(c.get() + 1));
}

#[inline]
pub fn record_st_ctrl_header(bytes: u64) {
    ST_CTRL_HEADER_CALLS.with(|c| c.set(c.get() + 1));
    ST_CTRL_HEADER_BYTES.with(|c| c.set(c.get() + bytes));
}

#[inline]
pub fn record_st_collect_scan(bytes: u64) {
    ST_COLLECT_SCAN_PASSES.with(|c| c.set(c.get() + 1));
    ST_COLLECT_SCAN_BYTES.with(|c| c.set(c.get() + bytes));
}

#[inline]
pub fn record_st_ast_transforms(d: Duration) {
    ST_AST_TRANSFORMS.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_st_post_passes(d: Duration) {
    ST_POST_PASSES.with(|c| c.set(c.get() + d));
}

pub fn take_script_text_breakdown() -> ScriptTextBreakdown {
    ScriptTextBreakdown {
        prenormalize: ST_PRENORMALIZE.with(|c| c.replace(Duration::ZERO)),
        collect_vars: ST_COLLECT_VARS.with(|c| c.replace(Duration::ZERO)),
        line_loop: ST_LINE_LOOP.with(|c| c.replace(Duration::ZERO)),
        ast_transforms: ST_AST_TRANSFORMS.with(|c| c.replace(Duration::ZERO)),
        post_passes: ST_POST_PASSES.with(|c| c.replace(Duration::ZERO)),
        calls: ST_CALLS.with(|c| c.replace(0)),
        process_accumulated: ST_PROCESS_ACCUMULATED.with(|c| c.replace(Duration::ZERO)),
        statements: ST_STATEMENTS.with(|c| c.replace(0)),
        loop_lines: ST_LOOP_LINES.with(|c| c.replace(0)),
        boundary_ast: ST_BOUNDARY_AST.with(|c| c.replace(0)),
        boundary_scan: ST_BOUNDARY_SCAN.with(|c| c.replace(0)),
        boundary_retained: ST_BOUNDARY_RETAINED.with(|c| c.replace(0)),
        boundary_bail: ST_BOUNDARY_BAIL.with(|a| std::array::from_fn(|i| a[i].replace(0))),
        fastpath_statements: ST_FASTPATH_STATEMENTS.with(|c| c.replace(0)),
        ctrl_header_calls: ST_CTRL_HEADER_CALLS.with(|c| c.replace(0)),
        ctrl_header_bytes: ST_CTRL_HEADER_BYTES.with(|c| c.replace(0)),
        collect_scan_bytes: ST_COLLECT_SCAN_BYTES.with(|c| c.replace(0)),
        collect_scan_passes: ST_COLLECT_SCAN_PASSES.with(|c| c.replace(0)),
        runes: ST_RUNES.with(|c| c.replace(Duration::ZERO)),
        reactive_stmt: ST_REACTIVE_STMT.with(|c| c.replace(Duration::ZERO)),
        reactive_calls: ST_REACTIVE_CALLS.with(|c| c.replace(0)),
        rs_deps: ST_RS_DEPS.with(|c| c.replace(Duration::ZERO)),
        rs_body: ST_RS_BODY.with(|c| c.replace(Duration::ZERO)),
        rs_assigns: ST_RS_ASSIGNS.with(|c| c.replace(Duration::ZERO)),
        entries: ST_ENTRIES.with(|c| c.replace(0)),
        parent_calls: ST_PARENT_CALLS.with(|c| c.replace(0)),
        nested_entries: ST_NESTED_ENTRIES.with(|c| c.replace(0)),
        parent_site_main: ST_PARENT_SITE_MAIN.with(|c| c.replace(0)),
        parent_site_pub: ST_PARENT_SITE_PUB.with(|c| c.replace(0)),
        in_function: ST_IN_FUNCTION.with(|c| c.replace(Duration::ZERO)),
        entries_outside_parent: ST_ENTRIES_OUTSIDE.with(|c| c.replace(0)),
    }
}

pub fn take_breakdown() -> Phase3Breakdown {
    Phase3Breakdown {
        visit_program: VISIT_PROGRAM.with(|c| c.replace(Duration::ZERO)),
        script_text_transform: SCRIPT_TEXT.with(|c| c.replace(Duration::ZERO)),
        template_fragment: TEMPLATE_FRAGMENT.with(|c| c.replace(Duration::ZERO)),
        assembly_after_fragment: ASSEMBLY_AFTER_FRAGMENT.with(|c| c.replace(Duration::ZERO)),
        css_render: CSS_RENDER.with(|c| c.replace(Duration::ZERO)),
        codegen: CODEGEN.with(|c| c.replace(Duration::ZERO)),
    }
}

/// Per-call-site `SemanticBuilder::build` accounting.
///
/// The scope-tree / symbol-table build is a fixed cost per call, so the useful
/// unit is builds-per-file, not bytes walked: knowing the total is hot does not
/// say which pass to fix.
pub const SEMANTIC_SITES: [&str; 14] = [
    "server/rune_call",
    "server/derived_reads",
    "client/state_pipeline",
    "client/state_pipeline.in_place",
    "client/state_call",
    "client/state_reads",
    "client/read_only_props",
    "client/state_assigns",
    "client/state_assigns.in_place",
    "client/prop_assign",
    "client/prop_assign.in_place",
    "client/scope_analysis",
    "client/ast_state_transform",
    "client/prop_source_reads",
];

pub const SEM_SERVER_RUNE_CALL: usize = 0;
pub const SEM_SERVER_DERIVED_READS: usize = 1;
pub const SEM_STATE_PIPELINE: usize = 2;
pub const SEM_STATE_PIPELINE_IN_PLACE: usize = 3;
pub const SEM_STATE_CALL: usize = 4;
pub const SEM_STATE_READS: usize = 5;
pub const SEM_READ_ONLY_PROPS: usize = 6;
pub const SEM_STATE_ASSIGNS: usize = 7;
pub const SEM_STATE_ASSIGNS_IN_PLACE: usize = 8;
pub const SEM_PROP_ASSIGN: usize = 9;
pub const SEM_PROP_ASSIGN_IN_PLACE: usize = 10;
pub const SEM_SCOPE_ANALYSIS: usize = 11;
pub const SEM_AST_STATE_TRANSFORM: usize = 12;
pub const SEM_PROP_SOURCE_READS: usize = 13;

thread_local! {
    static SEMANTIC_BUILDS: Cell<[(u64, u64); SEMANTIC_SITES.len()]> =
        const { Cell::new([(0, 0); SEMANTIC_SITES.len()]) };
}

#[inline]
pub fn record_semantic_build(site: usize, bytes: usize) {
    SEMANTIC_BUILDS.with(|c| {
        let mut counts = c.get();
        counts[site].0 += 1;
        counts[site].1 += bytes as u64;
        c.set(counts);
    });
}

pub fn take_semantic_builds() -> [(u64, u64); SEMANTIC_SITES.len()] {
    SEMANTIC_BUILDS.replace([(0, 0); SEMANTIC_SITES.len()])
}

#[cfg(feature = "measure-semantic-build")]
thread_local! {
    static SEMANTIC_TIME: Cell<[Duration; SEMANTIC_SITES.len()]> =
        const { Cell::new([Duration::ZERO; SEMANTIC_SITES.len()]) };
}

/// Run `build` — a `SemanticBuilder::build` call — recording it against `site`.
///
/// The timer only exists under `measure-semantic-build`, because the question it
/// answers (what share of `compile()` these builds are) is asked once, while the
/// `Instant` pair around every build would be paid on every compile forever.
#[inline]
pub fn semantic_build<T>(site: usize, bytes: usize, build: impl FnOnce() -> T) -> T {
    record_semantic_build(site, bytes);
    #[cfg(not(feature = "measure-semantic-build"))]
    {
        build()
    }
    #[cfg(feature = "measure-semantic-build")]
    {
        let start = timer_start();
        let out = build();
        let elapsed = timer_elapsed(start);
        SEMANTIC_TIME.with(|c| {
            let mut totals = c.get();
            totals[site] += elapsed;
            c.set(totals);
        });
        out
    }
}

#[cfg(feature = "measure-semantic-build")]
pub fn take_semantic_time() -> [Duration; SEMANTIC_SITES.len()] {
    SEMANTIC_TIME.replace([Duration::ZERO; SEMANTIC_SITES.len()])
}

/// Agreement between the one-pass indices and the per-variable scans they
/// replace.
///
/// The indices answer the same questions a different way, so "tests pass" is
/// not evidence they agree -- a no-op would pass too. Under
/// `RSVELTE_INDEX_ORACLE` both routes run and every answer is compared, which
/// gives the comparison a denominator instead of only a failure count.
#[derive(Default, Debug, Clone, Copy)]
pub struct IndexOracle {
    pub checks: u64,
    pub mismatches: u64,
}

thread_local! {
    static INDEX_ORACLE: Cell<(u64, u64)> = const { Cell::new((0, 0)) };
}

pub fn index_oracle_enabled() -> bool {
    static ON: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *ON.get_or_init(|| std::env::var_os("RSVELTE_INDEX_ORACLE").is_some())
}

#[inline]
pub fn record_index_oracle(agrees: bool) {
    INDEX_ORACLE.with(|c| {
        let (checks, mismatches) = c.get();
        c.set((checks + 1, mismatches + u64::from(!agrees)));
    });
}

pub fn take_index_oracle() -> IndexOracle {
    let (checks, mismatches) = INDEX_ORACLE.replace((0, 0));
    IndexOracle { checks, mismatches }
}

thread_local! {
    static BOUNDARY_ORACLE: Cell<(u64, u64)> = const { Cell::new((0, 0)) };
}

/// Whether reusing Phase 1's program answers the boundary question the same way
/// a fresh parse of the pipeline's own text does. A byte-identical corpus is
/// not evidence: the reuse could be bailing on every file.
pub fn boundary_oracle_enabled() -> bool {
    static ON: std::sync::OnceLock<bool> = std::sync::OnceLock::new();
    *ON.get_or_init(|| std::env::var_os("RSVELTE_BOUNDARY_ORACLE").is_some())
}

#[inline]
pub fn record_boundary_oracle(agrees: bool) {
    BOUNDARY_ORACLE.with(|c| {
        let (checks, mismatches) = c.get();
        c.set((checks + 1, mismatches + u64::from(!agrees)));
    });
}

pub fn take_boundary_oracle() -> IndexOracle {
    let (checks, mismatches) = BOUNDARY_ORACLE.replace((0, 0));
    IndexOracle { checks, mismatches }
}
