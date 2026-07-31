//! SvelteKit kit-file augmentation. Mirrors
//! `submodules/language-tools/packages/svelte2tsx/src/helpers/sveltekit.ts`.
//!
//! When tsgo / tsc walks a `.ts` or `.js` file that lives at a known
//! SvelteKit path (`+page.ts`, `+layout.ts`, `+server.ts`, hooks,
//! params), we want it to type-check the file *as if* the framework's
//! type stubs were written explicitly. The JS reference parses with
//! TypeScript and emits an `AddedCode` list of pure text insertions;
//! we do the same with oxc. `.ts` files get inline type annotations;
//! `.js` files get the equivalent JSDoc tag.

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
    let comments = &result.program.comments;

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
            visit_route_statement(
                stmt, source, &load_type, basename, is_ts, comments, &mut adds,
            );
        }
    } else if is_params_file(path, &settings.params_path) {
        for stmt in body {
            visit_param_statement(stmt, source, is_ts, comments, &mut adds);
        }
    } else if is_hooks_file(path, &settings.server_hooks_path) {
        for stmt in body {
            visit_server_hooks_statement(stmt, source, is_ts, comments, &mut adds);
        }
    } else if is_hooks_file(path, &settings.client_hooks_path) {
        for stmt in body {
            visit_client_hooks_statement(stmt, source, is_ts, comments, &mut adds);
        }
    } else if is_hooks_file(path, &settings.universal_hooks_path) {
        for stmt in body {
            visit_universal_hooks_statement(stmt, source, is_ts, comments, &mut adds);
        }
    } else {
        return None;
    }

    if adds.is_empty() {
        return None;
    }
    adds.sort_by_key(|a| a.original_pos);
    // Every insertion is best-effort scaffolding, not a user-authored
    // annotation — wrapping it in svelte2tsx's `Ωignore` markers lets
    // `mapper.rs` drop any diagnostic the injected type itself provokes
    // (e.g. an async hook's inferred `ReturnType<HandleFetch>` tripping
    // TS1064, since `HandleFetch`'s `MaybePromise<Response>` return isn't
    // literally `Promise<T>`). Mirrors the official implementation, which
    // passes `surroundWithIgnoreComments` as `upsertKitFile`'s `surround`.
    for add in &mut adds {
        add.inserted = format!("{IGNORE_START_COMMENT}{}{IGNORE_END_COMMENT}", add.inserted);
    }
    Some(adds)
}

/// Marks an `AddedCode` insertion as synthesised/best-effort scaffolding so
/// `mapper.rs`'s `is_in_generated_code` can drop diagnostics it alone
/// provokes. Mirrors `mapper.rs`'s identical private consts (kept separate
/// per this codebase's existing per-module convention for this marker).
const IGNORE_START_COMMENT: &str = "/*\u{3a9}ignore_start\u{3a9}*/";
const IGNORE_END_COMMENT: &str = "/*\u{3a9}ignore_end\u{3a9}*/";

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

/// Unwraps a single level of `(expr)` around a `const` initializer before matching
/// it against `ArrowFunctionExpression` / `FunctionExpression`. Mirrors `findExports`'
/// `ts.isParenthesizedExpression` unwrap in the JS reference, which is why
/// `export const GET = (async ({ url }) => {...});` still gets augmented there.
fn unwrap_parens<'a>(expr: &'a oxc::Expression<'a>) -> &'a oxc::Expression<'a> {
    match expr {
        oxc::Expression::ParenthesizedExpression(inner) => &inner.expression,
        other => other,
    }
}

/// Parses each top-level JSDoc tag out of a `/** ... */` comment's raw span
/// text: a "tag line" is any line that, after stripping the comment's
/// `/**`/`*`/`*/` decoration and surrounding whitespace, starts with `@`
/// followed by a maximal run of ASCII letters — that run is the tag name,
/// and everything after it (trimmed) is the tag's remainder. This is
/// structural rather than a substring search, so `@typedef` never matches a
/// check for `@type`, and a description line that merely *mentions*
/// `@types/node` never matches at all (it doesn't start the line with `@`).
/// Mirrors, informally, what TypeScript's real JSDoc tag scanner does
/// structurally when `getJSDocType`/`getJSDocTags`/`getJSDocParameterTags`
/// walk a comment.
fn jsdoc_tags(text: &str) -> impl Iterator<Item = (&str, &str)> {
    text.lines().filter_map(|raw_line| {
        let mut line = raw_line.trim();
        if let Some(rest) = line.strip_prefix("/**") {
            line = rest.trim_start();
        } else if let Some(rest) = line.strip_prefix('*') {
            line = rest.trim_start();
        }
        if let Some(rest) = line.strip_suffix("*/") {
            line = rest.trim_end();
        }
        let rest = line.strip_prefix('@')?;
        let name_end = rest
            .find(|c: char| !c.is_ascii_alphabetic())
            .unwrap_or(rest.len());
        (name_end > 0).then(|| (&rest[..name_end], rest[name_end..].trim_start()))
    })
}

/// The identifier a `@param` tag's remainder (the text after `@param`)
/// targets: skips an optional `{Type}` annotation, then unwraps `[name]` /
/// `[name=default]` for an optional parameter. `None` for a malformed tag
/// with no name at all.
fn jsdoc_param_target(rest: &str) -> Option<&str> {
    let rest = rest.trim_start();
    let rest = match rest.strip_prefix('{') {
        // The type annotation can itself contain braces (`{{ url: URL }}`,
        // `Array<{ a: string }>`), so the closing `}` has to be found by
        // depth, not by the first `}` in the string.
        Some(after_brace) => {
            let mut depth = 1u32;
            let mut close = None;
            for (i, c) in after_brace.char_indices() {
                match c {
                    '{' => depth += 1,
                    '}' => {
                        depth -= 1;
                        if depth == 0 {
                            close = Some(i);
                            break;
                        }
                    }
                    _ => {}
                }
            }
            after_brace[close?..].strip_prefix('}')?.trim_start()
        }
        None => rest,
    };
    let rest = rest.strip_prefix('[').unwrap_or(rest);
    let end = rest
        .find(|c: char| c.is_whitespace() || c == ']' || c == '=')
        .unwrap_or(rest.len());
    (end > 0).then(|| &rest[..end])
}

/// What a JSDoc `@param` tag must target to count as already typing a given
/// parameter, mirroring `ts.getJSDocParameterTags`: a simple identifier
/// parameter needs a tag whose declared name matches it exactly; a
/// destructuring pattern has no single name to match against, so
/// TypeScript accepts *any* `@param` tag (including a mismatched name, or
/// the `@param {T} parent` / `@param {T} parent.field` dotted-property
/// convention) as targeting it; and a function with no parameter at all
/// (`entries`) never has one to target, so `@param` tags are irrelevant.
#[derive(Clone, Copy)]
enum ParamTarget<'a> {
    None,
    Named(&'a str),
    Anonymous,
}

impl<'a> ParamTarget<'a> {
    fn for_pattern(pattern: &'a oxc::BindingPattern<'a>) -> Self {
        match binding_pattern_name(pattern) {
            Some(name) => ParamTarget::Named(name),
            None => ParamTarget::Anonymous,
        }
    }
}

