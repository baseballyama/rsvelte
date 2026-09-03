//! Substring search that does not rebuild a searcher per call.
//!
//! `str::find`/`str::contains` with a `&str` needle construct a `StrSearcher` —
//! a two-way searcher with its own critical-factorization precompute — on every
//! call, which a profile of the instance-script pipeline puts at 1.33% of a
//! client compile in `StrSearcher::new` alone. The pipeline's passes are mostly
//! early-out probes over the same script text, so the setup dominates the
//! search. `memmem` prefilters on a rare byte pair instead.

/// Byte-oriented substring search. Offsets are identical to `str`'s, because a
/// byte-level match of valid UTF-8 cannot land inside a multi-byte sequence.
pub trait Substring {
    fn find_sub(&self, needle: &str) -> Option<usize>;
    fn rfind_sub(&self, needle: &str) -> Option<usize>;
    fn has_sub(&self, needle: &str) -> bool;
}

impl Substring for str {
    #[inline]
    fn find_sub(&self, needle: &str) -> Option<usize> {
        memchr::memmem::find(self.as_bytes(), needle.as_bytes())
    }

    #[inline]
    fn rfind_sub(&self, needle: &str) -> Option<usize> {
        memchr::memmem::rfind(self.as_bytes(), needle.as_bytes())
    }

    #[inline]
    fn has_sub(&self, needle: &str) -> bool {
        self.find_sub(needle).is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::Substring;

    #[test]
    fn agrees_with_str_on_ascii_and_multibyte() {
        for (haystack, needle) in [
            ("abcdef", "cd"),
            ("abcdef", "zz"),
            ("", "a"),
            ("a", ""),
            ("日本語のテキスト", "語の"),
            ("日本語のテキスト", "本語"),
            ("ααβγ", "βγ"),
            ("aXbXc", "X"),
        ] {
            assert_eq!(
                haystack.find_sub(needle),
                haystack.find(needle),
                "{haystack:?} {needle:?}"
            );
            assert_eq!(
                haystack.rfind_sub(needle),
                haystack.rfind(needle),
                "{haystack:?} {needle:?}"
            );
            assert_eq!(
                haystack.has_sub(needle),
                haystack.contains(needle),
                "{haystack:?} {needle:?}"
            );
        }
    }
}
