//! SvelteKit kit-file augmentation. Mirrors
//! `submodules/language-tools/packages/svelte2tsx/src/helpers/sveltekit.ts`.
//!
//! When tsgo / tsc walks a `.ts` file that lives at a known SvelteKit
//! path (`+page.ts`, `+layout.ts`, `+server.ts`, hooks, params), we
//! want it to type-check the file *as if* the framework's type stubs
//! were written explicitly. The JS reference parses with TypeScript
//! and emits an `AddedCode` list of pure text insertions; we do the
//! same with oxc.
//!
//! Only the TS path is implemented for now — JSDoc emission for `.js`
//! kit files is a follow-up.

use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::{GetSpan, SourceType};

/// A single source-text insertion. `original_pos` is a byte offset into
/// the original source; `inserted` is the literal text injected at that
/// position. Multiple entries are stored sorted by `original_pos`.
#[derive(Debug, Clone)]
pub struct AddedCode {
    pub original_pos: u32,
    pub inserted: String,
}

/// SvelteKit file paths (typically read from `svelte.config.js`).
#[derive(Debug, Clone)]
pub struct KitFilesSettings {
    pub params_path: String,
    pub server_hooks_path: String,
    pub client_hooks_path: String,
    pub universal_hooks_path: String,
}

impl Default for KitFilesSettings {
    fn default() -> Self {
        // Mirrors `defaultKitFilesSettings` in
        // `submodules/language-tools/packages/svelte-check/src/incremental.ts`.
        Self {
            params_path: "src/params".into(),
            server_hooks_path: "src/hooks.server".into(),
            client_hooks_path: "src/hooks.client".into(),
            universal_hooks_path: "src/hooks".into(),
        }
    }
}

/// Load `KitFilesSettings` from `<workspace>/svelte.config.{js,cjs,mjs}`,
/// falling back to defaults when no config exists or the relevant fields
/// can't be statically resolved.
///
/// Mirrors `loadKitFilesSettings` in
/// `submodules/language-tools/packages/svelte-check/src/incremental.ts` —
/// except the JS reference `dynamicImport()`s the config, while we
/// statically parse it. Dynamic expressions (env vars, function calls,
/// re-exports) are intentionally unsupported; users with those configs
/// should rely on defaults.
pub fn load_kit_files_settings(workspace: &Path) -> KitFilesSettings {
    load_kit_files_settings_with_config(workspace, None)
}

/// Like [`load_kit_files_settings`], but when `config` is `Some` the
/// `kit.files` settings are read from that exact file instead of the
/// discovered `svelte.config.*`. Mirrors the JS reference's `--config`.
/// `kit.files` only ever lives in a Svelte config, so a `vite.config.*`
/// override yields defaults.
pub fn load_kit_files_settings_with_config(
    workspace: &Path,
    config: Option<&Path>,
) -> KitFilesSettings {
    let mut settings = KitFilesSettings::default();

    if let Some(path) = config {
        let name = path
            .file_name()
            .and_then(|n| n.to_str())
            .unwrap_or_default();
        if name.starts_with("vite.config") {
            return settings;
        }
        if let Ok(source) = std::fs::read_to_string(path) {
            parse_kit_files_source(&source, &mut settings);
        }
        return settings;
    }

    for ext in &["js", "cjs", "mjs"] {
        let candidate = workspace.join(format!("svelte.config.{ext}"));
        if !candidate.is_file() {
            continue;
        }
        let Ok(source) = std::fs::read_to_string(&candidate) else {
            continue;
        };
        parse_kit_files_source(&source, &mut settings);
        break;
    }
    settings
}

fn parse_kit_files_source(source: &str, settings: &mut KitFilesSettings) {
    let allocator = Allocator::default();
    let parser = OxcParser::new(&allocator, source, SourceType::default());
    let result = parser.parse();
    for stmt in &result.program.body {
        extract_kit_files_from_stmt(stmt, settings);
    }
}

