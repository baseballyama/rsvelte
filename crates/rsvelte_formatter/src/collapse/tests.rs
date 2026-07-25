use super::*;
use rsvelte_core::ast::template::{FragmentMetadata, FragmentType, Text};

#[test]
fn pre_content_flag_is_restored_after_a_panic() {
    let caught = std::panic::catch_unwind(|| with_pre_content(|| panic!("boom")));
    assert!(caught.is_err());
    assert!(!in_pre_content());
}

#[test]
fn collapse_candidate_gate_predicate() {
    let has = |src: &str| {
        let root = parse_formatted(src).expect("snippet should parse");
        fragment_has_collapse_candidate(&root.fragment)
    };
    // Positive — a collapse pass could reflow these.
    assert!(has("<p>hello</p>"), "pure-text element");
    assert!(has("<span>{x}</span>"), "interpolation element");
    assert!(
        has("<button aria-label=\"x\"><span></span></button>"),
        "attrs + element child (children-port wrapped-open-tag shape)"
    );
    assert!(has("<div><p>hi</p></div>"), "nested pure-text element");
    // Candidate nested under a `<svelte:*>` / `<slot>` container must be
    // seen through the generic recursion (regression: child_fragments once
    // dropped these variants, so the gate wrongly skipped collapse).
    assert!(
        has("<svelte:head><title>Hello</title></svelte:head>"),
        "pure-text element under svelte:head"
    );
    assert!(
        has("<slot><span>hi</span></slot>"),
        "pure-text element under slot"
    );
    // Negative — provably nothing to collapse, safe to skip.
    assert!(
        !has("<div><span></span></div>"),
        "element child but no attrs"
    );
    assert!(!has("<div></div>"), "empty element");
    assert!(!has("<script>let x = 1;</script>"), "no markup");
}

#[test]
fn collapse_runs_for_candidate_under_svelte_head_and_slot() {
    // Regression: when the ONLY collapse candidate is nested under a
    // `<svelte:*>` / `<slot>` container, the gate must NOT skip collapse.
    // Before the child_fragments fix the gate skipped and left these
    // multi-line. Assert the pure-text element collapses to one line.
    let head = crate::format(
        "<svelte:head>\n\t<title>\n\t\tHello\n\t</title>\n</svelte:head>\n",
        &FormatOptions::default(),
    )
    .unwrap();
    assert!(
        !head.contains("<title>\n") && head.contains("Hello"),
        "title under svelte:head should collapse to one line:\n{head}"
    );
    let slot = crate::format(
        "<slot>\n\t<span>\n\t\thi\n\t</span>\n</slot>\n",
        &FormatOptions::default(),
    )
    .unwrap();
    assert!(
        !slot.contains("<span>\n") && slot.contains("hi"),
        "span under slot should collapse to one line:\n{slot}"
    );
}

fn make_fragment_with_text(data: &str) -> Fragment<'_> {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: vec![TemplateNode::Text(Text {
            start: 0,
            end: data.len() as u32,
            raw: data.into(),
            data: data.into(),
        })],
        metadata: FragmentMetadata::default(),
    }
}

fn make_empty_fragment<'a>() -> Fragment<'a> {
    Fragment {
        node_type: FragmentType::Fragment,
        nodes: vec![],
        metadata: FragmentMetadata::default(),
    }
}

fn make_text_node(data: &str, start: u32) -> TemplateNode<'_> {
    TemplateNode::Text(Text {
        start,
        end: start + data.len() as u32,
        raw: data.into(),
        data: data.into(),
    })
}

fn make_element_node(name: &str) -> TemplateNode<'_> {
    use rsvelte_core::ast::template::{RegularElement, RegularElementMetadata};
    TemplateNode::RegularElement(Box::new(RegularElement {
        start: 0,
        end: 0,
        name: name.into(),
        name_loc: None,
        attributes: vec![],
        fragment: make_empty_fragment(),
        metadata: RegularElementMetadata::default(),
    }))
}

#[test]
fn orig_text_map_uses_original_text_when_structure_matches() {
    // Same element name in both lists → the following text node is mapped to
    // its pre-collapse source (whitespace-faithful).
    let orig_out = "<span></span> original words here";
    let inter = vec![make_element_node("span"), make_text_node("\nx", 13)];
    let orig = vec![make_element_node("span"), make_text_node(" original", 13)];
    let mut map = std::collections::HashMap::new();
    build_orig_text_map(&inter, orig_out, &orig, &mut map);
    assert_eq!(map.get(&13).map(String::as_str), Some(" original"));
}

#[test]
fn orig_text_map_falls_back_on_structural_divergence() {
    // The non-text nodes disagree (span vs div), so the whole fragment is
    // skipped and the text is left unmapped (falls back to intermediate).
    let orig_out = "<div></div> original words here";
    let inter = vec![make_element_node("span"), make_text_node("\nx", 13)];
    let orig = vec![make_element_node("div"), make_text_node(" original", 13)];
    let mut map = std::collections::HashMap::new();
    build_orig_text_map(&inter, orig_out, &orig, &mut map);
    assert!(map.is_empty(), "divergent structure must not map any text");
}

