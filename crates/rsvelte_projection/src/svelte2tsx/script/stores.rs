//! Store auto-subscription: scanning `$name` references and injecting
//! `let $name = __sveltets_2_store_get(name);` declarations.

use std::collections::HashMap;
use std::collections::HashSet;
use std::fmt::Write as _;

use oxc_ast::ast as oxc;

use super::ast_utils::extract_all_names_from_binding_pattern;
use super::reactive::extract_names_from_labeled_body;
use super::runes::excluded_rune_init;

use super::super::magic_string::MagicString;
use super::super::utils::htmlxparser::blank_style_content;

fn source_offset(value: usize) -> u32 {
    u32::try_from(value).expect("script source offsets are represented as u32")
}

/// Reserved names that should not be treated as store references.
const RESERVED_STORE_NAMES: &[&str] = &["$$props", "$$restProps", "$$slots"];

struct StoreCandidate {
    name_start: u32,
    name_len_and_flags: u32,
}

impl StoreCandidate {
    const SELF_NAMED_RUNE_FLAG: u32 = 1;
    const PROPERTY_KEY_FLAG: u32 = 2;

    fn new(
        name_start: usize,
        name_end: usize,
        may_be_self_named_rune: bool,
        is_property_key: bool,
    ) -> Self {
        let name_len = u32::try_from(name_end - name_start).expect("store name exceeds u32");
        let name_len_and_flags = name_len
            .checked_mul(4)
            .expect("store name exceeds packed length");
        Self {
            name_start: source_offset(name_start),
            name_len_and_flags: name_len_and_flags
                + u32::from(may_be_self_named_rune)
                + if is_property_key {
                    Self::PROPERTY_KEY_FLAG
                } else {
                    0
                },
        }
    }

    fn name<'s>(&self, source: &'s str) -> &'s str {
        let start = self.name_start as usize;
        let end = start + (self.name_len_and_flags >> 2) as usize;
        &source[start..end]
    }

    const fn pos(&self) -> u32 {
        self.name_start - 1
    }

    const fn may_be_self_named_rune(&self) -> bool {
        self.name_len_and_flags & Self::SELF_NAMED_RUNE_FLAG != 0
    }

    const fn is_property_key(&self) -> bool {
        self.name_len_and_flags & Self::PROPERTY_KEY_FLAG != 0
    }
}

pub struct StoreScanContext<'s> {
    source: &'s str,
    script_spans: ScriptSpans,
    cache_candidates: bool,
    has_dollar: Option<bool>,
    candidates_scanned: bool,
    candidates: Vec<StoreCandidate>,
    accessed_stores: HashSet<&'s str>,
    pub(super) dollar_param_shadow: HashMap<String, Vec<(u32, u32)>>,
    pub(super) self_named_rune_calls: Vec<u32>,
    pub(super) regex_literal_spans: Vec<(u32, u32)>,
    /// Source ranges official's store walker structurally cannot see a
    /// reference in: a string literal, a template literal's text chunks, and
    /// the imported (property) name of an aliased import specifier.
    pub(super) opaque_dollar_spans: Vec<(u32, u32)>,
    /// `$`-prefixed KEYS of a binding pattern that upstream nevertheless
    /// resolves as stores, because its `isDeclaration` flag is a boolean whose
    /// reset fires when the pattern's first element is left — so every element
    /// after the first is walked as if it were an expression.
    pub(super) binding_pattern_key_positions: Vec<u32>,
    /// The template half of the same question, which no parsed program answers
    /// here. Computed on first use: a source with no `$` never needs it.
    template_opaque: Option<Vec<(u32, u32)>>,
    import_store_names: Vec<&'s str>,
    seen_import_store_names: HashSet<&'s str>,
}

impl<'s> StoreScanContext<'s> {
    pub(crate) fn new(
        source: &'s str,
        cache_candidates: bool,
        module_span: Option<(usize, usize)>,
        instance_span: Option<(usize, usize)>,
    ) -> Self {
        Self {
            source,
            script_spans: ScriptSpans::new(module_span, instance_span),
            cache_candidates,
            has_dollar: None,
            candidates_scanned: false,
            candidates: Vec::new(),
            accessed_stores: HashSet::new(),
            dollar_param_shadow: HashMap::new(),
            self_named_rune_calls: Vec::new(),
            regex_literal_spans: Vec::new(),
            opaque_dollar_spans: Vec::new(),
            binding_pattern_key_positions: Vec::new(),
            template_opaque: None,
            import_store_names: Vec::new(),
            seen_import_store_names: HashSet::new(),
        }
    }

    pub(super) fn begin_script_facts(&mut self) {
        self.dollar_param_shadow.clear();
        self.self_named_rune_calls.clear();
        self.regex_literal_spans.clear();
        self.opaque_dollar_spans.clear();
        self.binding_pattern_key_positions.clear();
    }

    pub(super) fn has_dollar(&mut self) -> bool {
        if let Some(has_dollar) = self.has_dollar {
            return has_dollar;
        }
        let has_dollar = memchr::memchr(b'$', self.source.as_bytes()).is_some();
        self.has_dollar = Some(has_dollar);
        has_dollar
    }

    pub(super) fn add_dollar_param_shadow(&mut self, name: &str, span: (u32, u32)) {
        if let Some(base) = name.strip_prefix('$') {
            self.dollar_param_shadow
                .entry(base.to_string())
                .or_default()
                .push(span);
        }
    }

    /// `$state`/`$props`/`$derived` occurrences excluded from store resolution:
    /// self-named rune calls, plus `$props.id()` beside a `props` rune binding.
    pub(super) fn add_self_named_rune_call(&mut self, pos: u32) {
        self.self_named_rune_calls.push(pos);
    }

    pub(super) fn add_regex_literal_span(&mut self, span: (u32, u32)) {
        self.regex_literal_spans.push(span);
    }

    pub(super) fn add_opaque_dollar_span(&mut self, span: (u32, u32)) {
        self.opaque_dollar_spans.push(span);
    }

    pub(super) fn add_binding_pattern_key_position(&mut self, pos: u32) {
        self.binding_pattern_key_positions.push(pos);
    }

    pub(super) fn finish_script_facts(&mut self) {
        self.self_named_rune_calls.sort_unstable();
        self.self_named_rune_calls.dedup();
        self.regex_literal_spans.sort_unstable();
        self.regex_literal_spans.dedup();
        self.opaque_dollar_spans.sort_unstable();
        self.opaque_dollar_spans.dedup();
        self.binding_pattern_key_positions.sort_unstable();
        self.binding_pattern_key_positions.dedup();
    }

    pub(super) fn collect_loose_dollar_names(
        &mut self,
        start: usize,
        end: usize,
        output: &mut HashSet<String>,
    ) {
        self.accessed_stores.clear();
        let Some(text) = self.source.get(start..end) else {
            return;
        };
        collect_loose_dollar_names_into(
            text,
            start,
            &self.regex_literal_spans,
            &mut self.accessed_stores,
        );
        output.extend(self.accessed_stores.iter().map(|name| (*name).to_string()));
    }

