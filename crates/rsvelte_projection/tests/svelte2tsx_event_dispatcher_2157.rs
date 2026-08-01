//! Regression test for issue #2157.
//!
//! `createEventDispatcher` handling diverged from official svelte2tsx in three
//! ways: the factory was matched by its literal name instead of the local name
//! the `svelte` import binds (so an alias was invisible), only the LAST typed
//! dispatcher's `<T>` reached the `events:` spread, and a `dispatch(name)` whose
//! argument is a traced string constant was ignored. The expectations below are
//! the official `ComponentEventsFromEventsMap` behaviour.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn events_of(src: &str, is_ts_file: bool) -> String {
    let opts = Svelte2TsxOptions {
        filename: "Input.svelte".to_string(),
        is_ts_file,
        ..Default::default()
    };
    let out = svelte2tsx(src, opts).expect("svelte2tsx").code;
    let start = out.find(", events: ").expect("events in return") + ", events: ".len();
    let end = out[start..].find(" }}\n").expect("end of return") + start;
    out[start..end].to_string()
}

#[test]
fn aliased_create_event_dispatcher_import_is_recognised() {
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher as foo } from 'svelte';\n",
            "  const dispatch = foo();\n",
            "  dispatch('hi', true);\n",
            "</script>\n",
        ),
        false,
    );

    assert_eq!(events, "{'hi': __sveltets_2_customEvent}");
}

#[test]
fn dispatcher_factory_must_come_from_the_svelte_import() {
    // No import at all, and an import from another module, both leave the local
    // `createEventDispatcher` unrecognised — official keys off the import.
    for src in [
        concat!(
            "<script>\n",
            "  const dispatch = createEventDispatcher();\n",
            "  dispatch('hi');\n",
            "</script>\n",
        ),
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from './local';\n",
            "  const dispatch = createEventDispatcher();\n",
            "  dispatch('hi');\n",
            "</script>\n",
        ),
    ] {
        assert_eq!(events_of(src, false), "{}");
    }
}

#[test]
fn dispatch_resolves_a_traced_string_constant() {
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const dispatch = createEventDispatcher();\n",
            "  function bye() {\n",
            "    const bla = 'bye';\n",
            "    dispatch(bla, false);\n",
            "  }\n",
            "</script>\n",
        ),
        false,
    );

    assert_eq!(events, "{'bye': __sveltets_2_customEvent}");
}

#[test]
fn traced_constant_is_only_visible_after_its_declaration() {
    // Official reads `stringVars` as its walk goes, so a constant declared after
    // the call site is not yet known.
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const dispatch = createEventDispatcher();\n",
            "  dispatch(bla, false);\n",
            "  const bla = 'bye';\n",
            "</script>\n",
        ),
        false,
    );

    assert_eq!(events, "{}");
}

#[test]
fn a_non_identifier_first_argument_is_not_traced() {
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const bla = 'bye';\n",
            "  const dispatch = createEventDispatcher();\n",
            "  dispatch(bla.length, false);\n",
            "  dispatch(other, false);\n",
            "</script>\n",
        ),
        false,
    );

    assert_eq!(events, "{}");
}

#[test]
fn a_template_dispatch_never_resolves_an_identifier() {
    // The template collects callee arguments through `EventHandler`, which only
    // reads a literal `.value` — identifiers stay unresolved there.
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const bla = 'bye';\n",
            "  const dispatch = createEventDispatcher();\n",
            "</script>\n",
            "\n<button on:click={() => dispatch(bla)}></button>\n",
        ),
        false,
    );

    assert_eq!(events, "{}");
}

#[test]
fn every_typed_dispatcher_contributes_its_own_event_typings() {
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const dispatch1 = createEventDispatcher<{hi: boolean;}>();\n",
            "  const dispatch2 = createEventDispatcher<{btn: string;}>();\n",
            "</script>\n",
        ),
        true,
    );

    assert_eq!(
        events,
        "{...__sveltets_2_toEventTypings<{hi: boolean;}>(), \
         ...__sveltets_2_toEventTypings<{btn: string;}>()}"
    );
}

#[test]
fn an_event_declared_by_two_typed_dispatchers_also_becomes_a_custom_event() {
    // Official `addToEvents` degrades a repeated name to `CustomEvent<any>` and
    // puts it in the dispatched set, so it gains a `customEvent` entry too.
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const dispatch1 = createEventDispatcher<{hi: boolean;}>();\n",
            "  const dispatch2 = createEventDispatcher<{hi: string;}>();\n",
            "</script>\n",
        ),
        true,
    );

    assert_eq!(
        events,
        "{...__sveltets_2_toEventTypings<{hi: boolean;}>(), \
         ...__sveltets_2_toEventTypings<{hi: string;}>(), \
         'hi': __sveltets_2_customEvent}"
    );
}

#[test]
fn a_typed_dispatchers_own_dispatch_calls_are_not_scanned() {
    // Official only tracks call sites of dispatchers WITHOUT a typing.
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  const dispatch = createEventDispatcher<{hi: boolean;}>();\n",
            "  dispatch('nope', true);\n",
            "</script>\n",
        ),
        true,
    );

    assert_eq!(events, "{...__sveltets_2_toEventTypings<{hi: boolean;}>()}");
}

#[test]
fn a_dispatcher_declared_inside_a_function_is_still_tracked() {
    // Official walks the whole instance script, not just its top level.
    let events = events_of(
        concat!(
            "<script>\n",
            "  import { createEventDispatcher } from 'svelte';\n",
            "  function setup() {\n",
            "    const dispatch = createEventDispatcher();\n",
            "    dispatch('hi', true);\n",
            "  }\n",
            "</script>\n",
        ),
        false,
    );

    assert_eq!(events, "{'hi': __sveltets_2_customEvent}");
}
