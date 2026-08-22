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

const ALL_DOLLAR: u8 =
    SourceFeatures::DOLLAR_PROPS | SourceFeatures::DOLLAR_REST_PROPS | SourceFeatures::DOLLAR_SLOTS;

const DOLLAR_IDENTIFIERS: [(&[u8], u8); 3] = [
    (b"$$props", SourceFeatures::DOLLAR_PROPS),
    (b"$$restProps", SourceFeatures::DOLLAR_REST_PROPS),
    (b"$$slots", SourceFeatures::DOLLAR_SLOTS),
];

/// Every reserved word that cannot end an expression, so a `/` after one of them
/// opens a regex literal rather than dividing.
const KEYWORDS_BEFORE_REGEX: &[&[u8]] = &[
    b"await",
    b"break",
    b"case",
    b"catch",
    b"class",
    b"const",
    b"continue",
    b"debugger",
    b"default",
    b"delete",
    b"do",
    b"else",
    b"enum",
    b"export",
    b"extends",
    b"finally",
    b"for",
    b"function",
    b"if",
    b"import",
    b"in",
    b"instanceof",
    b"new",
    b"of",
    b"return",
    b"switch",
    b"throw",
    b"try",
    b"typeof",
    b"var",
    b"void",
    b"while",
    b"with",
    b"yield",
];

/// Confirm the raw scan's `$$props` / `$$restProps` / `$$slots` positives, which
/// upstream decides per AST identifier: an occurrence in a string, a comment,
/// markup text or the module script is not a use. The raw scan stays the
/// necessary condition, so a flag it left unset is never re-tested.
pub fn confirm_dollar_features(
    features: SourceFeatures,
    source: &str,
    module_script_start: Option<usize>,
) -> SourceFeatures {
    let claimed = features.0 & ALL_DOLLAR;
    if claimed == 0 {
        return features;
    }
    let confirmed = scan_code_dollar_identifiers(source, module_script_start);
    SourceFeatures(features.0 & !(claimed & !confirmed))
}

/// The `.svelte` regions that hold JavaScript are the instance script's body and
/// every `{…}` expression; markup text, HTML comments and `<style>` bodies are
/// not code, and the module script is code the two `handleIdentifier` hooks
/// upstream never visit.
fn scan_code_dollar_identifiers(source: &str, module_script_start: Option<usize>) -> u8 {
    let bytes = source.as_bytes();
    let mut found = 0u8;
    let mut index = 0usize;
    while index < bytes.len() && found != ALL_DOLLAR {
        if let Some((body, after)) = element_body(bytes, index, b"<script", b"</script") {
            if module_script_start != Some(body.0) {
                found |= scan_js(bytes, body.0, body.1, None).0;
            }
            index = after;
        } else if let Some((_, after)) = element_body(bytes, index, b"<style", b"</style") {
            index = after;
        } else if bytes[index..].starts_with(b"<!--") {
            index = memchr::memmem::find(&bytes[index + 4..], b"-->")
                .map_or(bytes.len(), |at| index + 4 + at + 3);
        } else if bytes[index] == b'{' {
            let (bits, after) = scan_js(bytes, index + 1, bytes.len(), Some(1));
            found |= bits;
            index = after;
        } else {
            index += 1;
        }
    }
    found
}

/// `((body_start, body_end), index past the closing tag)` when the named element
/// opens at `at`.
fn element_body(
    bytes: &[u8],
    at: usize,
    open: &[u8],
    close: &[u8],
) -> Option<((usize, usize), usize)> {
    if !bytes[at..].starts_with(open) {
        return None;
    }
    let after_name = at + open.len();
    if bytes
        .get(after_name)
        .copied()
        .is_some_and(is_ascii_ident_byte)
    {
        return None;
    }
    let body_start = memchr::memchr(b'>', &bytes[after_name..])? + after_name + 1;
    let body_end = memchr::memmem::find(&bytes[body_start..], close)? + body_start;
    let after = memchr::memchr(b'>', &bytes[body_end..])
        .map_or(bytes.len(), |offset| body_end + offset + 1);
    Some(((body_start, body_end), after))
}

