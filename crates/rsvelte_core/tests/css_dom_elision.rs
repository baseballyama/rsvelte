use rsvelte_core::{
    CompileOptions, ParseOptions, ast::arena::SerializeArenaGuard,
    compiler::phases::analyze_component, parse,
};

fn analyze(source: &str) -> rsvelte_core::compiler::phases::ComponentAnalysis {
    let mut root = parse(
        source,
        &oxc_allocator::Allocator::default(),
        ParseOptions::default(),
    )
    .expect("parse");
    // SAFETY: `root.arena` outlives the guard and analysis.
    let _arena_guard = unsafe { SerializeArenaGuard::new(&raw const root.arena) };
    analyze_component(&mut root, source, &CompileOptions::default()).expect("analyze")
}

#[test]
fn css_dom_is_not_built_without_a_style_block() {
    let source = "<p>x</p>".repeat(2048);
    let analysis = analyze(&source);
    assert!(!analysis.css.has_css);
    assert!(analysis.css.dom_structure.elements.is_empty());
}

#[test]
fn css_dom_and_siblings_are_built_when_styles_exist() {
    let analysis =
        analyze("<p class=\"a\"></p><p class=\"b\"></p><style>.a + .b{color:red}</style>");
    assert!(analysis.css.has_css);
    assert_eq!(analysis.css.dom_structure.elements.len(), 2);
    assert_eq!(
        analysis.css.dom_structure.elements[0]
            .possible_next_adjacent
            .len(),
        1
    );
}

#[test]
fn sibling_relations_are_not_built_for_unrelated_css() {
    let analysis = analyze("<p></p><p></p><style>p{color:red}</style>");
    assert_eq!(analysis.css.dom_structure.elements.len(), 2);
    assert!(
        analysis.css.dom_structure.elements[0]
            .possible_next_adjacent
            .is_empty()
    );
    assert!(
        analysis.css.dom_structure.elements[0]
            .possible_next_general
            .is_empty()
    );
}

#[test]
fn static_general_siblings_are_stored_as_links() {
    let element_count = 128;
    let mut source = "<p></p>".repeat(element_count);
    source.push_str("<style>p ~ p{color:red}</style>");

    let analysis = analyze(&source);
    let dom = &analysis.css.dom_structure;
    assert!(dom.general_siblings_linked);
    assert_eq!(dom.elements.len(), element_count);
    assert_eq!(
        dom.elements
            .iter()
            .map(|element| element.possible_prev_general.len())
            .sum::<usize>(),
        element_count - 1
    );
    assert_eq!(
        dom.elements
            .iter()
            .map(|element| element.possible_next_general.len())
            .sum::<usize>(),
        element_count - 1
    );
}
