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
//! Only `bin/compile_profile.rs` consumes these timers today.

use std::cell::Cell;
use std::time::Duration;

// `std::time::Instant::now()` traps on `wasm32-unknown-unknown` (no system
// clock — see std::sys::time::unsupported). The profile instrumentation
// below is consumed only by native bins (`bin/compile_profile.rs`), but
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
