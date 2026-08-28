//! Native lint rule engine.
//!
//! It is free of any `svelte_check` (native-only) types, so it can run both on
//! the CLI and in the browser (wasm). It parses the component
//! and walks the template once, returning raw [`LintDiagnostic`]s (byte offsets,
//! fixes intact). Compiler/validator findings are layered on top by the
//! native-only [`runner`](crate::runner).

use std::path::Path;

use rsvelte_core::ast::arena::with_serialize_arena;
use rsvelte_core::ast::template::Root;
use rsvelte_core::{ParseOptions, parse};
use serde_json::Value;

use crate::config::LintConfig;
use crate::context::LintContext;
use crate::diagnostic::LintDiagnostic;
use crate::registry::{all_rules, all_script_rules};
use crate::rule::{RuleMeta, Severity};
use crate::scope::ScopeResolver;
use crate::script::{ProgramView, ScriptKind, ScriptRule};
use crate::visitor::{EnabledRule, LintVisitor};

/// The lenient parse options every lint pass uses. `lenient_script: true` keeps
/// a `<script lang="…">` / invalid-TS block from aborting the parse so the rules
/// still see the template. Every consumer of a shared [`Root`] MUST parse with
/// these exact options (the block-lang fallback's success probe depends on it).
pub(crate) fn lint_parse_options() -> ParseOptions {
    ParseOptions {
        lenient_script: true,
        ..Default::default()
    }
}

/// Run enabled native rules.
///
/// Run every enabled native rule over `source`, returning raw findings. `path`
/// is the file being linted when known (`None` for in-memory / wasm linting);
/// filesystem-aware rules (e.g. `svelte/no-companion-module-shadow`) use it and
/// no-op when it is `None`.
#[must_use]
pub fn run_native_rules(
    source: &str,
    filename: &str,
    config: &LintConfig,
    path: Option<&Path>,
) -> Vec<LintDiagnostic> {
    // Skip the parse entirely when every native rule is off.
    if all_rules()
        .iter()
        .all(|r| config.severity_for(r.meta()) == Severity::Off)
    {
        return Vec::new();
    }
    let Ok(root) = parse(
        source,
        &rsvelte_core::Allocator::default(),
        lint_parse_options(),
    ) else {
        return Vec::new();
    };
    let resolver = maybe_scope_resolver(&root, source, config);
    run_native_rules_on_root(&root, source, filename, config, path, resolver.as_ref())
}

/// Like [`run_native_rules`] but reuses an already-parsed [`Root`] instead of
/// parsing again — lets `lint_source` share one parse across the native walk,
/// the script walk, and the block-lang fallback. `scope_resolver` is likewise
/// built once by the caller and shared with the script pass (see
/// [`maybe_scope_resolver`]).
/// `(content_offset, end)` for each `<script>` block of a parsed component.
fn script_spans_of(root: &Root) -> Vec<(u32, u32)> {
    [root.instance.as_ref(), root.module.as_ref()]
        .into_iter()
        .flatten()
        .map(|s| (s.content_offset, s.end))
        .collect()
}

pub(crate) fn run_native_rules_on_root(
    root: &Root,
    source: &str,
    filename: &str,
    config: &LintConfig,
    path: Option<&Path>,
    scope_resolver: Option<&ScopeResolver>,
) -> Vec<LintDiagnostic> {
    let rules = all_rules();
    let sveltekit = crate::sveltekit::available(path);
    let runes = Some(crate::runes_mode::component_runes_mode(root, source));
    let enabled: Vec<EnabledRule> = rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            if severity == Severity::Off {
                return None;
            }
            if !crate::svelte_version::supports_svelte5(meta.name) {
                return None;
            }
            if !sveltekit && crate::sveltekit::is_sveltekit_only(meta.name) {
                return None;
            }
            if runes_gate_excludes(meta, runes) {
                return None;
            }
            Some(EnabledRule {
                rule: r.as_ref(),
                meta,
                severity,
            })
        })
        .collect();

    if enabled.is_empty() {
        return Vec::new();
    }
    // The template browser-globals check uses `scope_resolver` to tell a `{name}`
    // read of a component binding from the same-named global.
    let mut ctx = LintContext::new(config, source, filename)
        .with_path(path)
        .with_scope_resolver(scope_resolver)
        .with_script_spans(script_spans_of(root));
    // Re-install the arena pointer so that `Expression::Typed::as_json()` can
    // resolve arena-indexed children while the visitor walks the template.
    // The pointer was cleared when `parse()` dropped its `SerializeArenaGuard`.
    with_serialize_arena(&root.arena, || {
        LintVisitor::new(enabled).visit_root(&mut ctx, root);
    });
    ctx.into_diagnostics()
}

