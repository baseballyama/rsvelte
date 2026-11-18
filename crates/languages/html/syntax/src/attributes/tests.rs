use super::property_name;

#[test]
fn camel_cased_properties_are_named() {
    assert_eq!(property_name("readonly"), Some("readOnly"));
    assert_eq!(property_name("defaultvalue"), Some("defaultValue"));
    assert_eq!(property_name("disabled"), None);
    assert_eq!(property_name("readOnly"), None);
}
