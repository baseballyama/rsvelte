#[test]
fn plain_and_keyed_buffers_have_disjoint_keys() {
    struct Owner;
    assert_ne!(
        super::plain_key::<(Owner, u8)>(),
        super::keyed_key::<Owner, u8>()
    );
}

#[test]
fn a_non_utf8_keyed_buffer_keeps_its_capacity_for_a_string() {
    struct Owner;
    let mut bytes = Vec::with_capacity(100);
    bytes.push(0xFF);
    let cap = bytes.capacity();
    super::give_keyed::<Owner, u8>(bytes);
    let text = super::take_string::<Owner>();
    assert_eq!(text, "");
    assert_eq!(text.capacity(), cap);
}

#[test]
fn capacity_is_reused_on_the_same_thread() {
    super::set_enabled(true);
    let mut v: Vec<u64> = super::take();
    v.extend(0..1000);
    let cap = v.capacity();
    super::give(v);
    let w: Vec<u64> = super::take();
    assert_eq!(w, Vec::<u64>::new());
    assert_eq!(w.capacity(), cap);
}

#[test]
fn keyed_buffers_are_not_handed_to_other_owners() {
    struct Owner;
    super::set_enabled(true);
    let mut v: Vec<u16> = super::take_keyed::<Owner, u16>();
    v.extend(0..1000);
    let cap = v.capacity();
    super::give_keyed::<Owner, u16>(v);
    let plain: Vec<u16> = super::take();
    assert_ne!(plain.capacity(), cap);
    let keyed: Vec<u16> = super::take_keyed::<Owner, u16>();
    assert_eq!(keyed.capacity(), cap);
}

#[test]
fn a_buffer_past_the_budget_is_freed() {
    struct Big;
    super::set_enabled(true);
    let v: Vec<u8> = Vec::with_capacity(super::MAXIMUM_BYTES + 1);
    super::give_keyed::<Big, u8>(v);
    assert_eq!(super::take_keyed::<Big, u8>().capacity(), 0);
}
