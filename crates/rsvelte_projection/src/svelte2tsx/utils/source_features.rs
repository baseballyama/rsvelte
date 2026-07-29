use super::lexical::is_ident_char;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub(crate) struct SourceFeatures {
    pub uses_dollar_props: bool,
    pub uses_dollar_rest_props: bool,
    pub uses_dollar_slots: bool,
    pub may_have_template_rune_global: bool,
    pub has_await_word: bool,
}

impl SourceFeatures {
    #[inline]
    fn dollar_scan_is_complete(self) -> bool {
        self.uses_dollar_props
            && self.uses_dollar_rest_props
            && self.uses_dollar_slots
            && self.may_have_template_rune_global
    }
}

#[inline]
pub(crate) fn scan_source_features(source: &str) -> SourceFeatures {
    scan_source_features_with(source, |_| {})
}

#[inline]
fn scan_source_features_with(
    source: &str,
    mut visit_candidate: impl FnMut(usize),
) -> SourceFeatures {
    let bytes = source.as_bytes();
    let mut features = SourceFeatures::default();
    let mut cursor = 0;

    loop {
        let needs_dollar = !features.dollar_scan_is_complete();
        let needs_await = !features.has_await_word;
        let offset = match (needs_dollar, needs_await) {
            (true, true) => memchr::memchr2(b'$', b'a', &bytes[cursor..]),
            (true, false) => memchr::memchr(b'$', &bytes[cursor..]),
            (false, true) => memchr::memchr(b'a', &bytes[cursor..]),
            (false, false) => break,
        };
        let Some(offset) = offset else {
            break;
        };
        let position = cursor + offset;
        visit_candidate(position);

        match bytes[position] {
            b'$' => {
                let suffix = &bytes[position + 1..];
                match suffix.first() {
                    Some(b'$') => match suffix.get(1) {
                        Some(b'p') if suffix[1..].starts_with(b"props") => {
                            features.uses_dollar_props = true;
                        }
                        Some(b'r') if suffix[1..].starts_with(b"restProps") => {
                            features.uses_dollar_rest_props = true;
                        }
                        Some(b's') if suffix[1..].starts_with(b"slots") => {
                            features.uses_dollar_slots = true;
                        }
                        _ => {}
                    },
                    Some(b's') if suffix.starts_with(b"state") => {
                        features.may_have_template_rune_global = true;
                    }
                    Some(b'd') if suffix.starts_with(b"derived") => {
                        features.may_have_template_rune_global = true;
                    }
                    Some(b'e') if suffix.starts_with(b"effect") => {
                        features.may_have_template_rune_global = true;
                    }
                    _ => {}
                }
            }
            b'a' if bytes[position..].starts_with(b"await") => {
                let before_ok = position == 0 || !is_ident_char(bytes[position - 1]);
                let after = position + b"await".len();
                let after_ok = after == bytes.len() || !is_ident_char(bytes[after]);
                features.has_await_word |= before_ok && after_ok;
            }
            _ => {}
        }

        cursor = position + 1;
    }

    features
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::utils::lexical::contains_word;

    fn assert_matches_previous_scans(source: &str) {
        let features = scan_source_features(source);
        assert_eq!(features.uses_dollar_props, source.contains("$$props"));
        assert_eq!(
            features.uses_dollar_rest_props,
            source.contains("$$restProps")
        );
        assert_eq!(features.uses_dollar_slots, source.contains("$$slots"));
        assert_eq!(
            features.may_have_template_rune_global,
            source.contains("$state") || source.contains("$derived") || source.contains("$effect")
        );
        assert_eq!(
            features.has_await_word,
            contains_word(source.as_bytes(), b"await")
        );
    }

    #[test]
    fn matches_substring_and_word_boundary_semantics() {
        for source in [
            "",
            "$",
            "$$",
            "$$prop",
            "$props",
            "$$props",
            "$$restProps",
            "$$slots",
            "$state",
            "$derived",
            "$effect",
            "$$$props",
            "$$$restProps",
            "$$$slots",
            "$$state",
            "$$derived",
            "$$effect",
            "$$props$$restProps$$slots$state$derived$effect",
            "await",
            "before await after",
            "awaited",
            "xawait",
            "$await",
            "éawait文",
            "<!-- $$props $state await -->",
            r#"<script>const text = "$$restProps $$slots $effect await";</script>"#,
        ] {
            assert_matches_previous_scans(source);
        }
    }

    #[test]
    fn scans_each_candidate_once_on_large_input() {
        let source = "x$yaz".repeat(1 << 16);
        let expected_candidates = source
            .bytes()
            .filter(|byte| matches!(byte, b'$' | b'a'))
            .count();
        let mut visits = 0;
        let mut previous = None;

        let features = scan_source_features_with(&source, |position| {
            if let Some(previous) = previous {
                assert!(previous < position);
            }
            previous = Some(position);
            visits += 1;
        });

        assert_eq!(features, SourceFeatures::default());
        assert_eq!(visits, expected_candidates);
    }
}
