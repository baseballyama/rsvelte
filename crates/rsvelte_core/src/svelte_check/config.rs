//! Static extraction of Svelte `compilerOptions` from project config.
//!
//! `svelte-check` needs the compiler options that affect diagnostics —
//! most importantly `experimental.async`, which gates the
//! `experimental_async` analysis error for top-level / derived `await`.
//! The official tooling reads these from `svelte.config.js` via dynamic
//! import; SvelteKit projects increasingly place the Svelte plugin (and
//! its inline `compilerOptions`) in `vite.config.{js,ts}` instead
//! (issue #1034). Before this, rsvelte-check read no `compilerOptions`
//! at all and so wrongly emitted `experimental_async` for valid async
//! projects.
//!
//! We statically parse BOTH config files with oxc and merge them with
//! the vite-plugin options taking precedence, mirroring
//! vite-plugin-svelte's `defaults → svelte.config.js → inline` order.
//!
//! Two plugin shapes carry inline `compilerOptions` in `vite.config.*`:
//!   * `svelte({ compilerOptions })` (`@sveltejs/vite-plugin-svelte`) —
//!     vite-plugin-svelte *merges* this over `svelte.config.js`.
//!   * `sveltekit({ compilerOptions })` (`@sveltejs/kit/vite`, since
//!     SvelteKit 2.62.0) — when config is passed inline, SvelteKit
//!     *ignores* `svelte.config.js` entirely. We mirror that suppression
//!     so the resolved options match what the runtime would compile with.
//!
//! Only statically-resolvable literal values are supported; dynamic
//! expressions (env vars, function calls, spreads, re-exports) fall back
//! to defaults. This matches the existing `load_kit_files_settings`
//! contract in `kit_file.rs`.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

use super::kit_file::{lookup_property, unwrap_define_config_object};

/// Subset of Svelte `compilerOptions` that influence svelte-check
/// diagnostics. Extend as more options gain diagnostic relevance.
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct CompilerOptionsSettings {
    /// `compilerOptions.experimental.async` — allows top-level / derived
    /// `await`. When false (the default), the compiler emits the
    /// `experimental_async` error for such code.
    pub experimental_async: bool,
    /// `compilerOptions.runes` — forces runes mode on/off. `None` =
    /// auto-detect (the compiler default).
    pub runes: Option<bool>,
}

impl CompilerOptionsSettings {
    /// A stable, compact string fingerprint of these options. Used to
    /// invalidate the `--incremental` warnings cache when the resolved
    /// compiler options change between runs (the `.svelte` source
    /// mtime/size is unaffected by a config edit, so the per-file key
    /// alone can't notice it).
    pub fn signature(&self) -> String {
        format!("async={};runes={:?}", self.experimental_async, self.runes)
    }
}

/// Candidate config filenames, in resolution order. Mirrors the file
/// extensions vite-plugin-svelte / svelte-check accept.
const SVELTE_CONFIG_CANDIDATES: &[&str] = &[
    "svelte.config.js",
    "svelte.config.mjs",
    "svelte.config.cjs",
    "svelte.config.ts",
    "svelte.config.mts",
];

const VITE_CONFIG_CANDIDATES: &[&str] = &[
    "vite.config.js",
    "vite.config.mjs",
    "vite.config.cjs",
    "vite.config.ts",
    "vite.config.mts",
    "vite.config.cts",
];

/// Load the diagnostic-relevant `compilerOptions` from
/// `<workspace>/svelte.config.*` and `<workspace>/vite.config.*`.
///
/// Precedence (lowest → highest, matching vite-plugin-svelte's merge):
///   1. defaults
///   2. `svelte.config.*` `compilerOptions`
///   3. `vite.config.*` `svelte({ compilerOptions })` /
///      `sveltekit({ compilerOptions })` (inline plugin opts)
///
/// Each source only overrides a field when it statically declares it, so
/// a value set in `svelte.config.js` survives a `vite.config.ts` that
/// doesn't mention it.
///
/// Exception: when `vite.config.*` passes inline config to the
/// `sveltekit()` plugin (SvelteKit 2.62.0+), SvelteKit ignores
/// `svelte.config.js` entirely, so step 2 is skipped and only the inline
/// `sveltekit({...})` options apply over the defaults.
pub fn load_compiler_options(workspace: &Path) -> CompilerOptionsSettings {
    let mut settings = CompilerOptionsSettings::default();

    // Read the vite.config once: it both decides whether svelte.config is
    // consulted (the `sveltekit()` inline-config case) and may itself
    // carry inline `compilerOptions`.
    let vite = read_first_config(workspace, VITE_CONFIG_CANDIDATES);
    let svelte_config_ignored = vite.as_ref().is_some_and(|(source, source_type)| {
        vite_uses_inline_sveltekit_config(source, *source_type)
    });

    // 2. svelte.config.* — lower precedence; suppressed when an inline
    //    `sveltekit({...})` config takes over.
    if !svelte_config_ignored
        && let Some((source, source_type)) = read_first_config(workspace, SVELTE_CONFIG_CANDIDATES)
    {
        parse_config(&source, source_type, ConfigKind::Svelte, &mut settings);
    }
    // 3. vite.config.* — higher precedence (overrides the above).
    if let Some((source, source_type)) = &vite {
        parse_config(source, *source_type, ConfigKind::Vite, &mut settings);
    }

    settings
}

