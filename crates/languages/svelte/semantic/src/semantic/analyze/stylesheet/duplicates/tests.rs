use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet::syntax_tree::ComplexSelector;

use super::Duplicates;

/// Marks every id in the selector's own numbering, the way matching marks a selector it uses.
fn mark_all(selector: &ComplexSelector, used: &mut dyn FnMut(u32), scoped: &mut dyn FnMut(u32)) {
    used(selector.id);
    for part in &selector.parts {
        scoped(part.id);
        for simple in &part.simple {
            if let rsvelte_stylesheet::syntax_tree::Simple::PseudoClass { selectors, .. } = simple {
                for nested in selectors {
                    mark_all(nested, used, scoped);
                }
            }
        }
    }
}

#[test]
fn an_identical_selector_under_the_same_parent_runs_once_and_takes_its_own_ids() {
    let source = ".b > span{} :is(.x, p) a{} .b > span{} :is(.x, p) a{} .b  > span{} \
                  .c{ .b > span{} } .d{ .b > span{} }";
    let sheet = rsvelte_stylesheet::parse(source, Span::new(0, source.len() as u32))
        .expect("valid style sheet");
    let mut expected_used = vec![false; sheet.selector_count as usize];
    let mut expected_scoped = vec![false; sheet.relative_count as usize];
    rsvelte_stylesheet::scope::visit_selectors(&sheet, |selector| {
        mark_all(
            selector,
            &mut |id| expected_used[id as usize] = true,
            &mut |id| expected_scoped[id as usize] = true,
        );
    });
    let mut used = vec![false; sheet.selector_count as usize];
    let mut scoped = vec![false; sheet.relative_count as usize];
    let mut duplicates = Duplicates::default();
    let mut runs = Vec::new();
    rsvelte_stylesheet::scope::visit_selectors(&sheet, |selector| {
        duplicates.match_once(selector, source, &mut used, &mut scoped, |u, s| {
            runs.push(selector.span.text(source));
            mark_all(selector, u, s);
        });
    });
    assert_eq!(
        runs,
        [
            ".b > span",
            ":is(.x, p) a",
            ".b  > span",
            ".c",
            ".b > span",
            ".d",
            ".b > span"
        ]
    );
    assert_eq!(used, expected_used);
    assert_eq!(scoped, expected_scoped);
}
