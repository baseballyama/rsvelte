//! `svelte/no-unused-props` — report Props members that are never read.
//!
//! Two paths share the usage-check + reporting logic (`report_unused`),
//! differing only in how the *declared* property set is resolved:
//!
//! - [`diagnostics`] (syntactic, no type backend) — **LOCAL-FLAT only**: a local
//!   `interface Props { … }` / `type Props = { … }` without `extends`,
//!   intersection (`&`), generics, or imported members.
//! - [`diagnostics_typed`] (type-aware, via [`crate::type_backend::TypeBackend`])
//!   — the fully-resolved property set from the TypeScript checker, covering
//!   `extends`, intersections, generics, imported types, and nested object
//!   props. Backed by `tsgo` in the `rsvelte_lint_types` crate.
//!
//! Both handle the destructure form (`const { a, b }: Props = $props()`) and
//! the whole-object form (`const props: Props = $props()`).

use std::collections::HashSet;
use std::path::Path;

use crate::type_backend::TypeId;
use rsvelte_core::svelte_check::diagnostic::Diagnostic;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::svelte_scan::{blank_comments, is_ident_byte, script_blocks, script_is_ts};
use crate::validator::{range_from_byte, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/no-unused-props",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    default_severity: Severity::Off,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: true,
    docs: "report Props properties that are never read",
    options_schema: Some(
        r#"[{"type":"object","properties":{"checkImportedTypes":{"type":"boolean"},"ignoreTypePatterns":{"type":"array","items":{"type":"string"}},"ignorePropertyPatterns":{"type":"array","items":{"type":"string"}},"allowUnusedNestedProperties":{"type":"boolean"}},"additionalProperties":false}]"#,
    ),
};

/// Type-aware variant of [`diagnostics`]: instead of resolving the Props type
/// body syntactically (which only works for local, flat types), the
/// fully-resolved property set is obtained from the TypeScript checker via
/// `backend`. This covers `extends`, intersection (`&`), generics, imported
/// types, and nested object props — the cases the syntactic path skips.
///
/// The "used" detection and report location are identical to the syntactic
/// path (shared via `report_unused`); only the *declared* set differs.
pub fn diagnostics_typed(
    source: &str,
    file: &Path,
    config: &LintConfig,
    backend: &mut dyn crate::type_backend::TypeBackend,
) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off || !script_is_ts(source) {
        return Vec::new();
    }
    // Full-fidelity graph walk when the backend exposes the type graph;
    // otherwise the flat property-list path (a documented degraded mode).
    if let Some(root) = backend.props_type() {
        diagnostics_typed_graph(source, file, config, severity, backend, root)
    } else {
        diagnostics_typed_flat(source, file, config, severity, backend)
    }
}

/// Flat path: declared = the resolved property-name list from `probe_props`.
/// Used when the backend has no type-graph support; cannot express
/// `checkImportedTypes` origin, base-type `ignoreTypePatterns`, index
/// signatures, or recursion into named/imported nested types.
fn diagnostics_typed_flat(
    source: &str,
    file: &Path,
    config: &LintConfig,
    severity: Severity,
    backend: &mut dyn crate::type_backend::TypeBackend,
) -> Vec<Diagnostic> {
    // Parsed options (see `options_schema`).
    let opts = config.options_for(META.name);
    let ignore_prop_patterns = compile_matchers(option_str_list(opts, "ignorePropertyPatterns"));
    let ignore_type_patterns = compile_matchers(option_str_list(opts, "ignoreTypePatterns"));
    let allow_unused_nested = option_bool(opts, "allowUnusedNestedProperties").unwrap_or(false);

    let li = LineIndex::new(source);
    let mut out = Vec::new();

    // The props type is a component-level fact; probe once.
    let Some(facts) = backend.probe_props() else {
        return Vec::new();
    };
    if facts.property_names.is_empty() {
        return Vec::new();
    }

    for block in script_blocks(source) {
        if block.open_tag_attrs.contains("module") {
            continue;
        }
        let content = &source[block.content_start..block.content_end];
        let blanked = blank_comments(content);

        let Some(props_info) = find_props_info(content, &blanked, block.content_start) else {
            continue;
        };
        // A rest element captures the remaining props, so nothing is "unused".
        if matches!(
            &props_info.form,
            PropForm::Destructure { has_rest: true, .. }
        ) {
            continue;
        }

        // Declared = resolved property names, minus any matched by an ignore
        // pattern (by property name, or by the rendered text of its type).
        let declared: Vec<String> = facts
            .property_names
            .iter()
            .filter(|name| {
                if any_match(&ignore_prop_patterns, name) {
                    return false;
                }
                if !ignore_type_patterns.is_empty()
                    && let Some(types) = facts.property_type(name)
                    && types.iter().any(|t| any_match(&ignore_type_patterns, t))
                {
                    return false;
                }
                true
            })
            .cloned()
            .collect();

        report_unused(
            &props_info.form,
            &declared,
            source,
            file,
            severity,
            &li,
            &mut out,
        );

        // Nested object props (whole-object form only): for a declared object
        // prop that is itself accessed (`props.user`), report members of the
        // nested object that are never read (`props.user.x`). Mirrors upstream's
        // default `allowUnusedNestedProperties: false`.
        if !allow_unused_nested
            && let PropForm::WholeObject {
                var_name,
                var_abs_offset,
            } = &props_info.form
            && !has_whole_object_spread(source, var_name)
        {
            for name in &declared {
                // Only recurse into props that are accessed at the top level.
                if !whole_object_member_used(source, var_name, name) {
                    continue;
                }
                let Some(types) = facts.property_type(name) else {
                    continue;
                };
                // The checker renders an object prop's type as an object literal
                // `{ a: T; b: U }`; parse its member names.
                let Some(nested) = types
                    .iter()
                    .find(|t| t.trim_start().starts_with('{'))
                    .and_then(|t| parse_prop_members(t, 0))
                else {
                    continue;
                };
                let owner = format!("{}.{}", var_name, name);
                for nested_name in &nested {
                    if any_match(&ignore_prop_patterns, nested_name) {
                        continue;
                    }
                    if !whole_object_member_used(source, &owner, nested_name) {
                        let abs = *var_abs_offset as u32;
                        out.push(Diagnostic {
                            file: file.to_path_buf(),
                            severity: to_dsev(severity),
                            range: range_from_byte(&li, abs, abs),
                            message: format!(
                                "'{}' in '{}' is an unused property.",
                                nested_name, name
                            ),
                            code: Some(META.name.to_string()),
                            source: "svelte",
                        });
                    }
                }
            }
        }
    }

    out
}

