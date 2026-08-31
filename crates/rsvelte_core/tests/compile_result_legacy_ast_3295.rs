//! `compile()` fills `result.ast` unconditionally, as upstream's
//! `to_public_ast` (`compiler/index.js:177`) does: the modern tree under
//! `modernAst`, the Svelte-4 legacy tree otherwise.
//!
//! The byte-exact case is `runtime-legacy/samples/action-receives-element-mounted`,
//! one of the 22 of 400 sampled components whose legacy tree already matches
//! official exactly. It is pinned here rather than sampled from the submodule so
//! a Svelte bump cannot silently change what is being compared. It carries a
//! `use:` directive and a script, so it fails if either `name_loc` or the
//! statement `loc`s stop being produced.

use rsvelte_core::{CompileOptions, GenerateMode, compile, compile_both};
use serde_json::Value;

const ACTION_SRC: &str = r#"<script>
  export let result;
  function onMountAction(node) {
    result.parentElement = node.parentElement;
  }
</script>

<h1 use:onMountAction>Hello!</h1>
"#;

/// `svelte.compile(ACTION_SRC, { filename: 'main.svelte', generate: 'client' }).ast`
/// on the pinned submodule.
const ACTION_LEGACY_AST: &str = r#"{"html":{"type":"Fragment","start":125,"end":158,"children":[{"type":"Text","start":123,"end":125,"raw":"\n\n","data":"\n\n"},{"type":"Element","start":125,"end":158,"name":"h1","attributes":[{"start":129,"end":146,"type":"Action","name":"onMountAction","name_loc":{"start":{"line":8,"column":4,"character":129},"end":{"line":8,"column":21,"character":146}},"expression":null,"modifiers":[]}],"children":[{"type":"Text","start":147,"end":153,"raw":"Hello!","data":"Hello!"}]}]},"instance":{"type":"Script","start":0,"end":123,"context":"default","content":{"type":"Program","start":8,"end":114,"loc":{"start":{"line":1,"column":0},"end":{"line":6,"column":9}},"body":[{"type":"ExportNamedDeclaration","start":11,"end":29,"loc":{"start":{"line":2,"column":2},"end":{"line":2,"column":20}},"declaration":{"type":"VariableDeclaration","start":18,"end":29,"loc":{"start":{"line":2,"column":9},"end":{"line":2,"column":20}},"declarations":[{"type":"VariableDeclarator","start":22,"end":28,"loc":{"start":{"line":2,"column":13},"end":{"line":2,"column":19}},"id":{"type":"Identifier","start":22,"end":28,"loc":{"start":{"line":2,"column":13},"end":{"line":2,"column":19}},"name":"result"},"init":null}],"kind":"let"},"specifiers":[],"source":null,"attributes":[]},{"type":"FunctionDeclaration","start":32,"end":113,"loc":{"start":{"line":3,"column":2},"end":{"line":5,"column":3}},"id":{"type":"Identifier","start":41,"end":54,"loc":{"start":{"line":3,"column":11},"end":{"line":3,"column":24}},"name":"onMountAction"},"expression":false,"generator":false,"async":false,"params":[{"type":"Identifier","start":55,"end":59,"loc":{"start":{"line":3,"column":25},"end":{"line":3,"column":29}},"name":"node"}],"body":{"type":"BlockStatement","start":61,"end":113,"loc":{"start":{"line":3,"column":31},"end":{"line":5,"column":3}},"body":[{"type":"ExpressionStatement","start":67,"end":109,"loc":{"start":{"line":4,"column":4},"end":{"line":4,"column":46}},"expression":{"type":"AssignmentExpression","start":67,"end":108,"loc":{"start":{"line":4,"column":4},"end":{"line":4,"column":45}},"operator":"=","left":{"type":"MemberExpression","start":67,"end":87,"loc":{"start":{"line":4,"column":4},"end":{"line":4,"column":24}},"object":{"type":"Identifier","start":67,"end":73,"loc":{"start":{"line":4,"column":4},"end":{"line":4,"column":10}},"name":"result"},"property":{"type":"Identifier","start":74,"end":87,"loc":{"start":{"line":4,"column":11},"end":{"line":4,"column":24}},"name":"parentElement"},"computed":false,"optional":false},"right":{"type":"MemberExpression","start":90,"end":108,"loc":{"start":{"line":4,"column":27},"end":{"line":4,"column":45}},"object":{"type":"Identifier","start":90,"end":94,"loc":{"start":{"line":4,"column":27},"end":{"line":4,"column":31}},"name":"node"},"property":{"type":"Identifier","start":95,"end":108,"loc":{"start":{"line":4,"column":32},"end":{"line":4,"column":45}},"name":"parentElement"},"computed":false,"optional":false}}}]}}],"sourceType":"module"}}}"#;

