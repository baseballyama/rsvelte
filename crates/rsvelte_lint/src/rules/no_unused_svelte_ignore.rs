//! `svelte/no-unused-svelte-ignore` — disallow `svelte-ignore` comments that did
//! not actually suppress a compiler warning. Port of the eslint-plugin-svelte
//! rule (`src/rules/no-unused-svelte-ignore.ts`) together with the
//! `getSvelteIgnoreItems` extraction (`shared/svelte-compile-warns/ignore-comment.ts`)
//! and the `processIgnore` matching (`shared/svelte-compile-warns/index.ts`).
//!
//! ## How it works
//!
//! 1. Extract every `svelte-ignore` item — from HTML template comments
//!    (`<!-- svelte-ignore code … -->`) and from `<script>` line/block comments
//!    (`// svelte-ignore code …`) — recording each code token's byte range and
//!    the node it "leads" (its scope).
//! 2. A code-less `svelte-ignore` is reported immediately as `missingCode`.
//! 3. Strip the ignore comments from the source (blanking each character to a
//!    space, one per UTF-16 code unit, so line/column structure is preserved) and
//!    compile the result, collecting the warnings the ignores would otherwise
//!    have suppressed.
//! 4. A coded ignore is *used* iff a compiler warning whose code matches (the raw
//!    code or its Svelte-5 `codeForV5` spelling) falls within the byte range of
//!    the node the comment leads. Every ignore left *unused* is reported.
//!
//! Like [`crate::rules::valid_compile`] this is a whole-component meta-rule wired
//! into [`crate::runner::lint_source`], not a per-node hook.
//!
//! ### Non-CSS `<style>` blocks
//! A `<style lang="scss|postcss|…">` block needs a real preprocessor to turn its
//! source into the CSS the compiler analyses. rsvelte can't run one, so it mirrors
//! upstream's no-preprocessor path (`getSvelteCompileWarnings`'s
//! `stripStyleElements`): the block's content is blanked out of the compiled copy
//! (so non-CSS syntax can't break the compile) and any **CSS-warning** ignore
//! (`css-unused-selector`, `css-invalid-global`, …) that leads such a block is
//! treated as *used* — its CSS warnings are undeterminable, so reporting it unused
//! would be a false positive. Plain CSS (`<style>` with no `lang`, or `lang="css"`)
//! is compiled and matched normally.
//!
//! ### Out of scope (skipped in the oracle)
//! - The *invalid* `style-lang*` / `transform-test` fixtures expect the CSS-ignore
//!   to be reported unused; that expectation was recorded with the preprocessor
//!   installed (so the transformed CSS yields no warning → ignore unused). rsvelte
//!   can't reproduce that environment, so those fixtures are skipped. The *valid*
//!   counterparts pass: the ignore is treated as used either way.
//! - The Svelte-4-only fixtures exercise legacy compiler semantics; rsvelte runs
//!   Svelte-5 semantics, so they are out of scope (skipped in the oracle).

use std::path::Path;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::{Fragment, Root, TemplateNode};
use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_core::{CompileOptions, GenerateMode, ParseOptions, compile, parse};
use serde_json::Value;

use crate::config::LintConfig;
use crate::line_index::LineIndex;
use crate::rule::{Fixable, RuleCategory, RuleConditions, RuleMeta, Severity};
use crate::validator::{range_from_byte, to_dsev};

pub static META: RuleMeta = RuleMeta {
    name: "svelte/no-unused-svelte-ignore",
    category: RuleCategory::Correctness,
    fixable: Fixable::No,
    // Upstream `recommended: true`.
    default_severity: Severity::Warn,
    conditions: RuleConditions {
        runes_only: false,
        legacy_only: false,
    },
    type_aware: false,
    docs: "disallow unused svelte-ignore comments",
    // Upstream `schema: []` — no options.
    options_schema: None,
};

const UNUSED_MSG: &str = "svelte-ignore comment is used, but not warned";
const MISSING_CODE_MSG: &str = "svelte-ignore comment must include the code";

