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

#[cfg(unix)]
#[test]
fn a_replaced_file_reads_replaced_by_any_path_to_it() {
    let dir = std::env::temp_dir().join(format!("rsvelte-replaced-{}", std::process::id()));
    let (package, project) = (dir.join("package"), dir.join("project"));
    std::fs::create_dir_all(&package).expect("a directory");
    std::fs::create_dir_all(&project).expect("a directory");
    let dir = crate::source::paths::canonicalize(&dir).expect("a real path");
    let types = dir.join("package/index.d.ts");
    std::fs::write(&types, "disk").expect("a file");
    std::fs::write(dir.join("project/index.d.ts"), "own").expect("a file");
    std::os::unix::fs::symlink(&types, dir.join("project/types.d.ts")).expect("a link");
    std::os::unix::fs::symlink(dir.join("package"), dir.join("project/linked")).expect("a link");
    let mut registry = Registry::new();
    registry.contribute::<ReplacedFiles>(ReplacedFile {
        tasks: &["t"],
        path: types.clone(),
        text: "replaced".to_owned(),
    });
    let read = |path: &str| registry.read(&dir.join(path), &["t"]).expect("a text");
    assert_eq!(read("package/index.d.ts"), "replaced");
    assert_eq!(read("project/types.d.ts"), "replaced");
    assert_eq!(read("project/linked/index.d.ts"), "replaced");
    assert_eq!(read("project/index.d.ts"), "own");
    assert_eq!(registry.read(&types, &["other"]).expect("a text"), "disk");
    drop(std::fs::remove_dir_all(&dir));
}