#[derive(Clone, Copy)]
enum ConfigKind {
    Svelte,
    Vite,
}

/// Read the first existing candidate under `workspace`, returning its
/// source text and the oxc `SourceType` implied by its extension.
fn read_first_config(workspace: &Path, candidates: &[&str]) -> Option<(String, SourceType)> {
    for name in candidates {
        let candidate = workspace.join(name);
        if !candidate.is_file() {
            continue;
        }
        let Ok(source) = std::fs::read_to_string(&candidate) else {
            continue;
        };
        let is_ts = name.ends_with(".ts") || name.ends_with(".mts") || name.ends_with(".cts");
        let source_type = if is_ts {
            SourceType::ts()
        } else {
            SourceType::default()
        };
        return Some((source, source_type));
    }
    None
}

fn parse_config(
    source: &str,
    source_type: SourceType,
    kind: ConfigKind,
    settings: &mut CompilerOptionsSettings,
) {
    let allocator = Allocator::default();
    let parser = OxcParser::new(&allocator, source, source_type);
    let result = parser.parse();
    for stmt in &result.program.body {
        let Some(obj) = config_object_from_stmt(stmt) else {
            continue;
        };
        match kind {
            ConfigKind::Svelte => extract_compiler_options(obj, settings),
            ConfigKind::Vite => {
                // The Svelte compiler options live in the inline argument
                // of the `svelte(...)` (`@sveltejs/vite-plugin-svelte`) or
                // `sveltekit(...)` (`@sveltejs/kit/vite`, 2.62.0+) plugin
                // call inside the `plugins` array.
                if let Some(plugins) = lookup_property(obj, "plugins")
                    && let Some(plugin) = find_svelte_plugin_call(plugins)
                    && let Some(oxc::Argument::ObjectExpression(opts)) =
                        plugin.call.arguments.first()
                {
                    extract_compiler_options(opts, settings);
                }
            }
        }
    }
}

/// Resolve the top-level config object exported by a statement:
///   * `export default {...}` / `export default defineConfig({...})`
///   * `module.exports = {...}` / `module.exports = defineConfig({...})`
fn config_object_from_stmt<'a>(
    stmt: &'a oxc::Statement<'a>,
) -> Option<&'a oxc::ObjectExpression<'a>> {
    match stmt {
        oxc::Statement::ExportDefaultDeclaration(ex) => {
            if let oxc::ExportDefaultDeclarationKind::ObjectExpression(obj) = &ex.declaration {
                Some(obj)
            } else {
                ex.declaration
                    .as_expression()
                    .and_then(unwrap_define_config_object)
            }
        }
        oxc::Statement::ExpressionStatement(es) => {
            let oxc::Expression::AssignmentExpression(assign) = &es.expression else {
                return None;
            };
            let is_module_exports = matches!(
                &assign.left,
                oxc::AssignmentTarget::StaticMemberExpression(member)
                    if member.property.name.as_str() == "exports"
                        && matches!(
                            &member.object,
                            oxc::Expression::Identifier(id) if id.name.as_str() == "module"
                        )
            );
            if !is_module_exports {
                return None;
            }
            if let oxc::Expression::ObjectExpression(obj) = &assign.right {
                Some(obj)
            } else {
                unwrap_define_config_object(&assign.right)
            }
        }
        _ => None,
    }
}

/// Which Svelte-related Vite plugin wraps the inline compiler options.
/// They differ in how they interact with `svelte.config.js`: `svelte()`
/// merges, `sveltekit()` (with inline config) ignores it.
#[derive(Clone, Copy, PartialEq, Eq)]
enum PluginKind {
    /// `svelte()` from `@sveltejs/vite-plugin-svelte`.
    Svelte,
    /// `sveltekit()` from `@sveltejs/kit/vite` (2.62.0+).
    SvelteKit,
}

/// A located `svelte(...)` / `sveltekit(...)` plugin call.
struct SveltePluginCall<'a> {
    kind: PluginKind,
    call: &'a oxc::CallExpression<'a>,
}

