//! Parse-time validations rsvelte must run itself.
//!
//! Official svelte2tsx parses with svelte, whose parser rejects these; rsvelte's
//! parser defers them to phase-2 analysis, which svelte2tsx never runs — so they
//! are replicated here for error-parity.

use crate::ast::template::Root;

use super::svelte2tsx::slice_src;
use super::utils::error::Svelte2TsxError;

/// Validate that every `{@debug …}` argument is a plain identifier, returning a
/// template error otherwise — mirrors svelte's parse-time check (rsvelte's lives
/// in the analyze `DebugTag` visitor, which svelte2tsx doesn't run).
pub fn validate_debug_tag_arguments(ast: &Root, source: &str) -> Result<(), Svelte2TsxError> {
    use crate::ast::template::{Fragment, TemplateNode as N};

    fn arg_is_identifier(expr: &crate::ast::js::Expression, source: &str) -> bool {
        match expr.node_type() {
            Some("Identifier") => true,
            Some(_) => false,
            // Lazy/unresolved expression: accept only a bare identifier token.
            None => match (expr.start(), expr.end()) {
                (Some(s), Some(e))
                    if (s as usize) < (e as usize) && (e as usize) <= source.len() =>
                {
                    let t = slice_src(source, s as usize, e as usize).trim();
                    let mut chars = t.chars();
                    match chars.next() {
                        Some(c0) if c0.is_alphabetic() || c0 == '_' || c0 == '$' => {
                            chars.all(|c| c.is_alphanumeric() || c == '_' || c == '$')
                        }
                        _ => false,
                    }
                }
                _ => false,
            },
        }
    }

    fn check_fragment(frag: &Fragment, source: &str) -> Result<(), Svelte2TsxError> {
        for node in &frag.nodes {
            check_node(node, source)?;
        }
        Ok(())
    }

    fn check_node(node: &N, source: &str) -> Result<(), Svelte2TsxError> {
        match node {
            N::DebugTag(tag) => {
                for id in &tag.identifiers {
                    if !arg_is_identifier(id, source) {
                        return Err(Svelte2TsxError::Template(
                            "{@debug ...} arguments must be identifiers, not arbitrary expressions"
                                .to_string(),
                        ));
                    }
                }
            }
            N::RegularElement(e) => check_fragment(&e.fragment, source)?,
            N::Component(c) => check_fragment(&c.fragment, source)?,
            N::SvelteComponent(c) => check_fragment(&c.fragment, source)?,
            N::SvelteElement(e) => check_fragment(&e.fragment, source)?,
            N::SvelteHead(e)
            | N::SvelteFragment(e)
            | N::SvelteBody(e)
            | N::SvelteWindow(e)
            | N::SvelteDocument(e)
            | N::SvelteBoundary(e)
            | N::SvelteOptions(e)
            | N::SvelteSelf(e) => check_fragment(&e.fragment, source)?,
            N::TitleElement(e) => check_fragment(&e.fragment, source)?,
            N::SlotElement(e) => check_fragment(&e.fragment, source)?,
            N::IfBlock(b) => {
                check_fragment(&b.consequent, source)?;
                if let Some(alt) = &b.alternate {
                    check_fragment(alt, source)?;
                }
            }
            N::EachBlock(b) => {
                check_fragment(&b.body, source)?;
                if let Some(fb) = &b.fallback {
                    check_fragment(fb, source)?;
                }
            }
            N::KeyBlock(b) => check_fragment(&b.fragment, source)?,
            N::SnippetBlock(b) => check_fragment(&b.body, source)?,
            N::AwaitBlock(b) => {
                if let Some(f) = &b.pending {
                    check_fragment(f, source)?;
                }
                if let Some(f) = &b.then {
                    check_fragment(f, source)?;
                }
                if let Some(f) = &b.catch {
                    check_fragment(f, source)?;
                }
            }
            _ => {}
        }
        Ok(())
    }

    check_fragment(&ast.fragment, source)
}

