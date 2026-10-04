# Native type information

A task-independent adapter for a native TS 7.1 Project. Type checking and typed lint share
one instance. It accepts a Project from `typescript-7/unstable/sync`; it does not start another
checker, build a second projection, or parse generated text.

```ts
import { ProjectTypeInfo } from '@rsvelte-experimental/type-information';
import { SyntaxKind } from 'typescript-7/unstable/ast';

const info = new ProjectTypeInfo(snapshot.getConfiguredProject(config)!);
const file = info.project.program.getSourceFile(componentPath)!;
const findings = info.semanticDiagnostics(file);
const types = info.typesAt(file, { start, end, kind: SyntaxKind.Identifier });
```

`start` and `end` are UTF-8 byte offsets in the original source. `typesAt` returns
`measured`, `unresolved`, or `unmapped`. It retains every matching source copy and the real
native types. `diagnosticSpan` converts original native diagnostics to byte spans and returns
`undefined` for virtual locations. `measurements` reports indexed nodes and checker requests.

Use a new adapter for each updated snapshot. Discard it before disposing that snapshot.
All files must belong to that Project and have a content mapper. Rust callers keep node IDs
and byte spans in their own source side tables. See [the ownership contract](../../docs/type-information.md).

```sh
pnpm --dir tools/type-information install --frozen-lockfile
node tools/type-information/node_modules/typescript-7/bin/tsc -p tools/type-information
```

The integration tests live in `tools/fixtures/test/content-mapper.test.ts`. They use the
standalone Rust Svelte mapper, real Svelte imports, and native TS 7.1. They also verify
that diagnostics and repeated typed lint queries share one Program and cached type handles.
Hardware cycles and cache residency are UNMEASURED.
