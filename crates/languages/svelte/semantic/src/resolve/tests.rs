use oxc_semantic::SymbolId;
use rsvelte_svelte_syntax::parse::parse;

use super::{BindingKind, Resolution, resolve};
use crate::compiler_syntax_tree::lower;

fn analyze(source_text: &str) -> Resolution {
    let component = parse(source_text).expect("parses");
    let lowered = lower(&component, source_text);
    resolve(
        &component.javascript,
        component.instance.as_ref().map(|s| s.program),
        component.module.as_ref().map(|s| s.program),
        &lowered,
    )
}

/// The symbol declared at the first `name` in `source_text`.
fn symbol(res: &Resolution, source_text: &str, name: &str) -> SymbolId {
    let start = source_text.find(name).expect("named") as u32;
    res.scoping()
        .symbol_ids()
        .find(|&s| res.scoping().symbol_span(s).start == start)
        .unwrap_or_else(|| panic!("no symbol declared at the first `{name}`"))
}

#[test]
fn template_names_resolve_to_the_instance_and_to_template_scopes() {
    let source = "<script>let items = $state([]); let unused = 1;</script>\n\
                  {#each items as item, i (item)}{item}{i}{/each}";
    let res = analyze(source);
    let items = symbol(&res, source, "items");
    let item = symbol(&res, source, "item,");
    assert_eq!(res.binding(items).kind, BindingKind::State);
    assert_eq!(res.counts().reads[items.index()], 1);
    assert_eq!(
        res.counts().reads[symbol(&res, source, "unused").index()],
        0
    );
    assert_eq!(res.binding(item).kind, BindingKind::Each);
    assert_eq!(
        res.binding(symbol(&res, source, "i (")).kind,
        BindingKind::KeyedIndex
    );
    assert_eq!(res.counts().reads[item.index()], 2);
    let unresolved: Vec<&str> = res
        .scoping()
        .root_unresolved_references()
        .keys()
        .map(oxc_ast::ast::Ident::as_str)
        .collect();
    assert_eq!(unresolved, ["$state"]);
}

#[test]
fn a_snippet_is_visible_before_it_and_its_parameters_inside_it() {
    let source = "{@render row(1)}\n{#snippet row(value)}{value}{/snippet}";
    let res = analyze(source);
    let row = symbol(&res, source, "row(value");
    let value = symbol(&res, source, "value)");
    assert_eq!(res.counts().reads[row.index()], 1);
    assert_eq!(res.binding(value).kind, BindingKind::Snippet);
    assert_eq!(res.counts().reads[value.index()], 1);
}

#[test]
#[expect(clippy::literal_string_with_formatting_args, reason = "Svelte markup")]
fn bind_writes_and_member_writes_are_counted() {
    let source = "<script>let a = $state(1); let b = $state({});</script>\n\
                  <input bind:value={a} /><input bind:value={b.c} />\n\
                  <button onclick={() => b.d++}></button>";
    let res = analyze(source);
    let a = symbol(&res, source, "a =");
    let b = symbol(&res, source, "b =");
    assert_eq!(res.writes(a), 1);
    assert!(res.is_state_source(a));
    assert_eq!(res.writes(b), 0);
    assert_eq!(res.mutations(b), 2);
}

#[test]
#[expect(clippy::literal_string_with_formatting_args, reason = "Svelte markup")]
fn the_module_scope_encloses_the_instance_scope() {
    let source = "<script module>export const shared = 1; var hoisted;</script>\n\
                  <script>var local = shared;</script>{local}{shared}";
    let res = analyze(source);
    let scoping = res.scoping();
    let local = symbol(&res, source, "local");
    assert_eq!(scoping.symbol_scope_id(local), res.instance_scope());
    assert_eq!(
        scoping.scope_parent_id(res.instance_scope()),
        Some(scoping.root_scope_id())
    );
    assert_eq!(
        res.counts().reads[symbol(&res, source, "shared").index()],
        2
    );
}

#[test]
fn a_component_without_scripts_resolves_its_template() {
    let source = "{#if ok}{@const doubled = n * 2}{doubled}{/if}";
    let res = analyze(source);
    let doubled = symbol(&res, source, "doubled");
    assert_eq!(res.binding(doubled).kind, BindingKind::Template);
    assert_eq!(res.counts().reads[doubled.index()], 1);
    assert_eq!(res.scoping().root_unresolved_references().len(), 2);
}