/// An ESLint `ignore*Patterns` matcher. Mirrors eslint-plugin-svelte's
/// `toRegExp` exactly: a `"/body/flags"` string becomes a regex; **any other
/// string is matched by exact equality** (NOT as a regex) — so e.g. `"^foo$"`
/// matches only the literal property name `^foo$`, never `foo`.
enum Matcher {
    Exact(String),
    Regex(regex::Regex),
}

fn compile_matchers(pats: Vec<String>) -> Vec<Matcher> {
    pats.into_iter()
        .map(|p| {
            // RE_REGEXP_STR = /^\/(.+)\/([A-Za-z]*)$/ — a `/body/flags` string is
            // a regex; anything else is matched by exact equality.
            if p.starts_with('/')
                && let Some(close) = p.rfind('/')
                && close > 0
            {
                let body = &p[1..close];
                let flags = &p[close + 1..];
                if !body.is_empty() && flags.chars().all(|c| c.is_ascii_alphabetic()) {
                    let mut src = String::new();
                    if flags.contains('i') {
                        src.push_str("(?i)");
                    }
                    if flags.contains('m') {
                        src.push_str("(?m)");
                    }
                    if flags.contains('s') {
                        src.push_str("(?s)");
                    }
                    src.push_str(body);
                    if let Ok(re) = regex::Regex::new(&src) {
                        return Matcher::Regex(re);
                    }
                }
            }
            Matcher::Exact(p)
        })
        .collect()
}

fn any_match(matchers: &[Matcher], s: &str) -> bool {
    matchers.iter().any(|m| match m {
        Matcher::Exact(e) => e == s,
        Matcher::Regex(re) => re.is_match(s),
    })
}

/// Graph path: a faithful port of upstream's recursive `checkUnusedProperties`.
/// Walks the props type via the backend's type graph, handling base types
/// (`extends`), per-property origin (`checkImportedTypes`), `ignore*Patterns`,
/// nested object props (named/imported included), and index signatures.
fn diagnostics_typed_graph(
    source: &str,
    file: &Path,
    config: &LintConfig,
    severity: Severity,
    backend: &mut dyn crate::type_backend::TypeBackend,
    root: TypeId,
) -> Vec<Diagnostic> {
    let opts = config.options_for(META.name);
    let ignore_prop = compile_matchers(option_str_list(opts, "ignorePropertyPatterns"));
    let ignore_type = compile_matchers(option_str_list(opts, "ignoreTypePatterns"));
    let check_imported = option_bool(opts, "checkImportedTypes").unwrap_or(false);
    let allow_unused_nested = option_bool(opts, "allowUnusedNestedProperties").unwrap_or(false);

    let li = LineIndex::new(source);
    let mut out = Vec::new();

    for block in script_blocks(source) {
        if block.open_tag_attrs.contains("module") {
            continue;
        }
        let content = &source[block.content_start..block.content_end];
        let blanked = blank_comments(content);
        let Some(props_info) = find_props_info(content, &blanked, block.content_start) else {
            continue;
        };

        // Assemble declared names + member-access usage paths per form.
        let (declared, raw_paths, raw_spreads, report_abs) = match &props_info.form {
            PropForm::Destructure {
                pattern_open_brace_abs,
                pattern_text,
                has_rest,
            } => {
                if *has_rest {
                    // A rest element captures every remaining prop.
                    continue;
                }
                let entries = parse_destructure_entries(pattern_text);
                if entries.is_empty() {
                    continue;
                }
                let declared: HashSet<String> = entries.iter().map(|(o, _)| o.clone()).collect();
                let mut paths = Vec::new();
                let mut spreads = Vec::new();
                // Only count occurrences AFTER the destructure: the local
                // bindings don't exist before it, so earlier matches of the
                // same identifier are unrelated (e.g. an `interface Props { my_foo: … }`
                // field, or the binding itself). Mirrors upstream walking the
                // variable's references (which exclude its declaration).
                let pat_hi = *pattern_open_brace_abs + pattern_text.len();
                for (orig, local) in &entries {
                    let (p, sp) = member_chains(source, local, Some((0, pat_hi)));
                    for mut c in p {
                        let mut full = vec![orig.clone()];
                        full.append(&mut c);
                        paths.push(full);
                    }
                    for mut c in sp {
                        let mut full = vec![orig.clone()];
                        full.append(&mut c);
                        spreads.push(full);
                    }
                }
                (declared, paths, spreads, *pattern_open_brace_abs as u32)
            }
            PropForm::WholeObject {
                var_name,
                var_abs_offset,
            } => {
                let (mut paths, spreads) = member_chains(source, var_name, None);
                // Drop empty (whole-object) chains: they come from the
                // declaration `let props =` / `$props()` itself, and an empty
                // path is a prefix of every other path — it would otherwise
                // absorb all member-access paths in `normalize_used_paths`.
                // (Spreads keep their empty chain — `{...props}` means all-used.)
                paths.retain(|c| !c.is_empty());
                (HashSet::new(), paths, spreads, *var_abs_offset as u32)
            }
        };

        let used_paths = normalize_used_paths(raw_paths, allow_unused_nested);
        let used_spread = normalize_used_paths(raw_spreads, allow_unused_nested);
        // A spread of the whole object (`{...props}`) marks everything used.
        if used_spread.iter().any(|s| s.is_empty()) {
            continue;
        }

        let mut checked = HashSet::new();
        let mut reported = HashSet::new();
        walk_unused(
            backend,
            root,
            &[],
            &WalkOpts {
                ignore_prop: &ignore_prop,
                ignore_type: &ignore_type,
                check_imported,
                declared: &declared,
                used_paths: &used_paths,
                used_spread: &used_spread,
            },
            &mut checked,
            &mut reported,
            &mut out,
            report_abs,
            file,
            severity,
            &li,
        );
    }

    out
}

/// Immutable options/usage threaded through [`walk_unused`].
struct WalkOpts<'a> {
    ignore_prop: &'a [Matcher],
    ignore_type: &'a [Matcher],
    check_imported: bool,
    declared: &'a HashSet<String>,
    used_paths: &'a [String],
    used_spread: &'a [String],
}