    fn ensure_candidates(&mut self) {
        if self.candidates_scanned {
            return;
        }
        let has_dollar = self.has_dollar();
        self.candidates_scanned = true;
        if has_dollar {
            self.candidates
                .reserve(memchr::memchr_iter(b'$', self.source.as_bytes()).count());
            collect_store_candidates(self.source, self.script_spans, |candidate| {
                self.candidates.push(candidate);
            });
        }
    }

    fn resolve_accessed_stores(&mut self) {
        self.accessed_stores.clear();
        if self.template_opaque.is_none() {
            self.template_opaque = Some(crate::svelte2tsx::utils::lexical::template_opaque_ranges(
                self.source,
            ));
        }
        if self.cache_candidates {
            self.ensure_candidates();
            let template_opaque: &[(u32, u32)] = self.template_opaque.as_deref().unwrap_or(&[]);
            for candidate in &self.candidates {
                if let Some(name) = resolve_store_candidate(
                    self.source,
                    candidate,
                    &self.dollar_param_shadow,
                    &self.self_named_rune_calls,
                    &self.regex_literal_spans,
                    &self.opaque_dollar_spans,
                    template_opaque,
                    &self.binding_pattern_key_positions,
                ) {
                    self.accessed_stores.insert(name);
                }
            }
            return;
        }
        if !self.has_dollar() {
            return;
        }
        let source = self.source;
        let template_opaque: &[(u32, u32)] = self.template_opaque.as_deref().unwrap_or(&[]);
        let shadow = &self.dollar_param_shadow;
        let rune_calls = &self.self_named_rune_calls;
        let regex_spans = &self.regex_literal_spans;
        let opaque_spans = &self.opaque_dollar_spans;
        let pattern_keys = &self.binding_pattern_key_positions;
        let stores = &mut self.accessed_stores;
        collect_store_candidates(source, self.script_spans, |candidate| {
            if let Some(name) = resolve_store_candidate(
                source,
                &candidate,
                shadow,
                rune_calls,
                regex_spans,
                opaque_spans,
                template_opaque,
                pattern_keys,
            ) {
                stores.insert(name);
            }
        });
    }

    fn is_accessed(&self, name: &str) -> bool {
        self.accessed_stores.contains(name)
    }

    fn begin_import_collection(&mut self) {
        self.import_store_names.clear();
        self.seen_import_store_names.clear();
    }

    fn push_import_if_accessed(&mut self, name: &str) {
        if let Some(&source_name) = self.accessed_stores.get(name) {
            self.import_store_names.push(source_name);
        }
    }

    fn dedup_imports_preserving_order(&mut self) {
        let seen = &mut self.seen_import_store_names;
        self.import_store_names.retain(|name| seen.insert(*name));
    }
}

#[derive(Clone, Copy)]
struct ScriptSpans {
    module: u64,
    instance: u64,
}

impl ScriptSpans {
    const NONE: u64 = u64::MAX;

    fn new(module: Option<(usize, usize)>, instance: Option<(usize, usize)>) -> Self {
        Self {
            module: Self::pack(module),
            instance: Self::pack(instance),
        }
    }

    fn pack(span: Option<(usize, usize)>) -> u64 {
        span.map_or(Self::NONE, |(start, end)| {
            let start = u32::try_from(start).expect("store start offset fits in u32");
            let end = u32::try_from(end).expect("store end offset fits in u32");
            (u64::from(start) << 32) | u64::from(end)
        })
    }

    fn unpack(span: u64) -> Option<(usize, usize)> {
        if span == Self::NONE {
            return None;
        }
        let start = u32::try_from(span >> 32).expect("packed span high half fits in u32");
        let end =
            u32::try_from(span & u64::from(u32::MAX)).expect("packed span low half fits in u32");
        Some((
            usize::try_from(start).expect("u32 fits in usize"),
            usize::try_from(end).expect("u32 fits in usize"),
        ))
    }

    fn module(self) -> Option<(usize, usize)> {
        Self::unpack(self.module)
    }

    fn instance(self) -> Option<(usize, usize)> {
        Self::unpack(self.instance)
    }
}

impl Default for ScriptSpans {
    fn default() -> Self {
        Self::new(None, None)
    }
}

/// Locate the first module and instance script bodies in one source scan.
#[cfg(test)]
fn find_script_spans(source: &str) -> ScriptSpans {
    let bytes = source.as_bytes();
    let mut spans = ScriptSpans::default();
    let mut search = 0usize;
    while spans.module().is_none() || spans.instance().is_none() {
        let Some(rel) = source[search..].find("<script") else {
            break;
        };
        let tag_start = search + rel;
        let Some(gt_offset) = source[tag_start..].find('>') else {
            break;
        };
        let gt = tag_start + gt_offset;
        let open_tag = &source[tag_start..gt];
        let is_module = open_tag.contains("context=\"module\"")
            || open_tag.contains("context='module'")
            || open_tag
                .split(|c: char| c.is_ascii_whitespace() || c == '>' || c == '=')
                .any(|tok| tok == "module");
        if !open_tag.starts_with("<scripts") {
            let body_start = gt + 1;
            let body_end = source[body_start..]
                .find("</script")
                .map(|e| body_start + e)
                .unwrap_or(bytes.len());
            let span = (body_start, body_end);
            if is_module {
                if spans.module().is_none() {
                    spans.module = ScriptSpans::pack(Some(span));
                }
            } else {
                if spans.instance().is_none() {
                    spans.instance = ScriptSpans::pack(Some(span));
                }
            }
        }
        search = gt + 1;
    }
    spans
}

/// Blank the inner content of the module `<script>` so a byte-level store scan
/// never sees module-internal `$name` references.
fn blank_module_script_body(span: Option<(usize, usize)>, buf: &mut [u8]) {
    if let Some((start, end)) = span {
        for b in &mut buf[start..end] {
            if *b != b'\n' && *b != b'\r' {
                *b = b' ';
            }
        }
    }
}

/// Cheap pre-check: does the instance script body contain a `//` or `/*`
/// comment-opener? (Gates the buffer copy in `collect_store_references`.)
fn instance_script_has_comment(source: &str, span: Option<(usize, usize)>) -> bool {
    match span {
        Some((start, end)) => {
            let body = &source[start..end];
            body.contains("//") || body.contains("/*")
        }
        None => false,
    }
}

