# Svelte scoped styles

CSS parsing, matching, and emission share one immutable stylesheet tree.
Client and server use the same scope facts and CSS output artifact.

| Layer | Data and work |
|---|---|
| CSS syntax | Rules, selector compounds, parsed pseudo arguments, declaration tokens, comments, and byte spans |
| Svelte semantic | Possible DOM relations and attribute values; dense selector-use and scope flags |
| CSS emission | Remove unused selectors, apply one specificity increase, unwrap globals, rename keyframes |
| JS lowering | Add the hash class to elements marked by semantic analysis |

Only the parser reads source bytes to decide CSS structure. Emission copies
source ranges and applies span edits. It never parses generated text.
Escaped identifiers and attribute strings are decoded once during parsing.
Animation tokens are stored only for animation declarations.
CSS lists use fixed buffers. Each compound stores its first simple selector inline.

DOM relations include conditional branches, each iterations, component and
slot boundaries, and snippet call sites. Snippet recursion forms a graph;
visited-node sets stop cycles. Ordinary parent chains need no scratch allocation.
Unknown attributes and external DOM stay conservative, as in the official compiler.
Topology, nesting indices, and expression attribute values are built only when queried.
Each value is cached for the file; attribute matching has one implementation.

Scope flags live outside the trees. Rule IDs and DOM IDs address flat relation
tables. Insertions borrow the hash strings and source text; the emitter shares
one implementation with owned edits used by other tasks.

Run the regression tests and CSS comparison:

```sh
cargo test -p rsvelte_svelte_compile --test styling
cargo run --release -p rsvelte_svelte_compile --example style_corpus -- \
  fixtures/svelte /tmp/styling.tsv --family --check
```

The report counts parse failures separately. `--check` fails on a CSS difference
among parsed inputs. It also fails on an empty corpus. It does not certify JS
output or files the frontend cannot parse.

Two regression cases intentionally differ from Svelte 5.57.1:

- Escaped CSS attribute strings match their decoded value. Upstream wrongly
  removes `[data-x="\41"]` for an element with `data-x="A"`.
- Pruning a rule escapes a literal comment closer inside a CSS string, including
  `"\*/"`. Upstream can close its pruning comment before the rule ends.

See the [CSS string algorithm](https://www.w3.org/TR/css-syntax-3/#consume-string-token)
and the [measurements and remaining limits](measurements/styling/optimization/README.md).
The [complete CSS coverage report](measurements/styling/remaining/README.md) records
the remaining frontend support, full CSS comparison, and CPU and memory measurements.