/// Scan `bytes[start..end]` as JavaScript, returning the dollar identifiers that
/// occur in code position. With `brace_depth` the scan is a `{…}` region and
/// stops after the `}` that closes it, reporting the offset past that byte.
fn scan_js(bytes: &[u8], start: usize, end: usize, brace_depth: Option<u32>) -> (u8, usize) {
    let mut found = 0u8;
    let mut index = start;
    let mut depth = brace_depth.unwrap_or(0);
    let mut previous: Option<u8> = None;
    let mut previous_word: Option<(usize, usize)> = None;

    while index < end {
        let byte = bytes[index];
        if is_ascii_ident_byte(byte) {
            let word_start = index;
            while index < end && is_ascii_ident_byte(bytes[index]) {
                index += 1;
            }
            let word = &bytes[word_start..index];
            for (needle, bit) in DOLLAR_IDENTIFIERS {
                if word == needle {
                    found |= bit;
                }
            }
            previous = Some(bytes[index - 1]);
            previous_word = Some((word_start, index));
            continue;
        }

        match byte {
            b'/' if index + 1 < end && bytes[index + 1] == b'/' => {
                index = memchr::memchr(b'\n', &bytes[index..end]).map_or(end, |at| index + at);
            }
            b'/' if index + 1 < end && bytes[index + 1] == b'*' => {
                index = memchr::memmem::find(&bytes[index + 2..end], b"*/")
                    .map_or(end, |at| index + 2 + at + 2);
            }
            b'/' if starts_regex(bytes, previous, previous_word) => {
                index = skip_regex(bytes, index, end);
                previous = Some(b'/');
                previous_word = None;
            }
            b'\'' | b'"' => {
                index = skip_quoted(bytes, index, end, byte);
                previous = Some(byte);
                previous_word = None;
            }
            b'`' => {
                let (bits, next) = skip_template(bytes, index, end);
                found |= bits;
                index = next;
                previous = Some(b'`');
                previous_word = None;
            }
            _ => {
                if byte == b'{' {
                    depth += 1;
                } else if byte == b'}' {
                    if brace_depth.is_some() && depth <= 1 {
                        return (found, index + 1);
                    }
                    depth = depth.saturating_sub(1);
                }
                index += 1;
                if !byte.is_ascii_whitespace() {
                    previous = Some(byte);
                    previous_word = None;
                }
            }
        }
    }

    (found, end)
}

fn starts_regex(bytes: &[u8], previous: Option<u8>, previous_word: Option<(usize, usize)>) -> bool {
    if let Some((start, end)) = previous_word {
        return KEYWORDS_BEFORE_REGEX.contains(&&bytes[start..end]);
    }
    !matches!(previous, Some(byte) if matches!(byte, b')' | b']' | b'}' | b'\'' | b'"' | b'`'))
}

fn skip_quoted(bytes: &[u8], at: usize, end: usize, quote: u8) -> usize {
    let mut index = at + 1;
    while index < end {
        let byte = bytes[index];
        if byte == b'\\' {
            index += 2;
        } else if byte == quote {
            return index + 1;
        } else {
            index += 1;
        }
    }
    end
}

fn skip_regex(bytes: &[u8], at: usize, end: usize) -> usize {
    let mut index = at + 1;
    let mut in_class = false;
    while index < end {
        match bytes[index] {
            b'\\' => index += 2,
            b'[' => {
                in_class = true;
                index += 1;
            }
            b']' => {
                in_class = false;
                index += 1;
            }
            b'/' if !in_class => return index + 1,
            // An unterminated regex was a division after all; resume there.
            b'\n' => return at + 1,
            _ => index += 1,
        }
    }
    end
}