#[allow(clippy::too_many_arguments)]
fn walk_unused(
    backend: &mut dyn crate::type_backend::TypeBackend,
    t: TypeId,
    parent_path: &[String],
    opts: &WalkOpts,
    checked: &mut HashSet<String>,
    reported: &mut HashSet<String>,
    out: &mut Vec<Diagnostic>,
    report_abs: u32,
    file: &Path,
    severity: Severity,
    li: &LineIndex,
) {
    let Some(meta) = backend.type_meta(t) else {
        return;
    };
    // Class instance types are skipped wholesale (upstream `isClassType`).
    if meta.is_class {
        return;
    }
    if checked.contains(&meta.text) {
        return;
    }
    checked.insert(meta.text.clone());
    // `shouldIgnoreType`: skip the whole type if its text matches a pattern.
    if any_match(opts.ignore_type, &meta.text) {
        return;
    }

    let props = backend.type_props(t);
    if props.is_empty() && meta.base_type_ids.is_empty() {
        return;
    }

    // Recurse into base types (`extends`) at the same path level.
    for base in &meta.base_type_ids {
        walk_unused(
            backend,
            *base,
            parent_path,
            opts,
            checked,
            reported,
            out,
            report_abs,
            file,
            severity,
            li,
        );
    }

    for p in &props {
        if p.is_builtin {
            continue;
        }
        if !opts.check_imported && !p.is_local {
            continue;
        }
        if any_match(opts.ignore_prop, &p.name) {
            continue;
        }
        let mut cur = parent_path.to_vec();
        cur.push(p.name.clone());
        let cur_str = cur.join(".");
        if reported.contains(&cur_str) {
            continue;
        }

        let dot = format!("{cur_str}.");
        let used_this = opts.used_paths.iter().any(|u| u == &cur_str)
            || opts
                .used_spread
                .iter()
                .any(|s| s.is_empty() || s == &cur_str || s.starts_with(&dot));
        let used_below = opts.used_paths.iter().any(|u| u.starts_with(&dot));

        if used_this && !used_below {
            continue;
        }
        let used_in_props = opts.declared.contains(&p.name);
        if !used_below && !used_in_props {
            reported.insert(cur_str.clone());
            let msg = if parent_path.is_empty() {
                format!("'{}' is an unused Props property.", p.name)
            } else {
                format!(
                    "'{}' in '{}' is an unused property.",
                    p.name,
                    parent_path.join(".")
                )
            };
            out.push(Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(severity),
                range: range_from_byte(li, report_abs, report_abs),
                message: msg,
                code: Some(META.name.to_string()),
                source: "svelte",
            });
            continue;
        }
        if used_below || used_in_props {
            walk_unused(
                backend, p.type_id, &cur, opts, checked, reported, out, report_abs, file, severity,
                li,
            );
        }
    }

    // Unused index signature (root level only; `hasRestElement` ⇔ declared empty).
    if parent_path.is_empty() && meta.has_index_signature && !opts.declared.is_empty() {
        out.push(Diagnostic {
            file: file.to_path_buf(),
            severity: to_dsev(severity),
            range: range_from_byte(li, report_abs, report_abs),
            message: "Index signature is unused. Consider using rest operator (...) to capture remaining properties.".to_string(),
            code: Some(META.name.to_string()),
            source: "svelte",
        });
    }
}

/// Parse a destructure pattern into `(originalKey, localName)` pairs, skipping a
/// rest element. Mirrors upstream `getUsedPropertyNamesFromPattern`.
fn parse_destructure_entries(pattern: &str) -> Vec<(String, String)> {
    let inner = if pattern.starts_with('{') && pattern.ends_with('}') {
        &pattern[1..pattern.len() - 1]
    } else {
        pattern
    };
    let mut entries = Vec::new();
    for seg in split_top_level(inner, b",") {
        let seg = seg.trim();
        if seg.is_empty() || seg.starts_with("...") {
            continue;
        }
        let bytes = seg.as_bytes();
        // Quoted key: `'key': local`
        if bytes[0] == b'\'' || bytes[0] == b'"' {
            let q = bytes[0];
            let Some(end) = bytes[1..].iter().position(|&c| c == q) else {
                continue;
            };
            let key = seg[1..end + 1].to_string();
            let rest = seg[end + 2..].trim_start();
            let local = rest
                .strip_prefix(':')
                .map(|r| {
                    let r = r.trim();
                    let n = r
                        .as_bytes()
                        .iter()
                        .position(|&c| !is_ident_byte(c))
                        .unwrap_or(r.len());
                    r[..n].to_string()
                })
                .filter(|s| !s.is_empty())
                .unwrap_or_else(|| key.clone());
            entries.push((key, local));
            continue;
        }
        // Plain identifier key, optional `: local` / `= default`.
        let name_end = bytes
            .iter()
            .position(|&c| !is_ident_byte(c))
            .unwrap_or(bytes.len());
        if name_end == 0 {
            continue;
        }
        let key = seg[..name_end].to_string();
        let after = seg[name_end..].trim_start();
        let local = after
            .strip_prefix(':')
            .map(|r| {
                let r = r.trim();
                let n = r
                    .as_bytes()
                    .iter()
                    .position(|&c| !is_ident_byte(c))
                    .unwrap_or(r.len());
                r[..n].to_string()
            })
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| key.clone());
        entries.push((key, local));
    }
    entries
}

/// Collect member-access chains for `var` in `source` (e.g. `var.a.b` →
/// `["a","b"]`), split into non-spread paths and spread paths (`...var.x`).
/// Approximate (source scan, not scope-precise) but sufficient for prop usage.
fn member_chains(
    source: &str,
    var: &str,
    exclude: Option<(usize, usize)>,
) -> (Vec<Vec<String>>, Vec<Vec<String>>) {
    let bytes = source.as_bytes();
    let vb = var.as_bytes();
    let mut paths = Vec::new();
    let mut spreads = Vec::new();
    let mut i = 0;
    while let Some(rel) = source[i..].find(var) {
        let start = i + rel;
        let end = start + vb.len();
        i = end;
        // Skip occurrences inside an excluded range (e.g. the binding pattern).
        if let Some((lo, hi)) = exclude
            && start >= lo
            && start < hi
        {
            continue;
        }
        let before = start.checked_sub(1).map(|b| bytes[b]);
        let after = bytes.get(end).copied();
        if before.is_some_and(is_ident_byte) || after.is_some_and(is_ident_byte) {
            continue; // not a whole-word match
        }
        let mut p = start;
        while p > 0 && (bytes[p - 1] as char).is_whitespace() {
            p -= 1;
        }
        let is_spread = p >= 3 && &source[p - 3..p] == "...";
        // Skip `obj.var` (member access where `var` is the property), but NOT
        // the spread `...var` (whose preceding char is also `.`).
        if !is_spread && p > 0 && bytes[p - 1] == b'.' {
            continue;
        }
        // Empty non-spread chains (a bare/whole reference, e.g. shorthand
        // `{var}`) are kept: they mark the prop as used *wholly* (no deeper
        // access), which suppresses recursion into it.
        let chain = parse_member_chain(source, end);
        if is_spread {
            spreads.push(chain);
        } else {
            paths.push(chain);
        }
    }
    (paths, spreads)
}