/// True when a component carries a `use:` action directive. svelte rejects ALL
/// of `use:`/`transition:`/`animate:`/`class:`/`style:` on a component
/// (`component_invalid_directive`) at 2-analyze, but official **svelte2tsx**
/// skips analyze and actually LOWERS class/style/transition/animate on a
/// component (to `ensureType`/`ensureTransition` suffixes) — only `use:` makes
/// it CRASH (`element.addAction is not a function`). So, for error-parity with
/// svelte2tsx specifically, only `use:` triggers an error here.
fn component_has_invalid_directive(attributes: &[crate::ast::Attribute<'_>]) -> bool {
    use crate::ast::Attribute as A;
    attributes.iter().any(|a| matches!(a, A::UseDirective(_)))
}

/// Validate `<svelte:window/body/document/head/options>` placement and
/// uniqueness, mirroring svelte's PARSE-time `svelte_meta_duplicate` /
/// `svelte_meta_invalid_placement` checks (1-parse/state/element.js). rsvelte's
/// compiler defers these to phase-2 analysis, which svelte2tsx skips — but
/// official svelte2tsx parses with svelte and so rejects these at parse. Each
/// of these five "root-only meta tags" must appear at most once and only as a
/// direct child of the component root (not inside any element or block).
pub fn validate_meta_element_placement(
    ast: &Root<'_>,
    source: &str,
) -> Result<(), Svelte2TsxError> {
    use std::collections::HashSet;

    let mut seen = HashSet::new();
    check_meta_fragment(&ast.fragment, true, &mut seen, source)
}

fn validate_component_directives(
    node: &crate::ast::template::TemplateNode<'_>,
) -> Result<(), Svelte2TsxError> {
    use crate::ast::template::TemplateNode as N;

    let attributes = match node {
        N::Component(component) => &component.attributes,
        N::SvelteComponent(component) => &component.attributes,
        _ => return Ok(()),
    };
    if component_has_invalid_directive(attributes) {
        return Err(Svelte2TsxError::Template(
            "This type of directive is not valid on components".to_string(),
        ));
    }
    Ok(())
}

fn check_meta_fragment(
    fragment: &crate::ast::template::Fragment<'_>,
    root: bool,
    seen: &mut std::collections::HashSet<String>,
    source: &str,
) -> Result<(), Svelte2TsxError> {
    for node in &fragment.nodes {
        check_meta_node(node, root, seen, source)?;
    }
    Ok(())
}

fn check_meta_node(
    node: &crate::ast::template::TemplateNode<'_>,
    root: bool,
    seen: &mut std::collections::HashSet<String>,
    source: &str,
) -> Result<(), Svelte2TsxError> {
    use crate::ast::template::TemplateNode as N;
    if let N::SvelteElement(element) = node
        && match (element.tag.start(), element.tag.end()) {
            (Some(start), Some(end))
                if (start as usize) < (end as usize) && (end as usize) <= source.len() =>
            {
                slice_src(source, start as usize, end as usize)
                    .trim()
                    .is_empty()
            }
            _ => true,
        }
    {
        return Err(Svelte2TsxError::Template(
            "`<svelte:element>` must have a 'this' attribute with a value".to_string(),
        ));
    }
    let name = match node {
        N::SvelteWindow(e)
        | N::SvelteBody(e)
        | N::SvelteDocument(e)
        | N::SvelteHead(e)
        | N::SvelteOptions(e) => Some(e.name.as_str()),
        _ => None,
    };
    if let Some(name) = name {
        if !root {
            return Err(Svelte2TsxError::Template(format!(
                "`<{name}>` tags cannot be inside elements or blocks"
            )));
        }
        if !seen.insert(name.to_string()) {
            return Err(Svelte2TsxError::Template(format!(
                "A component can only have one `<{name}>` element"
            )));
        }
    }
    validate_component_directives(node)?;
    check_meta_children(node, seen, source)
}

fn check_meta_children(
    node: &crate::ast::template::TemplateNode<'_>,
    seen: &mut std::collections::HashSet<String>,
    source: &str,
) -> Result<(), Svelte2TsxError> {
    use crate::ast::template::TemplateNode as N;
    macro_rules! child {
        ($value:expr) => {
            check_meta_fragment(&$value.fragment, false, seen, source)?
        };
    }
    match node {
        N::RegularElement(e) => child!(e),
        N::Component(e) => child!(e),
        N::SvelteComponent(e) => child!(e),
        N::SvelteElement(e) => child!(e),
        N::SvelteHead(e)
        | N::SvelteFragment(e)
        | N::SvelteBody(e)
        | N::SvelteWindow(e)
        | N::SvelteDocument(e)
        | N::SvelteBoundary(e)
        | N::SvelteOptions(e)
        | N::SvelteSelf(e) => child!(e),
        N::TitleElement(e) => child!(e),
        N::SlotElement(e) => child!(e),
        N::IfBlock(b) => {
            check_meta_fragment(&b.consequent, false, seen, source)?;
            if let Some(f) = &b.alternate {
                check_meta_fragment(f, false, seen, source)?;
            }
        }
        N::EachBlock(b) => {
            check_meta_fragment(&b.body, false, seen, source)?;
            if let Some(f) = &b.fallback {
                check_meta_fragment(f, false, seen, source)?;
            }
        }
        N::KeyBlock(b) => check_meta_fragment(&b.fragment, false, seen, source)?,
        N::SnippetBlock(b) => check_meta_fragment(&b.body, false, seen, source)?,
        N::AwaitBlock(b) => {
            for f in [&b.pending, &b.then, &b.catch].into_iter().flatten() {
                check_meta_fragment(f, false, seen, source)?;
            }
        }
        _ => {}
    }
    Ok(())
}
