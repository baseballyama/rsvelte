use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
use rsvelte_stylesheet_format::tailwind::{Options as Tailwind, Sorter};
use rsvelte_test_harness::NodePackages;

use super::*;

/// Expected output from Prettier 3.9.10 and prettier-plugin-tailwindcss 0.8.1 with tailwindcss
/// 4.3.4, for `A.ts` in tools/oracle.
#[test]
fn sorts_the_classes_oxc_finds() {
    let packages = NodePackages::locate();
    let tailwind = Tailwind {
        stylesheet: Some("tasks/tailwind.css".into()),
        functions: vec!["cn".into()],
        ..Tailwind::default()
    };
    let sorter = Sorter::start(&tailwind, packages.directory()).unwrap();
    let options = Options {
        sort_tailwindcss: Some(tailwind),
        ..Options::default()
    };
    let mut registry = Registry::new();
    register_with_options(&mut registry, &options, Some(sorter));
    let source = concat!(
        "const a = cn(\"p-4 m-2 flex\", { \"p-4 m-2\": x });\n",
        "const b = \"p-4 m-2\";\n",
    );
    let document = registry.document("A.ts", source).unwrap();
    let mut result = run(
        &registry,
        &[document],
        &RunOptions {
            tasks: &[Format::IDENTIFIER],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .unwrap()
    .remove(0);
    let output = result.outputs.remove(0).1;
    assert!(output.diagnostics.is_empty(), "{:?}", output.diagnostics);
    assert_eq!(
        output.files[0].text,
        concat!(
            "const a = cn(\"m-2 flex p-4\", { \"m-2 p-4\": x });\n",
            "const b = \"p-4 m-2\";\n",
        )
    );
}
