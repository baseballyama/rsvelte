//! Deterministic counters for the store-subscription scan, gated by
//! `RSVELTE_STORE_SUB_DEBUG`. Counting work items is load-independent, so the
//! per-compile cost it produces is comparable across runs and machines.

use std::cell::Cell;

macro_rules! counters {
    ($($name:ident),* $(,)?) => {
        thread_local! {
            $(static $name: Cell<u64> = const { Cell::new(0) };)*
        }

        #[allow(non_snake_case)]
        pub mod bump {
            $(pub fn $name(n: u64) {
                if !super::enabled() { return; }
                super::$name.with(|c| c.set(c.get() + n));
            })*
        }

        fn take_all() -> Vec<(&'static str, u64)> {
            vec![$((stringify!($name), $name.with(|c| c.replace(0)))),*]
        }
    };
}

counters! {
    DETECT_CALLS,
    DETECT_EARLY_OUT,
    SCRIPT_SCANS,
    EXPR_SCANS,
    CHARS_DECODED,
    OFFSET_TABLE_CHARS,
    BLANK_TS_BYTES,
    KEYWORD_STRINGS,
    KEYWORD_STRING_BYTES,
    IDENT_STRINGS,
    IDENT_STRING_BYTES,
    SHADOW_CHECKS,
    TEMPLATE_DEDUP_CHECKS,
}

pub fn enabled() -> bool {
    thread_local! {
        static ON: Cell<Option<bool>> = const { Cell::new(None) };
    }
    ON.with(|c| match c.get() {
        Some(v) => v,
        None => {
            let v = std::env::var_os("RSVELTE_STORE_SUB_DEBUG").is_some();
            c.set(Some(v));
            v
        }
    })
}

/// Emit and reset the per-compile counters.
pub fn dump() {
    if !enabled() {
        return;
    }
    let mut line = String::from("STORE_SUB_STATS");
    for (k, v) in take_all() {
        line.push_str(&format!(" {k}={v}"));
    }
    line.push('\n');
    // Corpus workers share one stderr, and `eprintln!` writes each piece
    // separately, so records glue together unless emitted in a single write.
    let _ = std::io::Write::write_all(&mut std::io::stderr().lock(), line.as_bytes());
}
