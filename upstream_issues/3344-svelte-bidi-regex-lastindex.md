# Svelte's shared bidi regex carries `lastIndex`, so it misses occurrences after the first

`regex_bidirectional_control_characters` (`phases/patterns.js:23`) is a module-level object
carrying the `g` flag:

```js
export const regex_bidirectional_control_characters =
	/[‪‫‬‭‮⁦⁧⁨⁩]+/g;
```

`Text.js` sets `lastIndex = 0` before its `matchAll`, but `Literal.js:10` and
`TemplateElement.js:9` call `.test()` on that same object and never reset it. `.test()` on a
`g` regex starts at `lastIndex` and advances it on a match, so the *next* call begins
mid-string.

**Control that this is not intended behaviour**, with no compiler involved — the same string
answers `false` and then `true`:

```js
import { regex_bidirectional_control_characters as RX } from './phases/patterns.js';
const a = 'x‮y', b = 'p‮q';
RX.test(a);  // true,  lastIndex -> 2
RX.test(b);  // false, lastIndex -> 0   ← b DOES contain U+202E
RX.test(b);  // true,  lastIndex -> 2
```

A predicate whose answer for one string depends on how many times it was called on *other*
strings is not a design choice, and `Text.js` resetting `lastIndex` on the very same object
shows the hazard was known at one of the three call sites and missed at the other two.

## Effect on the compiler

Measured against the official compiler at v5.56.10, **one input per process** (batching
several `compile()` calls into one process changes the answer, for exactly this reason):

| source | occurrences | official warns |
|---|---|---|
| `<script>let a = "x␮y";</script>` | 1 | 1 |
| `<script>let a = "x␮y"; let b = "p␮q";</script>` | 2 | **1** |
| `<script>let a = "x␮y"; let b = "p␮q"; let c = "m␮n";</script>` | 3 | **2** (first and third) |
| `<script>let a = "x␮y"; let b = "pppppppppp␮q";</script>` | 2 | 2 |
| `` <b>{`a␮b${1}c␮d`}</b> `` | 2 | **1** |
| `<b>{"a␮b"}{"c␮d"}</b>` | 2 | **1** |
| `<b>a␮b c␮d</b>` (two Text nodes) | 2 | 2 |
| `<b>{"a␮b"}t␮x{"c␮d"}</b>` | 3 | 3 |

(`␮` stands for U+202E RIGHT-TO-LEFT OVERRIDE.)

The suppression is **position-dependent**, not "every second one": row 3 reports the first
and the third because the second `.test()` resets `lastIndex` to 0 on failing, and row 4
reports both because the second occurrence happens to sit past the carried-over index. A
`Text` node anywhere in between restores the cursor, which is why rows 7 and 8 are complete.

## Why rsvelte does not reproduce it

This is a warning whose whole purpose is to surface **invisible** characters that can make
source read in a different order than it executes. Suppressing it is not a byte-level
difference — it withholds a security-relevant diagnostic from the user, and which
occurrences get withheld depends on unrelated earlier strings. Under the project rule
("reproduce an upstream defect only when the two behave identically and only the bytes
differ") this is not reproducible, so rsvelte reports every occurrence.

rsvelte's checks use Rust's `regex`, which has no `lastIndex` and is stateless by
construction (`2_analyze/visitors/literal.rs`, `template_element.rs`, `text.rs`), so the
behaviour is pinned by `crates/rsvelte_core/tests/bidi_every_occurrence_3344.rs` rather than
by the absence of a mechanism.

Local anchor: [#3344](https://github.com/baseballyama/rsvelte/issues/3344).

Desired upstream behaviour: drop the `g` flag (neither `.test()` call needs it, and `Text.js`
can keep a local `g` copy for its `matchAll`), or reset `lastIndex` at every call site.