fn jsdoc_comments_at<'a>(
    comments: &'a [oxc::Comment],
    source: &'a str,
    pos: u32,
) -> impl Iterator<Item = &'a str> {
    comments
        .iter()
        .filter(move |c| {
            c.attached_to == pos
                && matches!(
                    c.content,
                    oxc::CommentContent::Jsdoc | oxc::CommentContent::JsdocLegal
                )
        })
        .map(move |c| &source[c.span.start as usize..c.span.end as usize])
}

fn jsdoc_has_type_tag(comments: &[oxc::Comment], source: &str, pos: u32) -> bool {
    jsdoc_comments_at(comments, source, pos)
        .any(|text| jsdoc_tags(text).any(|(name, _)| name == "type"))
}

fn jsdoc_has_satisfies_tag(comments: &[oxc::Comment], source: &str, pos: u32) -> bool {
    jsdoc_comments_at(comments, source, pos)
        .any(|text| jsdoc_tags(text).any(|(name, _)| name == "satisfies"))
}

fn jsdoc_has_param_tag(
    comments: &[oxc::Comment],
    source: &str,
    pos: u32,
    target: ParamTarget,
) -> bool {
    let ParamTarget::None = target else {
        return jsdoc_comments_at(comments, source, pos).any(|text| {
            jsdoc_tags(text).any(|(name, rest)| {
                name == "param"
                    && match target {
                        ParamTarget::Named(expected) => jsdoc_param_target(rest) == Some(expected),
                        ParamTarget::Anonymous => true,
                        ParamTarget::None => unreachable!(),
                    }
            })
        });
    };
    false
}

/// Mirrors the JS-only half of `hasTypedParameter` in the JS reference:
/// `!isTsFile && (getJSDocType(node) || getJSDocParameterTags(param).length)`.
/// TypeScript resolves a function-like export's JSDoc host by walking from
/// the function-like node up through its variable declaration to the
/// enclosing statement, so both the function-like node's own leading
/// position (`fn_like_start`, meaningful for a `const x = (...) => ...`
/// initializer) and the whole exported statement's position (`stmt_start`)
/// are accepted anchors — for a plain `function` declaration the two
/// coincide, since `node` there *is* the statement.
fn function_already_typed(
    comments: &[oxc::Comment],
    source: &str,
    is_ts: bool,
    stmt_start: u32,
    fn_like_start: u32,
    param: ParamTarget,
) -> bool {
    if is_ts {
        return false;
    }
    jsdoc_has_type_tag(comments, source, stmt_start)
        || jsdoc_has_param_tag(comments, source, stmt_start, param)
        || (fn_like_start != stmt_start
            && (jsdoc_has_type_tag(comments, source, fn_like_start)
                || jsdoc_has_param_tag(comments, source, fn_like_start, param)))
}

/// Mirrors `findExports`'s `hasTypeDefinition` for a `var`-classified export:
/// an explicit type annotation, an initializer already wrapped in
/// `satisfies`, or (JS-only) a `@type`/`@satisfies` JSDoc tag on the
/// statement.
fn var_already_typed(
    comments: &[oxc::Comment],
    source: &str,
    is_ts: bool,
    stmt_start: u32,
    has_explicit_annotation: bool,
    init: Option<&oxc::Expression>,
) -> bool {
    has_explicit_annotation
        || matches!(init, Some(oxc::Expression::TSSatisfiesExpression(_)))
        || (!is_ts
            && (jsdoc_has_type_tag(comments, source, stmt_start)
                || jsdoc_has_satisfies_tag(comments, source, stmt_start)))
}