/// Parse a `.a.b` / `["a"]` / `?.a` member chain starting at byte `pos`.
fn parse_member_chain(source: &str, mut pos: usize) -> Vec<String> {
    let bytes = source.as_bytes();
    let mut chain = Vec::new();
    loop {
        while pos < bytes.len() && (bytes[pos] as char).is_whitespace() {
            pos += 1;
        }
        if pos >= bytes.len() {
            break;
        }
        let dot = if bytes[pos] == b'.' {
            Some(pos + 1)
        } else if bytes[pos] == b'?' && bytes.get(pos + 1) == Some(&b'.') {
            Some(pos + 2)
        } else {
            None
        };
        if let Some(mut q) = dot {
            while q < bytes.len() && (bytes[q] as char).is_whitespace() {
                q += 1;
            }
            let s = q;
            while q < bytes.len() && is_ident_byte(bytes[q]) {
                q += 1;
            }
            if q == s {
                break;
            }
            chain.push(source[s..q].to_string());
            pos = q;
        } else if bytes[pos] == b'[' {
            let mut q = pos + 1;
            while q < bytes.len() && (bytes[q] as char).is_whitespace() {
                q += 1;
            }
            if q < bytes.len() && (bytes[q] == b'\'' || bytes[q] == b'"') {
                let quote = bytes[q];
                q += 1;
                let s = q;
                while q < bytes.len() && bytes[q] != quote {
                    q += 1;
                }
                if q >= bytes.len() {
                    break;
                }
                let name = source[s..q].to_string();
                q += 1;
                while q < bytes.len() && (bytes[q] as char).is_whitespace() {
                    q += 1;
                }
                if q < bytes.len() && bytes[q] == b']' {
                    chain.push(name);
                    pos = q + 1;
                } else {
                    break;
                }
            } else {
                break; // computed/dynamic index
            }
        } else {
            break;
        }
    }
    chain
}

/// Dedup prefix-paths (keep the shortest) and join with `.`. With
/// `allow_unused_nested`, truncate each path to its first segment. Mirrors
/// upstream `normalizeUsedPaths`.
fn normalize_used_paths(mut paths: Vec<Vec<String>>, allow_unused_nested: bool) -> Vec<String> {
    paths.sort_by_key(|p| p.len());
    let mut normalized: Vec<Vec<String>> = Vec::new();
    for path in paths {
        let covered = normalized.iter().any(|p| {
            p.len() <= path.len() && p.iter().enumerate().all(|(i, part)| part == &path[i])
        });
        if covered {
            continue;
        }
        normalized.push(path);
    }
    normalized
        .into_iter()
        .map(|path| {
            if allow_unused_nested {
                path.into_iter().take(1).collect::<Vec<_>>().join(".")
            } else {
                path.join(".")
            }
        })
        .collect()
}

fn option_str_list(opts: Option<&serde_json::Value>, key: &str) -> Vec<String> {
    opts.and_then(first_option_object)
        .and_then(|o| o.get(key))
        .and_then(|v| v.as_array())
        .map(|a| {
            a.iter()
                .filter_map(|v| v.as_str().map(str::to_string))
                .collect()
        })
        .unwrap_or_default()
}

fn option_bool(opts: Option<&serde_json::Value>, key: &str) -> Option<bool> {
    opts.and_then(first_option_object)
        .and_then(|o| o.get(key))
        .and_then(|v| v.as_bool())
}

fn first_option_object(
    v: &serde_json::Value,
) -> Option<&serde_json::Map<String, serde_json::Value>> {
    match v {
        serde_json::Value::Array(a) => a.first().and_then(|o| o.as_object()),
        serde_json::Value::Object(o) => Some(o),
        _ => None,
    }
}

pub fn diagnostics(source: &str, file: &Path, config: &LintConfig) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off || !script_is_ts(source) {
        return Vec::new();
    }

    let li = LineIndex::new(source);
    let mut out = Vec::new();

    for block in script_blocks(source) {
        // Skip <script module> — $props() is never in the module context.
        if block.open_tag_attrs.contains("module") {
            continue;
        }
        let content = &source[block.content_start..block.content_end];
        let blanked = blank_comments(content);

        // 1. Find $props() with type annotation.
        let Some(props_info) = find_props_info(content, &blanked, block.content_start) else {
            continue;
        };

        // 2. Skip if rest element in destructure.
        if matches!(
            &props_info.form,
            PropForm::Destructure { has_rest: true, .. }
        ) {
            continue;
        }

        // 3. Resolve Props type body.
        let resolved = if props_info.type_name.trim_start().starts_with('{') {
            // Inline type literal.
            let type_name_in_content = props_info
                .type_abs_offset
                .saturating_sub(block.content_start);
            let brace_offset = content[type_name_in_content..]
                .find('{')
                .map(|r| type_name_in_content + r);
            let Some(brace_offset) = brace_offset else {
                continue;
            };
            extract_balanced_braces(content, brace_offset)
                .map(|body| (body, block.content_start + brace_offset))
        } else {
            let name = props_info.type_name.trim();
            // Skip if type name contains angle brackets (generic).
            if name.contains('<') {
                continue;
            }
            // Skip if type annotation text contains intersection.
            if props_info.type_name.contains('&') {
                continue;
            }
            // Skip if type name is imported.
            if is_type_imported(&blanked, name) {
                continue;
            }
            find_named_type_body_no_extends(content, &blanked, name, block.content_start)
        };

        let Some((body_text, body_abs_offset)) = resolved else {
            continue;
        };

        // 4. Parse members; skip if index signature present.
        let Some(members) = parse_prop_members(&body_text, body_abs_offset) else {
            continue;
        };
        if members.is_empty() {
            continue;
        }

        // 5. Check usage and report (flat members, local-type path).
        report_unused(
            &props_info.form,
            &members,
            source,
            file,
            severity,
            &li,
            &mut out,
        );
    }

    out
}