/// Blank `//` line and `/* */` block comments inside the instance `<script>`
/// body so a byte-level store scan never sees a `$name` token that only appears
/// in a comment. String literals are skipped (not blanked) so a `//` inside a
/// string is not mistaken for a comment. Mirrors the level of care in
/// `collect_loose_dollar_names_from_script`.
fn blank_instance_script_comments(source: &str, span: Option<(usize, usize)>, buf: &mut [u8]) {
    let Some((start, end)) = span else { return };
    let bytes = source.as_bytes();
    let mut i = start;
    while i < end {
        let b = bytes[i];
        // Line comment `// … <eol>`
        if b == b'/' && i + 1 < end && bytes[i + 1] == b'/' {
            while i < end && bytes[i] != b'\n' {
                buf[i] = b' ';
                i += 1;
            }
            continue;
        }
        // Block comment `/* … */`
        if b == b'/' && i + 1 < end && bytes[i + 1] == b'*' {
            let mut j = i + 2;
            while j + 1 < end && !(bytes[j] == b'*' && bytes[j + 1] == b'/') {
                j += 1;
            }
            let stop = (j + 2).min(end);
            for slot in &mut buf[i..stop] {
                if *slot != b'\n' && *slot != b'\r' {
                    *slot = b' ';
                }
            }
            i = stop;
            continue;
        }
        // String / template literal — skip (do NOT blank) so `$name` inside a
        // real string is handled by the existing prev-byte quote guards.
        if b == b'"' || b == b'\'' || b == b'`' {
            let q = b;
            i += 1;
            while i < end && bytes[i] != q {
                if bytes[i] == b'\\' {
                    i += 1;
                }
                i += 1;
            }
            i += 1;
            continue;
        }
        i += 1;
    }
}

/// Scan raw instance-script text for `$name` patterns WITHOUT applying the
/// rune-call exclusion (`$props`/`$state`/`$derived`).
///
/// The official JS `processInstanceScriptContent` runs a TypeScript AST walker
/// that calls `resolveStore` for every `$X` identifier.  The rune-exclusion
/// (`is_rune`) check inside that walker is broken in practice because TypeScript
/// source-file nodes don't have their `.parent` pointer set, causing
/// `ts.isVariableDeclaration(parent.parent)` to always be `false`.  As a result
/// ALL `$X` identifiers in the instance script — including `$props()`,
/// `$bindable()` etc. — land in `accessedStores` / `disallowed_values`.
///
/// We replicate that behaviour here: scan the raw text and return every base
/// name `X` for every `$X` token found, skipping only `$$`-prefixed forms and
/// obvious non-identifiers (comments, strings, member accesses, etc.) but NOT
/// applying the rune-name filter.
fn collect_loose_dollar_names_into<'s>(
    text: &'s str,
    absolute_start: usize,
    regex_literal_spans: &[(u32, u32)],
    names: &mut HashSet<&'s str>,
) {
    let bytes = text.as_bytes();
    if memchr::memchr(b'$', bytes).is_none() {
        return;
    }
    let len = bytes.len();
    let mut i = 0usize;

    // Simple comment/string skipper — matches the level of care in
    // `collect_store_references`, which is the nearest sibling function.
    while i < len {
        // Skip line comments
        if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }
        // Skip block comments
        if i + 1 < len && bytes[i] == b'/' && bytes[i + 1] == b'*' {
            i += 2;
            while i + 1 < len && !(bytes[i] == b'*' && bytes[i + 1] == b'/') {
                i += 1;
            }
            i += 2;
            continue;
        }
        // Skip string literals (single and double quote, simple heuristic)
        if bytes[i] == b'"' || bytes[i] == b'\'' || bytes[i] == b'`' {
            let q = bytes[i];
            i += 1;
            while i < len && bytes[i] != q {
                if bytes[i] == b'\\' {
                    i += 1; // skip escaped char
                }
                i += 1;
            }
            i += 1;
            continue;
        }

        if bytes[i] != b'$' {
            i += 1;
            continue;
        }

        let pos = i;
        let next = pos + 1;
        if next >= len {
            break;
        }
        if position_in_spans(regex_literal_spans, source_offset(absolute_start + pos)) {
            i = next;
            continue;
        }
        let nb = bytes[next];

        // Skip `$$` (special identifiers like `$$props`)
        if nb == b'$' {
            i = next + 1;
            continue;
        }

        // Skip member-access / string-key context
        if pos > 0 {
            let prev = bytes[pos - 1];
            if prev == b'.'
                || prev == b'\''
                || prev == b'"'
                || prev.is_ascii_alphanumeric()
                || prev == b'_'
            {
                i = next;
                continue;
            }
        }

        // Must start a valid identifier
        if !(nb.is_ascii_alphabetic() || nb == b'_') {
            i = next;
            continue;
        }

        let mut end = next + 1;
        while end < len {
            let b = bytes[end];
            if b.is_ascii_alphanumeric() || b == b'_' {
                end += 1;
            } else {
                break;
            }
        }

        let base = &text[next..end];
        names.insert(base);
        i = end;
    }
}

#[cfg(test)]
fn collect_loose_dollar_names_from_script(text: &str) -> HashSet<String> {
    let mut names = HashSet::new();
    collect_loose_dollar_names_into(text, 0, &[], &mut names);
    names.into_iter().map(str::to_string).collect()
}

