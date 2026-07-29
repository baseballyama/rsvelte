//! Store auto-subscription: scanning `$name` references and injecting
//! `let $name = __sveltets_2_store_get(name);` declarations.

use std::collections::HashMap;
use std::collections::HashSet;
use std::fmt::Write as _;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_ast_visit::Visit;
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

use super::ast_utils::{collect_binding_names, extract_all_names_from_binding_pattern};
use super::reactive::extract_names_from_labeled_body;
use super::runes::excluded_rune_init;

use super::super::magic_string::MagicString;

/// Reserved names that should not be treated as store references.
const RESERVED_STORE_NAMES: &[&str] = &["$$props", "$$restProps", "$$slots"];

/// True when the source has a `<script context="module">` / `<script module>` tag.
fn has_module_script(source: &str) -> bool {
    find_module_script_span(source).is_some()
}

/// Locate the module `<script>` tag, returning `(body_start, body_end)` — the
/// byte range of its inner content (between `>` and `</script>`).
fn find_module_script_span(source: &str) -> Option<(usize, usize)> {
    let bytes = source.as_bytes();
    let mut search = 0usize;
    while let Some(rel) = source[search..].find("<script") {
        let tag_start = search + rel;
        // Find the end of the opening tag `>`.
        let gt = tag_start + source[tag_start..].find('>')?;
        let open_tag = &source[tag_start..gt];
        // `module` either as a bare attribute or `context="module"` / `context='module'`.
        let is_module = open_tag.contains("context=\"module\"")
            || open_tag.contains("context='module'")
            || open_tag
                .split(|c: char| c.is_ascii_whitespace() || c == '>' || c == '=')
                .any(|tok| tok == "module");
        if is_module && !open_tag.starts_with("<scripts") {
            let body_start = gt + 1;
            let body_end = source[body_start..]
                .find("</script")
                .map(|e| body_start + e)
                .unwrap_or(bytes.len());
            return Some((body_start, body_end));
        }
        search = gt + 1;
    }
    None
}

/// Blank the inner content of the module `<script>` so a byte-level store scan
/// never sees module-internal `$name` references.
fn blank_module_script_body(source: &str, buf: &mut [u8]) {
    if let Some((start, end)) = find_module_script_span(source) {
        for b in &mut buf[start..end] {
            if *b != b'\n' && *b != b'\r' {
                *b = b' ';
            }
        }
    }
}

/// Locate the instance `<script>` tag (the one WITHOUT `module` /
/// `context="module"`), returning `(body_start, body_end)`.
fn find_instance_script_span(source: &str) -> Option<(usize, usize)> {
    let bytes = source.as_bytes();
    let mut search = 0usize;
    while let Some(rel) = source[search..].find("<script") {
        let tag_start = search + rel;
        let gt = tag_start + source[tag_start..].find('>')?;
        let open_tag = &source[tag_start..gt];
        let is_module = open_tag.contains("context=\"module\"")
            || open_tag.contains("context='module'")
            || open_tag
                .split(|c: char| c.is_ascii_whitespace() || c == '>' || c == '=')
                .any(|tok| tok == "module");
        if !is_module && !open_tag.starts_with("<scripts") {
            let body_start = gt + 1;
            let body_end = source[body_start..]
                .find("</script")
                .map(|e| body_start + e)
                .unwrap_or(bytes.len());
            return Some((body_start, body_end));
        }
        search = gt + 1;
    }
    None
}

