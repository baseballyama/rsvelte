/*
 * rsvelte C ABI smoke test.
 *
 * Build:
 *   cargo build -p rsvelte_capi --release
 *   cc -I crates/rsvelte_capi/include \
 *      -L target/release \
 *      -Wl,-rpath,@loader_path/../../../target/release \
 *      crates/rsvelte_capi/examples/c/smoke.c \
 *      -lrsvelte_capi -o target/release/c_smoke
 *
 * Run:
 *   ./target/release/c_smoke
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "rsvelte.h"

typedef RsvelteBuf (*compile_fn_t)(const uint8_t *, uintptr_t, const uint8_t *, uintptr_t);

static int run_case_with(const char *label, const char *source,
                         const char *options_json, compile_fn_t fn) {
  printf("\n=== %s ===\n", label);
  size_t src_len = strlen(source);
  size_t opt_len = options_json ? strlen(options_json) : 0;

  RsvelteBuf out = fn(
      (const uint8_t *)source, src_len,
      (const uint8_t *)options_json, opt_len);

  if (out.data == NULL || out.len == 0) {
    fprintf(stderr, "FAIL: %s produced empty buffer\n", label);
    rsvelte_free(out);
    return 1;
  }

  /* Print first 400 bytes of result. */
  size_t preview = out.len < 400 ? out.len : 400;
  printf("len=%zu cap=%zu\n", out.len, out.cap);
  fwrite(out.data, 1, preview, stdout);
  if (preview < out.len) {
    printf("...\n");
  } else {
    printf("\n");
  }

  /* Cheap pass/fail signal: assert envelope starts with {"ok":true. */
  int ok = out.len >= 11 && memcmp(out.data, "{\"ok\":true,", 11) == 0;
  rsvelte_free(out);
  return ok ? 0 : 1;
}

#define run_case(label, src, opts)        run_case_with(label, src, opts, rsvelte_compile)
#define run_module_case(label, src, opts) run_case_with(label, src, opts, rsvelte_compile_module)

int main(void) {
  printf("rsvelte version: %s\n", rsvelte_version());

  int failures = 0;

  failures += run_case(
      "basic component (defaults)",
      "<h1>Hello, {name}!</h1>",
      NULL);

  failures += run_case(
      "component with options (filename, dev=true)",
      "<script>let { count = 0 } = $props();</script>\n<button onclick={() => count++}>{count}</button>",
      "{\"filename\":\"App.svelte\",\"dev\":true,\"runes\":true}");

  failures += run_case(
      "ssr generate",
      "<p>server-rendered</p>",
      "{\"generate\":\"server\",\"filename\":\"Ssr.svelte\"}");

  failures += run_module_case(
      "module: $state rune",
      "export const counter = $state(0);",
      "{\"filename\":\"counter.svelte.js\"}");

  /* Error path: malformed JSON options. */
  {
    printf("\n=== error path: malformed options ===\n");
    const char *bad = "{not json";
    RsvelteBuf out = rsvelte_compile(
        (const uint8_t *)"<h1>x</h1>", 11,
        (const uint8_t *)bad, strlen(bad));
    int looks_err = out.len > 0
        && memcmp(out.data, "{\"ok\":false,", 12) == 0;
    fwrite(out.data, 1, out.len, stdout);
    printf("\n");
    rsvelte_free(out);
    if (!looks_err) {
      fprintf(stderr, "FAIL: expected ok=false envelope\n");
      failures++;
    }
  }

  printf("\n%s — %d failure(s)\n", failures == 0 ? "PASS" : "FAIL", failures);
  return failures == 0 ? 0 : 1;
}
