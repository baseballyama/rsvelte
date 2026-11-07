use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Registry, Task, TaskOutput};
use rsvelte_svelte::compilation::compiler_syntax_tree::{Children, CompilerSyntaxTree, NodeKind};
use rsvelte_svelte_compile::RenderPlan;
use rsvelte_svelte_compile::lower::{self, Item, Target};

fn text(plan: &RenderPlan, children: Children) -> String {
    plan.fragment(children)
        .items
        .iter()
        .filter_map(|item| match item {
            Item::Text { data, .. } => Some(data.as_ref()),
            Item::Node(_) | Item::Expression(_) => None,
        })
        .collect()
}

fn element(tree: &CompilerSyntaxTree, source: &str, name: &str) -> Children {
    tree.elements()
        .find(|(_, element)| element.name.text(source) == name)
        .expect("test element exists")
        .1
        .children
}

#[test]
fn whitespace_context_follows_regions_and_does_not_escape_pre() {
    let source = concat!(
        "<pre>\n  {#if show}  yes  {:else}  no  {/if}",
        "{#each items as item}  {item}  {:else}  empty  {/each}</pre><p>  after  </p>"
    );
    let component = rsvelte_svelte::syntax::parse::parse(source).expect("parses");
    let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, source);
    let input = rsvelte_svelte_compile::CompileInput::from(rsvelte_svelte::svelte_input(
        &component,
        &tree,
        source,
        "App.svelte",
    ));
    let plan = RenderPlan::build(&input);
    assert_eq!(text(&plan, element(&tree, source, "p")), "after");
    for node in &tree.nodes {
        match &node.kind {
            NodeKind::If {
                branches,
                otherwise,
            } => {
                for branch in tree.branches(*branches) {
                    assert_eq!(text(&plan, branch.body), "  yes  ");
                    assert!(!plan.fragment(branch.body).text_first);
                }
                assert_eq!(text(&plan, otherwise.expect("has else")), "  no  ");
            }
            NodeKind::Each(each) => {
                assert_eq!(text(&plan, each.body), "    ");
                assert!(plan.fragment(each.body).text_first);
                assert_eq!(
                    text(&plan, each.fallback.expect("has fallback")),
                    "  empty  "
                );
            }
            _ => {}
        }
    }
}

#[test]
fn plans_keep_decoded_text_and_markup_separate_and_own_their_text() {
    let (plan, children) = {
        let source = String::from("<p>&amp; &#65;</p>");
        let component = rsvelte_svelte::syntax::parse::parse(&source).expect("parses");
        let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, &source);
        let children = element(&tree, &source, "p");
        let plan = RenderPlan::build(&rsvelte_svelte_compile::CompileInput::from(
            rsvelte_svelte::svelte_input(&component, &tree, &source, "App.svelte"),
        ));
        (plan, children)
    };
    let [Item::Text { data, raw }] = plan.fragment(children).items.as_ref() else {
        panic!("one text item")
    };
    assert_eq!(data, "& A");
    assert_eq!(raw, "&amp; &#65;");
    send_sync(&plan);
}

#[test]
fn whitespace_options_produce_separate_plans_without_changing_the_compiler_syntax_tree() {
    let source = "<p>  text  </p>";
    let component = rsvelte_svelte::syntax::parse::parse(source).expect("parses");
    let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, source);
    let before = format!("{tree:?}");
    let children = element(&tree, source, "p");
    let mut input = rsvelte_svelte_compile::CompileInput::from(rsvelte_svelte::svelte_input(
        &component,
        &tree,
        source,
        "App.svelte",
    ));
    let normal = RenderPlan::build(&input);
    input.preserve_whitespace = true;
    let preserved = RenderPlan::build(&input);
    assert_eq!(text(&normal, children), "text");
    assert_eq!(text(&preserved, children), "  text  ");
    assert_eq!(format!("{tree:?}"), before);
}

#[test]
fn empty_regions_are_valid_in_every_parent_context() {
    for source in [
        "",
        "<!-- comment -->",
        "<div/><pre/><p/>",
        "{#if show}{:else}{/if}",
    ] {
        let component = rsvelte_svelte::syntax::parse::parse(source).expect("parses");
        let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, source);
        let plan = RenderPlan::build(&rsvelte_svelte_compile::CompileInput::from(
            rsvelte_svelte::svelte_input(&component, &tree, source, "App.svelte"),
        ));
        for (_, element) in tree.elements() {
            assert!(plan.fragment(element.children).items.is_empty());
            assert!(!plan.fragment(element.children).text_first);
        }
        assert!(!plan.fragment(tree.root).text_first);
    }
}

#[test]
fn both_targets_reuse_the_document_plan() {
    let mut registry = Registry::new();
    rsvelte_svelte_compile::register(&mut registry);
    let document = registry
        .document("App.svelte", include_str!("preserve_whitespace/App.svelte"))
        .expect("valid document");
    let context = DocumentContext::new(&document, registry.artifacts());
    let plan = context
        .get::<rsvelte_svelte_compile::Planned>()
        .as_ref()
        .expect("plan");
    let identity = context
        .get::<rsvelte_svelte_compile::Identified>()
        .as_ref()
        .expect("output identity");
    for target in [Target::Client, Target::Server] {
        let mut output = TaskOutput::default();
        rsvelte_svelte_compile::Compile { target }.run(&context, &mut output);
        assert!(
            output.diagnostics.is_empty(),
            "{target:?}: {:?}",
            output.diagnostics
        );
        assert!(output.files.iter().any(|file| file.name == "js"));
        assert!(std::ptr::eq(
            identity,
            context
                .get::<rsvelte_svelte_compile::Identified>()
                .as_ref()
                .expect("cached identity")
        ));
        assert!(std::ptr::eq(
            plan,
            context
                .get::<rsvelte_svelte_compile::Planned>()
                .as_ref()
                .expect("cached plan"),
        ));
    }
}

#[test]
fn both_targets_keep_the_oracle_checked_whitespace_modules() {
    let source = include_str!("preserve_whitespace/App.svelte");
    let component = rsvelte_svelte::syntax::parse::parse(source).expect("parses");
    let tree = rsvelte_svelte::compilation::compiler_syntax_tree::lower(&component, source);
    let resolution =
        rsvelte_svelte::semantic::resolve::resolve(&component.javascript, component.program, &tree);
    let mut input = rsvelte_svelte_compile::CompileInput::from(rsvelte_svelte::svelte_input(
        &component,
        &tree,
        source,
        "App.svelte",
    ));
    input.preserve_whitespace = true;
    let analysis = rsvelte_svelte::semantic::analyze::analyze(&input.component, &resolution);
    let plan = RenderPlan::build(&input);
    for (target, expected) in [
        (
            Target::Client,
            include_str!("preserve_whitespace/client.js"),
        ),
        (
            Target::Server,
            include_str!("preserve_whitespace/server.js"),
        ),
    ] {
        let module =
            lower::lower_with_plan(&input, &resolution, &analysis, target, &plan).expect("lowers");
        let actual = module.emit().out;
        assert_eq!(actual, expected, "{target:?}");
    }
}

const fn send_sync<T: Send + Sync>(_: &T) {}
