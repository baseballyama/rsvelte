//! `<script>let 名前 = 1;</script>` panicked the server compiler.
//!
//! The constant-folding reassignment check scanned each line for the variable
//! name and stepped its cursor with `search_start = abs_pos + 1` — one *byte*
//! from a match start. For a non-ASCII name that lands inside the first
//! character, and the next `trimmed[search_start..]` slice panics.
//!
//! The cursor, not the boundary predicate, was the thing that was wrong.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

fn compiles(src: &str, generate: GenerateMode) -> Result<String, String> {
    std::panic::catch_unwind(|| {
        compile(
            src,
            CompileOptions {
                generate,
                ..Default::default()
            },
        )
    })
    .map_err(|_| "panicked".to_string())
    .and_then(|r| r.map_err(|e| format!("{e:?}")))
    .map(|r| r.js.code)
}

fn component(name: &str) -> String {
    format!("<script>\n\tlet {name} = 1;\n</script>\n<p>hi</p>")
}

/// One character is enough. `é` (2 bytes), `名前` (3 bytes each) and `אב`
/// (2 bytes, `0xD7` lead) all reach the same cursor; the widths differ so a fix
/// that only handles one of them still fails.
#[test]
fn a_non_ascii_let_binding_compiles_for_the_server() {
    for name in ["名前", "אב", "é"] {
        let out = compiles(&component(name), GenerateMode::Server);
        assert!(
            out.is_ok(),
            "server compile of `let {name} = 1;` failed: {:?}",
            out.err()
        );
    }
}

/// The control: the ASCII path must be unchanged, and the client path — which
/// never panicked — must stay unchanged too, so a regression here is
/// attributable to this cursor and not to some other edit.
#[test]
fn the_ascii_control_and_the_client_path_are_unaffected() {
    assert!(compiles(&component("ab"), GenerateMode::Server).is_ok());
    for name in ["ab", "名前", "אב", "é"] {
        assert!(
            compiles(&component(name), GenerateMode::Client).is_ok(),
            "client compile of `let {name} = 1;` regressed"
        );
    }
}

/// Constant folding must still behave: an untouched `let` folds, a reassigned
/// one does not.
///
/// **This does not pin the stepping expression itself.** Replacing the advance
/// with `search_start = trimmed.len()` — abandoning the line after the first
/// match — leaves all three tests green, because the reassignment in this
/// fixture is also caught by scope analysis before the text scan matters. The
/// first assertion is the negative control that keeps the second from passing
/// vacuously; the advance's own behaviour is covered only by the panic above.
#[test]
fn constant_folding_still_distinguishes_reassigned_bindings() {
    for name in ["ab", "名前"] {
        let folded = format!("<script>\n\tlet {name} = 1;\n</script>\n<p>{{{name}}}</p>");
        let out = compiles(&folded, GenerateMode::Server).expect("compile");
        assert!(
            out.contains(">1<"),
            "untouched `{name}` was not folded, so the check below is vacuous: {out}"
        );

        let reassigned = format!(
            "<script>\n\tlet {name} = 1;\n\tfunction f() {{ let {name}2 = 0; {name} = {name}2 + 2; }}\n</script>\n<p>{{{name}}}</p><button onclick={{f}}>go</button>"
        );
        let out = compiles(&reassigned, GenerateMode::Server).expect("compile");
        assert!(
            !out.contains(">1<"),
            "reassigned `{name}` was folded to its initial value: {out}"
        );
    }
}