/// Report unused members for a resolved `$props()` declaration form. Shared by
/// the syntactic ([`diagnostics`]) and type-aware ([`diagnostics_typed`]) paths
/// — only the source of `members` differs.
#[allow(clippy::too_many_arguments)]
fn report_unused(
    form: &PropForm,
    members: &[String],
    source: &str,
    file: &Path,
    severity: Severity,
    li: &LineIndex,
    out: &mut Vec<Diagnostic>,
) {
    match form {
        PropForm::Destructure {
            pattern_open_brace_abs,
            pattern_text,
            ..
        } => {
            let destructured = parse_destructure_props(pattern_text);
            for member_name in members {
                if !destructured.contains(member_name.as_str()) {
                    let abs = *pattern_open_brace_abs as u32;
                    out.push(Diagnostic {
                        file: file.to_path_buf(),
                        severity: to_dsev(severity),
                        range: range_from_byte(li, abs, abs),
                        message: format!("'{}' is an unused Props property.", member_name),
                        code: Some(META.name.to_string()),
                        source: "svelte",
                    });
                }
            }
        }
        PropForm::WholeObject {
            var_name,
            var_abs_offset,
        } => {
            // Skip if the var is spread (whole object), e.g. {...props} or ...props.
            if has_whole_object_spread(source, var_name) {
                return;
            }
            for member_name in members {
                if !whole_object_member_used(source, var_name, member_name) {
                    let abs = *var_abs_offset as u32;
                    out.push(Diagnostic {
                        file: file.to_path_buf(),
                        severity: to_dsev(severity),
                        range: range_from_byte(li, abs, abs),
                        message: format!("'{}' is an unused Props property.", member_name),
                        code: Some(META.name.to_string()),
                        source: "svelte",
                    });
                }
            }
        }
    }
}

/// Whether `var_name.member` (or its bracket forms) is read anywhere in source.
fn whole_object_member_used(source: &str, var_name: &str, member: &str) -> bool {
    let dot_pat = format!("{}.{}", var_name, member);
    let sq_pat = format!("{}['{}']", var_name, member);
    let dq_pat = format!("{}[\"{}\"]", var_name, member);
    source.contains(dot_pat.as_str())
        || source.contains(sq_pat.as_str())
        || source.contains(dq_pat.as_str())
}

/// Check if the variable `var_name` appears in a whole-object spread context in
/// source (e.g. `{...props}`, `...props)`) where the next char after
/// `...{var_name}` is NOT `.`, `[`, or an identifier char.
fn has_whole_object_spread(source: &str, var_name: &str) -> bool {
    let pat = format!("...{}", var_name);
    let bytes = source.as_bytes();
    let vb = pat.as_bytes();
    let mut i = 0;
    while i + vb.len() <= bytes.len() {
        if bytes[i..i + vb.len()] == *vb {
            // Check next char.
            let next = bytes.get(i + vb.len()).copied();
            let next_is_member = next.is_some_and(|c| c == b'.' || c == b'[' || is_ident_byte(c));
            if !next_is_member {
                return true;
            }
        }
        i += 1;
    }
    false
}

enum PropForm {
    Destructure {
        pattern_open_brace_abs: usize,
        pattern_text: String,
        has_rest: bool,
    },
    WholeObject {
        var_name: String,
        var_abs_offset: usize,
    },
}

struct PropsInfo {
    type_name: String,
    type_abs_offset: usize,
    form: PropForm,
}

/// Find $props() call and extract the type annotation + declaration form.
fn find_props_info(content: &str, blanked: &str, content_start: usize) -> Option<PropsInfo> {
    let props_rel = blanked.find("$props()")?;
    let before_props = &blanked[..props_rel];
    let eq_rel = before_props.rfind('=')?;
    let before_eq = &blanked[..eq_rel];
    let colon_rel = find_type_colon_before(before_eq)?;

    let type_start_in_content = colon_rel + 1;
    let type_end_in_content = eq_rel;
    if type_start_in_content >= type_end_in_content {
        return None;
    }
    let type_text = content[type_start_in_content..type_end_in_content].trim();
    if type_text.is_empty() {
        return None;
    }

    // Find start of type text in content (skip leading whitespace).
    let type_abs_start = content_start
        + type_start_in_content
        + content[type_start_in_content..type_end_in_content]
            .find(|c: char| !c.is_whitespace())
            .unwrap_or(0);

    let before_colon = blanked[..colon_rel].trim_end();

    let form = if before_colon.ends_with('}') {
        // Destructure form: `const { a, b }: Props = $props()`.
        let close_brace_rel = blanked[..colon_rel].rfind('}')?;
        let open_brace_rel = find_matching_open_brace(blanked, close_brace_rel)?;
        let pattern_text = content[open_brace_rel..=close_brace_rel].to_string();
        let has_rest = pattern_text.contains("...");
        PropForm::Destructure {
            pattern_open_brace_abs: content_start + open_brace_rel,
            pattern_text,
            has_rest,
        }
    } else {
        // Whole-object form: `const props: Props = $props()`.
        let var_end_rel = before_colon.len();
        // Find start of var name (walk back over identifier chars).
        let var_name_start = blanked[..var_end_rel]
            .rfind(|c: char| !is_ident_byte(c as u8))
            .map(|i| i + 1)
            .unwrap_or(0);
        let var_name = content[var_name_start..var_end_rel].trim().to_string();
        if var_name.is_empty()
            || !var_name
                .chars()
                .all(|c| c.is_alphanumeric() || c == '_' || c == '$')
        {
            return None;
        }
        PropForm::WholeObject {
            var_abs_offset: content_start + var_name_start,
            var_name,
        }
    };

    Some(PropsInfo {
        type_name: type_text.to_string(),
        type_abs_offset: type_abs_start,
        form,
    })
}

/// Find the `{` that matches the `}` at `close_pos` in `s` by scanning
/// right-to-left.
fn find_matching_open_brace(s: &str, close_pos: usize) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth = 0i32;
    let mut i = close_pos;
    loop {
        match bytes[i] {
            b'}' => depth += 1,
            b'{' => {
                depth -= 1;
                if depth == 0 {
                    return Some(i);
                }
            }
            _ => {}
        }
        if i == 0 {
            break;
        }
        i -= 1;
    }
    None
}

/// Check if `name` appears in an import statement in the blanked script content.
fn is_type_imported(blanked: &str, name: &str) -> bool {
    let nb = name.as_bytes();
    let bytes = blanked.as_bytes();
    let mut i = 0;
    while i + 6 <= bytes.len() {
        if &bytes[i..i + 6] == b"import" {
            let before_ok = i == 0 || !is_ident_byte(bytes[i - 1]);
            if before_ok {
                let end = blanked[i..]
                    .find(';')
                    .map(|r| i + r + 1)
                    .or_else(|| blanked[i..].find('\n').map(|r| i + r + 1))
                    .unwrap_or(blanked.len());
                let import_stmt = &blanked[i..end];
                if let Some(name_pos) = import_stmt.find(name) {
                    let before_ok2 =
                        name_pos == 0 || !is_ident_byte(import_stmt.as_bytes()[name_pos - 1]);
                    let after_ok = name_pos + nb.len() >= import_stmt.len()
                        || !is_ident_byte(import_stmt.as_bytes()[name_pos + nb.len()]);
                    if before_ok2 && after_ok {
                        return true;
                    }
                }
                i = end;
                continue;
            }
        }
        i += 1;
    }
    false
}

