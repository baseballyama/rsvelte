use std::path::Path;

use oxc_allocator::Allocator;
use oxc_parser::Parser;
use oxc_span::SourceType;

use super::insertions;

/// `source` with what svelte2tsx inserts into `file`.
fn upserted(file: &str, source: &str, hooks_module: &'static str) -> String {
    let allocator = Allocator::default();
    let javascript = Path::new(file).extension().is_none_or(|e| e != "ts");
    let source_type = if javascript {
        SourceType::mjs()
    } else {
        SourceType::ts()
    };
    let program = Parser::new(&allocator, source, source_type).parse().program;
    let mut out = String::new();
    let mut from = 0;
    let found = insertions(Path::new(file), source, &program, javascript, || {
        hooks_module
    });
    for insertion in found {
        out.push_str(&source[from..insertion.at as usize]);
        out.push_str(&insertion.text);
        from = insertion.at as usize;
    }
    out.push_str(&source[from..]);
    out
}

/// Each file, its text, and what svelte2tsx's `upsertKitFile` makes of it: 0.7.61 for the
/// TypeScript files, 0.7.63 for the JavaScript ones.
#[derive(serde::Deserialize)]
struct Case {
    file: String,
    source: String,
    expected: String,
}

#[test]
fn the_types_are_inserted_where_svelte2tsx_inserts_them() {
    for cases in [
        include_str!("upsert_kit_file.json"),
        include_str!("upsert_kit_file_javascript.json"),
    ] {
        check_cases(cases);
    }
}

fn check_cases(cases: &str) {
    let cases: Vec<Case> = serde_json::from_str(cases).expect("the cases");
    assert!(!cases.is_empty());
    for case in cases {
        let got = upserted(&case.file, &case.source, "@sveltejs/kit");
        assert_eq!(got, case.expected, "{}", case.file);
    }
}

#[test]
fn sveltekit_3_declares_the_hook_types_in_its_hooks_module() {
    let source = "export const reroute = ({ url }) => url.pathname;\n";
    assert_eq!(
        upserted("/p/src/hooks.ts", source, "@sveltejs/kit/hooks"),
        "export const reroute = ({ url }: Parameters<import('@sveltejs/kit/hooks').Reroute>[0]) \
         : ReturnType<import('@sveltejs/kit/hooks').Reroute> => url.pathname;\n"
    );
}
