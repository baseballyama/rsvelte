use rsvelte_kernel::source::positions::Span;

use super::import_references;
use crate::{SyntaxTree, parser, scope};

/// Each use as `(text of the node, export, whether it is called)`, in source order.
fn uses(source: &str, exports: &[&'static str]) -> Vec<(String, &'static str, bool)> {
    let mut tree = SyntaxTree::new();
    let program =
        parser::parse_program(&mut tree, source, Span::new(0, source.len() as u32), false)
            .expect("parses");
    let sem = scope::analyze(&tree, program, &[]);
    let parents = tree.parents();
    let mut out: Vec<_> = import_references(
        &tree,
        &sem,
        &parents,
        source,
        &[program],
        "svelte/store",
        exports,
    )
    .into_iter()
    .map(|reference| {
        let span = tree.source_location(reference.node).span().expect("parsed");
        (span, reference.export, reference.call.is_some())
    })
    .collect();
    out.sort_by_key(|(span, ..)| span.start_offset);
    out.into_iter()
        .map(|(span, export, call)| (span.text(source).to_owned(), export, call))
        .collect()
}

#[test]
fn named_default_and_namespace_imports_are_followed() {
    let source = "import { writable as w, readable } from 'svelte/store';\n\
                  import store, * as ns from 'svelte/store';\n\
                  import { writable } from './other';\n\
                  w(1); readable; ns.derived(); ns['writable']; ns.other; store.x; writable();";
    assert_eq!(
        uses(source, &["writable", "readable", "derived", "default"]),
        [
            ("w".to_owned(), "writable", true),
            ("readable".to_owned(), "readable", false),
            ("ns.derived".to_owned(), "derived", true),
            ("ns['writable']".to_owned(), "writable", false),
            ("store".to_owned(), "default", false),
        ]
    );
}

#[test]
fn aliases_are_followed_and_cycles_end() {
    let source = "import { writable } from 'svelte/store';\n\
                  import * as ns from 'svelte/store';\n\
                  const a = writable; a();\n\
                  const { derived: d } = ns; d();\n\
                  let x = y; let y = x;";
    assert_eq!(
        uses(source, &["writable", "derived"]),
        [
            ("writable".to_owned(), "writable", false),
            ("a".to_owned(), "writable", true),
            ("d".to_owned(), "derived", true),
        ]
    );
}

#[test]
fn a_shadowing_binding_is_not_the_import() {
    let source = "import { writable } from 'svelte/store';\n\
                  function f(writable) { writable(); }\n\
                  writable();";
    assert_eq!(
        uses(source, &["writable"]),
        [("writable".to_owned(), "writable", true)]
    );
}