/// One extracted, coded `svelte-ignore` item.
struct CodedItem {
    /// The raw code as written (e.g. `a11y-no-noninteractive-tabindex`).
    code: String,
    /// The Svelte-5 spelling (underscored / remapped) used to match warnings.
    code_for_v5: String,
    /// Byte range of the code token (the diagnostic span for an unused report).
    code_start: u32,
    code_end: u32,
    /// Byte range `[start, end)` of the node this comment leads — the scope a
    /// matching warning must fall inside for the ignore to count as used. `None`
    /// when the comment leads no element/block/statement (so it can never match).
    scope: Option<(u32, u32)>,
}

/// Compile-and-match entry point, wired into [`crate::runner::lint_source`].
/// Returns empty when the rule is `Off`.
pub fn no_unused_svelte_ignore_diagnostics(
    source: &str,
    file: &Path,
    base_options: &CompileOptions,
    config: &LintConfig,
    li: &LineIndex,
) -> Vec<Diagnostic> {
    let severity = config.resolve_code(META.name, META.default_severity);
    if severity == Severity::Off {
        return Vec::new();
    }

    // Fast path: the rule is recommended (on by default), but it only has work to
    // do when the source actually contains a `svelte-ignore` directive. Skip the
    // extra parse + compile for every other file.
    if !source.contains("svelte-ignore") {
        return Vec::new();
    }

    // Parse the *original* source so the ignore comments and the nodes they lead
    // are present. (We compile a *stripped* copy below.)
    let Ok(root) = parse(
        source,
        ParseOptions {
            lenient_script: true,
            ..Default::default()
        },
    ) else {
        return Vec::new();
    };

    // `<script>` / `<style>` / `<svelte:options>` live outside `root.fragment`,
    // but a top-level comment can still lead one of them (e.g. a
    // `css-unused-selector` ignore before `<style>`). Their spans are merged into
    // the top-level sibling search.
    let specials: Vec<(u32, u32)> = [
        root.css.as_ref().map(|c| (c.start, c.end)),
        root.instance.as_ref().map(|s| (s.start, s.end)),
        root.module.as_ref().map(|s| (s.start, s.end)),
        root.options.as_ref().map(|o| (o.start, o.end)),
    ]
    .into_iter()
    .flatten()
    .collect();

    // A `<style lang="…">` block in a non-CSS dialect can't be preprocessed here;
    // mirror upstream's strip path — blank its content from the compiled copy and
    // treat a leading CSS-warning ignore as used (see the module docs).
    let non_css_style = non_css_style_block(&root, source);

    let mut missing: Vec<(u32, u32)> = Vec::new();
    let mut coded: Vec<CodedItem> = Vec::new();
    let mut strip_ranges: Vec<(u32, u32)> = Vec::new();
    collect_template_items(
        &root.fragment,
        &specials,
        &mut missing,
        &mut coded,
        &mut strip_ranges,
    );
    collect_script_items(&root, &mut missing, &mut coded, &mut strip_ranges);

    // Blank the non-CSS style content so the compile can't choke on non-CSS syntax
    // (`stripStyleTokens` in upstream `buildStrippedText`).
    if let Some((_, content)) = non_css_style {
        strip_ranges.push(content);
    }

    let dsev = to_dsev(severity);
    let mk = |start: u32, end: u32, message: &str| Diagnostic {
        file: file.to_path_buf(),
        severity: dsev,
        range: range_from_byte(li, start, end),
        message: message.to_string(),
        code: Some(META.name.to_string()),
        source: "svelte",
    };

    let mut out: Vec<Diagnostic> = missing
        .iter()
        .map(|&(s, e)| mk(s, e, MISSING_CODE_MSG))
        .collect();

    // No coded ignores ⇒ nothing more to compute (upstream early-returns here,
    // *after* the missing-code reports).
    if coded.is_empty() {
        return out;
    }

    // Strip the ignore comments and compile; a hard compile error means the
    // warning set is undeterminable, so upstream reports no unused findings.
    let stripped = blank_ranges(source, &strip_ranges);
    let options = CompileOptions {
        generate: GenerateMode::None,
        filename: Some(file.display().to_string()),
        ..base_options.clone()
    };
    let Ok(result) = compile(&stripped, options) else {
        return out;
    };

    // Positioned warnings as (code, (line, column)) — 1-based line, 0-based UTF-16
    // column, matching `LineIndex::position`. Warnings whose code fired but whose
    // span rsvelte_core does not populate are collected separately: they can't be
    // scope-matched, so any ignore for such a code is treated as used rather than
    // reported (a false-positive "unused" would be worse than a missed report —
    // and upstream, whose warnings always carry a span, never hits this).
    let mut warnings: Vec<(&str, (u32, u32))> = Vec::new();
    let mut positionless: std::collections::HashSet<&str> = std::collections::HashSet::new();
    for w in &result.warnings {
        match w.start.as_ref().or(w.end.as_ref()) {
            Some(p) => warnings.push((w.code.as_str(), (p.line as u32, p.column as u32))),
            None => {
                positionless.insert(w.code.as_str());
            }
        }
    }

    for item in &coded {
        let code_fired_without_span = positionless.contains(item.code.as_str())
            || positionless.contains(item.code_for_v5.as_str());
        // A CSS-warning ignore leading the stripped non-CSS `<style>` is used —
        // its warnings are undeterminable without a preprocessor (upstream's
        // `stripStyleElements` loop in `processIgnore`).
        let css_stripped_used = non_css_style
            .is_some_and(|(elem, _)| is_css_warn_code(item) && item.scope == Some(elem));
        let used = code_fired_without_span
            || css_stripped_used
            || item.scope.is_some_and(|(scope_start, scope_end)| {
                let scope_start = li.position(scope_start);
                let scope_end = li.position(scope_end);
                warnings.iter().any(|&(code, pos)| {
                    (code == item.code || code == item.code_for_v5)
                        && scope_start <= pos
                        && pos < scope_end
                })
            });
        if !used {
            out.push(mk(item.code_start, item.code_end, UNUSED_MSG));
        }
    }

    out
}