fn collect_store_candidates(
    source: &str,
    script_spans: ScriptSpans,
    mut visit: impl FnMut(StoreCandidate),
) {
    // Hand-rolled byte-level scan. The previous implementation compiled a
    // regex on every call; using `memchr` to jump between `$` bytes is
    // dramatically faster on the common script-free template (one SIMD
    // pass returns `None`) and avoids per-match string allocations.
    //
    // HTML comments are blanked first: a `$name` inside `<!-- … -->` is not a
    // real reference (official builds stores from parsed expressions, never
    // comments), so e.g. a `<!-- … `$derived` … -->` migration-task comment
    // must not make a local `derived` variable look like a store subscription.
    // The module script's own `$name` references are NOT auto-subscriptions —
    // official `svelte2tsx` only runs the `Stores` walker over the instance
    // script + template, never the module script body. So a `<script module>`
    // that internally reads `$foo` must not make `foo` look like a store.
    let blanked;
    // Instance-script JS comments must be blanked too: official only collects
    // `$name` store accesses from the parsed instance-script AST + template
    // expression values, so a `$name` that appears only inside a `//` / `/* */`
    // comment (e.g. a JSDoc `[`$on`](…$on)` link) is never a store reference.
    let needs_blank = source.contains("<!--")
        || script_spans.module().is_some()
        || source.contains("<style")
        || instance_script_has_comment(source, script_spans.instance());
    let scan_source: &str = if needs_blank {
        // `blank_style_content` walks comments, `<script>` and `<style>` in
        // source order, so a `<style>` written inside a script comment or string
        // is inside the script region it already skipped. A hand-rolled
        // `find("<style")` here blanked from a `// … <style> …` comment to EOF
        // (no closing tag follows) and swallowed the template's own `$store`
        // reads.
        let mut buf = blank_style_content(source).as_bytes().to_vec();
        let mut j = 0usize;
        while let Some(rel) = source[j..].find("<!--") {
            let start = j + rel;
            let end = source[start..]
                .find("-->")
                .map_or(buf.len(), |e| start + e + 3);
            for b in &mut buf[start..end] {
                if *b != b'\n' && *b != b'\r' {
                    *b = b' ';
                }
            }
            j = end;
        }
        blank_module_script_body(script_spans.module(), &mut buf);
        blank_instance_script_comments(source, script_spans.instance(), &mut buf);
        blanked = String::from_utf8(buf).unwrap_or_else(|_| source.to_string());
        &blanked
    } else {
        source
    };
    let bytes = scan_source.as_bytes();
    let len = bytes.len();
    let mut i = 0usize;
    while let Some(off) = memchr::memchr(b'$', &bytes[i..]) {
        let pos = i + off;
        let next = pos + 1;
        if next >= len {
            break;
        }
        let nb = bytes[next];
        // Skip `$$` prefixed names (like `$$props`).
        if nb == b'$' {
            i = next + 1;
            continue;
        }
        // Set while scanning backwards, read after the identifier's end is
        // known: a directive NAME accepts only a bare `$store`, so the decision
        // needs both the keyword before it and the byte after it.
        let mut is_directive_name = false;
        // Skip member access, string keys, identifier continuations.
        if pos > 0 {
            let prev = bytes[pos - 1];
            // `...$store` (a spread element) IS a real store reference, but a
            // single-dot member access `obj.$store` is not. Official walks the
            // parsed AST, where a `SpreadElement` argument identifier is
            // collected while a `.property` member is skipped. The byte scan
            // distinguishes the two by looking one byte further back: the third
            // dot of `...` is preceded by another `.`.
            let is_spread_dot = prev == b'.' && pos >= 2 && bytes[pos - 2] == b'.';
            if (prev == b'.' && !is_spread_dot)
                || prev == b'\''
                || prev == b'"'
                || prev.is_ascii_alphanumeric()
                || prev == b'_'
            {
                i = next;
                continue;
            }
            // A `$name` written as a DIRECTIVE NAME subscribes for every
            // directive except `style:` and `on:`, measured against official
            // svelte2tsx across all nine kinds:
            //
            //   use / transition / in / out / animate / class / bind  subscribe
            //   style / on                                            do not
            //
            // The split is not shorthand-vs-value and not directive-vs-value:
            // `class:$store` subscribes while `style:$store` does not, and
            // `style:color={$store}` subscribes while `style:$store` does not.
            // Upstream's `style:` shorthand therefore emits an
            // `__sveltets_2_ensureType(…, $store)` that references a binding it
            // never declares — see `upstream_issues/3234-*`. Mirrored here
            // because output parity is the contract.
            if prev == b':' {
                let kw_end = pos - 1;
                let mut k = kw_end;
                while k > 0 && bytes[k - 1].is_ascii_lowercase() {
                    k -= 1;
                }
                let kw = &scan_source[k..kw_end];
                let boundary_ok =
                    k == 0 || matches!(bytes[k - 1], b' ' | b'\t' | b'\n' | b'\r' | b'<');
                if boundary_ok && matches!(kw, "style" | "on") {
                    i = next;
                    continue;
                }
                is_directive_name = boundary_ok;
            }
        }
        if !(nb.is_ascii_alphabetic() || nb == b'_') {
            i = next;
            continue;
        }
        let mut end = next + 1;
        while end < len {
            let b = bytes[end];
            // `$` continues a JS identifier, so `$app$` is ONE name: official
            // resolves the store `app$`, which nothing declares. Stopping at the
            // inner `$` instead yields `app`, and a neighbouring `const app` then
            // looks like a store.
            if b.is_ascii_alphanumeric() || b == b'_' || b == b'$' {
                end += 1;
            } else {
                break;
            }
        }
        // A directive name subscribes only when it is a BARE `$store`. Official
        // subscribes for `use:$store` but not for `use:$store.action`, and the
        // same holds for every kind that subscribes at all — measured across
        // `use`/`transition`/`in`/`out`/`animate`/`class`/`bind`. The member
        // form is not a store read it declares, so emitting one here produced a
        // subscription upstream never writes (`store-directive/main.svelte`).
        // Only the NAME position is restricted: `use:x={$store.action}` and a
        // plain `{$store.x}` both still subscribe.
        if is_directive_name && bytes.get(end) == Some(&b'.') {
            i = end;
            continue;
        }
        let full = &scan_source[pos..end];
        // Object-literal property KEY (`{ $name: value }` / after a `,`): the
        // `$name` is a property name, not a store reference. Official walks the
        // parsed AST and skips `Property.key` identifiers, so e.g. a row object
        // `{ $expanded: …, $selected: … }` must not turn `expanded` / `selected`
        // into store auto-subscriptions. Detected by `$name` followed (skipping
        // whitespace) by `:` AND preceded (skipping whitespace) by `{` or `,`
        // (which excludes a ternary `cond ? $name : x`, where the preceding
        // token is `?`).
        // A binding-pattern key is NOT always skipped upstream — see
        // `is_property_key` on the candidate — so it is emitted and filtered in
        // `resolve_store_candidate`, which has the AST's answer.
        let is_property_key = is_object_property_key(bytes, pos, end);
        if RESERVED_STORE_NAMES.contains(&full) {
            i = end;
            continue;
        }
        // Rune-call exclusion (mirror `processInstanceScriptContent.ts` `is_rune`):
        // a `$props`/`$state`/`$derived` CALL whose declaration binding name
        // includes the rune base (`let state = $state()` → rune; `let count =
        // $state()` → still a `state` store access) is the rune, not a store sub.
        // The precise set of such call callees is precomputed from the AST
        // (`collect_self_named_rune_call_positions`) so a type annotation with
        // generic-argument commas can't fool a text scan, and — crucially — only
        // the CALL occurrence is skipped: a sibling `$state.snapshot(state)`
        // keeps `state` a store, matching upstream.
        visit(StoreCandidate::new(
            next,
            end,
            matches!(full, "$state" | "$props" | "$derived"),
            is_property_key,
        ));
        i = end;
    }
}

fn resolve_store_candidate<'s>(
    source: &'s str,
    candidate: &StoreCandidate,
    shadow: &HashMap<String, Vec<(u32, u32)>>,
    self_named_rune_calls: &[u32],
    regex_literal_spans: &[(u32, u32)],
    opaque_dollar_spans: &[(u32, u32)],
    template_opaque_ranges: &[(u32, u32)],
    binding_pattern_key_positions: &[u32],
) -> Option<&'s str> {
    let pos = candidate.pos();
    if candidate.is_property_key() && binding_pattern_key_positions.binary_search(&pos).is_err() {
        return None;
    }
    if position_in_spans(regex_literal_spans, pos)
        || position_in_spans(opaque_dollar_spans, pos)
        || position_in_spans(template_opaque_ranges, pos)
    {
        return None;
    }
    if candidate.may_be_self_named_rune() && self_named_rune_calls.binary_search(&pos).is_ok() {
        return None;
    }
    let name = candidate.name(source);
    (!is_dollar_binding_shadowed(shadow, name, pos as usize)).then_some(name)
}

fn position_in_spans(spans: &[(u32, u32)], pos: u32) -> bool {
    let index = spans.partition_point(|&(start, _)| start <= pos);
    index > 0 && pos < spans[index - 1].1
}