/// Find the `svelte(...)` or `sveltekit(...)` plugin call anywhere within
/// a `plugins` value. Recurses into nested array literals so
/// `plugins: [[svelte()]]` and `plugins: [otherPlugin(), sveltekit({...})]`
/// both resolve. Best-effort: matches the conventional `svelte` /
/// `sveltekit` import names (a renamed import is not tracked, consistent
/// with the static-parse contract).
fn find_svelte_plugin_call<'a>(expr: &'a oxc::Expression<'a>) -> Option<SveltePluginCall<'a>> {
    match expr {
        oxc::Expression::CallExpression(call) => {
            if let oxc::Expression::Identifier(id) = &call.callee {
                let kind = match id.name.as_str() {
                    "svelte" => PluginKind::Svelte,
                    "sveltekit" => PluginKind::SvelteKit,
                    _ => return None,
                };
                return Some(SveltePluginCall { kind, call });
            }
            None
        }
        oxc::Expression::ArrayExpression(arr) => {
            for el in &arr.elements {
                match el {
                    oxc::ArrayExpressionElement::SpreadElement(_)
                    | oxc::ArrayExpressionElement::Elision(_) => continue,
                    _ => {
                        if let Some(found) = find_svelte_plugin_call(el.to_expression()) {
                            return Some(found);
                        }
                    }
                }
            }
            None
        }
        _ => None,
    }
}

/// Does `vite.config.*` pass inline config to the `sveltekit()` plugin?
///
/// SvelteKit 2.62.0 accepts the Svelte config (`compilerOptions`,
/// `preprocess`, …) as the first argument to `sveltekit()`. When that
/// argument is present, SvelteKit ignores `svelte.config.js` entirely
/// (it forwards `configFile: false` to vite-plugin-svelte and warns).
/// We treat *any* argument to `sveltekit(...)` as "inline config
/// provided" — matching SvelteKit's `config !== undefined` check — so
/// even an argument we can't read statically still suppresses the file,
/// exactly as it would at runtime. The plain `svelte()` plugin never
/// suppresses `svelte.config.js`.
fn vite_uses_inline_sveltekit_config(source: &str, source_type: SourceType) -> bool {
    let allocator = Allocator::default();
    let parser = OxcParser::new(&allocator, source, source_type);
    let result = parser.parse();
    for stmt in &result.program.body {
        let Some(obj) = config_object_from_stmt(stmt) else {
            continue;
        };
        if let Some(plugins) = lookup_property(obj, "plugins")
            && let Some(plugin) = find_svelte_plugin_call(plugins)
            && plugin.kind == PluginKind::SvelteKit
            && !plugin.call.arguments.is_empty()
        {
            return true;
        }
    }
    false
}

