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