/// Walk the template, collecting `svelte-ignore` items from `Comment` nodes. Each
/// comment's scope is the next sibling that is neither `Text` nor `Comment` — the
/// node `extractLeadingComments` would attach the comment to.
fn collect_template_items(
    fragment: &Fragment,
    specials: &[(u32, u32)],
    missing: &mut Vec<(u32, u32)>,
    coded: &mut Vec<CodedItem>,
    strip_ranges: &mut Vec<(u32, u32)>,
) {
    let nodes = &fragment.nodes;
    for (i, node) in nodes.iter().enumerate() {
        if let TemplateNode::Comment(c) = node {
            // The scope is the next non-Text, non-Comment sibling's byte range,
            // considering both fragment siblings and the special elements
            // (`<style>` / `<script>`) that sit outside the fragment.
            let frag = nodes[i + 1..].iter().find_map(|n| match n {
                TemplateNode::Text(_) | TemplateNode::Comment(_) => None,
                other => Some(node_span(other)),
            });
            let special = specials
                .iter()
                .filter(|&&(s, _)| s >= c.end)
                .min_by_key(|&&(s, _)| s)
                .copied();
            // The true next sibling is whichever starts first.
            let scope = match (frag, special) {
                (Some(f), Some(s)) => Some(if f.0 <= s.0 { f } else { s }),
                (f, s) => f.or(s),
            };
            parse_ignore_comment(
                &c.data,
                c.start,
                4, // `<!--`
                c.end,
                scope,
                missing,
                coded,
                strip_ranges,
            );
        }
        // Recurse into child fragments. Special elements are top-level only, so
        // nested fragments search siblings alone.
        for child in child_fragments(node) {
            collect_template_items(child, &[], missing, coded, strip_ranges);
        }
    }
}

