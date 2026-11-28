use super::{FoldingKind, FoldingRange, folding_ranges};

fn folded(text: &str) -> Vec<(u32, u32, Option<FoldingKind>)> {
    let component = rsvelte_svelte_syntax::parse::parse(text).expect("parses");
    (folding_ranges(&component, text).into_iter())
        .map(
            |FoldingRange {
                 start_line,
                 end_line,
                 kind,
             }| (start_line, end_line, kind),
        )
        .collect()
}

const COMMENT: Option<FoldingKind> = Some(FoldingKind::Comment);
const REGION: Option<FoldingKind> = Some(FoldingKind::Region);

// Each expectation is what svelte-language-server 0.18.6 answers an editor that folds lines.

#[test]
fn an_element_folds_after_the_elements_in_it_and_up_to_its_end_tag_line() {
    let text = "<div>\n\t<span>\n\t\ta\n\t</span>\n</div>\n";
    assert_eq!(folded(text), [(1, 2, None), (0, 3, None)]);
}

#[test]
fn scripts_styles_and_comments_fold_where_they_are() {
    let text = "<script>\n\tlet a = 1;\n</script>\n\n<!--\n\tnote\n-->\n<p>\n\t{a}\n</p>\n\n\
                <style>\n\tp { color: red; }\n</style>\n";
    assert_eq!(
        folded(text),
        [(0, 1, None), (4, 6, COMMENT), (7, 8, None), (11, 12, None)]
    );
}

#[test]
fn of_two_ranges_on_one_line_the_inner_one_is_kept() {
    assert_eq!(
        folded("<div><span>\n\ta\n</span>\n</div>\n"),
        [(0, 1, None)]
    );
}

#[test]
fn a_region_folds_to_its_end() {
    let text = "<!-- #region one -->\n<div>\n\ta\n</div>\n<!-- #endregion -->\n";
    assert_eq!(folded(text), [(1, 2, None), (0, 4, REGION)]);
}

#[test]
fn the_elements_in_blocks_fold_as_the_elements_around_them() {
    let text = "{#if a}\n\t<ul>\n\t\t<li>\n\t\t\tx\n\t\t</li>\n\t</ul>\n\
                {:else}\n\t<p>\n\t\ty\n\t</p>\n{/if}\n";
    assert_eq!(folded(text), [(2, 3, None), (1, 4, None), (7, 8, None)]);
}

#[test]
fn a_region_left_open_in_an_element_ends_with_it() {
    let text = "<div>\n<!-- #region -->\n<p>\n\tx\n</p>\n</div>\n<!-- #endregion -->\n";
    assert_eq!(folded(text), [(2, 3, None), (0, 4, None)]);
}

#[test]
fn a_self_closing_tag_folds_over_its_attributes() {
    let text = "<input\n\tvalue=\"a\"\n/>\n<Foo>\n\t<Bar\n\t\tb\n\t/>\n</Foo>\n";
    assert_eq!(folded(text), [(0, 1, None), (4, 5, None), (3, 6, None)]);
}
