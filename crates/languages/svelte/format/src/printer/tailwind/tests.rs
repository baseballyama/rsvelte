use rsvelte_stylesheet_format::tailwind::{Options, Sorter};
use rsvelte_test_harness::NodePackages;

use super::Tailwind;

/// `input` formatted with the oracle's Tailwind, as `svelte.format/tailwind` formats it.
fn format(input: &str) -> String {
    let packages = NodePackages::locate();
    let options = Options {
        stylesheet: Some("tasks/tailwind.css".into()),
        functions: vec!["cn".into()],
        ..Options::default()
    };
    let sorter = Sorter::start(&options, packages.directory()).unwrap();
    let c = crate::printer::parsed(input).unwrap();
    let file = packages.directory().join("A.svelte");
    let tailwind = Tailwind {
        sorter: &sorter,
        file: &file,
    };
    let options = crate::Options {
        sort_tailwindcss: Some(options),
        ..crate::Options::default()
    };
    crate::printer::print_component(&c, input, &options, None, Some(tailwind))
        .map_err(|failure| format!("{failure:?}"))
        .unwrap()
}

/// Expected output from Prettier 3.9.10, prettier-plugin-svelte 4.1.1 and
/// prettier-plugin-tailwindcss 0.8.1 with tailwindcss 4.3.4.
#[test]
fn sorts_where_the_plugin_sorts() {
    assert_eq!(
        format(concat!(
            "<script>\n  const a = cn(\"p-4 m-2\");\n  const b = \"p-4 m-2\";\n</script>\n\n",
            "<div class=\"p-4  m-2 p-4 unknown {x} p-4 m-2 a{y}b m-2 p-4\" ",
            "data-x=\"p-4 m-2\"></div>\n",
            "<div class={cn(\"p-4  m-2 p-4\", x ? \"p-4 m-2\" : `p-4 m-2 ${y}p-4 m-2`)}></div>\n",
            "<Comp buttonClass={cn(\"p-4 m-2\")} class:p-4={x} />\n{cn(\"p-4 m-2\")}\n\n",
            "<style>\n  .x { @apply p-4 m-2 flex; }\n</style>\n",
        )),
        concat!(
            "<script>\n  const a = cn(\"m-2 p-4\");\n  const b = \"p-4 m-2\";\n</script>\n\n",
            "<div class=\"unknown m-2 p-4 {x} m-2 p-4 a{y}b m-2 p-4\" ",
            "data-x=\"p-4 m-2\"></div>\n",
            "<div class={cn(\"m-2  p-4 p-4\", x ? \"m-2 p-4\" : `m-2 p-4 ${y}p-4 m-2`)}></div>\n",
            "<Comp buttonClass={cn(\"p-4 m-2\")} class:p-4={x} />\n{cn(\"p-4 m-2\")}\n\n",
            "<style>\n  .x {\n    @apply m-2 flex p-4;\n  }\n</style>\n",
        )
    );
}
