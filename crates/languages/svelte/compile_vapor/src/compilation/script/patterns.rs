//! `let { a, b: [c] } = $state(v)`: a cell per name, each reading its part of one base cell.

use oxc_allocator::{CloneIn, GetAllocator};
use oxc_ast::ast::{BinaryOperator, BindingPattern, Expression, PropertyKey, VariableDeclarator};
use oxc_ast_visit::VisitMut;
use oxc_span::GetSpan;
use rsvelte_typescript_compile::build::Builder;

use super::emit::tracked;

#[derive(Clone, Copy)]
enum Mode {
    State,
    RawState,
    Derived { tracking: bool },
}

/// The declarators of `pattern = source`, `source` being the rune's cell.
pub(crate) fn declarators<'t>(
    b: &Builder<'t>,
    rw: &mut impl VisitMut<'t>,
    pattern: BindingPattern<'t>,
    source: Expression<'t>,
    rune: &str,
    tracking: bool,
) -> Vec<VariableDeclarator<'t>> {
    let base = format!("$$pattern_base_{}", pattern.span().start);
    let mut out = vec![b.declarator(b.binding(&base), Some(source))];
    let mode = match rune {
        "$state" => Mode::State,
        "$state.raw" => Mode::RawState,
        "$derived" | "$derived.by" => Mode::Derived { tracking },
        _ => unreachable!("a checked rune value"),
    };
    let value = b.member(b.id(&base), "value");
    Lower {
        b,
        rw,
        mode,
        out: &mut out,
    }
    .pattern(pattern, value);
    out
}

struct Lower<'l, 't, V> {
    b: &'l Builder<'t>,
    rw: &'l mut V,
    mode: Mode,
    out: &'l mut Vec<VariableDeclarator<'t>>,
}

impl<'t, V: VisitMut<'t>> Lower<'_, 't, V> {
    fn pattern(&mut self, pattern: BindingPattern<'t>, value: Expression<'t>) {
        let b = self.b;
        let at = pattern.span().start;
        match pattern {
            BindingPattern::AssignmentPattern(a) => {
                let a = a.unbox();
                let mut fallback = a.right;
                self.rw.visit_expression(&mut fallback);
                let input = || b.id("$$pattern_default");
                let test = b.binary(input(), BinaryOperator::StrictEquality, b.id("undefined"));
                let result = Expression::new_conditional_expression(
                    oxc_span::SPAN,
                    test,
                    fallback,
                    input(),
                    b,
                );
                let select = b.arrow(b.parameters(["$$pattern_default"]), result);
                let cell = self.intermediate(at, b.call(select, [value]));
                self.pattern(a.left, cell);
            }
            BindingPattern::BindingIdentifier(id) => {
                let cell = self.cell(value);
                let name = b.binding_at(id.name.as_str(), id.span);
                self.out.push(b.declarator(name, Some(cell)));
            }
            BindingPattern::ObjectPattern(object) => {
                let object = object.unbox();
                let parent = self.intermediate(at, value);
                let mut excluded = Vec::new();
                for property in object.properties {
                    let (key, exclusion) = self.key(property.key, property.computed);
                    excluded.push(exclusion);
                    let read = b.computed(parent_read(b, &parent), key);
                    self.pattern(property.value, read);
                }
                if let Some(rest) = object.rest {
                    let value = b.call(
                        b.id("$$destructure_rest"),
                        [parent_read(b, &parent), b.array(excluded)],
                    );
                    self.pattern(rest.unbox().argument, value);
                }
            }
            BindingPattern::ArrayPattern(array) => {
                let array = array.unbox();
                let mut arguments = vec![value];
                if array.rest.is_none() {
                    arguments.push(b.number(count(array.elements.len())));
                }
                let value = b.call(b.id("$$destructure_array"), arguments);
                let parent = self.intermediate(at, value);
                let len = array.elements.len();
                for (index, element) in array.elements.into_iter().enumerate() {
                    let Some(element) = element else { continue };
                    let read = b.computed(parent_read(b, &parent), b.number(count(index)));
                    self.pattern(element, read);
                }
                if let Some(rest) = array.rest {
                    let slice = b.member(parent_read(b, &parent), "slice");
                    let value = b.call(slice, [b.number(count(len))]);
                    self.pattern(rest.unbox().argument, value);
                }
            }
        }
    }

    /// A property's key and the key `$$destructure_rest` leaves out.
    fn key(&mut self, key: PropertyKey<'t>, computed: bool) -> (Expression<'t>, Expression<'t>) {
        let b = self.b;
        if !computed && let PropertyKey::StaticIdentifier(id) = &key {
            return (b.string(&id.name), b.string(&id.name));
        }
        let at = key.span().start;
        let mut value = key.into_expression();
        self.rw.visit_expression(&mut value);
        if !computed {
            let copy = value.clone_in_with_semantic_ids(b.allocator());
            return (value, copy);
        }
        let name = format!("$$pattern_key_{at}");
        let cell = self.cell(value);
        self.out.push(b.declarator(b.binding(&name), Some(cell)));
        let read = || b.member(b.id(&name), "value");
        (read(), b.call(b.id("String"), [read()]))
    }

    /// A cell for a part of the pattern, named after where the part starts.
    fn intermediate(&mut self, at: u32, value: Expression<'t>) -> Expression<'t> {
        let name = format!("$$pattern_{at}");
        let cell = self.cell(value);
        let b = self.b;
        self.out.push(b.declarator(b.binding(&name), Some(cell)));
        b.member(b.id(&name), "value")
    }

    fn cell(&self, value: Expression<'t>) -> Expression<'t> {
        let b = self.b;
        match self.mode {
            Mode::Derived { tracking } => {
                let value = tracked(b, value, tracking);
                b.call(b.id("$$computed"), [b.arrow(b.parameters([]), value)])
            }
            Mode::State => b.call(b.id("$$ref"), [value]),
            Mode::RawState => b.call(b.id("$$shallowRef"), [value]),
        }
    }
}

/// Another read of an intermediate's `.value`.
fn parent_read<'t>(b: &Builder<'t>, parent: &Expression<'t>) -> Expression<'t> {
    let Expression::StaticMemberExpression(m) = parent else {
        unreachable!("an intermediate's read")
    };
    let Expression::Identifier(id) = &m.object else {
        unreachable!("an intermediate's name")
    };
    b.member(b.id(&id.name), "value")
}

fn count(n: usize) -> f64 {
    f64::from(u32::try_from(n).expect("a pattern has fewer than u32::MAX parts"))
}
