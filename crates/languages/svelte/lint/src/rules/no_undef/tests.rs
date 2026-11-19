use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_typescript_semantic::globals::Declared;
use serde_json::value::RawValue;

/// `no-undef`'s reports as `line:column-line:column name`, with `globals` declared and `options`.
fn reports(source_text: &str, globals: &[&str], options: &[&str]) -> Vec<String> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    crate::project::register_without_files(&mut registry);
    let document =
        Document::new("Input.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    let options: Vec<Box<RawValue>> = (options.iter())
        .map(|option| RawValue::from_string((*option).to_owned()).expect("JSON"))
        .collect();
    configuration.declare_globals(Declared::new(globals.iter().copied()));
    configuration
        .rule("no-undef", Severity::Error, &options, &[])
        .expect("a known rule");
    let position = |offset: u32| {
        let before = &source_text[..offset as usize];
        let line = before.lines().count().max(1) + usize::from(before.ends_with('\n'));
        let column = before.len() - before.rfind('\n').map_or(0, |at| at + 1) + 1;
        format!("{line}:{column}")
    };
    crate::lint(&context, &configuration)
        .expect("source parses")
        .into_iter()
        .map(|finding| {
            let span = finding.diagnostic.span;
            let name = finding
                .diagnostic
                .message
                .split('\'')
                .nth(1)
                .expect("a name");
            format!(
                "{}-{} {name}",
                position(span.start_offset),
                position(span.end_offset)
            )
        })
        .collect()
}

/// `ESLint` 10.14.0 with eslint-plugin-svelte 3.23.1 and `@typescript-eslint/parser` 8.72.1, in
/// runes mode, reports these.
const COMPONENT: &str = concat!(
    "<script lang=\"ts\">\n",
    "  import { writable } from 'svelte/store';\n",
    "  import Known from './Known.svelte';\n",
    "  const count = writable(0);\n",
    "  const current = $count;\n",
    "  let x: MissingType;\n",
    "  let r: Record<string, PropertyKey> = {};\n",
    "  let el: HTMLElement;\n",
    "  const a = typeof maybe;\n",
    "  const b = typeof (paren);\n",
    "  const g = () => arguments;\n",
    "  function f() { return arguments.length; }\n",
    "  type U = typeof notDeclared;\n",
    "  const s: Symbol = Symbol();\n",
    "  const m = new Map();\n",
    "  let p = $state(1);\n",
    "  let { children } = $props();\n",
    "  console.log(window, Math, $missingstore, $$props, late);\n",
    "  void missing;\n",
    "</script>\n",
    "\n",
    "<p>{current} {undefinedInTemplate} {$count} {$children}</p>\n",
    "<div use:act class:active style:color bind:this={el2}></div>\n",
    "<Known />\n",
    "<UnknownComp />\n",
    "{#each items as item}{item}{/each}\n",
    "{#snippet late()}{/snippet}\n",
    "{@render late()}\n",
    "{@render missingSnippet()}\n",
);

#[test]
fn reports_what_eslint_reports_in_scripts_and_the_template() {
    let expected = [
        "6:10-6:21 MissingType",
        "8:11-8:22 HTMLElement",
        "11:19-11:28 arguments",
        "13:19-13:30 notDeclared",
        "18:3-18:10 console",
        "18:15-18:21 window",
        "18:29-18:42 $missingstore",
        "19:8-19:15 missing",
        "22:15-22:34 undefinedInTemplate",
        "23:10-23:13 act",
        "23:20-23:26 active",
        "23:33-23:38 color",
        "23:50-23:53 el2",
        "25:2-25:13 UnknownComp",
        "26:8-26:13 items",
        "29:10-29:24 missingSnippet",
    ];
    assert_eq!(reports(COMPONENT, &[], &[]), expected);
}

#[test]
fn a_declared_global_is_defined_for_types_and_values() {
    let expected = [
        "6:10-6:21 MissingType",
        "11:19-11:28 arguments",
        "13:19-13:30 notDeclared",
        "18:3-18:10 console",
        "18:29-18:42 $missingstore",
        "19:8-19:15 missing",
        "22:15-22:34 undefinedInTemplate",
        "23:10-23:13 act",
        "23:20-23:26 active",
        "23:33-23:38 color",
        "23:50-23:53 el2",
        "25:2-25:13 UnknownComp",
        "26:8-26:13 items",
        "29:10-29:24 missingSnippet",
    ];
    assert_eq!(
        reports(COMPONENT, &["window", "HTMLElement"], &[]),
        expected
    );
}

#[test]
fn the_typeof_option_reports_names_typeof_reads() {
    let source = "<script>\n  const a = typeof maybe;\n</script>\n";
    assert_eq!(reports(source, &[], &[]), Vec::<String>::new());
    assert_eq!(
        reports(source, &[], &[r#"{"typeof": true}"#]),
        ["2:20-2:25 maybe"]
    );
}

/// `svelte-eslint-parser` keeps both scripts' top-level names in one scope, and a `$:` assignment
/// declares the name it assigns.
#[test]
fn top_level_names_of_either_script_and_reactive_names_are_defined() {
    let source = concat!(
        "<script lang=\"ts\" module>\n",
        "  const a: Shape = { kind: 1 };\n",
        "  export const b = c;\n",
        "</script>\n",
        "<script lang=\"ts\">\n",
        "  type Shape = { kind: number };\n",
        "  const c = 1;\n",
        "  $: d = a;\n",
        "  console.info(d, e);\n",
        "</script>\n",
        "{d}\n",
    );
    assert_eq!(reports(source, &["console"], &[]), ["9:19-9:20 e"]);
}
