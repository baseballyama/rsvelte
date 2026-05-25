#!/usr/bin/env python3
"""rsvelte ctypes smoke test.

Run from the repository root:
    cargo build -p rsvelte_capi --release
    python3 crates/rsvelte_capi/examples/python/smoke.py

ctypes here doubles as a proxy for what PHP FFI and Ruby Fiddle look
like — same idea: declare argtypes/restype, hand over UTF-8 bytes,
free the returned buffer.
"""

from __future__ import annotations

import ctypes
import json
import os
import platform
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parents[3]
TARGET_DIR = REPO_ROOT / "target" / "release"


def _dylib_path() -> Path:
    if platform.system() == "Darwin":
        name = "librsvelte_capi.dylib"
    elif platform.system() == "Windows":
        name = "rsvelte_capi.dll"
    else:
        name = "librsvelte_capi.so"
    return TARGET_DIR / name


class RsvelteBuf(ctypes.Structure):
    _fields_ = [
        ("data", ctypes.POINTER(ctypes.c_uint8)),
        ("len", ctypes.c_size_t),
        ("cap", ctypes.c_size_t),
    ]


def load_library() -> ctypes.CDLL:
    path = _dylib_path()
    if not path.exists():
        print(f"FAIL: dylib not found at {path} — run `cargo build -p rsvelte_capi --release` first", file=sys.stderr)
        sys.exit(2)
    lib = ctypes.CDLL(str(path))

    lib.rsvelte_version.argtypes = []
    lib.rsvelte_version.restype = ctypes.c_char_p

    lib.rsvelte_compile.argtypes = [
        ctypes.POINTER(ctypes.c_uint8), ctypes.c_size_t,
        ctypes.POINTER(ctypes.c_uint8), ctypes.c_size_t,
    ]
    lib.rsvelte_compile.restype = RsvelteBuf

    lib.rsvelte_compile_module.argtypes = lib.rsvelte_compile.argtypes
    lib.rsvelte_compile_module.restype = RsvelteBuf

    lib.rsvelte_free.argtypes = [RsvelteBuf]
    lib.rsvelte_free.restype = None

    return lib


def _bytes_ptr(b: bytes):
    """Return a pointer to the start of `b` (or NULL if empty)."""
    if not b:
        return ctypes.cast(None, ctypes.POINTER(ctypes.c_uint8))
    arr = (ctypes.c_uint8 * len(b)).from_buffer_copy(b)
    # Keep the array alive by returning it alongside the pointer.
    return arr


def _drive(lib: ctypes.CDLL, fn, source: str, options: dict | None) -> dict:
    source_b = source.encode("utf-8")
    options_b = json.dumps(options).encode("utf-8") if options is not None else b""

    src_arr = _bytes_ptr(source_b)
    opt_arr = _bytes_ptr(options_b)
    src_ptr = ctypes.cast(src_arr, ctypes.POINTER(ctypes.c_uint8)) if source_b else ctypes.POINTER(ctypes.c_uint8)()
    opt_ptr = ctypes.cast(opt_arr, ctypes.POINTER(ctypes.c_uint8)) if options_b else ctypes.POINTER(ctypes.c_uint8)()

    buf = fn(src_ptr, len(source_b), opt_ptr, len(options_b))
    try:
        if not buf.data or buf.len == 0:
            raise RuntimeError("rsvelte returned empty buffer")
        raw = ctypes.string_at(buf.data, buf.len)
        return json.loads(raw)
    finally:
        lib.rsvelte_free(buf)


def compile_component(lib: ctypes.CDLL, source: str, options: dict | None = None) -> dict:
    return _drive(lib, lib.rsvelte_compile, source, options)


def compile_module(lib: ctypes.CDLL, source: str, options: dict | None = None) -> dict:
    return _drive(lib, lib.rsvelte_compile_module, source, options)


def run_case(lib, label: str, source: str, options: dict | None, expect_ok: bool,
             driver=compile_component) -> bool:
    print(f"\n=== {label} ===")
    try:
        env = driver(lib, source, options)
    except Exception as e:
        print(f"FAIL: {label} — {e}", file=sys.stderr)
        return False

    text = json.dumps(env)
    print(text if len(text) <= 300 else text[:300] + "...")

    if env.get("ok") is not expect_ok:
        print(f"FAIL: {label} — expected ok={expect_ok}, got {env.get('ok')}", file=sys.stderr)
        return False
    return True


def main() -> int:
    lib = load_library()
    print(f"rsvelte version: {lib.rsvelte_version().decode('utf-8')}")

    failures = 0
    if not run_case(lib, "basic component (defaults)",
                    "<h1>Hello from Python, {name}!</h1>", None, True):
        failures += 1
    if not run_case(lib, "runes + dev",
                    "<script>let { count = 0 } = $props();</script>\n<button onclick={() => count++}>{count}</button>",
                    {"filename": "App.svelte", "dev": True, "runes": True},
                    True):
        failures += 1
    if not run_case(lib, "ssr generate",
                    "<p>server-rendered from python</p>",
                    {"generate": "server", "filename": "Ssr.svelte"},
                    True):
        failures += 1
    if not run_case(lib, "module: $state rune",
                    "export const counter = $state(0);",
                    {"filename": "counter.svelte.js"},
                    True,
                    driver=compile_module):
        failures += 1

    # Error path — pass a syntactically invalid options string by going
    # one level below compile_component (which json-encodes for us).
    print("\n=== malformed options ===")
    src_b = b"<h1>x</h1>"
    bad_b = b"{not json"
    src_arr = (ctypes.c_uint8 * len(src_b)).from_buffer_copy(src_b)
    bad_arr = (ctypes.c_uint8 * len(bad_b)).from_buffer_copy(bad_b)
    buf = lib.rsvelte_compile(
        ctypes.cast(src_arr, ctypes.POINTER(ctypes.c_uint8)), len(src_b),
        ctypes.cast(bad_arr, ctypes.POINTER(ctypes.c_uint8)), len(bad_b),
    )
    try:
        env = json.loads(ctypes.string_at(buf.data, buf.len))
        print(env)
        if env.get("ok") is not False:
            print("FAIL: expected ok=false", file=sys.stderr)
            failures += 1
    finally:
        lib.rsvelte_free(buf)

    if failures == 0:
        print("\nPASS — 0 failure(s)")
        return 0
    print(f"\nFAIL — {failures} failure(s)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
