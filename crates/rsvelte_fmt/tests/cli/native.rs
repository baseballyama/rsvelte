use std::process::{Command, Stdio};

use crate::common::{MARKER_OXFMT, bin, run_stdin, tempdir};

// ─── native `.ts`/`.js` path ──────────────────────────────────────────────

/// A `.ts` file is formatted in-process via `oxc_formatter` — no `oxfmt`
/// subprocess needed (here `--oxfmt-bin true` is a no-op, proving the `.ts`
/// never reached oxfmt).
#[test]
fn native_ts_file_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("a.ts");
    std::fs::write(&file, "const x={a:1,b:2}\n").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, "const x = { a: 1, b: 2 };\n",
        "native TS not formatted:\n{out}"
    );
}

/// `--no-native-js` routes `.ts` back to oxfmt (the fake marker proves oxfmt
/// handled it instead of the in-process path).
#[test]
fn no_native_js_delegates_ts_to_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.ts");
    std::fs::write(&file, "const x = 1;\n").unwrap();

    // Pass the file explicitly: the fake oxfmt formats explicit file args (it
    // ignores plain directory inputs by design).
    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-native-js",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "ts should be delegated to oxfmt:\n{out}"
    );
}

/// With the native path on, oxfmt must NOT touch `.ts` files: the fake marker
/// must be absent (the directory's `.ts` is handled in-process, excluded from
/// the oxfmt delegation).
#[test]
fn native_path_excludes_ts_from_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.ts");
    std::fs::write(&file, "const x = 1;\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        !out.contains("/*FMT*/"),
        "native .ts must not be re-formatted by oxfmt:\n{out}"
    );
    assert_eq!(out, "const x = 1;\n");
}

/// `.oxfmtrc` `overrides` apply per-file: a wide line that overflows the base
/// print width stays flat when an override raises `printWidth` for that file.
#[test]
fn native_js_respects_override_print_width() {
    let dir = tempdir();
    std::fs::write(
        dir.join(".oxfmtrc.json"),
        r#"{ "printWidth": 80, "overrides": [{ "files": ["wide.ts"], "options": { "printWidth": 200 } }] }"#,
    )
    .unwrap();
    // ~106-col call that wraps at 80 but fits at 200.
    let long = "someFunction(argumentNumberOne, argumentNumberTwo, argumentNumberThree, argumentNumberFour, argumentFive);\n";
    std::fs::write(dir.join("wide.ts"), long).unwrap();
    std::fs::write(dir.join("narrow.ts"), long).unwrap();

    let status = Command::new(bin())
        .current_dir(&dir)
        .args([".", "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());

    let wide = std::fs::read_to_string(dir.join("wide.ts")).unwrap();
    let narrow = std::fs::read_to_string(dir.join("narrow.ts")).unwrap();
    assert!(
        !wide.contains("\n  "),
        "override printWidth 400 should keep `wide.ts` on one line:\n{wide}"
    );
    assert!(
        narrow.contains("\n  "),
        "base printWidth 80 should wrap `narrow.ts`:\n{narrow}"
    );
}

// ─── native JSON path ─────────────────────────────────────────────────────

/// A `.json` file is formatted in-process via `oxc_formatter_json` — `--oxfmt-bin
/// true` is a no-op, so the formatting proves it never reached oxfmt.
#[test]
fn native_json_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("data.json");
    std::fs::write(&file, "{\"b\":1,\"a\":[1,2,3]}").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, "{ \"b\": 1, \"a\": [1, 2, 3] }\n",
        "native JSON not formatted:\n{out}"
    );
}

/// `package.json` is delegated to `oxfmt` (it needs `sortPackageJson`, which
/// isn't in oxc), while a sibling `data.json` is formatted natively. A fake
/// oxfmt that marks the files it touches proves the split: `package.json` gets
/// the marker, `data.json` does not.
#[test]
fn package_json_delegated_to_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();

    let pkg = dir.join("package.json");
    let data = dir.join("data.json");
    std::fs::write(&pkg, "{ \"name\": \"x\" }\n").unwrap();
    std::fs::write(&data, "{\"b\":1}").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let pkg_out = std::fs::read_to_string(&pkg).unwrap();
    let data_out = std::fs::read_to_string(&data).unwrap();
    assert!(
        pkg_out.contains("/*FMT*/"),
        "package.json should be delegated to oxfmt:\n{pkg_out}"
    );
    assert!(
        !data_out.contains("/*FMT*/"),
        "data.json should be formatted natively (no oxfmt marker):\n{data_out}"
    );
    assert_eq!(data_out, "{ \"b\": 1 }\n", "data.json native output wrong");
}

