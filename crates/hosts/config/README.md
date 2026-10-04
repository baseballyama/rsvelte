# Configuration hosts

The kernel owns typed `Contract` and `Function<C>` values. It has no dependency on
JSON, Node, dynamic libraries or Svelte. Plugins own their function contracts.
Hosts decode settings, resolve function references and install typed configuration
facets before workers run.

`Loader` and `FunctionResolver` are public extension points. Rust callers can
supply either directly. The CLI supports JSON, Node and external executable loaders.
Node is the recommended option for executable settings; it is optional.

## CLI

```sh
rsvelte run App.svelte --config rsvelte.config.json --task svelte.lint/default
rsvelte run App.svelte --config rsvelte.config.mts --task svelte.compile/client
rsvelte run App.svelte --config project.custom --config-loader /path/to/loader
```

Without `--config`, the CLI searches the current directory and its parents for
`rsvelte.config.{json,js,mjs,cjs,ts,mts,cts}`. Multiple files in the same directory
are an error. Explicit paths resolve ambiguity. No file means built-in defaults.

`--config-loader json|node|<executable>` overrides extension-based selection.
`--config-runtime <executable>` selects the Node executable;
`--config-runtime-arg <argument>` is repeatable, for example `--import=tsx`.
External loaders accept repeatable `--config-loader-arg <argument>` values.
Arguments are passed directly, without a shell.

Built-in Node type stripping supports erasable TypeScript syntax. Full TypeScript
features need a runtime loader such as `tsx`; rsvelte does not install it.
See [Node's TypeScript documentation](https://nodejs.org/api/typescript.html).

## Settings and functions

```js
export default {
  plugins: {
    'svelte.lint': {
      rules: {
        'no-unused-vars': 'off',
        'svelte/button-has-type': ['warn', { reset: false }],
      },
    },
    'svelte.compile': {
      cssHash: ({ name, filename, css }) => `scope-${name}`,
    },
  },
};
```

Node accepts a default object, promise or async factory. Imports resolve from the
configuration module. Functions are retained in the process and replaced by
`{"backend":"runtime","handle":"..."}` references in transport data.
Only plain data and functions are accepted; cycles and unsupported values fail.
Config stdout is redirected to stderr to preserve the protocol.

An explicit lint `rules` object replaces the defaults. Empty rules disable all
rules. Severity is `off`, `warn`, `error`, or `0`, `1`, `2`. Unknown fields, rules,
severities and unavailable plugins fail before task execution. The initial CLI
adapters cover Svelte compile, normal lint, and typed lint. Typed lint requires
the CLI's `lint-typed` Cargo feature.
Settings are global for matching language documents. File overrides and adapters
for other plugins are not implemented yet. The transport currently supports
named UTF-8 arguments and a UTF-8 result; Rust contracts can use other types.

The CSS hash contract is `svelte.compile.css-hash`, version 1. Arguments are
`name`, `filename`, `css`, in that order. CSS comes from the parsed style span.
The result is an ASCII CSS identifier. No style means no call. Client and server
share one cached result. The Svelte callback currently has these three fields;
it does not provide the upstream callback's callable `hash` helper.

JS callbacks use serialized requests under one process mutex. Native callbacks
use borrowed UTF-8 input slices and a caller-owned output buffer, without JSON or
IPC. No latency or cycle advantage is claimed without measurements.

## Native ABI

JSON can select a native function without starting Node:

```json
{
  "plugins": {
    "svelte.compile": {
      "cssHash": {
        "backend": "native",
        "library": "./hash.so",
        "symbol": "css_hash"
      }
    }
  }
}
```

Library paths are relative to the config file. The configured symbol returns a
descriptor defined in [rsvelte_function.h](include/rsvelte_function.h).
[tests/native.c](tests/native.c) is a complete example.

ABI version and contract version are independent of plugin SemVer. Descriptor
size, ABI version, contract identifier/version, argument count and thread safety
are checked at load time. Libraries must obey the header's memory contract and
are trusted executable code. The function cannot retain input/output pointers,
unwind across the boundary or write beyond capacity. Return zero on success;
nonzero means failure. Output must be UTF-8 and at most 4096 bytes. Descriptors
live in the library. Function handles keep the library loaded until their last
owner is dropped. The only unsafe Rust is in the native host boundary.

## External loader protocol

Transport is UTF-8 JSON lines on stdin/stdout. Stderr is available for logs.
Protocol version is 1; each request has one response. Example load:

```json
{"operation":"load","version":1,"path":"/absolute/project.config"}
{"version":1,"result":{"plugins":{}}}
```

Callbacks use the function reference returned by the loader:

```json
{"operation":"call","handle":"0","contract":"svelte.compile.css-hash","version":1,"names":["name","filename","css"],"arguments":["App","App.svelte","p{}"]}
{"version":1,"result":"scope-App"}
```

Errors use `{"version":1,"error":"reason"}`. Responses are limited to 16 MiB
and must arrive within 30 seconds. Rust callers can set `response_timeout`.
Transport failures terminate the session. Callback errors leave the session usable
and become diagnostics for the affected document.
The process ends when the loaded config and all runtime function handles are
dropped. Reloading creates a new session; old handles retain their old session.
Watch integration and request batching are not implemented yet.

```sh
mise exec -- cargo test -p rsvelte_config
mise exec -- cargo test -p rsvelte_command_line --test configuration
cargo test -p rsvelte_svelte_compile --test configuration
```

Node tests need Node with `.mts` support. Native integration tests on Unix compile
the example with `cc`; normal users only need their prebuilt shared library.