#[test]
fn props_and_runes_shadowed_by_bindings() {
    let source = "<script>let { a, b = $bindable(2), ...rest } = $props(); \
                  const state = 1; let s = $state(0);</script>";
    let res = analyze(source);
    assert_eq!(
        res.binding(symbol(&res, source, "a,")).kind,
        BindingKind::Property
    );
    assert_eq!(
        res.binding(symbol(&res, source, "b =")).kind,
        BindingKind::BindableProperty
    );
    assert_eq!(
        res.binding(symbol(&res, source, "rest")).kind,
        BindingKind::RestProperty
    );
    assert!(res.uses_props());
    // `state` beside `$state` makes `$state` a store subscription.
    assert_eq!(
        res.binding(symbol(&res, source, "s =")).kind,
        BindingKind::Normal
    );
    assert!(res.is_store_subscription("$state"));
}

#[test]
fn what_a_module_rejects_is_a_syntax_error_and_template_names_are_not() {
    let clean = concat!(
        "<script module>export const shared = 1;</script>\n",
        "<script>let a = $state(1); let { b } = $props(); function f(a) { return a; }</script>\n",
        "{#snippet row(item)}{item}{/snippet}{#snippet other(item)}{item}{/snippet}\n",
        "{#each [1] as item, i (item)}{@const c = item}{c}{i}{/each}\n",
        "{#each [2] as item}{@const c = item}{c}{/each}\n",
        "{#await p then value}{value}{:catch error}{error}{/await}\n",
        "<Comp let:item let:other={x}>{item}{x}</Comp>{a}{b}{shared}",
    );
    assert_eq!(
        analyze(clean).syntax_error().map(|e| e.message.clone()),
        None
    );
    for source in [
        "<script>let a; let a;</script>",
        "<script>delete x;</script>",
        "{(() => { let y; let y; })()}",
        "<script>/(?<n>x)(?<n>y)/;</script>",
    ] {
        let rejected = parse(source).is_err() || analyze(source).syntax_error().is_some();
        assert!(rejected, "{source}");
    }
}

#[test]
fn the_module_may_export_any_snippet_and_nothing_else_undeclared() {
    let snippet = "<script module>export { row };</script>{#snippet row()}x{/snippet}";
    assert!(analyze(snippet).syntax_error().is_none());
    // The compiler rejects a nested one as `snippet_invalid_export`.
    let nested = "<script module>export { row };</script>{#if a}{#snippet row()}x{/snippet}{/if}";
    assert!(analyze(nested).syntax_error().is_none());
    let missing = "<script module>export { row };</script>";
    assert!(analyze(missing).syntax_error().is_some());
}

#[test]
fn a_rune_reads_through_the_typescript_around_it() {
    let source = "<script lang=\"ts\">\n\
                  let a = $derived(f()) as any;\n\
                  let b = $state() as HTMLElement;\n\
                  let c = $derived(x)!;\n\
                  let { d = $bindable(0) as number, e = 1 as number } = $props();\n\
                  </script>";
    let res = analyze(source);
    let kind = |name| res.binding(symbol(&res, source, name)).kind;
    assert_eq!(kind("a ="), BindingKind::Derived);
    assert_eq!(kind("b ="), BindingKind::State);
    assert_eq!(kind("c ="), BindingKind::Derived);
    assert_eq!(kind("d ="), BindingKind::BindableProperty);
    let initial = |name| {
        res.binding(symbol(&res, source, name))
            .initial
            .map(|e| matches!(e, oxc_ast::ast::Expression::NumericLiteral(_)))
    };
    assert_eq!(initial("d ="), Some(true));
    assert_eq!(initial("e ="), Some(true));
}

#[test]
fn a_cast_bound_value_is_written() {
    let source = "<script lang=\"ts\">let { value = $bindable() } = $props();</script>\n\
                  <input bind:value={value as never} />";
    let res = analyze(source);
    assert_eq!(res.writes(symbol(&res, source, "value =")), 1);
}

