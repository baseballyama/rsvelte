//! Static evaluation of `oxfmt.config.ts` / `oxfmt.config.mts` into a
//! [`serde_json::Value`].
//!
//! `rsvelte-fmt` ships as a native binary with no embedded JS runtime, unlike
//! oxfmt's own NAPI build, which `import()`s a TS/JS config through Node. We
//! instead parse the file with `oxc_parser` and statically evaluate the
//! object literal behind `export default {...}`,
//! `export default defineConfig({...})`, or a local `const` re-export
//! (`const config = {...}; export default config;`). `defineConfig` is
//! oxfmt's identity function (see its `src-js/index.ts`), so unwrapping the
//! call and evaluating its argument is equivalent to evaluating what it
//! returns.
//!
//! `.oxfmtrc.json`'s policy is to silently ignore whatever it can't parse — a
//! best-effort mapping is strictly better than falling back to defaults for
//! an implicitly-discovered file. A `.ts` config is a deliberate, explicit
//! choice, so here the opposite policy applies: anything not statically
//! resolvable (a call other than `defineConfig`, a reference to something
//! other than a local `const`, a spread, a computed key, …) is a hard error
//! rather than a silent partial read.

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

/// `true` for the config file extensions oxfmt evaluates via its JS/TS
/// config loader (`oxfmt.config.ts` / `oxfmt.config.mts`, and any other
/// `.ts`/`.mts` path passed explicitly via `--config`).
pub fn is_ts_config_path(path: &Path) -> bool {
    matches!(
        path.extension().and_then(|e| e.to_str()),
        Some("ts" | "mts")
    )
}

/// Parse `source` (read from `path`, used for diagnostics and TS/ESM source
/// typing) and statically evaluate its default export into the JSON value
/// oxfmt's own config loader would produce.
pub fn evaluate(source: &str, path: &Path) -> Result<serde_json::Value, String> {
    let allocator = Allocator::default();
    let source_type = SourceType::from_path(path).unwrap_or_else(|_| SourceType::ts());
    let ret = OxcParser::new(&allocator, source, source_type).parse();
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
        _ => None,
    });
    let Some(default_expr) = default_expr else {
        return Err(format!(
            "{}: expected a default export (`export default {{...}}` or \
             `export default defineConfig({{...}})`)",
            path.display()
        ));
    };

    eval_expr(default_expr, &locals, 0).map_err(|reason| {
        format!(
            "{}: {reason}\nrsvelte-fmt evaluates oxfmt.config.ts statically; dynamic expressions \
             are not supported. Use .oxfmtrc.json/.oxfmtrc.jsonc instead.",
            path.display()
        )
    })
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
}