fn extract_kit_files_from_stmt(stmt: &oxc::Statement, settings: &mut KitFilesSettings) {
    match stmt {
        oxc::Statement::ExportDefaultDeclaration(ex) => {
            // `export default { kit: { files: {...} } }` or
            // `export default defineConfig({ kit: { files: {...} } })`.
            if let oxc::ExportDefaultDeclarationKind::ObjectExpression(obj) = &ex.declaration {
                extract_kit_files_from_object(obj, settings);
            } else if let Some(expr) = ex.declaration.as_expression()
                && let Some(obj) = unwrap_define_config_object(expr)
            {
                extract_kit_files_from_object(obj, settings);
            }
        }
        oxc::Statement::ExpressionStatement(es) => {
            // `module.exports = { kit: { files: {...} } }`.
            if let oxc::Expression::AssignmentExpression(assign) = &es.expression {
                let is_module_exports = match &assign.left {
                    oxc::AssignmentTarget::StaticMemberExpression(member) => {
                        member.property.name.as_str() == "exports"
                            && matches!(
                                &member.object,
                                oxc::Expression::Identifier(id)
                                    if id.name.as_str() == "module"
                            )
                    }
                    _ => false,
                };
                if !is_module_exports {
                    return;
                }
                if let oxc::Expression::ObjectExpression(obj) = &assign.right {
                    extract_kit_files_from_object(obj, settings);
                } else if let Some(obj) = unwrap_define_config_object(&assign.right) {
                    extract_kit_files_from_object(obj, settings);
                }
            }
        }
        _ => {}
    }
}

/// Match `defineConfig({...})` and return the inner object expression.
pub(crate) fn unwrap_define_config_object<'a>(
    expr: &'a oxc::Expression,
) -> Option<&'a oxc::ObjectExpression<'a>> {
    let oxc::Expression::CallExpression(call) = expr else {
        return None;
    };
    let oxc::Expression::Identifier(callee) = &call.callee else {
        return None;
    };
    if callee.name.as_str() != "defineConfig" {
        return None;
    }
    let arg = call.arguments.first()?;
    let oxc::Argument::ObjectExpression(obj) = arg else {
        return None;
    };
    Some(obj)
}

fn extract_kit_files_from_object(obj: &oxc::ObjectExpression, settings: &mut KitFilesSettings) {
    let Some(kit_value) = lookup_property(obj, "kit") else {
        return;
    };
    let oxc::Expression::ObjectExpression(kit_obj) = kit_value else {
        return;
    };
    let Some(files_value) = lookup_property(kit_obj, "files") else {
        return;
    };
    let oxc::Expression::ObjectExpression(files_obj) = files_value else {
        return;
    };
    if let Some(oxc::Expression::StringLiteral(s)) = lookup_property(files_obj, "params") {
        settings.params_path = s.value.to_string();
    }
    if let Some(hooks_value) = lookup_property(files_obj, "hooks") {
        if let oxc::Expression::ObjectExpression(hooks_obj) = hooks_value {
            if let Some(oxc::Expression::StringLiteral(s)) = lookup_property(hooks_obj, "server") {
                settings.server_hooks_path = s.value.to_string();
            }
            if let Some(oxc::Expression::StringLiteral(s)) = lookup_property(hooks_obj, "client") {
                settings.client_hooks_path = s.value.to_string();
            }
            if let Some(oxc::Expression::StringLiteral(s)) = lookup_property(hooks_obj, "universal")
            {
                settings.universal_hooks_path = s.value.to_string();
            }
        } else if let oxc::Expression::StringLiteral(s) = hooks_value {
            // SvelteKit also accepts `kit.files.hooks` as a single string;
            // it then applies to the universal hooks path.
            settings.universal_hooks_path = s.value.to_string();
        }
    }
}

pub(crate) fn lookup_property<'a>(
    obj: &'a oxc::ObjectExpression,
    name: &str,
) -> Option<&'a oxc::Expression<'a>> {
    for prop in &obj.properties {
        let oxc::ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let prop_name = match &p.key {
            oxc::PropertyKey::StaticIdentifier(id) => id.name.as_str(),
            oxc::PropertyKey::StringLiteral(s) => s.value.as_str(),
            _ => continue,
        };
        if prop_name == name {
            return Some(&p.value);
        }
    }
    None
}

const KIT_PAGE_BASENAMES: &[&str] = &[
    "+page",
    "+layout",
    "+page.server",
    "+layout.server",
    "+server",
];

