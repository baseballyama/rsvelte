use super::*;

#[test]
fn interning_is_idempotent_and_survives_growth() {
    let mut i = Interner::new();
    let names: Vec<String> = (0..500).map(|n| format!("n{n}")).collect();
    let atoms: Vec<Atom> = names.iter().map(|n| i.intern(n)).collect();
    for (n, a) in names.iter().zip(&atoms) {
        assert_eq!(i.intern(n), *a);
        assert_eq!(i.get(*a), n);
        assert_eq!(i.lookup(n), Some(*a));
    }
    assert_eq!(i.lookup("missing"), None);
}

#[test]
fn a_hit_does_not_grow_the_table() {
    let mut i = Interner::new();
    for n in 0..32 {
        i.intern(&format!("n{n}"));
    }
    let cap = i.table.len();
    assert!((i.len() + 1) * 2 > cap, "the next new name would grow it");
    i.intern("n0");
    assert_eq!(i.table.len(), cap);
    i.intern("new");
    assert!(i.table.len() > cap);
    assert_eq!(i.lookup("new"), Some(Atom(32)));
}