#[test]
fn apply_edits_skips_overlapping_edit_without_panicking() {
    // A whole-element edit (0..10) plus a nested child edit (3..6) that it
    // contains. Processed high→low, the child would replace_range on bytes
    // already shifted by the outer edit — corrupting output or panicking.
    // The guard keeps the first (higher-start) edit and drops the overlap.
    let out = apply_edits(
        "0123456789",
        vec![(0, 10, "OUTER".to_string()), (3, 6, "X".to_string())],
    );
    // Child (3..6) applies first, then the overlapping outer (0..10) is
    // skipped — no panic, no corruption.
    assert_eq!(out, "012X6789");
}

#[test]
fn apply_edits_applies_disjoint_edits() {
    let out = apply_edits(
        "0123456789",
        vec![(0, 2, "A".to_string()), (8, 10, "B".to_string())],
    );
    assert_eq!(out, "A234567B");
}

#[test]
fn fragment_has_prose_word_with_text() {
    let fragment = make_fragment_with_text("hello world");
    assert!(fragment_has_prose_word(&fragment));
}

#[test]
fn fragment_has_prose_word_empty_text() {
    // Whitespace-only text node has no prose word
    let fragment = make_fragment_with_text("   ");
    assert!(!fragment_has_prose_word(&fragment));
}

#[test]
fn fragment_has_prose_word_empty_fragment() {
    let fragment = make_empty_fragment();
    assert!(!fragment_has_prose_word(&fragment));
}

#[test]
fn text_after_self_closing_tag_is_not_first_child() {
    // A text node after a self-closing sibling (`<Code … />`) is not the
    // parent's first child, so prettier does not trim its leading linebreak —
    // `splitTextToDocs` keeps the leading hardline (the inverted, last-word-
    // overflow-tolerant fill). The gate must recognise the `/>` prefix.
    let out = "<Code />\nThen add";
    assert!(text_preceded_by_close_tag(out, 8));
}

#[test]
fn text_after_close_tag_is_not_first_child() {
    let out = "</code>\ntext";
    assert!(text_preceded_by_close_tag(out, 7));
}

#[test]
fn text_after_open_tag_is_first_child() {
    // First child of `<p>` — prettier trims the leading whitespace, so this
    // must NOT take the inverted-fill (Case B) path.
    let out = "<p>\ntext";
    assert!(!text_preceded_by_close_tag(out, 3));
}

#[test]
fn is_block_display_standard_elements() {
    assert!(is_block_display("div"));
    assert!(is_block_display("p"));
    assert!(is_block_display("ul"));
    assert!(is_block_display("h1"));
    assert!(is_block_display("section"));
}

#[test]
fn is_block_display_excludes_script_style() {
    // script/style are whitespace-preserving in collapse pass, not block-display
    assert!(!is_block_display("script"));
    assert!(!is_block_display("style"));
}

#[test]
fn is_block_display_excludes_inline_elements() {
    assert!(!is_block_display("span"));
    assert!(!is_block_display("a"));
    assert!(!is_block_display("strong"));
}

#[test]
fn hug_close_tag_width_drives_inner_component_break() {
    use crate::doc::{Doc, print};

    // Mirrors build_self_closing_component_doc's structure for
    // `<Icon data={TrashIcon} class="text-surface-content/50" />`.
    let icon = || {
        Doc::Group(vec![
            Doc::Text("<Icon".to_string()),
            Doc::Indent(vec![Doc::Group(vec![
                Doc::Line,
                Doc::Text("data={TrashIcon}".to_string()),
                Doc::Line,
                Doc::Text("class=\"text-surface-content/50\"".to_string()),
                Doc::Dedent(vec![Doc::Line]),
            ])]),
            Doc::Text("/>".to_string()),
        ])
    };
    let body = || Doc::Concat(vec![Doc::Text("Clear ".to_string()), icon()]);

    // Body alone from col 15 ends at 78 <= 80: the Icon must stay flat.
    let a = print(&body(), 80, "  ", 7, 15);
    assert_eq!(
        a,
        "Clear <Icon data={TrashIcon} class=\"text-surface-content/50\" />"
    );

    // With the close tag inside the measured group (prettier's
    // group(['>', body, '</tag'])) the same body overflows (86 > 80), so the
    // fits lookahead must break the Icon's attributes.
    let measured = Doc::Group(vec![
        Doc::Text(">".to_string()),
        body(),
        Doc::Text("</button".to_string()),
    ]);
    let b = print(&measured, 80, "  ", 7, 14);
    let expected = "\
>Clear <Icon
                data={TrashIcon}
                class=\"text-surface-content/50\"
              /></button";
    assert_eq!(b, expected);
}
