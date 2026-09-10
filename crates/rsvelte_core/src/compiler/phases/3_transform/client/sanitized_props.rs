//! Upstream's `Identifier.js` opens with `if (node.name === '$$props') return
//! b.id('$$sanitized_props')`, and `is_reference` is true in binding positions
//! too — so a *declaration* named `$$props` is renamed just like a read, while a
//! member property, an object key, a class member name and a label are not.
//!
//! In runes mode `$$props` can only be a name the user declared, while the
//! generated prop reads (`$$props.x`, `$.prop($$props, …)`) must keep the raw
//! name — so there the rename runs on the *source*, before generation, which is
//! the order upstream applies it in.
//!
//! In legacy mode it cannot: fourteen builder sites emit a bare `$$props` into
//! the instance script *after* generation (`$.deep_read_state($$props)`, the
//! `$.legacy_pre_effect` dependency arrays, the event and `use:` argument lists)
//! and every one of them means the sanitized object. Renaming the source alone
//! leaves those behind — measured at 226 corpus units that stop matching the
//! oracle. So the legacy rename runs on the generated script and keeps the
//! allow-list for the three calls that really do take the unsanitized object.

use oxc_ast::ast::{
    AssignmentTargetPropertyIdentifier, BindingIdentifier, BindingProperty, IdentifierReference,
    ObjectProperty,
};
use oxc_ast_visit::Visit;
use oxc_span::GetSpan;

const NEEDLE: &str = "$$props";
const RENAMED: &str = "$$sanitized_props";

/// The builder-made calls that take the *unsanitized* props object as their
/// first argument. They are `IdentifierReference`s like any other, so the AST
/// cannot tell them from a source read — only the callee in front of them can.
const GENERATED: [&str; 3] = ["$.prop(", "$.bind_prop(", "$.legacy_rest_props("];

/// What `rename_dollar_props` did. `Unchanged` and `Unavailable` both leave the
/// text alone and mean opposite things to a caller: the first says the AST was
/// read and holds no `$$props` reference, the second that it could not be read —
/// and only the second may fall back to a rule that answers by bytes.
pub(super) enum Rename {
    Unavailable,
    Unchanged,
    Rewritten(String),
}

/// Rewrite every `$$props` identifier the script declares or reads to
/// `$$sanitized_props`. `protect_generated` excludes the three builder-made
/// calls above, and is what a caller running on generated text needs.
pub(super) fn rename_dollar_props(source: &str, protect_generated: bool) -> Rename {
    if memchr::memmem::find(source.as_bytes(), NEEDLE.as_bytes()).is_none() {
        return Rename::Unchanged;
    }
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, source, oxc_span::SourceType::mjs()).parse();
    if ret.fatal_error || !ret.diagnostics.is_empty() {
        return Rename::Unavailable;
    }

    let mut collector = Collector { edits: Vec::new() };
    collector.visit_program(&ret.program);
    // A shorthand's key and value share a span, so the property visitor and the
    // identifier visitor both report it; the expansion is the wider answer.
    collector
        .edits
        .sort_unstable_by_key(|(start, expand)| (*start, std::cmp::Reverse(*expand)));
    collector.edits.dedup_by_key(|(start, _)| *start);
    if protect_generated {
        collector.edits.retain(|(start, _)| {
            !GENERATED
                .iter()
                .any(|g| source[..*start as usize].ends_with(g))
        });
    }
    if collector.edits.is_empty() {
        return Rename::Unchanged;
    }

    let mut out = String::with_capacity(source.len() + collector.edits.len() * RENAMED.len());
    let mut cursor = 0usize;
    for (start, expand) in collector.edits {
        let start = start as usize;
        if start < cursor {
            continue;
        }
        out.push_str(&source[cursor..start]);
        if expand {
            // `{ $$props }` is `{ $$props: $$sanitized_props }` once the value is
            // renamed and the key — an `IdentifierName` — is not.
            out.push_str(NEEDLE);
            out.push_str(": ");
        }
        out.push_str(RENAMED);
        cursor = start + NEEDLE.len();
    }
    out.push_str(&source[cursor..]);
    Rename::Rewritten(out)
}

/// Start offsets of the `$$props` identifiers that are references or bindings,
/// each flagged with whether it is a shorthand property that has to be expanded
/// rather than replaced. A member property (`o.$$props`), a non-shorthand object
/// key, a class member name and a label are `IdentifierName`s or
/// `LabelIdentifier`s, which this visitor never sees — the same nodes upstream's
/// `is_reference` answers `false` for.
struct Collector {
    edits: Vec<(u32, bool)>,
}

impl<'a> Visit<'a> for Collector {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        if it.name == NEEDLE {
            self.edits.push((it.span.start, false));
        }
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        if it.name == NEEDLE {
            self.edits.push((it.span.start, false));
        }
    }

    fn visit_object_property(&mut self, it: &ObjectProperty<'a>) {
        if it.shorthand && it.key.static_name().as_deref() == Some(NEEDLE) {
            self.edits.push((it.key.span().start, true));
        }
        oxc_ast_visit::walk::walk_object_property(self, it);
    }

    fn visit_binding_property(&mut self, it: &BindingProperty<'a>) {
        if it.shorthand && it.key.static_name().as_deref() == Some(NEEDLE) {
            self.edits.push((it.key.span().start, true));
        }
        oxc_ast_visit::walk::walk_binding_property(self, it);
    }

    fn visit_assignment_target_property_identifier(
        &mut self,
        it: &AssignmentTargetPropertyIdentifier<'a>,
    ) {
        if it.binding.name == NEEDLE {
            self.edits.push((it.binding.span.start, true));
        }
        oxc_ast_visit::walk::walk_assignment_target_property_identifier(self, it);
    }
}
