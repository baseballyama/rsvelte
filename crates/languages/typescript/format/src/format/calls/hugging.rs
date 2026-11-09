//! Prettier's tests for hugging the first argument of a call.

use rsvelte_typescript_syntax::operators::UnaryOperator;

use super::{Formatter, Kind, NodeIdentifier, R, Unsupported};

impl Formatter<'_> {
    /// `isSimpleCallArgument`, or an error for a node it would read that is not modeled here.
    pub(super) fn is_simple_call_argument(&self, node: NodeIdentifier, depth: u8) -> R<bool> {
        if depth == 0 {
            return Ok(false);
        }
        let deeper = |n: NodeIdentifier| self.is_simple_call_argument(n, depth - 1);
        Ok(match self.syntax_tree.kind(node) {
            Kind::Regex { pattern, .. } => {
                rsvelte_document_printer::string_width(pattern.text(self.source_text)) <= 5
            }
            Kind::Number(_)
            | Kind::String
            | Kind::Boolean(_)
            | Kind::Null
            | Kind::BigInt
            | Kind::Identifier(_)
            | Kind::This
            | Kind::Super => true,
            Kind::Template {
                quasis,
                expressions,
            } => {
                quasis
                    .iter()
                    .all(|&q| !self.span(q).text(self.source_text).contains('\n'))
                    && all(expressions, deeper)?
            }
            Kind::Object(properties) => all(properties, |p| match self.syntax_tree.kind(p) {
                Kind::Property {
                    computed: false,
                    shorthand: true,
                    ..
                } => Ok(true),
                Kind::Property {
                    computed: false,
                    value,
                    ..
                } => deeper(value),
                _ => Ok(false),
            })?,
            Kind::Array(elements) => all(elements, |e| {
                if matches!(self.syntax_tree.kind(e), Kind::Hole) {
                    Ok(true)
                } else {
                    deeper(e)
                }
            })?,
            Kind::Call {
                callee, arguments, ..
            }
            | Kind::New { callee, arguments } => {
                self.is_simple_call_argument(callee, depth)?
                    && arguments.len() <= usize::from(depth)
                    && all(arguments, deeper)?
            }
            Kind::ImportExpression { .. } => {
                return Err(Unsupported::at(
                    "`import()` beside a hugged argument",
                    self.syntax_tree.source_location(node),
                ));
            }
            Kind::Member {
                object, property, ..
            } => {
                self.is_simple_call_argument(object, depth)?
                    && self.is_simple_call_argument(property, depth)?
            }
            Kind::Unary(
                UnaryOperator::Not
                | UnaryOperator::Neg
                | UnaryOperator::Plus
                | UnaryOperator::BitNot,
                argument,
            )
            | Kind::Update { arg: argument, .. } => {
                self.is_simple_call_argument(argument, depth)?
            }
            _ => false,
        })
    }

    /// `isHopefullyShortCallArgument`.
    pub(super) fn is_hopefully_short_call_argument(&self, node: NodeIdentifier) -> R<bool> {
        match self.syntax_tree.kind(node) {
            Kind::Call { arguments, .. } | Kind::New { arguments, .. } if arguments.len() > 1 => {
                Ok(false)
            }
            Kind::Binary(_, left, right) | Kind::Logical(_, left, right) => Ok(self
                .is_simple_call_argument(left, 1)?
                && self.is_simple_call_argument(right, 1)?),
            Kind::Regex { .. } => Ok(true),
            _ => self.is_simple_call_argument(node, 2),
        }
    }

    /// `couldExpandArg`.
    pub(super) fn could_expand_argument(&self, node: NodeIdentifier, arrow_chain: bool) -> bool {
        match self.syntax_tree.kind(node) {
            Kind::Object(items) | Kind::Array(items) => !items.is_empty(),
            Kind::Function { .. } => true,
            Kind::Arrow {
                body,
                expression_body,
                ..
            } => {
                !expression_body
                    || match self.syntax_tree.kind(body) {
                        Kind::Object(_) | Kind::Array(_) => true,
                        Kind::Arrow { .. } => self.could_expand_argument(body, true),
                        Kind::Conditional { .. } | Kind::Call { .. } => !arrow_chain,
                        _ => false,
                    }
            }
            _ => false,
        }
    }
}

fn all(nodes: &[NodeIdentifier], mut test: impl FnMut(NodeIdentifier) -> R<bool>) -> R<bool> {
    for &n in nodes {
        if !test(n)? {
            return Ok(false);
        }
    }
    Ok(true)
}