/// True iff `path`'s basename (extension stripped) matches one of the
/// SvelteKit route-file basenames.
pub fn is_kit_route_file(path: &Path) -> bool {
    let Some(name) = path.file_name().and_then(|s| s.to_str()) else {
        return false;
    };
    // `+page@foo.ts` → `+page` (the `@foo` is SvelteKit's named-layout suffix).
    let stem = if let Some(at) = name.find('@') {
        &name[..at]
    } else {
        match name.rfind('.') {
            Some(i) => &name[..i],
            None => name,
        }
    };
    KIT_PAGE_BASENAMES.contains(&stem)
}

/// True iff `path` lives at any of the SvelteKit special paths.
pub fn is_kit_file(path: &Path, settings: &KitFilesSettings) -> bool {
    if is_kit_route_file(path) {
        return true;
    }
    is_hooks_file(path, &settings.server_hooks_path)
        || is_hooks_file(path, &settings.client_hooks_path)
        || is_hooks_file(path, &settings.universal_hooks_path)
        || is_params_file(path, &settings.params_path)
}

/// Hooks files: `src/hooks.server.ts` style — file path with the
/// extension stripped ends with the configured hooks path. We also
/// accept the `src/hooks.server/index.ts` directory style.
fn is_hooks_file(path: &Path, hooks_path: &str) -> bool {
    let Some(s) = path.to_str() else { return false };
    let normalized = s.replace('\\', "/");
    let without_ext = match path.extension() {
        Some(_) => match normalized.rfind('.') {
            Some(i) => &normalized[..i],
            None => normalized.as_str(),
        },
        None => normalized.as_str(),
    };
    without_ext.ends_with(hooks_path) || without_ext.ends_with(&format!("{hooks_path}/index"))
}

fn is_params_file(path: &Path, params_path: &str) -> bool {
    let Some(parent) = path.parent() else {
        return false;
    };
    let Some(parent_str) = parent.to_str() else {
        return false;
    };
    let normalized = parent_str.replace('\\', "/");
    if !normalized.ends_with(params_path) {
        return false;
    }
    let basename = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
    !basename.contains(".test") && !basename.contains(".spec")
}

/// Produce a list of text insertions for a kit file. Returns `None`
/// when the file isn't a kit file, parsing failed, or there's nothing
/// to inject. Caller is responsible for splicing the insertions into
/// `source` to produce the overlay text.
pub fn build_added_code(
    path: &Path,
    source: &str,
    settings: &KitFilesSettings,
) -> Option<Vec<AddedCode>> {
    let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
    let is_ts = ext == "ts";
    let is_js = ext == "js";
    if !is_ts && !is_js {
        return None;
    }
    let allocator = Allocator::default();
    // For JS files, parse as JS (no TS syntax). For TS files, parse as TS.
    let source_type = if is_ts {
        SourceType::ts()
    } else {
        SourceType::default()
    };
    let parser = OxcParser::new(&allocator, source, source_type);
    let result = parser.parse();
    let body = &result.program.body;

    let mut adds: Vec<AddedCode> = Vec::new();
    if is_kit_route_file(path) {
        let basename = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
        let is_layout = basename.starts_with("+layout");
        let is_server = basename.contains(".server");
        let load_type = format!(
            "import('./$types.js').{}{}Load",
            if is_layout { "Layout" } else { "Page" },
            if is_server { "Server" } else { "" }
        );
        for stmt in body {
            visit_route_statement(stmt, &load_type, basename, is_ts, &mut adds);
        }
    } else if is_params_file(path, &settings.params_path) {
        for stmt in body {
            visit_param_statement(stmt, is_ts, &mut adds);
        }
    } else if is_hooks_file(path, &settings.server_hooks_path) {
        for stmt in body {
            visit_server_hooks_statement(stmt, is_ts, &mut adds);
        }
    } else if is_hooks_file(path, &settings.client_hooks_path) {
        for stmt in body {
            visit_client_hooks_statement(stmt, is_ts, &mut adds);
        }
    } else if is_hooks_file(path, &settings.universal_hooks_path) {
        for stmt in body {
            visit_universal_hooks_statement(stmt, is_ts, &mut adds);
        }
    } else {
        return None;
    }

    if adds.is_empty() {
        return None;
    }
    adds.sort_by_key(|a| a.original_pos);
    Some(adds)
}

