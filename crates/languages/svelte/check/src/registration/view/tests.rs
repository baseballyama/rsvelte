use super::imports;

#[test]
fn a_dynamic_import_s_specifier_is_an_import_too() {
    let source = concat!(
        "<script>\n\timport A from './a.svelte';\n\texport { b } from './b.js';\n",
        "\tconst c = import('./c.svelte');\n\tasync function d() {\n",
        "\t\tawait import('./d.svelte');\n\t\timport(name);\n\t\timport('pkg');\n\t}\n</script>\n",
    );
    let component = rsvelte_svelte_syntax::parse::parse(source).expect("valid Svelte source");
    let found: Vec<_> = imports(&component)
        .into_iter()
        .map(|import| (import.at.text(source).to_owned(), import.specifier))
        .collect();
    let expected = ["./a.svelte", "./b.js", "./c.svelte", "./d.svelte", "pkg"];
    assert_eq!(
        found,
        expected.map(|s| (format!("'{s}'"), s.to_owned())).to_vec()
    );
}