/// Collect `svelte-ignore` items from `<script>` line/block comments. A comment's
/// scope is the next top-level script statement (the node `getWarningNode` would
/// resolve a script warning to).
fn collect_script_items(
    root: &Root,
    missing: &mut Vec<(u32, u32)>,
    coded: &mut Vec<CodedItem>,
    strip_ranges: &mut Vec<(u32, u32)>,
) {
    // Avoid the (potentially expensive) Program serialization below unless a
    // `<script>` comment is actually a `svelte-ignore` — the common case is
    // template-only ignores, where there is no script work to do.
    if !root
        .comments
        .iter()
        .any(|c| c.value.contains("svelte-ignore"))
    {
        return;
    }

    // Top-level statement spans per script, tagged with that script's bounds so a
    // comment only ever scopes to a statement in its *own* `<script>`.
    let mut stmts: Vec<(u32, u32)> = Vec::new();
    let mut script_bounds: Vec<(u32, u32)> = Vec::new();
    with_serialize_arena(&root.arena, || {
        for script in [root.instance.as_ref(), root.module.as_ref()]
            .into_iter()
            .flatten()
        {
            script_bounds.push((script.start, script.end));
            if let Some(body) = script
                .content
                .as_json()
                .get("body")
                .and_then(Value::as_array)
            {
                for st in body {
                    if let (Some(s), Some(e)) = (
                        st.get("start").and_then(Value::as_u64),
                        st.get("end").and_then(Value::as_u64),
                    ) {
                        stmts.push((s as u32, e as u32));
                    }
                }
            }
        }
    });
    stmts.sort_unstable();

    for c in &root.comments {
        // Only JS comments inside a `<script>` are `svelte-ignore` candidates here.
        let Some(&(_, script_end)) = script_bounds
            .iter()
            .find(|&&(s, e)| s <= c.start && c.end <= e)
        else {
            continue;
        };
        // The next top-level statement in this script (`getWarningNode` resolves a
        // script warning to its top-level statement).
        let scope = stmts
            .iter()
            .find(|&&(s, _)| s >= c.end && s < script_end)
            .copied();
        // `c.value` is the comment text without the `//` / `/* */` delimiters; the
        // delimiter is 2 chars wide for both line and block comments.
        parse_ignore_comment(
            &c.value,
            c.start,
            2,
            c.end,
            scope,
            missing,
            coded,
            strip_ranges,
        );
    }
}

/// Parse one comment's inner `text` for a `svelte-ignore` directive, mirroring
/// upstream's `getSvelteIgnoreItems` / `extractSvelteIgnore`.
///
/// `prefix_len` is the delimiter width (`<!--` = 4, `//` or `/*` = 2);
/// `comment_start` is the comment token's byte offset, so a code token at offset
/// `o` within `text` maps to `comment_start + prefix_len + o`.
fn parse_ignore_comment(
    text: &str,
    comment_start: u32,
    prefix_len: u32,
    comment_end: u32,
    scope: Option<(u32, u32)>,
    missing: &mut Vec<(u32, u32)>,
    coded: &mut Vec<CodedItem>,
    strip_ranges: &mut Vec<(u32, u32)>,
) {
    // SVELTE_IGNORE_PATTERN = /^\s*svelte-ignore\s+/
    let Some(code_list_start) = match_svelte_ignore_prefix(text) else {
        return;
    };
    let code_list = &text[code_list_start..];

    // `hasMissingCodeIgnore`: empty after dropping parenthetical notes + trim.
    // `blank_parentheticals` turns notes into spaces, which `trim` removes — so
    // the trimmed-empty test is equivalent to upstream's note-removal-then-trim.
    if blank_parentheticals(code_list).trim().is_empty() {
        missing.push((comment_start, comment_end));
        return;
    }

    // This comment carries ≥1 code ⇒ strip its whole span before compiling.
    strip_ranges.push((comment_start, comment_end));

    // Absolute byte offset of `code_list`'s first char in the source.
    let base = comment_start + prefix_len + code_list_start as u32;

    // Replace parenthetical notes with equal-length spaces to preserve offsets.
    let processed = blank_parentheticals(code_list);
    let bytes = processed.as_bytes();

    let before = coded.len();
    let mut last_end = 0usize;
    let mut j = 0usize;
    while j < bytes.len() {
        if is_separator(bytes[j]) {
            let sep_start = j;
            while j < bytes.len() && is_separator(bytes[j]) {
                j += 1;
            }
            push_code(
                &processed[last_end..sep_start],
                base,
                last_end as u32,
                scope,
                coded,
            );
            last_end = j;
        } else {
            j += 1;
        }
    }
    // Faithful to upstream: a trailing code after the last separator is only
    // emitted when it is the *sole* token (no separator matched at all).
    if coded.len() == before {
        push_code(&processed, base, 0, scope, coded);
    }
}

