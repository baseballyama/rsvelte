//! JavaScript early errors — syntactically shaped but illegal.
//!
//! None of these is decidable from the token stream: each needs the surrounding
//! scope or class context, so OXC settles them in `SemanticBuilder` and not in
//! `Parser`, and rsvelte — which only ran `Parser` — accepted all of them and
//! copied the illegal construct straight into its output (issues #3243, #3217).
//!
//! Upstream has no such split: acorn checks them while parsing and throws, so
//! every one of these is a `js_parse_error` there.
//!
//! The mapping is an ALLOW LIST rather than a pass-through. OXC reports more
//! than acorn checks, its wording differs, and — for every "already declared"
//! class — it labels the DECLARING occurrence where acorn stops at the
//! REDECLARING one. Anything not listed here is ignored, so an OXC diagnostic
//! this table does not know can never become an over-rejection; the price is
//! that a reworded OXC message silently stops matching, which is what
//! `early_errors_3243.rs` pins one repro per entry against.

use oxc_ast::ast::Program;
use oxc_diagnostics::OxcDiagnostic;
use oxc_semantic::SemanticBuilder;

/// Where acorn stops, relative to the labels OXC attaches.
#[derive(Clone, Copy, PartialEq, Eq)]
enum At {
    /// acorn and OXC agree — the first label is the construct.
    First,
    /// acorn stops at the redeclaration; OXC labels the declaration first and
    /// the redeclaration second.
    Last,
    /// OXC labels the jump's target name; acorn stops at the `break` /
    /// `continue` keyword that introduced it.
    JumpKeyword,
}

/// How acorn spells the error.
#[derive(Clone, Copy)]
enum Message {
    /// A constant string.
    Fixed(&'static str),
    /// `{}` takes the source text at the reported label.
    Named(&'static str),
    /// `Identifier 'x'` normally, `type 'x'` when the declaration it collides
    /// with is a TypeScript type alias — acorn-typescript's `declareName`
    /// splits those two at `index.js:4989-4992`.
    Redeclaration,
    /// `Unsyntactic break` / `Unsyntactic continue`, from the keyword found.
    Jump,
}

struct EarlyError {
    /// A substring of OXC's message. Chosen to survive a reworded tail, and
    /// pinned by a repro per row so a bump that breaks it fails loudly.
    needle: &'static str,
    at: At,
    message: Message,
}

const TABLE: &[EarlyError] = &[
    EarlyError {
        needle: "Multiple constructor implementations are not allowed",
        at: At::Last,
        message: Message::Fixed("Duplicate constructor in the same class"),
    },
    EarlyError {
        needle: "Super calls are not permitted outside constructors",
        at: At::First,
        message: Message::Fixed("'super' keyword outside a method"),
    },
    EarlyError {
        needle: "'super' can only be referenced in members of derived classes",
        at: At::First,
        message: Message::Fixed("'super' keyword outside a method"),
    },
    EarlyError {
        needle: "Illegal break statement",
        at: At::First,
        message: Message::Fixed("Unsyntactic break"),
    },
    EarlyError {
        needle: "Illegal continue statement",
        at: At::First,
        message: Message::Fixed("Unsyntactic continue"),
    },
    EarlyError {
        needle: "Jump target cannot cross function boundary",
        at: At::JumpKeyword,
        message: Message::Jump,
    },
    EarlyError {
        needle: "Label `",
        at: At::Last,
        message: Message::Named("Label '{}' is already declared"),
    },
    EarlyError {
        needle: "must be declared in an enclosing class",
        at: At::First,
        message: Message::Named("Private field '{}' must be declared in an enclosing class"),
    },
    EarlyError {
        needle: "has already been declared",
        at: At::Last,
        message: Message::Redeclaration,
    },
    EarlyError {
        needle: "declaration can only be used at the top level of a module",
        at: At::First,
        message: Message::Fixed("'import' and 'export' may only appear at the top level"),
    },
];

/// The earliest early error in `program`, as `(offset, acorn's message)`.
///
/// Runs ONCE per script. It must not be reached from the per-expression parse
/// paths: a template expression is its own `Program` with no enclosing class or
/// loop, so every one of these checks would answer a question it was not asked.
pub fn find_early_error(program: &Program<'_>, source: &str) -> Option<(u32, String)> {
    let diagnostics = SemanticBuilder::new_compiler().build(program).diagnostics;
    diagnostics
        .iter()
        .filter_map(|d| translate(d, source))
        .min_by_key(|(at, _)| *at)
}

fn translate(diagnostic: &OxcDiagnostic, source: &str) -> Option<(u32, String)> {
    let text = diagnostic.message.as_ref();
    let entry = TABLE.iter().find(|e| text.contains(e.needle))?;

    let first = diagnostic.labels.first()?;
    let label = match entry.at {
        At::First | At::JumpKeyword => first,
        At::Last => diagnostic.labels.last()?,
    };
    let start = label.offset();
    let name = source.get(start as usize..(start + label.len()) as usize)?;

    Some(match entry.message {
        Message::Fixed(message) => (start, message.to_string()),
        Message::Named(template) => (start, template.replace("{}", name)),
        Message::Redeclaration => {
            // The declaring occurrence decides the wording; the redeclaring one
            // decides the position, which is why both labels are read here.
            let declared_as_type =
                preceding_word(source, first.offset()).is_some_and(|(_, word)| word == "type");
            let message = if declared_as_type {
                format!("type '{name}' has already been declared.")
            } else {
                format!("Identifier '{name}' has already been declared")
            };
            (start, message)
        }
        Message::Jump => {
            let (at, keyword) = preceding_word(source, label.offset())?;
            let message = match keyword {
                "break" => "Unsyntactic break",
                "continue" => "Unsyntactic continue",
                _ => return None,
            };
            (at, message.to_string())
        }
    })
}

/// The `(offset, text)` of the identifier-like token that ends immediately
/// before `at`, skipping whitespace and comments.
fn preceding_word(source: &str, at: u32) -> Option<(u32, &str)> {
    let mut end = source.get(..at as usize)?.len();
    loop {
        let head = &source[..end];
        let trimmed = head.trim_end();
        end = trimmed.len();
        // A block comment is the only trivia that can end right before a token.
        match trimmed.strip_suffix("*/") {
            Some(head) => end = head.rfind("/*")?,
            None => break,
        }
    }
    let word_start = source[..end]
        .rfind(|c: char| !c.is_ascii_alphanumeric() && c != '_' && c != '$')
        .map_or(0, |i| i + 1);
    (word_start < end).then(|| (word_start as u32, &source[word_start..end]))
}
