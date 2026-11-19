use rsvelte_kernel::output::emitter::Emitter;
use rsvelte_kernel::source::positions::Span;

use super::annotated;
use crate::Annotations;

#[test]
fn an_annotation_maps_to_the_character_it_goes_before_and_the_rest_is_copied() {
    let source = "f(a) {}\n";
    let annotations = Annotations {
        inserted: vec![
            (3, ": A".to_owned()),
            (3, " & B".to_owned()),
            (5, "/**/".to_owned()),
        ],
        inserted_finding: |_, message| Some(message),
    };
    let projection = annotated(source, Some(&annotations));
    assert_eq!(projection.out, "f(a: A & B) /**/{}\n");
    let originals: Vec<_> = projection.atoms.iter().map(|a| a.original).collect();
    assert_eq!(
        originals,
        [Span::new(3, 4), Span::new(3, 4), Span::new(5, 6)]
    );
    // `a` is still `a`, and `{}` after the inserted text.
    assert_eq!(
        Emitter::lookup_overlap(&projection, Span::new(2, 3)),
        Some(Span::new(2, 3))
    );
    assert_eq!(
        Emitter::lookup_overlap(&projection, Span::new(16, 18)),
        Some(Span::new(5, 7))
    );
}

#[test]
fn without_annotations_the_source_is_copied_whole() {
    let projection = annotated("let a = 1;\n", None);
    assert_eq!(projection.out, "let a = 1;\n");
    assert_eq!(projection.atoms, []);
    assert_eq!(projection.mappings.len(), 1);
}
