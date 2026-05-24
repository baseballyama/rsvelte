//! rsvelte Zig smoke test via @cImport.
//!
//! Build & run from the repository root:
//!   cargo build -p rsvelte_capi --release
//!   zig build-exe crates/rsvelte_capi/examples/zig/smoke.zig \
//!       -I crates/rsvelte_capi/include \
//!       -L target/release \
//!       -lrsvelte_capi \
//!       --search-prefix target/release \
//!       -lc -rpath $PWD/target/release \
//!       -femit-bin=target/release/zig_smoke
//!   ./target/release/zig_smoke

const std = @import("std");
const c = @cImport({
    @cInclude("rsvelte.h");
});

const CompileFn = *const fn (
    [*c]const u8,
    usize,
    [*c]const u8,
    usize,
) callconv(.c) c.RsvelteBuf;

fn run_case(
    label: []const u8,
    source: []const u8,
    options_json: ?[]const u8,
    expect_ok: bool,
    fn_ptr: CompileFn,
) bool {
    std.debug.print("\n=== {s} ===\n", .{label});
    const opts = options_json orelse "";
    const opts_ptr: [*c]const u8 = if (opts.len == 0) null else opts.ptr;
    const src_ptr: [*c]const u8 = if (source.len == 0) null else source.ptr;

    var buf = fn_ptr(src_ptr, source.len, opts_ptr, opts.len);
    defer c.rsvelte_free(buf);

    if (buf.data == null or buf.len == 0) {
        std.debug.print("FAIL: {s} produced empty buffer\n", .{label});
        return false;
    }
    const bytes = buf.data[0..buf.len];
    const preview_len = if (bytes.len < 300) bytes.len else 300;
    std.debug.print("{s}{s}\n", .{ bytes[0..preview_len], if (preview_len < bytes.len) "..." else "" });

    const ok_prefix = "{\"ok\":true";
    const fail_prefix = "{\"ok\":false";
    const is_ok = bytes.len >= ok_prefix.len and std.mem.startsWith(u8, bytes, ok_prefix);
    const is_fail = bytes.len >= fail_prefix.len and std.mem.startsWith(u8, bytes, fail_prefix);
    if (expect_ok and !is_ok) {
        std.debug.print("FAIL: {s} expected ok=true\n", .{label});
        return false;
    }
    if (!expect_ok and !is_fail) {
        std.debug.print("FAIL: {s} expected ok=false\n", .{label});
        return false;
    }
    return true;
}

pub fn main() !void {
    const ver = std.mem.sliceTo(c.rsvelte_version(), 0);
    std.debug.print("rsvelte version: {s}\n", .{ver});

    var failures: u32 = 0;

    if (!run_case(
        "basic component (defaults)",
        "<h1>Hello from Zig, {name}!</h1>",
        null,
        true,
        c.rsvelte_compile,
    )) failures += 1;

    if (!run_case(
        "runes + dev",
        "<script>let { count = 0 } = $props();</script>\n<button onclick={() => count++}>{count}</button>",
        "{\"filename\":\"App.svelte\",\"dev\":true,\"runes\":true}",
        true,
        c.rsvelte_compile,
    )) failures += 1;

    if (!run_case(
        "ssr generate",
        "<p>server-rendered from zig</p>",
        "{\"generate\":\"server\",\"filename\":\"Ssr.svelte\"}",
        true,
        c.rsvelte_compile,
    )) failures += 1;

    if (!run_case(
        "module: $state rune",
        "export const counter = $state(0);",
        "{\"filename\":\"counter.svelte.js\"}",
        true,
        c.rsvelte_compile_module,
    )) failures += 1;

    if (!run_case(
        "malformed options",
        "<h1>x</h1>",
        "{not json",
        false,
        c.rsvelte_compile,
    )) failures += 1;

    if (failures == 0) {
        std.debug.print("\nPASS — 0 failure(s)\n", .{});
    } else {
        std.debug.print("\nFAIL — {d} failure(s)\n", .{failures});
        std.process.exit(1);
    }
}