/// Splice an `AddedCode` list into the original source.
pub fn apply_added_code(source: &str, adds: &[AddedCode]) -> String {
    let mut out =
        String::with_capacity(source.len() + adds.iter().map(|a| a.inserted.len()).sum::<usize>());
    let mut cursor: usize = 0;
    for add in adds {
        let pos = add.original_pos as usize;
        if pos > cursor && pos <= source.len() {
            out.push_str(&source[cursor..pos]);
        }
        out.push_str(&add.inserted);
        cursor = pos.max(cursor);
    }
    if cursor < source.len() {
        out.push_str(&source[cursor..]);
    }
    out
}

fn visit_route_statement(
    stmt: &oxc::Statement,
    load_type: &str,
    basename: &str,
    is_ts: bool,
    adds: &mut Vec<AddedCode>,
) {
    let oxc::Statement::ExportNamedDeclaration(ex) = stmt else {
        return;
    };
    let Some(decl) = &ex.declaration else { return };
    match decl {
        oxc::Declaration::VariableDeclaration(var) => {
            for d in &var.declarations {
                let oxc::BindingPattern::BindingIdentifier(id) = &d.id else {
                    continue;
                };
                let name = id.name.as_str();
                let name_end = id.span.end;
                let has_type_annotation = d.type_annotation.is_some();
                if has_type_annotation {
                    continue;
                }
                match name {
                    "ssr" | "csr" | "prerender" | "trailingSlash" => {
                        let ty = match name {
                            "ssr" | "csr" => "boolean",
                            "prerender" => "boolean | 'auto'",
                            "trailingSlash" => "'never' | 'always' | 'ignore'",
                            _ => unreachable!(),
                        };
                        if is_ts {
                            adds.push(AddedCode {
                                original_pos: name_end,
                                inserted: format!(" : {ty}"),
                            });
                        } else if let Some(init) = &d.init {
                            add_jsdoc_var_type(init, ty, adds);
                        }
                    }
                    "load" => {
                        let Some(init) = &d.init else { continue };
                        if is_ts {
                            let init_span = init.span();
                            adds.push(AddedCode {
                                original_pos: init_span.start,
                                inserted: "(".into(),
                            });
                            adds.push(AddedCode {
                                original_pos: init_span.end,
                                inserted: format!(") satisfies {load_type}"),
                            });
                        } else {
                            add_jsdoc_var_satisfies(init, load_type, adds);
                        }
                    }
                    "actions" => {
                        let Some(init) = &d.init else { continue };
                        if is_ts {
                            let end = init.span().end;
                            adds.push(AddedCode {
                                original_pos: end,
                                inserted: " satisfies import('./$types.js').Actions".into(),
                            });
                        } else {
                            add_jsdoc_var_satisfies(init, "import('./$types.js').Actions", adds);
                        }
                    }
                    _ => {}
                }
            }
        }
        oxc::Declaration::FunctionDeclaration(f) => {
            let Some(id) = &f.id else { return };
            let name = id.name.as_str();
            match name {
                "load" => {
                    if f.return_type.is_some() {
                        return;
                    }
                    if f.params.items.len() != 1 {
                        return;
                    }
                    let param = &f.params.items[0];
                    if param.type_annotation.is_some() {
                        return;
                    }
                    if is_ts {
                        let param_end = param.pattern.span().end;
                        adds.push(AddedCode {
                            original_pos: param_end,
                            inserted: format!(": {load_type}Event"),
                        });
                    } else {
                        // JSDoc `@param {LoadEvent} paramName` prepended to function start.
                        let param_name = binding_pattern_name(&param.pattern).unwrap_or("arg0");
                        let fn_start = f.span.start;
                        adds.push(AddedCode {
                            original_pos: fn_start,
                            inserted: format!(
                                "/** @param {{{}Event}} {} */ ",
                                load_type, param_name
                            ),
                        });
                    }
                }
                "entries" => {
                    if basename.starts_with("+layout") || f.return_type.is_some() {
                        return;
                    }
                    if !f.params.items.is_empty() {
                        return;
                    }
                    let Some(body) = &f.body else { return };
                    if is_ts {
                        let pos = body.span().start;
                        adds.push(AddedCode {
                            original_pos: pos,
                            inserted: ": ReturnType<import('./$types.js').EntryGenerator> ".into(),
                        });
                    } else {
                        // `/** @type {import('./$types.js').EntryGenerator} */ ` prepended to fn
                        adds.push(AddedCode {
                            original_pos: f.span.start,
                            inserted: "/** @type {import('./$types.js').EntryGenerator} */ ".into(),
                        });
                    }
                }
                "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "fallback" => {
                    add_api_method_types(f, is_ts, adds);
                }
                _ => {}
            }
        }
        _ => {}
    }
}

