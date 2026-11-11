use std::ffi::OsStr;
use std::path::Path;

use rsvelte_lint_runner::rule::Reporter;
use rsvelte_typescript_lint::NoInnerDeclarationsOptions;
use serde::Deserialize;

use crate::rule::{File, Files, RuleDefinition, RuleOptions, SvelteRule};

/// `ESLint`'s core rule; a `<script>`'s statements are at the program's root.
pub(super) static RULE: RuleDefinition = RuleDefinition {
    name: "svelte/no-inner-declarations",
    files: Files::All,
    configure,
};

#[derive(Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
enum Declarations {
    Functions,
    Both,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
struct Options {
    block_scoped_functions: Option<BlockScopedFunctions>,
}

#[derive(Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
enum BlockScopedFunctions {
    Allow,
    Disallow,
}

fn configure(options: &RuleOptions<'_>) -> Result<Box<dyn SvelteRule>, String> {
    if options.options.len() > 2 {
        return Err("takes two options".to_owned());
    }
    let declarations: Option<Declarations> = options.get(0)?;
    let functions: Option<Options> = options.get(1)?;
    Ok(Box::new(NoInnerDeclarations(NoInnerDeclarationsOptions {
        variables: declarations == Some(Declarations::Both),
        disallow_block_scoped_functions: functions
            .and_then(|o| o.block_scoped_functions)
            .is_some_and(|b| b == BlockScopedFunctions::Disallow),
    })))
}

#[derive(Debug)]
struct NoInnerDeclarations(NoInnerDeclarationsOptions);

impl SvelteRule for NoInnerDeclarations {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        // ESLint's `**/*.cjs` reads a file as CommonJS, a script; every other file is a module.
        let module = Path::new(file.path()).extension() != Some(OsStr::new("cjs"));
        rsvelte_typescript_lint::no_inner_declarations(
            file.semantic(),
            &file.programs(),
            module,
            self.0,
            reporter,
        );
    }
}
