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

use std::collections::HashMap;

use oxc_ast::ast::{
    ArrowFunctionExpression, BindingPattern, Declaration, ExportDefaultDeclarationKind, Function,
    ImportDeclaration, ImportDeclarationSpecifier, ImportOrExportKind, MethodDefinition,
    ObjectProperty, Program, Statement,
};
use oxc_ast_visit::{Visit, walk};
use oxc_diagnostics::OxcDiagnostic;
use oxc_semantic::SemanticBuilder;
use oxc_syntax::scope::ScopeFlags;

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
    /// OXC labels the `delete` operand; acorn stops at the `delete` keyword.
    DeleteKeyword,
    /// OXC labels the `'use strict'` directive; acorn stops at the start of the
    /// function whose parameter list made the directive illegal.
    EnclosingFunction,
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

/// Which parses raise a row. Upstream clears acorn's `undefinedExports` after
/// every statement when it parses a component `<script>` (`1-parse/acorn.js`
/// `is_script`), because the exported name may be declared elsewhere in the
/// component — so the undefined-export row is live only for a module.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Hosts {
    Both,
    ModuleOnly,
}

struct EarlyError {
    /// A substring of OXC's message. Chosen to survive a reworded tail, and
    /// pinned by a repro per row so a bump that breaks it fails loudly.
    needle: &'static str,
    at: At,
    message: Message,
    hosts: Hosts,
}

