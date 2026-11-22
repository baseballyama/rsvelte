//! Acorn's check of a destructuring pattern as a whole, which it makes before it checks the
//! elements.

use oxc_ast::ast::{
    ArrayExpressionElement, ChainElement, ClassElement, Expression, ObjectPropertyKind, Statement,
};
use oxc_parser::{Kind, Parser, Token};
use oxc_span::{GetSpan, SourceType};

use super::super::word::Home;

/// Where acorn's check of a destructuring pattern around the target `start..end` fails, in `text`
/// whose tokens are `tokens` and where acorn reads as `home` says: at the parenthesis it recorded
/// while it read the pattern as an expression. The pattern is the outermost array or object around
/// the target that `=` or a `for` head assigns to and whose check fails. A target an assignment of
/// its own assigns to fails at that assignment, which acorn reads before the pattern's.
pub(super) fn parenthesized_element(
    text: &str,
    (start, end): (u32, u32),
    tokens: &[Token],
    home: Home,
) -> Option<u32> {
    let after = tokens.partition_point(|token| token.start() < end);
    if tokens
        .get(after)
        .is_some_and(|token| token.kind().is_assignment_operator())
    {
        return None;
    }
    assigned_patterns(start, tokens).find_map(|pattern| {
        reparsed(text, pattern, home, |pattern| {
            let mut record = Record::default();
            record.atom(pattern.expression, pattern.source);
            record.at.map(|at| pattern.at(at))
        })
        .flatten()
    })
}

/// An expression read again apart from the rest of the source, in a source of its own.
pub(super) struct Reparsed<'r, 'a> {
    pub(super) expression: &'r Expression<'a>,
    /// The source the expression was read from, which its spans index.
    pub(super) source: &'r str,
    /// Where the expression starts in its own source, and in the original.
    shift: (u32, u32),
}

impl Reparsed<'_, '_> {
    /// The offset in the original source of `at` in the expression's own.
    pub(super) const fn at(&self, at: u32) -> u32 {
        at - self.shift.0 + self.shift.1
    }
}

/// `text[start..end]` read as an expression where acorn reads it, which `home` says: that decides
/// whether `await` and `yield` are keywords, so the expression is read inside a function like the
/// one around it. `None` where it does not read as one expression there.
#[cold]
pub(super) fn reparsed<R>(
    text: &str,
    (start, end): (u32, u32),
    home: Home,
    read: impl FnOnce(&Reparsed<'_, '_>) -> R,
) -> Option<R> {
    let target = text.get(start as usize..end as usize)?;
    let (before, after) = match home {
        Home::TopLevel => ("", ""),
        Home::Function {
            is_async: false,
            is_generator: false,
        }
        | Home::Initializer => ("function _() {", "}"),
        Home::Function {
            is_async: true,
            is_generator: false,
        } => ("async function _() {", "}"),
        Home::Function {
            is_async: false,
            is_generator: true,
        } => ("function* _() {", "}"),
        Home::Function {
            is_async: true,
            is_generator: true,
        } => ("async function* _() {", "}"),
        Home::StaticBlock => ("class _ { static {", "} }"),
    };
    let source = format!("{before}({target});{after}");
    let open = u32::try_from(before.len()).ok()? + 1;
    crate::scratch::with_scratch_arena(|allocator| {
        let parsed = Parser::new(allocator, &source, SourceType::ts()).parse();
        if parsed.fatal_error {
            return None;
        }
        let statement = match parsed.program.body.first()? {
            Statement::FunctionDeclaration(function) => {
                function.body.as_ref()?.statements.first()?
            }
            Statement::ClassDeclaration(class) => match class.body.body.first()? {
                ClassElement::StaticBlock(block) => block.body.first()?,
                _ => return None,
            },
            statement => statement,
        };
        let Statement::ExpressionStatement(statement) = statement else {
            return None;
        };
        let Expression::ParenthesizedExpression(wrapper) = &statement.expression else {
            return None;
        };
        let expression = &wrapper.expression;
        let span = expression.span();
        (span.start == open && span.end == open + (end - start)).then(|| {
            read(&Reparsed {
                expression,
                source: &source,
                shift: (open, start),
            })
        })
    })
}

/// The arrays and objects around `start` that `=` or a `for` head assigns to, outermost first, each
/// from its opening token's start to its closing token's end.
fn assigned_patterns(start: u32, tokens: &[Token]) -> impl Iterator<Item = (u32, u32)> {
    let mut open = Vec::new();
    let mut patterns = Vec::new();
    for (index, token) in tokens.iter().enumerate() {
        match token.kind() {
            Kind::LParen | Kind::LBrack | Kind::LCurly => open.push(index),
            Kind::RParen | Kind::RBrack | Kind::RCurly => {
                let Some(opener) = open.pop() else { break };
                let span = (tokens[opener].start(), token.end());
                if matches!(tokens[opener].kind(), Kind::LBrack | Kind::LCurly)
                    && (span.0..span.1).contains(&start)
                    && assigned(tokens, opener, index)
                {
                    patterns.push(span);
                }
            }
            _ => {}
        }
    }
    patterns.into_iter().rev()
}

