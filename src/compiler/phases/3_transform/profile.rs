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

#[derive(Default, Debug, Clone, Copy)]
pub struct Phase3Breakdown {
    pub script_text_transform: Duration,
    pub template_fragment: Duration,
    pub css_render: Duration,
    pub codegen: Duration,
}

thread_local! {
    static SCRIPT_TEXT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static TEMPLATE_FRAGMENT: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static CSS_RENDER: Cell<Duration> = const { Cell::new(Duration::ZERO) };
    static CODEGEN: Cell<Duration> = const { Cell::new(Duration::ZERO) };
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
pub fn record_css_render(d: Duration) {
    CSS_RENDER.with(|c| c.set(c.get() + d));
}

#[inline]
pub fn record_codegen(d: Duration) {
    CODEGEN.with(|c| c.set(c.get() + d));
}

pub fn take_breakdown() -> Phase3Breakdown {
    Phase3Breakdown {
        script_text_transform: SCRIPT_TEXT.with(|c| c.replace(Duration::ZERO)),
        template_fragment: TEMPLATE_FRAGMENT.with(|c| c.replace(Duration::ZERO)),
        css_render: CSS_RENDER.with(|c| c.replace(Duration::ZERO)),
        codegen: CODEGEN.with(|c| c.replace(Duration::ZERO)),
    }
}
