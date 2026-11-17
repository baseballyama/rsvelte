use std::borrow::Cow;

use super::{collapse, collapse_text};

#[test]
fn collapse_text_matches_collapsing_data_and_raw_apart() {
    let source = "  a  b \n\t c \n ";
    let ends = [None, Some(""), Some(" ")];
    for (start, end) in [
        (0, source.len()),
        (2, 9),
        (0, 2),
        (5, 7),
        (14, source.len()),
    ] {
        let text = &source[start..end];
        for lead in ends {
            for trail in ends {
                let expected = collapse(Cow::Borrowed(text), lead, trail);
                let (mut data, mut raw) = (Cow::Borrowed(text), Cow::Borrowed(text));
                collapse_text(&mut data, &mut raw, lead, trail);
                assert_eq!(
                    (&data, &raw),
                    (&expected, &expected),
                    "{text:?} {lead:?} {trail:?}"
                );
                let (mut data, mut raw) = (Cow::Borrowed(text), Cow::Owned(format!("{text}x")));
                collapse_text(&mut data, &mut raw, lead, trail);
                let other = collapse(Cow::Owned(format!("{text}x")), lead, trail);
                assert_eq!(
                    (&data, &raw),
                    (&expected, &other),
                    "{text:?} {lead:?} {trail:?}"
                );
            }
        }
    }
}
