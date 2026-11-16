//! Static reads of the object a JS/TS config module exports.

use oxc_ast::ast as oxc;

/// Resolve the object literal an exported config expression denotes,
/// looking through `defineConfig(...)`, TypeScript assertion / parenthesis
/// wrappers, and top-level `const`/`let`/`var` indirection — the
/// `const config = {...}; export default config;` form real configs are
/// commonly written in (issue #2710).
pub fn resolve_config_object<'a>(
    program: &'a oxc::Program<'a>,
    expr: &'a oxc::Expression<'a>,
) -> Option<&'a oxc::ObjectExpression<'a>> {
    resolve_config_object_inner(program, expr, &mut Vec::new())
}

fn resolve_config_object_inner<'a>(
    program: &'a oxc::Program<'a>,
    expr: &'a oxc::Expression<'a>,
    seen: &mut Vec<&'a str>,
) -> Option<&'a oxc::ObjectExpression<'a>> {
    match expr.get_inner_expression() {
        oxc::Expression::ObjectExpression(obj) => Some(obj),
        oxc::Expression::CallExpression(call) => {
            let oxc::Expression::Identifier(callee) = &call.callee else {
                return None;
            };
            if callee.name.as_str() != "defineConfig" {
                return None;
            }
            let arg = call.arguments.first()?.as_expression()?;
            resolve_config_object_inner(program, arg, seen)
        }
        oxc::Expression::Identifier(id) => {
            let name = id.name.as_str();
            // `const a = b; const b = a;` would otherwise recurse forever.
            if seen.contains(&name) {
                return None;
            }
            seen.push(name);
            let init = top_level_binding_init(program, name)?;
            resolve_config_object_inner(program, init, seen)
        }
        _ => None,
    }
}

/// The initializer of a top-level `const`/`let`/`var <name> = …` binding,
/// including one that is itself exported (`export const config = {…}`).
fn top_level_binding_init<'a>(
    program: &'a oxc::Program<'a>,
    name: &str,
) -> Option<&'a oxc::Expression<'a>> {
    for stmt in &program.body {
        let decl = match stmt {
            oxc::Statement::VariableDeclaration(decl) => decl,
            oxc::Statement::ExportDeclaration(export) => match &export.declaration {
                oxc::Declaration::VariableDeclaration(decl) => decl,
                _ => continue,
            },
            _ => continue,
        };
        for declarator in &decl.declarations {
            let oxc::BindingPattern::BindingIdentifier(id) = &declarator.id else {
                continue;
            };
            if id.name.as_str() == name {
                return declarator.init.as_ref();
            }
        }
    }
    None
}

/// The value of `obj`'s last statically-named `name` property.
#[must_use]
pub fn lookup_property<'a>(
    obj: &'a oxc::ObjectExpression,
    name: &str,
) -> Option<&'a oxc::Expression<'a>> {
    for prop in obj.properties.iter().rev() {
        let oxc::ObjectPropertyKind::ObjectProperty(p) = prop else {
            continue;
        };
        let prop_name = match &p.key {
            oxc::PropertyKey::StaticIdentifier(id) => id.name.as_str(),
            oxc::PropertyKey::StringLiteral(s) => match s.value.as_str() {
                Some(v) => v,
                None => continue,
            },
            _ => continue,
        };
        if prop_name == name {
            return Some(&p.value);
        }
    }
    None
}
