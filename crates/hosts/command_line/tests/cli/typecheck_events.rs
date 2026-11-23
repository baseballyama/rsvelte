//! `rsvelte typecheck` of a component's events: those it dispatches and forwards, as svelte2tsx
//! reads them.

use rsvelte_test_harness::NodePackages;

use crate::typecheck::{Project, text, typecheck_config};

/// The report of a type check of `files` with svelte linked, its errors on stdout.
#[cfg(unix)]
fn check(files: &[(&str, &str)]) -> String {
    let mut all = vec![(
        "tsconfig.json",
        r#"{"compilerOptions":{"strict":true,"module":"esnext","moduleResolution":"bundler",
"target":"esnext","types":[],"skipLibCheck":true},"include":["src"]}"#,
    )];
    all.extend_from_slice(files);
    let project = Project::new(&all);
    std::fs::create_dir_all(project.0.join("node_modules")).expect("node_modules");
    let svelte = NodePackages::locate().package("svelte");
    std::os::unix::fs::symlink(svelte, project.0.join("node_modules/svelte")).expect("link");
    let config = typecheck_config(&rsvelte_test_harness::svelte_content_mapper());
    std::fs::write(project.0.join("rsvelte.config.json"), config).expect("config");
    let output = project.rsvelte(&["typecheck"]);
    format!("{}{}", text(&output.stdout), text(&output.stderr))
}

/// A component's events are svelte2tsx's: a typed dispatcher's, an untyped one's as
/// `CustomEvent<any>`, a forwarded element's or component's, and with `strictEvents` only those.
/// svelte-check 4.7.8 reports these four lines.
#[cfg(unix)]
#[test]
fn typecheck_types_the_events_a_component_dispatches_and_forwards() {
    let dispatches = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\
        \tconst dispatch = createEventDispatcher<{ go: number }>();\n</script>\n\
        <button onclick={() => dispatch('go', 1)}>x</button>\n";
    let untyped = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\
        \tconst dispatch = createEventDispatcher();\n\tdispatch('go');\n</script>\n\
        <button onclick={() => dispatch('tap')}>x</button>\n";
    let consumer = "<script lang=\"ts\">\n\timport Dispatches from './Dispatches.svelte';\n\
        \timport Untyped from './Untyped.svelte';\n\
        \timport Forwards from './Forwards.svelte';\n\
        \timport Clicks from './Clicks.svelte';\n\
        \timport Strict from './Strict.svelte';\n</script>\n\
        <Dispatches on:go={(e) => { const s: string = e.detail; }} />\n\
        <Forwards on:go={(e) => { const s: string = e.detail; }} />\n\
        <Untyped on:tap={(e) => { const s: string = e.detail; }} />\n\
        <Clicks on:click={(e) => { const s: string = e; }} />\n\
        <Dispatches on:other={(e) => { const s: string = e.detail; }} />\n\
        <Strict on:other={() => {}} />\n";
    let report = check(&[
        ("src/Dispatches.svelte", dispatches),
        ("src/Untyped.svelte", untyped),
        (
            "src/Forwards.svelte",
            "<script lang=\"ts\">\n\timport Dispatches from './Dispatches.svelte';\n</script>\n\
             <Dispatches on:go />\n",
        ),
        (
            "src/Clicks.svelte",
            "<script lang=\"ts\">\n\tlet x = 1;\n</script>\n<button on:click>{x}</button>\n",
        ),
        (
            "src/Strict.svelte",
            "<script lang=\"ts\" strictEvents>\n\tlet x = 1;\n</script>\n\
             <button on:click>{x}</button>\n",
        ),
        ("src/App.svelte", consumer),
    ]);
    assert_eq!(
        report,
        "src/App.svelte(8,35): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         src/App.svelte(9,33): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         src/App.svelte(11,34): error TS2322: Type 'PointerEvent' is not assignable to type \
         'string'.\n\
         src/App.svelte(13,12): error TS2345: Argument of type '\"other\"' is not assignable to \
         parameter of type '\"click\"'.\n\
         \nFound 4 errors in 1 file.\n",
    );
}

