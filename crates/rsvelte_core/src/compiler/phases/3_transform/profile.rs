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
//! Only `rsvelte_devtools/bin/compile_profile.rs` consumes these timers today.

use std::cell::Cell;
use std::time::Duration;

// `std::time::Instant::now()` traps on `wasm32-unknown-unknown` (no system
// clock — see std::sys::time::unsupported). The profile instrumentation
// below is consumed only by native devtools (`rsvelte_devtools/bin/compile_profile.rs`), but
// the call sites live in shared compile paths, so the Instant calls would
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

thread_local! {
    static VISIT_PROGRAM: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static SCRIPT_TEXT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static TEMPLATE_FRAGMENT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static ASSEMBLY_AFTER_FRAGMENT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static CSS_RENDER: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static CODEGEN: Cell<Duration> = const { Cell::new(Duration::ZERO) };

    static ESRAP_CLIENT_SPLIT: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_CLIENT_MAP: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_CLIENT_PLAIN: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_SERVER: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
    static ESRAP_PIPE: Cell<(Duration, Duration, u64)> =
        const { Cell::new((Duration::ZERO, Duration::ZERO, 0)) };
    static ESRAP_NORMALIZE: Cell<(Duration, u64)> = const { Cell::new((Duration::ZERO, 0)) };
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