fn client_options() -> CompileOptions {
    CompileOptions {
        filename: Some("main.svelte".to_string()),
        generate: GenerateMode::Client,
        dev: false,
        ..Default::default()
    }
}

fn ast_of(source: &str, options: CompileOptions) -> Value {
    let result = compile(source, options).expect("compiles");
    let ast = result.ast.expect("compile() must fill `ast`");
    serde_json::from_str(&ast).expect("`ast` is JSON")
}

#[test]
fn default_options_return_the_legacy_ast() {
    let actual = ast_of(ACTION_SRC, client_options());
    let expected: Value = serde_json::from_str(ACTION_LEGACY_AST).unwrap();
    assert_eq!(
        actual, expected,
        "legacy AST diverges from svelte/compiler\n  actual: {actual}"
    );
}

#[test]
fn modern_ast_option_still_returns_the_modern_tree() {
    let options = CompileOptions {
        modern_ast: true,
        ..client_options()
    };
    let ast = ast_of(ACTION_SRC, options);
    assert_eq!(ast["type"], "Root");
    assert!(
        ast.get("html").is_none(),
        "the modern tree must not carry the legacy `html` key"
    );
}

#[test]
fn server_and_client_share_one_ast() {
    let (client, server) = compile_both(ACTION_SRC, client_options()).expect("compiles");
    assert_eq!(client.ast, server.ast);
    assert!(client.ast.is_some());
}

#[test]
fn a_module_script_and_style_reach_their_legacy_keys() {
    let source = "<script module>\n\texport const a = 1;\n</script>\n<script>\n\tlet b = 2;\n</script>\n<b>{b}</b>\n<style>b { color: red }</style>\n";
    let ast = ast_of(source, client_options());
    let object = ast.as_object().expect("the legacy AST is an object");
    let mut keys: Vec<&str> = object.keys().map(String::as_str).collect();
    keys.sort_unstable();
    assert_eq!(keys, ["css", "html", "instance", "module"]);
    assert_eq!(ast["css"]["type"], "Style");
    assert_eq!(ast["module"]["type"], "Script");
    assert_eq!(ast["instance"]["type"], "Script");
    assert_eq!(ast["html"]["type"], "Fragment");
}

fn assert_loc(node: &Value, start: usize, end: usize, character: bool) {
    assert_eq!(node["start"], start);
    assert_eq!(node["end"], end);
    assert!(node.get("loc").is_some(), "{} has no loc", node["type"]);
    assert_eq!(node["loc"]["start"]["character"].is_number(), character);
    assert_eq!(node["loc"]["end"]["character"].is_number(), character);
    if character {
        assert_eq!(node["loc"]["start"]["character"], start);
        assert_eq!(node["loc"]["end"]["character"], end);
    }
}

