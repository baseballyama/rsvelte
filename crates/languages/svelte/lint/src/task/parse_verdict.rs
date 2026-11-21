//! What svelte-eslint-parser throws on a document, which decides whether the rules run.

use std::borrow::Cow;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::source::characters::is_ecmascript_whitespace;
use rsvelte_svelte_syntax::syntax_tree::Component;

use crate::computation::{ModuleAsTypeScript, read_as_svelte_eslint_parser};

/// What svelte-eslint-parser does with the document.
pub(super) enum Verdict<'a> {
    /// It throws this message at this offset.
    Throws(Cow<'a, str>, u32),
    /// This port cannot tell what it throws.
    Refused(Diagnostic),
    /// It parses the document, and the rules read it.
    Parses,
}

pub(super) fn parse_verdict<'a>(context: &'a DocumentContext<'_>) -> Verdict<'a> {
    if !rsvelte_svelte_syntax::matches(context.document) {
        return module_rejection(context).map_or(Verdict::Parses, |(message, at)| {
            Verdict::Throws(message, at)
        });
    }
    let javascript_error =
        rsvelte_svelte_semantic::javascript_error::of_document(context, |_| true);
    let (error, component) = match (
        context.get::<rsvelte_svelte_syntax::Parsed>(),
        &javascript_error,
    ) {
        (Err(error), javascript_error) => (javascript_error.as_ref().unwrap_or(error), None),
        (Ok(component), Some(error)) => (error, Some(component)),
        (Ok(component), None) => return unchecked_verdict(component),
    };
    // svelte-eslint-parser reads a self-closing `<script …/>` or `<style …/>` as an element.
    if !rsvelte_svelte_syntax::parse::in_script_content(
        context.source_text(),
        error.span.start_offset,
    ) && (component.is_some() || read_as_svelte_eslint_parser(context).is_err())
    {
        return Verdict::Throws(Cow::Owned(error.message.clone()), error.span.start_offset);
    }
    match typescript_eslint_verdict(context) {
        TypescriptEslint::Throws(message, at) => Verdict::Throws(message, at),
        // tsc's scanner rejects what oxc and Svelte's parser both read.
        verdict => match component.and_then(grammar::scanner_rejection) {
            Some((message, at)) => Verdict::Throws(Cow::Owned(message), at),
            None if matches!(verdict, TypescriptEslint::Unknown) => Verdict::Refused(error.clone()),
            None => Verdict::Parses,
        },
    }
}

/// What typescript-eslint throws in a component Svelte's parser reads whole: what that lets pass.
fn unchecked_verdict(component: &Component) -> Verdict<'static> {
    let tree = &component.javascript;
    if let Some((message, at)) = rsvelte_typescript_tree::typescript_eslint_check(
        tree,
        tree.unchecked_errors(),
        grammar::scripts(component),
    ) {
        return Verdict::Throws(Cow::Borrowed(message), at);
    }
    if let Some(at) = grammar::optional_private_name(component) {
        let message = "An optional chain cannot contain private identifiers.";
        return Verdict::Throws(Cow::Borrowed(message), at);
    }
    Verdict::Parses
}

/// What typescript-eslint does with the scripts when the compiler rejects one.
enum TypescriptEslint<'a> {
    /// It throws this message at this offset.
    Throws(Cow<'a, str>, u32),
    /// It parses them, and the rules read them.
    Parses,
    /// This port cannot tell what it throws.
    Unknown,
}

