//! Compat oracle (design doc §F) — a RuleTester-equivalent harness that drives
//! the real eslint-plugin-svelte fixtures through the ported native rules and
//! asserts parity on every field the upstream fixtures actually store:
//!
//! - **valid/** fixtures → **zero** findings for the rule.
//! - **invalid/** fixtures → the exact set of `(message, line, column)` from the
//!   sibling `*-errors.yaml`, in order, with the same count.
//! - **fixable** rules → applying `--fix` reproduces the `*-output.svelte`
//!   fixture byte-for-byte (when present).
//!
//! eslint-plugin-svelte's `*-errors.yaml` stores `message` (resolved text),
//! 1-based `line`, 1-based `column`, and `suggestions` — but **no** `messageId`,
//! `endLine` or `endColumn` (verified across the corpus). rsvelte emits 1-based
//! lines and 0-based (UTF-16) columns, so we compare `our_column + 1` to the
//! fixture column.
//!
//! Fixtures that exercise a behaviour the port doesn't cover yet are listed in
//! [`SKIP`] with the reason. The test skips entirely when the
//! `eslint-plugin-svelte` submodule isn't checked out.

use std::path::{Path, PathBuf};

use rsvelte_core::CompileOptions;
use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_lint::line_index::LineIndex;
use rsvelte_lint::registry::registered_rule_metas;
use rsvelte_lint::{
    Fixable, LintConfig, LintDiagnostic, Severity, fix_source, lint_source, lint_source_raw,
};
use serde::Deserialize;
use serde_json::Value;

/// One rule under test, derived from the live registry: its rule id, the
/// upstream fixture directory (the id with the `svelte/` prefix stripped), and
/// whether it emits an autofix (`Fixable::Code`) — gating the
/// `*-output.svelte` byte-parity comparison.
struct RuleUnderTest {
    code: &'static str,
    dir: &'static str,
    fixable: bool,
}

/// Build the rules-under-test list from the registered rule metas, so adding a
/// rule to either registry automatically subjects it to upstream-fixture
/// parity — no hand-maintained list. Mirrors upstream `loadTestCases`, which
/// derives `fixable` from `plugin.rules[name].meta.fixable != null`.
fn rules_under_test() -> Vec<RuleUnderTest> {
    registered_rule_metas()
        .into_iter()
        .filter(|m| !NO_FIXTURE_RULES.contains(&m.name))
        .map(|m| RuleUnderTest {
            code: m.name,
            dir: m.name.strip_prefix("svelte/").unwrap_or(m.name),
            fixable: m.fixable == Fixable::Code,
        })
        .collect()
}

/// Registered rules with no `tests/fixtures/rules/<rule>/` directory upstream
/// because their tests are written inline (not fixture-driven). These are
/// exercised by dedicated Rust tests instead, so the fixture-coverage check
/// would otherwise flag them as "no fixtures".
const NO_FIXTURE_RULES: &[&str] = &[
    // `comment-directive` is a meta-rule (no per-node hook); upstream tests it
    // inline in `tests/src/rules/comment-directive.ts`. Covered by
    // `crate::rules::comment_directive` unit tests + `tests/comment_directive.rs`.
    "svelte/comment-directive",
    // `no-companion-module-shadow` is an rsvelte-only rule (issue #800) with no
    // upstream eslint-plugin-svelte fixture dir. Covered by the inline
    // `crate::rules::no_companion_module` unit tests.
    "svelte/no-companion-module-shadow",
];

/// Meta-rules whose findings come from the whole-component compile / source-scan
/// path (`lint_source` output diagnostics) rather than the raw native/script
/// rule path, and which never carry editor suggestions.
fn is_meta_rule(code: &str) -> bool {
    matches!(
        code,
        "svelte/valid-compile"
            | "svelte/valid-style-parse"
            | "svelte/experimental-require-slot-types"
            | "svelte/experimental-require-strict-events"
            | "svelte/require-event-dispatcher-types"
            | "svelte/require-event-prefix"
            | "svelte/no-unused-props"
            | "svelte/no-unused-svelte-ignore"
    )
}