/// What svelte-check makes of four shapes svelte2tsx writes as it reads them: a forward from
/// `<svelte:component>`, whose name it writes as a component's and TypeScript recovers as `any`;
/// `strictEvents` on a `<style>`; a forward from an element of an event no element map names,
/// whose finding maps nowhere; and an empty event name in a variable, which it skips, so the
/// component has no events. svelte-check 4.7.8 reports these three lines.
#[cfg(unix)]
#[test]
fn typecheck_types_the_events_svelte2tsx_reads_from_edge_shapes() {
    let inner = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\
        \tconst dispatch = createEventDispatcher<{ v: number }>();\n</script>\n\
        <button onclick={() => dispatch('v', 1)}>x</button>\n";
    let importing = "<script lang=\"ts\">\n\timport Inner from './Inner.svelte';\n</script>\n";
    let style_strict = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\
        \tconst dispatch = createEventDispatcher();\n\tdispatch('s');\n</script>\n\
        <style strictEvents></style>\n";
    let empty = "<script lang=\"ts\">\n\timport { createEventDispatcher } from 'svelte';\n\
        \tlet { a }: { a: number } = $props();\n\tconst dispatch = createEventDispatcher();\n\
        \tconst name = '';\n\tdispatch(name);\n</script>\n{a}\n";
    let app = "<script lang=\"ts\">\n\timport Dynamic from './Dynamic.svelte';\n\
        \timport StyleStrict from './StyleStrict.svelte';\n\
        \timport Unknown from './Unknown.svelte';\n</script>\n\
        <Dynamic on:v={(e) => { const n: number = e.foo; }} />\n\
        <StyleStrict on:other={() => {}} />\n<Unknown />\n";
    let dynamic = format!("{importing}<svelte:component this={{Inner}} on:v />\n");
    let unknown = format!("{importing}<Inner on:v /><div on:v></div>\n");
    let report = check(&[
        ("src/Inner.svelte", inner),
        ("src/Dynamic.svelte", &dynamic),
        ("src/StyleStrict.svelte", style_strict),
        ("src/Unknown.svelte", &unknown),
        ("src/Empty.svelte", empty),
        ("src/App.svelte", app),
        (
            "src/use.ts",
            "import Empty from './Empty.svelte';\nexport const empty: number = Empty;\n",
        ),
    ]);
    assert_eq!(
        report,
        "src/Unknown.svelte(4,23): error TS2353: Object literal may only specify known \
         properties, and '\"on:v\"' does not exist in type 'HTMLProps<\"div\", \
         HTMLAttributes<any>>'.\n\
         src/App.svelte(7,17): error TS2345: Argument of type '\"other\"' is not assignable to \
         parameter of type '\"s\"'.\n\
         src/use.ts(2,14): error TS2322: Type 'Component<$$ComponentProps, {}, \"\">' is not \
         assignable to type 'number'.\n\
         \nFound 3 errors in 3 files.\n"
    );
}

/// A generic component's events are svelte2tsx's too, strict in runes mode, and of the
/// instance its props construct, so an event of the generic type takes the type they infer.
/// svelte-check 4.7.8 reports these four lines.
#[cfg(unix)]
#[test]
fn typecheck_types_the_events_of_a_generic_component() {
    let dispatcher = |events: &str, value: &str| {
        format!(
            "<script lang=\"ts\" generics=\"T\">\n\timport {{ createEventDispatcher }} from \
             'svelte';\n\tlet {{ value }}: {{ value: T }} = $props();\n\tconst dispatch = \
             createEventDispatcher<{{ go: {events} }}>();\n</script>\n<button onclick={{() => \
             dispatch('go', {value})}}>x</button>\n"
        )
    };
    let fixed = dispatcher("number", "1");
    let inferred = dispatcher("T", "value");
    let app = "<script lang=\"ts\">\n\timport Fixed from './Fixed.svelte';\n\
        \timport Inferred from './Inferred.svelte';\n\
        \timport Silent from './Silent.svelte';\n</script>\n\
        <Fixed value={1} on:go={(e) => { const s: string = e.detail; }} on:other={() => {}} />\n\
        <Inferred value={1} on:go={(e) => { const s: string = e.detail; }} />\n\
        <Inferred value=\"x\" on:go={(e) => { const s: string = e.detail; }} />\n\
        <Silent value={1} on:x={() => {}} />\n";
    let report = check(&[
        ("src/Fixed.svelte", &fixed),
        ("src/Inferred.svelte", &inferred),
        (
            "src/Silent.svelte",
            "<script lang=\"ts\" generics=\"T\">\n\tlet { value }: { value: T } = $props();\n\
             </script>\n<p>{value}</p>\n",
        ),
        ("src/App.svelte", app),
    ]);
    assert_eq!(
        report,
        "src/App.svelte(6,40): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         src/App.svelte(6,68): error TS2345: Argument of type '\"other\"' is not assignable to \
         parameter of type '\"go\"'.\n\
         src/App.svelte(7,43): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         src/App.svelte(9,22): error TS2345: Argument of type '\"x\"' is not assignable to \
         parameter of type 'never'.\n\
         \nFound 4 errors in 1 file.\n"
    );
}

/// A typed dispatcher's events are read from its type, so a name the typing cannot resolve is
/// reported once, where it is written, as svelte-check reports it: svelte2tsx's copy of the
/// typing maps nowhere. svelte-check 4.7.8 reports these four lines.
#[cfg(unix)]
#[test]
fn typecheck_reports_a_typed_dispatchers_unresolved_name_once() {
    let dispatcher = |declaration: &str| {
        format!(
            "<script lang=\"ts\">\n\timport {{ createEventDispatcher }} from 'svelte';\n\
             \t{declaration}\n</script>\n<button onclick={{() => dispatch('go', 1)}}>x</button>\n"
        )
    };
    let computed =
        dispatcher("const dispatch = createEventDispatcher<{ [Z](): void; go: number }>();");
    let exported =
        dispatcher("export const dispatch = createEventDispatcher<{ go: number; bad: Nope }>();");
    let app = "<script lang=\"ts\">\n\timport Computed from './Computed.svelte';\n\
        \timport Exported from './Exported.svelte';\n</script>\n\
        <Computed on:go={(e) => { const s: string = e.detail; }} />\n\
        <Exported on:go={(e) => { const s: string = e.detail; }} />\n";
    let report = check(&[
        ("src/Computed.svelte", &computed),
        ("src/Exported.svelte", &exported),
        ("src/App.svelte", app),
    ]);
    assert_eq!(
        report,
        "src/Computed.svelte(3,44): error TS2304: Cannot find name 'Z'.\n\
         src/Exported.svelte(3,67): error TS2304: Cannot find name 'Nope'.\n\
         src/App.svelte(5,33): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         src/App.svelte(6,33): error TS2322: Type 'number' is not assignable to type 'string'.\n\
         \nFound 4 errors in 3 files.\n"
    );
}