/// Push a single code token (skipping empties), recording its absolute span.
fn push_code(
    code: &str,
    base: u32,
    offset: u32,
    scope: Option<(u32, u32)>,
    coded: &mut Vec<CodedItem>,
) {
    if code.is_empty() {
        return;
    }
    coded.push(CodedItem {
        code_for_v5: code_for_v5(code),
        code: code.to_string(),
        code_start: base + offset,
        code_end: base + offset + code.len() as u32,
        scope,
    });
}

/// Map a legacy (Svelte-4) warning code to its Svelte-5 spelling, mirroring
/// upstream's `V5_REPLACEMENTS` (else hyphens → underscores).
fn code_for_v5(code: &str) -> String {
    match code {
        "non-top-level-reactive-declaration" => "reactive_declaration_invalid_placement".into(),
        "module-script-reactive-declaration" => "reactive_declaration_module_script".into(),
        "empty-block" => "block_empty".into(),
        "avoid-is" => "attribute_avoid_is".into(),
        "invalid-html-attribute" => "attribute_invalid_property_name".into(),
        "a11y-structure" => "a11y_figcaption_parent".into(),
        "illegal-attribute-character" => "attribute_illegal_colon".into(),
        "invalid-rest-eachblock-binding" => "bind_invalid_each_rest".into(),
        "unused-export-let" => "export_let_unused".into(),
        _ => code.replace('-', "_"),
    }
}

/// CSS-warning codes whose ignore, when it leads a non-CSS-`lang` `<style>` block
/// that the linter strips (cannot preprocess), is unconditionally treated as used.
/// Mirrors upstream's `CSS_WARN_CODES` (both raw and `codeForV5` are checked).
const CSS_WARN_CODES: &[&str] = &[
    "css-unused-selector",
    "css_unused_selector",
    "css-invalid-global",
    "css-invalid-global-selector",
];

/// Whether `item`'s code (raw or `codeForV5`) is a CSS warning code.
fn is_css_warn_code(item: &CodedItem) -> bool {
    CSS_WARN_CODES.contains(&item.code.as_str())
        || CSS_WARN_CODES.contains(&item.code_for_v5.as_str())
}

/// If the component's `<style>` uses a non-CSS dialect (`lang` attribute present
/// and not `css`), return `(element_range, content_range)`: the element range a
/// leading ignore scopes to, and the inner-content range to blank from the
/// compiled copy. Plain CSS (`<style>` with no `lang`, or `lang="css"`) returns
/// `None` and is analysed normally. Mirrors upstream's
/// `extractStyleElementsWithLangOtherThanCSS`.
fn non_css_style_block(root: &Root, source: &str) -> Option<((u32, u32), (u32, u32))> {
    let css = root.css.as_ref()?;
    // The opening tag spans from `<style` to just before the inner content.
    let open_tag = source.get(css.start as usize..css.content.start as usize)?;
    let lang = crate::svelte_scan::attr_value(open_tag, "lang")?;
    let lang = lang.trim().to_ascii_lowercase();
    if lang.is_empty() || lang == "css" {
        return None;
    }
    Some(((css.start, css.end), (css.content.start, css.content.end)))
}

/// Match `^\s*svelte-ignore\s+`, returning the byte index just past it (where the
/// code list starts). `None` when `text` is not a `svelte-ignore` comment.
fn match_svelte_ignore_prefix(text: &str) -> Option<usize> {
    let b = text.as_bytes();
    let mut i = 0;
    while i < b.len() && is_ws(b[i]) {
        i += 1;
    }
    let rest = &text[i..];
    let after = rest.strip_prefix("svelte-ignore")?;
    // Require ≥1 whitespace after `svelte-ignore`.
    let ab = after.as_bytes();
    if ab.is_empty() || !is_ws(ab[0]) {
        return None;
    }
    let ws = ab.iter().take_while(|&&c| is_ws(c)).count();
    Some(i + "svelte-ignore".len() + ws)
}