#[test]
fn a_cast_global_needs_no_context() {
    for (script, needs) in [
        ("(window as any).addEventListener('a', f);", false),
        (
            "function f(e: Event) { return (e.target as HTMLElement | null)?.dataset; }",
            false,
        ),
        ("import { g } from 'g'; (g as any).h();", true),
    ] {
        let source = format!("<script lang=\"ts\">{script}</script>");
        let component = parse(&source).expect("parses");
        let lowered = lower(&component, &source);
        let res = resolve(
            &component.javascript,
            component.instance.as_ref().map(|s| s.program),
            None,
            &lowered,
        );
        let input = crate::svelte_input(&component, &lowered, &source, "App.svelte");
        let analysis = crate::analyze::analyze(&input, &res);
        assert_eq!(analysis.needs_context, needs, "{script}");
    }
}

#[test]
fn a_state_argument_proxies_by_the_value_inside_its_types() {
    let source = "<script lang=\"ts\">\n\
                  let count = $state(0);\n\
                  const next: number = count + 1;\n\
                  const one = 1 as number;\n\
                  let a = $state(next! as number);\n\
                  let b = $state(one);\n\
                  let c = $state({} as Record<string, number>);\n\
                  </script>";
    let res = analyze(source);
    let proxies = |name| {
        let Some(oxc_ast::ast::Expression::CallExpression(call)) =
            res.initializer(symbol(&res, source, name))
        else {
            panic!("`{name}` is a rune call")
        };
        let argument = call.arguments[0].as_expression().expect("an expression");
        res.should_proxy(argument)
    };
    assert!(!proxies("a ="));
    assert!(!proxies("b ="));
    assert!(proxies("c ="));
}

#[test]
fn an_element_attribute_sees_its_let_names_and_a_component_one_only_with_a_slot() {
    // Whether svelte 5.57.3 reads the attribute inside the slot's scope.
    let imports = "<script>import C from './C.svelte'; import D from './D.svelte';</script>";
    for (template, name, inside) in [
        (
            "<C><h2 slot=\"x\" let:props title={props}>a</h2></C>",
            "props",
            true,
        ),
        ("<C><h2 let:props title={props}>a</h2></C>", "props", true),
        ("<C let:item title={item}>a</C>", "item", false),
        (
            "<C><D slot=\"x\" let:item title={item}>a</D></C>",
            "item",
            true,
        ),
    ] {
        let source = format!("{imports}{template}");
        let res = analyze(&source);
        let declared = symbol(&res, &source, &format!("{name} "));
        let reads = res.counts().reads[declared.index()];
        assert_eq!(reads, u32::from(inside), "{template}");
    }
}

#[test]
fn a_component_s_let_names_reach_its_default_slot_and_not_a_named_one() {
    // Upstream `create_scopes`: a child with a static `slot` gets a scope of the component's outer
    // one, unless the component has a static `slot` of its own and so declares its `let:` there.
    let script =
        "<script>import C from './C.svelte'; import O from './O.svelte'; let x = 1;</script>";
    for (template, instance_reads, let_reads) in [
        ("<C let:x><p slot=\"a\">{x}</p>{x}</C>", 1, 1),
        ("<C let:x><p slot=\"default\">{x}</p></C>", 1, 0),
        ("<C let:x><p slot={\"a\"}>{x}</p></C>", 0, 1),
        ("<O><C slot=\"s\" let:x><p slot=\"a\">{x}</p></C></O>", 0, 1),
    ] {
        let source = format!("{script}{template}");
        let res = analyze(&source);
        let instance = symbol(&res, &source, "x = 1");
        let declared = symbol(&res, &source, "x>");
        assert_eq!(
            res.counts().reads[instance.index()],
            instance_reads,
            "{template}"
        );
        assert_eq!(
            res.counts().reads[declared.index()],
            let_reads,
            "{template}"
        );
    }
}