fn visit_route_statement(
    stmt: &oxc::Statement,
    source: &str,
    load_type: &str,
    basename: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    adds: &mut Vec<AddedCode>,
) {
    let oxc::Statement::ExportNamedDeclaration(ex) = stmt else {
        return;
    };
    let Some(decl) = &ex.declaration else { return };
    match decl {
        oxc::Declaration::VariableDeclaration(var) => {
            // `findExports` only recognises a single-declarator
            // `export const x = ...` (`statement.declarationList.declarations.length
            // === 1`) — `export const a = 1, b = 2;` isn't looked up under either
            // name at all, so neither gets augmented.
            if var.declarations.len() != 1 {
                return;
            }
            let d = &var.declarations[0];
            let oxc::BindingPattern::BindingIdentifier(id) = &d.id else {
                return;
            };
            let name = id.name.as_str();
            let name_end = id.span.end;
            // Mirrors `findExports`'s `hasTypeDefinition`, which is OR'd into
            // both the `'var'` and `'function'` classifications below — an
            // explicit annotation, a pre-existing `satisfies`, or (JS-only) a
            // `@type`/`@satisfies` JSDoc tag suppresses every export name.
            if var_already_typed(
                comments,
                source,
                is_ts,
                ex.span.start,
                d.type_annotation.is_some(),
                d.init.as_ref(),
            ) {
                return;
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
                    let Some(init) = &d.init else { return };
                    match unwrap_parens(init) {
                        oxc::Expression::ArrowFunctionExpression(af) => {
                            let needs_parens =
                                source.as_bytes().get(af.params.span.start as usize) != Some(&b'(');
                            add_load_param_type_to_function_like(
                                &af.params,
                                af.span.start,
                                needs_parens,
                                load_type,
                                is_ts,
                                comments,
                                source,
                                ex.span.start,
                                adds,
                            );
                        }
                        oxc::Expression::FunctionExpression(f) => {
                            add_load_param_type_to_function_like(
                                &f.params,
                                f.span.start,
                                false,
                                load_type,
                                is_ts,
                                comments,
                                source,
                                ex.span.start,
                                adds,
                            );
                        }
                        _ => {
                            // Not a function-like initializer: `findExports` classifies
                            // this as `type: 'var'` and wraps it in `satisfies` instead
                            // of typing a parameter.
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
                    }
                }
                "actions" => {
                    let Some(init) = &d.init else { return };
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
                "entries" => {
                    if basename.starts_with("+layout") {
                        return;
                    }
                    let Some(init) = &d.init else { return };
                    match unwrap_parens(init) {
                        oxc::Expression::ArrowFunctionExpression(af) => {
                            let arrow_pos =
                                find_arrow_token(source, af.params.span.end, af.body.span.start);
                            add_entries_type_to_function_like(
                                &af.params,
                                af.return_type.is_some(),
                                arrow_pos,
                                af.span.start,
                                is_ts,
                                comments,
                                source,
                                ex.span.start,
                                adds,
                            );
                        }
                        oxc::Expression::FunctionExpression(f) => {
                            add_entries_type_to_function_like(
                                &f.params,
                                f.return_type.is_some(),
                                f.body.as_deref().map(|b| b.span().start),
                                f.span.start,
                                is_ts,
                                comments,
                                source,
                                ex.span.start,
                                adds,
                            );
                        }
                        _ => {}
                    }
                }
                "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "fallback" => {
                    let Some(init) = &d.init else { return };
                    match unwrap_parens(init) {
                        oxc::Expression::ArrowFunctionExpression(af) => {
                            let arrow_pos =
                                find_arrow_token(source, af.params.span.end, af.body.span.start);
                            let parenless =
                                source.as_bytes().get(af.params.span.start as usize) != Some(&b'(');
                            add_api_method_types_to_function_like(
                                &af.params,
                                af.return_type.is_some(),
                                arrow_pos,
                                af.span.start,
                                parenless,
                                af.r#async,
                                is_ts,
                                comments,
                                source,
                                ex.span.start,
                                adds,
                            );
                        }
                        oxc::Expression::FunctionExpression(f) => {
                            add_api_method_types_to_function_like(
                                &f.params,
                                f.return_type.is_some(),
                                f.body.as_deref().map(|b| b.span().start),
                                f.span.start,
                                false,
                                f.r#async,
                                is_ts,
                                comments,
                                source,
                                ex.span.start,
                                adds,
                            );
                        }
                        _ => {}
                    }
                }
                _ => {}
            }
        }
        oxc::Declaration::FunctionDeclaration(f) => {
            let Some(id) = &f.id else { return };
            let name = id.name.as_str();
            match name {
                "load" => {
                    add_load_param_type_to_function_like(
                        &f.params,
                        ex.span.start,
                        false,
                        load_type,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                "entries" => {
                    if basename.starts_with("+layout") {
                        return;
                    }
                    add_entries_type_to_function_like(
                        &f.params,
                        f.return_type.is_some(),
                        f.body.as_deref().map(|b| b.span().start),
                        ex.span.start,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                "GET" | "PUT" | "POST" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "fallback" => {
                    add_api_method_types_to_function_like(
                        &f.params,
                        f.return_type.is_some(),
                        f.body.as_deref().map(|b| b.span().start),
                        ex.span.start,
                        false,
                        f.r#async,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                _ => {}
            }
        }
        _ => {}
    }
}

/// Shared param-type augmentation for a route's `load` export, regardless of
/// whether it arrived as a `FunctionDeclaration` or a `const` initializer
/// (`ArrowFunctionExpression` / `FunctionExpression`). Mirrors the
/// `load?.type === 'function'` branch in `upsertKitRouteFile` in the JS
/// reference — unlike the API-method/hooks/match helpers, `load` never gets a
/// return-type annotation (only its single parameter is typed), and its gate
/// only ever considers the parameter, not any pre-existing return-type
/// annotation on the function itself.
#[allow(clippy::too_many_arguments)]
fn add_load_param_type_to_function_like(
    params: &oxc::FormalParameters,
    fn_like_start: u32,
    needs_parens: bool,
    load_type: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    source: &str,
    stmt_start: u32,
    adds: &mut Vec<AddedCode>,
) {
    if params.items.len() != 1 {
        return;
    }
    let param = &params.items[0];
    if param.type_annotation.is_some()
        || function_already_typed(
            comments,
            source,
            is_ts,
            stmt_start,
            fn_like_start,
            ParamTarget::for_pattern(&param.pattern),
        )
    {
        return;
    }
    if is_ts {
        let pos = param.pattern.span().end;
        if needs_parens {
            adds.push(AddedCode {
                original_pos: param.pattern.span().start,
                inserted: "(".into(),
            });
        }
        adds.push(AddedCode {
            original_pos: pos,
            inserted: format!(": {load_type}Event"),
        });
        if needs_parens {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ")".into(),
            });
        }
    } else {
        // JSDoc `@param` is anchored on the function-like value itself: the
        // exported statement for a `FunctionDeclaration` (TypeScript ignores a
        // tag sandwiched between `export` and `function`), or the initializer
        // for a `const` arrow/function-expression form.
        let param_name = binding_pattern_name(&param.pattern).unwrap_or("arg0");
        adds.push(AddedCode {
            original_pos: fn_like_start,
            inserted: format!("/** @param {{{load_type}Event}} {param_name} */ "),
        });
    }
}

/// Shared param/return-type augmentation for an API route handler
/// (`GET`/`PUT`/…/`fallback`), regardless of whether it arrived as a
/// `FunctionDeclaration` or a `const` initializer (`ArrowFunctionExpression` /
/// `FunctionExpression`). Mirrors `insertApiMethod`'s call into `addTypeToFunction`
/// in the JS reference, which folds both shapes into one path via `findExports`.
#[allow(clippy::too_many_arguments)]
fn add_api_method_types_to_function_like(
    params: &oxc::FormalParameters,
    has_return_type: bool,
    return_insert_pos: Option<u32>,
    fn_like_start: u32,
    needs_parens: bool,
    is_async: bool,
    is_ts: bool,
    comments: &[oxc::Comment],
    source: &str,
    stmt_start: u32,
    adds: &mut Vec<AddedCode>,
) {
    if params.items.len() != 1 {
        return;
    }
    let param = &params.items[0];
    // Official gates both the param and the return-type insertion on a single
    // `!fn.hasTypeDefinition` (a manually-typed param — or, in a `.js` file, a
    // pre-existing `@type`/`@param` JSDoc tag — means "leave this function
    // alone entirely"; see `addTypeToFunction` in the JS reference).
    if param.type_annotation.is_some()
        || function_already_typed(
            comments,
            source,
            is_ts,
            stmt_start,
            fn_like_start,
            ParamTarget::for_pattern(&param.pattern),
        )
    {
        return;
    }
    if is_ts {
        let pos = param.pattern.span().end;
        if needs_parens {
            adds.push(AddedCode {
                original_pos: param.pattern.span().start,
                inserted: "(".into(),
            });
        }
        adds.push(AddedCode {
            original_pos: pos,
            inserted: ": import('./$types.js').RequestEvent".into(),
        });
        if needs_parens {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ")".into(),
            });
        }
        if !has_return_type && let Some(pos) = return_insert_pos {
            let ret_ty = if is_async {
                "Promise<Response>"
            } else {
                "Response | Promise<Response>"
            };
            adds.push(AddedCode {
                original_pos: pos,
                inserted: format!(": {ret_ty} "),
            });
        }
    } else {
        // JS: `/** @type {(event: RequestEvent) => Response | Promise<Response>} */`,
        // anchored on the function-like value itself: the exported statement for a
        // `FunctionDeclaration` (see the `load` branch above for why), or the
        // initializer for a `const` arrow/function-expression form.
        let ret_ty = if is_async {
            "Promise<Response>"
        } else {
            "Response | Promise<Response>"
        };
        adds.push(AddedCode {
            original_pos: fn_like_start,
            inserted: format!(
                "/** @type {{(event: import('./$types.js').RequestEvent) => {ret_ty}}} */ "
            ),
        });
    }
}

/// Shared augmentation for a route's `entries` export, regardless of whether it
/// arrived as a `FunctionDeclaration` or a `const` initializer. Mirrors the
/// `entries` block in `upsertKitRouteFile` in the JS reference.
#[allow(clippy::too_many_arguments)]
fn add_entries_type_to_function_like(
    params: &oxc::FormalParameters,
    has_return_type: bool,
    return_insert_pos: Option<u32>,
    fn_like_start: u32,
    is_ts: bool,
    comments: &[oxc::Comment],
    source: &str,
    stmt_start: u32,
    adds: &mut Vec<AddedCode>,
) {
    if !params.items.is_empty() {
        return;
    }
    if function_already_typed(
        comments,
        source,
        is_ts,
        stmt_start,
        fn_like_start,
        ParamTarget::None,
    ) {
        return;
    }
    if is_ts {
        if !has_return_type && let Some(pos) = return_insert_pos {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ": ReturnType<import('./$types.js').EntryGenerator> ".into(),
            });
        }
    } else {
        // Same anchoring rule as `add_api_method_types_to_function_like`'s JS branch.
        adds.push(AddedCode {
            original_pos: fn_like_start,
            inserted: "/** @type {import('./$types.js').EntryGenerator} */ ".into(),
        });
    }
}

