use std::path::PathBuf;

use super::*;

struct Scratch(PathBuf);

impl Scratch {
    fn new(name: &str) -> Self {
        let path =
            std::env::temp_dir().join(format!("rsvelte-program-{name}-{}", std::process::id()));
        drop(std::fs::remove_dir_all(&path));
        std::fs::create_dir_all(&path).expect("test directory");
        Self(std::path::absolute(path).expect("absolute"))
    }
}

impl Drop for Scratch {
    fn drop(&mut self) {
        std::fs::remove_dir_all(&self.0).expect("remove test directory");
    }
}

#[test]
fn a_path_is_relative_to_the_base() {
    let scratch = Scratch::new("path");
    let got = program_path("bin/tsc", &scratch.0).expect("absolute");
    assert_eq!(got, scratch.0.join("bin/tsc"));
}

#[test]
fn a_bare_name_is_found_in_an_ancestor_s_node_modules() {
    let scratch = Scratch::new("installed");
    let bin = scratch.0.join("node_modules/.bin");
    std::fs::create_dir_all(&bin).expect("bin");
    std::fs::write(bin.join("tsc"), "").expect("program");
    let nested = scratch.0.join("app/src");
    std::fs::create_dir_all(&nested).expect("nested");
    assert_eq!(
        program_path("tsc", &nested).expect("found"),
        bin.join("tsc")
    );
}

#[test]
fn a_bare_name_nobody_installed_is_left_for_path() {
    let scratch = Scratch::new("bare");
    let got = program_path("rsvelte-no-such-program", &scratch.0).expect("bare");
    assert_eq!(got, PathBuf::from("rsvelte-no-such-program"));
}

#[test]
fn an_empty_name_is_refused() {
    let error = program_path("", Path::new(".")).expect_err("empty");
    assert_eq!(error.kind(), io::ErrorKind::InvalidInput);
}
