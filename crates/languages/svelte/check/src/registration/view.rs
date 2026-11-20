//! The document svelte-check type-checks for one component: its projection, or what it reports
//! when there is none.

use std::sync::Arc;

use oxc_ast::ast::{
    ExportAllDeclaration, ExportFromDeclaration, Expression, ImportDeclaration, ImportExpression,
    StringLiteral,
};
use oxc_ast_visit::{Visit, walk};
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_svelte_typescript_projection::{EmittedProjection, THROWN, store_reads};
use rsvelte_typescript_check::{
    CheckedDocument, Hidden, Import, TypeScriptDocument, TypeScriptEnv,
};

pub(super) fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    // svelte-check type-checks a component whose style sheet does not parse.
    let read = match rsvelte_svelte_typescript_projection::read(context) {
        Ok(read) => read,
        Err(error) => {
            if let Some(document) = script_syntax::view(&context.document.text, || env_of(env)) {
                return document;
            }
            // svelte2tsx throws Svelte's parse error, which svelte-check reports as it is.
            return Ok(rejected(error));
        }
    };
    let component = read.component;
    // Svelte's parser also rejects the template's JavaScript; svelte2tsx blanks the scripts first.
    if let Some(error) = rsvelte_svelte_semantic::javascript_error::of_document(context)
        && !rsvelte_svelte_syntax::parse::in_script_content(
            &context.document.text,
            error.span.start_offset,
        )
    {
        return Ok(rejected(&error));
    }
    // svelte-check reads the component as TypeScript when either script is, else as JavaScript.
    let typescript = component.checked_as_typescript(&context.document.text);
    let projection = match context.get::<EmittedProjection>() {
        Ok(projection) => projection,
        Err(thrown) if thrown.code == THROWN => {
            return Ok(TypeScriptDocument::Rejected {
                message: thrown.message.clone(),
                span: thrown.span,
            });
        }
        // A JavaScript component the projection does not cover stays unchecked.
        Err(_) if !typescript => return Ok(TypeScriptDocument::Unchecked),
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
        imports: relative_imports(component),
        store_reads: read
            .resolution(context)
            .map(store_reads)
            .unwrap_or_default(),
        hidden: hidden(component, &context.document.text),
        drops_unmapped: false,
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
                end_tag: true,
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
fn rejected(error: &Diagnostic) -> TypeScriptDocument {
    TypeScriptDocument::Rejected {
        message: error.message.clone(),
        span: if error.has_end {
            error.span
        } else {
            Span::new(error.span.start_offset, error.span.start_offset)
        },
    }
}

/// Each relative module specifier the scripts import, re-export from or load with `import()`, by
/// its string literal, with the names a static import binds.
fn relative_imports(component: &Component) -> Vec<Import> {
    struct Specifiers(Vec<Import>);
    impl Specifiers {
        fn push(&mut self, source: &StringLiteral<'_>, names: Vec<String>) {
            // A specifier with a lone surrogate names no file.
            if let Some(specifier) = source.value.as_str()
                && specifier.starts_with('.')
            {
                self.0.push(Import {
                    at: Span::new(source.span.start, source.span.end),
                    specifier: specifier.to_owned(),
                    names,
                });
            }
        }
    }
    impl<'a> Visit<'a> for Specifiers {
        fn visit_import_declaration(&mut self, it: &ImportDeclaration<'a>) {
            let names = (it.specifiers.iter().flatten())
                .map(|specifier| specifier.local().name.as_str().to_owned())
                .collect();
            self.push(&it.source, names);
        }

        fn visit_export_from_declaration(&mut self, it: &ExportFromDeclaration<'a>) {
            self.push(&it.source, Vec::new());
        }

        fn visit_export_all_declaration(&mut self, it: &ExportAllDeclaration<'a>) {
            self.push(&it.source, Vec::new());
        }

        fn visit_import_expression(&mut self, it: &ImportExpression<'a>) {
            if let Expression::StringLiteral(source) = &it.source {
                self.push(source, Vec::new());
            }
            walk::walk_import_expression(self, it);
        }
    }
    let mut found = Specifiers(Vec::new());
    for script in [&component.instance, &component.module]
        .into_iter()
        .flatten()
    {
        found.visit_program(component.javascript.get_program(script.program));
    }
    found.0
}

fn env_of(
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<&Arc<TypeScriptEnv>, Diagnostic> {
    env.ok_or("svelte.check needs the svelte package")
        .and_then(|env| env.as_ref().map_err(String::as_str))
        .map_err(|why| Diagnostic::error("check_unconfigured", why, Span::new(0, 0)))
}

mod directive;
mod script_syntax;

#[cfg(test)]
mod tests;
