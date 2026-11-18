# Native TypeScript API client

This crate starts native TypeScript 7.1 in API mode (`tsc --api`) and asks it over stdin and
stdout. Type checking and typed lint ask one snapshot, so the checker builds each program once.

| API                                  | Use                                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------------------- |
| `Session::start(program, args, dir)` | Start the checker with content mappers allowed to run                                   |
| `Session::open(configs, layer)`      | Open one project per `tsconfig.json` in a new snapshot, over a layer of files and links |
| `Session::diagnostics(project, …)`   | Program, syntactic or semantic diagnostics, by file                                     |
| `Session::release(snapshot)`         | Free a snapshot's programs                                                              |

Each message is the `MessagePack` array `[type, method, payload]`; payloads are JSON. The
protocol has no version, so the client and the checker must come from the same release; the
tests pin `7.1.0-dev.20261102.1`. Diagnostics of content-mapped files are in original
coordinates: `pos` and `end` count UTF-16 units, and `startPosition` gives the line and UTF-16
character.

The API mode takes no compiler options such as `--singleThreaded`. `args` are for a launcher,
such as a script that `node` runs.

```sh
cargo test -p rsvelte_typescript_api
```