fn add_api_method_types(f: &oxc::Function, is_ts: bool, adds: &mut Vec<AddedCode>) {
    if f.params.items.len() != 1 {
        return;
    }
    let param = &f.params.items[0];
    if is_ts {
        if param.type_annotation.is_none() {
            let pos = param.pattern.span().end;
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ": import('./$types.js').RequestEvent".into(),
            });
        }
        if f.return_type.is_none()
            && let Some(body) = &f.body
        {
            let ret_ty = if f.r#async {
                "Promise<Response>"
            } else {
                "Response | Promise<Response>"
            };
            adds.push(AddedCode {
                original_pos: body.span().start,
                inserted: format!(": {ret_ty} "),
            });
        }
    } else {
        // JS: `/** @type {(event: RequestEvent) => Response | Promise<Response>} */`
        // prepended to the function declaration.
        let ret_ty = if f.r#async {
            "Promise<Response>"
        } else {
            "Response | Promise<Response>"
        };
        adds.push(AddedCode {
            original_pos: f.span.start,
            inserted: format!(
                "/** @type {{(event: import('./$types.js').RequestEvent) => {ret_ty}}} */ "
            ),
        });
    }
}

fn visit_param_statement(stmt: &oxc::Statement, is_ts: bool, adds: &mut Vec<AddedCode>) {
    let oxc::Statement::ExportNamedDeclaration(ex) = stmt else {
        return;
    };
    let Some(oxc::Declaration::FunctionDeclaration(f)) = &ex.declaration else {
        return;
    };
    let Some(id) = &f.id else { return };
    if id.name.as_str() != "match" {
        return;
    }
    if f.params.items.len() != 1 || f.return_type.is_some() {
        return;
    }
    let param = &f.params.items[0];
    if is_ts {
        if param.type_annotation.is_none() {
            let pos = param.pattern.span().end;
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ": string".into(),
            });
        }
        let Some(body) = &f.body else { return };
        adds.push(AddedCode {
            original_pos: body.span().start,
            inserted: ": boolean ".into(),
        });
    } else {
        // JS: `/** @type {(param: string) => boolean} */` prepended to fn.
        adds.push(AddedCode {
            original_pos: f.span.start,
            inserted: "/** @type {(param: string) => boolean} */ ".into(),
        });
    }
}

fn visit_server_hooks_statement(stmt: &oxc::Statement, is_ts: bool, adds: &mut Vec<AddedCode>) {
    add_hooks_type(
        stmt,
        "handleError",
        "import('@sveltejs/kit').HandleServerError",
        is_ts,
        adds,
    );
    add_hooks_type(
        stmt,
        "handle",
        "import('@sveltejs/kit').Handle",
        is_ts,
        adds,
    );
    add_hooks_type(
        stmt,
        "handleFetch",
        "import('@sveltejs/kit').HandleFetch",
        is_ts,
        adds,
    );
}

fn visit_client_hooks_statement(stmt: &oxc::Statement, is_ts: bool, adds: &mut Vec<AddedCode>) {
    add_hooks_type(
        stmt,
        "handleError",
        "import('@sveltejs/kit').HandleClientError",
        is_ts,
        adds,
    );
}

fn visit_universal_hooks_statement(stmt: &oxc::Statement, is_ts: bool, adds: &mut Vec<AddedCode>) {
    add_hooks_type(
        stmt,
        "reroute",
        "import('@sveltejs/kit').Reroute",
        is_ts,
        adds,
    );
}

