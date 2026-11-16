//! The scripts the plugin prints as they are, because its parser for them throws.

use oxc_ast::ast::{
    Class, ClassElement, PrivateIdentifier, Program, WithClause, WithClauseKeyword,
};
use oxc_ast_visit::{Visit, walk};
use rsvelte_svelte_syntax::syntax_tree::Component;
use rsvelte_typescript_tree::{Reader, SyntaxError};

use super::{R, Span, Unsupported, in_typescript};

/// The bodies of the scripts the plugin keeps as they are, as its parser throws on them;
/// `rejected` is the first error a module rejects.
pub(super) fn unparsed_scripts(
    c: &Component,
    source_text: &str,
    rejected: Option<&SyntaxError>,
) -> R<Vec<Span>> {
    let mut unparsed_scripts = thrown_scripts(c, source_text)?;
    let unparsed = |span: Span| {
        (unparsed_scripts.iter()).any(|body| {
            body.start_offset <= span.start_offset && span.end_offset <= body.end_offset
        })
    };
    match rejected {
        Some(rejected) if unparsed(rejected.diagnostic.span) => {}
        Some(rejected) => {
            unparsed_scripts.push(unparsed_script(c, source_text, rejected).ok_or_else(|| {
                Unsupported::at("code a module rejects", rejected.diagnostic.span)
            })?);
        }
        None => unparsed_scripts
            .extend(overriding_script(c, source_text).or_else(|| assertion_script(c, source_text))),
    }
    Ok(unparsed_scripts)
}

/// The bodies of the scripts whose TypeScript errors the plugin's parser for them throws on.
fn thrown_scripts(c: &Component, source_text: &str) -> R<Vec<Span>> {
    let errors = &c.script_typescript_errors;
    let mut thrown = Vec::new();
    for script in c.module.iter().chain(&c.instance) {
        let body = script.content;
        let inside = |error: &SyntaxError| {
            let at = error.diagnostic.span.start_offset;
            body.start_offset <= at && at <= body.end_offset
        };
        // Each script's errors follow one another.
        let Some(start) = errors.iter().position(inside) else {
            continue;
        };
        let len = errors[start..]
            .iter()
            .take_while(|error| inside(error))
            .count();
        let errors = &errors[start..start + len];
        let reader = if in_typescript(script, source_text) {
            Reader::TypescriptEstree
        } else {
            Reader::BabelTypescript
        };
        // oxc recovered no program from an error that stopped it, and neither parser reads on.
        let recovered = !c.javascript.get_program(script.program).span.is_empty();
        let rejects = !recovered
            || reader
                .throws(&c.javascript, script.program, errors)
                .ok_or_else(|| {
                    Unsupported::at(
                        "a TypeScript error the plugin's parser may throw on",
                        errors[0].diagnostic.span,
                    )
                })?;
        if rejects {
            thrown.push(body);
        }
    }
    Ok(thrown)
}

/// The body of the JavaScript script whose tree holds an `assert { … }` import attribute clause,
/// which `babel-ts` throws on, so the plugin keeps that body as it is.
fn assertion_script(c: &Component, source_text: &str) -> Option<Span> {
    struct Find(bool);
    impl<'a> Visit<'a> for Find {
        fn visit_with_clause(&mut self, it: &WithClause<'a>) {
            self.0 |= it.keyword == WithClauseKeyword::Assert;
        }
    }
    let script = (c.module.iter().chain(&c.instance)).find(|script| {
        let mut find = Find(false);
        find.visit_program(c.javascript.get_program(script.program));
        find.0 && !in_typescript(script, source_text)
    })?;
    Some(script.content)
}

/// The body of the JavaScript script holding `rejected`, an error Babel does not recover from
/// either, so the plugin keeps that body as it is. Babel recovers from the others, and Prettier's
/// TypeScript parser from more.
fn unparsed_script(c: &Component, source_text: &str, rejected: &SyntaxError) -> Option<Span> {
    // A name declared twice; Babel throws only on a private one.
    const DUPLICATE_IDENTIFIER: u32 = 2300;
    let span = rejected.diagnostic.span;
    let script = (c.module.iter().chain(&c.instance)).find(|script| {
        script.content.start_offset <= span.start_offset
            && span.end_offset <= script.content.end_offset
    })?;
    let rejects = match rejected.typescript_code? {
        DUPLICATE_IDENTIFIER => {
            private_name_at(c.javascript.get_program(script.program), span.start_offset)
        }
        code => rsvelte_typescript_tree::babel_typescript_throws(code) == Some(true),
    };
    (rejects && !in_typescript(script, source_text)).then_some(script.content)
}

/// The body of a script `babel-ts` reads that has an `override` member in a class that extends
/// none: Babel throws on it, so the plugin keeps that body as it is. Only TypeScript has the
/// modifier.
fn overriding_script(c: &Component, source_text: &str) -> Option<Span> {
    struct Find(bool);
    impl<'a> Visit<'a> for Find {
        fn visit_class(&mut self, it: &Class<'a>) {
            self.0 |= it.heritage.is_none()
                && it.body.body.iter().any(|element| match element {
                    ClassElement::MethodDefinition(member) => member.r#override,
                    ClassElement::PropertyDefinition(member) => member.r#override,
                    ClassElement::AccessorProperty(member) => member.r#override,
                    ClassElement::StaticBlock(_) | ClassElement::TSIndexSignature(_) => false,
                });
            walk::walk_class(self, it);
        }
    }
    let script = (c.module.iter().chain(&c.instance)).find(|script| {
        script.typescript && !in_typescript(script, source_text) && {
            let mut find = Find(false);
            find.visit_program(c.javascript.get_program(script.program));
            find.0
        }
    })?;
    Some(script.content)
}

/// Whether a private name starts at `offset` in `program`.
fn private_name_at(program: &Program<'_>, offset: u32) -> bool {
    struct Find(u32, bool);
    impl<'a> Visit<'a> for Find {
        fn visit_private_identifier(&mut self, it: &PrivateIdentifier<'a>) {
            self.1 |= it.span.start == self.0;
        }
    }
    let mut find = Find(offset, false);
    find.visit_program(program);
    find.1
}