/// Replace each complete `(...)` note with spaces of the same length, preserving
/// byte offsets (upstream `PARENTHETICAL_NOTE_PATTERN` replace).
fn blank_parentheticals(s: &str) -> String {
    let bytes = s.as_bytes();
    let mut out = String::with_capacity(s.len());
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] == b'('
            && let Some(rel) = s[i..].find(')')
        {
            for _ in 0..=rel {
                out.push(' ');
            }
            i += rel + 1;
            continue;
        }
        // Push one full UTF-8 char to keep the string valid.
        let ch = s[i..].chars().next().unwrap();
        out.push(ch);
        i += ch.len_utf8();
    }
    out
}

/// Blank out `ranges` in `source`, replacing every non-`\t\n\r` character with
/// one space **per UTF-16 code unit** (upstream `buildStrippedText`'s
/// `/[^\t\n\r ]/g → ' '`, whose non-`/u` regex matches per UTF-16 code unit — so
/// an astral char such as an emoji becomes two spaces, a BMP char one). Keeping
/// the UTF-16 column count keeps line/column structure aligned with the original
/// source, so warning positions from compiling the stripped copy compare
/// correctly against the original AST node spans even when an ignore comment
/// contains multibyte characters (e.g. a non-ASCII parenthetical note).
fn blank_ranges(source: &str, ranges: &[(u32, u32)]) -> String {
    if ranges.is_empty() {
        return source.to_string();
    }
    let mut sorted: Vec<(u32, u32)> = ranges.to_vec();
    sorted.sort_unstable();
    let mut out = String::with_capacity(source.len());
    let mut cursor = 0usize;
    for (s, e) in sorted {
        let (s, e) = (s as usize, e as usize);
        if s < cursor {
            continue; // overlapping/duplicate range already covered
        }
        out.push_str(&source[cursor..s]);
        for ch in source[s..e].chars() {
            if matches!(ch, '\t' | '\n' | '\r') {
                out.push(ch);
            } else {
                for _ in 0..ch.len_utf16() {
                    out.push(' ');
                }
            }
        }
        cursor = e;
    }
    out.push_str(&source[cursor..]);
    out
}

fn is_ws(c: u8) -> bool {
    matches!(c, b' ' | b'\t' | b'\n' | b'\r' | 0x0c | 0x0b)
}

fn is_separator(c: u8) -> bool {
    is_ws(c) || c == b','
}

/// Byte span `(start, end)` of a template node (the variants a `svelte-ignore`
/// comment can lead). Every `TemplateNode` carries `start`/`end`, so this is total.
fn node_span(node: &TemplateNode) -> (u32, u32) {
    match node {
        TemplateNode::Text(n) => (n.start, n.end),
        TemplateNode::Comment(n) => (n.start, n.end),
        TemplateNode::ExpressionTag(n) => (n.start, n.end),
        TemplateNode::HtmlTag(n) => (n.start, n.end),
        TemplateNode::ConstTag(n) => (n.start, n.end),
        TemplateNode::DebugTag(n) => (n.start, n.end),
        TemplateNode::RenderTag(n) => (n.start, n.end),
        TemplateNode::DeclarationTag(n) => (n.start, n.end),
        TemplateNode::AttachTag(n) => (n.start, n.end),
        TemplateNode::IfBlock(n) => (n.start, n.end),
        TemplateNode::EachBlock(n) => (n.start, n.end),
        TemplateNode::AwaitBlock(n) => (n.start, n.end),
        TemplateNode::KeyBlock(n) => (n.start, n.end),
        TemplateNode::SnippetBlock(n) => (n.start, n.end),
        TemplateNode::RegularElement(n) => (n.start, n.end),
        TemplateNode::Component(n) => (n.start, n.end),
        TemplateNode::SvelteComponent(n) => (n.start, n.end),
        TemplateNode::SvelteElement(n) => (n.start, n.end),
        TemplateNode::TitleElement(n) => (n.start, n.end),
        TemplateNode::SlotElement(n) => (n.start, n.end),
        TemplateNode::SvelteBody(n)
        | TemplateNode::SvelteDocument(n)
        | TemplateNode::SvelteFragment(n)
        | TemplateNode::SvelteBoundary(n)
        | TemplateNode::SvelteHead(n)
        | TemplateNode::SvelteOptions(n)
        | TemplateNode::SvelteSelf(n)
        | TemplateNode::SvelteWindow(n) => (n.start, n.end),
    }
}