const TABLE: &[EarlyError] = &[
    EarlyError {
        needle: "Multiple constructor implementations are not allowed",
        at: At::Last,
        message: Message::Fixed("Duplicate constructor in the same class"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Super calls are not permitted outside constructors",
        at: At::First,
        message: Message::Fixed("'super' keyword outside a method"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "'super' can only be referenced in members of derived classes",
        at: At::First,
        message: Message::Fixed("'super' keyword outside a method"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "'super' can only be referenced in a derived class",
        at: At::First,
        message: Message::Fixed("super() call outside constructor of a subclass"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Illegal break statement",
        at: At::First,
        message: Message::Fixed("Unsyntactic break"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Illegal continue statement",
        at: At::First,
        message: Message::Fixed("Unsyntactic continue"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Jump target cannot cross function boundary",
        at: At::JumpKeyword,
        message: Message::Jump,
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Label `",
        at: At::Last,
        message: Message::Named("Label '{}' is already declared"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "must be declared in an enclosing class",
        at: At::First,
        message: Message::Named("Private field '{}' must be declared in an enclosing class"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "has already been declared",
        at: At::Last,
        message: Message::Redeclaration,
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "declaration can only be used at the top level of a module",
        at: At::First,
        message: Message::Fixed("'import' and 'export' may only appear at the top level"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "The operand of a 'delete' operator cannot be a private identifier",
        at: At::DeleteKeyword,
        message: Message::Fixed("Private fields can not be deleted"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Illegal 'use strict' directive in function with non-simple parameter list",
        at: At::EnclosingFunction,
        message: Message::Fixed(
            "Illegal 'use strict' directive in function with non-simple parameter list",
        ),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "'arguments' is not allowed in class field initializer",
        at: At::First,
        message: Message::Fixed("Cannot use 'arguments' in class field initializer"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "'arguments' is not allowed in static initialization block",
        at: At::First,
        message: Message::Fixed("Cannot use arguments in class static initialization block"),
        hosts: Hosts::Both,
    },
    EarlyError {
        needle: "Export '",
        at: At::First,
        message: Message::Named("Export '{}' is not defined"),
        hosts: Hosts::ModuleOnly,
    },
];

/// The earliest early error in `program`, as `(offset, acorn's message)`.
///
/// Runs ONCE per script. It must not be reached from the per-expression parse
/// paths: a template expression is its own `Program` with no enclosing class or
/// loop, so every one of these checks would answer a question it was not asked.
pub fn find_early_error(
    program: &Program<'_>,
    source: &str,
    is_script: bool,
) -> Option<(u32, String)> {
    let diagnostics = SemanticBuilder::new_compiler().build(program).diagnostics;
    let mut functions = None;
    let semantic = diagnostics
        .iter()
        .filter_map(|d| translate(d, source, program, is_script, &mut functions))
        .min_by_key(|(at, _)| *at);
    semantic
        .into_iter()
        .chain(type_import_value_redeclaration(program))
        .min_by_key(|(at, _)| *at)
}

/// acorn-typescript puts a type-only import in the same declaration namespace
/// as runtime declarations. OXC deliberately gives TypeScript types and values
/// separate semantic namespaces, so its otherwise useful duplicate-binding
/// diagnostics cannot report this parser-compatibility edge (#3965).
///
/// Keep the compensation here instead of teaching phase 2 that a type import is
/// a runtime binding. The latter would make correct programs resolve a type as
/// a value and change their generated code.
fn type_import_value_redeclaration(program: &Program<'_>) -> Option<(u32, String)> {
    let mut events = Vec::new();
    for statement in &program.body {
        match statement {
            Statement::ImportDeclaration(import) => collect_import_bindings(import, &mut events),
            Statement::ExportNamedDeclaration(export) => {
                if let Some(declaration) = &export.declaration {
                    collect_value_declaration(declaration, &mut events);
                }
            }
            Statement::ExportDefaultDeclaration(export) => match &export.declaration {
                ExportDefaultDeclarationKind::FunctionDeclaration(function) => {
                    if let Some(id) = &function.id {
                        events.push((id.span.start, id.name.to_string(), false));
                    }
                }
                ExportDefaultDeclarationKind::ClassDeclaration(class) => {
                    if let Some(id) = &class.id {
                        events.push((id.span.start, id.name.to_string(), false));
                    }
                }
                _ => {}
            },
            Statement::VariableDeclaration(declaration) => {
                collect_variable_names(declaration, &mut events);
            }
            Statement::FunctionDeclaration(function) => {
                if let Some(id) = &function.id {
                    events.push((id.span.start, id.name.to_string(), false));
                }
            }
            Statement::ClassDeclaration(class) => {
                if let Some(id) = &class.id {
                    events.push((id.span.start, id.name.to_string(), false));
                }
            }
            Statement::TSEnumDeclaration(declaration) => {
                events.push((
                    declaration.id.span.start,
                    declaration.id.name.to_string(),
                    false,
                ));
            }
            Statement::TSImportEqualsDeclaration(declaration) => {
                events.push((
                    declaration.id.span.start,
                    declaration.id.name.to_string(),
                    declaration.import_kind == ImportOrExportKind::Type,
                ));
            }
            _ => {}
        }
    }

    events.sort_unstable_by_key(|(start, _, _)| *start);
    let mut type_imports = HashMap::new();
    let mut values = HashMap::new();
    for (start, name, is_type_import) in events {
        let already_declared = if is_type_import {
            values.contains_key(&name)
        } else {
            type_imports.contains_key(&name)
        };
        if already_declared {
            return Some((
                start,
                format!("Identifier '{name}' has already been declared"),
            ));
        }
        if is_type_import {
            type_imports.entry(name).or_insert(start);
        } else {
            values.entry(name).or_insert(start);
        }
    }
    None
}

type BindingEvent = (u32, String, bool);

fn collect_import_bindings(import: &ImportDeclaration<'_>, out: &mut Vec<BindingEvent>) {
    let Some(specifiers) = &import.specifiers else {
        return;
    };
    for specifier in specifiers {
        let (local, specifier_is_type) = match specifier {
            ImportDeclarationSpecifier::ImportSpecifier(specifier) => (
                &specifier.local,
                specifier.import_kind == ImportOrExportKind::Type,
            ),
            ImportDeclarationSpecifier::ImportDefaultSpecifier(specifier) => {
                (&specifier.local, false)
            }
            ImportDeclarationSpecifier::ImportNamespaceSpecifier(specifier) => {
                (&specifier.local, false)
            }
        };
        let is_type_import = import.import_kind == ImportOrExportKind::Type || specifier_is_type;
        out.push((local.span.start, local.name.to_string(), is_type_import));
    }
}

fn collect_value_declaration(declaration: &Declaration<'_>, out: &mut Vec<BindingEvent>) {
    match declaration {
        Declaration::VariableDeclaration(declaration) => {
            collect_variable_names(declaration, out);
        }
        Declaration::FunctionDeclaration(function) => {
            if let Some(id) = &function.id {
                out.push((id.span.start, id.name.to_string(), false));
            }
        }
        Declaration::ClassDeclaration(class) => {
            if let Some(id) = &class.id {
                out.push((id.span.start, id.name.to_string(), false));
            }
        }
        Declaration::TSEnumDeclaration(declaration) => out.push((
            declaration.id.span.start,
            declaration.id.name.to_string(),
            false,
        )),
        Declaration::TSImportEqualsDeclaration(declaration) => {
            out.push((
                declaration.id.span.start,
                declaration.id.name.to_string(),
                declaration.import_kind == ImportOrExportKind::Type,
            ));
        }
        _ => {}
    }
}

fn collect_variable_names(
    declaration: &oxc_ast::ast::VariableDeclaration<'_>,
    out: &mut Vec<BindingEvent>,
) {
    for declarator in &declaration.declarations {
        collect_pattern_names(&declarator.id, out);
    }
}

fn collect_pattern_names(pattern: &BindingPattern<'_>, out: &mut Vec<BindingEvent>) {
    match pattern {
        BindingPattern::BindingIdentifier(id) => {
            out.push((id.span.start, id.name.to_string(), false));
        }
        BindingPattern::ObjectPattern(object) => {
            for property in &object.properties {
                collect_pattern_names(&property.value, out);
            }
            if let Some(rest) = &object.rest {
                collect_pattern_names(&rest.argument, out);
            }
        }
        BindingPattern::ArrayPattern(array) => {
            for element in array.elements.iter().flatten() {
                collect_pattern_names(element, out);
            }
            if let Some(rest) = &array.rest {
                collect_pattern_names(&rest.argument, out);
            }
        }
        BindingPattern::AssignmentPattern(assignment) => {
            collect_pattern_names(&assignment.left, out);
        }
    }
}

fn translate(
    diagnostic: &OxcDiagnostic,
    source: &str,
    program: &Program<'_>,
    is_script: bool,
    functions: &mut Option<FunctionStarts>,
) -> Option<(u32, String)> {
    let text = diagnostic.message.as_ref();
    let entry = TABLE.iter().find(|e| text.contains(e.needle))?;
    if is_script && entry.hosts == Hosts::ModuleOnly {
        return None;
    }

    let first = diagnostic.labels.first()?;
    let label = match entry.at {
        At::Last => diagnostic.labels.last()?,
        _ => first,
    };
    let start = label.offset();
    let name = source.get(start as usize..(start + label.len()) as usize)?;

    Some(match entry.message {
        Message::Fixed(message) => {
            let at = match entry.at {
                At::DeleteKeyword => preceding_keyword(source, start, "delete")?,
                At::EnclosingFunction => functions
                    .get_or_insert_with(|| FunctionStarts::collect(program))
                    .innermost_containing(start)?,
                _ => start,
            };
            (at, message.to_string())
        }
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

/// The last standalone `keyword` token before `at`. The operand of a `delete`
/// can be parenthesised or optional-chained, so the keyword is not always the
/// word immediately preceding the label OXC attached.
fn preceding_keyword(source: &str, at: u32, keyword: &str) -> Option<u32> {
    let head = source.get(..at as usize)?;
    let is_word = |c: u8| c.is_ascii_alphanumeric() || c == b'_' || c == b'$';
    let bytes = source.as_bytes();
    let mut from = head.len();
    while let Some(i) = head[..from].rfind(keyword) {
        let before_ok = i == 0 || !is_word(bytes[i - 1]);
        let after = i + keyword.len();
        let after_ok = after >= bytes.len() || !is_word(bytes[after]);
        if before_ok && after_ok {
            return Some(i as u32);
        }
        from = i;
    }
    None
}

/// Where acorn opens each function node: at the `function` / `async` keyword
/// for a declaration or expression, and at the parameter list for a method —
/// `parseMethod` starts its node only after the key has been consumed.
struct FunctionStarts {
    /// `(span_start, span_end, acorn_start)`.
    spans: Vec<(u32, u32, u32)>,
    in_method: u32,
}

impl FunctionStarts {
    fn collect(program: &Program<'_>) -> Self {
        let mut this = Self {
            spans: Vec::new(),
            in_method: 0,
        };
        this.visit_program(program);
        this
    }

    fn innermost_containing(&self, at: u32) -> Option<u32> {
        self.spans
            .iter()
            .filter(|(start, end, _)| *start <= at && at < *end)
            .min_by_key(|(start, end, _)| end - start)
            .map(|(_, _, acorn_start)| *acorn_start)
    }
}

impl<'a> Visit<'a> for FunctionStarts {
    fn visit_function(&mut self, func: &Function<'a>, flags: ScopeFlags) {
        let acorn_start = if self.in_method > 0 {
            func.params.span.start
        } else {
            func.span.start
        };
        self.spans
            .push((func.span.start, func.span.end, acorn_start));
        let outer = std::mem::take(&mut self.in_method);
        walk::walk_function(self, func, flags);
        self.in_method = outer;
    }

    fn visit_arrow_function_expression(&mut self, func: &ArrowFunctionExpression<'a>) {
        self.spans
            .push((func.span.start, func.span.end, func.span.start));
        let outer = std::mem::take(&mut self.in_method);
        walk::walk_arrow_function_expression(self, func);
        self.in_method = outer;
    }

    fn visit_method_definition(&mut self, def: &MethodDefinition<'a>) {
        self.in_method += 1;
        walk::walk_method_definition(self, def);
        self.in_method -= 1;
    }

    fn visit_object_property(&mut self, prop: &ObjectProperty<'a>) {
        self.in_method += u32::from(prop.method);
        walk::walk_object_property(self, prop);
        self.in_method -= u32::from(prop.method);
    }
}