/// Fixture path substrings to skip, each with the porting gap it exercises.
const SKIP: &[&str] = &[
    // `require-store-reactive-access` TS fixtures: store detection by TYPE (a
    // value whose type has a `subscribe` signature, imported from external `.ts`
    // modules) needs the TypeScript checker / tsgo. The ES path (stores created
    // via `writable`/`readable`/`derived`) covers every non-`ts/` fixture.
    "require-store-reactive-access/valid/ts/",
    "require-store-reactive-access/invalid/ts/",
    // rsvelte serializes a *computed* object-property key with an off-by-one
    // span (the key node starts at the `[`), so the reported column / `$`-insert
    // offset for `{ [store]: … }` don't match. A core serialization quirk, not a
    // rule gap; every other store-access position is covered.
    "require-store-reactive-access/invalid/properties01",
    // Duplicate-property detection inside a ternary *interpolation* (the plugin
    // collapses both branches); the port treats interpolations as opaque.
    "no-dupe-style-properties/invalid/ternary01",
    // Compound `&&` condition: the plugin reports at the precise covered
    // sub-expression node (paren-stripped), e.g. column 17 for
    // `d && ((c && e && b) || a)`. The text-based operand split reports at the
    // whole condition (column 11). Logic/count are correct; only the column of
    // that one compound branch differs.
    "no-dupe-else-if-blocks/invalid/test02",
    // ESLint ≤8 `no-inner-declarations` fixtures (older option/strict-mode
    // semantics). rsvelte mirrors the ESLint ≥9 rule, exercised by the
    // sibling non-`v8` fixtures.
    "no-inner-declarations/invalid/v8",
    // `prefer-svelte-reactivity` exported-instance fixtures are `.svelte.js`
    // modules exercising the export path (flag exported `new X()` even without
    // mutation), which is not ported — the mutation path covers the rest.
    "prefer-svelte-reactivity/invalid/exports",
    // `no-top-level-browser-globals` template-position case: the globals are used
    // in markup (`{location.href}` / `{#if browser}`), not in `<script>`. This is
    // a script-AST rule, so template usage is out of scope (would need a separate
    // template-AST pass). All `<script>`-based fixtures are covered.
    "no-top-level-browser-globals/invalid/in-template01",
    // `no-shorthand-style-property-overrides` ternary fixture: CSS declarations
    // written INSIDE a mustache interpolation (`{cond ? `background: x` : …}`).
    // Parsing CSS inside template interpolations is out of scope; the static
    // `style=""` and `style:` directive cases are covered.
    "no-shorthand-style-property-overrides/invalid/ternary01",
    // `no-add-event-listener` TS-cast case: `(window.addEventListener as any)(…)`.
    // rsvelte's ESTree strips the TS `as` cast, so the call's callee looks like a
    // plain `window.addEventListener` member (upstream keeps it a TSAsExpression
    // and skips it). The non-cast member/identifier cases are covered.
    "no-add-event-listener/invalid/typescript01",
    // `valid-compile` `svelte.config.js` `onwarn` / `warningFilter` callbacks are
    // JS functions; a native Rust linter can't execute them, so the fixtures that
    // transform/suppress warnings via those callbacks are out of scope.
    "valid-compile/invalid/svelte-config-onwarn",
    "valid-compile/invalid/svelte-config-custom-warn",
    "valid-compile/invalid/svelte-config-warning-filter",
    "valid-compile/valid/svelte-config-onwarn",
    "valid-compile/valid/svelte-config-warning-filter",
    // `experimental.async` enabled via a `_config.cjs` (JS config) — same reason.
    "valid-compile/valid/svelte-config-experimental-async",
    // `valid-compile` compile-*error* fixtures: rsvelte's `AnalysisError` variants
    // carry no source span yet (they report at the default position), so the exact
    // line/column of `experimental_async` / `dollar_prefix_invalid` can't be
    // matched. The warning-kind fixtures (a11y, css_unused_selector,
    // svelte-ignore scoping) are covered.
    "valid-compile/invalid/experimental-async-disabled",
    "valid-compile/invalid/ts/",
    // `valid-compile` Babel-only JS syntax (function-bind `::`) the rsvelte JS
    // parser doesn't accept; upstream uses a Babel parser in the fixture config.
    "valid-compile/valid/babel/",
    // `valid-compile` rsvelte_core compiler divergences (would need compiler-side
    // fixes with corpus-wide regression risk, out of scope for the rule port):
    //  - empty `{#await}` *pending* block doesn't emit `block_empty`.
    "valid-compile/invalid/invalid-svelte-ignore03",
    //  - `custom_element_props_identifier` is emitted at the component start (no
    //    precise span), and `<svelte:options customElement>` additionally
    //    over-emits `options_missing_custom_element`.
    "valid-compile/invalid/custom_element_props_identifier",
    "valid-compile/valid/valid-custom-element-with-props-identifier",
    "valid-compile/valid/svelte-options-custom-element",
    // `valid-style-parse` CSS parse-error fixtures: the upstream message embeds
    // PostCSS's own error text/position (`…:4:11: Unknown word .div-class/35`),
    // which rsvelte's hand-written CSS parser can't reproduce byte-for-byte
    // (and a `lang="scss"` body needs a real SCSS preprocessor). The
    // `unknown-lang` and valid fixtures are covered. rsvelte still surfaces an
    // invalid `<style>` as a hard `parse-error` via the validator wrap.
    "valid-style-parse/invalid/invalid-css01",
    "valid-style-parse/invalid/invalid-scss01",
    // `no-navigation-without-resolve` fixtures that require the TypeScript type
    // checker to determine whether an identifier is typed as `ResolvedPathname`,
    // `null`, or `undefined` from `$app/types`. This oracle exercises the
    // CORSA-FREE native path (CI cannot clone the private corsa submodule), so
    // these stay skipped here; the type-aware path that resolves them is covered
    // end-to-end against a real `tsgo` by `rsvelte_lint_types`'s
    // `nav_type_aware_e2e` tests (rule logic: `no_navigation_without_resolve::diagnostics_typed`).
    "no-navigation-without-resolve/valid/goto-resolved-pathname01",
    "no-navigation-without-resolve/valid/goto-resolved-pathname02",
    "no-navigation-without-resolve/valid/pushState-resolved-pathname01",
    "no-navigation-without-resolve/valid/pushState-resolved-pathname02",
    "no-navigation-without-resolve/valid/replaceState-resolved-pathname01",
    "no-navigation-without-resolve/valid/replaceState-resolved-pathname02",
    "no-navigation-without-resolve/valid/link-resolved-pathname01",
    "no-navigation-without-resolve/valid/link-resolved-pathname02",
    "no-navigation-without-resolve/valid/link-nullish-resolved-pathname",
    // `link-nullish02`: TypeScript-typed props (`one: undefined`, `two: null`,
    // `href: null`) — without TS the rule can't detect these are nullish.
    "no-navigation-without-resolve/valid/link-nullish02",
    // ── svelte/indent skips ────────────────────────────────────────────────
    // All `script-*` invalid fixtures exercise indentation inside `<script>`
    // blocks (JS/TS AST level): arrays, binary expressions, class bodies,
    // calls, conditionals, do-while, exports, for, functions, if-statements,
    // imports, members, methods, props, switch, try, unary, yield.  These
    // need a full JS/TS AST rule (not the template-level walk) to implement
    // and are out of scope for the current port.
    "indent/invalid/script-",
    // All TypeScript-specific invalid fixtures (`ts/` and `ts-v5/`) require
    // the TypeScript AST for TS-syntax nodes (generic type parameters,
    // decorators, accessor properties, import assertions/attributes, satisfies,
    // instantiation expressions, enums, conditional types, …).
    "indent/invalid/ts/",
    "indent/invalid/ts-v5/",
    // `switch-case/` has a JS switch-statement fixture requiring the JS AST.
    "indent/invalid/switch-case/",
    // `import-declaration01`: ES import\'s named-specifier brace indentation
    // requires the JS AST to track `{ foo }` as a grouped list — the template
    // walker only sees the `<script>` body at a flat level.
    "indent/invalid/import-declaration01",
    // `each01`: `{#each cats as { id, name }, i}` — rsvelte_core does not yet
    // parse destructuring patterns in `{#each}` context; the file fails to
    // compile, so the lint pass never runs.
    "indent/invalid/each01",
    // `const-tag01`: `{@const area = box.width * box.height}` — the
    // expression-body indentation (= at base+3, * at base+4) requires the JS
    // AST for BinaryExpression / AssignmentExpression offset tracking.
    "indent/invalid/const-tag01",
    // `declaration-tag` (invalid): `{let …}` / `{const …}` — same reason as
    // const-tag01; the JS expression tree drives operand indentation.
    "indent/invalid/declaration-tag",
    // `align-attributes-vertically/attrs01`: uses
    // `alignAttributesVertically: true` option — vertical attribute alignment
    // is a separate layout feature not yet implemented.
    "indent/invalid/align-attributes-vertically/",
    // ── valid/ fixtures with unfixable false positives ─────────────────────
    // `pug01`: uses `lang="pug"` template — pug syntax is not parsed by
    // rsvelte, so the indentation walk mis-fires on the raw pug lines.
    "indent/valid/pug01",
    // `ts/ts-import-type01`: TypeScript `import type { … }` multi-line form
    // inside `<script lang="ts">` — needs TS AST.
    "indent/valid/ts/",
    // `declaration-tag` (valid): `{let …}` multi-line initialiser indentation
    // is reported as wrong because the JS expression body is opaque to the
    // template walker.
    "indent/valid/declaration-tag",
    // ── svelte/no-unused-props skips ───────────────────────────────────────
    // Requires the TypeScript type checker (extends, intersections, generics,
    // imported types, index signatures, nested property checking, custom config
    // options). Skipped on this corsa-free native path; the type-aware path
    // (`no_unused_props::diagnostics_typed`) is covered end-to-end against a real
    // `tsgo` by `rsvelte_lint_types`'s `type_aware_e2e` tests for the
    // type-resolution cases (extends / intersection / nested). The remaining
    // options-origin edge cases (`checkImportedTypes` symbol-origin,
    // `ignore*-patterns`, `index-signature` message, `custom-config-combination`)
    // are tracked as follow-ups in docs/svelte-lint-design.md.
    "no-unused-props/invalid/extends-unused",
    "no-unused-props/invalid/generic-props-unused",
    "no-unused-props/invalid/ignore-external-type",
    "no-unused-props/invalid/ignore-property-patterns-custom",
    "no-unused-props/invalid/ignored-type-patterns-custom",
    "no-unused-props/invalid/imported-type-check",
    "no-unused-props/invalid/imported-type-unused",
    "no-unused-props/invalid/index-signature-no-rest",
    "no-unused-props/invalid/intersection-unused",
    "no-unused-props/invalid/multiple-extends-unused",
    "no-unused-props/invalid/nested-unused",
    "no-unused-props/invalid/parent-interface-unused",
    "no-unused-props/invalid/unused-index-signature",
    "no-unused-props/invalid/custom-config-combination",
    // ── svelte/no-unused-svelte-ignore skips ──────────────────────────────
    // `<style lang="sass|stylus">` need a real SASS / Stylus preprocessor to
    // transpile to CSS before the compiler can decide whether a selector is
    // unused; a native linter can't run them (same reason as `valid-style-parse`).
    // The `postcss` fixtures (`style-lang01/02/03/05`, `transform-test`) parse as
    // plain CSS and are covered.
    "no-unused-svelte-ignore/invalid/style-lang04",
    "no-unused-svelte-ignore/invalid/style-lang06",
    // `ts-lang01-svelte4` exercises Svelte-4 legacy semantics (`export let` +
    // the `unused-export-let` → `export_let_unused` warning). rsvelte runs
    // Svelte-5 semantics; the Svelte-5 variant (`ts-lang01`) is covered.
    "no-unused-svelte-ignore/valid/ts-lang01-svelte4",
    // Valid fixtures that would produce false positives without custom options.
    "no-unused-props/valid/ignore-property-patterns-default",
    "no-unused-props/valid/ignore-property-patterns-custom",
    "no-unused-props/valid/custom-config-combination",
    "no-unused-props/valid/ignored-type-patterns-custom",
    "no-unused-props/valid/ignored-type-patterns-custom2",
];

