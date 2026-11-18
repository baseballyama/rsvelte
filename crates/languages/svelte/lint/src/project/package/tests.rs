use super::{Package, kit_version};

fn package(json: &str) -> Option<Package> {
    serde_json::from_str(json).ok()
}

#[test]
fn a_kit_version_is_a_major_version() {
    assert_eq!(kit_version("^2.5.0").as_deref(), Some("2"));
    assert_eq!(kit_version("2.0.0-next.3").as_deref(), Some("2"));
    assert_eq!(kit_version("1.0.0-next.1").as_deref(), Some("1.0.0-next"));
    assert_eq!(kit_version("3"), None);
    assert_eq!(kit_version(">=2.0.0"), None);
}

#[test]
fn only_an_object_is_a_package() {
    assert_eq!(package("{}"), Some(Package::default()));
    assert_eq!(package("[]"), None);
    assert_eq!(package("{"), None);
}

#[test]
fn a_field_of_another_type_reads_as_missing() {
    assert_eq!(
        package(concat!(
            r#"{"name":5,"version":[1],"dependencies":"x","#,
            r#""devDependencies":{"@sveltejs/kit":"^2.1.0"},"scripts":{"a":"b"}}"#,
        )),
        Some(Package {
            kit: Some("2".to_owned()),
            ..Package::default()
        })
    );
}

#[test]
fn dependencies_decide_once_they_name_kit() {
    let kit = |json: &str| package(json).and_then(|p| p.kit);
    assert_eq!(
        kit(concat!(
            r#"{"dependencies":{"@sveltejs/kit":"~1.0.0-next.5"},"#,
            r#""devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#,
        ))
        .as_deref(),
        Some("1.0.0-next")
    );
    // A value that is no version still hides devDependencies, as upstream's lookup does.
    assert_eq!(
        kit(concat!(
            r#"{"dependencies":{"@sveltejs/kit":null},"#,
            r#""devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#,
        )),
        None
    );
    assert_eq!(
        kit(r#"{"dependencies":{"svelte":"5"},"devDependencies":{"@sveltejs/kit":"^2.0.0"}}"#)
            .as_deref(),
        Some("2")
    );
}

#[test]
fn a_repeated_key_takes_its_last_value() {
    assert_eq!(
        package(r#"{"name":"a","name":"eslint-plugin-svelte","version":"1","version":"2.0.0"}"#),
        Some(Package {
            is_eslint_plugin_svelte: true,
            version: Some("2.0.0".to_owned()),
            kit: None,
        })
    );
    assert_eq!(
        package(r#"{"dependencies":{"@sveltejs/kit":"^2.0.0"},"dependencies":{}}"#)
            .and_then(|p| p.kit),
        None
    );
}