/// Find the Props type body for a named type, skipping if it has `extends` or
/// `&` (intersection) between the name and the opening brace.
fn find_named_type_body_no_extends(
    content: &str,
    blanked: &str,
    name: &str,
    content_start: usize,
) -> Option<(String, usize)> {
    let nb = name.as_bytes();
    let bytes = blanked.as_bytes();

    for kw in ["interface", "type"] {
        let mut search_from = 0usize;
        while let Some(rel) = blanked[search_from..].find(kw) {
            let kw_start = search_from + rel;
            let kw_end = kw_start + kw.len();
            let before_ok = kw_start == 0 || !is_ident_byte(bytes[kw_start - 1]);
            if !before_ok {
                search_from = kw_end;
                continue;
            }
            // After keyword, skip whitespace, match name.
            let rest = blanked[kw_end..].trim_start();
            let rest_start = kw_end + (blanked[kw_end..].len() - rest.len());
            if !rest.as_bytes().starts_with(nb) {
                search_from = kw_end;
                continue;
            }
            let after_name = rest_start + nb.len();
            let after_char = bytes.get(after_name).copied();
            if after_char.is_some_and(is_ident_byte) {
                search_from = kw_end;
                continue;
            }
            // For `type`, find `=` first.
            let search_brace_from = if kw == "type" {
                blanked[after_name..]
                    .find('=')
                    .map(|r| after_name + r + 1)?
            } else {
                after_name
            };
            // Find the opening `{`.
            let open_brace_rel = blanked[search_brace_from..].find('{')?;
            let open_brace = search_brace_from + open_brace_rel;
            // Check for `extends` or `&` between name-end and `{`.
            let between = &blanked[after_name..open_brace];
            if between.contains("extends") || between.contains('&') {
                return None;
            }
            let body = extract_balanced_braces(content, open_brace)?;
            return Some((body, content_start + open_brace));
        }
    }
    None
}

/// Extract balanced `{…}` block from `content` at `start`.
fn extract_balanced_braces(content: &str, start: usize) -> Option<String> {
    let bytes = content.as_bytes();
    if bytes.get(start) != Some(&b'{') {
        return None;
    }
    let mut depth = 0i32;
    let mut i = start;
    while i < bytes.len() {
        match bytes[i] {
            b'{' => depth += 1,
            b'}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(content[start..=i].to_string());
                }
            }
            _ => {}
        }
        i += 1;
    }
    None
}

/// Find the `:` before the type annotation by scanning right-to-left.
/// Handles nested `<>`, `{}`, `()`.
fn find_type_colon_before(s: &str) -> Option<usize> {
    let bytes = s.as_bytes();
    let mut depth_brace: i32 = 0;
    let mut depth_angle: i32 = 0;
    let mut depth_paren: i32 = 0;
    let mut i = bytes.len();
    while i > 0 {
        i -= 1;
        match bytes[i] {
            b'}' => depth_brace += 1,
            b'{' if depth_brace > 0 => depth_brace -= 1,
            b'{' => {
                // The `{` in destructuring `let { x }: ...` — stop here.
                break;
            }
            b'>' => depth_angle += 1,
            b'<' if depth_angle > 0 => depth_angle -= 1,
            b')' => depth_paren += 1,
            b'(' if depth_paren > 0 => depth_paren -= 1,
            b':' if depth_brace == 0 && depth_angle == 0 && depth_paren == 0 => {
                return Some(i);
            }
            _ => {}
        }
    }
    None
}

/// Parse member names from a type body `{ … }`.
/// Returns `None` if an index signature is present (skip the whole check).
fn parse_prop_members(body: &str, _body_abs_offset: usize) -> Option<Vec<String>> {
    let inner = if body.starts_with('{') && body.ends_with('}') {
        &body[1..body.len() - 1]
    } else {
        body
    };

    let mut members = Vec::new();
    let segments = split_top_level(inner, b";\n,");

    for seg in segments {
        let seg = seg.trim();
        if seg.is_empty() {
            continue;
        }
        // Index signature: starts with `[`
        if seg.starts_with('[') {
            // Index signature present — skip this entire type (return None).
            return None;
        }
        if let Some(name) = extract_member_name(seg) {
            members.push(name);
        }
    }

    Some(members)
}

/// Extract the property name from a type member segment.
fn extract_member_name(seg: &str) -> Option<String> {
    let seg = seg.trim();
    if seg.is_empty() {
        return None;
    }
    let bytes = seg.as_bytes();

    // Quoted name: 'foo' or "foo"
    if bytes[0] == b'\'' || bytes[0] == b'"' {
        let q = bytes[0];
        let end = bytes[1..].iter().position(|&c| c == q)?;
        return Some(seg[1..end + 1].to_string());
    }

    // Plain identifier (possibly followed by `?`, `:`, `(`)
    let name_end = bytes
        .iter()
        .position(|&c| !is_ident_byte(c))
        .unwrap_or(bytes.len());
    if name_end == 0 {
        return None;
    }
    Some(seg[..name_end].to_string())
}

/// Split at top-level occurrences of any delimiter byte, respecting nesting of
/// `{}`, `()`, `<>`, `[]`, and string literals.
fn split_top_level<'a>(s: &'a str, delimiters: &[u8]) -> Vec<&'a str> {
    let bytes = s.as_bytes();
    let mut parts = Vec::new();
    let mut depth_brace: i32 = 0;
    let mut depth_paren: i32 = 0;
    let mut depth_angle: i32 = 0;
    let mut depth_bracket: i32 = 0;
    let mut start = 0;
    let mut in_string: Option<u8> = None;

    for i in 0..bytes.len() {
        if let Some(q) = in_string {
            if bytes[i] == q {
                in_string = None;
            }
            continue;
        }
        match bytes[i] {
            b'\'' | b'"' | b'`' => in_string = Some(bytes[i]),
            b'{' => depth_brace += 1,
            b'}' if depth_brace > 0 => depth_brace -= 1,
            b'(' => depth_paren += 1,
            b')' if depth_paren > 0 => depth_paren -= 1,
            b'<' => depth_angle += 1,
            b'>' if depth_angle > 0 => depth_angle -= 1,
            b'[' => depth_bracket += 1,
            b']' if depth_bracket > 0 => depth_bracket -= 1,
            c if depth_brace == 0
                && depth_paren == 0
                && depth_angle == 0
                && depth_bracket == 0
                && delimiters.contains(&c) =>
            {
                parts.push(&s[start..i]);
                start = i + 1;
            }
            _ => {}
        }
    }
    if start <= s.len() {
        parts.push(&s[start..]);
    }
    parts
}

