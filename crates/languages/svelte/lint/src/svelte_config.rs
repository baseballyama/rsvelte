//! What `svelte-eslint-parser` reads from a `svelte.config.js` without running it (`parseConfig`):
//! the default export, evaluated through object literals, literals and `const` variables only.
//!
//! Of the result, rules read `kit.files`, which is kept only when every property of it is static.

use rsvelte_kernel::source::positions::Span;
use rsvelte_typescript::parser::parse_program;
use rsvelte_typescript::scope::{DeclarationKind, Semantic, analyze};
use rsvelte_typescript::{Kind, NodeIdentifier, SyntaxTree};

use crate::{Kit, KitFiles, SvelteConfig};

#[cfg(test)]
mod tests;

/// The parts of the configuration in `source` that rules read.
///
/// # Errors
///
/// The source does not parse, which makes `svelte-eslint-parser` fail on every document.
pub fn parse(source: &str) -> Result<SvelteConfig, String> {
    let mut tree = SyntaxTree::new();
    let end = u32::try_from(source.len()).map_err(|e| format!("the file is too large: {e}"))?;
    let program = parse_program(&mut tree, source, Span::new(0, end), false)
        .map_err(|error| format!("does not parse: {}", error.message))?;
    let sem = analyze(&tree, program, &[]);
    let evaluator = Evaluator {
        tree: &tree,
        sem: &sem,
        source,
    };
    Ok(evaluator.config(program))
}

/// A value `parseConfig` knows: a static value, or an object literal whose properties it
/// evaluates when asked.
#[derive(Clone, Debug)]
enum Evaluated {
    Static(Static),
    Object(NodeIdentifier),
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
enum Step {
    Member(String),
    /// A default value, taken when the value so far is `undefined`.
    Default(NodeIdentifier),
}

/// How deep evaluation may nest; a deeper configuration names itself (`const a = b, b = a`).
const MAX_DEPTH: usize = 64;

struct Evaluator<'a> {
    tree: &'a SyntaxTree,
    sem: &'a Semantic,
    source: &'a str,
}