/// True when any identifier named `props` appears in a declaration's binding
/// name — including an object-pattern KEY (`{ props: renamed }`), which upstream
/// also counts because it walks every identifier of the name subtree.
pub(super) fn binding_pattern_mentions_props(pattern: &oxc::BindingPattern) -> bool {
    match pattern {
        oxc::BindingPattern::BindingIdentifier(id) => id.name == "props",
        oxc::BindingPattern::ObjectPattern(obj) => {
            obj.properties.iter().any(|prop| {
                matches!(&prop.key, oxc::PropertyKey::StaticIdentifier(key) if key.name == "props")
                    || binding_pattern_mentions_props(&prop.value)
            }) || obj
                .rest
                .as_ref()
                .is_some_and(|rest| binding_pattern_mentions_props(&rest.argument))
        }
        oxc::BindingPattern::ArrayPattern(arr) => {
            arr.elements
                .iter()
                .flatten()
                .any(binding_pattern_mentions_props)
                || arr
                    .rest
                    .as_ref()
                    .is_some_and(|rest| binding_pattern_mentions_props(&rest.argument))
        }
        oxc::BindingPattern::AssignmentPattern(assign) => {
            binding_pattern_mentions_props(&assign.left)
        }
    }
}

/// True when the `$name` token spanning `[pos, end)` is an object-literal
/// property KEY (`{ $name: value }` or `, $name: value`), which the official
/// `Stores` AST walker skips (it only collects `$name` Identifier nodes in
/// reference position, never `Property.key`).
///
/// A property key is `$name` followed — skipping whitespace — by a single `:`
/// (not `::` and not a ternary `?:`, since a ternary's `$name` is preceded by
/// `?`), AND preceded — skipping whitespace — by `{` or `,`. Comments are
/// already blanked to spaces before this scan, so the whitespace skip crosses
/// them. Shorthand (`{ $name }`, no colon) and computed keys (`{ [$name]: … }`,
/// preceded by `[`) are intentionally NOT treated as keys.
fn is_object_property_key(bytes: &[u8], pos: usize, end: usize) -> bool {
    // Look forward for a `:` after optional whitespace.
    let mut f = end;
    while f < bytes.len() && matches!(bytes[f], b' ' | b'\t' | b'\n' | b'\r') {
        f += 1;
    }
    if f >= bytes.len() || bytes[f] != b':' {
        return false;
    }
    // `::` is not an object-key colon.
    if f + 1 < bytes.len() && bytes[f + 1] == b':' {
        return false;
    }
    // Look backward for `{` or `,` after optional whitespace.
    let mut b = pos;
    while b > 0 && matches!(bytes[b - 1], b' ' | b'\t' | b'\n' | b'\r') {
        b -= 1;
    }
    b > 0 && matches!(bytes[b - 1], b'{' | b',')
}

/// True when `pos` (a source byte offset of a `$name` reference) falls inside a
/// function span that binds `$name` as a parameter.
fn is_dollar_binding_shadowed(
    shadow: &HashMap<String, Vec<(u32, u32)>>,
    name: &str,
    pos: usize,
) -> bool {
    shadow.get(name).is_some_and(|spans| {
        let p = source_offset(pos);
        spans.iter().any(|&(s, e)| p >= s && p < e)
    })
}

/// Create the store subscription declaration string for a list of store names.
///
/// Returns a string like `/*Ωignore_startΩ*/;let $a = __sveltets_2_store_get(a);;let $b = __sveltets_2_store_get(b);/*Ωignore_endΩ*/`
pub(super) fn create_store_declarations(store_names: &[&str]) -> String {
    if store_names.is_empty() {
        return String::new();
    }
    let mut result = String::from("/*\u{03A9}ignore_start\u{03A9}*/");
    for name in store_names {
        let _ = write!(result, ";let ${name} = __sveltets_2_store_get({name});");
    }
    result.push_str("/*\u{03A9}ignore_end\u{03A9}*/");
    result
}

/// Collect the source byte offsets of the `$props` / `$state` / `$derived`
/// callee identifiers of self-named rune CALLS — a `<binding> = $rune(…)`
/// whose binding NAME includes the rune base (e.g. `let { …, ...props }:
/// SomeProps<T> = $props()`). Mirrors upstream `processInstanceScriptContent.ts`
/// `is_rune`, which inspects the binding name only (never the type annotation)
/// via the AST and excludes exactly that call occurrence from store resolution.
///
/// The text-based `$name` scan then skips only these positions — leaving a
/// non-call occurrence such as `$state.snapshot(x)` intact, so a genuine
/// `let state = $state([])` next to `$state.snapshot(state)` still auto-
/// subscribes exactly as upstream does.
pub(super) fn collect_self_named_rune_call_positions(
    context: &mut StoreScanContext<'_>,
    program: &oxc::Program,
    offset: u32,
) {
    let mut visit_var_decl = |var_decl: &oxc::VariableDeclaration| {
        for declarator in &var_decl.declarations {
            let Some(init) = declarator.init.as_ref() else {
                continue;
            };
            if let Some(call) = excluded_rune_init(init, &declarator.id)
                && let oxc::Expression::Identifier(callee) = &call.callee
            {
                context.add_self_named_rune_call(callee.span.start + offset);
            }
        }
    };
    for stmt in &program.body {
        match stmt {
            oxc::Statement::VariableDeclaration(vd) => visit_var_decl(vd),
            oxc::Statement::ExportDeclaration(ex) => {
                if let oxc::Declaration::VariableDeclaration(vd) = &ex.declaration {
                    visit_var_decl(vd);
                }
            }
            _ => {}
        }
    }
}