#[test]
fn compilation_rebuilds_legacy_expression_locations_at_the_json_boundary() {
    let source = concat!(
        "{#each items as item}{item}{@const local = item + 1}{local}{/each}",
        "{#await promise then value}{value}{:catch error}{error}{/await}",
        "{#snippet snip(param)}{param}{/snippet}",
    );
    let ast = ast_of(source, client_options());
    let children = ast["html"]["children"].as_array().unwrap();

    let each = &children[0];
    // Skip the `item` substring in the collection name `items`; the remaining
    // matches are the context binding and its two identifier uses.
    let item_positions: Vec<_> = source
        .match_indices("item")
        .skip(1)
        .map(|(i, _)| i)
        .collect();
    assert_loc(
        &each["context"],
        item_positions[0],
        item_positions[0] + 4,
        true,
    );
    let items = source.find("items").unwrap();
    assert_loc(&each["expression"], items, items + 5, false);
    assert_loc(
        &each["children"][0]["expression"],
        item_positions[1],
        item_positions[1] + 4,
        false,
    );

    let assignment = &each["children"][1]["expression"];
    let local = source.find("local =").unwrap();
    let one = source.find("1}").unwrap();
    // Upstream synthesizes this node in `legacy.js` with no `loc` of its own.
    assert_eq!(assignment["start"], local);
    assert_eq!(assignment["end"], one + 1);
    assert!(
        assignment.get("loc").is_none(),
        "the synthesized ConstTag assignment carries no loc"
    );
    assert_loc(&assignment["left"], local, local + 5, true);
    assert_loc(&assignment["right"], item_positions[2], one + 1, false);
    assert_loc(
        &assignment["right"]["left"],
        item_positions[2],
        item_positions[2] + 4,
        false,
    );

    let await_block = &children[1];
    let promise = source.find("promise").unwrap();
    assert_loc(&await_block["expression"], promise, promise + 7, false);
    let value = source.find("value}").unwrap();
    assert_loc(&await_block["value"], value, value + 5, true);
    let error = source.find("error}").unwrap();
    assert_loc(&await_block["error"], error, error + 5, true);

    let snippet = &children[2];
    let snip = source.find("snip(").unwrap();
    assert_loc(&snippet["expression"], snip, snip + 4, true);
    let param = source.find("param)").unwrap();
    assert_loc(&snippet["parameters"][0], param, param + 5, false);
}

#[test]
fn complex_binding_locations_keep_upstreams_empty_line_column_quirk() {
    let source = "{#each items as\n\n  { value }}{value}{/each}";
    let ast = ast_of(source, client_options());
    let context = &ast["html"]["children"][0]["context"];
    let pattern_start = source.find("{ value }").unwrap();

    assert_loc(context, pattern_start, pattern_start + 9, false);
    assert_eq!(context["loc"]["start"]["line"], 3);
    assert_eq!(context["loc"]["start"]["column"], 3);
    assert_eq!(context["properties"][0]["key"]["loc"]["start"]["column"], 5);
}

#[test]
fn compilation_rebuilds_legacy_comment_locations_at_the_json_boundary() {
    let source = concat!(
        "<script>\n",
        "\t// script comment\n",
        "</script>\n",
        "<button\n",
        "\t/* attribute comment */\n",
        ">ok</button>",
    );
    let ast = ast_of(source, client_options());
    let comments = ast["_comments"].as_array().unwrap();
    assert_eq!(comments.len(), 2);

    let script_start = source.find("// script comment").unwrap();
    let script_end = script_start + "// script comment".len();
    assert_loc(&comments[0], script_start, script_end, false);
    assert_eq!(comments[0]["loc"]["start"]["line"], 2);
    assert_eq!(comments[0]["loc"]["start"]["column"], 1);

    let attribute_start = source.find("/* attribute comment */").unwrap();
    let attribute_end = attribute_start + "/* attribute comment */".len();
    assert_loc(&comments[1], attribute_start, attribute_end, true);
    assert_eq!(comments[1]["loc"]["start"]["line"], 5);
    assert_eq!(comments[1]["loc"]["start"]["column"], 1);
}
