use std::sync::Arc;

use oxc_ast::ast::Statement;
use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Diagnostic;
use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;
use rsvelte_svelte_semantic::Resolved;
use rsvelte_svelte_syntax::Parsed;
use rsvelte_svelte_syntax::syntax_tree::{
    AttributeKind, AttributeValue, Component, Part, TemplateNode,
};
use rsvelte_svelte_typescript_projection::{Printed, THROWN, checked_as_typescript, store_reads};
use rsvelte_typescript_check::{
    Check, Documents, Hidden, Import, MappedLanguage, MappedLanguages, TypeScriptDocument,
    TypeScriptEnv, TypeScriptStandIn, TypeScriptView,
};

use crate::Configuration;

pub static PLUGIN: Plugin = Plugin {
    identifier: "svelte.check",
    version: env!("CARGO_PKG_VERSION"),
    dependencies: &[
        Dependency {
            identifier: "svelte.typescript_projection",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
        Dependency {
            identifier: "typescript.check",
            requirement: concat!("=", env!("CARGO_PKG_VERSION")),
        },
    ],
};

pub fn register(reg: &mut Registry, config: &Configuration) {
    reg.plugin(&PLUGIN);
    rsvelte_typescript_check::register_service(reg);
    rsvelte_svelte_typescript_projection::register_artifacts(reg);
    reg.finish_task(Check {
        identifier: "svelte.check/default",
        documents: Documents::Matching(rsvelte_svelte_syntax::matches),
        tsc: config.check.as_ref().map(|c| c.tsc.clone()),
        stand_in: Some(rsvelte_svelte_typescript_projection::STAND_IN),
        imported: Some(is_script),
    });
    if let Some(check) = &config.check {
        reg.contribute::<MappedLanguages>(MappedLanguage {
            extension: ".svelte",
            content_mapper: check.content_mapper.clone(),
        });
    }
    let env = config
        .check
        .as_ref()
        .map(|c| typescript_env(&c.svelte, &c.content_mapper).map(Arc::new));
    reg.provide::<TypeScriptView>("svelte", rsvelte_svelte_syntax::matches, move |context| {
        typescript_view(context, env.as_ref())
    });
    reg.provide::<TypeScriptStandIn>("svelte", rsvelte_svelte_syntax::matches, |context| {
        // svelte-check reads a component svelte2tsx throws on as its bare script, which declares
        // globals for the whole project when it neither imports nor exports.
        if let Some(Ok(TypeScriptDocument::Rejected { .. })) = context.facet::<TypeScriptView>() {
            return Some(bare_script(&context.document.text));
        }
        let own = context.get::<Parsed>().as_ref().ok().and_then(|component| {
            rsvelte_svelte_typescript_projection::stand_in(component, &context.document.text)
        });
        Some(own.unwrap_or_else(|| rsvelte_svelte_typescript_projection::STAND_IN.to_owned()))
    });
}

/// svelte-check's text of a component svelte2tsx throws on: its instance script, else its module
/// script.
fn bare_script(source_text: &str) -> String {
    rsvelte_svelte_syntax::parse::parse_without_scripts(source_text)
        .ok()
        .and_then(|component| {
            let script = component.instance.as_ref().or(component.module.as_ref())?;
            Some(script.content.text(source_text).to_owned())
        })
        .unwrap_or_default()
}

/// A script a component may import, such as a `.svelte.ts` module.
fn is_script(document: &rsvelte_kernel::source::document::Document) -> bool {
    [".ts", ".mts", ".cts", ".js", ".mjs", ".cjs"]
        .iter()
        .any(|extension| document.path.ends_with(extension))
}

/// What svelte-check adds to the project: its shims, the svelte package's types, and the element
/// types from the package's `svelte-html.d.ts`, or from svelte2tsx's JSX shim without one.
fn typescript_env(
    svelte: &std::path::Path,
    content_mapper: &std::path::Path,
) -> Result<TypeScriptEnv, String> {
    let types = svelte.join("types/index.d.ts");
    let text = std::fs::read_to_string(&types).map_err(|e| format!("{}: {e}", types.display()))?;
    let element_types = svelte.join("svelte-html.d.ts");
    let (declarations, include) = if element_types.is_file() {
        (
            rsvelte_svelte_typescript_projection::SHIMS,
            vec![types.clone(), element_types],
        )
    } else {
        (
            rsvelte_svelte_typescript_projection::DECLARATIONS,
            vec![types.clone()],
        )
    };
    Ok(TypeScriptEnv {
        mapped_extension: Some(".svelte"),
        content_mapper: Some(content_mapper.to_owned()),
        declarations: vec![declarations],
        include,
        paths: package_modules(&text, &types)
            .chain([("svelte/elements".to_owned(), svelte.join("elements.d.ts"))])
            .collect(),
        replaced: vec![(types, without_any_component_module(text))],
        script_modules: vec![".svelte"],
        notes: vec![(
            1184,
            "If this is a declare statement, move it into <script context=\"module\">..</script>",
        )],
    })
}

/// Each module the package's types declare, such as `svelte/store`, read from the blanked types: a
/// module the checker found through `node_modules` would read the package's own file, whose
/// `declare module '*.svelte'` stays.
fn package_modules<'t>(
    text: &'t str,
    types: &'t std::path::Path,
) -> impl Iterator<Item = (String, std::path::PathBuf)> + 't {
    text.split("declare module '")
        .skip(1)
        .filter_map(|rest| rest.split_once('\'').map(|(name, _)| name))
        .filter(|name| *name == "svelte" || name.starts_with("svelte/"))
        .map(|name| (name.to_owned(), types.to_owned()))
}