/// Cheap pre-check: does the instance script body contain a `//` or `/*`
/// comment-opener? (Gates the buffer copy in `collect_store_references`.)
fn instance_script_has_comment(source: &str) -> bool {
    if !source.contains("<script") {
        return false;
    }
    match find_instance_script_span(source) {
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
fn blank_instance_script_comments(source: &str, buf: &mut [u8]) {
    let (start, end) = match find_instance_script_span(source) {
        Some(s) => s,
        None => return,
    };
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
pub(super) fn collect_loose_dollar_names_from_script(text: &str) -> HashSet<String> {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut names = HashSet::new();
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
        names.insert(base.to_string());
        i = end;
    }
    names
}

pub(super) fn collect_store_references(source: &str) -> HashSet<String> {
    // No parsed program here (import-only module path): there are no self-named
    // rune-call callees to exclude, so an empty position set is exact.
    collect_store_references_with_shadow(source, &HashMap::new(), &HashSet::new())
}

pub(super) fn collect_store_references_with_shadow(
    source: &str,
    shadow: &HashMap<String, Vec<(u32, u32)>>,
    self_named_rune_calls: &HashSet<u32>,
) -> HashSet<String> {
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
    let needs_blank =
        source.contains("<!--") || has_module_script(source) || instance_script_has_comment(source);
    let source: &str = if needs_blank {
        let mut buf = source.as_bytes().to_vec();
        let mut j = 0usize;
        while let Some(rel) = source[j..].find("<!--") {
            let start = j + rel;
            let end = source[start..]
                .find("-->")
                .map(|e| start + e + 3)
                .unwrap_or(buf.len());
            for b in &mut buf[start..end] {
                if *b != b'\n' && *b != b'\r' {
                    *b = b' ';
                }
            }
            j = end;
        }
        blank_module_script_body(source, &mut buf);
        blank_instance_script_comments(source, &mut buf);
        blanked = String::from_utf8(buf).unwrap_or_else(|_| source.to_string());
        &blanked
    } else {
        source
    };
    let mut stores = HashSet::new();
    let bytes = source.as_bytes();
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
            // `use:$store` / `transition:$x` / `in:$x` / `out:$x` / `animate:$x`
            // — the `$name` is a DIRECTIVE NAME (in an element opener), not a
            // store auto-subscription. Official collects template stores from
            // expression VALUES, never directive names.
            if prev == b':' {
                let kw_end = pos - 1;
                let mut k = kw_end;
                while k > 0 && bytes[k - 1].is_ascii_lowercase() {
                    k -= 1;
                }
                let kw = &source[k..kw_end];
                let boundary_ok =
                    k == 0 || matches!(bytes[k - 1], b' ' | b'\t' | b'\n' | b'\r' | b'<');
                if boundary_ok && matches!(kw, "use" | "transition" | "in" | "out" | "animate") {
                    i = next;
                    continue;
                }
            }
        }
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
        let full = &source[pos..end];
        // Object-literal property KEY (`{ $name: value }` / after a `,`): the
        // `$name` is a property name, not a store reference. Official walks the
        // parsed AST and skips `Property.key` identifiers, so e.g. a row object
        // `{ $expanded: …, $selected: … }` must not turn `expanded` / `selected`
        // into store auto-subscriptions. Detected by `$name` followed (skipping
        // whitespace) by `:` AND preceded (skipping whitespace) by `{` or `,`
        // (which excludes a ternary `cond ? $name : x`, where the preceding
        // token is `?`).
        if is_object_property_key(bytes, pos, end) {
            i = end;
            continue;
        }
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
        if matches!(full, "$state" | "$props" | "$derived")
            && self_named_rune_calls.contains(&(pos as u32))
        {
            i = end;
            continue;
        }
        let base = &source[next..end];
        // A `$name` whose `$`-prefixed binding (a function/arrow parameter)
        // lexically encloses this position is a LOCAL binding reference, not a
        // store auto-subscription. Mirrors official `resolveStore`, which walks
        // the scope chain and skips a `$name` reference declared in any
        // enclosing `scope.declared` set.
        if !is_dollar_binding_shadowed(shadow, base, pos) {
            stores.insert(base.to_string());
        }
        i = end;
    }
    stores
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
    match shadow.get(name) {
        Some(spans) => {
            let p = pos as u32;
            spans.iter().any(|&(s, e)| p >= s && p < e)
        }
        None => false,
    }
}

