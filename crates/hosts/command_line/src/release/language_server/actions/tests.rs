use tower_lsp_server::gen_lsp_types::{CodeActionKind, Position, Range};

use super::{includes, overlaps};
use crate::release::language_server::FIX_ALL;

#[test]
fn a_kind_covers_itself_and_its_sub_kinds_only() {
    assert!(includes(&CodeActionKind::SourceFixAll, &FIX_ALL));
    assert!(includes(&CodeActionKind::Source, &FIX_ALL));
    assert!(includes(&FIX_ALL, &FIX_ALL));
    assert!(includes(&CodeActionKind::Empty, &CodeActionKind::QuickFix));
    assert!(!includes(&CodeActionKind::QuickFix, &FIX_ALL));
    assert!(!includes(&CodeActionKind::new("source.fix"), &FIX_ALL));
    assert!(!includes(&FIX_ALL, &CodeActionKind::SourceFixAll));
}

#[test]
fn a_cursor_touches_the_range_it_is_in_or_at_the_end_of() {
    let range =
        |a: (u32, u32), b: (u32, u32)| Range::new(Position::new(a.0, a.1), Position::new(b.0, b.1));
    let problem = range((1, 4), (1, 9));
    assert!(overlaps(range((1, 6), (1, 6)), problem));
    assert!(overlaps(range((1, 9), (1, 9)), problem));
    assert!(overlaps(range((0, 0), (5, 0)), problem));
    assert!(!overlaps(range((1, 10), (1, 10)), problem));
    assert!(!overlaps(range((0, 0), (1, 3)), problem));
}
