//! Deterministic counters for the SSR comment carry-over, gated by
//! `RSVELTE_SERVER_COMMENT_DEBUG`. Counting work items is load-independent, so
//! the reach rate it produces is comparable across runs and machines.

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
    REPARSE_STMT_CALLS,
    REPARSE_STMT_DROPPED_COMMENTS,
    REPARSE_PROGRAM_CALLS,
    REPARSE_PROGRAM_DIAG_DROPS,
    REGISTERED_CHUNKS,
    REGISTERED_COMMENTS,
    REACHED_VIA_STMT,
    REACHED_NOT_STMT,
    NEVER_REACHED,
    EMITTED_COMMENTS,
    SCRIPT_COMMENTS_TOTAL,
    SCRIPT_COMMENTS_LEADING,
    SCRIPT_COMMENTS_INTERIOR,
    SCRIPT_COMMENTS_TRAILING,
    INTERIOR_EXPORT_KEYWORD,
    INTERIOR_NON_REPARSE,
    EXPORT_KEYWORD_SITES,
    NON_REPARSE_SITES,
}

pub fn enabled() -> bool {
    thread_local! {
        static ON: Cell<Option<bool>> = const { Cell::new(None) };
    }
    ON.with(|c| match c.get() {
        Some(v) => v,
        None => {
            let v = std::env::var_os("RSVELTE_SERVER_COMMENT_DEBUG").is_some();
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
    use std::fmt::Write as _;
    let mut line = String::from("SERVER_COMMENT_STATS");
    for (k, v) in take_all() {
        let _ = write!(line, " {k}={v}");
    }
    line.push('\n');
    // Corpus workers share one stderr, and `eprintln!` writes each piece
    // separately, so records glue together unless emitted in a single write.
    let _ = std::io::Write::write_all(&mut std::io::stderr().lock(), line.as_bytes());
}