/// Collect, from the instance-script AST, every `$`-prefixed function / arrow
/// parameter binding mapped (sans `$`) to the source span of its enclosing
/// function. A `$name` reference inside such a span is a local binding read, not
/// a store auto-subscription (official tracks this via `Scope.declared`).
pub(super) fn collect_dollar_param_shadow(
    program: &oxc::Program,
    offset: u32,
) -> HashMap<String, Vec<(u32, u32)>> {
    let mut collector = DollarParamShadowCollector {
        offset,
        spans: HashMap::new(),
    };
    collector.visit_program(program);
    collector.spans
}

struct DollarParamShadowCollector {
    offset: u32,
    spans: HashMap<String, Vec<(u32, u32)>>,
}

impl DollarParamShadowCollector {
    fn add_params(&mut self, params: &oxc::FormalParameters, span: oxc_span::Span) {
        let src_span = (span.start + self.offset, span.end + self.offset);
        for item in params.items.iter() {
            let mut names = Vec::new();
            collect_binding_names(&item.pattern, &mut names);
            for n in names {
                if let Some(base) = n.strip_prefix('$') {
                    self.spans
                        .entry(base.to_string())
                        .or_default()
                        .push(src_span);
                }
            }
        }
    }
}

impl<'a> Visit<'a> for DollarParamShadowCollector {
    fn visit_function(&mut self, it: &oxc::Function<'a>, flags: oxc_syntax::scope::ScopeFlags) {
        self.add_params(&it.params, it.span);
        oxc_ast_visit::walk::walk_function(self, it, flags);
    }

