//! Analog of esrap's `test/pluggability.test.js`.
//!
//! esrap's `print(node, visitors)` dispatches through a `visitors[node.type]`
//! map, so a caller can register a printer for an arbitrary node type and drive
//! output via `context.write(...)`. rsvelte_esrap is deliberately NOT a generic
//! visitor framework: it is a specialized printer whose dispatch is a `match`
//! over concrete **oxc** node kinds (there is no synthetic `CustomType` node to
//! hand it). The extension surface that esrap's pluggable visitors are built on
//! — the [`command`]/[`context`] buffer layer — is public here, so this test
//! exercises that same mechanism: a "custom printer" pushing literal fragments
//! and flattening them, reproducing the JS test's `':) - testing 123 - (:'`.

use rsvelte_esrap::command;
use rsvelte_esrap::context::Context;

#[test]
fn custom_printer_via_context_buffer() {
    // The body of esrap's `CustomType(node, context)` visitor: three `write`s.
    let value = "testing 123";
    let mut ctx = Context::new();
    ctx.write(":) - ");
    ctx.write(value);
    ctx.write(" - (:");

    let code = command::print(&ctx.into_commands(), "\t");
    assert_eq!(code, ":) - testing 123 - (:");
}