/// Upstream fixture directories that are **not** an eslint-plugin-svelte rule and
/// so are intentionally never ported. Every other fixture directory under
/// `tests/fixtures/rules/` MUST map to a registered rule, or the coverage gate in
/// [`oracle_strict_parity`] fails — this is what makes "all rules are ported" an
/// enforced invariant rather than a hope: adding a new rule upstream (a new
/// fixture dir) breaks CI until it is ported here or explicitly waived below with
/// a documented reason.
///
/// - `@typescript-eslint`: an *integration* fixture dir (`@typescript-eslint/
///   no-unnecessary-condition`) that checks the plugin's parser/processor against
///   the third-party `@typescript-eslint` rule. It is not a rule this plugin
///   defines, so there is nothing to port.
const OUT_OF_SCOPE_RULES: &[&str] = &["@typescript-eslint"];

/// One expected error from a `*-errors.yaml` file.
#[derive(Debug, Deserialize)]
struct ExpectedError {
    message: String,
    line: u32,
    column: u32,
    /// Editor suggestions (ESLint `suggest`). `None` ⇒ the finding offers no
    /// suggestions; the actual diagnostic must then carry none either. Upstream
    /// compares only `{ desc, output }` (dropping `messageId`), so we do too.
    #[serde(default)]
    suggestions: Option<Vec<ExpectedSuggestion>>,
}