fn add_hooks_type(
    stmt: &oxc::Statement,
    name: &str,
    ty: &str,
    is_ts: bool,
    adds: &mut Vec<AddedCode>,
) {
    let oxc::Statement::ExportNamedDeclaration(ex) = stmt else {
        return;
    };
    let Some(oxc::Declaration::FunctionDeclaration(f)) = &ex.declaration else {
        return;
    };
    let Some(id) = &f.id else { return };
    if id.name.as_str() != name {
        return;
    }
    if f.params.items.len() != 1 {
        return;
    }
    let param = &f.params.items[0];
    if is_ts {
        if param.type_annotation.is_none() {
            let pos = param.pattern.span().end;
            adds.push(AddedCode {
                original_pos: pos,
                inserted: format!(": Parameters<{ty}>[0]"),
            });
        }
        if f.return_type.is_none()
            && let Some(body) = &f.body
        {
            adds.push(AddedCode {
                original_pos: body.span().start,
                inserted: format!(": ReturnType<{ty}> "),
            });
        }
    } else {
        // JS: `/** @type {Handle} */` (or `HandleServerError`, etc.) prepended to fn.
        adds.push(AddedCode {
            original_pos: f.span.start,
            inserted: format!("/** @type {{{ty}}} */ "),
        });
    }
}

/// Wrap a variable's initializer with `/** @type {T} */ (init)` for JS.
fn add_jsdoc_var_type(init: &oxc::Expression, ty: &str, adds: &mut Vec<AddedCode>) {
    let span = init.span();
    adds.push(AddedCode {
        original_pos: span.start,
        inserted: format!("/** @type {{{ty}}} */ ("),
    });
    adds.push(AddedCode {
        original_pos: span.end,
        inserted: ")".into(),
    });
}

/// Wrap a variable's initializer with `/** @satisfies {T} */ (init)` for JS.
fn add_jsdoc_var_satisfies(init: &oxc::Expression, ty: &str, adds: &mut Vec<AddedCode>) {
    let span = init.span();
    adds.push(AddedCode {
        original_pos: span.start,
        inserted: format!("/** @satisfies {{{ty}}} */ ("),
    });
    adds.push(AddedCode {
        original_pos: span.end,
        inserted: ")".into(),
    });
}

