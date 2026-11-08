use super::*;

struct Rules;

impl Contribution for Rules {
    type Item = &'static str;
}

struct Other;

impl Contribution for Other {
    type Item = u32;
}

#[test]
fn contributions_keep_order_and_stay_apart_by_list() {
    let mut registry = Registry::new();
    let none: &[&str] = &[];
    assert_eq!(registry.contributions::<Rules>(), none);
    registry
        .contribute::<Rules>("a")
        .contribute::<Other>(1)
        .contribute::<Rules>("b");
    assert_eq!(registry.contributions::<Rules>(), ["a", "b"]);
    assert_eq!(registry.contributions::<Other>(), [1]);
}