/// One expected suggestion: its description and the full source after applying
/// just that suggestion's edits (upstream's `output`).
#[derive(Debug, Deserialize)]
struct ExpectedSuggestion {
    desc: String,
    output: String,
    // `messageId` is present in the fixtures but excluded from upstream's
    // comparison; accepted so deserialization succeeds.
    #[serde(default)]
    #[allow(dead_code)]
    #[serde(rename = "messageId")]
    message_id: Option<String>,
}

fn fixture_root() -> Option<PathBuf> {
    let p = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("../..")
        .join("submodules/eslint-plugin-svelte/packages/eslint-plugin-svelte/tests/fixtures/rules");
    if p.exists() { Some(p) } else { None }
}

fn is_skipped(path: &Path) -> bool {
    let s = path.to_string_lossy().replace('\\', "/");
    SKIP.iter().any(|frag| s.contains(frag))
}

/// Recursively collect fixture input files: a `.svelte` (or `.svelte.ts`) file
/// whose stem ends with `input`, or a SvelteKit-style `+*.svelte` file.
fn collect_inputs(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.starts_with('_') {
            continue;
        }
        if path.is_dir() {
            collect_inputs(&path, out);
        } else if is_input(&name) {
            out.push(path);
        }
    }
}

fn is_input(name: &str) -> bool {
    // `.svelte` components plus standalone JS/TS module fixtures
    // (`*.svelte.js`, `*.svelte.ts`, `*.js`, `*.ts`).
    let is_lintable = name.ends_with(".svelte") || name.ends_with(".js") || name.ends_with(".ts");
    if !is_lintable {
        return false;
    }
    // stem (minus all extensions) ends with `input`, or a SvelteKit `+page` etc.
    let stem = name.split('.').next().unwrap_or("");
    stem.ends_with("input") || name.starts_with('+')
}

