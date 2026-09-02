//! An element that targets a named slot with a `slot` ATTRIBUTE is lowered by a
//! second port of the element transform, and that port never ran the `bind:`
//! machinery.
//!
//! `<C><svelte:fragment slot="x"><button bind:this={e}/></svelte:fragment></C>`
//! reaches `handle_regular_element`, which declares `const $$_button1 = …` and
//! appends `e = $$_button1;`. `<C><button slot="x" bind:this={e}/></C>` reaches
//! `handle_named_slot_element` instead, which built its own attribute object and
//! its own class/style + transition suffix — so `bind:this` stayed a
//! `"bind:this": e` prop, a two-way binding lost its
//! `() => v = __sveltets_2_any(null)` setter, and a void or self-closing element
//! closed with a leading space that only an overwritten `</tag>` leaves behind.
//!
//! The axis is the binding kind crossed with the host that carries the `slot`
//! attribute, plus the directives that share the same suffix pass. The rows
//! without a `slot` attribute are the controls: they went through the other port
//! and were already right.
//!
//! Each expectation is the `createElement`-bearing lines of the pinned
//! `submodules/language-tools` svelte2tsx's own output, trimmed and joined with
//! ` | `.

use rsvelte_projection::svelte2tsx::{Svelte2TsxOptions, svelte2tsx};

fn element_lines(src: &str) -> String {
    let code = svelte2tsx(
        src,
        Svelte2TsxOptions {
            filename: "T.svelte".to_string(),
            is_ts_file: true,
            ..Default::default()
        },
    )
    .expect("svelte2tsx")
    .code;
    code.lines()
        .filter(|line| line.contains("createElement"))
        .map(str::trim)
        .collect::<Vec<_>>()
        .join(" | ")
}