/// Inject store subscription declarations into the script.
///
/// Scans the full source for `$identifier` references, then finds the
/// declarations (variables, imports, reactive assignments) in the script that
/// match, and injects `;let $name = __sveltets_2_store_get(name);` at the
/// appropriate positions.
///
/// For variable declarations: injected right after the declaration end.
/// For imports: injected at the start of the script content (which becomes the
/// start of the $$render function body after script tag transformation).
/// For reactive declarations (`$: name = ...`): injected after the labeled statement.
/// Reuses an already-parsed program (callers parse the instance script
/// once and pass the result here, avoiding a second OXC parse).
pub(super) fn inject_store_subscriptions_with_program(
    program: &oxc::Program,
    module_program: Option<&oxc::Program>,
    offset: u32,
    context: &mut StoreScanContext<'_>,
    str: &mut MagicString<'_>,
) {
    if !context.has_dollar() {
        return;
    }

    context.resolve_accessed_stores();
    if context.accessed_stores.is_empty() {
        return;
    }

    context.begin_import_collection();

    for stmt in &program.body {
        match stmt {
            oxc::Statement::VariableDeclaration(var_decl) => {
                let last_decl_end = var_decl
                    .declarations
                    .last()
                    .map_or(var_decl.span.end, |d| d.span.end);
                let inject_pos = last_decl_end + offset;

                for declarator in &var_decl.declarations {
                    let names = extract_all_names_from_binding_pattern(&declarator.id);
                    let matching: Vec<String> = names
                        .into_iter()
                        .filter(|name| context.is_accessed(name))
                        .collect();

                    if !matching.is_empty() {
                        let name_refs: Vec<&str> =
                            matching.iter().map(std::string::String::as_str).collect();
                        let store_decls = create_store_declarations(&name_refs);
                        str.append_left(inject_pos, &store_decls);
                    }
                }
            }

            oxc::Statement::ImportDeclaration(import) => {
                collect_import_store_names(import, context);
            }

            oxc::Statement::ExportDeclaration(export) => {
                if let oxc::Declaration::VariableDeclaration(var_decl) = &export.declaration {
                    let last_decl_end = var_decl
                        .declarations
                        .last()
                        .map_or(var_decl.span.end, |d| d.span.end);
                    let inject_pos = last_decl_end + offset;

                    for declarator in &var_decl.declarations {
                        let names = extract_all_names_from_binding_pattern(&declarator.id);
                        let matching: Vec<String> = names
                            .into_iter()
                            .filter(|name| context.is_accessed(name))
                            .collect();

                        if !matching.is_empty() {
                            let name_refs: Vec<&str> =
                                matching.iter().map(std::string::String::as_str).collect();
                            let store_decls = create_store_declarations(&name_refs);
                            str.append_left(inject_pos, &store_decls);
                        }
                    }
                }
            }

            oxc::Statement::LabeledStatement(labeled) if labeled.label.name == "$" => {
                let names = extract_names_from_labeled_body(&labeled.body);
                let matching: Vec<String> = names
                    .into_iter()
                    .filter(|name| context.is_accessed(name))
                    .collect();

                if !matching.is_empty() {
                    let inject_pos = labeled.span.end + offset;
                    let name_refs: Vec<&str> =
                        matching.iter().map(std::string::String::as_str).collect();
                    let store_decls = create_store_declarations(&name_refs);
                    str.append_left(inject_pos, &store_decls);
                }
            }

            _ => {}
        }
    }

    collect_module_script_import_stores(module_program, context);

    // Official `attachStoreValueDeclarationOfImportsToRenderFn` iterates
    // `importStatements` in IMPORT-DECLARATION order (not first-`$store`-use
    // order), which is exactly the collection order here (instance imports in
    // program order, then module imports). Just dedup preserving that order.
    context.dedup_imports_preserving_order();
    if !context.import_store_names.is_empty() {
        let store_decls = create_store_declarations(&context.import_store_names);
        str.append_right(offset, &store_decls);
    }
}

/// Collect import names that are used as stores from an import declaration.
///
/// In Svelte 5 mode, `derived` imported from `svelte/store` is excluded because
/// it's a known rune function, not a store.
fn collect_import_store_names(import: &oxc::ImportDeclaration, context: &mut StoreScanContext<'_>) {
    // Skip type-only imports
    if import.import_kind.is_type() {
        return;
    }

    // Check if this is an import from 'svelte/store'
    let is_svelte_store_import = import.source.value.as_str() == "svelte/store";

    if let Some(ref specifiers) = import.specifiers {
        for spec in specifiers {
            let (local_name, is_derived_import) = match spec {
                oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                    (s.local.name.as_str(), false)
                }
                oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                    (s.local.name.as_str(), false)
                }
                oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                    // Skip type-only import specifiers
                    if s.import_kind.is_type() {
                        continue;
                    }
                    let is_derived = is_svelte_store_import && s.local.name == "derived";
                    (s.local.name.as_str(), is_derived)
                }
            };

            // In Svelte 5+, skip `derived` from `svelte/store` (it's a rune, not a store)
            // TODO: This should be conditional on Svelte 5 mode, but for now we always
            // exclude it since the fixture tests default to Svelte 5.
            if is_derived_import {
                continue;
            }

            context.push_import_if_accessed(local_name);
        }
    }
}

/// Find the module script in the source and collect import names that are used as stores.
///
/// This allows the instance script to inject store subscriptions for module-level
/// imports at the $$render function body start.
fn collect_module_script_import_stores(
    program: Option<&oxc::Program>,
    context: &mut StoreScanContext<'_>,
) {
    let Some(program) = program else { return };
    for stmt in &program.body {
        if let oxc::Statement::ImportDeclaration(import) = stmt {
            collect_import_store_names(import, context);
        }
    }
}

/// Collect store declarations for module-script imports.
///
/// This is called when there is no instance script. It collects all
/// module-script import names that are used as stores (`$name`) in the source
/// and returns the store subscription declarations string to inject at the
/// start of the $$render async wrapper.
pub fn collect_module_import_store_declarations(
    context: &mut StoreScanContext<'_>,
    module_program: Option<&oxc::Program>,
) -> String {
    context.resolve_accessed_stores();
    if context.accessed_stores.is_empty() {
        return String::new();
    }

    context.begin_import_collection();
    collect_module_script_import_stores(module_program, context);

    context.import_store_names.sort_unstable();
    context.import_store_names.dedup();

    if context.import_store_names.is_empty() {
        return String::new();
    }

    create_store_declarations(&context.import_store_names)
}

