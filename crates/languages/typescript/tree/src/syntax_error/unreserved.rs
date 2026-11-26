//! The words acorn rejects as it reads them, in strict code, where oxc's parser leaves them to its
//! checker: acorn's `checkUnreserved`, and its `await` in a class static block.

use oxc_ast::AstKind;
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

use super::locator::governed;
use super::word::Home;

/// Why acorn rejects a word as it reads it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(crate) enum Unreserved {
    StaticBlockAwait,
    ArgumentsInInitializer,
    ArgumentsInStaticBlock,
    /// `yield` read as a name, which strict code reserves.
    Yield,
}

impl Unreserved {
    pub(crate) const fn message(self) -> &'static str {
        match self {
            Self::StaticBlockAwait => "Cannot use await in class static initialization block",
            Self::ArgumentsInInitializer => "Cannot use 'arguments' in class field initializer",
            Self::ArgumentsInStaticBlock => {
                "Cannot use arguments in class static initialization block"
            }
            Self::Yield => "The keyword 'yield' is reserved",
        }
    }
}

/// A function, class static block or class field initializer around the node a walk entered.
#[derive(Clone, Copy)]
struct Around {
    span: oxc_span::Span,
    home: Home,
    arrow: bool,
}

/// The first word a walk meets that acorn rejects as it reads it.
pub(crate) struct UnreservedWords {
    /// From the outermost class static block or class field initializer in.
    around: Vec<Around>,
    pub(crate) first: Option<(u32, Unreserved)>,
}

impl UnreservedWords {
    pub(crate) const fn new() -> Self {
        Self {
            around: Vec::new(),
            first: None,
        }
    }

    /// For a walk of the nodes in `span` on their own, which acorn reads in `home`.
    pub(super) fn within(span: oxc_span::Span, home: Home) -> Self {
        Self {
            around: vec![Around {
                span,
                home,
                arrow: false,
            }],
            first: None,
        }
    }

    /// Takes in `kind`, which the walk enters in the order of the source: where and why acorn
    /// rejects it, if it is a word acorn rejects.
    pub(crate) fn enter(&mut self, kind: AstKind<'_>) -> Option<(u32, Unreserved)> {
        let span = kind.span();
        while (self.around.last()).is_some_and(|around| around.span.end <= span.start) {
            self.around.pop();
        }
        let outside = self.around.is_empty();
        let governs = governed(kind)
            .filter(|(_, home)| !outside || matches!(home, Home::StaticBlock | Home::Initializer));
        let arrow = matches!(kind, AstKind::ArrowFunctionExpression(_));
        self.around
            .extend(governs.map(|(span, home)| Around { span, home, arrow }));
        let mut around =
            (self.around.iter().rev()).filter(|around| around.span.contains_inclusive(span));
        let why = match kind {
            AstKind::AwaitExpression(_) => matches!(around.next()?.home, Home::StaticBlock)
                .then_some(Unreserved::StaticBlockAwait),
            AstKind::IdentifierReference(name) if name.name == "yield" => Some(Unreserved::Yield),
            // acorn's `currentThisScope`, which an arrow function does not open, and then its
            // `currentVarScope`, which it does.
            AstKind::IdentifierReference(name) if name.name == "arguments" => {
                let this = around.clone().find(|around| !around.arrow);
                if this.is_some_and(|this| this.home == Home::Initializer) {
                    Some(Unreserved::ArgumentsInInitializer)
                } else {
                    matches!(around.next()?.home, Home::StaticBlock)
                        .then_some(Unreserved::ArgumentsInStaticBlock)
                }
            }
            _ => None,
        }?;
        Some((span.start, why))
    }
}

impl<'a> Visit<'a> for UnreservedWords {
    fn enter_node(&mut self, kind: AstKind<'a>) {
        let rejected = self.enter(kind);
        self.first = self.first.or(rejected);
    }
}
