//! Deterministic counter for the `String` allocations that the pre-refactor
//! `contains_direct_await_in_expression` performed per scanned character.
//!
//! The scanner below is allocation-faithful and verdict-equivalent to the
//! pre-refactor body rather than a verbatim copy of it. The deviations are:
//!
//! - A: in the `"async"` arm the old `||` chain is rewritten as an explicit
//!   negation, so the third collect happens on exactly the inputs where the
//!   first two `starts_with` tests failed, as short-circuiting gave before.
//!   The consequent block it guarded held two comment lines and zero
//!   statements, so it and its final `starts_with("=>")` test are dropped:
//!   statically return-neutral, and all three allocations are still made.
//! - B: `} else { if let Some(..) = .. }` is folded into
//!   `} else if let Some(..) = ..`, a purely syntactic change.
//! - C: `is_identifier_char` is copied in below rather than imported, because
//!   the production helper is `pub(super)` and because the oracle must stay
//!   pinned to the old definition even if the production one later drifts.
//!
//! The numbers are therefore observed allocations rather than a model of them.
//! Running it alongside the current scanner gives "what the old code would
//! have allocated" against "what the new code allocates" (zero at these four
//! sites) without needing a quiet machine. It doubles as a differential
//! oracle: every call compares the
//! old verdict against the new one and counts disagreements. Requires the
//! instrumentation feature:
//!
//! ```text
//! cargo run --profile profiling -p rsvelte_devtools --bin await_alloc_count \
//!   --features measure-await
//! ```

use std::cell::Cell;

thread_local! {
    static CALLS: Cell<u64> = const { Cell::new(0) };
    static INPUT_BYTES: Cell<u64> = const { Cell::new(0) };
    /// Per-position 5-char `word` built before the `"async"` test.
    static WORD_ASYNC: Cell<u64> = const { Cell::new(0) };
    /// Whole-remainder `rest` built once the word was `"async"`.
    static REST: Cell<u64> = const { Cell::new(0) };
    /// Second whole-remainder collect, reached only when both `starts_with` fail.
    static REST_AGAIN: Cell<u64> = const { Cell::new(0) };
    /// Per-position 5-char `word` built before the `"await"` test.
    static WORD_AWAIT: Cell<u64> = const { Cell::new(0) };
    static ALLOC_BYTES: Cell<u64> = const { Cell::new(0) };
    /// Calls where the replayed scanner disagreed with the current one.
    static MISMATCH: Cell<u64> = const { Cell::new(0) };
}

fn bump(counter: &'static std::thread::LocalKey<Cell<u64>>, bytes: usize) {
    counter.with(|c| c.set(c.get() + 1));
    ALLOC_BYTES.with(|c| c.set(c.get() + bytes as u64));
}

// Pinned copy: the oracle must not follow later drift in the production helper.
fn is_identifier_char(c: char) -> bool {
    c.is_alphanumeric() || c == '_' || c == '$'
}

/// `(calls, input_bytes, word_async, rest, rest_again, word_await, alloc_bytes,
/// mismatch)` since the last reset.
pub fn snapshot() -> (u64, u64, u64, u64, u64, u64, u64, u64) {
    (
        CALLS.with(std::cell::Cell::get),
        INPUT_BYTES.with(std::cell::Cell::get),
        WORD_ASYNC.with(std::cell::Cell::get),
        REST.with(std::cell::Cell::get),
        REST_AGAIN.with(std::cell::Cell::get),
        WORD_AWAIT.with(std::cell::Cell::get),
        ALLOC_BYTES.with(std::cell::Cell::get),
        MISMATCH.with(std::cell::Cell::get),
    )
}

pub fn reset() {
    CALLS.with(|c| c.set(0));
    INPUT_BYTES.with(|c| c.set(0));
    WORD_ASYNC.with(|c| c.set(0));
    REST.with(|c| c.set(0));
    REST_AGAIN.with(|c| c.set(0));
    WORD_AWAIT.with(|c| c.set(0));
    ALLOC_BYTES.with(|c| c.set(0));
    MISMATCH.with(|c| c.set(0));
}

/// Replay the pre-refactor scan of `expr` and count strings at removed sites.
///
/// Compare its verdict against `new_result` so behavior drift is counted.
pub fn record(expr: &str, new_result: bool) {
    CALLS.with(|c| c.set(c.get() + 1));
    INPUT_BYTES.with(|c| c.set(c.get() + expr.len() as u64));

    if replay(expr) != new_result {
        MISMATCH.with(|c| c.set(c.get() + 1));
    }
}

fn replay(expr: &str) -> bool {
    let chars: Vec<char> = expr.chars().collect();
    let mut i = 0;
    let mut in_string = false;
    let mut string_char = ' ';
    let mut async_fn_depth = 0;

    while i < chars.len() {
        let c = chars[i];

        if !in_string && (c == '"' || c == '\'' || c == '`') {
            in_string = true;
            string_char = c;
            i += 1;
            continue;
        }
        if in_string && c == string_char && !crate::compiler::utils::is_escaped_char(&chars, i) {
            in_string = false;
            i += 1;
            continue;
        }
        if in_string {
            i += 1;
            continue;
        }

        if i + 5 <= chars.len() {
            let word: String = chars[i..i + 5].iter().collect();
            bump(&WORD_ASYNC, word.len());
            if word == "async" {
                let rest: String = chars[i + 5..].iter().collect();
                bump(&REST, rest.len());
                let rest_trimmed = rest.trim_start();
                if !(rest_trimmed.starts_with("(") || rest_trimmed.starts_with("function")) {
                    let again: String = chars[i + 5..].iter().collect();
                    bump(&REST_AGAIN, again.len());
                }
            }
        }

        if i + 5 <= chars.len() && async_fn_depth == 0 {
            let word: String = chars[i..i + 5].iter().collect();
            bump(&WORD_AWAIT, word.len());
            if word == "await" {
                let before_ok = i == 0 || !is_identifier_char(chars[i - 1]);
                let after_ok = i + 5 >= chars.len() || !is_identifier_char(chars[i + 5]);
                if before_ok && after_ok {
                    return true;
                }
            }
        }

        if c == '{' {
            let before: String = chars[..i].iter().collect();
            if before.trim_end().ends_with("=>") {
                let before_trimmed = before.trim_end();
                if let Some(paren_pos) = before_trimmed.rfind('(') {
                    let before_paren = &before_trimmed[..paren_pos];
                    if before_paren.trim_end().ends_with("async") {
                        async_fn_depth += 1;
                    }
                } else if let Some(async_pos) =
                    memchr::memmem::rfind(before_trimmed.as_bytes(), b"async")
                {
                    let between = &before_trimmed[async_pos + 5..];
                    if between
                        .trim()
                        .chars()
                        .all(|c| is_identifier_char(c) || c == ' ')
                    {
                        async_fn_depth += 1;
                    }
                }
            }
        } else if c == '}' && async_fn_depth > 0 {
            async_fn_depth -= 1;
        }

        i += 1;
    }

    false
}