/// Inject store subscription declarations for variable declarations only.
///
/// This is used for module scripts where import-based subscriptions should NOT
/// be injected (they need to go inside the $$render function body instead).
/// Reuses an already-parsed module program (callers parse the module
/// script once and pass the result here, avoiding a second OXC parse).
pub(super) fn inject_store_subscriptions_vars_only_with_program(
    program: &oxc::Program,
    offset: u32,
    context: &mut StoreScanContext<'_>,
    str: &mut MagicString<'_>,
) {
    if !context.has_dollar() {
        return;
    }

    context.resolve_accessed_stores();
    if context.accessed_stores.is_empty() {
        return;
    }

    for stmt in &program.body {
        let var_decl = match stmt {
            oxc::Statement::VariableDeclaration(var_decl) => var_decl,
            oxc::Statement::ExportDeclaration(export) => match &export.declaration {
                oxc::Declaration::VariableDeclaration(var_decl) => var_decl,
                _ => continue,
            },
            _ => continue,
        };

        let last_decl_end = var_decl
            .declarations
            .last()
            .map_or(var_decl.span.end, |d| d.span.end);
        let inject_pos = last_decl_end + offset;

        for declarator in &var_decl.declarations {
            let names = extract_all_names_from_binding_pattern(&declarator.id);
            let matching: Vec<String> = names
                .into_iter()
                .filter(|name| context.is_accessed(name))
                .collect();

            if !matching.is_empty() {
                let name_refs: Vec<&str> =
                    matching.iter().map(std::string::String::as_str).collect();
                let store_decls = create_store_declarations(&name_refs);
                str.append_left(inject_pos, &store_decls);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;
    use super::*;

    fn scan_context(source: &str, cache_candidates: bool) -> StoreScanContext<'_> {
        let spans = find_script_spans(source);
        StoreScanContext::new(source, cache_candidates, spans.module(), spans.instance())
    }

    fn assert_names(context: &StoreScanContext<'_>, expected: &[&str]) {
        assert_eq!(context.accessed_stores, expected.iter().copied().collect());
    }

    #[test]
    fn script_spans_round_trip() {
        let spans = ScriptSpans::new(Some((3, 17)), Some((29, 41)));
        assert_eq!(spans.module(), Some((3, 17)));
        assert_eq!(spans.instance(), Some((29, 41)));
    }

    #[test]
    fn collect_loose_dollar_names_strips_dollar_skips_comments_strings_members() {
        // Base names of every `$X` (rune-filter intentionally NOT applied —
        // mirrors upstream's broken `is_rune`), but skipping comments, string
        // literals, member access, and `$$`-prefixed forms.
        let got = collect_loose_dollar_names_from_script(
            "let x = $state(0);\n\
             // $commented\n\
             const s = '$stringy';\n\
             foo.$member;\n\
             $$props;\n\
             const d = $derived($state);",
        );
        assert!(got.contains("state"), "$state base captured: {got:?}");
        assert!(got.contains("derived"), "$derived base captured: {got:?}");
        assert!(!got.contains("commented"), "line comment skipped: {got:?}");
        assert!(!got.contains("stringy"), "string literal skipped: {got:?}");
        assert!(!got.contains("member"), "member access skipped: {got:?}");
        assert!(!got.contains("props"), "$$-prefixed skipped: {got:?}");
    }

    #[test]
    fn cached_candidates_match_fresh_resolution_across_script_facts() {
        assert_eq!(std::mem::size_of::<StoreCandidate>(), 8);
        let source = "<script module>$ignored</script><script>\
            const state=$state(0); function f($local,$shadowed){return $local+$shadowed+$outside}\
            const text='prefix $string'; // $comment\n</script>{$local}{$outside}";
        let function_start = source.find("function f").unwrap() as u32;
        let function_end = source.find("const text").unwrap() as u32;
        let rune_pos = source.find("$state(0)").unwrap() as u32;

        let mut context = scan_context(source, true);
        for name in ["local", "shadowed"] {
            context
                .dollar_param_shadow
                .insert(name.to_string(), vec![(function_start, function_end)]);
        }
        context.self_named_rune_calls = vec![rune_pos];
        context.resolve_accessed_stores();
        assert_names(&context, &["local", "outside", "string"]);

        let candidate_capacity = context.candidates.capacity();
        context.dollar_param_shadow.clear();
        context.self_named_rune_calls.clear();
        context.resolve_accessed_stores();
        assert_names(
            &context,
            &["local", "outside", "shadowed", "state", "string"],
        );
        assert_eq!(context.candidates.capacity(), candidate_capacity);

        let mut direct = scan_context(source, false);
        direct.resolve_accessed_stores();
        assert_names(
            &direct,
            &["local", "outside", "shadowed", "state", "string"],
        );
        assert!(direct.candidates.is_empty() && !direct.candidates_scanned);
    }

    #[test]
    fn script_fact_resets_do_not_leak_between_module_and_instance() {
        let source = "<script module>let state=$state(0)</script>\
            <script>let props=$props();function f($local){return $local}</script>{$visible}";
        let module_rune = source.find("$state(0)").unwrap() as u32;
        let instance_rune = source.find("$props()").unwrap() as u32;
        let function_start = source.find("function f").unwrap() as u32;
        let function_end = source.rfind("</script>").unwrap() as u32;
        let mut context = scan_context(source, true);

        context.begin_script_facts();
        context.add_self_named_rune_call(module_rune);
        context.finish_script_facts();
        context.resolve_accessed_stores();
        assert_names(&context, &["local", "props", "visible"]);

        context.begin_script_facts();
        context.add_self_named_rune_call(instance_rune);
        context.add_dollar_param_shadow("$local", (function_start, function_end));
        context.finish_script_facts();
        context.resolve_accessed_stores();
        assert_names(&context, &["visible"]);
        assert!(!context.self_named_rune_calls.contains(&module_rune));
        assert_eq!(context.dollar_param_shadow.len(), 1);

        let module_only = "<script module>const local=$state(0)</script>{$state}";
        let mut context = scan_context(module_only, true);
        context.self_named_rune_calls = vec![module_only.find("$state(0)").unwrap() as u32];
        context.resolve_accessed_stores();
        assert_names(&context, &["state"]);
    }

    #[test]
    fn no_dollar_keeps_candidate_scan_lazy() {
        let source = "<script>const value = 1;</script><p>{value}</p>";
        let mut context = scan_context(source, false);
        assert_eq!(context.has_dollar, None);
        assert!(!context.has_dollar());
        assert!(!context.candidates_scanned);
    }

    #[test]
    fn script_span_scan_reuses_module_and_instance_ranges() {
        assert_eq!(std::mem::size_of::<ScriptSpans>(), 16);
        let empty = ScriptSpans::default();
        assert_eq!(empty.module(), None);
        assert_eq!(empty.instance(), None);
        let source = "lead<scripts>$fake</scripts>\
            <script context='module'>\n$module\n</script>\
            <script>\n// $comment\n$instance\n</script>";
        let spans = find_script_spans(source);
        let module_tag = source.find("<script context='module'>").unwrap();
        let module_body = module_tag + source[module_tag..].find('>').unwrap() + 1;
        let module_end = module_body + source[module_body..].find("</script").unwrap();
        assert_eq!(spans.module(), Some((module_body, module_end)));
        let instance_tag = source.rfind("<script>").unwrap();
        let instance_body = instance_tag + "<script>".len();
        let instance_end = instance_body + source[instance_body..].find("</script").unwrap();
        assert_eq!(spans.instance(), Some((instance_body, instance_end)));
        assert!(instance_script_has_comment(source, spans.instance()));

        let mut blanked = source.as_bytes().to_vec();
        blank_module_script_body(spans.module(), &mut blanked);
        blank_instance_script_comments(source, spans.instance(), &mut blanked);
        let blanked = String::from_utf8(blanked).unwrap();
        assert!(!blanked.contains("$module"));
        assert!(!blanked.contains("$comment"));
        assert!(blanked.contains("$instance"));
    }

    #[test]
    fn test_store_subscription_basic() {
        let source = "<script>\n    const store = writable([]);\n</script>\n{$store}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(store)"),
            "Output should contain store subscription"
        );
    }

    #[test]
    fn regex_literal_store_names_do_not_inject_subscriptions_or_unbalance_markers() {
        let source = r#"<script>
export let mystore;
const re = /\$mystore/;
const inClass = /[/]\$mystore/;
const escaped = /a\/b\$mystore/;
const afterDivision = 6 / 2 / /\$mystore/.source.length;
const other = writable(0);
$other;
</script>
<b>{mystore}{re.source}{inClass.source}{escaped.source}{afterDivision}</b>"#;
        let result = run_svelte2tsx(source);

        assert!(
            !result.code.contains("__sveltets_2_store_get(mystore)"),
            "a regex body is not a store reference:\n{}",
            result.code
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(other)"),
            "a real store reference beside the regexes must remain visible:\n{}",
            result.code
        );
        assert_eq!(
            result.code.matches("/*Ωignore_startΩ*/").count(),
            result.code.matches("/*Ωignore_endΩ*/").count(),
            "svelte2tsx markers must remain balanced:\n{}",
            result.code
        );
    }

    #[test]
    fn test_store_import_basic() {
        let source = "<script>\n    import storeA from './store';\n</script>\n{$storeA}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(storeA)"),
            "Output should contain store subscription for import"
        );
    }

    #[test]
    fn test_store_no_rune_injection() {
        let source = "<script>\nlet { a } = $props();\nlet x = $state(0);\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            !result.code.contains("__sveltets_2_store_get"),
            "Output should NOT contain store subscriptions for rune declarations"
        );
    }

    #[test]
    fn test_store_import_multi() {
        let source = "<script>\n    import storeA from './store';\n    import { storeB } from './store';\n    import { storeB as storeC } from './store';\n</script>\n\n<p>{$storeA}</p>\n<p>{$storeB}</p>\n<p>{$storeC}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(storeA)"),
            "should have storeA subscription"
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(storeB)"),
            "should have storeB subscription"
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(storeC)"),
            "should have storeC subscription"
        );

        // Verify the store subscriptions appear at the right position (after function $$render() {)
        let render_start = result.code.find("function $$render() {").unwrap();
        let store_sub_start = result.code.find("__sveltets_2_store_get(storeA)").unwrap();
        assert!(
            store_sub_start > render_start,
            "store subscriptions should be inside $$render body"
        );
    }

    #[test]
    fn test_store_from_module() {
        let source = "<script context=\"module\">\n    import {store1, store2} from './store';\n    const store3 = writable('');\n    const store4 = writable('');\n</script>\n\n<script>\n    $store1;\n    $store3;\n</script>\n\n<p>{$store2}</p>\n<p>{$store4}</p>";
        let result = run_svelte2tsx(source);
        // Module-level const declarations should get subscriptions
        assert!(
            result.code.contains("__sveltets_2_store_get(store3)"),
            "should have store3 subscription"
        );
        assert!(
            result.code.contains("__sveltets_2_store_get(store4)"),
            "should have store4 subscription"
        );
    }

    #[test]
    fn test_store_reactive_assignment() {
        let source = "<script>\n    $: store = fromSomewhere();\n</script>\n<p>{$store}</p>";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(store)"),
            "should have store subscription for reactive assignment"
        );
    }

    #[test]
    fn test_store_derived_import_svelte5() {
        // In Svelte 5, `derived` from `svelte/store` is a rune, not a store
        let source = "<script>\n    import { derived } from 'svelte/store';\n\n    let a = $derived(1);\n</script>";
        let result = run_svelte2tsx(source);
        assert!(
            !result.code.contains("__sveltets_2_store_get(derived)"),
            "should NOT have derived store subscription in Svelte 5 mode"
        );
    }

    #[test]
    fn props_id_rune_next_to_props_declaration_is_not_a_store() {
        for decl in [
            "let props = $props();",
            "let { props } = $props();",
            "let {...props} = $props();",
            "let props: MyProps = $props();",
        ] {
            let source =
                format!("<script>\n    {decl}\n    let id = $props.id();\n</script>\n{{id}}");
            let result = run_svelte2tsx(&source);
            assert!(
                !result.code.contains("__sveltets_2_store_get(props)"),
                "`$props.id()` must not subscribe `props` as a store for `{decl}`:\n{}",
                result.code
            );
        }
    }

    #[test]
    fn props_id_rune_without_props_rune_declaration_still_subscribes() {
        // Upstream sample `props-variable-and-$props.id-not-$props-init.v5`: the
        // filter only applies when `props` really comes from `$props()`.
        let source =
            "<script>\n    let props = {};\n    let id = $props.id();\n</script>\n{id} {props}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(props)"),
            "non-rune `props` binding keeps its store subscription:\n{}",
            result.code
        );
    }

    #[test]
    fn state_snapshot_member_access_still_subscribes() {
        let source = "<script>\n    let state = $state([]);\n    const snap = $state.snapshot(state);\n</script>\n{snap}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(state)"),
            "only `$props.id()` is filtered — `$state.snapshot` keeps upstream's behaviour:\n{}",
            result.code
        );
    }

    #[test]
    fn genuine_store_next_to_props_id_rune_still_subscribes() {
        let source = "<script>\n    import { count } from './stores';\n    let props = $props();\n    let id = $props.id();\n</script>\n{$count} {id}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(count)"),
            "a real store next to `$props.id()` still auto-subscribes:\n{}",
            result.code
        );
        assert!(
            !result.code.contains("__sveltets_2_store_get(props)"),
            "`props` must stay unsubscribed:\n{}",
            result.code
        );
    }

    #[test]
    fn test_store_multiple_variable_declaration() {
        let source = "<script>\n    const store1 = '', store2 = '';\n    const { store3, store4 } = '', [ store5, store6 ] = '';\n    $: ({store7, store8} = '');\n    $: [store9, store10] = '';\n</script>\n\n{$store1}\n{$store2}\n{$store3}\n{$store4}\n{$store5}\n{$store6}\n{$store7}\n{$store8}\n{$store9}\n{$store10}";
        let result = run_svelte2tsx(source);
        // Check each store subscription exists
        for i in 1..=10 {
            let name = format!("store{}", i);
            assert!(
                result
                    .code
                    .contains(&format!("__sveltets_2_store_get({})", name)),
                "should have {} subscription",
                name
            );
        }
        // Check that store1 and store2 have SEPARATE ignore blocks
        let store1_block = "/*\u{03A9}ignore_start\u{03A9}*/;let $store1 = __sveltets_2_store_get(store1);/*\u{03A9}ignore_end\u{03A9}*/";
        let store2_block = "/*\u{03A9}ignore_start\u{03A9}*/;let $store2 = __sveltets_2_store_get(store2);/*\u{03A9}ignore_end\u{03A9}*/";
        assert!(
            result.code.contains(store1_block),
            "store1 should have separate ignore block"
        );
        assert!(
            result.code.contains(store2_block),
            "store2 should have separate ignore block"
        );
    }

    #[test]
    fn store_scan_context_preserves_instance_then_module_import_order_at_scale() {
        let imports = |prefix| {
            (0..64)
                .map(|index| format!("{prefix}{index}"))
                .collect::<Vec<_>>()
                .join(", ")
        };
        let module_imports = imports("moduleStore");
        let instance_imports = imports("instanceStore");
        let uses = (0..64)
            .map(|index| format!("{{$instanceStore{index}}}{{$moduleStore{index}}}"))
            .collect::<String>();
        let source = format!(
            "<script module>import {{ {module_imports} }} from './module'</script>\
             <script>import {{ {instance_imports} }} from './instance'</script>{uses}"
        );
        let result = run_svelte2tsx(&source);

        let mut previous = 0;
        for prefix in ["instanceStore", "moduleStore"] {
            for index in 0..64 {
                let declaration = format!("__sveltets_2_store_get({prefix}{index})");
                assert_eq!(
                    result.code.matches(&declaration).count(),
                    1,
                    "{declaration} must be emitted exactly once"
                );
                let position = result.code.find(&declaration).unwrap();
                assert!(position >= previous, "import declaration order changed");
                previous = position;
            }
        }
    }
}
