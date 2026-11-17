use rsvelte_kernel::source::positions::Span;

use super::{Text, collapse, collapse_text};

#[test]
fn collapse_text_matches_collapsing_data_and_raw_apart() {
    let source = "  a  b \n\t c \n ";
    let component = rsvelte_svelte_syntax::parse::parse("").expect("parses");
    let tree = rsvelte_svelte_semantic::compiler_syntax_tree::lower(&component, "");
    let document = (source, &tree);
    let ends = [None, Some(""), Some(" ")];
    for (start, end) in [(0, 14), (2, 9), (0, 2), (5, 7), (12, 14), (14, 14)] {
        let range = Text::Source(Span::new(start, end));
        let other = Text::Owned(format!("{}x", range.get(source, &tree)).into());
        for lead in ends {
            for trail in ends {
                let expected = collapse(&mut range.clone(), lead, trail, document);
                let expected_other = collapse(&mut other.clone(), lead, trail, document);
                let (mut data, mut raw) = (range.clone(), range.clone());
                collapse_text(&mut data, &mut raw, lead, trail, document);
                assert_eq!(
                    (&data, &raw),
                    (&expected, &expected),
                    "{range:?} {lead:?} {trail:?}"
                );
                let (mut data, mut raw) = (range.clone(), other.clone());
                collapse_text(&mut data, &mut raw, lead, trail, document);
                assert_eq!(
                    (&data, &raw),
                    (&expected, &expected_other),
                    "{range:?} {lead:?} {trail:?}"
                );
            }
        }
    }
}
