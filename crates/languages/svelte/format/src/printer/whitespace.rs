//! prettier-plugin-svelte's whitespace tests on template text.

/// HTML's ASCII whitespace, which is Rust's.
pub(super) const fn is_collapse_ws(c: char) -> bool {
    c.is_ascii_whitespace()
}

pub(super) const fn only_ws(s: &str) -> bool {
    s.trim_ascii().is_empty()
}

/// `^([\t\f\r ]*\n){n}`.
pub(super) fn starts_with_linebreak(s: &str, n: usize) -> bool {
    let mut rest = s;
    for _ in 0..n {
        let t = rest.trim_start_matches(['\t', '\x0C', '\r', ' ']);
        let Some(after) = t.strip_prefix('\n') else {
            return false;
        };
        rest = after;
    }
    true
}

/// `(\n[\t\f\r ]*){n}$`.
pub(super) fn ends_with_linebreak(s: &str, n: usize) -> bool {
    let mut rest = s;
    for _ in 0..n {
        let t = rest.trim_end_matches(['\t', '\x0C', '\r', ' ']);
        let Some(before) = t.strip_suffix('\n') else {
            return false;
        };
        rest = before;
    }
    true
}
