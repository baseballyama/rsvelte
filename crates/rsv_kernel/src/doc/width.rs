//! Prettier's `getStringWidth`, the column measure line fitting uses.
//!
//! Prettier first removes every match of its emoji regex, counting one column for a lone narrow
//! emoji and two for any other match, then counts the rest one code point at a time. The per-code
//! point widths and the regex's single-code-point matches are tables generated from Prettier
//! itself (`width_tables.rs`, `tools/fixtures/bin/string-width.ts`), and so is the regex's whole
//! language, which is finite: a match here is a lookup, not a pattern.

use super::width_tables::{EMOJI, NARROW, SEQUENCES, WIDTHS};

/// Columns `s` takes, as Prettier counts them.
///
/// Called for every text a layout measures, most of them short: the fast path is inlined and the
/// rest is out of line, so a call that takes the fast path does not pay the slow path's frame.
#[inline]
#[must_use]
pub fn string_width(s: &str) -> usize {
    // Prettier's fast path: printable ASCII and DEL count one column each.
    if all_printable_or_del(s.as_bytes()) {
        s.len()
    } else {
        slow_width(s)
    }
}

#[inline(never)]
fn slow_width(s: &str) -> usize {
    let mut w = 0;
    let mut rest = s;
    loop {
        // An ASCII run: no emoji match is all ASCII, and on this path control characters and DEL
        // count none.
        let run = rest.bytes().position(|b| b >= 0x80).unwrap_or(rest.len());
        w += rest.as_bytes()[..run]
            .iter()
            .filter(|&&b| (0x20..0x7F).contains(&b))
            .count();
        if run == rest.len() {
            return w;
        }
        // A keycap starts with its ASCII base; the rest of it is not ASCII.
        let mut at = run;
        if run > 0
            && is_keycap_base(rest.as_bytes()[run - 1])
            && let Some((len, cols)) = emoji(&rest[run - 1..])
        {
            w = w - 1 + cols;
            rest = &rest[run - 1 + len..];
            continue;
        }
        let tail = &rest[at..];
        let c = tail
            .chars()
            .next()
            .expect("a non-ASCII byte starts a character");
        let (len, cols) = match c {
            '\u{80}'..='\u{10FF}' if !matches!(c, '\u{A9}' | '\u{AE}') => (
                c.len_utf8(),
                usize::from(!matches!(c, '\u{80}'..='\u{9F}' | '\u{300}'..='\u{36F}')),
            ),
            _ => emoji(tail).unwrap_or_else(|| (c.len_utf8(), of(c))),
        };
        w += cols;
        at += len;
        rest = &rest[at..];
    }
}

/// Whether every byte is in `0x20..=0x7F`, eight at a time: a byte fails when its high bit is set
/// or when subtracting `0x20` borrows (the classic "has a byte less than n" test, exact for
/// whether any byte fails when n <= 128).
#[inline]
fn all_printable_or_del(bytes: &[u8]) -> bool {
    const LOW: u64 = 0x2020_2020_2020_2020;
    const HIGH: u64 = 0x8080_8080_8080_8080;
    let (chunks, rest) = bytes.as_chunks::<8>();
    chunks.iter().all(|&chunk| {
        let x = u64::from_le_bytes(chunk);
        (x | (x.wrapping_sub(LOW) & !x)) & HIGH == 0
    }) && rest.iter().all(|b| (0x20..=0x7F).contains(b))
}

const fn is_regional(c: u32) -> bool {
    matches!(c, 0x1F1E6..=0x1F1FF)
}

const fn is_keycap_base(b: u8) -> bool {
    matches!(b, b'#' | b'*' | b'0'..=b'9')
}

fn in_runs(runs: &[(u32, u32)], c: u32) -> bool {
    runs.binary_search_by(|&(lo, hi)| {
        if hi < c {
            std::cmp::Ordering::Less
        } else if lo > c {
            std::cmp::Ordering::Greater
        } else {
            std::cmp::Ordering::Equal
        }
    })
    .is_ok()
}

fn of(c: char) -> usize {
    let c = c as u32;
    WIDTHS
        .binary_search_by(|&(lo, hi, _)| {
            if hi < c {
                std::cmp::Ordering::Less
            } else if lo > c {
                std::cmp::Ordering::Greater
            } else {
                std::cmp::Ordering::Equal
            }
        })
        .map_or(1, |i| usize::from(WIDTHS[i].2))
}

