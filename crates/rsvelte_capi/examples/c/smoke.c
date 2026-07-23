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

/* --- callback demo (issue #1680) --- */

/* Portable substring search over a non-NUL-terminated buffer. */
static int buf_contains(const uint8_t *hay, size_t hay_len, const char *needle) {
  size_t n = strlen(needle);
  if (n == 0 || n > hay_len) return 0;
  for (size_t i = 0; i + n <= hay_len; i++) {
    if (memcmp(hay + i, needle, n) == 0) return 1;
  }
  return 0;
}

/* State the cssHash callback records + a scratch buffer for its return. */
struct css_hash_state {
  int invoked;
  int saw_svelte_prefix; /* whether the raw digest was already prefixed */
  char scratch[64];
};

/* cssHash: build `svelte-${hash}` from the raw digest. Since the shared
 * digest is unprefixed, this yields a single `svelte-` prefix. */
static RsvelteStr css_hash_cb(void *userdata, const RsvelteCssHashInput *input) {
  struct css_hash_state *st = (struct css_hash_state *)userdata;
  st->invoked = 1;
  /* Guard: the digest must NOT already start with "svelte-". */
  if (input->hash_len >= 7 && memcmp(input->hash, "svelte-", 7) == 0) {
    st->saw_svelte_prefix = 1;
  }
  int n = snprintf(st->scratch, sizeof(st->scratch), "svelte-%.*s",
                   (int)input->hash_len, (const char *)input->hash);
  RsvelteStr out;
  out.data = (const uint8_t *)st->scratch;
  out.len = (n > 0 && (size_t)n < sizeof(st->scratch)) ? (size_t)n : 0;
  return out;
}

/* warningFilter: drop every warning (return false). */
static bool warning_filter_cb(void *userdata, const uint8_t *warning_json,
                              uintptr_t warning_json_len) {
  int *count = (int *)userdata;
  (void)warning_json;
  (void)warning_json_len;
  (*count)++;
  return false;
}

static int run_callbacks_case(void) {
  printf("\n=== callbacks: cssHash + warningFilter ===\n");
  struct css_hash_state st = {0, 0, {0}};
  int filtered = 0;
  RsvelteCallbacks cb = {0};
  cb.css_hash = css_hash_cb;
  cb.css_hash_userdata = &st;
  cb.warning_filter = warning_filter_cb;
  cb.warning_filter_userdata = &filtered;

  const char *src =
      "<h1>x</h1>\n<style>h1{color:red}.unused{color:blue}</style>";
  const char *opts = "{\"filename\":\"App.svelte\",\"css\":\"external\"}";
  RsvelteBuf out = rsvelte_compile_with_callbacks(
      (const uint8_t *)src, strlen(src),
      (const uint8_t *)opts, strlen(opts), &cb);

  int failures = 0;
  if (out.data == NULL || out.len == 0) {
    fprintf(stderr, "FAIL: callbacks produced empty buffer\n");
    rsvelte_free(out);
    return 1;
  }
  fwrite(out.data, 1, out.len < 400 ? out.len : 400, stdout);
  printf("\n");

  if (!st.invoked) {
    fprintf(stderr, "FAIL: cssHash callback was not invoked\n");
    failures++;
  }
  if (st.saw_svelte_prefix) {
    fprintf(stderr, "FAIL: raw digest was already `svelte-` prefixed (double-prefix bug)\n");
    failures++;
  }
  /* The single-prefixed class must appear; the doubled form must not. */
  if (buf_contains(out.data, out.len, "svelte-svelte-")) {
    fprintf(stderr, "FAIL: doubled `svelte-svelte-` prefix in output\n");
    failures++;
  }
  if (filtered == 0) {
    fprintf(stderr, "FAIL: warningFilter never saw the unused-selector warning\n");
    failures++;
  }
  /* warnings were dropped -> the envelope's warnings array is empty. */
  if (buf_contains(out.data, out.len, "css_unused_selector")) {
    fprintf(stderr, "FAIL: warningFilter=false should have dropped the warning\n");
    failures++;
  }
  rsvelte_free(out);
  printf("cssHash invoked=%d, warnings filtered=%d\n", st.invoked, filtered);
  return failures;
}

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

  failures += run_callbacks_case();

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
