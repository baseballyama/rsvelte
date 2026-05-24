// rsvelte Go smoke test.
//
// Build & run from the repository root:
//   cargo build -p rsvelte_capi --release
//   go run ./crates/rsvelte_capi/examples/go
//
// The cgo directives below pick up the header from
// crates/rsvelte_capi/include and the dylib from target/release.

package main

/*
#cgo CFLAGS: -I${SRCDIR}/../../include
#cgo LDFLAGS: -L${SRCDIR}/../../../../target/release -lrsvelte_capi -Wl,-rpath,${SRCDIR}/../../../../target/release
#include <stdlib.h>
#include <string.h>
#include "rsvelte.h"
*/
import "C"

import (
	"encoding/json"
	"fmt"
	"os"
	"unsafe"
)

type compileEnvelope struct {
	Ok     bool             `json:"ok"`
	Result *json.RawMessage `json:"result,omitempty"`
	Error  *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

type variant int

const (
	component variant = iota
	module
)

// compile drives rsvelte_compile / rsvelte_compile_module, copies the
// result JSON into a Go string, and releases the FFI-owned buffer.
func compile(v variant, source, optionsJSON string) (string, error) {
	srcBytes := []byte(source)
	optsBytes := []byte(optionsJSON)

	var srcPtr *C.uint8_t
	if len(srcBytes) > 0 {
		srcPtr = (*C.uint8_t)(unsafe.Pointer(&srcBytes[0]))
	}
	var optsPtr *C.uint8_t
	if len(optsBytes) > 0 {
		optsPtr = (*C.uint8_t)(unsafe.Pointer(&optsBytes[0]))
	}

	var buf C.RsvelteBuf
	switch v {
	case component:
		buf = C.rsvelte_compile(
			srcPtr, C.uintptr_t(len(srcBytes)),
			optsPtr, C.uintptr_t(len(optsBytes)),
		)
	case module:
		buf = C.rsvelte_compile_module(
			srcPtr, C.uintptr_t(len(srcBytes)),
			optsPtr, C.uintptr_t(len(optsBytes)),
		)
	}
	defer C.rsvelte_free(buf)

	if buf.data == nil || buf.len == 0 {
		return "", fmt.Errorf("rsvelte returned empty buffer")
	}
	out := C.GoStringN((*C.char)(unsafe.Pointer(buf.data)), C.int(buf.len))
	return out, nil
}

func runCase(v variant, label, source, options string) (ok bool) {
	fmt.Printf("\n=== %s ===\n", label)
	out, err := compile(v, source, options)
	if err != nil {
		fmt.Fprintf(os.Stderr, "FAIL: %s — %v\n", label, err)
		return false
	}
	var env compileEnvelope
	if err := json.Unmarshal([]byte(out), &env); err != nil {
		fmt.Fprintf(os.Stderr, "FAIL: %s — envelope JSON parse: %v\n", label, err)
		return false
	}
	preview := out
	if len(preview) > 300 {
		preview = preview[:300] + "..."
	}
	fmt.Println(preview)
	if !env.Ok {
		fmt.Fprintf(os.Stderr, "FAIL: %s — ok=false (%v)\n", label, env.Error)
		return false
	}
	return true
}

func runErrorCase(label, source, badOptions string) (ok bool) {
	fmt.Printf("\n=== %s ===\n", label)
	out, err := compile(component, source, badOptions)
	if err != nil {
		fmt.Fprintf(os.Stderr, "FAIL: %s — %v\n", label, err)
		return false
	}
	var env compileEnvelope
	if err := json.Unmarshal([]byte(out), &env); err != nil {
		fmt.Fprintf(os.Stderr, "FAIL: %s — %v\n", label, err)
		return false
	}
	fmt.Println(out)
	if env.Ok {
		fmt.Fprintf(os.Stderr, "FAIL: %s — expected ok=false\n", label)
		return false
	}
	return true
}

func main() {
	version := C.GoString(C.rsvelte_version())
	fmt.Printf("rsvelte version: %s\n", version)

	failures := 0
	if !runCase(component, "basic component (defaults)",
		"<h1>Hello from Go, {name}!</h1>", "") {
		failures++
	}
	if !runCase(component, "runes + dev",
		"<script>let { count = 0 } = $props();</script>\n<button onclick={() => count++}>{count}</button>",
		`{"filename":"App.svelte","dev":true,"runes":true}`) {
		failures++
	}
	if !runCase(component, "ssr generate",
		"<p>server-rendered from go</p>",
		`{"generate":"server","filename":"Ssr.svelte"}`) {
		failures++
	}
	if !runCase(module, "module: $state rune",
		"export const counter = $state(0);",
		`{"filename":"counter.svelte.js"}`) {
		failures++
	}
	if !runErrorCase("malformed options",
		"<h1>x</h1>", "{not json") {
		failures++
	}

	if failures == 0 {
		fmt.Println("\nPASS — 0 failure(s)")
		os.Exit(0)
	}
	fmt.Printf("\nFAIL — %d failure(s)\n", failures)
	os.Exit(1)
}