/// Whether the group `tokens[open..=close]` is assigned: `=` follows it, or it is a `for` head's
/// target that `in` or `of` follows.
fn assigned(tokens: &[Token], open: usize, close: usize) -> bool {
    let kind = |index: Option<usize>| index.and_then(|index| tokens.get(index)).map(Token::kind);
    match kind(Some(close + 1)) {
        Some(Kind::Eq) => true,
        Some(Kind::In | Kind::Of) => {
            kind(open.checked_sub(1)) == Some(Kind::LParen)
                && matches!(kind(open.checked_sub(2)), Some(Kind::For | Kind::Await))
        }
        _ => false,
    }
}

/// acorn's `parenthesizedAssign`: where the first parenthesized operand that is not a simple target
/// starts, among the elements of one pattern, which share it.
#[derive(Default)]
struct Record {
    at: Option<u32>,
}

impl Record {
    /// acorn's `parseMaybeAssign` of an element: it reads it with a fresh record, which an
    /// assignment clears and which otherwise yields to the one the elements before it left.
    fn element(&mut self, element: &Expression<'_>, text: &str) {
        let before = self.at.take();
        if let Expression::AssignmentExpression(_) = element {
            return;
        }
        self.operand(element, text);
        if before.is_some() {
            self.at = before;
        }
    }

    /// The leftmost operand of `expression`, the only one acorn reads with the record, and the
    /// subscripts after it, which clear what it recorded.
    fn operand(&mut self, expression: &Expression<'_>, text: &str) {
        match expression {
            Expression::ConditionalExpression(conditional) => self.operand(&conditional.test, text),
            Expression::BinaryExpression(binary) => self.operand(&binary.left, text),
            Expression::LogicalExpression(logical) => self.operand(&logical.left, text),
            Expression::TSAsExpression(cast) => self.operand(&cast.expression, text),
            Expression::TSSatisfiesExpression(cast) => self.operand(&cast.expression, text),
            _ => match subscripted(expression) {
                Some(atom) => {
                    self.atom(atom, text);
                    if self.at.is_some_and(|at| at >= expression.span().start) {
                        self.at = None;
                    }
                }
                None => self.atom(expression, text),
            },
        }
    }

    /// acorn's `parseExprAtom`, which records a parenthesized expression that is not a simple
    /// target, an arrow function's parameter list included, and reads an array's or an object's
    /// elements with the record.
    fn atom(&mut self, atom: &Expression<'_>, text: &str) {
        let parenthesized = match atom {
            Expression::ParenthesizedExpression(parenthesized) => {
                !is_simple_target(&parenthesized.expression)
            }
            Expression::ArrowFunctionExpression(arrow) => {
                !arrow.r#async && text.as_bytes().get(arrow.span.start as usize) == Some(&b'(')
            }
            Expression::ArrayExpression(array) => {
                for element in &array.elements {
                    match element {
                        ArrayExpressionElement::SpreadElement(spread) => {
                            self.element(&spread.argument, text);
                        }
                        ArrayExpressionElement::Elision(_) => {}
                        element => {
                            if let Some(element) = element.as_expression() {
                                self.element(element, text);
                            }
                        }
                    }
                }
                false
            }
            Expression::ObjectExpression(object) => {
                for property in &object.properties {
                    match property {
                        ObjectPropertyKind::SpreadProperty(spread) => {
                            self.element(&spread.argument, text);
                        }
                        ObjectPropertyKind::ObjectProperty(property)
                            if !property.shorthand && !property.method =>
                        {
                            self.element(&property.value, text);
                        }
                        ObjectPropertyKind::ObjectProperty(_) => {}
                    }
                }
                false
            }
            _ => false,
        };
        if parenthesized && self.at.is_none() {
            self.at = Some(atom.span().start);
        }
    }
}

/// The operand at the start of `expression` when subscripts follow it.
fn subscripted<'e, 'a>(expression: &'e Expression<'a>) -> Option<&'e Expression<'a>> {
    let mut operand = expression;
    loop {
        operand = match operand {
            Expression::CallExpression(call) => &call.callee,
            Expression::StaticMemberExpression(member) => &member.object,
            Expression::ComputedMemberExpression(member) => &member.object,
            Expression::PrivateFieldExpression(member) => &member.object,
            Expression::TaggedTemplateExpression(tagged) => &tagged.tag,
            Expression::TSNonNullExpression(non_null) => &non_null.expression,
            Expression::ChainExpression(chain) => match chain.expression.as_member_expression() {
                Some(member) => member.object(),
                None => match &chain.expression {
                    ChainElement::CallExpression(call) => &call.callee,
                    _ => return None,
                },
            },
            _ => break,
        };
    }
    (!std::ptr::eq(operand, expression)).then_some(operand)
}

/// acorn's `isSimpleAssignTarget`: a name or a member expression, inside any parentheses.
fn is_simple_target(expression: &Expression<'_>) -> bool {
    match expression {
        Expression::ParenthesizedExpression(parenthesized) => {
            is_simple_target(&parenthesized.expression)
        }
        Expression::Identifier(_)
        | Expression::StaticMemberExpression(_)
        | Expression::ComputedMemberExpression(_)
        | Expression::PrivateFieldExpression(_) => true,
        _ => false,
    }
}
