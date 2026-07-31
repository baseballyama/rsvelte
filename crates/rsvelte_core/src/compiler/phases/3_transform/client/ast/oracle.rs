//! Oracle harness for the client AST port.
//!
//! The existing text pipeline is the oracle: it passes every fixture, so its
//! output *is* the specification. With `RSVELTE_CLIENT_AST_ORACLE` set, every
//! component is compiled down both paths and the results compared, which turns
//! "how much of the client is ported" into a number the corpus can report.
//!
//! This exists because the port cannot be routed incrementally — read-wrapping
//! has to be a single pass, and staged routing regressed ~220 corpus entries
//! twice (`docs/ast-refactor-handoff.md` §5). A diff count per corpus file is
//! the substitute for the usual per-commit measurement.

use std::cell::Cell;
use std::sync::LazyLock;

static ENV_ENABLED: LazyLock<bool> =
    LazyLock::new(|| std::env::var_os("RSVELTE_CLIENT_AST_ORACLE").is_some());

thread_local! {
    static FORCED: Cell<bool> = const { Cell::new(false) };
    static MATCHED: Cell<u32> = const { Cell::new(0) };
    static MISMATCHED: Cell<u32> = const { Cell::new(0) };
    static FELL_BACK: Cell<u32> = const { Cell::new(0) };
}

/// Whether to compile every component down both pipelines and score them.
///
/// The env var is read once per process; the thread-local override exists so a
/// test can enable the harness without racing other tests through the process
/// environment.
pub(crate) fn enabled() -> bool {
    *ENV_ENABLED || FORCED.with(Cell::get)
}

/// Enable the harness for the current thread only. Returns the previous value.
///
/// Test-only until M1 adds the corpus runner; production drives the harness
/// through `RSVELTE_CLIENT_AST_ORACLE`.
#[cfg(test)]
pub(crate) fn force(on: bool) -> bool {
    FORCED.with(|c| c.replace(on))
}

/// Outcome of one component compiled down both pipelines.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum Verdict {
    /// The AST pipeline produced the oracle's bytes.
    Matched,
    /// The AST pipeline produced different bytes — a port bug.
    Mismatched,
    /// The AST pipeline declined (unported construct).
    FellBack,
}

pub(crate) fn record(verdict: Verdict) {
    match verdict {
        Verdict::Matched => MATCHED.with(|c| c.set(c.get() + 1)),
        Verdict::Mismatched => MISMATCHED.with(|c| c.set(c.get() + 1)),
        Verdict::FellBack => FELL_BACK.with(|c| c.set(c.get() + 1)),
    }
}

/// `(matched, mismatched, fell_back)` since the last [`reset`], for this thread.
#[cfg(test)]
pub(crate) fn counts() -> (u32, u32, u32) {
    (
        MATCHED.with(Cell::get),
        MISMATCHED.with(Cell::get),
        FELL_BACK.with(Cell::get),
    )
}

#[cfg(test)]
pub(crate) fn reset() {
    MATCHED.with(|c| c.set(0));
    MISMATCHED.with(|c| c.set(0));
    FELL_BACK.with(|c| c.set(0));
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::{CompileOptions, GenerateMode};

    /// The harness must not change what `compile` emits — it only scores a second
    /// pipeline against the first.
    #[test]
    fn oracle_is_observationally_neutral() {
        let source = "<script>let n = $state(0);</script><button onclick={() => n++}>{n}</button>";
        let opts = || CompileOptions {
            generate: GenerateMode::Client,
            filename: Some("Probe.svelte".into()),
            ..Default::default()
        };

        let plain = crate::compile(source, opts()).expect("compiles");

        let previous = force(true);
        reset();
        let scored = crate::compile(source, opts()).expect("compiles");
        let (matched, mismatched, fell_back) = counts();
        force(previous);

        assert_eq!(plain.js.code, scored.js.code, "oracle changed the output");
        // M0 ports no visitor, so every component declines into the text path.
        assert_eq!(
            (matched, mismatched, fell_back),
            (0, 0, 1),
            "expected one fallback, got matched={matched} mismatched={mismatched} fell_back={fell_back}"
        );
    }

    #[test]
    fn counters_are_per_thread_and_resettable() {
        reset();
        record(Verdict::Matched);
        record(Verdict::Mismatched);
        record(Verdict::FellBack);
        record(Verdict::FellBack);
        assert_eq!(counts(), (1, 1, 2));
        reset();
        assert_eq!(counts(), (0, 0, 0));
    }
}