/// Best-effort extraction of a function parameter's binding name. Falls
/// back to `None` for destructuring patterns; the caller can substitute
/// a placeholder like `arg0` (matching the JS reference).
fn binding_pattern_name<'a>(pat: &'a oxc::BindingPattern) -> Option<&'a str> {
    match pat {
        oxc::BindingPattern::BindingIdentifier(id) => Some(id.name.as_str()),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn detects_kit_route_basenames() {
        assert!(is_kit_route_file(&PathBuf::from("src/routes/+page.ts")));
        assert!(is_kit_route_file(&PathBuf::from("src/routes/+layout.ts")));
        assert!(is_kit_route_file(&PathBuf::from(
            "src/routes/+page.server.ts"
        )));
        assert!(is_kit_route_file(&PathBuf::from("src/routes/+server.ts")));
        assert!(is_kit_route_file(&PathBuf::from("src/routes/+page@foo.ts")));
        assert!(!is_kit_route_file(&PathBuf::from("src/routes/Page.ts")));
        // `.svelte` files match `isKitRouteFile` in the JS reference too —
        // the JS / TS filter happens at the caller.
    }

    #[test]
    fn ssr_string_initializer_emits_boolean_annotation() {
        let path = PathBuf::from("src/routes/+page.ts");
        let source = "export const ssr = 'invalid';\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("ssr should emit an insertion");
        assert_eq!(adds.len(), 1, "{:?}", adds);
        let augmented = apply_added_code(source, &adds);
        // The augmentation must surface as a boolean annotation; the
        // exact whitespace mirrors `addTypeToVariable` in the JS ref.
        assert!(
            augmented.contains("ssr : boolean"),
            "augmented = {augmented:?}"
        );
        // Original prefix preserved — column 13 still lands at `ssr`.
        assert!(augmented.starts_with("export const ssr"));
    }

    #[test]
    fn load_var_form_emits_satisfies_wrapper() {
        let path = PathBuf::from("src/routes/+layout.server.ts");
        let source = "export const load = async ({ url }) => ({ url });\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default()).expect("load");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("satisfies import('./$types.js').LayoutServerLoad"),
            "got: {augmented}"
        );
    }

    #[test]
    fn non_kit_file_returns_none() {
        let path = PathBuf::from("src/util.ts");
        let source = "export const ssr = false;\n";
        assert!(build_added_code(&path, source, &KitFilesSettings::default()).is_none());
    }

    #[test]
    fn js_ssr_uses_jsdoc_type_wrapper() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "export const ssr = 'invalid';\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js ssr should emit insertions");
        let augmented = apply_added_code(source, &adds);
        // JS form wraps the initializer with `/** @type {boolean} */ (...)`.
        assert!(
            augmented.contains("/** @type {boolean} */ ('invalid')"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_uses_jsdoc_satisfies_wrapper() {
        let path = PathBuf::from("src/routes/+layout.server.js");
        let source = "export const load = async ({ url }) => ({ url });\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js load should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(
                "/** @satisfies {import('./$types.js').LayoutServerLoad} */ (async ({ url })"
            ),
            "augmented = {augmented:?}"
        );
        assert!(
            augmented.contains("({ url }))"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_hooks_handle_uses_jsdoc_type() {
        let path = PathBuf::from("src/hooks.server.js");
        let source = "export function handle({ event, resolve }) { return resolve(event); }\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js handle should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("/** @type {import('@sveltejs/kit').Handle} */ function handle"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_params_match_uses_jsdoc_signature() {
        let path = PathBuf::from("src/params/slug.js");
        let source = "export function match(param) { return param.length > 0; }\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js params should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("/** @type {(param: string) => boolean} */ function match"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_api_get_uses_jsdoc_signature() {
        let path = PathBuf::from("src/routes/api/+server.js");
        let source = "export function GET(event) { return new Response('ok'); }\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js api should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(
                "/** @type {(event: import('./$types.js').RequestEvent) => Response | Promise<Response>} */ function GET"
            ),
            "augmented = {augmented:?}"
        );
    }

    fn write_config(tmp: &Path, contents: &str) {
        std::fs::create_dir_all(tmp).unwrap();
        std::fs::write(tmp.join("svelte.config.js"), contents).unwrap();
    }

    #[test]
    fn load_kit_files_returns_defaults_when_no_config() {
        let tmp = std::env::temp_dir().join(format!("rsvelte_kit_cfg_none_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&tmp);
        std::fs::create_dir_all(&tmp).unwrap();
        let settings = load_kit_files_settings(&tmp);
        let default = KitFilesSettings::default();
        assert_eq!(settings.params_path, default.params_path);
        let _ = std::fs::remove_dir_all(&tmp);
    }

    #[test]
    fn load_kit_files_reads_export_default_object() {
        let tmp = std::env::temp_dir().join(format!("rsvelte_kit_cfg_obj_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&tmp);
        write_config(
            &tmp,
            r#"export default {
                kit: {
                    files: {
                        params: 'src/custom-params',
                        hooks: {
                            server: 'src/custom-hooks/server',
                            client: 'src/custom-hooks/client',
                            universal: 'src/custom-hooks/index'
                        }
                    }
                }
            }"#,
        );
        let s = load_kit_files_settings(&tmp);
        assert_eq!(s.params_path, "src/custom-params");
        assert_eq!(s.server_hooks_path, "src/custom-hooks/server");
        assert_eq!(s.client_hooks_path, "src/custom-hooks/client");
        assert_eq!(s.universal_hooks_path, "src/custom-hooks/index");
        let _ = std::fs::remove_dir_all(&tmp);
    }

    #[test]
    fn load_kit_files_reads_define_config_wrapper() {
        let tmp =
            std::env::temp_dir().join(format!("rsvelte_kit_cfg_define_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&tmp);
        write_config(
            &tmp,
            r#"import { defineConfig } from '@sveltejs/kit/vite';
            export default defineConfig({
                kit: { files: { params: 'lib/params' } }
            });"#,
        );
        let s = load_kit_files_settings(&tmp);
        assert_eq!(s.params_path, "lib/params");
        // Hooks unset → defaults retained.
        assert_eq!(s.server_hooks_path, "src/hooks.server");
        let _ = std::fs::remove_dir_all(&tmp);
    }

    #[test]
    fn load_kit_files_reads_module_exports() {
        let tmp = std::env::temp_dir().join(format!("rsvelte_kit_cfg_cjs_{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&tmp);
        write_config(
            &tmp,
            r#"module.exports = {
                kit: { files: { hooks: { server: 'srv/hooks' } } }
            };"#,
        );
        let s = load_kit_files_settings(&tmp);
        assert_eq!(s.server_hooks_path, "srv/hooks");
        let _ = std::fs::remove_dir_all(&tmp);
    }
}
