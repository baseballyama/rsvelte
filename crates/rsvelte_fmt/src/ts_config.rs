//! Static evaluation of a JS/TS oxfmt config (`oxfmt.config.ts` /
//! `oxfmt.config.mts` via discovery, or any of `.js`/`.mjs`/`.cjs`/`.ts`/
//! `.cts`/`.mts` via an explicit `--config`) into a [`serde_json::Value`].
//!
//! `rsvelte-fmt` ships as a native binary with no embedded JS runtime, unlike
//! oxfmt's own NAPI build, which `import()`s the config through Node — and,
//! via Node's CJS/ESM interop, treats a CommonJS `module.exports` the same as
//! an ESM `export default` (both surface as the imported module's `.default`;
//! see oxfmt's `apps/shared/src-js/js_config/index.ts`). We instead parse the
//! file with `oxc_parser` and statically evaluate the object literal behind
//! `export default {...}`, `module.exports = {...}`,
//! `export default defineConfig({...})` /
//! `module.exports = defineConfig({...})`, or a local `const` re-export
//! (`const config = {...}; export default config;` /
//! `module.exports = config;`). Which dialect a file uses is read from its
//! *content*, not its extension — see [`source_type_for`]. `defineConfig` is
//! oxfmt's identity function (see its `src-js/index.ts`), so unwrapping the
//! call and evaluating its argument is equivalent to evaluating what it
//! returns.
//!
//! `.oxfmtrc.json`'s policy is to silently ignore whatever it can't parse — a
//! best-effort mapping is strictly better than falling back to defaults for
//! an implicitly-discovered file. A JS/TS config is a deliberate, explicit
//! choice, so here the opposite policy applies: anything not statically
//! resolvable (a call other than `defineConfig`, a reference to something
//! other than a local `const`, a spread, a computed key, an individual
//! `exports.foo = ...` assignment, …) is a hard error rather than a silent
//! partial read.

use std::collections::HashMap;
use std::path::Path;

use oxc_allocator::Allocator;
use oxc_ast::ast as oxc;
use oxc_parser::Parser as OxcParser;
use oxc_span::SourceType;

/// A local `const NAME = <expr>;` binding, keyed by name, so
/// `export default name` (or a `defineConfig(name)` wrapping one) can resolve
/// a simple re-export.
type Locals<'s, 'a> = HashMap<&'s str, &'s oxc::Expression<'a>>;

/// Recursion guard for local-identifier resolution — deep chains are more
/// likely a mistake (or a cycle) than a legitimate config than static
/// evaluation should chase.
const MAX_LOCAL_DEPTH: u8 = 16;

/// `true` for the config file extensions oxfmt's own `is_js_config_path`
/// recognizes as a JS/TS config (`crates/oxc_config/src/discovery.rs`
/// upstream). Auto-discovery only ever finds `oxfmt.config.ts`/`.mts` (see
/// `config::CONFIG_NAMES`), but an explicit `--config` may point at any of
/// these six extensions, matching oxfmt.
pub fn is_js_config_path(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()),
        Some("js" | "mjs" | "cjs" | "ts" | "cts" | "mts")
    )
}

/// The [`SourceType`] to parse `path` as: TypeScript grammar for
/// `.ts`/`.cts`/`.mts` (a strict syntactic superset of JS, needed for `as` /
/// `satisfies` / type annotations), plain JS grammar otherwise. The module
/// kind is always [`Unambiguous`](oxc_span::ModuleKind::Unambiguous) — ESM
/// `export default` and CommonJS `module.exports =` are both plain,
/// unconditionally-legal syntax to `oxc_parser` (module kind only gates
/// semantic-analysis-time concerns we never run here, e.g. top-level
/// `await`), so which dialect a file uses is decided by *scanning its body*
/// in [`evaluate`], not by its extension — exactly mirroring oxfmt's own
/// Node-side behavior, where CJS/ESM interop makes both forms surface
/// identically as `import()`'s `.default`.
fn source_type_for(path: &Path) -> SourceType {
    let is_ts = matches!(
        path.extension().and_then(|e| e.to_str()),
        Some("ts" | "cts" | "mts")
    );
    SourceType::default()
        .with_typescript(is_ts)
        .with_unambiguous(true)
}