/// The child fragments of a node, mirroring [`crate::visitor`]'s recursion.
fn child_fragments(node: &TemplateNode) -> Vec<&Fragment> {
    let mut out: Vec<&Fragment> = Vec::new();
    match node {
        TemplateNode::EachBlock(b) => {
            out.push(&b.body);
            if let Some(f) = &b.fallback {
                out.push(f);
            }
        }
        TemplateNode::IfBlock(b) => {
            out.push(&b.consequent);
            if let Some(f) = &b.alternate {
                out.push(f);
            }
        }
        TemplateNode::AwaitBlock(b) => {
            out.extend(
                [b.pending.as_ref(), b.then.as_ref(), b.catch.as_ref()]
                    .into_iter()
                    .flatten(),
            );
        }
        TemplateNode::KeyBlock(b) => out.push(&b.fragment),
        TemplateNode::SnippetBlock(b) => out.push(&b.body),
        TemplateNode::RegularElement(e) => out.push(&e.fragment),
        TemplateNode::Component(e) => out.push(&e.fragment),
        TemplateNode::SvelteComponent(e) => out.push(&e.fragment),
        TemplateNode::SvelteElement(e) => out.push(&e.fragment),
        TemplateNode::TitleElement(e) => out.push(&e.fragment),
        TemplateNode::SlotElement(e) => out.push(&e.fragment),
        TemplateNode::SvelteBody(e)
        | TemplateNode::SvelteDocument(e)
        | TemplateNode::SvelteFragment(e)
        | TemplateNode::SvelteBoundary(e)
        | TemplateNode::SvelteHead(e)
        | TemplateNode::SvelteOptions(e)
        | TemplateNode::SvelteSelf(e)
        | TemplateNode::SvelteWindow(e) => out.push(&e.fragment),
        _ => {}
    }
    out
}

#[cfg(test)]
mod tests {
    use std::path::PathBuf;

    use rsvelte_core::CompileOptions;

    use super::META;
    use crate::config::LintConfig;
    use crate::rule::Severity;
    use crate::runner::lint_source;

    /// `(line, column-1-based, message)` findings for this rule on `src`.
    fn findings(src: &str) -> Vec<(u32, u32, String)> {
        let cfg = LintConfig::empty().with_override(META.name, Severity::Error);
        lint_source(
            src,
            &PathBuf::from("Fixture.svelte"),
            &CompileOptions::default(),
            &cfg,
        )
        .into_iter()
        .filter(|d| d.code.as_deref() == Some(META.name))
        .filter_map(|d| {
            let r = d.range?;
            Some((r.start.line, r.start.column + 1, d.message))
        })
        .collect()
    }

    #[test]
    fn code_for_v5_remaps_legacy_then_underscores() {
        assert_eq!(super::code_for_v5("unused-export-let"), "export_let_unused");
        assert_eq!(super::code_for_v5("empty-block"), "block_empty");
        assert_eq!(
            super::code_for_v5("a11y-no-noninteractive-tabindex"),
            "a11y_no_noninteractive_tabindex"
        );
    }

    #[test]
    fn parenthetical_notes_are_blanked_length_preserving() {
        assert_eq!(super::blank_parentheticals("a (note) b"), "a        b");
        // An unclosed paren is left untouched.
        assert_eq!(super::blank_parentheticals("a (oops"), "a (oops");
    }

    #[test]
    fn off_emits_nothing() {
        let cfg = LintConfig::empty().with_override(META.name, Severity::Off);
        let out: Vec<_> = lint_source(
            "<!-- svelte-ignore a11y_missing_attribute -->\n<img src=\"x\" alt=\"y\" />",
            &PathBuf::from("F.svelte"),
            &CompileOptions::default(),
            &cfg,
        )
        .into_iter()
        .filter(|d| d.code.as_deref() == Some(META.name))
        .collect();
        assert!(out.is_empty(), "Off must emit nothing, got {out:?}");
    }

