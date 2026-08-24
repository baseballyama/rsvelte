# A comment written in a template expression is emitted inside unrelated generated code

A comment inside a mustache or an attribute value does not stay with the expression it
was written in. For the client target it is printed inside a generated DOM-wiring call
whose position has nothing to do with the comment, and whether it appears at all depends
on the source *line* of an element's tag name and on how many template updates the
component happens to have.

```svelte
<!-- input.svelte -->
<script>
	let n = $state(0);
</script>

<button onclick={() => n++}>{/* c */ n}</button>
```

`compile(source, { generate: 'client' })`:

```js
var button = root();
var text = $.child(button, /* c */ true);
```

The comment is now the trailing comment of the generated `button` binding, one argument
ahead of a `true` that means "this child is a text node".

## Why

Three upstream decisions compose into it.

1. `phases/3-transform/client/transform-client.js:394` —
   `component_block.loc = instance.loc;`, commented *"trick esrap into including
   comments"*. The component body is given the instance script's `loc`, so
   `body(context, node)` calls `reset_comment_index` on a located node and the cursor is
   live for the whole body. The comment list it walks is the **file's**, so template
   comments are in it.

2. `phases/3-transform/client/visitors/shared/fragment.js:47-52,113-117` — `flush_node`
   builds each generated element binding as `b.id(scope.generate(name), loc)` with
   `loc = node.name_loc`, i.e. **the source location of the element's tag name**. So the
   synthesized identifier `button` reports itself as living at `<button` on line 5.

3. esrap's `CallExpression` visitor (`esrap@2.2.12`, `src/languages/ts/index.js:561-617`)
   writes the argument
   separator *before* flushing that argument's trailing comments:

   ```js
   context.visit(arg);
   if (!is_last) context.write(',');
   ...
   flush_trailing_comments(context, arg.loc?.end ?? null, next);
   ```

   `flush_trailing_comments` takes any pending comment whose start line equals
   `arg.loc.end.line`. The comment is on line 5; `button`'s `loc` ends on line 5; so it is
   written after the comma, giving `$.child(button, /* c */ true)`.

The fourth ingredient decides whether it survives at all: `$.template_effect` is emitted
as a **concise arrow** when there is one update and as a **block** when there are several,
and a builder-made block hits `reset_comment_index`'s `if (!node.loc) { comment_index =
comments.length; return; }` — the same cursor kill as
[2990](2990-svelte-class-accessor-drops-later-comments.md). So the same comment can be
printed or dropped depending on how many things the template updates.

## The axis, measured (Svelte 5.56.10)

Each row is one comment, spelled `/* c */`, moved to a different slot. "official" is where
the pinned compiler puts it.

| input | target | official |
|---|---|---|
| `<button …>{/* c */ n}</button>` | client | `$.child(button, /* c */ true)` |
| `<button …>{n /* c */}</button>` | client | `$.child(button, /* c */ true)` — leading and trailing land in the same slot |
| `<button … title={/* c */ n}>x</button>` | client | `$.set_attribute(button, /* c */ 'title', $.get(n))` |
| `{#each items as it (/* c */ it)}` | client | `$.each(node, 16, () => items, (it /* c */) => it, …)` — the generated key arrow's parameter list |
| `{@html String(n) /* c */}` | client | `$.html(node, () => String($.get(n /* c */)))` |
| `<button …><span></span>{/* c */ n}</button>` | client | `$.sibling($.child(button /* c1 */), 1, true)` — one argument, so no comma to sit behind |
| `<button …>{n}</button><p>{/* c */ n}</p>` | client | the **first** `$.child`, not the `<p>`'s one |
| `<button …>{n}</button>`⏎`<p title={/* c */ n}></p>` | client | **dropped** — the comment is on line 6, `button`'s tag name ends on line 5 |
| `{/* c */ n}` | server | `$.escape(/* c */ n)` |
| `<p title={/* c */ n}>` | server | `$.attr('title', /* c */ n)` |

The discriminating rows are the last four. Moving the comment from line 5 to line 6
without changing anything else turns "printed inside `$.child`" into "not printed at all",
which is what shows the placement is decided by an unrelated tag name's line rather than
by the expression the comment belongs to. And the two server rows are the control: on that
target the same comments land next to their own expression, so this is a client-codegen
artifact, not a general property of how Svelte handles comments in expressions.

rsvelte currently drops every client row and every server row above.

## Suggested fix

Give the synthesized element binding no `loc` (it exists for source mapping, and a
mapping is not the same claim as "a comment written here belongs to this node"), or move
`flush_trailing_comments` in esrap's `CallExpression` visitor to before the separator so
a comment at least cannot cross an argument boundary. Neither is sufficient on its own —
the cursor kill on builder-made blocks is the other half, and that is
[2990](2990-svelte-class-accessor-drops-later-comments.md)'s repair.

## What rsvelte does about it, and why

The standing rule here is: **reproduce an upstream defect when its output runs; do not
reproduce it when the output is not JavaScript.** Every row above is valid JavaScript that
runs identically, so the default is to reproduce all of them, and that is the intent
recorded here. rsvelte drops every row today.

The two halves are at different distances from that, and the distinction is a
prerequisite, not a preference.

**The server rows are reachable now and are a plain rsvelte defect.** On that target the
comment lands next to the expression the user wrote it in, the server's comment placement
already runs through `3_transform/server/ast/comments.rs`, and the missing piece is that a
pending run is not claimed at an attribute value, an `{#if}` test, an `{#each}` collection
or a `{@html}` argument. That is the template half of rsvelte #3098 and is where the work
belongs; nothing in this file argues against doing it.

**The client rows have no slot to place a comment into yet.** rsvelte's client comment
coordinate space is the *generated* script text, not the `.svelte` source:
`js_ast/to_oxc.rs::into_coordinate_free_program` clears `program.comments` outright, on the
stated grounds that "a comment's position is a coordinate too" and the spans would index
the wrong text. Template expressions are rebuilt structurally by
`client/visitors/expression_converter.rs`, whose only comment handling is own-line
statement raws and the `svelte-ignore` scan — a comment written inside a mustache or an
attribute value never enters the printed comment stream at all. So reproducing these rows
is not a placement decision that could be made in the element visitors; it needs the
comments to exist in that stream first. That is the coordinate-space unification, and it
is the same prerequisite that blocks #3098's client half.

So this is not "we decline". It is: the client rows stay divergent until the comment
stream exists, and the rule to implement at that point is already derived, so nobody has
to re-measure it:

1. The comment must be flushed against a cursor that is live across the whole component
   body — upstream gets that from `component_block.loc = instance.loc`.
2. The generated element binding must report the element's **tag-name** location, so a
   pending comment on that line becomes its trailing comment.
3. The flush must happen after the argument separator, which is what puts the comment one
   argument to the right.
4. A generated block (the multi-update `$.template_effect(() => { … })` form) kills the
   cursor, so the comment is dropped there while the single-update concise-arrow form
   keeps it.

Two things to hold on to while that is outstanding. First, these rows are invisible to the
corpus output gate — byte-different pairs fall through to `ast_equiv_batch`, which is
invoked with an empty argv and ignores comments — so they surface only under the matrix
gate's `comment-mismatch` verdict and the mutation gate; a green corpus run says nothing
about them. Second, if upstream repairs any of this, step 2 and step 4 are the parts that
move, and the server rows would then be the only ones left — so re-measure before
concluding from a divergence which side is wrong.

Tracked in rsvelte issue #3070 (class 5); the server half is rsvelte #3098.