/// Parse the destructure pattern to get the set of original prop key names.
fn parse_destructure_props(pattern: &str) -> std::collections::HashSet<String> {
    let inner = if pattern.starts_with('{') && pattern.ends_with('}') {
        &pattern[1..pattern.len() - 1]
    } else {
        pattern
    };

    let mut props = std::collections::HashSet::new();
    let segments = split_top_level(inner, b",");
    for seg in segments {
        let seg = seg.trim();
        if seg.is_empty() || seg.starts_with("...") {
            continue;
        }
        if let Some(name) = extract_destructure_prop_name(seg) {
            props.insert(name);
        }
    }
    props
}

/// Extract the ORIGINAL key (not alias) from a destructure pattern segment.
fn extract_destructure_prop_name(seg: &str) -> Option<String> {
    let seg = seg.trim();
    if seg.is_empty() {
        return None;
    }
    let bytes = seg.as_bytes();

    // Quoted key: `'foo'` or `"foo"` (possibly aliased: `'foo': bar`)
    if bytes[0] == b'\'' || bytes[0] == b'"' {
        let q = bytes[0];
        let end = bytes[1..].iter().position(|&c| c == q)?;
        return Some(seg[1..end + 1].to_string());
    }

    // Plain identifier (take just the name, not `= default` or `: alias` or
    // nested `{ ... }`)
    let name_end = bytes
        .iter()
        .position(|&c| !is_ident_byte(c))
        .unwrap_or(bytes.len());
    if name_end == 0 {
        return None;
    }
    Some(seg[..name_end].to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn members_from_interface_body() {
        let m = parse_prop_members("{ test: string; 'aria-label'?: string }", 0).unwrap();
        assert!(m.contains(&"test".to_string()));
        assert!(m.contains(&"aria-label".to_string()));
    }

    #[test]
    fn index_signature_body_skips() {
        // An index signature means we can't enumerate members → skip (None).
        assert!(parse_prop_members("{ [key: string]: unknown }", 0).is_none());
    }

    #[test]
    fn destructure_props_handle_aliases_and_quotes() {
        let p = parse_destructure_props("{ a, b: alias, 'aria-label': foo, ...rest }");
        assert!(p.contains("a"));
        assert!(p.contains("b")); // original key, not the alias
        assert!(p.contains("aria-label"));
        assert!(!p.contains("alias"));
        assert!(!p.contains("rest"));
    }

    #[test]
    fn whole_object_spread_detected() {
        assert!(has_whole_object_spread("foo({ ...props })", "props"));
        assert!(has_whole_object_spread("bar(...props)", "props"));
        // `...props.foo` is a member spread, not a whole-object spread.
        assert!(!has_whole_object_spread("baz({ ...props.foo })", "props"));
    }

    use crate::type_backend::{TypeBackend, TypeFacts};
    use std::path::PathBuf;

    /// A backend returning a fixed resolved props type — stands in for the
    /// checker so the typed rule logic is testable without `corsa`/`tsgo`.
    struct MockProps(TypeFacts);
    impl TypeBackend for MockProps {
        fn probe_props(&mut self) -> Option<TypeFacts> {
            Some(self.0.clone())
        }
        fn probe_expr(&mut self, _off: u32) -> Option<TypeFacts> {
            None
        }
    }

    fn facts(names: &[&str], types: &[&str]) -> TypeFacts {
        TypeFacts {
            type_texts: vec!["Props".into()],
            property_names: names.iter().map(|s| s.to_string()).collect(),
            property_types: types.iter().map(|s| vec![s.to_string()]).collect(),
        }
    }

    fn typed(src: &str, mut backend: MockProps) -> Vec<String> {
        let cfg = LintConfig::recommended().with_override(META.name, Severity::Warn);
        diagnostics_typed(src, &PathBuf::from("T.svelte"), &cfg, &mut backend)
            .into_iter()
            .map(|d| d.message)
            .collect()
    }

    // ---- Graph-path mock (the full recursive walk, corsa-free) -------------

    use crate::type_backend::{PropMeta, TypeId, TypeMeta};

    /// One node in a fake type graph.
    struct GType {
        text: &'static str,
        is_class: bool,
        has_index: bool,
        bases: Vec<TypeId>,
        /// (name, is_local, is_builtin, type_id)
        props: Vec<(&'static str, bool, bool, TypeId)>,
    }

    /// A backend serving a fixed type graph, exercising [`diagnostics_typed`]'s
    /// graph path without `corsa`/`tsgo`.
    struct MockGraph {
        types: Vec<GType>,
    }
    impl TypeBackend for MockGraph {
        fn probe_props(&mut self) -> Option<TypeFacts> {
            None
        }
        fn probe_expr(&mut self, _off: u32) -> Option<TypeFacts> {
            None
        }
        fn props_type(&mut self) -> Option<TypeId> {
            (!self.types.is_empty()).then_some(0)
        }
        fn type_meta(&mut self, t: TypeId) -> Option<TypeMeta> {
            self.types.get(t as usize).map(|g| TypeMeta {
                text: g.text.to_string(),
                has_index_signature: g.has_index,
                is_class: g.is_class,
                base_type_ids: g.bases.clone(),
            })
        }
        fn type_props(&mut self, t: TypeId) -> Vec<PropMeta> {
            self.types
                .get(t as usize)
                .map(|g| {
                    g.props
                        .iter()
                        .map(|&(name, is_local, is_builtin, type_id)| PropMeta {
                            name: name.to_string(),
                            is_local,
                            is_builtin,
                            type_id,
                        })
                        .collect()
                })
                .unwrap_or_default()
        }
    }

    fn graph_msgs(src: &str, cfg_json: &str, types: Vec<GType>) -> Vec<String> {
        let cfg = LintConfig::from_json_str(cfg_json).unwrap();
        let mut backend = MockGraph { types };
        let mut m: Vec<String> =
            diagnostics_typed(src, &PathBuf::from("T.svelte"), &cfg, &mut backend)
                .into_iter()
                .map(|d| d.message)
                .collect();
        m.sort();
        m
    }

    /// `interface Props extends BaseProps { age }` with `BaseProps` imported.
    fn props_with_imported_base() -> Vec<GType> {
        vec![
            GType {
                text: "Props",
                is_class: false,
                has_index: false,
                bases: vec![1],
                props: vec![("age", true, false, 3)],
            },
            GType {
                text: "BaseProps",
                is_class: false,
                has_index: false,
                bases: vec![],
                props: vec![
                    ("name", false, false, 3),
                    ("imported_unused", false, false, 3),
                ],
            },
            GType {
                text: "User",
                is_class: true,
                has_index: false,
                bases: vec![],
                props: vec![("klass_member", false, false, 3)],
            },
            GType {
                text: "string",
                is_class: false,
                has_index: false,
                bases: vec![],
                props: vec![],
            },
        ]
    }

    #[test]
    fn graph_skips_unused_imported_prop_by_default() {
        // check_imported defaults false → imported `imported_unused` is skipped;
        // age/name are used.
        let src = "<script lang=\"ts\">\n\tlet { age, name }: Props = $props();\n\tconsole.log(age, name);\n</script>";
        let cfg = r#"{ "rules": { "svelte/no-unused-props": "warn" } }"#;
        assert!(graph_msgs(src, cfg, props_with_imported_base()).is_empty());
    }

    #[test]
    fn graph_reports_unused_imported_prop_when_enabled() {
        let src = "<script lang=\"ts\">\n\tlet { age, name }: Props = $props();\n\tconsole.log(age, name);\n</script>";
        let cfg = r#"{ "rules": { "svelte/no-unused-props": ["warn", { "checkImportedTypes": true }] } }"#;
        assert_eq!(
            graph_msgs(src, cfg, props_with_imported_base()),
            vec!["'imported_unused' is an unused Props property.".to_string()]
        );
    }

    #[test]
    fn graph_nested_unused_and_class_skipped() {
        // props.user.name used; props.user.location unused → nested report.
        // props.acct is a class instance → not recursed (no member reports).
        let types = vec![
            GType {
                text: "Props",
                is_class: false,
                has_index: false,
                bases: vec![],
                props: vec![("user", true, false, 1), ("acct", true, false, 2)],
            },
            GType {
                text: "{ name: string; location: string; }",
                is_class: false,
                has_index: false,
                bases: vec![],
                props: vec![("name", true, false, 3), ("location", true, false, 3)],
            },
            GType {
                text: "Account",
                is_class: true,
                has_index: false,
                bases: vec![],
                props: vec![("balance", true, false, 3)],
            },
            GType {
                text: "string",
                is_class: false,
                has_index: false,
                bases: vec![],
                props: vec![],
            },
        ];
        let src = "<script lang=\"ts\">\n\tlet props: Props = $props();\n\tconsole.log(props.user.name, props.acct);\n</script>";
        let cfg = r#"{ "rules": { "svelte/no-unused-props": "warn" } }"#;
        assert_eq!(
            graph_msgs(src, cfg, types),
            vec!["'location' in 'user' is an unused property.".to_string()]
        );
    }

    #[test]
    fn graph_index_signature_without_rest() {
        let types = vec![
            GType {
                text: "Props",
                is_class: false,
                has_index: true,
                bases: vec![],
                props: vec![("a", true, false, 1)],
            },
            GType {
                text: "string",
                is_class: false,
                has_index: false,
                bases: vec![],
                props: vec![],
            },
        ];
        // Destructure without rest → the index signature is reported unused.
        let src =
            "<script lang=\"ts\">\n\tlet { a }: Props = $props();\n\tconsole.log(a);\n</script>";
        let cfg = r#"{ "rules": { "svelte/no-unused-props": "warn" } }"#;
        assert_eq!(
            graph_msgs(src, cfg, types),
            vec![
                "Index signature is unused. Consider using rest operator (...) to capture remaining properties.".to_string()
            ]
        );
    }

    #[test]
    fn typed_flat_resolves_inherited_props() {
        // Mirrors `extends-unused`: the checker reports id/type/role/name/email;
        // id/type/name are used; role/email are not.
        let src = "<script lang=\"ts\">\n\tinterface Props { x: 0 }\n\tlet props: Props = $props();\n\tconsole.log(props.id, props.type, props.name);\n</script>";
        let msgs = typed(
            src,
            MockProps(facts(
                &["id", "type", "role", "name", "email"],
                &["string", "string", "string", "string", "string"],
            )),
        );
        assert!(msgs.contains(&"'role' is an unused Props property.".to_string()));
        assert!(msgs.contains(&"'email' is an unused Props property.".to_string()));
        assert_eq!(msgs.len(), 2, "got {msgs:?}");
    }

    #[test]
    fn typed_destructure_form() {
        let src = "<script lang=\"ts\">\n\tlet { name, age }: Props = $props();\n\tconsole.log(name, age);\n</script>";
        let msgs = typed(
            src,
            MockProps(facts(
                &["name", "age", "role"],
                &["string", "number", "string"],
            )),
        );
        assert_eq!(
            msgs,
            vec!["'role' is an unused Props property.".to_string()]
        );
    }

    #[test]
    fn typed_nested_object_prop() {
        // Mirrors `nested-unused`: props.user.name used, props.user.location not.
        let src = "<script lang=\"ts\">\n\tlet props: Props = $props();\n\tconsole.log(props.user.name);\n</script>";
        let msgs = typed(
            src,
            MockProps(facts(&["user"], &["{ name: string; location: string; }"])),
        );
        assert_eq!(
            msgs,
            vec!["'location' in 'user' is an unused property.".to_string()]
        );
    }

    #[test]
    fn typed_ignore_property_patterns() {
        // `toRegExp` semantics: a `/…/` string is a regex; a plain string is an
        // EXACT match. So the regex form ignores `skip_me`, the plain form does not.
        let src = "<script lang=\"ts\">\n\tconst { bar }: Props = $props();\n</script>";
        let regex_cfg = LintConfig::from_json_str(
            r#"{ "rules": { "svelte/no-unused-props": ["warn", { "ignorePropertyPatterns": ["/^skip_/"] }] } }"#,
        )
        .unwrap();
        let mut backend = MockProps(facts(&["bar", "skip_me"], &["string", "string"]));
        let regex_msgs: Vec<String> =
            diagnostics_typed(src, &PathBuf::from("T.svelte"), &regex_cfg, &mut backend)
                .into_iter()
                .map(|d| d.message)
                .collect();
        assert!(
            regex_msgs.is_empty(),
            "regex form should ignore skip_me; got {regex_msgs:?}"
        );

        // Plain string `"skip_me"` is exact-match → ignores the literal name.
        let exact_cfg = LintConfig::from_json_str(
            r#"{ "rules": { "svelte/no-unused-props": ["warn", { "ignorePropertyPatterns": ["skip_me"] }] } }"#,
        )
        .unwrap();
        let mut backend2 = MockProps(facts(&["bar", "skip_me"], &["string", "string"]));
        let exact_msgs: Vec<String> =
            diagnostics_typed(src, &PathBuf::from("T.svelte"), &exact_cfg, &mut backend2)
                .into_iter()
                .map(|d| d.message)
                .collect();
        assert!(
            exact_msgs.is_empty(),
            "exact form should ignore skip_me; got {exact_msgs:?}"
        );
    }
}