    #[test]
    fn unused_ignore_is_reported() {
        // No `a11y_*` warning fires (the img is valid), so the ignore is unused.
        let out =
            findings("<!-- svelte-ignore a11y_missing_attribute -->\n<img src=\"x\" alt=\"y\" />");
        assert_eq!(
            out,
            vec![(
                1,
                20,
                "svelte-ignore comment is used, but not warned".into()
            )]
        );
    }

    #[test]
    fn used_ignore_is_not_reported() {
        // The img lacks `alt` ⇒ `a11y_missing_attribute` fires ⇒ ignore is used.
        let out = findings("<!-- svelte-ignore a11y_missing_attribute -->\n<img src=\"x\" />");
        assert!(out.is_empty(), "expected no findings, got {out:?}");
    }

    #[test]
    fn missing_code_is_reported_at_the_comment() {
        let out = findings("<!-- svelte-ignore -->\n<img src=\"x\" alt=\"y\" />");
        assert_eq!(
            out,
            vec![(1, 1, "svelte-ignore comment must include the code".into())]
        );
    }

    #[test]
    fn ignore_in_other_if_branch_is_unused() {
        // The ignore sits in the `{#if}` branch; the warning is in `{:else}` —
        // the comment leads nothing, so it stays unused.
        let src = "{#if x}\n\t<!-- svelte-ignore a11y_missing_attribute -->\n{:else}\n\t<img src=\"a\" />\n{/if}";
        let out = findings(src);
        assert_eq!(out.len(), 1, "expected the ignore reported unused: {out:?}");
        assert_eq!(out[0].0, 2); // reported on the comment's line
    }

    #[test]
    fn non_css_style_ignore_is_treated_as_used() {
        // `<style lang="postcss">` can't be preprocessed, so a leading
        // `css-unused-selector` ignore is treated as used (would otherwise be a
        // false-positive "unused" — `.foo`/`.bar` parse as used CSS).
        let src = "<div class=\"foo\"><div class=\"bar\" /></div>\n\
                   <!-- svelte-ignore css-unused-selector -->\n\
                   <style lang=\"postcss\">.foo { & .bar { color: red; } }</style>";
        let out = findings(src);
        assert!(
            out.is_empty(),
            "non-CSS style ignore must be used, got {out:?}"
        );
    }

    #[test]
    fn plain_css_unused_ignore_is_still_reported() {
        // Plain `<style>` is analysed normally: `.bar` *is* used, so no
        // `css-unused-selector` fires and the ignore is genuinely unused.
        let src = "<div class=\"bar\"></div>\n\
                   <!-- svelte-ignore css-unused-selector -->\n\
                   <style>.bar { color: red; }</style>";
        let out = findings(src);
        assert_eq!(
            out.len(),
            1,
            "plain-CSS unused ignore must be reported: {out:?}"
        );
        assert_eq!(out[0].0, 2); // reported on the comment's line
        assert_eq!(out[0].2, "svelte-ignore comment is used, but not warned");
    }

    #[test]
    fn blank_ranges_replaces_per_utf16_unit_not_per_byte() {
        // Column alignment between the stripped source (compile-warning positions)
        // and the original AST (node spans) requires one space per UTF-16 code
        // unit, mirroring upstream's non-`/u` regex replace.
        // `aあb` is 5 bytes but 3 UTF-16 units → 3 spaces, not 5.
        assert_eq!(super::blank_ranges("Xaあb Y", &[(1, 6)]), "X    Y");
        // An astral char (emoji) is 4 bytes but 2 UTF-16 units → 2 spaces.
        assert_eq!(super::blank_ranges("X😀Y", &[(1, 5)]), "X  Y");
        // Tab / newline / CR are preserved so line structure stays intact.
        assert_eq!(super::blank_ranges("a\tb\nc", &[(0, 5)]), " \t \n ");
    }
}