/// Derive the `*-errors.yaml` path for an input file.
fn errors_path(input: &Path) -> Option<PathBuf> {
    let dir = input.parent()?;
    let name = input.file_name()?.to_string_lossy().to_string();
    let errors = if name.starts_with('+') {
        "errors.yaml".to_string()
    } else {
        let idx = name.find("input")?;
        format!("{}errors.yaml", &name[..idx])
    };
    Some(dir.join(errors))
}

/// Derive the `*-output.svelte` path for an input file.
fn output_path(input: &Path) -> Option<PathBuf> {
    let dir = input.parent()?;
    let name = input.file_name()?.to_string_lossy().to_string();
    let out = if name.starts_with('+') {
        "output.svelte".to_string()
    } else {
        let idx = name.find("input")?;
        format!("{}output{}", &name[..idx], &name[idx + "input".len()..])
    };
    Some(dir.join(out))
}

/// Load a fixture's `options` array from `<case>-config.json` or `_config.json`.
fn load_options(input: &Path) -> Option<Value> {
    let dir = input.parent()?;
    let name = input.file_name()?.to_string_lossy().to_string();
    let stem = name.split('.').next().unwrap_or("");
    let per_case = stem
        .strip_suffix("input")
        .map(|p| dir.join(format!("{p}config.json")));
    let candidates = [per_case, Some(dir.join("_config.json"))];
    for cand in candidates.into_iter().flatten() {
        if let Ok(txt) = std::fs::read_to_string(&cand)
            && let Ok(v) = serde_json::from_str::<Value>(&txt)
            && let Some(opts) = v.get("options")
        {
            return Some(opts.clone());
        }
    }
    None
}