/// What kind of file the linter is processing, derived from its extension.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SourceKind {
    /// A `.svelte` component (template + optional `<script>` blocks).
    Svelte,
    /// A standalone JS/TS module (`.svelte.js`, `.svelte.ts`, `.js`, `.ts`, …).
    Module {
        /// Whether the module is TypeScript.
        ts: bool,
    },
}

/// Classify a source file.
///
/// Classify a file by name/extension. `.svelte` → component; `.ts`/`.mts`/`.cts`
/// (incl. `.svelte.ts`) → TS module; `.js`/`.mjs`/`.cjs` (incl. `.svelte.js`) →
/// JS module; anything else defaults to a component.
#[must_use]
pub fn classify_source(filename: &str) -> SourceKind {
    if has_extension(filename, &["svelte"]) {
        SourceKind::Svelte
    } else if has_extension(filename, &["ts", "mts", "cts"]) {
        SourceKind::Module { ts: true }
    } else if has_extension(filename, &["js", "mjs", "cjs"]) {
        SourceKind::Module { ts: false }
    } else {
        SourceKind::Svelte
    }
}

fn has_extension(filename: &str, extensions: &[&str]) -> bool {
    Path::new(filename)
        .extension()
        .and_then(|extension| extension.to_str())
        .is_some_and(|extension| {
            extensions
                .iter()
                .any(|candidate| extension.eq_ignore_ascii_case(candidate))
        })
}

type EnabledScriptRule<'a> = (&'a dyn ScriptRule, &'static RuleMeta, Severity);

/// Whether `meta`'s runes gate excludes this component. Shared by the native and
/// the script pass so the two enforcement sites cannot drift apart.
fn runes_gate_excludes(meta: &RuleMeta, runes: Option<bool>) -> bool {
    runes.is_some_and(|r| (r && meta.conditions.legacy_only) || (!r && meta.conditions.runes_only))
}

/// The enabled (non-`Off`) script rules for `config`.
///
/// `runes` mirrors upstream's tri-state `svelteParseContext.runes`: `None` is
/// its `'undetermined'`, which satisfies both a `runes: [false, …]` and a
/// `runes: [true, …]` condition, so neither side is filtered. Both Svelte
/// source kinds resolve to a definite value, so `None` only ever means "not
/// determined yet".
fn enabled_script_rules<'a>(
    rules: &'a [Box<dyn ScriptRule>],
    config: &LintConfig,
    path: Option<&Path>,
    runes: Option<bool>,
) -> Vec<EnabledScriptRule<'a>> {
    let sveltekit = crate::sveltekit::available(path);
    rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            if severity == Severity::Off
                || !crate::svelte_version::supports_svelte5(meta.name)
                || (!sveltekit && crate::sveltekit::is_sveltekit_only(meta.name))
                || runes_gate_excludes(meta, runes)
            {
                return None;
            }
            Some((r.as_ref(), meta, severity))
        })
        .collect()
}

