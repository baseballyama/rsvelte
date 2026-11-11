//! Asks the installed TypeScript 7.1 through its API.

use rsvelte_test_harness::NodePackages;
use rsvelte_typescript_api::{DiagnosticKind, Session};

#[test]
fn reports_semantic_diagnostics_with_their_chains_in_utf16() {
    let directory = std::env::temp_dir().join(format!("rsvelte-api-{}", std::process::id()));
    std::fs::create_dir_all(&directory).unwrap();
    let directory = std::fs::canonicalize(&directory).unwrap();
    let file = directory.join("a.ts");
    std::fs::write(
        &file,
        "const s = 'é';\nlet f: (x: number) => string = (x: string) => 1;\n",
    )
    .unwrap();
    let config = directory.join("tsconfig.json");
    std::fs::write(
        &config,
        r#"{"compilerOptions":{"strict":true,"noEmit":true},"files":["a.ts"]}"#,
    )
    .unwrap();
    let (program, _) = NodePackages::locate().type_checker();
    let mut session = Session::start(&program, &[], &directory).unwrap();
    let project = session.open(&[&config]).unwrap()[0];
    let found = session
        .diagnostics(project, DiagnosticKind::Semantic, Some(&[&file]))
        .unwrap();
    session.release(project.snapshot).unwrap();
    drop(session);
    std::fs::remove_dir_all(&directory).unwrap();
    assert_eq!(found.len(), 1, "{found:?}");
    let d = &found[0];
    assert_eq!(d.code, 2322);
    assert_eq!(d.file_name.as_deref(), Some(file.as_path()));
    assert_eq!(
        d.flattened_message(),
        "Type '(x: string) => number' is not assignable to type '(x: number) => string'.\
         \n  Types of parameters 'x' and 'x' are incompatible.\
         \n    Type 'number' is not assignable to type 'string'."
    );
    // `é` is one UTF-16 unit and two UTF-8 bytes: `f` starts at 19 in UTF-16.
    assert_eq!((d.pos, d.end), (19, 20));
    let start = d.start_position.unwrap();
    assert_eq!((start.line, start.character), (1, 4));
}