    fn visit_arrow_function_expression(&mut self, it: &oxc::ArrowFunctionExpression<'a>) {
        self.add_params(&it.params, it.span);
        oxc_ast_visit::walk::walk_arrow_function_expression(self, it);
    }
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
        let _ = write!(result, ";let ${} = __sveltets_2_store_get({});", name, name);
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
    program: &oxc::Program,
    offset: u32,
) -> HashSet<u32> {
    let mut positions = HashSet::new();
    let mut visit_var_decl = |var_decl: &oxc::VariableDeclaration| {
        for declarator in var_decl.declarations.iter() {
            let Some(init) = declarator.init.as_ref() else {
                continue;
            };
            if let Some(call) = excluded_rune_init(init, &declarator.id)
                && let oxc::Expression::Identifier(callee) = &call.callee
            {
                positions.insert(callee.span.start + offset);
            }
        }
    };
    for stmt in program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(vd) => visit_var_decl(vd),
            oxc::Statement::ExportNamedDeclaration(ex) => {
                if let Some(oxc::Declaration::VariableDeclaration(vd)) = &ex.declaration {
                    visit_var_decl(vd);
                }
            }
            _ => {}
        }
    }
    positions
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
    offset: u32,
    source: &str,
    str: &mut MagicString,
) {
    // Exclude `$name` references that are shadowed by a `$`-prefixed function /
    // arrow parameter binding in the instance script (official `resolveStore`
    // scope-chain check). The shadow map is keyed by source byte ranges.
    let shadow = collect_dollar_param_shadow(program, offset);
    let self_named_rune_calls = collect_self_named_rune_call_positions(program, offset);
    let accessed_stores =
        collect_store_references_with_shadow(source, &shadow, &self_named_rune_calls);
    if accessed_stores.is_empty() {
        return;
    }

    let mut import_store_names: Vec<String> = Vec::new();

    for stmt in program.body.iter() {
        match stmt {
            oxc::Statement::VariableDeclaration(var_decl) => {
                let last_decl_end = var_decl
                    .declarations
                    .last()
                    .map(|d| d.span.end)
                    .unwrap_or(var_decl.span.end);
                let inject_pos = last_decl_end + offset;

                for declarator in var_decl.declarations.iter() {
                    let names = extract_all_names_from_binding_pattern(&declarator.id);
                    let matching: Vec<String> = names
                        .into_iter()
                        .filter(|name| accessed_stores.contains(name))
                        .collect();

                    if !matching.is_empty() {
                        let name_refs: Vec<&str> = matching.iter().map(|s| s.as_str()).collect();
                        let store_decls = create_store_declarations(&name_refs);
                        str.append_left(inject_pos, &store_decls);
                    }
                }
            }

            oxc::Statement::ImportDeclaration(import) => {
                collect_import_store_names(import, &accessed_stores, &mut import_store_names);
            }

            oxc::Statement::ExportNamedDeclaration(export) => {
                if let Some(ref decl) = export.declaration
                    && let oxc::Declaration::VariableDeclaration(var_decl) = decl
                {
                    let last_decl_end = var_decl
                        .declarations
                        .last()
                        .map(|d| d.span.end)
                        .unwrap_or(var_decl.span.end);
                    let inject_pos = last_decl_end + offset;

                    for declarator in var_decl.declarations.iter() {
                        let names = extract_all_names_from_binding_pattern(&declarator.id);
                        let matching: Vec<String> = names
                            .into_iter()
                            .filter(|name| accessed_stores.contains(name))
                            .collect();

                        if !matching.is_empty() {
                            let name_refs: Vec<&str> =
                                matching.iter().map(|s| s.as_str()).collect();
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
                    .filter(|n| accessed_stores.contains(n))
                    .collect();

                if !matching.is_empty() {
                    let inject_pos = labeled.span.end + offset;
                    let name_refs: Vec<&str> = matching.iter().map(|s| s.as_str()).collect();
                    let store_decls = create_store_declarations(&name_refs);
                    str.append_left(inject_pos, &store_decls);
                }
            }

            _ => {}
        }
    }

    collect_module_script_import_stores(source, &accessed_stores, &mut import_store_names);

    // Official `attachStoreValueDeclarationOfImportsToRenderFn` iterates
    // `importStatements` in IMPORT-DECLARATION order (not first-`$store`-use
    // order), which is exactly the collection order here (instance imports in
    // program order, then module imports). Just dedup preserving that order.
    {
        let mut seen = std::collections::HashSet::new();
        import_store_names.retain(|n| seen.insert(n.clone()));
    }
    if !import_store_names.is_empty() {
        let name_refs: Vec<&str> = import_store_names.iter().map(|s| s.as_str()).collect();
        let store_decls = create_store_declarations(&name_refs);
        str.append_right(offset, &store_decls);
    }
}

/// Collect import names that are used as stores from an import declaration.
///
/// In Svelte 5 mode, `derived` imported from `svelte/store` is excluded because
/// it's a known rune function, not a store.
fn collect_import_store_names(
    import: &oxc::ImportDeclaration,
    accessed_stores: &HashSet<String>,
    import_store_names: &mut Vec<String>,
) {
    // Skip type-only imports
    if import.import_kind.is_type() {
        return;
    }

    // Check if this is an import from 'svelte/store'
    let is_svelte_store_import = import.source.value.as_str() == "svelte/store";

    if let Some(ref specifiers) = import.specifiers {
        for spec in specifiers.iter() {
            let (local_name, is_derived_import) = match spec {
                oxc::ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => {
                    (s.local.name.to_string(), false)
                }
                oxc::ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => {
                    (s.local.name.to_string(), false)
                }
                oxc::ImportDeclarationSpecifier::ImportSpecifier(s) => {
                    // Skip type-only import specifiers
                    if s.import_kind.is_type() {
                        continue;
                    }
                    let is_derived = is_svelte_store_import && s.local.name == "derived";
                    (s.local.name.to_string(), is_derived)
                }
            };

            // In Svelte 5+, skip `derived` from `svelte/store` (it's a rune, not a store)
            // TODO: This should be conditional on Svelte 5 mode, but for now we always
            // exclude it since the fixture tests default to Svelte 5.
            if is_derived_import {
                continue;
            }

            if accessed_stores.contains(&local_name) {
                import_store_names.push(local_name);
            }
        }
    }
}

/// Find the module script in the source and collect import names that are used as stores.
///
/// This allows the instance script to inject store subscriptions for module-level
/// imports at the $$render function body start.
fn collect_module_script_import_stores(
    source: &str,
    accessed_stores: &HashSet<String>,
    import_store_names: &mut Vec<String>,
) {
    // Fast path: no `<script` substring → no module script.
    if !source.contains("<script") {
        return;
    }
    // Locate the module script body. `find_module_script_span` matches BOTH
    // `<script context="module">` and the Svelte 5 `<script module>` shorthand
    // (the old regex only matched the `context=` form, so `<script module>`
    // imports used as stores were never injected).
    let (content_start, close_tag) = match find_module_script_span(source) {
        Some(span) => span,
        None => return,
    };

    let raw_content = &source[content_start..close_tag];

    // Skip the OXC parse when there are no `import` declarations to find.
    if !raw_content.contains("import") {
        return;
    }

    let allocator = Allocator::default();
    let source_type = SourceType::mjs();
    let parser = OxcParser::new(&allocator, raw_content, source_type);
    let result = parser.parse();

    for stmt in result.program.body.iter() {
        if let oxc::Statement::ImportDeclaration(import) = stmt {
            collect_import_store_names(import, accessed_stores, import_store_names);
        }
    }
}

/// Collect store declarations for module-script imports.
///
/// This is called when there is no instance script. It collects all
/// module-script import names that are used as stores (`$name`) in the source
/// and returns the store subscription declarations string to inject at the
/// start of the $$render async wrapper.
pub fn collect_module_import_store_declarations(source: &str) -> String {
    let accessed_stores = collect_store_references(source);
    if accessed_stores.is_empty() {
        return String::new();
    }

    let mut import_store_names: Vec<String> = Vec::new();
    collect_module_script_import_stores(source, &accessed_stores, &mut import_store_names);

    import_store_names.sort();
    import_store_names.dedup();

    if import_store_names.is_empty() {
        return String::new();
    }

    let name_refs: Vec<&str> = import_store_names.iter().map(|s| s.as_str()).collect();
    create_store_declarations(&name_refs)
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
    source: &str,
    str: &mut MagicString,
) {
    let self_named_rune_calls = collect_self_named_rune_call_positions(program, offset);
    let accessed_stores =
        collect_store_references_with_shadow(source, &HashMap::new(), &self_named_rune_calls);
    if accessed_stores.is_empty() {
        return;
    }

    for stmt in program.body.iter() {
        if let oxc::Statement::VariableDeclaration(var_decl) = stmt {
            let last_decl_end = var_decl
                .declarations
                .last()
                .map(|d| d.span.end)
                .unwrap_or(var_decl.span.end);
            let inject_pos = last_decl_end + offset;

            for declarator in var_decl.declarations.iter() {
                let names = extract_all_names_from_binding_pattern(&declarator.id);
                let matching: Vec<String> = names
                    .into_iter()
                    .filter(|name| accessed_stores.contains(name))
                    .collect();

                if !matching.is_empty() {
                    let name_refs: Vec<&str> = matching.iter().map(|s| s.as_str()).collect();
                    let store_decls = create_store_declarations(&name_refs);
                    str.append_left(inject_pos, &store_decls);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::super::test_support::run_svelte2tsx;
    use super::*;

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
    fn test_store_subscription_basic() {
        let source = "<script>\n    const store = writable([]);\n</script>\n{$store}";
        let result = run_svelte2tsx(source);
        assert!(
            result.code.contains("__sveltets_2_store_get(store)"),
            "Output should contain store subscription"
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
}
