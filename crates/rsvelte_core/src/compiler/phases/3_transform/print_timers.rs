//! Explicit timers around every `rsvelte_esrap` print call on the compile
//! path, gated by `RSVELTE_PRINT_TIMERS`.
//!
//! These exist to answer whether sampling attribution to the `rsvelte_esrap::`
//! symbol prefix agrees with wrapping the call sites: the two disagree if the
//! printer is inlined into its callers, or if a site spends time outside the
//! crate (sourcemap assembly). Both numbers must come from the same run to be
//! comparable, so this stays off unless the env var is set.

use std::cell::Cell;
use std::time::Duration;

macro_rules! sites {
    ($($name:ident),* $(,)?) => {
        thread_local! {
            $(static $name: Cell<Duration> = const { Cell::new(Duration::ZERO) };)*
        }

        #[allow(non_snake_case)]
        pub mod add {
            use std::time::Duration;
            $(pub fn $name(d: Duration) {
                if !super::enabled() { return; }
                super::$name.with(|c| c.set(c.get() + d));
            })*
        }

        fn read_all() -> Vec<(&'static str, Duration)> {
            vec![$((stringify!($name), $name.with(|c| c.get()))),*]
        }
    };
}

sites! {
    CLIENT_PRINT_SPLIT,
    CLIENT_PRINT_WITH_MAP,
    CLIENT_PRINT_WITH,
    SERVER_PRINT,
    SERVER_PRINT_SPLIT,
    NORMALIZE_PRINT,
}

pub fn enabled() -> bool {
    thread_local! {
        static ON: Cell<Option<bool>> = const { Cell::new(None) };
    }
    ON.with(|c| match c.get() {
        Some(v) => v,
        None => {
            let v = std::env::var_os("RSVELTE_PRINT_TIMERS").is_some();
            c.set(Some(v));
            v
        }
    })
}

/// Start a timer, or `None` when the instrumentation is off so a disabled build
/// pays no `Instant::now()`.
#[inline]
pub fn start() -> Option<std::time::Instant> {
    enabled().then(std::time::Instant::now)
}

#[inline]
pub fn elapsed(start: Option<std::time::Instant>) -> Duration {
    start.map_or(Duration::ZERO, |s| s.elapsed())
}

/// One write per `BATCH` compiles instead of one per compile: the emit sits
/// inside the compile the caller is timing, so a per-compile write would land
/// in the denominator it is meant to measure against. Totals are cumulative and
/// carry their own compile count, so a reader takes the LAST record rather than
/// summing, and the uncovered tail is at most `BATCH` compiles.
const BATCH: u64 = 4096;

thread_local! {
    static COMPILES: Cell<u64> = const { Cell::new(0) };
}

pub fn note_compile() {
    if !enabled() {
        return;
    }
    let n = COMPILES.with(|c| {
        let n = c.get() + 1;
        c.set(n);
        n
    });
    if n % BATCH == 0 {
        emit(n);
    }
}

fn emit(compiles: u64) {
    let mut line = format!("PRINT_TIMERS COMPILES={compiles}");
    for (k, v) in read_all() {
        line.push_str(&format!(" {k}={}", v.as_nanos()));
    }
    line.push('\n');
    // Corpus workers share one stderr, and `eprintln!` writes each piece
    // separately, so records glue together unless emitted in a single write.
    let _ = std::io::Write::write_all(&mut std::io::stderr().lock(), line.as_bytes());
}
