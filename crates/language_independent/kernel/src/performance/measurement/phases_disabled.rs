//! The phase probes with the `metrics` feature off: each compiles to nothing.

use std::marker::PhantomData;

use super::PhaseMeasurements;

/// Not `Send`, as with the `metrics` feature, so code that compiles without it compiles with
/// it.
#[derive(Debug)]
pub struct PhaseGuard(PhantomData<*const ()>);

#[expect(
    clippy::inline_always,
    reason = "with metrics off a probe must compile to nothing"
)]
#[inline(always)]
#[must_use]
pub const fn phase(_: &'static str) -> PhaseGuard {
    PhaseGuard(PhantomData)
}

#[must_use]
pub const fn snapshot() -> Vec<PhaseMeasurements> {
    Vec::new()
}

pub const fn reset() {}

pub const ENABLED: bool = false;
