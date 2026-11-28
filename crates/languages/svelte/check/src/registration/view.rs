//! The document svelte-check type-checks for one component: its projection, or what it reports
//! when there is none.

use std::sync::Arc;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, ElementEnd, Part, TemplateNode,
};
use rsvelte_svelte_typescript_projection::{EmittedProjection, THROWN, store_reads};
use rsvelte_typescript_check::{
    CheckedDocument, Hidden, Import, TypeScriptDocument, TypeScriptEnv,
};

pub(super) fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    let language = env.and_then(|env| env.as_ref().ok()).cloned();
    // Svelte's parser also rejects the template's JavaScript; svelte2tsx blanks the scripts first.
    let javascript_error =
        rsvelte_svelte_semantic::javascript_error::of_document(context, |error| {
            !rsvelte_svelte_syntax::parse::in_script_content(
                &context.document.text,
                error.span.start_offset,
            )
        });
    // svelte-check type-checks a component whose style sheet does not parse, and svelte2tsx
    // throws Svelte's parse error of the markup, which svelte-check reports as it is.
    let read = rsvelte_svelte_typescript_projection::read(context);
    // svelte-check reads the component as TypeScript when either script is, else as JavaScript,
    // off the script elements whether or not svelte2tsx throws.
    let source = &context.document.text;
    let typescript = read.as_ref().map_or_else(
        |_| rsvelte_svelte_syntax::parse::checked_scripts(source).typescript,
        |read| read.component.checked_as_typescript(source),
    );
    let read = match read {
        Ok(read) => read,
        Err(error) => {
            let error = javascript_error.as_ref().unwrap_or(error);
            return Ok(rejected(error, typescript, language));
        }
    };
    let component = read.component;
    if let Some(error) = &javascript_error {
        return Ok(rejected(error, typescript, language));
    }
    let projection = match context.get::<EmittedProjection>() {
        Ok(projection) => projection,
        Err(thrown) if thrown.code == THROWN => {
            return Ok(TypeScriptDocument::Rejected {
                message: thrown.message.clone(),
                span: thrown.span,
                javascript: !typescript,
                env: language,
            });
        }
        // A JavaScript component the projection does not cover stays unchecked.
        Err(_) if !typescript => return Ok(TypeScriptDocument::Unchecked { env: language }),
        Err(diagnostic) => return Err(diagnostic.clone()),
    };
    let env = env_of(env)?;
    let projection = directive::of(component, &context.document.text).map_or_else(
        || Arc::clone(projection),
        |line| Arc::new(directive::prepended(line, projection)),
    );
    Ok(TypeScriptDocument::Checked(Arc::new(CheckedDocument {
        projection,
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
        extension: if typescript { ".ts" } else { ".js" },
        imports: imports(component),
        store_reads: read.resolution(context).map_or_default(store_reads),
        hidden: hidden(component, &context.document.text),
        drops_unmapped: read.has_script_errors(),
        inserted: Vec::new(),
    })))
}

/// The findings svelte-check's `isNoFalsePositive` hides in `component`.
fn hidden(component: &Component, source_text: &str) -> Vec<Hidden> {
    // A name an element, `<svelte:window>` or `<svelte:body>` gives twice: svelte2tsx writes
    // each of its attributes and event handlers as a property.
    const NAME_GIVEN_TWICE: &[u32] = &[1117, 2300];
    // Never read, and all imports unused: svelte-check cannot see a pug template's reads.
    const UNREAD: &[u32] = &[6133, 6192];
    let mut hidden = Vec::new();
    for node in &component.nodes {
        let TemplateNode::Element {
            name,
            component: None,
            attributes,
            ..
        } = node
        else {
            continue;
        };
        let name = name.text(source_text);
        let element = !name.starts_with("svelte:") && name != "slot";
        if !(element || matches!(name, "svelte:element" | "svelte:window" | "svelte:body")) {
            continue;
        }
        let names = component
            .attributes(*attributes)
            .iter()
            .filter(|attribute| {
                matches!(attribute.kind, AttributeKind::Attribute | AttributeKind::On)
            });
        hidden.extend(names.map(|attribute| Hidden {
            codes: NAME_GIVEN_TWICE,
            at: attribute.name,
            whole: false,
        }));
    }
    if let Some(template) = pug_template(component, source_text) {
        hidden.push(Hidden {
            codes: &[],
            at: template,
            whole: true,
        });
        hidden.push(Hidden {
            codes: UNREAD,
            at: Span::new(0, source_text.len() as u32),
            whole: false,
        });
    }
    hidden
}

/// The content of the first top-level `<template>`, when its `lang`, or else its `type`, is pug.
fn pug_template(component: &Component, source_text: &str) -> Option<Span> {
    let template = component
        .children(component.root)
        .iter()
        .find_map(|&child| match component.node(child) {
            TemplateNode::Element {
                name,
                attributes,
                start_tag,
                end: ElementEnd::EndTag,
                span,
                ..
            } if name.text(source_text) == "template" => Some((*attributes, *start_tag, *span)),
            _ => None,
        })?;
    let (attributes, start_tag, span) = template;
    let value = |key: &str| {
        let attribute = component.attributes(attributes).iter().find(|attribute| {
            attribute.kind == AttributeKind::Attribute && attribute.name.text(source_text) == key
        })?;
        let AttributeValue::Parts(parts) = attribute.value else {
            return None;
        };
        match component.parts(parts) {
            [Part::Text(text)] => Some(text.text(source_text)),
            _ => None,
        }
    };
    let language = value("lang")
        .filter(|lang| !lang.is_empty())
        .or_else(|| value("type"))?;
    if language.strip_prefix("text/").unwrap_or(language) != "pug" {
        return None;
    }
    let end = span.text(source_text).rfind("</")? as u32 + span.start_offset;
    Some(Span::new(start_tag.end_offset, end))
}

/// What svelte-check reports for the parse error svelte2tsx throws.
fn rejected(
    error: &Diagnostic,
    typescript: bool,
    env: Option<Arc<TypeScriptEnv>>,
) -> TypeScriptDocument {
    TypeScriptDocument::Rejected {
        javascript: !typescript,
        env,
        message: error.message.clone(),
        span: if error.has_end {
            error.span
        } else {
            Span::new(error.span.start_offset, error.span.start_offset)
        },
    }
}

/// Each module the scripts name.
fn imports(component: &Component) -> Vec<Import> {
    (component.instance.iter().chain(&component.module))
        .flat_map(|script| {
            rsvelte_typescript_check::imports(component.javascript.get_program(script.program))
        })
        .collect()
}

fn env_of(
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<&Arc<TypeScriptEnv>, Diagnostic> {
    env.ok_or("svelte.check needs the svelte package")
        .and_then(|env| env.as_ref().map_err(String::as_str))
        .map_err(|why| Diagnostic::error("check_unconfigured", why, Span::new(0, 0)))
}

mod directive;

#[cfg(test)]
mod tests;