/// What typescript-eslint does with the first script the compiler rejects.
fn typescript_eslint_verdict<'a>(context: &'a DocumentContext<'_>) -> TypescriptEslint<'a> {
    // svelte-eslint-parser parses the template with the scripts blanked out first, so an error of
    // the template wins over the scripts'.
    let component = match read_as_svelte_eslint_parser(context) {
        Ok(component) => component,
        Err(error) => {
            return TypescriptEslint::Throws(
                Cow::Borrowed(error.message.as_str()),
                error.span.start_offset,
            );
        }
    };
    let errors = &component.script_typescript_errors;
    let Some(error) = rsvelte_typescript_tree::typescript_eslint_error(errors) else {
        return grammar_verdict(component);
    };
    let at = (error.typescript_eslint_at).unwrap_or(error.diagnostic.span.start_offset);
    // svelte-eslint-parser hands typescript-eslint the template's code after the script's, so
    // what it throws at the script's end depends on that code.
    let inside = component
        .scripts()
        .any(|script| script.content.start_offset <= at && at < script.content.end_offset);
    if !inside {
        return missing_at_the_end(context.source_text(), component, error, at)
            .map_or(TypescriptEslint::Unknown, |(message, end)| {
                TypescriptEslint::Throws(Cow::Borrowed(message), end)
            });
    }
    // An error without TypeScript's code is one this port does not know TypeScript's verdict on.
    if error.typescript_code.is_none() {
        return TypescriptEslint::Unknown;
    }
    // An error it does not throw leaves the script to the rules.
    error.typescript_eslint_message().map_or_else(
        || grammar_verdict(component),
        |message| TypescriptEslint::Throws(message, at),
    )
}

/// What TypeScript misses where the last script stops, and where, when no template expression
/// adds code after the script: a `}` at the end of the document, or a name or an expression right
/// after the last token, where tsc reports a missing node at the end of the file.
fn missing_at_the_end(
    source_text: &str,
    component: &Component,
    error: &rsvelte_typescript_tree::SyntaxError,
    at: u32,
) -> Option<(&'static str, u32)> {
    let last = component
        .scripts()
        .max_by_key(|script| script.content.end_offset)?;
    let after = source_text.get(at as usize..)?;
    if last.content.end_offset != at || after.contains('{') {
        return None;
    }
    if error.typescript_code == Some(1005)
        && error.diagnostic.message == "Expected `}` but found `EOF`"
    {
        return Some(("'}' expected.", source_text.len() as u32));
    }
    let content = source_text.get(last.content.start_offset as usize..at as usize)?;
    let code = content.trim_end_matches(is_ecmascript_whitespace);
    let end = last.content.start_offset + code.len() as u32;
    let before = |tail: &str| {
        code.strip_suffix(tail)
            .map(|rest| rest.trim_end_matches(is_ecmascript_whitespace))
    };
    // A `.` of a spread or of a number is not a member access.
    if before(".").is_some_and(|rest| !rest.ends_with(|c: char| c == '.' || c.is_ascii_digit())) {
        return Some(("Identifier expected.", end));
    }
    let assigned = |rest: &str| {
        rest.strip_suffix('=')
            .is_some_and(|rest| !rest.ends_with(['=', '!', '<', '>']))
    };
    if assigned(code) || before("(").is_some_and(assigned) {
        return Some(("Expression expected.", end));
    }
    None
}

/// What typescript-eslint throws from its own check of the scripts read as TypeScript.
fn grammar_verdict<'a>(component: &Component) -> TypescriptEslint<'a> {
    let tree = &component.javascript;
    let errors = (component.script_typescript_errors.iter()).chain(tree.unchecked_errors());
    rsvelte_typescript_tree::typescript_eslint_check(tree, errors, grammar::scripts(component))
        .map_or(TypescriptEslint::Parses, |(message, at)| {
            TypescriptEslint::Throws(Cow::Borrowed(message), at)
        })
}

/// What typescript-eslint throws for a module the shared parse rejects.
fn module_rejection<'a>(context: &'a DocumentContext<'_>) -> Option<(Cow<'a, str>, u32)> {
    context
        .get::<rsvelte_typescript_tree::Parsed>()
        .as_ref()
        .err()?;
    let errors = match context.get::<ModuleAsTypeScript>() {
        Ok(module) => {
            let tree = &module.tree;
            let (message, at) = rsvelte_typescript_tree::typescript_eslint_check(
                tree,
                tree.unchecked_errors(),
                [module.root],
            )?;
            return Some((Cow::Borrowed(message), at));
        }
        Err(errors) => errors,
    };
    let error = rsvelte_typescript_tree::typescript_eslint_error(errors)?;
    Some((
        error.typescript_eslint_message()?,
        error.diagnostic.span.start_offset,
    ))
}

mod grammar;