/// Whether a fixture's `svelte` requirement (if any) admits Svelte 5. We run
/// Svelte-5 semantics, so legacy-only (`^3`/`^4` without 5) fixtures are skipped.
fn requirements_ok(input: &Path) -> bool {
    let Some(dir) = input.parent() else {
        return true;
    };
    let name = input.file_name().map(|n| n.to_string_lossy().to_string());
    let stem = name
        .as_deref()
        .and_then(|n| n.split('.').next())
        .unwrap_or("");
    let per_case = format!(
        "{}requirements.json",
        stem.strip_suffix("input").unwrap_or("")
    );
    for cand in [dir.join(per_case), dir.join("_requirements.json")] {
        if let Ok(txt) = std::fs::read_to_string(&cand)
            && let Ok(v) = serde_json::from_str::<Value>(&txt)
            && let Some(range) = v.get("svelte").and_then(Value::as_str)
        {
            return svelte5_in_range(range);
        }
    }
    true
}

/// Crude semver-range admittance for Svelte 5: true unless the range is clearly
/// legacy-only (mentions 3/4 but not 5 and not an open lower bound).
fn svelte5_in_range(range: &str) -> bool {
    let r = range.to_lowercase();
    if r.contains('5') || r.contains(">=3") || r.contains(">=4") || r.contains('*') {
        return true;
    }
    // e.g. "^3.0.0 || ^4.0.0" → legacy only.
    !(r.contains('3') || r.contains('4'))
}

fn findings_for(source: &str, file: &Path, code: &str, options: &Option<Value>) -> Vec<Diagnostic> {
    let mut cfg = LintConfig::empty().with_override(code, Severity::Error);
    if let Some(opts) = options {
        cfg = cfg.with_options(code, opts.clone());
    }
    // Use the fixture's real filename so the linter classifies `.js`/`.ts`
    // module fixtures (not just `.svelte` components) correctly.
    let name = file
        .file_name()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("Fixture.svelte"));
    lint_source(source, &name, &CompileOptions::default(), &cfg)
        .into_iter()
        .filter(|d| d.code.as_deref() == Some(code))
        .collect()
}

/// `(line, column-1-based, message)` for an emitted diagnostic.
fn actual_tuple(d: &Diagnostic) -> (u32, u32, String) {
    let (line, col) = d
        .range
        .map(|r| (r.start.line, r.start.column))
        .unwrap_or((1, 0));
    (line, col + 1, d.message.clone())
}

/// Raw rule diagnostics for `code` (carrying their fixes + suggestions), used
/// for the suggestion-parity comparison the line/column output type can't
/// express.
fn raw_findings_for(
    source: &str,
    file: &Path,
    code: &str,
    options: &Option<Value>,
) -> Vec<LintDiagnostic> {
    let mut cfg = LintConfig::empty().with_override(code, Severity::Error);
    if let Some(opts) = options {
        cfg = cfg.with_options(code, opts.clone());
    }
    let name = file
        .file_name()
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("Fixture.svelte"));
    lint_source_raw(source, &name, &cfg)
        .into_iter()
        .filter(|d| d.rule == code)
        .collect()
}