/// Run each enabled script rule over every `(kind, program)` pair.
fn run_over_programs(
    programs: &[(ScriptKind, &Value)],
    source: &str,
    filename: &str,
    config: &LintConfig,
    enabled: &[EnabledScriptRule<'_>],
    path: Option<&Path>,
    scope_resolver: Option<&ScopeResolver>,
) -> Vec<LintDiagnostic> {
    let mut ctx = LintContext::new(config, source, filename)
        .with_path(path)
        .with_scope_resolver(scope_resolver);
    for (kind, program) in programs {
        // One DFS index per program, shared by every rule (each used to
        // re-descend the whole JSON tree itself).
        let view = ProgramView::new(program);
        for (rule, meta, severity) in enabled {
            ctx.enter_rule(meta, *severity);
            rule.check_program(&mut ctx, &view, *kind);
        }
    }
    ctx.into_diagnostics()
}

/// The rule that consumes the script-scope resolver. Building the resolver runs
/// an extra oxc semantic pass, so the engine only pays for it when this rule is
/// enabled.
pub(crate) const SCOPE_RESOLVER_RULE: &str = "svelte/no-top-level-browser-globals";
pub(crate) const NO_UNDEF_RULE: &str = "svelte/no-undef";

/// Whether any enabled script rule needs the (oxc-semantic-backed) resolver.
fn needs_scope_resolver(enabled: &[EnabledScriptRule<'_>]) -> bool {
    enabled
        .iter()
        .any(|(_, meta, _)| matches!(meta.name, SCOPE_RESOLVER_RULE | NO_UNDEF_RULE))
}

/// Build the scope resolver from a component's `<script>` block(s). Each
/// script's content body — the Program node's absolute `[start, end)` slice — is
/// re-parsed with oxc semantic analysis; the resolver records which identifiers
/// resolve to a local binding (so a name-based rule can exclude locals that
/// share a global's name) and which names are declared at the component's top
/// level (visible to the template). Runs inside a serialize-arena guard so the
/// script Program's `as_json()` span is resolvable.
pub(crate) fn scope_resolver_for_root(root: &Root, source: &str) -> ScopeResolver {
    let mut resolver = ScopeResolver::default();
    with_serialize_arena(&root.arena, || {
        for (script, is_ts) in [
            root.instance.as_ref().map(|s| (s, s.is_typescript)),
            root.module.as_ref().map(|s| (s, s.is_typescript)),
        ]
        .into_iter()
        .flatten()
        {
            let program = script.content.as_json();
            let (Some(start), Some(end)) = (
                program.get("start").and_then(Value::as_u64),
                program.get("end").and_then(Value::as_u64),
            ) else {
                continue;
            };
            let (Ok(start), Ok(end)) = (u32::try_from(start), u32::try_from(end)) else {
                continue;
            };
            if start > end || end as usize > source.len() {
                continue;
            }
            resolver.add_script(&source[start as usize..end as usize], start, is_ts);
        }
    });
    resolver
}

/// Build the scope resolver for `root` — but only when the rule that consumes it
/// is enabled, since the build runs an extra oxc semantic pass. Callers that
/// lint a whole `.svelte` file build this **once** and share the result across
/// both the native (template) and script passes.
pub(crate) fn maybe_scope_resolver(
    root: &Root,
    source: &str,
    config: &LintConfig,
) -> Option<ScopeResolver> {
    // Mirrors the rule's own `config.severity_for(&META)` (its default is Warn).
    (config.resolve_code(SCOPE_RESOLVER_RULE, Severity::Warn) != Severity::Off
        || config.resolve_code(NO_UNDEF_RULE, Severity::Off) != Severity::Off)
        .then(|| scope_resolver_for_root(root, source))
}

/// Run every enabled script-AST rule over a Svelte component's `<script>`
/// block(s), returning raw findings.
///
/// Each program is materialised as an owned `serde_json::Value` (with absolute
/// byte offsets) inside the parse arena, then handed to each rule's
/// `check_program`.
#[must_use]
pub fn run_script_rules(source: &str, filename: &str, config: &LintConfig) -> Vec<LintDiagnostic> {
    run_script_rules_with_path(source, filename, config, None)
}

/// Like [`run_script_rules`] but also threads the file's [`Path`] into the
/// context so path-gated rules (e.g. `SvelteKit` route file detection) work.
#[must_use]
pub fn run_script_rules_with_path(
    source: &str,
    filename: &str,
    config: &LintConfig,
    path: Option<&Path>,
) -> Vec<LintDiagnostic> {
    // `None` is the most permissive gate, so an empty set here is empty under
    // every runes mode — enough to skip the parse the real gate needs.
    let rules = all_script_rules();
    if enabled_script_rules(&rules, config, path, None).is_empty() {
        return Vec::new();
    }
    let Ok(root) = parse(
        source,
        &rsvelte_core::Allocator::default(),
        lint_parse_options(),
    ) else {
        return Vec::new();
    };
    let resolver = maybe_scope_resolver(&root, source, config);
    run_script_rules_on_root(&root, source, filename, config, path, resolver.as_ref())
}

/// Like [`run_script_rules_with_path`] but reuses an already-parsed [`Root`]
/// instead of parsing again (shared-parse fast path in `lint_source`).
/// `scope_resolver` is built once by the caller (see [`maybe_scope_resolver`])
/// and shared with the native pass.
pub(crate) fn run_script_rules_on_root(
    root: &Root,
    source: &str,
    filename: &str,
    config: &LintConfig,
    path: Option<&Path>,
    scope_resolver: Option<&ScopeResolver>,
) -> Vec<LintDiagnostic> {
    let rules = all_script_rules();
    let runes = crate::runes_mode::component_runes_mode(root, source);
    let enabled = enabled_script_rules(&rules, config, path, Some(runes));
    if enabled.is_empty() {
        return Vec::new();
    }

    // Materialise each script program as an ESTree JSON value. The
    // serialization MUST run inside the arena scope (the program body resolves
    // arena-indexed children) and BEFORE any out-of-scope `as_json` would cache
    // an empty body — so we serialize immediately inside the arena guard. The
    // values stay borrowed from the program's own `OnceCell` cache: copying
    // them out would deep-clone an entire ESTree tree per file.
    let programs: Vec<(ScriptKind, &Value)> = with_serialize_arena(&root.arena, || {
        let mut out = Vec::new();
        if let Some(s) = root.instance.as_ref() {
            out.push((ScriptKind::Instance, s.content.as_json()));
        }
        if let Some(s) = root.module.as_ref() {
            out.push((ScriptKind::Module, s.content.as_json()));
        }
        out
    });
    if programs.is_empty() {
        return Vec::new();
    }
    run_over_programs(
        &programs,
        source,
        filename,
        config,
        &enabled,
        path,
        scope_resolver,
    )
}

/// Run every enabled script-AST rule over a standalone JS/TS **module** file
/// (`*.svelte.js` / `*.svelte.ts` / `*.js` / `*.ts`), returning raw findings.
///
/// The whole file is parsed as a module program (byte offsets relative to the
/// file), so script rules report at file-accurate positions.
#[must_use]
pub fn run_script_rules_module(
    source: &str,
    filename: &str,
    is_ts: bool,
    config: &LintConfig,
    path: Option<&Path>,
) -> Vec<LintDiagnostic> {
    let rules = all_script_rules();
    // A `.svelte.(js|ts)` module is runes mode by definition, which is what
    // disables upstream's legacy-only rules there.
    let enabled = enabled_script_rules(&rules, config, path, Some(true));
    if enabled.is_empty() {
        return Vec::new();
    }
    let program = rsvelte_core::compiler::phases::parse_module_to_estree(source, is_ts);
    let programs = [(ScriptKind::Module, &program)];
    // A standalone module is its own scope; the whole file is the script body
    // (base offset 0).
    let resolver = needs_scope_resolver(&enabled).then(|| {
        let mut r = ScopeResolver::default();
        r.add_script(source, 0, is_ts);
        r
    });
    run_over_programs(
        &programs,
        source,
        filename,
        config,
        &enabled,
        path,
        resolver.as_ref(),
    )
}