// ─── native CSS path ──────────────────────────────────────────────────────

/// A standalone `.css` file is formatted in-process via `oxc_formatter_css` —
/// `--oxfmt-bin true` is a no-op, so the formatting proves it never reached oxfmt.
#[test]
fn native_css_file_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("a.css");
    std::fs::write(&file, ".foo{color:red;background:blue}\n").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, ".foo {\n  color: red;\n  background: blue;\n}\n",
        "native CSS not formatted:\n{out}"
    );
}

/// An embedded `<style>` block is formatted in-process by default — no oxfmt
/// subprocess. `--oxfmt-bin true` (inert) would leave the block untouched if the
/// callback still delegated, so the formatted output pins it to the native path.
#[test]
fn native_style_block_formatted_in_process() {
    let dir = tempdir();
    let file = dir.join("C.svelte");
    std::fs::write(&file, "<div></div>\n<style>.a{color:red}</style>\n").unwrap();

    let status = Command::new(bin())
        .args([file.to_str().unwrap(), "--write", "--oxfmt-bin", "true"])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success(), "exit code: {:?}", status.code());

    let out = std::fs::read_to_string(&file).unwrap();
    assert_eq!(
        out, "<div></div>\n\n<style>\n  .a {\n    color: red;\n  }\n</style>\n",
        "native <style> not formatted:\n{out}"
    );
}

/// `--no-native-css` excludes `.css` from the in-process pass: the fake oxfmt
/// marker must be present, proving the file was delegated to oxfmt instead.
#[test]
fn no_native_css_delegates_css_to_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.css");
    std::fs::write(&file, ".a{color:red}\n").unwrap();

    let status = Command::new(bin())
        .args([
            file.to_str().unwrap(),
            "--write",
            "--no-native-css",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        out.contains("/*FMT*/"),
        "css should be delegated to oxfmt under --no-native-css:\n{out}"
    );
}

/// With native CSS on (default), oxfmt must NOT touch `.css` files in a directory
/// walk: the fake marker must be absent (the `.css` is handled in-process and
/// excluded from the oxfmt delegation).
#[test]
fn native_path_excludes_css_from_oxfmt() {
    let dir = tempdir();
    let fake = dir.join("marker-oxfmt.cjs");
    std::fs::write(&fake, MARKER_OXFMT).unwrap();
    let file = dir.join("a.css");
    std::fs::write(&file, ".a {\n  color: red;\n}\n").unwrap();

    let status = Command::new(bin())
        .args([
            dir.to_str().unwrap(),
            "--write",
            "--oxfmt-bin",
            fake.to_str().unwrap(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .unwrap();
    assert!(status.success());
    let out = std::fs::read_to_string(&file).unwrap();
    assert!(
        !out.contains("/*FMT*/"),
        "native .css must not be re-formatted by oxfmt:\n{out}"
    );
    assert_eq!(out, ".a {\n  color: red;\n}\n");
}

/// Standalone `.scss` on stdin formats in-process (nested rules flattened per
/// the SCSS dialect), with `--oxfmt-bin true` proving no subprocess is used.
#[test]
fn native_scss_stdin_formatted_in_process() {
    let (stdout, _stderr, code) = run_stdin(
        ".a{.b{color:red}}\n",
        &[
            "--stdin",
            "--stdin-filepath",
            "x.scss",
            "--oxfmt-bin",
            "true",
        ],
    );
    assert_eq!(code, 0);
    assert_eq!(
        stdout, ".a {\n  .b {\n    color: red;\n  }\n}\n",
        "native SCSS stdin output wrong:\n{stdout}"
    );
}