fn visit_param_statement(
    stmt: &oxc::Statement,
    source: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    adds: &mut Vec<AddedCode>,
) {
    let oxc::Statement::ExportNamedDeclaration(ex) = stmt else {
        return;
    };
    let Some(decl) = &ex.declaration else { return };
    match decl {
        oxc::Declaration::FunctionDeclaration(f) => {
            let Some(id) = &f.id else { return };
            if id.name.as_str() != "match" {
                return;
            }
            add_match_type_to_function_like(
                &f.params,
                f.return_type.is_some(),
                f.body.as_deref().map(|b| b.span().start),
                ex.span.start,
                false,
                is_ts,
                comments,
                source,
                ex.span.start,
                adds,
            );
        }
        // `export const match = (param) => {...}` (or an arrow/function-expression form) —
        // same augmentation as the function-declaration form above. Mirrors `findExports`'
        // `'function'` variant in the JS reference folding both shapes into one path.
        oxc::Declaration::VariableDeclaration(var) => {
            if var.declarations.len() != 1 {
                return;
            }
            let d = &var.declarations[0];
            let oxc::BindingPattern::BindingIdentifier(id) = &d.id else {
                return;
            };
            if id.name.as_str() != "match"
                || var_already_typed(
                    comments,
                    source,
                    is_ts,
                    ex.span.start,
                    d.type_annotation.is_some(),
                    d.init.as_ref(),
                )
            {
                return;
            }
            let Some(init) = &d.init else { return };
            match unwrap_parens(init) {
                oxc::Expression::ArrowFunctionExpression(af) => {
                    let arrow_pos =
                        find_arrow_token(source, af.params.span.end, af.body.span.start);
                    let parenless =
                        source.as_bytes().get(af.params.span.start as usize) != Some(&b'(');
                    add_match_type_to_function_like(
                        &af.params,
                        af.return_type.is_some(),
                        arrow_pos,
                        af.span.start,
                        parenless,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                oxc::Expression::FunctionExpression(f) => {
                    add_match_type_to_function_like(
                        &f.params,
                        f.return_type.is_some(),
                        f.body.as_deref().map(|b| b.span().start),
                        f.span.start,
                        false,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                _ => {}
            }
        }
        _ => {}
    }
}

/// Shared param/return-type augmentation for a params-matcher's `match` export,
/// regardless of whether it arrived as a `FunctionDeclaration` or a `const`
/// initializer. Mirrors `addTypeToFunction('match', 'string', 'boolean')` in the
/// JS reference.
#[allow(clippy::too_many_arguments)]
fn add_match_type_to_function_like(
    params: &oxc::FormalParameters,
    has_return_type: bool,
    return_insert_pos: Option<u32>,
    fn_like_start: u32,
    needs_parens: bool,
    is_ts: bool,
    comments: &[oxc::Comment],
    source: &str,
    stmt_start: u32,
    adds: &mut Vec<AddedCode>,
) {
    if params.items.len() != 1 {
        return;
    }
    let param = &params.items[0];
    // Single gate for both insertions — see the identical comment in
    // `add_api_method_types_to_function_like`.
    if param.type_annotation.is_some()
        || function_already_typed(
            comments,
            source,
            is_ts,
            stmt_start,
            fn_like_start,
            ParamTarget::for_pattern(&param.pattern),
        )
    {
        return;
    }
    if is_ts {
        let pos = param.pattern.span().end;
        if needs_parens {
            adds.push(AddedCode {
                original_pos: param.pattern.span().start,
                inserted: "(".into(),
            });
        }
        adds.push(AddedCode {
            original_pos: pos,
            inserted: ": string".into(),
        });
        if needs_parens {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ")".into(),
            });
        }
        if !has_return_type && let Some(pos) = return_insert_pos {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ": boolean ".into(),
            });
        }
    } else {
        // JS: `/** @type {(param: string) => boolean} */`, anchored on the function-like
        // value itself (see `add_api_method_types_to_function_like`'s JS branch for why).
        adds.push(AddedCode {
            original_pos: fn_like_start,
            inserted: "/** @type {(param: string) => boolean} */ ".into(),
        });
    }
}

fn visit_server_hooks_statement(
    stmt: &oxc::Statement,
    source: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    adds: &mut Vec<AddedCode>,
) {
    add_hooks_type(
        stmt,
        source,
        "handleError",
        "import('@sveltejs/kit').HandleServerError",
        is_ts,
        comments,
        adds,
    );
    add_hooks_type(
        stmt,
        source,
        "handle",
        "import('@sveltejs/kit').Handle",
        is_ts,
        comments,
        adds,
    );
    add_hooks_type(
        stmt,
        source,
        "handleFetch",
        "import('@sveltejs/kit').HandleFetch",
        is_ts,
        comments,
        adds,
    );
}

fn visit_client_hooks_statement(
    stmt: &oxc::Statement,
    source: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    adds: &mut Vec<AddedCode>,
) {
    add_hooks_type(
        stmt,
        source,
        "handleError",
        "import('@sveltejs/kit').HandleClientError",
        is_ts,
        comments,
        adds,
    );
}

fn visit_universal_hooks_statement(
    stmt: &oxc::Statement,
    source: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    adds: &mut Vec<AddedCode>,
) {
    add_hooks_type(
        stmt,
        source,
        "reroute",
        "import('@sveltejs/kit').Reroute",
        is_ts,
        comments,
        adds,
    );
}

