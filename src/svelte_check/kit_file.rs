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
    let is_ts = path.extension().is_some_and(|e| e == "ts");
    if !is_ts {
        // JS kit files would need JSDoc emission — not implemented yet.
        return None;
    }
    let allocator = Allocator::default();
    let parser = OxcParser::new(&allocator, source, SourceType::ts());
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
            visit_route_statement(stmt, &load_type, basename, &mut adds);
        }
    } else if is_params_file(path, &settings.params_path) {
        for stmt in body {
            visit_param_statement(stmt, &mut adds);
        }
    } else if is_hooks_file(path, &settings.server_hooks_path) {
        for stmt in body {
            visit_server_hooks_statement(stmt, &mut adds);
        }
    } else if is_hooks_file(path, &settings.client_hooks_path) {
        for stmt in body {
            visit_client_hooks_statement(stmt, &mut adds);
        }
    } else if is_hooks_file(path, &settings.universal_hooks_path) {
        for stmt in body {
            visit_universal_hooks_statement(stmt, &mut adds);
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
                        adds.push(AddedCode {
                            original_pos: name_end,
                            inserted: format!(" : {ty}"),
                        });
                    }
                    "load" => {
                        // `export const load = ...` → wrap initializer with
                        // `(...) satisfies PageLoad`. Matches
                        // `upsertKitRouteFile`'s `load.type === 'var'` branch.
                        let Some(init) = &d.init else { continue };
                        let init_span = init.span();
                        adds.push(AddedCode {
                            original_pos: init_span.start,
                            inserted: "(".into(),
                        });
                        adds.push(AddedCode {
                            original_pos: init_span.end,
                            inserted: format!(") satisfies {load_type}"),
                        });
                    }
                    "actions" => {
                        let Some(init) = &d.init else { continue };
                        let end = init.span().end;
                        adds.push(AddedCode {
                            original_pos: end,
                            inserted: " satisfies import('./$types.js').Actions".into(),
                        });
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
                    // Mirrors `load?.type === 'function'` branch — parameter[0] gets
                    // ` : PageLoadEvent` and (when no return annotation) the body opener
                    // gets ` : ReturnType<PageLoad> `.
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
                    let param_end = param.pattern.span().end;
                    adds.push(AddedCode {
                        original_pos: param_end,
                        inserted: format!(": {load_type}Event"),
                    });
                }
                "entries" => {
                    if basename.starts_with("+layout") || f.return_type.is_some() {
                        return;
                    }
                    if !f.params.items.is_empty() {
                        return;
                    }
                    let Some(body) = &f.body else { return };
                    let pos = body.span().start;
                    adds.push(AddedCode {
                        original_pos: pos,
                        inserted: ": ReturnType<import('./$types.js').EntryGenerator> ".into(),
                    });
                }
                "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "fallback" => {
                    add_api_method_types(f, adds);
                }
                _ => {}
            }
        }
        _ => {}
    }
}

fn add_api_method_types(f: &oxc::Function, adds: &mut Vec<AddedCode>) {
    if f.params.items.len() != 1 {
        return;
    }
    let param = &f.params.items[0];
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
}

fn visit_param_statement(stmt: &oxc::Statement, adds: &mut Vec<AddedCode>) {
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
}

fn visit_server_hooks_statement(stmt: &oxc::Statement, adds: &mut Vec<AddedCode>) {
    add_hooks_type(
        stmt,
        "handleError",
        "import('@sveltejs/kit').HandleServerError",
        adds,
    );
    add_hooks_type(stmt, "handle", "import('@sveltejs/kit').Handle", adds);
    add_hooks_type(
        stmt,
        "handleFetch",
        "import('@sveltejs/kit').HandleFetch",
        adds,
    );
}

fn visit_client_hooks_statement(stmt: &oxc::Statement, adds: &mut Vec<AddedCode>) {
    add_hooks_type(
        stmt,
        "handleError",
        "import('@sveltejs/kit').HandleClientError",
        adds,
    );
}

fn visit_universal_hooks_statement(stmt: &oxc::Statement, adds: &mut Vec<AddedCode>) {
    add_hooks_type(stmt, "reroute", "import('@sveltejs/kit').Reroute", adds);
}

fn add_hooks_type(stmt: &oxc::Statement, name: &str, ty: &str, adds: &mut Vec<AddedCode>) {
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
}