/// svelte-check blanks the svelte package's `declare module '*.svelte'`, so an import of a
/// component that does not exist is an error instead of a component of any props.
fn without_any_component_module(mut types: String) -> String {
    let Some(start) = types.find("declare module '*.svelte' {") else {
        return types;
    };
    let end = types[start + 1..]
        .find("\n}")
        .map_or(types.len(), |at| start + 1 + at + 2);
    types.replace_range(start..end, &" ".repeat(end - start));
    types
}

fn typescript_view(
    context: &DocumentContext<'_>,
    env: Option<&Result<Arc<TypeScriptEnv>, String>>,
) -> Result<TypeScriptDocument, Diagnostic> {
    // svelte-check type-checks a component whose style sheet does not parse.
    let component = match context.get::<Parsed>() {
        Ok(component) => component,
        Err(error) => {
            if let Some(document) = script_syntax::view(&context.document.text, || env_of(env)) {
                return document;
            }
            // svelte2tsx throws Svelte's parse error, which svelte-check reports as it is.
            return Ok(rejected(error));
        }
    };
    // Svelte's parser also rejects the template's JavaScript; svelte2tsx blanks the scripts first.
    if let Some(error) = rsvelte_svelte_semantic::javascript_error(context)
        && !rsvelte_svelte_syntax::parse::in_script_content(
            &context.document.text,
            error.span.start_offset,
        )
    {
        return Ok(rejected(&error));
    }
    // svelte-check reads the component as TypeScript when either script is, else as JavaScript.
    let typescript = checked_as_typescript(component, &context.document.text);
    let projection = match context.get::<Printed>() {
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
        || Emitter {
            out: projection.out.clone(),
            mappings: projection.mappings.clone(),
            atoms: projection.atoms.clone(),
        },
        |line| directive::prepended(line, projection),
    );
    Ok(TypeScriptDocument::Checked {
        projection,
        map_back: Emitter::lookup_span,
        env: Arc::clone(env),
        extension: if typescript { ".ts" } else { ".js" },
        imports: relative_imports(component),
        store_reads: context
            .get::<Resolved>()
            .as_ref()
            .map(store_reads)
            .unwrap_or_default(),
        hidden: hidden(component, &context.document.text),
        drops_unmapped: false,
    })
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

/// Each relative module specifier the scripts import or re-export from, by its string literal.
fn relative_imports(component: &Component) -> Vec<Import> {
    let mut found = Vec::new();
    for script in [&component.instance, &component.module]
        .into_iter()
        .flatten()
    {
        let program = component.javascript.get_program(script.program);
        for statement in &program.body {
            let (source, names) = match statement {
                Statement::ImportDeclaration(import) => (
                    &import.source,
                    (import.specifiers.iter().flatten())
                        .map(|specifier| specifier.local().name.as_str().to_owned())
                        .collect(),
                ),
                Statement::ExportFromDeclaration(export) => (&export.source, Vec::new()),
                Statement::ExportAllDeclaration(export) => (&export.source, Vec::new()),
                _ => continue,
            };
            // A specifier with a lone surrogate names no file.
            let Some(specifier) = source.value.as_str().filter(|s| s.starts_with('.')) else {
                continue;
            };
            found.push(Import {
                at: Span::new(source.span.start, source.span.end),
                specifier: specifier.to_owned(),
                names,
            });
        }
    }
    found
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
