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
    let (docs, _, skipped) = load(&Registry::new(), &[root], every).expect("a directory");
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

/// Names that sort around the separator (`-` and `.` below `/`, a letter and a non-ASCII byte
/// above), nested three deep, one unit in each: the walk yields them in `Path::cmp` order, with
/// paths relative to the root.
#[test]
fn units_come_in_path_order_relative_to_the_root() {
    let root = std::env::temp_dir().join(format!("rsvelte-units-{}", std::process::id()));
    let source = root.join("family").join("source");
    let names = ["a", "a-b", "a.b", "ab", "é", "~x"];
    let mut dirs = vec![source];
    for _ in 0..3 {
        let last = std::mem::take(&mut dirs);
        dirs = last
            .iter()
            .flat_map(|d| names.iter().map(|n| d.join(n)))
            .collect();
        for d in &dirs {
            std::fs::create_dir_all(d.join("actual")).unwrap();
            std::fs::write(d.join("input.svelte"), "").unwrap();
            std::fs::write(d.join("actual").join("input.svelte"), "").unwrap();
        }
    }
    let got = units(&root.join("family"));
    std::fs::remove_dir_all(&root).unwrap();
    assert_eq!(got.len(), 6 + 36 + 216);
    assert!(got.is_sorted_by(|a, b| a.input < b.input));
    for u in &got {
        let rel = u.dir.strip_prefix(root.join("family")).unwrap();
        let want = rel.to_str().unwrap();
        assert_eq!(u.path, want, "{}", u.input.display());
        assert_eq!(u.input.parent(), Some(u.dir.as_path()));
    }
}
