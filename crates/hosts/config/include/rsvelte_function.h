#ifndef RSVELTE_FUNCTION_H
#define RSVELTE_FUNCTION_H

#include <stddef.h>
#include <stdint.h>

#define RSVELTE_FUNCTION_ABI_VERSION 1
#define RSVELTE_FUNCTION_THREAD_SAFE 1
#define RSVELTE_FUNCTION_MAX_OUTPUT 4096

typedef struct {
    const uint8_t *data;
    size_t length;
} rsvelte_utf8;

/* Return zero on success. Never retain pointers or unwind across this boundary. */
typedef int32_t (*rsvelte_text_invoke)(
    const rsvelte_utf8 *arguments, size_t argument_count,
    uint8_t *output, size_t capacity, size_t *written
);

typedef struct {
    size_t size;
    uint32_t abi_version;
    uint32_t contract_version;
    rsvelte_utf8 contract;
    size_t argument_count;
    uint32_t flags;
    rsvelte_text_invoke invoke;
} rsvelte_function;

/* Export a configured symbol with this signature; descriptor storage lives in the library. */
typedef const rsvelte_function *(*rsvelte_function_entry)(void);

#endif