/// A full comparable record: `(line, column-1-based, message, suggestions)`,
/// where each suggestion is `(desc, source-after-applying-it)` — exactly the
/// `{ desc, output }` pair upstream's RuleTester compares.
type FullRecord = (u32, u32, String, Vec<(String, String)>);

fn actual_record(d: &LintDiagnostic, li: &LineIndex, source: &str) -> FullRecord {
    let (line, col) = li.position(d.start);
    let suggestions = d
        .suggestions
        .iter()
        .map(|s| (s.desc.clone(), s.fix.apply(source)))
        .collect();
    (line, col + 1, d.message.clone(), suggestions)
}

/// A `FullRecord` from an output [`Diagnostic`] (line/column already resolved),
/// with no suggestions — used for meta-rules like `valid-compile`.
fn output_record(d: &Diagnostic) -> FullRecord {
    let (line, col) = d
        .range
        .map(|r| (r.start.line, r.start.column))
        .unwrap_or((1, 0));
    (line, col + 1, d.message.clone(), Vec::new())
}

fn expected_record(e: &ExpectedError) -> FullRecord {
    let suggestions = e
        .suggestions
        .as_ref()
        .map(|v| {
            v.iter()
                .map(|s| (s.desc.clone(), s.output.clone()))
                .collect()
        })
        .unwrap_or_default();
    (e.line, e.column, e.message.clone(), suggestions)
}