impl Evaluator<'_> {
    fn config(&self, program: NodeIdentifier) -> SvelteConfig {
        let Kind::Program(statements) = self.tree.kind(program) else {
            return SvelteConfig::default();
        };
        let Some(declaration) = statements.iter().find_map(|&s| match self.tree.kind(s) {
            Kind::ExportDefault(declaration) => Some(declaration),
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

    fn expression(&self, node: NodeIdentifier, depth: usize) -> Option<Evaluated> {
        if depth > MAX_DEPTH {
            return None;
        }
        Some(match self.tree.kind(node) {
            Kind::String => Evaluated::Static(Static::String(
                self.tree.str_value(node, self.source).to_owned(),
            )),
            Kind::Number(value) => Evaluated::Static(Static::Number(value)),
            Kind::Boolean(value) => Evaluated::Static(Static::Boolean(value)),
            Kind::Null => Evaluated::Static(Static::Null),
            Kind::Regex { .. } | Kind::BigInt => Evaluated::Static(Static::Other),
            Kind::Object(_) => Evaluated::Object(node),
            Kind::Identifier(_) => return self.identifier(node, depth + 1),
            _ => return None,
        })
    }

    /// A `const` variable's value, through the pattern that declares it (`parseIdentifier`).
    fn identifier(&self, node: NodeIdentifier, depth: usize) -> Option<Evaluated> {
        let Some(binding) = self.sem.binding_of(node) else {
            return (self.tree.name(node) == "undefined")
                .then_some(Evaluated::Static(Static::Undefined));
        };
        let binding = &self.sem.bindings[binding];
        if binding.kind != DeclarationKind::Const {
            return None;
        }
        let Kind::Declarator {
            identifier: pattern,
            initializer: Some(initializer),
        } = self.tree.kind(binding.declaration?)
        else {
            return None;
        };
        let mut value = self.expression(initializer, depth)?;
        let mut steps = Vec::new();
        self.steps(binding.node, pattern, &mut steps)?;
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
        &self,
        target: NodeIdentifier,
        pattern: NodeIdentifier,
        out: &mut Vec<Step>,
    ) -> Option<()> {
        if pattern == target {
            return Some(());
        }
        match self.tree.kind(pattern) {
            Kind::AssignPattern(left, right) => {
                out.push(Step::Default(right));
                self.steps(target, left, out)
            }
            Kind::ObjectPattern(properties) => {
                let (name, value) = properties.iter().find_map(|&property| {
                    let Kind::Property {
                        key,
                        value,
                        computed,
                        ..
                    } = self.tree.kind(property)
                    else {
                        return None;
                    };
                    let name = match self.tree.kind(key) {
                        Kind::Identifier(_) if !computed => self.tree.name(key).to_owned(),
                        Kind::String => self.tree.str_value(key, self.source).to_owned(),
                        Kind::Number(number) => number_key(number),
                        _ => return None,
                    };
                    Some((name, value))
                })?;
                out.push(Step::Member(name));
                self.steps(target, value, out)
            }
            Kind::ArrayPattern(elements) => {
                let (index, &element) = elements
                    .iter()
                    .enumerate()
                    .find(|(_, e)| !matches!(self.tree.kind(**e), Kind::Hole))?;
                out.push(Step::Member(index.to_string()));
                self.steps(target, element, out)
            }
            _ => None,
        }
    }

    /// The value of property `key` of an object literal (`getProperty`): the last one wins, and a
    /// key or spread it cannot evaluate makes a missing key unknown rather than `undefined`.
    fn property(&self, object: NodeIdentifier, key: &str, depth: usize) -> Option<Evaluated> {
        let Kind::Object(properties) = self.tree.kind(object) else {
            return None;
        };
        let mut unknown = false;
        for &property in properties.iter().rev() {
            match self.tree.kind(property) {
                Kind::Property { value, .. } => match self.key(property, depth) {
                    Some(name) if name == key => return self.expression(value, depth + 1),
                    Some(_) => {}
                    None => unknown = true,
                },
                Kind::Spread(argument) => {
                    if let Some(Evaluated::Object(spread)) = self.expression(argument, depth + 1)
                        && let Some(value) = self.property(spread, key, depth + 1)
                    {
                        return Some(value);
                    }
                    unknown = true;
                }
                _ => unknown = true,
            }
        }
        (!unknown).then_some(Evaluated::Static(Static::Undefined))
    }

    /// A property's name (`getKey`).
    fn key(&self, property: NodeIdentifier, depth: usize) -> Option<String> {
        let Kind::Property { key, computed, .. } = self.tree.kind(property) else {
            return None;
        };
        if !computed && matches!(self.tree.kind(key), Kind::Identifier(_)) {
            return Some(self.tree.name(key).to_owned());
        }
        match self.to_static(&self.expression(key, depth + 1)?, depth + 1)? {
            Static::String(name) => Some(name),
            Static::Number(number) => Some(number_key(number)),
            Static::Boolean(value) => Some(value.to_string()),
            Static::Null => Some("null".to_owned()),
            Static::Undefined => Some("undefined".to_owned()),
            Static::Other | Static::Object(_) => None,
        }
    }

    /// The value without code in it (`getStatic`), or `None` when any part of it has code.
    fn to_static(&self, value: &Evaluated, depth: usize) -> Option<Static> {
        if depth > MAX_DEPTH {
            return None;
        }
        let object = match value {
            Evaluated::Static(value) => return Some(value.clone()),
            Evaluated::Object(object) => *object,
        };
        let Kind::Object(properties) = self.tree.kind(object) else {
            return None;
        };
        let mut out: Vec<(String, Static)> = Vec::new();
        for &property in properties {
            match self.tree.kind(property) {
                Kind::Property { value, .. } => {
                    let name = self.key(property, depth)?;
                    let value = self.to_static(&self.expression(value, depth + 1)?, depth + 1)?;
                    out.push((name, value));
                }
                Kind::Spread(argument) => {
                    let spread = self.expression(argument, depth + 1)?;
                    if let Static::Object(properties) = self.to_static(&spread, depth + 1)? {
                        out.extend(properties);
                    }
                }
                _ => return None,
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
