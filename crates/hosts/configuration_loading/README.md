# Configuration hosts

The kernel owns the `Contract` trait and typed `Function<C>` values. It has no dependency on
JSON, Node, dynamic libraries or Svelte. Plugins own their function contracts. Before workers
run, a host decodes settings, resolves function references and installs typed configuration
facets.

`Loader` and `FunctionResolver` are public extension points, and Rust callers can supply either
directly. The CLI supports JSON, Node and external executable loaders. Node is optional; we
recommend it for executable settings.

## CLI

```sh
rsvelte run App.svelte --config rsvelte.config.json --task svelte.lint/default
rsvelte run App.svelte --config rsvelte.config.mts --task svelte.compile/client
rsvelte run App.svelte --config project.custom --config-loader /path/to/loader
```

Without `--config`, the CLI searches the current directory and its parents for
`rsvelte.config.{json,js,mjs,cjs,ts,mts,cts}`. Two such files in one directory are an error; an
explicit path resolves it. With no file, the CLI uses the built-in defaults.

`--config-loader json|node|<executable>` overrides the choice by file extension.
`--config-runtime <executable>` selects the Node executable, and you can repeat
`--config-runtime-arg <argument>`, for example `--import=tsx`. An external loader takes repeated
`--config-loader-arg <argument>` values. The CLI passes arguments directly, without a shell.

Node's built-in type stripping supports erasable TypeScript syntax. Full TypeScript features need
a runtime loader such as `tsx`; rsvelte does not install it. See
[Node's TypeScript documentation](https://nodejs.org/api/typescript.html).

## Plugin options

Each key of `plugins` is a plugin identifier, and the plugin decodes its value. Paths in it start
from the configuration file.

| Plugin             | Options                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `svelte.compile`   | `cssHash`: a function                                                   |
| `svelte.lint`      | `rules`: ESLint levels by rule name                                     |
| `typescript.check` | `command`: the type checker and its own arguments; `tsconfig`           |
| `svelte.check`     | `svelte`: the package directory; `contentMapper`: the mapper executable |
| `vue.check`        | `vue`: the package directory                                            |

```json
{ "plugins": { "typescript.check": { "command": ["tsrs"] } } }
```

A program with a `/` starts from the configuration file. The host looks for a bare name in
`node_modules/.bin` next to the file and in its parents, then in `PATH`. `tsconfig` defaults to
the `tsconfig.json` next to the file, if there is one.

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

Node accepts a default object, a promise or an async factory. Imports resolve from the
configuration module. Functions stay in the Node process; transport data refers to them as
`{"backend":"runtime","handle":"..."}`. The loader accepts plain data and functions; cycles and
other values fail. It sends the configuration's stdout to stderr, so the protocol stays intact.

An explicit lint `rules` object replaces the defaults, and empty rules turn every rule off.
Severity is `off`, `warn` or `error`, or `0`, `1` or `2`. Unknown fields and severities, and
unknown rules that are on, fail before any task runs, and so do plugins that are not available. As
in ESLint, a rule that is off is not checked. The CLI adapters so far cover Svelte compile and
lint.

Settings apply to every matching language document. File overrides and adapters for other
plugins do not exist yet. The transport supports named UTF-8 arguments and a UTF-8 result for
now; Rust contracts can use other types.

The CSS hash contract is `svelte.compile.css-hash`, version 1. Its arguments are `name`,
`filename` and `css`, in that order. CSS comes from the parsed style span, and the result is an
ASCII CSS identifier. A component without a style makes no call. Client and server share one
cached result. The Svelte callback gets only these three fields; it has no callable `hash`
helper, which the upstream callback has.

JS callbacks send serialized requests under one process mutex. Native callbacks take borrowed
UTF-8 input slices and a caller-owned output buffer, without JSON or IPC. Neither has a measured
latency or cycle advantage.

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

Library paths start from the config file. The configured symbol returns a descriptor that
[rsvelte_function.h](include/rsvelte_function.h) defines. [tests/native.c](tests/native.c) is a
complete example.

The ABI version and the contract version do not follow the plugin's SemVer. At load time the
host checks the descriptor size, the ABI version, the contract identifier and version, the
argument count and thread safety. A library must obey the header's memory contract, and the host
trusts it as executable code. The function must not keep input or output pointers, unwind across
the boundary or write past the capacity. It returns zero on success and nonzero on failure. Its
output must be UTF-8 and at most 4096 bytes. Descriptors live in the library. Function handles
keep the library loaded until the last owner drops them. The native host boundary holds the only
unsafe Rust.

## External loader protocol

The transport is UTF-8 JSON lines on stdin and stdout; stderr is free for logs. The protocol
version is 1, and each request has one response. A load:

```json
{"operation":"load","version":1,"path":"/absolute/project.config"}
{"version":1,"result":{"plugins":{}}}
```

A callback uses the function reference that the loader returned:

```json
{"operation":"call","handle":"0","contract":"svelte.compile.css-hash","version":1,"names":["name","filename","css"],"arguments":["App","App.svelte","p{}"]}
{"version":1,"result":"scope-App"}
```

An error is `{"version":1,"error":"reason"}`. A response must be at most 16 MiB and arrive within
30 seconds; Rust callers can change the wait with `response_timeout`. A transport failure ends
the session. A callback error leaves the session usable and becomes a diagnostic for the
affected document. The process ends when the host drops the loaded config and every runtime
function handle. A reload starts a new session, and old handles keep their old session. Watch
integration and request batching do not exist yet.

```sh
mise exec -- cargo test -p rsvelte_configuration_loading
mise exec -- cargo test -p rsvelte_command_line --test configuration
cargo test -p rsvelte_svelte_compile --test configuration
```

The Node tests need a Node with `.mts` support. On Unix, the native integration tests compile the
example with `cc`; users only need their prebuilt shared library.