/// Parse `source` (read from `path`, used for diagnostics and source typing —
/// see [`source_type_for`]) and statically evaluate its default export (ESM
/// or CommonJS — see the module docs) into the JSON value oxfmt's own config
/// loader would produce.
pub fn evaluate(source: &str, path: &Path) -> Result<serde_json::Value, String> {
    let allocator = Allocator::default();
    let ret = OxcParser::new(&allocator, source, source_type_for(path)).parse();
    if ret.panicked || !ret.diagnostics.is_empty() {
        let detail = ret
            .diagnostics
            .first()
            .map(std::string::ToString::to_string)
            .unwrap_or_else(|| "unknown parse error".to_string());
        return Err(format!("failed to parse {}: {detail}", path.display()));
    }

    let mut locals: Locals = HashMap::new();
    for stmt in &ret.program.body {
        let oxc::Statement::VariableDeclaration(decl) = stmt else {
            continue;
        };
        if decl.kind != oxc::VariableDeclarationKind::Const {
            continue;
        }
        for declarator in &decl.declarations {
            if let (oxc::BindingPattern::BindingIdentifier(id), Some(init)) =
                (&declarator.id, declarator.init.as_ref())
            {
                locals.insert(id.name.as_str(), init);
            }
        }
    }

    let default_expr = ret.program.body.iter().find_map(|stmt| match stmt {
        oxc::Statement::ExportDefaultDeclaration(export) => export.declaration.as_expression(),
        oxc::Statement::ExpressionStatement(es) => module_exports_rhs(&es.expression),
        _ => None,
    });
    let Some(default_expr) = default_expr else {
        return Err(format!(
            "{}: expected a default export (`export default {{...}}`, \
             `module.exports = {{...}}`, or one of those wrapped in `defineConfig(...)`)",
            path.display()
        ));
    };

    eval_expr(default_expr, &locals, 0).map_err(|reason| {
        format!(
            "{}: {reason}\nrsvelte-fmt evaluates JS/TS oxfmt configs statically; dynamic \
             expressions are not supported. Use .oxfmtrc.json/.oxfmtrc.jsonc instead.",
            path.display()
        )
    })
}