fn skip_template(bytes: &[u8], at: usize, end: usize) -> (u8, usize) {
    let mut found = 0u8;
    let mut index = at + 1;
    while index < end {
        match bytes[index] {
            b'\\' => index += 2,
            b'`' => return (found, index + 1),
            b'$' if bytes.get(index + 1) == Some(&b'{') => {
                let (bits, next) = scan_js(bytes, index + 2, end, Some(1));
                found |= bits;
                index = next;
            }
            _ => index += 1,
        }
    }
    (found, end)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::svelte2tsx::utils::lexical::contains_word;

    /// The raw scan is only the necessary condition: it fires on the bytes
    /// wherever they sit, and `confirm_dollar_features` is what decides a use.
    fn assert_matches_previous_scans(source: &str) {
        let features = scan_source_features(source);
        assert_eq!(features.uses_dollar_props(), source.contains("$$props"));
        assert_eq!(
            features.uses_dollar_rest_props(),
            source.contains("$$restProps")
        );
        assert_eq!(features.uses_dollar_slots(), source.contains("$$slots"));
        let confirmed = confirm_dollar_features(features, source, None);
        assert!(!confirmed.uses_dollar_props() || features.uses_dollar_props());
        assert!(!confirmed.uses_dollar_rest_props() || features.uses_dollar_rest_props());
        assert!(!confirmed.uses_dollar_slots() || features.uses_dollar_slots());
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

    fn confirmed(source: &str) -> SourceFeatures {
        confirm_dollar_features(scan_source_features(source), source, None)
    }

    #[test]
    fn confirms_only_dollar_identifiers_in_code() {
        for source in [
            "<script>foo($$props);</script>",
            "<script>foo($$props)</script>",
            "<script>const a = `${$$props.x}`;</script>",
            "<script>const re = /x/; foo($$props);</script>",
            "{$$props.x}",
            "<div title={$$props.x} />",
            r#"<div title="a{$$props.x}b" />"#,
            "<script>type T = typeof $$props;</script>",
        ] {
            assert!(confirmed(source).uses_dollar_props(), "{source}");
        }

        for source in [
            r#"<script>const docs = ['$.prop($$props, "x")'];</script>"#,
            "<script>// $$props\n</script>",
            "<script>/* $$props */</script>",
            "<script>const a = `text $$props`;</script>",
            "<script>const re = /$$props/;</script>",
            "<p>$$props</p>",
            r#"<div title="$$props" />"#,
            "<!-- $$props -->",
            "<style>/* $$props */</style>",
            "<script>const x = $$propsy;</script>",
        ] {
            assert!(!confirmed(source).uses_dollar_props(), "{source}");
        }
    }

    #[test]
    fn does_not_confirm_the_module_script() {
        let source = "<script context=\"module\">foo($$props);</script><p>hi</p>";
        let module_start = source.find("foo").unwrap();
        assert!(scan_source_features(source).uses_dollar_props());
        assert!(
            !confirm_dollar_features(scan_source_features(source), source, Some(module_start))
                .uses_dollar_props()
        );
        assert!(confirmed(source).uses_dollar_props());
    }

    #[test]
    fn scans_every_truncation_of_an_unterminated_source() {
        let source = "<script>const a = `${'/*'}`; b /re/ c; // $$props\n</script>\
                      <style>.a{}</style>{$$slots}<!-- $$restProps -->";
        for end in 0..=source.len() {
            if source.is_char_boundary(end) {
                let _ = confirmed(&source[..end]);
            }
        }
    }

    #[test]
    fn confirms_each_dollar_identifier_separately() {
        let source = "<script>const a = '$$props'; foo($$restProps);</script>{$$slots.default}";
        let features = confirmed(source);
        assert!(!features.uses_dollar_props());
        assert!(features.uses_dollar_rest_props());
        assert!(features.uses_dollar_slots());
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