#[test]
fn an_instance_export_specifier_reassigns_and_a_module_one_does_not() {
    // Upstream's `ExportSpecifier` visitor: instance scripts only.
    let source = "<script module>let moduleLocal = 1; export { moduleLocal };</script>\
                  <script>let klass = ''; let counter = $state(0); let { prop = 1 } = $props();\
                  let handler = () => 0; export { klass as class, counter, prop, handler \
                      };</script>\
                  <div class={klass}></div>";
    let res = analyze(source);
    let [klass, counter, prop, handler, module_local] =
        ["klass", "counter", "prop", "handler", "moduleLocal"]
            .map(|name| symbol(&res, source, name));
    for (symbol, name) in [
        (klass, "klass"),
        (counter, "counter"),
        (prop, "prop"),
        (handler, "handler"),
    ] {
        assert_eq!(res.writes(symbol), 0, "{name} has no assignment");
        assert!(res.reassigned(symbol), "{name}");
    }
    assert!(!res.reassigned(module_local));
    assert!(res.is_state_source(counter));
    assert!(res.is_prop_source(prop));
    assert!(!res.binding(handler).is_function);
}

#[test]
fn the_module_script_sees_the_instance_imports_and_no_other_instance_binding() {
    // Upstream's `Scope.declare` puts every import in the outermost scope.
    let source = "<script module>const c = imported(); const d = local;</script>\
                  <script>import { imported } from './x'; let local = 1;</script>";
    let res = analyze(source);
    let imported = symbol(&res, source, "imported }");
    assert_eq!(
        res.scoping().symbol_scope_id(imported),
        res.scoping().root_scope_id()
    );
    let names: Vec<&str> = res.unresolved_names().collect();
    assert_eq!(names, ["local"]);
}

#[test]
fn a_redeclared_var_s_initializer_is_its_last_declarator_s() {
    let initial = |source: &str| {
        let res = analyze(source);
        let symbol = res
            .scoping()
            .symbol_ids()
            .find(|&s| res.scoping().symbol_name(s) == "test")
            .expect("declared");
        res.initializer(symbol)
            .map(|init| oxc_span::GetSpan::span(init).source_text(source).to_owned())
    };
    assert_eq!(
        initial("<script>var test = \"\"; var test = 42;</script>{test}").as_deref(),
        Some("42")
    );
    assert_eq!(
        initial("<script>var test = 1; var test;</script>{test}"),
        None
    );
    assert_eq!(
        initial("<script>var test = 1;</script>{test}").as_deref(),
        Some("1")
    );
}

#[test]
fn a_module_file_reads_a_rune_beside_its_store_s_name_as_the_rune() {
    use crate::compiler_syntax_tree::{Children, CompilerSyntaxTreeBuilder};

    let code = "let state = 1; let effect = 2;\nlet count = $state(0);\n$effect.root(() => {});\n";
    let document =
        rsvelte_kernel::source::document::Document::new("a.svelte.js".to_owned(), code.to_owned())
            .expect("small");
    let (tree, program) =
        rsvelte_typescript_tree::Tree::program(&document, oxc_span::SourceType::mjs())
            .expect("parses");
    let module = super::resolve_module(&tree, program);
    assert!(!module.is_store_subscription("$state"));
    assert!(!module.is_store_subscription("$effect"));
    // A component's module script subscribes to a store of that name, as upstream's does.
    let empty = CompilerSyntaxTreeBuilder::new(code, 0, 0).finish(Children::default());
    let component = resolve(&tree, None, Some(program), &empty);
    assert!(component.is_store_subscription("$state"));
    assert!(component.is_store_subscription("$effect"));
}

#[test]
fn generics_bind_type_references_only() {
    let source = "<script lang=\"ts\" generics=\"T extends Item\">\
                  import type { Item } from './x'; let x = T; let y: T;</script>{T}";
    let res = analyze(source);
    let t = symbol(&res, source, "T extends");
    assert_eq!(res.scoping().symbol_scope_id(t), res.instance_scope());
    // `y: T` only; `let x = T` and `{T}` read a value the component does not declare.
    assert_eq!(res.scoping().get_resolved_reference_ids(t).len(), 1);
    let names: Vec<&str> = res.unresolved_names().collect();
    assert_eq!(names, ["T"]);
    assert_eq!(res.scoping().root_unresolved_references()["T"].len(), 2);
}

#[test]
fn an_each_key_does_not_see_a_const_of_the_body() {
    // Svelte 5.57.3 compiles the key to `(thing) => key`, a global.
    let source = "<script>let things = [];</script>\
                  {#each things as thing (key)}{@const key = thing.id}{thing}{/each}";
    let res = analyze(source);
    let names: Vec<&str> = res.unresolved_names().collect();
    assert_eq!(names, ["key"]);
}