#[test]
fn a_named_slot_element_lowers_its_bindings_like_any_other() {
    let mut failures = Vec::new();
    for (label, src, expected) in [
        (
            "plain element",
            "<script lang=\"ts\">let element: HTMLButtonElement;</script>\n<button bind:this={element}>x</button>",
            "{ const $$_button0 = svelteHTML.createElement(\"button\", { });element = $$_button0;  }};",
        ),
        (
            "inside an each",
            "<script lang=\"ts\">let element: HTMLButtonElement;</script>\n{#each [1] as n}<button bind:this={element}>{n}</button>{/each}",
            "for(let n of __sveltets_2_ensureArray([1])){ { const $$_button0 = svelteHTML.createElement(\"button\", { });element = $$_button0;n; }}};",
        ),
        (
            "inside a component slot",
            "<script lang=\"ts\">import C from './C.svelte';let element: HTMLButtonElement;</script>\n<C><button bind:this={element}>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); new $$_C0C({ target: __sveltets_2_any(), props: {children:() => { return __sveltets_2_any(0); },}}); { const $$_button1 = svelteHTML.createElement(\"button\", { });element = $$_button1;  } C}};",
        ),
        (
            "inside a named slot fragment",
            "<script lang=\"ts\">import C from './C.svelte';let element: HTMLButtonElement;</script>\n<C><svelte:fragment slot=\"trigger\"><button bind:this={element}>x</button></svelte:fragment></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"trigger\"];$$_$$;{ svelteHTML.createElement(\"svelte:fragment\", { }); { const $$_button2 = svelteHTML.createElement(\"button\", { });element = $$_button2;  } }} C}};",
        ),
        (
            "slot attr + bind:this",
            "<script lang=\"ts\">import C from './C.svelte';let element: HTMLButtonElement;</script>\n<C><button slot=\"trigger\" bind:this={element}>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"trigger\"];$$_$$;{ const $$_button1 = svelteHTML.createElement(\"button\", {  });element = $$_button1;  }} C}};",
        ),
        (
            "slot attr, bind:this first",
            "<script lang=\"ts\">import C from './C.svelte';let element: HTMLButtonElement;</script>\n<C><button bind:this={element} slot=\"trigger\">x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"trigger\"];$$_$$;{ const $$_button1 = svelteHTML.createElement(\"button\", {  });element = $$_button1;  }} C}};",
        ),
        (
            "slot attr + bind:value on input",
            "<script lang=\"ts\">import C from './C.svelte';let v = '';</script>\n<C><input slot=\"trigger\" bind:value={v} /></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"trigger\"];$$_$$;{ svelteHTML.createElement(\"input\", {    \"bind:value\":v,});/*Ωignore_startΩ*/() => v = __sveltets_2_any(null);/*Ωignore_endΩ*/}} C}};",
        ),
        (
            "slot attr + bind:clientWidth self-closing",
            "<script lang=\"ts\">import C from './C.svelte';let v = 1;</script>\n<C><div slot=\"t\" bind:clientWidth={v} /></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ const $$_div1 = svelteHTML.createElement(\"div\", {   });v= $$_div1.clientWidth;}} C}};",
        ),
        (
            "slot attr + bind:clientWidth with close tag",
            "<script lang=\"ts\">import C from './C.svelte';let v = 1;</script>\n<C><div slot=\"t\" bind:clientWidth={v}></div></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ const $$_div1 = svelteHTML.createElement(\"div\", {  });v= $$_div1.clientWidth; }} C}};",
        ),
        (
            "slot attr void, no binding",
            "<script lang=\"ts\">import C from './C.svelte';</script>\n<C><input slot=\"t\" /></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ svelteHTML.createElement(\"input\", {  });}} C}};",
        ),
        (
            "slot attr self-closing div, no binding",
            "<script lang=\"ts\">import C from './C.svelte';</script>\n<C><div slot=\"t\" /></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ svelteHTML.createElement(\"div\", {  });}} C}};",
        ),
        (
            "slot attr + on: directive",
            "<script lang=\"ts\">import C from './C.svelte';let f = () => {};</script>\n<C><button slot=\"trigger\" on:click={f}>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"trigger\"];$$_$$;{ svelteHTML.createElement(\"button\", {   \"on:click\":f,});  }} C}};",
        ),
        (
            "slot attr + class: directive",
            "<script lang=\"ts\">import C from './C.svelte';let on = true;</script>\n<C><button slot=\"t\" class:a={on}>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ svelteHTML.createElement(\"button\", {  });on;  }} C}};",
        ),
        (
            "slot attr + use: action",
            "<script lang=\"ts\">import C from './C.svelte';import { a } from './a';</script>\n<C><button slot=\"t\" use:a>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{const $$action_0 = __sveltets_2_ensureAction(a(svelteHTML.mapElementTag('button')));{ svelteHTML.createElement(\"button\", __sveltets_2_union($$action_0), {  });  }}} C}};",
        ),
        (
            "slot attr + transition:",
            "<script lang=\"ts\">import C from './C.svelte';import { fade } from 'svelte/transition';</script>\n<C><button slot=\"t\" transition:fade>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ svelteHTML.createElement(\"button\", {  });__sveltets_2_ensureTransition(fade(svelteHTML.mapElementTag('button')));  }} C}};",
        ),
        (
            "slot attr + use: and bind:this",
            "<script lang=\"ts\">import C from './C.svelte';import { a } from './a';let element: HTMLButtonElement;</script>\n<C><button slot=\"t\" use:a bind:this={element}>x</button></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{const $$action_0 = __sveltets_2_ensureAction(a(svelteHTML.mapElementTag('button')));{ const $$_button1 = svelteHTML.createElement(\"button\", __sveltets_2_union($$action_0), {   });element = $$_button1;  }}} C}};",
        ),
        (
            "slot attr + bind:group on input",
            "<script lang=\"ts\">import C from './C.svelte';let g: string[] = [];</script>\n<C><input slot=\"t\" type=\"checkbox\" bind:group={g} /></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ svelteHTML.createElement(\"input\", {     \"type\":`checkbox`,});g = __sveltets_2_any(null);}} C}};",
        ),
        (
            "svelte:element in a named slot",
            "<script lang=\"ts\">import C from './C.svelte';let element: HTMLElement;</script>\n<C><svelte:element this={'div'} slot=\"t\" bind:this={element} /></C>",
            "{ const $$_C0C = __sveltets_2_ensureComponent(C); const $$_C0 = new $$_C0C({ target: __sveltets_2_any(), props: {}}); {const {/*Ωignore_startΩ*/$$_$$/*Ωignore_endΩ*/,} = $$_C0.$$slot_def[\"t\"];$$_$$;{ const $$_svelteelement1 = svelteHTML.createElement('div', {    });element = $$_svelteelement1;}} C}};",
        ),
        (
            "slot attr at top level (no component)",
            "<script lang=\"ts\">let element: HTMLButtonElement;</script>\n<button slot=\"trigger\" bind:this={element}>x</button>",
            "{ const $$_button0 = svelteHTML.createElement(\"button\", {  \"slot\":`trigger`,});element = $$_button0;  }};",
        ),
    ] {
        let actual = element_lines(src);
        if actual != expected {
            failures.push(format!(
                "{label}:\n  expected {expected:?}\n  actual   {actual:?}"
            ));
        }
    }
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}
