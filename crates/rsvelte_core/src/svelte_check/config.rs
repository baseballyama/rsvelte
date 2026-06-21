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
///   3. `vite.config.*` `svelte({ compilerOptions })` (inline plugin opts)
///
/// Each source only overrides a field when it statically declares it, so
/// a value set in `svelte.config.js` survives a `vite.config.ts` that
/// doesn't mention it.
pub fn load_compiler_options(workspace: &Path) -> CompilerOptionsSettings {
    let mut settings = CompilerOptionsSettings::default();

    // 2. svelte.config.* — lower precedence.
    if let Some((source, source_type)) = read_first_config(workspace, SVELTE_CONFIG_CANDIDATES) {
        parse_config(&source, source_type, ConfigKind::Svelte, &mut settings);
    }
    // 3. vite.config.* — higher precedence (overrides the above).
    if let Some((source, source_type)) = read_first_config(workspace, VITE_CONFIG_CANDIDATES) {
        parse_config(&source, source_type, ConfigKind::Vite, &mut settings);
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
                // The Svelte compiler options live in the `svelte(...)`
                // plugin call inside the `plugins` array.
                if let Some(plugins) = lookup_property(obj, "plugins")
                    && let Some(call) = find_svelte_plugin_call(plugins)
                    && let Some(oxc::Argument::ObjectExpression(opts)) = call.arguments.first()
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

/// Find the `svelte(...)` plugin call anywhere within a `plugins` value.
/// Recurses into nested array literals so `plugins: [[svelte()]]` and
/// `plugins: [otherPlugin(), svelte({...})]` both resolve. Best-effort:
/// matches the conventional `svelte` import name (a renamed import is
/// not tracked, consistent with the static-parse contract).
fn find_svelte_plugin_call<'a>(
    expr: &'a oxc::Expression<'a>,
) -> Option<&'a oxc::CallExpression<'a>> {
    match expr {
        oxc::Expression::CallExpression(call) => {
            if let oxc::Expression::Identifier(id) = &call.callee
                && id.name.as_str() == "svelte"
            {
                return Some(call);
            }
            None
        }
        oxc::Expression::ArrayExpression(arr) => {
            for el in &arr.elements {
                match el {
                    oxc::ArrayExpressionElement::SpreadElement(_)
                    | oxc::ArrayExpressionElement::Elision(_) => continue,
                    _ => {
                        if let Some(call) = find_svelte_plugin_call(el.to_expression()) {
                            return Some(call);
                        }
                    }
                }
            }
            None
        }
        _ => None,
    }
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
