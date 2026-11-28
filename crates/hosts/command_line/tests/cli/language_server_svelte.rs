//! The editor features of `rsvelte lsp` that read a component's markup.

use serde_json::json;

use crate::Scratch;
use crate::language_server::{Client, uri};

const APP: &str = "<script>\n\tlet a = 1;\n</script>\n\n<!--\n\tnote\n-->\n<p>\n\t{a}\n</p>\n";

#[test]
fn a_component_folds_where_the_official_language_server_folds_it() {
    let root = Scratch::new(&[("src/App.svelte", APP), ("src/main.ts", "export {};\n")]);
    let (mut client, initialized) = Client::start_with(&root, false, &["--no-typescript"]);
    assert_eq!(initialized["capabilities"]["foldingRangeProvider"], true);
    let app = root.join("src/App.svelte");
    client.open(&app, APP);
    let folded = client.request(
        "textDocument/foldingRange",
        &json!({ "textDocument": { "uri": uri(&app) } }),
    );
    // What svelte-language-server 0.18.6 answers an editor that folds whole lines.
    assert_eq!(
        folded,
        json!([
            { "startLine": 0, "endLine": 1 },
            { "startLine": 4, "endLine": 6, "kind": "comment" },
            { "startLine": 7, "endLine": 8 },
        ]),
    );
    let main = root.join("src/main.ts");
    client.open(&main, "export {};\n");
    let other = client.request(
        "textDocument/foldingRange",
        &json!({ "textDocument": { "uri": uri(&main) } }),
    );
    assert_eq!(other, json!(null));
    client.exit();
}
