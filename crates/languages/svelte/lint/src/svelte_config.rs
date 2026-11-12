//! What `svelte-eslint-parser` reads from a `svelte.config.js` without running it (`parseConfig`):
//! the default export, evaluated through object literals, literals and `const` variables only.
//!
//! Of the result, rules read `kit.files`, which is kept only when every property of it is static.

use oxc_ast::AstKind;
use oxc_ast::ast::{
    BindingPattern, Expression, ObjectExpression, ObjectPropertyKind, PropertyKey, Statement,
};
use oxc_semantic::{SymbolFlags, SymbolId};
use oxc_span::SourceType;
use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript_semantic::semantic::Semantic;
use rsvelte_typescript_tree::Tree;

use crate::{Kit, KitFiles, SvelteConfig};

#[cfg(test)]
mod tests;

/// The parts of the configuration in `source` that rules read.
///
/// # Errors
///
/// The source does not parse, which makes `svelte-eslint-parser` fail on every document.
pub fn parse(source: &str) -> Result<SvelteConfig, String> {
    let end = u32::try_from(source.len()).map_err(|e| format!("the file is too large: {e}"))?;
    let (tree, program) = Tree::build(source, |builder| {
        (builder.program(Span::new(0, end), SourceType::mjs())).map_err(Into::into)
    })
    .map_err(|error| format!("does not parse: {}", error.message))?;
    let semantic = Semantic::program(tree, program);
    let evaluator = Evaluator {
        semantic: &semantic,
    };
    Ok(evaluator.config(semantic.tree().get_program(program)))
}

/// A value `parseConfig` knows: a static value, or an object literal whose properties it
/// evaluates when asked.
#[derive(Clone, Debug)]
enum Evaluated<'a> {
    Static(Static),
    Object(&'a ObjectExpression<'a>),
}

/// A value without code in it. Regular expressions and big integers are static but never what a
/// rule reads, so they are `Other`.
#[derive(Clone, Debug, PartialEq)]
enum Static {
    Undefined,
    Null,
    Boolean(bool),
    Number(f64),
    String(String),
    Other,
    Object(Vec<(String, Self)>),
}

/// One step from a declared name to the variable's identifier (`parsePatternAssign`).
enum Step<'a> {
    Member(String),
    /// A default value, taken when the value so far is `undefined`.
    Default(&'a Expression<'a>),
}

/// How deep evaluation may nest; a deeper configuration names itself (`const a = b, b = a`).
const MAX_DEPTH: usize = 64;

struct Evaluator<'a> {
    semantic: &'a Semantic,
}

impl<'a> Evaluator<'a> {
    fn config(&self, program: &'a oxc_ast::ast::Program<'a>) -> SvelteConfig {
        let Some(declaration) = program.body.iter().find_map(|s| match s {
            Statement::ExportDefaultDeclaration(export) => export.declaration.as_expression(),
            _ => None,
        }) else {
            return SvelteConfig::default();
        };
        let Some(Evaluated::Object(config)) = self.expression(declaration, 0) else {
            return SvelteConfig::default();
        };
        let Some(Evaluated::Object(kit)) = self.property(config, "kit", 0) else {
            return SvelteConfig::default();
        };
        let files = self
            .property(kit, "files", 0)
            .and_then(|files| self.to_static(&files, 0));
        let routes = match files {
            Some(Static::Object(properties)) => properties
                .into_iter()
                .rev()
                .find(|(key, _)| key == "routes")
                .and_then(|(_, value)| match value {
                    Static::String(routes) => Some(routes),
                    _ => None,
                }),
            _ => None,
        };
        SvelteConfig {
            kit: Some(Kit {
                files: KitFiles { routes },
            }),
            ..SvelteConfig::default()
        }
    }

