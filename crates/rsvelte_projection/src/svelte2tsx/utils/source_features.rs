use super::lexical::is_ascii_ident_byte;

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct SourceFeatures(u8);

impl SourceFeatures {
    const DOLLAR_PROPS: u8 = 1;
    const DOLLAR_REST_PROPS: u8 = 1 << 1;
    const DOLLAR_SLOTS: u8 = 1 << 2;
    const TEMPLATE_RUNE_GLOBAL: u8 = 1 << 3;
    const AWAIT_WORD: u8 = 1 << 4;
    const TEMPLATE_INFO: u8 = 1 << 5;
    const DEBUG_MARKER: u8 = 1 << 6;
    const META_MARKER: u8 = 1 << 7;

    const fn contains(self, feature: u8) -> bool {
        self.0 & feature != 0
    }

    const fn insert(&mut self, feature: u8) {
        self.0 |= feature;
    }

    pub const fn uses_dollar_props(self) -> bool {
        self.contains(Self::DOLLAR_PROPS)
    }

    pub const fn uses_dollar_rest_props(self) -> bool {
        self.contains(Self::DOLLAR_REST_PROPS)
    }

    pub const fn uses_dollar_slots(self) -> bool {
        self.contains(Self::DOLLAR_SLOTS)
    }

    pub const fn may_have_template_rune_global(self) -> bool {
        self.contains(Self::TEMPLATE_RUNE_GLOBAL)
    }

    pub const fn has_await_word(self) -> bool {
        self.contains(Self::AWAIT_WORD)
    }

    pub const fn may_need_template_info(self) -> bool {
        self.contains(Self::TEMPLATE_INFO)
    }

    pub const fn has_debug_marker(self) -> bool {
        self.contains(Self::DEBUG_MARKER)
    }

    pub const fn has_meta_marker(self) -> bool {
        self.contains(Self::META_MARKER)
    }

    #[inline]
    const fn dollar_scan_is_complete(self) -> bool {
        self.uses_dollar_props()
            && self.uses_dollar_rest_props()
            && self.uses_dollar_slots()
            && self.may_have_template_rune_global()
    }
}

#[inline]
pub fn scan_source_features(source: &str) -> SourceFeatures {
    scan_source_features_with(source, |_| {})
}

#[inline]
fn scan_source_features_with(
    source: &str,
    mut visit_candidate: impl FnMut(usize),
) -> SourceFeatures {
    let bytes = source.as_bytes();
    let mut features = SourceFeatures::default();
    if memchr::memmem::find(bytes, b"<slot").is_some() {
        features.insert(SourceFeatures::TEMPLATE_INFO);
    }
    if memchr::memmem::find(bytes, b"{@debug").is_some() {
        features.insert(SourceFeatures::DEBUG_MARKER);
    }
    let mut cursor = 0;

    loop {
        let needs_dollar = !features.dollar_scan_is_complete();
        let needs_await = !features.has_await_word();
        let needs_colon = !features.may_need_template_info() || !features.has_meta_marker();
        let offset = match (needs_dollar, needs_await, needs_colon) {
            (true, true, true) => memchr::memchr3(b'$', b'a', b':', &bytes[cursor..]),
            (true, true, false) => memchr::memchr2(b'$', b'a', &bytes[cursor..]),
            (true, false, true) => memchr::memchr2(b'$', b':', &bytes[cursor..]),
            (true, false, false) => memchr::memchr(b'$', &bytes[cursor..]),
            (false, true, true) => memchr::memchr2(b'a', b':', &bytes[cursor..]),
            (false, true, false) => memchr::memchr(b'a', &bytes[cursor..]),
            (false, false, true) => memchr::memchr(b':', &bytes[cursor..]),
            (false, false, false) => break,
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
                            features.insert(SourceFeatures::DOLLAR_PROPS);
                        }
                        Some(b'r') if suffix[1..].starts_with(b"restProps") => {
                            features.insert(SourceFeatures::DOLLAR_REST_PROPS);
                        }
                        Some(b's') if suffix[1..].starts_with(b"slots") => {
                            features.insert(SourceFeatures::DOLLAR_SLOTS);
                        }
                        _ => {}
                    },
                    Some(b's') if suffix.starts_with(b"state") => {
                        features.insert(SourceFeatures::TEMPLATE_RUNE_GLOBAL);
                    }
                    Some(b'd') if suffix.starts_with(b"derived") => {
                        features.insert(SourceFeatures::TEMPLATE_RUNE_GLOBAL);
                    }
                    Some(b'e') if suffix.starts_with(b"effect") => {
                        features.insert(SourceFeatures::TEMPLATE_RUNE_GLOBAL);
                    }
                    _ => {}
                }
            }
            b'a' if bytes[position..].starts_with(b"await") => {
                let before_ok = position == 0 || !is_ascii_ident_byte(bytes[position - 1]);
                let after = position + b"await".len();
                let after_ok = after == bytes.len() || !is_ascii_ident_byte(bytes[after]);
                if before_ok && after_ok {
                    features.insert(SourceFeatures::AWAIT_WORD);
                }
            }
            b':' => {
                if !features.may_need_template_info()
                    && position >= 2
                    && bytes.get(position - 2..=position) == Some(b"on:")
                {
                    features.insert(SourceFeatures::TEMPLATE_INFO);
                }
                if !features.has_meta_marker()
                    && ((position >= 7 && bytes.get(position - 7..=position) == Some(b"<svelte:"))
                        || (position >= 3 && bytes.get(position - 3..=position) == Some(b"use:")))
                {
                    features.insert(SourceFeatures::META_MARKER);
                }
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
        assert_eq!(features.uses_dollar_props(), source.contains("$$props"));
        assert_eq!(
            features.uses_dollar_rest_props(),
            source.contains("$$restProps")
        );
        assert_eq!(features.uses_dollar_slots(), source.contains("$$slots"));
        assert_eq!(
            features.may_have_template_rune_global(),
            source.contains("$state") || source.contains("$derived") || source.contains("$effect")
        );
        assert_eq!(
            features.has_await_word(),
            contains_word(source.as_bytes(), b"await")
        );
        assert_eq!(
            features.may_need_template_info(),
            source.contains("<slot") || source.contains("on:")
        );
        assert_eq!(features.has_debug_marker(), source.contains("{@debug"));
        assert_eq!(
            features.has_meta_marker(),
            source.contains("<svelte:") || source.contains("use:")
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
            "{@debug user}",
            "<svelte:window />",
            "<div use:action />",
            "on:click",
        ] {
            assert_matches_previous_scans(source);
        }
    }

    #[test]
    fn scans_each_candidate_once_on_large_input() {
        let source = "x$yaz".repeat(1 << 16);
        let expected_candidates = source
            .bytes()
            .filter(|byte| matches!(byte, b'$' | b'a' | b':'))
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

    #[test]
    fn conservatively_detects_template_info_markers() {
        for source in [
            "<slot />",
            r#"<slot name="named" />"#,
            "<div on:click />",
            "<Component on:change />",
            "<slot-machine />",
            r#"<div title="on:" />"#,
            r#"<script>const text = "<slot>";</script>"#,
            "<!-- on:click -->",
        ] {
            assert!(
                scan_source_features(source).may_need_template_info(),
                "{source}"
            );
        }

        for source in [
            "",
            "<div />",
            "<Slot />",
            "<SlotMachine />",
            "slot",
            "one:two",
            "<script>const slot = true;</script>",
        ] {
            assert!(
                !scan_source_features(source).may_need_template_info(),
                "{source}"
            );
        }
    }
}