fn add_hooks_type(
    stmt: &oxc::Statement,
    source: &str,
    name: &str,
    ty: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    adds: &mut Vec<AddedCode>,
) {
    let oxc::Statement::ExportNamedDeclaration(ex) = stmt else {
        return;
    };
    let Some(decl) = &ex.declaration else { return };
    match decl {
        oxc::Declaration::FunctionDeclaration(f) => {
            let Some(id) = &f.id else { return };
            if id.name.as_str() != name {
                return;
            }
            add_hooks_type_to_function_like(
                &f.params,
                f.return_type.is_some(),
                f.body.as_deref().map(|b| b.span().start),
                // JS-only: a JSDoc `@type` tag on a `function` declaration is ignored unless it leads the whole exported statement.
                ex.span.start,
                false,
                ty,
                is_ts,
                comments,
                source,
                ex.span.start,
                adds,
            );
        }
        // `export const handleFetch = async ({ request, fetch, event }) => {...}`
        // (or a plain `function (...) {...}` expression) — same augmentation as
        // the function-declaration form above, just reached through a
        // `VariableDeclaration` initializer instead of `f.body`/`f.span`
        // directly. Mirrors `findExports`' `'function'` variant in the JS
        // reference, which folds both shapes into one path.
        oxc::Declaration::VariableDeclaration(var) => {
            if var.declarations.len() != 1 {
                return;
            }
            let d = &var.declarations[0];
            let oxc::BindingPattern::BindingIdentifier(id) = &d.id else {
                return;
            };
            if id.name.as_str() != name
                || var_already_typed(
                    comments,
                    source,
                    is_ts,
                    ex.span.start,
                    d.type_annotation.is_some(),
                    d.init.as_ref(),
                )
            {
                return;
            }
            let Some(init) = &d.init else { return };
            match unwrap_parens(init) {
                oxc::Expression::ArrowFunctionExpression(af) => {
                    // Official anchors an arrow's return type on the `=>`
                    // token (`equalsGreaterThanToken.getStart()`), not on the
                    // params' end, so mirror that byte-for-byte.
                    let arrow_pos =
                        find_arrow_token(source, af.params.span.end, af.body.span.start);
                    // `x => …` has no parentheses to hang a parameter type off;
                    // annotating it in place would emit `x: T: R => …`, which
                    // does not parse. Add the parentheses ourselves.
                    let parenless =
                        source.as_bytes().get(af.params.span.start as usize) != Some(&b'(');
                    add_hooks_type_to_function_like(
                        &af.params,
                        af.return_type.is_some(),
                        arrow_pos,
                        af.span.start,
                        parenless,
                        ty,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                oxc::Expression::FunctionExpression(f) => {
                    add_hooks_type_to_function_like(
                        &f.params,
                        f.return_type.is_some(),
                        f.body.as_deref().map(|b| b.span().start),
                        f.span.start,
                        false,
                        ty,
                        is_ts,
                        comments,
                        source,
                        ex.span.start,
                        adds,
                    );
                }
                _ => {}
            }
        }
        _ => {}
    }
}

/// Byte offset of an arrow function's `=>` token, searched between the end of
/// its parameter list and the start of its body. Official anchors the return
/// type there (`equalsGreaterThanToken.getStart()`).
fn find_arrow_token(source: &str, from: u32, to: u32) -> Option<u32> {
    let (from, to) = (from as usize, to as usize);
    let slice = source.get(from..to.min(source.len()))?;
    slice.find("=>").map(|i| (from + i) as u32)
}

/// Shared param/return-type augmentation for a hook's function-like value,
/// regardless of whether it arrived as a `FunctionDeclaration` or a `const`
/// initializer (`ArrowFunctionExpression` / `FunctionExpression`).
#[allow(clippy::too_many_arguments)]
fn add_hooks_type_to_function_like(
    params: &oxc::FormalParameters,
    has_return_type: bool,
    return_insert_pos: Option<u32>,
    fn_like_start: u32,
    needs_parens: bool,
    ty: &str,
    is_ts: bool,
    comments: &[oxc::Comment],
    source: &str,
    stmt_start: u32,
    adds: &mut Vec<AddedCode>,
) {
    if params.items.len() != 1 {
        return;
    }
    let param = &params.items[0];
    // Single gate for both insertions — see the identical comment in
    // `add_api_method_types_to_function_like`.
    if param.type_annotation.is_some()
        || function_already_typed(
            comments,
            source,
            is_ts,
            stmt_start,
            fn_like_start,
            ParamTarget::for_pattern(&param.pattern),
        )
    {
        return;
    }
    if is_ts {
        let pos = param.pattern.span().end;
        // Insertions anchored at the same offset keep their push order
        // (`sort_by_key` is stable), so the closing paren has to go after
        // the annotation it wraps.
        if needs_parens {
            adds.push(AddedCode {
                original_pos: param.pattern.span().start,
                inserted: "(".into(),
            });
        }
        adds.push(AddedCode {
            original_pos: pos,
            inserted: format!(": Parameters<{ty}>[0]"),
        });
        if needs_parens {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: ")".into(),
            });
        }
        if !has_return_type && let Some(pos) = return_insert_pos {
            adds.push(AddedCode {
                original_pos: pos,
                inserted: format!(": ReturnType<{ty}> "),
            });
        }
    } else {
        // JS: `/** @type {Handle} */` (or `HandleServerError`, etc.) prepended to fn.
        adds.push(AddedCode {
            original_pos: fn_like_start,
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
            augmented.contains(&format!(
                "ssr{IGNORE_START_COMMENT} : boolean{IGNORE_END_COMMENT}"
            )),
            "augmented = {augmented:?}"
        );
        // Original prefix preserved — column 13 still lands at `ssr`.
        assert!(augmented.starts_with("export const ssr"));
    }

    #[test]
    fn load_var_arrow_form_gets_param_type_not_satisfies() {
        // #2055 (2): `findExports` classifies a `const load = (...) => ...` whose
        // initializer is itself function-like as `type: 'function'`, not `'var'` —
        // only the parameter gets typed, exactly like the `function load(...)` form.
        // The `satisfies` wrapper is reserved for a non-function-like initializer
        // (see `load_var_non_function_form_emits_satisfies_wrapper` below).
        let path = PathBuf::from("src/routes/+layout.server.ts");
        let source = "export const load = async ({ url }) => ({ url });\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default()).expect("load");
        let augmented = apply_added_code(source, &adds);
        assert!(
            !augmented.contains("satisfies"),
            "a function-like `load` initializer must not be wrapped in `satisfies`: {augmented}"
        );
        assert!(
            augmented.contains(&format!(
                "({{ url }}{IGNORE_START_COMMENT}: import('./$types.js').LayoutServerLoadEvent{IGNORE_END_COMMENT}) =>"
            )),
            "got: {augmented}"
        );
    }

    #[test]
    fn load_var_non_function_form_emits_satisfies_wrapper() {
        // The `satisfies` wrapper only applies when `load`'s initializer isn't
        // function-like — `findExports` then classifies it as `type: 'var'`.
        let path = PathBuf::from("src/routes/+layout.server.ts");
        let source = "import { loadImpl } from './helpers';\nexport const load = loadImpl;\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default()).expect("load");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}) satisfies import('./$types.js').LayoutServerLoad{IGNORE_END_COMMENT}"
            )),
            "got: {augmented}"
        );
    }

    #[test]
    fn hooks_handle_fetch_arrow_const_form_gets_param_and_return_types() {
        let path = PathBuf::from("src/hooks.server.ts");
        let source = "export const handleFetch = async ({ request, fetch, event }) => {\n  return fetch(request);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("arrow-const handleFetch should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "({{ request, fetch, event }}{IGNORE_START_COMMENT}: Parameters<import('@sveltejs/kit').HandleFetch>[0]{IGNORE_END_COMMENT}) {IGNORE_START_COMMENT}: ReturnType<import('@sveltejs/kit').HandleFetch> {IGNORE_END_COMMENT}=>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn hooks_handle_function_expression_const_form_gets_param_and_return_types() {
        let path = PathBuf::from("src/hooks.server.ts");
        let source =
            "export const handle = function ({ event, resolve }) {\n  return resolve(event);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("function-expression const handle should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}: Parameters<import('@sveltejs/kit').Handle>[0]{IGNORE_END_COMMENT}"
            )),
            "augmented = {augmented:?}"
        );
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}: ReturnType<import('@sveltejs/kit').Handle> {IGNORE_END_COMMENT}{{"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn hooks_parenthesis_less_arrow_param_gets_wrapped_in_parentheses() {
        // `e => …` has nowhere to put a parameter type: annotating in place
        // would emit `e: T: R => …`, which does not parse, so the whole kit
        // file's diagnostics would be replaced by syntax noise.
        let path = PathBuf::from("src/hooks.server.ts");
        let source = "export const handleError = e => ({ message: 'x' });\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("parenthesis-less arrow handleError should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}({IGNORE_END_COMMENT}e{IGNORE_START_COMMENT}: Parameters<import('@sveltejs/kit').HandleServerError>[0]{IGNORE_END_COMMENT}{IGNORE_START_COMMENT}){IGNORE_END_COMMENT} {IGNORE_START_COMMENT}: ReturnType<import('@sveltejs/kit').HandleServerError> {IGNORE_END_COMMENT}=>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn hooks_already_typed_arrow_const_is_left_alone() {
        let path = PathBuf::from("src/hooks.server.ts");
        let source = "export const handle: import('@sveltejs/kit').Handle = async ({ event, resolve }) => resolve(event);\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "an explicitly-typed const hook shouldn't be re-annotated"
        );
    }

    // #1944 (1): a manually-typed param means "leave this function alone
    // entirely" in the JS reference (`addTypeToFunction`'s single
    // `!fn.hasTypeDefinition` gate) — a return-type annotation must not be
    // injected just because *it* happens to be missing.

    #[test]
    fn api_get_typed_param_gets_no_return_type_injected() {
        let path = PathBuf::from("src/routes/api/+server.ts");
        let source = "export const GET = (event: import('./$types.js').RequestEvent) => {\n  return new Response();\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "a manually-typed param must suppress the return-type injection too"
        );
    }

    #[test]
    fn match_typed_param_gets_no_return_type_injected() {
        let path = PathBuf::from("src/params/slug.ts");
        let source = "export function match(param: string) {\n  return param.length > 0;\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "a manually-typed param must suppress the return-type injection too"
        );
    }

    #[test]
    fn hooks_handle_fetch_typed_param_gets_no_return_type_injected() {
        let path = PathBuf::from("src/hooks.server.ts");
        let source = "export const handleFetch = (arg: Parameters<import('@sveltejs/kit').HandleFetch>[0]) => {\n  return arg.fetch(arg.request);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "a manually-typed param must suppress the return-type injection too"
        );
    }

    // #1944 (2): `findExports` unwraps a single level of `(expr)` around a
    // `const` initializer before matching Arrow/FunctionExpression shapes,
    // so a parenthesized function-like initializer must still be augmented
    // instead of falling into the no-op wildcard arm.

    #[test]
    fn api_get_parenthesized_arrow_const_form_gets_augmented() {
        let path = PathBuf::from("src/routes/api/+server.ts");
        let source = "export const GET = (async ({ url }) => {\n  return new Response(url);\n});\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("parenthesized arrow-const GET should still be augmented");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "({{ url }}{IGNORE_START_COMMENT}: import('./$types.js').RequestEvent{IGNORE_END_COMMENT}) {IGNORE_START_COMMENT}: Promise<Response> {IGNORE_END_COMMENT}=>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn match_parenthesized_arrow_const_form_gets_augmented() {
        let path = PathBuf::from("src/params/slug.ts");
        let source = "export const match = (param => param.length > 0);\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("parenthesized arrow-const match should still be augmented");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= ({IGNORE_START_COMMENT}({IGNORE_END_COMMENT}param{IGNORE_START_COMMENT}: string{IGNORE_END_COMMENT}{IGNORE_START_COMMENT}){IGNORE_END_COMMENT} {IGNORE_START_COMMENT}: boolean {IGNORE_END_COMMENT}=>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn hooks_handle_parenthesized_arrow_const_form_gets_augmented() {
        let path = PathBuf::from("src/hooks.server.ts");
        let source = "export const handle = (async ({ event, resolve }) => resolve(event));\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("parenthesized arrow-const handle should still be augmented");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "({{ event, resolve }}{IGNORE_START_COMMENT}: Parameters<import('@sveltejs/kit').Handle>[0]{IGNORE_END_COMMENT}) {IGNORE_START_COMMENT}: ReturnType<import('@sveltejs/kit').Handle> {IGNORE_END_COMMENT}=>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn non_kit_file_returns_none() {
        let path = PathBuf::from("src/util.ts");
        let source = "export const ssr = false;\n";
        assert!(build_added_code(&path, source, &KitFilesSettings::default()).is_none());
    }

    // #2055 (1): official's `load` gate for a `function load(...)` declaration is
    // `hasTypedParameter`, which only looks at the *parameter's* type — an
    // existing return-type annotation must not suppress the param injection.

    #[test]
    fn return_typed_function_load_still_gets_param_type() {
        let path = PathBuf::from("src/routes/+page.ts");
        let source = "export async function load(event): Promise<{}> {\n  return {};\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("a return-typed load function must still get its param typed");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "load(event{IGNORE_START_COMMENT}: import('./$types.js').PageLoadEvent{IGNORE_END_COMMENT}): Promise<{{}}>"
            )),
            "augmented = {augmented:?}"
        );
    }

    // #2055 (2): `findExports` classifies a `const load = (...) => ...` whose
    // initializer is already a function expression as `type: 'function'`; a
    // manually-typed param there means "leave alone", same as the
    // `function load(...)` form — no `satisfies` wrapper is ever added.

    #[test]
    fn load_var_arrow_already_typed_parenthesized_is_left_alone() {
        let path = PathBuf::from("src/routes/+page.ts");
        let source = "export const load = (async (event: import('./$types.js').PageLoadEvent) => {\n  return {};\n});\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "an already-typed parenthesized arrow-const load must not be re-annotated or wrapped"
        );
    }

    #[test]
    fn load_var_arrow_parenless_param_gets_wrapped_in_parentheses() {
        // Same syntax-safety fix already applied to hooks/API methods/match
        // (see `hooks_parenthesis_less_arrow_param_gets_wrapped_in_parentheses`) —
        // annotating a parenthesis-less arrow param in place would emit
        // `event: T => ...`, which does not parse.
        let path = PathBuf::from("src/routes/+page.server.ts");
        let source = "export const load = event => ({ user: event.locals.user });\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("parenthesis-less arrow load should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}({IGNORE_END_COMMENT}event{IGNORE_START_COMMENT}: import('./$types.js').PageServerLoadEvent{IGNORE_END_COMMENT}{IGNORE_START_COMMENT}){IGNORE_END_COMMENT} =>"
            )),
            "augmented = {augmented:?}"
        );
    }

    // #2055 (3): the JSDoc gate must apply on `.js` files for every function-like
    // and var-like export, not just the API-method/hooks paths #1944 already
    // covered — an existing `@type`/`@param`/`@satisfies` tag must suppress
    // re-annotation everywhere `hasTypeDefinition`/`hasTypedParameter` do in the
    // JS reference.

    #[test]
    fn js_hooks_handle_with_existing_type_tag_is_left_alone() {
        let path = PathBuf::from("src/hooks.server.js");
        let source = "/**\n * @type {Handle}\n */\nexport async function handle({ event, resolve }) {\n  return resolve(event);\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "an existing `@type` JSDoc tag must suppress re-annotation"
        );
    }

    #[test]
    fn js_server_get_with_existing_param_tag_is_left_alone() {
        let path = PathBuf::from("src/routes/api/+server.js");
        let source = "/**\n * @param {RequestEvent} event\n */\nexport async function GET(event) {\n  return new Response();\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "an existing `@param` JSDoc tag must suppress re-annotation"
        );
    }

    #[test]
    fn js_route_load_with_existing_param_tag_is_left_alone() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @param {PageLoadEvent} event\n */\nexport async function load(event) {\n  return {};\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "an existing `@param` JSDoc tag must suppress re-annotation"
        );
    }

    // Review follow-up on the #2055 implementation: the JSDoc gate must match
    // TypeScript's *structural* `getJSDocType`/`getJSDocTags`/
    // `getJSDocParameterTags`, not a bare substring search — `@typedef`
    // contains `@type` as a substring, a description can mention `@types/node`
    // or `@param` in running prose, and a `@param` tag only counts if its
    // declared name actually matches the parameter it's meant to type. Every
    // case below was verified against the real `upsertKitFile` first — the
    // official checker augments each of these (0 errors either way only
    // because the augmentation still runs).

    #[test]
    fn js_load_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @typedef {import('./$types.js').PageLoadEvent} Event\n */\nexport async function load(event) {\n  return {};\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@type` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @param {{import('./$types.js').PageLoadEvent}} event */ {IGNORE_END_COMMENT}export async function load"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_prose_types_mention_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * Uses conventions from @types/node.\n */\nexport async function load(event) {\n  return {};\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("a prose mention of `@types/node` must not read as an `@type` tag");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("@param {import('./$types.js').PageLoadEvent} event"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_hooks_handle_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/hooks.server.js");
        let source = "/**\n * @typedef {import('@sveltejs/kit').Handle} Handle\n */\nexport async function handle({ event, resolve }) {\n  return resolve(event);\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@type` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @type {{import('@sveltejs/kit').Handle}} */ {IGNORE_END_COMMENT}export async function handle"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_entries_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @typedef {import('./$types.js').EntryGenerator} Gen\n */\nexport function entries() {\n  return [];\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@type` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @type {{import('./$types.js').EntryGenerator}} */ {IGNORE_END_COMMENT}export function entries"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_ssr_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @typedef {boolean} Flag\n */\nexport const ssr = true;\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@type` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{boolean}} */ ({IGNORE_END_COMMENT}true{IGNORE_START_COMMENT}){IGNORE_END_COMMENT};"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_actions_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.server.js");
        let source = "/**\n * @typedef {import('./$types.js').Actions} A\n */\nexport const actions = {\n  default: async (event) => ({})\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@satisfies` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @satisfies {{import('./$types.js').Actions}} */ ({IGNORE_END_COMMENT}{{"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_param_tag_wrong_name_still_gets_augmented() {
        // Official's `getJSDocParameterTags` only recognises a `@param` tag
        // whose declared name matches the actual identifier parameter — a tag
        // documenting an unrelated name doesn't count as typing `event`.
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @param {number} other\n */\nexport async function load(event) {\n  return { other };\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("a `@param` tag naming a different identifier must not suppress augmentation");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("@param {import('./$types.js').PageLoadEvent} event"),
            "augmented = {augmented:?}"
        );
    }

    // Review follow-up: `jsdoc_param_target`'s brace-skip used to stop at the
    // *first* `}`, so a `@param` type annotation containing its own braces
    // mis-extracted the declared name and the tag was wrongly treated as not
    // targeting the real parameter — the gate then failed to suppress
    // augmentation and rsvelte double-annotated where official leaves the
    // file untouched. Verified against the real `upsertKitFile` first.

    #[test]
    fn js_load_param_tag_nested_object_type_matching_name_is_left_alone() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @param {{ url: URL }} event\n */\nexport async function load(event) {\n  return { url: event.url };\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.as_ref().is_none_or(|a| a.is_empty()),
            "a `@param` tag with a brace-nested type must still be parsed to its real name: {adds:?}"
        );
    }

    #[test]
    fn js_load_param_tag_generic_nested_object_type_matching_name_is_left_alone() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @param {Array<{ a: string }>} event\n */\nexport async function load(event) {\n  return { event };\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.as_ref().is_none_or(|a| a.is_empty()),
            "a `@param` tag with a generic+brace-nested type must still be parsed to its real name: {adds:?}"
        );
    }

    #[test]
    fn js_load_param_tag_plain_type_matching_name_is_left_alone() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @param {number} event\n */\nexport async function load(event) {\n  return { event };\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.as_ref().is_none_or(|a| a.is_empty()),
            "a plain (unbraced-body) `@param` type must still resolve to the right name: {adds:?}"
        );
    }

    #[test]
    fn js_load_param_tag_nested_object_type_wrong_name_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @param {{ url: URL }} other\n */\nexport async function load(event) {\n  return { url: event.url };\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default()).expect(
            "a brace-nested `@param` type naming a different identifier must not suppress augmentation",
        );
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("@param {import('./$types.js').PageLoadEvent} event"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_var_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * @typedef {import('./$types.js').PageLoadEvent} Event\n */\nexport const load = async (event) => {\n  return {};\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@type`/`@param` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @param {{import('./$types.js').PageLoadEvent}} event */ {IGNORE_END_COMMENT}async (event)"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_hooks_arrow_typedef_only_still_gets_augmented() {
        let path = PathBuf::from("src/hooks.server.js");
        let source = "/**\n * @typedef {import('@sveltejs/kit').Handle} Handle\n */\nexport const handle = async ({ event, resolve }) => {\n  return resolve(event);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("`@typedef` is not `@type` — the gate must not confuse the two");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{import('@sveltejs/kit').Handle}} */ {IGNORE_END_COMMENT}async ({{ event, resolve }})"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_multiline_jsdoc_desc_mentioning_param_word_still_gets_augmented() {
        // A description line that merely *contains* the substring `@param`
        // (not at the start of the line) must not read as a real tag.
        let path = PathBuf::from("src/routes/+page.js");
        let source = "/**\n * Some description mentions the pattern @param inline without it being a tag.\n */\nexport async function load(event) {\n  return {};\n}\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("a mid-line `@param` mention in prose must not read as a real tag");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains("@param {import('./$types.js').PageLoadEvent} event"),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_hooks_handle_with_existing_satisfies_tag_is_left_alone() {
        // #2055 P2 follow-up: `add_hooks_type`'s `VariableDeclaration` arm only
        // checked `d.type_annotation.is_some()`, never `var_already_typed`, so
        // a `@satisfies` tag (JS-only half of `hasTypeDefinition`) didn't
        // suppress re-annotation.
        let path = PathBuf::from("src/hooks.server.js");
        let source = "/**\n * @satisfies {import('@sveltejs/kit').Handle}\n */\nexport const handle = async ({ event, resolve }) => {\n  return resolve(event);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.as_ref().is_none_or(|a| a.is_empty()),
            "an existing `@satisfies` JSDoc tag must suppress re-annotation: {adds:?}"
        );
    }

    #[test]
    fn js_match_with_existing_satisfies_tag_is_left_alone() {
        // Same follow-up as above, for `visit_param_statement`'s
        // `VariableDeclaration` arm.
        let path = PathBuf::from("src/params/slug.js");
        let source = "/**\n * @satisfies {(param: string) => boolean}\n */\nexport const match = (param) => param.length > 0;\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.as_ref().is_none_or(|a| a.is_empty()),
            "an existing `@satisfies` JSDoc tag must suppress re-annotation: {adds:?}"
        );
    }

    // #2055 (4): official's `findExports` only recognises a single-declarator
    // `export const x = ...` — a multi-declarator statement isn't looked up
    // under either name, so neither export gets augmented.

    #[test]
    fn multi_declarator_export_is_left_alone() {
        let path = PathBuf::from("src/routes/api/+server.ts");
        let source = "export const ssr = true, GET = async (event) => new Response();\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "a multi-declarator export statement must not be augmented at all"
        );
    }

    #[test]
    fn multi_declarator_load_export_is_left_alone() {
        let path = PathBuf::from("src/routes/+page.ts");
        let source = "export const prerender = true, load = async (event) => ({});\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default());
        assert!(
            adds.is_none_or(|a| a.is_empty()),
            "a multi-declarator export statement must not be augmented at all"
        );
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
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{boolean}} */ ({IGNORE_END_COMMENT}'invalid'{IGNORE_START_COMMENT}){IGNORE_END_COMMENT};"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_var_arrow_form_uses_jsdoc_param_not_satisfies() {
        // JS mirror of `load_var_arrow_form_gets_param_type_not_satisfies`.
        let path = PathBuf::from("src/routes/+layout.server.js");
        let source = "export const load = async ({ url }) => ({ url });\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js load should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            !augmented.contains("@satisfies"),
            "a function-like `load` initializer must not get a `@satisfies` JSDoc wrapper: {augmented}"
        );
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @param {{import('./$types.js').LayoutServerLoadEvent}} arg0 */ {IGNORE_END_COMMENT}async ({{ url }})"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_load_var_non_function_form_uses_jsdoc_satisfies_wrapper() {
        let path = PathBuf::from("src/routes/+layout.server.js");
        let source = "import { loadImpl } from './helpers.js';\nexport const load = loadImpl;\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js load should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @satisfies {{import('./$types.js').LayoutServerLoad}} */ ({IGNORE_END_COMMENT}loadImpl{IGNORE_START_COMMENT}){IGNORE_END_COMMENT};"
            )),
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
        // The JSDoc `@type` tag must precede the *whole* exported statement
        // (`export function …`), not just the `function` keyword — TypeScript
        // silently ignores an `@type` tag sitting between `export` and
        // `function` and every binding element stays implicit `any`.
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @type {{import('@sveltejs/kit').Handle}} */ {IGNORE_END_COMMENT}export function handle"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_hooks_handle_fetch_arrow_const_form_uses_jsdoc_type() {
        // JS mirrors the TS arrow-const case above (#1886): the augmentation
        // reaches `add_hooks_type_to_function_like` through the same
        // `VariableDeclaration` -> `ArrowFunctionExpression` path, just with
        // the JSDoc wrapper instead of an inline type annotation.
        let path = PathBuf::from("src/hooks.server.js");
        let source = "export const handleFetch = async ({ request, fetch, event }) => {\n  return fetch(request);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js arrow-const handleFetch should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{import('@sveltejs/kit').HandleFetch}} */ {IGNORE_END_COMMENT}async ({{ request, fetch, event }})"
            )),
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
        // Anchored before `export`, not just `function` — see the hooks test above.
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @type {{(param: string) => boolean}} */ {IGNORE_END_COMMENT}export function match"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_params_match_arrow_const_form_uses_jsdoc_signature() {
        let path = PathBuf::from("src/params/slug.js");
        let source = "export const match = (param) => param.length > 0;\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js arrow-const match should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{(param: string) => boolean}} */ {IGNORE_END_COMMENT}(param)"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_params_match_function_expression_form_uses_jsdoc_signature() {
        // Review follow-up on #1918/#1940: the arrow-const test above doesn't exercise
        // the `oxc::Expression::FunctionExpression` arm at all — cover it directly.
        let path = PathBuf::from("src/params/slug.js");
        let source = "export const match = function (param) {\n  return param.length > 0;\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js function-expression match should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{(param: string) => boolean}} */ {IGNORE_END_COMMENT}function (param)"
            )),
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
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @type {{(event: import('./$types.js').RequestEvent) => Response | Promise<Response>}} */ {IGNORE_END_COMMENT}export function GET"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_api_get_arrow_const_form_uses_jsdoc_signature() {
        // #1918: the exact cmsaasstarter shape from the Layer-2 e2e ratchet —
        // `export const GET = async ({ url, locals: { supabase } }) => {...}` — must get
        // the same JSDoc annotation as the `FunctionDeclaration` form above, or every
        // destructured binding element reports TS7031.
        let path = PathBuf::from("src/routes/(marketing)/auth/callback/+server.js");
        let source = "export const GET = async ({ url, locals: { supabase } }) => {\n  return new Response('ok');\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js arrow-const GET should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{(event: import('./$types.js').RequestEvent) => Promise<Response>}} */ {IGNORE_END_COMMENT}async ({{ url, locals: {{ supabase }} }})"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn api_get_arrow_const_ts_form_gets_param_and_return_types() {
        let path = PathBuf::from("src/routes/api/+server.ts");
        let source = "export const GET = async ({ url }) => {\n  return new Response(url);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("ts arrow-const GET should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "({{ url }}{IGNORE_START_COMMENT}: import('./$types.js').RequestEvent{IGNORE_END_COMMENT}) {IGNORE_START_COMMENT}: Promise<Response> {IGNORE_END_COMMENT}=>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_api_get_function_expression_form_uses_jsdoc_signature() {
        // Review follow-up on #1918/#1940: covers the `oxc::Expression::FunctionExpression`
        // arm added to `visit_route_statement`'s `VariableDeclaration` match, which the
        // arrow-const test above never reaches.
        let path = PathBuf::from("src/routes/(marketing)/auth/callback/+server.js");
        let source =
            "export const GET = async function ({ url }) {\n  return new Response(url);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js function-expression GET should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{(event: import('./$types.js').RequestEvent) => Promise<Response>}} */ {IGNORE_END_COMMENT}async function ({{ url }})"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn api_get_function_expression_ts_form_gets_param_and_return_types() {
        let path = PathBuf::from("src/routes/api/+server.ts");
        let source =
            "export const GET = async function ({ url }) {\n  return new Response(url);\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("ts function-expression GET should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "({{ url }}{IGNORE_START_COMMENT}: import('./$types.js').RequestEvent{IGNORE_END_COMMENT}) {IGNORE_START_COMMENT}: Promise<Response> {IGNORE_END_COMMENT}{{"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_route_load_function_uses_jsdoc_param() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "export function load(event) { return event; }\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js route load should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @param {{import('./$types.js').PageLoadEvent}} event */ {IGNORE_END_COMMENT}export function load"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_route_entries_function_uses_jsdoc_type() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "export function entries() { return []; }\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js route entries should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "{IGNORE_START_COMMENT}/** @type {{import('./$types.js').EntryGenerator}} */ {IGNORE_END_COMMENT}export function entries"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_route_entries_arrow_const_form_uses_jsdoc_type() {
        let path = PathBuf::from("src/routes/+page.js");
        let source = "export const entries = () => [];\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js arrow-const entries should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{import('./$types.js').EntryGenerator}} */ {IGNORE_END_COMMENT}() =>"
            )),
            "augmented = {augmented:?}"
        );
    }

    #[test]
    fn js_route_entries_function_expression_form_uses_jsdoc_type() {
        // Review follow-up on #1918/#1940: covers the `entries` `FunctionExpression` arm.
        let path = PathBuf::from("src/routes/+page.js");
        let source = "export const entries = function () {\n  return [];\n};\n";
        let adds = build_added_code(&path, source, &KitFilesSettings::default())
            .expect("js function-expression entries should emit insertions");
        let augmented = apply_added_code(source, &adds);
        assert!(
            augmented.contains(&format!(
                "= {IGNORE_START_COMMENT}/** @type {{import('./$types.js').EntryGenerator}} */ {IGNORE_END_COMMENT}function ()"
            )),
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
