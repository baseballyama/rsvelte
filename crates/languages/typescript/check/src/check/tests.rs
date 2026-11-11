use super::*;

/// `sh` stands in for a type checker: `$@` holds what rsvelte passed after the user's arguments.
#[cfg(unix)]
fn shell(script: &str, own: &[&str]) -> Tsc {
    let mut arguments = vec!["-c".to_owned(), script.to_owned(), "sh".to_owned()];
    arguments.extend(own.iter().map(|a| (*a).to_owned()));
    Tsc {
        checker: TypeChecker {
            program: "/bin/sh".into(),
            arguments,
        },
        tsconfig: None,
    }
}

#[cfg(unix)]
#[test]
fn the_type_checker_gets_its_own_arguments_before_the_contract() {
    let tsc = shell(r#"printf '%s|' "$@"; exit 1"#, &["launcher.js"]);
    let error = tsc.check(&CheckRequest::default()).unwrap_err();
    assert!(
        error.contains("launcher.js|--api|--cwd|") && error.contains("|--runExternalCode|"),
        "{error}"
    );
}

#[cfg(unix)]
#[test]
fn a_type_checker_without_the_api_names_the_contract() {
    let tsc = shell(
        "echo \"error TS5023: Unknown compiler option '--api'.\"; exit 1",
        &[],
    );
    let error = tsc.check(&CheckRequest::default()).unwrap_err();
    assert!(
        error.contains(CONTRACT) && error.contains("TS5023"),
        "{error}"
    );
}

#[test]
fn only_a_typescript_older_than_7_1_is_refused() {
    assert_eq!(typescript_before_7_1("Version 5.9.3"), Some("5.9.3"));
    assert_eq!(typescript_before_7_1("Version 7.0.2"), Some("7.0.2"));
    assert_eq!(typescript_before_7_1("Version 7.1.0-dev.20261102.1"), None);
    assert_eq!(typescript_before_7_1("Version 8.0.0"), None);
    assert_eq!(typescript_before_7_1("tsrs 0.21.0"), None);
}

#[cfg(unix)]
fn checker(program: &str) -> TypeChecker {
    TypeChecker {
        program: program.into(),
        arguments: Vec::new(),
    }
}

#[cfg(unix)]
#[test]
fn identify_says_what_to_change() {
    let missing = checker("rsvelte-no-such-type-checker")
        .identify()
        .unwrap_err();
    assert!(
        missing.contains("on PATH") && missing.contains("typescript.check"),
        "{missing}"
    );
    let path = checker("/rsvelte/no/such/tsc").identify().unwrap_err();
    assert!(path.contains("does not exist"), "{path}");
    let shell = |script: &str| TypeChecker {
        program: "/bin/sh".into(),
        arguments: vec!["-c".into(), script.into(), "sh".into()],
    };
    let old = shell("echo 'Version 5.9.3'").identify().unwrap_err();
    assert!(old.contains("TypeScript 5.9.3"), "{old}");
    let failing = shell("echo broken >&2; exit 3").identify().unwrap_err();
    assert!(failing.contains("broken"), "{failing}");
    assert_eq!(
        shell("echo 'tsrs 0.21.0'").identify(),
        Ok("tsrs 0.21.0".to_owned())
    );
}