/// The emoji match at the start of `s`, as `(bytes, columns)`: the longest of the regex's
/// sequences `s` starts with, else a code point the regex matches alone. The regex's language is
/// finite and no string of it matches a shorter alternative first (the generator checks), so for a
/// backtracking regex without lookahead the longest match is the match.
fn emoji(s: &str) -> Option<(usize, usize)> {
    let first = s.chars().next()?;
    let c = first as u32;
    let alone = in_runs(&EMOJI, c);
    // Every sequence starts with a code point matched alone, a keycap base or a regional
    // indicator (a flag's first half, which the regex does not match alone); tested.
    if !alone && !u8::try_from(c).is_ok_and(is_keycap_base) && !is_regional(c) {
        return None;
    }
    let from = SEQUENCES.partition_point(|q| q[0] < c);
    let longest = SEQUENCES[from..]
        .iter()
        .take_while(|q| q[0] == c)
        .filter_map(|q| prefix_bytes(s, q))
        .max();
    if let Some(len) = longest {
        return Some((len, 2));
    }
    alone.then(|| (first.len_utf8(), if in_runs(&NARROW, c) { 1 } else { 2 }))
}

/// The length in bytes of `seq` at the start of `s`, if `s` starts with it.
fn prefix_bytes(s: &str, seq: &[u32]) -> Option<usize> {
    let mut len = 0;
    let mut chars = s.chars();
    for &want in seq {
        let c = chars.next()?;
        if c as u32 != want {
            return None;
        }
        len += c.len_utf8();
    }
    Some(len)
}

#[cfg(test)]
mod tests {
    use super::string_width;

    fn check(path: &std::path::Path) {
        let text = std::fs::read_to_string(path).expect("vectors");
        let mut wrong = Vec::new();
        let mut n = 0;
        for line in text.lines() {
            let mut fields: Vec<&str> = line.split(' ').collect();
            let want: usize = fields.pop().expect("a width").parse().expect("a number");
            let s: String = fields
                .iter()
                .map(|h| char::from_u32(u32::from_str_radix(h, 16).expect("hex")).expect("scalar"))
                .collect();
            n += 1;
            let got = string_width(&s);
            if got != want {
                wrong.push(format!("{line} (got {got})"));
            }
        }
        assert!(n > 0, "no vectors in {}", path.display());
        assert!(
            wrong.is_empty(),
            "{} of {n} vectors differ from Prettier:\n{}",
            wrong.len(),
            wrong[..wrong.len().min(40)].join("\n")
        );
    }

    /// The shortcuts `string_width` and `emoji` take, checked against the generated tables.
    #[test]
    fn the_shortcuts_agree_with_the_tables() {
        use super::super::width_tables::{EMOJI, SEQUENCES, WIDTHS};
        use super::in_runs;
        let keycap = |c: u32| u8::try_from(c).is_ok_and(super::is_keycap_base);
        assert!(
            SEQUENCES
                .iter()
                .all(|q| in_runs(&EMOJI, q[0]) || keycap(q[0]) || super::is_regional(q[0]))
        );
        let low: Vec<(u32, u32)> = EMOJI
            .iter()
            .copied()
            .filter(|&(lo, _)| lo < 0x1100)
            .collect();
        assert_eq!(low, [(0xA9, 0xA9), (0xAE, 0xAE)]);
        let low: Vec<(u32, u32, u8)> = WIDTHS
            .iter()
            .copied()
            .filter(|&(lo, ..)| lo < 0x1100)
            .collect();
        assert_eq!(low, [(0, 0x1F, 0), (0x7F, 0x9F, 0), (0x300, 0x36F, 0)]);
    }

    /// Every byte value at every position of strings up to three chunks long, against the
    /// byte-at-a-time definition; and a long ASCII string with one control character or emoji.
    #[test]
    fn the_chunked_fast_path_agrees_with_the_definition() {
        for len in 1..=24 {
            for at in 0..len {
                for b in 0..=255u8 {
                    let mut v = vec![b'a'; len];
                    v[at] = b;
                    let want = v.iter().all(|b| (0x20..=0x7F).contains(b));
                    assert_eq!(
                        super::all_printable_or_del(&v),
                        want,
                        "{b:#x} at {at} of {len}"
                    );
                }
            }
        }
        let long = "x".repeat(100);
        assert_eq!(string_width(&format!("{long}\t{long}")), 200);
        assert_eq!(string_width(&format!("{long}\u{7F}{long}")), 201);
        assert_eq!(string_width(&format!("{long}\u{7F}\t{long}")), 200);
        assert_eq!(
            string_width(&format!("{long}🚀{long}é1\u{FE0F}\u{20E3}")),
            205
        );
    }

    #[test]
    fn widths_match_prettier() {
        check(&std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("src/doc/width_vectors.txt"));
        // The generator's full set (tools/fixtures/bin/string-width.ts --vectors <file>).
        if let Some(p) = std::env::var_os("RSV_WIDTH_VECTORS") {
            check(std::path::Path::new(&p));
        }
    }
}
