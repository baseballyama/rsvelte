use super::*;
use crate::type_checker::CONTRACT;

/// A request with no documents.
#[cfg(unix)]
fn empty(env: &TypeScriptEnv) -> CheckRequest<'_> {
    CheckRequest {
        documents: Vec::new(),
        files: Vec::new(),
        mapped_files: Vec::new(),
        env,
        stand_ins: Vec::new(),
        imports: Vec::new(),
    }
}

/// `sh` stands in for a type checker: `$@` holds what rsvelte passed after the user's arguments.
#[cfg(unix)]
fn shell(script: &str, own: &[&str]) -> Tsc {
    let mut arguments = vec!["-c".to_owned(), script.to_owned(), "sh".to_owned()];
    arguments.extend(own.iter().map(|a| (*a).to_owned()));
    Tsc::new(
        TypeChecker {
            program: "/bin/sh".into(),
            arguments,
        },
        None,
        None,
    )
}

#[cfg(unix)]
#[test]
fn the_type_checker_gets_its_own_arguments_before_the_contract() {
    let tsc = shell(r#"printf '%s|' "$@"; exit 1"#, &["launcher.js"]);
    let error = tsc.check(&empty(&TypeScriptEnv::default())).unwrap_err();
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
    let error = tsc.check(&empty(&TypeScriptEnv::default())).unwrap_err();
    assert!(
        error.contains(CONTRACT) && error.contains("TS5023"),
        "{error}"
    );
}

#[test]
fn a_missing_type_checker_says_so_where_the_check_starts_it() {
    let checker = TypeChecker {
        program: "/rsvelte/no/such/tsc".into(),
        arguments: Vec::new(),
    };
    let tsc = Tsc::new(checker, None, None);
    let error = tsc.check(&empty(&TypeScriptEnv::default())).unwrap_err();
    assert!(error.contains("does not exist"), "{error}");
}
