#include "../include/rsvelte_function.h"
#include <string.h>

static int32_t hash(const rsvelte_utf8 *arguments, size_t count,
                    uint8_t *output, size_t capacity, size_t *written) {
    if (count != 3 || capacity < 7 + arguments[0].length) return 1;
    memcpy(output, "native-", 7);
    memcpy(output + 7, arguments[0].data, arguments[0].length);
    *written = 7 + arguments[0].length;
    return 0;
}

static const rsvelte_function good = {
    sizeof(rsvelte_function), 1, 1,
    {(const uint8_t *)"svelte.compile.css-hash", sizeof("svelte.compile.css-hash") - 1}, 3, 1, hash
};

const rsvelte_function *css_hash(void) { return &good; }
const rsvelte_function *null_entry(void) { return NULL; }

#define BAD_ENTRY(name, field, value) \
const rsvelte_function *name(void) { \
    static rsvelte_function descriptor; \
    descriptor = good; descriptor.field = value; return &descriptor; \
}
BAD_ENTRY(bad_version, abi_version, 99)
BAD_ENTRY(bad_contract, contract_version, 99)
BAD_ENTRY(bad_size, size, 1)
BAD_ENTRY(not_thread_safe, flags, 0)

static int32_t invalid_utf8_call(const rsvelte_utf8 *a, size_t n, uint8_t *out, size_t cap, size_t *len) {
    (void)a; (void)n; (void)cap; out[0] = 255; *len = 1; return 0;
}
static int32_t too_long_call(const rsvelte_utf8 *a, size_t n, uint8_t *out, size_t cap, size_t *len) {
    (void)a; (void)n; (void)out; *len = cap + 1; return 0;
}
static int32_t failed_call(const rsvelte_utf8 *a, size_t n, uint8_t *out, size_t cap, size_t *len) {
    (void)a; (void)n; (void)out; (void)cap; *len = 0; return 7;
}
BAD_ENTRY(invalid_utf8, invoke, invalid_utf8_call)
BAD_ENTRY(too_long, invoke, too_long_call)
BAD_ENTRY(failed, invoke, failed_call)