    fn expression(&self, node: &'a Expression<'a>, depth: usize) -> Option<Evaluated<'a>> {
        if depth > MAX_DEPTH {
            return None;
        }
        Some(match node {
            Expression::StringLiteral(string) => {
                Evaluated::Static(Static::String(string.value.display().to_string()))
            }
            Expression::NumericLiteral(number) => Evaluated::Static(Static::Number(number.value)),
            Expression::BooleanLiteral(boolean) => {
                Evaluated::Static(Static::Boolean(boolean.value))
            }
            Expression::NullLiteral(_) => Evaluated::Static(Static::Null),
            Expression::RegExpLiteral(_) | Expression::BigIntLiteral(_) => {
                Evaluated::Static(Static::Other)
            }
            Expression::ObjectExpression(object) => Evaluated::Object(object),
            Expression::Identifier(identifier) => {
                let scoping = self.semantic.scoping();
                let symbol = identifier
                    .reference_id
                    .get()
                    .and_then(|reference| scoping.get_reference(reference).symbol_id());
                return symbol.map_or_else(
                    || {
                        (identifier.name == "undefined")
                            .then_some(Evaluated::Static(Static::Undefined))
                    },
                    |symbol| self.identifier(symbol, depth + 1),
                );
            }
            _ => return None,
        })
    }

    /// A `const` variable's value, through the pattern that declares it (`parseIdentifier`).
    fn identifier(&self, symbol: SymbolId, depth: usize) -> Option<Evaluated<'a>> {
        let scoping = self.semantic.scoping();
        if !scoping
            .symbol_flags(symbol)
            .contains(SymbolFlags::ConstVariable)
        {
            return None;
        }
        let AstKind::VariableDeclarator(declarator) = self
            .semantic
            .nodes()
            .kind(scoping.symbol_declaration(symbol))
        else {
            return None;
        };
        let initializer = declarator.init.as_ref()?;
        let mut value = self.expression(initializer, depth)?;
        let mut steps = Vec::new();
        Self::steps(symbol, &declarator.id, &mut steps)?;
        for step in steps {
            match step {
                Step::Member(name) => {
                    let Evaluated::Object(object) = value else {
                        return None;
                    };
                    value = self.property(object, &name, depth)?;
                }
                Step::Default(default) => {
                    if matches!(value, Evaluated::Static(Static::Undefined)) {
                        value = self.expression(default, depth)?;
                    }
                }
            }
        }
        Some(value)
    }

    /// The steps from `pattern` to `target`. As upstream, an object or array pattern looks only
    /// at its first named property or element.
    fn steps(
        target: SymbolId,
        pattern: &'a BindingPattern<'a>,
        out: &mut Vec<Step<'a>>,
    ) -> Option<()> {
        match pattern {
            BindingPattern::BindingIdentifier(identifier) => {
                (identifier.symbol_id.get() == Some(target)).then_some(())
            }
            BindingPattern::AssignmentPattern(assignment) => {
                out.push(Step::Default(&assignment.right));
                Self::steps(target, &assignment.left, out)
            }
            BindingPattern::ObjectPattern(object) => {
                let (name, value) = object.properties.iter().find_map(|property| {
                    let name = match &property.key {
                        PropertyKey::StaticIdentifier(key) if !property.computed => {
                            key.name.as_str().to_owned()
                        }
                        PropertyKey::StringLiteral(key) => key.value.display().to_string(),
                        PropertyKey::NumericLiteral(key) => number_key(key.value),
                        _ => return None,
                    };
                    Some((name, &property.value))
                })?;
                out.push(Step::Member(name));
                Self::steps(target, value, out)
            }
            BindingPattern::ArrayPattern(array) => {
                let (index, element) = array
                    .elements
                    .iter()
                    .enumerate()
                    .find_map(|(i, e)| e.as_ref().map(|e| (i, e)))?;
                out.push(Step::Member(index.to_string()));
                Self::steps(target, element, out)
            }
        }
    }

    /// The value of property `key` of an object literal (`getProperty`): the last one wins, and a
    /// key or spread it cannot evaluate makes a missing key unknown rather than `undefined`.
    fn property(
        &self,
        object: &'a ObjectExpression<'a>,
        key: &str,
        depth: usize,
    ) -> Option<Evaluated<'a>> {
        let mut unknown = false;
        for property in object.properties.iter().rev() {
            match property {
                ObjectPropertyKind::ObjectProperty(property) => {
                    match self.key(&property.key, property.computed, depth) {
                        Some(name) if name == key => {
                            return self.expression(&property.value, depth + 1);
                        }
                        Some(_) => {}
                        None => unknown = true,
                    }
                }
                ObjectPropertyKind::SpreadProperty(spread) => {
                    if let Some(Evaluated::Object(spread)) =
                        self.expression(&spread.argument, depth + 1)
                        && let Some(value) = self.property(spread, key, depth + 1)
                    {
                        return Some(value);
                    }
                    unknown = true;
                }
            }
        }
        (!unknown).then_some(Evaluated::Static(Static::Undefined))
    }

    /// A property's name (`getKey`).
    fn key(&self, key: &'a PropertyKey<'a>, computed: bool, depth: usize) -> Option<String> {
        if let PropertyKey::StaticIdentifier(name) = key
            && !computed
        {
            return Some(name.name.as_str().to_owned());
        }
        match self.to_static(
            &self.expression(key.as_expression()?, depth + 1)?,
            depth + 1,
        )? {
            Static::String(name) => Some(name),
            Static::Number(number) => Some(number_key(number)),
            Static::Boolean(value) => Some(value.to_string()),
            Static::Null => Some("null".to_owned()),
            Static::Undefined => Some("undefined".to_owned()),
            Static::Other | Static::Object(_) => None,
        }
    }

    /// The value without code in it (`getStatic`), or `None` when any part of it has code.
    fn to_static(&self, value: &Evaluated<'a>, depth: usize) -> Option<Static> {
        if depth > MAX_DEPTH {
            return None;
        }
        let object = match value {
            Evaluated::Static(value) => return Some(value.clone()),
            Evaluated::Object(object) => *object,
        };
        let mut out: Vec<(String, Static)> = Vec::new();
        for property in &object.properties {
            match property {
                ObjectPropertyKind::ObjectProperty(property) => {
                    let name = self.key(&property.key, property.computed, depth)?;
                    let value =
                        self.to_static(&self.expression(&property.value, depth + 1)?, depth + 1)?;
                    out.push((name, value));
                }
                ObjectPropertyKind::SpreadProperty(spread) => {
                    let spread = self.expression(&spread.argument, depth + 1)?;
                    if let Static::Object(properties) = self.to_static(&spread, depth + 1)? {
                        out.extend(properties);
                    }
                }
            }
        }
        Some(Static::Object(out))
    }
}

/// A number as JavaScript names a property with it, for the integers configurations use.
fn number_key(number: f64) -> String {
    if number.fract() == 0.0 && number.abs() < 1e15 {
        format!("{number:.0}")
    } else {
        number.to_string()
    }
}