#[test]
fn oracle_strict_parity() {
    let Some(root) = fixture_root() else {
        eprintln!("Skipping oracle: eslint-plugin-svelte submodule not checked out");
        return;
    };

    let mut checked = 0usize;
    let mut failures: Vec<String> = Vec::new();

    let under_test = rules_under_test();

    // Coverage: every registered rule must map to an upstream fixture directory.
    // A registered rule with no fixtures is almost certainly a typo'd id or a
    // rule that doesn't exist upstream — fail loudly rather than silently pass.
    for rut in &under_test {
        if !root.join(rut.dir).exists() {
            failures.push(format!(
                "[no fixtures] registered rule `{}` has no upstream fixture dir `{}/`",
                rut.code, rut.dir
            ));
        }
    }

    for rut in &under_test {
        let RuleUnderTest { dir, code, fixable } = *rut;
        let rule_dir = root.join(dir);
        if !rule_dir.exists() {
            continue;
        }

        // valid → zero findings.
        let mut valid = Vec::new();
        collect_inputs(&rule_dir.join("valid"), &mut valid);
        for input in valid {
            if is_skipped(&input) || !requirements_ok(&input) {
                continue;
            }
            let Ok(src) = std::fs::read_to_string(&input) else {
                continue;
            };
            let found = findings_for(&src, &input, code, &load_options(&input));
            checked += 1;
            if !found.is_empty() {
                failures.push(format!(
                    "[false positive] {}: expected 0, got {:?}",
                    input.display(),
                    found.iter().map(actual_tuple).collect::<Vec<_>>()
                ));
            }
        }

        // invalid → exact (message, line, column) set.
        let mut invalid = Vec::new();
        collect_inputs(&rule_dir.join("invalid"), &mut invalid);
        for input in invalid {
            if is_skipped(&input) || !requirements_ok(&input) {
                continue;
            }
            let Ok(src) = std::fs::read_to_string(&input) else {
                continue;
            };
            let Some(epath) = errors_path(&input) else {
                continue;
            };
            let Ok(eyaml) = std::fs::read_to_string(&epath) else {
                continue;
            };
            let Ok(expected) = serde_yaml::from_str::<Vec<ExpectedError>>(&eyaml) else {
                failures.push(format!("[bad errors.yaml] {}", epath.display()));
                continue;
            };
            checked += 1;

            // Compare the full record set — (line, column, message, suggestions)
            // — so message/position *and* every offered suggestion's
            // description + applied output match upstream exactly.
            let li = LineIndex::new(&src);
            let opts = load_options(&input);
            let mut exp: Vec<FullRecord> = expected.iter().map(expected_record).collect();
            // Meta-rules (`valid-compile`, `valid-style-parse`) are emitted via the
            // compiler/source-scan path (output diagnostics), not the raw
            // native/script rule path, and never carry editor suggestions — source
            // them from `findings_for`.
            let mut act: Vec<FullRecord> = if is_meta_rule(code) {
                findings_for(&src, &input, code, &opts)
                    .iter()
                    .map(output_record)
                    .collect()
            } else {
                raw_findings_for(&src, &input, code, &opts)
                    .iter()
                    .map(|d| actual_record(d, &li, &src))
                    .collect()
            };
            exp.sort();
            act.sort();
            if exp != act {
                failures.push(format!(
                    "[mismatch] {}\n    expected {:#?}\n    actual   {:#?}",
                    input.display(),
                    exp,
                    act
                ));
                continue;
            }

            // Autofix parity (when the rule is fixable and an output exists).
            if fixable
                && let Some(opath) = output_path(&input)
                && let Ok(expected_out) = std::fs::read_to_string(&opath)
            {
                let mut cfg = LintConfig::empty().with_override(code, Severity::Error);
                if let Some(opts) = load_options(&input) {
                    cfg = cfg.with_options(code, opts);
                }
                let fixed = fix_source(&src, &cfg).output;
                if fixed != expected_out {
                    failures.push(format!(
                        "[fix mismatch] {}\n    expected:\n{}\n    actual:\n{}",
                        input.display(),
                        expected_out,
                        fixed
                    ));
                }
            }
        }
    }

    assert!(
        checked > 0,
        "oracle ran no fixtures — directory layout changed?"
    );
    assert!(
        failures.is_empty(),
        "compat-oracle parity failures ({}):\n\n{}",
        failures.len(),
        failures.join("\n\n")
    );

    // Dead-skip gate: every `SKIP` fragment must still match at least one real
    // fixture path. A stale skip (typo, or a fixture upstream renamed/removed)
    // would silently stop excluding anything — or worse, mask a future fixture —
    // so an unused skip is a hard failure. This keeps the documented skip set
    // honest as the upstream submodule moves.
    let mut all_inputs: Vec<PathBuf> = Vec::new();
    collect_inputs(&root, &mut all_inputs);
    let all_paths: Vec<String> = all_inputs
        .iter()
        .map(|p| p.to_string_lossy().replace('\\', "/"))
        .collect();
    let dead_skips: Vec<&str> = SKIP
        .iter()
        .copied()
        .filter(|frag| !all_paths.iter().any(|p| p.contains(frag)))
        .collect();
    assert!(
        dead_skips.is_empty(),
        "oracle dead-skip gate: {} SKIP entr(ies) match no fixture (remove or fix): {}",
        dead_skips.len(),
        dead_skips.join(", ")
    );

    // Coverage gate: every upstream rule fixture directory must map to a
    // registered rule (or be explicitly out of scope). This is the enforced
    // half of the porting guarantee — a newly-added upstream rule fails CI here
    // until it is ported or waived in `OUT_OF_SCOPE_RULES`.
    let registered: std::collections::HashSet<&str> = under_test.iter().map(|r| r.dir).collect();
    let mut unported: Vec<String> = std::fs::read_dir(&root)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|e| e.path().is_dir())
        .map(|e| e.file_name().to_string_lossy().to_string())
        .filter(|name| !registered.contains(name.as_str()))
        .filter(|name| !OUT_OF_SCOPE_RULES.contains(&name.as_str()))
        .collect();
    unported.sort();

    eprintln!(
        "oracle: strict parity over {checked} fixtures across {} registered rules",
        under_test.len()
    );
    assert!(
        unported.is_empty(),
        "oracle coverage gate: {} upstream rule(s) have fixtures but no registered rule \
         (port them, or add to OUT_OF_SCOPE_RULES with a reason): {}",
        unported.len(),
        unported.join(", ")
    );
}
