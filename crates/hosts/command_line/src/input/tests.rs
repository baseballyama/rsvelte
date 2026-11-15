use super::*;

#[test]
fn the_hash_is_fnv1a() {
    assert_eq!(fnv1a(FNV_OFFSET, b""), 0xCBF2_9CE4_8422_2325);
    assert_eq!(fnv1a(FNV_OFFSET, b"a"), 0xAF63_DC4C_8601_EC8C);
    assert_eq!(
        fnv1a(fnv1a(FNV_OFFSET, b"a/"), b"b"),
        fnv1a(FNV_OFFSET, b"a/b")
    );
}

/// Units `names` below a fresh directory, each with an empty `input.txt`.
fn units_named(test: &str, names: &[String]) -> PathBuf {
    let root = std::env::temp_dir().join(format!("rsvelte-input-{test}-{}", std::process::id()));
    if root.exists() {
        std::fs::remove_dir_all(&root).expect("removable temp dir");
    }
    for name in names {
        std::fs::create_dir_all(root.join(name)).expect("writable temp dir");
        std::fs::write(root.join(name).join("input.txt"), "").expect("writable temp dir");
    }
    root
}

fn picked(root: &Path, every: u64) -> Vec<String> {
    let (docs, _, skipped) = load_sample(&Registry::new(), &[root], every).expect("a directory");
    assert_eq!(skipped, 0);
    docs.into_iter().map(|doc| doc.path).collect()
}

#[test]
fn the_pick_hashes_the_output_directory_below_the_root() {
    let names: Vec<String> = (0..40).map(|i| format!("group/unit-{i:02}")).collect();
    let root = units_named("hash", &names);
    let expected: Vec<String> = (names.iter())
        .filter(|name| fnv1a(FNV_OFFSET, format!("{name}/actual").as_bytes()).is_multiple_of(5))
        .cloned()
        .collect();
    let actual = picked(&root, 5);
    std::fs::remove_dir_all(&root).expect("removable temp dir");
    assert!(
        !expected.is_empty() && expected.len() < names.len(),
        "{expected:?}"
    );
    assert_eq!(actual, expected);
}

#[test]
fn adding_a_unit_keeps_the_others_sampled_or_not() {
    let mut names: Vec<String> = (0..40).map(|i| format!("unit-{i:02}")).collect();
    let root = units_named("add", &names);
    let before = picked(&root, 5);
    names.insert(1, "unit-00a".to_owned());
    let root = units_named("add", &names);
    let after: Vec<String> = (picked(&root, 5).into_iter())
        .filter(|name| name != "unit-00a")
        .collect();
    std::fs::remove_dir_all(&root).expect("removable temp dir");
    assert!(!before.is_empty() && before.len() < 40, "{before:?}");
    assert_eq!(before, after);
}