/// Recognize `module.exports = <rhs>;` (CommonJS's equivalent of an ESM
/// default export — see the module docs) and return `<rhs>`. An individual
/// `exports.foo = ...` property assignment does *not* match: statically
/// tracking incremental mutations to the exports object is unsupported
/// dynamic behavior, same as any other partial/indirect assignment.
fn module_exports_rhs<'s, 'a>(expr: &'s oxc::Expression<'a>) -> Option<&'s oxc::Expression<'a>> {
    let oxc::Expression::AssignmentExpression(assign) = expr else {
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
    Some(&assign.right)
}

fn eval_expr<'s, 'a>(
    expr: &'s oxc::Expression<'a>,
    locals: &Locals<'s, 'a>,
    depth: u8,
) -> Result<serde_json::Value, String> {
    use oxc::Expression as E;
    match expr {
        E::BooleanLiteral(b) => Ok(serde_json::Value::Bool(b.value)),
        E::NullLiteral(_) => Ok(serde_json::Value::Null),
        E::NumericLiteral(n) => number_value(n.value),
        E::StringLiteral(s) => Ok(serde_json::Value::String(s.value.as_str().to_string())),
        E::TemplateLiteral(t) => template_value(t),
        E::ArrayExpression(arr) => {
            let mut out = Vec::with_capacity(arr.elements.len());
            for el in &arr.elements {
                let Some(el_expr) = el.as_expression() else {
                    return Err("an array spread/elision is not statically resolvable".to_string());
                };
                out.push(eval_expr(el_expr, locals, depth)?);
            }
            Ok(serde_json::Value::Array(out))
        }
        E::ObjectExpression(obj) => {
            let mut map = serde_json::Map::with_capacity(obj.properties.len());
            for prop in &obj.properties {
                let oxc::ObjectPropertyKind::ObjectProperty(p) = prop else {
                    return Err("an object spread is not statically resolvable".to_string());
                };
                if p.computed {
                    return Err("a computed object key is not statically resolvable".to_string());
                }
                let Some(key) = p.key.static_name() else {
                    return Err("an object key is not statically resolvable".to_string());
                };
                map.insert(key.into_owned(), eval_expr(&p.value, locals, depth)?);
            }
            Ok(serde_json::Value::Object(map))
        }
        E::Identifier(id) => {
            let name = id.name.as_str();
            if depth >= MAX_LOCAL_DEPTH {
                return Err(format!("`{name}` reference chain is too deeply nested"));
            }
            let Some(init) = locals.get(name) else {
                return Err(format!(
                    "`{name}` is not a local `const` binding this evaluator can resolve"
                ));
            };
            eval_expr(init, locals, depth + 1)
        }
        E::UnaryExpression(u) => eval_unary(u, locals, depth),
        E::TSAsExpression(e) => eval_expr(&e.expression, locals, depth),
        E::TSSatisfiesExpression(e) => eval_expr(&e.expression, locals, depth),
        E::TSNonNullExpression(e) => eval_expr(&e.expression, locals, depth),
        E::TSTypeAssertion(e) => eval_expr(&e.expression, locals, depth),
        E::ParenthesizedExpression(e) => eval_expr(&e.expression, locals, depth),
        E::CallExpression(call) => eval_define_config_call(call, locals, depth),
        _ => Err("expression is not statically resolvable".to_string()),
    }
}

/// `defineConfig(...)` is oxfmt's identity function (it exists purely for
/// type inference), so unwrapping the call to its first argument and
/// evaluating that is equivalent to evaluating what it returns. Any other
/// call is a dynamic expression we can't run.
fn eval_define_config_call<'s, 'a>(
    call: &'s oxc::CallExpression<'a>,
    locals: &Locals<'s, 'a>,
    depth: u8,
) -> Result<serde_json::Value, String> {
    let oxc::Expression::Identifier(callee) = &call.callee else {
        return Err("only a `defineConfig(...)` call is statically resolvable".to_string());
    };
    if callee.name.as_str() != "defineConfig" {
        return Err(format!(
            "only a `defineConfig(...)` call is statically resolvable, found `{}(...)`",
            callee.name.as_str()
        ));
    }
    let Some(arg) = call
        .arguments
        .first()
        .and_then(oxc::Argument::as_expression)
    else {
        return Err("`defineConfig(...)` requires an object argument".to_string());
    };
    eval_expr(arg, locals, depth)
}

fn eval_unary<'s, 'a>(
    u: &'s oxc::UnaryExpression<'a>,
    locals: &Locals<'s, 'a>,
    depth: u8,
) -> Result<serde_json::Value, String> {
    match u.operator {
        oxc::UnaryOperator::UnaryNegation => match eval_expr(&u.argument, locals, depth)? {
            serde_json::Value::Number(n) => n
                .as_f64()
                .ok_or_else(|| "unary `-` produced a non-finite number".to_string())
                .and_then(|v| number_value(-v)),
            _ => Err("unary `-` applied to a non-number".to_string()),
        },
        oxc::UnaryOperator::UnaryPlus => eval_expr(&u.argument, locals, depth),
        _ => Err("only unary `-`/`+` are statically resolvable".to_string()),
    }
}

/// JS numbers are always `f64`, but a whole-number literal like `printWidth:
/// 100` must round-trip as a JSON integer — the same shape a literal `100` in
/// `.oxfmtrc.json` would have — since `parse_object` reads such fields via
/// `serde_json::Value::as_u64`, which (unlike `as_f64`) only succeeds for a
/// `Number` built from an integer, not from [`serde_json::Number::from_f64`]
/// (that always yields the float variant, even for an integral value).
fn number_value(value: f64) -> Result<serde_json::Value, String> {
    if value.is_finite() && value.fract() == 0.0 && value.abs() < 1e15 {
        let n = if value >= 0.0 {
            serde_json::Number::from(value as u64)
        } else {
            serde_json::Number::from(value as i64)
        };
        return Ok(serde_json::Value::Number(n));
    }
    serde_json::Number::from_f64(value)
        .map(serde_json::Value::Number)
        .ok_or_else(|| "number is not finite".to_string())
}

/// A template literal with no `${...}` substitutions is just a string;
/// anything with substitutions is dynamic.
fn template_value(t: &oxc::TemplateLiteral) -> Result<serde_json::Value, String> {
    if !t.expressions.is_empty() {
        return Err(
            "a template literal with `${...}` substitutions is not statically resolvable"
                .to_string(),
        );
    }
    let mut s = String::new();
    for quasi in &t.quasis {
        let Some(cooked) = &quasi.value.cooked else {
            return Err("template literal has an invalid escape sequence".to_string());
        };
        s.push_str(cooked.as_str());
    }
    Ok(serde_json::Value::String(s))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn eval(src: &str) -> Result<serde_json::Value, String> {
        evaluate(src, &PathBuf::from("oxfmt.config.ts"))
    }

    #[test]
    fn plain_default_object() {
        let v = eval("export default { singleQuote: true, printWidth: 100 };").unwrap();
        assert_eq!(v["singleQuote"], serde_json::json!(true));
        assert_eq!(v["printWidth"], serde_json::json!(100));
    }

    #[test]
    fn define_config_wrapper() {
        let v = eval(
            "import { defineConfig } from \"oxfmt\";\nexport default defineConfig({ semi: false });",
        )
        .unwrap();
        assert_eq!(v["semi"], serde_json::json!(false));
    }

    #[test]
    fn mts_extension_parses_as_module() {
        let v = evaluate(
            "export default { semi: true };",
            &PathBuf::from("oxfmt.config.mts"),
        )
        .unwrap();
        assert_eq!(v["semi"], serde_json::json!(true));
    }

    #[test]
    fn nested_object_and_array() {
        let v = eval(
            r#"export default {
                overrides: [
                    { files: ["a/*.ts", "b.ts"], options: { printWidth: 1000 } }
                ]
            };"#,
        )
        .unwrap();
        assert_eq!(
            v["overrides"][0]["files"],
            serde_json::json!(["a/*.ts", "b.ts"])
        );
        assert_eq!(
            v["overrides"][0]["options"]["printWidth"],
            serde_json::json!(1000)
        );
    }

    #[test]
    fn negative_number() {
        let v = eval("export default { tabWidth: -2 };").unwrap();
        assert_eq!(v["tabWidth"], serde_json::json!(-2));
    }

    #[test]
    fn template_literal_without_substitution() {
        let v = eval("export default { endOfLine: `lf` };").unwrap();
        assert_eq!(v["endOfLine"], serde_json::json!("lf"));
    }

    #[test]
    fn type_annotations_and_satisfies_are_stripped() {
        let v = eval(
            "import type { OxfmtConfig } from \"oxfmt\";\n\
             const config = { semi: true } satisfies OxfmtConfig;\n\
             export default config;",
        )
        .unwrap();
        assert_eq!(v["semi"], serde_json::json!(true));
    }

    #[test]
    fn as_const_is_stripped() {
        let v = eval("export default { sortOrder: \"asc\" as const };").unwrap();
        assert_eq!(v["sortOrder"], serde_json::json!("asc"));
    }

    #[test]
    fn local_const_indirection() {
        let v = eval("const config = { printWidth: 120 };\nexport default config;").unwrap();
        assert_eq!(v["printWidth"], serde_json::json!(120));
    }

    #[test]
    fn local_const_indirection_through_define_config() {
        let v = eval(
            "import { defineConfig } from \"oxfmt\";\n\
             const base = { printWidth: 120 };\n\
             export default defineConfig(base);",
        )
        .unwrap();
        assert_eq!(v["printWidth"], serde_json::json!(120));
    }

    #[test]
    fn dynamic_function_call_is_an_error() {
        let err = eval("export default { printWidth: computeWidth() };").unwrap_err();
        assert!(err.contains("statically"), "unexpected error: {err}");
    }

    #[test]
    fn env_var_reference_is_an_error() {
        let err = eval("export default { semi: process.env.SEMI === \"true\" };").unwrap_err();
        assert!(err.contains("statically"), "unexpected error: {err}");
    }

    #[test]
    fn unresolvable_import_reference_is_an_error() {
        let err =
            eval("import shared from \"./shared.js\";\nexport default { ...shared, semi: true };")
                .unwrap_err();
        assert!(err.contains("statically"), "unexpected error: {err}");
    }

    #[test]
    fn parse_error_is_reported() {
        let err = eval("export default {").unwrap_err();
        assert!(err.contains("failed to parse"), "unexpected error: {err}");
    }

    #[test]
    fn missing_default_export_is_an_error() {
        let err = eval("export const config = { semi: true };").unwrap_err();
        assert!(err.contains("default export"), "unexpected error: {err}");
    }

    fn eval_at(src: &str, filename: &str) -> Result<serde_json::Value, String> {
        evaluate(src, &PathBuf::from(filename))
    }

    #[test]
    fn is_js_config_path_matches_oxfmt() {
        for name in ["c.js", "c.mjs", "c.cjs", "c.ts", "c.cts", "c.mts"] {
            assert!(is_js_config_path(&PathBuf::from(name)), "{name}");
        }
        assert!(!is_js_config_path(&PathBuf::from("c.json")));
        assert!(!is_js_config_path(&PathBuf::from(".oxfmtrc.jsonc")));
    }

    #[test]
    fn cjs_module_exports_object() {
        let v = eval_at(
            "module.exports = { singleQuote: true, printWidth: 100 };",
            "oxfmt.config.cjs",
        )
        .unwrap();
        assert_eq!(v["singleQuote"], serde_json::json!(true));
        assert_eq!(v["printWidth"], serde_json::json!(100));
    }

    #[test]
    fn cjs_module_exports_via_define_config() {
        let v = eval_at(
            "const { defineConfig } = require(\"oxfmt\");\n\
             module.exports = defineConfig({ semi: false });",
            "oxfmt.config.cjs",
        )
        .unwrap();
        assert_eq!(v["semi"], serde_json::json!(false));
    }

    #[test]
    fn cjs_module_exports_local_const_indirection() {
        let v = eval_at(
            "const config = { printWidth: 120 };\nmodule.exports = config;",
            "oxfmt.config.cjs",
        )
        .unwrap();
        assert_eq!(v["printWidth"], serde_json::json!(120));
    }

    #[test]
    fn js_extension_accepts_esm_default_export() {
        // `.js` has no fixed dialect — content decides (mirrors Node/oxfmt).
        let v = eval_at("export default { semi: true };", "oxfmt.config.js").unwrap();
        assert_eq!(v["semi"], serde_json::json!(true));
    }

    #[test]
    fn js_extension_accepts_commonjs_module_exports() {
        let v = eval_at("module.exports = { semi: true };", "oxfmt.config.js").unwrap();
        assert_eq!(v["semi"], serde_json::json!(true));
    }

    #[test]
    fn mjs_extension_accepts_commonjs_module_exports() {
        // `.mjs` conventionally means ESM, but Node/oxfmt still decide by
        // content when the file is `import()`-ed, so `module.exports =` (a
        // plain assignment, syntactically legal regardless of module kind)
        // must still evaluate.
        let v = eval_at("module.exports = { semi: true };", "oxfmt.config.mjs").unwrap();
        assert_eq!(v["semi"], serde_json::json!(true));
    }

    #[test]
    fn cts_extension_parses_typescript_syntax() {
        let v = eval_at(
            "const config = { semi: true } satisfies object;\nmodule.exports = config;",
            "oxfmt.config.cts",
        )
        .unwrap();
        assert_eq!(v["semi"], serde_json::json!(true));
    }

    #[test]
    fn individual_exports_property_assignment_is_an_error() {
        let err = eval_at(
            "exports.singleQuote = true;\nexports.semi = false;",
            "oxfmt.config.cjs",
        )
        .unwrap_err();
        assert!(err.contains("default export"), "unexpected error: {err}");
    }
}