/// Read `compilerOptions.{experimental.async, runes}` out of an object
/// expression (either a svelte.config root object or a svelte-plugin
/// options object). Only sets a field when a boolean literal is present.
fn extract_compiler_options(obj: &oxc::ObjectExpression, settings: &mut CompilerOptionsSettings) {
    let Some(oxc::Expression::ObjectExpression(co)) = lookup_property(obj, "compilerOptions")
    else {
        return;
    };
    if let Some(oxc::Expression::BooleanLiteral(b)) = lookup_property(co, "runes") {
        settings.runes = Some(b.value);
    }
    if let Some(oxc::Expression::ObjectExpression(exp)) = lookup_property(co, "experimental")
        && let Some(oxc::Expression::BooleanLiteral(b)) = lookup_property(exp, "async")
    {
        settings.experimental_async = b.value;
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn workspace(tag: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("rsvelte_co_{tag}_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        std::fs::create_dir_all(&dir).unwrap();
        dir
    }

    fn write(dir: &Path, name: &str, body: &str) {
        std::fs::write(dir.join(name), body).unwrap();
    }

    #[test]
    fn defaults_when_no_config() {
        let dir = workspace("none");
        let s = load_compiler_options(&dir);
        assert!(!s.experimental_async);
        assert_eq!(s.runes, None);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_experimental_async_from_svelte_config() {
        let dir = workspace("svelte_async");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { experimental: { async: true } } };",
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_experimental_async_from_vite_plugin_call() {
        let dir = workspace("vite_async");
        write(
            &dir,
            "vite.config.ts",
            r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
            import { defineConfig } from 'vite';
            export default defineConfig({
                plugins: [svelte({ compilerOptions: { experimental: { async: true } } })]
            });"#,
        );
        let s = load_compiler_options(&dir);
        assert!(
            s.experimental_async,
            "experimental.async must be read from the vite plugin call"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn vite_plugin_options_override_svelte_config() {
        // svelte.config says false, vite.config says true → vite wins.
        let dir = workspace("override");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { experimental: { async: false } } };",
        );
        write(
            &dir,
            "vite.config.js",
            r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
            export default {
                plugins: [svelte({ compilerOptions: { experimental: { async: true } } })]
            };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async, "inline vite options take precedence");
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn svelte_config_value_survives_vite_config_without_compiler_options() {
        // vite.config has a svelte() call but no compilerOptions → the
        // svelte.config value must be preserved (not reset to default).
        let dir = workspace("survive");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { experimental: { async: true } } };",
        );
        write(
            &dir,
            "vite.config.js",
            r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
            export default { plugins: [svelte()] };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_runes_flag() {
        let dir = workspace("runes");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { runes: true } };",
        );
        let s = load_compiler_options(&dir);
        assert_eq!(s.runes, Some(true));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn module_exports_form_supported() {
        let dir = workspace("cjs");
        write(
            &dir,
            "svelte.config.cjs",
            "module.exports = { compilerOptions: { experimental: { async: true } } };",
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn vite_plugin_among_other_plugins() {
        let dir = workspace("multi");
        write(
            &dir,
            "vite.config.ts",
            r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
            import other from 'other';
            export default {
                plugins: [other(), svelte({ compilerOptions: { experimental: { async: true } } })]
            };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_compiler_options_from_sveltekit_plugin_call() {
        // SvelteKit 2.62.0: config passed inline to `sveltekit()`.
        let dir = workspace("svkit_async");
        write(
            &dir,
            "vite.config.ts",
            r#"import { sveltekit } from '@sveltejs/kit/vite';
            import { defineConfig } from 'vite';
            export default defineConfig({
                plugins: [sveltekit({ compilerOptions: { experimental: { async: true } } })]
            });"#,
        );
        let s = load_compiler_options(&dir);
        assert!(
            s.experimental_async,
            "experimental.async must be read from the sveltekit() plugin call"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn reads_runes_from_sveltekit_plugin_call() {
        let dir = workspace("svkit_runes");
        write(
            &dir,
            "vite.config.ts",
            r#"import { sveltekit } from '@sveltejs/kit/vite';
            export default { plugins: [sveltekit({ compilerOptions: { runes: true } })] };"#,
        );
        let s = load_compiler_options(&dir);
        assert_eq!(s.runes, Some(true));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn inline_sveltekit_config_ignores_svelte_config() {
        // svelte.config sets runes:true; vite.config passes inline config
        // to sveltekit() (async only). SvelteKit ignores svelte.config.js
        // entirely in this case, so runes must fall back to auto (None) —
        // NOT the merge behaviour used for the plain svelte() plugin.
        let dir = workspace("svkit_ignore");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { runes: true } };",
        );
        write(
            &dir,
            "vite.config.ts",
            r#"import { sveltekit } from '@sveltejs/kit/vite';
            export default {
                plugins: [sveltekit({ compilerOptions: { experimental: { async: true } } })]
            };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async, "inline sveltekit async applies");
        assert_eq!(
            s.runes, None,
            "svelte.config.js is ignored when sveltekit() gets inline config"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn sveltekit_without_args_keeps_svelte_config() {
        // `sveltekit()` with no argument => config read from
        // svelte.config.js as before (no suppression).
        let dir = workspace("svkit_noargs");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { experimental: { async: true }, runes: true } };",
        );
        write(
            &dir,
            "vite.config.ts",
            r#"import { sveltekit } from '@sveltejs/kit/vite';
            export default { plugins: [sveltekit()] };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async);
        assert_eq!(s.runes, Some(true));
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn plain_svelte_plugin_still_merges_svelte_config() {
        // Regression guard: the `svelte()` plugin (vite-plugin-svelte)
        // must keep MERGE semantics — svelte.config.js is the base and an
        // inline value that the plugin doesn't restate survives.
        let dir = workspace("svelte_merge");
        write(
            &dir,
            "svelte.config.js",
            "export default { compilerOptions: { runes: true } };",
        );
        write(
            &dir,
            "vite.config.ts",
            r#"import { svelte } from '@sveltejs/vite-plugin-svelte';
            export default {
                plugins: [svelte({ compilerOptions: { experimental: { async: true } } })]
            };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async, "inline svelte() async applies");
        assert_eq!(
            s.runes,
            Some(true),
            "svelte.config.js runes survives a svelte() plugin that omits it"
        );
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn sveltekit_among_other_plugins() {
        let dir = workspace("svkit_multi");
        write(
            &dir,
            "vite.config.ts",
            r#"import { sveltekit } from '@sveltejs/kit/vite';
            import other from 'other';
            export default {
                plugins: [other(), sveltekit({ compilerOptions: { experimental: { async: true } } })]
            };"#,
        );
        let s = load_compiler_options(&dir);
        assert!(s.experimental_async);
        let _ = std::fs::remove_dir_all(&dir);
    }

    #[test]
    fn signature_changes_with_options() {
        let a = CompilerOptionsSettings {
            experimental_async: false,
            runes: None,
        };
        let b = CompilerOptionsSettings {
            experimental_async: true,
            runes: None,
        };
        assert_ne!(a.signature(), b.signature());
    }
}
