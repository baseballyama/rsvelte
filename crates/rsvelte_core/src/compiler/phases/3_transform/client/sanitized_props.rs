//! Upstream's `Identifier.js` opens with `if (node.name === '$$props') return
//! b.id('$$sanitized_props')`, and `is_reference` is true in binding positions
//! too — so a *declaration* named `$$props` is renamed just like a read.
//!
//! In legacy mode the only `$$props` a component's script can name is the
//! component's own props object, and the client renames it after generation.
//! In runes mode `$$props` can only be a name the user declared, while the
//! generated prop reads (`$$props.x`, `$.prop($$props, …)`) must keep the raw
//! name — so there the rename has to happen on the *source*, before generation,
//! which is also the order upstream applies it in.

use oxc_ast::ast::{BindingIdentifier, IdentifierReference};
use oxc_ast_visit::Visit;

/// Rewrite every `$$props` identifier the script declares or reads to
/// `$$sanitized_props`. Returns `None` when the script names none (the common
/// case) or when it does not parse, in which case the source is left alone.
pub(super) fn rename_dollar_props(source: &str) -> Option<String> {
    memchr::memmem::find(source.as_bytes(), b"$$props")?;
    let allocator = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&allocator, source, oxc_span::SourceType::mjs()).parse();
    if ret.panicked || !ret.diagnostics.is_empty() {
        return None;
    }

    let mut collector = Collector { starts: Vec::new() };
    collector.visit_program(&ret.program);
    if collector.starts.is_empty() {
        return None;
    }
    collector.starts.sort_unstable();
    collector.starts.dedup();

    let mut out = String::with_capacity(source.len() + collector.starts.len() * 10);
    let mut cursor = 0usize;
    for start in collector.starts {
        let start = start as usize;
        if start < cursor {
            continue;
        }
        out.push_str(&source[cursor..start]);
        out.push_str("$$sanitized_props");
        cursor = start + "$$props".len();
    }
    out.push_str(&source[cursor..]);
    Some(out)
}

/// Start offsets of the `$$props` identifiers that are references or bindings.
/// A member property (`o.$$props`) and a non-shorthand object key are
/// `IdentifierName`s, which this visitor never sees — the same nodes upstream's
/// `is_reference` answers `false` for.
struct Collector {
    starts: Vec<u32>,
}

impl<'a> Visit<'a> for Collector {
    fn visit_identifier_reference(&mut self, it: &IdentifierReference<'a>) {
        if it.name == "$$props" {
            self.starts.push(it.span.start);
        }
    }

    fn visit_binding_identifier(&mut self, it: &BindingIdentifier<'a>) {
        if it.name == "$$props" {
            self.starts.push(it.span.start);
        }
    }
}
