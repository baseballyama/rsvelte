//! Where acorn reads a name, which decides whether `await` there is the keyword.

use oxc_parser::{Kind, Token};

use super::locator::{Find, Locator};

/// Where acorn reads a name, which decides what it reports for `await` and `yield` there: the
/// innermost function, class static block or class field initializer around it.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub(super) enum Home {
    /// Outside every function and class static block.
    TopLevel,
    /// In a function, or an arrow function, which is never a generator.
    Function {
        is_async: bool,
        is_generator: bool,
    },
    StaticBlock,
    /// A class field's initializer, which acorn reads as the body of a plain function.
    Initializer,
}

impl Home {
    /// Whether acorn reads `await` here as the keyword.
    pub(super) const fn awaits(self) -> bool {
        matches!(self, Self::TopLevel | Self::Function { is_async: true, .. })
    }
}

/// Where acorn reads the word oxc labels `start..end`, and the name oxc's tree reads there. A
/// part oxc could not read has no tree. There a name is known to be at the top level when it is
/// outside every bracket and arrow before it, or when nothing before it can start a function:
/// `function`, `class`, `=>`, or a `{` after a `)` that closes inside brackets or right before it,
/// which is how a method's body opens, with or without a return type.
pub(super) fn home(
    start: u32,
    end: u32,
    tokens: impl Iterator<Item = Token>,
    visit: impl FnOnce(&mut Locator),
) -> Option<Home> {
    #[derive(Clone, Copy, Default)]
    struct Before {
        depth: i32,
        arrow: bool,
        function: bool,
        previous: Option<Kind>,
        closed_inside: bool,
    }
    let mut locator = Locator::new(start, end, Find::Home);
    visit(&mut locator);
    if locator.walked {
        return Some(locator.home.unwrap_or(Home::TopLevel));
    }
    let before = tokens.take_while(|token| token.start() < start).fold(
        Before::default(),
        |before, token| {
            let kind = token.kind();
            let opens_body = kind == Kind::LCurly
                && (before.closed_inside || before.previous == Some(Kind::RParen));
            let depth = match kind {
                Kind::LCurly | Kind::LParen | Kind::LBrack | Kind::TemplateHead => before.depth + 1,
                Kind::RCurly | Kind::RParen | Kind::RBrack | Kind::TemplateTail => before.depth - 1,
                _ => before.depth,
            };
            Before {
                depth,
                arrow: match kind {
                    Kind::Arrow if depth == 0 => true,
                    Kind::Semicolon if depth == 0 => false,
                    _ => before.arrow,
                },
                function: before.function
                    || opens_body
                    || matches!(kind, Kind::Function | Kind::Arrow | Kind::Class),
                previous: Some(kind),
                closed_inside: before.closed_inside || (kind == Kind::RParen && depth > 0),
            }
        },
    );
    let top_level = (before.depth == 0 && !before.arrow) || !before.function;
    top_level.then_some(Home::TopLevel)
}
