use super::*;

newtype_index!(
    struct A;
);
newtype_index!(
    struct B;
);

#[test]
fn push_hands_out_dense_identifiers_and_side_tables_line_up() {
    let mut v: IndexVector<A, &str> = IndexVector::new();
    let (x, y) = (v.push("x"), v.push("y"));
    assert_eq!((x.index(), y.index()), (0, 1));
    let mut seen: IndexVector<A, bool> = IndexVector::from_element_n(false, v.len());
    seen[y] = true;
    let got: Vec<(A, bool)> = v.iter_enumerated().map(|(i, _)| (i, seen[i])).collect();
    assert_eq!(got, [(x, false), (y, true)]);
    assert_eq!(format!("{v:?}"), r#"{A(0): "x", A(1): "y"}"#);
}

#[test]
fn a_range_slices_what_was_pushed_contiguously() {
    let v: IndexVector<B, u8> = (0..5).collect();
    let r = IndexRange::new(B::new(1), B::new(4));
    assert_eq!(v.slice(r), [1, 2, 3]);
    assert_eq!(
        r.iter().map(TypedIndex::index).collect::<Vec<_>>(),
        [1, 2, 3]
    );
}
